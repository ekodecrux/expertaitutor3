// Stripe Webhook Handler
// Handles payment events from Stripe and syncs to database
import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { users, subscriptions, payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] No signature found");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${event.type}:`, error);
    res.status(500).send("Webhook processing failed");
  }
}

// ============= EVENT HANDLERS =============

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("[Webhook] No userId in session metadata");
    return;
  }

  // Handle subscription checkout
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string" 
      ? session.subscription 
      : session.subscription.id;

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Create or update subscription record
    const [existingSubscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      .limit(1);

    if (existingSubscription) {
      await db.update(subscriptions)
        .set({
          status: stripeSubscription.status as any,
          stripePriceId: stripeSubscription.items.data[0]?.price.id,
          currentPeriodEnd: (stripeSubscription as any).current_period_end 
            ? new Date((stripeSubscription as any).current_period_end * 1000)
            : undefined,
          trialEnd: (stripeSubscription as any).trial_end 
            ? new Date((stripeSubscription as any).trial_end * 1000)
            : undefined,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSubscription.id));
    } else {
      await db.insert(subscriptions).values({
        userId: parseInt(userId),
        stripeSubscriptionId: subscriptionId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id || "",
        planType: session.metadata?.planType || "",
        status: stripeSubscription.status as any,
        startDate: new Date(),
        currentPeriodEnd: (stripeSubscription as any).current_period_end 
          ? new Date((stripeSubscription as any).current_period_end * 1000)
          : undefined,
        trialEnd: stripeSubscription.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000)
          : undefined,
        cancelAtPeriodEnd: false,
        autoRenew: true,
      });
    }

    console.log(`[Webhook] Subscription created/updated for user ${userId}`);
  }

  // Handle one-time payment checkout
  if (session.mode === "payment" && session.payment_intent) {
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Create payment record
    await db.insert(payments).values({
      userId: parseInt(userId),
      stripePaymentIntentId: paymentIntentId,
      productType: session.metadata?.productType || "",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: paymentIntent.status as any,
      metadata: session.metadata || {},
    });

    console.log(`[Webhook] Payment recorded for user ${userId}`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing invoice.paid: ${invoice.id}`);

  const db = await getDb();
  if (!db) return;

  const invoiceSubscription = (invoice as any).subscription;
  if (!invoiceSubscription) return;

  const subscriptionId = typeof invoiceSubscription === "string"
    ? invoiceSubscription
    : invoiceSubscription.id;

  // Update subscription status
  const [subscription] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (subscription) {
    await db.update(subscriptions)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    console.log(`[Webhook] Subscription ${subscriptionId} marked as active`);
  }

  // Record payment
  const invoicePaymentIntent = (invoice as any).payment_intent;
  if (invoicePaymentIntent) {
    const paymentIntentId = typeof invoicePaymentIntent === "string"
      ? invoicePaymentIntent
      : invoicePaymentIntent.id;

    const [existingPayment] = await db.select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (!existingPayment && subscription) {
      await db.insert(payments).values({
        userId: subscription.userId,
        stripePaymentIntentId: paymentIntentId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        status: "succeeded",
        metadata: { invoiceId: invoice.id },
      });
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing invoice.payment_failed: ${invoice.id}`);

  const db = await getDb();
  if (!db) return;

  const invoiceSubscription = (invoice as any).subscription;
  if (!invoiceSubscription) return;

  const subscriptionId = typeof invoiceSubscription === "string"
    ? invoiceSubscription
    : invoiceSubscription.id;

  // Update subscription status to past_due
  await db.update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Webhook] Subscription ${subscriptionId} marked as past_due`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.updated: ${subscription.id}`);

  const db = await getDb();
  if (!db) return;

  const [existingSubscription] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existingSubscription) {
    await db.update(subscriptions)
      .set({
        status: subscription.status as any,
        stripePriceId: subscription.items.data[0]?.price.id,
        currentPeriodEnd: (subscription as any).current_period_end 
          ? new Date((subscription as any).current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSubscription.id));

    console.log(`[Webhook] Subscription ${subscription.id} updated`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.deleted: ${subscription.id}`);

  const db = await getDb();
  if (!db) return;

  await db.update(subscriptions)
    .set({
      status: "cancelled",
      endDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Webhook] Subscription ${subscription.id} marked as cancelled`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Processing payment_intent.succeeded: ${paymentIntent.id}`);

  const db = await getDb();
  if (!db) return;

  // Update existing payment record or create new one
  const [existingPayment] = await db.select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (existingPayment) {
    await db.update(payments)
      .set({
        status: "succeeded",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id));
  } else if (paymentIntent.metadata?.userId) {
    await db.insert(payments).values({
      userId: parseInt(paymentIntent.metadata.userId),
      stripePaymentIntentId: paymentIntent.id,
      productType: paymentIntent.metadata.productType || "",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: "succeeded",
      metadata: paymentIntent.metadata,
    });
  }

  console.log(`[Webhook] Payment ${paymentIntent.id} marked as succeeded`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Processing payment_intent.payment_failed: ${paymentIntent.id}`);

  const db = await getDb();
  if (!db) return;

  const [existingPayment] = await db.select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (existingPayment) {
    await db.update(payments)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id));

    console.log(`[Webhook] Payment ${paymentIntent.id} marked as failed`);
  }
}

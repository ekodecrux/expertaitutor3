// Stripe payment router - checkout, subscriptions, and payment management
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, subscriptions, payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { SUBSCRIPTION_PLANS, ONE_TIME_PRODUCTS } from "./stripe-products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export const stripeRouter = router({
  // ============= SUBSCRIPTION CHECKOUT =============

  createSubscriptionCheckout: protectedProcedure
    .input(z.object({
      planId: z.enum([
        "INSTITUTION_BASIC_MONTHLY",
        "INSTITUTION_BASIC_ANNUAL",
        "INSTITUTION_PREMIUM_MONTHLY",
        "INSTITUTION_PREMIUM_ANNUAL",
        "INSTITUTION_ENTERPRISE_MONTHLY",
        "INSTITUTION_ENTERPRISE_ANNUAL",
        "PARENT_MONTHLY",
        "PARENT_ANNUAL",
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get or create Stripe customer
      let stripeCustomerId = ctx.user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        stripeCustomerId = customer.id;

        // Save customer ID
        await db.update(users)
          .set({ stripeCustomerId })
          .where(eq(users.id, ctx.user.id));
      }

      const plan = SUBSCRIPTION_PLANS[input.planId];
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        client_reference_id: ctx.user.id.toString(),
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: plan.name,
                description: plan.features.join(", "),
              },
              recurring: {
                interval: plan.interval as "month" | "year",
              },
              unit_amount: plan.amount,
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 14, // 14-day free trial
          metadata: {
            userId: ctx.user.id.toString(),
            planType: input.planId,
          },
        },
        metadata: {
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
          planType: input.planId,
        },
        allow_promotion_codes: true,
        success_url: `${origin}/dashboard?subscription=success`,
        cancel_url: `${origin}/pricing?subscription=canceled`,
      });

      return { checkoutUrl: session.url };
    }),

  // ============= ONE-TIME PRODUCT CHECKOUT =============

  createProductCheckout: protectedProcedure
    .input(z.object({
      productId: z.enum([
        "COURSE_JEE_MAIN",
        "COURSE_JEE_ADVANCED",
        "COURSE_NEET",
        "COURSE_CBSE_10",
        "COURSE_CBSE_12",
        "COURSE_SAT",
        "COURSE_GMAT",
        "COURSE_GRE",
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get or create Stripe customer
      let stripeCustomerId = ctx.user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        stripeCustomerId = customer.id;

        await db.update(users)
          .set({ stripeCustomerId })
          .where(eq(users.id, ctx.user.id));
      }

      const product = ONE_TIME_PRODUCTS[input.productId];
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        client_reference_id: ctx.user.id.toString(),
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.amount,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          metadata: {
            userId: ctx.user.id.toString(),
            productType: input.productId,
          },
        },
        metadata: {
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
          productType: input.productId,
        },
        allow_promotion_codes: true,
        success_url: `${origin}/dashboard?payment=success&product=${input.productId}`,
        cancel_url: `${origin}/courses?payment=canceled`,
      });

      return { checkoutUrl: session.url };
    }),

  // ============= SUBSCRIPTION MANAGEMENT =============

  getMySubscription: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (!subscription || !subscription.stripeSubscriptionId) {
        return null;
      }

      // Fetch latest subscription data from Stripe
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );

        return {
          ...subscription,
          stripeData: {
            status: stripeSubscription.status,
            currentPeriodEnd: (stripeSubscription as any).current_period_end 
              ? new Date((stripeSubscription as any).current_period_end * 1000)
              : null,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
            trialEnd: stripeSubscription.trial_end 
              ? new Date(stripeSubscription.trial_end * 1000) 
              : null,
          },
        };
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error);
        return subscription;
      }
    }),

  cancelSubscription: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active subscription found",
        });
      }

      // Cancel at period end (don't cancel immediately)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update local record
      await db.update(subscriptions)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(subscriptions.id, subscription.id));

      return { success: true };
    }),

  resumeSubscription: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No subscription found",
        });
      }

      // Resume subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update local record
      await db.update(subscriptions)
        .set({ cancelAtPeriodEnd: false })
        .where(eq(subscriptions.id, subscription.id));

      return { success: true };
    }),

  // ============= PAYMENT HISTORY =============

  getMyPayments: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db.select()
        .from(payments)
        .where(eq(payments.userId, ctx.user.id))
        .limit(input.limit);
    }),

  // ============= BILLING PORTAL =============

  createPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Stripe customer found",
        });
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${origin}/dashboard`,
      });

      return { portalUrl: session.url };
    }),
});

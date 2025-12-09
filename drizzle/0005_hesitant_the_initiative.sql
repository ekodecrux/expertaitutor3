ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','completed','failed','refunded','succeeded') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `planId` int;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `status` enum('active','cancelled','expired','trial','canceled','past_due','trialing','incomplete') DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `startDate` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `endDate` timestamp;--> statement-breakpoint
ALTER TABLE `payments` ADD `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `stripeInvoiceId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `productType` varchar(100);--> statement-breakpoint
ALTER TABLE `payments` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `payments` ADD `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `stripePriceId` varchar(255);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `planType` varchar(100);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `currentPeriodEnd` timestamp;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `cancelAtPeriodEnd` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `trialEnd` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `payment_intent_idx` ON `payments` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `stripe_subscription_idx` ON `subscriptions` (`stripeSubscriptionId`);
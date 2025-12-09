ALTER TABLE `users` MODIFY COLUMN `role` enum('student','parent','teacher','admin','institution_admin','branch_admin','super_admin') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `branchId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `otpCode` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `otpExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `failedLoginAttempts` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `lockedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `googleId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `facebookId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `gdprConsent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `gdprConsentDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `dataResidency` varchar(50);--> statement-breakpoint
CREATE INDEX `organization_idx` ON `users` (`organizationId`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `users` (`branchId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);
CREATE TABLE `currency_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`type` enum('earn','spend') NOT NULL,
	`currency_type` enum('coins','gems') NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `currency_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`scope` enum('class','school','global') NOT NULL,
	`scopeId` int,
	`period` enum('daily','weekly','monthly','all_time') NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`rank` int,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`milestoneType` varchar(100) NOT NULL,
	`percentage` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`rewardCoins` int DEFAULT 0,
	`rewardGems` int DEFAULT 0,
	`celebrated` boolean DEFAULT false,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streak_freezes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	`reason` varchar(255),
	CONSTRAINT `streak_freezes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_currency` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`coins` int NOT NULL DEFAULT 0,
	`gems` int NOT NULL DEFAULT 0,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalSpent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_currency_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_currency_studentUserId_unique` UNIQUE(`studentUserId`)
);
--> statement-breakpoint
CREATE INDEX `trans_student_idx` ON `currency_transactions` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `trans_created_idx` ON `currency_transactions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `lead_student_idx` ON `leaderboards` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `lead_scope_idx` ON `leaderboards` (`scope`,`scopeId`);--> statement-breakpoint
CREATE INDEX `lead_period_idx` ON `leaderboards` (`period`);--> statement-breakpoint
CREATE INDEX `lead_rank_idx` ON `leaderboards` (`rank`);--> statement-breakpoint
CREATE INDEX `milestone_student_idx` ON `milestones` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `milestone_type_idx` ON `milestones` (`milestoneType`);--> statement-breakpoint
CREATE INDEX `freeze_student_idx` ON `streak_freezes` (`studentUserId`);
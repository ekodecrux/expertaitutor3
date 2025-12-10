CREATE TABLE `roleplay_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roleplay_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roleplay_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('debate','interview','experiment','presentation','discussion') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`subjectId` int,
	`topicId` int,
	`characterRole` varchar(255),
	`systemPrompt` text NOT NULL,
	`objectives` json,
	`estimatedDuration` int,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roleplay_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roleplay_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`scenarioId` int NOT NULL,
	`status` enum('active','completed','abandoned') DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`durationSeconds` int,
	`performanceScore` int,
	`feedback` text,
	`metadata` json,
	CONSTRAINT `roleplay_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `session_idx` ON `roleplay_messages` (`sessionId`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `roleplay_sessions` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `scenario_idx` ON `roleplay_sessions` (`scenarioId`);
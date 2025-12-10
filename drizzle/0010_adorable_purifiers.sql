CREATE TABLE `review_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`topicId` int,
	`conceptId` int,
	`questionId` int,
	`contentType` enum('topic','concept','question') NOT NULL,
	`easeFactor` decimal(3,2) NOT NULL DEFAULT '2.50',
	`interval` int NOT NULL DEFAULT 1,
	`repetitions` int NOT NULL DEFAULT 0,
	`lastReviewedAt` timestamp,
	`nextReviewAt` timestamp NOT NULL,
	`dueStatus` enum('not_due','due_soon','due_now','overdue') NOT NULL DEFAULT 'not_due',
	`totalReviews` int DEFAULT 0,
	`successfulReviews` int DEFAULT 0,
	`averageScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`scheduleId` int NOT NULL,
	`score` int NOT NULL,
	`timeSpentSeconds` int,
	`difficulty` enum('again','hard','good','easy') NOT NULL,
	`oldInterval` int,
	`newInterval` int,
	`oldEaseFactor` decimal(3,2),
	`newEaseFactor` decimal(3,2),
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `student_idx` ON `review_schedules` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `next_review_idx` ON `review_schedules` (`nextReviewAt`);--> statement-breakpoint
CREATE INDEX `due_status_idx` ON `review_schedules` (`dueStatus`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `review_sessions` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `schedule_idx` ON `review_sessions` (`scheduleId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `review_sessions` (`reviewedAt`);
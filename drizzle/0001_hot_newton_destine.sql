CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` text,
	`category` varchar(100),
	`criteria` json,
	`points` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`topicId` int,
	`subjectId` int,
	`durationSeconds` int,
	`pointsEarned` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`type` enum('note','video','slide','simulation','question','past_paper') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`url` text,
	`fileKey` text,
	`difficulty` enum('easy','medium','hard','expert'),
	`examTags` json,
	`bloomLevel` varchar(50),
	`languages` json,
	`status` enum('draft','review','approved','live') DEFAULT 'draft',
	`authorId` int,
	`reviewerId` int,
	`version` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doubts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`topicId` int,
	`subjectId` int,
	`questionText` text NOT NULL,
	`questionImageUrl` text,
	`questionAudioUrl` text,
	`aiSolution` text,
	`alternativeMethods` json,
	`commonMistakes` json,
	`resolved` boolean DEFAULT false,
	`escalatedToHuman` boolean DEFAULT false,
	`assignedTeacherId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `doubts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('school','coaching_center','university','other'),
	`country` varchar(100),
	`address` text,
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`logoUrl` text,
	`brandColor` varchar(20),
	`ssoEnabled` boolean DEFAULT false,
	`ssoProvider` varchar(50),
	`ssoConfig` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`topicId` int NOT NULL,
	`masteryScore` int DEFAULT 0,
	`confidenceScore` int DEFAULT 0,
	`attemptsCount` int DEFAULT 0,
	`correctCount` int DEFAULT 0,
	`averageTimeSeconds` int,
	`lastPracticedAt` timestamp,
	`nextRevisionAt` timestamp,
	`misconceptions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','alert') DEFAULT 'info',
	`read` boolean DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parent_student_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`studentUserId` int NOT NULL,
	`relationship` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_student_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`amount` int NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`paymentMethod` varchar(100),
	`transactionId` varchar(255),
	`invoiceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`type` enum('mcq','msq','numeric','short_answer','long_answer','essay','drag_drop','match_pairs','fill_blank') NOT NULL,
	`questionText` text NOT NULL,
	`questionImageUrl` text,
	`options` json,
	`correctAnswer` text,
	`solution` text,
	`hints` json,
	`difficulty` enum('easy','medium','hard','expert') NOT NULL,
	`examTags` json,
	`bloomLevel` varchar(50),
	`marks` int DEFAULT 1,
	`negativeMarks` int DEFAULT 0,
	`timeEstimateSeconds` int,
	`aiGenerated` boolean DEFAULT false,
	`status` enum('draft','review','approved','live') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`achievementId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_game_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`totalPoints` int DEFAULT 0,
	`level` int DEFAULT 1,
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`lastActivityDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_game_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_game_stats_studentUserId_unique` UNIQUE(`studentUserId`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`country` varchar(100),
	`curriculum` varchar(100),
	`grade` varchar(50),
	`targetExams` json,
	`targetYear` int,
	`targetMonth` int,
	`preferredLanguages` json,
	`preferredSubjects` json,
	`diagnosticCompleted` boolean DEFAULT false,
	`currentLevel` varchar(50),
	`studyHoursPerDay` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetExam` varchar(100),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`dailyTargetMinutes` int,
	`weeklyTargetMinutes` int,
	`topics` json,
	`aiGenerated` boolean DEFAULT true,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`curriculum` varchar(100) NOT NULL,
	`grade` varchar(50),
	`description` text,
	`iconUrl` text,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('freemium','monthly','annual','exam_pack','institutional') NOT NULL,
	`priceAmount` int NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`features` json,
	`maxStudents` int,
	`examAccess` json,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','cancelled','expired','trial') DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp NOT NULL,
	`autoRenew` boolean DEFAULT true,
	`paymentMethod` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`studentUserId` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`submittedAt` timestamp,
	`timeSpentSeconds` int,
	`score` int,
	`maxScore` int,
	`percentile` int,
	`accuracy` int,
	`status` enum('in_progress','submitted','evaluated','abandoned') DEFAULT 'in_progress',
	`answers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`questionId` int NOT NULL,
	`displayOrder` int DEFAULT 0,
	`marks` int,
	`section` varchar(100),
	CONSTRAINT `test_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('chapter','unit','mock_exam','custom','diagnostic','placement') NOT NULL,
	`subjectId` int,
	`curriculum` varchar(100),
	`grade` varchar(50),
	`durationMinutes` int,
	`totalMarks` int,
	`passingMarks` int,
	`negativeMarkingEnabled` boolean DEFAULT false,
	`randomizeQuestions` boolean DEFAULT false,
	`randomizeOptions` boolean DEFAULT false,
	`showSolutionsAfter` boolean DEFAULT true,
	`proctoringEnabled` boolean DEFAULT false,
	`createdBy` int NOT NULL,
	`institutionId` int,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`prerequisites` json,
	`learningOutcomes` json,
	`estimatedMinutes` int,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutor_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`audioUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tutor_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutor_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`mode` enum('teaching','practice','exam','revision') DEFAULT 'teaching',
	`topicId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`messageCount` int DEFAULT 0,
	`active` boolean DEFAULT true,
	CONSTRAINT `tutor_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','parent','teacher','admin','institution_admin') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `users` ADD `institutionId` int;--> statement-breakpoint
CREATE INDEX `user_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `topic_idx` ON `content_items` (`topicId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `content_items` (`status`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `doubts` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `topic_idx` ON `doubts` (`topicId`);--> statement-breakpoint
CREATE INDEX `student_topic_idx` ON `knowledge_profiles` (`studentUserId`,`topicId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `parent_student_links` (`parentUserId`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `parent_student_links` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `topic_idx` ON `questions` (`topicId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `questions` (`status`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `student_achievements` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `student_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `study_plans` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `curriculum_idx` ON `subjects` (`curriculum`,`grade`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `test_student_idx` ON `test_attempts` (`testId`,`studentUserId`);--> statement-breakpoint
CREATE INDEX `test_idx` ON `test_questions` (`testId`);--> statement-breakpoint
CREATE INDEX `subject_idx` ON `tests` (`subjectId`);--> statement-breakpoint
CREATE INDEX `institution_idx` ON `tests` (`institutionId`);--> statement-breakpoint
CREATE INDEX `unit_idx` ON `topics` (`unitId`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `tutor_messages` (`sessionId`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `tutor_sessions` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `subject_idx` ON `units` (`subjectId`);--> statement-breakpoint
CREATE INDEX `institution_idx` ON `users` (`institutionId`);
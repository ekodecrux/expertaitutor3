CREATE TABLE `class_subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`subjectId` int NOT NULL,
	`teacherUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`name` varchar(100) NOT NULL,
	`curriculum` varchar(100),
	`board` varchar(100),
	`academicYear` varchar(20),
	`maxStudents` int DEFAULT 40,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('trial','active','past_due','cancelled','expired') NOT NULL DEFAULT 'trial',
	`trialEndsAt` timestamp,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`name` varchar(10) NOT NULL,
	`maxStudents` int DEFAULT 40,
	`currentStudents` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`classId` int NOT NULL,
	`sectionId` int,
	`enrollmentDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','inactive','graduated','transferred') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`metricName` varchar(50) NOT NULL,
	`currentValue` int DEFAULT 0,
	`limitValue` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cs_class_idx` ON `class_subjects` (`classId`);--> statement-breakpoint
CREATE INDEX `cs_teacher_idx` ON `class_subjects` (`teacherUserId`);--> statement-breakpoint
CREATE INDEX `org_class_idx` ON `classes` (`organizationId`);--> statement-breakpoint
CREATE INDEX `branch_class_idx` ON `classes` (`branchId`);--> statement-breakpoint
CREATE INDEX `org_sub_idx` ON `organization_subscriptions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `plan_sub_idx` ON `organization_subscriptions` (`planId`);--> statement-breakpoint
CREATE INDEX `section_class_idx` ON `sections` (`classId`);--> statement-breakpoint
CREATE INDEX `enroll_student_idx` ON `student_enrollments` (`studentUserId`);--> statement-breakpoint
CREATE INDEX `enroll_class_idx` ON `student_enrollments` (`classId`);--> statement-breakpoint
CREATE INDEX `enroll_section_idx` ON `student_enrollments` (`sectionId`);--> statement-breakpoint
CREATE INDEX `usage_org_idx` ON `subscription_usage` (`organizationId`);--> statement-breakpoint
CREATE INDEX `usage_metric_idx` ON `subscription_usage` (`metricName`);
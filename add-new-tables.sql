CREATE TABLE IF NOT EXISTS `classes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `branchId` int,
  `name` varchar(100) NOT NULL,
  `curriculum` varchar(100),
  `board` varchar(100),
  `academicYear` varchar(20),
  `maxStudents` int DEFAULT 40,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `org_class_idx` (`organizationId`),
  INDEX `branch_class_idx` (`branchId`)
);

CREATE TABLE IF NOT EXISTS `sections` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `classId` int NOT NULL,
  `name` varchar(10) NOT NULL,
  `maxStudents` int DEFAULT 40,
  `currentStudents` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `section_class_idx` (`classId`)
);

CREATE TABLE IF NOT EXISTS `class_subjects` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `classId` int NOT NULL,
  `subjectId` int NOT NULL,
  `teacherUserId` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `cs_class_idx` (`classId`),
  INDEX `cs_teacher_idx` (`teacherUserId`)
);

CREATE TABLE IF NOT EXISTS `student_enrollments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `studentUserId` int NOT NULL,
  `classId` int NOT NULL,
  `sectionId` int,
  `enrollmentDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active', 'inactive', 'graduated', 'transferred') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `enroll_student_idx` (`studentUserId`),
  INDEX `enroll_class_idx` (`classId`),
  INDEX `enroll_section_idx` (`sectionId`)
);

CREATE TABLE IF NOT EXISTS `organization_subscriptions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `planId` int NOT NULL,
  `status` enum('trial', 'active', 'past_due', 'cancelled', 'expired') NOT NULL DEFAULT 'trial',
  `trialEndsAt` timestamp,
  `currentPeriodStart` timestamp NOT NULL,
  `currentPeriodEnd` timestamp NOT NULL,
  `cancelAtPeriodEnd` boolean DEFAULT FALSE,
  `stripeCustomerId` varchar(255),
  `stripeSubscriptionId` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `org_sub_idx` (`organizationId`),
  INDEX `plan_sub_idx` (`planId`)
);

CREATE TABLE IF NOT EXISTS `subscription_usage` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `metricName` varchar(50) NOT NULL,
  `currentValue` int DEFAULT 0,
  `limitValue` int NOT NULL,
  `periodStart` timestamp NOT NULL,
  `periodEnd` timestamp NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `usage_org_idx` (`organizationId`),
  INDEX `usage_metric_idx` (`metricName`)
);

CREATE TABLE `concept_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conceptId` int NOT NULL,
	`noteText` text NOT NULL,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `concept_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concept_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conceptId` int NOT NULL,
	`relatedConceptId` int NOT NULL,
	`relationshipType` varchar(50) NOT NULL,
	`strength` int DEFAULT 50,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `concept_relationships_id` PRIMARY KEY(`id`),
	CONSTRAINT `rel_concept_related_idx` UNIQUE(`conceptId`,`relatedConceptId`)
);
--> statement-breakpoint
CREATE TABLE `extracted_concepts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`conceptName` varchar(255) NOT NULL,
	`definition` text,
	`explanation` text,
	`examples` json,
	`category` varchar(100),
	`importanceScore` int DEFAULT 50,
	`difficulty` enum('beginner','intermediate','advanced'),
	`keywords` json,
	`sourceContext` text,
	`position` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `extracted_concepts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileType` varchar(50) NOT NULL,
	`fileUrl` text,
	`textContent` text,
	`subject` varchar(100),
	`topic` varchar(255),
	`curriculum` varchar(100),
	`processingStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`conceptCount` int DEFAULT 0,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `study_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `note_user_idx` ON `concept_notes` (`userId`);--> statement-breakpoint
CREATE INDEX `note_concept_idx` ON `concept_notes` (`conceptId`);--> statement-breakpoint
CREATE INDEX `rel_concept_idx` ON `concept_relationships` (`conceptId`);--> statement-breakpoint
CREATE INDEX `rel_related_idx` ON `concept_relationships` (`relatedConceptId`);--> statement-breakpoint
CREATE INDEX `rel_type_idx` ON `concept_relationships` (`relationshipType`);--> statement-breakpoint
CREATE INDEX `concept_material_idx` ON `extracted_concepts` (`materialId`);--> statement-breakpoint
CREATE INDEX `concept_name_idx` ON `extracted_concepts` (`conceptName`);--> statement-breakpoint
CREATE INDEX `concept_importance_idx` ON `extracted_concepts` (`importanceScore`);--> statement-breakpoint
CREATE INDEX `concept_category_idx` ON `extracted_concepts` (`category`);--> statement-breakpoint
CREATE INDEX `material_user_idx` ON `study_materials` (`userId`);--> statement-breakpoint
CREATE INDEX `material_status_idx` ON `study_materials` (`processingStatus`);--> statement-breakpoint
CREATE INDEX `material_subject_idx` ON `study_materials` (`subject`);
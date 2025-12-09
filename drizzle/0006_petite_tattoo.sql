CREATE TABLE `content_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_content_idx` UNIQUE(`user_id`,`content_id`)
);
--> statement-breakpoint
ALTER TABLE `content_favorites` ADD CONSTRAINT `content_favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `favorite_user_idx` ON `content_favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorite_content_idx` ON `content_favorites` (`content_id`);
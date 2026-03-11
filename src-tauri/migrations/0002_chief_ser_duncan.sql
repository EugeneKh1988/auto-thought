PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_situation` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_situation`("id", "name", "description", "user_id", "created_at", "updated_at") SELECT "id", "name", "description", "user_id", "created_at", "updated_at" FROM `situation`;--> statement-breakpoint
DROP TABLE `situation`;--> statement-breakpoint
ALTER TABLE `__new_situation` RENAME TO `situation`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `situation_id_unique` ON `situation` (`id`);
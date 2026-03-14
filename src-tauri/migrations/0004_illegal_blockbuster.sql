PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_thought` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`strength` integer,
	`situation_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`situation_id`) REFERENCES `situation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_thought`("id", "name", "strength", "situation_id", "created_at", "updated_at") SELECT "id", "name", "strength", "situation_id", "created_at", "updated_at" FROM `thought`;--> statement-breakpoint
DROP TABLE `thought`;--> statement-breakpoint
ALTER TABLE `__new_thought` RENAME TO `thought`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `thought_id_unique` ON `thought` (`id`);
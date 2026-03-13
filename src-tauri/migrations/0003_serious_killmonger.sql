CREATE TABLE `thought` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`strength` integer,
	`situation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`situation_id`) REFERENCES `situation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thought_id_unique` ON `thought` (`id`);
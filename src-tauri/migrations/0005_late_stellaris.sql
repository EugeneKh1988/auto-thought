CREATE TABLE `proof` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`thought_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`thought_id`) REFERENCES `thought`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proof_id_unique` ON `proof` (`id`);
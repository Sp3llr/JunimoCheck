CREATE TABLE `bundle_progress` (
	`item_id` text PRIMARY KEY NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);

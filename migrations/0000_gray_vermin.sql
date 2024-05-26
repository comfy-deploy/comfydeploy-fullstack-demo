CREATE TABLE `runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`run_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`image_url` text
);

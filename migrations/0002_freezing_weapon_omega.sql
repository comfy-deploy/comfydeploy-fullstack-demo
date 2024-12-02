ALTER TABLE runs ADD `live_status` text;--> statement-breakpoint
ALTER TABLE runs ADD `progress` real;
-- migrations/01_add_status_to_runs.sql
ALTER TABLE runs ADD COLUMN status TEXT;

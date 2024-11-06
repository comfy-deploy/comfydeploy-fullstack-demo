CREATE TABLE IF NOT EXISTS "runs" (
	"run_id" text PRIMARY KEY NOT NULL,
	"image_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"image_url" text,
	"inputs" jsonb NOT NULL,
	"live_status" text,
	"progress" real
);

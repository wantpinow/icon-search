ALTER TABLE "iconsearch_api_key" ADD COLUMN "revoked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "iconsearch_api_key" ADD COLUMN "revoked_at" timestamp with time zone;
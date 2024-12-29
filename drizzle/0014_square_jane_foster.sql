ALTER TABLE "iconsearch_icon_suggestion_requests" ALTER COLUMN "ip_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "iconsearch_icon_suggestion_requests" ADD COLUMN "api_key_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iconsearch_icon_suggestion_requests" ADD CONSTRAINT "icon_suggestion_requests_api_key_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."iconsearch_api_key"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

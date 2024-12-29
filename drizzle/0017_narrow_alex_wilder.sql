ALTER TABLE "iconsearch_api_key" DROP CONSTRAINT "api_key_user_fkey";
--> statement-breakpoint
ALTER TABLE "iconsearch_icon_suggestion_requests" DROP CONSTRAINT "icon_suggestion_requests_api_key_fkey";
--> statement-breakpoint
ALTER TABLE "iconsearch_icon_version" DROP CONSTRAINT "icon_version_icon_fkey";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iconsearch_api_key" ADD CONSTRAINT "api_key_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."iconsearch_user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iconsearch_icon_suggestion_requests" ADD CONSTRAINT "icon_suggestion_requests_api_key_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."iconsearch_api_key"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iconsearch_icon_version" ADD CONSTRAINT "icon_version_icon_fkey" FOREIGN KEY ("icon_id") REFERENCES "public"."iconsearch_icon"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."plan_id" AS ENUM('free', 'pro', 'enterprise');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "iconsearch_user" ADD COLUMN "plan_id" "plan_id" DEFAULT 'free' NOT NULL;
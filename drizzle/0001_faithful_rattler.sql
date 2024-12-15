DO $$ BEGIN
 CREATE TYPE "public"."icon_type" AS ENUM('lucide');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iconsearch_icon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "icon_type" NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iconsearch_icon_version" (
	"icon_id" uuid NOT NULL,
	"version_range" "int4range" NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "icon_type_index" ON "iconsearch_icon" USING btree ("type");
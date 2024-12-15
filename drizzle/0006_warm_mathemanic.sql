ALTER TABLE "iconsearch_icon_version" ADD COLUMN "range_start" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "iconsearch_icon_version" ADD COLUMN "range_end" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "iconsearch_icon_version" DROP COLUMN IF EXISTS "version_range";
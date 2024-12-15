DO $$ BEGIN
 ALTER TABLE "iconsearch_icon_version" ADD CONSTRAINT "icon_version_icon_fkey" FOREIGN KEY ("icon_id") REFERENCES "public"."iconsearch_icon"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

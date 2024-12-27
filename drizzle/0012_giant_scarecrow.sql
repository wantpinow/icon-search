CREATE TABLE IF NOT EXISTS "iconsearch_icon_suggestion_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datetime" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ip_address" text NOT NULL,
	"query" text NOT NULL,
	"mode" text NOT NULL,
	"type" "icon_type" NOT NULL,
	"version_number" integer NOT NULL,
	"limit" integer NOT NULL,
	"results" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "datetime_index" ON "iconsearch_icon_suggestion_requests" USING btree ("datetime");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ip_address_index" ON "iconsearch_icon_suggestion_requests" USING btree ("ip_address");
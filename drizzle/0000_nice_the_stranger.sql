-- MANUAL MIGRATION: CREATE PGVECTOR EXTENSION
CREATE EXTENSION vector;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iconsearch_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iconsearch_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_id" text,
	"email" varchar(256) NOT NULL,
	"username" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "iconsearch_user_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "iconsearch_user_email_unique" UNIQUE("email"),
	CONSTRAINT "iconsearch_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iconsearch_session" ADD CONSTRAINT "session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."iconsearch_user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

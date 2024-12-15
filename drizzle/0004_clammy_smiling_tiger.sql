CREATE TABLE IF NOT EXISTS "iconsearch_package_version" (
	"type" "icon_type" NOT NULL,
	"version" text NOT NULL,
	"version_number" integer NOT NULL,
	CONSTRAINT "iconsearch_package_version_type_version_pk" PRIMARY KEY("type","version")
);

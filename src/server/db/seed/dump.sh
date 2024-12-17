#!/bin/bash

dump_file="src/server/db/seed/local_icon_dump.sql"

source .env.local

export PGPASSWORD="$DATABASE_PASSWORD"

pg_dump \
  -U "$DATABASE_USERNAME" \
  -h localhost \
  -p "$DATABASE_PORT" \
  -d "$DATABASE_NAME" \
  -t public.iconsearch_package_version \
  -t public.iconsearch_icon \
  -t public.iconsearch_icon_version \
  --data-only \
  -f "$dump_file"


#!/bin/bash

dump_file="src/server/db/seed/local_icon_dump.sql"

if [ ! -f "$dump_file" ]; then
  echo "Dump file not found: $dump_file"
  exit 0
fi

source .env.local

export PGPASSWORD="$DATABASE_PASSWORD"

psql \
  -U "$DATABASE_USERNAME" \
  -h localhost \
  -p "$DATABASE_PORT" \
  -d "$DATABASE_NAME" \
  -f "$dump_file"

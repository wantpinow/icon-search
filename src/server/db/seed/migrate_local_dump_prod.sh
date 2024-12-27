#!/bin/bash

dump_file="src/server/db/seed/local_icon_dump.sql"

if [ ! -f "$dump_file" ]; then
  echo "Dump file not found: $dump_file"
  exit 0
fi

source .env.prod

psql "$DATABASE_URL" -f "$dump_file"
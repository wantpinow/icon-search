#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env.local
set -a
source .env.local

DB_CONTAINER_NAME="$DATABASE_NAME-postgres"

if ! [ -x "$(command -v docker)" ]; then
    echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
    exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
    echo "Database container '$DB_CONTAINER_NAME' already running"
    exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
    docker start "$DB_CONTAINER_NAME"
    echo "Existing database container '$DB_CONTAINER_NAME' started"
    exit 0
fi

echo "Creating database container '$DB_CONTAINER_NAME'"
docker run -d \
--name $DB_CONTAINER_NAME \
-e POSTGRES_PASSWORD="$DATABASE_PASSWORD" \
-e POSTGRES_DB=$DATABASE_NAME \
-p $DATABASE_PORT:5432 \
pgvector/pgvector:pg16 && echo "Database container '$DB_CONTAINER_NAME' was successfully created"

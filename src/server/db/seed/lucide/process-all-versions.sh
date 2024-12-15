#!/bin/bash

# Exit on error
set -e

# Get all versions and store them in an array
versions=($(bunx npm view lucide versions | tr -d '[],' | tr "'" ' '))

# Iterate through each version
for version in "${versions[@]}"; do
    echo "Processing version: $version"

    # Install specific version
    bun add --dev lucide@$version --silent

    # Run the script
    bun run src/server/db/seed/lucide/process-version.ts lucide $version

    # Remove lucide
    bun remove lucide --silent
done
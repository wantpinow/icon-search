#!/bin/bash

# Exit on error
set -e

# Remove lucide-react
bun remove lucide-react --silent

# Get all versions and store them in an array
versions=($(bunx npm view lucide-react versions | tr -d '[],' | tr "'" ' '))

# Remove any version with "alpha" or "beta" in the name
versions=($(echo "${versions[@]}" | tr ' ' '\n' | grep -vE 'alpha|beta' | tr '\n' ' '))

# Don't process 0.0.1
versions=($(echo "${versions[@]}" | tr ' ' '\n' | grep -vE '0.0.1' | tr '\n' ' '))
# Iterate through each version
for version in "${versions[@]}"; do
    echo "Processing version: $version"

    # Install specific version
    bun add --dev lucide-react@$version --silent

    # Run the script
    bun run src/server/db/seed/lucide/process-version.ts lucide-react $version

    # Remove lucide-react
    bun remove lucide-react --silent
done

# add it back in
bun add lucide-react --silent
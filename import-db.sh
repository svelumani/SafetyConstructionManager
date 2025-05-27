#!/bin/bash

# MySafety Database Import Script
# Run this script inside your Docker container to import database dumps

echo "🚀 MySafety Database Import Tool"
echo "================================"
echo ""

# Set Docker environment flag
export IS_DOCKER=true

# Run the TypeScript import script
npx tsx server/import-database.ts

echo ""
echo "Import process completed!"
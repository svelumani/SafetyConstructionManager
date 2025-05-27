#!/bin/bash

# MySafety Database Import Script
# Run this script inside your Docker container to import database dumps

echo "🚀 MySafety Database Import Tool"
echo "================================"
echo ""

# Set Docker environment flag
export IS_DOCKER=true

# Find the correct node modules path and run tsx
if [ -f "./node_modules/.bin/tsx" ]; then
    echo "📦 Using local tsx..."
    ./node_modules/.bin/tsx server/import-database.ts
elif command -v tsx >/dev/null 2>&1; then
    echo "📦 Using global tsx..."
    tsx server/import-database.ts
else
    echo "❌ tsx not found. Installing tsx and running import..."
    npm install tsx
    ./node_modules/.bin/tsx server/import-database.ts
fi

echo ""
echo "Import process completed!"
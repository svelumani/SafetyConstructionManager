#!/bin/bash

# MySafety Database Import Script (Simple Version)
# Run this script inside your Docker container to import database dumps

echo "🚀 MySafety Database Import Tool"
echo "================================"
echo ""

# Set Docker environment flag
export IS_DOCKER=true

# Run the JavaScript import script directly with Node.js
echo "📦 Running database import with Node.js..."
node server/import-database.js

echo ""
echo "Import process completed!"
#!/bin/bash

# MySafety Database Export Script
# Run this in your Replit environment to export your complete database

echo "🚀 Exporting MySafety Database from Replit..."

# 1. Complete database dump (schema + data)
echo "📋 Creating complete database dump..."
pg_dump $DATABASE_URL > mysafety_complete_backup.sql

# 2. Schema-only dump (for clean deployments)
echo "🏗️ Creating schema-only dump..."
pg_dump --schema-only $DATABASE_URL > mysafety_schema.sql

# 3. Data-only dump (for migrating existing data)
echo "📊 Creating data-only dump..."
pg_dump --data-only $DATABASE_URL > mysafety_data.sql

# 4. Create a clean schema dump without session tables
echo "🧹 Creating clean schema for production..."
pg_dump --schema-only $DATABASE_URL | grep -v "user_sessions\|session" > mysafety_clean_schema.sql

echo "✅ Database export completed!"
echo "Files created:"
echo "  - mysafety_complete_backup.sql (full backup)"
echo "  - mysafety_schema.sql (schema only)"
echo "  - mysafety_data.sql (data only)"
echo "  - mysafety_clean_schema.sql (production schema)"

# 5. Show table count for verification
echo ""
echo "📊 Current database contains:"
psql $DATABASE_URL -c "\dt" | wc -l
echo "tables"

# 6. List all tables
echo ""
echo "📋 Tables in your MySafety database:"
psql $DATABASE_URL -c "\dt"
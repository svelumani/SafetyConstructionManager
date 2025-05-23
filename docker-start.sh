#!/bin/bash
set -e

echo "🐳 Starting MySafety Docker Container..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres-dev -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Initialize database schema
echo "🔄 Initializing database..."
tsx server/init-db.ts

# Run database migrations (using drizzle push for now)
echo "📊 Pushing database schema..."
npx drizzle-kit push --config=drizzle.config.ts

echo "🚀 Starting the application..."
exec npm run dev
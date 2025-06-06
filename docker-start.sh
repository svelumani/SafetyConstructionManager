
#!/bin/bash

# MySafety Docker Startup Script
# Handles database migration and application startup

echo "🐳 MySafety Docker Startup"
echo "=========================="

# Set Docker environment
export IS_DOCKER=true
export NODE_ENV=${NODE_ENV:-production}

echo "📦 Environment: $NODE_ENV"
echo "🔗 Database: ${DATABASE_URL}"

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    
    # Extract connection details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    for i in {1..30}; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        echo "⏳ Waiting for PostgreSQL... (attempt $i/30)"
        sleep 2
    done
    
    echo "❌ PostgreSQL not ready after 60 seconds"
    return 1
}

# Main startup sequence
main() {
    # Wait for database
    if ! wait_for_postgres; then
        echo "💥 Database connection failed"
        exit 1
    fi
    
    # Run database migration
    echo "🚀 Running database migration..."
    if node migrations/migrate.js; then
        echo "✅ Database migration completed successfully"
    else
        echo "⚠️  Migration had issues, but continuing..."
        # Don't exit on migration issues in Docker - the database might already be set up
    fi
    
    # Install dependencies if needed (for development)
    if [ "$NODE_ENV" = "development" ]; then
        echo "📦 Installing dependencies..."
        npm install
        
        echo "🔄 Starting development server..."
        exec npm run dev
    else
        echo "🚀 Starting production server..."
        exec node dist/index.js
    fi
}

# Run main function
main "$@"

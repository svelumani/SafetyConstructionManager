-- Database initialization script for MySafety platform
-- This script sets up the initial database structure

-- Create database if it doesn't exist
-- Note: This is handled by docker-compose environment variables

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON DATABASE mysafety TO mysafety_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mysafety_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mysafety_user;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mysafety_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mysafety_user;
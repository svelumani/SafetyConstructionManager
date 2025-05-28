-- Migration Template for MySafety
-- Copy this file and rename it with the next sequential number
-- Example: 001_add_new_feature.sql

-- Migration: [DESCRIPTION OF CHANGES]
-- Author: [YOUR NAME]
-- Date: [DATE]
-- Affects: [LIST OF TABLES/FEATURES AFFECTED]

-- ============================================================================
-- UP MIGRATION - Add your changes here
-- ============================================================================

-- Example: Add new column
-- ALTER TABLE users ADD COLUMN new_field TEXT;

-- Example: Create new table
-- CREATE TABLE IF NOT EXISTS new_table (
--   id SERIAL PRIMARY KEY,
--   tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- Example: Add index
-- CREATE INDEX IF NOT EXISTS idx_new_table_tenant_id ON new_table(tenant_id);

-- Example: Add enum value
-- ALTER TYPE user_role ADD VALUE 'new_role';

-- ============================================================================
-- DOWN MIGRATION (OPTIONAL) - Add rollback instructions as comments
-- ============================================================================

-- Rollback instructions:
-- DROP COLUMN users.new_field;
-- DROP TABLE new_table;
-- DROP INDEX idx_new_table_tenant_id;
-- Note: Cannot remove enum values in PostgreSQL

-- Success message
SELECT 'Migration [NAME] completed successfully!' as status;
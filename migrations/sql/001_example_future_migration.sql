-- Migration: Example Future Schema Change
-- Author: Developer  
-- Date: 2025-05-28
-- Affects: users table, new user_preferences table

-- ============================================================================
-- UP MIGRATION - Example of how to add new features
-- ============================================================================

-- Example 1: Add new column to existing table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_mobile_login TIMESTAMP;

-- Example 2: Create new table for user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Example 3: Add performance index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_users_mobile_token ON users(mobile_token) WHERE mobile_token IS NOT NULL;

-- Example 4: Add new enum value (be careful - cannot be rolled back)
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mobile_user';

-- ============================================================================
-- DOWN MIGRATION (OPTIONAL) - Add rollback instructions as comments
-- ============================================================================

-- Rollback instructions:
-- ALTER TABLE users DROP COLUMN mobile_token;
-- ALTER TABLE users DROP COLUMN last_mobile_login;
-- DROP TABLE user_preferences;
-- DROP INDEX idx_user_preferences_user_id;
-- DROP INDEX idx_users_mobile_token;
-- Note: Cannot remove enum values in PostgreSQL

-- Success message
SELECT 'Migration Example Future Schema Change completed successfully!' as status;
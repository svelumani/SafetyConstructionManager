-- Migration: Align Replit schema with EC2 database
-- Author: Developer  
-- Date: 2025-05-28
-- Affects: users table - add missing columns from EC2

-- ============================================================================
-- UP MIGRATION - Add EC2 missing columns
-- ============================================================================

-- Add missing columns that exist in EC2 but not in Replit
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS safety_certification_expiry DATE;

-- Success message
SELECT 'Migration: EC2 schema alignment completed successfully!' as status;
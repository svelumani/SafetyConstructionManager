-- Example: Adding a new column to existing table
-- This shows how future migrations will work

-- Add emergency_contact column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);

-- Add safety_certification_expiry to users table  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS safety_certification_expiry DATE;

-- Add weather_conditions to hazard_reports table
ALTER TABLE hazard_reports 
ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(100);

-- Create index on new columns
CREATE INDEX IF NOT EXISTS idx_users_certification_expiry ON users(safety_certification_expiry) 
WHERE safety_certification_expiry IS NOT NULL;

-- This migration is tracked automatically by the migration system
-- Migration: Add created_by_id column to inspections table
-- This fixes the schema mismatch where the API expects created_by_id but the column doesn't exist

ALTER TABLE inspections 
ADD COLUMN created_by_id INTEGER REFERENCES users(id);

-- Update existing records to set created_by_id = inspector_id as a reasonable default
UPDATE inspections 
SET created_by_id = inspector_id 
WHERE created_by_id IS NULL;

-- Now make it NOT NULL to match the expected schema
ALTER TABLE inspections 
ALTER COLUMN created_by_id SET NOT NULL; 
-- Complete Schema Alignment Migration
-- Adds all missing columns to bring EC2 database up to Replit standard
-- Generated: 2025-05-27
-- Total missing columns: 47 across 5 tables

BEGIN;

-- ================================================================
-- TENANTS TABLE - Add 14 missing columns
-- ================================================================
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS active_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS active_sites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_sites INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ================================================================
-- USERS TABLE - Add 5 missing columns
-- ================================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ================================================================
-- SITES TABLE - Add 9 missing columns
-- ================================================================
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ================================================================
-- HAZARD_REPORTS TABLE - Add 7 missing columns and fix naming
-- ================================================================
-- Add missing columns
ALTER TABLE hazard_reports 
ADD COLUMN IF NOT EXISTS reported_by_id INTEGER,
ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(50),
ADD COLUMN IF NOT EXISTS hazard_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS recommended_action TEXT,
ADD COLUMN IF NOT EXISTS video_ids JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add foreign key constraint for reported_by_id
ALTER TABLE hazard_reports 
ADD CONSTRAINT fk_hazard_reports_reported_by 
FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE SET NULL;

-- Update existing data: copy reporter_id to reported_by_id for consistency
UPDATE hazard_reports SET reported_by_id = reporter_id WHERE reporter_id IS NOT NULL;

-- ================================================================
-- INSPECTIONS TABLE - Add 12 missing columns
-- ================================================================
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS inspection_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS result VARCHAR(20),
ADD COLUMN IF NOT EXISTS findings TEXT,
ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS video_ids JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS assigned_to_id INTEGER;

-- Add foreign key constraint for assigned_to_id
ALTER TABLE inspections 
ADD CONSTRAINT fk_inspections_assigned_to 
FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL;

-- ================================================================
-- CREATE MISSING INDEXES FOR PERFORMANCE
-- ================================================================

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_country ON tenants(country);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_job_title ON users(job_title);

-- Sites indexes
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_contact_email ON sites(contact_email);

-- Hazard reports indexes
CREATE INDEX IF NOT EXISTS idx_hazard_reports_reported_by ON hazard_reports(reported_by_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_hazard_type ON hazard_reports(hazard_type);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_resolved_at ON hazard_reports(resolved_at);

-- Inspections indexes
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_type ON inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_assigned_to ON inspections(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_inspections_due_date ON inspections(due_date);

-- ================================================================
-- CREATE TRIGGERS FOR UPDATED_AT COLUMNS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at 
    BEFORE UPDATE ON sites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inspections_updated_at ON inspections;
CREATE TRIGGER update_inspections_updated_at 
    BEFORE UPDATE ON inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- UPDATE MIGRATION HISTORY
-- ================================================================
INSERT INTO migration_history (migration_name, applied_at, checksum) 
VALUES (
    '004-complete-schema-alignment', 
    NOW(), 
    '004_complete_schema_alignment_47_columns'
) ON CONFLICT (migration_name) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Count columns in each table to verify
DO $$
DECLARE
    tenant_cols INTEGER;
    user_cols INTEGER;
    site_cols INTEGER;
    hazard_cols INTEGER;
    inspection_cols INTEGER;
BEGIN
    -- Count columns
    SELECT COUNT(*) INTO tenant_cols FROM information_schema.columns WHERE table_name = 'tenants';
    SELECT COUNT(*) INTO user_cols FROM information_schema.columns WHERE table_name = 'users';
    SELECT COUNT(*) INTO site_cols FROM information_schema.columns WHERE table_name = 'sites';
    SELECT COUNT(*) INTO hazard_cols FROM information_schema.columns WHERE table_name = 'hazard_reports';
    SELECT COUNT(*) INTO inspection_cols FROM information_schema.columns WHERE table_name = 'inspections';
    
    -- Output results
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Column counts: tenants=%, users=%, sites=%, hazard_reports=%, inspections=%', 
                 tenant_cols, user_cols, site_cols, hazard_cols, inspection_cols;
    RAISE NOTICE 'Expected: tenants=22, users=19, sites=19, hazard_reports=22, inspections=22';
END $$;

COMMIT;

-- ================================================================
-- POST-MIGRATION DATA UPDATES (Optional)
-- ================================================================

-- Update any existing records with default values where appropriate
UPDATE tenants SET 
    country = 'United States' WHERE country IS NULL,
    subscription_status = 'active' WHERE subscription_status IS NULL,
    active_users = 0 WHERE active_users IS NULL,
    max_users = 50 WHERE max_users IS NULL,
    active_sites = 0 WHERE active_sites IS NULL,
    max_sites = 10 WHERE max_sites IS NULL,
    settings = '{}' WHERE settings IS NULL;

UPDATE users SET 
    permissions = '{}' WHERE permissions IS NULL;

UPDATE sites SET 
    status = 'active' WHERE status IS NULL;

UPDATE hazard_reports SET 
    is_active = true WHERE is_active IS NULL,
    video_ids = '[]' WHERE video_ids IS NULL;

UPDATE inspections SET 
    is_active = true WHERE is_active IS NULL,
    photo_urls = '[]' WHERE photo_urls IS NULL,
    video_ids = '[]' WHERE video_ids IS NULL,
    document_urls = '[]' WHERE document_urls IS NULL;

-- Final verification
SELECT 'Migration 004-complete-schema-alignment completed successfully!' as status;
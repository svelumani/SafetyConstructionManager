
-- MySafety Sequential Database Setup (No Foreign Keys)
-- Creates tables in proper dependency order without foreign key constraints

-- ============================================================================
-- STEP 1: CREATE ENUMS FIRST
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE site_role AS ENUM ('site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hazard_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_item_type AS ENUM ('yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('yes', 'no', 'na', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permit_status AS ENUM ('requested', 'approved', 'denied', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE BASE TABLES (NO FOREIGN KEYS)
-- ============================================================================

-- 1. TENANTS (Base table)
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  logo TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'basic',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  subscription_end_date TIMESTAMP,
  active_users INTEGER NOT NULL DEFAULT 0,
  max_users INTEGER NOT NULL DEFAULT 5,
  active_sites INTEGER NOT NULL DEFAULT 0,
  max_sites INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT,
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. USERS (References tenants via ID only)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER, -- Reference only, no FK constraint
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  phone TEXT,
  job_title TEXT,
  department TEXT,
  profile_image_url TEXT,
  permissions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  mobile_token TEXT,
  last_mobile_login TIMESTAMP,
  emergency_contact TEXT,
  safety_certification_expiry DATE
);

-- 3. SITES (References tenants via ID only)
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL, -- Reference only
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  gps_coordinates TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Continue with all other tables...
-- 4. SUBCONTRACTORS
CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  contract_number TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  services_provided TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  site_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  leader_id INTEGER, -- Reference only
  color TEXT,
  specialties JSONB,
  created_by_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Continue with all remaining tables without FK constraints...
-- [Include all other tables from your schema here]

-- ============================================================================
-- STEP 3: CREATE INDEXES ONLY (NO FOREIGN KEYS)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
-- Add all other indexes...

-- ============================================================================
-- STEP 4: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default super admin user (only if not exists)
INSERT INTO users (username, email, password, first_name, last_name, role)
SELECT 'superadmin', 'admin@mysafety.com', 'c9ab78209c4c4e546fd06e85a60dd02ff3c969f0c9d1e0526f6d52815a6399c9a0a4f9eb90ed73b3e3ba2b1dc46e1efcd4e47fd2de65f64cf12b7722e34fd320.69ec746c1b00f94ebc82a2b40fbd69c9', 'Super', 'Admin', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@mysafety.com');

SELECT 'MySafety Sequential Database Setup Complete!' as status;

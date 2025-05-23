-- Complete MySafety Database Schema for Docker Migration
-- This ensures all tables are created properly

-- Create enums first
CREATE TYPE user_role AS ENUM ('super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee');
CREATE TYPE site_role AS ENUM ('site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor');
CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE hazard_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'canceled');
CREATE TYPE permit_status AS ENUM ('requested', 'approved', 'denied', 'expired');
CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium', 'enterprise');
CREATE TYPE compliance_status AS ENUM ('compliant', 'non_compliant', 'pending', 'overdue');

-- Create main tables
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
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    avatar TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    UNIQUE(tenant_id, username),
    UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    site_manager_id INTEGER REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    contact_phone TEXT,
    contact_email TEXT,
    emergency_procedures TEXT,
    safety_protocols JSONB
);

-- This is just a sample of your complete schema
-- The full migration would include ALL your MySafety tables:
-- hazards, hazard_reports, hazard_assignments, hazard_comments
-- inspections, inspection_questions, inspection_responses
-- permits, permit_requests, incident_reports
-- training_content, training_courses, training_records
-- report_history, role_permissions, etc.

-- For now, let's test with these core tables to verify the migration works
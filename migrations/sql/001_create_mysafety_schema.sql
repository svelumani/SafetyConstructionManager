-- DEPRECATED: This file is replaced by 000_complete_schema.sql
-- DO NOT USE - kept for reference only

-- Create enums
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

-- Core tables
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  subscription_plan subscription_plan DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  role user_role DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  site_manager_id INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  site_role site_role DEFAULT 'worker',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Hazards module
CREATE TABLE IF NOT EXISTS hazard_reports (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  reporter_id INTEGER REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  severity hazard_severity NOT NULL,
  status hazard_status DEFAULT 'open',
  photo_urls TEXT[],
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hazard_assignments (
  id SERIAL PRIMARY KEY,
  hazard_id INTEGER REFERENCES hazard_reports(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id),
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hazard_comments (
  id SERIAL PRIMARY KEY,
  hazard_id INTEGER REFERENCES hazard_reports(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  comment TEXT NOT NULL,
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inspections module
CREATE TABLE IF NOT EXISTS inspection_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_questions (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES inspection_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options TEXT[],
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES inspection_templates(id),
  inspector_id INTEGER REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  title VARCHAR(255) NOT NULL,
  status inspection_status DEFAULT 'scheduled',
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  notes TEXT,
  overall_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_responses (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES inspection_questions(id),
  response_text TEXT,
  response_value DECIMAL(10,2),
  photo_urls TEXT[],
  notes TEXT
);

-- Permits module
CREATE TABLE IF NOT EXISTS permit_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  requester_id INTEGER REFERENCES users(id),
  permit_type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status permit_status DEFAULT 'requested',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  conditions TEXT,
  attachments TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents module
CREATE TABLE IF NOT EXISTS incident_reports (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  reporter_id INTEGER REFERENCES users(id),
  incident_type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  incident_date TIMESTAMP NOT NULL,
  severity incident_severity NOT NULL,
  status incident_status DEFAULT 'reported',
  injuries_count INTEGER DEFAULT 0,
  property_damage DECIMAL(10,2) DEFAULT 0,
  witnesses TEXT[],
  immediate_actions TEXT,
  photo_urls TEXT[],
  assigned_investigator INTEGER REFERENCES users(id),
  investigation_notes TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training module
CREATE TABLE IF NOT EXISTS training_courses (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  required_roles TEXT[],
  is_mandatory BOOLEAN DEFAULT false,
  expiry_months INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_content (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES training_courses(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  content_url TEXT,
  content_text TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS training_records (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES training_courses(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT NOW(),
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  score DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'assigned',
  expires_at TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id)
);

-- Reports module
CREATE TABLE IF NOT EXISTS report_history (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  generated_by INTEGER REFERENCES users(id),
  site_id INTEGER REFERENCES sites(id),
  report_name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  file_path TEXT,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_tenant_site ON hazard_reports(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_site ON inspections(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_permit_requests_tenant_site ON permit_requests(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_site ON incident_reports(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
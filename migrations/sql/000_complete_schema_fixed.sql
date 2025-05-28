-- MySafety Complete Database Schema Migration (Fixed Order)
-- This migration creates ALL tables with ALL columns from the Drizzle schema
-- Fixed table creation order to avoid circular dependencies

-- ============================================================================
-- ENUMS - Create all required enums first
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
-- FOUNDATION TABLES (no dependencies)
-- ============================================================================

-- Tenants Table
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

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sites Table
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Subcontractors Table
CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  leader_id INTEGER REFERENCES users(id),
  color TEXT,
  specialties JSONB,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Site Personnel Table
CREATE TABLE IF NOT EXISTS site_personnel (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_role site_role NOT NULL DEFAULT 'worker',
  assigned_by_id INTEGER NOT NULL REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  permissions JSONB,
  team_id INTEGER REFERENCES teams(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- INSPECTION FRAMEWORK TABLES
-- ============================================================================

-- Inspection Templates Table
CREATE TABLE IF NOT EXISTS inspection_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  is_default BOOLEAN DEFAULT FALSE,
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Inspection Sections Table
CREATE TABLE IF NOT EXISTS inspection_sections (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inspection Items Table
CREATE TABLE IF NOT EXISTS inspection_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES inspection_sections(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type inspection_item_type NOT NULL DEFAULT 'yes_no',
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  category TEXT,
  options JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inspection Checklist Items Table
CREATE TABLE IF NOT EXISTS inspection_checklist_items (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
  category TEXT,
  question TEXT NOT NULL,
  description TEXT,
  expected_answer TEXT DEFAULT 'yes',
  is_critical BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES inspection_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP,
  due_date TIMESTAMP,
  assigned_to_id INTEGER REFERENCES users(id),
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  completed_by_id INTEGER REFERENCES users(id),
  completed_date TIMESTAMP,
  location TEXT,
  status inspection_status NOT NULL,
  score INTEGER,
  max_score INTEGER,
  notes TEXT,
  photo_urls JSONB,
  document_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Inspection Responses Table
CREATE TABLE IF NOT EXISTS inspection_responses (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES inspection_checklist_items(id) ON DELETE CASCADE,
  response compliance_status NOT NULL,
  notes TEXT,
  photo_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inspection Findings Table
CREATE TABLE IF NOT EXISTS inspection_findings (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity hazard_severity NOT NULL DEFAULT 'medium',
  location TEXT,
  photo_urls JSONB,
  recommended_action TEXT,
  due_date TIMESTAMP,
  assigned_to_id INTEGER REFERENCES users(id),
  status hazard_status NOT NULL DEFAULT 'open',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  resolved_by_id INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- HAZARD MANAGEMENT TABLES
-- ============================================================================

-- Hazard Reports Table
CREATE TABLE IF NOT EXISTS hazard_reports (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  reported_by_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  gps_coordinates TEXT,
  hazard_type TEXT NOT NULL,
  severity hazard_severity NOT NULL,
  status hazard_status NOT NULL DEFAULT 'open',
  recommended_action TEXT,
  photo_urls JSONB,
  video_ids JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Hazard Assignments Table
CREATE TABLE IF NOT EXISTS hazard_assignments (
  id SERIAL PRIMARY KEY,
  hazard_id INTEGER NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
  assigned_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_to_user_id INTEGER REFERENCES users(id),
  assigned_to_subcontractor_id INTEGER REFERENCES subcontractors(id),
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP,
  status hazard_status NOT NULL DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Hazard Comments Table
CREATE TABLE IF NOT EXISTS hazard_comments (
  id SERIAL PRIMARY KEY,
  hazard_id INTEGER NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  attachment_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- PERMIT MANAGEMENT TABLES
-- ============================================================================

-- Permit Requests Table
CREATE TABLE IF NOT EXISTS permit_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  requester_id INTEGER NOT NULL REFERENCES users(id),
  approver_id INTEGER REFERENCES users(id),
  permit_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status permit_status NOT NULL DEFAULT 'requested',
  approval_date TIMESTAMP,
  denial_reason TEXT,
  attachment_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- INCIDENT MANAGEMENT TABLES
-- ============================================================================

-- Incident Reports Table
CREATE TABLE IF NOT EXISTS incident_reports (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  reported_by_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity incident_severity NOT NULL,
  status incident_status NOT NULL DEFAULT 'reported',
  injury_occurred BOOLEAN NOT NULL DEFAULT FALSE,
  injury_details TEXT,
  witnesses JSONB,
  root_cause TEXT,
  corrective_actions TEXT,
  preventative_measures TEXT,
  photo_urls JSONB,
  video_ids JSONB,
  document_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- TRAINING MANAGEMENT TABLES
-- ============================================================================

-- Training Content Table
CREATE TABLE IF NOT EXISTS training_content (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT NOT NULL,
  video_id TEXT,
  document_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  duration INTEGER,
  is_common BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Training Courses Table
CREATE TABLE IF NOT EXISTS training_courses (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_roles JSONB,
  assigned_site_ids JSONB,
  assigned_subcontractor_ids JSONB,
  content_ids JSONB,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Training Records Table
CREATE TABLE IF NOT EXISTS training_records (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMP,
  score INTEGER,
  passed BOOLEAN,
  certificate_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- SYSTEM AND UTILITY TABLES
-- ============================================================================

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, role, resource, action)
);

-- Report History Table
CREATE TABLE IF NOT EXISTS report_history (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  site_id INTEGER NOT NULL REFERENCES sites(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  report_name TEXT NOT NULL,
  report_url TEXT,
  status TEXT NOT NULL DEFAULT 'generated'
);

-- User Sessions Table (for express-session)
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- Hazard management indexes
CREATE INDEX IF NOT EXISTS idx_hazard_reports_tenant_site ON hazard_reports(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_severity ON hazard_reports(severity);
CREATE INDEX IF NOT EXISTS idx_hazard_assignments_hazard_id ON hazard_assignments(hazard_id);

-- Inspection management indexes
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_site ON inspections(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspection_responses_inspection_id ON inspection_responses(inspection_id);

-- Permit management indexes
CREATE INDEX IF NOT EXISTS idx_permit_requests_tenant_site ON permit_requests(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_permit_requests_status ON permit_requests(status);

-- Incident management indexes
CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_site ON incident_reports(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON incident_reports(severity);

-- Training management indexes
CREATE INDEX IF NOT EXISTS idx_training_records_user ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_course ON training_records(course_id);

-- Personnel management indexes
CREATE INDEX IF NOT EXISTS idx_site_personnel_site_id ON site_personnel(site_id);
CREATE INDEX IF NOT EXISTS idx_site_personnel_user_id ON site_personnel(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_site_id ON teams(site_id);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant_id ON system_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);

-- ============================================================================
-- DEFAULT DATA INSERTS
-- ============================================================================

-- Insert default super admin user (password: admin123 - hashed with salt)
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('superadmin', 'admin@mysafety.com', 'c9ab78209c4c4e546fd06e85a60dd02ff3c969f0c9d1e0526f6d52815a6399c9a0a4f9eb90ed73b3e3ba2b1dc46e1efcd4e47fd2de65f64cf12b7722e34fd320.69ec746c1b00f94ebc82a2b40fbd69c9', 'Super', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, is_default)
VALUES 
('hazard_notification', 'Safety Alert: New Hazard Reported [{{hazardId}}]', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #e63946;">Safety Alert: New Hazard Reported</h2><p>A new hazard has been reported that requires your attention.</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Hazard ID:</strong> {{hazardId}}</p><p><strong>Title:</strong> {{hazardTitle}}</p><p><strong>Location:</strong> {{hazardLocation}}</p><p><strong>Severity:</strong> <span style="color: {{#eq hazardSeverity "critical"}}#e63946{{else}}{{#eq hazardSeverity "high"}}#f4a261{{else}}#2a9d8f{{/eq}}{{/eq}};">{{hazardSeverity}}</span></p><p><strong>Reported By:</strong> {{reportedBy}}</p><p><strong>Date Reported:</strong> {{reportedDate}}</p></div><p>Please take immediate action to address this hazard. Click the button below to view the details and respond.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Hazard Details</a></p><p>Thank you for your prompt attention to this safety concern.</p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('user_registration', 'Welcome to MySafety - Your Account Details', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #2563eb;">Welcome to MySafety!</h2><p>Hello {{firstName}} {{lastName}},</p><p>Your account has been created in the MySafety platform. Use the following credentials to log in:</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Email:</strong> {{email}}</p><p><strong>Temporary Password:</strong> {{tempPassword}}</p></div><p>Please log in and change your password as soon as possible for security reasons.</p><p style="text-align: center;"><a href="{{loginLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a></p><p>If you have any questions or need assistance, please contact your system administrator.</p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('incident_notification', 'Incident Report: {{incidentTitle}}', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #e63946;">Incident Report: {{incidentTitle}}</h2><p>An incident has been reported that requires your attention.</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Incident ID:</strong> {{incidentId}}</p><p><strong>Title:</strong> {{incidentTitle}}</p><p><strong>Location:</strong> {{incidentLocation}}</p><p><strong>Date/Time:</strong> {{incidentDate}}</p><p><strong>Severity:</strong> <span style="color: {{#eq incidentSeverity "critical"}}#e63946{{else}}{{#eq incidentSeverity "major"}}#f4a261{{else}}#2a9d8f{{/eq}}{{/eq}};">{{incidentSeverity}}</span></p><p><strong>Reported By:</strong> {{reportedBy}}</p></div><p>Please review the incident details and ensure appropriate follow-up actions are taken.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Incident Details</a></p><p>Regards,<br>The MySafety Team</p></div>', TRUE)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'MySafety Complete Schema Migration Successfully Applied - All Tables Created!' as status;
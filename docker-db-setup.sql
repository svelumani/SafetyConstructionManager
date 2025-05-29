-- MySafety Database Setup for Docker
-- Execute these commands in order to create all 28 tables with proper dependencies

-- ============================================================================
-- STEP 1: CREATE ENUMS FIRST
-- ============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee');
CREATE TYPE site_role AS ENUM ('site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor');
CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE hazard_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'canceled');
CREATE TYPE inspection_item_type AS ENUM ('yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text');
CREATE TYPE compliance_status AS ENUM ('yes', 'no', 'na', 'partial');
CREATE TYPE permit_status AS ENUM ('requested', 'approved', 'denied', 'expired');
CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium', 'enterprise');

-- ============================================================================
-- STEP 2: FOUNDATION TABLES (NO DEPENDENCIES)
-- ============================================================================

-- 1. TENANTS TABLE
CREATE TABLE tenants (
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

-- ============================================================================
-- STEP 3: USER TABLES (DEPENDS ON TENANTS)
-- ============================================================================

-- 2. USERS TABLE
CREATE TABLE users (
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
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  mobile_token TEXT,
  last_mobile_login TIMESTAMP,
  emergency_contact TEXT,
  safety_certification_expiry DATE
);

-- 3. USER PREFERENCES TABLE
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

-- ============================================================================
-- STEP 4: SITE TABLES (DEPENDS ON TENANTS AND USERS)
-- ============================================================================

-- 4. SITES TABLE
CREATE TABLE sites (
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

-- 5. SUBCONTRACTORS TABLE
CREATE TABLE subcontractors (
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

-- 6. TEAMS TABLE
CREATE TABLE teams (
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

-- 7. SITE PERSONNEL TABLE
CREATE TABLE site_personnel (
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
-- STEP 5: INSPECTION FRAMEWORK TABLES
-- ============================================================================

-- 8. INSPECTION TEMPLATES TABLE
CREATE TABLE inspection_templates (
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

-- 9. INSPECTION SECTIONS TABLE
CREATE TABLE inspection_sections (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. INSPECTION ITEMS TABLE
CREATE TABLE inspection_items (
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

-- 11. INSPECTION CHECKLIST ITEMS TABLE
CREATE TABLE inspection_checklist_items (
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

-- 12. INSPECTIONS TABLE
CREATE TABLE inspections (
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

-- 13. INSPECTION RESPONSES TABLE
CREATE TABLE inspection_responses (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES inspection_checklist_items(id) ON DELETE CASCADE,
  response compliance_status NOT NULL,
  notes TEXT,
  photo_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 14. INSPECTION FINDINGS TABLE
CREATE TABLE inspection_findings (
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
-- STEP 6: SAFETY MANAGEMENT TABLES
-- ============================================================================

-- 15. HAZARD REPORTS TABLE
CREATE TABLE hazard_reports (
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

-- 16. HAZARD ASSIGNMENTS TABLE
CREATE TABLE hazard_assignments (
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

-- 17. HAZARD COMMENTS TABLE
CREATE TABLE hazard_comments (
  id SERIAL PRIMARY KEY,
  hazard_id INTEGER NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  attachment_urls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 18. PERMIT REQUESTS TABLE
CREATE TABLE permit_requests (
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

-- 19. INCIDENT REPORTS TABLE
CREATE TABLE incident_reports (
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
-- STEP 7: TRAINING SYSTEM TABLES
-- ============================================================================

-- 20. TRAINING CONTENT TABLE
CREATE TABLE training_content (
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

-- 21. TRAINING COURSES TABLE
CREATE TABLE training_courses (
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

-- 22. TRAINING RECORDS TABLE
CREATE TABLE training_records (
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
-- STEP 8: SYSTEM INFRASTRUCTURE TABLES
-- ============================================================================

-- 23. SYSTEM LOGS TABLE
CREATE TABLE system_logs (
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

-- 24. EMAIL TEMPLATES TABLE
CREATE TABLE email_templates (
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

-- 25. ROLE PERMISSIONS TABLE
CREATE TABLE role_permissions (
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

-- 26. REPORT HISTORY TABLE
CREATE TABLE report_history (
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

-- 27. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- 28. MIGRATION HISTORY TABLE
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  checksum VARCHAR(64),
  execution_time_ms INTEGER,
  status VARCHAR(20) DEFAULT 'completed'
);

-- ============================================================================
-- STEP 9: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_hazard_reports_tenant_site ON hazard_reports(tenant_id, site_id);
CREATE INDEX idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX idx_hazard_reports_severity ON hazard_reports(severity);
CREATE INDEX idx_hazard_assignments_hazard_id ON hazard_assignments(hazard_id);
CREATE INDEX idx_inspections_tenant_site ON inspections(tenant_id, site_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspection_responses_inspection_id ON inspection_responses(inspection_id);
CREATE INDEX idx_permit_requests_tenant_site ON permit_requests(tenant_id, site_id);
CREATE INDEX idx_permit_requests_status ON permit_requests(status);
CREATE INDEX idx_incident_reports_tenant_site ON incident_reports(tenant_id, site_id);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);
CREATE INDEX idx_training_records_user ON training_records(user_id);
CREATE INDEX idx_training_records_course ON training_records(course_id);
CREATE INDEX idx_site_personnel_site_id ON site_personnel(site_id);
CREATE INDEX idx_site_personnel_user_id ON site_personnel(user_id);
CREATE INDEX idx_teams_site_id ON teams(site_id);
CREATE INDEX idx_system_logs_tenant_id ON system_logs(tenant_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);

-- ============================================================================
-- STEP 10: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default super admin user
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('superadmin', 'admin@mysafety.com', 'c9ab78209c4c4e546fd06e85a60dd02ff3c969f0c9d1e0526f6d52815a6399c9a0a4f9eb90ed73b3e3ba2b1dc46e1efcd4e47fd2de65f64cf12b7722e34fd320.69ec746c1b00f94ebc82a2b40fbd69c9', 'Super', 'Admin', 'super_admin');

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, is_default)
VALUES 
('hazard_notification', 'Safety Alert: New Hazard Reported [{{hazardId}}]', '<div>Safety Alert: New Hazard Reported</div>', TRUE),
('user_registration', 'Welcome to MySafety - Your Account Details', '<div>Welcome to MySafety!</div>', TRUE),
('incident_notification', 'Incident Report: {{incidentTitle}}', '<div>Incident Report</div>', TRUE);

SELECT 'MySafety Database Setup Complete - All 28 Tables Created!' as status;
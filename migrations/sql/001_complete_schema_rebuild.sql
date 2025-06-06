-- Database Schema Export - FIXED VERSION
-- Generated at 2025-06-02T16:32:00.440Z

-- Enum Types
DO $$ BEGIN
    CREATE TYPE hazard_severity AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hazard_status AS ENUM ('closed', 'resolved', 'in_progress', 'assigned', 'open');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('critical', 'major', 'moderate', 'minor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('closed', 'resolved', 'investigating', 'reported');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_status AS ENUM ('canceled', 'completed', 'in_progress', 'scheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permit_status AS ENUM ('expired', 'denied', 'approved', 'requested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE site_role AS ENUM ('visitor', 'subcontractor', 'worker', 'foreman', 'safety_coordinator', 'site_manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('enterprise', 'premium', 'standard', 'basic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('employee', 'subcontractor', 'supervisor', 'safety_officer', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS email_templates_id_seq;
CREATE SEQUENCE IF NOT EXISTS hazard_assignments_id_seq;
CREATE SEQUENCE IF NOT EXISTS hazard_comments_id_seq;
CREATE SEQUENCE IF NOT EXISTS hazard_reports_id_seq;
CREATE SEQUENCE IF NOT EXISTS incident_reports_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_checklist_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_findings_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_questions_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_responses_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_sections_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspection_templates_id_seq;
CREATE SEQUENCE IF NOT EXISTS inspections_id_seq;
CREATE SEQUENCE IF NOT EXISTS migration_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS permit_requests_id_seq;
CREATE SEQUENCE IF NOT EXISTS report_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS role_permissions_id_seq;
CREATE SEQUENCE IF NOT EXISTS site_personnel_id_seq;
CREATE SEQUENCE IF NOT EXISTS sites_id_seq;
CREATE SEQUENCE IF NOT EXISTS subcontractors_id_seq;
CREATE SEQUENCE IF NOT EXISTS system_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS team_members_id_seq;
CREATE SEQUENCE IF NOT EXISTS teams_id_seq;
CREATE SEQUENCE IF NOT EXISTS tenants_id_seq;
CREATE SEQUENCE IF NOT EXISTS training_content_id_seq;
CREATE SEQUENCE IF NOT EXISTS training_courses_id_seq;
CREATE SEQUENCE IF NOT EXISTS training_records_id_seq;
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table: user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  sid character varying NOT NULL,
  sess json NOT NULL,
  expire timestamp without time zone NOT NULL,
  PRIMARY KEY (sid)
);

-- Table: tenants (create first as it's referenced by many tables)
CREATE TABLE IF NOT EXISTS tenants (
  id integer DEFAULT nextval('tenants_id_seq'::regclass) NOT NULL,
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  phone character varying(50),
  address text,
  subscription_plan subscription_plan DEFAULT 'basic'::subscription_plan,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  city character varying(100),
  state character varying(50),
  zip_code character varying(20),
  country character varying(100) DEFAULT 'United States'::character varying,
  logo text,
  subscription_status character varying(20) DEFAULT 'active'::character varying,
  subscription_end_date timestamp without time zone,
  active_users integer DEFAULT 0,
  max_users integer DEFAULT 50,
  active_sites integer DEFAULT 0,
  max_sites integer DEFAULT 10,
  updated_at timestamp without time zone DEFAULT now(),
  stripe_customer_id character varying(100),
  settings jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY (id)
);

-- Table: users (create early as it's referenced by many tables)
CREATE TABLE IF NOT EXISTS users (
  id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  username character varying(100) NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  first_name character varying(100),
  last_name character varying(100),
  phone character varying(50),
  role user_role DEFAULT 'employee'::user_role,
  is_active boolean DEFAULT true,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  emergency_contact character varying(255),
  safety_certification_expiry date,
  job_title character varying(100),
  department character varying(100),
  profile_image_url text,
  permissions jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: sites
CREATE TABLE IF NOT EXISTS sites (
  id integer DEFAULT nextval('sites_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  name character varying(255) NOT NULL,
  address text,
  city character varying(100),
  state character varying(100),
  zip_code character varying(20),
  country character varying(100) DEFAULT 'USA'::character varying,
  site_manager_id integer,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  gps_coordinates character varying(50),
  contact_name character varying(100),
  contact_phone character varying(20),
  contact_email character varying(100),
  start_date date,
  end_date date,
  status character varying(20) DEFAULT 'active'::character varying,
  description text,
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (site_manager_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: teams
CREATE TABLE IF NOT EXISTS teams (
  id integer DEFAULT nextval('teams_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  name character varying(255) NOT NULL,
  description text,
  leader_id integer,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (leader_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id integer DEFAULT nextval('email_templates_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  template_name character varying(255) NOT NULL,
  subject character varying(255) NOT NULL,
  body_html text,
  body_text text,
  template_variables text[],
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: hazard_reports
CREATE TABLE IF NOT EXISTS hazard_reports (
  id integer DEFAULT nextval('hazard_reports_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  reporter_id integer,
  team_id integer,
  title character varying(255) NOT NULL,
  description text NOT NULL,
  location character varying(255),
  severity hazard_severity NOT NULL,
  status hazard_status DEFAULT 'open'::hazard_status,
  photo_urls text[],
  priority_score integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  weather_conditions character varying(100),
  reported_by_id integer,
  gps_coordinates character varying(50),
  hazard_type character varying(50),
  recommended_action text,
  video_ids jsonb DEFAULT '[]'::jsonb,
  resolved_at timestamp without time zone,
  is_active boolean DEFAULT true,
  PRIMARY KEY (id),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (reported_by_id) REFERENCES users(id)
);

-- Table: hazard_assignments
CREATE TABLE IF NOT EXISTS hazard_assignments (
  id integer DEFAULT nextval('hazard_assignments_id_seq'::regclass) NOT NULL,
  hazard_id integer,
  assigned_to integer,
  assigned_by integer,
  assigned_at timestamp without time zone DEFAULT now(),
  due_date timestamp without time zone,
  completed_at timestamp without time zone,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (hazard_id) REFERENCES hazard_reports(id)
);

-- Table: hazard_comments
CREATE TABLE IF NOT EXISTS hazard_comments (
  id integer DEFAULT nextval('hazard_comments_id_seq'::regclass) NOT NULL,
  hazard_id integer,
  user_id integer,
  comment text NOT NULL,
  photo_urls text[],
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (hazard_id) REFERENCES hazard_reports(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: incident_reports
CREATE TABLE IF NOT EXISTS incident_reports (
  id integer DEFAULT nextval('incident_reports_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  reporter_id integer,
  incident_type character varying(255) NOT NULL,
  title character varying(255) NOT NULL,
  description text NOT NULL,
  location character varying(255),
  incident_date timestamp without time zone NOT NULL,
  severity incident_severity NOT NULL,
  status incident_status DEFAULT 'reported'::incident_status,
  injuries_count integer DEFAULT 0,
  property_damage numeric DEFAULT 0,
  witnesses text[],
  immediate_actions text,
  photo_urls text[],
  assigned_investigator integer,
  investigation_notes text,
  root_cause text,
  corrective_actions text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_investigator) REFERENCES users(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: inspection_templates
CREATE TABLE IF NOT EXISTS inspection_templates (
  id integer DEFAULT nextval('inspection_templates_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  name character varying(255) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: inspections
CREATE TABLE IF NOT EXISTS inspections (
  id integer DEFAULT nextval('inspections_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  template_id integer,
  inspector_id integer,
  team_id integer,
  title character varying(255) NOT NULL,
  status inspection_status DEFAULT 'scheduled'::inspection_status,
  scheduled_date timestamp without time zone,
  completed_date timestamp without time zone,
  notes text,
  overall_score numeric,
  created_at timestamp without time zone DEFAULT now(),
  inspection_type character varying(50),
  description text,
  result character varying(20),
  findings text,
  photo_urls jsonb DEFAULT '[]'::jsonb,
  video_ids jsonb DEFAULT '[]'::jsonb,
  document_urls jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  due_date timestamp without time zone,
  started_at timestamp without time zone,
  assigned_to_id integer,
  PRIMARY KEY (id),
  FOREIGN KEY (inspector_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- Table: inspection_sections
CREATE TABLE IF NOT EXISTS inspection_sections (
  id integer DEFAULT nextval('inspection_sections_id_seq'::regclass) NOT NULL,
  template_id integer,
  section_name character varying(255) NOT NULL,
  section_order integer DEFAULT 0,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id)
);

-- Table: inspection_items
CREATE TABLE IF NOT EXISTS inspection_items (
  id integer DEFAULT nextval('inspection_items_id_seq'::regclass) NOT NULL,
  section_id integer,
  item_text text NOT NULL,
  item_type character varying(50) DEFAULT 'checklist'::character varying,
  is_required boolean DEFAULT false,
  item_order integer DEFAULT 0,
  points integer DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (section_id) REFERENCES inspection_sections(id)
);

-- Table: inspection_checklist_items
CREATE TABLE IF NOT EXISTS inspection_checklist_items (
  id integer DEFAULT nextval('inspection_checklist_items_id_seq'::regclass) NOT NULL,
  inspection_id integer,
  item_id integer,
  status character varying(50) DEFAULT 'pending'::character varying,
  notes text,
  photo_urls text[],
  checked_by integer,
  checked_at timestamp without time zone,
  PRIMARY KEY (id),
  FOREIGN KEY (checked_by) REFERENCES users(id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id),
  FOREIGN KEY (item_id) REFERENCES inspection_items(id)
);

-- Table: inspection_findings
CREATE TABLE IF NOT EXISTS inspection_findings (
  id integer DEFAULT nextval('inspection_findings_id_seq'::regclass) NOT NULL,
  inspection_id integer,
  finding_type character varying(100) NOT NULL,
  severity character varying(50) DEFAULT 'medium'::character varying,
  description text NOT NULL,
  location character varying(255),
  corrective_action text,
  assigned_to integer,
  due_date timestamp without time zone,
  status character varying(50) DEFAULT 'open'::character varying,
  photo_urls text[],
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);

-- Table: inspection_questions
CREATE TABLE IF NOT EXISTS inspection_questions (
  id integer DEFAULT nextval('inspection_questions_id_seq'::regclass) NOT NULL,
  template_id integer,
  question_text text NOT NULL,
  question_type character varying(50) NOT NULL,
  options text[],
  is_required boolean DEFAULT false,
  order_index integer DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id)
);

-- Table: inspection_responses
CREATE TABLE IF NOT EXISTS inspection_responses (
  id integer DEFAULT nextval('inspection_responses_id_seq'::regclass) NOT NULL,
  inspection_id integer,
  question_id integer,
  response_text text,
  response_value numeric,
  photo_urls text[],
  notes text,
  PRIMARY KEY (id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id),
  FOREIGN KEY (question_id) REFERENCES inspection_questions(id)
);

-- Table: migration_history
CREATE TABLE IF NOT EXISTS migration_history (
  id integer DEFAULT nextval('migration_history_id_seq'::regclass) NOT NULL,
  migration_name character varying(255) NOT NULL,
  applied_at timestamp without time zone DEFAULT now(),
  checksum character varying(64),
  execution_time_ms integer,
  status character varying(20) DEFAULT 'completed'::character varying,
  PRIMARY KEY (id)
);

-- Table: permit_requests
CREATE TABLE IF NOT EXISTS permit_requests (
  id integer DEFAULT nextval('permit_requests_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  requester_id integer,
  permit_type character varying(255) NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  status permit_status DEFAULT 'requested'::permit_status,
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  approved_by integer,
  approved_at timestamp without time zone,
  conditions text,
  attachments text[],
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: report_history
CREATE TABLE IF NOT EXISTS report_history (
  id integer DEFAULT nextval('report_history_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  generated_by integer,
  site_id integer,
  report_name character varying(255) NOT NULL,
  start_date date,
  end_date date,
  file_path text,
  generated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (generated_by) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id integer DEFAULT nextval('role_permissions_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  role user_role NOT NULL,
  permission_name character varying(100) NOT NULL,
  resource_type character varying(100) NOT NULL,
  can_create boolean DEFAULT false,
  can_read boolean DEFAULT false,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: site_personnel
CREATE TABLE IF NOT EXISTS site_personnel (
  id integer DEFAULT nextval('site_personnel_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  site_id integer,
  user_id integer,
  role site_role DEFAULT 'worker'::site_role,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  emergency_contact character varying(255),
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: subcontractors
CREATE TABLE IF NOT EXISTS subcontractors (
  id integer DEFAULT nextval('subcontractors_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  company_name character varying(255) NOT NULL,
  contact_person character varying(255),
  email character varying(255),
  phone character varying(50),
  address text,
  license_number character varying(100),
  insurance_expiry date,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: system_logs
CREATE TABLE IF NOT EXISTS system_logs (
  id integer DEFAULT nextval('system_logs_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  user_id integer,
  action character varying(255) NOT NULL,
  resource_type character varying(100),
  resource_id integer,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp without time zone DEFAULT now(),
  entity_type text,
  entity_id text,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: team_members
CREATE TABLE IF NOT EXISTS team_members (
  id integer DEFAULT nextval('team_members_id_seq'::regclass) NOT NULL,
  team_id integer,
  user_id integer,
  site_role site_role DEFAULT 'worker'::site_role,
  joined_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: training_courses
CREATE TABLE IF NOT EXISTS training_courses (
  id integer DEFAULT nextval('training_courses_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  title character varying(255) NOT NULL,
  description text,
  duration_minutes integer,
  required_roles text[],
  is_mandatory boolean DEFAULT false,
  expiry_months integer,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: training_content
CREATE TABLE IF NOT EXISTS training_content (
  id integer DEFAULT nextval('training_content_id_seq'::regclass) NOT NULL,
  course_id integer,
  content_type character varying(50) NOT NULL,
  content_url text,
  content_text text,
  order_index integer DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (course_id) REFERENCES training_courses(id)
);

-- Table: training_records
CREATE TABLE IF NOT EXISTS training_records (
  id integer DEFAULT nextval('training_records_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  user_id integer,
  course_id integer,
  assigned_date timestamp without time zone DEFAULT now(),
  started_date timestamp without time zone,
  completed_date timestamp without time zone,
  score numeric,
  status character varying(50) DEFAULT 'assigned'::character varying,
  expires_at timestamp without time zone,
  assigned_by integer,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES training_courses(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON public.email_templates USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_hazard_type ON public.hazard_reports USING btree (hazard_type);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_reported_by ON public.hazard_reports USING btree (reported_by_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_resolved_at ON public.hazard_reports USING btree (resolved_at);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON public.hazard_reports USING btree (status);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_tenant_site ON public.hazard_reports USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_site ON public.incident_reports USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_inspection_checklist_items_inspection ON public.inspection_checklist_items USING btree (inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_findings_inspection ON public.inspection_findings USING btree (inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_section ON public.inspection_items USING btree (section_id);
CREATE INDEX IF NOT EXISTS idx_inspection_questions_template ON public.inspection_questions USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_inspections_assigned_to ON public.inspections USING btree (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_inspections_due_date ON public.inspections USING btree (due_date);
CREATE INDEX IF NOT EXISTS idx_inspection_sections_template ON public.inspection_sections USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_type ON public.inspections USING btree (inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_site ON public.inspections USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_permit_requests_tenant_site ON public.permit_requests USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant_role ON public.role_permissions USING btree (tenant_id, role);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.user_sessions USING btree (expire);
CREATE INDEX IF NOT EXISTS idx_site_personnel_site_user ON public.site_personnel USING btree (site_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sites_contact_email ON public.sites USING btree (contact_email);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites USING btree (status);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON public.sites USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_tenant ON public.subcontractors USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant_user ON public.system_logs USING btree (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON public.team_members USING btree (team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_country ON public.tenants USING btree (country);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants USING btree (subscription_status);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON public.training_records USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_users_certification_expiry ON public.users USING btree (safety_certification_expiry) WHERE (safety_certification_expiry IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users USING btree (department);
CREATE INDEX IF NOT EXISTS idx_users_job_title ON public.users USING btree (job_title);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users USING btree (tenant_id);

-- Database Schema Export - FIXED VERSION
-- Generated at 2025-06-06T07:04:23.024Z

-- Enum Types
DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('yes', 'no', 'na', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
    CREATE TYPE inspection_item_type AS ENUM ('yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text');
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
CREATE SEQUENCE IF NOT EXISTS user_preferences_id_seq;
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
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  logo text,
  subscription_plan subscription_plan DEFAULT 'basic'::subscription_plan NOT NULL,
  subscription_status text DEFAULT 'active'::text NOT NULL,
  subscription_end_date timestamp without time zone,
  active_users integer DEFAULT 0 NOT NULL,
  max_users integer DEFAULT 5 NOT NULL,
  active_sites integer DEFAULT 0 NOT NULL,
  max_sites integer DEFAULT 1 NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  stripe_customer_id text,
  settings jsonb,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id)
);

-- Table: users (create early as it's referenced by many tables)
CREATE TABLE IF NOT EXISTS users (
  id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  username text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role DEFAULT 'employee'::user_role NOT NULL,
  phone text,
  job_title text,
  department text,
  profile_image_url text,
  permissions jsonb,
  is_active boolean DEFAULT true NOT NULL,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  mobile_token text,
  last_mobile_login timestamp without time zone,
  emergency_contact text,
  safety_certification_expiry date,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: sites
CREATE TABLE IF NOT EXISTS sites (
  id integer DEFAULT nextval('sites_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL,
  gps_coordinates text,
  contact_name text,
  contact_phone text,
  contact_email text,
  start_date date,
  end_date date,
  status text DEFAULT 'active'::text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: teams
CREATE TABLE IF NOT EXISTS teams (
  id integer DEFAULT nextval('teams_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  site_id integer NOT NULL,
  name text NOT NULL,
  description text,
  leader_id integer,
  color text,
  specialties jsonb,
  created_by_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (leader_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id integer DEFAULT nextval('email_templates_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: subcontractors
CREATE TABLE IF NOT EXISTS subcontractors (
  id integer DEFAULT nextval('subcontractors_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  contract_number text,
  contract_start_date date,
  contract_end_date date,
  services_provided text,
  status text DEFAULT 'active'::text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: hazard_reports
CREATE TABLE IF NOT EXISTS hazard_reports (
  id integer DEFAULT nextval('hazard_reports_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  site_id integer NOT NULL,
  reported_by_id integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  gps_coordinates text,
  hazard_type text NOT NULL,
  severity hazard_severity NOT NULL,
  status hazard_status DEFAULT 'open'::hazard_status NOT NULL,
  recommended_action text,
  photo_urls jsonb,
  video_ids jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  resolved_at timestamp without time zone,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (reported_by_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: hazard_assignments
CREATE TABLE IF NOT EXISTS hazard_assignments (
  id integer DEFAULT nextval('hazard_assignments_id_seq'::regclass) NOT NULL,
  hazard_id integer NOT NULL,
  assigned_by_id integer NOT NULL,
  assigned_to_user_id integer,
  assigned_to_subcontractor_id integer,
  assigned_at timestamp without time zone DEFAULT now() NOT NULL,
  due_date timestamp without time zone,
  status hazard_status DEFAULT 'assigned'::hazard_status NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_by_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to_subcontractor_id) REFERENCES subcontractors(id),
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
  FOREIGN KEY (hazard_id) REFERENCES hazard_reports(id)
);

-- Table: hazard_comments
CREATE TABLE IF NOT EXISTS hazard_comments (
  id integer DEFAULT nextval('hazard_comments_id_seq'::regclass) NOT NULL,
  hazard_id integer NOT NULL,
  user_id integer NOT NULL,
  comment text NOT NULL,
  attachment_urls jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (hazard_id) REFERENCES hazard_reports(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: incident_reports
CREATE TABLE IF NOT EXISTS incident_reports (
  id integer DEFAULT nextval('incident_reports_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  site_id integer NOT NULL,
  reported_by_id integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  incident_date timestamp without time zone NOT NULL,
  location text NOT NULL,
  incident_type text NOT NULL,
  severity incident_severity NOT NULL,
  status incident_status DEFAULT 'reported'::incident_status NOT NULL,
  injury_occurred boolean DEFAULT false NOT NULL,
  injury_details text,
  witnesses jsonb,
  root_cause text,
  corrective_actions text,
  preventative_measures text,
  photo_urls jsonb,
  video_ids jsonb,
  document_urls jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (reported_by_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: inspection_templates
CREATE TABLE IF NOT EXISTS inspection_templates (
  id integer DEFAULT nextval('inspection_templates_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  version text DEFAULT '1.0'::text,
  is_default boolean DEFAULT false,
  created_by_id integer,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: inspection_checklist_items
CREATE TABLE IF NOT EXISTS inspection_checklist_items (
  id integer DEFAULT nextval('inspection_checklist_items_id_seq'::regclass) NOT NULL,
  template_id integer NOT NULL,
  category text,
  question text NOT NULL,
  description text,
  expected_answer text DEFAULT 'yes'::text,
  is_critical boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id)
);

-- Table: inspections
CREATE TABLE IF NOT EXISTS inspections (
  id integer DEFAULT nextval('inspections_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  site_id integer NOT NULL,
  template_id integer,
  title text NOT NULL,
  description text,
  scheduled_date timestamp without time zone,
  due_date timestamp without time zone,
  assigned_to_id integer,
  created_by_id integer NOT NULL,
  completed_by_id integer,
  completed_date timestamp without time zone,
  location text,
  status inspection_status NOT NULL,
  score integer,
  max_score integer,
  notes text,
  photo_urls jsonb,
  document_urls jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  inspector_id integer,
  inspection_type text DEFAULT 'routine'::text NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  FOREIGN KEY (completed_by_id) REFERENCES users(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: inspection_findings
CREATE TABLE IF NOT EXISTS inspection_findings (
  id integer DEFAULT nextval('inspection_findings_id_seq'::regclass) NOT NULL,
  inspection_id integer NOT NULL,
  description text NOT NULL,
  severity hazard_severity DEFAULT 'medium'::hazard_severity NOT NULL,
  location text,
  photo_urls jsonb,
  recommended_action text,
  due_date timestamp without time zone,
  assigned_to_id integer,
  status hazard_status DEFAULT 'open'::hazard_status NOT NULL,
  created_by_id integer NOT NULL,
  resolved_by_id integer,
  resolved_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id),
  FOREIGN KEY (resolved_by_id) REFERENCES users(id)
);

-- Table: inspection_sections
CREATE TABLE IF NOT EXISTS inspection_sections (
  id integer DEFAULT nextval('inspection_sections_id_seq'::regclass) NOT NULL,
  template_id integer NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0 NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (template_id) REFERENCES inspection_templates(id)
);

-- Table: inspection_items
CREATE TABLE IF NOT EXISTS inspection_items (
  id integer DEFAULT nextval('inspection_items_id_seq'::regclass) NOT NULL,
  section_id integer NOT NULL,
  question text NOT NULL,
  type inspection_item_type DEFAULT 'yes_no'::inspection_item_type NOT NULL,
  description text,
  required boolean DEFAULT true NOT NULL,
  category text,
  options jsonb,
  order_index integer DEFAULT 0 NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (section_id) REFERENCES inspection_sections(id)
);

-- Table: inspection_responses
CREATE TABLE IF NOT EXISTS inspection_responses (
  id integer DEFAULT nextval('inspection_responses_id_seq'::regclass) NOT NULL,
  inspection_id integer NOT NULL,
  checklist_item_id integer NOT NULL,
  response compliance_status NOT NULL,
  notes text,
  photo_urls jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (checklist_item_id) REFERENCES inspection_checklist_items(id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
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
  tenant_id integer NOT NULL,
  site_id integer NOT NULL,
  requester_id integer NOT NULL,
  approver_id integer,
  permit_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  start_date timestamp without time zone NOT NULL,
  end_date timestamp without time zone NOT NULL,
  status permit_status DEFAULT 'requested'::permit_status NOT NULL,
  approval_date timestamp without time zone,
  denial_reason text,
  attachment_urls jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (approver_id) REFERENCES users(id),
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: report_history
CREATE TABLE IF NOT EXISTS report_history (
  id integer DEFAULT nextval('report_history_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  user_id integer NOT NULL,
  site_id integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  report_name text NOT NULL,
  report_url text,
  status text DEFAULT 'generated'::text NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id integer DEFAULT nextval('role_permissions_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  role user_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: site_personnel
CREATE TABLE IF NOT EXISTS site_personnel (
  id integer DEFAULT nextval('site_personnel_id_seq'::regclass) NOT NULL,
  site_id integer NOT NULL,
  user_id integer NOT NULL,
  tenant_id integer NOT NULL,
  site_role site_role DEFAULT 'worker'::site_role NOT NULL,
  assigned_by_id integer NOT NULL,
  start_date date,
  end_date date,
  permissions jsonb,
  team_id integer,
  notes text,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (assigned_by_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: system_logs
CREATE TABLE IF NOT EXISTS system_logs (
  id integer DEFAULT nextval('system_logs_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  user_id integer,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: training_content
CREATE TABLE IF NOT EXISTS training_content (
  id integer DEFAULT nextval('training_content_id_seq'::regclass) NOT NULL,
  tenant_id integer,
  title text NOT NULL,
  description text NOT NULL,
  content_type text NOT NULL,
  video_id text,
  document_url text,
  language text DEFAULT 'en'::text NOT NULL,
  duration integer,
  is_common boolean DEFAULT false NOT NULL,
  created_by_id integer,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: training_courses
CREATE TABLE IF NOT EXISTS training_courses (
  id integer DEFAULT nextval('training_courses_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  passing_score integer DEFAULT 70 NOT NULL,
  is_required boolean DEFAULT false NOT NULL,
  assigned_roles jsonb,
  assigned_site_ids jsonb,
  assigned_subcontractor_ids jsonb,
  content_ids jsonb,
  created_by_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table: training_records
CREATE TABLE IF NOT EXISTS training_records (
  id integer DEFAULT nextval('training_records_id_seq'::regclass) NOT NULL,
  tenant_id integer NOT NULL,
  user_id integer NOT NULL,
  course_id integer NOT NULL,
  start_date timestamp without time zone DEFAULT now() NOT NULL,
  completion_date timestamp without time zone,
  score integer,
  passed boolean,
  certificate_url text,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (course_id) REFERENCES training_courses(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id integer DEFAULT nextval('user_preferences_id_seq'::regclass) NOT NULL,
  user_id integer NOT NULL,
  theme text DEFAULT 'light'::text,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  language text DEFAULT 'en'::text,
  timezone text DEFAULT 'UTC'::text,
  dashboard_layout jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hazard_assignments_hazard_id ON public.hazard_assignments USING btree (hazard_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_severity ON public.hazard_reports USING btree (severity);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON public.hazard_reports USING btree (status);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_tenant_site ON public.hazard_reports USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports USING btree (severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_site ON public.incident_reports USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_inspection_responses_inspection_id ON public.inspection_responses USING btree (inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections USING btree (status);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_site ON public.inspections USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_permit_requests_status ON public.permit_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_permit_requests_tenant_site ON public.permit_requests USING btree (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_site_personnel_site_id ON public.site_personnel USING btree (site_id);
CREATE INDEX IF NOT EXISTS idx_site_personnel_user_id ON public.site_personnel USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites USING btree (status);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON public.sites USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant_id ON public.system_logs USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_teams_site_id ON public.teams USING btree (site_id);
CREATE INDEX IF NOT EXISTS idx_training_records_course ON public.training_records USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON public.training_records USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON public.user_sessions USING btree (expire);
CREATE INDEX IF NOT EXISTS idx_users_mobile_token ON public.users USING btree (mobile_token) WHERE (mobile_token IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users USING btree (tenant_id);

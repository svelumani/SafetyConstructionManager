-- Add missing tables to complete MySafety schema

-- Add team_members table (critical for team functionality)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  site_role site_role DEFAULT 'worker',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Add inspection_questions table (needed for inspection templates)
CREATE TABLE IF NOT EXISTS inspection_questions (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES inspection_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options TEXT[],
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Add email_templates table (for notification system)
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body_html TEXT,
  body_text TEXT,
  template_variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add role_permissions table (for access control)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, role, permission_name, resource_type)
);

-- Add system_logs table (for audit trails)
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_inspection_questions_template ON inspection_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant_role ON role_permissions(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant_user ON system_logs(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- Log this migration
INSERT INTO migration_history (migration_name) VALUES ('002_add_missing_tables')
ON CONFLICT (migration_name) DO NOTHING;
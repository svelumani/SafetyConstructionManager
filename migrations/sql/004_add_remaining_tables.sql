-- Add the remaining missing tables for complete MySafety platform

-- Inspection system expansion tables
CREATE TABLE IF NOT EXISTS inspection_sections (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES inspection_templates(id) ON DELETE CASCADE,
  section_name VARCHAR(255) NOT NULL,
  section_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES inspection_sections(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  item_type VARCHAR(50) DEFAULT 'checklist',
  is_required BOOLEAN DEFAULT false,
  item_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inspection_checklist_items (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES inspection_items(id),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  photo_urls TEXT[],
  checked_by INTEGER REFERENCES users(id),
  checked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_findings (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
  finding_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  description TEXT NOT NULL,
  location VARCHAR(255),
  corrective_action TEXT,
  assigned_to INTEGER REFERENCES users(id),
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open',
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Personnel management tables
CREATE TABLE IF NOT EXISTS site_personnel (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role site_role DEFAULT 'worker',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  emergency_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, user_id)
);

CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  license_number VARCHAR(100),
  insurance_expiry DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspection_sections_template ON inspection_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_section ON inspection_items(section_id);
CREATE INDEX IF NOT EXISTS idx_inspection_checklist_items_inspection ON inspection_checklist_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_findings_inspection ON inspection_findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_site_personnel_site_user ON site_personnel(site_id, user_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_tenant ON subcontractors(tenant_id);
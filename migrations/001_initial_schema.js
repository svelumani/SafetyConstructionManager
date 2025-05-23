/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create enums
  pgm.createType('user_role', ['super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee']);
  pgm.createType('site_role', ['site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor']);
  pgm.createType('hazard_severity', ['low', 'medium', 'high', 'critical']);
  pgm.createType('hazard_status', ['open', 'assigned', 'in_progress', 'resolved', 'closed']);
  pgm.createType('inspection_status', ['scheduled', 'in_progress', 'completed', 'canceled']);
  pgm.createType('permit_status', ['requested', 'approved', 'denied', 'expired']);
  pgm.createType('incident_severity', ['minor', 'moderate', 'major', 'critical']);
  pgm.createType('incident_status', ['reported', 'investigating', 'resolved', 'closed']);
  pgm.createType('subscription_plan', ['basic', 'standard', 'premium', 'enterprise']);

  // Create tenants table
  pgm.createTable('tenants', {
    id: 'id',
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    phone: 'text',
    address: 'text',
    city: 'text',
    state: 'text',
    zip_code: 'text',
    country: 'text',
    logo: 'text',
    subscription_plan: { type: 'subscription_plan', notNull: true, default: 'basic' },
    subscription_status: { type: 'text', notNull: true, default: 'active' },
    subscription_end_date: 'timestamp',
    active_users: { type: 'integer', notNull: true, default: 0 },
    max_users: { type: 'integer', notNull: true, default: 5 },
    active_sites: { type: 'integer', notNull: true, default: 0 },
    max_sites: { type: 'integer', notNull: true, default: 1 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    stripe_customer_id: 'text',
    settings: 'jsonb',
    is_active: { type: 'boolean', notNull: true, default: true }
  });

  // Create users table
  pgm.createTable('users', {
    id: 'id',
    tenant_id: { type: 'integer', notNull: true, references: 'tenants(id)', onDelete: 'cascade' },
    username: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    password: { type: 'text', notNull: true },
    first_name: 'text',
    last_name: 'text',
    phone: 'text',
    role: { type: 'user_role', notNull: true, default: 'employee' },
    is_active: { type: 'boolean', notNull: true, default: true },
    last_login: 'timestamp',
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    avatar: 'text',
    emergency_contact_name: 'text',
    emergency_contact_phone: 'text'
  });

  // Add unique constraints for users
  pgm.addConstraint('users', 'users_tenant_username_unique', 'UNIQUE(tenant_id, username)');
  pgm.addConstraint('users', 'users_tenant_email_unique', 'UNIQUE(tenant_id, email)');

  // Create sites table
  pgm.createTable('sites', {
    id: 'id',
    tenant_id: { type: 'integer', notNull: true, references: 'tenants(id)', onDelete: 'cascade' },
    name: { type: 'text', notNull: true },
    address: { type: 'text', notNull: true },
    city: 'text',
    state: 'text',
    zip_code: 'text',
    country: 'text',
    latitude: 'decimal(10,8)',
    longitude: 'decimal(11,8)',
    description: 'text',
    site_manager_id: { type: 'integer', references: 'users(id)' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    contact_phone: 'text',
    contact_email: 'text',
    emergency_procedures: 'text',
    safety_protocols: 'jsonb'
  });

  // Create hazards table
  pgm.createTable('hazards', {
    id: 'id',
    tenant_id: { type: 'integer', notNull: true, references: 'tenants(id)', onDelete: 'cascade' },
    site_id: { type: 'integer', notNull: true, references: 'sites(id)', onDelete: 'cascade' },
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    severity: { type: 'hazard_severity', notNull: true },
    status: { type: 'hazard_status', notNull: true, default: 'open' },
    location: 'text',
    reported_by: { type: 'integer', notNull: true, references: 'users(id)' },
    assigned_to: { type: 'integer', references: 'users(id)' },
    photo_urls: 'text[]',
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    resolved_at: 'timestamp',
    priority: { type: 'integer', default: 1 },
    corrective_actions: 'text',
    due_date: 'timestamp'
  });

  console.log('✅ MySafety core tables created successfully!');
};

exports.down = pgm => {
  pgm.dropTable('hazards');
  pgm.dropTable('sites');
  pgm.dropTable('users');
  pgm.dropTable('tenants');
  
  pgm.dropType('subscription_plan');
  pgm.dropType('incident_status');
  pgm.dropType('incident_severity');
  pgm.dropType('permit_status');
  pgm.dropType('inspection_status');
  pgm.dropType('hazard_status');
  pgm.dropType('hazard_severity');
  pgm.dropType('site_role');
  pgm.dropType('user_role');
};
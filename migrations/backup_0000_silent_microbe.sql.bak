-- Create enum types
CREATE TYPE "user_role" AS ENUM ('super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee');
CREATE TYPE "hazard_severity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "hazard_status" AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE "inspection_status" AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE "permit_status" AS ENUM ('requested', 'approved', 'denied', 'expired');
CREATE TYPE "incident_severity" AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE "subscription_plan" AS ENUM ('basic', 'standard', 'premium', 'enterprise');

-- Create tenants table
CREATE TABLE "tenants" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip_code" TEXT,
  "country" TEXT,
  "logo" TEXT,
  "subscription_plan" "subscription_plan" NOT NULL DEFAULT 'basic',
  "subscription_status" TEXT NOT NULL DEFAULT 'active',
  "subscription_end_date" TIMESTAMP,
  "active_users" INTEGER NOT NULL DEFAULT 0,
  "max_users" INTEGER NOT NULL DEFAULT 5,
  "active_sites" INTEGER NOT NULL DEFAULT 0,
  "max_sites" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "stripe_customer_id" TEXT,
  "settings" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create users table
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "username" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'employee',
  "phone" TEXT,
  "job_title" TEXT,
  "department" TEXT,
  "profile_image_url" TEXT,
  "permissions" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "last_login" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create sites table
CREATE TABLE "sites" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip_code" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "gps_coordinates" TEXT,
  "contact_name" TEXT,
  "contact_phone" TEXT,
  "contact_email" TEXT,
  "start_date" DATE,
  "end_date" DATE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "description" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create subcontractors table
CREATE TABLE "subcontractors" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "contact_person" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip_code" TEXT,
  "country" TEXT,
  "contract_number" TEXT,
  "contract_start_date" DATE,
  "contract_end_date" DATE,
  "services_provided" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create hazard_reports table
CREATE TABLE "hazard_reports" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "site_id" INTEGER NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "reported_by_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "gps_coordinates" TEXT,
  "hazard_type" TEXT NOT NULL,
  "severity" "hazard_severity" NOT NULL,
  "status" "hazard_status" NOT NULL DEFAULT 'open',
  "recommended_action" TEXT,
  "photo_urls" JSONB,
  "video_ids" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "resolved_at" TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create hazard_assignments table
CREATE TABLE "hazard_assignments" (
  "id" SERIAL PRIMARY KEY,
  "hazard_id" INTEGER NOT NULL REFERENCES "hazard_reports"("id") ON DELETE CASCADE,
  "assigned_by_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "assigned_to_user_id" INTEGER REFERENCES "users"("id"),
  "assigned_to_subcontractor_id" INTEGER REFERENCES "subcontractors"("id"),
  "assigned_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "due_date" TIMESTAMP,
  "status" "hazard_status" NOT NULL DEFAULT 'assigned',
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create hazard_comments table
CREATE TABLE "hazard_comments" (
  "id" SERIAL PRIMARY KEY,
  "hazard_id" INTEGER NOT NULL REFERENCES "hazard_reports"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "comment" TEXT NOT NULL,
  "attachment_urls" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create inspections table
CREATE TABLE "inspections" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "site_id" INTEGER NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "inspector_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "inspection_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "scheduled_date" TIMESTAMP NOT NULL,
  "completed_date" TIMESTAMP,
  "status" "inspection_status" NOT NULL DEFAULT 'pending',
  "result" TEXT,
  "findings" JSONB,
  "photo_urls" JSONB,
  "video_ids" JSONB,
  "document_urls" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create permit_requests table
CREATE TABLE "permit_requests" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "site_id" INTEGER NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "requester_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "approver_id" INTEGER REFERENCES "users"("id"),
  "permit_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "status" "permit_status" NOT NULL DEFAULT 'requested',
  "approval_date" TIMESTAMP,
  "denial_reason" TEXT,
  "attachment_urls" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create incident_reports table
CREATE TABLE "incident_reports" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "site_id" INTEGER NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "reported_by_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "incident_date" TIMESTAMP NOT NULL,
  "location" TEXT NOT NULL,
  "incident_type" TEXT NOT NULL,
  "severity" "incident_severity" NOT NULL,
  "injury_occurred" BOOLEAN NOT NULL DEFAULT FALSE,
  "injury_details" TEXT,
  "witnesses" JSONB,
  "root_cause" TEXT,
  "corrective_actions" TEXT,
  "preventative_measures" TEXT,
  "photo_urls" JSONB,
  "video_ids" JSONB,
  "document_urls" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create training_content table
CREATE TABLE "training_content" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "content_type" TEXT NOT NULL,
  "video_id" TEXT,
  "document_url" TEXT,
  "language" TEXT NOT NULL DEFAULT 'en',
  "duration" INTEGER,
  "is_common" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_by_id" INTEGER REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create training_courses table
CREATE TABLE "training_courses" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "passing_score" INTEGER NOT NULL DEFAULT 70,
  "is_required" BOOLEAN NOT NULL DEFAULT FALSE,
  "assigned_roles" JSONB,
  "assigned_site_ids" JSONB,
  "assigned_subcontractor_ids" JSONB,
  "content_ids" JSONB,
  "created_by_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create training_records table
CREATE TABLE "training_records" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" INTEGER NOT NULL REFERENCES "training_courses"("id") ON DELETE CASCADE,
  "start_date" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completion_date" TIMESTAMP,
  "score" INTEGER,
  "passed" BOOLEAN,
  "certificate_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create system_logs table
CREATE TABLE "system_logs" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "user_id" INTEGER REFERENCES "users"("id"),
  "action" TEXT NOT NULL,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "details" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE "email_templates" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create role_permissions table
CREATE TABLE "role_permissions" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "role" "user_role" NOT NULL,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE("tenant_id", "role", "resource", "action")
);

-- Create sessions table for express-session
CREATE TABLE "user_sessions" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX "IDX_user_sessions_expire" ON "user_sessions" ("expire");

-- Insert default super admin user
INSERT INTO "users" ("username", "email", "password", "first_name", "last_name", "role")
VALUES ('superadmin', 'admin@mysafety.com', 'c9ab78209c4c4e546fd06e85a60dd02ff3c969f0c9d1e0526f6d52815a6399c9a0a4f9eb90ed73b3e3ba2b1dc46e1efcd4e47fd2de65f64cf12b7722e34fd320.69ec746c1b00f94ebc82a2b40fbd69c9', 'Super', 'Admin', 'super_admin');

-- Insert default email templates
INSERT INTO "email_templates" ("name", "subject", "body", "is_default")
VALUES 
('hazard_notification', 'Safety Alert: New Hazard Reported [{{hazardId}}]', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #e63946;">Safety Alert: New Hazard Reported</h2><p>A new hazard has been reported that requires your attention.</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Hazard ID:</strong> {{hazardId}}</p><p><strong>Title:</strong> {{hazardTitle}}</p><p><strong>Location:</strong> {{hazardLocation}}</p><p><strong>Severity:</strong> <span style="color: {{#eq hazardSeverity "critical"}}#e63946{{else}}{{#eq hazardSeverity "high"}}#f4a261{{else}}#2a9d8f{{/eq}}{{/eq}};">{{hazardSeverity}}</span></p><p><strong>Reported By:</strong> {{reportedBy}}</p><p><strong>Date Reported:</strong> {{reportedDate}}</p></div><p>Please take immediate action to address this hazard. Click the button below to view the details and respond.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Hazard Details</a></p><p>Thank you for your prompt attention to this safety concern.</p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('user_registration', 'Welcome to MySafety - Your Account Details', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #2563eb;">Welcome to MySafety!</h2><p>Hello {{firstName}} {{lastName}},</p><p>Your account has been created in the MySafety platform. Use the following credentials to log in:</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Email:</strong> {{email}}</p><p><strong>Temporary Password:</strong> {{tempPassword}}</p></div><p>Please log in and change your password as soon as possible for security reasons.</p><p style="text-align: center;"><a href="{{loginLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a></p><p>If you have any questions or need assistance, please contact your system administrator.</p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('incident_notification', 'Incident Report: {{incidentTitle}}', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #e63946;">Incident Report: {{incidentTitle}}</h2><p>An incident has been reported that requires your attention.</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Incident ID:</strong> {{incidentId}}</p><p><strong>Title:</strong> {{incidentTitle}}</p><p><strong>Location:</strong> {{incidentLocation}}</p><p><strong>Date/Time:</strong> {{incidentDate}}</p><p><strong>Severity:</strong> <span style="color: {{#eq incidentSeverity "critical"}}#e63946{{else}}{{#eq incidentSeverity "major"}}#f4a261{{else}}#2a9d8f{{/eq}}{{/eq}};">{{incidentSeverity}}</span></p><p><strong>Reported By:</strong> {{reportedBy}}</p></div><p>Please review the incident details and ensure appropriate follow-up actions are taken.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Incident Details</a></p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('inspection_reminder', 'Reminder: Scheduled Inspection on {{scheduledDate}}', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #2563eb;">Inspection Reminder</h2><p>Hello {{inspectorName}},</p><p>This is a reminder that you have a scheduled inspection:</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Inspection:</strong> {{inspectionTitle}}</p><p><strong>Type:</strong> {{inspectionType}}</p><p><strong>Site:</strong> {{siteName}}</p><p><strong>Scheduled Date:</strong> {{scheduledDate}}</p></div><p>Please ensure you have all necessary equipment and documentation ready for the inspection.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Inspection Details</a></p><p>Regards,<br>The MySafety Team</p></div>', TRUE),

('permit_status_update', 'Permit Request Status Update: {{permitTitle}}', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"><h2 style="color: #2563eb;">Permit Status Update</h2><p>Hello {{requesterName}},</p><p>The status of your permit request has been updated:</p><div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;"><p><strong>Permit ID:</strong> {{permitId}}</p><p><strong>Title:</strong> {{permitTitle}}</p><p><strong>Type:</strong> {{permitType}}</p><p><strong>Status:</strong> <span style="color: {{#eq permitStatus "approved"}}#2a9d8f{{else}}{{#eq permitStatus "denied"}}#e63946{{else}}#f4a261{{/eq}}{{/eq}};">{{permitStatus}}</span></p>{{#if denialReason}}<p><strong>Reason:</strong> {{denialReason}}</p>{{/if}}</div><p>Please click the button below to view the complete details of this permit.</p><p style="text-align: center;"><a href="{{actionLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Permit Details</a></p><p>Regards,<br>The MySafety Team</p></div>', TRUE);

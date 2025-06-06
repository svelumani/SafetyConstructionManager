-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."compliance_status" AS ENUM('yes', 'no', 'na', 'partial');--> statement-breakpoint
CREATE TYPE "public"."hazard_severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."hazard_status" AS ENUM('closed', 'resolved', 'in_progress', 'assigned', 'open');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('critical', 'major', 'moderate', 'minor');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('closed', 'resolved', 'investigating', 'reported');--> statement-breakpoint
CREATE TYPE "public"."inspection_item_type" AS ENUM('yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('canceled', 'completed', 'in_progress', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."permit_status" AS ENUM('expired', 'denied', 'approved', 'requested');--> statement-breakpoint
CREATE TYPE "public"."site_role" AS ENUM('visitor', 'subcontractor', 'worker', 'foreman', 'safety_coordinator', 'site_manager');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('enterprise', 'premium', 'standard', 'basic');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employee', 'subcontractor', 'supervisor', 'safety_officer', 'super_admin');--> statement-breakpoint
CREATE SEQUENCE "public"."inspection_questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."team_members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "hazard_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"hazard_id" integer NOT NULL,
	"assigned_by_id" integer NOT NULL,
	"assigned_to_user_id" integer,
	"assigned_to_subcontractor_id" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"status" "hazard_status" DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hazard_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"reported_by_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"gps_coordinates" text,
	"hazard_type" text NOT NULL,
	"severity" "hazard_severity" NOT NULL,
	"status" "hazard_status" DEFAULT 'open' NOT NULL,
	"recommended_action" text,
	"photo_urls" jsonb,
	"video_ids" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hazard_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"hazard_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"comment" text NOT NULL,
	"attachment_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"inspection_id" integer NOT NULL,
	"description" text NOT NULL,
	"severity" "hazard_severity" DEFAULT 'medium' NOT NULL,
	"location" text,
	"photo_urls" jsonb,
	"recommended_action" text,
	"due_date" timestamp,
	"assigned_to_id" integer,
	"status" "hazard_status" DEFAULT 'open' NOT NULL,
	"created_by_id" integer NOT NULL,
	"resolved_by_id" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"question" text NOT NULL,
	"type" "inspection_item_type" DEFAULT 'yes_no' NOT NULL,
	"description" text,
	"required" boolean DEFAULT true NOT NULL,
	"category" text,
	"options" jsonb,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"inspection_id" integer NOT NULL,
	"checklist_item_id" integer NOT NULL,
	"response" "compliance_status" NOT NULL,
	"notes" text,
	"photo_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"category" text,
	"question" text NOT NULL,
	"description" text,
	"expected_answer" text DEFAULT 'yes',
	"is_critical" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"template_id" integer,
	"title" text NOT NULL,
	"description" text,
	"scheduled_date" timestamp,
	"due_date" timestamp,
	"assigned_to_id" integer,
	"created_by_id" integer NOT NULL,
	"completed_by_id" integer,
	"completed_date" timestamp,
	"location" text,
	"status" "inspection_status" NOT NULL,
	"score" integer,
	"max_score" integer,
	"notes" text,
	"photo_urls" jsonb,
	"document_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"inspector_id" integer
);
--> statement-breakpoint
CREATE TABLE "inspection_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "migration_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"migration_name" varchar(255) NOT NULL,
	"applied_at" timestamp DEFAULT now(),
	"checksum" varchar(64),
	"execution_time_ms" integer,
	"status" varchar(20) DEFAULT 'completed',
	CONSTRAINT "migration_history_migration_name_key" UNIQUE("migration_name")
);
--> statement-breakpoint
CREATE TABLE "report_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"report_name" text NOT NULL,
	"report_url" text,
	"status" text DEFAULT 'generated' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"version" text DEFAULT '1.0',
	"is_default" boolean DEFAULT false,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permit_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"approver_id" integer,
	"permit_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "permit_status" DEFAULT 'requested' NOT NULL,
	"approval_date" timestamp,
	"denial_reason" text,
	"attachment_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"leader_id" integer,
	"color" text,
	"specialties" jsonb,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"role" "user_role" NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "role_permissions_tenant_id_role_resource_action_key" UNIQUE("tenant_id","role","resource","action")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text NOT NULL,
	"gps_coordinates" text,
	"contact_name" text,
	"contact_phone" text,
	"contact_email" text,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content_type" text NOT NULL,
	"video_id" text,
	"document_url" text,
	"language" text DEFAULT 'en' NOT NULL,
	"duration" integer,
	"is_common" boolean DEFAULT false NOT NULL,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" integer,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcontractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"contract_number" text,
	"contract_start_date" date,
	"contract_end_date" date,
	"services_provided" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"assigned_roles" jsonb,
	"assigned_site_ids" jsonb,
	"assigned_subcontractor_ids" jsonb,
	"content_ids" jsonb,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"completion_date" timestamp,
	"score" integer,
	"passed" boolean,
	"certificate_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" text DEFAULT 'light',
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"dashboard_layout" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_key" UNIQUE("user_id"),
	CONSTRAINT "user_preferences_theme_check" CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text]))
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"logo" text,
	"subscription_plan" "subscription_plan" DEFAULT 'basic' NOT NULL,
	"subscription_status" text DEFAULT 'active' NOT NULL,
	"subscription_end_date" timestamp,
	"active_users" integer DEFAULT 0 NOT NULL,
	"max_users" integer DEFAULT 5 NOT NULL,
	"active_sites" integer DEFAULT 0 NOT NULL,
	"max_sites" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "tenants_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "site_personnel" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_role" "site_role" DEFAULT 'worker' NOT NULL,
	"assigned_by_id" integer NOT NULL,
	"start_date" date,
	"end_date" date,
	"permissions" jsonb,
	"team_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"phone" text,
	"job_title" text,
	"department" text,
	"profile_image_url" text,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"mobile_token" text,
	"last_mobile_login" timestamp,
	"emergency_contact" text,
	"safety_certification_expiry" date,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "incident_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"reported_by_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"incident_date" timestamp NOT NULL,
	"location" text NOT NULL,
	"incident_type" text NOT NULL,
	"severity" "incident_severity" NOT NULL,
	"status" "incident_status" DEFAULT 'reported' NOT NULL,
	"injury_occurred" boolean DEFAULT false NOT NULL,
	"injury_details" text,
	"witnesses" jsonb,
	"root_cause" text,
	"corrective_actions" text,
	"preventative_measures" text,
	"photo_urls" jsonb,
	"video_ids" jsonb,
	"document_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hazard_assignments" ADD CONSTRAINT "hazard_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_assignments" ADD CONSTRAINT "hazard_assignments_assigned_to_subcontractor_id_fkey" FOREIGN KEY ("assigned_to_subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_assignments" ADD CONSTRAINT "hazard_assignments_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_assignments" ADD CONSTRAINT "hazard_assignments_hazard_id_fkey" FOREIGN KEY ("hazard_id") REFERENCES "public"."hazard_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_reports" ADD CONSTRAINT "hazard_reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_reports" ADD CONSTRAINT "hazard_reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_reports" ADD CONSTRAINT "hazard_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_comments" ADD CONSTRAINT "hazard_comments_hazard_id_fkey" FOREIGN KEY ("hazard_id") REFERENCES "public"."hazard_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_comments" ADD CONSTRAINT "hazard_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_items" ADD CONSTRAINT "inspection_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."inspection_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_responses" ADD CONSTRAINT "inspection_responses_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."inspection_checklist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_responses" ADD CONSTRAINT "inspection_responses_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."inspection_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."inspection_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_sections" ADD CONSTRAINT "inspection_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."inspection_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requests" ADD CONSTRAINT "permit_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requests" ADD CONSTRAINT "permit_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requests" ADD CONSTRAINT "permit_requests_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requests" ADD CONSTRAINT "permit_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_content" ADD CONSTRAINT "training_content_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_content" ADD CONSTRAINT "training_content_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractors" ADD CONSTRAINT "subcontractors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."training_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_personnel" ADD CONSTRAINT "site_personnel_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_personnel" ADD CONSTRAINT "site_personnel_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_personnel" ADD CONSTRAINT "site_personnel_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_personnel" ADD CONSTRAINT "site_personnel_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_personnel" ADD CONSTRAINT "site_personnel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_hazard_assignments_hazard_id" ON "hazard_assignments" USING btree ("hazard_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_hazard_reports_severity" ON "hazard_reports" USING btree ("severity" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_hazard_reports_status" ON "hazard_reports" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_hazard_reports_tenant_site" ON "hazard_reports" USING btree ("tenant_id" int4_ops,"site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_inspection_responses_inspection_id" ON "inspection_responses" USING btree ("inspection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_inspections_status" ON "inspections" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_inspections_tenant_site" ON "inspections" USING btree ("tenant_id" int4_ops,"site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_permit_requests_status" ON "permit_requests" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_permit_requests_tenant_site" ON "permit_requests" USING btree ("tenant_id" int4_ops,"site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_teams_site_id" ON "teams" USING btree ("site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_sites_status" ON "sites" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sites_tenant_id" ON "sites" USING btree ("tenant_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_system_logs_tenant_id" ON "system_logs" USING btree ("tenant_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_system_logs_user_id" ON "system_logs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_training_records_course" ON "training_records" USING btree ("course_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_training_records_user" ON "training_records" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expire" ON "user_sessions" USING btree ("expire" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_site_personnel_site_id" ON "site_personnel" USING btree ("site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_site_personnel_user_id" ON "site_personnel" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_mobile_token" ON "users" USING btree ("mobile_token" text_ops) WHERE (mobile_token IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_users_tenant_id" ON "users" USING btree ("tenant_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_incident_reports_severity" ON "incident_reports" USING btree ("severity" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_incident_reports_tenant_site" ON "incident_reports" USING btree ("tenant_id" int4_ops,"site_id" int4_ops);
*/
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, index, primaryKey, pgEnum, varchar, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee']);
export const siteRoleEnum = pgEnum('site_role', ['site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor']);
export const hazardSeverityEnum = pgEnum('hazard_severity', ['low', 'medium', 'high', 'critical']);
export const hazardStatusEnum = pgEnum('hazard_status', ['open', 'assigned', 'in_progress', 'resolved', 'closed']);
export const inspectionStatusEnum = pgEnum('inspection_status', ['pending', 'in_progress', 'completed']);
export const permitStatusEnum = pgEnum('permit_status', ['requested', 'approved', 'denied', 'expired']);
export const incidentSeverityEnum = pgEnum('incident_severity', ['minor', 'moderate', 'major', 'critical']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['basic', 'standard', 'premium', 'enterprise']);

// Tenants
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  logo: text('logo'),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').notNull().default('basic'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  subscriptionEndDate: timestamp('subscription_end_date', { mode: 'string' }),
  activeUsers: integer('active_users').notNull().default(0),
  maxUsers: integer('max_users').notNull().default(5),
  activeSites: integer('active_sites').notNull().default(0),
  maxSites: integer('max_sites').notNull().default(1),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id'),
  settings: jsonb('settings'),
  isActive: boolean('is_active').notNull().default(true),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  sites: many(sites),
}));

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: userRoleEnum('role').notNull().default('employee'),
  phone: text('phone'),
  jobTitle: text('job_title'),
  department: text('department'),
  profileImageUrl: text('profile_image_url'),
  permissions: jsonb('permissions'),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  hazardReports: many(hazardReports),
  hazardAssignments: many(hazardAssignments),
  inspections: many(inspections),
  permitRequests: many(permitRequests),
  incidentReports: many(incidentReports),
  trainingRecords: many(trainingRecords),
  siteAssignments: many(sitePersonnel),
}));

// Sites
export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull(),
  gpsCoordinates: text('gps_coordinates'),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  startDate: date('start_date', { mode: 'string' }),
  endDate: date('end_date', { mode: 'string' }),
  status: text('status').notNull().default('active'),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const sitesRelations = relations(sites, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [sites.tenantId],
    references: [tenants.id],
  }),
  hazardReports: many(hazardReports),
  inspections: many(inspections),
  permitRequests: many(permitRequests),
  incidentReports: many(incidentReports),
  personnel: many(sitePersonnel),
}));

// Subcontractors
export const subcontractors = pgTable('subcontractors', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  contractNumber: text('contract_number'),
  contractStartDate: date('contract_start_date', { mode: 'string' }),
  contractEndDate: date('contract_end_date', { mode: 'string' }),
  servicesProvided: text('services_provided'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const subcontractorsRelations = relations(subcontractors, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subcontractors.tenantId],
    references: [tenants.id],
  }),
  hazardAssignments: many(hazardAssignments),
}));

// Hazard Reports
export const hazardReports = pgTable('hazard_reports', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  reportedById: integer('reported_by_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  gpsCoordinates: text('gps_coordinates'),
  hazardType: text('hazard_type').notNull(),
  severity: hazardSeverityEnum('severity').notNull(),
  status: hazardStatusEnum('status').notNull().default('open'),
  recommendedAction: text('recommended_action'),
  photoUrls: jsonb('photo_urls'),
  videoIds: jsonb('video_ids'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { mode: 'string' }),
  isActive: boolean('is_active').notNull().default(true),
});

export const hazardReportsRelations = relations(hazardReports, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [hazardReports.tenantId],
    references: [tenants.id],
  }),
  site: one(sites, {
    fields: [hazardReports.siteId],
    references: [sites.id],
  }),
  reportedBy: one(users, {
    fields: [hazardReports.reportedById],
    references: [users.id],
  }),
  assignments: many(hazardAssignments),
  comments: many(hazardComments),
}));

// Hazard Assignments
export const hazardAssignments = pgTable('hazard_assignments', {
  id: serial('id').primaryKey(),
  hazardId: integer('hazard_id').references(() => hazardReports.id, { onDelete: 'cascade' }).notNull(),
  assignedById: integer('assigned_by_id').references(() => users.id).notNull(),
  assignedToUserId: integer('assigned_to_user_id').references(() => users.id),
  assignedToSubcontractorId: integer('assigned_to_subcontractor_id').references(() => subcontractors.id),
  assignedAt: timestamp('assigned_at', { mode: 'string' }).notNull().defaultNow(),
  dueDate: timestamp('due_date', { mode: 'string' }),
  status: hazardStatusEnum('status').notNull().default('assigned'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const hazardAssignmentsRelations = relations(hazardAssignments, ({ one }) => ({
  hazard: one(hazardReports, {
    fields: [hazardAssignments.hazardId],
    references: [hazardReports.id],
  }),
  assignedBy: one(users, {
    fields: [hazardAssignments.assignedById],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [hazardAssignments.assignedToUserId],
    references: [users.id],
  }),
  assignedToSubcontractor: one(subcontractors, {
    fields: [hazardAssignments.assignedToSubcontractorId],
    references: [subcontractors.id],
  }),
}));

// Hazard Comments
export const hazardComments = pgTable('hazard_comments', {
  id: serial('id').primaryKey(),
  hazardId: integer('hazard_id').references(() => hazardReports.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  comment: text('comment').notNull(),
  attachmentUrls: jsonb('attachment_urls'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const hazardCommentsRelations = relations(hazardComments, ({ one }) => ({
  hazard: one(hazardReports, {
    fields: [hazardComments.hazardId],
    references: [hazardReports.id],
  }),
  user: one(users, {
    fields: [hazardComments.userId],
    references: [users.id],
  }),
}));

// Inspections
export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  inspectorId: integer('inspector_id').references(() => users.id).notNull(),
  inspectionType: text('inspection_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: timestamp('scheduled_date', { mode: 'string' }).notNull(),
  completedDate: timestamp('completed_date', { mode: 'string' }),
  status: inspectionStatusEnum('status').notNull().default('pending'),
  result: text('result'),
  findings: jsonb('findings'),
  photoUrls: jsonb('photo_urls'),
  videoIds: jsonb('video_ids'),
  documentUrls: jsonb('document_urls'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  tenant: one(tenants, {
    fields: [inspections.tenantId],
    references: [tenants.id],
  }),
  site: one(sites, {
    fields: [inspections.siteId],
    references: [sites.id],
  }),
  inspector: one(users, {
    fields: [inspections.inspectorId],
    references: [users.id],
  }),
}));

// Permit Requests
export const permitRequests = pgTable('permit_requests', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  requesterId: integer('requester_id').references(() => users.id).notNull(),
  approverId: integer('approver_id').references(() => users.id),
  permitType: text('permit_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  startDate: timestamp('start_date', { mode: 'string' }).notNull(),
  endDate: timestamp('end_date', { mode: 'string' }).notNull(),
  status: permitStatusEnum('status').notNull().default('requested'),
  approvalDate: timestamp('approval_date', { mode: 'string' }),
  denialReason: text('denial_reason'),
  attachmentUrls: jsonb('attachment_urls'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const permitRequestsRelations = relations(permitRequests, ({ one }) => ({
  tenant: one(tenants, {
    fields: [permitRequests.tenantId],
    references: [tenants.id],
  }),
  site: one(sites, {
    fields: [permitRequests.siteId],
    references: [sites.id],
  }),
  requester: one(users, {
    fields: [permitRequests.requesterId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [permitRequests.approverId],
    references: [users.id],
  }),
}));

// Incident Reports
export const incidentReports = pgTable('incident_reports', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  reportedById: integer('reported_by_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  incidentDate: timestamp('incident_date', { mode: 'string' }).notNull(),
  location: text('location').notNull(),
  incidentType: text('incident_type').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  injuryOccurred: boolean('injury_occurred').notNull().default(false),
  injuryDetails: text('injury_details'),
  witnesses: jsonb('witnesses'),
  rootCause: text('root_cause'),
  correctiveActions: text('corrective_actions'),
  preventativeMeasures: text('preventative_measures'),
  photoUrls: jsonb('photo_urls'),
  videoIds: jsonb('video_ids'),
  documentUrls: jsonb('document_urls'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const incidentReportsRelations = relations(incidentReports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [incidentReports.tenantId],
    references: [tenants.id],
  }),
  site: one(sites, {
    fields: [incidentReports.siteId],
    references: [sites.id],
  }),
  reportedBy: one(users, {
    fields: [incidentReports.reportedById],
    references: [users.id],
  }),
}));

// Training Content
export const trainingContent = pgTable('training_content', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  contentType: text('content_type').notNull(),
  videoId: text('video_id'),
  documentUrl: text('document_url'),
  language: text('language').notNull().default('en'),
  duration: integer('duration'),
  isCommon: boolean('is_common').notNull().default(false),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const trainingContentRelations = relations(trainingContent, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [trainingContent.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [trainingContent.createdById],
    references: [users.id],
  }),
  courses: many(trainingCourses),
}));

// Training Courses
export const trainingCourses = pgTable('training_courses', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  passingScore: integer('passing_score').notNull().default(70),
  isRequired: boolean('is_required').notNull().default(false),
  assignedRoles: jsonb('assigned_roles'),
  assignedSiteIds: jsonb('assigned_site_ids'),
  assignedSubcontractorIds: jsonb('assigned_subcontractor_ids'),
  contentIds: jsonb('content_ids'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const trainingCoursesRelations = relations(trainingCourses, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [trainingCourses.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [trainingCourses.createdById],
    references: [users.id],
  }),
  records: many(trainingRecords),
}));

// Training Records
export const trainingRecords = pgTable('training_records', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => trainingCourses.id, { onDelete: 'cascade' }).notNull(),
  startDate: timestamp('start_date', { mode: 'string' }).notNull().defaultNow(),
  completionDate: timestamp('completion_date', { mode: 'string' }),
  score: integer('score'),
  passed: boolean('passed'),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const trainingRecordsRelations = relations(trainingRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [trainingRecords.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [trainingRecords.userId],
    references: [users.id],
  }),
  course: one(trainingCourses, {
    fields: [trainingRecords.courseId],
    references: [trainingCourses.id],
  }),
}));

// Teams
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  leaderId: integer('leader_id').references(() => users.id),
  color: text('color'),
  specialties: jsonb('specialties'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

// Insert schemas for teams
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true, 
  isActive: true
});

// Types for teams
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [teams.tenantId],
    references: [tenants.id],
  }),
  site: one(sites, {
    fields: [teams.siteId],
    references: [sites.id],
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [teams.createdById],
    references: [users.id],
  }),
  members: many(sitePersonnel),
}));

// Site Personnel
export const sitePersonnel = pgTable('site_personnel', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  siteRole: siteRoleEnum('site_role').notNull().default('worker'),
  assignedById: integer('assigned_by_id').references(() => users.id).notNull(),
  startDate: date('start_date', { mode: 'string' }),
  endDate: date('end_date', { mode: 'string' }),
  permissions: jsonb('permissions'),
  teamId: integer('team_id').references(() => teams.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const sitePersonnelRelations = relations(sitePersonnel, ({ one }) => ({
  site: one(sites, {
    fields: [sitePersonnel.siteId],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [sitePersonnel.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [sitePersonnel.teamId],
    references: [teams.id],
  }),
  tenant: one(tenants, {
    fields: [sitePersonnel.tenantId],
    references: [tenants.id],
  }),
  assignedBy: one(users, {
    fields: [sitePersonnel.assignedById],
    references: [users.id],
  }),
}));

// System Logs
export const systemLogs = pgTable('system_logs', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [systemLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}));

// Email Templates
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [emailTemplates.tenantId],
    references: [tenants.id],
  }),
}));

// Role Permissions
export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  role: userRoleEnum('role').notNull(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

// We'll add a unique constraint later after the app is running
// export const rolePermissionsIndex = uniqueIndex('role_permissions_unique').on(rolePermissions.tenantId, rolePermissions.role, rolePermissions.resource, rolePermissions.action);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rolePermissions.tenantId],
    references: [tenants.id],
  }),
}));

// Zod Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  activeUsers: true, 
  activeSites: true 
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  lastLogin: true 
});

export const insertSiteSchema = createInsertSchema(sites).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertHazardReportSchema = createInsertSchema(hazardReports).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  resolvedAt: true 
});

export const insertHazardAssignmentSchema = createInsertSchema(hazardAssignments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertHazardCommentSchema = createInsertSchema(hazardComments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  completedDate: true 
});

export const insertPermitRequestSchema = createInsertSchema(permitRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  approvalDate: true 
});

export const insertIncidentReportSchema = createInsertSchema(incidentReports).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTrainingContentSchema = createInsertSchema(trainingContent).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTrainingCourseSchema = createInsertSchema(trainingCourses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSitePersonnelSchema = createInsertSchema(sitePersonnel).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Type exports for insert schemas
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type InsertHazardReport = z.infer<typeof insertHazardReportSchema>;
export type InsertHazardAssignment = z.infer<typeof insertHazardAssignmentSchema>;
export type InsertHazardComment = z.infer<typeof insertHazardCommentSchema>;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type InsertPermitRequest = z.infer<typeof insertPermitRequestSchema>;
export type InsertIncidentReport = z.infer<typeof insertIncidentReportSchema>;
export type InsertTrainingContent = z.infer<typeof insertTrainingContentSchema>;
export type InsertTrainingCourse = z.infer<typeof insertTrainingCourseSchema>;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type InsertSitePersonnel = z.infer<typeof insertSitePersonnelSchema>;

// Type exports for select schemas
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Site = typeof sites.$inferSelect;
export type Subcontractor = typeof subcontractors.$inferSelect;
export type HazardReport = typeof hazardReports.$inferSelect;
export type HazardAssignment = typeof hazardAssignments.$inferSelect;
export type HazardComment = typeof hazardComments.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type PermitRequest = typeof permitRequests.$inferSelect;
export type IncidentReport = typeof incidentReports.$inferSelect;
export type TrainingContent = typeof trainingContent.$inferSelect;
export type TrainingCourse = typeof trainingCourses.$inferSelect;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type SitePersonnel = typeof sitePersonnel.$inferSelect;

// Extended schemas for authentication
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerTenantSchema = insertTenantSchema.extend({
  adminUser: insertUserSchema.pick({
    username: true,
    email: true,
    password: true,
    firstName: true,
    lastName: true,
    phone: true,
  }),
});

export type RegisterTenant = z.infer<typeof registerTenantSchema>;

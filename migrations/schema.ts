import { pgTable, index, foreignKey, serial, integer, timestamp, text, boolean, jsonb, unique, varchar, date, check, json, pgSequence, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const complianceStatus = pgEnum("compliance_status", ['yes', 'no', 'na', 'partial'])
export const hazardSeverity = pgEnum("hazard_severity", ['critical', 'high', 'medium', 'low'])
export const hazardStatus = pgEnum("hazard_status", ['closed', 'resolved', 'in_progress', 'assigned', 'open'])
export const incidentSeverity = pgEnum("incident_severity", ['critical', 'major', 'moderate', 'minor'])
export const incidentStatus = pgEnum("incident_status", ['closed', 'resolved', 'investigating', 'reported'])
export const inspectionItemType = pgEnum("inspection_item_type", ['yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text'])
export const inspectionStatus = pgEnum("inspection_status", ['canceled', 'completed', 'in_progress', 'scheduled'])
export const permitStatus = pgEnum("permit_status", ['expired', 'denied', 'approved', 'requested'])
export const siteRole = pgEnum("site_role", ['visitor', 'subcontractor', 'worker', 'foreman', 'safety_coordinator', 'site_manager'])
export const subscriptionPlan = pgEnum("subscription_plan", ['enterprise', 'premium', 'standard', 'basic'])
export const userRole = pgEnum("user_role", ['employee', 'subcontractor', 'supervisor', 'safety_officer', 'super_admin'])

export const inspectionQuestionsIdSeq = pgSequence("inspection_questions_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const teamMembersIdSeq = pgSequence("team_members_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const hazardAssignments = pgTable("hazard_assignments", {
	id: serial().primaryKey().notNull(),
	hazardId: integer("hazard_id").notNull(),
	assignedById: integer("assigned_by_id").notNull(),
	assignedToUserId: integer("assigned_to_user_id"),
	assignedToSubcontractorId: integer("assigned_to_subcontractor_id"),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	status: hazardStatus().default('assigned').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_hazard_assignments_hazard_id").using("btree", table.hazardId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.assignedById],
			foreignColumns: [users.id],
			name: "hazard_assignments_assigned_by_id_fkey"
		}),
	foreignKey({
			columns: [table.assignedToSubcontractorId],
			foreignColumns: [subcontractors.id],
			name: "hazard_assignments_assigned_to_subcontractor_id_fkey"
		}),
	foreignKey({
			columns: [table.assignedToUserId],
			foreignColumns: [users.id],
			name: "hazard_assignments_assigned_to_user_id_fkey"
		}),
	foreignKey({
			columns: [table.hazardId],
			foreignColumns: [hazardReports.id],
			name: "hazard_assignments_hazard_id_fkey"
		}).onDelete("cascade"),
]);

export const hazardReports = pgTable("hazard_reports", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteId: integer("site_id").notNull(),
	reportedById: integer("reported_by_id").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	location: text().notNull(),
	gpsCoordinates: text("gps_coordinates"),
	hazardType: text("hazard_type").notNull(),
	severity: hazardSeverity().notNull(),
	status: hazardStatus().default('open').notNull(),
	recommendedAction: text("recommended_action"),
	photoUrls: jsonb("photo_urls"),
	videoIds: jsonb("video_ids"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_hazard_reports_severity").using("btree", table.severity.asc().nullsLast().op("enum_ops")),
	index("idx_hazard_reports_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_hazard_reports_tenant_site").using("btree", table.tenantId.asc().nullsLast().op("int4_ops"), table.siteId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.reportedById],
			foreignColumns: [users.id],
			name: "hazard_reports_reported_by_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "hazard_reports_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "hazard_reports_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const hazardComments = pgTable("hazard_comments", {
	id: serial().primaryKey().notNull(),
	hazardId: integer("hazard_id").notNull(),
	userId: integer("user_id").notNull(),
	comment: text().notNull(),
	attachmentUrls: jsonb("attachment_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hazardId],
			foreignColumns: [hazardReports.id],
			name: "hazard_comments_hazard_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "hazard_comments_user_id_fkey"
		}),
]);

export const emailTemplates = pgTable("email_templates", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id"),
	name: text().notNull(),
	subject: text().notNull(),
	body: text().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "email_templates_tenant_id_fkey"
		}),
]);

export const inspectionFindings = pgTable("inspection_findings", {
	id: serial().primaryKey().notNull(),
	inspectionId: integer("inspection_id").notNull(),
	description: text().notNull(),
	severity: hazardSeverity().default('medium').notNull(),
	location: text(),
	photoUrls: jsonb("photo_urls"),
	recommendedAction: text("recommended_action"),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assignedToId: integer("assigned_to_id"),
	status: hazardStatus().default('open').notNull(),
	createdById: integer("created_by_id").notNull(),
	resolvedById: integer("resolved_by_id"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignedToId],
			foreignColumns: [users.id],
			name: "inspection_findings_assigned_to_id_fkey"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "inspection_findings_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.inspectionId],
			foreignColumns: [inspections.id],
			name: "inspection_findings_inspection_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.resolvedById],
			foreignColumns: [users.id],
			name: "inspection_findings_resolved_by_id_fkey"
		}),
]);

export const inspectionItems = pgTable("inspection_items", {
	id: serial().primaryKey().notNull(),
	sectionId: integer("section_id").notNull(),
	question: text().notNull(),
	type: inspectionItemType().default('yes_no').notNull(),
	description: text(),
	required: boolean().default(true).notNull(),
	category: text(),
	options: jsonb(),
	orderIndex: integer("order_index").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [inspectionSections.id],
			name: "inspection_items_section_id_fkey"
		}).onDelete("cascade"),
]);

export const inspectionResponses = pgTable("inspection_responses", {
	id: serial().primaryKey().notNull(),
	inspectionId: integer("inspection_id").notNull(),
	checklistItemId: integer("checklist_item_id").notNull(),
	response: complianceStatus().notNull(),
	notes: text(),
	photoUrls: jsonb("photo_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_inspection_responses_inspection_id").using("btree", table.inspectionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.checklistItemId],
			foreignColumns: [inspectionChecklistItems.id],
			name: "inspection_responses_checklist_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.inspectionId],
			foreignColumns: [inspections.id],
			name: "inspection_responses_inspection_id_fkey"
		}).onDelete("cascade"),
]);

export const inspectionChecklistItems = pgTable("inspection_checklist_items", {
	id: serial().primaryKey().notNull(),
	templateId: integer("template_id").notNull(),
	category: text(),
	question: text().notNull(),
	description: text(),
	expectedAnswer: text("expected_answer").default('yes'),
	isCritical: boolean("is_critical").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [inspectionTemplates.id],
			name: "inspection_checklist_items_template_id_fkey"
		}).onDelete("cascade"),
]);

export const inspections = pgTable("inspections", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteId: integer("site_id").notNull(),
	templateId: integer("template_id"),
	title: text().notNull(),
	description: text(),
	scheduledDate: timestamp("scheduled_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assignedToId: integer("assigned_to_id"),
	createdById: integer("created_by_id").notNull(),
	completedById: integer("completed_by_id"),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	location: text(),
	status: inspectionStatus().notNull(),
	score: integer(),
	maxScore: integer("max_score"),
	notes: text(),
	photoUrls: jsonb("photo_urls"),
	documentUrls: jsonb("document_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	inspectorId: integer("inspector_id"),
}, (table) => [
	index("idx_inspections_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_inspections_tenant_site").using("btree", table.tenantId.asc().nullsLast().op("int4_ops"), table.siteId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.assignedToId],
			foreignColumns: [users.id],
			name: "inspections_assigned_to_id_fkey"
		}),
	foreignKey({
			columns: [table.completedById],
			foreignColumns: [users.id],
			name: "inspections_completed_by_id_fkey"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "inspections_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.inspectorId],
			foreignColumns: [users.id],
			name: "inspections_inspector_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "inspections_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [inspectionTemplates.id],
			name: "inspections_template_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "inspections_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const inspectionSections = pgTable("inspection_sections", {
	id: serial().primaryKey().notNull(),
	templateId: integer("template_id").notNull(),
	name: text().notNull(),
	description: text(),
	orderIndex: integer("order_index").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [inspectionTemplates.id],
			name: "inspection_sections_template_id_fkey"
		}).onDelete("cascade"),
]);

export const migrationHistory = pgTable("migration_history", {
	id: serial().primaryKey().notNull(),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
	checksum: varchar({ length: 64 }),
	executionTimeMs: integer("execution_time_ms"),
	status: varchar({ length: 20 }).default('completed'),
}, (table) => [
	unique("migration_history_migration_name_key").on(table.migrationName),
]);

export const reportHistory = pgTable("report_history", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	userId: integer("user_id").notNull(),
	siteId: integer("site_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	reportName: text("report_name").notNull(),
	reportUrl: text("report_url"),
	status: text().default('generated').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "report_history_site_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "report_history_tenant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "report_history_user_id_fkey"
		}),
]);

export const inspectionTemplates = pgTable("inspection_templates", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	name: text().notNull(),
	description: text(),
	category: text().notNull(),
	version: text().default('1.0'),
	isDefault: boolean("is_default").default(false),
	createdById: integer("created_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "inspection_templates_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "inspection_templates_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const permitRequests = pgTable("permit_requests", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteId: integer("site_id").notNull(),
	requesterId: integer("requester_id").notNull(),
	approverId: integer("approver_id"),
	permitType: text("permit_type").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	location: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	status: permitStatus().default('requested').notNull(),
	approvalDate: timestamp("approval_date", { mode: 'string' }),
	denialReason: text("denial_reason"),
	attachmentUrls: jsonb("attachment_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_permit_requests_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_permit_requests_tenant_site").using("btree", table.tenantId.asc().nullsLast().op("int4_ops"), table.siteId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.approverId],
			foreignColumns: [users.id],
			name: "permit_requests_approver_id_fkey"
		}),
	foreignKey({
			columns: [table.requesterId],
			foreignColumns: [users.id],
			name: "permit_requests_requester_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "permit_requests_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "permit_requests_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const teams = pgTable("teams", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteId: integer("site_id").notNull(),
	name: text().notNull(),
	description: text(),
	leaderId: integer("leader_id"),
	color: text(),
	specialties: jsonb(),
	createdById: integer("created_by_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_teams_site_id").using("btree", table.siteId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "teams_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.leaderId],
			foreignColumns: [users.id],
			name: "teams_leader_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "teams_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "teams_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const rolePermissions = pgTable("role_permissions", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	role: userRole().notNull(),
	resource: text().notNull(),
	action: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "role_permissions_tenant_id_fkey"
		}).onDelete("cascade"),
	unique("role_permissions_tenant_id_role_resource_action_key").on(table.tenantId, table.role, table.resource, table.action),
]);

export const sites = pgTable("sites", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	name: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	country: text().notNull(),
	gpsCoordinates: text("gps_coordinates"),
	contactName: text("contact_name"),
	contactPhone: text("contact_phone"),
	contactEmail: text("contact_email"),
	startDate: date("start_date"),
	endDate: date("end_date"),
	status: text().default('active').notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_sites_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_sites_tenant_id").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "sites_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const trainingContent = pgTable("training_content", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id"),
	title: text().notNull(),
	description: text().notNull(),
	contentType: text("content_type").notNull(),
	videoId: text("video_id"),
	documentUrl: text("document_url"),
	language: text().default('en').notNull(),
	duration: integer(),
	isCommon: boolean("is_common").default(false).notNull(),
	createdById: integer("created_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "training_content_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "training_content_tenant_id_fkey"
		}),
]);

export const systemLogs = pgTable("system_logs", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id"),
	userId: integer("user_id"),
	action: text().notNull(),
	entityType: text("entity_type"),
	entityId: text("entity_id"),
	details: jsonb(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_system_logs_tenant_id").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("idx_system_logs_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "system_logs_tenant_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "system_logs_user_id_fkey"
		}),
]);

export const subcontractors = pgTable("subcontractors", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	name: text().notNull(),
	contactPerson: text("contact_person").notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	address: text(),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
	country: text(),
	contractNumber: text("contract_number"),
	contractStartDate: date("contract_start_date"),
	contractEndDate: date("contract_end_date"),
	servicesProvided: text("services_provided"),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "subcontractors_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const trainingCourses = pgTable("training_courses", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	passingScore: integer("passing_score").default(70).notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
	assignedRoles: jsonb("assigned_roles"),
	assignedSiteIds: jsonb("assigned_site_ids"),
	assignedSubcontractorIds: jsonb("assigned_subcontractor_ids"),
	contentIds: jsonb("content_ids"),
	createdById: integer("created_by_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "training_courses_created_by_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "training_courses_tenant_id_fkey"
		}).onDelete("cascade"),
]);

export const trainingRecords = pgTable("training_records", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	userId: integer("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow().notNull(),
	completionDate: timestamp("completion_date", { mode: 'string' }),
	score: integer(),
	passed: boolean(),
	certificateUrl: text("certificate_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_training_records_course").using("btree", table.courseId.asc().nullsLast().op("int4_ops")),
	index("idx_training_records_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [trainingCourses.id],
			name: "training_records_course_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "training_records_tenant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "training_records_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userPreferences = pgTable("user_preferences", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	theme: text().default('light'),
	emailNotifications: boolean("email_notifications").default(true),
	smsNotifications: boolean("sms_notifications").default(false),
	language: text().default('en'),
	timezone: text().default('UTC'),
	dashboardLayout: jsonb("dashboard_layout").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_preferences_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_preferences_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_preferences_user_id_key").on(table.userId),
	check("user_preferences_theme_check", sql`theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text])`),
]);

export const userSessions = pgTable("user_sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("idx_user_sessions_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const tenants = pgTable("tenants", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	address: text(),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
	country: text(),
	logo: text(),
	subscriptionPlan: subscriptionPlan("subscription_plan").default('basic').notNull(),
	subscriptionStatus: text("subscription_status").default('active').notNull(),
	subscriptionEndDate: timestamp("subscription_end_date", { mode: 'string' }),
	activeUsers: integer("active_users").default(0).notNull(),
	maxUsers: integer("max_users").default(5).notNull(),
	activeSites: integer("active_sites").default(0).notNull(),
	maxSites: integer("max_sites").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	settings: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("tenants_email_key").on(table.email),
]);

export const sitePersonnel = pgTable("site_personnel", {
	id: serial().primaryKey().notNull(),
	siteId: integer("site_id").notNull(),
	userId: integer("user_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteRole: siteRole("site_role").default('worker').notNull(),
	assignedById: integer("assigned_by_id").notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	permissions: jsonb(),
	teamId: integer("team_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_site_personnel_site_id").using("btree", table.siteId.asc().nullsLast().op("int4_ops")),
	index("idx_site_personnel_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.assignedById],
			foreignColumns: [users.id],
			name: "site_personnel_assigned_by_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "site_personnel_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "site_personnel_team_id_fkey"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "site_personnel_tenant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "site_personnel_user_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id"),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	role: userRole().default('employee').notNull(),
	phone: text(),
	jobTitle: text("job_title"),
	department: text(),
	profileImageUrl: text("profile_image_url"),
	permissions: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	mobileToken: text("mobile_token"),
	lastMobileLogin: timestamp("last_mobile_login", { mode: 'string' }),
	emergencyContact: text("emergency_contact"),
	safetyCertificationExpiry: date("safety_certification_expiry"),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_mobile_token").using("btree", table.mobileToken.asc().nullsLast().op("text_ops")).where(sql`(mobile_token IS NOT NULL)`),
	index("idx_users_tenant_id").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "users_tenant_id_fkey"
		}).onDelete("cascade"),
	unique("users_email_key").on(table.email),
]);

export const incidentReports = pgTable("incident_reports", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	siteId: integer("site_id").notNull(),
	reportedById: integer("reported_by_id").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	incidentDate: timestamp("incident_date", { mode: 'string' }).notNull(),
	location: text().notNull(),
	incidentType: text("incident_type").notNull(),
	severity: incidentSeverity().notNull(),
	status: incidentStatus().default('reported').notNull(),
	injuryOccurred: boolean("injury_occurred").default(false).notNull(),
	injuryDetails: text("injury_details"),
	witnesses: jsonb(),
	rootCause: text("root_cause"),
	correctiveActions: text("corrective_actions"),
	preventativeMeasures: text("preventative_measures"),
	photoUrls: jsonb("photo_urls"),
	videoIds: jsonb("video_ids"),
	documentUrls: jsonb("document_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_incident_reports_severity").using("btree", table.severity.asc().nullsLast().op("enum_ops")),
	index("idx_incident_reports_tenant_site").using("btree", table.tenantId.asc().nullsLast().op("int4_ops"), table.siteId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.reportedById],
			foreignColumns: [users.id],
			name: "incident_reports_reported_by_id_fkey"
		}),
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.id],
			name: "incident_reports_site_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "incident_reports_tenant_id_fkey"
		}).onDelete("cascade"),
]);

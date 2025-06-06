import { relations } from "drizzle-orm/relations";
import { users, hazardAssignments, subcontractors, hazardReports, sites, tenants, hazardComments, emailTemplates, inspectionFindings, inspections, inspectionSections, inspectionItems, inspectionChecklistItems, inspectionResponses, inspectionTemplates, reportHistory, permitRequests, teams, rolePermissions, trainingContent, systemLogs, trainingCourses, trainingRecords, userPreferences, sitePersonnel, incidentReports } from "./schema";

export const hazardAssignmentsRelations = relations(hazardAssignments, ({one}) => ({
	user_assignedById: one(users, {
		fields: [hazardAssignments.assignedById],
		references: [users.id],
		relationName: "hazardAssignments_assignedById_users_id"
	}),
	subcontractor: one(subcontractors, {
		fields: [hazardAssignments.assignedToSubcontractorId],
		references: [subcontractors.id]
	}),
	user_assignedToUserId: one(users, {
		fields: [hazardAssignments.assignedToUserId],
		references: [users.id],
		relationName: "hazardAssignments_assignedToUserId_users_id"
	}),
	hazardReport: one(hazardReports, {
		fields: [hazardAssignments.hazardId],
		references: [hazardReports.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	hazardAssignments_assignedById: many(hazardAssignments, {
		relationName: "hazardAssignments_assignedById_users_id"
	}),
	hazardAssignments_assignedToUserId: many(hazardAssignments, {
		relationName: "hazardAssignments_assignedToUserId_users_id"
	}),
	hazardReports: many(hazardReports),
	hazardComments: many(hazardComments),
	inspectionFindings_assignedToId: many(inspectionFindings, {
		relationName: "inspectionFindings_assignedToId_users_id"
	}),
	inspectionFindings_createdById: many(inspectionFindings, {
		relationName: "inspectionFindings_createdById_users_id"
	}),
	inspectionFindings_resolvedById: many(inspectionFindings, {
		relationName: "inspectionFindings_resolvedById_users_id"
	}),
	inspections_assignedToId: many(inspections, {
		relationName: "inspections_assignedToId_users_id"
	}),
	inspections_completedById: many(inspections, {
		relationName: "inspections_completedById_users_id"
	}),
	inspections_createdById: many(inspections, {
		relationName: "inspections_createdById_users_id"
	}),
	inspections_inspectorId: many(inspections, {
		relationName: "inspections_inspectorId_users_id"
	}),
	reportHistories: many(reportHistory),
	inspectionTemplates: many(inspectionTemplates),
	permitRequests_approverId: many(permitRequests, {
		relationName: "permitRequests_approverId_users_id"
	}),
	permitRequests_requesterId: many(permitRequests, {
		relationName: "permitRequests_requesterId_users_id"
	}),
	teams_createdById: many(teams, {
		relationName: "teams_createdById_users_id"
	}),
	teams_leaderId: many(teams, {
		relationName: "teams_leaderId_users_id"
	}),
	trainingContents: many(trainingContent),
	systemLogs: many(systemLogs),
	trainingCourses: many(trainingCourses),
	trainingRecords: many(trainingRecords),
	userPreferences: many(userPreferences),
	sitePersonnels_assignedById: many(sitePersonnel, {
		relationName: "sitePersonnel_assignedById_users_id"
	}),
	sitePersonnels_userId: many(sitePersonnel, {
		relationName: "sitePersonnel_userId_users_id"
	}),
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	}),
	incidentReports: many(incidentReports),
}));

export const subcontractorsRelations = relations(subcontractors, ({one, many}) => ({
	hazardAssignments: many(hazardAssignments),
	tenant: one(tenants, {
		fields: [subcontractors.tenantId],
		references: [tenants.id]
	}),
}));

export const hazardReportsRelations = relations(hazardReports, ({one, many}) => ({
	hazardAssignments: many(hazardAssignments),
	user: one(users, {
		fields: [hazardReports.reportedById],
		references: [users.id]
	}),
	site: one(sites, {
		fields: [hazardReports.siteId],
		references: [sites.id]
	}),
	tenant: one(tenants, {
		fields: [hazardReports.tenantId],
		references: [tenants.id]
	}),
	hazardComments: many(hazardComments),
}));

export const sitesRelations = relations(sites, ({one, many}) => ({
	hazardReports: many(hazardReports),
	inspections: many(inspections),
	reportHistories: many(reportHistory),
	permitRequests: many(permitRequests),
	teams: many(teams),
	tenant: one(tenants, {
		fields: [sites.tenantId],
		references: [tenants.id]
	}),
	sitePersonnels: many(sitePersonnel),
	incidentReports: many(incidentReports),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	hazardReports: many(hazardReports),
	emailTemplates: many(emailTemplates),
	inspections: many(inspections),
	reportHistories: many(reportHistory),
	inspectionTemplates: many(inspectionTemplates),
	permitRequests: many(permitRequests),
	teams: many(teams),
	rolePermissions: many(rolePermissions),
	sites: many(sites),
	trainingContents: many(trainingContent),
	systemLogs: many(systemLogs),
	subcontractors: many(subcontractors),
	trainingCourses: many(trainingCourses),
	trainingRecords: many(trainingRecords),
	sitePersonnels: many(sitePersonnel),
	users: many(users),
	incidentReports: many(incidentReports),
}));

export const hazardCommentsRelations = relations(hazardComments, ({one}) => ({
	hazardReport: one(hazardReports, {
		fields: [hazardComments.hazardId],
		references: [hazardReports.id]
	}),
	user: one(users, {
		fields: [hazardComments.userId],
		references: [users.id]
	}),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({one}) => ({
	tenant: one(tenants, {
		fields: [emailTemplates.tenantId],
		references: [tenants.id]
	}),
}));

export const inspectionFindingsRelations = relations(inspectionFindings, ({one}) => ({
	user_assignedToId: one(users, {
		fields: [inspectionFindings.assignedToId],
		references: [users.id],
		relationName: "inspectionFindings_assignedToId_users_id"
	}),
	user_createdById: one(users, {
		fields: [inspectionFindings.createdById],
		references: [users.id],
		relationName: "inspectionFindings_createdById_users_id"
	}),
	inspection: one(inspections, {
		fields: [inspectionFindings.inspectionId],
		references: [inspections.id]
	}),
	user_resolvedById: one(users, {
		fields: [inspectionFindings.resolvedById],
		references: [users.id],
		relationName: "inspectionFindings_resolvedById_users_id"
	}),
}));

export const inspectionsRelations = relations(inspections, ({one, many}) => ({
	inspectionFindings: many(inspectionFindings),
	inspectionResponses: many(inspectionResponses),
	user_assignedToId: one(users, {
		fields: [inspections.assignedToId],
		references: [users.id],
		relationName: "inspections_assignedToId_users_id"
	}),
	user_completedById: one(users, {
		fields: [inspections.completedById],
		references: [users.id],
		relationName: "inspections_completedById_users_id"
	}),
	user_createdById: one(users, {
		fields: [inspections.createdById],
		references: [users.id],
		relationName: "inspections_createdById_users_id"
	}),
	user_inspectorId: one(users, {
		fields: [inspections.inspectorId],
		references: [users.id],
		relationName: "inspections_inspectorId_users_id"
	}),
	site: one(sites, {
		fields: [inspections.siteId],
		references: [sites.id]
	}),
	inspectionTemplate: one(inspectionTemplates, {
		fields: [inspections.templateId],
		references: [inspectionTemplates.id]
	}),
	tenant: one(tenants, {
		fields: [inspections.tenantId],
		references: [tenants.id]
	}),
}));

export const inspectionItemsRelations = relations(inspectionItems, ({one}) => ({
	inspectionSection: one(inspectionSections, {
		fields: [inspectionItems.sectionId],
		references: [inspectionSections.id]
	}),
}));

export const inspectionSectionsRelations = relations(inspectionSections, ({one, many}) => ({
	inspectionItems: many(inspectionItems),
	inspectionTemplate: one(inspectionTemplates, {
		fields: [inspectionSections.templateId],
		references: [inspectionTemplates.id]
	}),
}));

export const inspectionResponsesRelations = relations(inspectionResponses, ({one}) => ({
	inspectionChecklistItem: one(inspectionChecklistItems, {
		fields: [inspectionResponses.checklistItemId],
		references: [inspectionChecklistItems.id]
	}),
	inspection: one(inspections, {
		fields: [inspectionResponses.inspectionId],
		references: [inspections.id]
	}),
}));

export const inspectionChecklistItemsRelations = relations(inspectionChecklistItems, ({one, many}) => ({
	inspectionResponses: many(inspectionResponses),
	inspectionTemplate: one(inspectionTemplates, {
		fields: [inspectionChecklistItems.templateId],
		references: [inspectionTemplates.id]
	}),
}));

export const inspectionTemplatesRelations = relations(inspectionTemplates, ({one, many}) => ({
	inspectionChecklistItems: many(inspectionChecklistItems),
	inspections: many(inspections),
	inspectionSections: many(inspectionSections),
	user: one(users, {
		fields: [inspectionTemplates.createdById],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [inspectionTemplates.tenantId],
		references: [tenants.id]
	}),
}));

export const reportHistoryRelations = relations(reportHistory, ({one}) => ({
	site: one(sites, {
		fields: [reportHistory.siteId],
		references: [sites.id]
	}),
	tenant: one(tenants, {
		fields: [reportHistory.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [reportHistory.userId],
		references: [users.id]
	}),
}));

export const permitRequestsRelations = relations(permitRequests, ({one}) => ({
	user_approverId: one(users, {
		fields: [permitRequests.approverId],
		references: [users.id],
		relationName: "permitRequests_approverId_users_id"
	}),
	user_requesterId: one(users, {
		fields: [permitRequests.requesterId],
		references: [users.id],
		relationName: "permitRequests_requesterId_users_id"
	}),
	site: one(sites, {
		fields: [permitRequests.siteId],
		references: [sites.id]
	}),
	tenant: one(tenants, {
		fields: [permitRequests.tenantId],
		references: [tenants.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	user_createdById: one(users, {
		fields: [teams.createdById],
		references: [users.id],
		relationName: "teams_createdById_users_id"
	}),
	user_leaderId: one(users, {
		fields: [teams.leaderId],
		references: [users.id],
		relationName: "teams_leaderId_users_id"
	}),
	site: one(sites, {
		fields: [teams.siteId],
		references: [sites.id]
	}),
	tenant: one(tenants, {
		fields: [teams.tenantId],
		references: [tenants.id]
	}),
	sitePersonnels: many(sitePersonnel),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	tenant: one(tenants, {
		fields: [rolePermissions.tenantId],
		references: [tenants.id]
	}),
}));

export const trainingContentRelations = relations(trainingContent, ({one}) => ({
	user: one(users, {
		fields: [trainingContent.createdById],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [trainingContent.tenantId],
		references: [tenants.id]
	}),
}));

export const systemLogsRelations = relations(systemLogs, ({one}) => ({
	tenant: one(tenants, {
		fields: [systemLogs.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [systemLogs.userId],
		references: [users.id]
	}),
}));

export const trainingCoursesRelations = relations(trainingCourses, ({one, many}) => ({
	user: one(users, {
		fields: [trainingCourses.createdById],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [trainingCourses.tenantId],
		references: [tenants.id]
	}),
	trainingRecords: many(trainingRecords),
}));

export const trainingRecordsRelations = relations(trainingRecords, ({one}) => ({
	trainingCourse: one(trainingCourses, {
		fields: [trainingRecords.courseId],
		references: [trainingCourses.id]
	}),
	tenant: one(tenants, {
		fields: [trainingRecords.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [trainingRecords.userId],
		references: [users.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(users, {
		fields: [userPreferences.userId],
		references: [users.id]
	}),
}));

export const sitePersonnelRelations = relations(sitePersonnel, ({one}) => ({
	user_assignedById: one(users, {
		fields: [sitePersonnel.assignedById],
		references: [users.id],
		relationName: "sitePersonnel_assignedById_users_id"
	}),
	site: one(sites, {
		fields: [sitePersonnel.siteId],
		references: [sites.id]
	}),
	team: one(teams, {
		fields: [sitePersonnel.teamId],
		references: [teams.id]
	}),
	tenant: one(tenants, {
		fields: [sitePersonnel.tenantId],
		references: [tenants.id]
	}),
	user_userId: one(users, {
		fields: [sitePersonnel.userId],
		references: [users.id],
		relationName: "sitePersonnel_userId_users_id"
	}),
}));

export const incidentReportsRelations = relations(incidentReports, ({one}) => ({
	user: one(users, {
		fields: [incidentReports.reportedById],
		references: [users.id]
	}),
	site: one(sites, {
		fields: [incidentReports.siteId],
		references: [sites.id]
	}),
	tenant: one(tenants, {
		fields: [incidentReports.tenantId],
		references: [tenants.id]
	}),
}));
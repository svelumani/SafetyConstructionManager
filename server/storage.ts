import { 
  users, tenants, sites, hazardReports, hazardAssignments, hazardComments,
  inspections, permitRequests, incidentReports, trainingContent, trainingCourses,
  trainingRecords, systemLogs, emailTemplates, rolePermissions, subcontractors, sitePersonnel,
  teams,
  type User, type InsertUser, type Tenant, type InsertTenant, type Site, type InsertSite,
  type HazardReport, type InsertHazardReport, type HazardAssignment, type InsertHazardAssignment,
  type HazardComment, type InsertHazardComment, type Inspection, type InsertInspection,
  type PermitRequest, type InsertPermitRequest, type IncidentReport, type InsertIncidentReport,
  type TrainingContent, type InsertTrainingContent, type TrainingCourse, type InsertTrainingCourse,
  type TrainingRecord, type InsertTrainingRecord, type SystemLog, type EmailTemplate,
  type InsertEmailTemplate, type RolePermission, type InsertRolePermission, type Subcontractor,
  type InsertSubcontractor, type RegisterTenant, type SitePersonnel, type InsertSitePersonnel,
  type Team, type InsertTeam
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, desc, asc, or, sql, like, not } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session Store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<User[]>;
  countUsers(tenantId: number): Promise<number>;

  // Tenant operations
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByEmail(email: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;
  listTenants(options?: { limit?: number; offset?: number; }): Promise<Tenant[]>;
  countTenants(): Promise<number>;
  registerTenant(data: RegisterTenant): Promise<{ tenant: Tenant, user: User }>;

  // Site operations
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, site: Partial<InsertSite>): Promise<Site | undefined>;
  deleteSite(id: number): Promise<boolean>;
  listSites(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<Site[]>;
  countSites(tenantId: number): Promise<number>;
  
  // Site personnel operations
  getSitePersonnel(id: number): Promise<SitePersonnel | undefined>;
  assignUserToSite(data: InsertSitePersonnel): Promise<SitePersonnel>;
  updateSitePersonnel(id: number, data: Partial<InsertSitePersonnel>): Promise<SitePersonnel | undefined>;
  removeSitePersonnel(id: number): Promise<boolean>;
  listSitePersonnelBySite(siteId: number, options?: { limit?: number; offset?: number; }): Promise<SitePersonnel[]>;
  countSitePersonnel(siteId: number): Promise<number>;

  // Subcontractor operations
  getSubcontractor(id: number): Promise<Subcontractor | undefined>;
  createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor>;
  updateSubcontractor(id: number, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined>;
  deleteSubcontractor(id: number): Promise<boolean>;
  listSubcontractors(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<Subcontractor[]>;
  countSubcontractors(tenantId: number): Promise<number>;

  // Hazard operations
  getHazardReport(id: number): Promise<HazardReport | undefined>;
  createHazardReport(hazard: InsertHazardReport): Promise<HazardReport>;
  updateHazardReport(id: number, hazard: Partial<InsertHazardReport>): Promise<HazardReport | undefined>;
  deleteHazardReport(id: number): Promise<boolean>;
  listHazardReports(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string; 
    severity?: string;
  }): Promise<HazardReport[]>;
  countHazardReports(tenantId: number, options?: { siteId?: number; status?: string; severity?: string; }): Promise<number>;

  // Hazard assignment operations
  createHazardAssignment(assignment: InsertHazardAssignment): Promise<HazardAssignment>;
  updateHazardAssignment(id: number, assignment: Partial<InsertHazardAssignment>): Promise<HazardAssignment | undefined>;
  listHazardAssignments(hazardId: number): Promise<HazardAssignment[]>;

  // Hazard comment operations
  createHazardComment(comment: InsertHazardComment): Promise<HazardComment>;
  listHazardComments(hazardId: number): Promise<HazardComment[]>;

  // Inspection operations
  getInspection(id: number): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  deleteInspection(id: number): Promise<boolean>;
  listInspections(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string;
  }): Promise<Inspection[]>;
  countInspections(tenantId: number, options?: { siteId?: number; status?: string; }): Promise<number>;

  // Permit operations
  getPermitRequest(id: number): Promise<PermitRequest | undefined>;
  createPermitRequest(permit: InsertPermitRequest): Promise<PermitRequest>;
  updatePermitRequest(id: number, permit: Partial<InsertPermitRequest>): Promise<PermitRequest | undefined>;
  deletePermitRequest(id: number): Promise<boolean>;
  listPermitRequests(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string;
  }): Promise<PermitRequest[]>;
  countPermitRequests(tenantId: number, options?: { siteId?: number; status?: string; }): Promise<number>;

  // Incident operations
  getIncidentReport(id: number): Promise<IncidentReport | undefined>;
  createIncidentReport(incident: InsertIncidentReport): Promise<IncidentReport>;
  updateIncidentReport(id: number, incident: Partial<InsertIncidentReport>): Promise<IncidentReport | undefined>;
  deleteIncidentReport(id: number): Promise<boolean>;
  listIncidentReports(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    severity?: string;
  }): Promise<IncidentReport[]>;
  countIncidentReports(tenantId: number, options?: { siteId?: number; severity?: string; }): Promise<number>;

  // Training content operations
  getTrainingContent(id: number): Promise<TrainingContent | undefined>;
  createTrainingContent(content: InsertTrainingContent): Promise<TrainingContent>;
  updateTrainingContent(id: number, content: Partial<InsertTrainingContent>): Promise<TrainingContent | undefined>;
  deleteTrainingContent(id: number): Promise<boolean>;
  listTrainingContent(options?: { 
    limit?: number; 
    offset?: number; 
    tenantId?: number; 
    isCommon?: boolean;
  }): Promise<TrainingContent[]>;
  countTrainingContent(options?: { tenantId?: number; isCommon?: boolean; }): Promise<number>;

  // Training course operations
  getTrainingCourse(id: number): Promise<TrainingCourse | undefined>;
  createTrainingCourse(course: InsertTrainingCourse): Promise<TrainingCourse>;
  updateTrainingCourse(id: number, course: Partial<InsertTrainingCourse>): Promise<TrainingCourse | undefined>;
  deleteTrainingCourse(id: number): Promise<boolean>;
  listTrainingCourses(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<TrainingCourse[]>;
  countTrainingCourses(tenantId: number): Promise<number>;

  // Training record operations
  getTrainingRecord(id: number): Promise<TrainingRecord | undefined>;
  createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord>;
  updateTrainingRecord(id: number, record: Partial<InsertTrainingRecord>): Promise<TrainingRecord | undefined>;
  listTrainingRecords(options: { 
    tenantId: number;
    userId?: number;
    courseId?: number;
    limit?: number; 
    offset?: number;
  }): Promise<TrainingRecord[]>;
  countTrainingRecords(options: { tenantId: number; userId?: number; courseId?: number; }): Promise<number>;
  getTrainingProgressByUser(tenantId: number, userId: number): Promise<{ 
    completed: number; 
    total: number; 
    progress: number;
  }>;
  getTrainingProgressByCourse(tenantId: number, courseId: number): Promise<{
    completed: number;
    total: number;
    progress: number;
  }>;

  // Email template operations
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplateByName(name: string, tenantId?: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  listEmailTemplates(options?: { tenantId?: number; limit?: number; offset?: number; }): Promise<EmailTemplate[]>;

  // Role permission operations
  getRolePermissions(tenantId: number, role: string): Promise<RolePermission[]>;
  createRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  deleteRolePermission(id: number): Promise<boolean>;
  hasPermission(tenantId: number, role: string, resource: string, action: string): Promise<boolean>;
  
  // System logs operations
  createSystemLog(log: { 
    tenantId?: number; 
    userId?: number; 
    action: string; 
    entityType?: string; 
    entityId?: string; 
    details?: any; 
    ipAddress?: string; 
    userAgent?: string;
  }): Promise<SystemLog>;
  listSystemLogs(options?: { 
    tenantId?: number; 
    userId?: number; 
    action?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<SystemLog[]>;
  countSystemLogs(options?: { tenantId?: number; userId?: number; action?: string; }): Promise<number>;

  // Site Personnel operations
  assignUserToSite(assignment: InsertSitePersonnel): Promise<SitePersonnel>;
  removeSitePersonnel(id: number): Promise<boolean>;
  updateSitePersonnel(id: number, data: Partial<InsertSitePersonnel>): Promise<SitePersonnel | undefined>;
  getSitePersonnel(id: number): Promise<SitePersonnel | undefined>;
  listSitePersonnelBySite(siteId: number, options?: { limit?: number; offset?: number; }): Promise<SitePersonnel[]>;
  listSitePersonnelByUser(userId: number, options?: { limit?: number; offset?: number; }): Promise<SitePersonnel[]>;
  countSitePersonnel(siteId: number): Promise<number>;

  // Dashboard statistics
  getHazardStats(tenantId: number): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: { severity: string; count: number }[];
  }>;
  
  getTrainingStats(tenantId: number): Promise<{
    totalUsers: number;
    completedTraining: number;
    inProgressTraining: number;
    completionRate: number;
    byCourse: { course: string; completed: number; total: number; rate: number }[];
  }>;

  getSiteStats(tenantId: number): Promise<{
    totalSites: number;
    activeSites: number;
    sitesWithHazards: number;
    recentInspections: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true
    });
  }

  // Dashboard statistics implementations
  async getHazardStats(tenantId: number): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: { severity: string; count: number }[];
  }> {
    // Total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    // Open count
    const [openResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        or(
          eq(hazardReports.status, "open"),
          eq(hazardReports.status, "assigned")
        )
      ));
    
    // In progress count
    const [inProgressResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        eq(hazardReports.status, "in_progress")
      ));
    
    // Resolved count
    const [resolvedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        or(
          eq(hazardReports.status, "resolved"),
          eq(hazardReports.status, "closed")
        )
      ));
    
    // By severity
    const severityCounts = await db
      .select({
        severity: hazardReports.severity,
        count: sql<number>`count(*)`
      })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId))
      .groupBy(hazardReports.severity);
    
    return {
      total: totalResult?.count || 0,
      open: openResult?.count || 0,
      inProgress: inProgressResult?.count || 0,
      resolved: resolvedResult?.count || 0,
      bySeverity: severityCounts.map(sc => ({ 
        severity: sc.severity, 
        count: sc.count 
      }))
    };
  }

  // Implement hazard report functions
  async listHazardReports(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string; 
    severity?: string;
  }): Promise<HazardReport[]> {
    let query = db.select().from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId))
      .orderBy(desc(hazardReports.createdAt));
    
    // Apply filters
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status));
    }
    
    if (options?.severity) {
      query = query.where(eq(hazardReports.severity, options.severity));
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countHazardReports(tenantId: number, options?: { 
    siteId?: number; 
    status?: string; 
    severity?: string; 
  }): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    // Apply filters
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status));
    }
    
    if (options?.severity) {
      query = query.where(eq(hazardReports.severity, options.severity));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Implement inspection-related functions
  async listInspections(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string;
  }): Promise<Inspection[]> {
    let query = db.select().from(inspections)
      .where(eq(inspections.tenantId, tenantId))
      .orderBy(desc(inspections.createdAt));
    
    // Apply filters
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status));
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countInspections(tenantId: number, options?: { 
    siteId?: number; 
    status?: string; 
  }): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(eq(inspections.tenantId, tenantId));
    
    // Apply filters
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Training stats for dashboard
  async getTrainingStats(tenantId: number): Promise<{
    totalUsers: number;
    completedTraining: number;
    inProgressTraining: number;
    completionRate: number;
    byCourse: { course: string; completed: number; total: number; rate: number }[];
  }> {
    // Get total users count
    const [usersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.tenantId, tenantId));
    
    const totalUsers = usersResult?.count || 0;
    
    // Get completed training count
    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.status, "completed")
      ));
    
    // Get in-progress training count
    const [inProgressResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.status, "in_progress")
      ));
    
    const completedTraining = completedResult?.count || 0;
    const inProgressTraining = inProgressResult?.count || 0;
    const completionRate = totalUsers > 0 ? (completedTraining / totalUsers) * 100 : 0;
    
    // Get course-specific stats
    const courseStats = await db
      .select({
        courseId: trainingCourses.id,
        courseName: trainingCourses.title,
        completed: sql<number>`count(CASE WHEN ${trainingRecords.status} = 'completed' THEN 1 END)`,
        total: sql<number>`count(*)`
      })
      .from(trainingRecords)
      .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
      .where(eq(trainingRecords.tenantId, tenantId))
      .groupBy(trainingCourses.id, trainingCourses.title);
    
    return {
      totalUsers,
      completedTraining,
      inProgressTraining,
      completionRate,
      byCourse: courseStats.map(cs => ({
        course: cs.courseName,
        completed: Number(cs.completed),
        total: Number(cs.total),
        rate: cs.total > 0 ? (Number(cs.completed) / Number(cs.total)) * 100 : 0
      }))
    };
  }

  // Site stats for dashboard
  async getSiteStats(tenantId: number): Promise<{
    totalSites: number;
    activeSites: number;
    sitesWithHazards: number;
    recentInspections: number;
  }> {
    // Total sites
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(eq(sites.tenantId, tenantId));
    
    // Active sites
    const [activeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(and(
        eq(sites.tenantId, tenantId),
        eq(sites.status, "active")
      ));
    
    // Sites with hazards
    const sitesWithHazardsQuery = db
      .select({ siteId: hazardReports.siteId })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        or(
          eq(hazardReports.status, "open"),
          eq(hazardReports.status, "assigned"),
          eq(hazardReports.status, "in_progress")
        )
      ))
      .groupBy(hazardReports.siteId);
    
    const sitesWithHazards = await sitesWithHazardsQuery;
    
    // Recent inspections (in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentInspectionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(and(
        eq(inspections.tenantId, tenantId),
        sql`${inspections.createdAt} >= ${thirtyDaysAgo.toISOString()}`
      ));
    
    return {
      totalSites: totalResult?.count || 0,
      activeSites: activeResult?.count || 0,
      sitesWithHazards: sitesWithHazards.length,
      recentInspections: recentInspectionsResult?.count || 0
    };
  }

  // Implement system log functionality
  async createSystemLog(log: { 
    tenantId?: number; 
    userId?: number; 
    action: string; 
    entityType?: string; 
    entityId?: string; 
    details?: any; 
    ipAddress?: string; 
    userAgent?: string;
  }): Promise<SystemLog> {
    const [newLog] = await db.insert(systemLogs).values({
      tenantId: log.tenantId,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details ? JSON.stringify(log.details) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: new Date().toISOString(),
    }).returning();
    
    return newLog;
  }
  
  async listSystemLogs(options?: { 
    tenantId?: number; 
    userId?: number; 
    action?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<SystemLog[]> {
    let query = db.select().from(systemLogs)
      .orderBy(desc(systemLogs.createdAt));
    
    if (options?.tenantId) {
      query = query.where(eq(systemLogs.tenantId, options.tenantId));
    }
    
    if (options?.userId) {
      query = query.where(eq(systemLogs.userId, options.userId));
    }
    
    if (options?.action) {
      query = query.where(eq(systemLogs.action, options.action));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countSystemLogs(options?: { 
    tenantId?: number; 
    userId?: number; 
    action?: string; 
  }): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(systemLogs);
    
    if (options?.tenantId) {
      query = query.where(eq(systemLogs.tenantId, options.tenantId));
    }
    
    if (options?.userId) {
      query = query.where(eq(systemLogs.userId, options.userId));
    }
    
    if (options?.action) {
      query = query.where(eq(systemLogs.action, options.action));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Site management
  async listSites(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<Site[]> {
    let query = db.select().from(sites)
      .where(eq(sites.tenantId, tenantId))
      .orderBy(asc(sites.name));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countSites(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(eq(sites.tenantId, tenantId));
    return result?.count || 0;
  }
  
  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }
  
  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db.insert(sites).values(site).returning();
    return newSite;
  }
  
  async updateSite(id: number, siteData: Partial<InsertSite>): Promise<Site | undefined> {
    const [updatedSite] = await db
      .update(sites)
      .set({ ...siteData, updatedAt: new Date().toISOString() })
      .where(eq(sites.id, id))
      .returning();
    return updatedSite;
  }
  
  // Email templates
  async listEmailTemplates(options?: { tenantId?: number; limit?: number; offset?: number; }): Promise<EmailTemplate[]> {
    let query = db.select().from(emailTemplates)
      .orderBy(asc(emailTemplates.name));
    
    if (options?.tenantId) {
      query = query.where(
        or(
          eq(emailTemplates.tenantId, options.tenantId),
          isNull(emailTemplates.tenantId)
        )
      );
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async getEmailTemplateByName(name: string, tenantId?: number): Promise<EmailTemplate | undefined> {
    let query = db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    
    if (tenantId) {
      query = query.where(
        or(
          eq(emailTemplates.tenantId, tenantId),
          isNull(emailTemplates.tenantId)
        )
      );
    }
    
    const [template] = await query.orderBy(desc(emailTemplates.tenantId));
    return template;
  }
  
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }
  
  async updateEmailTemplate(id: number, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({ ...templateData, updatedAt: new Date().toISOString() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  // Permissions
  async hasPermission(tenantId: number, role: string, resource: string, action: string): Promise<boolean> {
    // Super admin has all permissions
    if (role === "super_admin") return true;
    
    const [permission] = await db.select()
      .from(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role),
        eq(rolePermissions.resource, resource),
        eq(rolePermissions.action, action)
      ));
    
    return !!permission;
  }
  
  // Tenant operations
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }
  
  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant;
  }
  
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }
  
  async updateTenant(id: number, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenantData, updatedAt: new Date().toISOString() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }
  
  async listTenants(options?: { limit?: number; offset?: number; }): Promise<Tenant[]> {
    let query = db.select().from(tenants).orderBy(asc(tenants.name));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countTenants(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants);
    return result?.count || 0;
  }
  
  async registerTenant(data: RegisterTenant): Promise<{ tenant: Tenant; user: User }> {
    return await db.transaction(async (tx) => {
      // Create tenant
      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          logo: data.logo,
          subscriptionPlan: data.subscriptionPlan,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionEndDate: data.subscriptionEndDate,
          maxUsers: data.maxUsers,
          maxSites: data.maxSites,
          stripeCustomerId: data.stripeCustomerId,
          settings: data.settings,
          isActive: true,
        })
        .returning();

      // Create admin user
      const [user] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          username: data.adminUser.username,
          email: data.adminUser.email,
          password: data.adminUser.password,
          firstName: data.adminUser.firstName,
          lastName: data.adminUser.lastName,
          phone: data.adminUser.phone,
          role: "safety_officer",
          isActive: true,
        })
        .returning();

      return { tenant, user };
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // We'll use soft delete by marking user as inactive rather than removing
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return !!updatedUser;
  }
  
  async listUsers(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<User[]> {
    let query = db.select().from(users)
      .where(and(
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      ))
      .orderBy(asc(users.lastName), asc(users.firstName));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countUsers(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      ));
    return result?.count || 0;
  }
  
  // Hazard report operations
  async listHazardReports(tenantId: number, options?: { 
    siteId?: number;
    status?: string;
    assignedTo?: number;
    reportedBy?: number;
    limit?: number; 
    offset?: number;
  }): Promise<HazardReport[]> {
    let query = db.select({
      hazardReport: hazardReports,
      site: {
        id: sites.id,
        name: sites.name,
      },
      reportedBy: {
        id: reporterUsers.id,
        firstName: reporterUsers.firstName,
        lastName: reporterUsers.lastName,
      },
      assignedTo: {
        id: assigneeUsers.id,
        firstName: assigneeUsers.firstName,
        lastName: assigneeUsers.lastName,
      },
    })
    .from(hazardReports)
    .leftJoin(sites, eq(hazardReports.siteId, sites.id))
    .leftJoin(users.as('reporter'), eq(hazardReports.reportedBy, reporterUsers.id))
    .leftJoin(users.as('assignee'), eq(hazardReports.assignedTo, assigneeUsers.id))
    .where(eq(hazardReports.tenantId, tenantId))
    .orderBy(desc(hazardReports.reportedAt));
    
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status));
    }
    
    if (options?.assignedTo) {
      query = query.where(eq(hazardReports.assignedTo, options.assignedTo));
    }
    
    if (options?.reportedBy) {
      query = query.where(eq(hazardReports.reportedBy, options.reportedBy));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    const results = await query;
    
    return results.map(row => ({
      ...row.hazardReport,
      site: row.site,
      reportedByUser: row.reportedBy,
      assignedToUser: row.assignedTo
    }));
  }
  
  async countHazardReports(tenantId: number, options?: { 
    siteId?: number;
    status?: string;
    assignedTo?: number;
    reportedBy?: number;
  }): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status));
    }
    
    if (options?.assignedTo) {
      query = query.where(eq(hazardReports.assignedTo, options.assignedTo));
    }
    
    if (options?.reportedBy) {
      query = query.where(eq(hazardReports.reportedBy, options.reportedBy));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }
  
  async getHazardReport(id: number): Promise<HazardReport | undefined> {
    const [hazardReport] = await db.select().from(hazardReports).where(eq(hazardReports.id, id));
    
    if (!hazardReport) return undefined;
    
    // Get site details
    const [site] = await db.select().from(sites).where(eq(sites.id, hazardReport.siteId));
    
    // Get reporter details
    const [reportedByUser] = await db.select().from(users).where(eq(users.id, hazardReport.reportedBy));
    
    // Get assignee details if assigned
    let assignedToUser;
    if (hazardReport.assignedTo) {
      [assignedToUser] = await db.select().from(users).where(eq(users.id, hazardReport.assignedTo));
    }
    
    // Get comments
    const comments = await db.select({
      comment: hazardComments,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(hazardComments)
    .leftJoin(users, eq(hazardComments.userId, users.id))
    .where(eq(hazardComments.hazardReportId, id))
    .orderBy(asc(hazardComments.createdAt));
    
    return {
      ...hazardReport,
      site,
      reportedByUser,
      assignedToUser,
      comments: comments.map(c => ({
        ...c.comment,
        user: c.user
      }))
    };
  }
  
  async createHazardReport(report: InsertHazardReport): Promise<HazardReport> {
    const [newReport] = await db.insert(hazardReports).values(report).returning();
    return newReport;
  }
  
  async updateHazardReport(id: number, reportData: Partial<InsertHazardReport>): Promise<HazardReport | undefined> {
    const [updatedReport] = await db
      .update(hazardReports)
      .set({ ...reportData, updatedAt: new Date().toISOString() })
      .where(eq(hazardReports.id, id))
      .returning();
    return updatedReport;
  }
  
  async addHazardComment(comment: InsertHazardComment): Promise<HazardComment> {
    const [newComment] = await db.insert(hazardComments).values(comment).returning();
    return newComment;
  }
  
  async getHazardStats(tenantId: number): Promise<{
    total: number;
    open: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    closed: number;
    bySite: Array<{ siteId: number; siteName: string; count: number }>;
    byRisk: Array<{ riskLevel: string; count: number }>;
  }> {
    // Total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    // Count by status
    const statusCounts = await db
      .select({
        status: hazardReports.status,
        count: sql<number>`count(*)`
      })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId))
      .groupBy(hazardReports.status);
    
    // Count by site
    const siteCounts = await db
      .select({
        siteId: hazardReports.siteId,
        siteName: sites.name,
        count: sql<number>`count(*)`
      })
      .from(hazardReports)
      .leftJoin(sites, eq(hazardReports.siteId, sites.id))
      .where(eq(hazardReports.tenantId, tenantId))
      .groupBy(hazardReports.siteId, sites.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);
    
    // Count by risk level
    const riskCounts = await db
      .select({
        riskLevel: hazardReports.riskLevel,
        count: sql<number>`count(*)`
      })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId))
      .groupBy(hazardReports.riskLevel)
      .orderBy(desc(sql<number>`count(*)`));
    
    const statusMap = Object.fromEntries(
      statusCounts.map(item => [item.status, Number(item.count)])
    );
    
    return {
      total: Number(totalResult?.count || 0),
      open: statusMap['open'] || 0,
      assigned: statusMap['assigned'] || 0,
      inProgress: statusMap['in_progress'] || 0,
      resolved: statusMap['resolved'] || 0,
      closed: statusMap['closed'] || 0,
      bySite: siteCounts.map(item => ({
        siteId: item.siteId,
        siteName: item.siteName || 'Unknown Site',
        count: Number(item.count)
      })),
      byRisk: riskCounts.map(item => ({
        riskLevel: item.riskLevel || 'Unknown',
        count: Number(item.count)
      }))
    };
  }
  
  // Inspection operations
  async listInspectionTemplates(tenantId: number, options?: { 
    limit?: number; 
    offset?: number;
  }): Promise<InspectionTemplate[]> {
    let query = db.select().from(inspectionTemplates)
      .where(eq(inspectionTemplates.tenantId, tenantId))
      .orderBy(asc(inspectionTemplates.name));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async countInspectionTemplates(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspectionTemplates)
      .where(eq(inspectionTemplates.tenantId, tenantId));
    return result?.count || 0;
  }
  
  async getInspectionTemplate(id: number): Promise<InspectionTemplate | undefined> {
    const [template] = await db
      .select()
      .from(inspectionTemplates)
      .where(eq(inspectionTemplates.id, id));
    
    if (!template) return undefined;
    
    // Get sections and items
    const sections = await db
      .select()
      .from(inspectionSections)
      .where(eq(inspectionSections.templateId, id))
      .orderBy(asc(inspectionSections.order));
    
    for (const section of sections) {
      section.items = await db
        .select()
        .from(inspectionItems)
        .where(eq(inspectionItems.sectionId, section.id))
        .orderBy(asc(inspectionItems.order));
    }
    
    return {
      ...template,
      sections
    };
  }
  
  async createInspectionTemplate(template: InsertInspectionTemplate): Promise<InspectionTemplate> {
    return await db.transaction(async (tx) => {
      // Insert template
      const [newTemplate] = await tx
        .insert(inspectionTemplates)
        .values({
          tenantId: template.tenantId,
          name: template.name,
          description: template.description,
          category: template.category,
          isActive: template.isActive ?? true,
          createdBy: template.createdBy,
        })
        .returning();
      
      if (template.sections) {
        for (let i = 0; i < template.sections.length; i++) {
          const section = template.sections[i];
          
          // Insert section
          const [newSection] = await tx
            .insert(inspectionSections)
            .values({
              templateId: newTemplate.id,
              name: section.name,
              description: section.description,
              order: i,
            })
            .returning();
          
          if (section.items) {
            for (let j = 0; j < section.items.length; j++) {
              const item = section.items[j];
              
              // Insert item
              await tx
                .insert(inspectionItems)
                .values({
                  sectionId: newSection.id,
                  question: item.question,
                  type: item.type,
                  required: item.required,
                  options: item.options,
                  order: j,
                });
            }
          }
        }
      }
      
      return newTemplate;
    });
  }
  
  async updateInspectionTemplate(id: number, templateData: Partial<InspectionTemplate>): Promise<InspectionTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(inspectionTemplates)
      .set({ 
        ...templateData,
        updatedAt: new Date().toISOString() 
      })
      .where(eq(inspectionTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }
  
  async deleteInspectionTemplate(id: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      // Find sections
      const sections = await tx
        .select({ id: inspectionSections.id })
        .from(inspectionSections)
        .where(eq(inspectionSections.templateId, id));
      
      // Delete items in each section
      for (const section of sections) {
        await tx
          .delete(inspectionItems)
          .where(eq(inspectionItems.sectionId, section.id));
      }
      
      // Delete sections
      await tx
        .delete(inspectionSections)
        .where(eq(inspectionSections.templateId, id));
      
      // Delete template
      const result = await tx
        .delete(inspectionTemplates)
        .where(eq(inspectionTemplates.id, id));
      
      return result.rowCount > 0;
    });
  }
  
  async listInspections(tenantId: number, options?: { 
    siteId?: number;
    status?: string;
    conductedBy?: number;
    limit?: number; 
    offset?: number;
  }): Promise<Inspection[]> {
    let query = db.select({
      inspection: inspections,
      site: {
        id: sites.id,
        name: sites.name,
      },
      conductedBy: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
      template: {
        id: inspectionTemplates.id,
        name: inspectionTemplates.name,
      }
    })
    .from(inspections)
    .leftJoin(sites, eq(inspections.siteId, sites.id))
    .leftJoin(users, eq(inspections.conductedBy, users.id))
    .leftJoin(inspectionTemplates, eq(inspections.templateId, inspectionTemplates.id))
    .where(eq(inspections.tenantId, tenantId))
    .orderBy(desc(inspections.conductedAt));
    
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status));
    }
    
    if (options?.conductedBy) {
      query = query.where(eq(inspections.conductedBy, options.conductedBy));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    const results = await query;
    
    return results.map(row => ({
      ...row.inspection,
      site: row.site,
      conductedByUser: row.conductedBy,
      template: row.template
    }));
  }
  
  async countInspections(tenantId: number, options?: { 
    siteId?: number;
    status?: string;
    conductedBy?: number;
  }): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(eq(inspections.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status));
    }
    
    if (options?.conductedBy) {
      query = query.where(eq(inspections.conductedBy, options.conductedBy));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }
  
  async getInspection(id: number): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    
    if (!inspection) return undefined;
    
    // Get template with sections and items
    const template = await this.getInspectionTemplate(inspection.templateId);
    
    // Get responses
    const responses = await db
      .select()
      .from(inspectionResponses)
      .where(eq(inspectionResponses.inspectionId, id));
    
    // Get site info
    const [site] = await db.select().from(sites).where(eq(sites.id, inspection.siteId));
    
    // Get user who conducted
    const [conductedByUser] = await db.select().from(users).where(eq(users.id, inspection.conductedBy));
    
    return {
      ...inspection,
      template,
      responses,
      site,
      conductedByUser
    };
  }
  
  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db
      .insert(inspections)
      .values(inspection)
      .returning();
    return newInspection;
  }
  
  async updateInspection(id: number, inspectionData: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const [updatedInspection] = await db
      .update(inspections)
      .set({ 
        ...inspectionData,
        updatedAt: new Date().toISOString() 
      })
      .where(eq(inspections.id, id))
      .returning();
    return updatedInspection;
  }
  
  async addInspectionResponse(response: InsertInspectionResponse): Promise<InspectionResponse> {
    const [newResponse] = await db
      .insert(inspectionResponses)
      .values(response)
      .returning();
    return newResponse;
  }
  
  async updateInspectionResponse(id: number, responseData: Partial<InsertInspectionResponse>): Promise<InspectionResponse | undefined> {
    const [updatedResponse] = await db
      .update(inspectionResponses)
      .set({ 
        ...responseData,
        updatedAt: new Date().toISOString() 
      })
      .where(eq(inspectionResponses.id, id))
      .returning();
    return updatedResponse;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async listUsers(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<User[]> {
    const query = db.select().from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(asc(users.lastName));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    return await query;
  }

  async countUsers(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.tenantId, tenantId));
    return result?.count || 0;
  }

  // Tenant operations
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: number, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenantData, updatedAt: new Date().toISOString() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  async deleteTenant(id: number): Promise<boolean> {
    await db.delete(tenants).where(eq(tenants.id, id));
    return true;
  }

  async listTenants(options?: { limit?: number; offset?: number; }): Promise<Tenant[]> {
    const query = db.select().from(tenants).orderBy(asc(tenants.name));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    return await query;
  }

  async countTenants(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants);
    return result?.count || 0;
  }

  async registerTenant(data: RegisterTenant): Promise<{ tenant: Tenant; user: User }> {
    return await db.transaction(async (tx) => {
      // Create tenant
      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          logo: data.logo,
          subscriptionPlan: data.subscriptionPlan,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionEndDate: data.subscriptionEndDate,
          maxUsers: data.maxUsers,
          maxSites: data.maxSites,
          stripeCustomerId: data.stripeCustomerId,
          settings: data.settings,
          isActive: data.isActive ?? true,
        })
        .returning();

      // Create admin user
      const [user] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          username: data.adminUser.username,
          email: data.adminUser.email,
          password: data.adminUser.password,
          firstName: data.adminUser.firstName,
          lastName: data.adminUser.lastName,
          role: 'safety_officer',  // Default role for tenant admin
          phone: data.adminUser.phone,
          isActive: true,
        })
        .returning();

      // Set default permissions for the tenant
      await this.setupDefaultPermissions(tx, tenant.id);

      return { tenant, user };
    });
  }

  private async setupDefaultPermissions(tx: any, tenantId: number): Promise<void> {
    // Safety Officer permissions (full access)
    const safetyOfficerPermissions = [
      // User management
      { tenantId, role: 'safety_officer', resource: 'users', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'delete' },
      
      // Hazard management
      { tenantId, role: 'safety_officer', resource: 'hazards', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'hazards', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'hazards', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'hazards', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'inspections', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'inspections', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'inspections', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'inspections', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'permits', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'permits', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'permits', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'permits', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'incidents', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'incidents', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'incidents', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'incidents', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'training', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'training', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'training', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'training', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'users', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'sites', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'sites', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'sites', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'sites', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'subcontractors', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'subcontractors', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'subcontractors', action: 'update' },
      { tenantId, role: 'safety_officer', resource: 'subcontractors', action: 'delete' },
      { tenantId, role: 'safety_officer', resource: 'reports', action: 'create' },
      { tenantId, role: 'safety_officer', resource: 'reports', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'settings', action: 'read' },
      { tenantId, role: 'safety_officer', resource: 'settings', action: 'update' },
    ];

    // Supervisor permissions (limited access)
    const supervisorPermissions = [
      { tenantId, role: 'supervisor', resource: 'hazards', action: 'create' },
      { tenantId, role: 'supervisor', resource: 'hazards', action: 'read' },
      { tenantId, role: 'supervisor', resource: 'hazards', action: 'update' },
      { tenantId, role: 'supervisor', resource: 'inspections', action: 'create' },
      { tenantId, role: 'supervisor', resource: 'inspections', action: 'read' },
      { tenantId, role: 'supervisor', resource: 'inspections', action: 'update' },
      { tenantId, role: 'supervisor', resource: 'permits', action: 'create' },
      { tenantId, role: 'supervisor', resource: 'permits', action: 'read' },
      { tenantId, role: 'supervisor', resource: 'incidents', action: 'create' },
      { tenantId, role: 'supervisor', resource: 'incidents', action: 'read' },
      { tenantId, role: 'supervisor', resource: 'training', action: 'read' },
    ];

    // Subcontractor permissions
    const subcontractorPermissions = [
      { tenantId, role: 'subcontractor', resource: 'hazards', action: 'read' },
      { tenantId, role: 'subcontractor', resource: 'hazards', action: 'update' },
      { tenantId, role: 'subcontractor', resource: 'permits', action: 'read' },
      { tenantId, role: 'subcontractor', resource: 'training', action: 'read' },
    ];

    // Employee permissions
    const employeePermissions = [
      { tenantId, role: 'employee', resource: 'hazards', action: 'create' },
      { tenantId, role: 'employee', resource: 'hazards', action: 'read' },
      { tenantId, role: 'employee', resource: 'incidents', action: 'create' },
      { tenantId, role: 'employee', resource: 'incidents', action: 'read' },
      { tenantId, role: 'employee', resource: 'training', action: 'read' },
    ];

    const allPermissions = [
      ...safetyOfficerPermissions,
      ...supervisorPermissions,
      ...subcontractorPermissions,
      ...employeePermissions
    ];

    await tx.insert(rolePermissions).values(allPermissions);
  }

  // Site operations
  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db.insert(sites).values(site).returning();
    
    // Update tenant active sites count
    if (newSite.tenantId) {
      await db
        .update(tenants)
        .set({ 
          activeSites: sql`${tenants.activeSites} + 1`,
          updatedAt: new Date().toISOString()
        })
        .where(eq(tenants.id, newSite.tenantId));
    }
    
    return newSite;
  }

  async updateSite(id: number, siteData: Partial<InsertSite>): Promise<Site | undefined> {
    const [updatedSite] = await db
      .update(sites)
      .set({ ...siteData, updatedAt: new Date().toISOString() })
      .where(eq(sites.id, id))
      .returning();
    return updatedSite;
  }

  async deleteSite(id: number): Promise<boolean> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    
    if (site) {
      await db.delete(sites).where(eq(sites.id, id));
      
      // Update tenant active sites count
      if (site.tenantId) {
        await db
          .update(tenants)
          .set({ 
            activeSites: sql`${tenants.activeSites} - 1`,
            updatedAt: new Date().toISOString()
          })
          .where(eq(tenants.id, site.tenantId));
      }
    }
    
    return true;
  }

  async listSites(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<Site[]> {
    const query = db.select().from(sites)
      .where(eq(sites.tenantId, tenantId))
      .orderBy(asc(sites.name));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    return await query;
  }

  async countSites(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(eq(sites.tenantId, tenantId));
    return result?.count || 0;
  }

  // Subcontractor operations
  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    const [subcontractor] = await db.select().from(subcontractors).where(eq(subcontractors.id, id));
    return subcontractor;
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const [newSubcontractor] = await db.insert(subcontractors).values(subcontractor).returning();
    return newSubcontractor;
  }

  async updateSubcontractor(id: number, subcontractorData: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined> {
    const [updatedSubcontractor] = await db
      .update(subcontractors)
      .set({ ...subcontractorData, updatedAt: new Date().toISOString() })
      .where(eq(subcontractors.id, id))
      .returning();
    return updatedSubcontractor;
  }

  async deleteSubcontractor(id: number): Promise<boolean> {
    await db.delete(subcontractors).where(eq(subcontractors.id, id));
    return true;
  }

  async listSubcontractors(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<Subcontractor[]> {
    const query = db.select().from(subcontractors)
      .where(eq(subcontractors.tenantId, tenantId))
      .orderBy(asc(subcontractors.name));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    return await query;
  }

  async countSubcontractors(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subcontractors)
      .where(eq(subcontractors.tenantId, tenantId));
    return result?.count || 0;
  }
  
  // Site Personnel operations
  async getSitePersonnel(id: number): Promise<SitePersonnel | undefined> {
    const [personnel] = await db.select().from(sitePersonnel).where(eq(sitePersonnel.id, id));
    return personnel;
  }
  
  async assignUserToSite(data: InsertSitePersonnel): Promise<SitePersonnel> {
    // Add created timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const [newAssignment] = await db.insert(sitePersonnel).values(dataWithTimestamp).returning();
    return newAssignment;
  }
  
  async updateSitePersonnel(id: number, data: Partial<InsertSitePersonnel>): Promise<SitePersonnel | undefined> {
    const [updatedAssignment] = await db
      .update(sitePersonnel)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(sitePersonnel.id, id))
      .returning();
    return updatedAssignment;
  }
  
  async removeSitePersonnel(id: number): Promise<boolean> {
    await db.delete(sitePersonnel).where(eq(sitePersonnel.id, id));
    return true;
  }
  
  async listSitePersonnelBySite(siteId: number, options?: { limit?: number; offset?: number; }): Promise<SitePersonnel[]> {
    try {
      // First get the site personnel records
      const personnelRecords = await db
        .select()
        .from(sitePersonnel)
        .where(eq(sitePersonnel.siteId, siteId));
      
      // Then get the user details for each personnel record
      const personnel = await Promise.all(
        personnelRecords.map(async (record) => {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, record.userId));
          
          // Combine the data
          return {
            ...record,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            userEmail: user ? user.email : '',
            userRole: user ? user.role : null
          };
        })
      );
      
      // Sort the results
      return personnel.sort((a, b) => a.userName.localeCompare(b.userName));
    } catch (error) {
      console.error("Error in listSitePersonnelBySite:", error);
      return [];
    }
  }
  
  async countSitePersonnel(siteId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sitePersonnel)
      .where(eq(sitePersonnel.siteId, siteId));
    return result?.count || 0;
  }
  
  async getSitePersonnel(id: number): Promise<any> {
    try {
      const [record] = await db.select().from(sitePersonnel).where(eq(sitePersonnel.id, id));
      
      if (!record) {
        return undefined;
      }
      
      // Get the user details to include in the response
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, record.userId));
      
      // Combine the data
      return {
        ...record,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userEmail: user ? user.email : '',
        userRole: user ? user.role : null
      };
    } catch (error) {
      console.error("Error in getSitePersonnel:", error);
      return undefined;
    }
  }
  
  async updateSitePersonnel(updateData: { 
    id: number; 
    siteRole?: string;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
  }): Promise<any> {
    try {
      const { id, ...data } = updateData;
      
      const [updatedRecord] = await db
        .update(sitePersonnel)
        .set({ 
          ...data, 
          updatedAt: new Date().toISOString() 
        })
        .where(eq(sitePersonnel.id, id))
        .returning();
      
      if (!updatedRecord) {
        return undefined;
      }
      
      // Get the user details to include in the response
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, updatedRecord.userId));
      
      // Combine the data
      return {
        ...updatedRecord,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userEmail: user ? user.email : '',
        userRole: user ? user.role : null
      };
    } catch (error) {
      console.error("Error in updateSitePersonnel:", error);
      throw error;
    }
  }

  // Hazard operations
  async getHazardReport(id: number): Promise<HazardReport | undefined> {
    const [hazard] = await db.select().from(hazardReports).where(eq(hazardReports.id, id));
    return hazard;
  }

  async createHazardReport(hazard: InsertHazardReport): Promise<HazardReport> {
    const [newHazard] = await db.insert(hazardReports).values(hazard).returning();
    return newHazard;
  }

  async updateHazardReport(id: number, hazardData: Partial<InsertHazardReport>): Promise<HazardReport | undefined> {
    const [updatedHazard] = await db
      .update(hazardReports)
      .set({ ...hazardData, updatedAt: new Date().toISOString() })
      .where(eq(hazardReports.id, id))
      .returning();
    return updatedHazard;
  }

  async deleteHazardReport(id: number): Promise<boolean> {
    await db.delete(hazardReports).where(eq(hazardReports.id, id));
    return true;
  }

  async listHazardReports(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string; 
    severity?: string;
  }): Promise<HazardReport[]> {
    let query = db.select().from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status as any));
    }
    
    if (options?.severity) {
      query = query.where(eq(hazardReports.severity, options.severity as any));
    }
    
    query = query.orderBy(desc(hazardReports.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countHazardReports(tenantId: number, options?: { 
    siteId?: number; 
    status?: string; 
    severity?: string;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(hazardReports.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(hazardReports.status, options.status as any));
    }
    
    if (options?.severity) {
      query = query.where(eq(hazardReports.severity, options.severity as any));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Hazard assignment operations
  async createHazardAssignment(assignment: InsertHazardAssignment): Promise<HazardAssignment> {
    const [newAssignment] = await db.insert(hazardAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateHazardAssignment(id: number, assignmentData: Partial<InsertHazardAssignment>): Promise<HazardAssignment | undefined> {
    const [updatedAssignment] = await db
      .update(hazardAssignments)
      .set({ ...assignmentData, updatedAt: new Date().toISOString() })
      .where(eq(hazardAssignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async listHazardAssignments(hazardId: number): Promise<HazardAssignment[]> {
    return await db
      .select()
      .from(hazardAssignments)
      .where(eq(hazardAssignments.hazardId, hazardId))
      .orderBy(desc(hazardAssignments.assignedAt));
  }

  // Hazard comment operations
  async createHazardComment(comment: InsertHazardComment): Promise<HazardComment> {
    const [newComment] = await db.insert(hazardComments).values(comment).returning();
    return newComment;
  }

  async listHazardComments(hazardId: number): Promise<HazardComment[]> {
    return await db
      .select()
      .from(hazardComments)
      .where(eq(hazardComments.hazardId, hazardId))
      .orderBy(asc(hazardComments.createdAt));
  }

  // Inspection operations
  async getInspection(id: number): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection;
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db.insert(inspections).values(inspection).returning();
    return newInspection;
  }

  async updateInspection(id: number, inspectionData: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const [updatedInspection] = await db
      .update(inspections)
      .set({ ...inspectionData, updatedAt: new Date().toISOString() })
      .where(eq(inspections.id, id))
      .returning();
    return updatedInspection;
  }

  async deleteInspection(id: number): Promise<boolean> {
    await db.delete(inspections).where(eq(inspections.id, id));
    return true;
  }

  async listInspections(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string;
  }): Promise<Inspection[]> {
    let query = db.select().from(inspections)
      .where(eq(inspections.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status as any));
    }
    
    query = query.orderBy(desc(inspections.scheduledDate));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countInspections(tenantId: number, options?: { 
    siteId?: number; 
    status?: string;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(eq(inspections.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(inspections.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(inspections.status, options.status as any));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Permit operations
  async getPermitRequest(id: number): Promise<PermitRequest | undefined> {
    const [permit] = await db.select().from(permitRequests).where(eq(permitRequests.id, id));
    return permit;
  }

  async createPermitRequest(permit: InsertPermitRequest): Promise<PermitRequest> {
    const [newPermit] = await db.insert(permitRequests).values(permit).returning();
    return newPermit;
  }

  async updatePermitRequest(id: number, permitData: Partial<InsertPermitRequest>): Promise<PermitRequest | undefined> {
    const [updatedPermit] = await db
      .update(permitRequests)
      .set({ ...permitData, updatedAt: new Date().toISOString() })
      .where(eq(permitRequests.id, id))
      .returning();
    return updatedPermit;
  }

  async deletePermitRequest(id: number): Promise<boolean> {
    await db.delete(permitRequests).where(eq(permitRequests.id, id));
    return true;
  }

  async listPermitRequests(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    status?: string;
  }): Promise<PermitRequest[]> {
    let query = db.select().from(permitRequests)
      .where(eq(permitRequests.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(permitRequests.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(permitRequests.status, options.status as any));
    }
    
    query = query.orderBy(desc(permitRequests.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countPermitRequests(tenantId: number, options?: { 
    siteId?: number; 
    status?: string;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(permitRequests)
      .where(eq(permitRequests.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(permitRequests.siteId, options.siteId));
    }
    
    if (options?.status) {
      query = query.where(eq(permitRequests.status, options.status as any));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Incident operations
  async getIncidentReport(id: number): Promise<IncidentReport | undefined> {
    const [incident] = await db.select().from(incidentReports).where(eq(incidentReports.id, id));
    return incident;
  }

  async createIncidentReport(incident: InsertIncidentReport): Promise<IncidentReport> {
    const [newIncident] = await db.insert(incidentReports).values(incident).returning();
    return newIncident;
  }

  async updateIncidentReport(id: number, incidentData: Partial<InsertIncidentReport>): Promise<IncidentReport | undefined> {
    const [updatedIncident] = await db
      .update(incidentReports)
      .set({ ...incidentData, updatedAt: new Date().toISOString() })
      .where(eq(incidentReports.id, id))
      .returning();
    return updatedIncident;
  }

  async deleteIncidentReport(id: number): Promise<boolean> {
    await db.delete(incidentReports).where(eq(incidentReports.id, id));
    return true;
  }

  async listIncidentReports(tenantId: number, options?: { 
    limit?: number; 
    offset?: number; 
    siteId?: number; 
    severity?: string;
  }): Promise<IncidentReport[]> {
    let query = db.select().from(incidentReports)
      .where(eq(incidentReports.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(incidentReports.siteId, options.siteId));
    }
    
    if (options?.severity) {
      query = query.where(eq(incidentReports.severity, options.severity as any));
    }
    
    query = query.orderBy(desc(incidentReports.incidentDate));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countIncidentReports(tenantId: number, options?: { 
    siteId?: number; 
    severity?: string;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(incidentReports)
      .where(eq(incidentReports.tenantId, tenantId));
    
    if (options?.siteId) {
      query = query.where(eq(incidentReports.siteId, options.siteId));
    }
    
    if (options?.severity) {
      query = query.where(eq(incidentReports.severity, options.severity as any));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    // Use a direct SQL query to bypass the issue with the teams import
    try {
      console.log("Creating team with data:", JSON.stringify(teamData));
      
      const result = await db.execute(
        `INSERT INTO teams (
          tenant_id, site_id, name, description, leader_id, color, specialties, created_by_id, created_at, updated_at, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *`,
        [
          teamData.tenantId,
          teamData.siteId,
          teamData.name,
          teamData.description || null,
          teamData.leaderId || null,
          teamData.color || null,
          teamData.specialties ? JSON.stringify(teamData.specialties) : null,
          teamData.createdById,
          new Date().toISOString(),
          new Date().toISOString(),
          true
        ]
      );
      
      console.log("Team created successfully, result:", result.rows[0]);
      return result.rows[0] as Team;
    } catch (error) {
      console.error("Error in createTeam:", error);
      throw error;
    }
  }

  async updateTeam(id: number, teamData: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...teamData, updatedAt: new Date().toISOString() })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    try {
      await db.update(teams).set({ isActive: false }).where(eq(teams.id, id));
      return true;
    } catch (error) {
      console.error("Error in deleteTeam:", error);
      return false;
    }
  }

  async listTeamsBySite(siteId: number): Promise<Team[]> {
    const teamList = await db
      .select()
      .from(teams)
      .where(and(
        eq(teams.siteId, siteId),
        eq(teams.isActive, true)
      ))
      .orderBy(teams.name);
    return teamList;
  }

  async listTeamsByTenant(tenantId: number): Promise<any[]> {
    try {
      // Use Drizzle ORM to query teams
      const teamList = await db
        .select()
        .from(teams)
        .where(and(
          eq(teams.tenantId, tenantId),
          eq(teams.isActive, true)
        ))
        .orderBy(teams.name);
      
      // Enhance teams with member counts
      const enhancedTeams = await Promise.all(
        teamList.map(async (team) => {
          const memberCount = await this.countTeamMembers(team.id);
          return {
            ...team,
            memberCount
          };
        })
      );
      
      return enhancedTeams;
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  }
  
  async countTeamMembers(teamId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sitePersonnel)
        .where(and(
          eq(sitePersonnel.teamId, teamId),
          eq(sitePersonnel.isActive, true)
        ));
      
      return result?.count || 0;
    } catch (error) {
      console.error("Error counting team members:", error);
      return 0;
    }
  }
  
  async listTeamsBySite(siteId: number): Promise<any[]> {
    try {
      // Use Drizzle ORM to query teams by site
      const teamList = await db
        .select()
        .from(teams)
        .where(and(
          eq(teams.siteId, siteId),
          eq(teams.isActive, true)
        ))
        .orderBy(teams.name);
      
      // Enhance teams with member counts
      const enhancedTeams = await Promise.all(
        teamList.map(async (team) => {
          const memberCount = await this.countTeamMembers(team.id);
          return {
            ...team,
            memberCount
          };
        })
      );
      
      return enhancedTeams;
    } catch (error) {
      console.error("Error fetching teams for site:", error);
      return [];
    }
  }

  async getTeamMembers(teamId: number): Promise<any[]> {
    // Get all personnel assigned to this team
    const personnelRecords = await db
      .select()
      .from(sitePersonnel)
      .where(and(
        eq(sitePersonnel.teamId, teamId),
        eq(sitePersonnel.isActive, true)
      ));
    
    if (personnelRecords.length === 0) {
      return [];
    }
    
    // Get user details for all team members
    const personnel = await Promise.all(
      personnelRecords.map(async (record) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, record.userId));
        
        return {
          ...record,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          userEmail: user ? user.email : '',
          userRole: user ? user.role : null
        };
      })
    );
    
    return personnel;
  }

  async assignPersonnelToTeam(personnelId: number, teamId: number): Promise<any> {
    try {
      // First, get the personnel record to ensure it exists
      const [personnel] = await db
        .select()
        .from(sitePersonnel)
        .where(eq(sitePersonnel.id, personnelId));
      
      if (!personnel) {
        throw new Error("Personnel not found");
      }
      
      // Then update the record with the team ID
      const [updatedPersonnel] = await db
        .update(sitePersonnel)
        .set({ 
          teamId: teamId,
          updatedAt: new Date().toISOString()
        })
        .where(eq(sitePersonnel.id, personnelId))
        .returning();
      
      return updatedPersonnel;
    } catch (error) {
      console.error("Error assigning personnel to team:", error);
      throw error;
    }
  }
  
  async removePersonnelFromTeam(personnelId: number): Promise<any> {
    try {
      // Update the personnel record to set teamId to null
      const [updatedPersonnel] = await db
        .update(sitePersonnel)
        .set({ 
          teamId: null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(sitePersonnel.id, personnelId))
        .returning();
      
      return updatedPersonnel;
    } catch (error) {
      console.error("Error removing personnel from team:", error);
      throw error;
    }
  }

  // Training content operations
  async getTrainingContent(id: number): Promise<TrainingContent | undefined> {
    const [content] = await db.select().from(trainingContent).where(eq(trainingContent.id, id));
    return content;
  }

  async createTrainingContent(content: InsertTrainingContent): Promise<TrainingContent> {
    const [newContent] = await db.insert(trainingContent).values(content).returning();
    return newContent;
  }

  async updateTrainingContent(id: number, contentData: Partial<InsertTrainingContent>): Promise<TrainingContent | undefined> {
    const [updatedContent] = await db
      .update(trainingContent)
      .set({ ...contentData, updatedAt: new Date().toISOString() })
      .where(eq(trainingContent.id, id))
      .returning();
    return updatedContent;
  }

  async deleteTrainingContent(id: number): Promise<boolean> {
    await db.delete(trainingContent).where(eq(trainingContent.id, id));
    return true;
  }

  async listTrainingContent(options?: { 
    limit?: number; 
    offset?: number; 
    tenantId?: number; 
    isCommon?: boolean;
  }): Promise<TrainingContent[]> {
    let query = db.select().from(trainingContent);
    
    if (options?.tenantId !== undefined) {
      query = query.where(eq(trainingContent.tenantId, options.tenantId));
    }
    
    if (options?.isCommon !== undefined) {
      query = query.where(eq(trainingContent.isCommon, options.isCommon));
    }
    
    query = query.orderBy(asc(trainingContent.title));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countTrainingContent(options?: { 
    tenantId?: number; 
    isCommon?: boolean;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(trainingContent);
    
    if (options?.tenantId !== undefined) {
      query = query.where(eq(trainingContent.tenantId, options.tenantId));
    }
    
    if (options?.isCommon !== undefined) {
      query = query.where(eq(trainingContent.isCommon, options.isCommon));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Training course operations
  async getTrainingCourse(id: number): Promise<TrainingCourse | undefined> {
    const [course] = await db.select().from(trainingCourses).where(eq(trainingCourses.id, id));
    return course;
  }

  async createTrainingCourse(course: InsertTrainingCourse): Promise<TrainingCourse> {
    const [newCourse] = await db.insert(trainingCourses).values(course).returning();
    return newCourse;
  }

  async updateTrainingCourse(id: number, courseData: Partial<InsertTrainingCourse>): Promise<TrainingCourse | undefined> {
    const [updatedCourse] = await db
      .update(trainingCourses)
      .set({ ...courseData, updatedAt: new Date().toISOString() })
      .where(eq(trainingCourses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteTrainingCourse(id: number): Promise<boolean> {
    await db.delete(trainingCourses).where(eq(trainingCourses.id, id));
    return true;
  }

  async listTrainingCourses(tenantId: number, options?: { limit?: number; offset?: number; }): Promise<TrainingCourse[]> {
    let query = db.select().from(trainingCourses)
      .where(eq(trainingCourses.tenantId, tenantId))
      .orderBy(asc(trainingCourses.title));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countTrainingCourses(tenantId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingCourses)
      .where(eq(trainingCourses.tenantId, tenantId));
    return result?.count || 0;
  }

  // Training record operations
  async getTrainingRecord(id: number): Promise<TrainingRecord | undefined> {
    const [record] = await db.select().from(trainingRecords).where(eq(trainingRecords.id, id));
    return record;
  }

  async createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord> {
    const [newRecord] = await db.insert(trainingRecords).values(record).returning();
    return newRecord;
  }

  async updateTrainingRecord(id: number, recordData: Partial<InsertTrainingRecord>): Promise<TrainingRecord | undefined> {
    const [updatedRecord] = await db
      .update(trainingRecords)
      .set({ ...recordData, updatedAt: new Date().toISOString() })
      .where(eq(trainingRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async listTrainingRecords(options: { 
    tenantId: number;
    userId?: number;
    courseId?: number;
    limit?: number; 
    offset?: number;
  }): Promise<TrainingRecord[]> {
    let query = db.select().from(trainingRecords)
      .where(eq(trainingRecords.tenantId, options.tenantId));
    
    if (options.userId !== undefined) {
      query = query.where(eq(trainingRecords.userId, options.userId));
    }
    
    if (options.courseId !== undefined) {
      query = query.where(eq(trainingRecords.courseId, options.courseId));
    }
    
    query = query.orderBy(desc(trainingRecords.startDate));
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countTrainingRecords(options: { tenantId: number; userId?: number; courseId?: number; }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(eq(trainingRecords.tenantId, options.tenantId));
    
    if (options.userId !== undefined) {
      query = query.where(eq(trainingRecords.userId, options.userId));
    }
    
    if (options.courseId !== undefined) {
      query = query.where(eq(trainingRecords.courseId, options.courseId));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  async getTrainingProgressByUser(tenantId: number, userId: number): Promise<{ completed: number; total: number; progress: number; }> {
    // Count total assigned courses
    const [totalResult] = await db
      .select({ count: sql<number>`count(distinct ${trainingCourses.id})` })
      .from(trainingCourses)
      .where(eq(trainingCourses.tenantId, tenantId));
    
    const total = totalResult?.count || 0;
    
    // Count completed courses
    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.userId, userId),
        eq(trainingRecords.passed, true)
      ));
    
    const completed = completedResult?.count || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, progress };
  }

  async getTrainingProgressByCourse(tenantId: number, courseId: number): Promise<{ completed: number; total: number; progress: number; }> {
    // Count total users
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.tenantId, tenantId));
    
    const total = totalResult?.count || 0;
    
    // Count users who completed the course
    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.courseId, courseId),
        eq(trainingRecords.passed, true)
      ));
    
    const completed = completedResult?.count || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, progress };
  }

  // Email template operations
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getEmailTemplateByName(name: string, tenantId?: number): Promise<EmailTemplate | undefined> {
    let query = db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    
    if (tenantId !== undefined) {
      query = query.where(eq(emailTemplates.tenantId, tenantId));
    } else {
      query = query.where(isNull(emailTemplates.tenantId));
    }
    
    const [template] = await query;
    return template;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({ ...templateData, updatedAt: new Date().toISOString() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }

  async listEmailTemplates(options?: { tenantId?: number; limit?: number; offset?: number; }): Promise<EmailTemplate[]> {
    let query = db.select().from(emailTemplates);
    
    if (options?.tenantId !== undefined) {
      query = query.where(or(
        eq(emailTemplates.tenantId, options.tenantId),
        isNull(emailTemplates.tenantId)
      ));
    }
    
    query = query.orderBy(asc(emailTemplates.name));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  // Role permission operations
  async getRolePermissions(tenantId: number, role: string): Promise<RolePermission[]> {
    return await db
      .select()
      .from(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role as any)
      ));
  }

  async createRolePermission(permission: InsertRolePermission): Promise<RolePermission> {
    const [newPermission] = await db.insert(rolePermissions).values(permission).returning();
    return newPermission;
  }

  async deleteRolePermission(id: number): Promise<boolean> {
    await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
    return true;
  }

  async hasPermission(tenantId: number, role: string, resource: string, action: string): Promise<boolean> {
    const [permission] = await db
      .select()
      .from(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role as any),
        eq(rolePermissions.resource, resource),
        eq(rolePermissions.action, action)
      ));
    
    return !!permission;
  }

  // System logs operations
  async createSystemLog(log: { 
    tenantId?: number; 
    userId?: number; 
    action: string; 
    entityType?: string; 
    entityId?: string; 
    details?: any; 
    ipAddress?: string; 
    userAgent?: string;
  }): Promise<SystemLog> {
    const [newLog] = await db.insert(systemLogs).values(log).returning();
    return newLog;
  }

  async listSystemLogs(options?: { 
    tenantId?: number; 
    userId?: number; 
    action?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<SystemLog[]> {
    let query = db.select().from(systemLogs);
    
    if (options?.tenantId !== undefined) {
      query = query.where(eq(systemLogs.tenantId, options.tenantId));
    }
    
    if (options?.userId !== undefined) {
      query = query.where(eq(systemLogs.userId, options.userId));
    }
    
    if (options?.action) {
      query = query.where(eq(systemLogs.action, options.action));
    }
    
    query = query.orderBy(desc(systemLogs.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async countSystemLogs(options?: { tenantId?: number; userId?: number; action?: string; }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` })
      .from(systemLogs);
    
    if (options?.tenantId !== undefined) {
      query = query.where(eq(systemLogs.tenantId, options.tenantId));
    }
    
    if (options?.userId !== undefined) {
      query = query.where(eq(systemLogs.userId, options.userId));
    }
    
    if (options?.action) {
      query = query.where(eq(systemLogs.action, options.action));
    }
    
    const [result] = await query;
    return result?.count || 0;
  }

  // Dashboard statistics
  async getHazardStats(tenantId: number): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: { severity: string; count: number }[];
  }> {
    // Get total hazards
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId));
    
    // Get hazards by status
    const [openResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        eq(hazardReports.status, 'open')
      ));
    
    const [inProgressResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        eq(hazardReports.status, 'in_progress')
      ));
    
    const [resolvedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        eq(hazardReports.status, 'resolved')
      ));
    
    // Get hazards by severity
    const severityResults = await db
      .select({
        severity: hazardReports.severity,
        count: sql<number>`count(*)`
      })
      .from(hazardReports)
      .where(eq(hazardReports.tenantId, tenantId))
      .groupBy(hazardReports.severity);
    
    return {
      total: totalResult?.count || 0,
      open: openResult?.count || 0,
      inProgress: inProgressResult?.count || 0,
      resolved: resolvedResult?.count || 0,
      bySeverity: severityResults.map(r => ({ 
        severity: r.severity, 
        count: r.count 
      }))
    };
  }
  
  async getTrainingStats(tenantId: number): Promise<{
    totalUsers: number;
    completedTraining: number;
    inProgressTraining: number;
    completionRate: number;
    byCourse: { course: string; completed: number; total: number; rate: number }[];
  }> {
    // Get total users
    const [usersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.tenantId, tenantId));
    
    const totalUsers = usersResult?.count || 0;
    
    // Get training completion stats
    const completedQuery = db
      .select({
        userId: trainingRecords.userId,
        completed: sql<number>`count(distinct ${trainingRecords.courseId})`
      })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        eq(trainingRecords.passed, true)
      ))
      .groupBy(trainingRecords.userId);
    
    const completedResults = await completedQuery;
    
    // Get course statistics
    const courseQuery = db
      .select({
        courseId: trainingCourses.id,
        title: trainingCourses.title
      })
      .from(trainingCourses)
      .where(eq(trainingCourses.tenantId, tenantId));
    
    const courses = await courseQuery;
    
    const byCourse = await Promise.all(
      courses.map(async (course) => {
        const [completedResult] = await db
          .select({ count: sql<number>`count(distinct ${trainingRecords.userId})` })
          .from(trainingRecords)
          .where(and(
            eq(trainingRecords.tenantId, tenantId),
            eq(trainingRecords.courseId, course.courseId),
            eq(trainingRecords.passed, true)
          ));
        
        const completed = completedResult?.count || 0;
        const rate = totalUsers > 0 ? Math.round((completed / totalUsers) * 100) : 0;
        
        return {
          course: course.title,
          completed,
          total: totalUsers,
          rate
        };
      })
    );
    
    // Count users with at least one completed course
    const usersWithCompletedTraining = completedResults.length;
    
    // Count users with courses in progress but not completed
    const [inProgressResult] = await db
      .select({
        count: sql<number>`count(distinct ${trainingRecords.userId})`
      })
      .from(trainingRecords)
      .where(and(
        eq(trainingRecords.tenantId, tenantId),
        isNull(trainingRecords.completionDate)
      ));
    
    const inProgressTraining = inProgressResult?.count || 0;
    
    const completionRate = totalUsers > 0 ? Math.round((usersWithCompletedTraining / totalUsers) * 100) : 0;
    
    return {
      totalUsers,
      completedTraining: usersWithCompletedTraining,
      inProgressTraining,
      completionRate,
      byCourse
    };
  }

  async getSiteStats(tenantId: number): Promise<{
    totalSites: number;
    activeSites: number;
    sitesWithHazards: number;
    recentInspections: number;
  }> {
    // Get total sites
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(eq(sites.tenantId, tenantId));
    
    const totalSites = totalResult?.count || 0;
    
    // Get active sites
    const [activeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(and(
        eq(sites.tenantId, tenantId),
        eq(sites.isActive, true)
      ));
    
    const activeSites = activeResult?.count || 0;
    
    // Get sites with hazards
    const [hazardResult] = await db
      .select({
        count: sql<number>`count(distinct ${hazardReports.siteId})`
      })
      .from(hazardReports)
      .where(and(
        eq(hazardReports.tenantId, tenantId),
        or(
          eq(hazardReports.status, 'open'),
          eq(hazardReports.status, 'assigned'),
          eq(hazardReports.status, 'in_progress')
        )
      ));
    
    const sitesWithHazards = hazardResult?.count || 0;
    
    // Get recent inspections (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [inspectionResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(and(
        eq(inspections.tenantId, tenantId),
        sql`${inspections.completedDate} >= ${sevenDaysAgo.toISOString()}`
      ));
    
    const recentInspections = inspectionResult?.count || 0;
    
    return {
      totalSites,
      activeSites,
      sitesWithHazards,
      recentInspections
    };
  }
}

export const storage = new DatabaseStorage();

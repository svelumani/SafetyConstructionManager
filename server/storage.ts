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

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
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

  async listTeamsByTenant(tenantId: number): Promise<Team[]> {
    try {
      // Use the pool directly for a more reliable query
      const { pool } = await import('./db');
      
      const result = await pool.query(
        `SELECT * FROM teams 
         WHERE tenant_id = $1 AND is_active = true 
         ORDER BY name`,
        [tenantId]
      );
      
      console.log(`Found ${result.rows.length} teams for tenant ${tenantId}`);
      return result.rows as Team[];
    } catch (error) {
      console.error("Error fetching teams:", error);
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

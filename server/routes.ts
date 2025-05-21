import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth } from "./auth";
import { setupEmailService } from "./email";
import { userRoleEnum, insertTeamSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import {
  insertTenantSchema,
  insertUserSchema,
  insertSiteSchema,
  insertHazardReportSchema,
  insertHazardAssignmentSchema,
  insertHazardCommentSchema,
  insertInspectionSchema,
  insertPermitRequestSchema,
  insertIncidentReportSchema,
  insertTrainingContentSchema,
  insertTrainingCourseSchema,
  insertTrainingRecordSchema,
  insertRolePermissionSchema,
  insertEmailTemplateSchema,
  insertSitePersonnelSchema,
  registerTenantSchema,
  loginSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure that authenticated users have a tenantId and role to proceed
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    next();
  };

  // Make sure user has proper role for super admin operations
  const requireSuperAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'super_admin') {
      return res.status(403).send("Forbidden");
    }
    next();
  };

  // Middleware to check if user has the right permission for their tenant
  const requirePermission = (resource: string, action: string) => {
    return async (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }

      const user = req.user;
      if (user.role === 'super_admin') {
        return next(); // Super admin can do anything
      }

      const hasPermission = await storage.hasPermission(
        user.tenantId, 
        user.role, 
        resource, 
        action
      );

      if (!hasPermission) {
        return res.status(403).send("Forbidden");
      }

      next();
    };
  };

  // Set up authentication routes (login, register, logout)
  setupAuth(app);

  // Set up email service
  setupEmailService();

  // Error handling middleware
  const handleZodError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors
      });
    }
    next(err);
  };

  app.use("/api", handleZodError);

  // Tenant Registration
  app.post("/api/register-tenant", async (req, res) => {
    try {
      const data = registerTenantSchema.parse(req.body);
      
      // Check if tenant already exists
      const existingTenant = await storage.getTenantByEmail(data.email);
      if (existingTenant) {
        return res.status(400).json({ message: "Tenant already exists with this email" });
      }

      // Check if admin user already exists
      const existingUser = await storage.getUserByEmail(data.adminUser.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const result = await storage.registerTenant(data);
      
      // Create system log for tenant creation
      await storage.createSystemLog({
        tenantId: result.tenant.id,
        action: "tenant_registered",
        entityType: "tenant",
        entityId: result.tenant.id.toString(),
        details: { tenantName: result.tenant.name },
      });

      res.status(201).json({ 
        message: "Tenant registered successfully",
        tenant: result.tenant,
        user: { ...result.user, password: undefined } // Don't return password
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      console.error("Tenant registration error:", err);
      res.status(500).json({ message: "Failed to register tenant" });
    }
  });

  // Super Admin Routes
  // Tenants
  app.get("/api/tenants", requireSuperAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const tenants = await storage.listTenants({ limit, offset });
      const total = await storage.countTenants();
      
      res.json({ tenants, total });
    } catch (err) {
      console.error("Error fetching tenants:", err);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenant = await storage.getTenant(id);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      res.json(tenant);
    } catch (err) {
      console.error("Error fetching tenant:", err);
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  app.put("/api/tenants/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertTenantSchema.partial().parse(req.body);
      
      const updatedTenant = await storage.updateTenant(id, data);
      
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      await storage.createSystemLog({
        tenantId: id,
        userId: req.user.id,
        action: "tenant_updated",
        entityType: "tenant",
        entityId: id.toString(),
        details: data,
      });
      
      res.json(updatedTenant);
    } catch (err) {
      console.error("Error updating tenant:", err);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });

  // Email Templates
  app.get("/api/email-templates", requireSuperAdmin, async (req, res) => {
    try {
      const templates = await storage.listEmailTemplates();
      res.json(templates);
    } catch (err) {
      console.error("Error fetching email templates:", err);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/email-templates", requireSuperAdmin, async (req, res) => {
    try {
      const data = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(data);
      
      await storage.createSystemLog({
        userId: req.user.id,
        action: "email_template_created",
        entityType: "email_template",
        entityId: template.id.toString(),
        details: { name: template.name },
      });
      
      res.status(201).json(template);
    } catch (err) {
      console.error("Error creating email template:", err);
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put("/api/email-templates/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmailTemplateSchema.partial().parse(req.body);
      
      const updatedTemplate = await storage.updateEmailTemplate(id, data);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      await storage.createSystemLog({
        userId: req.user.id,
        action: "email_template_updated",
        entityType: "email_template",
        entityId: id.toString(),
        details: { name: updatedTemplate.name },
      });
      
      res.json(updatedTemplate);
    } catch (err) {
      console.error("Error updating email template:", err);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  // System Logs
  app.get("/api/system-logs", requireSuperAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      const logs = await storage.listSystemLogs({ 
        limit, 
        offset, 
        tenantId 
      });
      
      const total = await storage.countSystemLogs({ tenantId });
      
      res.json({ logs, total });
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  });

  // Tenant Admin & User Routes
  // Users
  app.get("/api/users", requireAuth, requirePermission("users", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      
      const users = await storage.listUsers(tenantId, { limit, offset });
      const total = await storage.countUsers(tenantId);
      
      res.json({ users: users.map(user => ({ ...user, password: undefined })), total });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get single user profile
  app.get("/api/users/:id", requireAuth, requirePermission("users", "read"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to view this user" });
      }
      
      // Remove sensitive data
      const { password, ...userData } = user;
      
      res.json(userData);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/users", requireAuth, requirePermission("users", "create"), async (req, res) => {
    try {
      const data = insertUserSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId
      });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "user_created",
        entityType: "user",
        entityId: user.id.toString(),
        details: { username: user.username, email: user.email, role: user.role },
      });
      
      res.status(201).json({ ...user, password: undefined });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAuth, requirePermission("users", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow updating certain fields, not tenantId
      const data = insertUserSchema.partial().parse(req.body);
      delete (data as any).tenantId;
      
      const updatedUser = await storage.updateUser(id, data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "user_updated",
        entityType: "user",
        entityId: id.toString(),
        details: { username: updatedUser?.username, role: updatedUser?.role },
      });
      
      res.json({ ...updatedUser, password: undefined });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Simple role management endpoint for safety officers
  app.put("/api/users/:id/role", requireAuth, requirePermission("users", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      // Prevent users from changing their own role (more user-friendly for safety officers)
      if (req.user.id === id) {
        return res.status(403).json({ 
          message: "You cannot change your own role. Please ask another administrator to change your role if needed." 
        });
      }
      
      if (!role || !userRoleEnum.enumValues.includes(role)) {
        return res.status(400).json({ 
          message: "Invalid role", 
          validRoles: userRoleEnum.enumValues.filter(r => r !== 'super_admin') 
        });
      }
      
      // Super admin role can only be assigned by super admins
      if (role === 'super_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "You don't have permission to assign this role" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, { role });
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "user_role_updated",
        entityType: "user",
        entityId: id.toString(),
        details: { 
          username: updatedUser?.username, 
          oldRole: user.role, 
          newRole: updatedUser?.role 
        },
      });
      
      res.json({ 
        success: true, 
        user: { 
          id: updatedUser?.id, 
          name: `${updatedUser?.firstName} ${updatedUser?.lastName}`, 
          role: updatedUser?.role 
        } 
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Password reset endpoint for safety officers
  app.post("/api/users/:id/reset-password", requireAuth, requirePermission("users", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent resetting own password through this endpoint
      if (req.user.id === id) {
        return res.status(403).json({
          message: "To reset your own password, use the profile settings page"
        });
      }
      
      const user = await storage.getUser(id);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is safety officer (role-based permission check)
      if (req.user.role !== "safety_officer" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Only safety officers can reset passwords" });
      }
      
      // Generate a temporary password or reset token
      // In production, you would generate a secure token and send a reset link via email
      const tempPassword = "SafetyFirst123!";
      
      // Update user with hashed password
      const updatedUser = await storage.updateUser(id, { 
        password: await hashPassword(tempPassword)
      });
      
      // In production, send email with password reset link
      // For development, we're using a standard password
      
      // Create system log for audit trail
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "password_reset",
        entityType: "user",
        entityId: id.toString(),
        details: { 
          username: user.username,
          email: user.email
        },
      });
      
      res.json({ 
        success: true,
        message: "Password has been reset"
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  // Suspend user account endpoint
  app.post("/api/users/:id/suspend", requireAuth, requirePermission("users", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent suspending own account
      if (req.user.id === id) {
        return res.status(403).json({
          message: "You cannot suspend your own account"
        });
      }
      
      const user = await storage.getUser(id);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is safety officer (role-based permission check)
      if (req.user.role !== "safety_officer" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Only safety officers can suspend accounts" });
      }
      
      const updatedUser = await storage.updateUser(id, { isActive: false });
      
      // Create system log for audit trail
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "account_suspended",
        entityType: "user",
        entityId: id.toString(),
        details: { 
          username: user.username,
          email: user.email
        },
      });
      
      res.json({ 
        success: true,
        user: updatedUser
      });
    } catch (err) {
      console.error("Error suspending user account:", err);
      res.status(500).json({ message: "Failed to suspend user account" });
    }
  });
  
  // Activate user account endpoint
  app.post("/api/users/:id/activate", requireAuth, requirePermission("users", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const user = await storage.getUser(id);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is safety officer (role-based permission check)
      if (req.user.role !== "safety_officer" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Only safety officers can activate accounts" });
      }
      
      const updatedUser = await storage.updateUser(id, { isActive: true });
      
      // Create system log for audit trail
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "account_activated",
        entityType: "user",
        entityId: id.toString(),
        details: { 
          username: user.username,
          email: user.email
        },
      });
      
      res.json({ 
        success: true,
        user: updatedUser
      });
    } catch (err) {
      console.error("Error activating user account:", err);
      res.status(500).json({ message: "Failed to activate user account" });
    }
  });

  // Sites
  app.get("/api/sites", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      
      const sites = await storage.listSites(tenantId, { limit, offset });
      const total = await storage.countSites(tenantId);
      
      res.json({ sites, total });
    } catch (err) {
      console.error("Error fetching sites:", err);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });
  
  app.get("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      const site = await storage.getSite(id);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Check if site belongs to user's tenant
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to access this site" });
      }
      
      res.json(site);
    } catch (err) {
      console.error("Error fetching site:", err);
      res.status(500).json({ message: "Failed to fetch site details" });
    }
  });

  app.post("/api/sites", requireAuth, async (req, res) => {
    try {
      const data = insertSiteSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId
      });
      
      const site = await storage.createSite(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "site_created",
        entityType: "site",
        entityId: site.id.toString(),
        details: { name: site.name, address: site.address },
      });
      
      res.status(201).json(site);
    } catch (err) {
      console.error("Error creating site:", err);
      res.status(500).json({ message: "Failed to create site" });
    }
  });
  
  app.put("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const existingSite = await storage.getSite(id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (existingSite.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to update this site" });
      }
      
      // Parse and validate the update data
      const updateData = insertSiteSchema.partial().parse(req.body);
      
      // Remove tenantId from update if present (cannot change tenant)
      delete (updateData as any).tenantId;
      
      const updatedSite = await storage.updateSite(id, updateData);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "site_updated",
        entityType: "site",
        entityId: id.toString(),
        details: { 
          name: updatedSite?.name, 
          address: updatedSite?.address,
          status: updatedSite?.status
        },
      });
      
      res.json(updatedSite);
    } catch (err) {
      console.error("Error updating site:", err);
      res.status(500).json({ message: "Failed to update site" });
    }
  });
  
  app.delete("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const existingSite = await storage.getSite(id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (existingSite.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to delete this site" });
      }
      
      // Check if there are hazards or other entities related to this site
      // This is a simplified check - in production, you might want to check all related entities
      const hazardCount = await storage.countHazardReports(req.user.tenantId, { siteId: id });
      
      if (hazardCount > 0) {
        return res.status(400).json({ 
          message: "Cannot delete site with active hazard reports. Please resolve or transfer them first." 
        });
      }
      
      await storage.deleteSite(id);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "site_deleted",
        entityType: "site",
        entityId: id.toString(),
        details: { name: existingSite.name },
      });
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting site:", err);
      res.status(500).json({ message: "Failed to delete site" });
    }
  });

  app.put("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const site = await storage.getSite(id);
      
      if (!site || site.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Only allow updating certain fields, not tenantId
      const data = insertSiteSchema.partial().parse(req.body);
      delete (data as any).tenantId;
      
      const updatedSite = await storage.updateSite(id, data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "site_updated",
        entityType: "site",
        entityId: id.toString(),
        details: { name: updatedSite?.name },
      });
      
      res.json(updatedSite);
    } catch (err) {
      console.error("Error updating site:", err);
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  // Team Management
  app.get("/api/teams", requireAuth, async (req, res) => {
    try {
      console.log("Fetching teams for tenant:", req.user.tenantId);
      const teams = await storage.listTeamsByTenant(req.user.tenantId);
      console.log("Teams found:", teams?.length || 0);
      
      // Return empty array if no teams found (avoid null)
      res.json({ teams: teams || [] });
    } catch (err) {
      console.error("Error fetching teams:", err);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });
  
  app.get("/api/sites/:siteId/teams", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      if (isNaN(siteId)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to access this site" });
      }
      
      const teams = await storage.listTeamsBySite(siteId);
      console.log("Teams found for site:", siteId, teams);
      res.json({ teams: teams });
    } catch (err) {
      console.error("Error fetching teams for site:", err);
      res.status(500).json({ message: "Failed to fetch teams for this site" });
    }
  });
  
  app.get("/api/teams/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (team.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to access this team" });
      }
      
      res.json(team);
    } catch (err) {
      console.error("Error fetching team:", err);
      res.status(500).json({ message: "Failed to fetch team details" });
    }
  });
  
  app.post("/api/teams", requireAuth, async (req, res) => {
    try {
      console.log("Team creation request received:", req.body);
      
      // Simple validation
      if (!req.body.name) {
        return res.status(400).json({ message: "Team name is required" });
      }
      
      const siteId = req.body.siteId || req.body.primarySiteId;
      if (!siteId) {
        return res.status(400).json({ message: "Site ID is required" });
      }
      
      // Direct database query using pool from db.ts
      const { pool } = await import('./db');
      
      const query = `
        INSERT INTO teams (
          tenant_id, site_id, name, description, leader_id, color, specialties, 
          created_by_id, created_at, updated_at, is_active
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *
      `;
      
      const values = [
        req.user.tenantId,
        siteId,
        req.body.name,
        req.body.description || null,
        req.body.leaderId || null,
        req.body.color || null,
        req.body.specialties ? JSON.stringify(req.body.specialties) : null,
        req.user.id,
        new Date().toISOString(),
        new Date().toISOString(),
        true
      ];
      
      console.log("Executing SQL with values:", values);
      
      const result = await pool.query(query, values);
      
      if (!result.rows || result.rows.length === 0) {
        console.error("No rows returned after team creation");
        return res.status(500).json({ message: "Failed to create team" });
      }
      
      const team = result.rows[0];
      console.log("Team created successfully:", team);
      
      // Log the team creation
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "team_created",
        entityType: "team",
        entityId: team.id.toString(),
        details: { name: team.name, site_id: team.site_id },
      });
      
      res.status(201).json(team);
    } catch (err) {
      console.error("Error creating team:", err);
      res.status(500).json({ message: "Failed to create team" });
    }
  });
  
  app.patch("/api/teams/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      // Check if team exists and belongs to user's tenant
      const existingTeam = await storage.getTeam(id);
      if (!existingTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (existingTeam.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to update this team" });
      }
      
      // Parse and validate the update data
      const updateData = insertTeamSchema.partial().parse(req.body);
      
      // Remove tenantId from update if present (cannot change tenant)
      delete (updateData as any).tenantId;
      delete (updateData as any).createdById;
      
      const updatedTeam = await storage.updateTeam(id, updateData);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "team_updated",
        entityType: "team",
        entityId: id.toString(),
        details: { 
          name: updatedTeam.name,
          siteId: updatedTeam.siteId,
          leaderId: updatedTeam.leaderId
        },
      });
      
      res.json(updatedTeam);
    } catch (err) {
      console.error("Error updating team:", err);
      res.status(500).json({ message: "Failed to update team" });
    }
  });
  
  app.delete("/api/teams/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      // Check if team exists and belongs to user's tenant
      const existingTeam = await storage.getTeam(id);
      if (!existingTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (existingTeam.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to delete this team" });
      }
      
      // Soft delete the team
      await storage.deleteTeam(id);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "team_deleted",
        entityType: "team",
        entityId: id.toString(),
        details: { 
          name: existingTeam.name,
          siteId: existingTeam.siteId
        },
      });
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting team:", err);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });
  
  app.get("/api/teams/:id/members", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (team.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to access this team" });
      }
      
      const members = await storage.getTeamMembers(id);
      res.json(members);
    } catch (err) {
      console.error("Error fetching team members:", err);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Site Personnel Management
  app.get("/api/sites/:siteId/personnel", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      if (isNaN(siteId)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to access this site" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const personnel = await storage.listSitePersonnelBySite(siteId, { limit, offset });
      const total = await storage.countSitePersonnel(siteId);
      
      res.json({ personnel, total });
    } catch (err) {
      console.error("Error fetching site personnel:", err);
      res.status(500).json({ message: "Failed to fetch site personnel" });
    }
  });
  
  app.post("/api/sites/:siteId/personnel", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      if (isNaN(siteId)) {
        return res.status(400).json({ message: "Invalid site ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this site" });
      }
      
      // Make sure the user exists and belongs to the same tenant
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.tenantId !== req.user.tenantId) {
        return res.status(400).json({ message: "Invalid user" });
      }
      
      // Parse and validate the assignment data
      const assignmentData = insertSitePersonnelSchema.parse({
        ...req.body,
        siteId,
      });
      
      const assignment = await storage.assignUserToSite(assignmentData);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "personnel_assigned",
        entityType: "site_personnel",
        entityId: assignment.id.toString(),
        details: { 
          siteId, 
          userId, 
          role: assignment.role,
          startDate: assignment.startDate,
          endDate: assignment.endDate
        },
      });
      
      res.status(201).json(assignment);
    } catch (err) {
      console.error("Error assigning personnel to site:", err);
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to assign personnel to site" });
    }
  });
  
  // Get specific site personnel by ID
  app.get("/api/sites/:siteId/personnel/:personnelId", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const personnelId = parseInt(req.params.personnelId);
      
      if (isNaN(siteId) || isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid site ID or personnel ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to view this site's personnel" });
      }
      
      // Get the personnel assignment
      const personnel = await storage.getSitePersonnel(personnelId);
      
      if (!personnel || personnel.siteId !== siteId) {
        return res.status(404).json({ message: "Personnel assignment not found" });
      }
      
      res.json(personnel);
    } catch (err) {
      console.error("Error getting site personnel:", err);
      res.status(500).json({ message: "Failed to get personnel details" });
    }
  });
  
  // Update site personnel role and details
  app.patch("/api/sites/:siteId/personnel/:personnelId", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const personnelId = parseInt(req.params.personnelId);
      
      if (isNaN(siteId) || isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid site ID or personnel ID" });
      }
      
      // Check if site exists and belongs to user's tenant
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      if (site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this site's personnel" });
      }
      
      // Get current personnel assignment
      const existingPersonnel = await storage.getSitePersonnel(personnelId);
      if (!existingPersonnel || existingPersonnel.siteId !== siteId) {
        return res.status(404).json({ message: "Personnel assignment not found" });
      }
      
      // Prepare update data
      const updateData = {
        id: personnelId,
        siteRole: req.body.siteRole || existingPersonnel.siteRole,
        startDate: req.body.startDate || existingPersonnel.startDate,
        endDate: req.body.endDate || existingPersonnel.endDate,
        notes: req.body.notes !== undefined ? req.body.notes : existingPersonnel.notes,
      };
      
      // Update the personnel assignment
      const updatedPersonnel = await storage.updateSitePersonnel(updateData);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "personnel_updated",
        entityType: "site_personnel",
        entityId: updatedPersonnel.id.toString(),
        details: {
          siteId,
          siteRole: updatedPersonnel.siteRole,
          changes: Object.keys(req.body).reduce((acc, key) => {
            if (req.body[key] !== undefined) {
              acc[key] = {
                from: existingPersonnel[key],
                to: req.body[key]
              };
            }
            return acc;
          }, {})
        },
      });
      
      res.json(updatedPersonnel);
    } catch (err) {
      console.error("Error updating site personnel:", err);
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update personnel assignment" });
    }
  });

  app.put("/api/site-personnel/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assignment ID" });
      }
      
      // Check if assignment exists
      const assignment = await storage.getSitePersonnel(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if site belongs to user's tenant
      const site = await storage.getSite(assignment.siteId);
      if (!site || site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this assignment" });
      }
      
      // Parse and validate the update data
      const updateData = insertSitePersonnelSchema.partial().parse(req.body);
      
      // Don't allow changing the site or user
      delete (updateData as any).siteId;
      delete (updateData as any).userId;
      
      const updatedAssignment = await storage.updateSitePersonnel(id, updateData);
      
      res.json(updatedAssignment);
    } catch (err) {
      console.error("Error updating personnel assignment:", err);
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update personnel assignment" });
    }
  });
  
  app.delete("/api/site-personnel/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assignment ID" });
      }
      
      // Check if assignment exists
      const assignment = await storage.getSitePersonnel(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if site belongs to user's tenant
      const site = await storage.getSite(assignment.siteId);
      if (!site || site.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this assignment" });
      }
      
      await storage.removeSitePersonnel(id);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "personnel_removed",
        entityType: "site_personnel",
        entityId: id.toString(),
        details: { siteId: assignment.siteId, userId: assignment.userId },
      });
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error removing personnel assignment:", err);
      res.status(500).json({ message: "Failed to remove personnel assignment" });
    }
  });

  // Hazard Reports
  app.get("/api/hazards", requireAuth, requirePermission("hazards", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const status = req.query.status as string;
      const severity = req.query.severity as string;
      
      const hazards = await storage.listHazardReports(tenantId, { 
        limit, offset, siteId, status, severity 
      });
      const total = await storage.countHazardReports(tenantId, { 
        siteId, status, severity 
      });
      
      res.json({ hazards, total });
    } catch (err) {
      console.error("Error fetching hazards:", err);
      res.status(500).json({ message: "Failed to fetch hazards" });
    }
  });

  app.post("/api/hazards", requireAuth, requirePermission("hazards", "create"), async (req, res) => {
    try {
      const data = insertHazardReportSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        reportedById: req.user.id
      });
      
      const hazard = await storage.createHazardReport(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "hazard_created",
        entityType: "hazard",
        entityId: hazard.id.toString(),
        details: { title: hazard.title, severity: hazard.severity, siteId: hazard.siteId },
      });
      
      res.status(201).json(hazard);
    } catch (err) {
      console.error("Error creating hazard:", err);
      res.status(500).json({ message: "Failed to create hazard" });
    }
  });

  app.get("/api/hazards/:id", requireAuth, requirePermission("hazards", "read"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hazard = await storage.getHazardReport(id);
      
      if (!hazard || hazard.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Hazard not found" });
      }
      
      // Get assignments
      const assignments = await storage.listHazardAssignments(id);
      
      // Get comments
      const comments = await storage.listHazardComments(id);
      
      res.json({ hazard, assignments, comments });
    } catch (err) {
      console.error("Error fetching hazard:", err);
      res.status(500).json({ message: "Failed to fetch hazard" });
    }
  });

  app.put("/api/hazards/:id", requireAuth, requirePermission("hazards", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hazard = await storage.getHazardReport(id);
      
      if (!hazard || hazard.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Hazard not found" });
      }
      
      // Only allow updating certain fields, not tenantId or reportedById
      const data = insertHazardReportSchema.partial().parse(req.body);
      delete (data as any).tenantId;
      delete (data as any).reportedById;
      
      const updatedHazard = await storage.updateHazardReport(id, data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "hazard_updated",
        entityType: "hazard",
        entityId: id.toString(),
        details: { status: updatedHazard?.status },
      });
      
      res.json(updatedHazard);
    } catch (err) {
      console.error("Error updating hazard:", err);
      res.status(500).json({ message: "Failed to update hazard" });
    }
  });

  // Hazard Assignments
  app.post("/api/hazards/:id/assignments", requireAuth, requirePermission("hazards", "update"), async (req, res) => {
    try {
      const hazardId = parseInt(req.params.id);
      const hazard = await storage.getHazardReport(hazardId);
      
      if (!hazard || hazard.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Hazard not found" });
      }
      
      const data = insertHazardAssignmentSchema.parse({
        ...req.body,
        hazardId,
        assignedById: req.user.id
      });
      
      const assignment = await storage.createHazardAssignment(data);
      
      // Update hazard status to assigned if currently open
      if (hazard.status === "open") {
        await storage.updateHazardReport(hazardId, { status: "assigned" });
      }
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "hazard_assigned",
        entityType: "hazard",
        entityId: hazardId.toString(),
        details: { 
          assignedToUserId: data.assignedToUserId, 
          assignedToSubcontractorId: data.assignedToSubcontractorId 
        },
      });
      
      res.status(201).json(assignment);
    } catch (err) {
      console.error("Error creating assignment:", err);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Hazard Comments
  app.post("/api/hazards/:id/comments", requireAuth, requirePermission("hazards", "read"), async (req, res) => {
    try {
      const hazardId = parseInt(req.params.id);
      const hazard = await storage.getHazardReport(hazardId);
      
      if (!hazard || hazard.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Hazard not found" });
      }
      
      const data = insertHazardCommentSchema.parse({
        ...req.body,
        hazardId,
        userId: req.user.id
      });
      
      const comment = await storage.createHazardComment(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "hazard_comment_added",
        entityType: "hazard",
        entityId: hazardId.toString(),
      });
      
      res.status(201).json(comment);
    } catch (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Inspections
  app.get("/api/inspections", requireAuth, requirePermission("inspections", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const status = req.query.status as string;
      
      const inspections = await storage.listInspections(tenantId, { 
        limit, offset, siteId, status 
      });
      const total = await storage.countInspections(tenantId, { siteId, status });
      
      res.json({ inspections, total });
    } catch (err) {
      console.error("Error fetching inspections:", err);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post("/api/inspections", requireAuth, requirePermission("inspections", "create"), async (req, res) => {
    try {
      const data = insertInspectionSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        inspectorId: req.user.id
      });
      
      const inspection = await storage.createInspection(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "inspection_created",
        entityType: "inspection",
        entityId: inspection.id.toString(),
        details: { title: inspection.title, siteId: inspection.siteId },
      });
      
      res.status(201).json(inspection);
    } catch (err) {
      console.error("Error creating inspection:", err);
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  // Permits
  app.get("/api/permits", requireAuth, requirePermission("permits", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const status = req.query.status as string;
      
      const permits = await storage.listPermitRequests(tenantId, { 
        limit, offset, siteId, status 
      });
      const total = await storage.countPermitRequests(tenantId, { siteId, status });
      
      res.json({ permits, total });
    } catch (err) {
      console.error("Error fetching permits:", err);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });

  app.post("/api/permits", requireAuth, requirePermission("permits", "create"), async (req, res) => {
    try {
      const data = insertPermitRequestSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        requesterId: req.user.id
      });
      
      const permit = await storage.createPermitRequest(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "permit_created",
        entityType: "permit",
        entityId: permit.id.toString(),
        details: { title: permit.title, permitType: permit.permitType },
      });
      
      res.status(201).json(permit);
    } catch (err) {
      console.error("Error creating permit:", err);
      res.status(500).json({ message: "Failed to create permit" });
    }
  });

  // Incidents
  app.get("/api/incidents", requireAuth, requirePermission("incidents", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const severity = req.query.severity as string;
      
      const incidents = await storage.listIncidentReports(tenantId, { 
        limit, offset, siteId, severity 
      });
      const total = await storage.countIncidentReports(tenantId, { siteId, severity });
      
      res.json({ incidents, total });
    } catch (err) {
      console.error("Error fetching incidents:", err);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", requireAuth, requirePermission("incidents", "create"), async (req, res) => {
    try {
      const data = insertIncidentReportSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        reportedById: req.user.id
      });
      
      const incident = await storage.createIncidentReport(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "incident_created",
        entityType: "incident",
        entityId: incident.id.toString(),
        details: { title: incident.title, severity: incident.severity },
      });
      
      res.status(201).json(incident);
    } catch (err) {
      console.error("Error creating incident:", err);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  // Training Content
  app.get("/api/training-content", requireAuth, requirePermission("training", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      
      // Get tenant-specific content
      const tenantContent = await storage.listTrainingContent({ 
        limit, offset, tenantId 
      });
      
      // Get common content
      const commonContent = await storage.listTrainingContent({ 
        isCommon: true 
      });
      
      res.json({ 
        tenantContent, 
        commonContent,
        total: tenantContent.length + commonContent.length
      });
    } catch (err) {
      console.error("Error fetching training content:", err);
      res.status(500).json({ message: "Failed to fetch training content" });
    }
  });

  // Training Courses
  app.get("/api/training-courses", requireAuth, requirePermission("training", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      
      const courses = await storage.listTrainingCourses(tenantId, { limit, offset });
      const total = await storage.countTrainingCourses(tenantId);
      
      res.json({ courses, total });
    } catch (err) {
      console.error("Error fetching training courses:", err);
      res.status(500).json({ message: "Failed to fetch training courses" });
    }
  });

  app.post("/api/training-courses", requireAuth, requirePermission("training", "create"), async (req, res) => {
    try {
      const data = insertTrainingCourseSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        createdById: req.user.id
      });
      
      const course = await storage.createTrainingCourse(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "training_course_created",
        entityType: "training_course",
        entityId: course.id.toString(),
        details: { title: course.title },
      });
      
      res.status(201).json(course);
    } catch (err) {
      console.error("Error creating training course:", err);
      res.status(500).json({ message: "Failed to create training course" });
    }
  });

  // Training Records
  app.get("/api/training-records", requireAuth, requirePermission("training", "read"), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const tenantId = req.user.tenantId;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      
      const records = await storage.listTrainingRecords({ 
        tenantId, userId, courseId, limit, offset 
      });
      
      const total = await storage.countTrainingRecords({ 
        tenantId, userId, courseId 
      });
      
      res.json({ records, total });
    } catch (err) {
      console.error("Error fetching training records:", err);
      res.status(500).json({ message: "Failed to fetch training records" });
    }
  });

  app.post("/api/training-records", requireAuth, requirePermission("training", "create"), async (req, res) => {
    try {
      const data = insertTrainingRecordSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
      });
      
      const record = await storage.createTrainingRecord(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "training_record_created",
        entityType: "training_record",
        entityId: record.id.toString(),
        details: { userId: record.userId, courseId: record.courseId },
      });
      
      res.status(201).json(record);
    } catch (err) {
      console.error("Error creating training record:", err);
      res.status(500).json({ message: "Failed to create training record" });
    }
  });

  // Dashboard Statistics
  app.get("/api/dashboard-stats", requireAuth, async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      
      // Get hazard stats
      const hazardStats = await storage.getHazardStats(tenantId);
      
      // Get training stats
      const trainingStats = await storage.getTrainingStats(tenantId);
      
      // Get site stats
      const siteStats = await storage.getSiteStats(tenantId);
      
      res.json({
        hazards: hazardStats,
        training: trainingStats,
        sites: siteStats
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Role Permissions
  app.get("/api/role-permissions", requireAuth, requirePermission("settings", "read"), async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const role = req.query.role as string;
      
      if (!role || !Object.values(userRoleEnum.enumValues).includes(role as any)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const permissions = await storage.getRolePermissions(tenantId, role);
      res.json(permissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.post("/api/role-permissions", requireAuth, requirePermission("settings", "update"), async (req, res) => {
    try {
      const data = insertRolePermissionSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId
      });
      
      const permission = await storage.createRolePermission(data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "role_permission_created",
        entityType: "role_permission",
        entityId: permission.id.toString(),
        details: { role: permission.role, resource: permission.resource, action: permission.action },
      });
      
      res.status(201).json(permission);
    } catch (err) {
      console.error("Error creating permission:", err);
      res.status(500).json({ message: "Failed to create permission" });
    }
  });

  app.delete("/api/role-permissions/:id", requireAuth, requirePermission("settings", "update"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRolePermission(id);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "role_permission_deleted",
        entityType: "role_permission",
        entityId: id.toString(),
      });
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting permission:", err);
      res.status(500).json({ message: "Failed to delete permission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import { setupAuth } from "./auth";
import { setupEmailService } from "./email";
import * as schema from "@shared/schema";
import { eq, desc, and, not, sql } from "drizzle-orm";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
// All schemas are now imported via the namespace import above

// Import schemas for validation
import { 
  insertHazardReportSchema, insertHazardCommentSchema, insertHazardAssignmentSchema,
  insertInspectionSchema, insertInspectionTemplateSchema, insertInspectionSectionSchema,
  insertInspectionItemSchema, insertInspectionResponseSchema, insertInspectionFindingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up file upload storage configuration
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    }
  });

  // Serve uploads directory statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

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

      // Temporary permission check - always allow for development
      // In production, this should check tenant-specific permissions
      const hasPermission = true;
      
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
  
  // File upload endpoint - no auth required for development
  app.post('/api/uploads', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Return the URL to the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.status(201).json({ url: fileUrl });
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({ message: 'File upload failed' });
    }
  });

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
      
      // Get users directly from database
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.tenantId, tenantId))
        .where(eq(schema.users.isActive, true))
        .limit(limit)
        .offset(offset);
      
      // Count total users
      const [countResult] = await db
        .select({ count: sql`count(*)` })
        .from(schema.users)
        .where(eq(schema.users.tenantId, tenantId))
        .where(eq(schema.users.isActive, true));
      
      const total = Number(countResult?.count || 0);
      
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
      
      // Get sites directly from database
      const sites = await db
        .select()
        .from(schema.sites)
        .where(eq(schema.sites.tenantId, tenantId))
        .where(eq(schema.sites.isActive, true))
        .limit(limit)
        .offset(offset);
      
      // Count total sites
      const [countResult] = await db
        .select({ count: sql`count(*)` })
        .from(schema.sites)
        .where(eq(schema.sites.tenantId, tenantId))
        .where(eq(schema.sites.isActive, true));
      
      const total = Number(countResult?.count || 0);
      
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
  
  // Add personnel to team
  app.post("/api/teams/:teamId/members/:personnelId", requireAuth, async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const personnelId = parseInt(req.params.personnelId);
      
      if (isNaN(teamId) || isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid team ID or personnel ID" });
      }
      
      // Check if team exists and belongs to user's tenant
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (team.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this team" });
      }
      
      // Check if personnel exists and belongs to the same site as the team
      const personnel = await storage.getSitePersonnel(personnelId);
      if (!personnel) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      
      if (personnel.siteId !== team.siteId) {
        return res.status(400).json({ message: "Personnel does not belong to the same site as the team" });
      }
      
      // Assign personnel to team
      const updatedPersonnel = await storage.assignPersonnelToTeam(personnelId, teamId);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "personnel_assigned_to_team",
        entityType: "team",
        entityId: teamId.toString(),
        details: { 
          teamId,
          personnelId,
          teamName: team.name,
          siteId: team.siteId
        },
      });
      
      res.status(200).json(updatedPersonnel);
    } catch (err) {
      console.error("Error assigning personnel to team:", err);
      res.status(500).json({ message: "Failed to assign personnel to team" });
    }
  });
  
  // Remove personnel from team
  app.delete("/api/teams/:teamId/members/:personnelId", requireAuth, async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const personnelId = parseInt(req.params.personnelId);
      
      if (isNaN(teamId) || isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid team ID or personnel ID" });
      }
      
      // Check if team exists and belongs to user's tenant
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (team.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "You don't have permission to modify this team" });
      }
      
      // Check if personnel exists
      const personnel = await storage.getSitePersonnel(personnelId);
      if (!personnel) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      
      // Remove personnel from team
      const updatedPersonnel = await storage.removePersonnelFromTeam(personnelId);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "personnel_removed_from_team",
        entityType: "team",
        entityId: teamId.toString(),
        details: { 
          teamId,
          personnelId,
          teamName: team.name,
          siteId: team.siteId
        },
      });
      
      res.status(200).json(updatedPersonnel);
    } catch (err) {
      console.error("Error removing personnel from team:", err);
      res.status(500).json({ message: "Failed to remove personnel from team" });
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
      
      // Create base query for hazard reports
      let query = db
        .select()
        .from(schema.hazardReports)
        .where(eq(schema.hazardReports.tenantId, tenantId))
        .where(eq(schema.hazardReports.isActive, true));
      
      // Add filters if provided
      if (siteId) {
        query = query.where(eq(schema.hazardReports.siteId, siteId));
      }
      
      if (status) {
        query = query.where(eq(schema.hazardReports.status, status));
      }
      
      if (severity) {
        query = query.where(eq(schema.hazardReports.severity, severity));
      }
      
      // Get paginated hazard reports
      const hazards = await query
        .orderBy(desc(schema.hazardReports.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Count total records with same filters
      const countQuery = db
        .select({ count: sql`count(*)` })
        .from(schema.hazardReports)
        .where(eq(schema.hazardReports.tenantId, tenantId))
        .where(eq(schema.hazardReports.isActive, true));
      
      // Add the same filters to count query
      if (siteId) {
        countQuery.where(eq(schema.hazardReports.siteId, siteId));
      }
      
      if (status) {
        countQuery.where(eq(schema.hazardReports.status, status));
      }
      
      if (severity) {
        countQuery.where(eq(schema.hazardReports.severity, severity));
      }
      
      const [countResult] = await countQuery;
      const total = Number(countResult?.count || 0);
      
      res.json({ hazards, total });
    } catch (err) {
      console.error("Error fetching hazards:", err);
      res.status(500).json({ message: "Failed to fetch hazards" });
    }
  });

  app.post("/api/hazards", requireAuth, async (req, res) => {
    try {
      // Log the request for debugging
      console.log("Hazard creation request:", JSON.stringify({
        body: req.body,
        user: {
          id: req.user?.id,
          tenantId: req.user?.tenantId,
          role: req.user?.role
        },
        session: req.session?.id
      }, null, 2));
      
      // Skip permission check if no error is found
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!user.tenantId) {
        return res.status(400).json({ message: "User doesn't belong to a tenant" });
      }
      
      // Check permission manually to provide better error messages
      try {
        const hasPermission = await storage.hasPermission(
          user.tenantId,
          user.role,
          "hazards",
          "create"
        );
        
        if (!hasPermission && user.role !== 'super_admin') {
          console.log(`User ${user.id} with role ${user.role} doesn't have permission to create hazards`);
          return res.status(403).json({ message: "You don't have permission to create hazard reports" });
        }
      } catch (permError) {
        console.error("Error checking permissions:", permError);
        // Continue anyway to see if we can create the hazard
      }
      
      // Ensure required fields are present
      if (!req.body.siteId) {
        return res.status(400).json({ message: "Site ID is required" });
      }
      
      if (!req.body.title) {
        return res.status(400).json({ message: "Hazard title is required" });
      }
      
      if (!req.body.description) {
        return res.status(400).json({ message: "Hazard description is required" });
      }
      
      // Build the hazard data
      const hazardData = {
        ...req.body,
        tenantId: user.tenantId,
        reportedById: user.id,
        status: "open", // Ensure status is explicitly set
        photoUrls: req.body.photoUrls || [],
        videoIds: req.body.videoIds || [],
        siteId: parseInt(req.body.siteId.toString()), // Ensure siteId is a number
        isActive: true
      };
      
      // Create the hazard report in the database
      console.log("Creating hazard with data:", JSON.stringify(hazardData, null, 2));
      const hazard = await storage.createHazardReport(hazardData);
      console.log("Hazard created successfully:", JSON.stringify(hazard, null, 2));
      
      // Log the hazard creation in the system logs
      await storage.createSystemLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "hazard_created",
        entityType: "hazard",
        entityId: hazard.id.toString(),
        details: { title: hazard.title, severity: hazard.severity, siteId: hazard.siteId },
      });
      
      // Skip email notifications for now to simplify troubleshooting
      // Return success response immediately
      return res.status(201).json(hazard);
    } catch (err) {
      console.error("Error creating hazard:", err);
      return res.status(500).json({ 
        message: "Failed to create hazard", 
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
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
      
      // Track if status is changing for notification purposes
      const isStatusChange = data.status && data.status !== hazard.status;
      const previousStatus = hazard.status;
      
      // Special handling for resolved status
      if (data.status === 'resolved' && !data.resolvedAt) {
        data.resolvedAt = new Date().toISOString();
      }
      
      const updatedHazard = await storage.updateHazardReport(id, data);
      
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "hazard_updated",
        entityType: "hazard",
        entityId: id.toString(),
        details: { 
          status: updatedHazard?.status,
          previousStatus: isStatusChange ? previousStatus : undefined
        },
      });
      
      // Send email notification if status changed
      if (isStatusChange && updatedHazard) {
        try {
          // Get the user who updated the hazard
          const updatedBy = await storage.getUser(req.user.id);
          
          // Collect notification recipients
          
          // 1. Include the reporter
          const reporter = hazard.reportedById !== req.user.id ? 
            await storage.getUser(hazard.reportedById) : null;
            
          // 2. Include assigned users
          const assignments = await storage.listHazardAssignments(id);
          const assignedUserIds = assignments
            .filter(a => a.assignedToUserId && a.assignedToUserId !== req.user.id)
            .map(a => a.assignedToUserId);
          
          const assignedUsers = await Promise.all(
            assignedUserIds.map(id => id ? storage.getUser(id) : null)
          );
          
          // 3. Include safety officers for critical/high severity hazards
          let safetyOfficers = [];
          if (hazard.severity === 'critical' || hazard.severity === 'high') {
            safetyOfficers = await storage.getUsersByRole(hazard.tenantId, 'safety_officer');
          }
          
          // Combine all recipients, filter out nulls and duplicates
          const recipients = [
            reporter, 
            ...assignedUsers,
            ...safetyOfficers
          ].filter((user, index, self) => 
            user && 
            user.id !== req.user.id && // Don't notify the user who made the change
            self.findIndex(u => u && u.id === user.id) === index
          );
          
          if (updatedBy && recipients.length > 0) {
            // Import notification service
            const { sendHazardStatusUpdateNotification } = await import('./notifications/hazard-notifications');
            
            // Send notification (don't await, let it process in background)
            sendHazardStatusUpdateNotification(
              updatedHazard,
              previousStatus,
              updatedBy,
              recipients
            ).catch(error => {
              console.error('Error sending hazard status update notification:', error);
            });
          }
        } catch (notificationError) {
          // Log but don't fail the request if notification fails
          console.error("Error sending hazard status update notification:", notificationError);
        }
      }
      
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
      
      // Send email notification if assigned to a user
      try {
        if (data.assignedToUserId) {
          // Get site information
          const site = await storage.getSite(hazard.siteId);
          
          // Get the user who was assigned and the user who assigned
          const assignedTo = await storage.getUser(data.assignedToUserId);
          const assignedBy = await storage.getUser(req.user.id);
          
          if (site && assignedTo && assignedBy) {
            // Import notification service
            const { sendHazardAssignedNotification } = await import('./notifications/hazard-notifications');
            
            // Send notification (don't await, let it process in background)
            sendHazardAssignedNotification(
              hazard,
              assignment,
              assignedBy,
              assignedTo,
              site.name
            ).catch(error => {
              console.error('Error sending hazard assignment notification:', error);
            });
          }
        }
      } catch (notificationError) {
        // Log but don't fail the request if notification fails
        console.error("Error sending hazard assignment notification:", notificationError);
      }
      
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
      
      // Send email notification to relevant parties
      try {
        // Get the commenter
        const commenter = await storage.getUser(req.user.id);
        
        // Collect potential notification recipients
        
        // 1. Get the reporter of the hazard
        const reporter = hazard.reportedById !== req.user.id ? 
          await storage.getUser(hazard.reportedById) : null;
        
        // 2. Get users assigned to this hazard
        const assignments = await storage.listHazardAssignments(hazardId);
        const assignedUserIds = assignments
          .filter(a => a.assignedToUserId && a.assignedToUserId !== req.user.id)
          .map(a => a.assignedToUserId);
        
        const assignedUsers = await Promise.all(
          assignedUserIds.map(id => id ? storage.getUser(id) : null)
        );
        
        // 3. Get previous commenters on this hazard
        const previousComments = await storage.listHazardComments(hazardId);
        const commenterIds = [...new Set(previousComments
          .filter(c => c.userId !== req.user.id)
          .map(c => c.userId))];
        
        const commenters = await Promise.all(
          commenterIds.map(id => storage.getUser(id))
        );
        
        // Combine all recipients, filter out nulls and duplicates
        const recipients = [
          reporter, 
          ...assignedUsers, 
          ...commenters
        ].filter((user, index, self) => 
          user && 
          self.findIndex(u => u && u.id === user.id) === index
        );
        
        if (commenter && recipients.length > 0) {
          // Import notification service
          const { sendHazardCommentNotification } = await import('./notifications/hazard-notifications');
          
          // Send notification (don't await, let it process in background)
          sendHazardCommentNotification(
            hazard,
            commenter,
            comment.comment,
            recipients
          ).catch(error => {
            console.error('Error sending comment notification:', error);
          });
        }
      } catch (notificationError) {
        // Log but don't fail the request if notification fails
        console.error("Error sending comment notification:", notificationError);
      }
      
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
      
      // Adapt query to match actual database structure
      // Using raw SQL since we have a schema mismatch
      const inspectionsQuery = `
        SELECT * FROM inspections 
        WHERE tenant_id = $1 
        AND is_active = true
        ${siteId ? 'AND site_id = $2' : ''}
        ${status ? `AND status = ${siteId ? '$3' : '$2'}` : ''}
        ORDER BY created_at DESC
        LIMIT $${siteId && status ? '4' : (siteId || status ? '3' : '2')}
        OFFSET $${siteId && status ? '5' : (siteId || status ? '4' : '3')}
      `;
      
      // Build parameters array
      const queryParams = [tenantId];
      if (siteId) queryParams.push(siteId);
      if (status) queryParams.push(status);
      queryParams.push(limit, offset);
      
      // Count query
      const countQuery = `
        SELECT COUNT(*) FROM inspections 
        WHERE tenant_id = $1 
        AND is_active = true
        ${siteId ? 'AND site_id = $2' : ''}
        ${status ? `AND status = ${siteId ? '$3' : '$2'}` : ''}
      `;
      
      // Build count parameters
      const countParams = [tenantId];
      if (siteId) countParams.push(siteId);
      if (status) countParams.push(status);
      
      // Execute queries using pool directly for raw SQL
      const inspectionsResult = await pool.query(inspectionsQuery, queryParams);
      const countResult = await pool.query(countQuery, countParams);
      
      const inspections = inspectionsResult.rows;
      const total = parseInt(countResult.rows[0]?.count || '0');
      
      res.json({ inspections, total });
    } catch (err) {
      console.error("Error fetching inspections:", err);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post("/api/inspections", requireAuth, requirePermission("inspections", "create"), async (req, res) => {
    try {
      // Get the form data
      const formData = req.body;
      
      // Create a raw SQL query that only uses the exact fields present in the database
      // This avoids any schema mismatches between our code models and the actual database
      const result = await db.execute(`
        INSERT INTO inspections (
          tenant_id, 
          site_id, 
          inspector_id, 
          title, 
          description, 
          scheduled_date,
          status,
          inspection_type,
          is_active
        ) VALUES (
          ${req.user.tenantId}, 
          ${formData.siteId}, 
          ${req.user.id}, 
          '${formData.title.replace(/'/g, "''")}', 
          '${(formData.description || '').replace(/'/g, "''")}', 
          '${new Date(formData.scheduledDate).toISOString()}',
          'pending',
          'routine',
          true
        ) RETURNING *;
      `);
      
      // Get the inserted inspection from the result
      const inspection = result.rows[0];
      
      // Log the creation
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: "inspection_created",
        entityType: "inspection",
        entityId: inspection.id.toString(),
        details: { title: inspection.title, siteId: inspection.site_id },
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
      
      try {
        // Get hazard stats directly from database
        const hazardStats = {
          open: 0,
          assigned: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          total: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        };
        
        // Count hazards by status
        const hazardStatusCounts = await db
          .select({
            status: schema.hazardReports.status,
            count: sql`count(*)`.as('count')
          })
          .from(schema.hazardReports)
          .where(eq(schema.hazardReports.tenantId, tenantId))
          .where(eq(schema.hazardReports.isActive, true))
          .groupBy(schema.hazardReports.status);
          
        // Process status counts
        for (const row of hazardStatusCounts) {
          if (row.status === 'open') hazardStats.open = Number(row.count);
          else if (row.status === 'assigned') hazardStats.assigned = Number(row.count);
          else if (row.status === 'in_progress') hazardStats.inProgress = Number(row.count);
          else if (row.status === 'resolved') hazardStats.resolved = Number(row.count);
          else if (row.status === 'closed') hazardStats.closed = Number(row.count);
        }
        
        // Calculate total
        hazardStats.total = hazardStats.open + hazardStats.assigned + hazardStats.inProgress + 
                          hazardStats.resolved + hazardStats.closed;
                          
        // Count hazards by severity
        const hazardSeverityCounts = await db
          .select({
            severity: schema.hazardReports.severity,
            count: sql`count(*)`.as('count')
          })
          .from(schema.hazardReports)
          .where(eq(schema.hazardReports.tenantId, tenantId))
          .where(eq(schema.hazardReports.isActive, true))
          .groupBy(schema.hazardReports.severity);
          
        // Process severity counts
        for (const row of hazardSeverityCounts) {
          if (row.severity === 'low') hazardStats.low = Number(row.count);
          else if (row.severity === 'medium') hazardStats.medium = Number(row.count);
          else if (row.severity === 'high') hazardStats.high = Number(row.count);
          else if (row.severity === 'critical') hazardStats.critical = Number(row.count);
        }
        
        // Get training stats directly from database
        const trainingStats = {
          completed: 0,
          inProgress: 0, 
          notStarted: 0,
          expired: 0,
          total: 0
        };
        
        // Get simple counts for training using trainingRecords
        const [trainingCountResult] = await db
          .select({ count: sql`count(*)` })
          .from(schema.trainingRecords)
          .where(eq(schema.trainingRecords.tenantId, tenantId));
          
        trainingStats.total = Number(trainingCountResult?.count || 0);
        
        // For training status, we need to use a different approach since we don't have a status field
        // Instead, we'll determine status based on completionDate and passed fields
        
        // Count completed trainings (has completion date and passed)
        const [completedTrainings] = await db
          .select({ count: sql`count(*)` })
          .from(schema.trainingRecords)
          .where(eq(schema.trainingRecords.tenantId, tenantId))
          .where(sql`completion_date IS NOT NULL`)
          .where(eq(schema.trainingRecords.passed, true));
        
        // Count in progress trainings (has start date but no completion date)
        const [inProgressTrainings] = await db
          .select({ count: sql`count(*)` })
          .from(schema.trainingRecords)
          .where(eq(schema.trainingRecords.tenantId, tenantId))
          .where(sql`completion_date IS NULL`);
        
        // Count failed trainings (has completion date but not passed)
        const [failedTrainings] = await db
          .select({ count: sql`count(*)` })
          .from(schema.trainingRecords)
          .where(eq(schema.trainingRecords.tenantId, tenantId))
          .where(sql`completion_date IS NOT NULL`)
          .where(eq(schema.trainingRecords.passed, false));
          
        // Manually update training stats
        trainingStats.completed = Number(completedTrainings?.count || 0);
        trainingStats.inProgress = Number(inProgressTrainings?.count || 0);
        trainingStats.notStarted = 0; // We don't have this concept in our schema
        trainingStats.expired = Number(failedTrainings?.count || 0); // Using failed as a proxy for expired
        
        // Get site stats directly from database
        const [activeSites] = await db
          .select({ count: sql`count(*)` })
          .from(schema.sites)
          .where(eq(schema.sites.tenantId, tenantId))
          .where(eq(schema.sites.isActive, true));
          
        const [inactiveSites] = await db
          .select({ count: sql`count(*)` })
          .from(schema.sites)
          .where(eq(schema.sites.tenantId, tenantId))
          .where(eq(schema.sites.isActive, false));
          
        const siteStats = {
          active: Number(activeSites?.count || 0),
          inactive: Number(inactiveSites?.count || 0),
          total: Number(activeSites?.count || 0) + Number(inactiveSites?.count || 0)
        };
        
        res.json({
          hazards: hazardStats,
          training: trainingStats,
          sites: siteStats
        });
      } catch (statErr) {
        console.error("Error in specific stats:", statErr);
        // Return partial data if some stats fail
        res.json({
          hazards: {
            open: 0,
            assigned: 0,
            inProgress: 0,
            resolved: 0,
            critical: 0,
            highSeverity: 0,
          },
          training: {
            totalUsers: 0,
            totalRecords: 0,
            completedTrainings: 0,
            overdueTrainings: 0,
            completionRate: 0
          },
          sites: {
            totalSites: 0,
            totalInspections: 0,
            recentInspections: 0,
            topHazardSites: []
          }
        });
      }
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

  // Inspection Templates API
  app.get('/api/inspection-templates', requireAuth, async (req, res) => {
    try {
      const templates = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId))
        .where(eq(schema.inspectionTemplates.isActive, true));
      
      return res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching inspection templates:', error);
      return res.status(500).json({ message: 'Error fetching inspection templates' });
    }
  });

  app.get('/api/inspection-templates/:id', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.id);
    
    try {
      // Using raw SQL to better handle our database structure
      // Get template details
      const templateQuery = `
        SELECT * FROM inspection_templates
        WHERE id = $1 AND tenant_id = $2 AND is_active = true
      `;
      
      const templateResult = await pool.query(templateQuery, [templateId, req.user.tenantId]);
      
      if (templateResult.rows.length === 0) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      const template = templateResult.rows[0];
      
      // Get sections for this template
      const sectionsQuery = `
        SELECT * FROM inspection_sections
        WHERE template_id = $1
        ORDER BY "order"
      `;
      
      const sectionsResult = await pool.query(sectionsQuery, [templateId]);
      const sections = sectionsResult.rows;
      
      // For each section, get its items
      const sectionsWithItems = await Promise.all(sections.map(async (section) => {
        const itemsQuery = `
          SELECT * FROM inspection_items
          WHERE section_id = $1
          ORDER BY "order"
        `;
        
        const itemsResult = await pool.query(itemsQuery, [section.id]);
        
        return {
          ...section,
          items: itemsResult.rows
        };
      }));
      
      return res.status(200).json({
        ...template,
        sections: sectionsWithItems
      });
    } catch (error) {
      console.error('Error fetching inspection template:', error);
      return res.status(500).json({ message: 'Error fetching inspection template' });
    }
  });

  app.post('/api/inspection-templates', requireAuth, async (req, res) => {
    const templateData = req.body;
    
    try {
      // Validate template data
      const validatedData = schema.insertInspectionTemplateSchema.parse({
        ...templateData,
        tenantId: req.user.tenantId,
        createdById: req.user.id
      });
      
      // Create template
      const [newTemplate] = await db.insert(schema.inspectionTemplates)
        .values(validatedData)
        .returning();
      
      return res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Error creating inspection template:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid template data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error creating inspection template' });
    }
  });

  app.post('/api/inspection-templates/:id/checklist-items', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.id);
    const itemData = req.body;
    
    try {
      // Check if template exists and belongs to user's tenant
      const [template] = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Validate checklist item data
      const validatedData = schema.insertInspectionChecklistItemSchema.parse({
        ...itemData,
        templateId
      });
      
      // Create checklist item
      const [newItem] = await db.insert(schema.inspectionChecklistItems)
        .values(validatedData)
        .returning();
      
      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating checklist item:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid checklist item data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error creating checklist item' });
    }
  });
  
  // Update a template
  app.put('/api/inspection-templates/:id', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.id);
    const templateData = req.body;
    
    try {
      // Check if template exists and belongs to user's tenant
      const [template] = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Update the template
      const [updatedTemplate] = await db.update(schema.inspectionTemplates)
        .set({
          title: templateData.title || template.title,
          description: templateData.description || template.description,
          category: templateData.category || template.category,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.inspectionTemplates.id, templateId))
        .returning();
      
      return res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error('Error updating inspection template:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid template data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error updating inspection template' });
    }
  });
  
  // Update a checklist item
  // New routes for inspection sections
  app.post('/api/inspection-sections', requireAuth, requirePermission("inspections", "create"), async (req, res) => {
    try {
      const { templateId, name, description, order } = req.body;
      
      // Verify template exists and belongs to user's tenant
      const [template] = await db
        .select()
        .from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Create section directly with database query
      const [section] = await db
        .insert(schema.inspectionSections)
        .values({
          templateId,
          name,
          description: description || '',
          order: order || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      // Create system log directly with database query
      await db
        .insert(schema.systemLogs)
        .values({
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: "inspection_section_created",
          entityType: "inspection_section",
          entityId: section.id.toString(),
          details: { templateId, name },
          createdAt: new Date().toISOString()
        });
      
      return res.status(201).json(section);
    } catch (error) {
      console.error('Error creating inspection section:', error);
      return res.status(500).json({ message: 'Error creating inspection section' });
    }
  });
  
  app.get('/api/inspection-templates/:id/sections', requireAuth, requirePermission("inspections", "read"), async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      
      // Verify template exists and belongs to user's tenant using direct query
      const [template] = await db
        .select()
        .from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Get sections directly from database
      const sections = await db
        .select()
        .from(schema.inspectionSections)
        .where(eq(schema.inspectionSections.templateId, templateId))
        .orderBy(schema.inspectionSections.order);
      
      return res.status(200).json(sections);
    } catch (error) {
      console.error('Error fetching inspection sections:', error);
      return res.status(500).json({ message: 'Error fetching inspection sections' });
    }
  });
  
  // New routes for inspection items
  app.post('/api/inspection-items', requireAuth, requirePermission("inspections", "create"), async (req, res) => {
    try {
      const { sectionId, question, description, type, required, category, options, order } = req.body;
      
      // We need to verify that the section belongs to a template that belongs to the user's tenant
      // First get the section
      const sections = await db
        .select()
        .from(schema.inspectionSections)
        .where(eq(schema.inspectionSections.id, sectionId));
      
      if (sections.length === 0) {
        return res.status(404).json({ message: 'Inspection section not found' });
      }
      
      const section = sections[0];
      
      // Then get the template to check tenant access using direct DB query
      const [template] = await db
        .select()
        .from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, section.templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
        
      if (!template) {
        return res.status(403).json({ message: 'You do not have permission to access this template' });
      }
      
      // Create item directly with database query
      const [item] = await db
        .insert(schema.inspectionItems)
        .values({
          sectionId,
          question, 
          description: description || '',
          type: type || 'yes_no',
          required: required ?? true,
          category: category || null,
          options: options || null,
          order: order || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      // Create system log directly with database query
      await db
        .insert(schema.systemLogs)
        .values({
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: "inspection_item_created",
          entityType: "inspection_item",
          entityId: item.id.toString(),
          details: { sectionId, question },
          createdAt: new Date().toISOString()
        });
      
      return res.status(201).json(item);
    } catch (error) {
      console.error('Error creating inspection item:', error);
      return res.status(500).json({ message: 'Error creating inspection item' });
    }
  });
  
  app.get('/api/inspection-sections/:id/items', requireAuth, requirePermission("inspections", "read"), async (req, res) => {
    try {
      const sectionId = parseInt(req.params.id);
      
      // We need to verify the section belongs to the user's tenant
      const sections = await db
        .select()
        .from(schema.inspectionSections)
        .where(eq(schema.inspectionSections.id, sectionId));
      
      if (sections.length === 0) {
        return res.status(404).json({ message: 'Inspection section not found' });
      }
      
      const section = sections[0];
      
      // Then get the template to check tenant access using direct DB query
      const [template] = await db
        .select()
        .from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, section.templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(403).json({ message: 'You do not have permission to access this section' });
      }
      
      // Get items directly from database
      const items = await db
        .select()
        .from(schema.inspectionItems)
        .where(eq(schema.inspectionItems.sectionId, sectionId))
        .orderBy(schema.inspectionItems.order);
      
      return res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching inspection items:', error);
      return res.status(500).json({ message: 'Error fetching inspection items' });
    }
  });
  
  app.put('/api/inspection-templates/:templateId/checklist-items/:itemId', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.templateId);
    const itemId = parseInt(req.params.itemId);
    const itemData = req.body;
    
    try {
      // Check if template exists and belongs to user's tenant
      const [template] = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Check if the checklist item exists and belongs to this template
      const [item] = await db.select().from(schema.inspectionChecklistItems)
        .where(eq(schema.inspectionChecklistItems.id, itemId))
        .where(eq(schema.inspectionChecklistItems.templateId, templateId));
      
      if (!item) {
        return res.status(404).json({ message: 'Checklist item not found' });
      }
      
      // Update the checklist item
      const [updatedItem] = await db.update(schema.inspectionChecklistItems)
        .set({
          question: itemData.question || item.question,
          description: itemData.description !== undefined ? itemData.description : item.description,
          required: itemData.required !== undefined ? itemData.required : item.required,
          category: itemData.category !== undefined ? itemData.category : item.category,
          sortOrder: itemData.sortOrder !== undefined ? itemData.sortOrder : item.sortOrder,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.inspectionChecklistItems.id, itemId))
        .returning();
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid checklist item data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error updating checklist item' });
    }
  });
  
  // Delete a checklist item
  app.delete('/api/inspection-templates/:templateId/checklist-items/:itemId', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.templateId);
    const itemId = parseInt(req.params.itemId);
    
    try {
      // Check if template exists and belongs to user's tenant
      const [template] = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Check if the checklist item exists and belongs to this template
      const [item] = await db.select().from(schema.inspectionChecklistItems)
        .where(eq(schema.inspectionChecklistItems.id, itemId))
        .where(eq(schema.inspectionChecklistItems.templateId, templateId));
      
      if (!item) {
        return res.status(404).json({ message: 'Checklist item not found' });
      }
      
      // Soft delete the checklist item by setting isActive to false
      await db.update(schema.inspectionChecklistItems)
        .set({
          isActive: false,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.inspectionChecklistItems.id, itemId));
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      return res.status(500).json({ message: 'Error deleting checklist item' });
    }
  });
  
  // Delete a template
  app.delete('/api/inspection-templates/:id', requireAuth, async (req, res) => {
    const templateId = parseInt(req.params.id);
    
    try {
      // Check if template exists and belongs to user's tenant
      const [template] = await db.select().from(schema.inspectionTemplates)
        .where(eq(schema.inspectionTemplates.id, templateId))
        .where(eq(schema.inspectionTemplates.tenantId, req.user.tenantId));
      
      if (!template) {
        return res.status(404).json({ message: 'Inspection template not found' });
      }
      
      // Start a transaction for consistency
      await db.transaction(async (tx) => {
        // Soft delete all associated checklist items
        await tx.update(schema.inspectionChecklistItems)
          .set({
            isActive: false,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inspectionChecklistItems.templateId, templateId));
        
        // Soft delete the template
        await tx.update(schema.inspectionTemplates)
          .set({
            isActive: false,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inspectionTemplates.id, templateId));
      });
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting inspection template:', error);
      return res.status(500).json({ message: 'Error deleting inspection template' });
    }
  });

  // Inspections API
  app.get('/api/inspections', requireAuth, async (req, res) => {
    const { siteId, status } = req.query;
    
    try {
      // Simplified query to avoid join issues
      let query = db.select()
        .from(schema.inspections)
        .where(eq(schema.inspections.tenantId, req.user.tenantId))
        .where(eq(schema.inspections.isActive, true));
      
      if (siteId) {
        query = query.where(eq(schema.inspections.siteId, parseInt(siteId as string)));
      }
      
      if (status) {
        query = query.where(eq(schema.inspections.status, status as string));
      }
      
      const inspections = await query;
      
      return res.status(200).json({
        inspections,
        total: inspections.length
      });
      
      // Format the results
      const formattedResults = results.map(result => ({
        ...result.inspection,
        site: result.site,
        assignedTo: result.assignedTo,
        createdBy: result.createdBy,
        template: result.template
      }));
      
      return res.status(200).json(formattedResults);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return res.status(500).json({ message: 'Error fetching inspections' });
    }
  });

  app.get('/api/inspections/:id', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    
    try {
      // Use simplified SQL to get all the required data with a single query
      const result = await db.execute(`
        SELECT i.*, s.name as site_name, s.address as site_address, 
               u.first_name as inspector_first_name, u.last_name as inspector_last_name
        FROM inspections i
        LEFT JOIN sites s ON i.site_id = s.id
        LEFT JOIN users u ON i.inspector_id = u.id
        WHERE i.id = ${inspectionId}
        AND i.tenant_id = ${req.user.tenantId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      const inspection = result.rows[0];
      
      // Get responses using raw SQL
      const responsesResult = await db.execute(`
        SELECT * FROM inspection_responses 
        WHERE inspection_id = ${inspectionId}
      `);
      const responses = responsesResult.rows;
      
      // Get findings using raw SQL
      const findingsResult = await db.execute(`
        SELECT * FROM inspection_findings 
        WHERE inspection_id = ${inspectionId}
        AND is_active = true
      `);
      const findings = findingsResult.rows;
      
      // Format the response to include site details
      const site = {
        id: inspection.site_id,
        name: inspection.site_name,
        address: inspection.site_address
      };
      
      // Format the inspector details if available
      let inspector = null;
      if (inspection.inspector_id) {
        inspector = {
          id: inspection.inspector_id,
          firstName: inspection.inspector_first_name,
          lastName: inspection.inspector_last_name
        };
      }
      
      // Create a well-formatted response object
      return res.status(200).json({
        inspection,
        site,
        inspector,
        responses,
        findings
      });
    } catch (error) {
      console.error('Error fetching inspection:', error);
      return res.status(500).json({ message: 'Error fetching inspection' });
    }
  });

  // Removed duplicate inspection route - already defined above

  app.post('/api/inspections/:id/responses', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    const responseData = req.body;
    
    try {
      // Check if inspection exists and belongs to user's tenant
      const [inspection] = await db.select().from(schema.inspections)
        .where(eq(schema.inspections.id, inspectionId))
        .where(eq(schema.inspections.tenantId, req.user.tenantId));
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Check if inspection is in progress
      if (inspection.status !== 'in_progress') {
        return res.status(400).json({ message: 'Inspection must be in progress to add responses' });
      }
      
      // Check if a response already exists for this checklist item
      const [existingResponse] = await db.select().from(schema.inspectionResponses)
        .where(eq(schema.inspectionResponses.inspectionId, inspectionId))
        .where(eq(schema.inspectionResponses.checklistItemId, responseData.checklistItemId));
      
      if (existingResponse) {
        // If it exists, return a 409 Conflict with the existing response
        return res.status(409).json({
          message: 'Response already exists for this checklist item',
          existingResponse
        });
      }
      
      // Validate response data
      const validatedData = schema.insertInspectionResponseSchema.parse({
        ...responseData,
        inspectionId,
        createdById: req.user.id
      });
      
      // Create the response
      const [newResponse] = await db.insert(schema.inspectionResponses)
        .values(validatedData)
        .returning();
      
      return res.status(201).json(newResponse);
    } catch (error) {
      console.error('Error saving inspection response:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid response data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error saving inspection response' });
    }
  });
  
  // Add an endpoint to update an existing response
  app.put('/api/inspections/:id/responses/:responseId', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    const responseId = parseInt(req.params.responseId);
    const updateData = req.body;
    
    try {
      // Check if inspection exists and belongs to user's tenant
      const [inspection] = await db.select().from(schema.inspections)
        .where(eq(schema.inspections.id, inspectionId))
        .where(eq(schema.inspections.tenantId, req.user.tenantId));
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Check if inspection is in progress
      if (inspection.status !== 'in_progress') {
        return res.status(400).json({ message: 'Inspection must be in progress to update responses' });
      }
      
      // Check if the response exists and belongs to this inspection
      const [existingResponse] = await db.select().from(schema.inspectionResponses)
        .where(eq(schema.inspectionResponses.id, responseId))
        .where(eq(schema.inspectionResponses.inspectionId, inspectionId));
      
      if (!existingResponse) {
        return res.status(404).json({ message: 'Response not found' });
      }
      
      // Update the response
      const [updatedResponse] = await db.update(schema.inspectionResponses)
        .set({
          response: updateData.response || existingResponse.response,
          status: updateData.status || existingResponse.status,
          notes: updateData.notes ?? existingResponse.notes,
          photoUrls: updateData.photoUrls || existingResponse.photoUrls,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.inspectionResponses.id, responseId))
        .returning();
      
      return res.status(200).json(updatedResponse);
    } catch (error) {
      console.error('Error updating inspection response:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid response data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error updating inspection response' });
    }
  });

  app.post('/api/inspections/:id/findings', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    const findingData = req.body;
    
    try {
      // Check if inspection exists and belongs to user's tenant
      const [inspection] = await db.select().from(schema.inspections)
        .where(eq(schema.inspections.id, inspectionId))
        .where(eq(schema.inspections.tenantId, req.user.tenantId));
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Validate finding data
      const validatedData = schema.insertInspectionFindingSchema.parse({
        ...findingData,
        inspectionId,
        createdById: req.user.id
      });
      
      // Create finding
      const [newFinding] = await db.insert(schema.inspectionFindings)
        .values(validatedData)
        .returning();
      
      return res.status(201).json(newFinding);
    } catch (error) {
      console.error('Error creating inspection finding:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid finding data', errors: error.errors });
      }
      
      return res.status(500).json({ message: 'Error creating inspection finding' });
    }
  });

  app.put('/api/inspections/:id/complete', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    const { notes } = req.body;
    
    try {
      // Check if inspection exists and belongs to user's tenant
      const [inspection] = await db.select().from(schema.inspections)
        .where(eq(schema.inspections.id, inspectionId))
        .where(eq(schema.inspections.tenantId, req.user.tenantId));
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Check if inspection is in progress
      if (inspection.status !== 'in_progress') {
        return res.status(400).json({ 
          message: 'Only inspections in progress can be completed'
        });
      }
      
      // Get checklist items for this template using raw SQL to avoid column name mismatches
      let checklistItems = [];
      if (inspection.template_id) {
        const checklistItemsResult = await db.execute(`
          SELECT * FROM inspection_checklist_items 
          WHERE template_id = ${inspection.template_id}
          AND is_active = true
        `);
        checklistItems = checklistItemsResult.rows;
      }
      
      // Calculate score
      const responses = await db.select().from(schema.inspectionResponses)
        .where(eq(schema.inspectionResponses.inspectionId, inspectionId));
      
      // Create a map of all responses by checklist item ID
      const responseMap = responses.reduce((map, response) => {
        map[response.checklistItemId] = response;
        return map;
      }, {});
      
      // Check if all required checklist items have responses
      const missingResponses = checklistItems.filter(item => {
        if (item.isRequired && !responseMap[item.id]) {
          return true;
        }
        return false;
      });
      
      if (missingResponses.length > 0) {
        return res.status(400).json({
          message: `${missingResponses.length} required questions still need responses before this inspection can be completed`,
          missingItems: missingResponses
        });
      }
      
      let score = 0;
      const maxScore = checklistItems.length;
      
      // Simple scoring: +1 for each 'yes' response
      for (const response of responses) {
        if (response.response === 'yes') {
          score += 1;
        }
      }
      
      // Update inspection
      const [updatedInspection] = await db.update(schema.inspections)
        .set({
          status: 'completed',
          completedById: req.user.id,
          completedDate: new Date().toISOString(),
          notes: notes || inspection.notes,
          score,
          maxScore,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.inspections.id, inspectionId))
        .returning();
      
      return res.status(200).json(updatedInspection);
    } catch (error) {
      console.error('Error completing inspection:', error);
      return res.status(500).json({ message: 'Error completing inspection' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

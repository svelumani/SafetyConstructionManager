import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, loginSchema, InsertTenant } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    console.warn("Warning: SESSION_SECRET not set, using a random value");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            // Update last login
            await storage.updateUser(user.id, {
              lastLogin: new Date().toISOString()
            });
            
            return done(null, user);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request body:", JSON.stringify(req.body, null, 2));
      const { email, password, firstName, lastName, username, role, tenant } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create tenant if provided in the request
      let tenantId = null;
      console.log("Tenant data:", JSON.stringify(tenant, null, 2));
      
      if (tenant && tenant.name) {
        try {
          // Create the tenant using the storage interface with proper validation
          // Use the InsertTenant type from schema
          const tenantData: InsertTenant = {
            name: tenant.name,
            email: tenant.email || email,
            phone: tenant.phone || null,
            address: tenant.address || null,
            subscriptionPlan: "basic",
            subscriptionStatus: 'active'
          };
          
          // Using the storage interface as designed
          const newTenant = await storage.createTenant(tenantData);
          
          tenantId = newTenant.id;
          
          console.log(`Successfully created tenant: ${newTenant.name} with ID: ${newTenant.id}`);
          
          // Log tenant creation through the system log interface
          await storage.createSystemLog({
            tenantId: tenantId,
            action: "tenant_created",
            entityType: "tenant",
            entityId: tenantId.toString(),
            details: { name: tenant.name }
          });
        } catch (error: any) {
          console.error("Failed to create tenant:", error.message);
          // Continue with user creation even if tenant creation fails
        }
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        tenantId,
        role: role || (tenantId ? "safety_officer" : "employee"), // Make first user a safety officer if they created a tenant
      });

      await storage.createSystemLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "user_registered",
        entityType: "user",
        entityId: user.id.toString(),
        details: { email: user.email }
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ ...user, password: undefined });
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      passport.authenticate("local", async (err: any, user: User) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        
        if (!user.isActive) {
          return res.status(403).json({ message: "Account is disabled" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          
          // Log the login
          storage.createSystemLog({
            tenantId: user.tenantId,
            userId: user.id,
            action: "user_login",
            entityType: "user",
            entityId: user.id.toString(),
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
          
          return res.json({ ...user, password: undefined });
        });
      })(req, res, next);
    } catch (err) {
      console.error("Login error:", err);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    const user = req.user;
    if (user) {
      storage.createSystemLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "user_logout",
        entityType: "user",
        entityId: user.id.toString(),
        ipAddress: req.ip
      });
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user;
    res.json({ ...user, password: undefined });
  });
}

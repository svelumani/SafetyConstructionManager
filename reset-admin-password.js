#!/usr/bin/env node

// Script to reset the admin password for MySafety application
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    // Set a simple admin password
    const newPassword = 'admin123';
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the admin user password
    const result = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        isActive: true
      })
      .where(eq(users.email, 'admin@mysafety.com'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('');
      console.log('🔑 Admin Login Credentials:');
      console.log('   Email: admin@mysafety.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('⚠️  Please change this password after logging in!');
    } else {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      // Create admin user if doesn't exist
      const newAdmin = await db
        .insert(users)
        .values({
          username: 'superadmin',
          email: 'admin@mysafety.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true,
          tenantId: null // Super admin doesn't belong to any tenant
        })
        .returning();
        
      console.log('✅ New admin user created successfully!');
      console.log('');
      console.log('🔑 Admin Login Credentials:');
      console.log('   Email: admin@mysafety.com');
      console.log('   Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();
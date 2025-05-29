
#!/usr/bin/env node

/**
 * Modern MySafety Migration System
 * Uses Drizzle schema push for reliable migrations
 */

import pkg from 'pg';
const { Pool } = pkg;
import { execSync } from 'child_process';
import fs from 'fs';

class ModernMigrationSystem {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async checkConnection() {
    console.log('🔌 Testing database connection...');
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async getTableCount() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting table count:', error.message);
      return 0;
    } finally {
      client.release();
    }
  }

  async createEnums() {
    console.log('📋 Creating enums...');
    const client = await this.pool.connect();
    
    const enums = [
      "CREATE TYPE user_role AS ENUM ('super_admin', 'safety_officer', 'supervisor', 'subcontractor', 'employee')",
      "CREATE TYPE site_role AS ENUM ('site_manager', 'safety_coordinator', 'foreman', 'worker', 'subcontractor', 'visitor')",
      "CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical')",
      "CREATE TYPE hazard_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed')",
      "CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'canceled')",
      "CREATE TYPE inspection_item_type AS ENUM ('yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text')",
      "CREATE TYPE compliance_status AS ENUM ('yes', 'no', 'na', 'partial')",
      "CREATE TYPE permit_status AS ENUM ('requested', 'approved', 'denied', 'expired')",
      "CREATE TYPE incident_severity AS ENUM ('minor', 'moderate', 'major', 'critical')",
      "CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed')",
      "CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium', 'enterprise')"
    ];

    try {
      for (const enumSql of enums) {
        try {
          await client.query(enumSql);
        } catch (error) {
          if (error.code !== '42710') { // Ignore "already exists" errors
            throw error;
          }
        }
      }
      console.log('✅ Enums created successfully!');
    } catch (error) {
      console.error('❌ Failed to create enums:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async runDrizzlePush() {
    console.log('🚀 Running Drizzle schema push...');
    try {
      // Run drizzle-kit push
      execSync('npx drizzle-kit push', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Drizzle push completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Drizzle push failed:', error.message);
      return false;
    }
  }

  async insertDefaultData() {
    console.log('📝 Inserting default data...');
    const client = await this.pool.connect();
    
    try {
      // Insert default super admin if not exists
      const userCheck = await client.query("SELECT id FROM users WHERE email = 'admin@mysafety.com'");
      
      if (userCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO users (username, email, password, first_name, last_name, role)
          VALUES ('superadmin', 'admin@mysafety.com', 'c9ab78209c4c4e546fd06e85a60dd02ff3c969f0c9d1e0526f6d52815a6399c9a0a4f9eb90ed73b3e3ba2b1dc46e1efcd4e47fd2de65f64cf12b7722e34fd320.69ec746c1b00f94ebc82a2b40fbd69c9', 'Super', 'Admin', 'super_admin')
        `);
        console.log('✅ Default admin user created');
      } else {
        console.log('ℹ️  Default admin user already exists');
      }

    } catch (error) {
      console.error('❌ Failed to insert default data:', error.message);
    } finally {
      client.release();
    }
  }

  async migrate() {
    console.log('🚀 Modern MySafety Migration System');
    console.log('====================================');

    try {
      // Check connection
      if (!(await this.checkConnection())) {
        throw new Error('Database connection failed');
      }

      // Check current state
      const tableCount = await this.getTableCount();
      console.log(`📊 Current database has ${tableCount} tables`);

      // Create enums first
      await this.createEnums();

      // Use Drizzle to create/update schema
      const pushSuccess = await this.runDrizzlePush();
      
      if (!pushSuccess) {
        throw new Error('Schema push failed');
      }

      // Insert default data
      await this.insertDefaultData();

      // Final verification
      const finalTableCount = await this.getTableCount();
      console.log(`📊 Database now has ${finalTableCount} tables`);
      
      console.log('🎉 Migration completed successfully!');

    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Run migration
async function main() {
  const migrator = new ModernMigrationSystem();
  
  try {
    await migrator.migrate();
    console.log('✅ All migrations completed!');
  } catch (error) {
    console.error('❌ Migration system failed:', error.message);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

main();

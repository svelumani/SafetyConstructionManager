#!/usr/bin/env node

// Enhanced Migration System for MySafety - Docker Compatible
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class MigrationManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Enhanced connection settings for Docker
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10
    });
  }

  async initMigrationTable() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migration_history (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) UNIQUE NOT NULL,
          applied_at TIMESTAMP DEFAULT NOW(),
          checksum VARCHAR(64),
          execution_time_ms INTEGER,
          status VARCHAR(20) DEFAULT 'completed'
        )
      `);
      console.log('✅ Migration tracking table ready');
    } catch (error) {
      console.error('❌ Failed to create migration table:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  async getAppliedMigrations() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT migration_name, checksum FROM migration_history WHERE status = $1 ORDER BY applied_at',
        ['completed']
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error.message);
      return [];
    } finally {
      client.release();
    }
  }

  async validateMigration(migrationName, sqlContent, appliedMigrations) {
    const currentChecksum = this.calculateChecksum(sqlContent);
    const appliedMigration = appliedMigrations.find(m => m.migration_name === migrationName);
    
    if (appliedMigration) {
      if (appliedMigration.checksum !== currentChecksum) {
        console.warn(`⚠️  Warning: Migration ${migrationName} has been modified since last application`);
        console.warn(`   Previous checksum: ${appliedMigration.checksum}`);
        console.warn(`   Current checksum:  ${currentChecksum}`);
        // Continue anyway for development environments
      }
      return false; // Already applied
    }
    return true; // Needs to be applied
  }

  async applyMigration(migrationName, sqlContent) {
    const client = await this.pool.connect();
    const startTime = Date.now();
    
    try {
      await client.query('BEGIN');
      
      console.log(`🔄 Executing migration: ${migrationName}`);
      
      // Split SQL content by statements to handle complex migrations
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }
      
      const executionTime = Date.now() - startTime;
      const checksum = this.calculateChecksum(sqlContent);
      
      // Record migration in history
      await client.query(
        'INSERT INTO migration_history (migration_name, checksum, execution_time_ms) VALUES ($1, $2, $3)',
        [migrationName, checksum, executionTime]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Applied migration: ${migrationName} (${executionTime}ms)`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to apply migration ${migrationName}:`, error.message);
      
      // Log failed migration attempt
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO migration_history (migration_name, status, execution_time_ms) VALUES ($1, $2, $3)',
          [migrationName, 'failed', Date.now() - startTime]
        );
        await client.query('COMMIT');
      } catch (logError) {
        console.error('Failed to log migration failure:', logError.message);
      }
      
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🚀 Starting MySafety Enhanced Migration System...');
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🐘 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      await this.initMigrationTable();
      const appliedMigrations = await this.getAppliedMigrations();
      
      console.log(`📋 Found ${appliedMigrations.length} previously applied migrations`);
      
      // Get all migration files and sort them properly
      const migrationsDir = './migrations/sql';
      
      if (!fs.existsSync(migrationsDir)) {
        console.error(`❌ Migrations directory not found: ${migrationsDir}`);
        return;
      }
      
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort((a, b) => {
          // Sort by number prefix (000_xxx.sql, 001_xxx.sql, etc.)
          const aNum = parseInt(a.split('_')[0]) || 999;
          const bNum = parseInt(b.split('_')[0]) || 999;
          return aNum - bNum;
        });
      
      console.log(`📁 Found ${migrationFiles.length} migration files`);
      
      let appliedCount = 0;
      
      for (const file of migrationFiles) {
        const migrationName = file.replace('.sql', '');
        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        const shouldApply = await this.validateMigration(migrationName, sqlContent, appliedMigrations);
        
        if (!shouldApply) {
          console.log(`⏭️  Skipping ${migrationName} (already applied)`);
          continue;
        }
        
        await this.applyMigration(migrationName, sqlContent);
        appliedCount++;
      }
      
      if (appliedCount === 0) {
        console.log('✨ Database is up to date - no migrations needed');
      } else {
        console.log(`🎉 Migration complete! Applied ${appliedCount} new migrations`);
      }
      
    } catch (error) {
      console.error('💥 Migration system failed:', error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', error);
      }
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
}

// Enhanced migration runner with better error handling
async function main() {
  const migrationManager = new MigrationManager();
  
  // Handle process termination gracefully
  process.on('SIGINT', async () => {
    console.log('\n🛑 Migration interrupted by user');
    await migrationManager.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Migration terminated');
    await migrationManager.close();
    process.exit(0);
  });
  
  try {
    const startTime = Date.now();
    await migrationManager.runMigrations();
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  Total migration time: ${totalTime}ms`);
    console.log('🏁 Migration system completed successfully!');
  } catch (error) {
    console.error('💥 Migration system failed:', error.message);
    
    // Provide helpful debugging information
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Database connection refused. Check:');
      console.error('   - DATABASE_URL is correct');
      console.error('   - Database server is running');
      console.error('   - Network connectivity');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Database host not found. Check DATABASE_URL hostname');
    } else if (error.message.includes('password authentication failed')) {
      console.error('🔍 Authentication failed. Check DATABASE_URL credentials');
    }
    
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrationManager;
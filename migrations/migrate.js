#!/usr/bin/env node

// Alembic-style migration system for MySafety
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

class MigrationManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
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
          checksum VARCHAR(64)
        )
      `);
      console.log('✅ Migration tracking table ready');
    } finally {
      client.release();
    }
  }

  async getAppliedMigrations() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT migration_name FROM migration_history ORDER BY applied_at'
      );
      return result.rows.map(row => row.migration_name);
    } finally {
      client.release();
    }
  }

  async applyMigration(migrationName, sqlContent) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Apply the migration
      await client.query(sqlContent);
      
      // Record it in migration history
      await client.query(
        'INSERT INTO migration_history (migration_name) VALUES ($1)',
        [migrationName]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Applied migration: ${migrationName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to apply migration ${migrationName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🚀 Starting MySafety migrations...');
    
    await this.initMigrationTable();
    const appliedMigrations = await this.getAppliedMigrations();
    
    // Get all migration files
    const migrationsDir = './migrations/sql';
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      
      if (appliedMigrations.includes(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already applied)`);
        continue;
      }
      
      console.log(`🔄 Applying ${migrationName}...`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await this.applyMigration(migrationName, sqlContent);
    }
    
    console.log('🎉 All migrations completed!');
  }

  async close() {
    await this.pool.end();
  }
}

// Run migrations
async function main() {
  const migrationManager = new MigrationManager();
  try {
    await migrationManager.runMigrations();
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrationManager;
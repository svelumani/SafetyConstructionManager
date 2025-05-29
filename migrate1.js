#!/usr/bin/env node

// Docker-Compatible Migration Tool for MySafety
// Fixed: Handles existing objects without transaction abort

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

class DockerMigrationManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      max: 5
    });
  }

  async waitForDatabase() {
    console.log('🔄 Waiting for PostgreSQL to be ready...');
    let retries = 30;

    while (retries > 0) {
      try {
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ PostgreSQL is ready!');
        return;
      } catch (error) {
        console.log(`⏳ Database not ready, retrying... (${retries} attempts left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('❌ Database connection timeout after 60 seconds');
  }

  async getCurrentTableCount() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting table count:', error.message);
      return 0;
    } finally {
      client.release();
    }
  }

  async runDockerMigration() {
    console.log('🐳 Docker Migration System for MySafety');
    console.log('======================================');

    await this.waitForDatabase();

    const tableCount = await this.getCurrentTableCount();
    console.log(`📊 Current database has ${tableCount} tables`);

    if (tableCount >= 28) {
      console.log('✅ Database already has all required tables!');
      console.log('🎉 Migration not needed - database is complete');
      return { migrationRun: false, tables: tableCount };
    }

    console.log('🚀 Running Docker database setup...');

    // Use the fixed SQL file
    const sqlFile = './docker-db-setup-fixed.sql';
    if (!fs.existsSync(sqlFile)) {
      throw new Error('❌ docker-db-setup-fixed.sql file not found');
    }

    const dockerSQL = fs.readFileSync(sqlFile, 'utf8');
    console.log('📁 Docker SQL file loaded successfully');

    const client = await this.pool.connect();

    try {
      console.log('🔄 Executing Docker database setup...');

      // CRITICAL FIX: Execute the entire SQL as one statement
      // This allows the DO blocks to handle "already exists" errors properly
      await client.query(dockerSQL);

      console.log('✅ Database setup completed successfully!');

      // Verify final table count
      const newTableCount = await this.getCurrentTableCount();
      console.log(`📊 Database now has ${newTableCount} tables`);

      if (newTableCount >= 28) {
        console.log('🎉 Docker migration completed successfully!');
      } else {
        console.log(`⚠️  Expected 28 tables but got ${newTableCount}`);
        console.log('💡 Some tables may still be missing - check manually');
      }

      return { migrationRun: true, tables: newTableCount };

    } catch (error) {
      console.error('❌ Docker migration failed:', error.message);

      // Fallback to Drizzle push if SQL migration fails
      console.log('⚠️  Migration system had conflicts, using direct schema approach...');

      try {
        const { execSync } = await import('child_process');
        execSync('npx drizzle-kit push', { stdio: 'inherit' });
        console.log('✅ Direct schema push successful!');

        const finalCount = await this.getCurrentTableCount();
        return { migrationRun: true, tables: finalCount };
      } catch (alternativeError) {
        console.error('❌ Alternative migration failed:', alternativeError.message);
        throw new Error('All migration methods failed');
      }
    } finally {
      client.release();
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
  }
}

// Main execution for Docker environment
async function main() {
  const migrationManager = new DockerMigrationManager();

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Docker container stopping...');
    await migrationManager.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 Migration interrupted...');
    await migrationManager.close();
    process.exit(0);
  });

  try {
    const startTime = Date.now();
    const result = await migrationManager.runDockerMigration();
    const totalTime = Date.now() - startTime;

    console.log(`⏱️  Total migration time: ${totalTime}ms`);
    console.log('🏁 Docker migration system completed!');

    process.exit(0);

  } catch (error) {
    console.error('💥 Docker migration failed:', error.message);
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DockerMigrationManager;
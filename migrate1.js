#!/usr/bin/env node

// Docker-Compatible Migration Tool for MySafety
// Handles Docker PostgreSQL initialization properly

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

  async checkTableExists(tableName) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error.message);
      return false;
    } finally {
      client.release();
    }
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

    // Check if docker-db-setup.sql exists
    if (!fs.existsSync('./docker-db-setup.sql')) {
      throw new Error('❌ docker-db-setup.sql file not found');
    }

    const dockerSQL = fs.readFileSync('./docker-db-setup.sql', 'utf8');
    console.log('📁 Docker SQL file loaded successfully');

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      console.log('🔄 Executing Docker database setup...');

      // Split the SQL into chunks to handle it properly
      const sqlChunks = dockerSQL
        .split(';')
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0 && !chunk.startsWith('--'));

      let executedCommands = 0;

      for (const chunk of sqlChunks) {
        if (chunk.trim()) {
          try {
            await client.query(chunk);
            executedCommands++;
          } catch (error) {
            // Ignore "already exists" errors in Docker environment
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key')) {
              console.log(`⚠️  Skipping existing object: ${error.message.split(':')[0]}`);
              continue;
            }
            throw error;
          }
        }
      }

      await client.query('COMMIT');
      console.log(`✅ Executed ${executedCommands} SQL commands successfully`);

      // Verify final table count
      const newTableCount = await this.getCurrentTableCount();
      console.log(`📊 Database now has ${newTableCount} tables`);

      if (newTableCount >= 28) {
        console.log('🎉 Docker migration completed successfully!');
      } else {
        console.log(`⚠️  Expected 28 tables but got ${newTableCount}`);
      }

      return { migrationRun: true, tables: newTableCount };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Docker migration failed:', error.message);
      throw error;
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

  // Handle Docker container shutdown signals
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

    // Exit with success code
    process.exit(0);

  } catch (error) {
    console.error('💥 Docker migration failed:', error.message);

    // Provide Docker-specific debugging info
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Docker database connection issues:');
      console.error('   - Check if PostgreSQL container is running');
      console.error('   - Verify DATABASE_URL points to postgres service');
      console.error('   - Ensure containers are on same network');
    }

    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DockerMigrationManager;
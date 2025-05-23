import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './db.js';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, { 
      migrationsFolder: './migrations',
      migrationsTable: 'drizzle_migrations'
    });
    
    console.log('✅ Database migrations completed successfully!');
    
    // Close the connection pool
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
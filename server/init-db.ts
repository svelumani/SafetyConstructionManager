#!/usr/bin/env node

import { db, pool } from './db.js';
import * as schema from '../shared/schema.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test database connection
    console.log('🔗 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');

    // Create tables if they don't exist
    console.log('📋 Creating tables...');
    
    // Check if any tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'tenants', 'sites')
    `);
    
    if (result.rows.length === 0) {
      console.log('📝 No existing tables found. Database schema needs to be created.');
      console.log('💡 Please run: npm run db:push to create the schema');
    } else {
      console.log(`✅ Found ${result.rows.length} existing tables in database`);
      console.log('📋 Existing tables:', result.rows.map(r => r.table_name).join(', '));
    }

    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database ready for use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
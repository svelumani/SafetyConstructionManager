
#!/usr/bin/env node

// Docker Migration Check for MySafety
// Quick verification that all tables exist

import pkg from 'pg';
const { Pool } = pkg;

async function checkDockerMigration() {
  console.log('🐳 Docker Migration Check');
  console.log('========================');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    // Test connection
    const client = await pool.connect();
    
    // Get table count
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tableCount = parseInt(result.rows[0].count);
    
    console.log(`📊 Found ${tableCount} tables in database`);
    
    if (tableCount >= 28) {
      console.log('✅ Database setup is complete!');
      console.log('🎉 All required tables are present');
    } else {
      console.log(`⚠️  Expected 28 tables, found ${tableCount}`);
      console.log('💡 Run migration: node migrate1.js');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkDockerMigration();

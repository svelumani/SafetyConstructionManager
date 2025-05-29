
#!/usr/bin/env node

/**
 * Remove All Foreign Key Constraints Script
 * This script generates and executes DROP statements for all FK constraints
 */

import pkg from 'pg';
const { Pool } = pkg;

async function removeForeignKeys() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    const client = await pool.connect();
    
    console.log('🔗 Analyzing Foreign Key Constraints...');
    
    // Get all foreign key constraints
    const fkResult = await client.query(`
      SELECT 
        tc.table_name, 
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc 
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `);

    console.log(`📊 Found ${fkResult.rows.length} foreign key constraints`);

    if (fkResult.rows.length === 0) {
      console.log('✅ No foreign key constraints found to remove');
      client.release();
      await pool.end();
      return;
    }

    console.log('\n🗑️  Removing Foreign Key Constraints:');
    console.log('=====================================');

    let removed = 0;
    let skipped = 0;

    for (const row of fkResult.rows) {
      const dropSQL = `ALTER TABLE ${row.table_name} DROP CONSTRAINT IF EXISTS ${row.constraint_name}`;
      
      try {
        await client.query(dropSQL);
        console.log(`✅ Removed: ${row.table_name}.${row.constraint_name}`);
        removed++;
      } catch (error) {
        console.log(`⚠️  Skipped: ${row.table_name}.${row.constraint_name} (${error.message})`);
        skipped++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Removed: ${removed} constraints`);
    console.log(`   ⚠️  Skipped: ${skipped} constraints`);
    console.log(`\n🎉 Foreign key constraint removal completed!`);
    console.log(`\n💡 Note: Tables still have reference columns but no FK enforcement`);

    client.release();
    await pool.end();

  } catch (error) {
    console.error('💥 FK removal failed:', error.message);
    process.exit(1);
  }
}

removeForeignKeys();

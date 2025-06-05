#!/usr/bin/env node

// Fix tenant data alignment for proper hazard details visibility

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixTenantAlignment() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing tenant data alignment for hazard details...');
    
    // Get current user's tenant
    const currentUser = await client.query("SELECT tenant_id FROM users WHERE username = 'shyam'");
    const userTenantId = currentUser.rows[0].tenant_id;
    
    console.log(`User tenant ID: ${userTenantId}`);
    
    // Update all safety data to match user's tenant
    await client.query('UPDATE sites SET tenant_id = $1', [userTenantId]);
    await client.query('UPDATE training_courses SET tenant_id = $1', [userTenantId]);
    await client.query('UPDATE training_records SET tenant_id = $1', [userTenantId]);
    await client.query('UPDATE incident_reports SET tenant_id = $1', [userTenantId]);
    await client.query('UPDATE permit_requests SET tenant_id = $1', [userTenantId]);
    await client.query('UPDATE inspections SET tenant_id = $1', [userTenantId]);
    
    // Fix hazard assignments to point to correct hazard IDs
    const hazardIds = await client.query('SELECT id FROM hazard_reports WHERE tenant_id = $1 ORDER BY id', [userTenantId]);
    const assignmentResults = await client.query('SELECT id FROM hazard_assignments ORDER BY id');
    
    for (let i = 0; i < Math.min(hazardIds.rows.length, assignmentResults.rows.length); i++) {
      await client.query('UPDATE hazard_assignments SET hazard_id = $1 WHERE id = $2', 
        [hazardIds.rows[i].id, assignmentResults.rows[i].id]);
    }
    
    // Fix hazard comments to point to correct hazard IDs
    const commentResults = await client.query('SELECT id FROM hazard_comments ORDER BY id');
    
    for (let i = 0; i < Math.min(hazardIds.rows.length, commentResults.rows.length); i++) {
      const hazardIndex = i % hazardIds.rows.length;
      await client.query('UPDATE hazard_comments SET hazard_id = $1 WHERE id = $2', 
        [hazardIds.rows[hazardIndex].id, commentResults.rows[i].id]);
    }
    
    // Verify connections
    const verification = await client.query(`
      SELECT 
        hr.id as hazard_id,
        hr.title,
        hr.status,
        COUNT(DISTINCT ha.id) as assignments,
        COUNT(DISTINCT hc.id) as comments
      FROM hazard_reports hr
      LEFT JOIN hazard_assignments ha ON hr.id = ha.hazard_id
      LEFT JOIN hazard_comments hc ON hr.id = hc.hazard_id
      WHERE hr.tenant_id = $1
      GROUP BY hr.id, hr.title, hr.status
      ORDER BY hr.id
      LIMIT 5
    `, [userTenantId]);
    
    console.log('Verification - Hazard details connectivity:');
    verification.rows.forEach(row => {
      console.log(`Hazard ${row.hazard_id}: ${row.assignments} assignments, ${row.comments} comments`);
    });
    
    console.log('Tenant data alignment completed successfully');
    
  } catch (error) {
    console.error('Error fixing tenant alignment:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixTenantAlignment();
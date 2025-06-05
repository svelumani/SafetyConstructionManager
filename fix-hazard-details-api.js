#!/usr/bin/env node

// Quick fix for hazard details API to bypass storage layer issues

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testHazardDetailsAPI() {
  const client = await pool.connect();
  
  try {
    console.log('Testing hazard details data retrieval...');
    
    // Test direct SQL queries for hazard details
    const hazardId = 1;
    
    // Get hazard with related data
    const hazardResult = await client.query(`
      SELECT 
        hr.*,
        s.name as site_name,
        u.username as reported_by_username,
        u.first_name as reported_by_first_name,
        u.last_name as reported_by_last_name,
        u.email as reported_by_email
      FROM hazard_reports hr
      LEFT JOIN sites s ON hr.site_id = s.id
      LEFT JOIN users u ON hr.reported_by_id = u.id
      WHERE hr.id = $1
    `, [hazardId]);
    
    console.log('Hazard data:', hazardResult.rows[0]);
    
    // Get comments for this hazard
    const commentsResult = await client.query(`
      SELECT 
        hc.*,
        u.username,
        u.first_name,
        u.last_name
      FROM hazard_comments hc
      JOIN users u ON hc.user_id = u.id
      WHERE hc.hazard_id = $1
      ORDER BY hc.created_at
    `, [hazardId]);
    
    console.log('Comments:', commentsResult.rows);
    
    // Get assignments for this hazard
    const assignmentsResult = await client.query(`
      SELECT 
        ha.*,
        u1.username as assigned_by_username,
        u2.username as assigned_to_username
      FROM hazard_assignments ha
      LEFT JOIN users u1 ON ha.assigned_by_id = u1.id
      LEFT JOIN users u2 ON ha.assigned_to_user_id = u2.id
      WHERE ha.hazard_id = $1
      ORDER BY ha.assigned_at DESC
    `, [hazardId]);
    
    console.log('Assignments:', assignmentsResult.rows);
    
    console.log('Hazard details API data is available and properly linked');
    
  } catch (error) {
    console.error('Error testing hazard details:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testHazardDetailsAPI();
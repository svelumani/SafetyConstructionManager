#!/usr/bin/env node

/**
 * Quick Database Schema Audit for MySafety
 * Fast analysis of table structures and missing columns
 */

import pkg from 'pg';
const { Pool } = pkg;

async function quickAudit() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 MySafety Database Audit');
    console.log('==========================');

    const client = await pool.connect();

    // Get current tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
      ORDER BY table_name
    `);

    const currentTables = tablesResult.rows.map(row => row.table_name);
    console.log(`📊 Found ${currentTables.length} tables:`);
    currentTables.forEach(table => console.log(`   ✓ ${table}`));

    // Expected tables from docker-db-setup.sql
    const expectedTables = [
      'tenants', 'users', 'user_preferences', 'sites', 'subcontractors', 'teams', 
      'site_personnel', 'inspection_templates', 'inspection_sections', 'inspection_items',
      'inspection_checklist_items', 'inspections', 'inspection_responses', 'inspection_findings',
      'hazard_reports', 'hazard_assignments', 'hazard_comments', 'permit_requests',
      'incident_reports', 'training_content', 'training_courses', 'training_records',
      'system_logs', 'email_templates', 'role_permissions', 'report_history',
      'user_sessions', 'migration_history'
    ];

    console.log(`\n🎯 Expected ${expectedTables.length} tables`);

    // Find missing tables
    const missingTables = expectedTables.filter(table => !currentTables.includes(table));
    const extraTables = currentTables.filter(table => !expectedTables.includes(table));

    if (missingTables.length > 0) {
      console.log(`\n❌ Missing Tables (${missingTables.length}):`);
      missingTables.forEach(table => console.log(`   ❌ ${table}`));
    }

    if (extraTables.length > 0) {
      console.log(`\n➕ Extra Tables (${extraTables.length}):`);
      extraTables.forEach(table => console.log(`   ➕ ${table}`));
    }

    // Get enums
    const enumsResult = await client.query(`
      SELECT typname as enum_name 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname
    `);

    const currentEnums = enumsResult.rows.map(row => row.enum_name);
    console.log(`\n📋 Found ${currentEnums.length} enums:`);
    currentEnums.forEach(enumName => console.log(`   ✓ ${enumName}`));

    const expectedEnums = [
      'user_role', 'site_role', 'hazard_severity', 'hazard_status', 'inspection_status',
      'inspection_item_type', 'compliance_status', 'permit_status', 'incident_severity',
      'incident_status', 'subscription_plan'
    ];

    const missingEnums = expectedEnums.filter(enumName => !currentEnums.includes(enumName));
    if (missingEnums.length > 0) {
      console.log(`\n❌ Missing Enums (${missingEnums.length}):`);
      missingEnums.forEach(enumName => console.log(`   ❌ ${enumName}`));
    }

    console.log('\n🏁 Audit Summary:');
    console.log(`   Tables: ${currentTables.length}/${expectedTables.length} ${missingTables.length === 0 ? '✅' : '❌'}`);
    console.log(`   Enums: ${currentEnums.length}/${expectedEnums.length} ${missingEnums.length === 0 ? '✅' : '❌'}`);

    if (missingTables.length === 0 && missingEnums.length === 0) {
      console.log('\n🎉 Database schema is complete!');
    } else {
      console.log('\n🔧 Database schema needs the missing items above');
    }

    client.release();
    await pool.end();

  } catch (error) {
    console.error('💥 Audit failed:', error.message);
    process.exit(1);
  }
}

quickAudit();
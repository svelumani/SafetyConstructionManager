#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Database Schema Audit Tool for MySafety
 * 
 * This script analyzes the current database schema and generates
 * a comprehensive audit report of all tables and columns
 */

async function auditDatabase() {
  try {
    console.log('🔍 MySafety Database Schema Audit');
    console.log('================================');
    console.log('');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const auditDir = `uploads/audit_${timestamp.split('T')[0]}_${timestamp.split('T')[1].split('.')[0]}`;
    
    // Create audit directory
    execSync(`mkdir -p ${auditDir}`);
    
    console.log(`📁 Audit directory: ${auditDir}`);
    console.log('');
    
    // Get all tables in the database
    console.log('📊 Analyzing database schema...');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = execSync(`psql "${process.env.DATABASE_URL}" -t -c "${tablesQuery}"`, { encoding: 'utf8' });
    const tables = tablesResult.split('\n').filter(line => line.trim()).map(line => line.trim());
    
    console.log(`✅ Found ${tables.length} tables`);
    console.log('');
    
    let auditReport = '';
    auditReport += 'MySafety Database Schema Audit Report\n';
    auditReport += '====================================\n';
    auditReport += `Date: ${new Date().toISOString()}\n`;
    auditReport += `Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Current Database'}\n`;
    auditReport += `Total Tables: ${tables.length}\n\n`;
    
    const expectedSchema = {
      tenants: [
        'id', 'name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'country',
        'logo', 'subscription_plan', 'subscription_status', 'subscription_end_date',
        'active_users', 'max_users', 'active_sites', 'max_sites', 'created_at', 'updated_at',
        'stripe_customer_id', 'settings', 'is_active'
      ],
      users: [
        'id', 'tenant_id', 'username', 'email', 'password', 'first_name', 'last_name',
        'phone', 'role', 'is_active', 'last_login', 'created_at', 'updated_at', 'avatar',
        'emergency_contact_name', 'emergency_contact_phone', 'job_title', 'department'
      ],
      sites: [
        'id', 'tenant_id', 'name', 'address', 'city', 'state', 'zip_code', 'country',
        'site_manager', 'phone', 'emergency_contact', 'emergency_phone', 'status',
        'created_at', 'updated_at', 'latitude', 'longitude', 'description'
      ],
      hazard_reports: [
        'id', 'tenant_id', 'site_id', 'reporter_id', 'title', 'description', 'severity',
        'status', 'location', 'reported_at', 'resolved_at', 'resolved_by_id', 'created_at', 'updated_at'
      ],
      incident_reports: [
        'id', 'tenant_id', 'site_id', 'reporter_id', 'incident_type', 'severity', 'description',
        'incident_date', 'location', 'people_involved', 'injuries', 'property_damage',
        'immediate_action_taken', 'investigation_findings', 'corrective_actions',
        'status', 'created_at', 'updated_at'
      ],
      inspections: [
        'id', 'tenant_id', 'site_id', 'template_id', 'inspector_id', 'inspection_date',
        'status', 'score', 'notes', 'created_at', 'updated_at'
      ],
      inspection_templates: [
        'id', 'tenant_id', 'name', 'description', 'category', 'created_by_id',
        'is_active', 'created_at', 'updated_at'
      ],
      permit_requests: [
        'id', 'tenant_id', 'site_id', 'requester_id', 'permit_type', 'work_description',
        'start_date', 'end_date', 'status', 'approver_id', 'approved_at', 'created_at', 'updated_at'
      ],
      training_courses: [
        'id', 'tenant_id', 'title', 'description', 'duration_hours', 'category',
        'created_by_id', 'is_active', 'created_at', 'updated_at'
      ],
      training_records: [
        'id', 'tenant_id', 'user_id', 'course_id', 'completion_date', 'score',
        'status', 'certificate_url', 'created_at', 'updated_at'
      ]
    };
    
    for (const tableName of tables) {
      console.log(`🔍 Auditing table: ${tableName}`);
      
      // Get column information for this table
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = execSync(`psql "${process.env.DATABASE_URL}" -t -c "${columnsQuery}"`, { encoding: 'utf8' });
      const columnLines = columnsResult.split('\n').filter(line => line.trim());
      
      const actualColumns = columnLines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          name: parts[0],
          type: parts[1],
          nullable: parts[2],
          default: parts[3],
          length: parts[4]
        };
      });
      
      // Get record count
      let recordCount = 0;
      try {
        const countResult = execSync(`psql "${process.env.DATABASE_URL}" -t -c "SELECT COUNT(*) FROM ${tableName};"`, { encoding: 'utf8' });
        recordCount = parseInt(countResult.trim()) || 0;
      } catch (e) {
        recordCount = 0;
      }
      
      auditReport += `Table: ${tableName}\n`;
      auditReport += `${'='.repeat(tableName.length + 7)}\n`;
      auditReport += `Records: ${recordCount}\n`;
      auditReport += `Columns: ${actualColumns.length}\n\n`;
      
      // List all actual columns
      auditReport += `Actual Columns:\n`;
      actualColumns.forEach(col => {
        auditReport += `  - ${col.name} (${col.type})${col.nullable === 'NO' ? ' NOT NULL' : ''}${col.default ? ` DEFAULT ${col.default}` : ''}\n`;
      });
      auditReport += '\n';
      
      // Check against expected schema if we have it
      if (expectedSchema[tableName]) {
        const expectedColumns = expectedSchema[tableName];
        const actualColumnNames = actualColumns.map(c => c.name);
        
        const missingColumns = expectedColumns.filter(col => !actualColumnNames.includes(col));
        const extraColumns = actualColumnNames.filter(col => !expectedColumns.includes(col));
        
        if (missingColumns.length > 0) {
          auditReport += `⚠️  Missing Expected Columns:\n`;
          missingColumns.forEach(col => {
            auditReport += `  - ${col}\n`;
          });
          auditReport += '\n';
        }
        
        if (extraColumns.length > 0) {
          auditReport += `ℹ️  Extra Columns (not in expected schema):\n`;
          extraColumns.forEach(col => {
            auditReport += `  - ${col}\n`;
          });
          auditReport += '\n';
        }
        
        if (missingColumns.length === 0 && extraColumns.length === 0) {
          auditReport += `✅ Schema matches expected structure\n\n`;
        }
      } else {
        auditReport += `ℹ️  No expected schema defined for this table\n\n`;
      }
      
      auditReport += '-'.repeat(50) + '\n\n';
    }
    
    // Save the audit report
    const reportFile = `${auditDir}/schema_audit_report.txt`;
    fs.writeFileSync(reportFile, auditReport);
    
    // Generate SQL schema dump
    console.log('📋 Generating schema dump...');
    const schemaFile = `${auditDir}/current_schema.sql`;
    execSync(`pg_dump "${process.env.DATABASE_URL}" --schema-only > ${schemaFile}`);
    
    // Generate table creation scripts
    console.log('📝 Creating individual table scripts...');
    for (const tableName of tables) {
      const tableFile = `${auditDir}/${tableName}_schema.sql`;
      execSync(`pg_dump "${process.env.DATABASE_URL}" --schema-only --table=${tableName} > ${tableFile}`);
    }
    
    console.log('');
    console.log('✅ Database audit completed!');
    console.log('');
    console.log('📄 Generated files:');
    console.log(`   - Schema audit report: ${reportFile}`);
    console.log(`   - Complete schema dump: ${schemaFile}`);
    console.log(`   - Individual table schemas: ${auditDir}/*_schema.sql`);
    console.log('');
    console.log('🎯 You can now compare these files with your EC2 database schema');
    console.log('   to identify missing columns and structural differences');
    
    // Display summary of potential issues
    console.log('');
    console.log('📊 Audit Summary:');
    console.log(`   Total tables analyzed: ${tables.length}`);
    
    // Read and display key findings from the report
    const criticalFindings = auditReport.match(/⚠️.*?Missing Expected Columns:[\s\S]*?(?=\n\n|\n-|$)/g);
    if (criticalFindings) {
      console.log(`   Tables with missing columns: ${criticalFindings.length}`);
      console.log('');
      console.log('🚨 Critical Findings:');
      criticalFindings.forEach(finding => {
        console.log(finding.replace(/⚠️.*?Missing Expected Columns:/, '⚠️  Table has missing columns'));
      });
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }
}

// Run the audit
auditDatabase();
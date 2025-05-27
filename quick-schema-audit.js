#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Quick Database Schema Audit for MySafety
 * Fast analysis of table structures and missing columns
 */

async function quickAudit() {
  try {
    console.log('🔍 Quick Database Schema Audit');
    console.log('==============================');
    console.log('');
    
    // Get complete schema information in one query
    const schemaQuery = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t.table_name AND t2.table_schema = 'public') as table_exists
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position;
    `;
    
    console.log('📊 Querying database schema...');
    const result = execSync(`psql "${process.env.DATABASE_URL}" -t -c "${schemaQuery}"`, { encoding: 'utf8' });
    
    const lines = result.split('\n').filter(line => line.trim());
    const tables = {};
    
    // Parse the results
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        const tableName = parts[0];
        const columnName = parts[1];
        const dataType = parts[2];
        const isNullable = parts[3];
        const columnDefault = parts[4];
        
        if (!tables[tableName]) {
          tables[tableName] = [];
        }
        
        if (columnName) {
          tables[tableName].push({
            name: columnName,
            type: dataType,
            nullable: isNullable === 'YES',
            default: columnDefault !== '' ? columnDefault : null
          });
        }
      }
    });
    
    // Generate audit report
    let report = 'MySafety Database Schema Audit Report\n';
    report += '====================================\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Tables: ${Object.keys(tables).length}\n\n`;
    
    // Expected schema for comparison
    const expectedColumns = {
      tenants: ['id', 'name', 'email', 'phone', 'address', 'subscription_plan', 'subscription_status', 'created_at', 'updated_at'],
      users: ['id', 'tenant_id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'is_active', 'created_at'],
      sites: ['id', 'tenant_id', 'name', 'address', 'status', 'created_at', 'updated_at'],
      hazard_reports: ['id', 'tenant_id', 'site_id', 'reporter_id', 'title', 'description', 'severity', 'status', 'created_at'],
      incident_reports: ['id', 'tenant_id', 'site_id', 'reporter_id', 'incident_type', 'severity', 'description', 'status', 'created_at'],
      inspections: ['id', 'tenant_id', 'site_id', 'inspector_id', 'status', 'created_at'],
      permit_requests: ['id', 'tenant_id', 'site_id', 'requester_id', 'permit_type', 'status', 'created_at']
    };
    
    let criticalIssues = [];
    
    Object.keys(tables).forEach(tableName => {
      const columns = tables[tableName];
      const columnNames = columns.map(c => c.name);
      
      report += `TABLE: ${tableName}\n`;
      report += `${'='.repeat(tableName.length + 7)}\n`;
      report += `Columns (${columns.length}): ${columnNames.join(', ')}\n`;
      
      // Check for missing expected columns
      if (expectedColumns[tableName]) {
        const missing = expectedColumns[tableName].filter(col => !columnNames.includes(col));
        if (missing.length > 0) {
          report += `⚠️  MISSING COLUMNS: ${missing.join(', ')}\n`;
          criticalIssues.push(`${tableName}: missing ${missing.join(', ')}`);
        } else {
          report += `✅ All expected columns present\n`;
        }
      }
      
      report += '\n';
    });
    
    // Summary of critical issues
    if (criticalIssues.length > 0) {
      report += '\n🚨 CRITICAL ISSUES SUMMARY\n';
      report += '========================\n';
      criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    } else {
      report += '\n✅ No critical column issues found\n';
    }
    
    // Save report
    const reportFile = 'uploads/schema_audit_report.txt';
    fs.writeFileSync(reportFile, report);
    
    // Generate simple schema dump
    console.log('📋 Generating schema dump...');
    execSync(`pg_dump "${process.env.DATABASE_URL}" --schema-only > uploads/current_schema_dump.sql`);
    
    console.log('✅ Audit completed!');
    console.log('');
    console.log(`📄 Schema report saved: ${reportFile}`);
    console.log('📄 Schema dump saved: uploads/current_schema_dump.sql');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Tables found: ${Object.keys(tables).length}`);
    console.log(`   Critical issues: ${criticalIssues.length}`);
    
    if (criticalIssues.length > 0) {
      console.log('');
      console.log('🚨 Issues found:');
      criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Display the report content
    console.log('');
    console.log('📋 Audit Report:');
    console.log('================');
    console.log(report);
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }
}

quickAudit();
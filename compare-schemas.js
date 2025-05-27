#!/usr/bin/env node

import fs from 'fs';

/**
 * Comprehensive Schema Comparison Tool
 * Compares EC2 database schema (from JSON) with Replit schema
 */

function compareSchemas() {
  console.log('🔍 Comprehensive Database Schema Comparison');
  console.log('==========================================');
  console.log('');
  
  // This will read the EC2 database JSON file when provided
  const ec2SchemaPath = 'uploads/ec2_schema.json';
  
  if (!fs.existsSync(ec2SchemaPath)) {
    console.log('📋 Waiting for EC2 database schema file...');
    console.log('');
    console.log('Please provide your EC2 database schema in JSON format');
    console.log('Expected file: uploads/ec2_schema.json');
    console.log('');
    console.log('JSON format should be:');
    console.log('{');
    console.log('  "table_name": {');
    console.log('    "columns": [');
    console.log('      {');
    console.log('        "name": "column_name",');
    console.log('        "type": "data_type",');
    console.log('        "nullable": true/false,');
    console.log('        "default": "default_value"');
    console.log('      }');
    console.log('    ]');
    console.log('  }');
    console.log('}');
    return;
  }
  
  try {
    // Read EC2 schema
    const ec2Schema = JSON.parse(fs.readFileSync(ec2SchemaPath, 'utf8'));
    
    // Complete Replit schema based on our audit
    const replitSchema = {
      tenants: [
        'id', 'name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 
        'country', 'logo', 'subscription_plan', 'subscription_status', 
        'subscription_end_date', 'active_users', 'max_users', 'active_sites', 
        'max_sites', 'created_at', 'updated_at', 'stripe_customer_id', 'settings', 'is_active'
      ],
      users: [
        'id', 'tenant_id', 'username', 'email', 'password', 'first_name', 'last_name', 
        'role', 'phone', 'job_title', 'department', 'profile_image_url', 'permissions', 
        'is_active', 'last_login', 'created_at', 'updated_at', 'emergency_contact', 
        'safety_certification_expiry'
      ],
      sites: [
        'id', 'tenant_id', 'name', 'address', 'city', 'state', 'zip_code', 'country',
        'gps_coordinates', 'contact_name', 'contact_phone', 'contact_email', 
        'start_date', 'end_date', 'status', 'description', 'created_at', 'updated_at', 'is_active'
      ],
      hazard_reports: [
        'id', 'tenant_id', 'site_id', 'reported_by_id', 'title', 'description', 
        'location', 'gps_coordinates', 'hazard_type', 'severity', 'status', 
        'recommended_action', 'photo_urls', 'video_ids', 'created_at', 'updated_at', 
        'resolved_at', 'is_active', 'weather_conditions'
      ],
      incident_reports: [
        'id', 'tenant_id', 'site_id', 'reported_by_id', 'title', 'description', 
        'incident_date', 'location', 'incident_type', 'severity', 'injury_occurred', 
        'injury_details', 'witnesses', 'root_cause', 'corrective_actions', 
        'preventative_measures', 'photo_urls', 'video_ids', 'document_urls', 
        'created_at', 'updated_at', 'is_active', 'status'
      ],
      inspections: [
        'id', 'tenant_id', 'site_id', 'inspector_id', 'inspection_type', 'title', 
        'description', 'scheduled_date', 'completed_date', 'status', 'result', 
        'findings', 'photo_urls', 'video_ids', 'document_urls', 'created_at', 
        'updated_at', 'is_active', 'template_id', 'due_date', 'started_at', 'assigned_to_id'
      ],
      inspection_templates: [
        'id', 'tenant_id', 'name', 'description', 'category', 'version', 
        'is_default', 'created_by_id', 'created_at', 'updated_at', 'is_active'
      ],
      permit_requests: [
        'id', 'tenant_id', 'site_id', 'requester_id', 'approver_id', 'permit_type', 
        'title', 'description', 'location', 'start_date', 'end_date', 'status', 
        'approval_date', 'denial_reason', 'attachment_urls', 'created_at', 'updated_at', 'is_active'
      ]
    };
    
    console.log('📊 Comparing schemas...');
    console.log('');
    
    let report = 'Comprehensive Schema Comparison Report\n';
    report += '=====================================\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    let totalMissingColumns = 0;
    let tablesWithIssues = [];
    
    // Compare each table
    Object.keys(replitSchema).forEach(tableName => {
      const replitColumns = replitSchema[tableName];
      const ec2Table = ec2Schema[tableName];
      
      report += `TABLE: ${tableName}\n`;
      report += `${'='.repeat(tableName.length + 7)}\n`;
      
      if (!ec2Table) {
        report += `❌ MISSING ENTIRE TABLE in EC2 database\n`;
        tablesWithIssues.push(tableName);
        totalMissingColumns += replitColumns.length;
        report += `   Missing columns: ${replitColumns.join(', ')}\n`;
      } else {
        const ec2Columns = ec2Table.columns ? ec2Table.columns.map(c => c.name) : [];
        const missingColumns = replitColumns.filter(col => !ec2Columns.includes(col));
        const extraColumns = ec2Columns.filter(col => !replitColumns.includes(col));
        
        if (missingColumns.length > 0) {
          report += `⚠️  MISSING COLUMNS (${missingColumns.length}): ${missingColumns.join(', ')}\n`;
          tablesWithIssues.push(tableName);
          totalMissingColumns += missingColumns.length;
        }
        
        if (extraColumns.length > 0) {
          report += `ℹ️  EXTRA COLUMNS (${extraColumns.length}): ${extraColumns.join(', ')}\n`;
        }
        
        if (missingColumns.length === 0 && extraColumns.length === 0) {
          report += `✅ Schema matches perfectly\n`;
        }
        
        report += `   Replit columns (${replitColumns.length}): ${replitColumns.join(', ')}\n`;
        report += `   EC2 columns (${ec2Columns.length}): ${ec2Columns.join(', ')}\n`;
      }
      
      report += '\n' + '-'.repeat(50) + '\n\n';
    });
    
    // Summary
    report += 'SUMMARY\n';
    report += '=======\n';
    report += `Total tables analyzed: ${Object.keys(replitSchema).length}\n`;
    report += `Tables with issues: ${tablesWithIssues.length}\n`;
    report += `Total missing columns: ${totalMissingColumns}\n\n`;
    
    if (tablesWithIssues.length > 0) {
      report += 'TABLES WITH ISSUES:\n';
      tablesWithIssues.forEach(table => {
        report += `- ${table}\n`;
      });
    } else {
      report += '✅ All tables match perfectly!\n';
    }
    
    // Save report
    const reportFile = 'uploads/schema_comparison_report.txt';
    fs.writeFileSync(reportFile, report);
    
    console.log(`📄 Comparison report saved: ${reportFile}`);
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Tables analyzed: ${Object.keys(replitSchema).length}`);
    console.log(`   Tables with issues: ${tablesWithIssues.length}`);
    console.log(`   Total missing columns: ${totalMissingColumns}`);
    
    if (tablesWithIssues.length > 0) {
      console.log('');
      console.log('🚨 Tables needing attention:');
      tablesWithIssues.forEach(table => console.log(`   - ${table}`));
    }
    
    console.log('');
    console.log(report);
    
  } catch (error) {
    console.error('❌ Error reading/parsing schema files:', error.message);
  }
}

compareSchemas();
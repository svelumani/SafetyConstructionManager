#!/usr/bin/env node

// Find exactly which 3 tables are missing from Docker deployment

const currentDockerTables = [
  'email_templates', 'hazard_assignments', 'hazard_comments', 'hazard_reports',
  'incident_reports', 'inspection_checklist_items', 'inspection_findings', 
  'inspection_items', 'inspection_responses', 'inspection_sections',
  'inspection_templates', 'inspections', 'permit_requests', 'report_history',
  'role_permissions', 'site_personnel', 'sites', 'subcontractors',
  'system_logs', 'teams', 'tenants', 'training_content', 'training_courses',
  'training_records', 'users'
];

const expectedTables = [
  'tenants', 'users', 'user_preferences', 'sites', 'subcontractors', 'teams', 
  'site_personnel', 'inspection_templates', 'inspection_sections', 'inspection_items',
  'inspection_checklist_items', 'inspections', 'inspection_responses', 'inspection_findings',
  'hazard_reports', 'hazard_assignments', 'hazard_comments', 'permit_requests',
  'incident_reports', 'training_content', 'training_courses', 'training_records',
  'system_logs', 'email_templates', 'role_permissions', 'report_history',
  'user_sessions', 'migration_history'
];

console.log('🔍 Docker Migration Missing Tables Audit');
console.log('========================================');

const missingTables = expectedTables.filter(table => !currentDockerTables.includes(table));

console.log(`📊 Current Docker Tables: ${currentDockerTables.length}`);
console.log(`🎯 Expected Tables: ${expectedTables.length}`);
console.log(`❌ Missing Tables: ${missingTables.length}`);

if (missingTables.length > 0) {
  console.log('\n❌ MISSING TABLES:');
  missingTables.forEach(table => console.log(`   ❌ ${table}`));
}

console.log('\n🚀 Steps to Fix Docker Deployment:');
console.log('1. Stop Docker containers');
console.log('2. Remove Docker volumes');
console.log('3. Rebuild with complete migration');
console.log('4. Verify all 28 tables are created');
#!/usr/bin/env node

// CSV Format Fixer for EC2 Import
// This script converts your current CSV to the correct EC2 format

import fs from 'fs';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'fixed_users.csv';

if (!inputFile) {
  console.log('❌ Usage: node fix-csv-import.js input.csv [output.csv]');
  console.log('   This will reformat your CSV for EC2 import');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.log(`❌ File not found: ${inputFile}`);
  process.exit(1);
}

console.log('🔧 Fixing CSV format for EC2 import...');

// EC2 column order (19 columns)
const ec2Columns = [
  'id', 'tenant_id', 'username', 'email', 'password', 
  'first_name', 'last_name', 'phone', 'role', 'is_active',
  'last_login', 'created_at', 'emergency_contact', 'safety_certification_expiry',
  'job_title', 'department', 'profile_image_url', 'permissions', 'updated_at'
];

try {
  const csvContent = fs.readFileSync(inputFile, 'utf8');
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    console.log('❌ CSV file is empty');
    process.exit(1);
  }
  
  // Parse header
  const currentHeader = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
  console.log(`📋 Current CSV has ${currentHeader.length} columns`);
  console.log(`🎯 EC2 needs ${ec2Columns.length} columns`);
  
  // Create mapping
  const columnMapping = ec2Columns.map(col => {
    const index = currentHeader.indexOf(col);
    return index >= 0 ? index : -1;
  });
  
  // Generate new CSV
  const newLines = [];
  
  // Add header
  newLines.push(ec2Columns.join(','));
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const currentRow = lines[i].split(',');
    const newRow = columnMapping.map(index => {
      if (index >= 0 && index < currentRow.length) {
        return currentRow[index] || '';
      }
      return ''; // Empty for missing columns
    });
    newLines.push(newRow.join(','));
  }
  
  // Write fixed CSV
  fs.writeFileSync(outputFile, newLines.join('\n'));
  
  console.log(`✅ Fixed CSV saved as: ${outputFile}`);
  console.log(`📊 Processed ${lines.length - 1} data rows`);
  console.log(`🚀 Ready for EC2 import!`);
  
} catch (error) {
  console.error('❌ Error processing CSV:', error.message);
  process.exit(1);
}
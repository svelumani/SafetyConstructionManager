#!/usr/bin/env node

// Migration Generator for MySafety
// Usage: node create-migration.js "add user preferences"

import fs from 'fs';
import path from 'path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.log('❌ Please provide a migration name:');
  console.log('   node create-migration.js "add user preferences"');
  console.log('   node create-migration.js "enhance hazard tracking"');
  process.exit(1);
}

// Get next migration number
const migrationsDir = './migrations/sql';
const existingMigrations = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .map(file => parseInt(file.split('_')[0]) || 0)
  .filter(num => !isNaN(num));

const nextNumber = Math.max(...existingMigrations, 0) + 1;
const paddedNumber = nextNumber.toString().padStart(3, '0');

// Create filename
const fileName = `${paddedNumber}_${migrationName.toLowerCase().replace(/\s+/g, '_')}.sql`;
const filePath = path.join(migrationsDir, fileName);

// Read template
const template = fs.readFileSync('./migrations/migration-template.sql', 'utf8');

// Replace placeholders
const content = template
  .replace('[DESCRIPTION OF CHANGES]', migrationName)
  .replace('[YOUR NAME]', 'Developer')
  .replace('[DATE]', new Date().toISOString().split('T')[0])
  .replace('[LIST OF TABLES/FEATURES AFFECTED]', 'TBD')
  .replace('[NAME]', migrationName);

// Write new migration file
fs.writeFileSync(filePath, content);

console.log(`✅ Created new migration: ${fileName}`);
console.log(`📝 Edit the file at: ${filePath}`);
console.log(`🚀 Run with: node run-migrations.js`);
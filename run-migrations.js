#!/usr/bin/env node

// Quick migration runner for MySafety
// Usage: node run-migrations.js

import { execSync } from 'child_process';

console.log('🚀 MySafety Database Migration Runner');
console.log('====================================');

try {
  console.log('📦 Running migrations...');
  execSync('tsx migrations/migrate.js', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
  });
  console.log('✅ Migration runner completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
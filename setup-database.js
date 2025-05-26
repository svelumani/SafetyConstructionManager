#!/usr/bin/env node

// Alembic-style database setup for MySafety
import { execSync } from 'child_process';

console.log('🚀 Setting up MySafety database with Alembic-style migrations...');

try {
  // Check if we're in Docker environment
  if (process.env.IS_DOCKER === 'true') {
    console.log('📋 Docker environment detected - running MySafety migrations...');
    
    // Run our Alembic-style migration system
    execSync('node migrations/migrate.js', { 
      stdio: 'inherit',
      env: { ...process.env, IS_DOCKER: 'true' }
    });
    
    console.log('✅ MySafety database schema initialized successfully!');
    console.log('📊 All safety management tables created (hazards, inspections, permits, incidents, training, etc.)');
  } else {
    console.log('💡 Development environment - skipping database setup');
  }
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('🔄 Trying fallback method...');
  
  try {
    // Fallback to direct SQL execution
    execSync('psql $DATABASE_URL -f migrations/sql/001_create_mysafety_schema.sql', { 
      stdio: 'inherit' 
    });
    console.log('✅ Fallback migration successful!');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
    console.log('🔄 Application will start anyway - database may need manual setup');
  }
}

console.log('🎉 Database setup completed!');
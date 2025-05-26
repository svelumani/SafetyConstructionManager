#!/usr/bin/env node

// Simple database setup script for Docker environment
import { execSync } from 'child_process';

console.log('🚀 Setting up MySafety database...');

try {
  // Check if we're in Docker environment
  if (process.env.IS_DOCKER === 'true') {
    console.log('📋 Docker environment detected - initializing database schema...');
    
    // Use the existing drizzle push command that works in your development environment
    execSync('npx drizzle-kit push --config=drizzle.config.ts', { 
      stdio: 'inherit',
      env: { ...process.env, IS_DOCKER: 'true' }
    });
    
    console.log('✅ Database schema initialized successfully!');
  } else {
    console.log('💡 Development environment - skipping database setup');
  }
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('🔄 Application will start anyway - database may need manual setup');
}

console.log('🎉 Database setup completed!');
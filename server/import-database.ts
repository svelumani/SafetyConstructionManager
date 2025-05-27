#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Database Import Script for MySafety Application
 * 
 * This script imports a PostgreSQL dump file into the current database.
 * Designed to work within the Docker container environment.
 */

async function importDatabase() {
  try {
    console.log('🚀 Starting MySafety database import...');
    
    // Check if we have a database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    console.log('✅ Database connection configured');
    
    // Look for SQL dump files in the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.error('❌ Uploads directory not found');
      process.exit(1);
    }
    
    // Find the most recent SQL dump file
    const sqlFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(uploadsDir, file),
        stats: fs.statSync(path.join(uploadsDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
    
    if (sqlFiles.length === 0) {
      console.error('❌ No SQL dump files found in uploads directory');
      console.log('📋 Please place your database dump file (.sql) in the uploads/ directory');
      process.exit(1);
    }
    
    const dumpFile = sqlFiles[0];
    console.log(`📁 Found SQL dump file: ${dumpFile.name}`);
    console.log(`📊 File size: ${(dumpFile.stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Modified: ${dumpFile.stats.mtime.toISOString()}`);
    
    // Confirm import
    console.log('');
    console.log('⚠️  WARNING: This will replace all existing data in the database!');
    console.log('');
    
    // In Docker environment, proceed automatically
    if (process.env.IS_DOCKER === 'true') {
      console.log('🐳 Docker environment detected - proceeding with import...');
    } else {
      console.log('💡 To proceed, set IS_DOCKER=true environment variable');
      process.exit(0);
    }
    
    console.log('🔄 Starting database import...');
    
    try {
      // Import the database dump
      console.log(`📥 Importing ${dumpFile.name}...`);
      
      execSync(`psql "${databaseUrl}" < "${dumpFile.path}"`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      console.log('✅ Database import completed successfully!');
      
      // Verify the import by checking if tables exist
      console.log('🔍 Verifying import...');
      
      const tablesCheck = execSync(`psql "${databaseUrl}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`, {
        encoding: 'utf8'
      }).trim();
      
      const tableCount = parseInt(tablesCheck);
      console.log(`✅ Found ${tableCount} tables in the database`);
      
      if (tableCount > 0) {
        console.log('🎉 Database import verification successful!');
        console.log('');
        console.log('🔑 Your MySafety application is now ready with imported data');
        console.log('   You can access the application and log in with your existing credentials');
      } else {
        console.log('⚠️  Warning: No tables found after import - please check the dump file');
      }
      
    } catch (importError: any) {
      console.error('❌ Database import failed:', importError.message);
      
      // Try to provide helpful error information
      if (importError.message.includes('permission denied')) {
        console.log('💡 Try running with proper database permissions');
      } else if (importError.message.includes('database') && importError.message.includes('does not exist')) {
        console.log('💡 Make sure the target database exists');
      }
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Import script error:', error.message);
    process.exit(1);
  }
}

// Run the import if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importDatabase();
}

export { importDatabase };
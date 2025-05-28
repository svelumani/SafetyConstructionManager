#!/usr/bin/env node

// Docker SQL Validation Tool for MySafety
// Tests if docker-db-setup.sql matches current Replit database structure

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

class DatabaseValidator {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5
    });
  }

  async validateDockerSQL() {
    console.log('🔍 MySafety Database Migration Tool');
    console.log('==================================');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      // Read the docker setup file
      const dockerSQL = fs.readFileSync('./docker-db-setup.sql', 'utf8');
      console.log('📁 Docker SQL file loaded successfully');

      // Get current database structure
      const currentStructure = await this.getCurrentDatabaseStructure();
      console.log(`📊 Current database has ${currentStructure.tables.length} tables`);

      // If database is empty or missing tables, run the migration
      if (currentStructure.tables.length < 28) {
        console.log('🚀 Running database migration...');
        await this.runMigration(dockerSQL);
        console.log('✅ Migration completed successfully!');
        
        // Verify migration
        const newStructure = await this.getCurrentDatabaseStructure();
        console.log(`📊 Database now has ${newStructure.tables.length} tables`);
        return { migrationRun: true, tables: newStructure.tables.length };
      }

      // Extract expected structure from docker SQL
      const expectedStructure = this.parseDockerSQL(dockerSQL);
      console.log(`🎯 Docker SQL defines ${expectedStructure.tables.length} tables`);

      // Compare structures
      const comparison = this.compareStructures(currentStructure, expectedStructure);
      this.reportComparison(comparison);

      return comparison;

    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      throw error;
    }
  }

  async runMigration(sqlContent) {
    const client = await this.pool.connect();
    try {
      console.log('🔄 Executing database migration...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('CREATE') || statement.includes('INSERT')) {
          try {
            await client.query(statement + ';');
          } catch (error) {
            // Ignore "already exists" errors
            if (!error.message.includes('already exists')) {
              console.warn(`⚠️  Warning executing: ${statement.substring(0, 50)}...`);
              console.warn(`   Error: ${error.message}`);
            }
          }
        }
      }

      console.log('✅ All migration statements executed');
      
    } finally {
      client.release();
    }
  }

  async getCurrentDatabaseStructure() {
    const client = await this.pool.connect();
    try {
      // Get all tables and their columns
      const result = await client.query(`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name 
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
      `);

      // Get enums
      const enumResult = await client.query(`
        SELECT 
          t.typname as enum_name,
          e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        ORDER BY t.typname, e.enumsortorder
      `);

      // Organize data
      const tables = {};
      const enums = {};

      result.rows.forEach(row => {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        if (row.column_name) {
          tables[row.table_name].push({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === 'YES',
            default: row.column_default
          });
        }
      });

      enumResult.rows.forEach(row => {
        if (!enums[row.enum_name]) {
          enums[row.enum_name] = [];
        }
        enums[row.enum_name].push(row.enum_value);
      });

      return {
        tables: Object.keys(tables).sort(),
        tableDetails: tables,
        enums: Object.keys(enums).sort(),
        enumDetails: enums
      };

    } finally {
      client.release();
    }
  }

  parseDockerSQL(sqlContent) {
    // Extract table names from CREATE TABLE statements
    const tableMatches = sqlContent.match(/CREATE TABLE (\w+)/g) || [];
    const tables = tableMatches.map(match => match.replace('CREATE TABLE ', '')).sort();

    // Extract enum names from CREATE TYPE statements
    const enumMatches = sqlContent.match(/CREATE TYPE (\w+)/g) || [];
    const enums = enumMatches.map(match => match.replace('CREATE TYPE ', '')).sort();

    return {
      tables,
      enums,
      tableCount: tables.length,
      enumCount: enums.length
    };
  }

  compareStructures(current, expected) {
    const comparison = {
      matches: true,
      issues: [],
      summary: {
        tablesMatch: false,
        enumsMatch: false,
        currentTableCount: current.tables.length,
        expectedTableCount: expected.tables.length,
        currentEnumCount: current.enums.length,
        expectedEnumCount: expected.enums.length
      }
    };

    // Compare table counts
    if (current.tables.length !== expected.tables.length) {
      comparison.matches = false;
      comparison.issues.push(`Table count mismatch: Current ${current.tables.length}, Expected ${expected.tables.length}`);
    } else {
      comparison.summary.tablesMatch = true;
    }

    // Compare enum counts
    if (current.enums.length !== expected.enums.length) {
      comparison.matches = false;
      comparison.issues.push(`Enum count mismatch: Current ${current.enums.length}, Expected ${expected.enums.length}`);
    } else {
      comparison.summary.enumsMatch = true;
    }

    // Check for missing tables
    const missingTables = expected.tables.filter(table => !current.tables.includes(table));
    const extraTables = current.tables.filter(table => !expected.tables.includes(table));

    if (missingTables.length > 0) {
      comparison.matches = false;
      comparison.issues.push(`Missing tables: ${missingTables.join(', ')}`);
    }

    if (extraTables.length > 0) {
      comparison.matches = false;
      comparison.issues.push(`Extra tables: ${extraTables.join(', ')}`);
    }

    // Check for missing enums
    const missingEnums = expected.enums.filter(enumName => !current.enums.includes(enumName));
    const extraEnums = current.enums.filter(enumName => !expected.enums.includes(enumName));

    if (missingEnums.length > 0) {
      comparison.matches = false;
      comparison.issues.push(`Missing enums: ${missingEnums.join(', ')}`);
    }

    if (extraEnums.length > 0) {
      comparison.matches = false;
      comparison.issues.push(`Extra enums: ${extraEnums.join(', ')}`);
    }

    return comparison;
  }

  reportComparison(comparison) {
    console.log('\n🧪 Validation Results:');
    console.log('======================');

    if (comparison.matches) {
      console.log('✅ PERFECT MATCH! Docker SQL matches current database structure');
      console.log(`✅ Tables: ${comparison.summary.currentTableCount}/${comparison.summary.expectedTableCount}`);
      console.log(`✅ Enums: ${comparison.summary.currentEnumCount}/${comparison.summary.expectedEnumCount}`);
    } else {
      console.log('⚠️  STRUCTURE DIFFERENCES FOUND:');
      comparison.issues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    }

    console.log('\n📊 Summary:');
    console.log(`   Tables: ${comparison.summary.tablesMatch ? '✅' : '❌'} ${comparison.summary.currentTableCount} current, ${comparison.summary.expectedTableCount} expected`);
    console.log(`   Enums: ${comparison.summary.enumsMatch ? '✅' : '❌'} ${comparison.summary.currentEnumCount} current, ${comparison.summary.expectedEnumCount} expected`);

    if (comparison.matches) {
      console.log('\n🎉 Your docker-db-setup.sql is ready for Docker deployment!');
      console.log('   You can safely run it on your local Docker PostgreSQL instance.');
    } else {
      console.log('\n🔧 The docker-db-setup.sql needs adjustments before Docker deployment.');
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('\n🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
}

// Main validation function
async function main() {
  const validator = new DatabaseValidator();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Validation interrupted by user');
    await validator.close();
    process.exit(0);
  });
  
  try {
    const startTime = Date.now();
    const result = await validator.validateDockerSQL();
    const totalTime = Date.now() - startTime;
    
    console.log(`\n⏱️  Validation completed in ${totalTime}ms`);
    
    if (result.matches) {
      console.log('🏁 Validation successful - Docker SQL is ready!');
      process.exit(0);
    } else {
      console.log('🏁 Validation completed with issues - review needed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message);
    process.exit(1);
  } finally {
    await validator.close();
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseValidator;
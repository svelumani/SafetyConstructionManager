#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

function getNextSchemaNumber(outputDir) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    return '001';
  }

  // Get all schema rebuild files
  const files = fs.readdirSync(outputDir)
    .filter(file => file.match(/^\d{3}_complete_schema_rebuild.*\.sql$/))
    .sort();

  if (files.length === 0) {
    return '001';
  }

  // Get the highest number and increment
  const lastNumber = Math.max(...files.map(file => parseInt(file.split('_')[0])));
  return String(lastNumber + 1).padStart(3, '0');
}

function mapDataType(dataType, udtName, isArray = false) {
  // Handle PostgreSQL array types - they have underscore prefix in udt_name
  if (udtName && udtName.startsWith('_')) {
    const baseType = udtName.substring(1); // Remove the underscore
    
    // Handle custom enum arrays
    if (dataType === 'ARRAY' || dataType === 'USER-DEFINED') {
      return `${baseType}[]`;
    }
    
    // Handle built-in type arrays
    return `${baseType}[]`;
  }

  // Handle array types detected by data_type = 'ARRAY'
  if (isArray || dataType === 'ARRAY') {
    if (udtName && udtName !== dataType.toLowerCase()) {
      return `${udtName}[]`;
    }
    return 'text[]'; // fallback
  }

  // Handle custom enum types
  if (dataType === 'USER-DEFINED' && udtName) {
    return udtName;
  }

  // Handle specific PostgreSQL types
  switch (dataType.toLowerCase()) {
    case 'character varying':
      return 'character varying';
    case 'timestamp without time zone':
      return 'timestamp without time zone';
    case 'timestamp with time zone':
      return 'timestamp with time zone';
    case 'double precision':
      return 'numeric';
    default:
      return dataType;
  }
}

async function getSchema() {
  console.log('Starting schema extraction...');
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  let schemaContent = '';
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('Successfully connected to database');

    // Get tables
    console.log('Fetching tables...');
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in database');
    } else {
      console.log('Found tables:', tablesResult.rows.map(r => r.tablename).join(', '));
    }

    schemaContent = '-- Database Schema Export - FIXED VERSION\n';
    schemaContent += `-- Generated at ${new Date().toISOString()}\n\n`;

    // Get and write ENUM types
    console.log('Fetching ENUM types...');
    const enumTypes = await client.query(`
      SELECT 
        t.typname as enum_name,
        string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    schemaContent += '-- Enum Types\n';
    for (const enumType of enumTypes.rows) {
      const values = enumType.enum_values.split(',');
      schemaContent += `DO $$ BEGIN
    CREATE TYPE ${enumType.enum_name} AS ENUM ('${values.join("', '")}');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;\n\n`;
    }

    // Get and write sequences
    console.log('Fetching sequences...');
    const sequencesResult = await client.query(`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name;
    `);

    if (sequencesResult.rows.length > 0) {
      schemaContent += '-- Create sequences first\n';
      for (const seq of sequencesResult.rows) {
        schemaContent += `CREATE SEQUENCE IF NOT EXISTS ${seq.sequence_name};\n`;
      }
      schemaContent += '\n';
    }

    // Get table dependencies to order them correctly
    const dependencyOrder = await getTableDependencyOrder(client, tablesResult.rows.map(r => r.tablename));

    // Get and write table schemas in dependency order
    for (const tableName of dependencyOrder) {
      console.log(`Processing table: ${tableName}`);
      
      // Get column information with better type handling
      const columnsResult = await client.query(`
        SELECT 
          c.column_name,
          c.data_type,
          c.udt_name,
          c.character_maximum_length,
          c.column_default,
          c.is_nullable,
          CASE WHEN c.data_type = 'ARRAY' THEN true ELSE false END as is_array
        FROM information_schema.columns c
        WHERE c.table_name = $1 AND c.table_schema = 'public'
        ORDER BY c.ordinal_position;
      `, [tableName]);

      // Get primary key
      const pkResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `, [tableName]);

      // Get foreign keys
      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
      `, [tableName]);

      // Generate CREATE TABLE statement
      schemaContent += `-- Table: ${tableName}`;
      if (tableName === 'tenants') {
        schemaContent += ' (create first as it\'s referenced by many tables)';
      } else if (tableName === 'users') {
        schemaContent += ' (create early as it\'s referenced by many tables)';
      }
      schemaContent += '\n';
      schemaContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columnDefs = columnsResult.rows.map(col => {
        let dataType = mapDataType(col.data_type, col.udt_name, col.is_array);
        
        let def = `  ${col.column_name} ${dataType}`;
        
        if (col.character_maximum_length && !col.is_array && !dataType.includes('[]')) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        return def;
      });

      // Add primary key constraint
      if (pkResult.rows.length > 0) {
        columnDefs.push(`  PRIMARY KEY (${pkResult.rows.map(row => row.attname).join(', ')})`);
      }

      // Add foreign key constraints
      for (const fk of fkResult.rows) {
        columnDefs.push(`  FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      }

      schemaContent += columnDefs.join(',\n');
      schemaContent += '\n);\n\n';
    }

    // Get and write indexes
    console.log('Fetching indexes...');
    const indexResult = await client.query(`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE constraint_type IN ('PRIMARY KEY', 'UNIQUE')
      )
      ORDER BY indexdef;
    `);

    if (indexResult.rows.length > 0) {
      schemaContent += '-- Indexes\n';
      for (const idx of indexResult.rows) {
        // Add IF NOT EXISTS to index creation
        const indexDef = idx.indexdef.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ');
        schemaContent += indexDef + ';\n';
      }
    }

    // Write to file with next available number
    const outputDir = './migrations/sql';
    const nextNumber = getNextSchemaNumber(outputDir);
    const outputFile = path.join(outputDir, `${nextNumber}_complete_schema_rebuild.sql`);
    console.log(`Writing schema to ${outputFile}`);
    
    fs.writeFileSync(outputFile, schemaContent, 'utf8');
    console.log('Schema file has been written successfully');
    
    // Print file size to verify
    const stats = fs.statSync(outputFile);
    console.log(`File size: ${stats.size} bytes`);

    client.release();
  } catch (error) {
    console.error('Error occurred:', error);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Helper function to determine table creation order based on foreign key dependencies
async function getTableDependencyOrder(client, tableNames) {
  // Get all foreign key relationships
  const fkResult = await client.query(`
    SELECT
      tc.table_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
  `);

  // Build dependency graph
  const dependencies = {};
  const dependents = {};
  
  for (const table of tableNames) {
    dependencies[table] = new Set();
    dependents[table] = new Set();
  }

  for (const fk of fkResult.rows) {
    if (fk.table_name !== fk.foreign_table_name) { // Avoid self-references
      dependencies[fk.table_name].add(fk.foreign_table_name);
      dependents[fk.foreign_table_name].add(fk.table_name);
    }
  }

  // Topological sort
  const ordered = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(table) {
    if (visiting.has(table)) {
      // Circular dependency - just add it anyway
      return;
    }
    if (visited.has(table)) {
      return;
    }

    visiting.add(table);
    for (const dep of dependencies[table]) {
      if (tableNames.includes(dep)) {
        visit(dep);
      }
    }
    visiting.delete(table);
    visited.add(table);
    ordered.push(table);
  }

  // Prioritize certain tables
  const priorityTables = ['user_sessions', 'tenants', 'users', 'sites', 'teams'];
  
  for (const table of priorityTables) {
    if (tableNames.includes(table)) {
      visit(table);
    }
  }

  for (const table of tableNames) {
    visit(table);
  }

  return ordered;
}

// Run the function
getSchema().catch(error => {
  console.error('Failed to get schema:', error);
  process.exit(1);
}); 
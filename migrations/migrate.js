#!/usr/bin/env node

// Enhanced Migration System for MySafety - Docker Compatible
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class MigrationManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Enhanced connection settings for Docker
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10
    });
  }

  async getExistingTables() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name, column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, column_name;
      `);
      
      // Group by table
      const tables = {};
      result.rows.forEach(row => {
        if (!tables[row.table_name]) {
          tables[row.table_name] = {};
        }
        tables[row.table_name][row.column_name] = {
          data_type: row.data_type,
          length: row.character_maximum_length
        };
      });
      
      return tables;
    } finally {
      client.release();
    }
  }

  async initMigrationTable() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migration_history (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT NOW(),
          checksum VARCHAR(64),
          execution_time_ms INTEGER,
          status VARCHAR(20) DEFAULT 'completed',
          UNIQUE(migration_name)
        )
      `);
      console.log('✅ Migration tracking table ready');
    } catch (error) {
      console.error('❌ Failed to create migration table:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  async getAppliedMigrations() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT migration_name, checksum FROM migration_history WHERE status = $1 ORDER BY applied_at',
        ['completed']
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error.message);
      return [];
    } finally {
      client.release();
    }
  }

  async validateMigration(migrationName, sqlContent, appliedMigrations) {
    const currentChecksum = this.calculateChecksum(sqlContent);
    const appliedMigration = appliedMigrations.find(m => m.migration_name === migrationName);
    
    if (appliedMigration) {
      if (appliedMigration.checksum !== currentChecksum) {
        console.warn(`⚠️  Warning: Migration ${migrationName} has been modified since last application`);
        console.warn(`   Previous checksum: ${appliedMigration.checksum}`);
        console.warn(`   Current checksum:  ${currentChecksum}`);
        // Continue anyway for development environments
      }
      return false; // Already applied
    }
    return true; // Needs to be applied
  }

  async getLatestMigrationFile() {
    const migrationsDir = './migrations/sql';
    if (!fs.existsSync(migrationsDir)) {
      return null;
    }

    // Check for the fixed version first
    const fixedFile = path.join(migrationsDir, '002_complete_schema_rebuild.sql');
    if (fs.existsSync(fixedFile)) {
      return fixedFile;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.match(/^\d{3}_complete_schema_rebuild\.sql$/))
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order

    return files.length > 0 ? path.join(migrationsDir, files[0]) : null;
  }

  splitSqlStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    // Split the SQL into lines and process
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Check for dollar quotes
      if (!inDollarQuote && trimmedLine.includes('$$')) {
        inDollarQuote = true;
        currentStatement += line + '\n';
        continue;
      }
      
      if (inDollarQuote) {
        currentStatement += line + '\n';
        if (trimmedLine.includes('$$')) {
          inDollarQuote = false;
          if (trimmedLine.endsWith(';')) {
            statements.push(currentStatement.trim());
            currentStatement = '';
          }
        }
        continue;
      }
      
      currentStatement += line + '\n';
      
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    return statements.filter(stmt => stmt.length > 0);
  }

  async getExistingConstraints() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          tc.table_name, 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          LEFT JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name;
      `);
      
      // Group by table
      const constraints = {};
      result.rows.forEach(row => {
        if (!constraints[row.table_name]) {
          constraints[row.table_name] = {
            primaryKey: null,
            foreignKeys: new Set(),
            uniqueConstraints: new Set()
          };
        }
        
        if (row.constraint_type === 'PRIMARY KEY') {
          constraints[row.table_name].primaryKey = row.column_name;
        } else if (row.constraint_type === 'FOREIGN KEY') {
          constraints[row.table_name].foreignKeys.add(
            `${row.column_name} REFERENCES ${row.foreign_table_name}(${row.foreign_column_name})`
          );
        } else if (row.constraint_type === 'UNIQUE') {
          constraints[row.table_name].uniqueConstraints.add(row.column_name);
        }
      });
      
      return constraints;
    } finally {
      client.release();
    }
  }

  async getExistingIndexes() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
      `);
      
      // Group by table
      const indexes = {};
      result.rows.forEach(row => {
        if (!indexes[row.tablename]) {
          indexes[row.tablename] = new Set();
        }
        indexes[row.tablename].add(row.indexdef);
      });
      
      return indexes;
    } finally {
      client.release();
    }
  }

  async applyMigration(sqlContent, existingTables) {
    const client = await this.pool.connect();
    let hasErrors = false;
    
    try {
      // Get existing constraints and indexes
      const existingConstraints = await this.getExistingConstraints();
      const existingIndexes = await this.getExistingIndexes();

      // Split SQL content into individual statements
      const statements = this.splitSqlStatements(sqlContent);

      for (const statement of statements) {
        try {
          await client.query('BEGIN');

          // Check if it's a CREATE INDEX statement
          if (statement.toUpperCase().startsWith('CREATE INDEX')) {
            const tableMatch = statement.match(/ON\s+(?:public\.)?(\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              const tableIndexes = existingIndexes[tableName] || new Set();
              
              // Check if index already exists
              if ([...tableIndexes].some(idx => idx.replace(/public\./g, '').trim() === statement.trim())) {
                console.log(`⏭️  Skipping index (already exists): ${statement.split('\n')[0]}`);
                await client.query('COMMIT');
                continue;
              }
            }
          }

          // Check if it's a CREATE TABLE statement
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/i)?.[1];
            if (tableName && existingTables[tableName]) {
              console.log(`⏭️  Table ${tableName} already exists, checking columns...`);
              
              // Extract columns from CREATE TABLE statement
              const columnMatches = statement.match(/\(([\s\S]*)\)/);
              if (columnMatches) {
                const parts = columnMatches[1]
                  .split(',')
                  .map(part => part.trim())
                  .filter(part => part.length > 0);

                // Process regular columns first
                for (const part of parts) {
                  if (!part.startsWith('CONSTRAINT') && !part.startsWith('PRIMARY KEY') && !part.startsWith('FOREIGN KEY')) {
                    const colMatch = part.match(/^(\w+)\s+([^,]+)/);
                    if (colMatch) {
                      const [, colName, colDef] = colMatch;
                      if (!existingTables[tableName][colName]) {
                        try {
                          // Replace USER-DEFINED with actual enum type
                          let processedColDef = colDef;
                          if (colDef.includes('USER-DEFINED')) {
                            // Extract the enum type from the DEFAULT clause if it exists
                            const enumTypeMatch = colDef.match(/::([\w_]+)/);
                            if (enumTypeMatch) {
                              processedColDef = colDef.replace('USER-DEFINED', enumTypeMatch[1]);
                            } else {
                              // If no DEFAULT clause, try to infer from column name
                              if (colName === 'role' && tableName === 'site_personnel') {
                                processedColDef = colDef.replace('USER-DEFINED', 'site_role');
                              } else if (colName === 'role') {
                                processedColDef = colDef.replace('USER-DEFINED', 'user_role');
                              } else if (colName === 'status') {
                                if (tableName.includes('permit')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'permit_status');
                                } else if (tableName.includes('incident')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'incident_status');
                                } else if (tableName.includes('hazard')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'hazard_status');
                                } else if (tableName.includes('inspection')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'inspection_status');
                                }
                              } else if (colName === 'severity') {
                                if (tableName.includes('incident')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'incident_severity');
                                } else if (tableName.includes('hazard')) {
                                  processedColDef = colDef.replace('USER-DEFINED', 'hazard_severity');
                                }
                              } else if (colName === 'subscription_plan') {
                                processedColDef = colDef.replace('USER-DEFINED', 'subscription_plan');
                              }
                            }
                          }

                          const alterStmt = `ALTER TABLE ${tableName} ADD COLUMN ${colName} ${processedColDef}`;
                          console.log(`➕ Adding column to ${tableName}: ${colName} ${processedColDef}`);
                          await client.query(alterStmt);
                        } catch (error) {
                          if (!error.message.includes('already exists')) {
                            console.warn(`⚠️  Failed to add column ${colName} to ${tableName}: ${error.message}`);
                            hasErrors = true;
                          }
                        }
                      }
                    }
                  }
                }

                // Process constraints separately
                for (const part of parts) {
                  if (part.startsWith('CONSTRAINT') || part.startsWith('PRIMARY KEY') || part.startsWith('FOREIGN KEY')) {
                    try {
                      // Check if constraint already exists
                      const tableConstraints = existingConstraints[tableName] || {
                        primaryKey: null,
                        foreignKeys: new Set(),
                        uniqueConstraints: new Set()
                      };

                      let shouldAdd = true;
                      
                      if (part.includes('PRIMARY KEY')) {
                        const pkMatch = part.match(/PRIMARY KEY\s*\(([^)]+)\)/);
                        if (pkMatch && tableConstraints.primaryKey === pkMatch[1].trim()) {
                          shouldAdd = false;
                        }
                      } else if (part.includes('FOREIGN KEY')) {
                        const fkMatch = part.match(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([^(]+)\(([^)]+)\)/);
                        if (fkMatch) {
                          const fkDef = `${fkMatch[1].trim()} REFERENCES ${fkMatch[2].trim()}(${fkMatch[3].trim()})`;
                          if (tableConstraints.foreignKeys.has(fkDef)) {
                            shouldAdd = false;
                          }
                        }
                      }

                      if (shouldAdd) {
                        const alterStmt = `ALTER TABLE ${tableName} ADD ${part}`;
                        console.log(`➕ Adding constraint to ${tableName}: ${part.split('\n')[0]}`);
                        await client.query(alterStmt);
                      } else {
                        console.log(`⏭️  Skipping constraint (already exists): ${part.split('\n')[0]}`);
                      }
                    } catch (error) {
                      if (!error.message.includes('already exists')) {
                        console.warn(`⚠️  Failed to add constraint to ${tableName}: ${error.message}`);
                        hasErrors = true;
                      }
                    }
                  }
                }
              }
              await client.query('COMMIT');
              continue; // Skip CREATE TABLE statement
            }
          }

          // Execute other statements (CREATE TYPE, etc.)
          try {
            console.log(`🔄 Executing: ${statement.split('\n')[0]}...`);
            await client.query(statement);
            console.log('✅ Statement executed successfully');
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`⏭️  Skipping: ${statement.split('\n')[0]}... (already exists)`);
            } else {
              console.warn(`⚠️  Failed to execute statement: ${error.message}`);
              hasErrors = true;
            }
          }

          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          console.warn(`⚠️  Transaction rolled back: ${error.message}`);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        console.log('⚠️  Migration completed with some errors');
      } else {
        console.log('✅ Migration completed successfully');
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🚀 Starting Enhanced Migration System...');
    
    try {
      await this.initMigrationTable();
      
      // Get latest schema file
      const latestSchemaFile = await this.getLatestMigrationFile();
      if (!latestSchemaFile) {
        console.log('❌ No schema files found in migrations/sql');
        return;
      }
      
      console.log(`📄 Using schema file: ${latestSchemaFile}`);
      
      // Get existing database structure
      console.log('🔍 Analyzing existing database structure...');
      const existingTables = await this.getExistingTables();
      
      // Read and apply the schema
      const sqlContent = fs.readFileSync(latestSchemaFile, 'utf8');
      await this.applyMigration(sqlContent, existingTables);
      
    } catch (error) {
      console.error('💥 Migration system failed:', error.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
}

// Enhanced migration runner with better error handling
async function main() {
  const migrationManager = new MigrationManager();
  
  // Handle process termination gracefully
  process.on('SIGINT', async () => {
    console.log('\n🛑 Migration interrupted by user');
    await migrationManager.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Migration terminated');
    await migrationManager.close();
    process.exit(0);
  });
  
  try {
    const startTime = Date.now();
    await migrationManager.runMigrations();
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  Total migration time: ${totalTime}ms`);
    console.log('🏁 Migration system completed successfully!');
  } catch (error) {
    console.error('💥 Migration system failed:', error.message);
    
    // Provide helpful debugging information
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Database connection refused. Check:');
      console.error('   - DATABASE_URL is correct');
      console.error('   - Database server is running');
      console.error('   - Network connectivity');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Database host not found. Check DATABASE_URL hostname');
    } else if (error.message.includes('password authentication failed')) {
      console.error('🔍 Authentication failed. Check DATABASE_URL credentials');
    }
    
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrationManager;
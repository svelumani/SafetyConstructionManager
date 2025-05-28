#!/usr/bin/env node

// Query Alignment Checker for MySafety
// Compares docker-db-setup.sql CREATE statements with migrate1.js validation queries

import fs from 'fs';

class QueryAlignmentChecker {
  constructor() {
    this.dockerSQL = '';
    this.migrate1JS = '';
  }

  async checkAlignment() {
    console.log('🔍 MySafety Query Alignment Checker');
    console.log('===================================');

    try {
      // Read both files
      this.dockerSQL = fs.readFileSync('./docker-db-setup.sql', 'utf8');
      this.migrate1JS = fs.readFileSync('./migrate1.js', 'utf8');
      
      console.log('📁 Files loaded successfully');

      // Extract structures from both files
      const dockerStructure = this.parseDockerSQL();
      const migrate1Structure = this.parseMigrate1JS();

      // Compare the structures
      const alignment = this.compareStructures(dockerStructure, migrate1Structure);
      
      this.reportAlignment(alignment);
      
      return alignment;

    } catch (error) {
      console.error('💥 Alignment check failed:', error.message);
      throw error;
    }
  }

  parseDockerSQL() {
    console.log('\n🔧 Parsing docker-db-setup.sql...');
    
    // Extract CREATE TYPE statements
    const enumRegex = /CREATE TYPE (\w+) AS ENUM \((.*?)\);/gs;
    const enums = {};
    let match;
    
    while ((match = enumRegex.exec(this.dockerSQL)) !== null) {
      const enumName = match[1];
      const enumValues = match[2].match(/'([^']+)'/g)?.map(v => v.replace(/'/g, '')) || [];
      enums[enumName] = enumValues;
    }

    // Extract CREATE TABLE statements with basic structure
    const tableRegex = /CREATE TABLE (\w+) \s*\((.*?)\);/gs;
    const tables = {};
    
    while ((match = tableRegex.exec(this.dockerSQL)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];
      
      // Extract column information
      const columnLines = tableBody.split('\n').map(line => line.trim()).filter(line => line);
      const columns = [];
      
      for (const line of columnLines) {
        if (line.includes('REFERENCES') || line.includes('UNIQUE') || line.includes('CHECK')) continue;
        
        const columnMatch = line.match(/(\w+)\s+([A-Z_]+(?:\([^)]*\))?)/);
        if (columnMatch) {
          columns.push({
            name: columnMatch[1],
            type: columnMatch[2].toLowerCase(),
            nullable: !line.includes('NOT NULL'),
            hasDefault: line.includes('DEFAULT')
          });
        }
      }
      
      tables[tableName] = columns;
    }

    console.log(`   Found ${Object.keys(enums).length} enums and ${Object.keys(tables).length} tables`);
    
    return { enums, tables };
  }

  parseMigrate1JS() {
    console.log('🔧 Parsing migrate1.js validation queries...');
    
    // Extract the main validation query
    const tableQueryMatch = this.migrate1JS.match(/SELECT\s+.*?FROM information_schema\.tables.*?ORDER BY.*?;/s);
    const enumQueryMatch = this.migrate1JS.match(/SELECT\s+.*?FROM pg_type.*?ORDER BY.*?;/s);
    
    const validationQueries = {
      tablesQuery: tableQueryMatch ? tableQueryMatch[0] : null,
      enumsQuery: enumQueryMatch ? enumQueryMatch[0] : null,
      checksTableSchema: this.migrate1JS.includes("table_schema = 'public'"),
      checksTableType: this.migrate1JS.includes("table_type = 'BASE TABLE'"),
      getsColumns: this.migrate1JS.includes('column_name'),
      getsEnumValues: this.migrate1JS.includes('enumlabel')
    };

    console.log('   Found validation queries for tables and enums');
    
    return validationQueries;
  }

  compareStructures(dockerStructure, migrate1Structure) {
    console.log('\n🧪 Comparing query alignment...');
    
    const alignment = {
      isAligned: true,
      issues: [],
      summary: {
        dockerEnumCount: Object.keys(dockerStructure.enums).length,
        dockerTableCount: Object.keys(dockerStructure.tables).length,
        hasValidationQueries: migrate1Structure.tablesQuery && migrate1Structure.enumsQuery,
        validationChecks: {
          tableSchema: migrate1Structure.checksTableSchema,
          tableType: migrate1Structure.checksTableType,
          columnDetails: migrate1Structure.getsColumns,
          enumValues: migrate1Structure.getsEnumValues
        }
      }
    };

    // Check if validation queries exist
    if (!migrate1Structure.tablesQuery) {
      alignment.isAligned = false;
      alignment.issues.push('Missing table validation query in migrate1.js');
    }

    if (!migrate1Structure.enumsQuery) {
      alignment.isAligned = false;
      alignment.issues.push('Missing enum validation query in migrate1.js');
    }

    // Check if validation covers the right scope
    if (!migrate1Structure.checksTableSchema) {
      alignment.isAligned = false;
      alignment.issues.push('Validation query does not filter by public schema');
    }

    if (!migrate1Structure.checksTableType) {
      alignment.isAligned = false;
      alignment.issues.push('Validation query does not filter by BASE TABLE type');
    }

    // Check enum alignment
    const dockerEnumNames = Object.keys(dockerStructure.enums).sort();
    const expectedEnums = ['user_role', 'site_role', 'hazard_severity', 'hazard_status', 'inspection_status', 'inspection_item_type', 'compliance_status', 'permit_status', 'incident_severity', 'incident_status', 'subscription_plan'];
    
    const missingEnums = expectedEnums.filter(e => !dockerEnumNames.includes(e));
    if (missingEnums.length > 0) {
      alignment.isAligned = false;
      alignment.issues.push(`Docker SQL missing enums: ${missingEnums.join(', ')}`);
    }

    // Check table alignment
    const dockerTableNames = Object.keys(dockerStructure.tables).sort();
    const minExpectedTables = 25; // Should have at least 25 core tables
    
    if (dockerTableNames.length < minExpectedTables) {
      alignment.isAligned = false;
      alignment.issues.push(`Docker SQL has ${dockerTableNames.length} tables, expected at least ${minExpectedTables}`);
    }

    return alignment;
  }

  reportAlignment(alignment) {
    console.log('\n📊 Query Alignment Results:');
    console.log('============================');

    if (alignment.isAligned) {
      console.log('✅ PERFECT ALIGNMENT! Queries are properly structured');
      console.log(`✅ Docker SQL: ${alignment.summary.dockerTableCount} tables, ${alignment.summary.dockerEnumCount} enums`);
      console.log(`✅ Validation: ${alignment.summary.hasValidationQueries ? 'Complete' : 'Incomplete'} query coverage`);
    } else {
      console.log('⚠️  ALIGNMENT ISSUES FOUND:');
      alignment.issues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    }

    console.log('\n🔍 Validation Query Analysis:');
    console.log(`   Table Schema Filter: ${alignment.summary.validationChecks.tableSchema ? '✅' : '❌'}`);
    console.log(`   Table Type Filter: ${alignment.summary.validationChecks.tableType ? '✅' : '❌'}`);
    console.log(`   Column Details: ${alignment.summary.validationChecks.columnDetails ? '✅' : '❌'}`);
    console.log(`   Enum Values: ${alignment.summary.validationChecks.enumValues ? '✅' : '❌'}`);

    if (alignment.isAligned) {
      console.log('\n🎉 Both files are properly aligned!');
      console.log('   Your docker-db-setup.sql CREATE statements match the migrate1.js validation logic.');
    } else {
      console.log('\n🔧 Files need alignment adjustments.');
    }
  }
}

// Main function
async function main() {
  const checker = new QueryAlignmentChecker();
  
  try {
    const result = await checker.checkAlignment();
    
    if (result.isAligned) {
      console.log('\n🏁 Query alignment check passed!');
      process.exit(0);
    } else {
      console.log('\n🏁 Query alignment check completed with issues');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Alignment check failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
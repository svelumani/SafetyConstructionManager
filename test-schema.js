// Quick script to test what tables Drizzle can see from the schema
import * as schema from './shared/schema.js';

console.log('=== Checking Schema Tables ===');
console.log('Tables found in schema:');

const tables = Object.keys(schema).filter(key => 
  schema[key] && 
  typeof schema[key] === 'object' && 
  schema[key]._ && 
  schema[key]._.name
);

console.log(`Total tables found: ${tables.length}`);
tables.forEach(tableName => {
  console.log(`- ${tableName}: ${schema[tableName]._.name}`);
});

console.log('\n=== Critical Safety Tables Check ===');
const expectedTables = ['tenants', 'users', 'sites', 'hazards', 'inspections', 'permits', 'incidents'];
expectedTables.forEach(table => {
  if (schema[table]) {
    console.log(`✅ ${table}: Found`);
  } else {
    console.log(`❌ ${table}: Missing`);
  }
});
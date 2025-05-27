#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * CSV Format Converter for MySafety User Import
 * 
 * Converts database export CSV to bulk upload format
 */

function convertCSVFormat() {
  console.log('🔄 Converting CSV format for MySafety bulk upload...');
  
  // Look for CSV files in uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.error('❌ Uploads directory not found');
    return;
  }
  
  const csvFiles = fs.readdirSync(uploadsDir)
    .filter(file => file.endsWith('.csv'))
    .map(file => ({
      name: file,
      path: path.join(uploadsDir, file),
      stats: fs.statSync(path.join(uploadsDir, file))
    }))
    .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
  
  if (csvFiles.length === 0) {
    console.error('❌ No CSV files found in uploads directory');
    return;
  }
  
  const inputFile = csvFiles[0];
  console.log(`📁 Found CSV file: ${inputFile.name}`);
  
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(inputFile.path, 'utf8');
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) {
      console.error('❌ CSV file appears to be empty or has no data rows');
      return;
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Original headers:', headers);
    
    // Map database columns to bulk upload format
    const columnMapping = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'email': 'email',
      'role': 'role',
      'phone': 'phone',
      'job_title': 'jobTitle',
      'department': 'department'
    };
    
    // Find column indexes
    const columnIndexes = {};
    Object.keys(columnMapping).forEach(dbCol => {
      const index = headers.findIndex(h => h.toLowerCase() === dbCol.toLowerCase());
      if (index !== -1) {
        columnIndexes[columnMapping[dbCol]] = index;
      }
    });
    
    console.log('🔍 Found column mappings:', columnIndexes);
    
    // Create new CSV content
    const newHeaders = ['firstName', 'lastName', 'email', 'role', 'phone', 'jobTitle', 'department'];
    let newCsvContent = newHeaders.join(',') + '\n';
    
    let convertedRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      const newRow = newHeaders.map(header => {
        const index = columnIndexes[header];
        if (index !== undefined && values[index]) {
          return values[index];
        }
        
        // Provide defaults for missing fields
        switch (header) {
          case 'firstName':
            return values[columnIndexes['firstName']] || 'Unknown';
          case 'lastName':
            return values[columnIndexes['lastName']] || 'User';
          case 'email':
            return values[columnIndexes['email']] || `user${i}@example.com`;
          case 'role':
            return values[columnIndexes['role']] || 'employee';
          case 'phone':
            return values[columnIndexes['phone']] || '';
          case 'jobTitle':
            return values[columnIndexes['jobTitle']] || 'Worker';
          case 'department':
            return values[columnIndexes['department']] || 'General';
          default:
            return '';
        }
      });
      
      newCsvContent += newRow.join(',') + '\n';
      convertedRows++;
    }
    
    // Save converted file
    const outputFileName = `converted_users_${Date.now()}.csv`;
    const outputPath = path.join(uploadsDir, outputFileName);
    
    fs.writeFileSync(outputPath, newCsvContent);
    
    console.log('✅ CSV conversion completed!');
    console.log(`📊 Converted ${convertedRows} user records`);
    console.log(`💾 Output file: ${outputFileName}`);
    console.log('');
    console.log('🎯 You can now use this converted CSV file for bulk user import');
    console.log('   The file format is compatible with the MySafety bulk upload feature');
    
  } catch (error) {
    console.error('❌ Error converting CSV:', error.message);
  }
}

// Run the converter
convertCSVFormat();
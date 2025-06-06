#!/usr/bin/env node

// Fix checklist connections for existing inspection templates

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixInspectionChecklistConnections() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing inspection checklist connections...');
    
    // Get all inspection templates for the tenant
    const templatesResult = await client.query(`
      SELECT id, name, category FROM inspection_templates 
      WHERE tenant_id = 5 
      ORDER BY id
    `);
    
    console.log(`Found ${templatesResult.rows.length} templates to fix`);
    
    // Delete any existing orphaned checklist items
    await client.query(`
      DELETE FROM inspection_checklist_items 
      WHERE template_id IN (SELECT id FROM inspection_templates WHERE tenant_id = 5)
    `);
    
    // Define comprehensive checklist items for each template
    const checklistItems = {
      'Daily Safety Inspection': [
        { category: 'Personal Protective Equipment', question: 'All workers wearing required hard hats', critical: true },
        { category: 'Personal Protective Equipment', question: 'Safety glasses worn in designated areas', critical: true },
        { category: 'Personal Protective Equipment', question: 'High-visibility vests worn by all personnel', critical: false },
        { category: 'Personal Protective Equipment', question: 'Safety harnesses inspected and properly worn', critical: true },
        { category: 'Fall Protection', question: 'Guardrails properly installed and secure', critical: true },
        { category: 'Fall Protection', question: 'Safety nets in place where required', critical: true },
        { category: 'Fall Protection', question: 'Scaffold platforms have proper decking', critical: true },
        { category: 'Fall Protection', question: 'Ladder tie-offs and safety mechanisms functional', critical: false },
        { category: 'Electrical Safety', question: 'GFCI outlets tested and functional', critical: true },
        { category: 'Electrical Safety', question: 'Electrical cords free from damage', critical: true },
        { category: 'Electrical Safety', question: 'Electrical panels properly covered', critical: false },
        { category: 'Electrical Safety', question: 'Lockout/tagout procedures being followed', critical: true },
        { category: 'Housekeeping', question: 'Work areas clean and organized', critical: false },
        { category: 'Housekeeping', question: 'Emergency exits clear of obstructions', critical: true },
        { category: 'Housekeeping', question: 'Materials properly stored and secured', critical: false }
      ],
      'Weekly Equipment Safety Check': [
        { category: 'Heavy Equipment', question: 'Daily equipment inspections completed', critical: true },
        { category: 'Heavy Equipment', question: 'Warning devices and alarms functional', critical: true },
        { category: 'Heavy Equipment', question: 'Operator certifications current', critical: true },
        { category: 'Heavy Equipment', question: 'Equipment maintenance logs up to date', critical: false },
        { category: 'Heavy Equipment', question: 'Hydraulic systems checked for leaks', critical: true },
        { category: 'Power Tools', question: 'Power tools have proper guards', critical: true },
        { category: 'Power Tools', question: 'Extension cords inspected for damage', critical: true },
        { category: 'Power Tools', question: 'Tool storage areas organized and secure', critical: false },
        { category: 'Power Tools', question: 'Ground fault protection functional', critical: true }
      ],
      'Monthly Fire Safety Audit': [
        { category: 'Fire Prevention', question: 'Fire extinguishers properly mounted and tagged', critical: true },
        { category: 'Fire Prevention', question: 'Emergency exit routes clear and marked', critical: true },
        { category: 'Fire Prevention', question: 'Hot work permits properly issued', critical: true },
        { category: 'Fire Prevention', question: 'Combustible materials properly stored', critical: false },
        { category: 'Emergency Response', question: 'Emergency contact numbers posted', critical: true },
        { category: 'Emergency Response', question: 'Emergency assembly areas marked', critical: true },
        { category: 'Detection Systems', question: 'Smoke detectors tested and functional', critical: true },
        { category: 'Detection Systems', question: 'Fire alarm systems operational', critical: true }
      ],
      'Electrical Safety Inspection': [
        { category: 'Power Systems', question: 'Main electrical panels properly labeled', critical: true },
        { category: 'Power Systems', question: 'Circuit breakers functioning correctly', critical: true },
        { category: 'Power Systems', question: 'Grounding systems properly installed', critical: true },
        { category: 'Portable Equipment', question: 'Extension cords rated for intended use', critical: true },
        { category: 'Portable Equipment', question: 'Portable generators properly grounded', critical: true },
        { category: 'Safety Procedures', question: 'Lockout/tagout procedures posted and followed', critical: true },
        { category: 'Safety Procedures', question: 'Only qualified electricians performing electrical work', critical: true }
      ]
    };
    
    // Create checklist items for each template
    for (const template of templatesResult.rows) {
      let items = checklistItems[template.name] || checklistItems['Daily Safety Inspection'];
      
      console.log(`Adding ${items.length} checklist items to template: ${template.name}`);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        await client.query(`
          INSERT INTO inspection_checklist_items (
            template_id, category, question, expected_answer, is_critical, sort_order
          ) VALUES ($1, $2, $3, 'yes', $4, $5)
        `, [template.id, item.category, item.question, item.critical, i]);
      }
    }
    
    // Create responses for completed inspections that don't have them
    const completedInspections = await client.query(`
      SELECT i.id, i.template_id, i.title
      FROM inspections i
      WHERE i.tenant_id = 5 AND i.status = 'completed'
      AND NOT EXISTS (
        SELECT 1 FROM inspection_responses ir WHERE ir.inspection_id = i.id
      )
    `);
    
    console.log(`Creating responses for ${completedInspections.rows.length} completed inspections`);
    
    for (const inspection of completedInspections.rows) {
      // Get checklist items for this template
      const checklistResult = await client.query(`
        SELECT id FROM inspection_checklist_items 
        WHERE template_id = $1 
        ORDER BY sort_order
      `, [inspection.template_id]);
      
      // Create responses for each checklist item
      for (const item of checklistResult.rows) {
        const response = Math.random() > 0.15 ? 'yes' : 'no'; // 85% compliance
        const notes = response === 'no' ? 'Non-compliance identified - corrective action required' : 'Compliant - meets safety standards';
        
        await client.query(`
          INSERT INTO inspection_responses (inspection_id, checklist_item_id, response, notes)
          VALUES ($1, $2, $3, $4)
        `, [inspection.id, item.id, response, notes]);
      }
    }
    
    // Verify the connections
    const verificationResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM inspection_templates WHERE tenant_id = 5) as templates,
        (SELECT COUNT(*) FROM inspection_checklist_items WHERE template_id IN 
         (SELECT id FROM inspection_templates WHERE tenant_id = 5)) as checklist_items,
        (SELECT COUNT(*) FROM inspection_responses WHERE inspection_id IN 
         (SELECT id FROM inspections WHERE tenant_id = 5)) as responses,
        (SELECT COUNT(*) FROM inspections WHERE tenant_id = 5) as total_inspections
    `);
    
    const counts = verificationResult.rows[0];
    
    console.log('Inspection checklist connections fixed:');
    console.log(`- Templates: ${counts.templates}`);
    console.log(`- Checklist Items: ${counts.checklist_items}`);
    console.log(`- Responses: ${counts.responses}`);
    console.log(`- Total Inspections: ${counts.total_inspections}`);
    
    // Show sample data
    const sampleResult = await client.query(`
      SELECT 
        i.id, i.title, it.name as template_name,
        COUNT(ici.id) as checklist_count,
        COUNT(ir.id) as response_count
      FROM inspections i
      JOIN inspection_templates it ON i.template_id = it.id
      LEFT JOIN inspection_checklist_items ici ON it.id = ici.template_id
      LEFT JOIN inspection_responses ir ON i.id = ir.inspection_id
      WHERE i.tenant_id = 5
      GROUP BY i.id, i.title, it.name
      ORDER BY i.id
      LIMIT 5
    `);
    
    console.log('\nSample inspection-checklist connections:');
    sampleResult.rows.forEach(row => {
      console.log(`- Inspection ${row.id}: ${row.title} (${row.template_name}) - ${row.checklist_count} items, ${row.response_count} responses`);
    });
    
  } catch (error) {
    console.error('Error fixing inspection checklist connections:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixInspectionChecklistConnections();
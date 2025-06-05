#!/usr/bin/env node

// Create comprehensive inspection data for MySafety platform

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createInspectionData() {
  const client = await pool.connect();
  
  try {
    console.log('Creating comprehensive inspection data...');
    
    // Get tenant and site info
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tenantResult.rows[0].id;
    
    const siteResult = await client.query('SELECT id FROM sites LIMIT 1');
    const siteId = siteResult.rows[0].id;
    
    const usersResult = await client.query('SELECT id, username FROM users');
    const users = usersResult.rows;

    // Clear existing inspection data for clean setup
    await client.query('DELETE FROM inspection_responses WHERE inspection_id IN (SELECT id FROM inspections WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM inspection_findings WHERE inspection_id IN (SELECT id FROM inspections WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM inspections WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM inspection_checklist_items WHERE template_id IN (SELECT id FROM inspection_templates WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM inspection_sections WHERE template_id IN (SELECT id FROM inspection_templates WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM inspection_templates WHERE tenant_id = $1', [tenantId]);

    // Create inspection templates
    const inspectionTemplates = [
      {
        name: 'Daily Safety Inspection',
        description: 'Comprehensive daily safety inspection covering all critical safety areas',
        category: 'Safety',
        sections: [
          {
            name: 'Personal Protective Equipment',
            items: [
              { question: 'All workers wearing required hard hats', critical: true },
              { question: 'Safety glasses worn in designated areas', critical: true },
              { question: 'High-visibility vests worn by all personnel', critical: false },
              { question: 'Safety harnesses inspected and properly worn', critical: true }
            ]
          },
          {
            name: 'Fall Protection Systems',
            items: [
              { question: 'Guardrails properly installed and secure', critical: true },
              { question: 'Safety nets in place where required', critical: true },
              { question: 'Scaffold platforms have proper decking', critical: true },
              { question: 'Ladder tie-offs and safety mechanisms functional', critical: false }
            ]
          },
          {
            name: 'Electrical Safety',
            items: [
              { question: 'GFCI outlets tested and functional', critical: true },
              { question: 'Electrical cords free from damage', critical: true },
              { question: 'Electrical panels properly covered', critical: false },
              { question: 'Lockout/tagout procedures being followed', critical: true }
            ]
          }
        ]
      },
      {
        name: 'Weekly Equipment Inspection',
        description: 'Weekly inspection of heavy equipment and machinery safety systems',
        category: 'Equipment',
        sections: [
          {
            name: 'Heavy Equipment',
            items: [
              { question: 'Daily equipment inspections completed', critical: true },
              { question: 'Warning devices and alarms functional', critical: true },
              { question: 'Operator certifications current', critical: true },
              { question: 'Equipment maintenance logs up to date', critical: false }
            ]
          },
          {
            name: 'Hand Tools',
            items: [
              { question: 'Power tools have proper guards', critical: true },
              { question: 'Extension cords inspected for damage', critical: true },
              { question: 'Tool storage areas organized and secure', critical: false }
            ]
          }
        ]
      },
      {
        name: 'Monthly Fire Safety Inspection',
        description: 'Monthly inspection of fire safety systems and emergency procedures',
        category: 'Fire Safety',
        sections: [
          {
            name: 'Fire Prevention',
            items: [
              { question: 'Fire extinguishers properly mounted and tagged', critical: true },
              { question: 'Emergency exit routes clear and marked', critical: true },
              { question: 'Hot work permits properly issued', critical: true },
              { question: 'Combustible materials properly stored', critical: false }
            ]
          }
        ]
      }
    ];

    const templateIds = [];
    
    // Create templates and their sections/items
    for (const template of inspectionTemplates) {
      const templateResult = await client.query(`
        INSERT INTO inspection_templates (tenant_id, name, description, category, created_by_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [tenantId, template.name, template.description, template.category, users[0].id]);
      
      const templateId = templateResult.rows[0].id;
      templateIds.push(templateId);
      
      for (let sectionIndex = 0; sectionIndex < template.sections.length; sectionIndex++) {
        const section = template.sections[sectionIndex];
        
        const sectionResult = await client.query(`
          INSERT INTO inspection_sections (template_id, name, order_index)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [templateId, section.name, sectionIndex]);
        
        const sectionId = sectionResult.rows[0].id;
        
        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];
          
          // Add to inspection_items table
          await client.query(`
            INSERT INTO inspection_items (section_id, question, type, required, order_index)
            VALUES ($1, $2, 'yes_no', true, $3)
          `, [sectionId, item.question, itemIndex]);
          
          // Add to inspection_checklist_items table
          await client.query(`
            INSERT INTO inspection_checklist_items (
              template_id, category, question, expected_answer, is_critical, sort_order
            ) VALUES ($1, $2, $3, 'yes', $4, $5)
          `, [templateId, section.name, item.question, item.critical, itemIndex]);
        }
      }
    }

    // Create 20 inspections with varying status and dates
    const inspectionData = [
      { title: 'Morning Safety Check - Building A', status: 'completed', daysAgo: 1, templateIndex: 0 },
      { title: 'Daily Safety Inspection - East Wing', status: 'completed', daysAgo: 2, templateIndex: 0 },
      { title: 'Equipment Safety Review - Heavy Machinery', status: 'completed', daysAgo: 3, templateIndex: 1 },
      { title: 'Weekly Safety Walkthrough', status: 'in_progress', daysAgo: 0, templateIndex: 0 },
      { title: 'Fire Safety Monthly Check', status: 'completed', daysAgo: 7, templateIndex: 2 },
      { title: 'Scaffold Safety Inspection - Level 3', status: 'completed', daysAgo: 1, templateIndex: 0 },
      { title: 'Electrical Safety Audit', status: 'completed', daysAgo: 5, templateIndex: 0 },
      { title: 'Crane Operation Safety Check', status: 'scheduled', daysAgo: -2, templateIndex: 1 },
      { title: 'PPE Compliance Inspection', status: 'completed', daysAgo: 4, templateIndex: 0 },
      { title: 'Emergency Exit Route Verification', status: 'completed', daysAgo: 14, templateIndex: 2 },
      { title: 'Tool Safety Inspection - Hand Tools', status: 'in_progress', daysAgo: 0, templateIndex: 1 },
      { title: 'Fall Protection System Check', status: 'completed', daysAgo: 6, templateIndex: 0 },
      { title: 'Weekly Equipment Maintenance Review', status: 'scheduled', daysAgo: -1, templateIndex: 1 },
      { title: 'Hazardous Materials Storage Inspection', status: 'completed', daysAgo: 8, templateIndex: 0 },
      { title: 'Site Perimeter Safety Check', status: 'completed', daysAgo: 3, templateIndex: 0 },
      { title: 'Confined Space Entry Preparation', status: 'scheduled', daysAgo: -3, templateIndex: 0 },
      { title: 'Vehicle and Mobile Equipment Inspection', status: 'completed', daysAgo: 9, templateIndex: 1 },
      { title: 'Hot Work Area Safety Verification', status: 'completed', daysAgo: 2, templateIndex: 2 },
      { title: 'Monthly Comprehensive Safety Audit', status: 'in_progress', daysAgo: 0, templateIndex: 0 },
      { title: 'End-of-Week Safety Summary Inspection', status: 'completed', daysAgo: 5, templateIndex: 0 }
    ];

    const inspectionIds = [];
    
    for (let i = 0; i < inspectionData.length; i++) {
      const inspection = inspectionData[i];
      const templateId = templateIds[inspection.templateIndex];
      const assignedUser = users[i % users.length];
      const createdByUser = users[0];
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - inspection.daysAgo);
      
      let completedDate = null;
      let completedBy = null;
      if (inspection.status === 'completed') {
        completedDate = new Date(scheduledDate);
        completedDate.setHours(completedDate.getHours() + Math.floor(Math.random() * 8) + 1);
        completedBy = assignedUser.id;
      }
      
      const inspectionResult = await client.query(`
        INSERT INTO inspections (
          tenant_id, site_id, template_id, title, scheduled_date, assigned_to_id,
          created_by_id, completed_by_id, completed_date, status, inspector_id,
          score, max_score, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        tenantId, siteId, templateId, inspection.title, scheduledDate,
        assignedUser.id, createdByUser.id, completedBy, completedDate,
        inspection.status, assignedUser.id,
        inspection.status === 'completed' ? Math.floor(Math.random() * 20) + 80 : null,
        inspection.status === 'completed' ? 100 : null,
        `Inspection ${inspection.status === 'completed' ? 'completed' : 'scheduled'} for ${inspection.title.toLowerCase()}`,
        scheduledDate
      ]);
      
      inspectionIds.push(inspectionResult.rows[0].id);
    }

    // Create inspection responses for completed inspections
    for (let i = 0; i < inspectionIds.length; i++) {
      const inspectionId = inspectionIds[i];
      const inspection = inspectionData[i];
      
      if (inspection.status === 'completed') {
        // Get checklist items for this inspection's template
        const templateId = templateIds[inspection.templateIndex];
        const checklistItems = await client.query(`
          SELECT id FROM inspection_checklist_items WHERE template_id = $1
        `, [templateId]);
        
        // Create responses for each checklist item
        for (const item of checklistItems.rows) {
          const response = Math.random() > 0.1 ? 'yes' : 'no'; // 90% compliance rate
          const notes = response === 'no' ? 'Issue identified - corrective action required' : null;
          
          await client.query(`
            INSERT INTO inspection_responses (inspection_id, checklist_item_id, response, notes)
            VALUES ($1, $2, $3, $4)
          `, [inspectionId, item.id, response, notes]);
        }
        
        // Add inspection findings for non-compliant items (10% of inspections have findings)
        if (Math.random() < 0.3) {
          const findingDescriptions = [
            'PPE not being worn consistently in designated areas',
            'Minor electrical cord damage observed - replacement needed',
            'Housekeeping standards need improvement in work areas',
            'Tool storage area requires better organization',
            'Additional signage needed for emergency exits'
          ];
          
          const randomFinding = findingDescriptions[Math.floor(Math.random() * findingDescriptions.length)];
          
          await client.query(`
            INSERT INTO inspection_findings (
              inspection_id, description, severity, location, 
              recommended_action, status, created_by_id
            ) VALUES ($1, $2, 'medium', 'Construction Site - Various Areas', 
                     'Address finding within 48 hours', 'open', $3)
          `, [inspectionId, randomFinding, users[0].id]);
        }
      }
    }

    // Get final counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM inspection_templates WHERE tenant_id = $1) as templates,
        (SELECT COUNT(*) FROM inspections WHERE tenant_id = $1) as inspections,
        (SELECT COUNT(*) FROM inspection_responses WHERE inspection_id IN 
         (SELECT id FROM inspections WHERE tenant_id = $1)) as responses,
        (SELECT COUNT(*) FROM inspection_findings WHERE inspection_id IN 
         (SELECT id FROM inspections WHERE tenant_id = $1)) as findings
    `, [tenantId]);

    console.log('Comprehensive inspection data created:');
    console.log(`- Templates: ${counts.rows[0].templates} (with sections and checklist items)`);
    console.log(`- Inspections: ${counts.rows[0].inspections} (various statuses and dates)`);
    console.log(`- Responses: ${counts.rows[0].responses} (detailed compliance tracking)`);
    console.log(`- Findings: ${counts.rows[0].findings} (non-compliance issues identified)`);
    console.log('- Complete inspection workflow with realistic data');
    console.log('- Templates cover safety, equipment, and fire safety categories');
    console.log('- Inspection statuses include scheduled, in_progress, and completed');
    
  } catch (error) {
    console.error('Error creating inspection data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createInspectionData();
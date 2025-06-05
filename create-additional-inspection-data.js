#!/usr/bin/env node

// Create additional inspection data while preserving existing records

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdditionalInspectionData() {
  const client = await pool.connect();
  
  try {
    console.log('Creating additional inspection data...');
    
    // Get tenant and site info
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tenantResult.rows[0].id;
    
    const siteResult = await client.query('SELECT id FROM sites LIMIT 1');
    const siteId = siteResult.rows[0].id;
    
    const usersResult = await client.query('SELECT id, username FROM users');
    const users = usersResult.rows;

    // Get existing template
    const existingTemplate = await client.query('SELECT id FROM inspection_templates WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    const templateId = existingTemplate.rows[0].id;

    // Create additional inspection templates
    const newTemplates = [
      {
        name: 'Weekly Equipment Safety Check',
        description: 'Weekly inspection of heavy equipment and power tools safety systems',
        category: 'Equipment Safety'
      },
      {
        name: 'Monthly Fire Safety Audit',
        description: 'Comprehensive monthly fire safety and emergency preparedness inspection',
        category: 'Fire Safety'
      },
      {
        name: 'Electrical Safety Inspection',
        description: 'Detailed electrical safety inspection covering all electrical systems and equipment',
        category: 'Electrical Safety'
      }
    ];

    const templateIds = [templateId]; // Include existing template
    
    // Create new templates
    for (const template of newTemplates) {
      const templateResult = await client.query(`
        INSERT INTO inspection_templates (tenant_id, name, description, category, created_by_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [tenantId, template.name, template.description, template.category, users[0].id]);
      
      templateIds.push(templateResult.rows[0].id);
      
      // Create checklist items for new templates
      const checklistItems = [
        'Safety equipment properly maintained and functional',
        'All safety protocols being followed by personnel',
        'Emergency procedures clearly posted and accessible',
        'Required certifications and training up to date',
        'Safety barriers and warning signs properly placed',
        'Personal protective equipment available and in good condition'
      ];
      
      for (let i = 0; i < checklistItems.length; i++) {
        await client.query(`
          INSERT INTO inspection_checklist_items (
            template_id, category, question, expected_answer, is_critical, sort_order
          ) VALUES ($1, $2, $3, 'yes', $4, $5)
        `, [templateResult.rows[0].id, template.category, checklistItems[i], i < 3, i]);
      }
    }

    // Create 20 diverse inspections
    const inspectionData = [
      { title: 'Morning Safety Walkthrough - Main Site', status: 'completed', daysAgo: 1, templateIndex: 0, score: 95 },
      { title: 'Weekly Equipment Safety Review', status: 'completed', daysAgo: 2, templateIndex: 1, score: 88 },
      { title: 'Fire Safety System Check - Building A', status: 'completed', daysAgo: 3, templateIndex: 2, score: 92 },
      { title: 'Electrical Panel Inspection - East Wing', status: 'completed', daysAgo: 1, templateIndex: 3, score: 85 },
      { title: 'Scaffold Safety Inspection - Level 4', status: 'in_progress', daysAgo: 0, templateIndex: 0, score: null },
      { title: 'Crane Operation Safety Audit', status: 'completed', daysAgo: 4, templateIndex: 1, score: 90 },
      { title: 'PPE Compliance Check - All Areas', status: 'completed', daysAgo: 2, templateIndex: 0, score: 94 },
      { title: 'Emergency Exit Route Verification', status: 'completed', daysAgo: 7, templateIndex: 2, score: 87 },
      { title: 'Tool Safety Inspection - Power Tools', status: 'scheduled', daysAgo: -1, templateIndex: 1, score: null },
      { title: 'Fall Protection System Audit', status: 'completed', daysAgo: 5, templateIndex: 0, score: 91 },
      { title: 'Monthly Comprehensive Safety Review', status: 'completed', daysAgo: 14, templateIndex: 0, score: 93 },
      { title: 'Electrical GFCI Testing', status: 'completed', daysAgo: 3, templateIndex: 3, score: 89 },
      { title: 'Fire Extinguisher Monthly Check', status: 'completed', daysAgo: 6, templateIndex: 2, score: 96 },
      { title: 'Heavy Equipment Pre-operation Inspection', status: 'in_progress', daysAgo: 0, templateIndex: 1, score: null },
      { title: 'Site Perimeter Security and Safety Check', status: 'completed', daysAgo: 8, templateIndex: 0, score: 86 },
      { title: 'Confined Space Entry Preparation Review', status: 'scheduled', daysAgo: -2, templateIndex: 0, score: null },
      { title: 'Hot Work Area Safety Inspection', status: 'completed', daysAgo: 4, templateIndex: 2, score: 88 },
      { title: 'Vehicle and Mobile Equipment Safety Check', status: 'completed', daysAgo: 9, templateIndex: 1, score: 92 },
      { title: 'Weekly Safety Meeting Follow-up Inspection', status: 'scheduled', daysAgo: -3, templateIndex: 0, score: null },
      { title: 'End-of-Shift Safety Summary Review', status: 'completed', daysAgo: 1, templateIndex: 0, score: 97 }
    ];

    const inspectionIds = [];
    
    for (let i = 0; i < inspectionData.length; i++) {
      const inspection = inspectionData[i];
      const selectedTemplateId = templateIds[inspection.templateIndex];
      const assignedUser = users[i % users.length];
      const createdByUser = users[0];
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - inspection.daysAgo);
      
      let completedDate = null;
      let completedBy = null;
      if (inspection.status === 'completed') {
        completedDate = new Date(scheduledDate);
        completedDate.setHours(completedDate.getHours() + Math.floor(Math.random() * 6) + 1);
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
        tenantId, siteId, selectedTemplateId, inspection.title, scheduledDate,
        assignedUser.id, createdByUser.id, completedBy, completedDate,
        inspection.status, assignedUser.id, inspection.score, 100,
        `${inspection.status === 'completed' ? 'Completed' : inspection.status === 'in_progress' ? 'In Progress' : 'Scheduled'} - ${inspection.title}`,
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
        const selectedTemplateId = templateIds[inspection.templateIndex];
        const checklistItems = await client.query(`
          SELECT id FROM inspection_checklist_items WHERE template_id = $1
        `, [selectedTemplateId]);
        
        // Create responses for each checklist item
        for (const item of checklistItems.rows) {
          const response = Math.random() > 0.15 ? 'yes' : 'no'; // 85% compliance rate
          const notes = response === 'no' ? 'Non-compliance identified - corrective action initiated' : 'Compliant - meets safety standards';
          
          await client.query(`
            INSERT INTO inspection_responses (inspection_id, checklist_item_id, response, notes)
            VALUES ($1, $2, $3, $4)
          `, [inspectionId, item.id, response, notes]);
        }
        
        // Add inspection findings for some inspections
        if (Math.random() < 0.25) { // 25% of inspections have findings
          const findingDescriptions = [
            'Minor housekeeping issue - debris accumulation in work area',
            'PPE reminder needed - some workers not consistently wearing safety glasses',
            'Tool maintenance required - power cord shows minor wear',
            'Signage update needed - emergency exit sign partially obscured',
            'Safety barrier adjustment required - gap identified in perimeter protection',
            'Equipment calibration due - measuring device requires recertification'
          ];
          
          const randomFinding = findingDescriptions[Math.floor(Math.random() * findingDescriptions.length)];
          const severity = Math.random() > 0.7 ? 'high' : 'medium';
          
          await client.query(`
            INSERT INTO inspection_findings (
              inspection_id, description, severity, location, 
              recommended_action, status, created_by_id
            ) VALUES ($1, $2, $3, 'Construction Site - Various Locations', 
                     'Address finding within 24-48 hours based on severity', 'open', $4)
          `, [inspectionId, randomFinding, severity, users[0].id]);
        }
      }
    }

    // Get final comprehensive counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM inspection_templates WHERE tenant_id = $1) as templates,
        (SELECT COUNT(*) FROM inspections WHERE tenant_id = $1) as inspections,
        (SELECT COUNT(*) FROM inspection_responses WHERE inspection_id IN 
         (SELECT id FROM inspections WHERE tenant_id = $1)) as responses,
        (SELECT COUNT(*) FROM inspection_findings WHERE inspection_id IN 
         (SELECT id FROM inspections WHERE tenant_id = $1)) as findings,
        (SELECT COUNT(*) FROM inspection_checklist_items WHERE template_id IN 
         (SELECT id FROM inspection_templates WHERE tenant_id = $1)) as checklist_items
    `, [tenantId]);

    // Get status breakdown
    const statusBreakdown = await client.query(`
      SELECT status, COUNT(*) as count
      FROM inspections 
      WHERE tenant_id = $1
      GROUP BY status
      ORDER BY status
    `, [tenantId]);

    console.log('Comprehensive inspection module data created:');
    console.log(`- Templates: ${counts.rows[0].templates} (covering safety, equipment, fire, electrical)`);
    console.log(`- Inspections: ${counts.rows[0].inspections} (diverse types and schedules)`);
    console.log(`- Checklist Items: ${counts.rows[0].checklist_items} (detailed compliance criteria)`);
    console.log(`- Responses: ${counts.rows[0].responses} (detailed compliance tracking)`);
    console.log(`- Findings: ${counts.rows[0].findings} (non-compliance issues and corrective actions)`);
    
    console.log('\nInspection Status Distribution:');
    statusBreakdown.rows.forEach(row => {
      console.log(`- ${row.status}: ${row.count} inspections`);
    });
    
    console.log('\nFeatures implemented:');
    console.log('- Multiple inspection templates for different safety categories');
    console.log('- Realistic inspection schedules spanning past and future dates');
    console.log('- Comprehensive response tracking with compliance scoring');
    console.log('- Non-compliance findings with severity levels and corrective actions');
    console.log('- Complete inspection workflow from scheduling to completion');
    
  } catch (error) {
    console.error('Error creating inspection data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdditionalInspectionData();
#!/usr/bin/env node

// Create comprehensive safety management data across all modules

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createCompleteSafetyData() {
  const client = await pool.connect();
  
  try {
    console.log('Creating comprehensive safety management data...');
    
    // Get tenant and site info
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tenantResult.rows[0].id;
    
    const siteResult = await client.query('SELECT id FROM sites LIMIT 1');
    const siteId = siteResult.rows[0].id;
    
    const usersResult = await client.query('SELECT id, username FROM users');
    const users = usersResult.rows;

    // 1. CREATE TRAINING COURSES
    const trainingCourses = [
      {
        title: 'Fall Protection and Scaffolding Safety',
        description: 'Comprehensive training on fall protection systems, scaffolding safety, and height work protocols for construction workers.',
        passing_score: 80,
        is_required: true,
        content: 'OSHA fall protection standards, harness inspection, scaffolding setup procedures, emergency response protocols'
      },
      {
        title: 'Electrical Safety on Construction Sites',
        description: 'Essential electrical safety training covering lockout/tagout procedures, electrical hazard recognition, and safe work practices.',
        passing_score: 85,
        is_required: true,
        content: 'Electrical hazard identification, LOTO procedures, ground fault protection, electrical PPE requirements'
      },
      {
        title: 'Heavy Equipment Operation Safety',
        description: 'Safety protocols for operating cranes, excavators, and other heavy construction equipment.',
        passing_score: 90,
        is_required: false,
        content: 'Pre-operation inspections, load charts, blind spot awareness, communication protocols'
      },
      {
        title: 'Hazardous Materials Handling',
        description: 'Training on safe handling, storage, and disposal of hazardous materials commonly found on construction sites.',
        passing_score: 80,
        is_required: true,
        content: 'Material safety data sheets, chemical storage requirements, spill response procedures, PPE selection'
      },
      {
        title: 'Confined Space Entry Procedures',
        description: 'Specialized training for workers entering confined spaces including permit requirements and atmospheric testing.',
        passing_score: 95,
        is_required: false,
        content: 'Confined space classification, atmospheric testing, entry permits, rescue procedures'
      },
      {
        title: 'Emergency Response and First Aid',
        description: 'Basic emergency response training including first aid, CPR, and emergency evacuation procedures.',
        passing_score: 75,
        is_required: true,
        content: 'First aid basics, CPR techniques, emergency communication, evacuation procedures'
      }
    ];

    for (const course of trainingCourses) {
      await client.query(`
        INSERT INTO training_courses (
          tenant_id, title, description, passing_score, is_required, 
          assigned_roles, created_by_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days')
      `, [
        tenantId, course.title, course.description, course.passing_score, 
        course.is_required, JSON.stringify(['employee', 'supervisor']), users[0].id
      ]);
    }

    // 2. CREATE TRAINING RECORDS
    const courseIds = await client.query('SELECT id FROM training_courses');
    for (const user of users) {
      for (const course of courseIds.rows) {
        const completed = Math.random() > 0.3; // 70% completion rate
        if (completed) {
          const score = Math.floor(Math.random() * 30) + 70; // 70-100
          const passed = score >= 75;
          
          await client.query(`
            INSERT INTO training_records (
              tenant_id, user_id, course_id, start_date, completion_date, 
              score, passed, created_at
            ) VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 90)} days',
                     NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days', $4, $5, NOW())
          `, [tenantId, user.id, course.id, score, passed]);
        }
      }
    }

    // 3. CREATE INCIDENT REPORTS
    const incidents = [
      {
        title: 'Minor Cut from Sheet Metal',
        description: 'Worker sustained small laceration on hand while handling sheet metal. First aid administered on site.',
        incident_type: 'Injury',
        severity: 'minor',
        injury_occurred: true,
        injury_details: 'Small laceration on left hand, approximately 1 inch long. No stitches required.',
        witnesses: JSON.stringify(['John Smith', 'Maria Garcia']),
        corrective_actions: 'Retrained worker on proper handling techniques. Provided cut-resistant gloves.',
        preventative_measures: 'Mandatory cut-resistant gloves for all sheet metal work. Updated safety briefing.'
      },
      {
        title: 'Near Miss - Falling Tool',
        description: 'Hammer fell from scaffolding level 3, landed near worker below. No injury occurred.',
        incident_type: 'Near Miss',
        severity: 'moderate',
        injury_occurred: false,
        witnesses: JSON.stringify(['Safety Inspector', 'Site Foreman']),
        corrective_actions: 'Installed additional tool lanyards on all elevated work areas.',
        preventative_measures: 'Tool lanyard requirement for all work above 6 feet. Daily tool inventory checks.'
      },
      {
        title: 'Chemical Splash Incident',
        description: 'Concrete admixture splashed onto worker during mixing operation. Safety shower used immediately.',
        incident_type: 'Chemical Exposure',
        severity: 'moderate',
        injury_occurred: true,
        injury_details: 'Chemical splash on forearm. Flushed with water immediately. Minor skin irritation.',
        witnesses: JSON.stringify(['Concrete Foreman']),
        corrective_actions: 'Reviewed mixing procedures. Enhanced PPE requirements.',
        preventative_measures: 'Face shields now required for all chemical mixing operations.'
      }
    ];

    for (const incident of incidents) {
      await client.query(`
        INSERT INTO incident_reports (
          tenant_id, site_id, reported_by_id, title, description, 
          incident_date, location, incident_type, severity, status,
          injury_occurred, injury_details, witnesses, corrective_actions,
          preventative_measures, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days',
                 'Construction Site - Various Locations', $6, $7, 'reported', $8, $9, $10, $11, $12, NOW())
      `, [
        tenantId, siteId, users[Math.floor(Math.random() * users.length)].id,
        incident.title, incident.description, incident.incident_type, incident.severity,
        incident.injury_occurred, incident.injury_details, incident.witnesses,
        incident.corrective_actions, incident.preventative_measures
      ]);
    }

    // 4. CREATE PERMIT REQUESTS
    const permits = [
      {
        permit_type: 'Hot Work',
        title: 'Welding Operations - Building A Structure',
        description: 'Welding of structural steel beams on Building A, Level 3. Fire watch required.',
        location: 'Building A - Level 3 Structural Area',
        status: 'approved',
        hours_duration: 8
      },
      {
        permit_type: 'Confined Space',
        title: 'Underground Utility Vault Maintenance',
        description: 'Entry into underground electrical vault for cable installation and inspection.',
        location: 'Underground Vault - North Parking Area',
        status: 'requested',
        hours_duration: 4
      },
      {
        permit_type: 'Excavation',
        title: 'Foundation Excavation - Building B',
        description: 'Deep excavation for Building B foundation. Requires shoring and soil analysis.',
        location: 'Building B Foundation Area',
        status: 'approved',
        hours_duration: 72
      },
      {
        permit_type: 'Crane Operation',
        title: 'Tower Crane Installation',
        description: 'Installation of tower crane using mobile crane. Street closure required.',
        location: 'Central Construction Area',
        status: 'denied',
        hours_duration: 12
      }
    ];

    for (const permit of permits) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14));
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + permit.hours_duration);
      
      await client.query(`
        INSERT INTO permit_requests (
          tenant_id, site_id, requester_id, permit_type, title, description,
          location, start_date, end_date, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days')
      `, [
        tenantId, siteId, users[Math.floor(Math.random() * users.length)].id,
        permit.permit_type, permit.title, permit.description, permit.location,
        startDate, endDate, permit.status
      ]);
    }

    // 5. CREATE INSPECTION TEMPLATES AND INSPECTIONS
    const templateResult = await client.query(`
      INSERT INTO inspection_templates (tenant_id, name, description, category, created_by_id)
      VALUES ($1, 'Daily Safety Inspection', 'Comprehensive daily safety inspection checklist', 'Safety', $2)
      RETURNING id
    `, [tenantId, users[0].id]);
    
    const templateId = templateResult.rows[0].id;

    // Add inspection items
    const inspectionItems = [
      'PPE compliance check',
      'Fall protection systems inspection',
      'Emergency exits clear and marked',
      'Fire extinguisher locations and condition',
      'Electrical safety compliance',
      'Housekeeping standards met'
    ];

    for (let i = 0; i < inspectionItems.length; i++) {
      await client.query(`
        INSERT INTO inspection_checklist_items (
          template_id, category, question, expected_answer, is_critical, sort_order
        ) VALUES ($1, 'Safety', $2, 'yes', $3, $4)
      `, [templateId, inspectionItems[i], i < 2, i]);
    }

    // Create inspections
    for (let i = 0; i < 5; i++) {
      const inspector = users[Math.floor(Math.random() * users.length)];
      const status = ['completed', 'in_progress', 'scheduled'][Math.floor(Math.random() * 3)];
      
      await client.query(`
        INSERT INTO inspections (
          tenant_id, site_id, template_id, title, scheduled_date, 
          assigned_to_id, created_by_id, status, inspector_id, created_at
        ) VALUES ($1, $2, $3, 'Daily Safety Inspection ${i + 1}', 
                 NOW() - INTERVAL '${i * 2} days', $4, $5, $6, $4, NOW())
      `, [tenantId, siteId, templateId, inspector.id, users[0].id, status]);
    }

    // Get final counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM training_courses) as courses,
        (SELECT COUNT(*) FROM training_records) as training_records,
        (SELECT COUNT(*) FROM incident_reports) as incidents,
        (SELECT COUNT(*) FROM permit_requests) as permits,
        (SELECT COUNT(*) FROM inspections) as inspections
    `);

    console.log('Complete safety management data created:');
    console.log(`- Training Courses: ${counts.rows[0].courses}`);
    console.log(`- Training Records: ${counts.rows[0].training_records}`);
    console.log(`- Incident Reports: ${counts.rows[0].incidents}`);
    console.log(`- Permit Requests: ${counts.rows[0].permits}`);
    console.log(`- Inspections: ${counts.rows[0].inspections}`);
    console.log('All modules now have realistic operational data');
    
  } catch (error) {
    console.error('Error creating safety data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createCompleteSafetyData();
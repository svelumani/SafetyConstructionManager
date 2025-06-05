#!/usr/bin/env node

// Complete hazard dataset with assignments and comments

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createCompleteHazardData() {
  const client = await pool.connect();
  
  try {
    console.log('Creating complete hazard dataset with assignments and comments...');
    
    // Get existing hazard reports
    const hazardsResult = await client.query('SELECT id, status, severity FROM hazard_reports ORDER BY id');
    const hazards = hazardsResult.rows;
    
    // Get available users for assignments
    const usersResult = await client.query('SELECT id, username FROM users');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('No users found - creating sample users for assignments');
      
      // Create additional users for realistic assignments
      const userRoles = [
        { username: 'safety_manager', email: 'safety@construction.com', first_name: 'Sarah', last_name: 'Johnson', role: 'safety_officer' },
        { username: 'site_supervisor', email: 'supervisor@construction.com', first_name: 'Mike', last_name: 'Rodriguez', role: 'supervisor' },
        { username: 'maintenance_lead', email: 'maintenance@construction.com', first_name: 'David', last_name: 'Chen', role: 'employee' },
        { username: 'foreman_east', email: 'foreman.east@construction.com', first_name: 'Jennifer', last_name: 'Williams', role: 'supervisor' },
        { username: 'safety_tech', email: 'tech@construction.com', first_name: 'Robert', last_name: 'Brown', role: 'employee' }
      ];
      
      const tenantId = 1;
      for (const userData of userRoles) {
        await client.query(`
          INSERT INTO users (tenant_id, username, email, password, first_name, last_name, role)
          VALUES ($1, $2, $3, 'hashed_password', $4, $5, $6)
        `, [tenantId, userData.username, userData.email, userData.first_name, userData.last_name, userData.role]);
      }
      
      // Refresh users list
      const newUsersResult = await client.query('SELECT id, username FROM users');
      users.push(...newUsersResult.rows);
    }
    
    // Create assignments for hazards with status 'assigned' or 'in_progress'
    for (const hazard of hazards) {
      if (['assigned', 'in_progress'].includes(hazard.status)) {
        const assignedUser = users[Math.floor(Math.random() * users.length)];
        const assignedBy = users[0]; // First user (admin/safety officer)
        
        // Calculate due date based on severity
        let daysToComplete;
        switch (hazard.severity) {
          case 'critical': daysToComplete = 1; break;
          case 'high': daysToComplete = 3; break;
          case 'medium': daysToComplete = 7; break;
          default: daysToComplete = 14;
        }
        
        await client.query(`
          INSERT INTO hazard_assignments (
            hazard_id, assigned_by_id, assigned_to_user_id, 
            assigned_at, due_date, status, notes
          ) VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 5)} days', 
                   NOW() + INTERVAL '${daysToComplete} days', $4, $5)
        `, [
          hazard.id, 
          assignedBy.id, 
          assignedUser.id, 
          hazard.status,
          `Assigned to ${assignedUser.username} - Priority: ${hazard.severity}`
        ]);
      }
    }
    
    // Create realistic comments for hazards
    const commentTemplates = [
      "Initial assessment completed. Safety barriers installed as temporary measure.",
      "Work area has been cordoned off. Scheduling repair crew for tomorrow.",
      "Contacted electrical contractor. Awaiting availability for emergency repair.",
      "Materials ordered. Expected delivery by end of week.",
      "Temporary signage posted. All workers notified of hazard location.",
      "Engineering review required before proceeding with permanent fix.",
      "Coordinating with site supervisor to schedule work during off-hours.",
      "OSHA guidelines reviewed. Implementing additional safety protocols.",
      "Vendor assessment scheduled for Monday morning.",
      "Interim safety measures proving effective. No incidents reported.",
      "Weather delay affecting repair schedule. Monitoring conditions.",
      "Additional equipment needed. Updating procurement request.",
      "Training session scheduled for affected crew members.",
      "Inspection completed. Documentation submitted to management.",
      "Corrective action plan approved. Implementation begins tomorrow."
    ];
    
    // Add comments to 80% of hazards (multiple comments for some)
    for (const hazard of hazards) {
      const numComments = Math.random() < 0.3 ? 2 : 1; // 30% chance of multiple comments
      
      for (let i = 0; i < numComments; i++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        const comment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        const daysAgo = Math.floor(Math.random() * 7) + i; // Spread comments over time
        
        await client.query(`
          INSERT INTO hazard_comments (hazard_id, user_id, comment, created_at)
          VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')
        `, [hazard.id, commenter.id, comment]);
      }
    }
    
    // Verify complete dataset
    const finalCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM hazard_reports) as hazards,
        (SELECT COUNT(*) FROM hazard_assignments) as assignments,
        (SELECT COUNT(*) FROM hazard_comments) as comments
    `);
    
    console.log('Complete hazard dataset created:');
    console.log(`- Hazard Reports: ${finalCounts.rows[0].hazards}`);
    console.log(`- Assignments: ${finalCounts.rows[0].assignments}`);
    console.log(`- Comments: ${finalCounts.rows[0].comments}`);
    console.log('- Realistic assignment workflows');
    console.log('- Multi-user comment threads');
    console.log('- Priority-based due dates');
    
  } catch (error) {
    console.error('Error creating complete hazard data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createCompleteHazardData();
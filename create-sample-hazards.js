#!/usr/bin/env node

// Create realistic hazard data for MySafety construction platform

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const hazardData = [
  {
    title: "Exposed Electrical Wiring in Building A",
    description: "Live electrical wires exposed in the basement level near the water main. Immediate safety concern for workers accessing utility areas.",
    location: "Building A - Basement Level, Near Water Main",
    hazard_type: "Electrical",
    severity: "critical",
    status: "open",
    recommended_action: "Isolate power immediately and install proper conduit protection. Post warning signs until repairs completed."
  },
  {
    title: "Unsecured Scaffolding on East Side",
    description: "Three-story scaffolding system lacks proper tie-ins to building structure. Wind conditions may cause instability.",
    location: "East Side Exterior - Stories 2-4",
    hazard_type: "Fall Protection",
    severity: "high",
    status: "assigned",
    recommended_action: "Install additional tie-ins per OSHA standards. Inspect all connection points and add stabilizing braces."
  },
  {
    title: "Chemical Spill in Storage Area",
    description: "Small diesel fuel spill from equipment maintenance. Slippery surface and vapor concerns in enclosed space.",
    location: "Main Storage Warehouse - Bay 3",
    hazard_type: "Chemical/Environmental",
    severity: "medium",
    status: "in_progress",
    recommended_action: "Clean spill with absorbent materials. Improve ventilation and post no-smoking signs."
  },
  {
    title: "Missing Safety Rails on Loading Dock",
    description: "Loading dock edge lacks required guardrails. 8-foot drop poses serious fall hazard for personnel and equipment operators.",
    location: "North Loading Dock - Bays 1-3",
    hazard_type: "Fall Protection",
    severity: "high",
    status: "open",
    recommended_action: "Install OSHA-compliant guardrail system immediately. Add warning striping until installation complete."
  },
  {
    title: "Blocked Emergency Exit Route",
    description: "Construction materials and equipment blocking designated emergency exit corridor. Violates fire safety protocols.",
    location: "Ground Floor - Emergency Exit C",
    hazard_type: "Fire Safety",
    severity: "high",
    status: "resolved",
    recommended_action: "Relocate materials to designated storage areas. Maintain clear egress path per fire marshal requirements."
  },
  {
    title: "Damaged Hard Hat Found During Inspection",
    description: "Cracked hard hat discovered during routine PPE inspection. Protective integrity compromised.",
    location: "Site Office - Equipment Check Area",
    hazard_type: "Personal Protective Equipment",
    severity: "medium",
    status: "resolved",
    recommended_action: "Replace damaged hard hat immediately. Review PPE inspection procedures with all staff."
  },
  {
    title: "Unstable Crane Load on Tower Crane",
    description: "Heavy steel beam load showing signs of shifting. Rigging points appear stressed and may fail.",
    location: "Tower Crane 2 - 150ft Level",
    hazard_type: "Heavy Equipment",
    severity: "critical",
    status: "assigned",
    recommended_action: "Lower load immediately and inspect all rigging equipment. Re-rig with certified rigging specialist."
  },
  {
    title: "Water Accumulation Creating Ice Patches",
    description: "Poor drainage in walkway area causing ice formation during cold morning hours. Slip hazard for workers.",
    location: "Main Walkway - Between Buildings A and B",
    hazard_type: "Environmental",
    severity: "medium",
    status: "in_progress",
    recommended_action: "Improve drainage system and apply ice-melt treatment. Install non-slip surfacing."
  },
  {
    title: "Asbestos-Containing Materials Discovered",
    description: "Suspected asbestos insulation found during demolition work in older building section. Work stopped pending testing.",
    location: "Building C - Second Floor Mechanical Room",
    hazard_type: "Chemical/Environmental",
    severity: "critical",
    status: "open",
    recommended_action: "Halt all work in area. Conduct professional asbestos testing and implement abatement procedures if confirmed."
  },
  {
    title: "Trench Cave-in Risk in Excavation Zone",
    description: "Excavation walls showing stress cracks and minor soil movement. Inadequate shoring for depth and soil conditions.",
    location: "Excavation Site - South Parking Area",
    hazard_type: "Excavation",
    severity: "critical",
    status: "assigned",
    recommended_action: "Install proper trench shoring immediately. No entry until certified by structural engineer."
  },
  {
    title: "Malfunctioning Safety Hoist on Building B",
    description: "Personnel hoist making unusual noises and jerky movements. Last inspection shows overdue maintenance items.",
    location: "Building B - External Personnel Hoist",
    hazard_type: "Heavy Equipment",
    severity: "high",
    status: "open",
    recommended_action: "Tag out hoist immediately. Schedule certified inspection and repair before returning to service."
  },
  {
    title: "Inadequate Lighting in Stairwell Area",
    description: "Poor lighting conditions in main stairwell creating visibility hazards. Several bulbs burned out.",
    location: "Main Stairwell - Levels 2-5",
    hazard_type: "Environmental",
    severity: "medium",
    status: "in_progress",
    recommended_action: "Replace all burned-out fixtures and upgrade to LED lighting system for better visibility."
  },
  {
    title: "Welding Operations Without Proper Ventilation",
    description: "Hot work being performed in enclosed space without adequate ventilation. Fume accumulation observed.",
    location: "Building A - Mechanical Room",
    hazard_type: "Air Quality",
    severity: "high",
    status: "resolved",
    recommended_action: "Install proper ventilation system and provide respiratory protection for welders."
  },
  {
    title: "Loose Construction Debris Overhead",
    description: "Construction materials and debris on upper levels pose falling object hazard to workers below.",
    location: "Building A - Above Ground Floor Work Area",
    hazard_type: "Falling Objects",
    severity: "high",
    status: "assigned",
    recommended_action: "Secure all loose materials and install protective screening over work areas below."
  },
  {
    title: "Defective Ground Fault Circuit Interrupter",
    description: "GFCI outlet not functioning properly during electrical safety test. Potential electrocution hazard in wet conditions.",
    location: "Temporary Electrical Panel - Main Site",
    hazard_type: "Electrical",
    severity: "high",
    status: "open",
    recommended_action: "Replace defective GFCI immediately. Test all electrical outlets on weekly basis."
  },
  {
    title: "Improper Material Storage Creating Tip-Over Risk",
    description: "Heavy materials stacked too high without proper securing. Risk of tip-over during wind or equipment operation.",
    location: "Material Storage Yard - Section D",
    hazard_type: "Material Handling",
    severity: "medium",
    status: "resolved",
    recommended_action: "Reorganize storage following proper stacking procedures. Install restraining systems for tall stacks."
  },
  {
    title: "Missing Confined Space Entry Procedures",
    description: "Workers entering underground utility vault without proper confined space protocols. No atmospheric testing performed.",
    location: "Underground Utility Vault - North Side",
    hazard_type: "Confined Space",
    severity: "critical",
    status: "in_progress",
    recommended_action: "Implement full confined space entry procedures. Provide atmospheric monitoring equipment and standby personnel."
  },
  {
    title: "Damaged Safety Mesh on Building Exterior",
    description: "Protective mesh on building exterior showing tears and loose attachments. Debris fall protection compromised.",
    location: "Building B - West Face, Levels 3-6",
    hazard_type: "Falling Objects",
    severity: "medium",
    status: "assigned",
    recommended_action: "Repair or replace damaged mesh sections. Inspect all attachment points for security."
  },
  {
    title: "Heavy Equipment Operating Without Spotter",
    description: "Excavator working in high-traffic area without designated spotter for blind spots. Near-miss incidents reported.",
    location: "Main Construction Area - Near Site Office",
    hazard_type: "Heavy Equipment",
    severity: "high",
    status: "open",
    recommended_action: "Assign certified spotter for all heavy equipment operations. Establish clear communication protocols."
  },
  {
    title: "Slip Hazard from Oil Leak in Equipment Area",
    description: "Hydraulic oil leak from concrete pump creating slippery conditions. Multiple workers have nearly slipped.",
    location: "Equipment Staging Area - Concrete Pump Location",
    hazard_type: "Environmental",
    severity: "medium",
    status: "resolved",
    recommended_action: "Repair hydraulic leak and clean affected area with degreasing agents. Place absorbent mats under equipment."
  }
];

async function createHazards() {
  const client = await pool.connect();
  
  try {
    console.log('Creating realistic hazard data for MySafety platform...');
    
    // First, ensure we have basic tenant and site data
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    let tenantId;
    
    if (tenantResult.rows.length === 0) {
      // Create a demo tenant
      const newTenant = await client.query(`
        INSERT INTO tenants (name, email, subscription_plan, active_users, max_users, active_sites, max_sites)
        VALUES ('Construction Safety Demo', 'demo@mysafety.com', 'premium', 1, 50, 1, 10)
        RETURNING id
      `);
      tenantId = newTenant.rows[0].id;
    } else {
      tenantId = tenantResult.rows[0].id;
    }
    
    // Ensure we have a site
    const siteResult = await client.query('SELECT id FROM sites WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    let siteId;
    
    if (siteResult.rows.length === 0) {
      const newSite = await client.query(`
        INSERT INTO sites (tenant_id, name, address, city, state, zip_code, country, contact_name, contact_phone)
        VALUES ($1, 'Main Construction Site', '123 Builder Ave', 'Construction City', 'CA', '90210', 'USA', 'Site Manager', '555-0123')
        RETURNING id
      `, [tenantId]);
      siteId = newSite.rows[0].id;
    } else {
      siteId = siteResult.rows[0].id;
    }
    
    // Get a user to assign as reporter
    const userResult = await client.query('SELECT id FROM users LIMIT 1');
    let userId;
    
    if (userResult.rows.length === 0) {
      const newUser = await client.query(`
        INSERT INTO users (tenant_id, username, email, password, first_name, last_name, role)
        VALUES ($1, 'safety_inspector', 'inspector@mysafety.com', 'hashed_password', 'Safety', 'Inspector', 'safety_officer')
        RETURNING id
      `, [tenantId]);
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }
    
    // Clear existing hazards for clean data
    await client.query('DELETE FROM hazard_reports WHERE tenant_id = $1', [tenantId]);
    
    // Insert hazard data
    for (const hazard of hazardData) {
      await client.query(`
        INSERT INTO hazard_reports (
          tenant_id, site_id, reported_by_id, title, description, location, 
          hazard_type, severity, status, recommended_action, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
      `, [
        tenantId, siteId, userId, hazard.title, hazard.description, 
        hazard.location, hazard.hazard_type, hazard.severity, 
        hazard.status, hazard.recommended_action
      ]);
    }
    
    console.log(`Successfully created ${hazardData.length} realistic hazard reports`);
    console.log('Hazard data includes:');
    console.log('- Critical safety issues (electrical, structural, confined space)');
    console.log('- Common construction hazards (falls, equipment, PPE)');
    console.log('- Environmental concerns (weather, chemical, air quality)');
    console.log('- Various status levels (open, assigned, in_progress, resolved)');
    console.log('- Realistic locations and actionable recommendations');
    
  } catch (error) {
    console.error('Error creating hazard data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createHazards();
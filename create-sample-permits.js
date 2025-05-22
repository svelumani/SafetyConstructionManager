import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as process from 'process';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sample permit data
const permitData = [
  // ACTIVE PERMITS
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 4,
    approver_id: 4,
    permit_type: "Electrical Work",
    title: "Main Electrical Panel Upgrade",
    description: "Upgrade of the main electrical panel in the North Tower basement to support additional power requirements for the new HVAC system. Work includes disconnecting the existing panel, installing a new 400A panel, and reconnecting all circuits.",
    location: "North Tower, Basement, Room B103",
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 4,
    approver_id: 4,
    permit_type: "Excavation",
    title: "Foundation Trenching for New Building Wing",
    description: "Excavation for foundation trenches for the new East Wing extension. Work involves digging trenches 2 meters deep along the marked perimeter. Heavy machinery will be in use.",
    location: "East Campus, Building 3 Extension Site",
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 4,
    approver_id: 4,
    permit_type: "Hot Work",
    title: "Welding for Structural Supports",
    description: "Welding operations to install structural steel supports in the new library addition. This work requires a fire watch due to nearby combustible materials.",
    location: "Main Library, North Addition, 2nd Floor",
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 6,
    approver_id: 4,
    permit_type: "Scaffold Installation",
    title: "Facade Restoration Scaffolding",
    description: "Erection of scaffolding on the west facade of the History Building for stone restoration work. Scaffold will be 5 levels high with protective netting and a pedestrian walkway below.",
    location: "History Building, West Facade",
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },

  // EXPIRING SOON PERMITS (within 7 days)
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 7,
    approver_id: 4,
    permit_type: "Plumbing",
    title: "Water Main Replacement",
    description: "Replacement of deteriorated water main pipes in the Science Complex. Work requires shutting off water to the building during non-business hours.",
    location: "Science Complex, Utility Tunnel A",
    start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 4,
    approver_id: 7,
    permit_type: "Confined Space Entry",
    title: "HVAC Duct Cleaning",
    description: "Entry into confined space ductwork for cleaning and disinfection of HVAC system. Work requires proper ventilation equipment and gas monitoring.",
    location: "Engineering Building, Mechanical Room 201",
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    status: "approved",
    approval_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 8,
    approver_id: 4,
    permit_type: "Roofing",
    title: "Gymnasium Roof Repair",
    description: "Repair of leaking areas on the gymnasium roof. Work includes replacing damaged shingles and fixing flashing around HVAC penetrations.",
    location: "Main Gymnasium, Roof Level",
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: "approved",
    approval_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  },

  // EXPIRED PERMITS
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 6,
    approver_id: 4,
    permit_type: "Demolition",
    title: "Interior Wall Removal",
    description: "Demolition of non-load bearing walls on the 3rd floor to create a larger open office space. Work includes dust containment and debris removal.",
    location: "Administration Building, 3rd Floor, West Wing",
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (expired)
    status: "expired",
    approval_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 7,
    approver_id: 4,
    permit_type: "Electrical Work",
    title: "Emergency Lighting Installation",
    description: "Installation of emergency lighting systems throughout the Art Building to meet fire code requirements. Work requires minor wiring modifications.",
    location: "Art Building, All Floors",
    start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    end_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (expired)
    status: "expired",
    approval_date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
  },

  // PENDING PERMITS
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 8,
    permit_type: "HVAC Installation",
    title: "New Laboratory Ventilation System",
    description: "Installation of a specialized ventilation system for the new chemistry laboratory. Work includes roof penetrations for exhaust stacks and new ductwork installation.",
    location: "Science Building, Room 405",
    start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "requested",
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 4,
    permit_type: "Concrete Pouring",
    title: "Sidewalk Replacement",
    description: "Replacement of damaged concrete sidewalks along the main campus promenade. Work includes removal of old concrete, forming, and pouring new concrete paths.",
    location: "Main Campus, Central Walkway",
    start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    status: "requested",
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 6,
    permit_type: "Structural",
    title: "Auditorium Seating Reinforcement",
    description: "Structural reinforcement of the main auditorium seating area. Work involves installing additional support beams beneath the tiered seating system.",
    location: "Performing Arts Center, Main Auditorium",
    start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    status: "requested",
  },
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 7,
    permit_type: "Excavation",
    title: "Underground Utilities Repair",
    description: "Excavation to access and repair damaged underground electrical conduits near the Student Center. Work requires careful hand digging around existing utilities.",
    location: "Student Center, South Lawn",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    status: "requested",
  },

  // DENIED PERMIT
  {
    tenant_id: 1,
    site_id: 1,
    requester_id: 8,
    approver_id: 4,
    permit_type: "Hot Work",
    title: "Cutting Steel Beams for Skylight",
    description: "Cutting of steel support beams to install a new skylight in the library roof. Work involves torch cutting of structural elements.",
    location: "Main Library, Central Reading Room",
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    status: "denied",
    approval_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    denial_reason: "Structural engineer assessment required before approval. Current plans potentially compromise building structural integrity."
  },
];

async function createPermits() {
  try {
    const client = await pool.connect();
    
    // First, clean up any existing permits to avoid duplicates
    await client.query('DELETE FROM permit_requests');

    console.log('Creating sample permits...');
    
    // Insert each permit
    for (const permit of permitData) {
      const query = `
        INSERT INTO permit_requests (
          tenant_id, site_id, requester_id, approver_id, permit_type, 
          title, description, location, start_date, end_date,
          status, approval_date, denial_reason, created_at, updated_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), true)
      `;
      
      const values = [
        permit.tenant_id,
        permit.site_id,
        permit.requester_id,
        permit.approver_id || null,
        permit.permit_type,
        permit.title,
        permit.description,
        permit.location,
        permit.start_date,
        permit.end_date,
        permit.status,
        permit.approval_date || null,
        permit.denial_reason || null
      ];
      
      await client.query(query, values);
      console.log(`Created permit: ${permit.title}`);
    }
    
    console.log('All sample permits created successfully!');
    client.release();
  } catch (error) {
    console.error('Error creating sample permits:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

createPermits().catch(console.error);
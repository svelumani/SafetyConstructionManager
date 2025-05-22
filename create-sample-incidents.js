// Script to create sample incidents for testing the incident management module
const { db } = require('./server/db');
const { sql } = require('drizzle-orm');

async function createIncidents() {
  console.log("Creating sample incidents...");

  try {
    // Get a tenant ID for the sample data
    const [tenant] = await db.execute(sql`SELECT id FROM tenants LIMIT 1`);
    if (!tenant || !tenant.rows.length) {
      console.error("No tenants found in the database");
      return;
    }
    const tenantId = tenant.rows[0].id;

    // Get some site IDs
    const siteResult = await db.execute(sql`SELECT id, name FROM sites WHERE tenant_id = ${tenantId} LIMIT 5`);
    if (!siteResult || !siteResult.rows.length) {
      console.error("No sites found for this tenant");
      return;
    }
    const sites = siteResult.rows;

    // Get some user IDs for reported_by field
    const userResult = await db.execute(sql`SELECT id, name FROM users WHERE tenant_id = ${tenantId} LIMIT 5`);
    if (!userResult || !userResult.rows.length) {
      console.error("No users found for this tenant");
      return;
    }
    const users = userResult.rows;

    // Prepare sample incidents data
    const sampleIncidents = [
      {
        title: "Worker Fall from Scaffold",
        description: "A worker fell approximately 6 feet from scaffold while installing drywall. The scaffold was missing proper guardrails.",
        incidentDate: new Date(2025, 4, 10, 9, 30),
        location: "Building A, 3rd Floor East Wing",
        incidentType: "Fall",
        severity: "major",
        status: "investigating",
        injuryOccurred: true,
        injuryDetails: "Worker sustained a sprained ankle and bruised shoulder. Treated at St. Mary's Hospital and released the same day with 3 days of restricted duty.",
        witnesses: "John Smith (Foreman), Maria Garcia (Safety Officer)",
        rootCause: "Improper scaffold assembly and missing guardrails. Pre-shift inspection was not conducted properly.",
        correctiveActions: "All scaffolds on site have been inspected and deficiencies corrected. Refresher training on scaffold safety conducted for all workers.",
        preventativeMeasures: "Implemented additional scaffold inspection checkpoints. Updated pre-shift inspection form with scaffold-specific items.",
        photoUrls: ["https://source.unsplash.com/random/800x600?construction,fall"]
      },
      {
        title: "Electrical Shock Incident",
        description: "Electrician received mild shock while working on a junction box that was incorrectly labeled as de-energized.",
        incidentDate: new Date(2025, 4, 15, 14, 45),
        location: "Building B, Electrical Room",
        incidentType: "Electrical",
        severity: "moderate",
        status: "reported",
        injuryOccurred: true,
        injuryDetails: "Mild electrical shock to right hand. Worker was evaluated on-site by first aid team, no further medical treatment required.",
        witnesses: "Robert Johnson (Lead Electrician)",
        photoUrls: ["https://source.unsplash.com/random/800x600?electrical,construction"]
      },
      {
        title: "Near Miss - Falling Object",
        description: "A hammer fell from the second floor, narrowly missing a worker below. No barricades were in place to prevent access to the area below overhead work.",
        incidentDate: new Date(2025, 4, 18, 11, 15),
        location: "Building A, Near South Entrance",
        incidentType: "Falling Object",
        severity: "critical",
        status: "investigating",
        injuryOccurred: false,
        witnesses: "David Lee (Carpenter), Sarah Williams (Project Manager)",
        correctiveActions: "Immediate stop-work called to secure all tools. Area below overhead work properly barricaded.",
        photoUrls: ["https://source.unsplash.com/random/800x600?construction,safety"]
      },
      {
        title: "Chemical Spill in Storage Area",
        description: "A 5-gallon container of concrete sealer was knocked over during inventory movement, resulting in a spill in the chemical storage area.",
        incidentDate: new Date(2025, 4, 21, 16, 30),
        location: "Main Storage Building, Chemical Section",
        incidentType: "Chemical Spill",
        severity: "minor",
        status: "resolved",
        injuryOccurred: false,
        rootCause: "Improper storage of chemical containers. Containers were stacked too high without proper securing mechanism.",
        correctiveActions: "Spill contained and cleaned up according to SDS procedures. Storage racks reorganized with proper securing mechanisms.",
        preventativeMeasures: "Updated chemical storage procedures. Conducted training on proper handling and storage of chemicals.",
        photoUrls: ["https://source.unsplash.com/random/800x600?chemical,spill"]
      },
      {
        title: "Equipment Malfunction - Tower Crane",
        description: "Tower crane experienced unexpected alarm and automatic shutdown during lifting operation. Load was safely lowered prior to shutdown.",
        incidentDate: new Date(2025, 4, 22, 10, 00),
        location: "Main Construction Area",
        incidentType: "Equipment Failure",
        severity: "major",
        status: "closed",
        injuryOccurred: false,
        rootCause: "Sensor malfunction in the crane's overload protection system triggered a false alarm.",
        correctiveActions: "Crane inspection conducted by certified technician. Faulty sensor replaced and system recalibrated.",
        preventativeMeasures: "Additional pre-operational checks added to daily crane inspection.",
        photoUrls: ["https://source.unsplash.com/random/800x600?crane,construction"]
      },
      {
        title: "Trench Collapse - Small Scale",
        description: "Partial collapse of soil in a 4-foot deep utility trench. No workers were in the trench at the time of collapse.",
        incidentDate: new Date(2025, 4, 8, 15, 20),
        location: "North Side of Site, Utility Installation Area",
        incidentType: "Collapse",
        severity: "moderate",
        status: "closed",
        injuryOccurred: false,
        rootCause: "Inadequate trench protection system for soil type. Recent rain had increased soil instability.",
        correctiveActions: "Trench work halted until proper shoring installed. Soil conditions reassessed by competent person.",
        preventativeMeasures: "Updated excavation plan to include more frequent soil assessments after weather events.",
        photoUrls: ["https://source.unsplash.com/random/800x600?trench,construction"]
      },
      {
        title: "Vehicle Accident - Delivery Truck",
        description: "Delivery truck backed into temporary fencing while attempting to turn around in staging area.",
        incidentDate: new Date(2025, 4, 16, 8, 45),
        location: "Materials Staging Area",
        incidentType: "Vehicle Accident",
        severity: "minor",
        status: "closed",
        injuryOccurred: false,
        rootCause: "Inadequate space for vehicle turning and insufficient guidance for delivery drivers.",
        correctiveActions: "Repaired damaged fencing. Repositioned material storage to create proper turning radius.",
        preventativeMeasures: "Implemented designated delivery routes with signage and added a spotter requirement for large vehicles.",
        photoUrls: ["https://source.unsplash.com/random/800x600?truck,construction"]
      },
      {
        title: "Heat Exhaustion Incident",
        description: "Worker displayed symptoms of heat exhaustion (dizziness, excessive sweating, nausea) while working on roof installation during unusually hot day.",
        incidentDate: new Date(2025, 4, 24, 13, 30),
        location: "Building C, Roof",
        incidentType: "Environmental",
        severity: "moderate",
        status: "reported",
        injuryOccurred: true,
        injuryDetails: "Worker was moved to cool rest area, provided water and electrolytes, and monitored until symptoms subsided. No further medical treatment required.",
        witnesses: "Team supervisor and two co-workers",
        photoUrls: ["https://source.unsplash.com/random/800x600?construction,hot"]
      }
    ];

    // Insert sample incidents
    for (const incident of sampleIncidents) {
      // Randomly select a site and user
      const site = sites[Math.floor(Math.random() * sites.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Convert the incident date to ISO string format
      const incidentDateStr = incident.incidentDate.toISOString();
      
      // Format any JSON fields
      const photoUrls = JSON.stringify(incident.photoUrls || []);
      
      // Insert the incident into the database
      await db.execute(sql`
        INSERT INTO incident_reports (
          tenant_id, site_id, reported_by_id, title, description, incident_date, location,
          incident_type, severity, status, injury_occurred, injury_details, witnesses,
          root_cause, corrective_actions, preventative_measures, photo_urls,
          created_at, updated_at, is_active
        ) VALUES (
          ${tenantId}, ${site.id}, ${user.id}, ${incident.title}, ${incident.description},
          ${incidentDateStr}, ${incident.location}, ${incident.incidentType}, ${incident.severity},
          ${incident.status}, ${incident.injuryOccurred}, 
          ${incident.injuryDetails || null}, ${incident.witnesses || null},
          ${incident.rootCause || null}, ${incident.correctiveActions || null},
          ${incident.preventativeMeasures || null}, ${photoUrls},
          NOW(), NOW(), true
        )
      `);
      
      console.log(`Created incident: ${incident.title}`);
    }
    
    console.log(`Successfully created ${sampleIncidents.length} sample incidents`);
  } catch (error) {
    console.error("Error creating sample incidents:", error);
  } finally {
    process.exit(0);
  }
}

createIncidents();
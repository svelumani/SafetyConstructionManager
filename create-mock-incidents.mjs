import { db } from './server/db.js';
import { eq, and } from 'drizzle-orm';
import { incidentReports, users, sites } from './shared/schema.js';

async function createMockIncidents() {
  try {
    console.log('Starting to create mock incidents...');
    
    // Get active tenant ID (assuming tenant ID 1 is active)
    const tenantId = 1;
    
    // Get active users from the database
    const activeUsers = await db.select({
      id: users.id,
      name: users.firstName
    })
    .from(users)
    .where(and(
      eq(users.tenantId, tenantId),
      eq(users.isActive, true)
    ));
    
    if (activeUsers.length === 0) {
      throw new Error('No active users found for the tenant');
    }
    
    // Get active sites from the database
    const activeSites = await db.select({
      id: sites.id,
      name: sites.name
    })
    .from(sites)
    .where(and(
      eq(sites.tenantId, tenantId),
      eq(sites.isActive, true)
    ));
    
    if (activeSites.length === 0) {
      throw new Error('No active sites found for the tenant');
    }
    
    console.log(`Found ${activeUsers.length} active users and ${activeSites.length} active sites`);
    
    // Define incident types
    const incidentTypes = [
      "Fall", "Slip/Trip", "Struck By", "Caught In/Between", "Electrical",
      "Chemical Spill", "Equipment Failure", "Vehicle Accident", "Fire/Explosion",
      "Environmental", "Security", "Other"
    ];
    
    // Define severity levels
    const severityLevels = ["minor", "moderate", "major", "critical"];
    
    // Define status options
    const statusOptions = ["reported", "investigating", "resolved", "closed"];
    
    // Define mock incident descriptions
    const descriptions = [
      "Worker fell from ladder while changing a light fixture. Ladder appeared to be properly set up but may have shifted during use.",
      "Chemical spill occurred in storage area. Approximately 2 gallons of paint thinner spilled. Area was contained and cleaned according to protocol.",
      "Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.",
      "Worker received minor cut on hand while using box cutter. First aid was administered on site.",
      "Electrical short in temporary wiring caused small fire. Fire was extinguished with nearby extinguisher. No structural damage.",
      "Worker slipped on wet floor where caution sign was not placed after mopping.",
      "Excavation wall partially collapsed during heavy rain. No workers were in the trench at the time.",
      "Subcontractor was not wearing proper PPE while operating cutting tool.",
      "Heavy equipment operator reported near-miss with pedestrian worker who entered operational zone without authorization.",
      "Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.",
      "Falling object struck protective helmet of worker below. Helmet prevented injury but incident highlighted the need for secured tools.",
      "Concrete mixer malfunctioned spraying material. Worker's eye protection prevented serious injury.",
      "Security breach reported at site entrance during night hours. No theft occurred but gate was found unsecured.",
      "Worker experienced heat exhaustion symptoms during afternoon work in high temperatures.",
      "Temporary railing failed when leaned on. No fall occurred but highlighted installation deficiency.",
      "Trip hazard identified where extension cords crossed walkway without proper covering.",
      "Worker reported respiratory irritation when working near recently painted area with inadequate ventilation.",
      "Scissor lift tipped slightly when extended on uneven surface. Operator followed safety protocol and prevented full tip-over.",
      "Delivery truck damaged property fence when backing up without spotter.",
      "Minor fire in break area when microwave malfunctioned. Smoke detected and fire extinguished quickly."
    ];
    
    // Define mock locations within sites
    const locations = [
      "North wing, 3rd floor", "Basement level", "South entrance", "East stairwell",
      "Roof access area", "Storage room B", "Main hallway", "Elevator shaft",
      "Parking structure, level 2", "Equipment yard", "West loading dock",
      "Scaffolding on north face", "Electrical room", "Concrete pouring zone",
      "Break area", "Material storage area", "Temporary office trailer",
      "Excavation site", "Exterior walkway", "Building foundation, southwest corner"
    ];
    
    // Generate random date within the last 3 months
    function getRandomDate() {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
    }
    
    // Helper to get random item from array
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    // Create 25 mock incidents
    const mockIncidents = [];
    
    for (let i = 0; i < 25; i++) {
      const randomUser = getRandomItem(activeUsers);
      const randomSite = getRandomItem(activeSites);
      const incidentType = getRandomItem(incidentTypes);
      const severity = getRandomItem(severityLevels);
      const description = getRandomItem(descriptions);
      const location = getRandomItem(locations);
      
      // Weight the status distribution to have more active incidents
      let status;
      const statusRand = Math.random();
      if (statusRand < 0.4) {
        status = "reported";
      } else if (statusRand < 0.7) {
        status = "investigating";
      } else if (statusRand < 0.9) {
        status = "resolved";
      } else {
        status = "closed";
      }
      
      const incidentDate = getRandomDate();
      
      // Generate random boolean for injury with higher chance of false
      const injuryOccurred = Math.random() < 0.3;
      
      // Only include injury details if injury occurred
      const injuryDetails = injuryOccurred ? 
        "Worker received " + (Math.random() < 0.7 ? "minor" : "moderate") + " injury. First aid administered and incident documented." : 
        null;
      
      // Create incident object
      const incident = {
        tenantId,
        siteId: randomSite.id,
        reportedById: randomUser.id,
        title: `${incidentType} incident at ${randomSite.name}`,
        description,
        incidentDate: incidentDate.toISOString(),
        location,
        incidentType,
        severity,
        status,
        injuryOccurred,
        injuryDetails,
        // Include root cause and corrective actions for resolved/closed incidents
        rootCause: ["resolved", "closed"].includes(status) ? 
          "Investigation determined that the incident was caused by " + 
          getRandomItem([
            "inadequate training", 
            "equipment failure", 
            "procedural gap", 
            "environmental factors",
            "human error",
            "lack of proper supervision",
            "defective materials",
            "inadequate maintenance"
          ]) : null,
        correctiveActions: ["resolved", "closed"].includes(status) ? 
          "Actions taken: " + 
          getRandomItem([
            "Additional training implemented", 
            "Equipment replaced and tested", 
            "Procedures updated and communicated", 
            "Environmental controls improved",
            "Supervision protocols enhanced",
            "New safety checklist implemented",
            "Maintenance schedule revised",
            "PPE requirements updated"
          ]) : null,
        preventativeMeasures: ["resolved", "closed"].includes(status) ? 
          "To prevent recurrence: " + 
          getRandomItem([
            "Regular safety training scheduled", 
            "Daily equipment inspections implemented", 
            "Improved signage installed", 
            "Enhanced monitoring process",
            "Revised work instructions distributed",
            "Additional safety equipment provided",
            "New barrier systems installed",
            "Regular safety audits scheduled"
          ]) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };
      
      mockIncidents.push(incident);
    }
    
    // Insert incidents into database
    const result = await db.insert(incidentReports).values(mockIncidents);
    
    console.log(`Successfully created ${mockIncidents.length} mock incidents`);
    return { success: true, count: mockIncidents.length };
  } catch (error) {
    console.error('Error creating mock incidents:', error);
    return { success: false, error: error.message };
  }
}

// Run the function
createMockIncidents()
  .then(result => {
    if (result.success) {
      console.log(`Created ${result.count} mock incidents successfully!`);
      process.exit(0);
    } else {
      console.error(`Failed to create mock incidents: ${result.error}`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
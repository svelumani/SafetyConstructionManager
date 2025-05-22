const incidentTypes = [
  "Fall", "Slip/Trip", "Struck By", "Caught In/Between", "Electrical",
  "Chemical Spill", "Equipment Failure", "Vehicle Accident", "Fire/Explosion",
  "Environmental", "Security", "Other"
];

const severityLevels = ["minor", "moderate", "major", "critical"];
const statuses = ["reported", "investigating", "resolved", "closed"];

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
  "Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water."
];

const locations = [
  "North wing, 3rd floor", "Basement level", "South entrance", "East stairwell",
  "Roof access area", "Storage room B", "Main hallway", "Elevator shaft",
  "Parking structure, level 2", "Equipment yard", "West loading dock",
  "Scaffolding on north face", "Electrical room", "Concrete pouring zone"
];

// Function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to generate random date within the last 3 months
function getRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
}

// Actual users from database
const users = [
  { id: 4, name: "Shyam Kumar" },
  { id: 6, name: "Team Member 1" },
  { id: 7, name: "Team Member 2" },
  { id: 8, name: "Team Member 3" },
  { id: 13, name: "Supervisor 1" },
  { id: 14, name: "Supervisor 2" },
  { id: 16, name: "Safety Officer 1" }
];

// Actual sites from database
const sites = [
  { id: 1, name: "Harvard university campus 1" }
];

// Generate the SQL for incident creation
console.log("-- SQL to insert mock incidents");
console.log("BEGIN;");

for (let i = 1; i <= 25; i++) {
  const user = getRandomItem(users);
  const site = getRandomItem(sites);
  const incidentType = getRandomItem(incidentTypes);
  const severity = getRandomItem(severityLevels);
  const status = getRandomItem(statuses);
  const description = getRandomItem(descriptions);
  const location = getRandomItem(locations);
  const incidentDate = getRandomDate().toISOString();
  const injuryOccurred = Math.random() < 0.3;
  const title = `${incidentType} incident at ${site.name}`;
  
  let sql = `INSERT INTO incident_reports (
    tenant_id, 
    site_id, 
    reported_by_id, 
    title, 
    description, 
    incident_date, 
    location, 
    incident_type, 
    severity, 
    status, 
    injury_occurred, 
    injury_details,
    root_cause,
    corrective_actions,
    preventative_measures,
    created_at, 
    updated_at, 
    is_active
  ) VALUES (
    1, 
    ${site.id}, 
    ${user.id}, 
    '${title.replace(/'/g, "''")}', 
    '${description.replace(/'/g, "''")}', 
    '${incidentDate}', 
    '${location.replace(/'/g, "''")}', 
    '${incidentType.replace(/'/g, "''")}', 
    '${severity}', 
    '${status}', 
    ${injuryOccurred}, 
    ${injuryOccurred ? "'Worker received minor injury requiring first aid.'" : 'NULL'},`;
    
  // Root cause, corrective actions, and preventative measures for resolved/closed incidents
  if (status === 'resolved' || status === 'closed') {
    sql += `
    'Investigation determined that the incident was caused by ${getRandomItem(["inadequate training", "equipment failure", "procedural gap", "environmental factors"])}',
    'Actions taken: ${getRandomItem(["Additional training implemented", "Equipment replaced", "Procedures updated", "Environmental controls improved"])}',
    'To prevent recurrence: ${getRandomItem(["Regular safety training scheduled", "Daily equipment inspections", "Improved signage installed", "Enhanced monitoring process"])}',`;
  } else {
    sql += `
    NULL,
    NULL,
    NULL,`;
  }
  
  sql += `
    NOW(), 
    NOW(), 
    true
  );`;
  
  console.log(sql);
}

console.log("COMMIT;");
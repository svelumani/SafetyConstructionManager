import pg from 'pg';
const { Client } = pg;

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

async function createMockCourses() {
  const client = new Client(dbConfig);
  await client.connect();

  try {
    console.log('Connected to database');
    
    // Get active tenant ID
    const tenantResult = await client.query('SELECT id FROM tenants WHERE is_active = true LIMIT 1');
    if (tenantResult.rows.length === 0) {
      throw new Error('No active tenants found');
    }
    const tenantId = tenantResult.rows[0].id;
    console.log(`Using tenant ID: ${tenantId}`);
    
    // Get active users from this tenant
    const usersResult = await client.query('SELECT id, role FROM users WHERE tenant_id = $1 AND is_active = true', [tenantId]);
    if (usersResult.rows.length === 0) {
      throw new Error('No active users found for this tenant');
    }
    
    // Get a safety officer or admin user for creating the courses
    const safetyOfficers = usersResult.rows.filter(user => user.role === 'safety_officer' || user.role === 'super_admin');
    const creatorId = safetyOfficers.length > 0 
                      ? safetyOfficers[0].id 
                      : usersResult.rows[0].id;
    
    console.log(`Using creator ID: ${creatorId}`);
    
    // Get active sites
    const sitesResult = await client.query('SELECT id FROM sites WHERE tenant_id = $1 AND is_active = true', [tenantId]);
    const siteIds = sitesResult.rows.map(site => site.id);
    
    console.log(`Found ${siteIds.length} active sites`);
    
    // Course categories and types
    const courseTypes = [
      { title: 'Fall Protection Training', required: true, category: 'safety' },
      { title: 'Confined Space Entry', required: true, category: 'safety' },
      { title: 'Scaffolding Safety', required: true, category: 'safety' },
      { title: 'Electrical Safety', required: true, category: 'safety' },
      { title: 'Fire Prevention and Protection', required: true, category: 'safety' },
      { title: 'Hazard Communication', required: true, category: 'safety' },
      { title: 'Personal Protective Equipment', required: true, category: 'safety' },
      { title: 'Heavy Equipment Operation', required: true, category: 'operations' },
      { title: 'Crane Safety and Operation', required: true, category: 'operations' },
      { title: 'Excavation and Trenching Safety', required: true, category: 'safety' },
      { title: 'First Aid and CPR', required: true, category: 'emergency' },
      { title: 'Ladder Safety', required: false, category: 'safety' },
      { title: 'Hand and Power Tool Safety', required: false, category: 'safety' },
      { title: 'Material Handling', required: false, category: 'operations' },
      { title: 'Noise and Hearing Conservation', required: false, category: 'health' },
      { title: 'Respiratory Protection', required: false, category: 'health' },
      { title: 'Hot Work and Welding Safety', required: false, category: 'operations' },
      { title: 'Defensive Driving', required: false, category: 'transportation' },
      { title: 'Emergency Response Plan', required: true, category: 'emergency' },
      { title: 'Environmental Awareness', required: false, category: 'environment' },
      { title: 'Workplace Violence Prevention', required: false, category: 'workplace' },
      { title: 'Drug and Alcohol Awareness', required: false, category: 'workplace' },
      { title: 'Ergonomics for Construction', required: false, category: 'health' },
      { title: 'Silica Dust Safety', required: true, category: 'health' },
      { title: 'Lead Safety', required: true, category: 'health' },
      { title: 'Asbestos Awareness', required: true, category: 'health' },
      { title: 'Concrete Safety', required: false, category: 'operations' },
      { title: 'Demolition Safety', required: true, category: 'operations' },
      { title: 'Lock-Out/Tag-Out Procedures', required: true, category: 'safety' },
      { title: 'Working in Extreme Weather', required: false, category: 'health' }
    ];
    
    // Descriptions for the courses
    const descriptions = [
      'Learn essential safety procedures to prevent falls when working at heights. This course covers proper use of harnesses, fall arrest systems, safety nets, and guardrails according to OSHA requirements.',
      'Comprehensive training on identifying hazards, testing air quality, and safely working in confined spaces. Includes emergency response procedures and required PPE.',
      'Detailed instruction on building, inspecting, and working safely on scaffolds. Covers load capacities, fall protection, and scaffold types.',
      'Safety training for working with electrical systems and equipment. Covers lockout/tagout procedures, arc flash protection, and electrical hazard identification.',
      'Essential training on fire prevention, fire classes, extinguisher use, and emergency evacuation procedures specific to construction sites.',
      'Overview of the Hazard Communication Standard (HazCom), GHS labels, safety data sheets, and chemical safety in construction environments.',
      'Comprehensive training on selection, use, inspection, and maintenance of personal protective equipment including head, eye, hearing, respiratory, hand, and foot protection.',
      'Operating procedures and safety protocols for excavators, backhoes, bulldozers, and other heavy construction equipment.',
      'Detailed training on crane operation, signaling, load calculation, inspection, and set-up requirements.',
      'Safety procedures for excavation activities, soil classification, protective systems, and trench collapse prevention.',
      'Basic first aid procedures, CPR techniques, and AED use specific to construction site emergencies.',
      'Proper selection, inspection, and use of portable and fixed ladders to prevent falls and injuries.',
      'Safe operation and maintenance of common hand and power tools used in construction.',
      'Proper techniques for manually handling materials and using material handling equipment to prevent injuries.',
      'Understanding noise hazards on construction sites and implementing hearing protection measures.',
      'Selection, use, and maintenance of respiratory protection equipment for construction environments.',
      'Safety procedures for welding, cutting, and other hot work operations on construction sites.',
      'Safe driving techniques for construction vehicles and equipment in and around work zones.',
      'Procedures for responding to various emergencies including medical incidents, fires, severe weather, and evacuations.',
      'Preventing environmental damage and understanding regulatory requirements for construction activities.',
      'Recognizing, avoiding, and reporting potential workplace violence situations on construction sites.',
      'Understanding substance abuse impacts, company policies, and testing procedures in construction environments.',
      'Preventing musculoskeletal injuries through proper body mechanics and workstation design in construction.',
      'Protection measures against respirable crystalline silica exposure during concrete, masonry, and stone work.',
      'Identifying lead hazards in construction and implementing proper control measures and work practices.',
      'Recognizing asbestos-containing materials and understanding proper procedures when encountering them.',
      'Safety procedures specific to concrete pouring, finishing, and form work operations.',
      'Safe practices for demolition operations including engineering surveys, bracing, and debris removal.',
      'Comprehensive training on energy control procedures to prevent accidental equipment startup during maintenance.',
      'Safety protocols for working in extreme heat, cold, and severe weather conditions.'
    ];
    
    // Create an array of mock content IDs (assuming content would be created separately)
    const contentSets = [
      [1, 2],
      [3, 4],
      [5, 6, 7],
      [8, 9],
      [10, 11, 12, 13],
      [14, 15],
      [16, 17],
      [18, 19, 20],
      [21, 22, 23],
      [24, 25]
    ];
    
    // User roles combinations for course assignments
    const roleCombinations = [
      ['employee', 'supervisor', 'safety_officer'],
      ['employee', 'supervisor'],
      ['employee'],
      ['supervisor', 'safety_officer'],
      ['employee', 'safety_officer'],
      ['supervisor'],
      ['safety_officer'],
      ['employee', 'supervisor', 'safety_officer', 'subcontractor'],
      ['employee', 'supervisor', 'subcontractor'],
      ['supervisor', 'subcontractor']
    ];
    
    // Date generation for created timestamps
    function getRandomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    }
    
    const startDate = new Date(2024, 0, 1); // Jan 1, 2024
    const endDate = new Date(); // Today
    
    // Generate and insert 25 courses
    const coursesToCreate = Math.min(25, courseTypes.length);
    
    for (let i = 0; i < coursesToCreate; i++) {
      const courseType = courseTypes[i];
      const description = descriptions[i % descriptions.length];
      const passingScore = Math.floor(Math.random() * 20) + 70; // 70-90
      const isRequired = courseType.required;
      const assignedRoles = JSON.stringify(roleCombinations[i % roleCombinations.length]);
      const contentIds = JSON.stringify(contentSets[i % contentSets.length]);
      const createdAt = getRandomDate(startDate, endDate);
      const updatedAt = createdAt;
      
      // Optional assignment to sites
      let assignedSiteIds = null;
      if (siteIds.length > 0 && Math.random() > 0.3) {
        const numSites = Math.min(Math.floor(Math.random() * siteIds.length) + 1, siteIds.length);
        const selectedSites = [...siteIds].sort(() => 0.5 - Math.random()).slice(0, numSites);
        assignedSiteIds = JSON.stringify(selectedSites);
      }
      
      const query = `
        INSERT INTO training_courses (
          tenant_id, title, description, passing_score, is_required, 
          assigned_roles, assigned_site_ids, content_ids, created_by_id, 
          created_at, updated_at, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `;
      
      const values = [
        tenantId,
        courseType.title,
        description,
        passingScore,
        isRequired,
        assignedRoles,
        assignedSiteIds,
        contentIds,
        creatorId,
        createdAt,
        updatedAt,
        true
      ];
      
      await client.query(query, values);
      console.log(`Created course: ${courseType.title}`);
    }
    
    console.log(`Successfully created ${coursesToCreate} mock training courses`);
    
    // Also create mock training content to support the courses
    const contentTypes = ['video', 'document'];
    const languages = ['en', 'es', 'fr'];
    const contentTitles = [
      'Introduction and Safety Basics',
      'Required Equipment and Usage',
      'Hazard Recognition and Assessment',
      'Proper Procedures and Protocols',
      'Emergency Response',
      'Hands-on Demonstration',
      'Case Studies and Examples',
      'Legal Requirements and Standards',
      'Testing and Certification Process',
      'Refresher and Updates',
      'Advanced Techniques',
      'Troubleshooting Common Issues',
      'Supervisor Responsibilities',
      'Documentation Requirements',
      'Best Practices Review'
    ];
    
    // First create some general training content
    for (let i = 0; i < 25; i++) {
      const title = contentTitles[i % contentTitles.length];
      const description = `Training module covering ${title.toLowerCase()}`;
      const contentType = contentTypes[i % contentTypes.length];
      
      let videoId = null;
      let documentUrl = null;
      
      if (contentType === 'video') {
        // Mock YouTube video IDs
        const videoIds = [
          'dQw4w9WgXcQ', 'LXb3EKWsInQ', '6Q3uaSnRGtI', 'mJR-ClYZ1wQ',
          'Ksz-K-eTrgY', 'OGHfZKMRsK8', 'X9e1kpCZ0EA', 'ZCJvMV3j8YM'
        ];
        videoId = videoIds[i % videoIds.length];
      } else {
        documentUrl = `https://example.com/training/document${i + 1}.pdf`;
      }
      
      const language = languages[i % languages.length];
      const duration = (Math.floor(Math.random() * 20) + 5) * 60; // 5-25 minutes in seconds
      const createdAt = getRandomDate(startDate, endDate);
      
      const query = `
        INSERT INTO training_content (
          tenant_id, title, description, content_type, video_id, 
          document_url, language, duration, created_by_id, 
          created_at, updated_at, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `;
      
      const values = [
        tenantId,
        title,
        description,
        contentType,
        videoId,
        documentUrl,
        language,
        duration,
        creatorId,
        createdAt,
        createdAt, // updatedAt same as createdAt
        true
      ];
      
      await client.query(query, values);
      console.log(`Created training content: ${title}`);
    }
    
    console.log('Successfully created mock training content');

    // Create some training records for the courses
    // Get users to assign training records to
    const allUsers = usersResult.rows;
    
    // Get courses we just created
    const coursesResult = await client.query('SELECT id FROM training_courses WHERE tenant_id = $1', [tenantId]);
    const courseIds = coursesResult.rows.map(course => course.id);
    
    // Create training records with varying completion status
    const totalRecords = Math.min(50, allUsers.length * courseIds.length); // Limit to 50 records
    
    for (let i = 0; i < totalRecords; i++) {
      const userId = allUsers[i % allUsers.length].id;
      const courseId = courseIds[Math.floor(i / allUsers.length) % courseIds.length];
      
      // Vary completion status
      const completionStatus = Math.random();
      const startDate = getRandomDate(new Date(2024, 0, 1), new Date());
      let completionDate = null;
      let passed = null;
      let score = null;
      let lastContentId = null;
      
      if (completionStatus > 0.7) {
        // Completed and passed
        completionDate = new Date(new Date(startDate).getTime() + (1000 * 60 * 60 * 24 * (Math.random() * 30 + 1))).toISOString();
        passed = true;
        score = Math.floor(Math.random() * 20) + 80; // 80-100
        lastContentId = Math.floor(Math.random() * 20) + 1;
      } else if (completionStatus > 0.4) {
        // In progress
        passed = null;
        score = null;
        completionDate = null;
        lastContentId = Math.floor(Math.random() * 10) + 1;
      } else {
        // Just assigned
        passed = null;
        score = null;
        completionDate = null;
        lastContentId = null;
      }
      
      const query = `
        INSERT INTO training_records (
          tenant_id, user_id, course_id, start_date, completion_date,
          passed, score, last_content_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `;
      
      const values = [
        tenantId,
        userId,
        courseId,
        startDate,
        completionDate,
        passed,
        score,
        lastContentId,
        startDate, // createdAt
        completionDate || startDate // updatedAt
      ];
      
      await client.query(query, values);
      console.log(`Created training record for user ${userId}, course ${courseId}`);
    }
    
    console.log(`Successfully created ${totalRecords} mock training records`);
    
  } catch (error) {
    console.error('Error creating mock training data:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createMockCourses()
  .then(() => console.log('Script completed successfully'))
  .catch(err => console.error('Script failed:', err));
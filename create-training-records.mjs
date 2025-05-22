import pg from 'pg';
const { Client } = pg;

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

async function createTrainingRecords() {
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
    
    // Get all active users from tenant
    const allUsersResult = await client.query('SELECT id FROM users WHERE tenant_id = $1 AND is_active = true', [tenantId]);
    const userIds = allUsersResult.rows.map(user => user.id);
    console.log(`Found ${userIds.length} active users`);
    
    // Get all courses we created
    const coursesResult = await client.query('SELECT id FROM training_courses WHERE tenant_id = $1', [tenantId]);
    const courseIds = coursesResult.rows.map(course => course.id);
    console.log(`Found ${courseIds.length} courses`);
    
    // Function to get random date in the past year
    function getRandomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    }
    
    const recordStartDate = new Date(2024, 0, 1); // Jan 1, 2024
    const recordEndDate = new Date(); // Today
    
    // Create a varied set of training records
    // Some users will have completed courses, some will be in progress, some will be just assigned
    let recordsCreated = 0;
    
    for (const userId of userIds) {
      // Assign a random subset of courses to this user
      const numCourses = Math.min(Math.floor(Math.random() * courseIds.length) + 1, 10);
      const shuffledCourses = [...courseIds].sort(() => 0.5 - Math.random());
      const selectedCourses = shuffledCourses.slice(0, numCourses);
      
      for (const courseId of selectedCourses) {
        const statusRandom = Math.random();
        const startDate = getRandomDate(recordStartDate, recordEndDate);
        let completionDate = null;
        let passed = null;
        let score = null;
        let lastContentId = null;
        
        if (statusRandom > 0.6) {
          // Completed course
          completionDate = new Date(new Date(startDate).getTime() + (1000 * 60 * 60 * 24 * (Math.random() * 30 + 1))).toISOString();
          passed = Math.random() > 0.2; // 80% chance of passing
          score = passed ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 50;
          
          // Get a random content ID from the course
          const courseContentResult = await client.query('SELECT content_ids FROM training_courses WHERE id = $1', [courseId]);
          if (courseContentResult.rows.length > 0 && courseContentResult.rows[0].content_ids && courseContentResult.rows[0].content_ids.length > 0) {
            const courseContentIds = courseContentResult.rows[0].content_ids;
            lastContentId = courseContentIds[courseContentIds.length - 1]; // Last content ID
          }
        } 
        else if (statusRandom > 0.3) {
          // In progress
          completionDate = null;
          passed = null;
          score = null;
          
          // Get a random content ID from the course as "in progress"
          const courseContentResult = await client.query('SELECT content_ids FROM training_courses WHERE id = $1', [courseId]);
          if (courseContentResult.rows.length > 0 && courseContentResult.rows[0].content_ids && courseContentResult.rows[0].content_ids.length > 0) {
            const courseContentIds = courseContentResult.rows[0].content_ids;
            const progressIndex = Math.floor(Math.random() * (courseContentIds.length - 1));
            lastContentId = courseContentIds[progressIndex]; // Some content in the middle
          }
        }
        
        const query = `
          INSERT INTO training_records (
            tenant_id, user_id, course_id, start_date, completion_date,
            passed, score, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
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
          startDate, // createdAt
          completionDate || startDate // updatedAt
        ];
        
        await client.query(query, values);
        recordsCreated++;
      }
    }
    
    console.log(`Successfully created ${recordsCreated} training records for ${userIds.length} users`);
    
  } catch (error) {
    console.error('Error creating mock training records:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createTrainingRecords()
  .then(() => console.log('Training records script completed successfully'))
  .catch(err => console.error('Script failed:', err));
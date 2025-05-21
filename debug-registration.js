const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        phone: "1234567890",
        jobTitle: "Safety Officer",
        username: "testuser",
        tenant: {
          name: "Test Company",
          email: "company@example.com",
          phone: "1234567890",
          address: "123 Main St"
        }
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();

// Simple API test
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('Health check OK:', health.data.status);
    
    // Test login with actual demo credentials
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    
    console.log('Login successful for:', login.data.user.full_name);
    console.log('Token received:', !!login.data.token);
    
    // Test with token
    const config = { headers: { 'Authorization': `Bearer ${login.data.token}` } };
    const profile = await axios.get('http://localhost:5000/api/auth/profile', config);
    console.log('Profile retrieved:', profile.data.full_name);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
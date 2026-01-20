const axios = require('axios');

async function testRealUser() {
  try {
    console.log('🧪 Testing with real Supabase user...\n');
    
    // Test login with John Doe
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful for:', login.data.user.fullName);
    console.log('   Family:', login.data.user.familyAccountName);
    console.log('   Token received:', !!login.data.token);
    
    // Test with token
    const config = { headers: { 'Authorization': `Bearer ${login.data.token}` } };
    const profile = await axios.get('http://localhost:5000/api/auth/profile', config);
    console.log('✅ Profile retrieved:', profile.data.fullName);
    console.log('   Family:', profile.data.familyAccountName);
    
    console.log('\n🎉 Real user authentication working perfectly!');
    
  } catch (error) {
    console.error('❌ Real user test failed:', error.response?.data || error.message);
  }
}

testRealUser();
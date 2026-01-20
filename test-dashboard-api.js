const axios = require('axios');

async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Dashboard API endpoints...\n');
    
    // First login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    
    // Test dashboard overview
    console.log('\n2️⃣ Testing Dashboard Overview...');
    const overviewResponse = await axios.get('http://localhost:5000/api/reports/dashboard-overview', config);
    console.log('✅ Dashboard Overview:', overviewResponse.data);
    
    // Test recent transactions
    console.log('\n3️⃣ Testing Recent Transactions...');
    const recentResponse = await axios.get('http://localhost:5000/api/reports/recent-activity', config);
    console.log('✅ Recent Transactions count:', recentResponse.data.transactions.length);
    
    // Test categories
    console.log('\n4️⃣ Testing Categories...');
    const categoriesResponse = await axios.get('http://localhost:5000/api/categories/default', config);
    console.log('✅ Categories count:', categoriesResponse.data.categories.length);
    
    console.log('\n🎉 All Dashboard API tests passed!');
    console.log('📊 Ready to connect frontend to real backend data!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testDashboardAPI();
// System health check
const axios = require('axios');

async function systemCheck() {
  console.log('🔍 Performing system health check...\n');
  
  try {
    // Check backend health
    console.log('📡 Checking backend health...');
    const health = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Backend: OK -', health.data.message);
    
    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const login = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('✅ Login: SUCCESS - Token received');
    
    // Test protected route
    console.log('\n🔒 Testing protected routes...');
    const config = { headers: { 'Authorization': `Bearer ${login.data.token}` } };
    const profile = await axios.get('http://localhost:5001/api/auth/profile', config);
    console.log('✅ Profile: SUCCESS - User:', profile.data.fullName);
    
    // Test various API endpoints
    console.log('\n📊 Testing API endpoints...');
    
    // Test quick stats
    const stats = await axios.get('http://localhost:5001/api/reports/quick-stats', config);
    console.log('✅ Quick Stats: SUCCESS - Transactions:', stats.data.total_transactions);
    
    // Test recent transactions
    const recent = await axios.get('http://localhost:5001/api/transactions/recent', config);
    console.log('✅ Recent Transactions: SUCCESS - Count:', recent.data.transactions.length);
    
    // Test budgets
    const budgets = await axios.get('http://localhost:5001/api/budgets', config);
    console.log('✅ Budgets: SUCCESS - Count:', budgets.data.budgetLimits.length);
    
    console.log('\n🎉 ALL SYSTEM CHECKS PASSED!');
    console.log('✅ Backend is running on port 5001');
    console.log('✅ Database connection is working');
    console.log('✅ Authentication is functional');
    console.log('✅ All API endpoints are responding');
    
  } catch (error) {
    console.error('❌ System check failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

systemCheck();
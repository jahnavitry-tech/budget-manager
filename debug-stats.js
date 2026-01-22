// Debug quick stats issue
const axios = require('axios');

async function debugQuickStats() {
  try {
    console.log('🔍 Debugging quick stats issue...\n');
    
    // Login first
    const login = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('User family account ID:', login.data.user.familyAccountId);
    
    // Test quick stats with detailed error
    const config = { headers: { 'Authorization': `Bearer ${login.data.token}` } };
    
    try {
      const stats = await axios.get('http://localhost:5001/api/reports/quick-stats', config);
      console.log('✅ Quick stats worked:', stats.data);
    } catch (error) {
      console.log('❌ Quick stats failed:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message);
      console.log('Full error:', error.response?.data);
    }
    
    // Test individual queries that quick stats runs
    console.log('\n🔍 Testing individual database queries...');
    
    // Test 1: Transactions count
    try {
      const transactions = await axios.get('http://localhost:5001/api/transactions/recent', config);
      console.log('✅ Recent transactions count:', transactions.data.transactions.length);
    } catch (error) {
      console.log('❌ Recent transactions failed:', error.response?.data?.message);
    }
    
    // Test 2: Categories count
    try {
      const categories = await axios.get('http://localhost:5001/api/categories', config);
      console.log('✅ Categories count:', categories.data.categories.length);
    } catch (error) {
      console.log('❌ Categories failed:', error.response?.data?.message);
    }
    
    // Test 3: Budgets count
    try {
      const budgets = await axios.get('http://localhost:5001/api/budgets', config);
      console.log('✅ Budgets count:', budgets.data.budgetLimits.length);
    } catch (error) {
      console.log('❌ Budgets failed:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugQuickStats();
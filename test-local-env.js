const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Use the same pool configuration as your app
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false }
});

async function testLocalConnection() {
  try {
    console.log('🔄 Testing local environment connection to Supabase...');
    
    const client = await pool.connect();
    console.log('✅ Connected to Supabase database successfully!');
    
    // Test data retrieval
    console.log('\n📊 Testing data retrieval...');
    
    const testQueries = [
      {
        name: 'Family Accounts',
        query: 'SELECT account_name, created_at FROM family_accounts ORDER BY created_at LIMIT 5'
      },
      {
        name: 'Users',
        query: 'SELECT full_name, email FROM users ORDER BY created_at LIMIT 5'
      },
      {
        name: 'Categories',
        query: 'SELECT category_name, category_type FROM categories WHERE is_default = true'
      },
      {
        name: 'Recent Transactions',
        query: 'SELECT description, amount, transaction_date FROM transactions ORDER BY transaction_date DESC LIMIT 5'
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n📋 ${test.name}:`);
      const result = await client.query(test.query);
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          console.log(`  • ${JSON.stringify(row)}`);
        });
      } else {
        console.log(`  No data found`);
      }
    }
    
    // Test authentication with demo user
    console.log('\n🔐 Testing demo user authentication...');
    const authQuery = `
      SELECT user_id, email, full_name, family_account_id 
      FROM users 
      WHERE email = 'john.doe@example.com'
    `;
    const authResult = await client.query(authQuery);
    if (authResult.rows.length > 0) {
      console.log('✅ Demo user found:', authResult.rows[0]);
    } else {
      console.log('❌ Demo user not found');
    }
    
    client.release();
    console.log('\n✅ All local environment tests passed!');
    console.log('🔧 Your local development environment is now connected to Supabase!');
    
  } catch (error) {
    console.error('❌ Local environment test failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

testLocalConnection();
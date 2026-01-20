const { Pool } = require('pg');

// Supabase Session Pooler connection
const pool = new Pool({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xwauuamnpcaxaneiclnx',
  password: 'ChandanaShree@97',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📋 PostgreSQL Version:', result.rows[0].version);
    
    client.release();
    
    console.log('✅ Connection test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

testConnection();
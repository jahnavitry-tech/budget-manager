const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase Session Pooler connection
const pool = new Pool({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xwauuamnpcaxaneiclnx',
  password: 'ChandanaShree@97',
  ssl: { rejectUnauthorized: false }
});

async function cleanDeployDatabase() {
  try {
    console.log('🚀 Starting clean database deployment...');
    
    const client = await pool.connect();
    
    // Drop existing tables in reverse order to avoid dependency issues
    console.log('🧹 Cleaning existing tables...');
    const dropTables = [
      'DROP TABLE IF EXISTS annual_summaries CASCADE',
      'DROP TABLE IF EXISTS monthly_summaries CASCADE',
      'DROP TABLE IF EXISTS budget_limits CASCADE',
      'DROP TABLE IF EXISTS transactions CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS family_accounts CASCADE'
    ];
    
    for (const dropQuery of dropTables) {
      await client.query(dropQuery);
    }
    console.log('✅ Existing tables dropped successfully!');
    
    // Read and execute fixed schema file
    console.log('1️⃣ Deploying database schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema-fixed.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema deployed successfully!');
    
    // Read and execute test data file
    console.log('2️⃣ Inserting test data...');
    const testDataSql = fs.readFileSync(path.join(__dirname, 'database', 'test_data.sql'), 'utf8');
    await client.query(testDataSql);
    console.log('✅ Test data inserted successfully!');
    
    // Verify deployment
    console.log('3️⃣ Verifying deployment...');
    const verificationQuery = `
      SELECT 'Family Accounts' as table_name, COUNT(*) as record_count FROM family_accounts
      UNION ALL
      SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
      UNION ALL
      SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories
      UNION ALL
      SELECT 'Transactions' as table_name, COUNT(*) as record_count FROM transactions
      UNION ALL
      SELECT 'Budget Limits' as table_name, COUNT(*) as record_count FROM budget_limits
      UNION ALL
      SELECT 'Monthly Summaries' as table_name, COUNT(*) as record_count FROM monthly_summaries
      UNION ALL
      SELECT 'Annual Summaries' as table_name, COUNT(*) as record_count FROM annual_summaries
      ORDER BY table_name;
    `;
    
    const result = await client.query(verificationQuery);
    console.log('\n📊 Deployment Verification Results:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_name}: ${row.record_count} records`);
    });
    
    client.release();
    console.log('\n✅ Database deployment completed successfully!');
    console.log('🔗 Connected via Session Pooler (IPv4 compatible)');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

cleanDeployDatabase();
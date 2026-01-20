const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Export both the pool and a connect function
const connectDB = async () => {
  try {
    // Check if we have Supabase credentials configured
    if (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) {
      // Supabase: Connect to production database
      console.log('Connecting to Supabase database...');
      // Test connection
      const client = await pool.connect();
      client.release();
      console.log('Successfully connected to Supabase database');
      return pool;
    } else {
      // Development: Use in-memory data
      console.log('Database connection skipped for demo - using in-memory data');
      return pool;
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = { pool, connectDB };
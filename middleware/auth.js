const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle demo user
    if (decoded.userId === 'demo-user-id-123') {
      req.user = {
        user_id: 'demo-user-id-123',
        email: 'user@example.com',
        full_name: 'Demo User',
        family_account_id: 'demo-family-id-123',
        is_active: true
      };
      return next();
    }
    
    // Verify real user exists and is active
    const userResult = await pool.query(
      'SELECT user_id, email, full_name, family_account_id, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = { authenticateToken };
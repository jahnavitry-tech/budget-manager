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
        userId: 'demo-user-id-123',
        email: 'user@example.com',
        fullName: 'Demo User',
        family_account_id: '11111111-1111-1111-1111-111111111111'
      };
      return next();
    }
    
    // Verify real user exists and is active
    const userResult = await pool.query(
      'SELECT user_id, email, full_name, family_account_id FROM users WHERE user_id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Map database fields to expected format
    req.user = {
      userId: userResult.rows[0].user_id,
      email: userResult.rows[0].email,
      fullName: userResult.rows[0].full_name,
      family_account_id: userResult.rows[0].family_account_id
    };
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
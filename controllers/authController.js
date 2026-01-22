const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register new user
const registerUser = async (req, res) => {
  try {
    const { email, password, confirmPassword, fullName, accountName, isJoiningFamily } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let familyAccountId;
    let userId;

    if (isJoiningFamily) {
      // Join existing family account
      const familyAccount = await pool.query(
        'SELECT family_account_id FROM family_accounts WHERE account_name = $1',
        [accountName]
      );

      if (familyAccount.rows.length === 0) {
        return res.status(400).json({ message: 'Family account not found' });
      }

      familyAccountId = familyAccount.rows[0].family_account_id;

      // Create user
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, full_name, family_account_id) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [email, hashedPassword, fullName, familyAccountId]
      );

      userId = newUser.rows[0].user_id;
    } else {
      // Create new family account
      const newFamilyAccount = await pool.query(
        'INSERT INTO family_accounts (account_name, created_by_user_id) VALUES ($1, $2) RETURNING family_account_id',
        [accountName, null] // Will update after user creation
      );

      familyAccountId = newFamilyAccount.rows[0].family_account_id;

      // Create user
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, full_name, family_account_id) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [email, hashedPassword, fullName, familyAccountId]
      );

      userId = newUser.rows[0].user_id;

      // Update family account with creator
      await pool.query(
        'UPDATE family_accounts SET created_by_user_id = $1 WHERE family_account_id = $2',
        [userId, familyAccountId]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, familyAccountId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = $1',
      [userId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId,
        email,
        fullName,
        familyAccountId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Demo user for testing
    const demoUser = {
      email: 'user@example.com',
      password: 'password123',
      full_name: 'Demo User',
      family_account_id: '11111111-1111-1111-1111-111111111111',
      family_account_name: 'Demo Family',
      user_id: 'demo-user-id-123'
    };

    // Check if it's the demo user
    if (email === demoUser.email && password === demoUser.password) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: demoUser.user_id, 
          email: demoUser.email, 
          familyAccountId: demoUser.family_account_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          userId: demoUser.user_id,
          email: demoUser.email,
          fullName: demoUser.full_name,
          familyAccountId: demoUser.family_account_id,
          familyAccountName: demoUser.family_account_name
        }
      });
    }

    // For non-demo users, check database
    const userResult = await pool.query(
      `SELECT u.user_id, u.email, u.password_hash, u.full_name, u.family_account_id, 
              f.account_name as family_account_name
       FROM users u
       LEFT JOIN family_accounts f ON u.family_account_id = f.family_account_id
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        familyAccountId: user.family_account_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        familyAccountId: user.family_account_id,
        familyAccountName: user.family_account_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Demo user profile
    if (userId === 'demo-user-id-123') {
      return res.json({
        userId: 'demo-user-id-123',
        email: 'user@example.com',
        fullName: 'Demo User',
        familyAccountId: '11111111-1111-1111-1111-111111111111',
        familyAccountName: 'Demo Family'
      });
    }
    
    // Real database query
    const userResult = await pool.query(
      `SELECT u.user_id, u.email, u.full_name, u.family_account_id, 
              f.account_name as family_account_name
       FROM users u
       LEFT JOIN family_accounts f ON u.family_account_id = f.family_account_id
       WHERE u.user_id = $1 AND u.is_active = TRUE`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    res.json({
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      familyAccountId: user.family_account_id,
      familyAccountName: user.family_account_name
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile
};
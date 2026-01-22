const { pool } = require('../config/database');

// Get family members
const getFamilyMembers = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        user_id,
        email,
        full_name,
        profile_picture,
        created_at,
        last_login,
        is_active
      FROM users
      WHERE family_account_id = $1 AND is_active = TRUE
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [familyAccountId]);
    
    res.json({
      familyMembers: result.rows.map(row => ({
        user_id: row.user_id,
        email: row.email,
        full_name: row.full_name,
        profile_picture: row.profile_picture,
        created_at: row.created_at,
        last_login: row.last_login,
        is_active: row.is_active
      }))
    });
    
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({ message: 'Failed to fetch family members' });
  }
};

// Add family member
const addFamilyMember = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { email, fullName } = req.body;
    
    // Validation
    if (!email || !fullName) {
      return res.status(400).json({ message: 'Email and full name are required' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new family member (without password for now)
    const query = `
      INSERT INTO users (email, full_name, family_account_id, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING user_id, email, full_name, created_at
    `;
    
    const result = await pool.query(query, [email, fullName, familyAccountId]);
    
    res.status(201).json({
      message: 'Family member added successfully',
      familyMember: result.rows[0]
    });
    
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({ message: 'Failed to add family member' });
  }
};

// Remove family member
const removeFamilyMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    // Don't allow removing yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot remove yourself from family account' });
    }
    
    const query = `
      UPDATE users 
      SET is_active = FALSE 
      WHERE user_id = $1 AND family_account_id = $2
    `;
    
    const result = await pool.query(query, [userId, familyAccountId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    
    res.json({ message: 'Family member removed successfully' });
    
  } catch (error) {
    console.error('Remove family member error:', error);
    res.status(500).json({ message: 'Failed to remove family member' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, profilePicture } = req.body;
    
    let query = 'UPDATE users SET ';
    const queryParams = [];
    let paramCount = 1;
    
    if (fullName) {
      query += `full_name = $${paramCount}`;
      queryParams.push(fullName);
      paramCount++;
    }
    
    if (profilePicture) {
      if (queryParams.length > 0) query += ', ';
      query += `profile_picture = $${paramCount}`;
      queryParams.push(profilePicture);
    }
    
    query += `, updated_at = NOW() WHERE user_id = $${paramCount}`;
    queryParams.push(userId);
    
    await pool.query(query, queryParams);
    
    res.json({ message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  getFamilyMembers,
  addFamilyMember,
  removeFamilyMember,
  updateUserProfile
};
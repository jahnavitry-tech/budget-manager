const express = require('express');
const router = express.Router();
const { getFamilyMembers, addFamilyMember, removeFamilyMember, updateUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get family members
router.get('/family-members', getFamilyMembers);

// Add family member
router.post('/family-members', addFamilyMember);

// Remove family member
router.delete('/family-members/:userId', removeFamilyMember);

// Update user profile
router.put('/profile', updateUserProfile);

module.exports = router;
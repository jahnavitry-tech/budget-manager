const express = require('express');
const router = express.Router();
const { getBudgetLimits, setBudgetLimit, deleteBudgetLimit } = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all budget limits
router.get('/', getBudgetLimits);

// Set or update budget limit
router.post('/', setBudgetLimit);

// Delete budget limit
router.delete('/:id', deleteBudgetLimit);

module.exports = router;
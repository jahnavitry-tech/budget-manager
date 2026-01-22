const express = require('express');
const router = express.Router();
const { getTransactions, getRecentTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all transaction routes
router.use(authenticateToken);

// Get recent transactions (used by dashboard)
router.get('/recent', getRecentTransactions);

// Get all transactions with filtering
router.get('/', getTransactions);

// Create new transaction
router.post('/', createTransaction);

// Update transaction
router.put('/:id', updateTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
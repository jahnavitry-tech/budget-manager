const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all transaction routes
router.use(authenticateToken);

// Get recent transactions (used by dashboard)
router.get('/recent', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        t.transaction_id,
        t.description,
        t.amount,
        t.transaction_date,
        c.category_name,
        u.full_name as added_by_user_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.family_account_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 10
    `;
    
    const result = await pool.query(query, [familyAccountId]);
    
    res.json({
      transactions: result.rows.map(row => ({
        transaction_id: row.transaction_id,
        description: row.description,
        amount: parseFloat(row.amount),
        transaction_date: row.transaction_date,
        category_name: row.category_name,
        added_by_user_name: row.added_by_user_name
      }))
    });
    
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch recent transactions' });
  }
});

// Get all transactions with filtering
router.get('/', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { category, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        t.transaction_id,
        t.description,
        t.amount,
        t.transaction_date,
        t.is_recurring,
        t.recurrence_pattern,
        c.category_name,
        c.category_type,
        u.full_name as added_by_user_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.family_account_id = $1
    `;
    
    const queryParams = [familyAccountId];
    let paramCount = 2;
    
    if (category) {
      query += ` AND c.category_name = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND t.transaction_date >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND t.transaction_date <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }
    
    query += ` ORDER BY t.transaction_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      transactions: result.rows.map(row => ({
        transaction_id: row.transaction_id,
        description: row.description,
        amount: parseFloat(row.amount),
        transaction_date: row.transaction_date,
        is_recurring: row.is_recurring,
        recurrence_pattern: row.recurrence_pattern,
        category_name: row.category_name,
        category_type: row.category_type,
        added_by_user_name: row.added_by_user_name
      }))
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        t.*, 
        c.category_name,
        c.category_type,
        u.full_name as added_by_user_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.transaction_id = $1 AND t.family_account_id = $2
    `;
    
    const result = await pool.query(query, [id, familyAccountId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const transaction = result.rows[0];
    res.json({
      transaction: {
        transaction_id: transaction.transaction_id,
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        transaction_date: transaction.transaction_date,
        is_recurring: transaction.is_recurring,
        recurrence_pattern: transaction.recurrence_pattern,
        category_name: transaction.category_name,
        category_type: transaction.category_type,
        added_by_user_name: transaction.added_by_user_name
      }
    });
    
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const { description, amount, categoryId, transactionDate, isRecurring, recurrencePattern } = req.body;
    const userId = req.user.user_id;
    const familyAccountId = req.user.family_account_id;
    
    // Validate required fields
    if (!description || !amount || !categoryId || !transactionDate) {
      return res.status(400).json({ message: 'Description, amount, category, and date are required' });
    }
    
    // Verify category belongs to family
    const categoryCheck = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = $1 AND family_account_id = $2',
      [categoryId, familyAccountId]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const query = `
      INSERT INTO transactions 
      (family_account_id, user_id, amount, category_id, description, transaction_date, is_recurring, recurrence_pattern)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING transaction_id
    `;
    
    const result = await pool.query(query, [
      familyAccountId,
      userId,
      amount,
      categoryId,
      description,
      transactionDate,
      isRecurring || false,
      recurrencePattern || null
    ]);
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transactionId: result.rows[0].transaction_id
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, categoryId, transactionDate, isRecurring, recurrencePattern } = req.body;
    const familyAccountId = req.user.family_account_id;
    
    // Verify transaction exists and belongs to family
    const transactionCheck = await pool.query(
      'SELECT transaction_id FROM transactions WHERE transaction_id = $1 AND family_account_id = $2',
      [id, familyAccountId]
    );
    
    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // If category is being updated, verify it belongs to family
    if (categoryId) {
      const categoryCheck = await pool.query(
        'SELECT category_id FROM categories WHERE category_id = $1 AND family_account_id = $2',
        [categoryId, familyAccountId]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }
    
    const query = `
      UPDATE transactions SET
      description = COALESCE($1, description),
      amount = COALESCE($2, amount),
      category_id = COALESCE($3, category_id),
      transaction_date = COALESCE($4, transaction_date),
      is_recurring = COALESCE($5, is_recurring),
      recurrence_pattern = COALESCE($6, recurrence_pattern)
      WHERE transaction_id = $7 AND family_account_id = $8
    `;
    
    await pool.query(query, [
      description,
      amount,
      categoryId,
      transactionDate,
      isRecurring,
      recurrencePattern,
      id,
      familyAccountId
    ]);
    
    res.json({ message: 'Transaction updated successfully' });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    // Verify transaction exists and belongs to family
    const transactionCheck = await pool.query(
      'SELECT transaction_id FROM transactions WHERE transaction_id = $1 AND family_account_id = $2',
      [id, familyAccountId]
    );
    
    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    await pool.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
    
    res.json({ message: 'Transaction deleted successfully' });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;
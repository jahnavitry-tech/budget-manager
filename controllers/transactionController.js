const { pool } = require('../config/database');

// Get all transactions with filtering
const getTransactions = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { startDate, endDate, categoryId, search } = req.query;
    
    let query = `
      SELECT 
        t.transaction_id,
        t.description,
        t.amount,
        t.transaction_date,
        t.created_at,
        c.category_name,
        c.category_type,
        c.color_code,
        u.full_name as added_by_user_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.family_account_id = $1
    `;
    
    const queryParams = [familyAccountId];
    let paramCount = 1;
    
    if (startDate) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;
      queryParams.push(endDate);
    }
    
    if (categoryId) {
      paramCount++;
      query += ` AND t.category_id = $${paramCount}`;
      queryParams.push(categoryId);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (t.description ILIKE $${paramCount} OR c.category_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      transactions: result.rows.map(row => ({
        transaction_id: row.transaction_id,
        description: row.description,
        amount: parseFloat(row.amount),
        transaction_date: row.transaction_date,
        created_at: row.created_at,
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code,
        added_by_user_name: row.added_by_user_name
      }))
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// Get recent transactions (used by dashboard)
const getRecentTransactions = async (req, res) => {
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
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    console.log('=== BACKEND TRANSACTION CREATION DEBUG ===');
    console.log('Received request body:', req.body);
    console.log('User context:', {
      family_account_id: req.user.family_account_id,
      user_id: req.user.userId
    });
    
    const familyAccountId = req.user.family_account_id;
    const userId = req.user.userId;
    const { amount, categoryId, description, transactionDate, isRecurring, recurrencePattern } = req.body;
    
    console.log('Extracted data:', {
      amount,
      categoryId,
      description,
      transactionDate,
      categoryIdType: typeof categoryId,
      categoryIdLength: categoryId ? categoryId.length : 0
    });
    
    // Validation
    if (!amount || !categoryId || !transactionDate) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'Amount, category, and date are required' });
    }
    
    // Check if categoryId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(categoryId)) {
      console.log('Invalid category ID format:', categoryId);
      return res.status(400).json({ 
        message: 'Invalid category ID format. Expected UUID.',
        receivedCategoryId: categoryId
      });
    }
    
    const query = `
      INSERT INTO transactions 
      (family_account_id, user_id, amount, category_id, description, transaction_date, is_recurring, recurrence_pattern)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    console.log('Executing database query with parameters:', [
      familyAccountId,
      userId,
      amount,
      categoryId,
      description || '',
      transactionDate,
      isRecurring || false,
      recurrencePattern || null
    ]);
    
    const result = await pool.query(query, [
      familyAccountId,
      userId,
      amount,
      categoryId,
      description || '',
      transactionDate,
      isRecurring || false,
      recurrencePattern || null
    ]);
    
    console.log('Database result:', result.rows[0]);
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: result.rows[0]
    });
    
  } catch (error) {
    console.error('=== BACKEND TRANSACTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log specific database errors
    if (error.code) {
      console.error('Database error code:', error.code);
    }
    if (error.detail) {
      console.error('Database error detail:', error.detail);
    }
    
    res.status(500).json({ 
      message: 'Failed to create transaction',
      error: error.message,
      code: error.code
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    const { amount, categoryId, description, transactionDate, isRecurring, recurrencePattern } = req.body;
    
    const query = `
      UPDATE transactions 
      SET amount = $3, category_id = $4, description = $5, transaction_date = $6, 
          is_recurring = $7, recurrence_pattern = $8, updated_at = NOW()
      WHERE transaction_id = $1 AND family_account_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      familyAccountId,
      amount,
      categoryId,
      description,
      transactionDate,
      isRecurring,
      recurrencePattern
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      message: 'Transaction updated successfully',
      transaction: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      DELETE FROM transactions 
      WHERE transaction_id = $1 AND family_account_id = $2
    `;
    
    const result = await pool.query(query, [id, familyAccountId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

module.exports = {
  getTransactions,
  getRecentTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
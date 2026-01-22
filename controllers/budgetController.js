const { pool } = require('../config/database');

// Get all budget limits for a family account
const getBudgetLimits = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        b.budget_id,
        b.category_id,
        b.limit_amount,
        b.limit_percentage,
        b.period_type,
        b.start_date,
        b.end_date,
        c.category_name,
        c.category_type,
        c.color_code
      FROM budget_limits b
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE b.family_account_id = $1
      ORDER BY c.category_name
    `;
    
    const result = await pool.query(query, [familyAccountId]);
    
    res.json({
      budgetLimits: result.rows.map(row => ({
        budget_id: row.budget_id,
        category_id: row.category_id,
        limit_amount: row.limit_amount ? parseFloat(row.limit_amount) : null,
        limit_percentage: row.limit_percentage ? parseFloat(row.limit_percentage) : null,
        period_type: row.period_type,
        start_date: row.start_date,
        end_date: row.end_date,
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code
      }))
    });
    
  } catch (error) {
    console.error('Get budget limits error:', error);
    res.status(500).json({ message: 'Failed to fetch budget limits' });
  }
};

// Set or update budget limit
const setBudgetLimit = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { categoryId, limitAmount, limitPercentage, periodType, startDate, endDate } = req.body;
    
    // Validation
    if (!limitAmount && !limitPercentage) {
      return res.status(400).json({ message: 'Either limit amount or percentage is required' });
    }
    
    if (!periodType) {
      return res.status(400).json({ message: 'Period type is required' });
    }
    
    // Check if budget limit already exists for this category
    const existingQuery = `
      SELECT budget_id FROM budget_limits 
      WHERE family_account_id = $1 AND category_id = $2
    `;
    
    const existingResult = await pool.query(existingQuery, [familyAccountId, categoryId]);
    
    let result;
    
    if (existingResult.rows.length > 0) {
      // Update existing budget limit
      const updateQuery = `
        UPDATE budget_limits 
        SET limit_amount = $3, limit_percentage = $4, period_type = $5, 
            start_date = $6, end_date = $7, created_at = NOW()
        WHERE budget_id = $1
        RETURNING *
      `;
      
      result = await pool.query(updateQuery, [
        existingResult.rows[0].budget_id,
        categoryId,
        limitAmount || null,
        limitPercentage || null,
        periodType,
        startDate || null,
        endDate || null
      ]);
    } else {
      // Create new budget limit
      const insertQuery = `
        INSERT INTO budget_limits 
        (family_account_id, category_id, limit_amount, limit_percentage, period_type, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      result = await pool.query(insertQuery, [
        familyAccountId,
        categoryId,
        limitAmount || null,
        limitPercentage || null,
        periodType,
        startDate || null,
        endDate || null
      ]);
    }
    
    res.status(201).json({
      message: 'Budget limit saved successfully',
      budgetLimit: result.rows[0]
    });
    
  } catch (error) {
    console.error('Set budget limit error:', error);
    res.status(500).json({ message: 'Failed to save budget limit' });
  }
};

// Delete budget limit
const deleteBudgetLimit = async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      DELETE FROM budget_limits 
      WHERE budget_id = $1 AND family_account_id = $2
    `;
    
    await pool.query(query, [id, familyAccountId]);
    
    res.json({ message: 'Budget limit deleted successfully' });
    
  } catch (error) {
    console.error('Delete budget limit error:', error);
    res.status(500).json({ message: 'Failed to delete budget limit' });
  }
};

module.exports = {
  getBudgetLimits,
  setBudgetLimit,
  deleteBudgetLimit
};
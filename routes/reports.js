const express = require('express');
const router = express.Router();
const { getMonthlySummary, getAnnualReport, getCategoryBreakdown } = require('../controllers/reportController');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all report routes
router.use(authenticateToken);

// Monthly summary
router.get('/monthly/:year/:month', getMonthlySummary);

// Annual report
router.get('/annual/:year', getAnnualReport);

// Category breakdown
router.get('/category-breakdown', getCategoryBreakdown);

// Dashboard Overview - Get current month summary
router.get('/dashboard-overview', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    // Get current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // Calculate from transactions for current month
    const query = `
      SELECT 
        SUM(CASE WHEN c.category_type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN c.category_type = 'expense' THEN ABS(t.amount) ELSE 0 END) as total_expenses,
        SUM(CASE WHEN c.category_type = 'income' THEN t.amount ELSE 0 END) - 
        SUM(CASE WHEN c.category_type = 'expense' THEN ABS(t.amount) ELSE 0 END) as total_savings
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.family_account_id = $1 
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      AND EXTRACT(MONTH FROM t.transaction_date) = $3
    `;
    
    const result = await pool.query(query, [familyAccountId, currentYear, currentMonth]);
    
    if (result.rows.length > 0) {
      const data = result.rows[0];
      const savingsPercentage = data.total_income > 0 ? 
        (data.total_savings / data.total_income) * 100 : 0;
      
      res.json({
        total_income: parseFloat(data.total_income || 0),
        total_expenses: parseFloat(data.total_expenses || 0),
        total_savings: parseFloat(data.total_savings || 0),
        savings_percentage: parseFloat(savingsPercentage.toFixed(2))
      });
    } else {
      res.json({
        total_income: 0,
        total_expenses: 0,
        total_savings: 0,
        savings_percentage: 0
      });
    }
    
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard overview' });
  }
});

// Recent activity
router.get('/recent-activity', async (req, res) => {
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
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
});

// Quick stats (keeping existing implementation)
router.get('/quick-stats', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const queries = await Promise.all([
      // Total transactions count
      pool.query('SELECT COUNT(*) as count FROM transactions WHERE family_account_id = $1', [familyAccountId]),
      // Active categories count
      pool.query('SELECT COUNT(*) as count FROM categories WHERE family_account_id = $1 AND is_active = true', [familyAccountId]),
      // Budget limits set
      pool.query('SELECT COUNT(*) as count FROM budget_limits WHERE family_account_id = $1', [familyAccountId])
    ]);
    
    res.json({
      total_transactions: parseInt(queries[0].rows[0].count),
      active_categories: parseInt(queries[1].rows[0].count),
      budget_limits_set: parseInt(queries[2].rows[0].count)
    });
    
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  }
});

module.exports = router;
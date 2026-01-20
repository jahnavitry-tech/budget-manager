const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all report routes
router.use(authenticateToken);

// Dashboard Overview - Get current month summary
router.get('/dashboard-overview', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const familyAccountId = req.user.family_account_id;
    
    // Get current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const monthYear = `${currentYear}-${currentMonth}-01`;
    
    // Check if we have monthly summary data
    const summaryQuery = `
      SELECT total_income, total_expenses, total_savings 
      FROM monthly_summaries 
      WHERE family_account_id = $1 AND month_year = $2
    `;
    
    const summaryResult = await pool.query(summaryQuery, [familyAccountId, monthYear]);
    
    if (summaryResult.rows.length > 0) {
      const summary = summaryResult.rows[0];
      const savingsPercentage = summary.total_income > 0 ? 
        (summary.total_savings / summary.total_income) * 100 : 0;
      
      return res.json({
        total_income: parseFloat(summary.total_income),
        total_expenses: parseFloat(summary.total_expenses),
        total_savings: parseFloat(summary.total_savings),
        savings_percentage: parseFloat(savingsPercentage.toFixed(2))
      });
    }
    
    // Fallback: Calculate from transactions if no summary exists
    const fallbackQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN c.category_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN c.category_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(t.amount), 0) as total_savings
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.family_account_id = $1 
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      AND EXTRACT(MONTH FROM t.transaction_date) = $3
    `;
    
    const fallbackResult = await pool.query(fallbackQuery, [familyAccountId, currentYear, currentMonth]);
    
    if (fallbackResult.rows.length > 0) {
      const data = fallbackResult.rows[0];
      const savingsPercentage = data.total_income > 0 ? 
        (data.total_savings / data.total_income) * 100 : 0;
      
      res.json({
        total_income: parseFloat(data.total_income),
        total_expenses: parseFloat(Math.abs(data.total_expenses)),
        total_savings: parseFloat(data.total_savings),
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

// Get recent transactions
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

// Get category breakdown
router.get('/category-breakdown', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { start, end } = req.query;
    
    let dateCondition = '';
    const queryParams = [familyAccountId];
    
    if (start && end) {
      dateCondition = 'AND t.transaction_date BETWEEN $2 AND $3';
      queryParams.push(start, end);
    }
    
    const query = `
      SELECT 
        c.category_name,
        c.category_type,
        c.color_code,
        c.icon,
        SUM(t.amount) as total_amount,
        COUNT(t.transaction_id) as transaction_count
      FROM categories c
      LEFT JOIN transactions t ON c.category_id = t.category_id ${dateCondition}
      WHERE c.family_account_id = $1
      GROUP BY c.category_id, c.category_name, c.category_type, c.color_code, c.icon
      ORDER BY ABS(SUM(t.amount)) DESC
    `;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      categories: result.rows.map(row => ({
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code,
        icon: row.icon,
        total_amount: parseFloat(row.total_amount || 0),
        transaction_count: parseInt(row.transaction_count)
      }))
    });
    
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ message: 'Failed to fetch category breakdown' });
  }
});

// Quick stats
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
const { pool } = require('../config/database');

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { year, month } = req.params;
    
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
    
    const result = await pool.query(query, [familyAccountId, year, month]);
    
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
    console.error('Monthly summary error:', error);
    res.status(500).json({ message: 'Failed to fetch monthly summary' });
  }
};

// Get annual report
const getAnnualReport = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { year } = req.params;
    
    const query = `
      SELECT 
        EXTRACT(MONTH FROM t.transaction_date) as month,
        SUM(CASE WHEN c.category_type = 'income' THEN t.amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN c.category_type = 'expense' THEN ABS(t.amount) ELSE 0 END) as monthly_expenses
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.family_account_id = $1 
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      GROUP BY EXTRACT(MONTH FROM t.transaction_date)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [familyAccountId, year]);
    
    // Create 12-month array with default values
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthly_income: 0,
      monthly_expenses: 0
    }));
    
    // Fill in actual data
    result.rows.forEach(row => {
      const monthIndex = parseInt(row.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].monthly_income = parseFloat(row.monthly_income || 0);
        monthlyData[monthIndex].monthly_expenses = parseFloat(row.monthly_expenses || 0);
      }
    });
    
    // Calculate totals
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.monthly_income, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.monthly_expenses, 0);
    const totalSavings = totalIncome - totalExpenses;
    
    res.json({
      year: parseInt(year),
      monthly_data: monthlyData,
      total_annual_income: parseFloat(totalIncome.toFixed(2)),
      total_annual_expenses: parseFloat(totalExpenses.toFixed(2)),
      total_annual_savings: parseFloat(totalSavings.toFixed(2))
    });
    
  } catch (error) {
    console.error('Annual report error:', error);
    res.status(500).json({ message: 'Failed to fetch annual report' });
  }
};

// Get category breakdown for a period
const getCategoryBreakdown = async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        c.category_name,
        c.category_type,
        c.color_code,
        SUM(ABS(t.amount)) as total_amount,
        COUNT(t.transaction_id) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.family_account_id = $1
    `;
    
    const queryParams = [familyAccountId];
    
    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN $2 AND $3`;
      queryParams.push(startDate, endDate);
    }
    
    query += ` GROUP BY c.category_id, c.category_name, c.category_type, c.color_code
               ORDER BY total_amount DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      categories: result.rows.map(row => ({
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code,
        total_amount: parseFloat(row.total_amount || 0),
        transaction_count: parseInt(row.transaction_count || 0)
      }))
    });
    
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ message: 'Failed to fetch category breakdown' });
  }
};

module.exports = {
  getMonthlySummary,
  getAnnualReport,
  getCategoryBreakdown
};
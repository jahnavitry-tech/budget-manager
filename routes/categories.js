const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all category routes
router.use(authenticateToken);

// Get default categories (used by dashboard)
router.get('/default', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        c.category_id,
        c.category_name,
        c.category_type,
        c.color_code,
        c.icon,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN transactions t ON c.category_id = t.category_id 
        AND t.family_account_id = $1
        AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      WHERE c.family_account_id = $1
      GROUP BY c.category_id, c.category_name, c.category_type, c.color_code, c.icon
      ORDER BY ABS(SUM(t.amount)) DESC
    `;
    
    const result = await pool.query(query, [familyAccountId]);
    
    res.json({
      categories: result.rows.map(row => ({
        category_id: row.category_id,
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code,
        icon: row.icon,
        total_amount: parseFloat(row.total_amount)
      }))
    });
    
  } catch (error) {
    console.error('Default categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get all categories for family
router.get('/', async (req, res) => {
  try {
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        category_id,
        category_name,
        category_type,
        color_code,
        icon,
        description,
        is_default,
        created_at
      FROM categories 
      WHERE family_account_id = $1
      ORDER BY is_default DESC, category_name ASC
    `;
    
    const result = await pool.query(query, [familyAccountId]);
    
    res.json({
      categories: result.rows.map(row => ({
        category_id: row.category_id,
        category_name: row.category_name,
        category_type: row.category_type,
        color_code: row.color_code,
        icon: row.icon,
        description: row.description,
        is_default: row.is_default,
        created_at: row.created_at
      }))
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    const query = `
      SELECT 
        category_id,
        category_name,
        category_type,
        color_code,
        icon,
        description,
        is_default,
        created_at
      FROM categories 
      WHERE category_id = $1 AND family_account_id = $2
    `;
    
    const result = await pool.query(query, [id, familyAccountId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = result.rows[0];
    res.json({
      category: {
        category_id: category.category_id,
        category_name: category.category_name,
        category_type: category.category_type,
        color_code: category.color_code,
        icon: category.icon,
        description: category.description,
        is_default: category.is_default,
        created_at: category.created_at
      }
    });
    
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { categoryName, categoryType, colorCode, icon, description } = req.body;
    const userId = req.user.user_id;
    const familyAccountId = req.user.family_account_id;
    
    // Validate required fields
    if (!categoryName || !categoryType) {
      return res.status(400).json({ message: 'Category name and type are required' });
    }
    
    // Validate category type
    if (!['income', 'expense'].includes(categoryType)) {
      return res.status(400).json({ message: 'Category type must be either income or expense' });
    }
    
    const query = `
      INSERT INTO categories 
      (family_account_id, category_name, category_type, color_code, icon, description, is_default, created_by_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, false, $7)
      RETURNING category_id
    `;
    
    const result = await pool.query(query, [
      familyAccountId,
      categoryName,
      categoryType,
      colorCode || '#CCCCCC',
      icon || '💰',
      description || '',
      userId
    ]);
    
    res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.rows[0].category_id
    });
    
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryType, colorCode, icon, description, isActive } = req.body;
    const familyAccountId = req.user.family_account_id;
    
    // Verify category exists and belongs to family
    const categoryCheck = await pool.query(
      'SELECT category_id, is_default FROM categories WHERE category_id = $1 AND family_account_id = $2',
      [id, familyAccountId]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Prevent modification of default categories
    if (categoryCheck.rows[0].is_default) {
      return res.status(400).json({ message: 'Cannot modify default categories' });
    }
    
    const query = `
      UPDATE categories SET
      category_name = COALESCE($1, category_name),
      category_type = COALESCE($2, category_type),
      color_code = COALESCE($3, color_code),
      icon = COALESCE($4, icon),
      description = COALESCE($5, description),
      is_active = COALESCE($6, is_active)
      WHERE category_id = $7 AND family_account_id = $8
    `;
    
    await pool.query(query, [
      categoryName,
      categoryType,
      colorCode,
      icon,
      description,
      isActive,
      id,
      familyAccountId
    ]);
    
    res.json({ message: 'Category updated successfully' });
    
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const familyAccountId = req.user.family_account_id;
    
    // Verify category exists and belongs to family
    const categoryCheck = await pool.query(
      'SELECT category_id, is_default FROM categories WHERE category_id = $1 AND family_account_id = $2',
      [id, familyAccountId]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Prevent deletion of default categories
    if (categoryCheck.rows[0].is_default) {
      return res.status(400).json({ message: 'Cannot delete default categories' });
    }
    
    // Check if category has transactions
    const transactionCheck = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(transactionCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing transactions. Deactivate instead.' 
      });
    }
    
    await pool.query('DELETE FROM categories WHERE category_id = $1', [id]);
    
    res.json({ message: 'Category deleted successfully' });
    
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

module.exports = router;
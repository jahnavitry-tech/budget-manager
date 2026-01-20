-- Test Data for Budget Manager Application
-- Insert 2 sample records for each table to test functionality

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert Test Family Accounts
INSERT INTO family_accounts (family_account_id, account_name, created_by_user_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Doe Family Budget', NULL),
('22222222-2222-2222-2222-222222222222', 'Smith Family Finances', NULL);

-- Insert Test Users
INSERT INTO users (user_id, family_account_id, email, password_hash, full_name, profile_picture, last_login, is_active) VALUES
('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'john.doe@example.com', '$2b$10$examplehash1', 'John Doe', 'https://example.com/avatar1.jpg', CURRENT_TIMESTAMP, TRUE),
('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'jane.doe@example.com', '$2b$10$examplehash2', 'Jane Doe', 'https://example.com/avatar2.jpg', CURRENT_TIMESTAMP, TRUE),
('10000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'mike.smith@example.com', '$2b$10$examplehash3', 'Mike Smith', 'https://example.com/avatar3.jpg', CURRENT_TIMESTAMP, TRUE),
('10000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'sarah.smith@example.com', '$2b$10$examplehash4', 'Sarah Smith', 'https://example.com/avatar4.jpg', CURRENT_TIMESTAMP, TRUE);

-- Update family accounts with creator user IDs
UPDATE family_accounts SET created_by_user_id = '10000000-0000-0000-0000-000000000001' WHERE family_account_id = '11111111-1111-1111-1111-111111111111';
UPDATE family_accounts SET created_by_user_id = '10000000-0000-0000-0000-000000000003' WHERE family_account_id = '22222222-2222-2222-2222-222222222222';

-- Insert Additional Categories (beyond the defaults)
INSERT INTO categories (category_id, family_account_id, category_name, category_type, color_code, icon, description, is_default, created_by_user_id) VALUES
('30000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Transportation', 'expense', '#2196F3', '🚗', 'Car, public transport, fuel costs', FALSE, '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Healthcare', 'expense', '#FF5722', '🏥', 'Medical bills, insurance, medications', FALSE, '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Education', 'expense', '#9C27B0', '📚', 'School fees, books, courses', FALSE, '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Travel', 'expense', '#FF9800', '✈️', 'Vacations, trips, accommodation', FALSE, '10000000-0000-0000-0000-000000000004');

-- Insert Test Transactions - Doe Family
INSERT INTO transactions (transaction_id, family_account_id, user_id, amount, category_id, description, transaction_date, is_recurring, recurrence_pattern) VALUES
('40000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001', 85000.00, (SELECT category_id FROM categories WHERE category_name = 'Salary'), 'Monthly Salary Deposit', '2024-01-01', FALSE, NULL),
('40000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', -12500.00, (SELECT category_id FROM categories WHERE category_name = 'Food'), 'Weekly Grocery Shopping', '2024-01-05', TRUE, 'weekly'),
('40000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001', -8200.00, (SELECT category_id FROM categories WHERE category_name = 'Monthly Bills & EMIs'), 'Electricity and Internet Bill', '2024-01-10', TRUE, 'monthly'),
('40000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', -2800.00, (SELECT category_id FROM categories WHERE category_name = 'Entertainment'), 'Movie Night Out', '2024-01-12', FALSE, NULL),
('40000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001', -15000.00, (SELECT category_id FROM categories WHERE category_name = 'Investments'), 'Monthly Mutual Fund SIP', '2024-01-15', TRUE, 'monthly'),
('40000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', -5000.00, (SELECT category_id FROM categories WHERE category_name = 'Long Term'), 'Home Improvement Materials', '2024-01-20', FALSE, NULL);

-- Insert Test Transactions - Smith Family
INSERT INTO transactions (transaction_id, family_account_id, user_id, amount, category_id, description, transaction_date, is_recurring, recurrence_pattern) VALUES
('40000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000003', 75000.00, (SELECT category_id FROM categories WHERE category_name = 'Salary'), 'Bi-weekly Paycheck', '2024-01-01', TRUE, 'biweekly'),
('40000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000004', -9800.00, (SELECT category_id FROM categories WHERE category_name = 'Food'), 'Monthly Grocery Stock-up', '2024-01-03', TRUE, 'monthly'),
('40000000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000003', -12000.00, (SELECT category_id FROM categories WHERE category_name = 'Monthly Bills & EMIs'), 'Mortgage Payment', '2024-01-05', TRUE, 'monthly'),
('40000000-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000004', -3500.00, (SELECT category_id FROM categories WHERE category_name = 'Transportation'), 'Car Maintenance and Fuel', '2024-01-08', FALSE, NULL),
('40000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000003', -20000.00, (SELECT category_id FROM categories WHERE category_name = 'Education'), 'Children School Fees', '2024-01-10', TRUE, 'monthly'),
('40000000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000004', -8000.00, (SELECT category_id FROM categories WHERE category_name = 'Travel'), 'Family Vacation Planning', '2024-01-15', FALSE, NULL);

-- Insert Test Budget Limits - Doe Family
INSERT INTO budget_limits (budget_id, family_account_id, category_id, limit_amount, limit_percentage, period_type, start_date, end_date) VALUES
('50000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', (SELECT category_id FROM categories WHERE category_name = 'Food'), 15000.00, NULL, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', (SELECT category_id FROM categories WHERE category_name = 'Entertainment'), 5000.00, NULL, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', (SELECT category_id FROM categories WHERE category_name = 'Transportation'), NULL, 15.00, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', (SELECT category_id FROM categories WHERE category_name = 'Healthcare'), 3000.00, NULL, 'monthly', NULL, NULL);

-- Insert Test Budget Limits - Smith Family
INSERT INTO budget_limits (budget_id, family_account_id, category_id, limit_amount, limit_percentage, period_type, start_date, end_date) VALUES
('50000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', (SELECT category_id FROM categories WHERE category_name = 'Food'), 12000.00, NULL, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', (SELECT category_id FROM categories WHERE category_name = 'Travel'), NULL, 20.00, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', (SELECT category_id FROM categories WHERE category_name = 'Education'), 25000.00, NULL, 'monthly', NULL, NULL),
('50000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', (SELECT category_id FROM categories WHERE category_name = 'Transportation'), 5000.00, NULL, 'monthly', NULL, NULL);

-- Insert Test Monthly Summaries - Doe Family
INSERT INTO monthly_summaries (summary_id, family_account_id, month_year, total_income, total_expenses, total_savings, category_breakdown) VALUES
('60000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '2024-01-01', 85000.00, -43500.00, 41500.00, 
'[
  {"category": "Food", "amount": -12500.00},
  {"category": "Monthly Bills & EMIs", "amount": -8200.00},
  {"category": "Entertainment", "amount": -2800.00},
  {"category": "Investments", "amount": -15000.00},
  {"category": "Long Term", "amount": -5000.00}
]'),
('60000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '2024-02-01', 85000.00, -38000.00, 47000.00,
'[
  {"category": "Food", "amount": -10000.00},
  {"category": "Monthly Bills & EMIs", "amount": -8200.00},
  {"category": "Entertainment", "amount": -1500.00},
  {"category": "Investments", "amount": -15000.00},
  {"category": "Healthcare", "amount": -3300.00}
]');

-- Insert Test Monthly Summaries - Smith Family
INSERT INTO monthly_summaries (summary_id, family_account_id, month_year, total_income, total_expenses, total_savings, category_breakdown) VALUES
('60000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '2024-01-01', 75000.00, -53300.00, 21700.00,
'[
  {"category": "Food", "amount": -9800.00},
  {"category": "Monthly Bills & EMIs", "amount": -12000.00},
  {"category": "Transportation", "amount": -3500.00},
  {"category": "Education", "amount": -20000.00},
  {"category": "Travel", "amount": -8000.00}
]'),
('60000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '2024-02-01', 75000.00, -49500.00, 25500.00,
'[
  {"category": "Food", "amount": -8500.00},
  {"category": "Monthly Bills & EMIs", "amount": -12000.00},
  {"category": "Transportation", "amount": -2800.00},
  {"category": "Education", "amount": -20000.00},
  {"category": "Healthcare", "amount": -1200.00}
]');

-- Insert Test Annual Summaries - Doe Family
INSERT INTO annual_summaries (annual_summary_id, family_account_id, year, monthly_data, total_annual_income, total_annual_expenses, total_annual_savings) VALUES
('70000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 2024,
'{
  "january": {"income": 85000, "expenses": 43500, "savings": 41500},
  "february": {"income": 85000, "expenses": 38000, "savings": 47000}
}', 170000.00, -81500.00, 88500.00);

-- Insert Test Annual Summaries - Smith Family
INSERT INTO annual_summaries (annual_summary_id, family_account_id, year, monthly_data, total_annual_income, total_annual_expenses, total_annual_savings) VALUES
('70000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 2024,
'{
  "january": {"income": 75000, "expenses": 53300, "savings": 21700},
  "february": {"income": 75000, "expenses": 49500, "savings": 25500}
}', 150000.00, -102800.00, 47200.00);

-- Verify Data Insertion
SELECT 'Family Accounts' as table_name, COUNT(*) as record_count FROM family_accounts
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'Transactions' as table_name, COUNT(*) as record_count FROM transactions
UNION ALL
SELECT 'Budget Limits' as table_name, COUNT(*) as record_count FROM budget_limits
UNION ALL
SELECT 'Monthly Summaries' as table_name, COUNT(*) as record_count FROM monthly_summaries
UNION ALL
SELECT 'Annual Summaries' as table_name, COUNT(*) as record_count FROM annual_summaries;
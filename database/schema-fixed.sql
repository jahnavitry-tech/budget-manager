-- Database Schema for Budget Manager Application (Supabase Compatible)
-- Fixed version with proper dependency order

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in dependency order

-- 1. Family Accounts Table (no dependencies)
CREATE TABLE family_accounts (
    family_account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (depends on family_accounts)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Add the created_by_user_id reference to family_accounts
ALTER TABLE family_accounts 
ADD COLUMN created_by_user_id UUID REFERENCES users(user_id);

-- 4. Categories Table (depends on family_accounts and users)
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    category_name VARCHAR(255) NOT NULL,
    category_type VARCHAR(50) CHECK (category_type IN ('income', 'expense')) NOT NULL,
    color_code VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by_user_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transactions Table (depends on family_accounts, users, categories)
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    user_id UUID REFERENCES users(user_id),
    amount DECIMAL(15,2) NOT NULL,
    category_id UUID REFERENCES categories(category_id),
    description TEXT,
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Budget Limits Table (depends on family_accounts, categories)
CREATE TABLE budget_limits (
    budget_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    category_id UUID REFERENCES categories(category_id),
    limit_amount DECIMAL(15,2),
    limit_percentage DECIMAL(5,2),
    period_type VARCHAR(50) CHECK (period_type IN ('monthly', 'weekly', 'custom')) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Monthly Summaries Table (depends on family_accounts)
CREATE TABLE monthly_summaries (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    month_year DATE NOT NULL,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    total_savings DECIMAL(15,2) DEFAULT 0,
    category_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Annual Summaries Table (depends on family_accounts)
CREATE TABLE annual_summaries (
    annual_summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_account_id UUID REFERENCES family_accounts(family_account_id),
    year INTEGER NOT NULL,
    monthly_data JSONB,
    total_annual_income DECIMAL(15,2) DEFAULT 0,
    total_annual_expenses DECIMAL(15,2) DEFAULT 0,
    total_annual_savings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_family_account ON users(family_account_id);
CREATE INDEX idx_transactions_family_date ON transactions(family_account_id, transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_categories_family ON categories(family_account_id);
CREATE INDEX idx_budget_limits_family ON budget_limits(family_account_id);
CREATE INDEX idx_monthly_summaries_family_month ON monthly_summaries(family_account_id, month_year);
CREATE INDEX idx_annual_summaries_family_year ON annual_summaries(family_account_id, year);

-- Insert default categories
INSERT INTO categories (category_name, category_type, color_code, icon, is_default, description) VALUES
('Salary', 'income', '#4CAF50', '💰', TRUE, 'Regular salary income'),
('Food', 'expense', '#FF9800', '🍔', TRUE, 'Groceries and dining expenses'),
('Entertainment', 'expense', '#E91E63', '🎬', TRUE, 'Movies, games, hobbies'),
('Long Term', 'expense', '#9C27B0', '🏠', TRUE, 'Major purchases, home improvements'),
('Investments', 'expense', '#3F51B5', '📈', TRUE, 'Stocks, mutual funds, crypto'),
('Monthly Bills & EMIs', 'expense', '#F44336', '💳', TRUE, 'Rent, utilities, loan payments');

-- Verify schema creation
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('family_accounts', 'users', 'categories', 'transactions', 'budget_limits', 'monthly_summaries', 'annual_summaries')
ORDER BY table_name;
# Budget Manager Database Structure

## 📊 Overview
Comprehensive database design for the Budget Manager web application supporting family account sharing, transaction tracking, budget limits, and analytics.

## 🏗️ Database Schema

### 1. Users Table (`users`)
**Purpose**: Store user account information and authentication data

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `user_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique user identifier |
| `family_account_id` | UUID | FK → family_accounts | Family account membership |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name |
| `profile_picture` | TEXT | Nullable | Profile image URL |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `last_login` | TIMESTAMP WITH TIME ZONE | Nullable | Last login timestamp |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |

**Indexes**: 
- `idx_users_email` (email) - For fast email lookups
- `idx_users_family_account` (family_account_id) - For family queries

---

### 2. Family Accounts Table (`family_accounts`)
**Purpose**: Manage shared family budget accounts

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `family_account_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique family account ID |
| `account_name` | VARCHAR(255) | NOT NULL | Family account name |
| `created_by_user_id` | UUID | FK → users | Creator user ID |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Relationships**: 
- One-to-many with users (family members)
- One-to-many with transactions, categories, budgets

---

### 3. Categories Table (`categories`)
**Purpose**: Define transaction categories for income and expenses

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `category_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique category ID |
| `family_account_id` | UUID | FK → family_accounts | Family account ownership |
| `category_name` | VARCHAR(255) | NOT NULL | Category display name |
| `category_type` | VARCHAR(50) | CHECK IN ('income', 'expense'), NOT NULL | Income or expense type |
| `color_code` | VARCHAR(7) | NOT NULL | Hex color for UI display |
| `icon` | VARCHAR(50) | Nullable | Emoji/icon representation |
| `description` | TEXT | Nullable | Category description |
| `is_default` | BOOLEAN | DEFAULT FALSE | System default category |
| `created_by_user_id` | UUID | FK → users | Creator user ID |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Validation**: `category_type` must be either 'income' or 'expense'

**Indexes**: `idx_categories_family` (family_account_id)

---

### 4. Transactions Table (`transactions`)
**Purpose**: Record all financial transactions

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `transaction_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique transaction ID |
| `family_account_id` | UUID | FK → family_accounts | Family account association |
| `user_id` | UUID | FK → users | User who added transaction |
| `amount` | DECIMAL(15,2) | NOT NULL | Transaction amount (positive=negative) |
| `category_id` | UUID | FK → categories | Transaction category |
| `description` | TEXT | Nullable | Transaction description |
| `transaction_date` | DATE | NOT NULL | Date of transaction |
| `is_recurring` | BOOLEAN | DEFAULT FALSE | Recurring transaction flag |
| `recurrence_pattern` | VARCHAR(50) | CHECK IN ('daily', 'weekly', 'monthly', 'yearly') | Recurrence frequency |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Validation**: 
- `recurrence_pattern` only valid when `is_recurring` = TRUE
- Amount precision: 15 digits total, 2 decimal places

**Indexes**: 
- `idx_transactions_family_date` (family_account_id, transaction_date)
- `idx_transactions_category` (category_id)

---

### 5. Budget Limits Table (`budget_limits`)
**Purpose**: Define spending limits and budget thresholds

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `budget_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique budget limit ID |
| `family_account_id` | UUID | FK → family_accounts | Family account association |
| `category_id` | UUID | FK → categories | Category with limit |
| `limit_amount` | DECIMAL(15,2) | Nullable | Fixed amount limit |
| `limit_percentage` | DECIMAL(5,2) | Nullable | Percentage of income limit |
| `period_type` | VARCHAR(50) | CHECK IN ('monthly', 'weekly', 'custom'), NOT NULL | Budget period |
| `start_date` | DATE | Nullable | Custom period start |
| `end_date` | DATE | Nullable | Custom period end |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Business Rules**:
- Either `limit_amount` OR `limit_percentage` must be set (not both)
- `period_type` determines how limits are calculated

**Indexes**: `idx_budget_limits_family` (family_account_id)

---

### 6. Monthly Summaries Table (`monthly_summaries`)
**Purpose**: Pre-calculated monthly financial summaries for performance

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `summary_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique summary ID |
| `family_account_id` | UUID | FK → family_accounts | Family account |
| `month_year` | DATE | NOT NULL | First day of month |
| `total_income` | DECIMAL(15,2) | DEFAULT 0 | Total monthly income |
| `total_expenses` | DECIMAL(15,2) | DEFAULT 0 | Total monthly expenses |
| `total_savings` | DECIMAL(15,2) | DEFAULT 0 | Calculated savings |
| `category_breakdown` | JSONB | Nullable | Detailed category spending |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Calculation timestamp |

**Indexes**: `idx_monthly_summaries_family_month` (family_account_id, month_year)

---

### 7. Annual Summaries Table (`annual_summaries`)
**Purpose**: Yearly financial overview and trend analysis

**Columns**:
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `annual_summary_id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique annual summary ID |
| `family_account_id` | UUID | FK → family_accounts | Family account |
| `year` | INTEGER | NOT NULL | Calendar year |
| `monthly_data` | JSONB | Nullable | Monthly breakdown data |
| `total_annual_income` | DECIMAL(15,2) | DEFAULT 0 | Yearly income total |
| `total_annual_expenses` | DECIMAL(15,2) | DEFAULT 0 | Yearly expense total |
| `total_annual_savings` | DECIMAL(15,2) | DEFAULT 0 | Yearly savings total |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Calculation timestamp |

**Indexes**: `idx_annual_summaries_family_year` (family_account_id, year)

---

## 📈 Functional Requirements Mapping

### Dashboard Page (`/dashboard`)
**Required Tables**: 
- `users` (user info)
- `family_accounts` (account details)
- `transactions` (income/expense data)
- `categories` (category information)
- `monthly_summaries` (pre-calculated totals)

**Key Queries**:
```sql
-- Get current month summary
SELECT total_income, total_expenses, total_savings 
FROM monthly_summaries 
WHERE family_account_id = ? AND month_year = ?

-- Get recent transactions
SELECT t.*, c.category_name, c.color_code 
FROM transactions t 
JOIN categories c ON t.category_id = c.category_id 
WHERE t.family_account_id = ? 
ORDER BY t.transaction_date DESC 
LIMIT 10

-- Get category breakdown
SELECT c.category_name, SUM(t.amount) as total_amount
FROM transactions t 
JOIN categories c ON t.category_id = c.category_id 
WHERE t.family_account_id = ? AND t.transaction_date >= ?
GROUP BY c.category_name, c.color_code
```

### Transactions Page (`/transactions`)
**Required Tables**: 
- `transactions` (main data)
- `categories` (for filtering)
- `users` (added by info)

**Key Queries**:
```sql
-- Get filtered transactions
SELECT t.*, c.category_name, u.full_name 
FROM transactions t 
JOIN categories c ON t.category_id = c.category_id 
JOIN users u ON t.user_id = u.user_id 
WHERE t.family_account_id = ? 
  AND t.transaction_date BETWEEN ? AND ?
  AND c.category_name = ?
ORDER BY t.transaction_date DESC

-- Add new transaction
INSERT INTO transactions (family_account_id, user_id, amount, category_id, description, transaction_date) 
VALUES (?, ?, ?, ?, ?, ?)
```

### Budgets Page (`/budgets`)
**Required Tables**: 
- `budget_limits` (budget settings)
- `categories` (category limits)
- `transactions` (spending data)

**Key Queries**:
```sql
-- Get current budget limits
SELECT bl.*, c.category_name 
FROM budget_limits bl 
JOIN categories c ON bl.category_id = c.category_id 
WHERE bl.family_account_id = ?

-- Calculate current spending vs limits
SELECT c.category_name, 
       SUM(t.amount) as current_spending,
       bl.limit_amount, bl.limit_percentage
FROM transactions t 
JOIN categories c ON t.category_id = c.category_id 
LEFT JOIN budget_limits bl ON c.category_id = bl.category_id 
WHERE t.family_account_id = ? AND t.transaction_date >= ?
GROUP BY c.category_name, bl.limit_amount, bl.limit_percentage
```

### Reports Page (`/reports`)
**Required Tables**: 
- `monthly_summaries` (monthly data)
- `annual_summaries` (yearly trends)
- `transactions` (detailed data)

**Key Queries**:
```sql
-- Generate monthly report
SELECT ms.*, JSONB_ARRAY_ELEMENTS(ms.category_breakdown) as category_detail
FROM monthly_summaries ms 
WHERE ms.family_account_id = ? 
  AND ms.month_year BETWEEN ? AND ?
ORDER BY ms.month_year

-- Weekly spending breakdown
SELECT DATE_TRUNC('week', t.transaction_date) as week_start,
       SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as weekly_income,
       ABS(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END)) as weekly_expenses
FROM transactions t 
WHERE t.family_account_id = ? 
  AND t.transaction_date BETWEEN ? AND ?
GROUP BY DATE_TRUNC('week', t.transaction_date)
ORDER BY week_start
```

### Settings Page (`/settings`)
**Required Tables**: 
- `users` (profile data)
- `family_accounts` (account management)
- `users` (family members)

**Key Queries**:
```sql
-- Update user profile
UPDATE users 
SET full_name = ?, profile_picture = ? 
WHERE user_id = ?

-- Get family members
SELECT u.user_id, u.full_name, u.email, 
       CASE WHEN fa.created_by_user_id = u.user_id THEN 'Admin' ELSE 'Member' END as role
FROM users u 
JOIN family_accounts fa ON u.family_account_id = fa.family_account_id 
WHERE fa.family_account_id = ?

-- Add family member
INSERT INTO users (email, password_hash, full_name, family_account_id) 
VALUES (?, ?, ?, ?)
```

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens for API authentication
- Row-level security based on `family_account_id`
- User permissions: Admin (creator) vs Member roles
- Password hashing with bcrypt

### Data Protection
- UUID primary keys (no sequential IDs exposed)
- Email uniqueness constraint
- Soft deletes where appropriate
- Audit trails via `created_at`/`updated_at` timestamps

## 📊 Performance Optimization

### Indexing Strategy
- Foreign key columns indexed for join performance
- Date columns indexed for range queries
- Composite indexes for common query patterns
- JSONB columns for flexible data structures

### Query Optimization
- Pre-calculated summaries reduce real-time computation
- Pagination for large result sets
- Efficient date range queries
- Proper JOIN ordering

## 🧪 Test Data Structure

Each table will contain 2 sample records for testing:
- **Users**: Demo family members
- **Family Accounts**: Sample family budget accounts
- **Categories**: Default income/expense categories
- **Transactions**: Sample income and expense entries
- **Budget Limits**: Example budget constraints
- **Summaries**: Pre-calculated monthly/yearly data

This structure supports all application features while maintaining data integrity and optimal performance.
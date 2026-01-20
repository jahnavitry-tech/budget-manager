# Budget Manager Web Application - Technical Specification

## 🎯 Project Overview

A comprehensive budget management web application designed for personal and family financial tracking with AI-powered features, zero-cost hosting, and offline functionality.

---

## 👥 Target Audience & User Types

### Primary Users
- **Personal Users**: Individuals managing their personal finances
- **Families**: Multiple family members sharing a single account with equal access rights

### User Access Model
- **Single Family Account**: One account shared among all family members
- **Equal Permissions**: All users have full access to all data and features
- **Multiple Logins**: Each family member can create their own login credentials
- **Shared Data**: All transactions, budgets, and reports are visible to all account members

### Authentication Flow
1. User enters email and password
2. Credentials verified against database
3. JWT token generated upon successful authentication
4. Redirect to dashboard
5. Option to add additional family members via profile page

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Styling**: CSS Modules with utility classes
- **Icons**: React Icons (Feather Icons)
- **Charts**: Chart.js with react-chartjs-2

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Image Processing**: Tesseract.js (OCR)
- **PDF Generation**: PDFKit
- **AI Development**: In-house machine learning models for local testing
- **CORS**: Cross-origin resource sharing enabled

### Hosting & Deployment (Zero Cost)
- **Frontend**: Vercel (Free tier)
- **Backend**: Render.com (Free tier)
- **Database**: PostgreSQL on Render (Free tier)
- **File Storage**: Cloudinary (Free tier for images)

---

## 🔐 Database Structure & Relationships

### Core Tables

#### 1. users
```sql
PRIMARY KEY: user_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id

Fields:
- user_id (UUID) - Unique user identifier
- family_account_id (UUID) - Reference to family account
- email (VARCHAR) - Unique email address
- password_hash (VARCHAR) - Encrypted password
- full_name (VARCHAR) - User's full name
- profile_picture (TEXT) - Profile image URL
- created_at (TIMESTAMP) - Account creation timestamp
- last_login (TIMESTAMP) - Last login timestamp
- is_active (BOOLEAN) - Account status
```

#### 2. family_accounts
```sql
PRIMARY KEY: family_account_id (UUID)
FOREIGN KEY: created_by_user_id → users.user_id

Fields:
- family_account_id (UUID) - Unique family account identifier
- account_name (VARCHAR) - Family account name
- created_by_user_id (UUID) - Creator user reference
- created_at (TIMESTAMP) - Account creation timestamp
```

#### 3. categories
```sql
PRIMARY KEY: category_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id
FOREIGN KEY: created_by_user_id → users.user_id

Fields:
- category_id (UUID) - Unique category identifier
- family_account_id (UUID) - Family account reference
- category_name (VARCHAR) - Category name
- category_type (ENUM) - 'income' or 'expense'
- color_code (VARCHAR) - Hex color for UI display
- icon (VARCHAR) - Icon identifier
- description (TEXT) - Category description
- is_default (BOOLEAN) - System default category flag
- created_by_user_id (UUID) - Creator reference
- created_at (TIMESTAMP) - Creation timestamp
```

#### 4. transactions
```sql
PRIMARY KEY: transaction_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id
FOREIGN KEY: user_id → users.user_id
FOREIGN KEY: category_id → categories.category_id

Fields:
- transaction_id (UUID) - Unique transaction identifier
- family_account_id (UUID) - Family account reference
- user_id (UUID) - User who added transaction
- amount (DECIMAL) - Transaction amount (+ for income, - for expense)
- category_id (UUID) - Category reference
- description (TEXT) - Transaction description
- transaction_date (DATE) - Transaction date
- is_recurring (BOOLEAN) - Recurring transaction flag
- recurrence_pattern (ENUM) - 'daily', 'weekly', 'monthly', 'yearly'
- created_at (TIMESTAMP) - Creation timestamp
- updated_at (TIMESTAMP) - Last update timestamp
```

#### 5. budget_limits
```sql
PRIMARY KEY: budget_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id
FOREIGN KEY: category_id → categories.category_id (nullable)

Fields:
- budget_id (UUID) - Unique budget identifier
- family_account_id (UUID) - Family account reference
- category_id (UUID) - Category reference (NULL for overall budget)
- limit_amount (DECIMAL) - Fixed budget limit amount
- limit_percentage (DECIMAL) - Percentage of income limit
- period_type (ENUM) - 'monthly', 'weekly', 'custom'
- start_date (DATE) - Budget period start
- end_date (DATE) - Budget period end
- created_at (TIMESTAMP) - Creation timestamp
```

#### 6. monthly_summaries
```sql
PRIMARY KEY: summary_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id

Fields:
- summary_id (UUID) - Unique summary identifier
- family_account_id (UUID) - Family account reference
- month_year (DATE) - Month/year identifier (YYYY-MM-01)
- total_income (DECIMAL) - Total monthly income
- total_expenses (DECIMAL) - Total monthly expenses
- total_savings (DECIMAL) - Calculated savings
- category_breakdown (JSONB) - Detailed category spending
- created_at (TIMESTAMP) - Creation timestamp
```

#### 7. annual_summaries
```sql
PRIMARY KEY: annual_summary_id (UUID)
FOREIGN KEY: family_account_id → family_accounts.family_account_id

Fields:
- annual_summary_id (UUID) - Unique annual summary identifier
- family_account_id (UUID) - Family account reference
- year (INTEGER) - Year identifier
- monthly_data (JSONB) - Array of monthly summaries
- total_annual_income (DECIMAL) - Total annual income
- total_annual_expenses (DECIMAL) - Total annual expenses
- total_annual_savings (DECIMAL) - Total annual savings
- created_at (TIMESTAMP) - Creation timestamp
```

---

## 📱 Application Pages & User Flows

### 1. Login/Create Account Page (`/login`)
**Purpose**: User authentication and account creation

**UI Elements**:
- Email input field (text)
- Password input field (password)
- Confirm password field (password) - Registration only
- Full name input (text) - Registration only
- Account type radio buttons:
  - "Create New Family Account"
  - "Join Existing Family"
- Account name input (text)
- Submit button (primary)
- Toggle link between login/registration

**Data Flow**:
- **Login**: Email + Password → Auth API → JWT Token + User Data → Dashboard
- **Register**: Form Data → Auth API → New User + Family Account → Dashboard

**Database Operations**:
- **Login**: Query `users` table for email/password match
- **Register**: Insert into `users` and `family_accounts` tables

### 2. Dashboard Page (`/dashboard`)
**Purpose**: Overview of current financial status and quick access to features

**UI Elements**:
- **Summary Cards** (3 columns):
  - Total Income card (green theme)
  - Total Expenses card (red theme)
  - Remaining Balance card (blue theme) with percentage
- **Charts Section** (2 columns):
  - Income vs Expenses pie chart
  - Category breakdown bar chart
- **Recent Transactions** list:
  - Transaction items with description, category, amount, date
  - Time filter dropdown (Week/Month/Quarter)
- **Quick Actions**:
  - "Add Transaction" primary button (floating action)

**Data Displayed**:
- Current month totals from `monthly_summaries`
- Category breakdown from `transactions` grouped by `categories`
- Recent transactions list from `transactions` table
- Budget remaining percentage calculation

**Database Queries**:
- Monthly summary for current month
- Top 5 recent transactions
- Category-wise spending aggregation
- Budget limit comparison

### 3. Transactions Page (`/transactions`)
**Purpose**: Manage all financial transactions

**UI Elements**:
- **Filter Controls**:
  - Date range picker (calendar)
  - Category filter dropdown
  - Search by description
- **Add Transaction Button**: Primary action button
- **Transaction List**:
  - Table format with columns: Date, Category, Description, Amount, Added By, Actions
  - Color-coded amounts (green for +, red for -)
  - Edit/Delete action buttons
- **Receipt Scan Modal**:
  - Camera access button
  - File upload option
  - OCR processing indicator
  - Extracted transaction review form

**Data Flow**:
- Manual Entry: Form → Transactions API → Database
- Receipt Scan: Image → OCR → Data Extraction → Review → Confirm → Database

**Database Operations**:
- INSERT new transactions into `transactions` table
- UPDATE existing transactions
- DELETE transactions with proper authorization
- Query transactions with filtering and pagination

### 4. Budgets Page (`/budgets`)
**Purpose**: Set and manage budget limits

**UI Elements**:
- **Overall Budget Panel**:
  - Monthly income input
  - Overall budget limit slider/percentage
  - Visual progress bar
- **Category Budgets**:
  - Expandable category sections
  - Individual limit setting (amount or percentage)
  - Current spending vs limit visualization
- **Alert Settings**:
  - Enable/disable budget alerts
  - Alert threshold percentages
  - Notification preferences

**Data Flow**:
- Set Limit: Form → Budget API → `budget_limits` table
- Real-time Monitoring: Transactions → Budget Calculation → Alert Trigger
- Limit Updates: Edit Form → Update API → Database

**Database Operations**:
- INSERT/UPDATE budget limits in `budget_limits` table
- Calculate current spending against limits
- Generate budget alert notifications

### 5. Reports Page (`/reports`)
**Purpose**: Generate financial reports and analytics

**Data Import/Export Features**:
- **Import Support**: Image files (receipts), CSV bank statements, PDF documents
- **Export Formats**: PDF generation of entire page content, CSV data export
- **File Processing**: OCR for image imports, CSV parsing for bank statements

**UI Elements**:
- **Report Generator**:
  - Date range selector
  - Report type dropdown (Monthly/Annual/Custom)
  - Export format options (PDF/CSV)
- **Calendar View**:
  - 12-month grid display
  - Color-coded months based on financial health
  - Click to view detailed monthly report
- **Visualization Charts**:
  - Spending trends over time
  - Category distribution pie charts
  - Income vs Expense comparison
- **Export Controls**:
  - Generate PDF button
  - Download CSV button
  - Share report options

**Data Flow**:
- Report Request: Parameters → Report API → Data Aggregation → Report Generation
- PDF Creation: Report Data → PDF Generator → Downloadable File
- Historical Data: `monthly_summaries` and `annual_summaries` tables

**Database Operations**:
- Query aggregated data from summary tables
- Generate custom reports from transaction data
- Store generated reports metadata

### 6. Settings Page (`/settings`)
**Purpose**: User and account management

**Additional Features**:
- **Currency Management**: Single currency (USD) display with option to change in future versions
- **Profile Currency Settings**: Currency preference storage for future multi-currency support

**UI Elements**:
- **Profile Section**:
  - Full name edit
  - Email address display
  - Profile picture upload
  - Password change form
- **Family Account Management**:
  - Account name display
  - Family members list
  - "Add Family Member" button
  - Member removal options
- **Preferences**:
  - Currency selection
  - Notification settings
  - Theme options
  - Data export preferences

**Data Flow**:
- Profile Update: Form → User API → `users` table update
- Family Management: Actions → Family API → Database updates
- Settings Changes: Preferences → Settings API → User preferences storage

**Database Operations**:
- UPDATE user profile information
- Manage family account relationships
- Store user preferences

---

## 🎨 UI Components & Style Guide

### Color Palette
```css
:root {
  --primary: #4361ee;     /* Blue - Primary actions */
  --secondary: #f72585;   /* Pink - Accents */
  --success: #4cc9f0;     /* Teal - Positive actions */
  --warning: #f8961e;     /* Orange - Warnings */
  --danger: #e63946;      /* Red - Negative actions/errors */
  --light: #f8f9fa;       /* Light background */
  --dark: #212529;        /* Dark text */
  --gray: #6c757d;        /* Gray text/icons */
  --card-bg: #ffffff;     /* Card backgrounds */
  --border: #dee2e6;      /* Border colors */
}
```

### Typography
- **Font Family**: Inter (primary), System fonts (fallback)
- **Headings**: Bold, Inter, sizes 1.5rem-2.5rem
- **Body Text**: Normal, Inter, 1rem
- **Labels**: Semi-bold, 0.875rem-1rem

### Component Library

#### Buttons
```css
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--secondary); color: white; }
.btn-success { background: var(--success); color: white; }
.btn-danger { background: var(--danger); color: white; }
.btn-outline { background: transparent; border: 2px solid var(--primary); }
```

#### Cards
```css
.card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}
```

#### Forms
```css
.form-group { margin-bottom: 1rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-input { 
  width: 100%; 
  padding: 0.75rem; 
  border: 2px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.3s ease;
}
```

#### Grid System
```css
.grid { display: grid; gap: 1rem; }
.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; }
}
```

### Responsive Design
- **Mobile First**: Base styles for mobile devices
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Flexible Layouts**: Grid and flexbox for adaptive designs
- **Touch Friendly**: Minimum 44px touch targets

---

## ☁️ Hosting & Deployment Plan

### Zero-Cost Deployment Strategy

#### Frontend (Vercel - Free Tier)
- **Repository**: GitHub/GitLab integration
- **Build Process**: `npm run build` in client directory
- **Deployment**: Automatic deployments on git push
- **Domain**: vercel.app subdomain (custom domain optional)
- **Features**: CDN, SSL, automatic HTTPS

#### Backend (Render - Free Tier)
- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js runtime
- **Sleep Policy**: Goes to sleep after 15 minutes of inactivity

#### Database (Render - Free Tier)
- **Type**: PostgreSQL
- **Storage**: 256 MB RAM, 1 GB storage
- **Connections**: 20 concurrent connections
- **Backup**: Manual snapshots available
- **SSL**: Enabled by default

#### File Storage (Cloudinary - Free Tier)
- **Storage**: 25 credits/month (enough for receipt images)
- **Bandwidth**: 25GB monthly
- **Transformations**: Unlimited
- **API Access**: RESTful API integration

### Prerequisites
1. **GitHub/GitLab Account**: For Vercel integration
2. **Render Account**: For backend and database hosting
3. **Domain Name** (Optional): Custom domain setup
4. **SSL Certificate**: Automatically provided by platforms

### Deployment Steps

**Important Note**: For AI features, API keys for external models will be requested during deployment with free alternatives suggested.

1. **Frontend Deployment**:
```bash
# In client directory
npm run build
# Connect to Vercel and deploy build folder
```

2. **Backend Deployment**:
```bash
# Push code to GitHub
# Create Web Service on Render
# Set environment variables
# Deploy from repository
```

3. **Database Setup**:
```bash
# Create PostgreSQL instance on Render
# Run schema.sql file
# Configure connection strings
```

4. **Environment Variables**:
```env
# Backend .env
PORT=5000
NODE_ENV=production
DB_HOST=your-render-db-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## 🔄 Data Flow Architecture

### Real-time Data Synchronization
1. **User Actions** → **API Calls** → **Database Updates**
2. **WebSocket Connections** for family member sync
3. **Local Storage Caching** for offline access
4. **Periodic Sync** when connectivity restored

### Offline Functionality
- **Cached Data**: Recent transactions and summaries stored locally
- **Pending Actions**: Queued transactions for sync when online
- **Limited Features**: AI features disabled offline
- **Visual Indicators**: Clear offline status display

### Data Processing Pipeline
1. **Input Collection**: User forms, receipt scanning, manual entry
2. **Validation Layer**: Client and server-side validation
3. **Business Logic**: Budget calculations, categorization rules
4. **Data Persistence**: PostgreSQL transaction management
5. **Cache Updates**: Redis/local storage for performance
6. **Real-time Updates**: WebSocket broadcasting to family members

### Security Measures
- **Authentication**: JWT token-based with expiration
- **Authorization**: Role-based access control
- **Data Encryption**: HTTPS everywhere, encrypted passwords
- **Input Sanitization**: Protection against SQL injection and XSS
- **Rate Limiting**: API request throttling

---

## 🏗️ Technical Implementation Details

### API Endpoint Structure

#### Authentication Routes
```
POST /api/auth/register    # Create new account
POST /api/auth/login       # User authentication
POST /api/auth/logout      # Session termination
```

#### Transaction Routes
```
GET /api/transactions               # List transactions with filters
POST /api/transactions              # Create new transaction
PUT /api/transactions/:id           # Update transaction
DELETE /api/transactions/:id        # Delete transaction
POST /api/transactions/scan-receipt # Process receipt image
```

#### Category Routes
```
GET /api/categories                 # List categories
POST /api/categories                # Create custom category
PUT /api/categories/:id             # Update category
DELETE /api/categories/:id          # Delete category
```

#### Budget Routes
```
GET /api/budgets                    # Get budget limits
POST /api/budgets                   # Set budget limit
PUT /api/budgets/:id                # Update budget limit
DELETE /api/budgets/:id             # Remove budget limit
```

#### Report Routes
```
GET /api/reports/monthly/:year/:month  # Monthly summary
GET /api/reports/annual/:year          # Annual report
POST /api/reports/generate-pdf         # Create PDF report
GET /api/reports/export-csv            # Export data as CSV
```

### State Management Strategy

#### React Context Providers
1. **AuthContext**: User authentication and session management
2. **BudgetContext**: Financial data and budget state
3. **UIContext**: Theme preferences and UI state

#### Data Fetching Patterns
- **Initial Load**: Fetch essential data on component mount
- **Real-time Updates**: WebSocket subscriptions for live data
- **Lazy Loading**: Pagination for large datasets
- **Error Handling**: Graceful degradation and retry mechanisms

### Performance Optimization

#### Frontend Optimizations
- **Code Splitting**: Route-based chunking
- **Image Optimization**: Lazy loading and compression
- **Caching**: Service workers for offline support
- **Bundle Analysis**: Regular size monitoring

#### Backend Optimizations
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient joins and aggregations
- **Connection Pooling**: PostgreSQL connection management
- **Response Caching**: Frequently accessed data caching

---

## ⚠️ Missing Information & Questions

### Resolved Specifications

1. **Currency Support**: Single currency (USD) with future flexibility for user changes in profile page

2. **Data Import/Export**: Support for image files (receipts), CSV files, and PDF documents

3. **Backup Strategy**: No automatic backup storage required at this time

4. **Notification System**: Visual alerts only (no audio notifications)

5. **Mobile Experience**: Mobile-friendly responsive design with seamless UX for mobile users

6. **AI Implementation**: In-house built solutions for local testing; external API keys will be requested during deployment phase with free alternatives suggested

7. **Report Customization**: Export entire page content to PDF format, including all displayed details

8. **Family Member Management**: Equal permissions - any family member can add or delete other family members

9. **Data Retention**: Standard retention policies apply (no special cleanup requirements)

10. **Accessibility**: Basic accessibility features included in responsive design

---

## 📈 Future Enhancement Roadmap

### Phase 1: Core Features (Current Focus)
- [ ] Complete transaction management
- [ ] Receipt scanning implementation
- [ ] Budget limit enforcement
- [ ] Basic reporting functionality

### Phase 2: Advanced Features
- [ ] AI-powered categorization (in-house development)
- [ ] Spending pattern analysis (in-house development)
- [ ] Predictive budgeting (in-house development)
- [ ] Advanced data visualization

### Phase 3: Premium Features
- [ ] Multi-currency support
- [ ] Bank integration APIs
- [ ] Advanced reporting templates
- [ ] Team collaboration features

### Phase 4: Enterprise Features
- [ ] Audit trails and logging
- [ ] Advanced security features
- [ ] Custom role management
- [ ] API access for third-party integrations

---

This document serves as the comprehensive technical specification for the Budget Manager application. It covers all aspects of the system architecture, user flows, database design, UI components, and deployment strategy. The information is organized to serve as a reference for future development and implementation phases.
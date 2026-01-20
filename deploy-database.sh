#!/bin/bash
# Supabase Database Deployment Script

echo "🚀 Starting Supabase Database Deployment..."

# Database connection details (from your Session Pooler)
DB_HOST="aws-0-us-west-2.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.xwauuamnpcaxaneiclnx"
DB_PASSWORD="ChandanaShree@97"

# Export for psql usage
export PGPASSWORD=$DB_PASSWORD

echo "1️⃣ Creating database schema..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f ./database/schema.sql

echo "2️⃣ Inserting test data..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f ./database/test_data.sql

echo "3️⃣ Verifying deployment..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c "
SELECT 'Family Accounts' as table_name, COUNT(*) as record_count FROM family_accounts
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'Transactions' as table_name, COUNT(*) as record_count FROM transactions
UNION ALL
SELECT 'Budget Limits' as table_name, COUNT(*) as record_count FROM budget_limits;
"

echo "✅ Database deployment completed successfully!"
echo "🔗 Connection verified with Session Pooler (IPv4 compatible)"
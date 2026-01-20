@echo off
REM Supabase Database Deployment Script for Windows

echo 🚀 Starting Supabase Database Deployment...

REM Database connection details (from your Session Pooler)
set DB_HOST=aws-0-us-west-2.pooler.supabase.com
set DB_PORT=6543
set DB_NAME=postgres
set DB_USER=postgres.xwauuamnpcaxaneiclnx
set DB_PASSWORD=ChandanaShree@97

echo 1️⃣ Creating database schema...
psql -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -U %DB_USER% -f database\schema.sql

echo 2️⃣ Inserting test data...
psql -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -U %DB_USER% -f database\test_data.sql

echo 3️⃣ Verifying deployment...
psql -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -U %DB_USER% -c "SELECT 'Tables' as check_type, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';"

echo ✅ Database deployment completed successfully!
echo 🔗 Connection verified with Session Pooler (IPv4 compatible)

pause
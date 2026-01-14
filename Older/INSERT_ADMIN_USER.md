# Insert Admin User into Database

## Problem
The database user `u187453795_Admin` exists in MySQL, but there's no corresponding user record in the `users` table. The application can't authenticate because the `users` table is empty for admin.

## Solution
Add an admin user record to the `users` table via phpMyAdmin.

## Steps

### Option 1: Using phpMyAdmin SQL Query (Recommended)
1. Login to phpMyAdmin in Hostinger cPanel
2. Select Database: `U187453795_SrpAIDataGate`
3. Click "SQL" tab
4. Paste this query:

```sql
INSERT INTO users (email, license_key, status, credits, created_at) 
VALUES ('admin@serpifai.com', 'SERP-FAI-ADMIN-KEY-123456', 'active', 10000, NOW());
```

5. Click "Go" or press Enter
6. Expected: "1 row inserted successfully"

### Option 2: Using phpMyAdmin Insert Tab
1. Select Database: `U187453795_SrpAIDataGate`
2. Select Table: `users`
3. Click "Insert" tab
4. Fill in the form:
   - **email:** admin@serpifai.com
   - **license_key:** SERP-FAI-ADMIN-KEY-123456
   - **status:** active
   - **credits:** 10000
   - **created_at:** Leave blank (NOW() adds current timestamp)
5. Click "Go"

## Verification
After insertion, run this query to verify:

```sql
SELECT * FROM users WHERE email = 'admin@serpifai.com';
```

Expected result:
```
id    | email                 | license_key                    | status | credits | created_at          | last_login
------|----------------------|-------------------------------|--------|---------|---------------------|----------
2     | admin@serpifai.com    | SERP-FAI-ADMIN-KEY-123456     | active | 10000   | 2025-11-29 10:00:00 | NULL
```

## Now Test the System
1. Visit: https://serpifai.com/serpifai_php/diagnostic_post.php
2. All 5 tests should now show "OK"
3. Try creating a folder in the add-on
4. It should work without errors!

## Summary
- **Database User** (`u187453795_Admin`): Already exists, now assigned to database ✅
- **Application User** (in `users` table): Just created ✅
- **System Ready:** For full testing ✅

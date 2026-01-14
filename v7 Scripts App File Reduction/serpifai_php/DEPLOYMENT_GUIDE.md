# 🚀 HOSTINGER DEPLOYMENT GUIDE - SerpifAI v6

## 📋 MySQL Database Setup

### Database Credentials
```
Host: localhost
Database: u187453795_SrpAIDataGate
Username: u187453795_Admin
Password: OoRB1Pz9i?H
```

### Step 1: Create Database Tables

1. Log in to Hostinger's **hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Click on **phpMyAdmin**
4. Select database: `u187453795_SrpAIDataGate`
5. Click **SQL** tab
6. Copy the entire contents of `database/schema.sql`
7. Paste into SQL editor
8. Click **Go**

This will create:
- ✅ `users` table (with test account)
- ✅ `projects` table
- ✅ `transactions` table
- ✅ `activity_logs` table
- ✅ `competitor_analyses` table
- ✅ `fetcher_cache` table
- ✅ `payment_history` table

---

## 📁 Upload PHP Files to Hostinger

### Step 2: Upload Files via File Manager or FTP

Upload the entire `serpifai_php` folder to your Hostinger account:

**Recommended path:** `/public_html/serpifai_api/`

**Files to upload:**
```
/public_html/serpifai_api/
├── api_gateway.php          (Main entry point)
├── config/
│   └── db_config.php         (Database config)
├── database/
│   └── schema.sql            (Database schema)
├── apis/
│   ├── gemini_api.php
│   └── serper_api.php
└── handlers/
    ├── workflow_handler.php
    ├── project_handler.php
    ├── fetcher_handler.php
    ├── content_handler.php
    └── competitor_handler.php
```

---

## 🔧 Configure Apps Script

### Step 3: Set Script Properties

1. Open your Apps Script project:
   https://script.google.com/home/projects/1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3/edit

2. Click ⚙️ **Settings** (left sidebar)

3. Scroll to **Script Properties**

4. Click **Add property** and add these:

```
Property Name              | Property Value
---------------------------|---------------------------------------
GEMINI_API_KEY             | AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E
SERPER_KEY                 | f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2
PAGE_SPEED_KEY             | AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc
OPEN_PAGERANK_KEY          | w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4
PHP_GATEWAY_URL            | https://yourdomain.com/serpifai_api/api_gateway.php
```

**Important:** Replace `yourdomain.com` with your actual Hostinger domain!

---

## 🧪 Test Account Credentials

### Step 4: Use Test Account

The test account has been automatically created in the database with:

```
Email: test@serpifai.com
License Key: TEST-SERPIFAI-2025-666
Credits: 666
Status: Active
```

**To use in Apps Script:**
1. Open any Google Sheet
2. Click **SerpifAI** → **Open Dashboard**
3. Enter license key: `TEST-SERPIFAI-2025-666`
4. Start testing!

---

## ✅ Verify Deployment

### Step 5: Test Gateway Connection

1. **Direct API Test:**
   Visit: `https://yourdomain.com/serpifai_api/api_gateway.php`
   
   Expected response:
   ```json
   {
     "success": false,
     "error": "Missing license key"
   }
   ```
   
   ✅ This means the gateway is working!

2. **Test with License Key:**
   ```bash
   curl -X POST https://yourdomain.com/serpifai_api/api_gateway.php \
     -H "Content-Type: application/json" \
     -d '{
       "license": "TEST-SERPIFAI-2025-666",
       "action": "check_status",
       "payload": {}
     }'
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "user": {
       "credits": 666,
       "status": "active"
     }
   }
   ```

3. **Test from Apps Script:**
   - In Apps Script Editor, run function: `TEST_GatewayConnection()`
   - Check **Execution log** (View → Logs)
   - Should see: ✅ Gateway connection successful

---

## 🔐 Security Checklist

- [x] Database credentials stored in `config/db_config.php` (not in code)
- [x] API keys stored in Apps Script Properties (not in code)
- [x] CORS enabled for Apps Script origin
- [x] All API calls go through authentication
- [x] Credit validation before execution
- [x] Transaction logging enabled
- [x] Rate limiting via credit system

---

## 📊 Monitor Usage

### View Activity Logs

In phpMyAdmin:
```sql
SELECT * FROM activity_logs 
WHERE user_id = (SELECT id FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666')
ORDER BY created_at DESC
LIMIT 50;
```

### Check Transactions

```sql
SELECT * FROM transactions 
WHERE user_id = (SELECT id FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666')
ORDER BY created_at DESC;
```

### Check Credits

```sql
SELECT email, license_key, credits, total_credits_used, status 
FROM users 
WHERE license_key = 'TEST-SERPIFAI-2025-666';
```

---

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Check credentials in `config/db_config.php`
- Verify database exists in Hostinger
- Check database user has permissions

### Error: "Invalid or inactive license key"
- Run schema.sql again to create test account
- Verify license key: `TEST-SERPIFAI-2025-666`

### Error: "Insufficient credits"
- Reset credits:
  ```sql
  UPDATE users SET credits = 666 WHERE license_key = 'TEST-SERPIFAI-2025-666';
  ```

### Error: "CORS policy blocked"
- Add your domain to CORS headers in `api_gateway.php`
- Or use `Access-Control-Allow-Origin: *` (already configured)

---

## 🎉 Success Criteria

You know deployment is complete when:

1. ✅ Database tables created (7 tables)
2. ✅ Test account exists with 666 credits
3. ✅ PHP files uploaded to Hostinger
4. ✅ API gateway responds to requests
5. ✅ Apps Script can connect to gateway
6. ✅ Can authenticate with test license key
7. ✅ Credits deduct after actions

---

## 📞 Support

If you encounter issues:
1. Check Hostinger error logs (File Manager → error_log)
2. Check Apps Script execution logs (View → Executions)
3. Verify all file paths are correct
4. Test API gateway directly in browser

---

**Version:** 6.0.0  
**Date:** November 27, 2025  
**Status:** READY TO DEPLOY ✅

# 🚀 COMPLETE HOSTINGER DEPLOYMENT GUIDE

## 📁 FOLDER STRUCTURE (Keep Exactly As Is)

Upload the entire `serpifai_php` folder to Hostinger. **Do NOT rename it!**

```
/public_html/serpifai_php/          ← Upload this exact folder
├── api_gateway.php                  ← Main entry point
├── test_system.php                  ← Test script
├── .htaccess                        ← Apache config
├── config/
│   └── db_config.php                ← Database credentials & API keys
├── database/
│   └── schema.sql                   ← MySQL schema (run this!)
├── apis/                            ← All 4 API integrations
│   ├── gemini_api.php               ✅ Gemini AI
│   ├── serper_api.php               ✅ Serper SERP data
│   ├── pagespeed_api.php            ✅ PageSpeed Insights
│   └── openpagerank_api.php         ✅ OpenPageRank
├── handlers/                        ← Business logic
│   ├── workflow_handler.php
│   ├── project_handler.php
│   ├── competitor_handler.php
│   ├── content_handler.php
│   └── fetcher_handler.php
└── stripe/                          ← Payment webhook
    └── webhook_handler.php
```

---

## 🔧 STEP 1: Upload to Hostinger

### Option A: File Manager (Easiest)
1. Log in to Hostinger **hPanel**
2. Go to **Files** → **File Manager**
4. Navigate to `/public_html/`
5. Click **Upload**
6. Select the entire `serpifai_php` folder
7. Wait for upload to complete

### Option B: FTP (Faster for large files)
1. Use FileZilla or any FTP client
2. Connect to your Hostinger FTP:
   - Host: `ftp.yourdomain.com`
   - Username: Your Hostinger username
   - Password: Your Hostinger password
3. Navigate to `/public_html/`
4. Drag and drop `serpifai_php` folder

**Result:** Your files will be at `/public_html/serpifai_php/`

---

## 🗄️ STEP 2: Create MySQL Database & Tables

### 2.1 Database Already Created ✅
```
Database: u187453795_SrpAIDataGate
Username: u187453795_Admin
Password: OoRB1Pz9i?H
```

### 2.2 Run Schema SQL

1. In hPanel, go to **Databases** → **phpMyAdmin**
2. Click on database: `u187453795_SrpAIDataGate`
3. Click **SQL** tab
4. Open file: `serpifai_php/database/schema.sql`
5. Copy ALL contents
6. Paste into SQL editor
7. Click **Go**

**This creates:**
- ✅ 7 database tables
- ✅ Test account with 666 credits
- ✅ Indexes for performance

---

## 🔑 STEP 3: Verify Configuration

Your API keys are already configured in `config/db_config.php`:

```php
✅ GEMINI_API_KEY: AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E
✅ SERPER_API_KEY: f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2
✅ PAGE_SPEED_API_KEY: AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc
✅ OPEN_PAGERANK_API_KEY: w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4
```

**No changes needed!** All API keys are pre-configured.

---

## ✅ STEP 4: Test Your Deployment

### 4.1 Run Test Script

Visit in your browser:
```
https://yourdomain.com/serpifai_php/test_system.php
```

**Expected Output:**
```
========================================
SERPIFAI v6 - SYSTEM TEST
========================================

[TEST 1] Database Connection...
   ✅ Connected to: u187453795_SrpAIDataGate

[TEST 2] Database Tables...
   ✅ Table 'users' exists
   ✅ Table 'projects' exists
   ✅ Table 'transactions' exists
   ✅ Table 'activity_logs' exists
   ✅ Table 'competitor_analyses' exists
   ✅ Table 'fetcher_cache' exists
   ✅ Table 'payment_history' exists

[TEST 3] Test Account...
   ✅ Test account found
   📧 Email: test@serpifai.com
   🔑 License: TEST-SERPIFAI-2025-666
   💳 Credits: 666
   📊 Status: active

[TEST 4] API Keys Configuration...
   ✅ GEMINI_API_KEY configured
   ✅ SERPER_API_KEY configured
   ✅ PAGE_SPEED_API_KEY configured
   ✅ OPEN_PAGERANK_API_KEY configured

[TEST 5] Credit Costs...
   💰 Workflow Stage 1: 5 credits
   💰 Workflow Stage 2: 10 credits
   💰 Competitor Analysis: 30 credits
   💰 Fetcher Single: 1 credit

[TEST 6] Transaction Logging...
   ✅ Test transaction created: TEST-1234567890
   ✅ Test transaction cleaned up

========================================
TEST SUMMARY
========================================

✅ Passed: 6 tests
🎉 ALL TESTS PASSED!
✅ System is ready for deployment

========================================
TEST ACCOUNT CREDENTIALS
========================================

📧 Email: test@serpifai.com
🔑 License Key: TEST-SERPIFAI-2025-666
💳 Credits: 666
📊 Status: Active

Use this license key in Google Sheets to test!
```

### 4.2 Test API Gateway

Visit:
```
https://yourdomain.com/serpifai_php/api_gateway.php
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing license key"
}
```

✅ This means the gateway is working!

### 4.3 Test with cURL

```bash
curl -X POST https://yourdomain.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "TEST-SERPIFAI-2025-666",
    "action": "check_status",
    "payload": {}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "email": "test@serpifai.com",
    "license_key": "TEST-SERPIFAI-2025-666",
    "credits": 666,
    "status": "active"
  }
}
```

---

## 🔗 STEP 5: Connect Apps Script

### 5.1 Add PHP_GATEWAY_URL to Apps Script

1. Open: https://script.google.com/home/projects/1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3/edit
2. Click ⚙️ **Settings**
3. Scroll to **Script Properties**
4. Click **Add property**
5. Add:

```
Property Name: PHP_GATEWAY_URL
Property Value: https://yourdomain.com/serpifai_php/api_gateway.php
```

**Important:** Replace `yourdomain.com` with your actual Hostinger domain!

### 5.2 Other Script Properties (already set)

These should already be configured:
```
✅ GEMINI_API_KEY: AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E
✅ SERPER_KEY: f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2
✅ PAGE_SPEED_KEY: AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc
✅ OPEN_PAGERANK_KEY: w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4
```

---

## 🧪 STEP 6: Test Integration

### 6.1 Test from Apps Script

1. In Apps Script Editor, click **Run** → `TEST_GatewayConnection`
2. Check **Execution log** (View → Logs)
3. Should see: ✅ Gateway connection successful

### 6.2 Test from Google Sheets

1. Open any Google Sheet
2. Refresh the page (Ctrl+R or Cmd+R)
3. Look for **SerpifAI** menu
4. Click **SerpifAI** → **Open Dashboard**
5. Enter license key: `TEST-SERPIFAI-2025-666`
6. Try any action (will deduct from 666 credits)

---

## 📊 ALL 4 APIS ARE INTEGRATED

### ✅ 1. Gemini AI (`apis/gemini_api.php`)
- Content generation
- AI suggestions
- Reasoning tools
- **Actions:** `gemini_generate`, `ai_suggest_inputs`, `ai_suggest_field`

### ✅ 2. Serper (`apis/serper_api.php`)
- Google SERP data
- Competitor research
- Keyword analysis
- **Actions:** `serper_search`, `fetch_competitor`, `fetch_snapshot`

### ✅ 3. PageSpeed Insights (`apis/pagespeed_api.php`)
- Performance scores
- Core Web Vitals (LCP, FID, CLS)
- Accessibility, SEO scores
- **Actions:** `pagespeed_analyze`, `get_core_web_vitals`

### ✅ 4. OpenPageRank (`apis/openpagerank_api.php`)
- Domain authority
- PageRank scores
- Batch domain ranking
- **Actions:** `get_domain_rank`, `get_batch_ranks`

---

## 💳 CREDIT COSTS

| Action | Credits | API Used |
|--------|---------|----------|
| Workflow Stage 1 | 5 | Gemini |
| Workflow Stage 2 | 10 | Gemini + Serper |
| Workflow Stage 3 | 15 | Gemini + PageSpeed |
| Workflow Stage 4 | 20 | Gemini + OpenPageRank |
| Workflow Stage 5 | 25 | All APIs |
| Competitor Analysis | 30 | Serper + PageSpeed + OpenPageRank |
| Fetcher Single URL | 1 | None (direct) |
| Fetcher Multi URL | 2 | None (direct) |
| Content Generation | 15 | Gemini |
| **Project Management** | **0 (FREE)** | Database only |
| **Check Status** | **0 (FREE)** | Database only |

---

## 🐛 TROUBLESHOOTING

### Error: "Database connection failed"
**Fix:**
1. Check `/public_html/serpifai_php/config/db_config.php`
2. Verify credentials match:
   - DB_NAME: `u187453795_SrpAIDataGate`
   - DB_USER: `u187453795_Admin`
   - DB_PASS: `OoRB1Pz9i?H`

### Error: "Table 'users' doesn't exist"
**Fix:**
1. Go to phpMyAdmin
2. Select database: `u187453795_SrpAIDataGate`
3. Run `database/schema.sql` again

### Error: "Invalid or inactive license key"
**Fix:**
1. Reset test account in phpMyAdmin:
```sql
UPDATE users SET credits = 666, status = 'active' 
WHERE license_key = 'TEST-SERPIFAI-2025-666';
```

### Error: "404 Not Found" for api_gateway.php
**Fix:**
1. Verify folder structure: `/public_html/serpifai_php/api_gateway.php`
2. Check `.htaccess` exists
3. Check file permissions (644 for files, 755 for folders)

### Gateway responds but Apps Script can't connect
**Fix:**
1. Check `PHP_GATEWAY_URL` in Apps Script Script Properties
2. Must be: `https://yourdomain.com/serpifai_php/api_gateway.php`
3. Replace `yourdomain.com` with your actual domain

---

## 📈 MONITORING

### View Transaction History
```sql
SELECT * FROM transactions 
WHERE user_id = (SELECT id FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666')
ORDER BY created_at DESC 
LIMIT 20;
```

### Check Credit Usage
```sql
SELECT 
    email, 
    license_key, 
    credits, 
    total_credits_used, 
    status 
FROM users 
WHERE license_key = 'TEST-SERPIFAI-2025-666';
```

### View Activity Logs
```sql
SELECT * FROM activity_logs 
WHERE user_id = (SELECT id FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666')
ORDER BY created_at DESC 
LIMIT 50;
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Uploaded `serpifai_php` folder to `/public_html/`
- [ ] Ran `database/schema.sql` in phpMyAdmin
- [ ] Test script passes all 6 tests
- [ ] API gateway responds to requests
- [ ] Added `PHP_GATEWAY_URL` to Apps Script
- [ ] Apps Script can connect to gateway
- [ ] Test account works (666 credits)
- [ ] All 4 APIs are accessible

---

## 🎉 YOU'RE DONE!

Your SerpifAI v6 backend is now deployed on Hostinger with:

✅ **MySQL database** configured and tables created  
✅ **4 API integrations** (Gemini, Serper, PageSpeed, OpenPageRank)  
✅ **Credit system** tracking usage  
✅ **Test account** with 666 credits  
✅ **Apps Script** connected to PHP gateway  
✅ **Transaction logging** for auditing  
✅ **Caching** for performance  

**Test Account:**
- License: `TEST-SERPIFAI-2025-666`
- Credits: 666
- Email: test@serpifai.com

**Your Gateway:**
`https://yourdomain.com/serpifai_php/api_gateway.php`

---

**Version:** 6.0.0  
**Date:** November 27, 2025  
**Status:** PRODUCTION READY 🚀

# 🔍 DIAGNOSE GEMINI HTTP 403 ERROR

## PROBLEM
HTTP 403 from Gemini API - but `.env` file exists with API key.

## POSSIBLE CAUSES

### 1. Model Name Issue (MOST LIKELY)
The model `gemini-2.5-flash` might not exist or be available yet.
- **Fix**: Change to `gemini-1.5-flash` or `gemini-1.5-pro`

### 2. API Key Restrictions
Google Cloud Console may have IP/domain restrictions on the API key.
- **Check**: Google Cloud Console → Credentials → API Key → Restrictions

### 3. Gemini API Not Enabled
The "Generative Language API" needs to be enabled in Google Cloud.
- **Check**: Google Cloud Console → APIs & Services → Enable APIs

### 4. Billing Not Enabled
Google requires billing to be set up for Gemini API.
- **Check**: Google Cloud Console → Billing

## ENHANCED ERROR LOGGING

I've added detailed error logging to `gemini_api.php`:
- ✅ Shows actual error message from Google API
- ✅ Verifies API key is loaded (logs key length, not actual key)
- ✅ Shows cURL errors if network issue
- ✅ Logs model name being used

## NEXT STEPS

### Step 1: Upload Enhanced gemini_api.php
Upload `v6_saas/serpifai_php/apis/gemini_api.php` to:
`public_html/serpifai_php/apis/gemini_api.php`

### Step 2: Run Test Again
Run `TEST_PHPBackend` in Apps Script

**You'll now see detailed error like:**
```
❌ Gemini API returned HTTP 403: API key not valid. Please pass a valid API key.
OR
❌ Gemini API returned HTTP 403: models/gemini-2.5-flash is not found
OR
❌ Gemini API returned HTTP 403: The Generative Language API has not been enabled
```

### Step 3: Fix Based on Error Message

**If error says "model not found":**
- Change model from `gemini-2.5-flash` to `gemini-1.5-flash`
- Location: Apps Script → UI_Gateway.gs or wherever model is specified

**If error says "API not enabled":**
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click **Enable**
3. Wait 1-2 minutes for propagation

**If error says "billing not enabled":**
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account to your project
3. Gemini API may require paid tier

**If error says "API key not valid":**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new API key
3. Update `.env` file with new key

---

## TESTING THE API KEY MANUALLY

You can test the API key directly with curl:

```bash
curl -X POST \
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBDXgKxxmQ6EOnen5MkTlVUKjn8XXiLy_U' \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{"text": "Hello"}]
    }]
  }'
```

**If this works** → Issue is in our PHP code  
**If this fails with 403** → Issue is with Google Cloud setup

---

**Next Action**: Upload enhanced `gemini_api.php` and run test to see the actual error message! 🔍

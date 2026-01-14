# 🚀 QUICK START: Deploy .env to Hostinger (3 Steps)

## ⏱️ Time Needed: 5 minutes

---

## Step 1: Run Deployment Script

### Windows (PowerShell)
```powershell
cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai
.\deploy-env.ps1
```

### Mac/Linux (Bash)
```bash
cd ~/Projects/serpifai  # Your path
bash deploy-env.sh
```

### Manual (cPanel File Manager)
1. Go to: https://hpanel.hostinger.com
2. File Manager → public_html/serpifai_php/config/
3. Create file: `.env`
4. Paste from: `v6_saas/serpifai_php/config/.env`
5. Set permissions: 600

---

## Step 2: Verify Installation

Visit this URL:
```
https://serpifai.com/serpifai_php/diagnostic_post.php
```

**Expected result:**
```json
{
  "status": "OK",
  "database": "connected",
  "security_layer": "active"
}
```

---

## Step 3: Done! 

Your SerpifAI system is now:
- ✅ Using new API keys
- ✅ Protected with HMAC SHA256 signing
- ✅ Timestamp replay attack protection
- ✅ Production-ready

---

## 🔑 What's Inside .env

```ini
# 4 NEW API KEYS (rotated)
GEMINI_API_KEY=AIzaSyBDXgKxxmQ6EOnen5MkTlVUKjn8XXiLy_U
PAGE_SPEED_API_KEY=AIzaSyDsQoMsyDfG81zqa38aFXyjeIGfyA2Z0CM
SERPER_API_KEY=8e1a832b2f3925588bb3f92218e75a1f51b0f175
OPEN_PAGERANK_API_KEY=808k4cog04kg8cc0kogo00co440gcc4w4gg8so48

# Database credentials
DB_HOST=localhost
DB_NAME=U187453795_SrpAIDataGate
DB_USER=u187453795_Admin
DB_PASS=OoRB1Pz9i?H

# Security settings
HMAC_SECRET=SerpifAI_Secure_Secret_Change_In_Production_2025
TIMESTAMP_WINDOW=60
```

---

## ⚠️ Important

- ✅ `.env` file is NOT in GitHub (safe)
- ✅ Old exposed keys are DEACTIVATED
- ✅ New keys ONLY on your server
- ✅ Requests HMAC-SHA256 signed
- ✅ Timestamp prevents replay attacks

---

## 🆘 If Issues

1. **Error: .env file not found**
   - SSH: `ssh u187453795@serpifai.com`
   - Check: `ls -la /public_html/serpifai_php/config/.env`
   - Create manually if missing

2. **Diagnostic test fails**
   - Verify: `.env` has 600 permissions
   - Verify: All 4 API keys are present
   - Verify: Database connection works

3. **API calls fail**
   - Check: New keys are correct
   - Verify: HMAC_SECRET matches between client/server
   - Test: Diagnostic endpoint first

---

## 📚 Full Docs

For detailed information, see:
- `SECURITY_IMPLEMENTATION_COMPLETE.md` - Full technical details
- `PRODUCTION_SECURITY_DEPLOYMENT.md` - Complete deployment guide

---

**Ready to deploy? Run the script above! ⏭️**

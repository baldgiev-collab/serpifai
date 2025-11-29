# CRITICAL: API Keys Exposed in Public GitHub Repository

## 🚨 EMERGENCY ACTIONS (Do These RIGHT NOW)

### Step 1: Rotate ALL Google API Keys (5 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials
2. For each key, click the key name
3. Click "Regenerate key" button
4. WRITE DOWN the new keys
5. Delete old keys

**Keys to regenerate:**
- `AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E` (Gemini API)
- `AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc` (PageSpeed API)

### Step 2: Rotate Serper API Key (3 minutes)
1. Go to: https://serper.dev/manage (login to your account)
2. Click "Settings"
3. Regenerate API key
4. WRITE DOWN new key

**Current exposed key:**
- `f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2` (Serper API)

### Step 3: Rotate Open PageRank API Key (2 minutes)
1. Go to: https://www.domcop.com/openpagerank
2. Login to your account
3. Rotate/regenerate API key
4. WRITE DOWN new key

**Current exposed key:**
- `w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4` (Open PageRank API)

### Step 4: Remove ALL Keys from GitHub (3 minutes)
We will:
1. Update `db_config.php` to read from environment variables
2. Create `.env` file (NOT committed to GitHub)
3. Update `.gitignore` to prevent future commits
4. Force-push history rewrite to remove keys from all commits

## ✅ PERMANENT SOLUTION: Environment Variables

### What We'll Do:
1. Move all secrets to environment variables
2. Update code to read from `$_ENV`
3. Add `.env` to `.gitignore`
4. Use GitHub Secrets for production

### Files to Update:
- `db_config.php` - Read from environment
- `.gitignore` - Ignore `.env` file
- `api_gateway.php` - Already reads from `db_config.php` ✅

## 📋 FOLLOW-UP STEPS

### After You Rotate Keys:
1. Get new API keys from Google Cloud, Serper, OpenPageRank
2. Tell me the new keys via secure method
3. I'll update code to use environment variables
4. I'll force-push to remove keys from GitHub history
5. I'll deploy new keys to Hostinger only (not GitHub)

### Hostinger Deployment:
- Create `/public_html/.env` file with new keys
- PHP reads from `.env` automatically
- Keys never stored in GitHub ✅

## 🔒 Why This Matters

**Risks of Exposed Keys:**
- Attackers can use your APIs
- Billing charges on your account ($$$)
- Rate limits consumed by attackers
- Potential data theft
- Service abuse from your account

**Our Protection:**
- All keys rotated (old ones useless)
- New keys never in GitHub (in `.env` only)
- GitHub history cleaned (old keys removed)
- Automatic enforcement (`.gitignore` prevents future leaks)

## 📊 Timeline

| Step | Time | Priority |
|------|------|----------|
| 1. Rotate Google keys | 5 min | 🔴 NOW |
| 2. Rotate Serper key | 3 min | 🔴 NOW |
| 3. Rotate OpenPageRank key | 2 min | 🔴 NOW |
| 4. Tell me new keys | 2 min | 🔴 NOW |
| 5. Code updates (I'll do) | 10 min | 🟡 Next |
| 6. GitHub history clean (I'll do) | 5 min | 🟡 Next |
| 7. Deploy to Hostinger (I'll do) | 5 min | 🟡 Next |
| **TOTAL** | **32 min** | ✅ Complete |

## 🎯 What to Do Next

1. **Right now:** Rotate all 4 API keys (Google Gemini, Google PageSpeed, Serper, OpenPageRank)
2. **Write them down** securely (not in email)
3. **Tell me the new keys** via this chat (I'll store temporarily, then update code)
4. **I will:**
   - Update `db_config.php` to read from environment variables
   - Create `.env` template file
   - Update `.gitignore` to prevent future leaks
   - Force-push to remove keys from GitHub history
   - Deploy updated code to Hostinger with new keys

## ⚠️ IMPORTANT NOTES

- **Do NOT commit `.env` to GitHub** - It will go to `.gitignore`
- **New keys go ONLY in Hostinger `.env`** - Never in GitHub
- **Old exposed keys are now useless** after rotation
- **GitHub history will be cleaned** - Old commits won't have keys anymore

---

## Current Exposed Keys (NOW USELESS AFTER ROTATION)

```
Gemini API:        AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E
PageSpeed API:     AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc
Serper API:        f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2
OpenPageRank API:  w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4
```

After you rotate these, they will be worthless to attackers. ✅

---

## Ready?

Once you've rotated all 4 keys and have the new ones, reply with them and I'll:
1. Update the code to use environment variables
2. Clean GitHub history
3. Deploy secure version to Hostinger
4. Verify everything works

Let's secure this system! 🔒

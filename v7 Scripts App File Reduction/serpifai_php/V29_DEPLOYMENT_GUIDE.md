# V29 PHP Deployment Guide - Fix HTTP 500 Error

## Problem Diagnosis

The PHP fetcher is returning HTTP 500 for all requests because:

1. **Production server has OLD V6 code** - uses `api_transactions` table
2. **V7/V29 code uses `transactions` table** - was never deployed
3. **Schema mismatch** - V6 expects `api_transactions` with different columns

## Files That Need to Be Deployed

Upload ALL of these from your local `serpifai_php/` folder to production:

### Core Files (REQUIRED)
```
serpifai_php/
├── api_gateway.php              ← MAIN ROUTER - CRITICAL
├── config/
│   └── db_config.php            ← Updated DB config with CREDIT_COSTS
├── handlers/
│   ├── competitor_handler.php   ← Uses 'transactions' table
│   ├── content_handler.php      ← Uses 'transactions' table  
│   ├── fetcher_handler.php      ← Uses 'transactions' table - CRITICAL
│   ├── user_handler.php         ← User management
│   ├── project_handler.php      ← Project management
│   └── workflow_handler.php     ← Uses 'transactions' table
└── database/
    └── migration_v29_transactions_table.sql  ← RUN THIS FIRST!
```

## Deployment Steps

### Step 1: Run Database Migration (SSH or phpMyAdmin)

Connect to your MySQL database and run:

```sql
-- Run the migration file content
-- Or upload and run: serpifai_php/database/migration_v29_transactions_table.sql
```

Key SQL to run:
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    credit_cost INT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    request_data JSON,
    response_data JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 2: Backup Current Production Files (IMPORTANT!)

```bash
# SSH into server
ssh user@serpifai.com

# Create backup
cd /path/to/serpifai_php
mkdir -p backups/$(date +%Y%m%d)
cp -r handlers backups/$(date +%Y%m%d)/
cp api_gateway.php backups/$(date +%Y%m%d)/
cp config/db_config.php backups/$(date +%Y%m%d)/
```

### Step 3: Upload New PHP Files

Use FTP/SFTP/FileManager to upload:

1. `api_gateway.php` → `/serpifai_php/api_gateway.php`
2. `config/db_config.php` → `/serpifai_php/config/db_config.php`
3. `handlers/fetcher_handler.php` → `/serpifai_php/handlers/fetcher_handler.php`
4. `handlers/workflow_handler.php` → `/serpifai_php/handlers/workflow_handler.php`
5. `handlers/competitor_handler.php` → `/serpifai_php/handlers/competitor_handler.php`
6. `handlers/content_handler.php` → `/serpifai_php/handlers/content_handler.php`
7. `handlers/user_handler.php` → `/serpifai_php/handlers/user_handler.php`
8. `handlers/project_handler.php` → `/serpifai_php/handlers/project_handler.php`

### Step 4: Verify Deployment

Test the gateway:
```bash
curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{"action":"check_status","license":"YOUR_LICENSE_KEY"}'
```

Expected response:
```json
{
  "success": true,
  "user": {
    "email": "...",
    "credits": ...,
    "status": "active"
  }
}
```

### Step 5: Test Fetcher Specifically

```bash
curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetcher_single",
    "license": "YOUR_LICENSE_KEY",
    "payload": {
      "url": "https://example.com",
      "options": {"extractMetadata": true}
    }
  }'
```

Expected: HTTP 200 with fetched content (not HTTP 500)

## Rollback (If Something Goes Wrong)

```bash
# Restore from backup
cd /path/to/serpifai_php
cp backups/YYYYMMDD/handlers/* handlers/
cp backups/YYYYMMDD/api_gateway.php .
cp backups/YYYYMMDD/db_config.php config/
```

## After Deployment

Once PHP is working:

1. **Clear cached projects** - Old cached data has errors
2. **Re-run competitor analysis** - Fresh analysis with working fetcher
3. **Verify Serper API credits** - Logs showed "Not enough credits"

## Key Changes in V29

| Component | V6 (Old) | V29 (New) |
|-----------|----------|-----------|
| Transaction Table | `api_transactions` | `transactions` |
| Columns | 5 cols (no transaction_id) | 9 cols (with transaction_id) |
| Error Handling | Hard fail | Try/catch continues |
| Status Enum | 'pending', 'completed', 'failed' | Added 'processing', 'refunded' |

## Contact

If deployment fails, check:
1. PHP error logs: `/var/log/apache2/error.log` or similar
2. MySQL logs for constraint violations
3. Ensure `.env` file has correct DB credentials

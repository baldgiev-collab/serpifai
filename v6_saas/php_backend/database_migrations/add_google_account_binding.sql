-- ============================================================================
-- DATABASE MIGRATION: Bind License Keys to Google Accounts
-- ============================================================================
-- Purpose: Prevent license key sharing across multiple Google accounts
-- Security: One license key can only be used by ONE Google account
-- Date: 2025-12-01
-- ============================================================================

-- Add google_account_email column to users table
ALTER TABLE users 
ADD COLUMN google_account_email VARCHAR(255) NULL 
AFTER email
COMMENT 'Google account email that activated this license key';

-- Add index for fast lookup during authentication
CREATE INDEX idx_google_account ON users(google_account_email);

-- Optional: Add constraint to prevent duplicate Google accounts (one account = one license)
-- Uncomment if you want to enforce: one Google account can only have one license
-- ALTER TABLE users ADD UNIQUE KEY unique_google_account (google_account_email);

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- 1. Existing users will have google_account_email = NULL
-- 2. On first login after migration, their Google account will be saved
-- 3. After binding, they can ONLY use that Google account
-- 4. To transfer license to different Google account:
--    - Admin must manually UPDATE users SET google_account_email = 'new@email.com' WHERE id = X
--    - Or set google_account_email = NULL to allow re-binding
-- ============================================================================

-- Run this in Hostinger phpMyAdmin:
-- 1. Login to cPanel → phpMyAdmin
-- 2. Select database: u187453795_SrpAIDataGate
-- 3. Click "SQL" tab
-- 4. Paste this entire script
-- 5. Click "Go"
-- ============================================================================

-- ============================================================================
-- SIMPLE MIGRATION: Add missing columns to users table
-- Run this in phpMyAdmin SQL tab for database: u187453795_SrpAIDataGate
-- ============================================================================

-- Add updated_at column (for timestamp tracking)
ALTER TABLE users 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Add total_credits_purchased column (track lifetime purchases)
ALTER TABLE users 
ADD COLUMN total_credits_purchased INT DEFAULT 0 
AFTER credits;

-- Add total_credits_used column (track lifetime usage)
ALTER TABLE users 
ADD COLUMN total_credits_used INT DEFAULT 0 
AFTER total_credits_purchased;

-- Add password_hash column (for future password auth)
ALTER TABLE users 
ADD COLUMN password_hash VARCHAR(255) 
AFTER license_key;

-- Add stripe_customer_id column (for Stripe integration)
ALTER TABLE users 
ADD COLUMN stripe_customer_id VARCHAR(255) 
AFTER status;

-- Verify all columns were added
DESCRIBE users;

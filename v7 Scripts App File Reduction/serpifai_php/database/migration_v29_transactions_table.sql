-- ═══════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Create/Update transactions table for V7/V29 PHP handlers
-- Run this BEFORE deploying updated PHP files
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Step 1: Create transactions table if it doesn't exist
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

-- Step 2: Migrate data from api_transactions if it exists (optional)
-- Only run this if you have data in api_transactions you want to keep
-- This is safe to run even if api_transactions doesn't exist (will just skip)

INSERT IGNORE INTO transactions (
    transaction_id, 
    user_id, 
    action_type, 
    credit_cost, 
    status, 
    request_data, 
    created_at
)
SELECT 
    CONCAT('LEGACY-', id) as transaction_id,
    user_id,
    action_type,
    credit_cost,
    CASE 
        WHEN status = 'pending' THEN 'pending'
        WHEN status = 'processing' THEN 'processing'
        WHEN status = 'completed' THEN 'completed'
        WHEN status = 'failed' THEN 'failed'
        ELSE 'pending'
    END as status,
    request_data,
    created_at
FROM api_transactions
WHERE NOT EXISTS (
    SELECT 1 FROM transactions t WHERE t.transaction_id = CONCAT('LEGACY-', api_transactions.id)
);

-- Step 3: Verify table structure
DESCRIBE transactions;

-- Step 4: Show table count
SELECT 
    'transactions' as table_name, 
    COUNT(*) as row_count 
FROM transactions;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these after migration)
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Check transactions table exists
SHOW TABLES LIKE 'transactions';

-- Test INSERT (this is what the PHP handlers will do)
-- INSERT INTO transactions (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
-- VALUES ('TEST-1234-abcd', 1, 'fetch:single', 1, 'processing', '{"url":"https://example.com"}', NOW());

-- Cleanup test
-- DELETE FROM transactions WHERE transaction_id = 'TEST-1234-abcd';

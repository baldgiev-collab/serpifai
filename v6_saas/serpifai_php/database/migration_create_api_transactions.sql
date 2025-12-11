-- ============================================================================
-- MIGRATION: Create api_transactions table
-- This is the table workflow_handler.php expects
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    credit_cost INT NOT NULL DEFAULT 0,
    status ENUM('processing', 'pending', 'completed', 'failed', 'refunded') DEFAULT 'processing',
    request_data TEXT,
    response_data TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created
SHOW TABLES LIKE 'api_transactions';
DESCRIBE api_transactions;

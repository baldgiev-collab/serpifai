-- ============================================================================
-- COMPLETE DATABASE SETUP - Run this to create all missing tables
-- For database: u187453795_SrpAIDataGate
-- ============================================================================

-- 1. Create api_transactions table (required for workflow stages)
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

-- 2. Create projects table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id VARCHAR(64) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_data LONGTEXT,
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_project (project_id),
    INDEX idx_name (project_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Verify all tables exist
SHOW TABLES;

-- 4. Verify table structures
DESCRIBE users;
DESCRIBE api_transactions;
DESCRIBE projects;

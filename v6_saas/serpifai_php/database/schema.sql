-- ============================================================================
-- SerpifAI v6 Database Schema
-- MySQL Database: u187453795_SrpAIDataGate
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    license_key VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    credits INT DEFAULT 0,
    total_credits_purchased INT DEFAULT 0,
    total_credits_used INT DEFAULT 0,
    status ENUM('active', 'suspended', 'trial') DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_license (license_key),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id VARCHAR(64) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    primary_keyword VARCHAR(255),
    business_category VARCHAR(255),
    target_audience TEXT,
    product_description TEXT,
    project_data JSON,
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (credit usage tracking)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    credit_cost INT NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
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

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Competitor analyses
CREATE TABLE IF NOT EXISTS competitor_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT,
    analysis_id VARCHAR(64) UNIQUE NOT NULL,
    competitors JSON NOT NULL,
    analysis_data JSON,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_project (project_id),
    INDEX idx_analysis (analysis_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fetcher cache
CREATE TABLE IF NOT EXISTS fetcher_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_hash VARCHAR(64) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    response_data JSON,
    http_status INT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hash (url_hash),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment history (Stripe)
CREATE TABLE IF NOT EXISTS payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    credits_purchased INT NOT NULL,
    status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_payment_intent (stripe_payment_intent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT TEST ACCOUNT
-- ============================================================================

INSERT INTO users (
    email,
    license_key,
    password_hash,
    credits,
    total_credits_purchased,
    status
) VALUES (
    'test@serpifai.com',
    'TEST-SERPIFAI-2025-666',
    '$2y$10$dummyhash', -- No real password needed for testing
    666,
    666,
    'active'
) ON DUPLICATE KEY UPDATE
    credits = 666,
    total_credits_purchased = 666,
    license_key = 'TEST-SERPIFAI-2025-666';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add composite indexes for common queries
ALTER TABLE transactions ADD INDEX idx_user_status (user_id, status);
ALTER TABLE projects ADD INDEX idx_user_status (user_id, status);
ALTER TABLE activity_logs ADD INDEX idx_user_created (user_id, created_at);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

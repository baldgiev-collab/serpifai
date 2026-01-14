-- ═══════════════════════════════════════════════════════════════════════════
-- COMPETITOR TRENDS TABLE (2026)
-- Stores daily snapshots of competitor metrics for trend tracking
-- Used for sparkline visualizations and historical analysis
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS competitor_trends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    project_id VARCHAR(100) DEFAULT NULL,
    snapshot_date DATE NOT NULL,
    
    -- Core metrics
    organic_traffic INT DEFAULT 0,
    authority_score INT DEFAULT 0,
    organic_keywords INT DEFAULT 0,
    backlinks INT DEFAULT 0,
    traffic_value DECIMAL(12,2) DEFAULT 0.00,
    site_health INT DEFAULT 0,
    
    -- Additional metrics (for future use)
    ref_domains INT DEFAULT 0,
    avg_position DECIMAL(4,2) DEFAULT NULL,
    top_10_keywords INT DEFAULT 0,
    content_score INT DEFAULT NULL,
    
    -- Data quality tracking
    data_source ENUM('api', 'estimated', 'gemini', 'cached') DEFAULT 'estimated',
    confidence_score INT DEFAULT 50,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for efficient queries
    INDEX idx_user_domain (user_id, domain),
    INDEX idx_user_date (user_id, snapshot_date),
    INDEX idx_domain_date (domain, snapshot_date),
    INDEX idx_project (project_id),
    
    -- Unique constraint: one record per user/domain/date
    UNIQUE KEY unique_trend_entry (user_id, domain, snapshot_date),
    
    -- Foreign key (if users table exists)
    -- CONSTRAINT fk_trends_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    
    COMMENT = 'Stores historical competitor metrics for trend analysis and sparklines'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Get 30-day trend for a domain:
-- SELECT snapshot_date, organic_traffic, authority_score 
-- FROM competitor_trends 
-- WHERE user_id = ? AND domain = ? 
-- AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- ORDER BY snapshot_date ASC;

-- Get all competitors with recent trends:
-- SELECT domain, 
--        MIN(organic_traffic) as min_traffic,
--        MAX(organic_traffic) as max_traffic,
--        (MAX(organic_traffic) - MIN(organic_traffic)) / MIN(organic_traffic) * 100 as change_pct
-- FROM competitor_trends 
-- WHERE user_id = ? 
-- AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- GROUP BY domain;

-- Cleanup old data (keep 365 days):
-- DELETE FROM competitor_trends 
-- WHERE snapshot_date < DATE_SUB(CURDATE(), INTERVAL 365 DAY);

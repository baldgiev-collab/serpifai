-- ═══════════════════════════════════════════════════════════════════════════
-- ELITE COMPETITOR HISTORY TABLE
-- Stores historical competitor metrics for trend analysis and sparklines
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS competitor_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    competitor_domain VARCHAR(255) NOT NULL,
    report_date DATE NOT NULL,
    
    -- Core Metrics
    organic_traffic INT DEFAULT 0,
    traffic_value DECIMAL(12, 2) DEFAULT 0.00,
    authority_score DECIMAL(5, 2) DEFAULT 0.00,
    page_rank DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Keyword Metrics
    keyword_count INT DEFAULT 0,
    avg_position DECIMAL(5, 2) DEFAULT 0.00,
    top_3_keywords INT DEFAULT 0,
    top_10_keywords INT DEFAULT 0,
    
    -- Content Metrics
    indexed_pages INT DEFAULT 0,
    word_count INT DEFAULT 0,
    
    -- Technical Metrics
    performance_score INT DEFAULT 0,
    seo_score INT DEFAULT 0,
    site_health INT DEFAULT 0,
    
    -- Backlink Metrics
    backlinks_estimate INT DEFAULT 0,
    referring_domains INT DEFAULT 0,
    
    -- Metadata
    project_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for fast querying
    INDEX idx_user_competitor (user_id, competitor_domain),
    INDEX idx_competitor_date (competitor_domain, report_date),
    INDEX idx_user_date (user_id, report_date),
    INDEX idx_project (project_id),
    
    -- Unique constraint to prevent duplicate entries per day
    UNIQUE KEY unique_daily_entry (user_id, competitor_domain, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- ELITE KEYWORD TRACKING TABLE
-- Tracks individual keyword rankings over time
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS keyword_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    competitor_domain VARCHAR(255) NOT NULL,
    keyword VARCHAR(500) NOT NULL,
    report_date DATE NOT NULL,
    
    -- Ranking Data
    position INT DEFAULT 0,
    previous_position INT DEFAULT 0,
    position_change INT DEFAULT 0,
    
    -- Traffic Data
    search_volume INT DEFAULT 0,
    estimated_traffic INT DEFAULT 0,
    cpc DECIMAL(8, 2) DEFAULT 0.00,
    traffic_value DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Metadata
    url VARCHAR(2000),
    serp_features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_keyword (user_id, keyword(191)),
    INDEX idx_competitor_keyword (competitor_domain, keyword(191)),
    INDEX idx_keyword_date (keyword(191), report_date),
    
    UNIQUE KEY unique_keyword_daily (user_id, competitor_domain, keyword(191), report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- ELITE TOP PAGES TRACKING TABLE
-- Tracks traffic share by page over time
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS page_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    competitor_domain VARCHAR(255) NOT NULL,
    page_url VARCHAR(2000) NOT NULL,
    report_date DATE NOT NULL,
    
    -- Traffic Data
    estimated_traffic INT DEFAULT 0,
    traffic_share DECIMAL(5, 2) DEFAULT 0.00,
    traffic_value DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Keyword Data
    keyword_count INT DEFAULT 0,
    top_keyword VARCHAR(500),
    
    -- Metadata
    page_rank INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_page (user_id, page_url(191)),
    INDEX idx_competitor_page (competitor_domain, page_url(191)),
    
    UNIQUE KEY unique_page_daily (user_id, competitor_domain, page_url(191), report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER VIEWS FOR SPARKLINE DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- 30-day trend view
CREATE OR REPLACE VIEW competitor_30day_trend AS
SELECT 
    user_id,
    competitor_domain,
    report_date,
    organic_traffic,
    traffic_value,
    authority_score,
    keyword_count,
    LAG(organic_traffic) OVER (PARTITION BY user_id, competitor_domain ORDER BY report_date) as prev_traffic,
    organic_traffic - LAG(organic_traffic) OVER (PARTITION BY user_id, competitor_domain ORDER BY report_date) as traffic_change
FROM competitor_history
WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY user_id, competitor_domain, report_date;

-- 90-day trend view
CREATE OR REPLACE VIEW competitor_90day_trend AS
SELECT 
    user_id,
    competitor_domain,
    report_date,
    organic_traffic,
    traffic_value,
    authority_score,
    keyword_count,
    LAG(organic_traffic) OVER (PARTITION BY user_id, competitor_domain ORDER BY report_date) as prev_traffic,
    organic_traffic - LAG(organic_traffic) OVER (PARTITION BY user_id, competitor_domain ORDER BY report_date) as traffic_change
FROM competitor_history
WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
ORDER BY user_id, competitor_domain, report_date;

-- ============================================================================
-- Competitor Analysis Results Storage Schema
-- Stores complete analysis results with JSON data + metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS `competitor_analysis_results` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `project_id` VARCHAR(100) NOT NULL,
  `analysis_data` LONGTEXT NOT NULL COMMENT 'Complete JSON analysis data',
  `competitors` TEXT NOT NULL COMMENT 'JSON array of competitor domains',
  `your_domain` VARCHAR(255) DEFAULT NULL,
  `competitor_count` INT(11) DEFAULT 0,
  `data_quality` VARCHAR(50) DEFAULT 'standard' COMMENT 'standard, good, elite',
  `api_success` VARCHAR(20) DEFAULT '0/0' COMMENT 'e.g. 5/5, 3/5',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_project` (`user_id`, `project_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Competitor Analysis Categories (15 tabs)
-- Stores insights, metrics, and charts for each category
-- ============================================================================

CREATE TABLE IF NOT EXISTS `competitor_analysis_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `result_id` INT(11) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `insights` TEXT COMMENT 'JSON array of insights',
  `metrics` TEXT COMMENT 'JSON object of metrics',
  `recommendations` TEXT COMMENT 'JSON array of recommendations',
  `chart_data` TEXT COMMENT 'JSON chart configuration',
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `result_category` (`result_id`, `category_id`),
  KEY `idx_result_id` (`result_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_category_result` FOREIGN KEY (`result_id`) 
    REFERENCES `competitor_analysis_results` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Gemini Analysis Cache
-- Stores Gemini API responses for reuse
-- ============================================================================

CREATE TABLE IF NOT EXISTS `gemini_analysis_cache` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `cache_key` VARCHAR(255) NOT NULL,
  `project_id` VARCHAR(100) NOT NULL,
  `prompt_hash` VARCHAR(64) NOT NULL COMMENT 'SHA256 hash of prompt',
  `response_data` LONGTEXT NOT NULL COMMENT 'Gemini JSON response',
  `model` VARCHAR(50) DEFAULT 'gemini-1.5-pro',
  `token_count` INT(11) DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cache_key` (`cache_key`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_prompt_hash` (`prompt_hash`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Indexes for performance optimization
-- ============================================================================

ALTER TABLE `competitor_analysis_results` 
  ADD INDEX `idx_data_quality` (`data_quality`),
  ADD INDEX `idx_api_success` (`api_success`);

-- ============================================================================
-- Sample data query (for testing)
-- ============================================================================

-- Get all projects for a user
-- SELECT project_id, your_domain, competitor_count, api_success, updated_at 
-- FROM competitor_analysis_results 
-- WHERE user_id = 1 
-- ORDER BY updated_at DESC;

-- Get full analysis for a project
-- SELECT * FROM competitor_analysis_results 
-- WHERE project_id = 'comp-1234567890' AND user_id = 1;

-- Get category insights for a result
-- SELECT category_name, insights, metrics, recommendations 
-- FROM competitor_analysis_categories 
-- WHERE result_id = 1;

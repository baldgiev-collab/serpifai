-- SerpifAI v6 - Cache table for fetcher responses and Gemini proxy
-- Create on your MySQL server (Hostinger) before enabling DB caching

CREATE TABLE IF NOT EXISTS `fetcher_cache` (
  `url_hash` VARCHAR(255) NOT NULL,
  `url` VARCHAR(1024) NOT NULL DEFAULT '',
  `response_data` LONGTEXT NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`url_hash`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
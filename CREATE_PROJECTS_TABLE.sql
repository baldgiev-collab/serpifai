-- ============================================
-- SERPIFAI Projects Table Creation
-- Database: u187453795_SrpAIDataGate
-- ============================================

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `project_id` VARCHAR(100) NOT NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `project_data` LONGTEXT NOT NULL,
  `status` ENUM('active', 'deleted', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_id` (`project_id`),
  UNIQUE KEY `unique_user_project` (`user_id`, `project_name`, `status`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES EXPLANATION:
-- ============================================
-- PRIMARY KEY (id): Fast lookups by internal ID
-- UNIQUE (project_id): Ensures globally unique project identifiers
-- UNIQUE (user_id, project_name, status): Prevents duplicate project names per user (only for active/archived)
-- INDEX (user_id): Fast filtering of projects by user
-- INDEX (status): Fast filtering by project status
-- INDEX (updated_at): Fast sorting by last update time
-- FOREIGN KEY (user_id): Maintains referential integrity with users table

-- ============================================
-- USAGE NOTES:
-- ============================================
-- 1. Upload this file to Hostinger via phpMyAdmin
-- 2. Select database: u187453795_SrpAIDataGate
-- 3. Click "SQL" tab
-- 4. Paste this SQL and click "Go"
-- 5. Verify table created: Check "Structure" tab
-- 6. Run TEST_ALL_UI_FEATURES() again - should get 10/10 pass

-- ============================================
-- SAMPLE QUERIES (for verification):
-- ============================================
-- Count projects per user:
-- SELECT user_id, COUNT(*) as project_count FROM projects WHERE status = 'active' GROUP BY user_id;

-- List all active projects for a user:
-- SELECT project_name, created_at, updated_at FROM projects WHERE user_id = 1 AND status = 'active' ORDER BY updated_at DESC;

-- Check foreign key constraints:
-- SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'u187453795_SrpAIDataGate' AND TABLE_NAME = 'projects';

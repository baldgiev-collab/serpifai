-- ═══════════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: ELITE TOKEN ARCHITECTURE - ADD job_token COLUMNS
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 
-- PURPOSE: Align job_ series tables with Elite Token Architecture
-- FIXES: "Unknown column" errors in UPP handshake
-- 
-- TABLES AFFECTED:
--   - job_registry: Add job_token column and index (if not exists)
--   - job_results: Add job_token column for token-based lookups
--   - job_metrics: Add job_token column for token-based metrics
--   - job_tasks: Add job_token column for token-based task tracking
--
-- USAGE: Run this in phpMyAdmin or MySQL CLI against u187453795_SrpAIDataGate
-- 
-- @version 1.0.0 - Elite Token Architecture Alignment
-- @date 2026-01-17
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: ENSURE job_registry HAS job_token COLUMN
-- ═══════════════════════════════════════════════════════════════════════════

-- Check and add job_token column to job_registry (if not exists)
ALTER TABLE job_registry 
    ADD COLUMN IF NOT EXISTS job_token VARCHAR(255) AFTER id;

-- Create index for fast token lookups
ALTER TABLE job_registry 
    ADD INDEX IF NOT EXISTS idx_job_token (job_token);

-- Also ensure project_id is indexed
ALTER TABLE job_registry 
    ADD INDEX IF NOT EXISTS idx_project_id (project_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: ADD job_token TO job_results TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Add job_token column (already exists but ensure it's indexed)
ALTER TABLE job_results 
    ADD COLUMN IF NOT EXISTS job_token VARCHAR(255) AFTER id;

-- Create index for token-based result lookups
ALTER TABLE job_results 
    ADD INDEX IF NOT EXISTS idx_job_token (job_token);

-- Add project_id for direct project queries
ALTER TABLE job_results 
    ADD COLUMN IF NOT EXISTS project_id VARCHAR(255) AFTER job_token;

ALTER TABLE job_results 
    ADD INDEX IF NOT EXISTS idx_project_id (project_id);

-- Ensure result_type is indexed for filtering
ALTER TABLE job_results 
    ADD INDEX IF NOT EXISTS idx_result_type (result_type);


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: ADD job_token TO job_metrics TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Add job_token column
ALTER TABLE job_metrics 
    ADD COLUMN IF NOT EXISTS job_token VARCHAR(255) AFTER id;

-- Create index for token-based metrics lookups
ALTER TABLE job_metrics 
    ADD INDEX IF NOT EXISTS idx_job_token (job_token);


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: ADD job_token TO job_tasks TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Add job_token column
ALTER TABLE job_tasks 
    ADD COLUMN IF NOT EXISTS job_token VARCHAR(255) AFTER id;

-- Create index for token-based task lookups
ALTER TABLE job_tasks 
    ADD INDEX IF NOT EXISTS idx_job_token (job_token);


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: CREATE COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ═══════════════════════════════════════════════════════════════════════════

-- job_registry: Token + Project combo lookup
ALTER TABLE job_registry 
    ADD INDEX IF NOT EXISTS idx_token_project (job_token, project_id);

-- job_registry: Status + Created combo for recovery queries
ALTER TABLE job_registry 
    ADD INDEX IF NOT EXISTS idx_status_created (status, created_at DESC);

-- job_results: Token + Type + Competitor combo lookup
ALTER TABLE job_results 
    ADD INDEX IF NOT EXISTS idx_token_type_comp (job_token, result_type, competitor_id);

-- job_results: Project + Type combo for workflow stage lookups
ALTER TABLE job_results 
    ADD INDEX IF NOT EXISTS idx_project_type (project_id, result_type);


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (Run to confirm changes)
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify job_registry structure
-- DESCRIBE job_registry;

-- Verify job_results structure
-- DESCRIBE job_results;

-- Verify job_metrics structure
-- DESCRIBE job_metrics;

-- Verify job_tasks structure
-- DESCRIBE job_tasks;

-- Check indexes
-- SHOW INDEX FROM job_registry;
-- SHOW INDEX FROM job_results;


-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK (If needed)
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- ALTER TABLE job_registry DROP COLUMN job_token;
-- ALTER TABLE job_results DROP COLUMN job_token, DROP COLUMN project_id;
-- ALTER TABLE job_metrics DROP COLUMN job_token;
-- ALTER TABLE job_tasks DROP COLUMN job_token;
-- 
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'Migration 001_add_job_token_columns completed successfully!' AS status;

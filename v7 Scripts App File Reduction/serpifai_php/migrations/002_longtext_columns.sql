-- ═══════════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: LONGTEXT COLUMNS FOR 5MB+ PAYLOADS
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 
-- PURPOSE: Ensure ai_analysis and job_results tables can store 5MB+ payloads
-- FIXES: Data truncation errors when storing large competitor analysis
-- 
-- COLUMN TYPE REFERENCE:
--   TEXT:       Up to 65KB (too small!)
--   MEDIUMTEXT: Up to 16MB (good for most payloads)
--   LONGTEXT:   Up to 4GB (future-proof)
--
-- TABLES AFFECTED:
--   - job_results: data_json column (holds competitor analysis)
--   - ai_analysis: analysis_json column (holds Gemini responses)
--   - competitor_results: raw_data, processed_data columns
--   - workflow_log: result_json, report_text columns
--
-- USAGE: Run this in phpMyAdmin against u187453795_SrpAIDataGate
-- 
-- @version 1.0.0 - LONGTEXT Migration
-- @date 2026-01-17
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: JOB_RESULTS TABLE - Main storage for competitor data
-- ═══════════════════════════════════════════════════════════════════════════

-- Convert data_json to LONGTEXT (was TEXT or MEDIUMTEXT)
ALTER TABLE job_results MODIFY COLUMN data_json LONGTEXT;

-- Add data_size_bytes if not exists for monitoring
ALTER TABLE job_results 
    ADD COLUMN IF NOT EXISTS data_size_bytes INT UNSIGNED DEFAULT 0;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: AI_ANALYSIS TABLE - Gemini response storage
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if table exists and modify
ALTER TABLE ai_analysis MODIFY COLUMN analysis_json LONGTEXT;
ALTER TABLE ai_analysis MODIFY COLUMN raw_response LONGTEXT;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: COMPETITOR_RESULTS TABLE - Raw competitor data
-- ═══════════════════════════════════════════════════════════════════════════

-- These columns hold the 5.3MB+ competitor analysis payloads
ALTER TABLE competitor_results MODIFY COLUMN raw_data LONGTEXT;
ALTER TABLE competitor_results MODIFY COLUMN processed_data LONGTEXT;
ALTER TABLE competitor_results MODIFY COLUMN gemini_analysis LONGTEXT;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: WORKFLOW_LOG TABLE - Stage results storage
-- ═══════════════════════════════════════════════════════════════════════════

-- Stage results can be 2-3MB each
ALTER TABLE workflow_log MODIFY COLUMN result_json LONGTEXT;
ALTER TABLE workflow_log MODIFY COLUMN report_text LONGTEXT;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: LINK_FORENSICS TABLE - Content scraping data
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE link_forensics MODIFY COLUMN data_json LONGTEXT;
ALTER TABLE link_forensics MODIFY COLUMN raw_html_snippet LONGTEXT;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: PROJECT_DATA TABLE - Full project snapshots
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE project_data MODIFY COLUMN data_json LONGTEXT;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (Run to confirm changes)
-- ═══════════════════════════════════════════════════════════════════════════

-- Check job_results column types
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'job_results' AND COLUMN_NAME = 'data_json';

-- Check all LONGTEXT conversions
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = 'u187453795_SrpAIDataGate'
--   AND DATA_TYPE IN ('text', 'mediumtext', 'longtext')
-- ORDER BY TABLE_NAME, COLUMN_NAME;


-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE MONITORING (Optional - Add tracking)
-- ═══════════════════════════════════════════════════════════════════════════

-- Create view to monitor storage usage per table
CREATE OR REPLACE VIEW v_storage_stats AS
SELECT 
    'job_results' as table_name,
    COUNT(*) as row_count,
    ROUND(SUM(LENGTH(data_json)) / 1024 / 1024, 2) as data_json_mb
FROM job_results
UNION ALL
SELECT 
    'competitor_results',
    COUNT(*),
    ROUND(SUM(LENGTH(raw_data)) / 1024 / 1024, 2)
FROM competitor_results
UNION ALL
SELECT 
    'workflow_log',
    COUNT(*),
    ROUND(SUM(LENGTH(result_json)) / 1024 / 1024, 2)
FROM workflow_log;


SELECT 'Migration 002_longtext_columns completed successfully!' AS status;

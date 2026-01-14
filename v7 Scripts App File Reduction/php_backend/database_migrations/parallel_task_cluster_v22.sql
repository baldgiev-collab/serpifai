-- ═══════════════════════════════════════════════════════════════════════════════════
-- ORACLE ELITE v22.0 - PARALLEL TASK-CLUSTER ARCHITECTURE
-- MySQL Schema for Job Registry & Task Management
-- ═══════════════════════════════════════════════════════════════════════════════════
-- 
-- PURPOSE: Enable parallel competitor analysis with 6-minute timeout bypass
-- GOAL: 6 competitors analyzed and visualized in under 60 seconds
-- 
-- ARCHITECTURE:
-- ┌──────────────────────────────────────────────────────────────────────────────────┐
-- │  UI fires 6 parallel google.script.run calls (one per competitor)               │
-- │     ↓                                                                             │
-- │  Each call creates a JOB → spawns TASKS → writes RESULTS                        │
-- │     ↓                                                                             │
-- │  UI polls job_status every 1.5s → hydrates bento-grid as tasks complete         │
-- └──────────────────────────────────────────────────────────────────────────────────┘
-- ═══════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 1: JOB_REGISTRY - Master job tracking (one per competitor analysis session)
-- ═══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS job_registry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Job Identification
    job_token VARCHAR(64) NOT NULL UNIQUE,              -- UUID for polling
    project_id VARCHAR(64) NOT NULL,                     -- Links to project
    user_id INT NOT NULL,                                -- License key owner
    
    -- Job Configuration
    competitor_count INT NOT NULL DEFAULT 0,             -- Total competitors in batch
    your_domain VARCHAR(255),                            -- User's domain for comparison
    analysis_type ENUM('elite', 'quick', 'deep') DEFAULT 'elite',
    
    -- Job Status
    status ENUM(
        'QUEUED',           -- Job created, waiting to start
        'RUNNING',          -- Workers executing
        'COMPLETED',        -- All tasks finished successfully
        'PARTIAL',          -- Some tasks failed, partial results available
        'FAILED',           -- Critical failure
        'TIMEOUT'           -- Execution exceeded limits
    ) NOT NULL DEFAULT 'QUEUED',
    
    -- Progress Tracking
    tasks_total INT NOT NULL DEFAULT 0,                  -- Total task count
    tasks_completed INT NOT NULL DEFAULT 0,              -- Completed tasks
    tasks_failed INT NOT NULL DEFAULT 0,                 -- Failed tasks
    progress_percent DECIMAL(5,2) DEFAULT 0.00,          -- 0-100%
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_completion_ms INT NULL,                    -- Predicted completion time
    
    -- Error Tracking
    error_message TEXT NULL,
    last_error_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0,
    
    -- Metadata
    execution_mode ENUM('parallel', 'sequential') DEFAULT 'parallel',
    client_fingerprint VARCHAR(64) NULL,                 -- For deduplication
    
    INDEX idx_job_token (job_token),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 2: JOB_TASKS - Atomic task tracking (multiple per job)
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Each competitor analysis has 5 atomic tasks: FETCH, ENRICH, ANALYZE, CLUSTER, SAVE
CREATE TABLE IF NOT EXISTS job_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Task Identification
    task_id VARCHAR(64) NOT NULL UNIQUE,                 -- UUID for this task
    job_token VARCHAR(64) NOT NULL,                      -- Parent job
    competitor_id VARCHAR(64) NOT NULL,                  -- Which competitor
    competitor_domain VARCHAR(255) NOT NULL,             -- Domain being analyzed
    
    -- Task Type (atomic workers)
    task_type ENUM(
        'FETCH',            -- Worker_Fetch: Get raw data from URLs
        'ENRICH',           -- Worker_Enrich: API calls (Serper, PageRank)
        'ANALYZE',          -- Worker_Analyze: Gemini AI analysis
        'CLUSTER',          -- Worker_Cluster: Keyword clustering
        'PERSIST'           -- Worker_Persist: Save to DB/Sheets
    ) NOT NULL,
    
    -- Task Sequence
    sequence_order INT NOT NULL DEFAULT 0,               -- Execution order (0-4)
    depends_on VARCHAR(64) NULL,                         -- Task ID dependency
    
    -- Task Status
    status ENUM(
        'PENDING',          -- Waiting for dependencies
        'QUEUED',           -- Ready to execute
        'RUNNING',          -- Currently executing
        'COMPLETED',        -- Finished successfully
        'FAILED',           -- Failed with error
        'SKIPPED',          -- Skipped (dependency failed)
        'TIMEOUT'           -- Execution timeout
    ) NOT NULL DEFAULT 'PENDING',
    
    -- Timing
    queued_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_ms INT NULL,                                -- Actual execution time
    
    -- Error Tracking
    error_message TEXT NULL,
    error_code VARCHAR(32) NULL,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 2,
    
    -- Data Pointers (Zero String-Bloat Strategy)
    -- Instead of storing JSON, store references
    input_data_id VARCHAR(64) NULL,                      -- Pointer to job_results
    output_data_id VARCHAR(64) NULL,                     -- Pointer to job_results
    
    INDEX idx_task_id (task_id),
    INDEX idx_job_token (job_token),
    INDEX idx_competitor_id (competitor_id),
    INDEX idx_status (status),
    INDEX idx_task_type (task_type),
    FOREIGN KEY (job_token) REFERENCES job_registry(job_token) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 3: JOB_RESULTS - Data storage for task inputs/outputs
-- ═══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS job_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Result Identification
    result_id VARCHAR(64) NOT NULL UNIQUE,               -- UUID for this result
    job_token VARCHAR(64) NOT NULL,                      -- Parent job
    task_id VARCHAR(64) NULL,                            -- Which task produced this
    competitor_id VARCHAR(64) NULL,                      -- Which competitor
    
    -- Result Type
    result_type ENUM(
        'RAW_FETCH',        -- Raw HTML/data from fetch
        'API_SERPER',       -- Serper API response
        'API_PAGERANK',     -- OpenPageRank response
        'API_PAGESPEED',    -- PageSpeed response
        'ENRICHED',         -- Merged enriched data
        'GEMINI_ANALYSIS',  -- AI analysis output
        'KEYWORD_CLUSTERS', -- Clustered keywords
        'ELITE_TABS',       -- Elite tab intelligence
        'FINAL',            -- Final merged result
        'ERROR'             -- Error details
    ) NOT NULL,
    
    -- Actual Data (compressed JSON)
    data_json LONGTEXT NOT NULL,                         -- The actual data
    data_hash VARCHAR(64) NULL,                          -- For deduplication
    data_size_bytes INT NULL,                            -- Size tracking
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,                           -- For cache TTL
    is_cached BOOLEAN DEFAULT FALSE,
    
    -- Source Integrity (from v21.0)
    source_integrity ENUM('api', 'direct', 'estimated', 'inferred', 'cached') DEFAULT 'direct',
    confidence_score DECIMAL(5,2) NULL,                  -- 0-100
    
    INDEX idx_result_id (result_id),
    INDEX idx_job_token (job_token),
    INDEX idx_task_id (task_id),
    INDEX idx_competitor_id (competitor_id),
    INDEX idx_result_type (result_type),
    INDEX idx_data_hash (data_hash),
    FOREIGN KEY (job_token) REFERENCES job_registry(job_token) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 4: JOB_METRICS - Real-time progress metrics for UI polling
-- ═══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS job_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    job_token VARCHAR(64) NOT NULL,
    competitor_id VARCHAR(64) NOT NULL,
    competitor_domain VARCHAR(255) NOT NULL,
    
    -- Per-Competitor Status (for bento-grid hydration)
    status ENUM('pending', 'fetching', 'enriching', 'analyzing', 'saving', 'completed', 'failed') DEFAULT 'pending',
    
    -- Quick Metrics (for immediate UI display)
    domain_authority INT NULL,
    traffic_estimate INT NULL,
    keyword_count INT NULL,
    backlink_count INT NULL,
    content_score INT NULL,
    performance_score INT NULL,
    
    -- Progress
    current_phase VARCHAR(32) NULL,
    phase_progress DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timing
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_ms INT NULL,
    
    -- Flags for UI
    has_elite_data BOOLEAN DEFAULT FALSE,
    has_gemini_analysis BOOLEAN DEFAULT FALSE,
    has_keyword_clusters BOOLEAN DEFAULT FALSE,
    
    -- Last Update (for polling freshness)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY idx_job_competitor (job_token, competitor_id),
    INDEX idx_status (status),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- VIEWS: Convenient aggregations for polling
-- ═══════════════════════════════════════════════════════════════════════════════════

-- View: Job status summary (for UI polling)
CREATE OR REPLACE VIEW v_job_status AS
SELECT 
    jr.job_token,
    jr.project_id,
    jr.status AS job_status,
    jr.competitor_count,
    jr.tasks_total,
    jr.tasks_completed,
    jr.tasks_failed,
    jr.progress_percent,
    jr.created_at,
    jr.started_at,
    jr.completed_at,
    TIMESTAMPDIFF(SECOND, jr.started_at, COALESCE(jr.completed_at, NOW())) AS elapsed_seconds,
    (SELECT COUNT(*) FROM job_metrics jm WHERE jm.job_token = jr.job_token AND jm.status = 'completed') AS competitors_completed,
    (SELECT COUNT(*) FROM job_metrics jm WHERE jm.job_token = jr.job_token AND jm.status = 'failed') AS competitors_failed
FROM job_registry jr;

-- View: Per-competitor status (for bento-grid hydration)
CREATE OR REPLACE VIEW v_competitor_status AS
SELECT 
    jm.job_token,
    jm.competitor_id,
    jm.competitor_domain,
    jm.status,
    jm.domain_authority,
    jm.traffic_estimate,
    jm.keyword_count,
    jm.backlink_count,
    jm.content_score,
    jm.performance_score,
    jm.current_phase,
    jm.phase_progress,
    jm.has_elite_data,
    jm.has_gemini_analysis,
    jm.duration_ms,
    jm.updated_at,
    (SELECT result_id FROM job_results jr 
     WHERE jr.job_token = jm.job_token 
     AND jr.competitor_id = jm.competitor_id 
     AND jr.result_type = 'FINAL' 
     LIMIT 1) AS final_result_id
FROM job_metrics jm;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- STORED PROCEDURES: Task management operations
-- ═══════════════════════════════════════════════════════════════════════════════════

DELIMITER //

-- Procedure: Create a new job with all tasks
CREATE PROCEDURE sp_create_parallel_job(
    IN p_job_token VARCHAR(64),
    IN p_project_id VARCHAR(64),
    IN p_user_id INT,
    IN p_your_domain VARCHAR(255),
    IN p_competitors JSON  -- Array of competitor domains
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE competitor_count INT;
    DECLARE competitor_domain VARCHAR(255);
    DECLARE competitor_id VARCHAR(64);
    DECLARE task_types VARCHAR(255) DEFAULT 'FETCH,ENRICH,ANALYZE,CLUSTER,PERSIST';
    DECLARE task_type VARCHAR(32);
    DECLARE seq INT;
    
    -- Get competitor count
    SET competitor_count = JSON_LENGTH(p_competitors);
    
    -- Create job registry entry
    INSERT INTO job_registry (
        job_token, project_id, user_id, your_domain,
        competitor_count, tasks_total, status, execution_mode
    ) VALUES (
        p_job_token, p_project_id, p_user_id, p_your_domain,
        competitor_count, competitor_count * 5, 'QUEUED', 'parallel'
    );
    
    -- Create tasks for each competitor
    WHILE i < competitor_count DO
        SET competitor_domain = JSON_UNQUOTE(JSON_EXTRACT(p_competitors, CONCAT('$[', i, ']')));
        SET competitor_id = CONCAT('comp_', MD5(CONCAT(p_job_token, competitor_domain)));
        
        -- Create 5 tasks per competitor (FETCH, ENRICH, ANALYZE, CLUSTER, PERSIST)
        SET seq = 0;
        task_loop: LOOP
            SET task_type = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(task_types, ',', seq + 1), ',', -1));
            
            INSERT INTO job_tasks (
                task_id, job_token, competitor_id, competitor_domain,
                task_type, sequence_order, status
            ) VALUES (
                UUID(), p_job_token, competitor_id, competitor_domain,
                task_type, seq, IF(seq = 0, 'QUEUED', 'PENDING')
            );
            
            SET seq = seq + 1;
            IF seq >= 5 THEN LEAVE task_loop; END IF;
        END LOOP;
        
        -- Create metrics entry for this competitor
        INSERT INTO job_metrics (
            job_token, competitor_id, competitor_domain, status
        ) VALUES (
            p_job_token, competitor_id, competitor_domain, 'pending'
        );
        
        SET i = i + 1;
    END WHILE;
    
    -- Update job status to running
    UPDATE job_registry SET status = 'RUNNING', started_at = NOW() WHERE job_token = p_job_token;
    
    SELECT p_job_token AS job_token, competitor_count, competitor_count * 5 AS total_tasks;
END //

-- Procedure: Update task status and propagate to job
CREATE PROCEDURE sp_update_task_status(
    IN p_task_id VARCHAR(64),
    IN p_status VARCHAR(32),
    IN p_error_message TEXT,
    IN p_output_data_id VARCHAR(64)
)
BEGIN
    DECLARE v_job_token VARCHAR(64);
    DECLARE v_competitor_id VARCHAR(64);
    DECLARE v_task_type VARCHAR(32);
    DECLARE v_completed INT;
    DECLARE v_failed INT;
    DECLARE v_total INT;
    
    -- Get task info
    SELECT job_token, competitor_id, task_type 
    INTO v_job_token, v_competitor_id, v_task_type
    FROM job_tasks WHERE task_id = p_task_id;
    
    -- Update task
    UPDATE job_tasks SET 
        status = p_status,
        completed_at = IF(p_status IN ('COMPLETED', 'FAILED', 'SKIPPED'), NOW(), NULL),
        error_message = p_error_message,
        output_data_id = p_output_data_id,
        duration_ms = TIMESTAMPDIFF(MICROSECOND, started_at, NOW()) / 1000
    WHERE task_id = p_task_id;
    
    -- If task completed, queue next task for this competitor
    IF p_status = 'COMPLETED' THEN
        UPDATE job_tasks SET status = 'QUEUED', queued_at = NOW()
        WHERE job_token = v_job_token 
        AND competitor_id = v_competitor_id
        AND status = 'PENDING'
        ORDER BY sequence_order
        LIMIT 1;
    END IF;
    
    -- Update job metrics
    UPDATE job_metrics SET 
        current_phase = v_task_type,
        status = CASE 
            WHEN v_task_type = 'FETCH' THEN 'fetching'
            WHEN v_task_type = 'ENRICH' THEN 'enriching'
            WHEN v_task_type = 'ANALYZE' THEN 'analyzing'
            WHEN v_task_type = 'PERSIST' AND p_status = 'COMPLETED' THEN 'completed'
            ELSE status
        END
    WHERE job_token = v_job_token AND competitor_id = v_competitor_id;
    
    -- Update job progress
    SELECT 
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END),
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END),
        COUNT(*)
    INTO v_completed, v_failed, v_total
    FROM job_tasks WHERE job_token = v_job_token;
    
    UPDATE job_registry SET 
        tasks_completed = v_completed,
        tasks_failed = v_failed,
        progress_percent = (v_completed / v_total) * 100,
        status = CASE
            WHEN v_completed + v_failed = v_total AND v_failed = 0 THEN 'COMPLETED'
            WHEN v_completed + v_failed = v_total AND v_failed > 0 THEN 'PARTIAL'
            ELSE 'RUNNING'
        END,
        completed_at = IF(v_completed + v_failed = v_total, NOW(), NULL)
    WHERE job_token = v_job_token;
END //

-- Procedure: Get job status for polling
CREATE PROCEDURE sp_get_job_status(IN p_job_token VARCHAR(64))
BEGIN
    -- Return job summary
    SELECT * FROM v_job_status WHERE job_token = p_job_token;
    
    -- Return per-competitor status
    SELECT * FROM v_competitor_status WHERE job_token = p_job_token ORDER BY competitor_domain;
END //

DELIMITER ;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- CLEANUP: Remove old jobs (run via cron/scheduled task)
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Jobs older than 24 hours are purged
CREATE EVENT IF NOT EXISTS evt_cleanup_old_jobs
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM job_registry WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END;

<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * JOB_HANDLER.PHP - ORACLE ELITE v22.0 PARALLEL TASK-CLUSTER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PHP GATEWAY ENDPOINT FOR JOB MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Handle job-related gateway actions from Google Apps Script
 * - job_create: Create new job in job_registry
 * - job_get_status: Get job status for UI polling
 * - job_update_task: Update task status
 * - job_update_metrics: Update competitor metrics
 * - job_store_result: Store task result
 * - job_get_result: Get stored result
 * 
 * INTEGRATION:
 * Add to api_gateway.php switch statement:
 *   case 'job_create':
 *   case 'job_get_status':
 *   case 'job_update_task':
 *   case 'job_update_metrics':
 *   case 'job_store_result':
 *   case 'job_get_result':
 *       require_once 'job_handler.php';
 *       $result = handleJobAction($action, $payload, $db);
 *       break;
 * 
 * @version 22.0.0-cluster
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Main handler for job-related actions
 * 
 * @param string $action The action to perform
 * @param array $payload The request payload
 * @param PDO $db Database connection
 * @return array Result array
 */
function handleJobAction($action, $payload, $db) {
    try {
        switch ($action) {
            case 'job_create':
                return createJob($payload, $db);
                
            case 'job_get_status':
                return getJobStatus($payload, $db);
                
            case 'job_update_task':
                return updateTaskStatus($payload, $db);
                
            case 'job_update_metrics':
                return updateCompetitorMetrics($payload, $db);
                
            case 'job_store_result':
                return storeJobResult($payload, $db);
                
            case 'job_get_result':
                return getJobResult($payload, $db);
                
            case 'job_update_status':
                return updateJobStatus($payload, $db);
            
            // ═══════════════════════════════════════════════════════════════════════
            // FIX #3: JOB TOKEN RECOVERY - Self-healing when UI loses token
            // SQL: SELECT job_token FROM job_registry WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
            // ═══════════════════════════════════════════════════════════════════════
            case 'job_recover_token':
                return recoverJobToken($payload, $db);
            
            // ═══════════════════════════════════════════════════════════════════════
            // THIN UI: On-Demand Evidence Fetching (prevents 3.6MB channel crash)
            // ═══════════════════════════════════════════════════════════════════════
            case 'job_list_competitors':
                return listJobCompetitors($payload, $db);
                
            case 'job_get_competitor':
                return getCompetitorAnalysis($payload, $db);
                
            case 'job_get_evidence_snippet':
                return getRawEvidenceSnippet($payload, $db);
            
            // ═══════════════════════════════════════════════════════════════════════
            // LAYER 12: Competitor Snapshot with Evidence Map (500KB max)
            // ═══════════════════════════════════════════════════════════════════════
            case 'job_get_competitor_snapshot':
                return getCompetitorSnapshot($payload, $db);
                
            default:
                return [
                    'success' => false,
                    'error' => 'Unknown job action: ' . $action
                ];
        }
    } catch (Exception $e) {
        error_log('Job handler error: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Create a new parallel analysis job
 */
function createJob($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $projectId = $payload['project_id'] ?? '';
    $userId = $payload['user_id'] ?? 0;
    $yourDomain = $payload['your_domain'] ?? '';
    $competitors = $payload['competitors'] ?? [];
    $competitorCount = $payload['competitor_count'] ?? count($competitors);
    $analysisType = $payload['analysis_type'] ?? 'elite';
    
    if (!$jobToken) {
        return ['success' => false, 'error' => 'Job token required'];
    }
    
    // Insert job into registry
    $stmt = $db->prepare("
        INSERT INTO job_registry (
            job_token, project_id, user_id, your_domain,
            competitor_count, tasks_total, status, execution_mode, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'QUEUED', 'parallel', NOW())
    ");
    
    $tasksTotal = $competitorCount * 5; // 5 tasks per competitor
    
    $stmt->execute([
        $jobToken, $projectId, $userId, $yourDomain,
        $competitorCount, $tasksTotal
    ]);
    
    // Create tasks and metrics for each competitor
    foreach ($competitors as $index => $domain) {
        $competitorId = 'comp_' . md5($jobToken . $domain);
        
        // Create 5 tasks per competitor
        $taskTypes = ['FETCH', 'ENRICH', 'ANALYZE', 'CLUSTER', 'PERSIST'];
        
        foreach ($taskTypes as $seq => $taskType) {
            $taskId = uniqid('task_', true);
            
            $stmt = $db->prepare("
                INSERT INTO job_tasks (
                    task_id, job_token, competitor_id, competitor_domain,
                    task_type, sequence_order, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $status = ($seq === 0) ? 'QUEUED' : 'PENDING';
            $stmt->execute([
                $taskId, $jobToken, $competitorId, $domain,
                $taskType, $seq, $status
            ]);
        }
        
        // Create metrics entry
        $stmt = $db->prepare("
            INSERT INTO job_metrics (
                job_token, competitor_id, competitor_domain, status
            ) VALUES (?, ?, ?, 'pending')
        ");
        $stmt->execute([$jobToken, $competitorId, $domain]);
    }
    
    // Update job status to RUNNING
    $stmt = $db->prepare("
        UPDATE job_registry 
        SET status = 'RUNNING', started_at = NOW() 
        WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    
    return [
        'success' => true,
        'job_token' => $jobToken,
        'competitor_count' => $competitorCount,
        'tasks_total' => $tasksTotal
    ];
}

/**
 * Get job status for UI polling
 */
function getJobStatus($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    
    if (!$jobToken) {
        return ['success' => false, 'error' => 'Job token required'];
    }
    
    // Get job info
    $stmt = $db->prepare("
        SELECT 
            job_token, project_id, status as job_status, competitor_count,
            tasks_total, tasks_completed, tasks_failed, progress_percent,
            created_at, started_at, completed_at,
            TIMESTAMPDIFF(SECOND, started_at, COALESCE(completed_at, NOW())) as elapsed_seconds
        FROM job_registry
        WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$job) {
        return ['success' => false, 'error' => 'Job not found'];
    }
    
    // Get competitor metrics
    $stmt = $db->prepare("
        SELECT 
            competitor_id as id, competitor_domain as domain, status,
            domain_authority, traffic_estimate, keyword_count, backlink_count,
            content_score, performance_score, current_phase, phase_progress,
            has_elite_data, has_gemini_analysis, duration_ms
        FROM job_metrics
        WHERE job_token = ?
        ORDER BY competitor_domain
    ");
    $stmt->execute([$jobToken]);
    $competitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count completed/failed
    $completedCount = 0;
    $failedCount = 0;
    foreach ($competitors as $comp) {
        if ($comp['status'] === 'completed') $completedCount++;
        if ($comp['status'] === 'failed') $failedCount++;
    }
    
    return array_merge($job, [
        'success' => true,
        'competitors' => $competitors,
        'competitors_completed' => $completedCount,
        'competitors_failed' => $failedCount,
        'is_complete' => ($job['job_status'] === 'COMPLETED' || $job['job_status'] === 'PARTIAL')
    ]);
}

/**
 * Update task status
 */
function updateTaskStatus($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $competitorId = $payload['competitor_id'] ?? null;
    $taskType = $payload['task_type'] ?? null;
    $status = $payload['status'] ?? null;
    $errorMessage = $payload['error_message'] ?? null;
    $outputDataId = $payload['output_data_id'] ?? null;
    
    if (!$jobToken || !$competitorId || !$taskType || !$status) {
        return ['success' => false, 'error' => 'Missing required fields'];
    }
    
    // Update task
    $stmt = $db->prepare("
        UPDATE job_tasks SET
            status = ?,
            completed_at = IF(? IN ('COMPLETED', 'FAILED', 'SKIPPED'), NOW(), NULL),
            error_message = ?,
            output_data_id = ?,
            duration_ms = TIMESTAMPDIFF(MICROSECOND, started_at, NOW()) / 1000
        WHERE job_token = ? AND competitor_id = ? AND task_type = ?
    ");
    
    $stmt->execute([
        $status, $status, $errorMessage, $outputDataId,
        $jobToken, $competitorId, $taskType
    ]);
    
    // If task completed, queue next task
    if ($status === 'COMPLETED') {
        $stmt = $db->prepare("
            UPDATE job_tasks SET status = 'QUEUED', queued_at = NOW()
            WHERE job_token = ? AND competitor_id = ? AND status = 'PENDING'
            ORDER BY sequence_order LIMIT 1
        ");
        $stmt->execute([$jobToken, $competitorId]);
    }
    
    // Update job progress
    updateJobProgress($jobToken, $db);
    
    return ['success' => true];
}

/**
 * Update competitor metrics for UI polling
 */
function updateCompetitorMetrics($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $competitorId = $payload['competitor_id'] ?? null;
    $metrics = $payload['metrics'] ?? [];
    
    if (!$jobToken || !$competitorId) {
        return ['success' => false, 'error' => 'Missing required fields'];
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    $allowedFields = [
        'status', 'domain_authority', 'traffic_estimate', 'keyword_count',
        'backlink_count', 'content_score', 'performance_score', 'current_phase',
        'phase_progress', 'has_elite_data', 'has_gemini_analysis', 'has_keyword_clusters'
    ];
    
    foreach ($allowedFields as $field) {
        if (isset($metrics[$field])) {
            $updates[] = "$field = ?";
            $params[] = $metrics[$field];
        }
    }
    
    if (empty($updates)) {
        return ['success' => false, 'error' => 'No valid metrics provided'];
    }
    
    // Add completed_at if status is completed
    if (isset($metrics['status']) && $metrics['status'] === 'completed') {
        $updates[] = "completed_at = NOW()";
        $updates[] = "duration_ms = TIMESTAMPDIFF(MICROSECOND, started_at, NOW()) / 1000";
    }
    
    // Add started_at if this is first update
    if (isset($metrics['status']) && in_array($metrics['status'], ['fetching', 'running'])) {
        $updates[] = "started_at = COALESCE(started_at, NOW())";
    }
    
    $params[] = $jobToken;
    $params[] = $competitorId;
    
    $sql = "UPDATE job_metrics SET " . implode(', ', $updates) . " WHERE job_token = ? AND competitor_id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    return ['success' => true];
}

/**
 * Store job result with Elite Token Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 * COLUMNS USED:
 *   - job_token: The unique transaction token (WF-XXXX format)
 *   - project_id: Project identifier for direct lookups
 *   - result_type: FINAL, STAGE_1, STAGE_2, etc.
 *   - data_json: The JSON payload (supports both data_json and legacy payload column)
 * ═══════════════════════════════════════════════════════════════════════════
 */
function storeJobResult($payload, $db) {
    $resultId = $payload['result_id'] ?? uniqid('result_', true);
    $jobToken = $payload['job_token'] ?? null;
    $projectId = $payload['project_id'] ?? null;  // NEW: Project ID for direct lookups
    $competitorId = $payload['competitor_id'] ?? null;
    $resultType = $payload['result_type'] ?? 'FINAL';
    $stageNumber = $payload['stage_number'] ?? null;  // NEW: For workflow stages
    
    // Accept data from multiple possible keys (compatibility layer)
    $dataJson = $payload['data_json'] ?? $payload['payload'] ?? $payload['result_json'] ?? '{}';
    
    error_log("[JOB_HANDLER] storeJobResult: token=$jobToken, project=$projectId, type=$resultType");
    
    if (!$jobToken) {
        error_log("[JOB_HANDLER] ❌ storeJobResult failed: No job_token provided");
        return ['success' => false, 'error' => 'Job token required'];
    }
    
    // If project_id not provided, try to get it from job_registry
    if (!$projectId && $jobToken) {
        $stmt = $db->prepare("SELECT project_id FROM job_registry WHERE job_token = ? LIMIT 1");
        $stmt->execute([$jobToken]);
        $regResult = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($regResult) {
            $projectId = $regResult['project_id'];
            error_log("[JOB_HANDLER] Resolved project_id from job_registry: $projectId");
        }
    }
    
    // Compute hash for deduplication
    $dataHash = md5($dataJson);
    $dataSize = strlen($dataJson);
    
    // Use INSERT with proper columns including project_id
    $stmt = $db->prepare("
        INSERT INTO job_results (
            result_id, job_token, project_id, competitor_id, result_type,
            data_json, data_hash, data_size_bytes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            project_id = VALUES(project_id),
            data_json = VALUES(data_json),
            data_hash = VALUES(data_hash),
            data_size_bytes = VALUES(data_size_bytes)
    ");
    
    $stmt->execute([
        $resultId, $jobToken, $projectId, $competitorId, $resultType,
        $dataJson, $dataHash, $dataSize
    ]);
    
    error_log("[JOB_HANDLER] ✅ Committed to job_results [TOKEN: $jobToken]");
    
    return [
        'success' => true,
        'result_id' => $resultId,
        'job_token' => $jobToken,
        'project_id' => $projectId,
        'data_size' => $dataSize
    ];
}

/**
 * Get stored job result with Elite Token Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 * LOOKUP PRIORITY:
 *   1. By result_id (exact match)
 *   2. By job_token + result_type + competitor_id
 *   3. By project_id + result_type (fallback for stage lookups)
 * ═══════════════════════════════════════════════════════════════════════════
 */
function getJobResult($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $projectId = $payload['project_id'] ?? null;  // NEW: Project-based lookup
    $competitorId = $payload['competitor_id'] ?? null;
    $resultType = $payload['result_type'] ?? 'FINAL';
    $resultId = $payload['result_id'] ?? null;
    
    error_log("[JOB_HANDLER] getJobResult: token=$jobToken, project=$projectId, type=$resultType");
    
    // Allow lookup by either job_token OR project_id
    if (!$jobToken && !$projectId && !$resultId) {
        return ['success' => false, 'error' => 'job_token, project_id, or result_id required'];
    }
    
    // Build dynamic query based on provided parameters
    $sql = "SELECT result_id, job_token, project_id, competitor_id, result_type, data_json, data_size_bytes, created_at FROM job_results WHERE 1=1";
    $params = [];
    
    if ($resultId) {
        // Exact result_id lookup
        $sql .= " AND result_id = ?";
        $params[] = $resultId;
    } elseif ($jobToken) {
        // Token-based lookup
        $sql .= " AND job_token = ?";
        $params[] = $jobToken;
        
        if ($competitorId) {
            $sql .= " AND competitor_id = ?";
            $params[] = $competitorId;
        }
        $sql .= " AND result_type = ?";
        $params[] = $resultType;
    } elseif ($projectId) {
        // Project-based lookup (for workflow stage recovery)
        $sql .= " AND project_id = ?";
        $params[] = $projectId;
        $sql .= " AND result_type = ?";
        $params[] = $resultType;
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT 1";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        error_log("[JOB_HANDLER] ⚠️ getJobResult: No result found");
        return ['success' => false, 'error' => 'Result not found'];
    }
    
    error_log("[JOB_HANDLER] ✅ getJobResult: Found result_id=" . $result['result_id']);
    
    return [
        'success' => true,
        'result_id' => $result['result_id'],
        'job_token' => $result['job_token'],
        'project_id' => $result['project_id'],
        'result_type' => $result['result_type'],
        'data' => $result['data_json'],
        'data_size' => $result['data_size_bytes'],
        'created_at' => $result['created_at']
    ];
}

/**
 * Update overall job status
 */
function updateJobStatus($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $status = $payload['status'] ?? null;
    $completedAt = $payload['completed_at'] ?? null;
    
    if (!$jobToken || !$status) {
        return ['success' => false, 'error' => 'Missing required fields'];
    }
    
    $sql = "UPDATE job_registry SET status = ?";
    $params = [$status];
    
    if ($completedAt) {
        $sql .= ", completed_at = ?";
        $params[] = $completedAt;
    }
    
    $sql .= " WHERE job_token = ?";
    $params[] = $jobToken;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    return ['success' => true];
}

/**
 * Update job progress based on task completion
 */
function updateJobProgress($jobToken, $db) {
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
            COUNT(*) as total
        FROM job_tasks WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    $counts = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $completed = (int)$counts['completed'];
    $failed = (int)$counts['failed'];
    $total = (int)$counts['total'];
    
    $progress = $total > 0 ? ($completed / $total) * 100 : 0;
    
    // Determine job status
    $jobStatus = 'RUNNING';
    if ($completed + $failed >= $total) {
        $jobStatus = ($failed === 0) ? 'COMPLETED' : 'PARTIAL';
    }
    
    $stmt = $db->prepare("
        UPDATE job_registry SET
            tasks_completed = ?,
            tasks_failed = ?,
            progress_percent = ?,
            status = ?,
            completed_at = IF(? IN ('COMPLETED', 'PARTIAL'), NOW(), NULL)
        WHERE job_token = ?
    ");
    
    $stmt->execute([
        $completed, $failed, $progress, $jobStatus, $jobStatus, $jobToken
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIX #3: JOB TOKEN RECOVERY - Self-healing when UI loses token
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Recover jobToken from projectId when UI loses state
 * Uses authoritative MySQL query to job_registry table
 * 
 * SQL: SELECT job_token FROM job_registry WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
 * 
 * @param array $payload Contains project_id
 * @param PDO $db Database connection
 * @return array Recovery result with job_token if found
 */
function recoverJobToken($payload, $db) {
    $projectId = $payload['project_id'] ?? '';
    
    if (empty($projectId)) {
        return [
            'success' => false,
            'error' => 'project_id is required for token recovery'
        ];
    }
    
    error_log("[TOKEN_RECOVERY] Attempting recovery for project: $projectId");
    
    try {
        // Query job_registry for most recent job by this project
        $stmt = $db->prepare("
            SELECT 
                job_token,
                project_id,
                status,
                competitor_count,
                created_at,
                completed_at
            FROM job_registry 
            WHERE project_id = ?
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        
        $stmt->execute([$projectId]);
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($job) {
            error_log("[TOKEN_RECOVERY] ✅ Found job_token: " . $job['job_token']);
            return [
                'success' => true,
                'job_token' => $job['job_token'],
                'project_id' => $job['project_id'],
                'status' => $job['status'],
                'competitor_count' => (int)$job['competitor_count'],
                'created_at' => $job['created_at'],
                'completed_at' => $job['completed_at'],
                'source' => 'mysql_job_registry'
            ];
        }
        
        error_log("[TOKEN_RECOVERY] ❌ No job found for project: $projectId");
        return [
            'success' => false,
            'error' => 'No job found for project: ' . $projectId,
            'project_id' => $projectId
        ];
        
    } catch (Exception $e) {
        error_log("[TOKEN_RECOVERY] Error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// THIN UI: ON-DEMAND EVIDENCE FETCHING (FIX FOR 3.6MB CHANNEL CRASH)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * List all competitors for a job (lightweight - no data)
 * Returns only domain names and statuses for UI to fetch individually
 * 
 * @param array $payload Contains job_token
 * @param PDO $db Database connection
 * @return array List of competitor domains with status
 */
function listJobCompetitors($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token is required'];
    }
    
    error_log("[THIN_UI] listJobCompetitors for job: $jobToken");
    
    try {
        // Get competitor list from job_metrics
        $stmt = $db->prepare("
            SELECT 
                competitor_id,
                competitor_domain,
                status,
                organic_traffic,
                authority_score,
                created_at
            FROM job_metrics 
            WHERE job_token = ?
            ORDER BY competitor_domain ASC
        ");
        
        $stmt->execute([$jobToken]);
        $competitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get last sync time from job_results
        $stmtSync = $db->prepare("
            SELECT MAX(created_at) as last_sync, SUM(data_size_bytes) as total_size
            FROM job_results 
            WHERE job_token = ?
        ");
        $stmtSync->execute([$jobToken]);
        $syncInfo = $stmtSync->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'job_token' => $jobToken,
            'competitors' => array_map(function($c) {
                return [
                    'id' => $c['competitor_id'],
                    'domain' => $c['competitor_domain'],
                    'status' => $c['status'],
                    'hasData' => $c['status'] === 'completed'
                ];
            }, $competitors),
            'count' => count($competitors),
            'last_mysql_sync' => $syncInfo['last_sync'] ?? null,
            'total_data_size' => (int)($syncInfo['total_size'] ?? 0)
        ];
        
    } catch (Exception $e) {
        error_log("[THIN_UI] listJobCompetitors error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Fetch analysis data for a SINGLE competitor (on-demand, ~500KB payload)
 * Called in a loop by UI for each domain
 * 
 * @param array $payload Contains job_token, competitor_id or domain
 * @param PDO $db Database connection
 * @return array Competitor analysis data
 */
function getCompetitorAnalysis($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $competitorId = $payload['competitor_id'] ?? null;
    $domain = $payload['domain'] ?? null;
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token is required'];
    }
    
    if (empty($competitorId) && empty($domain)) {
        return ['success' => false, 'error' => 'competitor_id or domain is required'];
    }
    
    error_log("[THIN_UI] getCompetitorAnalysis: $domain ($competitorId)");
    
    try {
        // Build query based on provided identifier
        $sql = "
            SELECT 
                result_id,
                competitor_id,
                result_type,
                data_json,
                data_size_bytes,
                created_at
            FROM job_results 
            WHERE job_token = ?
        ";
        $params = [$jobToken];
        
        if ($competitorId) {
            $sql .= " AND competitor_id = ?";
            $params[] = $competitorId;
        }
        
        // Get FINAL result first, fallback to RAW_FETCH
        $sql .= " AND result_type IN ('FINAL', 'RAW_FETCH') ORDER BY 
            CASE result_type WHEN 'FINAL' THEN 1 ELSE 2 END,
            created_at DESC 
            LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            // Try by domain via job_metrics join
            if ($domain) {
                $stmt2 = $db->prepare("
                    SELECT jr.* 
                    FROM job_results jr
                    JOIN job_metrics jm ON jr.job_token = jm.job_token AND jr.competitor_id = jm.competitor_id
                    WHERE jr.job_token = ? AND jm.competitor_domain = ?
                    AND jr.result_type IN ('FINAL', 'RAW_FETCH')
                    ORDER BY jr.created_at DESC
                    LIMIT 1
                ");
                $stmt2->execute([$jobToken, $domain]);
                $result = $stmt2->fetch(PDO::FETCH_ASSOC);
            }
        }
        
        if (!$result) {
            return [
                'success' => false,
                'error' => 'No analysis data found for competitor',
                'job_token' => $jobToken,
                'domain' => $domain
            ];
        }
        
        // Parse and return data
        $data = json_decode($result['data_json'], true);
        
        return [
            'success' => true,
            'job_token' => $jobToken,
            'result_id' => $result['result_id'],
            'competitor_id' => $result['competitor_id'],
            'domain' => $domain ?? ($data['domain'] ?? 'unknown'),
            'result_type' => $result['result_type'],
            'data' => $data,
            'data_size' => (int)$result['data_size_bytes'],
            'fetched_at' => $result['created_at']
        ];
        
    } catch (Exception $e) {
        error_log("[THIN_UI] getCompetitorAnalysis error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Fetch raw evidence snippet for a specific metric (Zero-Trust Proof)
 * Called ONLY when user clicks 🛡️ proof button
 * 
 * SQL: SELECT data_json FROM job_results WHERE job_token = ? AND competitor_id = ? AND result_type = 'RAW_FETCH' LIMIT 1
 * 
 * @param array $payload Contains job_token, domain, metric_type
 * @param PDO $db Database connection
 * @return array Evidence snippet with raw HTML proof
 */
function getRawEvidenceSnippet($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    $metricType = $payload['metric_type'] ?? 'all';
    $competitorId = $payload['competitor_id'] ?? null;
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token is required'];
    }
    
    if (empty($domain) && empty($competitorId)) {
        return ['success' => false, 'error' => 'domain or competitor_id is required'];
    }
    
    error_log("[THIN_UI] getRawEvidenceSnippet: $domain / $metricType");
    
    try {
        // First, resolve competitor_id from domain if needed
        if (empty($competitorId) && !empty($domain)) {
            $stmt = $db->prepare("
                SELECT competitor_id FROM job_metrics 
                WHERE job_token = ? AND competitor_domain = ?
                LIMIT 1
            ");
            $stmt->execute([$jobToken, $domain]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $competitorId = $row['competitor_id'] ?? null;
        }
        
        if (empty($competitorId)) {
            return [
                'success' => false,
                'error' => 'Competitor not found in job',
                'domain' => $domain
            ];
        }
        
        // Fetch RAW_FETCH result for evidence
        $stmt = $db->prepare("
            SELECT 
                result_id,
                data_json,
                data_size_bytes,
                created_at
            FROM job_results 
            WHERE job_token = ? 
            AND competitor_id = ? 
            AND result_type = 'RAW_FETCH'
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        
        $stmt->execute([$jobToken, $competitorId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            // Fallback: Try FINAL result
            $stmt2 = $db->prepare("
                SELECT result_id, data_json, data_size_bytes, created_at
                FROM job_results 
                WHERE job_token = ? AND competitor_id = ? AND result_type = 'FINAL'
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt2->execute([$jobToken, $competitorId]);
            $result = $stmt2->fetch(PDO::FETCH_ASSOC);
        }
        
        if (!$result) {
            return [
                'success' => false,
                'error' => 'No evidence data found',
                'job_token' => $jobToken,
                'domain' => $domain
            ];
        }
        
        // Parse data and extract relevant evidence
        $data = json_decode($result['data_json'], true);
        $evidence = null;
        
        // Extract evidence based on metric_type
        if ($metricType === 'all') {
            // Return evidenceMap if available
            $evidence = $data['evidenceMap'] ?? $data['stages'] ?? $data;
        } else {
            // Look for specific metric in evidenceMap
            $evidenceMap = $data['evidenceMap'] ?? [];
            if (isset($evidenceMap[$metricType])) {
                $evidence = $evidenceMap[$metricType];
            } else {
                // Try nested path
                $parts = explode('.', $metricType);
                $current = $data;
                foreach ($parts as $part) {
                    $current = $current[$part] ?? null;
                    if ($current === null) break;
                }
                $evidence = $current;
            }
        }
        
        return [
            'success' => true,
            'job_token' => $jobToken,
            'domain' => $domain,
            'competitor_id' => $competitorId,
            'metric_type' => $metricType,
            'evidence' => $evidence,
            'raw_snippet' => is_string($evidence) ? substr($evidence, 0, 2000) : null,
            'data_size' => (int)$result['data_size_bytes'],
            'fetched_at' => $result['created_at']
        ];
        
    } catch (Exception $e) {
        error_log("[THIN_UI] getRawEvidenceSnippet error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}


// ═══════════════════════════════════════════════════════════════════════════════════
// LAYER 12: COMPETITOR SNAPSHOT WITH EVIDENCE MAP (500KB MAX)
// Policy: Every snapshot MUST include evidenceMap for Zero-Trust verification
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * LAYER 12: Get competitor snapshot with evidenceMap for Zero-Trust
 * Called by AsyncRehydrator - Returns ~500KB max payload
 * 
 * Includes:
 *   - Full competitor analysis data
 *   - Evidence map for Zero-Trust proof badges
 *   - Strategic audit results (if available)
 * 
 * @param array $payload Contains job_token, domain, include_evidence, include_strategic, max_payload_kb
 * @param PDO $db Database connection
 * @return array Competitor snapshot with evidenceMap
 */
function getCompetitorSnapshot($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    $includeEvidence = $payload['include_evidence'] ?? true;
    $includeStrategic = $payload['include_strategic'] ?? true;
    $maxPayloadKb = $payload['max_payload_kb'] ?? 500;
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token is required'];
    }
    
    if (empty($domain)) {
        return ['success' => false, 'error' => 'domain is required'];
    }
    
    error_log("[LAYER12] getCompetitorSnapshot: $domain (max: {$maxPayloadKb}KB)");
    
    try {
        // First resolve competitor_id from domain
        $stmt = $db->prepare("
            SELECT competitor_id FROM job_metrics 
            WHERE job_token = ? AND competitor_domain = ?
            LIMIT 1
        ");
        $stmt->execute([$jobToken, $domain]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $competitorId = $row['competitor_id'] ?? null;
        
        if (empty($competitorId)) {
            return [
                'success' => false,
                'error' => 'Competitor not found in job',
                'domain' => $domain
            ];
        }
        
        // Fetch FINAL result (or fallback to RAW_FETCH)
        $stmt = $db->prepare("
            SELECT 
                result_id,
                result_type,
                data_json,
                data_size_bytes,
                created_at
            FROM job_results 
            WHERE job_token = ? 
            AND competitor_id = ?
            AND result_type IN ('FINAL', 'RAW_FETCH', 'STRATEGIC_AUDIT')
            ORDER BY 
                CASE result_type 
                    WHEN 'FINAL' THEN 1 
                    WHEN 'STRATEGIC_AUDIT' THEN 2
                    ELSE 3 
                END,
                created_at DESC
        ");
        $stmt->execute([$jobToken, $competitorId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($results)) {
            return [
                'success' => false,
                'error' => 'No snapshot data found',
                'domain' => $domain
            ];
        }
        
        // Build snapshot from results
        $snapshot = null;
        $evidenceMap = [];
        $strategicAudit = null;
        $rawData = null;
        
        foreach ($results as $result) {
            $data = json_decode($result['data_json'], true);
            
            if ($result['result_type'] === 'FINAL') {
                $snapshot = $data;
            } elseif ($result['result_type'] === 'STRATEGIC_AUDIT' && $includeStrategic) {
                $strategicAudit = $data;
            } elseif ($result['result_type'] === 'RAW_FETCH') {
                $rawData = $data;
            }
        }
        
        // Use RAW_FETCH if no FINAL
        if (!$snapshot && $rawData) {
            $snapshot = $rawData;
        }
        
        if (!$snapshot) {
            return [
                'success' => false,
                'error' => 'Could not construct snapshot',
                'domain' => $domain
            ];
        }
        
        // Build evidence map for Zero-Trust
        if ($includeEvidence) {
            $evidenceMap = buildEvidenceMap($snapshot, $rawData);
        }
        
        // Merge strategic audit if available
        if ($strategicAudit && $includeStrategic) {
            $snapshot['strategicAudit'] = $strategicAudit;
        }
        
        // Check payload size and trim if necessary
        $response = [
            'success' => true,
            'job_token' => $jobToken,
            'domain' => $domain,
            'competitor_id' => $competitorId,
            'data' => $snapshot,
            'evidence_map' => $evidenceMap,
            'strategic_audit' => $strategicAudit,
            'data_size' => 0,
            'fetched_at' => date('c')
        ];
        
        // Calculate size and trim if over limit
        $jsonResponse = json_encode($response);
        $responseSize = strlen($jsonResponse);
        $maxBytes = $maxPayloadKb * 1024;
        
        if ($responseSize > $maxBytes) {
            error_log("[LAYER12] Snapshot too large ({$responseSize} bytes), trimming...");
            
            // Remove large fields to fit under limit
            if (isset($snapshot['rawHtml'])) {
                unset($snapshot['rawHtml']);
            }
            if (isset($snapshot['content']['fullContent'])) {
                $snapshot['content']['fullContent'] = substr($snapshot['content']['fullContent'] ?? '', 0, 5000);
            }
            if (isset($snapshot['stages'])) {
                unset($snapshot['stages']);
            }
            
            $response['data'] = $snapshot;
            $jsonResponse = json_encode($response);
            $responseSize = strlen($jsonResponse);
            $response['_trimmed'] = true;
        }
        
        $response['data_size'] = $responseSize;
        
        error_log("[LAYER12] Snapshot ready: {$responseSize} bytes");
        
        return $response;
        
    } catch (Exception $e) {
        error_log("[LAYER12] getCompetitorSnapshot error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Build evidence map from competitor data for Zero-Trust verification
 * 
 * @param array $snapshot Main competitor data
 * @param array $rawData Raw fetch data (for source snippets)
 * @return array Evidence map with proof pointers
 */
function buildEvidenceMap($snapshot, $rawData = null) {
    $evidenceMap = [];
    
    // Technical SEO evidence
    if (isset($snapshot['technical'])) {
        $tech = $snapshot['technical'];
        $evidenceMap['technical'] = [
            'wordCount' => [
                'value' => $tech['wordCount'] ?? null,
                'source' => 'html.body',
                'confidence' => 95
            ],
            'headings' => [
                'value' => $tech['headingCount'] ?? count($tech['headings'] ?? []),
                'source' => 'html.headings',
                'confidence' => 95
            ],
            'schemaTypes' => [
                'value' => count($tech['schemaTypes'] ?? []),
                'source' => 'html.script[type="application/ld+json"]',
                'confidence' => 90
            ],
            'loadTime' => [
                'value' => $tech['loadTime'] ?? $tech['pageLoadTime'] ?? null,
                'source' => 'fetch.timing',
                'confidence' => 85
            ]
        ];
    }
    
    // Content evidence
    if (isset($snapshot['content'])) {
        $content = $snapshot['content'];
        $evidenceMap['content'] = [
            'title' => [
                'value' => $content['title'] ?? null,
                'source' => 'html.title',
                'confidence' => 100
            ],
            'metaDescription' => [
                'value' => isset($content['metaDescription']) ? substr($content['metaDescription'], 0, 160) : null,
                'source' => 'html.meta[name="description"]',
                'confidence' => 100
            ],
            'readability' => [
                'value' => $content['readabilityScore'] ?? null,
                'source' => 'content.analysis',
                'confidence' => 70
            ]
        ];
    }
    
    // Backlink evidence
    if (isset($snapshot['backlinks'])) {
        $bl = $snapshot['backlinks'];
        $evidenceMap['backlinks'] = [
            'total' => [
                'value' => $bl['total'] ?? $bl['count'] ?? null,
                'source' => 'api.serpapi',
                'confidence' => 80
            ],
            'dofollowRatio' => [
                'value' => $bl['dofollowRatio'] ?? $bl['dofollow_ratio'] ?? null,
                'source' => 'api.calculation',
                'confidence' => 75
            ],
            'domainAuthority' => [
                'value' => $bl['domainAuthority'] ?? $bl['domain_authority'] ?? null,
                'source' => 'api.estimated',
                'confidence' => 65
            ]
        ];
    }
    
    // Keywords evidence
    if (isset($snapshot['keywords']) || isset($snapshot['rankedKeywords'])) {
        $kw = $snapshot['keywords'] ?? [];
        $evidenceMap['keywords'] = [
            'totalRanked' => [
                'value' => $kw['totalRanked'] ?? count($snapshot['rankedKeywords'] ?? []),
                'source' => 'api.serpapi',
                'confidence' => 85
            ],
            'top10Count' => [
                'value' => $kw['top10Count'] ?? null,
                'source' => 'api.filter',
                'confidence' => 85
            ]
        ];
    }
    
    // Strategic audit evidence
    if (isset($snapshot['strategicAudit'])) {
        $sa = $snapshot['strategicAudit'];
        $evidenceMap['strategic'] = [
            'programmaticMoat' => [
                'isProgrammatic' => $sa['programmaticMoat']['isProgrammatic'] ?? false,
                'templateSimilarity' => $sa['programmaticMoat']['templateSimilarity'] ?? 0,
                'source' => 'dom.comparison',
                'confidence' => $sa['programmaticMoat']['confidence'] ?? 75
            ],
            'emotionalDebt' => [
                'frictionScore' => $sa['emotionalDebt']['frictionScore'] ?? 0,
                'gaps' => count($sa['emotionalDebt']['gaps'] ?? []),
                'source' => 'content.analysis',
                'confidence' => 70
            ],
            'semanticTriplets' => [
                'count' => count($sa['semanticTriplets']['triplets'] ?? []),
                'source' => 'nlp.extraction',
                'confidence' => 65
            ]
        ];
    }
    
    // Include existing evidenceMap if present
    if (isset($snapshot['evidenceMap'])) {
        $evidenceMap = array_merge_recursive($snapshot['evidenceMap'], $evidenceMap);
    }
    
    return $evidenceMap;
}

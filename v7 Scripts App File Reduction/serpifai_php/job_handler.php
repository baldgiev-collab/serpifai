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
 * Store job result
 */
function storeJobResult($payload, $db) {
    $resultId = $payload['result_id'] ?? uniqid('result_', true);
    $jobToken = $payload['job_token'] ?? null;
    $competitorId = $payload['competitor_id'] ?? null;
    $resultType = $payload['result_type'] ?? 'FINAL';
    $dataJson = $payload['data_json'] ?? '{}';
    
    if (!$jobToken) {
        return ['success' => false, 'error' => 'Job token required'];
    }
    
    // Compute hash for deduplication
    $dataHash = md5($dataJson);
    $dataSize = strlen($dataJson);
    
    $stmt = $db->prepare("
        INSERT INTO job_results (
            result_id, job_token, competitor_id, result_type,
            data_json, data_hash, data_size_bytes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            data_json = VALUES(data_json),
            data_hash = VALUES(data_hash),
            data_size_bytes = VALUES(data_size_bytes)
    ");
    
    $stmt->execute([
        $resultId, $jobToken, $competitorId, $resultType,
        $dataJson, $dataHash, $dataSize
    ]);
    
    return [
        'success' => true,
        'result_id' => $resultId,
        'data_size' => $dataSize
    ];
}

/**
 * Get stored job result
 */
function getJobResult($payload, $db) {
    $jobToken = $payload['job_token'] ?? null;
    $competitorId = $payload['competitor_id'] ?? null;
    $resultType = $payload['result_type'] ?? 'FINAL';
    $resultId = $payload['result_id'] ?? null;
    
    if (!$jobToken) {
        return ['success' => false, 'error' => 'Job token required'];
    }
    
    $sql = "SELECT result_id, data_json, created_at FROM job_results WHERE job_token = ?";
    $params = [$jobToken];
    
    if ($resultId) {
        $sql .= " AND result_id = ?";
        $params[] = $resultId;
    } else {
        if ($competitorId) {
            $sql .= " AND competitor_id = ?";
            $params[] = $competitorId;
        }
        $sql .= " AND result_type = ?";
        $params[] = $resultType;
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT 1";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        return ['success' => false, 'error' => 'Result not found'];
    }
    
    return [
        'success' => true,
        'result_id' => $result['result_id'],
        'data' => $result['data_json'],
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

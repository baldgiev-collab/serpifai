<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * UPP_HANDLER.PHP - Universal Persistence Provider MySQL Backend
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Handle all UPP (Universal Persistence Provider) gateway actions
 * TARGET SCHEMA: u187453795_SrpAIDataGate
 * 
 * ENDPOINTS:
 *   - upp_save_link_forensics: Save content scrapes
 *   - upp_save_keyword_intelligence: Save keyword data
 *   - upp_save_ai_analysis: Save AI/Gemini analysis
 *   - upp_save_competitor_results: Save meta/technical data
 *   - upp_save_line_item: Granular field saving
 *   - upp_validate_integrity: Validate chunk completeness
 *   - job_recover_latest: Recover latest job token
 * 
 * @version 35.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Main handler for UPP-related actions
 */
function handleUppAction($action, $payload, $db) {
    try {
        switch ($action) {
            case 'upp_save_link_forensics':
                return saveLinkForensics($payload, $db);
                
            case 'upp_save_keyword_intelligence':
                return saveKeywordIntelligence($payload, $db);
                
            case 'upp_save_ai_analysis':
                return saveAiAnalysis($payload, $db);
                
            case 'upp_save_competitor_results':
                return saveCompetitorResults($payload, $db);
                
            case 'upp_save_line_item':
                return saveLineItem($payload, $db);
                
            case 'upp_validate_integrity':
                return validateIntegrity($payload, $db);
                
            case 'job_recover_latest':
                return recoverLatestJobToken($payload, $db);
                
            // Workflow Seeder endpoints
            case 'wf_count_completed_competitors':
                return countCompletedCompetitors($payload, $db);
                
            case 'wf_check_already_seeded':
                return checkAlreadySeeded($payload, $db);
                
            case 'wf_get_job_results_for_seeding':
                return getJobResultsForSeeding($payload, $db);
                
            case 'wf_seed_workflow_log':
                return seedWorkflowLog($payload, $db);
                
            case 'wf_seed_project_data':
                return seedProjectData($payload, $db);
                
            case 'wf_mark_job_seeded':
                return markJobSeeded($payload, $db);
                
            case 'wf_clear_seeded_flag':
                return clearSeededFlag($payload, $db);
                
            case 'wf_clear_workflow_entries':
                return clearWorkflowEntries($payload, $db);
                
            case 'wf_get_workflow_status':
                return getWorkflowStatus($payload, $db);
            
            // Data Pruning endpoints (v36.0)
            case 'prune_link_forensics_count':
                return pruneLinkForensicsCount($payload, $db);
                
            case 'prune_link_forensics_execute':
                return pruneLinkForensicsExecute($payload, $db);
                
            case 'archive_job_results':
                return archiveJobResults($payload, $db);
                
            case 'truncate_api_responses':
                return truncateApiResponses($payload, $db);
                
            case 'delete_expired_cache':
                return deleteExpiredCache($payload, $db);
                
            case 'get_storage_stats':
                return getStorageStats($payload, $db);
                
            case 'verify_audit_integrity':
                return verifyAuditIntegrity($payload, $db);
                
            // Geo/AEO persistence
            case 'upp_save_geo_results':
                return saveGeoResults($payload, $db);
            
            // V12.0 FIX: Elite Stage Result Persistence (Complete Rewrite)
            case 'upp_save_workflow_stage':
                return saveWorkflowStageResult($payload, $db);
            
            // V12.0 FIX: Job results getter for workflow stage recovery
            case 'job_get_results':
                return getWorkflowStageResults($payload, $db);
            
            // V12.0 NEW: Verify stage persistence was successful
            case 'verify_stage_persistence':
                return verifyStageWasSaved($payload, $db);
            
            // V12.0 NEW: Get all stages for a project
            case 'get_all_project_stages':
                return getAllProjectStages($payload, $db);
                
            default:
                return ['success' => false, 'error' => 'Unknown UPP action: ' . $action];
        }
    } catch (Exception $e) {
        error_log('[UPP_HANDLER] Error: ' . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LINK FORENSICS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

function saveLinkForensics($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    $competitorId = $payload['competitor_id'] ?? '';
    
    if (empty($jobToken) || empty($domain)) {
        return ['success' => false, 'error' => 'job_token and domain required'];
    }
    
    error_log("[UPP] Saving to link_forensics: $domain");
    
    // Check if table exists, create if not
    ensureTableExists($db, 'link_forensics', "
        CREATE TABLE IF NOT EXISTS link_forensics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            domain VARCHAR(255) NOT NULL,
            competitor_id VARCHAR(255),
            url TEXT,
            title TEXT,
            meta_description TEXT,
            word_count INT DEFAULT 0,
            headings_json LONGTEXT,
            links_json LONGTEXT,
            schema_json LONGTEXT,
            raw_html_snippet MEDIUMTEXT,
            data_json LONGTEXT,
            data_size INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_job_token (job_token),
            INDEX idx_domain (domain)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $stmt = $db->prepare("
        INSERT INTO link_forensics (
            job_token, domain, competitor_id, url, title, meta_description,
            word_count, headings_json, links_json, schema_json, 
            raw_html_snippet, data_json, data_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            url = VALUES(url),
            title = VALUES(title),
            meta_description = VALUES(meta_description),
            word_count = VALUES(word_count),
            headings_json = VALUES(headings_json),
            links_json = VALUES(links_json),
            schema_json = VALUES(schema_json),
            raw_html_snippet = VALUES(raw_html_snippet),
            data_json = VALUES(data_json),
            data_size = VALUES(data_size)
    ");
    
    $stmt->execute([
        $jobToken,
        $domain,
        $competitorId,
        $payload['url'] ?? '',
        $payload['title'] ?? '',
        $payload['meta_description'] ?? '',
        $payload['word_count'] ?? 0,
        $payload['headings_json'] ?? '{}',
        $payload['links_json'] ?? '{}',
        $payload['schema_json'] ?? '[]',
        $payload['raw_html_snippet'] ?? '',
        $payload['data_json'] ?? '{}',
        $payload['data_size'] ?? 0
    ]);
    
    return [
        'success' => true,
        'table' => 'link_forensics',
        'bytes_written' => $payload['data_size'] ?? 0
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// KEYWORD INTELLIGENCE TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

function saveKeywordIntelligence($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    
    if (empty($jobToken) || empty($domain)) {
        return ['success' => false, 'error' => 'job_token and domain required'];
    }
    
    error_log("[UPP] Saving to keyword_intelligence: $domain");
    
    ensureTableExists($db, 'keyword_intelligence', "
        CREATE TABLE IF NOT EXISTS keyword_intelligence (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            domain VARCHAR(255) NOT NULL,
            competitor_id VARCHAR(255),
            total_keywords INT DEFAULT 0,
            top_10_count INT DEFAULT 0,
            top_20_count INT DEFAULT 0,
            visibility_score DECIMAL(10,2) DEFAULT 0,
            keywords_json LONGTEXT,
            clusters_json LONGTEXT,
            data_json LONGTEXT,
            data_size INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_job_token (job_token),
            INDEX idx_domain (domain)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $stmt = $db->prepare("
        INSERT INTO keyword_intelligence (
            job_token, domain, competitor_id, total_keywords, top_10_count,
            top_20_count, visibility_score, keywords_json, clusters_json,
            data_json, data_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_keywords = VALUES(total_keywords),
            top_10_count = VALUES(top_10_count),
            top_20_count = VALUES(top_20_count),
            visibility_score = VALUES(visibility_score),
            keywords_json = VALUES(keywords_json),
            clusters_json = VALUES(clusters_json),
            data_json = VALUES(data_json),
            data_size = VALUES(data_size)
    ");
    
    $stmt->execute([
        $jobToken,
        $domain,
        $payload['competitor_id'] ?? '',
        $payload['total_keywords'] ?? 0,
        $payload['top_10_count'] ?? 0,
        $payload['top_20_count'] ?? 0,
        $payload['visibility_score'] ?? 0,
        $payload['keywords_json'] ?? '[]',
        $payload['clusters_json'] ?? '[]',
        $payload['data_json'] ?? '{}',
        $payload['data_size'] ?? 0
    ]);
    
    return [
        'success' => true,
        'table' => 'keyword_intelligence',
        'bytes_written' => $payload['data_size'] ?? 0
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AI ANALYSIS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

function saveAiAnalysis($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token required'];
    }
    
    error_log("[UPP] Saving to ai_analysis: $domain");
    
    ensureTableExists($db, 'ai_analysis', "
        CREATE TABLE IF NOT EXISTS ai_analysis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            domain VARCHAR(255),
            competitor_id VARCHAR(255),
            analysis_type VARCHAR(100) DEFAULT 'gemini',
            model_used VARCHAR(100),
            prompt_tokens INT DEFAULT 0,
            response_tokens INT DEFAULT 0,
            insights_json LONGTEXT,
            opportunities_json LONGTEXT,
            recommendations_json LONGTEXT,
            data_json LONGTEXT,
            data_size INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_job_token (job_token),
            INDEX idx_domain (domain)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $stmt = $db->prepare("
        INSERT INTO ai_analysis (
            job_token, domain, competitor_id, analysis_type, model_used,
            prompt_tokens, response_tokens, insights_json, opportunities_json,
            recommendations_json, data_json, data_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $jobToken,
        $domain,
        $payload['competitor_id'] ?? '',
        $payload['analysis_type'] ?? 'gemini',
        $payload['model_used'] ?? 'gemini-2.0-flash',
        $payload['prompt_tokens'] ?? 0,
        $payload['response_tokens'] ?? 0,
        $payload['insights_json'] ?? '{}',
        $payload['opportunities_json'] ?? '[]',
        $payload['recommendations_json'] ?? '[]',
        $payload['data_json'] ?? '{}',
        $payload['data_size'] ?? 0
    ]);
    
    return [
        'success' => true,
        'table' => 'ai_analysis',
        'bytes_written' => $payload['data_size'] ?? 0
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// V12.0 ELITE: WORKFLOW STAGE RESULT PERSISTENCE - COMPLETE REWRITE
// ═══════════════════════════════════════════════════════════════════════════════════════
// CRITICAL FIX: Guaranteed persistence with explicit schema management
// - Explicit table creation/verification before any INSERT
// - Retry logic with exponential backoff (3 attempts)
// - Comprehensive diagnostic logging
// - Dual-save strategy: job_results (primary) + ai_analysis (secondary)
// - project_id used consistently across all operations
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * V12.0 Helper: Execute with retry logic
 */
function executeWithRetry($db, $sql, $params, $maxRetries = 3) {
    $lastError = null;
    for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
        try {
            $stmt = $db->prepare($sql);
            $result = $stmt->execute($params);
            if ($result) {
                return ['success' => true, 'stmt' => $stmt, 'attempt' => $attempt];
            }
            $lastError = $stmt->errorInfo();
        } catch (Exception $e) {
            $lastError = $e->getMessage();
            if ($attempt < $maxRetries) {
                // Exponential backoff: 100ms, 200ms, 400ms
                usleep(100000 * pow(2, $attempt - 1));
            }
        }
    }
    return ['success' => false, 'error' => $lastError, 'attempts' => $maxRetries];
}

/**
 * V12.0 Helper: Ensure required schema exists for workflow stages
 */
function ensureWorkflowSchema($db) {
    $schemaFixes = [];
    
    // 1. Ensure ai_analysis table has all required columns
    try {
        $existingCols = [];
        $colCheck = $db->query("SHOW COLUMNS FROM ai_analysis");
        while ($col = $colCheck->fetch(PDO::FETCH_ASSOC)) {
            $existingCols[] = strtolower($col['Field']);
        }
        
        $requiredCols = [
            'project_id' => 'VARCHAR(255)',
            'analysis_json' => 'LONGTEXT',
            'analysis_text' => 'LONGTEXT', 
            'data_size' => 'INT DEFAULT 0',
            'forensic_bridge' => 'LONGTEXT'
        ];
        
        foreach ($requiredCols as $colName => $colDef) {
            if (!in_array(strtolower($colName), $existingCols)) {
                try {
                    $db->exec("ALTER TABLE ai_analysis ADD COLUMN $colName $colDef");
                    $schemaFixes[] = "ai_analysis.$colName ADDED";
                } catch (Exception $e) {
                    // Column may already exist
                }
            }
        }
        
        // Add indexes for fast retrieval
        try {
            $db->exec("ALTER TABLE ai_analysis ADD INDEX idx_project_id (project_id)");
            $schemaFixes[] = "ai_analysis.idx_project_id ADDED";
        } catch (Exception $e) {}
        
        try {
            $db->exec("ALTER TABLE ai_analysis ADD INDEX idx_analysis_type (analysis_type)");
            $schemaFixes[] = "ai_analysis.idx_analysis_type ADDED";
        } catch (Exception $e) {}
        
    } catch (Exception $e) {
        error_log("[UPP] ai_analysis schema check error: " . $e->getMessage());
    }
    
    // 2. Ensure job_results table has project_id column
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM job_results LIKE 'project_id'");
        if ($colCheck->rowCount() === 0) {
            $db->exec("ALTER TABLE job_results ADD COLUMN project_id VARCHAR(255)");
            $schemaFixes[] = "job_results.project_id ADDED";
        }
        
        // Add index for project_id retrieval
        try {
            $db->exec("ALTER TABLE job_results ADD INDEX idx_project_id (project_id)");
            $schemaFixes[] = "job_results.idx_project_id ADDED";
        } catch (Exception $e) {}
        
        // Add composite index for stage retrieval
        try {
            $db->exec("ALTER TABLE job_results ADD INDEX idx_project_type (project_id, result_type)");
            $schemaFixes[] = "job_results.idx_project_type ADDED";
        } catch (Exception $e) {}
        
    } catch (Exception $e) {
        error_log("[UPP] job_results schema check error: " . $e->getMessage());
    }
    
    return $schemaFixes;
}

/**
 * Save workflow stage result to MySQL (CRITICAL PATH)
 * 
 * V12.0 COMPLETE REWRITE:
 * - Guaranteed persistence with retry logic
 * - Explicit schema verification before INSERT
 * - Dual-save strategy for data redundancy
 * - Comprehensive diagnostic logging
 * 
 * Column Mapping:
 *   - job_token: The anchor token (WF-XXXX format)
 *   - project_id: The project identifier (e.g., "BairesDEV")
 *   - analysis_json: The structured JSON data for charts
 *   - analysis_text: The markdown strategy report
 *   - analysis_type: WORKFLOW_STAGE_1, WORKFLOW_STAGE_2, etc.
 *   - forensic_bridge: Stage 1→2 field population data
 */
function saveWorkflowStageResult($payload, $db) {
    $startTime = microtime(true);
    
    // Extract all parameters with fallbacks
    $jobToken = $payload['job_token'] ?? '';
    $projectId = $payload['project_id'] ?? '';
    $stageNum = intval($payload['stage'] ?? 1);
    $analysisType = 'WORKFLOW_STAGE_' . $stageNum;
    
    // Content extraction with multiple fallback keys
    $analysisJson = $payload['analysis_json'] ?? $payload['json'] ?? $payload['data'] ?? '{}';
    $analysisText = $payload['analysis_text'] ?? $payload['report'] ?? $payload['text'] ?? '';
    $model = $payload['model'] ?? 'gemini-2.5-flash-preview-05-20';
    
    // Forensic Bridge for Stage 2 auto-population
    $forensicBridge = $payload['forensic_bridge'] ?? $payload['forensicBridge'] ?? null;
    if (is_string($forensicBridge) && !empty($forensicBridge)) {
        $forensicBridge = json_decode($forensicBridge, true);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // DIAGNOSTIC LOGGING - V12.0
    // ═══════════════════════════════════════════════════════════════════════════════
    error_log("[UPP] ╔═══════════════════════════════════════════════════════════════════════╗");
    error_log("[UPP] ║ 💾 STAGE PERSISTENCE V12.0 - STARTING                                 ║");
    error_log("[UPP] ╠═══════════════════════════════════════════════════════════════════════╣");
    error_log("[UPP] ║ job_token:       " . str_pad($jobToken, 50) . " ║");
    error_log("[UPP] ║ project_id:      " . str_pad($projectId, 50) . " ║");
    error_log("[UPP] ║ stage:           " . str_pad($stageNum, 50) . " ║");
    error_log("[UPP] ║ analysis_json:   " . str_pad(strlen($analysisJson) . " bytes", 50) . " ║");
    error_log("[UPP] ║ analysis_text:   " . str_pad(strlen($analysisText) . " bytes", 50) . " ║");
    error_log("[UPP] ║ forensicBridge:  " . str_pad($forensicBridge ? 'PRESENT (' . count($forensicBridge) . ' fields)' : 'NONE', 50) . " ║");
    error_log("[UPP] ╚═══════════════════════════════════════════════════════════════════════╝");
    
    // Validate required fields
    if (empty($jobToken) && empty($projectId)) {
        error_log("[UPP] ❌ VALIDATION FAILED: No job_token or project_id");
        return ['success' => false, 'error' => 'job_token or project_id required'];
    }
    
    // Ensure JSON is string format
    if (is_array($analysisJson) || is_object($analysisJson)) {
        $analysisJson = json_encode($analysisJson, JSON_UNESCAPED_UNICODE);
    }
    
    $dataSize = strlen($analysisJson) + strlen($analysisText);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // STEP 1: ENSURE SCHEMA EXISTS
    // ═══════════════════════════════════════════════════════════════════════════════
    error_log("[UPP] [Step 1] Verifying MySQL schema...");
    $schemaFixes = ensureWorkflowSchema($db);
    if (!empty($schemaFixes)) {
        error_log("[UPP] Schema updates: " . implode(', ', $schemaFixes));
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // STEP 2: SAVE TO job_results (PRIMARY - GUARANTEED TO WORK)
    // ═══════════════════════════════════════════════════════════════════════════════
    error_log("[UPP] [Step 2] Saving to job_results (PRIMARY)...");
    $savedToJobResults = false;
    $jobResultsId = null;
    
    $fullPayload = [
        'stage' => $stageNum,
        'project_id' => $projectId,
        'json' => json_decode($analysisJson, true),
        'report' => $analysisText,
        'model' => $model,
        'timestamp' => date('c'),
        'forensicBridge' => $forensicBridge,
        '_meta' => [
            'version' => 'V12.0',
            'saved_at' => date('c'),
            'data_size' => $dataSize
        ]
    ];
    
    $jobResultsResult = executeWithRetry(
        $db,
        "INSERT INTO job_results (job_token, project_id, result_type, data_json, created_at) VALUES (?, ?, ?, ?, NOW())",
        [$jobToken, $projectId, $analysisType, json_encode($fullPayload, JSON_UNESCAPED_UNICODE)]
    );
    
    if ($jobResultsResult['success']) {
        $savedToJobResults = true;
        $jobResultsId = $db->lastInsertId();
        error_log("[UPP] ✅ job_results INSERT OK (id=$jobResultsId, attempt=" . $jobResultsResult['attempt'] . ")");
    } else {
        error_log("[UPP] ⚠️ job_results INSERT FAILED after " . $jobResultsResult['attempts'] . " attempts: " . json_encode($jobResultsResult['error']));
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // STEP 3: SAVE TO ai_analysis (SECONDARY - FOR BACKWARD COMPATIBILITY)
    // ═══════════════════════════════════════════════════════════════════════════════
    error_log("[UPP] [Step 3] Saving to ai_analysis (SECONDARY)...");
    $savedToAiAnalysis = false;
    $aiAnalysisId = null;
    
    $forensicBridgeJson = $forensicBridge ? json_encode($forensicBridge, JSON_UNESCAPED_UNICODE) : null;
    
    $aiAnalysisResult = executeWithRetry(
        $db,
        "INSERT INTO ai_analysis (job_token, project_id, domain, analysis_type, model_used, analysis_json, analysis_text, forensic_bridge, data_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [$jobToken, $projectId, $projectId, $analysisType, $model, $analysisJson, $analysisText, $forensicBridgeJson, $dataSize]
    );
    
    if ($aiAnalysisResult['success']) {
        $savedToAiAnalysis = true;
        $aiAnalysisId = $db->lastInsertId();
        error_log("[UPP] ✅ ai_analysis INSERT OK (id=$aiAnalysisId, attempt=" . $aiAnalysisResult['attempt'] . ")");
    } else {
        error_log("[UPP] ⚠️ ai_analysis INSERT FAILED: " . json_encode($aiAnalysisResult['error']));
        
        // FALLBACK: Try with minimal columns if full insert failed
        error_log("[UPP] [Step 3b] Attempting minimal ai_analysis insert...");
        $fallbackResult = executeWithRetry(
            $db,
            "INSERT INTO ai_analysis (job_token, domain, analysis_type, model_used, data_json, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [$jobToken, $projectId, $analysisType, $model, $analysisJson]
        );
        
        if ($fallbackResult['success']) {
            $savedToAiAnalysis = true;
            $aiAnalysisId = $db->lastInsertId();
            error_log("[UPP] ✅ ai_analysis FALLBACK INSERT OK (id=$aiAnalysisId)");
        } else {
            error_log("[UPP] ❌ ai_analysis FALLBACK also failed: " . json_encode($fallbackResult['error']));
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // STEP 4: VERIFICATION - CONFIRM DATA WAS SAVED
    // ═══════════════════════════════════════════════════════════════════════════════
    error_log("[UPP] [Step 4] Verifying persistence...");
    $verified = false;
    
    if ($savedToJobResults) {
        try {
            $verifyStmt = $db->prepare("SELECT id, project_id, result_type FROM job_results WHERE id = ?");
            $verifyStmt->execute([$jobResultsId]);
            $verifyRow = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            if ($verifyRow) {
                $verified = true;
                error_log("[UPP] ✅ VERIFICATION OK: job_results id=$jobResultsId, project=$projectId, type=$analysisType");
            }
        } catch (Exception $e) {
            error_log("[UPP] Verification query failed: " . $e->getMessage());
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL RESULT
    // ═══════════════════════════════════════════════════════════════════════════════
    $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
    
    if ($savedToJobResults || $savedToAiAnalysis) {
        $tables = [];
        if ($savedToJobResults) $tables[] = 'job_results';
        if ($savedToAiAnalysis) $tables[] = 'ai_analysis';
        $tableStr = implode(' + ', $tables);
        
        error_log("[UPP] ╔═══════════════════════════════════════════════════════════════════════╗");
        error_log("[UPP] ║ ✅ STAGE $stageNum PERSISTENCE COMPLETE                                      ║");
        error_log("[UPP] ╠═══════════════════════════════════════════════════════════════════════╣");
        error_log("[UPP] ║ Tables:       $tableStr");
        error_log("[UPP] ║ Data size:    " . round($dataSize/1024, 2) . " KB");
        error_log("[UPP] ║ Elapsed:      {$elapsedMs}ms");
        error_log("[UPP] ║ Verified:     " . ($verified ? 'YES' : 'PENDING'));
        error_log("[UPP] ╚═══════════════════════════════════════════════════════════════════════╝");
        
        return [
            'success' => true,
            'table' => $tableStr,
            'job_token' => $jobToken,
            'project_id' => $projectId,
            'stage' => $stageNum,
            'bytes_written' => $dataSize,
            'job_results_id' => $jobResultsId,
            'ai_analysis_id' => $aiAnalysisId,
            'verified' => $verified,
            'elapsed_ms' => $elapsedMs,
            'timestamp' => date('c')
        ];
    }
    
    // CRITICAL FAILURE - Both tables failed
    error_log("[UPP] ╔═══════════════════════════════════════════════════════════════════════╗");
    error_log("[UPP] ║ ❌ STAGE $stageNum PERSISTENCE FAILED - NO DATA SAVED                        ║");
    error_log("[UPP] ╚═══════════════════════════════════════════════════════════════════════╝");
    
    return [
        'success' => false, 
        'error' => 'Failed to save to any table',
        'job_token' => $jobToken,
        'project_id' => $projectId,
        'stage' => $stageNum,
        'elapsed_ms' => $elapsedMs
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPETITOR RESULTS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

function saveCompetitorResults($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    
    if (empty($jobToken) || empty($domain)) {
        return ['success' => false, 'error' => 'job_token and domain required'];
    }
    
    error_log("[UPP] Saving to competitor_results: $domain");
    
    ensureTableExists($db, 'competitor_results', "
        CREATE TABLE IF NOT EXISTS competitor_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            domain VARCHAR(255) NOT NULL,
            competitor_id VARCHAR(255),
            domain_authority DECIMAL(10,2) DEFAULT 0,
            traffic_estimate BIGINT DEFAULT 0,
            backlink_count BIGINT DEFAULT 0,
            content_score DECIMAL(10,2) DEFAULT 0,
            technical_score DECIMAL(10,2) DEFAULT 0,
            load_time_ms INT DEFAULT 0,
            mobile_friendly BOOLEAN DEFAULT TRUE,
            https_enabled BOOLEAN DEFAULT TRUE,
            data_json LONGTEXT,
            data_size INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uk_job_domain (job_token, domain),
            INDEX idx_job_token (job_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $stmt = $db->prepare("
        INSERT INTO competitor_results (
            job_token, domain, competitor_id, domain_authority, traffic_estimate,
            backlink_count, content_score, technical_score, load_time_ms,
            mobile_friendly, https_enabled, data_json, data_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            domain_authority = VALUES(domain_authority),
            traffic_estimate = VALUES(traffic_estimate),
            backlink_count = VALUES(backlink_count),
            content_score = VALUES(content_score),
            technical_score = VALUES(technical_score),
            load_time_ms = VALUES(load_time_ms),
            mobile_friendly = VALUES(mobile_friendly),
            https_enabled = VALUES(https_enabled),
            data_json = VALUES(data_json),
            data_size = VALUES(data_size)
    ");
    
    $stmt->execute([
        $jobToken,
        $domain,
        $payload['competitor_id'] ?? '',
        $payload['domain_authority'] ?? 0,
        $payload['traffic_estimate'] ?? 0,
        $payload['backlink_count'] ?? 0,
        $payload['content_score'] ?? 0,
        $payload['technical_score'] ?? 0,
        $payload['load_time_ms'] ?? 0,
        $payload['mobile_friendly'] ?? true,
        $payload['https_enabled'] ?? true,
        $payload['data_json'] ?? '{}',
        $payload['data_size'] ?? 0
    ]);
    
    return [
        'success' => true,
        'table' => 'competitor_results',
        'bytes_written' => $payload['data_size'] ?? 0
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GRANULAR LINE ITEM SAVING
// ═══════════════════════════════════════════════════════════════════════════════════════

function saveLineItem($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $tableName = $payload['table_name'] ?? '';
    $columnName = $payload['column_name'] ?? '';
    $dataValue = $payload['data_value'] ?? '';
    
    if (empty($jobToken) || empty($tableName) || empty($columnName)) {
        return ['success' => false, 'error' => 'job_token, table_name, and column_name required'];
    }
    
    error_log("[UPP] Line item save: $tableName.$columnName");
    
    // Validate table name to prevent SQL injection
    $allowedTables = [
        'link_forensics', 'keyword_intelligence', 'ai_analysis', 
        'competitor_results', 'job_results', 'job_metrics'
    ];
    
    if (!in_array($tableName, $allowedTables)) {
        return ['success' => false, 'error' => 'Invalid table name'];
    }
    
    // Use JSON update for data_json column or direct update for known columns
    if ($columnName === 'data_json') {
        // Merge with existing data_json
        $stmt = $db->prepare("
            UPDATE $tableName 
            SET data_json = JSON_MERGE_PATCH(COALESCE(data_json, '{}'), ?)
            WHERE job_token = ?
        ");
        $stmt->execute([$dataValue, $jobToken]);
    } else {
        // Check if column exists before updating
        try {
            $stmt = $db->prepare("
                UPDATE $tableName 
                SET $columnName = ?
                WHERE job_token = ?
            ");
            $stmt->execute([$dataValue, $jobToken]);
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Column update failed: ' . $e->getMessage()];
        }
    }
    
    return [
        'success' => true,
        'table' => $tableName,
        'column' => $columnName,
        'bytes_written' => strlen($dataValue)
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INTEGRITY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════

function validateIntegrity($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    if (empty($jobToken)) {
        return ['success' => false, 'error' => 'job_token required'];
    }
    
    error_log("[UPP] Validating integrity for job: $jobToken");
    
    // Count results in job_results
    $stmt = $db->prepare("
        SELECT 
            COUNT(*) as result_count,
            SUM(data_size_bytes) as total_bytes,
            GROUP_CONCAT(DISTINCT result_type) as existing_types
        FROM job_results 
        WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    $jobResults = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Count in other tables
    $tables = [
        'link_forensics' => 0,
        'keyword_intelligence' => 0,
        'ai_analysis' => 0,
        'competitor_results' => 0
    ];
    
    foreach ($tables as $table => &$count) {
        try {
            $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM $table WHERE job_token = ?");
            $stmt->execute([$jobToken]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = (int)($result['cnt'] ?? 0);
        } catch (Exception $e) {
            // Table might not exist
            $count = 0;
        }
    }
    
    $totalRecords = (int)($jobResults['result_count'] ?? 0);
    foreach ($tables as $count) {
        $totalRecords += $count;
    }
    
    return [
        'success' => true,
        'job_token' => $jobToken,
        'result_count' => (int)($jobResults['result_count'] ?? 0),
        'total_bytes' => (int)($jobResults['total_bytes'] ?? 0),
        'existing_types' => explode(',', $jobResults['existing_types'] ?? ''),
        'table_counts' => $tables,
        'total_records' => $totalRecords
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB TOKEN RECOVERY
// ═══════════════════════════════════════════════════════════════════════════════════════

function recoverLatestJobToken($payload, $db) {
    error_log("[UPP] Recovering latest job token");
    
    $stmt = $db->prepare("
        SELECT job_token, project_id, status, created_at
        FROM job_registry 
        WHERE status IN ('RUNNING', 'COMPLETED', 'PARTIAL')
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($job) {
        return [
            'success' => true,
            'job_token' => $job['job_token'],
            'project_id' => $job['project_id'],
            'status' => $job['status'],
            'created_at' => $job['created_at']
        ];
    }
    
    return ['success' => false, 'error' => 'No active job found'];
}

/**
 * V12.0 FIX: Get workflow stage results for project recovery
 * 
 * RETRIEVAL STRATEGY ORDER (most reliable first):
 *   - Strategy 1: job_results by project_id + result_type (V12.0 primary)
 *   - Strategy 2: job_results by job_token + result_type
 *   - Strategy 3: ai_analysis by project_id
 *   - Strategy 4: ai_analysis by domain (legacy compatibility)
 *   - Strategy 5: ai_analysis by job_token
 * 
 * CRITICAL: Never fall back to global queries - prevents cross-project pollution
 */
function getWorkflowStageResults($payload, $db) {
    $startTime = microtime(true);
    $projectId = $payload['project_id'] ?? '';
    $stage = $payload['stage'] ?? null;
    $jobToken = $payload['job_token'] ?? '';
    
    error_log("[UPP] ╔═══════════════════════════════════════════════════════════════════════╗");
    error_log("[UPP] ║ 📖 STAGE RETRIEVAL V12.0 - STARTING                                   ║");
    error_log("[UPP] ╠═══════════════════════════════════════════════════════════════════════╣");
    error_log("[UPP] ║ project_id:  " . str_pad($projectId ?: '(empty)', 55) . " ║");
    error_log("[UPP] ║ stage:       " . str_pad($stage !== null ? $stage : 'ALL', 55) . " ║");
    error_log("[UPP] ║ job_token:   " . str_pad($jobToken ?: '(empty)', 55) . " ║");
    error_log("[UPP] ╚═══════════════════════════════════════════════════════════════════════╝");
    
    if (empty($projectId) && empty($jobToken)) {
        error_log("[UPP] ❌ HYDRATION FAIL: No project_id or job_token provided!");
        return ['success' => false, 'error' => 'project_id or job_token required'];
    }
    
    // Detect available columns in ai_analysis for dynamic queries
    $aiAnalysisCols = detectTableColumns($db, 'ai_analysis');
    $hasProjectIdCol = in_array('project_id', $aiAnalysisCols);
    $hasAnalysisJsonCol = in_array('analysis_json', $aiAnalysisCols);
    $hasAnalysisTextCol = in_array('analysis_text', $aiAnalysisCols);
    $hasForensicBridgeCol = in_array('forensic_bridge', $aiAnalysisCols);
    
    error_log("[UPP] ai_analysis columns: project_id=" . ($hasProjectIdCol?'Y':'N') . 
              ", analysis_json=" . ($hasAnalysisJsonCol?'Y':'N') . 
              ", analysis_text=" . ($hasAnalysisTextCol?'Y':'N') .
              ", forensic_bridge=" . ($hasForensicBridgeCol?'Y':'N'));
    
    // Build query based on whether specific stage requested
    if ($stage !== null) {
        $analysisType = 'WORKFLOW_STAGE_' . $stage;
        
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 1: job_results by project_id (V12.0 PRIMARY - MOST RELIABLE)
        // ═══════════════════════════════════════════════════════════════════════════
        if (!empty($projectId)) {
            error_log("[UPP] [Strategy 1] job_results by project_id...");
            try {
                $stmt = $db->prepare("
                    SELECT job_token, result_type, data_json, created_at
                    FROM job_results 
                    WHERE project_id = ? AND result_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$projectId, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && !empty($result['data_json'])) {
                    error_log("[UPP] ✅ Strategy 1 SUCCESS: Found in job_results by project_id");
                    return formatJobResultsStageResult($result, $stage, 'job_results_project_id');
                }
                error_log("[UPP] Strategy 1: No results found");
            } catch (Exception $e) {
                error_log("[UPP] Strategy 1 error: " . $e->getMessage());
            }
        }
        
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 2: job_results by job_token
        // ═══════════════════════════════════════════════════════════════════════════
        if (!empty($jobToken)) {
            error_log("[UPP] [Strategy 2] job_results by job_token...");
            try {
                $stmt = $db->prepare("
                    SELECT job_token, result_type, data_json, created_at
                    FROM job_results 
                    WHERE job_token = ? AND result_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$jobToken, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && !empty($result['data_json'])) {
                    error_log("[UPP] ✅ Strategy 2 SUCCESS: Found in job_results by job_token");
                    return formatJobResultsStageResult($result, $stage, 'job_results_job_token');
                }
                error_log("[UPP] Strategy 2: No results found");
            } catch (Exception $e) {
                error_log("[UPP] Strategy 2 error: " . $e->getMessage());
            }
        }
        
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 3: ai_analysis by project_id
        // ═══════════════════════════════════════════════════════════════════════════
        if ($hasProjectIdCol && !empty($projectId)) {
            error_log("[UPP] [Strategy 3] ai_analysis by project_id...");
            try {
                $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
                $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
                $bridgeCol = $hasForensicBridgeCol ? 'forensic_bridge' : "NULL as forensic_bridge";
                
                $stmt = $db->prepare("
                    SELECT job_token, analysis_type, model_used,
                           $jsonCol as analysis_json, $textCol, $bridgeCol,
                           data_json as result_json, created_at
                    FROM ai_analysis 
                    WHERE project_id = ? AND analysis_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$projectId, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && ($result['analysis_json'] || $result['result_json'])) {
                    error_log("[UPP] ✅ Strategy 3 SUCCESS: Found in ai_analysis by project_id");
                    return formatStageResult($result, $stage, 'ai_analysis_project_id');
                }
                error_log("[UPP] Strategy 3: No results found");
            } catch (Exception $e) {
                error_log("[UPP] Strategy 3 error: " . $e->getMessage());
            }
        }
        
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 4: ai_analysis by domain (legacy compatibility)
        // ═══════════════════════════════════════════════════════════════════════════
        if (!empty($projectId)) {
            error_log("[UPP] [Strategy 4] ai_analysis by domain...");
            try {
                $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
                $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
                $bridgeCol = $hasForensicBridgeCol ? 'forensic_bridge' : "NULL as forensic_bridge";
                
                $stmt = $db->prepare("
                    SELECT job_token, analysis_type, model_used,
                           $jsonCol as analysis_json, $textCol, $bridgeCol,
                           data_json as result_json, created_at
                    FROM ai_analysis 
                    WHERE domain = ? AND analysis_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$projectId, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && ($result['analysis_json'] || $result['result_json'])) {
                    error_log("[UPP] ✅ Strategy 4 SUCCESS: Found in ai_analysis by domain");
                    return formatStageResult($result, $stage, 'ai_analysis_domain');
                }
                error_log("[UPP] Strategy 4: No results found");
            } catch (Exception $e) {
                error_log("[UPP] Strategy 4 error: " . $e->getMessage());
            }
        }
        
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 5: ai_analysis by job_token
        // ═══════════════════════════════════════════════════════════════════════════
        if (!empty($jobToken)) {
            error_log("[UPP] [Strategy 5] ai_analysis by job_token...");
            try {
                $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
                $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
                $bridgeCol = $hasForensicBridgeCol ? 'forensic_bridge' : "NULL as forensic_bridge";
                
                $stmt = $db->prepare("
                    SELECT job_token, analysis_type, model_used,
                           $jsonCol as analysis_json, $textCol, $bridgeCol,
                           data_json as result_json, created_at
                    FROM ai_analysis 
                    WHERE job_token = ? AND analysis_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$jobToken, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && ($result['analysis_json'] || $result['result_json'])) {
                    error_log("[UPP] ✅ Strategy 5 SUCCESS: Found in ai_analysis by job_token");
                    return formatStageResult($result, $stage, 'ai_analysis_job_token');
                }
                error_log("[UPP] Strategy 5: No results found");
            } catch (Exception $e) {
                error_log("[UPP] Strategy 5 error: " . $e->getMessage());
            }
        }
        
        // NO GLOBAL FALLBACK - prevents cross-project data pollution
        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
        error_log("[UPP] ❌ ALL STRATEGIES EXHAUSTED: No results for stage $stage for project=$projectId (elapsed: {$elapsedMs}ms)");
        return ['success' => false, 'error' => "No results for stage $stage", 'elapsed_ms' => $elapsedMs];
    }
    
    // Get all stage results for project
    $stages = [];
    
    // Try ai_analysis first
    try {
        $stmt = $db->prepare("
            SELECT analysis_type, model_used, analysis_json, analysis_text, data_json, created_at
            FROM ai_analysis 
            WHERE (project_id = ? OR job_token = ?) 
              AND analysis_type LIKE 'WORKFLOW_STAGE_%'
            ORDER BY created_at ASC
        ");
        $stmt->execute([$projectId, $jobToken]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as $row) {
            preg_match('/WORKFLOW_STAGE_(\d+)/', $row['analysis_type'], $matches);
            $stageNum = $matches[1] ?? 0;
            $stages[$stageNum] = [
                'stage' => (int)$stageNum,
                'json' => json_decode($row['analysis_json'] ?: $row['data_json'], true),
                'report' => $row['analysis_text'] ?: '',
                'model' => $row['model_used'],
                'timestamp' => $row['created_at']
            ];
        }
    } catch (Exception $e) {
        error_log("[UPP] All stages lookup error: " . $e->getMessage());
    }
    
    return [
        'success' => true,
        'projectId' => $projectId,
        'stages' => $stages,
        'stageCount' => count($stages)
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// V12.0 HELPER FUNCTIONS FOR STAGE RESULT RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * V12.0 Helper: Detect available columns in a table
 */
function detectTableColumns($db, $tableName) {
    $columns = [];
    try {
        $stmt = $db->query("SHOW COLUMNS FROM $tableName");
        while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = strtolower($col['Field']);
        }
    } catch (Exception $e) {
        error_log("[UPP] detectTableColumns($tableName) error: " . $e->getMessage());
    }
    return $columns;
}

/**
 * V12.0: Format job_results row into standardized response format
 * job_results stores full payload in data_json column
 */
function formatJobResultsStageResult($result, $stage, $source) {
    $dataJson = $result['data_json'] ?? '{}';
    $parsedData = json_decode($dataJson, true) ?: [];
    
    // Extract nested fields from V12.0 payload structure
    $analysisJson = $parsedData['json'] ?? $parsedData;
    $analysisText = $parsedData['report'] ?? '';
    $forensicBridge = $parsedData['forensicBridge'] ?? null;
    $model = $parsedData['model'] ?? 'unknown';
    
    error_log("[UPP] formatJobResultsStageResult:");
    error_log("[UPP]    source: $source");
    error_log("[UPP]    json keys: " . (is_array($analysisJson) ? count(array_keys($analysisJson)) : 0));
    error_log("[UPP]    report length: " . strlen($analysisText) . " bytes");
    error_log("[UPP]    forensicBridge: " . ($forensicBridge ? 'PRESENT' : 'NONE'));
    
    return [
        'success' => true,
        'source' => $source,
        'stage' => (int)$stage,
        'json' => $analysisJson,
        'report' => $analysisText,
        'analysis_text' => $analysisText,
        'forensicBridge' => $forensicBridge,
        'model' => $model,
        'job_token' => $result['job_token'] ?? '',
        'timestamp' => $result['created_at'] ?? date('c')
    ];
}

/**
 * Format an ai_analysis row into standardized response format
 */
function formatStageResult($result, $stage, $source) {
    $analysisJson = $result['analysis_json'] ?? $result['result_json'] ?? '{}';
    $analysisText = $result['analysis_text'] ?? '';
    $forensicBridge = $result['forensic_bridge'] ?? null;
    
    // Parse forensicBridge if it's a JSON string
    if (is_string($forensicBridge) && !empty($forensicBridge)) {
        $forensicBridge = json_decode($forensicBridge, true);
    }
    
    error_log("[UPP] formatStageResult:");
    error_log("[UPP]    source: $source");
    error_log("[UPP]    analysis_json size: " . strlen($analysisJson) . " bytes");
    error_log("[UPP]    analysis_text size: " . strlen($analysisText) . " bytes");
    error_log("[UPP]    forensicBridge: " . ($forensicBridge ? 'PRESENT' : 'NONE'));
    
    return [
        'success' => true,
        'source' => $source,
        'stage' => (int)$stage,
        'json' => json_decode($analysisJson, true) ?: [],
        'report' => $analysisText,
        'analysis_text' => $analysisText,
        'forensicBridge' => $forensicBridge,
        'model' => $result['model_used'] ?? 'unknown',
        'job_token' => $result['job_token'] ?? '',
        'timestamp' => $result['created_at'] ?? date('c')
    ];
}

/**
 * V12.0: Legacy compatibility function - now handled by main getWorkflowStageResults
 * Kept for backward compatibility with any external callers
 */
function queryJobResultsForStage($payload, $db, $stage) {
    $projectId = $payload['project_id'] ?? '';
    $jobToken = $payload['job_token'] ?? '';
    $resultType = 'WORKFLOW_STAGE_' . $stage;
    
    error_log("[UPP] queryJobResultsForStage (legacy) called for stage=$stage, project=$projectId");
    
    // Try project_id first, then job_token
    $queries = [];
    if (!empty($projectId)) {
        $queries[] = ['sql' => "SELECT * FROM job_results WHERE project_id = ? AND result_type = ? ORDER BY created_at DESC LIMIT 1", 'params' => [$projectId, $resultType]];
    }
    if (!empty($jobToken)) {
        $queries[] = ['sql' => "SELECT * FROM job_results WHERE job_token = ? AND result_type = ? ORDER BY created_at DESC LIMIT 1", 'params' => [$jobToken, $resultType]];
    }
    
    foreach ($queries as $query) {
        try {
            $stmt = $db->prepare($query['sql']);
            $stmt->execute($query['params']);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && !empty($result['data_json'])) {
                return formatJobResultsStageResult($result, $stage, 'job_results_legacy');
            }
        } catch (Exception $e) {
            error_log("[UPP] queryJobResultsForStage query error: " . $e->getMessage());
        }
    }
    
    return ['success' => false, 'error' => 'No results for this project'];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WORKFLOW SEEDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

function countCompletedCompetitors($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT competitor_id) as count
        FROM job_results 
        WHERE job_token = ? AND result_type = 'FINAL'
    ");
    $stmt->execute([$jobToken]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return [
        'success' => true,
        'count' => (int)($result['count'] ?? 0)
    ];
}

function checkAlreadySeeded($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    // Check job_registry for seeded flag
    $stmt = $db->prepare("
        SELECT workflow_seeded_at FROM job_registry WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return [
        'success' => true,
        'already_seeded' => !empty($result['workflow_seeded_at'])
    ];
}

function getJobResultsForSeeding($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $resultTypes = $payload['result_types'] ?? ['FINAL', 'STRATEGIC_AUDIT'];
    
    $placeholders = str_repeat('?,', count($resultTypes) - 1) . '?';
    
    $stmt = $db->prepare("
        SELECT 
            result_id,
            competitor_id,
            result_type,
            data_json as data,
            created_at
        FROM job_results 
        WHERE job_token = ? AND result_type IN ($placeholders)
    ");
    
    $params = array_merge([$jobToken], $resultTypes);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Extract domain from job_metrics
    foreach ($results as &$result) {
        $stmtDomain = $db->prepare("
            SELECT competitor_domain FROM job_metrics 
            WHERE job_token = ? AND competitor_id = ?
            LIMIT 1
        ");
        $stmtDomain->execute([$jobToken, $result['competitor_id']]);
        $domainResult = $stmtDomain->fetch(PDO::FETCH_ASSOC);
        $result['domain'] = $domainResult['competitor_domain'] ?? 'unknown';
    }
    
    return [
        'success' => true,
        'results' => $results
    ];
}

function seedWorkflowLog($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $entries = $payload['entries'] ?? [];
    
    if (empty($entries)) {
        return ['success' => true, 'inserted_count' => 0];
    }
    
    // Ensure workflow_log table exists
    ensureTableExists($db, 'workflow_log', "
        CREATE TABLE IF NOT EXISTS workflow_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            step_number INT,
            step_type VARCHAR(100),
            step_status VARCHAR(50) DEFAULT 'PENDING',
            step_title TEXT,
            step_description TEXT,
            priority VARCHAR(20),
            confidence DECIMAL(5,2),
            target_domain VARCHAR(255),
            action_items_json TEXT,
            metadata_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_job_token (job_token),
            INDEX idx_step_type (step_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $insertCount = 0;
    
    foreach ($entries as $entry) {
        $stmt = $db->prepare("
            INSERT INTO workflow_log (
                job_token, step_number, step_type, step_status, step_title,
                step_description, priority, confidence, target_domain,
                action_items_json, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $entry['job_token'],
            $entry['step_number'],
            $entry['step_type'],
            $entry['step_status'],
            $entry['step_title'],
            $entry['step_description'],
            $entry['priority'],
            $entry['confidence'],
            $entry['target_domain'],
            $entry['action_items_json'],
            $entry['metadata_json']
        ]);
        
        $insertCount++;
    }
    
    return [
        'success' => true,
        'inserted_count' => $insertCount
    ];
}

function seedProjectData($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $dataType = $payload['data_type'] ?? 'PROJECT_PLAN';
    $dataJson = $payload['data_json'] ?? '{}';
    
    // Ensure project_data table exists
    ensureTableExists($db, 'project_data', "
        CREATE TABLE IF NOT EXISTS project_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(255) NOT NULL,
            data_type VARCHAR(100) NOT NULL,
            data_json LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_job_type (job_token, data_type),
            INDEX idx_job_token (job_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $stmt = $db->prepare("
        INSERT INTO project_data (job_token, data_type, data_json)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            data_json = VALUES(data_json),
            updated_at = CURRENT_TIMESTAMP
    ");
    
    $stmt->execute([$jobToken, $dataType, $dataJson]);
    
    return ['success' => true];
}

function markJobSeeded($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $seededAt = $payload['seeded_at'] ?? date('c');
    
    // Add column if not exists
    try {
        $db->exec("ALTER TABLE job_registry ADD COLUMN workflow_seeded_at DATETIME NULL");
    } catch (Exception $e) {
        // Column might already exist
    }
    
    $stmt = $db->prepare("
        UPDATE job_registry 
        SET workflow_seeded_at = ?
        WHERE job_token = ?
    ");
    $stmt->execute([$seededAt, $jobToken]);
    
    return ['success' => true];
}

function clearSeededFlag($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    $stmt = $db->prepare("
        UPDATE job_registry 
        SET workflow_seeded_at = NULL
        WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    
    return ['success' => true];
}

function clearWorkflowEntries($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    $stmt = $db->prepare("DELETE FROM workflow_log WHERE job_token = ?");
    $stmt->execute([$jobToken]);
    
    $stmt = $db->prepare("DELETE FROM project_data WHERE job_token = ?");
    $stmt->execute([$jobToken]);
    
    return ['success' => true];
}

function getWorkflowStatus($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    
    // Check seeded status
    $stmt = $db->prepare("
        SELECT workflow_seeded_at FROM job_registry WHERE job_token = ?
    ");
    $stmt->execute([$jobToken]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Count workflow_log entries
    $workflowCount = 0;
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM workflow_log WHERE job_token = ?");
        $stmt->execute([$jobToken]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $workflowCount = (int)($result['cnt'] ?? 0);
    } catch (Exception $e) {}
    
    // Check project_data exists
    $projectDataExists = false;
    try {
        $stmt = $db->prepare("SELECT 1 FROM project_data WHERE job_token = ? AND data_type = 'PROJECT_PLAN' LIMIT 1");
        $stmt->execute([$jobToken]);
        $projectDataExists = (bool)$stmt->fetch();
    } catch (Exception $e) {}
    
    return [
        'success' => true,
        'is_seeded' => !empty($job['workflow_seeded_at']),
        'seeded_at' => $job['workflow_seeded_at'] ?? null,
        'workflow_log_count' => $workflowCount,
        'project_data_exists' => $projectDataExists,
        'stage1_ready' => !empty($job['workflow_seeded_at']) && $projectDataExists
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

function ensureTableExists($db, $tableName, $createSql) {
    try {
        $stmt = $db->query("SELECT 1 FROM $tableName LIMIT 1");
    } catch (Exception $e) {
        // Table doesn't exist, create it
        $db->exec($createSql);
        error_log("[UPP] Created table: $tableName");
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DATA PRUNING FUNCTIONS (v36.0)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Count link_forensics rows to prune (dry run)
 */
function pruneLinkForensicsCount($payload, $db) {
    $retentionDays = (int)($payload['retentionDays'] ?? 30);
    
    try {
        // Count rows with raw_html that are older than retention period
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as row_count,
                SUM(LENGTH(COALESCE(raw_html, ''))) as estimated_bytes
            FROM link_forensics 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
              AND raw_html IS NOT NULL 
              AND LENGTH(raw_html) > 0
        ");
        $stmt->execute([$retentionDays]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'count' => (int)($result['row_count'] ?? 0),
            'estimatedBytes' => (int)($result['estimated_bytes'] ?? 0)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Execute link_forensics pruning (nullify raw_html, keep scores)
 */
function pruneLinkForensicsExecute($payload, $db) {
    $retentionDays = (int)($payload['retentionDays'] ?? 30);
    $batchSize = (int)($payload['batchSize'] ?? 100);
    
    try {
        // Nullify raw_html for old rows - PRESERVE all other data
        $stmt = $db->prepare("
            UPDATE link_forensics 
            SET raw_html = NULL,
                pruned_at = NOW()
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
              AND raw_html IS NOT NULL
              AND LENGTH(raw_html) > 0
            LIMIT ?
        ");
        $stmt->execute([$retentionDays, $batchSize]);
        
        $rowsAffected = $stmt->rowCount();
        
        return [
            'success' => true,
            'rowsAffected' => $rowsAffected
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Archive old job_results RAW_FETCH entries
 */
function archiveJobResults($payload, $db) {
    $retentionDays = (int)($payload['retentionDays'] ?? 60);
    $resultTypes = $payload['resultTypes'] ?? ['RAW_FETCH', 'RAW_HTML'];
    $batchSize = (int)($payload['batchSize'] ?? 100);
    
    try {
        // Ensure archive table exists
        $db->exec("
            CREATE TABLE IF NOT EXISTS job_results_archive (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_id INT,
                job_token VARCHAR(100),
                result_type VARCHAR(50),
                competitor_id VARCHAR(100),
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                summary_data TEXT,
                INDEX idx_job_token (job_token),
                INDEX idx_archived_at (archived_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        
        // Get rows to archive
        $placeholders = implode(',', array_fill(0, count($resultTypes), '?'));
        
        $stmt = $db->prepare("
            SELECT id, job_token, result_type, competitor_id, 
                   LEFT(result_data, 500) as summary,
                   LENGTH(result_data) as data_size
            FROM job_results 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
              AND result_type IN ($placeholders)
            LIMIT ?
        ");
        
        $params = array_merge([$retentionDays], $resultTypes, [$batchSize]);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $archivedCount = 0;
        $bytesFreed = 0;
        
        foreach ($rows as $row) {
            // Insert summary into archive
            $archiveStmt = $db->prepare("
                INSERT INTO job_results_archive 
                (original_id, job_token, result_type, competitor_id, summary_data)
                VALUES (?, ?, ?, ?, ?)
            ");
            $archiveStmt->execute([
                $row['id'],
                $row['job_token'],
                $row['result_type'],
                $row['competitor_id'],
                $row['summary']
            ]);
            
            // Delete from main table
            $deleteStmt = $db->prepare("DELETE FROM job_results WHERE id = ?");
            $deleteStmt->execute([$row['id']]);
            
            $archivedCount++;
            $bytesFreed += $row['data_size'];
        }
        
        return [
            'success' => true,
            'archivedCount' => $archivedCount,
            'bytesFreed' => $bytesFreed
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Truncate old API transaction responses (keep metadata)
 */
function truncateApiResponses($payload, $db) {
    $retentionDays = (int)($payload['retentionDays'] ?? 90);
    $maxResponseSize = (int)($payload['maxResponseSize'] ?? 1024);
    $batchSize = (int)($payload['batchSize'] ?? 100);
    
    try {
        // Calculate bytes to be freed
        $sizeStmt = $db->prepare("
            SELECT SUM(LENGTH(response_data) - ?) as bytes_to_free
            FROM api_transactions
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
              AND LENGTH(response_data) > ?
            LIMIT ?
        ");
        $sizeStmt->execute([$maxResponseSize, $retentionDays, $maxResponseSize, $batchSize]);
        $sizeResult = $sizeStmt->fetch(PDO::FETCH_ASSOC);
        $bytesFreed = max(0, (int)($sizeResult['bytes_to_free'] ?? 0));
        
        // Truncate response_data to first N bytes
        $stmt = $db->prepare("
            UPDATE api_transactions
            SET response_data = CONCAT(
                LEFT(response_data, ?),
                '... [TRUNCATED for storage optimization]'
            )
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
              AND LENGTH(response_data) > ?
            LIMIT ?
        ");
        $stmt->execute([$maxResponseSize, $retentionDays, $maxResponseSize, $batchSize]);
        
        return [
            'success' => true,
            'truncatedCount' => $stmt->rowCount(),
            'bytesFreed' => $bytesFreed
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Delete expired cache entries
 */
function deleteExpiredCache($payload, $db) {
    try {
        $stmt = $db->prepare("
            DELETE FROM fetcher_cache 
            WHERE expires_at < NOW()
        ");
        $stmt->execute();
        
        return [
            'success' => true,
            'deletedCount' => $stmt->rowCount()
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Get storage statistics for all tables
 */
function getStorageStats($payload, $db) {
    try {
        $tables = [
            'link_forensics', 'keyword_intelligence', 'ai_analysis',
            'competitor_results', 'job_results', 'api_transactions',
            'fetcher_cache', 'workflow_log', 'project_data', 'geo_results'
        ];
        
        $stats = [];
        $totalSize = 0;
        
        foreach ($tables as $table) {
            try {
                $stmt = $db->prepare("
                    SELECT 
                        COUNT(*) as row_count,
                        SUM(LENGTH(COALESCE(
                            CASE 
                                WHEN '$table' = 'link_forensics' THEN raw_html
                                WHEN '$table' = 'job_results' THEN result_data
                                WHEN '$table' = 'api_transactions' THEN response_data
                                ELSE ''
                            END, ''
                        ))) as data_size
                    FROM $table
                ");
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $dataSize = (int)($result['data_size'] ?? 0);
                $totalSize += $dataSize;
                
                $stats[] = [
                    'name' => $table,
                    'rowCount' => (int)($result['row_count'] ?? 0),
                    'dataSize' => $dataSize
                ];
            } catch (Exception $e) {
                // Table might not exist
                $stats[] = [
                    'name' => $table,
                    'rowCount' => 0,
                    'dataSize' => 0,
                    'error' => 'Table not found'
                ];
            }
        }
        
        return [
            'success' => true,
            'tables' => $stats,
            'totalSize' => $totalSize
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Verify audit trail integrity after pruning
 */
function verifyAuditIntegrity($payload, $db) {
    try {
        $orphanedCount = 0;
        $missingRefs = 0;
        
        // Check for competitor_results without corresponding job_results
        try {
            $stmt = $db->query("
                SELECT COUNT(*) as cnt FROM competitor_results cr
                LEFT JOIN job_results jr ON cr.job_token = jr.job_token
                WHERE jr.id IS NULL AND cr.job_token IS NOT NULL
            ");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $orphanedCount += (int)($result['cnt'] ?? 0);
        } catch (Exception $e) {}
        
        // Check for ai_analysis without job reference
        try {
            $stmt = $db->query("
                SELECT COUNT(*) as cnt FROM ai_analysis aa
                LEFT JOIN job_results jr ON aa.job_token = jr.job_token
                WHERE jr.id IS NULL AND aa.job_token IS NOT NULL
            ");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $missingRefs += (int)($result['cnt'] ?? 0);
        } catch (Exception $e) {}
        
        return [
            'success' => true,
            'orphanedCount' => $orphanedCount,
            'missingRefs' => $missingRefs,
            'integrityScore' => ($orphanedCount + $missingRefs) === 0 ? 100 : 
                               max(0, 100 - ($orphanedCount + $missingRefs))
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Save Geo/AEO results to dedicated table
 */
function saveGeoResults($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $domain = $payload['domain'] ?? '';
    $competitorId = $payload['competitor_id'] ?? '';
    
    if (empty($jobToken) || empty($domain)) {
        return ['success' => false, 'error' => 'job_token and domain required'];
    }
    
    // Ensure table exists
    ensureTableExists($db, 'geo_results', "
        CREATE TABLE IF NOT EXISTS geo_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_token VARCHAR(100) NOT NULL,
            domain VARCHAR(255) NOT NULL,
            competitor_id VARCHAR(100),
            geo_data JSON,
            aeo_data JSON,
            hreflang_tags JSON,
            target_markets JSON,
            language_coverage TEXT,
            local_seo_score INT DEFAULT 0,
            international_score INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_job_token (job_token),
            INDEX idx_domain (domain)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    try {
        $stmt = $db->prepare("
            INSERT INTO geo_results 
            (job_token, domain, competitor_id, geo_data, aeo_data, hreflang_tags, 
             target_markets, language_coverage, local_seo_score, international_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                geo_data = VALUES(geo_data),
                aeo_data = VALUES(aeo_data),
                hreflang_tags = VALUES(hreflang_tags),
                target_markets = VALUES(target_markets),
                language_coverage = VALUES(language_coverage),
                local_seo_score = VALUES(local_seo_score),
                international_score = VALUES(international_score),
                updated_at = NOW()
        ");
        
        $stmt->execute([
            $jobToken,
            $domain,
            $competitorId,
            json_encode($payload['geo_data'] ?? []),
            json_encode($payload['aeo_data'] ?? []),
            json_encode($payload['hreflang_tags'] ?? []),
            json_encode($payload['target_markets'] ?? []),
            $payload['language_coverage'] ?? '',
            (int)($payload['local_seo_score'] ?? 0),
            (int)($payload['international_score'] ?? 0)
        ]);
        
        return [
            'success' => true,
            'table' => 'geo_results',
            'domain' => $domain
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// V12.0 NEW: DATA INTEGRITY VERIFICATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * V12.0: Verify that a workflow stage was successfully saved and can be retrieved
 * Used for immediate post-save verification
 */
function verifyStageWasSaved($payload, $db) {
    $projectId = $payload['project_id'] ?? '';
    $stage = intval($payload['stage'] ?? 1);
    $jobToken = $payload['job_token'] ?? '';
    $resultType = 'WORKFLOW_STAGE_' . $stage;
    
    error_log("[UPP] 🔍 verifyStageWasSaved: project=$projectId, stage=$stage, token=$jobToken");
    
    $verification = [
        'success' => false,
        'project_id' => $projectId,
        'stage' => $stage,
        'job_results' => ['found' => false, 'row_count' => 0, 'latest_id' => null],
        'ai_analysis' => ['found' => false, 'row_count' => 0, 'latest_id' => null]
    ];
    
    // Check job_results table
    try {
        $stmt = $db->prepare("
            SELECT id, created_at, LENGTH(data_json) as data_size 
            FROM job_results 
            WHERE (project_id = ? OR job_token = ?) AND result_type = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$projectId, $jobToken, $resultType]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($results)) {
            $verification['job_results'] = [
                'found' => true,
                'row_count' => count($results),
                'latest_id' => $results[0]['id'],
                'latest_created' => $results[0]['created_at'],
                'data_size' => $results[0]['data_size']
            ];
        }
    } catch (Exception $e) {
        $verification['job_results']['error'] = $e->getMessage();
    }
    
    // Check ai_analysis table
    try {
        $stmt = $db->prepare("
            SELECT id, created_at, data_size 
            FROM ai_analysis 
            WHERE (project_id = ? OR domain = ? OR job_token = ?) AND analysis_type = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$projectId, $projectId, $jobToken, $resultType]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($results)) {
            $verification['ai_analysis'] = [
                'found' => true,
                'row_count' => count($results),
                'latest_id' => $results[0]['id'],
                'latest_created' => $results[0]['created_at'],
                'data_size' => $results[0]['data_size']
            ];
        }
    } catch (Exception $e) {
        $verification['ai_analysis']['error'] = $e->getMessage();
    }
    
    // Overall success if found in at least one table
    $verification['success'] = $verification['job_results']['found'] || $verification['ai_analysis']['found'];
    
    error_log("[UPP] 🔍 Verification result: " . ($verification['success'] ? 'PASS' : 'FAIL'));
    error_log("[UPP]    job_results: " . ($verification['job_results']['found'] ? 'FOUND' : 'NOT FOUND'));
    error_log("[UPP]    ai_analysis: " . ($verification['ai_analysis']['found'] ? 'FOUND' : 'NOT FOUND'));
    
    return $verification;
}

/**
 * V12.0: Get all workflow stages for a project
 * Returns summary of all stages with their status
 */
function getAllProjectStages($payload, $db) {
    $projectId = $payload['project_id'] ?? '';
    $jobToken = $payload['job_token'] ?? '';
    
    error_log("[UPP] 📋 getAllProjectStages: project=$projectId, token=$jobToken");
    
    if (empty($projectId) && empty($jobToken)) {
        return ['success' => false, 'error' => 'project_id or job_token required'];
    }
    
    $stages = [];
    
    // Query job_results for all workflow stages
    try {
        $stmt = $db->prepare("
            SELECT result_type, job_token, created_at, LENGTH(data_json) as data_size
            FROM job_results 
            WHERE (project_id = ? OR job_token = ?) AND result_type LIKE 'WORKFLOW_STAGE_%'
            ORDER BY result_type ASC, created_at DESC
        ");
        $stmt->execute([$projectId, $jobToken]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as $row) {
            preg_match('/WORKFLOW_STAGE_(\d+)/', $row['result_type'], $matches);
            $stageNum = $matches[1] ?? 0;
            
            if (!isset($stages[$stageNum])) {
                $stages[$stageNum] = [
                    'stage' => (int)$stageNum,
                    'source' => 'job_results',
                    'job_token' => $row['job_token'],
                    'created_at' => $row['created_at'],
                    'data_size' => (int)$row['data_size'],
                    'status' => 'COMPLETE'
                ];
            }
        }
    } catch (Exception $e) {
        error_log("[UPP] getAllProjectStages job_results error: " . $e->getMessage());
    }
    
    // Also check ai_analysis for any stages not found in job_results
    try {
        $stmt = $db->prepare("
            SELECT analysis_type, job_token, created_at, data_size
            FROM ai_analysis 
            WHERE (project_id = ? OR domain = ? OR job_token = ?) AND analysis_type LIKE 'WORKFLOW_STAGE_%'
            ORDER BY analysis_type ASC, created_at DESC
        ");
        $stmt->execute([$projectId, $projectId, $jobToken]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as $row) {
            preg_match('/WORKFLOW_STAGE_(\d+)/', $row['analysis_type'], $matches);
            $stageNum = $matches[1] ?? 0;
            
            if (!isset($stages[$stageNum])) {
                $stages[$stageNum] = [
                    'stage' => (int)$stageNum,
                    'source' => 'ai_analysis',
                    'job_token' => $row['job_token'],
                    'created_at' => $row['created_at'],
                    'data_size' => (int)$row['data_size'],
                    'status' => 'COMPLETE'
                ];
            }
        }
    } catch (Exception $e) {
        error_log("[UPP] getAllProjectStages ai_analysis error: " . $e->getMessage());
    }
    
    // Sort by stage number
    ksort($stages);
    
    return [
        'success' => true,
        'project_id' => $projectId,
        'job_token' => $jobToken,
        'stages' => array_values($stages),
        'stage_count' => count($stages),
        'highest_stage' => !empty($stages) ? max(array_keys($stages)) : 0
    ];
}

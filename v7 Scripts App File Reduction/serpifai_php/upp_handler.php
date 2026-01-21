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
            
            // V7 FIX: Elite Stage 1 Result Persistence
            case 'upp_save_workflow_stage':
                return saveWorkflowStageResult($payload, $db);
            
            // V7 FIX: Job results getter for workflow stage recovery
            case 'job_get_results':
                return getWorkflowStageResults($payload, $db);
                
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
// V7 ELITE: WORKFLOW STAGE RESULT PERSISTENCE
// Uses exact column names: job_token, analysis_json, analysis_text
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Save workflow stage result to ai_analysis table
 * Column Mapping:
 *   - job_token: The anchor token (WF-XXXX format)
 *   - analysis_json: The structured JSON data for charts
 *   - analysis_text: The markdown strategy report
 *   - analysis_type: WORKFLOW_STAGE_1, WORKFLOW_STAGE_2, etc.
 * 
 * V7.9 FIX: Complete rewrite with robust column detection and fallback strategy
 * MySQL 8.0.15 and earlier don't support ADD COLUMN IF NOT EXISTS
 */
function saveWorkflowStageResult($payload, $db) {
    $jobToken = $payload['job_token'] ?? '';
    $projectId = $payload['project_id'] ?? '';
    $stageNum = intval($payload['stage'] ?? 1);
    $analysisType = 'WORKFLOW_STAGE_' . $stageNum;
    
    // The actual content
    $analysisJson = $payload['analysis_json'] ?? $payload['json'] ?? '{}';
    $analysisText = $payload['analysis_text'] ?? $payload['report'] ?? '';
    $model = $payload['model'] ?? 'gemini-3-flash-preview';
    
    error_log("[UPP] ════════════════════════════════════════════════════════════════");
    error_log("[UPP] 💾 saveWorkflowStageResult V7.9 called");
    error_log("[UPP]    job_token: $jobToken");
    error_log("[UPP]    project_id: $projectId");
    error_log("[UPP]    stage: $stageNum");
    error_log("[UPP]    analysis_json length: " . strlen($analysisJson) . " bytes");
    error_log("[UPP]    analysis_text length: " . strlen($analysisText) . " bytes");
    error_log("[UPP] ════════════════════════════════════════════════════════════════");
    
    if (empty($jobToken) && empty($projectId)) {
        error_log("[UPP] ❌ saveWorkflowStageResult failed: No job_token or project_id");
        return ['success' => false, 'error' => 'job_token or project_id required'];
    }
    
    // Ensure it's JSON string
    if (is_array($analysisJson) || is_object($analysisJson)) {
        $analysisJson = json_encode($analysisJson);
    }
    
    $dataSize = strlen($analysisJson) + strlen($analysisText);
    $savedToAiAnalysis = false;
    $savedToJobResults = false;
    
    // V7.9 FIX: Detect existing columns BEFORE trying to add them
    $existingColumns = [];
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM ai_analysis");
        while ($col = $colCheck->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[] = strtolower($col['Field']);
        }
        error_log("[UPP] Existing ai_analysis columns: " . implode(', ', $existingColumns));
    } catch (Exception $e) {
        error_log("[UPP] Column detection failed: " . $e->getMessage());
    }
    
    // V7.9 FIX: Safe column addition (without IF NOT EXISTS for compatibility)
    $columnsToAdd = [
        'project_id' => 'VARCHAR(255)',
        'analysis_json' => 'LONGTEXT',
        'analysis_text' => 'LONGTEXT',
        'data_size' => 'INT DEFAULT 0'
    ];
    
    foreach ($columnsToAdd as $colName => $colDef) {
        if (!in_array(strtolower($colName), $existingColumns)) {
            try {
                $db->exec("ALTER TABLE ai_analysis ADD COLUMN $colName $colDef");
                error_log("[UPP] ✅ Added column: $colName");
                $existingColumns[] = strtolower($colName);
            } catch (Exception $e) {
                // Column might already exist or can't be added
                error_log("[UPP] Column $colName add note: " . $e->getMessage());
            }
        }
    }
    
    // V7.9 FIX: Build dynamic INSERT based on available columns
    $hasProjectId = in_array('project_id', $existingColumns);
    $hasAnalysisJson = in_array('analysis_json', $existingColumns);
    $hasAnalysisText = in_array('analysis_text', $existingColumns);
    $hasDataSize = in_array('data_size', $existingColumns);
    $hasDomain = in_array('domain', $existingColumns);
    
    error_log("[UPP] Column availability: project_id=$hasProjectId, analysis_json=$hasAnalysisJson, analysis_text=$hasAnalysisText, domain=$hasDomain");
    
    // V7.9: ALWAYS save to job_results FIRST (this table is guaranteed to work)
    try {
        // Check if project_id exists in job_results
        $hasJRProjectId = false;
        try {
            $colCheck = $db->query("SHOW COLUMNS FROM job_results LIKE 'project_id'");
            $hasJRProjectId = $colCheck->rowCount() > 0;
        } catch (Exception $e) {}
        
        // Try to add project_id column if it doesn't exist
        if (!$hasJRProjectId) {
            try {
                $db->exec("ALTER TABLE job_results ADD COLUMN project_id VARCHAR(255)");
                $hasJRProjectId = true;
                error_log("[UPP] Added project_id to job_results");
            } catch (Exception $e) {
                // May fail if column exists
            }
        }
        
        $fullPayload = [
            'stage' => $stageNum,
            'json' => json_decode($analysisJson, true),
            'report' => $analysisText,
            'model' => $model,
            'timestamp' => date('c')
        ];
        
        if ($hasJRProjectId) {
            $stmt = $db->prepare("
                INSERT INTO job_results (job_token, project_id, result_type, data_json, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$jobToken, $projectId, $analysisType, json_encode($fullPayload)]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO job_results (job_token, result_type, data_json, created_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$jobToken, $analysisType, json_encode($fullPayload)]);
        }
        
        $savedToJobResults = true;
        error_log("[UPP] ✅ job_results INSERT OK (primary save)");
        
    } catch (Exception $e) {
        error_log("[UPP] ❌ job_results INSERT failed: " . $e->getMessage());
    }
    
    // V7.9: Now try ai_analysis with dynamic column handling
    try {
        // Build column list and values based on what exists
        $columns = ['job_token', 'analysis_type', 'model_used', 'created_at'];
        $placeholders = ['?', '?', '?', 'NOW()'];
        $values = [$jobToken, $analysisType, $model];
        
        if ($hasProjectId) {
            $columns[] = 'project_id';
            $placeholders[] = '?';
            $values[] = $projectId;
        }
        
        // ALSO save to domain column for Strategy B compatibility
        if ($hasDomain) {
            $columns[] = 'domain';
            $placeholders[] = '?';
            $values[] = $projectId; // Use projectId as domain too
        }
        
        if ($hasAnalysisJson) {
            $columns[] = 'analysis_json';
            $placeholders[] = '?';
            $values[] = $analysisJson;
        } else {
            // Fall back to data_json if analysis_json doesn't exist
            $columns[] = 'data_json';
            $placeholders[] = '?';
            $values[] = $analysisJson;
        }
        
        if ($hasAnalysisText) {
            $columns[] = 'analysis_text';
            $placeholders[] = '?';
            $values[] = $analysisText;
        }
        
        if ($hasDataSize) {
            $columns[] = 'data_size';
            $placeholders[] = '?';
            $values[] = $dataSize;
        }
        
        $sql = "INSERT INTO ai_analysis (" . implode(', ', $columns) . ") 
                VALUES (" . implode(', ', $placeholders) . ")";
        
        error_log("[UPP] Dynamic SQL: $sql");
        error_log("[UPP] Values count: " . count($values));
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($values);
        
        if ($result) {
            $savedToAiAnalysis = true;
            error_log("[UPP] ✅ ai_analysis INSERT OK");
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("[UPP] ai_analysis INSERT failed: " . json_encode($errorInfo));
        }
        
    } catch (Exception $e) {
        error_log("[UPP] ❌ ai_analysis INSERT error: " . $e->getMessage());
    }
    
    // Return success if at least one table worked
    if ($savedToJobResults || $savedToAiAnalysis) {
        $table = ($savedToAiAnalysis && $savedToJobResults) ? 'ai_analysis + job_results' :
                 ($savedToAiAnalysis ? 'ai_analysis' : 'job_results');
        
        error_log("[UPP] ✅ Stage $stageNum saved: " . round($dataSize/1024, 2) . " KB [project=$projectId, token=$jobToken, table=$table]");
        
        return [
            'success' => true,
            'table' => $table,
            'job_token' => $jobToken,
            'project_id' => $projectId,
            'stage' => $stageNum,
            'bytes_written' => $dataSize,
            'timestamp' => date('c')
        ];
    }
    
    return ['success' => false, 'error' => 'Failed to save to any table'];
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
 * V7.8 FIX: Get workflow stage results for project recovery
 * Uses Elite column names: job_token, result_json, analysis_json, analysis_text
 * V7.8 CRITICAL FIX: Dynamic column detection + multiple fallback strategies
 *   - Strategy A: Query with project_id (if column exists)
 *   - Strategy B: Query with job_token only
 *   - Strategy C: Fallback to job_results table
 *   - Strategy D: Domain-based lookup as last resort
 */
function getWorkflowStageResults($payload, $db) {
    $projectId = $payload['project_id'] ?? '';
    $stage = $payload['stage'] ?? null;
    $jobToken = $payload['job_token'] ?? '';
    
    error_log("[UPP] ════════════════════════════════════════════════════════════════");
    error_log("[UPP] 📖 getWorkflowStageResults V7.8 called");
    error_log("[UPP]    project_id: '$projectId'");
    error_log("[UPP]    stage: " . ($stage !== null ? $stage : 'ALL'));
    error_log("[UPP]    job_token: '$jobToken'");
    error_log("[UPP] ════════════════════════════════════════════════════════════════");
    
    if (empty($projectId) && empty($jobToken)) {
        error_log("[UPP] ❌ HYDRATION FAIL: No project_id or job_token provided!");
        return ['success' => false, 'error' => 'project_id or job_token required'];
    }
    
    // V7.8 FIX: First, detect which columns exist in ai_analysis table
    $hasProjectIdCol = false;
    $hasAnalysisJsonCol = false;
    $hasAnalysisTextCol = false;
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM ai_analysis");
        $columns = $colCheck->fetchAll(PDO::FETCH_COLUMN, 0);
        $hasProjectIdCol = in_array('project_id', $columns);
        $hasAnalysisJsonCol = in_array('analysis_json', $columns);
        $hasAnalysisTextCol = in_array('analysis_text', $columns);
        error_log("[UPP] Column check: project_id=" . ($hasProjectIdCol?'YES':'NO') . 
                  ", analysis_json=" . ($hasAnalysisJsonCol?'YES':'NO') . 
                  ", analysis_text=" . ($hasAnalysisTextCol?'YES':'NO'));
    } catch (Exception $e) {
        error_log("[UPP] Column detection error: " . $e->getMessage());
    }
    
    // Build query based on whether specific stage requested
    if ($stage !== null) {
        $analysisType = 'WORKFLOW_STAGE_' . $stage;
        
        // STRATEGY A: Try ai_analysis with project_id (if column exists)
        if ($hasProjectIdCol && !empty($projectId)) {
            error_log("[UPP] Strategy A: Query ai_analysis by project_id");
            try {
                $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
                $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
                
                $stmt = $db->prepare("
                    SELECT job_token, analysis_type, model_used,
                           $jsonCol as analysis_json, $textCol, 
                           data_json as result_json, created_at
                    FROM ai_analysis 
                    WHERE project_id = ? AND analysis_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$projectId, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && ($result['analysis_json'] || $result['result_json'])) {
                    error_log("[UPP] ✅ Strategy A SUCCESS: Found in ai_analysis by project_id");
                    return formatStageResult($result, $stage, 'ai_analysis_project_id');
                }
            } catch (Exception $e) {
                error_log("[UPP] Strategy A failed: " . $e->getMessage());
            }
        }
        
        // STRATEGY B: Try ai_analysis with domain column (project_id may be stored there)
        error_log("[UPP] Strategy B: Query ai_analysis by domain");
        try {
            $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
            $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
            
            $stmt = $db->prepare("
                SELECT job_token, analysis_type, model_used,
                       $jsonCol as analysis_json, $textCol, 
                       data_json as result_json, created_at
                FROM ai_analysis 
                WHERE domain = ? AND analysis_type = ?
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$projectId, $analysisType]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && ($result['analysis_json'] || $result['result_json'])) {
                error_log("[UPP] ✅ Strategy B SUCCESS: Found in ai_analysis by domain");
                return formatStageResult($result, $stage, 'ai_analysis_domain');
            }
        } catch (Exception $e) {
            error_log("[UPP] Strategy B failed: " . $e->getMessage());
        }
        
        // STRATEGY C: Try ai_analysis by job_token only
        if (!empty($jobToken)) {
            error_log("[UPP] Strategy C: Query ai_analysis by job_token");
            try {
                $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
                $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
                
                $stmt = $db->prepare("
                    SELECT job_token, analysis_type, model_used,
                           $jsonCol as analysis_json, $textCol, 
                           data_json as result_json, created_at
                    FROM ai_analysis 
                    WHERE job_token = ? AND analysis_type = ?
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmt->execute([$jobToken, $analysisType]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && ($result['analysis_json'] || $result['result_json'])) {
                    error_log("[UPP] ✅ Strategy C SUCCESS: Found in ai_analysis by job_token");
                    return formatStageResult($result, $stage, 'ai_analysis_job_token');
                }
            } catch (Exception $e) {
                error_log("[UPP] Strategy C failed: " . $e->getMessage());
            }
        }
        
        // STRATEGY D: Try job_results table (backup table)
        error_log("[UPP] Strategy D: Query job_results table");
        $result = queryJobResultsForStage($payload, $db, $stage);
        if ($result && $result['success']) {
            error_log("[UPP] ✅ Strategy D SUCCESS: Found in job_results");
            return $result;
        }
        
        // STRATEGY E: Query ai_analysis by analysis_type only, get latest
        error_log("[UPP] Strategy E: Query ai_analysis by analysis_type only (latest)");
        try {
            $jsonCol = $hasAnalysisJsonCol ? 'analysis_json' : 'data_json';
            $textCol = $hasAnalysisTextCol ? 'analysis_text' : "'' as analysis_text";
            
            $stmt = $db->prepare("
                SELECT job_token, analysis_type, model_used,
                       $jsonCol as analysis_json, $textCol, 
                       data_json as result_json, created_at
                FROM ai_analysis 
                WHERE analysis_type = ?
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$analysisType]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && ($result['analysis_json'] || $result['result_json'])) {
                error_log("[UPP] ✅ Strategy E SUCCESS: Found in ai_analysis by analysis_type only");
                return formatStageResult($result, $stage, 'ai_analysis_latest');
            }
        } catch (Exception $e) {
            error_log("[UPP] Strategy E failed: " . $e->getMessage());
        }
        
        error_log("[UPP] ❌ ALL STRATEGIES EXHAUSTED: No results for stage $stage");
        return ['success' => false, 'error' => "No results for stage $stage"];
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
// V7.8 HELPER FUNCTIONS FOR STAGE RESULT RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Format a stage result row into standardized response format
 */
function formatStageResult($result, $stage, $source) {
    $analysisJson = $result['analysis_json'] ?? $result['result_json'] ?? '{}';
    $analysisText = $result['analysis_text'] ?? '';
    
    error_log("[UPP]    analysis_json size: " . strlen($analysisJson) . " bytes");
    error_log("[UPP]    analysis_text size: " . strlen($analysisText) . " bytes");
    
    return [
        'success' => true,
        'source' => $source,
        'stage' => (int)$stage,
        'json' => json_decode($analysisJson, true) ?: [],
        'report' => $analysisText,
        'analysis_text' => $analysisText,
        'model' => $result['model_used'] ?? 'unknown',
        'job_token' => $result['job_token'] ?? '',
        'timestamp' => $result['created_at'] ?? date('c')
    ];
}

/**
 * Query job_results table for workflow stage (backup strategy)
 * Uses multiple lookup strategies: project_id, job_token, result_type
 */
function queryJobResultsForStage($payload, $db, $stage) {
    $projectId = $payload['project_id'] ?? '';
    $jobToken = $payload['job_token'] ?? '';
    $resultType = 'WORKFLOW_STAGE_' . $stage;
    
    // Check if project_id column exists in job_results
    $hasProjectIdCol = false;
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM job_results LIKE 'project_id'");
        $hasProjectIdCol = $colCheck->rowCount() > 0;
    } catch (Exception $e) {}
    
    // Strategy D.1: Query by project_id if column exists
    if ($hasProjectIdCol && !empty($projectId)) {
        try {
            $stmt = $db->prepare("
                SELECT job_token, result_type, data_json, created_at
                FROM job_results 
                WHERE project_id = ? AND result_type = ?
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$projectId, $resultType]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $parsedData = json_decode($result['data_json'], true);
                return [
                    'success' => true,
                    'source' => 'job_results_project_id',
                    'stage' => (int)$stage,
                    'json' => $parsedData['json'] ?? $parsedData,
                    'report' => $parsedData['report'] ?? '',
                    'analysis_text' => $parsedData['report'] ?? '',
                    'job_token' => $result['job_token'],
                    'timestamp' => $result['created_at']
                ];
            }
        } catch (Exception $e) {
            error_log("[UPP] Strategy D.1 failed: " . $e->getMessage());
        }
    }
    
    // Strategy D.2: Query by job_token
    if (!empty($jobToken)) {
        try {
            $stmt = $db->prepare("
                SELECT job_token, result_type, data_json, created_at
                FROM job_results 
                WHERE job_token = ? AND result_type = ?
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$jobToken, $resultType]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $parsedData = json_decode($result['data_json'], true);
                return [
                    'success' => true,
                    'source' => 'job_results_job_token',
                    'stage' => (int)$stage,
                    'json' => $parsedData['json'] ?? $parsedData,
                    'report' => $parsedData['report'] ?? '',
                    'analysis_text' => $parsedData['report'] ?? '',
                    'job_token' => $result['job_token'],
                    'timestamp' => $result['created_at']
                ];
            }
        } catch (Exception $e) {
            error_log("[UPP] Strategy D.2 failed: " . $e->getMessage());
        }
    }
    
    // Strategy D.3: Query by result_type only (get latest)
    try {
        $stmt = $db->prepare("
            SELECT job_token, result_type, data_json, created_at
            FROM job_results 
            WHERE result_type = ?
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        $stmt->execute([$resultType]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $parsedData = json_decode($result['data_json'], true);
            return [
                'success' => true,
                'source' => 'job_results_latest',
                'stage' => (int)$stage,
                'json' => $parsedData['json'] ?? $parsedData,
                'report' => $parsedData['report'] ?? '',
                'analysis_text' => $parsedData['report'] ?? '',
                'job_token' => $result['job_token'],
                'timestamp' => $result['created_at']
            ];
        }
    } catch (Exception $e) {
        error_log("[UPP] Strategy D.3 failed: " . $e->getMessage());
    }
    
    return ['success' => false];
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

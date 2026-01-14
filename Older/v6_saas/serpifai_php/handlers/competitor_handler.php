<?php
/**
 * Competitor Analysis Handler
 * Routes competitor intelligence requests
 * Handles all 15 analysis categories
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Handle competitor analysis actions
 */
function handleCompetitorAction($action, $payload, $license, $userId) {
    error_log("🎯 handleCompetitorAction called");
    error_log("   Action: " . $action);
    
    // Extract action type
    $actionType = str_replace(['comp:', 'comp_', 'COMP_', 'ELITE_'], '', $action);
    
    switch($actionType) {
        case 'save_results':
            return saveCompetitorResults($payload, $userId);
            
        case 'load_results':
            return loadCompetitorResults($payload, $userId);
            
        case 'list_projects':
            return listCompetitorProjects($userId);
            
        case 'delete_results':
            return deleteCompetitorResults($payload, $userId);
            
        case 'orchestrate':
        case 'analyze':
        case 'elite_full':
        default:
            // Authorization only - execution happens in Apps Script
            return authorizeCompetitorAnalysis($actionType, $payload, $license, $userId);
    }
}

/**
 * Save competitor analysis results to MySQL
 */
function saveCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        $jsonData = $payload['data'] ?? '';
        $competitors = $payload['competitors'] ?? [];
        $yourDomain = $payload['yourDomain'] ?? '';
        $metadata = $payload['metadata'] ?? [];
        
        if (empty($projectId) || empty($jsonData)) {
            return [
                'success' => false,
                'error' => 'Missing projectId or data'
            ];
        }
        
        // Check if project exists
        $stmt = $db->prepare("
            SELECT id FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
        ");
        $stmt->execute([$projectId, $userId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update existing
            $stmt = $db->prepare("
                UPDATE competitor_analysis_results 
                SET 
                    analysis_data = ?,
                    competitors = ?,
                    your_domain = ?,
                    competitor_count = ?,
                    data_quality = ?,
                    api_success = ?,
                    updated_at = NOW()
                WHERE project_id = ? AND user_id = ?
            ");
            
            $stmt->execute([
                $jsonData,
                json_encode($competitors),
                $yourDomain,
                $metadata['competitorCount'] ?? count($competitors),
                $metadata['dataQuality'] ?? 'standard',
                $metadata['apiSuccess'] ?? '0/0',
                $projectId,
                $userId
            ]);
            
            $message = 'Results updated';
            $resultId = $existing['id'];
            
        } else {
            // Insert new
            $stmt = $db->prepare("
                INSERT INTO competitor_analysis_results (
                    user_id, project_id, analysis_data, competitors, 
                    your_domain, competitor_count, data_quality, 
                    api_success, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $userId,
                $projectId,
                $jsonData,
                json_encode($competitors),
                $yourDomain,
                $metadata['competitorCount'] ?? count($competitors),
                $metadata['dataQuality'] ?? 'standard',
                $metadata['apiSuccess'] ?? '0/0'
            ]);
            
            $resultId = $db->lastInsertId();
            $message = 'Results saved';
        }
        
        // Log activity
        logActivity($userId, 'competitor_results_saved', [
            'projectId' => $projectId,
            'resultId' => $resultId,
            'competitorCount' => count($competitors)
        ]);
        
        return [
            'success' => true,
            'message' => $message,
            'projectId' => $projectId,
            'resultId' => $resultId,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        error_log("saveCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Load competitor analysis results from MySQL
 */
function loadCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        
        if (empty($projectId)) {
            return [
                'success' => false,
                'error' => 'Missing projectId'
            ];
        }
        
        $stmt = $db->prepare("
            SELECT * FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
            ORDER BY updated_at DESC
            LIMIT 1
        ");
        
        $stmt->execute([$projectId, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return [
                'success' => false,
                'error' => 'Project not found: ' + $projectId
            ];
        }
        
        return [
            'success' => true,
            'data' => $result['analysis_data'],
            'metadata' => [
                'projectId' => $result['project_id'],
                'competitors' => json_decode($result['competitors'], true),
                'yourDomain' => $result['your_domain'],
                'competitorCount' => $result['competitor_count'],
                'dataQuality' => $result['data_quality'],
                'apiSuccess' => $result['api_success'],
                'createdAt' => $result['created_at'],
                'updatedAt' => $result['updated_at']
            ]
        ];
        
    } catch (Exception $e) {
        error_log("loadCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * List all competitor analysis projects for user
 */
function listCompetitorProjects($userId) {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                project_id, your_domain, competitors, 
                competitor_count, data_quality, api_success,
                created_at, updated_at
            FROM competitor_analysis_results 
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 50
        ");
        
        $stmt->execute([$userId]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode competitors JSON
        foreach ($projects as &$project) {
            $project['competitors'] = json_decode($project['competitors'], true);
        }
        
        return [
            'success' => true,
            'projects' => $projects,
            'count' => count($projects)
        ];
        
    } catch (Exception $e) {
        error_log("listCompetitorProjects error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Delete competitor analysis results
 */
function deleteCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        
        if (empty($projectId)) {
            return [
                'success' => false,
                'error' => 'Missing projectId'
            ];
        }
        
        $stmt = $db->prepare("
            DELETE FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
        ");
        
        $stmt->execute([$projectId, $userId]);
        
        return [
            'success' => true,
            'message' => 'Project deleted',
            'projectId' => $projectId
        ];
        
    } catch (Exception $e) {
        error_log("deleteCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Authorize competitor analysis (existing function)
 */
function authorizeCompetitorAnalysis($category, $payload, $licenseKey, $userId) {
    try {
        $db = getDbConnection();
        
        if (!$db) {
            error_log("❌ authorizeCompetitorAnalysis: Database connection failed");
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
    } catch (Exception $e) {
        error_log("❌ authorizeCompetitorAnalysis: DB exception - " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
    
    try {
        // Build action name
        $action = 'comp:' . $category;
        
        // Get credit cost from constants
        $creditCostsArray = CREDIT_COSTS;
        $creditCost = $creditCostsArray[$action] ?? 10; // Default 10 credits for competitor analysis
        
        error_log("📊 authorizeCompetitorAnalysis: $action ($creditCost credits)");
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->execute([$userId, $action, $creditCost, $requestJson]);
        $transactionId = $db->lastInsertId();
        
        error_log("✅ Transaction logged: #$transactionId");
        
        return [
            'success' => true,
            'message' => 'Competitor analysis authorized: ' . $category,
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'category' => $category,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        error_log("❌ authorizeCompetitorAnalysis: Transaction error - " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Authorization failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Execute full elite competitor analysis (all 15 categories)
 */
function executeEliteAnalysis($payload, $licenseKey, $userId) {
    error_log("📊 executeEliteAnalysis called (Authorization Only)");
    error_log("   Payload: " . json_encode($payload));
    error_log("   License: " . substr($licenseKey, 0, 8) . "...");
    error_log("   User ID: " . $userId);
    
    $db = getDbConnection();
    
    if (!$db) {
        error_log("❌ Database connection failed");
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'comp:elite_full';
        $creditCost = CREDIT_COSTS[$action] ?? 100;
        
        error_log("💳 Credit cost: " . $creditCost);
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->execute([$userId, $action, $creditCost, $requestJson]);
        $transactionId = $db->lastInsertId();
        
        error_log("✅ Transaction logged: #" . $transactionId);
        error_log("   Apps Script will execute full analysis with FT + APIs + Gemini");
        
        return [
            'success' => true,
            'message' => 'Elite competitor analysis authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost
        ];
        
    } catch (Exception $e) {
        error_log("❌ Elite analysis error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Elite analysis failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Get competitor analysis history
 */
function getCompetitorHistory($licenseKey, $limit = 50) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            SELECT t.*, u.license_key
            FROM api_transactions t
            JOIN users u ON t.user_id = u.id
            WHERE u.license_key = ?
            AND t.action_type LIKE 'comp:%'
            ORDER BY t.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$licenseKey, $limit]);
        $rows = $stmt->fetchAll();
        
        $history = [];
        foreach ($rows as $row) {
            $history[] = [
                'id' => $row['id'],
                'action' => $row['action_type'],
                'credits' => $row['credit_cost'],
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'completed_at' => $row['completed_at']
            ];
        }
        
        return [
            'success' => true,
            'data' => $history
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to get competitor history: ' . $e->getMessage()
        ];
    }
}

// NOTE: Removed duplicate handleCompetitorAction and saveCompetitorResults
// Main implementations are at the top of the file (lines 13-40 and 41-142)
?>



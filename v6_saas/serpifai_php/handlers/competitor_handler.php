<?php
/**
 * Competitor Analysis Handler
 * Routes competitor intelligence requests
 * Handles all 15 analysis categories
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Execute competitor analysis
 */
function executeCompetitorAnalysis($category, $payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        // Build action name
        $action = 'comp:' . $category;
        
        // Get credit cost
        $creditCost = CREDIT_COSTS[$action] ?? 10; // Default 10 credits for competitor analysis
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Competitor analysis authorized: ' . $category,
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'category' => $category,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Competitor analysis failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Execute full elite competitor analysis (all 15 categories)
 */
function executeEliteAnalysis($payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'comp:elite_full';
        $creditCost = CREDIT_COSTS[$action] ?? 100; // 100 credits for full analysis
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Elite competitor analysis authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Elite analysis failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
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
        $stmt->bind_param('si', $licenseKey, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $history = [];
        while ($row = $result->fetch_assoc()) {
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
    } finally {
        $db->close();
    }
}

/**
 * Handle competitor action routing
 */
function handleCompetitorAction($action, $payload, $licenseKey, $userId) {
    // Extract category from action
    if (preg_match('/comp:(.+)/', $action, $matches)) {
        $category = $matches[1];
        
        // Check if elite full analysis
        if ($category === 'elite_full' || $category === 'elite') {
            return executeEliteAnalysis($payload, $licenseKey, $userId);
        }
        
        // Individual category analysis
        $validCategories = [
            'market_intel',
            'brand_position',
            'technical_seo',
            'content_intel',
            'keyword_strategy',
            'content_systems',
            'conversion',
            'distribution',
            'audience_intel',
            'geo_aeo',
            'authority',
            'performance',
            'opportunity_matrix',
            'scoring'
        ];
        
        if (in_array($category, $validCategories)) {
            return executeCompetitorAnalysis($category, $payload, $licenseKey, $userId);
        }
    }
    
    // Handle control actions
    switch ($action) {
        case 'comp:history':
            return getCompetitorHistory($licenseKey, $payload['limit'] ?? 50);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown competitor action: ' . $action
            ];
    }
}

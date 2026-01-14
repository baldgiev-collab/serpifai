<?php
/**
 * Content Generation Handler
 * Routes content creation and publishing requests
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Generate article content
 */
function generateArticle($payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'content:article';
        $creditCost = CREDIT_COSTS[$action] ?? 15;
        
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
            'message' => 'Article generation authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Article generation failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Publish content to WordPress
 */
function publishToWordPress($payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'pub:wordpress';
        $creditCost = CREDIT_COSTS[$action] ?? 5;
        
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
            'message' => 'WordPress publish authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'WordPress publish failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Run QA check on content
 */
function runQACheck($payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'qa:check';
        $creditCost = CREDIT_COSTS[$action] ?? 3;
        
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
            'message' => 'QA check authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'QA check failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Run content scoring
 */
function runContentScoring($payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'qa:score';
        $creditCost = CREDIT_COSTS[$action] ?? 2;
        
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
            'message' => 'Content scoring authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Content scoring failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Handle content action routing
 */
function handleContentAction($action, $payload, $licenseKey, $userId) {
    switch ($action) {
        case 'content:article':
        case 'content:generate':
            return generateArticle($payload, $licenseKey, $userId);
            
        case 'pub:wordpress':
        case 'publish:wordpress':
            return publishToWordPress($payload, $licenseKey, $userId);
            
        case 'qa:check':
            return runQACheck($payload, $licenseKey, $userId);
            
        case 'qa:score':
            return runContentScoring($payload, $licenseKey, $userId);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown content action: ' . $action
            ];
    }
}

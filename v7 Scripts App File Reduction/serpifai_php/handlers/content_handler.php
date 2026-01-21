<?php
/**
 * Content Generation Handler
 * Routes content creation and publishing requests
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * v29.0: Helper function to log transactions with backward compatibility
 * Tries api_transactions (V6 production) first, falls back to transactions (V7)
 */
function logContentTransaction($db, $userId, $action, $creditCost, $payload, $prefix = 'CONT') {
    $transactionId = $prefix . '-' . time() . '-' . substr(md5(uniqid()), 0, 8);
    $requestJson = json_encode($payload);
    
    try {
        try {
            $stmt = $db->prepare("
                INSERT INTO api_transactions 
                (user_id, action_type, credit_cost, status, request_data)
                VALUES (?, ?, ?, 'processing', ?)
            ");
            $stmt->execute([$userId, $action, $creditCost, $requestJson]);
            $transactionId = $prefix . '-' . $db->lastInsertId();
        } catch (PDOException $e1) {
            // Fall back to transactions (V7)
            $stmt = $db->prepare("
                INSERT INTO transactions 
                (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                VALUES (?, ?, ?, ?, 'processing', ?, NOW())
            ");
            $stmt->execute([$transactionId, $userId, $action, $creditCost, $requestJson]);
        }
    } catch (PDOException $e) {
        error_log("Content transaction log failed (non-blocking): " . $e->getMessage());
    }
    
    return $transactionId;
}

/**
 * Generate article content
 */
function generateArticle($payload, $licenseKey, $userId) {
    try {
        $db = getDB();
        
        $action = 'content:article';
        $creditCost = CREDIT_COSTS[$action] ?? 15;
        
        $transactionId = logContentTransaction($db, $userId, $action, $creditCost, $payload, 'CONT');
        
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
    }
}

/**
 * Publish content to WordPress
 */
function publishToWordPress($payload, $licenseKey, $userId) {
    try {
        $db = getDB();
        
        $action = 'pub:wordpress';
        $creditCost = CREDIT_COSTS[$action] ?? 5;
        
        $transactionId = logContentTransaction($db, $userId, $action, $creditCost, $payload, 'PUB');
        
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
    }
}

/**
 * Run QA check on content
 */
function runQACheck($payload, $licenseKey, $userId) {
    try {
        $db = getDB();
        
        $action = 'qa:check';
        $creditCost = CREDIT_COSTS[$action] ?? 3;
        
        $transactionId = logContentTransaction($db, $userId, $action, $creditCost, $payload, 'QA');
        
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
    }
}

/**
 * Run content scoring
 */
function runContentScoring($payload, $licenseKey, $userId) {
    try {
        $db = getDB();
        
        $action = 'qa:score';
        $creditCost = CREDIT_COSTS[$action] ?? 2;
        
        $transactionId = logContentTransaction($db, $userId, $action, $creditCost, $payload, 'SCORE');
        
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

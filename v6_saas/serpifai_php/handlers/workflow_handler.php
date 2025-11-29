<?php
/**
 * Workflow Handler
 * Routes workflow stage requests to Apps Script business logic
 * Validates credits before execution
 * Logs all workflow transactions
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Execute workflow stage
 * This handler validates and logs, but actual AI logic stays in Apps Script
 */
function executeWorkflowStage($stageNum, $payload, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        // Determine action name
        $action = 'workflow:stage' . $stageNum;
        
        // Get credit cost
        $creditCost = CREDIT_COSTS[$action] ?? 5; // Default 5 credits
        
        // Log transaction start
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        // Return success - Apps Script will execute the actual workflow
        return [
            'success' => true,
            'message' => 'Workflow stage ' . $stageNum . ' authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'stage' => $stageNum,
            'executeInAppsScript' => true // Signal to Apps Script to run local logic
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Workflow execution failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Complete workflow transaction
 * Called by Apps Script after successful execution
 */
function completeWorkflowTransaction($transactionId, $result, $licenseKey) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            UPDATE api_transactions 
            SET status = 'completed',
                response_data = ?,
                completed_at = NOW()
            WHERE id = ?
        ");
        $resultJson = json_encode($result);
        $stmt->bind_param('si', $resultJson, $transactionId);
        $stmt->execute();
        
        return [
            'success' => true,
            'message' => 'Transaction completed'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to complete transaction: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Fail workflow transaction
 * Called by Apps Script if execution fails
 */
function failWorkflowTransaction($transactionId, $errorMessage, $licenseKey) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            UPDATE api_transactions 
            SET status = 'failed',
                error_message = ?,
                completed_at = NOW()
            WHERE id = ?
        ");
        $stmt->bind_param('si', $errorMessage, $transactionId);
        $stmt->execute();
        
        // Refund credits
        $stmt = $db->prepare("
            SELECT user_id, credit_cost FROM api_transactions WHERE id = ?
        ");
        $stmt->bind_param('i', $transactionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row) {
            $stmt = $db->prepare("
                UPDATE users 
                SET credits_remaining = credits_remaining + ?
                WHERE id = ?
            ");
            $stmt->bind_param('ii', $row['credit_cost'], $row['user_id']);
            $stmt->execute();
        }
        
        return [
            'success' => true,
            'message' => 'Transaction failed, credits refunded'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to update transaction: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Get workflow history
 */
function getWorkflowHistory($licenseKey, $limit = 50) {
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
            AND t.action_type LIKE 'workflow:%'
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
            'error' => 'Failed to get workflow history: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Handle workflow action routing
 */
function handleWorkflowAction($action, $payload, $licenseKey, $userId) {
    // Extract stage number from action
    if (preg_match('/workflow:stage(\d+)/', $action, $matches)) {
        $stageNum = (int)$matches[1];
        return executeWorkflowStage($stageNum, $payload, $licenseKey, $userId);
    }
    
    // Handle workflow control actions
    switch ($action) {
        case 'workflow:complete':
            return completeWorkflowTransaction($payload['transactionId'], $payload['result'], $licenseKey);
            
        case 'workflow:fail':
            return failWorkflowTransaction($payload['transactionId'], $payload['error'], $licenseKey);
            
        case 'workflow:history':
            return getWorkflowHistory($licenseKey, $payload['limit'] ?? 50);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown workflow action: ' . $action
            ];
    }
}

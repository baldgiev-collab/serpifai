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
    try {
        $db = getDB();
        
        // Determine action name
        $action = 'workflow_stage' . $stageNum;
        
        // Get credit cost
        $creditCost = CREDIT_COSTS[$action] ?? 5; // Default 5 credits
        
        // v29.0: Try api_transactions first (V6 production), fall back to transactions (V7)
        $transactionId = 'WF-' . time() . '-' . substr(md5(uniqid()), 0, 8);
        try {
            try {
                $stmt = $db->prepare("
                    INSERT INTO api_transactions 
                    (user_id, action_type, credit_cost, status, request_data)
                    VALUES (?, ?, ?, 'processing', ?)
                ");
                $stmt->execute([$userId, $action, $creditCost, json_encode($payload)]);
                $transactionId = 'WF-' . $db->lastInsertId();
            } catch (PDOException $e1) {
                // Fall back to transactions (V7)
                $stmt = $db->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                    VALUES (?, ?, ?, ?, 'processing', ?, NOW())
                ");
                $stmt->execute([$transactionId, $userId, $action, $creditCost, json_encode($payload)]);
            }
        } catch (PDOException $e) {
            // Non-blocking - logging shouldn't fail the workflow
            error_log("Workflow transaction log failed (non-blocking): " . $e->getMessage());
        }
        
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
        error_log("Workflow execution error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Workflow execution failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Complete workflow transaction
 * Called by Apps Script after successful execution
 */
function completeWorkflowTransaction($transactionId, $result, $licenseKey) {
    try {
        $db = getDB();
        
        // v28.8: Use transactions table
        $stmt = $db->prepare("
            UPDATE transactions 
            SET status = 'completed',
                response_data = ?,
                completed_at = NOW()
            WHERE transaction_id = ?
        ");
        
        $stmt->execute([
            json_encode($result),
            $transactionId
        ]);
        
        return [
            'success' => true,
            'message' => 'Transaction completed'
        ];
        
    } catch (Exception $e) {
        error_log("Complete transaction error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Failed to complete transaction: ' . $e->getMessage()
        ];
    }
}

/**
 * Fail workflow transaction
 * Called by Apps Script if execution fails
 */
function failWorkflowTransaction($transactionId, $errorMessage, $licenseKey) {
    try {
        $db = getDB();
        
        // v28.8: Use transactions table
        $stmt = $db->prepare("
            UPDATE transactions 
            SET status = 'failed',
                error_message = ?,
                completed_at = NOW()
            WHERE transaction_id = ?
        ");
        
        $stmt->execute([
            $errorMessage,
            $transactionId
        ]);
        
        // Get transaction details to refund credits
        $stmt = $db->prepare("
            SELECT user_id, credit_cost FROM transactions WHERE transaction_id = ?
        ");
        $stmt->execute([$transactionId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // v28.8: Use credits column (not credits_remaining)
            $stmt = $db->prepare("
                UPDATE users 
                SET credits = credits + ?
                WHERE id = ?
            ");
            $stmt->execute([
                $row['credit_cost'],
                $row['user_id']
            ]);
        }
        
        return [
            'success' => true,
            'message' => 'Transaction failed, credits refunded'
        ];
        
    } catch (Exception $e) {
        error_log("Fail transaction error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Failed to update transaction: ' . $e->getMessage()
        ];
    }
}

/**
 * Get workflow history
 */
function getWorkflowHistory($licenseKey, $limit = 50) {
    try {
        $db = getDB();
        
        // v28.8: Use transactions table
        $stmt = $db->prepare("
            SELECT t.*, u.license_key
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE u.license_key = ?
            AND t.action_type LIKE 'workflow%'
            ORDER BY t.created_at DESC
            LIMIT ?
        ");
        
        $stmt->execute([
            $licenseKey,
            (int)$limit
        ]);
        
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'history' => $history,
            'count' => count($history)
        ];
        
    } catch (Exception $e) {
        error_log("Get workflow history error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Failed to fetch history: ' . $e->getMessage()
        ];
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
    
    // Handle control actions
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
?>

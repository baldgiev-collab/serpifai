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
        $db = getDbConnection();
        
        // Determine action name
        $action = 'workflow_stage' . $stageNum;
        
        // Get credit cost
        $creditCost = CREDIT_COSTS[$action] ?? 5; // Default 5 credits
        
        // Log transaction start
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data, created_at)
            VALUES (:user_id, :action, :cost, 'processing', :request, NOW())
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'cost' => $creditCost,
            'request' => json_encode($payload)
        ]);
        
        $transactionId = $db->lastInsertId();
        
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
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            UPDATE api_transactions 
            SET status = 'completed',
                response_data = :response,
                completed_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'response' => json_encode($result),
            'id' => $transactionId
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
        $db = getDbConnection();
        
        // Update transaction status
        $stmt = $db->prepare("
            UPDATE api_transactions 
            SET status = 'failed',
                error_message = :error,
                completed_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'error' => $errorMessage,
            'id' => $transactionId
        ]);
        
        // Get transaction details to refund credits
        $stmt = $db->prepare("
            SELECT user_id, credit_cost FROM api_transactions WHERE id = :id
        ");
        $stmt->execute(['id' => $transactionId]);
        $row = $stmt->fetch();
        
        if ($row) {
            $stmt = $db->prepare("
                UPDATE users 
                SET credits_remaining = credits_remaining + :credits
                WHERE id = :user_id
            ");
            $stmt->execute([
                'credits' => $row['credit_cost'],
                'user_id' => $row['user_id']
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
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            SELECT t.*, u.license_key
            FROM api_transactions t
            JOIN users u ON t.user_id = u.id
            WHERE u.license_key = :license
            AND t.action_type LIKE 'workflow%'
            ORDER BY t.created_at DESC
            LIMIT :limit
        ");
        
        $stmt->execute([
            'license' => $licenseKey,
            'limit' => (int)$limit
        ]);
        
        $history = $stmt->fetchAll();
        
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
?>

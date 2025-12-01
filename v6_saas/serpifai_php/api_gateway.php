<?php
/**
 * SerpifAI v6 - Main API Gateway
 * All Apps Script requests route through here
 * Handles authentication, credit validation, and API proxying
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile:$errline");
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $errstr,
        'details' => ['file' => $errfile, 'line' => $errline]
    ]);
    exit;
});

set_exception_handler(function($exception) {
    error_log("Exception: " . $exception->getMessage());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $exception->getMessage()
    ]);
    exit;
});

require_once __DIR__ . '/config/db_config.php';
require_once __DIR__ . '/lib/SecurityLayer.php';

// Initialize security layer
try {
    $security = new SecurityLayer($_ENV['HMAC_SECRET'] ?? '', $_ENV['TIMESTAMP_WINDOW'] ?? 60);
} catch (Exception $e) {
    error_log("Security layer initialization error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(['success' => false, 'error' => 'Security configuration error']));
}

// CORS Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Parse request with security verification
$method = $_SERVER['REQUEST_METHOD'];
$input = null;

if ($method === 'POST') {
    try {
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput)) {
            sendError('Empty request body', 400);
        }
        
        $signedRequest = json_decode($rawInput, true);
        
        // Verify security signature and timestamp
        if (isset($signedRequest['payload'], $signedRequest['signature'], $signedRequest['timestamp'])) {
            // Request is signed - verify it
            $input = $security->verifyRequest(
                $signedRequest['payload'],
                $signedRequest['signature'],
                $signedRequest['timestamp']
            );
        } else {
            // Fallback: Accept unsigned requests (for backward compatibility)
            $input = $signedRequest;
        }
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            sendError('Invalid JSON', 400);
        }
    } catch (Exception $e) {
        error_log("Request verification error: " . $e->getMessage());
        sendError('Request verification failed: ' . $e->getMessage(), 400);
    }
} else if ($method === 'GET') {
    $input = $_GET;
}

if (!$input) {
    sendError('Invalid request', 400);
}

// Extract request parameters
$license = $input['license'] ?? '';
$action = $input['action'] ?? '';
$payload = $input['payload'] ?? [];

// User management actions don't require authentication
$userActions = ['verifyLicenseKey', 'getUserInfo', 'check_status'];
$isUserAction = in_array($action, $userActions);

// Validate required fields
if (empty($action)) {
    sendError('Missing action', 400);
}

// For user actions, license key can come from payload
if ($isUserAction && empty($license) && !empty($payload['licenseKey'])) {
    $license = $payload['licenseKey'];
}

// Check license key requirement
if (empty($license) && !$isUserAction) {
    sendError('Missing license key', 400);
}

try {
    // Handle user management actions separately (no authentication needed)
    if ($isUserAction) {
        $result = handleUserAction($action, $payload, $license);
        sendJSON($result);
    }
    
    // Authenticate user and get credits
    $user = authenticateUser($license);
    
    // Calculate credit cost
    $cost = calculateCreditCost($action, $payload);
    
    // Check if action is free
    if ($cost === 0) {
        // Free actions don't deduct credits
        $result = executeAction($action, $payload, $user, $license);
        sendJSON($result);
    }
    
    // Check credit balance
    if ($user['credits'] < $cost) {
        sendError('Insufficient credits', 402, [
            'credits_needed' => $cost,
            'credits_remaining' => $user['credits'],
            'message' => 'Please purchase a top-up or upgrade your plan'
        ]);
    }
    
    // Execute the action
    $result = executeAction($action, $payload, $user, $license);
    
    // Update credits
    $newCredits = $user['credits'] - $cost;
    updateUserCredits($license, $newCredits);
    
    // Log transaction
    logTransaction($user['id'], $action, $cost, $result);
    
    // Add credit info to response
    $result['credits'] = [
        'cost' => $cost,
        'remaining' => $newCredits,
        'used' => $user['total_credits_used'] + $cost
    ];
    
    sendJSON($result);
    
} catch (Exception $e) {
    error_log('Gateway error: ' . $e->getMessage());
    sendError($e->getMessage(), 500);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function authenticateUser($license) {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT * FROM users 
            WHERE license_key = ? AND status = 'active'
        ");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->errorInfo()[2]);
        }
        
        $stmt->execute([$license]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendError('Invalid or inactive license key', 401);
        }
        
        // Update last login
        $updateStmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        return $user;
    } catch (Exception $e) {
        error_log("authenticateUser error: " . $e->getMessage());
        sendError('Authentication failed: ' . $e->getMessage(), 500);
    }
}

function calculateCreditCost($action, $payload) {
    $costs = CREDIT_COSTS;
    
    // Map action to cost key
    $costKey = $action;
    
    // Special handling for certain actions
    if (strpos($action, 'workflow:stage') === 0 || strpos($action, 'workflow_stage') === 0) {
        // Extract stage number
        if (preg_match('/stage(\d+)/', $action, $matches)) {
            $costKey = 'workflow_stage' . $matches[1];
        }
    } else if (strpos($action, 'comp') !== false || strpos($action, 'competitor') !== false) {
        // Competitor analysis cost
        $costKey = 'competitor_analysis';
    } else if (strpos($action, 'fetcher') !== false) {
        // Fetcher cost
        if (strpos($action, 'multi') !== false) {
            $costKey = 'fetcher_multi';
        } else {
            $costKey = 'fetcher_single';
        }
    } else if (strpos($action, 'content') !== false) {
        $costKey = 'content_generate';
    }
    
    // Project management is free
    if (strpos($action, 'project') !== false) {
        return 0;
    }
    
    return $costs[$costKey] ?? 1; // Default 1 credit if not defined
}

function executeAction($action, $payload, $user, $license) {
    // Route to appropriate handler based on action
    
    // Gemini API actions
    if (strpos($action, 'gemini_') === 0 || strpos($action, 'ai_') === 0) {
        require_once __DIR__ . '/apis/gemini_api.php';
        return handleGeminiAction($action, $payload);
    }
    
    // Serper API actions
    if (strpos($action, 'serper_') === 0 || strpos($action, 'search_') === 0) {
        require_once __DIR__ . '/apis/serper_api.php';
        return handleSerperAction($action, $payload, $license);
    }
    
    // PageSpeed API actions
    if (strpos($action, 'pagespeed_') === 0 || strpos($action, 'page_speed_') === 0) {
        require_once __DIR__ . '/apis/pagespeed_api.php';
        return handlePageSpeedAction($action, $payload);
    }
    
    // OpenPageRank API actions
    if (strpos($action, 'opr_') === 0 || strpos($action, 'pagerank_') === 0 || strpos($action, 'domain_rank') !== false) {
        require_once __DIR__ . '/apis/openpagerank_api.php';
        return handleOpenPageRankAction($action, $payload);
    }
    
    // Workflow actions
    if (strpos($action, 'workflow:') === 0 || strpos($action, 'wf:') === 0) {
        require_once __DIR__ . '/handlers/workflow_handler.php';
        return handleWorkflowAction($action, $payload, $license, $user['id']);
    }
    
    // Competitor analysis actions
    if (strpos($action, 'comp_') === 0 || strpos($action, 'COMP_') === 0 || strpos($action, 'ELITE_') === 0 || strpos($action, 'competitor') !== false) {
        require_once __DIR__ . '/handlers/competitor_handler.php';
        return handleCompetitorAction($action, $payload, $license, $user['id']);
    }
    
    // User management actions (FREE)
    if (strpos($action, 'user_') === 0 || $action === 'verifyLicenseKey' || $action === 'getUserInfo' || $action === 'getCredits') {
        require_once __DIR__ . '/handlers/user_handler.php';
        return handleUserAction($action, $payload, $license);
    }
    
    // Project management actions (FREE)
    if (strpos($action, 'project_') === 0 || strpos($action, 'project:') === 0) {
        require_once __DIR__ . '/handlers/project_handler.php';
        return handleProjectAction($action, $payload, $license);
    }
    
    // Content generation actions
    if (strpos($action, 'content_') === 0 || strpos($action, 'content:') === 0) {
        require_once __DIR__ . '/handlers/content_handler.php';
        return handleContentAction($action, $payload, $license, $user['id']);
    }
    
    // Fetcher actions
    if (strpos($action, 'fetcher_') === 0 || strpos($action, 'fetch_') === 0) {
        require_once __DIR__ . '/handlers/fetcher_handler.php';
        return handleFetcherAction($action, $payload, $license, $user['id']);
    }
    
    // Check status (FREE)
    if ($action === 'check_status' || $action === 'status') {
        return [
            'success' => true,
            'user' => [
                'email' => $user['email'],
                'license_key' => $user['license_key'],
                'credits' => $user['credits'],
                'credits_total' => $user['credits'],
                'credits_used' => $user['total_credits_used'] ?? 0,
                'credits_remaining' => $user['credits'],
                'total_credits_used' => $user['total_credits_used'] ?? 0,
                'status' => $user['status'],
                'plan_type' => 'standard',
                'created_at' => $user['created_at']
            ]
        ];
    }
    
    throw new Exception('Unknown action: ' . $action);
}



function handleUserAction($action, $payload, $license) {
    require_once __DIR__ . '/handlers/user_handler.php';
    
    // Extract client IP for session tracking
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $clientIp = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    
    switch($action) {
        case 'verifyLicenseKey':
            return UserHandler::verifyLicenseKey($payload['licenseKey'] ?? $license, $clientIp);
            
        case 'getUserInfo':
            return UserHandler::getUserInfo($payload['licenseKey'] ?? $license, $clientIp);
            
        case 'getCredits':
            return UserHandler::getCredits($license);
            
        case 'check_status':
        case 'status':
            // Get user info for status check
            $user = UserHandler::getUserInfo($license, $clientIp);
            if ($user['success']) {
                return [
                    'success' => true,
                    'user' => $user['user']
                ];
            }
            return $user;
            
        case 'user_deduct_credits':
            $amount = $payload['amount'] ?? 1;
            return UserHandler::deductCredits($license, $amount);
            
        case 'user_add_credits':
            $amount = $payload['amount'] ?? 0;
            return UserHandler::addCredits($license, $amount);
            
        case 'user_has_credits':
            $required = $payload['required'] ?? 1;
            return UserHandler::hasCredits($license, $required);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown user action: ' . $action
            ];
    }
}

function updateUserCredits($license, $newCredits) {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            UPDATE users 
            SET credits = ?,
                total_credits_used = total_credits_used + (? - credits),
                updated_at = NOW() 
            WHERE license_key = ?
        ");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->errorInfo()[2]);
        }
        
        $stmt->execute([$newCredits, $newCredits, $license]);
    } catch (Exception $e) {
        error_log("updateUserCredits error: " . $e->getMessage());
        throw $e;
    }
}

function logTransaction($userId, $action, $cost, $result) {
    try {
        $db = getDB();
        $transactionId = 'TXN-' . time() . '-' . substr(md5(uniqid()), 0, 8);
        
        $stmt = $db->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, action_type, credit_cost, 
                status, request_data, response_data, created_at, completed_at
            ) VALUES (?, ?, ?, ?, 'completed', ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            $transactionId,
            $userId,
            $action,
            $cost,
            json_encode(['action' => $action]),
            json_encode($result)
        ]);
        
        logActivity($userId, $action, ['transaction_id' => $transactionId, 'cost' => $cost]);
    } catch (Exception $e) {
        error_log("Failed to log transaction: " . $e->getMessage());
    }
}

// Clean expired cache periodically (1% chance)
if (rand(1, 100) === 1) {
    try {
        $db = getDB();
        $db->exec("DELETE FROM fetcher_cache WHERE expires_at < NOW()");
    } catch (Exception $e) {
        error_log("Failed to clean cache: " . $e->getMessage());
    }
}
?>

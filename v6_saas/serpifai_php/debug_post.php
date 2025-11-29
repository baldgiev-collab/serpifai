<?php
/**
 * SerpifAI POST Request Debugger
 * Tests why POST requests return 500
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'PHP Error: ' . $errstr,
        'file' => $errfile,
        'line' => $errline,
        'type' => 'error_' . $errno
    ]);
    exit;
});

// Test 1: Can we load config?
try {
    require_once __DIR__ . '/config/db_config.php';
    $test1 = 'Config loaded ✅';
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load config: ' . $e->getMessage()
    ]);
    exit;
}

// Test 2: Can we connect to database?
try {
    $db = getDB();
    $test2 = 'Database connected ✅';
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Test 3: Can we load user handler?
try {
    require_once __DIR__ . '/handlers/user_handler.php';
    $test3 = 'User handler loaded ✅';
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load user handler: ' . $e->getMessage()
    ]);
    exit;
}

// Test 4: Parse POST input
$method = $_SERVER['REQUEST_METHOD'];
$input = null;

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_GET;
}

// Test 5: Test verifyLicenseKey
try {
    $license = 'SERP-FAI-TEST-KEY-123456';
    $result = UserHandler::verifyLicenseKey($license);
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'test1' => $test1,
        'test2' => $test2,
        'test3' => $test3,
        'method' => $method,
        'verification_result' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Verification failed: ' . $e->getMessage(),
        'test1' => $test1,
        'test2' => $test2,
        'test3' => $test3
    ]);
    exit;
}
?>

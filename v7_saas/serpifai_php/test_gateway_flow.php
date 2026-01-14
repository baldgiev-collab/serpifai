<?php
/**
 * Test API Gateway Flow
 * Mimics exact gateway execution
 * URL: https://serpifai.com/serpifai_php/test_gateway_flow.php
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Match gateway setting

// Error handler (same as gateway)
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

// Exception handler (same as gateway)
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

try {
    // Step 1: Load db_config
    require_once __DIR__ . '/config/db_config.php';
    
    // Step 2: Simulate POST data
    $testRequest = [
        'license' => 'TEST-LICENSE-123',
        'action' => 'comp:elite_full',
        'payload' => [
            'competitors' => ['example.com', 'test.com'],
            'projectContext' => ['brandName' => 'Test']
        ]
    ];
    
    $license = $testRequest['license'];
    $action = $testRequest['action'];
    $payload = $testRequest['payload'];
    
    // Step 3: Load competitor handler
    require_once __DIR__ . '/handlers/competitor_handler.php';
    
    // Step 4: Call handler
    $result = handleCompetitorAction($action, $payload, $license, 1);
    
    // Step 5: Return result
    echo json_encode([
        'test' => 'gateway_flow',
        'success' => true,
        'handler_result' => $result
    ], JSON_PRETTY_PRINT);
    
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>

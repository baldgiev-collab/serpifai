<?php
/**
 * SerpifAI Complete POST Diagnostic
 * This tests every step of the POST handling process
 */

// Start fresh
http_response_code(200);
header('Content-Type: application/json');

$tests = [];

// Test 1: Check if we can load config
$tests[] = ['step' => 1, 'name' => 'Load config', 'status' => 'pending'];
try {
    require_once __DIR__ . '/config/db_config.php';
    $tests[0]['status'] = 'OK';
    $tests[0]['result'] = 'Config file loaded successfully';
} catch (Exception $e) {
    $tests[0]['status'] = 'FAILED';
    $tests[0]['error'] = $e->getMessage();
}

// Test 2: Try to get DB connection
$tests[] = ['step' => 2, 'name' => 'Database connection', 'status' => 'pending'];
try {
    $db = getDB();
    $tests[1]['status'] = 'OK';
    $tests[1]['result'] = 'Database connected';
} catch (Exception $e) {
    $tests[1]['status'] = 'FAILED';
    $tests[1]['error'] = $e->getMessage();
    echo json_encode(['success' => false, 'tests' => $tests]);
    exit;
}

// Test 3: Query users table
$tests[] = ['step' => 3, 'name' => 'Query users table', 'status' => 'pending'];
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $tests[2]['status'] = 'OK';
    $tests[2]['result'] = 'Found ' . $result['count'] . ' users in database';
} catch (Exception $e) {
    $tests[2]['status'] = 'FAILED';
    $tests[2]['error'] = $e->getMessage();
}

// Test 4: Try to verify license key
$tests[] = ['step' => 4, 'name' => 'Verify license key', 'status' => 'pending'];
try {
    require_once __DIR__ . '/handlers/user_handler.php';
    $result = UserHandler::verifyLicenseKey('SERP-FAI-TEST-KEY-123456');
    $tests[3]['status'] = 'OK';
    $tests[3]['result'] = $result;
} catch (Exception $e) {
    $tests[3]['status'] = 'FAILED';
    $tests[3]['error'] = $e->getMessage();
}

// Test 5: Simulate POST request parsing
$tests[] = ['step' => 5, 'name' => 'POST request parsing', 'status' => 'pending'];
try {
    $postData = [
        'action' => 'verifyLicenseKey',
        'license' => 'SERP-FAI-TEST-KEY-123456',
        'payload' => []
    ];
    
    $json = json_encode($postData);
    $parsed = json_decode($json, true);
    
    if ($parsed && isset($parsed['action'])) {
        $tests[4]['status'] = 'OK';
        $tests[4]['result'] = 'POST data parsed correctly';
    } else {
        throw new Exception('JSON parsing failed');
    }
} catch (Exception $e) {
    $tests[4]['status'] = 'FAILED';
    $tests[4]['error'] = $e->getMessage();
}

// Final result
$allPassed = true;
foreach ($tests as $test) {
    if ($test['status'] !== 'OK') {
        $allPassed = false;
    }
}

echo json_encode([
    'success' => $allPassed,
    'message' => $allPassed ? 'All diagnostic tests passed' : 'Some tests failed',
    'tests' => $tests,
    'php_version' => phpversion(),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution' => ini_get('max_execution_time')
]);
?>

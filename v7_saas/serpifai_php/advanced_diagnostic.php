<?php
/**
 * Advanced Diagnostic - Check each component step by step
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$result = ['tests' => [], 'timestamp' => date('Y-m-d H:i:s')];

// Test 1: Config loading
$result['tests'][] = ['name' => 'Load db_config.php', 'status' => 'pending'];
try {
    require_once __DIR__ . '/config/db_config.php';
    $result['tests'][0]['status'] = 'OK';
    $result['tests'][0]['result'] = 'Config loaded successfully';
} catch (Exception $e) {
    $result['tests'][0]['status'] = 'FAILED';
    $result['tests'][0]['error'] = $e->getMessage();
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

// Test 2: Database connection via getDB()
$result['tests'][] = ['name' => 'Database connection (getDB)', 'status' => 'pending'];
try {
    $db = getDB();
    $result['tests'][1]['status'] = 'OK';
    $result['tests'][1]['result'] = 'Connected via getDB()';
} catch (Exception $e) {
    $result['tests'][1]['status'] = 'FAILED';
    $result['tests'][1]['error'] = $e->getMessage();
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

// Test 3: Query users table
$result['tests'][] = ['name' => 'Query users table', 'status' => 'pending'];
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    $result['tests'][2]['status'] = 'OK';
    $result['tests'][2]['result'] = 'Found ' . $count['count'] . ' users';
} catch (Exception $e) {
    $result['tests'][2]['status'] = 'FAILED';
    $result['tests'][2]['error'] = $e->getMessage();
}

// Test 4: Load UserHandler
$result['tests'][] = ['name' => 'Load user_handler.php', 'status' => 'pending'];
try {
    require_once __DIR__ . '/handlers/user_handler.php';
    $result['tests'][3]['status'] = 'OK';
    $result['tests'][3]['result'] = 'UserHandler class loaded';
} catch (Exception $e) {
    $result['tests'][3]['status'] = 'FAILED';
    $result['tests'][3]['error'] = $e->getMessage();
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

// Test 5: Verify license key
$result['tests'][] = ['name' => 'Verify test license key', 'status' => 'pending'];
try {
    $verifyResult = UserHandler::verifyLicenseKey('SERP-FAI-TEST-KEY-123456');
    $result['tests'][4]['status'] = $verifyResult['success'] ? 'OK' : 'FAILED';
    $result['tests'][4]['result'] = $verifyResult;
} catch (Exception $e) {
    $result['tests'][4]['status'] = 'FAILED';
    $result['tests'][4]['error'] = $e->getMessage();
}

// Test 6: Load SecurityLayer
$result['tests'][] = ['name' => 'Load SecurityLayer.php', 'status' => 'pending'];
try {
    require_once __DIR__ . '/lib/SecurityLayer.php';
    $result['tests'][5]['status'] = 'OK';
    $result['tests'][5]['result'] = 'SecurityLayer class loaded';
} catch (Exception $e) {
    $result['tests'][5]['status'] = 'FAILED';
    $result['tests'][5]['error'] = $e->getMessage();
}

// Test 7: Initialize SecurityLayer
$result['tests'][] = ['name' => 'Initialize SecurityLayer', 'status' => 'pending'];
try {
    $security = new SecurityLayer($_ENV['HMAC_SECRET'] ?? '', $_ENV['TIMESTAMP_WINDOW'] ?? 60);
    $result['tests'][6]['status'] = 'OK';
    $result['tests'][6]['result'] = 'SecurityLayer initialized';
} catch (Exception $e) {
    $result['tests'][6]['status'] = 'FAILED';
    $result['tests'][6]['error'] = $e->getMessage();
}

// Test 8: Check API gateway file exists
$result['tests'][] = ['name' => 'Check api_gateway.php exists', 'status' => 'pending'];
try {
    $gatewayPath = __DIR__ . '/api_gateway.php';
    if (file_exists($gatewayPath)) {
        $result['tests'][7]['status'] = 'OK';
        $result['tests'][7]['result'] = 'API gateway file exists';
    } else {
        throw new Exception('api_gateway.php not found');
    }
} catch (Exception $e) {
    $result['tests'][7]['status'] = 'FAILED';
    $result['tests'][7]['error'] = $e->getMessage();
}

// Calculate summary
$passed = 0;
$total = count($result['tests']);
foreach ($result['tests'] as $test) {
    if ($test['status'] === 'OK') $passed++;
}

$result['summary'] = [
    'passed' => $passed,
    'total' => $total,
    'success' => $passed === $total,
    'message' => $passed === $total ? 'All components working!' : 'Some components failed'
];

echo json_encode($result, JSON_PRETTY_PRINT);
?>
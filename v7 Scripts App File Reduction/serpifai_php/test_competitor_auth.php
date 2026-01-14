<?php
/**
 * Test Competitor Authorization Directly
 * URL: https://serpifai.com/serpifai_php/test_competitor_auth.php
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '1');

try {
    // Load dependencies
    require_once __DIR__ . '/config/db_config.php';
    require_once __DIR__ . '/handlers/competitor_handler.php';
    
    // Test data
    $testPayload = [
        'competitors' => ['example.com', 'competitor.com'],
        'yourDomain' => 'test.com'
    ];
    
    $testLicense = 'TEST-LICENSE-KEY';
    $testUserId = 1;
    
    echo json_encode([
        'test' => 'competitor_auth',
        'step1' => 'Files loaded successfully',
        'step2' => 'Testing authorizeCompetitorAnalysis...'
    ]);
    
    // Call the function
    $result = authorizeCompetitorAnalysis('elite_full', $testPayload, $testLicense, $testUserId);
    
    echo json_encode([
        'success' => true,
        'result' => $result,
        'php_version' => PHP_VERSION
    ], JSON_PRETTY_PRINT);
    
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => array_slice($e->getTrace(), 0, 3)
    ], JSON_PRETTY_PRINT);
}
?>

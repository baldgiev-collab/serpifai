<?php
/**
 * Forbidden Error Diagnostic Test
 * URL: https://serpifai.com/serpifai_php/test_forbidden.php
 * 
 * This file tests if PHP execution works at all
 * If this returns "Forbidden", the issue is server-level blocking
 */

// Force JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'PHP is executing successfully!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => [
        'php_version' => PHP_VERSION,
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]
], JSON_PRETTY_PRINT);

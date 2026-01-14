<?php
/**
 * test_direct.php
 * Simple test endpoint to verify server accepts POST requests
 * Use this to isolate whether issue is server config or gateway code
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request details
$method = $_SERVER['REQUEST_METHOD'];
$contentType = $_SERVER['CONTENT_TYPE'] ?? 'not set';
$contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
$remoteIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Get raw input
$rawInput = file_get_contents('php://input');
$inputLength = strlen($rawInput);

// Try to parse JSON
$decoded = json_decode($rawInput, true);
$jsonValid = json_last_error() === JSON_ERROR_NONE;

// Build response
$response = [
    'success' => true,
    'message' => 'Direct test endpoint working',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'method' => $method,
        'content_type' => $contentType,
        'content_length' => $contentLength,
        'remote_ip' => $remoteIp
    ],
    'request_data' => [
        'raw_length' => $inputLength,
        'json_valid' => $jsonValid,
        'decoded' => $decoded,
        'raw_preview' => substr($rawInput, 0, 200)
    ],
    'php_limits' => [
        'post_max_size' => ini_get('post_max_size'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'max_execution_time' => ini_get('max_execution_time'),
        'memory_limit' => ini_get('memory_limit')
    ]
];

// Log to error log
error_log("=== Test Direct Endpoint Called ===");
error_log("Method: $method");
error_log("Content-Length: $contentLength");
error_log("Input Length: $inputLength");
error_log("JSON Valid: " . ($jsonValid ? 'Yes' : 'No'));

// Return response
echo json_encode($response, JSON_PRETTY_PRINT);

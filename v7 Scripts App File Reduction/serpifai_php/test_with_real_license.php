<?php
/**
 * Test Gateway with Valid License
 * REPLACE 'YOUR-LICENSE-KEY-HERE' with actual key from test_check_users.php
 * URL: https://serpifai.com/serpifai_php/test_with_real_license.php?key=YOUR-KEY
 */

$licenseKey = $_GET['key'] ?? 'NO-KEY-PROVIDED';

// Simulate POST request to api_gateway.php
$gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';

$requestData = [
    'license' => $licenseKey,
    'action' => 'comp:elite_full',
    'payload' => [
        'competitors' => ['example.com', 'test.com'],
        'projectContext' => ['brandName' => 'Test'],
        'spreadsheetId' => null
    ]
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                    "Accept: application/json\r\n",
        'content' => json_encode($requestData),
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($gatewayUrl, false, $context);

// Get response headers
$headers = [];
if (isset($http_response_header)) {
    $headers = $http_response_header;
}

// Parse response
$responseJson = json_decode($response, true);

// Output diagnostic
header('Content-Type: application/json');
echo json_encode([
    'test' => 'gateway_with_real_license',
    'license_key_used' => substr($licenseKey, 0, 8) . '...',
    'response_code' => (isset($headers[0]) ? $headers[0] : 'unknown'),
    'response_length' => strlen($response),
    'response_parsed' => $responseJson,
    'response_raw' => $response
], JSON_PRETTY_PRINT);
?>

<?php
/**
 * Test Real Gateway with POST Request
 * Mimics exactly what Apps Script sends
 * URL: https://serpifai.com/serpifai_php/test_real_gateway.php
 */

// Simulate POST request to api_gateway.php
$gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';

$requestData = [
    'license' => 'TEST-LICENSE-123',
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

// Output diagnostic
header('Content-Type: application/json');
echo json_encode([
    'test' => 'real_gateway_post',
    'request' => $requestData,
    'response_length' => strlen($response),
    'response_headers' => $headers,
    'response_body' => $response,
    'response_first_100' => substr($response, 0, 100),
    'response_last_100' => substr($response, -100)
], JSON_PRETTY_PRINT);
?>

<?php
/**
 * API Gateway Test Endpoint
 * This simulates a proper request to the API gateway
 */

// Test the API gateway with a proper request
$testLicenseKey = 'SERP-FAI-TEST-KEY-123456';

$testRequests = [
    [
        'name' => 'Test 1: Verify License Key',
        'payload' => [
            'action' => 'verifyLicenseKey',
            'license' => $testLicenseKey,
            'payload' => ['licenseKey' => $testLicenseKey]
        ]
    ],
    [
        'name' => 'Test 2: Get User Info',
        'payload' => [
            'action' => 'getUserInfo',
            'license' => $testLicenseKey,
            'payload' => []
        ]
    ],
    [
        'name' => 'Test 3: Check Status',
        'payload' => [
            'action' => 'check_status',
            'license' => $testLicenseKey,
            'payload' => []
        ]
    ]
];

$results = [];

foreach ($testRequests as $test) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://serpifai.com/serpifai_php/api_gateway.php');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test['payload']));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $results[] = [
        'test' => $test['name'],
        'http_code' => $httpCode,
        'response' => json_decode($response, true),
        'error' => $error ?: null
    ];
}

header('Content-Type: application/json');
echo json_encode([
    'timestamp' => date('Y-m-d H:i:s'),
    'results' => $results
], JSON_PRETTY_PRINT);
?>
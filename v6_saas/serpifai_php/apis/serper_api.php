<?php
/**
 * Serper API Handler
 * Proxies all Serper.dev API calls with server-side key
 * Handles search, images, news, places, etc.
 */

require_once __DIR__ . '/../config.php';

/**
 * Call Serper API
 */
function callSerperAPI($endpoint, $params, $licenseKey) {
    $apiKey = SERPER_API_KEY;
    
    if (!$apiKey) {
        return [
            'success' => false,
            'error' => 'Serper API key not configured'
        ];
    }
    
    // Build Serper API URL
    $url = 'https://google.serper.dev/' . $endpoint;
    
    // Prepare request
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-KEY: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        
        return [
            'success' => false,
            'error' => 'Serper API request failed: ' . $error
        ];
    }
    
    curl_close($ch);
    
    // Parse response
    $result = json_decode($response, true);
    
    if ($httpCode !== 200) {
        return [
            'success' => false,
            'error' => 'Serper API error: ' . ($result['message'] ?? 'Unknown error'),
            'httpCode' => $httpCode
        ];
    }
    
    return [
        'success' => true,
        'data' => $result
    ];
}

/**
 * Serper Search (main search endpoint)
 */
function serperSearch($query, $params, $licenseKey) {
    // Check cache first
    $cacheKey = 'serper_search_' . md5($query . json_encode($params));
    $cached = getCacheValue($cacheKey);
    
    if ($cached) {
        return [
            'success' => true,
            'data' => json_decode($cached, true),
            'cached' => true
        ];
    }
    
    // Build search params
    $searchParams = array_merge([
        'q' => $query,
        'gl' => $params['gl'] ?? 'us',
        'hl' => $params['hl'] ?? 'en',
        'num' => $params['num'] ?? 10
    ], $params);
    
    // Call Serper
    $result = callSerperAPI('search', $searchParams, $licenseKey);
    
    // Cache successful results
    if ($result['success']) {
        setCacheValue($cacheKey, json_encode($result['data']), 3600); // 1 hour cache
    }
    
    return $result;
}

/**
 * Serper Images
 */
function serperImages($query, $params, $licenseKey) {
    $cacheKey = 'serper_images_' . md5($query . json_encode($params));
    $cached = getCacheValue($cacheKey);
    
    if ($cached) {
        return [
            'success' => true,
            'data' => json_decode($cached, true),
            'cached' => true
        ];
    }
    
    $searchParams = array_merge([
        'q' => $query,
        'gl' => $params['gl'] ?? 'us',
        'num' => $params['num'] ?? 10
    ], $params);
    
    $result = callSerperAPI('images', $searchParams, $licenseKey);
    
    if ($result['success']) {
        setCacheValue($cacheKey, json_encode($result['data']), 7200); // 2 hour cache
    }
    
    return $result;
}

/**
 * Serper News
 */
function serperNews($query, $params, $licenseKey) {
    $cacheKey = 'serper_news_' . md5($query . json_encode($params));
    $cached = getCacheValue($cacheKey);
    
    if ($cached) {
        return [
            'success' => true,
            'data' => json_decode($cached, true),
            'cached' => true
        ];
    }
    
    $searchParams = array_merge([
        'q' => $query,
        'gl' => $params['gl'] ?? 'us',
        'num' => $params['num'] ?? 10
    ], $params);
    
    $result = callSerperAPI('news', $searchParams, $licenseKey);
    
    if ($result['success']) {
        setCacheValue($cacheKey, json_encode($result['data']), 1800); // 30 min cache (news changes fast)
    }
    
    return $result;
}

/**
 * Serper Places
 */
function serperPlaces($query, $params, $licenseKey) {
    $cacheKey = 'serper_places_' . md5($query . json_encode($params));
    $cached = getCacheValue($cacheKey);
    
    if ($cached) {
        return [
            'success' => true,
            'data' => json_decode($cached, true),
            'cached' => true
        ];
    }
    
    $searchParams = array_merge([
        'q' => $query,
        'gl' => $params['gl'] ?? 'us',
        'num' => $params['num'] ?? 10
    ], $params);
    
    $result = callSerperAPI('places', $searchParams, $licenseKey);
    
    if ($result['success']) {
        setCacheValue($cacheKey, json_encode($result['data']), 3600); // 1 hour cache
    }
    
    return $result;
}

/**
 * Serper Shopping
 */
function serperShopping($query, $params, $licenseKey) {
    $searchParams = array_merge([
        'q' => $query,
        'gl' => $params['gl'] ?? 'us',
        'num' => $params['num'] ?? 10
    ], $params);
    
    return callSerperAPI('shopping', $searchParams, $licenseKey);
}

/**
 * Batch Serper Search (multiple queries)
 */
function serperBatchSearch($queries, $params, $licenseKey) {
    $results = [];
    
    foreach ($queries as $query) {
        $results[$query] = serperSearch($query, $params, $licenseKey);
    }
    
    return [
        'success' => true,
        'data' => $results
    ];
}

/**
 * Handle Serper action routing
 */
function handleSerperAction($action, $payload, $licenseKey) {
    switch ($action) {
        case 'serper_search':
            return serperSearch($payload['query'], $payload['params'] ?? [], $licenseKey);
            
        case 'serper_images':
            return serperImages($payload['query'], $payload['params'] ?? [], $licenseKey);
            
        case 'serper_news':
            return serperNews($payload['query'], $payload['params'] ?? [], $licenseKey);
            
        case 'serper_places':
            return serperPlaces($payload['query'], $payload['params'] ?? [], $licenseKey);
            
        case 'serper_shopping':
            return serperShopping($payload['query'], $payload['params'] ?? [], $licenseKey);
            
        case 'serper_batch':
            return serperBatchSearch($payload['queries'], $payload['params'] ?? [], $licenseKey);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown Serper action: ' . $action
            ];
    }
}

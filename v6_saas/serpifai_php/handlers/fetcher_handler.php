<?php
/**
 * Fetcher Handler
 * Routes URL fetching and extraction requests
 * Handles caching for fetched content
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Fetch single URL
 */
function fetchSingleUrl($url, $options, $licenseKey, $userId) {
    // Check cache first
    $cacheKey = 'fetch_' . md5($url . json_encode($options));
    $cached = getCacheValue($cacheKey);
    
    if ($cached) {
        return [
            'success' => true,
            'data' => json_decode($cached, true),
            'cached' => true,
            'credits' => 0 // No credits for cached content
        ];
    }
    
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'fetch:single';
        $creditCost = CREDIT_COSTS[$action] ?? 1;
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode(['url' => $url, 'options' => $options]);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Fetch authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true,
            'cacheKey' => $cacheKey // Apps Script will cache result
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Fetch failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Fetch multiple URLs
 */
function fetchMultipleUrls($urls, $options, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'fetch:multi';
        $urlCount = count($urls);
        $creditCost = $urlCount * (CREDIT_COSTS['fetch:single'] ?? 1);
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode(['urls' => $urls, 'options' => $options]);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Multi-fetch authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'urlCount' => $urlCount,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Multi-fetch failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Extract specific content from URL
 */
function extractContent($url, $extractType, $options, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'fetch:extract_' . $extractType;
        $creditCost = CREDIT_COSTS[$action] ?? 2;
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode(['url' => $url, 'type' => $extractType, 'options' => $options]);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Extraction authorized: ' . $extractType,
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Extraction failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Competitor benchmark (fetch and analyze competitor URL)
 */
function fetchCompetitorBenchmark($url, $options, $licenseKey, $userId) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'fetch:competitor';
        $creditCost = CREDIT_COSTS[$action] ?? 3;
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode(['url' => $url, 'options' => $options]);
        $stmt->bind_param('isis', $userId, $action, $creditCost, $requestJson);
        $stmt->execute();
        $transactionId = $db->insert_id;
        
        return [
            'success' => true,
            'message' => 'Competitor benchmark authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Competitor benchmark failed: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Cache fetched result
 * Called by Apps Script after successful fetch
 */
function cacheFetchResult($cacheKey, $result, $licenseKey) {
    // Cache for 1 hour by default
    setCacheValue($cacheKey, json_encode($result), 3600);
    
    return [
        'success' => true,
        'message' => 'Result cached'
    ];
}

/**
 * Handle fetcher action routing
 */
function handleFetcherAction($action, $payload, $licenseKey, $userId) {
    switch ($action) {
        case 'fetch:single':
        case 'fetch_single':
            return fetchSingleUrl($payload['url'], $payload['options'] ?? [], $licenseKey, $userId);
            
        case 'fetch:multi':
        case 'fetch_multi':
            return fetchMultipleUrls($payload['urls'], $payload['options'] ?? [], $licenseKey, $userId);
            
        case 'fetch:extract_headings':
        case 'fetch:extract_metadata':
        case 'fetch:extract_opengraph':
        case 'fetch:extract_schema':
        case 'fetch:extract_links':
            $extractType = str_replace('fetch:extract_', '', $action);
            return extractContent($payload['url'], $extractType, $payload['options'] ?? [], $licenseKey, $userId);
            
        case 'fetch:competitor':
        case 'fetch_competitor':
            return fetchCompetitorBenchmark($payload['url'], $payload['options'] ?? [], $licenseKey, $userId);
            
        case 'fetch:cache':
            return cacheFetchResult($payload['cacheKey'], $payload['result'], $licenseKey);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown fetcher action: ' . $action
            ];
    }
}

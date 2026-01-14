<?php
/**
 * Google Custom Search API Handler
 * Search indexed pages, snippets, and metadata
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Cache helper functions (simple stubs for now)
 */
function getCacheValue($key) {
    // Simple file-based cache
    $cacheFile = __DIR__ . '/../cache/' . md5($key) . '.cache';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 3600) {
        return file_get_contents($cacheFile);
    }
    return null;
}

function setCacheValue($key, $value, $ttl = 3600) {
    $cacheDir = __DIR__ . '/../cache';
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    $cacheFile = $cacheDir . '/' . md5($key) . '.cache';
    file_put_contents($cacheFile, $value);
    return true;
}

/**
 * Search using Google Custom Search API
 */
function googleCustomSearch($query, $params = []) {
    $apiKey = PAGE_SPEED_API_KEY; // Same key works for multiple Google APIs
    $searchEngineId = $_ENV['GOOGLE_SEARCH_ENGINE_ID'] ?? '';
    
    if (empty($apiKey)) {
        return [
            'success' => false,
            'error' => 'Google API key not configured'
        ];
    }
    
    if (empty($searchEngineId)) {
        return [
            'success' => false,
            'error' => 'Google Search Engine ID not configured. Create one at: https://programmablesearchengine.google.com/'
        ];
    }
    
    // Check cache
    $cacheKey = 'google_search_' . md5($query . json_encode($params));
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        $result = json_decode($cached, true);
        $result['cached'] = true;
        return $result;
    }
    
    // Build API URL
    $apiUrl = 'https://www.googleapis.com/customsearch/v1?' . http_build_query([
        'key' => $apiKey,
        'cx' => $searchEngineId,
        'q' => $query,
        'num' => $params['num'] ?? 10,
        'start' => $params['start'] ?? 1,
        'safe' => $params['safe'] ?? 'off',
        'fields' => 'searchInformation,items(title,link,snippet,displayLink,htmlSnippet)'
    ]);
    
    // Make API request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return [
            'success' => false,
            'error' => 'cURL error: ' . $error
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'success' => false,
            'error' => 'Google Custom Search API error: HTTP ' . $httpCode,
            'response' => $response
        ];
    }
    
    $data = json_decode($response, true);
    
    if (!$data) {
        return [
            'success' => false,
            'error' => 'Invalid JSON response from Google Custom Search API'
        ];
    }
    
    // Extract results
    $result = [
        'success' => true,
        'query' => $query,
        'totalResults' => $data['searchInformation']['totalResults'] ?? '0',
        'searchTime' => $data['searchInformation']['searchTime'] ?? 0,
        'items' => [],
        'fetched_at' => date('Y-m-d H:i:s')
    ];
    
    if (isset($data['items']) && is_array($data['items'])) {
        foreach ($data['items'] as $item) {
            $result['items'][] = [
                'title' => $item['title'] ?? '',
                'link' => $item['link'] ?? '',
                'displayLink' => $item['displayLink'] ?? '',
                'snippet' => $item['snippet'] ?? '',
                'htmlSnippet' => $item['htmlSnippet'] ?? ''
            ];
        }
    }
    
    // Cache result (1 hour - search results change frequently)
    setCacheValue($cacheKey, json_encode($result), 3600);
    
    return $result;
}

/**
 * Handle Google Custom Search actions
 */
function handleGoogleSearchAction($action, $payload) {
    switch ($action) {
        case 'google_search':
        case 'custom_search':
        case 'site_search':
            $query = $payload['query'] ?? '';
            $params = $payload['params'] ?? [];
            
            if (empty($query)) {
                return [
                    'success' => false,
                    'error' => 'Query parameter is required'
                ];
            }
            
            return googleCustomSearch($query, $params);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown Google Search action: ' . $action
            ];
    }
}
?>

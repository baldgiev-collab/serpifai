<?php
/**
 * PageSpeed Insights API Handler
 * Google PageSpeed Insights API integration
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Analyze URL with PageSpeed Insights
 */
function analyzePageSpeed($url, $strategy = 'mobile') {
    $apiKey = PAGE_SPEED_API_KEY;
    
    if (empty($apiKey)) {
        return [
            'success' => false,
            'error' => 'PageSpeed API key not configured'
        ];
    }
    
    // Build API URL
    $apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' . http_build_query([
        'url' => $url,
        'strategy' => $strategy, // mobile or desktop
        'key' => $apiKey,
        'category' => 'performance',
        'category' => 'accessibility',
        'category' => 'best-practices',
        'category' => 'seo'
    ]);
    
    // Check cache
    $cacheKey = 'pagespeed_' . md5($url . '_' . $strategy);
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        $cached['cached'] = true;
        return $cached;
    }
    
    // Make API request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
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
            'error' => 'PageSpeed API error: HTTP ' . $httpCode,
            'response' => $response
        ];
    }
    
    $data = json_decode($response, true);
    
    if (!$data) {
        return [
            'success' => false,
            'error' => 'Invalid JSON response from PageSpeed API'
        ];
    }
    
    // Extract key metrics
    $result = [
        'success' => true,
        'url' => $url,
        'strategy' => $strategy,
        'scores' => [
            'performance' => $data['lighthouseResult']['categories']['performance']['score'] * 100 ?? 0,
            'accessibility' => $data['lighthouseResult']['categories']['accessibility']['score'] * 100 ?? 0,
            'best_practices' => $data['lighthouseResult']['categories']['best-practices']['score'] * 100 ?? 0,
            'seo' => $data['lighthouseResult']['categories']['seo']['score'] * 100 ?? 0
        ],
        'metrics' => [
            'first_contentful_paint' => $data['lighthouseResult']['audits']['first-contentful-paint']['numericValue'] ?? null,
            'speed_index' => $data['lighthouseResult']['audits']['speed-index']['numericValue'] ?? null,
            'largest_contentful_paint' => $data['lighthouseResult']['audits']['largest-contentful-paint']['numericValue'] ?? null,
            'time_to_interactive' => $data['lighthouseResult']['audits']['interactive']['numericValue'] ?? null,
            'total_blocking_time' => $data['lighthouseResult']['audits']['total-blocking-time']['numericValue'] ?? null,
            'cumulative_layout_shift' => $data['lighthouseResult']['audits']['cumulative-layout-shift']['numericValue'] ?? null
        ],
        'core_web_vitals' => [
            'lcp' => $data['lighthouseResult']['audits']['largest-contentful-paint']['numericValue'] ?? null,
            'fid' => $data['lighthouseResult']['audits']['max-potential-fid']['numericValue'] ?? null,
            'cls' => $data['lighthouseResult']['audits']['cumulative-layout-shift']['numericValue'] ?? null
        ],
        'opportunities' => [],
        'diagnostics' => []
    ];
    
    // Extract opportunities (performance improvements)
    if (isset($data['lighthouseResult']['audits'])) {
        foreach ($data['lighthouseResult']['audits'] as $audit) {
            if (isset($audit['details']['type']) && $audit['details']['type'] === 'opportunity') {
                $result['opportunities'][] = [
                    'title' => $audit['title'],
                    'description' => $audit['description'],
                    'score' => $audit['score'] ?? 0,
                    'savings' => $audit['details']['overallSavingsMs'] ?? 0
                ];
            }
        }
    }
    
    // Cache result (1 hour)
    setCacheValue($cacheKey, $result, 3600);
    
    return $result;
}

/**
 * Get Core Web Vitals only (faster, lighter request)
 */
function getCoreWebVitals($url) {
    $result = analyzePageSpeed($url, 'mobile');
    
    if (!$result['success']) {
        return $result;
    }
    
    return [
        'success' => true,
        'url' => $url,
        'core_web_vitals' => $result['core_web_vitals'],
        'performance_score' => $result['scores']['performance']
    ];
}

/**
 * Helper: Get cache value
 */
function getCacheValue($key) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT response_data FROM fetcher_cache WHERE url_hash = ? AND expires_at > NOW()");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? json_decode($result['response_data'], true) : null;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Helper: Set cache value
 */
function setCacheValue($key, $value, $ttl = 3600) {
    try {
        $db = getDB();
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
        
        $stmt = $db->prepare("
            INSERT INTO fetcher_cache (url_hash, url, response_data, expires_at, created_at)
            VALUES (?, 'pagespeed', ?, ?, NOW())
            ON DUPLICATE KEY UPDATE response_data = ?, expires_at = ?
        ");
        
        $jsonValue = json_encode($value);
        $stmt->execute([$key, $jsonValue, $expiresAt, $jsonValue, $expiresAt]);
        return true;
    } catch (Exception $e) {
        error_log("Cache write failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Handle PageSpeed API action
 */
function handlePageSpeedAction($action, $payload) {
    $url = $payload['url'] ?? '';
    
    if (empty($url)) {
        return [
            'success' => false,
            'error' => 'URL is required'
        ];
    }
    
    switch ($action) {
        case 'pagespeed_analyze':
        case 'analyze_pagespeed':
            $strategy = $payload['strategy'] ?? 'mobile';
            return analyzePageSpeed($url, $strategy);
            
        case 'pagespeed_core_web_vitals':
        case 'get_core_web_vitals':
            return getCoreWebVitals($url);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown PageSpeed action: ' . $action
            ];
    }
}
?>

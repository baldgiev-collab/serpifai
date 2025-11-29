<?php
/**
 * OpenPageRank API Handler
 * Domain authority and ranking data
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Get domain rank and authority
 */
function getDomainRank($domain) {
    $apiKey = OPEN_PAGERANK_API_KEY;
    
    if (empty($apiKey)) {
        return [
            'success' => false,
            'error' => 'OpenPageRank API key not configured'
        ];
    }
    
    // Clean domain (remove http/https, www, trailing slash)
    $cleanDomain = preg_replace('#^https?://(www\.)?#', '', $domain);
    $cleanDomain = rtrim($cleanDomain, '/');
    
    // Check cache
    $cacheKey = 'opr_' . md5($cleanDomain);
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        $cached['cached'] = true;
        return $cached;
    }
    
    // Build API URL
    $apiUrl = 'https://openpagerank.com/api/v1.0/getPageRank?' . http_build_query([
        'domains[]' => $cleanDomain
    ]);
    
    // Make API request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => [
            'API-OPR: ' . $apiKey,
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
            'error' => 'OpenPageRank API error: HTTP ' . $httpCode,
            'response' => $response
        ];
    }
    
    $data = json_decode($response, true);
    
    if (!$data || $data['status_code'] !== 200) {
        return [
            'success' => false,
            'error' => $data['error'] ?? 'Invalid API response'
        ];
    }
    
    // Extract rank data
    $rankData = $data['response'][0] ?? [];
    
    $result = [
        'success' => true,
        'domain' => $cleanDomain,
        'page_rank_integer' => $rankData['page_rank_integer'] ?? 0,
        'page_rank_decimal' => $rankData['page_rank_decimal'] ?? 0.0,
        'rank' => $rankData['rank'] ?? 0,
        'status_code' => $rankData['status_code'] ?? null,
        'status' => $rankData['status'] ?? 'unknown',
        'fetched_at' => date('Y-m-d H:i:s')
    ];
    
    // Cache result (24 hours - domain authority doesn't change often)
    setCacheValue($cacheKey, $result, 86400);
    
    return $result;
}

/**
 * Get multiple domains rank (batch)
 */
function getBatchDomainRanks($domains) {
    $apiKey = OPEN_PAGERANK_API_KEY;
    
    if (empty($apiKey)) {
        return [
            'success' => false,
            'error' => 'OpenPageRank API key not configured'
        ];
    }
    
    // Clean domains
    $cleanDomains = array_map(function($domain) {
        $clean = preg_replace('#^https?://(www\.)?#', '', $domain);
        return rtrim($clean, '/');
    }, $domains);
    
    // Check cache for each domain
    $results = [];
    $uncachedDomains = [];
    
    foreach ($cleanDomains as $domain) {
        $cacheKey = 'opr_' . md5($domain);
        $cached = getCacheValue($cacheKey);
        
        if ($cached) {
            $cached['cached'] = true;
            $results[$domain] = $cached;
        } else {
            $uncachedDomains[] = $domain;
        }
    }
    
    // Fetch uncached domains
    if (count($uncachedDomains) > 0) {
        // Build query string
        $queryParams = [];
        foreach ($uncachedDomains as $domain) {
            $queryParams[] = 'domains[]=' . urlencode($domain);
        }
        $apiUrl = 'https://openpagerank.com/api/v1.0/getPageRank?' . implode('&', $queryParams);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER => [
                'API-OPR: ' . $apiKey,
                'Content-Type: application/json'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            if ($data && $data['status_code'] === 200) {
                foreach ($data['response'] as $rankData) {
                    $domain = $rankData['domain'];
                    $result = [
                        'success' => true,
                        'domain' => $domain,
                        'page_rank_integer' => $rankData['page_rank_integer'] ?? 0,
                        'page_rank_decimal' => $rankData['page_rank_decimal'] ?? 0.0,
                        'rank' => $rankData['rank'] ?? 0,
                        'status_code' => $rankData['status_code'] ?? null,
                        'cached' => false
                    ];
                    
                    $results[$domain] = $result;
                    
                    // Cache result
                    $cacheKey = 'opr_' . md5($domain);
                    setCacheValue($cacheKey, $result, 86400);
                }
            }
        }
    }
    
    return [
        'success' => true,
        'domains' => $results,
        'total' => count($results)
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
            VALUES (?, 'openpagerank', ?, ?, NOW())
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
 * Handle OpenPageRank API action
 */
function handleOpenPageRankAction($action, $payload) {
    switch ($action) {
        case 'opr_get_rank':
        case 'get_domain_rank':
            $domain = $payload['domain'] ?? $payload['url'] ?? '';
            if (empty($domain)) {
                return ['success' => false, 'error' => 'Domain is required'];
            }
            return getDomainRank($domain);
            
        case 'opr_batch_ranks':
        case 'get_batch_ranks':
            $domains = $payload['domains'] ?? [];
            if (empty($domains)) {
                return ['success' => false, 'error' => 'Domains array is required'];
            }
            return getBatchDomainRanks($domains);
            
        default:
            return [
                'success' => false,
                'error' => 'Unknown OpenPageRank action: ' . $action
            ];
    }
}
?>

<?php
/**
 * Fetcher Handler v31.0
 * Routes URL fetching and extraction requests
 * Handles caching for fetched content
 * 
 * v31.0: Added comprehensive error logging for HTTP 500 debugging
 */

// v31.0: Emergency error handler to catch and log ALL errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("[FETCHER ERROR] [$errno] $errstr in $errfile on line $errline");
    return false; // Let PHP handle it too
});

set_exception_handler(function($e) {
    error_log("[FETCHER EXCEPTION] " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    error_log("[FETCHER EXCEPTION TRACE] " . $e->getTraceAsString());
    
    // Return JSON error instead of crashing with 500
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server exception: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    exit;
});

error_log("[FETCHER v31.0] Handler loaded at " . date('Y-m-d H:i:s'));

require_once __DIR__ . '/../config/db_config.php';

/**
 * Temporary cache stubs - TODO: implement proper caching system
 */
function getCacheValue($key) {
    return false; // Always miss cache for now
}

function setCacheValue($key, $value, $ttl = 3600) {
    return true; // Do nothing for now
}

/**
 * Fetch single URL
 */
function fetchSingleUrl($url, $options, $licenseKey, $userId) {
    // v29.1: Add diagnostic logging
    error_log("[FETCHER] fetchSingleUrl START - URL: $url");
    
    // Validate URL
    if (empty($url)) {
        error_log("[FETCHER] ERROR: Empty URL provided");
        return [
            'success' => false,
            'error' => 'URL is required'
        ];
    }
    
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
        
        // v29.0: Try to log transaction but don't let it block fetching
        // Use api_transactions (V6 production) first, fall back to transactions (V7)
        $transactionId = 'FETCH-' . time() . '-' . substr(md5($url), 0, 8);
        try {
            $requestJson = json_encode(['url' => $url, 'options' => $options]);
            
            // Try api_transactions first (V6 production schema)
            try {
                $stmt = $db->prepare("
                    INSERT INTO api_transactions 
                    (user_id, action_type, credit_cost, status, request_data)
                    VALUES (?, ?, ?, 'processing', ?)
                ");
                $stmt->execute([$userId, $action, $creditCost, $requestJson]);
                $transactionId = 'TX-' . $db->lastInsertId();
            } catch (PDOException $e1) {
                // api_transactions failed, try transactions (V7 schema)
                $stmt = $db->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                    VALUES (?, ?, ?, ?, 'processing', ?, NOW())
                ");
                $stmt->execute([$transactionId, $userId, $action, $creditCost, $requestJson]);
            }
        } catch (PDOException $e) {
            // Transaction logging failed - continue anyway, fetching is more important
            error_log('Transaction log failed (non-blocking): ' . $e->getMessage());
        }
        
        // Actually fetch the URL with browser-like headers to avoid 403
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 45);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        // v28.4: Explicitly specify gzip,deflate only (Brotli 'br' causes errors on some servers)
        curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); 
        
        // Full Chrome User-Agent string (latest Chrome on Windows 11)
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
        curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
        
        // Essential headers to appear as a real browser
        // v28.4: Remove 'br' (Brotli) from Accept-Encoding to avoid libcurl errors
        $headers = [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Accept-Encoding: gzip, deflate',
            'Cache-Control: no-cache',
            'Pragma: no-cache',
            'Sec-Ch-Ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile: ?0',
            'Sec-Ch-Ua-Platform: "Windows"',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Sec-Fetch-User: ?1',
            'Upgrade-Insecure-Requests: 1',
            'Connection: keep-alive',
            'DNT: 1'
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        // Handle cookies for sites that require them
        $cookieFile = sys_get_temp_dir() . '/serpifai_cookies_' . md5($url) . '.txt';
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
        
        // Add small random delay to avoid rate limiting (100-500ms)
        usleep(rand(100000, 500000));
        
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        curl_close($ch);
        
        // Clean up cookie file
        if (file_exists($cookieFile)) {
            @unlink($cookieFile);
        }
        
        // Handle 403/blocking with retry using different User-Agent
        if ($httpCode === 403 || $httpCode === 429 || $httpCode === 406) {
            // Wait and retry with Googlebot User-Agent (often whitelisted)
            usleep(rand(500000, 1000000)); // Wait 500ms-1s
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
            curl_setopt($ch, CURLOPT_TIMEOUT, 45);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            // v28.4: Explicitly specify gzip,deflate only (no Brotli)
            curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');
            
            // Try with Googlebot (many sites whitelist this)
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: text/html,application/xhtml+xml',
                'Accept-Language: en-US,en;q=0.5',
                'Accept-Encoding: gzip, deflate',
                'Connection: keep-alive'
            ]);
            
            $html = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
        }
        
        // Handle other error codes
        if ($error || ($httpCode !== 200 && $httpCode !== 301 && $httpCode !== 302)) {
            // Even on error, try to return partial data if we got any content
            if ($html && strlen($html) > 500) {
                return [
                    'success' => true,
                    'warning' => "HTTP $httpCode but content retrieved",
                    'data' => [
                        'content' => $html,
                        'url' => $finalUrl ?? $url,
                        'length' => strlen($html),
                        'cached' => false,
                        'httpCode' => $httpCode
                    ],
                    'transactionId' => $transactionId,
                    'creditCost' => $creditCost
                ];
            }
            
            return [
                'success' => false,
                'error' => $error ? "Fetch error: $error" : "HTTP $httpCode - Site may be blocking automated requests",
                'httpCode' => $httpCode,
                'suggestion' => $httpCode === 403 ? 'Site has anti-bot protection. Consider using cached data or alternative sources.' : null
            ];
        }
        
        // Cache the result
        setCacheValue($cacheKey, json_encode(['html' => $html]), 3600);
        
        // ═══════════════════════════════════════════════════════════════════════════
        // EXTRACT METADATA FROM HTML (when options.extractMetadata is true)
        // ═══════════════════════════════════════════════════════════════════════════
        $metadata = [];
        $schema = [];
        $links = [];
        $images = [];
        $headings = [];
        
        if (!empty($options['extractMetadata']) || !empty($options['forensicMode'])) {
            $metadata = extractMetadataFromHtml($html);
        }
        
        if (!empty($options['extractSchema']) || !empty($options['forensicMode'])) {
            $schema = extractSchemaFromHtml($html);
        }
        
        if (!empty($options['extractLinks']) || !empty($options['forensicMode'])) {
            $links = extractLinksFromHtml($html, $finalUrl ?? $url);
        }
        
        if (!empty($options['extractImages']) || !empty($options['forensicMode'])) {
            $images = extractImagesFromHtml($html, $finalUrl ?? $url);
        }
        
        if (!empty($options['forensicMode'])) {
            $headings = extractHeadingsFromHtml($html);
        }
        
        return [
            'success' => true,
            'data' => [
                'content' => $html,
                'url' => $finalUrl ?? $url,
                'length' => strlen($html),
                'cached' => false,
                'httpCode' => $httpCode,
                'metadata' => $metadata,
                'schema' => $schema,
                'links' => $links,
                'images' => $images,
                'headings' => $headings
            ],
            'transactionId' => $transactionId,
            'creditCost' => $creditCost
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Fetch failed: ' . $e->getMessage()
        ];
    } finally {
        $db = null; // Close PDO connection
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
        
        // v29.0: Try to log transaction with backward compatibility
        $transactionId = 'FETCHM-' . time() . '-' . substr(md5(implode(',', $urls)), 0, 8);
        try {
            $requestJson = json_encode(['urls' => $urls, 'options' => $options]);
            
            // Try api_transactions first (V6 production schema)
            try {
                $stmt = $db->prepare("
                    INSERT INTO api_transactions 
                    (user_id, action_type, credit_cost, status, request_data)
                    VALUES (?, ?, ?, 'processing', ?)
                ");
                $stmt->execute([$userId, $action, $creditCost, $requestJson]);
                $transactionId = 'TXM-' . $db->lastInsertId();
            } catch (PDOException $e1) {
                // api_transactions failed, try transactions (V7 schema)
                $stmt = $db->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                    VALUES (?, ?, ?, ?, 'processing', ?, NOW())
                ");
                $stmt->execute([$transactionId, $userId, $action, $creditCost, $requestJson]);
            }
        } catch (PDOException $e) {
            // Transaction logging failed - continue anyway
            error_log('Transaction log failed (non-blocking): ' . $e->getMessage());
        }
        
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
        $db = null; // Close PDO connection
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
        
        // v29.0: Try to log transaction with backward compatibility
        $transactionId = 'EXT-' . time() . '-' . substr(md5($url . $extractType), 0, 8);
        try {
            $requestJson = json_encode(['url' => $url, 'type' => $extractType, 'options' => $options]);
            
            // Try api_transactions first (V6 production)
            try {
                $stmt = $db->prepare("
                    INSERT INTO api_transactions 
                    (user_id, action_type, credit_cost, status, request_data)
                    VALUES (?, ?, ?, 'processing', ?)
                ");
                $stmt->execute([$userId, $action, $creditCost, $requestJson]);
                $transactionId = 'TXE-' . $db->lastInsertId();
            } catch (PDOException $e1) {
                // Fall back to transactions (V7)
                $stmt = $db->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                    VALUES (?, ?, ?, ?, 'processing', ?, NOW())
                ");
                $stmt->execute([$transactionId, $userId, $action, $creditCost, $requestJson]);
            }
        } catch (PDOException $e) {
            error_log('Transaction log failed (non-blocking): ' . $e->getMessage());
        }
        
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
        $db = null; // Close PDO connection
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
        
        // v29.0: Try to log transaction with backward compatibility
        $transactionId = 'COMP-' . time() . '-' . substr(md5($url), 0, 8);
        try {
            $requestJson = json_encode(['url' => $url, 'options' => $options]);
            
            // Try api_transactions first (V6 production)
            try {
                $stmt = $db->prepare("
                    INSERT INTO api_transactions 
                    (user_id, action_type, credit_cost, status, request_data)
                    VALUES (?, ?, ?, 'processing', ?)
                ");
                $stmt->execute([$userId, $action, $creditCost, $requestJson]);
                $transactionId = 'TXC-' . $db->lastInsertId();
            } catch (PDOException $e1) {
                // Fall back to transactions (V7)
                $stmt = $db->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, action_type, credit_cost, status, request_data, created_at)
                    VALUES (?, ?, ?, ?, 'processing', ?, NOW())
                ");
                $stmt->execute([$transactionId, $userId, $action, $creditCost, $requestJson]);
            }
        } catch (PDOException $e) {
            error_log('Transaction log failed (non-blocking): ' . $e->getMessage());
        }
        
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
        $db = null; // Close PDO connection
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
    // v29.1: Add debug logging for troubleshooting HTTP 500 errors
    error_log("[FETCHER] handleFetcherAction called - Action: $action, UserId: $userId");
    error_log("[FETCHER] Payload: " . json_encode($payload));
    
    try {
        switch ($action) {
            case 'fetch:single':
            case 'fetch_single':
            case 'fetcher_single':
                error_log("[FETCHER] Routing to fetchSingleUrl for: " . ($payload['url'] ?? 'NO_URL'));
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
                error_log("[FETCHER] Unknown action: $action");
                return [
                    'success' => false,
                    'error' => 'Unknown fetcher action: ' . $action
                ];
        }
    } catch (Exception $e) {
        error_log("[FETCHER] Exception in handleFetcherAction: " . $e->getMessage());
        error_log("[FETCHER] Stack trace: " . $e->getTraceAsString());
        return [
            'success' => false,
            'error' => 'Fetcher exception: ' . $e->getMessage()
        ];
    } catch (Error $e) {
        error_log("[FETCHER] Fatal error in handleFetcherAction: " . $e->getMessage());
        error_log("[FETCHER] Stack trace: " . $e->getTraceAsString());
        return [
            'success' => false,
            'error' => 'Fetcher fatal error: ' . $e->getMessage()
        ];
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HTML EXTRACTION HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Extract metadata from HTML (title, description, h1, word count, language)
 */
function extractMetadataFromHtml($html) {
    $metadata = [
        'title' => '',
        'description' => '',
        'h1' => '',
        'h2' => [],
        'wordCount' => 0,
        'language' => 'unknown'
    ];
    
    if (empty($html)) {
        return $metadata;
    }
    
    // Suppress HTML parsing errors
    libxml_use_internal_errors(true);
    
    $doc = new DOMDocument();
    $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($doc);
    
    // Extract title
    $titleNodes = $xpath->query('//title');
    if ($titleNodes->length > 0) {
        $metadata['title'] = trim($titleNodes->item(0)->textContent);
    }
    
    // Extract meta description
    $descNodes = $xpath->query('//meta[@name="description"]/@content');
    if ($descNodes->length > 0) {
        $metadata['description'] = trim($descNodes->item(0)->textContent);
    }
    
    // Fallback: og:description
    if (empty($metadata['description'])) {
        $ogDescNodes = $xpath->query('//meta[@property="og:description"]/@content');
        if ($ogDescNodes->length > 0) {
            $metadata['description'] = trim($ogDescNodes->item(0)->textContent);
        }
    }
    
    // Extract H1
    $h1Nodes = $xpath->query('//h1');
    if ($h1Nodes->length > 0) {
        $metadata['h1'] = trim($h1Nodes->item(0)->textContent);
    }
    
    // Extract H2s (up to 5)
    $h2Nodes = $xpath->query('//h2');
    $h2Array = [];
    for ($i = 0; $i < min(5, $h2Nodes->length); $i++) {
        $h2Text = trim($h2Nodes->item($i)->textContent);
        if (!empty($h2Text)) {
            $h2Array[] = $h2Text;
        }
    }
    $metadata['h2'] = $h2Array;
    
    // Extract language from html tag
    $htmlNodes = $xpath->query('//html/@lang');
    if ($htmlNodes->length > 0) {
        $metadata['language'] = trim($htmlNodes->item(0)->textContent);
    }
    
    // Calculate word count from body text
    $bodyNodes = $xpath->query('//body');
    if ($bodyNodes->length > 0) {
        // Remove script and style content
        $scripts = $xpath->query('//script | //style | //noscript');
        foreach ($scripts as $script) {
            $script->parentNode->removeChild($script);
        }
        
        $bodyText = trim($bodyNodes->item(0)->textContent);
        // Clean up whitespace and count words
        $bodyText = preg_replace('/\s+/', ' ', $bodyText);
        $words = array_filter(explode(' ', $bodyText), function($w) {
            return strlen(trim($w)) > 0;
        });
        $metadata['wordCount'] = count($words);
    }
    
    libxml_clear_errors();
    
    return $metadata;
}

/**
 * Extract Schema.org structured data from HTML
 */
function extractSchemaFromHtml($html) {
    $schema = [
        'types' => [],
        'hasOrganizationSchema' => false,
        'raw' => []
    ];
    
    if (empty($html)) {
        return $schema;
    }
    
    // Find JSON-LD schema blocks
    preg_match_all('/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $html, $matches);
    
    if (!empty($matches[1])) {
        foreach ($matches[1] as $jsonLd) {
            $decoded = @json_decode(trim($jsonLd), true);
            if ($decoded) {
                $schema['raw'][] = $decoded;
                
                // Extract @type
                if (isset($decoded['@type'])) {
                    $types = is_array($decoded['@type']) ? $decoded['@type'] : [$decoded['@type']];
                    foreach ($types as $type) {
                        if (!in_array($type, $schema['types'])) {
                            $schema['types'][] = $type;
                        }
                        if ($type === 'Organization' || $type === 'LocalBusiness') {
                            $schema['hasOrganizationSchema'] = true;
                        }
                    }
                }
                
                // Check @graph for multiple types
                if (isset($decoded['@graph']) && is_array($decoded['@graph'])) {
                    foreach ($decoded['@graph'] as $item) {
                        if (isset($item['@type'])) {
                            $types = is_array($item['@type']) ? $item['@type'] : [$item['@type']];
                            foreach ($types as $type) {
                                if (!in_array($type, $schema['types'])) {
                                    $schema['types'][] = $type;
                                }
                                if ($type === 'Organization' || $type === 'LocalBusiness') {
                                    $schema['hasOrganizationSchema'] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return $schema;
}

/**
 * Extract links from HTML
 */
function extractLinksFromHtml($html, $baseUrl) {
    $links = [];
    
    if (empty($html)) {
        return $links;
    }
    
    // Parse base URL for internal/external detection
    $parsedBase = parse_url($baseUrl);
    $baseDomain = $parsedBase['host'] ?? '';
    
    libxml_use_internal_errors(true);
    
    $doc = new DOMDocument();
    $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($doc);
    
    $aNodes = $xpath->query('//a[@href]');
    foreach ($aNodes as $a) {
        $href = $a->getAttribute('href');
        $text = trim($a->textContent);
        
        // Skip empty, javascript, and anchor-only links
        if (empty($href) || strpos($href, 'javascript:') === 0 || $href === '#') {
            continue;
        }
        
        // Parse the link
        $parsedLink = parse_url($href);
        $linkDomain = $parsedLink['host'] ?? '';
        
        // Determine if internal
        $isInternal = empty($linkDomain) || 
                      $linkDomain === $baseDomain || 
                      strpos($linkDomain, $baseDomain) !== false ||
                      strpos($baseDomain, $linkDomain) !== false;
        
        $links[] = [
            'href' => $href,
            'text' => substr($text, 0, 100),
            'isInternal' => $isInternal
        ];
        
        // Limit to 100 links
        if (count($links) >= 100) {
            break;
        }
    }
    
    libxml_clear_errors();
    
    return $links;
}

/**
 * Extract images from HTML
 */
function extractImagesFromHtml($html, $baseUrl) {
    $images = [];
    
    if (empty($html)) {
        return $images;
    }
    
    libxml_use_internal_errors(true);
    
    $doc = new DOMDocument();
    $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($doc);
    
    $imgNodes = $xpath->query('//img[@src]');
    foreach ($imgNodes as $img) {
        $src = $img->getAttribute('src');
        $alt = $img->getAttribute('alt');
        
        if (!empty($src)) {
            $images[] = [
                'src' => $src,
                'alt' => trim($alt)
            ];
        }
        
        // Limit to 50 images
        if (count($images) >= 50) {
            break;
        }
    }
    
    libxml_clear_errors();
    
    return $images;
}

/**
 * Extract all headings from HTML (H1-H6)
 */
function extractHeadingsFromHtml($html) {
    $headings = [];
    
    if (empty($html)) {
        return $headings;
    }
    
    libxml_use_internal_errors(true);
    
    $doc = new DOMDocument();
    $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($doc);
    
    for ($level = 1; $level <= 6; $level++) {
        $hNodes = $xpath->query("//h{$level}");
        foreach ($hNodes as $h) {
            $text = trim($h->textContent);
            if (!empty($text)) {
                $headings[] = [
                    'level' => $level,
                    'text' => substr($text, 0, 200)
                ];
            }
            
            // Limit total headings
            if (count($headings) >= 100) {
                break 2;
            }
        }
    }
    
    libxml_clear_errors();
    
    return $headings;
}

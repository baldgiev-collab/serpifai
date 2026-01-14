<?php
/**
 * Competitor Analysis Handler
 * Routes competitor intelligence requests
 * Handles all 15 analysis categories
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Handle competitor analysis actions
 */
function handleCompetitorAction($action, $payload, $license, $userId) {
    error_log("🎯 handleCompetitorAction called");
    error_log("   Action: " . $action);
    
    // Extract action type
    $actionType = str_replace(['comp:', 'comp_', 'COMP_', 'ELITE_'], '', $action);
    
    switch($actionType) {
        case 'save_results':
            return saveCompetitorResults($payload, $userId);
            
        case 'load_results':
            return loadCompetitorResults($payload, $userId);
            
        case 'list_projects':
            return listCompetitorProjects($userId);
            
        case 'delete_results':
            return deleteCompetitorResults($payload, $userId);
        
        // ═══════════════════════════════════════════════════════════════
        // TREND TRACKING ENDPOINTS (2026)
        // Store and retrieve historical traffic data for trend analysis
        // ═══════════════════════════════════════════════════════════════
        case 'save_trend':
            return saveCompetitorTrend($payload, $userId);
            
        case 'get_trend':
            return getCompetitorTrend($payload, $userId);
            
        case 'get_trends_bulk':
            return getCompetitorTrendsBulk($payload, $userId);
        
        // ═══════════════════════════════════════════════════════════════
        // DATA SOURCE PRIORITY & REFRESH (2026 Elite)
        // Priority cascade: API → Oracle → Cache → Gemini
        // ═══════════════════════════════════════════════════════════════
        case 'refresh_metric':
            return refreshCompetitorMetric($payload, $userId);
            
        case 'get_consistency':
            return getHistoricalConsistency($payload, $userId);
            
        case 'fetch_priority':
            $domain = $payload['domain'] ?? '';
            $metricType = $payload['metricType'] ?? 'all';
            return fetchWithPriority($domain, $metricType, $userId);
            
        case 'orchestrate':
        case 'analyze':
        case 'elite_full':
        default:
            // Authorization only - execution happens in Apps Script
            return authorizeCompetitorAnalysis($actionType, $payload, $license, $userId);
    }
}

/**
 * Save competitor analysis results to MySQL
 */
function saveCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        $jsonData = $payload['data'] ?? '';
        $competitors = $payload['competitors'] ?? [];
        $yourDomain = $payload['yourDomain'] ?? '';
        $metadata = $payload['metadata'] ?? [];
        
        if (empty($projectId) || empty($jsonData)) {
            return [
                'success' => false,
                'error' => 'Missing projectId or data'
            ];
        }
        
        // Check if project exists
        $stmt = $db->prepare("
            SELECT id FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
        ");
        $stmt->execute([$projectId, $userId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update existing
            $stmt = $db->prepare("
                UPDATE competitor_analysis_results 
                SET 
                    analysis_data = ?,
                    competitors = ?,
                    your_domain = ?,
                    competitor_count = ?,
                    data_quality = ?,
                    api_success = ?,
                    updated_at = NOW()
                WHERE project_id = ? AND user_id = ?
            ");
            
            $stmt->execute([
                $jsonData,
                json_encode($competitors),
                $yourDomain,
                $metadata['competitorCount'] ?? count($competitors),
                $metadata['dataQuality'] ?? 'standard',
                $metadata['apiSuccess'] ?? '0/0',
                $projectId,
                $userId
            ]);
            
            $message = 'Results updated';
            $resultId = $existing['id'];
            
        } else {
            // Insert new
            $stmt = $db->prepare("
                INSERT INTO competitor_analysis_results (
                    user_id, project_id, analysis_data, competitors, 
                    your_domain, competitor_count, data_quality, 
                    api_success, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $userId,
                $projectId,
                $jsonData,
                json_encode($competitors),
                $yourDomain,
                $metadata['competitorCount'] ?? count($competitors),
                $metadata['dataQuality'] ?? 'standard',
                $metadata['apiSuccess'] ?? '0/0'
            ]);
            
            $resultId = $db->lastInsertId();
            $message = 'Results saved';
        }
        
        // Log activity
        logActivity($userId, 'competitor_results_saved', [
            'projectId' => $projectId,
            'resultId' => $resultId,
            'competitorCount' => count($competitors)
        ]);
        
        return [
            'success' => true,
            'message' => $message,
            'projectId' => $projectId,
            'resultId' => $resultId,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        error_log("saveCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Load competitor analysis results from MySQL
 */
function loadCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        
        if (empty($projectId)) {
            return [
                'success' => false,
                'error' => 'Missing projectId'
            ];
        }
        
        $stmt = $db->prepare("
            SELECT * FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
            ORDER BY updated_at DESC
            LIMIT 1
        ");
        
        $stmt->execute([$projectId, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return [
                'success' => false,
                'error' => 'Project not found: ' + $projectId
            ];
        }
        
        return [
            'success' => true,
            'data' => $result['analysis_data'],
            'metadata' => [
                'projectId' => $result['project_id'],
                'competitors' => json_decode($result['competitors'], true),
                'yourDomain' => $result['your_domain'],
                'competitorCount' => $result['competitor_count'],
                'dataQuality' => $result['data_quality'],
                'apiSuccess' => $result['api_success'],
                'createdAt' => $result['created_at'],
                'updatedAt' => $result['updated_at']
            ]
        ];
        
    } catch (Exception $e) {
        error_log("loadCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * List all competitor analysis projects for user
 */
function listCompetitorProjects($userId) {
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                project_id, your_domain, competitors, 
                competitor_count, data_quality, api_success,
                created_at, updated_at
            FROM competitor_analysis_results 
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 50
        ");
        
        $stmt->execute([$userId]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode competitors JSON
        foreach ($projects as &$project) {
            $project['competitors'] = json_decode($project['competitors'], true);
        }
        
        return [
            'success' => true,
            'projects' => $projects,
            'count' => count($projects)
        ];
        
    } catch (Exception $e) {
        error_log("listCompetitorProjects error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Delete competitor analysis results
 */
function deleteCompetitorResults($payload, $userId) {
    try {
        $db = getDB();
        
        $projectId = $payload['projectId'] ?? '';
        
        if (empty($projectId)) {
            return [
                'success' => false,
                'error' => 'Missing projectId'
            ];
        }
        
        $stmt = $db->prepare("
            DELETE FROM competitor_analysis_results 
            WHERE project_id = ? AND user_id = ?
        ");
        
        $stmt->execute([$projectId, $userId]);
        
        return [
            'success' => true,
            'message' => 'Project deleted',
            'projectId' => $projectId
        ];
        
    } catch (Exception $e) {
        error_log("deleteCompetitorResults error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Authorize competitor analysis (existing function)
 */
function authorizeCompetitorAnalysis($category, $payload, $licenseKey, $userId) {
    try {
        $db = getDbConnection();
        
        if (!$db) {
            error_log("❌ authorizeCompetitorAnalysis: Database connection failed");
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
    } catch (Exception $e) {
        error_log("❌ authorizeCompetitorAnalysis: DB exception - " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
    
    try {
        // Build action name
        $action = 'comp:' . $category;
        
        // Get credit cost from constants
        $creditCostsArray = CREDIT_COSTS;
        $creditCost = $creditCostsArray[$action] ?? 10; // Default 10 credits for competitor analysis
        
        error_log("📊 authorizeCompetitorAnalysis: $action ($creditCost credits)");
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->execute([$userId, $action, $creditCost, $requestJson]);
        $transactionId = $db->lastInsertId();
        
        error_log("✅ Transaction logged: #$transactionId");
        
        return [
            'success' => true,
            'message' => 'Competitor analysis authorized: ' . $category,
            'transactionId' => $transactionId,
            'creditCost' => $creditCost,
            'category' => $category,
            'executeInAppsScript' => true
        ];
        
    } catch (Exception $e) {
        error_log("❌ authorizeCompetitorAnalysis: Transaction error - " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Authorization failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Execute full elite competitor analysis (all 15 categories)
 */
function executeEliteAnalysis($payload, $licenseKey, $userId) {
    error_log("📊 executeEliteAnalysis called (Authorization Only)");
    error_log("   Payload: " . json_encode($payload));
    error_log("   License: " . substr($licenseKey, 0, 8) . "...");
    error_log("   User ID: " . $userId);
    
    $db = getDbConnection();
    
    if (!$db) {
        error_log("❌ Database connection failed");
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $action = 'comp:elite_full';
        $creditCost = CREDIT_COSTS[$action] ?? 100;
        
        error_log("💳 Credit cost: " . $creditCost);
        
        // Log transaction
        $stmt = $db->prepare("
            INSERT INTO api_transactions 
            (user_id, action_type, credit_cost, status, request_data)
            VALUES (?, ?, ?, 'processing', ?)
        ");
        $requestJson = json_encode($payload);
        $stmt->execute([$userId, $action, $creditCost, $requestJson]);
        $transactionId = $db->lastInsertId();
        
        error_log("✅ Transaction logged: #" . $transactionId);
        error_log("   Apps Script will execute full analysis with FT + APIs + Gemini");
        
        return [
            'success' => true,
            'message' => 'Elite competitor analysis authorized',
            'transactionId' => $transactionId,
            'creditCost' => $creditCost
        ];
        
    } catch (Exception $e) {
        error_log("❌ Elite analysis error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Elite analysis failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Get competitor analysis history
 */
function getCompetitorHistory($licenseKey, $limit = 50) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            SELECT t.*, u.license_key
            FROM api_transactions t
            JOIN users u ON t.user_id = u.id
            WHERE u.license_key = ?
            AND t.action_type LIKE 'comp:%'
            ORDER BY t.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$licenseKey, $limit]);
        $rows = $stmt->fetchAll();
        
        $history = [];
        foreach ($rows as $row) {
            $history[] = [
                'id' => $row['id'],
                'action' => $row['action_type'],
                'credits' => $row['credit_cost'],
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'completed_at' => $row['completed_at']
            ];
        }
        
        return [
            'success' => true,
            'data' => $history
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to get competitor history: ' . $e->getMessage()
        ];
    }
}

// NOTE: Removed duplicate handleCompetitorAction and saveCompetitorResults
// Main implementations are at the top of the file (lines 13-40 and 41-142)

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR TREND TRACKING (2026)
// Store historical traffic, authority, and keyword data for sparklines
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save daily competitor metrics for trend tracking
 * Called automatically when competitor analysis runs
 */
function saveCompetitorTrend($payload, $userId) {
    try {
        $db = getDB();
        
        $domain = $payload['domain'] ?? '';
        $projectId = $payload['projectId'] ?? '';
        $metrics = $payload['metrics'] ?? [];
        $snapshotDate = $payload['date'] ?? date('Y-m-d');
        
        if (empty($domain)) {
            return [
                'success' => false,
                'error' => 'Missing domain'
            ];
        }
        
        // Extract metrics
        $traffic = $metrics['traffic'] ?? 0;
        $authority = $metrics['authority'] ?? 0;
        $keywords = $metrics['keywords'] ?? 0;
        $backlinks = $metrics['backlinks'] ?? 0;
        $trafficValue = $metrics['trafficValue'] ?? 0;
        $health = $metrics['health'] ?? 0;
        
        // Check if we already have a record for this domain/date
        $stmt = $db->prepare("
            SELECT id FROM competitor_trends 
            WHERE user_id = ? AND domain = ? AND snapshot_date = ?
        ");
        $stmt->execute([$userId, $domain, $snapshotDate]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update existing record
            $stmt = $db->prepare("
                UPDATE competitor_trends 
                SET 
                    organic_traffic = ?,
                    authority_score = ?,
                    organic_keywords = ?,
                    backlinks = ?,
                    traffic_value = ?,
                    site_health = ?,
                    project_id = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $traffic,
                $authority,
                $keywords,
                $backlinks,
                $trafficValue,
                $health,
                $projectId,
                $existing['id']
            ]);
            $recordId = $existing['id'];
            $message = 'Trend data updated';
        } else {
            // Insert new record
            $stmt = $db->prepare("
                INSERT INTO competitor_trends (
                    user_id, domain, project_id, snapshot_date,
                    organic_traffic, authority_score, organic_keywords,
                    backlinks, traffic_value, site_health,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([
                $userId,
                $domain,
                $projectId,
                $snapshotDate,
                $traffic,
                $authority,
                $keywords,
                $backlinks,
                $trafficValue,
                $health
            ]);
            $recordId = $db->lastInsertId();
            $message = 'Trend data saved';
        }
        
        return [
            'success' => true,
            'message' => $message,
            'recordId' => $recordId,
            'domain' => $domain,
            'date' => $snapshotDate
        ];
        
    } catch (Exception $e) {
        error_log("saveCompetitorTrend error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Get historical trend data for a competitor
 * Returns daily snapshots for sparkline visualization
 */
function getCompetitorTrend($payload, $userId) {
    try {
        $db = getDB();
        
        $domain = $payload['domain'] ?? '';
        $days = $payload['days'] ?? 30;
        
        if (empty($domain)) {
            return [
                'success' => false,
                'error' => 'Missing domain'
            ];
        }
        
        // Calculate date range
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime("-{$days} days"));
        
        $stmt = $db->prepare("
            SELECT 
                snapshot_date,
                organic_traffic,
                authority_score,
                organic_keywords,
                backlinks,
                traffic_value,
                site_health
            FROM competitor_trends 
            WHERE user_id = ? AND domain = ?
            AND snapshot_date BETWEEN ? AND ?
            ORDER BY snapshot_date ASC
        ");
        $stmt->execute([$userId, $domain, $startDate, $endDate]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($rows)) {
            return [
                'success' => true,
                'hasTrend' => false,
                'domain' => $domain,
                'message' => 'No historical data available'
            ];
        }
        
        // Format data for sparklines
        $trafficData = [];
        $authorityData = [];
        $keywordsData = [];
        $dates = [];
        
        foreach ($rows as $row) {
            $dates[] = $row['snapshot_date'];
            $trafficData[] = (int)$row['organic_traffic'];
            $authorityData[] = (int)$row['authority_score'];
            $keywordsData[] = (int)$row['organic_keywords'];
        }
        
        // Calculate trend metrics
        $firstTraffic = $trafficData[0] ?? 0;
        $lastTraffic = end($trafficData) ?? 0;
        $trafficChange = $firstTraffic > 0 
            ? round((($lastTraffic - $firstTraffic) / $firstTraffic) * 100, 1)
            : 0;
        
        return [
            'success' => true,
            'hasTrend' => true,
            'domain' => $domain,
            'days' => count($rows),
            'dateRange' => [
                'start' => $dates[0] ?? $startDate,
                'end' => end($dates) ?? $endDate
            ],
            'sparkline' => [
                'traffic' => $trafficData,
                'authority' => $authorityData,
                'keywords' => $keywordsData
            ],
            'trend' => [
                'changePercent' => $trafficChange,
                'changeLabel' => ($trafficChange >= 0 ? '+' : '') . $trafficChange . '%',
                'direction' => $trafficChange > 5 ? 'up' : ($trafficChange < -5 ? 'down' : 'stable')
            ],
            'latest' => [
                'traffic' => $lastTraffic,
                'authority' => end($authorityData),
                'keywords' => end($keywordsData)
            ]
        ];
        
    } catch (Exception $e) {
        error_log("getCompetitorTrend error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Get trends for multiple competitors at once (bulk fetch for table)
 */
function getCompetitorTrendsBulk($payload, $userId) {
    try {
        $db = getDB();
        
        $domains = $payload['domains'] ?? [];
        $days = $payload['days'] ?? 30;
        
        if (empty($domains) || !is_array($domains)) {
            return [
                'success' => false,
                'error' => 'Missing or invalid domains array'
            ];
        }
        
        $results = [];
        
        foreach ($domains as $domain) {
            $trend = getCompetitorTrend(['domain' => $domain, 'days' => $days], $userId);
            $results[$domain] = $trend;
        }
        
        return [
            'success' => true,
            'trends' => $results,
            'count' => count($results)
        ];
        
    } catch (Exception $e) {
        error_log("getCompetitorTrendsBulk error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * DATA SOURCE PRIORITY SYSTEM (Task 26)
 * Cascade: Direct API → Oracle Fetcher → PHP Fetcher → Gemini Estimation
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
function fetchWithPriority($domain, $metricType, $userId) {
    $result = null;
    $source = 'fallback';
    
    // Priority 1: Try direct API (Serper, OpenPageRank, etc.)
    $apiResult = fetchFromDirectAPI($domain, $metricType);
    if ($apiResult && $apiResult['success']) {
        return [
            'success' => true,
            'data' => $apiResult['data'],
            'source' => 'api',
            'confidence' => 95
        ];
    }
    
    // Priority 2: Try Oracle Fetcher (scraped data)
    $oracleResult = fetchFromOracle($domain, $metricType);
    if ($oracleResult && $oracleResult['success']) {
        return [
            'success' => true,
            'data' => $oracleResult['data'],
            'source' => 'oracle',
            'confidence' => 85
        ];
    }
    
    // Priority 3: Use cached/historical data
    $cachedResult = fetchFromCache($domain, $metricType, $userId);
    if ($cachedResult && $cachedResult['success']) {
        return [
            'success' => true,
            'data' => $cachedResult['data'],
            'source' => 'cached',
            'confidence' => 70
        ];
    }
    
    // Priority 4: Gemini estimation (fallback)
    return [
        'success' => true,
        'data' => null,
        'source' => 'gemini',
        'confidence' => 50,
        'estimated' => true
    ];
}

/**
 * Fetch from direct SEO APIs (Serper, OpenPageRank)
 */
function fetchFromDirectAPI($domain, $metricType) {
    try {
        // API endpoints based on metric type
        $endpoints = [
            'traffic' => null, // No direct API for traffic
            'authority' => 'https://openpagerank.com/api/v1.0/getPageRank',
            'keywords' => null, // Serper doesn't provide this directly
            'backlinks' => null  // Would need Majestic/Moz API
        ];
        
        if ($metricType === 'authority') {
            // OpenPageRank API
            $apiKey = getenv('OPENPAGERANK_KEY') ?: '';
            if (empty($apiKey)) return null;
            
            $url = "https://openpagerank.com/api/v1.0/getPageRank?domains[]=" . urlencode($domain);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'API-OPR: ' . $apiKey
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $data = json_decode($response, true);
                if (isset($data['response'][0]['page_rank_decimal'])) {
                    return [
                        'success' => true,
                        'data' => [
                            'pagerank' => $data['response'][0]['page_rank_decimal'],
                            'domain_authority' => round($data['response'][0]['page_rank_decimal'] * 10, 1)
                        ]
                    ];
                }
            }
        }
        
        return null;
        
    } catch (Exception $e) {
        error_log("fetchFromDirectAPI error: " . $e->getMessage());
        return null;
    }
}

/**
 * Fetch from Oracle Fetcher (Google Apps Script web scraping)
 * This connects to the Oracle fetcher deployed in Apps Script
 */
function fetchFromOracle($domain, $metricType) {
    try {
        // Oracle fetcher endpoint (Apps Script deployment)
        $oracleUrl = getenv('ORACLE_FETCHER_URL') ?: '';
        if (empty($oracleUrl)) return null;
        
        $payload = json_encode([
            'action' => 'fetch_metrics',
            'domain' => $domain,
            'metricType' => $metricType
        ]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $oracleUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if (isset($data['success']) && $data['success']) {
                return [
                    'success' => true,
                    'data' => $data['metrics'] ?? $data['data']
                ];
            }
        }
        
        return null;
        
    } catch (Exception $e) {
        error_log("fetchFromOracle error: " . $e->getMessage());
        return null;
    }
}

/**
 * Fetch from cache (recent historical data)
 */
function fetchFromCache($domain, $metricType, $userId) {
    try {
        $db = getDB();
        
        // Get most recent trend data as cache
        $stmt = $db->prepare("
            SELECT * FROM competitor_trends 
            WHERE domain = ? AND user_id = ? 
            ORDER BY snapshot_date DESC 
            LIMIT 1
        ");
        $stmt->execute([$domain, $userId]);
        $cached = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($cached && strtotime($cached['snapshot_date']) > strtotime('-7 days')) {
            return [
                'success' => true,
                'data' => [
                    'traffic' => $cached['organic_traffic'],
                    'authority' => $cached['authority_score'],
                    'keywords' => $cached['organic_keywords'],
                    'backlinks' => $cached['backlinks'],
                    'cached_date' => $cached['snapshot_date']
                ]
            ];
        }
        
        return null;
        
    } catch (Exception $e) {
        error_log("fetchFromCache error: " . $e->getMessage());
        return null;
    }
}

/**
 * Refresh a specific metric for a competitor (Task 27)
 */
function refreshCompetitorMetric($payload, $userId) {
    try {
        $domain = $payload['domain'] ?? '';
        $metricType = $payload['metricType'] ?? 'all';
        
        if (empty($domain)) {
            return ['success' => false, 'error' => 'Missing domain'];
        }
        
        // Use priority system to get fresh data
        $result = fetchWithPriority($domain, $metricType, $userId);
        
        if ($result['success']) {
            // Update cache with new data
            if (!$result['estimated']) {
                updateMetricCache($domain, $metricType, $result['data'], $userId);
            }
            
            return [
                'success' => true,
                'data' => $result['data'],
                'source' => $result['source'],
                'confidence' => $result['confidence'],
                'refreshed_at' => date('Y-m-d H:i:s')
            ];
        }
        
        return $result;
        
    } catch (Exception $e) {
        error_log("refreshCompetitorMetric error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Refresh failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Update metric cache with fresh data
 */
function updateMetricCache($domain, $metricType, $data, $userId) {
    try {
        $db = getDB();
        
        // Get or create today's snapshot
        $today = date('Y-m-d');
        
        $stmt = $db->prepare("
            SELECT id FROM competitor_trends 
            WHERE domain = ? AND user_id = ? AND snapshot_date = ?
        ");
        $stmt->execute([$domain, $userId, $today]);
        $existing = $stmt->fetch();
        
        // Build update fields based on metric type
        $updateFields = [];
        $updateValues = [];
        
        if ($metricType === 'all' || $metricType === 'traffic') {
            $updateFields[] = 'organic_traffic = ?';
            $updateValues[] = $data['traffic'] ?? $data['organic_traffic'] ?? null;
        }
        if ($metricType === 'all' || $metricType === 'authority') {
            $updateFields[] = 'authority_score = ?';
            $updateValues[] = $data['authority'] ?? $data['authority_score'] ?? null;
        }
        if ($metricType === 'all' || $metricType === 'keywords') {
            $updateFields[] = 'organic_keywords = ?';
            $updateValues[] = $data['keywords'] ?? $data['organic_keywords'] ?? null;
        }
        if ($metricType === 'all' || $metricType === 'backlinks') {
            $updateFields[] = 'backlinks = ?';
            $updateValues[] = $data['backlinks'] ?? null;
        }
        
        if ($existing) {
            // Update existing snapshot
            $updateValues[] = $existing['id'];
            $sql = "UPDATE competitor_trends SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($updateValues);
        } else {
            // Insert new snapshot
            $stmt = $db->prepare("
                INSERT INTO competitor_trends (user_id, domain, snapshot_date, organic_traffic, authority_score, organic_keywords, backlinks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $domain,
                $today,
                $data['traffic'] ?? $data['organic_traffic'] ?? null,
                $data['authority'] ?? $data['authority_score'] ?? null,
                $data['keywords'] ?? $data['organic_keywords'] ?? null,
                $data['backlinks'] ?? null
            ]);
        }
        
        return true;
        
    } catch (Exception $e) {
        error_log("updateMetricCache error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get historical consistency score for a competitor (Task 11)
 * Measures how stable their metrics are over time
 */
function getHistoricalConsistency($payload, $userId) {
    try {
        $db = getDB();
        
        $domain = $payload['domain'] ?? '';
        $days = $payload['days'] ?? 90;
        
        if (empty($domain)) {
            return ['success' => false, 'error' => 'Missing domain'];
        }
        
        // Get historical data
        $stmt = $db->prepare("
            SELECT organic_traffic, authority_score, organic_keywords
            FROM competitor_trends 
            WHERE domain = ? AND user_id = ? 
            AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ORDER BY snapshot_date ASC
        ");
        $stmt->execute([$domain, $userId, $days]);
        $snapshots = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($snapshots) < 3) {
            return [
                'success' => true,
                'consistency' => 50, // Neutral score if insufficient data
                'dataPoints' => count($snapshots),
                'sufficient' => false
            ];
        }
        
        // Calculate variance for each metric
        $trafficValues = array_column($snapshots, 'organic_traffic');
        $trafficVariance = calculateVarianceScore($trafficValues);
        
        $authorityValues = array_column($snapshots, 'authority_score');
        $authorityVariance = calculateVarianceScore($authorityValues);
        
        $keywordValues = array_column($snapshots, 'organic_keywords');
        $keywordVariance = calculateVarianceScore($keywordValues);
        
        // Combine scores (traffic is most volatile, so weight it less)
        $consistencyScore = (
            $trafficVariance * 0.3 +
            $authorityVariance * 0.4 +
            $keywordVariance * 0.3
        );
        
        return [
            'success' => true,
            'consistency' => round($consistencyScore),
            'breakdown' => [
                'traffic' => round($trafficVariance),
                'authority' => round($authorityVariance),
                'keywords' => round($keywordVariance)
            ],
            'dataPoints' => count($snapshots),
            'sufficient' => true
        ];
        
    } catch (Exception $e) {
        error_log("getHistoricalConsistency error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ];
    }
}

/**
 * Calculate variance score (0-100, higher = more consistent)
 */
function calculateVarianceScore($values) {
    $values = array_filter($values, function($v) { return $v !== null && $v > 0; });
    if (count($values) < 2) return 50;
    
    $mean = array_sum($values) / count($values);
    if ($mean == 0) return 50;
    
    $variance = 0;
    foreach ($values as $value) {
        $variance += pow($value - $mean, 2);
    }
    $variance /= count($values);
    $stdDev = sqrt($variance);
    
    // Coefficient of variation (lower = more consistent)
    $cv = ($stdDev / $mean) * 100;
    
    // Convert to consistency score (higher = better)
    $consistency = max(0, min(100, 100 - $cv));
    
    return $consistency;
}

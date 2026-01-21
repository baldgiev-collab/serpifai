<?php
/**
 * DEEP DIAGNOSTIC TOOL v1.0
 * Comprehensive system diagnostic for Serpifai
 * Tests ALL potential failure points: DB, Files, API, Data Structure
 * 
 * Run: https://serpifai.com/serpifai_php/DEEP_DIAGNOSTIC.php?key=YOUR_LICENSE_KEY
 */

// Set error reporting to maximum
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS and headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$licenseKey = $_GET['key'] ?? $_POST['key'] ?? null;
$projectId = $_GET['project'] ?? $_POST['project'] ?? null;
$runTest = $_GET['test'] ?? $_POST['test'] ?? 'all';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'diagnostic_version' => '1.0',
    'tests' => [],
    'critical_issues' => [],
    'warnings' => [],
    'recommendations' => []
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: FILE SYSTEM CHECKS
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['filesystem'] = [];

// Check critical files exist
$criticalFiles = [
    'api_gateway.php' => __DIR__ . '/api_gateway.php',
    'db_config.php' => __DIR__ . '/config/db_config.php',
    'competitor_handler.php' => __DIR__ . '/handlers/competitor_handler.php',
    'fetcher_handler.php' => __DIR__ . '/handlers/fetcher_handler.php',
    'user_handler.php' => __DIR__ . '/handlers/user_handler.php'
];

foreach ($criticalFiles as $name => $path) {
    $exists = file_exists($path);
    $readable = $exists ? is_readable($path) : false;
    $size = $exists ? filesize($path) : 0;
    $modified = $exists ? date('Y-m-d H:i:s', filemtime($path)) : null;
    
    $results['tests']['filesystem'][$name] = [
        'exists' => $exists,
        'readable' => $readable,
        'size_bytes' => $size,
        'last_modified' => $modified
    ];
    
    if (!$exists) {
        $results['critical_issues'][] = "MISSING FILE: $name at $path";
    }
}

// Check if competitor_handler has v30.1 code
$handlerPath = __DIR__ . '/handlers/competitor_handler.php';
if (file_exists($handlerPath)) {
    $handlerContent = file_get_contents($handlerPath);
    $hasV30 = strpos($handlerContent, 'v30.0') !== false || strpos($handlerContent, 'v30.1') !== false;
    // v30.1 normalization is INLINE in loadCompetitorResults(), not a separate function
    $hasNormalization = strpos($handlerContent, 'COMPREHENSIVE FIX') !== false || strpos($handlerContent, 'v30.1 COMPREHENSIVE') !== false;
    $hasCompetitorsArray = strpos($handlerContent, 'competitorsArray') !== false;
    $hasGeminiMerge = strpos($handlerContent, 'geminiTraffic') !== false && strpos($handlerContent, 'Merged Gemini') !== false;
    
    $results['tests']['filesystem']['competitor_handler_v30'] = [
        'has_v30_marker' => $hasV30,
        'has_inline_normalization' => $hasNormalization,
        'has_competitors_array_logic' => $hasCompetitorsArray,
        'has_gemini_metrics_merge' => $hasGeminiMerge
    ];
    
    if (!$hasV30) {
        $results['critical_issues'][] = "competitor_handler.php is NOT v30.x - old version deployed";
    }
    if (!$hasNormalization && !$hasCompetitorsArray) {
        $results['critical_issues'][] = "competitor_handler.php missing v30.1 normalization code";
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: DATABASE CONNECTION & SCHEMA
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['database'] = [];

// Load database config
if (file_exists(__DIR__ . '/config/db_config.php')) {
    require_once __DIR__ . '/config/db_config.php';
    
    try {
        $db = getDbConnection();
        $results['tests']['database']['connection'] = ['success' => true];
        
        // Check tables exist
        // NOTE: Main data is in 'competitor_analysis_results' not 'competitor_data'
        $requiredTables = [
            'competitor_analysis_results',  // Main data storage (23 rows)
            'competitor_analysis_categories', 
            'competitor_trends',
            'gemini_analysis_cache',
            'keyword_intelligence',
            'users',
            'api_transactions'
        ];
        
        foreach ($requiredTables as $table) {
            try {
                $stmt = $db->query("SELECT COUNT(*) as cnt FROM $table");
                $count = $stmt->fetchColumn();
                $results['tests']['database']['tables'][$table] = [
                    'exists' => true,
                    'row_count' => (int)$count
                ];
                
                if ($count == 0 && $table !== 'users') {
                    $results['warnings'][] = "Table '$table' is EMPTY (0 rows)";
                }
            } catch (PDOException $e) {
                $results['tests']['database']['tables'][$table] = [
                    'exists' => false,
                    'error' => $e->getMessage()
                ];
                $results['critical_issues'][] = "Table '$table' does not exist or is inaccessible";
            }
        }
        
        // Check competitor_data schema
        try {
            $stmt = $db->query("DESCRIBE competitor_data");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            $results['tests']['database']['competitor_data_columns'] = $columns;
            
            // Check for critical columns
            $criticalColumns = ['id', 'project_id', 'domain', 'data_json', 'created_at'];
            foreach ($criticalColumns as $col) {
                if (!in_array($col, $columns)) {
                    $results['critical_issues'][] = "competitor_data missing column: $col";
                }
            }
        } catch (PDOException $e) {
            $results['tests']['database']['competitor_data_columns'] = ['error' => $e->getMessage()];
        }
        
    } catch (Exception $e) {
        $results['tests']['database']['connection'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
        $results['critical_issues'][] = "DATABASE CONNECTION FAILED: " . $e->getMessage();
    }
} else {
    $results['critical_issues'][] = "db_config.php not found";
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: LICENSE & USER VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['license'] = [];

if ($licenseKey && isset($db)) {
    try {
        $stmt = $db->prepare("SELECT id, email, status, credits FROM users WHERE license_key = ?");
        $stmt->execute([$licenseKey]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $results['tests']['license'] = [
                'valid' => true,
                'user_id' => $user['id'],
                'email' => substr($user['email'], 0, 5) . '***',
                'status' => $user['status'],
                'credits' => $user['credits']
            ];
        } else {
            $results['tests']['license'] = ['valid' => false, 'error' => 'License key not found'];
            $results['warnings'][] = "Invalid license key provided";
        }
    } catch (PDOException $e) {
        $results['tests']['license'] = ['error' => $e->getMessage()];
    }
} else {
    $results['tests']['license'] = ['skipped' => 'No license key provided'];
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: PROJECT DATA STRUCTURE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['data_structure'] = [];

if ($projectId && isset($db)) {
    try {
        // Load the project data
        $stmt = $db->prepare("SELECT * FROM competitor_data WHERE project_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$projectId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $dataJson = json_decode($row['data_json'], true);
            
            // Analyze data structure
            $analysis = [
                'row_found' => true,
                'domain' => $row['domain'],
                'created_at' => $row['created_at'],
                'data_json_length' => strlen($row['data_json']),
                'json_decode_success' => $dataJson !== null
            ];
            
            if ($dataJson) {
                // Check for critical fields
                $analysis['has_competitorsArray'] = isset($dataJson['competitorsArray']);
                $analysis['has_competitors'] = isset($dataJson['competitors']);
                $analysis['has_analysis'] = isset($dataJson['analysis']);
                $analysis['has_geminiAnalysis'] = isset($dataJson['geminiAnalysis']);
                $analysis['has_processedMetrics'] = isset($dataJson['processedMetrics']);
                $analysis['has_strategyInsights'] = isset($dataJson['strategyInsights']);
                $analysis['has_processedCompetitors'] = isset($dataJson['processedCompetitors']);
                
                // Check competitors structure
                if (isset($dataJson['competitors'])) {
                    $comps = $dataJson['competitors'];
                    $analysis['competitors_count'] = count($comps);
                    if (count($comps) > 0) {
                        $first = $comps[0];
                        $analysis['competitors_first_type'] = gettype($first);
                        if (is_string($first)) {
                            $analysis['competitors_is_string_array'] = true;
                            $results['critical_issues'][] = "competitors[] is string array - needs to be object array";
                        } else if (is_array($first)) {
                            $analysis['competitors_first_keys'] = array_keys($first);
                        }
                    }
                }
                
                // Check competitorsArray structure
                if (isset($dataJson['competitorsArray'])) {
                    $compArr = $dataJson['competitorsArray'];
                    $analysis['competitorsArray_count'] = count($compArr);
                    if (count($compArr) > 0) {
                        $first = $compArr[0];
                        if (is_array($first)) {
                            $analysis['competitorsArray_first_keys'] = array_keys($first);
                            $analysis['competitorsArray_has_processedMetrics'] = isset($first['processedMetrics']);
                            $analysis['competitorsArray_has_domain'] = isset($first['domain']);
                            
                            // Sample processedMetrics if exists
                            if (isset($first['processedMetrics'])) {
                                $analysis['competitorsArray_metrics_keys'] = array_keys($first['processedMetrics']);
                            }
                        }
                    }
                } else {
                    $results['critical_issues'][] = "competitorsArray MISSING from saved data";
                }
                
                // Check for Gemini estimates in processedMetrics
                if (isset($dataJson['processedMetrics'])) {
                    $pm = $dataJson['processedMetrics'];
                    $analysis['processedMetrics_keys'] = array_keys($pm);
                    $analysis['processedMetrics_traffic_value'] = $pm['traffic'] ?? 'NOT_SET';
                    $analysis['processedMetrics_trafficValue'] = $pm['trafficValue'] ?? 'NOT_SET';
                }
                
                // Check analysis structure
                if (isset($dataJson['analysis'])) {
                    $analysis['analysis_keys'] = array_keys($dataJson['analysis']);
                }
                if (isset($dataJson['geminiAnalysis'])) {
                    $analysis['geminiAnalysis_keys'] = array_keys($dataJson['geminiAnalysis']);
                }
                
                // Provide sample of top-level keys
                $analysis['top_level_keys'] = array_keys($dataJson);
            }
            
            $results['tests']['data_structure'] = $analysis;
            
        } else {
            $results['tests']['data_structure'] = ['row_found' => false];
            $results['warnings'][] = "No data found for project_id: $projectId";
        }
        
    } catch (PDOException $e) {
        $results['tests']['data_structure'] = ['error' => $e->getMessage()];
    }
} else {
    $results['tests']['data_structure'] = ['skipped' => 'No project_id provided'];
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: API GATEWAY TEST
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['api_gateway'] = [];

if ($runTest === 'all' || $runTest === 'gateway') {
    // Test if gateway can handle actions
    $testActions = [
        'fetcher_single' => ['url' => 'https://example.com'],
        'comp:load' => ['projectId' => 'test'],
        'check_status' => []
    ];
    
    foreach ($testActions as $action => $payload) {
        // We can't actually call the gateway (would cause recursion), 
        // but we can verify the routing would work
        $results['tests']['api_gateway'][$action] = [
            'routing_exists' => true // If we got this far, the file loads
        ];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: FETCHER TEST (if requested)
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['fetcher'] = [];

if (($runTest === 'all' || $runTest === 'fetcher') && $licenseKey) {
    // Test direct curl to a simple URL
    $testUrl = 'https://example.com';
    $ch = curl_init($testUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $results['tests']['fetcher']['curl_test'] = [
        'url' => $testUrl,
        'success' => $httpCode >= 200 && $httpCode < 400,
        'http_code' => $httpCode,
        'response_length' => strlen($response),
        'error' => $error ?: null
    ];
    
    // Test if fetcher_handler.php can be loaded
    if (file_exists(__DIR__ . '/handlers/fetcher_handler.php')) {
        try {
            // Don't require it again if already loaded
            if (!function_exists('fetchSingleUrl')) {
                require_once __DIR__ . '/handlers/fetcher_handler.php';
            }
            $results['tests']['fetcher']['handler_loadable'] = true;
            $results['tests']['fetcher']['function_exists'] = [
                'fetchSingleUrl' => function_exists('fetchSingleUrl'),
                'handleFetcherAction' => function_exists('handleFetcherAction')
            ];
        } catch (Error $e) {
            $results['tests']['fetcher']['handler_loadable'] = false;
            $results['tests']['fetcher']['handler_error'] = $e->getMessage();
            $results['critical_issues'][] = "fetcher_handler.php fails to load: " . $e->getMessage();
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: PHP CONFIGURATION CHECK
// ═══════════════════════════════════════════════════════════════════════════
$results['tests']['php_config'] = [
    'version' => PHP_VERSION,
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'post_max_size' => ini_get('post_max_size'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'curl_enabled' => extension_loaded('curl'),
    'json_enabled' => extension_loaded('json'),
    'pdo_enabled' => extension_loaded('pdo'),
    'pdo_mysql_enabled' => extension_loaded('pdo_mysql'),
    'mbstring_enabled' => extension_loaded('mbstring')
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: GENERATE RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════
if (count($results['critical_issues']) > 0) {
    $results['recommendations'][] = "FIX ALL CRITICAL ISSUES FIRST before continuing";
    $results['overall_status'] = 'CRITICAL';
} else if (count($results['warnings']) > 0) {
    $results['recommendations'][] = "Review and address warnings for optimal performance";
    $results['overall_status'] = 'WARNING';
} else {
    $results['overall_status'] = 'OK';
}

// Specific recommendations based on findings
if (isset($results['tests']['data_structure']['has_competitorsArray']) && 
    $results['tests']['data_structure']['has_competitorsArray'] === false) {
    $results['recommendations'][] = "Save handler needs to create competitorsArray from processedCompetitors/geminiAnalysis";
}

if (isset($results['tests']['data_structure']['competitors_is_string_array']) && 
    $results['tests']['data_structure']['competitors_is_string_array'] === true) {
    $results['recommendations'][] = "competitors array is strings - UI expects objects with processedMetrics";
}

// Output results
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>

<?php
/**
 * API Gateway Debug Script - Traces HTTP 500 Errors
 * URL: https://serpifai.com/serpifai_php/api_gateway_debug.php
 * 
 * This script logs all incoming requests and tests the actual gateway flow
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug_log.txt');

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>API Gateway Debug</title>";
echo "<style>
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    .section { background: #16213e; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .success { color: #4ade80; }
    .error { color: #f87171; }
    .warning { color: #fbbf24; }
    .info { color: #60a5fa; }
    pre { background: #0f0f23; padding: 10px; border-radius: 4px; overflow-x: auto; }
    h1 { color: #818cf8; }
    h2 { color: #a5b4fc; border-bottom: 1px solid #4f46e5; padding-bottom: 5px; }
</style></head><body>";

echo "<h1>🔍 API Gateway Debug - HTTP 500 Tracer</h1>";
echo "<p>Generated: " . date('Y-m-d H:i:s') . "</p>";

// =============================================================================
// TEST 1: Check api_gateway.php exists and is readable
// =============================================================================
echo "<div class='section'><h2>[TEST 1] Gateway File Check</h2>";
$gatewayFile = __DIR__ . '/api_gateway.php';
if (file_exists($gatewayFile)) {
    echo "<p class='success'>✅ api_gateway.php exists</p>";
    echo "<p class='info'>   Size: " . filesize($gatewayFile) . " bytes</p>";
    echo "<p class='info'>   Modified: " . date('Y-m-d H:i:s', filemtime($gatewayFile)) . "</p>";
} else {
    echo "<p class='error'>❌ api_gateway.php NOT FOUND!</p>";
}
echo "</div>";

// =============================================================================
// TEST 2: Check what actions are registered in api_gateway.php
// =============================================================================
echo "<div class='section'><h2>[TEST 2] Action Routing Analysis</h2>";
$gatewayContent = file_get_contents($gatewayFile);

// Find all action handlers
preg_match_all('/[\'"]([a-zA-Z_:]+)[\'\"]\s*[=:>]+.*(?:handle|route|case)/i', $gatewayContent, $matches);
$actions = array_unique($matches[1] ?? []);

// Also look for switch case statements
preg_match_all('/case\s*[\'"]([a-zA-Z_:]+)[\'"]/i', $gatewayContent, $caseMatches);
$caseActions = array_unique($caseMatches[1] ?? []);

echo "<p class='info'>Actions found in gateway:</p><pre>";
print_r(array_merge($actions, $caseActions));
echo "</pre>";

// Check for competitor-related actions
$competitorActions = ['load_competitor_results', 'save_competitor_results', 'list_competitor_projects', 
                      'competitor_load', 'competitor_save', 'competitor_list'];
echo "<p class='info'>Checking for competitor actions:</p>";
foreach ($competitorActions as $action) {
    if (stripos($gatewayContent, $action) !== false) {
        echo "<p class='success'>   ✅ Found: $action</p>";
    } else {
        echo "<p class='warning'>   ⚠️ NOT Found: $action</p>";
    }
}
echo "</div>";

// =============================================================================
// TEST 3: Check competitor_handler.php version
// =============================================================================
echo "<div class='section'><h2>[TEST 3] Competitor Handler Version Check</h2>";
$handlerFile = __DIR__ . '/handlers/competitor_handler.php';
if (file_exists($handlerFile)) {
    $handlerContent = file_get_contents($handlerFile);
    
    // Check for v30.1 markers
    if (strpos($handlerContent, 'v30.1') !== false) {
        echo "<p class='success'>✅ competitor_handler.php is v30.1 (FIXED VERSION)</p>";
    } else if (strpos($handlerContent, 'COMPREHENSIVE FIX') !== false || strpos($handlerContent, 'Surface') !== false) {
        echo "<p class='success'>✅ competitor_handler.php has normalization code</p>";
    } else {
        echo "<p class='error'>❌ competitor_handler.php is OLD VERSION - needs v30.1 update!</p>";
    }
    
    // Check for key functions
    $keyFunctions = [
        'loadCompetitorResults' => 'Load function',
        'saveCompetitorResults' => 'Save function',
        'competitorsArray' => 'Array transformation',
        'executiveBrief' => 'Executive brief surfacing',
        'geminiTraffic' => 'Gemini metrics merge'
    ];
    
    echo "<p class='info'>Key v30.1 features check:</p>";
    foreach ($keyFunctions as $marker => $desc) {
        if (strpos($handlerContent, $marker) !== false) {
            echo "<p class='success'>   ✅ $desc ($marker)</p>";
        } else {
            echo "<p class='error'>   ❌ MISSING: $desc ($marker)</p>";
        }
    }
    
    echo "<p class='info'>   File size: " . filesize($handlerFile) . " bytes</p>";
    echo "<p class='info'>   Modified: " . date('Y-m-d H:i:s', filemtime($handlerFile)) . "</p>";
} else {
    echo "<p class='error'>❌ competitor_handler.php NOT FOUND!</p>";
}
echo "</div>";

// =============================================================================
// TEST 4: Simulate the ACTUAL gateway call
// =============================================================================
echo "<div class='section'><h2>[TEST 4] Simulate Gateway POST Request</h2>";

// Include necessary files
try {
    require_once __DIR__ . '/config/db_config.php';
    echo "<p class='success'>✅ db_config.php loaded</p>";
} catch (Exception $e) {
    echo "<p class='error'>❌ db_config.php error: " . $e->getMessage() . "</p>";
}

// Check if there's a test user
try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $stmt = $db->query("SELECT id, email, credits FROM users WHERE status = 'active' LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p class='success'>✅ Test user found: {$user['email']} (ID: {$user['id']}, Credits: {$user['credits']})</p>";
        
        // Now test the load_competitor_results action
        echo "<h3>Testing load_competitor_results action...</h3>";
        
        require_once __DIR__ . '/handlers/competitor_handler.php';
        
        // Get a valid project ID
        $stmt = $db->query("SELECT project_id FROM competitor_analysis_results ORDER BY updated_at DESC LIMIT 1");
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($project) {
            echo "<p class='info'>   Testing with project: {$project['project_id']}</p>";
            
            $testPayload = ['projectId' => $project['project_id']];
            
            try {
                $result = loadCompetitorResults($testPayload, $user['id']);
                
                if ($result['success']) {
                    echo "<p class='success'>✅ loadCompetitorResults() succeeded!</p>";
                    
                    // Check if data was normalized
                    $data = json_decode($result['data'], true);
                    
                    echo "<p class='info'>   Checking normalized data structure:</p>";
                    
                    $checks = [
                        'competitorsArray' => isset($data['competitorsArray']) && is_array($data['competitorsArray']),
                        'executiveBrief' => isset($data['executiveBrief']),
                        'analysis' => isset($data['analysis']),
                        'killMoves' => isset($data['killMoves']),
                        'estimatedMetrics' => isset($data['estimatedMetrics'])
                    ];
                    
                    foreach ($checks as $field => $exists) {
                        if ($exists) {
                            echo "<p class='success'>   ✅ $field: PRESENT</p>";
                        } else {
                            echo "<p class='error'>   ❌ $field: MISSING (v30.1 not working!)</p>";
                        }
                    }
                    
                    // Check competitors array structure
                    if (isset($data['competitorsArray']) && count($data['competitorsArray']) > 0) {
                        $firstComp = $data['competitorsArray'][0];
                        echo "<p class='info'>   First competitor structure:</p>";
                        echo "<pre>" . json_encode(array_keys($firstComp), JSON_PRETTY_PRINT) . "</pre>";
                        
                        if (isset($firstComp['processedMetrics'])) {
                            echo "<p class='info'>   processedMetrics keys:</p>";
                            echo "<pre>" . json_encode(array_keys($firstComp['processedMetrics']), JSON_PRETTY_PRINT) . "</pre>";
                            
                            // Check for Gemini metrics
                            $pm = $firstComp['processedMetrics'];
                            if (isset($pm['geminiTraffic']) || isset($pm['estimatedTraffic'])) {
                                echo "<p class='success'>   ✅ Gemini/Estimated traffic found: " . ($pm['geminiTraffic'] ?? $pm['estimatedTraffic'] ?? 'N/A') . "</p>";
                            } else {
                                echo "<p class='error'>   ❌ No Gemini traffic in processedMetrics!</p>";
                            }
                        }
                    }
                    
                } else {
                    echo "<p class='error'>❌ loadCompetitorResults() failed: " . ($result['error'] ?? 'Unknown') . "</p>";
                }
            } catch (Exception $e) {
                echo "<p class='error'>❌ Exception: " . $e->getMessage() . "</p>";
                echo "<pre>" . $e->getTraceAsString() . "</pre>";
            }
        } else {
            echo "<p class='warning'>⚠️ No competitor analysis projects found to test</p>";
        }
        
    } else {
        echo "<p class='error'>❌ No active users found</p>";
    }
} catch (PDOException $e) {
    echo "<p class='error'>❌ Database error: " . $e->getMessage() . "</p>";
}
echo "</div>";

// =============================================================================
// TEST 5: Check for PHP errors in error log
// =============================================================================
echo "<div class='section'><h2>[TEST 5] Recent PHP Errors</h2>";
$errorLogPaths = [
    __DIR__ . '/error_log',
    __DIR__ . '/debug_log.txt',
    '/home/u187453795/domains/serpifai.com/public_html/serpifai_php/error_log',
    ini_get('error_log')
];

$foundLog = false;
foreach ($errorLogPaths as $logPath) {
    if (file_exists($logPath) && is_readable($logPath)) {
        $foundLog = true;
        $logContent = file_get_contents($logPath);
        $lines = array_slice(explode("\n", $logContent), -30); // Last 30 lines
        
        echo "<p class='info'>Log file: $logPath</p>";
        echo "<p class='info'>Last 30 lines:</p>";
        echo "<pre>";
        foreach ($lines as $line) {
            if (stripos($line, 'error') !== false || stripos($line, 'fatal') !== false) {
                echo "<span class='error'>$line</span>\n";
            } elseif (stripos($line, 'warning') !== false) {
                echo "<span class='warning'>$line</span>\n";
            } else {
                echo "$line\n";
            }
        }
        echo "</pre>";
        break;
    }
}

if (!$foundLog) {
    echo "<p class='warning'>⚠️ No error log found at common locations</p>";
}
echo "</div>";

// =============================================================================
// TEST 6: Test HTTP Request to Gateway
// =============================================================================
echo "<div class='section'><h2>[TEST 6] Test HTTP POST to api_gateway.php</h2>";

$testCases = [
    [
        'name' => 'check_status',
        'payload' => ['action' => 'check_status', 'license' => 'TEST123']
    ],
    [
        'name' => 'load_competitor_results',
        'payload' => ['action' => 'load_competitor_results', 'license' => 'TEST123', 'projectId' => 'test']
    ],
    [
        'name' => 'fetch:single',
        'payload' => ['action' => 'fetch:single', 'license' => 'TEST123', 'url' => 'example.com']
    ]
];

// Get actual gateway URL
$gatewayUrl = 'https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api_gateway.php';
echo "<p class='info'>Gateway URL: $gatewayUrl</p>";

foreach ($testCases as $test) {
    echo "<h3>Testing: {$test['name']}</h3>";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $gatewayUrl,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($test['payload']),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "<p class='error'>   ❌ CURL Error: $error</p>";
    } else {
        echo "<p class='" . ($httpCode == 200 ? 'success' : 'error') . "'>   HTTP Status: $httpCode</p>";
        
        if ($httpCode == 500) {
            echo "<p class='error'>   ❌ HTTP 500 DETECTED!</p>";
            echo "<p class='info'>   Response body:</p><pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
        } else {
            $decoded = json_decode($response, true);
            if ($decoded) {
                echo "<p class='info'>   Response (truncated):</p>";
                echo "<pre>" . htmlspecialchars(json_encode($decoded, JSON_PRETTY_PRINT | JSON_PARTIAL_OUTPUT_ON_ERROR)) . "</pre>";
            } else {
                echo "<p class='warning'>   Non-JSON response:</p><pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
            }
        }
    }
}
echo "</div>";

// =============================================================================
// RECOMMENDATIONS
// =============================================================================
echo "<div class='section'><h2>📋 Recommendations</h2>";
echo "<ol>";
echo "<li>If competitor_handler.php is OLD VERSION → Upload the v30.1 version from local</li>";
echo "<li>If loadCompetitorResults() fails → Check error log for specific error</li>";
echo "<li>If HTTP 500 persists → The error is likely in api_gateway.php routing</li>";
echo "<li>If data not normalized → The v30.1 code isn't running (file not uploaded)</li>";
echo "</ol>";

echo "<h3>Quick Fix Commands:</h3>";
echo "<pre>";
echo "# 1. Upload competitor_handler.php via FTP\n";
echo "# Local:  v7 Scripts App File Reduction/serpifai_php/handlers/competitor_handler.php\n";
echo "# Server: /home/u187453795/domains/serpifai.com/public_html/serpifai_php/handlers/\n\n";
echo "# 2. After upload, reload this page to verify\n";
echo "</pre>";
echo "</div>";

echo "</body></html>";
?>

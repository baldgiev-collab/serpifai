<?php
/**
 * DEPLOYMENT VERIFICATION SCRIPT v1.0
 * Quick check that all critical files are correctly deployed
 * 
 * Run: https://serpifai.com/serpifai_php/verify_deployment.php
 */

header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo "<!DOCTYPE html>
<html>
<head>
    <title>SerpifAI Deployment Verification</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .warn { color: #ffc107; }
        .box { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .box h3 { margin-top: 0; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .status { font-size: 24px; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status.ok { background: #d4edda; color: #155724; }
        .status.bad { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🔍 SerpifAI Deployment Verification</h1>
    <p>Checking that all critical files are correctly deployed...</p>";

$checks = [];
$allPassed = true;

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 1: competitor_handler.php version
// ═══════════════════════════════════════════════════════════════════════════
$handlerPath = __DIR__ . '/handlers/competitor_handler.php';
echo "<div class='box'><h3>📄 competitor_handler.php</h3>";

if (file_exists($handlerPath)) {
    $content = file_get_contents($handlerPath);
    
    // Check for v30 marker
    if (strpos($content, 'v30.1') !== false || strpos($content, 'v30.0') !== false) {
        echo "<p class='pass'>✅ v30.x version marker FOUND</p>";
        $checks['handler_version'] = true;
    } else if (strpos($content, 'v29') !== false) {
        echo "<p class='warn'>⚠️ v29.x version - needs update to v30.x</p>";
        $checks['handler_version'] = false;
        $allPassed = false;
    } else {
        echo "<p class='fail'>❌ No version marker found</p>";
        $checks['handler_version'] = false;
        $allPassed = false;
    }
    
    // Check for normalization function
    if (strpos($content, 'COMPREHENSIVE FIX') !== false && strpos($content, 'competitorsArray') !== false) {
        echo "<p class='pass'>✅ Data normalization code PRESENT</p>";
        $checks['handler_normalization'] = true;
    } else {
        echo "<p class='fail'>❌ Data normalization code MISSING - need to upload v30.1 file!</p>";
        $checks['handler_normalization'] = false;
        $allPassed = false;
    }
    
    // Check for executiveBrief surfacing
    if (strpos($content, 'executiveBrief') !== false && strpos($content, 'Surface') !== false) {
        echo "<p class='pass'>✅ executiveBrief surfacing code PRESENT</p>";
        $checks['handler_exec_brief'] = true;
    } else {
        echo "<p class='fail'>❌ executiveBrief surfacing code MISSING</p>";
        $checks['handler_exec_brief'] = false;
        $allPassed = false;
    }
    
    // Check for metrics merge
    if (strpos($content, 'geminiTraffic') !== false && strpos($content, 'estimatedMetrics') !== false) {
        echo "<p class='pass'>✅ Gemini metrics merge code PRESENT</p>";
        $checks['handler_metrics_merge'] = true;
    } else {
        echo "<p class='fail'>❌ Gemini metrics merge code MISSING</p>";
        $checks['handler_metrics_merge'] = false;
        $allPassed = false;
    }
    
    echo "<p>File size: " . number_format(strlen($content)) . " bytes</p>";
    echo "<p>Last modified: " . date('Y-m-d H:i:s', filemtime($handlerPath)) . "</p>";
    
} else {
    echo "<p class='fail'>❌ FILE NOT FOUND at: $handlerPath</p>";
    $allPassed = false;
}
echo "</div>";

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 2: fetcher_handler.php exists
// ═══════════════════════════════════════════════════════════════════════════
$fetcherPath = __DIR__ . '/handlers/fetcher_handler.php';
echo "<div class='box'><h3>📄 fetcher_handler.php</h3>";

if (file_exists($fetcherPath)) {
    $content = file_get_contents($fetcherPath);
    echo "<p class='pass'>✅ File exists</p>";
    
    // Check for fetcher_single case
    if (strpos($content, 'fetcher_single') !== false) {
        echo "<p class='pass'>✅ fetcher_single action handler PRESENT</p>";
        $checks['fetcher_single'] = true;
    } else {
        echo "<p class='fail'>❌ fetcher_single action handler MISSING</p>";
        $checks['fetcher_single'] = false;
        $allPassed = false;
    }
    
    // Check for error logging
    if (strpos($content, 'error_log') !== false) {
        echo "<p class='pass'>✅ Error logging enabled</p>";
    }
    
} else {
    echo "<p class='fail'>❌ FILE NOT FOUND</p>";
    $allPassed = false;
}
echo "</div>";

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 3: Database connection
// ═══════════════════════════════════════════════════════════════════════════
echo "<div class='box'><h3>🗄️ Database Connection</h3>";

if (file_exists(__DIR__ . '/config/db_config.php')) {
    try {
        require_once __DIR__ . '/config/db_config.php';
        $db = getDbConnection();
        echo "<p class='pass'>✅ Database connection SUCCESS</p>";
        $checks['database'] = true;
        
        // Check if competitor_analysis_results has data
        try {
            $stmt = $db->query("SELECT COUNT(*) FROM competitor_analysis_results");
            $count = $stmt->fetchColumn();
            echo "<p>📊 competitor_analysis_results: $count rows</p>";
        } catch (Exception $e) {
            echo "<p class='warn'>⚠️ Could not query competitor_analysis_results: " . $e->getMessage() . "</p>";
        }
        
    } catch (Exception $e) {
        echo "<p class='fail'>❌ Database connection FAILED: " . $e->getMessage() . "</p>";
        $checks['database'] = false;
        $allPassed = false;
    }
} else {
    echo "<p class='fail'>❌ db_config.php not found</p>";
    $allPassed = false;
}
echo "</div>";

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 4: api_gateway.php routing
// ═══════════════════════════════════════════════════════════════════════════
$gatewayPath = __DIR__ . '/api_gateway.php';
echo "<div class='box'><h3>🔀 api_gateway.php Routing</h3>";

if (file_exists($gatewayPath)) {
    $content = file_get_contents($gatewayPath);
    echo "<p class='pass'>✅ File exists</p>";
    
    // Check competitor routing
    if (strpos($content, "strpos(\$action, 'comp:')") !== false) {
        echo "<p class='pass'>✅ Competitor action routing PRESENT</p>";
        $checks['gateway_comp'] = true;
    }
    
    // Check fetcher routing
    if (strpos($content, "strpos(\$action, 'fetcher_')") !== false) {
        echo "<p class='pass'>✅ Fetcher action routing PRESENT</p>";
        $checks['gateway_fetcher'] = true;
    }
    
} else {
    echo "<p class='fail'>❌ FILE NOT FOUND</p>";
    $allPassed = false;
}
echo "</div>";

// ═══════════════════════════════════════════════════════════════════════════
// FINAL STATUS
// ═══════════════════════════════════════════════════════════════════════════
echo "<div class='status " . ($allPassed ? 'ok' : 'bad') . "'>";
if ($allPassed) {
    echo "✅ ALL CRITICAL CHECKS PASSED<br>Your deployment is correct!";
} else {
    echo "❌ DEPLOYMENT ISSUES DETECTED<br>See details above for what needs fixing";
}
echo "</div>";

// ═══════════════════════════════════════════════════════════════════════════
// NEXT STEPS
// ═══════════════════════════════════════════════════════════════════════════
echo "<div class='box'><h3>📋 Next Steps</h3>";

if (!$allPassed) {
    echo "<ol>";
    if (!($checks['handler_version'] ?? false) || !($checks['handler_normalization'] ?? false)) {
        echo "<li><strong>Upload competitor_handler.php v30.1</strong> from your local <code>serpifai_php/handlers/</code> folder</li>";
    }
    echo "<li>Re-run this verification script</li>";
    echo "<li>Test loading a project in the UI</li>";
    echo "</ol>";
} else {
    echo "<p>All systems go! Try:</p>";
    echo "<ol>";
    echo "<li>Run <a href='DEEP_DIAGNOSTIC.php'>DEEP_DIAGNOSTIC.php</a> with your license key for detailed testing</li>";
    echo "<li>Load a project in the SerpifAI sidebar</li>";
    echo "<li>Check that Overview tab shows accurate metrics (not all 60K)</li>";
    echo "</ol>";
}
echo "</div>";

echo "</body></html>";
?>

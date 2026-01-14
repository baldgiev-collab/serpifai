<?php
/**
 * SerpifAI v6 - Health Check Endpoint
 * Monitor system status, database connection, API availability
 * Use for uptime monitoring and diagnostics
 */

require_once __DIR__ . '/config/db_config.php';

header('Content-Type: application/json');

$health = [
    'status' => 'healthy',
    'version' => '6.0.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// 1. Database Connection Check
try {
    $db = getDB();
    $health['checks']['database'] = [
        'status' => 'ok',
        'message' => 'Database connection successful'
    ];
} catch (Exception $e) {
    $health['status'] = 'unhealthy';
    $health['checks']['database'] = [
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ];
}

// 2. Check Required Tables
if ($health['checks']['database']['status'] === 'ok') {
    $requiredTables = ['users', 'projects', 'transactions', 'activity_logs', 'competitor_analyses', 'fetcher_cache', 'payment_history'];
    $missingTables = [];
    
    foreach ($requiredTables as $table) {
        try {
            $stmt = $db->query("SELECT 1 FROM $table LIMIT 1");
        } catch (Exception $e) {
            $missingTables[] = $table;
        }
    }
    
    if (empty($missingTables)) {
        $health['checks']['tables'] = [
            'status' => 'ok',
            'message' => 'All required tables exist'
        ];
    } else {
        $health['status'] = 'degraded';
        $health['checks']['tables'] = [
            'status' => 'warning',
            'message' => 'Missing tables: ' . implode(', ', $missingTables)
        ];
    }
}

// 3. Check API Keys Configuration
$apiKeys = [
    'GEMINI_API_KEY' => defined('GEMINI_API_KEY') && !empty(GEMINI_API_KEY),
    'SERPER_API_KEY' => defined('SERPER_API_KEY') && !empty(SERPER_API_KEY),
    'PAGE_SPEED_API_KEY' => defined('PAGE_SPEED_API_KEY') && !empty(PAGE_SPEED_API_KEY),
    'OPEN_PAGERANK_API_KEY' => defined('OPEN_PAGERANK_API_KEY') && !empty(OPEN_PAGERANK_API_KEY)
];

$missingKeys = array_keys(array_filter($apiKeys, function($v) { return !$v; }));

if (empty($missingKeys)) {
    $health['checks']['api_keys'] = [
        'status' => 'ok',
        'message' => 'All API keys configured',
        'keys' => array_keys($apiKeys)
    ];
} else {
    $health['status'] = 'degraded';
    $health['checks']['api_keys'] = [
        'status' => 'warning',
        'message' => 'Missing API keys: ' . implode(', ', $missingKeys)
    ];
}

// 4. Check PHP Version
$phpVersion = phpversion();
if (version_compare($phpVersion, '7.4', '>=')) {
    $health['checks']['php'] = [
        'status' => 'ok',
        'version' => $phpVersion
    ];
} else {
    $health['status'] = 'warning';
    $health['checks']['php'] = [
        'status' => 'warning',
        'version' => $phpVersion,
        'message' => 'PHP 7.4+ recommended'
    ];
}

// 5. Check Required PHP Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'curl', 'json', 'mbstring'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (empty($missingExtensions)) {
    $health['checks']['extensions'] = [
        'status' => 'ok',
        'message' => 'All required extensions loaded'
    ];
} else {
    $health['status'] = 'unhealthy';
    $health['checks']['extensions'] = [
        'status' => 'error',
        'message' => 'Missing extensions: ' . implode(', ', $missingExtensions)
    ];
}

// 6. Check Disk Space (if writable directory exists)
$cacheDir = __DIR__ . '/cache';
if (is_dir($cacheDir) && is_writable($cacheDir)) {
    $diskFree = disk_free_space($cacheDir);
    $diskTotal = disk_total_space($cacheDir);
    $diskPercent = ($diskFree / $diskTotal) * 100;
    
    if ($diskPercent > 10) {
        $health['checks']['disk'] = [
            'status' => 'ok',
            'free_space' => round($diskFree / 1024 / 1024, 2) . ' MB',
            'percent_free' => round($diskPercent, 2) . '%'
        ];
    } else {
        $health['status'] = 'warning';
        $health['checks']['disk'] = [
            'status' => 'warning',
            'free_space' => round($diskFree / 1024 / 1024, 2) . ' MB',
            'percent_free' => round($diskPercent, 2) . '%',
            'message' => 'Low disk space'
        ];
    }
}

// 7. Check File Permissions
$criticalFiles = [
    'config/db_config.php' => 0644,
    'api_gateway.php' => 0644
];

$permissionIssues = [];
foreach ($criticalFiles as $file => $expectedPerms) {
    $fullPath = __DIR__ . '/' . $file;
    if (file_exists($fullPath)) {
        $actualPerms = fileperms($fullPath) & 0777;
        if ($actualPerms != $expectedPerms) {
            $permissionIssues[] = "$file (expected " . decoct($expectedPerms) . ", got " . decoct($actualPerms) . ")";
        }
    }
}

if (empty($permissionIssues)) {
    $health['checks']['permissions'] = [
        'status' => 'ok',
        'message' => 'File permissions correct'
    ];
} else {
    $health['checks']['permissions'] = [
        'status' => 'info',
        'message' => 'Permission differences detected',
        'details' => $permissionIssues
    ];
}

// Set HTTP status code based on health
if ($health['status'] === 'healthy') {
    http_response_code(200);
} elseif ($health['status'] === 'degraded' || $health['status'] === 'warning') {
    http_response_code(200); // Still operational
} else {
    http_response_code(503); // Service unavailable
}

// Output health status
echo json_encode($health, JSON_PRETTY_PRINT);

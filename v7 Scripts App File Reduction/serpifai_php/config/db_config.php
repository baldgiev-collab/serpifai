<?php
/**
 * Database Configuration for SerpifAI v6
 * Hostinger MySQL Connection
 */

// Load environment variables from .env file
// Check both current directory and parent directory
$envPaths = [
    __DIR__ . '/.env',      // Same directory as db_config.php (config folder)
    __DIR__ . '/../.env'    // Parent directory (serpifai_php folder)
];

$envLoaded = false;
foreach ($envPaths as $envPath) {
    if (file_exists($envPath)) {
        error_log("✅ Found .env at: $envPath");
        // Safely parse .env; RAW to preserve characters, suppress warnings
        $env = @parse_ini_file($envPath, false, INI_SCANNER_RAW);
        if ($env && is_array($env)) {
            foreach ($env as $key => $value) {
                if (is_string($value)) {
                    $value = trim($value, "'\"");
                }
                $_ENV[$key] = $value;
            }
            $envLoaded = true;
            error_log("✅ Loaded " . count($env) . " environment variables from .env");
            break;
        } else {
            error_log("⚠️ Failed to parse .env at: $envPath");
            error_log("   Ensure each line is KEY=VALUE and quote values with special characters.");
        }
    }
}

if (!$envLoaded) {
    error_log("⚠️ .env file not found at any location:");
    foreach ($envPaths as $path) {
        error_log("   - $path");
    }
}

// Fallback to getenv() if values not set
$_ENV['DB_HOST'] = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
$_ENV['DB_NAME'] = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: '';
$_ENV['DB_USER'] = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: '';
$_ENV['DB_PASS'] = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';

// Database credentials (read from environment)
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? '');
define('DB_USER', $_ENV['DB_USER'] ?? '');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');
define('DB_CHARSET', 'utf8mb4');

// Validate required DB envs early to avoid misleading PDO 1045 errors
if (empty($_ENV['DB_USER']) || $_ENV['DB_PASS'] === '') {
    error_log("❌ CRITICAL: Missing database credentials from .env");
    error_log("   DB_USER: " . (empty($_ENV['DB_USER']) ? 'EMPTY' : 'SET'));
    error_log("   DB_PASS: " . ($_ENV['DB_PASS'] === '' ? 'EMPTY' : 'SET'));
    error_log("   Fix /.env (quote passwords with special characters) and redeploy.");
    // Don't throw exception here - let it fail gracefully in getDB()
}

// API Keys (read from environment - NEVER hardcode!)
define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');
define('SERPER_API_KEY', $_ENV['SERPER_API_KEY'] ?? '');
define('PAGE_SPEED_API_KEY', $_ENV['PAGE_SPEED_API_KEY'] ?? '');
define('OPEN_PAGERANK_API_KEY', $_ENV['OPEN_PAGERANK_API_KEY'] ?? '');

// Apps Script Project
define('APPS_SCRIPT_PROJECT_ID', '1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3');

// Credit pricing - Updated for Gemini 3 token usage (~20K prompt + ~65K response per stage)
define('CREDIT_COSTS', [
    // Workflow stages - Increased costs based on actual Gemini token usage
    'workflow_stage1' => 125,  // Market Position Analysis - ~85K total tokens
    'workflow_stage2' => 80,  // Competitive Intelligence - ~90K total tokens
    'workflow_stage3' => 80,  // Content Strategy - ~100K total tokens
    'workflow_stage4' => 100,  // Technical Roadmap - ~110K total tokens
    'workflow_stage5' => 60,  // Executive Summary - ~120K total tokens
    
    // Competitor analysis
    'competitor_analysis' => 60,
    'comp:elite_full' => 225,
    'comp:orchestrate' => 60,
    'comp:analyze' => 45,
    'comp:save_results' => 3,
    'comp:load_results' => 3,
    'comp:list_projects' => 3,
    'comp:delete_results' => 3,
    
    // Fetcher
    'fetcher_single' => 6,
    'fetcher_multi' => 10,
    'fetch:single' => 6,
    
    // Content generation
    'content_generate' => 45
]);

/**
 * Get database connection with reconnection support
 */
function getDB() {
    static $db = null;
    
    if ($db === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 300,  // 5 minute timeout for long operations
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET SESSION wait_timeout=300"  // Keep connection alive
            ];
            
            $db = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            // Return the actual PDO error message, not a generic one
            throw new Exception("Database error: " . $e->getMessage() . " (Code: " . $e->getCode() . ")");
        }
    } else {
        // Check if connection is still alive
        try {
            $db->query('SELECT 1');
        } catch (PDOException $e) {
            // Connection lost, reconnect
            error_log("Database connection lost, reconnecting...");
            $db = null;
            return getDB();  // Recursive call to reconnect
        }
    }
    
    return $db;
}

/**
 * Alias for backwards compatibility
 */
function getDbConnection() {
    return getDB();
}

/**
 * Log activity to database
 * v28.8: Changed to use governance_logs table (activity_logs doesn't exist)
 */
function logActivity($userId, $action, $details = []) {
    try {
        $db = getDB();
        // v28.8: Use governance_logs table instead of activity_logs
        $stmt = $db->prepare("
            INSERT INTO governance_logs (user_id, action_type, request_data, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $userId,
            $action,
            json_encode($details),
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        // Silent fail - activity logging shouldn't block main operations
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

/**
 * Send JSON response
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400, $details = []) {
    sendJSON([
        'success' => false,
        'error' => $message,
        'details' => $details
    ], $statusCode);
}
?>

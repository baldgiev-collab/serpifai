<?php
/**
 * Database Configuration for SerpifAI v6
 * Hostinger MySQL Connection
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    // Safely parse .env; RAW to preserve characters, suppress warnings
    $env = @parse_ini_file(__DIR__ . '/.env', false, INI_SCANNER_RAW);
    if ($env && is_array($env)) {
        foreach ($env as $key => $value) {
            if (is_string($value)) {
                $value = trim($value, "'\"");
            }
            $_ENV[$key] = $value;
        }
    } else {
        error_log("Failed to parse .env. Ensure each line is KEY=VALUE and quote values with special characters (e.g., DB_PASS=\"OoRB1Pz9i?H\"). Remove any PHP tags or invalid syntax.");
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
    throw new Exception("Missing database credentials from .env: DB_USER and/or DB_PASS are empty. Fix /.env (quote passwords with special characters) and redeploy.");
}

// API Keys (read from environment - NEVER hardcode!)
define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');
define('SERPER_API_KEY', $_ENV['SERPER_API_KEY'] ?? '');
define('PAGE_SPEED_API_KEY', $_ENV['PAGE_SPEED_API_KEY'] ?? '');
define('OPEN_PAGERANK_API_KEY', $_ENV['OPEN_PAGERANK_API_KEY'] ?? '');

// Apps Script Project
define('APPS_SCRIPT_PROJECT_ID', '1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3');

// Credit pricing
define('CREDIT_COSTS', [
    'workflow_stage1' => 5,
    'workflow_stage2' => 10,
    'workflow_stage3' => 15,
    'workflow_stage4' => 20,
    'workflow_stage5' => 25,
    'competitor_analysis' => 30,
    'fetcher_single' => 1,
    'fetcher_multi' => 2,
    'content_generate' => 15
]);

/**
 * Get database connection
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
            ];
            
            $db = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            // Return the actual PDO error message, not a generic one
            throw new Exception("Database error: " . $e->getMessage() . " (Code: " . $e->getCode() . ")");
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
 */
function logActivity($userId, $action, $details = []) {
    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
            VALUES (:user_id, :action, :details, :ip, NOW())
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'details' => json_encode($details),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
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

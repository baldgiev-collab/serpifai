<?php
/**
 * Quick .env Diagnostic
 * URL: https://serpifai.com/serpifai_php/test_env.php
 */

header('Content-Type: text/plain');

echo "=== .ENV FILE DIAGNOSTIC ===\n\n";

// Show current directory
echo "Current script location: " . __FILE__ . "\n";
echo "Current directory: " . __DIR__ . "\n";
echo "Document root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "\n\n";

// Check multiple possible locations
$possiblePaths = [
    __DIR__ . '/.env',
    __DIR__ . '/../.env',
    __DIR__ . '/../../.env',
    __DIR__ . '/config/.env',  // Added: config folder
    $_SERVER['DOCUMENT_ROOT'] . '/serpifai_php/.env',
    $_SERVER['DOCUMENT_ROOT'] . '/serpifai_php/config/.env',  // Added: config folder
    '/home/u187453795/domains/serpifai.com/public_html/serpifai_php/.env',
    '/home/u187453795/domains/serpifai.com/public_html/serpifai_php/config/.env',  // Added: config folder
    '/home/u187453795/domains/serpifai.com/public_html/.env'
];

echo "=== CHECKING ALL POSSIBLE LOCATIONS ===\n";
$foundPath = null;

foreach ($possiblePaths as $path) {
    $exists = file_exists($path);
    echo ($exists ? "✅" : "❌") . " $path\n";
    if ($exists && !$foundPath) {
        $foundPath = $path;
    }
}

if ($foundPath) {
    echo "\n=== FOUND .ENV FILE ===\n";
    echo "Location: $foundPath\n";
    echo "Readable: " . (is_readable($foundPath) ? "YES" : "NO") . "\n";
    echo "Size: " . filesize($foundPath) . " bytes\n";
    echo "Permissions: " . substr(sprintf('%o', fileperms($foundPath)), -4) . "\n\n";
    
    // Try to parse
    $env = @parse_ini_file($foundPath, false, INI_SCANNER_RAW);
    echo "Parse success: " . ($env ? "YES" : "NO") . "\n";
    
    if ($env) {
        echo "\nKeys found (" . count($env) . "):\n";
        foreach (array_keys($env) as $key) {
            $value = $env[$key];
            if (strpos($key, 'PASS') !== false || strpos($key, 'KEY') !== false) {
                $value = '***HIDDEN*** (len=' . strlen($value) . ')';
            }
            echo "  $key = $value\n";
        }
    } else {
        echo "\n❌ ERROR: Could not parse .env file\n";
        echo "Showing first 500 characters:\n";
        echo "---\n";
        echo substr(file_get_contents($foundPath), 0, 500);
        echo "\n---\n";
    }
} else {
    echo "\n❌ .env file NOT FOUND in any location\n";
    echo "\nPlease create .env at: /home/u187453795/domains/serpifai.com/public_html/serpifai_php/.env\n";
}

// Load db_config and check
echo "\n=== AFTER db_config.php ===\n";
try {
    require_once __DIR__ . '/config/db_config.php';
    echo "✅ db_config.php loaded successfully\n\n";
} catch (Throwable $e) {
    echo "❌ FAILED to load db_config.php\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    die();
}

echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? 'NOT SET') . "\n";
echo "DB_NAME: " . ($_ENV['DB_NAME'] ?? 'NOT SET') . "\n";
echo "DB_USER: " . ($_ENV['DB_USER'] ?? 'NOT SET') . "\n";
echo "DB_PASS: " . (empty($_ENV['DB_PASS']) ? 'EMPTY' : 'SET (len=' . strlen($_ENV['DB_PASS']) . ')') . "\n";

// Test connection
echo "\n=== DATABASE CONNECTION TEST ===\n";
try {
    $db = getDB();
    if ($db) {
        echo "✅ SUCCESS: Connected to database\n";
    } else {
        echo "❌ getDB() returned null\n";
    }
} catch (Throwable $e) {
    echo "❌ FAILED: " . $e->getMessage() . "\n";
}
?>
<?php
/**
 * Database Config Test
 * URL: https://serpifai.com/serpifai_php/test_db_config.php
 */

header('Content-Type: text/plain');

echo "=== TESTING db_config.php LOAD ===\n\n";

echo "Step 1: Check file exists...\n";
$configPath = __DIR__ . '/config/db_config.php';
if (!file_exists($configPath)) {
    die("❌ db_config.php not found at: $configPath\n");
}
echo "✅ File exists: $configPath\n\n";

echo "Step 2: Load db_config.php...\n";
try {
    require_once $configPath;
    echo "✅ db_config.php loaded successfully\n\n";
} catch (Throwable $e) {
    echo "❌ FAILED to load db_config.php\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    die();
}

echo "Step 3: Check environment variables...\n";
echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? 'NOT SET') . "\n";
echo "DB_NAME: " . ($_ENV['DB_NAME'] ?? 'NOT SET') . "\n";
echo "DB_USER: " . ($_ENV['DB_USER'] ?? 'NOT SET') . "\n";
echo "DB_PASS: " . (empty($_ENV['DB_PASS']) ? 'EMPTY' : 'SET (length: ' . strlen($_ENV['DB_PASS']) . ')') . "\n\n";

echo "Step 4: Test getDB() function...\n";
if (!function_exists('getDB')) {
    die("❌ getDB() function not defined\n");
}

try {
    $db = getDB();
    if ($db) {
        echo "✅ Database connection successful!\n";
        echo "Connection established to: " . ($_ENV['DB_NAME'] ?? 'unknown') . "\n";
    } else {
        echo "❌ getDB() returned null\n";
    }
} catch (Throwable $e) {
    echo "❌ Database connection failed\n";
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
?>

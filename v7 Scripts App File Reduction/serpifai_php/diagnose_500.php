<?php
/**
 * HTTP 500 Diagnostic Script
 * Upload this to serpifai.com/serpifai_php/ and access via browser
 * URL: https://serpifai.com/serpifai_php/diagnose_500.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "===========================================\n";
echo "SERPIFAI HTTP 500 DIAGNOSTIC\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "===========================================\n\n";

$errors = [];
$warnings = [];

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: PHP VERSION & EXTENSIONS
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 1] PHP Environment\n";
echo "   PHP Version: " . PHP_VERSION . "\n";
echo "   Extensions loaded:\n";
$required_ext = ['pdo', 'pdo_mysql', 'curl', 'json', 'dom', 'libxml', 'mbstring'];
foreach ($required_ext as $ext) {
    if (extension_loaded($ext)) {
        echo "   ✅ $ext\n";
    } else {
        echo "   ❌ $ext - MISSING!\n";
        $errors[] = "Missing PHP extension: $ext";
    }
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: FILE EXISTENCE
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 2] Required Files\n";
$files = [
    'config/db_config.php' => 'Database config',
    'lib/SecurityLayer.php' => 'Security layer',
    'handlers/fetcher_handler.php' => 'Fetcher handler (causes 500)',
    'handlers/user_handler.php' => 'User handler',
    'handlers/competitor_handler.php' => 'Competitor handler',
    'handlers/workflow_handler.php' => 'Workflow handler',
    'apis/gemini_api.php' => 'Gemini API',
    'apis/serper_api.php' => 'Serper API',
    'apis/pagespeed_api.php' => 'PageSpeed API',
    'apis/openpagerank_api.php' => 'OpenPageRank API'
];

foreach ($files as $file => $desc) {
    $fullPath = __DIR__ . '/' . $file;
    if (file_exists($fullPath)) {
        echo "   ✅ $file\n";
    } else {
        echo "   ❌ $file - MISSING!\n";
        $errors[] = "Missing file: $file ($desc)";
    }
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: DB CONFIG LOAD
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 3] Database Config Loading\n";
try {
    require_once __DIR__ . '/config/db_config.php';
    echo "   ✅ db_config.php loaded\n";
    echo "   DB_HOST: " . (defined('DB_HOST') ? DB_HOST : 'NOT DEFINED') . "\n";
    echo "   DB_NAME: " . (defined('DB_NAME') ? DB_NAME : 'NOT DEFINED') . "\n";
    echo "   DB_USER: " . (defined('DB_USER') ? (empty(DB_USER) ? 'EMPTY!' : 'SET') : 'NOT DEFINED') . "\n";
    echo "   DB_PASS: " . (defined('DB_PASS') ? (empty(DB_PASS) ? 'EMPTY!' : 'SET (hidden)') : 'NOT DEFINED') . "\n";
    
    if (empty(DB_USER)) {
        $errors[] = "DB_USER is empty - check .env file";
    }
    if (empty(DB_PASS)) {
        $warnings[] = "DB_PASS is empty - might be intentional or check .env";
    }
} catch (Exception $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
    $errors[] = "db_config.php load failed: " . $e->getMessage();
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 4] Database Connection\n";
$db = null;
try {
    $db = getDB();
    echo "   ✅ Database connected successfully\n";
    
    // Test a simple query
    $result = $db->query("SELECT 1 as test");
    if ($result) {
        echo "   ✅ Simple query works\n";
    }
} catch (Exception $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
    $errors[] = "Database connection failed: " . $e->getMessage();
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: CHECK TABLES
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 5] Database Tables\n";
if ($db) {
    $tables = ['users', 'api_transactions', 'transactions', 'projects', 'fetcher_cache'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SHOW TABLES LIKE '$table'");
            if ($stmt && $stmt->rowCount() > 0) {
                echo "   ✅ Table '$table' exists\n";
            } else {
                echo "   ⚠️ Table '$table' NOT FOUND\n";
                $warnings[] = "Table '$table' doesn't exist";
            }
        } catch (Exception $e) {
            echo "   ❌ Error checking '$table': " . $e->getMessage() . "\n";
        }
    }
} else {
    echo "   ⏩ Skipped (no DB connection)\n";
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: CREDIT_COSTS CONSTANT
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 6] Credit Costs Configuration\n";
if (defined('CREDIT_COSTS')) {
    echo "   ✅ CREDIT_COSTS defined\n";
    $costs = CREDIT_COSTS;
    echo "   - fetcher_single: " . ($costs['fetcher_single'] ?? 'NOT SET') . "\n";
    echo "   - fetch:single: " . ($costs['fetch:single'] ?? 'NOT SET') . "\n";
} else {
    echo "   ❌ CREDIT_COSTS not defined!\n";
    $errors[] = "CREDIT_COSTS constant not defined in db_config.php";
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: TEST USER AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 7] Test User Authentication\n";
if ($db) {
    try {
        $stmt = $db->prepare("SELECT id, email, credits, status FROM users WHERE status = 'active' LIMIT 1");
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            echo "   ✅ Found active user: " . $user['email'] . "\n";
            echo "   - User ID: " . $user['id'] . "\n";
            echo "   - Credits: " . $user['credits'] . "\n";
            echo "   - Status: " . $user['status'] . "\n";
        } else {
            echo "   ⚠️ No active users found\n";
            $warnings[] = "No active users in database";
        }
    } catch (Exception $e) {
        echo "   ❌ FAILED: " . $e->getMessage() . "\n";
        $errors[] = "User query failed: " . $e->getMessage();
    }
} else {
    echo "   ⏩ Skipped (no DB connection)\n";
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 8: LOAD FETCHER HANDLER
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 8] Fetcher Handler Loading\n";
try {
    require_once __DIR__ . '/handlers/fetcher_handler.php';
    echo "   ✅ fetcher_handler.php loaded\n";
    
    // Check if function exists
    if (function_exists('handleFetcherAction')) {
        echo "   ✅ handleFetcherAction() function exists\n";
    } else {
        echo "   ❌ handleFetcherAction() function NOT FOUND\n";
        $errors[] = "handleFetcherAction function not found";
    }
    
    if (function_exists('fetchSingleUrl')) {
        echo "   ✅ fetchSingleUrl() function exists\n";
    } else {
        echo "   ❌ fetchSingleUrl() function NOT FOUND\n";
        $errors[] = "fetchSingleUrl function not found";
    }
} catch (Exception $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
    $errors[] = "fetcher_handler.php load failed: " . $e->getMessage();
} catch (Error $e) {
    echo "   ❌ FATAL ERROR: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    $errors[] = "fetcher_handler.php fatal error: " . $e->getMessage();
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 9: SIMULATE FETCHER CALL (DRY RUN)
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 9] Simulate Fetcher Call\n";
if ($db && function_exists('handleFetcherAction')) {
    try {
        // Get a test user ID
        $stmt = $db->prepare("SELECT id FROM users WHERE status = 'active' LIMIT 1");
        $stmt->execute();
        $testUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($testUser) {
            echo "   Testing with user ID: " . $testUser['id'] . "\n";
            
            // Call the fetcher with a simple test URL
            $result = handleFetcherAction('fetcher_single', [
                'url' => 'https://example.com',
                'options' => ['extractMetadata' => true]
            ], 'TEST-LICENSE', $testUser['id']);
            
            if ($result['success']) {
                echo "   ✅ Fetcher call SUCCEEDED!\n";
                echo "   - Content length: " . strlen($result['data']['content'] ?? '') . " bytes\n";
            } else {
                echo "   ⚠️ Fetcher returned error: " . ($result['error'] ?? 'Unknown') . "\n";
                $warnings[] = "Fetcher returned: " . ($result['error'] ?? 'Unknown');
            }
        } else {
            echo "   ⏩ Skipped (no test user)\n";
        }
    } catch (Exception $e) {
        echo "   ❌ EXCEPTION: " . $e->getMessage() . "\n";
        echo "   File: " . $e->getFile() . "\n";
        echo "   Line: " . $e->getLine() . "\n";
        $errors[] = "Fetcher simulation failed: " . $e->getMessage();
    } catch (Error $e) {
        echo "   ❌ FATAL ERROR: " . $e->getMessage() . "\n";
        echo "   File: " . $e->getFile() . "\n";
        echo "   Line: " . $e->getLine() . "\n";
        $errors[] = "Fetcher simulation fatal: " . $e->getMessage();
    }
} else {
    echo "   ⏩ Skipped (prerequisites not met)\n";
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// TEST 10: CHECK .ENV FILE
// ═══════════════════════════════════════════════════════════════════════════
echo "[TEST 10] Environment File\n";
$envPaths = [
    __DIR__ . '/.env',
    __DIR__ . '/config/.env'
];
$envFound = false;
foreach ($envPaths as $path) {
    if (file_exists($path)) {
        echo "   ✅ .env found at: $path\n";
        $envFound = true;
        
        // Check if readable
        if (is_readable($path)) {
            echo "   ✅ .env is readable\n";
        } else {
            echo "   ❌ .env is NOT readable (permissions issue)\n";
            $errors[] = ".env file not readable";
        }
        break;
    }
}
if (!$envFound) {
    echo "   ⚠️ .env file not found in expected locations\n";
    $warnings[] = ".env file not found - using fallback values";
}
echo "\n";

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
echo "===========================================\n";
echo "DIAGNOSTIC SUMMARY\n";
echo "===========================================\n\n";

if (empty($errors)) {
    echo "✅ NO CRITICAL ERRORS FOUND\n\n";
} else {
    echo "❌ CRITICAL ERRORS (" . count($errors) . "):\n";
    foreach ($errors as $i => $err) {
        echo "   " . ($i + 1) . ". $err\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️ WARNINGS (" . count($warnings) . "):\n";
    foreach ($warnings as $i => $warn) {
        echo "   " . ($i + 1) . ". $warn\n";
    }
    echo "\n";
}

echo "===========================================\n";
echo "NEXT STEPS\n";
echo "===========================================\n";
if (!empty($errors)) {
    echo "1. Fix the critical errors listed above\n";
    echo "2. Re-run this diagnostic\n";
    echo "3. Test the actual API endpoint\n";
} else {
    echo "All tests passed! Try testing the API:\n\n";
    echo 'curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \\' . "\n";
    echo '  -H "Content-Type: application/json" \\' . "\n";
    echo '  -d \'{"action":"check_status","license":"YOUR_LICENSE_KEY"}\'' . "\n";
}
echo "\n";
?>

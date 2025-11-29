<?php
/**
 * Test Script for SerpifAI v6 Gateway
 * Run this to verify everything is working
 */

require_once __DIR__ . '/config/db_config.php';

echo "========================================\n";
echo "SERPIFAI v6 - SYSTEM TEST\n";
echo "========================================\n\n";

$errors = [];
$success = [];

// Test 1: Database Connection
echo "[TEST 1] Database Connection...\n";
try {
    $db = getDB();
    $success[] = "✅ Database connection successful";
    echo "   ✅ Connected to: " . DB_NAME . "\n\n";
} catch (Exception $e) {
    $errors[] = "❌ Database connection failed: " . $e->getMessage();
    echo "   ❌ FAILED: " . $e->getMessage() . "\n\n";
}

// Test 2: Check Tables Exist
echo "[TEST 2] Database Tables...\n";
try {
    $db = getDB();
    $tables = ['users', 'projects', 'transactions', 'activity_logs', 'competitor_analyses', 'fetcher_cache', 'payment_history'];
    
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "   ✅ Table '$table' exists\n";
        } else {
            $errors[] = "❌ Table '$table' missing";
            echo "   ❌ Table '$table' MISSING\n";
        }
    }
    $success[] = "✅ All database tables checked";
    echo "\n";
} catch (Exception $e) {
    $errors[] = "❌ Table check failed: " . $e->getMessage();
    echo "   ❌ FAILED: " . $e->getMessage() . "\n\n";
}

// Test 3: Check Test Account
echo "[TEST 3] Test Account...\n";
try {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE license_key = ?");
    $stmt->execute(['TEST-SERPIFAI-2025-666']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "   ✅ Test account found\n";
        echo "   📧 Email: " . $user['email'] . "\n";
        echo "   🔑 License: " . $user['license_key'] . "\n";
        echo "   💳 Credits: " . $user['credits'] . "\n";
        echo "   📊 Status: " . $user['status'] . "\n";
        $success[] = "✅ Test account verified";
    } else {
        $errors[] = "❌ Test account not found";
        echo "   ❌ Test account NOT FOUND\n";
        echo "   💡 Run schema.sql to create it\n";
    }
    echo "\n";
} catch (Exception $e) {
    $errors[] = "❌ Test account check failed: " . $e->getMessage();
    echo "   ❌ FAILED: " . $e->getMessage() . "\n\n";
}

// Test 4: API Keys
echo "[TEST 4] API Keys Configuration...\n";
$apiKeys = [
    'GEMINI_API_KEY' => GEMINI_API_KEY,
    'SERPER_API_KEY' => SERPER_API_KEY,
    'PAGE_SPEED_API_KEY' => PAGE_SPEED_API_KEY,
    'OPEN_PAGERANK_API_KEY' => OPEN_PAGERANK_API_KEY
];

foreach ($apiKeys as $name => $value) {
    if (!empty($value) && $value !== 'your_key_here') {
        echo "   ✅ $name configured\n";
    } else {
        $errors[] = "❌ $name not configured";
        echo "   ❌ $name NOT CONFIGURED\n";
    }
}
$success[] = "✅ API keys checked";
echo "\n";

// Test 5: Credit Cost Configuration
echo "[TEST 5] Credit Costs...\n";
$costs = CREDIT_COSTS;
echo "   💰 Workflow Stage 1: " . $costs['workflow_stage1'] . " credits\n";
echo "   💰 Workflow Stage 2: " . $costs['workflow_stage2'] . " credits\n";
echo "   💰 Competitor Analysis: " . $costs['competitor_analysis'] . " credits\n";
echo "   💰 Fetcher Single: " . $costs['fetcher_single'] . " credit\n";
$success[] = "✅ Credit costs configured";
echo "\n";

// Test 6: Create Test Transaction
echo "[TEST 6] Transaction Logging...\n";
try {
    $db = getDB();
    $testTxnId = 'TEST-' . time();
    
    $stmt = $db->prepare("
        INSERT INTO transactions (
            transaction_id, user_id, action_type, credit_cost, status, created_at
        ) VALUES (?, ?, 'test_action', 0, 'completed', NOW())
    ");
    
    // Get test user ID
    $userStmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
    $userStmt->execute(['TEST-SERPIFAI-2025-666']);
    $testUser = $userStmt->fetch();
    
    if ($testUser) {
        $stmt->execute([$testTxnId, $testUser['id']]);
        echo "   ✅ Test transaction created: $testTxnId\n";
        
        // Clean up
        $db->prepare("DELETE FROM transactions WHERE transaction_id = ?")->execute([$testTxnId]);
        echo "   ✅ Test transaction cleaned up\n";
        $success[] = "✅ Transaction logging works";
    } else {
        $errors[] = "❌ Could not create test transaction (no test user)";
        echo "   ❌ FAILED: No test user found\n";
    }
    echo "\n";
} catch (Exception $e) {
    $errors[] = "❌ Transaction test failed: " . $e->getMessage();
    echo "   ❌ FAILED: " . $e->getMessage() . "\n\n";
}

// Summary
echo "========================================\n";
echo "TEST SUMMARY\n";
echo "========================================\n\n";

echo "✅ Passed: " . count($success) . " tests\n";
foreach ($success as $s) {
    echo "   $s\n";
}

if (count($errors) > 0) {
    echo "\n❌ Failed: " . count($errors) . " tests\n";
    foreach ($errors as $e) {
        echo "   $e\n";
    }
    echo "\n🔧 Fix the errors above before deploying!\n\n";
    exit(1);
} else {
    echo "\n🎉 ALL TESTS PASSED!\n";
    echo "✅ System is ready for deployment\n\n";
    
    echo "========================================\n";
    echo "TEST ACCOUNT CREDENTIALS\n";
    echo "========================================\n\n";
    echo "📧 Email: test@serpifai.com\n";
    echo "🔑 License Key: TEST-SERPIFAI-2025-666\n";
    echo "💳 Credits: 666\n";
    echo "📊 Status: Active\n\n";
    echo "Use this license key in Google Sheets to test!\n\n";
    
    exit(0);
}
?>

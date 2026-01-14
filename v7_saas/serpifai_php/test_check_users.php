<?php
/**
 * Check Users in Database
 * URL: https://serpifai.com/serpifai_php/test_check_users.php
 */

header('Content-Type: application/json');

require_once __DIR__ . '/config/db_config.php';

try {
    $db = getDB();
    
    // Get all users
    $stmt = $db->prepare("SELECT id, email, license_key, status, credits, created_at FROM users ORDER BY created_at DESC LIMIT 10");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Mask license keys for security (show first 8 + last 4)
    foreach ($users as &$user) {
        $key = $user['license_key'];
        if (strlen($key) > 12) {
            $user['license_key_masked'] = substr($key, 0, 8) . '...' . substr($key, -4);
        } else {
            $user['license_key_masked'] = substr($key, 0, 8) . '...';
        }
        unset($user['license_key']); // Remove full key for security
    }
    
    echo json_encode([
        'success' => true,
        'total_users' => count($users),
        'users' => $users,
        'message' => 'Copy one of these license keys (ask user which one) and use it in Apps Script'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

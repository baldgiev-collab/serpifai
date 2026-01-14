<?php
/**
 * Create/Update Test User
 * URL: https://serpifai.com/serpifai_php/create_test_user.php
 */

header('Content-Type: application/json');

require_once __DIR__ . '/config/db_config.php';

try {
    $db = getDB();
    
    $email = 'baldgiev@gmail.com';
    $licenseKey = 'SERP-FAI-TEST-KEY-123456';
    $credits = 10000; // Start with 10,000 credits
    
    // Check if user exists
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? OR license_key = ?");
    $stmt->execute([$email, $licenseKey]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        // Update existing user
        $stmt = $db->prepare("
            UPDATE users 
            SET license_key = ?, 
                status = 'active', 
                credits = ?,
                updated_at = NOW()
            WHERE email = ?
        ");
        $stmt->execute([$licenseKey, $credits, $email]);
        
        echo json_encode([
            'success' => true,
            'action' => 'updated',
            'user' => [
                'id' => $existing['id'],
                'email' => $email,
                'license_key' => $licenseKey,
                'status' => 'active',
                'credits' => $credits
            ],
            'message' => 'User updated successfully'
        ], JSON_PRETTY_PRINT);
        
    } else {
        // Create new user
        $stmt = $db->prepare("
            INSERT INTO users (email, license_key, status, credits, created_at, updated_at)
            VALUES (?, ?, 'active', ?, NOW(), NOW())
        ");
        $stmt->execute([$email, $licenseKey, $credits]);
        $userId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'action' => 'created',
            'user' => [
                'id' => $userId,
                'email' => $email,
                'license_key' => $licenseKey,
                'status' => 'active',
                'credits' => $credits
            ],
            'message' => 'User created successfully'
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

<?php
/**
 * Database Column Diagnostic Tool
 * Run this file on your server to check what columns actually exist
 */

require_once __DIR__ . '/config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get users table structure
    $stmt = $db->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'table' => 'users',
        'columns' => $columns,
        'column_names' => array_column($columns, 'Field'),
        'has_credits' => in_array('credits', array_column($columns, 'Field')),
        'has_total_credits_used' => in_array('total_credits_used', array_column($columns, 'Field')),
        'has_total_credits_purchased' => in_array('total_credits_purchased', array_column($columns, 'Field'))
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

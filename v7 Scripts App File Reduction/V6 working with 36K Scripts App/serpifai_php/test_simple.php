<?php
/**
 * Minimal Gateway Test - No Database
 * URL: https://serpifai.com/serpifai_php/test_simple.php
 */

header('Content-Type: application/json');

try {
    echo json_encode([
        'success' => true,
        'message' => 'PHP is working',
        'php_version' => PHP_VERSION,
        'time' => date('Y-m-d H:i:s'),
        'file_location' => __FILE__
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

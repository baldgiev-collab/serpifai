<?php
/**
 * Absolute Minimal Gateway Test
 * URL: https://serpifai.com/serpifai_php/test_minimal_gateway.php
 */

// Capture ALL output including errors
ob_start();

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

echo json_encode([
    'success' => true,
    'message' => 'Minimal gateway working',
    'php_version' => PHP_VERSION,
    'time' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown'
]);

$output = ob_get_clean();
echo $output;
?>

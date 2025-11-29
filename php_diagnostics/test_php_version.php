<?php
/**
 * PHP Version & Configuration Diagnostics
 * Upload to: /public_html/sepifai_php/test_php_version.php
 * Test URL: https://serpifai.com/sepifai_php/test_php_version.php
 */

header('Content-Type: application/json; charset=UTF-8');

$diagnostics = [
    'php_version' => phpversion(),
    'php_sapi' => php_sapi_name(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'extensions_loaded' => [
        'mysql' => extension_loaded('mysql'),
        'mysqli' => extension_loaded('mysqli'),
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'json' => extension_loaded('json'),
        'curl' => extension_loaded('curl'),
    ],
    'server_api' => php_sapi_name(),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'display_errors' => ini_get('display_errors'),
    'error_reporting' => ini_get('error_reporting'),
    'allow_url_fopen' => ini_get('allow_url_fopen'),
    'allow_url_include' => ini_get('allow_url_include'),
    'short_open_tag' => ini_get('short_open_tag'),
    'file_uploads' => ini_get('file_uploads'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'current_dir' => __DIR__,
    'files_in_directory' => [],
    'include_path' => ini_get('include_path'),
];

// Check what files exist in current directory
$dir = __DIR__;
if (is_dir($dir)) {
    $files = scandir($dir);
    $diagnostics['files_in_directory'] = array_diff($files, ['.', '..']);
}

// Test if database.php exists
$db_file = $dir . '/database.php';
$diagnostics['database_php_exists'] = file_exists($db_file);
$diagnostics['database_php_readable'] = is_readable($db_file);

$config_file = $dir . '/config.php';
$diagnostics['config_php_exists'] = file_exists($config_file);
$diagnostics['config_php_readable'] = is_readable($config_file);

$gateway_file = $dir . '/api_gateway.php';
$diagnostics['api_gateway_php_exists'] = file_exists($gateway_file);
$diagnostics['api_gateway_php_readable'] = is_readable($gateway_file);

// Try to test database connection if possible
if (file_exists($db_file) && is_readable($db_file)) {
    $diagnostics['database_php_test'] = 'Attempting to include...';
    ob_start();
    $include_error = null;
    try {
        @include($db_file);
        $include_error = ob_get_clean();
    } catch (Throwable $e) {
        $include_error = $e->getMessage();
    }
    if ($include_error) {
        $diagnostics['database_php_error'] = $include_error;
    } else {
        $diagnostics['database_php_test'] = 'Included successfully';
    }
}

// PHP 8.2 specific checks
$diagnostics['php_82_notes'] = [
    'version' => phpversion(),
    'is_php_82_or_higher' => version_compare(phpversion(), '8.2.0', '>='),
    'breaking_changes' => [
        'mysql_* functions deprecated in PHP 5.5, removed in PHP 7.0' => 'Use mysqli or PDO',
        'split() removed in PHP 7.0' => 'Use explode() instead',
        'eregi() removed in PHP 7.0' => 'Use preg_match() instead',
        'mysql_fetch_assoc() removed in PHP 7.0' => 'Use mysqli_fetch_assoc() or PDO',
    ]
];

echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>

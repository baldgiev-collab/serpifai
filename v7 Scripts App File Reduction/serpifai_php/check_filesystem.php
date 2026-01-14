<?php
/**
 * File System Diagnostic - Check what files actually exist on server
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$result = ['checks' => [], 'timestamp' => date('Y-m-d H:i:s')];

// Check base directory
$baseDir = __DIR__;
$result['base_directory'] = $baseDir;

// Check if handlers directory exists
$handlersDir = $baseDir . '/handlers';
$result['checks'][] = [
    'name' => 'handlers directory exists',
    'path' => $handlersDir,
    'exists' => file_exists($handlersDir) && is_dir($handlersDir),
    'readable' => is_readable($handlersDir)
];

// List files in handlers directory
if (file_exists($handlersDir) && is_dir($handlersDir)) {
    $files = scandir($handlersDir);
    $result['handlers_contents'] = array_values(array_diff($files, ['.', '..']));
} else {
    $result['handlers_contents'] = 'Directory not found';
}

// Check specific handler files
$handlerFiles = [
    'user_handler.php',
    'competitor_handler.php',
    'content_handler.php',
    'fetcher_handler.php',
    'project_handler.php',
    'workflow_handler.php'
];

foreach ($handlerFiles as $file) {
    $filePath = $handlersDir . '/' . $file;
    $result['checks'][] = [
        'name' => "handlers/$file",
        'path' => $filePath,
        'exists' => file_exists($filePath),
        'readable' => file_exists($filePath) && is_readable($filePath),
        'permissions' => file_exists($filePath) ? substr(sprintf('%o', fileperms($filePath)), -4) : 'N/A'
    ];
}

// Check apis directory
$apisDir = $baseDir . '/apis';
$result['checks'][] = [
    'name' => 'apis directory exists',
    'path' => $apisDir,
    'exists' => file_exists($apisDir) && is_dir($apisDir),
    'readable' => is_readable($apisDir)
];

if (file_exists($apisDir) && is_dir($apisDir)) {
    $files = scandir($apisDir);
    $result['apis_contents'] = array_values(array_diff($files, ['.', '..']));
}

// Check lib directory
$libDir = $baseDir . '/lib';
$result['checks'][] = [
    'name' => 'lib directory exists',
    'path' => $libDir,
    'exists' => file_exists($libDir) && is_dir($libDir),
    'readable' => is_readable($libDir)
];

if (file_exists($libDir) && is_dir($libDir)) {
    $files = scandir($libDir);
    $result['lib_contents'] = array_values(array_diff($files, ['.', '..']));
}

// Check config directory
$configDir = $baseDir . '/config';
$result['checks'][] = [
    'name' => 'config directory exists',
    'path' => $configDir,
    'exists' => file_exists($configDir) && is_dir($configDir),
    'readable' => is_readable($configDir)
];

// Check PHP include path
$result['php_include_path'] = get_include_path();

// Check open_basedir restriction
$result['open_basedir'] = ini_get('open_basedir') ?: 'No restriction';

echo json_encode($result, JSON_PRETTY_PRINT);
?>
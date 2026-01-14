<?php
/**
 * SIMPLE CONNECTION TEST - NO SECURITY LAYERS
 * This bypasses all security and directly tests basic connectivity
 */

// Basic error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$result = ['tests' => [], 'timestamp' => date('Y-m-d H:i:s')];

// Test 1: Check if .env file exists
$result['tests'][] = ['name' => 'Check .env file', 'status' => 'pending'];
try {
    $envPath = __DIR__ . '/config/.env';
    if (file_exists($envPath)) {
        $result['tests'][0]['status'] = 'OK';
        $result['tests'][0]['result'] = 'File exists at: ' . $envPath;
    } else {
        throw new Exception('.env file not found at: ' . $envPath);
    }
} catch (Exception $e) {
    $result['tests'][0]['status'] = 'FAILED';
    $result['tests'][0]['error'] = $e->getMessage();
}

// Test 2: Parse .env manually
$result['tests'][] = ['name' => 'Parse .env manually', 'status' => 'pending'];
try {
    $envPath = __DIR__ . '/config/.env';
    $envContent = file_get_contents($envPath);
    $lines = explode("\n", $envContent);
    $envVars = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '"\'');
            $envVars[$key] = $value;
        }
    }
    
    $result['tests'][1]['status'] = 'OK';
    $result['tests'][1]['result'] = 'Found ' . count($envVars) . ' variables';
    $result['tests'][1]['variables'] = array_keys($envVars);
} catch (Exception $e) {
    $result['tests'][1]['status'] = 'FAILED';
    $result['tests'][1]['error'] = $e->getMessage();
}

// Test 3: Direct MySQL connection
$result['tests'][] = ['name' => 'Direct MySQL connection', 'status' => 'pending'];
try {
    // Use variables from manual parsing
    $host = $envVars['DB_HOST'] ?? 'localhost';
    $dbname = $envVars['DB_NAME'] ?? '';
    $username = $envVars['DB_USER'] ?? '';
    $password = $envVars['DB_PASS'] ?? '';
    
    if (empty($username) || empty($dbname)) {
        throw new Exception('Missing DB credentials: user=' . $username . ', db=' . $dbname);
    }
    
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $result['tests'][2]['status'] = 'OK';
    $result['tests'][2]['result'] = 'Connected to database: ' . $dbname;
    $result['tests'][2]['connection_info'] = [
        'host' => $host,
        'database' => $dbname,
        'user' => $username
    ];
    
    // Test 4: Query users table
    $result['tests'][] = ['name' => 'Query users table', 'status' => 'pending'];
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as user_count FROM users");
        $count = $stmt->fetch()['user_count'];
        
        $result['tests'][3]['status'] = 'OK';
        $result['tests'][3]['result'] = "Found $count users in database";
        
        // Get sample user data
        $stmt = $pdo->query("SELECT id, email, license_key, status, credits FROM users LIMIT 2");
        $users = $stmt->fetchAll();
        $result['tests'][3]['sample_users'] = $users;
        
    } catch (Exception $e) {
        $result['tests'][3]['status'] = 'FAILED';
        $result['tests'][3]['error'] = $e->getMessage();
    }
    
} catch (Exception $e) {
    $result['tests'][2]['status'] = 'FAILED';
    $result['tests'][2]['error'] = $e->getMessage();
    $result['tests'][2]['attempted_connection'] = [
        'host' => $host ?? 'unknown',
        'database' => $dbname ?? 'unknown',
        'user' => $username ?? 'unknown'
    ];
}

// Calculate success
$passed = 0;
$total = count($result['tests']);
foreach ($result['tests'] as $test) {
    if ($test['status'] === 'OK') $passed++;
}

$result['summary'] = [
    'passed' => $passed,
    'total' => $total,
    'success' => $passed === $total
];

// Output result
echo json_encode($result, JSON_PRETTY_PRINT);
?>
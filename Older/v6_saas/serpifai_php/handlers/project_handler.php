<?php
/**
 * Project Handler - MySQLi VERSION
 * Manages project CRUD operations with MySQLi
 * 
 * FIXED: Using MySQLi object-oriented methods (not PDO)
 * FIXED: Proper user_id FK lookups matching database schema
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Get MySQLi connection (wrapper for getDB if it returns PDO)
 */
function getMySQLiConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        error_log('[PROJECT] MySQL connection failed: ' . $conn->connect_error);
        return null;
    }
    
    $conn->set_charset('utf8mb4');
    return $conn;
}

/**
 * Save project to database
 */
function saveProject($licenseKey, $projectName, $projectData) {
    error_log('[PROJECT] saveProject called: license=' . $licenseKey . ', name=' . $projectName);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
        
        error_log('[PROJECT] Database connected successfully');
        
        // First, get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        error_log('[PROJECT] Found user ID: ' . $userId);
        
        // Check if project exists
        $stmt = $db->prepare("SELECT id FROM projects WHERE user_id = ? AND project_name = ?");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('is', $userId, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        error_log('[PROJECT] SELECT result: ' . $result->num_rows . ' rows found');
        
        $jsonData = json_encode($projectData);
        error_log('[PROJECT] JSON data length: ' . strlen($jsonData) . ' bytes');
        
        if ($result->num_rows > 0) {
            // Update existing project
            error_log('[PROJECT] Project exists, updating...');
            $row = $result->fetch_assoc();
            $projectId = $row['id'];
            $stmt->close();
            
            $stmt = $db->prepare("UPDATE projects SET project_data = ?, updated_at = NOW() WHERE id = ?");
            
            if (!$stmt) {
                error_log('[PROJECT] ERROR: Failed to prepare UPDATE: ' . $db->error);
                $db->close();
                return ['success' => false, 'error' => 'Database error: ' . $db->error];
            }
            
            $stmt->bind_param('si', $jsonData, $projectId);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log('[PROJECT] ERROR: UPDATE failed: ' . $stmt->error);
                $stmt->close();
                $db->close();
                return ['success' => false, 'error' => 'Update failed: ' . $stmt->error];
            }
            
            $stmt->close();
            $db->close();
            error_log('[PROJECT] Project updated successfully: id=' . $projectId);
            
            return [
                'success' => true,
                'message' => 'Project updated successfully',
                'projectId' => $projectId,
                'updated' => true
            ];
        } else {
            // Insert new project
            error_log('[PROJECT] Project does not exist, creating new...');
            $stmt->close();
            
            // Generate unique project_id
            $projectIdUnique = uniqid('proj_', true);
            
            $stmt = $db->prepare("INSERT INTO projects (user_id, project_id, project_name, project_data, status) VALUES (?, ?, ?, ?, 'active')");
            
            if (!$stmt) {
                error_log('[PROJECT] ERROR: Failed to prepare INSERT: ' . $db->error);
                $db->close();
                return ['success' => false, 'error' => 'Database error: ' . $db->error];
            }
            
            $stmt->bind_param('isss', $userId, $projectIdUnique, $projectName, $jsonData);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log('[PROJECT] ERROR: INSERT failed: ' . $stmt->error);
                $stmt->close();
                $db->close();
                return ['success' => false, 'error' => 'Insert failed: ' . $stmt->error];
            }
            
            $newId = $db->insert_id;
            $stmt->close();
            $db->close();
            error_log('[PROJECT] Project created successfully: id=' . $newId);
            
            return [
                'success' => true,
                'message' => 'Project created successfully',
                'projectId' => $newId,
                'created' => true
            ];
        }
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
        return [
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage()
        ];
    }
}

/**
 * Load project from database
 */
function loadProject($licenseKey, $projectName) {
    error_log('[PROJECT] loadProject called: license=' . $licenseKey . ', name=' . $projectName);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
        
        // Get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        
        // Load project
        $stmt = $db->prepare("SELECT project_data, created_at, updated_at FROM projects WHERE user_id = ? AND project_name = ? AND status = 'active'");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('is', $userId, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        error_log('[PROJECT] SELECT result: ' . $result->num_rows . ' rows found');
        
        if ($result->num_rows === 0) {
            error_log('[PROJECT] Project not found');
            $stmt->close();
            $db->close();
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        $row = $result->fetch_assoc();
        $projectData = json_decode($row['project_data'], true);
        
        $stmt->close();
        $db->close();
        error_log('[PROJECT] Project loaded successfully');
        
        return [
            'success' => true,
            'data' => $projectData,
            'metadata' => [
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ]
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in loadProject: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage()
        ];
    }
}

/**
 * List all projects for a license
 */
function listProjects($licenseKey) {
    error_log('[PROJECT] listProjects called for license=' . $licenseKey);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return ['success' => false, 'error' => 'Database connection failed'];
        }
        
        // Get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        
        // List projects
        $stmt = $db->prepare("SELECT id, project_name, created_at, updated_at FROM projects WHERE user_id = ? AND status = 'active' ORDER BY updated_at DESC");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $projects[] = [
                'name' => $row['project_name'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
        
        $stmt->close();
        $db->close();
        error_log('[PROJECT] Found ' . count($projects) . ' projects');
        
        return [
            'success' => true,
            'projects' => $projects,
            'count' => count($projects)
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in listProjects: ' . $e->getMessage());
        return ['success' => false, 'error' => 'Exception: ' . $e->getMessage()];
    }
}

/**
 * Delete project
 */
function deleteProject($licenseKey, $projectName) {
    error_log('[PROJECT] deleteProject called: license=' . $licenseKey . ', name=' . $projectName);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return ['success' => false, 'error' => 'Database connection failed'];
        }
        
        // Get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        
        // Soft delete (mark as deleted)
        $stmt = $db->prepare("UPDATE projects SET status = 'deleted', updated_at = NOW() WHERE user_id = ? AND project_name = ? AND status = 'active'");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare UPDATE: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('is', $userId, $projectName);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            error_log('[PROJECT] Project not found or already deleted');
            $stmt->close();
            $db->close();
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        $stmt->close();
        $db->close();
        error_log('[PROJECT] Project deleted successfully');
        
        return [
            'success' => true,
            'message' => 'Project deleted successfully'
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in deleteProject: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage()
        ];
    }
}

/**
 * Rename project
 */
function renameProject($licenseKey, $oldName, $newName) {
    error_log('[PROJECT] renameProject called: license=' . $licenseKey . ', old=' . $oldName . ', new=' . $newName);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return ['success' => false, 'error' => 'Database connection failed'];
        }
        
        // Get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        
        // Check if new name already exists
        $stmt = $db->prepare("SELECT id FROM projects WHERE user_id = ? AND project_name = ? AND status = 'active'");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('is', $userId, $newName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            error_log('[PROJECT] New name already exists');
            $stmt->close();
            $db->close();
            return [
                'success' => false,
                'error' => 'A project with that name already exists'
            ];
        }
        
        $stmt->close();
        
        // Rename project
        $stmt = $db->prepare("UPDATE projects SET project_name = ?, updated_at = NOW() WHERE user_id = ? AND project_name = ? AND status = 'active'");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare UPDATE: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('sis', $newName, $userId, $oldName);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            error_log('[PROJECT] Project not found for rename');
            $stmt->close();
            $db->close();
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        $stmt->close();
        $db->close();
        error_log('[PROJECT] Project renamed successfully');
        
        return [
            'success' => true,
            'message' => 'Project renamed successfully'
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in renameProject: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage()
        ];
    }
}

/**
 * Duplicate project
 */
function duplicateProject($licenseKey, $sourceName, $targetName) {
    error_log('[PROJECT] duplicateProject called: source=' . $sourceName . ', target=' . $targetName);
    
    // Load source project
    $sourceResult = loadProject($licenseKey, $sourceName);
    
    if (!$sourceResult['success']) {
        error_log('[PROJECT] Failed to load source project');
        return $sourceResult;
    }
    
    // Save as new project
    return saveProject($licenseKey, $targetName, $sourceResult['data']);
}

/**
 * Get project statistics
 */
function getProjectStats($licenseKey) {
    error_log('[PROJECT] getProjectStats called for license=' . $licenseKey);
    
    try {
        $db = getMySQLiConnection();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return ['success' => false, 'error' => 'Database connection failed'];
        }
        
        // Get user_id from license_key
        $stmt = $db->prepare("SELECT id FROM users WHERE license_key = ?");
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare user SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows === 0) {
            error_log('[PROJECT] ERROR: User not found for license key');
            $stmt->close();
            $db->close();
            return ['success' => false, 'error' => 'Invalid license key'];
        }
        
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        
        // Get stats
        $stmt = $db->prepare("SELECT COUNT(*) as total_projects, MIN(created_at) as first_project_date, MAX(updated_at) as last_activity_date FROM projects WHERE user_id = ? AND status = 'active'");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            $db->close();
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        
        $stmt->close();
        $db->close();
        error_log('[PROJECT] Stats retrieved successfully');
        
        return [
            'success' => true,
            'data' => $stats
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in getProjectStats: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage()
        ];
    }
}

/**
 * Handle project action routing
 */
function handleProjectAction($action, $payload, $licenseKey) {
    error_log('[PROJECT] handleProjectAction: action=' . $action);
    
    switch ($action) {
        case 'project_save':
        case 'project:save':
            return saveProject($licenseKey, $payload['projectName'], $payload['projectData']);
            
        case 'project_load':
        case 'project:load':
            return loadProject($licenseKey, $payload['projectName']);
            
        case 'project_list':
        case 'project:list':
            return listProjects($licenseKey);
            
        case 'project_delete':
        case 'project:delete':
            return deleteProject($licenseKey, $payload['projectName']);
            
        case 'project_rename':
        case 'project:rename':
            return renameProject($licenseKey, $payload['oldName'], $payload['newName']);
            
        case 'project_duplicate':
        case 'project:duplicate':
            return duplicateProject($licenseKey, $payload['sourceName'], $payload['targetName']);
            
        case 'project_stats':
        case 'project:stats':
            return getProjectStats($licenseKey);
            
        default:
            error_log('[PROJECT] ERROR: Unknown action: ' . $action);
            return [
                'success' => false,
                'error' => 'Unknown project action: ' . $action
            ];
    }
}

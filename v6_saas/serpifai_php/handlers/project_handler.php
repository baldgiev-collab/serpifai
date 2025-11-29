<?php
/**
 * Project Handler
 * Replaces Apps Script PropertiesService with MySQL database
 * Manages project CRUD operations
 */

require_once __DIR__ . '/../config/db_config.php';

/**
 * Save project to database
 */
function saveProject($licenseKey, $projectName, $projectData) {
    error_log('[PROJECT] saveProject called: license=' . $licenseKey . ', name=' . $projectName);
    
    try {
        $db = getDB();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
        
        error_log('[PROJECT] Database connected successfully');
        
        // Check if project exists
        $stmt = $db->prepare("
            SELECT id FROM projects 
            WHERE license_key = ? AND project_name = ?
        ");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        error_log('[PROJECT] SELECT result: ' . $result->num_rows . ' rows found');
        
        if ($result->num_rows > 0) {
            // Update existing project
            error_log('[PROJECT] Project exists, updating...');
            $row = $result->fetch_assoc();
            $projectId = $row['id'];
            
            $stmt = $db->prepare("
                UPDATE projects 
                SET project_data = ?, updated_at = NOW()
                WHERE id = ?
            ");
            
            if (!$stmt) {
                error_log('[PROJECT] ERROR: Failed to prepare UPDATE: ' . $db->error);
                return ['success' => false, 'error' => 'Database error: ' . $db->error];
            }
            
            $jsonData = json_encode($projectData);
            $stmt->bind_param('si', $jsonData, $projectId);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log('[PROJECT] ERROR: UPDATE failed: ' . $stmt->error);
                return ['success' => false, 'error' => 'Update failed: ' . $stmt->error];
            }
            
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
            $stmt = $db->prepare("
                INSERT INTO projects (license_key, project_name, project_data)
                VALUES (?, ?, ?)
            ");
            
            if (!$stmt) {
                error_log('[PROJECT] ERROR: Failed to prepare INSERT: ' . $db->error);
                return ['success' => false, 'error' => 'Database error: ' . $db->error];
            }
            
            $jsonData = json_encode($projectData);
            error_log('[PROJECT] JSON data: ' . $jsonData);
            
            $stmt->bind_param('sss', $licenseKey, $projectName, $jsonData);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log('[PROJECT] ERROR: INSERT failed: ' . $stmt->error);
                return ['success' => false, 'error' => 'Insert failed: ' . $stmt->error];
            }
            
            $newId = $db->insert_id;
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
            'success' => false,
            'error' => 'Failed to save project: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Load project from database
 */
function loadProject($licenseKey, $projectName) {
    error_log('[PROJECT] loadProject called: license=' . $licenseKey . ', name=' . $projectName);
    
    try {
        $db = getDB();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return [
                'success' => false,
                'error' => 'Database connection failed'
            ];
        }
        
        $stmt = $db->prepare("
            SELECT project_data, created_at, updated_at 
            FROM projects 
            WHERE license_key = ? AND project_name = ?
        ");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        error_log('[PROJECT] SELECT result: ' . $result->num_rows . ' rows found');
        
        if ($result->num_rows === 0) {
            error_log('[PROJECT] Project not found');
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        $row = $result->fetch_assoc();
        $projectData = json_decode($row['project_data'], true);
        
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
        
        if ($result->num_rows === 0) {
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        $row = $result->fetch_assoc();
        
        return [
            'success' => true,
            'data' => json_decode($row['project_data'], true),
            'metadata' => [
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ]
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to load project: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * List all projects for a license
 */
function listProjects($licenseKey) {
    error_log('[PROJECT] listProjects called for license=' . $licenseKey);
    
    try {
        $db = getDB();
        
        if (!$db) {
            error_log('[PROJECT] ERROR: Database connection failed');
            return ['success' => false, 'error' => 'Database connection failed'];
        }
        
        $stmt = $db->prepare("
            SELECT id, project_name, created_at, updated_at 
            FROM projects 
            WHERE license_key = ?
            ORDER BY updated_at DESC
        ");
        
        if (!$stmt) {
            error_log('[PROJECT] ERROR: Failed to prepare SELECT: ' . $db->error);
            return ['success' => false, 'error' => 'Database error: ' . $db->error];
        }
        
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
        
        error_log('[PROJECT] Found ' . count($projects) . ' projects');
        
        return [
            'success' => true,
            'projects' => $projects
        ];
    } catch (Exception $e) {
        error_log('[PROJECT] EXCEPTION in listProjects: ' . $e->getMessage());
        return ['success' => false, 'error' => 'Exception: ' . $e->getMessage()];
    }
}
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            SELECT project_name, created_at, updated_at 
            FROM projects 
            WHERE license_key = ?
            ORDER BY updated_at DESC
        ");
        $stmt->bind_param('s', $licenseKey);
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
        
        return [
            'success' => true,
            'data' => $projects,
            'count' => count($projects)
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to list projects: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Delete project
 */
function deleteProject($licenseKey, $projectName) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            DELETE FROM projects 
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        return [
            'success' => true,
            'message' => 'Project deleted successfully'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to delete project: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Rename project
 */
function renameProject($licenseKey, $oldName, $newName) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        // Check if new name already exists
        $stmt = $db->prepare("
            SELECT id FROM projects 
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $newName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            return [
                'success' => false,
                'error' => 'A project with that name already exists'
            ];
        }
        
        // Rename project
        $stmt = $db->prepare("
            UPDATE projects 
            SET project_name = ?, updated_at = NOW()
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('sss', $newName, $licenseKey, $oldName);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            return [
                'success' => false,
                'error' => 'Project not found'
            ];
        }
        
        return [
            'success' => true,
            'message' => 'Project renamed successfully'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to rename project: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Duplicate project
 */
function duplicateProject($licenseKey, $sourceName, $targetName) {
    // Load source project
    $sourceResult = loadProject($licenseKey, $sourceName);
    
    if (!$sourceResult['success']) {
        return $sourceResult;
    }
    
    // Save as new project
    return saveProject($licenseKey, $targetName, $sourceResult['data']);
}

/**
 * Get project statistics
 */
function getProjectStats($licenseKey) {
    $db = getDbConnection();
    
    if (!$db) {
        return [
            'success' => false,
            'error' => 'Database connection failed'
        ];
    }
    
    try {
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_projects,
                MIN(created_at) as first_project_date,
                MAX(updated_at) as last_activity_date
            FROM projects 
            WHERE license_key = ?
        ");
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        
        return [
            'success' => true,
            'data' => $stats
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Failed to get project stats: ' . $e->getMessage()
        ];
    } finally {
        $db->close();
    }
}

/**
 * Handle project action routing
 */
function handleProjectAction($action, $payload, $licenseKey) {
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
            return [
                'success' => false,
                'error' => 'Unknown project action: ' . $action
            ];
    }
}

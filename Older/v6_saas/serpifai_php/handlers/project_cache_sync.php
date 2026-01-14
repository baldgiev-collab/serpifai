<?php
/**
 * project_cache_sync.php
 * Enhanced project caching and sync handler
 * Manages unified JSON data format for all features (Competitor, Workflow, Fetcher, UI, Analysis)
 * Syncs between Google Sheets and MySQL
 */

require_once __DIR__ . '/../config/db_config.php';

// ============================================================================
// UNIFIED PROJECT CACHE AND SYNC HANDLER
// ============================================================================

/**
 * Save project with automatic cache management
 */
function saveProjectWithCache($licenseKey, $projectName, $unifiedProjectData) {
    error_log('[CACHE_SYNC] Saving project with cache: ' . $projectName);
    
    try {
        $db = getDB();
        
        if (!$db) {
            error_log('[CACHE_SYNC] ERROR: Database connection failed');
            return sendError('Database connection failed', 500);
        }
        
        // Serialize unified data
        $jsonData = json_encode($unifiedProjectData);
        $dataSize = strlen($jsonData);
        
        error_log('[CACHE_SYNC] Data size: ' . $dataSize . ' bytes');
        
        // Check if project exists
        $stmt = $db->prepare("
            SELECT id FROM projects 
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update existing
            $row = $result->fetch_assoc();
            $projectId = $row['id'];
            
            $stmt = $db->prepare("
                UPDATE projects 
                SET project_data = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->bind_param('si', $jsonData, $projectId);
            $stmt->execute();
            
            error_log('[CACHE_SYNC] Project updated: id=' . $projectId);
            
            return sendJSON([
                'success' => true,
                'message' => 'Project updated with cache',
                'projectId' => $projectId,
                'dataSize' => $dataSize,
                'cacheStatus' => 'updated'
            ]);
        } else {
            // Create new
            $stmt = $db->prepare("
                INSERT INTO projects (license_key, project_name, project_data)
                VALUES (?, ?, ?)
            ");
            $stmt->bind_param('sss', $licenseKey, $projectName, $jsonData);
            $stmt->execute();
            $projectId = $db->insert_id;
            
            error_log('[CACHE_SYNC] Project created: id=' . $projectId);
            
            return sendJSON([
                'success' => true,
                'message' => 'Project created with cache',
                'projectId' => $projectId,
                'dataSize' => $dataSize,
                'cacheStatus' => 'created'
            ]);
        }
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Cache sync error: ' . $e->getMessage(), 500);
    }
}

/**
 * Load project with cache info
 */
function loadProjectWithCache($licenseKey, $projectName) {
    error_log('[CACHE_SYNC] Loading project with cache info: ' . $projectName);
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT id, project_data, updated_at, created_at
            FROM projects
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            return sendError('Project not found', 404);
        }
        
        $row = $result->fetch_assoc();
        $projectData = json_decode($row['project_data'], true);
        
        error_log('[CACHE_SYNC] Project loaded: ' . strlen($row['project_data']) . ' bytes');
        
        return sendJSON([
            'success' => true,
            'projectId' => $row['id'],
            'data' => $projectData,
            'metadata' => [
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at'],
                'dataSize' => strlen($row['project_data'])
            ]
        ]);
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Load error: ' . $e->getMessage(), 500);
    }
}

/**
 * Sync specific data type to MySQL (from Sheets/UI)
 */
function syncDataTypeToMySQL($licenseKey, $projectName, $dataType, $data) {
    error_log('[CACHE_SYNC] Syncing ' . $dataType . ' data to MySQL');
    
    try {
        // Load existing project
        $stmt = $db = getDB()->prepare("
            SELECT project_data FROM projects
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            return sendError('Project not found', 404);
        }
        
        $row = $result->fetch_assoc();
        $projectData = json_decode($row['project_data'], true);
        
        // Update specific data type
        if (isset($projectData[$dataType])) {
            $projectData[$dataType] = array_merge($projectData[$dataType], $data);
        } else {
            $projectData[$dataType] = $data;
        }
        
        // Save updated project
        $updatedJson = json_encode($projectData);
        $db = getDB();
        $stmt = $db->prepare("
            UPDATE projects
            SET project_data = ?, updated_at = NOW()
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('sss', $updatedJson, $licenseKey, $projectName);
        $stmt->execute();
        
        error_log('[CACHE_SYNC] ' . $dataType . ' data synced successfully');
        
        return sendJSON([
            'success' => true,
            'message' => $dataType . ' data synced to MySQL',
            'dataType' => $dataType,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Sync error: ' . $e->getMessage(), 500);
    }
}

/**
 * Get project cache statistics
 */
function getProjectCacheStats($licenseKey, $projectName = null) {
    error_log('[CACHE_SYNC] Getting cache statistics');
    
    try {
        $db = getDB();
        
        if ($projectName) {
            // Stats for single project
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(LENGTH(project_data)) as total_size,
                    MAX(updated_at) as last_updated
                FROM projects
                WHERE license_key = ? AND project_name = ?
            ");
            $stmt->bind_param('ss', $licenseKey, $projectName);
        } else {
            // Stats for all user projects
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(LENGTH(project_data)) as total_size,
                    MAX(updated_at) as last_updated
                FROM projects
                WHERE license_key = ?
            ");
            $stmt->bind_param('s', $licenseKey);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        
        return sendJSON([
            'success' => true,
            'stats' => [
                'totalProjects' => $stats['total'] ?? 0,
                'totalDataSize' => $stats['total_size'] ?? 0,
                'lastUpdated' => $stats['last_updated'] ?? null,
                'averageProjectSize' => ($stats['total'] ?? 0) > 0 ? ($stats['total_size'] ?? 0) / ($stats['total'] ?? 1) : 0
            ]
        ]);
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Stats error: ' . $e->getMessage(), 500);
    }
}

/**
 * Batch sync multiple data types
 */
function batchSyncDataTypes($licenseKey, $projectName, $batchData) {
    error_log('[CACHE_SYNC] Batch syncing ' . count($batchData) . ' data types');
    
    try {
        $db = getDB();
        
        // Load existing project
        $stmt = $db->prepare("
            SELECT project_data FROM projects
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            return sendError('Project not found', 404);
        }
        
        $row = $result->fetch_assoc();
        $projectData = json_decode($row['project_data'], true);
        
        // Batch update all data types
        $updateCount = 0;
        foreach ($batchData as $dataType => $data) {
            if (isset($projectData[$dataType])) {
                $projectData[$dataType] = array_merge($projectData[$dataType], $data);
            } else {
                $projectData[$dataType] = $data;
            }
            $updateCount++;
            error_log('[CACHE_SYNC] Updated: ' . $dataType);
        }
        
        // Save updated project
        $updatedJson = json_encode($projectData);
        $stmt = $db->prepare("
            UPDATE projects
            SET project_data = ?, updated_at = NOW()
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('sss', $updatedJson, $licenseKey, $projectName);
        $stmt->execute();
        
        error_log('[CACHE_SYNC] Batch sync completed: ' . $updateCount . ' data types');
        
        return sendJSON([
            'success' => true,
            'message' => 'Batch sync completed',
            'itemsSynced' => $updateCount,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Batch sync error: ' . $e->getMessage(), 500);
    }
}

/**
 * Verify data consistency between MySQL and Sheets
 */
function verifyDataConsistency($licenseKey, $projectName, $sheetData) {
    error_log('[CACHE_SYNC] Verifying data consistency');
    
    try {
        $db = getDB();
        
        // Get MySQL version
        $stmt = $db->prepare("
            SELECT project_data FROM projects
            WHERE license_key = ? AND project_name = ?
        ");
        $stmt->bind_param('ss', $licenseKey, $projectName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            return sendError('Project not found', 404);
        }
        
        $row = $result->fetch_assoc();
        $mysqlData = json_decode($row['project_data'], true);
        $sheetDataParsed = is_string($sheetData) ? json_decode($sheetData, true) : $sheetData;
        
        // Compare data
        $consistency = [
            'mysqlVersion' => md5(json_encode($mysqlData)),
            'sheetVersion' => md5(json_encode($sheetDataParsed)),
            'isConsistent' => (md5(json_encode($mysqlData)) === md5(json_encode($sheetDataParsed))),
            'lastSyncTime' => date('Y-m-d H:i:s')
        ];
        
        return sendJSON([
            'success' => true,
            'consistency' => $consistency,
            'recommendation' => $consistency['isConsistent'] ? 'Data is in sync' : 'Resync recommended'
        ]);
        
    } catch (Exception $e) {
        error_log('[CACHE_SYNC] Exception: ' . $e->getMessage());
        return sendError('Consistency check error: ' . $e->getMessage(), 500);
    }
}

?>

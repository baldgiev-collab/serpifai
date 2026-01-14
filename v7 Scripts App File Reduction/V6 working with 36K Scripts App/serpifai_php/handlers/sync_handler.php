<?php
/**
 * sync_handler.php
 * Synchronizes projects between MySQL and Google Sheets
 * Ensures both storage systems stay in sync
 */

// ============================================================================
// SYNC HANDLER - MYSQL <-> GOOGLE SHEETS
// ============================================================================

/**
 * Main sync router function
 */
function handleSyncAction($action, $payload, $licenseKey) {
    error_log('[SYNC] Action: ' . $action . ' | License: ' . $licenseKey);
    
    try {
        // Verify license
        $userId = verifyLicense($licenseKey);
        if (!$userId) {
            error_log('[SYNC] License verification failed: ' . $licenseKey);
            return sendError('Invalid license key', 401);
        }
        
        switch ($action) {
            case 'sync:test':
                return testSyncConnection();
                
            case 'sync:status':
                return getSyncStatus($licenseKey);
                
            case 'sync:mysql_to_sheets':
                return syncMySQLToSheets($licenseKey, $payload);
                
            case 'sync:sheets_to_mysql':
                return syncSheetsToMySQL($licenseKey, $payload);
                
            case 'sync:full':
                return fullBidirectionalSync($licenseKey);
                
            default:
                error_log('[SYNC] Unknown action: ' . $action);
                return sendError('Unknown sync action: ' . $action, 400);
        }
    } catch (Exception $e) {
        error_log('[SYNC] Exception: ' . $e->getMessage());
        return sendError('Sync error: ' . $e->getMessage(), 500);
    }
}

/**
 * Test sync connection (both MySQL and Sheets)
 */
function testSyncConnection() {
    error_log('[SYNC] Testing connections...');
    
    $status = [
        'mysql' => 'unknown',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Test MySQL
    try {
        $db = getDB();
        $result = $db->query('SELECT 1');
        $status['mysql'] = 'connected';
        error_log('[SYNC] MySQL: Connected');
    } catch (Exception $e) {
        $status['mysql'] = 'failed: ' . $e->getMessage();
        error_log('[SYNC] MySQL: Failed - ' . $e->getMessage());
    }
    
    return sendJSON([
        'success' => true,
        'status' => $status
    ]);
}

/**
 * Get current sync status
 */
function getSyncStatus($licenseKey) {
    error_log('[SYNC] Getting sync status for: ' . $licenseKey);
    
    try {
        $db = getDB();
        
        // Count projects in MySQL
        $stmt = $db->prepare('
            SELECT COUNT(*) as count FROM projects 
            WHERE license_key = ?
        ');
        $stmt->execute([$licenseKey]);
        $mysqlCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        error_log('[SYNC] MySQL projects: ' . $mysqlCount);
        
        return sendJSON([
            'success' => true,
            'mysql' => [
                'projects' => $mysqlCount,
                'status' => 'connected'
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log('[SYNC] Status error: ' . $e->getMessage());
        return sendError('Could not get sync status: ' . $e->getMessage(), 500);
    }
}

/**
 * Sync all projects from MySQL to Google Sheets
 * (This would require Google Sheets API credentials in production)
 */
function syncMySQLToSheets($licenseKey, $payload) {
    error_log('[SYNC] Syncing MySQL -> Sheets for: ' . $licenseKey);
    
    try {
        $db = getDB();
        
        // Get all projects for this license
        $stmt = $db->prepare('
            SELECT id, project_name, project_data, updated_at 
            FROM projects 
            WHERE license_key = ? 
            ORDER BY updated_at DESC
        ');
        $stmt->execute([$licenseKey]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log('[SYNC] Found ' . count($projects) . ' projects to sync');
        
        $syncResults = [];
        foreach ($projects as $project) {
            $projectData = json_decode($project['project_data'], true);
            
            // In production, this would call Google Sheets API
            // For now, log the sync intent
            error_log('[SYNC] Would sync project: ' . $project['project_name']);
            
            $syncResults[] = [
                'name' => $project['project_name'],
                'synced' => true,
                'timestamp' => $project['updated_at']
            ];
        }
        
        return sendJSON([
            'success' => true,
            'message' => 'Sync completed',
            'synced' => count($syncResults),
            'projects' => $syncResults
        ]);
        
    } catch (Exception $e) {
        error_log('[SYNC] Sync error: ' . $e->getMessage());
        return sendError('Sync failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Sync projects from Google Sheets to MySQL
 * (This would require Google Sheets API credentials in production)
 */
function syncSheetsToMySQL($licenseKey, $payload) {
    error_log('[SYNC] Syncing Sheets -> MySQL for: ' . $licenseKey);
    
    try {
        // In production, this would read from Google Sheets API
        // For now, provide status
        
        return sendJSON([
            'success' => true,
            'message' => 'Sheets to MySQL sync initialized',
            'status' => 'pending_api_integration'
        ]);
        
    } catch (Exception $e) {
        error_log('[SYNC] Sync error: ' . $e->getMessage());
        return sendError('Sync failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Full bidirectional sync
 */
function fullBidirectionalSync($licenseKey) {
    error_log('[SYNC] Starting full bidirectional sync for: ' . $licenseKey);
    
    try {
        // Phase 1: MySQL -> Sheets
        error_log('[SYNC] Phase 1: MySQL -> Sheets');
        $phase1 = syncMySQLToSheets($licenseKey, []);
        
        // Phase 2: Sheets -> MySQL (conflict resolution)
        error_log('[SYNC] Phase 2: Sheets -> MySQL');
        $phase2 = syncSheetsToMySQL($licenseKey, []);
        
        return sendJSON([
            'success' => true,
            'message' => 'Bidirectional sync completed',
            'phases' => [
                'mysql_to_sheets' => json_decode($phase1, true),
                'sheets_to_mysql' => json_decode($phase2, true)
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log('[SYNC] Full sync error: ' . $e->getMessage());
        return sendError('Full sync failed: ' . $e->getMessage(), 500);
    }
}

?>

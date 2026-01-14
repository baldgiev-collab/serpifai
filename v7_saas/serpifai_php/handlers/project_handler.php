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
        
        // ═══════════════════════════════════════════════════════════════════════════
        // LOAD SAVED COMPETITOR ANALYSIS (if exists)
        // ═══════════════════════════════════════════════════════════════════════════
        $competitorAnalysis = null;
        try {
            $compStmt = $db->prepare("
                SELECT analysis_data, competitors, your_domain, competitor_count, 
                       data_quality, api_success, updated_at
                FROM competitor_analysis_results 
                WHERE project_id = ? AND user_id = ?
                ORDER BY updated_at DESC
                LIMIT 1
            ");
            
            if ($compStmt) {
                $compStmt->bind_param('si', $projectName, $userId);
                $compStmt->execute();
                $compResult = $compStmt->get_result();
                
                if ($compResult->num_rows > 0) {
                    $compRow = $compResult->fetch_assoc();
                    
                    // Parse the analysis data JSON
                    $analysisData = json_decode($compRow['analysis_data'], true);
                    
                    // DEBUG: Log what we got from JSON
                    error_log('[PROJECT] Analysis data keys: ' . implode(', ', array_keys($analysisData ?? [])));
                    
                    // ═══════════════════════════════════════════════════════════════
                    // PRIORITY 1: Use pre-transformed competitorsArray if available
                    // This preserves all nested structures (apiData, processedMetrics, etc.)
                    // ═══════════════════════════════════════════════════════════════
                    $competitorsArray = [];
                    
                    if (isset($analysisData['competitorsArray']) && is_array($analysisData['competitorsArray']) && count($analysisData['competitorsArray']) > 0) {
                        // Use pre-transformed array (best quality - all structures preserved)
                        $competitorsArray = $analysisData['competitorsArray'];
                        error_log('[PROJECT] Using pre-transformed competitorsArray: ' . count($competitorsArray) . ' competitors');
                        
                        // Log data integrity check
                        if (isset($analysisData['dataIntegrity'])) {
                            $integrity = $analysisData['dataIntegrity'];
                            error_log('[PROJECT] Data integrity: ' . json_encode($integrity));
                        }
                    } else {
                        // FALLBACK: Convert rawData object to array (legacy format)
                        error_log('[PROJECT] Falling back to rawData conversion...');
                        $rawData = $analysisData['rawData'] ?? [];
                        
                        // DEBUG: Log rawData structure
                        error_log('[PROJECT] rawData type: ' . gettype($rawData));
                        error_log('[PROJECT] rawData keys: ' . (is_array($rawData) ? implode(', ', array_keys($rawData)) : 'N/A'));
                        
                        if (is_array($rawData)) {
                            // If rawData is already an array (shouldn't happen but handle it)
                            if (isset($rawData[0])) {
                                $competitorsArray = $rawData;
                            } else {
                                // Object with domain keys - convert to array
                                foreach ($rawData as $domain => $compData) {
                                    // Add domain to each competitor if not present
                                    if (is_array($compData)) {
                                        if (!isset($compData['domain'])) {
                                            $compData['domain'] = $domain;
                                        }
                                        // DEBUG: Log what's in each competitor
                                        $compKeys = array_keys($compData);
                                        error_log("[PROJECT] Competitor $domain keys: " . implode(', ', array_slice($compKeys, 0, 10)));
                                        $competitorsArray[] = $compData;
                                    }
                                }
                            }
                        }
                    }
                    
                    // DEBUG: Log final competitors array
                    error_log('[PROJECT] Final competitors array count (before dedup): ' . count($competitorsArray));
                    
                    // ═══════════════════════════════════════════════════════════════
                    // CRITICAL: Deduplicate competitors by domain to prevent duplicates
                    // ═══════════════════════════════════════════════════════════════
                    $seenDomains = [];
                    $uniqueCompetitors = [];
                    foreach ($competitorsArray as $comp) {
                        $compDomain = $comp['domain'] ?? $comp['url'] ?? '';
                        // Normalize domain (remove www., lowercase)
                        $normalizedDomain = strtolower(preg_replace('/^www\./', '', $compDomain));
                        
                        if (!empty($normalizedDomain) && !isset($seenDomains[$normalizedDomain])) {
                            $seenDomains[$normalizedDomain] = true;
                            $uniqueCompetitors[] = $comp;
                        } else if (!empty($normalizedDomain)) {
                            error_log('[PROJECT] Skipping duplicate domain: ' . $normalizedDomain);
                        }
                    }
                    
                    error_log('[PROJECT] Final competitors array count (after dedup): ' . count($uniqueCompetitors));
                    
                    // Log each unique competitor's keys to verify data structure
                    foreach ($uniqueCompetitors as $idx => $comp) {
                        $compKeys = array_keys($comp);
                        error_log("[PROJECT] Competitor $idx: " . ($comp['domain'] ?? 'unknown') . " - keys: " . implode(', ', array_slice($compKeys, 0, 8)));
                        
                        // Verify critical nested structures exist
                        $hasProcessedMetrics = isset($comp['processedMetrics']) && is_array($comp['processedMetrics']);
                        $hasApiData = isset($comp['apiData']) && is_array($comp['apiData']);
                        $hasStages = isset($comp['stages']) && is_array($comp['stages']);
                        $hasSynthesized = isset($comp['synthesized']) && is_array($comp['synthesized']);
                        
                        error_log("[PROJECT]   -> processedMetrics: " . ($hasProcessedMetrics ? 'YES' : 'NO'));
                        error_log("[PROJECT]   -> apiData: " . ($hasApiData ? 'YES' : 'NO'));
                        error_log("[PROJECT]   -> stages: " . ($hasStages ? 'YES' : 'NO'));
                        error_log("[PROJECT]   -> synthesized: " . ($hasSynthesized ? 'YES' : 'NO'));
                    }
                    
                    $competitorAnalysis = [
                        'success' => true,
                        'competitors' => $uniqueCompetitors,
                        'analysis' => $analysisData['geminiAnalysis'] ?? $analysisData['analysis'] ?? [],
                        'eliteTabIntelligence' => $analysisData['eliteTabIntelligence'] ?? $analysisData['geminiAnalysis']['eliteTabIntelligence'] ?? null,
                        'overview' => $analysisData['overview'] ?? null,
                        'dashboardCharts' => $analysisData['dashboardCharts'] ?? null,
                        'dataIntegrity' => $analysisData['dataIntegrity'] ?? null,
                        'count' => count($uniqueCompetitors),
                        'yourDomain' => $compRow['your_domain'],
                        'dataQuality' => $compRow['data_quality'],
                        'apiSuccess' => $compRow['api_success'],
                        'timestamp' => $compRow['updated_at']
                    ];
                    
                    // Log if we have eliteTabIntelligence
                    if (!empty($competitorAnalysis['eliteTabIntelligence'])) {
                        error_log('[PROJECT] Loaded eliteTabIntelligence with keys: ' . implode(', ', array_keys($competitorAnalysis['eliteTabIntelligence'])));
                    }
                    
                    // Log if we have overview/dashboardCharts
                    if (!empty($competitorAnalysis['overview'])) {
                        error_log('[PROJECT] Loaded overview data');
                    }
                    if (!empty($competitorAnalysis['dashboardCharts'])) {
                        error_log('[PROJECT] Loaded dashboardCharts data');
                    }
                    
                    error_log('[PROJECT] Found competitor analysis: ' . $compRow['competitor_count'] . ' competitors');
                }
                $compStmt->close();
            }
        } catch (Exception $compError) {
            error_log('[PROJECT] Warning: Could not load competitor analysis: ' . $compError->getMessage());
            // Non-fatal - continue without competitor data
        }
        
        $db->close();
        error_log('[PROJECT] Project loaded successfully');
        
        $response = [
            'success' => true,
            'data' => $projectData,
            'metadata' => [
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ]
        ];
        
        // Add competitor analysis if found
        if ($competitorAnalysis) {
            $response['competitorAnalysis'] = $competitorAnalysis;
        }
        
        return $response;
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

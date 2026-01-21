/**
 * UI_ProjectManager_Dual.gs
 * Enhanced dual-storage system with unified JSON-cell architecture
 * Stores all project data (Competitor, Workflow, Fetcher, UI) in single JSON cell
 * Syncs with MySQL for caching, data collection, and storage
 * 
 * Features:
 * - Single JSON cell per project (easier UI integration)
 * - All feature data types supported (competitor_data, workflow_data, fetcher_data, ui_data)
 * - Automatic sync with MySQL for data persistence
 * - Cache management
 * - Real-time data updates
 */

// ============================================================================
// UNIFIED DUAL STORAGE: GOOGLE SHEETS + MYSQL
// Single JSON cell architecture for all project data
// ============================================================================

/**
 * Save project to BOTH Google Sheets and MySQL (unified JSON format)
 * All project features stored in single JSON cell per project
 */
function saveProjectDual(projectName, projectData) {
  try {
    Logger.log('💾 [UNIFIED] Saving project: ' + projectName);
    Logger.log('   📦 Data keys received: ' + Object.keys(projectData).length);
    Logger.log('   📦 Sample keys: ' + Object.keys(projectData).slice(0, 10).join(', '));
    
    // DON'T TRANSFORM - Save data exactly as received from collectFormData()
    // Add minimal metadata only
    const dataToSave = Object.assign({}, projectData);
    dataToSave.projectName = projectName;
    dataToSave.updatedAt = new Date().toISOString();
    if (!dataToSave.createdAt) {
      dataToSave.createdAt = new Date().toISOString();
    }
    
    Logger.log('   💾 Saving ' + Object.keys(dataToSave).length + ' fields');
    
    const results = {
      sheet: null,
      mysql: null,
      success: false
    };
    
    // ============================================================================
    // SAVE TO MASTER GOOGLE SHEET (Centralized database)
    // ============================================================================
    try {
      Logger.log('   📊 Saving to Master Google Sheet...');
      const sheetResult = saveProjectToMasterSheet(projectName, dataToSave);
      results.sheet = sheetResult;
      Logger.log('   ✅ Master Sheet save: ' + (sheetResult.success ? 'Success' : 'Failed'));
    } catch (e) {
      Logger.log('   ❌ Master Sheet save error: ' + e.toString());
      results.sheet = { success: false, error: e.toString() };
    }
    
    // ============================================================================
    // SAVE TO MYSQL (Sync for caching and data persistence)
    // ============================================================================
    try {
      Logger.log('   🗄️  Syncing to MySQL...');
      const mysqlResult = saveProjectToDatabase(projectName, dataToSave);
      results.mysql = mysqlResult;
      Logger.log('   ✅ MySQL sync: ' + (mysqlResult.success ? 'Success' : 'Failed'));
    } catch (e) {
      Logger.log('   ❌ MySQL sync error: ' + e.toString());
      results.mysql = { success: false, error: e.toString() };
    }
    
    // Both successful
    if (results.sheet.success && results.mysql.success) {
      results.success = true;
      Logger.log('✅ [UNIFIED] Project saved to BOTH locations (Master Sheet + MySQL)');
      return {
        ok: true,
        name: projectName,
        sheet: results.sheet.spreadsheetId,
        masterSheetUrl: results.sheet.url,
        projectId: results.mysql.projectId,
        synced: true,
        dataSize: JSON.stringify(dataToSave).length,
        updatedAt: new Date().toISOString()
      };
    }
    
    // At least one succeeded
    if (results.sheet.success || results.mysql.success) {
      Logger.log('⚠️  [UNIFIED] Partial success - saved to ' + (results.sheet.success ? 'Master Sheet' : 'MySQL'));
      return {
        ok: true,
        name: projectName,
        partialSuccess: true,
        sheet: results.sheet.success ? results.sheet.spreadsheetId : null,
        masterSheetUrl: results.sheet.success ? results.sheet.url : null,
        projectId: results.mysql.success ? results.mysql.projectId : null,
        synced: results.sheet.success && results.mysql.success,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Both failed
    throw new Error('Failed to save to both locations. Sheet: ' + results.sheet.error + ' | MySQL: ' + results.mysql.error);
    
  } catch (e) {
    Logger.log('❌ [UNIFIED] Error saving project: ' + e.toString());
    return {
      ok: false,
      error: e.toString()
    };
  }
}

/**
 * Unify project data from all sources into standard structure
 * Combines: competitor_data, workflow_data, fetcher_data, ui_data, analysis_data
 */
function unifyProjectData(rawData) {
  try {
    const unified = {
      // Project metadata
      projectId: rawData.projectId || 'proj_' + Date.now(),
      projectName: rawData.projectName || 'Untitled Project',
      createdAt: rawData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Project context (UI/Dashboard data)
      context: {
        brand: rawData.brand || rawData.projectContext?.brandName || '',
        keywords: rawData.keywords || rawData.projectContext?.keywords || [],
        category: rawData.category || rawData.projectContext?.business_category || '',
        targetAudience: rawData.targetAudience || rawData.projectContext?.target_audience || '',
        productDescription: rawData.productDescription || rawData.projectContext?.product_description || ''
      },
      
      // Competitor Intelligence data (from DB_COMP_Main)
      competitor: {
        competitors: rawData.competitors || [],
        competitorAnalysis: rawData.competitorAnalysis || rawData.competitor_data || {},
        overview: rawData.overview || {},
        marketIntel: rawData.marketIntel || {},
        brandPosition: rawData.brandPosition || {},
        technicalSEO: rawData.technicalSEO || {},
        contentIntel: rawData.contentIntel || {},
        keywordStrategy: rawData.keywordStrategy || {},
        contentSystems: rawData.contentSystems || {},
        conversion: rawData.conversion || {},
        distribution: rawData.distribution || {},
        audience: rawData.audience || {},
        geoAeo: rawData.geoAeo || {},
        authority: rawData.authority || {},
        performance: rawData.performance || {},
        opportunity: rawData.opportunity || {},
        scoring: rawData.scoring || {}
      },
      
      // Workflow data (from DB_WF_Router - 5 stage workflow)
      workflow: {
        stage1Strategy: rawData.stage1Strategy || rawData.workflowStage1 || rawData.workflow_data?.stage1 || {},
        stage2Keywords: rawData.stage2Keywords || rawData.workflowStage2 || rawData.workflow_data?.stage2 || {},
        stage3Architecture: rawData.stage3Architecture || rawData.workflowStage3 || rawData.workflow_data?.stage3 || {},
        stage4Calendar: rawData.stage4Calendar || rawData.workflowStage4 || rawData.workflow_data?.stage4 || {},
        stage5Generation: rawData.stage5Generation || rawData.workflowStage5 || rawData.workflow_data?.stage5 || {},
        contentPipeline: rawData.contentPipeline || {},
        calendar: rawData.calendar || {}
      },
      
      // Fetcher/Forensic data (from FT_Router - content fetching and analysis)
      fetcher: {
        urls: rawData.urls || rawData.fetcher_data?.urls || [],
        forensicSnapshots: rawData.forensicSnapshots || rawData.fetcher_data?.snapshots || {},
        contentExtracts: rawData.contentExtracts || rawData.fetcher_data?.content || {},
        metadata: rawData.metadata || rawData.fetcher_data?.metadata || {},
        images: rawData.images || rawData.fetcher_data?.images || {},
        links: rawData.links || rawData.fetcher_data?.links || {},
        schema: rawData.schema || rawData.fetcher_data?.schema || {},
        compliance: rawData.compliance || rawData.fetcher_data?.compliance || {}
      },
      
      // QA and Quality Analysis
      analysis: {
        qaScores: rawData.qaScores || rawData.analysis_data?.qa || {},
        eeatMetrics: rawData.eeatMetrics || rawData.analysis_data?.eeat || {},
        aeoMetrics: rawData.aeoMetrics || rawData.analysis_data?.aeo || {},
        geoMetrics: rawData.geoMetrics || rawData.analysis_data?.geo || {},
        semanticDepth: rawData.semanticDepth || rawData.analysis_data?.semantic || {},
        readability: rawData.readability || rawData.analysis_data?.readability || {},
        technicalAudit: rawData.technicalAudit || rawData.analysis_data?.technical || {}
      },
      
      // UI-specific data (charts, dashboards, display states)
      ui: {
        charts: rawData.charts || rawData.ui_data?.charts || {},
        dashboards: rawData.dashboards || rawData.ui_data?.dashboards || {},
        filters: rawData.filters || rawData.ui_data?.filters || {},
        viewState: rawData.viewState || rawData.ui_data?.viewState || {},
        selections: rawData.selections || rawData.ui_data?.selections || {}
      },
      
      // Generated content (from DB_CE_ContentEngine and DB_PUB_PublishingEngine)
      content: {
        articles: rawData.articles || rawData.generated_content?.articles || {},
        outlines: rawData.outlines || rawData.generated_content?.outlines || {},
        schemas: rawData.schemas || rawData.generated_content?.schemas || {},
        internalLinks: rawData.internalLinks || rawData.generated_content?.links || {},
        publishingQueue: rawData.publishingQueue || rawData.content_queue || {}
      },
      
      // Metadata and status
      metadata: {
        status: rawData.status || 'active',
        version: '1.0',
        lastAnalysis: rawData.lastAnalysis || null,
        creditsUsed: rawData.creditsUsed || 0,
        notes: rawData.notes || ''
      }
    };
    
    Logger.log('✅ Data unified successfully');
    return unified;
    
  } catch (e) {
    Logger.log('❌ Error unifying data: ' + e.toString());
    // Return basic structure if unification fails
    return {
      projectName: rawData.projectName || 'Untitled Project',
      projectId: rawData.projectId || 'proj_' + Date.now(),
      rawData: rawData,
      error: e.toString()
    };
  }
}

/**
 * Load project from MySQL job_registry (Primary) with Sheet as last-resort fallback
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * V7 FIX: Force MySQL/job_registry query first to ensure Elite Token Architecture alignment
 * The Master Google Sheet is now a BACKUP, not the primary source of truth
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
function loadProjectDual(projectName) {
  try {
    Logger.log('📂 Loading project: ' + projectName);
    Logger.log('   🔑 Strategy: MySQL FIRST → Sheet FALLBACK');
    
    let result = null;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Try MySQL job_registry FIRST (Primary source of truth)
    // ═══════════════════════════════════════════════════════════════════════
    try {
      Logger.log('   🗄️  Trying MySQL (PRIMARY)...');
      const mysqlResult = loadProjectFromDatabase(projectName);
      if (mysqlResult && mysqlResult.success) {
        Logger.log('   ✅ Found in MySQL job_registry');
        result = mysqlResult;
        
        // Check for latest job token from job_registry
        try {
          const jobTokenResult = recoverLatestJobTokenForProject(projectName);
          if (jobTokenResult && jobTokenResult.success) {
            result._recoveredJobToken = jobTokenResult.job_token;
            Logger.log('   🔑 Recovered job token: ' + jobTokenResult.job_token);
          }
        } catch (tokenError) {
          Logger.log('   ⚠️  Could not recover job token: ' + tokenError.toString());
        }
      }
    } catch (e) {
      Logger.log('   ⚠️  MySQL load failed: ' + e.toString());
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Only use Sheet as FALLBACK if MySQL failed
    // ═══════════════════════════════════════════════════════════════════════
    if (!result) {
      try {
        Logger.log('   📊 Trying Master Google Sheet (FALLBACK)...');
        const sheetResult = loadProjectFromMasterSheet(projectName);
        if (sheetResult && sheetResult.success) {
          Logger.log('   ✅ Found in Master Sheet (fallback)');
          result = sheetResult;
          result._loadedFromFallback = true;
        }
      } catch (e) {
        Logger.log('   ⚠️  Master Sheet load failed: ' + e.toString());
      }
    }
    
    // Not found anywhere
    if (!result) {
      Logger.log('❌ Project not found in either location');
      return {
        name: projectName,
        data: {},
        error: 'Project not found'
      };
    }
    
    // =========================================================================
    // WORKFLOW STATE RECOVERY: Load saved stage results for UI hydration
    // =========================================================================
    try {
      Logger.log('   🔄 Checking for saved workflow stage results...');
      
      // Check if Stage 1 has saved results
      if (typeof loadWorkflowStageResults === 'function') {
        const stage1Results = loadWorkflowStageResults(projectName, 1);
        if (stage1Results && stage1Results.success) {
          result.workflowStage1 = stage1Results;
          Logger.log('   ✅ Found saved Stage 1 results from: ' + stage1Results.timestamp);
        }
        
        // Also get overall workflow status
        if (typeof getWorkflowStatus === 'function') {
          result.workflowStatus = getWorkflowStatus(projectName);
          Logger.log('   📊 Workflow status loaded');
        }
      } else {
        Logger.log('   ℹ️ Workflow stage loader not available');
      }
    } catch (wfError) {
      Logger.log('   ⚠️ Could not load workflow status: ' + wfError.toString());
    }
    
    return result;
    
  } catch (e) {
    Logger.log('❌ Error loading project: ' + e.toString());
    return {
      name: projectName,
      data: {},
      error: e.toString()
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ELITE TOKEN RECOVERY: Query job_registry for latest job token by project_id
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * This function queries MySQL job_registry to find the latest job token for a project.
 * Used to recover the token when UI reloads or loses state.
 * 
 * @param {string} projectId - The project identifier
 * @returns {object} { success, job_token, status, created_at } or { success: false, error }
 */
function recoverLatestJobTokenForProject(projectId) {
  try {
    Logger.log('[TOKEN_RECOVERY] Recovering latest job token for project: ' + projectId);
    
    // Use FT_Gateway.callGateway if available
    if (typeof callGateway === 'function') {
      const result = callGateway('job_recover_token', {
        project_id: projectId
      });
      
      if (result && result.success) {
        Logger.log('[TOKEN_RECOVERY] ✅ Recovered token: ' + result.job_token);
        return result;
      }
    }
    
    // Fallback to direct UPP call if available
    if (typeof UPP_call === 'function') {
      const result = UPP_call('job_recover_token', {
        project_id: projectId
      });
      
      if (result && result.success) {
        Logger.log('[TOKEN_RECOVERY] ✅ Recovered token via UPP: ' + result.job_token);
        return result;
      }
    }
    
    Logger.log('[TOKEN_RECOVERY] ⚠️ No gateway available for token recovery');
    return { success: false, error: 'No gateway available' };
    
  } catch (e) {
    Logger.log('[TOKEN_RECOVERY] ❌ Error: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * List all projects from both sources
 */
function listProjectsDual() {
  try {
    Logger.log('📋 Listing all projects from both sources');
    
    const allProjects = {};
    
    // Get from Master Google Sheet
    try {
      Logger.log('   📊 Getting projects from Master Sheet...');
      const masterProjects = listProjectsFromMasterSheet();
      if (masterProjects && masterProjects.success && Array.isArray(masterProjects.projects)) {
        masterProjects.projects.forEach(function(project) {
          allProjects[project.name] = {
            name: project.name,
            source: 'master-sheet',
            spreadsheetId: project.spreadsheetId,
            lastModified: project.lastModified || project.updatedAt
          };
        });
        Logger.log('   ✅ Found ' + masterProjects.projects.length + ' projects in Master Sheet');
      }
    } catch (e) {
      Logger.log('   ⚠️  Could not get Master Sheet projects: ' + e.toString());
    }
    
    // Get from MySQL (with graceful failure)
    try {
      Logger.log('   🗄️  Getting projects from MySQL...');
      const mysqlProjects = listProjectsFromDatabase();
      
      // Check if we got a valid response
      if (mysqlProjects && mysqlProjects.success && Array.isArray(mysqlProjects.projects)) {
        mysqlProjects.projects.forEach(function(project) {
          const projectName = project.project_name || project.name;
          if (allProjects[projectName]) {
            // Already in Master Sheet, mark as synced
            allProjects[projectName].synced = true;
            allProjects[projectName].mysqlId = project.id;
          } else {
            // Only in MySQL
            allProjects[projectName] = {
              name: projectName,
              source: 'mysql',
              mysqlId: project.id,
              lastModified: project.updated_at || new Date().toISOString()
            };
          }
        });
        Logger.log('   ✅ Found ' + mysqlProjects.projects.length + ' projects in MySQL');
      } else {
        Logger.log('   ⚠️  MySQL returned no projects or error: ' + (mysqlProjects ? mysqlProjects.error : 'null response'));
      }
    } catch (e) {
      Logger.log('   ⚠️  Could not get MySQL projects: ' + e.toString());
    }
    
    // Always return a valid response (even if empty)
    const projectList = Object.values(allProjects);
    Logger.log('✅ Found ' + projectList.length + ' projects total');
    Logger.log('   Projects: ' + projectList.map(function(p) { return p.name; }).join(', '));
    
    return {
      success: true,
      projects: projectList,
      count: projectList.length
    };
    
  } catch (e) {
    Logger.log('❌ Error listing projects: ' + e.toString());
    
    // Return empty list instead of throwing
    return { 
      success: true,
      projects: [],
      count: 0,
      error: e.toString()
    };
  }
}

// ============================================================================
// GOOGLE SHEETS FUNCTIONS
// ============================================================================

/**
 * Save project as a new Google Sheet in user's Drive
 * Sheet structure matches the reference template
 */
function saveProjectToSheet(projectName, projectData) {
  try {
    Logger.log('📊 saveProjectToSheet: ' + projectName);
    
    // Find or create project sheet
    let sheet = findProjectSheet(projectName);
    
    if (!sheet) {
      // Create new sheet
      Logger.log('   🔨 Creating new project sheet...');
      try {
        sheet = createProjectSheet(projectName);
        Logger.log('   ✅ Created sheet successfully');
      } catch (createError) {
        Logger.log('❌ CRITICAL: Failed to create sheet: ' + createError.toString());
        return {
          success: false,
          error: 'Failed to create Google Sheet: ' + createError.toString(),
          critical: true
        };
      }
    } else {
      Logger.log('   ✓ Found existing sheet');
    }
    
    // Populate sheet with data
    try {
      Logger.log('   📝 Populating sheet with data...');
      populateProjectSheet(sheet, projectData);
      Logger.log('   ✓ Data populated');
    } catch (populateError) {
      Logger.log('❌ Error populating sheet: ' + populateError.toString());
      return {
        success: false,
        error: 'Failed to populate sheet: ' + populateError.toString()
      };
    }
    
    Logger.log('✅ Project saved to Google Sheet successfully');
    
    return {
      success: true,
      sheetId: sheet.getParent().getId(),
      sheetName: projectName,
      timestamp: new Date().toISOString()
    };
    
  } catch (e) {
    Logger.log('❌ Error saving to Sheet (outer): ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Load project from Google Sheet
 */
function loadProjectFromSheet(projectName) {
  try {
    Logger.log('📂 loadProjectFromSheet: ' + projectName);
    
    const sheet = findProjectSheet(projectName);
    if (!sheet) {
      return { success: false, error: 'Project sheet not found' };
    }
    
    const data = extractProjectDataFromSheet(sheet);
    
    return {
      success: true,
      data: data,
      metadata: {
        sheetId: sheet.getParent().getId(),
        sheetName: projectName,
        loadedAt: new Date().toISOString()
      }
    };
    
  } catch (e) {
    Logger.log('❌ Error loading from Sheet: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Find project sheet by name
 * IMPROVED: Better error handling and logging
 */
function findProjectSheet(projectName) {
  try {
    Logger.log('🔍 Searching for sheet: ' + projectName);
    
    // Search user's Drive for folder "SERPIFAI Projects"
    const folders = DriveApp.getFoldersByName('SERPIFAI Projects');
    
    if (!folders.hasNext()) {
      Logger.log('   ℹ️  SERPIFAI Projects folder does not exist yet');
      return null;
    }
    
    const folder = folders.next();
    Logger.log('   ✓ Found SERPIFAI Projects folder');
    
    // Look for file matching project name
    const files = folder.getFilesByName(projectName);
    
    if (!files.hasNext()) {
      Logger.log('   ℹ️  No sheet found for: ' + projectName);
      return null;
    }
    
    const file = files.next();
    Logger.log('   ✓ Found file: ' + file.getName());
    
    try {
      const spreadsheet = SpreadsheetApp.openById(file.getId());
      const sheet = spreadsheet.getSheets()[0];
      Logger.log('   ✓ Opened sheet successfully');
      return sheet;
    } catch (openError) {
      Logger.log('   ❌ Error opening spreadsheet: ' + openError.toString());
      return null;
    }
    
  } catch (e) {
    Logger.log('❌ findProjectSheet error: ' + e.toString());
    return null;
  }
}

/**
 * Create new project sheet
 * IMPROVED: Much better error handling, logging, and permission checks
 */
function createProjectSheet(projectName) {
  try {
    Logger.log('🆕 Creating project sheet: ' + projectName);
    
    // Step 1: Create SERPIFAI Projects folder if not exists
    let folder;
    try {
      const folders = DriveApp.getFoldersByName('SERPIFAI Projects');
      
      if (folders.hasNext()) {
        folder = folders.next();
        Logger.log('   ✓ Found existing SERPIFAI Projects folder');
      } else {
        Logger.log('   📁 Creating new SERPIFAI Projects folder...');
        folder = DriveApp.createFolder('SERPIFAI Projects');
        Logger.log('   ✅ Created SERPIFAI Projects folder: ' + folder.getId());
      }
    } catch (folderError) {
      Logger.log('   ❌ Error with folder: ' + folderError.toString());
      throw new Error('Cannot access/create SERPIFAI Projects folder: ' + folderError.toString());
    }
    
    // Step 2: Create new spreadsheet
    let spreadsheet;
    let file;
    try {
      Logger.log('   📄 Creating new spreadsheet...');
      spreadsheet = SpreadsheetApp.create(projectName + ' - SerpifAI v6');
      file = DriveApp.getFileById(spreadsheet.getId());
      Logger.log('   ✅ Spreadsheet created: ' + spreadsheet.getId());
    } catch (createError) {
      Logger.log('   ❌ Error creating spreadsheet: ' + createError.toString());
      throw new Error('Cannot create spreadsheet: ' + createError.toString());
    }
    
    // Step 3: Move to SERPIFAI Projects folder
    try {
      Logger.log('   🚚 Moving sheet to folder...');
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      Logger.log('   ✅ Sheet moved to SERPIFAI Projects folder');
    } catch (moveError) {
      Logger.log('   ⚠️  Warning: Could not move to folder: ' + moveError.toString());
      // Don't fail here - sheet was created, just not organized
    }
    
    // Step 4: Set up headers
    try {
      Logger.log('   📋 Setting up headers...');
      const sheet = spreadsheet.getSheets()[0];
      setupProjectSheetHeaders(sheet);
      Logger.log('   ✅ Headers set up');
      return sheet;
    } catch (headerError) {
      Logger.log('   ❌ Error setting up headers: ' + headerError.toString());
      throw new Error('Cannot set up headers: ' + headerError.toString());
    }
    
  } catch (e) {
    Logger.log('❌ Error creating sheet: ' + e.toString());
    throw e;
  }
}

/**
 * Set up project sheet headers (unified JSON cell architecture)
 * Single JSON cell stores all project data for easy UI integration and sync
 */
function setupProjectSheetHeaders(sheet) {
  try {
    // Unified single-cell JSON architecture
    // Row 1: Metadata
    // Row 2: Complete JSON data cell
    
    const headers = [
      'Project Metadata',
      'Value'
    ];
    
    // Row 1: Metadata headers
    sheet.appendRow(headers);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1f77b4')
              .setFontColor('#ffffff')
              .setFontWeight('bold')
              .setFontSize(12);
    
    // Row 2: Metadata fields
    sheet.appendRow(['Project Name', '']);
    sheet.appendRow(['Project ID', '']);
    sheet.appendRow(['Created At', '']);
    sheet.appendRow(['Updated At', '']);
    sheet.appendRow(['Status', 'active']);
    sheet.appendRow(['Credits Used', '0']);
    
    // Row 8: Separator
    sheet.appendRow(['', '']);
    
    // Row 9: Data cell label
    sheet.appendRow(['PROJECT DATA (JSON)', '']);
    
    // Format data label
    const dataLabelRange = sheet.getRange(9, 1, 1, 2);
    dataLabelRange.setBackground('#2d5016')
                  .setFontColor('#ffffff')
                  .setFontWeight('bold')
                  .setFontSize(11);
    
    // Row 10: Actual JSON data cell (very tall for large data)
    sheet.appendRow(['[JSON DATA CELL]']);
    
    // Format JSON data cell for large content
    const jsonCell = sheet.getRange(10, 1);
    jsonCell.setWrap(true)
            .setFontSize(9)
            .setBackground('#f8f9fa');
    
    // Set optimal column widths
    sheet.setColumnWidth(1, 250);  // Metadata/Data
    sheet.setColumnWidth(2, 600);  // JSON content (very wide)
    
    // Set row heights
    sheet.setRowHeight(1, 25);      // Header
    sheet.setRowHeight(9, 25);      // Data label
    sheet.setRowHeight(10, 2000);   // JSON data cell (very tall)
    
    Logger.log('✅ Unified JSON sheet structure set up');
    
  } catch (e) {
    Logger.log('❌ Error setting up headers: ' + e.toString());
  }
}

/**
 * Populate project sheet with unified JSON data (single cell architecture)
 * Metadata in rows 2-7, JSON data in cell B10
 */
function populateProjectSheet(sheet, projectData) {
  try {
    Logger.log('📝 Populating unified sheet with project data');
    
    // Update metadata rows (read from flat projectData structure)
    sheet.getRange(2, 2).setValue(projectData.projectName || '');
    sheet.getRange(3, 2).setValue(projectData.projectId || 'proj_' + Date.now());
    sheet.getRange(4, 2).setValue(projectData.createdAt || new Date().toISOString());
    sheet.getRange(5, 2).setValue(projectData.updatedAt || new Date().toISOString());
    sheet.getRange(6, 2).setValue('active'); // Status
    sheet.getRange(7, 2).setValue(0); // Credits used
    
    // Prepare JSON data (pretty-printed for readability)
    const jsonData = JSON.stringify(projectData, null, 2);
    
    // Store in single JSON cell (B10)
    sheet.getRange(10, 2).setValue(jsonData);
    
    // Auto-fit row height for JSON data (up to max reasonable height)
    const jsonLength = jsonData.length;
    const estimatedRows = Math.ceil(jsonLength / 100);
    const rowHeight = Math.min(3000, estimatedRows * 30);
    sheet.setRowHeight(10, rowHeight);
    
    Logger.log('✅ Sheet populated with unified JSON data (' + jsonLength + ' bytes, ' + Object.keys(projectData).length + ' fields)');
    
  } catch (e) {
    Logger.log('❌ Error populating sheet: ' + e.toString());
  }
}

/**
 * Extract project data from unified JSON cell (B10)
 * Parses single JSON cell and returns complete project structure
 */
function extractProjectDataFromSheet(sheet) {
  try {
    // Read metadata
    const metadata = {
      projectName: sheet.getRange(2, 2).getValue(),
      projectId: sheet.getRange(3, 2).getValue(),
      createdAt: sheet.getRange(4, 2).getValue(),
      updatedAt: sheet.getRange(5, 2).getValue(),
      status: sheet.getRange(6, 2).getValue(),
      creditsUsed: sheet.getRange(7, 2).getValue()
    };
    
    // Read unified JSON data from cell B10
    const jsonCell = sheet.getRange(10, 2).getValue();
    
    if (!jsonCell || jsonCell === '[JSON DATA CELL]') {
      Logger.log('⚠️  No JSON data found in cell B10');
      return metadata;
    }
    
    try {
      const parsedData = JSON.parse(jsonCell);
      Logger.log('✅ Extracted unified JSON data from sheet (' + jsonCell.length + ' bytes)');
      return parsedData;
    } catch (parseError) {
      Logger.log('⚠️  Could not parse JSON: ' + parseError.toString());
      return metadata;
    }
    
  } catch (e) {
    Logger.log('❌ Error extracting data: ' + e.toString());
    return {};
  }
}

/**
 * Get all project sheets in SERPIFAI Projects folder
 */
function getProjectSheets() {
  try {
    const sheets = [];
    const folders = DriveApp.getFoldersByName('SERPIFAI Projects');
    
    if (!folders.hasNext()) {
      return sheets;
    }
    
    const folder = folders.next();
    const files = folder.getFiles();
    
    while (files.hasNext()) {
      const file = files.next();
      const lastUpdated = file.getLastUpdated();
      sheets.push({
        name: file.getName().replace(' - SerpifAI v6', ''),
        id: file.getId(),
        lastModified: lastUpdated ? lastUpdated.toISOString() : new Date().toISOString()
      });
    }
    
    return sheets;
    
  } catch (e) {
    Logger.log('❌ Error getting project sheets: ' + e.toString());
    return [];
  }
}

// ============================================================================
// CACHE AND SYNC FUNCTIONS
// ============================================================================

/**
 * Get from cache or load from MySQL (for performance)
 * Uses PropertiesService for fast access
 */
function getProjectFromCache(projectName) {
  try {
    const cache = CacheService.getUserCache();
    const cacheKey = 'project_' + projectName;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      Logger.log('✅ Loaded from cache: ' + projectName);
      return JSON.parse(cachedData);
    }
    
    // Not in cache, load from sheet or MySQL
    const projectData = loadProjectDual(projectName);
    
    if (projectData.success) {
      // Cache for 6 hours
      cache.put(cacheKey, JSON.stringify(projectData.data), 21600);
      Logger.log('✅ Cached project: ' + projectName);
    }
    
    return projectData;
    
  } catch (e) {
    Logger.log('⚠️  Cache error: ' + e.toString());
    return loadProjectDual(projectName);
  }
}

/**
 * Update project data and sync to both storages + cache
 */
function updateProjectData(projectName, dataUpdate) {
  try {
    Logger.log('🔄 Updating project: ' + projectName);
    
    // Load current project
    const current = loadProjectDual(projectName);
    
    if (!current.success) {
      return { success: false, error: 'Project not found' };
    }
    
    // Merge updates
    const updated = Object.assign(current.data, dataUpdate);
    
    // Save with updates
    const saveResult = saveProjectDual(projectName, updated);
    
    if (saveResult.ok) {
      // Update cache
      const cache = CacheService.getUserCache();
      const cacheKey = 'project_' + projectName;
      cache.put(cacheKey, JSON.stringify(updated), 21600);
      Logger.log('✅ Project updated and synced');
    }
    
    return saveResult;
    
  } catch (e) {
    Logger.log('❌ Error updating project: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Sync specific data type (competitor, workflow, fetcher, ui, analysis)
 */
function syncDataType(projectName, dataType, data) {
  try {
    Logger.log('🔄 Syncing ' + dataType + ' data for: ' + projectName);
    
    // Load full project
    const project = loadProjectDual(projectName);
    
    if (!project.success) {
      return { success: false, error: 'Project not found' };
    }
    
    // Update specific data type
    if (project.data[dataType]) {
      Object.assign(project.data[dataType], data);
    } else {
      project.data[dataType] = data;
    }
    
    // Save updated project
    const result = saveProjectDual(projectName, project.data);
    
    Logger.log('✅ ' + dataType + ' data synced');
    return result;
    
  } catch (e) {
    Logger.log('❌ Error syncing ' + dataType + ': ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Clear cache for project (forces fresh load)
 */
function clearProjectCache(projectName) {
  try {
    const cache = CacheService.getUserCache();
    const cacheKey = 'project_' + projectName;
    cache.remove(cacheKey);
    Logger.log('✅ Cache cleared for: ' + projectName);
    return { success: true };
  } catch (e) {
    Logger.log('⚠️  Error clearing cache: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  try {
    const cache = CacheService.getUserCache();
    // Note: Apps Script cache API doesn't provide stats
    // This is a placeholder for monitoring
    return {
      cacheService: 'active',
      maxSize: '6 hours',
      note: 'Use cache.remove() to clear individual projects'
    };
  } catch (e) {
    return { error: e.toString() };
  }
}

// ============================================================================
// MASTER GOOGLE SHEET INTEGRATION
// Save all projects to centralized master sheet (same as competitor analysis)
// ============================================================================

/**
 * Save project to MASTER Google Sheet (centralized database)
 * Uses the same master sheet as competitor analysis
 * @param {string} projectName - Project name
 * @param {object} projectData - All project data (UI fields + competitor data + workflow data)
 * @returns {object} {success: boolean, spreadsheetId, url, row}
 */
function saveProjectToMasterSheet(projectName, projectData) {
  try {
    Logger.log('📊 Saving to Master Google Sheet: ' + projectName);
    
    // Get or create the master spreadsheet (uses same function as competitor analysis)
    const ss = getOrCreateMasterSpreadsheet(); // From DB_COMP_EliteOrchestrator.gs
    
    if (!ss) {
      Logger.log('   ❌ Master spreadsheet not available - run setupMasterSpreadsheet() first');
      return {
        success: false,
        error: 'Master spreadsheet not configured. Run setupMasterSpreadsheet() to initialize.'
      };
    }
    
    Logger.log('   ✅ Master spreadsheet accessed: ' + ss.getName());
    
    // Get or create SEPARATE tabs for different project types
    // USER_PROJECTS = Regular projects with 81 form fields
    // Master_Projects = Competitor analysis projects (used by DB_COMP_EliteOrchestrator)
    const userProjectsSheet = getOrCreateSheet(ss, '📝 User_Projects');
    
    // Initialize headers with ALL 81 input fields as individual columns
    if (userProjectsSheet.getLastRow() === 0) {
      const headers = [
        // Metadata columns (8)
        'Project Name', 'Created At', 'Last Updated', 'Workflow Stage', 
        'Completed Fields', 'Total Fields', 'Progress %', 'Status',
        
        // Stage 1: Market Research & Strategy (18 fields)
        'Brand Ideology', 'Brand Archetype', 'Quarterly Objective', 'Brand Name',
        'Core Topic', 'Target Audience', 'Audience Pains', 'Audience Desired',
        'Key Competitors', 'Offer Matrix', 'Primary Offer Name', 'Primary Offer Price',
        'Upsell Offer', 'Upsell Price', 'UVP', 'Primary Channels', 'North Star KPIs', 'Brand Lexicon',
        
        // Stage 2: Keyword Discovery (10 fields)
        'Core Strategic Question', 'Thesis', 'Antithesis', 'Key Market Data', 'Category Definition',
        'Core Market Problem', 'Future Vision', 'Primary Keyword', 'Secondary Keywords', 'Keywords Entities',
        
        // Stage 3: Clustering & Architecture (10 fields)
        'Asset Title', 'Foundational Pillars', 'Campaign Narrative', 'Pillar Context',
        'Parent Pillar URL', 'Child Spoke URLs', 'Internal Linking Strategy',
        'Funnel Stage', 'Timeframe Plan', 'Content Type',
        
        // Stage 4: Content Calendar (3 fields)
        'Calendar Horizon', 'Posts Per Week', 'Visual Hooks',
        
        // Stage 5: Content Generation & E-E-A-T (32 fields)
        'Content Format', 'Content Subcategory', 'Persuasion Framework', 'Unique Mechanism',
        'Readability Directives', 'Platform Context', 'Forbidden Terms', 'AI Persona Context',
        'Schema Article', 'Schema FAQ', 'Author Bio', 'Primary Source 1', 'Primary Source 2',
        'Expert Quote 1', 'Expert Quote 2', 'Proprietary Data', 'Case Study 1', 'Case Study 2', 'Case Study 3',
        'Trust Anchors', 'Social Proof', 'Testimonial 1', 'Testimonial 2', 'Lead Magnet Name',
        'Bundle 1 Name', 'Bundle 1 Value', 'Bundle 2 Name', 'Bundle 2 Value',
        'Bundle 3 Name', 'Bundle 3 Value', 'Bundle 4 Name', 'Bundle 4 Value',
        
        // Legacy/QA fields (15 fields)
        'Comp Market Intelligence', 'Comp Brand Positioning', 'Comp Technical SEO', 'Comp Organic Content',
        'Comp Keyword Entity', 'Comp Content Ops', 'Comp Conversion', 'Comp Distribution',
        'Comp Audience Psych', 'Comp GEO/AEO', 'Comp Authority', 'Comp Performance',
        'Comp Opportunity', 'Comp Scoring Engine', 'Comp Exec Deliverables',
        
        // Full JSON backup (1 field)
        'JSON Backup (Full Data)'
      ];
      
      userProjectsSheet.appendRow(headers);
      formatHeaderRow(userProjectsSheet, headers.length);
      
      // Freeze header row and first column
      userProjectsSheet.setFrozenRows(1);
      userProjectsSheet.setFrozenColumns(1);
      
      Logger.log('   ✅ Created User_Projects sheet with ' + headers.length + ' columns (8 metadata + 81 fields + 1 JSON backup)');
    }
    
    // Prepare user project row data with ALL 81 fields as individual columns
    const createdAt = projectData.createdAt || projectData._metadata?.savedAt || new Date().toISOString();
    const timestamp = new Date().toISOString();
    
    // Count completed fields (non-empty values)
    const allFieldKeys = Object.keys(projectData).filter(k => !k.startsWith('_') && k !== 'competitorAnalysis' && k !== 'qaData');
    const completedFields = allFieldKeys.filter(k => {
      const val = projectData[k];
      return val && String(val).trim().length > 0;
    }).length;
    
    // Calculate progress percentage
    const totalFields = 81;
    const progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    
    // Determine workflow stage from form data
    let workflowStage = 'Setup';
    if (projectData.stage5Generation || projectData.workflowStage5) workflowStage = 'Stage 5';
    else if (projectData.stage4Calendar || projectData.workflowStage4) workflowStage = 'Stage 4';
    else if (projectData.stage3Architecture || projectData.workflowStage3) workflowStage = 'Stage 3';
    else if (projectData.stage2Keywords || projectData.workflowStage2) workflowStage = 'Stage 2';
    else if (projectData.stage1Strategy || projectData.workflowStage1) workflowStage = 'Stage 1';
    
    // Determine project status
    const status = progress === 100 ? 'Complete' : (progress > 0 ? 'In Progress' : 'New');
    
    // Helper function to safely get field value
    const getField = function(fieldName) {
      const val = projectData[fieldName];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };
    
    // Check if project already exists
    const existingRow = findProjectRow(userProjectsSheet, projectName);
    
    // Build row data with ALL 81 fields as individual columns (90 columns total)
    const rowData = [
      // Metadata (8 columns)
      projectName,
      createdAt,
      timestamp,
      workflowStage,
      completedFields,
      totalFields,
      progress,
      status,
      
      // Stage 1: Market Research & Strategy (18 fields)
      getField('brandIdeology'),
      getField('brandArchetype'),
      getField('quarterlyObjective'),
      getField('brandName'),
      getField('coreTopic'),
      getField('targetAudience'),
      getField('audiencePains'),
      getField('audienceDesired'),
      getField('keyCompetitors'),
      getField('offerMatrix'),
      getField('primaryOfferName'),
      getField('primaryOfferPrice'),
      getField('upsellOffer'),
      getField('upsellPrice'),
      getField('uvp'),
      getField('primaryChannels'),
      getField('northStarKpis'),
      getField('brandLexicon'),
      
      // Stage 2: Keyword Discovery (10 fields)
      getField('coreStrategicQuestion'),
      getField('thesis'),
      getField('antithesis'),
      getField('keyMarketData'),
      getField('categoryDefinition'),
      getField('coreMarketProblem'),
      getField('futureVision'),
      getField('primaryKeyword'),
      getField('secondaryKeywords'),
      getField('keywordsEntities'),
      
      // Stage 3: Clustering & Architecture (10 fields)
      getField('assetTitle'),
      getField('foundationalPillars'),
      getField('campaignNarrative'),
      getField('pillarContext'),
      getField('parentPillarUrl'),
      getField('childSpokeUrls'),
      getField('internalLinkingStrategy'),
      getField('funnelStage'),
      getField('timeframePlan'),
      getField('contentType'),
      
      // Stage 4: Content Calendar (3 fields)
      getField('calendarHorizon'),
      getField('postsPerWeek'),
      getField('visualHooks'),
      
      // Stage 5: Content Generation & E-E-A-T (32 fields)
      getField('contentFormat'),
      getField('contentSubcategory'),
      getField('persuasionFramework'),
      getField('uniqueMechanism'),
      getField('readabilityDirectives'),
      getField('platformContext'),
      getField('forbiddenTerms'),
      getField('aiPersonaContext'),
      getField('schemaArticle'),
      getField('schemaFaq'),
      getField('authorBio'),
      getField('primarySource1'),
      getField('primarySource2'),
      getField('expertQuote1'),
      getField('expertQuote2'),
      getField('proprietaryData'),
      getField('caseStudy1'),
      getField('caseStudy2'),
      getField('caseStudy3'),
      getField('trustAnchors'),
      getField('socialProof'),
      getField('testimonial1'),
      getField('testimonial2'),
      getField('leadMagnetName'),
      getField('bundle1Name'),
      getField('bundle1Value'),
      getField('bundle2Name'),
      getField('bundle2Value'),
      getField('bundle3Name'),
      getField('bundle3Value'),
      getField('bundle4Name'),
      getField('bundle4Value'),
      
      // Legacy/QA fields (15 fields)
      getField('compMarketIntelligence'),
      getField('compBrandPositioning'),
      getField('compTechnicalSeo'),
      getField('compOrganicContent'),
      getField('compKeywordEntity'),
      getField('compContentOps'),
      getField('compConversion'),
      getField('compDistribution'),
      getField('compAudiencePsych'),
      getField('compGeoAeo'),
      getField('compAuthority'),
      getField('compPerformance'),
      getField('compOpportunity'),
      getField('compScoringEngine'),
      getField('compExecDeliverables'),
      
      // Full JSON backup (1 field) - for compatibility and advanced data
      JSON.stringify(projectData)
    ];
    
    if (existingRow > 0) {
      // Update existing row
      userProjectsSheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      Logger.log('   ✅ Updated existing project row: ' + existingRow + ' (' + rowData.length + ' columns)');
    } else {
      // Insert new row
      userProjectsSheet.appendRow(rowData);
      Logger.log('   ✅ Inserted new project row (' + rowData.length + ' columns)');
    }
    
    // Also save to Workflow_Stages tab if workflow data exists
    if (projectData.stage1Strategy || projectData.stage2Keywords || projectData.stage3Architecture || 
        projectData.stage4Calendar || projectData.stage5Generation) {
      
      const workflowSheet = getOrCreateSheet(ss, '⚙️ Workflow_Stages');
      
      if (workflowSheet.getLastRow() === 0) {
        workflowSheet.appendRow([
          'Project Name', 'Timestamp', 'Stage', 'Status', 'Input Data JSON',
          'Output Data JSON', 'Credits Used', 'Duration (ms)'
        ]);
        formatHeaderRow(workflowSheet, 8);
      }
      
      // Log each completed stage
      const stages = [
        { num: 1, data: projectData.stage1Strategy || projectData.workflowStage1 },
        { num: 2, data: projectData.stage2Keywords || projectData.workflowStage2 },
        { num: 3, data: projectData.stage3Architecture || projectData.workflowStage3 },
        { num: 4, data: projectData.stage4Calendar || projectData.workflowStage4 },
        { num: 5, data: projectData.stage5Generation || projectData.workflowStage5 }
      ];
      
      stages.forEach(function(stage) {
        if (stage.data && typeof stage.data === 'object' && Object.keys(stage.data).length > 0) {
          workflowSheet.appendRow([
            projectName,
            timestamp,
            'Stage ' + stage.num,
            'Completed',
            JSON.stringify(stage.data),
            JSON.stringify({ saved: true }),
            0,
            0
          ]);
        }
      });
      
      Logger.log('   ✅ Saved workflow stages');
    }
    
    return {
      success: true,
      spreadsheetId: ss.getId(),
      spreadsheetName: ss.getName(),
      url: ss.getUrl(),
      projectName: projectName,
      row: existingRow > 0 ? existingRow : userProjectsSheet.getLastRow()
    };
    
  } catch (error) {
    Logger.log('   ❌ Master Sheet save error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load project from MASTER Google Sheet (User_Projects tab with all 81 fields)
 * @param {string} projectName - Project name to load
 * @returns {object} {success: boolean, data: object, updatedAt: string}
 */
function loadProjectFromMasterSheet(projectName) {
  try {
    Logger.log('📂 Loading from Master Google Sheet: ' + projectName);
    
    const ss = getOrCreateMasterSpreadsheet();
    if (!ss) {
      Logger.log('   ⚠️  Master spreadsheet not available');
      return { success: false, error: 'Master spreadsheet not configured' };
    }
    
    const userProjectsSheet = getOrCreateSheet(ss, '📝 User_Projects');
    
    // Find project row
    const rowIndex = findProjectRow(userProjectsSheet, projectName);
    
    if (rowIndex < 1) {
      Logger.log('   ⚠️ Project not found in master sheet');
      return { success: false, error: 'Project not found' };
    }
    
    // Get total columns (should be 90: 8 metadata + 81 fields + 1 JSON backup)
    const lastCol = userProjectsSheet.getLastColumn();
    const rowData = userProjectsSheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
    
    // Try to parse from JSON backup column (last column) first
    const jsonBackup = rowData[lastCol - 1];
    let projectData = {};
    
    if (jsonBackup && typeof jsonBackup === 'string' && jsonBackup.length > 10) {
      try {
        projectData = JSON.parse(jsonBackup);
        Logger.log('   ✅ Loaded from JSON backup column');
      } catch (e) {
        Logger.log('   ⚠️ Could not parse JSON backup, reading individual columns: ' + e.toString());
      }
    }
    
    // If JSON parse failed, reconstruct from individual columns
    if (!projectData || Object.keys(projectData).length === 0) {
      Logger.log('   📊 Reconstructing data from individual columns...');
      
      projectData = {
        // Metadata
        projectName: rowData[0],
        createdAt: rowData[1],
        updatedAt: rowData[2],
        workflowStage: rowData[3],
        
        // Stage 1: Market Research & Strategy (18 fields, starting at index 8)
        brandIdeology: rowData[8] || '',
        brandArchetype: rowData[9] || '',
        quarterlyObjective: rowData[10] || '',
        brandName: rowData[11] || '',
        coreTopic: rowData[12] || '',
        targetAudience: rowData[13] || '',
        audiencePains: rowData[14] || '',
        audienceDesired: rowData[15] || '',
        keyCompetitors: rowData[16] || '',
        offerMatrix: rowData[17] || '',
        primaryOfferName: rowData[18] || '',
        primaryOfferPrice: rowData[19] || '',
        upsellOffer: rowData[20] || '',
        upsellPrice: rowData[21] || '',
        uvp: rowData[22] || '',
        primaryChannels: rowData[23] || '',
        northStarKpis: rowData[24] || '',
        brandLexicon: rowData[25] || '',
        
        // Stage 2: Keyword Discovery (10 fields, starting at index 26)
        coreStrategicQuestion: rowData[26] || '',
        thesis: rowData[27] || '',
        antithesis: rowData[28] || '',
        keyMarketData: rowData[29] || '',
        categoryDefinition: rowData[30] || '',
        coreMarketProblem: rowData[31] || '',
        futureVision: rowData[32] || '',
        primaryKeyword: rowData[33] || '',
        secondaryKeywords: rowData[34] || '',
        keywordsEntities: rowData[35] || '',
        
        // Stage 3: Clustering & Architecture (10 fields, starting at index 36)
        assetTitle: rowData[36] || '',
        foundationalPillars: rowData[37] || '',
        campaignNarrative: rowData[38] || '',
        pillarContext: rowData[39] || '',
        parentPillarUrl: rowData[40] || '',
        childSpokeUrls: rowData[41] || '',
        internalLinkingStrategy: rowData[42] || '',
        funnelStage: rowData[43] || '',
        timeframePlan: rowData[44] || '',
        contentType: rowData[45] || '',
        
        // Stage 4: Content Calendar (3 fields, starting at index 46)
        calendarHorizon: rowData[46] || '',
        postsPerWeek: rowData[47] || '',
        visualHooks: rowData[48] || '',
        
        // Stage 5: Content Generation & E-E-A-T (32 fields, starting at index 49)
        contentFormat: rowData[49] || '',
        contentSubcategory: rowData[50] || '',
        persuasionFramework: rowData[51] || '',
        uniqueMechanism: rowData[52] || '',
        readabilityDirectives: rowData[53] || '',
        platformContext: rowData[54] || '',
        forbiddenTerms: rowData[55] || '',
        aiPersonaContext: rowData[56] || '',
        schemaArticle: rowData[57] || '',
        schemaFaq: rowData[58] || '',
        authorBio: rowData[59] || '',
        primarySource1: rowData[60] || '',
        primarySource2: rowData[61] || '',
        expertQuote1: rowData[62] || '',
        expertQuote2: rowData[63] || '',
        proprietaryData: rowData[64] || '',
        caseStudy1: rowData[65] || '',
        caseStudy2: rowData[66] || '',
        caseStudy3: rowData[67] || '',
        trustAnchors: rowData[68] || '',
        socialProof: rowData[69] || '',
        testimonial1: rowData[70] || '',
        testimonial2: rowData[71] || '',
        leadMagnetName: rowData[72] || '',
        bundle1Name: rowData[73] || '',
        bundle1Value: rowData[74] || '',
        bundle2Name: rowData[75] || '',
        bundle2Value: rowData[76] || '',
        bundle3Name: rowData[77] || '',
        bundle3Value: rowData[78] || '',
        bundle4Name: rowData[79] || '',
        bundle4Value: rowData[80] || '',
        
        // Legacy/QA fields (15 fields, starting at index 81)
        compMarketIntelligence: rowData[81] || '',
        compBrandPositioning: rowData[82] || '',
        compTechnicalSeo: rowData[83] || '',
        compOrganicContent: rowData[84] || '',
        compKeywordEntity: rowData[85] || '',
        compContentOps: rowData[86] || '',
        compConversion: rowData[87] || '',
        compDistribution: rowData[88] || '',
        compAudiencePsych: rowData[89] || '',
        compGeoAeo: rowData[90] || '',
        compAuthority: rowData[91] || '',
        compPerformance: rowData[92] || '',
        compOpportunity: rowData[93] || '',
        compScoringEngine: rowData[94] || '',
        compExecDeliverables: rowData[95] || '',
        
        // Add metadata
        _metadata: {
          savedAt: rowData[2], // Last Updated
          version: 'v6.0.0',
          totalFields: rowData[5] || 81,
          completedFields: rowData[4] || 0,
          progress: rowData[6] || 0,
          status: rowData[7] || 'New'
        }
      };
      
      Logger.log('   ✅ Reconstructed from ' + lastCol + ' columns');
    }
    
    Logger.log('   ✅ Loaded project from master sheet (User_Projects tab) - ' + Object.keys(projectData).length + ' fields');
    
    return {
      success: true,
      name: projectName,
      data: projectData,
      updatedAt: rowData[2], // Last Updated column (column 3)
      createdAt: rowData[1], // Created At column (column 2)
      workflowStage: rowData[3], // Workflow Stage column (column 4)
      completedFields: rowData[4], // Completed Fields column (column 5)
      totalFields: rowData[5], // Total Fields column (column 6)
      progress: rowData[6], // Progress % column (column 7)
      status: rowData[7] // Status column (column 8)
    };
    
  } catch (error) {
    Logger.log('   ❌ Master Sheet load error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * List all projects from MASTER Google Sheet (User_Projects tab with all fields visible)
 * @returns {object} {success: boolean, projects: [{name, spreadsheetId, lastModified}]}
 */
function listProjectsFromMasterSheet() {
  try {
    Logger.log('📋 Listing projects from Master Sheet (User_Projects)...');
    
    const ss = getOrCreateMasterSpreadsheet();
    if (!ss) {
      Logger.log('   ⚠️  Master spreadsheet not available');
      return { success: false, error: 'Master spreadsheet not configured', projects: [] };
    }
    
    const userProjectsSheet = getOrCreateSheet(ss, '📝 User_Projects');
    const lastRow = userProjectsSheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('   ℹ️ No projects in master sheet yet');
      return { success: true, projects: [], count: 0 };
    }
    
    // Get all project data (skip header row)
    // Read first 8 metadata columns only for list view
    const data = userProjectsSheet.getRange(2, 1, lastRow - 1, 8).getValues();
    
    const projects = data.map(function(row) {
      return {
        name: row[0], // Project Name
        spreadsheetId: ss.getId(),
        createdAt: row[1], // Created At
        lastModified: row[2], // Last Updated
        workflowStage: row[3], // Workflow Stage
        completedFields: row[4], // Completed Fields
        totalFields: row[5], // Total Fields
        progress: row[6], // Progress %
        status: row[7], // Status
        brandName: '' // Will be in column 12 if needed
      };
    }).filter(function(p) {
      return p.name && p.name.trim().length > 0;
    });
    
    Logger.log('   ✅ Found ' + projects.length + ' projects in Master Sheet (User_Projects)');
    
    return {
      success: true,
      projects: projects,
      count: projects.length
    };
    
  } catch (error) {
    Logger.log('   ❌ Error listing from Master Sheet: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      projects: []
    };
  }
}

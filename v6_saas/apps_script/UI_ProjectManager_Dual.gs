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
    
    // Unify all data into standard project structure
    const unifiedData = unifyProjectData(projectData);
    
    const results = {
      sheet: null,
      mysql: null,
      success: false
    };
    
    // ============================================================================
    // SAVE TO GOOGLE SHEETS (Single JSON cell)
    // ============================================================================
    try {
      Logger.log('   📊 Saving to Google Sheets (unified JSON)...');
      const sheetResult = saveProjectToSheet(projectName, unifiedData);
      results.sheet = sheetResult;
      Logger.log('   ✅ Sheet save: ' + (sheetResult.success ? 'Success' : 'Failed'));
    } catch (e) {
      Logger.log('   ❌ Sheet save error: ' + e.toString());
      results.sheet = { success: false, error: e.toString() };
    }
    
    // ============================================================================
    // SAVE TO MYSQL (Sync for caching and data persistence)
    // ============================================================================
    try {
      Logger.log('   🗄️  Syncing to MySQL...');
      const mysqlResult = saveProjectToDatabase(projectName, unifiedData);
      results.mysql = mysqlResult;
      Logger.log('   ✅ MySQL sync: ' + (mysqlResult.success ? 'Success' : 'Failed'));
    } catch (e) {
      Logger.log('   ❌ MySQL sync error: ' + e.toString());
      results.mysql = { success: false, error: e.toString() };
    }
    
    // Both successful
    if (results.sheet.success && results.mysql.success) {
      results.success = true;
      Logger.log('✅ [UNIFIED] Project saved to BOTH locations (Sheet + MySQL)');
      return {
        ok: true,
        name: projectName,
        sheet: results.sheet.sheetId,
        projectId: results.mysql.projectId,
        synced: true,
        dataSize: JSON.stringify(unifiedData).length,
        updatedAt: new Date().toISOString()
      };
    }
    
    // At least one succeeded
    if (results.sheet.success || results.mysql.success) {
      Logger.log('⚠️  [UNIFIED] Partial success - saved to ' + (results.sheet.success ? 'Sheet' : 'MySQL'));
      return {
        ok: true,
        name: projectName,
        partialSuccess: true,
        sheet: results.sheet.success ? results.sheet.sheetId : null,
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
 * Load project from Google Sheets (tries Sheet first, falls back to MySQL)
 */
function loadProjectDual(projectName) {
  try {
    Logger.log('📂 Loading project: ' + projectName);
    
    // Try to load from Sheet first
    try {
      Logger.log('   📊 Trying Google Sheets...');
      const sheetResult = loadProjectFromSheet(projectName);
      if (sheetResult.success) {
        Logger.log('   ✅ Found in Google Sheets');
        return sheetResult;
      }
    } catch (e) {
      Logger.log('   ⚠️  Sheet load failed: ' + e.toString());
    }
    
    // Fall back to MySQL
    try {
      Logger.log('   🗄️  Trying MySQL...');
      const mysqlResult = loadProjectFromDatabase(projectName);
      if (mysqlResult.success) {
        Logger.log('   ✅ Found in MySQL');
        // Sync back to Sheet if not found there
        try {
          saveProjectToSheet(projectName, mysqlResult.data);
          Logger.log('   📊 Synced to Google Sheets');
        } catch (syncError) {
          Logger.log('   ⚠️  Could not sync to Sheet: ' + syncError.toString());
        }
        return mysqlResult;
      }
    } catch (e) {
      Logger.log('   ⚠️  MySQL load failed: ' + e.toString());
    }
    
    // Not found anywhere
    Logger.log('❌ Project not found in either location');
    return {
      name: projectName,
      data: {},
      error: 'Project not found'
    };
    
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
 * List all projects from both sources
 */
function listProjectsDual() {
  try {
    Logger.log('📋 Listing all projects from both sources');
    
    const allProjects = {};
    
    // Get from Google Sheets
    try {
      Logger.log('   📊 Getting projects from Sheets...');
      const sheets = getProjectSheets();
      sheets.forEach(function(sheet) {
        allProjects[sheet.name] = {
          name: sheet.name,
          source: 'sheet',
          sheetId: sheet.id,
          lastModified: sheet.lastModified
        };
      });
      Logger.log('   ✅ Found ' + sheets.length + ' projects in Sheets');
    } catch (e) {
      Logger.log('   ⚠️  Could not get Sheet projects: ' + e.toString());
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
            // Already in Sheets, mark as synced
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
    
    // Update metadata rows
    sheet.getRange(2, 2).setValue(projectData.projectName || '');
    sheet.getRange(3, 2).setValue(projectData.projectId || '');
    sheet.getRange(4, 2).setValue(projectData.createdAt || new Date().toISOString());
    sheet.getRange(5, 2).setValue(new Date().toISOString()); // Updated timestamp
    sheet.getRange(6, 2).setValue(projectData.metadata?.status || 'active');
    sheet.getRange(7, 2).setValue(projectData.metadata?.creditsUsed || 0);
    
    // Prepare JSON data (pretty-printed for readability)
    const jsonData = JSON.stringify(projectData, null, 2);
    
    // Store in single JSON cell (B10)
    sheet.getRange(10, 2).setValue(jsonData);
    
    // Auto-fit row height for JSON data (up to max reasonable height)
    const jsonLength = jsonData.length;
    const estimatedRows = Math.ceil(jsonLength / 100);
    const rowHeight = Math.min(3000, estimatedRows * 30);
    sheet.setRowHeight(10, rowHeight);
    
    Logger.log('✅ Sheet populated with unified JSON data (' + jsonLength + ' bytes)');
    
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

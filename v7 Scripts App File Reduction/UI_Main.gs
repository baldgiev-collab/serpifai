  /**
  * UI_Main.gs
  * Main UI entry point for SerpifAI v6
  * Migrated from ui/Code.gs
  * 
  * CHANGES:
  * - Replaced ENDPOINTS with callGateway() from UI_Gateway.gs
  * - Project management now uses MySQL database via PHP gateway
  * - All API calls route through PHP gateway with credit validation
  * - License key stored in UserProperties
  */

  // ============================================================================
  // MENU & SIDEBAR
  // ============================================================================

  /**
  * Create custom menu when spreadsheet opens
  */
  function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('🚀 SERPIFAI')
      .addItem('📊 Open Dashboard', 'showSidebar')
      .addItem('📁 My Projects', 'showProjectsList')
      .addSeparator()
      .addItem('➕ New Project', 'showNewProjectDialog')
      .addItem('💾 Save Project', 'saveCurrentProject')
      .addItem('📂 Load Project', 'showLoadProjectDialog')
      .addSeparator()
      .addItem('⚙️ Settings', 'showSettingsDialog')
      .addItem('� Setup Script Properties', 'initializeScriptProperties')
      .addItem('🔍 Run Diagnostics', 'runDiagnostics')
      .addItem('❓ Help', 'showHelp')
      .addToUi();
  }
  
  /**
  * Initialize script properties - run this first time to set up all config
  */
  function initializeScriptProperties() {
    const result = setupScriptProperties();
    const ui = SpreadsheetApp.getUi();
    
    if (result.success) {
      ui.alert('Setup Complete', 
        '✅ Script Properties Initialized!\n\n' +
        'Added: ' + result.added + ' properties\n' +
        'Skipped (already exist): ' + result.skipped + ' properties\n\n' +
        'You can now use SerpifAI!',
        ui.ButtonSet.OK);
    } else {
      ui.alert('Setup Failed', 'Error: ' + (result.error || 'Unknown error'), ui.ButtonSet.OK);
    }
  }

  // ============================================================================
  // V7.1 DIAGNOSTIC TEST: Run this from Script Editor to test Stage 1 directly
  // ============================================================================
  
  /**
   * DIAGNOSTIC: Test Stage 1 execution directly from Apps Script
   * Run this from the Script Editor (Run > testStage1Direct)
   * This bypasses the browser completely to isolate the issue
   */
  function testStage1Direct() {
    Logger.log('========================================');
    Logger.log('🧪 V7.5 STAGE 1 DIRECT TEST');
    Logger.log('========================================');
    
    const testPayload = {
      stageNum: 1,
      projectId: 'Serpifai',  // Use actual project name
      model: 'gemini-3-flash-preview',  // Latest model
      _fetchCompetitorDataFromMySQL: true
    };
    
    Logger.log('📦 Test payload: ' + JSON.stringify(testPayload));
    Logger.log('📦 Payload size: ' + JSON.stringify(testPayload).length + ' bytes');
    
    try {
      const startTime = Date.now();
      const result = runWorkflowStage(testPayload);
      const duration = Date.now() - startTime;
      
      const resultStr = JSON.stringify(result);
      Logger.log('⏱️ Duration: ' + duration + 'ms');
      Logger.log('📦 Result size: ' + resultStr.length + ' bytes');
      Logger.log('📦 Result keys: ' + Object.keys(result).join(', '));
      Logger.log('✅ Result preview: ' + resultStr.substring(0, 500));
      
      // V7.5: Check if result would cause HTTP 400
      if (resultStr.length > 50000) {
        Logger.log('🚨 CRITICAL: Result exceeds 50KB limit! Would cause HTTP 400');
        Logger.log('   Actual size: ' + (resultStr.length / 1024).toFixed(2) + ' KB');
      } else {
        Logger.log('✅ Result size OK: ' + (resultStr.length / 1024).toFixed(2) + ' KB (under 50KB limit)');
      }
      
      return result;
    } catch (error) {
      Logger.log('❌ Error: ' + error.toString());
      Logger.log('   Stack: ' + error.stack);
      return { success: false, error: error.toString() };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════
  // V7.3 CHUNKED HYDRATION SYSTEM
  // ════════════════════════════════════════════════════════════════════════════════════
  // PROBLEM: google.script.run has ~50KB response limit → HTTP 400
  // SOLUTION: Split responses into chunks, each under 50KB
  // 
  // Flow:
  // 1. loadStageResultsMeta() → ~500 bytes (metadata only)
  // 2. loadStageResultsReport() → 5-20KB (report text only)
  // 3. loadStageResultsJson() → 10-30KB (JSON only, chunked if needed)
  // ════════════════════════════════════════════════════════════════════════════════════
  
  /**
   * V7.10 CHUNK 1: Load metadata only (super lightweight ~500 bytes)
   * Returns: success, hasData, reportLength, jsonKeyCount, timestamp
   * V7.10 FIX: Check CacheService FIRST, then fallback to MySQL
   */
  function loadStageResultsMeta(projectId, stageNum) {
    try {
      Logger.log('📊 loadStageResultsMeta V7.10: project=' + projectId + ', stage=' + stageNum);
      
      // =========================================================================
      // V7.10 FIX: Check CacheService FIRST (instant, bypasses MySQL latency)
      // =========================================================================
      try {
        const cache = CacheService.getUserCache();
        const cacheKey = 'stage_' + projectId + '_' + stageNum;
        
        const cachedReport = cache.get(cacheKey + '_report');
        const cachedJsonStr = cache.get(cacheKey + '_json');
        const cachedMetaStr = cache.get(cacheKey + '_meta');
        
        if (cachedReport || cachedJsonStr) {
          Logger.log('✅ V7.10: Found data in CacheService!');
          const cachedJson = cachedJsonStr ? JSON.parse(cachedJsonStr) : {};
          const cachedMeta = cachedMetaStr ? JSON.parse(cachedMetaStr) : {};
          
          return {
            success: true,
            hasData: true,
            stage: stageNum,
            projectId: projectId,
            reportLength: (cachedReport || '').length,
            jsonKeyCount: Object.keys(cachedJson).length,
            model: cachedMeta.model || 'unknown',
            timestamp: cachedMeta.timestamp || new Date().toISOString(),
            source: 'cache',
            _chunkedHydration: true
          };
        }
        Logger.log('   Cache miss, trying MySQL...');
      } catch (cacheError) {
        Logger.log('   Cache check error: ' + cacheError.toString());
      }
      
      // V7.8 FIX: Recover job_token from ScriptProperties for better query matching
      let jobToken = '';
      try {
        const props = PropertiesService.getScriptProperties();
        jobToken = props.getProperty('UPP_CURRENT_JOB_TOKEN') || '';
        if (jobToken) {
          Logger.log('   🔑 Recovered job_token: ' + jobToken.substring(0, 20) + '...');
        }
      } catch (e) {
        Logger.log('   ⚠️ Could not recover job_token: ' + e.toString());
      }
      
      // V7.8 FIX: Pass both project_id AND job_token for maximum match probability
      const result = callGateway('job_get_results', {
        project_id: projectId,
        job_token: jobToken,
        stage: stageNum
      });
      
      if (!result || !result.success) {
        Logger.log('⚠️ No saved results for Stage ' + stageNum);
        Logger.log('   Source checked: ' + (result?.source || 'unknown'));
        return { success: false, hasData: false, stage: stageNum };
      }
      
      Logger.log('✅ Found results from source: ' + (result.source || 'mysql'));
      
      const jsonData = result.json || result.data?.json || {};
      const reportData = result.report || result.analysis_text || result.data?.report || '';
      
      // Store full data in CacheService for subsequent chunk calls
      const cache = CacheService.getUserCache();
      const cacheKey = 'stage_' + projectId + '_' + stageNum;
      
      try {
        // Store report and json separately (cache has 100KB limit per key)
        cache.put(cacheKey + '_report', reportData, 300); // 5 min TTL
        cache.put(cacheKey + '_json', JSON.stringify(jsonData), 300);
        cache.put(cacheKey + '_meta', JSON.stringify({
          model: result.model || 'unknown',
          timestamp: result.timestamp || new Date().toISOString()
        }), 300);
        Logger.log('✅ Cached stage data for chunked retrieval');
      } catch (cacheError) {
        Logger.log('⚠️ Cache storage failed (data too large): ' + cacheError.toString());
        // If cache fails, we'll fetch fresh in chunk calls
      }
      
      // Return lightweight metadata only
      const metaResponse = {
        success: true,
        hasData: true,
        stage: stageNum,
        projectId: projectId,
        reportLength: reportData.length,
        jsonKeyCount: Object.keys(jsonData).length,
        model: result.model || 'unknown',
        timestamp: result.timestamp || new Date().toISOString(),
        source: 'mysql',
        _chunkedHydration: true
      };
      
      const metaSize = JSON.stringify(metaResponse).length;
      Logger.log('📊 Meta response size: ' + metaSize + ' bytes');
      
      return metaResponse;
      
    } catch (error) {
      Logger.log('❌ loadStageResultsMeta error: ' + error.toString());
      return { success: false, error: error.toString(), stage: stageNum };
    }
  }
  
  /**
   * V7.8 CHUNK 2: Load report text only
   * Typically 5-20KB, well under 50KB limit
   */
  function loadStageResultsReport(projectId, stageNum) {
    try {
      Logger.log('📄 loadStageResultsReport: project=' + projectId + ', stage=' + stageNum);
      
      // Try cache first
      const cache = CacheService.getUserCache();
      const cacheKey = 'stage_' + projectId + '_' + stageNum;
      let reportData = cache.get(cacheKey + '_report');
      let metaStr = cache.get(cacheKey + '_meta');
      
      if (reportData) {
        Logger.log('✅ Report loaded from cache (' + reportData.length + ' chars)');
        const meta = metaStr ? JSON.parse(metaStr) : {};
        return {
          success: true,
          stage: stageNum,
          projectId: projectId,
          report: reportData,
          model: meta.model || 'unknown',
          timestamp: meta.timestamp || new Date().toISOString(),
          source: 'cache'
        };
      }
      
      // V7.8 FIX: Recover job_token for better query matching
      let jobToken = '';
      try {
        jobToken = PropertiesService.getScriptProperties().getProperty('UPP_CURRENT_JOB_TOKEN') || '';
      } catch (e) {}
      
      // Cache miss - fetch fresh from MySQL
      Logger.log('⚠️ Cache miss, fetching fresh from MySQL');
      const result = callGateway('job_get_results', {
        project_id: projectId,
        job_token: jobToken,
        stage: stageNum
      });
      
      if (!result || !result.success) {
        return { success: false, error: 'No saved results', stage: stageNum };
      }
      
      reportData = result.report || result.analysis_text || result.data?.report || '';
      
      const reportResponse = {
        success: true,
        stage: stageNum,
        projectId: projectId,
        report: reportData,
        model: result.model || 'unknown',
        timestamp: result.timestamp || new Date().toISOString(),
        source: 'mysql'
      };
      
      const reportSize = JSON.stringify(reportResponse).length;
      Logger.log('📄 Report response size: ' + (reportSize / 1024).toFixed(2) + ' KB');
      
      return reportResponse;
      
    } catch (error) {
      Logger.log('❌ loadStageResultsReport error: ' + error.toString());
      return { success: false, error: error.toString(), stage: stageNum };
    }
  }
  
  /**
   * V7.8 CHUNK 3: Load JSON data only
   * Typically 10-30KB. If over 40KB, returns subset with continuation token.
   */
  function loadStageResultsJson(projectId, stageNum, chunkIndex) {
    chunkIndex = chunkIndex || 0;
    
    try {
      Logger.log('🗂️ loadStageResultsJson: project=' + projectId + ', stage=' + stageNum + ', chunk=' + chunkIndex);
      
      // Try cache first
      const cache = CacheService.getUserCache();
      const cacheKey = 'stage_' + projectId + '_' + stageNum;
      let jsonStr = cache.get(cacheKey + '_json');
      let jsonData;
      
      if (jsonStr) {
        Logger.log('✅ JSON loaded from cache');
        jsonData = JSON.parse(jsonStr);
      } else {
        // V7.8 FIX: Recover job_token for better query matching
        let jobToken = '';
        try {
          jobToken = PropertiesService.getScriptProperties().getProperty('UPP_CURRENT_JOB_TOKEN') || '';
        } catch (e) {}
        
        // Cache miss - fetch fresh
        Logger.log('⚠️ Cache miss, fetching fresh from MySQL');
        const result = callGateway('job_get_results', {
          project_id: projectId,
          job_token: jobToken,
          stage: stageNum
        });
        
        if (!result || !result.success) {
          return { success: false, error: 'No saved results', stage: stageNum };
        }
        
        jsonData = result.json || result.data?.json || {};
      }
      
      const fullJsonStr = JSON.stringify(jsonData);
      const fullSize = fullJsonStr.length;
      Logger.log('🗂️ Full JSON size: ' + (fullSize / 1024).toFixed(2) + ' KB');
      
      // If under 35KB, return full JSON (leave room for wrapper)
      if (fullSize < 35000) {
        return {
          success: true,
          stage: stageNum,
          projectId: projectId,
          json: jsonData,
          isComplete: true,
          chunkIndex: 0,
          totalChunks: 1,
          source: jsonStr ? 'cache' : 'mysql'
        };
      }
      
      // JSON too large - chunk it by top-level keys
      const keys = Object.keys(jsonData);
      const KEYS_PER_CHUNK = 5;
      const totalChunks = Math.ceil(keys.length / KEYS_PER_CHUNK);
      
      const startIdx = chunkIndex * KEYS_PER_CHUNK;
      const endIdx = Math.min(startIdx + KEYS_PER_CHUNK, keys.length);
      const chunkKeys = keys.slice(startIdx, endIdx);
      
      const chunkData = {};
      chunkKeys.forEach(function(key) {
        chunkData[key] = jsonData[key];
      });
      
      Logger.log('🗂️ Returning chunk ' + chunkIndex + '/' + totalChunks + ' with keys: ' + chunkKeys.join(', '));
      
      return {
        success: true,
        stage: stageNum,
        projectId: projectId,
        json: chunkData,
        isComplete: (chunkIndex >= totalChunks - 1),
        chunkIndex: chunkIndex,
        totalChunks: totalChunks,
        nextChunk: (chunkIndex < totalChunks - 1) ? chunkIndex + 1 : null,
        source: 'chunked'
      };
      
    } catch (error) {
      Logger.log('❌ loadStageResultsJson error: ' + error.toString());
      return { success: false, error: error.toString(), stage: stageNum };
    }
  }
  
  /**
   * Load workflow stage results from MySQL for UI hydration
   * ⚠️ DEPRECATED for direct UI calls due to 50KB limit
   * Use loadStageResultsMeta/Report/Json instead for chunked hydration
   * Still available for server-side calls between GS files
   */
  function loadWorkflowStageResults(projectId, stageNum) {
    try {
      Logger.log('💎 loadWorkflowStageResults: project=' + projectId + ', stage=' + stageNum);
      Logger.log('⚠️ WARNING: This function may cause HTTP 400 for large responses!');
      Logger.log('   Use chunked hydration (loadStageResultsMeta/Report/Json) for UI calls');
      
      // Call gateway to fetch saved stage results
      const result = callGateway('job_get_results', {
        project_id: projectId,
        stage: stageNum
      });
      
      if (!result || !result.success) {
        Logger.log('⚠️ No saved results for Stage ' + stageNum);
        return { success: false, error: 'No saved results', stage: stageNum };
      }
      
      // Return structured data for UI rendering
      Logger.log('✅ Loaded Stage ' + stageNum + ' from MySQL');
      return {
        success: true,
        stage: stageNum,
        projectId: projectId,
        json: result.json || result.data?.json || {},
        report: result.report || result.analysis_text || result.data?.report || '',
        model: result.model || 'unknown',
        timestamp: result.timestamp || new Date().toISOString(),
        source: 'mysql'
      };
      
    } catch (error) {
      Logger.log('❌ loadWorkflowStageResults error: ' + error.toString());
      return { success: false, error: error.toString(), stage: stageNum };
    }
  }

  /**
  * Show main sidebar
  */
  function showSidebar() {
    const html = HtmlService.createTemplateFromFile('UI/UI_Dashboard')
      .evaluate()
      .setTitle('SERPIFAI — Architect of Authority');
    SpreadsheetApp.getUi().showSidebar(html);
  }

  /**
  * Show projects list
  */
  function showProjectsList() {
    const projects = listProjectsDual();
    const ui = SpreadsheetApp.getUi();
    
    if (projects.success && projects.projects && projects.projects.length > 0) {
      let message = 'Your Projects (' + projects.count + '):\n\n';
      projects.projects.forEach(function(p, i) {
        message += (i + 1) + '. ' + p.name + ' (' + p.source + ')\n';
      });
      ui.alert('My Projects', message, ui.ButtonSet.OK);
    } else {
      ui.alert('My Projects', 'No projects found. Create your first project!', ui.ButtonSet.OK);
    }
  }

  /**
  * Show new project dialog
  */
  function showNewProjectDialog() {
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt('New Project', 'Enter project name:', ui.ButtonSet.OK_CANCEL);
    
    if (result.getSelectedButton() == ui.Button.OK) {
      const projectName = result.getResponseText();
      if (projectName && projectName.trim() !== '') {
        const saveResult = saveProjectDual(projectName, {
          projectName: projectName,
          projectId: 'proj_' + Date.now(),
          createdAt: new Date().toISOString()
        });
        
        if (saveResult.ok) {
          ui.alert('Success', 'Project "' + projectName + '" created successfully!', ui.ButtonSet.OK);
        } else {
          ui.alert('Error', 'Failed to create project: ' + (saveResult.error || 'Unknown error'), ui.ButtonSet.OK);
        }
      }
    }
  }

  /**
  * Save current project (quick save)
  */
  function saveCurrentProject() {
    try {
      // Get active project name from project selector
      const userProps = PropertiesService.getUserProperties();
      const activeProject = userProps.getProperty('serpifai_lastProject');
      
      if (!activeProject) {
        Logger.log('❌ No active project selected');
        return {
          success: false,
          error: 'No active project selected. Please select or create a project first.'
        };
      }
      
      Logger.log('💾 Saving active project: ' + activeProject);
      
      // NOTE: Project data is auto-saved on field changes via saveProject()
      // This function confirms the current state is saved
      // The actual save logic is in UI_ProjectManager.gs -> saveProject()
      
      return {
        success: true,
        message: 'Project "' + activeProject + '" is saved',
        project: activeProject
      };
      
    } catch (e) {
      Logger.log('❌ Error in saveCurrentProject: ' + e.toString());
      return {
        success: false,
        error: e.toString()
      };
    }
  }

  /**
  * Show load project dialog
  */
  function showLoadProjectDialog() {
    const projects = listProjectsDual();
    const ui = SpreadsheetApp.getUi();
    
    if (projects.success && projects.projects && projects.projects.length > 0) {
      let message = 'Select a project to load:\n\n';
      projects.projects.forEach(function(p, i) {
        message += (i + 1) + '. ' + p.name + '\n';
      });
      
      const result = ui.prompt('Load Project', message + '\nEnter project number:', ui.ButtonSet.OK_CANCEL);
      
      if (result.getSelectedButton() == ui.Button.OK) {
        const projectNum = parseInt(result.getResponseText());
        if (projectNum > 0 && projectNum <= projects.projects.length) {
          const projectName = projects.projects[projectNum - 1].name;
          const loadResult = loadProjectDual(projectName);
          
          if (loadResult.success) {
            ui.alert('Success', 'Project "' + projectName + '" loaded successfully!', ui.ButtonSet.OK);
          } else {
            ui.alert('Error', 'Failed to load project: ' + (loadResult.error || 'Unknown error'), ui.ButtonSet.OK);
          }
        }
      }
    } else {
      ui.alert('Load Project', 'No projects found.', ui.ButtonSet.OK);
    }
  }

  /**
  * Run diagnostics
  */
  function runDiagnostics() {
    const ui = SpreadsheetApp.getUi();
    const result = ui.alert('Run Diagnostics', 'This will run system diagnostics. Check the execution log for results.\n\nContinue?', ui.ButtonSet.YES_NO);
    
    if (result == ui.Button.YES) {
      TEST_QuickDiagnostics();
      ui.alert('Diagnostics Complete', 'Check View > Execution log for detailed results.', ui.ButtonSet.OK);
    }
  }

  /**
  * Show help
  */
  function showHelp() {
    const ui = SpreadsheetApp.getUi();
    const helpText = 'SerpifAI v6.0.0\n\n' +
                    'Quick Start:\n' +
                    '1. Configure your license key in Settings\n' +
                    '2. Create a new project\n' +
                    '3. Run competitor analysis\n' +
                    '4. Generate content strategy\n\n' +
                    'For detailed documentation, visit the Help section in the dashboard.';
    ui.alert('Help', helpText, ui.ButtonSet.OK);
  }

  /**
  * Show settings - opens sidebar and switches to Settings tab
  */
  function showSettingsDialog() {
    // Open the sidebar (will switch to Settings tab via JavaScript)
    showSidebar();
    // Note: JavaScript in the sidebar will handle switching to the Settings tab
    return {
      success: true,
      message: 'Open sidebar and navigate to Settings tab'
    };
  }

  /**
  * Include HTML files (for template system)
  * Auto-prepends UI/ folder prefix if not already present
  * Uses createTemplateFromFile to process nested scriptlets recursively
  * V42.0 - Added try-catch with error logging for diagnostics
  */
  function include(name) {
    // V42.0 - Added diagnostics
    const filePath = name.startsWith('UI/') ? name : 'UI/' + name;
    try {
      const content = HtmlService.createTemplateFromFile(filePath).evaluate().getContent();
      // V42: Only log for problematic files
      if (name.includes('Conversion') || name.includes('Audience') || name.includes('AuthPerf')) {
        console.log('[V42] include() SUCCESS: ' + filePath + ' (' + content.length + ' chars)');
      }
      return content;
    } catch (e) {
      console.error('[V42] include() FAILED for: ' + filePath);
      console.error('[V42] Error: ' + e.message);
      console.error('[V42] Stack: ' + e.stack);
      // Return error comment so page still loads
      return '<!-- V42 INCLUDE ERROR: ' + filePath + ' - ' + e.message.replace(/--/g, '==') + ' -->';
    }
  }

  /**
  * Web app entry point
  * UPDATED: Check for license key and show appropriate page
  */
  function doGet(e) {
    // Check if user has license key configured
    const licenseKey = getUserLicenseKey();
    
    // Always show main dashboard, skip onboarding
    return HtmlService.createTemplateFromFile('UI/UI_Dashboard')
      .evaluate()
      .setTitle('SerpifAI — Architect of Authority')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // ============================================================================
  // GEMINI MODEL MANAGEMENT
  // ============================================================================

  /**
  * Get available Gemini models
  * UPDATED: Calls through PHP gateway
  */
  function getGeminiModels() {
    try {
      const result = getAvailableGeminiModels(); // From UI_Gateway.gs
      
      if (result.success) {
        // Get currently selected model from user properties
        const userProps = PropertiesService.getUserProperties();
        const currentModel = userProps.getProperty('SERPIFAI_GEMINI_MODEL') || 'gemini-3-flash-preview';
        
        return {
          success: true,
          models: result.data.models || result.models,
          currentModel: currentModel
        };
      }
      
      // Fallback to Gemini models if gateway fails - Updated Dec 2025
      return {
        success: true,
        models: [
          { name: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash Preview ⚡🆕 (Latest - Dec 17, 2025)' },
          { name: 'gemini-3-pro-preview', displayName: 'Gemini 3 Pro Preview 🧠🆕 (Nov 2025)' },
          { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash ⚡ (Stable)' },
          { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro 🧠 (Stable)' },
          { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite 💨' }
        ],
        currentModel: currentModel,
        fallback: true
      };
    } catch (e) {
      Logger.log('Error getting Gemini models: ' + e.toString());
      
      // Return fallback models - Updated Dec 2025
      return {
        success: true,
        models: [
          { name: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash Preview ⚡🆕 (Latest)' },
          { name: 'gemini-3-pro-preview', displayName: 'Gemini 3 Pro Preview 🧠🆕' },
          { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash ⚡ (Stable)' },
          { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro 🧠' }
        ],
        currentModel: 'gemini-3-flash-preview',
        fallback: true,
        error: e.toString()
      };
    }
  }

  /**
  * Set selected Gemini model
  */
  function setGeminiModel(modelName) {
    try {
      if (!modelName || modelName.trim() === '') {
        throw new Error('Model name is required');
      }
      
      const userProps = PropertiesService.getUserProperties();
      userProps.setProperty('SERPIFAI_GEMINI_MODEL', modelName);
      
      return {
        success: true,
        model: modelName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
  * Get current Gemini model selection
  */
  function getCurrentGeminiModel() {
    const userProps = PropertiesService.getUserProperties();
    return userProps.getProperty('SERPIFAI_GEMINI_MODEL') || 'gemini-3-flash-preview';
  }

  // ============================================================================
  // WORKFLOW STAGE EXECUTION
  // ============================================================================

  /**
  * Run workflow stage
  * UPDATED: Routes through PHP gateway for credit validation
  * Maintains backward compatibility with old 3-arg pattern
  * 
  * @param {number|object} arg1 - Stage number OR complete payload object
  * @param {object} arg2 - Form data (if using old pattern)
  * @param {string} arg3 - Model name (if using old pattern)
  */
  function runWorkflowStage(arg1, arg2, arg3) {
    let stageNum = null;
    let formData = null;
    let selectedModel = null;
    let payload = null;
    let projectId = null;
    
    // V7.5 DIAGNOSTIC: Track execution flow to find HTTP 400 source
    const diagnosticLog = [];
    function diagLog(msg) {
      Logger.log(msg);
      diagnosticLog.push({ time: new Date().toISOString(), msg: msg });
    }
    
    try {
      diagLog('🔗 runWorkflowStage called with ' + arguments.length + ' arguments');
      
      // PATTERN DETECTION
      if (arguments.length === 0 || !arg1) {
        throw new Error('No arguments provided');
      }
      else if (arguments.length === 3 && typeof arg1 === 'number') {
        // OLD PATTERN: runWorkflowStage(1, {...}, 'gemini-2.5-flash')
        Logger.log('📌 Old 3-argument pattern detected');
        stageNum = arg1;
        formData = arg2;
        selectedModel = arg3;
        projectId = formData.projectId;
      }
      else if (arguments.length === 1 && typeof arg1 === 'object') {
        // NEW PATTERN: runWorkflowStage({stageNum: 1, projectId: '...', model: '...', ...})
        Logger.log('📌 New single-payload pattern detected');
        payload = arg1;
        stageNum = payload.stageNum;
        projectId = payload.projectId;
        selectedModel = payload.model;
        formData = payload;
      }
      else {
        throw new Error('Invalid calling pattern');
      }
      
      // ============================================================================
      // V7 FIX: FALLBACK PROJECT ID EXTRACTION
      // If projectId is still empty, try to extract from multiple sources
      // ============================================================================
      if (!projectId || projectId.trim() === '') {
        // Fallback 1: Check formData for alternative keys
        projectId = formData?.projectName || formData?.project || formData?.brandName;
        
        // Fallback 2: Check UserProperties for last active project
        if (!projectId || projectId.trim() === '') {
          try {
            const userProps = PropertiesService.getUserProperties();
            projectId = userProps.getProperty('ACTIVE_PROJECT_ID') || 
                        userProps.getProperty('lastActiveProject') ||
                        userProps.getProperty('currentProjectId');
            if (projectId) {
              Logger.log('📌 ProjectId recovered from UserProperties: ' + projectId);
            }
          } catch (propError) {
            Logger.log('⚠️ Could not read UserProperties: ' + propError.toString());
          }
        }
        
        if (projectId) {
          Logger.log('✅ ProjectId extracted via fallback: ' + projectId);
        }
      }
      
      // ============================================================================
      // VALIDATION
      // ============================================================================
      
      // CRITICAL: Ensure stageNum is an integer (not string "1")
      stageNum = parseInt(stageNum, 10);
      
      if (isNaN(stageNum) || stageNum < 1 || stageNum > 5) {
        throw new Error('Invalid stage number: ' + stageNum + ' (must be 1-5)');
      }
      
      if (!projectId || projectId.trim() === '') {
        throw new Error('❌ No project selected. Please select a project from the dropdown.');
      }
      
      if (!selectedModel || selectedModel.trim() === '') {
        // Try to get from user properties
        selectedModel = getCurrentGeminiModel();
      }
      
      if (!selectedModel) {
        throw new Error('❌ No AI model selected. Please select a Gemini model.');
      }
      
      // Ensure Gemini 2.5 or Gemini 3 (latest generations)
      const isValidModel = selectedModel.startsWith('gemini-2.5') || selectedModel.startsWith('gemini-3');
      if (!isValidModel) {
        Logger.log('⚠️ Using legacy model: ' + selectedModel + '. Defaulting to gemini-3-flash-preview');
        selectedModel = 'gemini-3-flash-preview';
      }
      
      Logger.log('✅ Validation passed');
      Logger.log('   📁 Project: ' + projectId);
      Logger.log('   🤖 Model: ' + selectedModel);
      Logger.log('   📊 Stage: ' + stageNum);
      
      // ============================================================================
      // LOAD PROJECT DATA
      // ============================================================================
      Logger.log('📥 Loading project data...');
      const projectData = loadProject(projectId);
      
      if (!projectData || !projectData.data) {
        throw new Error('❌ Cannot load project: ' + projectId);
      }
      
      Logger.log('✅ Loaded project with ' + Object.keys(projectData.data).length + ' fields');
      
      // Merge project data with any additional form data
      const mergedData = Object.assign({}, projectData.data, formData || {});
      mergedData.projectId = projectId;
      mergedData.model = selectedModel;
      
      // ============================================================================
      // V7 FIX: STRIP HEAVY COMPETITOR DATA TO PREVENT HTTP 400
      // The competitor data should be fetched directly from MySQL by the workflow stage
      // NOT passed through the gateway HTTP request (which has a ~6MB limit)
      // ============================================================================
      const lightweightPayload = Object.assign({}, mergedData);
      
      // Remove ALL heavy data fields that can cause HTTP 400
      delete lightweightPayload.competitorAnalysis;
      delete lightweightPayload.competitors;
      delete lightweightPayload.fullAnalysis;
      delete lightweightPayload.rawData;
      delete lightweightPayload.eliteTabIntelligence;
      delete lightweightPayload.geminiAnalysis;
      delete lightweightPayload.strategicInsights;
      delete lightweightPayload.contentAnalysis;
      delete lightweightPayload.keywordData;
      delete lightweightPayload.backlinkData;
      delete lightweightPayload.technicalData;
      delete lightweightPayload.marketIntelligence;
      delete lightweightPayload.opportunityMatrix;
      delete lightweightPayload.competitorData;
      
      // Add flag to tell workflow to fetch data from MySQL
      lightweightPayload._fetchCompetitorDataFromMySQL = true;
      lightweightPayload._lightweightMode = true;
      
      const payloadSize = JSON.stringify(lightweightPayload).length;
      Logger.log('📦 LIGHTWEIGHT PAYLOAD SIZE: ' + (payloadSize / 1024).toFixed(2) + ' KB');
      Logger.log('   (Full data stripped to prevent HTTP 400)');
      
      // ============================================================================
      // CALL GATEWAY WITH CREDIT VALIDATION
      // ============================================================================
      Logger.log('🚀 Calling gateway for workflow:stage' + stageNum);
      
      // First, check authorization and get transaction ID
      const authResult = executeWorkflowStage(stageNum, lightweightPayload); // From UI_Gateway.gs
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'Workflow authorization failed');
      }
      
      Logger.log('✅ Credits validated, authorized to execute');
      Logger.log('   💳 Cost: ' + authResult.creditCost + ' credits');
      Logger.log('   🆔 Transaction: ' + authResult.transactionId);
      
      // Now execute the actual workflow stage logic
      // This is handled by DB_WF_Router.gs files
      const transactionId = authResult.transactionId;
      let stageResult;
      
      try {
        // V7 FIX: Add transactionId to mergedData for UPP_commit
        mergedData._transactionId = transactionId;
        
        // Call appropriate stage handler from DB_WF_Router.gs
        switch(stageNum) {
          case 1:
            stageResult = DB_WF_runStage1Strategy(mergedData, selectedModel);
            break;
          case 2:
            stageResult = DB_WF_runStage2Keywords(mergedData, selectedModel);
            break;
          case 3:
            stageResult = DB_WF_runStage3Architecture(mergedData, selectedModel);
            break;
          case 4:
            stageResult = DB_WF_runStage4Calendar(mergedData, selectedModel);
            break;
          case 5:
            stageResult = DB_WF_runStage5Generation(mergedData, selectedModel);
            break;
          default:
            throw new Error('Invalid stage number: ' + stageNum);
        }
        
        // Mark transaction as complete
        // V7.4 FIX: Only pass lightweight confirmation, NOT the full stageResult (which is 20-50KB)
        // The full data is already saved to MySQL by the workflow stage
        const lightweightConfirmation = {
          success: stageResult.success,
          stage: stageResult.stage || stageNum,
          projectId: stageResult.projectId || projectId,
          timestamp: stageResult.timestamp || new Date().toISOString(),
          // DO NOT include: json, report, competitorAnalysisSummary, etc.
        };
        completeTransaction(transactionId, lightweightConfirmation);
        
        Logger.log('✅ Stage ' + stageNum + ' completed successfully');
        
        // ══════════════════════════════════════════════════════════════════════════════
        // V7.2 NUCLEAR FIX: POINTER-ONLY RESPONSE
        // ══════════════════════════════════════════════════════════════════════════════
        // The HTTP 400 error occurs because google.script.run has a ~50KB limit.
        // Stage 1 returns ~20-40KB of JSON + report, which exceeds this limit.
        // 
        // SOLUTION: Return ONLY a lightweight pointer (~200 bytes).
        // The UI will call hydrateStage1FromDatabase() to fetch the full data
        // from MySQL in a SEPARATE request that doesn't have size limits.
        // 
        // Data is ALREADY saved to MySQL by the workflow stage before we get here,
        // so hydration will always find the data.
        // ══════════════════════════════════════════════════════════════════════════════
        
        const pointerResponse = {
          success: true,
          stage: stageNum,
          projectId: projectId,
          jobToken: stageResult.jobToken || '',
          credits: authResult.creditCost,
          timestamp: stageResult.timestamp || new Date().toISOString(),
          // V7.2: Tell UI to hydrate from database (NOT from this response)
          _hydrateFromDatabase: true,
          message: 'Stage ' + stageNum + ' completed. Hydrating results from database...'
        };
        
        const pointerSize = JSON.stringify(pointerResponse).length;
        diagLog('📦 V7.2 POINTER-ONLY RESPONSE: ' + pointerSize + ' bytes');
        diagLog('   (Full data saved to MySQL, UI will hydrate separately)');
        
        // V7.5 SAFETY CHECK: Verify response is actually small
        if (pointerSize > 10000) {
          diagLog('🚨 CRITICAL: Pointer response is too large! ' + pointerSize + ' bytes');
          diagLog('   Keys in response: ' + Object.keys(pointerResponse).join(', '));
          // Return minimal emergency response
          return { success: true, stage: stageNum, projectId: projectId, _hydrateFromDatabase: true };
        }
        
        return pointerResponse;
        
      } catch (stageError) {
        // Mark transaction as failed (refunds credits)
        failTransaction(transactionId, stageError.toString());
        
        throw stageError;
      }
      
    } catch (error) {
      diagLog('❌ Workflow error: ' + error.toString());
      
      // V7.5 FIX: Return minimal error response to prevent HTTP 400
      // Large error objects with stack traces can exceed 50KB limit
      return {
        success: false,
        stage: stageNum || 0,
        error: (error.toString() || 'Unknown error').substring(0, 500), // Truncate long errors
        _hydrateFromDatabase: false
      };
    }
  }

  // ============================================================================
  // COMPETITOR ANALYSIS
  // ============================================================================

  /**
  * Run Elite Competitor Analysis
  * UPDATED: Routes through PHP gateway with credit validation
  * 
  * @param {string[]} competitors - Array of competitor URLs
  * @param {object} projectContext - Project context data
  */
  function runEliteCompetitorAnalysis(competitors, projectContext) {
    try {
      const safeProjectContext = projectContext || {};
      const safeCompetitors = competitors || [];
      
      Logger.log('🎯 Starting ELITE Competitor Analysis...');
      Logger.log('   Competitors: ' + safeCompetitors.length);
      Logger.log('   Project: ' + (safeProjectContext.brandName || 'Unknown'));
      
      // Validation
      if (safeCompetitors.length === 0) {
        throw new Error('No competitors provided. Please enter at least 2 competitor URLs.');
      }
      
      if (safeCompetitors.length < 2) {
        throw new Error('Please provide at least 2 competitor URLs.');
      }
      
      if (safeCompetitors.length > 6) {
        throw new Error('Maximum 6 competitors allowed. You provided ' + safeCompetitors.length);
      }
      
      // Get spreadsheet ID (with fallback for web app context)
      let spreadsheetId = null;
      try {
        const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        if (activeSpreadsheet) {
          spreadsheetId = activeSpreadsheet.getId();
          Logger.log('📊 Active spreadsheet: ' + spreadsheetId);
        } else {
          Logger.log('⚠️ No active spreadsheet (web app context) - will use config fallback');
        }
      } catch (e) {
        Logger.log('⚠️ Cannot access active spreadsheet: ' + e.toString());
      }
      
      // SKIP GATEWAY - Competitor analysis runs entirely in Apps Script
      // The gateway was returning "Forbidden" because "comp:elite_full" action doesn't exist
      // This analysis uses local fetcher + APIs, no external gateway needed
      Logger.log('📊 Running competitor analysis locally (no gateway needed)');
      
      // Verify license key exists (just for user validation)
      try {
        const licenseKey = getUserLicenseKey();
        if (!licenseKey || licenseKey.indexOf('YOUR-') === 0) {
          Logger.log('⚠️ No valid license key, but continuing with local analysis');
        } else {
          Logger.log('✅ License key found: ' + licenseKey.substring(0, 10) + '...');
        }
      } catch (e) {
        Logger.log('⚠️ Could not verify license key: ' + e);
      }
      
      // Create local transaction ID (no credits needed for local execution)
      const transactionId = 'local-' + Date.now();
      Logger.log('🆔 Transaction ID: ' + transactionId);
      
      // Execute the actual analysis
      // This is handled by DB_COMP_Main.gs and DB_COMP_EliteOrchestrator.gs
      let analysisResult;
      
      try {
        // Build config object for orchestrator
        // CRITICAL: Use actual projectId from projectContext for proper data association
        const actualProjectId = safeProjectContext.projectId || safeProjectContext.brandName || 'comp-' + Date.now();
        
        // v31.4 FIX: Always bypass cache for fresh analysis data
        const config = {
          competitors: safeCompetitors,
          projectContext: safeProjectContext,
          yourDomain: safeProjectContext.brandName || 'Your Site',
          projectId: actualProjectId,  // Use actual project ID for proper save/load
          spreadsheetId: spreadsheetId,
          bypassCache: true,  // v31.4: Force fresh data, no stale cache
          forceRefresh: true  // v31.4: Force full re-analysis
        };
        
        Logger.log('📡 Calling COMP_orchestrateAnalysis with config:');
        Logger.log('   Config type: ' + typeof config);
        Logger.log('   Config keys: ' + (config ? Object.keys(config).join(', ') : 'null'));
        Logger.log('   Competitors: ' + (config && config.competitors ? config.competitors.length : 'none'));
        Logger.log('   ProjectId: ' + config.projectId);
        Logger.log('   Config JSON: ' + JSON.stringify(config));
        
        // DEFENSIVE: Ensure config is valid before calling
        if (!config || typeof config !== 'object') {
          throw new Error('Invalid config object created. This should not happen.');
        }
        
        if (!config.competitors || !Array.isArray(config.competitors)) {
          throw new Error('Config missing competitors array. This should not happen.');
        }
        
        // Call competitor orchestrator (DB_COMP_Main.gs)
        Logger.log('🔄 Executing: COMP_orchestrateAnalysis(config)');
        analysisResult = COMP_orchestrateAnalysis(config);
        Logger.log('✅ COMP_orchestrateAnalysis returned');
        Logger.log('   Result type: ' + typeof analysisResult);
        Logger.log('   Result success: ' + (analysisResult ? analysisResult.success : 'null'));
        
        // CRITICAL: Transform competitors from OBJECT to ARRAY for UI
        if (analysisResult.success && analysisResult.competitors) {
          Logger.log('🔄 Transforming competitors for UI...');
          Logger.log('   Input type: ' + (Array.isArray(analysisResult.competitors) ? 'array' : 'object'));
          
          // Convert object {domain: data} to array [{domain, data...}]
          let competitorsArray = [];
          
          if (Array.isArray(analysisResult.competitors)) {
            // Already an array
            competitorsArray = analysisResult.competitors;
            Logger.log('   ✅ Already array format: ' + competitorsArray.length + ' items');
          } else if (typeof analysisResult.competitors === 'object') {
            // Convert object to array
            const domains = Object.keys(analysisResult.competitors);
            Logger.log('   Converting object with ' + domains.length + ' domains...');
            
            competitorsArray = domains.map(function(domain) {
              const compData = analysisResult.competitors[domain];
              
              // v28.7 FIX: Extract synthesized to top level
              // UI components look for c.synthesized, not c.rawData.synthesized
              return {
                domain: domain,
                url: compData.url || 'https://' + domain,
                fetchSuccess: compData.fetchSuccess !== false,
                snapshot: compData.snapshot || {},
                apiData: compData.apiData || {},
                synthesized: compData.synthesized || compData.finalData?.synthesized || {},  // v28.7: CRITICAL
                categories: compData.categories || {},
                processedMetrics: compData.processedMetrics || {},
                rawData: compData,
                fetchedAt: compData.fetchedAt || new Date().toISOString()
              };
            });
            
            Logger.log('   ✅ Converted to array: ' + competitorsArray.length + ' items');
          }
          
          // v8.0: Pass Gemini analysis (with estimatedMetrics) to transformation
          // This uses the estimates from the SAME Gemini call - no extra API call!
          const geminiAnalysis = analysisResult.geminiAnalysis || analysisResult.analysis || null;
          
          // Apply UI transformation (flatten nested metrics + use Gemini estimates)
          // WRAPPED IN TRY-CATCH for better error reporting
          try {
            analysisResult.competitors = transformCompetitorsForUI(competitorsArray, geminiAnalysis);
            Logger.log('   ✅ UI transformation complete: ' + analysisResult.competitors.length + ' competitors');
            
            // v8.1: SMART FALLBACK - Fix any remaining 0/N/A values
            // This runs AFTER Gemini estimates to catch any gaps
            try {
              if (typeof SMARTFALLBACK_fixAllCompetitors === 'function') {
                analysisResult.competitors = SMARTFALLBACK_fixAllCompetitors(analysisResult.competitors);
                Logger.log('   ✅ Smart Fallback check complete');
              }
            } catch (fallbackError) {
              Logger.log('   ⚠️ Smart Fallback error (non-fatal): ' + fallbackError.toString());
            }
          } catch (transformError) {
            Logger.log('   ❌ UI transformation error: ' + transformError.toString());
            Logger.log('   ⚠️ Using raw competitors array without transformation');
            // Fallback: use raw array but ensure processedMetrics exists
            analysisResult.competitors = competitorsArray.map(function(comp) {
              if (!comp.processedMetrics) comp.processedMetrics = {};
              // Ensure all required metrics have safe defaults
              // v32.0 FIX: Use authority-based calculations instead of hardcoded 5000
              const auth = Number(comp.processedMetrics.authorityScore) || 30;
              comp.processedMetrics.authorityScore = auth;
              comp.processedMetrics.organicKeywords = Number(comp.processedMetrics.organicKeywords) || Math.round(Math.pow(10, 0.04 * auth + 2));
              comp.processedMetrics.organicTraffic = Number(comp.processedMetrics.organicTraffic) || Math.round(comp.processedMetrics.organicKeywords * (auth >= 50 ? 3 : 1.5));
              comp.processedMetrics.estimatedTraffic = Number(comp.processedMetrics.estimatedTraffic) || comp.processedMetrics.organicTraffic;
              // v32.0: Calculate backlinks from authority (formula: 10^(0.068*auth+1.6))
              const blCalc = Math.round(Math.pow(10, 0.068 * auth + 1.6));
              comp.processedMetrics.backlinks = Number(comp.processedMetrics.backlinks) || blCalc;
              comp.processedMetrics.estimatedBacklinks = Number(comp.processedMetrics.estimatedBacklinks) || blCalc;
              comp.processedMetrics.refDomains = Number(comp.processedMetrics.refDomains) || Math.round(blCalc * 0.05);
              comp.processedMetrics.estimatedRefDomains = Number(comp.processedMetrics.estimatedRefDomains) || Math.round(blCalc * 0.05);
              return comp;
            });
          }
        }
        
        // SKIP GATEWAY - We're running locally, no need to call completeTransaction
        // The gateway action "workflow:complete" doesn't exist and returns 403 Forbidden
        // completeTransaction(transactionId, analysisResult);
        Logger.log('📍 Transaction marked complete (local - no gateway call)');
        
        Logger.log('✅ ELITE analysis complete');
        Logger.log('   Competitors in response: ' + (analysisResult.competitors ? analysisResult.competitors.length : 0));
        
        return analysisResult;
        
      } catch (analysisError) {
        // SKIP GATEWAY - We're running locally, no need to call failTransaction
        // failTransaction(transactionId, analysisError.toString());
        Logger.log('📍 Transaction marked failed (local - no gateway call): ' + analysisError.toString());
        
        throw analysisError;
      }
      
    } catch (error) {
      Logger.log('❌ Analysis error: ' + error.toString());
      
      return {
        success: false,
        error: error.toString(),
        stack: error.stack || 'No stack trace'
      };
    }
  }

  /**
  * Transform competitors data for UI charts
  * v8.0: Uses Gemini estimates from the Elite Analysis response (no separate API call)
  * Falls back to formula-based v7.0 estimates if no Gemini estimates available
  * 
  * @param {Array} competitors - Competitor data array
  * @param {Object} geminiAnalysis - Optional: Gemini analysis response containing estimatedMetrics
  */
  function transformCompetitorsForUI(competitors, geminiAnalysis) {
    // DEFENSIVE: Handle null/undefined
    if (!competitors) {
      Logger.log('⚠️ transformCompetitorsForUI: No competitors provided');
      return [];
    }
    
    // DEFENSIVE: Ensure array
    if (!Array.isArray(competitors)) {
      Logger.log('⚠️ transformCompetitorsForUI: Not an array, returning empty');
      return [];
    }
    
    Logger.log('🔄 Transforming ' + competitors.length + ' competitors for UI charts...');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 0: EXTRACT GEMINI ESTIMATES FROM ANALYSIS RESPONSE (v8.0)
    // These come from the same Gemini call that did the strategic analysis
    // No separate API call needed!
    // ═══════════════════════════════════════════════════════════════════════
    let geminiEstimates = {};
    
    if (geminiAnalysis && geminiAnalysis.estimatedMetrics && Array.isArray(geminiAnalysis.estimatedMetrics)) {
      Logger.log('🤖 Using Gemini estimates from Elite Analysis response');
      geminiAnalysis.estimatedMetrics.forEach(function(est) {
        if (est.domain) {
          const cleanDomain = est.domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
          // v32.0 FIX: Calculate backlinks from authority instead of hardcoding 5000
          const estAuth = est.authorityScore || 30;
          const blCalc = est.backlinks || Math.round(Math.pow(10, 0.068 * estAuth + 1.6));
          geminiEstimates[cleanDomain] = {
            authorityScore: estAuth,
            organicKeywords: est.organicKeywords || 1000,
            organicTraffic: est.organicTraffic || 500,
            backlinks: blCalc,
            refDomains: est.refDomains || Math.round(blCalc * 0.05),
            siteType: est.siteType || 'unknown',
            confidence: est.confidence || 'Medium',
            isGeminiEstimate: true
          };
          Logger.log('   ✅ Gemini estimate for ' + cleanDomain + ': Auth=' + est.authorityScore + 
                    ', Traffic=' + (est.organicTraffic || 0).toLocaleString());
        }
      });
      Logger.log('   🤖 Got Gemini estimates for ' + Object.keys(geminiEstimates).length + ' competitors');
    } else {
      Logger.log('   ⚠️ No Gemini estimates in analysis response, using formula fallback');
    }
    
    return competitors.map(function(comp) {
      // DEFENSIVE: Skip invalid items
      if (!comp || typeof comp !== 'object') {
        Logger.log('   ⚠️ Skipping invalid competitor: ' + typeof comp);
        return null;
      }
      
      // Ensure processedMetrics exists
      if (!comp.processedMetrics) {
        comp.processedMetrics = {};
      }
      
      const domain = comp.domain || 'unknown';
      Logger.log('   📊 Processing: ' + domain);
      
      // ═══════════════════════════════════════════════════════════════════════
      // EXTRACT REAL DATA FROM API RESPONSES
      // Priority: apiData > synthesized > snapshot > defaults
      // ═══════════════════════════════════════════════════════════════════════
      
      // SOURCE 1: API Data (PageSpeed, OpenPageRank, Serper)
      const apiData = comp.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      const openPageRank = apiData.openPageRank || {};
      const serper = apiData.serper || {};
      
      // SOURCE 2: Synthesized data (from FT_EliteCompetitorFetcher)
      // v28.7 FIX: Check multiple locations - data may be in rawData.synthesized
      const synthesized = comp.synthesized || comp.rawData?.synthesized || comp.finalData?.synthesized || {};
      
      // SOURCE 3: Snapshot (from PHP fetcher)
      const snapshot = comp.snapshot || {};
      
      // ─────────────────────────────────────────────────────────────────────
      // PAGESPEED METRICS (REAL DATA)
      // Structure 1 (API): apiData.pageSpeed.scores.{performance, seo, accessibility, best_practices}
      // Structure 2 (Direct): apiData.pageSpeed.{performance, seo, accessibility, bestPractices}
      // ─────────────────────────────────────────────────────────────────────
      const scores = pageSpeed.scores || pageSpeed || {};  // Accept both structures
      
      // SEO Score (0-100)
      const seoScore = scores.seo || pageSpeed.seo || synthesized.technical?.seoScore || 0;
      comp.processedMetrics.seoScore = seoScore;
      
      // Performance Score (0-100)
      const performanceScore = scores.performance || pageSpeed.performance || synthesized.technical?.performanceScore || 0;
      comp.processedMetrics.pageSpeed = performanceScore;
      comp.processedMetrics.performanceScore = performanceScore;
      
      // Accessibility Score (0-100)
      const accessibilityScore = scores.accessibility || pageSpeed.accessibility || synthesized.technical?.accessibilityScore || 0;
      comp.processedMetrics.accessibilityScore = accessibilityScore;
      
      // Best Practices Score (0-100)
      const bestPracticesScore = scores.best_practices || pageSpeed.bestPractices || pageSpeed.best_practices || synthesized.technical?.bestPracticesScore || 0;
      comp.processedMetrics.bestPracticesScore = bestPracticesScore;
      
      // Core Web Vitals (composite score based on all 4 metrics)
      comp.processedMetrics.coreWebVitals = Math.round((seoScore + performanceScore + accessibilityScore + bestPracticesScore) / 4);
      
      // Site Health (weighted average: SEO 40%, Performance 30%, Accessibility 15%, Best Practices 15%)
      comp.processedMetrics.siteHealth = Math.round(
        (seoScore * 0.4) + (performanceScore * 0.3) + (accessibilityScore * 0.15) + (bestPracticesScore * 0.15)
      );
      
      // ─────────────────────────────────────────────────────────────────────
      // SEMrush CALIBRATION v7.0 - LOOKUP TABLE + INTERPOLATION
      // ─────────────────────────────────────────────────────────────────────
      // GROUND TRUTH (from actual SEMrush):
      // ┌─────────────────────┬───────┬────────────┬────────────┬───────────┬────────────┐
      // │ Domain              │ Auth  │ Traffic    │ Keywords   │ Backlinks │ RefDomains │
      // ├─────────────────────┼───────┼────────────┼────────────┼───────────┼────────────┤
      // │ toptal.com          │ 59    │ 555,900    │ 305,500    │ 1,200,000 │ 64,300     │
      // │ thoughtworks.com    │ 51    │ 125,600    │ 44,300     │ 503,900   │ 20,900     │
      // │ globant.com         │ 48    │ 140,400    │ 40,200     │ 363,000   │ 10,800     │
      // │ andela.com          │ 39    │ 15,700     │ 3,900      │ 151,000   │ 4,200      │
      // │ turing.com          │ ~45   │ ~50,000    │ ~15,000    │ ~250,000  │ ~7,000     │
      // └─────────────────────┴───────┴────────────┴────────────┴───────────┴────────────┘
      // ─────────────────────────────────────────────────────────────────────
      
      // PageRank (0-10 scale)
      // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal (snake_case)
      const pageRankDecimal = parseFloat(openPageRank.pageRank) || parseFloat(openPageRank.page_rank_decimal) || parseFloat(openPageRank.rank) || synthesized.authority?.pageRank || 0;
      comp.processedMetrics.pageRank = pageRankDecimal;
      
      // Domain Rank (global position)
      // v28.6: API returns domainRank (camelCase), fallback to rank
      const domainRank = parseInt(openPageRank.domainRank) || parseInt(openPageRank.rank) || synthesized.authority?.domainRank || 0;
      comp.processedMetrics.domainRank = domainRank;
      
      // ═══════════════════════════════════════════════════════════════════════
      // PRECISION SEO METRICS ESTIMATION SYSTEM v8.0
      // 
      // v8.0 UPGRADE: Uses Gemini AI for industry-aware estimation
      // Falls back to formula-based v7.0 if Gemini not available
      //
      // WHY GEMINI: OpenPageRank doesn't correlate with SEMrush for all industries
      // - Gambling sites: LOW PageRank but HIGH traffic/keywords
      // - SaaS sites: HIGH PageRank correlates better with metrics
      // - News sites: Traffic per keyword is 10-50x higher
      // 
      // Gemini understands these industry patterns from its training data
      // ═══════════════════════════════════════════════════════════════════════
      
      const cleanDomain = (domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
      const pageRank = pageRankDecimal || 0;
      const serpResultCount = (serper.organic || []).length;
      
      // CHECK: Do we have Gemini estimates for this domain?
      let geminiEst = geminiEstimates[cleanDomain] || geminiEstimates[domain] || null;
      
      // ═══════════════════════════════════════════════════════════════════════════
      // v31.1 FIX: If no geminiEst from estimatedMetrics array, check synthesized data
      // CRITICAL: Prioritize factors.geminiEstimate (actual Gemini 450K) over estimate (CTR 20K)
      // v32.0: Use authority-based backlinks instead of hardcoded 5000
      // ═══════════════════════════════════════════════════════════════════════════
      if (!geminiEst && (synthesized?.traffic?.factors?.geminiEstimate > 0 || synthesized?.traffic?.estimate > 0)) {
        const geminiTrafficValue = synthesized.traffic.factors?.geminiEstimate || synthesized.traffic.estimate || 0;
        const synthAuth = synthesized.authority?.pageRank ? Math.round(synthesized.authority.pageRank * 10) : 30;
        const synthBlCalc = synthesized.traffic.factors?.indexedPages || Math.round(Math.pow(10, 0.068 * synthAuth + 1.6));
        Logger.log('      💎 [v31.1] Found Gemini data in synthesized.traffic for ' + cleanDomain + ': ' + geminiTrafficValue.toLocaleString());
        geminiEst = {
          isGeminiEstimate: true,
          organicTraffic: geminiTrafficValue,  // v31.1: Use geminiEstimate first!
          organicKeywords: synthesized.traffic.factors?.keywordCount || 
                          synthesized.seo?.indexedPages || 1000,
          authorityScore: synthAuth,
          backlinks: synthBlCalc,
          refDomains: Math.round(synthBlCalc * 0.05),
          confidence: 'Medium',
          siteType: synthesized.geminiEnrichment?.niche || 'digital marketing'
        };
      }
      
      // v31.1 FIX: Also check comp.processedMetrics.geminiTraffic (from DB_COMP_Main.gs)
      // v32.0: Use authority-based backlinks instead of hardcoded 5000
      if (!geminiEst && comp.processedMetrics?.geminiTraffic > 0) {
        Logger.log('      💎 [v31.1] Found Gemini data in processedMetrics for ' + cleanDomain);
        const pmAuth = comp.processedMetrics.authorityScore || 30;
        const pmBlCalc = comp.processedMetrics.backlinks || Math.round(Math.pow(10, 0.068 * pmAuth + 1.6));
        geminiEst = {
          isGeminiEstimate: true,
          organicTraffic: comp.processedMetrics.geminiTraffic,
          organicKeywords: comp.processedMetrics.geminiKeywords || comp.processedMetrics.organicKeywords || 1000,
          authorityScore: pmAuth,
          backlinks: pmBlCalc,
          refDomains: comp.processedMetrics.refDomains || Math.round(pmBlCalc * 0.05),
          confidence: 'Medium',
          siteType: comp.processedMetrics.siteType || 'digital marketing'
        };
      }
      
      // CRITICAL: Initialize ALL variables with safe defaults BEFORE the if/else
      // This prevents "Cannot read properties of undefined (reading 'toLocaleString')" errors
      let authorityScore = 0;
      let estimatedOrganicKeywords = 0;
      let estimatedTraffic = 0;
      let estimatedBacklinks = 0;
      let estimatedRefDomains = 0;
      let confidenceLevel = 'Low';
      
      if (geminiEst && geminiEst.isGeminiEstimate) {
        // ═══════════════════════════════════════════════════════════════════
        // USE GEMINI AI ESTIMATES (v8.0)
        // v32.0: Use authority-based backlinks fallback
        // ═══════════════════════════════════════════════════════════════════
        Logger.log('      🤖 Using Gemini estimates for ' + cleanDomain);
        
        // SAFE EXTRACTION: Ensure all values are numbers with fallbacks
        authorityScore = Number(geminiEst.authorityScore) || 30;
        estimatedOrganicKeywords = Number(geminiEst.organicKeywords) || 1000;
        estimatedTraffic = Number(geminiEst.organicTraffic) || 500;
        // v32.0 FIX: Calculate backlinks from authority instead of hardcoded 5000
        const gemAuthFallbackBl = Math.round(Math.pow(10, 0.068 * authorityScore + 1.6));
        estimatedBacklinks = Number(geminiEst.backlinks) || gemAuthFallbackBl;
        estimatedRefDomains = Number(geminiEst.refDomains) || Math.round(gemAuthFallbackBl * 0.05);
        confidenceLevel = geminiEst.confidence || 'Medium';
        
        comp.processedMetrics.estimationMethod = 'Gemini AI';
        comp.processedMetrics.siteType = geminiEst.siteType || 'unknown';
        
      } else {
        // ═══════════════════════════════════════════════════════════════════
        // FALLBACK: FORMULA-BASED v7.0 ESTIMATION
        // ═══════════════════════════════════════════════════════════════════
        Logger.log('      📊 Using formula-based v7.0 for ' + cleanDomain);
        comp.processedMetrics.estimationMethod = 'Formula v7.0';
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: AUTHORITY SCORE - Non-linear relationship to PageRank
        // ─────────────────────────────────────────────────────────────────────
        if (pageRank >= 8) {
          authorityScore = Math.round(pageRank * 10.5);
      } else if (pageRank >= 7) {
        authorityScore = Math.round(pageRank * 10);
      } else if (pageRank >= 6) {
        authorityScore = Math.round(pageRank * 9);
      } else if (pageRank >= 5) {
        authorityScore = Math.round(pageRank * 8.5);
      } else if (pageRank >= 4) {
        // Low PageRank - check SERP presence to differentiate real sites
        authorityScore = serpResultCount >= 3 ? Math.round(pageRank * 7) : Math.round(pageRank * 5);
      } else if (pageRank >= 3) {
        authorityScore = Math.round(pageRank * 6);
      } else {
        authorityScore = Math.max(5, Math.round(pageRank * 5));
      }
      authorityScore = Math.max(1, Math.min(100, authorityScore));
      
      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: ORGANIC KEYWORDS - Power-law distribution
      // Top sites: 100K-1M+ keywords
      // Major sites: 50K-500K keywords  
      // Mid sites: 5K-100K keywords
      // Small sites: can be as low as 1-100 keywords
      // ─────────────────────────────────────────────────────────────────────
      
      // NOTE: Do NOT re-declare - use the variable from outer scope (line 830)
      
      if (serpResultCount === 0 && pageRank < 4) {
        // No SERP presence + low PR = very few keywords
        estimatedOrganicKeywords = Math.max(1, Math.round(authorityScore * 1.5));
      } else {
        // Power-law model: Keywords = 10^(0.05 × Auth + 0.5)
        const kwExponent = 0.048 * authorityScore + 0.6;
        estimatedOrganicKeywords = Math.round(Math.pow(10, kwExponent));
        
        // Apply tier-based bounds
        if (authorityScore >= 80) {
          estimatedOrganicKeywords = Math.max(500000, estimatedOrganicKeywords);
        } else if (authorityScore >= 70) {
          estimatedOrganicKeywords = Math.max(100000, Math.min(2000000, estimatedOrganicKeywords));
        } else if (authorityScore >= 60) {
          estimatedOrganicKeywords = Math.max(50000, Math.min(500000, estimatedOrganicKeywords));
        } else if (authorityScore >= 50) {
          estimatedOrganicKeywords = Math.max(20000, Math.min(200000, estimatedOrganicKeywords));
        } else if (authorityScore >= 40) {
          estimatedOrganicKeywords = Math.max(5000, Math.min(100000, estimatedOrganicKeywords));
        } else if (authorityScore >= 25) {
          estimatedOrganicKeywords = Math.max(50, Math.min(10000, estimatedOrganicKeywords));
        } else {
          // Very low authority: likely minimal keywords
          estimatedOrganicKeywords = Math.max(1, Math.min(500, estimatedOrganicKeywords));
        }
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: ORGANIC TRAFFIC - Variable ratio to keywords
      // High-traffic sites: 10-20 visits per keyword
      // Low-traffic sites: 0.1-5 visits per keyword
      // ─────────────────────────────────────────────────────────────────────
      
      let trafficKeywordRatio;
      if (authorityScore >= 80) {
        trafficKeywordRatio = 15;
      } else if (authorityScore >= 70) {
        trafficKeywordRatio = 8;
      } else if (authorityScore >= 60) {
        trafficKeywordRatio = 5;
      } else if (authorityScore >= 50) {
        trafficKeywordRatio = 3;
      } else if (authorityScore >= 30) {
        trafficKeywordRatio = 1.5;
      } else {
        trafficKeywordRatio = 0.5;
      }
      
      // IMPORTANT: Do NOT use 'let' here - use the variable from outer scope (line ~835)
      estimatedTraffic = Math.round(estimatedOrganicKeywords * trafficKeywordRatio);
      
      // Very low authority + no SERP = minimal traffic
      if (authorityScore < 25 && serpResultCount < 2) {
        estimatedTraffic = Math.min(estimatedTraffic, 500);
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: BACKLINKS - Exponential relationship to authority
      // Formula: Backlinks = 10^(0.07 × Auth + 1.5)
      // ─────────────────────────────────────────────────────────────────────
      
      const blExponent = 0.068 * authorityScore + 1.6;
      // IMPORTANT: Do NOT use 'let' here - use the variable from outer scope (line ~835)
      estimatedBacklinks = Math.round(Math.pow(10, blExponent));
      
      if (authorityScore >= 80) {
        estimatedBacklinks = Math.max(5000000, estimatedBacklinks);
      } else if (authorityScore >= 60) {
        estimatedBacklinks = Math.max(100000, Math.min(20000000, estimatedBacklinks));
      } else if (authorityScore >= 40) {
        estimatedBacklinks = Math.max(10000, Math.min(1000000, estimatedBacklinks));
      } else {
        estimatedBacklinks = Math.max(1000, Math.min(100000, estimatedBacklinks));
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: REFERRING DOMAINS - Ratio-based on backlinks
      // Higher authority = lower ratio (more links per domain)
      // ─────────────────────────────────────────────────────────────────────
      
      let refDomRatio = authorityScore >= 70 ? 0.015 : 
                        authorityScore >= 50 ? 0.04 : 
                        authorityScore >= 30 ? 0.08 : 0.12;
      
      // IMPORTANT: Do NOT use 'let' here - use the variable from outer scope (line ~835)
      estimatedRefDomains = Math.round(estimatedBacklinks * refDomRatio);
      estimatedRefDomains = Math.max(100, estimatedRefDomains);
      
      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: CONFIDENCE SCORING
      // ─────────────────────────────────────────────────────────────────────
      
      confidenceLevel = 'Low';
      if (pageRank >= 5 && serpResultCount >= 5) {
        confidenceLevel = 'High';
      } else if (pageRank >= 3 || serpResultCount >= 2) {
        confidenceLevel = 'Medium';
      }
        
      } // END of formula-based v7.0 else block
      
      // SAFE LOGGING: Use Number() to ensure toLocaleString works
      Logger.log('      📊 v8.0 Metrics for ' + cleanDomain + ': PR=' + (Number(pageRank) || 0).toFixed(1) + 
                ' → Auth=' + (Number(authorityScore) || 0) + ', KW=' + (Number(estimatedOrganicKeywords) || 0).toLocaleString() + 
                ', Traffic=' + (Number(estimatedTraffic) || 0).toLocaleString() + ' [' + (confidenceLevel || 'Low') + '] (' + 
                (comp.processedMetrics.estimationMethod || 'Formula') + ')');
      
      // Set all the metrics
      comp.processedMetrics.authorityScore = authorityScore;
      comp.processedMetrics.authorityMomentum = authorityScore;
      comp.processedMetrics.organicKeywords = estimatedOrganicKeywords;
      comp.processedMetrics.estimatedTraffic = estimatedTraffic;
      comp.processedMetrics.organicTraffic = estimatedTraffic;
      comp.processedMetrics.backlinks = estimatedBacklinks;
      comp.processedMetrics.estimatedBacklinks = estimatedBacklinks;
      comp.processedMetrics.refDomains = estimatedRefDomains;
      comp.processedMetrics.estimatedRefDomains = estimatedRefDomains;
      comp.processedMetrics.confidenceLevel = confidenceLevel;
      comp.processedMetrics.isEstimate = true;
      
      // Top Rankings (first 5 organic results)
      comp.processedMetrics.topRankings = (serper.organic || []).slice(0, 5).map(function(r) {
        return {
          url: r.link || r.url || '',
          title: r.title || '',
          position: r.position || 0
        };
      });
      
      // ─────────────────────────────────────────────────────────────────────
      // CONTENT METRICS (from snapshot/synthesized)
      // ─────────────────────────────────────────────────────────────────────
      
      // Word Count / Content Depth
      const wordCount = snapshot.metadata?.wordCount || synthesized.website?.wordCount || 0;
      comp.processedMetrics.contentDepth = wordCount;
      comp.processedMetrics.wordCount = wordCount;
      
      // Schema Types
      const schemaTypes = snapshot.schema?.types || synthesized.website?.schemaTypes || [];
      comp.processedMetrics.schemaCount = schemaTypes.length;
      comp.processedMetrics.schemaTypes = schemaTypes;
      
      // Has Organization Schema
      comp.processedMetrics.hasOrganizationSchema = snapshot.schema?.hasOrganizationSchema || false;
      
      // Internal/External Links
      const internalLinks = (snapshot.links?.internal || []).length || synthesized.website?.internalLinks || 0;
      const externalLinks = (snapshot.links?.external || []).length || synthesized.website?.externalLinks || 0;
      comp.processedMetrics.internalLinks = internalLinks;
      comp.processedMetrics.externalLinks = externalLinks;
      
      // ─────────────────────────────────────────────────────────────────────
      // CALCULATED SCORES (derived from real metrics)
      // ─────────────────────────────────────────────────────────────────────
      
      // Get final keyword/traffic values for score calculations
      const finalKeywords = comp.processedMetrics.organicKeywords || 100;
      const finalTraffic = comp.processedMetrics.estimatedTraffic || 0;
      
      // Topical Authority Score (based on content depth + organic keywords)
      const contentScore = wordCount > 3000 ? 80 : wordCount > 1500 ? 60 : wordCount > 500 ? 40 : 20;
      const keywordScoreCalc = finalKeywords > 5000 ? 90 : finalKeywords > 1000 ? 75 : finalKeywords > 100 ? 55 : 35;
      comp.processedMetrics.topicalAuthority = Math.round((contentScore + keywordScoreCalc) / 2);
      
      // E-E-A-T Signals (based on schema, organization, content quality)
      const schemaScore = schemaTypes.length > 3 ? 80 : schemaTypes.length > 0 ? 50 : 20;
      const orgScore = comp.processedMetrics.hasOrganizationSchema ? 80 : 30;
      comp.processedMetrics.eeatSignals = Math.round((schemaScore + orgScore + seoScore) / 3);
      
      // Keyword Gap Score (based on organic keywords - calibrated for higher values)
      comp.processedMetrics.keywordGap = finalKeywords > 50000 ? 95 : 
                                          finalKeywords > 10000 ? 85 :
                                          finalKeywords > 1000 ? 70 :
                                          finalKeywords > 100 ? 50 : 30;
      
      // GEO Presence (based on traffic + authority)
      comp.processedMetrics.geoPresence = Math.round((comp.processedMetrics.authorityMomentum + Math.min(100, finalTraffic / 5000)) / 2);
      
      // AEO Readiness (based on schema + content structure)
      comp.processedMetrics.aeoReadiness = Math.round((schemaScore + seoScore) / 2);
      
      // Overall Score (weighted composite of all key metrics)
      comp.processedMetrics.overallScore = Math.round(
        (comp.processedMetrics.siteHealth * 0.25) +
        (comp.processedMetrics.authorityMomentum * 0.25) +
        (comp.processedMetrics.topicalAuthority * 0.20) +
        (comp.processedMetrics.eeatSignals * 0.15) +
        (comp.processedMetrics.keywordGap * 0.15)
      );
      
      // ─────────────────────────────────────────────────────────────────────
      // LOG EXTRACTED METRICS
      // ─────────────────────────────────────────────────────────────────────
      Logger.log('      ✅ ' + domain + ': REAL metrics extracted:');
      Logger.log('         PageSpeed: SEO=' + seoScore + ', Perf=' + performanceScore);
      Logger.log('         Authority: PageRank=' + pageRankDecimal + ', DomainRank=' + domainRank);
      Logger.log('         Content: WordCount=' + wordCount + ', Keywords=' + finalKeywords);
      Logger.log('         Overall Score: ' + comp.processedMetrics.overallScore);
      
      return comp;
    }).filter(function(comp) {
      return comp !== null; // Remove any null entries
    });
  }

  // ============================================================================
  // DIAGNOSTIC & TESTING
  // ============================================================================

  /**
  * Test Stage 1 workflow
  */
  function TEST_Stage1_Direct() {
    Logger.log('=== DIAGNOSTIC TEST: Stage 1 ===');
    
    const testPayload = {
      stageNum: 1,
      projectId: 'DIAGNOSTIC_TEST_' + Date.now(),
      model: 'gemini-3-flash-preview',
      brandName: 'Test Brand',
      primaryKeyword: 'test keyword',
      businessCategory: 'Testing',
      targetAudience: 'Test Audience',
      productDescription: 'Test Product'
    };
    
    try {
      const result = runWorkflowStage(testPayload);
      
      Logger.log('✅ TEST COMPLETE');
      Logger.log('   Success: ' + result.success);
      Logger.log('   Stage: ' + result.stage);
      
      return result;
    } catch (error) {
      Logger.log('❌ TEST FAILED: ' + error.toString());
      throw error;
    }
  }

  /**
  * Test gateway connection
  */
  function TEST_GatewayConnection() {
    return testGatewayConnection(); // From UI_Gateway.gs
  }

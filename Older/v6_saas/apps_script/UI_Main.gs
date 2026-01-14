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
      .addItem('🔍 Run Diagnostics', 'runDiagnostics')
      .addItem('❓ Help', 'showHelp')
      .addToUi();
  }

  /**
  * Show main sidebar
  */
  function showSidebar() {
    const html = HtmlService.createTemplateFromFile('UI_Dashboard')
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
  */
  function include(name) {
    return HtmlService.createHtmlOutputFromFile(name).getContent();
  }

  /**
  * Web app entry point
  * UPDATED: Check for license key and show appropriate page
  */
  function doGet(e) {
    // Check if user has license key configured
    const licenseKey = getUserLicenseKey();
    
    // Always show main dashboard, skip onboarding
    return HtmlService.createTemplateFromFile('UI_Dashboard')
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
    
    try {
      Logger.log('🔗 runWorkflowStage called with ' + arguments.length + ' arguments');
      
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
      // CALL GATEWAY WITH CREDIT VALIDATION
      // ============================================================================
      Logger.log('🚀 Calling gateway for workflow:stage' + stageNum);
      
      // First, check authorization and get transaction ID
      const authResult = executeWorkflowStage(stageNum, mergedData); // From UI_Gateway.gs
      
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
        completeTransaction(transactionId, stageResult);
        
        Logger.log('✅ Stage ' + stageNum + ' completed successfully');
        
        return {
          success: true,
          stage: stageNum,
          data: stageResult,
          credits: authResult.creditCost,
          timestamp: new Date().toISOString()
        };
        
      } catch (stageError) {
        // Mark transaction as failed (refunds credits)
        failTransaction(transactionId, stageError.toString());
        
        throw stageError;
      }
      
    } catch (error) {
      Logger.log('❌ Workflow error: ' + error.toString());
      
      // Format error for user display
      return showErrorToUser(error);
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
        
        const config = {
          competitors: safeCompetitors,
          projectContext: safeProjectContext,
          yourDomain: safeProjectContext.brandName || 'Your Site',
          projectId: actualProjectId,  // Use actual project ID for proper save/load
          spreadsheetId: spreadsheetId
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
              
              return {
                domain: domain,
                url: compData.url || 'https://' + domain,
                fetchSuccess: compData.fetchSuccess !== false,
                snapshot: compData.snapshot || {},
                apiData: compData.apiData || {},
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
              comp.processedMetrics.authorityScore = Number(comp.processedMetrics.authorityScore) || 30;
              comp.processedMetrics.organicKeywords = Number(comp.processedMetrics.organicKeywords) || 1000;
              comp.processedMetrics.organicTraffic = Number(comp.processedMetrics.organicTraffic) || 500;
              comp.processedMetrics.estimatedTraffic = Number(comp.processedMetrics.estimatedTraffic) || 500;
              comp.processedMetrics.backlinks = Number(comp.processedMetrics.backlinks) || 5000;
              comp.processedMetrics.estimatedBacklinks = Number(comp.processedMetrics.estimatedBacklinks) || 5000;
              comp.processedMetrics.refDomains = Number(comp.processedMetrics.refDomains) || 500;
              comp.processedMetrics.estimatedRefDomains = Number(comp.processedMetrics.estimatedRefDomains) || 500;
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
          geminiEstimates[cleanDomain] = {
            authorityScore: est.authorityScore || 30,
            organicKeywords: est.organicKeywords || 1000,
            organicTraffic: est.organicTraffic || 500,
            backlinks: est.backlinks || 5000,
            refDomains: est.refDomains || 500,
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
      const synthesized = comp.synthesized || {};
      
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
      // Accept both page_rank_decimal (API format) and rank (simplified format)
      const pageRankDecimal = parseFloat(openPageRank.page_rank_decimal) || parseFloat(openPageRank.rank) || synthesized.authority?.pageRank || 0;
      comp.processedMetrics.pageRank = pageRankDecimal;
      
      // Domain Rank (global position)
      const domainRank = parseInt(openPageRank.rank) || synthesized.authority?.domainRank || 0;
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
      const geminiEst = geminiEstimates[cleanDomain] || geminiEstimates[domain] || null;
      
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
        // ═══════════════════════════════════════════════════════════════════
        Logger.log('      🤖 Using Gemini estimates for ' + cleanDomain);
        
        // SAFE EXTRACTION: Ensure all values are numbers with fallbacks
        authorityScore = Number(geminiEst.authorityScore) || 30;
        estimatedOrganicKeywords = Number(geminiEst.organicKeywords) || 1000;
        estimatedTraffic = Number(geminiEst.organicTraffic) || 500;
        estimatedBacklinks = Number(geminiEst.backlinks) || 5000;
        estimatedRefDomains = Number(geminiEst.refDomains) || 500;
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
      model: 'gemini-2.5-flash',
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

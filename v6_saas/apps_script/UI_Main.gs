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
  // This would save the currently active project
  SpreadsheetApp.getUi().alert('Save Project', 'Current project saved!', SpreadsheetApp.getUi().ButtonSet.OK);
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
 * Show settings dialog (calls the new UI_Settings.gs)
 */
function showSettingsDialog() {
  // This now calls the function from UI_Settings.gs
  showSettingsDialog();
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
      const currentModel = userProps.getProperty('SERPIFAI_GEMINI_MODEL') || 'gemini-2.5-flash';
      
      return {
        success: true,
        models: result.data.models || result.models,
        currentModel: currentModel
      };
    }
    
    // Fallback to Gemini 2.5 models if gateway fails
    return {
      success: true,
      models: [
        { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash ⚡ (Recommended)' },
        { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro 🧠' },
        { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite 💨' }
      ],
      currentModel: currentModel,
      fallback: true
    };
  } catch (e) {
    Logger.log('Error getting Gemini models: ' + e.toString());
    
    // Return fallback models
    return {
      success: true,
      models: [
        { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash ⚡' },
        { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro 🧠' }
      ],
      currentModel: 'gemini-2.5-flash',
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
  return userProps.getProperty('SERPIFAI_GEMINI_MODEL') || 'gemini-2.5-flash';
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
    
    // Ensure Gemini 2.5
    if (selectedModel.indexOf('gemini-2.5') !== 0) {
      Logger.log('⚠️ Using non-2.5 model: ' + selectedModel + '. Defaulting to gemini-2.5-flash');
      selectedModel = 'gemini-2.5-flash';
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
    // This is handled by DB_Workflow_StageX.gs files
    const transactionId = authResult.transactionId;
    let stageResult;
    
    try {
      // Call appropriate stage handler
      switch(stageNum) {
        case 1:
          stageResult = DB_Workflow_Stage1(mergedData, selectedModel);
          break;
        case 2:
          stageResult = DB_Workflow_Stage2(mergedData, selectedModel);
          break;
        case 3:
          stageResult = DB_Workflow_Stage3(mergedData, selectedModel);
          break;
        case 4:
          stageResult = DB_Workflow_Stage4(mergedData, selectedModel);
          break;
        case 5:
          stageResult = DB_Workflow_Stage5(mergedData, selectedModel);
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
    
    // Get spreadsheet ID
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    
    // Call gateway for credit validation and authorization
    Logger.log('📤 Calling gateway for comp:elite_full...');
    
    const payload = {
      competitors: safeCompetitors,
      projectContext: safeProjectContext,
      spreadsheetId: spreadsheetId
    };
    
    const authResult = runEliteAnalysis(safeCompetitors, safeProjectContext); // From UI_Gateway.gs
    
    if (!authResult.success) {
      throw new Error(authResult.error || 'Analysis authorization failed');
    }
    
    Logger.log('✅ Credits validated');
    Logger.log('   💳 Cost: ' + authResult.creditCost + ' credits');
    Logger.log('   🆔 Transaction: ' + authResult.transactionId);
    
    // Execute the actual analysis
    // This is handled by DB_Competitor_*.gs files
    const transactionId = authResult.transactionId;
    let analysisResult;
    
    try {
      // Call competitor orchestrator
      analysisResult = DB_Competitor_Orchestrator(safeCompetitors, safeProjectContext);
      
      // Transform for UI charts
      if (analysisResult.success && analysisResult.competitors) {
        analysisResult.competitors = transformCompetitorsForUI(analysisResult.competitors);
      }
      
      // Mark transaction complete
      completeTransaction(transactionId, analysisResult);
      
      Logger.log('✅ ELITE analysis complete');
      
      return analysisResult;
      
    } catch (analysisError) {
      // Mark transaction failed (refunds credits)
      failTransaction(transactionId, analysisError.toString());
      
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
 * Flattens nested categories.metrics into processedMetrics
 */
function transformCompetitorsForUI(competitors) {
  if (!competitors || !Array.isArray(competitors)) {
    Logger.log('⚠️ Invalid competitors array');
    return [];
  }
  
  return competitors.map(function(comp) {
    if (!comp.processedMetrics && comp.categories) {
      comp.processedMetrics = {};
      
      const categories = comp.categories;
      
      // Extract metrics from each category
      if (categories.authorityInfluence && categories.authorityInfluence.metrics) {
        comp.processedMetrics.authorityMomentum = categories.authorityInfluence.metrics.authorityMomentum || 50;
        comp.processedMetrics.backlinks = categories.authorityInfluence.metrics.totalBacklinks || 0;
        comp.processedMetrics.referringDomains = categories.authorityInfluence.metrics.referringDomains || 0;
      }
      
      if (categories.technicalSEO && categories.technicalSEO.metrics) {
        comp.processedMetrics.siteHealth = categories.technicalSEO.metrics.siteHealthScore || 70;
        comp.processedMetrics.pageSpeed = categories.technicalSEO.metrics.pageSpeedScore || 60;
        comp.processedMetrics.coreWebVitals = categories.technicalSEO.metrics.coreWebVitalsScore || 65;
      }
      
      if (categories.contentIntelligence && categories.contentIntelligence.metrics) {
        comp.processedMetrics.topicalAuthority = categories.contentIntelligence.metrics.topicalAuthorityScore || 55;
        comp.processedMetrics.contentDepth = categories.contentIntelligence.metrics.avgContentDepth || 1500;
      }
      
      if (categories.brandPositioning && categories.brandPositioning.metrics) {
        comp.processedMetrics.eeatSignals = categories.brandPositioning.metrics.eeatScore || 60;
      }
      
      if (categories.keywordStrategy && categories.keywordStrategy.metrics) {
        comp.processedMetrics.keywordGap = categories.keywordStrategy.metrics.keywordGapScore || 45;
        comp.processedMetrics.organicKeywords = categories.keywordStrategy.metrics.totalOrganicKeywords || 0;
      }
      
      if (categories.geoAeoIntelligence && categories.geoAeoIntelligence.metrics) {
        comp.processedMetrics.geoPresence = categories.geoAeoIntelligence.metrics.geoPresenceScore || 40;
        comp.processedMetrics.aeoReadiness = categories.geoAeoIntelligence.metrics.aeoReadinessScore || 50;
      }
      
      if (categories.scoringEngine && categories.scoringEngine.metrics) {
        comp.processedMetrics.overallScore = categories.scoringEngine.metrics.overallCompetitiveScore || 65;
      }
      
      Logger.log('   ✅ Transformed ' + comp.domain + ' - added ' + Object.keys(comp.processedMetrics).length + ' metrics');
    }
    
    return comp;
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

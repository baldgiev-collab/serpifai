/**
 * 🌉 DataBridge - Workflow Router
 * Routes incoming requests to appropriate workflow stages
 * Called by deployment.gs doGet/doPost functions
 */

function handleRequest(e) {
  try {
    // Parse incoming request safely
    let payload = {};
    let parseError = null;
    Logger.log('==== DataBridge handleRequest START ====');
    Logger.log('Raw event object: ' + JSON.stringify(e));
    try {
      if (e && e.postData && e.postData.contents) {
        payload = JSON.parse(e.postData.contents);
        Logger.log('Parsed payload from postData.contents: ' + JSON.stringify(payload));
      } else if (e && e.parameter && e.parameter.q) {
        payload = JSON.parse(e.parameter.q);
        Logger.log('Parsed payload from parameter.q: ' + JSON.stringify(payload));
      }
    } catch (parseErr) {
      Logger.log('⚠️ Failed to parse payload: ' + parseErr);
      parseError = parseErr;
      payload = {};
    }

    // Validate required fields
    if (!payload.action) {
      Logger.log('❌ Missing action in payload. Full payload: ' + JSON.stringify(payload));
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Missing action in payload', timestamp: new Date().toISOString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Model validation - MANDATORY: Only Gemini 2.5 models allowed (latest generation)
    if (payload.modelName && typeof payload.modelName === 'string' && payload.modelName.trim()) {
      const modelName = payload.modelName.trim();
      
      // ENFORCE Gemini 2.5 only - no deprecated 2.0 models
      if (modelName.indexOf('gemini-2.5') === 0 || modelName.indexOf('models/gemini-2.5') === 0) {
        // Valid 2.5 model
        PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', modelName.replace('models/', ''));
        Logger.log('✅ GEMINI_MODEL set from UI: ' + modelName);
      } else if (modelName.indexOf('gemini-2.0') === 0 || modelName.indexOf('gemini-1.') === 0) {
        // Deprecated old models - force upgrade to 2.5
        Logger.log('⚠️ DEPRECATED model: ' + modelName + ' → Upgrading to gemini-2.5-flash (latest)');
        PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', 'gemini-2.5-flash');
        Logger.log('🔄 GEMINI_MODEL upgraded to: gemini-2.5-flash');
      } else if (modelName.startsWith('gemini-') || modelName.startsWith('models/gemini-')) {
        // Unknown gemini model format - default to 2.5-flash
        Logger.log('⚠️ Unknown model format: ' + modelName + ' → Defaulting to gemini-2.5-flash');
        PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', 'gemini-2.5-flash');
      } else {
        Logger.log('❌ Invalid modelName format: ' + modelName);
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Invalid modelName format (must be gemini-2.5-*): ' + modelName, timestamp: new Date().toISOString() }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      // No model provided - enforce default to gemini-2.5-flash
      Logger.log('⚠️ No model provided in payload → Enforcing default: gemini-2.5-flash');
      PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', 'gemini-2.5-flash');
    }

    // Ensure payload.data is always an object
    if (!payload.data || typeof payload.data !== 'object') {
      Logger.log('⚠️ payload.data is missing or not an object. Initializing as empty object.');
      payload.data = {};
    }

    // Example required field validation for workflow actions
    if (payload.action.startsWith('workflow:')) {
      if (!payload.data.projectId) {
        Logger.log('❌ Missing projectId in payload.data. Full data: ' + JSON.stringify(payload.data));
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Missing projectId in payload.data', timestamp: new Date().toISOString() }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    Logger.log('📨 DataBridge received action: ' + (payload.action || 'undefined'));
    Logger.log('Full payload: ' + JSON.stringify(payload));

    // Route to appropriate handler
    let result;
    switch(payload.action) {
      case 'ping':
        result = { success: true, message: 'DataBridge is online', timestamp: new Date().toISOString() };
        break;
      case 'diagnostic:checkProperties':
        // Diagnostic endpoint to check Script Properties access
        const props = PropertiesService.getScriptProperties();
        const allProps = props.getProperties();
        const apiKey = props.getProperty('GEMINI_API_KEY');
        result = {
          success: true,
          propertiesCount: Object.keys(allProps).length,
          keys: Object.keys(allProps),
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey ? apiKey.length : 0,
          model: props.getProperty('GEMINI_MODEL') || 'Not set'
        };
        break;
      case 'workflow:stage1':
        result = runStage1Strategy(payload.data);
        break;
      case 'workflow:stage2':
        result = runStage2Keywords(payload.data);
        break;
      case 'workflow:stage3':
        result = runStage3Architecture(payload.data);
        break;
      case 'workflow:stage4':
        result = runStage4Calendar(payload.data);
        break;
      case 'workflow:stage5':
        result = runStage5Generation(payload.data);
        break;
      case 'COMP_orchestrateAnalysis':
        // Competitor Intelligence Analysis
        Logger.log('🔍 Routing to COMP_orchestrateAnalysis');
        Logger.log('Full payload: ' + JSON.stringify(payload));
        Logger.log('payload.config type: ' + typeof payload.config);
        Logger.log('payload.config value: ' + JSON.stringify(payload.config));
        Logger.log('payload.data type: ' + typeof payload.data);
        Logger.log('payload.data value: ' + JSON.stringify(payload.data));
        
        // CRITICAL FIX: Extract competitors from Stage 1 data (keyCompetitors field)
        var configToPass = payload.config || payload.data || {};
        
        // If keyCompetitors field exists (from Stage 1), parse it
        if (configToPass.keyCompetitors && typeof configToPass.keyCompetitors === 'string') {
          Logger.log('📋 Found keyCompetitors field: ' + configToPass.keyCompetitors);
          var competitorsList = configToPass.keyCompetitors
            .split(',')
            .map(function(c) { return c.trim(); })
            .filter(function(c) { return c.length > 0; });
          configToPass.competitors = competitorsList;
          Logger.log('✅ Parsed ' + competitorsList.length + ' competitors: ' + JSON.stringify(competitorsList));
        }
        
        // Ensure competitors array exists
        if (!configToPass.competitors || !Array.isArray(configToPass.competitors)) {
          configToPass.competitors = [];
        }
        
        // Set projectId and yourDomain
        configToPass.projectId = configToPass.projectId || configToPass.brandName || 'comp-' + Date.now();
        configToPass.yourDomain = configToPass.brandName || configToPass.yourDomain || 'Your Site';
        
        Logger.log('🎯 Final config to pass:');
        Logger.log('   competitors: ' + JSON.stringify(configToPass.competitors));
        Logger.log('   projectId: ' + configToPass.projectId);
        Logger.log('   yourDomain: ' + configToPass.yourDomain);
        
        result = COMP_orchestrateAnalysis(configToPass);
        break;
      case 'ELITE_analyzeCompetitors':
        // ELITE Competitor Analysis (Routes to proven COMP system)
        Logger.log('🎯 Routing to ELITE_analyzeCompetitors → COMP_orchestrateAnalysis');
        Logger.log('Competitors: ' + (payload.competitors || []).length);
        Logger.log('Project Context: ' + JSON.stringify(payload.projectContext || {}));
        Logger.log('Spreadsheet ID: ' + (payload.spreadsheetId || 'NOT PROVIDED'));
        result = COMP_orchestrateAnalysis({
          competitors: payload.competitors || [],
          projectId: (payload.projectContext && payload.projectContext.projectId) || 'elite-' + Date.now(),
          yourDomain: (payload.projectContext && payload.projectContext.brandName) || 'Your Site',
          projectContext: payload.projectContext || {},
          spreadsheetId: payload.spreadsheetId || '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU' // Fallback to known sheet
        });
        break;
      default:
        Logger.log('❌ Unknown action received: ' + payload.action);
        result = {
          success: false,
          error: 'Unknown action: ' + payload.action
        };
    }

    // Workflow stages should return success status
    // Note: We don't enforce json+report structure here since stages handle their own error formats
    if (payload.action.startsWith('workflow:') && result && !result.success) {
      Logger.log('⚠️ Workflow stage returned error: ' + (result.error || 'Unknown error'));
    }

    // Return JSON response
    Logger.log('==== DataBridge handleRequest END ====');
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ DataBridge error: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Stage 2-5 wrapper functions
 * These call the actual workflow stage handlers from workflow_engine/
 */
function runStage2Keywords(data) {
  Logger.log('🎯 Running Stage 2: Keyword Research');
  Logger.log('📊 Project data received: ' + JSON.stringify(data));
  
  // Call the actual keyword stage function
  const result = WF_keywordStage(data);
  
  // Return in standardized format
  return {
    success: true,
    stage: 2,
    json: result,
    report: '## 🔍 Stage 2: Keyword Research\n\nKeyword research completed successfully.',
    timestamp: new Date().toISOString()
  };
}

function runStage3Architecture(data) {
  Logger.log('🎯 Running Stage 3: Content Architecture');
  Logger.log('📊 Project data received: ' + JSON.stringify(data));
  
  // Call the clustering stage for content architecture
  const result = WF_clusteringStage(data);
  
  // Return in standardized format
  return {
    success: true,
    stage: 3,
    json: result,
    report: '## 🏗️ Stage 3: Content Architecture\n\nContent architecture and clustering completed successfully.',
    timestamp: new Date().toISOString()
  };
}

function runStage4Calendar(data) {
  Logger.log('🎯 Running Stage 4: Editorial Calendar');
  Logger.log('📊 Project data received: ' + JSON.stringify(data));
  
  // Call the calendar stage function
  const result = WF_calendarStage(data);
  
  // Return in standardized format
  return {
    success: true,
    stage: 4,
    json: result,
    report: '## 📅 Stage 4: Editorial Calendar\n\nEditorial calendar generated successfully.',
    timestamp: new Date().toISOString()
  };
}

function runStage5Generation(data) {
  Logger.log('🎯 Running Stage 5: Content Generation');
  Logger.log('📊 Project data received: ' + JSON.stringify(data));
  
  // Call the content generation stage function
  const result = WF_contentGenerationStage(data);
  
  // Return in standardized format
  return {
    success: true,
    stage: 5,
    json: result,
    report: '## ✍️ Stage 5: Content Generation\n\nContent generation completed successfully.',
    timestamp: new Date().toISOString()
  };
}

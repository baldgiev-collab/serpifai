/**
 * DB_WF_Router.gs
 * Workflow Engine Router - handles all 5 workflow stages
 */

/**
 * Handle incoming workflow requests
 * Routes to appropriate stage handler
 */
function handleRequest(e) {
  try {
    var payload = {};
    
    // Parse request
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.q) {
      payload = JSON.parse(e.parameter.q);
    }
    
    if (!payload.action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing action in payload'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    DB_LOG_info('WORKFLOW', 'Received action: ' + payload.action);
    
    // Route to DB_handle which will route to appropriate stage
    var result = DB_handle(payload.action, payload.data || {});
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: String(err),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Run Stage 1: Strategy & Market Research
 * NOW EXECUTES DIRECTLY IN APPS SCRIPT (not through PHP gateway)
 */
function DB_WF_runStage1Strategy(data, selectedModel) {
  try {
    Logger.log('🚀 DB_WF_runStage1Strategy called - routing to DB_Workflow_Stage1');
    
    // Call the new elite Stage 1 implementation directly
    return DB_Workflow_Stage1(data, selectedModel);
    
  } catch (error) {
    Logger.log('❌ Stage 1 routing error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      stage: 1
    };
  }
}

/**
 * Run Stage 2: Keyword Discovery
 */
function DB_WF_runStage2Keywords(data) {
  return callGateway({
    action: 'workflow:stage2',
    data: data
  });
}

/**
 * Run Stage 3: Clustering & Architecture
 */
function DB_WF_runStage3Architecture(data) {
  return callGateway({
    action: 'workflow:stage3',
    data: data
  });
}

/**
 * Run Stage 4: Content Calendar
 */
function DB_WF_runStage4Calendar(data) {
  return callGateway({
    action: 'workflow:stage4',
    data: data
  });
}

/**
 * Run Stage 5: Content Generation
 */
function DB_WF_runStage5Generation(data) {
  return callGateway({
    action: 'workflow:stage5',
    data: data
  });
}

// Legacy stage functions
function DB_WF_strategyStage(data) {
  return DB_WF_runStage1Strategy(data);
}

function DB_WF_keywordStage(data) {
  return DB_WF_runStage2Keywords(data);
}

function DB_WF_clusteringStage(data) {
  return DB_WF_runStage3Architecture(data);
}

function DB_WF_calendarStage(data) {
  return DB_WF_runStage4Calendar(data);
}

function DB_WF_contentGenerationStage(data) {
  return DB_WF_runStage5Generation(data);
}

// Legacy names for backwards compatibility
function runStage1Strategy(data) {
  return DB_WF_runStage1Strategy(data);
}

function runStage2Keywords(data) {
  return DB_WF_runStage2Keywords(data);
}

function runStage3Architecture(data) {
  return DB_WF_runStage3Architecture(data);
}

function runStage4Calendar(data) {
  return DB_WF_runStage4Calendar(data);
}

function runStage5Generation(data) {
  return DB_WF_runStage5Generation(data);
}

function WF_strategyStage(data) {
  return DB_WF_runStage1Strategy(data);
}

function WF_keywordStage(data) {
  return DB_WF_runStage2Keywords(data);
}

function WF_clusteringStage(data) {
  return DB_WF_runStage3Architecture(data);
}

function WF_calendarStage(data) {
  return DB_WF_runStage4Calendar(data);
}

function WF_contentGenerationStage(data) {
  return DB_WF_runStage5Generation(data);
}

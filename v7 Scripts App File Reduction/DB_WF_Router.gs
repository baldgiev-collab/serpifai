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
 * NOW EXECUTES DIRECTLY IN APPS SCRIPT
 */
function DB_WF_runStage2Keywords(data, selectedModel) {
  try {
    Logger.log('🚀 DB_WF_runStage2Keywords called - routing to DB_Workflow_Stage2');
    return DB_Workflow_Stage2(data, selectedModel);
  } catch (error) {
    Logger.log('❌ Stage 2 routing error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      stage: 2
    };
  }
}

/**
 * Run Stage 3: Clustering & Architecture
 * NOW EXECUTES DIRECTLY IN APPS SCRIPT
 */
function DB_WF_runStage3Architecture(data, selectedModel) {
  try {
    Logger.log('🚀 DB_WF_runStage3Architecture called - routing to DB_Workflow_Stage3');
    return DB_Workflow_Stage3(data, selectedModel);
  } catch (error) {
    Logger.log('❌ Stage 3 routing error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      stage: 3
    };
  }
}

/**
 * Run Stage 4: Content Calendar
 * NOW EXECUTES DIRECTLY IN APPS SCRIPT
 */
function DB_WF_runStage4Calendar(data, selectedModel) {
  try {
    Logger.log('🚀 DB_WF_runStage4Calendar called - routing to DB_Workflow_Stage4');
    return DB_Workflow_Stage4(data, selectedModel);
  } catch (error) {
    Logger.log('❌ Stage 4 routing error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      stage: 4
    };
  }
}

/**
 * Run Stage 5: Content Generation
 * NOW EXECUTES DIRECTLY IN APPS SCRIPT
 */
function DB_WF_runStage5Generation(data, selectedModel) {
  try {
    Logger.log('🚀 DB_WF_runStage5Generation called - routing to DB_Workflow_Stage5');
    return DB_Workflow_Stage5(data, selectedModel);
  } catch (error) {
    Logger.log('❌ Stage 5 routing error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      stage: 5
    };
  }
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
/**
 * =========================================================================
 * WORKFLOW STATE RECOVERY: Load saved stage results for UI hydration
 * =========================================================================
 * Called from loadProject to restore workflow state when project loads
 */
function loadWorkflowStageResults(projectId, stageNum) {
  try {
    Logger.log('📂 Loading Stage ' + stageNum + ' results for: ' + projectId);
    
    // Use PHP gateway to fetch from job_results table
    const response = callGateway('job_get_results', {
      project_id: projectId,
      result_type: 'WORKFLOW_STAGE_' + stageNum
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      const latestResult = response.results[0];
      const parsedData = JSON.parse(latestResult.data_json || '{}');
      
      Logger.log('✅ Found Stage ' + stageNum + ' results, created: ' + latestResult.created_at);
      
      return {
        success: true,
        stage: stageNum,
        json: parsedData.json || parsedData,
        report: parsedData.report || '',
        timestamp: latestResult.created_at,
        model: parsedData.model || 'unknown'
      };
    }
    
    Logger.log('ℹ️ No saved results for Stage ' + stageNum);
    return { success: false, stage: stageNum, reason: 'No saved results' };
    
  } catch (error) {
    Logger.log('⚠️ Error loading Stage ' + stageNum + ' results: ' + error.toString());
    return { success: false, stage: stageNum, error: error.toString() };
  }
}

/**
 * Get all completed workflow stages for a project
 * Returns which stages have saved results for UI state recovery
 */
function getWorkflowStatus(projectId) {
  try {
    Logger.log('📊 Getting workflow status for: ' + projectId);
    
    const status = {
      projectId: projectId,
      stages: {}
    };
    
    // Check each stage (1-5)
    for (let i = 1; i <= 5; i++) {
      const result = loadWorkflowStageResults(projectId, i);
      status.stages[i] = {
        completed: result.success,
        timestamp: result.timestamp || null,
        hasData: result.success
      };
    }
    
    Logger.log('📊 Workflow status:', JSON.stringify(status));
    return status;
    
  } catch (error) {
    Logger.log('⚠️ Error getting workflow status: ' + error.toString());
    return { projectId: projectId, stages: {}, error: error.toString() };
  }
}
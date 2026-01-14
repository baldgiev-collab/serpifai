/**
 * DB_WF_Router.gs - Workflow Router
 * SerpifAI V8 - Routes workflow actions to appropriate stage handlers
 * 
 * Based on V7's DB_WF_Router.gs
 */

/**
 * Workflow stage names
 */
var WF_STAGES = {
  0: 'Not Started',
  1: 'Strategic Foundation',
  2: 'Competitive Intelligence',
  3: 'Content Architecture',
  4: 'Content Creation',
  5: 'Technical Optimization'
};

/**
 * Main workflow action router
 * @param {string} action - Workflow action (e.g., 'workflow:runStage1')
 * @param {object} payload - Action payload
 * @return {object} Action result
 */
function DB_WF_handleRoute(action, payload) {
  payload = payload || {};
  
  LOG_debug('DB_WF_handleRoute', { action: action });
  
  // Parse stage number from action
  const stageMatch = action.match(/stage(\d+)/i);
  const stageNumber = stageMatch ? parseInt(stageMatch[1]) : 0;
  
  // Specific action routing
  if (action === 'workflow:getStatus' || action === 'wf:status') {
    return DB_WF_getStatus(payload);
  }
  
  if (action === 'workflow:reset' || action === 'wf:reset') {
    return DB_WF_resetWorkflow(payload);
  }
  
  if (action === 'workflow:getProgress' || action === 'wf:progress') {
    return DB_WF_getProgress(payload);
  }
  
  // Stage execution routing
  if (action.includes('run') || action.includes('execute')) {
    switch (stageNumber) {
      case 1:
        return DB_WF_runStage1(payload);
      case 2:
        return DB_WF_runStage2(payload);
      case 3:
        return DB_WF_runStage3(payload);
      case 4:
        return DB_WF_runStage4(payload);
      case 5:
        return DB_WF_runStage5(payload);
      default:
        return { ok: false, error: 'Invalid stage number: ' + stageNumber };
    }
  }
  
  // Stage data retrieval
  if (action.includes('get') || action.includes('load')) {
    return DB_WF_getStageData(stageNumber, payload);
  }
  
  // Stage save
  if (action.includes('save')) {
    return DB_WF_saveStageData(stageNumber, payload);
  }
  
  return { ok: false, error: 'Unknown workflow action: ' + action };
}

/**
 * Get workflow status for a project
 * @param {object} payload - Contains projectId
 * @return {object} Workflow status
 */
function DB_WF_getStatus(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load project
    const projectResult = DB_PM_loadProject({ projectId: projectId });
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const workflowState = projectResult.project.workflowState || {
      currentStage: 0,
      completedStages: [],
      stageData: {}
    };
    
    return {
      ok: true,
      projectId: projectId,
      currentStage: workflowState.currentStage,
      currentStageName: WF_STAGES[workflowState.currentStage] || 'Unknown',
      completedStages: workflowState.completedStages,
      stages: Object.keys(WF_STAGES).map(num => ({
        number: parseInt(num),
        name: WF_STAGES[num],
        completed: workflowState.completedStages.includes(parseInt(num)),
        hasData: !!workflowState.stageData[num]
      }))
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_getStatus');
  }
}

/**
 * Get workflow progress percentage
 * @param {object} payload - Contains projectId
 * @return {object} Progress data
 */
function DB_WF_getProgress(payload) {
  try {
    const status = DB_WF_getStatus(payload);
    
    if (!status.ok) {
      return status;
    }
    
    const totalStages = 5;
    const completedCount = status.completedStages.length;
    const progressPercent = Math.round((completedCount / totalStages) * 100);
    
    return {
      ok: true,
      projectId: payload.projectId,
      completedStages: completedCount,
      totalStages: totalStages,
      progressPercent: progressPercent,
      currentStage: status.currentStage,
      nextStage: completedCount < totalStages ? completedCount + 1 : null
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_getProgress');
  }
}

/**
 * Reset workflow to initial state
 * @param {object} payload - Contains projectId
 * @return {object} Reset result
 */
function DB_WF_resetWorkflow(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Update project workflow state
    const updateResult = DB_PM_saveProject({
      projectId: projectId,
      workflowState: {
        currentStage: 0,
        completedStages: [],
        stageData: {}
      }
    });
    
    return {
      ok: true,
      message: 'Workflow reset successfully',
      projectId: projectId
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_resetWorkflow');
  }
}

/**
 * Get data for a specific stage
 * @param {number} stageNumber - Stage number
 * @param {object} payload - Contains projectId
 * @return {object} Stage data
 */
function DB_WF_getStageData(stageNumber, payload) {
  try {
    const projectResult = DB_PM_loadProject({ projectId: payload.projectId });
    
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const stageData = projectResult.project.workflowState?.stageData?.[stageNumber] || null;
    
    return {
      ok: true,
      stageNumber: stageNumber,
      stageName: WF_STAGES[stageNumber],
      data: stageData,
      hasData: !!stageData
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_getStageData');
  }
}

/**
 * Save data for a specific stage
 * @param {number} stageNumber - Stage number
 * @param {object} payload - Contains projectId and data
 * @return {object} Save result
 */
function DB_WF_saveStageData(stageNumber, payload) {
  try {
    const projectId = payload.projectId;
    const stageData = payload.data || payload;
    
    // Load current project
    const projectResult = DB_PM_loadProject({ projectId: projectId });
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const project = projectResult.project;
    project.workflowState = project.workflowState || {
      currentStage: 0,
      completedStages: [],
      stageData: {}
    };
    
    // Update stage data
    project.workflowState.stageData[stageNumber] = stageData;
    project.workflowState.currentStage = stageNumber;
    
    // Mark stage as completed if data is present
    if (!project.workflowState.completedStages.includes(stageNumber)) {
      project.workflowState.completedStages.push(stageNumber);
      project.workflowState.completedStages.sort();
    }
    
    // Save project
    return DB_PM_saveProject(project);
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_saveStageData');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// STAGE EXECUTION STUBS (Implemented in separate files)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Run Stage 1 - Strategic Foundation
 * @param {object} payload - Stage payload
 * @return {object} Stage result
 */
function DB_WF_runStage1(payload) {
  // Implemented in DB_WF_Stage1.gs
  if (typeof DB_WF_executeStage1 === 'function') {
    return DB_WF_executeStage1(payload);
  }
  return { ok: false, error: 'Stage 1 handler not loaded' };
}

/**
 * Run Stage 2 - Competitive Intelligence
 */
function DB_WF_runStage2(payload) {
  if (typeof DB_WF_executeStage2 === 'function') {
    return DB_WF_executeStage2(payload);
  }
  return { ok: false, error: 'Stage 2 handler not loaded' };
}

/**
 * Run Stage 3 - Content Architecture
 */
function DB_WF_runStage3(payload) {
  if (typeof DB_WF_executeStage3 === 'function') {
    return DB_WF_executeStage3(payload);
  }
  return { ok: false, error: 'Stage 3 handler not loaded' };
}

/**
 * Run Stage 4 - Content Creation
 */
function DB_WF_runStage4(payload) {
  if (typeof DB_WF_executeStage4 === 'function') {
    return DB_WF_executeStage4(payload);
  }
  return { ok: false, error: 'Stage 4 handler not loaded' };
}

/**
 * Run Stage 5 - Technical Optimization
 */
function DB_WF_runStage5(payload) {
  if (typeof DB_WF_executeStage5 === 'function') {
    return DB_WF_executeStage5(payload);
  }
  return { ok: false, error: 'Stage 5 handler not loaded' };
}

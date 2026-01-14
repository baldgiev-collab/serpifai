/**
 * DB_Config.gs
 * Configuration management with MySQL database integration
 * Replaces Google Sheets with database-backed project storage
 */

/**
 * Get project inputs
 * Priority: 1) Database (via Gateway), 2) Defaults
 * @param {object} params - Parameters with optional project_id
 * @return {object} All input fields as key-value pairs
 */
function DB_CONFIG_getInputs(params) {
  params = params || {};
  
  try {
    // Load from Database via Gateway
    if (params.project_id) {
      var project = callGateway({
        action: 'project:load',
        data: { project_id: params.project_id }
      });
      
      if (project && project.success && project.data && project.data.inputs) {
        return { 
          ok: true, 
          data: project.data.inputs, 
          source: 'database' 
        };
      }
    }
    
    // Return defaults if no project found
    return {
      ok: true,
      data: DB_CONFIG_getDefaultInputs(),
      source: 'defaults'
    };
    
  } catch (e) {
    DB_LOG_error('CONFIG', 'Error in DB_CONFIG_getInputs: ' + e);
    return {
      ok: false,
      error: String(e),
      data: DB_CONFIG_getDefaultInputs(),
      source: 'defaults'
    };
  }
}

/**
 * Save project inputs to database
 * @param {object} params - { project_id, inputs, name, domain, language }
 * @return {object} Save result
 */
function DB_CONFIG_saveProjectInputs(params) {
  params = params || {};
  
  try {
    var projectId = params.project_id || 'active';
    var inputs = params.inputs || {};
    
    // Save to database via Gateway
    var result = callGateway({
      action: 'project:save',
      data: {
        project_id: projectId,
        name: params.name || inputs.projectName || 'Untitled Project',
        domain: inputs.domain || inputs.brandName || '',
        language: inputs.language || 'en',
        inputs: inputs
      }
    });
    
    return result;
    
  } catch (e) {
    DB_LOG_error('CONFIG', 'Error saving project inputs: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Save stage output to database
 * @param {string} stage - Stage name (strategy, keywords, clustering, calendar, generate)
 * @param {object} output - Stage output data
 * @param {string} projectId - Project ID
 * @return {object} Save result
 */
function DB_CONFIG_savePromptOutput(stage, output, projectId) {
  try {
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load existing project
    var projectResult = callGateway({
      action: 'project:load',
      data: { project_id: projectId }
    });
    
    if (!projectResult || !projectResult.success) {
      return { ok: false, error: 'Project not found' };
    }
    
    var project = projectResult.data || {};
    
    // Update strategy outputs
    if (!project.strategy) {
      project.strategy = {};
    }
    project.strategy[stage] = output;
    
    // Save back to database
    var saveResult = callGateway({
      action: 'project:save',
      data: {
        project_id: projectId,
        strategy: project.strategy
      }
    });
    
    return { 
      ok: saveResult.success, 
      stage: stage, 
      projectId: projectId 
    };
    
  } catch (e) {
    DB_LOG_error('CONFIG', 'Error saving prompt output: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Get stage output from database
 * @param {string} stage - Stage name
 * @param {string} projectId - Project ID
 * @return {object} Stage output
 */
function DB_CONFIG_getStageOutput(stage, projectId) {
  try {
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load project from database
    var projectResult = callGateway({
      action: 'project:load',
      data: { project_id: projectId }
    });
    
    if (!projectResult || !projectResult.success) {
      return { ok: false, error: 'Project not found' };
    }
    
    var project = projectResult.data || {};
    
    if (project.strategy && project.strategy[stage]) {
      return { 
        ok: true, 
        data: project.strategy[stage], 
        source: 'database' 
      };
    }
    
    return { 
      ok: false, 
      error: 'No output found for stage: ' + stage 
    };
    
  } catch (e) {
    DB_LOG_error('CONFIG', 'Error getting stage output: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Get default input values (fallback)
 * @return {object} Default inputs
 */
function DB_CONFIG_getDefaultInputs() {
  return {
    brandName: { value: '', additional: '' },
    brandIdeology: { value: '', additional: '' },
    brandArchetype: { value: '', additional: '' },
    brandLexicon: { value: '', additional: '' },
    objective: { value: '', additional: '' },
    coreTopic: { value: '', additional: '' },
    targetAudience: { value: '', additional: '' },
    audiencePains: { value: '', additional: '' },
    desiredState: { value: '', additional: '' },
    competitors: { value: '', additional: '' },
    offerMatrix: { value: '', additional: '' },
    uvp: { value: '', additional: '' },
    distributionChannels: { value: '', additional: '' },
    kpis: { value: '', additional: '' },
    strategicQuestion: { value: '', additional: '' },
    categoryDefinition: { value: '', additional: '' },
    marketProblem: { value: '', additional: '' },
    futureVision: { value: '', additional: '' }
  };
}

/**
 * Helper: Get single input value
 * @param {object} inputs - All inputs
 * @param {string} key - Input key
 * @param {*} defaultValue - Default if not found
 * @return {*} Input value
 */
function DB_CONFIG_getInputValue(inputs, key, defaultValue) {
  defaultValue = defaultValue || '';
  
  if (!inputs || !inputs[key]) {
    return defaultValue;
  }
  
  // Handle both formats: {value, additional} or direct value
  if (typeof inputs[key] === 'object' && inputs[key].value !== undefined) {
    return inputs[key].value || defaultValue;
  }
  
  return inputs[key] || defaultValue;
}

/**
 * Get API configuration
 * NOTE: In v6, all API keys are in PHP Gateway config.php
 * This function returns gateway endpoint info only
 * @return {object} API configuration
 */
function DB_CONFIG_getApiConfig() {
  return {
    gatewayUrl: GATEWAY_URL,
    useGateway: true,
    note: 'All API keys managed server-side in PHP Gateway'
  };
}

/**
 * Legacy function names for backwards compatibility
 */
function CONFIG_getInputs(params) {
  return DB_CONFIG_getInputs(params);
}

function CONFIG_saveProjectInputs(params) {
  return DB_CONFIG_saveProjectInputs(params);
}

function CONFIG_savePromptOutput(stage, output, projectId) {
  return DB_CONFIG_savePromptOutput(stage, output, projectId);
}

function CONFIG_getStageOutput(stage, projectId) {
  return DB_CONFIG_getStageOutput(stage, projectId);
}

function CONFIG_getApiConfig() {
  return DB_CONFIG_getApiConfig();
}

function CONFIG_getInputValue(inputs, key, defaultValue) {
  return DB_CONFIG_getInputValue(inputs, key, defaultValue);
}

function CONFIG_getDefaultInputs() {
  return DB_CONFIG_getDefaultInputs();
}

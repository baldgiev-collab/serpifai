/**
 * GLOBAL CONFIGURATION & SHEET INTEGRATION
 * Centralized system for managing project inputs, outputs, and sheet connections
 * Works with external Sheet ID: 14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU
 */

// Global Sheet ID (Master Inputs Dashboard)
var GLOBAL_SHEET_ID = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';

// Sheet tab names
var SHEET_TABS = {
  MASTER_INPUTS: 'Master Inputs Dashboard',
  PROMPT_OUTPUTS: 'Prompt Outputs',
  CALENDAR: 'Calendar',
  COMPETITORS: 'Competitors',
  QA_SCORES: 'QA Scores',
  PERFORMANCE: 'Performance'
};

/**
 * Get global spreadsheet reference
 * @return {Spreadsheet} Global spreadsheet
 */
function CONFIG_getGlobalSheet() {
  try {
    return SpreadsheetApp.openById(GLOBAL_SHEET_ID);
  } catch (e) {
    Logger.log('Error opening global sheet: ' + e);
    return null;
  }
}

/**
 * Get project inputs from UI or fallback to Sheet
 * Priority: 1) UI/Project Manager, 2) Global Sheet, 3) Defaults
 * @param {object} params - Parameters with optional project_id
 * @return {object} All input fields as key-value pairs
 */
function CONFIG_getInputs(params) {
  params = params || {};
  
  try {
    // Option 1: Load from Project Manager (UI-saved data)
    if (params.project_id) {
      var project = PM_loadProject({ project_id: params.project_id });
      if (project && project.inputs) {
        return { ok: true, data: project.inputs, source: 'project_manager' };
      }
    }
    
    // Option 2: Load from Global Sheet (Master Inputs Dashboard)
    var sheetInputs = CONFIG_getMasterInputsFromSheet();
    if (sheetInputs.ok) {
      return { ok: true, data: sheetInputs.data, source: 'global_sheet' };
    }
    
    // Option 3: Return defaults
    return {
      ok: true,
      data: CONFIG_getDefaultInputs(),
      source: 'defaults'
    };
    
  } catch (e) {
    Logger.log('Error in CONFIG_getInputs: ' + e);
    return {
      ok: false,
      error: String(e),
      data: CONFIG_getDefaultInputs(),
      source: 'defaults'
    };
  }
}

/**
 * Read Master Inputs from Global Sheet
 * Expects: Column A = Field Name, Column B = Value, Column C = Additional Data
 * @return {object} Parsed inputs
 */
function CONFIG_getMasterInputsFromSheet() {
  try {
    var ss = CONFIG_getGlobalSheet();
    if (!ss) {
      return { ok: false, error: 'Cannot access global sheet' };
    }
    
    var sheet = ss.getSheetByName(SHEET_TABS.MASTER_INPUTS);
    if (!sheet) {
      return { ok: false, error: 'Master Inputs Dashboard tab not found' };
    }
    
    var data = sheet.getDataRange().getValues();
    var inputs = {};
    
    // Skip header row, process data rows
    for (var i = 1; i < data.length; i++) {
      var fieldName = data[i][0]; // Column A
      var value = data[i][1]; // Column B
      var additional = data[i][2]; // Column C
      
      if (fieldName && String(fieldName).trim() !== '') {
        // Clean field name (convert to camelCase)
        var cleanName = fieldName.toString().trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+(.)/g, function(match, chr) { return chr.toUpperCase(); })
          .replace(/^\w/, function(chr) { return chr.toLowerCase(); });
        
        inputs[cleanName] = {
          value: value || '',
          additional: additional || '',
          raw: fieldName
        };
      }
    }
    
    return { ok: true, data: inputs };
    
  } catch (e) {
    Logger.log('Error reading Master Inputs: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Save project inputs (from UI) to Project Manager
 * This is called when user clicks "Save Project" in UI
 * @param {object} params - { project_id, inputs }
 * @return {object} Save result
 */
function CONFIG_saveProjectInputs(params) {
  params = params || {};
  
  try {
    var projectId = params.project_id || 'active';
    var inputs = params.inputs || {};
    
    // Save to Project Manager
    var result = PM_saveProject({
      project_id: projectId,
      name: params.name || inputs.projectName || 'Untitled Project',
      domain: inputs.domain || inputs.brandName || '',
      language: inputs.language || 'en',
      inputs: inputs
    });
    
    return result;
    
  } catch (e) {
    Logger.log('Error saving project inputs: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Save stage output to Prompt Outputs sheet
 * @param {string} stage - Stage name (strategy, keywords, clustering, calendar, generate)
 * @param {object} output - Stage output data
 * @param {string} projectId - Optional project ID
 * @return {object} Save result
 */
function CONFIG_savePromptOutput(stage, output, projectId) {
  try {
    var ss = CONFIG_getGlobalSheet();
    if (!ss) {
      return { ok: false, error: 'Cannot access global sheet' };
    }
    
    var sheet = ss.getSheetByName(SHEET_TABS.PROMPT_OUTPUTS);
    if (!sheet) {
      return { ok: false, error: 'Prompt Outputs tab not found' };
    }
    
    // Column mapping: A=Strategy, B=Keywords, C=Clustering, D=Calendar, E=Generate
    var columnMap = {
      strategy: 1,    // Column A
      keywords: 2,    // Column B
      clustering: 3,  // Column C
      calendar: 4,    // Column D
      generate: 5     // Column E
    };
    
    var column = columnMap[stage.toLowerCase()];
    if (!column) {
      return { ok: false, error: 'Invalid stage: ' + stage };
    }
    
    // Find or create row for this project
    var projectRow = 2; // Start at row 2 (row 1 is header)
    if (projectId) {
      // Search for existing project row
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === projectId) {
          projectRow = i + 1;
          break;
        }
      }
    }
    
    // Write output as JSON string
    var outputJson = JSON.stringify(output);
    sheet.getRange(projectRow, column).setValue(outputJson);
    
    // Also save to Project Manager for persistence
    if (projectId) {
      var project = PM_loadProject({ project_id: projectId });
      if (!project.strategy) project.strategy = {};
      project.strategy[stage] = output;
      PM_saveProject({
        project_id: projectId,
        strategy: project.strategy
      });
    }
    
    return { ok: true, stage: stage, projectId: projectId, row: projectRow };
    
  } catch (e) {
    Logger.log('Error saving prompt output: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Get stage output from Prompt Outputs sheet
 * @param {string} stage - Stage name
 * @param {string} projectId - Optional project ID
 * @return {object} Stage output
 */
function CONFIG_getStageOutput(stage, projectId) {
  try {
    // Try loading from Project Manager first
    if (projectId) {
      var project = PM_loadProject({ project_id: projectId });
      if (project && project.strategy && project.strategy[stage]) {
        return { ok: true, data: project.strategy[stage], source: 'project_manager' };
      }
    }
    
    // Fallback to global sheet
    var ss = CONFIG_getGlobalSheet();
    if (!ss) {
      return { ok: false, error: 'Cannot access global sheet' };
    }
    
    var sheet = ss.getSheetByName(SHEET_TABS.PROMPT_OUTPUTS);
    if (!sheet) {
      return { ok: false, error: 'Prompt Outputs tab not found' };
    }
    
    var columnMap = {
      strategy: 1,
      keywords: 2,
      clustering: 3,
      calendar: 4,
      generate: 5
    };
    
    var column = columnMap[stage.toLowerCase()];
    if (!column) {
      return { ok: false, error: 'Invalid stage: ' + stage };
    }
    
    var projectRow = 2; // Default row
    var value = sheet.getRange(projectRow, column).getValue();
    
    if (!value) {
      return { ok: false, error: 'No output found for stage: ' + stage };
    }
    
    var parsed = JSONX.parse(value, null);
    return { ok: true, data: parsed, source: 'global_sheet' };
    
  } catch (e) {
    Logger.log('Error getting stage output: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Get default input values (fallback)
 * @return {object} Default inputs
 */
function CONFIG_getDefaultInputs() {
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
function CONFIG_getInputValue(inputs, key, defaultValue) {
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
 * Save competitors to Competitors sheet
 * @param {array} competitors - Array of competitor data
 * @param {string} projectId - Optional project ID
 * @return {object} Save result
 */
function CONFIG_saveCompetitorData(competitors, projectId) {
  try {
    var ss = CONFIG_getGlobalSheet();
    if (!ss) {
      return { ok: false, error: 'Cannot access global sheet' };
    }
    
    var sheet = ss.getSheetByName(SHEET_TABS.COMPETITORS);
    if (!sheet) {
      return { ok: false, error: 'Competitors tab not found' };
    }
    
    // Clear existing data for this project
    if (projectId) {
      var data = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][0] === projectId) {
          sheet.deleteRow(i + 1);
        }
      }
    }
    
    // Ensure header exists
    var header = ['Project ID', 'Domain', 'URL', 'Data', 'Updated At'];
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    
    // Append new competitor data
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      sheet.appendRow([
        projectId || '',
        comp.domain || '',
        comp.url || '',
        JSON.stringify(comp),
        new Date()
      ]);
    }
    
    return { ok: true, count: competitors.length };
    
  } catch (e) {
    Logger.log('Error saving competitor data: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Get competitors from Competitors sheet
 * @param {string} projectId - Optional project ID
 * @return {object} Competitor data
 */
function CONFIG_getCompetitorData(projectId) {
  try {
    var ss = CONFIG_getGlobalSheet();
    if (!ss) {
      return { ok: false, error: 'Cannot access global sheet' };
    }
    
    var sheet = ss.getSheetByName(SHEET_TABS.COMPETITORS);
    if (!sheet) {
      return { ok: false, error: 'Competitors tab not found' };
    }
    
    var data = sheet.getDataRange().getValues();
    var competitors = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!projectId || data[i][0] === projectId) {
        try {
          var compData = JSONX.parse(data[i][3], null);
          if (compData) {
            competitors.push(compData);
          }
        } catch (e) {
          Logger.log('Error parsing competitor data row ' + i + ': ' + e);
        }
      }
    }
    
    return { ok: true, data: competitors };
    
  } catch (e) {
    Logger.log('Error getting competitor data: ' + e);
    return { ok: false, error: String(e) };
  }
}

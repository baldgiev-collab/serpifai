/**
 * DB_Project.gs - Project Management
 * SerpifAI V8 - Project CRUD operations with dual storage
 * 
 * Based on V7's DB_ProjectManager_Elite.gs
 */

/**
 * Project storage configuration
 */
var PM_CONFIG = {
  SHEET_NAME: 'Projects',
  USE_GATEWAY: true,  // Also save to MySQL via gateway
  MAX_PROJECTS: 100
};

/**
 * Create a new project
 * @param {object} payload - Project data
 * @return {object} Created project
 */
function DB_PM_createProject(payload) {
  try {
    const projectId = 'PRJ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    
    const project = {
      projectId: projectId,
      name: payload.name || 'Untitled Project',
      domain: payload.domain || '',
      niche: payload.niche || '',
      brandName: payload.brandName || payload.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      // Project context
      competitors: payload.competitors || [],
      keywords: payload.keywords || [],
      // Settings
      settings: payload.settings || {},
      // Workflow state
      workflowState: {
        currentStage: 0,
        completedStages: [],
        stageData: {}
      }
    };
    
    // Save to Sheets
    const sheetResult = PM_saveToSheet(project);
    
    // Save to Gateway/MySQL if enabled
    if (PM_CONFIG.USE_GATEWAY) {
      const gwResult = GW_saveProject(project);
      if (!gwResult.ok) {
        LOG_warn('Gateway save failed', { error: gwResult.error });
      }
    }
    
    return {
      ok: true,
      project: project,
      message: 'Project created successfully'
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_PM_createProject');
  }
}

/**
 * Load a project by ID
 * @param {object} payload - Contains projectId
 * @return {object} Project data
 */
function DB_PM_loadProject(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Try to load from Sheets first
    let project = PM_loadFromSheet(projectId);
    
    // If not found and gateway enabled, try gateway
    if (!project && PM_CONFIG.USE_GATEWAY) {
      const gwResult = GW_loadProject(projectId);
      if (gwResult.ok && gwResult.project) {
        project = gwResult.project;
        // Sync back to Sheets
        PM_saveToSheet(project);
      }
    }
    
    if (!project) {
      return { ok: false, error: 'Project not found: ' + projectId };
    }
    
    return { ok: true, project: project };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_PM_loadProject');
  }
}

/**
 * Save/update a project
 * @param {object} payload - Project data with projectId
 * @return {object} Save result
 */
function DB_PM_saveProject(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load existing project
    let existing = PM_loadFromSheet(projectId);
    
    // Merge with existing data
    const project = Object.assign({}, existing || {}, payload, {
      updatedAt: new Date().toISOString()
    });
    
    // Save to Sheets
    const sheetResult = PM_saveToSheet(project);
    
    // Save to Gateway/MySQL if enabled
    if (PM_CONFIG.USE_GATEWAY) {
      GW_saveProject(project);
    }
    
    return {
      ok: true,
      project: project,
      message: 'Project saved successfully'
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_PM_saveProject');
  }
}

/**
 * Delete a project
 * @param {object} payload - Contains projectId
 * @return {object} Delete result
 */
function DB_PM_deleteProject(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Delete from Sheets
    PM_deleteFromSheet(projectId);
    
    // Delete from Gateway/MySQL if enabled
    if (PM_CONFIG.USE_GATEWAY) {
      GW_callGateway('project:delete', { projectId: projectId });
    }
    
    return { ok: true, message: 'Project deleted' };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_PM_deleteProject');
  }
}

/**
 * List all projects
 * @param {object} payload - Filter options
 * @return {object} Projects list
 */
function DB_PM_listProjects(payload) {
  try {
    payload = payload || {};
    
    // Load from Sheets
    const projects = PM_listFromSheet();
    
    // Apply filters if provided
    let filtered = projects;
    
    if (payload.status) {
      filtered = filtered.filter(p => p.status === payload.status);
    }
    
    if (payload.domain) {
      filtered = filtered.filter(p => p.domain && p.domain.includes(payload.domain));
    }
    
    return {
      ok: true,
      projects: filtered,
      count: filtered.length
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_PM_listProjects');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SHEET STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Save project to Google Sheets
 * @param {object} project - Project data
 * @return {boolean} Success
 */
function PM_saveToSheet(project) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PM_CONFIG.SHEET_NAME);
  
  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(PM_CONFIG.SHEET_NAME);
    sheet.appendRow(['projectId', 'name', 'domain', 'data', 'createdAt', 'updatedAt', 'status']);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const projectIdCol = headers.indexOf('projectId');
  const dataCol = headers.indexOf('data');
  
  // Find existing row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][projectIdCol] === project.projectId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
    project.projectId,
    project.name,
    project.domain,
    JSON.stringify(project),
    project.createdAt,
    project.updatedAt,
    project.status
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return true;
}

/**
 * Load project from Google Sheets
 * @param {string} projectId - Project ID
 * @return {object|null} Project data
 */
function PM_loadFromSheet(projectId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PM_CONFIG.SHEET_NAME);
  
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const projectIdCol = headers.indexOf('projectId');
  const dataCol = headers.indexOf('data');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][projectIdCol] === projectId) {
      try {
        return JSON.parse(data[i][dataCol]);
      } catch (e) {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * List all projects from Google Sheets
 * @return {Array} Projects
 */
function PM_listFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PM_CONFIG.SHEET_NAME);
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dataCol = headers.indexOf('data');
  
  const projects = [];
  for (let i = 1; i < data.length; i++) {
    try {
      const project = JSON.parse(data[i][dataCol]);
      projects.push(project);
    } catch (e) {
      // Skip invalid rows
    }
  }
  
  return projects;
}

/**
 * Delete project from Google Sheets
 * @param {string} projectId - Project ID
 */
function PM_deleteFromSheet(projectId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PM_CONFIG.SHEET_NAME);
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const projectIdCol = headers.indexOf('projectId');
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][projectIdCol] === projectId) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

/**
 * UI_ProjectManager.gs
 * Project management functions for SerpifAI v6
 * Migrated from ui/Code.gs project functions
 * 
 * CRITICAL CHANGE:
 * - Replaced PropertiesService with MySQL database via PHP gateway
 * - All project operations now go through PHP gateway
 * - Projects stored server-side with timestamps and metadata
 */

// ============================================================================
// PROJECT CRUD OPERATIONS
// ============================================================================

/**
 * List all projects for current user (DUAL SOURCE)
 * UPDATED: Uses listProjectsDual() to get from both Google Sheets and MySQL
 * 
 * @returns {object} {projects: [{name, source, lastModified}], lastProject: string, count: number}
 */
function listProjects() {
  const startTime = new Date();
  
  try {
    Logger.log('📋 Listing projects from BOTH sources (Sheets + MySQL)...');
    
    // Call UNIFIED dual listing
    const result = listProjectsDual(); // From UI_ProjectManager_Dual.gs
    
    // Log the result for debugging
    Logger.log('📊 listProjectsDual returned: ' + JSON.stringify(result));
    
    if (!result) {
      Logger.log('❌ listProjectsDual returned null!');
      const emptyResponse = {
        projects: [],
        lastProject: '',
        count: 0,
        error: 'listProjectsDual returned null'
      };
      Logger.log('📤 Returning empty response: ' + JSON.stringify(emptyResponse));
      return emptyResponse;
    }
    
    if (!result.success) {
      Logger.log('⚠️  listProjectsDual failed: ' + result.error);
      // Still return the projects array even on partial failure
      const failedResponse = {
        projects: result.projects || [],
        lastProject: '',
        count: (result.projects || []).length,
        error: result.error
      };
      Logger.log('📤 Returning failed response: ' + JSON.stringify(failedResponse));
      return failedResponse;
    }
    
    // Get last selected project from user properties
    const userProps = PropertiesService.getUserProperties();
    const lastProject = userProps.getProperty('serpifai_lastProject') || '';
    
    Logger.log('✅ Found ' + result.count + ' projects total');
    if (result.projects && result.projects.length > 0) {
      Logger.log('   Projects: ' + result.projects.map(function(p) { return p.name; }).join(', '));
    }
    
    const finalResponse = {
      projects: result.projects || [],
      lastProject: lastProject,
      count: result.count || 0
    };
    
    // CRITICAL: Ensure all data is serializable (convert Date objects to strings)
    const serializedResponse = JSON.parse(JSON.stringify(finalResponse));
    
    const elapsed = new Date() - startTime;
    Logger.log('⏱️  listProjects completed in ' + elapsed + 'ms');
    Logger.log('📤 Returning successful response with ' + finalResponse.count + ' projects');
    Logger.log('📤 Serialized response: ' + JSON.stringify(serializedResponse));
    
    return serializedResponse;
    
  } catch (e) {
    Logger.log('❌ EXCEPTION in listProjects: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    
    // Return empty list on error (NEVER return null)
    const errorResponse = {
      projects: [],
      lastProject: '',
      count: 0,
      error: e.toString()
    };
    Logger.log('📤 Returning error response: ' + JSON.stringify(errorResponse));
    return errorResponse;
  }
}

/**
 * Create a new project with default data
 * Wrapper around saveProject() for convenience
 * 
 * @param {string} name - Project name
 * @returns {object} {ok: boolean, name: string, updatedAt: string}
 */
function createProject(name) {
  const defaultData = {
    brandName: name,
    coreTopic: '',
    targetAudience: '',
    createdAt: new Date().toISOString()
  };
  
  return saveProject(name, defaultData);
}

/**
 * Save/update a project (UNIFIED DUAL STORAGE)
 * UPDATED: Uses unified saveProjectDual() to save to BOTH Google Sheets and MySQL
 * 
 * @param {string} name - Project name
 * @param {object} data - Project data
 * @returns {object} {ok: boolean, name: string, updatedAt: string, synced: boolean}
 */
function saveProject(name, data) {
  try {
    if (!name) {
      name = 'Untitled Project';
    }
    
    Logger.log('💾 Saving project (DUAL: Sheets + MySQL): ' + name);
    Logger.log('   Data fields: ' + Object.keys(data || {}).length);
    
    // Use UNIFIED DUAL STORAGE (Google Sheets + MySQL)
    const result = saveProjectDual(name, data); // From UI_ProjectManager_Dual.gs
    
    if (!result.ok) {
      Logger.log('❌ Save failed: ' + result.error);
      throw new Error(result.error || 'Failed to save project');
    }
    
    // Update last selected project in user properties
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty('serpifai_lastProject', name);
    
    Logger.log('✅ Project saved successfully');
    Logger.log('   Sheet: ' + (result.sheet || 'error'));
    Logger.log('   MySQL: ' + (result.projectId || 'error'));
    Logger.log('   Synced: ' + result.synced);
    Logger.log('   Data size: ' + result.dataSize + ' bytes');
    
    return {
      ok: true,
      name: name,
      updatedAt: result.updatedAt,
      sheet: result.sheet,
      projectId: result.projectId,
      synced: result.synced
    };
    
  } catch (e) {
    Logger.log('❌ Error saving project: ' + e.toString());
    
    return {
      ok: false,
      error: e.toString()
    };
  }
}

/**
 * Load a project by name
 * UPDATED: Loads from database via PHP gateway
 * 
 * @param {string} name - Project name
 * @returns {object} {name: string, data: object, updatedAt: string}
 */
function loadProject(name) {
  try {
    Logger.log('📂 Loading project: ' + name);
    
    // Call gateway
    const result = loadProjectFromDatabase(name); // From UI_Gateway.gs
    
    if (!result.success) {
      Logger.log('⚠️ Project not found or error: ' + result.error);
      
      // Return empty project structure
      return {
        name: name,
        data: {},
        updatedAt: null,
        error: result.error
      };
    }
    
    Logger.log('✅ Project loaded successfully');
    Logger.log('   Data fields: ' + Object.keys(result.data || {}).length);
    
    return {
      name: name,
      data: result.data || {},
      updatedAt: result.metadata.updated_at,
      createdAt: result.metadata.created_at
    };
    
  } catch (e) {
    Logger.log('❌ Error loading project: ' + e.toString());
    
    return {
      name: name,
      data: {},
      updatedAt: null,
      error: e.toString()
    };
  }
}

/**
 * Delete a project
 * UPDATED: Deletes from database via PHP gateway
 * 
 * @param {string} name - Project name
 * @returns {object} {ok: boolean, remaining: string[]}
 */
function deleteProject(name) {
  try {
    Logger.log('🗑️ Deleting project: ' + name);
    
    // Call gateway
    const result = deleteProjectFromDatabase(name); // From UI_Gateway.gs
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete project');
    }
    
    // Clear last selected if it was this project
    const userProps = PropertiesService.getUserProperties();
    const lastProject = userProps.getProperty('serpifai_lastProject');
    
    if (lastProject === name) {
      userProps.deleteProperty('serpifai_lastProject');
    }
    
    Logger.log('✅ Project deleted successfully');
    
    // Get remaining projects
    const projectsList = listProjects();
    const remaining = projectsList.projects.map(function(p) { return p.name; });
    
    return {
      ok: true,
      remaining: remaining
    };
    
  } catch (e) {
    Logger.log('❌ Error deleting project: ' + e.toString());
    
    return {
      ok: false,
      error: e.toString()
    };
  }
}

/**
 * Rename a project
 * UPDATED: Renames in database via PHP gateway
 * 
 * @param {string} oldName - Current project name
 * @param {string} newName - New project name
 * @returns {object} {ok: boolean, newName: string}
 */
function renameProject(oldName, newName) {
  try {
    if (!oldName || !newName) {
      throw new Error('Both oldName and newName are required');
    }
    
    if (oldName === newName) {
      return { ok: true, newName: newName };
    }
    
    Logger.log('✏️ Renaming project: ' + oldName + ' → ' + newName);
    
    // Call gateway
    const result = renameProjectInDatabase(oldName, newName); // From UI_Gateway.gs
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to rename project');
    }
    
    // Update last selected project if it was renamed
    const userProps = PropertiesService.getUserProperties();
    const lastProject = userProps.getProperty('serpifai_lastProject');
    
    if (lastProject === oldName) {
      userProps.setProperty('serpifai_lastProject', newName);
    }
    
    Logger.log('✅ Project renamed successfully');
    
    return {
      ok: true,
      newName: newName
    };
    
  } catch (e) {
    Logger.log('❌ Error renaming project: ' + e.toString());
    
    return {
      ok: false,
      error: e.toString()
    };
  }
}

// ============================================================================
// PROJECT UTILITIES
// ============================================================================

/**
 * Get last selected project name
 */
function getLastSelectedProject() {
  const userProps = PropertiesService.getUserProperties();
  return userProps.getProperty('serpifai_lastProject') || '';
}

/**
 * Set last selected project name
 */
function setLastSelectedProject(projectName) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('serpifai_lastProject', projectName);
  return true;
}

/**
 * Duplicate a project
 * NEW: Create copy of existing project
 * 
 * @param {string} sourceName - Project to copy
 * @param {string} targetName - Name for new copy
 * @returns {object} {ok: boolean, newName: string}
 */
function duplicateProject(sourceName, targetName) {
  try {
    Logger.log('📋 Duplicating project: ' + sourceName + ' → ' + targetName);
    
    // Load source project
    const sourceProject = loadProject(sourceName);
    
    if (!sourceProject.data || Object.keys(sourceProject.data).length === 0) {
      throw new Error('Source project not found or is empty');
    }
    
    // Save as new project
    const saveResult = saveProject(targetName, sourceProject.data);
    
    if (!saveResult.ok) {
      throw new Error(saveResult.error || 'Failed to save duplicate');
    }
    
    Logger.log('✅ Project duplicated successfully');
    
    return {
      ok: true,
      newName: targetName
    };
    
  } catch (e) {
    Logger.log('❌ Error duplicating project: ' + e.toString());
    
    return {
      ok: false,
      error: e.toString()
    };
  }
}

/**
 * Export project as JSON
 * NEW: Get project data for export/backup
 * 
 * @param {string} projectName - Project to export
 * @returns {object} Project data with metadata
 */
function exportProject(projectName) {
  try {
    Logger.log('📤 Exporting project: ' + projectName);
    
    const project = loadProject(projectName);
    
    if (!project.data) {
      throw new Error('Project not found');
    }
    
    return {
      success: true,
      export: {
        name: projectName,
        data: project.data,
        exportedAt: new Date().toISOString(),
        version: 'v6'
      }
    };
    
  } catch (e) {
    Logger.log('❌ Error exporting project: ' + e.toString());
    
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Import project from JSON
 * NEW: Import previously exported project
 * 
 * @param {string} projectName - Name for imported project
 * @param {object} projectData - Project data to import
 * @returns {object} {ok: boolean}
 */
function importProject(projectName, projectData) {
  try {
    Logger.log('📥 Importing project: ' + projectName);
    
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid project data');
    }
    
    const result = saveProject(projectName, projectData);
    
    if (!result.ok) {
      throw new Error(result.error || 'Failed to save imported project');
    }
    
    Logger.log('✅ Project imported successfully');
    
    return {
      ok: true,
      name: projectName
    };
    
  } catch (e) {
    Logger.log('❌ Error importing project: ' + e.toString());
    
    return {
      ok: false,
      error: e.toString()
    };
  }
}

// ============================================================================
// MIGRATION HELPER (For users upgrading from old system)
// ============================================================================

/**
 * Migrate projects from old PropertiesService to new database
 * Run this once to migrate existing projects
 */
function MIGRATE_ProjectsToDatabase() {
  try {
    Logger.log('🔄 Starting project migration...');
    
    // Get old projects from PropertiesService
    const userProps = PropertiesService.getUserProperties();
    const oldProjectsJson = userProps.getProperty('serpifai_projects');
    
    if (!oldProjectsJson) {
      Logger.log('ℹ️ No old projects found');
      return {
        success: true,
        migrated: 0,
        message: 'No projects to migrate'
      };
    }
    
    const oldProjects = JSON.parse(oldProjectsJson);
    const projectNames = Object.keys(oldProjects);
    
    Logger.log('📦 Found ' + projectNames.length + ' old projects to migrate');
    
    let migrated = 0;
    let failed = 0;
    const errors = [];
    
    // Migrate each project
    projectNames.forEach(function(name) {
      try {
        const projectData = oldProjects[name].data || {};
        const result = saveProject(name, projectData);
        
        if (result.ok) {
          migrated++;
          Logger.log('  ✅ Migrated: ' + name);
        } else {
          failed++;
          errors.push(name + ': ' + result.error);
          Logger.log('  ❌ Failed: ' + name);
        }
      } catch (e) {
        failed++;
        errors.push(name + ': ' + e.toString());
        Logger.log('  ❌ Error: ' + name + ' - ' + e.toString());
      }
    });
    
    Logger.log('\n✅ Migration complete');
    Logger.log('   Migrated: ' + migrated);
    Logger.log('   Failed: ' + failed);
    
    // Optionally backup old data
    if (migrated > 0) {
      userProps.setProperty('serpifai_projects_backup', oldProjectsJson);
      Logger.log('   💾 Old projects backed up to serpifai_projects_backup');
    }
    
    return {
      success: true,
      migrated: migrated,
      failed: failed,
      errors: errors
    };
    
  } catch (e) {
    Logger.log('❌ Migration error: ' + e.toString());
    
    return {
      success: false,
      error: e.toString()
    };
  }
}

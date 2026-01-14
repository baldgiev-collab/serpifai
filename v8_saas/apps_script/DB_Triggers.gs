/**
 * DB_Triggers.gs - Installable Triggers Manager
 * SerpifAI V8 - Trigger management for scheduled tasks
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// TRIGGER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Set up all installable triggers
 */
function setupTriggers() {
  // Remove existing triggers first
  removeTriggers();
  
  // Create time-based triggers
  createDailyTrigger();
  createHourlyTrigger();
  
  return { ok: true, message: 'Triggers set up successfully' };
}

/**
 * Remove all triggers for this project
 */
function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  
  return { ok: true, message: 'All triggers removed' };
}

/**
 * Create daily trigger (runs at midnight)
 */
function createDailyTrigger() {
  ScriptApp.newTrigger('dailyMaintenance')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();
}

/**
 * Create hourly trigger
 */
function createHourlyTrigger() {
  ScriptApp.newTrigger('hourlySync')
    .timeBased()
    .everyHours(1)
    .create();
}

/**
 * Create edit trigger
 */
function createEditTrigger() {
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TRIGGERED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Daily maintenance tasks
 */
function dailyMaintenance() {
  try {
    // Clear expired cache
    clearExpiredCache();
    
    // Clean up old sessions
    cleanupOldSessions();
    
    // Sync pending data
    syncPendingData();
    
    // Log success
    console.log('Daily maintenance completed at ' + new Date().toISOString());
  } catch (err) {
    console.error('Daily maintenance error: ' + err.message);
  }
}

/**
 * Hourly sync tasks
 */
function hourlySync() {
  try {
    // Process background queue
    processBackgroundQueue();
    
    // Refresh active project data
    refreshActiveProjects();
    
    console.log('Hourly sync completed at ' + new Date().toISOString());
  } catch (err) {
    console.error('Hourly sync error: ' + err.message);
  }
}

/**
 * Handle sheet edits (if edit trigger enabled)
 */
function onSheetEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const sheetName = sheet.getName();
    
    // Handle keyword sheet edits
    if (sheetName === 'Keywords') {
      handleKeywordEdit(e);
    }
    
    // Handle project sheet edits
    if (sheetName === 'Projects') {
      handleProjectEdit(e);
    }
  } catch (err) {
    console.error('onSheetEdit error: ' + err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// MAINTENANCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const cache = CacheService.getScriptCache();
  // Cache service auto-expires, but we can clean up script properties
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  const now = Date.now();
  
  let cleared = 0;
  
  Object.keys(allProps).forEach(function(key) {
    if (key.startsWith('CACHE_EXP_')) {
      const expTime = parseInt(allProps[key], 10);
      if (expTime && expTime < now) {
        const dataKey = key.replace('CACHE_EXP_', 'CACHE_');
        props.deleteProperty(key);
        props.deleteProperty(dataKey);
        cleared++;
      }
    }
  });
  
  console.log('Cleared ' + cleared + ' expired cache entries');
}

/**
 * Clean up old sessions
 */
function cleanupOldSessions() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  
  let cleaned = 0;
  
  Object.keys(allProps).forEach(function(key) {
    if (key.startsWith('SESSION_')) {
      try {
        const session = JSON.parse(allProps[key]);
        if (session.lastAccess && session.lastAccess < cutoff) {
          props.deleteProperty(key);
          cleaned++;
        }
      } catch (e) {
        // Invalid JSON, delete it
        props.deleteProperty(key);
        cleaned++;
      }
    }
  });
  
  console.log('Cleaned ' + cleaned + ' old sessions');
}

/**
 * Sync pending data to MySQL
 */
function syncPendingData() {
  const props = PropertiesService.getScriptProperties();
  const pendingQueue = props.getProperty('PENDING_SYNC_QUEUE');
  
  if (!pendingQueue) return;
  
  try {
    const queue = JSON.parse(pendingQueue);
    
    if (queue.length === 0) return;
    
    let synced = 0;
    let failed = 0;
    
    queue.forEach(function(item) {
      try {
        if (typeof GW_callGateway === 'function') {
          GW_callGateway('sync', item);
          synced++;
        }
      } catch (e) {
        failed++;
      }
    });
    
    // Clear successful items
    props.setProperty('PENDING_SYNC_QUEUE', JSON.stringify([]));
    
    console.log('Synced ' + synced + ' items, failed ' + failed);
  } catch (e) {
    console.error('syncPendingData error: ' + e.message);
  }
}

/**
 * Process background queue
 */
function processBackgroundQueue() {
  const props = PropertiesService.getScriptProperties();
  const bgQueue = props.getProperty('BACKGROUND_QUEUE');
  
  if (!bgQueue) return;
  
  try {
    const queue = JSON.parse(bgQueue);
    
    if (queue.length === 0) return;
    
    // Process up to 5 items per run
    const toProcess = queue.slice(0, 5);
    const remaining = queue.slice(5);
    
    toProcess.forEach(function(task) {
      try {
        processBackgroundTask(task);
      } catch (e) {
        console.error('Background task error: ' + e.message);
      }
    });
    
    props.setProperty('BACKGROUND_QUEUE', JSON.stringify(remaining));
    
    console.log('Processed ' + toProcess.length + ' background tasks, ' + remaining.length + ' remaining');
  } catch (e) {
    console.error('processBackgroundQueue error: ' + e.message);
  }
}

/**
 * Process a single background task
 */
function processBackgroundTask(task) {
  switch (task.type) {
    case 'KEYWORD_RESEARCH':
      if (typeof FT_SERPER_search === 'function') {
        FT_SERPER_search(task.keyword);
      }
      break;
      
    case 'COMPETITOR_ANALYSIS':
      if (typeof DB_COMP_analyzeCompetitor === 'function') {
        DB_COMP_analyzeCompetitor(task.url);
      }
      break;
      
    case 'FORENSIC_ANALYSIS':
      if (typeof FT_FORENSIC_analyze === 'function') {
        FT_FORENSIC_analyze({ url: task.url });
      }
      break;
      
    default:
      console.warn('Unknown background task type: ' + task.type);
  }
}

/**
 * Refresh active project data
 */
function refreshActiveProjects() {
  const props = PropertiesService.getScriptProperties();
  const activeProjects = props.getProperty('ACTIVE_PROJECTS');
  
  if (!activeProjects) return;
  
  try {
    const projects = JSON.parse(activeProjects);
    
    projects.forEach(function(projectId) {
      try {
        if (typeof DB_PM_loadProject === 'function') {
          DB_PM_loadProject(projectId);
        }
      } catch (e) {
        console.error('Project refresh error: ' + e.message);
      }
    });
    
    console.log('Refreshed ' + projects.length + ' active projects');
  } catch (e) {
    console.error('refreshActiveProjects error: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EDIT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════════

function handleKeywordEdit(e) {
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Skip header row
  if (row <= 1) return;
  
  // Mark row as modified
  const sheet = e.range.getSheet();
  const lastCol = sheet.getLastColumn();
  
  // Set "modified" timestamp in last column
  sheet.getRange(row, lastCol).setValue(new Date());
}

function handleProjectEdit(e) {
  const row = e.range.getRow();
  
  // Skip header row
  if (row <= 1) return;
  
  // Auto-save project changes
  const sheet = e.range.getSheet();
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Get project ID from first column
  const projectId = rowData[0];
  
  if (projectId) {
    // Queue for sync
    addToSyncQueue({ type: 'PROJECT', id: projectId, data: rowData });
  }
}

function addToSyncQueue(item) {
  const props = PropertiesService.getScriptProperties();
  let queue = [];
  
  try {
    const existing = props.getProperty('PENDING_SYNC_QUEUE');
    if (existing) queue = JSON.parse(existing);
  } catch (e) {
    queue = [];
  }
  
  queue.push(item);
  props.setProperty('PENDING_SYNC_QUEUE', JSON.stringify(queue));
}

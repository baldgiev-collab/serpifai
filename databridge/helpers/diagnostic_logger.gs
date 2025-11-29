/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNOSTIC LOGGER & DEBUGGER
 * ═══════════════════════════════════════════════════════════════════════════
 * Comprehensive system for tracking data flow through:
 * - Fetcher APIs
 * - External APIs (OpenPageRank, PageSpeed, Serper)
 * - Gemini AI processing
 * - Google Sheets storage
 * - UI rendering
 * 
 * Logs to dedicated "DIAGNOSTICS" sheet with detailed timestamps and status
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DIAGNOSTIC_CONFIG = {
  SHEET_ID: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
  SHEET_NAME: 'DIAGNOSTICS',
  MAX_ROWS: 10000, // Keep last 10K diagnostic entries
  LOG_LEVELS: {
    INFO: '📊',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
    DEBUG: '🔍'
  }
};

/**
 * Initialize diagnostics sheet if it doesn't exist
 */
function DIAG_initSheet() {
  try {
    const ss = SpreadsheetApp.openById(DIAGNOSTIC_CONFIG.SHEET_ID);
    let diagSheet = ss.getSheetByName(DIAGNOSTIC_CONFIG.SHEET_NAME);
    
    if (!diagSheet) {
      diagSheet = ss.insertSheet(DIAGNOSTIC_CONFIG.SHEET_NAME);
      
      // Setup headers
      const headers = [
        'Timestamp',
        'Level',
        'Module',
        'Stage',
        'Action',
        'Status',
        'Details',
        'Duration (ms)',
        'Data Preview',
        'Error'
      ];
      
      diagSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      diagSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      diagSheet.setFrozenRows(1);
      
      // Set column widths
      diagSheet.setColumnWidth(1, 180); // Timestamp
      diagSheet.setColumnWidth(2, 50);  // Level
      diagSheet.setColumnWidth(3, 150); // Module
      diagSheet.setColumnWidth(4, 100); // Stage
      diagSheet.setColumnWidth(5, 200); // Action
      diagSheet.setColumnWidth(6, 100); // Status
      diagSheet.setColumnWidth(7, 300); // Details
      diagSheet.setColumnWidth(8, 100); // Duration
      diagSheet.setColumnWidth(9, 400); // Data Preview
      diagSheet.setColumnWidth(10, 300); // Error
      
      Logger.log('✅ Diagnostics sheet initialized');
    }
    
    return diagSheet;
  } catch (error) {
    Logger.log('❌ Failed to init diagnostics sheet: ' + error);
    return null;
  }
}

/**
 * Log diagnostic entry to sheet
 */
function DIAG_log(level, module, stage, action, status, details, duration, dataPreview, error) {
  try {
    const diagSheet = DIAG_initSheet();
    if (!diagSheet) return;
    
    const timestamp = new Date().toISOString();
    const levelIcon = DIAGNOSTIC_CONFIG.LOG_LEVELS[level] || '📊';
    
    // Truncate data preview if too long
    let previewStr = '';
    if (dataPreview) {
      if (typeof dataPreview === 'object') {
        previewStr = JSON.stringify(dataPreview).substring(0, 400);
      } else {
        previewStr = String(dataPreview).substring(0, 400);
      }
    }
    
    const row = [
      timestamp,
      levelIcon,
      module || '',
      stage || '',
      action || '',
      status || '',
      details || '',
      duration || '',
      previewStr,
      error || ''
    ];
    
    // Append to sheet
    diagSheet.appendRow(row);
    
    // Cleanup old rows if exceeding max
    const lastRow = diagSheet.getLastRow();
    if (lastRow > DIAGNOSTIC_CONFIG.MAX_ROWS + 1) {
      const rowsToDelete = lastRow - DIAGNOSTIC_CONFIG.MAX_ROWS;
      diagSheet.deleteRows(2, rowsToDelete); // Keep header
    }
    
    // Also log to Apps Script Logger
    Logger.log(`${levelIcon} [${module}] ${action}: ${status}`);
    
  } catch (error) {
    Logger.log('❌ Failed to write diagnostic log: ' + error);
  }
}

/**
 * Log fetcher API call
 */
function DIAG_logFetcher(fetcherName, url, startTime, result, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : 'SUCCESS';
  const level = error ? 'ERROR' : 'SUCCESS';
  
  const details = `Fetcher: ${fetcherName}, URL: ${url}`;
  const dataPreview = result ? {
    hasData: !!result,
    keys: result ? Object.keys(result).slice(0, 10) : [],
    dataSize: JSON.stringify(result).length
  } : null;
  
  DIAG_log(level, 'FETCHER', 'Data Collection', fetcherName, status, details, duration, dataPreview, error);
  
  return {
    fetcherName,
    url,
    duration,
    status,
    dataSize: dataPreview ? dataPreview.dataSize : 0,
    error: error || null
  };
}

/**
 * Log external API call
 */
function DIAG_logExternalAPI(apiName, endpoint, params, startTime, result, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : 'SUCCESS';
  const level = error ? 'ERROR' : 'SUCCESS';
  
  const paramsStr = params ? JSON.stringify(params).substring(0, 100) : 'N/A';
  const details = `API: ${apiName}, Endpoint: ${endpoint}, Params: ${paramsStr}`;
  const dataPreview = result ? {
    hasData: !!result,
    keys: result ? Object.keys(result).slice(0, 10) : [],
    dataSize: JSON.stringify(result).length
  } : null;
  
  DIAG_log(level, 'EXTERNAL_API', 'Data Collection', apiName, status, details, duration, dataPreview, error);
  
  return {
    apiName,
    endpoint,
    duration,
    status,
    dataSize: dataPreview ? dataPreview.dataSize : 0,
    error: error || null
  };
}

/**
 * Log Gemini AI call
 */
function DIAG_logGemini(promptName, model, inputSize, startTime, result, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : 'SUCCESS';
  const level = error ? 'ERROR' : 'SUCCESS';
  
  const details = `Prompt: ${promptName}, Model: ${model}, Input Size: ${inputSize} chars`;
  const dataPreview = result ? {
    hasInsights: !!result.insights,
    insightCount: result.insights ? result.insights.length : 0,
    outputSize: JSON.stringify(result).length
  } : null;
  
  DIAG_log(level, 'GEMINI_AI', 'AI Processing', promptName, status, details, duration, dataPreview, error);
  
  return {
    promptName,
    model,
    inputSize,
    duration,
    status,
    outputSize: dataPreview ? dataPreview.outputSize : 0,
    error: error || null
  };
}

/**
 * Log Google Sheets operation
 */
function DIAG_logSheets(operation, sheetName, range, startTime, rowsAffected, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : 'SUCCESS';
  const level = error ? 'ERROR' : 'SUCCESS';
  
  const details = `Operation: ${operation}, Sheet: ${sheetName}, Range: ${range || 'N/A'}, Rows: ${rowsAffected || 0}`;
  
  DIAG_log(level, 'GOOGLE_SHEETS', 'Data Storage', operation, status, details, duration, null, error);
  
  return {
    operation,
    sheetName,
    range,
    duration,
    status,
    rowsAffected: rowsAffected || 0,
    error: error || null
  };
}

/**
 * Log orchestration stage
 */
function DIAG_logOrchestration(stage, action, startTime, result, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : 'SUCCESS';
  const level = error ? 'ERROR' : 'SUCCESS';
  
  const details = `Stage: ${stage}, Action: ${action}`;
  const dataPreview = result ? {
    success: result.success,
    competitorCount: result.competitors ? Object.keys(result.competitors).length : 0,
    categoriesAnalyzed: result.intelligence ? Object.keys(result.intelligence).length : 0,
    totalMetrics: result.metadata ? result.metadata.totalMetrics : 0
  } : null;
  
  DIAG_log(level, 'ORCHESTRATION', stage, action, status, details, duration, dataPreview, error);
  
  return {
    stage,
    action,
    duration,
    status,
    dataPreview,
    error: error || null
  };
}

/**
 * Log UI rendering
 */
function DIAG_logUIRender(component, action, startTime, success, error) {
  const duration = Date.now() - startTime;
  const status = error ? 'FAILED' : (success ? 'SUCCESS' : 'PARTIAL');
  const level = error ? 'ERROR' : (success ? 'SUCCESS' : 'WARNING');
  
  const details = `Component: ${component}, Action: ${action}`;
  
  DIAG_log(level, 'UI_RENDER', 'Frontend', component, status, details, duration, null, error);
  
  return {
    component,
    action,
    duration,
    status,
    error: error || null
  };
}

/**
 * Generate diagnostic summary report
 */
function DIAG_generateSummary(startTime, endTime) {
  try {
    const diagSheet = DIAG_initSheet();
    if (!diagSheet) return null;
    
    const data = diagSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Filter by time range
    const filteredRows = rows.filter(row => {
      const timestamp = new Date(row[0]);
      return timestamp >= startTime && timestamp <= endTime;
    });
    
    // Calculate summary stats
    const summary = {
      totalEntries: filteredRows.length,
      byLevel: {},
      byModule: {},
      byStatus: {},
      avgDuration: {},
      errors: [],
      timeline: []
    };
    
    filteredRows.forEach(row => {
      const level = row[1];
      const module = row[2];
      const status = row[5];
      const duration = parseFloat(row[7]) || 0;
      const error = row[9];
      
      // Count by level
      summary.byLevel[level] = (summary.byLevel[level] || 0) + 1;
      
      // Count by module
      summary.byModule[module] = (summary.byModule[module] || 0) + 1;
      
      // Count by status
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
      
      // Average duration by module
      if (!summary.avgDuration[module]) {
        summary.avgDuration[module] = { total: 0, count: 0 };
      }
      summary.avgDuration[module].total += duration;
      summary.avgDuration[module].count += 1;
      
      // Collect errors
      if (error) {
        summary.errors.push({
          timestamp: row[0],
          module: module,
          action: row[4],
          error: error
        });
      }
      
      // Timeline
      summary.timeline.push({
        timestamp: row[0],
        level: level,
        module: module,
        action: row[4],
        status: status,
        duration: duration
      });
    });
    
    // Calculate averages
    Object.keys(summary.avgDuration).forEach(module => {
      const stats = summary.avgDuration[module];
      summary.avgDuration[module] = Math.round(stats.total / stats.count);
    });
    
    return summary;
    
  } catch (error) {
    Logger.log('❌ Failed to generate summary: ' + error);
    return null;
  }
}

/**
 * Clear all diagnostic logs
 */
function DIAG_clearLogs() {
  try {
    const diagSheet = DIAG_initSheet();
    if (!diagSheet) return { success: false, error: 'Sheet not found' };
    
    const lastRow = diagSheet.getLastRow();
    if (lastRow > 1) {
      diagSheet.deleteRows(2, lastRow - 1);
    }
    
    Logger.log('✅ Diagnostic logs cleared');
    return { success: true, message: 'All diagnostic logs cleared' };
    
  } catch (error) {
    Logger.log('❌ Failed to clear logs: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * TEST: Write sample diagnostic logs
 */
function TEST_diagnosticLogger() {
  Logger.log('=== Testing Diagnostic Logger ===');
  
  // Test fetcher log
  const fetcherStart = Date.now();
  Utilities.sleep(100);
  DIAG_logFetcher(
    'FET_seoSnapshot',
    'https://example.com',
    fetcherStart,
    { title: 'Example Site', metaDescription: 'Test description' },
    null
  );
  
  // Test external API log
  const apiStart = Date.now();
  Utilities.sleep(150);
  DIAG_logExternalAPI(
    'OpenPageRank',
    'https://api.openpagerank.com/v1.0/getPageRank',
    { domains: ['example.com'] },
    apiStart,
    { page_rank_decimal: 8.5 },
    null
  );
  
  // Test Gemini log
  const geminiStart = Date.now();
  Utilities.sleep(200);
  DIAG_logGemini(
    'ELITE_techInsights',
    'gemini-2.5-flash',
    1500,
    geminiStart,
    { insights: ['Insight 1', 'Insight 2', 'Insight 3'] },
    null
  );
  
  // Test Sheets log
  const sheetsStart = Date.now();
  Utilities.sleep(50);
  DIAG_logSheets(
    'WRITE',
    'COMPETITOR_DATA',
    'A1:Z100',
    sheetsStart,
    100,
    null
  );
  
  // Test orchestration log
  const orchStart = Date.now();
  Utilities.sleep(250);
  DIAG_logOrchestration(
    'PHASE_1',
    'COMP_collectAllData',
    orchStart,
    {
      success: true,
      competitors: { 'example.com': {}, 'competitor.com': {} },
      intelligence: { technicalSEO: {}, contentIntelligence: {} },
      metadata: { totalMetrics: 245 }
    },
    null
  );
  
  // Test error log
  const errorStart = Date.now();
  DIAG_logExternalAPI(
    'Serper',
    'https://google.serper.dev/search',
    { q: 'test query' },
    errorStart,
    null,
    'API rate limit exceeded'
  );
  
  Logger.log('✅ Test logs written to DIAGNOSTICS sheet');
  Logger.log('   Check: https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit#gid=' + DIAG_initSheet().getSheetId());
}

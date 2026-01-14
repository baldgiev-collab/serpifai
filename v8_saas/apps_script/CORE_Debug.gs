/**
 * CORE_Debug.gs - Debugging and Diagnostics
 * SerpifAI V8 - Debug tools and diagnostics
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// DEBUG AND DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get system diagnostics
 */
function CORE_getDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {},
    connectivity: {},
    quotas: {},
    errors: []
  };
  
  try {
    // Script properties
    const props = PropertiesService.getScriptProperties();
    diagnostics.environment.hasGatewayUrl = !!props.getProperty('GATEWAY_URL');
    diagnostics.environment.hasApiKeys = !!props.getProperty('SERPER_API_KEY') || !!props.getProperty('GEMINI_API_KEY');
    diagnostics.environment.scriptId = ScriptApp.getScriptId();
    diagnostics.environment.timezone = Session.getScriptTimeZone();
  } catch (e) {
    diagnostics.errors.push('Environment check failed: ' + e.message);
  }
  
  try {
    // Test Gateway connectivity
    const gwResult = GW_query({ action: 'ping' });
    diagnostics.connectivity.gateway = gwResult && gwResult.ok ? 'connected' : 'failed';
    diagnostics.connectivity.gatewayLatency = gwResult?.latency || 'unknown';
  } catch (e) {
    diagnostics.connectivity.gateway = 'error: ' + e.message;
  }
  
  try {
    // Check quotas
    const remainingQuota = UrlFetchApp.getRemainingDailyQuota ? UrlFetchApp.getRemainingDailyQuota() : 'N/A';
    diagnostics.quotas.urlFetch = remainingQuota;
  } catch (e) {
    diagnostics.quotas.urlFetch = 'unknown';
  }
  
  return { ok: true, diagnostics: diagnostics };
}

/**
 * Test API key
 */
function CORE_testApiKey(params) {
  const keyType = params.type;
  const apiKey = params.key;
  
  if (!keyType || !apiKey) {
    return { ok: false, error: 'Key type and key required' };
  }
  
  try {
    let testUrl, options;
    
    switch (keyType) {
      case 'serper':
        testUrl = 'https://google.serper.dev/search';
        options = {
          method: 'post',
          headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
          payload: JSON.stringify({ q: 'test', num: 1 }),
          muteHttpExceptions: true
        };
        break;
        
      case 'gemini':
        testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
        options = {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          payload: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }),
          muteHttpExceptions: true
        };
        break;
        
      case 'pagespeed':
        testUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=' + apiKey;
        options = { muteHttpExceptions: true };
        break;
        
      default:
        return { ok: false, error: 'Unknown key type: ' + keyType };
    }
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode === 200) {
      return { ok: true, valid: true, message: 'API key is valid' };
    } else if (statusCode === 401 || statusCode === 403) {
      return { ok: true, valid: false, message: 'API key is invalid or unauthorized' };
    } else {
      return { ok: true, valid: false, message: 'Unexpected response: ' + statusCode };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get recent logs
 */
function CORE_Debug_getRecentLogs(params) {
  const limit = params.limit || 50;
  const level = params.level; // 'error', 'warn', 'info'
  
  try {
    let sql = 'SELECT * FROM logs ORDER BY created_at DESC LIMIT ?';
    const sqlParams = [limit];
    
    if (level) {
      sql = 'SELECT * FROM logs WHERE level = ? ORDER BY created_at DESC LIMIT ?';
      sqlParams.unshift(level);
    }
    
    const result = GW_query({
      action: 'select',
      sql: sql,
      params: sqlParams
    });
    
    return { ok: true, logs: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Clear logs
 */
function CORE_clearLogs(params) {
  const olderThanDays = params.olderThanDays || 7;
  
  try {
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      params: [olderThanDays]
    });
    
    return { ok: true, deleted: result.affectedRows };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test database connection
 */
function CORE_testDatabase() {
  try {
    const startTime = new Date().getTime();
    
    const result = GW_query({
      action: 'select',
      sql: 'SELECT 1 as test',
      params: []
    });
    
    const endTime = new Date().getTime();
    const latency = endTime - startTime;
    
    if (result && result.rows) {
      return {
        ok: true,
        connected: true,
        latency: latency + 'ms',
        message: 'Database connection successful'
      };
    } else {
      return {
        ok: true,
        connected: false,
        message: 'Database query returned no results'
      };
    }
  } catch (err) {
    return {
      ok: false,
      connected: false,
      error: err.message
    };
  }
}

/**
 * Get table stats
 */
function CORE_getTableStats() {
  try {
    const tables = ['keywords', 'projects', 'serp_results', 'competitors', 'logs', 'keyword_history'];
    const stats = {};
    
    tables.forEach(function(table) {
      try {
        const result = GW_query({
          action: 'select',
          sql: 'SELECT COUNT(*) as count FROM ' + table,
          params: []
        });
        stats[table] = result.rows && result.rows[0] ? result.rows[0].count : 0;
      } catch (e) {
        stats[table] = 'error';
      }
    });
    
    return { ok: true, stats: stats };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Run health check
 */
function CORE_healthCheck() {
  const checks = [];
  let allPassed = true;
  
  // Check 1: Script Properties
  try {
    const props = PropertiesService.getScriptProperties();
    const gwUrl = props.getProperty('GATEWAY_URL');
    if (gwUrl) {
      checks.push({ name: 'Script Properties', status: 'pass', message: 'Gateway URL configured' });
    } else {
      checks.push({ name: 'Script Properties', status: 'fail', message: 'Gateway URL not configured' });
      allPassed = false;
    }
  } catch (e) {
    checks.push({ name: 'Script Properties', status: 'fail', message: e.message });
    allPassed = false;
  }
  
  // Check 2: Database Connection
  try {
    const dbTest = CORE_testDatabase();
    if (dbTest.connected) {
      checks.push({ name: 'Database', status: 'pass', message: 'Connected (' + dbTest.latency + ')' });
    } else {
      checks.push({ name: 'Database', status: 'fail', message: dbTest.error || 'Not connected' });
      allPassed = false;
    }
  } catch (e) {
    checks.push({ name: 'Database', status: 'fail', message: e.message });
    allPassed = false;
  }
  
  // Check 3: External API (Serper)
  try {
    const serperKey = PropertiesService.getScriptProperties().getProperty('SERPER_API_KEY');
    if (serperKey) {
      checks.push({ name: 'Serper API', status: 'pass', message: 'Key configured' });
    } else {
      checks.push({ name: 'Serper API', status: 'warn', message: 'Key not configured' });
    }
  } catch (e) {
    checks.push({ name: 'Serper API', status: 'fail', message: e.message });
  }
  
  // Check 4: Gemini API
  try {
    const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (geminiKey) {
      checks.push({ name: 'Gemini API', status: 'pass', message: 'Key configured' });
    } else {
      checks.push({ name: 'Gemini API', status: 'warn', message: 'Key not configured' });
    }
  } catch (e) {
    checks.push({ name: 'Gemini API', status: 'fail', message: e.message });
  }
  
  // Check 5: Triggers
  try {
    const triggers = ScriptApp.getProjectTriggers();
    checks.push({ name: 'Triggers', status: 'pass', message: triggers.length + ' active triggers' });
  } catch (e) {
    checks.push({ name: 'Triggers', status: 'fail', message: e.message });
  }
  
  return {
    ok: true,
    healthy: allPassed,
    checks: checks,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get execution logs from Apps Script
 */
function CORE_getExecutionLogs() {
  // Note: Apps Script doesn't have a direct API to get execution logs
  // This would typically be viewed in the Apps Script editor
  return {
    ok: true,
    message: 'View execution logs in Apps Script Editor > Executions',
    link: 'https://script.google.com/home/projects/' + ScriptApp.getScriptId() + '/executions'
  };
}

/**
 * Debug function router
 */
function CORE_debug(params) {
  const action = params.action;
  
  switch (action) {
    case 'diagnostics':
      return CORE_getDiagnostics();
    case 'healthCheck':
      return CORE_healthCheck();
    case 'testDatabase':
      return CORE_testDatabase();
    case 'tableStats':
      return CORE_getTableStats();
    case 'testApiKey':
      return CORE_testApiKey(params);
    case 'recentLogs':
      return CORE_getRecentLogs(params);
    case 'clearLogs':
      return CORE_clearLogs(params);
    default:
      return { ok: false, error: 'Unknown debug action: ' + action };
  }
}

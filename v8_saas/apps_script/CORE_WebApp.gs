/**
 * CORE_WebApp.gs - Web App Entry Points
 * SerpifAI V8 - doGet/doPost handlers for web deployment
 * 
 * CRITICAL: These functions are required for Apps Script web apps
 */

/**
 * Handle GET requests - Web app entry point
 * @param {object} e - Event object with parameters
 * @return {HtmlOutput|ContentService} HTML page or JSON response
 */
function doGet(e) {
  const startTime = Date.now();
  
  try {
    // Parse parameters
    const params = e.parameter || {};
    const action = params.action;
    
    // If no action specified, serve the full UI
    if (!action) {
      return HtmlService.createTemplateFromFile('UI_Dashboard_Full')
        .evaluate()
        .setTitle('SerpifAI Elite — Architect of Authority')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Log request
    LOG_info('doGet request', { action: action, params: Object.keys(params) });
    
    // Route to handler
    let result;
    
    switch (action) {
      case 'ping':
      case 'health':
        result = {
          ok: true,
          status: 'SerpifAI V8 Online',
          version: SERPIFAI_VERSION,
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'config':
        result = WEBAPP_getPublicConfig();
        break;
        
      default:
        // Route to main handler
        result = handleRequest(e);
    }
    
    result.executionTime = Date.now() - startTime;
    return WEBAPP_jsonResponse(result);
    
  } catch (err) {
    LOG_error('doGet error', { error: err.message, stack: err.stack });
    return WEBAPP_jsonResponse({
      ok: false,
      error: err.message,
      executionTime: Date.now() - startTime
    });
  }
}

/**
 * Handle POST requests - Primary API endpoint
 * @param {object} e - Event object with postData
 * @return {ContentService} JSON response
 */
function doPost(e) {
  const startTime = Date.now();
  
  try {
    // Parse POST body
    let payload = {};
    
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return WEBAPP_jsonResponse({
          ok: false,
          error: 'Invalid JSON in request body',
          executionTime: Date.now() - startTime
        });
      }
    }
    
    // Also merge query parameters
    if (e.parameter) {
      Object.keys(e.parameter).forEach(key => {
        if (!payload[key]) payload[key] = e.parameter[key];
      });
    }
    
    // Log request
    const action = payload.action || 'unknown';
    LOG_info('doPost request', { action: action });
    
    // Route to main handler
    const result = handleRequest({ parameter: e.parameter, payload: payload });
    
    result.executionTime = Date.now() - startTime;
    return WEBAPP_jsonResponse(result);
    
  } catch (err) {
    LOG_error('doPost error', { error: err.message, stack: err.stack });
    return WEBAPP_jsonResponse({
      ok: false,
      error: err.message,
      stack: err.stack,
      executionTime: Date.now() - startTime
    });
  }
}

/**
 * Main request handler - Routes to appropriate module
 * @param {object} e - Event object
 * @return {object} Response object
 */
function handleRequest(e) {
  const params = e.parameter || {};
  const payload = e.payload || {};
  
  // Get action from params or payload
  const action = params.action || payload.action || 'ping';
  
  try {
    // Route based on action prefix
    if (action.startsWith('db:') || action.startsWith('project:') || 
        action.startsWith('workflow:') || action.startsWith('wf:')) {
      return DB_handle(action, payload);
    }
    
    if (action.startsWith('ft:') || action.startsWith('fetch:') ||
        action.startsWith('comp:') || action.startsWith('COMP_') ||
        action.startsWith('ELITE_')) {
      return FT_handleRoute(action, payload);
    }
    
    if (action.startsWith('ui:')) {
      return UI_handle(action, payload);
    }
    
    // Default routing
    switch (action) {
      case 'ping':
        return { ok: true, status: 'ready', version: SERPIFAI_VERSION };
        
      case 'getConfig':
        return WEBAPP_getPublicConfig();
        
      case 'saveApiKeys':
        return CONFIG_saveApiKeys(payload);
        
      case 'testApiKey':
        return CONFIG_testApiKey(payload.keyType, payload.apiKey);
        
      default:
        // Try both routers
        const dbResult = DB_handle(action, payload);
        if (dbResult && dbResult.ok !== undefined) return dbResult;
        
        return FT_handleRoute(action, payload);
    }
    
  } catch (err) {
    return CORE_handleError(err, 'handleRequest', { action: action });
  }
}

/**
 * Create JSON response for web app
 * @param {object} obj - Response object
 * @return {ContentService} JSON response
 */
function WEBAPP_jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get public configuration (no secrets)
 * @return {object} Public config
 */
function WEBAPP_getPublicConfig() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    ok: true,
    version: SERPIFAI_VERSION,
    hasSerperKey: !!props.getProperty('SERPER_API_KEY'),
    hasGeminiKey: !!props.getProperty('GEMINI_API_KEY'),
    hasPageSpeedKey: !!props.getProperty('PAGESPEED_API_KEY'),
    hasPageRankKey: !!props.getProperty('PAGERANK_API_KEY'),
    hasGatewayUrl: !!props.getProperty('GATEWAY_URL'),
    hasDbCredentials: !!props.getProperty('DB_HOST'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Legacy function for backwards compatibility
 */
function jsonResponse(obj) {
  return WEBAPP_jsonResponse(obj);
}

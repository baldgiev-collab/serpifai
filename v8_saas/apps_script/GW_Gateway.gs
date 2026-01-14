/**
 * GW_Gateway.gs - PHP Gateway Connector
 * SerpifAI V8 - Communicates with external PHP gateway for MySQL/APIs
 * 
 * Based on V7's UI_Gateway.gs
 */

/**
 * Gateway configuration
 */
var GW_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

/**
 * Call the PHP Gateway API
 * @param {string} action - Gateway action
 * @param {object} payload - Request payload
 * @param {object} options - Options (timeout, retries)
 * @return {object} Gateway response
 */
function GW_callGateway(action, payload, options) {
  options = options || {};
  
  const props = PropertiesService.getScriptProperties();
  const gatewayUrl = props.getProperty('GATEWAY_URL');
  const gatewayKey = props.getProperty('GATEWAY_API_KEY');
  
  if (!gatewayUrl) {
    return { ok: false, error: 'Gateway URL not configured' };
  }
  
  const maxRetries = options.retries || GW_CONFIG.MAX_RETRIES;
  const timeout = options.timeout || GW_CONFIG.TIMEOUT;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const requestBody = {
        action: action,
        payload: payload,
        timestamp: new Date().toISOString(),
        source: 'serpifai-v8'
      };
      
      const fetchOptions = {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(requestBody),
        muteHttpExceptions: true,
        timeout: timeout,
        headers: {}
      };
      
      // Add API key if configured
      if (gatewayKey) {
        fetchOptions.headers['X-API-Key'] = gatewayKey;
        fetchOptions.headers['Authorization'] = 'Bearer ' + gatewayKey;
      }
      
      LOG_debug('Gateway call', { action: action, attempt: attempt });
      
      const response = UrlFetchApp.fetch(gatewayUrl, fetchOptions);
      const code = response.getResponseCode();
      const content = response.getContentText();
      
      if (code >= 200 && code < 300) {
        try {
          const result = JSON.parse(content);
          result._gatewayStatus = code;
          return result;
        } catch (parseErr) {
          return { ok: true, data: content, _gatewayStatus: code };
        }
      }
      
      // Retry on server errors
      if (code >= 500 && attempt < maxRetries) {
        Utilities.sleep(GW_CONFIG.RETRY_DELAY * attempt);
        continue;
      }
      
      return {
        ok: false,
        error: 'Gateway returned HTTP ' + code,
        statusCode: code,
        response: content.substring(0, 500)
      };
      
    } catch (err) {
      if (attempt < maxRetries) {
        Utilities.sleep(GW_CONFIG.RETRY_DELAY * attempt);
        continue;
      }
      return { ok: false, error: 'Gateway call failed: ' + err.message };
    }
  }
  
  return { ok: false, error: 'Gateway call failed after ' + maxRetries + ' attempts' };
}

/**
 * Test gateway connectivity
 * @return {object} Test result
 */
function GW_testConnection() {
  const result = GW_callGateway('ping', { test: true });
  
  return {
    ok: result.ok,
    status: result.ok ? 'Gateway connected' : 'Gateway unreachable',
    response: result
  };
}

/**
 * Call gateway for MySQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @return {object} Query result
 */
function GW_mysqlQuery(sql, params) {
  return GW_callGateway('mysql:query', {
    sql: sql,
    params: params || []
  });
}

/**
 * Call gateway for MySQL insert/update
 * @param {string} table - Table name
 * @param {object} data - Data to insert/update
 * @param {string} operation - 'insert', 'update', or 'upsert'
 * @return {object} Result
 */
function GW_mysqlWrite(table, data, operation) {
  return GW_callGateway('mysql:write', {
    table: table,
    data: data,
    operation: operation || 'upsert'
  });
}

/**
 * Call gateway for credit check/deduction
 * @param {string} userId - User ID
 * @param {number} credits - Credits to check/deduct
 * @param {string} operation - 'check' or 'deduct'
 * @return {object} Credit result
 */
function GW_creditOperation(userId, credits, operation) {
  return GW_callGateway('credits:' + operation, {
    userId: userId,
    credits: credits
  });
}

/**
 * Call gateway for license validation
 * @param {string} licenseKey - License key to validate
 * @return {object} Validation result
 */
function GW_validateLicense(licenseKey) {
  return GW_callGateway('license:validate', {
    licenseKey: licenseKey
  });
}

/**
 * Call gateway for external API (proxied)
 * @param {string} api - API name (serper, pagespeed, etc.)
 * @param {object} params - API parameters
 * @return {object} API response
 */
function GW_callExternalAPI(api, params) {
  return GW_callGateway('api:' + api, params);
}

/**
 * Save project to MySQL via gateway
 * @param {object} project - Project data
 * @return {object} Save result
 */
function GW_saveProject(project) {
  return GW_callGateway('project:save', project);
}

/**
 * Load project from MySQL via gateway
 * @param {string} projectId - Project ID
 * @return {object} Project data
 */
function GW_loadProject(projectId) {
  return GW_callGateway('project:load', { projectId: projectId });
}

/**
 * List projects from MySQL via gateway
 * @param {string} userId - User ID (optional)
 * @return {object} Projects list
 */
function GW_listProjects(userId) {
  return GW_callGateway('project:list', { userId: userId });
}

/**
 * Save competitor analysis to MySQL via gateway
 * @param {string} projectId - Project ID
 * @param {object} analysisData - Analysis data
 * @return {object} Save result
 */
function GW_saveCompetitorAnalysis(projectId, analysisData) {
  return GW_callGateway('competitor:save', {
    projectId: projectId,
    data: analysisData
  });
}

/**
 * Load competitor analysis from MySQL via gateway
 * @param {string} projectId - Project ID
 * @return {object} Analysis data
 */
function GW_loadCompetitorAnalysis(projectId) {
  return GW_callGateway('competitor:load', { projectId: projectId });
}

/**
 * Configure gateway URL and API key
 * @param {string} url - Gateway URL
 * @param {string} apiKey - API key
 * @return {object} Configuration result
 */
function GW_configure(url, apiKey) {
  const props = PropertiesService.getScriptProperties();
  
  props.setProperty('GATEWAY_URL', url);
  if (apiKey) {
    props.setProperty('GATEWAY_API_KEY', apiKey);
  }
  
  // Test the connection
  const testResult = GW_testConnection();
  
  return {
    ok: testResult.ok,
    message: testResult.ok ? 'Gateway configured successfully' : 'Gateway configured but connection failed',
    testResult: testResult
  };
}

/**
 * Legacy function name for backwards compatibility
 */
function callGateway(action, payload) {
  return GW_callGateway(action, payload);
}

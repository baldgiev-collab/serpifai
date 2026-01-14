/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE_Config.gs - CENTRALIZED CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Production Configuration
 * All API keys, endpoints, and settings in one place.
 * 
 * @module CORE_Config
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get all configuration settings
 * @return {Object} Complete configuration object
 */
function CORE_getConfig() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    // Version Info
    version: '8.0.0',
    buildDate: '2026-01-08',
    
    // API Keys (from Script Properties)
    apiKeys: {
      gemini: props.getProperty('GEMINI_API_KEY') || '',
      serper: props.getProperty('SERPER_API_KEY') || '',
      pageSpeed: props.getProperty('PAGE_SPEED_API_KEY') || '',
      openPageRank: props.getProperty('OPEN_PAGERANK_API_KEY') || ''
    },
    
    // Gateway Configuration
    gateway: {
      url: props.getProperty('GATEWAY_URL') || 'https://serpifai.com/serpifai_php/api_gateway.php',
      timeout: 30000
    },
    
    // License Key
    license: props.getProperty('LICENSE_KEY') || '',
    
    // Spreadsheet
    sheetId: props.getProperty('SHEET_ID') || SpreadsheetApp.getActiveSpreadsheet()?.getId() || ''
  };
}

/**
 * Get a specific config value
 * @param {string} key - Dot notation key (e.g., 'apiKeys.gemini')
 * @param {*} defaultValue - Default if not found
 * @return {*} Config value
 */
function CORE_get(key, defaultValue) {
  try {
    const config = CORE_getConfig();
    const keys = key.split('.');
    let value = config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Set a script property
 * @param {string} key - Property key
 * @param {string} value - Property value
 */
function CORE_setProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

/**
 * Get a script property
 * @param {string} key - Property key
 * @param {string} defaultValue - Default if not found
 * @return {string} Property value
 */
function CORE_getProperty(key, defaultValue) {
  return PropertiesService.getScriptProperties().getProperty(key) || defaultValue || '';
}

/**
 * Check if all required API keys are configured
 * @return {Object} Validation result
 */
function CORE_validateApiKeys() {
  const config = CORE_getConfig();
  const missing = [];
  
  if (!config.apiKeys.gemini) missing.push('GEMINI_API_KEY');
  if (!config.apiKeys.serper) missing.push('SERPER_API_KEY');
  if (!config.license) missing.push('LICENSE_KEY');
  
  return {
    valid: missing.length === 0,
    missing: missing,
    message: missing.length === 0 
      ? 'All required API keys configured' 
      : `Missing: ${missing.join(', ')}`
  };
}

/**
 * Get API endpoints
 * @return {Object} API endpoint URLs
 */
function CORE_getEndpoints() {
  return {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    serper: 'https://google.serper.dev/search',
    pageSpeed: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
    openPageRank: 'https://openpagerank.com/api/v1.0/getPageRank'
  };
}

/**
 * Get rate limit configuration
 * @return {Object} Rate limit settings
 */
function CORE_getRateLimits() {
  return {
    serper: { requestsPerSecond: 2, dailyLimit: 2500 },
    gemini: { requestsPerMinute: 60, tokensPerMinute: 60000 },
    pageSpeed: { requestsPerSecond: 1, dailyLimit: 25000 },
    openPageRank: { requestsPerSecond: 1, dailyLimit: 500 }
  };
}

/**
 * Get timeout configuration
 * @return {Object} Timeout settings in milliseconds
 */
function CORE_getTimeouts() {
  return {
    fetch: 30000,
    parse: 15000,
    total: 300000,  // 5 minutes
    gemini: 60000   // 1 minute for AI calls
  };
}

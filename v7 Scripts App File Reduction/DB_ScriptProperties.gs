/**
 * ============================================================================
 * SerpifAI v7 - Script Properties Manager
 * ============================================================================
 * 
 * This file manages script properties for the SerpifAI application.
 * 
 * Script Properties are stored in the Apps Script project and persist
 * between executions. They're used for:
 * - Database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASS)
 * - Gateway URLs (PHP_GATEWAY_URL, SERPIFAI_GATEWAY_URL)
 * - Master sheet reference (MASTER_SHEET_ID)
 * - Fetcher batch state (FT_* properties)
 * - Oracle MySQL credentials
 * - Compliance logging
 * 
 * ============================================================================
 */

/**
 * Get Script Properties service
 * @returns {PropertiesService.Properties}
 */
function getScriptProperties() {
  return PropertiesService.getScriptProperties();
}

/**
 * Get User Properties service (per-user settings)
 * @returns {PropertiesService.Properties}
 */
function getUserProperties() {
  return PropertiesService.getUserProperties();
}

/**
 * Get a single script property
 * @param {string} key - Property key
 * @param {*} defaultValue - Default value if not found
 * @returns {string|null}
 */
function getProperty(key, defaultValue) {
  const value = getScriptProperties().getProperty(key);
  return value !== null ? value : (defaultValue !== undefined ? defaultValue : null);
}

/**
 * Set a single script property
 * @param {string} key - Property key
 * @param {string} value - Property value
 */
function setProperty(key, value) {
  getScriptProperties().setProperty(key, String(value));
}

/**
 * Get multiple properties at once
 * @param {string[]} keys - Array of property keys
 * @returns {Object} Object with key-value pairs
 */
function getProperties(keys) {
  const props = getScriptProperties();
  const result = {};
  keys.forEach(key => {
    result[key] = props.getProperty(key);
  });
  return result;
}

/**
 * Set multiple properties at once
 * @param {Object} properties - Object with key-value pairs
 */
function setProperties(properties) {
  getScriptProperties().setProperties(properties);
}

/**
 * Delete a property
 * @param {string} key - Property key to delete
 */
function deleteProperty(key) {
  getScriptProperties().deleteProperty(key);
}

/**
 * Delete all properties (use with caution!)
 */
function deleteAllProperties() {
  getScriptProperties().deleteAllProperties();
}

/**
 * Get all current script properties
 * @returns {Object}
 */
function getAllProperties() {
  return getScriptProperties().getProperties();
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default script properties for SerpifAI v7
 * Run setupScriptProperties() to initialize
 */
const DEFAULT_SCRIPT_PROPERTIES = {
  // Database Configuration
  DB_HOST: '82.197.82.19',
  DB_NAME: 'u187453795_SrpAIDataGate',
  DB_USER: 'u187453795_Admin',
  DB_PASS: 'OoRB1Pz9i?H',
  
  // Oracle MySQL (mirrors DB config)
  ORACLE_MYSQL_HOST: '82.197.82.19',
  ORACLE_MYSQL_DATABASE: 'u187453795_SrpAIDataGate',
  ORACLE_MYSQL_USER: 'u187453795_Admin',
  ORACLE_MYSQL_PASSWORD: 'OoRB1Pz9i?H',
  
  // Gateway URLs
  PHP_GATEWAY_URL: 'https://serpifai.com/serpifai_php/api_gateway.php',
  SERPIFAI_GATEWAY_URL: 'http://82.197.82.19/~u187453795/serpifai_php/api_gateway.php',
  
  // Master Sheet ID
  MASTER_SHEET_ID: '1JVY3NA8qMmymNCho25PqUF1Vdp9LbRGVK1O13_cJ6lQ',
  
  // Fetcher State (will be populated during runtime)
  FT_ProcessingStatus: 'IDLE',
  FT_CurrentBatchId: '',
  FT_KeywordQueue_count: '0',
  FT_LastProcessedIndex: '0',
  
  // Quotas
  ORACLE_QUOTA_DATE: '',
  ORACLE_DAILY_QUOTA_COUNT: '0'
};

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Initialize script properties with default values
 * Only sets properties that don't already exist
 */
function setupScriptProperties() {
  const props = getScriptProperties();
  const existing = props.getProperties();
  
  let added = 0;
  let skipped = 0;
  
  for (const [key, value] of Object.entries(DEFAULT_SCRIPT_PROPERTIES)) {
    if (existing[key] === undefined || existing[key] === null) {
      props.setProperty(key, value);
      added++;
      Logger.log('✅ Added: ' + key);
    } else {
      skipped++;
      Logger.log('⏭️ Skipped (exists): ' + key);
    }
  }
  
  Logger.log('\n📊 Setup Complete:');
  Logger.log('   Added: ' + added);
  Logger.log('   Skipped: ' + skipped);
  
  return {
    success: true,
    added: added,
    skipped: skipped
  };
}

/**
 * Reset all script properties to default values
 * WARNING: This will overwrite existing values!
 */
function resetScriptProperties() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Warning',
    'This will reset ALL script properties to default values. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    setProperties(DEFAULT_SCRIPT_PROPERTIES);
    Logger.log('✅ All script properties reset to defaults');
    return { success: true, message: 'Properties reset' };
  }
  
  return { success: false, message: 'Reset cancelled' };
}

/**
 * Display all current script properties (for debugging)
 */
function showScriptProperties() {
  const props = getAllProperties();
  const keys = Object.keys(props).sort();
  
  Logger.log('=== Script Properties ===');
  keys.forEach(key => {
    // Mask sensitive values
    let value = props[key];
    if (key.includes('PASS') || key.includes('SECRET') || key.includes('KEY')) {
      if (value && value.length > 4) {
        value = value.substring(0, 4) + '****';
      }
    }
    Logger.log(key + ': ' + value);
  });
  Logger.log('========================');
  Logger.log('Total properties: ' + keys.length);
  
  return props;
}

// ============================================================================
// DATABASE CONFIGURATION HELPERS
// ============================================================================

/**
 * Get database configuration
 * @returns {Object} Database config
 */
function getDBConfig() {
  return {
    host: getProperty('DB_HOST', ''),
    name: getProperty('DB_NAME', ''),
    user: getProperty('DB_USER', ''),
    pass: getProperty('DB_PASS', '')
  };
}

/**
 * Get Oracle MySQL configuration
 * @returns {Object} Oracle MySQL config
 */
function getOracleMySQLConfig() {
  return {
    host: getProperty('ORACLE_MYSQL_HOST', ''),
    database: getProperty('ORACLE_MYSQL_DATABASE', ''),
    user: getProperty('ORACLE_MYSQL_USER', ''),
    password: getProperty('ORACLE_MYSQL_PASSWORD', '')
  };
}

/**
 * Get gateway URL (primary)
 * @returns {string}
 */
function getGatewayURL() {
  return getProperty('PHP_GATEWAY_URL', 'https://serpifai.com/serpifai_php/api_gateway.php');
}

/**
 * Get backup gateway URL
 * @returns {string}
 */
function getBackupGatewayURL() {
  return getProperty('SERPIFAI_GATEWAY_URL', '');
}

/**
 * Get Master Sheet ID
 * @returns {string}
 */
function getMasterSheetId() {
  return getProperty('MASTER_SHEET_ID', '');
}

// ============================================================================
// FETCHER STATE MANAGEMENT
// ============================================================================

/**
 * Get fetcher processing status
 * @returns {string}
 */
function getFetcherStatus() {
  return getProperty('FT_ProcessingStatus', 'IDLE');
}

/**
 * Set fetcher processing status
 * @param {string} status - Status value (IDLE, PROCESSING, COMPLETED, ERROR)
 */
function setFetcherStatus(status) {
  setProperty('FT_ProcessingStatus', status);
}

/**
 * Get current batch ID
 * @returns {string}
 */
function getCurrentBatchId() {
  return getProperty('FT_CurrentBatchId', '');
}

/**
 * Set current batch ID
 * @param {string} batchId
 */
function setCurrentBatchId(batchId) {
  setProperty('FT_CurrentBatchId', batchId);
}

/**
 * Generate new batch ID
 * @returns {string}
 */
function generateBatchId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return 'FT_' + timestamp + '_' + random;
}

/**
 * Get keyword queue from properties
 * @param {number} queueIndex - Queue index (0, 1, 2, etc.)
 * @returns {Array}
 */
function getKeywordQueue(queueIndex) {
  const key = 'FT_KeywordQueue_' + queueIndex;
  const value = getProperty(key, '[]');
  try {
    return JSON.parse(value);
  } catch (e) {
    Logger.log('Error parsing keyword queue ' + queueIndex + ': ' + e.message);
    return [];
  }
}

/**
 * Set keyword queue in properties
 * @param {number} queueIndex - Queue index
 * @param {Array} keywords - Array of keyword objects
 */
function setKeywordQueue(queueIndex, keywords) {
  const key = 'FT_KeywordQueue_' + queueIndex;
  setProperty(key, JSON.stringify(keywords));
}

/**
 * Get all keyword queues
 * @returns {Array}
 */
function getAllKeywordQueues() {
  const count = parseInt(getProperty('FT_KeywordQueue_count', '0'));
  const allKeywords = [];
  
  for (let i = 0; i < count; i++) {
    const queue = getKeywordQueue(i);
    allKeywords.push(...queue);
  }
  
  return allKeywords;
}

/**
 * Clear all keyword queues
 */
function clearKeywordQueues() {
  const count = parseInt(getProperty('FT_KeywordQueue_count', '0'));
  
  for (let i = 0; i < count; i++) {
    deleteProperty('FT_KeywordQueue_' + i);
  }
  
  setProperty('FT_KeywordQueue_count', '0');
  Logger.log('Cleared ' + count + ' keyword queues');
}

// ============================================================================
// MASTER RESERVOIR MANAGEMENT
// ============================================================================

/**
 * Get master reservoir metadata
 * @returns {Object}
 */
function getMasterReservoirMeta() {
  const value = getProperty('FT_MasterReservoir_meta', '{}');
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
}

/**
 * Set master reservoir metadata
 * @param {Object} meta
 */
function setMasterReservoirMeta(meta) {
  setProperty('FT_MasterReservoir_meta', JSON.stringify(meta));
}

/**
 * Get master reservoir keyword chunk
 * @param {number} chunkIndex
 * @returns {Array}
 */
function getMasterReservoirChunk(chunkIndex) {
  const key = 'FT_MasterReservoir_kw_' + chunkIndex;
  const value = getProperty(key, '[]');
  try {
    return JSON.parse(value);
  } catch (e) {
    return [];
  }
}

/**
 * Set master reservoir keyword chunk
 * @param {number} chunkIndex
 * @param {Array} keywords
 */
function setMasterReservoirChunk(chunkIndex, keywords) {
  const key = 'FT_MasterReservoir_kw_' + chunkIndex;
  setProperty(key, JSON.stringify(keywords));
}

// ============================================================================
// ORACLE QUOTA MANAGEMENT
// ============================================================================

/**
 * Get Oracle daily quota info
 * @returns {Object}
 */
function getOracleQuota() {
  return {
    date: getProperty('ORACLE_QUOTA_DATE', ''),
    count: parseInt(getProperty('ORACLE_DAILY_QUOTA_COUNT', '0'))
  };
}

/**
 * Increment Oracle quota
 * @returns {number} New count
 */
function incrementOracleQuota() {
  const today = new Date().toISOString().split('T')[0];
  const currentDate = getProperty('ORACLE_QUOTA_DATE', '');
  
  if (currentDate !== today) {
    // Reset for new day
    setProperty('ORACLE_QUOTA_DATE', today);
    setProperty('ORACLE_DAILY_QUOTA_COUNT', '1');
    return 1;
  }
  
  const currentCount = parseInt(getProperty('ORACLE_DAILY_QUOTA_COUNT', '0'));
  const newCount = currentCount + 1;
  setProperty('ORACLE_DAILY_QUOTA_COUNT', String(newCount));
  return newCount;
}

/**
 * Reset Oracle quota
 */
function resetOracleQuota() {
  const today = new Date().toISOString().split('T')[0];
  setProperty('ORACLE_QUOTA_DATE', today);
  setProperty('ORACLE_DAILY_QUOTA_COUNT', '0');
}

// ============================================================================
// COMPLIANCE LOG MANAGEMENT
// ============================================================================

/**
 * Get compliance log
 * @returns {Array}
 */
function getComplianceLog() {
  const value = getProperty('ORACLE_COMPLIANCE_LOG', '[]');
  try {
    return JSON.parse(value);
  } catch (e) {
    return [];
  }
}

/**
 * Add compliance log entry
 * @param {Object} entry
 */
function addComplianceLogEntry(entry) {
  const log = getComplianceLog();
  log.push(entry);
  
  // Keep only last 100 entries
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }
  
  setProperty('ORACLE_COMPLIANCE_LOG', JSON.stringify(log));
}

/**
 * Clear compliance log
 */
function clearComplianceLog() {
  setProperty('ORACLE_COMPLIANCE_LOG', '[]');
}

// ============================================================================
// MENU FUNCTIONS
// ============================================================================

/**
 * Add script properties menu items
 */
function addPropertiesMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Properties')
    .addItem('Setup Default Properties', 'setupScriptProperties')
    .addItem('Show All Properties', 'showScriptProperties')
    .addSeparator()
    .addItem('Clear Keyword Queues', 'clearKeywordQueues')
    .addItem('Reset Oracle Quota', 'resetOracleQuota')
    .addSeparator()
    .addItem('⚠️ Reset All to Defaults', 'resetScriptProperties')
    .addToUi();
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate required script properties are set
 * @returns {Object} Validation result
 */
function validateRequiredProperties() {
  const required = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASS',
    'PHP_GATEWAY_URL',
    'MASTER_SHEET_ID'
  ];
  
  const missing = [];
  const set = [];
  
  required.forEach(key => {
    const value = getProperty(key);
    if (!value) {
      missing.push(key);
    } else {
      set.push(key);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing: missing,
    set: set,
    message: missing.length === 0 
      ? '✅ All required properties are set'
      : '❌ Missing properties: ' + missing.join(', ')
  };
}

/**
 * Test database connection using properties
 * @returns {Object}
 */
function testDatabaseConnection() {
  const config = getDBConfig();
  
  if (!config.host || !config.name || !config.user || !config.pass) {
    return {
      success: false,
      error: 'Database credentials not configured in script properties'
    };
  }
  
  // Test via gateway
  const gatewayUrl = getGatewayURL();
  if (!gatewayUrl) {
    return {
      success: false,
      error: 'Gateway URL not configured'
    };
  }
  
  try {
    const response = UrlFetchApp.fetch(gatewayUrl, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({
        action: 'check_status',
        license: 'test'
      }),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    return {
      success: code === 200 || code === 401,
      responseCode: code,
      message: code === 200 ? 'Gateway responding' : 'Gateway reachable (auth required)'
    };
  } catch (e) {
    return {
      success: false,
      error: 'Gateway connection failed: ' + e.message
    };
  }
}

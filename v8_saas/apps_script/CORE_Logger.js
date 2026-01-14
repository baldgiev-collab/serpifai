/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE_Logger.gs - CENTRALIZED LOGGING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Unified logging with levels and formatting
 * 
 * @module CORE_Logger
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Log levels
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 99
};

// Current log level (can be changed via script property)
let _currentLogLevel = null;

/**
 * Get current log level
 * @return {number} Current log level
 */
function CORE_getLogLevel() {
  if (_currentLogLevel === null) {
    const levelStr = CORE_getProperty('LOG_LEVEL', 'INFO');
    _currentLogLevel = LOG_LEVEL[levelStr] !== undefined ? LOG_LEVEL[levelStr] : LOG_LEVEL.INFO;
  }
  return _currentLogLevel;
}

/**
 * Set log level
 * @param {string} level - 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'
 */
function CORE_setLogLevel(level) {
  if (LOG_LEVEL[level] !== undefined) {
    _currentLogLevel = LOG_LEVEL[level];
    CORE_setProperty('LOG_LEVEL', level);
  }
}

/**
 * Format log message with timestamp and metadata
 * @param {string} level - Log level string
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @return {string} Formatted message
 */
function _formatLogMessage(level, module, message, data) {
  const timestamp = new Date().toISOString();
  let formatted = `[${timestamp}] [${level}] [${module}] ${message}`;
  
  if (data && Object.keys(data).length > 0) {
    try {
      formatted += ` | ${JSON.stringify(data)}`;
    } catch (e) {
      formatted += ' | [data not serializable]';
    }
  }
  
  return formatted;
}

/**
 * Write log entry
 * @param {number} level - Log level number
 * @param {string} levelStr - Log level string
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function _writeLog(level, levelStr, module, message, data) {
  if (level >= CORE_getLogLevel()) {
    const formatted = _formatLogMessage(levelStr, module, message, data);
    console.log(formatted);
    
    // Store in cache for recent logs
    _storeRecentLog(levelStr, module, message, data);
  }
}

/**
 * Store recent log entry in cache
 * @param {string} level - Log level
 * @param {string} module - Module name
 * @param {string} message - Message
 * @param {Object} data - Data
 */
function _storeRecentLog(level, module, message, data) {
  try {
    const cache = CacheService.getScriptCache();
    const key = 'recent_logs';
    let logs = [];
    
    const existing = cache.get(key);
    if (existing) {
      try { logs = JSON.parse(existing); } catch(e) {}
    }
    
    logs.push({
      timestamp: new Date().toISOString(),
      level: level,
      module: module,
      message: message.substring(0, 200)  // Truncate for cache
    });
    
    // Keep only last 50 entries
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }
    
    cache.put(key, JSON.stringify(logs), 3600);  // 1 hour
  } catch (e) {
    // Silently fail - logging should never break main flow
  }
}

/**
 * Debug log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function LOG_debug(module, message, data) {
  _writeLog(LOG_LEVEL.DEBUG, 'DEBUG', module, message, data);
}

/**
 * Info log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function LOG_info(module, message, data) {
  _writeLog(LOG_LEVEL.INFO, 'INFO', module, message, data);
}

/**
 * Warning log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function LOG_warn(module, message, data) {
  _writeLog(LOG_LEVEL.WARN, 'WARN', module, message, data);
}

/**
 * Error log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function LOG_error(module, message, data) {
  _writeLog(LOG_LEVEL.ERROR, 'ERROR', module, message, data);
}

/**
 * Get recent logs from cache
 * @param {number} count - Number of entries to return
 * @return {Array} Recent log entries
 */
function CORE_Log_getRecentLogs(count) {
  try {
    const cache = CacheService.getScriptCache();
    const existing = cache.get('recent_logs');
    if (!existing) return [];
    
    const logs = JSON.parse(existing);
    return logs.slice(-(count || 20));
  } catch (e) {
    return [];
  }
}

/**
 * Clear recent logs
 */
function CORE_clearRecentLogs() {
  try {
    CacheService.getScriptCache().remove('recent_logs');
  } catch (e) {
    // Ignore
  }
}

/**
 * Log function entry (for debugging)
 * @param {string} funcName - Function name
 * @param {Object} params - Parameters (will be truncated)
 */
function LOG_enter(funcName, params) {
  LOG_debug('TRACE', `→ Entering ${funcName}`, params);
}

/**
 * Log function exit (for debugging)
 * @param {string} funcName - Function name
 * @param {*} result - Result (will be truncated)
 */
function LOG_exit(funcName, result) {
  const resultStr = result ? String(result).substring(0, 100) : 'void';
  LOG_debug('TRACE', `← Exiting ${funcName}`, { result: resultStr });
}

/**
 * Log performance timing
 * @param {string} operation - Operation name
 * @param {number} startTime - Start timestamp from Date.now()
 */
function LOG_timing(operation, startTime) {
  const duration = Date.now() - startTime;
  LOG_info('PERF', `${operation} completed in ${duration}ms`);
}

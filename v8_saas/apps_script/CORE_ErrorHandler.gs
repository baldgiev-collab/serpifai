/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE_ErrorHandler.gs - CENTRALIZED ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Unified error handling with categorization
 * 
 * @module CORE_ErrorHandler
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Error categories
const ERROR_CATEGORY = {
  API: 'API_ERROR',
  AUTH: 'AUTH_ERROR',
  CONFIG: 'CONFIG_ERROR',
  DATA: 'DATA_ERROR',
  NETWORK: 'NETWORK_ERROR',
  PARSE: 'PARSE_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Create a standardized error object
 * @param {string} category - Error category from ERROR_CATEGORY
 * @param {string} message - Human readable message
 * @param {Object} details - Additional details
 * @return {Object} Standardized error object
 */
function CORE_createError(category, message, details) {
  return {
    success: false,
    error: true,
    category: category || ERROR_CATEGORY.UNKNOWN,
    message: message || 'An unknown error occurred',
    details: details || {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handle and log an error
 * @param {string} module - Module where error occurred
 * @param {string} operation - Operation that failed
 * @param {Error|Object} error - The error object
 * @param {boolean} rethrow - Whether to rethrow after logging
 * @return {Object} Standardized error object
 */
function CORE_handleError(module, operation, error, rethrow) {
  const category = _categorizeError(error);
  const message = error.message || String(error);
  
  const errorObj = CORE_createError(category, message, {
    module: module,
    operation: operation,
    stack: error.stack || '',
    originalError: String(error)
  });
  
  // Log the error
  LOG_error(module, `${operation} failed: ${message}`, {
    category: category,
    stack: error.stack ? error.stack.substring(0, 500) : ''
  });
  
  // Store in error history
  _storeErrorHistory(module, operation, errorObj);
  
  if (rethrow) {
    throw error;
  }
  
  return errorObj;
}

/**
 * Categorize an error based on its properties
 * @param {Error|Object} error - The error to categorize
 * @return {string} Error category
 */
function _categorizeError(error) {
  const msg = (error.message || String(error)).toLowerCase();
  
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return ERROR_CATEGORY.TIMEOUT;
  }
  if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('429')) {
    return ERROR_CATEGORY.RATE_LIMIT;
  }
  if (msg.includes('auth') || msg.includes('permission') || msg.includes('401') || msg.includes('403')) {
    return ERROR_CATEGORY.AUTH;
  }
  if (msg.includes('network') || msg.includes('connection') || msg.includes('dns')) {
    return ERROR_CATEGORY.NETWORK;
  }
  if (msg.includes('parse') || msg.includes('json') || msg.includes('syntax')) {
    return ERROR_CATEGORY.PARSE;
  }
  if (msg.includes('api') || msg.includes('endpoint') || msg.includes('400') || msg.includes('500')) {
    return ERROR_CATEGORY.API;
  }
  if (msg.includes('config') || msg.includes('missing') || msg.includes('required')) {
    return ERROR_CATEGORY.CONFIG;
  }
  if (msg.includes('data') || msg.includes('invalid') || msg.includes('null')) {
    return ERROR_CATEGORY.DATA;
  }
  
  return ERROR_CATEGORY.UNKNOWN;
}

/**
 * Store error in history for diagnostics
 * @param {string} module - Module name
 * @param {string} operation - Operation name
 * @param {Object} errorObj - Error object
 */
function _storeErrorHistory(module, operation, errorObj) {
  try {
    const cache = CacheService.getScriptCache();
    const key = 'error_history';
    let history = [];
    
    const existing = cache.get(key);
    if (existing) {
      try { history = JSON.parse(existing); } catch(e) {}
    }
    
    history.push({
      timestamp: new Date().toISOString(),
      module: module,
      operation: operation,
      category: errorObj.category,
      message: errorObj.message.substring(0, 200)
    });
    
    // Keep only last 100 errors
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    cache.put(key, JSON.stringify(history), 86400);  // 24 hours
  } catch (e) {
    // Silently fail
  }
}

/**
 * Get error history
 * @param {number} count - Number of entries
 * @return {Array} Recent errors
 */
function CORE_getErrorHistory(count) {
  try {
    const cache = CacheService.getScriptCache();
    const existing = cache.get('error_history');
    if (!existing) return [];
    
    const history = JSON.parse(existing);
    return history.slice(-(count || 20));
  } catch (e) {
    return [];
  }
}

/**
 * Clear error history
 */
function CORE_clearErrorHistory() {
  try {
    CacheService.getScriptCache().remove('error_history');
  } catch (e) {
    // Ignore
  }
}

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} module - Module name
 * @param {string} operation - Operation name
 * @return {Function} Wrapped function
 */
function CORE_wrapWithErrorHandler(fn, module, operation) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      return CORE_handleError(module, operation, error, false);
    }
  };
}

/**
 * Check if result is an error object
 * @param {*} result - Result to check
 * @return {boolean} True if error
 */
function CORE_isError(result) {
  return result && result.error === true && result.category;
}

/**
 * Create a success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @return {Object} Success response
 */
function CORE_success(data, message) {
  return {
    success: true,
    error: false,
    data: data,
    message: message || 'Operation completed successfully',
    timestamp: new Date().toISOString()
  };
}

/**
 * Try an operation with retries
 * @param {Function} operation - Operation to try
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delayMs - Delay between retries in ms
 * @param {string} module - Module name for logging
 * @return {*} Operation result or error
 */
function CORE_retry(operation, maxRetries, delayMs, module) {
  maxRetries = maxRetries || 3;
  delayMs = delayMs || 1000;
  module = module || 'RETRY';
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = operation();
      if (attempt > 1) {
        LOG_info(module, `Succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      LOG_warn(module, `Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        Utilities.sleep(delayMs * attempt);  // Exponential backoff
      }
    }
  }
  
  return CORE_handleError(module, 'retry', lastError, false);
}

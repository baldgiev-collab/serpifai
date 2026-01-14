/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE_Utils.gs - SHARED UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Common utilities used across all modules
 * 
 * @module CORE_Utils
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @return {Object} Cloned object
 */
function UTIL_clone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return obj;
  }
}

/**
 * Safely parse JSON
 * @param {string} jsonStr - JSON string
 * @param {*} defaultValue - Default if parse fails
 * @return {*} Parsed value or default
 */
function UTIL_parseJSON(jsonStr, defaultValue) {
  if (!jsonStr) return defaultValue;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    LOG_warn('UTIL', 'JSON parse failed', { error: e.message });
    return defaultValue;
  }
}

/**
 * Safely stringify to JSON
 * @param {*} value - Value to stringify
 * @param {string} defaultValue - Default if stringify fails
 * @return {string} JSON string or default
 */
function UTIL_stringify(value, defaultValue) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return defaultValue || '{}';
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array/object)
 * @param {*} value - Value to check
 * @return {boolean} True if empty
 */
function UTIL_isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get value with default
 * @param {*} value - Value to check
 * @param {*} defaultValue - Default if empty
 * @return {*} Value or default
 */
function UTIL_default(value, defaultValue) {
  return UTIL_isEmpty(value) ? defaultValue : value;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @return {string} Formatted number
 */
function UTIL_formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {number} decimals - Decimal places
 * @param {boolean} isDecimal - True if value is 0-1
 * @return {string} Formatted percentage
 */
function UTIL_formatPercent(value, decimals, isDecimal) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  decimals = decimals || 1;
  const pct = isDecimal ? value * 100 : value;
  return pct.toFixed(decimals) + '%';
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @return {string} Formatted string (KB, MB, GB)
 */
function UTIL_formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable
 * @param {number} ms - Milliseconds
 * @return {string} Formatted duration
 */
function UTIL_formatDuration(ms) {
  if (!ms || ms < 0) return '0s';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  if (ms < 3600000) return Math.floor(ms / 60000) + 'm ' + Math.floor((ms % 60000) / 1000) + 's';
  return Math.floor(ms / 3600000) + 'h ' + Math.floor((ms % 3600000) / 60000) + 'm';
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @return {string} Truncated string
 */
function UTIL_truncate(str, maxLength) {
  if (!str) return '';
  maxLength = maxLength || 100;
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @return {string} Unique ID
 */
function UTIL_generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return (prefix || '') + timestamp + random;
}

/**
 * Sanitize string for safe use (remove special chars)
 * @param {string} str - String to sanitize
 * @return {string} Sanitized string
 */
function UTIL_sanitize(str) {
  if (!str) return '';
  return str.replace(/[<>'"&]/g, '').trim();
}

/**
 * Escape HTML entities
 * @param {string} str - String to escape
 * @return {string} Escaped string
 */
function UTIL_escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extract domain from URL
 * @param {string} url - URL
 * @return {string} Domain
 */
function UTIL_extractDomain(url) {
  if (!url) return '';
  try {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i);
    return match ? match[1] : url;
  } catch (e) {
    return url;
  }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @return {boolean} True if valid
 */
function UTIL_isValidUrl(url) {
  if (!url) return false;
  try {
    const pattern = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-\.\/\?%&=]*)?$/i;
    return pattern.test(url);
  } catch (e) {
    return false;
  }
}

/**
 * Normalize URL (add https if missing)
 * @param {string} url - URL to normalize
 * @return {string} Normalized URL
 */
function UTIL_normalizeUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @return {Array} Array of chunks
 */
function UTIL_chunk(array, size) {
  if (!Array.isArray(array) || !size || size < 1) return [array];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested array
 * @param {Array} array - Nested array
 * @return {Array} Flattened array
 */
function UTIL_flatten(array) {
  if (!Array.isArray(array)) return [array];
  return array.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? UTIL_flatten(item) : item), []);
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {string} key - Optional key for objects
 * @return {Array} Deduplicated array
 */
function UTIL_unique(array, key) {
  if (!Array.isArray(array)) return [];
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  return [...new Set(array)];
}

/**
 * Get current timestamp in ISO format
 * @return {string} ISO timestamp
 */
function UTIL_timestamp() {
  return new Date().toISOString();
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function UTIL_sleep(ms) {
  Utilities.sleep(ms || 100);
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @return {number} Percentage
 */
function UTIL_percent(value, total, decimals) {
  if (!total || total === 0) return 0;
  decimals = decimals || 1;
  return Number(((value / total) * 100).toFixed(decimals));
}

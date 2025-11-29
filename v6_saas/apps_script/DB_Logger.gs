/**
 * DB_Logger.gs
 * Logging utilities for DataBridge
 */

/**
 * Info level logging
 */
function DB_LOGI() {
  console.log.apply(console, ['[INFO]'].concat([].slice.call(arguments)));
}

/**
 * Warning level logging
 */
function DB_LOGW() {
  console.warn.apply(console, ['[WARN]'].concat([].slice.call(arguments)));
}

/**
 * Error level logging
 */
function DB_LOGE() {
  console.error.apply(console, ['[ERROR]'].concat([].slice.call(arguments)));
}

/**
 * Module-based logging with INFO level
 * @param {string} module - Module name
 * @param {string} message - Log message
 */
function DB_LOG_info(module, message) {
  Logger.log('[INFO] ' + module + ': ' + message);
}

/**
 * Module-based logging with WARN level
 * @param {string} module - Module name
 * @param {string} message - Log message
 */
function DB_LOG_warn(module, message) {
  Logger.log('[WARN] ' + module + ': ' + message);
}

/**
 * Module-based logging with ERROR level
 * @param {string} module - Module name
 * @param {string} message - Log message
 */
function DB_LOG_error(module, message) {
  Logger.log('[ERROR] ' + module + ': ' + message);
}

/**
 * Legacy function names for backwards compatibility
 */
function LOGI() {
  DB_LOGI.apply(this, arguments);
}

function LOGW() {
  DB_LOGW.apply(this, arguments);
}

function LOGE() {
  DB_LOGE.apply(this, arguments);
}

function LOG_info(module, message) {
  DB_LOG_info(module, message);
}

function LOG_warn(module, message) {
  DB_LOG_warn(module, message);
}

function LOG_error(module, message) {
  DB_LOG_error(module, message);
}

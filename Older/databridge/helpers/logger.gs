/**
 * Simple logging utilities for DataBridge
 */

function LOGI() {
  console.log.apply(console, ['[INFO]'].concat([].slice.call(arguments)));
}

function LOGW() {
  console.warn.apply(console, ['[WARN]'].concat([].slice.call(arguments)));
}

function LOGE() {
  console.error.apply(console, ['[ERROR]'].concat([].slice.call(arguments)));
}

// Aliases with LOG_* naming convention
function LOG_info(module, message) {
  Logger.log('[INFO] ' + module + ': ' + message);
}

function LOG_warn(module, message) {
  Logger.log('[WARN] ' + module + ': ' + message);
}

function LOG_error(module, message) {
  Logger.log('[ERROR] ' + module + ': ' + message);
}

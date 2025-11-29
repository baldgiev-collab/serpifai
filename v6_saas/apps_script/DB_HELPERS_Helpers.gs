/**
 * DB_HELPERS_Helpers.gs
 * Helper utilities - Sheet helpers, Array utils, API config
 * NOTE: Most sheet operations now use database via Gateway
 */

// Sheet Helpers (legacy - now routes to database)
function DB_HELPERS_getOrCreateSheet(name) {
  // In v6, "sheets" are database tables accessed via Gateway
  return { name: name, isDatabase: true };
}

// Array Utils
function DB_HELPERS_arrayUtils_unique(arr) {
  return arr.filter(function(item, index) {
    return arr.indexOf(item) === index;
  });
}

function DB_HELPERS_arrayUtils_chunk(arr, size) {
  var chunks = [];
  for (var i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// API Config Helpers
function DB_HELPERS_apiConfig_getEndpoint(service) {
  // All endpoints now route through Gateway
  return GATEWAY_URL + '?action=' + service;
}

// Diagnostic Logger
function DB_HELPERS_diagnosticLogger(module, level, message) {
  var timestamp = new Date().toISOString();
  Logger.log('[' + timestamp + '] [' + level + '] ' + module + ': ' + message);
}

// Legacy names
function Helpers_getOrCreateSheet_(name) { return DB_HELPERS_getOrCreateSheet(name); }
function Helpers_ensureHeader_(sheet, headers) { return headers; }
function Helpers_index_(headers) {
  var idx = {};
  headers.forEach(function(h, i) { idx[h] = i; });
  return idx;
}

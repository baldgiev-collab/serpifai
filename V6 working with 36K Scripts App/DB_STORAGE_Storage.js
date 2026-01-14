/**
 * DB_STORAGE_Storage.gs
 * Storage Module - Unified competitor storage, data collectors
 */

// Unified Competitor Storage
function DB_STORAGE_unifiedCompetitorStorage(params) {
  return callGateway({
    action: 'storage:unifiedCompetitor',
    data: params || {}
  });
}

// Enhanced Data Collector
function DB_COLLECTORS_enhancedDataCollector(params) {
  return callGateway({
    action: 'collectors:enhancedData',
    data: params || {}
  });
}

// Legacy names
function STORAGE_unifiedCompetitorStorage(p) { return DB_STORAGE_unifiedCompetitorStorage(p); }
function COLLECTORS_enhancedDataCollector(p) { return DB_COLLECTORS_enhancedDataCollector(p); }

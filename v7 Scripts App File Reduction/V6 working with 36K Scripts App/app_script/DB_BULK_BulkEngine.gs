/**
 * DB_BULK_BulkEngine.gs
 * Bulk Operations Engine - Batch generation, publishing, queue management
 */

// Bulk Router
function DB_BULK_router(params) {
  return callGateway({
    action: 'bulk:router',
    data: params || {}
  });
}

// Batch Generator
function DB_BULK_batchGenerator(params) {
  return callGateway({
    action: 'bulk:generate',
    data: params || {}
  });
}

// Batch Publisher
function DB_BULK_batchPublisher(params) {
  return callGateway({
    action: 'bulk:publish',
    data: params || {}
  });
}

// Queue Manager
function DB_BULK_queueManager(params) {
  return callGateway({
    action: 'bulk:queue',
    data: params || {}
  });
}

// Legacy names
function BULK_router(p) { return DB_BULK_router(p); }
function BULK_batchGenerator(p) { return DB_BULK_batchGenerator(p); }
function BULK_batchPublisher(p) { return DB_BULK_batchPublisher(p); }
function BULK_queueManager(p) { return DB_BULK_queueManager(p); }

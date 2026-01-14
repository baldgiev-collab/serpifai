/**
 * FT_Comp_State.gs - State Management for Fetcher
 * SerpifAI v8.0.0 - Handles all PropertiesService state operations
 */

/** Get current processing status */
function FT_State_getStatus() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(FT_CONFIG.PROPS.STATUS) || FT_CONFIG.STATUS.IDLE;
}

/**
 * Set processing status
 * @param {string} status - Status value
 */
function FT_State_setStatus(status) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(FT_CONFIG.PROPS.STATUS, status);
  LOG_debug('FT_State', `Status set to: ${status}`);
}

/**
 * Get last processed index
 * @return {number} Index
 */
function FT_State_getLastIndex() {
  const props = PropertiesService.getScriptProperties();
  return parseInt(props.getProperty(FT_CONFIG.PROPS.LAST_INDEX) || '0');
}

/**
 * Set last processed index
 * @param {number} index - Index value
 */
function FT_State_setLastIndex(index) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(FT_CONFIG.PROPS.LAST_INDEX, index.toString());
}

/**
 * Store keyword queue (chunked for size limits)
 * @param {Array} queue - Keyword queue
 */
function FT_State_storeQueue(queue) {
  const props = PropertiesService.getScriptProperties();
  const chunkSize = 50;  // Properties have 9KB limit
  const chunks = UTIL_chunk(queue, chunkSize);
  
  // Store chunk count
  props.setProperty(FT_CONFIG.PROPS.QUEUE + '_count', chunks.length.toString());
  
  // Store each chunk
  chunks.forEach((chunk, idx) => {
    props.setProperty(FT_CONFIG.PROPS.QUEUE + '_' + idx, JSON.stringify(chunk));
  });
  
  LOG_debug('FT_State', `Queue stored in ${chunks.length} chunks`);
}

/**
 * Load keyword queue from chunks
 * @return {Array} Keyword queue
 */
function FT_State_loadQueue() {
  const props = PropertiesService.getScriptProperties();
  const chunkCount = parseInt(props.getProperty(FT_CONFIG.PROPS.QUEUE + '_count') || '0');
  
  if (chunkCount === 0) return [];
  
  const queue = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunk = props.getProperty(FT_CONFIG.PROPS.QUEUE + '_' + i);
    if (chunk) {
      try {
        queue.push(...JSON.parse(chunk));
      } catch (e) {
        LOG_warn('FT_State', `Failed to parse queue chunk ${i}`);
      }
    }
  }
  
  return queue;
}

/**
 * Initialize the reservoir
 * @return {Object} Empty reservoir structure
 */
function FT_State_initReservoir() {
  const reservoir = {
    version: SERPIFAI_VERSION,
    createdAt: new Date().toISOString(),
    keywords: [],
    stats: {
      total: 450,
      processed: 0,
      failed: 0,
      retryQueued: 0,
      fallback: 0,
      lastUpdated: null
    }
  };
  
  FT_State_saveReservoir(reservoir);
  return reservoir;
}

/**
 * Save reservoir (chunked)
 * @param {Object} reservoir - Reservoir data
 */
function FT_State_saveReservoir(reservoir) {
  const props = PropertiesService.getScriptProperties();
  
  // Store metadata separately
  const meta = {
    version: reservoir.version,
    createdAt: reservoir.createdAt,
    stats: reservoir.stats,
    keywordCount: reservoir.keywords?.length || 0
  };
  props.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_meta', JSON.stringify(meta));
  
  // Store keywords in chunks
  if (reservoir.keywords && reservoir.keywords.length > 0) {
    const chunks = UTIL_chunk(reservoir.keywords, 30);
    props.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_count', chunks.length.toString());
    
    chunks.forEach((chunk, idx) => {
      props.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_' + idx, JSON.stringify(chunk));
    });
  }
}

/**
 * Load reservoir from chunks
 * @return {Object} Reservoir data
 */
function FT_State_loadReservoir() {
  const props = PropertiesService.getScriptProperties();
  
  const metaStr = props.getProperty(FT_CONFIG.PROPS.RESERVOIR + '_meta');
  if (!metaStr) return null;
  
  try {
    const meta = JSON.parse(metaStr);
    const reservoir = {
      version: meta.version,
      createdAt: meta.createdAt,
      stats: meta.stats,
      keywords: []
    };
    
    // Load keyword chunks
    const chunkCount = parseInt(props.getProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_count') || '0');
    for (let i = 0; i < chunkCount; i++) {
      const chunk = props.getProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_' + i);
      if (chunk) {
        try {
          reservoir.keywords.push(...JSON.parse(chunk));
        } catch (e) {}
      }
    }
    
    return reservoir;
  } catch (e) {
    LOG_warn('FT_State', 'Failed to load reservoir', { error: e.message });
    return null;
  }
}

/**
 * Add to retry queue
 * @param {Object} keyword - Keyword object
 * @param {string} error - Error message
 */
function FT_State_addToRetryQueue(keyword, error) {
  const props = PropertiesService.getScriptProperties();
  let queue = [];
  
  const existing = props.getProperty(FT_CONFIG.PROPS.RETRY_QUEUE);
  if (existing) {
    try { queue = JSON.parse(existing); } catch (e) {}
  }
  
  queue.push({ ...keyword, error: error, retryAt: Date.now() });
  props.setProperty(FT_CONFIG.PROPS.RETRY_QUEUE, JSON.stringify(queue));
}

/**
 * Load retry queue
 * @return {Array} Retry queue
 */
function FT_State_loadRetryQueue() {
  const props = PropertiesService.getScriptProperties();
  const data = props.getProperty(FT_CONFIG.PROPS.RETRY_QUEUE);
  return data ? UTIL_parseJSON(data, []) : [];
}

/**
 * Clear retry queue
 */
function FT_State_clearRetryQueue() {
  PropertiesService.getScriptProperties().deleteProperty(FT_CONFIG.PROPS.RETRY_QUEUE);
}

/**
 * Log error to persistent storage
 * @param {string} context - Error context
 * @param {Object} error - Error details
 */
function FT_State_logError(context, error) {
  const props = PropertiesService.getScriptProperties();
  let log = [];
  
  const existing = props.getProperty(FT_CONFIG.PROPS.ERROR_LOG);
  if (existing) {
    try { log = JSON.parse(existing); } catch (e) {}
  }
  
  log.push({
    timestamp: new Date().toISOString(),
    context: context,
    message: error.message || String(error)
  });
  
  // Keep only last 50 errors
  if (log.length > 50) log = log.slice(-50);
  
  props.setProperty(FT_CONFIG.PROPS.ERROR_LOG, JSON.stringify(log));
}

/**
 * Get full status object
 * @return {Object} Complete status
 */
function FT_State_getFullStatus() {
  const status = FT_State_getStatus();
  const lastIndex = FT_State_getLastIndex();
  const reservoir = FT_State_loadReservoir() || FT_State_initReservoir();
  const retryQueue = FT_State_loadRetryQueue();
  
  const props = PropertiesService.getScriptProperties();
  const batchId = props.getProperty(FT_CONFIG.PROPS.BATCH_ID);
  
  return {
    status: status,
    batchId: batchId,
    progress: {
      processed: lastIndex,
      total: reservoir.stats?.total || 450,
      percentage: Math.round((lastIndex / (reservoir.stats?.total || 450)) * 100)
    },
    stats: reservoir.stats,
    retryQueueSize: retryQueue.length,
    reservoir: reservoir
  };
}

/**
 * Clear all state
 */
function FT_State_clearAll() {
  const props = PropertiesService.getScriptProperties();
  const keys = Object.values(FT_CONFIG.PROPS);
  
  keys.forEach(key => {
    // Delete main key and any chunked versions
    props.deleteProperty(key);
    for (let i = 0; i < 20; i++) {
      props.deleteProperty(key + '_' + i);
    }
    props.deleteProperty(key + '_count');
    props.deleteProperty(key + '_meta');
    props.deleteProperty(key + '_kw_count');
  });
  
  FT_State_cleanupTriggers();
  LOG_info('FT_State', 'All state cleared');
}

/**
 * Cleanup all fetch triggers
 */
function FT_State_cleanupTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'FT_ContinueBatch') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Schedule next batch trigger
 */
function FT_State_scheduleNextBatch() {
  FT_State_cleanupTriggers();
  ScriptApp.newTrigger('FT_ContinueBatch')
    .timeBased()
    .after(FT_CONFIG.TRIGGER_DELAY_MINUTES * 60 * 1000)
    .create();
  LOG_debug('FT_State', 'Next batch scheduled');
}

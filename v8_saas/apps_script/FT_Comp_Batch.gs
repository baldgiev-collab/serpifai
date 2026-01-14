/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Comp_Batch.gs - BATCH PROCESSING LOGIC
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Handles batch processing of keyword queue
 * 
 * @module FT_Comp_Batch
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Process a batch of keywords
 * @param {FT_BatchProcessor} processor - Processor instance
 * @return {Object} Batch result
 */
function FT_Batch_process(processor) {
  const lastIndex = FT_State_getLastIndex();
  const queue = FT_State_loadQueue();
  const reservoir = FT_State_loadReservoir() || FT_State_initReservoir();
  
  if (queue.length === 0) {
    LOG_warn('FT_Batch', 'Queue is empty');
    FT_State_setStatus(FT_CONFIG.STATUS.IDLE);
    return { complete: false, error: 'Queue is empty' };
  }
  
  LOG_info('FT_Batch', `Starting from index: ${lastIndex}/${queue.length}`);
  
  let processedCount = 0;
  let currentIndex = lastIndex;
  
  while (processedCount < FT_CONFIG.BATCH_SIZE && currentIndex < queue.length) {
    if (processor.isTimeoutApproaching()) {
      LOG_info('FT_Batch', 'Timeout approaching, scheduling continuation');
      break;
    }
    
    const keyword = queue[currentIndex];
    const result = FT_API_fetchKeyword(keyword);
    
    if (result.success) {
      reservoir.keywords.push(result.data);
      reservoir.stats.processed++;
    } else if (result.retry) {
      FT_State_addToRetryQueue(keyword, result.error);
      reservoir.stats.retryQueued++;
    } else {
      reservoir.stats.failed++;
      FT_State_logError('FETCH', { keyword: keyword.kw, error: result.error });
    }
    
    currentIndex++;
    processedCount++;
    
    if (processedCount % 10 === 0) {
      LOG_debug('FT_Batch', `Progress: ${currentIndex}/${queue.length}`);
    }
  }
  
  // Update state
  FT_State_setLastIndex(currentIndex);
  reservoir.stats.lastUpdated = new Date().toISOString();
  FT_State_saveReservoir(reservoir);
  
  // Check if complete
  if (currentIndex >= queue.length) {
    const retryComplete = _processRetryQueue(reservoir);
    
    if (retryComplete) {
      FT_State_setStatus(FT_CONFIG.STATUS.COMPLETED);
      LOG_info('FT_Batch', 'All keywords processed!');
      FT_State_cleanupTriggers();
      return { complete: true, stats: reservoir.stats };
    }
  } else {
    FT_State_scheduleNextBatch();
    LOG_info('FT_Batch', 'Batch complete, next scheduled');
  }
  
  return {
    complete: false,
    processed: processedCount,
    currentIndex: currentIndex,
    total: queue.length,
    stats: reservoir.stats
  };
}

/**
 * Process the retry queue
 * @param {Object} reservoir - Reservoir object
 * @return {boolean} True if complete
 */
function _processRetryQueue(reservoir) {
  const retryQueue = FT_State_loadRetryQueue();
  
  if (retryQueue.length === 0) {
    return true;
  }
  
  LOG_info('FT_Batch', `Processing ${retryQueue.length} retry items`);
  
  let retryProcessed = 0;
  const stillFailed = [];
  
  retryQueue.forEach(keyword => {
    keyword.attempts++;
    
    if (keyword.attempts > FT_CONFIG.MAX_RETRIES) {
      // Max retries exceeded, use fallback
      const fallback = FT_API_generateFallback(keyword);
      reservoir.keywords.push(fallback);
      reservoir.stats.fallback++;
      retryProcessed++;
      return;
    }
    
    const result = FT_API_fetchKeyword(keyword);
    
    if (result.success) {
      reservoir.keywords.push(result.data);
      reservoir.stats.processed++;
      retryProcessed++;
    } else {
      stillFailed.push(keyword);
    }
  });
  
  // Update retry queue with still-failed items
  if (stillFailed.length > 0) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty(FT_CONFIG.PROPS.RETRY_QUEUE, JSON.stringify(stillFailed));
    return false;
  }
  
  FT_State_clearRetryQueue();
  FT_State_saveReservoir(reservoir);
  return true;
}

/**
 * Verify batch integrity
 * @return {Object} Verification result
 */
function FT_Batch_verify() {
  const queue = FT_State_loadQueue();
  const reservoir = FT_State_loadReservoir();
  const retryQueue = FT_State_loadRetryQueue();
  
  const total = queue.length;
  const processed = reservoir?.keywords?.length || 0;
  const pending = total - processed;
  const inRetry = retryQueue.length;
  
  return {
    total: total,
    processed: processed,
    pending: pending,
    inRetry: inRetry,
    complete: pending === 0 && inRetry === 0,
    percentage: total > 0 ? Math.round((processed / total) * 100) : 0
  };
}

/**
 * Get batch statistics
 * @return {Object} Statistics
 */
function FT_Batch_getStats() {
  const reservoir = FT_State_loadReservoir();
  if (!reservoir) {
    return {
      processed: 0,
      failed: 0,
      fallback: 0,
      retryQueued: 0,
      byModule: {}
    };
  }
  
  const byModule = {};
  reservoir.keywords.forEach(kw => {
    const mod = kw.ui_cat || 'unknown';
    byModule[mod] = (byModule[mod] || 0) + 1;
  });
  
  return {
    ...reservoir.stats,
    byModule: byModule,
    keywordCount: reservoir.keywords.length
  };
}

/**
 * Export batch results as JSON
 * @return {string} JSON string
 */
function FT_Batch_exportJSON() {
  const reservoir = FT_State_loadReservoir();
  if (!reservoir) {
    return JSON.stringify({ error: 'No data to export' });
  }
  
  return JSON.stringify({
    exported: new Date().toISOString(),
    version: SERPIFAI_VERSION,
    stats: reservoir.stats,
    keywords: reservoir.keywords
  }, null, 2);
}

/**
 * Get keywords by module type
 * @param {string} moduleType - Module type (money, sge, tail, llm)
 * @return {Array} Keywords
 */
function FT_Batch_getByModule(moduleType) {
  const reservoir = FT_State_loadReservoir();
  if (!reservoir || !reservoir.keywords) return [];
  
  return reservoir.keywords.filter(kw => kw.ui_cat === moduleType);
}

/**
 * Get keywords by competitor
 * @param {string} competitor - Competitor domain
 * @return {Array} Keywords
 */
function FT_Batch_getByCompetitor(competitor) {
  const reservoir = FT_State_loadReservoir();
  if (!reservoir || !reservoir.keywords) return [];
  
  return reservoir.keywords.filter(kw => kw.competitor === competitor);
}

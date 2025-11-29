/**
 * DB_Pipeline.gs
 * Content generation and publishing pipeline
 * Orchestrates workflow from calendar → generation → QA → publishing
 */

/**
 * Generate all content from calendar
 * Reads calendar, generates content, runs QA, caches results
 * @param {object} params - Parameters with optional project_id
 * @return {object} Result with generated items
 */
function DB_PIPE_generateAllFromCalendar(params) {
  try {
    var projectId = (params && params.project_id) || 'active';
    
    // Use Gateway to orchestrate full pipeline
    var result = callGateway({
      action: 'pipeline:generateAllFromCalendar',
      data: { project_id: projectId }
    });
    
    if (result && result.success) {
      return { ok: true, items: result.data || [] };
    } else {
      return { ok: false, error: result.error || 'Pipeline failed' };
    }
    
  } catch (e) {
    DB_LOG_error('PIPELINE', 'Error in generateAllFromCalendar: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Run QA and improve content quality
 * @param {object} params - Parameters with items array
 * @return {object} Result with improved items
 */
function DB_PIPE_qaAndImprove(params) {
  try {
    var items = (params && params.items) || [];
    
    if (items.length === 0) {
      return { ok: false, error: 'No items to improve' };
    }
    
    var result = callGateway({
      action: 'pipeline:qaAndImprove',
      data: { items: items }
    });
    
    if (result && result.success) {
      return { ok: true, items: result.data || [] };
    } else {
      return { ok: false, error: result.error || 'QA pipeline failed' };
    }
    
  } catch (e) {
    DB_LOG_error('PIPELINE', 'Error in qaAndImprove: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Publish batch of content
 * @param {object} params - Parameters with items array
 * @return {object} Result with publish results
 */
function DB_PIPE_publishBatch(params) {
  try {
    var items = (params && params.items) || [];
    
    if (items.length === 0) {
      return { ok: false, error: 'No items to publish' };
    }
    
    var result = callGateway({
      action: 'pipeline:publishBatch',
      data: { items: items }
    });
    
    if (result && result.success) {
      return { ok: true, results: result.data || [] };
    } else {
      return { ok: false, error: result.error || 'Publish pipeline failed' };
    }
    
  } catch (e) {
    DB_LOG_error('PIPELINE', 'Error in publishBatch: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Append results to cache
 * @param {object} params - Parameters with items array
 * @return {object} Result with updated cache IDs
 */
function DB_PIPE_appendToCache(params) {
  try {
    var items = (params && params.items) || [];
    var updated = [];
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var cacheResult = DB_CACHE_updateStatus({
        cache_id: item.cache_id,
        published: !!item.published,
        published_url: item.published_url || ''
      });
      
      updated.push({
        cache_id: item.cache_id,
        ok: cacheResult.ok
      });
    }
    
    return { ok: true, updated: updated };
    
  } catch (e) {
    DB_LOG_error('PIPELINE', 'Error in appendToCache: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Update calendar sheet with publish status
 * NOTE: In v6, calendar data is in database, not sheets
 * This function updates database records
 * @param {object} params - Parameters with items array
 * @return {object} Update result
 */
function DB_PIPE_updateCalendarSheet(params) {
  try {
    var items = (params && params.items) || [];
    
    if (items.length === 0) {
      return { ok: false, error: 'No items to update' };
    }
    
    var result = callGateway({
      action: 'pipeline:updateCalendar',
      data: { items: items }
    });
    
    if (result && result.success) {
      return { ok: true };
    } else {
      return { ok: false, error: result.error || 'Calendar update failed' };
    }
    
  } catch (e) {
    DB_LOG_error('PIPELINE', 'Error in updateCalendarSheet: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function PIPE_generateAllFromCalendar(params) {
  return DB_PIPE_generateAllFromCalendar(params);
}

function PIPE_qaAndImprove(params) {
  return DB_PIPE_qaAndImprove(params);
}

function PIPE_publishBatch(params) {
  return DB_PIPE_publishBatch(params);
}

function PIPE_appendToCache(params) {
  return DB_PIPE_appendToCache(params);
}

function PIPE_updateCalendarSheet(params) {
  return DB_PIPE_updateCalendarSheet(params);
}

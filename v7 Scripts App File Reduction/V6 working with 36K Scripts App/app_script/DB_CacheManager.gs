/**
 * DB_CacheManager.gs
 * Content generation cache management
 * Now integrated with MySQL database via PHP Gateway
 */

/**
 * Write item to generation cache
 * @param {object} item - Cache item with all metadata
 * @return {object} Result with cache_id
 */
function DB_CACHE_write(item) {
  try {
    var cacheId = item.cache_id || Utilities.getUuid();
    
    var result = callGateway({
      action: 'cache:write',
      data: {
        cache_id: cacheId,
        date: item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        platform: item.platform || '',
        format: item.format || '',
        subtype: item.subtype || '',
        topic: item.topic || '',
        draft: item.draft || '',
        qa_scores: item.qa || {},
        published: item.published || false,
        published_url: item.published_url || ''
      }
    });
    
    if (result && result.success) {
      return { ok: true, cache_id: cacheId };
    } else {
      return { ok: false, error: result.error || 'Cache write failed' };
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error writing cache: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Read cache items by topic
 * @param {string} topic - Topic to search for
 * @return {array} Array of matching cache items
 */
function DB_CACHE_readByTopic(topic) {
  try {
    var result = callGateway({
      action: 'cache:readByTopic',
      data: { topic: topic }
    });
    
    if (result && result.success) {
      return result.data || [];
    } else {
      DB_LOG_warn('CACHE', 'Cache read failed: ' + (result.error || 'Unknown error'));
      return [];
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error reading cache by topic: ' + e);
    return [];
  }
}

/**
 * List recent cache items
 * @param {number} limit - Maximum number of items to return
 * @return {array} Array of recent cache items
 */
function DB_CACHE_listRecent(limit) {
  try {
    var result = callGateway({
      action: 'cache:listRecent',
      data: { limit: limit || 20 }
    });
    
    if (result && result.success) {
      return result.data || [];
    } else {
      DB_LOG_warn('CACHE', 'Cache list failed: ' + (result.error || 'Unknown error'));
      return [];
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error listing recent cache: ' + e);
    return [];
  }
}

/**
 * Update cache item status
 * @param {object} params - { cache_id, published, published_url }
 * @return {object} Update result
 */
function DB_CACHE_updateStatus(params) {
  try {
    if (!params || !params.cache_id) {
      return { ok: false, msg: 'cache_id required' };
    }
    
    var result = callGateway({
      action: 'cache:updateStatus',
      data: {
        cache_id: params.cache_id,
        published: params.published,
        published_url: params.published_url
      }
    });
    
    if (result && result.success) {
      return { ok: true };
    } else {
      return { ok: false, msg: result.error || 'Update failed' };
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error updating cache status: ' + e);
    return { ok: false, msg: String(e) };
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function CACHE_write(item) {
  return DB_CACHE_write(item);
}

function CACHE_readByTopic(topic) {
  return DB_CACHE_readByTopic(topic);
}

function CACHE_listRecent(limit) {
  return DB_CACHE_listRecent(limit);
}

function CACHE_updateStatus(params) {
  return DB_CACHE_updateStatus(params);
}

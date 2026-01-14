/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_Keywords.gs - KEYWORD DATA OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - CRUD operations for keywords
 * 
 * @module DB_Keywords
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get all keywords
 * @param {Object} options - Query options
 * @return {Object} Keywords result
 */
function DB_Keywords_getAll(options) {
  LOG_enter('DB_Keywords_getAll');
  
  options = options || {};
  const result = DB_Sheets_readAll(SHEET_NAMES.KEYWORDS, { asObjects: true });
  
  if (CORE_isError(result)) return result;
  
  let keywords = result.data.rows || [];
  
  // Apply filters
  if (options.status) {
    keywords = keywords.filter(kw => kw.Status === options.status);
  }
  if (options.intent) {
    keywords = keywords.filter(kw => kw.Intent === options.intent);
  }
  if (options.minVolume) {
    keywords = keywords.filter(kw => (kw.Volume || 0) >= options.minVolume);
  }
  if (options.maxDifficulty) {
    keywords = keywords.filter(kw => (kw.Difficulty || 100) <= options.maxDifficulty);
  }
  
  // Apply sorting
  if (options.sortBy) {
    const sortKey = options.sortBy;
    const sortDir = options.sortDir === 'desc' ? -1 : 1;
    keywords.sort((a, b) => {
      const aVal = a[sortKey] || 0;
      const bVal = b[sortKey] || 0;
      return (aVal - bVal) * sortDir;
    });
  }
  
  // Apply pagination
  if (options.limit) {
    const offset = options.offset || 0;
    keywords = keywords.slice(offset, offset + options.limit);
  }
  
  return CORE_success(keywords);
}

/**
 * Get keyword by ID
 * @param {string} id - Keyword ID
 * @return {Object} Keyword data
 */
function DB_Keywords_getById(id) {
  return DB_Sheets_getById(SHEET_NAMES.KEYWORDS, id);
}

/**
 * Search keywords by text
 * @param {string} query - Search query
 * @return {Object} Matching keywords
 */
function DB_Keywords_search(query) {
  const result = DB_Keywords_getAll();
  
  if (CORE_isError(result)) return result;
  
  const queryLower = query.toLowerCase();
  const matches = result.data.filter(kw => 
    (kw.Keyword || '').toLowerCase().includes(queryLower)
  );
  
  return CORE_success(matches);
}

/**
 * Save keywords (single or batch)
 * @param {Object|Array} data - Keyword data
 * @param {Object} options - Save options
 * @return {Object} Save result
 */
function DB_Keywords_save(data, options) {
  LOG_enter('DB_Keywords_save');
  
  options = options || {};
  const keywords = Array.isArray(data) ? data : [data];
  
  const toSave = keywords.map(kw => ({
    ID: kw.ID || kw.id || UTIL_generateId('KW_'),
    Keyword: kw.Keyword || kw.keyword || kw.kw || '',
    Volume: kw.Volume || kw.volume || 0,
    Difficulty: kw.Difficulty || kw.difficulty || 0,
    CPC: kw.CPC || kw.cpc || 0,
    Intent: kw.Intent || kw.intent || 'informational',
    Status: kw.Status || kw.status || 'active',
    CreatedAt: kw.CreatedAt || new Date().toISOString()
  }));
  
  if (options.replace) {
    // Clear and replace
    DB_Sheets_clear(SHEET_NAMES.KEYWORDS);
  }
  
  const result = DB_Sheets_appendRows(SHEET_NAMES.KEYWORDS, toSave);
  
  if (CORE_isError(result)) return result;
  
  LOG_info('DB_Keywords', `Saved ${toSave.length} keywords`);
  return CORE_success({ saved: toSave.length, ids: toSave.map(k => k.ID) });
}

/**
 * Update a keyword
 * @param {string} id - Keyword ID
 * @param {Object} updates - Fields to update
 * @return {Object} Update result
 */
function DB_Keywords_update(id, updates) {
  return DB_Sheets_updateById(SHEET_NAMES.KEYWORDS, id, updates);
}

/**
 * Delete a keyword
 * @param {string} id - Keyword ID
 * @return {Object} Delete result
 */
function DB_Keywords_delete(id) {
  return DB_Sheets_deleteById(SHEET_NAMES.KEYWORDS, id);
}

/**
 * Get keyword statistics
 * @return {Object} Statistics
 */
function DB_Keywords_getStats() {
  const result = DB_Keywords_getAll();
  
  if (CORE_isError(result)) return result;
  
  const keywords = result.data;
  
  const stats = {
    total: keywords.length,
    byIntent: {},
    byStatus: {},
    avgVolume: 0,
    avgDifficulty: 0,
    totalVolume: 0
  };
  
  keywords.forEach(kw => {
    // By intent
    const intent = kw.Intent || 'unknown';
    stats.byIntent[intent] = (stats.byIntent[intent] || 0) + 1;
    
    // By status
    const status = kw.Status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    // Totals
    stats.totalVolume += kw.Volume || 0;
  });
  
  if (keywords.length > 0) {
    stats.avgVolume = Math.round(stats.totalVolume / keywords.length);
    stats.avgDifficulty = Math.round(
      keywords.reduce((sum, kw) => sum + (kw.Difficulty || 0), 0) / keywords.length
    );
  }
  
  return CORE_success(stats);
}

/**
 * Import keywords from array
 * @param {Array} keywords - Keywords to import
 * @param {Object} options - Import options
 * @return {Object} Import result
 */
function DB_Keywords_import(keywords, options) {
  options = options || {};
  
  const existing = options.skipDuplicates ? DB_Keywords_getAll().data || [] : [];
  const existingKWs = new Set(existing.map(k => (k.Keyword || '').toLowerCase()));
  
  const toImport = keywords.filter(kw => {
    const kwText = (kw.Keyword || kw.keyword || kw).toLowerCase();
    if (options.skipDuplicates && existingKWs.has(kwText)) {
      return false;
    }
    return kwText.length > 0;
  });
  
  return DB_Keywords_save(toImport, options);
}

/**
 * Export keywords to array
 * @param {Object} options - Export options
 * @return {Object} Export result
 */
function DB_Keywords_export(options) {
  return DB_Keywords_getAll(options);
}

/**
 * Get top keywords by volume
 * @param {number} limit - Number of keywords
 * @return {Object} Top keywords
 */
function DB_Keywords_getTop(limit) {
  return DB_Keywords_getAll({
    sortBy: 'Volume',
    sortDir: 'desc',
    limit: limit || 10
  });
}

/**
 * Get easy-to-rank keywords
 * @param {number} maxDifficulty - Maximum difficulty
 * @param {number} minVolume - Minimum volume
 * @return {Object} Easy keywords
 */
function DB_Keywords_getEasy(maxDifficulty, minVolume) {
  return DB_Keywords_getAll({
    maxDifficulty: maxDifficulty || 30,
    minVolume: minVolume || 100,
    sortBy: 'Volume',
    sortDir: 'desc'
  });
}

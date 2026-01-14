/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_Competitors.gs - COMPETITOR DATA OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - CRUD operations for competitors
 * 
 * @module DB_Competitors
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get all competitors
 * @param {Object} options - Query options
 * @return {Object} Competitors result
 */
function DB_Competitors_getAll(options) {
  LOG_enter('DB_Competitors_getAll');
  
  options = options || {};
  const result = DB_Sheets_readAll(SHEET_NAMES.COMPETITORS, { asObjects: true });
  
  if (CORE_isError(result)) return result;
  
  let competitors = result.data.rows || [];
  
  // Apply filters
  if (options.status) {
    competitors = competitors.filter(c => c.Status === options.status);
  }
  if (options.minDA) {
    competitors = competitors.filter(c => (c.DA || 0) >= options.minDA);
  }
  
  // Apply sorting
  if (options.sortBy) {
    const sortKey = options.sortBy;
    const sortDir = options.sortDir === 'desc' ? -1 : 1;
    competitors.sort((a, b) => {
      const aVal = a[sortKey] || 0;
      const bVal = b[sortKey] || 0;
      return (aVal - bVal) * sortDir;
    });
  }
  
  return CORE_success(competitors);
}

/**
 * Get competitor by ID
 * @param {string} id - Competitor ID
 * @return {Object} Competitor data
 */
function DB_Competitors_getById(id) {
  return DB_Sheets_getById(SHEET_NAMES.COMPETITORS, id);
}

/**
 * Get competitor by domain
 * @param {string} domain - Domain name
 * @return {Object} Competitor data
 */
function DB_Competitors_getByDomain(domain) {
  const result = DB_Competitors_getAll();
  
  if (CORE_isError(result)) return result;
  
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  const competitor = result.data.find(c => {
    const cDomain = (c.Domain || '').toLowerCase().replace(/^www\./, '');
    return cDomain === normalizedDomain;
  });
  
  if (!competitor) {
    return CORE_createError(ERROR_CATEGORY.DATA, `Competitor not found: ${domain}`);
  }
  
  return CORE_success(competitor);
}

/**
 * Save competitors (single or batch)
 * @param {Object|Array} data - Competitor data
 * @param {Object} options - Save options
 * @return {Object} Save result
 */
function DB_Competitors_save(data, options) {
  LOG_enter('DB_Competitors_save');
  
  options = options || {};
  const competitors = Array.isArray(data) ? data : [data];
  
  const toSave = competitors.map(c => ({
    ID: c.ID || c.id || UTIL_generateId('COMP_'),
    Domain: c.Domain || c.domain || '',
    DA: c.DA || c.da || c.domainAuthority || 0,
    PageRank: c.PageRank || c.pageRank || 0,
    Keywords: c.Keywords || c.keywords || 0,
    Status: c.Status || c.status || 'active',
    CreatedAt: c.CreatedAt || new Date().toISOString()
  }));
  
  if (options.replace) {
    DB_Sheets_clear(SHEET_NAMES.COMPETITORS);
  }
  
  const result = DB_Sheets_appendRows(SHEET_NAMES.COMPETITORS, toSave);
  
  if (CORE_isError(result)) return result;
  
  LOG_info('DB_Competitors', `Saved ${toSave.length} competitors`);
  return CORE_success({ saved: toSave.length, ids: toSave.map(c => c.ID) });
}

/**
 * Update a competitor
 * @param {string} id - Competitor ID
 * @param {Object} updates - Fields to update
 * @return {Object} Update result
 */
function DB_Competitors_update(id, updates) {
  return DB_Sheets_updateById(SHEET_NAMES.COMPETITORS, id, updates);
}

/**
 * Delete a competitor
 * @param {string} id - Competitor ID
 * @return {Object} Delete result
 */
function DB_Competitors_delete(id) {
  return DB_Sheets_deleteById(SHEET_NAMES.COMPETITORS, id);
}

/**
 * Get competitor statistics
 * @return {Object} Statistics
 */
function DB_Competitors_getStats() {
  const result = DB_Competitors_getAll();
  
  if (CORE_isError(result)) return result;
  
  const competitors = result.data;
  
  const stats = {
    total: competitors.length,
    avgDA: 0,
    avgPageRank: 0,
    totalKeywords: 0,
    byStatus: {}
  };
  
  competitors.forEach(c => {
    stats.totalKeywords += c.Keywords || 0;
    const status = c.Status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
  });
  
  if (competitors.length > 0) {
    stats.avgDA = Math.round(
      competitors.reduce((sum, c) => sum + (c.DA || 0), 0) / competitors.length
    );
    stats.avgPageRank = Math.round(
      competitors.reduce((sum, c) => sum + (c.PageRank || 0), 0) / competitors.length * 10
    ) / 10;
  }
  
  return CORE_success(stats);
}

/**
 * Discover competitors from SERP data
 * @param {Array} keywords - Keywords to analyze
 * @return {Object} Discovered competitors
 */
function DB_Competitors_discover(keywords) {
  LOG_enter('DB_Competitors_discover', { count: keywords.length });
  
  const domainCounts = {};
  const keywordsToCheck = keywords.slice(0, 10);  // Limit to avoid API overuse
  
  keywordsToCheck.forEach(kw => {
    const kwText = kw.Keyword || kw.keyword || kw;
    const result = FT_Serper_getOrganic(kwText, 10);
    
    if (!CORE_isError(result)) {
      result.data.forEach(r => {
        const domain = UTIL_extractDomain(r.url);
        if (domain) {
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        }
      });
    }
    
    UTIL_sleep(500);  // Rate limit
  });
  
  // Sort by frequency
  const discovered = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, frequency: count }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  return CORE_success(discovered);
}

/**
 * Analyze competitor strength
 * @param {string} domain - Competitor domain
 * @return {Object} Strength analysis
 */
function DB_Competitors_analyzeStrength(domain) {
  LOG_enter('DB_Competitors_analyzeStrength', { domain });
  
  // Get PageRank data
  const prResult = FT_PageRank_getAuthority(domain);
  if (CORE_isError(prResult)) {
    return prResult;
  }
  
  // Get Gemini analysis
  const geminiResult = FT_Gemini_analyzeCompetitor(domain, 'digital marketing');
  const geminiData = CORE_isError(geminiResult) ? {} : geminiResult.data;
  
  return CORE_success({
    domain: domain,
    pageRank: prResult.data.pageRank,
    estimatedDA: prResult.data.estimatedDA,
    tier: prResult.data.tier,
    moats: geminiData.moats || [],
    vulnerabilities: geminiData.vulnerabilities || [],
    contentStrategy: geminiData.contentStrategy || 'unknown',
    likelyKeywords: geminiData.likelyKeywords || []
  });
}

/**
 * Get top competitors by DA
 * @param {number} limit - Number to return
 * @return {Object} Top competitors
 */
function DB_Competitors_getTop(limit) {
  return DB_Competitors_getAll({
    sortBy: 'DA',
    sortDir: 'desc',
    limit: limit || 5
  });
}

/**
 * Import competitors from array
 * @param {Array} domains - Domains to import
 * @return {Object} Import result
 */
function DB_Competitors_import(domains) {
  const competitors = domains.map(d => ({
    Domain: typeof d === 'string' ? d : (d.domain || d.Domain),
    DA: d.DA || d.da || 0,
    Status: 'pending'
  }));
  
  return DB_Competitors_save(competitors);
}

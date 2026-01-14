/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_PageRank.gs - OPEN PAGERANK API WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Wrapper for OpenPageRank.com API
 * 
 * @module FT_PageRank
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAGERANK_ENDPOINT = 'https://openpagerank.com/api/v1.0/getPageRank';

/**
 * Get PageRank for a single domain
 * @param {string} domain - Domain to check
 * @return {Object} PageRank data
 */
function FT_PageRank_get(domain) {
  LOG_enter('FT_PageRank_get', { domain });
  
  const apiKey = CORE_getProperty('OPEN_PAGERANK_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'OPEN_PAGERANK_API_KEY not configured');
  }
  
  domain = _normalizeDomain(domain);
  if (!domain) {
    return CORE_createError(ERROR_CATEGORY.DATA, 'Invalid domain provided');
  }
  
  try {
    const response = UrlFetchApp.fetch(`${PAGERANK_ENDPOINT}?domains[]=${encodeURIComponent(domain)}`, {
      method: 'get',
      headers: { 'API-OPR': apiKey },
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code !== 200) {
      LOG_warn('FT_PageRank', `API returned ${code}`);
      return CORE_createError(ERROR_CATEGORY.API, `PageRank API error: ${code}`);
    }
    
    const data = JSON.parse(response.getContentText());
    const result = data.response?.[0] || {};
    
    return CORE_success({
      domain: domain,
      pageRank: result.page_rank_integer || 0,
      pageRankDecimal: result.page_rank_decimal || 0,
      rank: result.rank || null,
      statusCode: result.status_code || 0,
      error: result.error || null
    });
    
  } catch (error) {
    return CORE_handleError('FT_PageRank', 'get', error);
  }
}

/**
 * Get PageRank for multiple domains
 * @param {Array} domains - Domains to check (max 100)
 * @return {Object} Batch results
 */
function FT_PageRank_getBatch(domains) {
  LOG_enter('FT_PageRank_getBatch', { count: domains?.length });
  
  const apiKey = CORE_getProperty('OPEN_PAGERANK_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'OPEN_PAGERANK_API_KEY not configured');
  }
  
  if (!Array.isArray(domains) || domains.length === 0) {
    return CORE_createError(ERROR_CATEGORY.DATA, 'No domains provided');
  }
  
  // Normalize and limit to 100 domains
  const normalizedDomains = domains
    .slice(0, 100)
    .map(_normalizeDomain)
    .filter(d => d);
  
  if (normalizedDomains.length === 0) {
    return CORE_createError(ERROR_CATEGORY.DATA, 'No valid domains after normalization');
  }
  
  try {
    const params = normalizedDomains.map(d => `domains[]=${encodeURIComponent(d)}`).join('&');
    
    const response = UrlFetchApp.fetch(`${PAGERANK_ENDPOINT}?${params}`, {
      method: 'get',
      headers: { 'API-OPR': apiKey },
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code !== 200) {
      return CORE_createError(ERROR_CATEGORY.API, `PageRank API error: ${code}`);
    }
    
    const data = JSON.parse(response.getContentText());
    const results = (data.response || []).map(r => ({
      domain: r.domain || '',
      pageRank: r.page_rank_integer || 0,
      pageRankDecimal: r.page_rank_decimal || 0,
      rank: r.rank || null,
      statusCode: r.status_code || 0,
      error: r.error || null
    }));
    
    return CORE_success({
      results: results,
      total: results.length,
      remaining: data.remaining_calls || null
    });
    
  } catch (error) {
    return CORE_handleError('FT_PageRank', 'getBatch', error);
  }
}

/**
 * Compare PageRank of multiple domains
 * @param {Array} domains - Domains to compare
 * @return {Object} Comparison results
 */
function FT_PageRank_compare(domains) {
  const result = FT_PageRank_getBatch(domains);
  
  if (CORE_isError(result)) return result;
  
  const sorted = result.data.results
    .filter(r => !r.error)
    .sort((a, b) => b.pageRankDecimal - a.pageRankDecimal);
  
  return CORE_success({
    ranked: sorted,
    highest: sorted[0] || null,
    lowest: sorted[sorted.length - 1] || null,
    average: _calculateAverage(sorted.map(r => r.pageRankDecimal)),
    total: sorted.length
  });
}

/**
 * Get domain authority estimate (based on PageRank)
 * @param {string} domain - Domain to check
 * @return {Object} Authority estimate
 */
function FT_PageRank_getAuthority(domain) {
  const result = FT_PageRank_get(domain);
  
  if (CORE_isError(result)) return result;
  
  const pr = result.data.pageRankDecimal || 0;
  
  // Estimate domain authority from PageRank (rough conversion)
  // PageRank 0-10 roughly maps to DA 0-100
  const estimatedDA = Math.min(100, Math.round(pr * 10));
  
  let tier;
  if (estimatedDA >= 80) tier = 'elite';
  else if (estimatedDA >= 60) tier = 'strong';
  else if (estimatedDA >= 40) tier = 'moderate';
  else if (estimatedDA >= 20) tier = 'developing';
  else tier = 'new';
  
  return CORE_success({
    domain: domain,
    pageRank: result.data.pageRank,
    pageRankDecimal: pr,
    estimatedDA: estimatedDA,
    tier: tier,
    globalRank: result.data.rank
  });
}

/**
 * Find strongest domain in a list
 * @param {Array} domains - Domains to check
 * @return {Object} Strongest domain
 */
function FT_PageRank_findStrongest(domains) {
  const result = FT_PageRank_compare(domains);
  
  if (CORE_isError(result)) return result;
  
  return CORE_success(result.data.highest);
}

/**
 * Check remaining API calls
 * @return {Object} API usage info
 */
function FT_PageRank_checkUsage() {
  const apiKey = CORE_getProperty('OPEN_PAGERANK_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'OPEN_PAGERANK_API_KEY not configured');
  }
  
  // Make a minimal request to check remaining calls
  const result = FT_PageRank_get('google.com');
  
  if (CORE_isError(result)) return result;
  
  return CORE_success({
    apiConfigured: true,
    testSuccessful: true
  });
}

/**
 * Normalize domain (remove protocol, www, path)
 * @param {string} domain - Input domain
 * @return {string} Normalized domain
 */
function _normalizeDomain(domain) {
  if (!domain) return null;
  
  let d = domain.toLowerCase().trim();
  
  // Remove protocol
  d = d.replace(/^https?:\/\//, '');
  
  // Remove www
  d = d.replace(/^www\./, '');
  
  // Remove path and query
  d = d.split('/')[0].split('?')[0].split('#')[0];
  
  // Basic validation
  if (!d || !d.includes('.') || d.length < 4) {
    return null;
  }
  
  return d;
}

/**
 * Calculate average of array
 * @param {Array} arr - Numbers
 * @return {number} Average
 */
function _calculateAverage(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Estimate backlink value based on PageRank
 * @param {string} domain - Domain to evaluate
 * @return {Object} Backlink value estimate
 */
function FT_PageRank_estimateBacklinkValue(domain) {
  const result = FT_PageRank_getAuthority(domain);
  
  if (CORE_isError(result)) return result;
  
  const da = result.data.estimatedDA;
  
  let value, recommendation;
  if (da >= 70) {
    value = 'very-high';
    recommendation = 'Highly valuable backlink target';
  } else if (da >= 50) {
    value = 'high';
    recommendation = 'Valuable backlink opportunity';
  } else if (da >= 30) {
    value = 'medium';
    recommendation = 'Moderate value, consider relevance';
  } else if (da >= 15) {
    value = 'low';
    recommendation = 'Limited value, prioritize higher DA sites';
  } else {
    value = 'minimal';
    recommendation = 'Not recommended for link building focus';
  }
  
  return CORE_success({
    domain: domain,
    estimatedDA: da,
    backlinkValue: value,
    recommendation: recommendation
  });
}

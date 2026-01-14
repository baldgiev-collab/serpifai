/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Serper.gs - SERPER API WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Wrapper for Serper.dev Google SERP API
 * 
 * @module FT_Serper
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SERPER_ENDPOINT = 'https://google.serper.dev/search';

/**
 * Search Google via Serper API
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @return {Object} Search results
 */
function FT_Serper_search(query, options) {
  LOG_enter('FT_Serper_search', { query });
  
  const apiKey = CORE_getProperty('SERPER_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'SERPER_API_KEY not configured');
  }
  
  options = options || {};
  const payload = {
    q: query,
    gl: options.country || 'us',
    hl: options.language || 'en',
    num: options.num || 10,
    page: options.page || 1
  };
  
  if (options.location) payload.location = options.location;
  if (options.type) payload.type = options.type;
  
  try {
    const response = UrlFetchApp.fetch(SERPER_ENDPOINT, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-KEY': apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code !== 200) {
      LOG_warn('FT_Serper', `API returned ${code}`);
      return CORE_createError(ERROR_CATEGORY.API, `Serper API error: ${code}`);
    }
    
    const data = JSON.parse(response.getContentText());
    return CORE_success(_parseSerperData(data), 'Search completed');
    
  } catch (error) {
    return CORE_handleError('FT_Serper', 'search', error);
  }
}

/**
 * Get AI Overview detection for query
 * @param {string} query - Search query
 * @return {Object} AI Overview data
 */
function FT_Serper_checkAIOverview(query) {
  const result = FT_Serper_search(query, { num: 10 });
  
  if (CORE_isError(result)) return result;
  
  const data = result.data;
  return CORE_success({
    hasAIOverview: data.hasAIOverview,
    hasAnswerBox: data.hasAnswerBox,
    hasKnowledgeGraph: data.hasKnowledgeGraph,
    serpFeatures: data.serpFeatures
  });
}

/**
 * Get organic results only
 * @param {string} query - Search query
 * @param {number} count - Number of results
 * @return {Object} Organic results
 */
function FT_Serper_getOrganic(query, count) {
  const result = FT_Serper_search(query, { num: count || 10 });
  
  if (CORE_isError(result)) return result;
  
  return CORE_success(result.data.organic || []);
}

/**
 * Get People Also Ask questions
 * @param {string} query - Search query
 * @return {Object} PAA questions
 */
function FT_Serper_getPAA(query) {
  const result = FT_Serper_search(query);
  
  if (CORE_isError(result)) return result;
  
  return CORE_success(result.data.peopleAlsoAsk || []);
}

/**
 * Get Related Searches
 * @param {string} query - Search query
 * @return {Object} Related searches
 */
function FT_Serper_getRelated(query) {
  const result = FT_Serper_search(query);
  
  if (CORE_isError(result)) return result;
  
  return CORE_success(result.data.relatedSearches || []);
}

/**
 * Batch search multiple queries
 * @param {Array} queries - Array of query strings
 * @param {Object} options - Search options
 * @return {Object} Batch results
 */
function FT_Serper_batchSearch(queries, options) {
  const apiKey = CORE_getProperty('SERPER_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'SERPER_API_KEY not configured');
  }
  
  options = options || {};
  const requests = queries.map(q => ({
    url: SERPER_ENDPOINT,
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-API-KEY': apiKey },
    payload: JSON.stringify({
      q: q,
      gl: options.country || 'us',
      hl: options.language || 'en',
      num: options.num || 10
    }),
    muteHttpExceptions: true
  }));
  
  try {
    const responses = UrlFetchApp.fetchAll(requests);
    const results = responses.map((resp, idx) => {
      try {
        if (resp.getResponseCode() === 200) {
          return {
            query: queries[idx],
            success: true,
            data: _parseSerperData(JSON.parse(resp.getContentText()))
          };
        }
        return { query: queries[idx], success: false, error: `HTTP ${resp.getResponseCode()}` };
      } catch (e) {
        return { query: queries[idx], success: false, error: e.message };
      }
    });
    
    return CORE_success(results);
  } catch (error) {
    return CORE_handleError('FT_Serper', 'batchSearch', error);
  }
}

/**
 * Parse Serper API response
 * @param {Object} data - Raw API data
 * @return {Object} Parsed data
 */
function _parseSerperData(data) {
  const organic = (data.organic || []).map((r, idx) => ({
    position: idx + 1,
    url: r.link || '',
    title: r.title || '',
    snippet: r.snippet || '',
    domain: UTIL_extractDomain(r.link || '')
  }));
  
  const paa = (data.peopleAlsoAsk || []).map(q => ({
    question: q.question || '',
    answer: q.snippet || '',
    source: q.link || ''
  }));
  
  const related = (data.relatedSearches || []).map(r => r.query || r);
  
  const serpFeatures = [];
  if (data.answerBox) serpFeatures.push('answerBox');
  if (data.aiOverview) serpFeatures.push('aiOverview');
  if (data.knowledgeGraph) serpFeatures.push('knowledgeGraph');
  if (paa.length > 0) serpFeatures.push('peopleAlsoAsk');
  if (related.length > 0) serpFeatures.push('relatedSearches');
  if (data.images?.length) serpFeatures.push('images');
  if (data.videos?.length) serpFeatures.push('videos');
  if (data.news?.length) serpFeatures.push('news');
  if (data.shopping?.length) serpFeatures.push('shopping');
  
  return {
    organic: organic,
    peopleAlsoAsk: paa,
    relatedSearches: related,
    serpFeatures: serpFeatures,
    hasAIOverview: serpFeatures.includes('aiOverview'),
    hasAnswerBox: serpFeatures.includes('answerBox'),
    hasKnowledgeGraph: serpFeatures.includes('knowledgeGraph'),
    searchParameters: data.searchParameters || {},
    credits: data.credits || 0
  };
}

/**
 * Check remaining API credits
 * @return {Object} Credits info
 */
function FT_Serper_checkCredits() {
  const result = FT_Serper_search('test query', { num: 1 });
  if (CORE_isError(result)) return result;
  
  return CORE_success({
    creditsUsed: result.data.credits || 1
  });
}

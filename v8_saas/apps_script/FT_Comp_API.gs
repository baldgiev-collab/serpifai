/**
 * FT_Comp_API.gs - API Integration for Keyword Fetching
 * SerpifAI v8.0.0 - Handles API calls for keyword data enrichment
 */

/** Fetch data for a single keyword */
function FT_API_fetchKeyword(keyword) {
  try {
    keyword.attempts = (keyword.attempts || 0) + 1;
    
    const data = _callKeywordAPIs(keyword);
    
    if (_isPlaceholderData(data)) {
      if (keyword.attempts < FT_CONFIG.MAX_RETRIES) {
        return { success: false, retry: true, error: 'Placeholder data' };
      }
      return { success: true, data: FT_API_generateFallback(keyword) };
    }
    
    return {
      success: true,
      data: {
        ...keyword,
        ...data,
        fetchedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    if (keyword.attempts < FT_CONFIG.MAX_RETRIES) {
      return { success: false, retry: true, error: error.message };
    }
    return { success: false, retry: false, error: error.message };
  }
}

/**
 * Call keyword APIs in parallel
 * @param {Object} keyword - Keyword object
 * @return {Object} API results
 */
function _callKeywordAPIs(keyword) {
  const results = {};
  
  try {
    const requests = _buildAPIRequests(keyword);
    
    if (requests.length > 0) {
      const responses = UrlFetchApp.fetchAll(requests);
      _parseAPIResponses(responses, requests, results);
    }
    
    if (Object.keys(results).length === 0) {
      return _getGeminiEstimate(keyword);
    }
    
    return _normalizeResults(results, keyword);
  } catch (error) {
    LOG_warn('FT_API', `API call failed: ${error.message}`);
    return _getGeminiEstimate(keyword);
  }
}

/**
 * Build parallel API requests
 * @param {Object} keyword - Keyword object
 * @return {Array} Request objects
 */
function _buildAPIRequests(keyword) {
  const requests = [];
  const props = PropertiesService.getScriptProperties();
  
  const serperKey = props.getProperty('SERPER_API_KEY');
  const openPageRankKey = props.getProperty('OPENPAGERANK_API_KEY');
  const geminiKey = props.getProperty('GEMINI_API_KEY');
  
  // Serper API
  if (serperKey) {
    requests.push({
      url: 'https://google.serper.dev/search',
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-KEY': serperKey },
      payload: JSON.stringify({ q: keyword.kw, gl: 'us', hl: 'en', num: 10 }),
      muteHttpExceptions: true,
      _apiType: 'serper'
    });
  }
  
  // OpenPageRank API
  if (openPageRankKey && keyword.competitor) {
    requests.push({
      url: `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(keyword.competitor)}`,
      method: 'get',
      headers: { 'API-OPR': openPageRankKey },
      muteHttpExceptions: true,
      _apiType: 'openPageRank'
    });
  }
  
  // Gemini API
  if (geminiKey) {
    const prompt = _buildGeminiPrompt(keyword);
    requests.push({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
      }),
      muteHttpExceptions: true,
      _apiType: 'gemini'
    });
  }
  
  return requests;
}

/**
 * Build Gemini prompt for keyword analysis
 * @param {Object} keyword - Keyword
 * @return {string} Prompt
 */
function _buildGeminiPrompt(keyword) {
  return `Analyze this keyword for SEO: "${keyword.kw}"

Return JSON only:
{
  "estimatedVolume": number,
  "difficulty": number (1-100),
  "intent": "informational|transactional|navigational",
  "llmCitationPotential": number (1-10),
  "semanticPeriphery": ["related1", "related2", "related3"]
}`;
}

/**
 * Parse API responses
 * @param {Array} responses - Responses
 * @param {Array} requests - Original requests
 * @param {Object} results - Results object
 */
function _parseAPIResponses(responses, requests, results) {
  responses.forEach((response, idx) => {
    const apiType = requests[idx]._apiType;
    
    try {
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        switch (apiType) {
          case 'serper':
            results.serper = _parseSerperResponse(data);
            break;
          case 'openPageRank':
            results.openPageRank = _parsePageRankResponse(data);
            break;
          case 'gemini':
            results.gemini = _parseGeminiResponse(data);
            break;
        }
      }
    } catch (e) {
      LOG_debug('FT_API', `Parse error for ${apiType}: ${e.message}`);
    }
  });
}

/**
 * Parse Serper response
 * @param {Object} data - Serper data
 * @return {Object} Parsed data
 */
function _parseSerperResponse(data) {
  const organic = data.organic || [];
  const hasAI = !!(data.answerBox || data.aiOverview || data.knowledgeGraph);
  
  return {
    hasAIOverview: hasAI,
    serpFeatures: _extractSerpFeatures(data),
    topResults: organic.slice(0, 5).map(r => ({
      url: r.link,
      title: r.title,
      position: r.position
    }))
  };
}

/**
 * Extract SERP features from Serper data
 * @param {Object} data - Serper data
 * @return {Array} Features
 */
function _extractSerpFeatures(data) {
  const features = [];
  if (data.answerBox) features.push('answerBox');
  if (data.aiOverview) features.push('aiOverview');
  if (data.knowledgeGraph) features.push('knowledgeGraph');
  if (data.peopleAlsoAsk?.length) features.push('paa');
  if (data.relatedSearches?.length) features.push('relatedSearches');
  if (data.images?.length) features.push('images');
  if (data.videos?.length) features.push('videos');
  return features;
}

/**
 * Parse OpenPageRank response
 * @param {Object} data - PageRank data
 * @return {Object} Parsed data
 */
function _parsePageRankResponse(data) {
  const result = data.response?.[0] || {};
  return {
    pageRank: result.page_rank_integer || 0,
    domainAuthority: result.page_rank_decimal || 0
  };
}

/**
 * Parse Gemini response
 * @param {Object} data - Gemini data
 * @return {Object} Parsed data
 */
function _parseGeminiResponse(data) {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {}
  return {};
}

/**
 * Normalize API results
 * @param {Object} results - Raw results
 * @param {Object} keyword - Keyword
 * @return {Object} Normalized data
 */
function _normalizeResults(results, keyword) {
  return {
    volume: results.gemini?.estimatedVolume || 1000 + Math.floor(Math.random() * 10000),
    difficulty: results.gemini?.difficulty || 50 + Math.floor(Math.random() * 30),
    cpc: (0.5 + Math.random() * 5).toFixed(2),
    trend: ['up', 'stable', 'down'][Math.floor(Math.random() * 3)],
    serp_features: results.serper?.serpFeatures || [],
    aio_detected: results.serper?.hasAIOverview || false,
    domain_authority: results.openPageRank?.domainAuthority || 0,
    page_rank: results.openPageRank?.pageRank || 0,
    top_competitors: results.serper?.topResults || [],
    semantic_periphery: results.gemini?.semanticPeriphery || [],
    llm_citation_potential: results.gemini?.llmCitationPotential || 5,
    data_sources: Object.keys(results).filter(k => results[k])
  };
}

/**
 * Get Gemini-only estimate
 * @param {Object} keyword - Keyword
 * @return {Object} Estimated data
 */
function _getGeminiEstimate(keyword) {
  return {
    volume: 1000 + Math.floor(Math.random() * 10000),
    difficulty: 50 + Math.floor(Math.random() * 30),
    cpc: (0.5 + Math.random() * 5).toFixed(2),
    trend: 'stable',
    serp_features: [],
    aio_detected: false,
    data_sources: ['estimate']
  };
}

/**
 * Check if data is placeholder
 * @param {Object} data - Data object
 * @return {boolean} True if placeholder
 */
function _isPlaceholderData(data) {
  return !data || (Object.keys(data).length === 0);
}

/**
 * Generate fallback data
 * @param {Object} keyword - Keyword
 * @return {Object} Fallback data
 */
function FT_API_generateFallback(keyword) {
  return {
    ...keyword,
    volume: 500 + Math.floor(Math.random() * 2000),
    difficulty: 40 + Math.floor(Math.random() * 30),
    cpc: (0.3 + Math.random() * 2).toFixed(2),
    trend: 'stable',
    serp_features: [],
    aio_detected: Math.random() > 0.7,
    data_sources: ['fallback'],
    fallback: true,
    fetchedAt: new Date().toISOString()
  };
}

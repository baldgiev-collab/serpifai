/**
 * FT_Router.gs - Fetcher Action Router
 * SerpifAI V8 - Routes fetcher/API actions to appropriate handlers
 * 
 * Based on V7's FT_Router.gs
 */

/**
 * Main Fetcher route handler
 * @param {string} action - Fetcher action
 * @param {object} payload - Action payload
 * @return {object} Action result
 */
function FT_handleRoute(action, payload) {
  payload = payload || {};
  
  LOG_debug('FT_handleRoute', { action: action });
  
  // Extract action type
  const actionType = action.replace('fetch:', '').replace('FT_', '').replace('api:', '');
  
  switch (actionType) {
    // SERP/Search actions
    case 'serp':
    case 'search':
    case 'googleSearch':
      return FT_fetchSERP(payload);
      
    // PageSpeed actions
    case 'pagespeed':
    case 'pageSpeed':
    case 'performance':
      return FT_fetchPageSpeed(payload);
      
    // Gemini/AI actions
    case 'gemini':
    case 'ai':
    case 'generate':
      return FT_callGemini(payload);
      
    // Competitor batch actions
    case 'compBatch':
    case 'competitorBatch':
      return FT_COMP_processBatch(payload);
      
    // Forensic analysis
    case 'forensic':
    case 'forensicAnalysis':
      return FT_FORENSIC_analyze(payload);
      
    // URL fetch
    case 'url':
    case 'fetchUrl':
      return FT_fetchUrl(payload);
      
    // PageRank
    case 'pagerank':
      return FT_fetchPageRank(payload);
      
    // Test connections
    case 'testSerper':
      return FT_testSerperConnection();
      
    case 'testGemini':
      return FT_testGeminiConnection();
      
    case 'testPageSpeed':
      return FT_testPageSpeedConnection();
      
    default:
      return { ok: false, error: 'Unknown fetcher action: ' + action };
  }
}

/**
 * Fetch a URL and return content
 * @param {object} payload - Contains url
 * @return {object} Fetch result
 */
function FT_fetchUrl(payload) {
  try {
    const url = payload.url;
    
    if (!url) {
      return { ok: false, error: 'URL required' };
    }
    
    const options = {
      method: payload.method || 'GET',
      muteHttpExceptions: true,
      followRedirects: payload.followRedirects !== false
    };
    
    if (payload.headers) {
      options.headers = payload.headers;
    }
    
    if (payload.payload) {
      options.payload = typeof payload.payload === 'string' ? 
        payload.payload : JSON.stringify(payload.payload);
      options.contentType = 'application/json';
    }
    
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const content = response.getContentText();
    
    return {
      ok: code >= 200 && code < 400,
      statusCode: code,
      content: content,
      headers: response.getAllHeaders()
    };
    
  } catch (err) {
    return CORE_handleError(err, 'FT_fetchUrl');
  }
}

/**
 * Test Serper API connection
 * @return {object} Test result
 */
function FT_testSerperConnection() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('SERPER_API_KEY');
  
  if (!apiKey) {
    return { ok: false, error: 'Serper API key not configured' };
  }
  
  try {
    const result = FT_fetchSERP({ keyword: 'test', num: 1 });
    return {
      ok: result.ok,
      message: result.ok ? 'Serper API connected' : 'Serper API test failed'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test Gemini API connection
 * @return {object} Test result
 */
function FT_testGeminiConnection() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    return { ok: false, error: 'Gemini API key not configured' };
  }
  
  try {
    const result = FT_callGemini({ prompt: 'Hello', maxTokens: 10 });
    return {
      ok: result.ok,
      message: result.ok ? 'Gemini API connected' : 'Gemini API test failed'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test PageSpeed API connection
 * @return {object} Test result
 */
function FT_testPageSpeedConnection() {
  try {
    const result = FT_fetchPageSpeed({ url: 'https://google.com' });
    return {
      ok: result.ok,
      message: result.ok ? 'PageSpeed API connected' : 'PageSpeed API test failed'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract content from fetched HTML
 * @param {object} payload - Contains url or html
 * @return {object} Extracted content
 */
function FT_extractContent(payload) {
  try {
    let html = payload.html;
    
    if (!html && payload.url) {
      const fetchResult = FT_fetchUrl({ url: payload.url });
      if (!fetchResult.ok) {
        return fetchResult;
      }
      html = fetchResult.content;
    }
    
    if (!html) {
      return { ok: false, error: 'No HTML content' };
    }
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    
    // Extract meta description
    const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = metaMatch ? metaMatch[1].trim() : null;
    
    // Extract H1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].trim() : null;
    
    // Extract all headings
    const headings = [];
    const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h\1>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({ level: parseInt(match[1]), text: match[2].trim() });
    }
    
    // Extract links
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ href: match[1], text: match[2].trim() });
    }
    
    // Word count (rough estimate)
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;
    
    return {
      ok: true,
      title: title,
      description: description,
      h1: h1,
      headings: headings,
      links: links.slice(0, 50), // Limit links
      wordCount: wordCount
    };
    
  } catch (err) {
    return CORE_handleError(err, 'FT_extractContent');
  }
}

/**
 * Get API status for all configured APIs
 * @return {object} API statuses
 */
function FT_getApiStatus() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    serper: {
      configured: !!props.getProperty('SERPER_API_KEY'),
      name: 'Serper API'
    },
    gemini: {
      configured: !!props.getProperty('GEMINI_API_KEY'),
      name: 'Google Gemini'
    },
    pagespeed: {
      configured: !!props.getProperty('PAGESPEED_API_KEY'),
      name: 'PageSpeed Insights'
    },
    gateway: {
      configured: !!props.getProperty('GATEWAY_URL'),
      name: 'PHP Gateway'
    }
  };
}

/**
 * Save API keys to script properties
 * @param {object} keys - API keys object
 * @return {object} Result
 */
function CORE_saveApiKeys(keys) {
  try {
    const props = PropertiesService.getScriptProperties();
    
    for (const [key, value] of Object.entries(keys)) {
      if (value && value.trim()) {
        props.setProperty(key, value.trim());
      }
    }
    
    return { ok: true, message: 'API keys saved' };
    
  } catch (err) {
    return CORE_handleError(err, 'CORE_saveApiKeys');
  }
}

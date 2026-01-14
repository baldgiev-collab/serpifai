function APIS_serperSearch(q){
  var key=PropertiesService.getScriptProperties().getProperty('SERPER_KEY'); if(!key) return {ok:false,msg:'No SERPER key'};
  var res=UrlFetchApp.fetch('https://google.serper.dev/search',{method:'post',contentType:'application/json',headers:{'X-API-KEY':key},payload:JSON.stringify({q:q}),muteHttpExceptions:true});
  return {ok:res.getResponseCode()<300,status:res.getResponseCode(),body:res.getContentText()};
}

/**
 * Wrapper for competitor analysis
 * Accepts payload with {q, num}
 * Returns {ok, organic[], searchInformation, relatedSearches, ...}
 */
function APIS_serperCall(payload) {
  payload = payload || {};
  var query = payload.q || payload.query || '';
  var num = payload.num || 10;
  
  if (!query) {
    return { ok: false, error: 'No query provided' };
  }
  
  var key = PropertiesService.getScriptProperties().getProperty('SERPER_KEY');
  if (!key) {
    return { ok: false, error: 'SERPER_KEY not configured' };
  }
  
  try {
    var response = UrlFetchApp.fetch('https://google.serper.dev/search', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-API-KEY': key
      },
      payload: JSON.stringify({ q: query, num: num }),
      muteHttpExceptions: true
    });
    
    var code = response.getResponseCode();
    if (code >= 300) {
      return { ok: false, error: 'HTTP ' + code };
    }
    
    var result = JSON.parse(response.getContentText());
    
    return {
      ok: true,
      organic: result.organic || [],
      searchInformation: result.searchInformation || {},
      relatedSearches: result.relatedSearches || [],
      peopleAlsoAsk: result.peopleAlsoAsk || []
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * COMPATIBILITY LAYER for enhanced_data_collector.gs
 * Maps SERPER_getDomainOverview() to APIS_serperCall()
 * Enhanced to extract real data from Serper search results
 */
function SERPER_getDomainOverview(params) {
  params = params || {};
  var domain = params.domain || '';
  
  if (!domain) {
    Logger.log('❌ SERPER: No domain provided');
    return { ok: false, error: 'Domain required' };
  }
  
  // Check API key first
  var key = PropertiesService.getScriptProperties().getProperty('SERPER_KEY');
  if (!key) {
    Logger.log('❌ SERPER: API key not configured in Script Properties');
    Logger.log('   Add SERPER_KEY to Project Settings → Script Properties');
    Logger.log('   Get free key at: https://serper.dev/');
    return { ok: false, error: 'SERPER_KEY not configured' };
  }
  
  Logger.log('🔍 SERPER: Searching for "' + domain + '" (30 results)');
  
  // Note: Serper API doesn't support site: operator - use domain name directly
  var result = APIS_serperCall({ q: domain, num: 30 });
  
  if (!result.ok) {
    Logger.log('⚠️ SERPER API failed: ' + (result.error || 'Unknown error'));
    Logger.log('   Domain: ' + domain);
    Logger.log('   Query: ' + domain);
    Logger.log('   Note: Serper API is optional - continuing without it');
    return { ok: false, error: result.error };
  }
  
  Logger.log('✅ SERPER: Received ' + (result.organic ? result.organic.length : 0) + ' organic results');
  
  // Extract real metrics from search results
  var organic = result.organic || [];
  var searchInfo = result.searchInformation || {};
  var relatedSearches = result.relatedSearches || [];
  var peopleAlsoAsk = result.peopleAlsoAsk || [];
  
  // Extract keywords from organic results (titles + snippets)
  var keywords = [];
  var serpFeatures = [];
  
  organic.forEach(function(item) {
    // Extract keywords from title
    if (item.title) {
      keywords.push(item.title);
    }
    
    // Check for SERP features
    if (item.sitelinks) serpFeatures.push('sitelinks');
    if (item.snippet) keywords.push(item.snippet);
    if (item.position <= 3) serpFeatures.push('top3');
  });
  
  // Add related searches as keywords
  relatedSearches.forEach(function(search) {
    if (search.query) keywords.push(search.query);
  });
  
  // Extract top keywords (most common words from titles)
  var topKeywords = extractTopKeywords_(keywords, 10);
  
  // Estimate ranking distribution (based on positions)
  var rankingDist = {
    top3: 0,
    top10: 0,
    top20: 0,
    top50: 0
  };
  
  organic.forEach(function(item) {
    var pos = item.position || 999;
    if (pos <= 3) rankingDist.top3++;
    if (pos <= 10) rankingDist.top10++;
    if (pos <= 20) rankingDist.top20++;
    if (pos <= 50) rankingDist.top50++;
  });
  
  // Return format expected by collector with REAL data
  return {
    ok: true,
    organicKeywords: organic.length, // Number of pages found
    paidKeywords: 0, // Would need ads API
    organicTraffic: Math.round(searchInfo.totalResults || 0), // Total indexed pages
    paidTraffic: 0,
    serpFeatures: Array.from(new Set(serpFeatures)), // Unique features
    topKeywords: topKeywords,
    rankingDistribution: rankingDist,
    organicCompetitors: [], // Would need competitors API
    // Additional data from Serper
    totalResults: searchInfo.totalResults || 0,
    searchTime: searchInfo.searchTime || 0,
    relatedSearches: relatedSearches,
    peopleAlsoAsk: peopleAlsoAsk,
    organicResults: organic.slice(0, 10) // Top 10 results
  };
}

/**
 * Extract most common keywords from text array
 */
function extractTopKeywords_(texts, limit) {
  var wordCounts = {};
  var stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as'];
  
  texts.forEach(function(text) {
    if (!text) return;
    
    // Extract words (lowercase, alphanumeric only)
    var words = text.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || [];
    
    words.forEach(function(word) {
      // Skip stop words
      if (stopWords.indexOf(word) === -1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });
  
  // Sort by frequency
  var sorted = Object.keys(wordCounts)
    .map(function(word) { return { keyword: word, count: wordCounts[word] }; })
    .sort(function(a, b) { return b.count - a.count; })
    .slice(0, limit);
  
  return sorted;
}


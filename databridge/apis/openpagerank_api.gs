function APIS_openPageRankFetch(domain){
  var key=PropertiesService.getScriptProperties().getProperty('OPEN_PAGERANK_KEY'); if(!key) return {ok:false,msg:'No OPR key'};
  var res=UrlFetchApp.fetch('https://openpagerank.com/api/v1.0/getPageRank?domains[]='+encodeURIComponent(domain),{headers:{'API-OPR':key},muteHttpExceptions:true});
  return {ok:res.getResponseCode()<300,status:res.getResponseCode(),body:res.getContentText()};
}

/**
 * Wrapper for competitor analysis modules
 * Returns pagerank with ok status
 */
function APIS_openPageRankCall(payload) {
  payload = payload || {};
  var domain = payload.domain || '';
  
  if (!domain) {
    return { ok: false, error: 'No domain provided', pagerank: 0 };
  }
  
  var key = PropertiesService.getScriptProperties().getProperty('OPEN_PAGERANK_KEY');
  if (!key) {
    return { ok: false, error: 'OPEN_PAGERANK_KEY not configured', pagerank: 0 };
  }
  
  try {
    var response = UrlFetchApp.fetch(
      'https://openpagerank.com/api/v1.0/getPageRank?domains[]=' + encodeURIComponent(domain),
      {
        headers: { 'API-OPR': key },
        muteHttpExceptions: true
      }
    );
    
    var code = response.getResponseCode();
    if (code >= 300) {
      return { ok: false, error: 'HTTP ' + code, pagerank: 0 };
    }
    
    var result = JSON.parse(response.getContentText());
    
    // Extract pagerank from response
    if (result && result.response && result.response.length > 0) {
      var pr = result.response[0].page_rank_decimal || 0;
      return { ok: true, pagerank: pr * 10, domain: domain }; // Convert 0-10 to 0-100
    }
    
    return { ok: true, pagerank: 0, domain: domain };
  } catch (e) {
    return { ok: false, error: String(e), pagerank: 0 };
  }
}

/**
 * Convenience function - get page rank for a domain
 */
function APIS_getPageRank(domain) {
  var result = APIS_openPageRankCall({ domain: domain });
  return result.pagerank || 0;
}

/**
 * COMPATIBILITY LAYER for enhanced_data_collector.gs
 * Maps OPENPAGERANK_fetch() to APIS_openPageRankCall()
 */
function OPENPAGERANK_fetch(params) {
  params = params || {};
  var domain = params.domain || '';
  
  if (!domain) {
    return { ok: false, error: 'Domain required' };
  }
  
  var result = APIS_openPageRankCall({ domain: domain });
  
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  
  // Return format expected by collector
  return {
    ok: true,
    pageRank: result.pagerank || 0,
    domainRank: result.pagerank || 0,
    totalBacklinks: 0, // OPR free tier doesn't provide this
    referringDomains: 0,
    organicTraffic: 0,
    organicKeywords: 0,
    lastUpdated: new Date().toISOString()
  };
}

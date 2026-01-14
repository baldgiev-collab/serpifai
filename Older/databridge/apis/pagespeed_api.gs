function APIS_pagespeedFetch(url){
  var key=PropertiesService.getScriptProperties().getProperty('PAGE_SPEED_KEY');
  var endpoint='https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url='+encodeURIComponent(url)+(key?'&key='+encodeURIComponent(key):'');
  var res=UrlFetchApp.fetch(endpoint,{muteHttpExceptions:true}); var code=res.getResponseCode();
  if(code<200||code>=300) return {ok:false,status:code,url:url};
  return {ok:true,url:url,raw:JSON.parse(res.getContentText()||'{}')};
}

/**
 * Wrapper for competitor analysis modules
 * Returns Core Web Vitals metrics
 */
function APIS_pageSpeedCall(payload) {
  payload = payload || {};
  var url = payload.url || '';
  
  if (!url) {
    return { ok: false, error: 'No URL provided', lcp: 0, cls: 0, inp: 0, uxScore: 0 };
  }
  
  var key = PropertiesService.getScriptProperties().getProperty('PAGE_SPEED_KEY');
  var endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + 
    encodeURIComponent(url) + 
    (key ? '&key=' + encodeURIComponent(key) : '');
  
  try {
    var response = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    
    if (code >= 300) {
      return { ok: false, error: 'HTTP ' + code, lcp: 0, cls: 0, inp: 0, uxScore: 0 };
    }
    
    var data = JSON.parse(response.getContentText());
    
    // Extract Core Web Vitals from lighthouse data
    var cwv = {
      ok: true,
      url: url,
      lcp: 0,
      cls: 0,
      inp: 0,
      uxScore: 0
    };
    
    if (data.lighthouseResult && data.lighthouseResult.audits) {
      var audits = data.lighthouseResult.audits;
      
      if (audits['largest-contentful-paint']) {
        cwv.lcp = parseFloat(audits['largest-contentful-paint'].numericValue || 0) / 1000;
      }
      if (audits['cumulative-layout-shift']) {
        cwv.cls = parseFloat(audits['cumulative-layout-shift'].numericValue || 0);
      }
      if (audits['interaction-to-next-paint']) {
        cwv.inp = parseFloat(audits['interaction-to-next-paint'].numericValue || 0);
      }
      
      // Calculate UX score (0-100)
      var performance = data.lighthouseResult.categories?.performance?.score || 0;
      cwv.uxScore = Math.round(performance * 100);
    }
    
    return cwv;
  } catch (e) {
    return { ok: false, error: String(e), lcp: 0, cls: 0, inp: 0, uxScore: 0 };
  }
}

/**
 * Convenience function - get PageSpeed Insights
 */
function APIS_getPageSpeedInsights(url) {
  return APIS_pageSpeedCall({ url: url });
}

/**
 * COMPATIBILITY LAYER for enhanced_data_collector.gs
 * Maps PAGESPEED_analyze() to APIS_pageSpeedCall()
 */
function PAGESPEED_analyze(params) {
  params = params || {};
  var url = params.url || '';
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  var result = APIS_pageSpeedCall({ url: url });
  
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  
  // Return format expected by collector
  return {
    ok: true,
    performanceScore: result.uxScore || 0,
    fcp: 0, // First Contentful Paint (would need full parsing)
    lcp: result.lcp || 0,
    cls: result.cls || 0,
    fid: 0, // First Input Delay (deprecated, replaced by INP)
    tti: 0, // Time to Interactive
    tbt: 0, // Total Blocking Time
    speedIndex: 0,
    opportunities: [],
    diagnostics: [],
    labData: {}
  };
}

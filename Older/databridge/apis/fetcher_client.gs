/**
 * Fetcher Client - Calls Fetcher Web App from DataBridge
 * Uses FETCHER_WEB_APP_URL and FETCHER_API_KEY from script properties
 */

function APIS_fetcherCall(action, payload) {
  var props = PropertiesService.getScriptProperties();
  var endpoint = props.getProperty('FETCHER_WEB_APP_URL');
  var apiKey = props.getProperty('FETCHER_API_KEY');

  if (!endpoint) {
    Logger.log('❌ FETCHER_WEB_APP_URL not configured');
    return { ok: false, error: 'Fetcher URL not configured' };
  }

  // API key is optional - fetcher may not require it
  if (!apiKey) {
    Logger.log('⚠️ FETCHER_API_KEY not set, proceeding without auth');
  }

  try {
    Logger.log('🌐 Calling remote fetcher: ' + action);
    
    var requestPayload = { 
      action: action, 
      payload: payload
    };
    
    // Add API key if available
    if (apiKey) {
      requestPayload.api_key = apiKey;
    }
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestPayload),
      muteHttpExceptions: true,
      timeout: 30 // 30 second timeout
    };

    var response = UrlFetchApp.fetch(endpoint, options);
    var code = response.getResponseCode();
    var responseText = response.getContentText();
    
    if (code !== 200) {
      Logger.log('❌ Fetcher returned HTTP ' + code + ': ' + responseText.substring(0, 200));
      return { ok: false, error: 'HTTP ' + code + ': ' + responseText.substring(0, 100) };
    }
    
    var result = JSON.parse(responseText);
    Logger.log('✅ Fetcher response received for: ' + action);
    
    return result;
    
  } catch (e) {
    Logger.log('❌ Error calling Fetcher: ' + String(e));
    return { ok: false, error: String(e) };
  }
}

/**
 * Convenience wrappers for common fetcher operations
 */
function APIS_fetchCompetitorBenchmark(urls) {
  return APIS_fetcherCall('competitorBenchmark', { urls: urls });
}

function APIS_fetchSeoSnapshot(url) {
  return APIS_fetcherCall('seoSnapshot', { url: url });
}

function APIS_fetchSingleUrl(url) {
  return APIS_fetcherCall('fetchSingleUrl', { url: url });
}

function APIS_fetchMultiUrl(urls) {
  return APIS_fetcherCall('fetchMulti', { urls: urls });
}

function APIS_extractMetadata(url) {
  return APIS_fetcherCall('extract:metadata', { url: url });
}

function APIS_extractHeadings(url) {
  return APIS_fetcherCall('extract:headings', { url: url });
}

function APIS_extractInternalLinks(url) {
  return APIS_fetcherCall('extract:internalLinks', { url: url });
}

function APIS_extractSchema(url) {
  return APIS_fetcherCall('extract:schema', { url: url });
}

/**
 * Alias FET_handle to APIS_fetcherCall for backward compatibility
 */
function FET_handle(payload) {
  var action = payload.action || 'unknown';
  return APIS_fetcherCall(action, payload);
}

/**
 * HIGH-LEVEL WRAPPER: Fetch URL and extract data in one call
 * This handles the two-step process: fetch HTML → extract data
 */
function APIS_fetchAndExtract(action, url) {
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  Logger.log('🌐 Fetch and extract: ' + action + ' for ' + url);
  
  // Step 1: Fetch HTML
  var fetchResult = APIS_fetcherCall('fetchSingleUrl', { url: url });
  
  if (!fetchResult.ok || !fetchResult.html) {
    Logger.log('❌ Failed to fetch URL: ' + (fetchResult.error || 'No HTML'));
    return { ok: false, error: 'Failed to fetch URL: ' + (fetchResult.error || 'No HTML') };
  }
  
  Logger.log('✅ HTML fetched (' + fetchResult.html.length + ' chars), now extracting...');
  
  // Step 2: Extract data from HTML
  var extractPayload = { 
    html: fetchResult.html,
    baseUrl: url,
    origin: url
  };
  
  var extractResult = APIS_fetcherCall(action, extractPayload);
  
  if (!extractResult.ok) {
    Logger.log('❌ Extraction failed: ' + (extractResult.error || 'Unknown'));
  } else {
    Logger.log('✅ Extraction successful: ' + action);
  }
  
  return extractResult;
}

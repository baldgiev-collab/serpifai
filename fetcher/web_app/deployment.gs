/**
 * Fetcher Web App Deployment
 * Exposes fetcher functionality via HTTP endpoints
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: 'Fetcher API',
    version: '1.0',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var apiKey = e.parameter.api_key || payload.api_key;
    
    if (!validateApiKey(apiKey)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
    }

    var action = payload.action;
    var data = payload.payload || {};
    
    if (!action) {
      return jsonResponse({ ok: false, error: 'Missing action' }, 400);
    }

    // Execute via router
    var result = FET_handle(action, data);
    
    return jsonResponse(result);
    
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function validateApiKey(key) {
  if (!key) return false;
  var validKey = PropertiesService.getScriptProperties().getProperty('FETCHER_API_KEY');
  return key === validKey;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

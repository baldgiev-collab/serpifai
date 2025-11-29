/**
 * DataBridge Web App Deployment
 * Exposes DataBridge functionality via HTTP endpoints
 */
/**
 * DataBridge Web App Deployment
 * Exposes DataBridge functionality via HTTP endpoints
 * This file delegates to workflow_router.gs for actual request handling
 * 
 * NOTE: In Google Apps Script, all .gs files are combined into one project,
 * so we can simply call the handleRequest() function from workflow_router.gs
 */


// Unified entry points for Google Apps Script web app deployment
function doGet(e) {
  // Health check endpoint
  try {
    if (typeof handleRequest === 'function') {
      var result = handleRequest(e);
      // If result is a ContentService object, return it directly
      if (result && typeof result.getContent === 'function') {
        return result;
      }
      // Otherwise, wrap as JSON
      return jsonResponse(result);
    } else {
      return jsonResponse({ success: false, error: 'Router not found' });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: String(err), stack: err.stack });
  }
}

function doPost(e) {
  try {
    if (typeof handleRequest === 'function') {
      var result = handleRequest(e);
      // If result is a ContentService object, return it directly
      if (result && typeof result.getContent === 'function') {
        return result;
      }
      // Otherwise, wrap as JSON
      return jsonResponse(result);
    } else {
      return jsonResponse({ success: false, error: 'Router not found' });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: String(err), stack: err.stack });
  }
}

function jsonResponse(obj, statusCode) {
  if (statusCode && statusCode !== 200) {
    obj._statusCode = statusCode;
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

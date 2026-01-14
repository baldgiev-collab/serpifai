/**
 * DB_Deployment.gs
 * Web App entry points for DataBridge
 * Delegates to router for request handling
 */

/**
 * Handle GET requests
 * Used for health checks and simple queries
 */
function doGet(e) {
  try {
    // Check if handleRequest function exists (from workflow_router.gs)
    if (typeof handleRequest === 'function') {
      var result = handleRequest(e);
      
      // If result is a ContentService object, return it directly
      if (result && typeof result.getContent === 'function') {
        return result;
      }
      
      // Otherwise, wrap as JSON
      return DB_jsonResponse(result);
    } else {
      return DB_jsonResponse({ 
        success: false, 
        error: 'Router not found' 
      });
    }
  } catch (err) {
    return DB_jsonResponse({ 
      success: false, 
      error: String(err), 
      stack: err.stack 
    });
  }
}

/**
 * Handle POST requests
 * Primary method for DataBridge API calls
 */
function doPost(e) {
  try {
    // Check if handleRequest function exists (from workflow_router.gs)
    if (typeof handleRequest === 'function') {
      var result = handleRequest(e);
      
      // If result is a ContentService object, return it directly
      if (result && typeof result.getContent === 'function') {
        return result;
      }
      
      // Otherwise, wrap as JSON
      return DB_jsonResponse(result);
    } else {
      return DB_jsonResponse({ 
        success: false, 
        error: 'Router not found' 
      });
    }
  } catch (err) {
    return DB_jsonResponse({ 
      success: false, 
      error: String(err), 
      stack: err.stack 
    });
  }
}

/**
 * Create JSON response
 * @param {object} obj - Response object
 * @param {number} statusCode - HTTP status code (optional)
 * @return {ContentService} JSON response
 */
function DB_jsonResponse(obj, statusCode) {
  if (statusCode && statusCode !== 200) {
    obj._statusCode = statusCode;
  }
  
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Legacy function names for backwards compatibility
 */
function jsonResponse(obj, statusCode) {
  return DB_jsonResponse(obj, statusCode);
}

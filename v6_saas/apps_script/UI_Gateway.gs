/**
 * UI_Gateway.gs
 * Core connector between Apps Script and PHP Gateway
 * Handles all HTTP communication, authentication, credit management
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const GATEWAY_CONFIG = {
  // PRODUCTION: serpifai.com gateway
  GATEWAY_URL: 'https://serpifai.com/serpifai_php/api_gateway.php',
  
  // Timeout for API calls (milliseconds)
  TIMEOUT: 60000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// ============================================================================
// MAIN GATEWAY CONNECTOR
// ============================================================================

/**
 * Call PHP Gateway
 * Main function all other code uses to communicate with gateway
 * 
 * @param {string} action - Action identifier (e.g., 'workflow:stage1', 'comp:market_intel')
 * @param {object} payload - Data to send
 * @param {string} licenseKey - Optional license key (will auto-get if not provided)
 * @returns {object} Response from gateway
 */
function callGateway(action, payload = {}, licenseKey = null) {
  try {
    // User management actions that don't require existing license key
    const userActions = ['verifyLicenseKey', 'getUserInfo', 'check_status'];
    const isUserAction = userActions.includes(action);
    
    // Get license key if not provided (skip for user actions that are verifying a NEW key)
    if (!licenseKey && !isUserAction) {
      licenseKey = getUserLicenseKey();
    }
    
    // For user actions, the license key comes from the payload
    if (isUserAction && payload.licenseKey) {
      licenseKey = payload.licenseKey;
    }
    
    if (!licenseKey && !isUserAction) {
      throw new GatewayError('❌ No license key configured. Please add your license key in Settings.');
    }
    
    // Get gateway URL - ALWAYS use production URL
    const scriptProps = PropertiesService.getScriptProperties();
    let gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
    
    if (!gatewayUrl) {
      gatewayUrl = GATEWAY_CONFIG.GATEWAY_URL;
      Logger.log('⚠️ PHP_GATEWAY_URL not set in Script Properties, using default: ' + gatewayUrl);
    }
    
    // Build request
    const requestData = {
      license: licenseKey || '',
      action: action,
      payload: payload
    };
    
    // Prepare HTTP options
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    // Log for debugging
    Logger.log(`📡 Calling gateway: ${gatewayUrl}`);
    Logger.log(`🎯 Action: ${action}`);
    Logger.log(`🔑 Has license key: ${!!licenseKey}`);
    
    // Make request with retry logic
    let lastError;
    for (let attempt = 1; attempt <= GATEWAY_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const response = UrlFetchApp.fetch(gatewayUrl, options);
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();
        
        Logger.log(`📥 Response code: ${responseCode}`);
        Logger.log(`📄 Response: ${responseText.substring(0, 500)}`);
        
        // Parse response
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          throw new GatewayError(`Invalid JSON response from gateway: ${responseText.substring(0, 200)}`);
        }
        
        // Handle different response codes
        if (responseCode === 200) {
          // Success
          Logger.log('✅ Gateway call successful');
          return result;
        } else if (responseCode === 401) {
          // Authentication failed - remove invalid license key
          Logger.log('❌ Authentication failed - removing invalid license key');
          clearUserLicenseKey();
          throw new AuthenticationError(result.error || 'Authentication failed - license key removed', result);
        } else if (responseCode === 402) {
          // Insufficient credits
          throw new CreditError(result.error || 'Insufficient credits', result);
        } else if (responseCode === 400) {
          // Bad request
          throw new ValidationError(result.error || 'Invalid request', result);
        } else if (responseCode >= 500) {
          // Server error - retry
          lastError = new GatewayError(`Server error (${responseCode}): ${result.error}`);
          if (attempt < GATEWAY_CONFIG.MAX_RETRIES) {
            Utilities.sleep(GATEWAY_CONFIG.RETRY_DELAY * attempt);
            continue;
          }
          throw lastError;
        } else {
          // Other error
          throw new GatewayError(`Gateway error (${responseCode}): ${result.error}`);
        }
      } catch (e) {
        if (e instanceof GatewayError || e instanceof CreditError || e instanceof AuthenticationError) {
          throw e; // Don't retry on these errors
        }
        lastError = e;
        if (attempt < GATEWAY_CONFIG.MAX_RETRIES) {
          Logger.log(`⚠️ Attempt ${attempt} failed, retrying...`);
          Utilities.sleep(GATEWAY_CONFIG.RETRY_DELAY * attempt);
          continue;
        }
      }
    }
    
    throw lastError || new GatewayError('Request failed after retries');
    
  } catch (e) {
    // Log error
    Logger.log(`❌ Gateway error: ${e.toString()}`);
    
    // Re-throw custom errors
    if (e instanceof GatewayError || e instanceof CreditError || e instanceof AuthenticationError) {
      throw e;
    }
    
    // Wrap generic errors
    throw new GatewayError(`Failed to call gateway: ${e.toString()}`);
  }
}

// ============================================================================
// SPECIALIZED GATEWAY CALLS
// ============================================================================

/**
 * Call Gemini API via gateway
 */
function callGeminiAPI(model, prompt, options = {}) {
  return callGateway('gemini:generate', {
    model: model,
    prompt: prompt,
    options: options
  });
}

/**
 * Get available Gemini models
 */
function getAvailableGeminiModels() {
  return callGateway('gemini:list_models', {});
}

/**
 * Call Serper API via gateway
 */
function callSerperAPI(endpoint, query, params = {}) {
  return callGateway(`serper_${endpoint}`, {
    query: query,
    params: params
  });
}

/**
 * Execute workflow stage
 */
function executeWorkflowStage(stageNum, formData) {
  return callGateway(`workflow:stage${stageNum}`, formData);
}

/**
 * Run competitor analysis
 */
function runCompetitorAnalysis(category, competitors, options = {}) {
  return callGateway(`comp:${category}`, {
    competitors: competitors,
    options: options
  });
}

/**
 * Run elite competitor analysis (all categories)
 */
function runEliteAnalysis(competitors, options = {}) {
  return callGateway('comp:elite_full', {
    competitors: competitors,
    options: options
  });
}

/**
 * Fetch URL content
 */
function fetchUrlContent(url, options = {}) {
  return callGateway('fetch:single', {
    url: url,
    options: options
  });
}

/**
 * Extract specific content from URL
 */
function extractFromUrl(url, extractType, options = {}) {
  return callGateway(`fetch:extract_${extractType}`, {
    url: url,
    options: options
  });
}

// ============================================================================
// PROJECT MANAGEMENT (via Database)
// ============================================================================

/**
 * Save project to database
 */
function saveProjectToDatabase(projectName, projectData) {
  return callGateway('project_save', {
    projectName: projectName,
    projectData: projectData
  });
}

/**
 * Load project from database
 */
function loadProjectFromDatabase(projectName) {
  return callGateway('project_load', {
    projectName: projectName
  });
}

/**
 * List all projects
 */
function listProjectsFromDatabase() {
  return callGateway('project_list', {});
}

/**
 * Delete project
 */
function deleteProjectFromDatabase(projectName) {
  return callGateway('project_delete', {
    projectName: projectName
  });
}

/**
 * Rename project
 */
function renameProjectInDatabase(oldName, newName) {
  return callGateway('project_rename', {
    oldName: oldName,
    newName: newName
  });
}

// ============================================================================
// LICENSE KEY MANAGEMENT
// ============================================================================

/**
 * Get user's license key from user properties
 */
function getUserLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  // Check both property names for compatibility
  let licenseKey = userProps.getProperty('serpifai_license_key');
  if (!licenseKey) {
    licenseKey = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  }
  return licenseKey;
}

/**
 * Set user's license key
 */
function setUserLicenseKey(licenseKey) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('SERPIFAI_LICENSE_KEY', licenseKey);
  return true;
}

/**
 * Clear user's license key
 */
function clearUserLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('SERPIFAI_LICENSE_KEY');
  return true;
}

/**
 * Check user status and credits
 */
function checkUserStatus() {
  try {
    const result = callGateway('check_status', {});
    
    if (result.success) {
      return {
        authenticated: true,
        user: result.user,
        credits: {
          total: result.user.credits_total,
          used: result.user.credits_used,
          remaining: result.user.credits_remaining
        },
        plan: result.user.plan_type
      };
    }
    
    return {
      authenticated: false,
      error: result.error
    };
  } catch (e) {
    if (e instanceof AuthenticationError) {
      return {
        authenticated: false,
        error: e.message
      };
    }
    throw e;
  }
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * Complete a transaction
 * Call this after successfully executing business logic
 */
function completeTransaction(transactionId, result) {
  return callGateway('workflow:complete', {
    transactionId: transactionId,
    result: result
  });
}

/**
 * Fail a transaction
 * Call this if business logic execution fails (to refund credits)
 */
function failTransaction(transactionId, errorMessage) {
  return callGateway('workflow:fail', {
    transactionId: transactionId,
    error: errorMessage
  });
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base gateway error
 */
class GatewayError extends Error {
  constructor(message, data = {}) {
    super(message);
    this.name = 'GatewayError';
    this.data = data;
  }
}

/**
 * Credit-related error
 */
class CreditError extends GatewayError {
  constructor(message, data = {}) {
    super(message, data);
    this.name = 'CreditError';
    this.creditsNeeded = data.credits_needed || 0;
    this.creditsRemaining = data.credits_remaining || 0;
  }
}

/**
 * Authentication error
 */
class AuthenticationError extends GatewayError {
  constructor(message, data = {}) {
    super(message, data);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error
 */
class ValidationError extends GatewayError {
  constructor(message, data = {}) {
    super(message, data);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format error for user display
 */
function formatErrorForUser(error) {
  if (error instanceof CreditError) {
    return {
      type: 'credit',
      title: 'Insufficient Credits',
      message: error.message,
      details: `You need ${error.creditsNeeded} credits but only have ${error.creditsRemaining} remaining.`,
      action: 'upgrade'
    };
  } else if (error instanceof AuthenticationError) {
    return {
      type: 'auth',
      title: 'Authentication Failed',
      message: error.message,
      details: 'Please check your license key in Settings.',
      action: 'settings'
    };
  } else if (error instanceof ValidationError) {
    return {
      type: 'validation',
      title: 'Invalid Request',
      message: error.message,
      details: 'Please check your input and try again.',
      action: 'retry'
    };
  } else {
    return {
      type: 'error',
      title: 'Error',
      message: error.message || error.toString(),
      details: 'An unexpected error occurred.',
      action: 'support'
    };
  }
}

/**
 * Show error to user in UI
 */
function showErrorToUser(error) {
  const formatted = formatErrorForUser(error);
  
  // Return formatted error for UI to display
  return {
    success: false,
    error: formatted
  };
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test gateway connection
 */
function testGatewayConnection() {
  try {
    const result = checkUserStatus();
    Logger.log('Gateway connection test:');
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    Logger.log('Gateway connection failed:');
    Logger.log(e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Get credit costs reference
 */
function getCreditCostsReference() {
  return {
    'workflow:stage1': 5,
    'workflow:stage2': 8,
    'workflow:stage3': 10,
    'workflow:stage4': 5,
    'workflow:stage5': 15,
    'comp:market_intel': 10,
    'comp:elite_full': 100,
    'content:article': 15,
    'fetch:single': 1,
    'gemini:generate': 3,
    'serper_search': 2
  };
}

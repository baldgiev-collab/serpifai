/**
 * =============================================================================
 * 🚀 ONE-CLICK DEPLOYMENT SCRIPT
 * =============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Copy this ENTIRE file
 * 2. Open your UI's Apps Script project (where Code.gs lives)
 * 3. Click the "+" icon next to "Files"
 * 4. Select "Script"
 * 5. Name it: "CompetitorIntelligence"
 * 6. Paste this entire file
 * 7. Save (Ctrl+S)
 * 8. Done! The button will now work!
 * 
 * =============================================================================
 */

/**
 * Main entry point called from UI
 * This function is called when user clicks "Competitor Analysis" button
 */
function COMP_orchestrateAnalysis(config) {
  try {
    Logger.log('🚀 UI Bridge: Starting Competitor Intelligence Analysis');
    Logger.log('Config received from UI: ' + JSON.stringify(config));
    
    // Validate input
    if (!config) {
      throw new Error('Config object is required');
    }
    
    if (!config.competitors || !Array.isArray(config.competitors)) {
      throw new Error('config.competitors must be an array. Received: ' + JSON.stringify(config));
    }
    
    if (config.competitors.length < 2 || config.competitors.length > 6) {
      throw new Error('Please provide 2-6 competitor domains. Received: ' + config.competitors.length);
    }
    
    // Add the target spreadsheet ID to config
    // This is the Google Sheets where all intelligence data will be saved
    if (!config.spreadsheetId) {
      config.spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
      Logger.log('Using default spreadsheet ID: ' + config.spreadsheetId);
    }
    
    // Get DataBridge Web App URL
    // Try Script Properties first, then fall back to hardcoded URL
    var databridgeUrl = PropertiesService.getScriptProperties().getProperty('DATABRIDGE_WEB_APP_URL');
    
    if (!databridgeUrl) {
      // Fallback to your DataBridge URL
  databridgeUrl = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
      Logger.log('Using fallback DataBridge URL from code');
    }
    
    Logger.log('Calling DataBridge at: ' + databridgeUrl);
    Logger.log('Target Spreadsheet: https://docs.google.com/spreadsheets/d/' + config.spreadsheetId);
    
    // Prepare payload for DataBridge
    var payload = {
      action: 'COMP_orchestrateAnalysis',
      config: config
    };
    
    Logger.log('Sending payload: ' + JSON.stringify(payload));
    
    // Call DataBridge Web App with RETRY LOGIC for 429 errors
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var maxRetries = 3;
    var response;
    var responseCode;
    var responseText;
    
    for (var attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.log('Attempt ' + attempt + '/' + maxRetries + ': Calling DataBridge...');
        
        response = UrlFetchApp.fetch(databridgeUrl, options);
        responseCode = response.getResponseCode();
        responseText = response.getContentText();
        
        Logger.log('DataBridge response code: ' + responseCode);
        
        if (responseCode === 429) {
          // Rate limited - wait and retry
          var waitTime = 3000 * attempt; // Exponential backoff: 3s, 6s, 9s
          Logger.log('⏳ Rate limited (429). Waiting ' + waitTime + 'ms before retry...');
          Utilities.sleep(waitTime);
          continue;
        }
        
        // Success or non-retryable error
        break;
        
      } catch (e) {
        Logger.log('❌ Fetch error on attempt ' + attempt + ': ' + e.toString());
        if (attempt === maxRetries) {
          throw e;
        }
        Utilities.sleep(2000 * attempt);
      }
    }
    
    Logger.log('DataBridge response (first 500 chars): ' + responseText.substring(0, 500));
    
    if (responseCode !== 200) {
      Logger.log('❌ DataBridge error response: ' + responseText);
      throw new Error('DataBridge returned error: ' + responseCode + ' - ' + responseText);
    }
    
    var result = JSON.parse(responseText);
    
    // Check if result has error
    if (result.error || result.success === false) {
      Logger.log('❌ DataBridge returned error in result: ' + JSON.stringify(result));
      throw new Error('DataBridge error: ' + (result.error || result.message || 'Unknown error'));
    }
    
    Logger.log('✅ UI Bridge: Analysis complete');
    Logger.log('Result keys: ' + Object.keys(result).join(', '));
    
    return result;
    
  } catch (e) {
    Logger.log('❌ Error in UI Bridge: ' + e.toString());
    Logger.log('Error stack: ' + (e.stack || 'No stack trace'));
    return {
      success: false,
      error: e.toString(),
      stack: e.stack || 'No stack trace',
      message: 'Analysis failed: ' + e.toString()
    };
  }
}

/**
 * Test function - Run this to verify setup
 * 
 * HOW TO TEST:
 * 1. In Apps Script editor, select this function from dropdown
 * 2. Click "Run" button
 * 3. Check "Execution log" for results
 */
function testCompetitorAnalysis() {
  Logger.log('🧪 Starting test...');
  
  var config = {
    competitors: ['ahrefs.com', 'semrush.com'],
    projectId: 'test-project-123',
    yourDomain: 'mysite.com',
    spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU'
  };
  
  Logger.log('Test config: ' + JSON.stringify(config));
  Logger.log('Target Spreadsheet: https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU');
  
  var result = COMP_orchestrateAnalysis(config);
  
  Logger.log('=================================');
  Logger.log('TEST RESULT:');
  Logger.log('=================================');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.error) {
    Logger.log('❌ TEST FAILED: ' + result.error);
  } else if (result.intelligence) {
    Logger.log('✅ TEST PASSED: Received intelligence data');
    Logger.log('Intelligence categories: ' + Object.keys(result.intelligence).join(', '));
  } else {
    Logger.log('⚠️ TEST WARNING: Unexpected result structure');
  }
}

/**
 * Quick diagnostic - Check if DataBridge is accessible
 */
function testDataBridgeConnection() {
  Logger.log('🔍 Testing DataBridge connection...');
  
  var databridgeUrl = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
  
  Logger.log('Testing URL: ' + databridgeUrl);
  
  try {
    var payload = {
      action: 'ping'
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(databridgeUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('Response code: ' + responseCode);
    Logger.log('Response: ' + responseText);
    
    if (responseCode === 200) {
      Logger.log('✅ DataBridge is accessible!');
    } else {
      Logger.log('❌ DataBridge returned error: ' + responseCode);
    }
    
  } catch (e) {
    Logger.log('❌ Connection failed: ' + e.toString());
  }
}

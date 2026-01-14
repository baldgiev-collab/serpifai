/**
 * =============================================================================
 * COMPETITOR INTELLIGENCE - UI BRIDGE
 * =============================================================================
 * 
 * This file acts as a bridge between the UI and DataBridge.
 * Deploy this to your UI's Apps Script project (app/Code.gs or separate file).
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your UI's Google Apps Script project (where Code.gs lives)
 * 2. Create a new script file: File > New > Script file
 * 3. Name it: CompetitorIntelligence
 * 4. Copy ALL contents of this file into it
 * 5. Save (Ctrl+S or Cmd+S)
 * 
 * =============================================================================
 */

/**
 * Main entry point called from UI
 * Forwards request to DataBridge and returns result
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
      throw new Error('config.competitors must be an array');
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
    
    // Call DataBridge Web App
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(databridgeUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('DataBridge response code: ' + responseCode);
    
    if (responseCode !== 200) {
      throw new Error('DataBridge returned error: ' + responseCode + ' - ' + responseText);
    }
    
    var result = JSON.parse(responseText);
    
    Logger.log('✅ UI Bridge: Analysis complete');
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
 * Test function - call this from Apps Script to verify setup
 */
function testCompetitorAnalysis() {
  var config = {
    competitors: ['ahrefs.com', 'semrush.com'],
    projectId: 'test-project-123',
    yourDomain: 'mysite.com'
  };
  
  var result = COMP_orchestrateAnalysis(config);
  Logger.log('Test result: ' + JSON.stringify(result, null, 2));
}

/**
 * =============================================================================
 * DATABRIDGE WEB APP HANDLER
 * =============================================================================
 * 
 * This file handles HTTP requests from the UI Bridge.
 * Deploy this to DataBridge Apps Script project.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open DataBridge Apps Script project
 * 2. Create a new script file: File > New > Script file
 * 3. Name it: WebAppHandler
 * 4. Copy ALL contents of this file into it
 * 5. Save (Ctrl+S or Cmd+S)
 * 6. Deploy: Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy
 * 7. Copy the Web App URL
 * 8. Update CompetitorIntelligence.gs in UI with this URL
 * 
 * =============================================================================
 */

/**
 * Handle POST requests from UI Bridge
 * This is the main entry point for all Web App requests
 * 
 * ⚠️ CRITICAL CHANGE: Now delegates workflow actions to handleRequest()
 * from workflow_router.gs. Only handles competitor-specific actions directly.
 */
function doPost(e) {
  try {
    Logger.log('📥 DataBridge Web App: Received POST request');
    
    // Validate request
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Invalid request: No POST data received'
      });
    }
    
    // Parse payload
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON in request body'
      });
    }
    
    Logger.log('Action requested: ' + payload.action);
    
    // ============================================================================
    // CRITICAL: Delegate workflow actions to handleRequest from workflow_router.gs
    // ============================================================================
    if (payload.action && (
      payload.action.startsWith('workflow:') || 
      payload.action === 'ping' ||
      payload.action === 'diagnostic:checkProperties'
    )) {
      Logger.log('🔀 Delegating to workflow_router.gs handleRequest()');
      
      // Check if handleRequest exists (from workflow_router.gs)
      if (typeof handleRequest === 'function') {
        return handleRequest(e);
      } else {
        Logger.log('❌ handleRequest function not found - workflow_router.gs not deployed?');
        return createJsonResponse({
          success: false,
          error: 'Workflow router not available. Please deploy workflow_router.gs',
          hint: 'The handleRequest function from workflow_router.gs is missing'
        });
      }
    }
    
    var result;
    
    // Route competitor-specific actions
    switch(payload.action) {
      case 'COMP_orchestrateAnalysis':
        Logger.log('Routing to COMP_orchestrateAnalysis');
        result = COMP_orchestrateAnalysis(payload.config);
        break;
        
      case 'TEST_apiAndModuleIntegration':
        Logger.log('Routing to TEST_apiAndModuleIntegration');
        result = TEST_apiAndModuleIntegration();
        break;
        
      case 'TEST_fullCompetitorAnalysis':
        Logger.log('Routing to TEST_fullCompetitorAnalysis');
        result = TEST_fullCompetitorAnalysis();
        break;
        
      default:
        result = {
          success: false,
          error: 'Unknown action: ' + payload.action,
          availableActions: [
            'COMP_orchestrateAnalysis',
            'TEST_apiAndModuleIntegration',
            'TEST_fullCompetitorAnalysis',
            'workflow:stage1',
            'workflow:stage2',
            'workflow:stage3',
            'workflow:stage4',
            'workflow:stage5',
            'ping'
          ],
          hint: 'For workflow actions, make sure workflow_router.gs is deployed'
        };
    }
    
    Logger.log('✅ DataBridge Web App: Request processed successfully');
    
    // Add success flag if not already present
    if (result && typeof result.success === 'undefined') {
      result.success = !result.error;
    }
    
    return createJsonResponse(result);
    
  } catch (e) {
    Logger.log('❌ Error in doPost: ' + e.toString());
    Logger.log('Error stack: ' + (e.stack || 'No stack trace'));
    
    return createJsonResponse({
      success: false,
      error: e.toString(),
      stack: e.stack || 'No stack trace',
      message: 'DataBridge error: ' + e.toString()
    });
  }
}

/**
 * Handle GET requests (for testing and status checks)
 */
function doGet(e) {
  try {
    Logger.log('📥 DataBridge Web App: Received GET request');
    
    // Check if specific test is requested
    var params = e ? e.parameter : {};
    
    if (params.test === 'api') {
      return createJsonResponse(TEST_apiAndModuleIntegration());
    }
    
    // Default: Return status
    return createJsonResponse({
      status: 'online',
      service: 'DataBridge Web App',
      timestamp: new Date().toISOString(),
      version: '2.0',
      endpoints: {
        POST: {
          'COMP_orchestrateAnalysis': 'Run full competitor intelligence analysis',
          'TEST_apiAndModuleIntegration': 'Test API keys and module integration',
          'TEST_fullCompetitorAnalysis': 'Test complete analysis with ahrefs.com, semrush.com'
        },
        GET: {
          '?test=api': 'Test API integration'
        }
      },
      message: 'DataBridge is running. Use POST requests for competitor analysis.',
      documentation: 'See UI_INTEGRATION_FIX.md for integration guide'
    });
    
  } catch (e) {
    Logger.log('❌ Error in doGet: ' + e.toString());
    
    return createJsonResponse({
      status: 'error',
      error: e.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Helper function to create JSON response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test the doPost function locally (without HTTP)
 */
function TEST_webAppDoPost() {
  Logger.log('🧪 Testing doPost function...');
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'COMP_orchestrateAnalysis',
        config: {
          competitors: ['ahrefs.com', 'semrush.com'],
          projectId: 'test-webapp-' + new Date().getTime(),
          yourDomain: 'mysite.com',
          spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU'
        }
      })
    }
  };
  
  var response = doPost(mockEvent);
  var content = response.getContent();
  var result = JSON.parse(content);
  
  Logger.log('Test completed');
  Logger.log('Success: ' + (result.success !== false));
  Logger.log('Has intelligence data: ' + (!!result.intelligence));
  Logger.log('Has overview: ' + (!!result.overview));
  
  if (result.error) {
    Logger.log('❌ Error: ' + result.error);
  } else {
    Logger.log('✅ TEST PASSED');
  }
  
  return result;
}

/**
 * Test the doGet function locally
 */
function TEST_webAppDoGet() {
  Logger.log('🧪 Testing doGet function...');
  
  var mockEvent = {
    parameter: {}
  };
  
  var response = doGet(mockEvent);
  var content = response.getContent();
  var result = JSON.parse(content);
  
  Logger.log('Status: ' + result.status);
  Logger.log('Service: ' + result.service);
  
  if (result.status === 'online') {
    Logger.log('✅ TEST PASSED - Web App is online');
  } else {
    Logger.log('❌ TEST FAILED - Web App not responding correctly');
  }
  
  return result;
}

/**
 * Get the deployed Web App URL
 * Run this to get the URL to use in UI Bridge
 */
function GET_webAppUrl() {
  var url = ScriptApp.getService().getUrl();
  Logger.log('📍 Your DataBridge Web App URL:');
  Logger.log(url);
  Logger.log('');
  Logger.log('📋 Copy this URL and paste it into:');
  Logger.log('   CompetitorIntelligence.gs in your UI\'s Apps Script');
  Logger.log('   (Replace the databridgeUrl variable)');
  
  return url;
}


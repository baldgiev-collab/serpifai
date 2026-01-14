/**
 * 🔍 DIAGNOSTIC: Trace exact URL being called
 * 
 * RUN THIS IN THE PROJECT WHERE testUIModelSelection() IS FAILING
 * 
 * This will help us identify why UI gets "Unknown action" but DataBridge works
 */

function traceDataBridgeURL() {
  Logger.log('========================================');
  Logger.log('🔍 URL TRACING DIAGNOSTIC');
  Logger.log('========================================\n');
  
  // Check 1: What URL is defined in this project?
  Logger.log('1️⃣ Checking URL in current project...');
  if (typeof DATABRIDGE_ENDPOINT !== 'undefined') {
    Logger.log('   ✅ DATABRIDGE_ENDPOINT found: ' + DATABRIDGE_ENDPOINT);
  } else {
    Logger.log('   ❌ DATABRIDGE_ENDPOINT not defined in this project');
  }
  Logger.log('');
  
  // Check 2: Test the URL with a ping
  Logger.log('2️⃣ Testing URL with ping...');
  try {
    const testPayload = {
      action: 'ping',
      timestamp: new Date().toISOString()
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    };
    
    const url = typeof DATABRIDGE_ENDPOINT !== 'undefined' 
      ? DATABRIDGE_ENDPOINT 
      : 'URL_NOT_FOUND';
    
    Logger.log('   📡 Calling: ' + url);
    
    if (url === 'URL_NOT_FOUND') {
      Logger.log('   ❌ Cannot test - URL not defined');
    } else {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('   📨 Status: ' + responseCode);
      Logger.log('   📨 Response: ' + responseText);
      
      if (responseCode === 200) {
        const result = JSON.parse(responseText);
        if (result.success) {
          Logger.log('   ✅ URL works - this is the CORRECT DataBridge');
        } else {
          Logger.log('   ⚠️ URL responds but with error');
        }
      } else {
        Logger.log('   ❌ URL returns HTTP ' + responseCode);
      }
    }
  } catch (error) {
    Logger.log('   ❌ Error calling URL: ' + error.message);
  }
  Logger.log('');
  
  // Check 3: Test workflow:stage1 action
  Logger.log('3️⃣ Testing workflow:stage1 action...');
  try {
    const testPayload = {
      action: 'workflow:stage1',
      modelName: 'gemini-2.5-flash',
      data: {
        projectId: 'URL_TRACE_TEST',
        brandName: 'Test',
        coreTopic: 'Testing',
        targetAudience: 'Developers'
      },
      timestamp: new Date().toISOString()
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    };
    
    const url = typeof DATABRIDGE_ENDPOINT !== 'undefined' 
      ? DATABRIDGE_ENDPOINT 
      : 'URL_NOT_FOUND';
    
    Logger.log('   📡 Calling: ' + url);
    Logger.log('   📦 Action: workflow:stage1');
    
    if (url === 'URL_NOT_FOUND') {
      Logger.log('   ❌ Cannot test - URL not defined');
    } else {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('   📨 Status: ' + responseCode);
      
      if (responseCode === 200) {
        const result = JSON.parse(responseText);
        if (result.success && result.json && result.report) {
          Logger.log('   ✅ workflow:stage1 WORKS!');
          Logger.log('   ✅ Response has json: true');
          Logger.log('   ✅ Response has report: true');
        } else if (!result.success) {
          Logger.log('   ❌ workflow:stage1 FAILED: ' + result.error);
          
          // Check if it's "Unknown action" error
          if (result.error && result.error.includes('Unknown action')) {
            Logger.log('');
            Logger.log('   🚨 ROOT CAUSE FOUND:');
            Logger.log('   This URL is calling an OLD DataBridge deployment');
            Logger.log('   that does NOT have workflow routing code!');
            Logger.log('');
            Logger.log('   The URL being called: ' + url);
            Logger.log('   Expected URL: AKfycbyG48a0L-KPd_0d7Rmw_PvbaTgyU4J5TpG-beImNVB8OcerQSOv2Vz2qRp7xiBjUaBE');
          }
        }
      } else if (responseCode === 429) {
        Logger.log('   ⚠️ HTTP 429 - Rate limited (too many requests)');
        Logger.log('   Wait 1 minute and try again');
      } else {
        Logger.log('   ❌ HTTP ' + responseCode);
        Logger.log('   Response: ' + responseText.substring(0, 200));
      }
    }
  } catch (error) {
    Logger.log('   ❌ Error: ' + error.message);
  }
  Logger.log('');
  
  // Check 4: Compare with known good URL
  Logger.log('4️⃣ URL Comparison...');
  const knownGoodURL = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
  const currentURL = typeof DATABRIDGE_ENDPOINT !== 'undefined' ? DATABRIDGE_ENDPOINT : 'NOT_DEFINED';
  
  Logger.log('   Known good URL: ' + knownGoodURL);
  Logger.log('   Current URL:    ' + currentURL);
  
  if (currentURL === knownGoodURL) {
    Logger.log('   ✅ URLs MATCH - Using correct DataBridge');
  } else if (currentURL === 'NOT_DEFINED') {
    Logger.log('   ❌ URL NOT DEFINED in this project');
    Logger.log('   Action: Add workflow_connector.gs to this project');
  } else {
    Logger.log('   ❌ URLs DO NOT MATCH');
    Logger.log('   🔧 Fix: Update DATABRIDGE_ENDPOINT to:');
    Logger.log('   ' + knownGoodURL);
  }
  Logger.log('');
  
  // Check 5: Which project is this?
  Logger.log('5️⃣ Project Information...');
  try {
    const scriptId = ScriptApp.getScriptId();
    Logger.log('   Script ID: ' + scriptId);
    
    // Try to determine project type
    if (typeof handleRequest === 'function') {
      Logger.log('   Project type: DATABRIDGE (has handleRequest)');
      Logger.log('   ✅ This IS the DataBridge project');
    } else if (typeof runWorkflowStage === 'function') {
      Logger.log('   Project type: UI (has runWorkflowStage)');
      Logger.log('   ⚠️ This is a UI project calling DataBridge');
    } else {
      Logger.log('   Project type: UNKNOWN');
    }
  } catch (error) {
    Logger.log('   Cannot determine project type: ' + error.message);
  }
  Logger.log('');
  
  Logger.log('========================================');
  Logger.log('📊 SUMMARY');
  Logger.log('========================================');
  
  if (currentURL === knownGoodURL) {
    Logger.log('✅ URL is correct');
    Logger.log('If still getting "Unknown action" errors:');
    Logger.log('1. Check deployment version in DataBridge');
    Logger.log('2. Create new deployment');
    Logger.log('3. Update URL everywhere');
  } else if (currentURL === 'NOT_DEFINED') {
    Logger.log('❌ URL not defined in this project');
    Logger.log('Action: Copy workflow_connector.gs to this project');
  } else {
    Logger.log('❌ Wrong URL being used');
    Logger.log('Action: Update DATABRIDGE_ENDPOINT in workflow_connector.gs');
  }
  Logger.log('');
}


/**
 * Test which project this is
 */
function identifyCurrentProject() {
  Logger.log('========================================');
  Logger.log('🔍 PROJECT IDENTIFICATION');
  Logger.log('========================================\n');
  
  const checks = {
    hasHandleRequest: typeof handleRequest === 'function',
    hasRunWorkflowStage: typeof runWorkflowStage === 'function',
    hasRunStage1Strategy: typeof runStage1Strategy === 'function',
    hasDataBridgeEndpoint: typeof DATABRIDGE_ENDPOINT !== 'undefined',
    scriptId: ScriptApp.getScriptId()
  };
  
  Logger.log('Function checks:');
  Logger.log('  handleRequest: ' + (checks.hasHandleRequest ? '✅ YES' : '❌ NO'));
  Logger.log('  runWorkflowStage: ' + (checks.hasRunWorkflowStage ? '✅ YES' : '❌ NO'));
  Logger.log('  runStage1Strategy: ' + (checks.hasRunStage1Strategy ? '✅ YES' : '❌ NO'));
  Logger.log('  DATABRIDGE_ENDPOINT: ' + (checks.hasDataBridgeEndpoint ? '✅ YES' : '❌ NO'));
  Logger.log('');
  
  Logger.log('Script ID: ' + checks.scriptId);
  Logger.log('');
  
  if (checks.hasHandleRequest && checks.hasRunStage1Strategy) {
    Logger.log('📌 This is: DATABRIDGE PROJECT');
    Logger.log('   Should NOT have workflow_connector.gs');
    Logger.log('   Should NOT call external URLs');
  } else if (checks.hasRunWorkflowStage && checks.hasDataBridgeEndpoint) {
    Logger.log('📌 This is: UI PROJECT');
    Logger.log('   Should have workflow_connector.gs');
    Logger.log('   Should call DataBridge via URL');
  } else if (checks.hasHandleRequest && checks.hasRunWorkflowStage) {
    Logger.log('⚠️ This is: MIXED PROJECT (both functions present)');
    Logger.log('   This causes confusion!');
    Logger.log('   DataBridge and UI should be separate projects');
  } else {
    Logger.log('❓ This is: UNKNOWN PROJECT TYPE');
  }
  Logger.log('');
  
  return checks;
}

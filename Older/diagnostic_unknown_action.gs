/**
 * 🚨 URGENT DIAGNOSTIC
 * 
 * Run this in the Apps Script project where you're getting the "Unknown action" error
 * This will tell us EXACTLY what's wrong
 */

function diagnoseUnknownActionError() {
  Logger.log('========================================');
  Logger.log('🚨 UNKNOWN ACTION ERROR DIAGNOSTIC');
  Logger.log('========================================\n');
  
  // Step 1: Identify which project this is
  Logger.log('STEP 1: Identify Current Project');
  Logger.log('─'.repeat(40));
  
  const hasHandleRequest = typeof handleRequest === 'function';
  const hasRunWorkflowStage = typeof runWorkflowStage === 'function';
  const hasRunStage1Strategy = typeof runStage1Strategy === 'function';
  const hasDataBridgeEndpoint = typeof DATABRIDGE_ENDPOINT !== 'undefined';
  
  Logger.log('Functions present in this project:');
  Logger.log('  • handleRequest: ' + (hasHandleRequest ? '✅' : '❌'));
  Logger.log('  • runWorkflowStage: ' + (hasRunWorkflowStage ? '✅' : '❌'));
  Logger.log('  • runStage1Strategy: ' + (hasRunStage1Strategy ? '✅' : '❌'));
  Logger.log('  • DATABRIDGE_ENDPOINT: ' + (hasDataBridgeEndpoint ? '✅' : '❌'));
  Logger.log('');
  
  let projectType = 'UNKNOWN';
  if (hasHandleRequest && hasRunStage1Strategy && !hasRunWorkflowStage) {
    projectType = 'DATABRIDGE';
    Logger.log('📌 PROJECT TYPE: DATABRIDGE');
    Logger.log('   This is your DataBridge backend project');
    Logger.log('');
  } else if (hasRunWorkflowStage && hasDataBridgeEndpoint && !hasHandleRequest) {
    projectType = 'UI';
    Logger.log('📌 PROJECT TYPE: UI');
    Logger.log('   This is your UI/frontend project');
    Logger.log('');
  } else if (hasHandleRequest && hasRunWorkflowStage) {
    projectType = 'MIXED';
    Logger.log('⚠️ PROJECT TYPE: MIXED (PROBLEM!)');
    Logger.log('   This project has BOTH DataBridge and UI code');
    Logger.log('   This causes confusion and errors');
    Logger.log('');
  }
  
  // Step 2: Check URL being used
  Logger.log('STEP 2: Check DataBridge URL');
  Logger.log('─'.repeat(40));
  
  const correctURL = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
  
  if (hasDataBridgeEndpoint) {
    Logger.log('URL in workflow_connector.gs:');
    Logger.log('  ' + DATABRIDGE_ENDPOINT);
    Logger.log('');
    Logger.log('Correct URL:');
    Logger.log('  ' + correctURL);
    Logger.log('');
    
    if (DATABRIDGE_ENDPOINT === correctURL) {
      Logger.log('✅ URLs MATCH - Using correct URL');
    } else {
      Logger.log('❌ URLs DO NOT MATCH - This is the problem!');
      Logger.log('');
      Logger.log('🔧 FIX: Update workflow_connector.gs line 8 to:');
      Logger.log('const DATABRIDGE_ENDPOINT = \'' + correctURL + '\';');
    }
  } else {
    Logger.log('❌ DATABRIDGE_ENDPOINT not defined');
    Logger.log('   Missing workflow_connector.gs file');
  }
  Logger.log('');
  
  // Step 3: Test the URL
  Logger.log('STEP 3: Test URL with ping');
  Logger.log('─'.repeat(40));
  
  if (hasDataBridgeEndpoint) {
    try {
      const pingPayload = { action: 'ping' };
      const pingOptions = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(pingPayload),
        muteHttpExceptions: true
      };
      
      Logger.log('Calling: ' + DATABRIDGE_ENDPOINT);
      const response = UrlFetchApp.fetch(DATABRIDGE_ENDPOINT, pingOptions);
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      Logger.log('HTTP Status: ' + code);
      Logger.log('Response: ' + text);
      Logger.log('');
      
      if (code === 200) {
        const result = JSON.parse(text);
        if (result.success) {
          Logger.log('✅ Ping successful - URL is reachable');
        } else {
          Logger.log('⚠️ URL responds but returned error');
        }
      } else if (code === 429) {
        Logger.log('⚠️ HTTP 429 - Rate limited');
        Logger.log('Wait 1 minute and try again');
      } else {
        Logger.log('❌ HTTP ' + code + ' - URL not working');
      }
    } catch (error) {
      Logger.log('❌ Error calling URL: ' + error.message);
    }
  } else {
    Logger.log('⏭️ Skipping - No URL defined');
  }
  Logger.log('');
  
  // Step 4: Test workflow:stage1
  Logger.log('STEP 4: Test workflow:stage1 action');
  Logger.log('─'.repeat(40));
  
  if (hasDataBridgeEndpoint && projectType !== 'DATABRIDGE') {
    try {
      const workflowPayload = {
        action: 'workflow:stage1',
        modelName: 'gemini-2.5-flash',
        data: {
          projectId: 'DIAGNOSTIC_TEST',
          brandName: 'Test Brand',
          coreTopic: 'Test Topic',
          targetAudience: 'Test Audience'
        }
      };
      
      const workflowOptions = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(workflowPayload),
        muteHttpExceptions: true
      };
      
      Logger.log('Calling: ' + DATABRIDGE_ENDPOINT);
      Logger.log('Action: workflow:stage1');
      Logger.log('');
      
      const response = UrlFetchApp.fetch(DATABRIDGE_ENDPOINT, workflowOptions);
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      Logger.log('HTTP Status: ' + code);
      
      if (code === 200) {
        const result = JSON.parse(text);
        if (result.success && result.json && result.report) {
          Logger.log('✅ workflow:stage1 WORKS!');
          Logger.log('   Response has json: ✅');
          Logger.log('   Response has report: ✅');
        } else if (!result.success) {
          Logger.log('❌ workflow:stage1 FAILED');
          Logger.log('   Error: ' + result.error);
          Logger.log('');
          
          if (result.error && result.error.includes('Unknown action')) {
            Logger.log('🚨 ROOT CAUSE IDENTIFIED:');
            Logger.log('   The URL is calling a DataBridge deployment that');
            Logger.log('   does NOT have the workflow routing code!');
            Logger.log('');
            Logger.log('   Possible causes:');
            Logger.log('   1. Wrong URL (old deployment)');
            Logger.log('   2. DataBridge code not saved');
            Logger.log('   3. Need new deployment version');
          }
        }
      } else if (code === 429) {
        Logger.log('⚠️ HTTP 429 - Rate limited');
        Logger.log('Wait 1 minute and try again');
      } else {
        Logger.log('❌ HTTP ' + code);
        Logger.log('Response: ' + text.substring(0, 200));
      }
    } catch (error) {
      Logger.log('❌ Error: ' + error.message);
    }
  } else if (projectType === 'DATABRIDGE') {
    Logger.log('⏭️ Skipping - This IS the DataBridge project');
    Logger.log('   No need to call external URL');
  } else {
    Logger.log('⏭️ Skipping - No URL defined');
  }
  Logger.log('');
  
  // Summary and recommendations
  Logger.log('========================================');
  Logger.log('📊 SUMMARY & RECOMMENDATIONS');
  Logger.log('========================================\n');
  
  if (projectType === 'DATABRIDGE') {
    Logger.log('ℹ️ You ran this in your DATABRIDGE project');
    Logger.log('');
    Logger.log('To test UI → DataBridge connection:');
    Logger.log('1. Open your UI Apps Script project (bound to Google Sheet)');
    Logger.log('2. Run this diagnostic there');
    Logger.log('3. Or run testUIModelSelection() there');
    Logger.log('');
    
  } else if (projectType === 'UI') {
    if (!hasDataBridgeEndpoint) {
      Logger.log('❌ PROBLEM: workflow_connector.gs missing');
      Logger.log('');
      Logger.log('🔧 FIX:');
      Logger.log('1. In VS Code: Open ui/workflow_connector.gs');
      Logger.log('2. Copy entire contents');
      Logger.log('3. In Apps Script: Files (+) → Script → Name: workflow_connector.gs');
      Logger.log('4. Paste and save');
      Logger.log('');
    } else if (DATABRIDGE_ENDPOINT !== correctURL) {
      Logger.log('❌ PROBLEM: Wrong DataBridge URL');
      Logger.log('');
      Logger.log('🔧 FIX:');
      Logger.log('1. Open workflow_connector.gs in this project');
      Logger.log('2. Line 8: Update DATABRIDGE_ENDPOINT to:');
      Logger.log('   \'' + correctURL + '\'');
      Logger.log('3. Save');
      Logger.log('4. Re-run testUIModelSelection()');
      Logger.log('');
    } else {
      Logger.log('✅ URL is correct');
      Logger.log('');
      Logger.log('If still getting errors, check:');
      Logger.log('1. Is DataBridge deployed? (Check script.google.com)');
      Logger.log('2. Run diagnostic_code_check.gs in DataBridge project');
      Logger.log('3. Create new DataBridge deployment version');
      Logger.log('');
    }
    
  } else if (projectType === 'MIXED') {
    Logger.log('❌ PROBLEM: Project has both DataBridge AND UI code');
    Logger.log('');
    Logger.log('This causes confusion. You need 2 separate projects:');
    Logger.log('');
    Logger.log('🔧 FIX:');
    Logger.log('1. DataBridge Project (standalone):');
    Logger.log('   • Has: handleRequest, runStage1Strategy, etc.');
    Logger.log('   • NO: runWorkflowStage, workflow_connector.gs');
    Logger.log('');
    Logger.log('2. UI Project (bound to Google Sheet):');
    Logger.log('   • Has: runWorkflowStage, workflow_connector.gs');
    Logger.log('   • NO: handleRequest, runStage1Strategy');
    Logger.log('');
    Logger.log('Currently your project has BOTH - separate them!');
    Logger.log('');
    
  } else {
    Logger.log('❓ UNKNOWN project type');
    Logger.log('Check which files are present in this project');
    Logger.log('');
  }
  
  Logger.log('Script ID: ' + ScriptApp.getScriptId());
  Logger.log('');
}


/**
 * Quick test to call from UI project
 */
function testUIToDataBridgeFlow() {
  Logger.log('=== TESTING UI → DATABRIDGE FLOW ===\n');
  
  // Check if runWorkflowStage exists
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ runWorkflowStage function NOT FOUND');
    Logger.log('   You need to add workflow_connector.gs to this project\n');
    return { success: false, error: 'runWorkflowStage not found' };
  }
  
  Logger.log('✅ runWorkflowStage function exists');
  Logger.log('📞 Calling runWorkflowStage(1, {test: true})...\n');
  
  const testData = {
    projectId: 'UI_TEST',
    brandName: 'Test',
    coreTopic: 'Testing',
    targetAudience: 'Developers'
  };
  
  const result = runWorkflowStage(1, testData, 'gemini-2.5-flash');
  
  Logger.log('📨 Response received:');
  Logger.log(JSON.stringify(result, null, 2));
  Logger.log('');
  
  if (result.success) {
    Logger.log('✅ TEST PASSED!');
    Logger.log('   Stage 1 completed successfully');
  } else {
    Logger.log('⚠️  TEST WARNING: Got response but success=false');
    Logger.log('   Error: ' + result.error);
  }
  
  return result;
}

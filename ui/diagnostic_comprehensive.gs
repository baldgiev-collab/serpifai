/**
 * 🔍 COMPREHENSIVE DIAGNOSTIC TEST
 * Run this to see exactly what's being sent to DataBridge
 * 
 * NOTE: This file uses ENDPOINTS.DATABRIDGE from Code.gs
 * Do not run this file - it's obsolete. Use DIAGNOSTIC_UI_FULL.gs instead.
 */

// REMOVED: const DATABRIDGE_ENDPOINT - now uses ENDPOINTS.DATABRIDGE from Code.gs

function diagnosticFullPayloadTest() {
  Logger.log('╔════════════════════════════════════════════╗');
  Logger.log('║  COMPREHENSIVE PAYLOAD DIAGNOSTIC TEST     ║');
  Logger.log('╚════════════════════════════════════════════╝');
  
  Logger.log('\n⚠️ THIS FILE IS OBSOLETE!');
  Logger.log('Please use DIAGNOSTIC_UI_FULL.gs instead.');
  Logger.log('Run QUICK_TEST_UI() function.\n');
  
  return { error: 'Use DIAGNOSTIC_UI_FULL.gs instead' };
  
  // Step 1: Build payload exactly like UI does
  Logger.log('\n📋 STEP 1: Building payload like UI does');
  Logger.log('─────────────────────────────────────────────');
  
  const formData = {
    brandName: 'Test Brand',
    primaryKeyword: 'test keyword',
    businessCategory: 'Test Category',
    coreTopic: 'Test Topic',
    targetAudience: 'Test Audience'
  };
  
  const payload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'DIAGNOSTIC_TEST_' + Date.now(),
    model: 'gemini-2.5-flash',
    ...formData
  };
  
  Logger.log('✅ Payload built');
  Logger.log('   Keys: ' + Object.keys(payload).join(', '));
  Logger.log('   projectId: ' + payload.projectId);
  Logger.log('   stageNum: ' + payload.stageNum);
  Logger.log('   model: ' + payload.model);
  Logger.log('   Full payload: ' + JSON.stringify(payload, null, 2));
  
  // Step 2: Call runWorkflowStage
  Logger.log('\n📞 STEP 2: Calling runWorkflowStage with payload');
  Logger.log('─────────────────────────────────────────────');
  
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ ERROR: runWorkflowStage function not found!');
    Logger.log('   Add workflow_connector.gs to this project');
    return;
  }
  
  const result = runWorkflowStage(payload);
  
  // Step 3: Analyze result
  Logger.log('\n📥 STEP 3: Analyzing DataBridge response');
  Logger.log('─────────────────────────────────────────────');
  
  Logger.log('Response type: ' + typeof result);
  Logger.log('Response keys: ' + (result ? Object.keys(result).join(', ') : 'null'));
  Logger.log('Success: ' + (result && result.success));
  Logger.log('Error: ' + (result && result.error));
  
  if (result && result.success === false) {
    Logger.log('\n❌ REQUEST FAILED');
    Logger.log('Error message: ' + result.error);
    
    // Diagnose the error
    if (result.error && result.error.includes('Missing projectId')) {
      Logger.log('\n🔍 DIAGNOSIS: projectId is missing from payload.data');
      Logger.log('   This means workflow_connector.gs is not passing projectId correctly');
      Logger.log('   Expected: { action: "workflow:stage1", data: { projectId: "...", ... } }');
    } else if (result.error && result.error.includes('Unknown action')) {
      Logger.log('\n🔍 DIAGNOSIS: DataBridge does not recognize the action');
      Logger.log('   Check that workflow:stage1 is supported in workflow_router.gs');
    } else {
      Logger.log('\n🔍 DIAGNOSIS: Unknown error - check DataBridge logs');
    }
  } else if (result && result.success === true) {
    Logger.log('\n✅ REQUEST SUCCESSFUL!');
    Logger.log('Has json: ' + !!result.json);
    Logger.log('Has report: ' + !!result.report);
    Logger.log('Stage: ' + result.stage);
  } else {
    Logger.log('\n⚠️ UNEXPECTED RESPONSE FORMAT');
    Logger.log('Full response: ' + JSON.stringify(result));
  }
  
  // Step 4: Test DataBridge directly
  Logger.log('\n🔬 STEP 4: Testing DataBridge directly (bypass workflow_connector)');
  Logger.log('─────────────────────────────────────────────');
  
  const directPayload = {
    action: 'workflow:stage1',
    data: {
      projectId: 'DIRECT_TEST_' + Date.now(),
      brandName: 'Direct Test Brand',
      primaryKeyword: 'direct test',
      businessCategory: 'Testing'
    },
    modelName: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Direct payload: ' + JSON.stringify(directPayload, null, 2));
  
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(directPayload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(DATABRIDGE_ENDPOINT, options);
    const directResult = JSON.parse(response.getContentText());
    
    Logger.log('Direct test result:');
    Logger.log('   Success: ' + directResult.success);
    Logger.log('   Error: ' + (directResult.error || 'None'));
    Logger.log('   Has json: ' + !!directResult.json);
    Logger.log('   Has report: ' + !!directResult.report);
    
    if (directResult.success) {
      Logger.log('\n✅ DIRECT TEST PASSED - Issue is in workflow_connector.gs');
    } else {
      Logger.log('\n❌ DIRECT TEST FAILED - Issue is in DataBridge');
      Logger.log('   Error: ' + directResult.error);
    }
  } catch (error) {
    Logger.log('❌ Direct test error: ' + error.toString());
  }
  
  // Summary
  Logger.log('\n╔════════════════════════════════════════════╗');
  Logger.log('║  DIAGNOSTIC SUMMARY                        ║');
  Logger.log('╚════════════════════════════════════════════╝');
  
  if (result && result.success) {
    Logger.log('✅ Everything is working correctly!');
  } else if (result && result.error && result.error.includes('Missing projectId')) {
    Logger.log('🔧 FIX: workflow_connector.gs needs to pass projectId in data object');
    Logger.log('   Current: { action: "...", data: <entire payload> }');
    Logger.log('   Expected: { action: "...", data: { projectId: "...", ... } }');
  } else {
    Logger.log('⚠️ Issue requires further investigation');
    Logger.log('   Check DataBridge execution logs for more details');
  }
}

/**
 * Quick test to verify payload structure
 */
function testPayloadStructure() {
  Logger.log('=== PAYLOAD STRUCTURE TEST ===\n');
  
  // Simulate what UI sends
  const uiPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'TEST_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'Test',
    primaryKeyword: 'test'
  };
  
  Logger.log('1️⃣ UI sends to workflow_connector:');
  Logger.log(JSON.stringify(uiPayload, null, 2));
  
  // Simulate what workflow_connector should send to DataBridge
  const databridgePayload = {
    action: 'workflow:stage1',
    data: uiPayload,  // This includes projectId
    modelName: uiPayload.model,
    timestamp: new Date().toISOString()
  };
  
  Logger.log('\n2️⃣ workflow_connector sends to DataBridge:');
  Logger.log(JSON.stringify(databridgePayload, null, 2));
  
  Logger.log('\n3️⃣ Checking data.projectId:');
  Logger.log('   data.projectId = ' + databridgePayload.data.projectId);
  
  if (databridgePayload.data.projectId) {
    Logger.log('   ✅ projectId exists in data');
  } else {
    Logger.log('   ❌ projectId is MISSING from data');
  }
}

/**
 * 🧪 UI → DataBridge Integration Test
 * Run this in your UI Apps Script project to verify end-to-end workflow
 */

/**
 * Test complete UI to DataBridge workflow
 */
function testUIToDataBridgeFlow() {
  Logger.log('=== TESTING UI → DATABRIDGE FLOW ===');
  
  // Check if runWorkflowStage exists
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ runWorkflowStage function NOT FOUND');
    Logger.log('   You need to add workflow_connector.gs to this project');
    return;
  }
  
  Logger.log('✅ runWorkflowStage function found');
  
  // Test data
  const testFormData = {
    projectName: 'TEST_UI_' + Date.now(),
    brandName: 'Test Brand',
    primaryKeyword: 'test keyword',
    businessCategory: 'Test Category'
  };
  
  Logger.log('📤 Calling DataBridge Stage 1 with test data...');
  
  // Build single payload object (matching new UI pattern)
  const payload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'TEST_UI_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'Test Brand',
    primaryKeyword: 'test keyword',
    businessCategory: 'Test Category'
  };
  
  // Call Stage 1 with new payload pattern
  const result = runWorkflowStage(payload);
  
  Logger.log('📥 Response received:');
  Logger.log('   success: ' + (result.success || false));
  Logger.log('   stage: ' + (result.stage || 'N/A'));
  
  if (result.success) {
    Logger.log('   ✅ Has json: ' + (!!result.json));
    Logger.log('   ✅ Has report: ' + (!!result.report));
    Logger.log('   ✅ Report length: ' + (result.report ? result.report.length : 0) + ' chars');
    
    if (result.json) {
      const keys = Object.keys(result.json);
      Logger.log('   ✅ JSON fields (' + keys.length + '): ' + keys.join(', '));
    }
    
    Logger.log('\n🎉 UI → DATABRIDGE TEST PASSED!');
  } else {
    Logger.log('   ❌ Error: ' + (result.error || 'Unknown error'));
    Logger.log('\n❌ TEST FAILED');
  }
}

/**
 * Test DataBridge connection with ping
 */
function testDataBridgePing() {
  Logger.log('=== TESTING DATABRIDGE PING ===');
  
  if (typeof testDataBridgeConnection !== 'function') {
    Logger.log('❌ testDataBridgeConnection function NOT FOUND');
    Logger.log('   Add workflow_connector.gs to this project');
    return;
  }
  
  const result = testDataBridgeConnection();
  
  Logger.log('Response:');
  Logger.log('   Status: ' + (result.statusCode || 'N/A'));
  Logger.log('   Success: ' + (result.success || false));
  
  if (result.success) {
    Logger.log('   ✅ DataBridge is reachable');
    
    try {
      const parsed = JSON.parse(result.response);
      if (parsed.success) {
        Logger.log('   ✅ DataBridge router is working');
        Logger.log('   ✅ Message: ' + (parsed.message || 'N/A'));
      } else {
        Logger.log('   ❌ DataBridge returned error: ' + (parsed.error || 'Unknown'));
      }
    } catch (e) {
      Logger.log('   ⚠️ Response: ' + result.response);
    }
  } else {
    Logger.log('   ❌ Connection failed: ' + (result.error || 'Unknown error'));
  }
}

/**
 * Test model selection flow from UI
 */
function testUIModelSelection() {
  Logger.log('=== TESTING UI MODEL SELECTION FLOW ===');
  
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ Error: runWorkflowStage is not defined');
    Logger.log('   Add workflow_connector.gs to this project');
    return;
  }
  
  const testData = {
    projectName: 'MODEL_TEST_' + Date.now(),
    brandName: 'Model Test',
    primaryKeyword: 'test',
    businessCategory: 'Testing'
  };
  
  const selectedModel = 'gemini-2.5-flash';
  Logger.log('Simulating UI call with model: ' + selectedModel);
  
  // Build single payload object (matching new UI pattern)
  const payload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'MODEL_TEST_' + Date.now(),
    model: selectedModel,
    brandName: 'Model Test',
    primaryKeyword: 'test',
    businessCategory: 'Testing'
  };
  
  const result = runWorkflowStage(payload);
  
  if (result.success) {
    Logger.log('✅ Model selection flow works');
    Logger.log('   Stage: ' + result.stage);
    Logger.log('   Has data: ' + (!!result.json));
  } else {
    Logger.log('❌ Error: ' + (result.error || 'Unknown'));
  }
}

/**
 * Verify workflow_connector.gs is present
 */
function verifyUIProjectSetup() {
  Logger.log('=== VERIFYING UI PROJECT SETUP ===');
  
  const checks = {
    'runWorkflowStage': typeof runWorkflowStage === 'function',
    'testDataBridgeConnection': typeof testDataBridgeConnection === 'function',
    'DATABRIDGE_ENDPOINT': typeof DATABRIDGE_ENDPOINT !== 'undefined'
  };
  
  let allGood = true;
  
  for (let key in checks) {
    if (checks[key]) {
      Logger.log('✅ ' + key + ': Found');
    } else {
      Logger.log('❌ ' + key + ': Missing');
      allGood = false;
    }
  }
  
  if (allGood) {
    Logger.log('\n✅ UI PROJECT SETUP COMPLETE');
    Logger.log('   Ready to test workflow stages');
  } else {
    Logger.log('\n❌ SETUP INCOMPLETE');
    Logger.log('   Action: Copy workflow_connector.gs to this project');
  }
  
  return allGood;
}

const DATABRIDGE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';

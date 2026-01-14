/**
 * 🧪 Debug: Check what files are in this Apps Script project
 * Run this in Apps Script editor to see what files are loaded
 */
function listLoadedFiles() {
  Logger.log('=== FILES IN THIS PROJECT ===');
  
  // Try to call functions to see what exists
  const functions = [
    'include',
    'doGet', 
    'onOpen',
    'listProjects',
    'saveProject',
    'loadProject',
    'deleteProject',
    'renameProject',
    'getGeminiModels',
    'setGeminiModel',
    'runWorkflowStage',
    'runStage1Strategy',
    'runStage2Keywords',
    'testDataBridgeConnection'
  ];
  
  functions.forEach(function(fname) {
    try {
      const func = eval('typeof ' + fname);
      if (func === 'function') {
        Logger.log('✅ ' + fname + ' - EXISTS');
      } else {
        Logger.log('❌ ' + fname + ' - NOT A FUNCTION');
      }
    } catch (e) {
      Logger.log('❌ ' + fname + ' - NOT FOUND');
    }
  });
  
  Logger.log('\n=== ISSUE DIAGNOSIS ===');
  
  // Check if workflow_router functions exist
  if (typeof runWorkflowStage === 'function') {
    Logger.log('⚠️  WARNING: runWorkflowStage exists in UI project');
    Logger.log('   This means workflow_router.gs is in THIS project');
    Logger.log('   It should only be in DataBridge project!');
    Logger.log('');
    Logger.log('   FIX: Delete workflow_router.gs from this project');
  }
  
  // Check if connector exists
  if (typeof testDataBridgeConnection === 'function') {
    Logger.log('✅ GOOD: workflow_connector.gs is present');
  } else {
    Logger.log('❌ ERROR: workflow_connector.gs is missing');
    Logger.log('   UI cannot call DataBridge without it!');
  }
}

/**
 * Test if UI can call backend properly
 */
function testUItoBackendFlow() {
  Logger.log('=== TESTING UI → DATABRIDGE FLOW ===\n');
  
  // Test 1: Check connector exists
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ FAIL: runWorkflowStage function not found');
    Logger.log('   Make sure workflow_connector.gs is in this project');
    return;
  }
  
  Logger.log('✅ runWorkflowStage function exists\n');
  
  // Test 2: Try to call it
  try {
    Logger.log('📞 Calling runWorkflowStage(1, {test: true})...');
    const result = runWorkflowStage(1, {
      projectId: 'TEST',
      brandName: 'Test Brand',
      coreTopic: 'Test Topic'
    });
    
    Logger.log('📨 Response received:');
    Logger.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      Logger.log('\n✅ TEST PASSED: Workflow execution working!');
    } else {
      Logger.log('\n⚠️  TEST WARNING: Got response but success=false');
      Logger.log('   Error: ' + result.error);
    }
  } catch (error) {
    Logger.log('\n❌ TEST FAILED: ' + error.toString());
  }
}

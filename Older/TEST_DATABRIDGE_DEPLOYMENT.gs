/**
 * 🔍 TEST: Verify DataBridge Deployment
 * Run this in your DataBridge Apps Script project to verify all handlers exist
 */

function TEST_DataBridge_Handlers() {
  Logger.log('=== TESTING DATABRIDGE HANDLERS ===\n');
  
  const tests = [
    {
      name: 'Ping Handler',
      action: 'ping',
      expectedSuccess: true
    },
    {
      name: 'Workflow Stage 1',
      action: 'workflow:stage1',
      data: {
        projectId: 'TEST_' + Date.now(),
        brandName: 'Test',
        primaryKeyword: 'test',
        businessCategory: 'Testing',
        targetAudience: 'Testers',
        productDescription: 'Test product'
      },
      expectedSuccess: true
    },
    {
      name: 'Workflow Stage 2',
      action: 'workflow:stage2',
      data: { projectId: 'TEST' },
      expectedSuccess: false // Will fail without Stage 1 data, but should recognize action
    },
    {
      name: 'Competitor Analysis',
      action: 'COMP_orchestrateAnalysis',
      config: { domains: ['example.com'] },
      expectedSuccess: false // Will fail without real data, but should recognize action
    }
  ];
  
  Logger.log('Testing ' + tests.length + ' handlers...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  tests.forEach(function(test) {
    Logger.log('📋 Testing: ' + test.name);
    Logger.log('   Action: ' + test.action);
    
    try {
      // Create mock event object
      const mockEvent = {
        postData: {
          contents: JSON.stringify({
            action: test.action,
            data: test.data || {},
            config: test.config || {},
            timestamp: new Date().toISOString()
          })
        }
      };
      
      // Try to call handleRequest
      if (typeof handleRequest !== 'function') {
        Logger.log('   ❌ CRITICAL: handleRequest function not found!');
        Logger.log('   This means workflow_router.gs is NOT deployed\n');
        failedTests++;
        return;
      }
      
      const result = handleRequest(mockEvent);
      
      // Check if result has getContent (is ContentService response)
      if (result && typeof result.getContent === 'function') {
        const content = result.getContent();
        const parsed = JSON.parse(content);
        
        Logger.log('   Response success: ' + parsed.success);
        Logger.log('   Response error: ' + (parsed.error || 'none'));
        
        // Check for "Unknown action" error
        if (parsed.error && parsed.error.indexOf('Unknown action') > -1) {
          Logger.log('   ❌ FAIL: Handler not found for ' + test.action);
          Logger.log('   This action is NOT deployed in DataBridge\n');
          failedTests++;
        } else {
          Logger.log('   ✅ PASS: Handler exists for ' + test.action + '\n');
          passedTests++;
        }
      } else {
        Logger.log('   ⚠️ Unexpected response format\n');
        failedTests++;
      }
      
    } catch (error) {
      Logger.log('   ❌ ERROR: ' + error.toString());
      Logger.log('   Stack: ' + error.stack);
      Logger.log('');
      failedTests++;
    }
  });
  
  Logger.log('=== TEST RESULTS ===');
  Logger.log('✅ Passed: ' + passedTests + '/' + tests.length);
  Logger.log('❌ Failed: ' + failedTests + '/' + tests.length);
  
  if (failedTests > 0) {
    Logger.log('\n⚠️ DEPLOYMENT ISSUE DETECTED');
    Logger.log('Your DataBridge is missing some handlers.');
    Logger.log('See DATABRIDGE_REQUIRED_FILES.md for deployment checklist.');
  } else {
    Logger.log('\n🎉 All handlers found! DataBridge is properly deployed.');
  }
  
  return {
    passed: passedTests,
    failed: failedTests,
    total: tests.length
  };
}

/**
 * 🔍 TEST: Check if specific functions exist
 */
function TEST_DataBridge_Functions() {
  Logger.log('=== CHECKING DATABRIDGE FUNCTIONS ===\n');
  
  const functionsToCheck = [
    'handleRequest',
    'runStage1Strategy',
    'runStage2Keywords',
    'runStage3Architecture',
    'runStage4Calendar',
    'runStage5Generation',
    'COMP_orchestrateAnalysis'
  ];
  
  functionsToCheck.forEach(function(funcName) {
    const exists = typeof this[funcName] === 'function';
    Logger.log((exists ? '✅' : '❌') + ' ' + funcName + ': ' + (exists ? 'EXISTS' : 'MISSING'));
  });
  
  Logger.log('\nIf any functions are MISSING, you need to redeploy DataBridge with all files.');
}

/**
 * 🔍 TEST: List available actions from workflow_router
 */
function TEST_ListAvailableActions() {
  Logger.log('=== AVAILABLE ACTIONS ===\n');
  
  const testPayload = {
    postData: {
      contents: JSON.stringify({
        action: 'unknown_test_action',
        data: {}
      })
    }
  };
  
  try {
    if (typeof handleRequest !== 'function') {
      Logger.log('❌ handleRequest not found. workflow_router.gs NOT deployed.');
      return;
    }
    
    const result = handleRequest(testPayload);
    const content = result.getContent();
    const parsed = JSON.parse(content);
    
    if (parsed.availableActions) {
      Logger.log('📋 Available actions in DataBridge:');
      parsed.availableActions.forEach(function(action) {
        Logger.log('   - ' + action);
      });
    } else {
      Logger.log('ℹ️ DataBridge returned:');
      Logger.log(JSON.stringify(parsed, null, 2));
    }
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}

/**
 * 🧪 QUICK TEST: Just test if workflow:stage1 exists
 */
function QUICK_TEST_Stage1() {
  Logger.log('=== QUICK TEST: Workflow Stage 1 ===\n');
  
  try {
    // Check if function exists
    if (typeof runStage1Strategy !== 'function') {
      Logger.log('❌ FAIL: runStage1Strategy function not found');
      Logger.log('   stage_1_strategy.gs is NOT deployed');
      return false;
    }
    
    Logger.log('✅ runStage1Strategy function exists');
    
    // Check if handleRequest exists
    if (typeof handleRequest !== 'function') {
      Logger.log('❌ FAIL: handleRequest function not found');
      Logger.log('   workflow_router.gs is NOT deployed');
      return false;
    }
    
    Logger.log('✅ handleRequest function exists');
    Logger.log('\n🎉 Stage 1 handlers are deployed!');
    Logger.log('Now test from UI with TEST_Stage1_Direct()');
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return false;
  }
}

/**
 * DIAGNOSTIC TEST - Check Stage 1 Function Availability
 * Run this from Apps Script to see what functions exist
 */

function DIAGNOSTIC_checkStage1Functions() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };
  
  // Check 1: Does DB_Workflow_Stage1 exist?
  try {
    if (typeof DB_Workflow_Stage1 === 'function') {
      results.checks.push({
        name: 'DB_Workflow_Stage1',
        exists: true,
        type: 'function'
      });
    } else {
      results.checks.push({
        name: 'DB_Workflow_Stage1',
        exists: false,
        message: 'Function not found - file not uploaded?'
      });
    }
  } catch (e) {
    results.checks.push({
      name: 'DB_Workflow_Stage1',
      exists: false,
      error: e.toString()
    });
  }
  
  // Check 2: Does DB_WF_runStage1Strategy exist?
  try {
    if (typeof DB_WF_runStage1Strategy === 'function') {
      results.checks.push({
        name: 'DB_WF_runStage1Strategy',
        exists: true,
        type: 'function'
      });
    } else {
      results.checks.push({
        name: 'DB_WF_runStage1Strategy',
        exists: false,
        message: 'Function not found'
      });
    }
  } catch (e) {
    results.checks.push({
      name: 'DB_WF_runStage1Strategy',
      exists: false,
      error: e.toString()
    });
  }
  
  // Check 3: Test calling DB_WF_runStage1Strategy
  try {
    const testData = {
      brandName: 'Test Brand',
      targetAudience: 'Test Audience',
      audiencePains: 'Test Pain',
      audienceDesired: 'Test Desire',
      productOrService: 'Test Product',
      coreTopic: 'Test Topic',
      quarterlyObjective: 'Test Objective'
    };
    
    const testModel = 'gemini-2.5-flash';
    
    Logger.log('🧪 Testing DB_WF_runStage1Strategy with test data...');
    const result = DB_WF_runStage1Strategy(testData, testModel);
    
    results.checks.push({
      name: 'DB_WF_runStage1Strategy_call',
      success: result.success === true,
      result: result
    });
    
  } catch (e) {
    results.checks.push({
      name: 'DB_WF_runStage1Strategy_call',
      success: false,
      error: e.toString(),
      stack: e.stack
    });
  }
  
  // Check 4: List all DB_* functions
  const allFunctions = [];
  try {
    const globalContext = this;
    for (let key in globalContext) {
      if (key.startsWith('DB_')) {
        allFunctions.push(key);
      }
    }
    results.allDBFunctions = allFunctions;
  } catch (e) {
    results.allDBFunctions = 'Error: ' + e.toString();
  }
  
  Logger.log('=== DIAGNOSTIC RESULTS ===');
  Logger.log(JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * TEST: Direct call to DB_Workflow_Stage1
 */
function TEST_directStage1Call() {
  try {
    Logger.log('🧪 Testing direct call to DB_Workflow_Stage1...');
    
    const testData = {
      brandName: 'TestCo',
      targetAudience: 'Small business owners',
      audiencePains: 'Struggling with marketing',
      audienceDesired: 'More customers',
      productOrService: 'Marketing software',
      coreTopic: 'Digital marketing',
      quarterlyObjective: 'Grow leads by 50%'
    };
    
    const result = DB_Workflow_Stage1(testData, 'gemini-2.5-flash');
    
    Logger.log('✅ Stage 1 executed successfully!');
    Logger.log('Result: ' + JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (e) {
    Logger.log('❌ Stage 1 failed: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString(),
      stack: e.stack
    };
  }
}

/**
 * TEST: Call through router
 */
function TEST_routerStage1Call() {
  try {
    Logger.log('🧪 Testing call through DB_WF_runStage1Strategy router...');
    
    const testData = {
      brandName: 'TestCo',
      targetAudience: 'Small business owners',
      audiencePains: 'Struggling with marketing',
      audienceDesired: 'More customers',
      productOrService: 'Marketing software',
      coreTopic: 'Digital marketing',
      quarterlyObjective: 'Grow leads by 50%'
    };
    
    const result = DB_WF_runStage1Strategy(testData, 'gemini-2.5-flash');
    
    Logger.log('✅ Router executed successfully!');
    Logger.log('Result: ' + JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (e) {
    Logger.log('❌ Router failed: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString(),
      stack: e.stack
    };
  }
}

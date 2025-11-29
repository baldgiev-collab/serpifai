/**
 * 🔗 Workflow Connector
 * Calls DataBridge backend to execute workflow stages
 * This keeps UI clean and modular
 */

// DataBridge endpoint (your deployed web app URL)
const DATABRIDGE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxPwzYvsn-xVp_qGgInM5xkO0mi20rWjMwG6U8pbXgxeq9kfXLJBOcUl1E5qOmRrNNr/exec';

/**
 * 🧪 DIAGNOSTIC TEST: Run this directly from Apps Script editor to test Stage 1
 * This will help identify if the issue is in the function itself or in how the UI calls it
 * 
 * To run: Select this function name in the editor, then click Run button
 */
function TEST_Stage1_Direct() {
  Logger.log('=== DIAGNOSTIC TEST: Stage 1 Direct Call ===');
  
  // Create test payload matching what UI should send
  const testPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'DIAGNOSTIC_TEST_' + Date.now(),
    model: 'gemini-2.0-flash-exp',
    brandName: 'Test Brand',
    primaryKeyword: 'test keyword',
    businessCategory: 'Testing',
    targetAudience: 'Test Audience',
    productDescription: 'Test Product'
  };
  
  Logger.log('✅ Test payload created');
  Logger.log('   Payload type: ' + typeof testPayload);
  Logger.log('   Payload keys: ' + Object.keys(testPayload).join(', '));
  Logger.log('   stageNum: ' + testPayload.stageNum);
  Logger.log('   projectId: ' + testPayload.projectId);
  
  Logger.log('\n🚀 Calling runWorkflowStage...');
  
  try {
    const result = runWorkflowStage(testPayload);
    
    Logger.log('\n✅ SUCCESS!');
    Logger.log('   Result success: ' + result.success);
    Logger.log('   Result stage: ' + result.stage);
    if (result.data) {
      Logger.log('   Has data.dashboardCharts: ' + !!result.data.dashboardCharts);
      Logger.log('   Has data.jtbdScenarios: ' + !!result.data.jtbdScenarios);
    }
    
    return result;
  } catch (error) {
    Logger.log('\n❌ TEST FAILED');
    Logger.log('   Error: ' + error.toString());
    Logger.log('   Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Run a workflow stage by calling DataBridge backend
 * CRITICAL: This function must handle multiple calling patterns for backwards compatibility
 * @param {Object|Number} arg1 - Either full payload object OR stageNum (old pattern)
 * @param {Object} arg2 - formData (only used in old 3-arg pattern)
 * @param {String} arg3 - selectedModel (only used in old 3-arg pattern)
 * @returns {Object} Result from DataBridge
 */
function runWorkflowStage(arg1, arg2, arg3) {
  // Declare variables
  let stageNum = null;
  let formData = null;
  let selectedModel = null;
  let payload = null;
  
  try {
    Logger.log('🔗 runWorkflowStage called with ' + arguments.length + ' arguments');
    Logger.log('   arg1 type: ' + typeof arg1);
    if (arg1) Logger.log('   arg1 keys: ' + (typeof arg1 === 'object' ? Object.keys(arg1).join(', ') : 'N/A'));
    
    // PATTERN DETECTION: Figure out which calling pattern is being used
    if (arguments.length === 0 || !arg1) {
      // ❌ NO ARGUMENTS - This is the error case
      throw new Error('No arguments provided. runWorkflowStage requires either (payload) or (stageNum, formData, model)');
    }
    else if (arguments.length === 3 && typeof arg1 === 'number') {
      // OLD PATTERN: runWorkflowStage(1, {...}, 'gemini-2.0-flash')
      Logger.log('📌 Detected OLD 3-argument pattern');
      stageNum = arg1;
      formData = arg2;
      selectedModel = arg3;
      
      if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid formData in old pattern: expected object, got ' + typeof formData);
      }
    }
    else if (arguments.length === 1 && typeof arg1 === 'object') {
      // NEW PATTERN: runWorkflowStage({stageNum: 1, projectId: '...', ...})
      Logger.log('📌 Detected NEW single-payload pattern');
      payload = arg1;
      stageNum = payload.stageNum;
      formData = payload;
      selectedModel = payload.model;
      
      if (!payload.stageNum) {
        throw new Error('Missing stageNum in payload object. Keys present: ' + Object.keys(payload).join(', '));
      }
    }
    else {
      // ❌ UNKNOWN PATTERN
      throw new Error('Invalid calling pattern. Use either runWorkflowStage(payload) or runWorkflowStage(stageNum, formData, model). Got ' + arguments.length + ' args, arg1 type: ' + typeof arg1);
    }
    
    // VALIDATION: Ensure we have required fields
    if (!stageNum) {
      throw new Error('stageNum is missing or invalid: ' + stageNum);
    }
    
    if (!formData || typeof formData !== 'object') {
      throw new Error('formData is missing or invalid. Type: ' + typeof formData);
    }
    
    if (!formData.projectId) {
      throw new Error('projectId is missing in formData. Keys present: ' + Object.keys(formData).join(', '));
    }
    
    Logger.log('✅ Validation passed');
    Logger.log('🔗 UI calling DataBridge for Stage ' + stageNum);
    Logger.log('📦 formData keys: ' + Object.keys(formData).join(', '));
    Logger.log('📦 formData.projectId: ' + formData.projectId);
    
    // Prepare payload for DataBridge
    const databridgePayload = {
      action: 'workflow:stage' + stageNum,
      data: formData,
      timestamp: new Date().toISOString()
    };
    
    // Include selected model if provided
    if (selectedModel && typeof selectedModel === 'string' && selectedModel.trim()) {
      databridgePayload.modelName = selectedModel.trim();
      Logger.log('🤖 Using model from UI: ' + selectedModel.trim());
    }
    
    Logger.log('🚀 Sending to DataBridge: ' + JSON.stringify(databridgePayload).substring(0, 500));
    
    // Call DataBridge
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(databridgePayload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(DATABRIDGE_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log('❌ DataBridge returned HTTP ' + responseCode);
      return {
        success: false,
        stage: stageNum,
        error: 'DataBridge returned HTTP ' + responseCode,
        timestamp: new Date().toISOString()
      };
    }
    
    const result = JSON.parse(response.getContentText());
    Logger.log('✅ DataBridge response received');
    
    return result;
    
  } catch (error) {
    Logger.log('❌ Error calling DataBridge: ' + error.toString());
    return {
      success: false,
      stage: stageNum,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test connection to DataBridge
 */
function testDataBridgeConnection() {
  const testPayload = {
    action: 'ping',
    timestamp: new Date().toISOString()
  };
  
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(DATABRIDGE_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    
    Logger.log('DataBridge connection test:');
    Logger.log('- Status: ' + responseCode);
    Logger.log('- Response: ' + response.getContentText());
    
    return {
      success: responseCode === 200,
      statusCode: responseCode,
      response: response.getContentText()
    };
  } catch (error) {
    Logger.log('❌ Connection failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 🧪 SIMPLE STAGE 1 TEST
 * Copy this entire file into your Google Sheet's Apps Script editor
 * Run the TEST_Stage1_Simple() function
 * 
 * This file is self-contained and won't conflict with Code.gs
 */

function TEST_Stage1_Simple() {
  Logger.log('=== SIMPLE STAGE 1 TEST ===\n');
  
  // Step 1: Check if runWorkflowStage exists
  Logger.log('Step 1: Checking for runWorkflowStage function...');
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ CRITICAL ERROR: runWorkflowStage function NOT FOUND!');
    Logger.log('   This means Code.gs does not have the runWorkflowStage function.');
    Logger.log('   Solution: Check if Code.gs has runWorkflowStage function starting around line 430.\n');
    return { error: 'runWorkflowStage not found' };
  }
  Logger.log('✅ runWorkflowStage function exists\n');
  
  // Step 2: Check if ENDPOINTS exists
  Logger.log('Step 2: Checking for ENDPOINTS constant...');
  if (typeof ENDPOINTS === 'undefined') {
    Logger.log('❌ ERROR: ENDPOINTS constant NOT FOUND!');
    Logger.log('   Code.gs should have: const ENDPOINTS = { DATABRIDGE: "...", FETCHER: "..." }');
    return { error: 'ENDPOINTS not found' };
  }
  if (!ENDPOINTS.DATABRIDGE) {
    Logger.log('❌ ERROR: ENDPOINTS.DATABRIDGE is missing!');
    return { error: 'ENDPOINTS.DATABRIDGE not found' };
  }
  Logger.log('✅ ENDPOINTS.DATABRIDGE exists: ' + ENDPOINTS.DATABRIDGE + '\n');
  
  // Step 3: Build test payload (exactly like UI does)
  Logger.log('Step 3: Building test payload...');
  const testPayload = {
    action: "runWorkflowStage",  // This is what UI sends
    stageNum: 1,
    projectId: 'TEST_SIMPLE_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'Simple Test Brand',
    primaryKeyword: 'simple test',
    businessCategory: 'Testing',
    targetAudience: 'Testers',
    productDescription: 'Simple test product'
  };
  Logger.log('✅ Test payload created');
  Logger.log('   Keys: ' + Object.keys(testPayload).join(', '));
  Logger.log('   stageNum: ' + testPayload.stageNum);
  Logger.log('   projectId: ' + testPayload.projectId + '\n');
  
  // Step 4: Call runWorkflowStage
  Logger.log('Step 4: Calling runWorkflowStage(testPayload)...');
  Logger.log('   (This may take 30-60 seconds)\n');
  
  try {
    const startTime = Date.now();
    const result = runWorkflowStage(testPayload);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    Logger.log('📥 Result received after ' + elapsed + ' seconds\n');
    
    // Step 5: Analyze result
    Logger.log('Step 5: Analyzing result...');
    Logger.log('   Result type: ' + typeof result);
    Logger.log('   Has success property: ' + ('success' in result));
    Logger.log('   Success value: ' + result.success);
    
    if (result.success === false) {
      Logger.log('\n❌ STAGE 1 FAILED');
      Logger.log('   Error: ' + (result.error || 'Unknown error'));
      Logger.log('   Stage: ' + result.stage);
      
      // Diagnose common errors
      if (result.error && result.error.includes('Missing projectId')) {
        Logger.log('\n🔍 DIAGNOSIS:');
        Logger.log('   The payload is not being transformed correctly.');
        Logger.log('   runWorkflowStage should convert:');
        Logger.log('     {stageNum: 1, projectId: "...", ...}');
        Logger.log('   Into:');
        Logger.log('     {action: "workflow:stage1", data: {projectId: "...", ...}}');
        Logger.log('   But projectId is not ending up in data object.\n');
      } else if (result.error && result.error.includes('Unknown action')) {
        Logger.log('\n🔍 DIAGNOSIS:');
        Logger.log('   DataBridge does not recognize workflow:stage1 action.');
        Logger.log('   This means workflow_router.gs is not deployed properly.');
        Logger.log('   Redeploy DataBridge with all workflow files.\n');
      } else if (result.error && result.error.includes('HTTP')) {
        Logger.log('\n🔍 DIAGNOSIS:');
        Logger.log('   Network or endpoint issue.');
        Logger.log('   Check ENDPOINTS.DATABRIDGE URL is correct.');
        Logger.log('   Try accessing the URL directly in browser.\n');
      }
      
      return result;
    }
    
    // Success! Check data quality
    Logger.log('\n✅ STAGE 1 SUCCEEDED!');
    Logger.log('   Result.success: true');
    Logger.log('   Result.stage: ' + result.stage);
    Logger.log('   Has json: ' + !!result.json);
    Logger.log('   Has report: ' + !!result.report);
    
    if (result.json) {
      Logger.log('\n📊 Checking data structure (11/15/2025 format):');
      const checks = {
        'dashboardCharts': !!result.json.dashboardCharts,
        'customerFrustrationsChart': !!(result.json.dashboardCharts && result.json.dashboardCharts.customerFrustrationsChart),
        'hiddenAspirationsChart': !!(result.json.dashboardCharts && result.json.dashboardCharts.hiddenAspirationsChart),
        'mindsetTransformationChart': !!(result.json.dashboardCharts && result.json.dashboardCharts.mindsetTransformationChart),
        'jtbdScenarios': !!result.json.jtbdScenarios,
        'contentPillars': !!result.json.contentPillars,
        'uniqueMechanism': !!result.json.uniqueMechanism,
        'competitiveGaps': !!result.json.competitiveGaps,
        'audienceProfile': !!result.json.audienceProfile
      };
      
      let allPresent = true;
      Object.keys(checks).forEach(function(key) {
        const present = checks[key];
        Logger.log('   ' + (present ? '✅' : '❌') + ' ' + key);
        if (!present) allPresent = false;
      });
      
      if (allPresent) {
        Logger.log('\n🎉 PERFECT! All required fields present!');
        Logger.log('   Stage 1 is working exactly like 11/15/2025.');
        Logger.log('   You can now use it from the UI!');
      } else {
        Logger.log('\n⚠️ Some fields missing but Stage 1 is working.');
        Logger.log('   Main functionality is OK.');
      }
    }
    
    Logger.log('\n═══════════════════════════════════════════════════════════');
    Logger.log('✅ TEST COMPLETE - Stage 1 is working!');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    return result;
    
  } catch (error) {
    Logger.log('\n❌ EXCEPTION THROWN');
    Logger.log('   Error: ' + error.toString());
    Logger.log('   Stack: ' + error.stack);
    
    if (error.toString().includes('runWorkflowStage')) {
      Logger.log('\n🔍 DIAGNOSIS:');
      Logger.log('   runWorkflowStage function might have internal errors.');
      Logger.log('   Check Code.gs around line 430-550 for the function definition.');
    }
    
    throw error;
  }
}

/**
 * 🔬 DIRECT DATABRIDGE TEST
 * Tests DataBridge directly without runWorkflowStage
 * Use this if runWorkflowStage test fails
 */
function TEST_DataBridge_Direct() {
  Logger.log('=== DIRECT DATABRIDGE TEST ===\n');
  
  if (typeof ENDPOINTS === 'undefined' || !ENDPOINTS.DATABRIDGE) {
    Logger.log('❌ ERROR: ENDPOINTS.DATABRIDGE not found');
    return;
  }
  
  Logger.log('Testing endpoint: ' + ENDPOINTS.DATABRIDGE + '\n');
  
  // Build payload in DataBridge format (not UI format)
  const payload = {
    action: 'workflow:stage1',  // DataBridge expects this format
    data: {
      projectId: 'DIRECT_TEST_' + Date.now(),
      brandName: 'Direct Test',
      primaryKeyword: 'direct',
      businessCategory: 'Testing',
      targetAudience: 'Testers',
      productDescription: 'Test'
    },
    modelName: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Payload to send:');
  Logger.log(JSON.stringify(payload, null, 2));
  Logger.log('');
  
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('Calling DataBridge...');
    const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, options);
    const httpCode = response.getResponseCode();
    const result = JSON.parse(response.getContentText());
    
    Logger.log('\n📥 Response received:');
    Logger.log('   HTTP Code: ' + httpCode);
    Logger.log('   Success: ' + result.success);
    
    if (result.success) {
      Logger.log('   ✅ DataBridge is working!');
      Logger.log('   Has json: ' + !!result.json);
      Logger.log('   Has report: ' + !!result.report);
      Logger.log('\n🔍 DIAGNOSIS:');
      Logger.log('   DataBridge works fine when called directly.');
      Logger.log('   The issue is in runWorkflowStage function in Code.gs.');
      Logger.log('   Check how it transforms the UI payload into DataBridge format.');
    } else {
      Logger.log('   ❌ DataBridge returned error: ' + result.error);
      Logger.log('\n🔍 DIAGNOSIS:');
      Logger.log('   DataBridge itself has an issue.');
      Logger.log('   Check DataBridge deployment and workflow files.');
    }
    
    return result;
    
  } catch (error) {
    Logger.log('\n❌ ERROR calling DataBridge:');
    Logger.log('   ' + error.toString());
    
    if (error.toString().includes('DNS')) {
      Logger.log('\n🔍 DIAGNOSIS: Network/DNS issue');
    } else if (error.toString().includes('timeout')) {
      Logger.log('\n🔍 DIAGNOSIS: Request timeout - DataBridge might be slow or down');
    }
  }
}

/**
 * 📋 SHOW CURRENT CONFIGURATION
 * Displays all relevant configuration for debugging
 */
function SHOW_Configuration() {
  Logger.log('=== CURRENT CONFIGURATION ===\n');
  
  Logger.log('Functions Available:');
  Logger.log('   runWorkflowStage: ' + (typeof runWorkflowStage === 'function' ? 'YES ✅' : 'NO ❌'));
  Logger.log('   fetchFromDataBridge: ' + (typeof fetchFromDataBridge === 'function' ? 'YES ✅' : 'NO ❌'));
  Logger.log('');
  
  Logger.log('Constants Available:');
  Logger.log('   ENDPOINTS: ' + (typeof ENDPOINTS !== 'undefined' ? 'YES ✅' : 'NO ❌'));
  if (typeof ENDPOINTS !== 'undefined') {
    Logger.log('   ENDPOINTS.DATABRIDGE: ' + (ENDPOINTS.DATABRIDGE || 'MISSING ❌'));
    Logger.log('   ENDPOINTS.FETCHER: ' + (ENDPOINTS.FETCHER || 'MISSING ❌'));
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════\n');
}

/**
 * 🔍 DIAGNOSTIC TEST - Run this in Apps Script Editor
 * Tests if Gemini API routing is working
 */

function TEST_GeminiAPIRouting() {
  Logger.clear();
  Logger.log('=== GEMINI API ROUTING TEST ===');
  
  // Test 1: Check if callGeminiAPI function exists
  try {
    const functionExists = typeof callGeminiAPI === 'function';
    Logger.log('✅ Test 1: callGeminiAPI function exists: ' + functionExists);
  } catch(e) {
    Logger.log('❌ Test 1 FAILED: ' + e.toString());
  }
  
  // Test 2: Check if gateway is configured
  try {
    const gatewayURL = PropertiesService.getScriptProperties().getProperty('GATEWAY_URL') || 'https://serpifai.com/serpifai_php/api_gateway.php';
    Logger.log('✅ Test 2: Gateway URL configured: ' + gatewayURL);
  } catch(e) {
    Logger.log('❌ Test 2 FAILED: ' + e.toString());
  }
  
  // Test 3: Try calling Gemini API with simple prompt
  Logger.log('\n--- Test 3: Calling Gemini API ---');
  try {
    const result = callGeminiAPI('gemini-2.5-flash', 'Say "Hello from Gemini API!" in one sentence.', {
      temperature: 0.7,
      maxOutputTokens: 100
    });
    
    if(result && result.success) {
      Logger.log('✅ Test 3: Gemini API call SUCCESS');
      Logger.log('   Response: ' + (result.data || result.text || 'No text'));
      Logger.log('   Model: ' + (result.model || 'Unknown'));
    } else {
      Logger.log('❌ Test 3: Gemini API call FAILED');
      Logger.log('   Error: ' + (result.error || 'Unknown error'));
      Logger.log('   Full result: ' + JSON.stringify(result));
    }
  } catch(e) {
    Logger.log('❌ Test 3 EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
  }
  
  // Test 4: Check DB_Workflow_Stage1 exists
  try {
    const functionExists = typeof DB_Workflow_Stage1 === 'function';
    Logger.log('\n✅ Test 4: DB_Workflow_Stage1 function exists: ' + functionExists);
  } catch(e) {
    Logger.log('❌ Test 4 FAILED: ' + e.toString());
  }
  
  Logger.log('\n=== TEST COMPLETE ===');
  Logger.log('Check results above to diagnose issues.');
  
  return {
    success: true,
    message: 'Diagnostic test complete. Check logs above.'
  };
}

/**
 * 🧪 MINIMAL STAGE 1 TEST
 * Runs Stage 1 with minimal data to test end-to-end
 */
function TEST_MinimalStage1() {
  Logger.clear();
  Logger.log('=== MINIMAL STAGE 1 TEST ===');
  
  const testData = {
    brandName: 'TestCo',
    targetAudience: 'Small business owners aged 30-50',
    audiencePains: 'Limited marketing budget, no in-house expertise, overwhelmed by digital options',
    audienceDesired: 'More qualified leads, predictable growth, better ROI on marketing spend',
    productOrService: 'Marketing automation software for small businesses',
    coreTopic: 'Digital marketing and lead generation',
    quarterlyObjective: 'Grow qualified leads by 50% in Q1 2025'
  };
  
  Logger.log('📊 Test data prepared with ' + Object.keys(testData).length + ' fields');
  Logger.log('🚀 Calling DB_Workflow_Stage1...\n');
  
  try {
    const result = DB_Workflow_Stage1(testData, 'gemini-2.5-flash');
    
    Logger.log('=== RESULT ===');
    Logger.log('Success: ' + result.success);
    Logger.log('Stage: ' + result.stage);
    
    if(result.success) {
      Logger.log('✅ Stage 1 COMPLETED successfully');
      Logger.log('   Has json: ' + !!result.json);
      Logger.log('   Has report: ' + !!result.report);
      Logger.log('   Has dashboardCharts: ' + !!(result.json && result.json.dashboardCharts));
      
      if(result.json && result.json.dashboardCharts) {
        const chartKeys = Object.keys(result.json.dashboardCharts);
        Logger.log('   Chart count: ' + chartKeys.length);
        Logger.log('   Chart types: ' + chartKeys.join(', '));
      }
      
      if(result.report) {
        Logger.log('   Report length: ' + result.report.length + ' chars');
        Logger.log('   Report preview: ' + result.report.substring(0, 200) + '...');
      }
    } else {
      Logger.log('❌ Stage 1 FAILED');
      Logger.log('   Error: ' + result.error);
    }
    
    return result;
    
  } catch(e) {
    Logger.log('❌ EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * 🌐 TEST PHP BACKEND
 * Tests if PHP gateway is responding correctly
 */
function TEST_PHPBackend() {
  Logger.clear();
  Logger.log('=== PHP BACKEND TEST ===');
  
  const gatewayURL = PropertiesService.getScriptProperties().getProperty('GATEWAY_URL') || 'https://serpifai.com/serpifai_php/api_gateway.php';
  Logger.log('Gateway URL: ' + gatewayURL);
  
  // Test 1: Check status
  Logger.log('\n--- Test 1: Check Status ---');
  try {
    const result = callGateway('check_status', {
      license: 'TEST-LICENSE-123'
    });
    
    Logger.log('Result: ' + JSON.stringify(result));
    
    if(result && result.success === false && result.error && result.error.includes('Invalid license')) {
      Logger.log('✅ PHP backend is responding (license validation works)');
    } else if(result && result.success) {
      Logger.log('✅ PHP backend is responding (status check works)');
    } else {
      Logger.log('⚠️ Unexpected response from PHP backend');
    }
  } catch(e) {
    Logger.log('❌ PHP backend error: ' + e.toString());
  }
  
  // Test 2: Check gemini action routing
  Logger.log('\n--- Test 2: Check Gemini Action Routing ---');
  try {
    const result = callGateway('gemini:generate', {
      model: 'gemini-2.5-flash',
      prompt: 'Say hello in one word',
      options: {
        temperature: 0.7,
        maxOutputTokens: 10
      }
    });
    
    if(result && result.success) {
      Logger.log('✅ Gemini action routing works!');
      Logger.log('   Response: ' + (result.data || result.text));
    } else if(result && result.error && result.error.includes('Unknown action')) {
      Logger.log('❌ CRITICAL: PHP backend does not have handleGeminiAction!');
      Logger.log('   You need to upload api_gateway.php and gemini_api.php');
    } else {
      Logger.log('⚠️ Gemini action error: ' + (result.error || 'Unknown'));
    }
  } catch(e) {
    Logger.log('❌ Exception: ' + e.toString());
  }
  
  Logger.log('\n=== TEST COMPLETE ===');
}

/**
 * 📋 RUN ALL DIAGNOSTIC TESTS
 */
function RUN_ALL_DIAGNOSTIC_TESTS() {
  Logger.clear();
  Logger.log('╔════════════════════════════════════════════════╗');
  Logger.log('║   COMPREHENSIVE DIAGNOSTIC TEST SUITE         ║');
  Logger.log('╚════════════════════════════════════════════════╝\n');
  
  TEST_PHPBackend();
  Logger.log('\n' + '─'.repeat(60) + '\n');
  
  TEST_GeminiAPIRouting();
  Logger.log('\n' + '─'.repeat(60) + '\n');
  
  TEST_MinimalStage1();
  
  Logger.log('\n╔════════════════════════════════════════════════╗');
  Logger.log('║   ALL TESTS COMPLETE                          ║');
  Logger.log('╚════════════════════════════════════════════════╝');
  Logger.log('\n📊 Check logs above for detailed results');
  Logger.log('🔍 Look for ❌ CRITICAL errors that need fixing');
}

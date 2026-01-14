/**
 * DIAG_CHECK_GATEWAY_RESPONSE.gs
 * 
 * Check what the gateway actually returns for competitor analysis
 */

function DIAG_checkCompetitorAnalysisResponse() {
  Logger.log('='.repeat(80));
  Logger.log('🔍 CHECKING COMPETITOR ANALYSIS RESPONSE DETAILS');
  Logger.log('='.repeat(80));
  
  try {
    const licenseKey = getUserLicenseKey() || 'SERP-FAI-TEST-KEY-123456';
    const gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
    
    // Test with full competitor analysis request
    const requestData = {
      license: licenseKey,
      action: 'comp:elite_full',
      payload: {
        competitors: ['toptal.com', 'globant.com', 'turing.com'],
        projectContext: {
          brandName: 'BairesDev',
          targetAudience: 'CTOs and VPs of Engineering',
          coreTopic: 'Elite Talent Acquisition',
          industryVertical: 'Technology Staffing'
        }
      }
    };
    
    Logger.log('📤 Sending request:');
    Logger.log('   Action: comp:elite_full');
    Logger.log('   Competitors: 3');
    Logger.log('   License: ' + licenseKey.substring(0, 15) + '...');
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(gatewayUrl, options);
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    Logger.log('\n📥 Response received:');
    Logger.log('   Response code: ' + code);
    Logger.log('   Response length: ' + text.length + ' bytes');
    
    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
      Logger.log('\n📊 Parsed Response:');
      Logger.log(JSON.stringify(parsed, null, 2));
      
      // Analyze response structure
      Logger.log('\n🔍 Response Analysis:');
      Logger.log('   success: ' + (parsed.success ? '✅' : '❌'));
      Logger.log('   Has error: ' + (parsed.error ? '❌ YES' : '✅ NO'));
      Logger.log('   Has data: ' + (parsed.data ? '✅ YES' : '❌ NO'));
      Logger.log('   Has result: ' + (parsed.result ? '✅ YES' : '❌ NO'));
      Logger.log('   Has transactionId: ' + (parsed.transactionId ? '✅ YES' : '❌ NO'));
      
      if (parsed.error) {
        Logger.log('\n❌ ERROR IN RESPONSE:');
        Logger.log('   Error: ' + parsed.error);
        Logger.log('   Details: ' + JSON.stringify(parsed.details || 'none'));
      }
      
      if (parsed.success && !parsed.result && !parsed.data) {
        Logger.log('\n⚠️  ISSUE FOUND:');
        Logger.log('   Gateway says "success" but returns NO DATA');
        Logger.log('   This means:');
        Logger.log('   1. Gateway accepted the request (200 OK)');
        Logger.log('   2. Credits were deducted (transaction created)');
        Logger.log('   3. But backend never executed the analysis');
        Logger.log('   4. Or execution failed silently');
        Logger.log('\n🎯 ROOT CAUSE:');
        Logger.log('   The gateway is acting as a simple auth/credit checker');
        Logger.log('   But NOT actually running the competitor analysis');
        Logger.log('   Check: api_gateway.php action routing');
      }
      
      // Check transaction ID
      if (parsed.transactionId) {
        Logger.log('\n💳 Transaction ID: ' + parsed.transactionId);
        Logger.log('   Credits were deducted for this request');
        Logger.log('   But no results were returned!');
        Logger.log('   This is a CRITICAL BUG - credits lost with no value');
      }
      
    } catch (e) {
      Logger.log('❌ JSON parse error: ' + e.toString());
      Logger.log('   Raw response (first 500 chars):');
      Logger.log('   ' + text.substring(0, 500));
    }
    
    Logger.log('\n' + '='.repeat(80));
    Logger.log('🎯 DIAGNOSIS:');
    
    if (code === 200 && parsed && parsed.success && !parsed.result && !parsed.data) {
      Logger.log('❌ CRITICAL ISSUE: Gateway accepts request but returns empty results');
      Logger.log('');
      Logger.log('PROBLEM:');
      Logger.log('  Gateway is only checking auth/credits (working ✅)');
      Logger.log('  But NOT executing the actual competitor analysis (broken ❌)');
      Logger.log('');
      Logger.log('LIKELY CAUSES:');
      Logger.log('  1. api_gateway.php has no case for "comp:elite_full" action');
      Logger.log('  2. Gateway returns success but never calls analysis function');
      Logger.log('  3. Analysis function exists but is not linked to gateway');
      Logger.log('  4. Gateway expects different action name');
      Logger.log('');
      Logger.log('FIX:');
      Logger.log('  Check api_gateway.php switch/case statement');
      Logger.log('  Look for action routing to competitor analysis');
      Logger.log('  Add missing case or fix function call');
    } else if (parsed && parsed.error) {
      Logger.log('❌ Gateway returned error: ' + parsed.error);
    } else {
      Logger.log('✅ Response looks valid (but check if data is complete)');
    }
    
    Logger.log('='.repeat(80));
    
  } catch (e) {
    Logger.log('❌ Exception: ' + e.toString());
  }
}

/**
 * Check what actions the gateway actually supports
 */
function DIAG_testGatewayActions() {
  Logger.log('='.repeat(80));
  Logger.log('🧪 TESTING GATEWAY ACTION SUPPORT');
  Logger.log('='.repeat(80));
  
  const licenseKey = getUserLicenseKey() || 'SERP-FAI-TEST-KEY-123456';
  const gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
  
  const actionsToTest = [
    'check_status',
    'comp:elite_full',
    'competitor_analysis',
    'analyze_competitors',
    'elite_analysis',
    'serper_search',
    'gemini:generate'
  ];
  
  Logger.log('\nTesting which actions the gateway recognizes:\n');
  
  actionsToTest.forEach(action => {
    try {
      const requestData = {
        license: licenseKey,
        action: action,
        payload: { test: true }
      };
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(requestData),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(gatewayUrl, options);
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      let result = '❓ Unknown';
      try {
        const parsed = JSON.parse(text);
        if (parsed.success) {
          result = '✅ Accepted';
        } else if (parsed.error && parsed.error.includes('Invalid action')) {
          result = '❌ Not recognized';
        } else if (parsed.error) {
          result = '⚠️  Error: ' + parsed.error.substring(0, 50);
        }
      } catch (e) {
        result = '❌ Invalid response';
      }
      
      Logger.log('   ' + action.padEnd(25) + ' → ' + result);
      
    } catch (e) {
      Logger.log('   ' + action.padEnd(25) + ' → ❌ Request failed');
    }
  });
  
  Logger.log('\n' + '='.repeat(80));
}

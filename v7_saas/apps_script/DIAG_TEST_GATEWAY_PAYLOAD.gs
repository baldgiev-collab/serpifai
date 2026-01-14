/**
 * DIAG_TEST_GATEWAY_PAYLOAD.gs
 * 
 * Test different payload sizes to find what triggers "Forbidden" error
 */

/**
 * Test competitor analysis with minimal payload
 */
function DIAG_testMinimalCompetitorPayload() {
  Logger.log('='.repeat(80));
  Logger.log('🧪 TESTING MINIMAL COMPETITOR ANALYSIS PAYLOAD');
  Logger.log('='.repeat(80));
  
  try {
    // Get gateway URL
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || 
                       'https://serpifai.com/serpifai_php/api_gateway.php';
    
    const licenseKey = getUserLicenseKey() || 'SERP-FAI-TEST-KEY-123456';
    
    Logger.log('🌐 Gateway URL: ' + gatewayUrl);
    Logger.log('🔑 License Key: ' + licenseKey.substring(0, 15) + '...');
    
    // Test 1: Minimal payload (just check_status)
    Logger.log('\n📋 TEST 1: check_status (baseline - should work)');
    const test1 = {
      license: licenseKey,
      action: 'check_status',
      payload: {}
    };
    
    const result1 = testGatewayRequest(gatewayUrl, test1);
    Logger.log('   Result: ' + (result1.success ? '✅ SUCCESS' : '❌ FAILED'));
    Logger.log('   Response code: ' + result1.code);
    Logger.log('   Response length: ' + result1.length);
    
    // Test 2: Small competitor payload
    Logger.log('\n📋 TEST 2: comp:elite_full with 1 competitor (small)');
    const test2 = {
      license: licenseKey,
      action: 'comp:elite_full',
      payload: {
        competitors: ['toptal.com'],
        projectContext: { brandName: 'Test' }
      }
    };
    
    const result2 = testGatewayRequest(gatewayUrl, test2);
    Logger.log('   Result: ' + (result2.success ? '✅ SUCCESS' : '❌ FAILED'));
    Logger.log('   Response code: ' + result2.code);
    Logger.log('   Response length: ' + result2.length);
    if (!result2.success) {
      Logger.log('   Error: ' + result2.error);
    }
    
    // Test 3: Multiple competitors
    Logger.log('\n📋 TEST 3: comp:elite_full with 5 competitors (medium)');
    const test3 = {
      license: licenseKey,
      action: 'comp:elite_full',
      payload: {
        competitors: ['toptal.com', 'globant.com', 'turing.com', 'andela.com', 'thoughtworks.com'],
        projectContext: { brandName: 'Test' }
      }
    };
    
    const result3 = testGatewayRequest(gatewayUrl, test3);
    Logger.log('   Result: ' + (result3.success ? '✅ SUCCESS' : '❌ FAILED'));
    Logger.log('   Response code: ' + result3.code);
    Logger.log('   Response length: ' + result3.length);
    if (!result3.success) {
      Logger.log('   Error: ' + result3.error);
    }
    
    // Test 4: Full project context
    Logger.log('\n📋 TEST 4: comp:elite_full with full project context (large)');
    const fullContext = {
      brandName: 'BairesDev',
      targetAudience: 'CTOs, VPs of Engineering, and Product Leaders at mid-to-enterprise US-based technology companies',
      coreTopic: 'Nearshore Agility & Elite Talent Acquisition',
      industryVertical: 'Technology Staffing & Software Development',
      uvp: 'The Top 1% of Latin American tech talent'
    };
    
    const test4 = {
      license: licenseKey,
      action: 'comp:elite_full',
      payload: {
        competitors: ['toptal.com', 'globant.com', 'turing.com', 'andela.com', 'thoughtworks.com'],
        projectContext: fullContext
      }
    };
    
    const result4 = testGatewayRequest(gatewayUrl, test4);
    Logger.log('   Result: ' + (result4.success ? '✅ SUCCESS' : '❌ FAILED'));
    Logger.log('   Response code: ' + result4.code);
    Logger.log('   Response length: ' + result4.length);
    Logger.log('   Payload size: ' + JSON.stringify(test4).length + ' bytes');
    if (!result4.success) {
      Logger.log('   Error: ' + result4.error);
    }
    
    // Summary
    Logger.log('\n' + '='.repeat(80));
    Logger.log('📊 SUMMARY');
    Logger.log('='.repeat(80));
    Logger.log('Test 1 (check_status): ' + (result1.success ? '✅' : '❌'));
    Logger.log('Test 2 (1 competitor): ' + (result2.success ? '✅' : '❌'));
    Logger.log('Test 3 (5 competitors): ' + (result3.success ? '✅' : '❌'));
    Logger.log('Test 4 (full context): ' + (result4.success ? '✅' : '❌'));
    
    Logger.log('\n🎯 DIAGNOSIS:');
    if (!result1.success) {
      Logger.log('❌ CRITICAL: Even basic check_status fails!');
      Logger.log('   → Server is completely blocking requests');
      Logger.log('   → Check: ModSecurity, firewall rules, IP blocking');
    } else if (!result2.success) {
      Logger.log('❌ Action "comp:elite_full" is being blocked');
      Logger.log('   → ModSecurity may be blocking competitor analysis action');
      Logger.log('   → Try renaming action or disabling ModSecurity rules');
    } else if (!result3.success) {
      Logger.log('❌ Multiple competitors trigger blocking');
      Logger.log('   → Request pattern looks suspicious to WAF');
      Logger.log('   → Reduce competitors or chunk requests');
    } else if (!result4.success) {
      Logger.log('❌ Large payload is being blocked');
      Logger.log('   → Increase client_max_body_size in nginx');
      Logger.log('   → Increase post_max_size in PHP');
    } else {
      Logger.log('✅ All tests passed! Issue may be intermittent or frontend-specific');
    }
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
  }
}

/**
 * Helper: Make gateway request and return result
 */
function testGatewayRequest(url, requestData) {
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    return {
      success: code === 200,
      code: code,
      length: text.length,
      text: text.substring(0, 200),
      error: code !== 200 ? text : null
    };
  } catch (e) {
    return {
      success: false,
      code: 0,
      length: 0,
      text: '',
      error: e.toString()
    };
  }
}

/**
 * Test direct PHP endpoint without gateway
 */
function DIAG_testDirectPHP() {
  Logger.log('🧪 Testing direct PHP endpoint...');
  
  try {
    // Test if basic PHP works
    const testUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
    
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    Logger.log('Response code: ' + response.getResponseCode());
    Logger.log('Response: ' + response.getContentText().substring(0, 200));
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
  }
}

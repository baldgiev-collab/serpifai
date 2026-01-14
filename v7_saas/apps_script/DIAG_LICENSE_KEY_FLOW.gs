/**
 * DIAG_LICENSE_KEY_FLOW.gs
 * 
 * Diagnostic tool to trace license key from UserProperties → Gateway API
 * Use this to find where "SERP-FAI-TEST-KEY-123456" becomes "YOUR-ACT..."
 */

/**
 * Main diagnostic - traces complete license key flow
 */
function DIAG_traceLicenseKeyFlow() {
  Logger.log('='.repeat(80));
  Logger.log('🔍 LICENSE KEY FLOW DIAGNOSTIC');
  Logger.log('='.repeat(80));
  
  const results = {
    step1_userProperties: null,
    step2_getUserLicenseKey: null,
    step3_callGatewayPrep: null,
    step4_gatewaySent: null,
    step5_gatewayResponse: null,
    issues: []
  };
  
  // ============================================================================
  // STEP 1: Check UserProperties directly
  // ============================================================================
  Logger.log('\n📋 STEP 1: Checking UserProperties directly...');
  Logger.log('-'.repeat(80));
  
  try {
    const userProps = PropertiesService.getUserProperties();
    const allProps = userProps.getProperties();
    
    // Check all possible property names
    const keyVariations = [
      'SERPIFAI_LICENSE_KEY',
      'serpifai_license_key',
      'licenseKey',
      'license_key'
    ];
    
    Logger.log('📦 All UserProperties:');
    for (const [key, value] of Object.entries(allProps)) {
      if (key.toLowerCase().includes('license') || key.toLowerCase().includes('key')) {
        Logger.log(`   ${key}: "${value.substring(0, 20)}..."`);
        results.step1_userProperties = results.step1_userProperties || {};
        results.step1_userProperties[key] = value;
      }
    }
    
    // Check each variation
    Logger.log('\n🔍 Checking specific property names:');
    keyVariations.forEach(propName => {
      const value = userProps.getProperty(propName);
      if (value) {
        Logger.log(`   ✅ ${propName}: "${value}"`);
      } else {
        Logger.log(`   ❌ ${propName}: NOT FOUND`);
      }
    });
    
    if (!results.step1_userProperties || Object.keys(results.step1_userProperties).length === 0) {
      results.issues.push('❌ NO LICENSE KEY FOUND IN USERPROPERTIES');
      Logger.log('\n⚠️  ISSUE: No license key found in UserProperties!');
      Logger.log('   This means the Settings UI did not save the key correctly.');
      Logger.log('   Check: UI_Settings.gs saveLicenseKey() function');
    }
    
  } catch (e) {
    results.issues.push('Error reading UserProperties: ' + e.toString());
    Logger.log('❌ Error: ' + e.toString());
  }
  
  // ============================================================================
  // STEP 2: Test getUserLicenseKey() function
  // ============================================================================
  Logger.log('\n📋 STEP 2: Testing getUserLicenseKey() function...');
  Logger.log('-'.repeat(80));
  
  try {
    const licenseKey = getUserLicenseKey();
    
    if (licenseKey) {
      Logger.log(`✅ getUserLicenseKey() returned: "${licenseKey}"`);
      results.step2_getUserLicenseKey = licenseKey;
      
      // Verify it matches what we found in step 1
      if (results.step1_userProperties) {
        const step1Key = results.step1_userProperties['SERPIFAI_LICENSE_KEY'] || 
                         results.step1_userProperties['serpifai_license_key'];
        
        if (licenseKey === step1Key) {
          Logger.log('✅ Matches UserProperties - CORRECT');
        } else {
          results.issues.push('❌ getUserLicenseKey() returned different key than UserProperties');
          Logger.log(`⚠️  MISMATCH!`);
          Logger.log(`   UserProperties: "${step1Key}"`);
          Logger.log(`   getUserLicenseKey(): "${licenseKey}"`);
        }
      }
    } else {
      results.issues.push('❌ getUserLicenseKey() returned NULL or EMPTY');
      Logger.log('❌ getUserLicenseKey() returned: NULL or EMPTY');
      Logger.log('   This means the function is not reading the property correctly.');
      Logger.log('   Check: UI_Gateway.gs getUserLicenseKey() function');
    }
    
  } catch (e) {
    results.issues.push('Error calling getUserLicenseKey(): ' + e.toString());
    Logger.log('❌ Error: ' + e.toString());
  }
  
  // ============================================================================
  // STEP 3: Test callGateway() preparation
  // ============================================================================
  Logger.log('\n📋 STEP 3: Testing callGateway() with explicit license key...');
  Logger.log('-'.repeat(80));
  
  try {
    // Use the key we found in step 2
    const testKey = results.step2_getUserLicenseKey || 'SERP-FAI-TEST-KEY-123456';
    Logger.log(`🔑 Using test key: "${testKey}"`);
    
    // Build request data (same as callGateway does)
    const requestData = {
      license: testKey,
      action: 'check_status',
      payload: {}
    };
    
    Logger.log('📦 Request data prepared:');
    Logger.log(JSON.stringify(requestData, null, 2));
    
    results.step3_callGatewayPrep = {
      license: testKey,
      action: 'check_status'
    };
    
    if (!testKey || testKey === '') {
      results.issues.push('❌ Empty license key would be sent to gateway');
      Logger.log('⚠️  ISSUE: Empty license key!');
    } else if (testKey.length < 10) {
      results.issues.push('❌ License key too short: ' + testKey);
      Logger.log('⚠️  ISSUE: License key suspiciously short!');
    }
    
  } catch (e) {
    results.issues.push('Error preparing gateway call: ' + e.toString());
    Logger.log('❌ Error: ' + e.toString());
  }
  
  // ============================================================================
  // STEP 4: Test actual gateway call
  // ============================================================================
  Logger.log('\n📋 STEP 4: Testing actual callGateway() API call...');
  Logger.log('-'.repeat(80));
  
  try {
    const testKey = results.step2_getUserLicenseKey || 'SERP-FAI-TEST-KEY-123456';
    Logger.log(`🔑 Calling gateway with: "${testKey}"`);
    
    // Get gateway URL
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || 
                       'https://serpifai.com/serpifai_php/api_gateway.php';
    
    Logger.log(`🌐 Gateway URL: ${gatewayUrl}`);
    
    // Make direct API call (bypass callGateway to see raw request/response)
    const requestData = {
      license: testKey,
      action: 'check_status',
      payload: {}
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    };
    
    Logger.log('📤 Sending request...');
    const response = UrlFetchApp.fetch(gatewayUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`📥 Response code: ${responseCode}`);
    Logger.log(`📄 Response preview: ${responseText.substring(0, 500)}`);
    
    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
      Logger.log('\n📊 Parsed response:');
      Logger.log(JSON.stringify(result, null, 2));
      
      // Check what license key the gateway received
      if (result.license_key_used) {
        Logger.log(`\n🔍 Gateway received license key: "${result.license_key_used}"`);
        
        if (result.license_key_used !== testKey) {
          results.issues.push(`❌ MISMATCH: Sent "${testKey}" but gateway received "${result.license_key_used}"`);
          Logger.log('⚠️  CRITICAL ISSUE: License key changed between client and server!');
          Logger.log(`   Sent:     "${testKey}"`);
          Logger.log(`   Received: "${result.license_key_used}"`);
        } else {
          Logger.log('✅ License key arrived correctly at gateway');
        }
      }
      
      results.step4_gatewaySent = testKey;
      results.step5_gatewayResponse = result;
      
      if (responseCode === 401) {
        results.issues.push('❌ 401 Unauthorized - License key rejected by server');
        Logger.log('\n⚠️  Gateway rejected license key (401 Unauthorized)');
        Logger.log('   Possible reasons:');
        Logger.log('   1. License key not in database');
        Logger.log('   2. License key inactive/expired');
        Logger.log('   3. License key format incorrect');
      } else if (responseCode === 200) {
        Logger.log('\n✅ Gateway accepted license key (200 OK)');
      }
      
    } catch (e) {
      results.issues.push('Error parsing gateway response: ' + e.toString());
      Logger.log('❌ JSON parse error: ' + e.toString());
      Logger.log('   Raw response: ' + responseText.substring(0, 200));
    }
    
  } catch (e) {
    results.issues.push('Error calling gateway: ' + e.toString());
    Logger.log('❌ Error: ' + e.toString());
  }
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  Logger.log('\n' + '='.repeat(80));
  Logger.log('📊 DIAGNOSTIC SUMMARY');
  Logger.log('='.repeat(80));
  
  Logger.log('\n✅ SUCCESSFUL STEPS:');
  if (results.step1_userProperties) {
    Logger.log('   ✅ Step 1: Found license key in UserProperties');
  }
  if (results.step2_getUserLicenseKey) {
    Logger.log('   ✅ Step 2: getUserLicenseKey() returned key');
  }
  if (results.step3_callGatewayPrep) {
    Logger.log('   ✅ Step 3: callGateway() preparation successful');
  }
  if (results.step4_gatewaySent) {
    Logger.log('   ✅ Step 4: Request sent to gateway');
  }
  if (results.step5_gatewayResponse) {
    Logger.log('   ✅ Step 5: Response received from gateway');
  }
  
  Logger.log('\n❌ ISSUES FOUND:');
  if (results.issues.length === 0) {
    Logger.log('   ✅ No issues detected!');
  } else {
    results.issues.forEach((issue, index) => {
      Logger.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  Logger.log('\n🎯 NEXT STEPS:');
  if (results.issues.some(i => i.includes('NO LICENSE KEY FOUND'))) {
    Logger.log('   1. Open Settings in UI');
    Logger.log('   2. Re-enter email: baldgiev@gmail.com');
    Logger.log('   3. Re-enter license: SERP-FAI-TEST-KEY-123456');
    Logger.log('   4. Click Activate');
    Logger.log('   5. Re-run this diagnostic');
  } else if (results.issues.some(i => i.includes('401 Unauthorized'))) {
    Logger.log('   1. Verify license key is in database (check MySQL)');
    Logger.log('   2. Verify key status is "active"');
    Logger.log('   3. Try different license key if available');
  } else if (results.issues.some(i => i.includes('MISMATCH'))) {
    Logger.log('   1. Check for middleware/proxy modifying requests');
    Logger.log('   2. Check gateway PHP code for license key handling');
    Logger.log('   3. Add logging to api_gateway.php to see what arrives');
  }
  
  Logger.log('\n' + '='.repeat(80));
  
  return results;
}

/**
 * Quick test - just show current license key status
 */
function DIAG_showCurrentLicenseKey() {
  Logger.log('🔑 Current License Key Status:');
  Logger.log('-'.repeat(40));
  
  const userProps = PropertiesService.getUserProperties();
  const key1 = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  const key2 = userProps.getProperty('serpifai_license_key');
  const email = userProps.getProperty('SERPIFAI_USER_EMAIL');
  
  Logger.log(`SERPIFAI_LICENSE_KEY: ${key1 || '❌ NOT SET'}`);
  Logger.log(`serpifai_license_key: ${key2 || '❌ NOT SET'}`);
  Logger.log(`SERPIFAI_USER_EMAIL: ${email || '❌ NOT SET'}`);
  
  const key = key1 || key2;
  if (key) {
    Logger.log(`\n✅ License key found: ${key}`);
    Logger.log(`   Length: ${key.length} characters`);
    Logger.log(`   Starts with: ${key.substring(0, 10)}...`);
  } else {
    Logger.log('\n❌ NO LICENSE KEY FOUND');
    Logger.log('   Run: DIAG_setTestLicenseKey() to set test key');
  }
}

/**
 * Set test license key for diagnostic purposes
 */
function DIAG_setTestLicenseKey() {
  Logger.log('🔧 Setting test license key...');
  
  const userProps = PropertiesService.getUserProperties();
  const testKey = 'SERP-FAI-TEST-KEY-123456';
  const testEmail = 'baldgiev@gmail.com';
  
  userProps.setProperty('SERPIFAI_LICENSE_KEY', testKey);
  userProps.setProperty('serpifai_license_key', testKey);
  userProps.setProperty('SERPIFAI_USER_EMAIL', testEmail);
  userProps.setProperty('serpifai_user_email', testEmail);
  
  Logger.log('✅ Test license key set:');
  Logger.log(`   License: ${testKey}`);
  Logger.log(`   Email: ${testEmail}`);
  Logger.log('\nNow run: DIAG_traceLicenseKeyFlow()');
}

/**
 * Clear all license keys (reset)
 */
function DIAG_clearAllLicenseKeys() {
  Logger.log('🗑️  Clearing all license keys...');
  
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('SERPIFAI_LICENSE_KEY');
  userProps.deleteProperty('serpifai_license_key');
  userProps.deleteProperty('licenseKey');
  userProps.deleteProperty('license_key');
  userProps.deleteProperty('SERPIFAI_USER_EMAIL');
  userProps.deleteProperty('serpifai_user_email');
  
  Logger.log('✅ All license keys cleared');
  Logger.log('   Run: DIAG_showCurrentLicenseKey() to verify');
}

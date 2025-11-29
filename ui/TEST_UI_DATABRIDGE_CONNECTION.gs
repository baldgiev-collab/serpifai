/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI → DATABRIDGE CONNECTION TEST
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Deploy this in your UI Apps Script project
 * Run TEST_DataBridgeConnection() to verify connection
 */

function TEST_DataBridgeConnection() {
  Logger.log('═'.repeat(80));
  Logger.log('🔍 TESTING UI → DATABRIDGE CONNECTION');
  Logger.log('═'.repeat(80));
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Check Script Properties
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 TEST 1: Checking Script Properties...');
  
  var props = PropertiesService.getScriptProperties();
  var databridgeUrl = props.getProperty('DATABRIDGE_WEB_APP_URL');
  var geminiKey = props.getProperty('GEMINI_API_KEY');
  var fetcherKey = props.getProperty('FETCHER_API_KEY');
  var geminiModel = props.getProperty('GEMINI_MODEL');
  
  Logger.log('  DATABRIDGE_WEB_APP_URL: ' + (databridgeUrl ? '✅ SET' : '❌ MISSING'));
  Logger.log('    Value: ' + databridgeUrl);
  Logger.log('  GEMINI_API_KEY: ' + (geminiKey ? '✅ SET' : '⚠️ MISSING (optional)'));
  Logger.log('  FETCHER_API_KEY: ' + (fetcherKey ? '✅ SET (' + fetcherKey + ')' : '⚠️ MISSING (may need this)'));
  Logger.log('  GEMINI_MODEL: ' + (geminiModel ? '✅ SET (' + geminiModel + ')' : '⚠️ MISSING (optional)'));
  Logger.log('');
  
  if (!databridgeUrl) {
    Logger.log('❌ CRITICAL: DATABRIDGE_WEB_APP_URL is not set!');
    Logger.log('   Add it in: Project Settings → Script Properties');
    Logger.log('   Property: DATABRIDGE_WEB_APP_URL');
    Logger.log('   Value: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec');
    return;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Test Basic HTTP Connection (GET request)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 TEST 2: Testing HTTP Connection to DataBridge...');
  Logger.log('  URL: ' + databridgeUrl);
  
  try {
    var getResponse = UrlFetchApp.fetch(databridgeUrl, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    var getCode = getResponse.getResponseCode();
    var getHeaders = getResponse.getHeaders();
    var getContent = getResponse.getContentText();
    
    Logger.log('  ✅ Connection successful!');
    Logger.log('  Response code: ' + getCode);
    Logger.log('  Content-Type: ' + (getHeaders['Content-Type'] || 'unknown'));
    Logger.log('  Content length: ' + getContent.length + ' bytes');
    Logger.log('  First 200 chars: ' + getContent.substring(0, 200));
    Logger.log('');
    
    // Check if it's returning HTML (404/error page) or JSON
    if (getCode === 404) {
      Logger.log('  ❌ 404 ERROR: Web app not found!');
      Logger.log('  Problem: The URL is wrong or web app is not deployed');
      Logger.log('  Solution:');
      Logger.log('    1. Open DataBridge Apps Script project');
      Logger.log('    2. Click "Deploy" → "Manage deployments"');
      Logger.log('    3. Check if there\'s an active web app deployment');
      Logger.log('    4. If not, create new deployment:');
      Logger.log('       - Type: Web app');
      Logger.log('       - Execute as: Me');
      Logger.log('       - Who has access: Anyone');
      Logger.log('    5. Copy the Web app URL');
      Logger.log('    6. Update DATABRIDGE_WEB_APP_URL in UI script properties');
      Logger.log('');
      return;
    }
    
    if (getContent.indexOf('<html') !== -1 || getContent.indexOf('<!DOCTYPE') !== -1) {
      Logger.log('  ⚠️ WARNING: DataBridge returned HTML, not JSON!');
      Logger.log('  This usually means:');
      Logger.log('    - Web app deployment is not active');
      Logger.log('    - Authorization required');
      Logger.log('    - Wrong deployment settings');
      Logger.log('');
    }
    
  } catch (e) {
    Logger.log('  ❌ Connection failed: ' + e.toString());
    Logger.log('  Check:');
    Logger.log('    - Is the URL correct?');
    Logger.log('    - Is DataBridge web app deployed?');
    Logger.log('    - Network connectivity?');
    Logger.log('');
    return;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Test POST Request with JSON Payload
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 TEST 3: Testing POST Request with Action...');
  
  try {
    var testPayload = {
      action: 'ping',
      test: true,
      timestamp: new Date().toISOString()
    };
    
    var postResponse = UrlFetchApp.fetch(databridgeUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    var postCode = postResponse.getResponseCode();
    var postContent = postResponse.getContentText();
    
    Logger.log('  Response code: ' + postCode);
    Logger.log('  Response content: ' + postContent);
    Logger.log('');
    
    if (postCode === 404) {
      Logger.log('  ❌ 404 ERROR: doPost function not found in DataBridge!');
      Logger.log('  Problem: DataBridge doesn\'t have doPost() function deployed');
      Logger.log('  Solution: Deploy databridge/web_app/deployment.gs to DataBridge');
      Logger.log('');
      return;
    }
    
    if (postCode !== 200) {
      Logger.log('  ⚠️ Non-200 response code: ' + postCode);
      Logger.log('  Response: ' + postContent.substring(0, 500));
      Logger.log('');
    }
    
    // Try to parse as JSON
    try {
      var result = JSON.parse(postContent);
      Logger.log('  ✅ Valid JSON response received!');
      Logger.log('  Result: ' + JSON.stringify(result, null, 2));
      Logger.log('');
      
      if (result.success === false) {
        Logger.log('  ⚠️ DataBridge returned success: false');
        Logger.log('  Error: ' + result.error);
        Logger.log('  This is expected for \'ping\' action if not implemented');
        Logger.log('');
      }
      
    } catch (parseError) {
      Logger.log('  ❌ Response is not valid JSON!');
      Logger.log('  Response: ' + postContent.substring(0, 500));
      Logger.log('  This means DataBridge is returning HTML/error page, not JSON');
      Logger.log('');
    }
    
  } catch (e) {
    Logger.log('  ❌ POST request failed: ' + e.toString());
    Logger.log('');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: Test Competitor Analysis Action
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 TEST 4: Testing COMP_orchestrateAnalysis action...');
  
  try {
    var compPayload = {
      action: 'COMP_orchestrateAnalysis',
      config: {
        competitors: ['example.com', 'test.com'],
        targetKeywords: ['test'],
        spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
        depth: 'quick'
      }
    };
    
    Logger.log('  Sending payload: ' + JSON.stringify(compPayload));
    
    var compResponse = UrlFetchApp.fetch(databridgeUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(compPayload),
      muteHttpExceptions: true
    });
    
    var compCode = compResponse.getResponseCode();
    var compContent = compResponse.getContentText();
    
    Logger.log('  Response code: ' + compCode);
    Logger.log('  Response (first 500 chars): ' + compContent.substring(0, 500));
    Logger.log('');
    
    if (compCode === 404) {
      Logger.log('  ❌ 404 ERROR!');
      Logger.log('  DataBridge web app is not properly deployed');
      Logger.log('');
      return;
    }
    
    try {
      var compResult = JSON.parse(compContent);
      Logger.log('  ✅ Valid JSON response!');
      Logger.log('  Success: ' + compResult.success);
      
      if (compResult.success) {
        Logger.log('  ✅✅✅ PERFECT! DataBridge is working!');
        Logger.log('  Competitors analyzed: ' + (compResult.competitorsAnalyzed || 0));
      } else {
        Logger.log('  ⚠️ Analysis failed: ' + compResult.error);
        Logger.log('  This might be OK - could be missing dependencies');
      }
      
    } catch (e) {
      Logger.log('  ❌ Response is not JSON: ' + compContent.substring(0, 200));
    }
    
  } catch (e) {
    Logger.log('  ❌ Test failed: ' + e.toString());
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('');
  Logger.log('═'.repeat(80));
  Logger.log('📊 TEST SUMMARY');
  Logger.log('═'.repeat(80));
  Logger.log('');
  Logger.log('If you see 404 errors:');
  Logger.log('  1. DataBridge web app is not deployed OR');
  Logger.log('  2. DATABRIDGE_WEB_APP_URL points to wrong deployment');
  Logger.log('');
  Logger.log('To fix:');
  Logger.log('  1. Open DataBridge Apps Script project');
  Logger.log('  2. Click "Deploy" → "New deployment"');
  Logger.log('  3. Type: Web app');
  Logger.log('  4. Description: DataBridge API');
  Logger.log('  5. Execute as: Me (your email)');
  Logger.log('  6. Who has access: Anyone');
  Logger.log('  7. Click "Deploy"');
  Logger.log('  8. Copy the Web app URL');
  Logger.log('  9. In UI Apps Script:');
  Logger.log('     - Project Settings → Script Properties');
  Logger.log('     - Update DATABRIDGE_WEB_APP_URL with new URL');
  Logger.log('');
  Logger.log('═'.repeat(80));
}

/**
 * Quick test - just check if DataBridge responds
 */
function TEST_QuickPing() {
  var url = PropertiesService.getScriptProperties().getProperty('DATABRIDGE_WEB_APP_URL');
  
  if (!url) {
    Logger.log('❌ DATABRIDGE_WEB_APP_URL not set in script properties');
    return;
  }
  
  Logger.log('Pinging: ' + url);
  
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ action: 'ping' }),
      muteHttpExceptions: true
    });
    
    var code = response.getResponseCode();
    var content = response.getContentText();
    
    Logger.log('Response code: ' + code);
    Logger.log('Response: ' + content.substring(0, 200));
    
    if (code === 404) {
      Logger.log('❌ 404 - DataBridge web app not found or not deployed!');
    } else if (code === 200) {
      Logger.log('✅ DataBridge is responding!');
    }
    
  } catch (e) {
    Logger.log('❌ Error: ' + e);
  }
}

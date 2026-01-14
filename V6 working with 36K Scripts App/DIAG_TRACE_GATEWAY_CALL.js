/**
 * DIAG_TRACE_GATEWAY_CALL.gs
 * 
 * Diagnostic to trace EXACTLY where the "Forbidden" error is coming from
 */

function DIAG_traceGatewayCall() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔍 DIAGNOSTIC: Tracing Gateway Call Flow');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Test 1: Check if runEliteCompetitorAnalysis exists
  Logger.log('[TEST 1] Function Existence Check');
  try {
    const functionExists = typeof runEliteCompetitorAnalysis === 'function';
    Logger.log('   ✅ runEliteCompetitorAnalysis exists: ' + functionExists);
  } catch (e) {
    Logger.log('   ❌ runEliteCompetitorAnalysis NOT found: ' + e);
  }
  Logger.log('');
  
  // Test 2: Check UI_Gateway functions
  Logger.log('[TEST 2] Gateway Functions Check');
  try {
    Logger.log('   callGateway exists: ' + (typeof callGateway === 'function'));
    Logger.log('   runEliteAnalysis exists: ' + (typeof runEliteAnalysis === 'function'));
    Logger.log('   getUserLicenseKey exists: ' + (typeof getUserLicenseKey === 'function'));
  } catch (e) {
    Logger.log('   ❌ Error: ' + e);
  }
  Logger.log('');
  
  // Test 3: Check license key
  Logger.log('[TEST 3] License Key Check');
  try {
    const licenseKey = getUserLicenseKey();
    Logger.log('   License key: ' + (licenseKey ? licenseKey.substring(0, 15) + '...' : 'NOT FOUND'));
    Logger.log('   Length: ' + (licenseKey ? licenseKey.length : 0));
  } catch (e) {
    Logger.log('   ❌ Error getting license key: ' + e);
  }
  Logger.log('');
  
  // Test 4: Try calling runEliteAnalysis directly
  Logger.log('[TEST 4] Direct runEliteAnalysis Call');
  try {
    const testCompetitors = ['toptal.com'];
    const testContext = { brandName: 'Test' };
    
    Logger.log('   Calling runEliteAnalysis...');
    const result = runEliteAnalysis(testCompetitors, testContext);
    
    Logger.log('   Result type: ' + typeof result);
    Logger.log('   Result success: ' + (result ? result.success : 'null'));
    Logger.log('   Result error: ' + (result ? result.error : 'null'));
    
    if (result && result.error) {
      Logger.log('   ⚠️ ERROR DETAILS:');
      Logger.log('      ' + result.error);
    }
  } catch (e) {
    Logger.log('   ❌ Exception: ' + e);
    Logger.log('   Stack: ' + e.stack);
  }
  Logger.log('');
  
  // Test 5: Check what UI_Gateway.runEliteAnalysis actually does
  Logger.log('[TEST 5] Analyzing runEliteAnalysis function');
  try {
    // Read the function as string to see what it does
    const funcStr = runEliteAnalysis.toString();
    const actionMatch = funcStr.match(/callGateway\s*\(\s*['"]([^'"]+)['"]/);
    
    if (actionMatch) {
      Logger.log('   Gateway action called: "' + actionMatch[1] + '"');
    }
    
    // Check if it calls comp:elite_full
    if (funcStr.indexOf('comp:elite_full') !== -1) {
      Logger.log('   ⚠️ FOUND ISSUE: Function calls "comp:elite_full" action');
      Logger.log('   This action does NOT exist in the PHP gateway!');
    }
  } catch (e) {
    Logger.log('   Cannot analyze function: ' + e);
  }
  Logger.log('');
  
  // Test 6: Test gateway with known action
  Logger.log('[TEST 6] Test Gateway with check_status');
  try {
    const result = callGateway('check_status', {});
    Logger.log('   check_status result:');
    Logger.log('   Success: ' + (result ? result.success : 'null'));
    Logger.log('   Credits: ' + (result && result.user ? result.user.credits : 'N/A'));
  } catch (e) {
    Logger.log('   ❌ Error: ' + e);
  }
  Logger.log('');
  
  // Test 7: Check orchestrator functions
  Logger.log('[TEST 7] Orchestrator Functions Check');
  try {
    Logger.log('   COMP_orchestrateAnalysis exists: ' + (typeof COMP_orchestrateAnalysis === 'function'));
    Logger.log('   DB_COMP_orchestrateAnalysis exists: ' + (typeof DB_COMP_orchestrateAnalysis === 'function'));
    Logger.log('   DB_COMP_executeEliteAnalysis exists: ' + (typeof DB_COMP_executeEliteAnalysis === 'function'));
  } catch (e) {
    Logger.log('   ❌ Error: ' + e);
  }
  Logger.log('');
  
  // Summary
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSIS SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('ROOT CAUSE:');
  Logger.log('   The error "Forbidden" comes from runEliteAnalysis() in UI_Gateway.gs');
  Logger.log('   calling callGateway("comp:elite_full", ...)');
  Logger.log('');
  Logger.log('   The PHP gateway does NOT have a "comp:elite_full" action handler,');
  Logger.log('   so it returns HTTP 403 Forbidden.');
  Logger.log('');
  Logger.log('SOLUTION OPTIONS:');
  Logger.log('   1. Bypass runEliteAnalysis() call in runEliteCompetitorAnalysis()');
  Logger.log('   2. Change runEliteAnalysis() to use a different gateway action');
  Logger.log('   3. Skip gateway entirely for competitor analysis (runs locally)');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: true,
    message: 'Diagnostic complete - check logs above'
  };
}

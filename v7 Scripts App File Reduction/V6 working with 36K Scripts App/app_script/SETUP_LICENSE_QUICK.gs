/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK LICENSE KEY SETUP
 * ═══════════════════════════════════════════════════════════════════════════
 * Run this to quickly set up your license key for testing
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * STEP 1: Set your license key here and run this function
 * 
 * Usage:
 *   1. Replace "YOUR_LICENSE_KEY_HERE" with your actual license key
 *   2. Click Run
 *   3. Check the log for ✅ confirmation
 */
function SETUP_setMyLicenseKey() {
  // 👇 CHANGE THIS TO YOUR ACTUAL LICENSE KEY 👇
  const MY_LICENSE_KEY = "YOUR_LICENSE_KEY_HERE";
  // 👆 CHANGE THIS TO YOUR ACTUAL LICENSE KEY 👆
  
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('🔑 SETTING UP LICENSE KEY');
  Logger.log('═'.repeat(65));
  Logger.log('');
  
  if (!MY_LICENSE_KEY || MY_LICENSE_KEY === "YOUR_LICENSE_KEY_HERE") {
    Logger.log('❌ ERROR: You need to edit this function first!');
    Logger.log('');
    Logger.log('Steps:');
    Logger.log('1. Click "SETUP_LICENSE_QUICK.gs" in the file list (left side)');
    Logger.log('2. Find line 18: const MY_LICENSE_KEY = "YOUR_LICENSE_KEY_HERE"');
    Logger.log('3. Replace YOUR_LICENSE_KEY_HERE with your actual license key');
    Logger.log('4. Save (Ctrl+S or Cmd+S)');
    Logger.log('5. Run this function again');
    Logger.log('');
    Logger.log('═'.repeat(65));
    return false;
  }
  
  try {
    const userProps = PropertiesService.getUserProperties();
    
    // Set both property names for compatibility
    userProps.setProperty('SERPIFAI_LICENSE_KEY', MY_LICENSE_KEY);
    userProps.setProperty('serpifai_license_key', MY_LICENSE_KEY);
    
    Logger.log('✅ LICENSE KEY SAVED SUCCESSFULLY!');
    Logger.log('');
    Logger.log('Key preview: ' + MY_LICENSE_KEY.substring(0, 8) + '...' + MY_LICENSE_KEY.substring(MY_LICENSE_KEY.length - 4));
    Logger.log('');
    Logger.log('Next steps:');
    Logger.log('  1. Run: TEST_checkLicenseKey() to verify');
    Logger.log('  2. Run: TEST_eliteFetcher() to test fetching');
    Logger.log('  3. Run: TEST_gatewayAPIs() to test all APIs');
    Logger.log('');
    Logger.log('═'.repeat(65));
    
    return true;
  } catch (e) {
    Logger.log('❌ ERROR: Failed to save license key');
    Logger.log('');
    Logger.log('Error: ' + e.toString());
    Logger.log('');
    Logger.log('═'.repeat(65));
    return false;
  }
}

/**
 * STEP 2: Verify your license key is set correctly
 */
function SETUP_verifyLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  const key1 = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  const key2 = userProps.getProperty('serpifai_license_key');
  
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('🔍 LICENSE KEY VERIFICATION');
  Logger.log('═'.repeat(65));
  Logger.log('');
  Logger.log('SERPIFAI_LICENSE_KEY: ' + (key1 ? '✅ SET (' + key1.substring(0, 8) + '...)' : '❌ NOT SET'));
  Logger.log('serpifai_license_key: ' + (key2 ? '✅ SET (' + key2.substring(0, 8) + '...)' : '❌ NOT SET'));
  Logger.log('');
  
  if (key1 || key2) {
    Logger.log('✅ LICENSE KEY IS CONFIGURED');
    Logger.log('');
    Logger.log('You can now:');
    Logger.log('  - Use the web app normally');
    Logger.log('  - Run test functions');
    Logger.log('  - Run competitor analysis');
    Logger.log('');
  } else {
    Logger.log('❌ NO LICENSE KEY FOUND');
    Logger.log('');
    Logger.log('Please run: SETUP_setMyLicenseKey()');
    Logger.log('(Remember to edit the license key in the function first!)');
    Logger.log('');
  }
  
  Logger.log('═'.repeat(65));
  Logger.log('');
  
  return !!(key1 || key2);
}

/**
 * STEP 3: Complete diagnostic - check everything
 */
function SETUP_fullDiagnostic() {
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('🔬 FULL SYSTEM DIAGNOSTIC');
  Logger.log('═'.repeat(65));
  Logger.log('');
  
  // 1. Check license key
  Logger.log('[1/4] License Key Check...');
  const userProps = PropertiesService.getUserProperties();
  const key = userProps.getProperty('SERPIFAI_LICENSE_KEY') || userProps.getProperty('serpifai_license_key');
  
  if (key) {
    Logger.log('      ✅ License key is set (' + key.substring(0, 8) + '...)');
  } else {
    Logger.log('      ❌ License key NOT set');
    Logger.log('');
    Logger.log('═'.repeat(65));
    Logger.log('⚠️  DIAGNOSTIC STOPPED: No license key');
    Logger.log('   Run: SETUP_setMyLicenseKey() first');
    Logger.log('═'.repeat(65));
    return;
  }
  
  Logger.log('');
  
  // 2. Check spreadsheet context
  Logger.log('[2/4] Spreadsheet Context Check...');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('      ✅ Spreadsheet: ' + ss.getName());
  } catch (e) {
    Logger.log('      ⚠️  No active spreadsheet (web app mode - this is OK)');
  }
  
  Logger.log('');
  
  // 3. Check gateway connectivity
  Logger.log('[3/4] Gateway Connection Check...');
  try {
    const testResult = callGateway('user:check', { test: true });
    if (testResult && testResult.success) {
      Logger.log('      ✅ Gateway is accessible');
    } else {
      Logger.log('      ⚠️  Gateway responded but with error: ' + (testResult.error || 'Unknown'));
    }
  } catch (e) {
    Logger.log('      ❌ Gateway error: ' + e.toString().substring(0, 100));
  }
  
  Logger.log('');
  
  // 4. Check elite fetcher
  Logger.log('[4/4] Elite Fetcher Check...');
  try {
    if (typeof FT_fetchEliteCompetitorData === 'function') {
      Logger.log('      ✅ Elite fetcher function exists');
    } else {
      Logger.log('      ❌ Elite fetcher function NOT found');
    }
  } catch (e) {
    Logger.log('      ❌ Elite fetcher error: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('🏁 DIAGNOSTIC COMPLETE');
  Logger.log('═'.repeat(65));
  Logger.log('');
  Logger.log('Next step: Run TEST_eliteFetcher() to test full system');
  Logger.log('');
}

/**
 * EMERGENCY RESET: Clear all license keys
 * Only use this if you need to start over
 */
function SETUP_clearLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('⚠️  CLEARING LICENSE KEYS');
  Logger.log('═'.repeat(65));
  Logger.log('');
  
  userProps.deleteProperty('SERPIFAI_LICENSE_KEY');
  userProps.deleteProperty('serpifai_license_key');
  
  Logger.log('✅ All license keys cleared');
  Logger.log('');
  Logger.log('To set a new key, run: SETUP_setMyLicenseKey()');
  Logger.log('');
  Logger.log('═'.repeat(65));
  Logger.log('');
}

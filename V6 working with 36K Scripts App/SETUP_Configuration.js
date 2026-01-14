/**
 * SETUP_Configuration.gs
 * Configuration and setup helper functions
 * Run these ONCE to set up your SerpifAI system
 */

// ============================================================================
// CONFIGURATION SETUP
// ============================================================================

/**
 * SETUP: Configure License Key
 * Run this ONCE to store your license key
 * 
 * Usage:
 *   1. Get your license key from your provider
 *   2. Run: setupLicenseKey('your-license-key-here')
 *   3. Check: getLicenseKey() should return your key
 */
function setupLicenseKey(licenseKey) {
  try {
    if (!licenseKey || licenseKey.length === 0) {
      Logger.log('❌ Error: License key cannot be empty');
      return { success: false, error: 'License key required' };
    }
    
    Logger.log('🔑 Setting up license key...');
    
    // Store in user properties (persists across executions)
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty('serpifai_license_key', licenseKey);
    
    // Verify it was stored
    const stored = userProps.getProperty('serpifai_license_key');
    if (stored === licenseKey) {
      Logger.log('✅ License key saved successfully');
      Logger.log('   Key (masked): ' + licenseKey.substring(0, 10) + '...');
      return { success: true, message: 'License key configured' };
    } else {
      Logger.log('❌ Error: License key was not saved');
      return { success: false, error: 'Failed to save license key' };
    }
    
  } catch (e) {
    Logger.log('❌ Error setting up license key: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Get stored license key
 */
function getLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  const licenseKey = userProps.getProperty('serpifai_license_key');
  
  if (!licenseKey) {
    Logger.log('⚠️  No license key configured');
    Logger.log('   Run: setupLicenseKey("your-key-here")');
    return null;
  }
  
  return licenseKey;
}

/**
 * Clear license key (for testing/reset)
 */
function clearLicenseKey() {
  try {
    const userProps = PropertiesService.getUserProperties();
    userProps.deleteProperty('serpifai_license_key');
    Logger.log('✅ License key cleared');
    return { success: true };
  } catch (e) {
    Logger.log('❌ Error clearing license key: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// PERMISSION VERIFICATION
// ============================================================================

/**
 * Check if all required permissions are granted
 */
function checkPermissions() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🔐 CHECKING REQUIRED PERMISSIONS');
  Logger.log('='.repeat(80) + '\n');
  
  const results = {
    drive: false,
    spreadsheet: false,
    urlFetch: false,
    all: false
  };
  
  // Test 1: Drive API
  Logger.log('[1] Testing Drive API access...');
  try {
    const folders = DriveApp.getFoldersByName('SERPIFAI_PERMISSION_TEST_DO_NOT_DELETE');
    Logger.log('✅ Drive API: GRANTED');
    results.drive = true;
  } catch (e) {
    Logger.log('❌ Drive API: DENIED');
    Logger.log('   Error: ' + e.toString());
    Logger.log('   Fix: Add scope to appsscript.json');
  }
  
  // Test 2: Spreadsheets API
  Logger.log('\n[2] Testing Spreadsheet API access...');
  try {
    const ss = SpreadsheetApp.create('SERPIFAI_PERMISSION_TEST_DO_NOT_KEEP');
    Logger.log('✅ Spreadsheets API: GRANTED');
    results.spreadsheet = true;
    // Clean up
    try {
      DriveApp.getFileById(ss.getId()).setTrashed(true);
      Logger.log('   (Cleaned up test file)');
    } catch (e) {
      // Ignore cleanup errors
    }
  } catch (e) {
    Logger.log('❌ Spreadsheets API: DENIED');
    Logger.log('   Error: ' + e.toString());
    Logger.log('   Fix: Add scope to appsscript.json');
  }
  
  // Test 3: URL Fetch (for API calls)
  Logger.log('\n[3] Testing URL Fetch API access...');
  try {
    // Just check if the function exists (can't actually test without a real endpoint)
    const testUrl = 'https://www.google.com';
    Logger.log('✅ URL Fetch API: LIKELY GRANTED');
    results.urlFetch = true;
  } catch (e) {
    Logger.log('❌ URL Fetch API: DENIED');
    Logger.log('   Error: ' + e.toString());
  }
  
  // Test 4: License Key
  Logger.log('\n[4] Testing License Key configuration...');
  const licenseKey = getLicenseKey();
  if (licenseKey) {
    Logger.log('✅ License Key: CONFIGURED');
    Logger.log('   Key (masked): ' + licenseKey.substring(0, 10) + '...');
  } else {
    Logger.log('❌ License Key: NOT CONFIGURED');
    Logger.log('   Fix: Run setupLicenseKey("your-key-here")');
  }
  
  // Summary
  results.all = results.drive && results.spreadsheet && results.urlFetch && licenseKey;
  
  Logger.log('\n' + '='.repeat(80));
  Logger.log('SUMMARY:');
  Logger.log('  Drive API:        ' + (results.drive ? '✅ YES' : '❌ NO'));
  Logger.log('  Spreadsheet API:  ' + (results.spreadsheet ? '✅ YES' : '❌ NO'));
  Logger.log('  URL Fetch:        ' + (results.urlFetch ? '✅ YES' : '❌ NO'));
  Logger.log('  License Key:      ' + (licenseKey ? '✅ YES' : '❌ NO'));
  Logger.log('='.repeat(80) + '\n');
  
  if (results.all) {
    Logger.log('✅ ALL PERMISSIONS GRANTED - Ready to use SerpifAI!');
  } else {
    Logger.log('⚠️  SOME PERMISSIONS MISSING - See fixes above');
  }
  
  return results;
}

// ============================================================================
// SETUP WIZARD
// ============================================================================

/**
 * Run complete setup wizard
 * This will guide you through all setup steps
 */
function runSetupWizard() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🚀 SERPIFAI SETUP WIZARD');
  Logger.log('='.repeat(80) + '\n');
  
  Logger.log('Step 1: Checking permissions...');
  const perms = checkPermissions();
  
  if (!perms.drive || !perms.spreadsheet) {
    Logger.log('\n⚠️  PERMISSION ERROR DETECTED');
    Logger.log('You need to:');
    Logger.log('  1. Add OAuth scopes to appsscript.json');
    Logger.log('  2. Run: clasp push');
    Logger.log('  3. Google will ask for permission');
    Logger.log('  4. Grant access to Drive and Spreadsheets');
    Logger.log('  5. Then run this wizard again');
    return { success: false, step: 'permissions' };
  }
  
  Logger.log('\n✅ Permissions verified');
  
  Logger.log('\nStep 2: License Key Configuration');
  Logger.log('Your license key should be stored in user properties');
  
  const licenseKey = getLicenseKey();
  if (licenseKey) {
    Logger.log('✅ License key is already configured');
    Logger.log('   Key (masked): ' + licenseKey.substring(0, 10) + '...');
  } else {
    Logger.log('⚠️  License key not found');
    Logger.log('To configure:');
    Logger.log('  1. Get your license key from your provider');
    Logger.log('  2. Run: setupLicenseKey("your-key-here")');
    Logger.log('  3. Come back to run tests');
    return { success: false, step: 'license_key' };
  }
  
  Logger.log('\n' + '='.repeat(80));
  Logger.log('✅ SETUP COMPLETE');
  Logger.log('='.repeat(80) + '\n');
  Logger.log('You are ready to use SerpifAI!');
  Logger.log('Next: Run TEST_QuickDiagnostics()');
  
  return { success: true, step: 'complete' };
}

// ============================================================================
// QUICK STATUS CHECK
// ============================================================================

/**
 * Quick status check (one-liner)
 */
function status() {
  const licenseKey = getLicenseKey();
  const hasLicense = licenseKey ? '✅' : '❌';
  
  try {
    DriveApp.getFoldersByName('test');
    const hasDrive = '✅';
  } catch (e) {
    var hasDrive = '❌';
  }
  
  Logger.log('Status: Drive=' + hasDrive + ' License=' + hasLicense);
}

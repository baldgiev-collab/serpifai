/**
 * Set License Key in User Properties
 * Run this ONCE from Apps Script Editor to configure your license key
 */
function setMyLicenseKey() {
  const licenseKey = 'SERP-FAI-TEST-KEY-123456';
  const email = 'baldgiev@gmail.com';
  
  const userProps = PropertiesService.getUserProperties();
  
  // Set both property names (for compatibility)
  userProps.setProperty('SERPIFAI_LICENSE_KEY', licenseKey);
  userProps.setProperty('serpifai_license_key', licenseKey);
  
  Logger.log('✅ License key set successfully!');
  Logger.log('   License: ' + licenseKey);
  Logger.log('   Email: ' + email);
  
  // Verify it was saved
  const saved = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  if (saved === licenseKey) {
    Logger.log('✅ Verification passed - key is stored correctly');
    
    // Show success message to user
    SpreadsheetApp.getUi().alert(
      '✅ License Key Configured',
      'Your license key has been set successfully!\n\n' +
      'License: ' + licenseKey + '\n' +
      'Email: ' + email + '\n\n' +
      'You can now use the Competitor Analysis feature.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return {
      success: true,
      message: 'License key configured',
      licenseKey: licenseKey,
      email: email
    };
  } else {
    Logger.log('❌ Verification failed - key not saved');
    throw new Error('Failed to save license key');
  }
}

/**
 * Check Current License Key
 * Run this to verify what license key is currently configured
 */
function checkLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  
  const key1 = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  const key2 = userProps.getProperty('serpifai_license_key');
  
  Logger.log('🔍 Current License Keys:');
  Logger.log('   SERPIFAI_LICENSE_KEY: ' + (key1 || 'NOT SET'));
  Logger.log('   serpifai_license_key: ' + (key2 || 'NOT SET'));
  
  const currentKey = key1 || key2;
  
  if (currentKey) {
    SpreadsheetApp.getUi().alert(
      '🔑 Current License Key',
      'License Key: ' + currentKey,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    SpreadsheetApp.getUi().alert(
      '⚠️ No License Key Found',
      'No license key is currently configured.\n\nRun setMyLicenseKey() to configure it.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
  
  return {
    key: currentKey,
    found: !!currentKey
  };
}

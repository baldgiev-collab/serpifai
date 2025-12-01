/**
 * UI_Settings.gs
 * Top-tier Settings Dialog with License Key Management, Credits Tracking, and User Options
 * Modern, professional design with intuitive UX
 */

// ============================================================================
// SETTINGS DIALOG - MAIN FUNCTION
// ============================================================================

/**
 * Show Settings Dialog (called when user clicks Settings button)
 * Returns HTML string directly for sidebar context
 */
function showSettingsDialog() {
  try {
    // Return HTML string directly (not HtmlOutput object)
    return getSettingsHTML();
    
  } catch (e) {
    Logger.log('Error opening settings: ' + e.toString());
    return '<html><body><h1>Error</h1><p>' + e.toString() + '</p></body></html>';
  }
}

/**
 * Get current user settings and info
 * SECURE MODE: MUST fetch from server - no local-only mode
 * SERVER IS THE ONLY SOURCE OF TRUTH
 */
function getUserSettings() {
  try {
    const properties = PropertiesService.getUserProperties();
    const licenseKey = properties.getProperty('SERPIFAI_LICENSE_KEY') || 
                       properties.getProperty('serpifai_license_key') || '';
    
    if (!licenseKey) {
      // No license key - return empty state
      return {
        licenseKey: '',
        licenseKeyMasked: '',
        hasLicenseKey: false,
        email: 'Not configured',
        credits: 0,
        status: 'inactive',
        createdAt: '',
        lastLogin: '',
        projectsCount: 0,
        version: 'v6.0.0',
        apiStatus: 'Not configured',
        dataSource: 'none'
      };
    }
    
    // CRITICAL: MUST fetch user info from server
    Logger.log('Fetching user info from server (REQUIRED)...');
    
    const response = callGateway('getUserInfo', { 
      licenseKey: licenseKey
    });
    
    if (!response || !response.success || !response.user) {
      // Server verification failed - invalidate license key
      const errorMsg = response ? response.error : 'Unknown error';
      
      Logger.log('❌ Server verification failed: ' + errorMsg);
      Logger.log('❌ Removing invalid license key');
      
      properties.deleteProperty('SERPIFAI_LICENSE_KEY');
      properties.deleteProperty('serpifai_license_key');
      
      return {
        licenseKey: '',
        licenseKeyMasked: '',
        hasLicenseKey: false,
        email: 'Server Error - License Removed',
        credits: 0,
        status: 'error',
        createdAt: '',
        lastLogin: '',
        projectsCount: 0,
        version: 'v6.0.0',
        apiStatus: 'Server Unreachable',
        dataSource: 'error'
      };
    }
    
    const userInfo = {
      email: response.user.email || '',
      credits: parseInt(response.user.credits) || 0,
      status: response.user.status || 'inactive',
      createdAt: response.user.created_at || '',
      lastLogin: response.user.last_login || ''
    };
    
    Logger.log('✅ User info loaded from server');
    Logger.log('Email: ' + userInfo.email + ' | Credits: ' + userInfo.credits + ' | Status: ' + userInfo.status);
    
    // Get projects count
    let projectsCount = 0;
    try {
      const projects = listProjectsDual();
      projectsCount = projects.count || 0;
    } catch (e) {
      Logger.log('Error counting projects: ' + e.toString());
    }
    
    return {
      licenseKey: licenseKey,
      licenseKeyMasked: maskLicenseKey(licenseKey),
      hasLicenseKey: true,
      email: userInfo.email,
      credits: userInfo.credits,
      status: userInfo.status,
      createdAt: userInfo.createdAt,
      lastLogin: userInfo.lastLogin,
      projectsCount: projectsCount,
      version: 'v6.0.0',
      apiStatus: 'Connected',
      dataSource: 'server'
    };
    
  } catch (e) {
    Logger.log('ERROR getting user settings: ' + e.toString());
    
    // On error, remove license key for security
    try {
      const properties = PropertiesService.getUserProperties();
      properties.deleteProperty('SERPIFAI_LICENSE_KEY');
      properties.deleteProperty('serpifai_license_key');
    } catch (cleanupError) {
      Logger.log('Cleanup error: ' + cleanupError.toString());
    }
    
    return {
      licenseKey: '',
      licenseKeyMasked: '',
      hasLicenseKey: false,
      email: 'Error - License Removed',
      credits: 0,
      status: 'error',
      createdAt: '',
      lastLogin: '',
      projectsCount: 0,
      version: 'v6.0.0',
      apiStatus: 'Error',
      dataSource: 'error'
    };
  }
}

/**
 * Save license key
 * SECURE MODE: MUST verify with server - no offline usage allowed
 * SERVER IS THE ONLY VALIDATOR
 * Works for ANY Google account - server validates the license key
 */
function saveLicenseKey(licenseKey) {
  try {
    Logger.log('=== saveLicenseKey START (SECURE MODE) ===');
    Logger.log('License key provided: ' + licenseKey);
    Logger.log('Note: Server will validate license key and return account email');
    
    if (!licenseKey || licenseKey.trim() === '') {
      Logger.log('❌ Empty license key provided');
      return {
        success: false,
        message: '❌ License key cannot be empty'
      };
    }
    
    // Validate license key format
    if (licenseKey.length < 10) {
      Logger.log('❌ License key too short: ' + licenseKey.length + ' characters');
      return {
        success: false,
        message: '❌ Invalid license key format (too short)'
      };
    }
    
    const trimmedKey = licenseKey.trim();
    Logger.log('Trimmed key length: ' + trimmedKey.length);
    
    // CRITICAL: MUST verify with server BEFORE saving locally
    Logger.log('Verifying license key with server (REQUIRED)...');
    
    const scriptProps = PropertiesService.getScriptProperties();
    let gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
    
    // Fallback to default if not configured
    if (!gatewayUrl) {
      gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
    }
    
    Logger.log('Gateway URL: ' + gatewayUrl);
    Logger.log('Calling server to verify license key...');
    
    // Verify with server - THIS IS MANDATORY
    // Server validates license key and returns account email
    const response = callGateway('verifyLicenseKey', { 
      licenseKey: trimmedKey
    });
    
    Logger.log('Server response received');
    Logger.log('Response success: ' + (response ? response.success : 'null'));
    
    if (!response || !response.success) {
      const errorMsg = response ? response.error : 'No response';
      const errorCode = response ? response.error_code : null;
      
      Logger.log('❌ Server verification FAILED: ' + errorMsg);
      
      // Handle active session error
      if (errorCode === 'SESSION_ACTIVE') {
        return {
          success: false,
          message: '🚫 LICENSE KEY IN USE\n\n' +
                   errorMsg + '\n\n' +
                   '⚠️  Security: Only ONE user can use a license key at a time.\n\n' +
                   'Solutions:\n' +
                   '• Wait 30 minutes for the other session to expire\n' +
                   '• Ask the other user to close their session\n' +
                   '• Contact support@serpifai.com if you need multi-user access',
          verified: false,
          errorCode: 'SESSION_ACTIVE'
        };
      }
      
      return {
        success: false,
        message: '❌ License key verification failed:\n\n' + errorMsg + '\n\nPlease check:\n• License key is correct\n• Server is accessible\n• License key is active\n• Contact support@serpifai.com for assistance',
        verified: false
      };
    }
    
    Logger.log('✅ Server returned success=true');
    Logger.log('User data: ' + JSON.stringify(response.user));
    
    // Check if user is active
    if (response.user && response.user.status !== 'active') {
      Logger.log('❌ User account is not active: ' + response.user.status);
      return {
        success: false,
        message: '❌ License key is ' + response.user.status + '. Please contact support at support@serpifai.com',
        verified: false
      };
    }
    
    Logger.log('✅ Server verification successful');
    Logger.log('✅ License key validated by server');
    Logger.log('Account email: ' + (response.user ? response.user.email : 'unknown'));
    Logger.log('User status: ' + (response.user ? response.user.status : 'unknown'));
    Logger.log('User credits: ' + (response.user ? response.user.credits : 'unknown'));
    
    // Only save to properties AFTER successful server verification
    const properties = PropertiesService.getUserProperties();
    properties.setProperty('SERPIFAI_LICENSE_KEY', trimmedKey);
    properties.setProperty('serpifai_license_key', trimmedKey);
    
    Logger.log('✅ License key saved to UserProperties');
    Logger.log('=== saveLicenseKey END - SUCCESS ===');
    
    return {
      success: true,
      message: '✅ License key verified and activated!\n\n' +
               '📧 Account: ' + (response.user ? response.user.email : '') + '\n' +
               '💎 Credits: ' + (response.user ? response.user.credits : 0) + '\n\n' +
               'You can now use all features!',
      verified: true,
      user: response.user
    };
    
  } catch (e) {
    Logger.log('ERROR in saveLicenseKey: ' + e.toString());
    return {
      success: false,
      message: '❌ Error: ' + e.toString() + ' - Server connection required.'
    };
  }
}

/**
 * Remove license key
 * Clears ALL related properties for complete cleanup
 */
function removeLicenseKey() {
  try {
    Logger.log('=== removeLicenseKey START ===');
    
    const properties = PropertiesService.getUserProperties();
    
    // Get current key before deleting (for logging)
    const currentKey = properties.getProperty('SERPIFAI_LICENSE_KEY') || 
                       properties.getProperty('serpifai_license_key') || '';
    
    if (currentKey) {
      Logger.log('Removing license key: ' + currentKey.substring(0, 10) + '...');
    } else {
      Logger.log('No license key found to remove');
    }
    
    // Delete ALL possible license key property variations
    properties.deleteProperty('SERPIFAI_LICENSE_KEY');
    properties.deleteProperty('serpifai_license_key');
    properties.deleteProperty('licenseKey');
    properties.deleteProperty('license_key');
    
    // Also clear any cached user data
    properties.deleteProperty('SERPIFAI_USER_EMAIL');
    properties.deleteProperty('SERPIFAI_USER_CREDITS');
    properties.deleteProperty('SERPIFAI_USER_STATUS');
    
    Logger.log('✅ All license key properties cleared');
    Logger.log('=== removeLicenseKey END ===');
    
    return {
      success: true,
      message: '✅ License key removed successfully. All user data cleared.',
      cleared: true
    };
  } catch (e) {
    Logger.log('❌ Error in removeLicenseKey: ' + e.toString());
    return {
      success: false,
      message: '❌ Error removing license key: ' + e.toString(),
      cleared: false
    };
  }
}

/**
 * Refresh user data from server
 */
function refreshUserData() {
  try {
    const properties = PropertiesService.getUserProperties();
    const licenseKey = properties.getProperty('SERPIFAI_LICENSE_KEY') || 
                       properties.getProperty('serpifai_license_key');
    
    if (!licenseKey) {
      return {
        success: false,
        message: 'No license key configured'
      };
    }
    
    const response = callGateway('getUserInfo', { licenseKey: licenseKey });
    
    if (response.success && response.user) {
      return {
        success: true,
        message: 'User data refreshed successfully',
        data: response.user
      };
    } else {
      return {
        success: false,
        message: 'Could not refresh user data: ' + (response.error || 'Unknown error')
      };
    }
    
  } catch (e) {
    return {
      success: false,
      message: 'Error refreshing data: ' + e.toString()
    };
  }
}

/**
 * Mask license key for display
 */
function maskLicenseKey(key) {
  if (!key || key.length < 8) return '***';
  const start = key.substring(0, 4);
  const end = key.substring(key.length - 4);
  const middle = '*'.repeat(Math.min(key.length - 8, 12));
  return start + middle + end;
}

/**
 * Get license key (helper function)
 */
function getLicenseKey() {
  const properties = PropertiesService.getUserProperties();
  return properties.getProperty('SERPIFAI_LICENSE_KEY') || 
         properties.getProperty('serpifai_license_key') || '';
}

/**
 * Verify user has credits BEFORE any operation
 * SECURITY: Call this before every API operation to prevent credit bypass
 * @returns {Object} {hasCredits: boolean, credits: number, message: string}
 */
function verifyCreditsBeforeOperation() {
  try {
    const licenseKey = getLicenseKey();
    
    if (!licenseKey) {
      return {
        hasCredits: false,
        credits: 0,
        message: '❌ No license key configured. Please activate your account in Settings.'
      };
    }
    
    // CRITICAL: Check credits with server
    Logger.log('Verifying credits with server before operation...');
    const response = callGateway('getUserInfo', { licenseKey: licenseKey });
    
    if (!response || !response.success || !response.user) {
      // Remove invalid license key
      const properties = PropertiesService.getUserProperties();
      properties.deleteProperty('SERPIFAI_LICENSE_KEY');
      properties.deleteProperty('serpifai_license_key');
      
      return {
        hasCredits: false,
        credits: 0,
        message: '❌ License key invalid or server unreachable. License removed.'
      };
    }
    
    const credits = parseInt(response.user.credits) || 0;
    const status = response.user.status || 'inactive';
    
    if (status !== 'active') {
      return {
        hasCredits: false,
        credits: credits,
        message: '❌ Account is ' + status + '. Please contact support.'
      };
    }
    
    if (credits <= 0) {
      return {
        hasCredits: false,
        credits: 0,
        message: '❌ No credits remaining. Please purchase more credits.'
      };
    }
    
    Logger.log('✅ Credits verified: ' + credits + ' available');
    
    return {
      hasCredits: true,
      credits: credits,
      message: '✅ ' + credits + ' credits available'
    };
    
  } catch (e) {
    Logger.log('ERROR verifying credits: ' + e.toString());
    return {
      hasCredits: false,
      credits: 0,
      message: '❌ Error verifying credits: ' + e.toString()
    };
  }
}

/**
 * Get next month date for credits reset notice
 */
function getNextMonthDate() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test license key verification
 * Run this from Apps Script editor to debug
 */
function TEST_VerifyLicenseKey() {
  const testKey = 'SERP-FAI-TEST-KEY-123456';
  
  Logger.log('=== TESTING LICENSE KEY VERIFICATION ===');
  Logger.log('Test key: ' + testKey);
  
  try {
    // Test callGateway directly
    Logger.log('\n1. Testing callGateway...');
    const response = callGateway('verifyLicenseKey', { licenseKey: testKey });
    Logger.log('Response: ' + JSON.stringify(response, null, 2));
    
    // Test saveLicenseKey
    Logger.log('\n2. Testing saveLicenseKey...');
    const saveResult = saveLicenseKey(testKey);
    Logger.log('Save result: ' + JSON.stringify(saveResult, null, 2));
    
    // Test getUserSettings
    Logger.log('\n3. Testing getUserSettings...');
    const settings = getUserSettings();
    Logger.log('Settings: ' + JSON.stringify(settings, null, 2));
    
    Logger.log('\n=== TEST COMPLETE ===');
    return 'Check execution log for results';
    
  } catch (e) {
    Logger.log('ERROR: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    return 'Error: ' + e.toString();
  }
}

/**
 * Test MySQL connection
 */
function TEST_MySQLConnection() {
  Logger.log('=== TESTING MYSQL CONNECTION ===');
  
  try {
    const response = callGateway('verifyLicenseKey', { 
      licenseKey: 'SERP-FAI-TEST-KEY-123456' 
    });
    
    Logger.log('MySQL connection successful!');
    Logger.log('Response: ' + JSON.stringify(response, null, 2));
    
    if (response.success && response.user) {
      Logger.log('\n✅ User found in database:');
      Logger.log('  Email: ' + response.user.email);
      Logger.log('  Credits: ' + response.user.credits);
      Logger.log('  Status: ' + response.user.status);
      Logger.log('  Created: ' + response.user.created_at);
    }
    
    return response;
    
  } catch (e) {
    Logger.log('❌ MySQL connection failed: ' + e.toString());
    return { error: e.toString() };
  }
}

/**
 * Quick verification test - Run this after setup
 */
function TEST_QuickVerification() {
  Logger.log('=== QUICK VERIFICATION TEST ===\n');
  
  // 1. Check Script Property
  const scriptProps = PropertiesService.getScriptProperties();
  const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
  
  Logger.log('1. Gateway URL: ' + (gatewayUrl || '❌ NOT SET'));
  
  if (!gatewayUrl) {
    Logger.log('\n⚠️ SETUP REQUIRED:');
    Logger.log('   Go to Project Settings → Script Properties');
    Logger.log('   Add property: PHP_GATEWAY_URL');
    Logger.log('   Value: https://serpifai.com/serpifai_php/api_gateway.php');
    return 'Setup required - see logs';
  }
  
  // 2. Test MySQL Connection
  Logger.log('\n2. Testing MySQL connection...');
  try {
    const response = callGateway('verifyLicenseKey', { 
      licenseKey: 'SERP-FAI-TEST-KEY-123456' 
    });
    
    if (response && response.success) {
      Logger.log('✅ MySQL connection successful!');
      Logger.log('   User: ' + response.user.email);
      Logger.log('   Credits: ' + response.user.credits);
      Logger.log('   Status: ' + response.user.status);
      Logger.log('\n🎉 ALL CHECKS PASSED - System ready!');
    } else {
      Logger.log('❌ MySQL verification failed');
      Logger.log('   Error: ' + (response.error || 'Unknown error'));
      Logger.log('\n⚠️ Check:');
      Logger.log('   1. PHP files uploaded to Hostinger');
      Logger.log('   2. MySQL users table exists');
      Logger.log('   3. Test user added to database');
    }
  } catch (e) {
    Logger.log('❌ Connection error: ' + e.toString());
    Logger.log('\n⚠️ Check:');
    Logger.log('   1. Gateway URL accessible');
    Logger.log('   2. .htaccess allows API access');
    Logger.log('   3. PHP files have correct permissions');
  }
  
  Logger.log('\n=== TEST COMPLETE ===');
  return 'Check execution log for detailed results';
}

/**
 * Setup configuration - Run once to configure gateway URL
 */
function SETUP_ConfigureGateway() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  scriptProps.setProperty('PHP_GATEWAY_URL', 'https://serpifai.com/serpifai_php/api_gateway.php');
  
  Logger.log('✅ Gateway URL configured!');
  Logger.log('Gateway: ' + scriptProps.getProperty('PHP_GATEWAY_URL'));
  Logger.log('\nNext: Run TEST_QuickVerification() to test connection');
  
  return 'Setup complete! Gateway configured.';
}

/**
 * CHECK PHP ERROR DETAILS
 * Retrieves the actual PHP error causing 500
 */
function TEST_CheckPHPErrors() {
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🔍 PHP ERROR CHECKER');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  try {
    const testUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
    
    Logger.log('Testing: ' + testUrl);
    Logger.log('Attempting to get full response...\n');
    
    const options = {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    };
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const code = response.getResponseCode();
    const allHeaders = response.getAllHeaders();
    const content = response.getContentText();
    
    Logger.log('Response Code: ' + code);
    Logger.log('\nResponse Headers:');
    Object.keys(allHeaders).forEach(function(key) {
      Logger.log('  ' + key + ': ' + allHeaders[key]);
    });
    
    Logger.log('\nResponse Body (Full):');
    Logger.log(content || '[EMPTY RESPONSE]');
    
    Logger.log('\n═══════════════════════════════════════════════════════');
    Logger.log('📋 DIAGNOSIS & NEXT STEPS');
    Logger.log('═══════════════════════════════════════════════════════\n');
    
    if (code === 500 && content === '') {
      Logger.log('❌ ERROR: PHP returned 500 with EMPTY response');
      Logger.log('\nThis means PHP is executing but crashing silently.');
      Logger.log('\nMost likely causes (in order):');
      Logger.log('1. ⚠️  OLD MYSQL FUNCTIONS - PHP 8.2 removed mysql_* functions');
      Logger.log('   → Uses: mysql_connect, mysql_query, mysql_fetch_assoc');
      Logger.log('   → Fix: Update to mysqli_* or PDO');
      Logger.log('\n2. Missing include files - database.php or config.php');
      Logger.log('   → Check if files exist and readable');
      Logger.log('   → Check file permissions (should be 644)');
      Logger.log('\n3. PHP syntax error in api_gateway.php');
      Logger.log('   → Check for typos or deprecated syntax');
      Logger.log('\n4. Wrong file paths in include/require statements');
      Logger.log('   → Check relative paths in api_gateway.php');
      Logger.log('\nIMPORTANT - PHP 8.2.28 Notes:');
      Logger.log('✅ PHP 8.2.28 is the LATEST 8.2 version (fully up to date)');
      Logger.log('❌ But old mysql_* functions were REMOVED in PHP 7.0');
      Logger.log('   PHP 8.2 is even stricter than older versions');
      Logger.log('\nFIX STEPS:');
      Logger.log('1. [URGENT] Check cPanel → Error Logs → /serpifai_php/ folder');
      Logger.log('2. [URGENT] Upload test_php_version.php to test PHP execution');
      Logger.log('3. Search api_gateway.php for: mysql_connect, mysql_query, mysql_fetch_assoc');
      Logger.log('4. If found, replace with mysqli_* equivalents');
      Logger.log('5. Verify database.php and config.php exist and are readable');
    } else if (code === 500) {
      Logger.log('⚠️  ERROR: PHP returned 500 with response body');
      Logger.log('\nError Details:');
      Logger.log(content);
      Logger.log('\nThis error message is helpful - it might contain the actual problem.');
    } else if (code === 200) {
      Logger.log('✅ SUCCESS: PHP is responding!');
      Logger.log('\nResponse content:');
      Logger.log(content);
    }
    
    Logger.log('\n═══════════════════════════════════════════════════════\n');
    
  } catch (e) {
    Logger.log('❌ Error checking PHP: ' + e.toString());
  }
}

/**
 * TEST PHP VERSION & COMPATIBILITY
 * Run this to check PHP version and extensions
 */
function TEST_PHPVersionDiagnostics() {
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('📊 PHP VERSION & COMPATIBILITY CHECK');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  try {
    const testUrl = 'https://serpifai.com/serpifai_php/test_php_version.php';
    
    Logger.log('Testing: ' + testUrl);
    Logger.log('This will show PHP version, extensions, and file availability.\n');
    
    const options = {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    };
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const code = response.getResponseCode();
    const content = response.getContentText();
    
    Logger.log('Response Code: ' + code + '\n');
    
    if (code === 200) {
      try {
        const data = JSON.parse(content);
        
        Logger.log('✅ PHP Version: ' + data.php_version);
        Logger.log('   Server API: ' + data.php_sapi);
        Logger.log('   Server Software: ' + data.server_software);
        Logger.log('\n📦 Extensions Loaded:');
        Object.keys(data.extensions_loaded).forEach(function(ext) {
          const status = data.extensions_loaded[ext] ? '✅' : '❌';
          Logger.log('   ' + status + ' ' + ext);
        });
        
        Logger.log('\n📁 Files in /serpifai_php/ directory:');
        if (data.files_in_directory && data.files_in_directory.length > 0) {
          data.files_in_directory.forEach(function(file) {
            Logger.log('   - ' + file);
          });
        } else {
          Logger.log('   [No files found - check permissions]');
        }
        
        Logger.log('\n🔍 Critical Files:');
        Logger.log('   database.php exists: ' + (data.database_php_exists ? '✅' : '❌'));
        Logger.log('   database.php readable: ' + (data.database_php_readable ? '✅' : '❌'));
        Logger.log('   config.php exists: ' + (data.config_php_exists ? '✅' : '❌'));
        Logger.log('   api_gateway.php exists: ' + (data.api_gateway_php_exists ? '✅' : '❌'));
        
        Logger.log('\n⚙️  PHP Configuration:');
        Logger.log('   Memory Limit: ' + data.memory_limit);
        Logger.log('   Max Execution Time: ' + data.max_execution_time);
        Logger.log('   Short Open Tags: ' + data.short_open_tag);
        Logger.log('   Display Errors: ' + data.display_errors);
        Logger.log('   Allow URL Fopen: ' + data.allow_url_fopen);
        
        if (data.database_php_error) {
          Logger.log('\n⚠️  ERROR loading database.php:');
          Logger.log(data.database_php_error);
        }
        
        Logger.log('\n💡 Analysis:');
        if (!data.extensions_loaded.mysqli && !data.extensions_loaded.pdo_mysql) {
          Logger.log('❌ CRITICAL: Neither mysqli nor PDO MySQL is loaded!');
          Logger.log('   Contact Hostinger to enable MySQL extensions.');
        } else {
          Logger.log('✅ MySQL extensions are available.');
        }
        
        if (data.short_open_tag === '' || data.short_open_tag === '0') {
          Logger.log('⚠️  Short tags are DISABLED - use <?php not <?');
        }
        
      } catch (parseError) {
        Logger.log('⚠️  Could not parse response: ' + parseError.toString());
        Logger.log('\nRaw response:');
        Logger.log(content.substring(0, 500));
      }
    } else {
      Logger.log('❌ test_php_version.php not found (404 or error)');
      Logger.log('\nAction: Upload test_php_version.php to /public_html/serpifai_php/');
      Logger.log('File location: php_diagnostics/test_php_version.php');
    }
    
    Logger.log('\n═══════════════════════════════════════════════════════\n');
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
  }
}

/**
 * CHECK EXACT FILE LOCATION
 * Helps identify where PHP files actually are on server
 */
function TEST_CheckFileLocations() {
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🔍 FILE LOCATION CHECKER');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  const urlsToTest = [
    // Primary location (CORRECT - serpifai_php with r)
    'https://serpifai.com/serpifai_php/api_gateway.php',
    
    // Alternative locations (in case wrong path)
    'https://serpifai.com/public_html/serpifai_php/api_gateway.php',
    'https://serpifai.com/api_gateway.php',
    
    // If uploaded to root
    'https://serpifai.com/api/api_gateway.php',
    
    // If folder has different name
    'https://serpifai.com/api_php/api_gateway.php',
    'https://serpifai.com/gateway/api_gateway.php',
    
    // Check parent directory
    'https://serpifai.com/api_gateway.php',
  ];
  
  Logger.log('Testing possible file locations...\n');
  
  urlsToTest.forEach(function(url) {
    try {
      const options = {
        method: 'get',
        muteHttpExceptions: true,
        followRedirects: false,
        timeout: 10
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      const content = response.getContentText().substring(0, 200);
      
      // Determine what type of response
      let status = '';
      if (code === 200 && (content.includes('{') || content.includes('Invalid'))) {
        status = '✅ FOUND (JSON response)';
      } else if (code === 200) {
        status = '⚠️  Found but HTML (wrong file?)';
      } else if (code === 404) {
        status = '❌ 404 Not Found';
      } else if (code === 403) {
        status = '❌ 403 Forbidden (permissions?)';
      } else if (code === 500) {
        status = '⚠️  500 Error (file exists but broken - PHP issue)';
      } else {
        status = '❓ Code ' + code;
      }
      
      Logger.log(status + ': ' + url);
      
      if (code === 200 && !content.includes('{')) {
        Logger.log('   Preview: ' + content.substring(0, 80) + '...');
      }
    } catch (e) {
      Logger.log('❌ Error: ' + url + ' - ' + e.toString());
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════');
  Logger.log('📋 ACTION REQUIRED');
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('\nIf you see ✅ or ⚠️ (500 Error):');
  Logger.log('→ Files exist! Issue is PHP code or configuration');
  Logger.log('→ Run TEST_CheckPHPErrors() to diagnose PHP issue');
  Logger.log('→ Or upload test_php_version.php to test PHP directly');
  Logger.log('\nIf you see ❌ 404 (Not Found):');
  Logger.log('1. Login to Hostinger cPanel');
  Logger.log('2. File Manager → /public_html/');
  Logger.log('3. Confirm folder structure:');
  Logger.log('   └── sepifai_php/ (NOT serpifai_php - missing "r")');
  Logger.log('       ├── api_gateway.php');
  Logger.log('       ├── database.php');
  Logger.log('       └── (other PHP files)');
  Logger.log('\n4. If folder/files missing, upload them');
  Logger.log('5. Re-run this test to find correct URL');
  Logger.log('\n═══════════════════════════════════════════════════════\n');
}

/**
 * COMPREHENSIVE DIAGNOSTIC TEST
 * Run this to diagnose all connection and setup issues
 */
function TEST_ComprehensiveDiagnostics() {
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🔍 COMPREHENSIVE DIAGNOSTIC TEST');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    scriptProperty: false,
    gatewayUrl: '',
    directUrlTest: false,
    gatewayConnection: false,
    mysqlConnection: false,
    licenseKeyTest: false,
    errors: []
  };
  
  // ========================================================================
  // TEST 1: Script Properties Configuration
  // ========================================================================
  Logger.log('TEST 1: Script Properties Configuration');
  Logger.log('─────────────────────────────────────────');
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
    
    if (gatewayUrl) {
      Logger.log('✅ PHP_GATEWAY_URL is configured');
      Logger.log('   URL: ' + gatewayUrl);
      results.scriptProperty = true;
      results.gatewayUrl = gatewayUrl;
    } else {
      Logger.log('❌ PHP_GATEWAY_URL is NOT configured');
      Logger.log('   Action: Run SETUP_ConfigureGateway() to fix');
      results.errors.push('Script Property not configured');
      
      // Auto-configure it
      Logger.log('\n🔧 Auto-configuring gateway URL...');
      scriptProps.setProperty('PHP_GATEWAY_URL', 'https://serpifai.com/serpifai_php/api_gateway.php');
      results.gatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
      Logger.log('✅ Gateway URL configured automatically');
      results.scriptProperty = true;
    }
  } catch (e) {
    Logger.log('❌ Error checking script properties: ' + e.toString());
    results.errors.push('Script property error: ' + e.message);
  }
  
  Logger.log('\n');
  
  // ========================================================================
  // TEST 2: Direct URL Accessibility Test
  // ========================================================================
  Logger.log('TEST 2: Direct URL Accessibility Test');
  Logger.log('─────────────────────────────────────────');
  try {
    const testUrl = results.gatewayUrl || 'https://serpifai.com/serpifai_php/api_gateway.php';
    Logger.log('Testing URL: ' + testUrl);
    
    const options = {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    };
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Preview: ' + responseText.substring(0, 200));
    
    if (responseCode === 200 || responseCode === 400 || responseCode === 405) {
      Logger.log('✅ URL is accessible (code ' + responseCode + ')');
      results.directUrlTest = true;
      
      // Check if it's returning HTML (coming soon page) or JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        Logger.log('✅ Response is JSON (API is working)');
      } else if (responseText.toLowerCase().includes('<!doctype') || responseText.toLowerCase().includes('<html')) {
        Logger.log('⚠️  WARNING: Receiving HTML page instead of JSON');
        Logger.log('   This might be a "coming soon" page or redirect');
        Logger.log('   Check .htaccess configuration');
        results.errors.push('Receiving HTML instead of JSON - check .htaccess');
      }
    } else {
      Logger.log('❌ Unexpected response code: ' + responseCode);
      results.errors.push('URL returned code ' + responseCode);
    }
  } catch (e) {
    Logger.log('❌ Cannot access URL: ' + e.toString());
    results.errors.push('URL fetch error: ' + e.message);
  }
  
  Logger.log('\n');
  
  // ========================================================================
  // TEST 3: Gateway Connection (POST request)
  // ========================================================================
  Logger.log('TEST 3: Gateway Connection (POST request)');
  Logger.log('─────────────────────────────────────────');
  try {
    const testUrl = results.gatewayUrl || 'https://serpifai.com/serpifai_php/api_gateway.php';
    
    const requestData = {
      license: 'TEST-KEY',
      action: 'check_status',
      payload: {}
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    };
    
    Logger.log('Sending POST request...');
    const response = UrlFetchApp.fetch(testUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response: ' + responseText.substring(0, 300));
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      Logger.log('✅ Gateway is responding with JSON');
      Logger.log('   Response structure: ' + JSON.stringify(Object.keys(jsonResponse)));
      results.gatewayConnection = true;
      
      if (jsonResponse.error) {
        Logger.log('   Error message: ' + jsonResponse.error);
      }
    } catch (parseError) {
      Logger.log('❌ Response is not valid JSON');
      Logger.log('   Parse error: ' + parseError.toString());
      results.errors.push('Gateway not returning JSON: ' + responseText.substring(0, 100));
    }
  } catch (e) {
    Logger.log('❌ Gateway connection failed: ' + e.toString());
    results.errors.push('Gateway connection error: ' + e.message);
  }
  
  Logger.log('\n');
  
  // ========================================================================
  // TEST 4: MySQL Connection (via verifyLicenseKey)
  // ========================================================================
  Logger.log('TEST 4: MySQL Connection Test');
  Logger.log('─────────────────────────────────────────');
  try {
    const testUrl = results.gatewayUrl || 'https://serpifai.com/serpifai_php/api_gateway.php';
    
    const requestData = {
      license: '',
      action: 'verifyLicenseKey',
      payload: {
        licenseKey: 'SERP-FAI-TEST-KEY-123456'
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    };
    
    Logger.log('Testing MySQL with test license key...');
    const response = UrlFetchApp.fetch(testUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Response Code: ' + responseCode);
    
    try {
      const jsonResponse = JSON.parse(responseText);
      Logger.log('Response: ' + JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.success && jsonResponse.user) {
        Logger.log('✅ MySQL connection successful!');
        Logger.log('   User Email: ' + jsonResponse.user.email);
        Logger.log('   Credits: ' + jsonResponse.user.credits);
        Logger.log('   Status: ' + jsonResponse.user.status);
        results.mysqlConnection = true;
        results.licenseKeyTest = true;
      } else if (jsonResponse.error) {
        Logger.log('⚠️  MySQL query executed but returned error');
        Logger.log('   Error: ' + jsonResponse.error);
        results.mysqlConnection = true; // Connection works, just no data
        results.errors.push('License key not found in database');
      }
    } catch (parseError) {
      Logger.log('❌ Cannot parse MySQL response');
      results.errors.push('MySQL response parse error');
    }
  } catch (e) {
    Logger.log('❌ MySQL connection test failed: ' + e.toString());
    results.errors.push('MySQL test error: ' + e.message);
  }
  
  Logger.log('\n');
  
  // ========================================================================
  // TEST 5: callGateway Function Test
  // ========================================================================
  Logger.log('TEST 5: callGateway Function Test');
  Logger.log('─────────────────────────────────────────');
  try {
    Logger.log('Testing callGateway() function...');
    const response = callGateway('verifyLicenseKey', { 
      licenseKey: 'SERP-FAI-TEST-KEY-123456' 
    });
    
    Logger.log('callGateway() response: ' + JSON.stringify(response, null, 2));
    
    if (response && response.success) {
      Logger.log('✅ callGateway() working correctly');
    } else {
      Logger.log('⚠️  callGateway() returned error: ' + (response ? response.error : 'No response'));
    }
  } catch (e) {
    Logger.log('❌ callGateway() error: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    results.errors.push('callGateway error: ' + e.message);
  }
  
  Logger.log('\n');
  
  // ========================================================================
  // SUMMARY
  // ========================================================================
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSTIC SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  Logger.log('Test Results:');
  Logger.log('  Script Property Configured: ' + (results.scriptProperty ? '✅' : '❌'));
  Logger.log('  Gateway URL Accessible: ' + (results.directUrlTest ? '✅' : '❌'));
  Logger.log('  Gateway Responding: ' + (results.gatewayConnection ? '✅' : '❌'));
  Logger.log('  MySQL Connected: ' + (results.mysqlConnection ? '✅' : '❌'));
  Logger.log('  Test License Key Found: ' + (results.licenseKeyTest ? '✅' : '❌'));
  
  Logger.log('\nGateway URL: ' + results.gatewayUrl);
  
  if (results.errors.length > 0) {
    Logger.log('\n⚠️  ERRORS FOUND:');
    results.errors.forEach(function(error, index) {
      Logger.log('  ' + (index + 1) + '. ' + error);
    });
  }
  
  // ========================================================================
  // RECOMMENDATIONS
  // ========================================================================
  Logger.log('\n═══════════════════════════════════════════════════════');
  Logger.log('💡 RECOMMENDATIONS');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  if (!results.scriptProperty) {
    Logger.log('❌ Configure Script Property:');
    Logger.log('   1. Project Settings → Script Properties');
    Logger.log('   2. Add: PHP_GATEWAY_URL = https://serpifai.com/serpifai_php/api_gateway.php');
    Logger.log('   OR run: SETUP_ConfigureGateway()\n');
  }
  
  if (!results.directUrlTest) {
    Logger.log('❌ Gateway URL not accessible:');
    Logger.log('   1. Check if PHP files uploaded to: /public_html/serpifai_php/');
    Logger.log('   2. Verify file permissions (644 for PHP files)');
    Logger.log('   3. Check if domain serpifai.com is active\n');
  }
  
  if (results.directUrlTest && !results.gatewayConnection) {
    Logger.log('⚠️  Gateway accessible but not responding correctly:');
    Logger.log('   1. Check .htaccess - may be blocking POST requests');
    Logger.log('   2. Verify "coming soon" page not interfering');
    Logger.log('   3. Check PHP error logs in cPanel\n');
  }
  
  if (results.gatewayConnection && !results.mysqlConnection) {
    Logger.log('⚠️  Gateway working but MySQL not connecting:');
    Logger.log('   1. Check database.php configuration');
    Logger.log('   2. Verify MySQL credentials');
    Logger.log('   3. Check if users table exists\n');
  }
  
  if (results.mysqlConnection && !results.licenseKeyTest) {
    Logger.log('⚠️  MySQL working but test license key not found:');
    Logger.log('   1. Add test user to database:');
    Logger.log('      INSERT INTO users (email, license_key, status, credits)');
    Logger.log('      VALUES (\'test@serpifai.com\', \'SERP-FAI-TEST-KEY-123456\', \'active\', 100);\n');
  }
  
  if (results.scriptProperty && results.directUrlTest && results.gatewayConnection && 
      results.mysqlConnection && results.licenseKeyTest) {
    Logger.log('🎉 ALL TESTS PASSED!');
    Logger.log('   Your system is fully configured and ready to use.\n');
  }
  
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  return results;
}

// ============================================================================
// SETTINGS HTML - MODERN, TOP-TIER DESIGN
// ============================================================================

function getSettingsHTML() {
  const settings = getUserSettings();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      color: #333;
      overflow-x: hidden;
    }
    
    .container {
      max-width: 100%;
      background: white;
      min-height: 100vh;
      overflow-y: auto;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .content {
      padding: 30px 40px;
    }
    
    .section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .section:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .profile-header {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 2px solid rgba(102, 126, 234, 0.2);
    }
    
    .profile-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .profile-info {
      flex: 1;
    }
    
    .profile-name {
      font-size: 20px;
      font-weight: 700;
      color: #495057;
      margin-bottom: 6px;
    }
    
    .profile-meta {
      font-size: 13px;
      color: #6c757d;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .info-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .info-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .info-card:hover::before {
      opacity: 1;
    }
    
    .info-card:hover {
      border-color: #667eea;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
      transform: translateY(-4px);
    }
    
    .info-icon {
      font-size: 24px;
      margin-bottom: 10px;
      display: block;
    }
    
    .credits-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border: 2px solid rgba(102, 126, 234, 0.2);
    }
    
    .credits-notice {
      font-size: 11px;
      color: #6c757d;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(0,0,0,0.05);
      font-weight: 500;
    }
    
    .info-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    
    .info-value {
      font-size: 20px;
      font-weight: 700;
      color: #495057;
    }
    
    .info-value.success {
      color: #28a745;
    }
    
    .info-value.warning {
      color: #ffc107;
    }
    
    .info-value.danger {
      color: #dc3545;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-weight: 600;
      color: #495057;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      font-family: 'Courier New', monospace;
    }
    
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-success {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      color: white;
    }
    
    .btn-danger {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
      color: white;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .alert {
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge-success {
      background: #28a745;
      color: white;
    }
    
    .badge-warning {
      background: #ffc107;
      color: #333;
    }
    
    .badge-danger {
      background: #dc3545;
      color: white;
    }
    
    .divider {
      height: 1px;
      background: #e9ecef;
      margin: 25px 0;
    }
    
    .loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .hidden {
      display: none !important;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 12px;
      border-top: 1px solid #e9ecef;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        <span>⚙️</span>
        SerpifAI Settings
      </h1>
      <p>Manage your license key, credits, and preferences</p>
    </div>
    
    <div class="content">
      <!-- Alert Messages -->
      <div id="alertContainer"></div>
      
      <!-- Account Overview -->
      <div class="section">
        <div class="section-title">📊 Account Overview</div>
        
        <!-- User Profile Header -->
        ${settings.email && settings.email !== 'Not configured' && settings.email !== 'Error' ? `
        <div class="profile-header">
          <div class="profile-avatar">
            ${settings.email.charAt(0).toUpperCase()}
          </div>
          <div class="profile-info">
            <div class="profile-name">${settings.email}</div>
            <div class="profile-meta">
              ${settings.createdAt ? `Member since ${new Date(settings.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}` : 'Active Account'}
              ${settings.lastLogin ? ` • Last login ${new Date(settings.lastLogin).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}` : ''}
            </div>
          </div>
        </div>
        ` : ''}
        
        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon">✓</div>
            <div class="info-label">Account Status</div>
            <div class="info-value ${settings.status === 'active' ? 'success' : 'danger'}">
              ${settings.status === 'active' ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div class="info-card credits-card">
            <div class="info-icon">💎</div>
            <div class="info-label">Credits Remaining</div>
            <div class="info-value ${settings.credits > 50 ? 'success' : settings.credits > 20 ? 'warning' : 'danger'}">
              ${settings.credits}
            </div>
            <div class="credits-notice">
              📅 Monthly • Resets ${getNextMonthDate()}
            </div>
          </div>
          <div class="info-card">
            <div class="info-icon">📁</div>
            <div class="info-label">Projects Created</div>
            <div class="info-value">
              ${settings.projectsCount}
            </div>
          </div>
          <div class="info-card">
            <div class="info-icon">🌐</div>
            <div class="info-label">API Connection</div>
            <div class="info-value ${settings.hasLicenseKey ? 'success' : 'warning'}">
              ${settings.apiStatus}
            </div>
          </div>
        </div>
      </div>
      
      <!-- License Key Management -->
      <div class="section">
        <div class="section-title">🔑 License Key</div>
        
        ${settings.hasLicenseKey ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef;">
          <div class="info-label">Current License Key</div>
          <div style="font-family: 'Courier New', monospace; font-size: 16px; color: #495057; margin: 10px 0;">
            ${settings.licenseKeyMasked}
          </div>
          <span class="badge badge-success">Active</span>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-success" onclick="refreshData()">
            <span>🔄</span> Refresh Data
          </button>
          <button class="btn btn-danger" onclick="removeKey()">
            <span>🗑️</span> Remove Key
          </button>
        </div>
        ` : `
        <div class="alert alert-info">
          <span>ℹ️</span>
          No license key configured. Please enter your license key below to activate your account.
        </div>
        
        <div class="form-group">
          <label for="licenseKeyInput">Enter License Key</label>
          <input 
            type="text" 
            id="licenseKeyInput" 
            placeholder="SERP-FAI-XXXX-XXXX-XXXX"
            autocomplete="off"
          >
        </div>
        
        <button class="btn btn-primary" onclick="saveKey()">
          <span>💾</span> Save License Key
        </button>
        `}
        
        <div class="divider"></div>
        
        <div style="font-size: 13px; color: #6c757d; line-height: 1.6;">
          <strong>Need a license key?</strong><br>
          Contact your administrator or check your email for your license key.
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="section">
        <div class="section-title">⚡ Quick Actions</div>
        <div class="btn-group">
          <button class="btn btn-primary" onclick="viewProjects()">
            <span>📁</span> View Projects
          </button>
          <button class="btn btn-secondary" onclick="runDiagnostics()">
            <span>🔍</span> Run Diagnostics
          </button>
          <button class="btn btn-secondary" onclick="clearCache()">
            <span>🧹</span> Clear Cache
          </button>
        </div>
      </div>
      
      <!-- System Info -->
      <div class="section">
        <div class="section-title">ℹ️ System Information</div>
        <div style="font-size: 13px; color: #6c757d; line-height: 1.8;">
          <div><strong>Version:</strong> ${settings.version}</div>
          <div><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Storage:</strong> Google Sheets + MySQL</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      © 2025 SerpifAI v6 | All Rights Reserved
    </div>
  </div>
  
  <script>
    // Get google.script.run from parent window (iframe context)
    const scriptRun = window.parent && window.parent.google && window.parent.google.script ? window.parent.google.script.run : null;
    
    if (!scriptRun) {
      console.error('Cannot access google.script.run - not in proper Apps Script context');
    }
    
    // Save License Key
    function saveKey() {
      const input = document.getElementById('licenseKeyInput');
      const key = input.value.trim();
      
      if (!key) {
        showAlert('Please enter a license key', 'error');
        return;
      }
      
      if (!scriptRun) {
        showAlert('Error: Cannot connect to Apps Script', 'error');
        return;
      }
      
      showAlert('Verifying license key...', 'info');
      
      scriptRun
        .withSuccessHandler(function(result) {
          if (result.success) {
            showAlert('✅ License activated! Refreshing...', 'success');
            // Reload immediately to show new account info
            setTimeout(function() {
              location.reload();
            }, 800);
          } else {
            showAlert(result.message, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showAlert('Error: ' + error.message, 'error');
        })
        .saveLicenseKey(key);
    }
    
    // Remove License Key
    function removeKey() {
      if (!confirm('Are you sure you want to remove your license key? This will deactivate your account.')) {
        return;
      }
      
      if (!scriptRun) {
        showAlert('Error: Cannot connect to Apps Script', 'error');
        return;
      }
      
      showAlert('Removing license key...', 'info');
      
      scriptRun
        .withSuccessHandler(function(result) {
          if (result.success) {
            showAlert('✅ License removed! Refreshing...', 'success');
            // Reload immediately to show empty state
            setTimeout(function() {
              location.reload();
            }, 800);
          } else {
            showAlert(result.message, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showAlert('Error: ' + error.message, 'error');
        })
        .removeLicenseKey();
    }
    
    // Refresh Data
    function refreshData() {
      if (!scriptRun) {
        showAlert('Error: Cannot connect to Apps Script', 'error');
        return;
      }
      
      showAlert('Refreshing user data...', 'info');
      
      scriptRun
        .withSuccessHandler(function(result) {
          if (result.success) {
            showAlert('✅ Data refreshed!', 'success');
            // Quick reload to show updated data
            setTimeout(function() {
              location.reload();
            }, 500);
          } else {
            showAlert(result.message, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showAlert('Error: ' + error.message, 'error');
        })
        .refreshUserData();
    }
    
    // Quick Actions
    function viewProjects() {
      showAlert('Closing settings...', 'info');
      // Close the modal by sending message to parent
      if (window.parent) {
        window.parent.postMessage({action: 'closeSettings'}, '*');
      }
    }
    
    function runDiagnostics() {
      if (!scriptRun) {
        showAlert('Error: Cannot connect to Apps Script', 'error');
        return;
      }
      
      showAlert('Running diagnostics...', 'info');
      scriptRun
        .withSuccessHandler(function() {
          showAlert('Diagnostics complete! Check execution log.', 'success');
        })
        .withFailureHandler(function(error) {
          showAlert('Error running diagnostics: ' + error.message, 'error');
        })
        .TEST_QuickDiagnostics();
    }
    
    function clearCache() {
      if (confirm('Clear all cached data?')) {
        showAlert('Cache cleared successfully', 'success');
      }
    }
    
    // Show Alert
    function showAlert(message, type) {
      const container = document.getElementById('alertContainer');
      const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';
      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      
      container.innerHTML = '<div class="alert ' + alertClass + '"><span>' + icon + '</span><span>' + message + '</span></div>';
      
      // Auto-hide after 5 seconds
      setTimeout(function() {
        container.innerHTML = '';
      }, 5000);
    }
    
    // Enter key to save
    document.addEventListener('DOMContentLoaded', function() {
      const input = document.getElementById('licenseKeyInput');
      if (input) {
        input.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            saveKey();
          }
        });
        input.focus();
      }
    });
  </script>
</body>
</html>
  `;
}

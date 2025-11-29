/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST: VERIFY OLD FILES DELETED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Run this AFTER deleting old competitor_intelligence files
 * Verifies that old functions don't exist and new functions do
 * 
 * COPY THIS TO DATABRIDGE APPS SCRIPT AND RUN
 */

function TEST_VerifyCleanup() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔍 CLEANUP VERIFICATION TEST');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  var errors = [];
  var warnings = [];
  var successes = [];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 1: Old functions should NOT exist
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 CHECK 1: Verifying old functions deleted...');
  Logger.log('');
  
  var oldFunctions = [
    'COMP_collectCategoryIntelligence',    // From collectors.gs
    'COMP_collectContentStrategies',       // From collectors.gs
    'ELITE_orchestrateAnalysis',           // From ELITE_COLLECTOR_SYSTEM.gs
    'ELITE_callAPI',                       // From elite_api_callers.gs
    'COMP_createWebAppHandler',            // From WebAppHandler.gs
    'FET_extractHeadings',                 // From FETCHER_MODULE.gs
    'FET_extractMetadata',                 // From FETCHER_MODULE.gs
    'FET_extractOpengraph',                // From FETCHER_MODULE.gs
    'FET_extractSchema',                   // From FETCHER_MODULE.gs
    'FET_extractInternalLinks'             // From FETCHER_MODULE.gs
  ];
  
  oldFunctions.forEach(function(funcName) {
    try {
      // Try to call the function - should throw error if deleted
      var func = this[funcName];
      if (typeof func === 'function') {
        errors.push('❌ OLD function still exists: ' + funcName);
        Logger.log('  ❌ OLD function still exists: ' + funcName);
      } else {
        successes.push('✅ ' + funcName + ' - deleted');
        Logger.log('  ✅ ' + funcName + ' - deleted');
      }
    } catch (e) {
      // Error is good - function doesn't exist
      successes.push('✅ ' + funcName + ' - deleted');
      Logger.log('  ✅ ' + funcName + ' - deleted');
    }
  });
  
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 2: New functions SHOULD exist
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 CHECK 2: Verifying new functions exist...');
  Logger.log('');
  
  var newFunctions = [
    'COLLECTOR_gatherAllData',             // From enhanced_data_collector.gs
    'COLLECTOR_gatherBatchData',           // From enhanced_data_collector.gs
    'APIS_fetchAndExtract',                // From fetcher_client.gs
    'APIS_fetcherCall',                    // From fetcher_client.gs
    'STORAGE_saveCompetitorJSON',          // From unified_competitor_storage.gs
    'STORAGE_readCompetitorJSON',          // From unified_competitor_storage.gs
    'OPENPAGERANK_fetch',                  // From openpagerank_api.gs
    'PAGESPEED_analyze',                   // From pagespeed_api.gs
    'SERPER_getDomainOverview'             // From serper_api.gs
  ];
  
  newFunctions.forEach(function(funcName) {
    try {
      var func = this[funcName];
      if (typeof func === 'function') {
        successes.push('✅ ' + funcName + ' - exists');
        Logger.log('  ✅ ' + funcName + ' - exists');
      } else if (typeof func === 'undefined') {
        errors.push('❌ NEW function missing: ' + funcName);
        Logger.log('  ❌ NEW function missing: ' + funcName);
      } else {
        warnings.push('⚠️ ' + funcName + ' - unexpected type: ' + typeof func);
        Logger.log('  ⚠️ ' + funcName + ' - unexpected type: ' + typeof func);
      }
    } catch (e) {
      errors.push('❌ NEW function error: ' + funcName + ' - ' + e);
      Logger.log('  ❌ NEW function error: ' + funcName + ' - ' + e);
    }
  });
  
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 3: Verify enhanced_data_collector.gs uses correct pattern
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 CHECK 3: Verifying collector uses remote calls...');
  Logger.log('');
  
  try {
    // Get the function source code (if possible)
    var funcSource = COLLECTOR_gatherAllData.toString();
    
    // Check for correct pattern
    if (funcSource.indexOf('APIS_fetchAndExtract') > -1) {
      successes.push('✅ Collector uses APIS_fetchAndExtract (correct)');
      Logger.log('  ✅ Collector uses APIS_fetchAndExtract (correct)');
    } else {
      errors.push('❌ Collector does NOT use APIS_fetchAndExtract');
      Logger.log('  ❌ Collector does NOT use APIS_fetchAndExtract');
    }
    
    // Check for OLD pattern (should NOT exist)
    if (funcSource.indexOf('FET_extractHeadings') > -1 ||
        funcSource.indexOf('FET_extractMetadata') > -1) {
      errors.push('❌ Collector still calls FET_ functions directly!');
      Logger.log('  ❌ Collector still calls FET_ functions directly!');
    } else {
      successes.push('✅ Collector does NOT call FET_ functions (correct)');
      Logger.log('  ✅ Collector does NOT call FET_ functions (correct)');
    }
  } catch (e) {
    warnings.push('⚠️ Could not inspect COLLECTOR_gatherAllData source: ' + e);
    Logger.log('  ⚠️ Could not inspect COLLECTOR_gatherAllData source: ' + e);
  }
  
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 4: Script properties configured
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 CHECK 4: Verifying script properties...');
  Logger.log('');
  
  var props = PropertiesService.getScriptProperties();
  
  var requiredProps = [
    'FETCHER_WEB_APP_URL',
    'FETCHER_API_KEY',
    'OPEN_PAGERANK_KEY',
    'PAGE_SPEED_KEY',
    'SERPER_KEY'
  ];
  
  requiredProps.forEach(function(propName) {
    var value = props.getProperty(propName);
    if (value && value !== '') {
      successes.push('✅ ' + propName + ' - configured');
      Logger.log('  ✅ ' + propName + ' - configured');
    } else {
      warnings.push('⚠️ ' + propName + ' - NOT configured');
      Logger.log('  ⚠️ ' + propName + ' - NOT configured');
    }
  });
  
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('📊 VERIFICATION SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('✅ Successes: ' + successes.length);
  Logger.log('⚠️ Warnings: ' + warnings.length);
  Logger.log('❌ Errors: ' + errors.length);
  Logger.log('');
  
  if (errors.length > 0) {
    Logger.log('❌ CLEANUP INCOMPLETE - CRITICAL ERRORS FOUND:');
    errors.forEach(function(err) {
      Logger.log('   ' + err);
    });
    Logger.log('');
    Logger.log('👉 ACTION REQUIRED:');
    Logger.log('   1. Delete old files from DataBridge Apps Script');
    Logger.log('   2. Redeploy enhanced_data_collector.gs from local');
    Logger.log('   3. Re-run this test');
    Logger.log('');
  } else if (warnings.length > 0) {
    Logger.log('⚠️ CLEANUP MOSTLY COMPLETE - WARNINGS FOUND:');
    warnings.forEach(function(warn) {
      Logger.log('   ' + warn);
    });
    Logger.log('');
    Logger.log('👉 RECOMMENDED:');
    Logger.log('   1. Configure missing script properties');
    Logger.log('   2. Deploy new version');
    Logger.log('   3. Run TEST_endToEndCollection()');
    Logger.log('');
  } else {
    Logger.log('✅✅✅ CLEANUP VERIFIED SUCCESSFULLY! ✅✅✅');
    Logger.log('');
    Logger.log('🚀 READY TO TEST:');
    Logger.log('   Run: TEST_endToEndCollection()');
    Logger.log('   Expected: 7/7 fetcher success, 80-90% completeness');
    Logger.log('');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Quick test to verify which collector is being called
 */
function TEST_WhichCollectorIsRunning() {
  Logger.log('🔍 Testing which collector is being executed...');
  Logger.log('');
  
  try {
    // This will tell us which file is actually running
    var testUrl = 'https://ahrefs.com';
    var projectContext = { projectId: 'test', targetKeywords: [], industry: 'test' };
    
    Logger.log('📋 Calling COLLECTOR_gatherAllData...');
    Logger.log('');
    
    // Add logging to see which code path executes
    var result = COLLECTOR_gatherAllData(testUrl, projectContext);
    
    Logger.log('');
    Logger.log('📊 Result received!');
    Logger.log('   Domain: ' + result.domain);
    Logger.log('   Completeness: ' + result.collectionSummary.completeness + '%');
    Logger.log('   Fetcher successes: ' + result.dataQuality.fetcherSuccess.length);
    Logger.log('   Fetcher failures: ' + result.dataQuality.fetcherFailed.length);
    Logger.log('');
    
    // Check what failed
    if (result.dataQuality.fetcherFailed.length > 0) {
      Logger.log('❌ Failed fetchers:');
      result.dataQuality.fetcherFailed.forEach(function(name) {
        Logger.log('   - ' + name);
      });
      Logger.log('');
      
      // If we see specific error patterns, we know which file ran
      var hasHtmlMatchError = false;
      var hasFetNotDefinedError = false;
      
      // These would come from the error logs
      // The TEST_endToEndCollection will show us the actual errors
    }
    
    if (result.collectionSummary.completeness === 0 || result.collectionSummary.completeness < 50) {
      Logger.log('⚠️ LOW COMPLETENESS - Likely using old collector or missing functions');
      Logger.log('');
      Logger.log('👉 Check execution logs above for specific errors:');
      Logger.log('   - "html.match is not a function" → OLD collector running');
      Logger.log('   - "FET_extractHeadings is not defined" → OLD collector calling FET_ directly');
      Logger.log('   - No errors but 0% completeness → Fetcher/APIs not deployed');
      Logger.log('');
    } else {
      Logger.log('✅ HIGH COMPLETENESS - Collector working correctly!');
      Logger.log('');
    }
    
  } catch (e) {
    Logger.log('❌ Error during test: ' + e);
    Logger.log('');
    Logger.log('Error details:');
    Logger.log('   Message: ' + e.message);
    Logger.log('   Stack: ' + e.stack);
    Logger.log('');
  }
}

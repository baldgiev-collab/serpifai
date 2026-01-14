/**
 * COMPREHENSIVE DIAGNOSTIC TEST
 * Run this to check all components step-by-step
 * Copy/paste this entire function into your DataBridge Apps Script
 */
function TEST_ComprehensiveDiagnostic() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔍 COMPREHENSIVE DIAGNOSTIC TEST');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var results = {
    scriptProperties: false,
    fetcherConnection: false,
    fetcherExtraction: false,
    apiOpenPageRank: false,
    apiPageSpeed: false,
    apiSerper: false,
    storage: false,
    fullCollection: false
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Script Properties
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('📋 TEST 1: Script Properties');
  Logger.log('─────────────────────────────────────────────────────────');
  
  var props = PropertiesService.getScriptProperties();
  var fetcherUrl = props.getProperty('FETCHER_WEB_APP_URL');
  var oprKey = props.getProperty('OPEN_PAGERANK_KEY');
  var psKey = props.getProperty('PAGE_SPEED_KEY');
  var serperKey = props.getProperty('SERPER_KEY');
  var fetcherApiKey = props.getProperty('FETCHER_API_KEY');
  
  Logger.log('FETCHER_WEB_APP_URL: ' + (fetcherUrl ? '✅ SET' : '❌ MISSING'));
  Logger.log('OPEN_PAGERANK_KEY: ' + (oprKey ? '✅ SET' : '❌ MISSING'));
  Logger.log('PAGE_SPEED_KEY: ' + (psKey ? '✅ SET' : '❌ MISSING'));
  Logger.log('SERPER_KEY: ' + (serperKey ? '✅ SET' : '❌ MISSING'));
  Logger.log('FETCHER_API_KEY: ' + (fetcherApiKey ? '✅ SET' : '⚠️ NOT SET (may be optional)'));
  
  results.scriptProperties = fetcherUrl && oprKey && psKey && serperKey;
  
  if (!results.scriptProperties) {
    Logger.log('❌ TEST 1 FAILED: Missing required script properties');
    Logger.log('⚠️ Cannot proceed without script properties');
    return results;
  }
  Logger.log('✅ TEST 1 PASSED: All required properties set');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Fetcher Connection (Fetch HTML)
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('🌐 TEST 2: Fetcher Connection (Fetch HTML)');
  Logger.log('─────────────────────────────────────────────────────────');
  
  try {
    var fetchResult = APIS_fetcherCall('fetchSingleUrl', { url: 'https://example.com' });
    
    if (fetchResult.ok && fetchResult.html) {
      Logger.log('✅ Fetch successful');
      Logger.log('   HTML length: ' + fetchResult.html.length + ' chars');
      Logger.log('   Status code: ' + (fetchResult.status || 'N/A'));
      results.fetcherConnection = true;
    } else {
      Logger.log('❌ Fetch failed: ' + (fetchResult.error || 'Unknown error'));
      Logger.log('   Response: ' + JSON.stringify(fetchResult).substring(0, 200));
    }
  } catch (e) {
    Logger.log('❌ Exception: ' + e);
  }
  
  if (!results.fetcherConnection) {
    Logger.log('❌ TEST 2 FAILED: Cannot connect to fetcher');
    Logger.log('⚠️ Check: 1) Fetcher URL correct, 2) Fetcher deployed, 3) API key if required');
  } else {
    Logger.log('✅ TEST 2 PASSED: Fetcher connection working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Fetcher Extraction (Parse HTML)
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('📝 TEST 3: Fetcher Extraction');
  Logger.log('─────────────────────────────────────────────────────────');
  
  if (results.fetcherConnection) {
    try {
      var extractResult = APIS_fetchAndExtract('extractHeadings', 'https://example.com');
      
      if (extractResult.ok) {
        Logger.log('✅ Extraction successful');
        Logger.log('   Headings found: ' + (extractResult.headings ? extractResult.headings.length : 0));
        results.fetcherExtraction = true;
      } else {
        Logger.log('❌ Extraction failed: ' + (extractResult.error || 'Unknown'));
      }
    } catch (e) {
      Logger.log('❌ Exception: ' + e);
    }
  } else {
    Logger.log('⏭️ SKIPPED: Fetcher connection failed');
  }
  
  if (!results.fetcherExtraction && results.fetcherConnection) {
    Logger.log('❌ TEST 3 FAILED: Fetcher can connect but extraction fails');
  } else if (results.fetcherExtraction) {
    Logger.log('✅ TEST 3 PASSED: Fetcher extraction working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: OpenPageRank API
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('📊 TEST 4: OpenPageRank API');
  Logger.log('─────────────────────────────────────────────────────────');
  
  try {
    var oprResult = OPENPAGERANK_fetch({ domain: 'example.com' });
    
    if (oprResult.ok) {
      Logger.log('✅ OpenPageRank successful');
      Logger.log('   Page Rank: ' + (oprResult.pageRank || 0));
      results.apiOpenPageRank = true;
    } else {
      Logger.log('❌ OpenPageRank failed: ' + (oprResult.error || 'Unknown'));
    }
  } catch (e) {
    Logger.log('❌ Exception: ' + e);
    Logger.log('⚠️ Function OPENPAGERANK_fetch may not be defined');
  }
  
  if (!results.apiOpenPageRank) {
    Logger.log('❌ TEST 4 FAILED: OpenPageRank not working');
    Logger.log('⚠️ Check: 1) openpagerank_api.gs deployed, 2) API key valid');
  } else {
    Logger.log('✅ TEST 4 PASSED: OpenPageRank working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 5: PageSpeed API
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('⚡ TEST 5: PageSpeed API');
  Logger.log('─────────────────────────────────────────────────────────');
  
  try {
    var psResult = PAGESPEED_analyze({ url: 'https://example.com' });
    
    if (psResult.ok) {
      Logger.log('✅ PageSpeed successful');
      Logger.log('   Performance Score: ' + (psResult.performanceScore || 0));
      results.apiPageSpeed = true;
    } else {
      Logger.log('❌ PageSpeed failed: ' + (psResult.error || 'Unknown'));
    }
  } catch (e) {
    Logger.log('❌ Exception: ' + e);
    Logger.log('⚠️ Function PAGESPEED_analyze may not be defined');
  }
  
  if (!results.apiPageSpeed) {
    Logger.log('❌ TEST 5 FAILED: PageSpeed not working');
    Logger.log('⚠️ Check: 1) pagespeed_api.gs deployed, 2) API key valid');
  } else {
    Logger.log('✅ TEST 5 PASSED: PageSpeed working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 6: Serper API
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('🔍 TEST 6: Serper API');
  Logger.log('─────────────────────────────────────────────────────────');
  
  try {
    var serperResult = SERPER_getDomainOverview({ domain: 'example.com' });
    
    if (serperResult.ok) {
      Logger.log('✅ Serper successful');
      results.apiSerper = true;
    } else {
      Logger.log('❌ Serper failed: ' + (serperResult.error || 'Unknown'));
    }
  } catch (e) {
    Logger.log('❌ Exception: ' + e);
    Logger.log('⚠️ Function SERPER_getDomainOverview may not be defined');
  }
  
  if (!results.apiSerper) {
    Logger.log('❌ TEST 6 FAILED: Serper not working');
    Logger.log('⚠️ Check: 1) serper_api.gs deployed, 2) API key valid');
  } else {
    Logger.log('✅ TEST 6 PASSED: Serper working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 7: Storage Layer
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('💾 TEST 7: Storage Layer');
  Logger.log('─────────────────────────────────────────────────────────');
  
  try {
    var testData = { test: 'diagnostic', timestamp: new Date().toISOString() };
    var saveResult = STORAGE_saveCompetitorJSON(
      'diagnostic-test.com',
      testData,
      {},
      {},
      'diagnostic-test',
      '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU'
    );
    
    if (saveResult.success) {
      Logger.log('✅ Storage save successful');
      Logger.log('   Row: ' + saveResult.rowNumber);
      results.storage = true;
    } else {
      Logger.log('❌ Storage save failed: ' + (saveResult.error || 'Unknown'));
    }
  } catch (e) {
    Logger.log('❌ Exception: ' + e);
  }
  
  if (!results.storage) {
    Logger.log('❌ TEST 7 FAILED: Storage not working');
    Logger.log('⚠️ Check: Spreadsheet ID correct and accessible');
  } else {
    Logger.log('✅ TEST 7 PASSED: Storage working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 8: Full Collection (Integration Test)
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('🎯 TEST 8: Full Collection (Integration)');
  Logger.log('─────────────────────────────────────────────────────────');
  
  if (results.fetcherExtraction && results.apiOpenPageRank && results.storage) {
    try {
      var collectionResult = COLLECTOR_gatherAllData('https://example.com', {
        projectId: 'diagnostic-test'
      });
      
      if (collectionResult && collectionResult.collectionSummary) {
        var completeness = collectionResult.collectionSummary.completeness;
        Logger.log('✅ Collection completed');
        Logger.log('   Fetcher: ' + collectionResult.collectionSummary.fetcherSuccessCount + '/7');
        Logger.log('   APIs: ' + collectionResult.collectionSummary.apiSuccessCount + '/4');
        Logger.log('   Completeness: ' + completeness + '%');
        
        results.fullCollection = completeness >= 50; // At least 50% for pass
      } else {
        Logger.log('❌ Collection returned invalid result');
      }
    } catch (e) {
      Logger.log('❌ Exception: ' + e);
    }
  } else {
    Logger.log('⏭️ SKIPPED: Prerequisites not met');
  }
  
  if (!results.fullCollection && results.fetcherExtraction) {
    Logger.log('❌ TEST 8 FAILED: Integration incomplete');
  } else if (results.fullCollection) {
    Logger.log('✅ TEST 8 PASSED: Full integration working');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSTIC SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var passCount = 0;
  var totalTests = 0;
  
  for (var key in results) {
    totalTests++;
    if (results[key]) passCount++;
    
    var emoji = results[key] ? '✅' : '❌';
    var testName = key.replace(/([A-Z])/g, ' $1').trim();
    Logger.log(emoji + ' ' + testName);
  }
  
  Logger.log('');
  Logger.log('Score: ' + passCount + '/' + totalTests + ' tests passed');
  
  if (passCount === totalTests) {
    Logger.log('🎉 ALL TESTS PASSED! System fully operational!');
  } else if (passCount >= totalTests * 0.7) {
    Logger.log('⚠️ MOSTLY WORKING: ' + (totalTests - passCount) + ' issues to fix');
  } else {
    Logger.log('❌ NEEDS ATTENTION: Multiple issues detected');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return results;
}

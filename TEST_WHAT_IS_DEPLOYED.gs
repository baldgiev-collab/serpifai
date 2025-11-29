/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNOSTIC: WHAT FILES ARE ACTUALLY DEPLOYED?
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Run this in your DataBridge Apps Script to see what's deployed.
 * This will tell you EXACTLY which functions exist and which are missing.
 */

function TEST_WhatIsDeployed() {
  Logger.log('🔍 DIAGNOSTIC: Checking what functions exist in Apps Script...\n');
  
  var results = {
    critical: [],
    missing: [],
    oldCode: [],
    correct: []
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Check for NEW remote functions (should exist)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 TEST 1: Checking for NEW remote architecture functions...');
  
  // Check APIS_fetchAndExtract (CRITICAL - this is the key function!)
  try {
    if (typeof APIS_fetchAndExtract === 'function') {
      results.correct.push('✅ APIS_fetchAndExtract EXISTS');
      Logger.log('  ✅ APIS_fetchAndExtract: Found');
    } else {
      results.missing.push('❌ APIS_fetchAndExtract MISSING');
      Logger.log('  ❌ APIS_fetchAndExtract: NOT FOUND');
    }
  } catch (e) {
    results.missing.push('❌ APIS_fetchAndExtract: Error - ' + e);
    Logger.log('  ❌ APIS_fetchAndExtract: ERROR - ' + e);
  }
  
  // Check APIS_fetcherCall
  try {
    if (typeof APIS_fetcherCall === 'function') {
      results.correct.push('✅ APIS_fetcherCall EXISTS');
      Logger.log('  ✅ APIS_fetcherCall: Found');
    } else {
      results.missing.push('❌ APIS_fetcherCall MISSING');
      Logger.log('  ❌ APIS_fetcherCall: NOT FOUND');
    }
  } catch (e) {
    results.missing.push('❌ APIS_fetcherCall: Error');
    Logger.log('  ❌ APIS_fetcherCall: ERROR');
  }
  
  // Check COLLECTOR_gatherAllData
  try {
    if (typeof COLLECTOR_gatherAllData === 'function') {
      results.correct.push('✅ COLLECTOR_gatherAllData EXISTS');
      Logger.log('  ✅ COLLECTOR_gatherAllData: Found');
    } else {
      results.missing.push('❌ COLLECTOR_gatherAllData MISSING');
      Logger.log('  ❌ COLLECTOR_gatherAllData: NOT FOUND');
    }
  } catch (e) {
    results.missing.push('❌ COLLECTOR_gatherAllData: Error');
    Logger.log('  ❌ COLLECTOR_gatherAllData: ERROR');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Check for OLD local functions (should NOT exist in DataBridge!)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n📋 TEST 2: Checking for OLD local functions (these should NOT exist)...');
  
  // These OLD functions should NOT be in DataBridge (they're in Fetcher remote!)
  var oldFunctions = [
    'FET_extractHeadings',
    'FET_extractMetadata', 
    'FET_extractOpenGraph',
    'FET_extractSchema',
    'FET_extractInternalLinks',
    'FET_competitorBenchmark'
  ];
  
  oldFunctions.forEach(function(funcName) {
    try {
      if (typeof this[funcName] === 'function') {
        results.oldCode.push('⚠️ ' + funcName + ' EXISTS (should not!)');
        Logger.log('  ⚠️ ' + funcName + ': FOUND (this is OLD CODE - should be removed!)');
      } else {
        results.correct.push('✅ ' + funcName + ' does not exist (good)');
        Logger.log('  ✅ ' + funcName + ': Not found (correct)');
      }
    } catch (e) {
      results.correct.push('✅ ' + funcName + ' does not exist');
      Logger.log('  ✅ ' + funcName + ': Not found (correct)');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Check API compatibility functions
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n📋 TEST 3: Checking API compatibility functions...');
  
  var apiFunctions = [
    'OPENPAGERANK_fetch',
    'PAGESPEED_analyze',
    'SERPER_getDomainOverview'
  ];
  
  apiFunctions.forEach(function(funcName) {
    try {
      if (typeof this[funcName] === 'function') {
        results.correct.push('✅ ' + funcName + ' EXISTS');
        Logger.log('  ✅ ' + funcName + ': Found');
      } else {
        results.missing.push('❌ ' + funcName + ' MISSING');
        Logger.log('  ❌ ' + funcName + ': NOT FOUND');
      }
    } catch (e) {
      results.missing.push('❌ ' + funcName + ': Error');
      Logger.log('  ❌ ' + funcName + ': ERROR');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: Check storage functions
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n📋 TEST 4: Checking storage functions...');
  
  try {
    if (typeof STORAGE_saveCompetitorJSON === 'function') {
      results.correct.push('✅ STORAGE_saveCompetitorJSON EXISTS');
      Logger.log('  ✅ STORAGE_saveCompetitorJSON: Found');
    } else {
      results.missing.push('❌ STORAGE_saveCompetitorJSON MISSING');
      Logger.log('  ❌ STORAGE_saveCompetitorJSON: NOT FOUND');
    }
  } catch (e) {
    results.missing.push('❌ Storage: Error');
    Logger.log('  ❌ Storage functions: ERROR');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n' + '═'.repeat(80));
  Logger.log('📊 DIAGNOSTIC RESULTS');
  Logger.log('═'.repeat(80));
  
  Logger.log('\n✅ CORRECT (' + results.correct.length + ' items):');
  results.correct.forEach(function(item) {
    Logger.log('  ' + item);
  });
  
  if (results.missing.length > 0) {
    Logger.log('\n❌ MISSING (' + results.missing.length + ' items):');
    results.missing.forEach(function(item) {
      Logger.log('  ' + item);
    });
  }
  
  if (results.oldCode.length > 0) {
    Logger.log('\n⚠️ OLD CODE FOUND (' + results.oldCode.length + ' items):');
    results.oldCode.forEach(function(item) {
      Logger.log('  ' + item);
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIAGNOSIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n' + '═'.repeat(80));
  Logger.log('🔬 DIAGNOSIS');
  Logger.log('═'.repeat(80));
  
  if (results.missing.length === 0 && results.oldCode.length === 0) {
    Logger.log('✅✅✅ PERFECT! All files deployed correctly!');
    Logger.log('You can now run TEST_ComprehensiveDiagnostic() safely.');
  } else {
    if (results.missing.includes('❌ APIS_fetchAndExtract MISSING')) {
      Logger.log('❌ CRITICAL: APIS_fetchAndExtract is missing!');
      Logger.log('   → You need to deploy fetcher_client.gs');
      Logger.log('   → File location: databridge/apis/fetcher_client.gs');
      Logger.log('   → This is the MOST CRITICAL function!');
    }
    
    if (results.missing.includes('❌ COLLECTOR_gatherAllData MISSING')) {
      Logger.log('❌ CRITICAL: COLLECTOR_gatherAllData is missing!');
      Logger.log('   → You need to deploy enhanced_data_collector.gs');
      Logger.log('   → File location: databridge/collectors/enhanced_data_collector.gs');
    }
    
    if (results.oldCode.length > 0) {
      Logger.log('⚠️ WARNING: Old FET_ functions found in Apps Script!');
      Logger.log('   → These should NOT exist in DataBridge project!');
      Logger.log('   → They belong in the Fetcher project only!');
      Logger.log('   → Problem: You have old files deployed (maybe from competitor_intelligence folder)');
      Logger.log('   → Solution: Delete these files from Apps Script sidebar:');
      results.oldCode.forEach(function(item) {
        Logger.log('      - Find file containing ' + item.substring(3).split(' ')[0]);
      });
    }
    
    if (results.missing.some(function(item) { return item.includes('OPENPAGERANK') || item.includes('PAGESPEED') || item.includes('SERPER'); })) {
      Logger.log('⚠️ WARNING: Some API compatibility functions missing!');
      Logger.log('   → Deploy these files:');
      Logger.log('      - databridge/apis/openpagerank_api.gs');
      Logger.log('      - databridge/apis/pagespeed_api.gs');
      Logger.log('      - databridge/apis/serper_api.gs');
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT CHECKLIST
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('\n' + '═'.repeat(80));
  Logger.log('📋 DEPLOYMENT CHECKLIST');
  Logger.log('═'.repeat(80));
  Logger.log('');
  Logger.log('Files that MUST be in DataBridge Apps Script:');
  Logger.log('');
  Logger.log('1. ✅ enhanced_data_collector.gs → databridge/collectors/');
  Logger.log('     Contains: COLLECTOR_gatherAllData(), TEST_endToEndCollection()');
  Logger.log('');
  Logger.log('2. ✅ fetcher_client.gs → databridge/apis/');
  Logger.log('     Contains: APIS_fetcherCall(), APIS_fetchAndExtract()');
  Logger.log('');
  Logger.log('3. ✅ openpagerank_api.gs → databridge/apis/');
  Logger.log('     Contains: APIS_openPageRankCall(), OPENPAGERANK_fetch()');
  Logger.log('');
  Logger.log('4. ✅ pagespeed_api.gs → databridge/apis/');
  Logger.log('     Contains: APIS_pageSpeedCall(), PAGESPEED_analyze()');
  Logger.log('');
  Logger.log('5. ✅ serper_api.gs → databridge/apis/');
  Logger.log('     Contains: APIS_serperCall(), SERPER_getDomainOverview()');
  Logger.log('');
  Logger.log('6. ✅ unified_competitor_storage.gs → databridge/storage/');
  Logger.log('     Contains: STORAGE_saveCompetitorJSON(), STORAGE_readCompetitorJSON()');
  Logger.log('');
  Logger.log('Files that should NOT be in DataBridge (they\'re in Fetcher!):');
  Logger.log('');
  Logger.log('❌ extract_headings.gs → Keep in Fetcher project only!');
  Logger.log('❌ extract_metadata.gs → Keep in Fetcher project only!');
  Logger.log('❌ extract_opengraph.gs → Keep in Fetcher project only!');
  Logger.log('❌ extract_schema.gs → Keep in Fetcher project only!');
  Logger.log('❌ competitor_benchmark.gs → Keep in Fetcher project only!');
  Logger.log('❌ Any file from databridge/competitor_intelligence/ → OLD, don\'t deploy!');
  Logger.log('');
  
  Logger.log('═'.repeat(80));
  Logger.log('✅ Diagnostic complete! Check messages above for issues.');
  Logger.log('═'.repeat(80));
}

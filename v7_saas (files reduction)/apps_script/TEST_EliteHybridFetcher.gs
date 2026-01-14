/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST_EliteHybridFetcher.gs - TESTING FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Test functions to verify Elite Hybrid Fetcher works correctly
 * Add these to your Apps Script project for testing
 * 
 * @version 7.0.0-elite-hybrid
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * SETUP: Set License Key for Testing
 * Run this FIRST before any tests!
 * 
 * Usage:
 *   TEST_setLicenseKey("your-license-key-here")
 * 
 * @param {string} key - Your SerpifAI license key
 */
function TEST_setLicenseKey(key) {
  const userProps = PropertiesService.getUserProperties();
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔑 SETTING LICENSE KEY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  if (!key) {
    Logger.log('❌ ERROR: License key is required!');
    Logger.log('');
    Logger.log('Usage:');
    Logger.log('  TEST_setLicenseKey("your-license-key-here")');
    Logger.log('');
    Logger.log('Example:');
    Logger.log('  TEST_setLicenseKey("abc123xyz789")');
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('');
    return false;
  }
  
  // Set both property names for compatibility
  userProps.setProperty('SERPIFAI_LICENSE_KEY', key);
  userProps.setProperty('serpifai_license_key', key);
  
  Logger.log('✅ License key saved successfully!');
  Logger.log('');
  Logger.log('Key preview: ' + key.substring(0, 8) + '...');
  Logger.log('');
  Logger.log('You can now run tests:');
  Logger.log('  - TEST_checkLicenseKey()    (verify it worked)');
  Logger.log('  - TEST_eliteFetcher()       (test single competitor)');
  Logger.log('  - TEST_multipleCompetitors() (test 2 competitors)');
  Logger.log('  - TEST_gatewayAPIs()        (test all 5 APIs)');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return true;
}

/**
 * SETUP: Check if License Key is Configured
 */
function TEST_checkLicenseKey() {
  const userProps = PropertiesService.getUserProperties();
  const key1 = userProps.getProperty('SERPIFAI_LICENSE_KEY');
  const key2 = userProps.getProperty('serpifai_license_key');
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔍 LICENSE KEY CHECK');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('SERPIFAI_LICENSE_KEY: ' + (key1 ? '✅ SET (' + key1.substring(0, 8) + '...)' : '❌ NOT SET'));
  Logger.log('serpifai_license_key: ' + (key2 ? '✅ SET (' + key2.substring(0, 8) + '...)' : '❌ NOT SET'));
  Logger.log('');
  
  if (!key1 && !key2) {
    Logger.log('❌ NO LICENSE KEY CONFIGURED');
    Logger.log('');
    Logger.log('Run this to set your key:');
    Logger.log('  TEST_setLicenseKey("your-key-here")');
    Logger.log('');
    Logger.log('Or run without arguments to be prompted:');
    Logger.log('  TEST_setLicenseKey()');
  } else {
    Logger.log('✅ LICENSE KEY IS CONFIGURED');
    Logger.log('');
    Logger.log('You can now run tests!');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return !!(key1 || key2);
}

/**
 * TEST 1: Single Competitor Elite Fetch
 * Run this first to verify elite fetcher works
 */
function TEST_eliteFetcher() {
  const testDomain = 'toptal.com';
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST: ELITE HYBRID FETCHER');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('Domain: ' + testDomain);
  Logger.log('Time: ' + new Date().toISOString());
  Logger.log('');
  
  // Check license key
  const licenseKey = getUserLicenseKey();
  if (!licenseKey) {
    Logger.log('');
    Logger.log('❌ ERROR: No license key configured!');
    Logger.log('');
    Logger.log('Please run one of these first:');
    Logger.log('  1. Open Settings UI and add your license key');
    Logger.log('  2. Run: SETUP_setLicenseKey("your-license-key-here")');
    Logger.log('  3. Or run: TEST_setTestLicenseKey() with your key');
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════════');
    return { success: false, error: 'No license key' };
  }
  
  Logger.log('✅ License key found');
  Logger.log('');
  
  const startTime = Date.now();
  const result = FT_fetchEliteCompetitorData(testDomain, {});
  const duration = Date.now() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🏆 TEST RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('Overall Success: ' + result.success);
  Logger.log('Success Rate: ' + result.successRate);
  Logger.log('Execution Time: ' + duration + 'ms');
  Logger.log('');
  
  // Stage breakdown
  Logger.log('STAGE RESULTS:');
  Logger.log('───────────────────────────────────────────────────────────────');
  
  const stages = ['phpFetcher', 'customSearch', 'pageSpeed', 'serper', 'openPageRank'];
  stages.forEach(stageName => {
    const stage = result.stages[stageName];
    if (stage) {
      const icon = stage.success ? '✅' : '❌';
      const status = stage.success ? 'SUCCESS' : stage.error || 'FAILED';
      Logger.log(`  ${icon} ${stageName.padEnd(20)} ${status}`);
    } else {
      Logger.log(`  ⚠️  ${stageName.padEnd(20)} NOT EXECUTED`);
    }
  });
  
  Logger.log('');
  Logger.log('SYNTHESIZED DATA:');
  Logger.log('───────────────────────────────────────────────────────────────');
  
  if (result.combinedData) {
    const data = result.combinedData;
    
    // Website data
    if (data.website) {
      Logger.log('  📄 Website:');
      Logger.log('     Title: ' + (data.website.title || 'N/A'));
      Logger.log('     Description: ' + ((data.website.description || 'N/A').substring(0, 80) + '...'));
      Logger.log('     Word Count: ' + (data.website.wordCount || 0));
      Logger.log('     Has Schema: ' + (data.website.hasOrganizationSchema ? 'YES' : 'NO'));
    }
    
    // Content data
    if (data.content) {
      Logger.log('  📝 Content:');
      Logger.log('     Full HTML: ' + (data.content.fullHtml ? 'YES' : 'NO'));
      Logger.log('     Links: ' + ((data.content.links || []).length));
      Logger.log('     Images: ' + ((data.content.images || []).length));
      Logger.log('     Top Pages: ' + ((data.content.topPages || []).length));
    }
    
    // Technical metrics
    if (data.technical) {
      Logger.log('  ⚡ Technical:');
      Logger.log('     Performance: ' + (data.technical.performanceScore || 0) + '/100');
      Logger.log('     Accessibility: ' + (data.technical.accessibilityScore || 0) + '/100');
      Logger.log('     SEO: ' + (data.technical.seoScore || 0) + '/100');
      Logger.log('     Best Practices: ' + (data.technical.bestPracticesScore || 0) + '/100');
    }
    
    // Authority metrics
    if (data.authority) {
      Logger.log('  🏆 Authority:');
      Logger.log('     Domain Rank: ' + (data.authority.domainRank || 0));
      Logger.log('     PageRank: ' + (data.authority.pageRank || 0));
      Logger.log('     Backlinks: ' + (data.authority.backlinks || 0).toLocaleString());
      Logger.log('     Referring Domains: ' + (data.authority.referringDomains || 0).toLocaleString());
    }
    
    // SEO metrics
    if (data.seo) {
      Logger.log('  🔍 SEO:');
      Logger.log('     Indexed Pages: ' + (data.seo.indexedPages || 0).toLocaleString());
      Logger.log('     Top Ranking Pages: ' + ((data.seo.topRankingPages || []).length));
      Logger.log('     SERP Features: ' + ((data.seo.serpFeatures || []).length));
    }
  } else {
    Logger.log('  ⚠️  No synthesized data available');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  if (result.success) {
    const successCount = Object.values(result.stages).filter(s => s.success).length;
    if (successCount === 5) {
      Logger.log('✅ TEST PASSED: ELITE quality (5/5 stages)');
    } else if (successCount >= 3) {
      Logger.log('✅ TEST PASSED: GOOD quality (' + successCount + '/5 stages)');
    } else {
      Logger.log('⚠️  TEST WARNING: LOW quality (' + successCount + '/5 stages)');
    }
  } else {
    Logger.log('❌ TEST FAILED: All stages failed');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return result;
}

/**
 * TEST 2: Multiple Competitors (Quick Test)
 * Tests 2 competitors to verify differentiation
 */
function TEST_multipleCompetitors() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST: MULTIPLE COMPETITORS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('Competitors: toptal.com, globant.com');
  Logger.log('');
  
  const config = {
    competitors: ['toptal.com', 'globant.com'],
    projectContext: {
      projectName: 'Elite Fetcher Test',
      targetAudience: 'Test',
      goals: ['Verify competitor differentiation']
    },
    yourDomain: 'test.com'
  };
  
  const startTime = Date.now();
  const result = DB_COMP_executeEliteAnalysis(config);
  const duration = Date.now() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🏆 TEST RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('Overall Success: ' + result.success);
  Logger.log('Execution Time: ' + duration + 'ms');
  Logger.log('');
  
  if (result.success && result.competitorData) {
    Logger.log('COMPETITOR COMPARISON:');
    Logger.log('───────────────────────────────────────────────────────────────');
    
    const competitors = Object.keys(result.competitorData);
    
    // Create comparison table
    const metrics = ['Authority', 'Indexed Pages', 'Performance', 'PageRank'];
    
    competitors.forEach(domain => {
      const comp = result.competitorData[domain];
      Logger.log('');
      Logger.log('  ' + domain.toUpperCase());
      Logger.log('  ' + '─'.repeat(domain.length));
      Logger.log('  Success: ' + (comp.fetchSuccess ? '✅' : '❌'));
      Logger.log('  Success Rate: ' + (comp.successRate || 'N/A'));
      
      if (comp.synthesized) {
        Logger.log('  Authority: ' + (comp.synthesized.authority?.domainRank || 'N/A'));
        Logger.log('  Indexed Pages: ' + (comp.synthesized.seo?.indexedPages || 'N/A'));
        Logger.log('  Performance: ' + (comp.synthesized.technical?.performanceScore || 'N/A') + '/100');
        Logger.log('  PageRank: ' + (comp.synthesized.authority?.pageRank || 'N/A'));
      } else {
        Logger.log('  ⚠️  No data available');
      }
    });
    
    Logger.log('');
    Logger.log('DIFFERENTIATION CHECK:');
    Logger.log('───────────────────────────────────────────────────────────────');
    
    // Check if values are different
    if (competitors.length >= 2) {
      const comp1 = result.competitorData[competitors[0]];
      const comp2 = result.competitorData[competitors[1]];
      
      const auth1 = comp1.synthesized?.authority?.domainRank || 0;
      const auth2 = comp2.synthesized?.authority?.domainRank || 0;
      
      const pages1 = comp1.synthesized?.seo?.indexedPages || 0;
      const pages2 = comp2.synthesized?.seo?.indexedPages || 0;
      
      const perf1 = comp1.synthesized?.technical?.performanceScore || 0;
      const perf2 = comp2.synthesized?.technical?.performanceScore || 0;
      
      if (auth1 !== auth2) {
        Logger.log('  ✅ Authority values are DIFFERENT (' + auth1 + ' vs ' + auth2 + ')');
      } else {
        Logger.log('  ❌ Authority values are SAME (' + auth1 + ')');
      }
      
      if (pages1 !== pages2) {
        Logger.log('  ✅ Indexed Pages are DIFFERENT (' + pages1 + ' vs ' + pages2 + ')');
      } else {
        Logger.log('  ❌ Indexed Pages are SAME (' + pages1 + ')');
      }
      
      if (perf1 !== perf2) {
        Logger.log('  ✅ Performance scores are DIFFERENT (' + perf1 + ' vs ' + perf2 + ')');
      } else {
        Logger.log('  ❌ Performance scores are SAME (' + perf1 + ')');
      }
    }
    
    Logger.log('');
    
    // Check for old sample data pattern
    const hasSampleData = competitors.some(domain => {
      const comp = result.competitorData[domain];
      const auth = comp.synthesized?.authority?.domainRank || 0;
      const pages = comp.synthesized?.seo?.indexedPages || 0;
      return auth === 45 && pages === 343700; // Old sample values
    });
    
    if (hasSampleData) {
      Logger.log('  ❌ WARNING: Detected old sample data pattern (Authority: 45, Pages: 343700)');
    } else {
      Logger.log('  ✅ No sample data detected - using real API data');
    }
    
  } else {
    Logger.log('❌ Analysis failed: ' + (result.error || 'Unknown error'));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  if (result.success) {
    Logger.log('✅ TEST PASSED: Multiple competitors analyzed successfully');
  } else {
    Logger.log('❌ TEST FAILED: Analysis did not complete');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return result;
}

/**
 * TEST 3: API Gateway Connectivity
 * Verifies each API endpoint is accessible
 */
function TEST_gatewayAPIs() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST: API GATEWAY CONNECTIVITY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const testDomain = 'toptal.com';
  const testUrl = 'https://toptal.com';
  
  const tests = [
    {
      name: 'PHP Fetcher',
      action: 'fetch:single',
      payload: { url: testUrl, options: { extractMetadata: true } }
    },
    {
      name: 'Custom Search',
      action: 'google_search',
      payload: { query: 'site:' + testDomain, params: { num: 5 } }
    },
    {
      name: 'PageSpeed',
      action: 'pagespeed_check',
      payload: { url: testUrl, strategy: 'mobile' }
    },
    {
      name: 'Serper',
      action: 'serper_search',
      payload: { query: 'site:' + testDomain }
    },
    {
      name: 'OpenPageRank',
      action: 'openpagerank_check',
      payload: { domain: testDomain }
    }
  ];
  
  const results = [];
  
  tests.forEach((test, index) => {
    Logger.log('[' + (index + 1) + '/' + tests.length + '] Testing: ' + test.name);
    
    try {
      const result = callGateway(test.action, test.payload);
      
      if (result && result.success) {
        Logger.log('  ✅ ' + test.name + ': SUCCESS');
        results.push({ name: test.name, success: true });
      } else {
        Logger.log('  ❌ ' + test.name + ': FAILED (' + (result.error || 'Unknown error') + ')');
        results.push({ name: test.name, success: false, error: result.error });
      }
    } catch (error) {
      Logger.log('  ❌ ' + test.name + ': EXCEPTION (' + error.toString() + ')');
      results.push({ name: test.name, success: false, error: error.toString() });
    }
    
    Utilities.sleep(500); // Rate limiting
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🏆 GATEWAY TEST RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  Logger.log('Success Rate: ' + successCount + '/' + totalCount);
  Logger.log('');
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'WORKING' : 'FAILED';
    Logger.log('  ' + icon + ' ' + result.name.padEnd(20) + status);
    if (result.error) {
      Logger.log('     Error: ' + result.error);
    }
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  if (successCount === totalCount) {
    Logger.log('✅ ALL TESTS PASSED: All APIs working correctly');
  } else if (successCount >= totalCount * 0.6) {
    Logger.log('⚠️  PARTIAL SUCCESS: ' + successCount + '/' + totalCount + ' APIs working');
  } else {
    Logger.log('❌ TESTS FAILED: Most APIs not accessible');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return results;
}

/**
 * TEST 4: Run All Tests
 * Runs all test functions in sequence
 */
function TEST_runAll() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🧪 RUNNING ALL TESTS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const results = {
    gateway: null,
    singleCompetitor: null,
    multipleCompetitors: null
  };
  
  // Test 1: Gateway connectivity
  try {
    Logger.log('TEST 1/3: Gateway API Connectivity');
    results.gateway = TEST_gatewayAPIs();
    Logger.log('✅ Gateway test complete');
  } catch (e) {
    Logger.log('❌ Gateway test failed: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('Waiting 5 seconds before next test...');
  Utilities.sleep(5000);
  Logger.log('');
  
  // Test 2: Single competitor
  try {
    Logger.log('TEST 2/3: Single Competitor Fetch');
    results.singleCompetitor = TEST_eliteFetcher();
    Logger.log('✅ Single competitor test complete');
  } catch (e) {
    Logger.log('❌ Single competitor test failed: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('Waiting 5 seconds before next test...');
  Utilities.sleep(5000);
  Logger.log('');
  
  // Test 3: Multiple competitors
  try {
    Logger.log('TEST 3/3: Multiple Competitors');
    results.multipleCompetitors = TEST_multipleCompetitors();
    Logger.log('✅ Multiple competitors test complete');
  } catch (e) {
    Logger.log('❌ Multiple competitors test failed: ' + e.toString());
  }
  
  // Final summary
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🏆 FINAL TEST SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const gatewaySuccess = results.gateway && results.gateway.filter(r => r.success).length >= 3;
  const singleSuccess = results.singleCompetitor && results.singleCompetitor.success;
  const multiSuccess = results.multipleCompetitors && results.multipleCompetitors.success;
  
  Logger.log('Gateway APIs: ' + (gatewaySuccess ? '✅ PASS' : '❌ FAIL'));
  Logger.log('Single Competitor: ' + (singleSuccess ? '✅ PASS' : '❌ FAIL'));
  Logger.log('Multiple Competitors: ' + (multiSuccess ? '✅ PASS' : '❌ FAIL'));
  Logger.log('');
  
  if (gatewaySuccess && singleSuccess && multiSuccess) {
    Logger.log('🎉 ALL TESTS PASSED! Elite Hybrid Fetcher is working correctly.');
  } else {
    Logger.log('⚠️  SOME TESTS FAILED. Check logs above for details.');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  return results;
}

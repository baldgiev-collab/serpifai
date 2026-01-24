/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DIAG_ZeroResultTests.gs - AUTOMATED ZERO RESULT DETECTION TESTS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Test suite that runs competitor analysis and fails if any metric shows 0/empty
 * when it shouldn't. Validates that fallback systems are working correctly.
 * 
 * @author SerpifAI Engineering
 * @version 1.0.0
 * @implements TODO #17: Create Automated Zero-Result Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const ZERO_TEST_CONFIG = {
  // Domains to test (mix of well-known and obscure to test fallbacks)
  TEST_DOMAINS: [
    'hubspot.com',       // Major brand - should have real data
    'semrush.com',       // SEO tool - should have real data
    'example-test-12345.io' // Fake domain - should trigger fallbacks
  ],
  
  // Fields that must NEVER be 0/empty after processing
  REQUIRED_FIELDS: [
    { path: 'synthesized.website.title', name: 'Title', minLength: 1 },
    { path: 'synthesized.website.description', name: 'Description', minLength: 1 },
    { path: 'synthesized.website.wordCount', name: 'Word Count', minValue: 50 },
    { path: 'synthesized.oracleKeywords', name: 'Keywords', minLength: 1, isArray: true },
    { path: 'synthesized.topPages', name: 'Top Pages', minLength: 0, isArray: true }, // Can be 0
    { path: 'synthesized.eliteTraffic.organicTraffic', name: 'Organic Traffic', minValue: 1 },
    { path: 'synthesized.authority.domainRank', name: 'Domain Rank', minValue: 1 },
    { path: 'synthesized.seo.organic', name: 'Organic Results', minLength: 1, isArray: true }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run complete zero-result detection test suite
 * @returns {Object} Test results with pass/fail status
 */
function DIAG_runZeroResultTests() {
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`🧪 ZERO RESULT DETECTION TEST SUITE`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`📅 Started: ${new Date().toISOString()}`);
  Logger.log(``);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
    startTime: Date.now()
  };
  
  // Test each domain
  ZERO_TEST_CONFIG.TEST_DOMAINS.forEach((domain, idx) => {
    Logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    Logger.log(`[${idx + 1}/${ZERO_TEST_CONFIG.TEST_DOMAINS.length}] Testing: ${domain}`);
    Logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      const testResult = _testDomainForZeroResults(domain);
      results.tests.push(testResult);
      
      if (testResult.passed) {
        results.passed++;
        Logger.log(`   ✅ PASSED: All required fields have values`);
      } else {
        results.failed++;
        Logger.log(`   ❌ FAILED: ${testResult.failures.length} zero-result issues found`);
        testResult.failures.forEach(f => {
          Logger.log(`      - ${f.field}: ${f.reason}`);
        });
      }
    } catch (e) {
      results.failed++;
      results.tests.push({
        domain: domain,
        passed: false,
        error: e.toString(),
        failures: [{ field: 'execution', reason: e.toString() }]
      });
      Logger.log(`   ❌ ERROR: ${e.toString()}`);
    }
    
    Logger.log(``);
  });
  
  // Summary
  const elapsed = Date.now() - results.startTime;
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`📊 TEST SUMMARY`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`   ✅ Passed: ${results.passed}/${results.tests.length}`);
  Logger.log(`   ❌ Failed: ${results.failed}/${results.tests.length}`);
  Logger.log(`   ⏱️ Duration: ${elapsed}ms`);
  Logger.log(`   📅 Completed: ${new Date().toISOString()}`);
  
  if (results.failed > 0) {
    Logger.log(``);
    Logger.log(`🚨 FAILURES DETECTED - Review fallback systems!`);
    results.tests.filter(t => !t.passed).forEach(t => {
      Logger.log(`   ${t.domain}: ${t.failures.map(f => f.field).join(', ')}`);
    });
  }
  
  return results;
}

/**
 * Test a single domain for zero results
 */
function _testDomainForZeroResults(domain) {
  const result = {
    domain: domain,
    passed: true,
    failures: [],
    fieldResults: []
  };
  
  // Fetch competitor data
  let compData;
  if (typeof FT_fetchEliteCompetitorData === 'function') {
    compData = FT_fetchEliteCompetitorData(domain, { skipCircuitBreaker: true });
  } else {
    result.passed = false;
    result.failures.push({ field: 'fetcher', reason: 'FT_fetchEliteCompetitorData not available' });
    return result;
  }
  
  if (!compData || !compData.success) {
    result.passed = false;
    result.failures.push({ field: 'fetch', reason: compData?.error || 'Fetch failed' });
    return result;
  }
  
  // Check each required field
  ZERO_TEST_CONFIG.REQUIRED_FIELDS.forEach(fieldDef => {
    const value = _getNestedValue(compData, fieldDef.path);
    const fieldResult = {
      field: fieldDef.name,
      path: fieldDef.path,
      value: value,
      passed: true
    };
    
    // Check based on field type
    if (fieldDef.isArray) {
      if (!value || !Array.isArray(value) || value.length < fieldDef.minLength) {
        fieldResult.passed = false;
        fieldResult.reason = `Array empty or below minimum (${fieldDef.minLength})`;
        result.failures.push({ field: fieldDef.name, reason: fieldResult.reason });
      }
    } else if (fieldDef.minValue !== undefined) {
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      if (numValue < fieldDef.minValue) {
        fieldResult.passed = false;
        fieldResult.reason = `Value ${numValue} below minimum (${fieldDef.minValue})`;
        result.failures.push({ field: fieldDef.name, reason: fieldResult.reason });
      }
    } else if (fieldDef.minLength !== undefined) {
      const strValue = value ? String(value) : '';
      if (strValue.length < fieldDef.minLength) {
        fieldResult.passed = false;
        fieldResult.reason = `String too short (min ${fieldDef.minLength})`;
        result.failures.push({ field: fieldDef.name, reason: fieldResult.reason });
      }
    }
    
    result.fieldResults.push(fieldResult);
  });
  
  result.passed = result.failures.length === 0;
  return result;
}

/**
 * Get nested value from object using dot notation path
 */
function _getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL FIELD TESTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quick test - just check if fallback functions exist and work
 */
function DIAG_testFallbackFunctions() {
  Logger.log(`🧪 Testing Fallback Functions...`);
  Logger.log(``);
  
  const tests = [];
  
  // Test 1: FT_RealMetrics fallbacks
  if (typeof _generateFallbackKeywordMetrics === 'function') {
    const kwFallback = _generateFallbackKeywordMetrics('test.com', ['test keyword'], 'test error');
    tests.push({
      name: 'Keyword Metrics Fallback',
      passed: kwFallback && kwFallback.success && kwFallback.keywords && kwFallback.keywords.length > 0
    });
  }
  
  if (typeof _generateFallbackBacklinkData === 'function') {
    const blFallback = _generateFallbackBacklinkData('test.com', 'test error');
    tests.push({
      name: 'Backlink Data Fallback',
      passed: blFallback && blFallback.success && blFallback.refDomains > 0
    });
  }
  
  if (typeof _generateFallbackTrafficData === 'function') {
    const trFallback = _generateFallbackTrafficData('test.com', ['test'], 'test error');
    tests.push({
      name: 'Traffic Data Fallback',
      passed: trFallback && trFallback.success && trFallback.organic > 0
    });
  }
  
  // Test 2: FT_EliteCompetitorFetcher fallbacks
  if (typeof _generateForensicSerperResults === 'function') {
    const serperFallback = _generateForensicSerperResults('site:test.com', 'test error');
    tests.push({
      name: 'Serper Forensic Fallback',
      passed: serperFallback && serperFallback.success && serperFallback.data?.organic?.length > 0
    });
  }
  
  if (typeof _generateForensicPageRank === 'function') {
    const oprFallback = _generateForensicPageRank('test.com', 'test error');
    tests.push({
      name: 'PageRank Forensic Fallback',
      passed: oprFallback && oprFallback.success && oprFallback.data?.page_rank_integer > 0
    });
  }
  
  if (typeof _generateForensicPageSpeedEstimate === 'function') {
    const psFallback = _generateForensicPageSpeedEstimate('https://test.com', 'test error');
    tests.push({
      name: 'PageSpeed Forensic Fallback',
      passed: psFallback && psFallback.success && psFallback.data?.scores?.performance > 0
    });
  }
  
  // Test 3: Data Quality Validator
  if (typeof DQ_ValidateAndFix === 'function') {
    const dqResult = DQ_ValidateAndFix({ synthesized: { website: {}, seo: {} } }, 'test.com');
    tests.push({
      name: 'Data Quality Validator',
      passed: dqResult && dqResult.quality && dqResult.quality.fallbacksApplied > 0
    });
  }
  
  // Report
  const passed = tests.filter(t => t.passed).length;
  tests.forEach(t => {
    Logger.log(`   ${t.passed ? '✅' : '❌'} ${t.name}`);
  });
  
  Logger.log(``);
  Logger.log(`📊 Result: ${passed}/${tests.length} fallback functions working`);
  
  return { passed: passed, total: tests.length, tests: tests };
}

/**
 * Test API wrappers for proper fallback behavior
 */
function DIAG_testAPIFallbacks() {
  Logger.log(`🧪 Testing API Fallback Behavior...`);
  Logger.log(`   (This may take 30-60 seconds)`);
  Logger.log(``);
  
  const tests = [];
  
  // Test with likely-to-fail domain
  const fakeDomain = 'definitely-not-a-real-domain-xyz123.fake';
  
  // Test Serper
  if (typeof FT_callSerperAPI === 'function') {
    const result = FT_callSerperAPI(`site:${fakeDomain}`);
    tests.push({
      name: 'Serper API → Fallback',
      passed: result && result.success && result.data?.organic?.length > 0,
      estimated: result.estimated || false
    });
  }
  
  // Test OpenPageRank
  if (typeof FT_callOpenPageRankAPI === 'function') {
    const result = FT_callOpenPageRankAPI(fakeDomain);
    tests.push({
      name: 'OpenPageRank API → Fallback',
      passed: result && result.success && result.data?.page_rank_integer > 0,
      estimated: result.estimated || false
    });
  }
  
  // Test PageSpeed
  if (typeof FT_callPageSpeedAPI === 'function') {
    const result = FT_callPageSpeedAPI(`https://${fakeDomain}`);
    tests.push({
      name: 'PageSpeed API → Fallback',
      passed: result && result.success && result.data?.scores?.performance > 0,
      estimated: result.estimated || false
    });
  }
  
  // Report
  const passed = tests.filter(t => t.passed).length;
  tests.forEach(t => {
    Logger.log(`   ${t.passed ? '✅' : '❌'} ${t.name} ${t.estimated ? '(fallback used)' : ''}`);
  });
  
  Logger.log(``);
  Logger.log(`📊 Result: ${passed}/${tests.length} APIs have working fallbacks`);
  
  return { passed: passed, total: tests.length, tests: tests };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  globalThis.DIAG_runZeroResultTests = DIAG_runZeroResultTests;
  globalThis.DIAG_testFallbackFunctions = DIAG_testFallbackFunctions;
  globalThis.DIAG_testAPIFallbacks = DIAG_testAPIFallbacks;
}

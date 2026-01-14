/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNOSTIC_COMPETITOR_ANALYSIS.gs
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * COMPREHENSIVE DIAGNOSTIC TEST SUITE FOR COMPETITOR ANALYSIS
 * 
 * Tests & Measures:
 * ✓ Authorization workflow timing
 * ✓ Data fetching from FT_fullSnapshot
 * ✓ API enrichment (Serper, PageSpeed, OpenPageRank)
 * ✓ Data structure validation (object vs array)
 * ✓ Gemini prompt construction
 * ✓ Data sent to Gemini (detect sample/fake data)
 * ✓ Loading state visibility
 * ✓ Response transformation
 * ✓ Total workflow timing
 * 
 * HOW TO RUN:
 * 1. Open Apps Script Editor
 * 2. Select function: DIAG_testFullCompetitorWorkflow
 * 3. Click Run
 * 4. Check Execution Log for detailed results
 * 
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DIAG_CONFIG = {
  // Test competitors (use real domains)
  TEST_COMPETITORS: [
    'toptal.com',
    'globant.com',
    'turing.com'
  ],
  
  // Test project context
  TEST_PROJECT: {
    brandName: 'Test Company',
    industry: 'Software Development',
    targetAudience: 'Enterprise clients'
  },
  
  // Timing thresholds (milliseconds)
  THRESHOLDS: {
    maxAuthTime: 5000,        // Authorization should complete in 5s
    maxFetchPerCompetitor: 10000, // Each fetch should be < 10s
    maxAPICallTime: 3000,     // Each API call < 3s
    maxGeminiTime: 30000,     // Gemini analysis < 30s
    maxTotalTime: 120000      // Total workflow < 2 minutes
  },
  
  // Data validation rules
  VALIDATION: {
    minWordCount: 100,        // Minimum words to not be "sample"
    minMetrics: 5,            // Minimum metrics per competitor
    requiredFields: ['domain', 'fetchSuccess', 'snapshot', 'apiData']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DIAGNOSTIC FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testFullCompetitorWorkflow() {
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    testDuration: 0,
    stages: {},
    errors: [],
    warnings: [],
    dataQuality: {},
    recommendations: []
  };
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('🔬 COMPETITOR ANALYSIS DIAGNOSTIC TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('Started: ' + new Date().toLocaleString());
  Logger.log('Test Competitors: ' + DIAG_CONFIG.TEST_COMPETITORS.join(', '));
  Logger.log('');
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 1: AUTHORIZATION TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 1: AUTHORIZATION TEST');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const authResult = DIAG_testAuthorization();
    results.stages.authorization = authResult;
    
    if (!authResult.success) {
      results.errors.push({
        stage: 'authorization',
        error: authResult.error,
        recommendation: 'Check PHP gateway connection and license key'
      });
      Logger.log('❌ Authorization failed - cannot proceed with full test');
      Logger.log('   Error: ' + authResult.error);
      
      // Continue with mock authorization for diagnostic purposes
      Logger.log('⚠️ Continuing with MOCK authorization for diagnostic...');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 2: DATA FETCHING TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 2: DATA FETCHING TEST (FT_fullSnapshot)');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const fetchResult = DIAG_testDataFetching(DIAG_CONFIG.TEST_COMPETITORS);
    results.stages.fetching = fetchResult;
    
    if (fetchResult.errors.length > 0) {
      fetchResult.errors.forEach(err => results.errors.push(err));
    }
    
    if (fetchResult.warnings.length > 0) {
      fetchResult.warnings.forEach(warn => results.warnings.push(warn));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 3: API ENRICHMENT TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 3: API ENRICHMENT TEST');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const apiResult = DIAG_testAPIEnrichment(fetchResult.competitorData);
    results.stages.apiEnrichment = apiResult;
    
    if (apiResult.errors.length > 0) {
      apiResult.errors.forEach(err => results.errors.push(err));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 4: DATA STRUCTURE VALIDATION
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 4: DATA STRUCTURE VALIDATION');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const structureResult = DIAG_validateDataStructure(apiResult.enrichedData);
    results.stages.dataStructure = structureResult;
    
    if (structureResult.errors.length > 0) {
      structureResult.errors.forEach(err => results.errors.push(err));
    }
    
    if (structureResult.warnings.length > 0) {
      structureResult.warnings.forEach(warn => results.warnings.push(warn));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 5: SAMPLE DATA DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 5: SAMPLE/FAKE DATA DETECTION');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sampleResult = DIAG_detectSampleData(apiResult.enrichedData);
    results.dataQuality = sampleResult;
    
    if (sampleResult.hasSampleData) {
      results.warnings.push({
        stage: 'data_quality',
        warning: 'Sample/repeating data detected',
        details: sampleResult.sampleDataFound,
        recommendation: 'Check data fetching logic and API responses'
      });
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 6: GEMINI PROMPT TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 6: GEMINI PROMPT CONSTRUCTION TEST');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const promptResult = DIAG_testGeminiPrompt(apiResult.enrichedData);
    results.stages.geminiPrompt = promptResult;
    
    if (promptResult.warnings.length > 0) {
      promptResult.warnings.forEach(warn => results.warnings.push(warn));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 7: GEMINI API CALL TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 7: GEMINI API CALL TEST');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const geminiResult = DIAG_testGeminiCall(promptResult.prompt);
    results.stages.gemini = geminiResult;
    
    if (!geminiResult.success) {
      results.errors.push({
        stage: 'gemini',
        error: geminiResult.error,
        recommendation: 'Check Gemini API key and quota'
      });
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 8: RESPONSE TRANSFORMATION TEST
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log('');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('STAGE 8: RESPONSE TRANSFORMATION TEST');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const transformResult = DIAG_testResponseTransformation(apiResult.enrichedData);
    results.stages.transformation = transformResult;
    
    if (transformResult.errors.length > 0) {
      transformResult.errors.forEach(err => results.errors.push(err));
    }
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ CRITICAL ERROR IN DIAGNOSTIC TEST');
    Logger.log('   ' + error.toString());
    results.errors.push({
      stage: 'critical',
      error: error.toString(),
      stack: error.stack
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════════════
  results.testDuration = Date.now() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSTIC TEST RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('Total Duration: ' + (results.testDuration / 1000).toFixed(2) + 's');
  Logger.log('Errors: ' + results.errors.length);
  Logger.log('Warnings: ' + results.warnings.length);
  Logger.log('');
  
  if (results.errors.length > 0) {
    Logger.log('🔴 ERRORS FOUND:');
    results.errors.forEach((err, idx) => {
      Logger.log(`   ${idx + 1}. [${err.stage}] ${err.error}`);
      if (err.recommendation) {
        Logger.log(`      → ${err.recommendation}`);
      }
    });
    Logger.log('');
  }
  
  if (results.warnings.length > 0) {
    Logger.log('⚠️  WARNINGS:');
    results.warnings.forEach((warn, idx) => {
      Logger.log(`   ${idx + 1}. [${warn.stage}] ${warn.warning}`);
      if (warn.recommendation) {
        Logger.log(`      → ${warn.recommendation}`);
      }
    });
    Logger.log('');
  }
  
  // Generate recommendations
  DIAG_generateRecommendations(results);
  
  if (results.recommendations.length > 0) {
    Logger.log('💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, idx) => {
      Logger.log(`   ${idx + 1}. ${rec}`);
    });
    Logger.log('');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('Completed: ' + new Date().toLocaleString());
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 1: AUTHORIZATION TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testAuthorization() {
  const startTime = Date.now();
  const result = {
    success: false,
    duration: 0,
    transactionId: null,
    creditCost: 0,
    error: null
  };
  
  Logger.log('🔐 Testing authorization workflow...');
  
  try {
    const config = {
      competitors: DIAG_CONFIG.TEST_COMPETITORS,
      projectContext: DIAG_CONFIG.TEST_PROJECT
    };
    
    Logger.log('   Calling: callGateway("comp:orchestrate", config)');
    const authResponse = callGateway('comp:orchestrate', config);
    
    result.duration = Date.now() - startTime;
    Logger.log(`   Duration: ${result.duration}ms`);
    
    if (authResponse && authResponse.success) {
      result.success = true;
      result.transactionId = authResponse.transactionId;
      result.creditCost = authResponse.creditCost;
      Logger.log('   ✅ Authorization successful');
      Logger.log(`   Transaction ID: ${result.transactionId}`);
      Logger.log(`   Credit Cost: ${result.creditCost}`);
    } else {
      result.error = authResponse ? authResponse.error : 'No response from gateway';
      Logger.log('   ❌ Authorization failed');
      Logger.log(`   Error: ${result.error}`);
    }
    
    // Check timing threshold
    if (result.duration > DIAG_CONFIG.THRESHOLDS.maxAuthTime) {
      Logger.log(`   ⚠️  WARNING: Authorization took ${result.duration}ms (threshold: ${DIAG_CONFIG.THRESHOLDS.maxAuthTime}ms)`);
    }
    
  } catch (error) {
    result.duration = Date.now() - startTime;
    result.error = error.toString();
    Logger.log('   ❌ Exception: ' + error.toString());
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 2: DATA FETCHING TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testDataFetching(competitors) {
  const result = {
    success: true,
    competitorData: {},
    timings: {},
    totalDuration: 0,
    errors: [],
    warnings: []
  };
  
  const startTime = Date.now();
  
  // Handle null/undefined competitors
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    Logger.log('⚠️ No competitors provided for fetching test');
    Logger.log('   Using default test competitors...');
    competitors = DIAG_CONFIG.TEST_COMPETITORS;
  }
  
  Logger.log(`📡 Testing data fetching for ${competitors.length} competitors...`);
  
  competitors.forEach((domain, index) => {
    Logger.log(`   [${index + 1}/${competitors.length}] Fetching: ${domain}`);
    const fetchStart = Date.now();
    
    try {
      // Add https:// protocol if missing
      const fullUrl = domain.startsWith('http') ? domain : 'https://' + domain;
      
      Logger.log(`      Fetching with FT_fullSnapshot...`);
      
      // Use ULTRA-AGGRESSIVE anti-bot options
      const snapshot = FT_fullSnapshot(fullUrl, {
        extractMetadata: true,
        extractSchema: true,
        extractKeywords: false,  // Reduce payload size
        extractLinks: false,     // Reduce payload size
        extractImages: false,    // Reduce payload size
        extractForensics: false, // DISABLED - function not defined
        respectRobotsTxt: false, // Bypass robots.txt
        validateHttpsCertificates: false, // Allow self-signed certs
        skipCircuitBreaker: true, // Skip circuit breaker
        randomDelay: true,        // Add 2-5s random delay
        maxRetries: 1,            // Only 1 retry to avoid "Argument too large"
        // COMPREHENSIVE EXTRACTION OPTIONS
        extractHeadingsHierarchy: true,      // H1-H6 with nesting
        extractIntroCopy: true,               // First paragraphs
        extractKeywordsComprehensive: true,   // All keyword types
        extractMetaDataComplete: true,        // OG, Twitter, etc.
        extractLinksComprehensive: true,      // Links + anchors
        extractAuthorSignals: true,           // Author credentials
        extractTrustSignals: true,            // E-E-A-T signals
        extractFAQs: true                     // FAQ detection
      });
      
      const fetchDuration = Date.now() - fetchStart;
      result.timings[domain] = fetchDuration;
      
      Logger.log(`      Duration: ${fetchDuration}ms`);
      
      if (snapshot && snapshot.ok) {
        result.competitorData[domain] = {
          domain: domain,
          fetchSuccess: true,
          snapshot: snapshot,
          fetchedAt: new Date().toISOString()
        };
        
        // Validate snapshot data
        Logger.log(`      ✅ Success`);
        Logger.log(`         Has metadata: ${!!snapshot.metadata}`);
        Logger.log(`         Has schema: ${!!snapshot.schema}`);
        Logger.log(`         Has html: ${!!snapshot.html}`);
        
        if (snapshot.metadata) {
          Logger.log(`         Title: ${(snapshot.metadata.title || 'N/A').substring(0, 60)}`);
          Logger.log(`         Word count: ${snapshot.metadata.wordCount || 0}`);
          Logger.log(`         H1: ${(snapshot.metadata.h1 || 'N/A').substring(0, 60)}`);
        }
        
        if (snapshot.schema) {
          Logger.log(`         Schema types: ${(snapshot.schema.types || []).join(', ') || 'None'}`);
        }
        
        // Check if data looks suspicious (too little content)
        if (snapshot.metadata && snapshot.metadata.wordCount < DIAG_CONFIG.VALIDATION.minWordCount) {
          result.warnings.push({
            stage: 'fetching',
            competitor: domain,
            warning: `Low word count: ${snapshot.metadata.wordCount} (expected > ${DIAG_CONFIG.VALIDATION.minWordCount})`,
            recommendation: 'Verify fetcher is getting full page content'
          });
        }
        
      } else {
        const errorMsg = snapshot.error || 'Unknown error';
        result.competitorData[domain] = {
          domain: domain,
          fetchSuccess: false,
          error: errorMsg,
          fetchedAt: new Date().toISOString()
        };
        
        // Detect specific error types
        let errorType = 'unknown';
        if (errorMsg.includes('403')) {
          errorType = 'blocked';
          Logger.log(`      ❌ Failed: Site blocking (403) - Use gateway instead`);
        } else if (errorMsg.includes('Argument too large')) {
          errorType = 'response_too_large';
          Logger.log(`      ❌ Failed: Response too large - Site may have huge HTML`);
        } else {
          Logger.log(`      ❌ Failed: ${errorMsg}`);
        }
        
        result.errors.push({
          stage: 'fetching',
          competitor: domain,
          error: errorMsg,
          errorType: errorType,
          recommendation: errorType === 'blocked' ? 'Use PHP gateway with proxy' : 'Reduce extraction options or use gateway'
        });
      }
      
      // Check timing threshold
      if (fetchDuration > DIAG_CONFIG.THRESHOLDS.maxFetchPerCompetitor) {
        result.warnings.push({
          stage: 'fetching',
          competitor: domain,
          warning: `Slow fetch: ${fetchDuration}ms (threshold: ${DIAG_CONFIG.THRESHOLDS.maxFetchPerCompetitor}ms)`,
          recommendation: 'Consider optimizing FT_fullSnapshot or checking network'
        });
      }
      
    } catch (error) {
      const fetchDuration = Date.now() - fetchStart;
      result.timings[domain] = fetchDuration;
      
      Logger.log(`      ❌ Exception: ${error.toString()}`);
      result.competitorData[domain] = {
        domain: domain,
        fetchSuccess: false,
        error: error.toString(),
        fetchedAt: new Date().toISOString()
      };
      result.errors.push({
        stage: 'fetching',
        competitor: domain,
        error: error.toString()
      });
    }
    
    // Rate limiting
    Utilities.sleep(500);
  });
  
  result.totalDuration = Date.now() - startTime;
  Logger.log(`   Total fetching time: ${result.totalDuration}ms (${(result.totalDuration / 1000).toFixed(2)}s)`);
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 3: API ENRICHMENT TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testAPIEnrichment(competitorData) {
  const result = {
    success: true,
    enrichedData: {},
    apiTimings: {},
    totalDuration: 0,
    errors: []
  };
  
  const startTime = Date.now();
  
  // Handle null/undefined competitorData
  if (!competitorData || typeof competitorData !== 'object') {
    Logger.log('   ⚠️ No competitor data to enrich');
    result.totalDuration = Date.now() - startTime;
    return result;
  }
  
  const domains = Object.keys(competitorData);
  
  Logger.log(`🔌 Testing API enrichment for ${domains.length} competitors...`);
  
  domains.forEach((domain, index) => {
    const comp = competitorData[domain];
    
    if (!comp.fetchSuccess) {
      Logger.log(`   [${index + 1}] ${domain} - Skipped (fetch failed)`);
      result.enrichedData[domain] = comp;
      return;
    }
    
    Logger.log(`   [${index + 1}] ${domain} - Enriching...`);
    
    const enrichedComp = JSON.parse(JSON.stringify(comp)); // Deep clone
    enrichedComp.apiData = {};
    result.apiTimings[domain] = {};
    
    // Test Serper API
    try {
      Logger.log(`      Testing Serper API...`);
      const serperStart = Date.now();
      
      const serperResult = callGateway('serper_search', {
        query: `site:${domain}`,
        params: { num: 10, gl: 'us' }
      });
      
      const serperDuration = Date.now() - serperStart;
      result.apiTimings[domain].serper = serperDuration;
      
      if (serperResult.success) {
        enrichedComp.apiData.serper = serperResult.data;
        Logger.log(`         ✅ Success (${serperDuration}ms)`);
        Logger.log(`            Has data: ${!!serperResult.data}`);
        Logger.log(`            Data keys: ${serperResult.data ? Object.keys(serperResult.data).join(', ') : 'none'}`);
      } else {
        enrichedComp.apiData.serper = { error: serperResult.error };
        Logger.log(`         ⚠️  Failed: ${serperResult.error}`);
      }
      
      if (serperDuration > DIAG_CONFIG.THRESHOLDS.maxAPICallTime) {
        Logger.log(`         ⚠️  Slow response: ${serperDuration}ms`);
      }
    } catch (e) {
      enrichedComp.apiData.serper = { error: e.toString() };
      Logger.log(`         ❌ Exception: ${e.toString()}`);
      result.errors.push({
        stage: 'api_serper',
        competitor: domain,
        error: e.toString()
      });
    }
    
    // Test PageSpeed API
    try {
      Logger.log(`      Testing PageSpeed API...`);
      const pageSpeedStart = Date.now();
      
      // Ensure URL has https:// protocol for PageSpeed API
      const fullUrl = domain.startsWith('http') ? domain : 'https://' + domain;
      
      const pageSpeedResult = callGateway('pagespeed:analyze', {
        url: fullUrl,
        strategy: 'mobile'
      });
      
      const pageSpeedDuration = Date.now() - pageSpeedStart;
      result.apiTimings[domain].pageSpeed = pageSpeedDuration;
      
      if (pageSpeedResult.success) {
        enrichedComp.apiData.pageSpeed = pageSpeedResult.data;
        Logger.log(`         ✅ Success (${pageSpeedDuration}ms)`);
      } else {
        enrichedComp.apiData.pageSpeed = { error: pageSpeedResult.error };
        Logger.log(`         ⚠️  Failed: ${pageSpeedResult.error}`);
      }
      
      if (pageSpeedDuration > DIAG_CONFIG.THRESHOLDS.maxAPICallTime) {
        Logger.log(`         ⚠️  Slow response: ${pageSpeedDuration}ms`);
      }
    } catch (e) {
      enrichedComp.apiData.pageSpeed = { error: e.toString() };
      Logger.log(`         ❌ Exception: ${e.toString()}`);
      result.errors.push({
        stage: 'api_pagespeed',
        competitor: domain,
        error: e.toString()
      });
    }
    
    // Test OpenPageRank API
    try {
      Logger.log(`      Testing OpenPageRank API...`);
      const oprStart = Date.now();
      
      const oprResult = callGateway('opr:rank', {
        domain: domain
      });
      
      const oprDuration = Date.now() - oprStart;
      result.apiTimings[domain].openPageRank = oprDuration;
      
      if (oprResult.success) {
        enrichedComp.apiData.openPageRank = oprResult.data;
        Logger.log(`         ✅ Success (${oprDuration}ms)`);
      } else {
        enrichedComp.apiData.openPageRank = { error: oprResult.error };
        Logger.log(`         ⚠️  Failed: ${oprResult.error}`);
      }
      
      if (oprDuration > DIAG_CONFIG.THRESHOLDS.maxAPICallTime) {
        Logger.log(`         ⚠️  Slow response: ${oprDuration}ms`);
      }
    } catch (e) {
      enrichedComp.apiData.openPageRank = { error: e.toString() };
      Logger.log(`         ❌ Exception: ${e.toString()}`);
      result.errors.push({
        stage: 'api_opr',
        competitor: domain,
        error: e.toString()
      });
    }
    
    result.enrichedData[domain] = enrichedComp;
    Utilities.sleep(300);
  });
  
  result.totalDuration = Date.now() - startTime;
  Logger.log(`   Total API enrichment time: ${result.totalDuration}ms (${(result.totalDuration / 1000).toFixed(2)}s)`);
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 4: DATA STRUCTURE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_validateDataStructure(competitorData) {
  const result = {
    isValid: true,
    structure: {
      isObject: false,
      isArray: false,
      keyCount: 0,
      hasRequiredFields: true
    },
    errors: [],
    warnings: []
  };
  
  Logger.log('🔍 Validating data structure...');
  
  // Check if it's object or array
  result.structure.isObject = typeof competitorData === 'object' && !Array.isArray(competitorData);
  result.structure.isArray = Array.isArray(competitorData);
  
  Logger.log(`   Type: ${result.structure.isArray ? 'Array' : 'Object'}`);
  
  if (result.structure.isObject) {
    result.structure.keyCount = Object.keys(competitorData).length;
    Logger.log(`   Competitors (object keys): ${result.structure.keyCount}`);
    
    // Check each competitor for required fields
    Object.keys(competitorData).forEach(domain => {
      const comp = competitorData[domain];
      const missingFields = [];
      
      DIAG_CONFIG.VALIDATION.requiredFields.forEach(field => {
        if (!comp.hasOwnProperty(field)) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        result.errors.push({
          stage: 'structure',
          competitor: domain,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          recommendation: 'Check data fetching pipeline'
        });
        result.isValid = false;
      }
      
      Logger.log(`   [${domain}]`);
      Logger.log(`      domain: ${comp.domain || 'MISSING'}`);
      Logger.log(`      fetchSuccess: ${comp.fetchSuccess}`);
      Logger.log(`      hasSnapshot: ${!!comp.snapshot}`);
      Logger.log(`      hasApiData: ${!!comp.apiData}`);
    });
  } else if (result.structure.isArray) {
    result.structure.keyCount = competitorData.length;
    Logger.log(`   Competitors (array length): ${result.structure.keyCount}`);
  } else {
    result.errors.push({
      stage: 'structure',
      error: 'Data is neither object nor array',
      recommendation: 'Check fetchAllCompetitorData return type'
    });
    result.isValid = false;
  }
  
  // UI expects ARRAY format
  if (result.structure.isObject) {
    result.warnings.push({
      stage: 'structure',
      warning: 'Data is in OBJECT format, UI expects ARRAY',
      recommendation: 'Transform with Object.values() before sending to UI'
    });
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 5: SAMPLE DATA DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_detectSampleData(competitorData) {
  const result = {
    hasSampleData: false,
    sampleDataFound: [],
    dataQuality: {
      totalCompetitors: 0,
      validData: 0,
      suspiciousData: 0,
      identicalValues: []
    }
  };
  
  Logger.log('🔎 Detecting sample/fake data...');
  
  // Handle null/undefined competitorData
  if (!competitorData || typeof competitorData !== 'object') {
    Logger.log('   ⚠️ No competitor data to analyze');
    return result;
  }
  
  const domains = Array.isArray(competitorData) 
    ? competitorData.map(c => c.domain) 
    : Object.keys(competitorData);
  
  result.dataQuality.totalCompetitors = domains.length;
  
  // Collect all metric values to detect duplicates
  const metricValues = {
    wordCount: [],
    authority: [],
    traffic: [],
    pageSpeed: []
  };
  
  domains.forEach(domain => {
    const comp = Array.isArray(competitorData) 
      ? competitorData.find(c => c.domain === domain)
      : competitorData[domain];
    
    if (!comp || !comp.fetchSuccess) {
      result.dataQuality.suspiciousData++;
      return;
    }
    
    // Collect metrics
    const wordCount = comp.snapshot?.metadata?.wordCount || 0;
    const authority = comp.apiData?.openPageRank?.rank || 0;
    const traffic = comp.apiData?.serper?.estimatedTraffic || 0;
    const pageSpeed = comp.apiData?.pageSpeed?.performance || 0;
    
    metricValues.wordCount.push(wordCount);
    metricValues.authority.push(authority);
    metricValues.traffic.push(traffic);
    metricValues.pageSpeed.push(pageSpeed);
    
    Logger.log(`   [${domain}]`);
    Logger.log(`      Word Count: ${wordCount}`);
    Logger.log(`      Authority: ${authority}`);
    Logger.log(`      Traffic: ${traffic}`);
    Logger.log(`      PageSpeed: ${pageSpeed}`);
    
    // Check for suspicious patterns
    if (wordCount === 0) {
      result.sampleDataFound.push({
        competitor: domain,
        issue: 'Zero word count',
        metric: 'wordCount',
        value: 0
      });
    }
    
    if (authority === 45 || authority === 0) {
      result.sampleDataFound.push({
        competitor: domain,
        issue: 'Default/fallback authority value',
        metric: 'authority',
        value: authority
      });
    }
  });
  
  // Detect identical values across competitors
  Object.keys(metricValues).forEach(metric => {
    const values = metricValues[metric];
    const uniqueValues = [...new Set(values)];
    
    if (uniqueValues.length === 1 && values.length > 1) {
      Logger.log(`   ⚠️  ALL competitors have identical ${metric}: ${uniqueValues[0]}`);
      result.dataQuality.identicalValues.push({
        metric: metric,
        value: uniqueValues[0],
        count: values.length
      });
      result.hasSampleData = true;
    }
  });
  
  if (result.sampleDataFound.length > 0) {
    result.hasSampleData = true;
    Logger.log(`   🔴 Sample data detected: ${result.sampleDataFound.length} issues`);
  } else {
    Logger.log(`   ✅ No obvious sample data detected`);
  }
  
  result.dataQuality.validData = result.dataQuality.totalCompetitors - result.dataQuality.suspiciousData;
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 6: GEMINI PROMPT TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testGeminiPrompt(competitorData) {
  const result = {
    success: true,
    prompt: null,
    promptLength: 0,
    dataIncluded: {
      competitors: [],
      hasTitles: false,
      hasWordCounts: false,
      hasSchemas: false,
      hasAPIData: false
    },
    warnings: []
  };
  
  Logger.log('📝 Testing Gemini prompt construction...');
  
  try {
    result.prompt = buildEliteCompetitorPrompt(
      competitorData,
      DIAG_CONFIG.TEST_PROJECT.brandName,
      DIAG_CONFIG.TEST_PROJECT
    );
    
    result.promptLength = result.prompt.length;
    Logger.log(`   Prompt length: ${result.promptLength} characters (${(result.promptLength / 1024).toFixed(2)} KB)`);
    
    // Analyze what data is included
    const domains = Array.isArray(competitorData) 
      ? competitorData.map(c => c.domain)
      : Object.keys(competitorData);
    
    result.dataIncluded.competitors = domains;
    
    // Check if prompt contains actual data
    result.dataIncluded.hasTitles = domains.some(domain => 
      result.prompt.includes(domain) && result.prompt.toLowerCase().includes('title')
    );
    
    result.dataIncluded.hasWordCounts = result.prompt.includes('wordCount');
    result.dataIncluded.hasSchemas = result.prompt.includes('schema');
    result.dataIncluded.hasAPIData = result.prompt.includes('apiData') || result.prompt.includes('traffic');
    
    Logger.log(`   Data included in prompt:`);
    Logger.log(`      Competitors: ${result.dataIncluded.competitors.length}`);
    Logger.log(`      Has titles: ${result.dataIncluded.hasTitles}`);
    Logger.log(`      Has word counts: ${result.dataIncluded.hasWordCounts}`);
    Logger.log(`      Has schemas: ${result.dataIncluded.hasSchemas}`);
    Logger.log(`      Has API data: ${result.dataIncluded.hasAPIData}`);
    
    // Sample the prompt structure
    Logger.log(`   Prompt structure (first 500 chars):`);
    Logger.log('   ' + result.prompt.substring(0, 500).split('\n').join('\n   '));
    
    // Check for warning signs
    if (result.prompt.includes('No competitor data available')) {
      result.warnings.push({
        stage: 'prompt',
        warning: 'Prompt contains "No competitor data available"',
        recommendation: 'Check competitorData parameter passed to buildEliteCompetitorPrompt'
      });
    }
    
    if (!result.dataIncluded.hasTitles) {
      result.warnings.push({
        stage: 'prompt',
        warning: 'Prompt may not contain actual website titles',
        recommendation: 'Verify snapshot.metadata.title is being extracted'
      });
    }
    
  } catch (error) {
    result.success = false;
    result.error = error.toString();
    Logger.log(`   ❌ Error building prompt: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 7: GEMINI API CALL TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testGeminiCall(prompt) {
  const result = {
    success: false,
    duration: 0,
    responseLength: 0,
    model: 'gemini-2.0-flash-exp',
    error: null,
    responsePreview: null
  };
  
  Logger.log('🤖 Testing Gemini API call...');
  
  if (!prompt) {
    result.error = 'No prompt provided';
    Logger.log('   ❌ No prompt to test');
    return result;
  }
  
  const startTime = Date.now();
  
  try {
    Logger.log(`   Calling Gemini with ${prompt.length} char prompt...`);
    
    const geminiResult = callGateway('gemini:generate', {
      model: 'gemini-2.0-flash-exp',
      prompt: prompt,
      options: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    });
    
    result.duration = Date.now() - startTime;
    Logger.log(`   Duration: ${result.duration}ms (${(result.duration / 1000).toFixed(2)}s)`);
    
    if (geminiResult.success) {
      result.success = true;
      const responseText = geminiResult.text || geminiResult.data || '';
      result.responseLength = responseText.length;
      result.responsePreview = responseText.substring(0, 500);
      
      Logger.log(`   ✅ Success`);
      Logger.log(`   Response length: ${result.responseLength} characters`);
      Logger.log(`   Response preview:`);
      Logger.log('   ' + result.responsePreview.split('\n').join('\n   '));
      
      // Check for warning signs in response
      if (responseText.includes('failure to fetch data') || 
          responseText.includes("can't analyze without")) {
        Logger.log(`   ⚠️  WARNING: Response contains "failure to fetch data" message`);
        Logger.log(`   This means Gemini did not receive or understand the data`);
      }
      
    } else {
      result.error = geminiResult.error;
      Logger.log(`   ❌ Failed: ${result.error}`);
    }
    
    // Check timing threshold
    if (result.duration > DIAG_CONFIG.THRESHOLDS.maxGeminiTime) {
      Logger.log(`   ⚠️  Slow response: ${result.duration}ms (threshold: ${DIAG_CONFIG.THRESHOLDS.maxGeminiTime}ms)`);
    }
    
  } catch (error) {
    result.duration = Date.now() - startTime;
    result.error = error.toString();
    Logger.log(`   ❌ Exception: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 8: RESPONSE TRANSFORMATION TEST
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_testResponseTransformation(competitorData) {
  const result = {
    success: true,
    inputType: null,
    outputType: null,
    inputCount: 0,
    outputCount: 0,
    transformationNeeded: false,
    errors: []
  };
  
  Logger.log('🔄 Testing response transformation (Object → Array)...');
  
  // Handle null/undefined competitorData
  if (!competitorData || typeof competitorData !== 'object') {
    Logger.log('   ⚠️ No competitor data to transform');
    result.errors.push({
      stage: 'transformation',
      error: 'No data provided',
      recommendation: 'Check data fetching and enrichment stages'
    });
    result.success = false;
    return result;
  }
  
  // Check input type
  result.inputType = Array.isArray(competitorData) ? 'array' : 'object';
  result.inputCount = Array.isArray(competitorData) 
    ? competitorData.length 
    : Object.keys(competitorData).length;
  
  Logger.log(`   Input type: ${result.inputType}`);
  Logger.log(`   Input count: ${result.inputCount}`);
  
  // Simulate transformation
  let transformed;
  
  if (result.inputType === 'object') {
    result.transformationNeeded = true;
    Logger.log(`   Transformation needed: Object → Array`);
    
    try {
      transformed = Object.values(competitorData);
      
      // Add URL property for metrics engine
      transformed = transformed.map(comp => ({
        ...comp,
        url: comp.url || comp.domain || 'unknown'
      }));
      
      result.outputType = 'array';
      result.outputCount = transformed.length;
      
      Logger.log(`   ✅ Transformation successful`);
      Logger.log(`   Output count: ${result.outputCount}`);
      Logger.log(`   Added URL property to all items`);
      
      // Verify each item has required properties
      transformed.forEach((comp, idx) => {
        if (!comp.domain && !comp.url) {
          result.errors.push({
            stage: 'transformation',
            competitor: `index ${idx}`,
            error: 'Missing domain and url properties',
            recommendation: 'Ensure transformation adds url property'
          });
        }
      });
      
    } catch (error) {
      result.success = false;
      result.errors.push({
        stage: 'transformation',
        error: error.toString(),
        recommendation: 'Check Object.values() compatibility'
      });
      Logger.log(`   ❌ Transformation failed: ${error.toString()}`);
    }
  } else {
    Logger.log(`   No transformation needed (already array)`);
    transformed = competitorData;
    result.outputType = 'array';
    result.outputCount = transformed.length;
  }
  
  // Verify UI compatibility
  if (transformed && Array.isArray(transformed)) {
    Logger.log(`   Checking UI compatibility...`);
    
    const firstItem = transformed[0];
    if (firstItem) {
      Logger.log(`      First item keys: ${Object.keys(firstItem).join(', ')}`);
      Logger.log(`      Has url: ${!!firstItem.url}`);
      Logger.log(`      Has domain: ${!!firstItem.domain}`);
      Logger.log(`      Has processedMetrics: ${!!firstItem.processedMetrics}`);
      
      if (!firstItem.url) {
        Logger.log(`      ⚠️  WARNING: Missing 'url' property (metrics engine requires it)`);
      }
    }
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

function DIAG_generateRecommendations(results) {
  const recs = [];
  
  // Validate results object
  if (!results || typeof results !== 'object') {
    Logger.log('⚠️ Invalid results object in generateRecommendations');
    return recs;
  }
  
  // Ensure stages object exists
  results.stages = results.stages || {};
  
  // Check authorization timing
  if (results.stages.authorization && results.stages.authorization.duration > DIAG_CONFIG.THRESHOLDS.maxAuthTime) {
    recs.push('Authorization is slow - consider implementing client-side caching or skip auth for testing');
  }
  
  // Check fetching errors
  if (results.stages.fetching && results.stages.fetching.errors && results.stages.fetching.errors.length > 0) {
    const hasBlockedErrors = results.stages.fetching.errors.some(e => e.errorType === 'blocked');
    const hasTooLargeErrors = results.stages.fetching.errors.some(e => e.errorType === 'response_too_large');
    
    if (hasBlockedErrors) {
      recs.push('CRITICAL: Sites blocking direct access (403) - Use PHP gateway with Bright Data proxy instead of FT_fullSnapshot');
    }
    if (hasTooLargeErrors) {
      recs.push('WARNING: HTML responses too large - Use gateway with content trimming or reduce extraction options');
    }
    if (!hasBlockedErrors && !hasTooLargeErrors) {
      recs.push('Data fetching has errors - verify FT_fullSnapshot is working and URLs are valid');
    }
  }
  
  // Check sample data
  if (results.dataQuality && results.dataQuality.hasSampleData) {
    recs.push('CRITICAL: Sample/repeating data detected - check if APIs are returning actual data');
    if (results.dataQuality.identicalValues.length > 0) {
      results.dataQuality.identicalValues.forEach(iv => {
        recs.push(`   All competitors have identical ${iv.metric}: ${iv.value} - this is NOT real data`);
      });
    }
  }
  
  // Check data structure
  if (results.stages.dataStructure && results.stages.dataStructure.warnings.length > 0) {
    recs.push('Data structure mismatch - ensure Object→Array transformation in UI_Elite_Integration.html');
  }
  
  // Check Gemini
  if (results.stages.gemini && !results.stages.gemini.success) {
    recs.push('Gemini API is failing - check API key, quota, and gateway connection');
  }
  
  // Check total time
  if (results.testDuration > DIAG_CONFIG.THRESHOLDS.maxTotalTime) {
    recs.push(`Total workflow is slow (${(results.testDuration / 1000).toFixed(2)}s) - consider async processing or background jobs`);
  }
  
  // Check loading state issue
  recs.push('To debug loading state: Check console logs for "showCompetitorLoadingState" calls');
  recs.push('Verify loading element exists in DOM before hiding it');
  recs.push('Add 3-second minimum display time in UI_Elite_Integration.html (already implemented)');
  
  results.recommendations = recs;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK LOADING STATE TEST
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test just the loading state visibility issue
 * Run this from Apps Script editor to check frontend logs
 */
function DIAG_testLoadingState() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('🔄 LOADING STATE DIAGNOSTIC');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('To diagnose loading state issues:');
  Logger.log('');
  Logger.log('1. Open your web app in browser');
  Logger.log('2. Open browser Console (F12)');
  Logger.log('3. Click "Analyze Competitors" button');
  Logger.log('4. Watch for these console logs:');
  Logger.log('   - "📊 Will analyze X competitors..."');
  Logger.log('   - "🔄 SHOWING LOADING STATE"');
  Logger.log('   - "Loading element exists: true/false"');
  Logger.log('   - "⏱️ Loading visible for Xms..."');
  Logger.log('');
  Logger.log('5. Check if loading element exists:');
  Logger.log('   - In Console, type: document.querySelector(".comp-loading-state")');
  Logger.log('   - Should return an element, not null');
  Logger.log('');
  Logger.log('6. If loading element is null:');
  Logger.log('   - Check UI_Components_Competitors.html line 8-60');
  Logger.log('   - Verify <div class="comp-loading-state"> exists');
  Logger.log('   - Check if it\'s being removed accidentally');
  Logger.log('');
  Logger.log('7. If loading shows but disappears instantly:');
  Logger.log('   - Check UI_Elite_Integration.html line 89-95');
  Logger.log('   - Verify 3-second minimum display is active');
  Logger.log('   - Check if hideCompetitorLoadingState() is called too early');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  
  return {
    message: 'Follow the steps above in browser console',
    files: [
      'UI_Elite_Integration.html (lines 40-120)',
      'UI_Components_Competitors.html (lines 8-60)',
      'UI_Elite_Integration.html (lines 269-330 - showCompetitorLoadingState)'
    ]
  };
}

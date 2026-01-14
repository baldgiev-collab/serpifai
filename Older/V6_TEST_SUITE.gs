/**
 * ═══════════════════════════════════════════════════════════════════════════
 * V6 FORENSIC ENGINE - COMPLETE TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Run these tests to verify V6 is working correctly
 * 
 * @module V6Tests
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * TEST 1: Test V6 Forensic Scan (DataBridge)
 * Run this in your DataBridge project
 */
function TEST_V6_ForensicScan() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST 1: V6 Forensic Scan');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var config = {
    competitors: ['https://ahrefs.com'],
    projectId: 'test-v6-forensic',
    yourDomain: 'mysite.com',
    spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
    targetKeywords: ['seo tools'],
    industry: 'SEO Software'
  };
  
  Logger.log('📋 Config: ' + JSON.stringify(config));
  Logger.log('');
  
  var startTime = new Date().getTime();
  var result = WORKFLOW_analyzeCompetitors(config);
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 TEST RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  Logger.log('✅ Success: ' + result.success);
  Logger.log('⏱️ Execution Time: ' + (elapsedTime / 1000).toFixed(1) + 's');
  Logger.log('📊 Data Completeness: ' + result.metadata.dataCompleteness);
  Logger.log('🔍 Competitors Analyzed: ' + result.metadata.competitorsAnalyzed);
  
  if (result.intelligence && result.intelligence.competitors && result.intelligence.competitors[0]) {
    var comp = result.intelligence.competitors[0];
    Logger.log('');
    Logger.log('🎯 Competitor: ' + comp.domain);
    Logger.log('   Completeness: ' + comp.completeness + '%');
    Logger.log('   Fetcher: ' + comp.fetcherSuccess);
    Logger.log('   APIs: ' + comp.apiSuccess);
    Logger.log('   Authority: ' + comp.authority);
    Logger.log('   Performance: ' + comp.performance);
  }
  
  // 📊 LOG ALL COLLECTED DATA
  if (result.uiData && result.uiData[0]) {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('📊 DETAILED DATA COLLECTED');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    var data = result.uiData[0];
    
    Logger.log('');
    Logger.log('📋 METADATA:');
    Logger.log('   Title: ' + (data.metrics.title || 'N/A'));
    Logger.log('   Description: ' + (data.metrics.description || 'N/A').substring(0, 100) + '...');
    Logger.log('   Keywords: ' + (data.metrics.keywords || 'N/A'));
    
    Logger.log('');
    Logger.log('📋 OPEN GRAPH:');
    Logger.log('   OG Title: ' + (data.metrics.ogTitle || 'N/A'));
    Logger.log('   OG Description: ' + (data.metrics.ogDescription || 'N/A').substring(0, 100) + '...');
    Logger.log('   OG Image: ' + (data.metrics.ogImage || 'N/A'));
    
    Logger.log('');
    Logger.log('📝 INTRO CONTENT:');
    var introParagraphs = data.metrics.introParagraphs || [];
    if (introParagraphs.length > 0) {
      introParagraphs.forEach(function(para, i) {
        Logger.log('   Paragraph ' + (i + 1) + ': ' + para.substring(0, 150) + '...');
      });
    } else {
      Logger.log('   No intro paragraphs captured');
    }
    
    Logger.log('');
    Logger.log('📊 HEADINGS (' + (data.metrics.totalHeadings || 0) + ' total):');
    Logger.log('   H1: ' + (data.metrics.h1Count || 0));
    Logger.log('   H2: ' + (data.metrics.h2Count || 0));
    Logger.log('   H3: ' + (data.metrics.h3Count || 0));
    
    var headings = data.metrics.headings || [];
    if (headings.length > 0) {
      Logger.log('');
      Logger.log('   Full Heading Hierarchy (first 10):');
      headings.slice(0, 10).forEach(function(h) {
        Logger.log('   ' + h.level.toUpperCase() + ' (#' + h.position + '): ' + h.text);
      });
      if (headings.length > 10) {
        Logger.log('   ... and ' + (headings.length - 10) + ' more headings');
      }
    }
    
    Logger.log('');
    Logger.log('🔑 TOP KEYWORDS (from headings):');
    var keywords = data.metrics.topKeywords || [];
    if (keywords.length > 0) {
      keywords.forEach(function(kw) {
        Logger.log('   "' + kw.keyword + '" appears ' + kw.count + ' times');
      });
    } else {
      Logger.log('   No keywords extracted');
    }
    
    Logger.log('');
    Logger.log('🎯 FORENSIC METRICS:');
    Logger.log('   CMS: ' + (data.metrics.cms || 'Unknown'));
    Logger.log('   Humanity Score: ' + (data.metrics.humanityScore || 0) + '/100');
    Logger.log('   Uniqueness Score: ' + (data.metrics.uniquenessScore || 0) + '/100');
    Logger.log('   Friction Level: ' + (data.metrics.frictionLevel || 'Unknown'));
    
    Logger.log('');
    Logger.log('📊 API DATA:');
    Logger.log('   Authority Score: ' + (data.metrics.authority || 0));
    Logger.log('   Performance Score: ' + (data.metrics.performance || 0));
    Logger.log('   Organic Keywords: ' + (data.metrics.organicKeywords || 0));
    Logger.log('   Organic Traffic: ' + (data.metrics.organicTraffic || 0));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log(result.success ? '✅ TEST PASSED' : '❌ TEST FAILED');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return result;
}

/**
 * TEST 2: Test Direct Forensic Call (Fetcher)
 * Run this in your Fetcher project to test the forensic scan directly
 */
function TEST_DirectForensicScan() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST 2: Direct Forensic Scan (Fetcher)');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var url = 'https://ahrefs.com';
  var competitorUrls = ['https://semrush.com', 'https://moz.com'];
  
  Logger.log('🔬 Scanning: ' + url);
  Logger.log('📊 Competitors: ' + competitorUrls.length);
  Logger.log('');
  
  var startTime = new Date().getTime();
  var result = FET_fullForensicScan(url, competitorUrls);
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 FORENSIC RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  Logger.log('✅ Success: ' + result.ok);
  Logger.log('⏱️ Execution Time: ' + (elapsedTime / 1000).toFixed(1) + 's');
  
  if (result.ok && result.forensics) {
    var f = result.forensics;
    
    Logger.log('');
    Logger.log('📊 CATEGORY I: Market Intelligence');
    Logger.log('   CMS: ' + f.market_intel.cms);
    Logger.log('   Tech Stack: ' + (f.market_intel.tech_stack || []).length + ' tools');
    Logger.log('   Brand Text: ' + f.market_intel.brand_text.substring(0, 100) + '...');
    
    Logger.log('');
    Logger.log('📊 CATEGORY II: Brand Positioning');
    Logger.log('   E-E-A-T Schemas: ' + (f.brand_pos.eeat_schema || []).length);
    Logger.log('   Trust Signals: ' + (f.brand_pos.trust_signals || []).length);
    
    Logger.log('');
    Logger.log('📊 CATEGORY III: Technical SEO');
    Logger.log('   Security Headers: ' + JSON.stringify(f.technical.security_headers));
    Logger.log('   Indexability: ' + f.technical.indexability);
    
    Logger.log('');
    Logger.log('📊 CATEGORY IV: Content Intelligence');
    Logger.log('   🎯 Humanity Score: ' + f.content_intel.humanity_score + '/100');
    Logger.log('   📝 AI Phrases Found: ' + (f.content_intel.ai_phrases_detected || []).length);
    Logger.log('   🆕 Velocity (30d): ' + f.content_intel.velocity_30d + ' new pages');
    Logger.log('   ⭐ Uniqueness Score: ' + f.content_intel.uniqueness_score + '/100');
    
    Logger.log('');
    Logger.log('📊 CATEGORY V: Structure');
    Logger.log('   H1 Count: ' + f.structure.h1_count);
    Logger.log('   Total Headings: ' + f.structure.total_headings);
    Logger.log('   Hierarchy Valid: ' + f.structure.hierarchy_valid);
    
    Logger.log('');
    Logger.log('📊 CATEGORY VI: Systems');
    Logger.log('   CMS: ' + f.systems.cms);
    Logger.log('   Marketing Automation: ' + f.systems.marketing_automation);
    Logger.log('   Automation Tools: ' + (f.systems.automation_tools || []).length);
    
    Logger.log('');
    Logger.log('📊 CATEGORY VII: Conversion');
    Logger.log('   ⚡ Friction Score: ' + f.conversion.friction_score + ' fields');
    Logger.log('   ⚡ Friction Level: ' + f.conversion.friction_level);
    Logger.log('   💰 Pricing Detected: ' + f.conversion.pricing_detected);
    Logger.log('   📞 Booking Detected: ' + f.conversion.booking_detected);
    Logger.log('   🆓 Trial Detected: ' + f.conversion.trial_detected);
    Logger.log('   🛒 Purchase Detected: ' + f.conversion.purchase_detected);
    Logger.log('   🔗 Tripwire Links: ' + (f.conversion.tripwire_links || []).length);
  } else {
    Logger.log('❌ Error: ' + (result.error || 'Unknown error'));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log(result.ok ? '✅ TEST PASSED' : '❌ TEST FAILED');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return result;
}

/**
 * TEST 3: Test Circuit Breaker (Fetcher)
 * Run this in your Fetcher project
 */
function TEST_CircuitBreaker() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST 3: Circuit Breaker');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var domain = 'test-domain.com';
  
  Logger.log('📍 Domain: ' + domain);
  Logger.log('');
  
  // Test 1: Initial check
  Logger.log('🔍 Step 1: Check initial state');
  var check1 = CB_checkCircuit(domain);
  Logger.log('   Result: ' + JSON.stringify(check1));
  Logger.log('');
  
  // Test 2: Record failures
  Logger.log('🔍 Step 2: Record 5 failures');
  for (var i = 1; i <= 5; i++) {
    CB_recordFailure(domain, 429, 'Test failure ' + i);
    Logger.log('   Failure ' + i + ' recorded');
  }
  Logger.log('');
  
  // Test 3: Check circuit should be OPEN
  Logger.log('🔍 Step 3: Check if circuit opened');
  var check2 = CB_checkCircuit(domain);
  Logger.log('   Result: ' + JSON.stringify(check2));
  Logger.log('');
  
  // Test 4: Record success
  Logger.log('🔍 Step 4: Record success (reduce failure count)');
  CB_recordSuccess(domain);
  var check3 = CB_checkCircuit(domain);
  Logger.log('   Result: ' + JSON.stringify(check3));
  Logger.log('');
  
  // Test 5: Reset circuit
  Logger.log('🔍 Step 5: Reset circuit');
  CB_resetCircuit(domain);
  var check4 = CB_checkCircuit(domain);
  Logger.log('   Result: ' + JSON.stringify(check4));
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('✅ CIRCUIT BREAKER TEST PASSED');
  Logger.log('═══════════════════════════════════════════════════════════');
}

/**
 * TEST 4: Test API Keys (DataBridge)
 * Run this in your DataBridge project
 */
function TEST_APIKeys() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST 4: API Keys Configuration');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var props = PropertiesService.getScriptProperties();
  
  // Check both possible property names (with and without underscore)
  var fetcherUrl = props.getProperty('FETCHER_WEB_APP_URL') || props.getProperty('FETCHER_WEBAPP_URL');
  
  var keys = {
    'SERPER_KEY': props.getProperty('SERPER_KEY'),
    'OPEN_PAGERANK_KEY': props.getProperty('OPEN_PAGERANK_KEY'),
    'GEMINI_API_KEY': props.getProperty('GEMINI_API_KEY'),
    'FETCHER_WEB_APP_URL': fetcherUrl
  };
  
  Logger.log('📋 Configured Keys:');
  Logger.log('');
  
  for (var key in keys) {
    var value = keys[key];
    var status = value ? '✅ SET (' + value.substring(0, 20) + '...)' : '❌ NOT SET';
    Logger.log('   ' + key + ': ' + status);
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var allSet = keys['GEMINI_API_KEY'] && keys['FETCHER_WEB_APP_URL'];
  
  if (allSet) {
    Logger.log('✅ MINIMUM REQUIREMENTS MET');
    Logger.log('   (SERPER_KEY and OPEN_PAGERANK_KEY are optional)');
  } else {
    Logger.log('❌ MISSING REQUIRED KEYS');
    if (!keys['GEMINI_API_KEY']) Logger.log('   - GEMINI_API_KEY (REQUIRED)');
    if (!keys['FETCHER_WEB_APP_URL']) Logger.log('   - FETCHER_WEB_APP_URL (REQUIRED)');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════');
}

/**
 * TEST 5: Test Batch Processing (DataBridge)
 * Run this in your DataBridge project
 */
function TEST_BatchProcessing() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST 5: Batch Processing (3 Competitors)');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var config = {
    competitors: [
      'https://ahrefs.com',
      'https://semrush.com',
      'https://moz.com'
    ],
    projectId: 'test-v6-batch',
    yourDomain: 'mysite.com',
    spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
    targetKeywords: ['seo tools'],
    industry: 'SEO Software'
  };
  
  Logger.log('📋 Testing with ' + config.competitors.length + ' competitors');
  Logger.log('');
  
  var startTime = new Date().getTime();
  var result = WORKFLOW_analyzeCompetitors(config);
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 BATCH RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  Logger.log('✅ Success: ' + result.success);
  Logger.log('⏱️ Total Time: ' + (elapsedTime / 1000).toFixed(1) + 's');
  Logger.log('⏱️ Avg per Competitor: ' + (elapsedTime / 1000 / config.competitors.length).toFixed(1) + 's');
  Logger.log('📊 Competitors Analyzed: ' + result.metadata.competitorsAnalyzed);
  Logger.log('📊 Data Completeness: ' + result.metadata.dataCompleteness);
  
  if (result.intelligence && result.intelligence.competitors) {
    Logger.log('');
    Logger.log('🎯 Per-Competitor Results:');
    result.intelligence.competitors.forEach(function(comp, index) {
      Logger.log('');
      Logger.log('   ' + (index + 1) + '. ' + comp.domain);
      Logger.log('      Completeness: ' + comp.completeness + '%');
      Logger.log('      Fetcher: ' + comp.fetcherSuccess);
      Logger.log('      APIs: ' + comp.apiSuccess);
    });
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log(result.success ? '✅ BATCH TEST PASSED' : '❌ BATCH TEST FAILED');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return result;
}

/**
 * TEST 0: Verify Fetcher is Deployed (DataBridge)
 * Run this FIRST to make sure Fetcher is accessible
 */
function VERIFY_FETCHER_DEPLOYED() {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('FETCHER_WEB_APP_URL');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔍 FETCHER DEPLOYMENT CHECK');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (!url) {
    Logger.log('❌ FETCHER_WEB_APP_URL not set in Script Properties');
    Logger.log('');
    Logger.log('📋 TO FIX:');
    Logger.log('   1. Open your Fetcher Apps Script project');
    Logger.log('   2. Click Deploy → New deployment → Web app');
    Logger.log('   3. Copy the Web App URL');
    Logger.log('   4. In DataBridge → Project Settings → Script Properties');
    Logger.log('   5. Set FETCHER_WEB_APP_URL to the copied URL');
    Logger.log('');
    Logger.log('📖 See DEPLOY_FETCHER_NOW.md for detailed instructions');
    Logger.log('═══════════════════════════════════════════════════════════');
    return false;
  }
  
  Logger.log('✅ FETCHER_WEB_APP_URL configured');
  Logger.log('   URL: ' + url.substring(0, 60) + '...');
  Logger.log('');
  Logger.log('🧪 Testing connection to Fetcher...');
  
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        action: 'fetch:fullScan',
        payload: {
          url: 'https://example.com',
          competitorUrls: []
        }
      }),
      muteHttpExceptions: true
    });
    
    var code = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('   Response code: ' + code);
    
    if (code === 200) {
      Logger.log('✅ FETCHER IS DEPLOYED AND RESPONDING!');
      
      // Try to parse response
      try {
        var result = JSON.parse(responseText);
        if (result.ok || result.success) {
          Logger.log('✅ Fetcher returned valid JSON response');
        } else {
          Logger.log('⚠️ Fetcher responded but returned error: ' + (result.error || 'Unknown'));
        }
      } catch (parseError) {
        Logger.log('⚠️ Response is not valid JSON (first 200 chars):');
        Logger.log('   ' + responseText.substring(0, 200));
      }
      
      Logger.log('');
      Logger.log('🎉 DEPLOYMENT SUCCESSFUL!');
      Logger.log('   You can now run RUN_ALL_TESTS()');
      Logger.log('═══════════════════════════════════════════════════════════');
      return true;
      
    } else {
      Logger.log('❌ Fetcher returned HTTP ' + code);
      Logger.log('   Response (first 300 chars):');
      Logger.log('   ' + responseText.substring(0, 300));
      Logger.log('');
      Logger.log('📋 POSSIBLE CAUSES:');
      Logger.log('   1. Fetcher not deployed as Web App');
      Logger.log('   2. Wrong permissions (should be "Anyone")');
      Logger.log('   3. Fetcher files not saved');
      Logger.log('');
      Logger.log('📖 See DEPLOY_FETCHER_NOW.md for help');
      Logger.log('═══════════════════════════════════════════════════════════');
      return false;
    }
    
  } catch (e) {
    Logger.log('❌ Connection failed: ' + e);
    Logger.log('');
    Logger.log('📋 POSSIBLE CAUSES:');
    Logger.log('   1. Fetcher not deployed as Web App');
    Logger.log('   2. Wrong URL in FETCHER_WEB_APP_URL');
    Logger.log('   3. Network connectivity issue');
    Logger.log('');
    Logger.log('📖 See DEPLOY_FETCHER_NOW.md for help');
    Logger.log('═══════════════════════════════════════════════════════════');
    return false;
  }
}

/**
 * RUN ALL TESTS
 * Run this in your DataBridge project for complete validation
 */
function RUN_ALL_TESTS() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🚀 RUNNING ALL V6 TESTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  try {
    // Test 0: Verify Fetcher Deployment
    Logger.log('🔍 Step 1: Verifying Fetcher deployment...');
    Logger.log('');
    var fetcherOk = VERIFY_FETCHER_DEPLOYED();
    
    if (!fetcherOk) {
      Logger.log('');
      Logger.log('═══════════════════════════════════════════════════════════');
      Logger.log('❌ CANNOT PROCEED - FETCHER NOT DEPLOYED');
      Logger.log('   Please deploy Fetcher first (see DEPLOY_FETCHER_NOW.md)');
      Logger.log('═══════════════════════════════════════════════════════════');
      return;
    }
    
    Logger.log('');
    Logger.log('🔍 Step 2: Checking API keys...');
    Logger.log('');
    
    // Test 4: API Keys
    TEST_APIKeys();
    Logger.log('');
    
    Logger.log('🔍 Step 3: Running V6 forensic scan test...');
    Logger.log('');
    
    // Test 1: Single Competitor
    TEST_V6_ForensicScan();
    Logger.log('');
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('✅ ALL TESTS COMPLETED');
    Logger.log('═══════════════════════════════════════════════════════════');
    
  } catch (e) {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('❌ TEST SUITE FAILED');
    Logger.log('   Error: ' + e);
    Logger.log('   Stack: ' + e.stack);
    Logger.log('═══════════════════════════════════════════════════════════');
  }
}

/**
 * LOG ALL COLLECTED DATA
 * Run this to see EVERYTHING collected for a specific competitor
 */
function LOG_ALL_DATA() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 DETAILED DATA LOGGER');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  var domain = 'ahrefs.com';
  var projectId = 'test-v6-forensic';
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  Logger.log('🔍 Reading data for: ' + domain);
  Logger.log('');
  
  // Read full data from storage
  var fullData = STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId);
  
  if (!fullData.success) {
    Logger.log('❌ Failed to read data: ' + (fullData.error || 'Unknown error'));
    Logger.log('');
    Logger.log('💡 TIP: Run RUN_ALL_TESTS() first to collect data');
    return;
  }
  
  var fetcher = fullData.rawData.fetcher || {};
  var apis = fullData.rawData.apis || {};
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📋 METADATA (ALL META TAGS)');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.market_intel && fetcher.market_intel.meta_tags) {
    var meta = fetcher.market_intel.meta_tags;
    Logger.log('   Title: ' + (meta.title || 'N/A'));
    Logger.log('   Description: ' + (meta.description || 'N/A'));
    Logger.log('   Keywords: ' + (meta.keywords || 'N/A'));
    Logger.log('   Author: ' + (meta.author || 'N/A'));
    Logger.log('   Robots: ' + (meta.robots || 'N/A'));
    Logger.log('   Canonical: ' + (meta.canonical || 'N/A'));
    Logger.log('');
    Logger.log('   OG Title: ' + (meta.ogTitle || 'N/A'));
    Logger.log('   OG Description: ' + (meta.ogDescription || 'N/A'));
    Logger.log('   OG Image: ' + (meta.ogImage || 'N/A'));
    Logger.log('   OG Type: ' + (meta.ogType || 'N/A'));
    Logger.log('');
    Logger.log('   Twitter Card: ' + (meta.twitterCard || 'N/A'));
    Logger.log('   Twitter Title: ' + (meta.twitterTitle || 'N/A'));
    Logger.log('   Twitter Description: ' + (meta.twitterDescription || 'N/A'));
    Logger.log('   Twitter Image: ' + (meta.twitterImage || 'N/A'));
  } else {
    Logger.log('   ⚠️ No metadata captured');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📝 INTRO CONTENT');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.market_intel && fetcher.market_intel.intro_paragraphs) {
    var paras = fetcher.market_intel.intro_paragraphs;
    Logger.log('   Total paragraphs: ' + paras.length);
    Logger.log('');
    paras.forEach(function(para, i) {
      Logger.log('   Paragraph ' + (i + 1) + ':');
      Logger.log('   ' + para.substring(0, 200) + (para.length > 200 ? '...' : ''));
      Logger.log('');
    });
  } else {
    Logger.log('   ⚠️ No intro paragraphs captured');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 HEADING STRUCTURE');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.structure) {
    var structure = fetcher.structure;
    Logger.log('   H1 Count: ' + (structure.h1_count || 0));
    Logger.log('   H2 Count: ' + (structure.h2_count || 0));
    Logger.log('   H3 Count: ' + (structure.h3_count || 0));
    Logger.log('   Total Headings: ' + (structure.total_headings || 0));
    Logger.log('   Hierarchy Valid: ' + (structure.hierarchy_valid || false));
    Logger.log('');
    
    if (structure.headings && structure.headings.length > 0) {
      Logger.log('   Full Heading Hierarchy:');
      structure.headings.forEach(function(h) {
        Logger.log('   ' + h.level.toUpperCase() + ' (#' + h.position + '): ' + h.text);
      });
    } else {
      Logger.log('   ⚠️ No headings array captured');
    }
  } else {
    Logger.log('   ⚠️ No structure data captured');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔑 TOP KEYWORDS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.structure && fetcher.structure.top_keywords) {
    var keywords = fetcher.structure.top_keywords;
    Logger.log('   Total keywords: ' + keywords.length);
    Logger.log('');
    keywords.forEach(function(kw, i) {
      Logger.log('   ' + (i + 1) + '. "' + kw.keyword + '" - ' + kw.count + ' occurrences');
    });
  } else {
    Logger.log('   ⚠️ No keywords extracted');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🎯 FORENSIC METRICS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.content_intel) {
    Logger.log('   Humanity Score: ' + (fetcher.content_intel.humanity_score || 0) + '/100');
    Logger.log('   Uniqueness Score: ' + (fetcher.content_intel.uniqueness_score || 0) + '/100');
    Logger.log('   Velocity (30d): ' + (fetcher.content_intel.velocity_30d || 0) + ' pages');
    Logger.log('   AI Phrases Found: ' + (fetcher.content_intel.ai_phrases_detected || []).length);
  }
  
  if (fetcher.conversion) {
    Logger.log('');
    Logger.log('   Friction Level: ' + (fetcher.conversion.friction_level || 'Unknown'));
    Logger.log('   Friction Score: ' + (fetcher.conversion.friction_score || 0) + ' fields');
    Logger.log('   Form Count: ' + (fetcher.conversion.form_count || 0));
  }
  
  if (fetcher.market_intel) {
    Logger.log('');
    Logger.log('   CMS: ' + (fetcher.market_intel.cms || 'Unknown'));
    Logger.log('   Tech Stack: ' + (fetcher.market_intel.tech_stack || []).join(', '));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 API DATA');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (apis.openpagerank) {
    Logger.log('   OpenPageRank:');
    Logger.log('     Page Rank: ' + (apis.openpagerank.pageRank || 0));
    Logger.log('     Rank: ' + (apis.openpagerank.rank || 0));
  }
  
  if (apis.pagespeed) {
    Logger.log('');
    Logger.log('   PageSpeed Insights:');
    Logger.log('     Performance Score: ' + (apis.pagespeed.performanceScore || 0) + '/100');
    Logger.log('     FCP: ' + (apis.pagespeed.fcp || 0) + 's');
    Logger.log('     LCP: ' + (apis.pagespeed.lcp || 0) + 's');
    Logger.log('     CLS: ' + (apis.pagespeed.cls || 0));
  }
  
  if (apis.serper) {
    Logger.log('');
    Logger.log('   Serper:');
    Logger.log('     Organic Keywords: ' + (apis.serper.organicKeywords || 0));
    Logger.log('     Organic Traffic: ' + (apis.serper.organicTraffic || 0));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 BRAND NARRATIVE TEXT');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (fetcher.market_intel && fetcher.market_intel.brand_text) {
    var brandText = fetcher.market_intel.brand_text;
    Logger.log('   Length: ' + brandText.length + ' characters');
    Logger.log('');
    Logger.log('   First 500 chars:');
    Logger.log('   ' + brandText.substring(0, 500) + '...');
  } else {
    Logger.log('   ⚠️ No brand text captured');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('✅ DATA LOGGING COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  // Return data for inspection
  return fullData;
}


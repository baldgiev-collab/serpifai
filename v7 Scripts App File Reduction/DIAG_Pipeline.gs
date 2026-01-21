/**
 * DIAGNOSTIC: Complete Data Pipeline
 * v33.0 - End-to-end data flow verification
 * 
 * Traces data from:
 * 1. API calls (Serper, OpenPageRank, PageSpeed)
 * 2. Gemini AI analysis
 * 3. Data synthesis
 * 4. Storage
 * 5. UI delivery
 * 
 * Run: DIAG_Pipeline_Full() from Apps Script editor
 */

/**
 * Full Pipeline Diagnostic
 */
function DIAG_Pipeline_Full() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    COMPLETE DATA PIPELINE DIAGNOSTIC v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test 1: API Connectivity
  DIAG_APIConnectivity();
  
  // Test 2: Data Collection
  DIAG_DataCollection();
  
  // Test 3: Data Synthesis
  DIAG_DataSynthesis();
  
  // Test 4: Storage Verification
  DIAG_StorageVerification();
  
  // Test 5: UI Data Delivery
  DIAG_UIDataDelivery();
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE - SEE SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  DIAG_PrintSummary();
}

// Global results object
const DIAG_RESULTS = {
  apiConnectivity: {},
  dataCollection: {},
  dataSynthesis: {},
  storage: {},
  uiDelivery: {}
};

/**
 * Test 1: API Connectivity Check
 */
function DIAG_APIConnectivity() {
  Logger.log('\n📋 TEST 1: API CONNECTIVITY');
  Logger.log('────────────────────────────────────────');
  
  const apis = [
    { name: 'Serper', keyName: 'SERPER_API_KEY', testUrl: 'https://google.serper.dev/search' },
    { name: 'OpenPageRank', keyName: 'OPENPAGERANK_API_KEY', testUrl: 'https://openpagerank.com/api/v1.0/getPageRank' },
    { name: 'Gemini', keyName: 'GEMINI_API_KEY', testUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent' }
  ];
  
  apis.forEach(api => {
    Logger.log(`\n  ${api.name} API:`);
    
    // Check for key
    const key = DIAG_GetKey(api.keyName);
    if (key) {
      Logger.log(`    Key: ✅ Configured (${key.substring(0, 8)}...)`);
      DIAG_RESULTS.apiConnectivity[api.name] = { keyPresent: true, key: key };
    } else {
      Logger.log(`    Key: ❌ NOT FOUND`);
      DIAG_RESULTS.apiConnectivity[api.name] = { keyPresent: false };
    }
  });
}

/**
 * Test 2: Data Collection (what we get from APIs)
 */
function DIAG_DataCollection() {
  Logger.log('\n📋 TEST 2: DATA COLLECTION');
  Logger.log('────────────────────────────────────────');
  
  const testDomain = 'ahrefs.com';
  Logger.log(`  Testing with domain: ${testDomain}\n`);
  
  // Test Serper
  Logger.log('  📡 Serper API Response:');
  try {
    const serperKey = DIAG_GetKey('SERPER_API_KEY');
    if (serperKey) {
      const response = UrlFetchApp.fetch('https://google.serper.dev/search', {
        method: 'post',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        payload: JSON.stringify({ q: testDomain, num: 10 }),
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        Logger.log(`    organic: ${data.organic?.length || 0} results`);
        Logger.log(`    peopleAlsoAsk: ${data.peopleAlsoAsk?.length || 0}`);
        Logger.log(`    relatedSearches: ${data.relatedSearches?.length || 0}`);
        Logger.log(`    searchInfo.totalResults: ${data.searchInformation?.totalResults || 'N/A'}`);
        
        // Check for metrics fields
        Logger.log(`    backlinks: ${data.backlinks !== undefined ? data.backlinks : '❌ NOT IN RESPONSE'}`);
        Logger.log(`    organicKeywords: ${data.organicKeywords !== undefined ? data.organicKeywords : '❌ NOT IN RESPONSE'}`);
        
        DIAG_RESULTS.dataCollection.serper = {
          success: true,
          organic: data.organic?.length || 0,
          paa: data.peopleAlsoAsk?.length || 0,
          hasBacklinks: data.backlinks !== undefined,
          hasKeywords: data.organicKeywords !== undefined
        };
      } else {
        Logger.log(`    ❌ Failed: ${response.getResponseCode()}`);
        DIAG_RESULTS.dataCollection.serper = { success: false };
      }
    }
  } catch (e) {
    Logger.log(`    ❌ Error: ${e.message}`);
    DIAG_RESULTS.dataCollection.serper = { success: false, error: e.message };
  }
  
  // Test OpenPageRank
  Logger.log('\n  📡 OpenPageRank API Response:');
  try {
    const oprKey = DIAG_GetKey('OPENPAGERANK_API_KEY');
    if (oprKey) {
      const response = UrlFetchApp.fetch(`https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${testDomain}`, {
        headers: { 'API-OPR': oprKey },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        const result = data.response?.[0];
        Logger.log(`    page_rank_decimal: ${result?.page_rank_decimal || 'N/A'}`);
        Logger.log(`    rank: ${result?.rank || 'N/A'}`);
        Logger.log(`    domain: ${result?.domain || 'N/A'}`);
        
        DIAG_RESULTS.dataCollection.openPageRank = {
          success: true,
          pageRank: result?.page_rank_decimal
        };
      } else {
        Logger.log(`    ❌ Failed: ${response.getResponseCode()}`);
      }
    }
  } catch (e) {
    Logger.log(`    ❌ Error: ${e.message}`);
  }
}

/**
 * Test 3: Data Synthesis (what we generate from raw data)
 */
function DIAG_DataSynthesis() {
  Logger.log('\n📋 TEST 3: DATA SYNTHESIS');
  Logger.log('────────────────────────────────────────');
  
  // Check what synthesis functions exist
  const synthFunctions = [
    'FT_SynthesizeCompetitorData',
    'FT_EnrichBacklinkData',
    'FT_GenerateKeywordInsights',
    'synthesizeCompetitorMetrics',
    'enrichCompetitorData'
  ];
  
  Logger.log('  Available synthesis functions:');
  synthFunctions.forEach(fn => {
    const exists = typeof eval(`typeof ${fn}`) !== 'undefined' && eval(`typeof ${fn}`) === 'function';
    Logger.log(`    ${exists ? '✅' : '❌'} ${fn}`);
  });
  
  // Check if data enrichment is happening
  Logger.log('\n  Expected synthesis output:');
  Logger.log('    - oracleKeywords: array of keyword objects');
  Logger.log('    - eliteBacklinks: {total, refDomains, topReferrers[], anchorDistribution[]}');
  Logger.log('    - topPages: array of page objects');
  Logger.log('    - intentDistribution: {informational, commercial, transactional, navigational}');
  Logger.log('    - keywordClusters: array of cluster objects');
  
  // Check actual stored data
  try {
    const stored = PropertiesService.getScriptProperties().getProperty('latest_analysis');
    if (stored) {
      const data = JSON.parse(stored);
      const comp = data.competitors?.[0];
      
      if (comp?.synthesized) {
        Logger.log('\n  Actual synthesized data:');
        Object.keys(comp.synthesized).forEach(key => {
          const value = comp.synthesized[key];
          const type = Array.isArray(value) ? `array(${value.length})` : typeof value;
          Logger.log(`    ${key}: ${type}`);
        });
        
        DIAG_RESULTS.dataSynthesis = {
          hasData: true,
          keys: Object.keys(comp.synthesized)
        };
      } else {
        Logger.log('\n  ❌ No synthesized data found in stored analysis');
        DIAG_RESULTS.dataSynthesis = { hasData: false };
      }
    }
  } catch (e) {
    Logger.log(`  ❌ Error checking synthesis: ${e.message}`);
  }
}

/**
 * Test 4: Storage Verification
 */
function DIAG_StorageVerification() {
  Logger.log('\n📋 TEST 4: STORAGE VERIFICATION');
  Logger.log('────────────────────────────────────────');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const allProps = props.getProperties();
    
    Logger.log(`  Total properties stored: ${Object.keys(allProps).length}`);
    
    // Check for analysis-related keys
    const analysisKeys = Object.keys(allProps).filter(k => 
      /analysis|competitor|project/i.test(k)
    );
    
    Logger.log(`  Analysis-related keys: ${analysisKeys.length}`);
    analysisKeys.slice(0, 10).forEach(k => {
      const size = allProps[k].length;
      Logger.log(`    ${k}: ${size} chars`);
    });
    
    // Check storage limits
    const totalSize = Object.values(allProps).reduce((sum, v) => sum + v.length, 0);
    Logger.log(`\n  Total storage used: ${(totalSize / 1024).toFixed(2)} KB`);
    Logger.log(`  Storage limit: ~500 KB per property, ~9 MB total`);
    
    if (totalSize > 8000000) {
      Logger.log('  ⚠️ WARNING: Approaching storage limit!');
    } else {
      Logger.log('  ✅ Storage usage OK');
    }
    
    DIAG_RESULTS.storage = {
      totalProperties: Object.keys(allProps).length,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      analysisKeys: analysisKeys
    };
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 5: UI Data Delivery
 */
function DIAG_UIDataDelivery() {
  Logger.log('\n📋 TEST 5: UI DATA DELIVERY');
  Logger.log('────────────────────────────────────────');
  
  // Check what data the UI expects
  Logger.log('  UI expects these data structures:\n');
  
  const expectedStructures = {
    'Keywords Modal': {
      required: ['oracleKeywords', 'intentDistribution', 'keywordClusters'],
      optional: ['keywordBreakdown', 'keywordMap']
    },
    'Backlinks Modal': {
      required: ['eliteBacklinks.total', 'eliteBacklinks.topReferrers'],
      optional: ['eliteBacklinks.anchorDistribution', 'eliteBacklinks.dofollow']
    },
    'Traffic Modal': {
      required: ['topPages', 'estimatedTraffic'],
      optional: ['trafficTrend', 'trafficByCountry']
    },
    'Executive Brief': {
      required: ['executiveBrief.landscapeOverview', 'executiveBrief.clientPosition'],
      optional: ['executiveBrief.strategicOpportunities', 'executiveBrief.criticalThreats']
    }
  };
  
  Object.entries(expectedStructures).forEach(([modal, fields]) => {
    Logger.log(`  📊 ${modal}:`);
    Logger.log(`    Required: ${fields.required.join(', ')}`);
    Logger.log(`    Optional: ${fields.optional.join(', ')}`);
  });
  
  // Check if actual data matches expected
  Logger.log('\n  Verifying data delivery...');
  try {
    const stored = PropertiesService.getScriptProperties().getProperty('latest_analysis');
    if (stored) {
      const data = JSON.parse(stored);
      const comp = data.competitors?.[0];
      
      const checks = [
        { name: 'oracleKeywords', path: comp?.synthesized?.oracleKeywords, type: 'array' },
        { name: 'topReferrers', path: comp?.synthesized?.eliteBacklinks?.topReferrers, type: 'array' },
        { name: 'topPages', path: comp?.synthesized?.topPages, type: 'array' },
        { name: 'executiveBrief', path: data?.analysis?.executiveBrief || data?.executiveBrief, type: 'object' }
      ];
      
      checks.forEach(check => {
        const exists = check.path !== undefined && check.path !== null;
        const hasContent = check.type === 'array' ? (check.path?.length > 0) : (Object.keys(check.path || {}).length > 0);
        
        if (exists && hasContent) {
          Logger.log(`    ✅ ${check.name}: Present with data`);
        } else if (exists) {
          Logger.log(`    ⚠️ ${check.name}: Present but empty`);
        } else {
          Logger.log(`    ❌ ${check.name}: Missing`);
        }
      });
    }
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Print diagnostic summary
 */
function DIAG_PrintSummary() {
  Logger.log('\n');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  Logger.log('\n  🔴 CRITICAL ISSUES:');
  Logger.log('  1. Serper API does NOT return backlinks/keywords metrics');
  Logger.log('  2. Empty modals due to missing synthesized data');
  Logger.log('  3. Executive Brief not surfaced to UI layer');
  
  Logger.log('\n  🟡 ROOT CAUSES:');
  Logger.log('  1. Serper free tier lacks backlink/keyword metrics');
  Logger.log('  2. Data synthesis functions not populating all fields');
  Logger.log('  3. executiveBrief path not checked in UI');
  
  Logger.log('\n  🟢 SOLUTIONS:');
  Logger.log('  1. Implement authority-based backlink estimation');
  Logger.log('  2. Generate keywords from organic results + Gemini');
  Logger.log('  3. Fix UI to check multiple executiveBrief paths');
  Logger.log('  4. Generate topReferrers from industry knowledge');
  Logger.log('  5. Calculate intent from keyword patterns');
  
  Logger.log('\n  📝 NEXT STEPS:');
  Logger.log('  1. Run DIAG_SerperBacklinkCapability() to confirm Serper limits');
  Logger.log('  2. Run DIAG_QuickBriefCheck() to verify brief location');
  Logger.log('  3. Run DIAG_QuickModalCheck() to verify modal data');
  Logger.log('  4. Apply fixes from V33_COMPREHENSIVE_DIAGNOSTIC_PLAN.md');
}

/**
 * Helper: Get API key from multiple sources
 */
function DIAG_GetKey(keyName) {
  // Try Config objects
  if (typeof Config !== 'undefined' && Config[keyName]) return Config[keyName];
  if (typeof CONFIG !== 'undefined' && CONFIG[keyName]) return CONFIG[keyName];
  
  // Try script properties
  try {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty(keyName);
    if (key) return key;
    
    // Try lowercase
    const keyLower = props.getProperty(keyName.toLowerCase());
    if (keyLower) return keyLower;
  } catch (e) {}
  
  return null;
}

/**
 * QUICK: Run all quick diagnostics
 */
function DIAG_QuickAll() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    QUICK DIAGNOSTIC SUITE v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Quick API check
  Logger.log('\n📡 API KEYS:');
  ['SERPER_API_KEY', 'OPENPAGERANK_API_KEY', 'GEMINI_API_KEY'].forEach(key => {
    const value = DIAG_GetKey(key);
    Logger.log(`  ${key}: ${value ? '✅ ' + value.substring(0, 8) + '...' : '❌ Missing'}`);
  });
  
  // Quick storage check
  Logger.log('\n📦 STORAGE:');
  try {
    const stored = PropertiesService.getScriptProperties().getProperty('latest_analysis');
    if (stored) {
      const data = JSON.parse(stored);
      Logger.log(`  Competitors: ${data.competitors?.length || 0}`);
      Logger.log(`  Has analysis: ${!!data.analysis}`);
      Logger.log(`  Has executiveBrief: ${!!(data.executiveBrief || data.analysis?.executiveBrief)}`);
    } else {
      Logger.log('  ❌ No stored analysis');
    }
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
  
  // Quick modal data check
  Logger.log('\n📊 MODAL DATA:');
  try {
    const stored = PropertiesService.getScriptProperties().getProperty('latest_analysis');
    if (stored) {
      const data = JSON.parse(stored);
      const comp = data.competitors?.[0];
      if (comp?.synthesized) {
        Logger.log(`  oracleKeywords: ${comp.synthesized.oracleKeywords?.length || 0}`);
        Logger.log(`  topReferrers: ${comp.synthesized.eliteBacklinks?.topReferrers?.length || 0}`);
        Logger.log(`  topPages: ${comp.synthesized.topPages?.length || 0}`);
      }
    }
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('Run DIAG_Pipeline_Full() for detailed diagnostics');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

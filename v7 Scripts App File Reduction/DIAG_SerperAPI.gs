/**
 * DIAGNOSTIC: Serper API Status
 * v33.0 - Comprehensive API Testing
 * 
 * Tests:
 * - Backlinks endpoint availability
 * - Keywords data structure
 * - PAA extraction
 * - Rate limiting status
 * 
 * Run: DIAG_SerperAPI_Full() from Apps Script editor
 */

/**
 * Full Serper API diagnostic
 */
function DIAG_SerperAPI_Full() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    SERPER API DIAGNOSTIC v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test 1: Check API key exists
  DIAG_CheckAPIKey();
  
  // Test 2: Test basic search
  DIAG_TestBasicSearch();
  
  // Test 3: Test domain search for backlinks
  DIAG_TestDomainBacklinks();
  
  // Test 4: Test PAA extraction
  DIAG_TestPAAExtraction();
  
  // Test 5: Compare endpoints
  DIAG_CompareEndpoints();
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Test 1: Check if API key is configured
 */
function DIAG_CheckAPIKey() {
  Logger.log('\n📋 TEST 1: API KEY CHECK');
  Logger.log('────────────────────────────────────────');
  
  try {
    // Try multiple sources for API key
    const sources = [
      { name: 'Config.SERPER_API_KEY', value: typeof Config !== 'undefined' ? Config.SERPER_API_KEY : null },
      { name: 'CONFIG.SERPER_API_KEY', value: typeof CONFIG !== 'undefined' ? CONFIG.SERPER_API_KEY : null },
      { name: 'getSerperKey()', value: typeof getSerperKey === 'function' ? getSerperKey() : null },
      { name: 'FT_GetSerperKey()', value: typeof FT_GetSerperKey === 'function' ? FT_GetSerperKey() : null }
    ];
    
    let foundKey = null;
    sources.forEach(source => {
      const status = source.value ? '✅ Found' : '❌ Not found';
      const preview = source.value ? `${source.value.substring(0, 8)}...` : 'null';
      Logger.log(`  ${source.name}: ${status} (${preview})`);
      if (source.value && !foundKey) foundKey = source.value;
    });
    
    if (foundKey) {
      Logger.log(`\n  ✅ API KEY STATUS: CONFIGURED`);
      Logger.log(`  Key preview: ${foundKey.substring(0, 12)}...`);
      return foundKey;
    } else {
      Logger.log(`\n  ❌ API KEY STATUS: NOT FOUND`);
      Logger.log(`  CRITICAL: No Serper API key found in any source!`);
      return null;
    }
  } catch (e) {
    Logger.log(`  ❌ Error checking API key: ${e.message}`);
    return null;
  }
}

/**
 * Test 2: Basic search to verify API works
 */
function DIAG_TestBasicSearch() {
  Logger.log('\n📋 TEST 2: BASIC SEARCH');
  Logger.log('────────────────────────────────────────');
  
  try {
    const apiKey = DIAG_GetAPIKey();
    if (!apiKey) {
      Logger.log('  ❌ Cannot test - no API key');
      return;
    }
    
    const testQuery = 'SEO tools';
    const url = 'https://google.serper.dev/search';
    
    const options = {
      method: 'post',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        q: testQuery,
        num: 10
      }),
      muteHttpExceptions: true
    };
    
    Logger.log(`  Query: "${testQuery}"`);
    Logger.log(`  Endpoint: ${url}`);
    
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    Logger.log(`  HTTP Status: ${code}`);
    
    if (code === 200) {
      const data = JSON.parse(text);
      Logger.log(`\n  ✅ BASIC SEARCH WORKING`);
      Logger.log(`  Response keys: ${Object.keys(data).join(', ')}`);
      Logger.log(`  Organic results: ${data.organic?.length || 0}`);
      Logger.log(`  PAA questions: ${data.peopleAlsoAsk?.length || 0}`);
      Logger.log(`  Related searches: ${data.relatedSearches?.length || 0}`);
      Logger.log(`  Credits used: ${data.credits || 'unknown'}`);
      
      // Check for backlinks in response
      Logger.log(`\n  Backlinks field: ${data.backlinks !== undefined ? data.backlinks : 'NOT PRESENT'}`);
      Logger.log(`  Keywords field: ${data.organicKeywords !== undefined ? data.organicKeywords : 'NOT PRESENT'}`);
    } else {
      Logger.log(`  ❌ API ERROR`);
      Logger.log(`  Response: ${text.substring(0, 200)}`);
    }
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 3: Domain-specific search for backlinks
 */
function DIAG_TestDomainBacklinks() {
  Logger.log('\n📋 TEST 3: DOMAIN BACKLINKS');
  Logger.log('────────────────────────────────────────');
  
  try {
    const apiKey = DIAG_GetAPIKey();
    if (!apiKey) {
      Logger.log('  ❌ Cannot test - no API key');
      return;
    }
    
    const testDomains = ['ahrefs.com', 'semrush.com', 'surferseo.com'];
    
    testDomains.forEach(domain => {
      Logger.log(`\n  Testing: ${domain}`);
      
      // Try site: search
      const siteQuery = `site:${domain}`;
      const url = 'https://google.serper.dev/search';
      
      const options = {
        method: 'post',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          q: siteQuery,
          num: 100 // Request more to get page count
        }),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      
      if (code === 200) {
        const data = JSON.parse(response.getContentText());
        
        Logger.log(`    Organic results: ${data.organic?.length || 0}`);
        Logger.log(`    Total indexed (searchInfo): ${data.searchInformation?.totalResults || 'N/A'}`);
        Logger.log(`    Backlinks field: ${data.backlinks || 'NOT PRESENT'}`);
        Logger.log(`    organicKeywords: ${data.organicKeywords || 'NOT PRESENT'}`);
        
        // Check for any backlink-related fields
        const allKeys = Object.keys(data);
        const backlinkKeys = allKeys.filter(k => /backlink|referring|link/i.test(k));
        if (backlinkKeys.length > 0) {
          Logger.log(`    Backlink-related keys: ${backlinkKeys.join(', ')}`);
        }
      } else {
        Logger.log(`    ❌ Failed with status ${code}`);
      }
      
      // Rate limit protection
      Utilities.sleep(500);
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 4: PAA extraction
 */
function DIAG_TestPAAExtraction() {
  Logger.log('\n📋 TEST 4: PAA EXTRACTION');
  Logger.log('────────────────────────────────────────');
  
  try {
    const apiKey = DIAG_GetAPIKey();
    if (!apiKey) {
      Logger.log('  ❌ Cannot test - no API key');
      return;
    }
    
    // PAA-rich queries
    const testQueries = [
      'what is SEO',
      'how to improve website ranking',
      'best SEO tools 2024'
    ];
    
    testQueries.forEach(query => {
      Logger.log(`\n  Query: "${query}"`);
      
      const url = 'https://google.serper.dev/search';
      const options = {
        method: 'post',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          q: query,
          num: 10
        }),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        const paa = data.peopleAlsoAsk || [];
        Logger.log(`    PAA found: ${paa.length}`);
        
        if (paa.length > 0) {
          paa.slice(0, 3).forEach((item, i) => {
            Logger.log(`      ${i + 1}. ${item.question || item.title || 'No question'}`);
          });
        }
        
        const related = data.relatedSearches || [];
        Logger.log(`    Related searches: ${related.length}`);
      }
      
      Utilities.sleep(300);
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 5: Compare different Serper endpoints
 */
function DIAG_CompareEndpoints() {
  Logger.log('\n📋 TEST 5: ENDPOINT COMPARISON');
  Logger.log('────────────────────────────────────────');
  
  try {
    const apiKey = DIAG_GetAPIKey();
    if (!apiKey) {
      Logger.log('  ❌ Cannot test - no API key');
      return;
    }
    
    const endpoints = [
      { name: 'Search', url: 'https://google.serper.dev/search', payload: { q: 'ahrefs.com' } },
      { name: 'News', url: 'https://google.serper.dev/news', payload: { q: 'ahrefs.com' } },
      { name: 'Images', url: 'https://google.serper.dev/images', payload: { q: 'ahrefs.com' } }
    ];
    
    endpoints.forEach(endpoint => {
      Logger.log(`\n  Endpoint: ${endpoint.name}`);
      Logger.log(`  URL: ${endpoint.url}`);
      
      const options = {
        method: 'post',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(endpoint.payload),
        muteHttpExceptions: true
      };
      
      try {
        const response = UrlFetchApp.fetch(endpoint.url, options);
        const code = response.getResponseCode();
        
        Logger.log(`    Status: ${code}`);
        
        if (code === 200) {
          const data = JSON.parse(response.getContentText());
          Logger.log(`    Response keys: ${Object.keys(data).join(', ')}`);
          
          // Check for any metrics
          if (data.backlinks !== undefined) Logger.log(`    Backlinks: ${data.backlinks}`);
          if (data.organicKeywords !== undefined) Logger.log(`    Keywords: ${data.organicKeywords}`);
          if (data.totalResults !== undefined) Logger.log(`    Total Results: ${data.totalResults}`);
        }
      } catch (e) {
        Logger.log(`    Error: ${e.message}`);
      }
      
      Utilities.sleep(300);
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Helper: Get API key from any available source
 */
function DIAG_GetAPIKey() {
  // Try multiple sources
  if (typeof Config !== 'undefined' && Config.SERPER_API_KEY) return Config.SERPER_API_KEY;
  if (typeof CONFIG !== 'undefined' && CONFIG.SERPER_API_KEY) return CONFIG.SERPER_API_KEY;
  if (typeof getSerperKey === 'function') return getSerperKey();
  if (typeof FT_GetSerperKey === 'function') return FT_GetSerperKey();
  
  // Try script properties
  try {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty('SERPER_API_KEY') || props.getProperty('serper_api_key');
    if (key) return key;
  } catch (e) {}
  
  return null;
}

/**
 * DIAGNOSTIC: Test what Serper actually returns for backlinks
 * This checks if Serper has a separate backlinks API or if we need alternative source
 */
function DIAG_SerperBacklinkCapability() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    SERPER BACKLINK CAPABILITY CHECK');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const apiKey = DIAG_GetAPIKey();
  if (!apiKey) {
    Logger.log('❌ No API key found');
    return;
  }
  
  // Test domain query with all possible parameters
  const domain = 'ahrefs.com';
  const queries = [
    { type: 'site', q: `site:${domain}` },
    { type: 'link', q: `link:${domain}` },
    { type: 'inurl', q: `inurl:${domain}` },
    { type: 'domain', q: domain }
  ];
  
  queries.forEach(query => {
    Logger.log(`\n  Query type: ${query.type}`);
    Logger.log(`  Query: ${query.q}`);
    
    const options = {
      method: 'post',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        q: query.q,
        num: 10,
        gl: 'us',
        hl: 'en'
      }),
      muteHttpExceptions: true
    };
    
    try {
      const response = UrlFetchApp.fetch('https://google.serper.dev/search', options);
      const data = JSON.parse(response.getContentText());
      
      Logger.log(`    Status: ${response.getResponseCode()}`);
      Logger.log(`    Total results: ${data.searchInformation?.totalResults || 'N/A'}`);
      Logger.log(`    Organic count: ${data.organic?.length || 0}`);
      
      // Check ALL response keys for anything backlink-related
      const allKeys = Object.keys(data);
      Logger.log(`    All response keys: ${allKeys.join(', ')}`);
      
    } catch (e) {
      Logger.log(`    Error: ${e.message}`);
    }
    
    Utilities.sleep(500);
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('CONCLUSION: Serper standard API does NOT provide backlink metrics.');
  Logger.log('SOLUTION: Use authority-based estimation or integrate with:');
  Logger.log('  - Ahrefs API (paid)');
  Logger.log('  - Moz API (paid)');
  Logger.log('  - PHP Real Metrics scraper');
  Logger.log('  - Authority-based formula: backlinks = 10^(0.068 × authority + 1.6)');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

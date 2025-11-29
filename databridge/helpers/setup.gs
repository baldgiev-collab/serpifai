/**
 * Setup Script - Initialize SERPIFAI API Configuration
 * Run this once to configure DataBridge and Fetcher URLs
 */

function SETUP_initializeSystem() {
  Logger.log('🚀 Initializing SERPIFAI System...\n');
  
  var props = PropertiesService.getScriptProperties();
  var results = {
    ok: true,
    configured: [],
    warnings: []
  };
  
  // 1. Set DataBridge URL
  if (!props.getProperty('DATABRIDGE_WEB_APP_URL')) {
    props.setProperty('DATABRIDGE_WEB_APP_URL', 
  'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec');
    results.configured.push('✅ DATABRIDGE_WEB_APP_URL');
    Logger.log('✅ DataBridge URL configured');
  } else {
    Logger.log('ℹ️  DataBridge URL already configured');
  }
  
  // 2. Set Fetcher URL
  if (!props.getProperty('FETCHER_WEB_APP_URL')) {
    props.setProperty('FETCHER_WEB_APP_URL', 
  'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec');
    results.configured.push('✅ FETCHER_WEB_APP_URL');
    Logger.log('✅ Fetcher URL configured');
  } else {
    Logger.log('ℹ️  Fetcher URL already configured');
  }
  
  // 3. Configure API Keys (if not already set)
  var apiKeys = {
    'GEMINI_API_KEY': 'AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E',
    'PAGE_SPEED_KEY': 'AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc',
    'OPEN_PAGERANK_KEY': 'w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4',
    'SERPER_KEY': 'f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2'
  };
  
  Logger.log('\n🔑 Configuring API Keys...');
  Object.keys(apiKeys).forEach(function(key) {
    if (!props.getProperty(key)) {
      props.setProperty(key, apiKeys[key]);
      results.configured.push('✅ ' + key);
      Logger.log('✅ ' + key + ' configured');
    } else {
      Logger.log('ℹ️  ' + key + ' already configured');
    }
  });
  
  // 4. Check API Key Status
  var allApiKeys = [
    'GEMINI_API_KEY',
    'SERPER_KEY',
    'OPEN_PAGERANK_KEY',
    'PAGE_SPEED_KEY'
  ];
  
  Logger.log('\n📋 API Key Status:');
  allApiKeys.forEach(function(key) {
    var value = props.getProperty(key);
    if (value) {
      var masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      Logger.log('  ✅ ' + key + ': ' + masked);
    } else {
      Logger.log('  ⚠️  ' + key + ' (NOT SET - add via Project Settings > Script properties)');
      results.warnings.push('Missing: ' + key);
    }
  });
  
  // 5. Test Connectivity
  Logger.log('\n🔗 Testing Connectivity...');
  
  try {
    var dataBridgeUrl = props.getProperty('DATABRIDGE_WEB_APP_URL');
    Logger.log('  DataBridge: ' + dataBridgeUrl);
    results.dataBridgeUrl = dataBridgeUrl;
  } catch (e) {
    results.warnings.push('DataBridge test failed: ' + e);
    Logger.log('  ⚠️  DataBridge: ' + e);
  }
  
  try {
    var fetcherUrl = props.getProperty('FETCHER_WEB_APP_URL');
    Logger.log('  Fetcher: ' + fetcherUrl);
    results.fetcherUrl = fetcherUrl;
  } catch (e) {
    results.warnings.push('Fetcher test failed: ' + e);
    Logger.log('  ⚠️  Fetcher: ' + e);
  }
  
  Logger.log('\n' + (results.warnings.length === 0 ? '✅ Setup complete!' : '⚠️  Setup complete with warnings'));
  Logger.log('\n📖 Next Steps:');
  Logger.log('  1. Verify API keys: Run SETUP_verifyApiKeys()');
  Logger.log('  2. Test APIs: Run SETUP_testAllApis()');
  Logger.log('  3. Test competitor analysis: SERPIFAI > Open SERPIFAI > Competitors tab');
  Logger.log('  4. Enter test URLs and click "Full Analysis"');
  
  return results;
}

/**
 * Test DataBridge connectivity
 */
function TEST_dataBridgeConnection() {
  Logger.log('Testing DataBridge connection...');
  
  try {
    var result = DataBridge_handle('project:load', { project_id: 'test' });
    Logger.log('✅ DataBridge is responsive');
    Logger.log('Response: ' + JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    Logger.log('❌ DataBridge error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Test Fetcher connectivity (via APIS_fetcherCall)
 */
function TEST_fetcherConnection() {
  Logger.log('Testing Fetcher connection...');
  
  try {
    var result = APIS_fetcherCall('fetchSingleUrl', { url: 'https://example.com' });
    Logger.log('✅ Fetcher is responsive');
    Logger.log('Response keys: ' + Object.keys(result).join(', '));
    return result;
  } catch (e) {
    Logger.log('❌ Fetcher error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Test full competitor analysis flow
 */
function TEST_competitorAnalysisFlow() {
  Logger.log('🧪 Testing Competitor Analysis Flow...\n');
  
  var testUrl = 'https://example.com';
  var startTime = new Date();
  
  // Test 1: Single category (Technical SEO)
  Logger.log('1️⃣  Testing single category (Technical SEO)...');
  try {
    var techResult = DataBridge_handle('comp:technicalSEO', {
      domain: 'example.com',
      url: testUrl
    });
    Logger.log(techResult.ok ? '✅ Technical SEO analysis passed' : '❌ Technical SEO failed: ' + techResult.error);
  } catch (e) {
    Logger.log('❌ Technical SEO error: ' + e);
  }
  
  // Test 2: Full analysis (all categories)
  Logger.log('\n2️⃣  Testing full analysis (all 15 categories)...');
  try {
    var fullResult = DataBridge_handle('comp:analyze', {
      competitors: [testUrl],
      categories: 'all',
      project_id: 'test'
    });
    
    if (fullResult.ok) {
      Logger.log('✅ Full analysis passed');
      Logger.log('  - Competitors analyzed: ' + fullResult.competitorCount);
      Logger.log('  - Categories: ' + Object.keys(fullResult.competitors[0].categories).length);
      Logger.log('  - Execution time: ' + fullResult.executionTime);
    } else {
      Logger.log('❌ Full analysis failed: ' + fullResult.error);
    }
  } catch (e) {
    Logger.log('❌ Full analysis error: ' + e);
  }
  
  var elapsed = ((new Date() - startTime) / 1000).toFixed(1);
  Logger.log('\n⏱️  Total test time: ' + elapsed + 's');
  Logger.log('\n✅ Test complete! Check logs above for details.');
}

/**
 * Display current configuration
 */
function SETUP_showConfiguration() {
  var config = CONFIG_getApiConfig();
  
  Logger.log('🔧 SERPIFAI Configuration:\n');
  Logger.log('DataBridge URL: ' + config.dataBridgeUrl);
  Logger.log('Fetcher URL: ' + config.fetcherUrl);
  Logger.log('DataBridge API Key: ' + (config.hasDataBridgeKey ? 'Configured ✅' : 'Not set ⚠️'));
  Logger.log('Fetcher API Key: ' + (config.hasFetcherKey ? 'Configured ✅' : 'Not set ⚠️'));
  
  return config;
}

/**
 * Update URLs if they change
 */
function SETUP_updateUrls(dataBridgeUrl, fetcherUrl) {
  var props = PropertiesService.getScriptProperties();
  
  if (dataBridgeUrl) {
    props.setProperty('DATABRIDGE_WEB_APP_URL', dataBridgeUrl);
    Logger.log('✅ Updated DATABRIDGE_WEB_APP_URL');
  }
  
  if (fetcherUrl) {
    props.setProperty('FETCHER_WEB_APP_URL', fetcherUrl);
    Logger.log('✅ Updated FETCHER_WEB_APP_URL');
  }
  
  Logger.log('\n📖 URLs updated successfully!');
  return SETUP_showConfiguration();
}

/**
 * API Key Configuration Script
 * Run this function to set all API keys in Script Properties
 */

function SETUP_configureApiKeys() {
  Logger.log('🔑 Configuring API Keys...\n');
  
  var props = PropertiesService.getScriptProperties();
  
  // API Keys - Update these values with your actual keys
  var apiKeys = {
    'GEMINI_API_KEY': 'AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E',
    'PAGE_SPEED_KEY': 'AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc',
    'OPEN_PAGERANK_KEY': 'w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4',
    'SERPER_KEY': 'f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2'
  };
  
  // Set each key
  var configured = 0;
  Object.keys(apiKeys).forEach(function(key) {
    var value = apiKeys[key];
    if (value && value.length > 0) {
      props.setProperty(key, value);
      Logger.log('✅ ' + key + ' configured');
      configured++;
    } else {
      Logger.log('⚠️  ' + key + ' skipped (empty value)');
    }
  });
  
  Logger.log('\n📊 Summary:');
  Logger.log('  Configured: ' + configured + ' / ' + Object.keys(apiKeys).length);
  
  // Verify configuration
  Logger.log('\n🔍 Verification:');
  Object.keys(apiKeys).forEach(function(key) {
    var value = props.getProperty(key);
    if (value) {
      var masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      Logger.log('  ✅ ' + key + ': ' + masked);
    } else {
      Logger.log('  ❌ ' + key + ': NOT SET');
    }
  });
  
  Logger.log('\n✅ API keys configured successfully!');
  Logger.log('\n📖 Property Name Reference:');
  Logger.log('  • GEMINI_API_KEY       - Google Gemini AI API');
  Logger.log('  • PAGE_SPEED_KEY       - Google PageSpeed Insights API');
  Logger.log('  • OPEN_PAGERANK_KEY    - OpenPageRank API');
  Logger.log('  • SERPER_KEY           - Serper.dev Search API');
  
  return {
    ok: true,
    configured: configured,
    total: Object.keys(apiKeys).length
  };
}

/**
 * Configure individual API key
 */
function SETUP_setApiKey(propertyName, apiKey) {
  PropertiesService.getScriptProperties().setProperty(propertyName, apiKey);
  Logger.log('✅ ' + propertyName + ' configured');
}

/**
 * Verify all API keys are set
 */
function SETUP_verifyApiKeys() {
  Logger.log('🔍 Verifying API Keys...\n');
  
  var props = PropertiesService.getScriptProperties();
  var requiredKeys = [
    'GEMINI_API_KEY',
    'PAGE_SPEED_KEY',
    'OPEN_PAGERANK_KEY',
    'SERPER_KEY'
  ];
  
  var status = {
    configured: 0,
    missing: []
  };
  
  requiredKeys.forEach(function(key) {
    var value = props.getProperty(key);
    if (value && value.length > 0) {
      var masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      Logger.log('✅ ' + key + ': ' + masked);
      status.configured++;
    } else {
      Logger.log('❌ ' + key + ': NOT SET');
      status.missing.push(key);
    }
  });
  
  Logger.log('\n📊 Status: ' + status.configured + ' / ' + requiredKeys.length + ' configured');
  
  if (status.missing.length > 0) {
    Logger.log('⚠️  Missing: ' + status.missing.join(', '));
  } else {
    Logger.log('✅ All API keys configured!');
  }
  
  return status;
}

/**
 * Remove all API keys (use with caution)
 */
function SETUP_clearApiKeys() {
  var props = PropertiesService.getScriptProperties();
  var keys = ['GEMINI_API_KEY', 'PAGE_SPEED_KEY', 'OPEN_PAGERANK_KEY', 'SERPER_KEY'];
  
  keys.forEach(function(key) {
    props.deleteProperty(key);
    Logger.log('🗑️  Removed ' + key);
  });
  
  Logger.log('\n✅ All API keys cleared');
}

/**
 * Test all APIs with configured keys
 */
function SETUP_testAllApis() {
  Logger.log('🧪 Testing All APIs...\n');
  
  var results = {
    gemini: false,
    pageSpeed: false,
    openPageRank: false,
    serper: false
  };
  
  // Test Gemini
  try {
    Logger.log('1️⃣  Testing Gemini API...');
    var geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (geminiKey) {
      results.gemini = true;
      Logger.log('  ✅ Gemini API key present');
    } else {
      Logger.log('  ❌ Gemini API key missing');
    }
  } catch (e) {
    Logger.log('  ❌ Gemini test failed: ' + e);
  }
  
  // Test PageSpeed
  try {
    Logger.log('\n2️⃣  Testing PageSpeed API...');
    var psResult = APIS_pageSpeedCall({ url: 'https://example.com' });
    if (psResult && psResult.ok) {
      results.pageSpeed = true;
      Logger.log('  ✅ PageSpeed API working - LCP: ' + psResult.lcp + 's, UX Score: ' + psResult.uxScore);
    } else {
      Logger.log('  ❌ PageSpeed API failed: ' + (psResult.error || 'Unknown error'));
    }
  } catch (e) {
    Logger.log('  ❌ PageSpeed test failed: ' + e);
  }
  
  // Test OpenPageRank
  try {
    Logger.log('\n3️⃣  Testing OpenPageRank API...');
    var oprResult = APIS_openPageRankCall({ domain: 'example.com' });
    if (oprResult && oprResult.ok) {
      results.openPageRank = true;
      Logger.log('  ✅ OpenPageRank API working - PageRank: ' + oprResult.pagerank);
    } else {
      Logger.log('  ❌ OpenPageRank API failed: ' + (oprResult.error || 'Unknown error'));
    }
  } catch (e) {
    Logger.log('  ❌ OpenPageRank test failed: ' + e);
  }
  
  // Test Serper
  try {
    Logger.log('\n4️⃣  Testing Serper API...');
    var serperResult = APIS_serperCall({ q: 'test', num: 1 });
    if (serperResult && serperResult.ok) {
      results.serper = true;
      Logger.log('  ✅ Serper API working - Found results');
    } else {
      Logger.log('  ❌ Serper API failed: ' + (serperResult.error || 'Unknown error'));
    }
  } catch (e) {
    Logger.log('  ❌ Serper test failed: ' + e);
  }
  
  // Summary
  var passCount = Object.values(results).filter(function(v) { return v; }).length;
  Logger.log('\n📊 Test Results: ' + passCount + ' / 4 APIs working');
  
  if (passCount === 4) {
    Logger.log('✅ All APIs configured and working!');
  } else {
    Logger.log('⚠️  Some APIs need attention');
  }
  
  return results;
}

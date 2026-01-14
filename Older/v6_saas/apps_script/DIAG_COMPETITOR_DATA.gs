/**
 * DIAGNOSTIC: Check why competitor data shows sample values
 * Run this in Apps Script to identify the issue
 */
function DIAG_whyFakeData() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔍 DIAGNOSTIC: Why Competitor Data Shows Sample Values');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Step 1: Check API Keys
  Logger.log('📋 STEP 1: Checking API Keys Configuration...');
  Logger.log('');
  
  const props = PropertiesService.getScriptProperties();
  const requiredKeys = {
    'GOOGLE_API_KEY': 'Google API Key (for Custom Search & PageSpeed)',
    'GOOGLE_SEARCH_ENGINE_ID': 'Google Custom Search Engine ID',
    'SERPER_API_KEY': 'Serper API Key (optional if using gateway)'
  };
  
  let keysConfigured = 0;
  let keysMissing = 0;
  
  for (const [key, description] of Object.entries(requiredKeys)) {
    const value = props.getProperty(key);
    if (value) {
      Logger.log(`   ✅ ${key}: Configured (${value.substring(0, 10)}...)`);
      keysConfigured++;
    } else {
      Logger.log(`   ❌ ${key}: MISSING! (${description})`);
      keysMissing++;
    }
  }
  
  Logger.log('');
  Logger.log(`   Summary: ${keysConfigured}/3 keys configured, ${keysMissing} missing`);
  Logger.log('');
  
  // Step 2: Test Gateway Connection
  Logger.log('📋 STEP 2: Testing PHP Gateway Connection...');
  Logger.log('');
  
  try {
    const gatewayResult = callGateway('check_status', {});
    if (gatewayResult && gatewayResult.success) {
      Logger.log('   ✅ Gateway: Connected and working');
      Logger.log('      Response:', JSON.stringify(gatewayResult).substring(0, 100));
    } else {
      Logger.log('   ❌ Gateway: Failed or returned error');
      Logger.log('      Error:', gatewayResult.error || 'Unknown');
    }
  } catch (e) {
    Logger.log('   ❌ Gateway: Exception thrown');
    Logger.log('      Error:', e.toString());
  }
  
  Logger.log('');
  
  // Step 3: Test Google Custom Search API
  Logger.log('📋 STEP 3: Testing Google Custom Search API...');
  Logger.log('');
  
  const apiKey = props.getProperty('GOOGLE_API_KEY');
  const searchEngineId = props.getProperty('GOOGLE_SEARCH_ENGINE_ID');
  
  if (!apiKey || !searchEngineId) {
    Logger.log('   ⚠️ Cannot test - API key or Search Engine ID missing');
  } else {
    try {
      const testUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=site:google.com&num=1`;
      const response = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
      const code = response.getResponseCode();
      
      if (code === 200) {
        const data = JSON.parse(response.getContentText());
        Logger.log('   ✅ Custom Search: Working');
        Logger.log('      Test query returned:', data.searchInformation?.totalResults || 0, 'results');
      } else {
        Logger.log('   ❌ Custom Search: HTTP ' + code);
        Logger.log('      Response:', response.getContentText().substring(0, 200));
      }
    } catch (e) {
      Logger.log('   ❌ Custom Search: Exception');
      Logger.log('      Error:', e.toString());
    }
  }
  
  Logger.log('');
  
  // Step 4: Test PageSpeed API
  Logger.log('📋 STEP 4: Testing PageSpeed Insights API...');
  Logger.log('');
  
  if (!apiKey) {
    Logger.log('   ⚠️ Cannot test - API key missing');
  } else {
    try {
      const testUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=${apiKey}&strategy=mobile`;
      const response = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
      const code = response.getResponseCode();
      
      if (code === 200) {
        const data = JSON.parse(response.getContentText());
        const perfScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
        Logger.log('   ✅ PageSpeed: Working');
        Logger.log('      Test returned performance score:', perfScore);
      } else {
        Logger.log('   ❌ PageSpeed: HTTP ' + code);
        Logger.log('      Response:', response.getContentText().substring(0, 200));
      }
    } catch (e) {
      Logger.log('   ❌ PageSpeed: Exception');
      Logger.log('      Error:', e.toString());
    }
  }
  
  Logger.log('');
  
  // Step 5: Test Actual Competitor Fetch
  Logger.log('📋 STEP 5: Testing Actual Competitor Data Fetch...');
  Logger.log('');
  
  if (keysMissing > 0) {
    Logger.log('   ⚠️ Skipping - API keys not fully configured');
  } else {
    try {
      Logger.log('   Testing with domain: toptal.com');
      const fetchResult = FT_fetchCompetitorViaAPI('toptal.com', {});
      
      if (fetchResult && fetchResult.ok) {
        Logger.log('   ✅ Competitor Fetch: SUCCESS!');
        Logger.log('      Method:', fetchResult.method);
        Logger.log('      Data sources:');
        
        if (fetchResult.data.search) {
          Logger.log('         ✓ Custom Search: ' + (fetchResult.data.search.totalResults || 0) + ' indexed pages');
        }
        if (fetchResult.data.pageSpeed && !fetchResult.data.pageSpeed.error) {
          Logger.log('         ✓ PageSpeed: Score ' + (fetchResult.data.pageSpeed.performanceScore || 0));
        }
        if (fetchResult.data.serper) {
          Logger.log('         ✓ Serper: ' + (fetchResult.data.serper.resultsCount || 0) + ' results');
        }
        
        Logger.log('      Synthesized data available:', !!fetchResult.synthesized);
      } else {
        Logger.log('   ❌ Competitor Fetch: FAILED');
        Logger.log('      Error:', fetchResult.error || 'Unknown');
        Logger.log('      This is why you see sample data!');
      }
    } catch (e) {
      Logger.log('   ❌ Competitor Fetch: Exception');
      Logger.log('      Error:', e.toString());
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSTIC SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  if (keysMissing === 0) {
    Logger.log('✅ All API keys configured - APIs should work');
    Logger.log('   If still showing sample data, check logs above for API errors');
  } else {
    Logger.log('❌ ' + keysMissing + ' API keys MISSING - This is why you see sample data!');
    Logger.log('');
    Logger.log('🔧 FIX:');
    Logger.log('   1. Go to: File → Project properties → Script properties');
    Logger.log('   2. Add missing keys:');
    for (const [key, description] of Object.entries(requiredKeys)) {
      const value = props.getProperty(key);
      if (!value) {
        Logger.log('      - ' + key + ' (' + description + ')');
      }
    }
    Logger.log('   3. Redeploy and test again');
  }
  
  Logger.log('');
  Logger.log('📖 Full setup guide: FIX_COMPETITOR_DATA_ISSUE.md');
  Logger.log('');
  
  return {
    keysConfigured: keysConfigured,
    keysMissing: keysMissing,
    allConfigured: keysMissing === 0
  };
}

/**
 * QUICK FIX: Run this to see what keys are needed
 */
function DIAG_showMissingKeys() {
  const props = PropertiesService.getScriptProperties();
  const keys = ['GOOGLE_API_KEY', 'GOOGLE_SEARCH_ENGINE_ID', 'SERPER_API_KEY'];
  
  Logger.log('🔑 API Keys Status:');
  Logger.log('');
  
  keys.forEach(key => {
    const value = props.getProperty(key);
    Logger.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'Configured' : 'MISSING'}`);
  });
  
  Logger.log('');
  Logger.log('To add keys: File → Project properties → Script properties');
}

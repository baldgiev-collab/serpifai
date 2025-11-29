/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK DEPLOYMENT HELPERS - ADD TO DATABRIDGE
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * STEP 1: Check if Fetcher is accessible
 * Run this in DataBridge to verify Fetcher deployment
 */
function QUICK_CHECK_FETCHER() {
  var url = PropertiesService.getScriptProperties().getProperty('FETCHER_WEB_APP_URL');
  
  if (!url) {
    Logger.log('❌ FETCHER_WEB_APP_URL not set');
    Logger.log('');
    Logger.log('TO FIX:');
    Logger.log('1. Open Fetcher project');
    Logger.log('2. Click Deploy → New deployment → Web app');
    Logger.log('3. Copy URL');
    Logger.log('4. Paste here in Script Properties as FETCHER_WEB_APP_URL');
    return;
  }
  
  Logger.log('✅ URL configured: ' + url.substring(0, 50) + '...');
  Logger.log('🧪 Testing V6 forensic scan...');
  Logger.log('');
  
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        action: 'fetch:fullScan',
        payload: { url: 'https://example.com', competitorUrls: [] }
      }),
      muteHttpExceptions: true
    });
    
    var code = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('Response Code: ' + code);
    
    if (code === 200) {
      Logger.log('✅ FETCHER RESPONDED!');
      Logger.log('');
      
      // Parse response to check for errors
      try {
        var result = JSON.parse(responseText);
        
        if (result.success && result.data && result.data.forensics) {
          Logger.log('✅ V6 FORENSIC ENGINE IS WORKING!');
          Logger.log('');
          Logger.log('📊 Forensic Data Received:');
          
          if (result.data.forensics.market_intel) {
            Logger.log('   ✅ Market Intel: ' + result.data.forensics.market_intel.cms);
          }
          if (result.data.forensics.content_intel) {
            Logger.log('   ✅ Humanity Score: ' + result.data.forensics.content_intel.humanity_score);
          }
          if (result.data.forensics.conversion) {
            Logger.log('   ✅ Friction Level: ' + result.data.forensics.conversion.friction_level);
          }
          
          Logger.log('');
          Logger.log('🎉 DEPLOYMENT SUCCESSFUL!');
          Logger.log('   Run RUN_ALL_TESTS() now');
          
        } else if (result.success === false || result.ok === false) {
          Logger.log('❌ FETCHER RETURNED ERROR:');
          Logger.log('   ' + (result.error || 'Unknown error'));
          Logger.log('');
          
          if ((result.error || '').indexOf('html is not defined') > -1) {
            Logger.log('🔍 DIAGNOSIS: Old code is still deployed');
            Logger.log('');
            Logger.log('TO FIX:');
            Logger.log('1. Open Fetcher Apps Script');
            Logger.log('2. Make sure seo_snapshot.gs is saved');
            Logger.log('3. Click Deploy → Manage deployments');
            Logger.log('4. Click ✏️ (Edit) on your Web app deployment');
            Logger.log('5. Change "Version" to "New version"');
            Logger.log('6. Click "Deploy"');
            Logger.log('7. Run this test again');
          }
          
        } else {
          Logger.log('⚠️ Unexpected response structure:');
          Logger.log(responseText.substring(0, 500));
        }
        
      } catch (parseError) {
        Logger.log('❌ Response is not valid JSON:');
        Logger.log(responseText.substring(0, 500));
      }
      
    } else {
      Logger.log('❌ HTTP ' + code);
      Logger.log('Response: ' + responseText.substring(0, 300));
    }
    
  } catch (e) {
    Logger.log('❌ Connection Error: ' + e);
    Logger.log('Make sure Fetcher is deployed as Web App');
  }
}

/**
 * STEP 2: Set Fetcher URL (if you just deployed)
 * Usage: SET_FETCHER_URL('paste-your-url-here')
 */
function SET_FETCHER_URL(url) {
  if (!url || url.indexOf('https://script.google.com') !== 0) {
    Logger.log('❌ Invalid URL. Should start with: https://script.google.com/macros/s/');
    return;
  }
  
  PropertiesService.getScriptProperties().setProperty('FETCHER_WEB_APP_URL', url);
  Logger.log('✅ FETCHER_WEB_APP_URL updated!');
  Logger.log('');
  Logger.log('🧪 Now run: QUICK_CHECK_FETCHER()');
}

/**
 * STEP 3: Test V6 with one competitor
 */
function QUICK_TEST_V6() {
  Logger.log('🧪 Quick V6 Test...');
  
  var result = WORKFLOW_analyzeCompetitors({
    competitors: ['https://ahrefs.com'],
    projectId: 'quick-test',
    yourDomain: 'test.com',
    spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
    targetKeywords: ['seo'],
    industry: 'SEO'
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('RESULTS:');
  Logger.log('  Success: ' + result.success);
  Logger.log('  Completeness: ' + result.metadata.dataCompleteness);
  Logger.log('  Time: ' + (result.metadata.collectionTime / 1000).toFixed(1) + 's');
  
  if (result.intelligence && result.intelligence.competitors[0]) {
    var c = result.intelligence.competitors[0];
    Logger.log('  Fetcher: ' + c.fetcherSuccess);
    Logger.log('  APIs: ' + c.apiSuccess);
  }
  
  Logger.log('═══════════════════════════════════════════');
}

/**
 * Check all configuration
 */
function SHOW_ALL_CONFIG() {
  var props = PropertiesService.getScriptProperties();
  var keys = props.getKeys().sort();
  
  Logger.log('═══════════════════════════════════════════');
  Logger.log('ALL SCRIPT PROPERTIES:');
  Logger.log('═══════════════════════════════════════════');
  
  keys.forEach(function(key) {
    var value = props.getProperty(key);
    var preview = value ? value.substring(0, 40) + '...' : 'NOT SET';
    Logger.log(key + ': ' + preview);
  });
  
  Logger.log('═══════════════════════════════════════════');
}

/**
 * DIAGNOSTIC: Test what the Fetcher actually has deployed
 * This calls the Fetcher and checks what functions are available
 */
function DIAGNOSE_FETCHER_CODE() {
  var url = PropertiesService.getScriptProperties().getProperty('FETCHER_WEB_APP_URL');
  
  if (!url) {
    Logger.log('❌ FETCHER_WEB_APP_URL not set');
    return;
  }
  
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🔍 DIAGNOSING FETCHER DEPLOYMENT');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('URL: ' + url.substring(0, 60) + '...');
  Logger.log('');
  
  // Test 1: Check if fullScan action exists
  Logger.log('Test 1: Calling fetch:fullScan...');
  try {
    var response1 = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        action: 'fetch:fullScan',
        payload: { url: 'https://example.com', competitorUrls: [] }
      }),
      muteHttpExceptions: true
    });
    
    var code1 = response1.getResponseCode();
    var text1 = response1.getContentText();
    
    Logger.log('   Response Code: ' + code1);
    
    if (code1 === 200) {
      try {
        var result1 = JSON.parse(text1);
        
        if (result1.success && result1.data && result1.data.forensics) {
          Logger.log('   ✅ V6 FORENSIC ENGINE DEPLOYED!');
          Logger.log('   ✅ Forensics structure present');
          
          if (result1.data.forensics.market_intel) {
            Logger.log('   ✅ market_intel category found');
          }
          if (result1.data.forensics.content_intel) {
            Logger.log('   ✅ content_intel category found');
          }
          if (result1.data.forensics.conversion) {
            Logger.log('   ✅ conversion category found');
          }
          
        } else if (result1.error || result1.ok === false) {
          Logger.log('   ❌ Error in response: ' + (result1.error || 'Unknown'));
          
          if ((result1.error || '').indexOf('html is not defined') > -1) {
            Logger.log('');
            Logger.log('🚨 PROBLEM FOUND: OLD CODE STILL DEPLOYED');
            Logger.log('');
            Logger.log('YOUR FETCHER FILES ARE NOT SAVED/DEPLOYED');
            Logger.log('');
            Logger.log('TO FIX:');
            Logger.log('1. Open Fetcher Apps Script (web editor)');
            Logger.log('2. Verify seo_snapshot.gs exists (393 lines)');
            Logger.log('3. Press Ctrl+F, search for: FET_fullForensicScan');
            Logger.log('4. If function NOT FOUND, copy code from GitHub');
            Logger.log('5. Save all files (💾 button)');
            Logger.log('6. Deploy → Manage deployments → Edit → New version');
            Logger.log('7. Run this diagnostic again');
          } else if ((result1.error || '').indexOf('FET_fullForensicScan is not defined') > -1) {
            Logger.log('');
            Logger.log('🚨 PROBLEM FOUND: seo_snapshot.gs MISSING');
            Logger.log('');
            Logger.log('TO FIX:');
            Logger.log('1. Open Fetcher Apps Script');
            Logger.log('2. Create new file: seo_snapshot.gs');
            Logger.log('3. Copy code from GitHub serpifai/fetcher/seo_snapshot.gs');
            Logger.log('4. Save (💾)');
            Logger.log('5. Deploy → Manage deployments → Edit → New version');
          }
        }
        
      } catch (parseErr) {
        Logger.log('   ❌ Invalid JSON response');
        Logger.log('   First 300 chars: ' + text1.substring(0, 300));
      }
      
    } else {
      Logger.log('   ❌ HTTP ' + code1);
      Logger.log('   Response: ' + text1.substring(0, 200));
    }
    
  } catch (e1) {
    Logger.log('   ❌ Connection failed: ' + e1);
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  
  // Test 2: Check if legacy seoSnapshot action exists (to verify Fetcher is working at all)
  Logger.log('Test 2: Checking if Fetcher responds to legacy actions...');
  
  try {
    var response2 = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        action: 'fetch:seoSnapshot',
        payload: { url: 'https://example.com' }
      }),
      muteHttpExceptions: true
    });
    
    var code2 = response2.getResponseCode();
    
    if (code2 === 200) {
      Logger.log('   ✅ Fetcher is responding to requests');
      Logger.log('   (Legacy action works, so Fetcher itself is deployed)');
      Logger.log('');
      Logger.log('🔍 CONCLUSION: Fetcher deployed but with OLD/WRONG code');
      Logger.log('   See FIX_DEPLOYMENT_NOW.md for update instructions');
    } else {
      Logger.log('   ⚠️ Legacy action also failing (HTTP ' + code2 + ')');
    }
    
  } catch (e2) {
    Logger.log('   ❌ Legacy test also failed: ' + e2);
  }
  
  Logger.log('═══════════════════════════════════════════');
}

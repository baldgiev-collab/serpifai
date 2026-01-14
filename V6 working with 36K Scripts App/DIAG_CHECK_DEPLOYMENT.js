/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAG_CHECK_DEPLOYMENT.gs - Verify What's Actually Deployed
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This diagnostic checks if the 50KB fix is actually deployed
 * 
 * HOW TO USE:
 * 1. Copy this entire file to Apps Script Editor as a NEW file
 * 2. Run: DIAG_checkDeployment()
 * 3. Check logs for actual maxHtmlSize value
 * 
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

function DIAG_checkDeployment() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('🔍 DEPLOYMENT VERIFICATION TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Test 1: Check if we can fetch a page and see the HTML size
  Logger.log('TEST 1: Check HTML Truncation Size');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Fetch a test URL
    const testUrl = 'https://example.com';
    Logger.log('Fetching: ' + testUrl);
    
    const fetchResult = FT_fetchSingle(testUrl, {
      skipCircuitBreaker: true,
      randomDelay: false
    });
    
    if (fetchResult.ok && fetchResult.html) {
      const htmlLength = fetchResult.html.length;
      Logger.log('✅ Fetch successful');
      Logger.log('📄 HTML length: ' + htmlLength + ' bytes');
      
      if (htmlLength <= 10000) {
        Logger.log('🔴 PROBLEM: HTML is limited to 10KB - FIX NOT DEPLOYED!');
        Logger.log('   Expected: ~50000 bytes');
        Logger.log('   Actual: ' + htmlLength + ' bytes');
        Logger.log('');
        Logger.log('ACTION REQUIRED:');
        Logger.log('1. Open FT_FetchSingle.gs in Apps Script Editor');
        Logger.log('2. Search for: var maxHtmlSize = 10000');
        Logger.log('3. Change to: var maxHtmlSize = 50000');
        Logger.log('4. Press Ctrl+S (or Cmd+S) to SAVE');
        Logger.log('5. Re-run this test');
      } else if (htmlLength >= 40000) {
        Logger.log('✅ SUCCESS: HTML limit is ~50KB - FIX IS DEPLOYED!');
        Logger.log('   The 50KB fix is working correctly.');
      } else {
        Logger.log('⚠️ WARNING: HTML is between 10KB and 40KB');
        Logger.log('   This is unusual. Expected either ~10KB or ~50KB.');
        Logger.log('   Actual: ' + htmlLength + ' bytes');
      }
    } else {
      Logger.log('❌ Fetch failed: ' + (fetchResult.error || 'Unknown error'));
      Logger.log('Cannot verify HTML size without successful fetch.');
    }
    
  } catch (e) {
    Logger.log('❌ Error during fetch test: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('TEST 2: Check FT_fullSnapshot Word Count Calculation');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check if word count is being calculated
    const testUrl = 'https://example.com';
    Logger.log('Testing: ' + testUrl);
    
    const snapshot = FT_fullSnapshot(testUrl, {
      extractMetadata: true,
      extractHeadingsHierarchy: true,
      extractIntroCopy: true,
      extractKeywordsComprehensive: true,
      skipCircuitBreaker: true,
      randomDelay: false
    });
    
    if (snapshot && snapshot.ok) {
      Logger.log('✅ Snapshot successful');
      
      // Check for comprehensive data
      const hasHeadings = !!(snapshot.headingsHierarchy && snapshot.headingsHierarchy.headings);
      const hasIntroCopy = !!(snapshot.introCopy && snapshot.introCopy.introParagraphs);
      const hasKeywords = !!(snapshot.keywordsComprehensive && snapshot.keywordsComprehensive.primary);
      const hasWordCount = !!snapshot.wordCount;
      
      Logger.log('📊 Comprehensive Extraction Status:');
      Logger.log('   Headings extracted: ' + (hasHeadings ? '✅' : '❌'));
      Logger.log('   Intro copy extracted: ' + (hasIntroCopy ? '✅' : '❌'));
      Logger.log('   Keywords extracted: ' + (hasKeywords ? '✅' : '❌'));
      Logger.log('   Word count calculated: ' + (hasWordCount ? '✅' : '❌'));
      
      if (hasWordCount) {
        Logger.log('   Word count value: ' + snapshot.wordCount);
        
        if (snapshot.wordCount > 100) {
          Logger.log('✅ SUCCESS: Word count looks realistic!');
        } else if (snapshot.wordCount === 0 || snapshot.wordCount === 1) {
          Logger.log('🔴 PROBLEM: Word count is ' + snapshot.wordCount);
          Logger.log('   This means extractors are not finding content.');
          Logger.log('   Likely cause: HTML is too small (10KB instead of 50KB)');
        } else {
          Logger.log('⚠️  Word count is low but not zero: ' + snapshot.wordCount);
        }
      } else {
        Logger.log('🔴 PROBLEM: Word count property missing!');
        Logger.log('   Word count calculation was not added to FT_fullSnapshot.gs');
        Logger.log('');
        Logger.log('ACTION REQUIRED:');
        Logger.log('1. Open FT_fullSnapshot.gs in Apps Script Editor');
        Logger.log('2. Find the section with: result.recommendations = recommendations;');
        Logger.log('3. ADD the word count calculation code AFTER that line');
        Logger.log('4. Press Ctrl+S (or Cmd+S) to SAVE');
      }
      
    } else {
      Logger.log('❌ Snapshot failed: ' + (snapshot ? snapshot.error : 'No response'));
    }
    
  } catch (e) {
    Logger.log('❌ Error during snapshot test: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('📋 SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('If you see "10KB" or word count = 0/1, then:');
  Logger.log('1. The manual deployment did NOT work');
  Logger.log('2. You need to find the CORRECT FT_FetchSingle.gs file');
  Logger.log('3. Make sure you are editing the RIGHT project in Apps Script');
  Logger.log('');
  Logger.log('To verify you are in the correct project:');
  Logger.log('1. Go to: https://script.google.com');
  Logger.log('2. Look for project named: "SerpifAI v6" or similar');
  Logger.log('3. Make sure it is the one connected to your web app');
  Logger.log('4. Check the file list for: FT_FetchSingle.gs');
  Logger.log('5. Open it and manually change line ~399');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
}

/**
 * Quick test to just check the HTML size
 */
function DIAG_quickHTMLSizeTest() {
  Logger.log('Testing HTML size limit...');
  
  try {
    const result = FT_fetchSingle('https://example.com', {
      skipCircuitBreaker: true,
      randomDelay: false
    });
    
    if (result.ok) {
      Logger.log('HTML Size: ' + result.html.length + ' bytes');
      Logger.log('Expected: ~50000 bytes for 50KB fix');
      Logger.log('Status: ' + (result.html.length > 40000 ? '✅ DEPLOYED' : '❌ NOT DEPLOYED (still 10KB)'));
    } else {
      Logger.log('Fetch failed: ' + result.error);
    }
  } catch (e) {
    Logger.log('Error: ' + e.toString());
  }
}

/**
 * Test with a LARGE page to see actual truncation
 */
function DIAG_testWithLargePage() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('🔬 TESTING WITH LARGE PAGE (Real Truncation Test)');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const testUrls = [
    'https://globant.com',
    'https://turing.com',
    'https://www.wikipedia.org'
  ];
  
  testUrls.forEach(function(url) {
    Logger.log('Testing: ' + url);
    Logger.log('─────────────────────────────────────────────────────────────────────────');
    
    try {
      const result = FT_fetchSingle(url, {
        skipCircuitBreaker: true,
        randomDelay: false
      });
      
      if (result.ok) {
        Logger.log('✅ Fetch successful');
        Logger.log('📥 Original HTML size: ' + result.contentLength + ' bytes');
        Logger.log('📄 After truncation: ' + result.html.length + ' bytes');
        Logger.log('🔪 Was truncated: ' + (result.htmlTruncated ? 'YES' : 'NO'));
        
        if (result.html.length >= 45000 && result.html.length <= 51000) {
          Logger.log('✅ SUCCESS: HTML is ~50KB - FIX IS DEPLOYED!');
          Logger.log('   The 50KB limit is working correctly.');
        } else if (result.html.length >= 9000 && result.html.length <= 11000) {
          Logger.log('🔴 FAIL: HTML is limited to ~10KB - FIX NOT DEPLOYED!');
          Logger.log('   Expected: ~50000 bytes');
          Logger.log('   Actual: ' + result.html.length + ' bytes');
        } else if (result.html.length < 9000) {
          Logger.log('⚠️  Page is smaller than 10KB (original size: ' + result.contentLength + ' bytes)');
          Logger.log('   Cannot determine if fix is deployed with this small page.');
        } else {
          Logger.log('⚠️  Unexpected HTML size: ' + result.html.length + ' bytes');
          Logger.log('   Expected either ~10KB or ~50KB');
        }
      } else {
        Logger.log('❌ Fetch failed: ' + result.error);
        if (result.error && result.error.includes('403')) {
          Logger.log('   Site is blocking requests (403). Try another test URL.');
        }
      }
      
      Logger.log('');
      
    } catch (e) {
      Logger.log('❌ Error: ' + e.toString());
      Logger.log('');
    }
  });
  
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('📋 CONCLUSION');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('If ANY test above shows ~50KB (45000-51000 bytes):');
  Logger.log('  ✅ The 50KB fix IS deployed and working!');
  Logger.log('');
  Logger.log('If ALL tests show ~10KB (9000-11000 bytes):');
  Logger.log('  ❌ The 50KB fix is NOT deployed!');
  Logger.log('  Action: Verify you saved FT_FetchSingle.gs after changing maxHtmlSize');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
}

/**
 * CLEAR ALL CACHES - Run this to fix globant/turing returning 10KB cached data!
 */
function DIAG_clearAllCaches() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('🗑️  CLEARING ALL CACHES');
  Logger.log('═══════════════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  try {
    // Apps Script CacheService doesn't have removeAll() without keys
    // So we need to manually clear known cache keys for our competitors
    
    var scriptCache = CacheService.getScriptCache();
    
    // Clear cache for our test URLs
    var testUrls = [
      'https://globant.com',
      'https://turing.com',
      'https://toptal.com',
      'https://www.wikipedia.org',
      'https://example.com'
    ];
    
    var clearedCount = 0;
    
    testUrls.forEach(function(url) {
      // Generate the same cache key that FT_fetchSingle uses
      var cacheKey = 'url_' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url)
        .map(function(byte) { return (byte + 256).toString(16).slice(-2); }).join('');
      
      scriptCache.remove(cacheKey);
      clearedCount++;
      Logger.log('🗑️  Cleared cache for: ' + url);
    });
    
    Logger.log('');
    Logger.log('✅ Cleared ' + clearedCount + ' cached URLs');
    
    // Also clear any circuit breaker data
    testUrls.forEach(function(url) {
      var domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      scriptCache.remove('circuit_' + domain);
      scriptCache.remove('lastfetch_' + domain);
    });
    
    Logger.log('✅ Cleared circuit breaker data');
    
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════════════════════');
    Logger.log('✅ ALL CACHES CLEARED SUCCESSFULLY');
    Logger.log('═══════════════════════════════════════════════════════════════════════════');
    Logger.log('');
    Logger.log('Now run DIAG_testWithLargePage() again to test with fresh data!');
    Logger.log('Expected result:');
    Logger.log('  - globant.com: ~50000 bytes (not 10000!)');
    Logger.log('  - turing.com: ~50000 bytes (not 10000!)');
    Logger.log('  - wikipedia.org: ~50000 bytes');
    Logger.log('');
    
  } catch (e) {
    Logger.log('❌ Error clearing caches: ' + e.toString());
    Logger.log('Stack: ' + (e.stack || 'No stack trace'));
  }
}

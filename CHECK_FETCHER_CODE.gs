/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COPY THIS TO YOUR FETCHER APPS SCRIPT - RUN TO CHECK WHAT'S DEPLOYED
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Run this in FETCHER project to see what code is actually deployed
 */
function CHECK_FETCHER_FILES() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🔍 CHECKING FETCHER FILES');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('');
  
  // Check if V6 functions exist
  var checks = {
    'FET_fullForensicScan': typeof FET_fullForensicScan === 'function',
    'FORENS_extractNarrative': typeof FORENS_extractNarrative === 'function',
    'FORENS_extractAIFootprint': typeof FORENS_extractAIFootprint === 'function',
    'FORENS_extractEEAT': typeof FORENS_extractEEAT === 'function',
    'FORENS_extractConversionIntel': typeof FORENS_extractConversionIntel === 'function',
    'FORENS_extractTechStack': typeof FORENS_extractTechStack === 'function',
    'CB_checkCircuit': typeof CB_checkCircuit === 'function',
    'CB_getRandomUserAgent': typeof CB_getRandomUserAgent === 'function',
    'FET_getUserAgent': typeof FET_getUserAgent === 'function'
  };
  
  Logger.log('📋 V6 FUNCTION CHECK:');
  Logger.log('');
  
  var allPresent = true;
  
  for (var funcName in checks) {
    var exists = checks[funcName];
    var status = exists ? '✅' : '❌';
    Logger.log(status + ' ' + funcName);
    
    if (!exists) {
      allPresent = false;
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  
  if (allPresent) {
    Logger.log('✅ ALL V6 FUNCTIONS PRESENT!');
    Logger.log('');
    Logger.log('Your code is correct. Now:');
    Logger.log('1. Click Deploy → Manage deployments');
    Logger.log('2. Edit deployment → New version → Deploy');
    Logger.log('3. Run DIAGNOSE_FETCHER_CODE() in DataBridge');
  } else {
    Logger.log('❌ MISSING V6 FUNCTIONS!');
    Logger.log('');
    Logger.log('🚨 YOUR LOCAL FILES ARE NOT IN THE ONLINE EDITOR!');
    Logger.log('');
    Logger.log('TO FIX:');
    Logger.log('1. You need to MANUALLY COPY files from your GitHub folder');
    Logger.log('2. Open: c:\\Users\\baldg\\OneDrive\\Documents\\GitHub\\serpifai\\fetcher\\');
    Logger.log('3. Copy each file content to Apps Script online editor');
    Logger.log('4. Files to copy:');
    Logger.log('   - seo_snapshot.gs (393 lines)');
    Logger.log('   - forensic_extractors.gs (687 lines)');
    Logger.log('   - utils_compliance.gs (170 lines)');
    Logger.log('   - utils_config.gs (185 lines)');
    Logger.log('   - fetcher_router.gs (79 lines)');
  }
  
  Logger.log('═══════════════════════════════════════════');
}

/**
 * Test the forensic scan directly in Fetcher
 */
function TEST_FORENSIC_SCAN_LOCAL() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🧪 TESTING FORENSIC SCAN IN FETCHER');
  Logger.log('═══════════════════════════════════════════');
  
  // Check if function exists
  if (typeof FET_fullForensicScan !== 'function') {
    Logger.log('❌ FET_fullForensicScan function NOT FOUND');
    Logger.log('');
    Logger.log('🚨 FILE MISSING: seo_snapshot.gs');
    Logger.log('');
    Logger.log('TO FIX:');
    Logger.log('1. In this Apps Script project, check if file "seo_snapshot.gs" exists');
    Logger.log('2. If NOT, create new file named "seo_snapshot.gs"');
    Logger.log('3. Copy content from: c:\\Users\\baldg\\OneDrive\\Documents\\GitHub\\serpifai\\fetcher\\seo_snapshot.gs');
    Logger.log('4. Save (💾)');
    Logger.log('5. Run this test again');
    return;
  }
  
  Logger.log('✅ FET_fullForensicScan function found');
  Logger.log('');
  Logger.log('🧪 Running forensic scan on https://example.com...');
  
  try {
    var result = FET_fullForensicScan('https://example.com', []);
    
    if (result.ok) {
      Logger.log('✅ FORENSIC SCAN WORKED!');
      Logger.log('');
      Logger.log('📊 Result:');
      Logger.log('   Forensics present: ' + (result.forensics ? 'YES' : 'NO'));
      
      if (result.forensics) {
        Logger.log('   Categories:');
        if (result.forensics.market_intel) Logger.log('      ✅ market_intel');
        if (result.forensics.brand_pos) Logger.log('      ✅ brand_pos');
        if (result.forensics.technical) Logger.log('      ✅ technical');
        if (result.forensics.content_intel) Logger.log('      ✅ content_intel');
        if (result.forensics.structure) Logger.log('      ✅ structure');
        if (result.forensics.systems) Logger.log('      ✅ systems');
        if (result.forensics.conversion) Logger.log('      ✅ conversion');
      }
      
      Logger.log('');
      Logger.log('🎉 YOUR CODE IS WORKING IN THE EDITOR!');
      Logger.log('   Now deploy it:');
      Logger.log('   Deploy → Manage deployments → Edit → New version');
      
    } else {
      Logger.log('❌ Forensic scan failed: ' + result.error);
    }
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e);
    Logger.log('   Stack: ' + e.stack);
    
    if (e.toString().indexOf('html is not defined') > -1) {
      Logger.log('');
      Logger.log('🚨 FOUND THE BUG: "html is not defined"');
      Logger.log('   This means forensic_extractors.gs or seo_snapshot.gs has an error');
      Logger.log('   Check line numbers in error above');
    }
  }
  
  Logger.log('═══════════════════════════════════════════');
}

/**
 * List all .gs files in this project
 */
function LIST_PROJECT_FILES() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('📁 FILES IN THIS FETCHER PROJECT:');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('');
  
  // This won't list files, but we can check which functions are defined
  Logger.log('Available global functions:');
  
  var globalFunctions = [
    'doPost', 'doGet', 'FET_handle',
    'FET_fullForensicScan', 'FET_seoSnapshot',
    'FORENS_extractNarrative', 'FORENS_extractAIFootprint',
    'FORENS_extractEEAT', 'FORENS_extractConversionIntel',
    'FORENS_extractTechStack', 'FORENS_extractHeadingStructure',
    'FORENS_extractLinkGraph', 'FORENS_extractVelocity',
    'FORENS_analyzeUniqueness',
    'CB_checkCircuit', 'CB_recordFailure', 'CB_recordSuccess',
    'CB_getRandomUserAgent',
    'SETUP_Project', 'FET_Config', 'FET_getUserAgent'
  ];
  
  globalFunctions.forEach(function(funcName) {
    var exists = typeof this[funcName] === 'function';
    var status = exists ? '✅' : '❌';
    Logger.log(status + ' ' + funcName);
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('If you see many ❌, files are missing from online editor');
  Logger.log('═══════════════════════════════════════════');
}

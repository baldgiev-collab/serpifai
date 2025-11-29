/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIND ALL FILES WITH OLD FET_ FUNCTION CALLS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This function scans ALL files in your DataBridge Apps Script project
 * and identifies which files contain OLD function calls or definitions.
 * 
 * CRITICAL: This ONLY checks what's DEPLOYED in Apps Script.
 * Your local files may be different!
 * 
 * COPY THIS TO DATABRIDGE APPS SCRIPT AND RUN: TEST_FindOldFunctionCalls()
 */

function TEST_FindOldFunctionCalls() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔍 SCANNING ALL DEPLOYED FILES FOR OLD FUNCTIONS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  var filesWithOldCalls = [];
  var filesWithOldDefinitions = [];
  var cleanFiles = [];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Get all global functions
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 STEP 1: Checking which OLD functions exist globally...');
  Logger.log('');
  
  var oldFunctionNames = [
    'FET_extractHeadings',
    'FET_extractMetadata',
    'FET_extractOpengraph',
    'FET_extractSchema',
    'FET_extractInternalLinks',
    'FET_competitorBenchmark',
    'FET_seoSnapshot',
    'COMP_collectCategoryIntelligence',
    'COMP_collectContentStrategies',
    'ELITE_orchestrateAnalysis',
    'ELITE_callAPI'
  ];
  
  var foundOldFunctions = [];
  
  oldFunctionNames.forEach(function(funcName) {
    try {
      if (typeof this[funcName] === 'function') {
        foundOldFunctions.push(funcName);
        Logger.log('  ❌ FOUND: ' + funcName);
      }
    } catch (e) {
      // Function doesn't exist - good!
    }
  });
  
  if (foundOldFunctions.length === 0) {
    Logger.log('  ✅ No old function definitions found globally');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Check specific functions for OLD patterns
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 STEP 2: Checking deployed functions for OLD call patterns...');
  Logger.log('');
  
  // Check COLLECTOR_gatherAllData
  try {
    if (typeof COLLECTOR_gatherAllData === 'function') {
      var collectorSource = COLLECTOR_gatherAllData.toString();
      
      Logger.log('🔍 Analyzing: COLLECTOR_gatherAllData');
      
      // Check for OLD direct calls
      var hasOldCalls = false;
      var foundCalls = [];
      
      if (collectorSource.indexOf('FET_extractHeadings') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_extractHeadings');
      }
      if (collectorSource.indexOf('FET_extractMetadata') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_extractMetadata');
      }
      if (collectorSource.indexOf('FET_extractOpengraph') > -1 || collectorSource.indexOf('FET_extractOpenGraph') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_extractOpengraph/FET_extractOpenGraph');
      }
      if (collectorSource.indexOf('FET_extractSchema') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_extractSchema');
      }
      if (collectorSource.indexOf('FET_extractInternalLinks') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_extractInternalLinks');
      }
      if (collectorSource.indexOf('FET_competitorBenchmark') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_competitorBenchmark');
      }
      if (collectorSource.indexOf('FET_seoSnapshot') > -1) {
        hasOldCalls = true;
        foundCalls.push('FET_seoSnapshot');
      }
      
      // Check for NEW remote calls
      var hasNewCalls = collectorSource.indexOf('APIS_fetchAndExtract') > -1;
      
      if (hasOldCalls) {
        Logger.log('  ❌ CALLS OLD FET_ FUNCTIONS:');
        foundCalls.forEach(function(call) {
          Logger.log('     - ' + call);
        });
        filesWithOldCalls.push({
          name: 'enhanced_data_collector.gs (deployed version)',
          oldCalls: foundCalls,
          hasNewCalls: hasNewCalls
        });
      } else if (hasNewCalls) {
        Logger.log('  ✅ Uses APIS_fetchAndExtract (correct)');
        cleanFiles.push('enhanced_data_collector.gs');
      } else {
        Logger.log('  ⚠️ No FET_ or APIS_ calls found (unexpected)');
      }
    } else {
      Logger.log('  ⚠️ COLLECTOR_gatherAllData not found');
    }
  } catch (e) {
    Logger.log('  ❌ Error checking COLLECTOR_gatherAllData: ' + e);
  }
  
  Logger.log('');
  
  // Check for other collector functions
  var otherCollectors = [
    'COMP_collectCategoryIntelligence',
    'COMP_collectContentStrategies',
    'COMP_collectTechnicalSEO'
  ];
  
  otherCollectors.forEach(function(funcName) {
    try {
      if (typeof this[funcName] === 'function') {
        Logger.log('🔍 Analyzing: ' + funcName);
        
        var funcSource = this[funcName].toString();
        var foundCalls = [];
        
        if (funcSource.indexOf('FET_') > -1) {
          // Count how many FET_ calls
          var fetMatches = funcSource.match(/FET_\w+/g) || [];
          fetMatches.forEach(function(call) {
            if (foundCalls.indexOf(call) === -1) {
              foundCalls.push(call);
            }
          });
          
          Logger.log('  ❌ CALLS ' + foundCalls.length + ' FET_ FUNCTIONS:');
          foundCalls.forEach(function(call) {
            Logger.log('     - ' + call);
          });
          
          filesWithOldCalls.push({
            name: 'collectors.gs (or similar - contains ' + funcName + ')',
            oldCalls: foundCalls
          });
        } else {
          Logger.log('  ✅ No FET_ calls found');
        }
        Logger.log('');
      }
    } catch (e) {
      // Function doesn't exist or error
    }
  });
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Check if OLD function definitions exist
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📋 STEP 3: Checking for OLD function DEFINITIONS...');
  Logger.log('');
  
  foundOldFunctions.forEach(function(funcName) {
    try {
      var funcSource = this[funcName].toString();
      
      // Determine likely file based on function name
      var likelyFile = 'UNKNOWN';
      if (funcName.indexOf('FET_') === 0) {
        likelyFile = 'FETCHER_MODULE.gs';
      } else if (funcName.indexOf('COMP_') === 0) {
        likelyFile = 'collectors.gs or CONSOLIDATED_DEPLOYMENT.gs';
      } else if (funcName.indexOf('ELITE_') === 0) {
        likelyFile = 'ELITE_COLLECTOR_SYSTEM.gs or elite_api_callers.gs';
      }
      
      Logger.log('  ❌ DEFINITION FOUND: ' + funcName);
      Logger.log('     Likely file: ' + likelyFile);
      
      filesWithOldDefinitions.push({
        name: likelyFile,
        function: funcName
      });
    } catch (e) {
      // Can't get source
    }
  });
  
  if (foundOldFunctions.length === 0) {
    Logger.log('  ✅ No old function definitions found');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL REPORT: FILES TO DELETE
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📊 FINAL REPORT: FILES TO DELETE FROM DATABRIDGE APPS SCRIPT');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  if (filesWithOldCalls.length === 0 && filesWithOldDefinitions.length === 0) {
    Logger.log('✅✅✅ NO OLD FILES FOUND! CLEANUP COMPLETE! ✅✅✅');
    Logger.log('');
    Logger.log('🚀 You can now run: TEST_endToEndCollection()');
    Logger.log('');
  } else {
    Logger.log('❌ FOUND ' + (filesWithOldCalls.length + filesWithOldDefinitions.length) + ' ISSUES');
    Logger.log('');
    
    // Group files to delete
    var filesToDelete = {};
    
    // From old calls
    filesWithOldCalls.forEach(function(item) {
      var filename = item.name;
      if (!filesToDelete[filename]) {
        filesToDelete[filename] = {
          reason: [],
          calls: [],
          definitions: []
        };
      }
      filesToDelete[filename].reason.push('Calls OLD FET_ functions');
      filesToDelete[filename].calls = filesToDelete[filename].calls.concat(item.oldCalls);
    });
    
    // From old definitions
    filesWithOldDefinitions.forEach(function(item) {
      var filename = item.name;
      if (!filesToDelete[filename]) {
        filesToDelete[filename] = {
          reason: [],
          calls: [],
          definitions: []
        };
      }
      filesToDelete[filename].reason.push('Defines OLD functions');
      filesToDelete[filename].definitions.push(item.function);
    });
    
    // Print deletion list
    Logger.log('🗑️ DELETE THESE FILES FROM DATABRIDGE APPS SCRIPT:');
    Logger.log('');
    
    var fileCount = 0;
    for (var filename in filesToDelete) {
      fileCount++;
      var details = filesToDelete[filename];
      
      Logger.log(fileCount + '. ❌ ' + filename);
      Logger.log('   Reasons:');
      details.reason.forEach(function(reason) {
        Logger.log('   - ' + reason);
      });
      
      if (details.calls.length > 0) {
        Logger.log('   Old calls found:');
        details.calls.forEach(function(call) {
          Logger.log('     • ' + call);
        });
      }
      
      if (details.definitions.length > 0) {
        Logger.log('   Old definitions found:');
        details.definitions.forEach(function(def) {
          Logger.log('     • ' + def);
        });
      }
      
      Logger.log('');
    }
    
    // Special case: If enhanced_data_collector.gs is in the list
    if (filesToDelete['enhanced_data_collector.gs (deployed version)']) {
      Logger.log('⚠️ SPECIAL CASE: enhanced_data_collector.gs');
      Logger.log('');
      Logger.log('   The DEPLOYED version is OLD (calls FET_ directly).');
      Logger.log('   Your LOCAL version is correct (uses APIS_fetchAndExtract).');
      Logger.log('');
      Logger.log('   🔧 FIX: REPLACE (not delete) this file:');
      Logger.log('   1. Open enhanced_data_collector in DataBridge Apps Script');
      Logger.log('   2. DELETE ALL content (Ctrl+A, Delete)');
      Logger.log('   3. Open local: databridge/collectors/enhanced_data_collector.gs');
      Logger.log('   4. COPY ALL (Ctrl+A, Ctrl+C)');
      Logger.log('   5. PASTE in Apps Script (Ctrl+V)');
      Logger.log('   6. SAVE (Ctrl+S)');
      Logger.log('   7. Deploy new version');
      Logger.log('');
    }
    
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('');
    Logger.log('📋 DELETION CHECKLIST:');
    Logger.log('');
    
    var checklistNum = 0;
    for (var filename in filesToDelete) {
      if (filename.indexOf('enhanced_data_collector') === -1) {
        checklistNum++;
        Logger.log('[ ] ' + checklistNum + '. Delete: ' + filename);
      } else {
        Logger.log('[ ] ' + checklistNum + '. Replace: enhanced_data_collector.gs with local version');
      }
    }
    
    Logger.log('[ ] ' + (checklistNum + 1) + '. Save all changes (Ctrl+S)');
    Logger.log('[ ] ' + (checklistNum + 2) + '. Deploy → Manage deployments → New version');
    Logger.log('[ ] ' + (checklistNum + 3) + '. Run TEST_FindOldFunctionCalls() again (should show 0 issues)');
    Logger.log('[ ] ' + (checklistNum + 4) + '. Run TEST_endToEndCollection() (should show 7/7 success)');
    Logger.log('');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Quick function to list ALL files in the project
 * NOTE: Apps Script doesn't provide direct file listing, 
 * so we check for common function naming patterns
 */
function TEST_ListAllDeployedFunctions() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('📋 ALL DEPLOYED FUNCTIONS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  var functionPrefixes = [
    'COLLECTOR_',
    'APIS_',
    'STORAGE_',
    'OPENPAGERANK_',
    'PAGESPEED_',
    'SERPER_',
    'DATAFORSEO_',
    'SEARCHCONSOLE_',
    'GEMINI_',
    'FET_',
    'COMP_',
    'ELITE_',
    'TEST_'
  ];
  
  var foundFunctions = {};
  
  functionPrefixes.forEach(function(prefix) {
    foundFunctions[prefix] = [];
  });
  
  // Get all property names from global scope
  var globalScope = this;
  
  // Common function names to check
  var commonFunctions = [
    'COLLECTOR_gatherAllData',
    'COLLECTOR_gatherBatchData',
    'APIS_fetchAndExtract',
    'APIS_fetcherCall',
    'STORAGE_saveCompetitorJSON',
    'STORAGE_readCompetitorJSON',
    'OPENPAGERANK_fetch',
    'PAGESPEED_analyze',
    'SERPER_getDomainOverview',
    'FET_extractHeadings',
    'FET_extractMetadata',
    'FET_extractOpengraph',
    'FET_extractSchema',
    'FET_extractInternalLinks',
    'COMP_collectCategoryIntelligence',
    'COMP_collectContentStrategies',
    'ELITE_orchestrateAnalysis',
    'ELITE_callAPI',
    'TEST_endToEndCollection',
    'TEST_VerifyCleanup',
    'TEST_FindOldFunctionCalls'
  ];
  
  commonFunctions.forEach(function(funcName) {
    try {
      if (typeof globalScope[funcName] === 'function') {
        var prefix = funcName.substring(0, funcName.indexOf('_') + 1);
        if (foundFunctions[prefix]) {
          foundFunctions[prefix].push(funcName);
        }
      }
    } catch (e) {
      // Function doesn't exist
    }
  });
  
  // Print results
  for (var prefix in foundFunctions) {
    if (foundFunctions[prefix].length > 0) {
      Logger.log('📦 ' + prefix + ' functions (' + foundFunctions[prefix].length + '):');
      foundFunctions[prefix].forEach(function(funcName) {
        Logger.log('   - ' + funcName);
      });
      Logger.log('');
    }
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * DIAG_TRACE_FULL_FLOW.gs
 * 
 * Trace the complete competitor analysis flow from button click to results
 */

function DIAG_traceCompetitorAnalysisFlow() {
  Logger.log('='.repeat(80));
  Logger.log('🔍 TRACING COMPLETE COMPETITOR ANALYSIS FLOW');
  Logger.log('='.repeat(80));
  
  try {
    // Simulate what happens when user clicks button
    const testCompetitors = ['toptal.com'];
    const testProject = {
      brandName: 'TestCo',
      targetAudience: 'Developers',
      coreTopic: 'Tech Staffing'
    };
    
    Logger.log('\n📋 STEP 1: Authorization...');
    Logger.log('   Calling: runEliteAnalysis()');
    
    const authResult = runEliteAnalysis(testCompetitors, testProject);
    Logger.log('   Result: ' + JSON.stringify(authResult, null, 2));
    
    if (!authResult.success) {
      Logger.log('❌ Authorization failed!');
      return {
        success: false,
        error: 'Authorization failed',
        step: 'authorization',
        details: authResult
      };
    }
    
    Logger.log('✅ Authorization passed');
    Logger.log('   Transaction ID: ' + authResult.transactionId);
    Logger.log('   Credit cost: ' + authResult.creditCost);
    
    // Step 2: Build config
    Logger.log('\n📋 STEP 2: Building config...');
    const config = {
      competitors: testCompetitors,
      projectContext: testProject,
      yourDomain: testProject.brandName,
      projectId: 'diag-test-' + Date.now()
    };
    
    Logger.log('   Config: ' + JSON.stringify(config, null, 2));
    
    // Step 3: Call orchestrator
    Logger.log('\n📋 STEP 3: Calling orchestrator...');
    Logger.log('   Calling: COMP_orchestrateAnalysis(config)');
    
    const analysisResult = COMP_orchestrateAnalysis(config);
    Logger.log('   Result type: ' + typeof analysisResult);
    Logger.log('   Result success: ' + (analysisResult ? analysisResult.success : 'null'));
    Logger.log('   Full result: ' + JSON.stringify(analysisResult, null, 2));
    
    if (!analysisResult || !analysisResult.success) {
      Logger.log('❌ Orchestration failed!');
      return {
        success: false,
        error: 'Orchestration failed',
        step: 'orchestration',
        details: analysisResult
      };
    }
    
    Logger.log('✅ Orchestration completed');
    
    // Step 4: Check results
    Logger.log('\n📋 STEP 4: Checking results...');
    Logger.log('   Has competitors: ' + (!!analysisResult.competitors));
    Logger.log('   Has analysis: ' + (!!analysisResult.analysis));
    Logger.log('   Has metadata: ' + (!!analysisResult.metadata));
    
    if (analysisResult.competitors) {
      const compType = Array.isArray(analysisResult.competitors) ? 'array' : 'object';
      const compCount = Array.isArray(analysisResult.competitors) 
        ? analysisResult.competitors.length 
        : Object.keys(analysisResult.competitors).length;
        
      Logger.log('   Competitors type: ' + compType);
      Logger.log('   Competitors count: ' + compCount);
      
      if (compCount === 0) {
        Logger.log('❌ NO COMPETITORS IN RESULTS!');
        return {
          success: false,
          error: 'Analysis completed but returned 0 competitors',
          step: 'results',
          details: {
            analysisSuccess: analysisResult.success,
            competitorsType: compType,
            competitorsCount: compCount,
            fullResult: analysisResult
          }
        };
      }
    } else {
      Logger.log('❌ NO COMPETITORS FIELD IN RESULTS!');
      return {
        success: false,
        error: 'Analysis completed but competitors field is missing',
        step: 'results',
        details: analysisResult
      };
    }
    
    Logger.log('\n' + '='.repeat(80));
    Logger.log('✅ COMPLETE FLOW SUCCESSFUL');
    Logger.log('='.repeat(80));
    Logger.log('Summary:');
    Logger.log('  ✅ Authorization: ' + authResult.transactionId);
    Logger.log('  ✅ Orchestration: Success');
    Logger.log('  ✅ Results: ' + (analysisResult.competitors ? 
      (Array.isArray(analysisResult.competitors) ? analysisResult.competitors.length : Object.keys(analysisResult.competitors).length) : 0) + ' competitors');
    
    return {
      success: true,
      authorization: authResult,
      analysis: analysisResult
    };
    
  } catch (e) {
    Logger.log('\n❌ EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString(),
      stack: e.stack
    };
  }
}

/**
 * Test just the fetcher directly
 */
function DIAG_testFetcherDirectly() {
  Logger.log('='.repeat(80));
  Logger.log('🧪 TESTING FETCHER DIRECTLY');
  Logger.log('='.repeat(80));
  
  try {
    const testDomain = 'toptal.com';
    
    Logger.log('\nCalling: FT_fetchEliteCompetitorData("' + testDomain + '", {})');
    
    // Check if function exists
    if (typeof FT_fetchEliteCompetitorData !== 'function') {
      Logger.log('❌ FT_fetchEliteCompetitorData function NOT FOUND!');
      Logger.log('   This is the root cause - fetcher function is missing!');
      return {
        success: false,
        error: 'FT_fetchEliteCompetitorData function does not exist',
        recommendation: 'Upload FT_EliteCompetitorFetcher.gs to Apps Script'
      };
    }
    
    Logger.log('✅ Function exists, calling now...');
    
    const result = FT_fetchEliteCompetitorData(testDomain, {});
    
    Logger.log('\n📥 Fetcher result:');
    Logger.log('   Type: ' + typeof result);
    Logger.log('   Success: ' + (result ? result.success : 'null'));
    Logger.log('   Full result: ' + JSON.stringify(result, null, 2));
    
    if (!result || !result.success) {
      Logger.log('\n❌ Fetcher failed!');
      return {
        success: false,
        error: 'Fetcher returned failure',
        details: result
      };
    }
    
    Logger.log('\n✅ Fetcher works!');
    return {
      success: true,
      fetcher: result
    };
    
  } catch (e) {
    Logger.log('\n❌ EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    
    if (e.toString().includes('FT_fetchEliteCompetitorData is not defined')) {
      Logger.log('\n🎯 ROOT CAUSE IDENTIFIED:');
      Logger.log('   The fetcher function FT_fetchEliteCompetitorData does not exist!');
      Logger.log('   File missing: FT_EliteCompetitorFetcher.gs');
      Logger.log('   Or: File not uploaded to Apps Script project');
    }
    
    return {
      success: false,
      error: e.toString(),
      stack: e.stack
    };
  }
}

/**
 * List all available functions to check what's loaded
 */
function DIAG_listAvailableFunctions() {
  Logger.log('📋 Checking which competitor analysis functions exist:\n');
  
  const functionsToCheck = [
    'runEliteCompetitorAnalysis',
    'runEliteAnalysis',
    'COMP_orchestrateAnalysis',
    'DB_COMP_orchestrateAnalysis',
    'DB_COMP_executeEliteAnalysis',
    'FT_fetchEliteCompetitorData',
    'fetchAllCompetitorData',
    'enrichWithAPIs',
    'generateGeminiAnalysis',
    'callGateway',
    'getUserLicenseKey'
  ];
  
  const results = {};
  
  functionsToCheck.forEach(funcName => {
    const exists = typeof eval('typeof ' + funcName) === 'string' && eval('typeof ' + funcName) === 'function';
    results[funcName] = exists;
    Logger.log('   ' + funcName.padEnd(35) + (exists ? '✅ Exists' : '❌ Missing'));
  });
  
  Logger.log('\n🎯 Summary:');
  const existing = Object.values(results).filter(Boolean).length;
  const total = functionsToCheck.length;
  Logger.log('   ' + existing + '/' + total + ' functions found');
  
  if (existing < total) {
    Logger.log('\n⚠️  Some functions are missing!');
    Logger.log('   Missing functions need to be uploaded to Apps Script.');
  }
  
  return results;
}

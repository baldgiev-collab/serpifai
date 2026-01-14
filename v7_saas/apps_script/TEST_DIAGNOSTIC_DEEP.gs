/**
 * TEST_DIAGNOSTIC_DEEP.gs
 * Comprehensive diagnostic test to trace exactly where data is lost
 * Run: testDeepDiagnostic()
 */

/**
 * Main diagnostic function - run this to trace the entire data flow
 */
function testDeepDiagnostic() {
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════════════════╗');
  Logger.log('║           DEEP DIAGNOSTIC TEST - COMPETITOR ANALYSIS              ║');
  Logger.log('╚════════════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const testDomain = 'toptal.com';
  
  // TEST 1: Direct API calls via gateway
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST 1: DIRECT API CALLS VIA GATEWAY');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // 1A: Test PageSpeed API
  Logger.log('');
  Logger.log('📊 1A: PageSpeed API Test');
  Logger.log('   Action: pagespeed_analyze');
  Logger.log('   URL: https://' + testDomain);
  
  try {
    const pageSpeedResult = callGateway('pagespeed_analyze', {
      url: 'https://' + testDomain,
      strategy: 'mobile'
    });
    
    Logger.log('   ✅ Gateway returned:');
    Logger.log('      success: ' + pageSpeedResult.success);
    Logger.log('      error: ' + (pageSpeedResult.error || 'none'));
    
    if (pageSpeedResult.success && pageSpeedResult.data) {
      Logger.log('      data.scores: ' + JSON.stringify(pageSpeedResult.data.scores || {}));
      Logger.log('      data.scores.seo: ' + (pageSpeedResult.data.scores?.seo || 'MISSING'));
      Logger.log('      data.scores.performance: ' + (pageSpeedResult.data.scores?.performance || 'MISSING'));
    } else {
      Logger.log('      ⚠️ No data returned: ' + JSON.stringify(pageSpeedResult));
    }
  } catch (e) {
    Logger.log('   ❌ EXCEPTION: ' + e.toString());
  }
  
  // 1B: Test OpenPageRank API
  Logger.log('');
  Logger.log('📊 1B: OpenPageRank API Test');
  Logger.log('   Action: opr_get_rank');
  Logger.log('   Domain: ' + testDomain);
  
  try {
    const oprResult = callGateway('opr_get_rank', {
      domain: testDomain
    });
    
    Logger.log('   ✅ Gateway returned:');
    Logger.log('      success: ' + oprResult.success);
    Logger.log('      error: ' + (oprResult.error || 'none'));
    
    if (oprResult.success && oprResult.data) {
      Logger.log('      data.page_rank_decimal: ' + (oprResult.data.page_rank_decimal || 'MISSING'));
      Logger.log('      data.page_rank_integer: ' + (oprResult.data.page_rank_integer || 'MISSING'));
      Logger.log('      data.rank: ' + (oprResult.data.rank || 'MISSING'));
    } else {
      Logger.log('      ⚠️ No data returned: ' + JSON.stringify(oprResult));
    }
  } catch (e) {
    Logger.log('   ❌ EXCEPTION: ' + e.toString());
  }
  
  // 1C: Test Serper API
  Logger.log('');
  Logger.log('📊 1C: Serper API Test');
  Logger.log('   Action: serper_search');
  Logger.log('   Query: site:' + testDomain);
  
  try {
    const serperResult = callGateway('serper_search', {
      query: 'site:' + testDomain,
      params: { num: 10, gl: 'us' }
    });
    
    Logger.log('   ✅ Gateway returned:');
    Logger.log('      success: ' + serperResult.success);
    Logger.log('      error: ' + (serperResult.error || 'none'));
    
    if (serperResult.success && serperResult.data) {
      const organic = serperResult.data.organic || [];
      Logger.log('      data.organic count: ' + organic.length);
      if (organic.length > 0) {
        Logger.log('      First result: ' + organic[0].title);
      }
    } else {
      Logger.log('      ⚠️ No data returned: ' + JSON.stringify(serperResult));
    }
  } catch (e) {
    Logger.log('   ❌ EXCEPTION: ' + e.toString());
  }
  
  // TEST 2: Elite Fetcher
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST 2: FT_fetchEliteCompetitorData');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  try {
    const eliteResult = FT_fetchEliteCompetitorData(testDomain, {});
    
    Logger.log('');
    Logger.log('📊 Elite Fetcher Result:');
    Logger.log('   success: ' + eliteResult.success);
    Logger.log('   successRate: ' + eliteResult.successRate);
    Logger.log('   executionTime: ' + eliteResult.executionTime + 'ms');
    
    Logger.log('');
    Logger.log('📊 Stages:');
    
    if (eliteResult.stages) {
      Object.keys(eliteResult.stages).forEach(stage => {
        const stageData = eliteResult.stages[stage];
        Logger.log('   ' + stage + ':');
        Logger.log('      success: ' + stageData.success);
        Logger.log('      error: ' + (stageData.error || 'none'));
        
        if (stageData.success && stageData.data) {
          if (stage === 'pageSpeed') {
            Logger.log('      data.scores: ' + JSON.stringify(stageData.data.scores || {}));
          } else if (stage === 'openPageRank') {
            Logger.log('      data.page_rank_decimal: ' + stageData.data.page_rank_decimal);
            Logger.log('      data.rank: ' + stageData.data.rank);
          } else if (stage === 'serper') {
            Logger.log('      data.organic count: ' + (stageData.data.organic?.length || 0));
          }
        }
      });
    }
    
    Logger.log('');
    Logger.log('📊 Combined Data (synthesized):');
    if (eliteResult.combinedData) {
      const cd = eliteResult.combinedData;
      Logger.log('   technical.seoScore: ' + (cd.technical?.seoScore || 'MISSING'));
      Logger.log('   technical.performanceScore: ' + (cd.technical?.performanceScore || 'MISSING'));
      Logger.log('   authority.pageRank: ' + (cd.authority?.pageRank || 'MISSING'));
      Logger.log('   authority.domainRank: ' + (cd.authority?.domainRank || 'MISSING'));
    }
    
  } catch (e) {
    Logger.log('   ❌ EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
  }
  
  // TEST 3: Full Analysis Flow
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST 3: FULL ANALYSIS FLOW');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  try {
    const config = {
      competitors: [testDomain],
      yourDomain: 'test.com',
      projectContext: { brandName: 'Test' }
    };
    
    Logger.log('   Calling DB_COMP_executeEliteAnalysis...');
    
    const analysisResult = DB_COMP_executeEliteAnalysis(config);
    
    Logger.log('');
    Logger.log('📊 Analysis Result:');
    Logger.log('   success: ' + analysisResult.success);
    Logger.log('   error: ' + (analysisResult.error || 'none'));
    
    if (analysisResult.success && analysisResult.competitors) {
      const comps = Array.isArray(analysisResult.competitors) 
        ? analysisResult.competitors 
        : Object.values(analysisResult.competitors);
      
      comps.forEach((comp, i) => {
        Logger.log('');
        Logger.log('   Competitor ' + (i+1) + ': ' + (comp.domain || 'unknown'));
        
        // Check stages
        if (comp.stages) {
          Logger.log('      stages.pageSpeed.success: ' + (comp.stages.pageSpeed?.success || false));
          Logger.log('      stages.pageSpeed.data.scores.seo: ' + (comp.stages.pageSpeed?.data?.scores?.seo || 'MISSING'));
          Logger.log('      stages.openPageRank.success: ' + (comp.stages.openPageRank?.success || false));
          Logger.log('      stages.openPageRank.data.page_rank_decimal: ' + (comp.stages.openPageRank?.data?.page_rank_decimal || 'MISSING'));
        } else {
          Logger.log('      ⚠️ NO STAGES DATA');
        }
        
        // Check apiData
        if (comp.apiData) {
          Logger.log('      apiData.pageSpeed.scores.seo: ' + (comp.apiData.pageSpeed?.scores?.seo || 'MISSING'));
          Logger.log('      apiData.openPageRank.page_rank_decimal: ' + (comp.apiData.openPageRank?.page_rank_decimal || 'MISSING'));
        } else {
          Logger.log('      ⚠️ NO API DATA');
        }
        
        // Check processedMetrics
        if (comp.processedMetrics) {
          Logger.log('      processedMetrics.seoScore: ' + (comp.processedMetrics.seoScore || 'MISSING'));
          Logger.log('      processedMetrics.pageRank: ' + (comp.processedMetrics.pageRank || 'MISSING'));
          Logger.log('      processedMetrics.siteHealth: ' + (comp.processedMetrics.siteHealth || 'MISSING'));
        } else {
          Logger.log('      ⚠️ NO PROCESSED METRICS');
        }
      });
    }
    
  } catch (e) {
    Logger.log('   ❌ EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Quick test just the gateway
 */
function testGatewayOnly() {
  Logger.log('Testing gateway connection...');
  
  try {
    const result = callGateway('check_status', {});
    Logger.log('Gateway response: ' + JSON.stringify(result));
  } catch (e) {
    Logger.log('Gateway error: ' + e.toString());
  }
}

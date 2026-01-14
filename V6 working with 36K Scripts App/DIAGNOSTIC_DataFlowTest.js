/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNOSTIC_DataFlowTest.gs - FULL DATA PIPELINE DIAGNOSTIC
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script tests the complete data flow from API fetching to UI rendering
 * to identify exactly where data is lost or shows as 0/N/A.
 * 
 * RUN: Execute testFullDataPipeline() from Apps Script editor
 * 
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test the complete data pipeline with a single competitor
 * Logs detailed data at each transformation step
 */
function testFullDataPipeline() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('🔬 FULL DATA PIPELINE DIAGNOSTIC TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Test with a known domain that has good data
  const testDomain = 'ahrefs.com';
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Test FT_fetchEliteCompetitorData
  // ─────────────────────────────────────────────────────────────────────────
  Logger.log('STEP 1: Testing FT_fetchEliteCompetitorData...');
  Logger.log('─────────────────────────────────────────────────────────────────');
  
  let step1Result = null;
  try {
    step1Result = FT_fetchEliteCompetitorData(testDomain, {});
    Logger.log('✅ FT_fetchEliteCompetitorData returned successfully');
    Logger.log('   success: ' + step1Result.success);
    Logger.log('   successRate: ' + step1Result.successRate);
    
    // Log each stage
    if (step1Result.stages) {
      Logger.log('   STAGES:');
      Object.keys(step1Result.stages).forEach(stage => {
        const stageData = step1Result.stages[stage];
        Logger.log('      ' + stage + ':');
        Logger.log('         success: ' + stageData.success);
        if (stageData.data) {
          Logger.log('         data keys: ' + Object.keys(stageData.data).join(', '));
        }
        if (stageData.error) {
          Logger.log('         error: ' + stageData.error);
        }
      });
    }
    
    // Log synthesized data
    if (step1Result.combinedData) {
      Logger.log('   COMBINED DATA:');
      Logger.log('      keys: ' + Object.keys(step1Result.combinedData).join(', '));
    }
  } catch (e) {
    Logger.log('❌ FT_fetchEliteCompetitorData FAILED: ' + e.toString());
    step1Result = { success: false, error: e.toString() };
  }
  
  Logger.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Test fetchAllCompetitorData
  // ─────────────────────────────────────────────────────────────────────────
  Logger.log('STEP 2: Testing fetchAllCompetitorData...');
  Logger.log('─────────────────────────────────────────────────────────────────');
  
  let step2Result = null;
  try {
    step2Result = fetchAllCompetitorData([testDomain]);
    Logger.log('✅ fetchAllCompetitorData returned successfully');
    Logger.log('   Domains: ' + Object.keys(step2Result).join(', '));
    
    if (step2Result[testDomain]) {
      const comp = step2Result[testDomain];
      Logger.log('   ' + testDomain + ':');
      Logger.log('      fetchSuccess: ' + comp.fetchSuccess);
      Logger.log('      method: ' + comp.method);
      Logger.log('      successRate: ' + comp.successRate);
      Logger.log('      has stages: ' + !!comp.stages);
      Logger.log('      has synthesized: ' + !!comp.synthesized);
      
      if (comp.stages) {
        Logger.log('      STAGES SUMMARY:');
        Object.keys(comp.stages).forEach(stage => {
          const s = comp.stages[stage];
          Logger.log('         ' + stage + ': ' + (s.success ? '✅' : '❌'));
        });
      }
      
      if (comp.synthesized) {
        Logger.log('      SYNTHESIZED SUMMARY:');
        Logger.log('         keys: ' + Object.keys(comp.synthesized).join(', '));
      }
    }
  } catch (e) {
    Logger.log('❌ fetchAllCompetitorData FAILED: ' + e.toString());
    step2Result = {};
  }
  
  Logger.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Test enrichWithAPIs
  // ─────────────────────────────────────────────────────────────────────────
  Logger.log('STEP 3: Testing enrichWithAPIs...');
  Logger.log('─────────────────────────────────────────────────────────────────');
  
  let step3Result = null;
  try {
    step3Result = enrichWithAPIs(step2Result);
    Logger.log('✅ enrichWithAPIs returned successfully');
    Logger.log('   Domains: ' + Object.keys(step3Result).join(', '));
    
    if (step3Result[testDomain]) {
      const comp = step3Result[testDomain];
      Logger.log('   ' + testDomain + ':');
      Logger.log('      has snapshot: ' + !!comp.snapshot);
      Logger.log('      has apiData: ' + !!comp.apiData);
      Logger.log('      has processedMetrics: ' + !!comp.processedMetrics);
      Logger.log('      has stages: ' + !!comp.stages);
      Logger.log('      has synthesized: ' + !!comp.synthesized);
      
      // CRITICAL: Log apiData content
      if (comp.apiData) {
        Logger.log('      API DATA:');
        Logger.log('         pageSpeed: ' + JSON.stringify(comp.apiData.pageSpeed || {}));
        Logger.log('         openPageRank: ' + JSON.stringify(comp.apiData.openPageRank || {}));
        Logger.log('         serper organic count: ' + ((comp.apiData.serper && comp.apiData.serper.organic) ? comp.apiData.serper.organic.length : 0));
      }
      
      // CRITICAL: Log processedMetrics
      if (comp.processedMetrics) {
        Logger.log('      PROCESSED METRICS:');
        const pm = comp.processedMetrics;
        Logger.log('         seoScore: ' + pm.seoScore);
        Logger.log('         performanceScore: ' + pm.performanceScore);
        Logger.log('         pageRank: ' + pm.pageRank);
        Logger.log('         authorityScore: ' + pm.authorityScore);
        Logger.log('         estimatedTraffic: ' + pm.estimatedTraffic);
        Logger.log('         organicKeywords: ' + pm.organicKeywords);
        Logger.log('         estimatedBacklinks: ' + pm.estimatedBacklinks);
        Logger.log('         siteHealth: ' + pm.siteHealth);
      }
    }
  } catch (e) {
    Logger.log('❌ enrichWithAPIs FAILED: ' + e.toString());
    step3Result = {};
  }
  
  Logger.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Test transformCompetitorsForUI
  // ─────────────────────────────────────────────────────────────────────────
  Logger.log('STEP 4: Testing transformCompetitorsForUI...');
  Logger.log('─────────────────────────────────────────────────────────────────');
  
  let step4Result = null;
  try {
    // Convert object to array
    const competitorsArray = Object.values(step3Result);
    step4Result = transformCompetitorsForUI(competitorsArray, null);
    Logger.log('✅ transformCompetitorsForUI returned successfully');
    Logger.log('   Competitor count: ' + step4Result.length);
    
    if (step4Result.length > 0) {
      const comp = step4Result[0];
      Logger.log('   First competitor:');
      Logger.log('      domain: ' + comp.domain);
      Logger.log('      has processedMetrics: ' + !!comp.processedMetrics);
      Logger.log('      has apiData: ' + !!comp.apiData);
      Logger.log('      has snapshot: ' + !!comp.snapshot);
      
      if (comp.processedMetrics) {
        Logger.log('      PROCESSED METRICS AFTER TRANSFORM:');
        const pm = comp.processedMetrics;
        Logger.log('         seoScore: ' + pm.seoScore);
        Logger.log('         performanceScore: ' + pm.performanceScore);
        Logger.log('         pageRank: ' + pm.pageRank);
        Logger.log('         authorityScore: ' + pm.authorityScore);
        Logger.log('         estimatedTraffic: ' + pm.estimatedTraffic);
        Logger.log('         organicKeywords: ' + pm.organicKeywords);
        Logger.log('         estimatedBacklinks: ' + pm.estimatedBacklinks);
        Logger.log('         estimatedRefDomains: ' + pm.estimatedRefDomains);
        Logger.log('         siteHealth: ' + pm.siteHealth);
        Logger.log('         pageSpeed: ' + pm.pageSpeed);
      }
    }
  } catch (e) {
    Logger.log('❌ transformCompetitorsForUI FAILED: ' + e.toString());
    step4Result = [];
  }
  
  Logger.log('');
  
  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('📊 DIAGNOSTIC SUMMARY');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Check each step
  const steps = [
    { name: 'FT_fetchEliteCompetitorData', result: step1Result, checkKey: 'success' },
    { name: 'fetchAllCompetitorData', result: step2Result, checkKey: testDomain },
    { name: 'enrichWithAPIs', result: step3Result, checkKey: testDomain },
    { name: 'transformCompetitorsForUI', result: step4Result, checkKey: 'length' }
  ];
  
  steps.forEach((step, i) => {
    let status = '❌ FAILED';
    if (step.result) {
      if (step.checkKey === 'success' && step.result.success) status = '✅ SUCCESS';
      else if (step.checkKey === 'length' && step.result.length > 0) status = '✅ SUCCESS';
      else if (step.result[step.checkKey]) status = '✅ SUCCESS';
    }
    Logger.log('   Step ' + (i + 1) + ': ' + step.name + ' - ' + status);
  });
  
  Logger.log('');
  
  // Final data check
  if (step4Result && step4Result.length > 0 && step4Result[0].processedMetrics) {
    const pm = step4Result[0].processedMetrics;
    const hasRealData = pm.pageRank > 0 || pm.seoScore > 0 || pm.estimatedTraffic > 0;
    
    if (hasRealData) {
      Logger.log('✅ REAL DATA DETECTED - Pipeline is working!');
      Logger.log('');
      Logger.log('   If UI still shows 0/N/A:');
      Logger.log('   1. Make sure the latest code is deployed to Apps Script');
      Logger.log('   2. Refresh the sidebar and run a new analysis');
      Logger.log('   3. Check browser console for JavaScript errors');
    } else {
      Logger.log('⚠️ ALL VALUES ARE ZERO - APIs may be failing!');
      Logger.log('');
      Logger.log('   Check:');
      Logger.log('   1. PHP Gateway URL is correct in Script Properties');
      Logger.log('   2. API keys are configured in .env');
      Logger.log('   3. Gateway server is running');
    }
  } else {
    Logger.log('❌ NO DATA RETURNED - Check earlier steps for errors');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('END DIAGNOSTIC');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  
  return {
    step1: step1Result,
    step2: step2Result,
    step3: step3Result,
    step4: step4Result
  };
}

/**
 * Quick test of just the API calls
 */
function testAPICallsOnly() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('🔌 API CALLS DIAGNOSTIC TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const testDomain = 'ahrefs.com';
  
  // Test 1: PageSpeed API
  Logger.log('1. Testing PageSpeed API...');
  try {
    const psResult = FT_callPageSpeedAPI('https://' + testDomain);
    Logger.log('   Success: ' + psResult.success);
    if (psResult.success && psResult.data && psResult.data.scores) {
      Logger.log('   Performance: ' + psResult.data.scores.performance);
      Logger.log('   SEO: ' + psResult.data.scores.seo);
      Logger.log('   Accessibility: ' + psResult.data.scores.accessibility);
    } else if (psResult.error) {
      Logger.log('   Error: ' + psResult.error);
    }
  } catch (e) {
    Logger.log('   ❌ Exception: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test 2: Serper API
  Logger.log('2. Testing Serper API...');
  try {
    const serperResult = FT_callSerperAPI(testDomain);
    Logger.log('   Success: ' + serperResult.success);
    if (serperResult.success && serperResult.data) {
      Logger.log('   Organic results: ' + ((serperResult.data.organic) ? serperResult.data.organic.length : 0));
    } else if (serperResult.error) {
      Logger.log('   Error: ' + serperResult.error);
    }
  } catch (e) {
    Logger.log('   ❌ Exception: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test 3: OpenPageRank API
  Logger.log('3. Testing OpenPageRank API...');
  try {
    const oprResult = FT_callOpenPageRankAPI(testDomain);
    Logger.log('   Success: ' + oprResult.success);
    if (oprResult.success && oprResult.data) {
      Logger.log('   Page Rank: ' + oprResult.data.page_rank_decimal);
      Logger.log('   Domain Rank: ' + oprResult.data.rank);
    } else if (oprResult.error) {
      Logger.log('   Error: ' + oprResult.error);
    }
  } catch (e) {
    Logger.log('   ❌ Exception: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test 4: Gateway connectivity
  Logger.log('4. Testing Gateway connectivity...');
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
    Logger.log('   Gateway URL: ' + (gatewayUrl || 'NOT SET (using default)'));
    
    // Try a simple gateway call
    const pingResult = callGateway('ping', {});
    Logger.log('   Ping result: ' + JSON.stringify(pingResult));
  } catch (e) {
    Logger.log('   ❌ Gateway error: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('END API DIAGNOSTIC');
  Logger.log('═══════════════════════════════════════════════════════════════════');
}

/**
 * Test what the UI actually receives
 */
function testUIDataStructure() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('🎨 UI DATA STRUCTURE TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Run actual analysis with 2 competitors
  const config = {
    competitors: ['ahrefs.com', 'moz.com'],
    projectContext: { brandName: 'Test Project' },
    yourDomain: 'mysite.com',
    projectId: 'test-' + Date.now()
  };
  
  Logger.log('Running COMP_orchestrateAnalysis with:');
  Logger.log('   Competitors: ' + config.competitors.join(', '));
  Logger.log('');
  
  try {
    const result = COMP_orchestrateAnalysis(config);
    
    Logger.log('Result keys: ' + Object.keys(result).join(', '));
    Logger.log('Success: ' + result.success);
    
    if (result.success && result.competitors) {
      Logger.log('');
      Logger.log('COMPETITORS ARRAY:');
      Logger.log('   Length: ' + result.competitors.length);
      Logger.log('   Is Array: ' + Array.isArray(result.competitors));
      Logger.log('');
      
      result.competitors.forEach((comp, i) => {
        Logger.log('COMPETITOR ' + (i + 1) + ': ' + comp.domain);
        Logger.log('   Keys: ' + Object.keys(comp).join(', '));
        Logger.log('   ─────────────────────────');
        Logger.log('   snapshot: ' + (comp.snapshot ? 'YES' : 'NO'));
        Logger.log('   apiData: ' + (comp.apiData ? 'YES' : 'NO'));
        Logger.log('   processedMetrics: ' + (comp.processedMetrics ? 'YES' : 'NO'));
        Logger.log('   synthesized: ' + (comp.synthesized ? 'YES' : 'NO'));
        Logger.log('   stages: ' + (comp.stages ? 'YES' : 'NO'));
        
        if (comp.processedMetrics) {
          const pm = comp.processedMetrics;
          Logger.log('');
          Logger.log('   PROCESSED METRICS (what UI should display):');
          Logger.log('      pageRank: ' + pm.pageRank);
          Logger.log('      authorityScore: ' + pm.authorityScore);
          Logger.log('      seoScore: ' + pm.seoScore);
          Logger.log('      performanceScore: ' + pm.performanceScore);
          Logger.log('      accessibilityScore: ' + pm.accessibilityScore);
          Logger.log('      siteHealth: ' + pm.siteHealth);
          Logger.log('      organicKeywords: ' + (pm.organicKeywords || pm.estimatedOrganicKeywords));
          Logger.log('      estimatedTraffic: ' + pm.estimatedTraffic);
          Logger.log('      estimatedBacklinks: ' + (pm.backlinks || pm.estimatedBacklinks));
          Logger.log('      estimatedRefDomains: ' + (pm.refDomains || pm.estimatedRefDomains));
        }
        
        if (comp.apiData) {
          Logger.log('');
          Logger.log('   API DATA (raw from APIs):');
          if (comp.apiData.pageSpeed && comp.apiData.pageSpeed.scores) {
            Logger.log('      pageSpeed.scores.seo: ' + comp.apiData.pageSpeed.scores.seo);
            Logger.log('      pageSpeed.scores.performance: ' + comp.apiData.pageSpeed.scores.performance);
          }
          if (comp.apiData.openPageRank) {
            Logger.log('      openPageRank.page_rank_decimal: ' + comp.apiData.openPageRank.page_rank_decimal);
            Logger.log('      openPageRank.rank: ' + comp.apiData.openPageRank.rank);
          }
          if (comp.apiData.serper) {
            Logger.log('      serper.organicKeywords: ' + comp.apiData.serper.organicKeywords);
            Logger.log('      serper.estimatedTraffic: ' + comp.apiData.serper.estimatedTraffic);
          }
        }
        
        Logger.log('');
      });
      
      // Check if values are 0
      const firstComp = result.competitors[0];
      if (firstComp && firstComp.processedMetrics) {
        const pm = firstComp.processedMetrics;
        const allZero = pm.pageRank === 0 && pm.seoScore === 0 && pm.performanceScore === 0;
        
        if (allZero) {
          Logger.log('');
          Logger.log('⚠️ WARNING: All metrics are 0!');
          Logger.log('   This means the APIs are not returning data.');
          Logger.log('   Check gateway configuration and API keys.');
        } else {
          Logger.log('');
          Logger.log('✅ DATA LOOKS GOOD!');
          Logger.log('   Backend is returning real metrics.');
          Logger.log('   If UI shows 0/N/A, the issue is in frontend rendering.');
        }
      }
    }
  } catch (e) {
    Logger.log('❌ Analysis failed: ' + e.toString());
    Logger.log('   Stack: ' + (e.stack || 'No stack'));
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('END UI DATA STRUCTURE TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════');
}

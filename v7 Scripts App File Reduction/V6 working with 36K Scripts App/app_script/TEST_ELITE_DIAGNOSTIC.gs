/**
 * ELITE DIAGNOSTIC TEST
 * Run this in Apps Script to trace exactly where data is being lost
 */

function TEST_ELITE_DIAGNOSTIC() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔬 ELITE DIAGNOSTIC TEST - TRACING DATA FLOW');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  const testDomain = 'toptal.com';
  
  // ════════════════════════════════════════════════════════════════════════
  // STEP 1: Test individual API calls via Gateway
  // ════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('▶▶▶ STEP 1: TESTING INDIVIDUAL API CALLS ◀◀◀');
  Logger.log('');
  
  // Test PageSpeed API
  Logger.log('┌─────────────────────────────────────────────────────────┐');
  Logger.log('│ TEST 1.1: PageSpeed API via Gateway                     │');
  Logger.log('└─────────────────────────────────────────────────────────┘');
  try {
    const psResult = callGateway('pagespeed_analyze', {
      url: 'https://' + testDomain,
      strategy: 'mobile'
    });
    Logger.log('   Success: ' + psResult.success);
    if (psResult.success && psResult.data) {
      Logger.log('   ✅ PageSpeed Data Received:');
      Logger.log('      - Performance: ' + (psResult.data.scores?.performance || 'N/A'));
      Logger.log('      - SEO: ' + (psResult.data.scores?.seo || 'N/A'));
      Logger.log('      - Accessibility: ' + (psResult.data.scores?.accessibility || 'N/A'));
      Logger.log('      - Best Practices: ' + (psResult.data.scores?.best_practices || 'N/A'));
      Logger.log('   Raw data structure:');
      Logger.log(JSON.stringify(psResult.data, null, 2).substring(0, 1000));
    } else {
      Logger.log('   ❌ PageSpeed FAILED: ' + (psResult.error || 'No data'));
      Logger.log('   Full response: ' + JSON.stringify(psResult));
    }
  } catch (e) {
    Logger.log('   ❌ PageSpeed EXCEPTION: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test Serper API
  Logger.log('┌─────────────────────────────────────────────────────────┐');
  Logger.log('│ TEST 1.2: Serper API via Gateway                        │');
  Logger.log('└─────────────────────────────────────────────────────────┘');
  try {
    const serperResult = callGateway('serper_search', {
      query: 'site:' + testDomain,
      params: { num: 10, gl: 'us' }
    });
    Logger.log('   Success: ' + serperResult.success);
    if (serperResult.success && serperResult.data) {
      Logger.log('   ✅ Serper Data Received:');
      const organic = serperResult.data.organic || [];
      Logger.log('      - Organic results: ' + organic.length);
      if (organic.length > 0) {
        Logger.log('      - First result: ' + (organic[0].title || 'N/A'));
        Logger.log('      - First position: ' + (organic[0].position || 'N/A'));
      }
      Logger.log('   Raw data structure (first 1000 chars):');
      Logger.log(JSON.stringify(serperResult.data, null, 2).substring(0, 1000));
    } else {
      Logger.log('   ❌ Serper FAILED: ' + (serperResult.error || 'No data'));
      Logger.log('   Full response: ' + JSON.stringify(serperResult));
    }
  } catch (e) {
    Logger.log('   ❌ Serper EXCEPTION: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test OpenPageRank API
  Logger.log('┌─────────────────────────────────────────────────────────┐');
  Logger.log('│ TEST 1.3: OpenPageRank API via Gateway                  │');
  Logger.log('└─────────────────────────────────────────────────────────┘');
  try {
    const oprResult = callGateway('opr_get_rank', {
      domain: testDomain
    });
    Logger.log('   Success: ' + oprResult.success);
    if (oprResult.success && oprResult.data) {
      Logger.log('   ✅ OpenPageRank Data Received:');
      Logger.log('      - page_rank_decimal: ' + (oprResult.data.page_rank_decimal || 'N/A'));
      Logger.log('      - rank: ' + (oprResult.data.rank || 'N/A'));
      Logger.log('      - page_rank_integer: ' + (oprResult.data.page_rank_integer || 'N/A'));
      Logger.log('   Raw data structure:');
      Logger.log(JSON.stringify(oprResult.data, null, 2));
    } else {
      Logger.log('   ❌ OpenPageRank FAILED: ' + (oprResult.error || 'No data'));
      Logger.log('   Full response: ' + JSON.stringify(oprResult));
    }
  } catch (e) {
    Logger.log('   ❌ OpenPageRank EXCEPTION: ' + e.toString());
  }
  
  Logger.log('');
  
  // ════════════════════════════════════════════════════════════════════════
  // STEP 2: Test FT_fetchEliteCompetitorData
  // ════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('▶▶▶ STEP 2: TESTING FT_fetchEliteCompetitorData ◀◀◀');
  Logger.log('');
  
  try {
    const eliteResult = FT_fetchEliteCompetitorData(testDomain, {});
    Logger.log('   Success: ' + eliteResult.success);
    Logger.log('   Success Rate: ' + eliteResult.successRate);
    Logger.log('   Execution Time: ' + eliteResult.executionTime + 'ms');
    Logger.log('');
    
    // Check stages
    Logger.log('   STAGES STATUS:');
    if (eliteResult.stages) {
      Object.keys(eliteResult.stages).forEach(function(stage) {
        const stageData = eliteResult.stages[stage];
        Logger.log('   ├── ' + stage + ': ' + (stageData.success ? '✅ SUCCESS' : '❌ FAILED'));
        if (stageData.success && stageData.data) {
          // Log key data points
          if (stage === 'pageSpeed') {
            Logger.log('   │   └── seo: ' + (stageData.data.scores?.seo || 'N/A'));
            Logger.log('   │   └── performance: ' + (stageData.data.scores?.performance || 'N/A'));
          } else if (stage === 'openPageRank') {
            Logger.log('   │   └── page_rank_decimal: ' + (stageData.data.page_rank_decimal || 'N/A'));
            Logger.log('   │   └── rank: ' + (stageData.data.rank || 'N/A'));
          } else if (stage === 'serper') {
            Logger.log('   │   └── organic count: ' + ((stageData.data.organic || []).length));
          }
        } else if (stageData.error) {
          Logger.log('   │   └── Error: ' + stageData.error);
        }
      });
    }
    
    Logger.log('');
    Logger.log('   SYNTHESIZED DATA (combinedData):');
    if (eliteResult.combinedData) {
      const cd = eliteResult.combinedData;
      Logger.log('   ├── technical.seoScore: ' + (cd.technical?.seoScore || 'N/A'));
      Logger.log('   ├── technical.performanceScore: ' + (cd.technical?.performanceScore || 'N/A'));
      Logger.log('   ├── authority.pageRank: ' + (cd.authority?.pageRank || 'N/A'));
      Logger.log('   ├── authority.domainRank: ' + (cd.authority?.domainRank || 'N/A'));
      Logger.log('   └── seo.organic length: ' + ((cd.seo?.organic || []).length));
    }
    
  } catch (e) {
    Logger.log('   ❌ FT_fetchEliteCompetitorData EXCEPTION: ' + e.toString());
  }
  
  Logger.log('');
  
  // ════════════════════════════════════════════════════════════════════════
  // STEP 3: Test enrichWithAPIs
  // ════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('▶▶▶ STEP 3: TESTING enrichWithAPIs ◀◀◀');
  Logger.log('');
  
  try {
    // Create mock competitor data as it would come from fetchAllCompetitorData
    const mockCompetitorData = {};
    const eliteResult = FT_fetchEliteCompetitorData(testDomain, {});
    
    if (eliteResult.success) {
      mockCompetitorData[testDomain] = {
        domain: testDomain,
        fetchSuccess: true,
        stages: eliteResult.stages,
        synthesized: eliteResult.combinedData
      };
      
      // Call enrichWithAPIs
      const enrichedData = enrichWithAPIs(mockCompetitorData);
      
      Logger.log('   ENRICHED DATA for ' + testDomain + ':');
      if (enrichedData && enrichedData[testDomain]) {
        const ed = enrichedData[testDomain];
        Logger.log('');
        Logger.log('   ├── stages preserved: ' + (!!ed.stages));
        Logger.log('   ├── synthesized preserved: ' + (!!ed.synthesized));
        Logger.log('   ├── apiData present: ' + (!!ed.apiData));
        Logger.log('   ├── snapshot present: ' + (!!ed.snapshot));
        Logger.log('   ├── processedMetrics present: ' + (!!ed.processedMetrics));
        Logger.log('');
        
        if (ed.apiData) {
          Logger.log('   APIDATA STRUCTURE:');
          Logger.log('   ├── pageSpeed.scores.seo: ' + (ed.apiData.pageSpeed?.scores?.seo || 'N/A'));
          Logger.log('   ├── pageSpeed.scores.performance: ' + (ed.apiData.pageSpeed?.scores?.performance || 'N/A'));
          Logger.log('   ├── openPageRank.page_rank_decimal: ' + (ed.apiData.openPageRank?.page_rank_decimal || 'N/A'));
          Logger.log('   ├── openPageRank.rank: ' + (ed.apiData.openPageRank?.rank || 'N/A'));
          Logger.log('   └── serper.organicKeywords: ' + (ed.apiData.serper?.organicKeywords || 'N/A'));
        }
        
        // ✅ NEW: Check processedMetrics (pre-computed for UI)
        if (ed.processedMetrics) {
          Logger.log('');
          Logger.log('   ✅ PROCESSED METRICS (pre-computed):');
          Logger.log('   ├── seoScore: ' + (ed.processedMetrics.seoScore || 'N/A'));
          Logger.log('   ├── performanceScore: ' + (ed.processedMetrics.performanceScore || 'N/A'));
          Logger.log('   ├── pageRank: ' + (ed.processedMetrics.pageRank || 'N/A'));
          Logger.log('   ├── domainRank: ' + (ed.processedMetrics.domainRank || 'N/A'));
          Logger.log('   ├── authorityMomentum: ' + (ed.processedMetrics.authorityMomentum || 'N/A'));
          Logger.log('   ├── siteHealth: ' + (ed.processedMetrics.siteHealth || 'N/A'));
          Logger.log('   ├── organicKeywords: ' + (ed.processedMetrics.organicKeywords || 'N/A'));
          Logger.log('   └── overallScore: ' + (ed.processedMetrics.overallScore || 'N/A'));
        } else {
          Logger.log('');
          Logger.log('   ⚠️ NO PROCESSED METRICS - enrichWithAPIs not populating correctly');
        }
        
        // Full JSON for debugging
        Logger.log('');
        Logger.log('   FULL ENRICHED DATA (first 2000 chars):');
        Logger.log(JSON.stringify(ed, null, 2).substring(0, 2000));
      }
    } else {
      Logger.log('   ❌ Cannot test enrichWithAPIs - FT_fetchEliteCompetitorData failed');
    }
    
  } catch (e) {
    Logger.log('   ❌ enrichWithAPIs EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
  }
  
  Logger.log('');
  
  // ════════════════════════════════════════════════════════════════════════
  // STEP 4: Test transformCompetitorsForUI
  // ════════════════════════════════════════════════════════════════════════
  Logger.log('');
  Logger.log('▶▶▶ STEP 4: TESTING transformCompetitorsForUI ◀◀◀');
  Logger.log('');
  
  try {
    // Create mock competitor data
    const mockCompetitorData = {};
    const eliteResult = FT_fetchEliteCompetitorData(testDomain, {});
    
    if (eliteResult.success) {
      mockCompetitorData[testDomain] = {
        domain: testDomain,
        fetchSuccess: true,
        stages: eliteResult.stages,
        synthesized: eliteResult.combinedData
      };
      
      const enrichedData = enrichWithAPIs(mockCompetitorData);
      const competitorsArray = Object.values(enrichedData);
      
      // Call transformCompetitorsForUI
      const transformedData = transformCompetitorsForUI(competitorsArray);
      
      Logger.log('   TRANSFORMED DATA:');
      if (transformedData && transformedData.length > 0) {
        const td = transformedData[0];
        Logger.log('');
        Logger.log('   PROCESSED METRICS:');
        Logger.log('   ├── seoScore: ' + (td.processedMetrics?.seoScore || 'N/A'));
        Logger.log('   ├── performanceScore: ' + (td.processedMetrics?.performanceScore || 'N/A'));
        Logger.log('   ├── pageSpeed: ' + (td.processedMetrics?.pageSpeed || 'N/A'));
        Logger.log('   ├── pageRank: ' + (td.processedMetrics?.pageRank || 'N/A'));
        Logger.log('   ├── domainRank: ' + (td.processedMetrics?.domainRank || 'N/A'));
        Logger.log('   ├── authorityMomentum: ' + (td.processedMetrics?.authorityMomentum || 'N/A'));
        Logger.log('   ├── siteHealth: ' + (td.processedMetrics?.siteHealth || 'N/A'));
        Logger.log('   ├── organicKeywords: ' + (td.processedMetrics?.organicKeywords || 'N/A'));
        Logger.log('   ├── estimatedTraffic: ' + (td.processedMetrics?.estimatedTraffic || 'N/A'));
        Logger.log('   └── overallScore: ' + (td.processedMetrics?.overallScore || 'N/A'));
        
        // Full JSON
        Logger.log('');
        Logger.log('   FULL TRANSFORMED DATA (first 2000 chars):');
        Logger.log(JSON.stringify(td, null, 2).substring(0, 2000));
      } else {
        Logger.log('   ❌ No transformed data returned');
      }
    }
    
  } catch (e) {
    Logger.log('   ❌ transformCompetitorsForUI EXCEPTION: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🔬 DIAGNOSTIC TEST COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('NEXT STEPS:');
  Logger.log('1. If APIs return data → Check enrichWithAPIs transformation');
  Logger.log('2. If enrichWithAPIs works → Check transformCompetitorsForUI');
  Logger.log('3. If transform works → Check UI rendering (property paths)');
  Logger.log('');
}

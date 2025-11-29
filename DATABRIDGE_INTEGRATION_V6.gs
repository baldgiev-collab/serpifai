/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABRIDGE INTEGRATION FOR FORENSIC ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Replace the existing multi-module fetcher phase with ONE-SHOT forensic scan
 * This populates ALL 15 categories in a single request
 * 
 * @module DataBridgeIntegration
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * UPDATED: Collector with One-Shot Forensic Engine
 * Replace COLLECTOR_gatherAllData in enhanced_data_collector.gs with this version
 */
function COLLECTOR_gatherAllData_V6(url, projectContext) {
  // Validate required parameters
  if (!url || url === 'undefined' || url === '') {
    Logger.log('❌ Invalid URL parameter: ' + url);
    return {
      success: false,
      error: 'URL parameter is required and cannot be empty',
      domain: 'unknown',
      collectionSummary: { completeness: 0 }
    };
  }
  
  Logger.log('🔍 V6 Elite: ONE-SHOT Forensic Scan for: ' + url);
  
  var startTime = new Date().getTime();
  var domain = extractDomain_(url);
  
  var result = {
    domain: domain,
    url: url,
    collectedAt: new Date().toISOString(),
    rawData: {
      fetcher: {},
      apis: {}
    },
    dataQuality: {
      fetcherSuccess: [],
      fetcherFailed: [],
      apiSuccess: [],
      apiFailed: []
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: ONE-SHOT FORENSIC SCAN (Replaces 7 separate fetcher calls)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('🚀 Phase 1: Full Forensic Scan (15-Category Evidence)...');
  
  try {
    var forensicResult = APIS_fetcherCall({
      action: 'fetch:fullScan',
      payload: {
        url: url,
        competitorUrls: projectContext.competitors || []
      }
    });
    
    if (forensicResult && forensicResult.ok && forensicResult.forensics) {
      Logger.log('✅ Forensic scan complete');
      
      // Map forensics to result structure
      result.rawData.fetcher = forensicResult.forensics;
      
      // Mark all sub-modules as successful
      var successModules = [
        'metadata',        // Cat I - Narrative
        'headings',        // Cat III, IV - AI Footprint
        'schema',          // Cat II - E-E-A-T
        'tech_audit',      // Cat III - Technical
        'cro_analysis',    // Cat VII - Conversion
        'velocity',        // Cat IV - Freshness
        'ai_footprint',    // Cat IV, VI - AI Detection
        'systems'          // Cat VI - Automation
      ];
      
      successModules.forEach(function(mod) {
        result.dataQuality.fetcherSuccess.push(mod);
      });
      
      // Log forensic highlights
      Logger.log('  🎯 Humanity Score: ' + forensicResult.forensics.content_intel.humanity_score);
      Logger.log('  ⚡ Friction Level: ' + forensicResult.forensics.conversion.friction_level);
      Logger.log('  🏢 CMS Detected: ' + forensicResult.forensics.market_intel.cms);
      Logger.log('  🔒 Security Headers: ' + JSON.stringify(forensicResult.forensics.technical.security_headers));
      
    } else {
      Logger.log('❌ Forensic scan failed: ' + (forensicResult ? forensicResult.error : 'Unknown error'));
      result.dataQuality.fetcherFailed.push('fullScan');
    }
    
  } catch (forensicError) {
    Logger.log('❌ Forensic scan exception: ' + forensicError);
    result.dataQuality.fetcherFailed.push('fullScan');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: API DATA COLLECTION (Unchanged - OpenPageRank, PageSpeed, Serper)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📥 Phase 2: API data collection...');
  
  // 1. OpenPageRank API (Domain Authority)
  try {
    var oprData = OPR_getDomainInfo({ domain: domain });
    if (oprData && oprData.ok) {
      result.rawData.apis.openpagerank = {
        pageRank: oprData.page_rank_decimal || 0,
        rank: oprData.rank || 0,
        domain: domain
      };
      result.dataQuality.apiSuccess.push('openpagerank');
      Logger.log('  ✅ OpenPageRank: ' + result.rawData.apis.openpagerank.pageRank);
    } else {
      result.dataQuality.apiFailed.push('openpagerank');
      Logger.log('  ⚠️ OpenPageRank failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('openpagerank');
    Logger.log('  ❌ OpenPageRank error: ' + e);
  }
  
  // 2. PageSpeed Insights API (Performance Score)
  try {
    var pagespeedData = PAGESPEED_analyze({ url: url });
    if (pagespeedData && pagespeedData.ok) {
      result.rawData.apis.pagespeed = {
        performanceScore: pagespeedData.performanceScore || 0,
        fcp: pagespeedData.firstContentfulPaint || 0,
        lcp: pagespeedData.largestContentfulPaint || 0,
        cls: pagespeedData.cumulativeLayoutShift || 0,
        tbt: pagespeedData.totalBlockingTime || 0
      };
      result.dataQuality.apiSuccess.push('pagespeed');
      Logger.log('  ✅ PageSpeed: ' + result.rawData.apis.pagespeed.performanceScore);
    } else {
      result.dataQuality.apiFailed.push('pagespeed');
      Logger.log('  ⚠️ PageSpeed failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('pagespeed');
    Logger.log('  ❌ PageSpeed error: ' + e);
  }
  
  // 3. Serper API (Keyword & SERP data)
  try {
    var serperData = SERPER_getDomainOverview({ domain: domain });
    if (serperData && serperData.ok) {
      result.rawData.apis.serper = {
        organicKeywords: serperData.organicKeywords || 0,
        paidKeywords: serperData.paidKeywords || 0,
        organicTraffic: serperData.organicTraffic || 0,
        paidTraffic: serperData.paidTraffic || 0,
        serpFeatures: serperData.serpFeatures || [],
        topKeywords: serperData.topKeywords || [],
        rankingDistribution: serperData.rankingDistribution || {},
        organicCompetitors: serperData.competitors || []
      };
      result.dataQuality.apiSuccess.push('serper');
      Logger.log('  ✅ Serper: ' + result.rawData.apis.serper.organicKeywords + ' keywords');
    } else {
      result.dataQuality.apiFailed.push('serper');
      Logger.log('  ⚠️ Serper failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('serper');
    Logger.log('  ❌ Serper error: ' + e);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: Calculate Collection Summary
  // ═══════════════════════════════════════════════════════════════════════════
  
  var elapsedTime = new Date().getTime() - startTime;
  var fetcherSuccessCount = result.dataQuality.fetcherSuccess.length;
  var apiSuccessCount = result.dataQuality.apiSuccess.length;
  var totalModules = 8 + 3; // 8 fetcher modules + 3 APIs
  var completeness = Math.round(((fetcherSuccessCount + apiSuccessCount) / totalModules) * 100);
  
  result.collectionSummary = {
    completeness: completeness,
    fetcherSuccess: fetcherSuccessCount,
    fetcherFailed: result.dataQuality.fetcherFailed.length,
    apiSuccess: apiSuccessCount,
    apiFailed: result.dataQuality.apiFailed.length,
    elapsedMs: elapsedTime
  };
  
  Logger.log('✅ Data collection complete for ' + domain);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  Logger.log('   Fetcher: ' + fetcherSuccessCount + '/8 success');
  Logger.log('   APIs: ' + apiSuccessCount + '/3 success');
  Logger.log('   Completeness: ' + completeness + '%');
  
  return result;
}

/**
 * Batch collector with V6 Forensic Engine
 * Replace COLLECTOR_gatherBatchData with this version
 */
function COLLECTOR_gatherBatchData_V6(urls, projectContext) {
  Logger.log('🚀 V6 Batch forensic scan for ' + urls.length + ' competitors');
  
  var startTime = new Date().getTime();
  var results = {};
  var successCount = 0;
  var failCount = 0;
  var retryDelays = {};
  
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var domain = extractDomain_(url);
    var maxRetries = 3;
    var retryCount = 0;
    var success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        var data = COLLECTOR_gatherAllData_V6(url, projectContext);
        if (data && data.domain) {
          results[data.domain] = data;
          successCount++;
          success = true;
        } else {
          failCount++;
          break;
        }
      } catch (e) {
        var errorStr = String(e);
        
        // Check if it's a 429 rate limit error
        if (errorStr.indexOf('429') !== -1 || errorStr.indexOf('rate limit') !== -1) {
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: 5s, 10s, 20s
            var delay = Math.pow(2, retryCount) * 2500;
            Logger.log('⚠️ Rate limited for ' + url + ' (attempt ' + retryCount + '/' + maxRetries + ')');
            Logger.log('   Waiting ' + (delay / 1000) + 's before retry...');
            Utilities.sleep(delay);
          } else {
            Logger.log('❌ Max retries reached for ' + url + ' after ' + retryCount + ' attempts');
            failCount++;
          }
        } else {
          Logger.log('❌ Failed to collect data for ' + url + ': ' + e);
          failCount++;
          break;
        }
      }
    }
    
    // Rate limiting: Wait 3 seconds between requests
    if (i < urls.length - 1) {
      Utilities.sleep(3000);
    }
  }
  
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('✅ V6 Batch collection complete');
  Logger.log('   Success: ' + successCount + '/' + urls.length);
  Logger.log('   Failed: ' + failCount);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  
  return {
    success: successCount > 0,
    successCount: successCount,
    failCount: failCount,
    elapsedMs: elapsedTime,
    competitors: results
  };
}

/**
 * Helper: Extract domain from URL
 */
function extractDomain_(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
}

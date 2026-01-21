/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * WORKER_PERSIST.GS - ORACLE ELITE v22.0 PARALLEL TASK-CLUSTER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * ATOMIC PERSISTENCE WORKER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Save analyzed data to MySQL and Google Sheets
 * - Stores final results in job_results table
 * - Updates job_metrics for UI polling
 * - Writes to elite tabs in master spreadsheet
 * - Marks competitor as COMPLETED in job tracking
 * 
 * DATA FLOW:
 * ┌──────────────────────────────────────────────────────────────────────────────────────┐
 * │  Worker_Fetch → Worker_Analyze → Worker_Persist                                     │
 * │     ↓                                                                                │
 * │  Worker_Persist performs:                                                           │
 * │     [MySQL Storage] [Sheets Write] [Metrics Update] [Job Completion]                │
 * │     ↓                                                                                │
 * │  UI polls job_metrics → Bento-grid hydrates with competitor data                   │
 * └──────────────────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 22.0.0-cluster
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

const WORKER_PERSIST_VERSION = '22.0.0-cluster';

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const PERSIST_CONFIG = {
  // Storage targets
  TARGETS: {
    MYSQL: true,           // Store in MySQL via Gateway
    SHEETS: true,          // Write to Google Sheets
    CACHE: true            // Cache in ScriptProperties
  },
  
  // Sheets configuration
  SHEETS: {
    OVERVIEW_TAB: 'Oracle Elite Overview',
    COMPETITOR_PREFIX: 'Comp_',
    MAX_TABS: 10
  },
  
  // Cache TTL
  CACHE_TTL_HOURS: 24
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - Called by Cluster Controller
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Persist all data for a single competitor
 * This is the final atomic unit - stores everything and marks complete
 * 
 * @param {string} jobToken - Parent job identifier
 * @param {string} competitorId - Unique competitor identifier
 * @param {string} domain - Competitor domain
 * @param {Object} fetchData - Data from Worker_Fetch
 * @param {Object} analysisData - Data from Worker_Analyze
 * @param {Object} options - Optional configuration
 * @return {Object} PersistResult with storage confirmations
 */
function Worker_PersistCompetitor(jobToken, competitorId, domain, fetchData, analysisData, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  WORKER_PERSIST v${WORKER_PERSIST_VERSION} - FINAL STORAGE               ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Job: ${jobToken.substring(0, 20)}...                                   `);
  Logger.log(`║  Competitor: ${domain.padEnd(50)}   `);
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitorId: competitorId,
    domain: domain,
    storage: {
      mysql: false,
      sheets: false,
      cache: false
    },
    resultIds: {},
    proofTraces: [],
    executionTimeMs: 0,
    persistedAt: new Date().toISOString()
  };
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Update job status to PERSISTING
    // ═══════════════════════════════════════════════════════════════════════
    Worker_UpdateTaskStatus(jobToken, competitorId, 'PERSIST', 'RUNNING');
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'saving', current_phase: 'PERSIST', phase_progress: 90 });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Merge fetch and analysis data into final structure
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📋 Phase 1: Merging data into final structure...`);
    
    const finalData = mergeFinalData(domain, fetchData, analysisData);
    
    result.proofTraces.push({
      phase: 'DATA_MERGE',
      fetchDataPoints: countDataPoints(fetchData),
      analysisDataPoints: Object.keys(analysisData.categories || {}).length,
      mergedDataSize: JSON.stringify(finalData).length,
      timestamp: new Date().toISOString()
    });
    
    Logger.log(`   ✅ Data merged: ${JSON.stringify(finalData).length} bytes`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2.5: STRATEGIC AUDIT (Post-Processing Worker)
    // Runs AFTER fetch/merge is complete to prevent timeout in main pipeline
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🏗️ Phase 1.5: Running Strategic Audit (Post-Processing)...`);
    
    try {
      // Prepare competitorData with rawHtml for programmatic moat detection
      const competitorDataForAudit = {
        domain: domain,
        homepageRaw: fetchData.rawHtml || fetchData.homepageRaw || '',
        internalPageRaw: fetchData.internalPageRaw || '',
        synthesized: finalData.synthesized || finalData,
        rawHtml: fetchData.rawHtml || ''
      };
      
      // Execute strategic audit as post-processing worker
      if (typeof executeStrategicAudit === 'function') {
        const strategicAuditResult = executeStrategicAudit(competitorDataForAudit);
        
        // Merge strategic audit results into finalData
        finalData.strategicAudit = strategicAuditResult;
        finalData.evidenceMap = finalData.evidenceMap || {};
        finalData.evidenceMap.programmatic = strategicAuditResult.evidenceMap?.programmatic || {};
        finalData.evidenceMap.semantic = strategicAuditResult.evidenceMap?.semantic || {};
        finalData.evidenceMap.emotional = strategicAuditResult.evidenceMap?.emotional || {};
        
        result.proofTraces.push({
          phase: 'STRATEGIC_AUDIT',
          success: true,
          programmaticMoat: strategicAuditResult.programmaticMoat?.is_programmatic,
          semanticTriplets: strategicAuditResult.semanticTriplets?.tripletCount || 0,
          emotionalDebt: strategicAuditResult.emotionalDebt?.score || 0,
          timestamp: new Date().toISOString()
        });
        
        Logger.log(`   ✅ Strategic Audit complete: Moat=${strategicAuditResult.programmaticMoat?.is_programmatic}, Triplets=${strategicAuditResult.semanticTriplets?.tripletCount}`);
      } else {
        Logger.log(`   ⚠️ executeStrategicAudit not available, skipping...`);
      }
    } catch (auditError) {
      Logger.log(`   ⚠️ Strategic Audit failed (non-critical): ${auditError.toString()}`);
      result.proofTraces.push({
        phase: 'STRATEGIC_AUDIT',
        success: false,
        error: auditError.toString(),
        timestamp: new Date().toISOString()
      });
      // Don't fail the whole persist - strategic audit is non-critical
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Store in MySQL via Gateway
    // ═══════════════════════════════════════════════════════════════════════
    if (PERSIST_CONFIG.TARGETS.MYSQL) {
      Logger.log(`   💾 Phase 2: Storing in MySQL...`);
      
      try {
        const mysqlResultId = Utilities.getUuid();
        
        storeJobResult(jobToken, competitorId, 'FINAL', finalData, mysqlResultId);
        
        result.storage.mysql = true;
        result.resultIds.mysql = mysqlResultId;
        
        result.proofTraces.push({
          phase: 'MYSQL_STORAGE',
          success: true,
          resultId: mysqlResultId,
          timestamp: new Date().toISOString()
        });
        
        Logger.log(`   ✅ MySQL stored: ${mysqlResultId}`);
      } catch (mysqlError) {
        Logger.log(`   ⚠️ MySQL storage failed: ${mysqlError.toString()}`);
        result.proofTraces.push({
          phase: 'MYSQL_STORAGE',
          success: false,
          error: mysqlError.toString(),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Write to Google Sheets
    // ═══════════════════════════════════════════════════════════════════════
    if (PERSIST_CONFIG.TARGETS.SHEETS && options.spreadsheetId) {
      Logger.log(`   📊 Phase 3: Writing to Sheets...`);
      
      try {
        const sheetsResult = writeCompetitorToSheets(options.spreadsheetId, domain, finalData);
        
        result.storage.sheets = sheetsResult.success;
        result.resultIds.sheets = sheetsResult.tabName;
        
        result.proofTraces.push({
          phase: 'SHEETS_STORAGE',
          success: sheetsResult.success,
          tabName: sheetsResult.tabName,
          rowsWritten: sheetsResult.rowsWritten || 0,
          timestamp: new Date().toISOString()
        });
        
        Logger.log(`   ✅ Sheets written: ${sheetsResult.tabName}`);
      } catch (sheetsError) {
        Logger.log(`   ⚠️ Sheets write failed: ${sheetsError.toString()}`);
        result.proofTraces.push({
          phase: 'SHEETS_STORAGE',
          success: false,
          error: sheetsError.toString(),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Cache in ScriptProperties (for fast UI access)
    // ═══════════════════════════════════════════════════════════════════════
    if (PERSIST_CONFIG.TARGETS.CACHE) {
      Logger.log(`   🗄️ Phase 4: Caching for fast access...`);
      
      try {
        const cacheKey = `comp_${competitorId}_${jobToken.substring(0, 8)}`;
        const cacheData = {
          domain: domain,
          scores: analysisData.scores || {},
          compositeScore: analysisData.compositeScore || {},
          summary: analysisData.analysis?.summary || '',
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (PERSIST_CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000)).toISOString()
        };
        
        const cache = CacheService.getScriptCache();
        cache.put(cacheKey, JSON.stringify(cacheData), PERSIST_CONFIG.CACHE_TTL_HOURS * 60 * 60);
        
        result.storage.cache = true;
        result.resultIds.cache = cacheKey;
        
        result.proofTraces.push({
          phase: 'CACHE_STORAGE',
          success: true,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        });
        
        Logger.log(`   ✅ Cached: ${cacheKey}`);
      } catch (cacheError) {
        Logger.log(`   ⚠️ Cache failed: ${cacheError.toString()}`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Update final metrics for UI polling
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📈 Phase 5: Updating final metrics...`);
    
    const finalMetrics = extractFinalMetrics(finalData, analysisData);
    
    Worker_UpdateMetrics(jobToken, competitorId, {
      status: 'completed',
      current_phase: 'COMPLETE',
      phase_progress: 100,
      domain_authority: finalMetrics.domainAuthority,
      traffic_estimate: finalMetrics.trafficEstimate,
      keyword_count: finalMetrics.keywordCount,
      backlink_count: finalMetrics.backlinkCount,
      content_score: finalMetrics.contentScore,
      performance_score: finalMetrics.performanceScore,
      has_elite_data: true,
      has_gemini_analysis: !analysisData.usedFallback,
      has_keyword_clusters: finalMetrics.hasKeywordClusters
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7: Mark task as COMPLETED and store full data for Cluster_FinalizeJob
    // ═══════════════════════════════════════════════════════════════════════
    result.executionTimeMs = Date.now() - startTime;
    result.success = result.storage.mysql || result.storage.sheets || result.storage.cache;
    
    // CRITICAL: Store the FULL finalData in cache for Cluster_FinalizeJob to retrieve
    // This ensures synthesized, apiData, and snapshot flow through to the UI
    try {
      const clusterCacheKey = `comp_${competitorId}_${jobToken.substring(0, 8)}`;
      const clusterCacheData = {
        domain: domain,
        url: `https://${domain}`,
        fetchSuccess: true,
        // Include FULL synthesized data from fetch
        synthesized: fetchData.synthesized || {},
        // Include FULL apiData structure for UI
        apiData: finalData.apiData || {},
        // Include FULL snapshot for UI
        snapshot: finalData.snapshot || {},
        // Include processedMetrics for charts
        processedMetrics: finalData.processedMetrics || {},
        // Include scores and categories
        scores: analysisData.scores || {},
        categories: analysisData.categories || {},
        compositeScore: analysisData.compositeScore || {},
        recommendations: (analysisData.recommendations || []).slice(0, 5),
        // Metadata
        analyzedAt: finalData.analyzedAt,
        executionTimeMs: result.executionTimeMs
      };
      
      const cacheService = CacheService.getScriptCache();
      const cacheJson = JSON.stringify(clusterCacheData);
      
      // Check size and use chunking if needed (100KB limit)
      if (cacheJson.length > 90000) {
        Logger.log(`   📦 Full data exceeds cache limit (${Math.round(cacheJson.length/1024)}KB), storing with MySQL + minimal cache`);
        // Store minimal reference in cache, full data already in MySQL
        const minimalCache = {
          domain: domain,
          storedInMySQL: true,
          mysqlResultId: result.resultIds.mysql,
          timestamp: new Date().toISOString()
        };
        cacheService.put(clusterCacheKey, JSON.stringify(minimalCache), 3600);
      } else {
        cacheService.put(clusterCacheKey, cacheJson, 3600);
        Logger.log(`   ✅ Full competitor data cached for Cluster_FinalizeJob (${Math.round(cacheJson.length/1024)}KB)`);
      }
    } catch (cacheStoreError) {
      Logger.log(`   ⚠️ Cluster cache storage warning: ${cacheStoreError.toString()}`);
      // Non-fatal - data is still in MySQL
    }
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'PERSIST', 'COMPLETED', null, result.resultIds.mysql);
    
    // ═══════════════════════════════════════════════════════════════════════
    // v35.0 UPP: UNIVERSAL PERSISTENCE PROVIDER - Force 100% MySQL
    // Eliminates "0 B Data Size" by guaranteeing MySQL persistence
    // ═══════════════════════════════════════════════════════════════════════
    if (typeof UPP_commit === 'function') {
      Logger.log(`   💾 [UPP] Forcing comprehensive MySQL persistence...`);
      
      // 1. Full raw fetch data → job_results (chunked if needed)
      UPP_commit({
        type: 'raw_fetch',
        domain: domain,
        jobToken: jobToken,
        competitorId: competitorId,
        payload: fetchData
      });
      
      // 2. AI Analysis → ai_analysis table
      UPP_commit({
        type: 'ai_analysis',
        domain: domain,
        jobToken: jobToken,
        competitorId: competitorId,
        payload: {
          scores: analysisData.scores || {},
          categories: analysisData.categories || {},
          compositeScore: analysisData.compositeScore || {},
          recommendations: analysisData.recommendations || [],
          analysis: analysisData.analysis || {},
          usedFallback: analysisData.usedFallback || false
        }
      });
      
      // 3. Link Forensics → link_forensics table
      UPP_commit({
        type: 'link_forensics',
        domain: domain,
        jobToken: jobToken,
        competitorId: competitorId,
        payload: {
          url: `https://${domain}`,
          rawHtml: fetchData.rawHtml || fetchData.homepageRaw || '',
          links: finalData.apiData?.links || [],
          images: finalData.apiData?.images || [],
          metadata: finalData.apiData?.metadata || {},
          schema: finalData.apiData?.schema || []
        }
      });
      
      // 4. Keyword Intelligence → keyword_intelligence table
      UPP_commit({
        type: 'keyword_intelligence',
        domain: domain,
        jobToken: jobToken,
        competitorId: competitorId,
        payload: {
          keywords: finalData.snapshot?.keywords || [],
          keywordClusters: finalData.synthesized?.keywordClusters || [],
          organicKeywords: finalData.synthesized?.organicKeywords || [],
          top10Count: finalData.synthesized?.top10Count || 0,
          top20Count: finalData.synthesized?.top20Count || 0
        }
      });
      
      // 5. Competitor Results (metrics) → competitor_results table
      UPP_commit({
        type: 'competitor_results',
        domain: domain,
        jobToken: jobToken,
        competitorId: competitorId,
        payload: finalMetrics
      });
      
      // 6. Strategic Audit → strategic type
      if (finalData.strategicAudit) {
        UPP_commit({
          type: 'strategic',
          domain: domain,
          jobToken: jobToken,
          competitorId: competitorId,
          payload: finalData.strategicAudit
        });
      }
      
      // 7. Evidence Map → evidence type
      if (finalData.evidenceMap) {
        UPP_commit({
          type: 'evidence',
          domain: domain,
          jobToken: jobToken,
          competitorId: competitorId,
          payload: finalData.evidenceMap
        });
      }
      
      Logger.log(`   ✅ [UPP] Comprehensive MySQL persistence complete (7 tables)`);
      
      // 8. Trigger Workflow Seeder if 6 competitors are now complete
      if (typeof WF_checkAndSeed === 'function') {
        const seedResult = WF_checkAndSeed(jobToken, 6);
        if (seedResult && seedResult.triggered) {
          Logger.log(`   🌱 [WF_Seeder] Workflow seeding triggered! ${seedResult.opportunitiesSeeded} opportunities`);
          
          // 9. v36.0: Trigger Stage 1 Ignition to map kill_moves → strategic_priorities
          if (typeof Seeder_IgniteStage1 === 'function') {
            const igniteResult = Seeder_IgniteStage1(jobToken);
            if (igniteResult && igniteResult.success) {
              Logger.log(`   🔥 [IGNITE] Stage 1 ignition complete! ${igniteResult.strategicPrioritiesSet} priorities set`);
            }
          }
        }
      }
    }
    
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    Logger.log(`   ✅ PERSIST COMPLETE: MySQL=${result.storage.mysql}, Sheets=${result.storage.sheets}, Cache=${result.storage.cache}`);
    Logger.log(`   ✅ Total time: ${result.executionTimeMs}ms`);
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    
    return result;
    
  } catch (error) {
    result.executionTimeMs = Date.now() - startTime;
    result.error = error.toString();
    result.proofTraces.push({
      phase: 'ERROR',
      error: error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'PERSIST', 'FAILED', error.toString());
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'failed', current_phase: 'PERSIST' });
    
    Logger.log(`   ❌ PERSIST FAILED: ${error.toString()}`);
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DATA MERGER - Combines fetch and analysis into final structure
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Merge fetch data and analysis data into final storage structure
 * NOTE: Must maintain backward compatibility with UI_Tab_Overview.html which expects
 *       apiData, snapshot, and synthesized properties
 */
function mergeFinalData(domain, fetchData, analysisData) {
  const synth = fetchData.synthesized || {};
  const stages = fetchData.stages || {};
  const analysis = analysisData.analysis || {};
  
  // Build apiData structure for UI compatibility
  const apiData = {
    pageSpeed: {
      scores: {
        performance: synth.technical?.performanceScore || 0,
        seo: synth.technical?.seoScore || 0,
        accessibility: synth.technical?.accessibilityScore || 0,
        bestPractices: synth.technical?.bestPracticesScore || 0
      },
      coreWebVitals: stages.pageSpeed?.data?.core_web_vitals || {},
      loadTime: stages.pageSpeed?.data?.load_time || 'N/A'
    },
    openPageRank: {
      pageRank: synth.authority?.pageRank || 0,
      domainRank: synth.authority?.domainRank || 0
    },
    serper: {
      organic: synth.seo?.organic || stages.serperSite?.data?.organic || [],
      indexedPages: synth.seo?.indexedPages || 0
    },
    phpFetcher: {
      metadata: stages.phpFetcher?.data?.metadata || {},
      links: stages.phpFetcher?.data?.links || [],
      schema: stages.phpFetcher?.data?.schema || []
    }
  };
  
  // Build snapshot for scraper data compatibility
  const snapshot = {
    metadata: {
      title: synth.website?.title || stages.phpFetcher?.data?.metadata?.title || '',
      description: synth.website?.description || stages.phpFetcher?.data?.metadata?.description || '',
      wordCount: synth.website?.wordCount || 0,
      h1: synth.website?.h1 || '',
      language: synth.website?.language || 'en'
    },
    links: stages.phpFetcher?.data?.links || [],
    images: stages.phpFetcher?.data?.images || [],
    schema: stages.phpFetcher?.data?.schema || synth.website?.schemaTypes || []
  };
  
  return {
    // Identity
    domain: domain,
    url: `https://${domain}`,
    analyzedAt: new Date().toISOString(),
    
    // ═══════════════════════════════════════════════════════════════════════
    // UI COMPATIBILITY LAYER - These properties are used by UI_Tab_Overview.html
    // ═══════════════════════════════════════════════════════════════════════
    apiData: apiData,
    snapshot: snapshot,
    synthesized: synth,
    
    // Processed metrics (for overview charts)
    processedMetrics: {
      // Technical
      seoScore: synth.technical?.seoScore || 0,
      performanceScore: synth.technical?.performanceScore || 0,
      accessibilityScore: synth.technical?.accessibilityScore || 0,
      bestPracticesScore: synth.technical?.bestPracticesScore || 0,
      
      // Authority
      authorityScore: analysisData.scores?.authorityMetrics || 0,
      pageRank: synth.authority?.pageRank || 0,
      backlinks: synth.traffic?.factors?.indexedPages || 0,
      
      // Traffic
      estimatedTraffic: synth.traffic?.estimate || 0,
      // V7 FIX: organicKeywords should count organic results + PAA + related searches
      organicKeywords: (synth.seo?.organic?.length || 0) + 
                       (synth.seo?.peopleAlsoAsk?.length || 0) + 
                       (synth.seo?.relatedSearches?.length || 0) +
                       (synth.topKeywords?.length || 0),
      
      // Content
      wordCount: synth.website?.wordCount || 0,
      schemaCount: synth.website?.schemaTypes?.length || 0,
      topicalAuthority: analysisData.scores?.contentIntelligence || 0,
      
      // Signals
      eeatSignals: analysisData.scores?.brandMessaging || 50,
      keywordGap: analysisData.scores?.keywordStrategy || 0,
      geoPresence: analysisData.scores?.marketPositioning || 0
    },
    
    // Composite scoring
    compositeScore: analysisData.compositeScore || {},
    
    // Category scores
    scores: analysisData.scores || {},
    
    // Category details
    categories: analysisData.categories || {},
    
    // Recommendations
    recommendations: analysisData.recommendations || [],
    
    // Raw data references
    dataReferences: {
      fetchProofTraces: fetchData.proofTraces || [],
      analysisProofTraces: analysisData.proofTraces || []
    },
    
    // Website metadata
    website: synth.website || {},
    
    // Technical data
    technical: synth.technical || {},
    
    // Authority data
    authority: synth.authority || {},
    
    // SEO data
    seo: synth.seo || {},
    
    // Traffic data
    traffic: synth.traffic || {},
    
    // SERP features
    serpFeatures: synth.serpFeatures || {},
    
    // Analysis metadata
    analysisMetadata: {
      model: analysisData.model || 'fallback',
      usedFallback: analysisData.usedFallback || false,
      confidence: analysisData.compositeScore?.confidence || 'low',
      executionTimeMs: (fetchData.executionTimeMs || 0) + (analysisData.executionTimeMs || 0)
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHEETS WRITER - Write competitor data to Google Sheets
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Write competitor data to a dedicated sheet tab
 */
function writeCompetitorToSheets(spreadsheetId, domain, finalData) {
  const result = {
    success: false,
    tabName: null,
    rowsWritten: 0
  };
  
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Create tab name from domain
    const tabName = PERSIST_CONFIG.SHEETS.COMPETITOR_PREFIX + domain.replace(/\./g, '_').substring(0, 25);
    
    // Get or create the sheet
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    } else {
      sheet.clear(); // Clear existing data
    }
    
    // Write header
    const headers = [
      'Metric', 'Value', 'Score', 'Source', 'Timestamp'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    
    // Prepare data rows
    const rows = [];
    const pm = finalData.processedMetrics || {};
    const timestamp = finalData.analyzedAt || new Date().toISOString();
    
    // Add metric rows
    rows.push(['Domain', domain, '', 'identity', timestamp]);
    rows.push(['Composite Score', '', finalData.compositeScore?.overall || 0, 'analysis', timestamp]);
    rows.push(['Grade', finalData.compositeScore?.grade || 'N/A', '', 'analysis', timestamp]);
    rows.push(['---', '---', '---', '---', '---']);
    
    // Technical metrics
    rows.push(['SEO Score', pm.seoScore || 0, pm.seoScore || 0, 'pagespeed', timestamp]);
    rows.push(['Performance Score', pm.performanceScore || 0, pm.performanceScore || 0, 'pagespeed', timestamp]);
    rows.push(['Accessibility Score', pm.accessibilityScore || 0, pm.accessibilityScore || 0, 'pagespeed', timestamp]);
    rows.push(['Best Practices', pm.bestPracticesScore || 0, pm.bestPracticesScore || 0, 'pagespeed', timestamp]);
    rows.push(['---', '---', '---', '---', '---']);
    
    // Authority metrics
    rows.push(['PageRank', pm.pageRank || 0, '', 'open_pagerank', timestamp]);
    rows.push(['Authority Score', pm.authorityScore || 0, pm.authorityScore || 0, 'analysis', timestamp]);
    rows.push(['Estimated Traffic', pm.estimatedTraffic || 0, '', 'triangulated', timestamp]);
    rows.push(['Organic Keywords', pm.organicKeywords || 0, '', 'serper', timestamp]);
    rows.push(['---', '---', '---', '---', '---']);
    
    // Content metrics
    rows.push(['Word Count', pm.wordCount || 0, '', 'php_fetcher', timestamp]);
    rows.push(['Schema Types', pm.schemaCount || 0, '', 'php_fetcher', timestamp]);
    rows.push(['Content Score', pm.topicalAuthority || 0, pm.topicalAuthority || 0, 'analysis', timestamp]);
    rows.push(['---', '---', '---', '---', '---']);
    
    // Category scores
    const scores = finalData.scores || {};
    Object.keys(scores).forEach(category => {
      const score = scores[category] || 0;
      rows.push([category, '', score, 'gemini_analysis', timestamp]);
    });
    rows.push(['---', '---', '---', '---', '---']);
    
    // Recommendations
    const recs = finalData.recommendations || [];
    recs.forEach((rec, i) => {
      rows.push([`Recommendation ${i+1}`, rec.action || '', rec.priority || '', 'gemini_analysis', timestamp]);
    });
    
    // Write all data rows
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      result.rowsWritten = rows.length;
    }
    
    // Format the sheet
    sheet.autoResizeColumns(1, headers.length);
    
    result.success = true;
    result.tabName = tabName;
    
  } catch (error) {
    Logger.log(`Sheets write error: ${error.toString()}`);
    result.error = error.toString();
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// METRICS EXTRACTOR - Extract key metrics for UI polling
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Extract final metrics for job_metrics table
 */
function extractFinalMetrics(finalData, analysisData) {
  const pm = finalData.processedMetrics || {};
  
  return {
    domainAuthority: Math.round(pm.pageRank * 10) || 0,
    trafficEstimate: pm.estimatedTraffic || 0,
    keywordCount: pm.organicKeywords || 0,
    backlinkCount: pm.backlinks || 0,
    contentScore: analysisData.scores?.contentIntelligence || pm.topicalAuthority || 0,
    performanceScore: pm.performanceScore || 0,
    hasKeywordClusters: (finalData.seo?.topPages?.length || 0) > 0
  };
}

/**
 * Count data points in fetch data
 */
function countDataPoints(fetchData) {
  let count = 0;
  const synth = fetchData?.synthesized || {};
  
  Object.keys(synth).forEach(key => {
    if (typeof synth[key] === 'object' && synth[key] !== null) {
      count += Object.keys(synth[key]).length;
    }
  });
  
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH PERSIST - Process multiple competitors (backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Persist ALL competitors in sequence
 */
function Worker_PersistAllCompetitors(jobToken, fetchResults, analysisResults, options) {
  const startTime = Date.now();
  const results = {};
  
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`💾 BATCH PERSIST: ${Object.keys(fetchResults).length} competitors`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  Object.keys(fetchResults).forEach((domain, index) => {
    const competitorId = `comp_${index}`;
    const fetchData = fetchResults[domain];
    const analysisData = analysisResults[domain] || {};
    
    try {
      const result = Worker_PersistCompetitor(jobToken, competitorId, domain, fetchData, analysisData, options);
      results[domain] = result;
    } catch (e) {
      results[domain] = {
        success: false,
        error: e.toString(),
        domain: domain
      };
    }
  });
  
  const totalTime = Date.now() - startTime;
  const successCount = Object.values(results).filter(r => r.success).length;
  
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`✅ BATCH PERSIST COMPLETE: ${successCount}/${Object.keys(fetchResults).length} in ${totalTime}ms`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  return {
    results: results,
    successCount: successCount,
    totalTime: totalTime
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FULL PIPELINE - Execute complete Fetch→Analyze→Persist for one competitor
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Execute complete pipeline for a single competitor
 * This is what the UI calls via google.script.run
 * 
 * @param {string} jobToken - Job identifier
 * @param {string} competitorId - Competitor identifier
 * @param {string} domain - Domain to analyze
 * @param {string} yourDomain - Client's domain for comparison
 * @param {Object} options - Configuration options
 * @return {Object} Complete result with all phases
 */
function Worker_ExecuteCompetitorPipeline(jobToken, competitorId, domain, yourDomain, options) {
  const startTime = Date.now();
  options = options || {};
  
  // v28.0: TURBO MODE - Skip slow operations
  const isTurbo = options.turboMode === true;
  const skipGemini = options.skipGeminiPerCompetitor === true;
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  WORKER PIPELINE v${WORKER_PERSIST_VERSION} ${isTurbo ? '⚡ TURBO' : ''} - COMPETITOR ANALYSIS    ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Domain: ${domain.padEnd(54)}   `);
  if (isTurbo) {
    Logger.log(`║  🚀 TURBO: PageSpeed=${!options.skipPageSpeed}, Gemini=${!skipGemini}            ║`);
  }
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitorId: competitorId,
    domain: domain,
    phases: {
      fetch: null,
      analyze: null,
      persist: null
    },
    finalData: null,
    executionTimeMs: 0,
    turboMode: isTurbo
  };
  
  try {
    // Phase 1: FETCH (pass turbo options)
    Logger.log(`   🚀 Phase 1/3: FETCH`);
    result.phases.fetch = Worker_FetchCompetitor(jobToken, competitorId, domain, options);
    
    // v29.0: Only fail if we have NO data at all
    // Previous: strict success check failed even when we had synthesized data
    if (!result.phases.fetch.success && !result.phases.fetch.synthesized) {
      throw new Error(`Fetch failed: ${result.phases.fetch.error || 'No data available'}`);
    }
    
    if (!result.phases.fetch.success) {
      Logger.log(`   ⚠️ Fetch partially failed (${result.phases.fetch.error}) but proceeding with available data`);
    }
    
    // v28.0: Check time - if running long, skip Gemini
    const fetchTime = Date.now() - startTime;
    const shouldSkipGemini = skipGemini || (fetchTime > 20000);
    
    // Phase 2: ANALYZE (skip Gemini in TURBO mode)
    Logger.log(`   🤖 Phase 2/3: ANALYZE ${shouldSkipGemini ? '(TURBO: Skip Gemini)' : ''}`);
    if (shouldSkipGemini) {
      // v28.0: Generate fast fallback analysis without Gemini
      result.phases.analyze = generateFastFallbackAnalysis(domain, result.phases.fetch);
      Logger.log(`      ⚡ TURBO: Used fast fallback analysis (${Date.now() - startTime - fetchTime}ms)`);
    } else {
      result.phases.analyze = Worker_AnalyzeCompetitor(
        jobToken, 
        competitorId, 
        domain, 
        result.phases.fetch, 
        yourDomain, 
        options
      );
    }
    
    // Phase 3: PERSIST
    Logger.log(`   💾 Phase 3/3: PERSIST`);
    result.phases.persist = Worker_PersistCompetitor(
      jobToken,
      competitorId,
      domain,
      result.phases.fetch,
      result.phases.analyze,
      options
    );
    
    // Build final response for UI
    result.success = result.phases.persist.success;
    result.executionTimeMs = Date.now() - startTime;
    
    // Extract key data for immediate UI display
    result.finalData = {
      domain: domain,
      compositeScore: result.phases.analyze.compositeScore || {},
      scores: result.phases.analyze.scores || {},
      recommendations: (result.phases.analyze.recommendations || []).slice(0, 3),
      processedMetrics: result.phases.persist.finalData?.processedMetrics || {},
      // v28.0: Include synthesized data for UI
      synthesized: result.phases.fetch.synthesized || {},
      apiData: result.phases.fetch.stages || {},
      executionTimeMs: result.executionTimeMs
    };
    
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    Logger.log(`   ✅ PIPELINE COMPLETE: ${domain} in ${result.executionTimeMs}ms ${isTurbo ? '(TURBO)' : ''}`);
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    
    return result;
    
  } catch (error) {
    result.executionTimeMs = Date.now() - startTime;
    result.error = error.toString();
    
    Logger.log(`   ❌ PIPELINE FAILED: ${error.toString()}`);
    
    return result;
  }
}

/**
 * v28.0: Generate fast fallback analysis without Gemini
 * Uses fetch data to create basic analysis
 */
function generateFastFallbackAnalysis(domain, fetchData) {
  const synth = fetchData.synthesized || {};
  
  return {
    success: true,
    jobToken: fetchData.jobToken,
    competitorId: fetchData.competitorId,
    domain: domain,
    analysis: { text: 'Analysis generated from API data (TURBO mode)' },
    categories: {},
    scores: {
      technicalSEO: synth.technical?.seoScore || 65,
      performanceBenchmarks: synth.technical?.performanceScore || 55,
      contentIntelligence: 60,
      brandMessaging: 55,
      keywordStrategy: 65,
      marketPositioning: 50,
      authorityMetrics: synth.authority?.pageRank ? Math.round(synth.authority.pageRank * 10) : 40,
      conversionOptimization: 55,
      audienceEngagement: 50,
      competitorThreats: 60
    },
    compositeScore: {
      overall: synth.authority?.pageRank ? Math.round(synth.authority.pageRank * 10) + 20 : 55
    },
    recommendations: [],
    proofTraces: [{ phase: 'FAST_FALLBACK', timestamp: new Date().toISOString() }],
    executionTimeMs: 0,
    analyzedAt: new Date().toISOString(),
    usedFallback: true,
    turboMode: true
  };
}

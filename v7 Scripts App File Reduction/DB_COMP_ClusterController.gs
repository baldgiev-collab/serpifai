/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * DB_COMP_CLUSTERCONTROLLER.GS - ORACLE ELITE v22.0 PARALLEL TASK-CLUSTER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * CLUSTER CONTROLLER - ORCHESTRATES PARALLEL JOB EXECUTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Create and manage parallel analysis jobs
 * - Creates job in MySQL job_registry
 * - Returns job_token for UI to track
 * - UI fires 6 simultaneous google.script.run calls
 * - Provides status polling endpoint
 * 
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────────────────────────────────────────────┐
 * │  UI calls: Cluster_InitializeJob(projectId, competitors, yourDomain)                │
 * │     ↓ Returns: { jobToken, competitors }                                            │
 * │                                                                                      │
 * │  UI fires 6 parallel calls:                                                         │
 * │     google.script.run.Worker_ExecuteCompetitorPipeline(jobToken, compId, domain)    │
 * │                                                                                      │
 * │  UI polls every 1.5s:                                                               │
 * │     google.script.run.Cluster_GetJobStatus(jobToken)                                │
 * │     ↓ Returns: { progress, competitors[{domain, status, metrics}] }                 │
 * │                                                                                      │
 * │  When all complete, UI calls:                                                       │
 * │     google.script.run.Cluster_FinalizeJob(jobToken)                                 │
 * │     ↓ Returns: { overview, dashboardCharts }                                        │
 * └──────────────────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 22.0.0-cluster
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

const CLUSTER_VERSION = '22.0.0-cluster';

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const CLUSTER_CONFIG = {
  // Job settings
  MAX_COMPETITORS: 10,              // Maximum competitors per job
  JOB_TIMEOUT_MS: 300000,          // 5 minute job timeout
  POLL_INTERVAL_MS: 1500,          // 1.5 second polling interval
  
  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB INITIALIZATION - Creates job in MySQL and returns token
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Initialize a new parallel analysis job
 * Called by UI to start the parallel execution
 * 
 * @param {string} projectId - Project identifier
 * @param {Array} competitors - Array of competitor domains
 * @param {string} yourDomain - Client's domain for comparison
 * @param {Object} options - Optional configuration
 * @return {Object} Job initialization result with token and competitor IDs
 */
function Cluster_InitializeJob(projectId, competitors, yourDomain, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  CLUSTER CONTROLLER v${CLUSTER_VERSION} - JOB INITIALIZATION        ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Project: ${projectId.padEnd(53)}   `);
  Logger.log(`║  Competitors: ${String(competitors.length).padEnd(49)}   `);
  Logger.log(`║  Your Domain: ${(yourDomain || 'N/A').padEnd(49)}   `);
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  // Validate inputs
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    return {
      success: false,
      error: 'No competitors provided'
    };
  }
  
  if (competitors.length > CLUSTER_CONFIG.MAX_COMPETITORS) {
    return {
      success: false,
      error: `Maximum ${CLUSTER_CONFIG.MAX_COMPETITORS} competitors allowed`
    };
  }
  
  try {
    // Generate job token
    const jobToken = Utilities.getUuid();
    
    // Clean and validate domains
    const cleanCompetitors = competitors
      .filter(d => d && typeof d === 'string')
      .map(d => d.replace(/^https?:\/\//, '').replace(/\/$/, ''))
      .filter((d, i, arr) => arr.indexOf(d) === i); // Remove duplicates
    
    // Create competitor entries with IDs
    const competitorEntries = cleanCompetitors.map((domain, index) => ({
      id: `comp_${index}_${Utilities.getUuid().substring(0, 8)}`,
      domain: domain,
      index: index
    }));
    
    // Create job in MySQL
    try {
      const jobResult = callGateway('job_create', {
        job_token: jobToken,
        project_id: projectId,
        user_id: getUserId(),
        your_domain: yourDomain || '',
        competitors: cleanCompetitors,
        competitor_count: cleanCompetitors.length,
        analysis_type: options.analysisType || 'elite'
      });
      
      Logger.log(`   ✅ Job created in MySQL: ${jobToken}`);
    } catch (mysqlError) {
      Logger.log(`   ⚠️ MySQL job creation failed (continuing with local tracking): ${mysqlError.toString()}`);
      // Continue anyway - we can track locally
    }
    
    // Store job info in cache for fast access
    const cache = CacheService.getScriptCache();
    const jobInfo = {
      jobToken: jobToken,
      projectId: projectId,
      yourDomain: yourDomain,
      competitors: competitorEntries,
      competitorCount: cleanCompetitors.length,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      completedCount: 0,
      failedCount: 0
    };
    cache.put(`job_${jobToken}`, JSON.stringify(jobInfo), 3600); // 1 hour TTL
    
    const initTime = Date.now() - startTime;
    Logger.log(`   ✅ Job initialized in ${initTime}ms`);
    Logger.log(`   📋 Token: ${jobToken}`);
    Logger.log(`   📋 Competitors: ${cleanCompetitors.join(', ')}`);
    
    return {
      success: true,
      jobToken: jobToken,
      projectId: projectId,
      yourDomain: yourDomain,
      competitors: competitorEntries,
      competitorCount: cleanCompetitors.length,
      initTimeMs: initTime,
      pollInterval: CLUSTER_CONFIG.POLL_INTERVAL_MS,
      maxTimeout: CLUSTER_CONFIG.JOB_TIMEOUT_MS
    };
    
  } catch (error) {
    Logger.log(`   ❌ Job initialization failed: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB STATUS POLLING - Returns current status for UI hydration
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current job status for UI polling
 * Called every 1.5 seconds by UI
 * 
 * @param {string} jobToken - Job identifier
 * @return {Object} Current job status with competitor progress
 */
function Cluster_GetJobStatus(jobToken) {
  try {
    // Try to get status from MySQL first
    let mysqlStatus = null;
    try {
      mysqlStatus = callGateway('job_get_status', { job_token: jobToken });
    } catch (e) {
      // MySQL unavailable - use cache
    }
    
    if (mysqlStatus && mysqlStatus.success) {
      return {
        success: true,
        jobToken: jobToken,
        status: mysqlStatus.job_status,
        progress: mysqlStatus.progress_percent || 0,
        competitorCount: mysqlStatus.competitor_count,
        completedCount: mysqlStatus.tasks_completed / 5, // 5 tasks per competitor
        failedCount: mysqlStatus.competitors_failed || 0,
        competitors: mysqlStatus.competitors || [],
        isComplete: mysqlStatus.job_status === 'COMPLETED' || mysqlStatus.job_status === 'PARTIAL',
        elapsedSeconds: mysqlStatus.elapsed_seconds || 0
      };
    }
    
    // Fallback to cache
    const cache = CacheService.getScriptCache();
    const jobInfoStr = cache.get(`job_${jobToken}`);
    
    if (!jobInfoStr) {
      return {
        success: false,
        error: 'Job not found'
      };
    }
    
    const jobInfo = JSON.parse(jobInfoStr);
    
    // Check individual competitor status from cache
    const competitorStatuses = [];
    let completedCount = 0;
    let failedCount = 0;
    
    jobInfo.competitors.forEach(comp => {
      const compStatusStr = cache.get(`comp_status_${jobToken}_${comp.id}`);
      let compStatus = { 
        id: comp.id, 
        domain: comp.domain, 
        status: 'pending',
        progress: 0 
      };
      
      if (compStatusStr) {
        compStatus = JSON.parse(compStatusStr);
      }
      
      competitorStatuses.push(compStatus);
      
      if (compStatus.status === 'completed') completedCount++;
      if (compStatus.status === 'failed') failedCount++;
    });
    
    const totalCompetitors = jobInfo.competitorCount || jobInfo.competitors.length;
    const progress = totalCompetitors > 0 ? Math.round((completedCount / totalCompetitors) * 100) : 0;
    const isComplete = completedCount + failedCount >= totalCompetitors;
    
    // Update job info in cache
    jobInfo.completedCount = completedCount;
    jobInfo.failedCount = failedCount;
    jobInfo.status = isComplete ? 'COMPLETED' : 'RUNNING';
    cache.put(`job_${jobToken}`, JSON.stringify(jobInfo), 3600);
    
    return {
      success: true,
      jobToken: jobToken,
      status: jobInfo.status,
      progress: progress,
      competitorCount: totalCompetitors,
      completedCount: completedCount,
      failedCount: failedCount,
      competitors: competitorStatuses,
      isComplete: isComplete,
      elapsedSeconds: Math.round((Date.now() - new Date(jobInfo.createdAt).getTime()) / 1000)
    };
    
  } catch (error) {
    Logger.log(`Status poll error: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update competitor status in cache (called by workers)
 * v23.0: Implements payload chunking for data exceeding 100KB
 */
function Cluster_UpdateCompetitorStatus(jobToken, competitorId, status) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `comp_status_${jobToken}_${competitorId}`;
    const statusJson = JSON.stringify(status);
    
    // v23.0: Check payload size and chunk if necessary
    const CACHE_LIMIT = 100000; // 100KB limit
    
    if (statusJson.length > CACHE_LIMIT) {
      console.log(`   📦 Status exceeds cache limit (${Math.round(statusJson.length/1024)}KB) - using MySQL primary`);
      
      // Store in MySQL as primary (bypasses cache limit)
      try {
        storeJobResult(jobToken, competitorId, 'STATUS', status, Utilities.getUuid());
        
        // Store minimal status in cache with MySQL reference
        const minimalStatus = {
          id: status.id,
          domain: status.domain,
          status: status.status,
          progress: status.progress,
          storedInMySQL: true,
          timestamp: new Date().toISOString()
        };
        cache.put(cacheKey, JSON.stringify(minimalStatus), 3600);
        return { success: true, storage: 'mysql' };
      } catch (mysqlError) {
        console.warn('   ⚠️ MySQL storage failed, using chunked cache');
        return Cluster_StoreLargePayload(cache, cacheKey, status);
      }
    }
    
    // Standard cache storage
    cache.put(cacheKey, statusJson, 3600);
    return { success: true, storage: 'cache' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Store large payloads by chunking into multiple cache entries
 * v23.0: Handles payloads exceeding 100KB cache limit
 */
function Cluster_StoreLargePayload(cache, baseKey, data) {
  try {
    const json = JSON.stringify(data);
    const CHUNK_SIZE = 90000; // 90KB chunks (with safety margin)
    const chunks = [];
    
    for (let i = 0; i < json.length; i += CHUNK_SIZE) {
      chunks.push(json.substring(i, i + CHUNK_SIZE));
    }
    
    // Store chunk metadata
    const metadata = {
      chunked: true,
      chunkCount: chunks.length,
      totalSize: json.length,
      timestamp: new Date().toISOString()
    };
    cache.put(`${baseKey}_meta`, JSON.stringify(metadata), 3600);
    
    // Store each chunk
    chunks.forEach((chunk, index) => {
      cache.put(`${baseKey}_chunk_${index}`, chunk, 3600);
    });
    
    console.log(`   ✅ Stored in ${chunks.length} chunks (${Math.round(json.length/1024)}KB total)`);
    return { success: true, storage: 'chunked_cache', chunkCount: chunks.length };
  } catch (e) {
    console.error('   ❌ Chunked storage failed:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Retrieve large payloads that were chunked
 */
function Cluster_GetLargePayload(cache, baseKey) {
  try {
    const metaStr = cache.get(`${baseKey}_meta`);
    if (!metaStr) return null;
    
    const metadata = JSON.parse(metaStr);
    if (!metadata.chunked) return null;
    
    let fullJson = '';
    for (let i = 0; i < metadata.chunkCount; i++) {
      const chunk = cache.get(`${baseKey}_chunk_${i}`);
      if (!chunk) {
        console.warn(`   ⚠️ Missing chunk ${i} of ${metadata.chunkCount}`);
        return null;
      }
      fullJson += chunk;
    }
    
    return JSON.parse(fullJson);
  } catch (e) {
    console.error('   ❌ Failed to retrieve chunked payload:', e.toString());
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB FINALIZATION - Aggregates results and builds overview
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Finalize job and build overview/dashboard data
 * Called by UI when all competitors are complete
 * 
 * @param {string} jobToken - Job identifier
 * @param {Object} options - Configuration options
 * @return {Object} Final aggregated results with overview and charts
 */
function Cluster_FinalizeJob(jobToken, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  CLUSTER FINALIZATION - BUILDING OVERVIEW                         ║`);
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  try {
    // Get job info
    const cache = CacheService.getScriptCache();
    const jobInfoStr = cache.get(`job_${jobToken}`);
    
    if (!jobInfoStr) {
      return { success: false, error: 'Job not found' };
    }
    
    const jobInfo = JSON.parse(jobInfoStr);
    
    // Collect all competitor results - check multiple cache key patterns
    const competitorResults = [];
    
    jobInfo.competitors.forEach(comp => {
      let compData = null;
      
      // Try cache with PERSIST cache key pattern first (from Worker_Persist)
      const persistCacheKey = `comp_${comp.id}_${jobToken.substring(0, 8)}`;
      const persistCached = cache.get(persistCacheKey);
      if (persistCached) {
        try {
          compData = JSON.parse(persistCached);
          Logger.log(`   ✅ Got data from persist cache for ${comp.domain}`);
        } catch (e) {
          Logger.log(`   ⚠️ Cache parse error for ${comp.domain}: ${e.toString()}`);
        }
      }
      
      // Try status cache key pattern (from Cluster_UpdateCompetitorStatus)
      if (!compData || !compData.synthesized) {
        const statusCacheKey = `comp_status_${jobToken}_${comp.id}`;
        const statusCached = cache.get(statusCacheKey);
        if (statusCached) {
          try {
            const statusData = JSON.parse(statusCached);
            // Check if this is minimal status with MySQL reference
            if (statusData.storedInMySQL) {
              Logger.log(`   📦 Data in MySQL for ${comp.domain}, fetching...`);
            } else if (statusData.finalData) {
              compData = statusData.finalData;
              Logger.log(`   ✅ Got full data from status cache for ${comp.domain}`);
            }
          } catch (e) {
            Logger.log(`   ⚠️ Status cache parse error for ${comp.domain}`);
          }
        }
      }
      
      // Try chunked cache retrieval
      if (!compData || !compData.synthesized) {
        const chunkedData = Cluster_GetLargePayload(cache, `comp_status_${jobToken}_${comp.id}`);
        if (chunkedData && chunkedData.synthesized) {
          compData = chunkedData;
          Logger.log(`   ✅ Got data from chunked cache for ${comp.domain}`);
        }
      }
      
      // Try MySQL as last resort
      if (!compData || !compData.synthesized) {
        try {
          const mysqlResult = callGateway('job_get_result', {
            job_token: jobToken,
            competitor_id: comp.id,
            result_type: 'FINAL'
          });
          
          if (mysqlResult && mysqlResult.success && mysqlResult.data) {
            compData = typeof mysqlResult.data === 'string' ? JSON.parse(mysqlResult.data) : mysqlResult.data;
            Logger.log(`   ✅ Got data from MySQL for ${comp.domain}`);
          }
        } catch (e) {
          Logger.log(`   ⚠️ MySQL retrieval failed for ${comp.domain}: ${e.toString()}`);
        }
      }
      
      // Add to results if we got data
      if (compData) {
        competitorResults.push({
          domain: comp.domain,
          ...compData
        });
      } else {
        Logger.log(`   ❌ No data found for ${comp.domain}`);
        // Add minimal entry so UI knows competitor was attempted
        competitorResults.push({
          domain: comp.domain,
          fetchSuccess: false,
          error: 'Data not found in cache or MySQL'
        });
      }
    });
    
    Logger.log(`   📊 Retrieved ${competitorResults.length} competitor results`);
    
    // Build overview from results
    const overview = buildOverviewFromResults(competitorResults);
    
    // Build dashboard charts
    const dashboardCharts = buildDashboardChartsFromResults(overview, competitorResults);
    
    // Build comparison matrix
    const comparisonMatrix = buildComparisonMatrix(competitorResults, jobInfo.yourDomain);
    
    // Update job status to COMPLETED
    jobInfo.status = 'COMPLETED';
    jobInfo.completedAt = new Date().toISOString();
    cache.put(`job_${jobToken}`, JSON.stringify(jobInfo), 3600);
    
    try {
      callGateway('job_update_status', {
        job_token: jobToken,
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      });
    } catch (e) {
      // Non-fatal
    }
    
    const finalizeTime = Date.now() - startTime;
    Logger.log(`   ✅ Finalization complete in ${finalizeTime}ms`);
    
    return {
      success: true,
      jobToken: jobToken,
      overview: overview,
      dashboardCharts: dashboardCharts,
      comparisonMatrix: competitorResults, // Return full competitor data for transformer
      competitorCount: competitorResults.length,
      yourDomain: jobInfo.yourDomain,
      finalizeTimeMs: finalizeTime
    };
    
  } catch (error) {
    Logger.log(`   ❌ Finalization failed: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// OVERVIEW BUILDERS - Aggregate competitor data into overview structures
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build overview data from competitor results
 */
function buildOverviewFromResults(competitors) {
  const categoryScores = {
    technicalSEO: { displayName: 'Technical SEO', scores: [], competitors: [], avgScore: 0 },
    contentIntelligence: { displayName: 'Content Intelligence', scores: [], competitors: [], avgScore: 0 },
    keywordStrategy: { displayName: 'Keyword Strategy', scores: [], competitors: [], avgScore: 0 },
    authorityMetrics: { displayName: 'Authority Metrics', scores: [], competitors: [], avgScore: 0 },
    performanceBenchmarks: { displayName: 'Performance', scores: [], competitors: [], avgScore: 0 },
    marketPositioning: { displayName: 'Market Positioning', scores: [], competitors: [], avgScore: 0 },
    brandMessaging: { displayName: 'Brand Messaging', scores: [], competitors: [], avgScore: 0 },
    opportunityAnalysis: { displayName: 'Opportunities', scores: [], competitors: [], avgScore: 0 }
  };
  
  const topPerformers = {};
  let totalScore = 0;
  let scoreCount = 0;
  
  // Process each competitor
  competitors.forEach(comp => {
    const scores = comp.scores || {};
    const domain = comp.domain || 'unknown';
    
    Object.keys(categoryScores).forEach(category => {
      const score = scores[category] || 0;
      
      categoryScores[category].scores.push(score);
      categoryScores[category].competitors.push({ domain, score });
      totalScore += score;
      scoreCount++;
      
      // Track top performer
      if (!topPerformers[category] || score > topPerformers[category].score) {
        topPerformers[category] = { domain, score };
      }
    });
  });
  
  // Calculate averages
  Object.keys(categoryScores).forEach(key => {
    const cat = categoryScores[key];
    if (cat.scores.length > 0) {
      cat.avgScore = Math.round(cat.scores.reduce((a, b) => a + b, 0) / cat.scores.length);
      cat.average = cat.avgScore;
    }
  });
  
  return {
    categoryScores: categoryScores,
    topPerformers: topPerformers,
    averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    competitorCount: competitors.length,
    dataCompleteness: Math.round((competitors.filter(c => Object.keys(c.scores || {}).length > 5).length / competitors.length) * 100)
  };
}

/**
 * Build dashboard charts from overview and competitor data
 */
function buildDashboardChartsFromResults(overview, competitors) {
  const dashboardCharts = {};
  const categoryScores = overview.categoryScores || {};
  
  // Build chart for each category
  Object.keys(categoryScores).forEach(categoryKey => {
    const category = categoryScores[categoryKey];
    const competitorData = category.competitors || [];
    const sortedCompetitors = [...competitorData].sort((a, b) => b.score - a.score);
    
    dashboardCharts[categoryKey] = [{
      chartType: 'bar',
      label: `${category.displayName} Score`,
      labels: sortedCompetitors.map(c => c.domain.replace(/\.(com|org|io|net)$/, '')),
      data: sortedCompetitors.map(c => c.score),
      config: {
        backgroundColor: sortedCompetitors.map((c, i) =>
          i === 0 ? 'rgba(52, 168, 83, 0.8)' :
          c.score >= 70 ? 'rgba(66, 133, 244, 0.7)' :
          c.score >= 50 ? 'rgba(251, 188, 4, 0.7)' :
          'rgba(234, 67, 53, 0.7)'
        ),
        borderWidth: 0
      }
    }];
  });
  
  // Overview radar chart
  const radarLabels = Object.values(categoryScores).map(c => c.displayName.substring(0, 15));
  const radarData = Object.values(categoryScores).map(c => c.average || 0);
  
  dashboardCharts['overview'] = [{
    chartType: 'radar',
    label: 'Category Performance',
    labels: radarLabels,
    data: radarData,
    config: {
      backgroundColor: 'rgba(26, 115, 232, 0.2)',
      borderColor: '#1a73e8',
      borderWidth: 2
    }
  }];
  
  return dashboardCharts;
}

/**
 * Build comparison matrix for side-by-side competitor view
 */
function buildComparisonMatrix(competitors, yourDomain) {
  const matrix = {
    headers: ['Metric'],
    rows: [],
    yourDomain: yourDomain
  };
  
  // Add domain headers
  competitors.forEach(comp => {
    matrix.headers.push(comp.domain);
  });
  
  // Define comparison metrics
  const metrics = [
    { key: 'compositeScore.overall', label: 'Overall Score' },
    { key: 'scores.technicalSEO', label: 'Technical SEO' },
    { key: 'scores.contentIntelligence', label: 'Content Intelligence' },
    { key: 'scores.authorityMetrics', label: 'Authority' },
    { key: 'scores.performanceBenchmarks', label: 'Performance' },
    { key: 'scores.keywordStrategy', label: 'Keywords' },
    { key: 'processedMetrics.estimatedTraffic', label: 'Est. Traffic' },
    { key: 'processedMetrics.pageRank', label: 'PageRank' }
  ];
  
  // Build rows
  metrics.forEach(metric => {
    const row = [metric.label];
    
    competitors.forEach(comp => {
      const value = getNestedValue(comp, metric.key);
      row.push(value !== undefined ? value : 'N/A');
    });
    
    matrix.rows.push(row);
  });
  
  return matrix;
}

/**
 * Helper to get nested object value
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current user ID from license key
 */
function getUserId() {
  try {
    const licenseKey = getUserLicenseKey();
    if (licenseKey) {
      // Hash license key to get user ID
      return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, licenseKey)
        .map(b => (b & 0xFF).toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 8);
    }
  } catch (e) {
    // Ignore
  }
  return 'anonymous';
}

/**
 * Quick start - convenience function for UI
 * Initializes job and returns everything needed for parallel execution
 */
function Cluster_QuickStart(projectId, competitors, yourDomain) {
  const initResult = Cluster_InitializeJob(projectId, competitors, yourDomain);
  
  if (!initResult.success) {
    return initResult;
  }
  
  // Return with function name for UI to call
  return {
    ...initResult,
    workerFunction: 'Worker_ExecuteCompetitorPipeline',
    statusFunction: 'Cluster_GetJobStatus',
    finalizeFunction: 'Cluster_FinalizeJob'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FALLBACK SEQUENTIAL MODE - For testing or when parallel fails
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Execute all competitors sequentially (fallback mode)
 * Use when parallel execution is not supported
 */
function Cluster_ExecuteSequential(projectId, competitors, yourDomain, options) {
  const startTime = Date.now();
  options = options || {};
  
  // ═══════════════════════════════════════════════════════════════════════════
  // v28.0 TURBO MODE - AGGRESSIVE TIME LIMITS FOR 6-9 COMPETITORS
  // ═══════════════════════════════════════════════════════════════════════════
  const HARD_TIMEOUT_MS = 280000; // 280s absolute limit (80s buffer before 360s)
  const PER_COMPETITOR_LIMIT_MS = 35000; // 35s max per competitor
  const PAGESPEED_LIMIT = 3; // Only first 3 get PageSpeed
  
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`🚀 TURBO SEQUENTIAL v28.0: ${competitors.length} competitors`);
  Logger.log(`   ⏱️ Hard timeout: ${HARD_TIMEOUT_MS}ms | Per-competitor: ${PER_COMPETITOR_LIMIT_MS}ms`);
  Logger.log(`   📊 PageSpeed limit: First ${PAGESPEED_LIMIT} competitors only`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  // Initialize job
  const initResult = Cluster_InitializeJob(projectId, competitors, yourDomain, options);
  
  if (!initResult.success) {
    return initResult;
  }
  
  const jobToken = initResult.jobToken;
  const completedCompetitors = [];
  let abortedEarly = false;
  
  // Execute each competitor sequentially with time checks
  for (let i = 0; i < initResult.competitors.length; i++) {
    const comp = initResult.competitors[i];
    const elapsedTotal = Date.now() - startTime;
    
    // v28.0: HARD TIMEOUT CHECK - abort before hitting 360s
    if (elapsedTotal > HARD_TIMEOUT_MS) {
      Logger.log(`   ⚠️ HARD TIMEOUT: ${elapsedTotal}ms > ${HARD_TIMEOUT_MS}ms - aborting gracefully`);
      Logger.log(`   ✅ Completed ${completedCompetitors.length}/${initResult.competitors.length} competitors`);
      abortedEarly = true;
      break;
    }
    
    try {
      Logger.log(`   → Processing: ${comp.domain} (${i + 1}/${initResult.competitors.length})`);
      Logger.log(`     ⏱️ Elapsed: ${elapsedTotal}ms / ${HARD_TIMEOUT_MS}ms`);
      
      const compStartTime = Date.now();
      
      // v28.0: Pass TURBO options to skip slow operations
      const turboOptions = {
        ...options,
        skipGeminiPerCompetitor: true, // Skip individual Gemini - batch at end
        skipPageSpeed: i >= PAGESPEED_LIMIT, // Only first 3 get PageSpeed
        skipOracle: true, // Oracle is slow - skip entirely
        maxWaitMs: PER_COMPETITOR_LIMIT_MS,
        turboMode: true
      };
      
      const result = Worker_ExecuteCompetitorPipeline(
        jobToken,
        comp.id,
        comp.domain,
        yourDomain,
        turboOptions
      );
      
      const compTime = Date.now() - compStartTime;
      
      // Update status
      Cluster_UpdateCompetitorStatus(jobToken, comp.id, {
        id: comp.id,
        domain: comp.domain,
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        error: result.error,
        executionTimeMs: compTime
      });
      
      if (result.success) {
        completedCompetitors.push({
          domain: comp.domain,
          data: result.finalData || result
        });
      }
      
      Logger.log(`     ✅ ${comp.domain}: ${compTime}ms`);
      
      // v28.0: Check if this competitor took too long, adjust strategy
      if (compTime > PER_COMPETITOR_LIMIT_MS) {
        Logger.log(`     ⚠️ Competitor took ${compTime}ms (limit: ${PER_COMPETITOR_LIMIT_MS}ms)`);
      }
      
    } catch (e) {
      Logger.log(`     ❌ ${comp.domain} failed: ${e.toString()}`);
      Cluster_UpdateCompetitorStatus(jobToken, comp.id, {
        id: comp.id,
        domain: comp.domain,
        status: 'failed',
        error: e.toString()
      });
    }
  }
  
  // Finalize with whatever we have
  Logger.log(`   📊 Finalizing ${completedCompetitors.length} completed competitors...`);
  const finalResult = Cluster_FinalizeJob(jobToken, {
    ...options,
    completedCompetitors: completedCompetitors,
    abortedEarly: abortedEarly
  });
  
  const totalTime = Date.now() - startTime;
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`✅ TURBO v28.0 COMPLETE: ${totalTime}ms (${completedCompetitors.length}/${initResult.competitors.length})`);
  if (abortedEarly) {
    Logger.log(`   ⚠️ Aborted early due to time limit - partial results returned`);
  }
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  return {
    ...finalResult,
    executionMode: 'turbo-sequential-v28',
    totalTimeMs: totalTime,
    completedCount: completedCompetitors.length,
    totalCount: initResult.competitors.length,
    abortedEarly: abortedEarly
  };
}

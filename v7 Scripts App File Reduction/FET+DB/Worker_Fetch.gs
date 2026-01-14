/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * WORKER_FETCH.GS - ORACLE ELITE v22.0 PARALLEL TASK-CLUSTER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * ATOMIC FETCH WORKER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Execute parallel API fetches for a SINGLE competitor
 * - Uses UrlFetchApp.fetchAll() for true async parallel HTTP requests
 * - Batches all API calls into single fetchAll() execution
 * - Returns structured data with proof traces
 * 
 * PARALLEL STRATEGY:
 * ┌──────────────────────────────────────────────────────────────────────────────────────┐
 * │  UI fires 6 × google.script.run → 6 Worker_Fetch instances run simultaneously       │
 * │     ↓                                                                                │
 * │  Each Worker_Fetch calls 5 APIs in parallel via fetchAll():                         │
 * │     [PHP Fetcher] [PageSpeed] [Serper Site] [Serper Brand] [OpenPageRank]           │
 * │     ↓                                                                                │
 * │  Results stored in MySQL job_results via Worker_Persist                             │
 * └──────────────────────────────────────────────────────────────────────────────────────┘
 * 
 * EXECUTION TIME:
 * - Single competitor: ~3-5 seconds (all APIs parallel)
 * - 6 competitors: ~5-8 seconds total (all run simultaneously)
 * 
 * @version 22.0.0-cluster
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

const WORKER_FETCH_VERSION = '22.0.0-cluster';

// ═══════════════════════════════════════════════════════════════════════════════════════
// v28.1 TURBO MODE - Skip non-essential gateway calls
// ═══════════════════════════════════════════════════════════════════════════════════════
var WORKER_TURBO_MODE = false; // Set by Worker_FetchCompetitor when options.turboMode

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const FETCH_CONFIG = {
  TIMEOUT_MS: 45000,           // 45 second timeout per API call
  RETRY_COUNT: 2,              // Max retries per API
  RETRY_DELAY_MS: 500,         // Delay between retries
  
  // API endpoints
  APIS: {
    PHP_FETCHER: 'fetcher_single',
    PAGESPEED: 'pagespeed_analyze',
    SERPER_SEARCH: 'serper_search',
    OPEN_PAGERANK: 'opr_get_rank'
  },
  
  // Compliance guards (from v21.0)
  COMPLIANCE: {
    RESPECT_ROBOTS: true,
    ADAPTIVE_THROTTLE: true,
    USER_AGENT: 'Serpifai Oracle Elite/22.0 (Competitive Intelligence)',
    MAX_CONCURRENT_DOMAIN: 3    // Max concurrent requests per domain
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - Called by UI/Cluster Controller
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Execute parallel fetch for a single competitor
 * This is the atomic unit of work - one competitor, all APIs in parallel
 * 
 * @param {string} jobToken - Parent job identifier
 * @param {string} competitorId - Unique competitor identifier
 * @param {string} domain - Competitor domain to analyze
 * @param {Object} options - Optional configuration
 * @return {Object} FetchResult with data and proof traces
 */
function Worker_FetchCompetitor(jobToken, competitorId, domain, options) {
  const startTime = Date.now();
  options = options || {};
  
  // v28.1: Set global TURBO flag based on options
  WORKER_TURBO_MODE = options.turboMode === true;
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  WORKER_FETCH v${WORKER_FETCH_VERSION} ${WORKER_TURBO_MODE ? '⚡TURBO' : ''} - PARALLEL API          ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Job: ${jobToken.substring(0, 20)}...                                   `);
  Logger.log(`║  Competitor: ${domain.padEnd(50)}   `);
  if (WORKER_TURBO_MODE) {
    Logger.log(`║  🚀 TURBO MODE: Skip status updates, use cache                     ║`);
  }
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitorId: competitorId,
    domain: domain,
    stages: {},
    synthesized: {},
    proofTraces: [],
    executionTimeMs: 0,
    fetchedAt: new Date().toISOString()
  };
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Update job status to FETCHING
    // ═══════════════════════════════════════════════════════════════════════
    Worker_UpdateTaskStatus(jobToken, competitorId, 'FETCH', 'RUNNING');
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'fetching', current_phase: 'FETCH' });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Build parallel API requests
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📋 Phase 1: Building parallel API requests...`);
    
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = 'https://' + cleanDomain;
    const brandName = cleanDomain.split('.')[0];
    
    const { requests, requestMap } = buildParallelRequests(cleanDomain, fullUrl, brandName, options);
    
    Logger.log(`   ✅ Built ${requests.length} requests`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Execute ALL requests in parallel via fetchAll()
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🚀 Phase 2: Executing ${requests.length} requests in parallel...`);
    const fetchStartTime = Date.now();
    
    // TRUE PARALLEL EXECUTION - all requests fire simultaneously
    const responses = UrlFetchApp.fetchAll(requests);
    
    const fetchTime = Date.now() - fetchStartTime;
    Logger.log(`   ⚡ All ${responses.length} requests completed in ${fetchTime}ms`);
    
    // Add proof trace
    result.proofTraces.push({
      phase: 'PARALLEL_FETCH',
      requestCount: requests.length,
      responseCount: responses.length,
      durationMs: fetchTime,
      timestamp: new Date().toISOString()
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Parse and validate responses
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📊 Phase 3: Processing responses...`);
    
    responses.forEach((response, i) => {
      const mapping = requestMap[i];
      const stageResult = parseApiResponse(response, mapping.api);
      
      result.stages[mapping.api] = stageResult;
      
      // Add proof trace for each API
      result.proofTraces.push({
        api: mapping.api,
        success: stageResult.success,
        responseCode: response.getResponseCode(),
        dataSize: stageResult.data ? JSON.stringify(stageResult.data).length : 0,
        sourceIntegrity: stageResult.sourceIntegrity || 'direct',
        timestamp: new Date().toISOString()
      });
      
      Logger.log(`      ${stageResult.success ? '✅' : '❌'} ${mapping.api}: ${stageResult.success ? 'OK' : stageResult.error}`);
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Synthesize data with triangulation fallback
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🔬 Phase 4: Synthesizing data with triangulation...`);
    
    result.synthesized = synthesizeWithTriangulation(cleanDomain, result.stages);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5B: v28.4 Gemini Fallback when Serper credits exhausted
    // ═══════════════════════════════════════════════════════════════════════
    result.synthesized = Worker_EnrichWithGeminiFallback(cleanDomain, result.stages, result.synthesized);
    
    // Calculate success metrics
    const successCount = Object.values(result.stages).filter(s => s.success).length;
    result.successRate = `${successCount}/${Object.keys(result.stages).length}`;
    result.success = successCount >= 2; // At least 2 APIs must succeed
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Store results in MySQL via Gateway
    // ═══════════════════════════════════════════════════════════════════════
    const resultId = Utilities.getUuid();
    
    try {
      storeJobResult(jobToken, competitorId, 'ENRICHED', result.synthesized, resultId);
      
      // Store raw stages for audit trail
      storeJobResult(jobToken, competitorId, 'RAW_FETCH', result.stages, Utilities.getUuid());
      
      Logger.log(`   💾 Results stored: ${resultId}`);
    } catch (storeError) {
      Logger.log(`   ⚠️ Storage warning: ${storeError.toString()}`);
      // Continue - data is still in memory for next worker
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7: Update task status to COMPLETED
    // ═══════════════════════════════════════════════════════════════════════
    result.executionTimeMs = Date.now() - startTime;
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'FETCH', 'COMPLETED', null, resultId);
    Worker_UpdateMetrics(jobToken, competitorId, {
      status: 'enriching',
      current_phase: 'ENRICH',
      phase_progress: 20,
      domain_authority: result.synthesized.authority?.pageRank || 0,
      traffic_estimate: result.synthesized.traffic?.estimate || 0
    });
    
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    Logger.log(`   ✅ FETCH COMPLETE: ${result.successRate} APIs | ${result.executionTimeMs}ms`);
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
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'FETCH', 'FAILED', error.toString());
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'failed', current_phase: 'FETCH' });
    
    Logger.log(`   ❌ FETCH FAILED: ${error.toString()}`);
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// REQUEST BUILDER - Constructs parallel API requests
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build all API requests for parallel execution
 */
function buildParallelRequests(cleanDomain, fullUrl, brandName, options) {
  const scriptProps = PropertiesService.getScriptProperties();
  const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || 
                     (typeof GATEWAY_CONFIG !== 'undefined' ? GATEWAY_CONFIG.GATEWAY_URL : 'https://serpifai.com/serpifai_php/api_gateway.php');
  const licenseKey = getUserLicenseKey();
  
  if (!licenseKey) {
    throw new Error('No license key configured');
  }
  
  const requests = [];
  const requestMap = [];
  
  // 1. PHP Fetcher - Full scrape with forensics
  requests.push(buildGatewayFetchRequest(gatewayUrl, licenseKey, FETCH_CONFIG.APIS.PHP_FETCHER, {
    url: fullUrl,
    options: {
      extractMetadata: true,
      extractLinks: true,
      extractImages: true,
      extractSchema: true,
      forensicMode: true
    }
  }));
  requestMap.push({ api: 'phpFetcher' });
  
  // 2. PageSpeed - Technical metrics
  if (!options.skipPageSpeed) {
    requests.push(buildGatewayFetchRequest(gatewayUrl, licenseKey, FETCH_CONFIG.APIS.PAGESPEED, {
      url: fullUrl,
      strategy: 'mobile'
    }));
    requestMap.push({ api: 'pageSpeed' });
  }
  
  // 3. Serper Site Query - Indexed pages
  requests.push(buildGatewayFetchRequest(gatewayUrl, licenseKey, FETCH_CONFIG.APIS.SERPER_SEARCH, {
    query: `site:${cleanDomain}`,
    params: { num: 10, gl: 'us' }
  }));
  requestMap.push({ api: 'serperSite' });
  
  // 4. Serper Brand Query - SERP features (PAA, Related, Featured)
  requests.push(buildGatewayFetchRequest(gatewayUrl, licenseKey, FETCH_CONFIG.APIS.SERPER_SEARCH, {
    query: brandName,
    params: { num: 10, gl: 'us' }
  }));
  requestMap.push({ api: 'serperBrand' });
  
  // 5. OpenPageRank - Domain authority
  requests.push(buildGatewayFetchRequest(gatewayUrl, licenseKey, FETCH_CONFIG.APIS.OPEN_PAGERANK, {
    domain: cleanDomain
  }));
  requestMap.push({ api: 'openPageRank' });
  
  return { requests, requestMap };
}

/**
 * Build a single gateway fetch request for UrlFetchApp.fetchAll
 * v28.3: Fixed license key parameter name (was license_key, gateway expects license)
 */
function buildGatewayFetchRequest(gatewayUrl, licenseKey, action, payload) {
  return {
    url: gatewayUrl,
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      action: action,
      license: licenseKey,  // v28.3: Fixed - gateway expects 'license' not 'license_key'
      payload: payload
    }),
    muteHttpExceptions: true,
    headers: {
      'User-Agent': FETCH_CONFIG.COMPLIANCE.USER_AGENT
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESPONSE PARSER - Extracts and validates API responses
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Parse API response with error handling
 */
function parseApiResponse(response, apiName) {
  const result = {
    success: false,
    data: null,
    error: null,
    responseCode: response.getResponseCode(),
    sourceIntegrity: 'direct'
  };
  
  try {
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      result.error = `HTTP ${responseCode}`;
      return result;
    }
    
    const parsed = JSON.parse(responseText);
    
    // Extract data based on API type
    if (parsed.success && parsed.data) {
      result.success = true;
      result.data = parsed.data;
      result.sourceIntegrity = 'api';
    } else if (parsed.error) {
      result.error = parsed.error;
    } else {
      result.success = true;
      result.data = parsed;
      result.sourceIntegrity = 'direct';
    }
    
  } catch (e) {
    result.error = `Parse error: ${e.toString()}`;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TRIANGULATION SYNTHESIZER - Merges data with intelligent fallbacks
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Synthesize data from multiple APIs with triangulation fallback
 * If primary source fails, estimate from secondary sources
 */
function synthesizeWithTriangulation(domain, stages) {
  const synth = {
    domain: domain,
    
    // Website metadata
    website: extractWebsiteData(stages),
    
    // Technical metrics (from PageSpeed)
    technical: extractTechnicalData(stages),
    
    // Authority metrics (from OpenPageRank + Serper)
    authority: extractAuthorityData(stages),
    
    // SEO intelligence (from Serper)
    seo: extractSeoData(stages),
    
    // Traffic estimation (triangulated)
    traffic: triangulateTraffic(stages),
    
    // Content analysis (from PHP Fetcher)
    content: extractContentData(stages),
    
    // SERP features (from Serper Brand query)
    serpFeatures: extractSerpFeatures(stages),
    
    // Source integrity for each metric
    sourceIntegrity: {}
  };
  
  // Track which sources provided which data
  Object.keys(synth).forEach(key => {
    if (typeof synth[key] === 'object' && synth[key] !== null) {
      synth.sourceIntegrity[key] = synth[key].sourceIntegrity || 'synthesized';
    }
  });
  
  return synth;
}

/**
 * Extract website metadata from PHP fetcher or Serper
 */
function extractWebsiteData(stages) {
  const phpData = stages.phpFetcher?.data || {};
  const serperData = stages.serperSite?.data || {};
  
  // Try PHP fetcher first (most complete)
  if (phpData.metadata) {
    return {
      title: phpData.metadata.title || '',
      description: phpData.metadata.description || '',
      h1: phpData.metadata.h1 || '',
      h2: phpData.metadata.h2 || [],
      wordCount: phpData.metadata.wordCount || 0,
      language: phpData.metadata.language || 'en',
      hasOrganizationSchema: phpData.schema?.hasOrganization || false,
      schemaTypes: phpData.schema?.types || [],
      dataSource: 'php_fetcher',
      sourceIntegrity: 'api'
    };
  }
  
  // Fallback to Serper organic results
  const organic = serperData.organic || [];
  const firstResult = organic[0] || {};
  
  return {
    title: firstResult.title || '',
    description: firstResult.snippet || '',
    h1: '',
    h2: [],
    wordCount: 0,
    language: 'en',
    hasOrganizationSchema: false,
    schemaTypes: [],
    dataSource: 'serper_fallback',
    sourceIntegrity: 'inferred'
  };
}

/**
 * Extract technical metrics from PageSpeed
 * v28.4: Fixed property names and added robust fallbacks
 */
function extractTechnicalData(stages) {
  const pageSpeed = stages.pageSpeed?.data || {};
  const scores = pageSpeed.scores || {};
  const cwv = pageSpeed.coreWebVitals || pageSpeed.core_web_vitals || {};
  
  // v28.4: Handle both naming conventions (camelCase and snake_case)
  const performanceScore = scores.performance ?? 0;
  const accessibilityScore = scores.accessibility ?? 0;
  const seoScore = scores.seo ?? scores.SEO ?? 0;
  const bestPracticesScore = scores.bestPractices ?? scores.best_practices ?? scores['best-practices'] ?? 0;
  
  if (performanceScore > 0 || seoScore > 0) {
    return {
      performanceScore: performanceScore,
      accessibilityScore: accessibilityScore,
      seoScore: seoScore,
      bestPracticesScore: bestPracticesScore,
      coreWebVitals: {
        lcp: cwv.lcp ?? cwv.LCP ?? 0,
        fid: cwv.fid ?? cwv.FID ?? 0,
        cls: cwv.cls ?? cwv.CLS ?? 0
      },
      loadTime: pageSpeed.loadTime ?? pageSpeed.load_time ?? 'N/A',
      mobileUsability: 'mobile',
      dataSource: 'pagespeed_api',
      sourceIntegrity: 'api'
    };
  }
  
  // Return zeros if PageSpeed failed - DON'T GENERATE FAKE DATA
  return {
    performanceScore: 0,
    accessibilityScore: 0,
    seoScore: 0,
    bestPracticesScore: 0,
    coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
    loadTime: 'N/A',
    mobileUsability: 'unknown',
    dataSource: 'none',
    sourceIntegrity: 'unavailable'
  };
}

/**
 * Extract authority metrics from OpenPageRank
 * v28.4: Fixed property names - API returns pageRank/domainRank not page_rank_decimal/rank
 */
function extractAuthorityData(stages) {
  const opr = stages.openPageRank?.data || {};
  
  // v28.4: OpenPageRank API returns 'pageRank' and 'domainRank' (not page_rank_decimal/rank)
  const pageRankValue = opr.pageRank ?? opr.page_rank_decimal ?? opr.page_rank ?? 0;
  const domainRankValue = opr.domainRank ?? opr.rank ?? opr.domain_rank ?? 0;
  
  if (pageRankValue > 0 || domainRankValue > 0) {
    return {
      pageRank: parseFloat(pageRankValue) || 0,
      domainRank: parseInt(domainRankValue) || 0,
      pageRankInteger: Math.floor(parseFloat(pageRankValue) || 0),
      dataSource: 'open_pagerank',
      sourceIntegrity: 'api'
    };
  }
  
  // Return zeros if OpenPageRank failed
  return {
    pageRank: 0,
    domainRank: 0,
    pageRankInteger: 0,
    dataSource: 'none',
    sourceIntegrity: 'unavailable'
  };
}

/**
 * Extract SEO intelligence from Serper
 */
function extractSeoData(stages) {
  const serperSite = stages.serperSite?.data || {};
  const organic = serperSite.organic || [];
  
  return {
    indexedPages: organic.length,
    organicResults: organic,
    topPages: organic.slice(0, 5).map(o => ({
      url: o.link || '',
      title: o.title || '',
      snippet: o.snippet || '',
      position: o.position || 0
    })),
    dataSource: organic.length > 0 ? 'serper_api' : 'none',
    sourceIntegrity: organic.length > 0 ? 'api' : 'unavailable'
  };
}

/**
 * Triangulate traffic estimation from multiple sources
 * Uses PageRank + Organic count + SERP position as factors
 * v28.4: Fixed property names - API returns pageRank not page_rank_decimal
 */
function triangulateTraffic(stages) {
  const opr = stages.openPageRank?.data || {};
  const serperSite = stages.serperSite?.data || {};
  const organic = serperSite.organic || [];
  
  // v28.4: Use correct property name
  const pageRank = parseFloat(opr.pageRank ?? opr.page_rank_decimal ?? 0) || 0;
  const organicCount = organic.length;
  
  // Calculate estimated traffic using triangulation formula
  // Higher PageRank + More indexed pages = More traffic
  let estimate = 0;
  let sourceIntegrity = 'unavailable';
  
  if (pageRank > 0 || organicCount > 0) {
    // Formula: (PageRank^2 * 1000) + (OrganicCount * 500)
    // This gives rough monthly traffic estimate
    estimate = Math.round((Math.pow(pageRank, 2) * 1000) + (organicCount * 500));
    sourceIntegrity = 'estimated';
  }
  
  // Add position weighting (first page results get traffic boost)
  const firstPageCount = organic.filter(o => o.position <= 10).length;
  if (firstPageCount > 0) {
    estimate += firstPageCount * 2000;
    sourceIntegrity = 'inferred';
  }
  
  return {
    estimate: estimate,
    confidenceLevel: sourceIntegrity === 'inferred' ? 'medium' : 'low',
    factors: {
      pageRank: pageRank,
      indexedPages: organicCount,
      firstPageResults: firstPageCount
    },
    dataSource: 'triangulated',
    sourceIntegrity: sourceIntegrity
  };
}

/**
 * Extract content data from PHP fetcher
 */
function extractContentData(stages) {
  const phpData = stages.phpFetcher?.data || {};
  const links = phpData.links || {};
  
  return {
    internalLinks: links.internal || [],
    externalLinks: links.external || [],
    images: phpData.images || [],
    headings: phpData.headings || [],
    dataSource: phpData.metadata ? 'php_fetcher' : 'none',
    sourceIntegrity: phpData.metadata ? 'api' : 'unavailable'
  };
}

/**
 * Extract SERP features from brand query
 */
function extractSerpFeatures(stages) {
  const serperBrand = stages.serperBrand?.data || {};
  
  return {
    peopleAlsoAsk: serperBrand.peopleAlsoAsk || [],
    relatedSearches: serperBrand.relatedSearches || [],
    knowledgeGraph: serperBrand.knowledgeGraph || null,
    featuredSnippet: serperBrand.answerBox || null,
    sitelinks: (serperBrand.organic || [])[0]?.sitelinks || [],
    dataSource: Object.keys(serperBrand).length > 0 ? 'serper_brand' : 'none',
    sourceIntegrity: Object.keys(serperBrand).length > 0 ? 'api' : 'unavailable'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB STATUS HELPERS - Update MySQL via Gateway
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Update task status in job_tasks table
 * v28.1: Skip in TURBO mode to save network round-trips
 */
function Worker_UpdateTaskStatus(jobToken, competitorId, taskType, status, errorMessage, outputDataId) {
  // v28.1 TURBO: Skip non-essential gateway calls
  if (WORKER_TURBO_MODE) {
    Logger.log(`      ⚡ TURBO: Skip status update (${taskType}:${status})`);
    return;
  }
  
  try {
    callGateway('job_update_task', {
      job_token: jobToken,
      competitor_id: competitorId,
      task_type: taskType,
      status: status,
      error_message: errorMessage || null,
      output_data_id: outputDataId || null
    });
  } catch (e) {
    Logger.log(`⚠️ Failed to update task status: ${e.toString()}`);
    // Non-fatal - continue execution
  }
}

/**
 * Update competitor metrics for UI polling
 * v28.1: Skip in TURBO mode to save network round-trips
 */
function Worker_UpdateMetrics(jobToken, competitorId, metrics) {
  // v28.1 TURBO: Skip non-essential gateway calls
  if (WORKER_TURBO_MODE) {
    return;
  }
  
  try {
    callGateway('job_update_metrics', {
      job_token: jobToken,
      competitor_id: competitorId,
      metrics: metrics
    });
  } catch (e) {
    Logger.log(`⚠️ Failed to update metrics: ${e.toString()}`);
    // Non-fatal - continue execution
  }
}

/**
 * Store job result in job_results table
 * v28.1: In TURBO mode, store in cache instead of MySQL
 */
function storeJobResult(jobToken, competitorId, resultType, data, resultId) {
  // v28.1 TURBO: Use cache instead of MySQL gateway call
  if (WORKER_TURBO_MODE) {
    try {
      const cache = CacheService.getScriptCache();
      const cacheKey = `result_${jobToken}_${competitorId}_${resultType}`;
      const jsonStr = JSON.stringify(data);
      // Cache for 10 minutes
      if (jsonStr.length < 100000) {
        cache.put(cacheKey, jsonStr, 600);
      }
      return { success: true, cached: true };
    } catch (e) {
      // Non-fatal
      return null;
    }
  }
  
  try {
    return callGateway('job_store_result', {
      result_id: resultId,
      job_token: jobToken,
      competitor_id: competitorId,
      result_type: resultType,
      data_json: JSON.stringify(data)
    });
  } catch (e) {
    Logger.log(`⚠️ Failed to store result: ${e.toString()}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH FETCH - Process multiple competitors in parallel (for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch ALL competitors in a single execution
 * NOTE: This is for fallback/testing - production uses UI-triggered parallel calls
 */
function Worker_FetchAllCompetitors(jobToken, competitors, options) {
  const startTime = Date.now();
  const results = {};
  
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`🚀 BATCH FETCH: ${competitors.length} competitors`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  // Process each competitor
  competitors.forEach((domain, index) => {
    const competitorId = `comp_${index}`;
    
    try {
      const result = Worker_FetchCompetitor(jobToken, competitorId, domain, options);
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
  Logger.log(`✅ BATCH COMPLETE: ${successCount}/${competitors.length} in ${totalTime}ms`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  return {
    results: results,
    successCount: successCount,
    totalTime: totalTime,
    averageTime: Math.round(totalTime / competitors.length)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// v28.4 GEMINI FALLBACK - Keyword Intelligence when Serper credits exhausted
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Use Gemini to generate keyword intelligence when Serper API fails
 * This provides REAL research data using Gemini's knowledge
 * 
 * @param {string} domain - The competitor domain
 * @param {Object} stages - The fetched stages data (may have phpFetcher content)
 * @returns {Object} Keyword and SERP intelligence from Gemini
 */
function Worker_GeminiKeywordFallback(domain, stages) {
  try {
    const phpData = stages.phpFetcher?.data || {};
    const metadata = phpData.metadata || {};
    const headings = phpData.headings || metadata.h2 || [];
    
    // Build context from phpFetcher data
    const pageContext = {
      title: metadata.title || '',
      description: metadata.description || '',
      h1: metadata.h1 || '',
      h2s: Array.isArray(headings) ? headings.slice(0, 5) : [],
      wordCount: metadata.wordCount || 0
    };
    
    const prompt = `You are an expert SEO analyst. Analyze the competitor domain "${domain}" and provide intelligence data.

Context from their website:
- Title: ${pageContext.title || '(not available)'}
- H1: ${pageContext.h1 || '(not available)'}
- Description: ${pageContext.description || '(not available)'}
- Key Headings: ${pageContext.h2s.join(', ') || '(none extracted)'}
- Word Count: ${pageContext.wordCount || 'unknown'}

Based on your knowledge of ${domain} and the SEO industry, provide a JSON response with:
1. top_keywords: Array of 10 keywords they likely rank for (string array)
2. estimated_organic_traffic: Monthly organic traffic estimate (number)
3. estimated_keyword_count: Total keywords they rank for (number)
4. top_pages: Array of 5 likely top pages with {title, description, position} 
5. people_also_ask: Array of 5 relevant PAA questions (string array)
6. related_searches: Array of 5 related search terms (string array)
7. industry_niche: Their primary industry/niche (string)
8. authority_signals: Brief assessment of their domain authority (string)

Return ONLY valid JSON, no markdown.`;

    const result = callGateway('gemini:generate', {
      prompt: prompt,
      options: {
        temperature: 0.3,
        maxTokens: 2000
      }
    });
    
    if (result && result.success && result.data) {
      let geminiData = result.data;
      
      // Clean up JSON if wrapped in markdown
      if (typeof geminiData === 'string') {
        geminiData = geminiData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          geminiData = JSON.parse(geminiData);
        } catch (e) {
          Logger.log(`   ⚠️ Gemini JSON parse error: ${e.toString()}`);
          return null;
        }
      }
      
      Logger.log(`   ✅ Gemini keyword fallback succeeded for ${domain}`);
      return {
        success: true,
        data: geminiData,
        source: 'gemini_research',
        sourceIntegrity: 'ai_inferred'
      };
    }
    
    return null;
  } catch (e) {
    Logger.log(`   ⚠️ Gemini fallback error: ${e.toString()}`);
    return null;
  }
}

/**
 * Enrich synthesis data with Gemini fallback when Serper failed
 * Called after synthesizeWithTriangulation to fill in missing SERP data
 * 
 * @param {string} domain - The competitor domain
 * @param {Object} stages - Raw API stages data
 * @param {Object} synth - Existing synthesized data
 * @returns {Object} Enhanced synthesis with Gemini data
 */
function Worker_EnrichWithGeminiFallback(domain, stages, synth) {
  // Check if Serper failed (no credits or error)
  const serperSiteFailed = !stages.serperSite?.success || 
                           (stages.serperSite?.error || '').includes('Not enough credits');
  const serperBrandFailed = !stages.serperBrand?.success ||
                            (stages.serperBrand?.error || '').includes('Not enough credits');
  
  if (!serperSiteFailed && !serperBrandFailed) {
    // Serper worked, no fallback needed
    return synth;
  }
  
  Logger.log(`   🤖 Serper failed - activating Gemini fallback for ${domain}`);
  
  const geminiResult = Worker_GeminiKeywordFallback(domain, stages);
  
  if (!geminiResult?.success || !geminiResult?.data) {
    Logger.log(`   ⚠️ Gemini fallback also failed - using placeholder data`);
    return synth;
  }
  
  const geminiData = geminiResult.data;
  
  // Enrich SEO data
  if (!synth.seo || synth.seo.organicResults?.length === 0) {
    synth.seo = {
      indexedPages: geminiData.estimated_keyword_count || 10,
      organicResults: (geminiData.top_pages || []).map((p, i) => ({
        title: p.title || `Page ${i+1}`,
        snippet: p.description || '',
        position: p.position || i + 1,
        link: `https://${domain}/page-${i+1}`
      })),
      topPages: geminiData.top_pages || [],
      keywords: geminiData.top_keywords || [],
      dataSource: 'gemini_research',
      sourceIntegrity: 'ai_inferred'
    };
  }
  
  // Enrich SERP features
  if (!synth.serpFeatures || synth.serpFeatures.peopleAlsoAsk?.length === 0) {
    synth.serpFeatures = {
      peopleAlsoAsk: (geminiData.people_also_ask || []).map(q => ({ question: q })),
      relatedSearches: (geminiData.related_searches || []).map(s => ({ query: s })),
      sitelinks: [],
      dataSource: 'gemini_research',
      sourceIntegrity: 'ai_inferred'
    };
  }
  
  // Enrich traffic estimation
  if (!synth.traffic || synth.traffic.estimate === 0) {
    synth.traffic = {
      estimate: geminiData.estimated_organic_traffic || 0,
      confidenceLevel: 'ai_estimated',
      factors: {
        geminiEstimate: geminiData.estimated_organic_traffic || 0,
        keywordCount: geminiData.estimated_keyword_count || 0,
        niche: geminiData.industry_niche || 'unknown'
      },
      dataSource: 'gemini_research',
      sourceIntegrity: 'ai_inferred'
    };
  }
  
  // Add Gemini-specific metadata
  synth.geminiEnrichment = {
    applied: true,
    keywords: geminiData.top_keywords || [],
    niche: geminiData.industry_niche || 'unknown',
    authorityAssessment: geminiData.authority_signals || '',
    timestamp: new Date().toISOString()
  };
  
  Logger.log(`   ✅ Gemini enrichment applied: ${(geminiData.top_keywords || []).length} keywords`);
  
  return synth;
}


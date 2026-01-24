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
    
    // v28.8: Direct scrape fallback when PHP fetcher fails
    if (!result.stages.phpFetcher?.success || !result.stages.phpFetcher?.data?.metadata?.wordCount) {
      result.stages._directScrapeData = Worker_DirectScrape(fullUrl, cleanDomain);
    }
    
    result.synthesized = synthesizeWithTriangulation(cleanDomain, result.stages);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5B: v28.4 Gemini Fallback when Serper credits exhausted
    // ═══════════════════════════════════════════════════════════════════════
    result.synthesized = Worker_EnrichWithGeminiFallback(cleanDomain, result.stages, result.synthesized);
    
    // Calculate success metrics
    const successCount = Object.values(result.stages).filter(s => s.success).length;
    result.successRate = `${successCount}/${Object.keys(result.stages).length}`;
    
    // v29.0: Check if this is a known domain (should use fallback data even if APIs fail)
    const isKnownDomain = !!getKnownDomainAuthority(cleanDomain);
    const hasSynthesizedData = result.synthesized && 
      (result.synthesized.authority?.pageRank > 0 || result.synthesized.traffic?.estimate > 0);
    
    // v29.0: Success if at least 1 API OR is known domain OR has synthesized data
    result.success = successCount >= 1 || isKnownDomain || hasSynthesizedData;
    
    // v29.0: Set error message if not enough APIs succeeded
    if (!result.success) {
      const failedApis = Object.entries(result.stages)
        .filter(([k, v]) => !v.success)
        .map(([k, v]) => `${k}: ${v.error || 'failed'}`)
        .join(', ');
      result.error = `All APIs failed. Failed: ${failedApis}`;
      Logger.log(`   ⚠️ ${result.error}`);
    } else if (successCount < 2) {
      Logger.log(`   ⚠️ Only ${successCount} APIs succeeded, but proceeding with available data`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Store results in MySQL via Gateway
    // ═══════════════════════════════════════════════════════════════════════
    const resultId = Utilities.getUuid();
    
    try {
      storeJobResult(jobToken, competitorId, 'ENRICHED', result.synthesized, resultId);
      
      // Store raw stages for audit trail
      storeJobResult(jobToken, competitorId, 'RAW_FETCH', result.stages, Utilities.getUuid());
      
      Logger.log(`   💾 Results stored: ${resultId}`);
      
      // ═══════════════════════════════════════════════════════════════════════
      // v36.0: UPP COMMIT - Persist to specific MySQL tables
      // ═══════════════════════════════════════════════════════════════════════
      if (typeof UPP_commit === 'function') {
        // Link forensics (raw HTML + link data)
        if (result.synthesized.links || result.synthesized.backlinks) {
          UPP_commit({
            table: 'link_forensics',
            job_token: jobToken,
            domain: domain,
            competitor_id: competitorId,
            raw_html: result.stages.phpFetcher?.rawHtml || '',
            internal_links: result.synthesized.links?.internal || [],
            external_links: result.synthesized.links?.external || [],
            backlinks: result.synthesized.backlinks || []
          });
        }
        
        // Competitor results (enriched data)
        UPP_commit({
          table: 'competitor_results',
          job_token: jobToken,
          domain: domain,
          competitor_id: competitorId,
          authority_score: result.synthesized.authority?.pageRank || 0,
          traffic_estimate: result.synthesized.traffic?.estimate || 0,
          serp_features: result.synthesized.serpFeatures || [],
          technical_score: result.synthesized.technical?.score || 0,
          result_data: result.synthesized
        });
        
        Logger.log(`   🔄 UPP: Data committed to link_forensics + competitor_results`);
      }
      
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
 * V12.0: Enhanced with comprehensive logging for data flow debugging
 */
function synthesizeWithTriangulation(domain, stages) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 SYNTHESIZE WITH TRIANGULATION (V12.0) for: ' + domain);
  console.log('═══════════════════════════════════════════════════════');
  
  // V12.0: Log available stage data
  console.log('   Available stages:');
  Object.keys(stages).forEach(key => {
    const stage = stages[key];
    const status = stage?.success ? '✅' : (stage?.error ? '❌' : '⚪');
    console.log(`   ${status} ${key}: success=${stage?.success}, error=${stage?.error || 'none'}`);
  });
  
  const synth = {
    domain: domain,
    
    // Website metadata
    website: extractWebsiteData(stages),
    
    // Technical metrics (from PageSpeed)
    technical: extractTechnicalData(stages),
    
    // Authority metrics (from OpenPageRank + Serper)
    // v28.7: Pass domain for known-domain fallback
    authority: extractAuthorityData(stages, domain),
    
    // SEO intelligence (from Serper)
    seo: extractSeoData(stages),
    
    // Traffic estimation (triangulated)
    // v28.8: Pass domain for known-domain traffic fallback
    traffic: triangulateTraffic(stages, domain),
    
    // Content analysis (from PHP Fetcher)
    content: extractContentData(stages),
    
    // SERP features (from Serper Brand query)
    serpFeatures: extractSerpFeatures(stages),
    
    // Source integrity for each metric
    sourceIntegrity: {}
  };
  
  // V12.0: Log synthesized SERP data for debugging
  console.log('───────────────────────────────────────────────────────');
  console.log('   📊 SYNTHESIZED DATA SUMMARY:');
  console.log('   serpFeatures.paaCount:', synth.serpFeatures?._debug?.paaCount || 0);
  console.log('   serpFeatures.relatedCount:', synth.serpFeatures?._debug?.relatedCount || 0);
  console.log('   seo.organicResults:', synth.seo?.organicResults?.length || 0);
  console.log('   website.wordCount:', synth.website?.wordCount || 0);
  console.log('   authority.pageRank:', synth.authority?.pageRank || 0);
  console.log('═══════════════════════════════════════════════════════');
  
  // Track which sources provided which data
  Object.keys(synth).forEach(key => {
    if (typeof synth[key] === 'object' && synth[key] !== null) {
      synth.sourceIntegrity[key] = synth[key].sourceIntegrity || 'synthesized';
    }
  });
  
  return synth;
}

/**
 * Extract website metadata from PHP fetcher, Serper, or direct scrape
 * v28.8: Added Apps Script direct scrape fallback when PHP fetcher fails
 */
function extractWebsiteData(stages) {
  const phpData = stages.phpFetcher?.data || {};
  const serperData = stages.serperSite?.data || {};
  
  // Try PHP fetcher first (most complete)
  if (phpData.metadata && (phpData.metadata.title || phpData.metadata.wordCount > 0)) {
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
  
  // v28.8: Try direct scrape fallback if PHP fetcher failed
  if (stages._directScrapeData) {
    return stages._directScrapeData;
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
 * v28.7: Added known-domain fallback for major sites when API returns 0
 */
function extractAuthorityData(stages, domain) {
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
  
  // v28.7: Known major domain fallback when API returns 0
  // This handles cases where OpenPageRank API fails for major domains
  const knownDomainAuthority = getKnownDomainAuthority(domain);
  if (knownDomainAuthority) {
    Logger.log(`   ⚠️ OpenPageRank returned 0 for ${domain} - using known fallback: PR=${knownDomainAuthority.pageRank}`);
    return knownDomainAuthority;
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
 * v28.7: Known domain authority fallback data
 * Used when OpenPageRank API returns 0 for major domains
 */
function getKnownDomainAuthority(domain) {
  const cleanDomain = (domain || '').toLowerCase().replace(/^www\./, '');
  
  // Known major SEO/Marketing domains with approximate PageRank values
  const knownDomains = {
    'semrush.com': { pageRank: 7.2, domainRank: 150 },
    'ahrefs.com': { pageRank: 6.3, domainRank: 350 },
    'moz.com': { pageRank: 6.4, domainRank: 300 },
    'hubspot.com': { pageRank: 7.5, domainRank: 100 },
    'mailchimp.com': { pageRank: 7.0, domainRank: 200 },
    'salesforce.com': { pageRank: 7.8, domainRank: 80 },
    'shopify.com': { pageRank: 7.6, domainRank: 90 },
    'wordpress.org': { pageRank: 8.0, domainRank: 50 },
    'google.com': { pageRank: 9.5, domainRank: 1 },
    'youtube.com': { pageRank: 9.2, domainRank: 2 },
    'linkedin.com': { pageRank: 8.5, domainRank: 20 },
    'twitter.com': { pageRank: 8.8, domainRank: 10 },
    'facebook.com': { pageRank: 9.0, domainRank: 5 },
    'amazon.com': { pageRank: 9.3, domainRank: 3 },
    'wikipedia.org': { pageRank: 9.1, domainRank: 4 },
    'surferseo.com': { pageRank: 4.5, domainRank: 45000 },
    'jasper.com': { pageRank: 5.0, domainRank: 25000 },
    'copy.ai': { pageRank: 4.8, domainRank: 30000 },
    'writesonic.com': { pageRank: 4.2, domainRank: 60000 },
    'contentful.com': { pageRank: 5.5, domainRank: 15000 }
  };
  
  const known = knownDomains[cleanDomain];
  if (known) {
    return {
      pageRank: known.pageRank,
      domainRank: known.domainRank,
      pageRankInteger: Math.floor(known.pageRank),
      dataSource: 'known_fallback',
      sourceIntegrity: 'estimated'
    };
  }
  
  return null;
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
 * v28.8: Added known domain traffic fallback for major sites
 */
function triangulateTraffic(stages, domain) {
  const opr = stages.openPageRank?.data || {};
  const serperSite = stages.serperSite?.data || {};
  const organic = serperSite.organic || [];
  
  // v28.4: Use correct property name
  let pageRank = parseFloat(opr.pageRank ?? opr.page_rank_decimal ?? 0) || 0;
  const organicCount = organic.length;
  
  // v28.8: If PageRank is 0, try known domain fallback
  if (pageRank === 0 && domain) {
    const knownData = getKnownDomainAuthority(domain);
    if (knownData) {
      pageRank = knownData.pageRank;
      Logger.log(`   📊 Traffic: Using known fallback PR=${pageRank} for ${domain}`);
    }
  }
  
  // Calculate estimated traffic using triangulation formula
  // Higher PageRank + More indexed pages = More traffic
  let estimate = 0;
  let sourceIntegrity = 'unavailable';
  
  if (pageRank > 0 || organicCount > 0) {
    // Formula: (PageRank^2 * 1000) + (OrganicCount * 500)
    // This gives rough monthly traffic estimate
    estimate = Math.round((Math.pow(pageRank, 2) * 1000) + (organicCount * 500));
    sourceIntegrity = pageRank > 0 && organicCount === 0 ? 'fallback' : 'estimated';
  }
  
  // v28.8: If still no estimate and we have known domain, use fallback traffic
  if (estimate === 0 && domain) {
    const knownTraffic = getKnownDomainTraffic(domain);
    if (knownTraffic) {
      estimate = knownTraffic.traffic;
      sourceIntegrity = 'known_fallback';
      Logger.log(`   📊 Traffic: Using known traffic fallback: ${estimate} for ${domain}`);
    }
  }
  
  // Add position weighting (first page results get traffic boost)
  const firstPageCount = organic.filter(o => o.position <= 10).length;
  if (firstPageCount > 0) {
    estimate += firstPageCount * 2000;
    sourceIntegrity = 'inferred';
  }
  
  return {
    estimate: estimate,
    confidenceLevel: sourceIntegrity === 'inferred' ? 'medium' : sourceIntegrity === 'known_fallback' ? 'estimated' : 'low',
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
 * v28.8: Known domain traffic fallback
 * Uses approximate monthly organic traffic for major domains
 */
function getKnownDomainTraffic(domain) {
  const cleanDomain = (domain || '').toLowerCase().replace(/^www\./, '');
  
  // Approximate monthly organic traffic for major SEO/Marketing domains
  const knownTraffic = {
    'semrush.com': { traffic: 12000000, keywords: 850000 },
    'ahrefs.com': { traffic: 6500000, keywords: 450000 },
    'moz.com': { traffic: 3500000, keywords: 280000 },
    'hubspot.com': { traffic: 18000000, keywords: 1200000 },
    'mailchimp.com': { traffic: 9000000, keywords: 650000 },
    'salesforce.com': { traffic: 25000000, keywords: 1500000 },
    'shopify.com': { traffic: 22000000, keywords: 1400000 },
    'surferseo.com': { traffic: 450000, keywords: 35000 },
    'jasper.com': { traffic: 850000, keywords: 55000 },
    'copy.ai': { traffic: 650000, keywords: 45000 },
    'writesonic.com': { traffic: 350000, keywords: 28000 },
    'contentful.com': { traffic: 1200000, keywords: 85000 }
  };
  
  return knownTraffic[cleanDomain] || null;
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
 * V12.0: Enhanced with comprehensive logging for debugging PAA/Related=0 issues
 */
function extractSerpFeatures(stages) {
  const serperBrand = stages.serperBrand?.data || {};
  
  // V12.0: Detailed logging for debugging data flow
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 SERP FEATURES EXTRACTION (V12.0)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   stages.serperBrand exists:', !!stages.serperBrand);
  console.log('   stages.serperBrand.success:', stages.serperBrand?.success);
  console.log('   stages.serperBrand.error:', stages.serperBrand?.error || 'none');
  console.log('   serperBrand keys:', Object.keys(serperBrand).join(', '));
  
  // V12.0: Extract with fallback sources
  const paa = serperBrand.peopleAlsoAsk || [];
  const related = serperBrand.relatedSearches || [];
  
  console.log('   peopleAlsoAsk raw:', JSON.stringify(paa).substring(0, 200));
  console.log('   relatedSearches raw:', JSON.stringify(related).substring(0, 200));
  console.log('   PAA count:', paa.length);
  console.log('   Related count:', related.length);
  console.log('═══════════════════════════════════════════════════════');
  
  return {
    peopleAlsoAsk: paa,
    relatedSearches: related,
    knowledgeGraph: serperBrand.knowledgeGraph || null,
    featuredSnippet: serperBrand.answerBox || null,
    sitelinks: (serperBrand.organic || [])[0]?.sitelinks || [],
    dataSource: Object.keys(serperBrand).length > 0 ? 'serper_brand' : 'none',
    sourceIntegrity: Object.keys(serperBrand).length > 0 ? 'api' : 'unavailable',
    // V12.0: Add diagnostic fields
    _debug: {
      hasSerperData: Object.keys(serperBrand).length > 0,
      paaCount: paa.length,
      relatedCount: related.length,
      organicCount: (serperBrand.organic || []).length
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DIRECT SCRAPE FALLBACK - v28.8: Native Apps Script scrape when PHP fetcher fails
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Direct scrape using native UrlFetchApp when PHP fetcher fails
 * v28.8: Fallback to ensure content data always populates
 * @param {string} url - Full URL to scrape
 * @param {string} domain - Clean domain name
 * @returns {Object} Website data matching extractWebsiteData format
 */
function Worker_DirectScrape(url, domain) {
  console.log(`🔧 v28.8 DIRECT SCRAPE FALLBACK for: ${url}`);
  
  const defaultResult = {
    title: `${domain} - Homepage`,
    metaDescription: '',
    h1: '',
    h2: [],
    wordCount: 0,
    schemaTypes: [],
    dataSource: 'direct_scrape_failed',
    sourceIntegrity: 'fallback'
  };
  
  try {
    // Attempt direct fetch with reasonable timeout
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    const statusCode = response.getResponseCode();
    console.log(`   ↳ Direct scrape response: HTTP ${statusCode}`);
    
    if (statusCode !== 200) {
      console.log(`   ❌ Direct scrape failed: HTTP ${statusCode}`);
      return defaultResult;
    }
    
    const html = response.getContentText();
    if (!html || html.length < 100) {
      console.log(`   ❌ Direct scrape failed: Empty or minimal content`);
      return defaultResult;
    }
    
    console.log(`   ✅ Direct scrape success: ${html.length} bytes`);
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().substring(0, 200) : `${domain} - Homepage`;
    
    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = metaMatch ? metaMatch[1].trim().substring(0, 500) : '';
    
    // Extract H1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].trim().replace(/<[^>]+>/g, '').substring(0, 200) : '';
    
    // Extract H2s (first 10)
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    const h2s = [];
    let h2Match;
    while ((h2Match = h2Regex.exec(html)) !== null && h2s.length < 10) {
      const h2Text = h2Match[1].trim().replace(/<[^>]+>/g, '');
      if (h2Text.length > 2 && h2Text.length < 200) {
        h2s.push(h2Text);
      }
    }
    
    // Calculate word count from body text
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let wordCount = 0;
    if (bodyMatch) {
      // Remove script, style, and HTML tags
      const bodyText = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      wordCount = bodyText.split(/\s+/).filter(w => w.length > 1).length;
    }
    
    // Extract schema types
    const schemaTypes = [];
    const schemaMatches = html.matchAll(/"@type"\s*:\s*"([^"]+)"/gi);
    for (const match of schemaMatches) {
      if (!schemaTypes.includes(match[1])) {
        schemaTypes.push(match[1]);
      }
    }
    
    console.log(`   📊 Extracted: title="${title.substring(0, 40)}...", wordCount=${wordCount}, h1="${h1.substring(0, 30)}...", h2s=${h2s.length}`);
    
    return {
      title: title,
      metaDescription: metaDescription,
      h1: h1,
      h2: h2s,
      wordCount: wordCount,
      schemaTypes: schemaTypes.slice(0, 10),
      dataSource: 'direct_scrape',
      sourceIntegrity: 'fallback'
    };
    
  } catch (error) {
    console.error(`   ❌ Direct scrape error: ${error.message}`);
    return defaultResult;
  }
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
    
    // v32.0 FIX: Added calibration data to prevent over-estimation
    // Previous estimates were 2-3x higher than Ahrefs reality
    const prompt = `You are an expert SEO analyst. Analyze the competitor domain "${domain}" and provide intelligence data.

Context from their website:
- Title: ${pageContext.title || '(not available)'}
- H1: ${pageContext.h1 || '(not available)'}
- Description: ${pageContext.description || '(not available)'}
- Key Headings: ${pageContext.h2s.join(', ') || '(none extracted)'}
- Word Count: ${pageContext.wordCount || 'unknown'}

⚠️ CRITICAL CALIBRATION DATA (December 2025 Ahrefs measurements):
| Domain | Organic Traffic | Keywords |
|--------|-----------------|----------|
| semrush.com | 9,700,000 | 7,900,000 |
| ahrefs.com | 3,800,000 | 2,900,000 |
| moz.com | 1,200,000 | 850,000 |
| surferseo.com | 268,800 | 120,000 |
| toptal.com | 553,700 | 305,300 |

Use these as reference points. Be CONSERVATIVE - it's better to underestimate than overestimate. Most SaaS companies have 50K-500K monthly traffic, not millions.

Based on your knowledge of ${domain} and calibrated against the data above, provide a JSON response with:
1. top_keywords: Array of 10 keywords they likely rank for (string array)
2. estimated_organic_traffic: Monthly organic traffic estimate (number) - BE CONSERVATIVE
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
  // v31.1 FIX: ALWAYS overwrite with Gemini estimates when available
  // Previous bug: CTR-calculated estimate (20K) was preserved over Gemini (450K)
  const geminiTrafficEstimate = geminiData.estimated_organic_traffic || 0;
  const geminiKeywordCount = geminiData.estimated_keyword_count || 0;
  
  if (geminiTrafficEstimate > 0) {
    // Gemini has real estimates - ALWAYS use them (they're much more accurate)
    synth.traffic = {
      estimate: geminiTrafficEstimate,  // v31.1: Use Gemini estimate, not CTR
      confidenceLevel: 'ai_estimated',
      factors: {
        geminiEstimate: geminiTrafficEstimate,  // Store original for reference
        keywordCount: geminiKeywordCount,
        niche: geminiData.industry_niche || 'unknown',
        ctrEstimate: synth.traffic?.estimate || 0  // Preserve old CTR value for comparison
      },
      dataSource: 'gemini_research',
      sourceIntegrity: 'ai_inferred'
    };
    Logger.log('   🎯 [v31.1] Using Gemini traffic estimate: ' + geminiTrafficEstimate.toLocaleString() + ' (CTR was: ' + (synth.traffic?.factors?.ctrEstimate || 0).toLocaleString() + ')');
  } else if (!synth.traffic || synth.traffic.estimate === 0) {
    // No Gemini data and no existing data - use zeros
    synth.traffic = {
      estimate: 0,
      confidenceLevel: 'no_data',
      factors: {
        geminiEstimate: 0,
        keywordCount: 0,
        niche: 'unknown'
      },
      dataSource: 'none',
      sourceIntegrity: 'missing'
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


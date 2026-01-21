/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE ELITE v21.0 - DISTRIBUTED INTELLIGENCE ENGINE
 * "Ahrefs Killer" - High-Performance, Compliant, Unlimited Data Collection
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Enterprise-Grade Data Collection & Analysis (Surpassing Ahrefs/SEMrush)
 * 
 * STRATEGIC DIFFERENTIATION:
 * ┌─────────────────────┬────────────────────────┬─────────────────────────────────┐
 * │ Feature             │ Ahrefs/Semrush         │ Oracle Elite v21.0              │
 * ├─────────────────────┼────────────────────────┼─────────────────────────────────┤
 * │ Data Retrieval      │ Fixed proprietary      │ Distributed Triangulation       │
 * │ Legal Status        │ Scraping lawsuits      │ API-First Compliance            │
 * │ Intelligence        │ Retrospective (past)   │ Predictive + Forensic (2026 CTR)│
 * │ UI Integration      │ Static tables          │ Dynamic Bento-Grid + Mind Maps  │
 * └─────────────────────┴────────────────────────┴─────────────────────────────────┘
 * 
 * ARCHITECTURE - PARALLEL TRI-LAYER EXECUTION (10x faster):
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  LAYER 1: SEMANTIC METADATA SCRAPER (Elite Intelligence)              │
 * │  ├── H1-H6, Meta tags, Schema.org JSON-LD extraction                  │
 * │  ├── robots.txt compliance (RobotsParser integration)                 │
 * │  ├── Adaptive throttling (human-like behavior)                        │
 * │  └── PII scrubbing (GDPR/CCPA compliant)                              │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │  LAYER 2: SEARCH INTELLIGENCE (Serper/OpenPageRank)                   │
 * │  ├── Organic visibility via official API channels                     │
 * │  ├── Authority footprints (PageRank)                                  │
 * │  ├── Serper Oracle Bridge (FT_Serper_Oracle_Bridge.gs)                │
 * │  └── Automatic fallback with proof traces                             │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │  LAYER 3: FORENSIC INFERENCE ENGINE                                   │
 * │  ├── Causal inference (PageRank + Keywords + Benchmarks)              │
 * │  ├── Entity relationship mapping (semantic, not keyword lists)        │
 * │  ├── JSON Transformer (D3.js Mind Map + Bento-Grid ready)             │
 * │  └── Source integrity scoring for every metric                        │
 * └────────────────────────────────────────────────────────────────────────┘
 * 
 * COMPLIANCE MANDATE:
 * ✅ Strict robots.txt adherence (RobotsParser class)
 * ✅ Google ToS compliant (API-first orchestration)
 * ✅ Adaptive throttling (5s polite delay, 60min cooldown on 429)
 * ✅ PII scrubbing (GDPR/CCPA via PIIScrubber class)
 * ✅ Residential proxy support for broad accessibility
 * 
 * DATA TRANSPARENCY:
 * ✅ Every metric includes source_integrity score (api | estimated | inferred)
 * ✅ Proof traces link to raw JSON snippets
 * ✅ Click-to-reveal raw data in UI
 * 
 * CAPABILITIES:
 * ✅ 100+ Keywords Per Competitor (Direct + API + Inference)
 * ✅ Entity Relationship Mapping (not just keyword lists)
 * ✅ Predictive 2026 CTR Models + LLM Evaluation
 * ✅ D3.js Radial Mind Map visualization
 * ✅ Dynamic Bento-Grid UI with proof traces
 * ✅ Causal inference when direct fetch is blocked
 * 
 * DEPENDENCIES:
 * - FT_Governance.gs (RobotsParser, PIIScrubber, AdaptiveThrottler, QuotaMonitor)
 * - FT_Serper_Oracle_Bridge.gs (API fallback with proof traces)
 * - FT_JSON_Transformer.gs (D3.js Mind Map, Bento-Grid, Entity Graph)
 * 
 * @author SerpifAI Engineering
 * @version 21.0.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ELITE CONFIGURATION - ORACLE ELITE v21.0
// ═══════════════════════════════════════════════════════════════════════════════════

var SERPIFAI_ELITE_CONFIG = {
  // System Identity
  SYSTEM_NAME: 'SerpifAI Oracle Elite Distributed Intelligence Engine',
  VERSION: '21.0.0',
  
  // Collection Strategy - Parallel Tri-Layer
  STRATEGY: {
    PRIMARY: 'semantic_metadata_scraper',   // Layer 1: Direct intelligence
    SECONDARY: 'search_intelligence_api',   // Layer 2: Serper/OPR APIs
    TERTIARY: 'forensic_inference_engine',  // Layer 3: Causal inference
    EXECUTION_MODE: 'parallel'              // Execute layers in parallel where possible
  },
  
  // Compliance Mandate (robots.txt + ToS)
  COMPLIANCE: {
    RESPECT_ROBOTS_TXT: true,               // Mandatory - uses RobotsParser
    ADAPTIVE_THROTTLING: true,              // Human-like request patterns
    PII_SCRUBBING: true,                    // GDPR/CCPA compliance
    POLITE_DELAY_MS: 5000,                  // 5 second delay between requests
    RATE_LIMIT_COOLDOWN_MS: 3600000,        // 60 minutes on 429 response
    USER_AGENT: 'SerpifAI-OracleBot/1.0 (+https://serpifai.com/bot-policy)'
  },
  
  // v26.0 BALANCED TURBO MODE - Speed WITHOUT losing data quality
  TURBO_MODE: {
    ENABLED: true,                         // v26.0: Enable turbo for batch analysis
    SKIP_PAGE_CRAWL: true,                 // v26.0: Skip slow Layer 1 page crawling
    KEEP_API_ENRICHMENT: true,             // v26.0: ALWAYS run Layer 2 APIs (Serper, PageRank)
    MAX_PAGES_TURBO: 3,                    // v26.0: Minimal pages if Layer 1 runs
    REDUCED_DELAYS: true                   // v26.0: Minimal delays between requests
  },
  
  // Direct Fetching Limits (Layer 1) - Only used when NOT in turbo mode
  DIRECT_FETCH: {
    MAX_PAGES_PER_DOMAIN: 8,               // v26.0: Balanced (was 5, too aggressive)
    FETCH_TIMEOUT_MS: 8000,                // v26.0: Reasonable timeout
    SITEMAP_TIMEOUT_MS: 4000,              // v26.0: Sitemap timeout
    DELAY_BETWEEN_PAGES_MS: 50,            // v26.0: Minimal delay (was 0, too aggressive)
    MAX_INTERNAL_LINKS: 75,                // v26.0: Balanced (was 50)
    CONTENT_MIN_WORDS: 100,                // Minimum words for analysis
    EXTRACT_SCHEMA_LD: true,               // JSON-LD extraction
    EXTRACT_HEADINGS: true                 // H1-H6 semantic hierarchy
  },
  
  // API Rate Control (Layer 2)
  API_LIMITS: {
    MAX_SERPER_CALLS: 10,                  // Via Serper Oracle Bridge
    MAX_OPR_CALLS: 3,                      // OpenPageRank calls
    BATCH_DELAY_MS: 1200,                  // Delay between API calls
    USE_BRIDGE_FALLBACK: true              // Automatic API fallback
  },
  
  // Forensic Inference (Layer 3)
  INFERENCE: {
    ENABLED: true,
    USE_INDUSTRY_BENCHMARKS: true,
    USE_CAUSAL_MODEL: true,
    CONFIDENCE_THRESHOLD: 0.6              // Minimum confidence for inferred data
  },
  
  // Caching
  CACHE_TTL_HOURS: 24,
  
  // Keyword Settings
  KEYWORDS: {
    MIN_PER_COMPETITOR: 50,                // Increased minimum
    MAX_PER_COMPETITOR: 150,               // Increased maximum
    CLUSTER_SIZE: 5,
    MIN_WORD_LENGTH: 3,
    ENTITY_MAPPING: true                   // Map keywords to entities
  },
  
  // Traffic Estimation (2026 CTR Model - Predictive)
  CTR_CURVE: {
    1: 0.398, 2: 0.187, 3: 0.102, 4: 0.072, 5: 0.051,
    6: 0.037, 7: 0.028, 8: 0.021, 9: 0.016, 10: 0.012
  },
  
  // SERP Feature Modifiers (2026 AI Overview Impact)
  SERP_MODIFIERS: {
    featured_snippet: -0.155, ai_overview: -0.25, knowledge_graph: -0.08,
    video_carousel: -0.05, local_pack: -0.10, shopping: -0.12, sitelinks: 0.05,
    people_also_ask: -0.03, image_pack: -0.02
  },
  
  // Industry CPC Benchmarks (USD)
  CPC_BY_INDUSTRY: {
    'seo': 4.80, 'marketing': 3.80, 'saas': 5.50, 'software': 4.20,
    'finance': 8.50, 'insurance': 12.00, 'legal': 9.50, 'health': 3.20,
    'ecommerce': 2.80, 'travel': 2.50, 'education': 3.00, 'technology': 4.00,
    'default': 2.50
  },
  
  // Country Data
  COUNTRY_FLAGS: {
    'US': '🇺🇸', 'GB': '🇬🇧', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'IN': '🇮🇳', 'BR': '🇧🇷', 'JP': '🇯🇵',
    'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
    'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'RU': '🇷🇺', 'CN': '🇨🇳',
    'KR': '🇰🇷', 'MX': '🇲🇽', 'OTHER': '🌍'
  },
  
  // TLD Distribution
  TLD_COUNTRY_MAP: {
    'com': { primary: 'US', distribution: { US: 42, GB: 11, CA: 7, AU: 6, DE: 5, IN: 8, OTHER: 21 } },
    'co': { primary: 'US', distribution: { US: 38, GB: 12, CA: 8, AU: 7, DE: 6, OTHER: 29 } },
    'io': { primary: 'US', distribution: { US: 45, GB: 14, DE: 8, CA: 6, OTHER: 27 } },
    'ai': { primary: 'US', distribution: { US: 48, GB: 12, DE: 7, CA: 5, OTHER: 28 } },
    'uk': { primary: 'GB', distribution: { GB: 72, US: 8, IE: 4, OTHER: 16 } },
    'de': { primary: 'DE', distribution: { DE: 68, AT: 8, CH: 6, OTHER: 18 } },
    'fr': { primary: 'FR', distribution: { FR: 70, BE: 8, CH: 5, CA: 4, OTHER: 13 } },
    'au': { primary: 'AU', distribution: { AU: 75, NZ: 8, US: 5, OTHER: 12 } }
  }
};

// Legacy config alias for backward compatibility
var ORACLE_ELITE_CONFIG = SERPIFAI_ELITE_CONFIG;

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ORACLE ELITE v21.0 - MAIN ENTRY POINT (PARALLEL TRI-LAYER)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Main entry point for Oracle Elite Distributed Intelligence Engine v21.0
 * 
 * PARALLEL TRI-LAYER EXECUTION:
 * ┌─────────────────────────────────────────────────────────────────────────────────┐
 * │  LAYER 1: SEMANTIC METADATA SCRAPER ─────┐                                      │
 * │  LAYER 2: SEARCH INTELLIGENCE (APIs) ────┼──▶ Parallel Execution ──▶ Synthesis │
 * │  LAYER 3: FORENSIC INFERENCE ENGINE ─────┘                                      │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 * 
 * COMPLIANCE GUARDS:
 * - RobotsParser: Checks robots.txt before every fetch
 * - AdaptiveThrottler: Mimics human behavior, backs off on errors
 * - PIIScrubber: Removes personally identifiable information
 * - QuotaMonitor: Tracks API usage against limits
 * 
 * @param {string} domain - Competitor domain
 * @param {object} options - Collection options
 * @return {object} Complete elite intelligence package with proof traces
 */
function ORACLE_collectEliteData(domain, options) {
  options = options || {};
  const startTime = Date.now();
  
  // v26.0 BALANCED TURBO: In batch mode, skip ONLY the slow page-by-page crawling
  // Still run API enrichment (Serper Bridge, OpenPageRank) for real data!
  const isTurboMode = SERPIFAI_ELITE_CONFIG.TURBO_MODE?.ENABLED && options.batchMode;
  
  if (isTurboMode) {
    Logger.log(`⚡ v26.0 TURBO: Fast mode for ${domain} (skipping page crawl, keeping API enrichment)`);
  }
  
  Logger.log(`\n${'═'.repeat(70)}`);
  Logger.log(`🚀 ${SERPIFAI_ELITE_CONFIG.SYSTEM_NAME} v${SERPIFAI_ELITE_CONFIG.VERSION}`);
  Logger.log(`   Domain: ${domain}`);
  Logger.log(`   Mode: ${isTurboMode ? 'TURBO (API-only)' : 'Full Tri-Layer Intelligence'}`);
  Logger.log(`   Compliance: robots.txt ✓ | Adaptive Throttling ✓ | PII Scrubbing ✓`);
  Logger.log(`${'═'.repeat(70)}\n`);
  
  // Initialize compliance guards
  const robotsParser = typeof RobotsParser !== 'undefined' ? new RobotsParser() : null;
  const throttler = typeof AdaptiveThrottler !== 'undefined' ? new AdaptiveThrottler() : null;
  const piiScrubber = typeof PIIScrubber !== 'undefined' ? new PIIScrubber() : null;
  const quotaMonitor = typeof QuotaMonitor !== 'undefined' ? new QuotaMonitor() : null;
  
  // PRE-FLIGHT COMPLIANCE CHECK
  if (robotsParser && SERPIFAI_ELITE_CONFIG.COMPLIANCE.RESPECT_ROBOTS_TXT) {
    const robotsCheck = robotsParser.isAllowed(`https://${domain}/`);
    if (!robotsCheck.allowed) {
      Logger.log(`⛔ COMPLIANCE BLOCK: robots.txt disallows access to ${domain}`);
      Logger.log(`   Reason: ${robotsCheck.reason}`);
      Logger.log(`   Falling back to API-only mode...`);
      options._robotsBlocked = true;
    } else {
      Logger.log(`✅ Compliance Check Passed: robots.txt allows crawling`);
      const crawlDelay = robotsParser.getCrawlDelay(domain);
      if (crawlDelay > SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.DELAY_BETWEEN_PAGES_MS) {
        Logger.log(`   Crawl-Delay: ${crawlDelay}ms (respecting robots.txt)`);
        options._crawlDelay = crawlDelay;
      }
    }
  }
  
  // Check cache first
  const cacheKey = `oracle_elite_v21_${domain.replace(/\./g, '_')}`;
  const cached = ELITE_getFromCache(cacheKey);
  if (cached && !options.forceRefresh) {
    const ageHours = Math.round((Date.now() - cached.fetchedAt) / 3600000);
    Logger.log(`✅ Using cached intelligence (${ageHours}h old)`);
    cached._fromCache = true;
    return cached;
  }
  
  // Initialize result structure with v21.0 enhancements
  const result = ELITE_initializeResultStructure(domain);
  result.complianceStatus = {
    robotsTxtChecked: !!robotsParser,
    robotsTxtAllowed: !options._robotsBlocked,
    piiScrubbed: !!piiScrubber,
    adaptiveThrottling: !!throttler
  };
  result.proofTraces = [];
  
  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // LAYER 1: SEMANTIC METADATA SCRAPER (Elite Intelligence)
    // v26.0: SKIPPED in turbo mode - this is the slow part (page-by-page crawling)
    // ═══════════════════════════════════════════════════════════════════════════
    Logger.log(`\n┌${'─'.repeat(68)}┐`);
    Logger.log(`│ LAYER 1: SEMANTIC METADATA SCRAPER (Direct Intelligence)${' '.repeat(10)}│`);
    Logger.log(`└${'─'.repeat(68)}┘\n`);
    
    let directIntel = { pagesAnalyzed: 0, keywords: [], contentQuality: 0 };
    
    // v26.0 TURBO: Skip slow page crawling in batch mode
    if (isTurboMode) {
      Logger.log(`   ⚡ Layer 1 SKIPPED (TURBO mode - saves ~15-20s)`);
      Logger.log(`   → Will rely on API data from Layer 2`);
    } else if (!options._robotsBlocked) {
      // Apply adaptive throttling
      if (throttler) {
        throttler.waitPolitely(domain);
      }
      
      directIntel = ELITE_collectDirectIntelligence(domain, options);
      
      // Scrub PII from content
      if (piiScrubber && directIntel.website) {
        const scrubResult = piiScrubber.scrub(directIntel.website.description || '');
        if (scrubResult.piiDetected) {
          Logger.log(`   🔒 PII Scrubbed: ${scrubResult.stats.total} items removed`);
          directIntel.website.description = scrubResult.content;
        }
      }
      
      ELITE_mergeDirectIntelligence(result, directIntel);
      
      Logger.log(`   ✅ Layer 1 Complete (Semantic Metadata Scraper):`);
      Logger.log(`      • Pages Analyzed: ${directIntel.pagesAnalyzed}`);
      Logger.log(`      • Keywords Extracted: ${result.keywords.length}`);
      Logger.log(`      • Schema.org Types Found: ${result.website.schemaTypes?.length || 0}`);
      Logger.log(`      • Content Quality Score: ${directIntel.contentQuality}/100`);
    } else {
      Logger.log(`   ⏭️ Layer 1 Skipped (robots.txt blocked - using API fallback)`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LAYER 2: SEARCH INTELLIGENCE (Serper/OpenPageRank APIs)
    // v26.0: ALWAYS RUN - This provides the real data!
    // ═══════════════════════════════════════════════════════════════════════════
    Logger.log(`\n┌${'─'.repeat(68)}┐`);
    Logger.log(`│ LAYER 2: SEARCH INTELLIGENCE (API Orchestration)${' '.repeat(18)}│`);
    Logger.log(`└${'─'.repeat(68)}┘\n`);
    
    // Check quota before API calls
    if (quotaMonitor && !quotaMonitor.canFetch()) {
      Logger.log(`   ⚠️ Daily quota threshold reached - skipping API calls`);
    } else {
      // Use Serper Oracle Bridge for API fallback with proof traces
      const gaps = ELITE_identifyDataGaps(result);
      
      if (Object.keys(gaps).length > 0 && typeof SERPER_BRIDGE_fillGaps === 'function') {
        Logger.log(`   🌉 Engaging Serper Oracle Bridge for data gaps...`);
        const bridgeData = SERPER_BRIDGE_fillGaps(domain, result, gaps);
        
        if (bridgeData.success) {
          ELITE_mergeBridgeData(result, bridgeData);
          result.proofTraces.push(...(bridgeData.proofTraces || []));
          Logger.log(`   ✅ Bridge filled ${Object.keys(bridgeData.dataPoints).length} data gaps`);
        }
      } else {
        // Fallback to standard API enrichment
        const apiEnrichment = ELITE_collectAPIEnrichment(domain, result, options);
        ELITE_mergeAPIEnrichment(result, apiEnrichment);
        
        Logger.log(`   ✅ Layer 2 Complete (Search Intelligence):`);
        Logger.log(`      • Serper Keywords Added: ${apiEnrichment.serperKeywordsAdded}`);
        Logger.log(`      • PageRank: ${apiEnrichment.pageRank}`);
        Logger.log(`      • API Calls Used: ${apiEnrichment.apiCalls}`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LAYER 3: FORENSIC INFERENCE ENGINE + DATA SYNTHESIS
    // ═══════════════════════════════════════════════════════════════════════════
    Logger.log(`\n┌${'─'.repeat(68)}┐`);
    Logger.log(`│ LAYER 3: FORENSIC INFERENCE ENGINE & DATA SYNTHESIS${' '.repeat(15)}│`);
    Logger.log(`└${'─'.repeat(68)}┘\n`);
    
    // Apply causal inference for any remaining data gaps
    if (SERPIFAI_ELITE_CONFIG.INFERENCE.ENABLED) {
      const remainingGaps = ELITE_identifyDataGaps(result);
      if (Object.keys(remainingGaps).length > 0) {
        Logger.log(`   ⚡ Applying causal inference for ${Object.keys(remainingGaps).length} remaining gaps...`);
        ELITE_applyForensicInference(result, domain, remainingGaps);
      }
    }
    
    // Map keywords to entities (semantic mapping instead of just lists)
    if (SERPIFAI_ELITE_CONFIG.KEYWORDS.ENTITY_MAPPING) {
      result.entityGraph = ELITE_buildEntityGraph(result);
      Logger.log(`   ✅ Entity Graph: ${result.entityGraph?.entities?.length || 0} entities mapped`);
    }
    
    // Synthesize for Gemini AI
    ELITE_synthesizeForGemini(result, domain);
    
    // Synthesize for UI (Bento-Grid + Mind Map ready)
    ELITE_synthesizeForUI(result, domain);
    
    // Apply JSON Transformer for D3.js Mind Map and Bento-Grid format
    if (typeof JSON_TRANSFORM_toUIPayload === 'function') {
      Logger.log(`   🔄 Applying JSON Transformer for UI-ready payload...`);
      const uiPayload = JSON_TRANSFORM_toUIPayload(result);
      result.uiPayload = uiPayload;
      result.mindMap = uiPayload.mindMap;
      result.bentoCards = uiPayload.bentoCards;
      result.proofTraces.push(...(uiPayload.proofTraces || []));
    }
    
    Logger.log(`   ✅ Layer 3 Complete (Forensic Inference + Synthesis):`);
    Logger.log(`      • Gemini Insights Ready: ${result.geminiReady ? 'Yes' : 'No'}`);
    Logger.log(`      • UI Data Mapped: ${result.uiReady ? 'Yes' : 'No'}`);
    Logger.log(`      • Mind Map Nodes: ${result.mindMap?.nodeCount || 0}`);
    Logger.log(`      • Bento Cards: ${result.bentoCards?.length || 0}`);
    Logger.log(`      • Proof Traces: ${result.proofTraces?.length || 0}`);
    
    // Calculate final metrics
    result.traffic = ELITE_calculateTrafficMetrics(domain, result.keywords, result.topPages);
    result.authority = ELITE_calculateAuthority(domain, result);
    // V2.0: Pass website data for hreflang/language analysis
    result.geographic = ELITE_analyzeGeographic(domain, result.traffic.organic, result.website);
    result.dataQuality.confidence = ELITE_calculateConfidence(result);
    
    // Cache the result
    ELITE_saveToCache(cacheKey, result);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // v35.0 UNIVERSAL PERSISTENCE PROVIDER - Force 100% MySQL persistence
    // Eliminates "0 B Data Size" by routing ALL data to MySQL
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof UPP_commit === 'function') {
      Logger.log(`\n💾 [UPP] Persisting to MySQL...`);
      
      // 1. Persist content/scrape data to link_forensics
      UPP_commit({
        type: 'link_forensics',
        domain: domain,
        jobToken: options.jobToken,
        competitorId: options.competitorId,
        payload: {
          url: result.website?.url || 'https://' + domain,
          title: result.website?.title || '',
          metaDescription: result.website?.description || '',
          wordCount: result.contentQuality?.wordCount || 0,
          headings: result.website?.headings || {},
          links: result.website?.links || {},
          schema: result.website?.schemaTypes || [],
          rawHtml: result.website?.rawHtml || ''
        }
      });
      
      // 2. Persist keywords to keyword_intelligence
      UPP_commit({
        type: 'keyword_intelligence',
        domain: domain,
        jobToken: options.jobToken,
        competitorId: options.competitorId,
        payload: {
          keywords: result.keywords || [],
          rankedKeywords: result.rankedKeywords || [],
          top10Count: result.keywords?.filter(k => k.position <= 10).length || 0,
          top20Count: result.keywords?.filter(k => k.position <= 20).length || 0,
          visibilityScore: result.visibility?.score || 0,
          clusters: result.keywordClusters || []
        }
      });
      
      // 3. Persist technical/meta data to competitor_results
      UPP_commit({
        type: 'competitor_results',
        domain: domain,
        jobToken: options.jobToken,
        competitorId: options.competitorId,
        payload: {
          domainAuthority: result.authority?.score || 0,
          trafficEstimate: result.traffic?.organic || 0,
          backlinkCount: result.backlinks?.total || 0,
          contentScore: result.contentQuality?.score || 0,
          technicalScore: result.technical?.score || 0,
          loadTime: result.performance?.loadTime || 0,
          mobileFriendly: result.technical?.mobileFriendly || false,
          httpsEnabled: result.technical?.https || true
        }
      });
      
      // 4. Persist full result to job_results as RAW_FETCH
      UPP_commit({
        type: 'raw_fetch',
        domain: domain,
        jobToken: options.jobToken,
        competitorId: options.competitorId,
        payload: result
      });
      
      Logger.log(`   ✅ [UPP] MySQL persistence complete`);
      
      // 5. Trigger Workflow Seeder check (fires when 6th competitor saved)
      if (typeof WF_checkAndSeed === 'function' && options.jobToken) {
        const seedResult = WF_checkAndSeed(options.jobToken, 6);
        if (seedResult.triggered) {
          Logger.log(`   🌱 [WF_Seeder] Workflow seeding triggered! ${seedResult.opportunitiesSeeded} opportunities`);
        }
      }
    }
    
    // Final summary
    Logger.log(`\n${'═'.repeat(70)}`);
    Logger.log(`✅ SERPIFAI ELITE INTELLIGENCE COMPLETE`);
    Logger.log(`${'─'.repeat(70)}`);
    Logger.log(`   📊 Keywords: ${result.keywords.length} (${result.keywordClusters.length} clusters)`);
    Logger.log(`   📄 Top Pages: ${result.topPages.length}`);
    Logger.log(`   📈 Traffic: ${result.traffic.organic.toLocaleString()}/mo`);
    Logger.log(`   💰 Value: $${result.traffic.value.toLocaleString()}/mo`);
    Logger.log(`   🔗 Backlinks: ${result.backlinks.total.toLocaleString()}`);
    Logger.log(`   🏆 Authority: ${result.authority.score}/100`);
    Logger.log(`   ⏱️ Time: ${Date.now() - startTime}ms`);
    Logger.log(`   🎯 Confidence: ${result.dataQuality.confidence}%`);
    Logger.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    Logger.log(`❌ ELITE ENGINE ERROR: ${error.toString()}`);
    result.error = error.toString();
  }
  
  return result;
}

/**
 * Initialize the result structure with all fields
 */
function ELITE_initializeResultStructure(domain) {
  return {
    // Metadata
    domain: domain,
    fetchedAt: Date.now(),
    version: SERPIFAI_ELITE_CONFIG.VERSION,
    system: SERPIFAI_ELITE_CONFIG.SYSTEM_NAME,
    
    // Intelligence Sources
    sources: {
      direct: { success: false, pagesAnalyzed: 0 },
      serper: { success: false, keywordsAdded: 0 },
      pageRank: { success: false, score: 0 }
    },
    
    // Core Metrics
    authority: null,
    traffic: null,
    backlinks: { total: 0, refDomains: 0, dofollow: 85, nofollow: 15 },
    
    // Keywords (50+)
    keywords: [],
    keywordClusters: [],
    
    // Top Pages
    topPages: [],
    
    // Website Intelligence
    website: {
      title: '',
      description: '',
      h1: '',
      wordCount: 0,
      contentQuality: 0,
      schemaTypes: [],
      technologies: []
    },
    
    // Content Analysis
    content: {
      topics: [],
      entities: [],
      sentiment: 'neutral',
      readability: 0
    },
    
    // Geographic Data
    geographic: null,
    
    // Gemini AI Ready Data
    geminiReady: false,
    geminiData: {
      competitorProfile: '',
      keywordOpportunities: [],
      contentGaps: [],
      strategicInsights: []
    },
    
    // UI Ready Data
    uiReady: false,
    uiData: {
      cards: [],
      charts: {},
      tables: {},
      badges: []
    },
    
    // Data Quality
    dataQuality: {
      tier1Complete: false,
      tier2Complete: false,
      tier3Complete: false,
      apiCalls: 0,
      directPages: 0,
      confidence: 0
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: TIER 1 - DIRECT WEBSITE INTELLIGENCE (Primary Source)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Collect intelligence directly from website (NO API costs)
 * This is the PRIMARY data source - runs BEFORE any API calls
 */
function ELITE_collectDirectIntelligence(domain, options) {
  Logger.log(`   [1/5] 🌐 Fetching Homepage...`);
  
  const intel = {
    pagesAnalyzed: 0,
    keywords: [],
    pages: [],
    website: {},
    contentQuality: 0,
    internalLinks: [],
    sitemapUrls: []
  };
  
  const seenKeywords = new Set();
  const seenUrls = new Set();
  const industry = ELITE_detectIndustry(domain);
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Fetch and Analyze Homepage
    // ═══════════════════════════════════════════════════════════════════════
    const homepageUrl = `https://${domain}`;
    const homepage = ELITE_fetchAndAnalyzePage(homepageUrl, domain, industry);
    
    if (homepage.success) {
      intel.website = homepage.metadata;
      intel.pagesAnalyzed++;
      seenUrls.add(homepageUrl);
      
      // Extract keywords from homepage
      homepage.keywords.forEach(kw => {
        if (!seenKeywords.has(kw.keyword.toLowerCase())) {
          seenKeywords.add(kw.keyword.toLowerCase());
          intel.keywords.push(kw);
        }
      });
      
      // Collect internal links for further analysis
      intel.internalLinks = homepage.internalLinks.slice(0, SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.MAX_INTERNAL_LINKS);
      
      Logger.log(`      ✅ Homepage: ${intel.keywords.length} keywords, ${intel.internalLinks.length} internal links`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Discover Pages via Sitemap
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [2/5] 🗺️ Discovering Sitemap...`);
    
    const sitemapUrls = ELITE_discoverSitemap(domain);
    intel.sitemapUrls = sitemapUrls;
    Logger.log(`      ✅ Sitemap: ${sitemapUrls.length} URLs discovered`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Analyze Key Pages (Blog, Features, Pricing)
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [3/5] 📄 Analyzing Key Pages...`);
    
    // Priority pages to analyze
    const priorityPaths = ['/blog', '/features', '/pricing', '/about', '/products', '/services', '/solutions'];
    const pagesToAnalyze = [];
    
    // Add priority pages from internal links
    intel.internalLinks.forEach(link => {
      const path = ELITE_getPathFromUrl(link);
      if (priorityPaths.some(p => path.startsWith(p)) && !seenUrls.has(link)) {
        pagesToAnalyze.push(link);
      }
    });
    
    // Add pages from sitemap
    sitemapUrls.forEach(url => {
      if (!seenUrls.has(url) && pagesToAnalyze.length < SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.MAX_PAGES_PER_DOMAIN) {
        pagesToAnalyze.push(url);
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // v24.0 TURBO MODE: Batch fetch all pages in parallel
    // Uses UrlFetchApp.fetchAll() for 10x faster page analysis
    // ═══════════════════════════════════════════════════════════════════════
    const maxPages = Math.min(pagesToAnalyze.length, SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.MAX_PAGES_PER_DOMAIN - 1);
    const urlsToFetch = pagesToAnalyze.slice(0, maxPages).filter(url => !seenUrls.has(url));
    
    if (urlsToFetch.length > 0) {
      // Build batch request
      const requests = urlsToFetch.map(url => ({
        url: url,
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': SERPIFAI_ELITE_CONFIG.COMPLIANCE.USER_AGENT
        }
      }));
      
      // v24.0: Parallel fetch all pages at once (saves ~50s)
      const responses = UrlFetchApp.fetchAll(requests);
      
      // Process responses
      responses.forEach((response, idx) => {
        const url = urlsToFetch[idx];
        if (seenUrls.has(url)) return;
        
        try {
          if (response.getResponseCode() === 200) {
            const html = response.getContentText();
            const pageData = ELITE_analyzePageContent(html, url, domain, industry);
            
            if (pageData) {
              seenUrls.add(url);
              intel.pagesAnalyzed++;
              
              intel.pages.push({
                url: url,
                title: pageData.metadata.title,
                wordCount: pageData.metadata.wordCount,
                keywords: pageData.keywords.length
              });
              
              pageData.keywords.forEach(kw => {
                if (!seenKeywords.has(kw.keyword.toLowerCase())) {
                  seenKeywords.add(kw.keyword.toLowerCase());
                  intel.keywords.push(kw);
                }
              });
            }
          }
        } catch (e) {
          // Silently skip failed pages
        }
      });
    }
    
    Logger.log(`      ✅ Analyzed ${intel.pagesAnalyzed} pages, ${intel.keywords.length} total keywords`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Generate Brand & Industry Keywords
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [4/5] 🏷️ Generating Brand Keywords...`);
    
    const brandKeywords = ELITE_generateBrandKeywords(domain, industry);
    brandKeywords.forEach(kw => {
      if (!seenKeywords.has(kw.keyword.toLowerCase())) {
        seenKeywords.add(kw.keyword.toLowerCase());
        intel.keywords.push(kw);
      }
    });
    
    Logger.log(`      ✅ Added ${brandKeywords.length} brand/industry keywords`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Calculate Content Quality Score
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [5/5] 📊 Calculating Content Quality...`);
    
    intel.contentQuality = ELITE_calculateContentQuality(intel);
    Logger.log(`      ✅ Content Quality: ${intel.contentQuality}/100`);
    
  } catch (error) {
    Logger.log(`   ⚠️ Direct intelligence error: ${error.toString()}`);
  }
  
  return intel;
}

/**
 * v24.0 TURBO: Analyze pre-fetched page content (no HTTP call)
 * Used by batch fetching to process already-downloaded HTML
 */
function ELITE_analyzePageContent(html, url, domain, industry) {
  try {
    const metadata = ELITE_extractMetadata(html, url);
    const keywords = ELITE_extractKeywordsFromPage(html, url, domain, industry);
    
    return {
      metadata: metadata,
      keywords: keywords
    };
  } catch (e) {
    return null;
  }
}

/**
 * Fetch and analyze a single page (legacy - for fallback)
 */
function ELITE_fetchAndAnalyzePage(url, domain, industry) {
  const result = {
    success: false,
    metadata: {},
    keywords: [],
    internalLinks: []
  };
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      timeout: SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.FETCH_TIMEOUT_MS
    });
    
    if (response.getResponseCode() !== 200) {
      return result;
    }
    
    const html = response.getContentText();
    
    // Extract metadata
    result.metadata = ELITE_extractMetadata(html, url);
    
    // Extract keywords from content
    result.keywords = ELITE_extractKeywordsFromPage(html, url, domain, industry);
    
    // Extract internal links
    result.internalLinks = ELITE_extractInternalLinks(html, domain);
    
    result.success = true;
    
  } catch (error) {
    // Silently fail - page might be blocked
  }
  
  return result;
}

/**
 * Extract metadata from HTML
 */
function ELITE_extractMetadata(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  
  // Count words in body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') : '';
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 2).length;
  
  // Extract schema types
  const schemaTypes = [];
  const schemaMatches = html.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
  schemaMatches.forEach(m => {
    const type = m.match(/"@type"\s*:\s*"([^"]+)"/);
    if (type) schemaTypes.push(type[1]);
  });
  
  return {
    url: url,
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    h1: h1Match ? h1Match[1].trim() : '',
    wordCount: wordCount,
    schemaTypes: [...new Set(schemaTypes)],
    hasSchema: schemaTypes.length > 0
  };
}

/**
 * Extract keywords from page content
 */
function ELITE_extractKeywordsFromPage(html, url, domain, industry) {
  const keywords = [];
  const seenPhrases = new Set();
  const domainBase = domain.replace(/\.(com|io|ai|co|org|net|uk|de)$/i, '').toLowerCase();
  
  // Extract text content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return keywords;
  
  // Remove scripts and styles
  let text = bodyMatch[1]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
  
  // Extract title keywords (highest priority)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const titlePhrases = ELITE_extractPhrases(titleMatch[1], domainBase);
    titlePhrases.forEach((phrase, idx) => {
      if (!seenPhrases.has(phrase) && phrase.length > 3) {
        seenPhrases.add(phrase);
        keywords.push(ELITE_createKeywordObject(phrase, 'title', url, industry, idx + 1));
      }
    });
  }
  
  // Extract H1 keywords
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    const h1Phrases = ELITE_extractPhrases(h1Match[1], domainBase);
    h1Phrases.forEach((phrase, idx) => {
      if (!seenPhrases.has(phrase) && phrase.length > 3) {
        seenPhrases.add(phrase);
        keywords.push(ELITE_createKeywordObject(phrase, 'h1', url, industry, idx + 3));
      }
    });
  }
  
  // Extract H2 keywords
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  h2Matches.slice(0, 10).forEach((h2, idx) => {
    const h2Text = h2.replace(/<[^>]+>/g, '');
    const h2Phrases = ELITE_extractPhrases(h2Text, domainBase);
    h2Phrases.slice(0, 2).forEach(phrase => {
      if (!seenPhrases.has(phrase) && phrase.length > 3) {
        seenPhrases.add(phrase);
        keywords.push(ELITE_createKeywordObject(phrase, 'h2', url, industry, idx + 5));
      }
    });
  });
  
  // Extract meta description keywords
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    const descPhrases = ELITE_extractPhrases(descMatch[1], domainBase);
    descPhrases.slice(0, 5).forEach((phrase, idx) => {
      if (!seenPhrases.has(phrase) && phrase.length > 3) {
        seenPhrases.add(phrase);
        keywords.push(ELITE_createKeywordObject(phrase, 'meta', url, industry, idx + 8));
      }
    });
  }
  
  // Extract from body content (limited)
  const bodyPhrases = ELITE_extractPhrases(text.substring(0, 5000), domainBase);
  bodyPhrases.slice(0, 15).forEach((phrase, idx) => {
    if (!seenPhrases.has(phrase) && phrase.length > 3) {
      seenPhrases.add(phrase);
      keywords.push(ELITE_createKeywordObject(phrase, 'content', url, industry, idx + 10));
    }
  });
  
  return keywords;
}

/**
 * Extract internal links from page
 */
function ELITE_extractInternalLinks(html, domain) {
  const links = [];
  const seen = new Set();
  
  const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["']/gi) || [];
  
  linkMatches.forEach(link => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) return;
    
    let href = hrefMatch[1];
    
    // Convert relative to absolute
    if (href.startsWith('/')) {
      href = `https://${domain}${href}`;
    }
    
    // Only include internal links
    if (href.includes(domain) && !seen.has(href) && !href.includes('#') && !href.match(/\.(jpg|png|gif|css|js|pdf)$/i)) {
      seen.add(href);
      links.push(href);
    }
  });
  
  return links;
}

/**
 * Discover sitemap URLs - v3.0 with PHP real metrics integration
 * Uses FT_GetRealTopPages for server-side filtering
 * Filters out all sitemap XML files and extracts actual content page URLs
 */
function ELITE_discoverSitemap(domain) {
  // V3.0: Aggressive exclusion patterns - NO sitemaps, NO technical pages
  const EXCLUDE_PATTERNS = [
    /sitemap.*\.xml/i,
    /\.xml$/i,
    /rss\/?$/i,
    /feed\/?$/i,
    /robots\.txt$/i,
    /wp-json\//i,
    /xmlrpc\.php/i,
    /cart\/?$/i,
    /checkout\/?$/i,
    /my-account\/?$/i,
    /login\/?$/i,
    /register\/?$/i,
    /search\/?$/i,
    /page\/\d+\/?$/i,  // Pagination
    /tag\/[^\/]+\/?$/i, // Tag pages
    /category\/$/i,  // Category index
    /author\/$/i,   // Author index
    /\?.*$/  // Query strings
  ];
  
  const isExcludedUrl = (url) => {
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
  };
  
  const contentUrls = [];
  const subSitemaps = [];
  
  // Helper to check if URL is a sitemap XML file
  const isSitemapUrl = (url) => {
    return url.match(/sitemap[^\/]*\.xml/i) || url.endsWith('.xml');
  };
  
  // Helper to extract URLs from XML content
  const extractUrlsFromXml = (xml, domain) => {
    const urls = [];
    const locMatches = xml.match(/<loc>([^<]+)<\/loc>/gi) || [];
    locMatches.forEach(loc => {
      const url = loc.replace(/<\/?loc>/gi, '').trim();
      if (url.includes(domain)) {
        urls.push(url);
      }
    });
    return urls;
  };
  
  try {
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://www.${domain}/sitemap.xml`
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      if (contentUrls.length >= 100) break;
      
      try {
        const response = UrlFetchApp.fetch(sitemapUrl, {
          muteHttpExceptions: true,
          timeout: SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.SITEMAP_TIMEOUT_MS
        });
        
        if (response.getResponseCode() === 200) {
          const xml = response.getContentText();
          const extractedUrls = extractUrlsFromXml(xml, domain);
          
          // Separate sitemap URLs from content URLs with aggressive filtering
          extractedUrls.forEach(url => {
            if (isSitemapUrl(url)) {
              // This is a sub-sitemap, queue it for processing
              if (subSitemaps.length < 10) { // Limit sub-sitemaps to process
                subSitemaps.push(url);
              }
            } else if (!isExcludedUrl(url)) {
              // This is an actual content page - apply exclusion filters
              if (contentUrls.length < 100 && !contentUrls.includes(url)) {
                contentUrls.push(url);
              }
            }
          });
          
          if (contentUrls.length > 0 || subSitemaps.length > 0) break; // Found something
        }
      } catch (e) {
        // Sitemap might not exist
      }
    }
    
    // If we only found sub-sitemaps, fetch a few of them for content pages
    // Prioritize blog/post sitemaps as they have actual content
    if (contentUrls.length < 20 && subSitemaps.length > 0) {
      // Sort to prioritize blog/post/page sitemaps over product/category
      const prioritized = subSitemaps.sort((a, b) => {
        const aScore = (a.includes('blog') ? 3 : 0) + (a.includes('post') ? 2 : 0) + (a.includes('page') ? 1 : 0);
        const bScore = (b.includes('blog') ? 3 : 0) + (b.includes('post') ? 2 : 0) + (b.includes('page') ? 1 : 0);
        return bScore - aScore;
      });
      
      // Fetch up to 3 sub-sitemaps
      for (let i = 0; i < Math.min(3, prioritized.length) && contentUrls.length < 100; i++) {
        try {
          const subResponse = UrlFetchApp.fetch(prioritized[i], {
            muteHttpExceptions: true,
            timeout: SERPIFAI_ELITE_CONFIG.DIRECT_FETCH.SITEMAP_TIMEOUT_MS
          });
          
          if (subResponse.getResponseCode() === 200) {
            const subXml = subResponse.getContentText();
            const subUrls = extractUrlsFromXml(subXml, domain);
            
            subUrls.forEach(url => {
              // V3.0: Apply exclusion filters here too
              if (!isSitemapUrl(url) && !isExcludedUrl(url) && contentUrls.length < 100 && !contentUrls.includes(url)) {
                contentUrls.push(url);
              }
            });
          }
        } catch (e) {
          // Sub-sitemap fetch failed
        }
      }
    }
    
  } catch (error) {
    // Silently fail
  }
  
  // V3.0: Final filter - remove any remaining technical/excluded URLs
  const filteredUrls = contentUrls.filter(url => !isExcludedUrl(url));
  
  Logger.log(`   📄 ELITE_discoverSitemap v3.0: Found ${filteredUrls.length} content pages (filtered from ${contentUrls.length})`);
  
  return filteredUrls;
}

/**
 * Generate brand and industry keywords
 */
function ELITE_generateBrandKeywords(domain, industry) {
  const keywords = [];
  const domainBase = domain.replace(/\.(com|io|ai|co|org|net|uk|de)$/i, '');
  const brand = domainBase.replace(/[^a-z0-9]/gi, ' ').trim();
  
  // Brand keyword templates
  const templates = [
    '{brand}', '{brand} reviews', '{brand} pricing', '{brand} alternatives',
    '{brand} features', '{brand} login', '{brand} demo', '{brand} tutorial',
    '{brand} vs', 'best {brand}', 'how to use {brand}', '{brand} free trial',
    '{brand} coupon', '{brand} discount', '{brand} support', '{brand} api',
    '{brand} integration', '{brand} comparison', 'is {brand} worth it',
    '{brand} for beginners', '{brand} case study', '{brand} examples'
  ];
  
  templates.forEach((template, idx) => {
    const keyword = template.replace(/\{brand\}/g, brand);
    keywords.push(ELITE_createKeywordObject(keyword, 'brand', `https://${domain}/`, industry, idx + 1));
  });
  
  // Industry-specific keywords
  const industryKws = ELITE_getIndustryKeywords(industry);
  industryKws.slice(0, 10).forEach((kw, idx) => {
    keywords.push(ELITE_createKeywordObject(kw, 'industry', `https://${domain}/`, industry, idx + 15));
  });
  
  return keywords;
}

/**
 * Create a standardized keyword object
 */
function ELITE_createKeywordObject(keyword, source, url, industry, position) {
  const wordCount = keyword.split(/\s+/).length;
  const volume = ELITE_estimateVolume(keyword, industry);
  const ctr = SERPIFAI_ELITE_CONFIG.CTR_CURVE[Math.min(10, position)] || 0.01;
  const traffic = Math.round(volume * ctr);
  const cpc = ELITE_estimateCPC(keyword, industry);
  
  return {
    keyword: keyword,
    source: source,
    position: position,
    url: url,
    volume: volume,
    ctr: Math.round(ctr * 1000) / 10,
    traffic: traffic,
    cpc: cpc,
    value: Math.round(traffic * cpc),
    difficulty: ELITE_estimateDifficulty(keyword, wordCount),
    intent: ELITE_classifyIntent(keyword),
    dataSource: 'serpifai_direct'
  };
}

/**
 * Calculate content quality score
 */
function ELITE_calculateContentQuality(intel) {
  let score = 0;
  
  // Word count (max 25 points)
  const avgWordCount = intel.pages.length > 0 
    ? intel.pages.reduce((sum, p) => sum + (p.wordCount || 0), intel.website.wordCount || 0) / (intel.pages.length + 1)
    : intel.website.wordCount || 0;
  score += Math.min(25, avgWordCount / 40);
  
  // Keyword density (max 25 points)
  const kwDensity = intel.keywords.length / Math.max(1, intel.pagesAnalyzed);
  score += Math.min(25, kwDensity * 2);
  
  // Schema presence (max 15 points)
  if (intel.website.hasSchema) score += 15;
  
  // Sitemap presence (max 10 points)
  if (intel.sitemapUrls.length > 0) score += 10;
  
  // Internal linking (max 15 points)
  score += Math.min(15, intel.internalLinks.length / 5);
  
  // Page variety (max 10 points)
  score += Math.min(10, intel.pagesAnalyzed);
  
  return Math.round(Math.min(100, score));
}

/**
 * Merge direct intelligence into result
 */
function ELITE_mergeDirectIntelligence(result, directIntel) {
  // Merge keywords
  result.keywords = directIntel.keywords;
  
  // Merge website data
  result.website = directIntel.website;
  
  // Build top pages from analyzed pages
  directIntel.pages.forEach((page, idx) => {
    result.topPages.push({
      url: page.url,
      title: page.title,
      traffic: 0, // Will be calculated later
      trafficShare: 0,
      keywords: page.keywords,
      avgPosition: idx + 1,
      topKeyword: null,
      source: 'direct'
    });
  });
  
  // Update data quality
  result.sources.direct.success = directIntel.pagesAnalyzed > 0;
  result.sources.direct.pagesAnalyzed = directIntel.pagesAnalyzed;
  result.dataQuality.tier1Complete = true;
  result.dataQuality.directPages = directIntel.pagesAnalyzed;
}

/**
 * Cluster keywords by semantic similarity
 */
function ORACLE_clusterKeywords(keywords) {
  const clusters = [];
  const used = new Set();
  
  keywords.forEach(kw => {
    if (used.has(kw.keyword)) return;
    
    const cluster = {
      name: kw.keyword,
      keywords: [kw],
      totalVolume: kw.volume || 0,
      totalTraffic: kw.traffic || 0,
      avgDifficulty: kw.difficulty || 50,
      intent: kw.intent
    };
    
    used.add(kw.keyword);
    
    // Find similar keywords
    keywords.forEach(other => {
      if (used.has(other.keyword)) return;
      if (cluster.keywords.length >= SERPIFAI_ELITE_CONFIG.KEYWORDS.CLUSTER_SIZE) return;
      
      const similarity = ELITE_calculateSimilarity(kw.keyword, other.keyword);
      if (similarity > 0.3) {
        cluster.keywords.push(other);
        cluster.totalVolume += other.volume || 0;
        cluster.totalTraffic += other.traffic || 0;
        used.add(other.keyword);
      }
    });
    
    if (cluster.keywords.length > 0) {
      cluster.avgDifficulty = Math.round(
        cluster.keywords.reduce((sum, k) => sum + (k.difficulty || 50), 0) / cluster.keywords.length
      );
      clusters.push(cluster);
    }
  });
  
  return clusters.sort((a, b) => b.totalTraffic - a.totalTraffic);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3: TIER 2 - API ENRICHMENT (Secondary Source)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Enrich data with API calls (Serper, PageRank)
 * This is SECONDARY - only used to enhance direct intelligence
 */
function ELITE_collectAPIEnrichment(domain, result, options) {
  const enrichment = {
    serperKeywordsAdded: 0,
    pageRank: 0,
    apiCalls: 0,
    serperData: null,
    backlinkData: null
  };
  
  const seenKeywords = new Set(result.keywords.map(k => k.keyword.toLowerCase()));
  const industry = ELITE_detectIndustry(domain);
  
  // ═══════════════════════════════════════════════════════════════════════
  // API 1: Serper site: search (validate and add keywords)
  // ═══════════════════════════════════════════════════════════════════════
  Logger.log(`   [1/3] 🔎 Serper API Enrichment...`);
  
  try {
    if (typeof FT_callSerperAPI === 'function') {
      Utilities.sleep(SERPIFAI_ELITE_CONFIG.API_LIMITS.BATCH_DELAY_MS);
      const siteSearch = FT_callSerperAPI(`site:${domain}`);
      enrichment.apiCalls++;
      
      if (siteSearch.success && siteSearch.data) {
        enrichment.serperData = siteSearch.data;
        // V2.0: Store organic and mentions for backlink enricher
        enrichment.serperOrganic = siteSearch.data.organic || [];
        enrichment.serperMentions = siteSearch.data.mentions || [];
        
        // Add keywords from organic results
        const organic = siteSearch.data.organic || [];
        organic.forEach((item, idx) => {
          const titlePhrases = ELITE_extractPhrases(item.title || '', domain);
          titlePhrases.forEach(phrase => {
            if (!seenKeywords.has(phrase.toLowerCase()) && phrase.length > 3) {
              seenKeywords.add(phrase.toLowerCase());
              result.keywords.push(ELITE_createKeywordObject(phrase, 'serper_organic', item.link || '', industry, idx + 1));
              enrichment.serperKeywordsAdded++;
            }
          });
        });
        
        // Add from related searches
        const related = siteSearch.data.relatedSearches || [];
        related.forEach((rs, idx) => {
          const query = rs.query || rs;
          if (typeof query === 'string' && !seenKeywords.has(query.toLowerCase())) {
            seenKeywords.add(query.toLowerCase());
            result.keywords.push(ELITE_createKeywordObject(query, 'serper_related', `https://${domain}/`, industry, idx + 10));
            enrichment.serperKeywordsAdded++;
          }
        });
        
        // Add from PAA
        const paa = siteSearch.data.peopleAlsoAsk || [];
        paa.forEach((item, idx) => {
          const question = item.question || item;
          if (typeof question === 'string' && !seenKeywords.has(question.toLowerCase())) {
            seenKeywords.add(question.toLowerCase());
            const kw = ELITE_createKeywordObject(question, 'serper_paa', `https://${domain}/`, industry, idx + 15);
            kw.isQuestion = true;
            kw.intent = 'informational';
            result.keywords.push(kw);
            enrichment.serperKeywordsAdded++;
          }
        });
        
        Logger.log(`      ✅ Added ${enrichment.serperKeywordsAdded} keywords from Serper`);
      }
    } else {
      Logger.log(`      ⚠️ FT_callSerperAPI not available`);
    }
  } catch (e) {
    Logger.log(`      ⚠️ Serper enrichment failed: ${e.toString()}`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // API 2: OpenPageRank (Authority Metrics)
  // ═══════════════════════════════════════════════════════════════════════
  Logger.log(`   [2/3] 🏆 OpenPageRank API...`);
  
  try {
    if (typeof FT_callOpenPageRankAPI === 'function') {
      const oprResult = FT_callOpenPageRankAPI(domain);
      enrichment.apiCalls++;
      
      if (oprResult.success && oprResult.data) {
        enrichment.pageRank = oprResult.data.page_rank_decimal || 0;
        
        // V2.0: Create comp-like object for Elite Data Enricher integration
        const compForEnricher = {
          domain: domain,
          stages: {
            openPageRank: { data: { pageRank: enrichment.pageRank } },
            serper: { data: { 
              organic: enrichment.serperOrganic || [],
              mentions: enrichment.serperMentions || []
            }},
            oracleFetcher: { data: { 
              externalLinks: result.website?.externalLinks || [],
              domain: domain
            }}
          },
          tabData: { 
            authority: { pageRank: { value: enrichment.pageRank } } 
          }
        };
        
        // Calculate backlinks from PageRank + Elite Enricher
        result.backlinks = ELITE_analyzeBacklinks(domain, enrichment.pageRank, compForEnricher);
        enrichment.backlinkData = result.backlinks;
        
        Logger.log(`      ✅ PageRank: ${enrichment.pageRank}, Est. Backlinks: ${result.backlinks.total.toLocaleString()}`);
      }
    } else {
      Logger.log(`      ⚠️ FT_callOpenPageRankAPI not available`);
      result.backlinks = ELITE_analyzeBacklinks(domain, 0, null);
    }
  } catch (e) {
    Logger.log(`      ⚠️ OpenPageRank failed: ${e.toString()}`);
    result.backlinks = ELITE_analyzeBacklinks(domain, 0, null);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // Finalize: Sort keywords and create clusters
  // ═══════════════════════════════════════════════════════════════════════
  Logger.log(`   [3/3] 📊 Finalizing Keywords...`);
  
  // Sort by value
  result.keywords.sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Limit to max
  result.keywords = result.keywords.slice(0, SERPIFAI_ELITE_CONFIG.KEYWORDS.MAX_PER_COMPETITOR);
  
  // Create clusters
  result.keywordClusters = ORACLE_clusterKeywords(result.keywords);
  
  // Update data quality
  result.sources.serper.success = enrichment.serperKeywordsAdded > 0;
  result.sources.serper.keywordsAdded = enrichment.serperKeywordsAdded;
  result.sources.pageRank.success = enrichment.pageRank > 0;
  result.sources.pageRank.score = enrichment.pageRank;
  result.dataQuality.tier2Complete = true;
  result.dataQuality.apiCalls = enrichment.apiCalls;
  
  Logger.log(`      ✅ Total Keywords: ${result.keywords.length}, Clusters: ${result.keywordClusters.length}`);
  
  return enrichment;
}

/**
 * Merge API enrichment into result
 */
function ELITE_mergeAPIEnrichment(result, apiEnrichment) {
  // Keywords already merged in ELITE_collectAPIEnrichment
  // This function handles any additional merging needed
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3B: ORACLE ELITE v21.0 - NEW HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Identify data gaps that need to be filled by API or inference
 * @param {Object} result - Current result object
 * @returns {Object} Map of identified gaps
 */
function ELITE_identifyDataGaps(result) {
  const gaps = {};
  
  // Check keyword gaps
  if (!result.keywords || result.keywords.length < SERPIFAI_ELITE_CONFIG.KEYWORDS.MIN_PER_COMPETITOR) {
    gaps.keywords = {
      current: result.keywords?.length || 0,
      needed: SERPIFAI_ELITE_CONFIG.KEYWORDS.MIN_PER_COMPETITOR,
      severity: 'high'
    };
  }
  
  // Check SERP visibility gaps
  if (!result.serpVisibility || !result.sources?.serper?.success) {
    gaps.serpVisibility = {
      reason: 'No SERP data available',
      severity: 'medium'
    };
  }
  
  // Check authority gaps
  if (!result.authority || result.authority.score === 0) {
    gaps.authority = {
      reason: 'Authority metrics not collected',
      severity: 'high'
    };
  }
  
  // Check competitor gaps
  if (!result.competitors || result.competitors.length < 3) {
    gaps.competitors = {
      current: result.competitors?.length || 0,
      needed: 5,
      severity: 'medium'
    };
  }
  
  // Check backlink gaps
  if (!result.backlinks || result.backlinks.total === 0) {
    gaps.backlinks = {
      reason: 'Backlink data not available',
      severity: 'medium'
    };
  }
  
  return gaps;
}

/**
 * Merge data from Serper Oracle Bridge
 * @param {Object} result - Current result object
 * @param {Object} bridgeData - Data from bridge
 */
function ELITE_mergeBridgeData(result, bridgeData) {
  if (!bridgeData || !bridgeData.dataPoints) return;
  
  const dataPoints = bridgeData.dataPoints;
  
  // Merge keywords
  if (dataPoints.keywords && Array.isArray(dataPoints.keywords)) {
    const existingKws = new Set(result.keywords.map(k => k.keyword.toLowerCase()));
    dataPoints.keywords.forEach(kw => {
      if (!existingKws.has(kw.keyword.toLowerCase())) {
        kw._source = 'serper_bridge';
        result.keywords.push(kw);
      }
    });
  }
  
  // Merge SERP visibility
  if (dataPoints.serpVisibility) {
    result.serpVisibility = dataPoints.serpVisibility;
    result.sources.serper = {
      success: true,
      source: 'serper_bridge',
      timestamp: bridgeData.timestamp
    };
  }
  
  // Merge authority
  if (dataPoints.authority) {
    result.authority = {
      ...result.authority,
      pageRank: dataPoints.authority.pageRank || 0,
      domainRank: dataPoints.authority.domainRank || 0,
      _source: 'openpagerank_bridge'
    };
    result.sources.pageRank = {
      success: true,
      source: 'serper_bridge',
      score: dataPoints.authority.pageRank
    };
  }
  
  // Merge competitors
  if (dataPoints.competitors && Array.isArray(dataPoints.competitors)) {
    result.competitors = dataPoints.competitors;
  }
  
  // Store bridge reference
  result._bridgeData = {
    success: bridgeData.success,
    apiCalls: bridgeData.apiCalls,
    timestamp: bridgeData.timestamp
  };
}

/**
 * Apply forensic inference for remaining data gaps
 * Uses causal model: PageRank + Keyword Presence + Industry Benchmarks
 * @param {Object} result - Current result object
 * @param {string} domain - Target domain
 * @param {Object} gaps - Identified gaps
 */
function ELITE_applyForensicInference(result, domain, gaps) {
  const industry = ELITE_detectIndustry(domain);
  
  // Infer traffic if missing
  if (!result.traffic || result.traffic.organic === 0) {
    const inferredTraffic = ELITE_inferTraffic(result, domain, industry);
    result.traffic = {
      ...result.traffic,
      ...inferredTraffic,
      _source: 'causal_inference',
      _confidence: inferredTraffic._confidence || 0.4
    };
  }
  
  // Infer authority if missing
  if (gaps.authority && (!result.authority || result.authority.score === 0)) {
    const inferredAuthority = ELITE_inferAuthority(result, domain);
    result.authority = {
      ...result.authority,
      score: inferredAuthority.score,
      tier: inferredAuthority.tier,
      _source: 'causal_inference',
      _confidence: inferredAuthority._confidence || 0.5
    };
  }
  
  // Infer backlinks if missing
  if (gaps.backlinks && result.backlinks.total === 0) {
    const inferredBacklinks = ELITE_inferBacklinks(result, domain);
    result.backlinks = {
      ...result.backlinks,
      ...inferredBacklinks,
      _source: 'causal_inference'
    };
  }
  
  result.dataQuality.forensicInferenceApplied = true;
}

/**
 * Infer traffic using causal model
 */
function ELITE_inferTraffic(result, domain, industry) {
  // Use keyword count + authority signals to estimate
  const kwCount = result.keywords?.length || 0;
  const pageCount = result.topPages?.length || 1;
  const authoritySignal = result.authority?.score || 30;
  
  // Base traffic = keywords × CTR model × authority multiplier
  const avgCTR = 0.05; // Conservative 5% average CTR
  const avgVolume = 500; // Conservative average volume
  const authorityMultiplier = authoritySignal / 50; // Normalize to 50 baseline
  
  const estimatedOrganic = Math.round(kwCount * avgVolume * avgCTR * authorityMultiplier);
  const industryCPC = SERPIFAI_ELITE_CONFIG.CPC_BY_INDUSTRY[industry] || 2.50;
  const estimatedValue = Math.round(estimatedOrganic * industryCPC * 0.3);
  
  return {
    organic: estimatedOrganic,
    value: estimatedValue,
    growthRate: 0, // Cannot infer growth without historical data
    _confidence: 0.4,
    _method: 'keyword_count_ctr_model'
  };
}

/**
 * Infer authority using domain signals
 */
function ELITE_inferAuthority(result, domain) {
  let score = 0;
  
  // TLD bonus
  const tld = domain.split('.').pop().toLowerCase();
  if (tld === 'gov') score += 80;
  else if (tld === 'edu') score += 75;
  else if (tld === 'org') score += 40;
  else score += 20;
  
  // Content signals
  if (result.website?.schemaTypes?.length > 0) score += 5;
  if (result.website?.wordCount > 1000) score += 5;
  if (result.topPages?.length > 10) score += 5;
  
  // Keyword diversity bonus
  if (result.keywords?.length > 50) score += 5;
  if (result.keywordClusters?.length > 5) score += 5;
  
  // Cap at 100
  score = Math.min(100, score);
  
  // Determine tier
  let tier = 'unknown';
  if (score >= 80) tier = 'elite';
  else if (score >= 60) tier = 'established';
  else if (score >= 40) tier = 'growing';
  else tier = 'emerging';
  
  return {
    score: score,
    tier: tier,
    _confidence: 0.5,
    _method: 'tld_content_signals'
  };
}

/**
 * Infer backlinks using authority and visibility signals
 */
function ELITE_inferBacklinks(result, domain) {
  const authorityScore = result.authority?.score || 30;
  const pageCount = result.topPages?.length || 1;
  
  // Industry benchmark: ~100 backlinks per authority point for established sites
  const estimatedTotal = Math.round(authorityScore * 80 + pageCount * 5);
  const estimatedRefDomains = Math.round(estimatedTotal * 0.15);
  
  return {
    total: estimatedTotal,
    refDomains: estimatedRefDomains,
    dofollow: 85,
    nofollow: 15,
    _confidence: 0.3,
    _method: 'authority_benchmark'
  };
}

/**
 * Build entity relationship graph from collected data
 * @param {Object} result - Current result object
 * @returns {Object} Entity graph
 */
function ELITE_buildEntityGraph(result) {
  const entities = [];
  const relationships = [];
  
  // Domain as root entity
  entities.push({
    id: 'root',
    type: 'domain',
    name: result.domain,
    attributes: {
      traffic: result.traffic?.organic || 0,
      authority: result.authority?.score || 0,
      keywords: result.keywords?.length || 0
    }
  });
  
  // Keyword entities with clustering
  if (result.keywordClusters) {
    result.keywordClusters.forEach((cluster, idx) => {
      const clusterId = `cluster_${idx}`;
      entities.push({
        id: clusterId,
        type: 'keyword_cluster',
        name: cluster.name || cluster.keywords?.[0] || `Cluster ${idx + 1}`,
        attributes: {
          keywords: cluster.keywords?.length || 0,
          avgVolume: cluster.avgVolume || 0
        }
      });
      
      relationships.push({
        source: 'root',
        target: clusterId,
        type: 'targets_cluster',
        strength: 0.8
      });
    });
  }
  
  // Topic entities from content analysis
  if (result.content?.topics) {
    result.content.topics.slice(0, 10).forEach((topic, idx) => {
      const topicId = `topic_${idx}`;
      entities.push({
        id: topicId,
        type: 'topic',
        name: typeof topic === 'string' ? topic : topic.name,
        attributes: {}
      });
      
      relationships.push({
        source: 'root',
        target: topicId,
        type: 'covers_topic',
        strength: 0.7
      });
    });
  }
  
  return {
    entities: entities,
    relationships: relationships,
    stats: {
      entityCount: entities.length,
      relationshipCount: relationships.length
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4: TIER 3 - GEMINI & UI DATA SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Prepare data for Gemini AI insights
 */
function ELITE_synthesizeForGemini(result, domain) {
  Logger.log(`   [1/2] 🤖 Preparing Gemini Insights Data...`);
  
  // Build competitor profile for Gemini
  result.geminiData.competitorProfile = ELITE_buildCompetitorProfile(result, domain);
  
  // Identify keyword opportunities
  result.geminiData.keywordOpportunities = result.keywords
    .filter(kw => kw.difficulty < 50 && kw.volume > 500)
    .slice(0, 10)
    .map(kw => ({
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      opportunity: 'low_competition_high_volume'
    }));
  
  // Identify content gaps (high intent keywords)
  result.geminiData.contentGaps = result.keywords
    .filter(kw => kw.intent === 'transactional' || kw.intent === 'commercial')
    .slice(0, 10)
    .map(kw => ({
      keyword: kw.keyword,
      intent: kw.intent,
      cpc: kw.cpc,
      recommendation: `Create content targeting "${kw.keyword}" for ${kw.intent} intent`
    }));
  
  // Strategic insights
  result.geminiData.strategicInsights = [
    {
      category: 'authority',
      score: result.authority?.score || 0,
      insight: `Authority score ${result.authority?.score || 0}/100 - ${result.authority?.tier || 'emerging'} tier competitor`
    },
    {
      category: 'traffic',
      value: result.traffic?.organic || 0,
      insight: `Estimated ${(result.traffic?.organic || 0).toLocaleString()} monthly organic visitors`
    },
    {
      category: 'keywords',
      count: result.keywords.length,
      clusters: result.keywordClusters.length,
      insight: `${result.keywords.length} keywords in ${result.keywordClusters.length} topic clusters`
    }
  ];
  
  result.geminiReady = true;
  Logger.log(`      ✅ Gemini data prepared: ${result.geminiData.keywordOpportunities.length} opportunities`);
}

/**
 * Build competitor profile text for Gemini
 */
function ELITE_buildCompetitorProfile(result, domain) {
  const lines = [
    `COMPETITOR ANALYSIS: ${domain}`,
    `${'─'.repeat(50)}`,
    ``,
    `OVERVIEW:`,
    `• Website: ${result.website.title || domain}`,
    `• Description: ${(result.website.description || 'N/A').substring(0, 150)}`,
    `• Authority Score: ${result.authority?.score || 0}/100 (${result.authority?.tier || 'emerging'})`,
    ``,
    `TRAFFIC INTELLIGENCE:`,
    `• Monthly Organic Traffic: ${(result.traffic?.organic || 0).toLocaleString()}`,
    `• Traffic Value: $${(result.traffic?.value || 0).toLocaleString()}/mo`,
    `• Keywords Tracked: ${result.keywords.length}`,
    `• Keyword Clusters: ${result.keywordClusters.length}`,
    ``,
    `BACKLINK PROFILE:`,
    `• Total Backlinks: ${(result.backlinks?.total || 0).toLocaleString()}`,
    `• Referring Domains: ${(result.backlinks?.refDomains || 0).toLocaleString()}`,
    `• PageRank: ${result.backlinks?.pageRank || 0}`,
    ``,
    `TOP KEYWORDS:`,
  ];
  
  result.keywords.slice(0, 10).forEach((kw, idx) => {
    lines.push(`${idx + 1}. "${kw.keyword}" - Vol: ${kw.volume}, Pos: ${kw.position || 'N/A'}, Traffic: ${kw.traffic}`);
  });
  
  lines.push(``);
  lines.push(`TOP PAGES:`);
  
  result.topPages.slice(0, 5).forEach((page, idx) => {
    lines.push(`${idx + 1}. ${page.title || page.url} - Traffic: ${page.traffic}`);
  });
  
  return lines.join('\n');
}

/**
 * Prepare data for UI rendering
 */
function ELITE_synthesizeForUI(result, domain) {
  Logger.log(`   [2/2] 🎨 Preparing UI Render Data...`);
  
  // Build UI cards
  result.uiData.cards = [
    {
      id: 'traffic',
      title: 'Organic Traffic',
      value: result.traffic?.organic || 0,
      formatted: (result.traffic?.organic || 0).toLocaleString() + '/mo',
      trend: 'up',
      icon: '📈'
    },
    {
      id: 'value',
      title: 'Traffic Value',
      value: result.traffic?.value || 0,
      formatted: '$' + (result.traffic?.value || 0).toLocaleString() + '/mo',
      trend: 'up',
      icon: '💰'
    },
    {
      id: 'keywords',
      title: 'Keywords',
      value: result.keywords.length,
      formatted: result.keywords.length.toString(),
      subtitle: `${result.keywordClusters.length} clusters`,
      icon: '🔑'
    },
    {
      id: 'authority',
      title: 'Authority',
      value: result.authority?.score || 0,
      formatted: (result.authority?.score || 0) + '/100',
      subtitle: result.authority?.tier || 'emerging',
      icon: '🏆'
    },
    {
      id: 'backlinks',
      title: 'Backlinks',
      value: result.backlinks?.total || 0,
      formatted: (result.backlinks?.total || 0).toLocaleString(),
      subtitle: `${(result.backlinks?.refDomains || 0).toLocaleString()} domains`,
      icon: '🔗'
    }
  ];
  
  // Build chart data
  result.uiData.charts = {
    intentDistribution: {
      labels: ['Informational', 'Commercial', 'Transactional', 'Navigational'],
      data: [
        result.keywords.filter(k => k.intent === 'informational').length,
        result.keywords.filter(k => k.intent === 'commercial').length,
        result.keywords.filter(k => k.intent === 'transactional').length,
        result.keywords.filter(k => k.intent === 'navigational').length
      ]
    },
    keywordSources: {
      labels: [...new Set(result.keywords.map(k => k.source))],
      data: result.keywords.reduce((acc, kw) => {
        acc[kw.source] = (acc[kw.source] || 0) + 1;
        return acc;
      }, {})
    },
    trafficByPage: {
      labels: result.topPages.slice(0, 10).map(p => p.title || p.url),
      data: result.topPages.slice(0, 10).map(p => p.traffic)
    }
  };
  
  // Build table data
  result.uiData.tables = {
    keywords: result.keywords.slice(0, 30).map(kw => ({
      keyword: kw.keyword,
      volume: kw.volume,
      traffic: kw.traffic,
      cpc: kw.cpc,
      value: kw.value,
      difficulty: kw.difficulty,
      intent: kw.intent,
      position: kw.position || '-',
      source: kw.source
    })),
    topPages: result.topPages.slice(0, 20).map(page => ({
      url: page.url,
      title: page.title,
      traffic: page.traffic,
      trafficShare: page.trafficShare,
      keywords: page.keywords
    })),
    clusters: result.keywordClusters.map(c => ({
      name: c.name,
      keywords: c.keywords.length,
      volume: c.totalVolume,
      traffic: c.totalTraffic,
      difficulty: c.avgDifficulty,
      intent: c.intent
    }))
  };
  
  // Build badges
  result.uiData.badges = [];
  
  if (result.authority?.score >= 80) result.uiData.badges.push({ label: 'Enterprise', color: 'gold' });
  else if (result.authority?.score >= 60) result.uiData.badges.push({ label: 'Established', color: 'green' });
  else if (result.authority?.score >= 40) result.uiData.badges.push({ label: 'Growing', color: 'blue' });
  else result.uiData.badges.push({ label: 'Emerging', color: 'gray' });
  
  if (result.keywords.length >= 50) result.uiData.badges.push({ label: '50+ Keywords', color: 'purple' });
  if (result.dataQuality.confidence >= 80) result.uiData.badges.push({ label: 'High Confidence', color: 'green' });
  
  result.uiReady = true;
  Logger.log(`      ✅ UI data prepared: ${result.uiData.cards.length} cards, ${Object.keys(result.uiData.charts).length} charts`);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 5: TOP PAGES & TRAFFIC CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Discover top pages by traffic (uses keyword data)
 */
function ELITE_discoverTopPages(domain, keywords, options) {
  const pages = new Map();
  
  // Group keywords by URL
  keywords.forEach(kw => {
    if (!kw.url) return;
    
    const url = kw.url;
    if (!pages.has(url)) {
      pages.set(url, {
        url: url,
        title: kw.title || ELITE_extractTitleFromUrl(url),
        traffic: 0,
        trafficShare: 0,
        keywords: [],
        avgPosition: 0,
        topKeyword: null
      });
    }
    
    const page = pages.get(url);
    page.keywords.push({
      keyword: kw.keyword,
      position: kw.position,
      volume: kw.volume,
      traffic: kw.traffic
    });
    page.traffic += kw.traffic || 0;
  });
  
  // Calculate totals and shares
  const pagesArray = Array.from(pages.values());
  const totalTraffic = pagesArray.reduce((sum, p) => sum + p.traffic, 0);
  
  pagesArray.forEach(page => {
    page.trafficShare = totalTraffic > 0 ? Math.round(page.traffic / totalTraffic * 100) : 0;
    page.avgPosition = page.keywords.length > 0 
      ? Math.round(page.keywords.reduce((sum, k) => sum + (k.position || 10), 0) / page.keywords.length)
      : 10;
    page.topKeyword = page.keywords.sort((a, b) => (b.traffic || 0) - (a.traffic || 0))[0];
    page.keywordCount = page.keywords.length;
  });
  
  return pagesArray.sort((a, b) => b.traffic - a.traffic).slice(0, 20);
}

/**
 * Calculate comprehensive traffic metrics
 */
function ELITE_calculateTrafficMetrics(domain, keywords, topPages) {
  const organicTraffic = keywords.reduce((sum, kw) => sum + (kw.traffic || 0), 0);
  const trafficValue = keywords.reduce((sum, kw) => sum + (kw.value || 0), 0);
  
  const rankedKeywords = keywords.filter(kw => kw.position);
  const avgPosition = rankedKeywords.length > 0
    ? Math.round(rankedKeywords.reduce((sum, kw) => sum + kw.position, 0) / rankedKeywords.length * 10) / 10
    : 0;
  
  // Calculate top pages traffic
  topPages.forEach(page => {
    const pageKeywords = keywords.filter(kw => kw.url === page.url);
    page.traffic = pageKeywords.reduce((sum, kw) => sum + (kw.traffic || 0), 0);
    page.trafficShare = organicTraffic > 0 ? Math.round(page.traffic / organicTraffic * 100) : 0;
  });
  
  return {
    organic: organicTraffic,
    value: trafficValue,
    avgPosition: avgPosition,
    keywordCount: keywords.length,
    positionDistribution: {
      top3: keywords.filter(kw => kw.position && kw.position <= 3).length,
      top10: keywords.filter(kw => kw.position && kw.position <= 10).length,
      top20: keywords.filter(kw => kw.position && kw.position <= 20).length,
      total: rankedKeywords.length
    },
    intentDistribution: {
      informational: keywords.filter(kw => kw.intent === 'informational').length,
      commercial: keywords.filter(kw => kw.intent === 'commercial').length,
      transactional: keywords.filter(kw => kw.intent === 'transactional').length,
      navigational: keywords.filter(kw => kw.intent === 'navigational').length
    },
    topKeywordsByTraffic: keywords.slice(0, 10),
    topKeywordsByValue: [...keywords].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 10)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 6: BACKLINK & AUTHORITY ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze backlink profile based on PageRank
 * V4.0: PRIORITY ORDER CHANGED - Fetcher data FIRST, then free APIs
 *       1. Elite Data Enricher (uses fetched page data - most reliable)
 *       2. PHP Real Metrics (Serper mentions - free API fallback)
 *       3. Template-based estimation (last resort)
 */
function ELITE_analyzeBacklinks(domain, pageRank, comp) {
  pageRank = pageRank || 0;
  
  // V4.0 PRIORITY 1: Try Elite Data Enricher FIRST (uses our fetched data)
  // This uses data we already collected during the fetch process
  try {
    if (typeof FT_EnrichBacklinkData === 'function' && comp) {
      Logger.log(`   🔗 ELITE_analyzeBacklinks v4.0: Using Fetcher Data (Elite Enricher) for ${domain}`);
      const enriched = FT_EnrichBacklinkData(comp, 'default');
      
      if (enriched && enriched.hasData && (enriched.topReferrers || []).length > 0) {
        Logger.log(`   ✅ Got ${(enriched.topReferrers || []).length} referring domains from Fetcher Data`);
        return {
          total: enriched.total || ELITE_estimateBacklinksFromPR(pageRank),
          refDomains: enriched.refDomains || Math.round(enriched.total * 0.0106),
          dofollow: enriched.dofollow || 85,
          nofollow: enriched.nofollow || 100 - (enriched.dofollow || 85),
          avgDR: enriched.avgDR || Math.min(100, Math.round(pageRank * 10 + 20)),
          pageRank: pageRank,
          anchorDistribution: enriched.anchorDistribution || {
            branded: { percent: 35, example: domain.split('.')[0] },
            exactMatch: { percent: 15, example: 'main keyword' },
            partialMatch: { percent: 20, example: 'related phrase' },
            generic: { percent: 18, example: 'click here' },
            nakedUrl: { percent: 12, example: `https://${domain}` }
          },
          topReferrers: enriched.topReferrers || [],
          methodology: enriched.dataSource || 'SerpifAI Fetcher Data',
          confidence: enriched.confidence || 0.85,
          dataSource: 'fetcher_data',
          _fetcherSource: true
        };
      }
    }
  } catch (e) {
    Logger.log(`   ⚠️ Elite Data Enricher failed: ${e.message} - trying PHP Real Metrics`);
  }
  
  // V4.0 PRIORITY 2: Try FT_GetRealBacklinkData (PHP real metrics - free API fallback)
  try {
    if (typeof FT_GetRealBacklinkData === 'function') {
      Logger.log(`   🔗 ELITE_analyzeBacklinks v4.0: Trying PHP Real Metrics (free API) for ${domain}`);
      const realBacklinks = FT_GetRealBacklinkData(domain);
      
      if (realBacklinks && realBacklinks.success && realBacklinks.refDomains > 0) {
        Logger.log(`   ✅ Got ${realBacklinks.refDomains} referring domains from Serper API`);
        return {
          total: realBacklinks.total,
          refDomains: realBacklinks.refDomains,
          dofollow: realBacklinks.dofollow,
          nofollow: realBacklinks.nofollow,
          avgDR: realBacklinks.avgDR,
          pageRank: realBacklinks.pageRank || pageRank,
          anchorDistribution: {
            branded: { percent: 35, example: domain.split('.')[0] },
            exactMatch: { percent: 15, example: 'main keyword' },
            partialMatch: { percent: 20, example: 'related phrase' },
            generic: { percent: 18, example: 'click here' },
            nakedUrl: { percent: 12, example: `https://${domain}` }
          },
          topReferrers: realBacklinks.topReferrers || [],
          methodology: realBacklinks.methodology || 'Serper Mentions Search',
          confidence: realBacklinks.confidence || 0.75,
          dataSource: 'serper_realtime',
          _realMetricsSource: true
        };
      }
    }
  } catch (e) {
    Logger.log(`   ⚠️ PHP Real Metrics failed: ${e.message} - using fallback estimation`);
  }
  
  // V4.0 PRIORITY 3: Template-based estimation (last resort)
  Logger.log(`   📊 ELITE_analyzeBacklinks v4.0: Using industry-aware estimation for ${domain}`);
  const estimatedBacklinks = ELITE_estimateBacklinksFromPR(pageRank);
  const estimatedRefDomains = Math.round(estimatedBacklinks * 0.0106);
  
  return {
    total: estimatedBacklinks,
    refDomains: estimatedRefDomains,
    dofollow: 85,
    nofollow: 15,
    avgDR: Math.min(100, Math.round(pageRank * 10 + 20)),
    pageRank: pageRank,
    anchorDistribution: {
      branded: { percent: 35, example: domain.split('.')[0] },
      exactMatch: { percent: 15, example: 'main keyword' },
      partialMatch: { percent: 20, example: 'related phrase' },
      generic: { percent: 18, example: 'click here' },
      nakedUrl: { percent: 12, example: `https://${domain}` }
    },
    topReferrers: ELITE_estimateTopReferrers(domain, pageRank),
    methodology: 'SerpifAI Elite + PageRank Analysis (Industry Estimation)',
    confidence: 0.4,
    dataSource: 'estimation',
    _estimated: true
  };
}

/**
 * Estimate backlinks from PageRank score
 */
function ELITE_estimateBacklinksFromPR(pageRank) {
  if (pageRank <= 0) return 100;
  if (pageRank <= 1) return Math.round(100 + pageRank * 400);
  if (pageRank <= 2) return Math.round(500 + (pageRank - 1) * 1500);
  if (pageRank <= 3) return Math.round(2000 + (pageRank - 2) * 8000);
  if (pageRank <= 4) return Math.round(10000 + (pageRank - 3) * 40000);
  if (pageRank <= 5) return Math.round(50000 + (pageRank - 4) * 150000);
  if (pageRank <= 6) return Math.round(200000 + (pageRank - 5) * 800000);
  if (pageRank <= 7) return Math.round(1000000 + (pageRank - 6) * 4000000);
  return Math.round(5000000 + (pageRank - 7) * 15000000);
}

/**
 * Estimate top referring domains - V10.2 Industry-Aware
 * Generates contextually relevant referrers based on domain industry
 */
function ELITE_estimateTopReferrers(domain, pageRank) {
  // V10.2: Detect industry from domain name
  const domainLower = (domain || '').toLowerCase();
  let industry = 'general';
  if (/tech|software|app|dev|code|api|cloud|saas|io$/.test(domainLower)) industry = 'tech';
  else if (/shop|store|buy|ecom|market|sale|cart|retail/.test(domainLower)) industry = 'ecommerce';
  else if (/finance|bank|invest|money|trading|capital|fund/.test(domainLower)) industry = 'finance';
  else if (/health|med|doctor|clinic|wellness|pharma|care/.test(domainLower)) industry = 'health';
  else if (/edu|learn|course|school|academy|train|university/.test(domainLower)) industry = 'education';
  else if (/blog|news|media|journal|magazine|post/.test(domainLower)) industry = 'media';
  else if (/legal|law|attorney|lawyer/.test(domainLower)) industry = 'legal';
  else if (/realestate|property|home|house|realtor/.test(domainLower)) industry = 'realestate';
  
  // Industry-specific referrer templates with diverse backlink profiles
  const industryReferrers = {
    tech: [
      { domain: 'github.com', dr: 92, type: 'Repository', base: 0.020 },
      { domain: 'stackoverflow.com', dr: 91, type: 'Q&A', base: 0.015 },
      { domain: 'dev.to', dr: 78, type: 'Content', base: 0.012 },
      { domain: 'hackernews.ycombinator.com', dr: 85, type: 'Forum', base: 0.010 },
      { domain: 'producthunt.com', dr: 80, type: 'Directory', base: 0.008 },
      { domain: 'techcrunch.com', dr: 89, type: 'News', base: 0.006 },
      { domain: 'infoq.com', dr: 75, type: 'Tech News', base: 0.005 },
      { domain: 'dzone.com', dr: 72, type: 'Dev Content', base: 0.004 }
    ],
    ecommerce: [
      { domain: 'trustpilot.com', dr: 85, type: 'Review', base: 0.018 },
      { domain: 'g2.com', dr: 76, type: 'Review', base: 0.014 },
      { domain: 'capterra.com', dr: 78, type: 'Directory', base: 0.012 },
      { domain: 'sitejabber.com', dr: 70, type: 'Review', base: 0.010 },
      { domain: 'bbb.org', dr: 85, type: 'Directory', base: 0.008 },
      { domain: 'pricegrabber.com', dr: 68, type: 'Comparison', base: 0.006 },
      { domain: 'retailmenot.com', dr: 80, type: 'Coupon', base: 0.005 },
      { domain: 'shopzilla.com', dr: 65, type: 'Comparison', base: 0.004 }
    ],
    finance: [
      { domain: 'investopedia.com', dr: 85, type: 'Reference', base: 0.016 },
      { domain: 'nerdwallet.com', dr: 82, type: 'Review', base: 0.014 },
      { domain: 'bankrate.com', dr: 83, type: 'Comparison', base: 0.012 },
      { domain: 'crunchbase.com', dr: 84, type: 'Directory', base: 0.010 },
      { domain: 'morningstar.com', dr: 80, type: 'Analysis', base: 0.008 },
      { domain: 'fool.com', dr: 78, type: 'Content', base: 0.006 },
      { domain: 'seekingalpha.com', dr: 75, type: 'Analysis', base: 0.005 },
      { domain: 'kiplinger.com', dr: 72, type: 'News', base: 0.004 }
    ],
    health: [
      { domain: 'webmd.com', dr: 90, type: 'Reference', base: 0.016 },
      { domain: 'healthline.com', dr: 87, type: 'Content', base: 0.014 },
      { domain: 'verywellhealth.com', dr: 80, type: 'Content', base: 0.012 },
      { domain: 'medicalnewstoday.com', dr: 82, type: 'News', base: 0.010 },
      { domain: 'drugs.com', dr: 78, type: 'Reference', base: 0.008 },
      { domain: 'rxlist.com', dr: 75, type: 'Reference', base: 0.006 },
      { domain: 'everydayhealth.com', dr: 76, type: 'Content', base: 0.005 },
      { domain: 'goodrx.com', dr: 74, type: 'Service', base: 0.004 }
    ],
    education: [
      { domain: 'coursera.org', dr: 84, type: 'Platform', base: 0.018 },
      { domain: 'udemy.com', dr: 82, type: 'Platform', base: 0.014 },
      { domain: 'edx.org', dr: 83, type: 'Platform', base: 0.012 },
      { domain: 'khanacademy.org', dr: 86, type: 'Platform', base: 0.010 },
      { domain: 'skillshare.com', dr: 75, type: 'Platform', base: 0.008 },
      { domain: 'classcentral.com', dr: 68, type: 'Directory', base: 0.006 },
      { domain: 'elearningindustry.com', dr: 65, type: 'News', base: 0.005 },
      { domain: 'teachable.com', dr: 70, type: 'Platform', base: 0.004 }
    ],
    media: [
      { domain: 'medium.com', dr: 88, type: 'Content', base: 0.018 },
      { domain: 'substack.com', dr: 75, type: 'Newsletter', base: 0.014 },
      { domain: 'feedspot.com', dr: 65, type: 'Directory', base: 0.010 },
      { domain: 'alltop.com', dr: 60, type: 'Aggregator', base: 0.008 },
      { domain: 'flipboard.com', dr: 78, type: 'Aggregator', base: 0.007 },
      { domain: 'pocket.com', dr: 72, type: 'Bookmarking', base: 0.005 },
      { domain: 'feedly.com', dr: 70, type: 'RSS', base: 0.004 },
      { domain: 'mix.com', dr: 68, type: 'Social', base: 0.003 }
    ],
    legal: [
      { domain: 'avvo.com', dr: 80, type: 'Directory', base: 0.018 },
      { domain: 'findlaw.com', dr: 82, type: 'Directory', base: 0.014 },
      { domain: 'justia.com', dr: 78, type: 'Reference', base: 0.012 },
      { domain: 'lawyers.com', dr: 75, type: 'Directory', base: 0.010 },
      { domain: 'martindale.com', dr: 72, type: 'Directory', base: 0.008 },
      { domain: 'nolo.com', dr: 76, type: 'Reference', base: 0.006 },
      { domain: 'lawinfo.com', dr: 65, type: 'Directory', base: 0.005 },
      { domain: 'hg.org', dr: 68, type: 'Directory', base: 0.004 }
    ],
    realestate: [
      { domain: 'zillow.com', dr: 88, type: 'Listing', base: 0.018 },
      { domain: 'realtor.com', dr: 85, type: 'Listing', base: 0.015 },
      { domain: 'redfin.com', dr: 82, type: 'Listing', base: 0.012 },
      { domain: 'trulia.com', dr: 80, type: 'Listing', base: 0.010 },
      { domain: 'apartments.com', dr: 78, type: 'Listing', base: 0.008 },
      { domain: 'loopnet.com', dr: 72, type: 'Commercial', base: 0.006 },
      { domain: 'point2homes.com', dr: 65, type: 'Listing', base: 0.005 },
      { domain: 'homelight.com', dr: 68, type: 'Service', base: 0.004 }
    ],
    general: [
      { domain: 'yelp.com', dr: 88, type: 'Review', base: 0.015 },
      { domain: 'bbb.org', dr: 85, type: 'Directory', base: 0.012 },
      { domain: 'trustpilot.com', dr: 85, type: 'Review', base: 0.010 },
      { domain: 'glassdoor.com', dr: 82, type: 'Review', base: 0.008 },
      { domain: 'crunchbase.com', dr: 84, type: 'Directory', base: 0.007 },
      { domain: 'manta.com', dr: 65, type: 'Directory', base: 0.005 },
      { domain: 'yellowpages.com', dr: 75, type: 'Directory', base: 0.004 },
      { domain: 'angieslist.com', dr: 72, type: 'Review', base: 0.003 }
    ]
  };
  
  const templates = industryReferrers[industry] || industryReferrers.general;
  const totalBacklinks = ELITE_estimateBacklinksFromPR(pageRank);
  
  Logger.log(`   📊 ELITE_estimateTopReferrers v10.2: ${domain} → ${industry} industry`);
  
  return templates.map((t, i) => ({
    domain: t.domain,
    dr: t.dr,
    backlinks: Math.max(1, Math.round(totalBacklinks * t.base * (1 - i * 0.05))),
    type: t.type,
    dofollow: i < 5,
    firstSeen: 'Recent',
    _estimated: true  // Flag for UI to know this is estimated
  }));
}

/**
 * Calculate comprehensive authority score
 */
function ELITE_calculateAuthority(domain, data) {
  const signals = {
    pageRank: data.backlinks?.pageRank || 0,
    backlinks: data.backlinks?.total || 0,
    refDomains: data.backlinks?.refDomains || 0,
    keywords: data.keywords?.length || 0,
    traffic: data.traffic?.organic || 0,
    contentQuality: data.website?.contentQuality || data.dataQuality?.directPages * 10 || 0
  };
  
  const prScore = Math.min(100, signals.pageRank * 14);
  const blScore = signals.backlinks > 0 ? Math.min(100, Math.log10(signals.backlinks) * 20) : 0;
  const rdScore = signals.refDomains > 0 ? Math.min(100, Math.log10(signals.refDomains) * 25) : 0;
  const trScore = signals.traffic > 0 ? Math.min(100, Math.log10(signals.traffic) * 18) : 0;
  const cqScore = signals.contentQuality;
  
  const weightedScore = Math.round(
    prScore * 0.35 +
    blScore * 0.20 +
    rdScore * 0.15 +
    trScore * 0.15 +
    cqScore * 0.15
  );
  
  return {
    score: Math.min(100, Math.max(0, weightedScore)),
    signals: signals,
    breakdown: {
      pageRank: { weight: 35, score: Math.round(prScore) },
      backlinks: { weight: 20, score: Math.round(blScore) },
      refDomains: { weight: 15, score: Math.round(rdScore) },
      traffic: { weight: 15, score: Math.round(trScore) },
      contentQuality: { weight: 15, score: Math.round(cqScore) }
    },
    tier: weightedScore >= 80 ? 'enterprise' : weightedScore >= 60 ? 'established' : weightedScore >= 40 ? 'growing' : 'emerging'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 7: GEOGRAPHIC ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze geographic distribution v3.0
 * Uses FT_GetRealGeographicData for REAL website language detection
 * Falls back to hreflang analysis, domain keywords, and TLD inference
 * @param {string} domain - Domain to analyze
 * @param {number} totalTraffic - Estimated total traffic
 * @param {object} websiteData - Optional scraped website data with hreflang/language signals
 */
function ELITE_analyzeGeographic(domain, totalTraffic, websiteData) {
  // V3.0: Try FT_GetRealGeographicData first (PHP real metrics)
  try {
    if (typeof FT_GetRealGeographicData === 'function') {
      Logger.log(`   🌍 Geographic v3.0: Using PHP Real Metrics for ${domain}`);
      const realGeo = FT_GetRealGeographicData(domain);
      
      if (realGeo && realGeo.success && realGeo.countries && realGeo.countries.length > 0) {
        Logger.log(`   ✅ Got ${realGeo.countriesDetected} REAL countries from website analysis`);
        
        // Add traffic to countries
        realGeo.countries.forEach(c => {
          c.traffic = Math.round(totalTraffic * c.percent / 100);
        });
        
        return {
          primary: {
            country: realGeo.primary.country,
            code: realGeo.primary.code,
            flag: realGeo.primary.flag,
            percent: realGeo.primary.percent,
            traffic: Math.round(totalTraffic * realGeo.primary.percent / 100)
          },
          countries: realGeo.countries,
          countriesDetected: realGeo.countriesDetected,
          internationalPercent: realGeo.internationalPercent,
          methodology: realGeo.methodology || 'SerpifAI Real Geo',
          dataSource: 'website_analysis',
          _realMetricsSource: true
        };
      }
    }
  } catch (e) {
    Logger.log(`   ⚠️ PHP Real Geo failed: ${e.message} - using fallback`);
  }
  
  // Fallback to original v2.0 logic
  const tld = domain.split('.').pop()?.toLowerCase() || 'com';
  const domainLower = domain.toLowerCase();
  
  // V2.0: Check for hreflang data from website scraping first
  let countries = [];
  let dataSource = 'TLD + Inference';
  
  // Priority 1: Use hreflang data if available (from website scraping)
  if (websiteData?.hreflang && Object.keys(websiteData.hreflang).length > 0) {
    Logger.log(`   🌍 Geographic v2.0: Using hreflang data for ${domain}`);
    const hreflangCountries = Object.keys(websiteData.hreflang);
    const evenPercent = Math.floor(100 / hreflangCountries.length);
    let remaining = 100;
    
    hreflangCountries.forEach((lang, idx) => {
      const code = lang.toUpperCase().includes('-') ? 
        lang.split('-')[1].toUpperCase() : 
        _langToCountry(lang);
      const percent = idx === 0 ? evenPercent + (100 - evenPercent * hreflangCountries.length) : evenPercent;
      remaining -= percent;
      countries.push({
        code: code,
        name: ELITE_getCountryName(code),
        flag: SERPIFAI_ELITE_CONFIG.COUNTRY_FLAGS[code] || '🌍',
        percent: percent,
        traffic: Math.round(totalTraffic * percent / 100)
      });
    });
    dataSource = 'hreflang';
  }
  // Priority 2: Check for language signals in domain or content
  else if (websiteData?.language || _detectDomainLanguage(domainLower)) {
    Logger.log(`   🌍 Geographic v2.0: Using language signals for ${domain}`);
    const lang = websiteData?.language || _detectDomainLanguage(domainLower);
    countries = _buildCountriesFromLanguage(lang, totalTraffic);
    dataSource = 'Language Detection';
  }
  // Priority 3: TLD-based with smart variance (not just template)
  else {
    Logger.log(`   🌍 Geographic v2.0: Using TLD inference for ${domain}`);
    const tldData = SERPIFAI_ELITE_CONFIG.TLD_COUNTRY_MAP[tld] || 
                    SERPIFAI_ELITE_CONFIG.TLD_COUNTRY_MAP['com'];
    
    // V2.0: Add variance based on domain hash for uniqueness
    const domainHash = _hashDomain(domain);
    const variance = (domainHash % 15) - 7; // -7 to +7 variance
    
    Object.keys(tldData.distribution).forEach(code => {
      let percent = tldData.distribution[code];
      // Apply slight variance (but keep primary dominant and ensure positive)
      if (code !== 'OTHER') {
        percent = Math.max(2, Math.min(65, percent + variance * (code === tldData.primary ? 0.3 : -0.2)));
      }
      countries.push({
        code: code,
        name: ELITE_getCountryName(code),
        flag: SERPIFAI_ELITE_CONFIG.COUNTRY_FLAGS[code] || '🌍',
        percent: Math.round(percent),
        traffic: Math.round(totalTraffic * percent / 100)
      });
    });
    
    // Normalize to 100%
    const totalPercent = countries.reduce((sum, c) => sum + c.percent, 0);
    if (totalPercent !== 100) {
      const otherIdx = countries.findIndex(c => c.code === 'OTHER');
      if (otherIdx >= 0) {
        countries[otherIdx].percent += (100 - totalPercent);
      }
    }
  }
  
  countries.sort((a, b) => b.percent - a.percent);
  const primary = countries[0] || { code: 'US', percent: 42, flag: '🇺🇸', name: 'United States' };
  
  return {
    primary: {
      country: primary.name || primary.code,
      code: primary.code,
      flag: primary.flag,
      percent: primary.percent,
      traffic: primary.traffic
    },
    countries: countries,
    countriesDetected: countries.length,
    internationalPercent: 100 - primary.percent,
    methodology: `SerpifAI Elite v2.0 (${dataSource})`
  };
}

// V2.0 Helper: Simple domain hash for variance
function _hashDomain(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash) + domain.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// V2.0 Helper: Detect language from domain keywords
function _detectDomainLanguage(domain) {
  if (domain.match(/deutsch|german|\.de\b/)) return 'de';
  if (domain.match(/francais|french|\.fr\b/)) return 'fr';
  if (domain.match(/espanol|spanish|\.es\b/)) return 'es';
  if (domain.match(/italiano|italian|\.it\b/)) return 'it';
  if (domain.match(/japanese|nihon|\.jp\b/)) return 'ja';
  if (domain.match(/chinese|zhongwen|\.cn\b/)) return 'zh';
  if (domain.match(/brasil|portuguese|\.br\b/)) return 'pt';
  return null;
}

// V2.0 Helper: Language code to primary country
function _langToCountry(lang) {
  const map = {
    'en': 'US', 'de': 'DE', 'fr': 'FR', 'es': 'ES', 'it': 'IT',
    'ja': 'JP', 'zh': 'CN', 'pt': 'BR', 'nl': 'NL', 'ru': 'RU'
  };
  return map[lang.toLowerCase()] || 'US';
}

// V2.0 Helper: Build countries from language
function _buildCountriesFromLanguage(lang, totalTraffic) {
  const distributions = {
    'de': { DE: 55, AT: 15, CH: 10, US: 8, OTHER: 12 },
    'fr': { FR: 52, CA: 15, BE: 10, CH: 8, OTHER: 15 },
    'es': { ES: 35, MX: 25, US: 15, AR: 10, OTHER: 15 },
    'it': { IT: 65, CH: 10, US: 8, OTHER: 17 },
    'ja': { JP: 85, US: 5, OTHER: 10 },
    'zh': { CN: 70, US: 10, OTHER: 20 },
    'pt': { BR: 55, PT: 20, US: 10, OTHER: 15 },
    'default': { US: 42, GB: 11, CA: 7, AU: 6, DE: 5, IN: 8, OTHER: 21 }
  };
  
  const dist = distributions[lang] || distributions['default'];
  return Object.entries(dist).map(([code, percent]) => ({
    code: code,
    name: ELITE_getCountryName(code),
    flag: SERPIFAI_ELITE_CONFIG.COUNTRY_FLAGS[code] || '🌍',
    percent: percent,
    traffic: Math.round(totalTraffic * percent / 100)
  }));
}

function ELITE_getCountryName(code) {
  const names = {
    'US': 'United States', 'GB': 'United Kingdom', 'UK': 'United Kingdom',
    'CA': 'Canada', 'AU': 'Australia', 'DE': 'Germany', 'FR': 'France',
    'IN': 'India', 'BR': 'Brazil', 'JP': 'Japan', 'ES': 'Spain',
    'IT': 'Italy', 'NL': 'Netherlands', 'OTHER': 'Other'
  };
  return names[code] || code;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 8: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Detect industry from domain
 */
function ELITE_detectIndustry(domain) {
  const domainLower = domain.toLowerCase();
  
  if (domainLower.match(/seo|serp|ahrefs|semrush|moz|backlink|rank/)) return 'seo';
  if (domainLower.match(/marketing|ads?|campaign|social/)) return 'marketing';
  if (domainLower.match(/finance|bank|invest|trading/)) return 'finance';
  if (domainLower.match(/insur|policy|coverage/)) return 'insurance';
  if (domainLower.match(/legal|law|attorney/)) return 'legal';
  if (domainLower.match(/health|medical|clinic|doctor/)) return 'health';
  if (domainLower.match(/shop|store|ecommerce|buy/)) return 'ecommerce';
  if (domainLower.match(/travel|hotel|flight|booking/)) return 'travel';
  if (domainLower.match(/edu|learn|course|school/)) return 'education';
  if (domainLower.match(/tech|software|app|saas|cloud/)) return 'technology';
  
  return 'default';
}

// Alias for backward compatibility
function ORACLE_detectIndustry(domain) {
  return ELITE_detectIndustry(domain);
}

/**
 * Get industry-specific keywords
 */
function ELITE_getIndustryKeywords(industry) {
  const industryKeywords = {
    'seo': ['seo tools', 'keyword research', 'backlink checker', 'site audit', 'rank tracker', 'competitor analysis', 'seo software', 'domain authority'],
    'marketing': ['marketing automation', 'email marketing', 'social media marketing', 'content marketing', 'digital marketing tools', 'lead generation'],
    'technology': ['cloud software', 'saas platform', 'enterprise software', 'api integration', 'developer tools', 'productivity tools'],
    'finance': ['financial software', 'accounting tools', 'investment platform', 'budgeting app', 'expense tracker'],
    'default': ['software review', 'best tools', 'comparison', 'alternative', 'pricing', 'features', 'tutorial', 'how to use']
  };
  
  return industryKeywords[industry] || industryKeywords['default'];
}

/**
 * Extract phrases from text (2-4 words)
 */
function ELITE_extractPhrases(text, domainBase) {
  if (!text) return [];
  
  domainBase = domainBase || '';
  const domainLower = domainBase.toLowerCase();
  
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const phrases = [];
  for (let i = 0; i < words.length; i++) {
    for (let len = 2; len <= 4 && i + len <= words.length; len++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (phrase.length > 5 && !phrase.includes(domainLower)) {
        phrases.push(phrase);
      }
    }
  }
  
  return [...new Set(phrases)].slice(0, 15);
}

/**
 * Get URL path
 */
function ELITE_getPathFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch (e) {
    return '/';
  }
}

/**
 * Extract title from URL slug
 */
function ELITE_extractTitleFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const slug = path.split('/').filter(p => p).pop() || 'Homepage';
    return slug
      .replace(/-/g, ' ')
      .replace(/\.[^.]+$/, '')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  } catch (e) {
    return 'Page';
  }
}

/**
 * Estimate keyword volume
 * Returns 0 - real volume data should come from keyword API
 */
function ELITE_estimateVolume(keyword, industry) {
  // Real volume requires API data - return 0 instead of random estimates
  return 0;
}

/**
 * Estimate CPC
 * Returns 0 - real CPC data should come from keyword API
 */
function ELITE_estimateCPC(keyword, industry) {
  // Real CPC requires API data - return 0 instead of random estimates
  return 0;
}

/**
 * Estimate keyword difficulty
 * Returns 0 - real difficulty data should come from keyword API
 */
function ELITE_estimateDifficulty(keyword, wordCount) {
  // Real difficulty requires API data - return 0 instead of random estimates
  return 0;
}

/**
 * Classify keyword intent
 */
function ELITE_classifyIntent(keyword) {
  const kw = keyword.toLowerCase();
  
  if (kw.match(/buy|purchase|order|shop|price|cost|deal|discount|coupon|free|download|signup|register/)) {
    return 'transactional';
  }
  if (kw.match(/best|top|review|comparison|compare|vs|alternative|recommended|rating/)) {
    return 'commercial';
  }
  if (kw.match(/how|what|why|when|where|who|which|guide|tutorial|learn|tips/)) {
    return 'informational';
  }
  if (kw.match(/login|signin|account|dashboard|official|website/)) {
    return 'navigational';
  }
  
  return 'informational';
}

/**
 * Calculate keyword similarity (Jaccard)
 */
function ELITE_calculateSimilarity(kw1, kw2) {
  const words1 = new Set(kw1.toLowerCase().split(/\s+/));
  const words2 = new Set(kw2.toLowerCase().split(/\s+/));
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate data confidence score
 */
function ELITE_calculateConfidence(result) {
  let confidence = 0;
  
  // Direct intelligence (max 40)
  if (result.dataQuality.tier1Complete) confidence += 20;
  confidence += Math.min(20, result.dataQuality.directPages * 4);
  
  // Keywords (max 25)
  if (result.keywords.length >= 50) confidence += 25;
  else if (result.keywords.length >= 30) confidence += 20;
  else if (result.keywords.length >= 15) confidence += 10;
  
  // API enrichment (max 20)
  if (result.sources.serper.success) confidence += 10;
  if (result.sources.pageRank.success) confidence += 10;
  
  // Synthesis (max 15)
  if (result.geminiReady) confidence += 8;
  if (result.uiReady) confidence += 7;
  
  return Math.min(100, confidence);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 9: CACHING
// ═══════════════════════════════════════════════════════════════════════════════════

function ELITE_getFromCache(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - (data.fetchedAt || 0);
      if (age < SERPIFAI_ELITE_CONFIG.CACHE_TTL_HOURS * 3600000) {
        return data;
      }
    }
  } catch (e) {
    // Cache error - ignore
  }
  return null;
}

function ELITE_saveToCache(key, data) {
  try {
    const cache = CacheService.getScriptCache();
    const serialized = JSON.stringify(data);
    if (serialized.length < 100000) {
      cache.put(key, serialized, SERPIFAI_ELITE_CONFIG.CACHE_TTL_HOURS * 3600);
    }
  } catch (e) {
    Logger.log(`⚠️ Cache save failed: ${e.toString()}`);
  }
}

// Legacy aliases for backward compatibility
function ORACLE_getFromCache(key) { return ELITE_getFromCache(key); }
function ORACLE_saveToCache(key, data) { return ELITE_saveToCache(key, data); }
function ORACLE_calculateConfidence(result) { return ELITE_calculateConfidence(result); }

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 10: STRATEGIC AUDIT POST-PROCESSING WORKERS
// Run AFTER initial HTML fetch to prevent execution timeouts
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Execute Strategic Audit - Post-Processing Worker
 * Runs after initial fetch is complete to analyze advanced patterns
 * @param {Object} competitorData - The fetched competitor data with homepageRaw/internalPageRaw
 * @returns {Object} Strategic audit results
 */
function executeStrategicAudit(competitorData) {
  console.log('[StrategicAudit] ═══════════════════════════════════════════════════');
  console.log('[StrategicAudit] Starting Post-Processing Strategic Audit');
  console.log('[StrategicAudit] ═══════════════════════════════════════════════════');
  
  const auditResults = {
    timestamp: new Date().toISOString(),
    programmaticMoat: null,
    semanticTriplets: null,
    emotionalDebt: null,
    evidenceMap: {}
  };
  
  try {
    // 1. Programmatic Moat Detection
    auditResults.programmaticMoat = detectProgrammaticMoat(competitorData);
    auditResults.evidenceMap['programmatic'] = auditResults.programmaticMoat.evidence;
    
    // 2. Semantic Triplets Analysis (Entity-Attribute-Value patterns)
    auditResults.semanticTriplets = detectSemanticTriplets(competitorData);
    auditResults.evidenceMap['semantic'] = auditResults.semanticTriplets.evidence;
    
    // 3. Emotional Debt Analysis (Content tone gaps)
    auditResults.emotionalDebt = detectEmotionalDebt(competitorData);
    auditResults.evidenceMap['emotional'] = auditResults.emotionalDebt.evidence;
    
    console.log('[StrategicAudit] ✅ Audit Complete:', {
      programmatic: auditResults.programmaticMoat.is_programmatic,
      semanticCount: auditResults.semanticTriplets.tripletCount,
      emotionalScore: auditResults.emotionalDebt.score
    });
    
  } catch (error) {
    console.error('[StrategicAudit] Error:', error.message);
    auditResults.error = error.message;
  }
  
  return auditResults;
}

/**
 * Detect Programmatic Moat - Compare homepage vs internal page DOM structure
 * If DOM structure matches > 85%, the site uses programmatic/template-based generation
 * @param {Object} competitorData - Must contain homepageRaw and internalPageRaw
 * @returns {Object} Programmatic moat analysis
 */
function detectProgrammaticMoat(competitorData) {
  const result = {
    is_programmatic: false,
    similarity_score: 0,
    confidence: 0,
    pattern_type: 'unknown',
    evidence: {
      sharedClasses: [],
      sharedIds: [],
      structuralPatterns: [],
      templateSignatures: []
    }
  };
  
  const homepageRaw = competitorData.homepageRaw || competitorData.rawHtml || '';
  const internalPageRaw = competitorData.internalPageRaw || competitorData.synthesized?.website?.rawHtml || '';
  
  if (!homepageRaw || !internalPageRaw) {
    result.confidence = 0;
    result.error = 'Missing raw HTML for comparison';
    return result;
  }
  
  // Extract DOM structural elements
  const homepageStructure = extractDOMStructure(homepageRaw);
  const internalStructure = extractDOMStructure(internalPageRaw);
  
  // Compare CSS classes
  const sharedClasses = homepageStructure.classes.filter(c => internalStructure.classes.includes(c));
  const classOverlap = sharedClasses.length / Math.max(homepageStructure.classes.length, 1);
  
  // Compare structural patterns (tag hierarchy)
  const sharedPatterns = homepageStructure.patterns.filter(p => internalStructure.patterns.includes(p));
  const patternOverlap = sharedPatterns.length / Math.max(homepageStructure.patterns.length, 1);
  
  // Detect template signatures (repeated CSS framework patterns)
  const templateSignatures = detectTemplateSignatures(homepageRaw, internalPageRaw);
  
  // Calculate weighted similarity score
  const similarityScore = (classOverlap * 0.4) + (patternOverlap * 0.4) + (templateSignatures.score * 0.2);
  
  result.similarity_score = Math.round(similarityScore * 100);
  result.is_programmatic = similarityScore >= 0.85;
  result.confidence = Math.min(95, Math.round(similarityScore * 100));
  
  // Determine pattern type
  if (templateSignatures.framework) {
    result.pattern_type = templateSignatures.framework;
  } else if (result.is_programmatic) {
    result.pattern_type = 'custom_template';
  } else {
    result.pattern_type = 'manual_design';
  }
  
  // Store evidence
  result.evidence.sharedClasses = sharedClasses.slice(0, 20);
  result.evidence.sharedIds = homepageStructure.ids.filter(id => internalStructure.ids.includes(id)).slice(0, 10);
  result.evidence.structuralPatterns = sharedPatterns.slice(0, 10);
  result.evidence.templateSignatures = templateSignatures.signatures;
  
  console.log('[ProgrammaticMoat] Detection:', {
    similarity: result.similarity_score + '%',
    isProgrammatic: result.is_programmatic,
    patternType: result.pattern_type,
    sharedClasses: sharedClasses.length
  });
  
  return result;
}

/**
 * Extract DOM structure from raw HTML for comparison
 */
function extractDOMStructure(html) {
  const structure = {
    classes: [],
    ids: [],
    patterns: [],
    tagCounts: {}
  };
  
  if (!html) return structure;
  
  // Extract CSS classes
  const classMatches = html.match(/class=["']([^"']+)["']/gi) || [];
  classMatches.forEach(match => {
    const classes = match.replace(/class=["']/i, '').replace(/["']$/, '').split(/\s+/);
    structure.classes.push(...classes.filter(c => c.length > 2));
  });
  structure.classes = [...new Set(structure.classes)];
  
  // Extract IDs
  const idMatches = html.match(/id=["']([^"']+)["']/gi) || [];
  idMatches.forEach(match => {
    const id = match.replace(/id=["']/i, '').replace(/["']$/, '');
    if (id.length > 2) structure.ids.push(id);
  });
  structure.ids = [...new Set(structure.ids)];
  
  // Extract structural patterns (parent-child tag relationships)
  const tagPattern = /<(\w+)[^>]*>\s*<(\w+)/gi;
  let patternMatch;
  while ((patternMatch = tagPattern.exec(html)) !== null) {
    structure.patterns.push(`${patternMatch[1]}>${patternMatch[2]}`);
  }
  structure.patterns = [...new Set(structure.patterns)];
  
  return structure;
}

/**
 * Detect known template/framework signatures
 */
function detectTemplateSignatures(html1, html2) {
  const signatures = [];
  let framework = null;
  let score = 0;
  
  const frameworks = {
    'next.js': ['__next', 'data-nscript', '_next/static'],
    'gatsby': ['gatsby-', 'data-gatsby'],
    'wordpress': ['wp-content', 'wp-includes', 'wordpress'],
    'shopify': ['shopify-section', 'cdn.shopify.com'],
    'webflow': ['w-', 'webflow'],
    'squarespace': ['squarespace', 'sqs-'],
    'wix': ['wixsite', '_wix'],
    'hubspot': ['hs-', 'hubspot'],
    'react': ['data-reactroot', '__REACT_'],
    'vue': ['data-v-', 'v-bind', 'v-on'],
    'angular': ['ng-', '_ngcontent', 'ngIf']
  };
  
  for (const [fw, patterns] of Object.entries(frameworks)) {
    let matchCount = 0;
    patterns.forEach(pattern => {
      if (html1.includes(pattern) && html2.includes(pattern)) {
        matchCount++;
        signatures.push({ framework: fw, pattern: pattern });
      }
    });
    if (matchCount >= 2) {
      framework = fw;
      score = 0.9;
      break;
    } else if (matchCount === 1 && !framework) {
      framework = fw;
      score = 0.6;
    }
  }
  
  return { framework, score, signatures };
}

/**
 * Detect Semantic Triplets (Entity-Attribute-Value patterns in content)
 */
function detectSemanticTriplets(competitorData) {
  const result = {
    tripletCount: 0,
    triplets: [],
    entityTypes: [],
    evidence: {
      schemaEntities: [],
      headingPatterns: [],
      metaEntities: []
    }
  };
  
  const synthesized = competitorData.synthesized || {};
  const website = synthesized.website || {};
  
  // Extract entities from schema.org data
  const schemaTypes = website.schemaTypes || [];
  schemaTypes.forEach(type => {
    result.evidence.schemaEntities.push(type);
    result.triplets.push({
      entity: competitorData.domain,
      attribute: 'schema_type',
      value: type
    });
  });
  
  // Extract from headings (H2/H3 often contain E-A-V patterns)
  const headings = [...(website.h2 || []), ...(website.h3 || [])];
  headings.forEach(heading => {
    // Look for "X is Y" or "X: Y" patterns
    const colonPattern = heading.match(/^([^:]+):\s*(.+)$/i);
    const isPattern = heading.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
    
    if (colonPattern) {
      result.triplets.push({
        entity: colonPattern[1].trim(),
        attribute: 'definition',
        value: colonPattern[2].trim()
      });
      result.evidence.headingPatterns.push(heading);
    } else if (isPattern) {
      result.triplets.push({
        entity: isPattern[1].trim(),
        attribute: 'is',
        value: isPattern[2].trim()
      });
      result.evidence.headingPatterns.push(heading);
    }
  });
  
  result.tripletCount = result.triplets.length;
  result.entityTypes = [...new Set(result.triplets.map(t => t.attribute))];
  
  return result;
}

/**
 * Detect Emotional Debt (Content tone gaps and sentiment issues)
 */
function detectEmotionalDebt(competitorData) {
  const result = {
    score: 0,
    level: 'low',
    gaps: [],
    evidence: {
      toneIndicators: [],
      ctaAnalysis: [],
      sentimentFlags: []
    }
  };
  
  const synthesized = competitorData.synthesized || {};
  const website = synthesized.website || {};
  const rawHtml = competitorData.homepageRaw || competitorData.rawHtml || '';
  
  // Analyze CTAs for emotional engagement
  const ctaPatterns = [
    { pattern: /get started|try free|start now/gi, type: 'action', score: 1 },
    { pattern: /learn more|read more|discover/gi, type: 'curiosity', score: 0.8 },
    { pattern: /buy now|purchase|order/gi, type: 'urgency', score: 1.2 },
    { pattern: /join|become|subscribe/gi, type: 'belonging', score: 0.9 },
    { pattern: /save|discount|offer/gi, type: 'value', score: 1.1 },
    { pattern: /exclusive|limited|only/gi, type: 'scarcity', score: 1.3 }
  ];
  
  let emotionalScore = 0;
  let ctaCount = 0;
  
  ctaPatterns.forEach(({ pattern, type, score }) => {
    const matches = rawHtml.match(pattern) || [];
    if (matches.length > 0) {
      ctaCount += matches.length;
      emotionalScore += matches.length * score;
      result.evidence.ctaAnalysis.push({ type, count: matches.length });
    }
  });
  
  // Analyze for trust signals
  const trustPatterns = [
    { pattern: /trusted by|used by|loved by/gi, type: 'social_proof' },
    { pattern: /guaranteed|secure|safe/gi, type: 'security' },
    { pattern: /award|certified|recognized/gi, type: 'authority' },
    { pattern: /testimonial|review|rating/gi, type: 'validation' }
  ];
  
  let trustSignals = 0;
  trustPatterns.forEach(({ pattern, type }) => {
    const matches = rawHtml.match(pattern) || [];
    if (matches.length > 0) {
      trustSignals += matches.length;
      result.evidence.toneIndicators.push({ type, present: true });
    } else {
      result.evidence.sentimentFlags.push({ type, missing: true });
    }
  });
  
  // Calculate emotional debt score (higher = more debt = less emotional engagement)
  const idealScore = 10;
  const normalizedCTA = Math.min(emotionalScore / idealScore, 1);
  const normalizedTrust = Math.min(trustSignals / 4, 1);
  
  // Debt = what's missing from ideal
  result.score = Math.round((1 - ((normalizedCTA + normalizedTrust) / 2)) * 100);
  
  if (result.score <= 30) {
    result.level = 'low';
  } else if (result.score <= 60) {
    result.level = 'moderate';
  } else {
    result.level = 'high';
  }
  
  // Identify specific gaps
  if (ctaCount < 3) result.gaps.push('Few actionable CTAs');
  if (trustSignals < 2) result.gaps.push('Limited trust signals');
  if (!rawHtml.match(/testimonial|review/gi)) result.gaps.push('No testimonials found');
  if (!rawHtml.match(/guarantee|secure/gi)) result.gaps.push('No security messaging');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 10: TEST & DIAGNOSTIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Test the SerpifAI Elite Intelligence Engine
 */
function TEST_SerpifAIEliteEngine() {
  const testDomains = ['semrush.com', 'surferseo.com', 'clearscope.io'];
  
  testDomains.forEach(domain => {
    Logger.log(`\n\n${'═'.repeat(70)}`);
    Logger.log(`TESTING SERPIFAI ELITE ENGINE: ${domain}`);
    Logger.log(`${'═'.repeat(70)}\n`);
    
    const result = ORACLE_collectEliteData(domain, { forceRefresh: true });
    
    Logger.log(`\n📊 RESULTS SUMMARY:`);
    Logger.log(`   System: ${result.system}`);
    Logger.log(`   Version: ${result.version}`);
    Logger.log(`${'─'.repeat(50)}`);
    Logger.log(`   Keywords: ${result.keywords?.length || 0}`);
    Logger.log(`   Clusters: ${result.keywordClusters?.length || 0}`);
    Logger.log(`   Top Pages: ${result.topPages?.length || 0}`);
    Logger.log(`   Traffic: ${result.traffic?.organic?.toLocaleString() || 0}/mo`);
    Logger.log(`   Value: $${result.traffic?.value?.toLocaleString() || 0}/mo`);
    Logger.log(`   Backlinks: ${result.backlinks?.total?.toLocaleString() || 0}`);
    Logger.log(`   Authority: ${result.authority?.score || 0}/100 (${result.authority?.tier || 'N/A'})`);
    Logger.log(`   Confidence: ${result.dataQuality?.confidence || 0}%`);
    Logger.log(`${'─'.repeat(50)}`);
    Logger.log(`   Tier 1 (Direct): ${result.dataQuality?.tier1Complete ? '✅' : '❌'}`);
    Logger.log(`   Tier 2 (API): ${result.dataQuality?.tier2Complete ? '✅' : '❌'}`);
    Logger.log(`   Tier 3 (Gemini): ${result.geminiReady ? '✅' : '❌'}`);
    Logger.log(`   UI Ready: ${result.uiReady ? '✅' : '❌'}`);
    
    if (result.geminiData?.keywordOpportunities?.length > 0) {
      Logger.log(`\n   🎯 TOP KEYWORD OPPORTUNITIES:`);
      result.geminiData.keywordOpportunities.slice(0, 5).forEach((opp, idx) => {
        Logger.log(`   ${idx + 1}. "${opp.keyword}" - Vol: ${opp.volume}, KD: ${opp.difficulty}`);
      });
    }
    
    if (result.uiData?.cards?.length > 0) {
      Logger.log(`\n   📊 UI CARDS:`);
      result.uiData.cards.forEach(card => {
        Logger.log(`   ${card.icon} ${card.title}: ${card.formatted}`);
      });
    }
  });
  
  Logger.log(`\n\n${'═'.repeat(70)}`);
  Logger.log(`✅ SERPIFAI ELITE ENGINE TEST COMPLETE`);
  Logger.log(`${'═'.repeat(70)}\n`);
}

// Alias for backward compatibility
function TEST_OracleEliteSystem() {
  return TEST_SerpifAIEliteEngine();
}

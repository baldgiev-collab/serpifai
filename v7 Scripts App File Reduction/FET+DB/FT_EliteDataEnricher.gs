/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteDataEnricher.gs - SERPIFAI ELITE DATA ENRICHMENT ENGINE v1.1
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: NEVER show empty data fields. Always populate with best available data.
 * 
 * DATA SOURCE HIERARCHY:
 * 1. REAL API DATA - Serper, OpenPageRank (highest accuracy)
 * 2. FETCHER DATA - Oracle scrape, PHP backend
 * 3. GEMINI FORENSIC - Elite research prompts for estimation (TIME-BUDGETED)
 * 4. INTELLIGENT ESTIMATION - Algorithm-based estimates from available signals
 * 
 * V1.1 CHANGES:
 * - Added execution time budget checks before Gemini calls
 * - Added in-memory caching to prevent duplicate enrichment calls
 * - Fixed Gemini response parsing (.data instead of .content)
 * - Skip Gemini when < 120s remaining to prevent timeout
 * 
 * @author SerpifAI Engineering
 * @version 1.1
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// EXECUTION TIME MANAGEMENT & CACHING
// ═══════════════════════════════════════════════════════════════════════════════════

// Global execution start time (set by orchestrator or first call)
var ENRICHER_EXECUTION_START = ENRICHER_EXECUTION_START || Date.now();
var ENRICHER_EXECUTION_LIMIT = 300000; // 300 seconds (5 min safety margin before 6 min timeout)
var ENRICHER_GEMINI_THRESHOLD = 120000; // Skip Gemini if < 120s remaining

// In-memory cache to prevent duplicate calls within same execution
var ENRICHER_CACHE = ENRICHER_CACHE || {};

/**
 * Check if we have time budget for Gemini calls
 * @returns {boolean} True if we have enough time for Gemini calls
 */
function _hasTimeBudgetForGemini() {
  const elapsed = Date.now() - ENRICHER_EXECUTION_START;
  const remaining = ENRICHER_EXECUTION_LIMIT - elapsed;
  if (remaining < ENRICHER_GEMINI_THRESHOLD) {
    console.log(`   ⏱️ TIME BUDGET: ${Math.round(remaining/1000)}s remaining - SKIPPING Gemini enrichment`);
    return false;
  }
  return true;
}

/**
 * Get cached enrichment result if available
 */
function _getCachedEnrichment(domain, type) {
  const key = `${domain}:${type}`;
  return ENRICHER_CACHE[key] || null;
}

/**
 * Cache enrichment result
 */
function _setCachedEnrichment(domain, type, result) {
  const key = `${domain}:${type}`;
  ENRICHER_CACHE[key] = result;
}

/**
 * Reset execution timer (call at start of analysis)
 */
function resetEnricherTimer() {
  ENRICHER_EXECUTION_START = Date.now();
  ENRICHER_CACHE = {};
  console.log('⏱️ Enricher timer reset');
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ELITE DATA ENRICHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ELITE_ENRICHER_CONFIG = {
  // Data source priority weights (1.0 = highest confidence)
  DATA_SOURCE_CONFIDENCE: {
    API_SERPER: 0.95,
    API_OPENPAGERANK: 0.90,
    API_AHREFS: 0.98,
    FETCHER_ORACLE: 0.75,
    FETCHER_PHP: 0.80,
    GEMINI_RESEARCH: 0.70,
    ESTIMATION_ALGORITHM: 0.60
  },
  
  // Industry benchmarks for estimation
  INDUSTRY_BENCHMARKS: {
    // Backlink benchmarks by domain type
    BACKLINKS_PER_AUTHORITY: {
      LOW: { min: 50, max: 500 },      // DR < 30
      MEDIUM: { min: 500, max: 5000 }, // DR 30-60
      HIGH: { min: 5000, max: 50000 }, // DR 60-80
      ELITE: { min: 50000, max: 500000 } // DR 80+
    },
    
    // Keyword count by site profile
    KEYWORDS_BY_PROFILE: {
      'Emerging Player': { organic: 50, rankedTop10: 5, rankedTop100: 20 },
      'Growing Competitor': { organic: 500, rankedTop10: 25, rankedTop100: 150 },
      'Established Authority': { organic: 5000, rankedTop10: 200, rankedTop100: 1500 },
      'Market Leader': { organic: 50000, rankedTop10: 2000, rankedTop100: 15000 }
    },
    
    // Traffic estimation multipliers
    TRAFFIC_MULTIPLIERS: {
      TOP_1: 0.35,
      TOP_3: 0.15,
      TOP_10: 0.08,
      TOP_20: 0.03,
      TOP_50: 0.01
    },
    
    // CPC benchmarks by industry
    CPC_BENCHMARKS: {
      'saas': { avg: 12.50, high: 45.00 },
      'ecommerce': { avg: 1.50, high: 5.00 },
      'finance': { avg: 15.00, high: 75.00 },
      'healthcare': { avg: 8.00, high: 35.00 },
      'legal': { avg: 20.00, high: 100.00 },
      'technology': { avg: 8.00, high: 30.00 },
      'default': { avg: 3.50, high: 15.00 }
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ELITE KEYWORD ENRICHER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Enrich keyword data with multi-source approach
 * NEVER returns empty - always provides best estimate
 * V1.1: Added caching and time budget checks
 * 
 * @param {Object} comp - Competitor data object
 * @param {string} industry - Industry type for estimation
 * @returns {Object} Enriched keyword data with source indicators
 */
function FT_EnrichKeywordData(comp, industry = 'default') {
  const domain = comp.domain || 'unknown';
  console.log(`🎯 FT_EnrichKeywordData: Enriching keywords for ${domain}`);
  
  // V1.1: Check cache first to avoid duplicate calls
  const cached = _getCachedEnrichment(domain, 'keywords');
  if (cached) {
    console.log(`   💾 Using cached keyword enrichment for ${domain}`);
    return cached;
  }
  
  // Collect data from all sources
  const sources = {
    serper: extractSerperKeywords(comp),
    oracle: extractOracleKeywords(comp),
    fetcher: extractFetcherKeywords(comp)
  };
  
  // Check if we have real data from any source
  const hasRealData = sources.serper.hasData || sources.oracle.hasData || sources.fetcher.hasData;
  
  // Calculate total keyword count for estimation
  const estimatedKeywordCount = estimateKeywordCount(comp, industry);
  
  // Build enriched keywords with volume/traffic estimates
  let enrichedKeywords = [];
  let dataSource = 'Multiple Sources';
  let confidence = 0;
  
  if (sources.serper.hasData) {
    // Primary: Use Serper data (has volume/traffic)
    enrichedKeywords = sources.serper.keywords;
    dataSource = 'Serper API';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.API_SERPER;
  } else if (sources.oracle.hasData) {
    // Secondary: Oracle keywords + volume estimation
    enrichedKeywords = enrichKeywordsWithEstimates(sources.oracle.keywords, comp, industry);
    dataSource = 'Oracle Fetcher + Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.FETCHER_ORACLE;
  } else if (sources.fetcher.hasData) {
    // Tertiary: Fetcher keywords + volume estimation
    enrichedKeywords = enrichKeywordsWithEstimates(sources.fetcher.keywords, comp, industry);
    dataSource = 'PHP Fetcher + Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.FETCHER_PHP;
  } else if (_hasTimeBudgetForGemini()) {
    // V1.1: Only call Gemini if we have time budget
    console.log(`   📊 No real keyword data - using Gemini forensic research...`);
    const geminiKeywords = generateGeminiForensicKeywords(comp, industry);
    enrichedKeywords = geminiKeywords.keywords;
    dataSource = 'Gemini Forensic Research';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.GEMINI_RESEARCH;
  } else {
    // V1.1: No time for Gemini, go straight to algorithmic
    console.log(`   ⚡ Skipping Gemini - using fast algorithmic estimation`);
  }
  
  // Ensure we always have keywords
  if (enrichedKeywords.length === 0) {
    enrichedKeywords = generateAlgorithmicKeywords(comp, industry);
    dataSource = 'Algorithmic Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.ESTIMATION_ALGORITHM;
  }
  
  // Build the final enriched result
  const result = buildEnrichedKeywordResult(enrichedKeywords, {
    domain: domain,
    dataSource: dataSource,
    confidence: confidence,
    estimatedTotal: estimatedKeywordCount,
    industry: industry
  });
  
  // V1.1: Cache the result
  _setCachedEnrichment(domain, 'keywords', result);
  
  console.log(`   ✅ Enriched ${result.keywords.length} keywords (source: ${dataSource}, confidence: ${Math.round(confidence * 100)}%)`);
  
  return result;
  
  return result;
}

/**
 * Extract keywords from Serper API data
 */
function extractSerperKeywords(comp) {
  const serper = comp.stages?.serper?.data || comp.apiData?.serper || {};
  const organic = serper.organic || [];
  const related = serper.relatedSearches || [];
  const paa = serper.peopleAlsoAsk || [];
  
  const keywords = [];
  
  // Extract from organic results (has position data)
  organic.forEach((r, idx) => {
    if (r.title) {
      keywords.push({
        keyword: r.title,
        position: r.position || idx + 1,
        volume: r.searchVolume || estimateVolumeFromPosition(r.position || idx + 1),
        traffic: r.traffic || 0,
        cpc: r.cpc || 0,
        intent: detectIntent(r.title),
        difficulty: r.difficulty || estimateDifficulty(r.position || idx + 1),
        type: 'organic',
        source: 'serper'
      });
    }
  });
  
  // Extract from related searches
  related.forEach((r, idx) => {
    const query = typeof r === 'string' ? r : r.query;
    if (query) {
      keywords.push({
        keyword: query,
        position: null,
        volume: r.volume || estimateVolumeFromPosition(20 + idx),
        traffic: 0,
        cpc: 0,
        intent: detectIntent(query),
        difficulty: r.difficulty || 50,
        type: 'related',
        source: 'serper'
      });
    }
  });
  
  // Extract from PAA
  paa.forEach((q, idx) => {
    const question = typeof q === 'string' ? q : q.question;
    if (question) {
      keywords.push({
        keyword: question,
        position: null,
        volume: q.volume || 500,
        traffic: 0,
        cpc: 0,
        intent: 'informational',
        difficulty: 40,
        type: 'question',
        source: 'serper'
      });
    }
  });
  
  return {
    keywords: keywords,
    hasData: keywords.length > 0 && keywords.some(k => k.volume > 0)
  };
}

/**
 * Extract keywords from Oracle fetcher data
 */
function extractOracleKeywords(comp) {
  const oracleFetcher = comp.stages?.oracleFetcher?.data || {};
  const keywords = [];
  
  // H1 as primary keyword
  if (oracleFetcher.h1) {
    keywords.push({
      keyword: oracleFetcher.h1,
      position: null,
      volume: 0,
      traffic: 0,
      cpc: 0,
      intent: detectIntent(oracleFetcher.h1),
      difficulty: 0,
      type: 'primary',
      source: 'oracle'
    });
  }
  
  // Title as primary keyword
  if (oracleFetcher.title && oracleFetcher.title !== oracleFetcher.h1) {
    keywords.push({
      keyword: oracleFetcher.title,
      position: null,
      volume: 0,
      traffic: 0,
      cpc: 0,
      intent: detectIntent(oracleFetcher.title),
      difficulty: 0,
      type: 'primary',
      source: 'oracle'
    });
  }
  
  // H2s as semantic keywords
  (oracleFetcher.h2 || []).slice(0, 15).forEach(h2 => {
    keywords.push({
      keyword: h2,
      position: null,
      volume: 0,
      traffic: 0,
      cpc: 0,
      intent: detectIntent(h2),
      difficulty: 0,
      type: 'semantic',
      source: 'oracle'
    });
  });
  
  // H3s as long-tail keywords
  (oracleFetcher.h3 || []).slice(0, 10).forEach(h3 => {
    keywords.push({
      keyword: h3,
      position: null,
      volume: 0,
      traffic: 0,
      cpc: 0,
      intent: detectIntent(h3),
      difficulty: 0,
      type: 'longtail',
      source: 'oracle'
    });
  });
  
  return {
    keywords: keywords,
    hasData: keywords.length > 0
  };
}

/**
 * Extract keywords from PHP fetcher data
 */
function extractFetcherKeywords(comp) {
  const phpData = comp.stages?.phpFetcher?.data || comp.phpData || {};
  const keywords = [];
  
  // Extract meta keywords
  if (phpData.metaKeywords) {
    const metaKws = phpData.metaKeywords.split(',').map(k => k.trim()).filter(k => k);
    metaKws.forEach(kw => {
      keywords.push({
        keyword: kw,
        position: null,
        volume: 0,
        traffic: 0,
        cpc: 0,
        intent: detectIntent(kw),
        difficulty: 0,
        type: 'meta',
        source: 'php'
      });
    });
  }
  
  // Extract from content headings
  (phpData.headings || []).forEach(h => {
    keywords.push({
      keyword: h.text || h,
      position: null,
      volume: 0,
      traffic: 0,
      cpc: 0,
      intent: detectIntent(h.text || h),
      difficulty: 0,
      type: 'heading',
      source: 'php'
    });
  });
  
  return {
    keywords: keywords,
    hasData: keywords.length > 0
  };
}

/**
 * Enrich keywords with volume/traffic estimates based on domain signals
 */
function enrichKeywordsWithEstimates(keywords, comp, industry) {
  const domain = comp.domain || '';
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 
                   comp.tabData?.authority?.pageRank?.value || 3;
  const profile = detectCompetitorProfile(pageRank);
  const benchmarks = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.KEYWORDS_BY_PROFILE[profile];
  const cpcBenchmark = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS[industry] || 
                       ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS['default'];
  
  // Estimate position based on authority
  const estimatedPositions = estimatePositionDistribution(pageRank, keywords.length);
  
  return keywords.map((kw, idx) => {
    const position = estimatedPositions[idx] || 25;
    const volume = estimateVolumeFromKeyword(kw.keyword, industry);
    const ctr = getCTRForPosition(position);
    const traffic = Math.round(volume * ctr);
    const cpc = estimateCPC(kw.keyword, industry);
    const value = Math.round(traffic * cpc);
    
    return {
      ...kw,
      position: position,
      volume: volume,
      traffic: traffic,
      cpc: cpc,
      value: value,
      difficulty: estimateDifficulty(position),
      isEstimated: true
    };
  });
}

/**
 * Generate keywords using Gemini forensic research
 * V1.1: Fixed response parsing (.data not .content)
 */
function generateGeminiForensicKeywords(comp, industry) {
  const domain = comp.domain || 'unknown';
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 3;
  const title = comp.stages?.oracleFetcher?.data?.title || '';
  const metaDesc = comp.stages?.oracleFetcher?.data?.metaDescription || '';
  
  // Build forensic research prompt
  const prompt = buildGeminiKeywordResearchPrompt(domain, {
    pageRank: pageRank,
    title: title,
    metaDescription: metaDesc,
    industry: industry,
    h2Headings: comp.stages?.oracleFetcher?.data?.h2 || []
  });
  
  try {
    // Call Gemini API
    const geminiResult = callGateway('gemini:generate', {
      model: 'gemini-2.0-flash',
      prompt: prompt,
      options: {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: 'json'
      }
    });
    
    if (geminiResult && geminiResult.success) {
      // V1.1: Fix - gateway returns .data not .content
      const responseData = geminiResult.data || geminiResult.content || '';
      const parsed = parseGeminiKeywordResponse(responseData);
      return {
        keywords: parsed.keywords || [],
        hasData: (parsed.keywords || []).length > 0,
        source: 'gemini'
      };
    }
  } catch (e) {
    console.log(`   ⚠️ Gemini keyword research failed: ${e.message}`);
  }
  
  // Fallback to algorithmic
  return {
    keywords: [],
    hasData: false,
    source: 'none'
  };
}

/**
 * Build elite forensic keyword research prompt
 */
function buildGeminiKeywordResearchPrompt(domain, context) {
  return `
🔍 FORENSIC KEYWORD RESEARCH REQUEST

You are an elite SEO intelligence analyst. Perform deep forensic research to identify the most likely keywords that ${domain} is ranking for.

AVAILABLE CONTEXT:
- Domain: ${domain}
- Page Title: ${context.title || 'Unknown'}
- Meta Description: ${context.metaDescription || 'Unknown'}
- Domain Authority (PageRank): ${context.pageRank}/10
- Industry: ${context.industry}
- Page Headings: ${(context.h2Headings || []).slice(0, 5).join(', ') || 'None scraped'}

YOUR RESEARCH MISSION:
Based on the domain name, title, meta description, and industry context, reverse-engineer the most probable keyword targets.

ANALYSIS FRAMEWORK:
1. Domain name keyword signals
2. Title keyword targeting patterns
3. Meta description intent signals
4. Industry-standard keyword patterns
5. Competitor keyword estimation based on authority level

OUTPUT FORMAT (JSON):
{
  "keywords": [
    {
      "keyword": "primary target keyword",
      "position": 5,
      "volume": 12000,
      "traffic": 480,
      "cpc": 8.50,
      "intent": "transactional",
      "difficulty": 65,
      "type": "primary",
      "reasoning": "Why this keyword fits the domain"
    }
  ],
  "industry": "${context.industry}",
  "competitorProfile": "Based on DR ${context.pageRank}"
}

Generate 15-25 realistic keywords with estimated metrics based on:
- Authority level (DR ${context.pageRank} = typical position range)
- Industry benchmarks for search volume
- Standard CTR models for traffic estimation
- Industry CPC averages

Be specific and realistic. Use actual keyword research logic.
`;
}

/**
 * Parse Gemini keyword research response
 */
function parseGeminiKeywordResponse(content) {
  try {
    // Try to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.log('Gemini keyword parse error: ' + e.message);
  }
  return { keywords: [] };
}

/**
 * Generate algorithmic keywords when all else fails
 */
function generateAlgorithmicKeywords(comp, industry) {
  const domain = comp.domain || 'unknown';
  const domainWords = extractDomainWords(domain);
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 3;
  const cpcBenchmark = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS[industry] || 
                       ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS['default'];
  
  const keywords = [];
  
  // Generate primary keywords from domain
  domainWords.forEach((word, idx) => {
    if (word.length > 2) {
      const volume = estimateVolumeFromKeyword(word, industry);
      const position = Math.min(10, pageRank) + idx * 3;
      const ctr = getCTRForPosition(position);
      const traffic = Math.round(volume * ctr);
      
      keywords.push({
        keyword: word,
        position: position,
        volume: volume,
        traffic: traffic,
        cpc: cpcBenchmark.avg,
        value: Math.round(traffic * cpcBenchmark.avg),
        intent: 'commercial',
        difficulty: 50 + (10 - pageRank) * 3,
        type: 'primary',
        source: 'algorithm',
        isEstimated: true
      });
    }
  });
  
  // Add common industry keywords
  const industryKeywords = getIndustryKeywords(industry);
  industryKeywords.forEach((kw, idx) => {
    const volume = estimateVolumeFromKeyword(kw.keyword, industry);
    const position = 15 + idx * 5;
    const ctr = getCTRForPosition(position);
    const traffic = Math.round(volume * ctr);
    
    keywords.push({
      keyword: domainWords[0] + ' ' + kw.keyword,
      position: position,
      volume: volume,
      traffic: traffic,
      cpc: cpcBenchmark.avg * kw.cpcMultiplier,
      value: Math.round(traffic * cpcBenchmark.avg * kw.cpcMultiplier),
      intent: kw.intent,
      difficulty: kw.difficulty,
      type: 'secondary',
      source: 'algorithm',
      isEstimated: true
    });
  });
  
  return keywords;
}

/**
 * Build enriched keyword result object
 */
function buildEnrichedKeywordResult(keywords, meta) {
  // Sort by traffic/volume
  const sorted = keywords.sort((a, b) => (b.traffic || b.volume || 0) - (a.traffic || a.volume || 0));
  
  // Calculate totals
  const totalVolume = sorted.reduce((sum, k) => sum + (k.volume || 0), 0);
  const totalTraffic = sorted.reduce((sum, k) => sum + (k.traffic || 0), 0);
  const totalValue = sorted.reduce((sum, k) => sum + (k.value || 0), 0);
  
  // Group by type
  const breakdown = {
    primary: sorted.filter(k => k.type === 'primary' || k.type === 'organic').slice(0, 20),
    semantic: sorted.filter(k => k.type === 'semantic' || k.type === 'related').slice(0, 30),
    longtail: sorted.filter(k => k.type === 'longtail' || (k.keyword || '').split(' ').length > 3).slice(0, 40),
    secondary: sorted.filter(k => k.type === 'secondary' || k.type === 'heading').slice(0, 30),
    questions: sorted.filter(k => k.type === 'question' || (k.keyword || '').includes('?')).slice(0, 20)
  };
  
  // Intent distribution
  const intentDist = {
    informational: sorted.filter(k => k.intent === 'informational').length,
    commercial: sorted.filter(k => k.intent === 'commercial').length,
    transactional: sorted.filter(k => k.intent === 'transactional').length,
    navigational: sorted.filter(k => k.intent === 'navigational').length
  };
  
  // Position distribution
  const posDist = {
    top3: sorted.filter(k => k.position && k.position <= 3).length,
    top10: sorted.filter(k => k.position && k.position > 3 && k.position <= 10).length,
    top20: sorted.filter(k => k.position && k.position > 10 && k.position <= 20).length,
    top50: sorted.filter(k => k.position && k.position > 20 && k.position <= 50).length,
    beyond: sorted.filter(k => k.position && k.position > 50).length
  };
  
  return {
    keywords: sorted,
    topKeywords: sorted.slice(0, 30),
    breakdown: breakdown,
    
    // Metrics
    totalKeywords: sorted.length,
    estimatedTotal: meta.estimatedTotal,
    totalVolume: totalVolume,
    totalTraffic: totalTraffic,
    totalValue: totalValue,
    
    // Distributions
    intentDistribution: intentDist,
    positionDistribution: posDist,
    
    // Source info
    dataSource: meta.dataSource,
    confidence: meta.confidence,
    domain: meta.domain,
    industry: meta.industry,
    
    // Always has data flag
    hasData: true,
    isEmpty: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: ELITE BACKLINK ENRICHER  
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Enrich backlink data with multi-source approach
 * NEVER returns empty - always provides best estimate
 * V1.1: Added caching and time budget checks
 * 
 * @param {Object} comp - Competitor data object
 * @param {string} industry - Industry type for estimation
 * @returns {Object} Enriched backlink data with source indicators
 */
function FT_EnrichBacklinkData(comp, industry = 'default') {
  const domain = comp.domain || 'unknown';
  console.log(`🔗 FT_EnrichBacklinkData: Enriching backlinks for ${domain}`);
  
  // V1.1: Check cache first to avoid duplicate calls
  const cached = _getCachedEnrichment(domain, 'backlinks');
  if (cached) {
    console.log(`   💾 Using cached backlink enrichment for ${domain}`);
    return cached;
  }
  
  // Get domain authority metrics
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 
                   comp.tabData?.authority?.pageRank?.value || 3;
  
  // Collect from all sources
  const sources = {
    api: extractAPIBacklinks(comp),
    oracle: extractOracleBacklinks(comp),
    fetcher: extractFetcherBacklinks(comp)
  };
  
  // Check what data we have
  const hasRealData = sources.api.hasData || sources.oracle.hasData || sources.fetcher.hasData;
  
  let backlinks = [];
  let referrers = [];
  let dataSource = 'Multiple Sources';
  let confidence = 0;
  
  if (sources.api.hasData) {
    // Primary: Use API data
    backlinks = sources.api.backlinks;
    referrers = sources.api.referrers;
    dataSource = 'Backlink API';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.API_SERPER;
  } else if (sources.oracle.hasData) {
    // Secondary: Use Oracle external links
    backlinks = enrichBacklinksWithEstimates(sources.oracle.backlinks, pageRank);
    referrers = generateReferrerEstimates(domain, pageRank, industry);
    dataSource = 'Oracle Fetcher + Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.FETCHER_ORACLE;
  } else if (sources.fetcher.hasData) {
    // Tertiary: Use PHP fetcher data
    backlinks = enrichBacklinksWithEstimates(sources.fetcher.backlinks, pageRank);
    referrers = generateReferrerEstimates(domain, pageRank, industry);
    dataSource = 'PHP Fetcher + Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.FETCHER_PHP;
  } else if (_hasTimeBudgetForGemini()) {
    // V1.1: Only call Gemini if we have time budget
    console.log(`   📊 No real backlink data - using Gemini forensic research...`);
    const geminiBacklinks = generateGeminiForensicBacklinks(comp, industry);
    backlinks = geminiBacklinks.backlinks;
    referrers = geminiBacklinks.referrers;
    dataSource = 'Gemini Forensic Research';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.GEMINI_RESEARCH;
  } else {
    // V1.1: No time for Gemini, skip to algorithmic
    console.log(`   ⚡ Skipping Gemini - using fast algorithmic estimation`);
  }
  
  // Ensure we always have data
  if (backlinks.length === 0 && referrers.length === 0) {
    const estimated = generateAlgorithmicBacklinks(domain, pageRank, industry);
    backlinks = estimated.backlinks;
    referrers = estimated.referrers;
    dataSource = 'Algorithmic Estimation';
    confidence = ELITE_ENRICHER_CONFIG.DATA_SOURCE_CONFIDENCE.ESTIMATION_ALGORITHM;
  }
  
  // Build final result
  const result = buildEnrichedBacklinkResult(backlinks, referrers, {
    domain: domain,
    pageRank: pageRank,
    dataSource: dataSource,
    confidence: confidence,
    industry: industry
  });
  
  // V1.1: Cache the result
  _setCachedEnrichment(domain, 'backlinks', result);
  
  console.log(`   ✅ Enriched ${result.total} backlinks from ${result.refDomains} domains (source: ${dataSource})`);
  
  return result;
}

/**
 * Extract backlinks from API data (Serper mentions, OpenPageRank)
 */
function extractAPIBacklinks(comp) {
  const serper = comp.stages?.serper?.data || comp.apiData?.serper || {};
  const mentions = serper.mentions || [];
  const oprData = comp.stages?.openPageRank?.data || {};
  
  const backlinks = mentions.map(m => ({
    url: m.link || m.url,
    domain: extractDomainFromUrl(m.link || m.url),
    dr: estimateDRFromDomain(extractDomainFromUrl(m.link || m.url)),
    type: classifyBacklinkType(m.link || m.url),
    anchor: m.title || '',
    dofollow: true,
    source: 'serper'
  }));
  
  return {
    backlinks: backlinks,
    referrers: [],
    hasData: backlinks.length > 0
  };
}

/**
 * Extract backlinks from Oracle external links
 */
function extractOracleBacklinks(comp) {
  const oracleData = comp.stages?.oracleFetcher?.data || {};
  const externalLinks = oracleData.externalLinks || [];
  
  const backlinks = externalLinks.map(link => {
    const url = typeof link === 'string' ? link : link.url;
    return {
      url: url,
      domain: extractDomainFromUrl(url),
      dr: 0,
      type: classifyBacklinkType(url),
      anchor: '',
      dofollow: true,
      source: 'oracle'
    };
  });
  
  return {
    backlinks: backlinks,
    referrers: [],
    hasData: backlinks.length > 0
  };
}

/**
 * Extract backlinks from PHP fetcher
 */
function extractFetcherBacklinks(comp) {
  const phpData = comp.stages?.phpFetcher?.data || comp.phpData || {};
  const links = phpData.externalLinks || phpData.outboundLinks || [];
  
  const backlinks = links.map(link => {
    const url = typeof link === 'string' ? link : link.url;
    return {
      url: url,
      domain: extractDomainFromUrl(url),
      dr: 0,
      type: classifyBacklinkType(url),
      anchor: link.anchor || '',
      dofollow: link.dofollow !== false,
      source: 'php'
    };
  });
  
  return {
    backlinks: backlinks,
    referrers: [],
    hasData: backlinks.length > 0
  };
}

/**
 * Enrich backlinks with DR estimates
 */
function enrichBacklinksWithEstimates(backlinks, pageRank) {
  return backlinks.map(bl => ({
    ...bl,
    dr: bl.dr || estimateDRFromDomain(bl.domain),
    isEstimated: true
  }));
}

/**
 * Generate referring domain estimates based on authority
 */
function generateReferrerEstimates(domain, pageRank, industry) {
  const profile = detectCompetitorProfile(pageRank);
  const benchmarks = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.BACKLINKS_PER_AUTHORITY;
  const range = benchmarks[profile === 'Market Leader' ? 'ELITE' : 
                           profile === 'Established Authority' ? 'HIGH' :
                           profile === 'Growing Competitor' ? 'MEDIUM' : 'LOW'];
  
  // Generate realistic referring domains based on industry
  const industryReferrers = getIndustryReferrers(industry);
  
  return industryReferrers.map((ref, idx) => ({
    domain: ref.domain,
    backlinks: Math.round((range.max - range.min) * ref.share / 100),
    dr: ref.dr,
    type: ref.type,
    isEstimated: true
  }));
}

/**
 * Generate backlinks using Gemini forensic research
 * V1.1: Fixed response parsing (.data not .content)
 */
function generateGeminiForensicBacklinks(comp, industry) {
  const domain = comp.domain || 'unknown';
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 3;
  
  const prompt = buildGeminiBacklinkResearchPrompt(domain, {
    pageRank: pageRank,
    industry: industry
  });
  
  try {
    const geminiResult = callGateway('gemini:generate', {
      model: 'gemini-2.0-flash',
      prompt: prompt,
      options: {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: 'json'
      }
    });
    
    if (geminiResult && geminiResult.success) {
      // V1.1: Fix - gateway returns .data not .content
      const responseData = geminiResult.data || geminiResult.content || '';
      const parsed = parseGeminiBacklinkResponse(responseData);
      return {
        backlinks: parsed.backlinks || [],
        referrers: parsed.referrers || [],
        hasData: (parsed.backlinks || []).length > 0 || (parsed.referrers || []).length > 0
      };
    }
  } catch (e) {
    console.log(`   ⚠️ Gemini backlink research failed: ${e.message}`);
  }
  
  return { backlinks: [], referrers: [], hasData: false };
}

/**
 * Build Gemini forensic backlink research prompt
 */
function buildGeminiBacklinkResearchPrompt(domain, context) {
  return `
🔍 FORENSIC BACKLINK RESEARCH REQUEST

You are an elite SEO intelligence analyst. Perform deep forensic research to estimate the backlink profile of ${domain}.

AVAILABLE CONTEXT:
- Domain: ${domain}
- Domain Authority (PageRank): ${context.pageRank}/10
- Industry: ${context.industry}

YOUR RESEARCH MISSION:
Based on the domain authority, industry, and typical link building patterns, estimate the most likely backlink sources and profile.

ANALYSIS FRAMEWORK:
1. Authority level indicates backlink quantity range
2. Industry determines typical referrer types
3. Domain name suggests brand/product focus
4. Competitor linking patterns in this space

OUTPUT FORMAT (JSON):
{
  "backlinks": [
    {
      "domain": "referrer.com",
      "dr": 65,
      "type": "editorial",
      "reason": "Why this source would link"
    }
  ],
  "referrers": [
    {
      "domain": "industry-publication.com",
      "backlinks": 150,
      "dr": 78,
      "type": "Editorial",
      "reason": "Industry coverage"
    }
  ],
  "totalEstimate": 15000,
  "refDomainsEstimate": 500,
  "dofollowRatio": 75,
  "avgDR": 45
}

Generate 15-25 realistic referring domains with metrics based on:
- Authority level (DR ${context.pageRank} = typical referrer profile)
- Industry link patterns
- Standard distribution of link types

Be specific and realistic.
`;
}

/**
 * Parse Gemini backlink response
 */
function parseGeminiBacklinkResponse(content) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.log('Gemini backlink parse error: ' + e.message);
  }
  return { backlinks: [], referrers: [] };
}

/**
 * Generate algorithmic backlinks when all else fails
 */
function generateAlgorithmicBacklinks(domain, pageRank, industry) {
  const profile = detectCompetitorProfile(pageRank);
  const benchmarks = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.BACKLINKS_PER_AUTHORITY;
  const range = benchmarks[profile === 'Market Leader' ? 'ELITE' : 
                           profile === 'Established Authority' ? 'HIGH' :
                           profile === 'Growing Competitor' ? 'MEDIUM' : 'LOW'];
  
  const totalBacklinks = Math.round(range.min + (range.max - range.min) * (pageRank / 10));
  const refDomains = Math.round(totalBacklinks * 0.15); // ~15% unique domains
  
  // Generate realistic referrer distribution
  const referrers = getIndustryReferrers(industry).map((ref, idx) => ({
    domain: ref.domain,
    backlinks: Math.round(totalBacklinks * ref.share / 100),
    dr: ref.dr,
    type: ref.type,
    isEstimated: true
  }));
  
  return {
    backlinks: [],
    referrers: referrers,
    total: totalBacklinks,
    refDomains: refDomains
  };
}

/**
 * Build enriched backlink result object
 */
function buildEnrichedBacklinkResult(backlinks, referrers, meta) {
  const pageRank = meta.pageRank || 3;
  const profile = detectCompetitorProfile(pageRank);
  const benchmarks = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.BACKLINKS_PER_AUTHORITY;
  const range = benchmarks[profile === 'Market Leader' ? 'ELITE' : 
                           profile === 'Established Authority' ? 'HIGH' :
                           profile === 'Growing Competitor' ? 'MEDIUM' : 'LOW'];
  
  const totalBacklinks = backlinks.length > 0 ? backlinks.length * 10 : 
                         Math.round(range.min + (range.max - range.min) * (pageRank / 10));
  const refDomains = referrers.length > 0 ? referrers.length : Math.round(totalBacklinks * 0.15);
  const avgDR = referrers.length > 0 ? 
                Math.round(referrers.reduce((sum, r) => sum + (r.dr || 0), 0) / referrers.length) : 
                25 + pageRank * 5;
  
  return {
    // Summary
    total: totalBacklinks,
    refDomains: refDomains,
    dofollow: 75 + Math.round(pageRank * 2),
    avgDR: avgDR,
    
    // Top referrers
    topReferrers: referrers.slice(0, 15),
    
    // Anchor distribution (estimated)
    anchorDistribution: {
      branded: { percent: 30 + pageRank * 2, example: extractDomainWords(meta.domain)[0] || 'brand' },
      exactMatch: { percent: 10, example: 'target keyword' },
      partialMatch: { percent: 20, example: 'related phrase' },
      generic: { percent: 25 - pageRank, example: 'click here' },
      nakedUrl: { percent: 15, example: 'https://' + meta.domain }
    },
    
    // Link types
    linkTypes: {
      editorial: Math.round(refDomains * 0.35),
      resource: Math.round(refDomains * 0.25),
      directory: Math.round(refDomains * 0.15),
      social: Math.round(refDomains * 0.15),
      other: Math.round(refDomains * 0.10)
    },
    
    // Source info
    dataSource: meta.dataSource,
    confidence: meta.confidence,
    domain: meta.domain,
    
    // Always has data
    hasData: true,
    isEmpty: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Detect search intent from keyword
 */
function detectIntent(keyword) {
  if (!keyword) return 'informational';
  const kw = keyword.toLowerCase();
  
  if (/buy|price|cheap|deal|discount|order|purchase|shop/.test(kw)) return 'transactional';
  if (/best|top|review|compare|vs|alternative/.test(kw)) return 'commercial';
  if (/login|sign in|dashboard|account/.test(kw)) return 'navigational';
  return 'informational';
}

/**
 * Estimate volume from keyword
 */
function estimateVolumeFromKeyword(keyword, industry) {
  if (!keyword) return 100;
  const wordCount = keyword.split(' ').length;
  const cpcBenchmark = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS[industry] || 
                       ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS['default'];
  
  // Longer keywords = lower volume
  const baseVolume = wordCount <= 2 ? 5000 : wordCount <= 3 ? 1500 : wordCount <= 4 ? 500 : 150;
  
  // Add variance
  return Math.round(baseVolume * (0.7 + Math.random() * 0.6));
}

/**
 * Estimate volume from position
 */
function estimateVolumeFromPosition(position) {
  const baseVolumes = [50000, 30000, 20000, 15000, 10000, 8000, 6000, 5000, 4000, 3500];
  if (position <= 10) return baseVolumes[position - 1] || 3000;
  if (position <= 20) return 2000;
  if (position <= 50) return 500;
  return 100;
}

/**
 * Get CTR for position (2026 model)
 */
function getCTRForPosition(position) {
  const ctrs = [0.35, 0.18, 0.12, 0.08, 0.065, 0.05, 0.04, 0.035, 0.03, 0.028];
  if (position <= 10) return ctrs[position - 1] || 0.025;
  if (position <= 20) return 0.015;
  if (position <= 50) return 0.005;
  return 0.001;
}

/**
 * Estimate CPC from keyword
 */
function estimateCPC(keyword, industry) {
  const cpcBenchmark = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS[industry] || 
                       ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.CPC_BENCHMARKS['default'];
  
  // Commercial intent = higher CPC
  const intent = detectIntent(keyword);
  const multiplier = intent === 'transactional' ? 1.5 : intent === 'commercial' ? 1.2 : 0.8;
  
  return Math.round(cpcBenchmark.avg * multiplier * 100) / 100;
}

/**
 * Estimate difficulty from position
 */
function estimateDifficulty(position) {
  if (position <= 3) return 75 + Math.round(Math.random() * 15);
  if (position <= 10) return 55 + Math.round(Math.random() * 15);
  if (position <= 20) return 40 + Math.round(Math.random() * 15);
  return 25 + Math.round(Math.random() * 15);
}

/**
 * Estimate position distribution based on authority
 */
function estimatePositionDistribution(pageRank, count) {
  const positions = [];
  const basePosition = Math.max(1, 15 - pageRank * 1.5);
  
  for (let i = 0; i < count; i++) {
    const position = Math.round(basePosition + i * 2 + Math.random() * 10);
    positions.push(Math.max(1, Math.min(100, position)));
  }
  
  return positions.sort((a, b) => a - b);
}

/**
 * Estimate keyword count based on authority
 */
function estimateKeywordCount(comp, industry) {
  const pageRank = comp.stages?.openPageRank?.data?.pageRank || 3;
  const profile = detectCompetitorProfile(pageRank);
  const benchmarks = ELITE_ENRICHER_CONFIG.INDUSTRY_BENCHMARKS.KEYWORDS_BY_PROFILE[profile];
  return benchmarks.organic;
}

/**
 * Detect competitor profile from PageRank
 */
function detectCompetitorProfile(pageRank) {
  if (pageRank >= 7) return 'Market Leader';
  if (pageRank >= 5) return 'Established Authority';
  if (pageRank >= 3) return 'Growing Competitor';
  return 'Emerging Player';
}

/**
 * Extract domain words from domain name
 */
function extractDomainWords(domain) {
  if (!domain) return [];
  return domain
    .replace(/\.(com|org|net|io|co|ai|app|dev|tech)$/i, '')
    .split(/[-_.]/)
    .filter(w => w.length > 2);
}

/**
 * Extract domain from URL
 */
function extractDomainFromUrl(url) {
  if (!url) return '';
  try {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1] : url;
  } catch (e) {
    return url;
  }
}

/**
 * Estimate DR from domain name (heuristic)
 */
function estimateDRFromDomain(domain) {
  if (!domain) return 30;
  
  // High authority patterns
  if (/wikipedia|github|medium|linkedin|forbes|techcrunch|bbc|nytimes|wsj/i.test(domain)) return 90;
  if (/\.edu|\.gov/i.test(domain)) return 80;
  if (/blog|wordpress|tumblr|wix|squarespace/i.test(domain)) return 35;
  
  // Default mid-range
  return 40 + Math.round(Math.random() * 20);
}

/**
 * Classify backlink type
 */
function classifyBacklinkType(url) {
  if (!url) return 'Other';
  const lower = url.toLowerCase();
  
  if (/blog|article|news|post/i.test(lower)) return 'Editorial';
  if (/forum|discussion|community/i.test(lower)) return 'Forum';
  if (/directory|listing|catalog/i.test(lower)) return 'Directory';
  if (/facebook|twitter|linkedin|reddit|pinterest/i.test(lower)) return 'Social';
  if (/profile|about|user|member/i.test(lower)) return 'Profile';
  if (/resource|tool|guide/i.test(lower)) return 'Resource';
  
  return 'Other';
}

/**
 * Get industry-specific keyword patterns
 */
function getIndustryKeywords(industry) {
  const patterns = {
    'saas': [
      { keyword: 'software', intent: 'commercial', difficulty: 70, cpcMultiplier: 1.5 },
      { keyword: 'pricing', intent: 'transactional', difficulty: 60, cpcMultiplier: 2.0 },
      { keyword: 'alternative', intent: 'commercial', difficulty: 55, cpcMultiplier: 1.8 },
      { keyword: 'review', intent: 'commercial', difficulty: 50, cpcMultiplier: 1.3 },
      { keyword: 'vs', intent: 'commercial', difficulty: 45, cpcMultiplier: 1.4 }
    ],
    'ecommerce': [
      { keyword: 'buy', intent: 'transactional', difficulty: 65, cpcMultiplier: 1.8 },
      { keyword: 'cheap', intent: 'transactional', difficulty: 50, cpcMultiplier: 1.2 },
      { keyword: 'best', intent: 'commercial', difficulty: 55, cpcMultiplier: 1.5 },
      { keyword: 'reviews', intent: 'commercial', difficulty: 45, cpcMultiplier: 1.0 }
    ],
    'default': [
      { keyword: 'best', intent: 'commercial', difficulty: 55, cpcMultiplier: 1.3 },
      { keyword: 'how to', intent: 'informational', difficulty: 40, cpcMultiplier: 0.8 },
      { keyword: 'guide', intent: 'informational', difficulty: 45, cpcMultiplier: 0.9 },
      { keyword: 'services', intent: 'commercial', difficulty: 50, cpcMultiplier: 1.5 }
    ]
  };
  
  return patterns[industry] || patterns['default'];
}

/**
 * Get industry-specific referrer patterns
 */
function getIndustryReferrers(industry) {
  const patterns = {
    'saas': [
      { domain: 'g2.com', dr: 92, type: 'Review', share: 5 },
      { domain: 'capterra.com', dr: 91, type: 'Directory', share: 4 },
      { domain: 'producthunt.com', dr: 89, type: 'Directory', share: 3 },
      { domain: 'techcrunch.com', dr: 94, type: 'Editorial', share: 2 },
      { domain: 'medium.com', dr: 96, type: 'Content', share: 8 },
      { domain: 'linkedin.com', dr: 99, type: 'Social', share: 6 },
      { domain: 'twitter.com', dr: 94, type: 'Social', share: 5 },
      { domain: 'youtube.com', dr: 100, type: 'Video', share: 4 }
    ],
    'ecommerce': [
      { domain: 'amazon.com', dr: 96, type: 'Marketplace', share: 3 },
      { domain: 'pinterest.com', dr: 94, type: 'Social', share: 5 },
      { domain: 'instagram.com', dr: 99, type: 'Social', share: 6 },
      { domain: 'facebook.com', dr: 100, type: 'Social', share: 7 },
      { domain: 'youtube.com', dr: 100, type: 'Video', share: 5 }
    ],
    'default': [
      { domain: 'medium.com', dr: 96, type: 'Content', share: 6 },
      { domain: 'linkedin.com', dr: 99, type: 'Social', share: 5 },
      { domain: 'twitter.com', dr: 94, type: 'Social', share: 4 },
      { domain: 'youtube.com', dr: 100, type: 'Video', share: 4 },
      { domain: 'reddit.com', dr: 97, type: 'Social', share: 3 },
      { domain: 'quora.com', dr: 93, type: 'Q&A', share: 3 },
      { domain: 'facebook.com', dr: 100, type: 'Social', share: 5 }
    ]
  };
  
  return patterns[industry] || patterns['default'];
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

// Make functions globally available
if (typeof module !== 'undefined') {
  module.exports = {
    FT_EnrichKeywordData,
    FT_EnrichBacklinkData,
    ELITE_ENRICHER_CONFIG
  };
}

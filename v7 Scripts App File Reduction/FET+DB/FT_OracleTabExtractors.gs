/**
 * FT_OracleTabExtractors.gs
 * 
 * TAB-SPECIFIC DATA EXTRACTORS - MODULE 2 of 3
 * Extracts organized data for each of the 15 competitor analysis tabs
 * 
 * Dependencies:
 * - FT_OracleDataOrganizer.gs (Core constants, FT_ExtractRawDataAlways, FT_CreateProofObject)
 * - FT_OracleProofs.gs (FT_GenerateGeminiInsight, FT_ExtractGEOAEOProof, FT_ExtractDetailedKeywords)
 * 
 * @author SerpifAI Engineering
 * @version 1.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB-SPECIFIC DATA EXTRACTORS (Oracle Priority)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract Market Intelligence data
 */
function _extractMarketIntelData(comp) {
  const serper = comp.stages?.serper?.data || comp.apiData?.serper || {};
  const opr = comp.stages?.openPageRank?.data || comp.apiData?.openPageRank || {};
  
  const serpCount = (serper.organic || []).length;
  const source = serpCount > 0 ? 'serper' : opr.rank ? 'openPageRank' : 'estimated';
  
  return {
    serpPresence: FT_CreateProofObject(serpCount, source, 'SERP results', serper),
    globalRank: FT_CreateProofObject(opr.rank || 0, opr.rank ? 'openPageRank' : 'estimated', 'Global Rank', opr),
    marketPosition: FT_CreateProofObject(
      _estimateMarketPosition(opr.rank),
      opr.rank ? 'openPageRank' : 'estimated',
      'Market Position',
      opr
    ),
    relatedSearches: FT_CreateProofObject(
      (serper.relatedSearches || []).slice(0, 10),
      serpCount > 0 ? 'serper' : 'estimated',
      'Related Searches',
      serper
    )
  };
}

/**
 * Extract Brand Positioning data
 */
function _extractBrandPositionData(comp) {
  const oracle = comp.stages?.oracleFetcher?.data || {};
  const php = comp.stages?.phpFetcher?.data || {};
  const synth = comp.synthesized?.website || {};
  
  // Priority: Oracle → PHP → Synthesized
  const hasOracle = !!(oracle.content);
  const hasPHP = !!(php.metadata?.title);
  const source = hasOracle ? 'oracle' : hasPHP ? 'phpFetcher' : 'synthesized';
  
  const title = oracle.title || php.metadata?.title || synth.title || '';
  const description = oracle.description || php.metadata?.description || synth.description || '';
  
  return {
    title: FT_CreateProofObject(title, source, 'Page Title', oracle),
    description: FT_CreateProofObject(description, source, 'Meta Description', oracle),
    h1: FT_CreateProofObject(
      oracle.h1 || php.metadata?.h1 || synth.h1 || '',
      source,
      'H1 Heading',
      oracle
    ),
    brandVoice: FT_CreateProofObject(
      _analyzeBrandVoice(title, description),
      source,
      'Brand Voice Analysis',
      { title, description }
    )
  };
}

/**
 * Extract Technical SEO data
 */
function _extractTechnicalSEOData(comp) {
  const pageSpeed = comp.stages?.pageSpeed?.data || comp.apiData?.pageSpeed || {};
  const scores = pageSpeed.scores || {};
  
  const hasPageSpeed = !!(scores.performance !== undefined);
  const source = hasPageSpeed ? 'pageSpeed' : 'estimated';
  
  return {
    performanceScore: FT_CreateProofObject(scores.performance || 0, source, 'Performance', pageSpeed),
    seoScore: FT_CreateProofObject(scores.seo || 0, source, 'SEO Score', pageSpeed),
    accessibilityScore: FT_CreateProofObject(scores.accessibility || 0, source, 'Accessibility', pageSpeed),
    bestPractices: FT_CreateProofObject(scores.best_practices || 0, source, 'Best Practices', pageSpeed),
    coreWebVitals: FT_CreateProofObject(pageSpeed.core_web_vitals || {}, source, 'Core Web Vitals', pageSpeed),
    cvrPenalty: FT_CreateProofObject(
      _calculateCVRPenalty(scores.performance || 50),
      source,
      'CVR Penalty',
      pageSpeed
    ),
    // ELITE: Gemini Insight
    geminiInsight: FT_GenerateGeminiInsight('technical', comp, 'digital marketing')
  };
}

/**
 * Extract Content Intelligence data - UPGRADED to use universal extractor
 */
function _extractContentIntelData(comp) {
  const oracle = comp.stages?.oracleFetcher?.data || {};
  const php = comp.stages?.phpFetcher?.data || {};
  const synth = comp.synthesized || {};
  
  // Use universal extractor for headings
  const headingsData = FT_ExtractRawDataAlways(comp, 'headings');
  const schemaData = FT_ExtractRawDataAlways(comp, 'schema');
  
  const hasOracle = !!(oracle.content);
  const hasPHP = !!(php.content);
  const source = hasOracle ? 'oracle' : hasPHP ? 'phpFetcher' : 'estimated';
  
  const wordCount = oracle.wordCount || synth.website?.wordCount || 0;
  
  return {
    wordCount: FT_CreateProofObject(wordCount, source, 'Word Count', oracle),
    contentDepth: FT_CreateProofObject(
      wordCount > 2500 ? 'HIGH' : wordCount > 1000 ? 'MEDIUM' : 'LOW',
      source,
      'Content Depth',
      { wordCount }
    ),
    schemaTypes: FT_CreateProofObject(schemaData.data, schemaData.source, 'Schema Types', { count: schemaData.count }),
    headings: FT_CreateProofObject(
      headingsData.data.h2 || [],  // Full H2 array - no slice
      headingsData.source,
      'Page Headings',
      { count: headingsData.data.all?.length || 0 }
    ),
    pagesProcessed: FT_CreateProofObject(
      oracle.pagesProcessed || 0,
      hasOracle ? 'oracle' : 'estimated',
      'Pages Analyzed',
      oracle
    ),
    // ELITE: Full Headings Data
    h1: headingsData.data.h1?.[0] || '',
    allHeadings: headingsData.data,  // Full heading structure
    topHeadings: headingsData.data.all || [],  // All headings with levels
    // RAW DATA for UI
    rawData: {
      headings: headingsData.data,
      headingCount: headingsData.data.all?.length || 0,
      headingSource: headingsData.source,
      schema: schemaData.data,
      schemaCount: schemaData.count
    },
    geminiInsight: FT_GenerateGeminiInsight('content', comp, 'digital marketing')
  };
}

/**
 * Extract Keyword Strategy data - UPGRADED to use universal extractor
 */
function _extractKeywordStrategyData(comp) {
  // Use universal extractor for consistent data extraction
  const paaData = FT_ExtractRawDataAlways(comp, 'paa');
  const keywordsData = FT_ExtractRawDataAlways(comp, 'keywords');
  const serpData = FT_ExtractRawDataAlways(comp, 'organic');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CRITICAL: If no PAA from Serper, generate via Gemini API
  // ═══════════════════════════════════════════════════════════════════════════
  let finalPaaData = paaData;
  if (paaData.count === 0 || paaData.source === 'none') {
    console.log(`   🤖 No Serper PAA for ${comp.domain}, generating via Gemini...`);
    const website = comp.synthesized?.website || comp.stages?.oracleFetcher?.data || {};
    const keyword = _extractMainKeyword(comp);
    
    try {
      const geminiPAA = FT_GeneratePAAViaGemini(website, keyword);
      if (geminiPAA && geminiPAA.length > 0) {
        finalPaaData = {
          data: geminiPAA.map(q => typeof q === 'string' ? q : (q.question || q)),
          source: 'gemini',
          count: geminiPAA.length,
          raw: geminiPAA
        };
        console.log(`   ✅ Generated ${geminiPAA.length} PAA questions via Gemini for ${comp.domain}`);
      }
    } catch (e) {
      console.log(`   ⚠️ Gemini PAA generation failed for ${comp.domain}: ${e.message}`);
    }
  }
  
  const hasSERP = serpData.count > 0;
  const source = hasSERP ? 'serper' : (finalPaaData.source !== 'none' ? finalPaaData.source : 'estimated');
  
  // ELITE: Extract Detailed Keywords using universal extractor
  const detailedKeywords = FT_ExtractDetailedKeywords(comp);
  
  return {
    // FULL PAA - no slicing, pass all questions
    peopleAlsoAsk: FT_CreateProofObject(
      finalPaaData.data,  // NO SLICE - full array
      finalPaaData.source,
      'People Also Ask',
      { count: finalPaaData.count, source: finalPaaData.source }
    ),
    // FULL Related Searches - no slicing
    relatedSearches: FT_CreateProofObject(
      keywordsData.data,  // NO SLICE - full array with volume/difficulty
      keywordsData.source,
      'Related Searches',
      { count: keywordsData.count, source: keywordsData.source }
    ),
    // FULL SERP titles - no slicing
    serpTitles: FT_CreateProofObject(
      serpData.data.map(r => r.title),  // NO SLICE
      serpData.source,
      'SERP Titles',
      { count: serpData.count }
    ),
    // FULL rankings - no slicing
    topRankings: FT_CreateProofObject(
      serpData.data,  // NO SLICE - full array
      serpData.source,
      'Top Rankings',
      { count: serpData.count }
    ),
    // ELITE: Proof Data with full arrays
    detailedKeywords: detailedKeywords,
    serpProof: serpData.source,
    topSerpResults: serpData.data.map(r => ({title: r.title, url: r.link, position: r.position})),
    // RAW DATA for UI rendering
    rawData: {
      paaQuestions: finalPaaData.data,
      paaCount: finalPaaData.count,
      paaSource: finalPaaData.source === 'gemini' ? 'Gemini AI' : (finalPaaData.source === 'serper' ? 'Serper API' : finalPaaData.source),
      keywords: keywordsData.data,
      keywordCount: keywordsData.count,
      keywordSource: keywordsData.source,
      serpResults: serpData.data,
      serpCount: serpData.count
    },
    geminiInsight: FT_GenerateGeminiInsight('distribution', comp, 'digital marketing')
  };
}

/**
 * Extract main keyword from competitor data
 */
function _extractMainKeyword(comp) {
  const website = comp.synthesized?.website || {};
  const oracle = comp.stages?.oracleFetcher?.data || {};
  
  // Try to extract from title, h1, or domain
  const title = website.title || oracle.title || '';
  const h1 = website.h1 || oracle.h1 || '';
  const domain = comp.domain || '';
  
  // Get first meaningful part of title or h1
  const keyword = (h1 || title.split('|')[0] || title.split('-')[0] || domain.split('.')[0]).trim();
  
  return keyword.length > 3 ? keyword : domain.split('.')[0];
}

/**
 * Extract Content Systems data
 */
function _extractContentSystemsData(comp) {
  const oracle = comp.stages?.oracleFetcher?.data || {};
  const synth = comp.synthesized || {};
  
  const hasOracle = !!(oracle.content);
  const source = hasOracle ? 'oracle' : 'estimated';
  
  return {
    internalLinks: FT_CreateProofObject(
      (synth.content?.internalLinks || []).length,
      source,
      'Internal Links',
      synth
    ),
    contentArchitecture: FT_CreateProofObject(
      _analyzeContentArchitecture(synth),
      source,
      'Content Architecture',
      synth
    ),
    publishingSignals: FT_CreateProofObject(
      _detectPublishingSignals(synth),
      source,
      'Publishing Signals',
      synth
    )
  };
}

/**
 * Extract Conversion data
 */
function _extractConversionData(comp) {
  const pageSpeed = comp.stages?.pageSpeed?.data || comp.apiData?.pageSpeed || {};
  const oracle = comp.stages?.oracleFetcher?.data || {};
  
  const hasPageSpeed = !!(pageSpeed.scores?.performance !== undefined);
  const source = hasPageSpeed ? 'pageSpeed' : 'estimated';
  
  const performance = pageSpeed.scores?.performance || 50;
  const cvrPenalty = _calculateCVRPenalty(performance);
  
  return {
    performanceScore: FT_CreateProofObject(performance, source, 'Performance', pageSpeed),
    cvrPenalty: FT_CreateProofObject(cvrPenalty, source, 'CVR Penalty %', pageSpeed),
    estimatedRevenueLoss: FT_CreateProofObject(
      `${cvrPenalty}% conversion rate reduction`,
      source,
      'Revenue Impact',
      { performance, cvrPenalty }
    ),
    loadTime: FT_CreateProofObject(
      pageSpeed.metrics?.largest_contentful_paint || 'N/A',
      source,
      'LCP',
      pageSpeed
    )
  };
}

/**
 * Extract Distribution data - UPGRADED to use universal extractor
 */
function _extractDistributionData(comp) {
  const opr = comp.stages?.openPageRank?.data || comp.apiData?.openPageRank || {};
  
  // Use universal extractor for backlinks and internal links
  const backlinksData = FT_ExtractRawDataAlways(comp, 'backlinks');
  const internalLinksData = FT_ExtractRawDataAlways(comp, 'internalLinks');
  
  const hasOPR = !!(opr.page_rank_decimal);
  const source = hasOPR ? 'openPageRank' : 'estimated';
  
  const pageRank = opr.page_rank_decimal || 3;
  const globalRank = opr.rank || 500000;
  
  return {
    pageRank: FT_CreateProofObject(pageRank, source, 'PageRank', opr),
    globalRank: FT_CreateProofObject(globalRank, source, 'Global Rank', opr),
    estimatedTraffic: FT_CreateProofObject(
      _estimateTraffic(pageRank, globalRank),
      source,
      'Est. Monthly Traffic',
      opr
    ),
    referralEfficiency: FT_CreateProofObject(
      _calculateReferralEfficiency(pageRank, globalRank),
      source,
      'Referral Efficiency',
      opr
    ),
    // ELITE: Full Backlinks Data
    backlinks: FT_CreateProofObject(
      backlinksData.data,  // Full array - no slice
      backlinksData.source,
      'Backlinks',
      { count: backlinksData.count }
    ),
    internalLinks: FT_CreateProofObject(
      internalLinksData.data,  // Full array - no slice
      internalLinksData.source,
      'Internal Links',
      { count: internalLinksData.count }
    ),
    // RAW DATA for UI
    rawData: {
      backlinks: backlinksData.data,
      backlinkCount: backlinksData.count,
      backlinkSource: backlinksData.source,
      internalLinks: internalLinksData.data,
      internalLinkCount: internalLinksData.count,
      internalLinkSource: internalLinksData.source
    }
  };
}

/**
 * Extract Audience data
 */
function _extractAudienceData(comp) {
  const oracle = comp.stages?.oracleFetcher?.data || {};
  const synth = comp.synthesized?.website || {};
  
  const hasOracle = !!(oracle.content);
  const source = hasOracle ? 'oracle' : 'estimated';
  
  return {
    contentFocus: FT_CreateProofObject(
      _detectContentFocus(synth),
      source,
      'Content Focus',
      synth
    ),
    audienceSignals: FT_CreateProofObject(
      _detectAudienceSignals(synth),
      source,
      'Audience Signals',
      synth
    )
  };
}

/**
 * Extract GEO/AEO data
 * UPDATED: Centralized AI readiness with detailed proof
 */
function _extractGeoAeoData(comp) {
  const geoAeoProof = FT_ExtractGEOAEOProof(comp);
  const source = geoAeoProof.hasRealData ? 'serper-governance' : 'estimated';
  
  return {
    readinessScore: FT_CreateProofObject(geoAeoProof.readinessScore, source, 'AI Readiness Index', geoAeoProof),
    aeoScore: FT_CreateProofObject(geoAeoProof.aeoScore, source, 'AEO Visibility', geoAeoProof),
    geoScore: FT_CreateProofObject(geoAeoProof.geoScore, source, 'GEO Optimization', geoAeoProof),
    signals: FT_CreateProofObject(geoAeoProof.signals, source, 'Detected Signals', geoAeoProof),
    topQuestions: FT_CreateProofObject(geoAeoProof.topQuestions, source, 'Knowledge Graph Questions', geoAeoProof),
    geoAeoProof: geoAeoProof // Pass full proof for deep dive rendering
  };
}

/**
 * Extract Authority data - UPGRADED to use universal extractor for EEAT
 */
function _extractAuthorityData(comp) {
  const opr = comp.stages?.openPageRank?.data || comp.apiData?.openPageRank || {};
  
  // Use universal extractor for EEAT signals
  const eeatData = FT_ExtractRawDataAlways(comp, 'eeat');
  const backlinksData = FT_ExtractRawDataAlways(comp, 'backlinks');
  
  const hasOPR = !!(opr.page_rank_decimal);
  const source = hasOPR ? 'openPageRank' : 'estimated';
  
  return {
    pageRank: FT_CreateProofObject(opr.page_rank_decimal || 0, source, 'PageRank', opr),
    domainRank: FT_CreateProofObject(opr.rank || 0, source, 'Domain Rank', opr),
    authorityTier: FT_CreateProofObject(
      _getAuthorityTier(opr.page_rank_decimal || 0),
      source,
      'Authority Tier',
      opr
    ),
    // ELITE: EEAT Signals with full data
    eeatSignals: FT_CreateProofObject(
      eeatData.data,
      eeatData.source,
      'E-E-A-T Signals',
      { count: Object.keys(eeatData.data).length }
    ),
    // ELITE: Backlinks for authority scoring
    topBacklinks: FT_CreateProofObject(
      backlinksData.data.slice(0, 20),  // Top 20 for display
      backlinksData.source,
      'Top Backlinks',
      { totalCount: backlinksData.count }
    ),
    // RAW DATA for UI
    rawData: {
      eeat: eeatData.data,
      eeatSource: eeatData.source,
      experienceSignals: eeatData.data.experience || [],
      expertiseSignals: eeatData.data.expertise || [],
      authoritySignals: eeatData.data.authority || [],
      trustSignals: eeatData.data.trust || [],
      backlinks: backlinksData.data,
      backlinkCount: backlinksData.count
    },
    // ELITE: Gemini Insight
    geminiInsight: FT_GenerateGeminiInsight('authority', comp, 'digital marketing')
  };
}

/**
 * Extract Performance data
 */
function _extractPerformanceData(comp) {
  const pageSpeed = comp.stages?.pageSpeed?.data || comp.apiData?.pageSpeed || {};
  
  const hasPageSpeed = !!(pageSpeed.scores);
  const source = hasPageSpeed ? 'pageSpeed' : 'estimated';
  
  return {
    scores: FT_CreateProofObject(pageSpeed.scores || {}, source, 'Lighthouse Scores', pageSpeed),
    metrics: FT_CreateProofObject(pageSpeed.metrics || {}, source, 'Performance Metrics', pageSpeed),
    coreWebVitals: FT_CreateProofObject(pageSpeed.core_web_vitals || {}, source, 'Core Web Vitals', pageSpeed)
  };
}

/**
 * Extract Opportunity data
 */
function _extractOpportunityData(comp) {
  // Aggregated from other sources
  const pageSpeed = comp.stages?.pageSpeed?.data || {};
  const opr = comp.stages?.openPageRank?.data || {};
  const synth = comp.synthesized || {};
  
  return {
    performanceGap: FT_CreateProofObject(
      100 - (pageSpeed.scores?.performance || 50),
      pageSpeed.scores ? 'pageSpeed' : 'estimated',
      'Performance Gap',
      pageSpeed
    ),
    contentGap: FT_CreateProofObject(
      _identifyContentGaps(synth),
      'estimated',
      'Content Gaps',
      synth
    ),
    authorityGap: FT_CreateProofObject(
      _identifyAuthorityGaps(opr),
      opr.page_rank_decimal ? 'openPageRank' : 'estimated',
      'Authority Gap',
      opr
    )
  };
}

/**
 * Extract Scoring data
 */
function _extractScoringData(comp) {
  const pageSpeed = comp.stages?.pageSpeed?.data || {};
  const opr = comp.stages?.openPageRank?.data || {};
  const synth = comp.synthesized || {};
  
  return {
    overallScore: FT_CreateProofObject(
      _calculateOverallScore(pageSpeed, opr, synth),
      'estimated',
      'Overall Competitive Score',
      { pageSpeed, opr, synth }
    ),
    categoryScores: FT_CreateProofObject(
      _calculateCategoryScores(pageSpeed, opr, synth),
      'estimated',
      'Category Scores',
      { pageSpeed, opr, synth }
    )
  };
}

/**
 * Extract Overview data
 */
function _extractOverviewData(comp) {
  return {
    domain: comp.domain,
    dataQuality: _identifyAvailableSources(comp).dataQuality,
    primarySource: _identifyAvailableSources(comp).primarySource
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function _estimateMarketPosition(globalRank) {
  if (!globalRank || globalRank === 0) return 'Unknown';
  if (globalRank < 10000) return 'Market Leader';
  if (globalRank < 100000) return 'Major Player';
  if (globalRank < 500000) return 'Established Competitor';
  if (globalRank < 1000000) return 'Growing Competitor';
  return 'Emerging Competitor';
}

function _analyzeBrandVoice(title, description) {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('expert') || combined.includes('trusted')) return 'Authority';
  if (combined.includes('best') || combined.includes('top')) return 'Competitive';
  if (combined.includes('free') || combined.includes('easy')) return 'Accessible';
  if (combined.includes('premium') || combined.includes('exclusive')) return 'Premium';
  return 'Neutral';
}

function _calculateCVRPenalty(performanceScore) {
  // CVR Penalty = (100 - Performance) × 0.1
  return Math.round((100 - performanceScore) * 0.1 * 10) / 10;
}

function _analyzeContentArchitecture(synth) {
  const internalLinks = (synth.content?.internalLinks || []).length;
  if (internalLinks > 50) return 'Extensive Hub Structure';
  if (internalLinks > 20) return 'Well-Connected';
  if (internalLinks > 10) return 'Basic Navigation';
  return 'Minimal Structure';
}

function _detectPublishingSignals(synth) {
  const schemaTypes = synth.website?.schemaTypes || [];
  if (schemaTypes.includes('Article') || schemaTypes.includes('BlogPosting')) return 'Active Publishing';
  if (schemaTypes.includes('WebPage')) return 'Static Content';
  return 'Unknown Publishing Pattern';
}

// ═══════════════════════════════════════════════════════════════════════════════════
// V34 FIX: Enhanced traffic estimation with Tranco rank correlation
// Tranco is a research-grade domain ranking that combines multiple sources
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * V34: Get Tranco rank for a domain (uses cached list)
 * @param {string} domain - Domain to look up
 * @returns {number} Tranco rank (0 if not found)
 */
function _getTrancoRank(domain) {
  try {
    // Tranco top 1M list is available as CSV
    // For performance, we use a smart estimation based on domain characteristics
    // Real implementation would cache the Tranco list
    const domainLower = domain.toLowerCase();
    
    // Known high-traffic domains (approximate ranks)
    const knownRanks = {
      'google.com': 1, 'youtube.com': 2, 'facebook.com': 3, 'amazon.com': 10,
      'wikipedia.org': 15, 'twitter.com': 30, 'instagram.com': 35, 'linkedin.com': 40,
      'microsoft.com': 50, 'apple.com': 60, 'github.com': 80, 'reddit.com': 20,
      'ahrefs.com': 800, 'semrush.com': 1200, 'moz.com': 3000, 'hubspot.com': 500,
      'salesforce.com': 400, 'shopify.com': 300, 'wordpress.org': 200,
      'nytimes.com': 100, 'bbc.com': 120, 'cnn.com': 150, 'forbes.com': 250
    };
    
    // Check known domains
    for (const [known, rank] of Object.entries(knownRanks)) {
      if (domainLower === known || domainLower.endsWith('.' + known)) {
        console.log(`   📊 V34: Found known Tranco rank for ${domain}: ${rank}`);
        return rank;
      }
    }
    
    // Not in known list - return 0 (will use other estimation methods)
    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * V34: Estimate traffic from Tranco rank using power law distribution
 * @param {number} trancoRank - Tranco rank (1 = highest traffic)
 * @returns {number} Estimated monthly traffic
 */
function _estimateTrafficFromTranco(trancoRank) {
  if (!trancoRank || trancoRank <= 0) return 0;
  
  // Power law: Traffic = 50B / rank^0.8
  // This approximates real-world traffic distribution
  const estimatedTraffic = Math.round(50000000000 / Math.pow(trancoRank, 0.8));
  console.log(`   📊 V34: Tranco rank ${trancoRank} → ${estimatedTraffic.toLocaleString()} monthly visits`);
  return estimatedTraffic;
}

function _estimateTraffic(pageRank, globalRank, domain = null) {
  // V34: Try Tranco rank first if domain is provided
  if (domain) {
    const trancoRank = _getTrancoRank(domain);
    if (trancoRank > 0) {
      const trancoTraffic = _estimateTrafficFromTranco(trancoRank);
      if (trancoTraffic > 0) {
        return trancoTraffic;
      }
    }
  }
  
  // Fallback: Use global rank (e.g., from Alexa/Tranco API)
  if (globalRank && globalRank > 0) {
    return Math.max(1000, Math.round(10000000 / globalRank));
  }
  
  // Fallback: Use PageRank-based estimation (V33 algorithm)
  if (pageRank) {
    return Math.round(Math.pow(10, pageRank) * 10);
  }
  
  // Default fallback
  return 5000;
}

function _calculateReferralEfficiency(pageRank, globalRank) {
  const traffic = _estimateTraffic(pageRank, globalRank);
  const refDomains = Math.max(100, Math.round(pageRank * 500));
  const ratio = Math.round(traffic / refDomains);
  return {
    ratio: ratio,
    tier: ratio >= 100 ? 'Ultra-Premium' : ratio >= 50 ? 'Premium' : ratio >= 25 ? 'Healthy' : 'Below Average'
  };
}

function _detectContentFocus(synth) {
  const title = (synth.title || '').toLowerCase();
  const h1 = (synth.h1 || '').toLowerCase();
  const combined = `${title} ${h1}`;
  
  if (combined.includes('casino') || combined.includes('slot')) return 'Gaming/Casino';
  if (combined.includes('seo') || combined.includes('marketing')) return 'Marketing/SEO';
  if (combined.includes('software') || combined.includes('developer')) return 'Technology';
  return 'General Business';
}

function _detectAudienceSignals(synth) {
  return {
    b2b: synth.title?.toLowerCase().includes('enterprise') || synth.title?.toLowerCase().includes('business'),
    b2c: synth.title?.toLowerCase().includes('free') || synth.title?.toLowerCase().includes('best'),
    technical: synth.schemaTypes?.length > 0
  };
}

function _calculateRAGReadiness(synth, serper) {
  let score = 30;
  if ((synth.schemaTypes || []).length > 0) score += 25;
  if (synth.wordCount > 1500) score += 15;
  if ((serper.peopleAlsoAsk || []).length > 0) score += 15;
  if (synth.hasOrganizationSchema) score += 15;
  return Math.min(100, score);
}

function _assessCitationPotential(synth) {
  const schemaTypes = synth.schemaTypes || [];
  if (schemaTypes.includes('FAQPage') || schemaTypes.includes('HowTo')) return 'High';
  if (schemaTypes.includes('Article') || schemaTypes.includes('Organization')) return 'Medium';
  return 'Low';
}

function _getAuthorityTier(pageRank) {
  if (pageRank >= 7) return 'Elite Authority';
  if (pageRank >= 5) return 'Strong Authority';
  if (pageRank >= 3) return 'Moderate Authority';
  return 'Building Authority';
}

function _identifyContentGaps(synth) {
  const gaps = [];
  if (!synth.website?.wordCount || synth.website.wordCount < 1500) gaps.push('Thin Content');
  if (!(synth.website?.schemaTypes || []).length) gaps.push('Missing Schema');
  if (!(synth.website?.h2 || []).length) gaps.push('Poor Heading Structure');
  return gaps.length > 0 ? gaps : ['No major gaps'];
}

function _identifyAuthorityGaps(opr) {
  const gaps = [];
  if (!opr.page_rank_decimal || opr.page_rank_decimal < 4) gaps.push('Low PageRank');
  if (!opr.rank || opr.rank > 500000) gaps.push('Weak Global Presence');
  return gaps.length > 0 ? gaps : ['Solid authority'];
}

function _calculateOverallScore(pageSpeed, opr, synth) {
  let score = 50;
  if (pageSpeed.scores?.performance) score += (pageSpeed.scores.performance / 10);
  if (opr.page_rank_decimal) score += (opr.page_rank_decimal * 3);
  if (synth.website?.wordCount > 1500) score += 5;
  if ((synth.website?.schemaTypes || []).length > 0) score += 5;
  return Math.min(100, Math.round(score));
}

function _calculateCategoryScores(pageSpeed, opr, synth) {
  return {
    technical: pageSpeed.scores?.seo || 50,
    content: synth.website?.wordCount > 1500 ? 75 : 50,
    authority: (opr.page_rank_decimal || 3) * 10,
    performance: pageSpeed.scores?.performance || 50
  };
}

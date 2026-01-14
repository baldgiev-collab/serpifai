/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_COMP_SmartFallback.gs - Data Enrichment & Validation Pipeline
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DATA ENRICHMENT PIPELINE (NOT FALLBACKS):
 * Each source IMPROVES and VALIDATES the data progressively:
 * 
 * LAYER 1: PHP FETCHER (Primary Data Source)
 *    - Word count, schema, links, metadata
 *    - Direct website analysis - most reliable for content signals
 *    - Sets the foundation for all estimates
 * 
 * LAYER 2: FREE APIs (Enrichment & Cross-Validation)
 *    - OpenPageRank → Authority baseline + validation
 *    - PageSpeed Insights → Technical quality validation
 *    - Serper → SERP visibility validation
 *    - Cross-check and adjust Layer 1 estimates
 * 
 * LAYER 3: GEMINI AI (Final Refinement & Confidence)
 *    - Industry-aware pattern recognition
 *    - Anomaly detection and correction
 *    - Confidence scoring based on all signals
 * 
 * Each layer IMPROVES the data, not replaces it!
 * 
 * @version 2.0.0 - Data Pipeline Architecture
 * @date December 2025
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Main Pipeline: Process competitor through all three layers
 * 
 * @param {Object} competitorData - All available data for competitor
 * @param {string} domain - Competitor domain
 * @param {string} geminiModel - Gemini model to use for Layer 3
 * @returns {Object} Enriched and validated metrics
 */
function DATAPIPELINE_processCompetitor(competitorData, domain, geminiModel) {
  try {
    Logger.log(`\n═══════════════════════════════════════════════════════════════`);
    Logger.log(`🔄 DATA PIPELINE: Processing ${domain}`);
    Logger.log(`═══════════════════════════════════════════════════════════════`);
    
    // Initialize metrics object with tracking
    let metrics = {
      domain: domain,
      pipelineVersion: '2.0',
      processedAt: new Date().toISOString(),
      layers: {
        layer1_phpFetcher: { applied: false, signals: {} },
        layer2_freeAPIs: { applied: false, validations: {} },
        layer3_gemini: { applied: false, refinements: {} }
      },
      confidence: {
        overall: 'Low',
        dataQuality: 0,
        crossValidated: false
      }
    };
    
    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 1: PHP FETCHER - Primary Data Source
    // ═══════════════════════════════════════════════════════════════════════
    metrics = LAYER1_extractPHPFetcherData(metrics, competitorData);
    
    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 2: FREE APIs - Enrichment & Cross-Validation
    // ═══════════════════════════════════════════════════════════════════════
    metrics = LAYER2_enrichWithFreeAPIs(metrics, competitorData);
    
    // ═══════════════════════════════════════════════════════════════════════
    // LAYER 3: GEMINI AI - Final Refinement & Confidence
    // ═══════════════════════════════════════════════════════════════════════
    metrics = LAYER3_refineWithGemini(metrics, competitorData, geminiModel);
    
    // Calculate final confidence
    metrics = calculateFinalConfidence(metrics);
    
    Logger.log(`\n✅ PIPELINE COMPLETE for ${domain}:`);
    Logger.log(`   Authority: ${metrics.authorityScore} | Traffic: ${metrics.organicTraffic?.toLocaleString()}`);
    Logger.log(`   Keywords: ${metrics.organicKeywords?.toLocaleString()} | Confidence: ${metrics.confidence.overall}`);
    Logger.log(`═══════════════════════════════════════════════════════════════\n`);
    
    return metrics;
    
  } catch (error) {
    Logger.log(`❌ Pipeline error for ${domain}: ${error.toString()}`);
    return getMinimalMetrics(domain, 'Pipeline error');
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LAYER 1: PHP FETCHER - Extract Primary Content Signals
 * ═══════════════════════════════════════════════════════════════════════════
 * This is the FOUNDATION - direct website analysis provides the most 
 * reliable content signals.
 */
function LAYER1_extractPHPFetcherData(metrics, competitorData) {
  Logger.log(`\n   📦 LAYER 1: PHP Fetcher (Primary Data)`);
  
  // Extract from snapshot (PHP Fetcher output) or synthesized data
  const snapshot = competitorData.snapshot || {};
  const synthesized = competitorData.synthesized || {};
  const metadata = snapshot.metadata || synthesized.website || {};
  const schema = snapshot.schema || {};
  const links = snapshot.links || {};
  
  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT SIGNALS (Most reliable from PHP Fetcher)
  // ─────────────────────────────────────────────────────────────────────────
  const wordCount = metadata.wordCount || synthesized.website?.wordCount || 0;
  const schemaTypes = schema.types || synthesized.website?.schemaTypes || [];
  const hasOrgSchema = schema.hasOrganizationSchema || synthesized.website?.hasOrganizationSchema || false;
  const internalLinks = (links.internal || []).length || synthesized.website?.internalLinks || 0;
  const externalLinks = (links.external || []).length || synthesized.website?.externalLinks || 0;
  const title = metadata.title || synthesized.website?.title || '';
  const description = metadata.description || synthesized.website?.description || '';
  const h1 = metadata.h1 || synthesized.website?.h1 || '';
  
  // Store raw signals
  metrics.layers.layer1_phpFetcher.signals = {
    wordCount: wordCount,
    schemaTypes: schemaTypes,
    schemaCount: schemaTypes.length,
    hasOrganizationSchema: hasOrgSchema,
    internalLinks: internalLinks,
    externalLinks: externalLinks,
    hasTitle: title && title.length > 0 && title !== 'N/A',
    hasDescription: description && description.length > 0 && description !== 'N/A',
    hasH1: h1 && h1.length > 0 && h1 !== 'N/A',
    titleLength: title.length,
    descriptionLength: description.length
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // CALCULATE LAYER 1 ESTIMATES (Based purely on content signals)
  // ─────────────────────────────────────────────────────────────────────────
  
  // Content Depth Score (0-100)
  let contentDepthScore = 0;
  if (wordCount > 5000) contentDepthScore = 95;
  else if (wordCount > 3000) contentDepthScore = 80;
  else if (wordCount > 2000) contentDepthScore = 65;
  else if (wordCount > 1000) contentDepthScore = 50;
  else if (wordCount > 500) contentDepthScore = 35;
  else if (wordCount > 100) contentDepthScore = 20;
  else contentDepthScore = 10;
  
  // Schema Maturity Score (0-100)
  let schemaMaturityScore = 0;
  if (hasOrgSchema) schemaMaturityScore += 40;
  if (schemaTypes.length > 5) schemaMaturityScore += 40;
  else if (schemaTypes.length > 2) schemaMaturityScore += 25;
  else if (schemaTypes.length > 0) schemaMaturityScore += 10;
  // Bonus for advanced schema types
  const advancedSchemas = ['FAQPage', 'HowTo', 'Product', 'Review', 'Article'];
  advancedSchemas.forEach(type => {
    if (schemaTypes.some(s => s.includes(type))) schemaMaturityScore += 5;
  });
  schemaMaturityScore = Math.min(100, schemaMaturityScore);
  
  // Site Structure Score (0-100)
  let structureScore = 0;
  if (internalLinks > 100) structureScore = 90;
  else if (internalLinks > 50) structureScore = 70;
  else if (internalLinks > 20) structureScore = 50;
  else if (internalLinks > 10) structureScore = 35;
  else if (internalLinks > 0) structureScore = 20;
  // External links indicate authority building
  if (externalLinks > 20) structureScore += 10;
  else if (externalLinks > 5) structureScore += 5;
  structureScore = Math.min(100, structureScore);
  
  // SEO Basics Score (0-100)
  let seoBasicsScore = 0;
  if (metrics.layers.layer1_phpFetcher.signals.hasTitle) {
    if (title.length >= 30 && title.length <= 60) seoBasicsScore += 35;
    else seoBasicsScore += 20;
  }
  if (metrics.layers.layer1_phpFetcher.signals.hasDescription) {
    if (description.length >= 120 && description.length <= 160) seoBasicsScore += 35;
    else seoBasicsScore += 20;
  }
  if (metrics.layers.layer1_phpFetcher.signals.hasH1) seoBasicsScore += 30;
  
  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 1 INITIAL ESTIMATES (Content-Based)
  // ─────────────────────────────────────────────────────────────────────────
  
  // Composite content score
  const contentComposite = (
    contentDepthScore * 0.35 +
    schemaMaturityScore * 0.25 +
    structureScore * 0.25 +
    seoBasicsScore * 0.15
  );
  
  // Initial authority estimate (content-only, will be refined)
  // Content-rich sites with good structure typically have higher authority
  let layer1Authority = Math.round(20 + contentComposite * 0.5); // Range: 20-70
  
  // Initial keyword estimate based on content depth
  // More content = more keyword opportunities
  let layer1Keywords;
  if (wordCount > 3000) layer1Keywords = 50000 + (wordCount - 3000) * 10;
  else if (wordCount > 1000) layer1Keywords = 10000 + (wordCount - 1000) * 20;
  else if (wordCount > 500) layer1Keywords = 2000 + (wordCount - 500) * 16;
  else layer1Keywords = Math.max(100, wordCount * 2);
  
  // Schema boost for keywords
  if (schemaTypes.length > 3) layer1Keywords = Math.round(layer1Keywords * 1.3);
  
  // Store Layer 1 estimates
  metrics.layers.layer1_phpFetcher.applied = true;
  metrics.layers.layer1_phpFetcher.estimates = {
    contentDepthScore: contentDepthScore,
    schemaMaturityScore: schemaMaturityScore,
    structureScore: structureScore,
    seoBasicsScore: seoBasicsScore,
    contentComposite: Math.round(contentComposite),
    initialAuthority: layer1Authority,
    initialKeywords: Math.round(layer1Keywords)
  };
  
  // Set initial values (will be refined in Layer 2 and 3)
  metrics.authorityScore = layer1Authority;
  metrics.organicKeywords = Math.round(layer1Keywords);
  metrics.contentDepth = wordCount;
  metrics.schemaCount = schemaTypes.length;
  
  Logger.log(`      Content: ${wordCount} words, ${schemaTypes.length} schemas, ${internalLinks} internal links`);
  Logger.log(`      Scores: Content=${contentDepthScore}, Schema=${schemaMaturityScore}, Structure=${structureScore}`);
  Logger.log(`      Initial: Authority=${layer1Authority}, Keywords=${layer1Keywords.toLocaleString()}`);
  
  return metrics;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LAYER 2: FREE APIs - Enrichment & Cross-Validation
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses OpenPageRank, PageSpeed, and Serper to validate and adjust Layer 1 estimates
 */
function LAYER2_enrichWithFreeAPIs(metrics, competitorData) {
  Logger.log(`\n   🌐 LAYER 2: Free APIs (Enrichment & Validation)`);
  
  const apiData = competitorData.apiData || {};
  const validations = {
    openPageRank: { available: false, validates: null, adjustment: 0 },
    pageSpeed: { available: false, validates: null, adjustment: 0 },
    serper: { available: false, validates: null, adjustment: 0 }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // OpenPageRank Validation
  // ─────────────────────────────────────────────────────────────────────────
  const opr = apiData.openPageRank || {};
  const pageRank = parseFloat(opr.page_rank_decimal || opr.rank) || 0;
  const domainRank = parseInt(opr.rank || opr.domain_rank) || 0;
  
  if (pageRank > 0) {
    validations.openPageRank.available = true;
    validations.openPageRank.pageRank = pageRank;
    validations.openPageRank.domainRank = domainRank;
    
    // Expected authority based on PageRank
    let expectedAuthority;
    if (pageRank >= 8) expectedAuthority = 85;
    else if (pageRank >= 7) expectedAuthority = 75;
    else if (pageRank >= 6) expectedAuthority = 65;
    else if (pageRank >= 5) expectedAuthority = 55;
    else if (pageRank >= 4) expectedAuthority = 45;
    else if (pageRank >= 3) expectedAuthority = 35;
    else expectedAuthority = 25;
    
    // Compare with Layer 1 estimate
    const layer1Auth = metrics.authorityScore;
    const diff = expectedAuthority - layer1Auth;
    
    if (Math.abs(diff) <= 10) {
      validations.openPageRank.validates = true;
      validations.openPageRank.adjustment = Math.round(diff / 2); // Small adjustment
      Logger.log(`      ✓ OpenPageRank VALIDATES Layer 1 (PR=${pageRank}, expected Auth≈${expectedAuthority})`);
    } else if (diff > 10) {
      // PageRank suggests HIGHER authority than content
      validations.openPageRank.validates = false;
      validations.openPageRank.adjustment = Math.round(diff * 0.6); // Significant boost
      Logger.log(`      ↑ OpenPageRank suggests HIGHER authority (PR=${pageRank} → +${validations.openPageRank.adjustment})`);
    } else {
      // PageRank suggests LOWER authority than content (rare but possible)
      validations.openPageRank.validates = false;
      validations.openPageRank.adjustment = Math.round(diff * 0.4); // Moderate reduction
      Logger.log(`      ↓ OpenPageRank suggests lower authority (PR=${pageRank} → ${validations.openPageRank.adjustment})`);
    }
    
    // Store PageRank for metrics
    metrics.pageRank = pageRank;
    metrics.domainRank = domainRank;
  } else {
    Logger.log(`      ⚠️ OpenPageRank: No data available`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // PageSpeed Insights Validation
  // ─────────────────────────────────────────────────────────────────────────
  const pageSpeed = apiData.pageSpeed || {};
  const scores = pageSpeed.scores || pageSpeed || {};
  const seoScore = scores.seo || pageSpeed.seo || 0;
  const performanceScore = scores.performance || pageSpeed.performance || 0;
  const accessibilityScore = scores.accessibility || pageSpeed.accessibility || 0;
  const bestPracticesScore = scores.best_practices || pageSpeed.bestPractices || 0;
  
  if (seoScore > 0 || performanceScore > 0) {
    validations.pageSpeed.available = true;
    validations.pageSpeed.scores = { seoScore, performanceScore, accessibilityScore, bestPracticesScore };
    
    const avgScore = (seoScore + performanceScore + accessibilityScore + bestPracticesScore) / 4;
    
    // High PageSpeed scores indicate professional site = authority boost
    if (avgScore >= 80) {
      validations.pageSpeed.validates = true;
      validations.pageSpeed.adjustment = 8;
      Logger.log(`      ✓ PageSpeed EXCELLENT (avg=${Math.round(avgScore)}) → +8 authority`);
    } else if (avgScore >= 60) {
      validations.pageSpeed.validates = true;
      validations.pageSpeed.adjustment = 4;
      Logger.log(`      ✓ PageSpeed GOOD (avg=${Math.round(avgScore)}) → +4 authority`);
    } else if (avgScore >= 40) {
      validations.pageSpeed.validates = null; // Neutral
      validations.pageSpeed.adjustment = 0;
      Logger.log(`      ~ PageSpeed AVERAGE (avg=${Math.round(avgScore)}) → no change`);
    } else {
      validations.pageSpeed.validates = false;
      validations.pageSpeed.adjustment = -5;
      Logger.log(`      ✗ PageSpeed POOR (avg=${Math.round(avgScore)}) → -5 authority`);
    }
    
    // Store PageSpeed scores
    metrics.seoScore = seoScore;
    metrics.performanceScore = performanceScore;
    metrics.accessibilityScore = accessibilityScore;
    metrics.bestPracticesScore = bestPracticesScore;
    metrics.pageSpeedAvg = Math.round(avgScore);
  } else {
    Logger.log(`      ⚠️ PageSpeed: No data available`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Serper SERP Visibility Validation
  // ─────────────────────────────────────────────────────────────────────────
  const serper = apiData.serper || {};
  const organicResults = serper.organic || [];
  const serpCount = organicResults.length;
  const hasKnowledgeGraph = !!serper.knowledgeGraph;
  
  if (serpCount > 0 || hasKnowledgeGraph) {
    validations.serper.available = true;
    validations.serper.serpCount = serpCount;
    validations.serper.hasKnowledgeGraph = hasKnowledgeGraph;
    validations.serper.topRankings = organicResults.slice(0, 5);
    
    // High SERP visibility = validation of authority
    if (serpCount >= 10 || hasKnowledgeGraph) {
      validations.serper.validates = true;
      validations.serper.adjustment = hasKnowledgeGraph ? 12 : 8;
      Logger.log(`      ✓ Serper: HIGH visibility (${serpCount} results${hasKnowledgeGraph ? ' + Knowledge Graph' : ''}) → +${validations.serper.adjustment}`);
    } else if (serpCount >= 5) {
      validations.serper.validates = true;
      validations.serper.adjustment = 5;
      Logger.log(`      ✓ Serper: GOOD visibility (${serpCount} results) → +5`);
    } else if (serpCount >= 2) {
      validations.serper.validates = null;
      validations.serper.adjustment = 2;
      Logger.log(`      ~ Serper: MODERATE visibility (${serpCount} results) → +2`);
    } else {
      validations.serper.validates = false;
      validations.serper.adjustment = -3;
      Logger.log(`      ✗ Serper: LOW visibility (${serpCount} results) → -3`);
    }
    
    // Store SERP data
    metrics.serpOrganicCount = serpCount;
    metrics.hasKnowledgeGraph = hasKnowledgeGraph;
    metrics.topRankings = organicResults.slice(0, 5).map(r => ({
      url: r.link || r.url || '',
      title: r.title || '',
      position: r.position || 0
    }));
  } else {
    Logger.log(`      ⚠️ Serper: No data available`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // APPLY ADJUSTMENTS FROM LAYER 2
  // ─────────────────────────────────────────────────────────────────────────
  const totalAdjustment = 
    validations.openPageRank.adjustment + 
    validations.pageSpeed.adjustment + 
    validations.serper.adjustment;
  
  const layer1Authority = metrics.authorityScore;
  const layer2Authority = Math.max(15, Math.min(95, layer1Authority + totalAdjustment));
  
  // Keyword adjustment based on authority change
  const authorityMultiplier = layer2Authority / layer1Authority;
  const layer1Keywords = metrics.organicKeywords;
  const layer2Keywords = Math.round(layer1Keywords * authorityMultiplier);
  
  // Traffic estimation based on SERP visibility + authority
  let trafficMultiplier = 1;
  if (serpCount >= 10) trafficMultiplier = 1.5;
  else if (serpCount >= 5) trafficMultiplier = 1.2;
  const trafficRatio = layer2Authority >= 70 ? 6 : layer2Authority >= 50 ? 3 : layer2Authority >= 30 ? 1.5 : 0.5;
  const layer2Traffic = Math.round(layer2Keywords * trafficRatio * trafficMultiplier);
  
  // Backlinks estimation based on authority
  const blExponent = 0.068 * layer2Authority + 1.6;
  const layer2Backlinks = Math.round(Math.pow(10, blExponent));
  
  // Referring domains
  const refDomRatio = layer2Authority >= 70 ? 0.015 : layer2Authority >= 50 ? 0.04 : 0.08;
  const layer2RefDomains = Math.max(50, Math.round(layer2Backlinks * refDomRatio));
  
  // Store Layer 2 results
  metrics.layers.layer2_freeAPIs.applied = true;
  metrics.layers.layer2_freeAPIs.validations = validations;
  metrics.layers.layer2_freeAPIs.adjustments = {
    totalAdjustment: totalAdjustment,
    authorityBefore: layer1Authority,
    authorityAfter: layer2Authority
  };
  
  // Update metrics
  metrics.authorityScore = layer2Authority;
  metrics.organicKeywords = layer2Keywords;
  metrics.organicTraffic = layer2Traffic;
  metrics.backlinks = layer2Backlinks;
  metrics.refDomains = layer2RefDomains;
  
  // Calculate cross-validation score
  const apisWithData = [validations.openPageRank, validations.pageSpeed, validations.serper].filter(v => v.available).length;
  const apisValidating = [validations.openPageRank, validations.pageSpeed, validations.serper].filter(v => v.validates === true).length;
  metrics.confidence.crossValidated = apisWithData >= 2 && apisValidating >= 1;
  
  Logger.log(`      ─────────────────────────────────────────`);
  Logger.log(`      Layer 2 Result: Authority ${layer1Authority} → ${layer2Authority} (${totalAdjustment >= 0 ? '+' : ''}${totalAdjustment})`);
  Logger.log(`      Keywords: ${layer2Keywords.toLocaleString()}, Traffic: ${layer2Traffic.toLocaleString()}`);
  Logger.log(`      Cross-validated: ${metrics.confidence.crossValidated ? 'YES' : 'NO'} (${apisWithData} APIs available, ${apisValidating} validating)`);
  
  return metrics;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LAYER 3: GEMINI AI - Elite Deep Research & Mathematical Analysis
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Uses Gemini as an ELITE SEO DATA SCIENTIST with:
 * - Deep research methodology
 * - Mathematical regression models
 * - Industry pattern recognition
 * - Reasoning chain for confidence
 * - Comprehensive field population
 * 
 * @version 3.0 - Elite Analyst Mode
 */
function LAYER3_refineWithGemini(metrics, competitorData, geminiModel) {
  Logger.log(`\n   🤖 LAYER 3: Gemini Elite Analysis (Deep Research Mode)`);
  
  const domain = metrics.domain;
  const model = geminiModel || 'gemini-3-flash-preview';
  
  try {
    // Build comprehensive analysis request
    const analysisRequest = buildGeminiEliteAnalysisRequest(metrics, competitorData);
    
    // Call Gemini with deep reasoning prompt
    const geminiResponse = callGeminiEliteAnalysis(analysisRequest, model);
    
    if (geminiResponse.success && geminiResponse.analysis) {
      // Apply Gemini's refined estimates
      metrics = applyGeminiEliteAnalysis(metrics, geminiResponse.analysis);
      Logger.log(`      ✅ Gemini Elite Analysis applied successfully`);
    } else {
      // Fallback to rule-based refinement
      Logger.log(`      ⚠️ Gemini API unavailable, using rule-based refinement`);
      metrics = applyRuleBasedRefinement(metrics, competitorData);
    }
    
  } catch (error) {
    Logger.log(`      ❌ Gemini error: ${error.toString()}, using rule-based refinement`);
    metrics = applyRuleBasedRefinement(metrics, competitorData);
  }
  
  // Populate ALL remaining fields
  metrics = populateAllFields(metrics, competitorData);
  
  return metrics;
}

/**
 * Build the Gemini Elite Analysis request with all collected data
 */
function buildGeminiEliteAnalysisRequest(metrics, competitorData) {
  const layer1 = metrics.layers.layer1_phpFetcher || {};
  const layer2 = metrics.layers.layer2_freeAPIs || {};
  
  return {
    domain: metrics.domain,
    
    // Layer 1 Signals (PHP Fetcher)
    contentSignals: {
      wordCount: layer1.signals?.wordCount || 0,
      schemaTypes: layer1.signals?.schemaTypes || [],
      schemaCount: layer1.signals?.schemaCount || 0,
      hasOrganizationSchema: layer1.signals?.hasOrganizationSchema || false,
      internalLinks: layer1.signals?.internalLinks || 0,
      externalLinks: layer1.signals?.externalLinks || 0,
      hasTitle: layer1.signals?.hasTitle || false,
      hasDescription: layer1.signals?.hasDescription || false,
      titleLength: layer1.signals?.titleLength || 0,
      descriptionLength: layer1.signals?.descriptionLength || 0
    },
    
    contentScores: {
      contentDepthScore: layer1.estimates?.contentDepthScore || 0,
      schemaMaturityScore: layer1.estimates?.schemaMaturityScore || 0,
      structureScore: layer1.estimates?.structureScore || 0,
      seoBasicsScore: layer1.estimates?.seoBasicsScore || 0,
      contentComposite: layer1.estimates?.contentComposite || 0
    },
    
    // Layer 2 Signals (Free APIs)
    apiSignals: {
      pageRank: metrics.pageRank || 0,
      domainRank: metrics.domainRank || 0,
      seoScore: metrics.seoScore || 0,
      performanceScore: metrics.performanceScore || 0,
      accessibilityScore: metrics.accessibilityScore || 0,
      bestPracticesScore: metrics.bestPracticesScore || 0,
      serpOrganicCount: metrics.serpOrganicCount || 0,
      hasKnowledgeGraph: metrics.hasKnowledgeGraph || false
    },
    
    // Current estimates from Layer 1 + Layer 2
    currentEstimates: {
      authorityScore: metrics.authorityScore,
      organicKeywords: metrics.organicKeywords,
      organicTraffic: metrics.organicTraffic,
      backlinks: metrics.backlinks,
      refDomains: metrics.refDomains
    },
    
    // Cross-validation status
    crossValidated: metrics.confidence.crossValidated
  };
}

/**
 * Call Gemini with Elite Data Scientist prompt for deep analysis
 */
function callGeminiEliteAnalysis(request, model) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return { success: false, error: 'No Gemini API key' };
    }
    
    const systemPrompt = getGeminiEliteSystemPrompt();
    const userPrompt = getGeminiEliteUserPrompt(request);
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.2,  // Low temperature for analytical precision
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(endpoint, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const text = result.candidates[0].content.parts[0].text;
      const analysis = JSON.parse(text);
      return { success: true, analysis: analysis };
    }
    
    return { success: false, error: 'Invalid response structure' };
    
  } catch (error) {
    Logger.log(`      Gemini API error: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Elite Data Scientist System Prompt
 */
function getGeminiEliteSystemPrompt() {
  return `# ELITE SEO DATA SCIENTIST & METRICS ANALYST

## YOUR IDENTITY
You are a world-class SEO Data Scientist with:
- PhD in Web Analytics from Stanford
- 15+ years at Google's Search Quality team
- Deep expertise in SEMrush, Ahrefs, Moz algorithms
- Mathematical modeling of web authority metrics

## YOUR METHODOLOGY

### STEP 1: SIGNAL ANALYSIS
Analyze all provided signals systematically:
- Content depth signals (word count, schema, structure)
- Authority signals (PageRank, domain rank)
- Technical signals (PageSpeed, SEO score)
- Visibility signals (SERP count, Knowledge Graph)

### STEP 2: MATHEMATICAL MODELING
Apply proven mathematical models:

**Authority Score Model:**
Authority = α₁(PageRank × 10) + α₂(ContentComposite × 0.3) + α₃(TechnicalScore × 0.2) + IndustryAdjustment
Where: α₁ + α₂ + α₃ = 1, weighted by signal availability

**Keyword Estimation (Power-Law):**
Keywords = 10^(0.048 × Authority + β)
Where: β = industry modifier (0.6-1.2)

**Traffic Estimation (Industry-Adjusted):**
Traffic = Keywords × TrafficRatio × IndustryMultiplier
TrafficRatio = {High Auth: 8-15, Mid Auth: 3-6, Low Auth: 0.5-2}

**Backlink Estimation (Exponential):**
Backlinks = 10^(0.068 × Authority + 1.6) × IndustryMultiplier

**Referring Domains (Ratio-Based):**
RefDomains = Backlinks × RatioFactor
RatioFactor = {High Auth: 0.01-0.02, Mid: 0.03-0.05, Low: 0.08-0.12}

### STEP 3: INDUSTRY PATTERN RECOGNITION
Apply industry-specific intelligence:

| Industry | Keyword Mult | Traffic Mult | Backlink Mult | Auth Adj |
|----------|--------------|--------------|---------------|----------|
| Gambling | 1.2-1.5 | 1.5-2.5 | 1.8-2.5 | -5 to -10 |
| News | 1.8-2.5 | 2.5-4.0 | 1.3-1.6 | +3 to +8 |
| SaaS | 0.9-1.1 | 0.9-1.2 | 1.1-1.3 | +2 to +5 |
| E-commerce | 1.3-1.6 | 0.6-0.9 | 1.5-2.0 | 0 |
| Finance | 1.0-1.3 | 1.2-1.8 | 1.4-1.8 | +5 to +10 |
| Affiliate | 1.3-1.5 | 1.0-1.4 | 2.0-3.0 | -3 to -8 |

### STEP 4: CONFIDENCE REASONING
Provide reasoning chain:
1. What signals are strong/weak?
2. How do signals corroborate each other?
3. What industry patterns apply?
4. What's the estimation confidence?

### STEP 5: COMPREHENSIVE FIELD POPULATION
Populate ALL SEO metrics, not just core 5.

## CALIBRATION DATA (Ground Truth from SEMrush)

| Domain | Auth | Traffic | Keywords | Backlinks | RefDomains | PageRank |
|--------|------|---------|----------|-----------|------------|----------|
| semrush.com | 85 | 9.5M | 7.9M | 19.8M | 211K | 7.58 |
| ahrefs.com | 83 | 3.8M | 2.9M | 15.3M | 130K | 7.23 |
| toptal.com | 59 | 553K | 305K | 1.2M | 64K | 6.40 |
| vegasslotsonline.com | 50 | 261K | 112K | 3.6M | 18.5K | 4.5 |
| askgamblers.com | 51 | 182K | 106K | 1.8M | 24K | 4.2 |
| thoughtworks.com | 51 | 125K | 44K | 503K | 20K | 5.78 |
| globant.com | 48 | 140K | 40K | 363K | 10K | 5.73 |

## OUTPUT FORMAT
Return ONLY valid JSON with this structure - no markdown, no explanation.`;
}

/**
 * Elite User Prompt with all collected data
 */
function getGeminiEliteUserPrompt(request) {
  return `# COMPETITOR ANALYSIS REQUEST

## DOMAIN: ${request.domain}

## COLLECTED SIGNALS

### Content Signals (PHP Fetcher - Layer 1)
- Word Count: ${request.contentSignals.wordCount}
- Schema Types: ${JSON.stringify(request.contentSignals.schemaTypes)}
- Schema Count: ${request.contentSignals.schemaCount}
- Has Organization Schema: ${request.contentSignals.hasOrganizationSchema}
- Internal Links: ${request.contentSignals.internalLinks}
- External Links: ${request.contentSignals.externalLinks}
- Has Optimized Title: ${request.contentSignals.hasTitle} (${request.contentSignals.titleLength} chars)
- Has Optimized Description: ${request.contentSignals.hasDescription} (${request.contentSignals.descriptionLength} chars)

### Content Scores (Calculated)
- Content Depth Score: ${request.contentScores.contentDepthScore}/100
- Schema Maturity Score: ${request.contentScores.schemaMaturityScore}/100
- Structure Score: ${request.contentScores.structureScore}/100
- SEO Basics Score: ${request.contentScores.seoBasicsScore}/100
- Content Composite: ${request.contentScores.contentComposite}/100

### API Signals (Layer 2)
- PageRank: ${request.apiSignals.pageRank}
- Domain Rank: ${request.apiSignals.domainRank}
- PageSpeed SEO Score: ${request.apiSignals.seoScore}/100
- PageSpeed Performance: ${request.apiSignals.performanceScore}/100
- PageSpeed Accessibility: ${request.apiSignals.accessibilityScore}/100
- PageSpeed Best Practices: ${request.apiSignals.bestPracticesScore}/100
- SERP Organic Results: ${request.apiSignals.serpOrganicCount}
- Has Knowledge Graph: ${request.apiSignals.hasKnowledgeGraph}

### Current Estimates (Before Gemini Refinement)
- Authority Score: ${request.currentEstimates.authorityScore}
- Organic Keywords: ${request.currentEstimates.organicKeywords}
- Organic Traffic: ${request.currentEstimates.organicTraffic}
- Backlinks: ${request.currentEstimates.backlinks}
- Referring Domains: ${request.currentEstimates.refDomains}
- Cross-Validated: ${request.crossValidated}

## YOUR TASK

1. **Detect Industry**: Analyze domain name and signals to determine site type
2. **Apply Mathematical Models**: Use the formulas from your methodology
3. **Reason Through Estimates**: Show your reasoning chain
4. **Refine All Metrics**: Adjust estimates based on industry patterns
5. **Populate All Fields**: Return comprehensive SEO metrics

## REQUIRED JSON OUTPUT

{
  "reasoning": {
    "industryDetection": "Explain how you determined the industry",
    "signalAnalysis": "Analyze strength of each signal category",
    "mathematicalModel": "Show the key calculations applied",
    "confidenceReasoning": "Explain confidence level determination"
  },
  "detectedIndustry": "gambling|news|saas|ecommerce|finance|affiliate|corporate|general",
  "industryMultipliers": {
    "keywords": 1.0,
    "traffic": 1.0,
    "backlinks": 1.0,
    "authorityAdjustment": 0
  },
  "refinedMetrics": {
    "authorityScore": 50,
    "authorityMomentum": 50,
    "organicKeywords": 100000,
    "organicTraffic": 200000,
    "estimatedTraffic": 200000,
    "backlinks": 500000,
    "estimatedBacklinks": 500000,
    "refDomains": 15000,
    "estimatedRefDomains": 15000,
    "topicalAuthority": 60,
    "eeatSignals": 55,
    "keywordGap": 70,
    "contentDepth": 2500,
    "siteHealth": 75,
    "coreWebVitals": 70,
    "geoPresence": 50,
    "aeoReadiness": 60,
    "overallScore": 65,
    "marketShare": 5.5,
    "growthPotential": 70,
    "competitiveAdvantage": 60,
    "technicalDebt": 25,
    "contentQuality": 70,
    "linkVelocity": 50,
    "brandStrength": 55,
    "serpDominance": 45
  },
  "confidence": {
    "overall": "High|Medium|Low",
    "score": 85,
    "signalStrength": {
      "content": "strong|moderate|weak",
      "authority": "strong|moderate|weak",
      "technical": "strong|moderate|weak",
      "visibility": "strong|moderate|weak"
    }
  },
  "anomaliesDetected": [],
  "recommendations": ["Specific insight 1", "Specific insight 2"]
}`;
}

/**
 * Apply Gemini's elite analysis to metrics
 */
function applyGeminiEliteAnalysis(metrics, analysis) {
  Logger.log(`      Industry: ${analysis.detectedIndustry}`);
  Logger.log(`      Confidence: ${analysis.confidence?.overall} (${analysis.confidence?.score}%)`);
  
  // Store Gemini's reasoning
  metrics.layers.layer3_gemini.applied = true;
  metrics.layers.layer3_gemini.reasoning = analysis.reasoning;
  metrics.layers.layer3_gemini.detectedIndustry = analysis.detectedIndustry;
  metrics.layers.layer3_gemini.industryMultipliers = analysis.industryMultipliers;
  metrics.layers.layer3_gemini.anomaliesDetected = analysis.anomaliesDetected || [];
  metrics.layers.layer3_gemini.recommendations = analysis.recommendations || [];
  
  // Apply ALL refined metrics
  const refined = analysis.refinedMetrics || {};
  
  // Core SEO Metrics
  metrics.authorityScore = refined.authorityScore || metrics.authorityScore;
  metrics.authorityMomentum = refined.authorityMomentum || metrics.authorityScore;
  metrics.organicKeywords = refined.organicKeywords || metrics.organicKeywords;
  metrics.organicTraffic = refined.organicTraffic || metrics.organicTraffic;
  metrics.estimatedTraffic = refined.estimatedTraffic || metrics.organicTraffic;
  metrics.backlinks = refined.backlinks || metrics.backlinks;
  metrics.estimatedBacklinks = refined.estimatedBacklinks || metrics.backlinks;
  metrics.refDomains = refined.refDomains || metrics.refDomains;
  metrics.estimatedRefDomains = refined.estimatedRefDomains || metrics.refDomains;
  
  // Advanced Metrics
  metrics.topicalAuthority = refined.topicalAuthority || 50;
  metrics.eeatSignals = refined.eeatSignals || 50;
  metrics.keywordGap = refined.keywordGap || 50;
  metrics.siteHealth = refined.siteHealth || 50;
  metrics.coreWebVitals = refined.coreWebVitals || 50;
  metrics.geoPresence = refined.geoPresence || 50;
  metrics.aeoReadiness = refined.aeoReadiness || 50;
  metrics.overallScore = refined.overallScore || 50;
  
  // Elite Metrics
  metrics.marketShare = refined.marketShare || 0;
  metrics.growthPotential = refined.growthPotential || 50;
  metrics.competitiveAdvantage = refined.competitiveAdvantage || 50;
  metrics.technicalDebt = refined.technicalDebt || 50;
  metrics.contentQuality = refined.contentQuality || 50;
  metrics.linkVelocity = refined.linkVelocity || 50;
  metrics.brandStrength = refined.brandStrength || 50;
  metrics.serpDominance = refined.serpDominance || 50;
  
  // Site type and confidence
  metrics.siteType = analysis.detectedIndustry || 'general';
  metrics.confidence.overall = analysis.confidence?.overall || 'Medium';
  metrics.confidence.score = analysis.confidence?.score || 60;
  metrics.confidence.signalStrength = analysis.confidence?.signalStrength || {};
  
  Logger.log(`      ─────────────────────────────────────────`);
  Logger.log(`      Refined Authority: ${metrics.authorityScore}`);
  Logger.log(`      Refined Traffic: ${metrics.organicTraffic?.toLocaleString()}`);
  Logger.log(`      Refined Keywords: ${metrics.organicKeywords?.toLocaleString()}`);
  Logger.log(`      Overall Score: ${metrics.overallScore}`);
  
  return metrics;
}

/**
 * Rule-based refinement when Gemini API is unavailable
 * Uses industry patterns and mathematical models locally
 */
function applyRuleBasedRefinement(metrics, competitorData) {
  Logger.log(`      📊 Applying rule-based refinement...`);
  
  const domain = metrics.domain;
  
  // Detect site type
  const siteType = detectSiteType(domain, {
    hasOrganizationSchema: metrics.layers.layer1_phpFetcher?.signals?.hasOrganizationSchema,
    schemaTypes: metrics.layers.layer1_phpFetcher?.signals?.schemaTypes || []
  });
  
  // Industry multipliers
  const industryMultipliers = getIndustryMultipliers(siteType);
  
  // Apply industry adjustments
  const layer2Authority = metrics.authorityScore;
  const layer3Authority = Math.max(15, Math.min(95, layer2Authority + industryMultipliers.authorityAdjustment));
  
  const layer2Keywords = metrics.organicKeywords;
  const layer3Keywords = Math.round(layer2Keywords * industryMultipliers.keywords);
  
  const layer2Traffic = metrics.organicTraffic;
  const layer3Traffic = Math.round(layer2Traffic * industryMultipliers.traffic);
  
  const layer2Backlinks = metrics.backlinks;
  const layer3Backlinks = Math.round(layer2Backlinks * industryMultipliers.backlinks);
  
  const refDomRatio = layer3Authority >= 70 ? 0.015 : layer3Authority >= 50 ? 0.04 : 0.08;
  const layer3RefDomains = Math.max(50, Math.round(layer3Backlinks * refDomRatio));
  
  // Store results
  metrics.layers.layer3_gemini.applied = true;
  metrics.layers.layer3_gemini.method = 'rule-based';
  metrics.layers.layer3_gemini.detectedIndustry = siteType;
  metrics.layers.layer3_gemini.industryMultipliers = industryMultipliers;
  
  // Update metrics
  metrics.authorityScore = layer3Authority;
  metrics.authorityMomentum = layer3Authority;
  metrics.organicKeywords = layer3Keywords;
  metrics.organicTraffic = layer3Traffic;
  metrics.estimatedTraffic = layer3Traffic;
  metrics.backlinks = layer3Backlinks;
  metrics.estimatedBacklinks = layer3Backlinks;
  metrics.refDomains = layer3RefDomains;
  metrics.estimatedRefDomains = layer3RefDomains;
  metrics.siteType = siteType;
  
  Logger.log(`      Industry: ${siteType}`);
  Logger.log(`      Authority: ${layer2Authority} → ${layer3Authority}`);
  
  return metrics;
}

/**
 * Get industry-specific multipliers
 */
function getIndustryMultipliers(siteType) {
  const multipliers = {
    gambling: { keywords: 1.3, traffic: 1.8, backlinks: 2.0, authorityAdjustment: -5 },
    news: { keywords: 2.0, traffic: 3.0, backlinks: 1.5, authorityAdjustment: 5 },
    saas: { keywords: 1.0, traffic: 1.0, backlinks: 1.2, authorityAdjustment: 3 },
    ecommerce: { keywords: 1.5, traffic: 0.8, backlinks: 1.8, authorityAdjustment: 0 },
    finance: { keywords: 1.2, traffic: 1.5, backlinks: 1.6, authorityAdjustment: 5 },
    affiliate: { keywords: 1.4, traffic: 1.2, backlinks: 2.2, authorityAdjustment: -3 },
    corporate: { keywords: 0.9, traffic: 0.8, backlinks: 1.0, authorityAdjustment: 2 },
    general: { keywords: 1.0, traffic: 1.0, backlinks: 1.0, authorityAdjustment: 0 }
  };
  
  return multipliers[siteType] || multipliers.general;
}

/**
 * Populate ALL remaining fields with calculated values
 * Ensures no N/A or 0 values in the final output
 */
function populateAllFields(metrics, competitorData) {
  const layer1 = metrics.layers.layer1_phpFetcher || {};
  const layer2 = metrics.layers.layer2_freeAPIs || {};
  
  // ─────────────────────────────────────────────────────────────────────────
  // CORE SEO METRICS (ensure all are populated)
  // ─────────────────────────────────────────────────────────────────────────
  metrics.authorityScore = metrics.authorityScore || 30;
  metrics.authorityMomentum = metrics.authorityMomentum || metrics.authorityScore;
  metrics.organicKeywords = metrics.organicKeywords || 1000;
  metrics.organicTraffic = metrics.organicTraffic || 500;
  metrics.estimatedTraffic = metrics.estimatedTraffic || metrics.organicTraffic;
  metrics.backlinks = metrics.backlinks || 5000;
  metrics.estimatedBacklinks = metrics.estimatedBacklinks || metrics.backlinks;
  metrics.refDomains = metrics.refDomains || 500;
  metrics.estimatedRefDomains = metrics.estimatedRefDomains || metrics.refDomains;
  
  // ─────────────────────────────────────────────────────────────────────────
  // PAGESPEED METRICS
  // ─────────────────────────────────────────────────────────────────────────
  metrics.seoScore = metrics.seoScore || 50;
  metrics.performanceScore = metrics.performanceScore || 50;
  metrics.accessibilityScore = metrics.accessibilityScore || 50;
  metrics.bestPracticesScore = metrics.bestPracticesScore || 50;
  metrics.pageSpeed = metrics.performanceScore;
  metrics.pageSpeedAvg = metrics.pageSpeedAvg || Math.round(
    (metrics.seoScore + metrics.performanceScore + metrics.accessibilityScore + metrics.bestPracticesScore) / 4
  );
  
  // ─────────────────────────────────────────────────────────────────────────
  // AUTHORITY METRICS
  // ─────────────────────────────────────────────────────────────────────────
  metrics.pageRank = metrics.pageRank || 3;
  metrics.domainRank = metrics.domainRank || 500000;
  
  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT METRICS
  // ─────────────────────────────────────────────────────────────────────────
  metrics.contentDepth = metrics.contentDepth || layer1.signals?.wordCount || 500;
  metrics.wordCount = metrics.contentDepth;
  metrics.schemaCount = metrics.schemaCount || layer1.signals?.schemaCount || 0;
  metrics.schemaTypes = metrics.schemaTypes || layer1.signals?.schemaTypes || [];
  metrics.hasOrganizationSchema = metrics.hasOrganizationSchema || layer1.signals?.hasOrganizationSchema || false;
  metrics.internalLinks = metrics.internalLinks || layer1.signals?.internalLinks || 0;
  metrics.externalLinks = metrics.externalLinks || layer1.signals?.externalLinks || 0;
  
  // ─────────────────────────────────────────────────────────────────────────
  // CALCULATED COMPOSITE SCORES
  // ─────────────────────────────────────────────────────────────────────────
  
  // Site Health (weighted composite of PageSpeed scores)
  metrics.siteHealth = metrics.siteHealth || Math.round(
    (metrics.seoScore * 0.4) + (metrics.performanceScore * 0.3) + 
    (metrics.accessibilityScore * 0.15) + (metrics.bestPracticesScore * 0.15)
  );
  
  // Core Web Vitals (average of PageSpeed)
  metrics.coreWebVitals = metrics.coreWebVitals || metrics.pageSpeedAvg;
  
  // Topical Authority (content depth + keywords)
  const contentScore = metrics.contentDepth > 3000 ? 80 : metrics.contentDepth > 1500 ? 60 : 
                       metrics.contentDepth > 500 ? 40 : 20;
  const keywordScore = metrics.organicKeywords > 5000 ? 90 : metrics.organicKeywords > 1000 ? 75 : 
                       metrics.organicKeywords > 100 ? 55 : 35;
  metrics.topicalAuthority = metrics.topicalAuthority || Math.round((contentScore + keywordScore) / 2);
  
  // E-E-A-T Signals (schema + organization + SEO)
  const schemaScore = metrics.schemaCount > 3 ? 80 : metrics.schemaCount > 0 ? 50 : 20;
  const orgScore = metrics.hasOrganizationSchema ? 80 : 30;
  metrics.eeatSignals = metrics.eeatSignals || Math.round((schemaScore + orgScore + metrics.seoScore) / 3);
  
  // Keyword Gap (based on organic keywords - calibrated)
  metrics.keywordGap = metrics.keywordGap || (
    metrics.organicKeywords > 50000 ? 95 : 
    metrics.organicKeywords > 10000 ? 85 :
    metrics.organicKeywords > 1000 ? 70 :
    metrics.organicKeywords > 100 ? 50 : 30
  );
  
  // GEO Presence (traffic + authority based)
  metrics.geoPresence = metrics.geoPresence || Math.round(
    (metrics.authorityScore + Math.min(100, metrics.organicTraffic / 5000)) / 2
  );
  
  // AEO Readiness (schema + SEO score)
  metrics.aeoReadiness = metrics.aeoReadiness || Math.round((schemaScore + metrics.seoScore) / 2);
  
  // Overall Score (weighted composite)
  metrics.overallScore = metrics.overallScore || Math.round(
    (metrics.siteHealth * 0.25) +
    (metrics.authorityScore * 0.25) +
    (metrics.topicalAuthority * 0.20) +
    (metrics.eeatSignals * 0.15) +
    (metrics.keywordGap * 0.15)
  );
  
  // ─────────────────────────────────────────────────────────────────────────
  // ELITE STRATEGIC METRICS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Market Share (estimated based on traffic relative to industry)
  metrics.marketShare = metrics.marketShare || Math.min(25, metrics.organicTraffic / 50000);
  
  // Growth Potential (inverse of current authority - room to grow)
  metrics.growthPotential = metrics.growthPotential || Math.max(20, 100 - metrics.authorityScore);
  
  // Competitive Advantage (authority + content quality)
  metrics.competitiveAdvantage = metrics.competitiveAdvantage || Math.round(
    (metrics.authorityScore * 0.5) + (metrics.topicalAuthority * 0.3) + (metrics.eeatSignals * 0.2)
  );
  
  // Technical Debt (inverse of site health)
  metrics.technicalDebt = metrics.technicalDebt || Math.max(0, 100 - metrics.siteHealth);
  
  // Content Quality (content depth + SEO basics)
  metrics.contentQuality = metrics.contentQuality || Math.round(
    (layer1.estimates?.contentDepthScore || 50) * 0.6 + 
    (layer1.estimates?.seoBasicsScore || 50) * 0.4
  );
  
  // Link Velocity (estimated from backlinks and authority)
  metrics.linkVelocity = metrics.linkVelocity || Math.round(
    Math.min(100, (metrics.backlinks / 10000) + (metrics.authorityScore * 0.5))
  );
  
  // Brand Strength (knowledge graph + organization schema + authority)
  metrics.brandStrength = metrics.brandStrength || Math.round(
    (metrics.hasKnowledgeGraph ? 40 : 0) + 
    (metrics.hasOrganizationSchema ? 20 : 0) + 
    (metrics.authorityScore * 0.4)
  );
  
  // SERP Dominance (SERP count + authority)
  metrics.serpDominance = metrics.serpDominance || Math.round(
    ((metrics.serpOrganicCount || 0) * 5) + (metrics.authorityScore * 0.5)
  );
  
  // ─────────────────────────────────────────────────────────────────────────
  // SERP DATA
  // ─────────────────────────────────────────────────────────────────────────
  metrics.serpOrganicCount = metrics.serpOrganicCount || 0;
  metrics.hasKnowledgeGraph = metrics.hasKnowledgeGraph || false;
  metrics.topRankings = metrics.topRankings || [];
  
  // ─────────────────────────────────────────────────────────────────────────
  // RAG READINESS (for AI citation optimization)
  // ─────────────────────────────────────────────────────────────────────────
  metrics.ragReadiness = {
    schemaScore: Math.min(100, metrics.schemaCount * 15 + (metrics.hasOrganizationSchema ? 25 : 0)),
    contentDepthScore: Math.min(100, metrics.contentDepth / 30),
    semanticStructureScore: Math.min(100, (metrics.internalLinks / 2) + metrics.schemaCount * 10),
    overallScore: 0
  };
  metrics.ragReadiness.overallScore = Math.round(
    (metrics.ragReadiness.schemaScore + metrics.ragReadiness.contentDepthScore + 
     metrics.ragReadiness.semanticStructureScore) / 3
  );
  
  // ─────────────────────────────────────────────────────────────────────────
  // CVR IMPACT (Conversion Rate Penalty from speed)
  // ─────────────────────────────────────────────────────────────────────────
  // Every 100ms delay = 1% conversion drop (Google research)
  metrics.cvrImpact = {
    speedScore: metrics.performanceScore,
    estimatedPenalty: Math.max(0, Math.round((100 - metrics.performanceScore) * 0.15)),
    revenueImpact: 'Low'
  };
  if (metrics.cvrImpact.estimatedPenalty > 10) metrics.cvrImpact.revenueImpact = 'High';
  else if (metrics.cvrImpact.estimatedPenalty > 5) metrics.cvrImpact.revenueImpact = 'Medium';
  
  // ─────────────────────────────────────────────────────────────────────────
  // METADATA FLAGS
  // ─────────────────────────────────────────────────────────────────────────
  metrics.isEstimate = true;
  metrics.estimationMethod = metrics.layers.layer3_gemini?.method === 'rule-based' 
    ? 'Data Pipeline v2.0 (Rule-Based)' 
    : 'Data Pipeline v2.0 (Gemini Elite)';
  metrics.confidenceLevel = metrics.confidence?.overall || 'Medium';
  
  return metrics;
}

/**
 * Calculate final confidence score based on all layers
 */
function calculateFinalConfidence(metrics) {
  let qualityScore = 0;
  
  // Layer 1 contribution (content signals)
  if (metrics.layers.layer1_phpFetcher.applied) {
    const contentComposite = metrics.layers.layer1_phpFetcher.estimates?.contentComposite || 0;
    qualityScore += contentComposite * 0.3;
  }
  
  // Layer 2 contribution (API validation)
  if (metrics.layers.layer2_freeAPIs.applied) {
    const validations = metrics.layers.layer2_freeAPIs.validations;
    if (validations.openPageRank.available) qualityScore += 20;
    if (validations.pageSpeed.available) qualityScore += 10;
    if (validations.serper.available) qualityScore += 15;
    if (validations.openPageRank.validates) qualityScore += 10;
    if (validations.serper.validates) qualityScore += 10;
  }
  
  // Layer 3 contribution (Gemini/rule-based)
  if (metrics.layers.layer3_gemini.applied) {
    qualityScore += metrics.layers.layer3_gemini.method === 'rule-based' ? 5 : 15;
  }
  
  // Normalize to 0-100
  qualityScore = Math.min(100, qualityScore);
  metrics.confidence.dataQuality = Math.round(qualityScore);
  
  // Determine confidence level
  if (qualityScore >= 70 && metrics.confidence.crossValidated) {
    metrics.confidence.overall = 'High';
  } else if (qualityScore >= 50) {
    metrics.confidence.overall = 'Medium';
  } else {
    metrics.confidence.overall = 'Low';
  }
  
  return metrics;
}

/**
 * Detect site type from domain patterns
 */
function detectSiteType(domain, signals) {
  const lowerDomain = domain.toLowerCase();
  
  // Gambling patterns
  if (lowerDomain.match(/casino|bet|poker|slots?|gambl|vegas|jackpot|spin/)) {
    return 'gambling';
  }
  
  // News/Media patterns
  if (lowerDomain.match(/news|daily|times|post|herald|tribune|magazine|blog/)) {
    return 'news';
  }
  
  // Tech/SaaS patterns
  if (lowerDomain.match(/\.(io|ai|app|dev|tech)$/) || 
      lowerDomain.match(/cloud|api|software|saas|platform/)) {
    return 'saas';
  }
  
  // E-commerce patterns
  if (lowerDomain.match(/shop|store|buy|cart|market|mall/)) {
    return 'ecommerce';
  }
  
  // Affiliate/Review patterns
  if (lowerDomain.match(/review|compare|best|top|rating|versus/)) {
    return 'affiliate';
  }
  
  // Corporate patterns
  if (signals?.hasOrganizationSchema) {
    return 'corporate';
  }
  
  return 'general';
}

/**
 * Get minimal metrics when pipeline fails
 */
function getMinimalMetrics(domain, reason) {
  return {
    domain: domain,
    authorityScore: 30,
    organicKeywords: 1000,
    organicTraffic: 500,
    backlinks: 5000,
    refDomains: 500,
    siteType: 'unknown',
    confidence: {
      overall: 'Low',
      dataQuality: 0,
      crossValidated: false
    },
    pipelineError: reason
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY - Legacy function wrappers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Legacy wrapper: Calls the new pipeline
 * @deprecated Use DATAPIPELINE_processCompetitor instead
 */
function SMARTFALLBACK_estimateMetrics(competitorData, domain) {
  return DATAPIPELINE_processCompetitor(competitorData, domain, 'gemini-3-flash-preview');
}

/**
 * Check if competitor data needs processing
 */
function SMARTFALLBACK_needsEstimation(processedMetrics) {
  if (!processedMetrics) return true;
  
  const criticalFields = [
    'authorityScore',
    'organicKeywords',
    'estimatedTraffic',
    'backlinks',
    'refDomains'
  ];
  
  for (const field of criticalFields) {
    const value = processedMetrics[field];
    if (value === undefined || value === null || value === 0 || value === 'N/A') {
      return true;
    }
  }
  
  return false;
}

/**
 * Process competitor through data pipeline and merge with existing metrics
 */
function SMARTFALLBACK_fixZeroValues(competitorData) {
  const domain = competitorData.domain || 'unknown';
  const existingMetrics = competitorData.processedMetrics || {};
  
  // Check if we need to process
  if (!SMARTFALLBACK_needsEstimation(existingMetrics)) {
    Logger.log(`   ✓ ${domain}: All metrics are valid, no processing needed`);
    return existingMetrics;
  }
  
  Logger.log(`   🔄 ${domain}: Running data pipeline to fill gaps...`);
  
  // Run the full pipeline
  const pipelineResult = DATAPIPELINE_processCompetitor(competitorData, domain, 'gemini-3-flash-preview');
  
  // Merge: Keep existing valid values, fill gaps with pipeline results
  const mergedMetrics = Object.assign({}, existingMetrics);
  
  // Only fill if current value is 0, null, undefined, or 'N/A'
  const fieldsToCheck = {
    'authorityScore': 'authorityScore',
    'authorityMomentum': 'authorityScore',
    'organicKeywords': 'organicKeywords',
    'estimatedTraffic': 'organicTraffic',
    'organicTraffic': 'organicTraffic',
    'backlinks': 'backlinks',
    'estimatedBacklinks': 'backlinks',
    'refDomains': 'refDomains',
    'estimatedRefDomains': 'refDomains',
    'pageRank': 'pageRank',
    'seoScore': 'seoScore',
    'performanceScore': 'performanceScore'
  };
  
  for (const [targetField, sourceField] of Object.entries(fieldsToCheck)) {
    const currentValue = mergedMetrics[targetField];
    if (currentValue === undefined || currentValue === null || currentValue === 0 || currentValue === 'N/A') {
      if (pipelineResult[sourceField] !== undefined) {
        mergedMetrics[targetField] = pipelineResult[sourceField];
      }
    }
  }
  
  // Add pipeline metadata
  mergedMetrics.estimationMethod = 'Data Pipeline v2.0';
  mergedMetrics.confidenceLevel = pipelineResult.confidence?.overall || 'Medium';
  mergedMetrics.siteType = pipelineResult.siteType || 'unknown';
  mergedMetrics.pipelineApplied = true;
  
  Logger.log(`   ✅ ${domain}: Merged metrics - Auth=${mergedMetrics.authorityScore}, Traffic=${mergedMetrics.estimatedTraffic?.toLocaleString()}`);
  
  return mergedMetrics;
}

/**
 * Batch process all competitors through the data pipeline
 */
function SMARTFALLBACK_fixAllCompetitors(competitors) {
  if (!Array.isArray(competitors)) return competitors;
  
  Logger.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  DATA PIPELINE: Processing ${competitors.length} competitors                 ║`);
  Logger.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  competitors.forEach(function(comp) {
    if (!comp || typeof comp !== 'object') return;
    
    if (SMARTFALLBACK_needsEstimation(comp.processedMetrics)) {
      comp.processedMetrics = SMARTFALLBACK_fixZeroValues(comp);
      processedCount++;
    } else {
      skippedCount++;
    }
  });
  
  Logger.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  PIPELINE COMPLETE: ${processedCount} processed, ${skippedCount} skipped            ║`);
  Logger.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
  
  return competitors;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test the data pipeline with sample data
 */
function TEST_DataPipeline() {
  const testData = {
    domain: 'example.com',
    snapshot: {
      metadata: {
        title: 'Example Domain - Your Trusted Solution',
        description: 'Example.com provides enterprise solutions for businesses worldwide.',
        h1: 'Welcome to Example',
        wordCount: 2500
      },
      schema: {
        types: ['Organization', 'WebSite', 'FAQPage'],
        hasOrganizationSchema: true
      },
      links: {
        internal: new Array(35).fill({ href: '/page' }),
        external: new Array(8).fill({ href: 'https://other.com' })
      }
    },
    apiData: {
      openPageRank: {
        page_rank_decimal: 5.2,
        rank: 150000
      },
      pageSpeed: {
        scores: {
          seo: 92,
          performance: 78,
          accessibility: 85,
          best_practices: 88
        }
      },
      serper: {
        organic: new Array(7).fill({ title: 'Test', position: 1 }),
        knowledgeGraph: null
      }
    }
  };
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST: Data Pipeline');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  const result = DATAPIPELINE_processCompetitor(testData, 'example.com', 'gemini-3-flash-preview');
  
  Logger.log('\n=== FINAL RESULT ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  return result;
}

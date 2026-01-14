/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * WORKER_ANALYZE.GS - ORACLE ELITE v22.0 PARALLEL TASK-CLUSTER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * ATOMIC ANALYSIS WORKER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Execute Gemini AI analysis for a SINGLE competitor
 * - Processes one competitor at a time (chunked analysis)
 * - Uses optimized prompts for fast response
 * - Returns structured insights with confidence scores
 * 
 * PARALLEL STRATEGY:
 * ┌──────────────────────────────────────────────────────────────────────────────────────┐
 * │  After Worker_Fetch completes → Worker_Analyze runs                                 │
 * │     ↓                                                                                │
 * │  Each competitor gets dedicated Gemini analysis:                                     │
 * │     [Technical] [Content] [Authority] [Keywords] [Opportunities]                    │
 * │     ↓                                                                                │
 * │  Results stored in MySQL job_results for UI hydration                               │
 * └──────────────────────────────────────────────────────────────────────────────────────┘
 * 
 * EXECUTION TIME:
 * - Single competitor: ~3-5 seconds (optimized prompt)
 * - 6 competitors: ~6-10 seconds total (parallel execution)
 * 
 * @version 22.0.0-cluster
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

const WORKER_ANALYZE_VERSION = '22.0.0-cluster';

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const ANALYZE_CONFIG = {
  // Gemini settings
  MODEL: 'gemini-2.0-flash',      // Fast model for per-competitor analysis
  TEMPERATURE: 0.6,                // Balanced creativity/accuracy
  MAX_TOKENS: 4000,                // Per-competitor response size
  
  // Analysis categories (15 elite categories)
  CATEGORIES: [
    'technicalSEO',
    'contentIntelligence',
    'keywordStrategy',
    'authorityMetrics',
    'performanceBenchmarks',
    'marketPositioning',
    'brandMessaging',
    'conversionOptimization',
    'distributionChannels',
    'audienceIntelligence',
    'geoAeoStrategy',
    'contentSystems',
    'competitiveScoring',
    'opportunityAnalysis',
    'strategicOverview'
  ],
  
  // Timeout settings
  TIMEOUT_MS: 30000               // 30 second timeout for Gemini
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - Called by Cluster Controller
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Execute Gemini analysis for a single competitor
 * This is the atomic unit of work - one competitor, comprehensive analysis
 * 
 * @param {string} jobToken - Parent job identifier
 * @param {string} competitorId - Unique competitor identifier
 * @param {string} domain - Competitor domain
 * @param {Object} fetchData - Data from Worker_Fetch (synthesized + stages)
 * @param {string} yourDomain - Client's domain for comparison
 * @param {Object} options - Optional configuration
 * @return {Object} AnalysisResult with insights and recommendations
 */
function Worker_AnalyzeCompetitor(jobToken, competitorId, domain, fetchData, yourDomain, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  WORKER_ANALYZE v${WORKER_ANALYZE_VERSION} - GEMINI AI ANALYSIS          ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Job: ${jobToken.substring(0, 20)}...                                   `);
  Logger.log(`║  Competitor: ${domain.padEnd(50)}   `);
  Logger.log(`║  Your Domain: ${(yourDomain || 'N/A').padEnd(48)}   `);
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitorId: competitorId,
    domain: domain,
    analysis: {},
    categories: {},
    scores: {},
    recommendations: [],
    proofTraces: [],
    executionTimeMs: 0,
    analyzedAt: new Date().toISOString()
  };
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Update job status to ANALYZING
    // ═══════════════════════════════════════════════════════════════════════
    Worker_UpdateTaskStatus(jobToken, competitorId, 'ANALYZE', 'RUNNING');
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'analyzing', current_phase: 'ANALYZE', phase_progress: 40 });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Build optimized analysis prompt
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📋 Phase 1: Building optimized analysis prompt...`);
    
    const prompt = buildCompetitorAnalysisPrompt(domain, fetchData, yourDomain);
    
    // Add proof trace
    result.proofTraces.push({
      phase: 'PROMPT_BUILD',
      promptLength: prompt.length,
      dataPointsIncluded: countDataPoints(fetchData),
      timestamp: new Date().toISOString()
    });
    
    Logger.log(`   ✅ Prompt built: ${prompt.length} chars, ${countDataPoints(fetchData)} data points`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Call Gemini API via Gateway
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🤖 Phase 2: Calling Gemini (${ANALYZE_CONFIG.MODEL})...`);
    const geminiStartTime = Date.now();
    
    const geminiResult = callGateway('gemini:generate', {
      model: ANALYZE_CONFIG.MODEL,
      prompt: prompt,
      options: {
        temperature: ANALYZE_CONFIG.TEMPERATURE,
        maxTokens: ANALYZE_CONFIG.MAX_TOKENS,
        responseFormat: 'json'
      }
    });
    
    const geminiTime = Date.now() - geminiStartTime;
    
    // Add proof trace
    result.proofTraces.push({
      phase: 'GEMINI_CALL',
      model: ANALYZE_CONFIG.MODEL,
      success: geminiResult?.success || false,
      durationMs: geminiTime,
      responseLength: geminiResult?.content?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    Logger.log(`   ⚡ Gemini response: ${geminiTime}ms`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Parse and validate Gemini response
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📊 Phase 3: Parsing analysis...`);
    
    if (geminiResult?.success && geminiResult?.content) {
      const parsed = parseGeminiResponse(geminiResult.content);
      result.analysis = parsed;
      result.categories = parsed.categories || {};
      result.scores = parsed.scores || {};
      result.recommendations = parsed.recommendations || [];
      result.success = true;
      
      Logger.log(`   ✅ Analysis parsed: ${Object.keys(result.categories).length} categories`);
    } else {
      // Gemini failed - use fallback analysis
      Logger.log(`   ⚠️ Gemini failed, using fallback analysis...`);
      result.analysis = generateFallbackAnalysis(domain, fetchData);
      result.categories = result.analysis.categories || {};
      result.scores = result.analysis.scores || {};
      result.success = true; // Fallback still provides useful data
      result.usedFallback = true;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Calculate composite scores
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📈 Phase 4: Calculating composite scores...`);
    
    result.compositeScore = calculateCompositeScore(result.scores, fetchData);
    result.categoryRankings = rankCategories(result.categories);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Store results in MySQL
    // ═══════════════════════════════════════════════════════════════════════
    const resultId = Utilities.getUuid();
    
    try {
      storeJobResult(jobToken, competitorId, 'GEMINI_ANALYSIS', {
        analysis: result.analysis,
        categories: result.categories,
        scores: result.scores,
        compositeScore: result.compositeScore,
        recommendations: result.recommendations
      }, resultId);
      
      Logger.log(`   💾 Analysis stored: ${resultId}`);
    } catch (storeError) {
      Logger.log(`   ⚠️ Storage warning: ${storeError.toString()}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7: Update task status to COMPLETED
    // ═══════════════════════════════════════════════════════════════════════
    result.executionTimeMs = Date.now() - startTime;
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'ANALYZE', 'COMPLETED', null, resultId);
    Worker_UpdateMetrics(jobToken, competitorId, {
      status: 'saving',
      current_phase: 'PERSIST',
      phase_progress: 80,
      content_score: result.scores.contentIntelligence || 0,
      performance_score: result.scores.performanceBenchmarks || 0,
      has_gemini_analysis: true
    });
    
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    Logger.log(`   ✅ ANALYZE COMPLETE: ${Object.keys(result.categories).length} categories | ${result.executionTimeMs}ms`);
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
    
    Worker_UpdateTaskStatus(jobToken, competitorId, 'ANALYZE', 'FAILED', error.toString());
    Worker_UpdateMetrics(jobToken, competitorId, { status: 'failed', current_phase: 'ANALYZE' });
    
    Logger.log(`   ❌ ANALYZE FAILED: ${error.toString()}`);
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER - Optimized per-competitor analysis prompt
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build optimized analysis prompt for single competitor
 * Focuses on actionable insights, not verbose descriptions
 */
function buildCompetitorAnalysisPrompt(domain, fetchData, yourDomain) {
  const synth = fetchData.synthesized || {};
  const stages = fetchData.stages || {};
  
  let prompt = `# Single Competitor Analysis: ${domain}\n\n`;
  
  if (yourDomain) {
    prompt += `**Benchmark Against:** ${yourDomain}\n\n`;
  }
  
  prompt += `## Available Data:\n\n`;
  
  // Website metadata
  if (synth.website) {
    prompt += `### Website Metadata\n`;
    prompt += `- Title: ${synth.website.title || 'N/A'}\n`;
    prompt += `- Description: ${synth.website.description || 'N/A'}\n`;
    prompt += `- H1: ${synth.website.h1 || 'N/A'}\n`;
    prompt += `- Word Count: ${synth.website.wordCount || 0}\n`;
    prompt += `- Schema Types: ${(synth.website.schemaTypes || []).join(', ') || 'None'}\n\n`;
  }
  
  // Technical metrics
  if (synth.technical) {
    prompt += `### Technical SEO (PageSpeed)\n`;
    prompt += `- Performance: ${synth.technical.performanceScore || 0}/100\n`;
    prompt += `- Accessibility: ${synth.technical.accessibilityScore || 0}/100\n`;
    prompt += `- SEO Score: ${synth.technical.seoScore || 0}/100\n`;
    prompt += `- Best Practices: ${synth.technical.bestPracticesScore || 0}/100\n`;
    prompt += `- Core Web Vitals: ${JSON.stringify(synth.technical.coreWebVitals || {})}\n\n`;
  }
  
  // Authority metrics
  if (synth.authority) {
    prompt += `### Authority Metrics\n`;
    prompt += `- PageRank: ${synth.authority.pageRank || 0}\n`;
    prompt += `- Domain Rank: ${synth.authority.domainRank || 0}\n\n`;
  }
  
  // Traffic estimation
  if (synth.traffic) {
    prompt += `### Traffic (Triangulated Estimate)\n`;
    prompt += `- Monthly Estimate: ${synth.traffic.estimate || 0}\n`;
    prompt += `- Confidence: ${synth.traffic.confidenceLevel || 'low'}\n`;
    prompt += `- Factors: ${JSON.stringify(synth.traffic.factors || {})}\n\n`;
  }
  
  // SEO data
  if (synth.seo) {
    prompt += `### SEO Intelligence\n`;
    prompt += `- Indexed Pages: ${synth.seo.indexedPages || 0}\n`;
    const topPages = synth.seo.topPages || [];
    if (topPages.length > 0) {
      prompt += `- Top Ranking Pages:\n`;
      topPages.slice(0, 5).forEach((page, i) => {
        prompt += `  ${i+1}. ${page.title || page.url} (Position: ${page.position || 'N/A'})\n`;
      });
    }
    prompt += `\n`;
  }
  
  // SERP features
  if (synth.serpFeatures) {
    prompt += `### SERP Features\n`;
    const paa = synth.serpFeatures.peopleAlsoAsk || [];
    if (paa.length > 0) {
      prompt += `- People Also Ask: ${paa.slice(0, 3).map(p => p.question || p).join('; ')}\n`;
    }
    const related = synth.serpFeatures.relatedSearches || [];
    if (related.length > 0) {
      prompt += `- Related Searches: ${related.slice(0, 5).map(r => r.query || r).join(', ')}\n`;
    }
    if (synth.serpFeatures.knowledgeGraph) {
      prompt += `- Has Knowledge Graph: Yes\n`;
    }
    if (synth.serpFeatures.featuredSnippet) {
      prompt += `- Has Featured Snippet: Yes\n`;
    }
    prompt += `\n`;
  }
  
  // Analysis requirements
  prompt += `## Analysis Requirements:\n\n`;
  prompt += `Provide analysis across these categories (score 0-100 for each):\n\n`;
  
  prompt += `1. **technicalSEO** - Site health, performance optimization\n`;
  prompt += `2. **contentIntelligence** - Content quality, depth, strategy\n`;
  prompt += `3. **keywordStrategy** - Target keywords, ranking potential\n`;
  prompt += `4. **authorityMetrics** - Domain authority, trust signals\n`;
  prompt += `5. **performanceBenchmarks** - Speed, UX, Core Web Vitals\n`;
  prompt += `6. **marketPositioning** - Market share, positioning\n`;
  prompt += `7. **brandMessaging** - Brand strength, messaging clarity\n`;
  prompt += `8. **opportunityAnalysis** - Gaps to exploit, weaknesses\n\n`;
  
  prompt += `## Output Format (JSON):\n\n`;
  prompt += `\`\`\`json\n`;
  prompt += `{\n`;
  prompt += `  "domain": "${domain}",\n`;
  prompt += `  "summary": "2-3 sentence executive summary",\n`;
  prompt += `  "scores": {\n`;
  prompt += `    "technicalSEO": 0-100,\n`;
  prompt += `    "contentIntelligence": 0-100,\n`;
  prompt += `    "keywordStrategy": 0-100,\n`;
  prompt += `    "authorityMetrics": 0-100,\n`;
  prompt += `    "performanceBenchmarks": 0-100,\n`;
  prompt += `    "marketPositioning": 0-100,\n`;
  prompt += `    "brandMessaging": 0-100,\n`;
  prompt += `    "opportunityAnalysis": 0-100\n`;
  prompt += `  },\n`;
  prompt += `  "categories": {\n`;
  prompt += `    "technicalSEO": {\n`;
  prompt += `      "insight": "Key finding",\n`;
  prompt += `      "strengths": ["strength1"],\n`;
  prompt += `      "weaknesses": ["weakness1"],\n`;
  prompt += `      "recommendation": "Action to take"\n`;
  prompt += `    }\n`;
  prompt += `  },\n`;
  prompt += `  "recommendations": [\n`;
  prompt += `    {"priority": "HIGH|MEDIUM|LOW", "action": "...", "impact": "..."}\n`;
  prompt += `  ],\n`;
  prompt += `  "threatLevel": "HIGH|MEDIUM|LOW",\n`;
  prompt += `  "opportunityScore": 0-100\n`;
  prompt += `}\n`;
  prompt += `\`\`\`\n\n`;
  
  prompt += `IMPORTANT: Only use the data provided. Do not invent metrics. If data is missing, score as 0 and note "insufficient data".`;
  
  return prompt;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESPONSE PARSER - Extract structured data from Gemini response
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Parse Gemini response into structured analysis
 */
function parseGeminiResponse(content) {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.scores) {
        parsed.scores = {};
      }
      if (!parsed.categories) {
        parsed.categories = {};
      }
      if (!parsed.recommendations) {
        parsed.recommendations = [];
      }
      
      return parsed;
    }
    
    // Fallback: return raw content
    return {
      summary: content.substring(0, 500),
      scores: {},
      categories: {},
      recommendations: [],
      rawContent: content,
      parseWarning: 'JSON extraction failed'
    };
    
  } catch (error) {
    Logger.log(`Parse error: ${error.toString()}`);
    return {
      summary: 'Analysis parsing failed',
      scores: {},
      categories: {},
      recommendations: [],
      parseError: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FALLBACK ANALYSIS - When Gemini fails, generate from raw data
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate fallback analysis from raw fetch data
 * Uses deterministic calculations - NO random data
 */
function generateFallbackAnalysis(domain, fetchData) {
  const synth = fetchData.synthesized || {};
  
  // Calculate scores from raw data
  const scores = {
    technicalSEO: calculateTechnicalScore(synth.technical),
    contentIntelligence: calculateContentScore(synth.website, synth.seo),
    keywordStrategy: calculateKeywordScore(synth.seo, synth.serpFeatures),
    authorityMetrics: calculateAuthorityScore(synth.authority),
    performanceBenchmarks: synth.technical?.performanceScore || 0,
    marketPositioning: calculateMarketScore(synth.authority, synth.traffic),
    brandMessaging: calculateBrandScore(synth.website, synth.serpFeatures),
    opportunityAnalysis: 50 // Neutral - requires comparison data
  };
  
  return {
    domain: domain,
    summary: `Automated analysis of ${domain} based on ${countDataPoints(fetchData)} data points.`,
    scores: scores,
    categories: generateCategoryDetails(scores, synth),
    recommendations: generateRecommendations(scores),
    isFallback: true,
    fallbackReason: 'Gemini API unavailable'
  };
}

/**
 * Calculate technical SEO score from PageSpeed data
 */
function calculateTechnicalScore(technical) {
  if (!technical) return 0;
  
  const perf = technical.performanceScore || 0;
  const access = technical.accessibilityScore || 0;
  const seo = technical.seoScore || 0;
  const bp = technical.bestPracticesScore || 0;
  
  // Weighted average
  return Math.round((perf * 0.35) + (access * 0.2) + (seo * 0.3) + (bp * 0.15));
}

/**
 * Calculate content intelligence score
 */
function calculateContentScore(website, seo) {
  let score = 0;
  let factors = 0;
  
  if (website?.wordCount > 0) {
    // More content = higher score (up to 2000 words optimal)
    score += Math.min(100, (website.wordCount / 2000) * 100);
    factors++;
  }
  
  if (website?.schemaTypes?.length > 0) {
    // Schema markup bonus
    score += Math.min(100, website.schemaTypes.length * 20);
    factors++;
  }
  
  if (seo?.indexedPages > 0) {
    // More indexed pages = better content presence
    score += Math.min(100, seo.indexedPages * 10);
    factors++;
  }
  
  return factors > 0 ? Math.round(score / factors) : 0;
}

/**
 * Calculate keyword strategy score
 */
function calculateKeywordScore(seo, serpFeatures) {
  let score = 0;
  let factors = 0;
  
  if (seo?.indexedPages > 0) {
    score += Math.min(80, seo.indexedPages * 8);
    factors++;
  }
  
  if (serpFeatures?.peopleAlsoAsk?.length > 0) {
    // Appearing in PAA indicates keyword relevance
    score += 30;
    factors++;
  }
  
  if (serpFeatures?.relatedSearches?.length > 0) {
    score += 20;
    factors++;
  }
  
  if (serpFeatures?.featuredSnippet) {
    score += 50; // Major SEO win
    factors++;
  }
  
  return factors > 0 ? Math.min(100, Math.round(score / factors)) : 0;
}

/**
 * Calculate authority metrics score
 */
function calculateAuthorityScore(authority) {
  if (!authority?.pageRank) return 0;
  
  // PageRank scale: 0-10, multiply by 10 for 0-100 scale
  return Math.min(100, Math.round(authority.pageRank * 10));
}

/**
 * Calculate market positioning score
 */
function calculateMarketScore(authority, traffic) {
  let score = 0;
  let factors = 0;
  
  if (authority?.pageRank > 0) {
    score += authority.pageRank * 10;
    factors++;
  }
  
  if (traffic?.estimate > 0) {
    // Log scale for traffic
    score += Math.min(100, Math.log10(traffic.estimate + 1) * 20);
    factors++;
  }
  
  return factors > 0 ? Math.round(score / factors) : 0;
}

/**
 * Calculate brand messaging score
 */
function calculateBrandScore(website, serpFeatures) {
  let score = 0;
  
  if (website?.hasOrganizationSchema) {
    score += 30;
  }
  
  if (serpFeatures?.knowledgeGraph) {
    score += 40; // Strong brand signal
  }
  
  if (serpFeatures?.sitelinks?.length > 0) {
    score += 30; // Google trusts this brand
  }
  
  return Math.min(100, score);
}

/**
 * Generate category details from scores
 */
function generateCategoryDetails(scores, synth) {
  const categories = {};
  
  Object.keys(scores).forEach(key => {
    const score = scores[key];
    categories[key] = {
      score: score,
      insight: getScoreInsight(key, score),
      strengths: score >= 70 ? [`Strong ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`] : [],
      weaknesses: score < 50 ? [`Needs improvement in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`] : [],
      recommendation: getScoreRecommendation(key, score),
      dataSource: 'fallback_calculation'
    };
  });
  
  return categories;
}

/**
 * Get insight text based on score
 */
function getScoreInsight(category, score) {
  if (score >= 80) return `Excellent performance in ${category}`;
  if (score >= 60) return `Good ${category} foundation with room for optimization`;
  if (score >= 40) return `Average ${category} - opportunities for improvement`;
  if (score >= 20) return `Below average ${category} - needs attention`;
  return `Limited ${category} data available`;
}

/**
 * Get recommendation based on score
 */
function getScoreRecommendation(category, score) {
  if (score >= 80) return 'Maintain current strategy';
  if (score >= 60) return 'Incremental optimizations recommended';
  if (score >= 40) return 'Prioritize improvement in this area';
  if (score >= 20) return 'Significant investment needed';
  return 'Gather more data before making recommendations';
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(scores) {
  const recommendations = [];
  
  // Sort by lowest scores (biggest opportunities)
  const sortedScores = Object.entries(scores)
    .sort((a, b) => a[1] - b[1]);
  
  sortedScores.slice(0, 3).forEach(([category, score], index) => {
    if (score < 70) {
      recommendations.push({
        priority: index === 0 ? 'HIGH' : (index === 1 ? 'MEDIUM' : 'LOW'),
        action: `Improve ${category.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        impact: score < 40 ? 'Significant improvement potential' : 'Moderate improvement potential',
        currentScore: score,
        targetScore: Math.min(100, score + 30)
      });
    }
  });
  
  return recommendations;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCORE CALCULATORS - Composite scoring functions
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate composite score across all categories
 */
function calculateCompositeScore(scores, fetchData) {
  const weights = {
    technicalSEO: 0.15,
    contentIntelligence: 0.15,
    keywordStrategy: 0.15,
    authorityMetrics: 0.15,
    performanceBenchmarks: 0.10,
    marketPositioning: 0.10,
    brandMessaging: 0.10,
    opportunityAnalysis: 0.10
  };
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  Object.keys(weights).forEach(key => {
    const score = scores[key] || 0;
    const weight = weights[key] || 0;
    
    if (score > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  });
  
  const composite = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  
  return {
    overall: composite,
    grade: getGrade(composite),
    breakdown: scores,
    confidence: calculateConfidence(scores)
  };
}

/**
 * Get letter grade from score
 */
function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Calculate confidence level based on data completeness
 */
function calculateConfidence(scores) {
  const scoreValues = Object.values(scores);
  const nonZeroCount = scoreValues.filter(s => s > 0).length;
  const totalCategories = scoreValues.length || 1;
  
  const completeness = (nonZeroCount / totalCategories) * 100;
  
  if (completeness >= 80) return 'high';
  if (completeness >= 50) return 'medium';
  return 'low';
}

/**
 * Rank categories by score
 */
function rankCategories(categories) {
  return Object.entries(categories)
    .map(([key, data]) => ({
      category: key,
      score: data.score || 0,
      insight: data.insight || ''
    }))
    .sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Count data points in fetch data for prompt sizing
 */
function countDataPoints(fetchData) {
  let count = 0;
  
  const synth = fetchData.synthesized || {};
  
  if (synth.website) count += Object.keys(synth.website).length;
  if (synth.technical) count += Object.keys(synth.technical).length;
  if (synth.authority) count += Object.keys(synth.authority).length;
  if (synth.seo) count += Object.keys(synth.seo).length;
  if (synth.traffic) count += Object.keys(synth.traffic).length;
  if (synth.content) count += Object.keys(synth.content).length;
  if (synth.serpFeatures) count += Object.keys(synth.serpFeatures).length;
  
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH ANALYSIS - Process multiple competitors (backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze ALL competitors in sequence
 * NOTE: For production, use UI-triggered parallel calls instead
 */
function Worker_AnalyzeAllCompetitors(jobToken, fetchResults, yourDomain, options) {
  const startTime = Date.now();
  const results = {};
  
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  Logger.log(`🤖 BATCH ANALYZE: ${Object.keys(fetchResults).length} competitors`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  Object.keys(fetchResults).forEach((domain, index) => {
    const competitorId = `comp_${index}`;
    const fetchData = fetchResults[domain];
    
    try {
      const result = Worker_AnalyzeCompetitor(jobToken, competitorId, domain, fetchData, yourDomain, options);
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
  Logger.log(`✅ BATCH ANALYZE COMPLETE: ${successCount}/${Object.keys(fetchResults).length} in ${totalTime}ms`);
  Logger.log(`═══════════════════════════════════════════════════════════════════`);
  
  return {
    results: results,
    successCount: successCount,
    totalTime: totalTime
  };
}

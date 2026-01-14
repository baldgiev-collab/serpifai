/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 10: ELITE GEMINI PROMPT
 * Comprehensive Prompts for Gemini API Analysis
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Generate elite-level strategic insights from all extracted data
 * - Comprehensive competitor analysis
 * - Content gap identification
 * - Keyword opportunity analysis
 * - E-E-A-T improvement recommendations
 * - Backlink strategy insights
 * - 15-tab UI data structuring
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// GEMINI PROMPT CONFIGURATION - ELITE 0.1% TIER
// ═══════════════════════════════════════════════════════════════════════════════════

var ELITE_PROMPT_CONFIG = {
  // API Settings - Optimized for strategic depth
  GEMINI_API_KEY: '', // Set via Script Properties
  MODEL: 'gemini-2.5-flash-preview-05-20',
  MAX_TOKENS: 32768,
  TEMPERATURE: 0.4, // Lower for more precise strategic analysis
  
  // API Endpoint - Latest model
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
  
  // Elite prompt types with strategic depth
  PROMPT_TYPES: [
    'comprehensive',
    'content_gaps',
    'keyword_strategy',
    'eeat_improvement',
    'backlink_strategy',
    'heading_optimization',
    'internal_linking',
    'competitive_positioning',
    'market_dominance',      // NEW: McKinsey-level market analysis
    'revenue_impact',        // NEW: Traffic to revenue correlation
    'serp_feature_takeover', // NEW: Featured snippet & PAA domination
    'topical_authority'      // NEW: Semantic authority mapping
  ],
  
  // Elite persona configuration
  PERSONA: {
    role: 'Elite SEO Intelligence Analyst',
    background: 'Former Director of SEO at major enterprise, with experience at Ahrefs, SEMrush, and McKinsey Digital Practice',
    expertise: ['Competitive Intelligence', 'Market Dynamics', 'Revenue Attribution', 'Algorithmic Signals', 'Strategic Positioning'],
    communication_style: 'Data-driven, actionable, executive-level clarity with implementation specifics'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// ELITE SYSTEM INSTRUCTION - TOP 0.1% STRATEGIC ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

const ELITE_SYSTEM_INSTRUCTION = `You are a world-class SEO strategist representing the top 0.1% of digital marketing expertise. Your analysis combines:

🎯 STRATEGIC FRAMEWORKS:
- McKinsey's "7 Degrees of Freedom" for competitive strategy
- Porter's Five Forces adapted for search market dynamics  
- BCG Growth-Share Matrix for keyword portfolio prioritization
- Gartner's Market Guide methodology for competitive positioning

📊 DATA ANALYSIS APPROACH:
- Statistical significance testing on traffic correlations
- Regression analysis on ranking factors
- Cohort analysis for content performance patterns
- Time-series forecasting for trend predictions

💡 INSIGHT GENERATION:
- Root cause analysis, not symptom identification
- Second-order effects of recommendations
- Revenue impact quantification
- Risk-adjusted opportunity scoring

⚡ ACTIONABILITY STANDARDS:
- Every insight must have a specific implementation step
- Timeframe and resource estimation for each action
- Expected outcome with confidence intervals
- Dependencies and prerequisite conditions

CRITICAL: You NEVER provide generic advice. Every recommendation is:
1. Specific to the data provided
2. Quantified with expected impact
3. Prioritized by ROI potential
4. Sequenced for optimal execution`;

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ELITE PROMPT BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * ElitePromptBuilder - Builds comprehensive prompts for Gemini API
 */
class ElitePromptBuilder {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.apiKey = this.props.getProperty('GEMINI_API_KEY') || ELITE_PROMPT_CONFIG.GEMINI_API_KEY;
  }
  
  /**
   * Analyze all pipeline data with Gemini
   * @param {string} clientDomain - Client/user domain
   * @param {Object} competitorData - All extracted competitor data
   * @param {string} analysisType - Type of analysis
   * @returns {Object} Gemini analysis result
   */
  analyzeWithGemini(clientDomain, competitorData, analysisType = 'comprehensive') {
    console.log(`🤖 ElitePrompt: Generating ${analysisType} analysis...`);
    const startTime = Date.now();
    
    // Build the appropriate prompt
    const prompt = this._buildPrompt(clientDomain, competitorData, analysisType);
    
    // Call Gemini API
    const response = this._callGeminiAPI(prompt);
    
    if (!response.success) {
      return response;
    }
    
    // Parse the response
    const parsed = this._parseResponse(response.text, analysisType);
    
    const result = {
      success: true,
      analysisType: analysisType,
      clientDomain: clientDomain,
      competitorsAnalyzed: Object.keys(competitorData).length,
      processingTimeMs: Date.now() - startTime,
      
      // Raw response
      rawResponse: response.text,
      
      // Parsed insights
      insights: parsed,
      
      // Metadata
      model: ELITE_PROMPT_CONFIG.MODEL,
      promptLength: prompt.length,
      responseLength: response.text.length
    };
    
    console.log(`✅ ElitePrompt: Analysis complete in ${result.processingTimeMs}ms`);
    return result;
  }
  
  /**
   * Build prompt based on analysis type
   */
  _buildPrompt(clientDomain, competitorData, analysisType) {
    // Prepare competitor summary
    const competitorSummary = this._summarizeCompetitorData(competitorData);
    
    switch (analysisType) {
      case 'comprehensive':
        return this._buildComprehensivePrompt(clientDomain, competitorSummary);
      case 'content_gaps':
        return this._buildContentGapsPrompt(clientDomain, competitorSummary);
      case 'keyword_strategy':
        return this._buildKeywordStrategyPrompt(clientDomain, competitorSummary);
      case 'eeat_improvement':
        return this._buildEEATPrompt(clientDomain, competitorSummary);
      case 'backlink_strategy':
        return this._buildBacklinkPrompt(clientDomain, competitorSummary);
      default:
        return this._buildComprehensivePrompt(clientDomain, competitorSummary);
    }
  }
  
  /**
   * Build comprehensive analysis prompt - ELITE 0.1% TIER
   */
  _buildComprehensivePrompt(clientDomain, summary) {
    return `${ELITE_SYSTEM_INSTRUCTION}

═══════════════════════════════════════════════════════════════════════════════════
MISSION BRIEFING: COMPETITIVE INTELLIGENCE ANALYSIS
═══════════════════════════════════════════════════════════════════════════════════

Target Domain: ${clientDomain}
Analysis Depth: Executive Strategic Review
Confidence Requirement: 85%+ for all recommendations

═══════════════════════════════════════════════════════════════════════════════════
COMPETITOR INTELLIGENCE DATA
═══════════════════════════════════════════════════════════════════════════════════
${JSON.stringify(summary, null, 2)}

═══════════════════════════════════════════════════════════════════════════════════
STRATEGIC ANALYSIS FRAMEWORK
═══════════════════════════════════════════════════════════════════════════════════

You must analyze this data through FIVE strategic lenses:

📊 LENS 1: MARKET DYNAMICS ANALYSIS
- Identify the market leader and their sustainable competitive advantages
- Map the competitive moat of each player (content depth, authority, user experience)
- Detect market gaps and underserved segments
- Calculate market share estimates based on organic traffic distribution

🎯 LENS 2: OPPORTUNITY QUANTIFICATION  
- Score each opportunity 0-100 based on: (Traffic Potential × Win Probability) / Effort Required
- Estimate monthly traffic gain for top 10 opportunities
- Calculate revenue impact assuming $3-5 CPM or industry-specific conversion rates
- Identify "arbitrage" opportunities (high value, low competition)

⚔️ LENS 3: COMPETITIVE WARFARE STRATEGY
- Identify each competitor's "soft underbelly" (weaknesses to exploit)
- Map attack vectors: content gaps, technical advantages, authority leverage
- Sequence attack priorities by defender strength and prize value
- Estimate time-to-rank for each strategic target

🔬 LENS 4: ALGORITHMIC SIGNAL ANALYSIS
- Identify which ranking signals each competitor optimizes
- Detect E-E-A-T signal patterns (author pages, credentials, citations)
- Analyze topical authority clustering and semantic relationships
- Identify featured snippet and SERP feature patterns

📈 LENS 5: GROWTH TRAJECTORY MODELING
- Project 6-month and 12-month outcomes for each strategic path
- Model compound effects of recommended actions
- Identify leading indicators to track
- Define decision gates for strategy pivots

═══════════════════════════════════════════════════════════════════════════════════
REQUIRED OUTPUT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════

Respond with this EXACT JSON structure. Be ruthlessly specific:

{
  "marketIntelligence": {
    "marketLeader": {
      "domain": "domain.com",
      "sustainableAdvantages": ["specific advantage 1", "specific advantage 2"],
      "vulnerabilities": ["specific vulnerability 1"],
      "marketShareEstimate": 35
    },
    "marketDynamics": {
      "concentration": "consolidated|fragmented|emerging",
      "entryBarriers": "high|medium|low",
      "growthRate": "expanding|stable|contracting",
      "disruptionRisk": "high|medium|low"
    },
    "competitorProfiles": [
      {
        "domain": "competitor.com",
        "strategicPosition": "leader|challenger|niche|follower",
        "primaryStrength": "specific strength",
        "primaryWeakness": "specific weakness",
        "threatLevel": 1-10,
        "opportunityLevel": 1-10
      }
    ]
  },
  
  "opportunityMatrix": {
    "tier1Opportunities": [
      {
        "opportunity": "specific description",
        "opportunityScore": 95,
        "estimatedMonthlyTraffic": 5000,
        "estimatedMonthlyValue": 1500,
        "winProbability": 0.75,
        "effortLevel": "low|medium|high",
        "timeToResults": "2-4 weeks",
        "implementation": "exact steps to execute",
        "dependencies": ["what must happen first"]
      }
    ],
    "tier2Opportunities": [],
    "tier3Opportunities": [],
    "totalAddressableTraffic": 50000,
    "realisticCaptureEstimate": 15000
  },
  
  "contentWarfare": {
    "contentGaps": [
      {
        "topic": "specific topic",
        "competitorsCovering": ["domain1.com", "domain2.com"],
        "avgMonthlySearches": 5000,
        "currentRankingDifficulty": 45,
        "recommendedContentType": "pillar|cluster|guide|comparison",
        "wordCountTarget": 2500,
        "uniqueAngle": "how to differentiate",
        "priority": 1-10
      }
    ],
    "contentUpgrades": [
      {
        "existingContent": "URL or topic if known",
        "currentWeakness": "specific issue",
        "upgradeStrategy": "what to add/change",
        "expectedImpact": "traffic lift estimate"
      }
    ],
    "contentCalendar": [
      {
        "week": 1,
        "content": "title",
        "format": "type",
        "targetKeywords": ["kw1", "kw2"],
        "estimatedTraffic": 1000,
        "rationale": "why this timing"
      }
    ]
  },
  
  "keywordIntelligence": {
    "quickWinKeywords": [
      {
        "keyword": "exact keyword",
        "currentPosition": "competitor position or 'unranked'",
        "monthlySearches": 1000,
        "difficulty": 35,
        "intent": "informational|commercial|transactional|navigational",
        "winStrategy": "specific approach",
        "contentNeeded": "title recommendation",
        "expectedTimeToRank": "2-4 weeks"
      }
    ],
    "strategicKeywords": [],
    "defensiveKeywords": [
      {
        "keyword": "branded or core keyword",
        "currentPosition": 1,
        "threatLevel": "high|medium|low",
        "threatFrom": "competitor.com",
        "defenseStrategy": "how to maintain"
      }
    ],
    "keywordClusters": [
      {
        "clusterName": "topic cluster name",
        "pillarKeyword": "main keyword",
        "clusterKeywords": ["kw1", "kw2", "kw3"],
        "totalSearchVolume": 10000,
        "currentCoverage": 30,
        "targetCoverage": 80,
        "contentPlan": "brief content strategy"
      }
    ]
  },
  
  "technicalAdvantages": {
    "coreWebVitals": {
      "leaderDomain": "who leads",
      "yourGap": "specific metrics gap",
      "fixPriority": ["fix 1", "fix 2"],
      "estimatedImpact": "traffic lift estimate"
    },
    "schemaOpportunities": [
      {
        "schemaType": "FAQPage|HowTo|Product|etc",
        "competitorUsing": "domain.com",
        "serpFeatureEnabled": "rich snippets|knowledge panel|etc",
        "implementationGuide": "brief how-to"
      }
    ],
    "internalLinking": {
      "topOpportunities": [
        {
          "from": "page/topic with authority",
          "to": "page/topic needing boost",
          "anchorText": "recommended anchor",
          "expectedImpact": "ranking improvement estimate"
        }
      ]
    }
  },
  
  "eeatEnhancement": {
    "experienceSignals": {
      "competitorBestPractices": ["what competitors do well"],
      "yourGaps": ["what you're missing"],
      "implementationPlan": [
        {"signal": "first-hand experience indicators", "howToAdd": "specific implementation", "priority": "high"}
      ]
    },
    "expertiseSignals": {
      "competitorBestPractices": [],
      "yourGaps": [],
      "implementationPlan": []
    },
    "authoritySignals": {
      "backlinkGaps": ["sites linking to competitors but not you"],
      "mentionGaps": ["where competitors are cited"],
      "buildStrategy": ["how to build authority"]
    },
    "trustSignals": {
      "competitorBestPractices": [],
      "yourGaps": [],
      "implementationPlan": []
    }
  },
  
  "backlinkStrategy": {
    "competitorAdvantages": [
      {
        "competitor": "domain.com",
        "backlinks": 15000,
        "refDomains": 800,
        "topLinkSources": ["source1.com", "source2.com"],
        "replicableLinks": ["links you can also get"],
        "uniqueAdvantage": "what they have that's hard to copy"
      }
    ],
    "linkBuildingPriorities": [
      {
        "tactic": "specific tactic name",
        "targetSites": ["site1.com", "site2.com"],
        "outreachApproach": "brief strategy",
        "expectedLinks": 10,
        "timeframe": "1-3 months",
        "difficulty": "low|medium|high"
      }
    ],
    "anchorTextStrategy": {
      "currentDistribution": "if analyzable",
      "recommendedDistribution": {
        "branded": 35,
        "exactMatch": 15,
        "partialMatch": 25,
        "generic": 15,
        "nakedUrl": 10
      }
    }
  },
  
  "actionPlan": {
    "week1Actions": [
      {
        "action": "specific action",
        "owner": "SEO|Content|Dev|Outreach",
        "effort": "hours",
        "expectedImpact": "metric improvement",
        "dependencies": []
      }
    ],
    "month1Actions": [],
    "quarter1Actions": [],
    "kpisToTrack": [
      {
        "metric": "specific metric",
        "currentBaseline": "if known",
        "target": "goal",
        "trackingFrequency": "daily|weekly|monthly"
      }
    ]
  },
  
  "competitiveScorecard": {
    "rankings": [
      {
        "domain": "domain.com",
        "overallScore": 85,
        "contentScore": 80,
        "technicalScore": 90,
        "authorityScore": 85,
        "keywordScore": 75,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1"],
        "strategicImplication": "what this means for your strategy"
      }
    ],
    "yourPosition": {
      "currentRank": 4,
      "targetRank": 2,
      "gapToClose": "specific gaps to address",
      "estimatedTimeToTarget": "6-12 months with recommended actions"
    }
  }
}

CRITICAL INSTRUCTIONS:
1. Every number must be realistic and defensible
2. Every recommendation must be specific enough to execute immediately
3. Prioritize by ROI: (Traffic × Conversion Potential) / Effort
4. Include ONLY insights supported by the data provided
5. If data is insufficient for a recommendation, state "Insufficient data" rather than guessing

Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`;
  }
  
  /**
   * Build content gaps prompt
   */
  _buildContentGapsPrompt(clientDomain, summary) {
    return `You are an elite content strategist analyzing competitor content for ${clientDomain}.

## COMPETITOR DATA
${JSON.stringify(summary, null, 2)}

## ANALYSIS FOCUS
Identify all content gaps and opportunities based on:
- Topics competitors cover that ${clientDomain} doesn't
- Content formats competitors use successfully
- Question-based content opportunities (PAA, FAQs)
- Long-tail content opportunities

Respond with JSON:
{
  "topicGaps": [
    {"topic": "name", "competitors": ["who covers it"], "priority": "high|medium|low", "suggestedFormat": "type"}
  ],
  "formatGaps": [
    {"format": "name", "example": "competitor example", "recommendation": "how to implement"}
  ],
  "questionGaps": [
    {"question": "the question", "searchIntent": "intent", "contentRecommendation": "what to create"}
  ],
  "longTailOpportunities": [
    {"keyword": "long tail phrase", "competitors": "who ranks", "contentAngle": "approach"}
  ],
  "prioritizedContentCalendar": [
    {"week": 1, "content": "title", "format": "type", "targetKeywords": ["kw1"]}
  ]
}

Respond ONLY with valid JSON.`;
  }
  
  /**
   * Build keyword strategy prompt
   */
  _buildKeywordStrategyPrompt(clientDomain, summary) {
    return `You are an elite keyword strategist analyzing competitor keywords for ${clientDomain}.

## COMPETITOR DATA
${JSON.stringify(summary, null, 2)}

## ANALYSIS FOCUS
Provide keyword strategy based on:
- Keywords competitors rank for
- Intent distribution analysis
- Keyword difficulty vs opportunity
- Semantic keyword clusters

Respond with JSON:
{
  "primaryKeywords": [
    {"keyword": "kw", "intent": "intent", "difficulty": "1-100", "priority": "1-10", "strategy": "approach"}
  ],
  "secondaryKeywords": [
    {"keyword": "kw", "intent": "intent", "contentNeeded": "description"}
  ],
  "semanticClusters": [
    {"cluster": "name", "pillarKeyword": "main kw", "supportingKeywords": ["kw1", "kw2"], "contentStrategy": "approach"}
  ],
  "intentOptimization": {
    "transactional": [{"keyword": "kw", "recommendation": "how to optimize"}],
    "commercial": [{"keyword": "kw", "recommendation": "how to optimize"}],
    "informational": [{"keyword": "kw", "recommendation": "how to optimize"}]
  },
  "keywordPriorities": {
    "quickWins": [{"keyword": "kw", "reason": "why", "action": "what to do"}],
    "strategicTargets": [{"keyword": "kw", "reason": "why", "timeline": "how long"}]
  }
}

Respond ONLY with valid JSON.`;
  }
  
  /**
   * Build E-E-A-T improvement prompt
   */
  _buildEEATPrompt(clientDomain, summary) {
    return `You are an elite E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) strategist for ${clientDomain}.

## COMPETITOR E-E-A-T DATA
${JSON.stringify(summary, null, 2)}

## ANALYSIS FOCUS
Analyze competitor E-E-A-T signals and provide improvement recommendations:
- Experience signals they use
- Expertise demonstrations
- Authority indicators
- Trust markers

Respond with JSON:
{
  "experienceRecommendations": [
    {"signal": "type", "competitorExample": "who does this", "implementation": "how to add", "priority": "high|medium|low"}
  ],
  "expertiseRecommendations": [
    {"signal": "type", "competitorExample": "example", "implementation": "how to add", "priority": "high|medium|low"}
  ],
  "authorityRecommendations": [
    {"signal": "type", "competitorExample": "example", "implementation": "how to add", "priority": "high|medium|low"}
  ],
  "trustRecommendations": [
    {"signal": "type", "competitorExample": "example", "implementation": "how to add", "priority": "high|medium|low"}
  ],
  "schemaRecommendations": [
    {"schemaType": "type", "purpose": "why", "implementation": "how"}
  ],
  "authorPageRecommendations": {
    "needed": true,
    "elements": ["element1", "element2"],
    "examples": ["competitor example"]
  },
  "eeatScoreImprovement": {
    "currentEstimate": 50,
    "targetScore": 80,
    "keyActions": ["action1", "action2", "action3"]
  }
}

Respond ONLY with valid JSON.`;
  }
  
  /**
   * Build backlink strategy prompt
   */
  _buildBacklinkPrompt(clientDomain, summary) {
    return `You are an elite link building strategist analyzing competitor backlinks for ${clientDomain}.

## COMPETITOR BACKLINK DATA
${JSON.stringify(summary, null, 2)}

## ANALYSIS FOCUS
Analyze competitor backlink profiles and provide link building strategy:
- Link sources competitors use
- High-value link opportunities
- Link building tactics
- Competitor link gaps

Respond with JSON:
{
  "competitorLinkProfiles": [
    {"competitor": "domain", "strengths": ["s1"], "vulnerabilities": ["v1"], "topSources": ["source1"]}
  ],
  "linkBuildingTactics": [
    {"tactic": "name", "difficulty": "high|medium|low", "expectedLinks": 5, "timeline": "1 month", "steps": ["step1"]}
  ],
  "highValueTargets": [
    {"source": "domain/type", "relevance": "why relevant", "approach": "how to get link", "priority": 1}
  ],
  "competitorLinksToReplicate": [
    {"competitor": "domain", "linkSource": "source", "howToReplicate": "strategy"}
  ],
  "linkGaps": [
    {"gap": "description", "competitors": ["who has it"], "strategy": "how to close gap"}
  ],
  "monthlyLinkPlan": [
    {"month": 1, "targets": 10, "tactics": ["tactic1"], "focus": "description"}
  ]
}

Respond ONLY with valid JSON.`;
  }
  
  /**
   * Summarize competitor data for prompt
   */
  _summarizeCompetitorData(competitorData) {
    const summary = {};
    
    for (const [domain, data] of Object.entries(competitorData)) {
      summary[domain] = {
        // Headings summary
        headings: {
          h1Count: data.headings?.counts?.h1 || 0,
          h2Count: data.headings?.counts?.h2 || 0,
          totalHeadings: data.headings?.totalHeadings || 0,
          topH1s: (data.headings?.headings?.h1 || []).slice(0, 5).map(h => h.text),
          score: data.headings?.scores?.overall || 0
        },
        
        // Keywords summary
        keywords: {
          primary: (data.keywords?.primary || []).slice(0, 10).map(k => k.keyword),
          secondary: (data.keywords?.secondary || []).slice(0, 10).map(k => k.keyword),
          longTail: (data.keywords?.longTail || []).slice(0, 10).map(k => k.keyword),
          paaQuestions: (data.keywords?.paaQuestions || []).slice(0, 5).map(q => q.question),
          intentDistribution: data.keywords?.intentDistribution || {}
        },
        
        // Meta & Links summary
        metaLinks: {
          avgTitleLength: data.metaLinks?.meta?.stats?.avgTitleLength || 0,
          avgDescLength: data.metaLinks?.meta?.stats?.avgDescriptionLength || 0,
          internalLinkCount: data.metaLinks?.internalLinkCount || 0,
          topAnchorTexts: (data.metaLinks?.anchorAnalysis?.topAnchorTexts || []).slice(0, 10),
          score: data.metaLinks?.scores?.overall || 0
        },
        
        // Backlinks summary
        backlinks: {
          totalBacklinks: data.backlinks?.backlinkCount || 0,
          referringDomains: data.backlinks?.referringDomainCount || 0,
          avgDomainAuthority: data.backlinks?.analysis?.avgDomainAuthority || 0,
          topLinkType: data.backlinks?.analysis?.topLinkType || 'unknown',
          dofollowRatio: data.backlinks?.analysis?.dofollowRatio || 0,
          score: data.backlinks?.analysis?.qualityScore || 0
        },
        
        // EEAT summary
        eeat: {
          experienceSignals: (data.eeat?.allSignals?.experience || []).slice(0, 10),
          expertiseSignals: (data.eeat?.allSignals?.expertise || []).slice(0, 10),
          authoritySignals: (data.eeat?.allSignals?.authority || []).slice(0, 10),
          trustSignals: (data.eeat?.allSignals?.trust || []).slice(0, 10),
          schemaTypes: data.eeat?.schemaTypes || [],
          scores: data.eeat?.scores || {},
          analysis: data.eeat?.analysis || {}
        },
        
        // Overall scores
        scores: {
          headings: data.headings?.scores?.overall || 0,
          metaLinks: data.metaLinks?.scores?.overall || 0,
          backlinks: data.backlinks?.analysis?.qualityScore || 0,
          eeat: data.eeat?.scores?.overall || 0
        }
      };
    }
    
    return summary;
  }
  
  /**
   * Call Gemini API
   */
  _callGeminiAPI(prompt) {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Gemini API key not configured. Set GEMINI_API_KEY in Script Properties.'
      };
    }
    
    try {
      const url = `${ELITE_PROMPT_CONFIG.API_URL}?key=${this.apiKey}`;
      
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: ELITE_PROMPT_CONFIG.TEMPERATURE,
          maxOutputTokens: ELITE_PROMPT_CONFIG.MAX_TOKENS
        }
      };
      
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        timeout: 120000 // 2 minutes
      });
      
      const statusCode = response.getResponseCode();
      
      if (statusCode !== 200) {
        return {
          success: false,
          error: `Gemini API error: HTTP ${statusCode}`,
          details: response.getContentText()
        };
      }
      
      const data = JSON.parse(response.getContentText());
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          success: true,
          text: data.candidates[0].content.parts[0].text
        };
      }
      
      return {
        success: false,
        error: 'No content in Gemini response',
        data: data
      };
      
    } catch (e) {
      return {
        success: false,
        error: `Gemini API call failed: ${e.message}`
      };
    }
  }
  
  /**
   * Parse Gemini response
   */
  _parseResponse(text, analysisType) {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, return as text
      return {
        rawText: text,
        parseError: 'Could not extract JSON from response'
      };
      
    } catch (e) {
      return {
        rawText: text,
        parseError: `JSON parse error: ${e.message}`
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get elite prompt builder instance
 * @returns {ElitePromptBuilder}
 */
function getElitePromptBuilder() {
  return new ElitePromptBuilder();
}

/**
 * Analyze competitor data with Gemini
 * @param {string} clientDomain - Client domain
 * @param {Object} competitorData - All extracted competitor data
 * @param {string} analysisType - Type of analysis
 * @returns {Object} Gemini analysis result
 */
function analyzeWithGemini(clientDomain, competitorData, analysisType = 'comprehensive') {
  const builder = getElitePromptBuilder();
  return builder.analyzeWithGemini(clientDomain, competitorData, analysisType);
}

/**
 * Run all analysis types
 * @param {string} clientDomain - Client domain
 * @param {Object} competitorData - All extracted competitor data
 * @returns {Object} All analysis results
 */
function runFullGeminiAnalysis(clientDomain, competitorData) {
  const builder = getElitePromptBuilder();
  const results = {};
  
  for (const analysisType of ELITE_PROMPT_CONFIG.PROMPT_TYPES) {
    console.log(`Running ${analysisType} analysis...`);
    results[analysisType] = builder.analyzeWithGemini(clientDomain, competitorData, analysisType);
    Utilities.sleep(2000); // Rate limiting
  }
  
  return results;
}

/**
 * Test elite prompt builder
 */
function testElitePromptBuilder() {
  const testData = {
    'competitor1.com': {
      headings: {
        counts: { h1: 15, h2: 45 },
        totalHeadings: 80,
        headings: { h1: [{ text: 'Best Online Casino' }] },
        scores: { overall: 75 }
      },
      keywords: {
        primary: [{ keyword: 'online casino' }, { keyword: 'casino bonus' }],
        intentDistribution: { commercial: 60, informational: 30, transactional: 10 }
      },
      eeat: {
        scores: { overall: 65, experience: 70, expertise: 60 },
        allSignals: { experience: ['i tested', 'my experience'] }
      }
    }
  };
  
  console.log('🧪 Testing Elite Prompt Builder...');
  
  // Note: This will only work if GEMINI_API_KEY is set
  const result = analyzeWithGemini('myclient.com', testData, 'comprehensive');
  console.log('Result:', JSON.stringify(result, null, 2));
  
  return result;
}

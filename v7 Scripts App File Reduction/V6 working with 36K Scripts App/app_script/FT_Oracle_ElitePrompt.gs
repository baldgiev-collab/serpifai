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
// GEMINI PROMPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ELITE_PROMPT_CONFIG = {
  // API Settings
  GEMINI_API_KEY: '', // Set via Script Properties
  MODEL: 'gemini-3-flash-preview',
  MAX_TOKENS: 16384,
  TEMPERATURE: 0.7,
  
  // API Endpoint
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
  
  // Prompt types
  PROMPT_TYPES: [
    'comprehensive',
    'content_gaps',
    'keyword_strategy',
    'eeat_improvement',
    'backlink_strategy',
    'heading_optimization',
    'internal_linking',
    'competitive_positioning'
  ]
};

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
   * Build comprehensive analysis prompt
   */
  _buildComprehensivePrompt(clientDomain, summary) {
    return `You are an elite SEO strategist and competitive intelligence analyst for the 0.1% of digital marketers.

## MISSION
Analyze the following competitor data for ${clientDomain} and provide strategic, actionable insights that will help them dominate their market.

## COMPETITOR DATA
${JSON.stringify(summary, null, 2)}

## ANALYSIS REQUIREMENTS

Provide your analysis in the following JSON structure:

{
  "executiveSummary": {
    "overview": "2-3 sentence overview of competitive landscape",
    "topCompetitor": "Name and why they're the strongest",
    "biggestOpportunity": "Single biggest opportunity identified",
    "urgentAction": "Most urgent action to take"
  },
  
  "contentStrategy": {
    "contentGaps": [
      {"topic": "Topic name", "opportunity": "Why this matters", "priority": "high|medium|low"}
    ],
    "topPerformingContent": [
      {"competitor": "domain", "content": "description", "whyItWorks": "analysis"}
    ],
    "recommendedTopics": [
      {"topic": "Topic name", "targetKeywords": ["kw1", "kw2"], "contentType": "guide|listicle|comparison"}
    ]
  },
  
  "keywordStrategy": {
    "quickWins": [
      {"keyword": "keyword", "currentGap": "description", "action": "what to do"}
    ],
    "longTermTargets": [
      {"keyword": "keyword", "difficulty": "high|medium|low", "strategy": "how to rank"}
    ],
    "keywordClusters": [
      {"cluster": "cluster name", "keywords": ["kw1", "kw2"], "contentNeeded": "description"}
    ]
  },
  
  "technicalSEO": {
    "headingOptimization": [
      {"issue": "description", "recommendation": "fix", "impact": "high|medium|low"}
    ],
    "internalLinking": [
      {"opportunity": "description", "implementation": "how to do it"}
    ],
    "metaOptimization": [
      {"element": "title|description", "issue": "problem", "recommendation": "fix"}
    ]
  },
  
  "eeatStrategy": {
    "experienceGaps": [
      {"gap": "description", "recommendation": "fix"}
    ],
    "expertiseGaps": [
      {"gap": "description", "recommendation": "fix"}
    ],
    "authorityGaps": [
      {"gap": "description", "recommendation": "fix"}
    ],
    "trustGaps": [
      {"gap": "description", "recommendation": "fix"}
    ]
  },
  
  "backlinkStrategy": {
    "competitorAdvantages": [
      {"competitor": "domain", "advantage": "what they have", "howToCompete": "strategy"}
    ],
    "linkBuildingPriorities": [
      {"source": "type of site", "strategy": "how to get links", "difficulty": "high|medium|low"}
    ]
  },
  
  "actionPlan": {
    "immediate": [
      {"action": "description", "expectedImpact": "description", "timeframe": "1-2 weeks"}
    ],
    "shortTerm": [
      {"action": "description", "expectedImpact": "description", "timeframe": "1-3 months"}
    ],
    "longTerm": [
      {"action": "description", "expectedImpact": "description", "timeframe": "3-6 months"}
    ]
  },
  
  "competitiveScorecard": {
    "overallRanking": [
      {"domain": "domain", "score": 85, "strengths": ["s1"], "weaknesses": ["w1"]}
    ],
    "categoryRankings": {
      "content": [{"domain": "domain", "score": 85}],
      "keywords": [{"domain": "domain", "score": 85}],
      "backlinks": [{"domain": "domain", "score": 85}],
      "eeat": [{"domain": "domain", "score": 85}]
    }
  }
}

Respond ONLY with valid JSON. Be specific, actionable, and prioritize by impact.`;
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

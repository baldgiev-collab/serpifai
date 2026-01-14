/**
 * DB_COMP_ElitePrompt.gs - ELITE 0.1% STRATEGIC ANALYSIS PROMPT
 * 
 * Complete 15-category elite prompt with FULL DATA (not truncated)
 * Uses collected data from PHP Fetcher + Free APIs for deep research analysis
 * 
 * @version 7.0.0 - Non-Truncated Deep Research Edition
 * 
 * ⚠️ DEPRECATED: Use DB_COMP_GeminiElitePrompt.gs instead!
 * The buildCompleteElitePrompt function is now in DB_COMP_GeminiElitePrompt.gs
 * which has better niche-aware keyword extraction and passes Serper PAA/Related data.
 * 
 * DATA FLOW:
 * 1. PHP Fetcher collects website data (content, structure, schema, etc.)
 * 2. Free APIs enrich data (PageSpeed, OpenPageRank, Serper)
 * 3. Data is SAVED to storage
 * 4. Gemini receives ALL collected data for DEEP RESEARCH analysis
 * 5. Gemini fact-checks, estimates, and provides strategic insights
 * 6. Results are SAVED and rendered in UI
 */

/**
 * DEPRECATED: Use buildCompleteElitePrompt from DB_COMP_GeminiElitePrompt.gs instead
 * This function is renamed to avoid conflict with the updated version in GeminiElitePrompt.gs
 * @deprecated Use DB_COMP_GeminiElitePrompt.gs
 */
function buildCompleteElitePrompt_LEGACY(competitorData, yourDomain, projectContext) {
  // Log that this legacy version is being called (should NOT happen)
  Logger.log('⚠️ WARNING: buildCompleteElitePrompt_LEGACY called - should use GeminiElitePrompt version instead');
  
  // Ensure we have data
  const competitorsArray = Array.isArray(competitorData) 
    ? competitorData 
    : Object.values(competitorData || {});
    
  if (competitorsArray.length === 0) {
    Logger.log('⚠️ No competitors for elite prompt');
    return null;
  }
  
  Logger.log(`📊 Building COMPLETE elite prompt for ${competitorsArray.length} competitors`);
  Logger.log(`   Using FULL collected data for Gemini deep research analysis`);
  
  // Extract FULL data from each competitor (not truncated)
  // FIX: Use correct property names from actual API responses
  const fullCompetitorData = competitorsArray.map(comp => {
    const data = {
      domain: comp.domain || comp.url || 'unknown',
      fetchSuccess: comp.fetchSuccess || false,
      
      // Website data - check both synthesized AND snapshot
      website: {
        title: comp.synthesized?.website?.title || 
               comp.snapshot?.metadata?.title || 
               comp.stages?.serper?.data?.organic?.[0]?.title || 'N/A',
        description: comp.synthesized?.website?.description || 
                    comp.snapshot?.metadata?.description || 
                    comp.stages?.serper?.data?.organic?.[0]?.snippet || 'N/A',
        wordCount: comp.synthesized?.website?.wordCount || 
                  comp.snapshot?.metadata?.wordCount || 0,
        h1: comp.synthesized?.website?.h1 || 
           comp.snapshot?.metadata?.h1 || 'N/A',
        h2Tags: comp.synthesized?.website?.h2Tags || 
               comp.snapshot?.metadata?.h2Tags || [],
        language: comp.synthesized?.website?.language || 
                 comp.snapshot?.metadata?.language || 'unknown',
        schemaTypes: comp.synthesized?.website?.schemaTypes || 
                    comp.snapshot?.schema?.types || [],
        hasOrganizationSchema: comp.snapshot?.schema?.hasOrganizationSchema || false,
        internalLinks: comp.synthesized?.website?.internalLinks || 
                      (comp.snapshot?.links?.internal || []).length || 0,
        externalLinks: comp.synthesized?.website?.externalLinks || 
                      (comp.snapshot?.links?.external || []).length || 0
      },
      
      // Content data
      content: {
        mainContent: comp.synthesized?.content?.mainContent || 
                    comp.snapshot?.content?.main || 'N/A',
        headings: comp.synthesized?.content?.headings || 
                 comp.snapshot?.content?.headings || [],
        keywords: comp.synthesized?.content?.keywords || [],
        topics: comp.synthesized?.content?.topics || []
      },
      
      // Technical data - FIX: PageSpeed uses scores.performance not performance
      technical: {
        performanceScore: comp.synthesized?.technical?.performanceScore || 
                         comp.apiData?.pageSpeed?.scores?.performance || 
                         comp.stages?.pageSpeed?.data?.scores?.performance || 0,
        accessibilityScore: comp.synthesized?.technical?.accessibilityScore || 
                           comp.apiData?.pageSpeed?.scores?.accessibility || 
                           comp.stages?.pageSpeed?.data?.scores?.accessibility || 0,
        bestPracticesScore: comp.synthesized?.technical?.bestPracticesScore || 
                           comp.apiData?.pageSpeed?.scores?.best_practices || 
                           comp.stages?.pageSpeed?.data?.scores?.best_practices || 0,
        seoScore: comp.synthesized?.technical?.seoScore || 
                 comp.apiData?.pageSpeed?.scores?.seo || 
                 comp.stages?.pageSpeed?.data?.scores?.seo || 0,
        coreWebVitals: comp.apiData?.pageSpeed?.core_web_vitals || 
                      comp.stages?.pageSpeed?.data?.core_web_vitals || {},
        loadTime: comp.synthesized?.technical?.loadTime || 'N/A'
      },
      
      // Authority & SEO data - FIX: OpenPageRank uses page_rank_decimal not pageRank
      authority: {
        domainRank: parseInt(comp.synthesized?.authority?.domainRank || 
                           comp.apiData?.openPageRank?.rank || 
                           comp.stages?.openPageRank?.data?.rank || 0),
        pageRank: comp.synthesized?.authority?.pageRank || 
                 comp.apiData?.openPageRank?.page_rank_decimal || 
                 comp.stages?.openPageRank?.data?.page_rank_decimal || 0,
        pageRankInteger: comp.apiData?.openPageRank?.page_rank_integer || 
                        comp.stages?.openPageRank?.data?.page_rank_integer || 0
      },
      
      // SEO & Search data - FIX: Extract from stages.serper if not in apiData
      seo: {
        organicResults: comp.synthesized?.seo?.organic || 
                       comp.apiData?.serper?.organic || 
                       comp.stages?.serper?.data?.organic || [],
        totalResults: comp.synthesized?.seo?.totalResults || 
                     (comp.stages?.serper?.data?.organic || []).length || 0,
        searchAppearance: comp.synthesized?.seo?.searchAppearance || 'standard',
        featuredSnippets: comp.synthesized?.seo?.featuredSnippets || 0,
        topRankings: (comp.stages?.serper?.data?.organic || []).slice(0, 10).map(r => ({
          url: r.link || '',
          title: r.title || '',
          snippet: r.snippet || '',
          position: r.position || 0
        }))
      },
      
      // Traffic estimates
      traffic: {
        estimated: comp.synthesized?.traffic?.estimated || 0,
        organicKeywords: comp.synthesized?.seo?.organic?.length || 
                        comp.apiData?.serper?.organicKeywords || 
                        (comp.stages?.serper?.data?.organic || []).length || 0,
        backlinks: comp.apiData?.serper?.backlinks || 0
      },
      
      // Raw stages for reference (what APIs succeeded)
      dataQuality: {
        phpFetcher: comp.stages?.phpFetcher?.success || false,
        customSearch: comp.stages?.customSearch?.success || false,
        pageSpeed: comp.stages?.pageSpeed?.success || false,
        serper: comp.stages?.serper?.success || false,
        openPageRank: comp.stages?.openPageRank?.success || false,
        totalSuccessful: [
          comp.stages?.phpFetcher?.success,
          comp.stages?.customSearch?.success,
          comp.stages?.pageSpeed?.success,
          comp.stages?.serper?.success,
          comp.stages?.openPageRank?.success
        ].filter(Boolean).length
      },
      
      error: comp.error || null
    };
    
    // Log what data we extracted for each competitor
    Logger.log(`   [${data.domain}]:`);
    Logger.log(`      Authority: pageRank=${data.authority.pageRank}, domainRank=${data.authority.domainRank}`);
    Logger.log(`      Performance: seo=${data.technical.seoScore}, perf=${data.technical.performanceScore}`);
    Logger.log(`      Traffic: keywords=${data.traffic.organicKeywords}, estimated=${data.traffic.estimated}`);
    Logger.log(`      Data sources: ${data.dataQuality.totalSuccessful}/5 APIs successful`);
    
    return data;
  });
  
  const competitorDomains = fullCompetitorData.map(c => c.domain);
  
  return `# ELITE 0.1% DEEP RESEARCH COMPETITOR INTELLIGENCE ANALYSIS

═══════════════════════════════════════════════════════════════════════════════
🚨 CRITICAL INSTRUCTIONS - READ CAREFULLY
═══════════════════════════════════════════════════════════════════════════════

**ABSOLUTE REQUIREMENTS - DO NOT VIOLATE:**
1. ❌ DO NOT TRUNCATE - Provide COMPLETE analysis for ALL 15 categories
2. ❌ DO NOT ABBREVIATE - Write full paragraphs, not bullet summaries
3. ❌ DO NOT SAY "similar to above" or "see previous" - Each category must be unique
4. ✅ EACH CATEGORY must have 150-300 word analysis minimum
5. ✅ EACH CATEGORY must have 5-8 specific, data-driven insights
6. ✅ EACH CATEGORY must have 5-8 actionable recommendations with priorities
7. ✅ USE REAL DATA from the competitor data provided - cite specific metrics
8. ✅ ESTIMATE missing values using industry benchmarks and the data patterns you see

**YOUR ROLE:**
You are an elite McKinsey/Bain strategic consultant charging $5,000/hour. This analysis must be 
worth every penny. Use deep research methodology - fact-check against the provided data, 
cross-reference metrics, identify patterns, and provide strategic insights that a $50,000 
consulting engagement would deliver.

**DATA PROVIDED:**
You have COMPLETE data collected from:
- PHP Fetcher: Website structure, content, schema, internal/external links
- PageSpeed API: Core Web Vitals, performance, accessibility, SEO scores
- OpenPageRank API: Domain authority, page rank
- Serper API: SERP rankings, organic results, search visibility

This data was collected FIRST, then sent to you for DEEP ANALYSIS. Your job is to:
1. FACT-CHECK the data for consistency
2. ESTIMATE traffic, revenue, and other metrics using patterns
3. IDENTIFY strategic opportunities and threats
4. PROVIDE 90-day action plans with specific deliverables

**RESPONSE FORMAT**: Return ONLY valid JSON. No markdown code blocks, no explanations. 
Start with { and end with }.

═══════════════════════════════════════════════════════════════════════════════

## CLIENT CONTEXT
- Your Domain: ${yourDomain}
- Brand Name: ${projectContext.brandName || yourDomain}
- Industry: ${projectContext.industryVertical || projectContext.coreTopic || 'Digital Marketing / SEO'}
- Target Audience: ${projectContext.targetAudience || 'Businesses seeking competitive advantage'}
- Core Topic: ${projectContext.coreTopic || 'Competitor Intelligence'}

## COMPETITORS BEING ANALYZED
${competitorDomains.join(', ')}

## COMPLETE COLLECTED DATA (FROM PHP FETCHER + FREE APIS)

${JSON.stringify(fullCompetitorData, null, 2)}

═══════════════════════════════════════════════════════════════════════════════
## REQUIRED JSON OUTPUT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

{
  "analysisMetadata": {
    "timestamp": "${new Date().toISOString()}",
    "competitorCount": ${competitorDomains.length},
    "dataQuality": "elite",
    "methodology": "Deep Research Analysis using collected API data",
    "confidenceLevel": "HIGH - based on real data"
  },
  
  "executiveSummary": {
    "threeLineSummary": "3-sentence executive summary of competitive landscape",
    "landscapeOverview": "200-word overview of the market dynamics",
    "clientPosition": "How ${yourDomain} compares to competitors",
    "keyThreats": ["Threat 1 with data", "Threat 2", "Threat 3"],
    "keyOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
    "immediateActions": ["Action 1 (Week 1)", "Action 2", "Action 3"]
  },
  
  "categories": [
    {
      "id": 1,
      "name": "Market Position Intelligence",
      "analysis": "150-300 word DEEP analysis using the provided data. Reference specific metrics like 'Competitor X has pageRank 6.2 vs average 3.1, indicating 2x authority advantage.'",
      "insights": [
        "Insight 1 - Must include specific data point",
        "Insight 2 - Must include competitor comparison",
        "Insight 3 - Must identify pattern or trend",
        "Insight 4 - Must highlight opportunity",
        "Insight 5 - Must flag risk or threat"
      ],
      "recommendations": [
        {"priority": "CRITICAL", "action": "Specific action", "timeline": "Week 1-2", "expectedImpact": "Measurable outcome"},
        {"priority": "HIGH", "action": "Action 2", "timeline": "Month 1", "expectedImpact": "Outcome"},
        {"priority": "MEDIUM", "action": "Action 3", "timeline": "Month 2-3", "expectedImpact": "Outcome"}
      ],
      "metrics": {
        "leader": "domain.com",
        "leaderScore": 85,
        "avgScore": 62,
        "clientGap": -15,
        "opportunitySize": "Estimated traffic/revenue if gap closed"
      },
      "competitorBreakdown": [
        {
          "competitor": "domain.com",
          "position": "Market leader/challenger/niche",
          "strengths": ["strength 1", "strength 2"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "score": 85
        }
      ]
    }
  ],
  
  "killMoves": [
    {
      "title": "Kill Move Name",
      "target": "competitor.com",
      "strategy": "Detailed strategy exploiting their weakness",
      "timeline": "30 days",
      "resources": "What's needed",
      "expectedROI": "3-5x"
    }
  ],
  
  "competitorRankings": [
    {
      "rank": 1,
      "domain": "domain.com",
      "overallScore": 85,
      "categoryScores": {
        "marketPosition": 90,
        "brandStrategy": 80,
        "technicalSEO": 85,
        "content": 75,
        "keywords": 70
      },
      "primaryThreat": "What makes them dangerous",
      "primaryWeakness": "Where to attack"
    }
  ],
  
  "estimatedMetrics": [
    {
      "domain": "domain.com",
      "estimatedMonthlyTraffic": 50000,
      "estimatedOrganicKeywords": 2500,
      "estimatedDomainValue": "$50,000/year",
      "growthTrajectory": "Growing/Stable/Declining",
      "confidenceLevel": "HIGH/MEDIUM/LOW"
    }
  ],
  
  "strategicRoadmap": {
    "phase1_immediate": {
      "timeframe": "Week 1-2",
      "focus": "Quick wins and critical fixes",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "expectedOutcome": "What to expect"
    },
    "phase2_shortTerm": {
      "timeframe": "Month 1",
      "focus": "Competitive positioning",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "expectedOutcome": "What to expect"
    },
    "phase3_mediumTerm": {
      "timeframe": "Month 2-3",
      "focus": "Market share capture",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "expectedOutcome": "What to expect"
    }
  }
}

═══════════════════════════════════════════════════════════════════════════════
## THE 15 CATEGORIES - PROVIDE DEEP ANALYSIS FOR EACH
═══════════════════════════════════════════════════════════════════════════════
        {
          "competitor": "domain.com",
          "position": "Market leader/challenger/niche",
          "strengths": ["strength 1", "strength 2"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "metrics": {
            "traffic": 0,
            "authority": 0,
            "performance": 0
          }
        }
      ],
      "gapAnalysis": {
        "opportunities": ["opp 1", "opp 2"],
        "threats": ["threat 1", "threat 2"],
        "quickWins": ["win 1", "win 2"]
      },
      "actionableRecommendations": [
        {
          "priority": "High/Medium/Low",
          "action": "Specific action to take",
          "expectedImpact": "What result to expect",
          "effort": "High/Medium/Low",
          "timeline": "Weeks/Months"
        }
      ]
    }
  ],
  "executiveSummary": {
    "marketOverview": "Overall competitive landscape analysis",
    "keyThreats": ["threat 1", "threat 2", "threat 3"],
    "keyOpportunities": ["opp 1", "opp 2", "opp 3"],
    "topPriorities": [
      {
        "category": "Category name",
        "action": "What to do",
        "impact": "Expected result"
      }
    ]
  },
  "competitorRankings": [
    {
      "domain": "domain.com",
      "overallScore": 85,
      "categoryScores": {
        "market_position": 90,
        "brand_strategy": 80,
        "technical_seo": 85,
        "content": 75,
        "keywords": 70
      },
      "strengthAreas": ["area 1", "area 2"],
      "weaknessAreas": ["area 1", "area 2"]
    }
  ],
  "metadata": {
    "analysisDate": "${new Date().toISOString()}",
    "competitorCount": ${competitorDomains.length},
    "dataQuality": "elite",
    "coveragePercentage": 95
  }
}

## 15 INTELLIGENCE CATEGORIES (Include ALL)

**CATEGORY 1: Market Position Intelligence**
- Market segment & positioning
- Competitive advantage analysis
- Market share indicators (traffic, authority, visibility)
- Pricing strategy signals
- Target audience overlap
- Geographic focus

**CATEGORY 2: Brand Strategy & Messaging**
- Brand voice & tone
- Value proposition differentiation
- Brand personality & archetype
- Messaging hierarchy
- Customer promise
- Trust signals & social proof

**CATEGORY 3: Technical SEO Analysis**
- Site architecture & structure
- Core Web Vitals (LCP, FID, CLS)
- Schema.org implementation
- Mobile optimization
- Site speed & performance
- Security & HTTPS
- Indexability & crawlability

**CATEGORY 4: Content Strategy & Quality**
- Content depth & comprehensiveness
- Topical authority coverage
- Content freshness & frequency
- E-E-A-T signals
- Content format mix
- Internal linking strategy
- Content gaps & opportunities

**CATEGORY 5: Keyword Strategy**
- Primary keyword focus
- Long-tail coverage
- Search intent mapping
- Keyword clustering
- Featured snippet targeting
- Ranking distribution
- Untapped keyword opportunities

**CATEGORY 6: Content Production Systems**
- Content velocity & frequency
- Content quality indicators
- Production workflow efficiency
- Content promotion patterns
- Evergreen vs. trending ratio
- Content refresh strategy

**CATEGORY 7: Conversion Optimization**
- Conversion funnel structure
- CTA patterns & placement
- Lead magnets & offers
- Form optimization
- Trust signals
- Social proof elements
- Exit intent strategies

**CATEGORY 8: User Experience (UX)**
- Navigation structure
- Information architecture
- Visual hierarchy
- Mobile experience
- Accessibility
- Page load experience
- Error handling

**CATEGORY 9: Link Building Strategy**
- Backlink profile quality
- Link acquisition patterns
- Content that attracts links
- Anchor text distribution
- Link velocity
- Referring domain diversity

**CATEGORY 10: Local SEO (if applicable)**
- Local listings & citations
- Google Business Profile optimization
- Local content strategy
- Location pages
- Reviews & ratings strategy
- Local link building

**CATEGORY 11: Social Media Integration**
- Social platform presence
- Content distribution strategy
- Engagement patterns
- Social proof integration
- Social listening indicators
- Community building approach

**CATEGORY 12: Analytics & Tracking**
- Tracking implementation quality
- Conversion tracking setup
- Event tracking patterns
- Analytics maturity indicators
- Data-driven optimization signals

**CATEGORY 13: Paid Search Strategy**
- PPC presence indicators
- Ad copy patterns
- Landing page quality
- Retargeting signals
- Budget allocation indicators

**CATEGORY 14: Technology Stack**
- CMS platform
- Key technologies used
- Performance tools
- Marketing automation
- A/B testing platforms
- Analytics tools

**CATEGORY 15: Content Distribution & Promotion**
- Distribution channels
- Syndication strategy
- Email marketing presence
- Influencer partnerships
- PR & outreach patterns
- Content amplification tactics

## ANALYSIS GUIDELINES

1. **Use Real Data**: Reference specific metrics from the competitor data provided
2. **Be Specific**: "Competitor X has PageRank 6.4 vs. 3.2 average" not "higher authority"
3. **Compare**: Show relative performance across all competitors
4. **Actionable**: Every recommendation must be specific and implementable
5. **Prioritize**: Mark actions as High/Medium/Low priority with effort estimates
6. **Gap Analysis**: Identify what competitors do that client doesn't
7. **Quick Wins**: Highlight easy opportunities with high impact

## CRITICAL REMINDERS

- Return ONLY the JSON object (no markdown, no explanations)
- Include ALL 15 categories (even if data is limited for some)
- Use actual metrics from the provided data
- Provide 3-5 actionable recommendations per category
- Score competitors 0-100 in each category
- Identify specific competitive advantages and weaknesses
- Focus on what ${yourDomain} can ACT ON immediately

START JSON RESPONSE NOW:`;
}

/**
 * Parse Gemini response with better error handling
 */
function parseGeminiEliteResponse(responseText) {
  if (!responseText) {
    return null;
  }
  
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(responseText);
    if (parsed.categories && Array.isArray(parsed.categories)) {
      return parsed;
    }
  } catch (e) {
    // Continue to extraction methods
  }
  
  // Extract from markdown code blocks
  const patterns = [
    /```json\s*\n([\s\S]*?)\n```/,
    /```\s*\n([\s\S]*?)\n```/,
    /({[\s\S]*"categories"[\s\S]*})/,
    /{[\s\S]*}/
  ];
  
  for (const pattern of patterns) {
    const match = responseText.match(pattern);
    if (match) {
      try {
        const extracted = match[1] || match[0];
        const parsed = JSON.parse(extracted);
        if (parsed.categories && Array.isArray(parsed.categories)) {
          return parsed;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return null;
}

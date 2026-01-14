/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELITE DATA VISUALIZATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Top 0.1% Strategic Intelligence System
 * 
 * PURPOSE:
 * 1. Unified data layer for all 15 tabs
 * 2. Comparative analysis across competitors
 * 3. Strategic visualization mapping
 * 4. Gemini-enhanced elite prompts per tab
 * 5. Persistent storage with UI rendering
 * 
 * ARCHITECTURE:
 * FT_*.gs → DATA_LAYER (Storage) → GEMINI (Enhancement) → UI (Visualization)
 * 
 * @version 2.0.0
 * @author SerpifAI Elite System
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: UNIFIED DATA LAYER
// ═══════════════════════════════════════════════════════════════════════════

var ELITE_DATA_CONFIG = {
  STORAGE_SHEET: 'EliteDataLayer',
  CACHE_TTL: 3600, // 1 hour
  VERSION: '2.0.0',
  COLUMNS: {
    PROJECT_ID: 0,
    DOMAIN: 1,
    TAB_ID: 2,
    RAW_DATA: 3,
    VISUALIZATIONS: 4,
    GEMINI_INSIGHTS: 5,
    COMPARATIVE_DATA: 6,
    TIMESTAMP: 7
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 2: TAB DATA SPECIFICATIONS
 * Complete mapping of raw data → visualizations for each tab
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Returns complete visualization specifications for all 15 tabs
 * Each tab has: dataPoints, charts, tables, heatmaps, comparisons
 */
function ELITE_getTabVisualizationSpecs() {
  return {
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 1: SEO OVERVIEW - Executive Dashboard
    // ═══════════════════════════════════════════════════════════════════════
    overview: {
      id: 'overview',
      name: 'SEO Overview',
      icon: '📊',
      description: 'Executive dashboard with key metrics at a glance',
      
      dataPoints: [
        { source: 'FT_FullSnapshot', field: 'overallScore', label: 'Overall Score' },
        { source: 'FT_ExtractMetadata', field: 'title', label: 'Title' },
        { source: 'FT_ExtractMetadata', field: 'description', label: 'Meta Description' },
        { source: 'FT_ExtractMetadata', field: 'canonical', label: 'Canonical URL' },
        { source: 'FT_FullSnapshot', field: 'scoreBreakdown', label: 'Score Breakdown' },
        { source: 'FT_ParallelFetcher', field: 'pageSpeed.performanceScore', label: 'Performance' },
        { source: 'FT_ParallelFetcher', field: 'openPageRank.rank', label: 'Authority' }
      ],
      
      visualizations: {
        cards: [
          { id: 'overall-score', type: 'gauge', data: 'overallScore', comparative: true },
          { id: 'authority-score', type: 'gauge', data: 'authority', comparative: true },
          { id: 'performance-score', type: 'gauge', data: 'performance', comparative: true },
          { id: 'content-score', type: 'gauge', data: 'contentScore', comparative: true }
        ],
        charts: [
          { id: 'score-radar', type: 'radar', data: 'scoreBreakdown', competitors: 'overlay' },
          { id: 'metrics-bar', type: 'bar', data: 'allMetrics', comparative: true }
        ],
        tables: [
          { id: 'quick-wins', columns: ['Issue', 'Impact', 'Effort', 'Priority'] },
          { id: 'competitor-comparison', columns: ['Metric', 'You', 'Comp 1', 'Comp 2', 'Leader'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['overallScore', 'authority', 'performance', 'organicKeywords'],
        ranking: true,
        gap: true,
        percentile: true
      },
      
      geminiPromptTemplate: `As an elite CSO (Chief Strategy Officer), analyze the SEO overview data and provide:
1. Executive Summary (2-3 sentences on current competitive position)
2. Top 3 Strategic Priorities (high-impact, low-effort wins)
3. Competitive Gap Analysis (where you're winning/losing vs competitors)
4. 30-Day Action Plan (specific, measurable steps)
Return as JSON: {executiveSummary, priorities[], gaps[], actionPlan[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 2: COMPETITOR INTELLIGENCE - Market Position
    // ═══════════════════════════════════════════════════════════════════════
    categoryIntelligence: {
      id: 'categoryIntelligence',
      name: 'Market Intelligence',
      icon: '🌍',
      description: 'Deep competitive landscape analysis',
      
      dataPoints: [
        { source: 'FT_ParallelFetcher', field: 'allCompetitors', label: 'All Competitor Data' },
        { source: 'FT_ParallelFetcher', field: 'serper.organic', label: 'SERP Rankings' },
        { source: 'FT_ParallelFetcher', field: 'openPageRank', label: 'Authority Scores' },
        { source: 'FT_ForensicExtractors', field: 'techStack', label: 'Tech Stack' },
        { source: 'FT_ExtractMetadata', field: 'metaPatterns', label: 'Meta Patterns' }
      ],
      
      visualizations: {
        cards: [
          { id: 'market-position', type: 'position-matrix', data: 'competitorMatrix' },
          { id: 'market-share', type: 'donut', data: 'trafficShare' }
        ],
        charts: [
          { id: 'authority-comparison', type: 'horizontalBar', data: 'authorityScores', sorted: true },
          { id: 'traffic-trend', type: 'line', data: 'trafficTrends', multiLine: true },
          { id: 'market-bubble', type: 'bubble', data: 'authorityVsTraffic', axisX: 'authority', axisY: 'traffic' }
        ],
        heatmaps: [
          { id: 'feature-comparison', rows: 'competitors', cols: 'features', data: 'featureMatrix' }
        ],
        tables: [
          { id: 'competitor-matrix', columns: ['Competitor', 'Authority', 'Traffic', 'Keywords', 'Performance', 'Score'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['authority', 'organicTraffic', 'organicKeywords', 'performance', 'indexedPages'],
        ranking: true,
        marketShare: true,
        strengthWeakness: true
      },
      
      geminiPromptTemplate: `As the world's top competitive intelligence analyst, analyze this market data:

COMPETITOR DATA:
{{competitorData}}

Provide a Fortune 500-level strategic intelligence report:
1. Market Position Assessment (who leads, who's gaining ground)
2. Competitive Moats (sustainable advantages each competitor has)
3. Attack Vectors (weaknesses to exploit in each competitor)
4. Emerging Threats (signals of strategy shifts)
5. Strategic Recommendations (how to gain market share)

Return as JSON: {marketPosition, moats[], attackVectors[], threats[], recommendations[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 3: BRAND POSITIONING - Messaging & Value Props
    // ═══════════════════════════════════════════════════════════════════════
    brandPositioning: {
      id: 'brandPositioning',
      name: 'Brand Positioning',
      icon: '🎯',
      description: 'Brand messaging and value proposition analysis',
      
      dataPoints: [
        { source: 'FT_ForensicExtractors', field: 'narrative.brandNarrative', label: 'Brand Narrative' },
        { source: 'FT_ExtractMetadata', field: 'title', label: 'Title Messaging' },
        { source: 'FT_ExtractMetadata', field: 'description', label: 'Meta Description' },
        { source: 'FT_ExtractMetadata', field: 'openGraph', label: 'Social Messaging' },
        { source: 'FT_ForensicExtractors', field: 'narrative.introText', label: 'Intro Copy' },
        { source: 'FT_ForensicExtractors', field: 'eeat.trustSignals', label: 'Trust Signals' }
      ],
      
      visualizations: {
        cards: [
          { id: 'brand-strength', type: 'gauge', data: 'brandScore' },
          { id: 'trust-score', type: 'gauge', data: 'trustScore' }
        ],
        charts: [
          { id: 'brand-radar', type: 'radar', data: 'brandAttributes', competitors: 'overlay' },
          { id: 'messaging-comparison', type: 'wordCloud', data: 'messagingKeywords' }
        ],
        displays: [
          { id: 'title-comparison', type: 'textComparison', data: 'titles', highlight: 'keywords' },
          { id: 'value-props', type: 'cards', data: 'valuePropositions' }
        ],
        tables: [
          { id: 'messaging-matrix', columns: ['Competitor', 'Primary Value Prop', 'Secondary', 'Differentiator', 'Trust Signals'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['brandMentions', 'trustSignals', 'valuePropsClarity'],
        messaging: true,
        differentiation: true
      },
      
      geminiPromptTemplate: `As a world-class brand strategist (think David Ogilvy meets modern digital), analyze:

BRAND DATA:
{{brandData}}

Deliver elite brand intelligence:
1. Positioning Map (how each competitor positions themselves)
2. Value Proposition Analysis (what each promises and delivers)
3. Messaging Gaps (untapped positioning opportunities)
4. Brand Voice Comparison (tone, style, emotional triggers)
5. Differentiation Strategy (how to stand out uniquely)

Return as JSON: {positioningMap[], valueProps[], gaps[], voiceAnalysis[], strategy[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 4: TECHNICAL SEO - Performance & Core Web Vitals
    // ═══════════════════════════════════════════════════════════════════════
    technicalSEO: {
      id: 'technicalSEO',
      name: 'Technical SEO',
      icon: '⚙️',
      description: 'Core Web Vitals, performance, and technical health',
      
      dataPoints: [
        { source: 'FT_ParallelFetcher', field: 'pageSpeed', label: 'PageSpeed Data' },
        { source: 'FT_ForensicExtractors', field: 'techStack', label: 'Tech Stack' },
        { source: 'FT_ForensicExtractors', field: 'techStack.securityHeaders', label: 'Security Headers' },
        { source: 'FT_ExtractMetadata', field: 'robots', label: 'Robots Meta' },
        { source: 'FT_ExtractMetadata', field: 'canonical', label: 'Canonical' },
        { source: 'FT_ForensicExtractors', field: 'techStack.renderRisk', label: 'Render Risk' }
      ],
      
      visualizations: {
        cards: [
          { id: 'perf-score', type: 'gauge', data: 'performanceScore', thresholds: [50, 90] },
          { id: 'lcp', type: 'metric', data: 'lcp', unit: 's', thresholds: [2.5, 4] },
          { id: 'fid', type: 'metric', data: 'fid', unit: 'ms', thresholds: [100, 300] },
          { id: 'cls', type: 'metric', data: 'cls', thresholds: [0.1, 0.25] }
        ],
        charts: [
          { id: 'cwv-comparison', type: 'groupedBar', data: 'coreWebVitals', competitors: true },
          { id: 'perf-radar', type: 'radar', data: 'performanceBreakdown', competitors: 'overlay' },
          { id: 'tech-stack-dist', type: 'treemap', data: 'techStackDistribution' }
        ],
        tables: [
          { id: 'cwv-matrix', columns: ['Site', 'LCP', 'FID', 'CLS', 'Performance', 'Status'] },
          { id: 'tech-comparison', columns: ['Competitor', 'CMS', 'Analytics', 'Security', 'JS Frameworks'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['performanceScore', 'lcp', 'cls', 'tbt', 'speedIndex'],
        ranking: true,
        passFailThresholds: true
      },
      
      geminiPromptTemplate: `As a senior technical SEO architect (Google Core Web Vitals expert level), analyze:

TECHNICAL DATA:
{{technicalData}}

Provide elite technical intelligence:
1. Performance Ranking (who's fastest, who's struggling)
2. Core Web Vitals Assessment (pass/fail with specifics)
3. Technical Debt Analysis (legacy systems, JS bloat, etc.)
4. Security Posture Comparison (headers, HTTPS, etc.)
5. Technical Recommendations (prioritized by impact)

Return as JSON: {ranking[], cwvAssessment[], technicalDebt[], security[], recommendations[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 5: CONTENT INTELLIGENCE - Content Quality & Structure
    // ═══════════════════════════════════════════════════════════════════════
    contentIntelligence: {
      id: 'contentIntelligence',
      name: 'Content Intelligence',
      icon: '📝',
      description: 'Content quality, structure, and AI detection',
      
      dataPoints: [
        { source: 'FT_ForensicExtractors', field: 'headingStructure', label: 'Heading Structure' },
        { source: 'FT_ForensicExtractors', field: 'narrative.introText', label: 'Intro Copy' },
        { source: 'FT_ForensicExtractors', field: 'aiFootprint', label: 'AI Detection' },
        { source: 'FT_ExtractorsComprehensive', field: 'introCopy', label: 'Main Content' },
        { source: 'FT_ExtractorsComprehensive', field: 'faqs', label: 'FAQ Content' }
      ],
      
      visualizations: {
        cards: [
          { id: 'content-score', type: 'gauge', data: 'contentQualityScore' },
          { id: 'humanity-score', type: 'gauge', data: 'humanityScore', inverse: true },
          { id: 'readability', type: 'metric', data: 'readabilityScore' }
        ],
        charts: [
          { id: 'content-radar', type: 'radar', data: 'contentMetrics', competitors: 'overlay' },
          { id: 'heading-distribution', type: 'stackedBar', data: 'headingCounts', competitors: true },
          { id: 'ai-detection', type: 'bar', data: 'humanityScores', sorted: true }
        ],
        displays: [
          { id: 'heading-tree', type: 'tree', data: 'headingHierarchy' },
          { id: 'intro-comparison', type: 'textCards', data: 'introTexts' }
        ],
        tables: [
          { id: 'content-matrix', columns: ['Competitor', 'Word Count', 'H1', 'H2s', 'H3s', 'AI Score', 'Quality'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['wordCount', 'headingCount', 'humanityScore', 'readability'],
        ranking: true,
        contentGaps: true
      },
      
      geminiPromptTemplate: `As a world-class content strategist (ex-HubSpot, Moz, Ahrefs content lead), analyze:

CONTENT DATA:
{{contentData}}

Provide elite content intelligence:
1. Content Quality Ranking (best to worst with reasoning)
2. AI Content Assessment (who's using AI, how much, quality)
3. Structure Analysis (heading hierarchy effectiveness)
4. Content Gaps (topics competitors cover that you don't)
5. Content Strategy (how to out-content the competition)

Return as JSON: {qualityRanking[], aiAssessment[], structureAnalysis[], gaps[], strategy[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 6: KEYWORD STRATEGY - Keyword Intelligence
    // ═══════════════════════════════════════════════════════════════════════
    keywordStrategy: {
      id: 'keywordStrategy',
      name: 'Keyword Strategy',
      icon: '🔑',
      description: 'Keyword opportunities, gaps, and clustering',
      
      dataPoints: [
        { source: 'FT_ForensicExtractors', field: 'keywords.topKeywords', label: 'Top Keywords' },
        { source: 'FT_ForensicExtractors', field: 'keywords.longTailPhrases', label: 'Long-tail' },
        { source: 'FT_ExtractorsComprehensive', field: 'keywordsComprehensive.topicClusters', label: 'Topic Clusters' },
        { source: 'FT_ExtractorsComprehensive', field: 'keywordsComprehensive.semanticKeywords', label: 'LSI Keywords' },
        { source: 'FT_ParallelFetcher', field: 'serper.organic', label: 'SERP Data' },
        { source: 'Gemini', field: 'estimatedMetrics', label: 'Estimated Metrics' }
      ],
      
      visualizations: {
        cards: [
          { id: 'total-keywords', type: 'metric', data: 'totalKeywords' },
          { id: 'avg-difficulty', type: 'gauge', data: 'avgDifficulty' },
          { id: 'opportunity-score', type: 'gauge', data: 'opportunityScore' }
        ],
        charts: [
          { id: 'keyword-overlap', type: 'venn', data: 'keywordOverlap', competitors: true },
          { id: 'difficulty-distribution', type: 'histogram', data: 'difficultyDistribution' },
          { id: 'topic-clusters', type: 'sunburst', data: 'topicClusters' },
          { id: 'keyword-gaps', type: 'bar', data: 'keywordGaps', sorted: true }
        ],
        tables: [
          { id: 'keyword-matrix', columns: ['Keyword', 'Volume', 'Difficulty', 'You', 'Comp 1', 'Comp 2', 'Gap'] },
          { id: 'long-tail', columns: ['Phrase', 'Est. Volume', 'Intent', 'Competitors Ranking'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['totalKeywords', 'uniqueKeywords', 'sharedKeywords', 'gaps'],
        overlap: true,
        opportunities: true
      },
      
      geminiPromptTemplate: `As an elite keyword strategist (SEMrush/Ahrefs expert level), analyze:

KEYWORD DATA:
{{keywordData}}

Provide Fortune 500-level keyword intelligence:
1. Keyword Universe Mapping (who owns what)
2. Gap Analysis (keywords competitors rank for that you don't)
3. Quick Win Opportunities (low difficulty, high value)
4. Topic Cluster Strategy (semantic groupings to target)
5. Long-tail Goldmines (untapped phrase opportunities)
6. Competitive Keyword Strategy (6-month plan)

Return as JSON: {universeMap[], gapAnalysis[], quickWins[], clusters[], longTail[], strategy[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 7: CONTENT SYSTEMS - Publishing & Content Ops
    // ═══════════════════════════════════════════════════════════════════════
    contentSystems: {
      id: 'contentSystems',
      name: 'Content Systems',
      icon: '🔧',
      description: 'Content publishing systems and operations',
      
      dataPoints: [
        { source: 'FT_ForensicExtractors', field: 'techStack.cms', label: 'CMS' },
        { source: 'FT_ExtractSchema', field: 'types', label: 'Schema Types' },
        { source: 'FT_ExtractMetadata', field: 'article', label: 'Article Metadata' },
        { source: 'FT_ForensicExtractors', field: 'narrative.aiToolsDetected', label: 'AI Tools' }
      ],
      
      visualizations: {
        cards: [
          { id: 'cms-type', type: 'label', data: 'cms' },
          { id: 'schema-count', type: 'metric', data: 'schemaCount' }
        ],
        charts: [
          { id: 'cms-distribution', type: 'pie', data: 'cmsTypes', competitors: true },
          { id: 'schema-comparison', type: 'groupedBar', data: 'schemaTypes', competitors: true }
        ],
        tables: [
          { id: 'systems-matrix', columns: ['Competitor', 'CMS', 'Analytics', 'AI Tools', 'Schema Types'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['cmsType', 'schemaTypes', 'aiToolsUsed'],
        technologyStack: true
      },
      
      geminiPromptTemplate: `As a content operations expert, analyze the content systems data and provide:
1. Technology Stack Comparison (who's using what)
2. Content Ops Maturity (automation level, AI integration)
3. Schema Implementation Analysis (rich results potential)
4. Recommendations for system improvements

Return as JSON: {techComparison[], opsMaturity[], schemaAnalysis[], recommendations[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 8: CONVERSION DATA - Conversion Intelligence
    // ═══════════════════════════════════════════════════════════════════════
    conversionData: {
      id: 'conversionData',
      name: 'Conversion Intelligence',
      icon: '💰',
      description: 'Conversion optimization and friction analysis',
      
      dataPoints: [
        { source: 'FT_ForensicExtractors', field: 'conversionIntel', label: 'Conversion Data' },
        { source: 'FT_ForensicExtractors', field: 'conversionIntel.frictionScore', label: 'Friction Score' },
        { source: 'FT_ForensicExtractors', field: 'conversionIntel.formCount', label: 'Form Count' },
        { source: 'FT_ForensicExtractors', field: 'conversionIntel.ctaCount', label: 'CTA Count' },
        { source: 'FT_ForensicExtractors', field: 'conversionIntel.chatWidgetDetected', label: 'Chat Widget' }
      ],
      
      visualizations: {
        cards: [
          { id: 'friction-score', type: 'gauge', data: 'frictionScore', inverse: true },
          { id: 'form-count', type: 'metric', data: 'formCount' },
          { id: 'cta-count', type: 'metric', data: 'ctaCount' }
        ],
        charts: [
          { id: 'friction-comparison', type: 'bar', data: 'frictionScores', sorted: true },
          { id: 'cta-radar', type: 'radar', data: 'conversionElements', competitors: 'overlay' },
          { id: 'conversion-funnel', type: 'funnel', data: 'conversionPath' }
        ],
        tables: [
          { id: 'conversion-matrix', columns: ['Competitor', 'Friction', 'Forms', 'CTAs', 'Chat', 'Pricing', 'Trial'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['frictionScore', 'ctaCount', 'formFields', 'conversionElements'],
        ranking: true,
        conversionOptimization: true
      },
      
      geminiPromptTemplate: `As a conversion rate optimization (CRO) expert (think Unbounce, VWO expert), analyze:

CONVERSION DATA:
{{conversionData}}

Provide elite CRO intelligence:
1. Friction Analysis (who has highest/lowest friction)
2. CTA Strategy Comparison (what CTAs each uses)
3. Form Optimization (field count, friction points)
4. Conversion Psychology (urgency, scarcity, social proof usage)
5. Win/Lose Assessment (who's converting better and why)

Return as JSON: {frictionAnalysis[], ctaStrategy[], formOptimization[], psychology[], assessment[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 9: DISTRIBUTION DATA - Link Building & Outreach
    // ═══════════════════════════════════════════════════════════════════════
    distributionData: {
      id: 'distributionData',
      name: 'Link Distribution',
      icon: '🔗',
      description: 'Link profile and distribution analysis',
      
      dataPoints: [
        { source: 'FT_ExtractLinks', field: 'summary', label: 'Link Summary' },
        { source: 'FT_ExtractLinks', field: 'externalLinks', label: 'External Links' },
        { source: 'FT_ExtractLinks', field: 'anchorStats', label: 'Anchor Stats' },
        { source: 'FT_ExtractLinks', field: 'topLinkedDomains', label: 'Top Domains' }
      ],
      
      visualizations: {
        cards: [
          { id: 'internal-links', type: 'metric', data: 'internalCount' },
          { id: 'external-links', type: 'metric', data: 'externalCount' },
          { id: 'link-density', type: 'metric', data: 'linkDensity' }
        ],
        charts: [
          { id: 'link-distribution', type: 'pie', data: 'linkDistribution' },
          { id: 'anchor-text', type: 'bar', data: 'anchorTypes', competitors: true },
          { id: 'top-domains', type: 'horizontalBar', data: 'topLinkedDomains', sorted: true }
        ],
        tables: [
          { id: 'link-matrix', columns: ['Competitor', 'Internal', 'External', 'Dofollow', 'Nofollow', 'Density'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['totalLinks', 'internalLinks', 'externalLinks', 'dofollow', 'nofollow'],
        ranking: true,
        linkProfile: true
      },
      
      geminiPromptTemplate: `As a link building strategist, analyze the link distribution data and provide:
1. Link Profile Comparison (internal vs external balance)
2. Anchor Text Strategy (natural vs optimized)
3. Link Building Opportunities (domains to target)
4. Internal Linking Recommendations

Return as JSON: {profileComparison[], anchorStrategy[], opportunities[], recommendations[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 10: AUDIENCE INTELLIGENCE
    // ═══════════════════════════════════════════════════════════════════════
    audienceIntelligence: {
      id: 'audienceIntelligence',
      name: 'Audience Intel',
      icon: '👥',
      description: 'Audience targeting and persona analysis',
      
      dataPoints: [
        { source: 'FT_ExtractMetadata', field: 'openGraph', label: 'Social Meta' },
        { source: 'FT_ForensicExtractors', field: 'narrative', label: 'Brand Narrative' },
        { source: 'FT_ExtractorsComprehensive', field: 'keywordsComprehensive', label: 'Keywords' }
      ],
      
      visualizations: {
        charts: [
          { id: 'audience-overlap', type: 'venn', data: 'audienceOverlap' },
          { id: 'intent-distribution', type: 'pie', data: 'searchIntent' }
        ],
        tables: [
          { id: 'audience-matrix', columns: ['Competitor', 'Primary Audience', 'Secondary', 'Intent Focus'] }
        ]
      },
      
      geminiPromptTemplate: `Analyze audience targeting strategies and provide persona insights for each competitor.
Return as JSON: {personas[], targeting[], overlap[], opportunities[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 11: GEO/AEO INTELLIGENCE
    // ═══════════════════════════════════════════════════════════════════════
    geoAeoIntelligence: {
      id: 'geoAeoIntelligence',
      name: 'GEO/AEO Intel',
      icon: '🌐',
      description: 'Geographic and Answer Engine Optimization',
      
      dataPoints: [
        { source: 'FT_ExtractSchema', field: 'schemas', label: 'Schema Data' },
        { source: 'FT_ExtractorsComprehensive', field: 'faqs', label: 'FAQ Content' },
        { source: 'FT_ExtractMetadata', field: 'hreflang', label: 'Language Targeting' }
      ],
      
      visualizations: {
        charts: [
          { id: 'faq-comparison', type: 'bar', data: 'faqCount', competitors: true },
          { id: 'schema-distribution', type: 'pie', data: 'schemaTypes' }
        ]
      },
      
      geminiPromptTemplate: `Analyze Answer Engine Optimization readiness and provide recommendations.
Return as JSON: {aeoReadiness[], faqStrategy[], schemaRecommendations[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 12: AUTHORITY & INFLUENCE
    // ═══════════════════════════════════════════════════════════════════════
    authorityInfluence: {
      id: 'authorityInfluence',
      name: 'Authority',
      icon: '👑',
      description: 'Domain authority and backlink analysis',
      
      dataPoints: [
        { source: 'FT_ParallelFetcher', field: 'openPageRank', label: 'Authority Data' },
        { source: 'FT_ForensicExtractors', field: 'eeat', label: 'E-E-A-T Signals' },
        { source: 'FT_ExtractorsComprehensive', field: 'authorSignals', label: 'Author Signals' }
      ],
      
      visualizations: {
        cards: [
          { id: 'authority-score', type: 'gauge', data: 'authority', comparative: true },
          { id: 'eeat-score', type: 'gauge', data: 'eeatScore' }
        ],
        charts: [
          { id: 'authority-ranking', type: 'horizontalBar', data: 'authorityScores', sorted: true },
          { id: 'eeat-radar', type: 'radar', data: 'eeatBreakdown', competitors: 'overlay' }
        ],
        tables: [
          { id: 'authority-matrix', columns: ['Competitor', 'Authority', 'Trust', 'Expertise', 'Experience'] }
        ]
      },
      
      comparativeAnalysis: {
        metrics: ['authority', 'eeatScore', 'trustSignals'],
        ranking: true
      },
      
      geminiPromptTemplate: `As an E-E-A-T expert, analyze authority and trust signals across competitors.
Return as JSON: {authorityRanking[], trustAnalysis[], eeatBreakdown[], buildingStrategy[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 13: PERFORMANCE & PREDICTIVE
    // ═══════════════════════════════════════════════════════════════════════
    performancePredictive: {
      id: 'performancePredictive',
      name: 'Predictive',
      icon: '📈',
      description: 'Performance trends and predictive analytics',
      
      dataPoints: [
        { source: 'FT_ParallelFetcher', field: 'pageSpeed', label: 'Performance' },
        { source: 'FT_ParallelFetcher', field: 'serper.organic', label: 'SERP Data' },
        { source: 'All', field: 'historicalData', label: 'Historical Data' }
      ],
      
      visualizations: {
        charts: [
          { id: 'trend-line', type: 'line', data: 'performanceTrends', multiLine: true },
          { id: 'prediction', type: 'line', data: 'predictions', dashed: true }
        ]
      },
      
      geminiPromptTemplate: `As a predictive analytics expert, analyze trends and forecast future performance.
Return as JSON: {currentTrends[], predictions[], opportunities[], risks[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 14: STRATEGIC OPPORTUNITIES
    // ═══════════════════════════════════════════════════════════════════════
    strategicOpportunities: {
      id: 'strategicOpportunities',
      name: 'Opportunities',
      icon: '💎',
      description: 'Strategic opportunities and action items',
      
      dataPoints: [
        { source: 'All', field: 'gapAnalysis', label: 'All Gaps' },
        { source: 'Gemini', field: 'recommendations', label: 'AI Recommendations' }
      ],
      
      visualizations: {
        charts: [
          { id: 'opportunity-matrix', type: 'bubble', data: 'opportunities', axisX: 'impact', axisY: 'effort' },
          { id: 'priority-funnel', type: 'funnel', data: 'prioritizedActions' }
        ],
        tables: [
          { id: 'action-plan', columns: ['Priority', 'Action', 'Impact', 'Effort', 'Timeline', 'Owner'] }
        ]
      },
      
      geminiPromptTemplate: `As a strategic consultant, synthesize all data into prioritized opportunities.
Return as JSON: {quickWins[], strategicPlays[], longTermInvestments[], actionPlan[]}`
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TAB 15: SCORING ENGINE
    // ═══════════════════════════════════════════════════════════════════════
    scoringEngine: {
      id: 'scoringEngine',
      name: 'Scoring',
      icon: '🎯',
      description: 'Comprehensive scoring and grading',
      
      dataPoints: [
        { source: 'All', field: 'allMetrics', label: 'All Metrics' }
      ],
      
      visualizations: {
        cards: [
          { id: 'overall-grade', type: 'grade', data: 'overallGrade' }
        ],
        charts: [
          { id: 'score-breakdown', type: 'radar', data: 'categoryScores', competitors: 'overlay' },
          { id: 'leaderboard', type: 'horizontalBar', data: 'rankings', sorted: true }
        ],
        tables: [
          { id: 'score-matrix', columns: ['Competitor', 'Overall', 'Technical', 'Content', 'Authority', 'Conversion', 'Grade'] }
        ]
      },
      
      geminiPromptTemplate: `As a scoring analyst, calculate comprehensive grades for each competitor.
Return as JSON: {grades[], categoryScores[], ranking[], improvements[]}`
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: DATA PERSISTENCE LAYER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save processed data for a specific tab
 * Enables UI to draw directly from stored, processed data
 */
function ELITE_saveTabData(projectId, domain, tabId, rawData, processedViz, geminiInsights) {
  try {
    var ss = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('SHEET_ID') ||
      SpreadsheetApp.getActiveSpreadsheet().getId()
    );
    
    var sheet = ss.getSheetByName(ELITE_DATA_CONFIG.STORAGE_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(ELITE_DATA_CONFIG.STORAGE_SHEET);
      sheet.getRange(1, 1, 1, 8).setValues([[
        'ProjectID', 'Domain', 'TabID', 'RawData', 'Visualizations', 
        'GeminiInsights', 'ComparativeData', 'Timestamp'
      ]]);
    }
    
    // Find existing row or append
    var existingRow = findExistingTabRow_(sheet, projectId, domain, tabId);
    
    var rowData = [
      projectId,
      domain,
      tabId,
      JSON.stringify(rawData || {}),
      JSON.stringify(processedViz || {}),
      JSON.stringify(geminiInsights || {}),
      JSON.stringify({}),
      new Date().toISOString()
    ];
    
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, 8).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return { success: true, tabId: tabId };
    
  } catch (e) {
    Logger.log('Error saving tab data: ' + e);
    return { success: false, error: String(e) };
  }
}

/**
 * Get all tab data for UI rendering
 * Returns processed, visualization-ready data for each tab
 */
function ELITE_getTabDataForUI(projectId, domain) {
  try {
    var ss = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('SHEET_ID') ||
      SpreadsheetApp.getActiveSpreadsheet().getId()
    );
    
    var sheet = ss.getSheetByName(ELITE_DATA_CONFIG.STORAGE_SHEET);
    if (!sheet) {
      return { success: false, error: 'No data found', tabs: {} };
    }
    
    var data = sheet.getDataRange().getValues();
    var tabs = {};
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[0] === projectId && (domain === 'all' || row[1] === domain)) {
        var tabId = row[2];
        tabs[tabId] = {
          domain: row[1],
          rawData: JSON.parse(row[3] || '{}'),
          visualizations: JSON.parse(row[4] || '{}'),
          geminiInsights: JSON.parse(row[5] || '{}'),
          comparativeData: JSON.parse(row[6] || '{}'),
          timestamp: row[7]
        };
      }
    }
    
    return { success: true, tabs: tabs };
    
  } catch (e) {
    return { success: false, error: String(e), tabs: {} };
  }
}

function findExistingTabRow_(sheet, projectId, domain, tabId) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === projectId && data[i][1] === domain && data[i][2] === tabId) {
      return i + 1;
    }
  }
  return -1;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: ELITE GEMINI PROMPT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate elite Gemini prompt for a specific tab
 * Uses the tab's prompt template and injects real data
 */
function ELITE_generateTabPrompt(tabId, competitorData, yourData) {
  var specs = ELITE_getTabVisualizationSpecs();
  var tab = specs[tabId];
  
  if (!tab || !tab.geminiPromptTemplate) {
    return null;
  }
  
  // Build context-rich prompt
  var prompt = `You are a world-class ${tab.name} analyst delivering Fortune 500-level strategic intelligence.

ANALYSIS CONTEXT:
- Tab Focus: ${tab.name} - ${tab.description}
- Competitors Analyzed: ${competitorData.length}
- Your Domain: ${yourData.domain || 'Not specified'}

DATA FOR ANALYSIS:
${JSON.stringify(competitorData, null, 2)}

YOUR DOMAIN DATA:
${JSON.stringify(yourData, null, 2)}

ANALYSIS REQUIREMENTS:
${tab.geminiPromptTemplate}

CRITICAL: 
- Be specific with numbers, percentages, and actionable recommendations
- Compare YOUR domain against each competitor explicitly
- Prioritize recommendations by impact and effort
- Return ONLY valid JSON, no markdown`;
  
  return prompt;
}

/**
 * Call Gemini for elite tab analysis
 */
function ELITE_analyzeTabWithGemini(tabId, competitorData, yourData) {
  var prompt = ELITE_generateTabPrompt(tabId, competitorData, yourData);
  
  if (!prompt) {
    return { success: false, error: 'Invalid tab ID' };
  }
  
  try {
    // Use existing Gemini function
    var result = AI_geminiGenerate('gemini-3-flash-preview', prompt, {
      temperature: 0.7,
      maxTokens: 8192
    });
    
    if (result && result.text) {
      // Extract JSON
      var jsonText = result.text;
      var jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      return {
        success: true,
        insights: JSON.parse(jsonText),
        rawResponse: result.text
      };
    }
    
    return { success: false, error: 'No response from Gemini' };
    
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: COMPARATIVE ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate comparative analysis across all competitors for a metric
 */
function ELITE_generateComparativeAnalysis(competitors, metricPath) {
  var values = [];
  
  competitors.forEach(function(comp) {
    var value = getNestedValue(comp, metricPath);
    values.push({
      domain: comp.domain,
      value: value || 0
    });
  });
  
  // Sort by value
  values.sort(function(a, b) { return b.value - a.value; });
  
  // Calculate statistics
  var numValues = values.map(function(v) { return v.value; });
  var sum = numValues.reduce(function(a, b) { return a + b; }, 0);
  var avg = sum / numValues.length;
  var max = Math.max.apply(null, numValues);
  var min = Math.min.apply(null, numValues);
  
  // Add rankings and gaps
  values.forEach(function(v, i) {
    v.rank = i + 1;
    v.percentile = Math.round((1 - i / values.length) * 100);
    v.gapFromLeader = max - v.value;
    v.gapFromAvg = v.value - avg;
  });
  
  return {
    metric: metricPath,
    rankings: values,
    stats: {
      average: avg,
      max: max,
      min: min,
      range: max - min,
      leader: values[0].domain,
      laggard: values[values.length - 1].domain
    }
  };
}

function getNestedValue(obj, path) {
  var parts = path.split('.');
  var current = obj;
  for (var i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return null;
    current = current[parts[i]];
  }
  return current;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: UI DATA RENDERER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Process raw FT data into UI-ready visualization data
 * Called after data collection to prepare for rendering
 */
function ELITE_processDataForUI(projectId, competitorData, yourData) {
  var specs = ELITE_getTabVisualizationSpecs();
  var processedTabs = {};
  
  Object.keys(specs).forEach(function(tabId) {
    var tab = specs[tabId];
    
    // Extract relevant data for this tab
    var tabData = extractTabData_(competitorData, yourData, tab.dataPoints);
    
    // Generate visualizations config
    var vizConfig = generateVisualizationConfig_(tabData, tab.visualizations);
    
    // Generate comparative analysis if needed
    var comparative = {};
    if (tab.comparativeAnalysis) {
      tab.comparativeAnalysis.metrics.forEach(function(metric) {
        comparative[metric] = ELITE_generateComparativeAnalysis(competitorData, metric);
      });
    }
    
    processedTabs[tabId] = {
      id: tabId,
      name: tab.name,
      icon: tab.icon,
      data: tabData,
      visualizations: vizConfig,
      comparative: comparative
    };
  });
  
  return {
    success: true,
    projectId: projectId,
    tabs: processedTabs,
    timestamp: new Date().toISOString()
  };
}

function extractTabData_(competitorData, yourData, dataPoints) {
  var extracted = { competitors: [], you: {} };
  
  competitorData.forEach(function(comp) {
    var compData = { domain: comp.domain };
    dataPoints.forEach(function(dp) {
      compData[dp.field] = getNestedValue(comp, dp.field);
    });
    extracted.competitors.push(compData);
  });
  
  dataPoints.forEach(function(dp) {
    extracted.you[dp.field] = getNestedValue(yourData, dp.field);
  });
  
  return extracted;
}

function generateVisualizationConfig_(tabData, vizSpecs) {
  var config = { cards: [], charts: [], tables: [], displays: [] };
  
  if (vizSpecs.cards) {
    vizSpecs.cards.forEach(function(card) {
      config.cards.push({
        id: card.id,
        type: card.type,
        dataKey: card.data,
        comparative: card.comparative || false
      });
    });
  }
  
  if (vizSpecs.charts) {
    vizSpecs.charts.forEach(function(chart) {
      config.charts.push({
        id: chart.id,
        type: chart.type,
        dataKey: chart.data,
        competitors: chart.competitors || false
      });
    });
  }
  
  if (vizSpecs.tables) {
    vizSpecs.tables.forEach(function(table) {
      config.tables.push({
        id: table.id,
        columns: table.columns
      });
    });
  }
  
  return config;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: MAIN WORKFLOW INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main function: Process all competitor data and prepare for all 15 tabs
 * Called after WORKFLOW_analyzeCompetitors completes
 */
function ELITE_processAllTabsForUI(projectId, competitorData, yourData) {
  Logger.log('🎨 ELITE: Processing data for all 15 tabs...');
  
  var results = {
    success: true,
    projectId: projectId,
    tabs: {},
    geminiInsights: {},
    timestamp: new Date().toISOString()
  };
  
  var specs = ELITE_getTabVisualizationSpecs();
  
  Object.keys(specs).forEach(function(tabId) {
    Logger.log('   Processing tab: ' + tabId);
    
    var tab = specs[tabId];
    
    // 1. Extract relevant data
    var tabData = extractTabData_(competitorData, yourData, tab.dataPoints);
    
    // 2. Generate comparative analysis
    var comparative = {};
    if (tab.comparativeAnalysis && tab.comparativeAnalysis.metrics) {
      tab.comparativeAnalysis.metrics.forEach(function(metric) {
        comparative[metric] = ELITE_generateComparativeAnalysis(competitorData, metric);
      });
    }
    
    // 3. Get Gemini insights for this tab
    var geminiResult = ELITE_analyzeTabWithGemini(tabId, competitorData, yourData);
    
    // 4. Save to persistent storage
    ELITE_saveTabData(projectId, 'all', tabId, tabData, {
      comparative: comparative
    }, geminiResult.success ? geminiResult.insights : {});
    
    // 5. Build result for UI
    results.tabs[tabId] = {
      id: tabId,
      name: tab.name,
      icon: tab.icon,
      data: tabData,
      visualizations: tab.visualizations,
      comparative: comparative
    };
    
    if (geminiResult.success) {
      results.geminiInsights[tabId] = geminiResult.insights;
    }
  });
  
  Logger.log('✅ ELITE: All 15 tabs processed successfully');
  
  return results;
}

/**
 * Quick function to get tab specifications for UI
 */
function ELITE_getTabSpecs() {
  return ELITE_getTabVisualizationSpecs();
}

/**
 * Test function
 */
function ELITE_testVisualizationEngine() {
  var specs = ELITE_getTabVisualizationSpecs();
  
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('          ELITE DATA VISUALIZATION ENGINE TEST');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('Total Tabs: ' + Object.keys(specs).length);
  Logger.log('');
  
  Object.keys(specs).forEach(function(tabId) {
    var tab = specs[tabId];
    Logger.log('📊 ' + tab.icon + ' ' + tab.name);
    Logger.log('   ID: ' + tabId);
    Logger.log('   Data Points: ' + tab.dataPoints.length);
    Logger.log('   Charts: ' + (tab.visualizations.charts ? tab.visualizations.charts.length : 0));
    Logger.log('   Tables: ' + (tab.visualizations.tables ? tab.visualizations.tables.length : 0));
    Logger.log('   Has Gemini Prompt: ' + (tab.geminiPromptTemplate ? 'YES' : 'NO'));
    Logger.log('');
  });
}

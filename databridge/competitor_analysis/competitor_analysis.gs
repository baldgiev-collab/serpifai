/**
 * COMPETITOR ANALYSIS ENGINE - MODULAR ROUTER
 * Routes to specialized analysis modules
 * Modules: Overview, Market Intel, Brand Position, Technical SEO, Content Intel, etc.
 */

/**
 * Main entry point: Analyze multiple competitors
 * @param {object} params - { competitors: [urls], categories: 'all' or [], projectId }
 * @return {object} Complete competitor analysis
 */
function COMP_analyzeCompetitors(params) {
  var startTime = new Date().getTime();
  
  try {
    var competitors = params.competitors || [];
    var categories = params.categories || ['overview', 'marketIntel', 'brandPosition'];
    var projectId = params.projectId || params.project_id;
    
    if (!competitors || competitors.length === 0) {
      return { ok: false, error: 'At least one competitor URL/domain required' };
    }
    
    // If categories is 'all', include all available modules
    if (categories === 'all') {
      categories = ['overview', 'marketIntel', 'brandPosition', 'technicalSEO', 'contentIntel'];
    }
    
    var results = {
      ok: true,
      timestamp: new Date().toISOString(),
      competitorCount: competitors.length,
      competitors: [],
      aggregates: {},
      benchmarks: {},
      recommendations: [],
      executionTime: 0
    };
    
    // Analyze each competitor
    for (var i = 0; i < competitors.length; i++) {
      var compUrl = competitors[i];
      var compDomain = extractDomain(compUrl);
      
      var competitorData = {
        ok: true,
        domain: compDomain,
        url: compUrl,
        categories: {}
      };
      
      // Run requested category analyses
      for (var j = 0; j < categories.length; j++) {
        var category = categories[j];
        
        try {
          switch(category) {
            case 'overview':
              competitorData.categories.overview = COMP_getOverview({
                domain: compDomain,
                url: compUrl,
                includeAI: params.includeAI !== false,
                includeSEO: params.includeSEO !== false
              });
              break;
            
            case 'marketIntel':
              competitorData.categories.marketIntel = COMP_analyzeMarketIntel({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'brandPosition':
              competitorData.categories.brandPosition = COMP_analyzeBrandPosition({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            // Add more categories as modules are created
            default:
              Logger.log('Unknown category: ' + category);
          }
        } catch (e) {
          Logger.log('Error analyzing ' + category + ' for ' + compDomain + ': ' + e);
          competitorData.categories[category] = { ok: false, error: String(e) };
        }
      }
      
      results.competitors.push(competitorData);
    }
    
    // Calculate aggregates and benchmarks
    if (results.competitors.length > 0) {
      results.aggregates = COMP_calculateAggregates(results.competitors);
      results.benchmarks = COMP_calculateBenchmarks(results.competitors);
      results.recommendations = COMP_generateRecommendations(results.competitors, results.benchmarks);
    }
    
    // Save to global sheet if projectId provided
    if (projectId) {
      CONFIG_saveCompetitorData(results.competitors, projectId);
    }
    
    results.executionTime = new Date().getTime() - startTime;
    return results;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeCompetitors: ' + e);
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Calculate aggregates across all competitors
 * @param {array} competitors - Array of competitor data
 * @return {object} Aggregate metrics
 */
function COMP_calculateAggregates(competitors) {
  var aggregates = {
    avgAIVisibility: 0,
    avgAuthorityScore: 0,
    avgOrganicTraffic: 0,
    avgBacklinks: 0,
    avgEEATScore: 0,
    totalCompetitors: competitors.length
  };
  
  try {
    var totalAI = 0, totalAuth = 0, totalTraffic = 0, totalBacklinks = 0, totalEEAT = 0;
    var countAI = 0, countAuth = 0, countTraffic = 0, countBacklinks = 0, countEEAT = 0;
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      
      // Overview metrics
      if (comp.categories && comp.categories.overview) {
        if (comp.categories.overview.aiVisibility && comp.categories.overview.aiVisibility.score) {
          totalAI += comp.categories.overview.aiVisibility.score;
          countAI++;
        }
        
        if (comp.categories.overview.seo && comp.categories.overview.seo.authorityScore) {
          totalAuth += comp.categories.overview.seo.authorityScore;
          countAuth++;
        }
        
        if (comp.categories.overview.traffic && comp.categories.overview.traffic.total) {
          totalTraffic += comp.categories.overview.traffic.total;
          countTraffic++;
        }
        
        if (comp.categories.overview.seo && comp.categories.overview.seo.backlinks) {
          totalBacklinks += comp.categories.overview.seo.backlinks;
          countBacklinks++;
        }
      }
      
      // Brand Position metrics
      if (comp.categories && comp.categories.brandPosition) {
        if (comp.categories.brandPosition.eeatSignals && comp.categories.brandPosition.eeatSignals.overallScore) {
          totalEEAT += comp.categories.brandPosition.eeatSignals.overallScore;
          countEEAT++;
        }
      }
    }
    
    aggregates.avgAIVisibility = countAI > 0 ? Math.round(totalAI / countAI) : 0;
    aggregates.avgAuthorityScore = countAuth > 0 ? Math.round(totalAuth / countAuth) : 0;
    aggregates.avgOrganicTraffic = countTraffic > 0 ? Math.round(totalTraffic / countTraffic) : 0;
    aggregates.avgBacklinks = countBacklinks > 0 ? Math.round(totalBacklinks / countBacklinks) : 0;
    aggregates.avgEEATScore = countEEAT > 0 ? Math.round(totalEEAT / countEEAT) : 0;
    
    return aggregates;
    
  } catch (e) {
    Logger.log('Error calculating aggregates: ' + e);
    return aggregates;
  }
}

/**
 * Calculate benchmarks (targets to beat competitors)
 * @param {array} competitors - Array of competitor data
 * @return {object} Benchmark targets
 */
function COMP_calculateBenchmarks(competitors) {
  var aggregates = COMP_calculateAggregates(competitors);
  
  // Benchmarks = 120% of average (to beat competition)
  return {
    targetAIVisibility: Math.round(aggregates.avgAIVisibility * 1.2),
    targetAuthorityScore: Math.round(aggregates.avgAuthorityScore * 1.2),
    targetOrganicTraffic: Math.round(aggregates.avgOrganicTraffic * 1.2),
    targetBacklinks: Math.round(aggregates.avgBacklinks * 1.2),
    targetEEATScore: Math.round(aggregates.avgEEATScore * 1.2)
  };
}

/**
 * Generate strategic recommendations
 * @param {array} competitors - Array of competitor data
 * @param {object} benchmarks - Target benchmarks
 * @return {array} Prioritized recommendations
 */
function COMP_generateRecommendations(competitors, benchmarks) {
  var recommendations = [];
  
  try {
    // Analyze gaps across all competitors
    var aiGap = false, authorityGap = false, eeATGap = false;
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      
      if (comp.categories && comp.categories.overview) {
        // Check AI visibility gap
        if (comp.categories.overview.aiVisibility && 
            comp.categories.overview.aiVisibility.score < benchmarks.targetAIVisibility) {
          aiGap = true;
        }
        
        // Check authority gap
        if (comp.categories.overview.seo && 
            comp.categories.overview.seo.authorityScore < benchmarks.targetAuthorityScore) {
          authorityGap = true;
        }
      }
      
      if (comp.categories && comp.categories.brandPosition) {
        // Check E-E-A-T gap
        if (comp.categories.brandPosition.eeatSignals && 
            comp.categories.brandPosition.eeatSignals.overallScore < benchmarks.targetEEATScore) {
          eeATGap = true;
        }
      }
    }
    
    // Generate recommendations based on gaps
    if (aiGap) {
      recommendations.push({
        priority: 'high',
        category: 'AI Visibility',
        issue: 'Competitors have low AI visibility',
        opportunity: 'Capture AI search market share',
        actions: [
          'Create high-quality, factual content optimized for AI engines',
          'Build strong E-E-A-T signals (expertise, experience, authoritativeness, trust)',
          'Get featured in AI-cited sources (Wikipedia, major publications)',
          'Implement structured data and schema markup',
          'Focus on answering user questions directly'
        ],
        estimatedImpact: 'High - AI search is growing rapidly'
      });
    }
    
    if (authorityGap) {
      recommendations.push({
        priority: 'high',
        category: 'Domain Authority',
        issue: 'Competitors have moderate authority',
        opportunity: 'Outrank with superior backlink profile',
        actions: [
          'Launch linkable asset campaign (original research, tools, guides)',
          'Guest post on high-authority sites in your niche',
          'Build relationships with industry influencers',
          'Create shareable infographics and data visualizations',
          'Fix technical SEO issues to maximize link equity'
        ],
        estimatedImpact: 'High - Authority drives rankings'
      });
    }
    
    if (eeATGap) {
      recommendations.push({
        priority: 'medium',
        category: 'E-E-A-T Signals',
        issue: 'Competitors have weak trust signals',
        opportunity: 'Establish expertise and trustworthiness',
        actions: [
          'Add author bios with credentials to all content',
          'Implement Author and Organization schema',
          'Collect and display customer reviews/testimonials',
          'Publish case studies and success stories',
          'Get certified or accredited in your industry'
        ],
        estimatedImpact: 'Medium - Builds long-term trust'
      });
    }
    
    // Always recommend content gaps analysis
    recommendations.push({
      priority: 'medium',
      category: 'Content Strategy',
      issue: 'Identify content gaps in competitor coverage',
      opportunity: 'Capture underserved topics',
      actions: [
        'Analyze competitor content clusters',
        'Identify high-volume, low-competition keywords',
        'Create comprehensive topic hubs',
        'Target People Also Ask questions',
        'Build content around emerging trends'
      ],
      estimatedImpact: 'Medium-High - Captures new traffic'
    });
    
    return recommendations;
    
  } catch (e) {
    Logger.log('Error generating recommendations: ' + e);
    return recommendations;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    if (!url) return '';
    var domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
    return domain;
  } catch (e) {
    return url;
  }
}

/**
 * CATEGORY 1: OVERVIEW TAB
 * AI Visibility + SEO Metrics Dashboard
 */
function analyzeOverview(domain, options) {
  var overview = {
    aiVisibility: {},
    seo: {},
    distribution: {},
    traffic: {},
    keywords: {},
    competitors: {},
    recommendations: []
  };
  
  try {
    // AI Visibility Metrics
    overview.aiVisibility = {
      score: 0, // 0-100 score
      totalMentions: 0,
      citedPages: 0,
      byPlatform: {
        chatGPT: { mentions: 0, pages: 0, trend: 0 },
        aiOverview: { mentions: 0, pages: 0, trend: 0 },
        aiMode: { mentions: 0, pages: 0, trend: 0 },
        gemini: { mentions: 0, pages: 0, trend: 0, available: false }
      },
      readinessScore: 0 // How ready for AI search
    };
    
    // Fetch AI visibility data (would integrate with GEO APIs)
    var aiData = fetchAIVisibilityData(domain);
    if (aiData.ok) {
      overview.aiVisibility = aiData.data;
    }
    
    // SEO Authority Metrics
    overview.seo = {
      authorityScore: 0, // 0-100
      authorityLevel: '', // 'Industry leader', 'Strong', 'Moderate', 'Weak'
      organicTraffic: 0,
      organicTrafficTrend: 0, // % change
      paidTraffic: 0,
      paidTrafficTrend: 0,
      referringDomains: 0,
      trafficShare: 0, // % of market
      organicKeywords: 0,
      organicKeywordsTrend: 0,
      paidKeywords: 0,
      paidKeywordsTrend: 0,
      backlinks: 0
    };
    
    // Fetch SEO data from Serper/DataForSEO/OpenPageRank
    var seoData = fetchSEOMetrics(domain);
    if (seoData.ok) {
      overview.seo = seoData.data;
    }
    
    // Distribution by Country
    overview.distribution = {
      countries: [] // { country, visibility, mentions }
    };
    
    var geoData = fetchGeoDistribution(domain);
    if (geoData.ok) {
      overview.distribution = geoData.data;
    }
    
    // Top Cited Sources (where competitor is mentioned)
    overview.citedSources = [];
    var citationData = fetchTopCitations(domain);
    if (citationData.ok) {
      overview.citedSources = citationData.data;
    }
    
    // SERP Position Distribution
    overview.serpDistribution = {
      organic: 0, // % of keywords in organic results
      aiOverviews: 0, // % in AI Overviews
      otherFeatures: 0 // % in other SERP features
    };
    
    // Traffic Trends (time series)
    overview.traffic = {
      organic: [], // { date, value }
      paid: [],
      branded: []
    };
    
    var trafficTrends = fetchTrafficTrends(domain);
    if (trafficTrends.ok) {
      overview.traffic = trafficTrends.data;
    }
    
    // Keyword Position Distribution
    overview.keywords = {
      positionDistribution: {
        top3: 0,
        position4to10: 0,
        position11to20: 0,
        position21to50: 0,
        position51to100: 0,
        aiOverviews: 0,
        otherFeatures: 0
      },
      timeSeries: [] // { date, top3, position4to10, ... }
    };
    
    var keywordData = fetchKeywordDistribution(domain);
    if (keywordData.ok) {
      overview.keywords = keywordData.data;
    }
    
    // Organic Research: Key Topics
    overview.keyTopics = []; // { topic, traffic }
    var topicData = fetchKeyTopics(domain);
    if (topicData.ok) {
      overview.keyTopics = topicData.data;
    }
    
    // Main Organic Competitors
    overview.competitors = {
      organic: [], // { domain, commonLevel, commonKeywords, seKeywords }
      paid: [], // { domain, commonLevel, commonKeywords, paidKeywords }
      competitiveMap: {
        organic: [], // { domain, organicKeywords, organicTraffic }
        paid: [] // { domain, paidKeywords, paidTraffic }
      }
    };
    
    var competitorData = fetchCompetitorData(domain);
    if (competitorData.ok) {
      overview.competitors = competitorData.data;
    }
    
    // Paid Advertising Research
    overview.paidResearch = {
      topPaidKeywords: [], // { keyword, position, volume, cpc, trafficPercent }
      paidPositionDistribution: {
        position1: 0, // %
        position2to3: 0,
        other: 0
      }
    };
    
    var paidData = fetchPaidResearch(domain);
    if (paidData.ok) {
      overview.paidResearch = paidData.data;
    }
    
    // Generate recommendations
    overview.recommendations = generateOverviewRecommendations(overview);
    
    return overview;
    
  } catch (e) {
    Logger.log('Error in analyzeOverview: ' + e);
    return overview;
  }
}

/**
 * CATEGORY 2: MARKET + CATEGORY INTELLIGENCE
 */
function analyzeMarketIntelligence(domain, url, options) {
  var intel = {
    categoryMapping: {
      mainCategory: '',
      subNiches: [],
      volumeTrends: 0,
      growthVelocity: 0, // % growth
      nicheCount: 0
    },
    marketShare: {
      trafficSharePercent: 0,
      brandMentions: 0,
      shareOfVoiceRank: 0
    },
    categoryNarrative: {
      coreStoryFraming: '',
      narrativeArchetype: '',
      messageDensity: 0 // mentions per 1000 pages
    },
    categoryGaps: {
      underservedSpaces: [],
      missingNarrativePercent: 0,
      gapIndex: 0 // 0-100
    },
    trendlineForecasting: {
      fundingRounds: [],
      techAdoption: '',
      partnerships: [],
      emergingTopicMomentum: 0,
      cagr: 0 // Compound Annual Growth Rate
    },
    macroMicroMomentum: {
      searchVolume: 0,
      aiMentions: 0,
      categoryEvolutionHeatmap: []
    }
  };
  
  try {
    // Fetch market data from Serper/DataForSEO
    var marketData = APIS_serperCall({
      action: 'market_analysis',
      domain: domain
    });
    
    // Analyze content for narrative patterns
    var narrativeData = analyzeNarrativePatterns(domain);
    if (narrativeData.ok) {
      intel.categoryNarrative = narrativeData.data;
    }
    
    // Identify gaps using competitor comparison
    var gapData = identifyMarketGaps(domain);
    if (gapData.ok) {
      intel.categoryGaps = gapData.data;
    }
    
    return intel;
    
  } catch (e) {
    Logger.log('Error in analyzeMarketIntelligence: ' + e);
    return intel;
  }
}

/**
 * CATEGORY 3: BRAND & STRATEGIC POSITIONING
 */
function analyzeBrandPositioning(domain, url, options) {
  var positioning = {
    brandArchetype: {
      type: '', // Hero, Sage, Explorer, etc.
      toneConsistency: 0, // 0-100
      alignmentScore: 0
    },
    valueProposition: {
      coreOffers: [],
      benefits: [],
      differentiation: [],
      uvpClarityScore: 0 // 0-100
    },
    uniqueMechanism: {
      proprietaryFrameworks: [],
      formulas: [],
      perceivedUniquenessIndex: 0 // 0-100
    },
    eeatSignals: {
      credentials: [],
      caseStudies: [],
      reviews: [],
      schema: [],
      eeatScore: 0 // 0-100
    },
    categoryOwnership: {
      conversationLeadership: 0,
      backlinks: 0,
      mentions: 0,
      ownershipPercent: 0
    },
    narrativeCohesion: {
      blogAlignment: 0,
      landingPageAlignment: 0,
      prAlignment: 0,
      cohesionScore: 0 // 0-100
    }
  };
  
  try {
    // Fetch homepage and key pages
    var homepageData = APIS_fetcherCall({
      action: 'fetch:snapshot',
      url: url
    });
    
    if (homepageData.ok) {
      // Extract brand voice and archetype
      positioning.brandArchetype = analyzeBrandVoice(homepageData.data);
      
      // Extract value proposition
      positioning.valueProposition = extractValueProposition(homepageData.data);
    }
    
    // Fetch backlinks for category ownership
    var backlinkData = APIS_openPageRankCall({ domain: domain });
    if (backlinkData.ok) {
      positioning.categoryOwnership.backlinks = backlinkData.data.page_rank_decimal || 0;
    }
    
    return positioning;
    
  } catch (e) {
    Logger.log('Error in analyzeBrandPositioning: ' + e);
    return positioning;
  }
}

/**
 * CATEGORY 4: TECHNICAL SEO & PERFORMANCE
 */
function analyzeTechnicalSEO(domain, url, options) {
  var technical = {
    siteHealth: {
      crawlEfficiency: 0,
      indexation: 0,
      coreWebVitals: {},
      healthScore: 0 // 0-100
    },
    architecture: {
      hierarchyClarity: 0,
      internalLinks: 0,
      depthRatio: 0, // avg clicks to reach pages (≤3 is good)
      avgClicksToContent: 0
    },
    schemaAudit: {
      types: [],
      errors: [],
      entityAlignment: 0,
      completenessPercent: 0
    },
    pageSpeed: {
      lcp: 0, // Largest Contentful Paint (s)
      cls: 0, // Cumulative Layout Shift
      inp: 0, // Interaction to Next Paint (ms)
      uxScore: 0 // 0-100
    },
    aiFootprint: {
      aiGeneratedPages: 0,
      contentVelocity: 0, // pages/month
      aiPatternPresencePercent: 0
    },
    rendering: {
      jsBlocking: false,
      hydrationIssues: false,
      renderDelay: 0 // ms
    }
  };
  
  try {
    // Fetch PageSpeed data
    var pagespeedData = APIS_pageSpeedCall({ url: url });
    if (pagespeedData.ok) {
      technical.pageSpeed = {
        lcp: pagespeedData.data.lcp || 0,
        cls: pagespeedData.data.cls || 0,
        inp: pagespeedData.data.inp || 0,
        uxScore: pagespeedData.data.score || 0
      };
    }
    
    // Fetch page for schema/structure analysis
    var pageData = APIS_fetcherCall({
      action: 'fetch:snapshot',
      url: url
    });
    
    if (pageData.ok) {
      technical.schemaAudit = {
        types: pageData.data.schema.types || [],
        errors: pageData.data.schema.errors || [],
        completenessPercent: calculateSchemaCompleteness(pageData.data.schema)
      };
      
      technical.architecture = analyzeArchitecture(pageData.data);
    }
    
    // Calculate health score
    technical.siteHealth.healthScore = calculateHealthScore(technical);
    
    return technical;
    
  } catch (e) {
    Logger.log('Error in analyzeTechnicalSEO: ' + e);
    return technical;
  }
}

/**
 * CATEGORY 5: ORGANIC TRAFFIC & CONTENT INTELLIGENCE
 */
function analyzeContentIntelligence(domain, url, options) {
  var content = {
    topicalAuthority: {
      topicClusters: [],
      semanticCoverage: 0,
      authorityScore: 0 // 0-100
    },
    trafficMix: {
      organic: 0, // %
      referral: 0,
      direct: 0,
      branded: 0
    },
    contentPerformance: {
      topUrls: [], // { url, traffic, backlinks, engagement }
      avgEngagementPerUrl: 0
    },
    velocityFreshness: {
      publishCadence: 0, // posts/month
      updateCycles: 0, // days between updates
      avgUpdateInterval: 0
    },
    serpFeatureOwnership: {
      snippets: 0,
      paa: 0, // People Also Ask
      video: 0,
      images: 0,
      featureSharePercent: 0
    },
    aiContentFingerprint: {
      tonePatterns: [],
      promptSignature: '',
      aiSimilarityIndex: 0 // 0-100
    }
  };
  
  try {
    // Fetch competitor's blog/content URLs
    var contentUrls = APIS_fetcherCall({
      action: 'fetch:multi',
      urls: [url, url + '/blog', url + '/resources']
    });
    
    if (contentUrls.ok) {
      // Analyze topic clusters
      content.topicalAuthority = analyzeTopicClusters(contentUrls.data);
      
      // Detect AI patterns
      content.aiContentFingerprint = detectAIPatterns(contentUrls.data);
    }
    
    return content;
    
  } catch (e) {
    Logger.log('Error in analyzeContentIntelligence: ' + e);
    return content;
  }
}

/**
 * CATEGORY 6: KEYWORD & ENTITY STRATEGY
 */
function analyzeKeywordStrategy(domain, url, options) {
  var keywords = {
    keywordGap: {
      unrankedHighValueTerms: [],
      potentialGain: 0 // estimated traffic
    },
    entityMapping: {
      namedEntities: [],
      relations: [],
      coverageScore: 0 // 0-100
    },
    semanticClusters: {
      highIntentLowComp: [],
      opportunityDifficulty: [] // { cluster, opportunity, difficulty }
    },
    intentLayering: {
      awareness: [],
      consideration: [],
      decision: [],
      retention: [],
      funnelCoveragePercent: 0
    },
    searchJourney: {
      informationalCommercialPath: [],
      journeyDepthScore: 0 // 0-100
    }
  };
  
  try {
    // Fetch keyword data from Serper/DataForSEO
    var keywordData = APIS_serperCall({
      action: 'keyword_analysis',
      domain: domain
    });
    
    if (keywordData.ok) {
      keywords.keywordGap = calculateKeywordGap(keywordData.data);
      keywords.semanticClusters = identifySemanticClusters(keywordData.data);
    }
    
    return keywords;
    
  } catch (e) {
    Logger.log('Error in analyzeKeywordStrategy: ' + e);
    return keywords;
  }
}

/**
 * CATEGORY 7: CONTENT SYSTEMS & OPERATIONS
 */
function analyzeContentSystems(domain, url, options) {
  var systems = {
    frameworkReverseEngineering: {
      briefToPublishPipeline: '',
      workflowMaturityScore: 0 // 0-100
    },
    aiWorkflowDetection: {
      templates: [],
      automationPatterns: [],
      automationRatioPercent: 0
    },
    promptEngineering: {
      recurringPromptStyles: [],
      promptPatternCount: 0
    },
    eeatIntegration: {
      bioSchemas: [],
      expertQuotes: [],
      integrationScore: 0 // 0-100
    },
    internalLinking: {
      tieredAuthorityDistribution: [],
      linkEquityFlowPercent: 0
    },
    editorialExpansion: {
      topicCoherence: 0,
      consistencyIndex: 0 // 0-100
    }
  };
  
  try {
    // Analyze content patterns
    var patternData = analyzeContentPatterns(domain);
    if (patternData.ok) {
      systems.aiWorkflowDetection = patternData.data.aiWorkflow;
      systems.promptEngineering = patternData.data.prompts;
    }
    
    return systems;
    
  } catch (e) {
    Logger.log('Error in analyzeContentSystems: ' + e);
    return systems;
  }
}

/**
 * CATEGORY 8: CONVERSION & MONETIZATION
 */
function analyzeConversion(domain, url, options) {
  var conversion = {
    funnelArchitecture: {
      ctas: [],
      tripwires: [],
      offers: [],
      conversionFlowScore: 0 // 0-100
    },
    landingHierarchy: {
      messaging: '',
      proof: [],
      objections: [],
      persuasionScore: 0 // 0-100
    },
    pricingPsychology: {
      anchoring: false,
      urgency: false,
      framing: '',
      psychologicalImpactPercent: 0
    },
    retentionSystems: {
      emailNurture: false,
      ads: false,
      community: false,
      retentionRatePercent: 0
    },
    revenueModel: {
      type: '', // SaaS, affiliate, hybrid
      details: []
    },
    frictionHeatmap: {
      obstacles: [],
      scrollDrops: [],
      frictionZonesCount: 0
    }
  };
  
  try {
    // Fetch landing pages
    var landingData = APIS_fetcherCall({
      action: 'fetch:snapshot',
      url: url
    });
    
    if (landingData.ok) {
      conversion.funnelArchitecture = analyzeFunnel(landingData.data);
      conversion.pricingPsychology = analyzePricingPage(landingData.data);
    }
    
    return conversion;
    
  } catch (e) {
    Logger.log('Error in analyzeConversion: ' + e);
    return conversion;
  }
}

/**
 * CATEGORY 9: DISTRIBUTION & VISIBILITY
 */
function analyzeDistribution(domain, url, options) {
  var distribution = {
    backlinkIntelligence: {
      sources: [],
      anchors: [],
      velocity: 0, // links/month
      domainAuthorityTrend: 0
    },
    socialFootprint: {
      platforms: [], // { platform, followers, engagement }
      engagementPerPost: 0
    },
    prThoughtLeadership: {
      mediaMentions: [],
      podcasts: [],
      prReachScore: 0 // 0-100
    },
    communityEcosystem: {
      forums: [],
      groups: [],
      linkedin: [],
      activityPercent: 0
    },
    influencerWeb: {
      partnerships: [],
      ambassadors: [],
      collaborationCount: 0
    },
    omnichannelIndex: {
      organic: 0,
      ai: 0,
      social: 0,
      visibilityScore: 0 // 0-100
    }
  };
  
  try {
    // Fetch backlink data
    var backlinkData = APIS_openPageRankCall({ domain: domain });
    if (backlinkData.ok) {
      distribution.backlinkIntelligence.velocity = backlinkData.data.velocity || 0;
    }
    
    return distribution;
    
  } catch (e) {
    Logger.log('Error in analyzeDistribution: ' + e);
    return distribution;
  }
}

/**
 * CATEGORY 10: AUDIENCE & PSYCHOLOGICAL INTELLIGENCE
 */
function analyzeAudienceIntelligence(domain, url, options) {
  var audience = {
    personaDeconstruction: {
      psychographics: [],
      goals: [],
      personaDepthScore: 0 // 0-100
    },
    jobsToBeDone: {
      coreTasks: [],
      jtbdMatchPercent: 0
    },
    emotionalTriggers: {
      rational: 0, // %
      aspirational: 0,
      emotionalResonanceIndex: 0
    },
    feedbackSignals: {
      reviews: [],
      testimonials: [],
      avgSentimentPercent: 0
    },
    communitySentiment: {
      brandVsCompetitors: '',
      sentimentDelta: 0
    },
    engagementResonance: {
      emotionInteractionVolume: 0,
      resonanceScore: 0 // 0-100
    }
  };
  
  try {
    // Analyze reviews/testimonials
    var reviewData = analyzeReviews(domain);
    if (reviewData.ok) {
      audience.feedbackSignals = reviewData.data;
    }
    
    return audience;
    
  } catch (e) {
    Logger.log('Error in analyzeAudienceIntelligence: ' + e);
    return audience;
  }
}

/**
 * CATEGORY 11: GEO + AEO INTELLIGENCE
 */
function analyzeGeoAeo(domain, url, options) {
  var geoAeo = {
    aiCitationDensity: {
      gemini: 0,
      perplexity: 0,
      chatGPT: 0,
      citationCount: 0
    },
    promptVisibility: {
      queriesTriggeringMention: [],
      promptTriggerPercent: 0
    },
    factualIntegrity: {
      accuracyScore: 0,
      trustSignals: [],
      factReliabilityPercent: 0
    },
    conversationalAnswers: {
      voiceAssistantInterpretation: [],
      answerAccuracyPercent: 0
    },
    zeroClickFootprint: {
      knowledgeGraphPresence: false,
      instantAnswers: [],
      zeroClickRatePercent: 0
    },
    llmAffinity: {
      vectorSimilarity: 0,
      embeddingScore: 0 // 0-100
    },
    answerAuthority: {
      aiSummariesSourced: 0,
      authorityPercent: 0
    }
  };
  
  try {
    // Fetch GEO data (would integrate with AI search APIs)
    var geoData = fetchGEOData(domain);
    if (geoData.ok) {
      geoAeo.aiCitationDensity = geoData.data.citations;
      geoAeo.promptVisibility = geoData.data.prompts;
    }
    
    return geoAeo;
    
  } catch (e) {
    Logger.log('Error in analyzeGeoAeo: ' + e);
    return geoAeo;
  }
}

/**
 * CATEGORY 12: AUTHORITY & INFLUENCE
 */
function analyzeAuthority(domain, url, options) {
  var authority = {
    linkVelocityRecency: {
      monthlyGrowth: 0,
      newLinksPerMonth: 0
    },
    topicalRelevance: {
      domainContextMatch: 0,
      relevanceScore: 0 // 0-100
    },
    influencerGraph: {
      thoughtLeaderConnections: [],
      nodeDegreeCount: 0
    },
    publisherNetwork: {
      tier1: 0, // % of links from tier 1 publishers
      tier2: 0,
      tier3: 0,
      authorityTierMix: ''
    },
    toxicityScore: {
      spamLinkRatio: 0,
      toxicPercent: 0
    },
    reputationDelta: {
      authorityChange: 0,
      deltaPostPR: 0
    }
  };
  
  try {
    // Fetch authority metrics
    var authorityData = APIS_openPageRankCall({ domain: domain });
    if (authorityData.ok) {
      authority.linkVelocityRecency.monthlyGrowth = authorityData.data.growth || 0;
    }
    
    return authority;
    
  } catch (e) {
    Logger.log('Error in analyzeAuthority: ' + e);
    return authority;
  }
}

/**
 * CATEGORY 13: PERFORMANCE & PREDICTIVE INTELLIGENCE
 */
function analyzePerformance(domain, url, options) {
  var performance = {
    trafficQuality: {
      conversionWeighted: 0,
      qualityScore: 0 // 0-100
    },
    engagementLoops: {
      sessionDepth: 0,
      retention: 0,
      avgPagesPerSession: 0
    },
    revenuePerVisibility: {
      roiPerSerpShift: 0,
      dollarPerPosition: 0
    },
    predictiveModeling: {
      trendlineForecast: [],
      predictedRankDelta: 0
    },
    algorithmicBiasRadar: {
      serpBiasDetection: [],
      biasEventsCount: 0
    }
  };
  
  try {
    // Would integrate with analytics APIs
    return performance;
    
  } catch (e) {
    Logger.log('Error in analyzePerformance: ' + e);
    return performance;
  }
}

/**
 * CATEGORY 14: STRATEGIC OPPORTUNITY MATRIX
 */
function analyzeOpportunityMatrix(domain, url, options) {
  var opportunities = {
    blueOcean: {
      untappedKeywords: [],
      untappedNarratives: [],
      opportunityScore: 0 // 0-100
    },
    weakSignalDetection: {
      emergingTopics: [],
      trendEmergenceIndex: 0
    },
    competitiveMoat: {
      barriers: [],
      vulnerabilities: [],
      moatStrengthPercent: 0
    },
    categoryEntryPoints: {
      funnelGaps: [],
      intentGaps: [],
      entryPointCount: 0
    },
    roadmap90Day: {
      prioritizedActions: [],
      priorityWeight: []
    },
    aiInsightLayer: {
      summaryPerSection: [],
      insightCount: 0
    }
  };
  
  try {
    // Identify opportunities using gap analysis
    var gapData = identifyOpportunityGaps(domain);
    if (gapData.ok) {
      opportunities.blueOcean = gapData.data.blueOcean;
      opportunities.weakSignalDetection = gapData.data.weakSignals;
    }
    
    return opportunities;
    
  } catch (e) {
    Logger.log('Error in analyzeOpportunityMatrix: ' + e);
    return opportunities;
  }
}

/**
 * CATEGORY 15: SCORING & VISUALIZATION ENGINE
 */
function calculateScoringEngine(domain, url, options) {
  var scores = {
    seoDepthIndex: 0, // 0-100
    geoPresenceScore: 0,
    aeoReadiness: 0,
    entityTrustScore: 0,
    strategyDepthIndex: 0,
    authorityMomentumGraph: []
  };
  
  try {
    // Calculate composite scores from all categories
    // This will be implemented after other categories are complete
    
    return scores;
    
  } catch (e) {
    Logger.log('Error in calculateScoringEngine: ' + e);
    return scores;
  }
}

// ============================================================================
// HELPER FUNCTIONS: Data Fetching
// ============================================================================

/**
 * Fetch AI visibility data (GEO metrics)
 */
function fetchAIVisibilityData(domain) {
  try {
    // Would call GEO-specific APIs (Perplexity, ChatGPT visibility, etc.)
    // For now, return mock structure
    return {
      ok: true,
      data: {
        score: 87,
        totalMentions: 19500,
        citedPages: 5700,
        byPlatform: {
          chatGPT: { mentions: 6400, pages: 3500, trend: 12 },
          aiOverview: { mentions: 9300, pages: 1900, trend: 8 },
          aiMode: { mentions: 3900, pages: 1100, trend: 5 },
          gemini: { mentions: 0, pages: 0, trend: 0, available: false }
        },
        readinessScore: 85
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch SEO metrics (Ahrefs-style data)
 */
function fetchSEOMetrics(domain) {
  try {
    // Call DataForSEO, Serper, or OpenPageRank APIs
    var seoData = APIS_serperCall({
      action: 'domain_overview',
      domain: domain
    });
    
    if (seoData && seoData.ok) {
      return {
        ok: true,
        data: {
          authorityScore: seoData.data.domainRank || 73,
          authorityLevel: getAuthorityLevel(seoData.data.domainRank),
          organicTraffic: seoData.data.organicTraffic || 3800000,
          organicTrafficTrend: seoData.data.organicTrend || -11,
          paidTraffic: seoData.data.paidTraffic || 3100,
          paidTrafficTrend: seoData.data.paidTrend || -19,
          referringDomains: seoData.data.refDomains || 117900,
          trafficShare: seoData.data.trafficShare || 27,
          organicKeywords: seoData.data.organicKeywords || 513500,
          organicKeywordsTrend: seoData.data.keywordTrend || -4.2,
          paidKeywords: seoData.data.paidKeywords || 348,
          paidKeywordsTrend: seoData.data.paidKeywordTrend || 12,
          backlinks: seoData.data.backlinks || 4300000
        }
      };
    }
    
    // Fallback to mock data
    return {
      ok: true,
      data: {
        authorityScore: 73,
        authorityLevel: 'Industry leader',
        organicTraffic: 3800000,
        organicTrafficTrend: -11,
        paidTraffic: 3100,
        paidTrafficTrend: -19,
        referringDomains: 117900,
        trafficShare: 27,
        organicKeywords: 513500,
        organicKeywordsTrend: -4.2,
        paidKeywords: 348,
        paidKeywordsTrend: 12,
        backlinks: 4300000
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch geographic distribution
 */
function fetchGeoDistribution(domain) {
  try {
    return {
      ok: true,
      data: {
        countries: [
          { country: 'Worldwide', visibility: 71, mentions: 29000 },
          { country: 'US', visibility: 87, mentions: 19500 },
          { country: 'UK', visibility: 80, mentions: 2600 },
          { country: 'IN', visibility: 72, mentions: 2200 }
        ]
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch top citation sources
 */
function fetchTopCitations(domain) {
  try {
    return {
      ok: true,
      data: [
        { domain: 'reddit.com', mentions: 7000 },
        { domain: 'youtube.com', mentions: 4200 },
        { domain: 'semrush.com', mentions: 3900 }
      ]
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch traffic trends (time series)
 */
function fetchTrafficTrends(domain) {
  try {
    // Would call analytics/SEO APIs for historical data
    return {
      ok: true,
      data: {
        organic: [], // Array of { date, value }
        paid: [],
        branded: []
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch keyword position distribution
 */
function fetchKeywordDistribution(domain) {
  try {
    return {
      ok: true,
      data: {
        positionDistribution: {
          top3: 45000,
          position4to10: 120000,
          position11to20: 85000,
          position21to50: 180000,
          position51to100: 83500,
          aiOverviews: 5000,
          otherFeatures: 24000
        },
        timeSeries: []
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch key topics
 */
function fetchKeyTopics(domain) {
  try {
    return {
      ok: true,
      data: [
        { topic: 'EU to UK shoe size', traffic: 200000 },
        { topic: 'Women\'s Dresses', traffic: 125000 },
        { topic: 'Women\'s Bottoms', traffic: 75000 }
      ]
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch competitor data
 */
function fetchCompetitorData(domain) {
  try {
    return {
      ok: true,
      data: {
        organic: [
          { domain: 'backlinko.com', commonLevel: 13217, commonKeywords: 13217, seKeywords: 117896 },
          { domain: 'seranking.com', commonLevel: 9773, commonKeywords: 9773, seKeywords: 61664 },
          { domain: 'semrush.com', commonLevel: 23438, commonKeywords: 23438, seKeywords: 397428 }
        ],
        paid: [
          { domain: 'moz.com', commonLevel: 15, commonKeywords: 15, paidKeywords: 133 },
          { domain: 'searchatlas.com', commonLevel: 17, commonKeywords: 17, paidKeywords: 237 }
        ],
        competitiveMap: {
          organic: [],
          paid: []
        }
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch paid research data
 */
function fetchPaidResearch(domain) {
  try {
    return {
      ok: true,
      data: {
        topPaidKeywords: [
          { keyword: 'copy ai', position: 2, volume: 12100, cpc: 3.91, trafficPercent: 7.33 },
          { keyword: 'semrush vs ahrefs', position: 1, volume: 2900, cpc: 8.50, trafficPercent: 6.35 }
        ],
        paidPositionDistribution: {
          position1: 45,
          position2to3: 35,
          other: 20
        }
      }
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fetch GEO-specific data
 */
function fetchGEOData(domain) {
  try {
    // Would integrate with AI search APIs
    return { ok: false, error: 'Not implemented' };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ============================================================================
// HELPER FUNCTIONS: Analysis
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    var domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return domain;
  } catch (e) {
    return url;
  }
}

/**
 * Get authority level from score
 */
function getAuthorityLevel(score) {
  if (score >= 70) return 'Industry leader';
  if (score >= 50) return 'Strong';
  if (score >= 30) return 'Moderate';
  return 'Weak';
}

/**
 * Calculate overall scores from all category data
 */
function calculateOverallScores(competitorData) {
  var scores = {
    overall: 0,
    ai: 0,
    seo: 0,
    content: 0,
    technical: 0,
    authority: 0
  };
  
  try {
    // Overview scores
    if (competitorData.overview) {
      scores.ai = competitorData.overview.aiVisibility.score || 0;
      scores.seo = competitorData.overview.seo.authorityScore || 0;
    }
    
    // Calculate weighted overall score
    scores.overall = Math.round(
      (scores.ai * 0.3) +
      (scores.seo * 0.4) +
      (scores.content * 0.15) +
      (scores.technical * 0.10) +
      (scores.authority * 0.05)
    );
    
    return scores;
  } catch (e) {
    Logger.log('Error calculating scores: ' + e);
    return scores;
  }
}

/**
 * Calculate aggregates across all competitors
 */
function calculateAggregates(competitors) {
  var aggregates = {
    avgAIVisibility: 0,
    avgAuthorityScore: 0,
    avgOrganicTraffic: 0,
    avgBacklinks: 0,
    totalCompetitors: competitors.length
  };
  
  try {
    var totalAI = 0, totalAuth = 0, totalTraffic = 0, totalBacklinks = 0;
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      if (comp.overview) {
        totalAI += comp.overview.aiVisibility.score || 0;
        totalAuth += comp.overview.seo.authorityScore || 0;
        totalTraffic += comp.overview.seo.organicTraffic || 0;
        totalBacklinks += comp.overview.seo.backlinks || 0;
      }
    }
    
    aggregates.avgAIVisibility = Math.round(totalAI / competitors.length);
    aggregates.avgAuthorityScore = Math.round(totalAuth / competitors.length);
    aggregates.avgOrganicTraffic = Math.round(totalTraffic / competitors.length);
    aggregates.avgBacklinks = Math.round(totalBacklinks / competitors.length);
    
    return aggregates;
  } catch (e) {
    Logger.log('Error calculating aggregates: ' + e);
    return aggregates;
  }
}

/**
 * Calculate benchmarks (targets = 120% of average)
 */
function calculateBenchmarks(competitors) {
  var aggregates = calculateAggregates(competitors);
  
  return {
    targetAIVisibility: Math.round(aggregates.avgAIVisibility * 1.2),
    targetAuthorityScore: Math.round(aggregates.avgAuthorityScore * 1.2),
    targetOrganicTraffic: Math.round(aggregates.avgOrganicTraffic * 1.2),
    targetBacklinks: Math.round(aggregates.avgBacklinks * 1.2)
  };
}

/**
 * Generate strategic recommendations
 */
function generateStrategicRecommendations(competitors, benchmarks) {
  var recommendations = [];
  
  try {
    // Analyze gaps and opportunities
    recommendations.push({
      priority: 'high',
      category: 'AI Visibility',
      recommendation: 'Focus on increasing AI visibility to reach benchmark of ' + benchmarks.targetAIVisibility,
      actions: [
        'Optimize content for AI search engines',
        'Increase brand mentions in AI-cited sources',
        'Build factual integrity and E-E-A-T signals'
      ]
    });
    
    recommendations.push({
      priority: 'high',
      category: 'SEO Authority',
      recommendation: 'Build authority to reach target score of ' + benchmarks.targetAuthorityScore,
      actions: [
        'Acquire high-quality backlinks from tier 1 publishers',
        'Increase content velocity and freshness',
        'Improve technical SEO health score'
      ]
    });
    
    return recommendations;
  } catch (e) {
    Logger.log('Error generating recommendations: ' + e);
    return recommendations;
  }
}

/**
 * Generate overview-specific recommendations
 */
function generateOverviewRecommendations(overview) {
  var recommendations = [];
  
  // AI Visibility recommendations
  if (overview.aiVisibility.score < 70) {
    recommendations.push({
      priority: 'high',
      issue: 'Low AI visibility score (' + overview.aiVisibility.score + '/100)',
      fix: 'Increase brand mentions in ChatGPT, AI Overviews, and other AI engines'
    });
  }
  
  // SEO Authority recommendations
  if (overview.seo.organicTrafficTrend < 0) {
    recommendations.push({
      priority: 'high',
      issue: 'Declining organic traffic (' + overview.seo.organicTrafficTrend + '%)',
      fix: 'Refresh underperforming content and target new keyword opportunities'
    });
  }
  
  return recommendations;
}

/**
 * Calculate schema completeness
 */
function calculateSchemaCompleteness(schema) {
  if (!schema || !schema.types) return 0;
  
  var requiredTypes = ['Organization', 'Article', 'FAQPage'];
  var presentTypes = schema.types.length;
  var maxScore = requiredTypes.length;
  
  return Math.round((presentTypes / maxScore) * 100);
}

/**
 * Calculate technical health score
 */
function calculateHealthScore(technical) {
  var score = 0;
  
  // PageSpeed
  if (technical.pageSpeed.lcp < 2.5) score += 25;
  else if (technical.pageSpeed.lcp < 4.0) score += 15;
  
  // Schema
  if (technical.schemaAudit.completenessPercent > 80) score += 25;
  else if (technical.schemaAudit.completenessPercent > 50) score += 15;
  
  // Architecture
  if (technical.architecture.depthRatio <= 3) score += 25;
  else if (technical.architecture.depthRatio <= 5) score += 15;
  
  // Rendering
  if (!technical.rendering.jsBlocking && technical.rendering.renderDelay < 500) score += 25;
  else if (technical.rendering.renderDelay < 1000) score += 15;
  
  return score;
}

// Placeholder analysis functions (to be implemented)
function analyzeNarrativePatterns(domain) { return { ok: false }; }
function identifyMarketGaps(domain) { return { ok: false }; }
function analyzeBrandVoice(data) { return { type: '', toneConsistency: 0, alignmentScore: 0 }; }
function extractValueProposition(data) { return { coreOffers: [], benefits: [], differentiation: [], uvpClarityScore: 0 }; }
function analyzeArchitecture(data) { return { hierarchyClarity: 0, internalLinks: 0, depthRatio: 0, avgClicksToContent: 0 }; }
function analyzeTopicClusters(data) { return { topicClusters: [], semanticCoverage: 0, authorityScore: 0 }; }
function detectAIPatterns(data) { return { tonePatterns: [], promptSignature: '', aiSimilarityIndex: 0 }; }
function calculateKeywordGap(data) { return { unrankedHighValueTerms: [], potentialGain: 0 }; }
function identifySemanticClusters(data) { return { highIntentLowComp: [], opportunityDifficulty: [] }; }
function analyzeContentPatterns(domain) { return { ok: false }; }
function analyzeFunnel(data) { return { ctas: [], tripwires: [], offers: [], conversionFlowScore: 0 }; }
function analyzePricingPage(data) { return { anchoring: false, urgency: false, framing: '', psychologicalImpactPercent: 0 }; }
function analyzeReviews(domain) { return { ok: false }; }
function identifyOpportunityGaps(domain) { return { ok: false }; }

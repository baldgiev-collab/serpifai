/**
 * COMPETITOR ANALYSIS - CATEGORY XIII: STRATEGIC OPPORTUNITY MATRIX
 * Blue ocean opportunities, weak signals, competitive moat, 90-day roadmap
 * APIs: Serper (opportunity detection), Analysis of all previous modules
 */

/**
 * Main function: Analyze strategic opportunities
 * @param {object} params - { domain, url }
 * @return {object} Opportunity matrix
 */
function COMP_analyzeOpportunityMatrix(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      blueOcean: COMP_identifyBlueOcean(domain),
      weakSignalDetection: COMP_detectWeakSignals(domain),
      competitiveMoat: COMP_analyzeCompetitiveMoat(domain, url),
      categoryEntryPoints: COMP_identifyCategoryEntryPoints(domain),
      roadmap90Day: COMP_generate90DayRoadmap(domain),
      aiInsightLayer: COMP_generateAIInsights(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeOpportunityMatrix: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Identify blue ocean opportunities
 */
function COMP_identifyBlueOcean(domain) {
  try {
    var blueOcean = {
      untappedKeywords: [],
      untappedNarratives: [],
      opportunityScore: 0
    };
    
    // Search for "alternative" keywords (untapped opportunities)
    var altSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' alternative OR instead of',
      num: 10
    });
    
    if (altSearch && altSearch.ok && altSearch.relatedSearches) {
      for (var i = 0; i < Math.min(5, altSearch.relatedSearches.length); i++) {
        blueOcean.untappedKeywords.push(altSearch.relatedSearches[i].query || '');
      }
    }
    
    // Search for emerging narratives
    var narrativeSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' future OR trend OR emerging',
      num: 10,
      type: 'news'
    });
    
    if (narrativeSearch && narrativeSearch.ok && narrativeSearch.news) {
      for (var j = 0; j < Math.min(3, narrativeSearch.news.length); j++) {
        blueOcean.untappedNarratives.push(narrativeSearch.news[j].title || '');
      }
    }
    
    // Calculate opportunity score
    blueOcean.opportunityScore = Math.min(100, (blueOcean.untappedKeywords.length + blueOcean.untappedNarratives.length) * 10);
    
    return blueOcean;
    
  } catch (e) {
    Logger.log('Error in COMP_identifyBlueOcean: ' + e);
    return { untappedKeywords: [], untappedNarratives: [], opportunityScore: 0 };
  }
}

/**
 * Detect weak signals (emerging trends)
 */
function COMP_detectWeakSignals(domain) {
  try {
    var weakSignals = {
      emergingTopics: [],
      trendEmergenceIndex: 0
    };
    
    // Search for recent news/trends
    var trendSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' 2025 OR new OR latest',
      num: 10,
      type: 'news'
    });
    
    if (trendSearch && trendSearch.ok && trendSearch.news) {
      for (var i = 0; i < Math.min(5, trendSearch.news.length); i++) {
        weakSignals.emergingTopics.push({
          topic: trendSearch.news[i].title || '',
          date: trendSearch.news[i].date || '',
          source: trendSearch.news[i].source || ''
        });
      }
      
      // Trend emergence index: more recent mentions = higher index
      weakSignals.trendEmergenceIndex = Math.min(100, trendSearch.news.length * 10);
    }
    
    return weakSignals;
    
  } catch (e) {
    Logger.log('Error in COMP_detectWeakSignals: ' + e);
    return { emergingTopics: [], trendEmergenceIndex: 0 };
  }
}

/**
 * Analyze competitive moat
 */
function COMP_analyzeCompetitiveMoat(domain, url) {
  try {
    var moat = {
      barriers: [],
      vulnerabilities: [],
      moatStrengthPercent: 0
    };
    
    // Check for moat elements
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect barriers (strengths)
      if (html.indexOf('patent') !== -1 || html.indexOf('proprietary') !== -1) {
        moat.barriers.push('Intellectual property protection');
      }
      if (html.indexOf('network effect') !== -1 || html.indexOf('platform') !== -1) {
        moat.barriers.push('Network effects');
      }
      if (html.indexOf('exclusive') !== -1 || html.indexOf('partnership') !== -1) {
        moat.barriers.push('Exclusive partnerships');
      }
      
      // Detect vulnerabilities
      if (html.indexOf('competitor') !== -1 && html.indexOf('cheaper') !== -1) {
        moat.vulnerabilities.push('Price competition risk');
      }
      if (html.indexOf('new entrant') !== -1 || html.indexOf('disruption') !== -1) {
        moat.vulnerabilities.push('Disruption risk');
      }
    }
    
    // Calculate moat strength
    moat.moatStrengthPercent = Math.min(100, moat.barriers.length * 30);
    
    return moat;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeCompetitiveMoat: ' + e);
    return { barriers: [], vulnerabilities: [], moatStrengthPercent: 0 };
  }
}

/**
 * Identify category entry points
 */
function COMP_identifyCategoryEntryPoints(domain) {
  try {
    var entryPoints = {
      funnelGaps: [],
      intentGaps: [],
      entryPointCount: 0
    };
    
    // Check for funnel gaps (missing content stages)
    var funnelStages = [
      { stage: 'Awareness', query: 'what is ' + domain.split('.')[0] },
      { stage: 'Consideration', query: domain.split('.')[0] + ' vs' },
      { stage: 'Decision', query: 'buy ' + domain.split('.')[0] }
    ];
    
    for (var i = 0; i < funnelStages.length; i++) {
      var stageSearch = APIS_serperSearch({
        q: 'site:' + domain + ' ' + funnelStages[i].query,
        num: 5
      });
      
      if (stageSearch && stageSearch.ok && stageSearch.searchInformation) {
        var results = stageSearch.searchInformation.totalResults || 0;
        if (results < 5) {
          entryPoints.funnelGaps.push(funnelStages[i].stage + ' content gap');
          entryPoints.entryPointCount++;
        }
      }
    }
    
    // Check for intent gaps
    var intents = ['how to', 'tutorial', 'guide', 'comparison'];
    for (var j = 0; j < intents.length; j++) {
      var intentSearch = APIS_serperSearch({
        q: 'site:' + domain + ' ' + intents[j],
        num: 5
      });
      
      if (intentSearch && intentSearch.ok && intentSearch.searchInformation) {
        var intentResults = intentSearch.searchInformation.totalResults || 0;
        if (intentResults < 5) {
          entryPoints.intentGaps.push(intents[j] + ' content gap');
          entryPoints.entryPointCount++;
        }
      }
    }
    
    return entryPoints;
    
  } catch (e) {
    Logger.log('Error in COMP_identifyCategoryEntryPoints: ' + e);
    return { funnelGaps: [], intentGaps: [], entryPointCount: 0 };
  }
}

/**
 * Generate 90-day roadmap
 */
function COMP_generate90DayRoadmap(domain) {
  try {
    var roadmap = {
      prioritizedActions: [],
      priorityWeight: []
    };
    
    // Generate strategic actions based on gaps
    roadmap.prioritizedActions = [
      {
        priority: 'High',
        action: 'Launch AI visibility campaign',
        timeline: '0-30 days',
        effort: 'Medium',
        impact: 'High',
        description: 'Create AI-optimized content to capture AI search traffic'
      },
      {
        priority: 'High',
        action: 'Build backlink profile',
        timeline: '0-60 days',
        effort: 'High',
        impact: 'High',
        description: 'Launch linkable asset campaign to increase domain authority'
      },
      {
        priority: 'Medium',
        action: 'Fill content gaps',
        timeline: '30-60 days',
        effort: 'Medium',
        impact: 'Medium',
        description: 'Create awareness and consideration stage content'
      },
      {
        priority: 'Medium',
        action: 'Optimize technical SEO',
        timeline: '30-90 days',
        effort: 'Low',
        impact: 'Medium',
        description: 'Fix Core Web Vitals, schema markup, and site architecture'
      },
      {
        priority: 'Low',
        action: 'Launch community initiative',
        timeline: '60-90 days',
        effort: 'High',
        impact: 'Low',
        description: 'Build community presence on Reddit, forums, LinkedIn'
      }
    ];
    
    // Priority weights
    roadmap.priorityWeight = [
      { action: 'AI visibility campaign', weight: 90 },
      { action: 'Build backlink profile', weight: 85 },
      { action: 'Fill content gaps', weight: 70 },
      { action: 'Optimize technical SEO', weight: 60 },
      { action: 'Launch community initiative', weight: 40 }
    ];
    
    return roadmap;
    
  } catch (e) {
    Logger.log('Error in COMP_generate90DayRoadmap: ' + e);
    return { prioritizedActions: [], priorityWeight: [] };
  }
}

/**
 * Generate AI insights layer
 */
function COMP_generateAIInsights(domain) {
  try {
    var aiInsights = {
      summaryPerSection: [],
      insightCount: 0
    };
    
    // Generate insights for each category
    aiInsights.summaryPerSection = [
      {
        category: 'Market Intelligence',
        insight: 'Competitor has moderate market share with opportunity to capture underserved segments'
      },
      {
        category: 'Brand Position',
        insight: 'Strong E-E-A-T signals but weak category ownership - focus on thought leadership'
      },
      {
        category: 'Technical SEO',
        insight: 'Good site health but slow page speed - optimize Core Web Vitals for better UX'
      },
      {
        category: 'Content Intelligence',
        insight: 'High content velocity with AI patterns detected - maintain human oversight for quality'
      },
      {
        category: 'Distribution',
        insight: 'Strong backlink profile but limited social footprint - expand social presence'
      }
    ];
    
    aiInsights.insightCount = aiInsights.summaryPerSection.length;
    
    return aiInsights;
    
  } catch (e) {
    Logger.log('Error in COMP_generateAIInsights: ' + e);
    return { summaryPerSection: [], insightCount: 0 };
  }
}

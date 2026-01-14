/**
 * COMPETITOR ANALYSIS HELPERS
 * UI-facing convenience functions and comparison tools
 */

/**
 * Get overview tab data for a single competitor
 * @param {object} params - { domain, includeAI, includeSEO }
 * @return {object} Overview data for UI visualization
 */
function COMP_getOverview(params) {
  var startTime = new Date().getTime();
  
  try {
    var domain = params.domain || params.url;
    if (!domain) {
      return { ok: false, error: 'Domain or URL required' };
    }
    
    var overview = analyzeOverview(extractDomain(domain), {
      includeAI: params.includeAI !== false,
      includeSEO: params.includeSEO !== false,
      includeContent: params.includeContent !== false
    });
    
    return {
      ok: true,
      domain: extractDomain(domain),
      data: overview,
      executionTime: new Date().getTime() - startTime
    };
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Compare multiple competitors side-by-side
 * @param {object} params - { competitors: [], metrics: [] }
 * @return {object} Comparison table and charts
 */
function COMP_compareCompetitors(params) {
  var startTime = new Date().getTime();
  
  try {
    var competitors = params.competitors || [];
    var metrics = params.metrics || ['aiVisibility', 'seo', 'traffic', 'keywords'];
    
    if (competitors.length < 2) {
      return { ok: false, error: 'At least 2 competitors required for comparison' };
    }
    
    var comparison = {
      ok: true,
      competitorCount: competitors.length,
      metrics: {},
      rankings: {},
      charts: {},
      recommendations: [],
      executionTime: 0
    };
    
    // Analyze each competitor
    var competitorData = [];
    for (var i = 0; i < competitors.length; i++) {
      var data = analyzeCompetitor(competitors[i], {
        includeAI: true,
        includeSEO: true,
        includeContent: true,
        categories: 'all'
      });
      
      if (data.ok) {
        competitorData.push(data);
      }
    }
    
    // Build comparison tables
    if (metrics.indexOf('aiVisibility') !== -1) {
      comparison.metrics.aiVisibility = compareAIVisibility(competitorData);
    }
    
    if (metrics.indexOf('seo') !== -1) {
      comparison.metrics.seo = compareSEOMetrics(competitorData);
    }
    
    if (metrics.indexOf('traffic') !== -1) {
      comparison.metrics.traffic = compareTraffic(competitorData);
    }
    
    if (metrics.indexOf('keywords') !== -1) {
      comparison.metrics.keywords = compareKeywords(competitorData);
    }
    
    if (metrics.indexOf('content') !== -1) {
      comparison.metrics.content = compareContent(competitorData);
    }
    
    if (metrics.indexOf('technical') !== -1) {
      comparison.metrics.technical = compareTechnical(competitorData);
    }
    
    // Calculate rankings
    comparison.rankings = calculateRankings(competitorData);
    
    // Generate chart data for UI
    comparison.charts = generateChartData(competitorData, metrics);
    
    // Generate comparative recommendations
    comparison.recommendations = generateComparativeRecommendations(competitorData, comparison.rankings);
    
    comparison.executionTime = new Date().getTime() - startTime;
    return comparison;
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Compare AI visibility across competitors
 */
function compareAIVisibility(competitors) {
  var comparison = {
    headers: ['Domain', 'AI Score', 'Total Mentions', 'Cited Pages', 'ChatGPT', 'AI Overview', 'AI Mode', 'Gemini'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.overview && comp.overview.aiVisibility) {
      var ai = comp.overview.aiVisibility;
      comparison.rows.push({
        domain: comp.domain,
        aiScore: ai.score,
        totalMentions: ai.totalMentions,
        citedPages: ai.citedPages,
        chatGPT: ai.byPlatform.chatGPT.mentions,
        aiOverview: ai.byPlatform.aiOverview.mentions,
        aiMode: ai.byPlatform.aiMode.mentions,
        gemini: ai.byPlatform.gemini.mentions
      });
    }
  }
  
  return comparison;
}

/**
 * Compare SEO metrics
 */
function compareSEOMetrics(competitors) {
  var comparison = {
    headers: ['Domain', 'Authority Score', 'Level', 'Organic Traffic', 'Ref Domains', 'Backlinks', 'Traffic Share %'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.overview && comp.overview.seo) {
      var seo = comp.overview.seo;
      comparison.rows.push({
        domain: comp.domain,
        authorityScore: seo.authorityScore,
        authorityLevel: seo.authorityLevel,
        organicTraffic: seo.organicTraffic,
        referringDomains: seo.referringDomains,
        backlinks: seo.backlinks,
        trafficShare: seo.trafficShare
      });
    }
  }
  
  return comparison;
}

/**
 * Compare traffic metrics
 */
function compareTraffic(competitors) {
  var comparison = {
    headers: ['Domain', 'Organic Traffic', 'Trend %', 'Paid Traffic', 'Trend %', 'Traffic Quality'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.overview && comp.overview.seo) {
      var seo = comp.overview.seo;
      comparison.rows.push({
        domain: comp.domain,
        organicTraffic: seo.organicTraffic,
        organicTrend: seo.organicTrafficTrend,
        paidTraffic: seo.paidTraffic,
        paidTrend: seo.paidTrafficTrend,
        trafficQuality: comp.categories.performance ? comp.categories.performance.trafficQuality.qualityScore : 0
      });
    }
  }
  
  return comparison;
}

/**
 * Compare keyword metrics
 */
function compareKeywords(competitors) {
  var comparison = {
    headers: ['Domain', 'Organic Keywords', 'Trend %', 'Paid Keywords', 'Top 3', '4-10', '11-20', 'AI Overviews'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.overview) {
      var seo = comp.overview.seo;
      var kw = comp.overview.keywords;
      comparison.rows.push({
        domain: comp.domain,
        organicKeywords: seo.organicKeywords,
        organicTrend: seo.organicKeywordsTrend,
        paidKeywords: seo.paidKeywords,
        top3: kw.positionDistribution.top3,
        position4to10: kw.positionDistribution.position4to10,
        position11to20: kw.positionDistribution.position11to20,
        aiOverviews: kw.positionDistribution.aiOverviews
      });
    }
  }
  
  return comparison;
}

/**
 * Compare content metrics
 */
function compareContent(competitors) {
  var comparison = {
    headers: ['Domain', 'Topic Authority', 'Publish Cadence', 'Update Interval', 'SERP Features %', 'AI Similarity'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.categories && comp.categories.contentIntelligence) {
      var content = comp.categories.contentIntelligence;
      comparison.rows.push({
        domain: comp.domain,
        topicAuthority: content.topicalAuthority.authorityScore,
        publishCadence: content.velocityFreshness.publishCadence,
        updateInterval: content.velocityFreshness.avgUpdateInterval,
        serpFeatures: content.serpFeatureOwnership.featureSharePercent,
        aiSimilarity: content.aiContentFingerprint.aiSimilarityIndex
      });
    }
  }
  
  return comparison;
}

/**
 * Compare technical SEO
 */
function compareTechnical(competitors) {
  var comparison = {
    headers: ['Domain', 'Health Score', 'LCP (s)', 'CLS', 'Schema %', 'Depth Ratio', 'AI Pattern %'],
    rows: []
  };
  
  for (var i = 0; i < competitors.length; i++) {
    var comp = competitors[i];
    if (comp.categories && comp.categories.technicalSEO) {
      var tech = comp.categories.technicalSEO;
      comparison.rows.push({
        domain: comp.domain,
        healthScore: tech.siteHealth.healthScore,
        lcp: tech.pageSpeed.lcp,
        cls: tech.pageSpeed.cls,
        schemaCompleteness: tech.schemaAudit.completenessPercent,
        depthRatio: tech.architecture.depthRatio,
        aiPattern: tech.aiFootprint.aiPatternPresencePercent
      });
    }
  }
  
  return comparison;
}

/**
 * Calculate rankings across all metrics
 */
function calculateRankings(competitors) {
  var rankings = {
    overall: [],
    aiVisibility: [],
    seoAuthority: [],
    organicTraffic: [],
    backlinks: [],
    keywords: []
  };
  
  try {
    // Sort by AI visibility
    var aiSorted = competitors.slice().sort(function(a, b) {
      var aScore = a.overview && a.overview.aiVisibility ? a.overview.aiVisibility.score : 0;
      var bScore = b.overview && b.overview.aiVisibility ? b.overview.aiVisibility.score : 0;
      return bScore - aScore;
    });
    
    for (var i = 0; i < aiSorted.length; i++) {
      rankings.aiVisibility.push({
        rank: i + 1,
        domain: aiSorted[i].domain,
        score: aiSorted[i].overview.aiVisibility.score
      });
    }
    
    // Sort by SEO authority
    var seoSorted = competitors.slice().sort(function(a, b) {
      var aScore = a.overview && a.overview.seo ? a.overview.seo.authorityScore : 0;
      var bScore = b.overview && b.overview.seo ? b.overview.seo.authorityScore : 0;
      return bScore - aScore;
    });
    
    for (var i = 0; i < seoSorted.length; i++) {
      rankings.seoAuthority.push({
        rank: i + 1,
        domain: seoSorted[i].domain,
        score: seoSorted[i].overview.seo.authorityScore
      });
    }
    
    // Sort by organic traffic
    var trafficSorted = competitors.slice().sort(function(a, b) {
      var aTraffic = a.overview && a.overview.seo ? a.overview.seo.organicTraffic : 0;
      var bTraffic = b.overview && b.overview.seo ? b.overview.seo.organicTraffic : 0;
      return bTraffic - aTraffic;
    });
    
    for (var i = 0; i < trafficSorted.length; i++) {
      rankings.organicTraffic.push({
        rank: i + 1,
        domain: trafficSorted[i].domain,
        traffic: trafficSorted[i].overview.seo.organicTraffic
      });
    }
    
    // Calculate overall ranking (weighted average)
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      var aiRank = getRankPosition(rankings.aiVisibility, comp.domain);
      var seoRank = getRankPosition(rankings.seoAuthority, comp.domain);
      var trafficRank = getRankPosition(rankings.organicTraffic, comp.domain);
      
      var overallScore = (aiRank * 0.3) + (seoRank * 0.4) + (trafficRank * 0.3);
      
      rankings.overall.push({
        domain: comp.domain,
        score: overallScore
      });
    }
    
    // Sort overall
    rankings.overall.sort(function(a, b) {
      return a.score - b.score;
    });
    
    // Assign ranks
    for (var i = 0; i < rankings.overall.length; i++) {
      rankings.overall[i].rank = i + 1;
    }
    
    return rankings;
    
  } catch (e) {
    Logger.log('Error calculating rankings: ' + e);
    return rankings;
  }
}

/**
 * Get rank position for a domain in a ranking array
 */
function getRankPosition(ranking, domain) {
  for (var i = 0; i < ranking.length; i++) {
    if (ranking[i].domain === domain) {
      return ranking[i].rank;
    }
  }
  return 999; // Not found
}

/**
 * Generate chart data for UI visualization
 */
function generateChartData(competitors, metrics) {
  var charts = {
    radarChart: null,
    barChart: null,
    lineChart: null,
    competitiveMap: null
  };
  
  try {
    // Radar Chart: Multi-metric comparison
    charts.radarChart = {
      type: 'radar',
      labels: ['AI Visibility', 'SEO Authority', 'Organic Traffic', 'Backlinks', 'Content Quality', 'Technical SEO'],
      datasets: []
    };
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      charts.radarChart.datasets.push({
        label: comp.domain,
        data: [
          comp.overview.aiVisibility.score || 0,
          comp.overview.seo.authorityScore || 0,
          normalizeTraffic(comp.overview.seo.organicTraffic),
          normalizeBacklinks(comp.overview.seo.backlinks),
          comp.categories.contentIntelligence ? comp.categories.contentIntelligence.topicalAuthority.authorityScore : 0,
          comp.categories.technicalSEO ? comp.categories.technicalSEO.siteHealth.healthScore : 0
        ]
      });
    }
    
    // Bar Chart: Keyword position distribution
    charts.barChart = {
      type: 'bar',
      labels: competitors.map(function(c) { return c.domain; }),
      datasets: [
        {
          label: 'Top 3',
          data: competitors.map(function(c) { return c.overview.keywords.positionDistribution.top3; })
        },
        {
          label: '4-10',
          data: competitors.map(function(c) { return c.overview.keywords.positionDistribution.position4to10; })
        },
        {
          label: '11-20',
          data: competitors.map(function(c) { return c.overview.keywords.positionDistribution.position11to20; })
        }
      ]
    };
    
    // Competitive Map: Traffic vs Keywords
    charts.competitiveMap = {
      type: 'scatter',
      datasets: competitors.map(function(comp) {
        return {
          label: comp.domain,
          data: [{
            x: comp.overview.seo.organicKeywords,
            y: comp.overview.seo.organicTraffic
          }]
        };
      })
    };
    
    return charts;
    
  } catch (e) {
    Logger.log('Error generating chart data: ' + e);
    return charts;
  }
}

/**
 * Normalize traffic to 0-100 scale for radar chart
 */
function normalizeTraffic(traffic) {
  if (!traffic) return 0;
  // Assuming 10M is max scale
  return Math.min(100, (traffic / 10000000) * 100);
}

/**
 * Normalize backlinks to 0-100 scale
 */
function normalizeBacklinks(backlinks) {
  if (!backlinks) return 0;
  // Assuming 5M is max scale
  return Math.min(100, (backlinks / 5000000) * 100);
}

/**
 * Generate comparative recommendations
 */
function generateComparativeRecommendations(competitors, rankings) {
  var recommendations = [];
  
  try {
    // Find weakest areas
    var yourRank = rankings.overall[0]; // Assuming first is yours
    
    if (yourRank.rank > 1) {
      recommendations.push({
        priority: 'high',
        category: 'Overall Position',
        recommendation: 'You rank #' + yourRank.rank + ' overall. Focus on closing gaps in top-performing metrics.',
        actions: [
          'Analyze top competitor strategies',
          'Prioritize high-impact improvements',
          'Set quarterly goals to improve rankings'
        ]
      });
    }
    
    // AI Visibility gaps
    var aiLeader = rankings.aiVisibility[0];
    var yourAIRank = getRankPosition(rankings.aiVisibility, yourRank.domain);
    
    if (yourAIRank > 1) {
      recommendations.push({
        priority: 'high',
        category: 'AI Visibility',
        recommendation: aiLeader.domain + ' leads AI visibility with score ' + aiLeader.score + '. You need to increase AI mentions.',
        actions: [
          'Optimize content for AI search engines',
          'Build E-E-A-T signals',
          'Increase brand mentions in AI-cited sources'
        ]
      });
    }
    
    return recommendations;
    
  } catch (e) {
    Logger.log('Error generating comparative recommendations: ' + e);
    return recommendations;
  }
}

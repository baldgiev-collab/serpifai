/**
 * COMPETITOR ANALYSIS - OVERVIEW MODULE
 * AI Visibility + SEO Metrics Dashboard
 * Uses: Serper, DataForSEO, OpenPageRank, Fetcher
 */

/**
 * Get comprehensive overview for a competitor
 * @param {object} params - { domain, url, includeAI, includeSEO }
 * @return {object} Overview data
 */
function COMP_getOverview(params) {
  var startTime = new Date().getTime();
  
  try {
    var domain = params.domain || extractDomain(params.url || '');
    var url = params.url || ('https://' + domain);
    
    if (!domain) {
      return { ok: false, error: 'Domain or URL required' };
    }
    
    var overview = {
      ok: true,
      domain: domain,
      url: url,
      aiVisibility: {},
      seo: {},
      traffic: {},
      keywords: {},
      competitors: [],
      recommendations: [],
      executionTime: 0
    };
    
    // Fetch AI Visibility metrics
    if (params.includeAI !== false) {
      overview.aiVisibility = COMP_fetchAIVisibility(domain);
    }
    
    // Fetch SEO Authority metrics
    if (params.includeSEO !== false) {
      overview.seo = COMP_fetchSEOMetrics(domain);
    }
    
    // Fetch traffic data
    overview.traffic = COMP_fetchTrafficData(domain);
    
    // Fetch keyword distribution
    overview.keywords = COMP_fetchKeywordData(domain);
    
    // Fetch top competitors
    overview.competitors = COMP_fetchCompetitors(domain);
    
    // Generate recommendations
    overview.recommendations = COMP_generateOverviewRecommendations(overview);
    
    overview.executionTime = new Date().getTime() - startTime;
    return overview;
    
  } catch (e) {
    Logger.log('Error in COMP_getOverview: ' + e);
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Fetch AI Visibility metrics
 * @param {string} domain - Domain to analyze
 * @return {object} AI visibility data
 */
function COMP_fetchAIVisibility(domain) {
  var visibility = {
    score: 0,
    totalMentions: 0,
    citedPages: 0,
    byPlatform: {
      chatGPT: { mentions: 0, pages: 0, trend: 0 },
      aiOverview: { mentions: 0, pages: 0, trend: 0 },
      aiMode: { mentions: 0, pages: 0, trend: 0 },
      gemini: { mentions: 0, pages: 0, trend: 0 }
    },
    readinessScore: 0,
    distribution: [] // { country, visibility, mentions }
  };
  
  try {
    // Use Serper to check AI visibility
    var serperResult = APIS_serperSearch(domain + ' AI mentions');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      // Extract AI-related metrics
      if (data.organic) {
        visibility.citedPages = data.organic.length || 0;
        visibility.totalMentions = data.searchInformation ? data.searchInformation.totalResults || 0 : 0;
      }
      
      // Calculate readiness score based on EEAT signals
      visibility.readinessScore = calculateAIReadinessScore(data);
    }
    
    // Estimate score based on mentions and citations
    if (visibility.totalMentions > 10000) visibility.score += 30;
    else if (visibility.totalMentions > 1000) visibility.score += 20;
    else if (visibility.totalMentions > 100) visibility.score += 10;
    
    if (visibility.citedPages > 100) visibility.score += 30;
    else if (visibility.citedPages > 50) visibility.score += 20;
    else if (visibility.citedPages > 10) visibility.score += 10;
    
    visibility.score += visibility.readinessScore * 0.4;
    visibility.score = Math.min(100, Math.round(visibility.score));
    
    return visibility;
    
  } catch (e) {
    Logger.log('Error fetching AI visibility: ' + e);
    return visibility;
  }
}

/**
 * Fetch SEO Authority metrics
 * @param {string} domain - Domain to analyze
 * @return {object} SEO metrics
 */
function COMP_fetchSEOMetrics(domain) {
  var seo = {
    authorityScore: 0,
    authorityLevel: '',
    organicTraffic: 0,
    organicTrafficTrend: 0,
    paidTraffic: 0,
    paidTrafficTrend: 0,
    referringDomains: 0,
    backlinks: 0,
    organicKeywords: 0,
    paidKeywords: 0,
    domainRating: 0
  };
  
  try {
    // Use OpenPageRank for authority
    var oprResult = APIS_openPageRankFetch(domain);
    if (oprResult.ok) {
      var oprData = JSONX.parse(oprResult.body, {});
      if (oprData.response && oprData.response[0]) {
        var pageRank = oprData.response[0].page_rank_decimal || 0;
        seo.authorityScore = Math.round(pageRank * 10); // Convert 0-10 to 0-100
        seo.domainRating = seo.authorityScore;
        seo.authorityLevel = getAuthorityLevel(seo.authorityScore);
      }
    }
    
    // Use Serper for traffic and keyword estimates
    var serperResult = APIS_serperSearch('site:' + domain);
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.searchInformation) {
        // Estimate organic keywords from indexed pages
        var indexedPages = data.searchInformation.totalResults || 0;
        seo.organicKeywords = Math.round(indexedPages * 0.5); // Rough estimate
        
        // Estimate traffic (very rough approximation)
        seo.organicTraffic = Math.round(seo.organicKeywords * 2);
      }
      
      // Count backlinks from search results
      if (data.organic) {
        seo.referringDomains = data.organic.length;
      }
    }
    
    return seo;
    
  } catch (e) {
    Logger.log('Error fetching SEO metrics: ' + e);
    return seo;
  }
}

/**
 * Fetch traffic data
 * @param {string} domain - Domain to analyze
 * @return {object} Traffic metrics
 */
function COMP_fetchTrafficData(domain) {
  var traffic = {
    total: 0,
    organic: 0,
    paid: 0,
    referral: 0,
    direct: 0,
    social: 0,
    trends: [] // { month, organic, paid }
  };
  
  try {
    // Use Serper to estimate traffic patterns
    var serperResult = APIS_serperSearch(domain + ' traffic');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      // Extract traffic estimates from knowledge graph or featured snippets
      if (data.knowledgeGraph && data.knowledgeGraph.description) {
        // Parse traffic mentions from description
        var desc = data.knowledgeGraph.description.toLowerCase();
        var trafficMatch = desc.match(/(\d+(?:,\d+)*)\s*(?:million|m|k|thousand)?\s*(?:visits|visitors|users)/i);
        if (trafficMatch) {
          traffic.total = parseTrafficValue(trafficMatch[1]);
          traffic.organic = Math.round(traffic.total * 0.7); // Estimate 70% organic
          traffic.paid = Math.round(traffic.total * 0.1);
          traffic.referral = Math.round(traffic.total * 0.1);
          traffic.direct = Math.round(traffic.total * 0.1);
        }
      }
    }
    
    return traffic;
    
  } catch (e) {
    Logger.log('Error fetching traffic data: ' + e);
    return traffic;
  }
}

/**
 * Fetch keyword distribution
 * @param {string} domain - Domain to analyze
 * @return {object} Keyword metrics
 */
function COMP_fetchKeywordData(domain) {
  var keywords = {
    total: 0,
    positionDistribution: {
      top3: 0,
      position4to10: 0,
      position11to20: 0,
      position21to50: 0,
      position51to100: 0
    },
    topKeywords: [] // { keyword, position, volume }
  };
  
  try {
    // Use Serper to find top-ranking keywords
    var serperResult = APIS_serperSearch('site:' + domain);
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.organic) {
        keywords.total = data.searchInformation ? data.searchInformation.totalResults || 0 : 0;
        
        // Analyze positions (position 1-3 are top results)
        for (var i = 0; i < Math.min(data.organic.length, 10); i++) {
          var result = data.organic[i];
          var position = result.position || (i + 1);
          
          if (position <= 3) keywords.positionDistribution.top3++;
          else if (position <= 10) keywords.positionDistribution.position4to10++;
          
          keywords.topKeywords.push({
            keyword: result.title || '',
            url: result.link || '',
            position: position,
            snippet: result.snippet || ''
          });
        }
      }
    }
    
    return keywords;
    
  } catch (e) {
    Logger.log('Error fetching keyword data: ' + e);
    return keywords;
  }
}

/**
 * Fetch top competitors
 * @param {string} domain - Domain to analyze
 * @return {array} Competitor list
 */
function COMP_fetchCompetitors(domain) {
  var competitors = [];
  
  try {
    // Search for competitors in same niche
    var serperResult = APIS_serperSearch(domain + ' alternatives competitors');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.organic) {
        for (var i = 0; i < Math.min(data.organic.length, 5); i++) {
          var result = data.organic[i];
          var compDomain = extractDomain(result.link || '');
          
          if (compDomain && compDomain !== domain) {
            competitors.push({
              domain: compDomain,
              title: result.title || '',
              snippet: result.snippet || ''
            });
          }
        }
      }
    }
    
    return competitors;
    
  } catch (e) {
    Logger.log('Error fetching competitors: ' + e);
    return competitors;
  }
}

/**
 * Generate recommendations based on overview data
 * @param {object} overview - Overview data
 * @return {array} Recommendations
 */
function COMP_generateOverviewRecommendations(overview) {
  var recs = [];
  
  try {
    // AI Visibility recommendations
    if (overview.aiVisibility.score < 50) {
      recs.push({
        priority: 'high',
        category: 'AI Visibility',
        issue: 'Low AI visibility score (' + overview.aiVisibility.score + '/100)',
        recommendation: 'Increase brand mentions in AI-cited sources',
        actions: [
          'Create high-quality, factual content',
          'Build E-E-A-T signals (expertise, authoritativeness, trustworthiness)',
          'Get featured in authoritative publications'
        ]
      });
    }
    
    // SEO Authority recommendations
    if (overview.seo.authorityScore < 40) {
      recs.push({
        priority: 'high',
        category: 'SEO Authority',
        issue: 'Low domain authority (' + overview.seo.authorityScore + '/100)',
        recommendation: 'Build high-quality backlinks',
        actions: [
          'Guest post on authoritative sites',
          'Create linkable assets (research, tools, guides)',
          'Fix technical SEO issues'
        ]
      });
    }
    
    // Traffic recommendations
    if (overview.traffic.organic < 10000) {
      recs.push({
        priority: 'medium',
        category: 'Traffic',
        issue: 'Low organic traffic',
        recommendation: 'Expand keyword coverage and content',
        actions: [
          'Identify keyword gaps',
          'Create comprehensive topic clusters',
          'Improve existing content performance'
        ]
      });
    }
    
    // Keyword recommendations
    if (overview.keywords.positionDistribution.top3 < 10) {
      recs.push({
        priority: 'medium',
        category: 'Rankings',
        issue: 'Few top 3 rankings',
        recommendation: 'Optimize for featured snippets and top positions',
        actions: [
          'Target question-based keywords',
          'Improve content quality and depth',
          'Optimize page experience signals'
        ]
      });
    }
    
    return recs;
    
  } catch (e) {
    Logger.log('Error generating recommendations: ' + e);
    return recs;
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
 * Get authority level from score
 */
function getAuthorityLevel(score) {
  if (score >= 70) return 'Industry Leader';
  if (score >= 50) return 'Strong Authority';
  if (score >= 30) return 'Moderate Authority';
  if (score >= 10) return 'Weak Authority';
  return 'No Authority';
}

/**
 * Calculate AI readiness score
 */
function calculateAIReadinessScore(data) {
  var score = 0;
  
  try {
    // Check for E-E-A-T signals in search results
    if (data.organic) {
      for (var i = 0; i < data.organic.length; i++) {
        var result = data.organic[i];
        var snippet = (result.snippet || '').toLowerCase();
        
        // Look for authority signals
        if (snippet.indexOf('expert') !== -1) score += 2;
        if (snippet.indexOf('verified') !== -1) score += 2;
        if (snippet.indexOf('certified') !== -1) score += 2;
        if (snippet.indexOf('official') !== -1) score += 2;
        if (snippet.indexOf('trusted') !== -1) score += 2;
      }
    }
    
    // Check for knowledge graph (high trust signal)
    if (data.knowledgeGraph) {
      score += 20;
    }
    
    return Math.min(100, score);
    
  } catch (e) {
    Logger.log('Error calculating AI readiness: ' + e);
    return 0;
  }
}

/**
 * Parse traffic value from text
 */
function parseTrafficValue(text) {
  try {
    var num = parseFloat(text.replace(/,/g, ''));
    
    // No multiplier found, return as-is
    return num || 0;
    
  } catch (e) {
    return 0;
  }
}

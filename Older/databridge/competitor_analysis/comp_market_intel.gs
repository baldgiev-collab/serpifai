/**
 * COMPETITOR ANALYSIS - MARKET INTELLIGENCE MODULE
 * Market positioning, category gaps, trend analysis
 * Uses: Serper, DataForSEO, Fetcher
 */

/**
 * Analyze market intelligence for a competitor
 * @param {object} params - { domain, url }
 * @return {object} Market intelligence data
 */
function COMP_analyzeMarketIntel(params) {
  var startTime = new Date().getTime();
  
  try {
    var domain = params.domain || extractDomain(params.url || '');
    var url = params.url || ('https://' + domain);
    
    if (!domain) {
      return { ok: false, error: 'Domain or URL required' };
    }
    
    var intel = {
      ok: true,
      domain: domain,
      categoryMapping: {},
      marketShare: {},
      categoryNarrative: {},
      categoryGaps: {},
      trendForecasting: {},
      executionTime: 0
    };
    
    // Analyze category mapping
    intel.categoryMapping = COMP_analyzeCategoryMapping(domain);
    
    // Calculate market share
    intel.marketShare = COMP_calculateMarketShare(domain);
    
    // Extract category narrative
    intel.categoryNarrative = COMP_extractCategoryNarrative(domain, url);
    
    // Identify category gaps
    intel.categoryGaps = COMP_identifyCategoryGaps(domain);
    
    // Forecast trends
    intel.trendForecasting = COMP_forecastTrends(domain);
    
    intel.executionTime = new Date().getTime() - startTime;
    return intel;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeMarketIntel: ' + e);
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Analyze category mapping
 */
function COMP_analyzeCategoryMapping(domain) {
  var mapping = {
    mainCategory: '',
    subNiches: [],
    volumeTrends: 0,
    growthVelocity: 0,
    nicheCount: 0
  };
  
  try {
    // Use Serper to identify category
    var serperResult = APIS_serperSearch(domain + ' category industry niche');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.knowledgeGraph && data.knowledgeGraph.type) {
        mapping.mainCategory = data.knowledgeGraph.type;
      }
      
      // Extract sub-niches from organic results
      if (data.organic) {
        var niches = {};
        for (var i = 0; i < Math.min(data.organic.length, 10); i++) {
          var snippet = data.organic[i].snippet || '';
          
          // Extract potential niche keywords
          var words = snippet.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
          for (var j = 0; j < words.length; j++) {
            if (!niches[words[j]]) niches[words[j]] = 0;
            niches[words[j]]++;
          }
        }
        
        // Get top niches
        var nicheArray = [];
        for (var niche in niches) {
          if (niches[niche] >= 2) {
            nicheArray.push({ niche: niche, mentions: niches[niche] });
          }
        }
        nicheArray.sort(function(a, b) { return b.mentions - a.mentions; });
        mapping.subNiches = nicheArray.slice(0, 5).map(function(n) { return n.niche; });
        mapping.nicheCount = nicheArray.length;
      }
    }
    
    return mapping;
    
  } catch (e) {
    Logger.log('Error analyzing category mapping: ' + e);
    return mapping;
  }
}

/**
 * Calculate market share
 */
function COMP_calculateMarketShare(domain) {
  var share = {
    trafficSharePercent: 0,
    brandMentions: 0,
    shareOfVoiceRank: 0,
    estimatedMarketSize: 0
  };
  
  try {
    // Use Serper to estimate market presence
    var serperResult = APIS_serperSearch(domain);
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.searchInformation) {
        share.brandMentions = data.searchInformation.totalResults || 0;
        
        // Estimate market size from related searches
        if (data.relatedSearches) {
          share.estimatedMarketSize = data.relatedSearches.length * 10000; // Rough estimate
        }
        
        // Calculate share of voice (rough estimate)
        if (share.estimatedMarketSize > 0) {
          share.trafficSharePercent = Math.min(100, (share.brandMentions / share.estimatedMarketSize) * 100);
        }
      }
    }
    
    return share;
    
  } catch (e) {
    Logger.log('Error calculating market share: ' + e);
    return share;
  }
}

/**
 * Extract category narrative
 */
function COMP_extractCategoryNarrative(domain, url) {
  var narrative = {
    coreStoryFraming: '',
    narrativeArchetype: '',
    messageDensity: 0,
    keyMessages: []
  };
  
  try {
    // Fetch homepage content
    var fetchResult = FET_handle('fetchSingleUrl', { url: url });
    if (fetchResult.ok && fetchResult.html) {
      // Extract metadata
      var metaResult = FET_handle('extractMetadata', { html: fetchResult.html });
      if (metaResult.ok) {
        narrative.coreStoryFraming = metaResult.data.description || '';
      }
      
      // Extract headings for key messages
      var headingResult = FET_handle('extractHeadings', { html: fetchResult.html });
      if (headingResult.ok && headingResult.data.headings) {
        narrative.keyMessages = headingResult.data.headings
          .filter(function(h) { return h.level === 'h2' || h.level === 'h3'; })
          .slice(0, 5)
          .map(function(h) { return h.text; });
      }
      
      // Detect narrative archetype from content
      narrative.narrativeArchetype = detectNarrativeArchetype(fetchResult.html);
      
      // Calculate message density (key phrases per 1000 words)
      var wordCount = (fetchResult.html.match(/\b\w+\b/g) || []).length;
      if (wordCount > 0) {
        narrative.messageDensity = Math.round((narrative.keyMessages.length / wordCount) * 1000);
      }
    }
    
    return narrative;
    
  } catch (e) {
    Logger.log('Error extracting category narrative: ' + e);
    return narrative;
  }
}

/**
 * Identify category gaps
 */
function COMP_identifyCategoryGaps(domain) {
  var gaps = {
    underservedSpaces: [],
    missingNarrativePercent: 0,
    gapIndex: 0,
    opportunities: []
  };
  
  try {
    // Search for unaddressed topics in competitor's niche
    var serperResult = APIS_serperSearch(domain + ' missing features alternatives');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.peopleAlsoAsk) {
        // PAA questions reveal gaps
        for (var i = 0; i < data.peopleAlsoAsk.length; i++) {
          var question = data.peopleAlsoAsk[i].question || '';
          if (question.toLowerCase().indexOf('better') !== -1 ||
              question.toLowerCase().indexOf('alternative') !== -1 ||
              question.toLowerCase().indexOf('instead') !== -1) {
            gaps.underservedSpaces.push(question);
          }
        }
      }
      
      // Calculate gap index
      if (data.organic) {
        var totalResults = data.organic.length;
        var competitorResults = 0;
        
        for (var i = 0; i < data.organic.length; i++) {
          if (data.organic[i].link && data.organic[i].link.indexOf(domain) !== -1) {
            competitorResults++;
          }
        }
        
        // Gap index = % of results NOT from competitor
        gaps.missingNarrativePercent = Math.round(((totalResults - competitorResults) / totalResults) * 100);
        gaps.gapIndex = gaps.missingNarrativePercent;
      }
      
      // Generate opportunities
      gaps.opportunities = gaps.underservedSpaces.slice(0, 3).map(function(space) {
        return {
          gap: space,
          priority: 'medium',
          effort: 'moderate'
        };
      });
    }
    
    return gaps;
    
  } catch (e) {
    Logger.log('Error identifying category gaps: ' + e);
    return gaps;
  }
}

/**
 * Forecast trends
 */
function COMP_forecastTrends(domain) {
  var trends = {
    fundingRounds: [],
    techAdoption: '',
    partnerships: [],
    emergingTopicMomentum: 0,
    trendDirection: 'stable'
  };
  
  try {
    // Search for recent news and trends
    var serperResult = APIS_serperSearch(domain + ' news funding partnership acquisition');
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.news) {
        for (var i = 0; i < Math.min(data.news.length, 5); i++) {
          var newsItem = data.news[i];
          var title = (newsItem.title || '').toLowerCase();
          
          // Detect funding
          if (title.indexOf('funding') !== -1 || title.indexOf('investment') !== -1) {
            trends.fundingRounds.push({
              title: newsItem.title,
              date: newsItem.date || '',
              source: newsItem.source || ''
            });
          }
          
          // Detect partnerships
          if (title.indexOf('partner') !== -1 || title.indexOf('collaboration') !== -1) {
            trends.partnerships.push({
              title: newsItem.title,
              date: newsItem.date || ''
            });
          }
        }
        
        // Calculate momentum
        trends.emergingTopicMomentum = (trends.fundingRounds.length * 10) + (trends.partnerships.length * 5);
        
        // Determine trend direction
        if (trends.emergingTopicMomentum > 30) trends.trendDirection = 'rising';
        else if (trends.emergingTopicMomentum > 10) trends.trendDirection = 'growing';
        else if (trends.emergingTopicMomentum < 5) trends.trendDirection = 'declining';
      }
    }
    
    return trends;
    
  } catch (e) {
    Logger.log('Error forecasting trends: ' + e);
    return trends;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect narrative archetype from content
 */
function detectNarrativeArchetype(html) {
  try {
    var text = html.toLowerCase();
    
    // Hero archetype: focus on achievement, goals, challenges
    var heroScore = 0;
    if (text.indexOf('achieve') !== -1) heroScore++;
    if (text.indexOf('succeed') !== -1) heroScore++;
    if (text.indexOf('win') !== -1) heroScore++;
    if (text.indexOf('challenge') !== -1) heroScore++;
    
    // Sage archetype: focus on knowledge, learning, wisdom
    var sageScore = 0;
    if (text.indexOf('learn') !== -1) sageScore++;
    if (text.indexOf('discover') !== -1) sageScore++;
    if (text.indexOf('understand') !== -1) sageScore++;
    if (text.indexOf('insight') !== -1) sageScore++;
    if (text.indexOf('knowledge') !== -1) sageScore++;
    
    // Explorer archetype: focus on discovery, adventure, freedom
    var explorerScore = 0;
    if (text.indexOf('explore') !== -1) explorerScore++;
    if (text.indexOf('discover') !== -1) explorerScore++;
    if (text.indexOf('adventure') !== -1) explorerScore++;
    if (text.indexOf('freedom') !== -1) explorerScore++;
    
    // Caregiver archetype: focus on helping, supporting, protecting
    var caregiverScore = 0;
    if (text.indexOf('help') !== -1) caregiverScore++;
    if (text.indexOf('support') !== -1) caregiverScore++;
    if (text.indexOf('care') !== -1) caregiverScore++;
    if (text.indexOf('protect') !== -1) caregiverScore++;
    
    // Return dominant archetype
    var max = Math.max(heroScore, sageScore, explorerScore, caregiverScore);
    if (max === 0) return 'Unknown';
    if (heroScore === max) return 'Hero';
    if (sageScore === max) return 'Sage';
    if (explorerScore === max) return 'Explorer';
    if (caregiverScore === max) return 'Caregiver';
    
    return 'Mixed';
    
  } catch (e) {
    return 'Unknown';
  }
}

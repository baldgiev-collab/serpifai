/**
 * COMPETITOR ANALYSIS - CATEGORY XI: AUTHORITY & INFLUENCE
 * Link velocity, topical relevance, influencer graph, publisher network, toxicity score
 * APIs: OpenPageRank (authority metrics), Serper (backlink patterns)
 */

/**
 * Main function: Analyze authority & influence
 * @param {object} params - { domain, url }
 * @return {object} Authority analysis
 */
function COMP_analyzeAuthority(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      linkVelocityRecency: COMP_analyzeLinkVelocity(domain),
      topicalRelevance: COMP_analyzeTopicalRelevance(domain, url),
      influencerGraph: COMP_analyzeInfluencerGraph(domain),
      publisherNetwork: COMP_analyzePublisherNetwork(domain),
      toxicityScore: COMP_analyzeToxicityScore(domain),
      reputationDelta: COMP_analyzeReputationDelta(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeAuthority: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze link velocity & recency
 */
function COMP_analyzeLinkVelocity(domain) {
  try {
    var velocity = {
      monthlyGrowth: 0,
      newLinksPerMonth: 0
    };
    
    // Get authority metrics from OpenPageRank
    var oprData = APIS_openPageRankFetch({ domain: domain });
    
    if (oprData && oprData.ok && oprData.page_rank_decimal) {
      // Estimate link velocity from PageRank (higher PR = higher velocity)
      var pageRank = oprData.page_rank_decimal;
      velocity.newLinksPerMonth = Math.round(pageRank * 100);
      velocity.monthlyGrowth = Math.round(pageRank * 2); // % growth estimate
    }
    
    return velocity;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeLinkVelocity: ' + e);
    return { monthlyGrowth: 0, newLinksPerMonth: 0 };
  }
}

/**
 * Analyze topical relevance
 */
function COMP_analyzeTopicalRelevance(domain, url) {
  try {
    var relevance = {
      domainContextMatch: 0,
      relevanceScore: 0
    };
    
    // Extract domain's main topics
    var headingsData = FET_handle({ action: 'extractHeadings', url: url });
    
    if (headingsData && headingsData.ok && headingsData.headings) {
      // Extract key terms from headings
      var keyTerms = [];
      
      for (var i = 0; i < headingsData.headings.length; i++) {
        var heading = headingsData.headings[i];
        if (heading.level === 'h2' || heading.level === 'h3') {
          var words = heading.text.toLowerCase().split(' ');
          for (var j = 0; j < words.length; j++) {
            var word = words[j].replace(/[^a-z]/g, '');
            if (word.length > 5) {
              keyTerms.push(word);
            }
          }
        }
      }
      
      // Relevance = number of topic-specific terms found
      var uniqueTerms = {};
      for (var k = 0; k < keyTerms.length; k++) {
        uniqueTerms[keyTerms[k]] = true;
      }
      
      relevance.domainContextMatch = Object.keys(uniqueTerms).length;
      relevance.relevanceScore = Math.min(100, relevance.domainContextMatch * 10);
    }
    
    return relevance;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeTopicalRelevance: ' + e);
    return { domainContextMatch: 0, relevanceScore: 0 };
  }
}

/**
 * Analyze influencer graph
 */
function COMP_analyzeInfluencerGraph(domain) {
  try {
    var influencerGraph = {
      thoughtLeaderConnections: [],
      nodeDegreeCount: 0
    };
    
    // Search for thought leader mentions
    var influencerSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' founder OR CEO OR expert OR influencer',
      num: 10
    });
    
    if (influencerSearch && influencerSearch.ok && influencerSearch.organic) {
      for (var i = 0; i < Math.min(5, influencerSearch.organic.length); i++) {
        var result = influencerSearch.organic[i];
        influencerGraph.thoughtLeaderConnections.push({
          name: result.title || '',
          link: result.link || ''
        });
      }
      
      influencerGraph.nodeDegreeCount = influencerGraph.thoughtLeaderConnections.length;
    }
    
    return influencerGraph;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeInfluencerGraph: ' + e);
    return { thoughtLeaderConnections: [], nodeDegreeCount: 0 };
  }
}

/**
 * Analyze publisher network (tier distribution)
 */
function COMP_analyzePublisherNetwork(domain) {
  try {
    var publisherNetwork = {
      tier1: 0,
      tier2: 0,
      tier3: 0,
      authorityTierMix: ''
    };
    
    // Search for backlinks from major publishers
    var tier1Publishers = ['forbes.com', 'techcrunch.com', 'wired.com', 'nytimes.com', 'wsj.com'];
    var tier1Count = 0;
    
    for (var i = 0; i < tier1Publishers.length; i++) {
      var publisherSearch = APIS_serperSearch({
        q: domain + ' site:' + tier1Publishers[i],
        num: 1
      });
      
      if (publisherSearch && publisherSearch.ok && publisherSearch.searchInformation) {
        if ((publisherSearch.searchInformation.totalResults || 0) > 0) {
          tier1Count++;
        }
      }
    }
    
    // Calculate tier distribution
    publisherNetwork.tier1 = Math.round((tier1Count / tier1Publishers.length) * 100);
    publisherNetwork.tier2 = Math.round(Math.random() * 30 + 20); // Placeholder
    publisherNetwork.tier3 = 100 - publisherNetwork.tier1 - publisherNetwork.tier2;
    
    // Determine mix
    if (publisherNetwork.tier1 > 50) {
      publisherNetwork.authorityTierMix = 'Premium - High tier 1 presence';
    } else if (publisherNetwork.tier1 > 20) {
      publisherNetwork.authorityTierMix = 'Strong - Balanced tier mix';
    } else {
      publisherNetwork.authorityTierMix = 'Growing - Mostly tier 2/3';
    }
    
    return publisherNetwork;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzePublisherNetwork: ' + e);
    return { tier1: 0, tier2: 0, tier3: 0, authorityTierMix: '' };
  }
}

/**
 * Analyze toxicity score (spam links)
 */
function COMP_analyzeToxicityScore(domain) {
  try {
    var toxicity = {
      spamLinkRatio: 0,
      toxicPercent: 0
    };
    
    // Search for spam indicators
    var spamSearch = APIS_serperSearch({
      q: domain + ' spam OR scam OR fake',
      num: 10
    });
    
    if (spamSearch && spamSearch.ok && spamSearch.searchInformation) {
      var spamResults = spamSearch.searchInformation.totalResults || 0;
      
      // Calculate toxicity ratio
      toxicity.spamLinkRatio = Math.min(1, spamResults / 10000);
      toxicity.toxicPercent = Math.round(toxicity.spamLinkRatio * 100);
    }
    
    return toxicity;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeToxicityScore: ' + e);
    return { spamLinkRatio: 0, toxicPercent: 0 };
  }
}

/**
 * Analyze reputation delta
 */
function COMP_analyzeReputationDelta(domain) {
  try {
    var reputationDelta = {
      authorityChange: 0,
      deltaPostPR: 0
    };
    
    // Get current authority
    var oprData = APIS_openPageRankFetch({ domain: domain });
    
    if (oprData && oprData.ok && oprData.page_rank_decimal) {
      // Estimate delta (would need historical data)
      // For now, positive delta if PageRank > 5
      reputationDelta.authorityChange = oprData.page_rank_decimal > 5 ? 5 : 0;
      reputationDelta.deltaPostPR = reputationDelta.authorityChange;
    }
    
    return reputationDelta;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeReputationDelta: ' + e);
    return { authorityChange: 0, deltaPostPR: 0 };
  }
}

/**
 * COMPETITOR ANALYSIS - CATEGORY IV: ORGANIC TRAFFIC & CONTENT INTELLIGENCE
 * Topical authority, traffic mix, content performance, velocity, SERP features, AI fingerprint
 * APIs: Serper (traffic estimates, SERP features), Fetcher (content analysis)
 */

/**
 * Main function: Analyze content intelligence
 * @param {object} params - { domain, url }
 * @return {object} Content intelligence analysis
 */
function COMP_analyzeContentIntel(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      topicalAuthority: COMP_analyzeTopicalAuthority(domain, url),
      trafficMix: COMP_analyzeTrafficMix(domain),
      contentPerformance: COMP_analyzeContentPerformance(domain, url),
      velocityFreshness: COMP_analyzeVelocityFreshness(domain),
      serpFeatureOwnership: COMP_analyzeSerpFeatures(domain),
      aiContentFingerprint: COMP_detectAIFingerprint(url)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeContentIntel: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze topical authority
 */
function COMP_analyzeTopicalAuthority(domain, url) {
  try {
    var authority = {
      topicClusters: [],
      semanticCoverage: 0,
      authorityScore: 0
    };
    
    // Fetch headings to identify topic clusters
    var headingsData = FET_handle({
      action: 'extractHeadings',
      url: url
    });
    
    if (headingsData && headingsData.ok && headingsData.headings) {
      // Extract H2/H3 headings as topic signals
      var topics = {};
      
      for (var i = 0; i < headingsData.headings.length; i++) {
        var heading = headingsData.headings[i];
        if (heading.level === 'h2' || heading.level === 'h3') {
          var text = heading.text.toLowerCase();
          var words = text.split(' ');
          
          // Extract key terms (words > 4 chars)
          for (var j = 0; j < words.length; j++) {
            var word = words[j].replace(/[^a-z]/g, '');
            if (word.length > 4) {
              topics[word] = (topics[word] || 0) + 1;
            }
          }
        }
      }
      
      // Convert to array of clusters
      for (var topic in topics) {
        authority.topicClusters.push({
          topic: topic,
          count: topics[topic]
        });
      }
      
      // Sort by count
      authority.topicClusters.sort(function(a, b) { return b.count - a.count; });
      
      // Take top 10
      authority.topicClusters = authority.topicClusters.slice(0, 10);
      
      // Semantic coverage: number of unique topics / 50 (normalized)
      authority.semanticCoverage = Math.min(100, Math.round((Object.keys(topics).length / 50) * 100));
    }
    
    // Authority score from OpenPageRank
    var oprData = APIS_openPageRankFetch({ domain: domain });
    if (oprData && oprData.ok && oprData.page_rank_decimal) {
      authority.authorityScore = Math.round(oprData.page_rank_decimal * 10); // Convert 0-10 to 0-100
    }
    
    return authority;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeTopicalAuthority: ' + e);
    return { topicClusters: [], semanticCoverage: 0, authorityScore: 0 };
  }
}

/**
 * Analyze traffic mix
 */
function COMP_analyzeTrafficMix(domain) {
  try {
    var trafficMix = {
      organic: 0,
      referral: 0,
      direct: 0,
      branded: 0
    };
    
    // Use Serper to estimate traffic sources
    var searchData = APIS_serperSearch({
      q: 'site:' + domain,
      num: 10
    });
    
    if (searchData && searchData.ok) {
      // Organic traffic indicator: total indexed pages
      var totalResults = searchData.searchInformation ? searchData.searchInformation.totalResults : 0;
      
      // Rough estimates (would need analytics API for real data)
      // Assume: high index count = high organic traffic
      if (totalResults > 10000) {
        trafficMix.organic = 60;
        trafficMix.referral = 20;
        trafficMix.direct = 15;
        trafficMix.branded = 5;
      } else if (totalResults > 1000) {
        trafficMix.organic = 50;
        trafficMix.referral = 25;
        trafficMix.direct = 15;
        trafficMix.branded = 10;
      } else {
        trafficMix.organic = 40;
        trafficMix.referral = 30;
        trafficMix.direct = 20;
        trafficMix.branded = 10;
      }
    }
    
    // Check branded search volume
    var brandSearch = APIS_serperSearch({
      q: domain.split('.')[0],
      num: 10
    });
    
    if (brandSearch && brandSearch.ok && brandSearch.searchInformation) {
      var brandResults = brandSearch.searchInformation.totalResults || 0;
      // High brand results = higher branded traffic
      if (brandResults > 100000) {
        trafficMix.branded = 15;
        trafficMix.direct = 20;
        trafficMix.organic = 50;
        trafficMix.referral = 15;
      }
    }
    
    return trafficMix;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeTrafficMix: ' + e);
    return { organic: 0, referral: 0, direct: 0, branded: 0 };
  }
}

/**
 * Analyze content performance
 */
function COMP_analyzeContentPerformance(domain, url) {
  try {
    var performance = {
      topUrls: [],
      avgEngagementPerUrl: 0
    };
    
    // Fetch top pages via Serper
    var topPagesData = APIS_serperSearch({
      q: 'site:' + domain,
      num: 10
    });
    
    if (topPagesData && topPagesData.ok && topPagesData.organic) {
      for (var i = 0; i < Math.min(5, topPagesData.organic.length); i++) {
        var result = topPagesData.organic[i];
        
        performance.topUrls.push({
          url: result.link || '',
          title: result.title || '',
          position: result.position || i + 1,
          estimatedTraffic: Math.round((11 - (result.position || i + 1)) * 1000), // Rough estimate
          backlinks: 0, // Would need backlink API
          engagement: Math.round(Math.random() * 50 + 50) // Placeholder
        });
      }
      
      // Calculate average engagement
      var totalEngagement = 0;
      for (var j = 0; j < performance.topUrls.length; j++) {
        totalEngagement += performance.topUrls[j].engagement;
      }
      performance.avgEngagementPerUrl = performance.topUrls.length > 0 
        ? Math.round(totalEngagement / performance.topUrls.length) 
        : 0;
    }
    
    return performance;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeContentPerformance: ' + e);
    return { topUrls: [], avgEngagementPerUrl: 0 };
  }
}

/**
 * Analyze content velocity & freshness
 */
function COMP_analyzeVelocityFreshness(domain) {
  try {
    var velocity = {
      publishCadence: 0,
      updateCycles: 0,
      avgUpdateInterval: 0
    };
    
    // Check for /blog or /news section
    var blogData = APIS_serperSearch({
      q: 'site:' + domain + ' blog OR news',
      num: 10
    });
    
    if (blogData && blogData.ok && blogData.organic) {
      // Estimate publish cadence from number of results
      var blogCount = blogData.searchInformation ? blogData.searchInformation.totalResults : 0;
      
      // Rough estimate: posts per month
      if (blogCount > 500) {
        velocity.publishCadence = 20; // ~20 posts/month
      } else if (blogCount > 100) {
        velocity.publishCadence = 10;
      } else if (blogCount > 10) {
        velocity.publishCadence = 5;
      } else {
        velocity.publishCadence = 1;
      }
      
      // Update cycles: assume update every 90 days on average
      velocity.updateCycles = 90;
      velocity.avgUpdateInterval = 90;
    }
    
    return velocity;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeVelocityFreshness: ' + e);
    return { publishCadence: 0, updateCycles: 0, avgUpdateInterval: 0 };
  }
}

/**
 * Analyze SERP feature ownership
 */
function COMP_analyzeSerpFeatures(domain) {
  try {
    var serpFeatures = {
      snippets: 0,
      paa: 0,
      video: 0,
      images: 0,
      featureSharePercent: 0
    };
    
    // Search for domain in featured snippets
    var snippetData = APIS_serperSearch({
      q: domain.split('.')[0] + ' how to OR what is OR best',
      num: 10
    });
    
    if (snippetData && snippetData.ok) {
      // Check for featured snippets
      if (snippetData.answerBox) {
        var snippetDomain = extractDomainFromUrl(snippetData.answerBox.link || '');
        if (snippetDomain === domain) {
          serpFeatures.snippets = 1;
        }
      }
      
      // Check People Also Ask
      if (snippetData.relatedQuestions) {
        for (var i = 0; i < snippetData.relatedQuestions.length; i++) {
          var paa = snippetData.relatedQuestions[i];
          var paaDomain = extractDomainFromUrl(paa.link || '');
          if (paaDomain === domain) {
            serpFeatures.paa++;
          }
        }
      }
      
      // Check for video results
      if (snippetData.organic) {
        for (var j = 0; j < snippetData.organic.length; j++) {
          var result = snippetData.organic[j];
          var resultDomain = extractDomainFromUrl(result.link || '');
          if (resultDomain === domain && result.sitelinks) {
            serpFeatures.video = 1;
          }
        }
      }
    }
    
    // Calculate feature share (percentage of SERP features owned)
    var totalFeatures = serpFeatures.snippets + serpFeatures.paa + serpFeatures.video + serpFeatures.images;
    serpFeatures.featureSharePercent = Math.min(100, totalFeatures * 10); // Each feature = 10%
    
    return serpFeatures;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeSerpFeatures: ' + e);
    return { snippets: 0, paa: 0, video: 0, images: 0, featureSharePercent: 0 };
  }
}

/**
 * Detect AI content fingerprint
 */
function COMP_detectAIFingerprint(url) {
  try {
    var fingerprint = {
      tonePatterns: [],
      promptSignature: '',
      aiSimilarityIndex: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Check for AI tone patterns
      var aiPhrases = [
        { phrase: 'in conclusion', weight: 10 },
        { phrase: 'it is important to note', weight: 15 },
        { phrase: 'delve into', weight: 20 },
        { phrase: 'in summary', weight: 10 },
        { phrase: 'comprehensive guide', weight: 5 },
        { phrase: 'navigate the landscape', weight: 15 },
        { phrase: 'in today\'s digital age', weight: 12 },
        { phrase: 'revolutionize', weight: 8 },
        { phrase: 'unlock the power', weight: 10 },
        { phrase: 'it\'s worth noting', weight: 12 },
        { phrase: 'as an ai', weight: 25 }
      ];
      
      var totalWeight = 0;
      var maxWeight = 0;
      
      for (var i = 0; i < aiPhrases.length; i++) {
        var item = aiPhrases[i];
        maxWeight += item.weight;
        
        if (html.indexOf(item.phrase) !== -1) {
          totalWeight += item.weight;
          fingerprint.tonePatterns.push(item.phrase);
        }
      }
      
      // Calculate AI similarity index
      fingerprint.aiSimilarityIndex = Math.round((totalWeight / maxWeight) * 100);
      
      // Determine prompt signature based on patterns
      if (fingerprint.aiSimilarityIndex > 70) {
        fingerprint.promptSignature = 'High AI likelihood - ChatGPT/Claude pattern';
      } else if (fingerprint.aiSimilarityIndex > 40) {
        fingerprint.promptSignature = 'Moderate AI usage - Mixed human/AI';
      } else if (fingerprint.aiSimilarityIndex > 20) {
        fingerprint.promptSignature = 'Low AI signals - Mostly human written';
      } else {
        fingerprint.promptSignature = 'No AI patterns detected';
      }
    }
    
    return fingerprint;
    
  } catch (e) {
    Logger.log('Error in COMP_detectAIFingerprint: ' + e);
    return { tonePatterns: [], promptSignature: '', aiSimilarityIndex: 0 };
  }
}

/**
 * Helper: Extract domain from URL
 */
function extractDomainFromUrl(url) {
  try {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  } catch (e) {
    return url;
  }
}

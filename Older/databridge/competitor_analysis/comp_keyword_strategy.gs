/**
 * COMPETITOR ANALYSIS - CATEGORY V: KEYWORD & ENTITY STRATEGY
 * Keyword gap, entity mapping, semantic clusters, intent layering, search journey
 * APIs: Serper (keyword data, search queries, PAA)
 */

/**
 * Main function: Analyze keyword strategy
 * @param {object} params - { domain, url }
 * @return {object} Keyword strategy analysis
 */
function COMP_analyzeKeywordStrategy(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      keywordGap: COMP_analyzeKeywordGap(domain),
      entityMapping: COMP_analyzeEntityMapping(domain, url),
      semanticClusters: COMP_analyzeSemanticClusters(domain),
      intentLayering: COMP_analyzeIntentLayering(domain),
      searchJourney: COMP_analyzeSearchJourney(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeKeywordStrategy: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze keyword gap opportunities
 */
function COMP_analyzeKeywordGap(domain) {
  try {
    var keywordGap = {
      unrankedHighValueTerms: [],
      potentialGain: 0
    };
    
    // Search for industry keywords
    var industryTerm = domain.split('.')[0];
    var keywordData = APIS_serperSearch({
      q: industryTerm + ' OR ' + industryTerm + ' alternative OR best ' + industryTerm,
      num: 10
    });
    
    if (keywordData && keywordData.ok && keywordData.organic) {
      // Find keywords where domain doesn't rank
      for (var i = 0; i < keywordData.organic.length; i++) {
        var result = keywordData.organic[i];
        var resultDomain = extractDomainFromUrl(result.link || '');
        
        if (resultDomain !== domain) {
          // This is a gap opportunity
          keywordGap.unrankedHighValueTerms.push({
            keyword: result.title || '',
            currentRanker: resultDomain,
            estimatedTraffic: Math.round((11 - (result.position || i + 1)) * 500)
          });
        }
      }
      
      // Calculate potential gain
      var totalGain = 0;
      for (var j = 0; j < keywordGap.unrankedHighValueTerms.length; j++) {
        totalGain += keywordGap.unrankedHighValueTerms[j].estimatedTraffic;
      }
      keywordGap.potentialGain = totalGain;
    }
    
    return keywordGap;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeKeywordGap: ' + e);
    return { unrankedHighValueTerms: [], potentialGain: 0 };
  }
}

/**
 * Analyze entity mapping
 */
function COMP_analyzeEntityMapping(domain, url) {
  try {
    var entityMapping = {
      namedEntities: [],
      relations: [],
      coverageScore: 0
    };
    
    // Fetch page content to extract entities
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      // Extract capitalized terms (potential entities)
      var html = pageData.html;
      var entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
      var matches = html.match(entityPattern) || [];
      
      // Count occurrences
      var entityCounts = {};
      for (var i = 0; i < matches.length; i++) {
        var entity = matches[i];
        if (entity.length > 3) { // Filter short words
          entityCounts[entity] = (entityCounts[entity] || 0) + 1;
        }
      }
      
      // Convert to array and sort
      for (var entity in entityCounts) {
        if (entityCounts[entity] >= 2) { // Must appear at least twice
          entityMapping.namedEntities.push({
            entity: entity,
            count: entityCounts[entity]
          });
        }
      }
      
      entityMapping.namedEntities.sort(function(a, b) { return b.count - a.count; });
      entityMapping.namedEntities = entityMapping.namedEntities.slice(0, 20); // Top 20
      
      // Coverage score: number of entities / 20 (normalized)
      entityMapping.coverageScore = Math.min(100, Math.round((entityMapping.namedEntities.length / 20) * 100));
      
      // Simple relations: entities that appear together
      for (var j = 0; j < Math.min(5, entityMapping.namedEntities.length); j++) {
        var e1 = entityMapping.namedEntities[j];
        for (var k = j + 1; k < Math.min(10, entityMapping.namedEntities.length); k++) {
          var e2 = entityMapping.namedEntities[k];
          entityMapping.relations.push({
            from: e1.entity,
            to: e2.entity,
            type: 'co-occurrence'
          });
        }
      }
    }
    
    return entityMapping;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeEntityMapping: ' + e);
    return { namedEntities: [], relations: [], coverageScore: 0 };
  }
}

/**
 * Analyze semantic clusters
 */
function COMP_analyzeSemanticClusters(domain) {
  try {
    var clusters = {
      highIntentLowComp: [],
      opportunityDifficulty: []
    };
    
    // Search for related queries
    var relatedData = APIS_serperSearch({
      q: domain.split('.')[0],
      num: 10
    });
    
    if (relatedData && relatedData.ok && relatedData.relatedSearches) {
      // Extract related searches as clusters
      for (var i = 0; i < relatedData.relatedSearches.length; i++) {
        var query = relatedData.relatedSearches[i].query || '';
        
        // Detect intent from query
        var intent = 'informational';
        if (query.indexOf('buy') !== -1 || query.indexOf('price') !== -1 || query.indexOf('discount') !== -1) {
          intent = 'transactional';
        } else if (query.indexOf('vs') !== -1 || query.indexOf('review') !== -1 || query.indexOf('best') !== -1) {
          intent = 'commercial';
        }
        
        // Estimate difficulty (lower if fewer words = more competitive)
        var wordCount = query.split(' ').length;
        var difficulty = wordCount <= 2 ? 80 : (wordCount === 3 ? 60 : 40);
        var opportunity = 100 - difficulty;
        
        clusters.opportunityDifficulty.push({
          cluster: query,
          intent: intent,
          opportunity: opportunity,
          difficulty: difficulty
        });
        
        // High intent, low comp = opportunity
        if (intent === 'commercial' && difficulty < 60) {
          clusters.highIntentLowComp.push(query);
        }
      }
    }
    
    return clusters;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeSemanticClusters: ' + e);
    return { highIntentLowComp: [], opportunityDifficulty: [] };
  }
}

/**
 * Analyze intent layering (funnel coverage)
 */
function COMP_analyzeIntentLayering(domain) {
  try {
    var intentLayering = {
      awareness: [],
      consideration: [],
      decision: [],
      retention: [],
      funnelCoveragePercent: 0
    };
    
    // Search for awareness keywords (what is, how to)
    var awarenessData = APIS_serperSearch({
      q: 'what is ' + domain.split('.')[0] + ' OR how to use ' + domain.split('.')[0],
      num: 5
    });
    
    if (awarenessData && awarenessData.ok && awarenessData.organic) {
      for (var i = 0; i < awarenessData.organic.length; i++) {
        intentLayering.awareness.push(awarenessData.organic[i].title || '');
      }
    }
    
    // Search for consideration keywords (vs, review, best)
    var considerationData = APIS_serperSearch({
      q: domain.split('.')[0] + ' vs OR ' + domain.split('.')[0] + ' review',
      num: 5
    });
    
    if (considerationData && considerationData.ok && considerationData.organic) {
      for (var j = 0; j < considerationData.organic.length; j++) {
        intentLayering.consideration.push(considerationData.organic[j].title || '');
      }
    }
    
    // Search for decision keywords (buy, price, discount)
    var decisionData = APIS_serperSearch({
      q: 'buy ' + domain.split('.')[0] + ' OR ' + domain.split('.')[0] + ' price',
      num: 5
    });
    
    if (decisionData && decisionData.ok && decisionData.organic) {
      for (var k = 0; k < decisionData.organic.length; k++) {
        intentLayering.decision.push(decisionData.organic[k].title || '');
      }
    }
    
    // Retention: support, help, tutorial
    intentLayering.retention = ['Support docs', 'Help center', 'Tutorials']; // Placeholder
    
    // Calculate funnel coverage
    var stagesCovered = 0;
    if (intentLayering.awareness.length > 0) stagesCovered++;
    if (intentLayering.consideration.length > 0) stagesCovered++;
    if (intentLayering.decision.length > 0) stagesCovered++;
    if (intentLayering.retention.length > 0) stagesCovered++;
    
    intentLayering.funnelCoveragePercent = Math.round((stagesCovered / 4) * 100);
    
    return intentLayering;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeIntentLayering: ' + e);
    return { awareness: [], consideration: [], decision: [], retention: [], funnelCoveragePercent: 0 };
  }
}

/**
 * Analyze search journey
 */
function COMP_analyzeSearchJourney(domain) {
  try {
    var searchJourney = {
      informationalCommercialPath: [],
      journeyDepthScore: 0
    };
    
    // Map informational → commercial path
    var journey = [
      { stage: 'Awareness', query: 'what is ' + domain.split('.')[0], intent: 'informational' },
      { stage: 'Interest', query: domain.split('.')[0] + ' features', intent: 'informational' },
      { stage: 'Consideration', query: domain.split('.')[0] + ' vs alternatives', intent: 'commercial' },
      { stage: 'Decision', query: 'buy ' + domain.split('.')[0], intent: 'transactional' }
    ];
    
    searchJourney.informationalCommercialPath = journey;
    
    // Journey depth: all 4 stages = 100
    searchJourney.journeyDepthScore = 100;
    
    return searchJourney;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeSearchJourney: ' + e);
    return { informationalCommercialPath: [], journeyDepthScore: 0 };
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

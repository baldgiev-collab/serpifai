/**
 * COMPETITOR ANALYSIS - CATEGORY XIV: SCORING & VISUALIZATION ENGINE
 * SEO depth index, GEO presence score, AEO readiness, entity trust score, strategy depth
 * Aggregates data from all previous modules to calculate composite scores
 */

/**
 * Main function: Calculate scoring engine
 * @param {object} params - { domain, url, allModuleData }
 * @return {object} Composite scores
 */
function COMP_calculateScoringEngine(params) {
  var domain = params.domain;
  var url = params.url;
  var allData = params.allModuleData || {}; // Data from all 13 previous modules
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      seoDepthIndex: COMP_calculateSEODepthIndex(allData),
      geoPresenceScore: COMP_calculateGEOPresenceScore(allData),
      aeoReadiness: COMP_calculateAEOReadiness(allData),
      entityTrustScore: COMP_calculateEntityTrustScore(allData),
      strategyDepthIndex: COMP_calculateStrategyDepthIndex(allData),
      authorityMomentumGraph: COMP_generateAuthorityMomentumGraph(domain)
    };
    
    // Overall competitive score
    result.overallCompetitiveScore = COMP_calculateOverallScore(result);
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateScoringEngine: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Calculate SEO Depth Index
 * Formula: (Technical × Content × Authority) / UX penalty
 */
function COMP_calculateSEODepthIndex(allData) {
  try {
    var seoDepth = {
      technicalScore: 0,
      contentScore: 0,
      authorityScore: 0,
      uxPenalty: 0,
      depthIndex: 0
    };
    
    // Technical score (from Technical SEO module)
    if (allData.technicalSEO && allData.technicalSEO.overallHealthScore) {
      seoDepth.technicalScore = allData.technicalSEO.overallHealthScore;
    } else {
      seoDepth.technicalScore = 50; // Default
    }
    
    // Content score (from Content Intelligence module)
    if (allData.contentIntel && allData.contentIntel.topicalAuthority) {
      seoDepth.contentScore = allData.contentIntel.topicalAuthority.authorityScore || 50;
    } else {
      seoDepth.contentScore = 50;
    }
    
    // Authority score (from Authority module)
    if (allData.authority && allData.authority.linkVelocityRecency) {
      seoDepth.authorityScore = Math.min(100, allData.authority.linkVelocityRecency.monthlyGrowth * 10);
    } else {
      seoDepth.authorityScore = 50;
    }
    
    // UX penalty (from Technical SEO - page speed)
    if (allData.technicalSEO && allData.technicalSEO.pageSpeed && allData.technicalSEO.pageSpeed.uxScore) {
      seoDepth.uxPenalty = 100 - allData.technicalSEO.pageSpeed.uxScore;
    } else {
      seoDepth.uxPenalty = 20; // Default penalty
    }
    
    // Calculate depth index
    var rawScore = (seoDepth.technicalScore + seoDepth.contentScore + seoDepth.authorityScore) / 3;
    var penaltyMultiplier = 1 - (seoDepth.uxPenalty / 200); // Max 50% penalty
    seoDepth.depthIndex = Math.round(rawScore * penaltyMultiplier);
    
    return seoDepth;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateSEODepthIndex: ' + e);
    return { technicalScore: 0, contentScore: 0, authorityScore: 0, uxPenalty: 0, depthIndex: 0 };
  }
}

/**
 * Calculate GEO Presence Score
 * Formula: AI citations × affinity × trust rate
 */
function COMP_calculateGEOPresenceScore(allData) {
  try {
    var geoPresence = {
      citationScore: 0,
      affinityScore: 0,
      trustScore: 0,
      presenceScore: 0
    };
    
    // Citation score (from GEO+AEO module)
    if (allData.geoAeo && allData.geoAeo.aiCitationDensity) {
      geoPresence.citationScore = Math.min(100, allData.geoAeo.aiCitationDensity.citationCount / 10);
    } else {
      geoPresence.citationScore = 30;
    }
    
    // Affinity score (LLM affinity)
    if (allData.geoAeo && allData.geoAeo.llmAffinity) {
      geoPresence.affinityScore = allData.geoAeo.llmAffinity.embeddingScore || 50;
    } else {
      geoPresence.affinityScore = 50;
    }
    
    // Trust score (factual integrity)
    if (allData.geoAeo && allData.geoAeo.factualIntegrity) {
      geoPresence.trustScore = allData.geoAeo.factualIntegrity.accuracyScore || 50;
    } else {
      geoPresence.trustScore = 50;
    }
    
    // Calculate presence score (weighted average)
    geoPresence.presenceScore = Math.round(
      (geoPresence.citationScore * 0.4) +
      (geoPresence.affinityScore * 0.3) +
      (geoPresence.trustScore * 0.3)
    );
    
    return geoPresence;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateGEOPresenceScore: ' + e);
    return { citationScore: 0, affinityScore: 0, trustScore: 0, presenceScore: 0 };
  }
}

/**
 * Calculate AEO Readiness
 * Formula: Snippet × FAQ × voice accuracy
 */
function COMP_calculateAEOReadiness(allData) {
  try {
    var aeoReadiness = {
      snippetScore: 0,
      faqScore: 0,
      voiceScore: 0,
      readinessScore: 0
    };
    
    // Snippet score (SERP features)
    if (allData.contentIntel && allData.contentIntel.serpFeatureOwnership) {
      aeoReadiness.snippetScore = allData.contentIntel.serpFeatureOwnership.featureSharePercent || 30;
    } else {
      aeoReadiness.snippetScore = 30;
    }
    
    // FAQ score (conversational answers)
    if (allData.geoAeo && allData.geoAeo.conversationalAnswers) {
      aeoReadiness.faqScore = allData.geoAeo.conversationalAnswers.answerAccuracyPercent || 50;
    } else {
      aeoReadiness.faqScore = 50;
    }
    
    // Voice score (zero-click footprint)
    if (allData.geoAeo && allData.geoAeo.zeroClickFootprint) {
      aeoReadiness.voiceScore = allData.geoAeo.zeroClickFootprint.zeroClickRatePercent || 40;
    } else {
      aeoReadiness.voiceScore = 40;
    }
    
    // Calculate readiness score (weighted average)
    aeoReadiness.readinessScore = Math.round(
      (aeoReadiness.snippetScore * 0.35) +
      (aeoReadiness.faqScore * 0.35) +
      (aeoReadiness.voiceScore * 0.3)
    );
    
    return aeoReadiness;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateAEOReadiness: ' + e);
    return { snippetScore: 0, faqScore: 0, voiceScore: 0, readinessScore: 0 };
  }
}

/**
 * Calculate Entity Trust Score
 * Formula: Co-citation × KG alignment × EEAT
 */
function COMP_calculateEntityTrustScore(allData) {
  try {
    var entityTrust = {
      coCitationScore: 0,
      kgAlignmentScore: 0,
      eeatScore: 0,
      trustScore: 0
    };
    
    // Co-citation score (from Distribution module)
    if (allData.distribution && allData.distribution.backlinkIntelligence) {
      entityTrust.coCitationScore = Math.min(100, allData.distribution.backlinkIntelligence.velocity);
    } else {
      entityTrust.coCitationScore = 40;
    }
    
    // Knowledge Graph alignment (from GEO+AEO)
    if (allData.geoAeo && allData.geoAeo.zeroClickFootprint) {
      entityTrust.kgAlignmentScore = allData.geoAeo.zeroClickFootprint.knowledgeGraphPresence ? 80 : 30;
    } else {
      entityTrust.kgAlignmentScore = 30;
    }
    
    // E-E-A-T score (from Brand Position)
    if (allData.brandPosition && allData.brandPosition.eeatSignals) {
      entityTrust.eeatScore = allData.brandPosition.eeatSignals.overallScore || 50;
    } else {
      entityTrust.eeatScore = 50;
    }
    
    // Calculate trust score (weighted average)
    entityTrust.trustScore = Math.round(
      (entityTrust.coCitationScore * 0.3) +
      (entityTrust.kgAlignmentScore * 0.3) +
      (entityTrust.eeatScore * 0.4)
    );
    
    return entityTrust;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateEntityTrustScore: ' + e);
    return { coCitationScore: 0, kgAlignmentScore: 0, eeatScore: 0, trustScore: 0 };
  }
}

/**
 * Calculate Strategy Depth Index
 * Formula: Narrative cohesion + innovation / noise
 */
function COMP_calculateStrategyDepthIndex(allData) {
  try {
    var strategyDepth = {
      narrativeCohesionScore: 0,
      innovationScore: 0,
      noiseReduction: 0,
      depthIndex: 0
    };
    
    // Narrative cohesion (from Brand Position)
    if (allData.brandPosition && allData.brandPosition.categoryOwnership) {
      strategyDepth.narrativeCohesionScore = allData.brandPosition.categoryOwnership.ownershipPercent || 40;
    } else {
      strategyDepth.narrativeCohesionScore = 40;
    }
    
    // Innovation score (from Opportunity Matrix)
    if (allData.opportunityMatrix && allData.opportunityMatrix.blueOcean) {
      strategyDepth.innovationScore = allData.opportunityMatrix.blueOcean.opportunityScore || 50;
    } else {
      strategyDepth.innovationScore = 50;
    }
    
    // Noise reduction (inverse of AI content fingerprint)
    if (allData.contentIntel && allData.contentIntel.aiContentFingerprint) {
      var aiSimilarity = allData.contentIntel.aiContentFingerprint.aiSimilarityIndex || 50;
      strategyDepth.noiseReduction = 100 - aiSimilarity; // Less AI = less noise
    } else {
      strategyDepth.noiseReduction = 50;
    }
    
    // Calculate depth index
    var rawScore = (strategyDepth.narrativeCohesionScore + strategyDepth.innovationScore) / 2;
    var noiseMultiplier = strategyDepth.noiseReduction / 100;
    strategyDepth.depthIndex = Math.round(rawScore * noiseMultiplier);
    
    return strategyDepth;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateStrategyDepthIndex: ' + e);
    return { narrativeCohesionScore: 0, innovationScore: 0, noiseReduction: 0, depthIndex: 0 };
  }
}

/**
 * Generate authority momentum graph (time-based trust growth)
 */
function COMP_generateAuthorityMomentumGraph(domain) {
  try {
    var momentumGraph = {
      historicalData: [],
      currentMomentum: 0,
      projectedGrowth: 0
    };
    
    // Get current authority
    var oprData = APIS_openPageRankFetch({ domain: domain });
    
    if (oprData && oprData.ok && oprData.page_rank_decimal) {
      var currentAuthority = oprData.page_rank_decimal * 10; // Convert to 0-100
      
      // Generate historical trend (mock data - would need real historical data)
      for (var i = 6; i >= 0; i--) {
        var monthsAgo = i;
        var historicalValue = currentAuthority - (i * 2); // Assume +2 per month growth
        
        momentumGraph.historicalData.push({
          period: monthsAgo === 0 ? 'Current' : monthsAgo + ' months ago',
          authorityScore: Math.max(0, Math.round(historicalValue))
        });
      }
      
      // Calculate momentum (change over last 6 months)
      var oldestScore = momentumGraph.historicalData[0].authorityScore;
      var newestScore = momentumGraph.historicalData[momentumGraph.historicalData.length - 1].authorityScore;
      momentumGraph.currentMomentum = newestScore - oldestScore;
      
      // Project 3 months ahead
      momentumGraph.projectedGrowth = Math.round(currentAuthority + (momentumGraph.currentMomentum / 2));
    }
    
    return momentumGraph;
    
  } catch (e) {
    Logger.log('Error in COMP_generateAuthorityMomentumGraph: ' + e);
    return { historicalData: [], currentMomentum: 0, projectedGrowth: 0 };
  }
}

/**
 * Calculate overall competitive score
 */
function COMP_calculateOverallScore(scoringData) {
  try {
    var scores = [];
    
    if (scoringData.seoDepthIndex) scores.push(scoringData.seoDepthIndex.depthIndex);
    if (scoringData.geoPresenceScore) scores.push(scoringData.geoPresenceScore.presenceScore);
    if (scoringData.aeoReadiness) scores.push(scoringData.aeoReadiness.readinessScore);
    if (scoringData.entityTrustScore) scores.push(scoringData.entityTrustScore.trustScore);
    if (scoringData.strategyDepthIndex) scores.push(scoringData.strategyDepthIndex.depthIndex);
    
    var total = 0;
    for (var i = 0; i < scores.length; i++) {
      total += scores[i];
    }
    
    return scores.length > 0 ? Math.round(total / scores.length) : 0;
    
  } catch (e) {
    Logger.log('Error in COMP_calculateOverallScore: ' + e);
    return 0;
  }
}

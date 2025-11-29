/**
 * =============================================================================
 * SCORING & VISUALIZATION ENGINE + OVERVIEW GENERATOR
 * =============================================================================
 * 
 * Category XIV & XV: Aggregate scoring and executive overview generation
 */


/**
 * =============================================================================
 * XIV. SCORING & VISUALIZATION ENGINE
 * =============================================================================
 */
function COMP_calculateScores(intelligence) {
  const result = {
    category: 'Scoring & Visualization Engine',
    competitors: []
  };
  
  // Get all competitor domains from any category
  const firstCategory = Object.values(intelligence)[0];
  if (!firstCategory || !firstCategory.competitors) {
    return result;
  }
  
  const domains = firstCategory.competitors.map(c => c.domain);
  
  domains.forEach(domain => {
    const metrics = {};
    
    try {
      // Aggregate scores from all categories
      const categoryScores = COMP_aggregateCategoryScores(intelligence, domain);
      
      metrics.seoDepthIndex = {
        value: COMP_calculateSEODepthIndex(categoryScores),
        depth: COMP_calculateSEODepthIndex(categoryScores),
        score: COMP_calculateSEODepthIndex(categoryScores)
      };
      
      metrics.geoPresenceScore = {
        value: COMP_calculateGEOPresenceScore(categoryScores),
        geoScore: COMP_calculateGEOPresenceScore(categoryScores),
        score: COMP_calculateGEOPresenceScore(categoryScores)
      };
      
      metrics.aeoReadiness = {
        value: COMP_calculateAEOReadiness(categoryScores),
        aeoScore: COMP_calculateAEOReadiness(categoryScores),
        score: COMP_calculateAEOReadiness(categoryScores)
      };
      
      metrics.entityTrustScore = {
        value: COMP_calculateEntityTrustScore(categoryScores),
        entityScore: COMP_calculateEntityTrustScore(categoryScores),
        score: COMP_calculateEntityTrustScore(categoryScores)
      };
      
      metrics.strategyDepthIndex = {
        value: COMP_calculateStrategyDepthIndex(categoryScores),
        depthScore: COMP_calculateStrategyDepthIndex(categoryScores),
        score: COMP_calculateStrategyDepthIndex(categoryScores)
      };
      
      metrics.authorityMomentum = {
        value: COMP_calculateAuthorityMomentum(categoryScores),
        momentumTrend: COMP_getAuthorityMomentumTrend(categoryScores),
        score: COMP_calculateAuthorityMomentum(categoryScores)
      };
      
    } catch (error) {
      Logger.log('Error calculating scores for ' + domain + ': ' + error.toString());
    }
    
    result.competitors.push({
      domain: domain,
      metrics: metrics
    });
  });
  
  return result;
}


/**
 * Aggregate all category scores for a competitor
 */
function COMP_aggregateCategoryScores(intelligence, domain) {
  const scores = {
    technical: 0,
    content: 0,
    authority: 0,
    brand: 0,
    conversion: 0,
    distribution: 0,
    audience: 0,
    geo: 0,
    performance: 0,
    strategy: 0
  };
  
  // Extract relevant scores from each category
  try {
    // Technical SEO
    if (intelligence.technicalSEO) {
      const comp = intelligence.technicalSEO.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.technical = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Content Intelligence
    if (intelligence.contentIntelligence) {
      const comp = intelligence.contentIntelligence.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.content = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Authority
    if (intelligence.authorityData) {
      const comp = intelligence.authorityData.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.authority = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Brand
    if (intelligence.brandPositioning) {
      const comp = intelligence.brandPositioning.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.brand = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Conversion
    if (intelligence.conversionData) {
      const comp = intelligence.conversionData.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.conversion = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Distribution
    if (intelligence.distributionData) {
      const comp = intelligence.distributionData.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.distribution = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Audience
    if (intelligence.audienceIntelligence) {
      const comp = intelligence.audienceIntelligence.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.audience = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // GEO/AEO
    if (intelligence.geoAeoIntelligence) {
      const comp = intelligence.geoAeoIntelligence.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.geo = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Performance
    if (intelligence.performanceData) {
      const comp = intelligence.performanceData.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.performance = COMP_avgMetricScores(comp.metrics);
      }
    }
    
    // Strategy
    if (intelligence.strategicOpportunities) {
      const comp = intelligence.strategicOpportunities.competitors.find(c => c.domain === domain);
      if (comp && comp.metrics) {
        scores.strategy = COMP_avgMetricScores(comp.metrics);
      }
    }
    
  } catch (error) {
    Logger.log('Error aggregating scores: ' + error.toString());
  }
  
  return scores;
}


/**
 * Calculate average of metric scores
 */
function COMP_avgMetricScores(metrics) {
  const scores = [];
  Object.keys(metrics).forEach(key => {
    const metric = metrics[key];
    if (metric && typeof metric.score === 'number') {
      scores.push(metric.score);
    }
  });
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}


/**
 * Calculate composite scores
 */
function COMP_calculateSEODepthIndex(scores) {
  // Technical × Content × Authority / UX penalty
  const base = (scores.technical + scores.content + scores.authority) / 3;
  const penalty = scores.technical < 70 ? 0.9 : 1.0;
  return Math.round(base * penalty);
}

function COMP_calculateGEOPresenceScore(scores) {
  // AI citations × affinity × trust rate
  return Math.round((scores.geo + scores.content + scores.brand) / 3);
}

function COMP_calculateAEOReadiness(scores) {
  // Snippet × FAQ × voice accuracy
  return Math.round((scores.geo + scores.technical + scores.content) / 3);
}

function COMP_calculateEntityTrustScore(scores) {
  // Co-citation × KG alignment × EEAT
  return Math.round((scores.authority + scores.brand + scores.content) / 3);
}

function COMP_calculateStrategyDepthIndex(scores) {
  // Narrative cohesion + innovation / noise
  return Math.round((scores.brand + scores.strategy + scores.content) / 3);
}

function COMP_calculateAuthorityMomentum(scores) {
  // Time-based trust growth
  return Math.round((scores.authority + scores.distribution + scores.performance) / 3);
}

function COMP_getAuthorityMomentumTrend(scores) {
  const momentum = COMP_calculateAuthorityMomentum(scores);
  if (momentum >= 80) return 'Strong upward trend';
  if (momentum >= 60) return 'Moderate growth';
  if (momentum >= 40) return 'Stable';
  return 'Declining';
}


/**
 * =============================================================================
 * XV. EXECUTIVE DELIVERABLES (OVERVIEW)
 * =============================================================================
 */
function COMP_generateOverview(intelligence, config) {
  const result = {
    category: 'Executive Overview',
    competitors: []
  };
  
  // Get all competitor domains
  const firstCategory = Object.values(intelligence)[0];
  if (!firstCategory || !firstCategory.competitors) {
    return result;
  }
  
  const domains = firstCategory.competitors.map(c => c.domain);
  
  domains.forEach((domain, index) => {
    const metrics = {};
    
    try {
      // Aggregate all key metrics for overview
      const categoryScores = COMP_aggregateCategoryScores(intelligence, domain);
      
      metrics.overallScore = {
        value: COMP_calculateOverallScore(categoryScores),
        score: COMP_calculateOverallScore(categoryScores),
        rank: index + 1
      };
      
      metrics.strengthAreas = {
        value: COMP_identifyStrengths(categoryScores),
        topStrengths: COMP_getTopStrengths(categoryScores),
        score: COMP_calculateOverallScore(categoryScores)
      };
      
      metrics.weaknessAreas = {
        value: COMP_identifyWeaknesses(categoryScores),
        topWeaknesses: COMP_getTopWeaknesses(categoryScores),
        score: COMP_calculateOverallScore(categoryScores)
      };
      
      metrics.competitivePosition = {
        value: COMP_assessCompetitivePosition(categoryScores, index),
        positionTier: COMP_getPositionTier(categoryScores),
        score: COMP_calculateOverallScore(categoryScores)
      };
      
      metrics.opportunityIndex = {
        value: COMP_calculateOpportunityIndex(intelligence, domain),
        opportunityScore: COMP_calculateOpportunityIndex(intelligence, domain),
        score: COMP_calculateOpportunityIndex(intelligence, domain)
      };
      
      metrics.threatLevel = {
        value: COMP_assessThreatLevel(categoryScores, index),
        threatScore: COMP_calculateThreatScore(categoryScores),
        score: COMP_calculateThreatScore(categoryScores)
      };
      
      metrics.recommendedActions = {
        value: COMP_generateRecommendations(categoryScores, intelligence, domain),
        actionCount: 5,
        score: COMP_calculateOverallScore(categoryScores)
      };
      
    } catch (error) {
      Logger.log('Error generating overview for ' + domain + ': ' + error.toString());
    }
    
    result.competitors.push({
      domain: domain,
      metrics: metrics,
      rank: index + 1
    });
  });
  
  // Sort by overall score
  result.competitors.sort((a, b) => {
    const scoreA = a.metrics.overallScore ? a.metrics.overallScore.score : 0;
    const scoreB = b.metrics.overallScore ? b.metrics.overallScore.score : 0;
    return scoreB - scoreA;
  });
  
  // Update ranks
  result.competitors.forEach((comp, index) => {
    comp.rank = index + 1;
    if (comp.metrics.overallScore) {
      comp.metrics.overallScore.rank = index + 1;
    }
  });
  
  return result;
}


/**
 * Overview calculation helpers
 */
function COMP_calculateOverallScore(scores) {
  const allScores = Object.values(scores);
  return allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
}

function COMP_identifyStrengths(scores) {
  const strengths = [];
  if (scores.technical >= 70) strengths.push('Technical SEO');
  if (scores.content >= 70) strengths.push('Content Quality');
  if (scores.authority >= 70) strengths.push('Domain Authority');
  if (scores.brand >= 70) strengths.push('Brand Positioning');
  if (scores.distribution >= 70) strengths.push('Distribution');
  return strengths.join(', ') || 'Building foundation';
}

function COMP_getTopStrengths(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(s => s[0]).join(', ');
}

function COMP_identifyWeaknesses(scores) {
  const weaknesses = [];
  if (scores.technical < 60) weaknesses.push('Technical SEO');
  if (scores.content < 60) weaknesses.push('Content Strategy');
  if (scores.authority < 60) weaknesses.push('Link Building');
  if (scores.conversion < 60) weaknesses.push('Conversion Optimization');
  if (scores.geo < 60) weaknesses.push('AI Visibility');
  return weaknesses.join(', ') || 'Strong across all areas';
}

function COMP_getTopWeaknesses(scores) {
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  return sorted.slice(0, 3).map(s => s[0]).join(', ');
}

function COMP_assessCompetitivePosition(scores, rank) {
  const overall = COMP_calculateOverallScore(scores);
  if (overall >= 80) return 'Market Leader';
  if (overall >= 65) return 'Strong Challenger';
  if (overall >= 50) return 'Growing Competitor';
  return 'Emerging Player';
}

function COMP_getPositionTier(scores) {
  const overall = COMP_calculateOverallScore(scores);
  if (overall >= 80) return 'Tier 1';
  if (overall >= 65) return 'Tier 2';
  return 'Tier 3';
}

function COMP_calculateOpportunityIndex(intelligence, domain) {
  // Extract opportunity scores from strategic opportunities category
  if (intelligence.strategicOpportunities) {
    const comp = intelligence.strategicOpportunities.competitors.find(c => c.domain === domain);
    if (comp && comp.metrics) {
      return COMP_avgMetricScores(comp.metrics);
    }
  }
  return 50;
}

function COMP_assessThreatLevel(scores, rank) {
  const overall = COMP_calculateOverallScore(scores);
  if (rank === 0 && overall >= 80) return 'Dominant Threat';
  if (overall >= 70) return 'Major Threat';
  if (overall >= 55) return 'Moderate Threat';
  return 'Low Threat';
}

function COMP_calculateThreatScore(scores) {
  return COMP_calculateOverallScore(scores);
}

function COMP_generateRecommendations(scores, intelligence, domain) {
  const recommendations = [];
  
  if (scores.technical < 70) {
    recommendations.push('Improve Core Web Vitals and technical infrastructure');
  }
  if (scores.content < 70) {
    recommendations.push('Develop comprehensive content clusters and topical authority');
  }
  if (scores.authority < 70) {
    recommendations.push('Build high-quality backlinks from tier-1 publishers');
  }
  if (scores.geo < 70) {
    recommendations.push('Optimize for AI search engines and conversational queries');
  }
  if (scores.conversion < 70) {
    recommendations.push('Optimize conversion funnel and reduce friction points');
  }
  
  // If already strong, focus on maintaining lead
  if (recommendations.length === 0) {
    recommendations.push('Maintain market leadership through continuous innovation');
    recommendations.push('Expand into emerging content categories');
    recommendations.push('Strengthen competitive moat with proprietary data');
  }
  
  return recommendations.slice(0, 5);
}

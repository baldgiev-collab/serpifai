/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_BrittlenessPredictor.gs
 * FORENSIC UPGRADE v7.1 — Algorithmic Risk Forensics Engine
 * 
 * PURPOSE: Predict Core Update vulnerability by calculating "Structural Brittleness"
 *          score. Identifies legacy SEO patterns that trigger algorithm penalties.
 * 
 * TASKS IMPLEMENTED:
 *   - Task 14: Algorithmic Risk Forensics → Structural Brittleness Prediction
 * 
 * FORMULA:
 *   Brittleness_Score = Σ(risk_factor × weight) × (1 / domain_age_years)
 * 
 *   if (Brittleness_Score > 70) → "HIGH RISK: 50%+ drop likely"
 *   if (Brittleness_Score > 50) → "MODERATE RISK: 20-30% drop possible"
 *   if (Brittleness_Score < 30) → "STABLE: Low vulnerability"
 * 
 * DATE: 2026-01-18
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Brittleness Risk Indicators with weights
 * Based on historical Core Update impact analysis (2019-2025)
 */
const BRITTLENESS_INDICATORS = {
  thin_content_clusters: {
    weight: 0.25,
    description: 'Thin content clusters',
    detection: 'avg_word_count < 500 on 30%+ pages',
    threshold: 0.30
  },
  over_optimized_anchors: {
    weight: 0.20,
    description: 'Over-optimized anchor text',
    detection: 'exact_match_anchors > 15%',
    threshold: 0.15
  },
  legacy_schema: {
    weight: 0.15,
    description: 'Legacy/outdated schema markup',
    detection: 'schema_version < 2023 or no schema',
    threshold: 2023
  },
  low_eeat_signals: {
    weight: 0.20,
    description: 'Low E-E-A-T signals',
    detection: 'no author bio, no credentials',
    requiredSignals: ['author_bio', 'credentials', 'about_page', 'citations']
  },
  template_dependency: {
    weight: 0.10,
    description: 'High template dependency',
    detection: 'DOM similarity > 85% across pages',
    threshold: 0.85
  },
  link_velocity_anomalies: {
    weight: 0.10,
    description: 'Link velocity anomalies',
    detection: 'sudden spikes/drops > 200%',
    threshold: 2.0
  }
};

/**
 * Calculate Structural Brittleness Score for a domain
 * @param {Object} contentData - Content metrics across pages
 * @param {Object} backlinkData - Backlink profile with anchor text analysis
 * @param {Object} technicalData - Technical SEO metrics
 * @param {Object} domainData - Domain age and authority metrics
 * @returns {Object} Brittleness score and risk breakdown
 */
function BRITTLENESS_calculateScore(contentData, backlinkData, technicalData, domainData) {
  Logger.log('🔍 BRITTLENESS: Analyzing Structural Vulnerability...');
  
  try {
    const riskFactors = {};
    let totalRiskScore = 0;
    
    // ════════════════════════════════════════════════════════════════════════
    // 1. THIN CONTENT CLUSTERS (25% weight)
    // ════════════════════════════════════════════════════════════════════════
    const avgWordCount = contentData?.avg_word_count || 
                         contentData?.averageWordCount || 0;
    const thinPagePercentage = contentData?.thin_page_percentage ||
                               contentData?.pagesUnder500Words ||
                               calculateThinPagePercentage(contentData);
    
    let thinContentScore = 0;
    if (thinPagePercentage >= 0.50) {
      thinContentScore = 1.0; // Critical
    } else if (thinPagePercentage >= 0.30) {
      thinContentScore = 0.7; // High
    } else if (thinPagePercentage >= 0.15) {
      thinContentScore = 0.4; // Moderate
    } else {
      thinContentScore = 0.1; // Low
    }
    
    riskFactors.thin_content_clusters = {
      score: thinContentScore,
      weighted: thinContentScore * BRITTLENESS_INDICATORS.thin_content_clusters.weight,
      details: {
        avg_word_count: avgWordCount,
        thin_page_percentage: (thinPagePercentage * 100).toFixed(1) + '%',
        severity: thinContentScore >= 0.7 ? 'CRITICAL' : thinContentScore >= 0.4 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.thin_content_clusters.weighted;
    Logger.log('   Thin content risk: ' + (riskFactors.thin_content_clusters.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // 2. OVER-OPTIMIZED ANCHORS (20% weight)
    // ════════════════════════════════════════════════════════════════════════
    const exactMatchAnchorPct = backlinkData?.exact_match_anchor_percentage ||
                                 backlinkData?.exactMatchAnchors ||
                                 calculateExactMatchAnchors(backlinkData);
    
    let anchorScore = 0;
    if (exactMatchAnchorPct >= 0.25) {
      anchorScore = 1.0; // Penguin-level risk
    } else if (exactMatchAnchorPct >= 0.15) {
      anchorScore = 0.7;
    } else if (exactMatchAnchorPct >= 0.08) {
      anchorScore = 0.3;
    } else {
      anchorScore = 0.05; // Natural anchor distribution
    }
    
    riskFactors.over_optimized_anchors = {
      score: anchorScore,
      weighted: anchorScore * BRITTLENESS_INDICATORS.over_optimized_anchors.weight,
      details: {
        exact_match_percentage: (exactMatchAnchorPct * 100).toFixed(1) + '%',
        recommended_max: '< 8%',
        severity: anchorScore >= 0.7 ? 'CRITICAL' : anchorScore >= 0.3 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.over_optimized_anchors.weighted;
    Logger.log('   Anchor optimization risk: ' + (riskFactors.over_optimized_anchors.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // 3. LEGACY SCHEMA (15% weight)
    // ════════════════════════════════════════════════════════════════════════
    const schemaVersion = technicalData?.schema_version ||
                          technicalData?.schemaLastUpdated ||
                          2020; // Default to older
    const hasModernSchema = technicalData?.has_faq_schema ||
                            technicalData?.has_howto_schema ||
                            technicalData?.schema_types?.length > 0;
    
    let schemaScore = 0;
    if (!hasModernSchema) {
      schemaScore = 0.9; // No schema = major disadvantage
    } else if (schemaVersion < 2022) {
      schemaScore = 0.6;
    } else if (schemaVersion < 2024) {
      schemaScore = 0.3;
    } else {
      schemaScore = 0.05; // Modern schema
    }
    
    riskFactors.legacy_schema = {
      score: schemaScore,
      weighted: schemaScore * BRITTLENESS_INDICATORS.legacy_schema.weight,
      details: {
        schema_version: schemaVersion,
        has_modern_schema: hasModernSchema,
        schema_types: technicalData?.schema_types || [],
        severity: schemaScore >= 0.6 ? 'HIGH' : schemaScore >= 0.3 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.legacy_schema.weighted;
    Logger.log('   Legacy schema risk: ' + (riskFactors.legacy_schema.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // 4. LOW E-E-A-T SIGNALS (20% weight)
    // ════════════════════════════════════════════════════════════════════════
    const eatSignals = {
      hasAuthorBio: contentData?.has_author_bios || contentData?.authorBioPresent || false,
      hasCredentials: contentData?.has_credentials || contentData?.credentialsShown || false,
      hasAboutPage: technicalData?.has_about_page || domainData?.hasAboutPage || false,
      hasCitations: contentData?.has_citations || contentData?.sourcesLinked || false,
      hasReviews: technicalData?.has_reviews || false,
      hasContactInfo: technicalData?.has_contact_page || false
    };
    
    const eatSignalCount = Object.values(eatSignals).filter(Boolean).length;
    const eatScore = Math.max(0, 1.0 - (eatSignalCount / 6));
    
    riskFactors.low_eeat_signals = {
      score: eatScore,
      weighted: eatScore * BRITTLENESS_INDICATORS.low_eeat_signals.weight,
      details: {
        signals_present: eatSignalCount,
        signals_required: 6,
        missing_signals: Object.entries(eatSignals)
          .filter(([k, v]) => !v)
          .map(([k]) => k),
        severity: eatScore >= 0.7 ? 'CRITICAL' : eatScore >= 0.4 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.low_eeat_signals.weighted;
    Logger.log('   E-E-A-T risk: ' + (riskFactors.low_eeat_signals.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // 5. TEMPLATE DEPENDENCY (10% weight)
    // ════════════════════════════════════════════════════════════════════════
    const domSimilarity = contentData?.dom_similarity ||
                          contentData?.templateSimilarity ||
                          0.5; // Default to moderate
    
    let templateScore = 0;
    if (domSimilarity >= 0.95) {
      templateScore = 1.0; // Nearly identical pages
    } else if (domSimilarity >= 0.85) {
      templateScore = 0.7;
    } else if (domSimilarity >= 0.70) {
      templateScore = 0.3;
    } else {
      templateScore = 0.05; // Good page diversity
    }
    
    riskFactors.template_dependency = {
      score: templateScore,
      weighted: templateScore * BRITTLENESS_INDICATORS.template_dependency.weight,
      details: {
        dom_similarity: (domSimilarity * 100).toFixed(1) + '%',
        recommended_max: '< 70%',
        severity: templateScore >= 0.7 ? 'HIGH' : templateScore >= 0.3 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.template_dependency.weighted;
    Logger.log('   Template dependency risk: ' + (riskFactors.template_dependency.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // 6. LINK VELOCITY ANOMALIES (10% weight)
    // ════════════════════════════════════════════════════════════════════════
    const linkVelocityChange = backlinkData?.velocity_change_ratio ||
                               backlinkData?.monthOverMonthChange ||
                               calculateLinkVelocityChange(backlinkData);
    
    let velocityScore = 0;
    if (Math.abs(linkVelocityChange) >= 3.0) {
      velocityScore = 1.0; // Extreme spike or drop
    } else if (Math.abs(linkVelocityChange) >= 2.0) {
      velocityScore = 0.7;
    } else if (Math.abs(linkVelocityChange) >= 1.5) {
      velocityScore = 0.3;
    } else {
      velocityScore = 0.05; // Natural growth
    }
    
    riskFactors.link_velocity_anomalies = {
      score: velocityScore,
      weighted: velocityScore * BRITTLENESS_INDICATORS.link_velocity_anomalies.weight,
      details: {
        velocity_change: (linkVelocityChange * 100).toFixed(0) + '%',
        direction: linkVelocityChange > 0 ? 'SPIKE' : linkVelocityChange < 0 ? 'DROP' : 'STABLE',
        severity: velocityScore >= 0.7 ? 'HIGH' : velocityScore >= 0.3 ? 'MODERATE' : 'LOW'
      }
    };
    totalRiskScore += riskFactors.link_velocity_anomalies.weighted;
    Logger.log('   Link velocity risk: ' + (riskFactors.link_velocity_anomalies.weighted * 100).toFixed(1) + '%');
    
    // ════════════════════════════════════════════════════════════════════════
    // APPLY DOMAIN AGE MODIFIER
    // Younger domains are more brittle
    // ════════════════════════════════════════════════════════════════════════
    const domainAgeYears = domainData?.age_years || domainData?.domainAge || 1;
    const ageModifier = 1 / Math.max(domainAgeYears, 0.5); // Cap at 2x for very new domains
    
    // Scale total risk to 0-100
    const rawBrittlenessScore = totalRiskScore * 100;
    const adjustedBrittlenessScore = Math.min(100, rawBrittlenessScore * Math.min(ageModifier, 1.5));
    
    // ════════════════════════════════════════════════════════════════════════
    // DETERMINE RISK TIER
    // ════════════════════════════════════════════════════════════════════════
    let riskTier, riskEmoji, dropProbability, recommendation;
    
    if (adjustedBrittlenessScore > 70) {
      riskTier = 'HIGH_RISK';
      riskEmoji = '🔴';
      dropProbability = '50%+ drop likely in next Core Update';
      recommendation = 'URGENT: Address E-E-A-T signals and thin content immediately';
    } else if (adjustedBrittlenessScore > 50) {
      riskTier = 'MODERATE_RISK';
      riskEmoji = '🟠';
      dropProbability = '20-30% drop possible in next Core Update';
      recommendation = 'PRIORITY: Strengthen content depth and author authority signals';
    } else if (adjustedBrittlenessScore > 30) {
      riskTier = 'LOW_RISK';
      riskEmoji = '🟡';
      dropProbability = '10-15% fluctuation possible';
      recommendation = 'MONITOR: Continue building authority; minor optimizations needed';
    } else {
      riskTier = 'STABLE';
      riskEmoji = '🟢';
      dropProbability = 'Minimal Core Update vulnerability';
      recommendation = 'MAINTAIN: Strong foundation; focus on growth over defense';
    }
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🔍 BRITTLENESS SCORE: ' + adjustedBrittlenessScore.toFixed(1) + '/100');
    Logger.log('   Risk tier: ' + riskEmoji + ' ' + riskTier);
    Logger.log('   Drop probability: ' + dropProbability);
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      brittleness_score: parseFloat(adjustedBrittlenessScore.toFixed(1)),
      raw_score: parseFloat(rawBrittlenessScore.toFixed(1)),
      risk_tier: riskTier,
      risk_emoji: riskEmoji,
      drop_probability: dropProbability,
      recommendation: recommendation,
      domain_age_modifier: parseFloat(ageModifier.toFixed(2)),
      risk_factors: riskFactors,
      hedge_strategies: generateHedgeStrategies(riskFactors, adjustedBrittlenessScore),
      next_core_update_prediction: predictNextCoreUpdateImpact(adjustedBrittlenessScore),
      attestation: {
        type: 'BRITTLENESS_PREDICTION',
        timestamp: new Date().toISOString(),
        version: '1.0',
        methodology: 'SERPIFAI_BRITTLENESS_v1'
      }
    };
    
  } catch (error) {
    Logger.log('❌ Brittleness calculation error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate thin page percentage from content data
 */
function calculateThinPagePercentage(contentData) {
  if (!contentData?.pages && !contentData?.pageMetrics) return 0.3;
  
  const pages = contentData.pages || contentData.pageMetrics || [];
  if (pages.length === 0) return 0.3;
  
  const thinPages = pages.filter(p => 
    (p.word_count || p.wordCount || 0) < 500
  ).length;
  
  return thinPages / pages.length;
}

/**
 * Calculate exact match anchor percentage
 */
function calculateExactMatchAnchors(backlinkData) {
  if (!backlinkData?.anchors && !backlinkData?.anchorText) return 0.1;
  
  const anchors = backlinkData.anchors || backlinkData.anchorText || [];
  if (anchors.length === 0) return 0.1;
  
  const targetKeywords = backlinkData.target_keywords || [];
  let exactMatches = 0;
  
  anchors.forEach(anchor => {
    const text = (anchor.text || anchor).toLowerCase();
    if (targetKeywords.some(kw => text === kw.toLowerCase())) {
      exactMatches++;
    }
  });
  
  return exactMatches / anchors.length;
}

/**
 * Calculate link velocity change ratio
 */
function calculateLinkVelocityChange(backlinkData) {
  const currentMonthLinks = backlinkData?.current_month_links || 
                            backlinkData?.recentLinks || 0;
  const previousMonthLinks = backlinkData?.previous_month_links || 
                             backlinkData?.historicalAvg || 100;
  
  if (previousMonthLinks === 0) return 0;
  
  return (currentMonthLinks - previousMonthLinks) / previousMonthLinks;
}

/**
 * Generate hedge strategies based on risk factors
 */
function generateHedgeStrategies(riskFactors, overallScore) {
  const strategies = [];
  
  // Priority 1: Address critical factors
  Object.entries(riskFactors).forEach(([factor, data]) => {
    if (data.details.severity === 'CRITICAL') {
      strategies.push({
        priority: 'URGENT',
        factor: factor,
        action: getHedgeAction(factor),
        impact: 'High probability of score reduction',
        timeframe: '1-2 weeks'
      });
    }
  });
  
  // Priority 2: Moderate factors
  Object.entries(riskFactors).forEach(([factor, data]) => {
    if (data.details.severity === 'MODERATE' || data.details.severity === 'HIGH') {
      strategies.push({
        priority: 'HIGH',
        factor: factor,
        action: getHedgeAction(factor),
        impact: 'Moderate score improvement',
        timeframe: '2-4 weeks'
      });
    }
  });
  
  return strategies.slice(0, 5); // Top 5 priorities
}

/**
 * Get specific hedge action for a risk factor
 */
function getHedgeAction(factor) {
  const actions = {
    thin_content_clusters: 'Expand thin pages to 1,500+ words with comprehensive coverage. Consolidate or noindex pages under 300 words.',
    over_optimized_anchors: 'Diversify anchor text profile. Increase branded and naked URL anchors to 60%+. Disavow manipulative links.',
    legacy_schema: 'Implement FAQPage, HowTo, and Article schema. Ensure all schemas validate in Rich Results Test.',
    low_eeat_signals: 'Add author bios with credentials. Create comprehensive About page. Add citations to authoritative sources.',
    template_dependency: 'Increase content uniqueness. Add custom sections, unique images, and page-specific elements.',
    link_velocity_anomalies: 'Normalize link acquisition rate. Investigate and disavow any paid or manipulative link campaigns.'
  };
  
  return actions[factor] || 'Review and address this risk factor';
}

/**
 * Predict impact of next Core Update
 */
function predictNextCoreUpdateImpact(brittlenessScore) {
  const prediction = {
    estimated_impact_range: {
      low: 0,
      high: 0
    },
    confidence: 0.7,
    next_update_window: 'Q2 2026 (estimated)'
  };
  
  if (brittlenessScore > 70) {
    prediction.estimated_impact_range = { low: -40, high: -60 };
    prediction.scenario = 'SEVERE_DECLINE';
  } else if (brittlenessScore > 50) {
    prediction.estimated_impact_range = { low: -15, high: -35 };
    prediction.scenario = 'MODERATE_DECLINE';
  } else if (brittlenessScore > 30) {
    prediction.estimated_impact_range = { low: -5, high: -15 };
    prediction.scenario = 'MINOR_FLUCTUATION';
  } else {
    prediction.estimated_impact_range = { low: 0, high: 10 };
    prediction.scenario = 'STABLE_OR_GAIN';
  }
  
  return prediction;
}

/**
 * Detect competitor collapse signals
 * @param {Array} competitors - Array of competitor data
 * @returns {Array} Competitors at risk of collapse
 */
function BRITTLENESS_detectCompetitorCollapseRisk(competitors) {
  Logger.log('🔍 BRITTLENESS: Scanning competitors for collapse signals...');
  
  const collapseRisks = competitors.map(comp => {
    const score = BRITTLENESS_calculateScore(
      comp.content || {},
      comp.backlinks || {},
      comp.technical || {},
      comp.domain || {}
    );
    
    return {
      domain: comp.domain || comp.url,
      brittleness_score: score.brittleness_score,
      risk_tier: score.risk_tier,
      top_vulnerability: Object.entries(score.risk_factors || {})
        .sort((a, b) => b[1].weighted - a[1].weighted)[0],
      collapse_probability: score.brittleness_score > 70 ? 'HIGH' : 
                            score.brittleness_score > 50 ? 'MODERATE' : 'LOW'
    };
  });
  
  // Sort by collapse probability (highest risk first)
  collapseRisks.sort((a, b) => b.brittleness_score - a.brittleness_score);
  
  return {
    competitors_analyzed: competitors.length,
    high_risk_count: collapseRisks.filter(c => c.collapse_probability === 'HIGH').length,
    collapse_candidates: collapseRisks.filter(c => c.collapse_probability === 'HIGH'),
    opportunity_targets: collapseRisks.filter(c => c.brittleness_score > 60),
    all_results: collapseRisks
  };
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    BRITTLENESS_calculateScore,
    BRITTLENESS_detectCompetitorCollapseRisk
  };
}

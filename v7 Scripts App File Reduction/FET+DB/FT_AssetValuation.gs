/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_AssetValuation.gs
 * FORENSIC UPGRADE v7.1 — Digital Asset Valuation Engine
 * 
 * PURPOSE: Calculate the replacement cost and organic trust value of digital assets.
 *          Produces CFO-ready evidence packs for board presentations and M&A due diligence.
 * 
 * TASKS IMPLEMENTED:
 *   - Task 12: Digital Asset Valuation → CFO Evidence Pack
 *   - Task 2.2: M&A Due Diligence Score
 * 
 * FORMULAS:
 *   Organic_Trust_Value = (annual_organic_traffic × avg_cpc × 12) × moat_stability_multiplier
 *   
 *   Replacement_Cost = (
 *     (content_pieces × avg_creation_cost) +
 *     (backlinks × avg_acquisition_cost) +
 *     (brand_mentions × avg_pr_cost) +
 *     (time_to_rank_years × opportunity_cost)
 *   )
 * 
 * DATE: 2026-01-18
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Calculate Organic Trust Value for a domain
 * @param {Object} trafficData - Traffic metrics from analytics
 * @param {Object} keywordData - Keyword rankings and CPCs
 * @param {Object} domainData - Domain age, backlinks, authority
 * @returns {Object} Valuation breakdown
 */
function ASSET_calculateOrganicTrustValue(trafficData, keywordData, domainData) {
  Logger.log('💰 ASSET: Calculating Organic Trust Value...');
  
  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. EXTRACT CORE METRICS
    // ════════════════════════════════════════════════════════════════════════
    const monthlyOrganicTraffic = trafficData?.monthly_organic || 
                                   trafficData?.monthlyOrganic ||
                                   trafficData?.organic_traffic || 0;
    const annualOrganicTraffic = monthlyOrganicTraffic * 12;
    
    // Average CPC from ranked keywords
    const avgCPC = keywordData?.avg_cpc || 
                   keywordData?.averageCpc ||
                   calculateWeightedCPC(keywordData?.keywords) || 2.50;
    
    // Domain age for moat calculation
    const domainAgeYears = domainData?.age_years ||
                           domainData?.domainAge ||
                           calculateDomainAge(domainData?.created_date) || 1;
    
    Logger.log('   Annual organic traffic: ' + annualOrganicTraffic.toLocaleString());
    Logger.log('   Average CPC: $' + avgCPC.toFixed(2));
    Logger.log('   Domain age: ' + domainAgeYears + ' years');
    
    // ════════════════════════════════════════════════════════════════════════
    // 2. CALCULATE MOAT STABILITY MULTIPLIER (1.0–3.0x)
    // ════════════════════════════════════════════════════════════════════════
    const moatFactors = calculateMoatStabilityMultiplier(domainData, keywordData, trafficData);
    
    // ════════════════════════════════════════════════════════════════════════
    // 3. CALCULATE ORGANIC TRUST VALUE
    // ════════════════════════════════════════════════════════════════════════
    const baseValue = annualOrganicTraffic * avgCPC;
    const organicTrustValue = baseValue * moatFactors.multiplier;
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('💰 ORGANIC TRUST VALUE: $' + organicTrustValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }));
    Logger.log('   Base value: $' + baseValue.toLocaleString());
    Logger.log('   Moat multiplier: ' + moatFactors.multiplier.toFixed(2) + 'x');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      organic_trust_value: Math.round(organicTrustValue),
      base_value: Math.round(baseValue),
      annual_organic_traffic: annualOrganicTraffic,
      avg_cpc: avgCPC,
      moat_multiplier: moatFactors.multiplier,
      moat_breakdown: moatFactors.breakdown,
      valuation_tier: getValuationTier(organicTrustValue),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Organic Trust Value calculation error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate Replacement Cost of digital assets
 * @param {Object} contentData - Content inventory
 * @param {Object} backlinkData - Backlink profile
 * @param {Object} brandData - Brand mentions and PR
 * @param {Object} rankingData - Current rankings and time-to-rank history
 * @returns {Object} Replacement cost breakdown
 */
function ASSET_calculateReplacementCost(contentData, backlinkData, brandData, rankingData) {
  Logger.log('🏗️ ASSET: Calculating Replacement Cost...');
  
  try {
    // ════════════════════════════════════════════════════════════════════════
    // INDUSTRY BENCHMARKS (2026 rates)
    // ════════════════════════════════════════════════════════════════════════
    const benchmarks = {
      content_creation: {
        blog_post_avg: 500,        // $500 per quality blog post
        landing_page: 1500,        // $1,500 per landing page
        pillar_content: 3000,      // $3,000 per pillar/cornerstone
        product_page: 800,         // $800 per product page
        video_content: 2500        // $2,500 per video
      },
      backlink_acquisition: {
        editorial_link: 350,       // $350 per editorial/earned link
        guest_post: 250,           // $250 per guest post link
        directory_link: 50,        // $50 per directory link
        high_authority_link: 800   // $800 per DA 70+ link
      },
      brand_pr: {
        press_release: 500,        // $500 per press release
        media_mention: 1000,       // $1,000 per media mention
        podcast_feature: 750,      // $750 per podcast appearance
        industry_award: 5000       // $5,000 per award/recognition
      },
      opportunity_cost: {
        monthly_rate: 8000,        // $8,000/month team opportunity cost
        time_to_rank_penalty: 1.5  // 1.5x multiplier for competitive niches
      }
    };
    
    // ════════════════════════════════════════════════════════════════════════
    // 1. CONTENT REPLACEMENT COST
    // ════════════════════════════════════════════════════════════════════════
    const contentPieces = contentData?.total_pages || contentData?.pageCount || 0;
    const pillarCount = contentData?.pillar_pages || contentData?.cornerstone || 0;
    const blogCount = contentData?.blog_posts || Math.max(0, contentPieces - pillarCount);
    
    const contentCost = 
      (pillarCount * benchmarks.content_creation.pillar_content) +
      (blogCount * benchmarks.content_creation.blog_post_avg);
    
    Logger.log('   Content cost: $' + contentCost.toLocaleString() + 
               ' (' + contentPieces + ' pieces)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 2. BACKLINK REPLACEMENT COST
    // ════════════════════════════════════════════════════════════════════════
    const totalBacklinks = backlinkData?.total_backlinks || 
                           backlinkData?.backlink_count || 0;
    const highAuthorityLinks = backlinkData?.high_authority_count || 
                               Math.round(totalBacklinks * 0.1);
    const editorialLinks = backlinkData?.editorial_count || 
                           Math.round(totalBacklinks * 0.3);
    const otherLinks = Math.max(0, totalBacklinks - highAuthorityLinks - editorialLinks);
    
    const backlinkCost = 
      (highAuthorityLinks * benchmarks.backlink_acquisition.high_authority_link) +
      (editorialLinks * benchmarks.backlink_acquisition.editorial_link) +
      (otherLinks * benchmarks.backlink_acquisition.guest_post);
    
    Logger.log('   Backlink cost: $' + backlinkCost.toLocaleString() + 
               ' (' + totalBacklinks + ' links)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 3. BRAND/PR REPLACEMENT COST
    // ════════════════════════════════════════════════════════════════════════
    const brandMentions = brandData?.total_mentions || 
                          brandData?.mentionCount || 0;
    const mediaMentions = brandData?.media_mentions || 
                          Math.round(brandMentions * 0.2);
    const pressCoverage = brandData?.press_releases || 
                          Math.round(brandMentions * 0.1);
    
    const brandCost = 
      (mediaMentions * benchmarks.brand_pr.media_mention) +
      (pressCoverage * benchmarks.brand_pr.press_release);
    
    Logger.log('   Brand/PR cost: $' + brandCost.toLocaleString() + 
               ' (' + brandMentions + ' mentions)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 4. TIME-TO-RANK OPPORTUNITY COST
    // ════════════════════════════════════════════════════════════════════════
    const timeToRankYears = rankingData?.avg_time_to_rank_years || 
                            rankingData?.timeToRank || 2;
    const competitiveMultiplier = rankingData?.is_competitive ? 
                                   benchmarks.opportunity_cost.time_to_rank_penalty : 1;
    
    const opportunityCost = 
      (timeToRankYears * 12 * benchmarks.opportunity_cost.monthly_rate) * 
      competitiveMultiplier;
    
    Logger.log('   Opportunity cost: $' + opportunityCost.toLocaleString() + 
               ' (' + timeToRankYears + ' years to replicate)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 5. TOTAL REPLACEMENT COST
    // ════════════════════════════════════════════════════════════════════════
    const totalReplacementCost = contentCost + backlinkCost + brandCost + opportunityCost;
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🏗️ TOTAL REPLACEMENT COST: $' + totalReplacementCost.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }));
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      total_replacement_cost: Math.round(totalReplacementCost),
      breakdown: {
        content: {
          cost: Math.round(contentCost),
          pieces: contentPieces,
          pillar_count: pillarCount,
          blog_count: blogCount
        },
        backlinks: {
          cost: Math.round(backlinkCost),
          total: totalBacklinks,
          high_authority: highAuthorityLinks,
          editorial: editorialLinks
        },
        brand_pr: {
          cost: Math.round(brandCost),
          total_mentions: brandMentions,
          media_mentions: mediaMentions
        },
        opportunity_cost: {
          cost: Math.round(opportunityCost),
          years_to_replicate: timeToRankYears,
          competitive_multiplier: competitiveMultiplier
        }
      },
      benchmarks_used: benchmarks,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Replacement Cost calculation error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate Moat Stability Multiplier (1.0–3.0x)
 * @param {Object} domainData - Domain metrics
 * @param {Object} keywordData - Keyword diversity
 * @param {Object} trafficData - Traffic stability
 * @returns {Object} Multiplier and breakdown
 */
function calculateMoatStabilityMultiplier(domainData, keywordData, trafficData) {
  const factors = {
    domain_age: { score: 0, weight: 0.15, max: 0.30 },
    backlink_diversity: { score: 0, weight: 0.20, max: 0.30 },
    content_velocity: { score: 0, weight: 0.15, max: 0.20 },
    schema_coverage: { score: 0, weight: 0.20, max: 0.20 },
    eeat_signals: { score: 0, weight: 0.30, max: 0.30 }
  };
  
  // Domain Age Factor (older = more stable)
  const ageYears = domainData?.age_years || domainData?.domainAge || 1;
  if (ageYears >= 10) {
    factors.domain_age.score = 0.30;
  } else if (ageYears >= 5) {
    factors.domain_age.score = 0.20;
  } else if (ageYears >= 2) {
    factors.domain_age.score = 0.10;
  } else {
    factors.domain_age.score = 0.05;
  }
  
  // Backlink Diversity Factor
  const referringDomains = domainData?.referring_domains || domainData?.refDomains || 0;
  const backlinkConcentration = domainData?.top_domain_percentage || 0.5;
  if (referringDomains > 1000 && backlinkConcentration < 0.1) {
    factors.backlink_diversity.score = 0.30;
  } else if (referringDomains > 500 && backlinkConcentration < 0.2) {
    factors.backlink_diversity.score = 0.20;
  } else if (referringDomains > 100) {
    factors.backlink_diversity.score = 0.10;
  } else {
    factors.backlink_diversity.score = 0.05;
  }
  
  // Content Velocity Factor (consistent publishing = stable)
  const monthlyPublishing = trafficData?.avg_monthly_content || 0;
  if (monthlyPublishing >= 8) {
    factors.content_velocity.score = 0.20;
  } else if (monthlyPublishing >= 4) {
    factors.content_velocity.score = 0.15;
  } else if (monthlyPublishing >= 2) {
    factors.content_velocity.score = 0.10;
  } else {
    factors.content_velocity.score = 0.05;
  }
  
  // Schema Coverage Factor
  const schemaTypes = domainData?.schema_types?.length || 0;
  if (schemaTypes >= 5) {
    factors.schema_coverage.score = 0.20;
  } else if (schemaTypes >= 3) {
    factors.schema_coverage.score = 0.15;
  } else if (schemaTypes >= 1) {
    factors.schema_coverage.score = 0.10;
  } else {
    factors.schema_coverage.score = 0.02;
  }
  
  // E-E-A-T Signals Factor
  const hasAuthorBios = domainData?.has_author_bios || false;
  const hasCredentials = domainData?.has_credentials || false;
  const hasAboutPage = domainData?.has_about_page || false;
  const hasCitations = domainData?.has_citations || false;
  const eatSignals = [hasAuthorBios, hasCredentials, hasAboutPage, hasCitations]
    .filter(Boolean).length;
  factors.eeat_signals.score = (eatSignals / 4) * 0.30;
  
  // Calculate total multiplier (base 1.0 + factors = 1.0 to 3.0)
  const totalAddition = Object.values(factors).reduce((sum, f) => sum + f.score, 0);
  const multiplier = Math.min(1.0 + totalAddition, 3.0);
  
  return {
    multiplier: parseFloat(multiplier.toFixed(2)),
    breakdown: factors
  };
}

/**
 * Calculate weighted CPC from keyword list
 */
function calculateWeightedCPC(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) return 2.50;
  
  let totalValue = 0;
  let totalVolume = 0;
  
  keywords.forEach(kw => {
    const volume = kw.volume || kw.search_volume || 100;
    const cpc = kw.cpc || kw.avg_cpc || 1.00;
    totalValue += volume * cpc;
    totalVolume += volume;
  });
  
  return totalVolume > 0 ? totalValue / totalVolume : 2.50;
}

/**
 * Calculate domain age from creation date
 */
function calculateDomainAge(createdDate) {
  if (!createdDate) return 1;
  const created = new Date(createdDate);
  const now = new Date();
  const years = (now - created) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(1, Math.round(years * 10) / 10);
}

/**
 * Get valuation tier label
 */
function getValuationTier(value) {
  if (value >= 10000000) return { tier: 'ENTERPRISE', emoji: '🏢', label: '$10M+' };
  if (value >= 1000000) return { tier: 'PREMIUM', emoji: '💎', label: '$1M+' };
  if (value >= 500000) return { tier: 'ESTABLISHED', emoji: '🏆', label: '$500K+' };
  if (value >= 100000) return { tier: 'GROWING', emoji: '📈', label: '$100K+' };
  if (value >= 25000) return { tier: 'EMERGING', emoji: '🌱', label: '$25K+' };
  return { tier: 'NASCENT', emoji: '🌱', label: '<$25K' };
}

/**
 * Generate CFO Evidence Pack — Board-ready PDF data
 * @param {string} domain - Target domain
 * @param {Object} allData - Combined analytics data
 * @returns {Object} CFO-ready evidence pack
 */
function ASSET_generateCFOEvidencePack(domain, allData) {
  Logger.log('📊 ASSET: Generating CFO Evidence Pack for ' + domain);
  
  const organicValue = ASSET_calculateOrganicTrustValue(
    allData.traffic,
    allData.keywords,
    allData.domain
  );
  
  const replacementCost = ASSET_calculateReplacementCost(
    allData.content,
    allData.backlinks,
    allData.brand,
    allData.rankings
  );
  
  // M&A Due Diligence Score (0-100)
  const dueDiligenceScore = calculateMADueDiligenceScore(allData, organicValue, replacementCost);
  
  return {
    domain: domain,
    generated_at: new Date().toISOString(),
    executive_summary: {
      organic_trust_value: organicValue.organic_trust_value,
      replacement_cost: replacementCost.total_replacement_cost,
      ma_due_diligence_score: dueDiligenceScore.score,
      risk_level: dueDiligenceScore.risk_level,
      recommendation: dueDiligenceScore.recommendation
    },
    valuation_details: organicValue,
    replacement_analysis: replacementCost,
    due_diligence: dueDiligenceScore,
    trust_ledger: {
      type: 'TRUST_LEDGER',
      attestation_id: Utilities.getUuid(),
      domain: domain,
      valuation_timestamp: new Date().toISOString(),
      methodology: 'SERPIFAI_ASSET_VALUATION_v1',
      confidence_level: 0.85
    }
  };
}

/**
 * Calculate M&A Due Diligence Score
 */
function calculateMADueDiligenceScore(data, organicValue, replacementCost) {
  let score = 50; // Base score
  const flags = [];
  
  // Positive factors
  if (organicValue.moat_multiplier >= 2.0) {
    score += 15;
  } else if (organicValue.moat_multiplier >= 1.5) {
    score += 10;
  }
  
  if (data.domain?.age_years >= 5) score += 10;
  if (data.backlinks?.referring_domains > 500) score += 10;
  if (data.traffic?.trend === 'growing') score += 10;
  
  // Risk factors
  if (organicValue.organic_trust_value < replacementCost.total_replacement_cost * 0.5) {
    score -= 15;
    flags.push('Organic value below 50% of replacement cost');
  }
  
  if (data.domain?.age_years < 2) {
    score -= 10;
    flags.push('Domain age under 2 years');
  }
  
  if (data.traffic?.trend === 'declining') {
    score -= 15;
    flags.push('Traffic in decline');
  }
  
  if (data.backlinks?.spam_score > 30) {
    score -= 10;
    flags.push('High backlink spam score');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let riskLevel, recommendation;
  if (score >= 80) {
    riskLevel = 'LOW';
    recommendation = 'Strong acquisition candidate with stable moat';
  } else if (score >= 60) {
    riskLevel = 'MODERATE';
    recommendation = 'Viable acquisition with manageable risks';
  } else if (score >= 40) {
    riskLevel = 'ELEVATED';
    recommendation = 'Proceed with caution; significant due diligence required';
  } else {
    riskLevel = 'HIGH';
    recommendation = 'Not recommended for acquisition without major restructuring';
  }
  
  return {
    score: score,
    risk_level: riskLevel,
    recommendation: recommendation,
    risk_flags: flags,
    positive_factors: score >= 60 ? [
      'Established organic presence',
      'Diversified traffic sources'
    ] : []
  };
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    ASSET_calculateOrganicTrustValue,
    ASSET_calculateReplacementCost,
    ASSET_generateCFOEvidencePack
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_AEO_CitationMatrix.gs
 * FORENSIC UPGRADE v7.1 — Algorithmic Engine Optimization (AEO) Citation Matrix
 * 
 * PURPOSE: Calculate Algorithmic Cite-ability Score (0.0–1.0) predicting how likely
 *          AI models (GPT, Gemini, Claude, Perplexity) will cite a page as a source.
 * 
 * TASKS IMPLEMENTED:
 *   - Task 11: AEO Citation Matrix → Algorithmic Cite-ability (0–1.0)
 *   - Task 4.2: Algorithmic Attestation proprietary term
 * 
 * FORMULA:
 *   Algorithmic_Citeability = (
 *     (entity_density × 0.30) +
 *     (schema_coverage × 0.25) +
 *     (semantic_triplet_count × 0.20) +
 *     (faq_presence × 0.15) +
 *     (freshness_signal × 0.10)
 *   )
 * 
 * DATE: 2026-01-18
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Calculate Algorithmic Cite-ability Score for a URL
 * @param {Object} contentData - Content intelligence data from FT_ContentIntelligence.gs
 * @param {Object} technicalData - Technical SEO data from FT_Technical*.gs
 * @returns {Object} AEO score breakdown
 */
function AEO_calculateCiteability(contentData, technicalData) {
  Logger.log('📊 AEO: Calculating Algorithmic Cite-ability Score...');
  
  const metrics = {
    entity_density: 0,
    schema_coverage: 0,
    semantic_triplet_count: 0,
    faq_presence: 0,
    freshness_signal: 0
  };
  
  const weights = {
    entity_density: 0.30,
    schema_coverage: 0.25,
    semantic_triplet_count: 0.20,
    faq_presence: 0.15,
    freshness_signal: 0.10
  };
  
  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. ENTITY DENSITY (0.0–1.0)
    // Formula: (named_entities / total_words) × semantic_coherence_multiplier
    // Target: 0.05–0.15 entities per word is optimal for AI citation
    // ════════════════════════════════════════════════════════════════════════
    const wordCount = contentData?.word_count || contentData?.wordCount || 0;
    const entityCount = contentData?.named_entities?.length || 
                        contentData?.entities?.length || 
                        contentData?.entityCount || 0;
    
    if (wordCount > 0 && entityCount > 0) {
      const rawDensity = entityCount / wordCount;
      // Optimal range: 0.05-0.15 entities per word
      // Below 0.02 = too generic, above 0.20 = keyword stuffing
      if (rawDensity >= 0.05 && rawDensity <= 0.15) {
        metrics.entity_density = 1.0;
      } else if (rawDensity >= 0.02 && rawDensity < 0.05) {
        metrics.entity_density = rawDensity / 0.05;
      } else if (rawDensity > 0.15 && rawDensity <= 0.20) {
        metrics.entity_density = 1.0 - ((rawDensity - 0.15) / 0.05);
      } else {
        metrics.entity_density = 0.2; // Penalty for extreme values
      }
    }
    Logger.log('   Entity density: ' + metrics.entity_density.toFixed(3));
    
    // ════════════════════════════════════════════════════════════════════════
    // 2. SCHEMA COVERAGE (0.0–1.0)
    // Checks for structured data that AI models can parse
    // High value schemas: FAQPage, HowTo, Article, Product, Organization
    // ════════════════════════════════════════════════════════════════════════
    const schemaTypes = technicalData?.schema_types || 
                        technicalData?.schemaTypes || 
                        contentData?.structured_data || [];
    
    const highValueSchemas = [
      'FAQPage', 'HowTo', 'Article', 'NewsArticle', 'BlogPosting',
      'Product', 'Review', 'Organization', 'Person', 'Event',
      'Recipe', 'VideoObject', 'Course', 'Book', 'LocalBusiness'
    ];
    
    const foundSchemas = Array.isArray(schemaTypes) ? schemaTypes : [];
    const matchedSchemas = foundSchemas.filter(s => 
      highValueSchemas.some(hs => s.toLowerCase().includes(hs.toLowerCase()))
    );
    
    // Score based on schema diversity (max 5 different schemas = 1.0)
    metrics.schema_coverage = Math.min(matchedSchemas.length / 5, 1.0);
    
    // Bonus for FAQPage or HowTo (highly cited by AI)
    if (foundSchemas.some(s => /faq|howto/i.test(s))) {
      metrics.schema_coverage = Math.min(metrics.schema_coverage + 0.2, 1.0);
    }
    Logger.log('   Schema coverage: ' + metrics.schema_coverage.toFixed(3) + 
               ' (' + matchedSchemas.length + ' high-value schemas)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 3. SEMANTIC TRIPLET COUNT (0.0–1.0)
    // Measures subject-predicate-object relationships AI can extract
    // More triplets = more quotable facts
    // ════════════════════════════════════════════════════════════════════════
    const tripletCount = contentData?.semantic_triplets?.length ||
                         contentData?.triplets?.length ||
                         contentData?.factCount ||
                         estimateTripletCount(contentData);
    
    // Target: 10-50 extractable triplets per 1000 words
    const normalizedWordCount = Math.max(wordCount, 1);
    const tripletsPerK = (tripletCount / normalizedWordCount) * 1000;
    
    if (tripletsPerK >= 10 && tripletsPerK <= 50) {
      metrics.semantic_triplet_count = 1.0;
    } else if (tripletsPerK < 10) {
      metrics.semantic_triplet_count = tripletsPerK / 10;
    } else {
      metrics.semantic_triplet_count = Math.max(0.5, 1.0 - ((tripletsPerK - 50) / 100));
    }
    Logger.log('   Semantic triplets: ' + metrics.semantic_triplet_count.toFixed(3) + 
               ' (' + tripletCount + ' triplets, ' + tripletsPerK.toFixed(1) + '/1K words)');
    
    // ════════════════════════════════════════════════════════════════════════
    // 4. FAQ PRESENCE (0.0–1.0)
    // Explicit Q&A content is highly cited by AI assistants
    // ════════════════════════════════════════════════════════════════════════
    const hasFaqSchema = foundSchemas.some(s => /faq/i.test(s));
    const faqCount = contentData?.faq_count || contentData?.faqCount || 0;
    const hasQAContent = contentData?.has_qa_content || 
                         contentData?.questionPatterns?.length > 0 ||
                         detectQAPatterns(contentData);
    
    if (hasFaqSchema && faqCount >= 5) {
      metrics.faq_presence = 1.0;
    } else if (hasFaqSchema || faqCount >= 3) {
      metrics.faq_presence = 0.8;
    } else if (hasQAContent || faqCount >= 1) {
      metrics.faq_presence = 0.5;
    } else {
      metrics.faq_presence = 0.1;
    }
    Logger.log('   FAQ presence: ' + metrics.faq_presence.toFixed(3));
    
    // ════════════════════════════════════════════════════════════════════════
    // 5. FRESHNESS SIGNAL (0.0–1.0)
    // Recent content with update signals is preferred by AI
    // ════════════════════════════════════════════════════════════════════════
    const lastModified = contentData?.last_modified || 
                         technicalData?.lastModified ||
                         contentData?.dateModified;
    const publishDate = contentData?.publish_date ||
                        contentData?.datePublished;
    
    const now = new Date();
    let freshnessScore = 0.3; // Default for unknown dates
    
    if (lastModified || publishDate) {
      const dateToCheck = new Date(lastModified || publishDate);
      const daysSinceUpdate = (now - dateToCheck) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate <= 30) {
        freshnessScore = 1.0;
      } else if (daysSinceUpdate <= 90) {
        freshnessScore = 0.85;
      } else if (daysSinceUpdate <= 180) {
        freshnessScore = 0.7;
      } else if (daysSinceUpdate <= 365) {
        freshnessScore = 0.5;
      } else if (daysSinceUpdate <= 730) {
        freshnessScore = 0.3;
      } else {
        freshnessScore = 0.15;
      }
    }
    
    // Bonus for "Updated:" signal in content
    if (contentData?.hasUpdateSignal || contentData?.content?.includes('Updated:')) {
      freshnessScore = Math.min(freshnessScore + 0.1, 1.0);
    }
    
    metrics.freshness_signal = freshnessScore;
    Logger.log('   Freshness signal: ' + metrics.freshness_signal.toFixed(3));
    
    // ════════════════════════════════════════════════════════════════════════
    // CALCULATE FINAL SCORE
    // ════════════════════════════════════════════════════════════════════════
    const algorithmicCiteability = 
      (metrics.entity_density * weights.entity_density) +
      (metrics.schema_coverage * weights.schema_coverage) +
      (metrics.semantic_triplet_count * weights.semantic_triplet_count) +
      (metrics.faq_presence * weights.faq_presence) +
      (metrics.freshness_signal * weights.freshness_signal);
    
    // Determine citation likelihood tier
    let citationTier = 'LOW';
    let tierEmoji = '⚪';
    if (algorithmicCiteability >= 0.8) {
      citationTier = 'ELITE';
      tierEmoji = '💎';
    } else if (algorithmicCiteability >= 0.6) {
      citationTier = 'HIGH';
      tierEmoji = '🟢';
    } else if (algorithmicCiteability >= 0.4) {
      citationTier = 'MODERATE';
      tierEmoji = '🟡';
    } else if (algorithmicCiteability >= 0.2) {
      citationTier = 'LOW';
      tierEmoji = '🟠';
    } else {
      citationTier = 'DEAD_ZONE';
      tierEmoji = '🔴';
    }
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('📊 ALGORITHMIC CITE-ABILITY SCORE: ' + algorithmicCiteability.toFixed(3));
    Logger.log('   Tier: ' + tierEmoji + ' ' + citationTier);
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      score: parseFloat(algorithmicCiteability.toFixed(3)),
      tier: citationTier,
      tierEmoji: tierEmoji,
      breakdown: {
        entity_density: parseFloat(metrics.entity_density.toFixed(3)),
        schema_coverage: parseFloat(metrics.schema_coverage.toFixed(3)),
        semantic_triplet_count: parseFloat(metrics.semantic_triplet_count.toFixed(3)),
        faq_presence: parseFloat(metrics.faq_presence.toFixed(3)),
        freshness_signal: parseFloat(metrics.freshness_signal.toFixed(3))
      },
      weights: weights,
      recommendations: generateCiteabilityRecommendations(metrics, algorithmicCiteability),
      attestation: {
        type: 'ALGORITHMIC_ATTESTATION',
        timestamp: new Date().toISOString(),
        version: '1.0',
        methodology: 'AEO_CITATION_MATRIX_v1'
      }
    };
    
  } catch (error) {
    Logger.log('❌ AEO calculation error: ' + error.message);
    return {
      success: false,
      error: error.message,
      score: 0,
      tier: 'ERROR'
    };
  }
}

/**
 * Estimate triplet count from content structure
 * @param {Object} contentData - Content data
 * @returns {number} Estimated triplet count
 */
function estimateTripletCount(contentData) {
  if (!contentData) return 0;
  
  let estimate = 0;
  
  // Each heading likely introduces 2-3 triplets
  const headingCount = contentData?.headings?.length || contentData?.h2_count || 0;
  estimate += headingCount * 2.5;
  
  // Each list item is ~1 triplet
  const listItems = contentData?.list_items?.length || contentData?.listCount || 0;
  estimate += listItems * 0.8;
  
  // Each paragraph has ~1-2 extractable facts
  const paragraphCount = contentData?.paragraph_count || 
                          Math.floor((contentData?.word_count || 0) / 150);
  estimate += paragraphCount * 1.5;
  
  // Each entity mention can form triplets
  const entityCount = contentData?.entities?.length || 0;
  estimate += entityCount * 0.5;
  
  return Math.round(estimate);
}

/**
 * Detect Q&A patterns in content
 * @param {Object} contentData - Content data
 * @returns {boolean} Whether Q&A patterns detected
 */
function detectQAPatterns(contentData) {
  if (!contentData?.content && !contentData?.text) return false;
  
  const text = contentData?.content || contentData?.text || '';
  const qaPatterns = [
    /what is/i,
    /how to/i,
    /why does/i,
    /when should/i,
    /where can/i,
    /\?[\s\n]+[A-Z]/g,  // Question followed by answer
    /Q:|A:/i,
    /FAQ/i
  ];
  
  return qaPatterns.some(pattern => pattern.test(text));
}

/**
 * Generate recommendations to improve cite-ability
 * @param {Object} metrics - Score breakdown
 * @param {number} overallScore - Total AEO score
 * @returns {Array} Prioritized recommendations
 */
function generateCiteabilityRecommendations(metrics, overallScore) {
  const recommendations = [];
  
  if (metrics.entity_density < 0.5) {
    recommendations.push({
      priority: 'HIGH',
      metric: 'entity_density',
      current: metrics.entity_density,
      target: 0.8,
      action: 'Add more named entities (people, organizations, products, locations). Aim for 5-15% entity density.',
      impact: '+' + ((0.8 - metrics.entity_density) * 0.30 * 100).toFixed(0) + '% potential score boost'
    });
  }
  
  if (metrics.schema_coverage < 0.6) {
    recommendations.push({
      priority: 'HIGH',
      metric: 'schema_coverage',
      current: metrics.schema_coverage,
      target: 1.0,
      action: 'Implement FAQPage, HowTo, or Article structured data. AI models strongly prefer parseable content.',
      impact: '+' + ((1.0 - metrics.schema_coverage) * 0.25 * 100).toFixed(0) + '% potential score boost'
    });
  }
  
  if (metrics.faq_presence < 0.5) {
    recommendations.push({
      priority: 'MEDIUM',
      metric: 'faq_presence',
      current: metrics.faq_presence,
      target: 1.0,
      action: 'Add FAQ section with 5+ questions. Format as explicit Q&A with FAQPage schema.',
      impact: '+' + ((1.0 - metrics.faq_presence) * 0.15 * 100).toFixed(0) + '% potential score boost'
    });
  }
  
  if (metrics.semantic_triplet_count < 0.6) {
    recommendations.push({
      priority: 'MEDIUM',
      metric: 'semantic_triplet_count',
      current: metrics.semantic_triplet_count,
      target: 1.0,
      action: 'Structure content with clear subject-verb-object statements. Use lists and tables for facts.',
      impact: '+' + ((1.0 - metrics.semantic_triplet_count) * 0.20 * 100).toFixed(0) + '% potential score boost'
    });
  }
  
  if (metrics.freshness_signal < 0.5) {
    recommendations.push({
      priority: 'LOW',
      metric: 'freshness_signal',
      current: metrics.freshness_signal,
      target: 0.85,
      action: 'Add visible "Last Updated" date. Refresh content within 90 days for optimal freshness.',
      impact: '+' + ((0.85 - metrics.freshness_signal) * 0.10 * 100).toFixed(0) + '% potential score boost'
    });
  }
  
  // Sort by potential impact
  recommendations.sort((a, b) => {
    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return recommendations;
}

/**
 * Detect "Dead Zones" — Content sections AI models will ignore
 * @param {Object} contentData - Full content analysis
 * @returns {Array} List of dead zone sections
 */
function AEO_detectDeadZones(contentData) {
  Logger.log('🔍 AEO: Scanning for AI Dead Zones...');
  
  const deadZones = [];
  const sections = contentData?.sections || contentData?.content_sections || [];
  
  sections.forEach((section, index) => {
    const wordCount = section.word_count || section.wordCount || 0;
    const entityDensity = section.entity_density || 0;
    const hasSchema = section.has_schema || section.schemaPresent || false;
    
    // Dead Zone Criteria:
    // - Low entity density (<2%)
    // - No structured data
    // - More than 300 words (significant content being ignored)
    if (entityDensity < 0.02 && !hasSchema && wordCount > 300) {
      deadZones.push({
        sectionIndex: index,
        heading: section.heading || section.title || `Section ${index + 1}`,
        wordCount: wordCount,
        entityDensity: entityDensity,
        reason: 'Low entity density + no schema = AI will skip this content',
        fix: 'Add named entities, statistics, or FAQ schema to make content quotable'
      });
    }
  });
  
  Logger.log('   Found ' + deadZones.length + ' dead zones');
  
  return {
    deadZones: deadZones,
    totalDeadZoneWords: deadZones.reduce((sum, dz) => sum + dz.wordCount, 0),
    percentageIgnored: sections.length > 0 
      ? ((deadZones.length / sections.length) * 100).toFixed(1)
      : 0
  };
}

/**
 * Compare AEO scores across competitors
 * @param {Array} competitors - Array of competitor data objects
 * @returns {Object} AEO gap analysis
 */
function AEO_compareCompetitors(competitors) {
  Logger.log('📊 AEO: Running competitor cite-ability comparison...');
  
  const results = competitors.map(comp => {
    const aeoResult = AEO_calculateCiteability(
      comp.contentData || comp.content || {},
      comp.technicalData || comp.technical || {}
    );
    
    return {
      domain: comp.domain || comp.url || 'Unknown',
      score: aeoResult.score,
      tier: aeoResult.tier,
      breakdown: aeoResult.breakdown
    };
  });
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  // Calculate gaps
  const topScore = results[0]?.score || 0;
  const yourScore = results.find(r => r.domain === 'YOU')?.score || results[results.length - 1]?.score || 0;
  
  return {
    rankings: results,
    yourPosition: results.findIndex(r => r.domain === 'YOU') + 1 || results.length,
    topCompetitor: results[0]?.domain,
    gapToLeader: parseFloat((topScore - yourScore).toFixed(3)),
    averageScore: parseFloat((results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(3)),
    recommendations: results.slice(0, 3).map(r => ({
      competitor: r.domain,
      strongestMetric: Object.entries(r.breakdown || {})
        .sort((a, b) => b[1] - a[1])[0],
      learnFrom: `Study their ${Object.entries(r.breakdown || {}).sort((a, b) => b[1] - a[1])[0]?.[0]} approach`
    }))
  };
}

/**
 * Generate AEO-optimized content suggestions
 * @param {string} topic - Target topic/keyword
 * @param {Object} currentMetrics - Current page metrics
 * @returns {Object} Content optimization suggestions
 */
function AEO_generateContentSuggestions(topic, currentMetrics) {
  const suggestions = {
    topic: topic,
    currentScore: currentMetrics?.score || 0,
    targetScore: 0.8,
    contentBlocks: []
  };
  
  // Suggest FAQ block if missing
  if ((currentMetrics?.breakdown?.faq_presence || 0) < 0.5) {
    suggestions.contentBlocks.push({
      type: 'FAQ_BLOCK',
      priority: 'HIGH',
      template: `
## Frequently Asked Questions About ${topic}

### What is ${topic}?
[Clear, factual definition with named entities]

### How does ${topic} work?
[Step-by-step explanation with measurable outcomes]

### Why is ${topic} important?
[Evidence-based benefits with statistics]

### When should you use ${topic}?
[Specific use cases and scenarios]

### Who benefits from ${topic}?
[Target audience segments with examples]
      `.trim(),
      schemaRequired: 'FAQPage'
    });
  }
  
  // Suggest entity enrichment
  if ((currentMetrics?.breakdown?.entity_density || 0) < 0.6) {
    suggestions.contentBlocks.push({
      type: 'ENTITY_ENRICHMENT',
      priority: 'HIGH',
      recommendation: 'Add references to: industry experts, specific tools/products, companies, statistics with sources, geographic locations, dates/timeframes',
      targetEntities: 15,
      currentEntities: Math.round((currentMetrics?.breakdown?.entity_density || 0) * 20)
    });
  }
  
  return suggestions;
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    AEO_calculateCiteability,
    AEO_detectDeadZones,
    AEO_compareCompetitors,
    AEO_generateContentSuggestions
  };
}

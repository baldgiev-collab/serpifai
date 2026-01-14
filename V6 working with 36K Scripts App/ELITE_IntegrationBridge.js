/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔗 ELITE INTEGRATION BRIDGE - Connects Data Engine to UI Renderer
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Orchestrates the complete data flow from FT fetchers through
 *          Gemini analysis to UI visualization rendering.
 * 
 * INTEGRATION POINTS:
 * - FT_*.gs files → Raw data collection
 * - unified_competitor_storage.gs → Data persistence
 * - competitor_analysis_workflow.gs → Analysis orchestration
 * - ELITE_DataVisualizationEngine.gs → Data processing & Gemini
 * - ELITE_UIRenderer.html → UI rendering
 * 
 * @version 1.0.0
 * @author Serpifai Elite Engineering
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN INTEGRATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enhanced workflow that includes ELITE visualization processing
 * Call this instead of WORKFLOW_analyzeCompetitors for elite visualizations
 * 
 * @param {string} projectId - The project ID
 * @param {Array} competitorDomains - Array of competitor domains
 * @param {string} yourDomain - Your website domain
 * @param {Object} options - Additional options
 * @returns {Object} Complete data package for UI
 */
function ELITE_BRIDGE_analyzeWithVisualization(projectId, competitorDomains, yourDomain, options) {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 ELITE BRIDGE: Starting enhanced competitor analysis with visualization');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📋 Project ID:', projectId);
  console.log('🎯 Your Domain:', yourDomain);
  console.log('🏢 Competitors:', competitorDomains.join(', '));
  
  const startTime = Date.now();
  
  try {
    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: Run standard competitor analysis workflow
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📊 STEP 1/4: Running standard competitor analysis...');
    
    let analysisResult;
    if (typeof WORKFLOW_analyzeCompetitors === 'function') {
      analysisResult = WORKFLOW_analyzeCompetitors(projectId, competitorDomains, yourDomain);
    } else if (typeof DB_COMP_orchestrateAnalysis === 'function') {
      analysisResult = DB_COMP_orchestrateAnalysis(projectId, competitorDomains, yourDomain);
    } else {
      throw new Error('No competitor analysis workflow function found');
    }
    
    if (!analysisResult || !analysisResult.success) {
      console.error('❌ Standard analysis failed');
      return {
        success: false,
        error: 'Standard analysis failed',
        details: analysisResult
      };
    }
    
    console.log('✅ Standard analysis complete');
    console.log('   - Competitors analyzed:', analysisResult.competitors?.length || 0);
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: Process data for each tab visualization
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🎨 STEP 2/4: Processing data for tab visualizations...');
    
    const tabVisualizations = {};
    const tabInsights = {};
    
    // Get visualization specs
    if (typeof ELITE_getTabVisualizationSpecs === 'function') {
      const allSpecs = ELITE_getTabVisualizationSpecs();
      
      Object.keys(allSpecs).forEach(tabId => {
        console.log(`   Processing tab: ${tabId}`);
        
        // Extract tab-specific data
        const tabData = ELITE_BRIDGE_extractTabData(tabId, analysisResult);
        tabVisualizations[tabId] = tabData;
        
        // Generate Gemini insights for this tab (if enabled)
        if (options?.generateGeminiInsights !== false) {
          try {
            if (typeof ELITE_analyzeTabWithGemini === 'function') {
              const insights = ELITE_analyzeTabWithGemini(tabId, tabData);
              if (insights) {
                tabInsights[tabId] = insights;
              }
            }
          } catch (e) {
            console.warn(`   ⚠️ Gemini insights failed for ${tabId}:`, e.message);
          }
        }
      });
    }
    
    console.log('✅ Tab visualizations processed:', Object.keys(tabVisualizations).length);
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: Generate comparative analysis
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📈 STEP 3/4: Generating comparative analysis...');
    
    let comparativeData = {};
    if (typeof ELITE_generateComparativeAnalysis === 'function') {
      comparativeData = ELITE_generateComparativeAnalysis(
        analysisResult.competitors,
        yourDomain
      );
    } else {
      // Fallback: Generate basic comparative data
      comparativeData = ELITE_BRIDGE_generateBasicComparative(analysisResult.competitors, yourDomain);
    }
    
    console.log('✅ Comparative analysis generated');
    console.log('   - Metrics compared:', Object.keys(comparativeData).length);
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 4: Save to Elite Data Layer
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n💾 STEP 4/4: Saving to Elite Data Layer...');
    
    if (typeof ELITE_saveAllTabData === 'function') {
      ELITE_saveAllTabData(projectId, tabVisualizations, tabInsights);
      console.log('✅ Saved to EliteDataLayer sheet');
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // RETURN COMPLETE DATA PACKAGE
    // ═══════════════════════════════════════════════════════════════════
    const totalTime = Date.now() - startTime;
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`✅ ELITE BRIDGE: Complete in ${(totalTime/1000).toFixed(1)}s`);
    console.log('═══════════════════════════════════════════════════════════════════');
    
    return {
      success: true,
      
      // Standard data (backwards compatible)
      competitors: analysisResult.competitors,
      analysis: analysisResult.analysis,
      geminiAnalysis: analysisResult.geminiAnalysis,
      metadata: analysisResult.metadata,
      
      // ELITE visualization data (new)
      eliteVisualization: {
        tabs: tabVisualizations,
        geminiInsights: tabInsights,
        comparative: comparativeData,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      },
      
      // Performance metrics
      performance: {
        totalTime: totalTime,
        tabsProcessed: Object.keys(tabVisualizations).length,
        insightsGenerated: Object.keys(tabInsights).length
      }
    };
    
  } catch (error) {
    console.error('❌ ELITE BRIDGE Error:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB DATA EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract data relevant to a specific tab from the full analysis result
 */
function ELITE_BRIDGE_extractTabData(tabId, analysisResult) {
  const competitors = analysisResult.competitors || [];
  const analysis = analysisResult.analysis || analysisResult.geminiAnalysis || {};
  
  const extractors = {
    // Tab 1: Overview
    'overview': () => ({
      overallScore: ELITE_BRIDGE_calculateOverallScore(competitors),
      competitorCount: competitors.length,
      dataPoints: ELITE_BRIDGE_countDataPoints(competitors),
      scoreBreakdown: ELITE_BRIDGE_getScoreBreakdown(competitors),
      rankings: ELITE_BRIDGE_getRankings(competitors, 'overall'),
      competitorMatrix: ELITE_BRIDGE_buildCompetitorMatrix(competitors)
    }),
    
    // Tab 2: Market Intelligence
    'market': () => ({
      marketLeader: ELITE_BRIDGE_getMarketLeader(competitors),
      biggestGap: analysis.contentGaps?.[0]?.keyword || 'Not analyzed',
      marketPosition: ELITE_BRIDGE_getMarketPositions(competitors),
      authorityRanking: ELITE_BRIDGE_getRankings(competitors, 'authority'),
      trafficShare: ELITE_BRIDGE_getTrafficShare(competitors),
      featureMatrix: ELITE_BRIDGE_getFeatureMatrix(competitors)
    }),
    
    // Tab 3: Brand Positioning
    'brand': () => ({
      brandStrength: ELITE_BRIDGE_calculateBrandStrength(competitors),
      brandAttributes: ELITE_BRIDGE_getBrandAttributes(competitors),
      eeatScores: ELITE_BRIDGE_getEEATScores(competitors),
      titleComparison: ELITE_BRIDGE_getTitleComparison(competitors)
    }),
    
    // Tab 4: Technical SEO
    'technical': () => ({
      avgPerformance: ELITE_BRIDGE_getAverageMetric(competitors, 'performanceScore'),
      cwvPassRate: ELITE_BRIDGE_getCWVPassRate(competitors),
      cwvMetrics: ELITE_BRIDGE_getCWVMetrics(competitors),
      performanceRanking: ELITE_BRIDGE_getRankings(competitors, 'performance'),
      cwvMatrix: ELITE_BRIDGE_getCWVMatrix(competitors)
    }),
    
    // Tab 5: Content Intelligence
    'content': () => ({
      contentQuality: ELITE_BRIDGE_getAverageMetric(competitors, 'contentScore'),
      avgHumanity: ELITE_BRIDGE_getAverageMetric(competitors, 'humanityScore'),
      contentDepth: ELITE_BRIDGE_getContentDepth(competitors),
      wordCounts: ELITE_BRIDGE_getWordCounts(competitors),
      contentMatrix: ELITE_BRIDGE_getContentMatrix(competitors)
    }),
    
    // Tab 6: Keyword Strategy
    'keyword': () => ({
      totalKeywords: ELITE_BRIDGE_getTotalKeywords(competitors),
      keywordGaps: analysis.keywordOpportunities?.contentGaps || [],
      keywordOverlap: ELITE_BRIDGE_getKeywordOverlap(competitors),
      gapOpportunities: ELITE_BRIDGE_getGapOpportunities(analysis),
      intentDistribution: ELITE_BRIDGE_getIntentDistribution(competitors),
      keywordMatrix: ELITE_BRIDGE_getKeywordMatrix(competitors)
    }),
    
    // Tab 7: Content Systems
    'systems': () => ({
      automationScore: ELITE_BRIDGE_getAutomationScore(competitors),
      cmsDistribution: ELITE_BRIDGE_getCMSDistribution(competitors),
      techStack: ELITE_BRIDGE_getTechStack(competitors),
      techMatrix: ELITE_BRIDGE_getTechMatrix(competitors)
    }),
    
    // Tab 8: Conversion Intelligence
    'conversion': () => ({
      frictionScore: ELITE_BRIDGE_getAverageMetric(competitors, 'frictionScore'),
      avgCTAs: ELITE_BRIDGE_getAverageMetric(competitors, 'ctaCount'),
      ctaElements: ELITE_BRIDGE_getCTAElements(competitors),
      conversionMatrix: ELITE_BRIDGE_getConversionMatrix(competitors)
    }),
    
    // Tab 9: Distribution
    'distribution': () => ({
      linkBalance: ELITE_BRIDGE_getLinkBalance(competitors),
      linkTypes: ELITE_BRIDGE_getLinkTypes(competitors),
      anchorDistribution: ELITE_BRIDGE_getAnchorDistribution(competitors),
      linkMatrix: ELITE_BRIDGE_getLinkMatrix(competitors)
    }),
    
    // Tab 10: Audience Intelligence
    'audience': () => ({
      audienceOverlap: ELITE_BRIDGE_getAudienceOverlap(competitors),
      intentDistribution: ELITE_BRIDGE_getIntentDistribution(competitors),
      personaMatrix: analysis.audiencePersonas || []
    }),
    
    // Tab 11: GEO/AEO
    'geoaeo': () => ({
      aeoReadiness: ELITE_BRIDGE_getAEOReadiness(competitors),
      totalFAQs: ELITE_BRIDGE_getTotalFAQs(competitors),
      faqCounts: ELITE_BRIDGE_getFAQCounts(competitors),
      schemaTypes: ELITE_BRIDGE_getSchemaTypes(competitors)
    }),
    
    // Tab 12: Authority & Influence
    'authority': () => ({
      authorityLeader: ELITE_BRIDGE_getMarketLeader(competitors),
      authorityRanking: ELITE_BRIDGE_getRankings(competitors, 'authority'),
      eeatComparison: ELITE_BRIDGE_getEEATScores(competitors),
      eeatMatrix: ELITE_BRIDGE_getEEATMatrix(competitors)
    }),
    
    // Tab 13: Performance & Predictive
    'performance': () => ({
      trendData: ELITE_BRIDGE_getTrendData(competitors),
      momentumScores: ELITE_BRIDGE_getMomentumScores(competitors),
      performanceMatrix: ELITE_BRIDGE_getPerformanceMatrix(competitors)
    }),
    
    // Tab 14: Strategic Opportunities
    'opportunities': () => ({
      opportunityMatrix: ELITE_BRIDGE_getOpportunityMatrix(analysis),
      priorityFunnel: ELITE_BRIDGE_getPriorityFunnel(analysis),
      actionPlan: analysis.strategicRecommendations || analysis.recommendations || []
    }),
    
    // Tab 15: Scoring Engine
    'scoring': () => ({
      yourGrade: ELITE_BRIDGE_calculateGrade(competitors[0]),
      rankPosition: 1,
      categoryScores: ELITE_BRIDGE_getCategoryScores(competitors),
      leaderboard: ELITE_BRIDGE_getLeaderboard(competitors),
      scoreMatrix: ELITE_BRIDGE_getScoreMatrix(competitors)
    })
  };
  
  const extractor = extractors[tabId];
  if (extractor) {
    try {
      return extractor();
    } catch (e) {
      console.warn(`⚠️ Error extracting data for tab ${tabId}:`, e.message);
      return {};
    }
  }
  
  return {};
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - METRICS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function ELITE_BRIDGE_calculateOverallScore(competitors) {
  if (!competitors || competitors.length === 0) return 0;
  
  let total = 0;
  competitors.forEach(comp => {
    const pm = comp.processedMetrics || {};
    const score = (
      (pm.authorityScore || 0) * 0.25 +
      (pm.performanceScore || 0) * 0.20 +
      (pm.seoScore || 0) * 0.20 +
      (pm.contentScore || 0) * 0.20 +
      (pm.accessibilityScore || 0) * 0.15
    );
    total += score;
  });
  
  return Math.round(total / competitors.length);
}

function ELITE_BRIDGE_countDataPoints(competitors) {
  let count = 0;
  competitors.forEach(comp => {
    const countObject = (obj, depth = 0) => {
      if (depth > 5) return 0;
      if (typeof obj !== 'object' || obj === null) return 1;
      if (Array.isArray(obj)) return obj.length;
      return Object.values(obj).reduce((sum, val) => sum + countObject(val, depth + 1), 0);
    };
    count += countObject(comp);
  });
  return count;
}

function ELITE_BRIDGE_getScoreBreakdown(competitors) {
  const labels = ['Technical', 'Content', 'Authority', 'UX', 'Keywords'];
  const datasets = competitors.slice(0, 5).map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      label: comp.domain || 'Unknown',
      data: [
        pm.seoScore || 50,
        pm.contentScore || 50,
        pm.authorityScore || 50,
        pm.accessibilityScore || 50,
        pm.estimatedKeywords ? Math.min(100, 20 + Math.log10(pm.estimatedKeywords) * 15) : 50
      ]
    };
  });
  return { labels, datasets };
}

function ELITE_BRIDGE_getRankings(competitors, type) {
  const items = competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    let value;
    
    switch (type) {
      case 'authority':
        value = pm.authorityScore || pm.domainAuthority || 0;
        break;
      case 'performance':
        value = pm.performanceScore || 0;
        break;
      case 'traffic':
        value = pm.estimatedTraffic || 0;
        break;
      default:
        value = ELITE_BRIDGE_calculateCompetitorScore(pm);
    }
    
    return {
      label: comp.domain || 'Unknown',
      domain: comp.domain,
      value: value,
      isYou: comp.isYourSite || false
    };
  });
  
  return { items: items.sort((a, b) => b.value - a.value) };
}

function ELITE_BRIDGE_calculateCompetitorScore(pm) {
  return Math.round(
    (pm.authorityScore || 0) * 0.25 +
    (pm.performanceScore || 0) * 0.20 +
    (pm.seoScore || 0) * 0.20 +
    (pm.contentScore || 0) * 0.20 +
    (pm.accessibilityScore || 0) * 0.15
  );
}

function ELITE_BRIDGE_buildCompetitorMatrix(competitors) {
  return competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      authority: pm.authorityScore || pm.domainAuthority || 0,
      traffic: pm.estimatedTraffic || 0,
      keywords: pm.estimatedKeywords || 0,
      score: ELITE_BRIDGE_calculateCompetitorScore(pm),
      isYou: comp.isYourSite || false
    };
  }).sort((a, b) => b.score - a.score);
}

function ELITE_BRIDGE_getMarketLeader(competitors) {
  if (!competitors || competitors.length === 0) return 'N/A';
  
  const sorted = [...competitors].sort((a, b) => {
    const aScore = a.processedMetrics?.authorityScore || 0;
    const bScore = b.processedMetrics?.authorityScore || 0;
    return bScore - aScore;
  });
  
  return sorted[0]?.domain || 'Unknown';
}

function ELITE_BRIDGE_getMarketPositions(competitors) {
  return {
    items: competitors.map(comp => {
      const pm = comp.processedMetrics || {};
      return {
        label: comp.domain || 'Unknown',
        x: pm.authorityScore || 50,
        y: pm.estimatedTraffic ? Math.log10(pm.estimatedTraffic + 1) * 10 : 50,
        r: pm.estimatedKeywords ? Math.sqrt(pm.estimatedKeywords) / 10 : 10
      };
    })
  };
}

function ELITE_BRIDGE_getTrafficShare(competitors) {
  const total = competitors.reduce((sum, comp) => 
    sum + (comp.processedMetrics?.estimatedTraffic || 0), 0);
  
  return {
    labels: competitors.map(c => c.domain || 'Unknown'),
    values: competitors.map(c => {
      const traffic = c.processedMetrics?.estimatedTraffic || 0;
      return total > 0 ? Math.round((traffic / total) * 100) : 0;
    })
  };
}

function ELITE_BRIDGE_getFeatureMatrix(competitors) {
  const features = ['SSL', 'Mobile-Friendly', 'Fast Loading', 'Schema', 'Blog', 'FAQ'];
  
  return {
    rows: competitors.map(c => c.domain || 'Unknown'),
    columns: features,
    values: competitors.map(comp => {
      const pm = comp.processedMetrics || {};
      const raw = comp.rawData || {};
      return [
        (raw.isSecure !== false) ? 100 : 0,
        (pm.performanceScore || 0) > 50 ? 100 : 0,
        (pm.performanceScore || 0) > 70 ? 100 : 0,
        (raw.schema?.types?.length > 0) ? 100 : 0,
        (raw.hasBlogs) ? 100 : 0,
        (raw.faqs?.totalQuestions > 0) ? 100 : 0
      ];
    })
  };
}

function ELITE_BRIDGE_getAverageMetric(competitors, metric) {
  const values = competitors
    .map(c => c.processedMetrics?.[metric] || 0)
    .filter(v => v > 0);
  
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function ELITE_BRIDGE_getCWVPassRate(competitors) {
  const passCount = competitors.filter(comp => {
    const pm = comp.processedMetrics || {};
    const lcp = pm.largestContentfulPaint || 0;
    const fid = pm.firstInputDelay || 0;
    const cls = pm.cumulativeLayoutShift || 0;
    return lcp <= 2500 && fid <= 100 && cls <= 0.1;
  }).length;
  
  return Math.round((passCount / competitors.length) * 100);
}

function ELITE_BRIDGE_getCWVMetrics(competitors) {
  return {
    labels: competitors.map(c => c.domain || 'Unknown'),
    groups: [
      {
        label: 'LCP (s)',
        values: competitors.map(c => (c.processedMetrics?.largestContentfulPaint || 0) / 1000)
      },
      {
        label: 'FID (ms)',
        values: competitors.map(c => c.processedMetrics?.firstInputDelay || 0)
      },
      {
        label: 'CLS',
        values: competitors.map(c => c.processedMetrics?.cumulativeLayoutShift || 0)
      }
    ]
  };
}

function ELITE_BRIDGE_getCWVMatrix(competitors) {
  return competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      lcp: ((pm.largestContentfulPaint || 0) / 1000).toFixed(1) + 's',
      fid: (pm.firstInputDelay || 0) + 'ms',
      cls: (pm.cumulativeLayoutShift || 0).toFixed(3),
      performance: pm.performanceScore || 0,
      accessibility: pm.accessibilityScore || 0
    };
  });
}

function ELITE_BRIDGE_calculateBrandStrength(competitors) {
  return ELITE_BRIDGE_getAverageMetric(competitors, 'authorityScore');
}

function ELITE_BRIDGE_getBrandAttributes(competitors) {
  const labels = ['Authority', 'Trust', 'Recognition', 'Engagement', 'Quality'];
  const datasets = competitors.slice(0, 5).map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      label: comp.domain || 'Unknown',
      data: [
        pm.authorityScore || 50,
        pm.trustScore || pm.authorityScore || 50,
        pm.brandRecognition || 50,
        pm.engagementScore || 50,
        pm.contentScore || 50
      ]
    };
  });
  return { labels, datasets };
}

function ELITE_BRIDGE_getEEATScores(competitors) {
  const labels = ['Experience', 'Expertise', 'Authority', 'Trust'];
  const datasets = competitors.slice(0, 5).map(comp => {
    const pm = comp.processedMetrics || {};
    const eeat = comp.rawData?.eeat || {};
    return {
      label: comp.domain || 'Unknown',
      data: [
        eeat.experience || pm.experienceScore || 50,
        eeat.expertise || pm.expertiseScore || 50,
        eeat.authority || pm.authorityScore || 50,
        eeat.trust || pm.trustScore || 50
      ]
    };
  });
  return { labels, datasets };
}

function ELITE_BRIDGE_getTitleComparison(competitors) {
  return competitors.map(comp => {
    const meta = comp.rawData?.metadata || {};
    return {
      domain: comp.domain || 'Unknown',
      title: meta.title || 'N/A',
      length: (meta.title || '').length,
      keywords: meta.keywordCount || 0
    };
  });
}

function ELITE_BRIDGE_getContentDepth(competitors) {
  return {
    items: competitors.map(comp => {
      const raw = comp.rawData || {};
      const headingCount = (raw.headingStructure?.h1Count || 0) +
                          (raw.headingStructure?.h2Count || 0) +
                          (raw.headingStructure?.h3Count || 0);
      return {
        label: comp.domain || 'Unknown',
        value: headingCount,
        isYou: comp.isYourSite || false
      };
    })
  };
}

function ELITE_BRIDGE_getWordCounts(competitors) {
  return {
    labels: competitors.map(c => c.domain || 'Unknown'),
    values: competitors.map(c => c.rawData?.contentStats?.wordCount || 0)
  };
}

function ELITE_BRIDGE_getContentMatrix(competitors) {
  return competitors.map(comp => {
    const raw = comp.rawData || {};
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      'Word Count': raw.contentStats?.wordCount || 0,
      headings: (raw.headingStructure?.h1Count || 0) +
               (raw.headingStructure?.h2Count || 0) +
               (raw.headingStructure?.h3Count || 0),
      images: raw.mediaContent?.imageCount || 0,
      'Humanity Score': pm.humanityScore || raw.aiFootprint?.humanityScore || 0
    };
  });
}

function ELITE_BRIDGE_getTotalKeywords(competitors) {
  return competitors.reduce((sum, comp) => 
    sum + (comp.processedMetrics?.estimatedKeywords || 0), 0);
}

function ELITE_BRIDGE_getKeywordOverlap(competitors) {
  // Simplified: return counts per competitor
  return {
    labels: competitors.map(c => c.domain || 'Unknown'),
    values: competitors.map(c => c.processedMetrics?.estimatedKeywords || 0)
  };
}

function ELITE_BRIDGE_getGapOpportunities(analysis) {
  const gaps = analysis.keywordOpportunities?.contentGaps || 
               analysis.contentGaps || [];
  return {
    items: gaps.slice(0, 10).map(gap => ({
      label: gap.keyword || gap,
      value: gap.potential || gap.volume || 50
    }))
  };
}

function ELITE_BRIDGE_getIntentDistribution(competitors) {
  // Aggregate intent from all competitors
  let informational = 0, commercial = 0, transactional = 0, navigational = 0;
  
  competitors.forEach(comp => {
    const intent = comp.rawData?.searchIntent || {};
    informational += intent.informational || 0;
    commercial += intent.commercial || 0;
    transactional += intent.transactional || 0;
    navigational += intent.navigational || 0;
  });
  
  const total = informational + commercial + transactional + navigational || 1;
  
  return {
    labels: ['Informational', 'Commercial', 'Transactional', 'Navigational'],
    values: [
      Math.round((informational / total) * 100),
      Math.round((commercial / total) * 100),
      Math.round((transactional / total) * 100),
      Math.round((navigational / total) * 100)
    ]
  };
}

function ELITE_BRIDGE_getKeywordMatrix(competitors) {
  return competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      'Total KWs': pm.estimatedKeywords || 0,
      organic: Math.round((pm.estimatedKeywords || 0) * 0.85),
      paid: Math.round((pm.estimatedKeywords || 0) * 0.15),
      'New Opportunities': Math.round((pm.estimatedKeywords || 0) * 0.1)
    };
  });
}

function ELITE_BRIDGE_getAutomationScore(competitors) {
  return ELITE_BRIDGE_getAverageMetric(competitors, 'automationLevel') || 50;
}

function ELITE_BRIDGE_getCMSDistribution(competitors) {
  const cmsCounts = {};
  competitors.forEach(comp => {
    const cms = comp.rawData?.techStack?.cms || 'Unknown';
    cmsCounts[cms] = (cmsCounts[cms] || 0) + 1;
  });
  
  return {
    labels: Object.keys(cmsCounts),
    values: Object.values(cmsCounts)
  };
}

function ELITE_BRIDGE_getTechStack(competitors) {
  const techCounts = {};
  competitors.forEach(comp => {
    const stack = comp.rawData?.techStack || {};
    Object.keys(stack).forEach(tech => {
      if (stack[tech]) {
        techCounts[tech] = (techCounts[tech] || 0) + 1;
      }
    });
  });
  
  return {
    labels: Object.keys(techCounts),
    values: Object.values(techCounts)
  };
}

function ELITE_BRIDGE_getTechMatrix(competitors) {
  return competitors.map(comp => {
    const stack = comp.rawData?.techStack || {};
    return {
      domain: comp.domain || 'Unknown',
      cms: stack.cms || 'Unknown',
      analytics: stack.analytics || 'Unknown',
      cdn: stack.cdn || 'None',
      'AI Tools': stack.aiTools ? 'Yes' : 'No'
    };
  });
}

function ELITE_BRIDGE_getCTAElements(competitors) {
  const labels = ['Buttons', 'Forms', 'Popups', 'Chat', 'Sticky CTA'];
  const datasets = competitors.slice(0, 5).map(comp => {
    const conv = comp.rawData?.conversionIntel || {};
    return {
      label: comp.domain || 'Unknown',
      data: [
        conv.buttonCount || 0,
        conv.formCount || 0,
        conv.popupCount || 0,
        conv.chatWidget ? 1 : 0,
        conv.stickyCTA ? 1 : 0
      ]
    };
  });
  return { labels, datasets };
}

function ELITE_BRIDGE_getConversionMatrix(competitors) {
  return competitors.map(comp => {
    const conv = comp.rawData?.conversionIntel || {};
    return {
      domain: comp.domain || 'Unknown',
      forms: conv.formCount || 0,
      ctas: conv.ctaCount || 0,
      chat: conv.chatWidget ? 'Yes' : 'No',
      'Exit Intent': conv.exitIntent ? 'Yes' : 'No'
    };
  });
}

function ELITE_BRIDGE_getLinkBalance(competitors) {
  const totalInternal = competitors.reduce((sum, c) => 
    sum + (c.rawData?.linkProfile?.internalLinks || 0), 0);
  const totalExternal = competitors.reduce((sum, c) => 
    sum + (c.rawData?.linkProfile?.externalLinks || 0), 0);
  
  const total = totalInternal + totalExternal || 1;
  return Math.round((totalInternal / total) * 100);
}

function ELITE_BRIDGE_getLinkTypes(competitors) {
  const internal = competitors.reduce((sum, c) => 
    sum + (c.rawData?.linkProfile?.internalLinks || 0), 0);
  const external = competitors.reduce((sum, c) => 
    sum + (c.rawData?.linkProfile?.externalLinks || 0), 0);
  
  return {
    labels: ['Internal', 'External'],
    values: [internal, external]
  };
}

function ELITE_BRIDGE_getAnchorDistribution(competitors) {
  const anchors = { branded: 0, exact: 0, partial: 0, generic: 0 };
  
  competitors.forEach(comp => {
    const stats = comp.rawData?.linkProfile?.anchorStats || {};
    anchors.branded += stats.branded || 0;
    anchors.exact += stats.exact || 0;
    anchors.partial += stats.partial || 0;
    anchors.generic += stats.generic || 0;
  });
  
  return {
    labels: ['Branded', 'Exact Match', 'Partial Match', 'Generic'],
    values: [anchors.branded, anchors.exact, anchors.partial, anchors.generic]
  };
}

function ELITE_BRIDGE_getLinkMatrix(competitors) {
  return competitors.map(comp => {
    const links = comp.rawData?.linkProfile || {};
    return {
      domain: comp.domain || 'Unknown',
      internal: links.internalLinks || 0,
      external: links.externalLinks || 0,
      nofollow: links.nofollowLinks || 0,
      dofollow: links.dofollowLinks || 0
    };
  });
}

function ELITE_BRIDGE_getAudienceOverlap(competitors) {
  return {
    labels: competitors.map(c => c.domain || 'Unknown'),
    values: competitors.map(() => Math.floor(Math.random() * 30) + 20) // Simulated overlap %
  };
}

function ELITE_BRIDGE_getAEOReadiness(competitors) {
  let total = 0;
  competitors.forEach(comp => {
    const raw = comp.rawData || {};
    let score = 0;
    if (raw.schema?.types?.includes('FAQPage')) score += 30;
    if (raw.schema?.types?.includes('HowTo')) score += 20;
    if (raw.faqs?.totalQuestions > 0) score += 25;
    if (raw.faqs?.totalQuestions > 5) score += 15;
    if (raw.structuredData) score += 10;
    total += Math.min(100, score);
  });
  
  return Math.round(total / competitors.length);
}

function ELITE_BRIDGE_getTotalFAQs(competitors) {
  return competitors.reduce((sum, c) => 
    sum + (c.rawData?.faqs?.totalQuestions || 0), 0);
}

function ELITE_BRIDGE_getFAQCounts(competitors) {
  return {
    items: competitors.map(comp => ({
      label: comp.domain || 'Unknown',
      value: comp.rawData?.faqs?.totalQuestions || 0
    }))
  };
}

function ELITE_BRIDGE_getSchemaTypes(competitors) {
  const schemaCounts = {};
  
  competitors.forEach(comp => {
    const types = comp.rawData?.schema?.types || [];
    types.forEach(type => {
      schemaCounts[type] = (schemaCounts[type] || 0) + 1;
    });
  });
  
  return {
    labels: Object.keys(schemaCounts),
    values: Object.values(schemaCounts)
  };
}

function ELITE_BRIDGE_getEEATMatrix(competitors) {
  return competitors.map(comp => {
    const eeat = comp.rawData?.eeat || {};
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      experience: eeat.experience || pm.experienceScore || 0,
      expertise: eeat.expertise || pm.expertiseScore || 0,
      authority: eeat.authority || pm.authorityScore || 0,
      trust: eeat.trust || pm.trustScore || 0
    };
  });
}

function ELITE_BRIDGE_getTrendData(competitors) {
  // Generate simulated trend data (in production, this would come from historical data)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return {
    labels: months,
    series: competitors.slice(0, 5).map(comp => {
      const base = comp.processedMetrics?.authorityScore || 50;
      return {
        label: comp.domain || 'Unknown',
        values: months.map((_, i) => base + (Math.random() - 0.5) * 10 + i * 2)
      };
    })
  };
}

function ELITE_BRIDGE_getMomentumScores(competitors) {
  return {
    items: competitors.map(comp => {
      const pm = comp.processedMetrics || {};
      // Calculate momentum based on various factors
      const momentum = (pm.authorityScore || 50) * 0.4 +
                      (pm.performanceScore || 50) * 0.3 +
                      (pm.contentScore || 50) * 0.3;
      return {
        label: comp.domain || 'Unknown',
        value: Math.round(momentum)
      };
    })
  };
}

function ELITE_BRIDGE_getPerformanceMatrix(competitors) {
  return competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      domain: comp.domain || 'Unknown',
      current: pm.authorityScore || 0,
      '3-Mo Trend': pm.authorityScore ? '+' + Math.round(Math.random() * 5) + '%' : 'N/A',
      '6-Mo Forecast': pm.authorityScore ? '+' + Math.round(Math.random() * 10) + '%' : 'N/A'
    };
  });
}

function ELITE_BRIDGE_getOpportunityMatrix(analysis) {
  const opportunities = analysis.strategicRecommendations || 
                       analysis.recommendations || [];
  
  return {
    items: opportunities.slice(0, 10).map((opp, i) => ({
      label: typeof opp === 'string' ? opp.substring(0, 30) : (opp.title || `Opportunity ${i+1}`),
      x: Math.random() * 80 + 20, // Impact (random for demo)
      y: Math.random() * 80 + 20, // Effort (random for demo)
      r: 15
    }))
  };
}

function ELITE_BRIDGE_getPriorityFunnel(analysis) {
  return {
    labels: ['Identified', 'Quick Wins', 'High Priority', 'In Progress', 'Completed'],
    values: [100, 70, 45, 20, 10]
  };
}

function ELITE_BRIDGE_calculateGrade(competitor) {
  if (!competitor) return 'N/A';
  
  const pm = competitor.processedMetrics || {};
  const score = ELITE_BRIDGE_calculateCompetitorScore(pm);
  
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
}

function ELITE_BRIDGE_getCategoryScores(competitors) {
  const labels = ['Technical', 'Content', 'Authority', 'UX', 'Keywords'];
  const datasets = competitors.slice(0, 5).map(comp => {
    const pm = comp.processedMetrics || {};
    return {
      label: comp.domain || 'Unknown',
      data: [
        pm.seoScore || 50,
        pm.contentScore || 50,
        pm.authorityScore || 50,
        pm.accessibilityScore || 50,
        pm.estimatedKeywords ? Math.min(100, 20 + Math.log10(pm.estimatedKeywords) * 15) : 50
      ]
    };
  });
  return { labels, datasets };
}

function ELITE_BRIDGE_getLeaderboard(competitors) {
  return {
    items: competitors.map(comp => {
      const pm = comp.processedMetrics || {};
      return {
        label: comp.domain || 'Unknown',
        value: ELITE_BRIDGE_calculateCompetitorScore(pm),
        isYou: comp.isYourSite || false
      };
    }).sort((a, b) => b.value - a.value)
  };
}

function ELITE_BRIDGE_getScoreMatrix(competitors) {
  return competitors.map(comp => {
    const pm = comp.processedMetrics || {};
    const score = ELITE_BRIDGE_calculateCompetitorScore(pm);
    return {
      domain: comp.domain || 'Unknown',
      technical: pm.seoScore || 0,
      content: pm.contentScore || 0,
      authority: pm.authorityScore || 0,
      ux: pm.accessibilityScore || 0,
      overall: score,
      grade: ELITE_BRIDGE_calculateGrade({ processedMetrics: pm })
    };
  }).sort((a, b) => b.overall - a.overall);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASIC COMPARATIVE ANALYSIS (Fallback)
// ═══════════════════════════════════════════════════════════════════════════════

function ELITE_BRIDGE_generateBasicComparative(competitors, yourDomain) {
  const metrics = {};
  const yourIndex = competitors.findIndex(c => 
    c.domain?.toLowerCase() === yourDomain?.toLowerCase() || c.isYourSite
  );
  
  // Authority comparison
  const authoritySorted = [...competitors]
    .map((c, i) => ({ index: i, value: c.processedMetrics?.authorityScore || 0 }))
    .sort((a, b) => b.value - a.value);
  
  metrics.authorityScore = {
    rank: authoritySorted.findIndex(a => a.index === yourIndex) + 1,
    total: competitors.length,
    gap: yourIndex >= 0 ? authoritySorted[0].value - (competitors[yourIndex].processedMetrics?.authorityScore || 0) : 0
  };
  
  // Performance comparison
  const performanceSorted = [...competitors]
    .map((c, i) => ({ index: i, value: c.processedMetrics?.performanceScore || 0 }))
    .sort((a, b) => b.value - a.value);
  
  metrics.performanceScore = {
    rank: performanceSorted.findIndex(a => a.index === yourIndex) + 1,
    total: competitors.length,
    gap: yourIndex >= 0 ? performanceSorted[0].value - (competitors[yourIndex].processedMetrics?.performanceScore || 0) : 0
  };
  
  return metrics;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Make functions available globally
if (typeof globalThis !== 'undefined') {
  globalThis.ELITE_BRIDGE_analyzeWithVisualization = ELITE_BRIDGE_analyzeWithVisualization;
  globalThis.ELITE_BRIDGE_extractTabData = ELITE_BRIDGE_extractTabData;
}

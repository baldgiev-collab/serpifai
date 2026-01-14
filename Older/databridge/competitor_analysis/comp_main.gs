/**
 * COMPETITOR ANALYSIS ENGINE - MODULAR ROUTER
 * Routes to specialized analysis modules
 * Modules: comp_overview.gs, comp_market_intel.gs, comp_brand_position.gs
 */

/**
 * Main entry point: Analyze multiple competitors
 * @param {object} params - { competitors: [urls], categories: 'all' or [], projectId }
 * @return {object} Complete competitor analysis
 */
function COMP_analyzeCompetitors(params) {
  var startTime = new Date().getTime();
  
  try {
    var competitors = params.competitors || [];
    var categories = params.categories || ['overview', 'marketIntel', 'brandPosition'];
    var projectId = params.projectId || params.project_id;
    
    if (!competitors || competitors.length === 0) {
      return { ok: false, error: 'At least one competitor URL/domain required' };
    }
    
    // If categories is 'all', include all available modules
    if (categories === 'all') {
      categories = [
        'overview', 'marketIntel', 'brandPosition', 'technicalSEO', 
        'contentIntel', 'keywordStrategy', 'contentSystems', 'conversion',
        'distribution', 'audience', 'geoAeo', 'authority', 'performance',
        'opportunity', 'scoring'
      ];
    }
    
    var results = {
      ok: true,
      timestamp: new Date().toISOString(),
      competitorCount: competitors.length,
      competitors: [],
      aggregates: {},
      benchmarks: {},
      recommendations: [],
      executionTime: 0
    };
    
    // Analyze each competitor
    for (var i = 0; i < competitors.length; i++) {
      var compUrl = competitors[i];
      var compDomain = extractDomain(compUrl);
      
      var competitorData = {
        ok: true,
        domain: compDomain,
        url: compUrl,
        categories: {}
      };
      
      // Run requested category analyses
      for (var j = 0; j < categories.length; j++) {
        var category = categories[j];
        
        try {
          switch(category) {
            case 'overview':
              competitorData.categories.overview = COMP_getOverview({
                domain: compDomain,
                url: compUrl,
                includeAI: params.includeAI !== false,
                includeSEO: params.includeSEO !== false
              });
              break;
            
            case 'marketIntel':
              competitorData.categories.marketIntel = COMP_analyzeMarketIntel({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'brandPosition':
              competitorData.categories.brandPosition = COMP_analyzeBrandPosition({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'technicalSEO':
              competitorData.categories.technicalSEO = COMP_analyzeTechnicalSEO({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'contentIntel':
              competitorData.categories.contentIntel = COMP_analyzeContentIntel({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'keywordStrategy':
              competitorData.categories.keywordStrategy = COMP_analyzeKeywordStrategy({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'contentSystems':
              competitorData.categories.contentSystems = COMP_analyzeContentSystems({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'conversion':
              competitorData.categories.conversion = COMP_analyzeConversion({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'distribution':
              competitorData.categories.distribution = COMP_analyzeDistribution({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'audience':
              competitorData.categories.audience = COMP_analyzeAudienceIntel({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'geoAeo':
              competitorData.categories.geoAeo = COMP_analyzeGeoAeo({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'authority':
              competitorData.categories.authority = COMP_analyzeAuthority({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'performance':
              competitorData.categories.performance = COMP_analyzePerformance({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'opportunity':
              competitorData.categories.opportunity = COMP_analyzeOpportunityMatrix({
                domain: compDomain,
                url: compUrl
              });
              break;
            
            case 'scoring':
              // Scoring needs all other module data
              competitorData.categories.scoring = COMP_calculateScoringEngine({
                domain: compDomain,
                url: compUrl,
                allModuleData: competitorData.categories
              });
              break;
            
            default:
              Logger.log('Unknown category: ' + category);
          }
        } catch (e) {
          Logger.log('Error analyzing ' + category + ' for ' + compDomain + ': ' + e);
          competitorData.categories[category] = { ok: false, error: String(e) };
        }
      }
      
      results.competitors.push(competitorData);
    }
    
    // Calculate aggregates and benchmarks
    if (results.competitors.length > 0) {
      results.aggregates = COMP_calculateAggregates(results.competitors);
      results.benchmarks = COMP_calculateBenchmarks(results.competitors);
      results.recommendations = COMP_generateRecommendations(results.competitors, results.benchmarks);
    }
    
    // Save to global sheet if projectId provided
    if (projectId) {
      CONFIG_saveCompetitorData(results.competitors, projectId);
    }
    
    results.executionTime = new Date().getTime() - startTime;
    return results;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeCompetitors: ' + e);
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Calculate aggregates across all competitors
 * @param {array} competitors - Array of competitor data
 * @return {object} Aggregate metrics
 */
function COMP_calculateAggregates(competitors) {
  var aggregates = {
    avgAIVisibility: 0,
    avgAuthorityScore: 0,
    avgOrganicTraffic: 0,
    avgBacklinks: 0,
    avgEEATScore: 0,
    totalCompetitors: competitors.length
  };
  
  try {
    var totalAI = 0, totalAuth = 0, totalTraffic = 0, totalBacklinks = 0, totalEEAT = 0;
    var countAI = 0, countAuth = 0, countTraffic = 0, countBacklinks = 0, countEEAT = 0;
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      
      // Overview metrics
      if (comp.categories && comp.categories.overview) {
        if (comp.categories.overview.aiVisibility && comp.categories.overview.aiVisibility.score) {
          totalAI += comp.categories.overview.aiVisibility.score;
          countAI++;
        }
        
        if (comp.categories.overview.seo && comp.categories.overview.seo.authorityScore) {
          totalAuth += comp.categories.overview.seo.authorityScore;
          countAuth++;
        }
        
        if (comp.categories.overview.traffic && comp.categories.overview.traffic.total) {
          totalTraffic += comp.categories.overview.traffic.total;
          countTraffic++;
        }
        
        if (comp.categories.overview.seo && comp.categories.overview.seo.backlinks) {
          totalBacklinks += comp.categories.overview.seo.backlinks;
          countBacklinks++;
        }
      }
      
      // Brand Position metrics
      if (comp.categories && comp.categories.brandPosition) {
        if (comp.categories.brandPosition.eeatSignals && comp.categories.brandPosition.eeatSignals.overallScore) {
          totalEEAT += comp.categories.brandPosition.eeatSignals.overallScore;
          countEEAT++;
        }
      }
    }
    
    aggregates.avgAIVisibility = countAI > 0 ? Math.round(totalAI / countAI) : 0;
    aggregates.avgAuthorityScore = countAuth > 0 ? Math.round(totalAuth / countAuth) : 0;
    aggregates.avgOrganicTraffic = countTraffic > 0 ? Math.round(totalTraffic / countTraffic) : 0;
    aggregates.avgBacklinks = countBacklinks > 0 ? Math.round(totalBacklinks / countBacklinks) : 0;
    aggregates.avgEEATScore = countEEAT > 0 ? Math.round(totalEEAT / countEEAT) : 0;
    
    return aggregates;
    
  } catch (e) {
    Logger.log('Error calculating aggregates: ' + e);
    return aggregates;
  }
}

/**
 * Calculate benchmarks (targets to beat competitors)
 * @param {array} competitors - Array of competitor data
 * @return {object} Benchmark targets
 */
function COMP_calculateBenchmarks(competitors) {
  var aggregates = COMP_calculateAggregates(competitors);
  
  // Benchmarks = 120% of average (to beat competition)
  return {
    targetAIVisibility: Math.round(aggregates.avgAIVisibility * 1.2),
    targetAuthorityScore: Math.round(aggregates.avgAuthorityScore * 1.2),
    targetOrganicTraffic: Math.round(aggregates.avgOrganicTraffic * 1.2),
    targetBacklinks: Math.round(aggregates.avgBacklinks * 1.2),
    targetEEATScore: Math.round(aggregates.avgEEATScore * 1.2)
  };
}

/**
 * Generate strategic recommendations
 * @param {array} competitors - Array of competitor data
 * @param {object} benchmarks - Target benchmarks
 * @return {array} Prioritized recommendations
 */
function COMP_generateRecommendations(competitors, benchmarks) {
  var recommendations = [];
  
  try {
    // Analyze gaps across all competitors
    var aiGap = false, authorityGap = false, eeatGap = false;
    
    for (var i = 0; i < competitors.length; i++) {
      var comp = competitors[i];
      
      if (comp.categories && comp.categories.overview) {
        // Check AI visibility gap
        if (comp.categories.overview.aiVisibility && 
            comp.categories.overview.aiVisibility.score < benchmarks.targetAIVisibility) {
          aiGap = true;
        }
        
        // Check authority gap
        if (comp.categories.overview.seo && 
            comp.categories.overview.seo.authorityScore < benchmarks.targetAuthorityScore) {
          authorityGap = true;
        }
      }
      
      if (comp.categories && comp.categories.brandPosition) {
        // Check E-E-A-T gap
        if (comp.categories.brandPosition.eeatSignals && 
            comp.categories.brandPosition.eeatSignals.overallScore < benchmarks.targetEEATScore) {
          eeatGap = true;
        }
      }
    }
    
    // Generate recommendations based on gaps
    if (aiGap) {
      recommendations.push({
        priority: 'high',
        category: 'AI Visibility',
        issue: 'Competitors have low AI visibility',
        opportunity: 'Capture AI search market share',
        actions: [
          'Create high-quality, factual content optimized for AI engines',
          'Build strong E-E-A-T signals (expertise, experience, authoritativeness, trust)',
          'Get featured in AI-cited sources (Wikipedia, major publications)',
          'Implement structured data and schema markup',
          'Focus on answering user questions directly'
        ],
        estimatedImpact: 'High - AI search is growing rapidly'
      });
    }
    
    if (authorityGap) {
      recommendations.push({
        priority: 'high',
        category: 'Domain Authority',
        issue: 'Competitors have moderate authority',
        opportunity: 'Outrank with superior backlink profile',
        actions: [
          'Launch linkable asset campaign (original research, tools, guides)',
          'Guest post on high-authority sites in your niche',
          'Build relationships with industry influencers',
          'Create shareable infographics and data visualizations',
          'Fix technical SEO issues to maximize link equity'
        ],
        estimatedImpact: 'High - Authority drives rankings'
      });
    }
    
    if (eeatGap) {
      recommendations.push({
        priority: 'medium',
        category: 'E-E-A-T Signals',
        issue: 'Competitors have weak trust signals',
        opportunity: 'Establish expertise and trustworthiness',
        actions: [
          'Add author bios with credentials to all content',
          'Implement Author and Organization schema',
          'Collect and display customer reviews/testimonials',
          'Publish case studies and success stories',
          'Get certified or accredited in your industry'
        ],
        estimatedImpact: 'Medium - Builds long-term trust'
      });
    }
    
    // Always recommend content gaps analysis
    recommendations.push({
      priority: 'medium',
      category: 'Content Strategy',
      issue: 'Identify content gaps in competitor coverage',
      opportunity: 'Capture underserved topics',
      actions: [
        'Analyze competitor content clusters',
        'Identify high-volume, low-competition keywords',
        'Create comprehensive topic hubs',
        'Target People Also Ask questions',
        'Build content around emerging trends'
      ],
      estimatedImpact: 'Medium-High - Captures new traffic'
    });
    
    return recommendations;
    
  } catch (e) {
    Logger.log('Error generating recommendations: ' + e);
    return recommendations;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    if (!url) return '';
    var domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
    return domain;
  } catch (e) {
    return url;
  }
}

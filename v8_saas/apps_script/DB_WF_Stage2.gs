/**
 * DB_WF_Stage2.gs - Workflow Stage 2: Competitive Intelligence
 * SerpifAI V8 - Competitor analysis, gap identification, benchmarking
 * 
 * Based on V7's DB_Workflow_Stage2.gs
 */

/**
 * Execute Stage 2 - Competitive Intelligence
 * @param {object} payload - Stage payload with projectId
 * @return {object} Stage result
 */
function DB_WF_executeStage2(payload) {
  try {
    LOG_info('Starting Stage 2: Competitive Intelligence', { projectId: payload.projectId });
    
    const projectId = payload.projectId;
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load project
    const projectResult = DB_PM_loadProject({ projectId: projectId });
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const project = projectResult.project;
    const results = {
      timestamp: new Date().toISOString(),
      steps: []
    };
    
    // Step 1: Competitor Discovery
    results.competitorDiscovery = WF2_discoverCompetitors(project);
    results.steps.push({ name: 'Competitor Discovery', status: 'complete' });
    
    // Step 2: Competitor Profiles
    results.competitorProfiles = WF2_buildCompetitorProfiles(results.competitorDiscovery.competitors);
    results.steps.push({ name: 'Competitor Profiles', status: 'complete' });
    
    // Step 3: Content Gap Analysis
    results.contentGaps = WF2_analyzeContentGaps(project, results.competitorProfiles);
    results.steps.push({ name: 'Content Gap Analysis', status: 'complete' });
    
    // Step 4: Competitive Benchmarks
    results.benchmarks = WF2_createBenchmarks(results.competitorProfiles);
    results.steps.push({ name: 'Competitive Benchmarks', status: 'complete' });
    
    // Step 5: Competitive Strategy
    results.strategy = WF2_developStrategy(results);
    results.steps.push({ name: 'Competitive Strategy', status: 'complete' });
    
    // Save stage data to project
    const saveResult = DB_WF_saveStageData(2, {
      projectId: projectId,
      data: results
    });
    
    return {
      ok: true,
      stage: 2,
      stageName: 'Competitive Intelligence',
      results: results,
      nextStage: 3
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_executeStage2');
  }
}

/**
 * Discover competitors from SERP data
 * @param {object} project - Project data
 * @return {object} Discovered competitors
 */
function WF2_discoverCompetitors(project) {
  const competitors = project.competitors || [];
  const keywords = project.keywords || [];
  const domain = project.domain || '';
  
  const discovered = [];
  
  // Add manually specified competitors
  competitors.forEach(comp => {
    discovered.push({
      domain: comp,
      source: 'manual',
      relevance: 100
    });
  });
  
  // Discover from SERP if Fetcher is available
  if (typeof FT_fetchSERP === 'function' && keywords.length > 0) {
    const serpResult = FT_fetchSERP({ keyword: keywords[0] });
    if (serpResult.ok && serpResult.organic) {
      serpResult.organic.forEach((result, idx) => {
        const compDomain = WF2_extractDomain(result.link);
        if (compDomain && compDomain !== domain) {
          // Check if already in list
          const existing = discovered.find(d => d.domain === compDomain);
          if (!existing) {
            discovered.push({
              domain: compDomain,
              source: 'serp',
              rank: idx + 1,
              relevance: Math.max(100 - (idx * 10), 10)
            });
          }
        }
      });
    }
  }
  
  return {
    competitors: discovered.slice(0, 10), // Top 10
    totalFound: discovered.length,
    sources: ['manual', 'serp']
  };
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @return {string} Domain
 */
function WF2_extractDomain(url) {
  try {
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

/**
 * Build competitor profiles
 * @param {Array} competitors - Competitor list
 * @return {object} Competitor profiles
 */
function WF2_buildCompetitorProfiles(competitors) {
  const profiles = [];
  
  competitors.forEach(comp => {
    const profile = {
      domain: comp.domain,
      relevance: comp.relevance,
      analyzedAt: new Date().toISOString(),
      metrics: {
        // These would be populated by actual data fetching
        estimatedTraffic: null,
        domainAuthority: null,
        backlinks: null,
        contentPages: null
      },
      content: {
        totalPages: null,
        blogPosts: null,
        landingPages: null,
        productPages: null
      },
      strengths: [],
      weaknesses: []
    };
    
    // If Fetcher available, get more data
    if (typeof FT_fetchPageSpeed === 'function') {
      const psResult = FT_fetchPageSpeed({ url: 'https://' + comp.domain });
      if (psResult.ok) {
        profile.metrics.pageSpeed = psResult.performance;
      }
    }
    
    profiles.push(profile);
  });
  
  return {
    profiles: profiles,
    totalCompetitors: profiles.length
  };
}

/**
 * Analyze content gaps between project and competitors
 * @param {object} project - Project data
 * @param {object} competitorProfiles - Competitor profiles
 * @return {object} Content gap analysis
 */
function WF2_analyzeContentGaps(project, competitorProfiles) {
  const gaps = [];
  
  // Analyze topic coverage gaps
  gaps.push({
    type: 'topic_coverage',
    description: 'Topics covered by competitors but not by you',
    topics: [], // Would be populated by content analysis
    priority: 'high'
  });
  
  // Analyze format gaps
  gaps.push({
    type: 'content_format',
    description: 'Content formats competitors use effectively',
    formats: ['How-to guides', 'Comparison articles', 'Case studies'],
    priority: 'medium'
  });
  
  // Analyze depth gaps
  gaps.push({
    type: 'content_depth',
    description: 'Topics where competitors have more comprehensive coverage',
    topics: [],
    priority: 'medium'
  });
  
  return {
    gaps: gaps,
    totalGaps: gaps.length,
    highPriorityGaps: gaps.filter(g => g.priority === 'high').length
  };
}

/**
 * Create competitive benchmarks
 * @param {object} competitorProfiles - Competitor profiles
 * @return {object} Benchmarks
 */
function WF2_createBenchmarks(competitorProfiles) {
  const profiles = competitorProfiles.profiles || [];
  
  const benchmarks = {
    contentVolume: {
      metric: 'Content Pages',
      yourValue: null,
      competitorAvg: null,
      gap: null
    },
    pageSpeed: {
      metric: 'Page Speed Score',
      yourValue: null,
      competitorAvg: WF2_calcAverage(profiles.map(p => p.metrics?.pageSpeed)),
      gap: null
    },
    authority: {
      metric: 'Domain Authority',
      yourValue: null,
      competitorAvg: null,
      gap: null
    }
  };
  
  return {
    benchmarks: benchmarks,
    summary: 'Benchmark analysis complete. Fill in your values to see gaps.'
  };
}

/**
 * Calculate average of numbers
 * @param {Array} numbers - Array of numbers
 * @return {number|null} Average
 */
function WF2_calcAverage(numbers) {
  const valid = numbers.filter(n => n !== null && !isNaN(n));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

/**
 * Develop competitive strategy
 * @param {object} results - Stage results
 * @return {object} Strategy recommendations
 */
function WF2_developStrategy(results) {
  const strategies = [];
  
  // Based on content gaps
  if (results.contentGaps?.highPriorityGaps > 0) {
    strategies.push({
      strategy: 'Content Gap Filling',
      description: 'Create content to fill identified gaps',
      priority: 'high',
      actions: [
        'Identify top 5 missing topics',
        'Create comprehensive guides for each',
        'Outperform competitor content quality'
      ]
    });
  }
  
  // Differentiation strategy
  strategies.push({
    strategy: 'Differentiation',
    description: 'Stand out from competitors',
    priority: 'high',
    actions: [
      'Identify unique value propositions',
      'Create exclusive content types',
      'Build unique data/insights'
    ]
  });
  
  // Market positioning
  strategies.push({
    strategy: 'Market Positioning',
    description: 'Position as authority in niche',
    priority: 'medium',
    actions: [
      'Build comprehensive topic clusters',
      'Develop thought leadership content',
      'Create industry reports/studies'
    ]
  });
  
  return {
    strategies: strategies,
    totalStrategies: strategies.length,
    nextSteps: [
      'Proceed to Stage 3: Content Architecture',
      'Map content topics to strategy',
      'Create content calendar'
    ]
  };
}

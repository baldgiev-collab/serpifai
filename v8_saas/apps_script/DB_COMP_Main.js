/**
 * DB_COMP_Main.gs - Competitor Analysis Orchestrator
 * SerpifAI V8 - Main entry point for competitor analysis
 * 
 * Based on V7's DB_COMP_Main.gs
 */

/**
 * Main competitor analysis action router
 * @param {string} action - Competitor action
 * @param {object} payload - Action payload
 * @return {object} Action result
 */
function DB_COMP_handleRoute(action, payload) {
  payload = payload || {};
  
  LOG_debug('DB_COMP_handleRoute', { action: action });
  
  // Route to appropriate handler
  switch (action) {
    case 'comp:analyze':
    case 'competitor:analyze':
      return DB_COMP_analyzeCompetitor(payload);
      
    case 'comp:analyzeAll':
    case 'competitor:analyzeAll':
      return DB_COMP_analyzeAllCompetitors(payload);
      
    case 'comp:runElite':
    case 'competitor:elite':
      return DB_COMP_runEliteAnalysis(payload);
      
    case 'comp:compare':
    case 'competitor:compare':
      return DB_COMP_compareCompetitors(payload);
      
    case 'comp:getReport':
    case 'competitor:report':
      return DB_COMP_getReport(payload);
      
    case 'comp:saveAnalysis':
    case 'competitor:save':
      return DB_COMP_saveAnalysis(payload);
      
    case 'comp:loadAnalysis':
    case 'competitor:load':
      return DB_COMP_loadAnalysis(payload);
      
    default:
      return { ok: false, error: 'Unknown competitor action: ' + action };
  }
}

/**
 * Analyze a single competitor
 * @param {object} payload - Contains domain and options
 * @return {object} Analysis result
 */
function DB_COMP_analyzeCompetitor(payload) {
  try {
    const domain = payload.domain || payload.competitor;
    
    if (!domain) {
      return { ok: false, error: 'Competitor domain required' };
    }
    
    LOG_info('Analyzing competitor', { domain: domain });
    
    const analysis = {
      domain: domain,
      analyzedAt: new Date().toISOString(),
      metrics: {},
      content: {},
      seo: {},
      social: {},
      performance: {}
    };
    
    // Basic metrics
    analysis.metrics = COMP_getBasicMetrics(domain);
    
    // Content analysis
    if (payload.includeContent !== false) {
      analysis.content = COMP_analyzeContent(domain);
    }
    
    // SEO analysis
    if (payload.includeSEO !== false) {
      analysis.seo = COMP_analyzeSEO(domain);
    }
    
    // Performance analysis
    if (payload.includePerformance !== false) {
      analysis.performance = COMP_analyzePerformance(domain);
    }
    
    // Calculate overall score
    analysis.overallScore = COMP_calculateScore(analysis);
    
    return {
      ok: true,
      competitor: domain,
      analysis: analysis
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_COMP_analyzeCompetitor');
  }
}

/**
 * Analyze all competitors for a project
 * @param {object} payload - Contains projectId
 * @return {object} Analysis results
 */
function DB_COMP_analyzeAllCompetitors(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load project to get competitors
    const projectResult = DB_PM_loadProject({ projectId: projectId });
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const competitors = projectResult.project.competitors || [];
    
    if (competitors.length === 0) {
      return { ok: false, error: 'No competitors defined for this project' };
    }
    
    const results = [];
    
    competitors.forEach(competitor => {
      const analysis = DB_COMP_analyzeCompetitor({
        domain: competitor,
        includeContent: true,
        includeSEO: true,
        includePerformance: true
      });
      
      if (analysis.ok) {
        results.push(analysis.analysis);
      }
    });
    
    // Save to project
    GW_saveCompetitorAnalysis(projectId, {
      analyzedAt: new Date().toISOString(),
      competitors: results
    });
    
    return {
      ok: true,
      projectId: projectId,
      analyzedCount: results.length,
      results: results
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_COMP_analyzeAllCompetitors');
  }
}

/**
 * Run Elite 15-category analysis
 * @param {object} payload - Contains projectId
 * @return {object} Elite analysis result
 */
function DB_COMP_runEliteAnalysis(payload) {
  try {
    // Delegate to Elite orchestrator if available
    if (typeof DB_COMP_ELITE_orchestrate === 'function') {
      return DB_COMP_ELITE_orchestrate(payload);
    }
    
    // Fallback to basic analysis
    return DB_COMP_analyzeAllCompetitors(payload);
    
  } catch (err) {
    return CORE_handleError(err, 'DB_COMP_runEliteAnalysis');
  }
}

/**
 * Compare multiple competitors
 * @param {object} payload - Contains competitors array
 * @return {object} Comparison result
 */
function DB_COMP_compareCompetitors(payload) {
  try {
    const competitors = payload.competitors || [];
    
    if (competitors.length < 2) {
      return { ok: false, error: 'At least 2 competitors required for comparison' };
    }
    
    const analyses = [];
    
    competitors.forEach(comp => {
      const result = DB_COMP_analyzeCompetitor({ domain: comp });
      if (result.ok) {
        analyses.push(result.analysis);
      }
    });
    
    const comparison = {
      competitors: analyses.map(a => a.domain),
      comparison: {
        performanceWinner: COMP_findBest(analyses, 'performance.score'),
        contentWinner: COMP_findBest(analyses, 'content.score'),
        seoWinner: COMP_findBest(analyses, 'seo.score'),
        overallWinner: COMP_findBest(analyses, 'overallScore')
      },
      rankings: analyses.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
        .map((a, idx) => ({ rank: idx + 1, domain: a.domain, score: a.overallScore }))
    };
    
    return {
      ok: true,
      comparison: comparison
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_COMP_compareCompetitors');
  }
}

/**
 * Get competitor analysis report
 * @param {object} payload - Contains projectId
 * @return {object} Report
 */
function DB_COMP_getReport(payload) {
  try {
    const projectId = payload.projectId;
    
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load from gateway
    const analysisResult = GW_loadCompetitorAnalysis(projectId);
    
    return {
      ok: true,
      projectId: projectId,
      report: analysisResult.ok ? analysisResult : null
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_COMP_getReport');
  }
}

/**
 * Save competitor analysis
 */
function DB_COMP_saveAnalysis(payload) {
  const projectId = payload.projectId;
  const data = payload.data || payload;
  
  return GW_saveCompetitorAnalysis(projectId, data);
}

/**
 * Load competitor analysis
 */
function DB_COMP_loadAnalysis(payload) {
  return GW_loadCompetitorAnalysis(payload.projectId);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Find best performer for a metric
 */
function COMP_findBest(analyses, path) {
  let best = null;
  let bestValue = -1;
  
  analyses.forEach(a => {
    const value = COMP_getNestedValue(a, path) || 0;
    if (value > bestValue) {
      bestValue = value;
      best = a.domain;
    }
  });
  
  return best;
}

/**
 * Get nested object value by path
 */
function COMP_getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

/**
 * Calculate overall competitor score
 */
function COMP_calculateScore(analysis) {
  const scores = [
    analysis.metrics?.score || 0,
    analysis.content?.score || 0,
    analysis.seo?.score || 0,
    analysis.performance?.score || 0
  ].filter(s => s > 0);
  
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

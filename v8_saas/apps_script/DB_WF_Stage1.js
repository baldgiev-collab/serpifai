/**
 * DB_WF_Stage1.gs - Workflow Stage 1: Strategic Foundation
 * SerpifAI V8 - Keyword research, niche analysis, strategy development
 * 
 * Based on V7's DB_Workflow_Stage1.gs
 */

/**
 * Execute Stage 1 - Strategic Foundation
 * @param {object} payload - Stage payload with projectId
 * @return {object} Stage result
 */
function DB_WF_executeStage1(payload) {
  try {
    LOG_info('Starting Stage 1: Strategic Foundation', { projectId: payload.projectId });
    
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
    
    // Step 1: Niche Analysis
    results.nicheAnalysis = WF1_analyzeNiche(project);
    results.steps.push({ name: 'Niche Analysis', status: 'complete' });
    
    // Step 2: Keyword Research
    results.keywordResearch = WF1_performKeywordResearch(project);
    results.steps.push({ name: 'Keyword Research', status: 'complete' });
    
    // Step 3: Search Intent Mapping
    results.searchIntent = WF1_mapSearchIntent(results.keywordResearch);
    results.steps.push({ name: 'Search Intent Mapping', status: 'complete' });
    
    // Step 4: Opportunity Analysis
    results.opportunities = WF1_analyzeOpportunities(project, results);
    results.steps.push({ name: 'Opportunity Analysis', status: 'complete' });
    
    // Step 5: Strategic Recommendations
    results.recommendations = WF1_generateRecommendations(results);
    results.steps.push({ name: 'Strategic Recommendations', status: 'complete' });
    
    // Save stage data to project
    const saveResult = DB_WF_saveStageData(1, {
      projectId: projectId,
      data: results
    });
    
    return {
      ok: true,
      stage: 1,
      stageName: 'Strategic Foundation',
      results: results,
      nextStage: 2
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_executeStage1');
  }
}

/**
 * Analyze niche/industry
 * @param {object} project - Project data
 * @return {object} Niche analysis
 */
function WF1_analyzeNiche(project) {
  const niche = project.niche || '';
  const domain = project.domain || '';
  
  // Use AI to analyze niche if available
  let aiAnalysis = null;
  if (typeof AI_analyze === 'function') {
    aiAnalysis = AI_analyze('niche_analysis', {
      niche: niche,
      domain: domain,
      brandName: project.brandName
    });
  }
  
  return {
    niche: niche,
    domain: domain,
    marketSize: aiAnalysis?.marketSize || 'medium',
    competition: aiAnalysis?.competition || 'moderate',
    trends: aiAnalysis?.trends || [],
    opportunities: aiAnalysis?.opportunities || [],
    challenges: aiAnalysis?.challenges || [],
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Perform keyword research
 * @param {object} project - Project data
 * @return {object} Keyword research results
 */
function WF1_performKeywordResearch(project) {
  const seedKeywords = project.keywords || [];
  const niche = project.niche || '';
  
  // Expand seed keywords
  const expandedKeywords = [];
  
  // If project has seed keywords, expand them
  if (seedKeywords.length > 0) {
    seedKeywords.forEach(kw => {
      expandedKeywords.push({
        keyword: kw,
        type: 'seed',
        searchVolume: null,
        difficulty: null,
        intent: WF1_classifyIntent(kw)
      });
    });
  }
  
  // Use Fetcher to get SERP data if available
  if (typeof FT_fetchSERP === 'function' && seedKeywords.length > 0) {
    const serpResult = FT_fetchSERP({ keyword: seedKeywords[0] });
    if (serpResult.ok && serpResult.relatedSearches) {
      serpResult.relatedSearches.forEach(related => {
        expandedKeywords.push({
          keyword: related,
          type: 'related',
          searchVolume: null,
          difficulty: null,
          intent: WF1_classifyIntent(related)
        });
      });
    }
  }
  
  return {
    seedKeywords: seedKeywords,
    expandedKeywords: expandedKeywords,
    totalKeywords: expandedKeywords.length,
    categories: WF1_categorizeKeywords(expandedKeywords),
    researchedAt: new Date().toISOString()
  };
}

/**
 * Classify search intent of a keyword
 * @param {string} keyword - Keyword to classify
 * @return {string} Intent type
 */
function WF1_classifyIntent(keyword) {
  const kw = (keyword || '').toLowerCase();
  
  // Transactional
  if (/buy|price|cheap|deal|discount|purchase|order|shop|sale/.test(kw)) {
    return 'transactional';
  }
  
  // Commercial investigation
  if (/best|top|review|compare|vs|versus|alternative/.test(kw)) {
    return 'commercial';
  }
  
  // Navigational
  if (/login|signin|website|official|contact/.test(kw)) {
    return 'navigational';
  }
  
  // Informational (default)
  return 'informational';
}

/**
 * Categorize keywords by topic
 * @param {Array} keywords - Keywords array
 * @return {object} Categorized keywords
 */
function WF1_categorizeKeywords(keywords) {
  const categories = {};
  
  keywords.forEach(kw => {
    const intent = kw.intent || 'other';
    if (!categories[intent]) {
      categories[intent] = [];
    }
    categories[intent].push(kw);
  });
  
  return categories;
}

/**
 * Map search intent across keywords
 * @param {object} keywordResearch - Keyword research results
 * @return {object} Intent mapping
 */
function WF1_mapSearchIntent(keywordResearch) {
  const keywords = keywordResearch.expandedKeywords || [];
  
  const intentMap = {
    informational: [],
    commercial: [],
    transactional: [],
    navigational: []
  };
  
  keywords.forEach(kw => {
    const intent = kw.intent || 'informational';
    if (intentMap[intent]) {
      intentMap[intent].push(kw.keyword);
    }
  });
  
  return {
    intentMap: intentMap,
    distribution: {
      informational: intentMap.informational.length,
      commercial: intentMap.commercial.length,
      transactional: intentMap.transactional.length,
      navigational: intentMap.navigational.length
    },
    primaryIntent: WF1_getPrimaryIntent(intentMap)
  };
}

/**
 * Get primary intent based on distribution
 * @param {object} intentMap - Intent map
 * @return {string} Primary intent
 */
function WF1_getPrimaryIntent(intentMap) {
  let maxCount = 0;
  let primary = 'informational';
  
  for (const intent in intentMap) {
    if (intentMap[intent].length > maxCount) {
      maxCount = intentMap[intent].length;
      primary = intent;
    }
  }
  
  return primary;
}

/**
 * Analyze opportunities based on research
 * @param {object} project - Project data
 * @param {object} results - Stage results so far
 * @return {object} Opportunity analysis
 */
function WF1_analyzeOpportunities(project, results) {
  const keywords = results.keywordResearch?.expandedKeywords || [];
  const niche = results.nicheAnalysis;
  
  const opportunities = [];
  
  // Low competition opportunities
  const lowCompKeywords = keywords.filter(kw => kw.difficulty === 'low');
  if (lowCompKeywords.length > 0) {
    opportunities.push({
      type: 'low_competition_keywords',
      description: 'Target low competition keywords for quick wins',
      keywords: lowCompKeywords.slice(0, 5),
      priority: 'high'
    });
  }
  
  // Content gap opportunities
  opportunities.push({
    type: 'content_gaps',
    description: 'Identify content gaps competitors are missing',
    priority: 'medium'
  });
  
  // Intent-based opportunities
  const intentDist = results.searchIntent?.distribution || {};
  if (intentDist.commercial > 0) {
    opportunities.push({
      type: 'commercial_content',
      description: 'Create comparison and review content',
      keywords: results.searchIntent.intentMap.commercial?.slice(0, 5),
      priority: 'high'
    });
  }
  
  return {
    opportunities: opportunities,
    totalOpportunities: opportunities.length,
    highPriority: opportunities.filter(o => o.priority === 'high').length
  };
}

/**
 * Generate strategic recommendations
 * @param {object} results - All stage results
 * @return {object} Recommendations
 */
function WF1_generateRecommendations(results) {
  const recommendations = [];
  
  // Based on keyword research
  if (results.keywordResearch?.totalKeywords > 0) {
    recommendations.push({
      category: 'Keywords',
      recommendation: 'Focus on ' + results.keywordResearch.totalKeywords + ' target keywords',
      priority: 'high'
    });
  }
  
  // Based on intent mapping
  const primaryIntent = results.searchIntent?.primaryIntent || 'informational';
  recommendations.push({
    category: 'Content Strategy',
    recommendation: 'Prioritize ' + primaryIntent + ' content based on search intent analysis',
    priority: 'high'
  });
  
  // Based on opportunities
  if (results.opportunities?.highPriority > 0) {
    recommendations.push({
      category: 'Quick Wins',
      recommendation: 'Address ' + results.opportunities.highPriority + ' high-priority opportunities first',
      priority: 'high'
    });
  }
  
  return {
    recommendations: recommendations,
    totalRecommendations: recommendations.length,
    nextSteps: [
      'Proceed to Stage 2: Competitive Intelligence',
      'Analyze top 3-5 competitors in detail',
      'Map competitor content strategies'
    ]
  };
}

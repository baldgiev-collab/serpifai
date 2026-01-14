/**
 * DB_WF_Stage3.gs - Workflow Stage 3: Content Architecture
 * SerpifAI V8 - Topic clusters, site structure, content mapping
 * 
 * Based on V7's DB_Workflow_Stage3.gs
 */

/**
 * Execute Stage 3 - Content Architecture
 * @param {object} payload - Stage payload with projectId
 * @return {object} Stage result
 */
function DB_WF_executeStage3(payload) {
  try {
    LOG_info('Starting Stage 3: Content Architecture', { projectId: payload.projectId });
    
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
    
    // Load previous stage data
    const stage1Data = project.workflowState?.stageData?.[1] || {};
    const stage2Data = project.workflowState?.stageData?.[2] || {};
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: []
    };
    
    // Step 1: Topic Cluster Design
    results.topicClusters = WF3_designTopicClusters(project, stage1Data);
    results.steps.push({ name: 'Topic Cluster Design', status: 'complete' });
    
    // Step 2: Pillar Page Planning
    results.pillarPages = WF3_planPillarPages(results.topicClusters);
    results.steps.push({ name: 'Pillar Page Planning', status: 'complete' });
    
    // Step 3: Content Mapping
    results.contentMap = WF3_createContentMap(results.topicClusters, results.pillarPages);
    results.steps.push({ name: 'Content Mapping', status: 'complete' });
    
    // Step 4: Internal Linking Strategy
    results.linkingStrategy = WF3_developLinkingStrategy(results.contentMap);
    results.steps.push({ name: 'Internal Linking Strategy', status: 'complete' });
    
    // Step 5: Content Calendar
    results.contentCalendar = WF3_createContentCalendar(results);
    results.steps.push({ name: 'Content Calendar', status: 'complete' });
    
    // Save stage data to project
    const saveResult = DB_WF_saveStageData(3, {
      projectId: projectId,
      data: results
    });
    
    return {
      ok: true,
      stage: 3,
      stageName: 'Content Architecture',
      results: results,
      nextStage: 4
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_executeStage3');
  }
}

/**
 * Design topic clusters based on keyword research
 * @param {object} project - Project data
 * @param {object} stage1Data - Stage 1 results
 * @return {object} Topic clusters
 */
function WF3_designTopicClusters(project, stage1Data) {
  const keywords = stage1Data.keywordResearch?.expandedKeywords || [];
  const niche = project.niche || '';
  
  // Group keywords into clusters
  const clusters = [];
  
  // Create main cluster from niche
  if (niche) {
    clusters.push({
      id: 'cluster_1',
      name: niche,
      type: 'primary',
      pillarTopic: niche + ' Complete Guide',
      subTopics: [],
      keywords: keywords.filter(kw => 
        kw.keyword.toLowerCase().includes(niche.toLowerCase())
      ).map(kw => kw.keyword)
    });
  }
  
  // Group by intent
  const intentGroups = stage1Data.searchIntent?.intentMap || {};
  Object.keys(intentGroups).forEach((intent, idx) => {
    if (intentGroups[intent].length > 0) {
      clusters.push({
        id: 'cluster_' + (idx + 2),
        name: intent.charAt(0).toUpperCase() + intent.slice(1) + ' Content',
        type: 'secondary',
        pillarTopic: 'Best ' + niche + ' ' + intent + ' Guide',
        subTopics: [],
        keywords: intentGroups[intent]
      });
    }
  });
  
  return {
    clusters: clusters,
    totalClusters: clusters.length,
    totalKeywordsCovered: clusters.reduce((sum, c) => sum + c.keywords.length, 0)
  };
}

/**
 * Plan pillar pages for each cluster
 * @param {object} topicClusters - Topic cluster data
 * @return {object} Pillar page plans
 */
function WF3_planPillarPages(topicClusters) {
  const clusters = topicClusters.clusters || [];
  const pillarPages = [];
  
  clusters.forEach(cluster => {
    pillarPages.push({
      clusterId: cluster.id,
      title: cluster.pillarTopic,
      type: 'pillar',
      targetWordCount: 3000,
      sections: [
        { name: 'Introduction', wordCount: 300 },
        { name: 'What is ' + cluster.name, wordCount: 500 },
        { name: 'Benefits', wordCount: 400 },
        { name: 'How to Get Started', wordCount: 600 },
        { name: 'Best Practices', wordCount: 500 },
        { name: 'Common Mistakes', wordCount: 400 },
        { name: 'FAQ', wordCount: 300 }
      ],
      linkedClusterContent: cluster.keywords.slice(0, 10),
      status: 'planned'
    });
  });
  
  return {
    pillarPages: pillarPages,
    totalPillarPages: pillarPages.length
  };
}

/**
 * Create content map connecting all content pieces
 * @param {object} topicClusters - Topic clusters
 * @param {object} pillarPages - Pillar pages
 * @return {object} Content map
 */
function WF3_createContentMap(topicClusters, pillarPages) {
  const contentMap = {
    nodes: [],
    links: []
  };
  
  // Add pillar pages as nodes
  pillarPages.pillarPages.forEach(pillar => {
    contentMap.nodes.push({
      id: 'pillar_' + pillar.clusterId,
      type: 'pillar',
      title: pillar.title,
      clusterId: pillar.clusterId
    });
  });
  
  // Add cluster content as nodes
  topicClusters.clusters.forEach(cluster => {
    cluster.keywords.forEach((kw, idx) => {
      const nodeId = cluster.id + '_content_' + idx;
      contentMap.nodes.push({
        id: nodeId,
        type: 'cluster_content',
        title: kw,
        clusterId: cluster.id
      });
      
      // Link to pillar
      contentMap.links.push({
        source: nodeId,
        target: 'pillar_' + cluster.id,
        type: 'supports'
      });
    });
  });
  
  return {
    contentMap: contentMap,
    totalNodes: contentMap.nodes.length,
    totalLinks: contentMap.links.length
  };
}

/**
 * Develop internal linking strategy
 * @param {object} contentMap - Content map
 * @return {object} Linking strategy
 */
function WF3_developLinkingStrategy(contentMap) {
  return {
    principles: [
      'Every cluster content links to its pillar page',
      'Pillar pages link to top 5-7 cluster content pieces',
      'Cross-cluster links for related topics',
      'Use descriptive anchor text matching target keywords'
    ],
    linkingRules: {
      pillarToCluster: 5,
      clusterToPillar: 1,
      crossCluster: 2
    },
    linkTypes: [
      { type: 'contextual', description: 'Natural in-content links', priority: 'high' },
      { type: 'navigational', description: 'Table of contents links', priority: 'medium' },
      { type: 'related', description: 'Related content widgets', priority: 'medium' }
    ]
  };
}

/**
 * Create content calendar from content map
 * @param {object} results - Stage results
 * @return {object} Content calendar
 */
function WF3_createContentCalendar(results) {
  const pillarPages = results.pillarPages?.pillarPages || [];
  const clusters = results.topicClusters?.clusters || [];
  
  const calendar = [];
  const today = new Date();
  let weekOffset = 0;
  
  // Schedule pillar pages first (one per week)
  pillarPages.forEach((pillar, idx) => {
    const publishDate = new Date(today);
    publishDate.setDate(publishDate.getDate() + (weekOffset * 7));
    
    calendar.push({
      week: weekOffset + 1,
      date: publishDate.toISOString().split('T')[0],
      contentType: 'Pillar Page',
      title: pillar.title,
      clusterId: pillar.clusterId,
      wordCount: pillar.targetWordCount,
      status: 'scheduled'
    });
    
    weekOffset++;
  });
  
  // Schedule cluster content (2 per week after pillar pages)
  clusters.forEach(cluster => {
    cluster.keywords.slice(0, 5).forEach((kw, idx) => {
      const publishDate = new Date(today);
      publishDate.setDate(publishDate.getDate() + (weekOffset * 7) + (idx % 2 === 0 ? 0 : 3));
      
      calendar.push({
        week: weekOffset + 1 + Math.floor(idx / 2),
        date: publishDate.toISOString().split('T')[0],
        contentType: 'Cluster Content',
        title: kw,
        clusterId: cluster.id,
        wordCount: 1500,
        status: 'scheduled'
      });
    });
    
    weekOffset += 3;
  });
  
  return {
    calendar: calendar,
    totalContentPieces: calendar.length,
    totalWeeks: weekOffset,
    weeklyPace: Math.ceil(calendar.length / Math.max(weekOffset, 1))
  };
}

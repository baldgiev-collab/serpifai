/**
 * ⚡ SERPIFAI Elite - Stage 3: Content Architecture & Clustering
 * Topical Galaxy, SILO Structure, Hub-Spoke Model
 * v1.0 Oracle Elite Edition
 * 
 * MISSION: Transform keyword clusters into strategic content architecture
 * INPUT: Stage 2 keywordClusters, entityMap, funnelBreakdown
 * OUTPUT: Content architecture with internal linking strategy
 */

/**
 * Main execution function for Stage 3
 * @param {Object} projectData - Project data including Stage 1-2 results
 * @param {string} selectedModel - Gemini model to use
 * @returns {Object} Stage 3 results
 */
function DB_Workflow_Stage3(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 3: Content Architecture & Clustering');
    
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object');
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // Load Stage 1 & 2 results
    const stage1Results = loadStageResults(projectData, 1);
    const stage2Results = loadStageResults(projectData, 2);
    
    if (stage1Results) {
      Logger.log('✅ Stage 1 results loaded');
      projectData._stage1Results = stage1Results;
    }
    if (stage2Results) {
      Logger.log('✅ Stage 2 results loaded');
      projectData._stage2Results = stage2Results;
    }
    
    // Build the Stage 3 prompt
    const prompt = buildStage3Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage3GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response
    const structuredData = parseStage3Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // MySQL Persistence
    const projectId = projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT';
    try {
      if (typeof UPP_commit === 'function') {
        const persistResult = UPP_commit({
          type: 'workflow_stage',
          domain: projectId,
          competitorId: projectId,
          payload: {
            stage: 3,
            stageName: 'Content Architecture & Clustering',
            model: selectedModel,
            json: structuredData,
            report: cleanReport,
            timestamp: new Date().toISOString()
          }
        });
        Logger.log('💾 Stage 3 MySQL persistence: ' + (persistResult.success ? '✅' : '⚠️'));
      }
    } catch (persistError) {
      Logger.log('⚠️ Stage 3 persistence error (non-fatal): ' + persistError.toString());
    }
    
    return {
      success: true,
      stage: 3,
      stageName: 'Content Architecture & Clustering',
      json: structuredData,
      report: cleanReport,
      timestamp: new Date().toISOString(),
      projectId: projectId
    };
    
  } catch (error) {
    Logger.log('❌ Stage 3 Error: ' + error.toString());
    return {
      success: false,
      stage: 3,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Load previous stage results from MySQL
 */
function loadStageResults(projectData, stageNum) {
  try {
    const projectId = projectData.projectId || projectData.brandName;
    if (!projectId) return null;
    
    const response = callGateway('job_get_results', {
      project_id: projectId,
      result_type: 'WORKFLOW_STAGE_' + stageNum
    });
    
    if (response?.success && response?.results?.length > 0) {
      return JSON.parse(response.results[0].data_json || '{}');
    }
    return null;
  } catch (error) {
    Logger.log('⚠️ Could not load Stage ' + stageNum + ' results: ' + error.toString());
    return null;
  }
}

/**
 * Build Stage 3 prompt for Content Architecture
 */
function buildStage3Prompt(projectData) {
  const stage1 = projectData._stage1Results || {};
  const stage2 = projectData._stage2Results || {};
  
  const pillars = stage1.contentPillars || [];
  const clusters = stage2.keywordClusters || [];
  const entities = stage2.entityMap || [];
  const funnel = stage2.funnelBreakdown || {};
  
  return `You are an elite content strategist performing STAGE 3: Content Architecture & Clustering.

## MISSION
Design a comprehensive content architecture that:
1. Creates a Topical Galaxy with Hub-Spoke relationships
2. Builds SILO structures for topical authority
3. Maps internal linking strategy for SEO power distribution
4. Prioritizes content by strategic impact

## PREVIOUS STAGE CONTEXT

### Stage 1: Content Pillars
${JSON.stringify(pillars, null, 2)}

### Stage 2: Keyword Clusters
${JSON.stringify(clusters, null, 2)}

### Stage 2: Entity Map
${JSON.stringify(entities, null, 2)}

### Stage 2: Funnel Breakdown
${JSON.stringify(funnel, null, 2)}

## PROJECT CONTEXT

- **Brand:** ${projectData.brandName || 'Unknown'}
- **Primary Keyword:** ${projectData.primaryKeyword || 'Not specified'}
- **Core Topic:** ${projectData.coreTopic || 'Not specified'}
- **Target Audience:** ${projectData.targetAudience || 'Not specified'}

## OUTPUT REQUIREMENTS

### PART 1: JSON Structure

\`\`\`json
{
  "topicalGalaxy": {
    "centerNode": {
      "title": "Core pillar page title",
      "keyword": "Primary keyword",
      "type": "pillar",
      "wordCount": 3000,
      "priority": 1
    },
    "orbitingNodes": [
      {
        "id": "node_1",
        "title": "Cluster hub title",
        "keyword": "Cluster primary keyword",
        "type": "hub",
        "parentId": "center",
        "wordCount": 2000,
        "priority": 2,
        "supportingPages": [
          {
            "id": "spoke_1",
            "title": "Supporting page title",
            "keyword": "Long-tail keyword",
            "type": "spoke",
            "wordCount": 1200,
            "funnelStage": "ToFU|MoFU|BoFU"
          }
        ]
      }
    ]
  },
  "siloStructure": [
    {
      "siloName": "Topic silo name",
      "siloKeyword": "Main silo keyword",
      "pillarPage": {
        "title": "Pillar page title",
        "url": "/pillar-page-slug",
        "targetKeyword": "Primary keyword"
      },
      "supportingPages": [
        {
          "title": "Supporting page",
          "url": "/supporting-slug",
          "linksTo": ["/pillar-page-slug"],
          "linksFrom": ["/pillar-page-slug"]
        }
      ],
      "internalLinkingRules": [
        "Rule 1: Always link from spoke to hub",
        "Rule 2: Cross-link between related spokes"
      ]
    }
  ],
  "internalLinkingMap": [
    {
      "sourceUrl": "/page-a",
      "targetUrl": "/page-b",
      "anchorText": "Exact anchor text",
      "linkType": "contextual|navigation|footer",
      "priority": 1,
      "seoRationale": "Why this link matters"
    }
  ],
  "contentPriorityMatrix": [
    {
      "title": "Content piece title",
      "keyword": "Target keyword",
      "type": "pillar|hub|spoke",
      "priority": 1,
      "estimatedTraffic": 5000,
      "difficulty": 45,
      "strategicValue": "high|medium|low",
      "dependencies": ["other-page-ids"],
      "recommendedPublishOrder": 1
    }
  ],
  "topicalAuthorityScore": {
    "currentCoverage": 25,
    "targetCoverage": 85,
    "gapAreas": ["topic1", "topic2"],
    "competitorComparison": {
      "leader": "competitor.com",
      "leaderCoverage": 75,
      "ourGap": 50
    }
  },
  "d3ForceGraphData": {
    "nodes": [
      {"id": "node1", "label": "Page Title", "type": "pillar|hub|spoke", "size": 30}
    ],
    "links": [
      {"source": "node1", "target": "node2", "strength": 0.8}
    ]
  }
}
\`\`\`

### PART 2: Architecture Report (Markdown)

After JSON, provide:
1. Topical Galaxy Overview
2. SILO Structure Recommendations
3. Internal Linking Strategy
4. Content Priority Roadmap
5. Topical Authority Gap Analysis
6. Implementation Timeline

Be specific and actionable.`;
}

/**
 * Call Gemini API for Stage 3
 */
function callStage3GeminiAPI(prompt, selectedModel) {
  const model = selectedModel || 'gemini-3-flash-preview';
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
      topP: 0.95
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  
  if (json.error) {
    throw new Error('Gemini API error: ' + JSON.stringify(json.error));
  }
  
  if (!json.candidates || !json.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid Gemini response structure');
  }
  
  return json.candidates[0].content.parts[0].text;
}

/**
 * Parse Stage 3 response
 */
function parseStage3Response(fullResponse) {
  try {
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    
    const jsonStart = fullResponse.indexOf('{');
    const jsonEnd = fullResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(fullResponse.substring(jsonStart, jsonEnd + 1));
    }
    
    return {
      topicalGalaxy: { centerNode: {}, orbitingNodes: [] },
      siloStructure: [],
      internalLinkingMap: [],
      contentPriorityMatrix: [],
      d3ForceGraphData: { nodes: [], links: [] },
      parseError: 'Could not extract JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Parse error: ' + error.toString());
    return {
      topicalGalaxy: { centerNode: {}, orbitingNodes: [] },
      criticalError: error.toString()
    };
  }
}

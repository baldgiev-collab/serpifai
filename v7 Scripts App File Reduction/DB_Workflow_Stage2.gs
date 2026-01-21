/**
 * ⚡ SERPIFAI Elite - Stage 2: Entity & Keyword Discovery
 * LSI Expansion, Semantic Clustering, ToFU/MoFU/BoFU Classification
 * v1.0 Oracle Elite Edition
 * 
 * MISSION: Build comprehensive keyword intelligence from Stage 1 insights
 * INPUT: Stage 1 contentPillars, jtbdScenarios, competitiveGaps
 * OUTPUT: Expanded keyword map with entity relationships
 */

/**
 * Main execution function for Stage 2
 * @param {Object} projectData - Project data including Stage 1 results
 * @param {string} selectedModel - Gemini model to use
 * @returns {Object} Stage 2 results
 */
function DB_Workflow_Stage2(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 2: Entity & Keyword Discovery');
    
    // VALIDATION
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object');
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // Load Stage 1 results if available
    const stage1Results = loadStage1Results(projectData);
    if (stage1Results) {
      Logger.log('✅ Stage 1 results loaded: ' + Object.keys(stage1Results).length + ' keys');
      projectData._stage1Results = stage1Results;
    } else {
      Logger.log('⚠️ No Stage 1 results found - running with limited context');
    }
    
    // Build the Stage 2 prompt
    const prompt = buildStage2Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage2GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response into structured JSON
    const structuredData = parseStage2Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // =========================================================================
    // MYSQL PERSISTENCE
    // =========================================================================
    const projectId = projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT';
    try {
      if (typeof UPP_commit === 'function') {
        const persistResult = UPP_commit({
          type: 'workflow_stage',
          domain: projectId,
          competitorId: projectId,
          payload: {
            stage: 2,
            stageName: 'Entity & Keyword Discovery',
            model: selectedModel,
            json: structuredData,
            report: cleanReport,
            timestamp: new Date().toISOString()
          }
        });
        Logger.log('💾 Stage 2 MySQL persistence: ' + (persistResult.success ? '✅' : '⚠️'));
      }
    } catch (persistError) {
      Logger.log('⚠️ Stage 2 persistence error (non-fatal): ' + persistError.toString());
    }
    
    return {
      success: true,
      stage: 2,
      stageName: 'Entity & Keyword Discovery',
      json: structuredData,
      report: cleanReport,
      timestamp: new Date().toISOString(),
      projectId: projectId
    };
    
  } catch (error) {
    Logger.log('❌ Stage 2 Error: ' + error.toString());
    return {
      success: false,
      stage: 2,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Load Stage 1 results from MySQL or cache
 */
function loadStage1Results(projectData) {
  try {
    const projectId = projectData.projectId || projectData.brandName;
    if (!projectId) return null;
    
    // Try to load from job_results
    const response = callGateway('job_get_results', {
      project_id: projectId,
      result_type: 'WORKFLOW_STAGE_1'
    });
    
    if (response?.success && response?.results?.length > 0) {
      return JSON.parse(response.results[0].data_json || '{}');
    }
    
    return null;
  } catch (error) {
    Logger.log('⚠️ Could not load Stage 1 results: ' + error.toString());
    return null;
  }
}

/**
 * Build Stage 2 prompt for Entity & Keyword Discovery
 */
function buildStage2Prompt(projectData) {
  const stage1 = projectData._stage1Results || {};
  const pillars = stage1.contentPillars || projectData.contentPillars || [];
  const jtbd = stage1.jtbdScenarios || projectData.jtbdScenarios || [];
  const gaps = stage1.competitiveGaps || projectData.competitiveGaps || {};
  
  return `You are an elite SEO strategist performing STAGE 2: Entity & Keyword Discovery.

## MISSION
Transform Stage 1 strategic insights into a comprehensive keyword intelligence map with:
1. LSI (Latent Semantic Indexing) keyword expansion
2. Entity relationship mapping
3. ToFU/MoFU/BoFU funnel classification
4. Cite-ability score for featured snippet potential
5. Semantic clusters for content architecture

## STAGE 1 CONTEXT

### Content Pillars (from Stage 1)
${JSON.stringify(pillars, null, 2)}

### Jobs-To-Be-Done Scenarios
${JSON.stringify(jtbd, null, 2)}

### Competitive Gaps
${JSON.stringify(gaps, null, 2)}

## PROJECT CONTEXT

- **Brand:** ${projectData.brandName || 'Unknown'}
- **Primary Keyword:** ${projectData.primaryKeyword || 'Not specified'}
- **Secondary Keywords:** ${projectData.secondaryKeywords || 'Not specified'}
- **Target Audience:** ${projectData.targetAudience || 'Not specified'}
- **Industry:** ${projectData.industryVertical || 'Not specified'}

## OUTPUT REQUIREMENTS

Respond with PART 1 (JSON) followed by PART 2 (Markdown Report):

### PART 1: JSON Structure

\`\`\`json
{
  "keywordClusters": [
    {
      "clusterName": "Cluster name",
      "pillarAlignment": "Which content pillar this supports",
      "primaryKeyword": "Main seed keyword",
      "lsiKeywords": ["lsi1", "lsi2", "lsi3"],
      "entities": [
        {"entity": "Entity name", "type": "Person|Organization|Concept|Product", "salience": 0.8}
      ],
      "funnelStage": "ToFU|MoFU|BoFU",
      "searchIntent": "informational|commercial|transactional|navigational",
      "monthlyVolume": 1000,
      "difficulty": 45,
      "citeabilityScore": 8,
      "featuredSnippetPotential": "high|medium|low",
      "suggestedContentType": "guide|comparison|listicle|how-to"
    }
  ],
  "entityMap": [
    {
      "entity": "Entity name",
      "type": "Person|Organization|Concept|Product|Place",
      "relatedKeywords": ["kw1", "kw2"],
      "competitorMentions": 5,
      "authoritySignals": ["signal1", "signal2"],
      "contentOpportunities": ["opportunity1"]
    }
  ],
  "funnelBreakdown": {
    "tofu": {
      "keywords": ["awareness keywords"],
      "contentTypes": ["blog posts", "guides"],
      "targetVolume": 50000
    },
    "mofu": {
      "keywords": ["consideration keywords"],
      "contentTypes": ["comparisons", "case studies"],
      "targetVolume": 20000
    },
    "bofu": {
      "keywords": ["decision keywords"],
      "contentTypes": ["product pages", "demos"],
      "targetVolume": 5000
    }
  },
  "longTailOpportunities": [
    {
      "keyword": "Long tail phrase",
      "parentCluster": "Related cluster",
      "volume": 100,
      "difficulty": 20,
      "citeabilityScore": 9,
      "contentAngle": "Unique angle to cover"
    }
  ],
  "semanticRelationships": [
    {
      "from": "keyword1",
      "to": "keyword2",
      "relationshipType": "synonym|broader|narrower|related",
      "strength": 0.9
    }
  ],
  "quickWins": [
    {
      "keyword": "Low-hanging fruit keyword",
      "reason": "Why this is a quick win",
      "estimatedTimeToRank": "2-4 weeks",
      "contentNeeded": "What content to create"
    }
  ]
}
\`\`\`

### PART 2: Entity Discovery Report (Markdown)

After JSON, provide comprehensive analysis:
1. Keyword Universe Overview
2. Entity Relationship Analysis
3. Funnel Strategy Recommendations
4. Featured Snippet Opportunities
5. Competitive Keyword Gaps
6. Priority Ranking Matrix

Be specific, actionable, and data-driven.`;
}

/**
 * Call Gemini API for Stage 2
 */
function callStage2GeminiAPI(prompt, selectedModel) {
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
 * Parse Stage 2 response
 */
function parseStage2Response(fullResponse) {
  try {
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Fallback: Try to find JSON object
    const jsonStart = fullResponse.indexOf('{');
    const jsonEnd = fullResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(fullResponse.substring(jsonStart, jsonEnd + 1));
    }
    
    // Return minimal structure
    return {
      keywordClusters: [],
      entityMap: [],
      funnelBreakdown: { tofu: {}, mofu: {}, bofu: {} },
      longTailOpportunities: [],
      quickWins: [],
      parseError: 'Could not extract JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Parse error: ' + error.toString());
    return {
      keywordClusters: [],
      entityMap: [],
      criticalError: error.toString()
    };
  }
}

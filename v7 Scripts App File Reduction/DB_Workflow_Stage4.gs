/**
 * ⚡ SERPIFAI Elite - Stage 4: Content Calendar & Velocity Planning
 * Editorial Calendar, Seasonality, Publishing Roadmap
 * v1.0 Oracle Elite Edition
 * 
 * MISSION: Create actionable content calendar with velocity planning
 * INPUT: Stage 3 contentPriorityMatrix, siloStructure
 * OUTPUT: 90-day editorial calendar with Gantt chart data
 */

/**
 * Main execution function for Stage 4
 * @param {Object} projectData - Project data including Stage 1-3 results
 * @param {string} selectedModel - Gemini model to use
 * @returns {Object} Stage 4 results
 */
function DB_Workflow_Stage4(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 4: Content Calendar & Velocity Planning');
    
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object');
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // Load previous stage results
    const stage1Results = loadStageResults(projectData, 1);
    const stage2Results = loadStageResults(projectData, 2);
    const stage3Results = loadStageResults(projectData, 3);
    
    if (stage1Results) projectData._stage1Results = stage1Results;
    if (stage2Results) projectData._stage2Results = stage2Results;
    if (stage3Results) projectData._stage3Results = stage3Results;
    
    Logger.log('✅ Previous stage results loaded');
    
    // Build the Stage 4 prompt
    const prompt = buildStage4Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage4GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response
    const structuredData = parseStage4Response(geminiResponse);
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
            stage: 4,
            stageName: 'Content Calendar & Velocity Planning',
            model: selectedModel,
            json: structuredData,
            report: cleanReport,
            timestamp: new Date().toISOString()
          }
        });
        Logger.log('💾 Stage 4 MySQL persistence: ' + (persistResult.success ? '✅' : '⚠️'));
      }
    } catch (persistError) {
      Logger.log('⚠️ Stage 4 persistence error (non-fatal): ' + persistError.toString());
    }
    
    return {
      success: true,
      stage: 4,
      stageName: 'Content Calendar & Velocity Planning',
      json: structuredData,
      report: cleanReport,
      timestamp: new Date().toISOString(),
      projectId: projectId
    };
    
  } catch (error) {
    Logger.log('❌ Stage 4 Error: ' + error.toString());
    return {
      success: false,
      stage: 4,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Build Stage 4 prompt for Content Calendar
 */
function buildStage4Prompt(projectData) {
  const stage1 = projectData._stage1Results || {};
  const stage3 = projectData._stage3Results || {};
  
  const pillars = stage1.contentPillars || [];
  const priorityMatrix = stage3.contentPriorityMatrix || [];
  const siloStructure = stage3.siloStructure || [];
  const seasonality = projectData.seasonality || 'Not specified';
  
  // Get current date for calendar planning
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  
  return `You are an elite content strategist performing STAGE 4: Content Calendar & Velocity Planning.

## MISSION
Create a comprehensive 90-day editorial calendar that:
1. Prioritizes content by strategic impact and dependencies
2. Accounts for seasonality and market timing
3. Balances quick wins with long-term authority building
4. Provides realistic velocity based on resource constraints
5. Includes Gantt chart data for visualization

## PREVIOUS STAGE CONTEXT

### Stage 1: Content Pillars
${JSON.stringify(pillars, null, 2)}

### Stage 3: Content Priority Matrix
${JSON.stringify(priorityMatrix, null, 2)}

### Stage 3: SILO Structure
${JSON.stringify(siloStructure, null, 2)}

## PROJECT CONTEXT

- **Brand:** ${projectData.brandName || 'Unknown'}
- **Start Date:** ${startDate}
- **Seasonality:** ${seasonality}
- **Quarterly Objective:** ${projectData.quarterlyObjective || 'Not specified'}
- **Content Goals:** ${projectData.contentGoals || 'Not specified'}
- **Primary Channels:** ${projectData.primaryChannels || 'Not specified'}

## OUTPUT REQUIREMENTS

### PART 1: JSON Structure

\`\`\`json
{
  "calendarOverview": {
    "startDate": "${startDate}",
    "endDate": "90 days from start",
    "totalPieces": 24,
    "weeklyVelocity": 2,
    "contentMix": {
      "pillar": 2,
      "hub": 6,
      "spoke": 16
    }
  },
  "weeklySchedule": [
    {
      "weekNumber": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "theme": "Weekly theme",
      "pieces": [
        {
          "id": "content_1",
          "title": "Content title",
          "type": "pillar|hub|spoke",
          "keyword": "Target keyword",
          "wordCount": 2000,
          "dueDate": "YYYY-MM-DD",
          "publishDate": "YYYY-MM-DD",
          "status": "planned",
          "assignee": "Content Team",
          "dependencies": [],
          "silo": "Silo name",
          "funnelStage": "ToFU|MoFU|BoFU",
          "estimatedHours": 8,
          "priority": 1
        }
      ],
      "weeklyGoals": ["Goal 1", "Goal 2"]
    }
  ],
  "ganttChartData": [
    {
      "id": "task_1",
      "name": "Content piece title",
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "progress": 0,
      "dependencies": "",
      "type": "task",
      "milestone": false,
      "resourceId": "writer_1"
    }
  ],
  "milestones": [
    {
      "id": "milestone_1",
      "name": "Milestone name",
      "date": "YYYY-MM-DD",
      "type": "launch|review|goal",
      "deliverables": ["Deliverable 1"]
    }
  ],
  "seasonalOpportunities": [
    {
      "event": "Seasonal event name",
      "date": "YYYY-MM-DD",
      "contentNeeded": "Content to create",
      "leadTime": "2 weeks",
      "priority": "high|medium|low"
    }
  ],
  "resourceAllocation": {
    "writers": 2,
    "hoursPerWeek": 40,
    "contentCapacity": 3,
    "bottlenecks": ["Research", "Review"]
  },
  "quickWinsFirst30Days": [
    {
      "title": "Quick win content",
      "keyword": "Low-hanging keyword",
      "expectedImpact": "500 visits/month",
      "effortHours": 4
    }
  ],
  "kpiTargets": {
    "day30": {
      "pagesPublished": 8,
      "estimatedTraffic": 2000,
      "keywordsTargeted": 25
    },
    "day60": {
      "pagesPublished": 16,
      "estimatedTraffic": 5000,
      "keywordsTargeted": 50
    },
    "day90": {
      "pagesPublished": 24,
      "estimatedTraffic": 10000,
      "keywordsTargeted": 75
    }
  }
}
\`\`\`

### PART 2: Calendar Report (Markdown)

After JSON, provide:
1. 90-Day Calendar Overview
2. Weekly Breakdown (Weeks 1-12)
3. Seasonal Alignment Strategy
4. Resource Requirements
5. Risk Mitigation (delays, dependencies)
6. Success Metrics & KPIs

Be specific with dates and actionable tasks.`;
}

/**
 * Call Gemini API for Stage 4
 */
function callStage4GeminiAPI(prompt, selectedModel) {
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
 * Parse Stage 4 response
 */
function parseStage4Response(fullResponse) {
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
      calendarOverview: {},
      weeklySchedule: [],
      ganttChartData: [],
      milestones: [],
      kpiTargets: {},
      parseError: 'Could not extract JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Parse error: ' + error.toString());
    return {
      calendarOverview: {},
      weeklySchedule: [],
      criticalError: error.toString()
    };
  }
}

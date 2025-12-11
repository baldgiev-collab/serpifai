/**
 * ⚡ SERPIFAI Elite - Stage 1: Market Research & Strategy
 * Mega Prompt for Brand Strategy & Competitive Analysis
 * v6 SaaS Edition
 */

/**
 * Main execution function for Stage 1
 * Called from UI_Main.gs after credit authorization
 */
function DB_Workflow_Stage1(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 1: Market Research & Strategy');
    
    // VALIDATION: Check if projectData exists
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object, got ' + typeof projectData);
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // Build the elite mega prompt
    const prompt = buildStage1Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage1GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response into structured JSON
    const structuredData = parseStage1Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report (remove JSON block, artifacts, etc.)
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // Return both JSON and full response
    return {
      success: true,
      stage: 1,
      stageName: 'Market Research & Strategy',
      json: structuredData,  // For UI charts/visualization
      report: cleanReport,  // For AI report panel (markdown only, no JSON)
      timestamp: new Date().toISOString(),
      projectId: projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT'
    };
    
  } catch (error) {
    Logger.log('❌ Stage 1 Error: ' + error.toString());
    Logger.log('❌ Stack: ' + error.stack);
    return {
      success: false,
      stage: 1,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Build the Strategic Insights Engine Prompt for Stage 1
 * Generates dashboard-ready JSON + narrative report
 */
function buildStage1Prompt(data) {
  // Helper function to safely get field value
  function getField(obj, fieldName) {
    if (!obj) return 'Not provided';
    const value = obj[fieldName];
    return (value && String(value).trim()) ? String(value).trim() : 'Not provided';
  }

  // Build mega prompt (same as databridge version)
  const prompt = `**ROLE / IDENTITY**
You are a senior brand strategist and research analyst who makes complex strategy simple and actionable. You combine the clarity of great teachers with the depth of elite consultants.

You're building **Serpifai's Strategic Insights Engine** for the **Authority Engine Blueprint (AEB)**.

**YOUR AUDIENCE**
SEO professionals and business owners who:
- Understand the basics but need strategic direction
- Feel overwhelmed by too many tools and conflicting advice
- Want clear systems that actually work, not trendy tactics
- Fear: Wasting time on strategies that don't deliver results
- Desire: Predictable growth and authority they can defend

**YOUR JOB**
Translate strategic insights into plain language that busy professionals can understand and act on immediately. No marketing fluff. No academic jargon. Just clear thinking and practical direction.

---

**CONTEXT (Brand Input)**
- **Brand Name:** ${getField(data, 'brandName')}
- **Product/Service:** ${getField(data, 'productOrService') || getField(data, 'coreTopic')}
- **Primary Audience:** ${getField(data, 'targetAudience') || getField(data, 'primaryAudience')}
- **Secondary Audience:** ${getField(data, 'secondaryAudience')}
- **Audience Pains:** ${getField(data, 'audiencePains')}
- **Desired Transformation:** ${getField(data, 'audienceDesired')}
- **Quarterly Objectives:** ${getField(data, 'quarterlyObjective') || getField(data, 'quarterlyObjectives')}
- **Key Competitors:** ${getField(data, 'keyCompetitors') || getField(data, 'competitors')}
- **Existing Messaging:** ${getField(data, 'uvp') || getField(data, 'existingMessaging')}
- **Brand Voice/Lexicon:** ${getField(data, 'brandLexicon') || getField(data, 'brandArchetype')}
- **Distribution Channels:** ${getField(data, 'primaryChannels')}
- **North Star KPIs:** ${getField(data, 'northStarKpis')}

---

**YOUR OUTPUT MUST CONTAIN TWO PARTS:**

**PART 1: JSON (strategicData)**
Return a single, valid JSON object with comprehensive dashboard charts. This JSON will power the UI visualizations.
ALL numeric values MUST be based on analysis of the provided context, not random numbers.

[Full JSON schema with all chart structures - customerFrustrationsChart, hiddenAspirationsChart, mindsetTransformationChart, customerJobPriorityChart, competitiveAdvantageMapChart, contentFormatStrategyChart, brandPositioningChart, valuePropositionMixChart, strategicContentPillarsChart, priorityFocusMatrixChart, marketOpportunityAnalysisChart, jtbdScenarios, contentPillars, competitiveGaps, uniqueMechanism, audienceProfile]

**PART 2: MARKDOWN REPORT (strategicReport)**

## 📈 Strategic Insights Dashboard (Narrative View)

### 1. Customer Frustrations
[3-7 bullets, each with core frustration + 1-2 sentence elaboration]

### 2. Hidden Aspirations
[3-7 bullets on secret ambitions/desired identity]

### 3. Mindset Transformation
[Short intro + 3-5 bullet lines: FROM/TO beliefs]

### 4. Customer Job Priority (JTBD Summary)
[Brief intro + numbered list of 5 JTBDs in When/Help/So format]

### 5. Competitive Advantage Map
[Comparison vs competitors: gaps and opportunities]

### 6. Content Format Strategy
[Bullet list of formats with JTBD connections]

### 7. Brand Positioning & Value Proposition Mix
[1 paragraph positioning + 3-5 micro-value-props]

### 8. Strategic Content Pillars
[1-2 sentence intro + subsections for each pillar]

### 9. Priority Focus Matrix (Next 90 Days)
[3-5 initiatives: what → why → which pain it solves]

### 10. Market Opportunity Analysis
[Overview: competitor gaps, differentiation, timing]

### ⚡ Key Takeaways
[3-5 actionable sentences]

---

**WRITING GUIDELINES:**
- Use clear, direct language - explain complex ideas simply
- Write for smart people who don't have time for jargon
- Short paragraphs (2-3 sentences max) and bullet points
- Be specific and actionable, not vague or theoretical

**NOW GENERATE YOUR OUTPUT:**
Start with the JSON block, then the markdown report.`;

  return prompt;
}

/**
 * Call Gemini API DIRECTLY (not through gateway)
 * Used for workflow stages that execute in Apps Script
 */
function callStage1GeminiAPI(prompt, selectedModel) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in Script Properties. Go to Settings to add your Gemini API key.');
    }
    
    // Ensure Gemini 2.5 model
    const model = (selectedModel && selectedModel.indexOf('gemini-2.5') === 0) ? selectedModel : 'gemini-2.5-flash';
    Logger.log('🤖 Calling Gemini directly with model: ' + model);
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 16384  // Increased for long strategic reports
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('📡 Calling Gemini API directly...');
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error('Gemini API Error (' + responseCode + '): ' + response.getContentText());
    }
    
    const json = JSON.parse(response.getContentText());
    
    // Extract text from response
    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      const content = json.candidates[0].content;
      if (content.parts && content.parts[0] && content.parts[0].text) {
        Logger.log('✅ Gemini response received: ' + content.parts[0].text.length + ' chars');
        return content.parts[0].text;
      }
      throw new Error('Gemini response missing parts[0].text');
    }
    
    throw new Error('Invalid Gemini API response structure');
    
  } catch (error) {
    Logger.log('❌ Gemini API Error: ' + error.toString());
    throw error;
  }
}

/**
 * Parse Gemini response into structured JSON
 * Expects response with JSON block + markdown report
 */
function parseStage1Response(fullResponse) {
  try {
    // Extract JSON block from response
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const strategicData = JSON.parse(jsonMatch[1]);
        Logger.log('✅ Successfully parsed strategicData JSON from response');
        return strategicData;
      } catch (jsonError) {
        Logger.log('⚠️ JSON parse error: ' + jsonError.toString());
        Logger.log('JSON content: ' + jsonMatch[1].substring(0, 500));
      }
    }
    
    // Fallback: Try to extract JSON without code fence
    const jsonStart = fullResponse.indexOf('{');
    const jsonEnd = fullResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        const jsonStr = fullResponse.substring(jsonStart, jsonEnd + 1);
        const strategicData = JSON.parse(jsonStr);
        Logger.log('✅ Successfully parsed strategicData JSON (no fence)');
        return strategicData;
      } catch (jsonError) {
        Logger.log('⚠️ Fallback JSON parse failed: ' + jsonError.toString());
      }
    }
    
    // Final fallback: Return minimal structure
    Logger.log('⚠️ Could not extract valid JSON, returning minimal structure');
    return {
      dashboardCharts: {
        customerFrustrationsChart: [],
        hiddenAspirationsChart: [],
        mindsetTransformationChart: [],
        customerJobPriorityChart: [],
        competitiveAdvantageMapChart: [],
        contentFormatStrategyChart: [],
        brandPositioningChart: [],
        valuePropositionMixChart: [],
        strategicContentPillarsChart: [],
        priorityFocusMatrixChart: [],
        marketOpportunityAnalysisChart: []
      },
      jtbdScenarios: [],
      contentPillars: [],
      competitiveGaps: { topicGap: '', angleVoiceGap: '', formatGap: '' },
      uniqueMechanism: { name: 'Authority Engine Blueprint', tagline: '', oneParagraphDefinition: '', keyPromises: [] },
      audienceProfile: { emotionalPains: [], hiddenDesires: [], limitingBeliefs: [], empoweringBeliefs: [] },
      parseError: 'Could not extract valid JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Critical parse error: ' + error.toString());
    return {
      dashboardCharts: {
        customerFrustrationsChart: [],
        hiddenAspirationsChart: [],
        mindsetTransformationChart: [],
        customerJobPriorityChart: [],
        competitiveAdvantageMapChart: [],
        contentFormatStrategyChart: [],
        brandPositioningChart: [],
        valuePropositionMixChart: [],
        strategicContentPillarsChart: [],
        priorityFocusMatrixChart: [],
        marketOpportunityAnalysisChart: []
      },
      jtbdScenarios: [],
      contentPillars: [],
      competitiveGaps: { topicGap: '', angleVoiceGap: '', formatGap: '' },
      uniqueMechanism: { name: '', tagline: '', oneParagraphDefinition: '', keyPromises: [] },
      audienceProfile: { emotionalPains: [], hiddenDesires: [], limitingBeliefs: [], empoweringBeliefs: [] },
      criticalError: error.toString()
    };
  }
}

/**
 * Clean the markdown report from Gemini response
 * Removes JSON code blocks, stray tokens, and formatting artifacts
 */
function cleanMarkdownReport(fullResponse) {
  try {
    let cleanedReport = fullResponse;
    
    // Remove JSON code block if present
    cleanedReport = cleanedReport.replace(/```json[\s\S]*?```/g, '');
    
    // Remove standalone JSON objects
    const jsonStart = cleanedReport.indexOf('{');
    const jsonEnd = cleanedReport.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      const beforeJson = cleanedReport.substring(0, jsonStart).trim();
      if (beforeJson.length < 50) {
        cleanedReport = cleanedReport.substring(jsonEnd + 1);
      }
    }
    
    // Remove common artifacts
    cleanedReport = cleanedReport.replace(/\$\d+/g, '');
    cleanedReport = cleanedReport.replace(/\$\$/g, '');
    cleanedReport = cleanedReport.replace(/^---+$/gm, '');
    
    // Clean up excessive whitespace
    cleanedReport = cleanedReport.replace(/\n{4,}/g, '\n\n\n');
    cleanedReport = cleanedReport.trim();
    
    // Ensure report starts with a heading
    if (!cleanedReport.startsWith('#')) {
      cleanedReport = '## 📈 Strategic Insights Dashboard (Narrative View)\n\n' + cleanedReport;
    }
    
    Logger.log('✅ Report cleaned successfully');
    return cleanedReport;
    
  } catch (error) {
    Logger.log('⚠️ Error cleaning report: ' + error.toString());
    return fullResponse;
  }
}

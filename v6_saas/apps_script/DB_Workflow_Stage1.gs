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
 * ELITE VERSION: Includes ALL 81+ input fields mapped as variables
 * Generates comprehensive dashboard-ready JSON + narrative report
 */
function buildStage1Prompt(data) {
  // Helper function to safely get field value
  function getField(obj, fieldName) {
    if (!obj) return 'Not provided';
    const value = obj[fieldName];
    return (value && String(value).trim()) ? String(value).trim() : 'Not provided';
  }

  // Build ELITE mega prompt with ALL fields mapped
  const prompt = `**ROLE / IDENTITY**
You are an elite brand strategist and market research analyst with 20+ years experience. You combine:
- The strategic depth of McKinsey consultants
- The clarity of world-class teachers like Seth Godin
- The actionable frameworks of growth marketers
- The audience psychology of Robert Cialdini

You're building the **Strategic Insights Engine** for ${getField(data, 'brandName')}'s content marketing strategy.

---

**YOUR MISSION**
Transform raw business inputs into actionable strategic intelligence. You will:
1. Analyze market positioning and competitive dynamics
2. Map customer psychology (pains, desires, beliefs)
3. Design content pillars and formats that drive business outcomes
4. Create prioritized action plans with clear ROI

**CRITICAL**: Every insight must be grounded in the provided context. NO generic marketing speak. NO placeholder data.

---

## 📊 COMPLETE CONTEXT (ALL INPUT FIELDS MAPPED)

### STAGE 1: BRAND FOUNDATION & STRATEGY

**Core Brand Identity:**
- **Brand Name:** ${getField(data, 'brandName')}
- **Brand Archetype:** ${getField(data, 'brandArchetype')}
- **Brand Ideology:** ${getField(data, 'brandIdeology')}
- **Brand Lexicon & Voice:** ${getField(data, 'brandLexicon')}
- **UVP (Unique Value Proposition):** ${getField(data, 'uvp')}
- **Existing Messaging:** ${getField(data, 'existingMessaging')}
- **Core Topic:** ${getField(data, 'coreTopic')}
- **Product/Service:** ${getField(data, 'productOrService')}

**Target Audience Intelligence:**
- **Primary Audience:** ${getField(data, 'targetAudience')}
- **Secondary Audience:** ${getField(data, 'secondaryAudience')}
- **Customer Demographics:** ${getField(data, 'customerDemographics')}
- **Geographic Focus:** ${getField(data, 'geographicFocus')}
- **Industry Vertical:** ${getField(data, 'industryVertical')}

**Customer Psychology (CRITICAL for JTBD & Charts):**
- **Current Pains:** ${getField(data, 'audiencePains')}
- **Desired State:** ${getField(data, 'audienceDesired')}
- **Core Market Problem:** ${getField(data, 'coreMarketProblem')}

**Business Objectives:**
- **Quarterly Objective:** ${getField(data, 'quarterlyObjective')}
- **North Star KPIs:** ${getField(data, 'northStarKpis')}
- **Content Goals:** ${getField(data, 'contentGoals')}
- **Future Vision:** ${getField(data, 'futureVision')}

**Competitive Context:**
- **Key Competitors:** ${getField(data, 'keyCompetitors')}
- **Competitive Advantages:** ${getField(data, 'competitiveAdvantages')}

**Distribution Strategy:**
- **Primary Channels:** ${getField(data, 'primaryChannels')}
- **Content Formats:** ${getField(data, 'contentFormats')}
- **Seasonality:** ${getField(data, 'seasonality')}

**Offer & Monetization:**
- **Offer Matrix:** ${getField(data, 'offerMatrix')}
- **Primary Offer Name:** ${getField(data, 'primaryOfferName')}
- **Primary Offer Price:** ${getField(data, 'primaryOfferPrice')}
- **Upsell Offer:** ${getField(data, 'upsellOffer')}
- **Upsell Price:** ${getField(data, 'upsellPrice')}

### STAGE 2: KEYWORD & MARKET INTELLIGENCE

**Strategic Positioning:**
- **Core Strategic Question:** ${getField(data, 'coreStrategicQuestion')}
- **Thesis (Pro Angle):** ${getField(data, 'thesis')}
- **Antithesis (Con Angle):** ${getField(data, 'antithesis')}
- **Key Market Data:** ${getField(data, 'keyMarketData')}
- **Category Definition:** ${getField(data, 'categoryDefinition')}

**Keyword Research:**
- **Primary Keyword:** ${getField(data, 'primaryKeyword')}
- **Secondary Keywords:** ${getField(data, 'secondaryKeywords')}
- **Full Keyword List:** ${getField(data, 'keywordsEntities')}

### STAGE 3: CONTENT ARCHITECTURE

**Content Structure:**
- **Asset Title:** ${getField(data, 'assetTitle')}
- **Foundational Pillars:** ${getField(data, 'foundationalPillars')}
- **Campaign Narrative:** ${getField(data, 'campaignNarrative')}
- **Pillar Context:** ${getField(data, 'pillarContext')}
- **Parent Pillar URL:** ${getField(data, 'parentPillarUrl')}
- **Child Spoke URLs:** ${getField(data, 'childSpokeUrls')}
- **Internal Linking Strategy:** ${getField(data, 'internalLinkingStrategy')}
- **Funnel Stage:** ${getField(data, 'funnelStage')}
- **Content Type:** ${getField(data, 'contentType')}
- **Timeframe Plan:** ${getField(data, 'timeframePlan')}

### STAGE 4: CALENDAR & PUBLISHING

**Publishing Strategy:**
- **Calendar Horizon:** ${getField(data, 'calendarHorizon')}
- **Posts per Week:** ${getField(data, 'postsPerWeek')}
- **Visual Hooks:** ${getField(data, 'visualHooks')}

### STAGE 5: CREDIBILITY & E-E-A-T

**Authority Signals:**
- **Author Bio:** ${getField(data, 'authorBio')}
- **Primary Source 1:** ${getField(data, 'primarySource1')}
- **Primary Source 2:** ${getField(data, 'primarySource2')}
- **Expert Quote 1:** ${getField(data, 'expertQuote1')}
- **Expert Quote 2:** ${getField(data, 'expertQuote2')}
- **Proprietary Data:** ${getField(data, 'proprietaryData')}

**Case Studies & Social Proof:**
- **Case Study 1:** ${getField(data, 'caseStudy1')}
- **Case Study 2:** ${getField(data, 'caseStudy2')}
- **Case Study 3:** ${getField(data, 'caseStudy3')}
- **Trust Anchors:** ${getField(data, 'trustAnchors')}
- **Social Proof:** ${getField(data, 'socialProof')}
- **Testimonial 1:** ${getField(data, 'testimonial1')}
- **Testimonial 2:** ${getField(data, 'testimonial2')}

**Bundle Components:**
- **Lead Magnet:** ${getField(data, 'leadMagnetName')}
- **Bundle 1:** ${getField(data, 'bundle1Name')} (${getField(data, 'bundle1Value')})
- **Bundle 2:** ${getField(data, 'bundle2Name')} (${getField(data, 'bundle2Value')})
- **Bundle 3:** ${getField(data, 'bundle3Name')} (${getField(data, 'bundle3Value')})
- **Bundle 4:** ${getField(data, 'bundle4Name')} (${getField(data, 'bundle4Value')})

**Generation Preferences:**
- **Content Format:** ${getField(data, 'contentFormat')}
- **Subcategory:** ${getField(data, 'contentSubcategory')}
- **Persuasion Framework:** ${getField(data, 'persuasionFramework')}
- **Unique Mechanism:** ${getField(data, 'uniqueMechanism')}
- **Readability:** ${getField(data, 'readabilityDirectives')}
- **Platform Context:** ${getField(data, 'platformContext')}
- **Forbidden Terms:** ${getField(data, 'forbiddenTerms')}
- **AI Persona Context:** ${getField(data, 'aiPersonaContext')}

---

## 🎯 YOUR OUTPUT REQUIREMENTS

You will generate **TWO PARTS** in a single response:

### PART 1: STRATEGIC DATA (JSON)

Return a single, valid JSON object. This powers the dashboard visualizations.

**CRITICAL JSON RULES:**
- Valid JSON syntax (double quotes, no trailing commas)
- ALL numeric scores (1-10) MUST be based on the context above, NOT random
- Chart data MUST reflect actual strategic analysis
- NO placeholder values like "8" without reasoning
- Use specific segment names: "In-House SEO", "Agency SEO", "Content Lead", "Solo Consultant"
- JTBD scenarios: Minimum 5, using When/Help/So format
- Content pillars: 3-5 with detailed strategic rationale

\`\`\`json
{
  "dashboardCharts": {
    "customerFrustrationsChart": [
      {
        "label": "Specific frustration from audiencePains",
        "intensity": 1-10,
        "segment": "Audience segment name",
        "shortDescription": "1-2 sentence elaboration"
      }
      // 5-7 items based on audiencePains and coreMarketProblem
    ],
    "hiddenAspirationsChart": [
      {
        "label": "Secret ambition from audienceDesired",
        "intensity": 1-10,
        "segment": "Audience segment",
        "shortDescription": "What they really want"
      }
      // 5-7 items based on audienceDesired and futureVision
    ],
    "mindsetTransformationChart": [
      {
        "fromBelief": "Old limiting belief",
        "toBelief": "New empowering belief",
        "importance": 1-10,
        "segment": "Audience segment"
      }
      // 3-5 transformations that support brand positioning
    ],
    "customerJobPriorityChart": [
      {
        "jobTitle": "Job To Be Done title",
        "urgency": 1-10,
        "importance": 1-10,
        "frequency": 1-10,
        "segment": "Audience segment",
        "outcome": "Specific desired result"
      }
      // 5-7 items from quarterlyObjective and contentGoals
    ],
    "competitiveAdvantageMapChart": [
      {
        "dimension": "Strategic dimension name",
        "yourBrand": 1-10,
        "competitor1": 1-10,
        "competitor2": 1-10,
        "marketAverage": 1-10,
        "explanation": "Why this matters"
      }
      // 5-7 dimensions based on competitiveAdvantages and brandArchetype
    ],
    "contentFormatStrategyChart": [
      {
        "format": "Content format name",
        "fitScore": 1-10,
        "competitiveGap": 1-10,
        "audienceDemand": 1-10,
        "feasibility": 1-10,
        "priority": 1-3,
        "rationale": "Why this format works"
      }
      // 4-6 formats from contentFormats and primaryChannels
    ],
    "brandPositioningChart": [
      {
        "axis": "Positioning spectrum (e.g., Tactical vs Strategic)",
        "position": 1-10,
        "marketPosition": 1-10,
        "note": "What this means"
      }
      // 4-5 axes based on brandIdeology and competitiveAdvantages
    ],
    "valuePropositionMixChart": [
      {
        "proposition": "Micro value prop",
        "appeal": 1-10,
        "differentiation": 1-10,
        "credibility": 1-10,
        "clarity": 1-10
      }
      // 4-5 props from uvp and existingMessaging
    ],
    "strategicContentPillarsChart": [
      {
        "pillar": "Pillar name",
        "audienceFit": 1-10,
        "competitiveGap": 1-10,
        "businessImpact": 1-10,
        "feasibility": 1-10,
        "priority": 1-3
      }
      // 3-5 pillars from foundationalPillars or create based on strategy
    ],
    "priorityFocusMatrixChart": [
      {
        "initiative": "Specific initiative",
        "impact": 1-10,
        "effort": 1-10,
        "speed": 1-10,
        "priority": 1-3,
        "timeline": "Days/weeks"
      }
      // 3-5 initiatives based on quarterlyObjective
    ],
    "marketOpportunityAnalysisChart": [
      {
        "opportunity": "Market gap or opportunity",
        "marketSize": 1-10,
        "competitionLevel": 1-10,
        "timingSensitivity": 1-10,
        "fitScore": 1-10,
        "priority": 1-3
      }
      // 3-5 opportunities from coreStrategicQuestion and keyMarketData
    ]
  },
  "jtbdScenarios": [
    {
      "id": "JTBD_1",
      "title": "Job title",
      "whenSituation": "Specific trigger situation",
      "helpMeDo": "What they're hiring your solution to do",
      "soICan": "Ultimate desired outcome",
      "segment": "Audience segment",
      "priority": 1-5,
      "painIntensity": 1-10,
      "frequencyPerMonth": 1-30
    }
    // 5 scenarios from audiencePains and quarterlyObjective
  ],
  "contentPillars": [
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "strategicRationale": [
        "Solves: [pain]",
        "Challenges: [belief]",
        "Instills: [new belief]",
        "Fills gap: [competitive gap]"
      ],
      "primaryFormats": ["Format 1", "Format 2"],
      "businessAlignment": "How this drives business goals",
      "audienceSegments": ["Segment 1", "Segment 2"],
      "competitiveDifferentiation": "What makes this unique"
    }
    // 3-5 pillars
  ],
  "competitiveGaps": {
    "topicGap": "Topics competitors miss",
    "angleVoiceGap": "How your voice differs",
    "formatGap": "Formats they don't use",
    "audienceGap": "Audiences they underserve",
    "outcomeGap": "Outcomes they don't deliver"
  },
  "uniqueMechanism": {
    "name": "Your proprietary system/framework",
    "tagline": "One-line description",
    "oneParagraphDefinition": "Detailed explanation",
    "keyPromises": [
      "Promise 1",
      "Promise 2",
      "Promise 3"
    ],
    "visualIdentity": {
      "primaryMetaphor": "Core metaphor",
      "secondaryMetaphor": "Supporting metaphor",
      "colorTheme": "Brand color direction"
    }
  },
  "audienceProfile": {
    "emotionalPains": ["Pain 1", "Pain 2"],
    "hiddenDesires": ["Desire 1", "Desire 2"],
    "limitingBeliefs": ["Belief 1", "Belief 2"],
    "empoweringBeliefs": ["Belief 1", "Belief 2"]
  }
}
\`\`\`

### PART 2: STRATEGIC REPORT (MARKDOWN)

After the JSON, provide a narrative report with this EXACT structure:

## 📈 Strategic Insights Dashboard

### 1. Customer Frustrations
[Based on audiencePains and coreMarketProblem - 5-7 bullets with elaboration]

### 2. Hidden Aspirations  
[Based on audienceDesired and futureVision - 5-7 bullets on secret ambitions]

### 3. Mindset Transformation
[FROM: old belief → TO: new belief - 3-5 transformations with why it matters]

### 4. Customer Job Priority (JTBD Summary)
[Brief intro + 5 JTBDs in When/Help/So format from quarterlyObjective]

### 5. Competitive Advantage Map
[Based on keyCompetitors and competitiveAdvantages - where you win, language to own]

### 6. Content Format Strategy
[Based on contentFormats and primaryChannels - connect formats to JTBDs and pains]

### 7. Brand Positioning & Value Proposition Mix
[Based on brandArchetype, uvp, brandIdeology - positioning + 3-5 micro-props]

### 8. Strategic Content Pillars
[Based on foundationalPillars or created from strategy - subsections for each pillar]

### 9. Priority Focus Matrix (Next 90 Days)
[Based on quarterlyObjective - 3-5 initiatives: what → why → which pain it solves]

### 10. Market Opportunity Analysis
[Based on coreStrategicQuestion and keyMarketData - competitor gaps, differentiation, timing]

### ⚡ Key Takeaways
[3-5 actionable sentences: what to focus on, how audience will feel, what to do next]

---

## ✍️ WRITING GUIDELINES

- **Clear, Direct Language**: Explain complex ideas simply
- **Smart & Busy Audience**: No jargon, no fluff
- **Short Paragraphs**: 2-3 sentences max, bullet points
- **Specific & Actionable**: Every insight answers "so what?" or "what do I do?"
- **Grounded in Context**: Reference specific fields (brandName, audiencePains, etc.)

**EXAMPLES**:
❌ BAD: "Leverage synergistic paradigms"
✅ GOOD: "Focus on solving the exact problems ${getField(data, 'targetAudience')} mentions: ${getField(data, 'audiencePains').substring(0, 100)}..."

**NOW GENERATE YOUR OUTPUT:**
Start with the JSON block (\`\`\`json...\`\`\`), then the markdown report. Be clear, useful, and grounded in the provided context.`;

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

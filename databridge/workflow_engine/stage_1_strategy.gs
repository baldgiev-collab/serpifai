/**
 * ⚡ SERPIFAI Elite - Stage 1: Market Research & Strategy
 * Mega Prompt for Brand Strategy & Competitive Analysis
 */

function runStage1Strategy(projectData) {
  try {
    Logger.log('🎯 Running Stage 1: Market Research & Strategy');
    
    // VALIDATION: Check if projectData exists
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object, got ' + typeof projectData);
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    
    // Build the elite mega prompt
    const prompt = buildStage1Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callGeminiAPI(prompt);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response into structured JSON
    const structuredData = parseStage1Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report (remove JSON block, artifacts, etc.)
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // Save to Google Sheet
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit';
    const projectId = projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT';
    saveStage1Results(sheetUrl, projectId, structuredData, cleanReport);
    
    // Return both JSON and full response
    return {
      success: true,
      stage: 1,
      stageName: 'Market Research & Strategy',
      json: structuredData,  // For UI charts/visualization
      report: cleanReport,  // For AI report panel (markdown only, no JSON)
      timestamp: new Date().toISOString(),
      projectId: projectId
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

  // Updated prompt to request all required charts
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
Return a single, valid JSON object with this EXACT structure. Every chart MUST contain real data-driven analysis, not mockups:

\`\`\`json
{
  "dashboardCharts": {
    "customerFrustrationsChart": [
      { "label": "Fear of AI Replacing Expertise", "intensity": 9, "segment": "In-House SEO", "shortDescription": "Worried AI will make their skills obsolete" },
      { "label": "Burnout from Manual Work", "intensity": 8, "segment": "Agency SEO", "shortDescription": "Exhausted by repetitive tasks without results" },
      { "label": "Quality Control Anxiety", "intensity": 7, "segment": "Content Lead", "shortDescription": "Fear of producing low-quality AI content" }
    ],
    "hiddenAspirationsChart": [
      { "label": "Become Strategic Leader", "intensity": 9, "segment": "In-House SEO", "shortDescription": "Want recognition as architect, not just operator" },
      { "label": "Build Scalable Systems", "intensity": 8, "segment": "Agency SEO", "shortDescription": "Create processes that work without constant input" },
      { "label": "Achieve Predictable Growth", "intensity": 8, "segment": "Content Lead", "shortDescription": "Reliable results that defend budget and role" }
    ],
    "mindsetTransformationChart": [
      { "fromBelief": "AI threatens my expertise", "toBelief": "AI amplifies my strategic value", "importance": 9, "segment": "In-House SEO" },
      { "fromBelief": "Quality requires manual work", "toBelief": "Systems can maintain quality at scale", "importance": 8, "segment": "Agency SEO" },
      { "fromBelief": "SEO is about keywords and links", "toBelief": "SEO is about authority and trust", "importance": 7, "segment": "Content Lead" }
    ],
    "customerJobPriorityChart": [
      { "jobTitle": "Build Reliable SEO System", "urgency": 9, "importance": 10, "frequency": 8, "segment": "In-House SEO", "outcome": "Consistent rankings without firefighting" },
      { "jobTitle": "Scale Content Without Quality Loss", "urgency": 8, "importance": 9, "frequency": 9, "segment": "Agency SEO", "outcome": "Deliver more with same resources" },
      { "jobTitle": "Prove ROI to Leadership", "urgency": 7, "importance": 10, "frequency": 6, "segment": "Content Lead", "outcome": "Secure budget and demonstrate value" },
      { "jobTitle": "Stay Ahead of Algorithm Changes", "urgency": 8, "importance": 8, "frequency": 7, "segment": "In-House SEO", "outcome": "Future-proof strategy that lasts" },
      { "jobTitle": "Build Authority Not Just Traffic", "urgency": 6, "importance": 9, "frequency": 5, "segment": "Content Lead", "outcome": "Create lasting brand value" }
    ],
    "competitiveAdvantageMapChart": [
      { "dimension": "Strategic Depth", "yourBrand": 9, "competitor1": 5, "competitor2": 4, "marketAverage": 4, "explanation": "Focus on systems vs tactics" },
      { "dimension": "AI Integration Guidance", "yourBrand": 9, "competitor1": 6, "competitor2": 3, "marketAverage": 4, "explanation": "Practical frameworks not just theory" },
      { "dimension": "Quality-First Approach", "yourBrand": 8, "competitor1": 5, "competitor2": 6, "marketAverage": 5, "explanation": "Authority over volume" },
      { "dimension": "Actionable Frameworks", "yourBrand": 9, "competitor1": 4, "competitor2": 5, "marketAverage": 5, "explanation": "Blueprints not blog posts" },
      { "dimension": "Long-Term Strategy", "yourBrand": 8, "competitor1": 3, "competitor2": 4, "marketAverage": 4, "explanation": "Systems over quick wins" }
    ],
    "contentFormatStrategyChart": [
      { "format": "Strategic Blueprints", "fitScore": 10, "competitiveGap": 9, "audienceDemand": 9, "feasibility": 8, "priority": 1, "rationale": "Solves 'how to build systems' pain" },
      { "format": "Interactive Checklists", "fitScore": 9, "competitiveGap": 8, "audienceDemand": 8, "feasibility": 9, "priority": 2, "rationale": "Makes implementation easy" },
      { "format": "Case Study Deep-Dives", "fitScore": 8, "competitiveGap": 7, "audienceDemand": 9, "feasibility": 7, "priority": 3, "rationale": "Proves concepts work in real life" },
      { "format": "Framework Guides", "fitScore": 9, "competitiveGap": 8, "audienceDemand": 8, "feasibility": 8, "priority": 2, "rationale": "Teaches strategic thinking" }
    ],
    "brandPositioningChart": [
      { "axis": "Tactical vs Strategic", "position": 9, "marketPosition": 4, "note": "Focus on long-term systems" },
      { "axis": "Beginner vs Advanced", "position": 7, "marketPosition": 5, "note": "For those who know basics" },
      { "axis": "Theory vs Practical", "position": 8, "marketPosition": 5, "note": "Actionable frameworks" },
      { "axis": "Volume vs Quality", "position": 9, "marketPosition": 4, "note": "Authority-first approach" }
    ],
    "valuePropositionMixChart": [
      { "proposition": "Build Systems That Last", "appeal": 9, "differentiation": 8, "credibility": 9, "clarity": 9 },
      { "proposition": "AI as Strategic Tool", "appeal": 8, "differentiation": 9, "credibility": 8, "clarity": 8 },
      { "proposition": "Quality-First Scaling", "appeal": 9, "differentiation": 7, "credibility": 9, "clarity": 9 },
      { "proposition": "Predictable Results", "appeal": 10, "differentiation": 6, "credibility": 8, "clarity": 9 }
    ],
    "strategicContentPillarsChart": [
      { "pillar": "Authority System Foundations", "audienceFit": 9, "competitiveGap": 9, "businessImpact": 8, "feasibility": 9, "priority": 1 },
      { "pillar": "AI Integration Playbook", "audienceFit": 9, "competitiveGap": 8, "businessImpact": 9, "feasibility": 8, "priority": 1 },
      { "pillar": "Quality Control Framework", "audienceFit": 8, "competitiveGap": 7, "businessImpact": 8, "feasibility": 9, "priority": 2 }
    ],
    "priorityFocusMatrixChart": [
      { "initiative": "Launch Blueprint Templates", "impact": 9, "effort": 6, "speed": 8, "priority": 1, "timeline": "30 days" },
      { "initiative": "Build Case Study Series", "impact": 8, "effort": 7, "speed": 6, "priority": 2, "timeline": "60 days" },
      { "initiative": "Create Interactive Tools", "impact": 9, "effort": 8, "speed": 5, "priority": 3, "timeline": "90 days" }
    ],
    "marketOpportunityAnalysisChart": [
      { "opportunity": "Strategic AI Guidance Gap", "marketSize": 9, "competitionLevel": 3, "timingSensitivity": 9, "fitScore": 10, "priority": 1 },
      { "opportunity": "Systems Over Tactics Demand", "marketSize": 8, "competitionLevel": 4, "timingSensitivity": 7, "fitScore": 9, "priority": 2 },
      { "opportunity": "Quality-First Positioning", "marketSize": 7, "competitionLevel": 5, "timingSensitivity": 6, "fitScore": 9, "priority": 3 }
    ]
  },
  "jtbdScenarios": [
    {
      "id": "JTBD_1",
      "title": "Build Reliable SEO System",
      "whenSituation": "feeling overwhelmed by algorithm changes and manual work",
      "helpMeDo": "create a dependable system that delivers consistent results",
      "soICan": "stop firefighting and focus on strategic growth",
      "segment": "In-House SEO Manager",
      "priority": 1,
      "painIntensity": 9,
      "frequencyPerMonth": 20
    },
    {
      "id": "JTBD_2",
      "title": "Scale Content Quality",
      "whenSituation": "needing to produce more content without losing quality",
      "helpMeDo": "use AI strategically while maintaining brand standards",
      "soICan": "grow output and maintain reputation",
      "segment": "Agency SEO Lead",
      "priority": 2,
      "painIntensity": 8,
      "frequencyPerMonth": 15
    },
    {
      "id": "JTBD_3",
      "title": "Prove Marketing ROI",
      "whenSituation": "facing budget scrutiny from leadership",
      "helpMeDo": "demonstrate clear connection between SEO and business results",
      "soICan": "secure resources and validate my role",
      "segment": "Content Marketing Manager",
      "priority": 3,
      "painIntensity": 9,
      "frequencyPerMonth": 4
    },
    {
      "id": "JTBD_4",
      "title": "Future-Proof Strategy",
      "whenSituation": "worried about staying relevant as AI changes everything",
      "helpMeDo": "build authority that survives algorithm updates",
      "soICan": "have confidence in long-term career security",
      "segment": "Solo Consultant",
      "priority": 4,
      "painIntensity": 7,
      "frequencyPerMonth": 10
    },
    {
      "id": "JTBD_5",
      "title": "Become Strategic Leader",
      "whenSituation": "stuck in execution mode without strategic influence",
      "helpMeDo": "shift from doing SEO to architecting systems",
      "soICan": "be recognized as strategic asset not tactical operator",
      "segment": "In-House SEO Specialist",
      "priority": 5,
      "painIntensity": 6,
      "frequencyPerMonth": 8
    }
  ],
  "contentPillars": [
    {
      "name": "Authority System Foundations",
      "description": "How to build SEO systems that create lasting authority using AI strategically",
      "strategicRationale": [
        "Solves: Fear of AI replacing expertise + Burnout from manual work",
        "Challenges: 'AI can't produce quality' belief",
        "Instills: 'I can build scalable quality systems' belief",
        "Fills gap: Strategic frameworks for AI-powered authority building"
      ],
      "primaryFormats": ["Strategic blueprint", "Step-by-step framework", "Real implementation example"],
      "businessAlignment": "Drives trust and positions brand as strategic authority",
      "audienceSegments": ["In-House SEO", "Agency Lead"],
      "competitiveDifferentiation": "Systems focus vs tactical tips"
    },
    {
      "name": "AI Integration Playbook",
      "description": "Practical frameworks for using AI to scale quality content and maintain brand standards",
      "strategicRationale": [
        "Solves: Quality control anxiety + Need to prove ROI",
        "Challenges: 'AI threatens quality' belief",
        "Instills: 'AI amplifies my strategic value' belief",
        "Fills gap: Practical AI integration with quality controls"
      ],
      "primaryFormats": ["Implementation checklist", "Quality control framework", "Before/after case study"],
      "businessAlignment": "Demonstrates expertise and provides immediate value",
      "audienceSegments": ["Agency SEO", "Content Lead"],
      "competitiveDifferentiation": "Quality-first AI guidance vs pure automation"
    },
    {
      "name": "Strategic Growth Framework",
      "description": "Long-term planning for building defensible authority that survives algorithm changes",
      "strategicRationale": [
        "Solves: Algorithm anxiety + Need for predictable growth",
        "Challenges: 'SEO is about keywords and links' belief",
        "Instills: 'SEO is about authority and trust' belief",
        "Fills gap: Future-proof strategy vs reactive tactics"
      ],
      "primaryFormats": ["Strategic roadmap", "Quarterly planning guide", "Success metrics framework"],
      "businessAlignment": "Positions brand for long-term engagement and consulting",
      "audienceSegments": ["In-House SEO", "Solo Consultant"],
      "competitiveDifferentiation": "Strategic systems vs quick wins"
    }
  ],
  "competitiveGaps": {
    "topicGap": "Strategic frameworks for building AI-powered authority systems (not just 'how to use ChatGPT for SEO' tips)",
    "angleVoiceGap": "Systems-thinking and long-term strategy focus (not quick hacks or beginner tutorials)",
    "formatGap": "Actionable blueprints and implementation frameworks (not just conceptual blog posts)",
    "audienceGap": "Serving experienced practitioners who need strategic depth (not beginners learning basics)",
    "outcomeGap": "Focus on building lasting authority and systems (not just traffic or rankings)"
  },
  "uniqueMechanism": {
    "name": "Authority Engine Blueprint (AEB)",
    "tagline": "Your system for building AI-powered, quality-first SEO authority",
    "oneParagraphDefinition": "The Authority Engine Blueprint is a strategic framework that helps SEO professionals and content leaders build reliable systems for creating authority using AI strategically. Instead of choosing between quality and scale, AEB shows you how to use AI as a strategic tool that amplifies your expertise while maintaining the trust and standards your brand needs. Think of it as your playbook for making AI work for you—building systems that deliver predictable results and positioning you as a strategic leader, not just a tactical operator.",
    "keyPromises": [
      "Build systems that deliver predictable results",
      "Use AI strategically without compromising quality",
      "Position yourself as strategic leader not tactical operator",
      "Create authority that survives algorithm changes"
    ],
    "visualIdentity": {
      "primaryMetaphor": "Engine",
      "secondaryMetaphor": "Blueprint/Architecture",
      "colorTheme": "Professional blues and strategic grays"
    }
  },
  "audienceProfile": {
    "emotionalPains": [
      "Worried AI will make their expertise irrelevant",
      "Exhausted by manual work that doesn't deliver consistent results",
      "Scared of producing low-quality content that damages brand reputation",
      "Frustrated by constantly reacting to algorithm changes"
    ],
    "hiddenDesires": [
      "Be recognized as strategic architect, not just tactical executor",
      "Build systems that work predictably without constant input",
      "Create lasting value that survives trends and algorithm updates",
      "Achieve career security through strategic positioning"
    ],
    "limitingBeliefs": [
      "AI can't produce content that meets my quality standards",
      "Building real authority requires years of slow, manual work",
      "I need to choose between quality and scale",
      "Strategic work requires big teams and budgets"
    ],
    "empoweringBeliefs": [
      "AI, used strategically, amplifies my expertise and value",
      "Systems and frameworks can maintain quality at scale",
      "I can build authority faster with the right strategic approach",
      "Strategic thinking is more valuable than tactical execution"
    ]
  }
}
\`\`\`

**CRITICAL RULES FOR JSON:**
- Must be valid JSON (double quotes, no trailing commas, no markdown inside text)
- ALL numeric values MUST be based on analysis of the provided context, not random numbers
- For customerJobPriorityChart: Include urgency, importance, frequency (all 1-10), segment, and clear outcome
- For competitiveAdvantageMapChart: Show YOUR brand vs competitors with specific dimension names and scores (1-10)
- For contentFormatStrategyChart: Include format name, fitScore, competitiveGap, audienceDemand, feasibility (all 1-10), and priority
- Chart data must reflect actual strategic analysis, not placeholder values
- Use segments from: "In-House SEO", "Agency SEO", "Content Lead", "Solo Consultant"
- JTBD scenarios: 5 items minimum, each with clear when/help/so structure
- Content pillars: 3-5 items with detailed strategic rationale
- NO "$2" or pricing tokens, NO markdown formatting inside text fields

**PART 2: MARKDOWN REPORT (strategicReport)**

Use this EXACT structure:

## 📈 Strategic Insights Dashboard (Narrative View)

### 1. Customer Frustrations
[3-7 bullets, each with core frustration + 1-2 sentence elaboration]

### 2. Hidden Aspirations
[3-7 bullets on secret ambitions/desired identity as "Architect/Operator"]

### 3. Mindset Transformation
[Short intro + 3-5 bullet lines: "FROM: 'old belief' → TO: 'new belief' (why this matters)"]

### 4. Customer Job Priority (JTBD Summary)
[Brief intro + numbered list of 5 JTBDs in When/Help/So format]

### 5. Competitive Advantage Map
[Comparison vs competitors: where they over/under-serve, where Serpifai owns narrative, language/metaphors to own]

### 6. Content Format Strategy
[Bullet list of formats: operational blueprints, interactive checklists, playbooks, case studies. Connect to JTBDs and pains]

### 7. Brand Positioning & Value Proposition Mix
[1 paragraph positioning + 3-5 micro-value-props]

### 8. Strategic Content Pillars
[1-2 sentence intro + subsections for each pillar with "what it covers" and "why it matters now"]

### 9. Priority Focus Matrix (Next 90 Days)
[3-5 initiatives presented clearly: what you'll do → why it matters → which audience pain it solves]

### 10. Market Opportunity Analysis
[Brief overview: where competitors are missing the mark, what makes your approach different, why now is the right time]

### ⚡ Key Takeaways
[3-5 simple sentences: what your brand should focus on, how your audience will feel, what to do next]

---

**WRITING GUIDELINES:**
- Use clear, direct language - explain complex ideas simply
- Write for smart people who don't have time for jargon
- Short paragraphs (2-3 sentences max) and bullet points
- Use everyday words; avoid marketing buzzwords
- Be specific and actionable, not vague or theoretical
- Every insight should answer "so what?" or "what do I do with this?"

**EXAMPLES OF GOOD VS BAD:**
❌ BAD: "Leverage synergistic paradigms to optimize stakeholder engagement"
✅ GOOD: "Focus on solving real problems your customers talk about every day"

❌ BAD: "Holistically integrate cross-functional value propositions"
✅ GOOD: "Connect your product benefits to what customers actually want to achieve"

**NOW GENERATE YOUR OUTPUT:**
Start with the JSON block, then the markdown report. Be clear, useful, and easy to understand.`;

  return prompt;
}

/**
 * Get first available Gemini model that supports generateContent
 */
function getAvailableGeminiModel() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) return 'gemini-2.5-flash'; // Updated fallback to current model
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      
      if (json.models) {
        for (const model of json.models) {
          if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
            return model.name.replace('models/', '');
          }
        }
      }
    }
  } catch (error) {
    Logger.log('⚠️ Could not list models: ' + error.toString());
  }
  
  return 'gemini-2.5-flash'; // Updated fallback to current model
}

/**
 * Call Gemini API with the prompt
 */
function callGeminiAPI(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured in Script Properties');
  }
  
  // Get user-selected model from Script Properties - MANDATORY: Only Gemini 2.5 allowed
  let selectedModel = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL');
  
  if (!selectedModel || selectedModel.indexOf('gemini-2.5') !== 0) {
    // Force upgrade to Gemini 2.5 Flash if not set or using deprecated model
    selectedModel = 'gemini-2.5-flash';
    Logger.log('⚠️ No valid Gemini 2.5 model set, enforcing default: ' + selectedModel);
    PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', selectedModel);
  }
  
  Logger.log('🤖 Using model: ' + selectedModel);
  
  const url = `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`;
  
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
      maxOutputTokens: 16384,  // Increased from 8192 to prevent truncation
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  Logger.log('📡 Calling Gemini API: ' + url.split('?')[0]);
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200) {
    throw new Error('Gemini API Error: ' + response.getContentText());
  }
  
  const json = JSON.parse(response.getContentText());
  
  // FIXED: Add null safety checks for parts array
  if (json.candidates && json.candidates[0] && json.candidates[0].content) {
    const content = json.candidates[0].content;
    if (content.parts && content.parts[0] && content.parts[0].text) {
      return content.parts[0].text;
    }
    throw new Error('Gemini response missing parts[0].text. Content: ' + JSON.stringify(content).substring(0, 200));
  }
  
  throw new Error('Invalid Gemini API response structure: ' + JSON.stringify(json).substring(0, 500));
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
    // Final fallback: Return minimal structure with all required charts
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
      competitiveGaps: {
        topicGap: 'Could not parse',
        angleVoiceGap: 'Could not parse',
        formatGap: 'Could not parse'
      },
      uniqueMechanism: {
        name: 'Authority Engine Blueprint',
        tagline: 'Could not parse',
        oneParagraphDefinition: 'Could not parse',
        keyPromises: []
      },
      audienceProfile: {
        emotionalPains: [],
        hiddenDesires: [],
        limitingBeliefs: [],
        empoweringBeliefs: []
      },
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
    
    // Remove standalone JSON objects (everything between first { and last })
    const jsonStart = cleanedReport.indexOf('{');
    const jsonEnd = cleanedReport.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      // Only remove if it looks like a complete JSON object (starts at beginning or after newlines)
      const beforeJson = cleanedReport.substring(0, jsonStart).trim();
      if (beforeJson.length < 50) {  // Likely just whitespace or minimal intro
        cleanedReport = cleanedReport.substring(jsonEnd + 1);
      }
    }
    
    // Remove common artifacts
    cleanedReport = cleanedReport.replace(/\$\d+/g, '');  // Remove $2, $1, etc.
    cleanedReport = cleanedReport.replace(/\$\$/g, '');   // Remove $$
    
    // Remove triple dashes that might separate JSON from markdown
    cleanedReport = cleanedReport.replace(/^---+$/gm, '');
    
    // Clean up excessive whitespace
    cleanedReport = cleanedReport.replace(/\n{4,}/g, '\n\n\n');  // Max 3 newlines
    cleanedReport = cleanedReport.trim();
    
    // Ensure report starts with a heading
    if (!cleanedReport.startsWith('#')) {
      cleanedReport = '## 📈 Strategic Insights Dashboard (Narrative View)\n\n' + cleanedReport;
    }
    
    Logger.log('✅ Report cleaned successfully');
    return cleanedReport;
    
  } catch (error) {
    Logger.log('⚠️ Error cleaning report: ' + error.toString());
    // Return original if cleaning fails
    return fullResponse;
  }
}

/**
 * Save results to Google Sheet
 */
function saveStage1Results(sheetUrl, projectId, jsonData, fullResponse) {
  try {
    const ss = SpreadsheetApp.openByUrl(sheetUrl);
    const sheet = ss.getSheetByName('Workflow_Stage_1') || ss.insertSheet('Workflow_Stage_1');
    
    // Find or create row for this project
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === projectId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      rowIndex = sheet.getLastRow() + 1;
    }
    
    // Save data: ProjectID | Timestamp | JSON | Full Response
    sheet.getRange(rowIndex, 1).setValue(projectId);
    sheet.getRange(rowIndex, 2).setValue(new Date());
    sheet.getRange(rowIndex, 3).setValue(JSON.stringify(jsonData, null, 2));
    sheet.getRange(rowIndex, 4).setValue(fullResponse);
    
    Logger.log('✅ Stage 1 results saved to sheet');
    
  } catch (error) {
    Logger.log('⚠️ Failed to save to sheet: ' + error.toString());
    // Don't throw - still return results to UI even if save fails
  }
}

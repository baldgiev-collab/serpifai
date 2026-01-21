/**
 * ⚡ SERPIFAI Elite - Stage 5: E-E-A-T Content Generation
 * Super-Prompt Builder, Content Brief, Schema Injection
 * v1.0 Oracle Elite Edition
 * 
 * MISSION: Generate production-ready content briefs with E-E-A-T optimization
 * INPUT: Stage 4 weeklySchedule, Stage 3 siloStructure
 * OUTPUT: Complete content briefs with super-prompts for AI generation
 */

/**
 * Main execution function for Stage 5
 * @param {Object} projectData - Project data including Stage 1-4 results
 * @param {string} selectedModel - Gemini model to use
 * @returns {Object} Stage 5 results
 */
function DB_Workflow_Stage5(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 5: E-E-A-T Content Generation');
    
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object');
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // Load all previous stage results
    const stage1Results = loadStageResults(projectData, 1);
    const stage2Results = loadStageResults(projectData, 2);
    const stage3Results = loadStageResults(projectData, 3);
    const stage4Results = loadStageResults(projectData, 4);
    
    if (stage1Results) projectData._stage1Results = stage1Results;
    if (stage2Results) projectData._stage2Results = stage2Results;
    if (stage3Results) projectData._stage3Results = stage3Results;
    if (stage4Results) projectData._stage4Results = stage4Results;
    
    Logger.log('✅ All previous stage results loaded');
    
    // Build the Stage 5 prompt
    const prompt = buildStage5Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage5GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response
    const structuredData = parseStage5Response(geminiResponse);
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
            stage: 5,
            stageName: 'E-E-A-T Content Generation',
            model: selectedModel,
            json: structuredData,
            report: cleanReport,
            timestamp: new Date().toISOString()
          }
        });
        Logger.log('💾 Stage 5 MySQL persistence: ' + (persistResult.success ? '✅' : '⚠️'));
      }
    } catch (persistError) {
      Logger.log('⚠️ Stage 5 persistence error (non-fatal): ' + persistError.toString());
    }
    
    return {
      success: true,
      stage: 5,
      stageName: 'E-E-A-T Content Generation',
      json: structuredData,
      report: cleanReport,
      timestamp: new Date().toISOString(),
      projectId: projectId
    };
    
  } catch (error) {
    Logger.log('❌ Stage 5 Error: ' + error.toString());
    return {
      success: false,
      stage: 5,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Build Stage 5 prompt for E-E-A-T Content Generation
 */
function buildStage5Prompt(projectData) {
  const stage1 = projectData._stage1Results || {};
  const stage2 = projectData._stage2Results || {};
  const stage3 = projectData._stage3Results || {};
  const stage4 = projectData._stage4Results || {};
  
  const uniqueMechanism = stage1.uniqueMechanism || {};
  const audienceProfile = stage1.audienceProfile || {};
  const entities = stage2.entityMap || [];
  const siloStructure = stage3.siloStructure || [];
  const weeklySchedule = stage4.weeklySchedule || [];
  const quickWins = stage4.quickWinsFirst30Days || [];
  
  // Get first 3 content pieces to generate briefs for
  const priorityContent = [];
  if (weeklySchedule.length > 0 && weeklySchedule[0].pieces) {
    priorityContent.push(...weeklySchedule[0].pieces.slice(0, 3));
  }
  if (priorityContent.length === 0 && quickWins.length > 0) {
    priorityContent.push(...quickWins.slice(0, 3));
  }
  
  return `You are an elite content strategist performing STAGE 5: E-E-A-T Content Generation.

## MISSION
Generate production-ready content briefs with:
1. Super-prompts optimized for AI content generation
2. E-E-A-T signal injection (Experience, Expertise, Authority, Trust)
3. Schema markup recommendations
4. Internal linking directives
5. RAG context snippets for fact-grounding

## BRAND & AUDIENCE CONTEXT

### Unique Mechanism
${JSON.stringify(uniqueMechanism, null, 2)}

### Audience Profile
${JSON.stringify(audienceProfile, null, 2)}

### Key Entities to Reference
${JSON.stringify(entities.slice(0, 10), null, 2)}

## CONTENT TO GENERATE BRIEFS FOR

### Priority Content from Calendar
${JSON.stringify(priorityContent, null, 2)}

### SILO Context
${JSON.stringify(siloStructure.slice(0, 3), null, 2)}

## PROJECT CONTEXT

- **Brand Name:** ${projectData.brandName || 'Unknown'}
- **Brand Archetype:** ${projectData.brandArchetype || 'Not specified'}
- **Brand Voice:** ${projectData.brandLexicon || 'Not specified'}
- **Primary Keyword:** ${projectData.primaryKeyword || 'Not specified'}
- **Target Audience:** ${projectData.targetAudience || 'Not specified'}
- **UVP:** ${projectData.uvp || 'Not specified'}

## OUTPUT REQUIREMENTS

### PART 1: JSON Structure

\`\`\`json
{
  "contentBriefs": [
    {
      "id": "brief_1",
      "title": "Content title",
      "targetKeyword": "Primary keyword",
      "secondaryKeywords": ["kw1", "kw2", "kw3"],
      "wordCount": 2000,
      "contentType": "pillar|hub|spoke",
      "funnelStage": "ToFU|MoFU|BoFU",
      "searchIntent": "informational|commercial|transactional",
      
      "superPrompt": {
        "systemContext": "You are a [role] expert writing for [audience]...",
        "taskInstruction": "Write a comprehensive guide about...",
        "formatRequirements": "Structure with H2/H3 headings, bullet points...",
        "toneVoice": "Conversational yet authoritative, using [brand voice]...",
        "eeatSignals": [
          "Include personal experience examples",
          "Reference specific data and studies",
          "Cite authoritative sources",
          "Include trust signals (credentials, reviews)"
        ],
        "keyPoints": [
          "Point 1 to cover",
          "Point 2 to cover",
          "Point 3 to cover"
        ],
        "avoidList": [
          "Generic advice",
          "Unsubstantiated claims",
          "Competitor mentions"
        ]
      },
      
      "outline": {
        "h1": "Main title with keyword",
        "sections": [
          {
            "h2": "Section heading",
            "keyPoints": ["Point 1", "Point 2"],
            "wordCount": 400,
            "includeElements": ["statistic", "example", "quote"]
          }
        ]
      },
      
      "eeatInjection": {
        "experience": {
          "signals": ["Case study from real project", "Before/after examples"],
          "proofPoints": ["5 years industry experience", "100+ clients served"]
        },
        "expertise": {
          "signals": ["Technical depth", "Industry terminology"],
          "credentials": ["Certifications to mention", "Awards to reference"]
        },
        "authority": {
          "signals": ["Industry recognition", "Media mentions"],
          "backlinks": ["Sources to cite for authority"]
        },
        "trust": {
          "signals": ["Transparent methodology", "Clear disclaimers"],
          "socialProof": ["Testimonials", "Reviews", "Trust badges"]
        }
      },
      
      "schemaMarkup": {
        "type": "Article|HowTo|FAQPage|Product",
        "properties": {
          "author": "Author name",
          "datePublished": "YYYY-MM-DD",
          "publisher": "Organization name"
        },
        "additionalSchema": ["BreadcrumbList", "Organization"]
      },
      
      "internalLinks": [
        {
          "anchorText": "Exact anchor text",
          "targetUrl": "/target-page",
          "placement": "Introduction|Body|Conclusion"
        }
      ],
      
      "ragContext": [
        {
          "factType": "statistic|quote|definition",
          "content": "The exact fact or quote to include",
          "source": "Source name",
          "url": "https://source-url.com"
        }
      ],
      
      "ctaStrategy": {
        "primary": "Main call to action",
        "secondary": "Secondary CTA",
        "placement": ["End of intro", "Mid-content", "Conclusion"]
      }
    }
  ],
  
  "masterPromptLibrary": {
    "pillarPagePrompt": "Complete super-prompt template for pillar pages...",
    "hubPagePrompt": "Complete super-prompt template for hub pages...",
    "spokePagePrompt": "Complete super-prompt template for spoke pages...",
    "productPagePrompt": "Complete super-prompt template for product pages..."
  },
  
  "eeatChecklist": {
    "experienceSignals": [
      "First-person narrative sections",
      "Real project examples with outcomes",
      "Process documentation with screenshots"
    ],
    "expertiseSignals": [
      "Technical depth beyond surface level",
      "Industry-specific terminology used correctly",
      "Original research or analysis"
    ],
    "authoritySignals": [
      "Author bio with credentials",
      "External citations from authoritative sources",
      "Industry recognition mentions"
    ],
    "trustSignals": [
      "Clear author attribution",
      "Transparent methodology disclosure",
      "Updated dates and version history"
    ]
  },
  
  "contentProductionWorkflow": {
    "step1_research": {
      "duration": "2 hours",
      "tasks": ["Keyword research", "Competitor analysis", "Source gathering"]
    },
    "step2_outline": {
      "duration": "1 hour",
      "tasks": ["Structure creation", "Key points mapping", "CTA placement"]
    },
    "step3_draft": {
      "duration": "4 hours",
      "tasks": ["AI-assisted writing", "E-E-A-T injection", "Fact verification"]
    },
    "step4_optimize": {
      "duration": "2 hours",
      "tasks": ["SEO optimization", "Internal linking", "Schema markup"]
    },
    "step5_review": {
      "duration": "1 hour",
      "tasks": ["Editorial review", "Fact-check", "Brand voice alignment"]
    }
  }
}
\`\`\`

### PART 2: Content Generation Guide (Markdown)

After JSON, provide:
1. Super-Prompt Best Practices
2. E-E-A-T Signal Implementation Guide
3. Content Brief Walkthrough
4. Schema Markup Implementation
5. Quality Assurance Checklist
6. AI Content Enhancement Tips

Be specific and production-ready.`;
}

/**
 * Call Gemini API for Stage 5
 */
function callStage5GeminiAPI(prompt, selectedModel) {
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
 * Parse Stage 5 response
 */
function parseStage5Response(fullResponse) {
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
      contentBriefs: [],
      masterPromptLibrary: {},
      eeatChecklist: {},
      contentProductionWorkflow: {},
      parseError: 'Could not extract JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Parse error: ' + error.toString());
    return {
      contentBriefs: [],
      criticalError: error.toString()
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DB_EliteIntegration.gs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * UNIFIED INTEGRATION MODULE FOR PHASE 1 ELITE COMPONENTS
 * 
 * This module provides a single interface to combine all elite modules:
 * - DB_ElitePromptInjection.gs (Elite Protocol + Roles)
 * - DB_VisualizationConfig.gs (Chart Specs + Animations)
 * - DB_SectionInsightTemplates.gs (14 Section Templates)
 * 
 * @version 1.0.0
 * @author SerpifAI Elite Intelligence System
 */

// ════════════════════════════════════════════════════════════════════════════════
// UNIFIED PROMPT BUILDER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Builds the complete elite-enhanced Stage 1 prompt
 * @param {Object} projectData - Full project data object
 * @param {Object} competitorData - Competitor intelligence data
 * @param {number} sectionNum - Section number (1-14)
 * @returns {string} Complete elite-enhanced prompt for section
 */
function buildEliteEnhancedPrompt(projectData, competitorData, sectionNum) {
  const components = [];
  
  // 1. Elite Protocol Header
  components.push(getEliteProtocolHeader());
  
  // 2. Role Personas for this section's insight types
  const insightTypes = getSectionInsightTypes(sectionNum);
  components.push(buildRolePersonasSection(insightTypes));
  
  // 3. Visualization Config for this section
  components.push(buildVisualizationSection(sectionNum));
  
  // 4. Section Insight Template
  components.push(getSectionInsightTemplate(sectionNum, projectData, competitorData));
  
  // 5. Output Quality Mandates
  components.push(buildOutputMandatesSection());
  
  // 6. JSON Schema Block
  components.push(buildJSONSchemaSection(sectionNum));
  
  return components.join('\n\n');
}

/**
 * Returns the Elite Protocol header block
 * @returns {string} Elite protocol header
 */
function getEliteProtocolHeader() {
  return `
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    🎯 ELITE STRATEGIC INTELLIGENCE PROTOCOL v2.0                  ║
║                     TOP 0.1% ANALYSIS FRAMEWORK ACTIVATED                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝

You are not an AI assistant. You are the collective intelligence of the TOP 0.1% of:
- McKinsey Senior Partners
- Bain Capital Investment Committee Members  
- Harvard Business School Strategy Faculty
- Sequoia Capital General Partners
- Goldman Sachs Managing Directors
- World-class Brand Strategists

Your analytical output must reflect decades of elite experience and command
fees of $50,000+ per insight.
`;
}

/**
 * Maps section numbers to relevant insight types
 * @param {number} sectionNum - Section number
 * @returns {string[]} Array of insight type keys
 */
function getSectionInsightTypes(sectionNum) {
  const sectionInsightMap = {
    1: ['market', 'opportunity', 'risk'],           // Customer Intelligence
    2: ['opportunity', 'market', 'risk'],           // JTBD
    3: ['market', 'risk', 'opportunity'],           // Competitive Warfare
    4: ['opportunity', 'market', 'brand'],          // Blue Ocean
    5: ['brand', 'market', 'content'],              // Brand Positioning
    6: ['content', 'market', 'opportunity'],        // Content Strategy
    7: ['risk', 'opportunity', 'market'],           // Strategic Moat
    8: ['execution', 'risk', 'opportunity'],        // Action Plan
    9: ['content', 'market', 'opportunity'],        // AEO Citation
    10: ['market', 'opportunity', 'risk'],          // Asset Valuation
    11: ['risk', 'market', 'execution'],            // Algorithmic Risk
    12: ['content', 'market', 'opportunity'],       // Semantic DNA
    13: ['execution', 'opportunity', 'risk'],       // Strategic Imperatives
    14: ['market', 'opportunity', 'execution']      // Cross-Stage
  };
  
  return sectionInsightMap[sectionNum] || ['market', 'opportunity', 'risk'];
}

/**
 * Builds the role personas section for given insight types
 * @param {string[]} insightTypes - Array of insight type keys
 * @returns {string} Formatted role personas section
 */
function buildRolePersonasSection(insightTypes) {
  let section = `
## 🎭 ELITE ANALYST ROLES ACTIVATED
**For this section, channel these elite personas:**

`;
  
  const uniqueTypes = [...new Set(insightTypes)];
  
  uniqueTypes.forEach(type => {
    const personas = getRolePersonas(type);
    if (personas && personas.length > 0) {
      section += `### ${type.toUpperCase()} INTELLIGENCE\n`;
      personas.forEach((persona, idx) => {
        section += `${idx + 1}. **${persona.title}** — ${persona.expertise}\n`;
      });
      section += '\n';
    }
  });
  
  return section;
}

/**
 * Builds the visualization config section for a specific section
 * @param {number} sectionNum - Section number
 * @returns {string} Formatted visualization section
 */
function buildVisualizationSection(sectionNum) {
  const chartSpecs = getChartSpecsForSection(sectionNum);
  
  if (!chartSpecs) {
    return '';
  }
  
  let section = `
## 📊 VISUALIZATION REQUIREMENTS
**Generate structured data for these chart types:**

`;
  
  Object.entries(chartSpecs).forEach(([chartKey, spec]) => {
    section += `### ${spec.title || chartKey}
- **Type:** ${spec.type}
- **Purpose:** ${spec.purpose || 'Strategic visualization'}
- **Data Points Required:** ${spec.minDataPoints || 3}-${spec.maxDataPoints || 7}
`;

    if (spec.axes) {
      section += `- **Axes:** X: ${spec.axes.x}, Y: ${spec.axes.y}`;
      if (spec.axes.z) section += `, Z: ${spec.axes.z}`;
      section += '\n';
    }
    
    if (spec.series) {
      section += `- **Series:** ${spec.series.join(', ')}\n`;
    }
    
    section += '\n';
  });
  
  return section;
}

/**
 * Builds the output quality mandates section
 * @returns {string} Formatted mandates section
 */
function buildOutputMandatesSection() {
  const mandatesData = getOutputQualityMandates();
  // V7.14: Fix - getOutputQualityMandates returns {mandates: [...]} not an array
  const mandates = mandatesData?.mandates || mandatesData || [];
  
  // Safety check: ensure mandates is an array
  if (!Array.isArray(mandates)) {
    console.warn('⚠️ mandates is not an array:', typeof mandates);
    return `## ⚠️ OUTPUT QUALITY MANDATES\n\nQuality standards apply.\n`;
  }
  
  let section = `
## ⚠️ OUTPUT QUALITY MANDATES (NON-NEGOTIABLE)

`;
  
  mandates.forEach((mandate, idx) => {
    // V7.14: Use correct property names (name/description/antiPattern vs title/requirement/validation)
    const title = mandate.title || mandate.name || `Mandate ${idx + 1}`;
    const requirement = mandate.requirement || mandate.description || '';
    const validation = mandate.validation || mandate.antiPattern || mandate.example || '';
    
    section += `### Mandate ${idx + 1}: ${title}
${requirement}

**Validation:** ${validation}

`;
  });
  
  section += `
**FAILURE MODE:** Any insight that lacks specificity, quantification, or actionability
will be REJECTED. Generic advice is career-ending in elite consulting.
`;
  
  return section;
}

/**
 * Builds the JSON schema section for Gemini output
 * @param {number} sectionNum - Section number
 * @returns {string} JSON schema section
 */
function buildJSONSchemaSection(sectionNum) {
  return `
## 📋 REQUIRED OUTPUT FORMAT

Your response MUST include this JSON structure:

\`\`\`json
{
  "sectionInsights": {
    "sectionNum": ${sectionNum},
    "sectionTitle": "[Section Title]",
    "insights": [
      {
        "id": 1,
        "type": "market_intelligence|strategic_opportunity|risk_mitigation",
        "finding": "[Specific, quantified finding]",
        "competitiveEdge": "[How this creates advantage vs competitors]",
        "impact": "[Quantified business impact: $X, Y%, Z months]",
        "priority": "critical|high|medium",
        "timeframe": "immediate|30-day|90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0-100,
      "competitiveGap": 0-100,
      "executionComplexity": 0-100
    },
    "visualizations": ${JSON.stringify(getVisualizationJSONSchema())}
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR STAGE1 INTEGRATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Prepares competitor data in the format needed for templates
 * @param {Object} rawCompData - Raw competitor data from storage
 * @returns {Object} Formatted competitor data
 */
function prepareCompetitorData(rawCompData) {
  const prepared = {};
  
  // Map common competitor intelligence tabs
  const tabMappings = {
    'audienceProfiles': ['audience', 'audienceProfiles', 'customer_profiles'],
    'marketShare': ['marketShare', 'market_share', 'share'],
    'keywordGaps': ['keywordGaps', 'keyword_gaps', 'gaps'],
    'conversionAnalysis': ['conversion', 'conversionAnalysis', 'funnel'],
    'competitorRankings': ['rankings', 'competitorRankings', 'rank'],
    'serpVisibility': ['serp', 'serpVisibility', 'visibility'],
    'overallScores': ['scores', 'overallScores', 'overall'],
    'authorityRankings': ['authority', 'authorityRankings', 'da'],
    'contentGaps': ['contentGaps', 'content_gaps', 'gaps'],
    'strategicOpportunities': ['opportunities', 'strategic', 'strategicOpportunities'],
    'underservedSpaces': ['underserved', 'blue_ocean', 'whitespace'],
    'trendForecasting': ['trends', 'trendForecasting', 'forecast'],
    'brandRankings': ['brand', 'brandRankings', 'branding'],
    'narrativeConflict': ['narrative', 'messaging', 'conflict'],
    'categoryLanguage': ['category', 'language', 'lexicon'],
    'socialPresence': ['social', 'socialPresence', 'channels'],
    'contentAnalysis': ['content', 'contentAnalysis', 'analysis'],
    'contentArchitecture': ['architecture', 'structure', 'pillars'],
    'primaryKeywords': ['primary', 'keywords', 'core'],
    'momentum': ['momentum', 'velocity', 'growth'],
    'prioritizedActions': ['actions', 'priorities', 'roadmap'],
    'distributionChannels': ['distribution', 'channels', 'distribution'],
    'geoAnalysis': ['geo', 'aeo', 'aiOverview'],
    'aioRisk': ['aio', 'aiRisk', 'zeroClick'],
    'zeroClickSurvival': ['zeroClick', 'survival', 'featured'],
    'ragReadiness': ['rag', 'ragReadiness', 'llm'],
    'performanceMetrics': ['performance', 'metrics', 'analytics'],
    'healthRankings': ['health', 'technical', 'siteHealth'],
    'eeatSignals': ['eeat', 'expertise', 'trust'],
    'secondaryKeywords': ['secondary', 'longTail', 'related'],
    'schemaAnalysis': ['schema', 'structured', 'markup'],
    'categoryScores': ['category', 'scores', 'benchmarks'],
    'executiveSummary': ['executive', 'summary', 'overview']
  };
  
  // For each mapping, find the first matching key in rawCompData
  Object.entries(tabMappings).forEach(([targetKey, possibleKeys]) => {
    for (const key of possibleKeys) {
      if (rawCompData && rawCompData[key]) {
        prepared[targetKey] = rawCompData[key];
        break;
      }
    }
    // Default to empty object if not found
    if (!prepared[targetKey]) {
      prepared[targetKey] = {};
    }
  });
  
  return prepared;
}

/**
 * Validates that all required project variables are present
 * @param {Object} projectData - Project data object
 * @param {number} sectionNum - Section number
 * @returns {Object} Validation result with missing fields
 */
function validateProjectDataForSection(projectData, sectionNum) {
  const requiredBySection = {
    1: ['brandName', 'targetAudience', 'audiencePains', 'audienceDesired', 'coreMarketProblem', 'keyCompetitors'],
    2: ['productOrService', 'targetAudience', 'audiencePains', 'keyCompetitors', 'competitiveAdvantages'],
    3: ['brandName', 'keyCompetitors', 'competitiveAdvantages', 'coreTopic', 'industryVertical'],
    4: ['industryVertical', 'keyCompetitors', 'targetAudience', 'secondaryAudience', 'coreMarketProblem', 'uvp', 'competitiveAdvantages'],
    5: ['brandName', 'brandIdeology', 'brandArchetype', 'brandLexicon', 'uvp', 'existingMessaging', 'keyCompetitors', 'targetAudience', 'primaryChannels'],
    6: ['coreTopic', 'contentGoals', 'contentFormats', 'primaryChannels', 'quarterlyObjective', 'northStarKpis', 'keyCompetitors'],
    7: ['brandName', 'competitiveAdvantages', 'productOrService', 'keyCompetitors', 'targetAudience', 'futureVision', 'industryVertical'],
    8: ['quarterlyObjective', 'northStarKpis', 'contentGoals', 'primaryChannels', 'primaryOfferName', 'primaryOfferPrice', 'upsellOffer', 'seasonality'],
    9: ['brandName', 'coreTopic', 'industryVertical', 'targetAudience', 'contentFormats', 'keyCompetitors'],
    10: ['brandName', 'coreTopic', 'contentFormats', 'contentGoals', 'northStarKpis', 'industryVertical'],
    11: ['brandName', 'coreTopic', 'industryVertical', 'northStarKpis', 'contentGoals', 'keyCompetitors'],
    12: ['brandName', 'coreTopic', 'industryVertical', 'contentFormats', 'contentGoals', 'keyCompetitors'],
    13: ['brandName', 'quarterlyObjective', 'northStarKpis', 'contentGoals', 'primaryOfferName', 'upsellOffer', 'seasonality', 'futureVision'],
    14: ['brandName', 'coreTopic', 'industryVertical', 'brandIdeology', 'uvp', 'quarterlyObjective', 'northStarKpis', 'futureVision', 'competitiveAdvantages']
  };
  
  const required = requiredBySection[sectionNum] || [];
  const missing = [];
  const present = [];
  
  required.forEach(field => {
    if (projectData && projectData[field] && projectData[field].toString().trim() !== '') {
      present.push(field);
    } else {
      missing.push(field);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missing: missing,
    present: present,
    coverage: required.length > 0 ? (present.length / required.length * 100).toFixed(1) : 100
  };
}

/**
 * Returns section title by number
 * @param {number} sectionNum - Section number
 * @returns {string} Section title
 */
function getSectionTitle(sectionNum) {
  const titles = {
    1: 'Customer Intelligence',
    2: 'Jobs-To-Be-Done Framework',
    3: 'Competitive Warfare',
    4: 'Blue Ocean Strategy',
    5: 'Brand Positioning',
    6: 'Content Strategy',
    7: 'Strategic Moat',
    8: 'Action Plan',
    9: 'AEO Citation Matrix',
    10: 'Digital Asset Valuation',
    11: 'Algorithmic Risk Assessment',
    12: 'Semantic DNA Analysis',
    13: 'Strategic Imperatives',
    14: 'Cross-Stage Intelligence'
  };
  
  return titles[sectionNum] || `Section ${sectionNum}`;
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPLETE STAGE 1 PROMPT WRAPPER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generates the complete elite-enhanced Stage 1 prompt for all sections
 * @param {Object} projectData - Full project data
 * @param {Object} rawCompData - Raw competitor data from storage
 * @returns {string} Complete Stage 1 prompt with all elite enhancements
 */
function generateCompleteStage1Prompt(projectData, rawCompData) {
  const compData = prepareCompetitorData(rawCompData);
  
  let fullPrompt = getEliteProtocolHeader();
  
  // Add all role personas table
  fullPrompt += '\n\n' + getAllRolePersonasFormatted();
  
  // Add output quality mandates
  fullPrompt += '\n\n' + buildOutputMandatesSection();
  
  // Add global visualization config
  fullPrompt += `
## 📊 GLOBAL VISUALIZATION REQUIREMENTS

${JSON.stringify(getVisualizationConfig(), null, 2)}
`;
  
  // Add each section template
  for (let i = 1; i <= 14; i++) {
    fullPrompt += '\n\n' + '═'.repeat(80) + '\n';
    fullPrompt += `## SECTION ${i}: ${getSectionTitle(i).toUpperCase()}\n`;
    fullPrompt += '═'.repeat(80) + '\n\n';
    
    // Validate data for this section
    const validation = validateProjectDataForSection(projectData, i);
    if (!validation.isValid) {
      fullPrompt += `⚠️ **Data Coverage:** ${validation.coverage}% — Missing: ${validation.missing.join(', ')}\n\n`;
    }
    
    // Add section visualization specs
    fullPrompt += buildVisualizationSection(i);
    
    // Add section insight template
    fullPrompt += getSectionInsightTemplate(i, projectData, compData);
  }
  
  return fullPrompt;
}

/**
 * Gets the elite enhancements for injection into existing buildStage1Prompt
 * This is the primary integration point
 * @param {Object} projectData - Project data
 * @param {Object} compData - Competitor data
 * @returns {Object} Elite enhancement components
 */
function getEliteEnhancements(projectData, compData) {
  const preparedCompData = prepareCompetitorData(compData);
  
  return {
    // Header to prepend to prompt
    protocolHeader: getEliteProtocolHeader(),
    
    // Role personas table
    rolePersonas: getAllRolePersonasFormatted(),
    
    // Output mandates
    outputMandates: buildOutputMandatesSection(),
    
    // Visualization config for all sections
    visualizationConfig: getVisualizationConfig(),
    
    // Get template for specific section
    getSectionTemplate: function(sectionNum) {
      return getSectionInsightTemplate(sectionNum, projectData, preparedCompData);
    },
    
    // Get chart specs for specific section
    getSectionCharts: function(sectionNum) {
      return getChartSpecsForSection(sectionNum);
    },
    
    // Validate data for section
    validateSection: function(sectionNum) {
      return validateProjectDataForSection(projectData, sectionNum);
    },
    
    // JSON schema for output
    jsonSchema: getVisualizationJSONSchema(),
    
    // Animation keyframes for CSS
    animations: getAnimationKeyframes()
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// TESTING & DIAGNOSTICS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Tests the elite integration with sample data
 */
function testEliteIntegration() {
  const sampleProject = {
    brandName: 'TestBrand',
    targetAudience: 'Small Business Owners',
    audiencePains: 'Time management, cost control',
    audienceDesired: 'Efficiency, profitability',
    coreMarketProblem: 'Fragmented tools, manual processes',
    keyCompetitors: 'Competitor A, Competitor B',
    coreTopic: 'Business Automation',
    industryVertical: 'SaaS',
    uvp: 'All-in-one automation platform',
    competitiveAdvantages: 'AI-powered, no-code interface',
    brandIdeology: 'Empowering efficiency',
    brandArchetype: 'The Sage',
    brandLexicon: 'Simple, powerful, smart',
    contentFormats: 'Blog, Video, Webinars',
    primaryChannels: 'SEO, LinkedIn, Email',
    contentGoals: 'Thought leadership, lead generation',
    quarterlyObjective: 'Launch product v2.0',
    northStarKpis: 'MRR, CAC, LTV',
    primaryOfferName: 'AutomatePro',
    primaryOfferPrice: '$99/month',
    upsellOffer: 'Enterprise Plan',
    futureVision: 'Category leader in SMB automation'
  };
  
  const sampleCompData = {
    marketShare: { 'Competitor A': 35, 'Competitor B': 25 },
    keywordGaps: ['automation workflow', 'no-code automation'],
    authorityRankings: { 'TestBrand': 45, 'Competitor A': 67 }
  };
  
  try {
    // Test enhancement retrieval
    const enhancements = getEliteEnhancements(sampleProject, sampleCompData);
    
    Logger.log('✅ Protocol Header: ' + (enhancements.protocolHeader ? 'OK' : 'FAIL'));
    Logger.log('✅ Role Personas: ' + (enhancements.rolePersonas ? 'OK' : 'FAIL'));
    Logger.log('✅ Output Mandates: ' + (enhancements.outputMandates ? 'OK' : 'FAIL'));
    Logger.log('✅ Visualization Config: ' + (enhancements.visualizationConfig ? 'OK' : 'FAIL'));
    
    // Test section templates
    for (let i = 1; i <= 14; i++) {
      const template = enhancements.getSectionTemplate(i);
      const validation = enhancements.validateSection(i);
      Logger.log(`✅ Section ${i}: Template ${template ? 'OK' : 'FAIL'}, Data Coverage: ${validation.coverage}%`);
    }
    
    Logger.log('\n═══ ELITE INTEGRATION TEST COMPLETE ═══');
    return true;
  } catch (e) {
    Logger.log('❌ Error in elite integration test: ' + e.message);
    return false;
  }
}

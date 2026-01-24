/**
 * ⚡ SERPIFAI Elite - Stage 1: Market Research & Strategy
 * Mega Prompt for Brand Strategy & Competitive Analysis
 * v6 SaaS Edition
 * 
 * V9.0 UPDATE: Now integrates saved competitor analysis data
 * to provide data-driven competitive intelligence in the prompt
 * 
 * V7.0 SHREDDED PAYLOAD UPDATE: 
 * - UI no longer passes 5.3MB competitor data via google.script.run
 * - Server fetches competitor data DIRECTLY from MySQL
 * - This fixes the HTTP 400 error from payload size limits
 * 
 * V10.0 ELITE MODULAR ARCHITECTURE:
 * - Elite components now split across modular files:
 *   - DB_ElitePromptInjection.gs: Elite Protocol + 36 Role Personas
 *   - DB_VisualizationConfig.gs: Chart specs for all 14 sections (42 charts)
 *   - DB_SectionInsightTemplates.gs: Strategic Intelligence Summary templates
 *   - DB_EliteIntegration.gs: Unified integration layer
 * - Use buildEliteEnhancedStage1Prompt() for modular approach
 * - Original buildStage1Prompt() preserved for backwards compatibility
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
    
    // =========================================================================
    // V7 SHREDDED PAYLOAD: Fetch competitor data from MySQL if flagged
    // The UI sends _fetchCompetitorDataFromMySQL=true to prevent HTTP 400
    // =========================================================================
    if (projectData._fetchCompetitorDataFromMySQL === true) {
      Logger.log('📡 SHREDDED PAYLOAD MODE: Fetching competitor data from MySQL...');
      const projectId = projectData.projectId || projectData.brandName;
      
      if (projectId) {
        const mysqlCompetitorData = fetchCompetitorDataFromMySQL(projectId);
        if (mysqlCompetitorData && mysqlCompetitorData.success) {
          Logger.log('✅ Competitor data loaded from MySQL: ' + (mysqlCompetitorData.competitorCount || 0) + ' competitors');
          // Attach the competitor data to projectData for prompt building
          projectData.competitorAnalysis = mysqlCompetitorData.data;
          projectData._competitorDataSource = 'mysql';
        } else {
          Logger.log('⚠️ No competitor data in MySQL (reason: ' + (mysqlCompetitorData?.reason || 'unknown') + ')');
        }
      }
    }
    
    // V9.0: Load saved competitor analysis if available
    const competitorInsights = loadCompetitorInsightsForWorkflow(projectData);
    if (competitorInsights && competitorInsights.hasData) {
      Logger.log('✅ Competitor insights loaded: ' + competitorInsights.competitorCount + ' competitors');
      projectData._competitorInsights = competitorInsights;
    } else {
      Logger.log('ℹ️ No saved competitor analysis found - running without competitor data');
    }
    
    // V7.22 ELITE: Build the elite-enhanced mega prompt with strategic intelligence
    // This uses getEliteEnhancements() for forensic-grade insights
    Logger.log('🔍 Checking Elite Strategic Intelligence availability...');
    let prompt;
    let eliteEnabled = false;
    
    try {
      // Check if elite functions are available
      const hasGetEliteEnhancements = (typeof getEliteEnhancements === 'function');
      const hasBuildElitePrompt = (typeof buildEliteEnhancedStage1Prompt === 'function');
      
      Logger.log('🔍 Elite check: getEliteEnhancements=' + hasGetEliteEnhancements + ', buildEliteEnhancedStage1Prompt=' + hasBuildElitePrompt);
      
      if (hasGetEliteEnhancements && hasBuildElitePrompt) {
        Logger.log('🧠 Using Elite Strategic Intelligence prompt builder');
        prompt = buildEliteEnhancedStage1Prompt(projectData);
        eliteEnabled = true;
        Logger.log('✅ Elite prompt built successfully');
      } else {
        Logger.log('⚠️ Elite modules not available (getEliteEnhancements=' + hasGetEliteEnhancements + ', buildEliteEnhancedStage1Prompt=' + hasBuildElitePrompt + ') - using standard prompt');
        prompt = buildStage1Prompt(projectData);
      }
    } catch (eliteError) {
      Logger.log('❌ Elite prompt build failed: ' + eliteError.message);
      Logger.log('   Stack: ' + (eliteError.stack || 'N/A'));
      Logger.log('⚠️ Falling back to standard prompt builder');
      prompt = buildStage1Prompt(projectData);
    }
    
    Logger.log('✅ Prompt built (elite=' + eliteEnabled + '), length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage1GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response into structured JSON
    const structuredData = parseStage1Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report (remove JSON block, artifacts, etc.)
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // =========================================================================
    // V11.0 FORENSIC DATA BRIDGE: Extract BEFORE MySQL persist so it gets saved
    // This ensures bridge data is available during hydration
    // =========================================================================
    const forensicBridge = extractForensicBridge(projectData, structuredData, cleanReport);
    Logger.log('🔗 Forensic Bridge: ' + (forensicBridge ? 'EXTRACTED' : 'SKIPPED'));
    if (forensicBridge) {
      Logger.log('   Fields: ' + Object.keys(forensicBridge.autoPopulation || {}).join(', '));
    }
    
    // =========================================================================
    // MYSQL PERSISTENCE: Save Stage 1 results via UPP
    // V7 FIX: Pass transactionId (jobToken) explicitly for persistence
    // =========================================================================
    const projectId = projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT';
    const transactionId = projectData._transactionId || null;
    
    try {
      if (typeof UPP_commit === 'function') {
        const persistResult = UPP_commit({
          type: 'workflow_stage',
          domain: projectId,
          competitorId: projectId,
          jobToken: transactionId,  // V7 FIX: Explicit token passing
          payload: {
            stage: 1,
            stageName: 'Market Research & Strategy',
            model: selectedModel,
            json: structuredData,
            report: cleanReport,
            timestamp: new Date().toISOString(),
            competitorDataUsed: !!(competitorInsights && competitorInsights.hasData),
            promptLength: prompt.length,
            responseLength: geminiResponse.length,
            // V11.0: Include forensicBridge for Stage 2 auto-population during hydration
            forensicBridge: forensicBridge
          }
        });
        Logger.log('💾 Stage 1 MySQL persistence: ' + (persistResult.success ? '✅ SUCCESS' : '⚠️ FAILED'));
        if (persistResult.bytesWritten) {
          Logger.log('   Bytes written: ' + persistResult.bytesWritten);
        }
      } else {
        Logger.log('⚠️ UPP_commit not available - Stage 1 results not persisted to MySQL');
      }
    } catch (persistError) {
      Logger.log('⚠️ Stage 1 MySQL persistence error (non-fatal): ' + persistError.toString());
    }
    
    // =========================================================================
    // V7.10 CACHE FIX: Save to CacheService for immediate hydration
    // This bypasses MySQL latency issues entirely
    // =========================================================================
    try {
      const cache = CacheService.getUserCache();
      const cacheKey = 'stage_' + projectId + '_1';
      
      // Store report and json in cache (5 min TTL)
      cache.put(cacheKey + '_report', cleanReport, 300);
      cache.put(cacheKey + '_json', JSON.stringify(structuredData), 300);
      cache.put(cacheKey + '_meta', JSON.stringify({
        model: selectedModel,
        timestamp: new Date().toISOString(),
        hasData: true
      }), 300);
      
      Logger.log('💾 V7.10 CacheService: Stage 1 cached for immediate hydration');
    } catch (cacheError) {
      Logger.log('⚠️ CacheService error (non-fatal): ' + cacheError.toString());
    }
    
    // Note: forensicBridge was already extracted above before MySQL persist
    
    // Return both JSON and full response
    return {
      success: true,
      stage: 1,
      stageName: 'Market Research & Strategy',
      json: structuredData,  // For UI charts/visualization
      report: cleanReport,  // For AI report panel (markdown only, no JSON)
      timestamp: new Date().toISOString(),
      projectId: projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT',
      competitorDataUsed: !!(competitorInsights && competitorInsights.hasData),
      // V10.8: Include forensicIntelligence for competitor cards (AEO, Brittleness, Asset values)
      forensicIntelligence: (competitorInsights && competitorInsights.forensicIntelligence) ? 
        competitorInsights.forensicIntelligence : null,
      // V7: Include competitor analysis summary for UI display
      competitorAnalysisSummary: (competitorInsights && competitorInsights.hasData) ? {
        competitorCount: competitorInsights.competitorCount || 0,
        topCompetitor: competitorInsights.topCompetitor || '',
        marketAverages: competitorInsights.marketAverages || {},
        geminiInsights: competitorInsights.geminiInsights || null,
        technicalScoresAvailable: !!(competitorInsights.technicalScores && competitorInsights.technicalScores.length > 0),
        contentInsightsAvailable: !!(competitorInsights.contentInsights && competitorInsights.contentInsights.length > 0),
        keywordDataAvailable: !!(competitorInsights.keywordIntelligence && competitorInsights.keywordIntelligence.totalKeywords > 0)
      } : null,
      // V11.0: Forensic Data Bridge for Stage 2 auto-population
      forensicBridge: forensicBridge
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// V11.0 FORENSIC DATA BRIDGE: Stage 1 → Stage 2 Auto-Population
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Extracts strategic intelligence from Stage 1 results to auto-populate Stage 2 fields.
 * This eliminates manual data re-entry and ensures strategic alignment continuity.
 * 
 * @param {Object} projectData - Original Stage 1 input data
 * @param {Object} structuredData - Parsed Stage 1 JSON output (dashboardCharts, etc.)
 * @param {string} report - Stage 1 markdown report
 * @returns {Object} forensicBridge object with Stage 2 field mappings
 */
function extractForensicBridge(projectData, structuredData, report) {
  try {
    Logger.log('🔗 Extracting Forensic Data Bridge for Stage 2...');
    
    const dc = structuredData?.dashboardCharts || {};
    const now = new Date().toISOString();
    
    // Helper: Safely get first item from array or empty string
    function firstItem(arr, prop) {
      if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
      const item = arr[0];
      return prop ? (item[prop] || '') : (typeof item === 'string' ? item : JSON.stringify(item));
    }
    
    // Helper: Extract from report by section number
    function extractFromReport(sectionNum, pattern) {
      if (!report) return '';
      const sectionRegex = new RegExp('SECTION\\s*' + sectionNum + '[:\\s].*?(?=SECTION\\s*\\d|$)', 'is');
      const match = report.match(sectionRegex);
      if (!match) return '';
      const sectionText = match[0];
      if (pattern) {
        const patternMatch = sectionText.match(pattern);
        return patternMatch ? patternMatch[1]?.trim() || patternMatch[0]?.trim() : '';
      }
      // Return first meaningful sentence
      const sentences = sectionText.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 250);
      return sentences[0]?.trim() + '.' || '';
    }
    
    // Helper: Collect keywords from multiple sources
    function collectKeywords(sources) {
      const keywords = new Set();
      sources.forEach(source => {
        if (Array.isArray(source)) {
          source.forEach(item => {
            if (typeof item === 'string') keywords.add(item);
            else if (item?.keyword) keywords.add(item.keyword);
            else if (item?.name) keywords.add(item.name);
          });
        } else if (typeof source === 'string') {
          source.split(',').forEach(k => keywords.add(k.trim()));
        }
      });
      return Array.from(keywords).filter(k => k.length > 2).slice(0, 15).join(', ');
    }
    
    const bridge = {
      _meta: {
        version: '1.0.0',
        createdAt: now,
        projectId: projectData.projectId || projectData.brandName || 'UNKNOWN'
      },
      
      // Strategic context for read-only banners
      strategicContext: {
        brandName: projectData.brandName || '',
        targetAudience: projectData.targetAudience || '',
        businessGoal: projectData.quarterlyObjective || projectData.contentGoals || ''
      },
      
      // Auto-population values for Stage 2 fields
      autoPopulation: {
        // Core Strategic Question - from Blue Ocean (Section 4)
        // V12.0 FIX: Corrected chart key from blueOceanOpportunityChart → blueOceanOpportunitiesChart
        coreStrategicQuestion: {
          value: firstItem(dc.blueOceanOpportunitiesChart, 'opportunity') ||
                 firstItem(dc.blueOceanOpportunitiesChart, 'label') ||
                 firstItem(dc.informationBlackHolesChart, 'topic') ||
                 extractFromReport(4, /opportunity[:\s]+([^.]+\.)/i) ||
                 '',  // V12.0: No fallback templates - use real data only
          sourceSection: 4,
          notarized: true
        },
        
        // Thesis (Pro Angle) - from Brand Positioning (Section 5)
        // V12.0 FIX: Enhanced extraction from brandPositioningChart array
        thesis: {
          value: firstItem(dc.brandPositioningChart, 'advantage') ||
                 firstItem(dc.brandPositioningChart, 'position') ||
                 firstItem(dc.valuePropositionMixChart, 'proposition') ||
                 structuredData?.brandPositioning?.thesis ||
                 extractFromReport(5, /advantage[:\s]+([^.]+\.)/i) ||
                 projectData.uvp || '',
          sourceSection: 5,
          notarized: true
        },
        
        // Antithesis (Con Angle) - from Competitive Gaps (Section 3)
        antithesis: {
          value: firstItem(dc.competitiveAdvantageMapChart, 'gap') ||
                 structuredData?.competitiveGaps?.topicGap ||
                 extractFromReport(3, /objection[:\s]+([^.]+\.)/i) ||
                 'Traditional approaches may offer more control but lack scalability.',
          sourceSection: 3,
          notarized: true
        },
        
        // Key Market Data - from Customer Frustrations (Section 1)
        // V12.0 FIX: Corrected chart key from customerFrustrationChart → customerFrustrationsChart
        keyMarketData: {
          value: firstItem(dc.customerFrustrationsChart, 'statistic') ||
                 firstItem(dc.customerFrustrationsChart, 'frustration') ||
                 firstItem(dc.customerFrustrationsChart, 'label') ||
                 extractFromReport(1, /(\d+%[^.]+\.)/i) ||
                 '',  // V12.0: No fallback templates
          sourceSection: 1,
          notarized: true
        },
        
        // Category Definition - from Blue Ocean (Section 4) or Content Pillars (Section 6)
        // V12.0 FIX: Corrected chart key and added pillar extraction
        categoryDefinition: {
          value: firstItem(dc.blueOceanOpportunitiesChart, 'category') ||
                 firstItem(dc.strategicContentPillarsChart, 'pillarName') ||
                 structuredData?.categoryCreation ||
                 extractFromReport(4, /category[:\s]+([^.]+\.)/i) ||
                 projectData.industryVertical || '',
          sourceSection: 4,
          notarized: true
        },
        
        // Core Market Problem (Stage 2 version - s2_coreMarketProblem)
        // V12.0 FIX: Corrected chart key
        s2_coreMarketProblem: {
          value: firstItem(dc.customerFrustrationsChart, 'frustration') ||
                 firstItem(dc.customerFrustrationsChart, 'label') ||
                 firstItem(dc.informationBlackHolesChart, 'topic') ||
                 projectData.audiencePains ||
                 extractFromReport(1, /problem[:\s]+([^.]+\.)/i) ||
                 '',  // V12.0: No fallback templates
          sourceSection: 1,
          notarized: true
        },
        
        // Future Vision (Stage 2 version - s2_futureVision)
        // V12.0 FIX: Enhanced extraction from mindset transformation and hidden aspirations
        s2_futureVision: {
          value: firstItem(dc.mindsetTransformationChart, 'after') ||
                 firstItem(dc.mindsetTransformationChart, 'outcome') ||
                 firstItem(dc.hiddenAspirationsChart, 'aspiration') ||
                 projectData.futureVision ||
                 projectData.audienceDesired ||
                 extractFromReport(4, /vision[:\s]+([^.]+\.)/i) ||
                 '',  // V12.0: No fallback templates
          sourceSection: 4,
          notarized: true
        },
        
        // Primary Keyword - from Content Pillars (Section 6)
        // V12.0 FIX: Better extraction from multiple sources
        primaryKeyword: {
          value: firstItem(dc.strategicContentPillarsChart, 'pillarName') ||
                 firstItem(dc.strategicContentPillarsChart, 'name') ||
                 firstItem(dc.aeoAnalysisChart, 'keyword') ||
                 firstItem(structuredData?.contentPillars, 'name') ||
                 projectData.coreTopic?.split(',')[0]?.trim() ||
                 projectData.primaryKeyword || '',
          sourceSection: 6,
          notarized: true
        },
        
        // Secondary Keywords - from Content Pillars (Section 6)
        // V12.0 FIX: Enhanced extraction from clusters and supporting keywords
        secondaryKeywords: {
          value: collectKeywords([
            dc.strategicContentPillarsChart?.map(p => p.pillarName),
            dc.strategicContentPillarsChart?.map(p => p.keywords).flat(),
            dc.strategicContentPillarsChart?.flatMap(p => p.clusters?.map(c => c.clusterName)),
            structuredData?.contentPillars?.map(p => p.supportingKeywords).flat(),
            projectData.secondaryKeywords?.split(',')
          ]) || projectData.secondaryKeywords || '',
          sourceSection: 6,
          notarized: true
        },
        
        // Keywords & Entities - aggregated from Sections 3, 6, 9
        // V12.0 FIX: Enhanced entity extraction from AEO chart and competitive analysis
        keywordsEntities: {
          value: collectKeywords([
            dc.aeoAnalysisChart?.map(a => a.entity),
            dc.aeoAnalysisChart?.map(a => a.keyword),
            dc.strategicContentPillarsChart?.flatMap(p => p.clusters?.map(c => c.clusterName)),
            dc.competitiveAdvantageMapChart?.map(c => c.label),
            dc.competitiveAdvantageMapChart?.map(c => c.keyword),
            structuredData?.entities,
            structuredData?.contentPillars?.map(p => p.supportingKeywords).flat()
          ]) || '',
          sourceSection: [3, 6, 9],
          notarized: true
        }
      }
    };
    
    // V12.0: Log detailed extraction results for debugging
    const fieldCount = Object.keys(bridge.autoPopulation).length;
    const populatedFields = Object.entries(bridge.autoPopulation)
      .filter(([k, v]) => v.value && v.value.length > 0)
      .map(([k]) => k);
    
    Logger.log('🔗 Forensic Bridge extracted: ' + fieldCount + ' fields');
    Logger.log('   Populated: ' + populatedFields.join(', '));
    Logger.log('   Empty: ' + Object.keys(bridge.autoPopulation).filter(k => !populatedFields.includes(k)).join(', '));
    return bridge;
    
  } catch (error) {
    Logger.log('⚠️ Forensic Bridge extraction error: ' + error.toString());
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// V10.0 ELITE MODULAR INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Builds the elite-enhanced Stage 1 prompt using modular components.
 * This is the NEW recommended approach that uses:
 * - DB_ElitePromptInjection.gs for role personas and output mandates
 * - DB_VisualizationConfig.gs for chart specifications
 * - DB_SectionInsightTemplates.gs for section insight templates
 * - DB_EliteIntegration.gs for unified integration
 * 
 * @param {Object} data - Project data object
 * @returns {string} The complete elite-enhanced prompt
 */
function buildEliteEnhancedStage1Prompt(data) {
  try {
    // Check if elite modules are available
    if (typeof getEliteEnhancements !== 'function') {
      Logger.log('⚠️ Elite modules not loaded - falling back to standard prompt');
      return buildStage1Prompt(data);
    }
    
    // Get competitor data from project data
    const competitorData = data._competitorInsights || data.competitorAnalysis || {};
    
    // Get elite enhancements
    const elite = getEliteEnhancements(data, competitorData);
    
    // Start with elite protocol header
    let prompt = elite.protocolHeader;
    
    // Add role personas
    prompt += '\n\n' + elite.rolePersonas;
    
    // Add output quality mandates
    prompt += '\n\n' + elite.outputMandates;
    
    // Add visualization requirements summary
    prompt += `
═══════════════════════════════════════════════════════════════════════════════
📊 ELITE VISUALIZATION REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

Each section MUST include chart data following these specifications:
${JSON.stringify(elite.visualizationConfig, null, 2)}

`;
    
    // Inject section insight templates for each section
    for (let i = 1; i <= 14; i++) {
      const validation = elite.validateSection(i);
      const template = elite.getSectionTemplate(i);
      const chartSpecs = elite.getSectionCharts(i);
      
      prompt += `
═══════════════════════════════════════════════════════════════════════════════
SECTION ${i}: ${getSectionTitle(i).toUpperCase()}
Data Coverage: ${validation.coverage}%${validation.missing.length > 0 ? ' (Missing: ' + validation.missing.join(', ') + ')' : ''}
═══════════════════════════════════════════════════════════════════════════════

${template}

**CHART SPECIFICATIONS FOR SECTION ${i}:**
\`\`\`json
${JSON.stringify(chartSpecs, null, 2)}
\`\`\`

`;
    }
    
    // V7.22 FIX: Use correct dashboard JSON schema (not sectionInsights)
    // The buildJSONSchemaSection() outputs wrong format - use buildDashboardJSONSchema() instead
    prompt += '\n\n' + buildDashboardJSONSchema();
    
    // Include the standard prompt content for data context
    prompt += `

═══════════════════════════════════════════════════════════════════════════════
📋 PROJECT DATA CONTEXT
═══════════════════════════════════════════════════════════════════════════════

` + getProjectDataContext(data);
    
    // V12.0 TODO 7.2: Add competitor data to prompt context
    prompt += getCompetitorDataContext(competitorData);
    
    // V12.0 TODO 7.5: Add forensic bridge output requirements
    prompt += getForensicBridgeRequirements();

    // Add final instructions
    prompt += `

═══════════════════════════════════════════════════════════════════════════════
🎯 FINAL ELITE OUTPUT INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

**OUTPUT FORMAT:**
1. Start with a valid JSON block containing structured dashboard data
2. Follow with comprehensive markdown report for ALL 14 SECTIONS
3. EVERY section MUST include the 3 Strategic Intelligence Summary insights
4. EVERY insight MUST follow: Finding + Competitive Edge + Actionable Impact

**CRITICAL REMINDERS:**
- You are the collective intelligence of the TOP 0.1% of global strategists
- Every insight must justify a $50,000+ consulting fee
- Use ACTUAL competitor data - no generic advice
- Quantify everything - no vague language
- Complete ALL 14 sections - sections 13 and 14 are MANDATORY

**NOW GENERATE YOUR ELITE STRATEGIC INTELLIGENCE OUTPUT.**
`;
    
    Logger.log('✅ Elite-enhanced prompt built, length: ' + prompt.length + ' chars');
    return prompt;
    
  } catch (error) {
    Logger.log('❌ Error building elite prompt: ' + error.message + ', falling back to standard');
    return buildStage1Prompt(data);
  }
}

/**
 * Helper to extract project data context from data object
 * @param {Object} data - Project data object
 * @returns {string} Formatted project context
 */
function getProjectDataContext(data) {
  function getField(obj, fieldName) {
    if (!obj) return 'Not provided';
    const value = obj[fieldName];
    return (value && String(value).trim()) ? String(value).trim() : 'Not provided';
  }
  
  return `
**Brand Identity:**
- Brand Name: ${getField(data, 'brandName')}
- Brand Archetype: ${getField(data, 'brandArchetype')}
- Brand Ideology: ${getField(data, 'brandIdeology')}
- UVP: ${getField(data, 'uvp')}
- Core Topic: ${getField(data, 'coreTopic')}

**Target Audience:**
- Primary: ${getField(data, 'targetAudience')}
- Secondary: ${getField(data, 'secondaryAudience')}
- Industry: ${getField(data, 'industryVertical')}

**Customer Psychology:**
- Current Pains: ${getField(data, 'audiencePains')}
- Desired State: ${getField(data, 'audienceDesired')}
- Core Problem: ${getField(data, 'coreMarketProblem')}

**Competitive Context:**
- Key Competitors: ${getField(data, 'keyCompetitors')}
- Your Advantages: ${getField(data, 'competitiveAdvantages')}

**Business Objectives:**
- Quarterly Goal: ${getField(data, 'quarterlyObjective')}
- KPIs: ${getField(data, 'northStarKpis')}
- Content Goals: ${getField(data, 'contentGoals')}
- Future Vision: ${getField(data, 'futureVision')}

**Offers:**
- Primary: ${getField(data, 'primaryOfferName')} @ ${getField(data, 'primaryOfferPrice')}
- Upsell: ${getField(data, 'upsellOffer')} @ ${getField(data, 'upsellPrice')}

**Distribution:**
- Channels: ${getField(data, 'primaryChannels')}
- Content Formats: ${getField(data, 'contentFormats')}
- Seasonality: ${getField(data, 'seasonality')}
`;
}

/**
 * V12.0 TODO 7.2: Build competitor data context for prompt
 * Injects actual competitor metrics into the prompt
 * @param {Object} competitorData - Competitor insights data
 * @returns {string} Formatted competitor context
 */
function getCompetitorDataContext(competitorData) {
  if (!competitorData || !competitorData.hasData) {
    return `
═══════════════════════════════════════════════════════════════════════════════
🏢 COMPETITOR INTELLIGENCE DATA
═══════════════════════════════════════════════════════════════════════════════

⚠️ No competitor analysis data available. Generate insights based on:
- Industry benchmarks for the specified vertical
- Typical competitive patterns in this market segment
- Standard SEO performance expectations

`;
  }
  
  let context = `
═══════════════════════════════════════════════════════════════════════════════
🏢 COMPETITOR INTELLIGENCE DATA — REAL METRICS
═══════════════════════════════════════════════════════════════════════════════

**Competitors Analyzed:** ${competitorData.competitorCount || 0}
**Analysis Date:** ${competitorData.timestamp || 'Unknown'}

`;

  // Add market averages
  if (competitorData.marketAverages) {
    const avg = competitorData.marketAverages;
    context += `
**MARKET AVERAGES:**
- Domain Authority: ${avg.domainAuthority || 'N/A'}
- Estimated Traffic: ${(avg.traffic || 0).toLocaleString()}/mo
- Keyword Count: ${(avg.keywords || 0).toLocaleString()}
- Backlinks: ${(avg.backlinks || 0).toLocaleString()}
- Page Speed: ${avg.pageSpeed || 'N/A'}ms

`;
  }

  // Add individual competitor data
  if (competitorData.competitors && Array.isArray(competitorData.competitors)) {
    context += `**COMPETITOR BREAKDOWN:**\n`;
    
    competitorData.competitors.slice(0, 10).forEach((comp, i) => {
      const metrics = comp.metrics || comp;
      context += `
${i + 1}. **${comp.domain || comp.url || 'Competitor ' + (i + 1)}**
   - Authority: ${metrics.authority || metrics.domainAuthority || 'N/A'}
   - Traffic: ${(metrics.traffic || metrics.organicTraffic || 0).toLocaleString()}/mo
   - Keywords: ${(metrics.keywords || metrics.organicKeywords || 0).toLocaleString()}
   - Backlinks: ${(metrics.backlinks || 0).toLocaleString()}
   - Top Keywords: ${(metrics.topKeywords || []).slice(0, 5).join(', ') || 'N/A'}
`;
    });
  }

  // Add forensic intelligence if available
  if (competitorData.forensicIntelligence) {
    const fi = competitorData.forensicIntelligence;
    context += `
**FORENSIC INTELLIGENCE:**
- AEO Readiness: ${fi.aeoReadiness || 'N/A'}
- Citation Potential: ${fi.citationPotential || 'N/A'}
- Brittleness Risk: ${fi.brittlenessRisk || 'N/A'}
- Asset Valuation: ${fi.assetValuation || 'N/A'}
`;
  }

  // Add Gemini insights if previously generated
  if (competitorData.geminiInsights) {
    context += `
**PREVIOUS AI ANALYSIS SUMMARY:**
${competitorData.geminiInsights.summary || 'N/A'}
`;
  }

  context += `
CRITICAL: Use THESE EXACT metrics in your analysis. Do NOT fabricate competitor data.
Reference competitors by their actual domain names.

`;

  return context;
}

/**
 * V12.0 TODO 7.5: Forensic Bridge Output Requirements
 * Explicitly requests all 10 Stage 2 fields in response
 * @returns {string} Forensic bridge requirements
 */
function getForensicBridgeRequirements() {
  return `
═══════════════════════════════════════════════════════════════════════════════
🔗 FORENSIC BRIDGE — STAGE 2 AUTO-POPULATION REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

Your JSON response MUST include a "forensicBridge" object to auto-populate Stage 2 fields.
This eliminates manual data re-entry and ensures strategic continuity.

\`\`\`json
{
  "forensicBridge": {
    "primaryKeywords": ["keyword1", "keyword2", "keyword3"],
    "topicClusters": [
      {"cluster": "Topic Cluster Name", "keywords": ["kw1", "kw2", "kw3"]}
    ],
    "contentGaps": ["Gap 1", "Gap 2", "Gap 3"],
    "competitorWeaknesses": ["Weakness 1", "Weakness 2"],
    "strategicOpportunities": ["Opportunity 1", "Opportunity 2"],
    "recommendedFormats": ["Blog Post", "Video", "Infographic"],
    "targetAudienceRefinement": "Refined audience description based on analysis",
    "valuePropositionEnhancements": ["Enhancement 1", "Enhancement 2"],
    "brandVoiceGuidelines": "Recommended tone and style based on competitor gap",
    "priorityActions": [
      {"action": "Action 1", "priority": "high", "timeline": "2 weeks"},
      {"action": "Action 2", "priority": "medium", "timeline": "1 month"}
    ],
    "stage2Recommendations": {
      "contentPillar1": "Recommended pillar topic based on gaps",
      "contentPillar2": "Second pillar recommendation",
      "contentPillar3": "Third pillar recommendation",
      "keywordFocus": "Primary keyword focus for Stage 2",
      "competitiveAngle": "Differentiation strategy for content"
    }
  }
}
\`\`\`

CRITICAL: The forensicBridge data will automatically populate Stage 2 form fields.
Ensure all 10 field categories are populated with specific, actionable data.

`;
}

/**
 * V7.22: Build the correct dashboard JSON schema for Gemini output
 * This MUST match what parseStage1Response() expects: dashboardCharts structure
 * NOT the sectionInsights format from buildJSONSchemaSection()
 * 
 * @returns {string} The JSON schema instruction block
 */
function buildDashboardJSONSchema() {
  return `
═══════════════════════════════════════════════════════════════════════════════
📊 REQUIRED JSON OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

Your response MUST start with a JSON code block containing this EXACT structure.
This JSON powers all dashboard visualizations and charts.

\`\`\`json
{
  "dashboardCharts": {
    "heroMetrics": {
      "citeabilityCoefficient": 0.0-1.0,
      "janitorRatio": 0-100,
      "moatAdjustedValuation": 0
    },
    "customerFrustrationsChart": [
      {"label": "Frustration", "intensity": 1-10, "segment": "Audience", "shortDescription": "Detail"}
    ],
    "hiddenAspirationsChart": [
      {"label": "Aspiration", "intensity": 1-10, "segment": "Audience", "shortDescription": "Detail"}
    ],
    "mindsetTransformationChart": [
      {"fromBelief": "Old belief", "toBelief": "New belief", "importance": 1-10, "segment": "Audience"}
    ],
    "customerJobPriorityChart": [
      {"jobTitle": "JTBD", "urgency": 1-10, "importance": 1-10, "frequency": 1-10, "segment": "Audience", "outcome": "Result"}
    ],
    "competitiveAdvantageMapChart": [
      {"dimension": "Dimension", "yourBrand": 1-10, "competitor1": 1-10, "competitor2": 1-10, "marketAverage": 1-10, "explanation": "Why"}
    ],
    "contentFormatStrategyChart": [
      {"format": "Format", "fitScore": 1-10, "competitiveGap": 1-10, "audienceDemand": 1-10, "feasibility": 1-10, "priority": 1-3}
    ],
    "brandPositioningChart": [
      {"axis": "Spectrum", "position": 1-10, "marketPosition": 1-10, "note": "Meaning"}
    ],
    "valuePropositionMixChart": [
      {"proposition": "Value prop", "appeal": 1-10, "differentiation": 1-10, "credibility": 1-10, "clarity": 1-10}
    ],
    "strategicContentPillarsChart": [
      {"pillar": "Name", "audienceFit": 1-10, "competitiveGap": 1-10, "businessImpact": 1-10, "feasibility": 1-10, "priority": 1-3}
    ],
    "priorityFocusMatrixChart": [
      {"initiative": "Action", "impact": 1-10, "effort": 1-10, "speed": 1-10, "priority": 1-3, "timeline": "Days/weeks"}
    ],
    "marketOpportunityAnalysisChart": [
      {"opportunity": "Gap", "marketSize": 1-10, "competitionLevel": 1-10, "timingSensitivity": 1-10, "fitScore": 1-10, "priority": 1-3}
    ],
    "blueOceanOpportunitiesChart": [
      {"opportunity": "Blue ocean area", "valueInnovation": 1-10, "competitorBlindSpot": true/false, "timeToCapture": "Months", "errcAction": "Eliminate/Reduce/Raise/Create", "estimatedImpact": "Impact description"}
    ],
    "competitorKillMovesChart": [
      {"killMove": "Action", "targetCompetitor": "Domain", "competitorWeakness": "Weakness", "yourAdvantage": "Why you win", "impactLevel": 1-10, "executionDifficulty": 1-10, "timeframe": "Timeline"}
    ],
    "aeoAnalysisChart": [
      {"competitor": "Domain", "citeabilityScore": 0.0-1.0, "citationTier": "HIGH/MEDIUM/LOW", "entityDensity": 0.0-1.0, "schemaCoverage": 0.0-1.0}
    ],
    "assetValuationChart": [
      {"competitor": "Domain", "organicTrustValue": "$X", "valuationTier": "TIER", "moatMultiplier": 1.0-3.0}
    ],
    "brittlenessRiskChart": [
      {"competitor": "Domain", "brittlenessScore": 0-100, "riskLevel": "HIGH/MODERATE/STABLE", "topRiskFactor1": "Risk"}
    ],
    "informationBlackHolesChart": [
      {"topic": "Unaddressed topic", "opportunityScore": 1-10, "competitorCoverage": "None/Superficial", "aiCitationPotential": "HIGH/MEDIUM/LOW"}
    ]
  },
  "jtbdScenarios": [
    {"id": "JTBD_1", "title": "Job title", "whenSituation": "Trigger", "helpMeDo": "Action", "soICan": "Outcome", "segment": "Audience", "priority": 1-5, "painIntensity": 1-10},
    {"id": "JTBD_2", "title": "...", "priority": 2, "...": "..."},
    {"id": "JTBD_3", "title": "...", "priority": 3, "...": "..."},
    {"id": "JTBD_4", "title": "...", "priority": 4, "...": "..."},
    {"id": "JTBD_5", "title": "...", "priority": 5, "...": "..."}
  ],
  "contentPillars": [
    {"name": "Pillar 1 Name", "description": "Coverage", "strategicRationale": ["Reason 1", "Reason 2"], "primaryFormats": ["Format 1"], "businessAlignment": "Goal", "competitiveDifferentiation": "Why unique", "clusters": [
      {"name": "Awareness Cluster", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "funnelStage": "awareness"},
      {"name": "Consideration Cluster", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "funnelStage": "consideration"},
      {"name": "Decision Cluster", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "funnelStage": "decision"},
      {"name": "Retention Cluster", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "funnelStage": "retention"},
      {"name": "Advocacy Cluster", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "funnelStage": "advocacy"}
    ]},
    {"name": "Pillar 2 Name", "description": "...", "clusters": ["... 5 clusters with 5+ keywords each ..."]},
    {"name": "Pillar 3 Name", "description": "...", "clusters": ["... 5 clusters with 5+ keywords each ..."]},
    {"name": "Pillar 4 Name", "description": "...", "clusters": ["... 5 clusters with 5+ keywords each ..."]},
    {"name": "Pillar 5 Name", "description": "...", "clusters": ["... 5 clusters with 5+ keywords each ..."]},
    {"name": "Pillar 6 Name", "description": "...", "clusters": ["... 5 clusters with 5+ keywords each ..."]}
  ],
  "competitiveGaps": {
    "topicGap": "Topics missed", "angleVoiceGap": "Voice difference", "formatGap": "Format opportunity", "audienceGap": "Underserved", "outcomeGap": "Undelivered outcomes"
  },
  "uniqueMechanism": {
    "name": "Framework name", "tagline": "One-liner", "oneParagraphDefinition": "Explanation", "keyPromises": ["Promise 1", "Promise 2", "Promise 3"]
  },
  "audienceProfile": {
    "emotionalPains": ["Pain 1", "Pain 2"], "hiddenDesires": ["Desire 1", "Desire 2"], "limitingBeliefs": ["Belief 1"], "empoweringBeliefs": ["Belief 1"]
  },
  "strategicIntelligence": {
    "the10xOpportunity": {"title": "10x opportunity", "description": "Details", "whyNow": "Timing", "executionPath": "Steps"},
    "competitorBlindSpots": [{"blindSpot": "What they miss", "evidence": "Data", "exploitStrategy": "How to win"}],
    "defensibleMoats": [{"moatType": "Type", "currentStrength": 1-10, "buildingStrategy": "How to build"}]
  }
}
\`\`\`

CRITICAL REQUIREMENTS:
1. Populate ALL arrays with 3-7 items based on ACTUAL analysis. No empty arrays.
2. contentPillars MUST have EXACTLY 6 pillars (minimum), each with 5 clusters and 5+ keywords per cluster.
3. jtbdScenarios MUST have EXACTLY 5 scenarios.
4. Each chart array (customerFrustrationsChart, etc.) MUST have 4-6 items.
5. heroMetrics MUST have realistic calculated values based on the analysis.
`;
}

/**
 * Test function to verify elite modules are loaded correctly
 */
function testEliteModulesLoaded() {
  const modules = {
    getElitePromptInjection: typeof getElitePromptInjection === 'function',
    getRolePersonas: typeof getRolePersonas === 'function',
    getOutputQualityMandates: typeof getOutputQualityMandates === 'function',
    getVisualizationConfig: typeof getVisualizationConfig === 'function',
    getChartSpecsForSection: typeof getChartSpecsForSection === 'function',
    getSectionInsightTemplate: typeof getSectionInsightTemplate === 'function',
    getEliteEnhancements: typeof getEliteEnhancements === 'function',
    buildEliteEnhancedPrompt: typeof buildEliteEnhancedPrompt === 'function'
  };
  
  Logger.log('═══ ELITE MODULE STATUS ═══');
  let allLoaded = true;
  for (const [name, loaded] of Object.entries(modules)) {
    Logger.log((loaded ? '✅' : '❌') + ' ' + name + ': ' + (loaded ? 'LOADED' : 'NOT FOUND'));
    if (!loaded) allLoaded = false;
  }
  Logger.log('═══════════════════════════');
  Logger.log(allLoaded ? '✅ All elite modules loaded successfully!' : '⚠️ Some elite modules missing');
  
  return { allLoaded, modules };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * V7 SHREDDED PAYLOAD: Fetch competitor data directly from MySQL
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * This function is called when the UI sets _fetchCompetitorDataFromMySQL=true
 * It retrieves the saved competitor analysis from MySQL, bypassing the browser entirely.
 * This prevents HTTP 400 errors from 5.3MB+ payloads.
 * 
 * @param {string} projectId - The project identifier
 * @returns {object} { success, data, competitorCount } or { success: false, reason }
 */
function fetchCompetitorDataFromMySQL(projectId) {
  try {
    Logger.log('📡 [SHREDDED] Fetching competitor data from MySQL for: ' + projectId);
    
    if (!projectId) {
      return { success: false, reason: 'No project ID provided' };
    }
    
    // Use existing loadCompetitorResults function (from DB_CompetitorStorage.gs)
    if (typeof loadCompetitorResults === 'function') {
      const result = loadCompetitorResults(projectId);
      
      if (result && result.success && result.data) {
        const competitorCount = result.data.competitorsArray?.length || 
                                Object.keys(result.data.rawData || {}).length || 0;
        
        Logger.log('✅ [SHREDDED] Loaded ' + competitorCount + ' competitors from ' + (result.source || 'MySQL'));
        
        return {
          success: true,
          source: result.source || 'mysql',
          data: result.data,
          competitorCount: competitorCount,
          timestamp: result.data.timestamp || new Date().toISOString()
        };
      }
      
      return { 
        success: false, 
        reason: result.error || 'No competitor data found' 
      };
    }
    
    // Fallback: Call gateway directly if loadCompetitorResults not available
    if (typeof callGateway === 'function') {
      Logger.log('📡 [SHREDDED] Using direct gateway call...');
      const mysqlResult = callGateway('comp:load_results', {
        projectId: projectId
      });
      
      if (mysqlResult && mysqlResult.success && mysqlResult.data) {
        const data = typeof mysqlResult.data === 'string' ? 
                     JSON.parse(mysqlResult.data) : mysqlResult.data;
        
        const competitorCount = data.competitorsArray?.length || 
                                Object.keys(data.rawData || {}).length || 0;
        
        Logger.log('✅ [SHREDDED] Loaded ' + competitorCount + ' competitors via gateway');
        
        return {
          success: true,
          source: 'mysql-gateway',
          data: data,
          competitorCount: competitorCount
        };
      }
    }
    
    return { success: false, reason: 'No data loader available' };
    
  } catch (error) {
    Logger.log('❌ [SHREDDED] Error fetching competitor data: ' + error.toString());
    return { success: false, reason: error.toString() };
  }
}

/**
 * V9.0: Load and summarize competitor analysis for workflow prompts
 * V9.1: COMPREHENSIVE - Includes ALL data for full strategic analysis
 * Extracts key insights from saved competitor data
 */
function loadCompetitorInsightsForWorkflow(projectData) {
  try {
    const projectId = projectData.projectId || projectData.brandName;
    if (!projectId) {
      return { hasData: false, reason: 'No project ID' };
    }
    
    Logger.log('📂 Loading COMPREHENSIVE competitor insights for project: ' + projectId);
    
    // Try to load saved competitor results
    const savedResults = loadCompetitorResults(projectId);
    
    if (!savedResults || !savedResults.success || !savedResults.data) {
      return { hasData: false, reason: 'No saved competitor analysis' };
    }
    
    const data = savedResults.data;
    const competitors = data.competitorsArray || [];
    
    if (competitors.length === 0) {
      return { hasData: false, reason: 'No competitors in saved data' };
    }
    
    // Extract COMPREHENSIVE insights for the prompt
    const insights = {
      hasData: true,
      competitorCount: competitors.length,
      analysisTimestamp: data.timestamp,
      
      // Competitor overview
      competitorDomains: competitors.map(c => c.domain).filter(Boolean),
      
      // Authority & Traffic metrics
      // v28.6: API returns pageRank/domainRank (camelCase), fallback to old names
      authorityMetrics: competitors.map(c => {
        const opr = c.apiData?.openPageRank || {};
        return {
          domain: c.domain,
          authorityScore: c.processedMetrics?.authorityScore || (opr.pageRank ?? opr.page_rank_decimal ?? opr.rank ?? 0) * 10 || 0,
          pageRank: c.processedMetrics?.pageRank || opr.pageRank || opr.page_rank_decimal || opr.rank || 0,
          estimatedTraffic: c.processedMetrics?.organicTraffic || c.processedMetrics?.estimatedTraffic || 0,
          organicKeywords: c.processedMetrics?.organicKeywords || 0,
          backlinks: c.processedMetrics?.backlinks || 0,
          referringDomains: c.processedMetrics?.referringDomains || 0
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // TOP PAGES - Best performing pages per competitor
      // ═══════════════════════════════════════════════════════════════════
      topPages: competitors.map(c => {
        const pages = c.synthesized?.topPages || c.snapshot?.topPages || c.apiData?.serper?.organic || [];
        return {
          domain: c.domain,
          pages: pages.slice(0, 10).map(p => ({
            url: p.url || p.link || '',
            title: p.title || '',
            position: p.position || 0,
            trafficShare: p.trafficShare || p.traffic || 0,
            snippet: p.snippet || ''
          }))
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // BACKLINKS DATA - Link profile analysis
      // ═══════════════════════════════════════════════════════════════════
      backlinkProfiles: competitors.map(c => {
        const bl = c.backlinkData || {};
        return {
          domain: c.domain,
          totalBacklinks: c.processedMetrics?.backlinks || bl.backlinkCount || 0,
          referringDomains: c.processedMetrics?.referringDomains || bl.referringDomainCount || 0,
          topReferrers: (bl.topReferringDomains || []).slice(0, 5).map(r => ({
            domain: r.domain || r,
            dr: r.domainRating || r.dr || 0,
            links: r.linkCount || 1
          })),
          linkTypes: bl.linkTypes || { dofollow: 0, nofollow: 0 }
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // KEYWORD DATA - Keywords and gaps
      // ═══════════════════════════════════════════════════════════════════
      keywordProfiles: competitors.map(c => {
        const kw = c.keywordProfile || {};
        const synth = c.synthesized?.seo || {};
        return {
          domain: c.domain,
          totalKeywords: c.processedMetrics?.organicKeywords || kw.keywordCount || 0,
          topKeywords: (kw.topKeywords || synth.topKeywords || []).slice(0, 10).map(k => 
            typeof k === 'string' ? { keyword: k, position: 0, volume: 0 } : k
          ),
          brandedKeywords: kw.brandedKeywords || [],
          longTailKeywords: (kw.longTailKeywords || []).slice(0, 5),
          featuredSnippets: kw.featuredSnippets || synth.featuredSnippets || 0,
          peopleAlsoAsk: (synth.peopleAlsoAsk || kw.peopleAlsoAsk || []).slice(0, 5),
          relatedSearches: (synth.relatedSearches || kw.relatedSearches || []).slice(0, 5)
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // TECHNICAL / PAGESPEED INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      technicalScores: competitors.map(c => {
        const ps = c.apiData?.pageSpeed || c.stages?.pageSpeed?.data || {};
        const scores = ps.scores || {};
        const cwv = ps.core_web_vitals || {};
        return {
          domain: c.domain,
          seoScore: scores.seo || c.processedMetrics?.seoScore || 0,
          performanceScore: scores.performance || c.processedMetrics?.performanceScore || 0,
          accessibilityScore: scores.accessibility || c.processedMetrics?.accessibilityScore || 0,
          bestPracticesScore: scores.best_practices || c.processedMetrics?.bestPracticesScore || 0,
          coreWebVitals: {
            lcp: cwv.lcp || cwv.LCP || 'N/A',
            fid: cwv.fid || cwv.FID || 'N/A',
            cls: cwv.cls || cwv.CLS || 'N/A',
            fcp: cwv.fcp || cwv.FCP || 'N/A',
            ttfb: cwv.ttfb || cwv.TTFB || 'N/A'
          },
          loadTime: ps.loadTime || 'N/A',
          mobileUsability: ps.strategy || 'mobile'
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // CONTENT INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      contentInsights: competitors.map(c => {
        const synth = c.synthesized || {};
        const snapshot = c.snapshot || {};
        return {
          domain: c.domain,
          wordCount: synth.content?.wordCount || snapshot.metadata?.wordCount || 0,
          headingCount: synth.content?.headingCount || 0,
          h1: snapshot.metadata?.h1 || '',
          h2Count: (snapshot.metadata?.h2 || []).length,
          internalLinks: (synth.content?.internalLinks || snapshot.links?.internal || []).length,
          externalLinks: (synth.content?.externalLinks || snapshot.links?.external || []).length,
          hasSchema: snapshot.schema?.hasOrganizationSchema || false,
          schemaTypes: snapshot.schema?.types || [],
          techStack: synth.technical?.techStack?.join(', ') || ''
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // GEMINI ANALYSIS INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      geminiInsights: {
        executiveBrief: data.geminiAnalysis?.executiveBrief?.threeLineSummary || 
                       data.geminiAnalysis?.executiveBrief?.landscapeOverview || '',
        clientPosition: data.geminiAnalysis?.executiveBrief?.clientPosition || '',
        killMoves: (data.geminiAnalysis?.killMoves || []).slice(0, 5).map(k => ({
          title: k.title || k,
          description: k.description || k.rationale || '',
          impact: k.impact || 'High'
        })),
        competitorRankings: (data.geminiAnalysis?.competitorRankings || []).slice(0, 6),
        keyOpportunities: (data.geminiAnalysis?.opportunities || data.geminiAnalysis?.keyOpportunities || []).slice(0, 5),
        contentGaps: data.geminiAnalysis?.contentGaps || data.geminiAnalysis?.gaps?.content || [],
        keywordGaps: data.geminiAnalysis?.keywordGaps || data.geminiAnalysis?.gaps?.keywords || [],
        backlinkGaps: data.geminiAnalysis?.backlinkGaps || data.geminiAnalysis?.gaps?.backlinks || []
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // ELITE TAB INTELLIGENCE (if available)
      // ═══════════════════════════════════════════════════════════════════
      eliteIntel: data.eliteTabIntelligence ? {
        keywordStrategy: data.eliteTabIntelligence.keywordStrategy || null,
        contentIntel: data.eliteTabIntelligence.contentIntel || null,
        marketIntel: data.eliteTabIntelligence.marketIntelligence || null,
        opportunities: data.eliteTabIntelligence.opportunities || null,
        geoAeo: data.eliteTabIntelligence.geoAeo || null,
        authority: data.eliteTabIntelligence.authority || null
      } : null,
      
      // ═══════════════════════════════════════════════════════════════════
      // V7.1 FORENSIC INTELLIGENCE: AEO Citation Matrix, Asset Valuation, Brittleness
      // ═══════════════════════════════════════════════════════════════════
      forensicIntelligence: calculateForensicIntelligence(competitors)
    };
    
    // Calculate market averages
    const avgAuthority = insights.authorityMetrics.reduce((sum, c) => sum + c.authorityScore, 0) / competitors.length;
    const avgTraffic = insights.authorityMetrics.reduce((sum, c) => sum + c.estimatedTraffic, 0) / competitors.length;
    const avgSEO = insights.technicalScores.reduce((sum, c) => sum + c.seoScore, 0) / competitors.length;
    const avgPerf = insights.technicalScores.reduce((sum, c) => sum + c.performanceScore, 0) / competitors.length;
    const avgBacklinks = insights.authorityMetrics.reduce((sum, c) => sum + c.backlinks, 0) / competitors.length;
    const avgKeywords = insights.authorityMetrics.reduce((sum, c) => sum + c.organicKeywords, 0) / competitors.length;
    
    insights.marketAverages = {
      authority: Math.round(avgAuthority),
      traffic: Math.round(avgTraffic),
      seoScore: Math.round(avgSEO),
      performanceScore: Math.round(avgPerf),
      backlinks: Math.round(avgBacklinks),
      keywords: Math.round(avgKeywords)
    };
    
    // Find top performers
    const sortedByAuthority = [...insights.authorityMetrics].sort((a, b) => b.authorityScore - a.authorityScore);
    const sortedByTraffic = [...insights.authorityMetrics].sort((a, b) => b.estimatedTraffic - a.estimatedTraffic);
    const sortedBySEO = [...insights.technicalScores].sort((a, b) => b.seoScore - a.seoScore);
    
    insights.topCompetitor = sortedByAuthority[0]?.domain || competitors[0]?.domain;
    insights.topByTraffic = sortedByTraffic[0]?.domain;
    insights.topBySEO = sortedBySEO[0]?.domain;
    
    Logger.log('✅ COMPREHENSIVE competitor insights extracted successfully');
    Logger.log('   - Authority metrics: ' + insights.authorityMetrics.length);
    Logger.log('   - Top pages: ' + insights.topPages.reduce((s, c) => s + c.pages.length, 0) + ' total');
    Logger.log('   - Backlink profiles: ' + insights.backlinkProfiles.length);
    Logger.log('   - Keyword profiles: ' + insights.keywordProfiles.length);
    Logger.log('   - Technical scores: ' + insights.technicalScores.length);
    
    return insights;
    
  } catch (error) {
    Logger.log('⚠️ Error loading competitor insights: ' + error.toString());
    return { hasData: false, reason: error.toString() };
  }
}

/**
 * V9.1: Build COMPREHENSIVE competitor insights section for the Stage 1 prompt
 * Includes: Authority, Top Pages, Backlinks, Keywords, Gaps, PageSpeed, Opportunities
 * All data is dynamically loaded from the saved competitor analysis
 */
function buildCompetitorInsightsSection(insights) {
  if (!insights || !insights.hasData) {
    return '**📊 COMPETITOR INTELLIGENCE:** No competitor data is currently available for this project. When competitor analysis data exists, this section will display comparative insights, authority metrics, and strategic opportunities automatically.';
  }
  
  let section = `
### ═══════════════════════════════════════════════════════════════════════════
### 📊 COMPREHENSIVE COMPETITOR INTELLIGENCE DATA (From Serpifai Analysis)
### ═══════════════════════════════════════════════════════════════════════════
**Analysis Date:** ${insights.analysisTimestamp || 'Recent'}
**Competitors Analyzed:** ${insights.competitorCount} (${insights.competitorDomains.join(', ')})
**Top Competitor by Authority:** ${insights.topCompetitor || 'Unknown'}
**Top by Traffic:** ${insights.topByTraffic || 'Unknown'} | **Top by SEO:** ${insights.topBySEO || 'Unknown'}

---

#### 1️⃣ AUTHORITY & TRAFFIC METRICS (Per Competitor)
`;

  // Authority metrics table
  if (insights.authorityMetrics && insights.authorityMetrics.length > 0) {
    section += `| Domain | Authority | PageRank | Est. Traffic | Keywords | Backlinks | Ref. Domains |\n`;
    section += `|--------|-----------|----------|--------------|----------|-----------|---------------|\n`;
    insights.authorityMetrics.forEach(c => {
      section += `| ${c.domain} | ${c.authorityScore}/100 | ${(c.pageRank || 0).toFixed(1)} | ${formatTrafficNumber(c.estimatedTraffic)} | ${formatTrafficNumber(c.organicKeywords)} | ${formatTrafficNumber(c.backlinks)} | ${formatTrafficNumber(c.referringDomains)} |\n`;
    });
  }
  
  section += `
**Market Benchmarks:** Avg Authority: ${insights.marketAverages?.authority || 0}/100 | Avg Traffic: ${formatTrafficNumber(insights.marketAverages?.traffic || 0)} | Avg Keywords: ${formatTrafficNumber(insights.marketAverages?.keywords || 0)} | Avg Backlinks: ${formatTrafficNumber(insights.marketAverages?.backlinks || 0)}

---

#### 2️⃣ TOP PAGES BY COMPETITOR (Best Performing Content)
`;

  // Top pages per competitor
  if (insights.topPages && insights.topPages.length > 0) {
    insights.topPages.forEach(comp => {
      if (comp.pages && comp.pages.length > 0) {
        section += `\n**${comp.domain}** (Top ${Math.min(5, comp.pages.length)} pages):\n`;
        comp.pages.slice(0, 5).forEach((page, i) => {
          const title = page.title ? page.title.substring(0, 60) : 'Untitled';
          section += `  ${i + 1}. "${title}" - ${page.url ? page.url.substring(0, 50) : 'URL N/A'}${page.position ? ` (Pos #${page.position})` : ''}\n`;
        });
      }
    });
  }
  
  section += `
---

#### 3️⃣ BACKLINK PROFILES & LINK GAPS
`;

  // Backlink profiles
  if (insights.backlinkProfiles && insights.backlinkProfiles.length > 0) {
    insights.backlinkProfiles.forEach(comp => {
      section += `\n**${comp.domain}:** ${formatTrafficNumber(comp.totalBacklinks)} backlinks from ${formatTrafficNumber(comp.referringDomains)} referring domains\n`;
      if (comp.topReferrers && comp.topReferrers.length > 0) {
        section += `  Top Referrers: `;
        section += comp.topReferrers.slice(0, 3).map(r => `${r.domain} (DR ${r.dr})`).join(', ');
        section += `\n`;
      }
    });
  }
  
  // Backlink gaps from Gemini analysis
  if (insights.geminiInsights?.backlinkGaps && insights.geminiInsights.backlinkGaps.length > 0) {
    section += `\n**🔗 BACKLINK GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.backlinkGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.domain || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 4️⃣ KEYWORD INTELLIGENCE & GAPS
`;

  // Keyword profiles
  if (insights.keywordProfiles && insights.keywordProfiles.length > 0) {
    insights.keywordProfiles.forEach(comp => {
      section += `\n**${comp.domain}:** ${formatTrafficNumber(comp.totalKeywords)} organic keywords\n`;
      if (comp.topKeywords && comp.topKeywords.length > 0) {
        section += `  Top Keywords: `;
        section += comp.topKeywords.slice(0, 5).map(k => 
          typeof k === 'string' ? k : (k.keyword || k.term || 'N/A')
        ).join(', ');
        section += `\n`;
      }
      if (comp.featuredSnippets > 0) {
        section += `  Featured Snippets: ${comp.featuredSnippets}\n`;
      }
      if (comp.peopleAlsoAsk && comp.peopleAlsoAsk.length > 0) {
        section += `  PAA Questions: ${comp.peopleAlsoAsk.slice(0, 3).join('; ')}\n`;
      }
    });
  }
  
  // Keyword gaps from Gemini analysis
  if (insights.geminiInsights?.keywordGaps && insights.geminiInsights.keywordGaps.length > 0) {
    section += `\n**🎯 KEYWORD GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.keywordGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.keyword || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 5️⃣ PAGESPEED & TECHNICAL PERFORMANCE
`;

  // Technical scores table
  if (insights.technicalScores && insights.technicalScores.length > 0) {
    section += `| Domain | SEO Score | Performance | Accessibility | Best Practices | LCP | CLS |\n`;
    section += `|--------|-----------|-------------|---------------|----------------|-----|-----|\n`;
    insights.technicalScores.forEach(c => {
      const cwv = c.coreWebVitals || {};
      section += `| ${c.domain} | ${c.seoScore}/100 | ${c.performanceScore}/100 | ${c.accessibilityScore}/100 | ${c.bestPracticesScore}/100 | ${cwv.lcp || 'N/A'} | ${cwv.cls || 'N/A'} |\n`;
    });
    
    section += `\n**Performance Benchmarks:** Avg SEO: ${insights.marketAverages?.seoScore || 0}/100 | Avg Performance: ${insights.marketAverages?.performanceScore || 0}/100\n`;
  }
  
  section += `
---

#### 6️⃣ CONTENT STRUCTURE & INSIGHTS
`;

  // Content insights
  if (insights.contentInsights && insights.contentInsights.length > 0) {
    insights.contentInsights.forEach(comp => {
      section += `\n**${comp.domain}:**\n`;
      section += `  Word Count: ${formatTrafficNumber(comp.wordCount)} | Headings: ${comp.headingCount} | H1: "${(comp.h1 || 'N/A').substring(0, 50)}"\n`;
      section += `  Internal Links: ${comp.internalLinks} | External Links: ${comp.externalLinks}\n`;
      if (comp.schemaTypes && comp.schemaTypes.length > 0) {
        section += `  Schema Types: ${comp.schemaTypes.slice(0, 5).join(', ')}\n`;
      }
      if (comp.techStack) {
        section += `  Tech Stack: ${comp.techStack}\n`;
      }
    });
  }
  
  // Content gaps from Gemini analysis
  if (insights.geminiInsights?.contentGaps && insights.geminiInsights.contentGaps.length > 0) {
    section += `\n**📝 CONTENT GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.contentGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.topic || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 7️⃣ STRATEGIC OPPORTUNITIES & KILL MOVES
`;

  // Gemini insights
  if (insights.geminiInsights) {
    if (insights.geminiInsights.executiveBrief) {
      section += `\n**AI Executive Summary:**\n${insights.geminiInsights.executiveBrief}\n`;
    }
    
    if (insights.geminiInsights.clientPosition) {
      section += `\n**Your Competitive Position:**\n${insights.geminiInsights.clientPosition}\n`;
    }
    
    if (insights.geminiInsights.killMoves && insights.geminiInsights.killMoves.length > 0) {
      section += `\n**🎯 STRATEGIC KILL MOVES (High-Impact Opportunities):**\n`;
      insights.geminiInsights.killMoves.forEach((move, i) => {
        if (typeof move === 'object') {
          section += `  ${i + 1}. **${move.title}** (${move.impact} Impact)\n`;
          if (move.description) {
            section += `     ${move.description.substring(0, 150)}\n`;
          }
        } else {
          section += `  ${i + 1}. ${move}\n`;
        }
      });
    }
    
    if (insights.geminiInsights.keyOpportunities && insights.geminiInsights.keyOpportunities.length > 0) {
      section += `\n**💡 KEY OPPORTUNITIES:**\n`;
      insights.geminiInsights.keyOpportunities.forEach((opp, i) => {
        const oppText = typeof opp === 'string' ? opp : (opp.title || opp.opportunity || JSON.stringify(opp));
        section += `  ${i + 1}. ${oppText}\n`;
      });
    }
    
    if (insights.geminiInsights.competitorRankings && insights.geminiInsights.competitorRankings.length > 0) {
      section += `\n**Competitor Rankings:**\n`;
      insights.geminiInsights.competitorRankings.forEach((r, i) => {
        const domain = typeof r === 'string' ? r : (r.domain || r.competitor || 'Unknown');
        const score = typeof r === 'object' ? (r.score || r.overallScore || '') : '';
        section += `  ${i + 1}. ${domain}${score ? ` (Score: ${score})` : ''}\n`;
      });
    }
  }
  
  section += `
---

#### 8️⃣ ELITE INTELLIGENCE SUMMARY
`;

  // Elite Tab Intel summary
  if (insights.eliteIntel) {
    if (insights.eliteIntel.keywordStrategy) {
      const ks = insights.eliteIntel.keywordStrategy;
      section += `\n**Keyword Strategy Intel:**\n`;
      if (ks.primaryKeywords) section += `  Primary Keywords: ${JSON.stringify(ks.primaryKeywords).substring(0, 200)}\n`;
      if (ks.gaps) section += `  Identified Gaps: ${ks.gaps.length || 0}\n`;
    }
    
    if (insights.eliteIntel.opportunities) {
      const ops = insights.eliteIntel.opportunities;
      section += `\n**Market Opportunities:**\n`;
      if (Array.isArray(ops)) {
        ops.slice(0, 3).forEach((o, i) => {
          section += `  ${i + 1}. ${typeof o === 'string' ? o : (o.title || o.opportunity || JSON.stringify(o).substring(0, 100))}\n`;
        });
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // V7.1 FORENSIC INTELLIGENCE SECTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  section += buildForensicIntelligenceSection(insights.forensicIntelligence);
  
  section += `
---

**⚡ STRATEGIC ACTION DIRECTIVE:**
Use this comprehensive competitive intelligence to:
1. **Benchmark** your recommendations against real competitor metrics
2. **Identify gaps** in keywords, content, and backlinks that represent opportunities
3. **Prioritize** strategies based on what's working for top competitors
4. **Quantify** your recommendations with specific targets (e.g., "Match ${insights.topCompetitor}'s authority of ${insights.marketAverages?.authority || 0}/100")
5. **Reference** specific competitor data points when making positioning decisions
6. **Exploit brittleness** — Target competitors with high vulnerability scores for aggressive capture
7. **Maximize cite-ability** — Optimize content for AI model citations using AEO scores
8. **Quantify asset value** — Use organic trust values for CFO-ready business cases

This data is REAL and CURRENT from our analysis - cite specific metrics in your strategic recommendations.
`;

  return section;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * V7.1 FORENSIC INTELLIGENCE SECTION BUILDER
 * Generates prompt sections for AEO, Asset Valuation, and Brittleness data
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function buildForensicIntelligenceSection(forensic) {
  if (!forensic) {
    return '\n\n**📊 V7.1 FORENSIC INTELLIGENCE:** No forensic analysis data is currently available. When competitor analysis has been completed, this section will populate with AEO cite-ability scores, digital asset valuations, and brittleness predictions.\n';
  }
  
  let section = `

---

### ═══════════════════════════════════════════════════════════════════════════
### 🔬 V7.1 FORENSIC INTELLIGENCE (Advanced Competitive Analysis)
### ═══════════════════════════════════════════════════════════════════════════

`;

  // ════════════════════════════════════════════════════════════════════════
  // 9️⃣ AEO CITATION MATRIX
  // ════════════════════════════════════════════════════════════════════════
  section += `#### 9️⃣ AEO CITATION MATRIX (Algorithmic Engine Optimization)
**Purpose:** Predicts how likely AI models (GPT, Gemini, Claude, Perplexity) will cite each competitor as a source.
**Formula:** Algorithmic_Citeability = (entity_density × 0.30) + (schema_coverage × 0.25) + (semantic_triplets × 0.20) + (faq_presence × 0.15) + (freshness × 0.10)

`;

  if (forensic.aeoScores && forensic.aeoScores.length > 0) {
    section += `| Domain | Cite-ability Score | Citation Tier | Top Strength | Improvement Area |\n`;
    section += `|--------|-------------------|---------------|--------------|------------------|\n`;
    forensic.aeoScores.forEach(aeo => {
      const breakdown = aeo.breakdown || {};
      const strengths = Object.entries(breakdown).sort((a, b) => (b[1] || 0) - (a[1] || 0));
      const topStrength = strengths[0] ? strengths[0][0].replace(/_/g, ' ') : 'N/A';
      const weakest = strengths[strengths.length - 1] ? strengths[strengths.length - 1][0].replace(/_/g, ' ') : 'N/A';
      section += `| ${aeo.domain} | ${(aeo.citeabilityScore || 0).toFixed(2)} | ${aeo.tier} | ${topStrength} | ${weakest} |\n`;
    });
    
    section += `\n**Market AEO Benchmarks:**\n`;
    section += `  - Average Cite-ability: ${forensic.aggregates?.avgCiteability || 'N/A'}\n`;
    section += `  - Most Cite-able Competitor: ${forensic.aggregates?.topCiteable || 'N/A'}\n`;
    
    section += `\n**🎯 AEO STRATEGIC INSIGHT:** The competitor with highest cite-ability will dominate AI-powered search and voice assistants. Target their weak dimensions for asymmetric wins.\n`;
  } else {
    section += `*AEO scores not calculated — requires content analysis data.*\n`;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 🔟 DIGITAL ASSET VALUATION
  // ════════════════════════════════════════════════════════════════════════
  section += `
---

#### 🔟 DIGITAL ASSET VALUATION (CFO Evidence Pack)
**Purpose:** Calculate the organic trust value and replacement cost of competitor digital assets.
**Formula:** Organic_Trust_Value = (annual_organic_traffic × avg_cpc) × moat_stability_multiplier

`;

  if (forensic.assetValuations && forensic.assetValuations.length > 0) {
    section += `| Domain | Organic Trust Value | Valuation Tier | Moat Multiplier | Annual Traffic Value |\n`;
    section += `|--------|--------------------:|----------------|-----------------|---------------------:|\n`;
    forensic.assetValuations.forEach(asset => {
      const formattedValue = formatAssetValue(asset.organicTrustValue);
      const formattedTraffic = formatAssetValue(asset.annualTrafficValue);
      section += `| ${asset.domain} | ${formattedValue} | ${asset.valuationTier} | ${(asset.moatMultiplier || 1).toFixed(2)}x | ${formattedTraffic} |\n`;
    });
    
    section += `\n**Market Valuation Summary:**\n`;
    section += `  - Total Competitive Market Value: ${formatAssetValue(forensic.aggregates?.totalMarketValue)}\n`;
    section += `  - Average Asset Value: ${formatAssetValue(forensic.aggregates?.avgAssetValue)}\n`;
    section += `  - Most Valuable Competitor: ${forensic.aggregates?.mostValuable || 'N/A'}\n`;
    
    section += `\n**💰 VALUATION STRATEGIC INSIGHT:** Use these values for M&A due diligence, board presentations, and quantifying the cost of losing to competitors. The moat multiplier indicates defensibility.\n`;
  } else {
    section += `*Asset valuations not calculated — requires traffic and keyword data.*\n`;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1️⃣1️⃣ BRITTLENESS PREDICTION (Core Update Vulnerability)
  // ════════════════════════════════════════════════════════════════════════
  section += `
---

#### 1️⃣1️⃣ BRITTLENESS PREDICTION (Core Update Vulnerability)
**Purpose:** Predict which competitors are most likely to collapse in the next Google Core Update.
**Formula:** Brittleness_Score = Σ(risk_factor × weight) × (1 / domain_age_years)
**Risk Thresholds:** >70 = HIGH (50%+ drop likely) | 50-70 = MODERATE (20-30% drop) | <30 = STABLE

`;

  if (forensic.brittlenessScores && forensic.brittlenessScores.length > 0) {
    section += `| Domain | Brittleness Score | Risk Level | Top Risk Factors | Collapse Probability |\n`;
    section += `|--------|------------------:|------------|------------------|---------------------|\n`;
    forensic.brittlenessScores.forEach(brit => {
      const topRisks = (brit.topRisks || []).slice(0, 2).map(r => r.factor || r).join(', ') || 'Unknown';
      section += `| ${brit.domain} | ${(brit.brittlenessScore || 0).toFixed(1)} | ${brit.riskLevel} | ${topRisks} | ${brit.collapseRisk} |\n`;
    });
    
    section += `\n**Market Vulnerability Summary:**\n`;
    section += `  - Average Market Brittleness: ${forensic.aggregates?.avgBrittleness || 'N/A'}/100\n`;
    section += `  - Most Vulnerable Competitor: ⚠️ ${forensic.aggregates?.mostVulnerable || 'N/A'} (Target for aggressive capture)\n`;
    section += `  - Most Stable Competitor: 🛡️ ${forensic.aggregates?.mostStable || 'N/A'} (Hardest to displace)\n`;
    
    section += `\n**🎯 BRITTLENESS STRATEGIC INSIGHT:** Competitors with HIGH brittleness scores are prime targets for aggressive content campaigns. Plan to capture their traffic during the next Core Update window.\n`;
  } else {
    section += `*Brittleness scores not calculated — requires content and backlink data.*\n`;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1️⃣2️⃣ INFORMATION BLACK HOLES (Content Gaps)
  // ════════════════════════════════════════════════════════════════════════
  section += `
---

#### 1️⃣2️⃣ INFORMATION BLACK HOLES (AEO Dead Zones)
**Purpose:** Identify topics/questions that NO competitor adequately addresses — maximum opportunity for AI citation capture.

`;

  if (forensic.informationBlackHoles && forensic.informationBlackHoles.length > 0) {
    section += `**Detected Black Holes (Uncontested Opportunity Zones):**\n`;
    forensic.informationBlackHoles.slice(0, 8).forEach((hole, i) => {
      const topic = typeof hole === 'string' ? hole : (hole.topic || hole.query || 'Unknown');
      const opportunity = typeof hole === 'object' ? hole.opportunity_score : null;
      section += `  ${i + 1}. **${topic}**${opportunity ? ` (Opportunity Score: ${opportunity}/10)` : ''}\n`;
    });
    
    section += `\n**🌑 BLACK HOLE STRATEGY:** These topics have zero authoritative coverage. Creating definitive content here guarantees AI citation and featured snippet capture.\n`;
  } else {
    section += `*No information black holes detected — competitors may have comprehensive coverage.*\n`;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1️⃣3️⃣ SEMANTIC ENTITY OWNERSHIP (Galaxy Data)
  // ════════════════════════════════════════════════════════════════════════
  if (forensic.semanticEntities && forensic.semanticEntities.length > 0) {
    section += `
---

#### 1️⃣3️⃣ SEMANTIC ENTITY OWNERSHIP MAP
**Purpose:** Visualize which competitors "own" key entities/concepts in the knowledge graph.

`;
    
    // Group entities by owner
    const entityByOwner = {};
    forensic.semanticEntities.forEach(entity => {
      const owner = entity.owner || 'unknown';
      if (!entityByOwner[owner]) entityByOwner[owner] = [];
      entityByOwner[owner].push(entity.name);
    });
    
    Object.entries(entityByOwner).forEach(([owner, entities]) => {
      section += `**${owner}:** ${entities.slice(0, 10).join(', ')}${entities.length > 10 ? '...' : ''}\n`;
    });
    
    section += `\n**🌐 ENTITY STRATEGY:** Own the entities, own the knowledge graph. Target unowned or contested entities for topical authority.\n`;
  }

  return section;
}

/**
 * Format asset value for display
 */
function formatAssetValue(value) {
  if (!value || isNaN(value)) return '$0';
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
  return '$' + Math.round(value).toLocaleString();
}

/**
 * Helper to format large traffic numbers
 */
function formatTrafficNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * V7.1 FORENSIC INTELLIGENCE ENGINE
 * Calculates AEO Citation Matrix, Asset Valuation, and Brittleness scores
 * for all competitors to enhance Gemini strategic analysis
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function calculateForensicIntelligence(competitors) {
  Logger.log('🔬 [FORENSIC] Calculating V7.1 Forensic Intelligence for ' + competitors.length + ' competitors...');
  
  try {
    const forensicData = {
      aeoScores: [],
      assetValuations: [],
      brittlenessScores: [],
      semanticEntities: [],
      informationBlackHoles: [],
      aggregates: {}
    };
    
    // ════════════════════════════════════════════════════════════════════════
    // PROCESS EACH COMPETITOR
    // ════════════════════════════════════════════════════════════════════════
    competitors.forEach(competitor => {
      const domain = competitor.domain || 'unknown';
      const synth = competitor.synthesized || {};
      const snapshot = competitor.snapshot || {};
      const apiData = competitor.apiData || {};
      const metrics = competitor.processedMetrics || {};
      
      // Build content data object for forensic functions
      const contentData = {
        word_count: synth.content?.wordCount || snapshot.metadata?.wordCount || 0,
        named_entities: snapshot.entities || synth.content?.entities || [],
        entityCount: (snapshot.entities || synth.content?.entities || []).length,
        semantic_triplets: synth.content?.triplets || [],
        faq_count: snapshot.schema?.faqCount || 0,
        has_qa_content: snapshot.schema?.hasFAQPage || false,
        last_modified: snapshot.metadata?.lastModified || null,
        avg_word_count: synth.content?.wordCount || 0,
        thin_page_percentage: synth.content?.thinPagesPercentage || 0,
        has_author_bios: synth.content?.hasAuthorBio || false,
        has_credentials: synth.content?.hasCredentials || false,
        has_citations: synth.content?.hasCitations || false,
        total_pages: synth.technical?.pageCount || 1
      };
      
      // Build technical data object
      const technicalData = {
        schema_types: snapshot.schema?.types || [],
        has_faq_schema: snapshot.schema?.hasFAQPage || false,
        has_about_page: synth.technical?.hasAboutPage || false,
        schema_version: 2024 // Assume modern unless detected otherwise
      };
      
      // Build backlink data object
      const backlinkData = {
        total_backlinks: metrics.backlinks || 0,
        referring_domain_count: metrics.referringDomains || 0,
        exact_match_anchor_percentage: competitor.backlinkData?.exactMatchPct || 0.08
      };
      
      // Build domain data object
      const domainData = {
        age_years: metrics.domainAge || 5,
        authority_score: metrics.authorityScore || 0,
        hasAboutPage: synth.technical?.hasAboutPage || false
      };
      
      // Build traffic/keyword data for asset valuation
      const trafficData = {
        monthly_organic: metrics.estimatedTraffic || metrics.organicTraffic || 0
      };
      
      const keywordData = {
        avg_cpc: competitor.keywordProfile?.avgCPC || 2.50,
        keywords: competitor.keywordProfile?.topKeywords || []
      };
      
      // ════════════════════════════════════════════════════════════════════
      // 1. AEO CITATION MATRIX
      // ════════════════════════════════════════════════════════════════════
      let aeoScore = null;
      if (typeof AEO_calculateCiteability === 'function') {
        try {
          aeoScore = AEO_calculateCiteability(contentData, technicalData);
          forensicData.aeoScores.push({
            domain: domain,
            citeabilityScore: aeoScore.citeability_score || 0,
            tier: aeoScore.citation_tier || 'LOW',
            breakdown: aeoScore.metrics || {},
            recommendations: aeoScore.recommendations || []
          });
        } catch (e) {
          Logger.log('   ⚠️ AEO error for ' + domain + ': ' + e.message);
        }
      }
      
      // ════════════════════════════════════════════════════════════════════
      // 2. ASSET VALUATION
      // ════════════════════════════════════════════════════════════════════
      let assetValue = null;
      if (typeof ASSET_calculateOrganicTrustValue === 'function') {
        try {
          assetValue = ASSET_calculateOrganicTrustValue(trafficData, keywordData, domainData);
          forensicData.assetValuations.push({
            domain: domain,
            organicTrustValue: assetValue.organic_trust_value || 0,
            valuationTier: assetValue.valuation_tier || 'UNKNOWN',
            moatMultiplier: assetValue.moat_multiplier || 1,
            annualTrafficValue: assetValue.base_value || 0
          });
        } catch (e) {
          Logger.log('   ⚠️ Asset valuation error for ' + domain + ': ' + e.message);
        }
      }
      
      // ════════════════════════════════════════════════════════════════════
      // 3. BRITTLENESS PREDICTION
      // ════════════════════════════════════════════════════════════════════
      let brittleness = null;
      if (typeof BRITTLENESS_calculateScore === 'function') {
        try {
          brittleness = BRITTLENESS_calculateScore(contentData, backlinkData, technicalData, domainData);
          forensicData.brittlenessScores.push({
            domain: domain,
            brittlenessScore: brittleness.brittleness_score || 0,
            riskLevel: brittleness.risk_level || 'UNKNOWN',
            topRisks: brittleness.top_risks || [],
            collapseRisk: brittleness.collapse_probability || 'LOW'
          });
        } catch (e) {
          Logger.log('   ⚠️ Brittleness error for ' + domain + ': ' + e.message);
        }
      }
      
      // ════════════════════════════════════════════════════════════════════
      // 4. SEMANTIC ENTITY EXTRACTION (for Galaxy visualization)
      // ════════════════════════════════════════════════════════════════════
      const entities = snapshot.entities || synth.content?.entities || [];
      if (entities.length > 0) {
        entities.slice(0, 20).forEach(entity => {
          const entityName = typeof entity === 'string' ? entity : (entity.name || entity.text || '');
          if (entityName) {
            forensicData.semanticEntities.push({
              name: entityName,
              type: entity.type || 'CONCEPT',
              owner: domain,
              mentions: entity.count || 1,
              salience: entity.salience || 0.5
            });
          }
        });
      }
    });
    
    // ════════════════════════════════════════════════════════════════════════
    // 5. DETECT INFORMATION BLACK HOLES (content gaps across all competitors)
    // ════════════════════════════════════════════════════════════════════════
    if (typeof AEO_detectDeadZones === 'function') {
      try {
        const allContentData = competitors.map(c => ({
          domain: c.domain,
          content: c.synthesized?.content || c.snapshot?.metadata || {}
        }));
        const deadZones = AEO_detectDeadZones({ competitors: allContentData });
        forensicData.informationBlackHoles = deadZones.black_holes || [];
      } catch (e) {
        Logger.log('   ⚠️ Black hole detection error: ' + e.message);
      }
    }
    
    // ════════════════════════════════════════════════════════════════════════
    // CALCULATE AGGREGATES
    // ════════════════════════════════════════════════════════════════════════
    if (forensicData.aeoScores.length > 0) {
      const avgAEO = forensicData.aeoScores.reduce((sum, s) => sum + (s.citeabilityScore || 0), 0) / forensicData.aeoScores.length;
      forensicData.aggregates.avgCiteability = avgAEO.toFixed(2);
      forensicData.aggregates.topCiteable = [...forensicData.aeoScores].sort((a, b) => b.citeabilityScore - a.citeabilityScore)[0]?.domain;
    }
    
    if (forensicData.assetValuations.length > 0) {
      const totalValue = forensicData.assetValuations.reduce((sum, v) => sum + (v.organicTrustValue || 0), 0);
      forensicData.aggregates.totalMarketValue = totalValue;
      forensicData.aggregates.avgAssetValue = Math.round(totalValue / forensicData.assetValuations.length);
      forensicData.aggregates.mostValuable = [...forensicData.assetValuations].sort((a, b) => b.organicTrustValue - a.organicTrustValue)[0]?.domain;
    }
    
    if (forensicData.brittlenessScores.length > 0) {
      const avgBrittleness = forensicData.brittlenessScores.reduce((sum, b) => sum + (b.brittlenessScore || 0), 0) / forensicData.brittlenessScores.length;
      forensicData.aggregates.avgBrittleness = avgBrittleness.toFixed(1);
      forensicData.aggregates.mostVulnerable = [...forensicData.brittlenessScores].sort((a, b) => b.brittlenessScore - a.brittlenessScore)[0]?.domain;
      forensicData.aggregates.mostStable = [...forensicData.brittlenessScores].sort((a, b) => a.brittlenessScore - b.brittlenessScore)[0]?.domain;
    }
    
    Logger.log('✅ [FORENSIC] Intelligence calculated:');
    Logger.log('   - AEO scores: ' + forensicData.aeoScores.length);
    Logger.log('   - Asset valuations: ' + forensicData.assetValuations.length);
    Logger.log('   - Brittleness scores: ' + forensicData.brittlenessScores.length);
    Logger.log('   - Semantic entities: ' + forensicData.semanticEntities.length);
    Logger.log('   - Information black holes: ' + forensicData.informationBlackHoles.length);
    
    return forensicData;
    
  } catch (error) {
    Logger.log('❌ [FORENSIC] Error calculating forensic intelligence: ' + error.message);
    return {
      aeoScores: [],
      assetValuations: [],
      brittlenessScores: [],
      semanticEntities: [],
      informationBlackHoles: [],
      aggregates: {},
      error: error.message
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
  const prompt = `
═══════════════════════════════════════════════════════════════════════════════
🎭 ELITE INTELLIGENCE PROTOCOL — 0.1 PERCENTILE OUTPUT STANDARDS
═══════════════════════════════════════════════════════════════════════════════

**MULTI-EXPERT FUSION DIRECTIVE:**
You are channeling a fusion of 36 elite experts across 6 strategic disciplines.
For EVERY insight you generate, simultaneously embody:

📊 MARKET INTELLIGENCE EXPERTS:
• McKinsey Senior Partner (20+ years strategy consulting)
• Bridgewater Hedge Fund Research Director (macro pattern recognition)
• Fortune 500 Chief Strategy Officer (corporate competitive intelligence)
• Google SERP Quality Analyst (algorithmic ranking mechanics)
• Nobel-caliber Behavioral Economist (decision science)
• Category Design Strategist (market creation)

🚀 STRATEGIC OPPORTUNITY EXPERTS:
• Y Combinator General Partner (startup pattern matching)
• KKR Private Equity Operating Partner (value creation levers)
• Product-Led Growth Architect (viral loops, activation)
• SEO Revenue Strategist (search-to-revenue attribution)
• Andreessen Horowitz Venture Scout (emerging opportunity radar)
• Jobs-To-Be-Done Research Lead (outcome-driven innovation)

⚠️ RISK MITIGATION EXPERTS:
• Google Search Quality Rater Lead (E-E-A-T compliance)
• CIA-trained Competitive Intelligence Director (threat assessment)
• Mastercard Chief Crisis Officer (risk mitigation frameworks)
• Blackstone Portfolio Risk Manager (downside protection)
• Mandiant Cybersecurity Analyst (digital threat detection)
• Goldman Sachs Regulatory Director (compliance risk)

📝 CONTENT & SEO EXPERTS:
• Semantic SEO Architect (entity optimization, NLP)
• HubSpot Content Portfolio Manager (content economics)
• Google E-E-A-T Specialist (trust signal engineering)
• AI Content Strategist (AEO, LLM optimization)
• Direct Response Conversion Copywriter (Schwartz, Ogilvy)
• Information Architect (UX + findability)

🎨 BRAND & POSITIONING EXPERTS:
• Brand Anthropologist (cultural insight mining)
• Ries & Trout Positioning Strategist (mental real estate)
• Narrative Designer (story architecture)
• Semiotician (symbol & meaning systems)
• Category Language Specialist (linguistic framing)
• Enemy Branding Expert (competitive contrast)

⚡ EXECUTION & PLANNING EXPERTS:
• Google OKR Coach (objectives + key results)
• Agile Lead (sprint planning, velocity)
• McKinsey Change Management Director (organizational transformation)
• Resource Optimization Analyst (capacity + allocation)
• Amazon Program Management Executive (PRFAQ methodology)
• Toyota Continuous Improvement Sensei (kaizen, lean)

═══════════════════════════════════════════════════════════════════════════════
📋 OUTPUT QUALITY MANDATES — NON-NEGOTIABLE STANDARDS
═══════════════════════════════════════════════════════════════════════════════

1. **QUANTIFICATION REQUIREMENT**: Every claim includes specific numbers, 
   percentages, or metrics. Never use vague terms like "significant" or "many."
   
2. **COMPETITIVE SPECIFICITY**: Name actual competitors with exact metrics.
   Use the competitor intelligence data provided. No generic competitor references.
   
3. **ACTIONABLE PRECISION**: Every recommendation includes:
   - **Owner**: Who executes this
   - **Timeline**: Specific days/weeks/months
   - **Success Metric**: How we measure completion
   - **Dependencies**: What must happen first
   
4. **STRATEGIC DEPTH**: Apply at least 3 strategic frameworks per insight:
   - Porter's Five Forces, Blue Ocean, JTBD, Value Curve, Moat Analysis
   - Cialdini's Principles, Schwartz's Awareness Levels, Hormozi's Value Equation
   
5. **CHART DATA REQUIRED**: For EVERY section, include chartData JSON:
   \`\`\`json
   {
     "chartType": "radar|heatmap|sankey|bubble|treemap|gauge|timeline|force",
     "data": [...],
     "interactivity": "hover|click|drag|zoom"
   }
   \`\`\`

═══════════════════════════════════════════════════════════════════════════════
📝 LANGUAGE, CLARITY & CREDIBILITY STANDARDS — PROFESSIONAL GRADE
═══════════════════════════════════════════════════════════════════════════════

6. **NEUTRAL PROFESSIONAL LANGUAGE**:
   - Use precise, business-grade terminology over sensational or persuasive phrasing.
   - Avoid marketing-heavy terms like "game-changer," "revolutionary," or "explosive growth" 
     unless explicitly defined with supporting data.
   - If using coined terminology, define it clearly before first use.
   - Each sentence should communicate ONE core idea. Split overloaded sentences.

7. **EVIDENCE-BACKED CLAIMS**:
   - For any quantitative, statistical, or factual claim, do ONE of:
     a) Provide a verifiable external source with URL (industry research, SaaS vendor data, analytics platform)
     b) Explicitly label as "internal analysis," "industry heuristic," or "estimated based on [methodology]"
   - NEVER fabricate statistics, sources, or links.
   - If no reliable external source exists, avoid precise percentages or dollar figures.
   - Use qualified language: "Industry benchmarks suggest..." or "Based on internal analysis..."

8. **SOURCE CITATION RULES**:
   - Place source citations immediately after the claims they support.
   - Format: [Source Name](URL) or "According to [Organization], ..."
   - Acceptable sources: Industry research firms (Gartner, Forrester, Statista), 
     reputable SaaS vendors, analytics platforms, peer-reviewed publications.
   - When citing competitor data: Reference the specific data source (e.g., "From Serpifai analysis" 
     or "Based on OpenPageRank API data").

9. **REPORT CREDIBILITY STANDARD**:
   - Output must be suitable for: Agency founders, enterprise buyers, investors, partners.
   - Avoid absolute claims ("always," "never," "guaranteed").
   - Avoid exaggerated certainty or unsupported precision.
   - When uncertain, use "likely," "suggests," or "indicates" rather than definitive statements.

═══════════════════════════════════════════════════════════════════════════════
📊 VISUALIZATION & CHART RENDERING STANDARDS — ACCURACY MANDATE
═══════════════════════════════════════════════════════════════════════════════

10. **CHART-TO-SECTION ALIGNMENT**:
    - Each chart MUST be rendered within the section it directly supports.
    - Introduce every chart with a brief explanatory sentence describing what it shows.
    - Include clear titles, axis labels, and units on all charts.
    - Do NOT render charts outside their semantic section.
    - Chart titles must match the data they display (e.g., "Customer Frustration Intensity" 
      not "General Pain Points").

11. **DATA-TO-VISUAL CONSISTENCY**:
    - Charts must reflect ONLY data discussed in the surrounding text.
    - Do NOT introduce new metrics, competitors, or interpretations solely in charts.
    - If a chart references a competitor, that competitor must be discussed in the section text.
    - All chart data points must be traceable to the JSON dashboardCharts object.

12. **THEME-AWARE ACCESSIBILITY STYLING**:
    - Color usage must maintain sufficient contrast across light, dark, and high-contrast themes.
    - Primary data elements: Minimum 4.5:1 contrast ratio.
    - Labels and text: Minimum 3:1 contrast ratio against chart backgrounds.
    - Use color to reinforce meaning and hierarchy, not just decoration.
    - Avoid color combinations that are problematic for colorblind users 
      (e.g., pure red/green without shape differentiation).

13. **VISUAL HIERARCHY**:
    - Primary metrics: Larger, bolder, more saturated colors.
    - Supporting data: Smaller, lighter, less prominent.
    - Use consistent visual weight across all charts in the report.
    - Ensure all charts remain readable at 80% zoom.

═══════════════════════════════════════════════════════════════════════════════
🎯 INSIGHT PRESENTATION FORMAT — ELITE STANDARD
═══════════════════════════════════════════════════════════════════════════════

For EVERY strategic insight, use this exact format:

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 INSIGHT TITLE (Action-Oriented, Specific)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 QUANTIFIED FINDING: [Specific metric or data point]                     │
│ 🔍 EXPERT LENS: [Which of the 36 experts informed this insight]            │
│ ⚡ STRATEGIC IMPLICATION: [What this means for competitive positioning]    │
│ 🎬 IMMEDIATE ACTION: [Specific next step with owner + timeline]            │
│ 📈 SUCCESS METRIC: [How we measure impact]                                 │
│ 🆚 COMPETITOR CONTRAST: [How this differentiates from named competitors]   │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

**ROLE / IDENTITY — ELITE STRATEGIC INTELLIGENCE ANALYST**

You are a world-class strategic intelligence operative combining:
- **McKinsey Partner-Level Strategy**: Porter's Five Forces, Blue Ocean thinking, competitive moat analysis
- **Bain Growth Consulting**: Market sizing, segment prioritization, whitespace identification
- **Peter Thiel's Zero-to-One Thinking**: Finding secrets competitors don't see, 10x opportunities
- **Alex Hormozi's Offer Architecture**: Grand Slam Offers, value stacking, irresistible positioning
- **Eugene Schwartz's Market Awareness**: 5 levels of awareness, sophistication stages
- **Robert Cialdini's Persuasion Science**: Psychological triggers, behavioral economics
- **Clayton Christensen's Jobs-To-Be-Done**: Hiring criteria, outcome-driven innovation

You're operating as the **Strategic Intelligence Engine** for ${getField(data, 'brandName')}, tasked with uncovering market opportunities that create unfair competitive advantages.

---

**YOUR MISSION — ELITE MARKET INTELLIGENCE**

You will perform DEEP strategic analysis across 4 dimensions:

**1. MARKET OPPORTUNITY MAPPING (Blue Ocean)**
- Identify uncontested market space competitors ignore
- Find "category of one" positioning opportunities
- Map value curves showing differentiation gaps
- Quantify addressable opportunity size

**2. COMPETITIVE KILL ZONE ANALYSIS**
- Identify competitor blind spots and structural weaknesses
- Find asymmetric advantages (where you can win 10x vs their 1x improvement)
- Map competitor resource constraints that create openings
- Time-sensitive opportunities before market shifts

**3. CUSTOMER PSYCHOLOGY DEEP DIVE**
- Uncover hidden frustrations competitors fail to address
- Map the "struggle timeline" (before → during → after moments)
- Identify belief barriers preventing purchase
- Find emotional triggers that accelerate decisions

**4. STRATEGIC MOAT CONSTRUCTION**
- Content moats: Topic ownership opportunities
- Authority moats: Credibility gaps to exploit  
- Distribution moats: Channel advantages
- Brand moats: Positioning no one else can claim

**CRITICAL REQUIREMENTS**:
⚠️ Every insight MUST be grounded in the provided data — NO generic advice
⚠️ Opportunities MUST be specific, actionable, and prioritized by impact
⚠️ Include "WHY NOW" timing analysis for each major opportunity
⚠️ Identify the ONE thing that would 10x their competitive position

---

## � COMPETITOR DATA INGESTION PROTOCOL

**When competitor intelligence data is provided above, you MUST:**

**1. INGEST & PATTERN RECOGNITION:**
- Identify key patterns, strengths, weaknesses, gaps from the raw competitor dataset
- Summarize insights per competitor AND overall market landscape
- Extract authority metrics, traffic data, keyword profiles, and technical scores
- Note content gaps, backlink opportunities, and brittleness indicators

**2. PERSONA & JTBD SYNTHESIS:**
- Generate 3-4 primary personas relevant to this market based on:
  - Target audience data + competitor audience analysis
  - Customer pains, desires, and objections
- For EACH persona, derive:
  - Top 5 Jobs-to-be-Done with frequency/importance scores
  - Emotional pains with intensity ratings + competitor failure analysis
  - Hidden desires with barriers and content opportunities
  - Charts showing pain/desire intensity distribution

**3. OPPORTUNITY & GAP ANALYSIS:**
- Highlight untapped niches from competitor blind spots
- Identify white spaces where NO competitor adequately serves customers
- Calculate first-mover advantage windows with expiration timelines
- Generate charts comparing:
  - Competitor gaps vs. market needs intensity
  - Moat potential scoring across strategic dimensions

**4. CONTENT & KEYWORD STRATEGY:**
- Suggest 5-7 content pillars based on competitor content gaps
- For EACH pillar provide 10 high-value keywords with:
  - Volume (use "estimated" label if from heuristics)
  - Difficulty (low/medium/high)
  - Intent (informational/navigational/commercial/transactional)
  - Competitor ranking (who ranks and at what position)
- Suggest 3 content pieces per pillar with strategic summaries
- Generate charts comparing keyword opportunity vs. competitor saturation

**5. EXECUTIVE SUMMARIES:**
- Provide 2-3 sentence C-level summaries for each major section
- Highlight actionable insights and recommended strategic moves
- Include "The ONE thing leadership should know" for each section

---

## �📊 COMPLETE CONTEXT (ALL INPUT FIELDS MAPPED)

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

${buildCompetitorInsightsSection(data._competitorInsights)}

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

## 🎯 YOUR OUTPUT REQUIREMENTS — ELITE STRATEGIC INTELLIGENCE

You will generate **TWO PARTS** in a single response:

### PART 1: STRATEGIC DATA (JSON)

Return a single, valid JSON object. This powers the dashboard visualizations.

**CRITICAL JSON RULES:**
- Valid JSON syntax (double quotes, no trailing commas)
- ALL numeric scores (1-10) MUST be derived from ACTUAL ANALYSIS, not arbitrary numbers
- Every score requires internal reasoning: "Why is this an 8, not a 6?"
- Use the competitor intelligence data to ground competitive scores
- JTBD scenarios: Minimum 5, each with specific trigger situations
- Content pillars: 3-5 with strategic rationale tied to competitive gaps

**SCORING PHILOSOPHY:**
- 9-10: Exceptional, rare — requires strong evidence from data
- 7-8: Strong, differentiated — must cite specific competitive gap
- 5-6: Average, table stakes — competitors also do this
- 3-4: Weak, improvement needed — competitors outperform here
- 1-2: Critical gap — urgent attention required

\`\`\`json
{
  "visualizationConfig": {
    "globalInteractivity": {
      "hoverTooltips": true,
      "clickToExpand": true,
      "dragToCompare": true,
      "zoomPan": true,
      "animateOnScroll": true,
      "responsiveDesign": true
    },
    "colorPalette": {
      "primary": ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
      "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "danger": "#EF4444",
      "success": "#10B981",
      "warning": "#F59E0B"
    },
    "animationPresets": {
      "entryDelay": 100,
      "duration": 800,
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  "chartTypeSpecs": {
    "audienceRadar": {"type": "radar", "axes": 6, "interaction": "hover-highlight", "animation": "spiral-in"},
    "painHeatmap": {"type": "heatmap", "colorScale": "red-yellow-green", "interaction": "cell-click", "animation": "fade-cells"},
    "jtbdSankey": {"type": "sankey", "flow": "left-to-right", "interaction": "path-highlight", "animation": "flow-particles"},
    "competitorThreatRadar": {"type": "radar", "axes": 8, "interaction": "drag-compare", "animation": "expand-out"},
    "bluOceanValueCurve": {"type": "line", "multiSeries": true, "interaction": "point-tooltip", "animation": "draw-line"},
    "opportunityBubble": {"type": "bubble", "dimensions": 3, "interaction": "zoom-pan", "animation": "float-in"},
    "positioningMatrix": {"type": "scatter", "quadrants": 4, "interaction": "drag-position", "animation": "gravity-settle"},
    "pillarTreemap": {"type": "treemap", "depth": 3, "interaction": "drill-down", "animation": "zoom-transition"},
    "pillarMindMap": {"type": "force-directed", "links": true, "interaction": "drag-nodes", "animation": "force-simulation"},
    "moatGauge": {"type": "gauge", "ranges": 3, "interaction": "hover-details", "animation": "needle-swing"},
    "ganttTimeline": {"type": "gantt", "dependencies": true, "interaction": "drag-resize", "animation": "slide-in"},
    "priorityMatrix": {"type": "matrix", "quadrants": 4, "interaction": "drag-reorder", "animation": "shuffle"},
    "citationFunnel": {"type": "funnel", "stages": 4, "interaction": "hover-expand", "animation": "cascade-down"},
    "assetTreemap": {"type": "treemap", "valueSize": true, "interaction": "click-drill", "animation": "grow-boxes"},
    "riskMatrix": {"type": "matrix", "colorScale": "risk", "interaction": "pulse-critical", "animation": "heartbeat"},
    "entityNetwork": {"type": "network", "clusters": true, "interaction": "force-drag", "animation": "spring-physics"},
    "masterRadar": {"type": "radar", "axes": 14, "interaction": "full-interactive", "animation": "wave-fill"}
  },
  "dashboardCharts": {
    "heroMetrics": {
      "citeabilityCoefficient": 0.0-1.0,
      "citeabilityFormula": "(entity_density × 0.30) + (schema_coverage × 0.25) + (semantic_triplets × 0.20) + (faq_presence × 0.15) + (freshness × 0.10)",
      "janitorRatio": 0-100,
      "janitorRatioDescription": "Percentage of existing content requiring cleanup/refresh before optimization",
      "moatAdjustedValuation": 0,
      "moatValuationFormula": "(monthly_organic_traffic × avg_CPC × 12) × moat_multiplier",
      "moatMultiplier": 1.0-3.0
    },
    "customerFrustrationsChart": [
      {
        "label": "Specific frustration from audiencePains",
        "intensity": 1-10,
        "segment": "Audience segment name",
        "shortDescription": "1-2 sentence elaboration",
        "competitorFailure": "How competitors fail to address this"
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
    "brandPositioningChart": {
      "positioningAxes": [
        "Tactical ↔ Strategic",
        "Commodity ↔ Premium",
        "Generic ↔ Specialized",
        "Reactive ↔ Proactive",
        "Old-School ↔ Modern",
        "Corporate ↔ Human"
      ],
      "positioningScores": [9, 8, 9, 8, 9, 7],
      "competitorAverage": [5, 6, 4, 5, 4, 6],
      "competitor1Scores": [6, 5, 5, 4, 5, 5],
      "competitor2Scores": [5, 7, 3, 6, 3, 7],
      "competitor1Name": "Top Competitor",
      "competitor2Name": "Competitor 2",
      "gapAnalysis": [
        { "axis": "Tactical ↔ Strategic", "yourScore": 9, "avgCompetitor": 5, "gap": "+4", "advantage": "Deep strategic frameworks vs surface tactics" },
        { "axis": "Commodity ↔ Premium", "yourScore": 8, "avgCompetitor": 6, "gap": "+2", "advantage": "Elite intelligence vs basic reports" }
      ]
    },
    "valuePropositionMixChart": [
      {
        "proposition": "Micro value prop",
        "appeal": 1-10,
        "differentiation": 1-10,
        "credibility": 1-10,
        "clarity": 1-10,
        "competitorComparison": "How this beats competitor X's positioning"
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
        "priority": 1-3,
        "moatPotential": "How this creates defensible advantage",
        "clusters": [
          {
            "name": "Cluster name",
            "stage": "awareness|consideration|decision|loyalty",
            "intent": "Cluster search intent description",
            "priority": 1-10,
            "keywords": [
              {"keyword": "semantic kw 1", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"},
              {"keyword": "semantic kw 2", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"},
              {"keyword": "semantic kw 3", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"},
              {"keyword": "semantic kw 4", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"},
              {"keyword": "semantic kw 5", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"},
              {"keyword": "semantic kw 6", "volume": "monthly searches", "difficulty": "low|med|high", "intent": "info|nav|comm|trans"}
            ]
          }
          // 4 clusters per pillar (Awareness, Consideration, Decision, Loyalty)
        ]
      }
      // 5 pillars × 4 clusters × 6 keywords = 120 total semantic keywords
    ],
    "priorityFocusMatrixChart": [
      {
        "initiative": "Specific initiative",
        "impact": 1-10,
        "effort": 1-10,
        "speed": 1-10,
        "priority": 1-3,
        "timeline": "Days/weeks",
        "whyNow": "Time-sensitive reasoning"
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
        "priority": 1-3,
        "whyCompetitorsMiss": "Structural reason competitors ignore this"
      }
      // 3-5 opportunities from coreStrategicQuestion and keyMarketData
    ],
    "blueOceanOpportunitiesChart": [
      {
        "opportunity": "Uncontested market space",
        "eliminate": "Industry factor to eliminate",
        "reduce": "Factor to reduce below standard",
        "raise": "Factor to raise above standard",
        "create": "New factor to create",
        "difficulty": 1-10,
        "potentialImpact": 1-10,
        "timeToCapture": "Weeks/months"
      }
      // 3-5 blue ocean opportunities based on competitor gaps
    ],
    "competitorKillMovesChart": [
      {
        "killMove": "Strategic action name",
        "targetCompetitor": "Competitor most affected",
        "competitorWeakness": "Structural weakness exploited",
        "yourAdvantage": "Why you can execute this",
        "impactLevel": 1-10,
        "executionDifficulty": 1-10,
        "timeframe": "Days/weeks/months",
        "expectedOutcome": "Specific measurable result"
      }
      // 3-5 kill moves from competitor intelligence data
    ],
    "asymmetricAdvantagesChart": [
      {
        "advantage": "Asymmetric opportunity name",
        "yourCost": "Low/Medium/High",
        "competitorCost": "10x higher/Impossible/Structural barrier",
        "category": "Content/Authority/Distribution/Brand/Speed",
        "actionRequired": "Specific next step",
        "moatStrength": 1-10
      }
      // 3-5 asymmetric advantages where you win disproportionately
    ],
    "aeoAnalysisChart": [
      {
        "competitor": "Competitor domain",
        "citeabilityScore": 0.0-1.0,
        "citationTier": "HIGH/MEDIUM/LOW",
        "entityDensity": 0.0-1.0,
        "schemaCoverage": 0.0-1.0,
        "semanticTriplets": 0.0-1.0,
        "faqPresence": 0.0-1.0,
        "freshnessSignal": 0.0-1.0,
        "vulnerabilityToDisrupt": "How you can out-cite them"
      }
      // 3-5 competitors from forensic intelligence data
    ],
    "assetValuationChart": [
      {
        "competitor": "Competitor domain",
        "organicTrustValue": "Dollar amount",
        "valuationTier": "ENTERPRISE/MID-MARKET/SMB/STARTUP",
        "moatMultiplier": 1.0-3.0,
        "annualTrafficValue": "Dollar amount",
        "replacementYears": "Years to replicate",
        "captureStrategy": "How to erode their asset value"
      }
      // 3-5 competitors from forensic intelligence data
    ],
    "brittlenessRiskChart": [
      {
        "competitor": "Competitor domain",
        "brittlenessScore": 0-100,
        "riskLevel": "HIGH/MODERATE/STABLE",
        "topRiskFactor1": "Primary vulnerability",
        "topRiskFactor2": "Secondary vulnerability",
        "collapseProbability": "Likelihood of 30%+ drop in next Core Update",
        "captureTimeframe": "When to strike",
        "captureStrategy": "Content to deploy for traffic capture"
      }
      // 3-5 competitors from forensic intelligence data
    ],
    "informationBlackHolesChart": [
      {
        "topic": "Unaddressed topic/question",
        "opportunityScore": 1-10,
        "competitorCoverage": "None/Superficial/Incomplete",
        "aiCitationPotential": "HIGH/MEDIUM/LOW",
        "contentTypeRecommendation": "FAQ/How-To/Ultimate Guide/etc",
        "estimatedTrafficPotential": "Monthly search volume",
        "priorityRank": 1-5
      }
      // 5-8 information black holes representing maximum opportunity
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
      "competitiveDifferentiation": "What makes this unique",
      "clusters": [
        {
          "name": "Cluster name",
          "stage": "awareness|consideration|decision|loyalty",
          "pillarContent": "Main article idea for this cluster",
          "keywords": [
            {"keyword": "kw1", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "🔥"},
            {"keyword": "kw2", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "⭐"},
            {"keyword": "kw3", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "standard"},
            {"keyword": "kw4", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "standard"},
            {"keyword": "kw5", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "standard"},
            {"keyword": "kw6", "volume": "X/mo", "difficulty": "low|med|high", "intent": "info|nav|comm|trans", "priority": "standard"}
          ]
        }
        // 4 clusters per pillar (Awareness, Consideration, Decision, Loyalty stages)
      ]
    }
    // 5 pillars × 4 clusters × 6 keywords = 120 total semantic keywords
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
  },
  "strategicIntelligence": {
    "the10xOpportunity": {
      "title": "The ONE thing that 10x competitive position",
      "description": "Detailed explanation",
      "whyNow": "Time-sensitive reasoning",
      "executionPath": "Step-by-step approach"
    },
    "competitorBlindSpots": [
      {
        "blindSpot": "What competitors fail to see",
        "evidence": "Data supporting this",
        "exploitStrategy": "How to capitalize"
      }
    ],
    "marketTimingSignals": [
      {
        "signal": "Market shift indicator",
        "implication": "What this means",
        "actionWindow": "Time-sensitive opportunity"
      }
    ],
    "defensibleMoats": [
      {
        "moatType": "Content/Authority/Distribution/Brand",
        "currentStrength": 1-10,
        "buildingStrategy": "How to strengthen",
        "competitorDifficulty": "Why competitors can't copy"
      }
    ]
  },
  "personas": [
    {
      "id": "PERSONA_1",
      "name": "Primary Persona Name",
      "demographics": {
        "role": "Job title/role",
        "companySize": "SMB/Mid-Market/Enterprise",
        "industry": "Industry vertical",
        "decisionPower": "Decision-maker/Influencer/End-user"
      },
      "psychographics": {
        "values": ["Value 1", "Value 2"],
        "frustrations": ["Daily frustration 1", "Daily frustration 2"],
        "aspirations": ["Career/business goal 1", "Career/business goal 2"],
        "informationSources": ["Where they learn", "Who they trust"]
      },
      "jtbd": [
        {
          "job": "When [situation], help me [action], so I can [outcome]",
          "frequency": "daily|weekly|monthly|quarterly",
          "importance": 1-10,
          "currentSolution": "How they solve this today",
          "frustrationWithCurrent": "Why current solution fails"
        }
      ],
      "emotionalPains": [
        {
          "pain": "Specific emotional pain point",
          "intensity": 1-10,
          "trigger": "What triggers this pain",
          "competitorResponse": "How competitors address (or fail to)"
        }
      ],
      "hiddenDesires": [
        {
          "desire": "What they secretly want but won't admit",
          "intensity": 1-10,
          "barrier": "What prevents them from achieving it",
          "contentOpportunity": "Content that speaks to this"
        }
      ],
      "objections": [
        {
          "objection": "Why they hesitate to buy/act",
          "rootCause": "Underlying fear or concern",
          "counterStrategy": "How to overcome this"
        }
      ],
      "charts": [
        {
          "chart_name": "persona_pain_intensity",
          "x_axis": ["Pain 1", "Pain 2", "Pain 3"],
          "y_axis": [8, 9, 7],
          "description": "Emotional pain intensity for this persona"
        }
      ]
    }
    // Generate 3-4 personas based on targetAudience and customerDemographics
  ],
  "competitiveAnalysis": {
    "insights": [
      {
        "insight": "Key competitive insight",
        "source": "Data source (Serpifai analysis/API data/content audit)",
        "actionability": 1-10,
        "urgency": "immediate|short-term|long-term"
      }
    ],
    "strengths": [
      {
        "competitor": "Competitor domain",
        "strength": "What they do well",
        "threatLevel": 1-10,
        "yourCounter": "How to neutralize or outperform"
      }
    ],
    "weaknesses": [
      {
        "competitor": "Competitor domain",
        "weakness": "Where they fall short",
        "exploitability": 1-10,
        "attackStrategy": "How to capitalize on this"
      }
    ],
    "gaps": [
      {
        "gapType": "content|keyword|authority|technical|brand",
        "description": "Specific gap identified",
        "marketNeed": "Customer need this gap represents",
        "captureStrategy": "How to fill this gap first"
      }
    ],
    "moatPotential": [
      {
        "moatType": "Content depth|Proprietary data|Community|Brand trust|Technical",
        "buildDifficulty": 1-10,
        "competitorReplicability": 1-10,
        "timeToEstablish": "months/years",
        "investmentRequired": "Low/Medium/High"
      }
    ],
    "charts": [
      {
        "chart_name": "competitor_gaps_vs_needs",
        "x_axis": ["Gap 1", "Gap 2", "Gap 3"],
        "y_axis": [85, 72, 68],
        "description": "Competitor gaps mapped against market demand intensity"
      },
      {
        "chart_name": "moat_potential_scoring",
        "x_axis": ["Content", "Authority", "Community", "Data", "Brand"],
        "y_axis": [8, 6, 4, 7, 5],
        "description": "Moat potential scores across strategic dimensions"
      }
    ]
  },
  "opportunities": {
    "niches": [
      {
        "niche": "Untapped market segment or topic",
        "marketSize": "Estimated audience/search volume",
        "competitorPresence": "None/Weak/Moderate",
        "captureStrategy": "First-mover approach",
        "contentNeeded": ["Content piece 1", "Content piece 2"]
      }
    ],
    "firstMoverAdvantage": [
      {
        "opportunity": "Time-sensitive opportunity",
        "windowCloses": "When this opportunity expires",
        "requiredAction": "What to do immediately",
        "expectedOutcome": "Measurable result"
      }
    ],
    "strategicMoves": [
      {
        "move": "Strategic action",
        "targetCompetitor": "Who this affects most",
        "resourcesNeeded": "Investment required",
        "riskLevel": "Low/Medium/High",
        "expectedROI": "Return on investment"
      }
    ],
    "charts": [
      {
        "chart_name": "opportunity_vs_competition",
        "x_axis": ["Niche 1", "Niche 2", "Niche 3", "Niche 4"],
        "y_axis": [90, 78, 65, 82],
        "description": "Market opportunity score vs competitive saturation (higher = better opportunity)"
      }
    ]
  },
  "contentStrategy": {
    "pillars": [
      {
        "name": "Content Pillar Name",
        "strategicRationale": "Why this pillar matters for competitive positioning",
        "competitorGap": "What competitors miss in this area",
        "audienceNeed": "Customer pain this addresses",
        "keywords": [
          {
            "keyword": "target keyword",
            "volume": "monthly searches (estimated if unknown)",
            "difficulty": "low|medium|high",
            "intent": "informational|navigational|commercial|transactional",
            "competitorRanking": "Top competitor and their position",
            "opportunityScore": 1-10
          }
        ],
        "contentIdeas": [
          {
            "title": "Content piece title",
            "format": "Ultimate Guide|How-To|Comparison|Case Study|Tool",
            "summary": "2-3 sentence description of content angle",
            "targetKeywords": ["kw1", "kw2"],
            "estimatedImpact": "Traffic/leads/authority potential"
          }
        ],
        "charts": [
          {
            "chart_name": "keyword_opportunity_vs_saturation",
            "x_axis": ["KW1", "KW2", "KW3", "KW4", "KW5"],
            "y_axis": [85, 72, 90, 65, 78],
            "description": "Keyword opportunity score (volume × 1/difficulty × intent value)"
          }
        ]
      }
      // Generate 5-7 content pillars with 10 keywords and 3 content ideas each
    ]
  },
  "executiveSummary": [
    {
      "section": "Personas & JTBD",
      "summary": "2-3 sentence C-level summary of key persona insights and priority jobs-to-be-done",
      "actionableInsight": "The ONE thing leadership should know",
      "strategicMove": "Recommended immediate action"
    },
    {
      "section": "Competitive Analysis",
      "summary": "2-3 sentence summary of competitive landscape and key vulnerabilities",
      "actionableInsight": "The competitor weakness to exploit NOW",
      "strategicMove": "Recommended offensive strategy"
    },
    {
      "section": "Opportunities",
      "summary": "2-3 sentence summary of market gaps and first-mover advantages",
      "actionableInsight": "The opportunity that closes soonest",
      "strategicMove": "Recommended capture strategy"
    },
    {
      "section": "Content Strategy",
      "summary": "2-3 sentence summary of content pillars and keyword opportunities",
      "actionableInsight": "The highest-ROI content investment",
      "strategicMove": "Recommended publishing priority"
    }
  ]
}
\`\`\`

### PART 2: ELITE STRATEGIC REPORT (MARKDOWN)

**CRITICAL: You MUST generate ALL 14 SECTIONS below. Each section corresponds to specific dashboard charts.**

═══════════════════════════════════════════════════════════════════════════════
⚠️ SECTION DEPTH REQUIREMENTS — 0.1 PERCENTILE STRATEGIC QUALITY
═══════════════════════════════════════════════════════════════════════════════

**MINIMUM OUTPUT REQUIREMENTS PER SECTION:**
- Section 1 (Customer Intelligence): 400+ words, 5+ frustrations with intensity scores, competitor failure examples
- Section 2 (JTBD): 300+ words, 5+ detailed JTBD scenarios with WHEN/HELP ME/SO I CAN format
- Section 3 (Competitive Warfare): 350+ words, 3+ kill moves with specific execution details
- Section 4 (Blue Ocean): 300+ words, 3+ ERRC opportunities, 10x opportunity analysis
- Section 5 (Brand Positioning): 250+ words, positioning matrix, unique mechanism with 3 promises
- Section 6 (Content Strategy): 300+ words, 3+ content pillars with moat potential scores
- Section 7 (Strategic Moat): 250+ words, content/authority/distribution moats with timelines
- Section 8 (Action Plan): 300+ words, 10+ initiatives in priority matrix, 30/60/90 day milestones
- Section 9 (AEO Citation): 200+ words, all competitors analyzed, disruption strategies
- Section 10 (Asset Valuation): 200+ words, dollar valuations, CFO evidence pack
- Section 11 (Brittleness): 200+ words, vulnerability scores, collapse capture playbook
- Section 12 (Black Holes): 200+ words, 5+ uncontested topics, semantic entity analysis
- Section 13 (Imperatives): 150+ words, top 10 prioritized actions with timelines
- Section 14 (Cross-Stage): 150+ words, handoff data for Stages 2-5

**QUALITY STANDARDS:**
1. **Cite competitor intelligence data** — Reference actual competitor domains, metrics, and weaknesses from provided data
2. **Quantify everything** — Use X/10 scores, percentages, dollar values, timelines
3. **Be contrarian** — Provide insights competitors would find uncomfortable
4. **Connect sections** — Reference how Section 3 Kill Moves address Section 1 Frustrations
5. **Visualize data** — Every table and chart must have actionable, specific data

═══════════════════════════════════════════════════════════════════════════════

After the JSON, provide a comprehensive strategic intelligence report structured EXACTLY as follows:

## 🎯 ELITE STRATEGIC INTELLIGENCE REPORT

### Executive Summary: The Strategic Opportunity
[3-5 sentences: What's the biggest opportunity? Why now? What's at stake? What happens if you don't act?]
[Reference: brandName="${getField(data, 'brandName')}", industry="${getField(data, 'industryVertical')}"]
[Cite specific competitor weakness to exploit immediately]

---

## 📊 SECTION 1: CUSTOMER INTELLIGENCE (→ Charts: customerFrustrationsChart, hiddenAspirationsChart, mindsetTransformationChart)

### 1.1 Customer Frustrations Deep Dive
**Input Data:** audiencePains="${getField(data, 'audiencePains').substring(0, 100)}..."

**REQUIRED TABLE FORMAT (MANDATORY — at least 7 frustrations):**
| # | Frustration | Intensity | Category | Competitor Failure | Exploitation Strategy |
|---|-------------|-----------|----------|-------------------|----------------------|
| 1 | [Deep pain point] | 9/10 | Emotional/Functional | [Competitor X] ignores this by... | Create content that... |
| 2 | [Second pain] | 8/10 | ... | [Competitor Y] fails because... | Position as the solution by... |
| 3-7 | [Continue pattern] | X/10 | ... | ... | ... |

**ADDITIONAL DEPTH REQUIREMENTS:**
- For EACH frustration: Quote the exact language customers use (verbatim phrases)
- **#1 Neglected Frustration:** The pain NO competitor addresses — this is your "unfair advantage"
- **Frustration Cluster:** Which 3 frustrations are related and can be solved together?
- **Cost of Inaction:** What happens if customers don't solve each frustration?

### 1.2 Hidden Aspirations & Unspoken Desires  
**Input Data:** audienceDesired="${getField(data, 'audienceDesired').substring(0, 100)}..."

**REQUIRED FORMAT (MANDATORY — at least 5 aspirations):**
| # | 🎯 Hidden Aspiration | Intensity | Market Coverage | Competitor Gap | Your Opportunity |
|---|---------------------|-----------|-----------------|----------------|------------------|
| 1 | [What they secretly want] | 9/10 | 20% | [Competitors miss this because...] | [How you can own this] |
| 2 | [Second aspiration] | 8/10 | 15% | ... | ... |

**ADDITIONAL DEPTH REQUIREMENTS:**
- What they want but are **embarrassed to admit** (status, shortcuts, validation)
- The **"If I could just..."** statements from your target audience
- **Transformation Vision:** The identity they want to become
- **Social Proof Need:** What validation they need to feel successful

### 1.3 Mindset Transformation Journey
**REQUIRED TABLE FORMAT (MANDATORY — at least 5 transformations):**
| # | FROM (Limiting Belief) | TO (Empowering Belief) | Importance | Trigger Content | Competitor Blind Spot |
|---|------------------------|------------------------|------------|-----------------|----------------------|
| 1 | "I can't because..." | "I can now because..." | 9/10 | [Article/video type] | [Why competitors don't address this] |
| 2 | "It's too hard to..." | "It's simple when..." | 8/10 | [Tutorial/guide] | ... |
| 3-5 | ... | ... | X/10 | ... | ... |

**ADDITIONAL DEPTH REQUIREMENTS:**
- **Belief Hierarchy:** Which belief shift MUST happen first before others are possible?
- **Content Bridge:** Specific content that creates each belief transformation
- **Purchase Enabler:** Which transformation makes them ready to buy?
- **Competitive Wedge:** How each transformation positions YOU as the only solution
- 5 transformations that enable purchase decisions
- Tie each belief shift to specific content type

---

## 🎯 SECTION 2: JOBS-TO-BE-DONE FRAMEWORK (→ Chart: customerJobPriorityChart)

### 2.1 Priority JTBD Scenarios
**MANDATORY: Generate 5+ detailed JTBD scenarios using this EXACT format:**

**JTBD #1: [Job Title] — MOST CRITICAL**
- 🔹 WHEN: [Trigger situation with specific context — "When I'm at work and...", "When my boss asks me to..."]
- 🔹 HELP ME: [What they're hiring your solution to do — be ultra-specific]
- 🔹 SO I CAN: [Ultimate desired outcome — the transformation they seek]
- 📊 **Metrics:** Urgency: X/10 | Frequency: X/month | Pain: X/10 | Willingness to Pay: $X
- 🎯 **Segment:** [Primary/Secondary audience + demographics]
- 🔥 **Competitor Gap:** [How competitors FAIL to address this job — cite specific competitor]
- ⚡ **Your Solution:** [How you uniquely solve this job better than anyone]

**JTBD #2: [Job Title]**
[Same format as above]

**JTBD #3-5: [Continue pattern — minimum 5 JTBDs required]**

### 2.2 Hiring Criteria Analysis
**MANDATORY TABLE:**
| Job Type | What They're Looking For | Current Solution | Why It Fails | Your Advantage |
|----------|-------------------------|------------------|--------------|----------------|
| Functional | [3 core requirements] | [Competitor X] | [Specific failure] | [Your edge] |
| Emotional | [3 outcomes sought] | [DIY/free tools] | [Leaves them feeling...] | [How you address this] |
| Social | [3 status considerations] | [Premium option] | [Still doesn't deliver...] | [Your positioning] |

**ADDITIONAL ANALYSIS:**
- **Currently Hiring:** What competitor solutions they actively use now
- **Firing Criteria:** What makes them fire their current solution
- **Moments of Struggle:** The 3 moments when they actively seek alternatives
- **Non-Consumption:** Who SHOULD be hiring solutions but isn't? Why?

### 2.3 Outcome-Driven Innovation Opportunities
**MANDATORY TABLE — at least 5 unmet outcomes:**
| # | Desired Outcome | Current Satisfaction | Innovation Opportunity | Difficulty | Impact |
|---|-----------------|---------------------|----------------------|------------|--------|
| 1 | [Outcome they can't get] | 3/10 | [Your solution] | Med | High |
| 2 | [Second outcome] | 2/10 | [How to deliver] | Low | High |

**ADDITIONAL DEPTH:**
- **Outcome Switching:** Why customers will switch from competitors for these outcomes
- **10x Opportunity:** The ONE outcome that could make you indispensable

---

## 🏆 SECTION 3: COMPETITIVE WARFARE (→ Charts: competitiveAdvantageMapChart, competitorKillMovesChart, asymmetricAdvantagesChart)

### 3.1 Competitive Advantage Mapping
**Based on keyCompetitors:** ${getField(data, 'keyCompetitors')}
**Your Advantages:** ${getField(data, 'competitiveAdvantages')}

**MANDATORY COMPETITIVE MATRIX (include ALL competitors from intelligence data):**
| Dimension | ${getField(data, 'brandName')} | Competitor 1 | Competitor 2 | Competitor 3 | Market Avg | Your Edge | Attack Strategy |
|-----------|------|--------------|--------------|--------------|------------|-----------|-----------------|
| Authority/Trust | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [How to exploit] |
| Content Depth | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [Content to create] |
| Technical SEO | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [Quick win] |
| Brand Recognition | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [Positioning move] |
| Offer Strength | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [Value prop] |
| Distribution | X/10 | X/10 | X/10 | X/10 | X/10 | [+/- Gap] | [Channel strategy] |

**ANALYSIS REQUIRED:**
- **Strongest Competitor:** [Name] — Why they're dangerous + their kryptonite
- **Weakest Competitor:** [Name] — Why they're vulnerable + capture strategy
- **Rising Threat:** [Name] — Watch this one + pre-emptive strike

### 3.2 Strategic Kill Moves
**MANDATORY: Generate 5 high-impact Kill Moves using this EXACT format:**

**🗡️ KILL MOVE #1: [Name — make it memorable]**
- 🎯 **Target Competitor:** [Specific competitor name from intelligence data]
- 💥 **Weakness Exploited:** [Their structural weakness — cite specific metric/data]
- ⚡ **Your Advantage:** [Why YOU can execute this and they structurally CANNOT]
- 📋 **Execution Steps:**
  1. [Step 1 with specific action]
  2. [Step 2 with deliverable]
  3. [Step 3 with timeline]
- 📈 **Expected Outcome:** [Measurable result — traffic, rankings, revenue]
- ⏱️ **Timeline:** [Weeks to impact]
- 💪 **Impact-to-Effort Ratio:** [High/Medium/Low] — [X/10 impact] / [Y/10 effort]
- 🏆 **Victory Condition:** [How you know this worked]

**🗡️ KILL MOVE #2-5:** [Repeat above format for 4 more Kill Moves]

### 3.3 Asymmetric Advantages
**Where your $1 beats their $10 — your unfair advantages:**

**MANDATORY TABLE:**
| Advantage | Your Investment | Their Cost to Match | Category | Moat Strength | Why They Can't Copy |
|-----------|----------------|---------------------|----------|---------------|---------------------|
| [Adv 1] | Low ($X) | 10x higher ($XX) | Content | 9/10 | [Structural reason] |
| [Adv 2] | Low | High | Authority | 8/10 | [Time barrier] |
| [Adv 3] | Med | Impossible | Brand | 10/10 | [Identity conflict] |

**ADDITIONAL DEPTH:**
- **Judo Strategy:** How to use competitors' size/momentum against them
- **Guerrilla Opportunities:** 3 unconventional attacks they won't see coming
- **Coalition Strategy:** Potential allies against dominant players

---

## 🌊 SECTION 4: BLUE OCEAN & MARKET OPPORTUNITIES (→ Charts: blueOceanOpportunitiesChart, marketOpportunityAnalysisChart)

### 4.1 Uncontested Market Space (ERRC Framework)
**MANDATORY: Generate 5+ Blue Ocean opportunities using this format:**

**🌊 OPPORTUNITY #1: [Compelling Name] — HIGHEST IMPACT**
- ❌ **ELIMINATE:** [Industry factor to remove entirely — and WHY it doesn't serve customers]
- ⬇️ **REDUCE:** [Factor to reduce below industry standard — saves cost, no impact on value]
- ⬆️ **RAISE:** [Factor to raise above industry standard — customers crave this]  
- ✨ **CREATE:** [New factor no one offers — your secret weapon]
- 📊 **Scoring:** Difficulty: X/10 | Impact: X/10 | Time to Market: [X weeks/months]
- 🎯 **Target Segment:** [Who benefits most from this combination]
- 💰 **Revenue Potential:** [$X/month or X% market share]
- 🏆 **Competitive Moat:** [Why competitors can't copy this combination]

**🌊 OPPORTUNITY #2-5:** [Repeat format for 4 more opportunities]

### 4.2 Market Opportunity Analysis
**Based on coreMarketProblem:** ${getField(data, 'coreMarketProblem')}

**MANDATORY OPPORTUNITY MATRIX:**
| # | Opportunity | Market Size | Competition Level | Timing Score | Brand Fit | Structural Barrier for Competitors | Priority |
|---|-------------|-------------|-------------------|--------------|-----------|-----------------------------------|----------|
| 1 | [Opp 1] | $X M/B | Low (2/10) | Perfect (9/10) | 9/10 | [They can't do this because...] | 🔥 NOW |
| 2 | [Opp 2] | $X M | Med (5/10) | Good (7/10) | 8/10 | [Size prevents them from...] | ⏰ Q2 |
| 3-5 | ... | ... | ... | ... | ... | ... | ... |

**ADDITIONAL ANALYSIS:**
- **Why Now:** The timing window for each opportunity and what closes it
- **Adjacent Markets:** Related markets you could dominate with same assets

### 4.3 Category of One Positioning
**MANDATORY FORMAT:**
- **Positioning Statement:** "We are the ONLY [category descriptor] that [unique benefit — be specific] for [audience + situation] who [desired outcome]"
- **Category Name:** [Create a new category you can own — e.g., "Strategic Intelligence Platform"]
- **Defensibility Analysis:** 
  - Why competitors can't copy this: [3 structural reasons]
  - Time advantage: [How long before they could match you]
  - Identity conflict: [Why copying would damage their brand]
- **Category Creation Roadmap:**
  1. [Month 1-2: Establish thought leadership with...]
  2. [Month 3-4: Create defining content with...]
  3. [Month 5-6: Lock in positioning with...]

### 4.4 The 10x Opportunity
**The ONE thing that would 10x your competitive position:**

**MANDATORY DEEP ANALYSIS:**
- 📍 **Opportunity:** [Clear, specific description — not generic]
- 🔍 **Evidence:** [Why this opportunity exists — market data, competitor gaps, trends]
- ⏰ **WHY NOW:** [Time-sensitive reasoning — what window is closing?]
- 🗺️ **Execution Path:**
  - Week 1-2: [Specific action + deliverable]
  - Week 3-4: [Next phase + milestone]
  - Month 2-3: [Scaling phase + expected results]
- 📈 **Expected Impact:** [Specific 10x outcome — traffic, revenue, authority]
- ⚠️ **Risk Factors:** [What could go wrong + mitigation]
- 💰 **Investment Required:** [Time, money, resources needed]

---

## 🎨 SECTION 5: BRAND POSITIONING & VALUE ARCHITECTURE (→ Charts: brandPositioningChart, valuePropositionMixChart)

### 5.1 Brand Positioning Matrix
**Based on brandArchetype:** ${getField(data, 'brandArchetype')}
**Brand Ideology:** ${getField(data, 'brandIdeology')}

**MANDATORY POSITIONING MATRIX:**
| Positioning Axis | ${getField(data, 'brandName')} | Competitor 1 | Competitor 2 | Market Average | Your Differentiation | Customer Impact |
|------------------|------|--------------|--------------|----------------|---------------------|-----------------|
| Tactical ←→ Strategic | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Why customers prefer this] |
| Commodity ←→ Premium | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Price/value justification] |
| Generic ←→ Specialized | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Expertise signal] |
| Reactive ←→ Proactive | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Trust builder] |
| Old-School ←→ Modern | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Relevance signal] |
| Corporate ←→ Human | X/10 | X/10 | X/10 | X/10 | [+X gap] | [Connection factor] |

**POSITIONING STRATEGY:**
- **Optimal Position:** [Where you should be on each axis and why]
- **Perception Gap:** [Current vs. desired positioning — what needs to change]
- **Repositioning Actions:** [Specific content/messaging to shift perception]

### 5.2 Value Proposition Architecture
**Based on UVP:** ${getField(data, 'uvp')}

**MANDATORY TABLE (5+ value propositions):**
| # | Value Prop Component | Appeal Score | Differentiation | Credibility | Clarity | Competitor Comparison | Proof Point |
|---|---------------------|--------------|-----------------|-------------|---------|----------------------|-------------|
| 1 | [Main value prop] | 9/10 | 9/10 | 8/10 | 9/10 | Beats [Competitor] on... | [Case study/data] |
| 2 | [Secondary prop] | 8/10 | 8/10 | 9/10 | 8/10 | [Unique to you] | [Testimonial] |
| 3-5 | ... | X/10 | X/10 | X/10 | X/10 | ... | ... |

**VALUE PROP HIERARCHY:**
- **Primary:** [The ONE thing you're known for]
- **Secondary:** [Supporting value props that reinforce primary]
- **Tertiary:** [Nice-to-haves that surprise and delight]

### 5.3 Unique Mechanism Definition
**MANDATORY FORMAT — This is your "secret sauce":**
- **Mechanism Name:** [Proprietary name — make it memorable and ownable, e.g., "The Moat Method™"]
- **One-Line Definition:** [10 words or less that capture the essence]
- **Full Explanation:** [2-3 paragraphs explaining HOW it works, not just WHAT it is]
- **3 Key Promises:**
  1. [Promise 1 + specific outcome + timeline]
  2. [Promise 2 + specific outcome + timeline]
  3. [Promise 3 + specific outcome + timeline]
- **Why It Works:** [The underlying principle that makes it effective]
- **Why Competitors Can't Copy:** [Structural advantage — expertise, data, process]
- **Visual Identity:** 
  - Primary metaphor: [Image/concept that represents your mechanism]
  - Supporting elements: [Icons, colors, diagrams that reinforce it]
  - Signature phrase: [The tagline customers will repeat]

---

## 📚 SECTION 6: CONTENT STRATEGY & PILLARS (→ Charts: strategicContentPillarsChart, contentFormatStrategyChart, contentPillarMindMap)

### 6.1 Strategic Content Pillars (6 Pillars × 5-6 Clusters × 6+ Keywords)
**Based on coreTopic:** ${getField(data, 'coreTopic')}
**Content Formats:** ${getField(data, 'contentFormats')}

**V7.21 ELITE MANDATORY REQUIREMENTS:**
✅ Generate EXACTLY 6 Content Pillars (MANDATORY — NO EXCEPTIONS)
✅ Each pillar MUST have 5-6 topic clusters (5 minimum aligned to funnel stages)
✅ Each cluster MUST have 6+ semantic keywords
✅ MINIMUM OUTPUT: 6 pillars × 5 clusters × 6 keywords = 180 keywords
✅ MAXIMUM OUTPUT: 6 pillars × 6 clusters × 8 keywords = 288 keywords
✅ ALL keywords MUST trace to competitor analysis from Section 3
✅ CLUSTERS MUST align to funnel stages: Awareness → Consideration → Decision → Retention → Advocacy

**PILLAR REQUIREMENT CHECKLIST (ALL 6 MANDATORY):**
- ✅ Pillar 1: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)
- ✅ Pillar 2: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)
- ✅ Pillar 3: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)
- ✅ Pillar 4: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)
- ✅ Pillar 5: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)
- ✅ Pillar 6: [Name] — 5-6 clusters × 6+ keywords each (MANDATORY)

**📚 PILLAR #1: [Pillar Name] — PRIMARY PILLAR**
- 📋 **Description:** [What this pillar covers — be specific about topics and angles]
- 📊 **Scoring:**
  - Audience Fit: X/10 | Competitive Gap: X/10 | Business Impact: X/10 | Moat Potential: X/10
- 🎯 **Target Audience Segment:** [Who specifically benefits from this pillar]
- 🏆 **Moat Potential:** [How this creates defensible advantage over time]
- 📊 **Primary Formats:** [Format 1 + why], [Format 2 + why]
- 🔗 **Strategic Rationale:**
  - **Solves:** [Specific pain from audiencePains — connect to Section 1]
  - **Challenges:** [Limiting belief it addresses — connect to Section 1.3]
  - **Instills:** [Empowering belief it creates]
  - **Fills Gap:** [Competitive gap it exploits — connect to Section 3]
- 📈 **Content Ideas:** [3 specific article/video titles within this pillar]
- 🔍 **SEO Opportunity:** [Target keywords + search volume potential]

**🎯 TOPIC CLUSTERS (5-6 per pillar — FUNNEL-ALIGNED):**

**CLUSTER 1.1: [Cluster Name] — 🌟 AWARENESS STAGE (TOFU)**
- 🎯 **Cluster Intent:** Attract beginners searching for foundational concepts
- 📊 **Cluster Score:** Priority X/10 | Competition X/10 | Volume X/10
- 🔑 **Semantic Keywords (6+ COMPETITOR-INFORMED):**
  | # | Keyword | Vol | KD | Intent | Competitor Source | Gap Type | Priority |
  |---|---------|-----|-----|--------|-------------------|----------|----------|
  | 1 | [keyword 1] | [vol] | [L/M/H] | [info/trans] | [Comp A] ranks #X | Content Depth | 🔥 |
  | 2 | [keyword 2] | [vol] | [L/M/H] | [intent] | [Comp B] missing | Blue Ocean | ⭐ |
  | 3 | [keyword 3] | [vol] | [L/M/H] | [intent] | [Comp C] weak at | Quality Gap | ⭐ |
  | 4 | [keyword 4] | [vol] | [L/M/H] | [intent] | No competitor | White Space | ⚡ |
  | 5 | [keyword 5] | [vol] | [L/M/H] | [intent] | [Source] | [Gap Type] | — |
  | 6 | [keyword 6] | [vol] | [L/M/H] | [intent] | [Source] | [Gap Type] | — |
- 📄 **Pillar Content:** [Main article idea that targets cluster 1.1]

**CLUSTER 1.2: [Cluster Name] — 🔍 CONSIDERATION STAGE (MOFU)**
- 🎯 **Cluster Intent:** Educate prospects comparing options and evaluating solutions
- 📊 **Cluster Score:** Priority X/10 | Competition X/10 | Volume X/10
- 🔑 **Semantic Keywords (6+ COMPETITOR-INFORMED):** [Table format as above with Competitor Source + Gap Type columns]
- 📄 **Pillar Content:** [Main article idea for this cluster]

**CLUSTER 1.3: [Cluster Name] — 💰 DECISION STAGE (BOFU)**
- 🎯 **Cluster Intent:** Convert prospects ready to act with purchase-intent content
- 📊 **Cluster Score:** Priority X/10 | Competition X/10 | Volume X/10
- 🔑 **Semantic Keywords (6+ COMPETITOR-INFORMED):** [Table format as above]
- 📄 **Pillar Content:** [Main article idea for this cluster]

**CLUSTER 1.4: [Cluster Name] — 🔄 RETENTION STAGE (POST-PURCHASE)**
- 🎯 **Cluster Intent:** Retain customers with advanced usage and optimization content
- 📊 **Cluster Score:** Priority X/10 | Competition X/10 | Volume X/10
- 🔑 **Semantic Keywords (6+ COMPETITOR-INFORMED):** [Table format as above]
- 📄 **Pillar Content:** [Main article idea for this cluster]

**CLUSTER 1.5: [Cluster Name] — 📣 ADVOCACY STAGE (REFERRAL)**
- 🎯 **Cluster Intent:** Transform customers into advocates with shareable, expert-level content
- 📊 **Cluster Score:** Priority X/10 | Competition X/10 | Volume X/10
- 🔑 **Semantic Keywords (6+ COMPETITOR-INFORMED):** [Table format as above]
- 📄 **Pillar Content:** [Main article idea for this cluster]

**CLUSTER 1.6:** [OPTIONAL — Additional specialized cluster if highly relevant]

**📚 PILLAR #2: [Pillar Name]** [MANDATORY — Repeat FULL format: 5-6 funnel-aligned clusters × 6+ keywords each]
**📚 PILLAR #3: [Pillar Name]** [MANDATORY — Repeat FULL format: 5-6 funnel-aligned clusters × 6+ keywords each]
**📚 PILLAR #4: [Pillar Name]** [MANDATORY — Repeat FULL format: 5-6 funnel-aligned clusters × 6+ keywords each]
**📚 PILLAR #5: [Pillar Name]** [MANDATORY — Repeat FULL format: 5-6 funnel-aligned clusters × 6+ keywords each]
**📚 PILLAR #6: [Pillar Name]** [MANDATORY — Repeat FULL format: 5-6 funnel-aligned clusters × 6+ keywords each]

**KEYWORD SOURCE LEGEND (from Section 3 Competitive Warfare):**
| Source Code | Meaning | Strategic Value |
|-------------|---------|-----------------|
| [Comp] ranks #X | Competitor ranks well, we can outrank | High — proven demand |
| [Comp] missing | Competitor doesn't target this keyword | Blue Ocean opportunity |
| [Comp] weak at | Competitor has thin/poor content | Quality gap exploitation |
| No competitor | Uncontested keyword territory | White space capture |
| Long-tail of [Comp] | Derivative of competitor head term | Low competition entry |

**PILLAR ARCHITECTURE SUMMARY (6×5×6 = 180+ KEYWORDS MINIMUM):**
| Pillar | Clusters | Total Keywords | Content Pieces | Competitive Gap | Moat Score | Funnel Coverage | Priority |
|--------|----------|----------------|----------------|-----------------|------------|-----------------|----------|
| #1 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | 🔥 #1 |
| #2 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | ⭐ #2 |
| #3 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | #3 |
| #4 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | #4 |
| #5 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | #5 |
| #6 [Name] | 5-6 | 30-48 | [X pillar + Y supporting] | X/10 | X/10 | ✅ All 5 stages | #6 |
| **TOTAL** | **30-36** | **180-288** | **[Total pieces]** | — | — | — | — |

**FUNNEL STAGE DISTRIBUTION (per pillar):**
| Stage | Cluster Type | Intent Focus | Content Format | Keywords/Cluster |
|-------|--------------|--------------|----------------|------------------|
| 🌟 Awareness (TOFU) | 1.1, 2.1, 3.1... | Informational | Guides, How-tos | 6+ |
| 🔍 Consideration (MOFU) | 1.2, 2.2, 3.2... | Comparative | Comparisons, Reviews | 6+ |
| 💰 Decision (BOFU) | 1.3, 2.3, 3.3... | Transactional | Landing pages, Demos | 6+ |
| 🔄 Retention | 1.4, 2.4, 3.4... | Educational | Advanced guides, Tips | 6+ |
| 📣 Advocacy | 1.5, 2.5, 3.5... | Community | Case studies, Success | 6+ |

### 6.2 Content Format Strategy
**Based on primaryChannels:** ${getField(data, 'primaryChannels')}

**MANDATORY CONTENT FORMAT MATRIX:**
| # | Format | Fit Score | Competitive Gap | Audience Demand | Feasibility | ROI Potential | Priority | Example Content |
|---|--------|-----------|-----------------|-----------------|-------------|---------------|----------|-----------------|
| 1 | Long-form Guides | 9/10 | 8/10 (competitors do superficial) | 9/10 | 7/10 | High | 🔥 #1 | "[Topic] Ultimate Guide" |
| 2 | Video Tutorials | 8/10 | 9/10 (no video content) | 8/10 | 5/10 | High | #2 | "How to [Outcome]" |
| 3-6 | ... | X/10 | X/10 | X/10 | X/10 | Med/High | #X | ... |

**FORMAT-CHANNEL ALIGNMENT:**
| Channel | Best Format | Why This Combination | Competitor Weakness | Posting Cadence |
|---------|-------------|---------------------|---------------------|-----------------|
| [Channel 1] | [Format] | [Reasoning] | [Gap to exploit] | [X per week/month] |

### 6.3 Content Moat Construction
**MANDATORY DEPTH ANALYSIS:**
- **Topics to Own (3-5):**
  | Topic | Current Authority | Competitor Authority | Time to #1 | Required Depth | Unique Angle |
  |-------|-------------------|---------------------|------------|----------------|--------------|
  | [Topic 1] | 4/10 | [Competitor] 7/10 | 6 months | 5,000+ words | [Your unique take] |

- **Depth Strategy:** 
  - Word count requirements: [X words minimum for pillar content]
  - Research level: [Original data, expert interviews, case studies]
  - Unique data: [What proprietary information you can add]
  - Update frequency: [How often to refresh for freshness signals]

- **Distribution Moat:**
  - Channel advantages from competitor analysis: [Where they're absent]
  - Email list strategy: [Owned audience building]
  - Community building: [Where to create defensible audience]

### 6.4 Content Pillar Mind Map Data (JSON)
**V7.21 ELITE MANDATORY: Generate structured JSON for hierarchical mind map visualization (6×5×6 = 180+ keywords):**
\`\`\`json
{
  "contentPillarMindMap": {
    "center": "${getField(data, 'coreTopic')}",
    "totalPillars": 6,
    "totalClusters": 30,
    "totalKeywords": 180,
    "funnelStages": ["awareness", "consideration", "decision", "retention", "advocacy"],
    "pillars": [
      {
        "id": 1,
        "name": "[Pillar 1 Name]",
        "moatScore": 8.5,
        "competitiveGap": 7,
        "funnelCoverage": "complete",
        "clusters": [
          {
            "id": "1.1",
            "name": "[Cluster 1.1 Name]",
            "funnelStage": "awareness",
            "intent": "informational",
            "priority": 9,
            "keywords": [
              {"keyword": "[kw1]", "volume": "[vol]", "kd": "L/M/H", "source": "[Competitor]", "gap": "content depth", "priority": "high"},
              {"keyword": "[kw2]", "volume": "[vol]", "kd": "L/M/H", "source": "blue ocean", "gap": "none", "priority": "high"},
              {"keyword": "[kw3]", "volume": "[vol]", "kd": "L/M/H", "source": "[Competitor]", "gap": "quality", "priority": "medium"},
              {"keyword": "[kw4]", "volume": "[vol]", "kd": "L/M/H", "source": "white space", "gap": "none", "priority": "medium"},
              {"keyword": "[kw5]", "volume": "[vol]", "kd": "L/M/H", "source": "[Competitor]", "gap": "thin content", "priority": "low"},
              {"keyword": "[kw6]", "volume": "[vol]", "kd": "L/M/H", "source": "[Competitor]", "gap": "outdated", "priority": "low"}
            ]
          },
          {"id": "1.2", "name": "[Cluster 1.2 Name]", "funnelStage": "consideration", "intent": "comparative", "priority": 8, "keywords": ["...6+ keywords with full metadata..."]},
          {"id": "1.3", "name": "[Cluster 1.3 Name]", "funnelStage": "decision", "intent": "transactional", "priority": 8, "keywords": ["...6+ keywords with full metadata..."]},
          {"id": "1.4", "name": "[Cluster 1.4 Name]", "funnelStage": "retention", "intent": "educational", "priority": 7, "keywords": ["...6+ keywords with full metadata..."]},
          {"id": "1.5", "name": "[Cluster 1.5 Name]", "funnelStage": "advocacy", "intent": "community", "priority": 6, "keywords": ["...6+ keywords with full metadata..."]}
        ]
      },
      {"id": 2, "name": "[Pillar 2 Name]", "moatScore": 8.0, "funnelCoverage": "complete", "clusters": ["...5-6 funnel-aligned clusters with 6+ keywords each..."]},
      {"id": 3, "name": "[Pillar 3 Name]", "moatScore": 7.5, "funnelCoverage": "complete", "clusters": ["...5-6 funnel-aligned clusters with 6+ keywords each..."]},
      {"id": 4, "name": "[Pillar 4 Name]", "moatScore": 7.0, "funnelCoverage": "complete", "clusters": ["...5-6 funnel-aligned clusters with 6+ keywords each..."]},
      {"id": 5, "name": "[Pillar 5 Name]", "moatScore": 6.5, "funnelCoverage": "complete", "clusters": ["...5-6 funnel-aligned clusters with 6+ keywords each..."]},
      {"id": 6, "name": "[Pillar 6 Name]", "moatScore": 6.0, "funnelCoverage": "complete", "clusters": ["...5-6 funnel-aligned clusters with 6+ keywords each..."]}
    ]
  }
}
\`\`\`

---

## 🏗️ SECTION 7: STRATEGIC MOAT ARCHITECTURE (→ Supports all competitive charts)

### 7.1 Content Moat Analysis
**MANDATORY TABLE — Topics to dominate:**
| # | Topic | Current Authority | Time to Moat | Depth Required | Content Pieces Needed | Competitor Threat | Defense Strategy |
|---|-------|-------------------|--------------|----------------|----------------------|-------------------|------------------|
| 1 | [Topic 1] | 3/10 | 4 months | 10,000+ words across 5 pieces | 5 comprehensive guides | [Competitor] at 6/10 | Outpace with... |
| 2 | [Topic 2] | 5/10 | 2 months | 5,000+ words | 3 in-depth articles | Low threat | Defend with... |
| 3-5 | ... | X/10 | X months | ... | ... | ... | ... |

**DEPTH REQUIREMENTS MATRIX:**
| Content Type | Word Count | Research Level | Unique Data Required | Update Frequency | Moat Strength |
|--------------|------------|----------------|---------------------|------------------|---------------|
| Pillar Pages | 7,000+ | Expert interviews + original research | Yes - surveys/data | Quarterly | 9/10 |
| Supporting Content | 2,500+ | Industry benchmarks | Preferred | Bi-annually | 6/10 |
| Comparison Pages | 3,000+ | First-hand testing | Yes - screenshots/videos | Monthly | 8/10 |

### 7.2 Authority Moat Strategy
**Based on authorBio:** ${getField(data, 'authorBio')}

**CREDIBILITY BUILDING ROADMAP:**
| Timeline | Credibility Signal | Current Status | Target | Action | Competitor Comparison |
|----------|-------------------|----------------|--------|--------|----------------------|
| Month 1-2 | Guest posts on authority sites | 0 | 3 | Pitch [Site 1], [Site 2] | [Competitor] has 5 |
| Month 2-3 | Podcast appearances | 1 | 5 | Book [Show 1], [Show 2] | Outpace [Competitor] |
| Month 3-6 | Speaking engagements | 0 | 2 | Apply to [Conference] | Match [Competitor] |
| Ongoing | Media mentions | 2 | 10 | HARO + journalist outreach | Surpass [Competitor] |

**E-E-A-T PRIORITY MATRIX:**
| Signal | Current Score | Target Score | Gap | Priority Action | Timeline |
|--------|---------------|--------------|-----|-----------------|----------|
| Experience | 6/10 | 9/10 | +3 | Add case studies, behind-the-scenes | Week 1-4 |
| Expertise | 7/10 | 9/10 | +2 | Publish original research | Month 1-2 |
| Authoritativeness | 5/10 | 8/10 | +3 | Backlinks from .edu/.gov | Month 2-6 |
| Trustworthiness | 6/10 | 9/10 | +3 | Reviews, testimonials, certifications | Ongoing |

### 7.3 Distribution Moat Plan
**CHANNEL DOMINATION STRATEGY:**
| # | Channel | Current Presence | Competitor Presence | Opportunity Score | First-Mover Window | Investment Required | Priority |
|---|---------|------------------|--------------------|--------------------|-------------------|---------------------|----------|
| 1 | [Channel 1] | Low | None | 10/10 | 6 months | $X/month | 🔥 Immediate |
| 2 | [Channel 2] | Medium | Weak | 8/10 | 3 months | $Y/month | High |
| 3-5 | ... | ... | ... | X/10 | ... | ... | ... |

**DISTRIBUTION BLIND SPOTS TO EXPLOIT:**
- [Competitor 1]: Missing from [Channel] — capture their audience by...
- [Competitor 2]: Weak on [Platform] — outflank with [Strategy]
- [Competitor 3]: No email list — build owned audience advantage

### 7.4 Brand Moat Construction
**POSITIONING NO ONE ELSE CAN CLAIM:**
- **Unique Angle:** [The ONE thing that makes you impossible to copy]
- **Why Competitors Can't Match:**
  1. [Structural barrier 1 — e.g., expertise takes years]
  2. [Structural barrier 2 — e.g., conflicts with their positioning]
  3. [Structural barrier 3 — e.g., requires investments they won't make]

**EMOTIONAL CONNECTION STRATEGY:**
| Connection Type | Current Status | Target | How to Build | Competitor Weakness |
|-----------------|----------------|--------|--------------|---------------------|
| Trust | 6/10 | 9/10 | [Specific actions] | [They're corporate] |
| Relatability | 5/10 | 8/10 | [Behind-the-scenes content] | [They're faceless] |
| Community | 3/10 | 7/10 | [Slack/Discord/Newsletter] | [No community] |

**COMMUNITY BUILDING PATH:**
- Month 1-2: [Launch newsletter/group]
- Month 3-4: [Engage with first 100 members]
- Month 5-6: [User-generated content program]
- Month 6+: [Community becomes self-sustaining moat]

### 7.5 Pillar-Cluster-Keyword Moat Matrix
**MANDATORY: Connect Section 7 directly to Section 6 Content Pillars:**

| Pillar (from S6) | Priority Cluster | 6 Semantic KWs | Time to Moat | Content Format | Depth Required | Moat Strength |
|------------------|------------------|----------------|--------------|----------------|----------------|---------------|
| [Pillar #1 Name] | [Cluster 1.1] | [KW1, KW2, KW3, KW4, KW5, KW6] | 3 months | Ultimate Guide Series | 10,000+ words | 9/10 |
| [Pillar #2 Name] | [Cluster 2.2] | [KW1, KW2, KW3, KW4, KW5, KW6] | 4 months | Video + Written | 8,000+ words | 8/10 |
| [Pillar #3 Name] | [Cluster 3.1] | [KW1, KW2, KW3, KW4, KW5, KW6] | 2 months | Comparison Hub | 6,000+ words | 8/10 |
| [Pillar #4 Name] | [Cluster 4.3] | [KW1, KW2, KW3, KW4, KW5, KW6] | 5 months | Resource Library | 12,000+ words | 9/10 |
| [Pillar #5 Name] | [Cluster 5.2] | [KW1, KW2, KW3, KW4, KW5, KW6] | 3 months | Case Study Series | 7,000+ words | 7/10 |

**FOR EACH PILLAR — STRATEGIC MOAT ANALYSIS:**

**🏗️ PILLAR #1: [Name] → MOAT STRATEGY:**
- **How This Pillar Creates Defensible Moat:** [Specific strategy — proprietary data, unique expertise, community, etc.]
- **Priority Clusters for Ownership:** [Cluster 1.1] > [Cluster 1.2] — start with awareness, then consideration
- **Semantic Keyword Ownership Strategy:** Target [X] keywords at [Volume] total SV; focus on [Intent type] first
- **Content Format for Moat Building:** [Format] because [competitive advantage it creates]
- **Timeline to Category Ownership:** [X months] — milestones: Month 1 [X], Month 2 [X], Month 3 [X]
- **Competitor Displacement Plan:** [How you'll outrank current authority holders]

**🏗️ PILLAR #2-5: [Repeat same depth for each pillar]**

**PILLAR PRIORITY RANKING FOR MOAT BUILDING:**
| Rank | Pillar | Why First | Resources Needed | Expected Moat Impact |
|------|--------|-----------|------------------|---------------------|
| 1 | [Pillar X] | [Strategic reason — lowest competition, highest brand fit, etc.] | [Hours/budget] | 10/10 |
| 2 | [Pillar Y] | [Reason] | [Resources] | 9/10 |
| 3-5 | ... | ... | ... | X/10 |

---

## 📋 SECTION 8: ACTION PLAN & EXECUTION ROADMAP (→ Chart: priorityFocusMatrixChart)

### 8.1 Priority Focus Matrix (Next 90 Days)
**Based on quarterlyObjective:** ${getField(data, 'quarterlyObjective')}

**MANDATORY: Generate 10+ prioritized initiatives — EACH MUST trace back to source section:**
| # | Initiative | Source Section | Kill Move/Pillar/Cluster/Moat | Category | Impact | Effort | Speed | Timeline | Owner | Risk |
|---|------------|----------------|-------------------------------|----------|--------|--------|-------|----------|-------|------|
| 1 | [Top priority action] | Section 3.2 Kill Move #1 | Target: [Competitor] | Content | 10/10 | 3/10 | 9/10 | Week 1-2 | [Role] | Low |
| 2 | [Content initiative] | Section 6 Pillar #1, Cluster 1.1 | Own: [6 Keywords from cluster] | Content | 9/10 | 4/10 | 8/10 | Week 1-3 | [Role] | Low |
| 3 | [Moat initiative] | Section 7 Content Moat | Dominate: [Topic from S7] | Authority | 9/10 | 5/10 | 7/10 | Week 2-4 | [Role] | Med |
| 4 | [Technical quick win] | Section 5.1 Positioning | Claim: [Market Position from S5] | Technical | 8/10 | 2/10 | 10/10 | Week 1 | [Role] | Low |
| 5 | [Authority initiative] | Section 7.2 E-E-A-T | Build: [Credibility Signal from S7] | Authority | 8/10 | 6/10 | 6/10 | Week 3-6 | [Role] | Med |
| 6 | [Audience insight] | Section 1.3 Beliefs | Address: [Limiting Belief from S1] | Content | 8/10 | 3/10 | 8/10 | Week 2-3 | [Role] | Low |
| 7 | [Distribution moat] | Section 7.3 Distribution | Capture: [Channel from S7] | Distribution | 7/10 | 4/10 | 7/10 | Week 3-5 | [Role] | Med |
| 8 | [Black hole capture] | Section 12 Semantic Galaxy | Fill: [Black Hole Topic from S12] | Content | 7/10 | 5/10 | 6/10 | Week 4-6 | [Role] | Low |
| 9 | [Competitor weakness] | Section 3.4 Vulnerability Map | Exploit: [Weakness from S3] | Competitive | 7/10 | 4/10 | 7/10 | Week 4-8 | [Role] | Med |
| 10 | [Brand moat] | Section 7.4 Brand Moat | Build: [Emotional Connection from S7] | Brand | 6/10 | 6/10 | 5/10 | Week 6-12 | [Role] | High |

**SOURCE SECTION LEGEND:**
- **S1** = Customer Intelligence (pains, beliefs, desires)
- **S3** = Competitive Landscape (kill moves, vulnerabilities)
- **S5** = Brand Positioning (unique mechanism, positioning)
- **S6** = Content Pillars (pillars, clusters, keywords)
- **S7** = Strategic Moat (content moat, authority, distribution)
- **S12** = Semantic Galaxy (information black holes) |

**IMPACT-EFFORT QUADRANT SUMMARY:**
- 🔥 **Do First (High Impact, Low Effort):** [List initiatives]
- 📈 **Big Projects (High Impact, High Effort):** [List initiatives]
- ⚡ **Quick Wins (Low Impact, Low Effort):** [List if time permits]
- ❌ **Deprioritize (Low Impact, High Effort):** [Don't do these now]

### 8.2 Week 1 Quick Wins (Do THIS WEEK)
**MANDATORY: 5+ specific actions with time estimates:**

**DAY 1-2:**
1. 🎯 **[Specific action]**
   - Expected Result: [Measurable outcome]
   - Effort: [X hours]
   - Why First: [Strategic reason]

2. 🎯 **[Second action]**
   - Expected Result: [Outcome]
   - Effort: [X hours]

**DAY 3-5:**
3. 🎯 **[Third action]**
   - Expected Result: [Outcome]
   - Effort: [X hours]

4-5. 🎯 **[Continue pattern]**

### 8.3 30-Day Milestones
**MANDATORY MILESTONE TABLE:**
| # | Milestone | Success Metric | Current Baseline | Target | Dependencies | Risk Level | Fallback Plan |
|---|-----------|----------------|------------------|--------|--------------|------------|---------------|
| 1 | [Milestone 1] | [Specific KPI] | [Current value] | [Target value] | [What's needed] | Low | [If blocked, do...] |
| 2 | [Milestone 2] | [KPI] | [Baseline] | [Target] | [Prereqs] | Med | [Backup plan] |
| 3-5 | ... | ... | ... | ... | ... | ... | ... |

**30-DAY CHECKPOINT CRITERIA:**
- ✅ Must have achieved: [Non-negotiables]
- 🎯 Should have achieved: [Stretch goals]
- 📊 Metrics to review: [KPIs to check]

### 8.4 90-Day Strategic Outcomes
**Based on northStarKpis:** ${getField(data, 'northStarKpis')}

**CONTENT MILESTONE:**
| Metric | Current | Day 30 Target | Day 60 Target | Day 90 Target | Strategy |
|--------|---------|---------------|---------------|---------------|----------|
| Pieces Published | X | +Y | +Z | +W | [Content cadence] |
| Organic Traffic | X | +Y% | +Z% | +W% | [SEO focus] |
| Email Subscribers | X | +Y | +Z | +W | [Lead magnets] |

**AUTHORITY MILESTONE:**
| Metric | Current | Day 30 | Day 60 | Day 90 | Strategy |
|--------|---------|--------|--------|--------|----------|
| Referring Domains | X | +Y | +Z | +W | [Link building] |
| Brand Mentions | X | +Y | +Z | +W | [PR/outreach] |
| Social Following | X | +Y | +Z | +W | [Growth tactics] |

**REVENUE MILESTONE:**
| Metric | Current | Day 30 | Day 60 | Day 90 | Strategy |
|--------|---------|--------|--------|--------|----------|
| Leads Generated | X | +Y | +Z | +W | [Conversion] |
| Pipeline Value | $X | +$Y | +$Z | +$W | [Sales enablement] |
| Revenue | $X | +$Y | +$Z | +$W | [Monetization] |

---

## 🔬 SECTION 9: FORENSIC INTELLIGENCE — AEO CITATION ANALYSIS (→ Chart: aeoAnalysisChart)

### 9.1 Algorithmic Cite-ability Scores
**Purpose:** Predict which competitors AI models (ChatGPT, Gemini, Perplexity) will cite as authoritative sources.

**📊 CITE-ABILITY CALCULATION FORMULA:**
| Component | Weight | Calculation | Score Range |
|-----------|--------|-------------|-------------|
| Entity Density | 25% | (Named entities per 1000 words) / 50 × 10 | 0-10 |
| Schema Coverage | 20% | (Schema types present / 8 core types) × 10 | 0-10 |
| Content Quality | 20% | (Avg word count / 2000) × (Readability score / 10) | 0-10 |
| Freshness Signal | 15% | 10 - (Avg days since update / 180) capped | 0-10 |
| FAQ Presence | 10% | (Pages with FAQ schema / Total pages) × 10 | 0-10 |
| Semantic Triplets | 10% | (Subject-Verb-Object patterns / 1000 words) / 5 × 10 | 0-10 |

**Final Cite-ability Score = Σ(Component × Weight) / 10 → Range: 0.00 - 1.00**
- **HIGH (0.70+):** AI models will frequently cite this source
- **MEDIUM (0.50-0.69):** Occasional citations, can be displaced
- **LOW (<0.50):** Rarely cited, major opportunity to out-cite

**MANDATORY: Analyze ALL competitors from forensic data:**
| # | Competitor | Domain | Entity (25%) | Schema (20%) | Content (20%) | Fresh (15%) | FAQ (10%) | Triplets (10%) | **Cite-ability** | Tier |
|---|------------|--------|-------------|--------------|---------------|-------------|-----------|----------------|------------------|------|
| 1 | [Comp 1] | [domain.com] | 8/10 | 7/10 | 9/10 | 6/10 | 8/10 | 7/10 | **0.76** | HIGH |
| 2 | [Comp 2] | [domain.com] | 6/10 | 5/10 | 7/10 | 5/10 | 6/10 | 5/10 | **0.58** | MED |
| 3 | [Comp 3] | [domain.com] | 4/10 | 3/10 | 5/10 | 4/10 | 2/10 | 3/10 | **0.37** | LOW |
| 4+ | [All others from data] | ... | X/10 | X/10 | X/10 | X/10 | X/10 | X/10 | **0.XX** | ... |

**YOUR GAP ANALYSIS:**
| Component | Your Score | Leader Score | Gap | Quick Win? | Fix Timeline |
|-----------|------------|--------------|-----|------------|--------------|
| Entity Density | X/10 | X/10 | -X | [Y/N] | [X days] |
| Schema Coverage | X/10 | X/10 | -X | [Y/N] | [X hours] |
| Content Quality | X/10 | X/10 | -X | [Y/N] | [X weeks] |
| Freshness Signal | X/10 | X/10 | -X | [Y/N] | [X days] |
| FAQ Presence | X/10 | X/10 | -X | [Y/N] | [X hours] |
| Semantic Triplets | X/10 | X/10 | -X | [Y/N] | [X weeks] |

**COMPETITIVE CITE-ABILITY RANKING:**
- **Most Cited by AI:** [Domain] — Why: [Reason]
- **Rising Threat:** [Domain] — Why: [Trend]
- **Easiest to Out-Cite:** [Domain] — Why: [Vulnerability]

### 9.2 AEO Opportunity Matrix
**MANDATORY TABLES:**

**Information Black Holes (Topics NO competitor covers adequately):**
| # | Topic | Search Volume | Best Current Coverage | Gap Level | AI Citation Opportunity | Priority |
|---|-------|---------------|----------------------|-----------|------------------------|----------|
| 1 | [Topic] | [X K/mo] | [Competitor Y — superficial] | Severe | HIGH — 90% capture potential | 🔥 NOW |
| 2-5 | ... | ... | ... | ... | ... | ... |

**Schema Gaps (High-value structured data competitors lack):**
| Schema Type | Competitors With | Competitors Without | Opportunity | Implementation Effort |
|-------------|------------------|--------------------|--------------|-----------------------|
| FAQ Schema | 2 of 5 | 3 of 5 | High | Low (2 hours) |
| How-To Schema | 1 of 5 | 4 of 5 | Very High | Medium (4 hours) |
| Review Schema | 3 of 5 | 2 of 5 | Medium | Low (1 hour) |

**FAQ Opportunities (Questions competitors fail to answer definitively):**
| # | Question | Current Best Answer | Why It Fails | Your Opportunity |
|---|----------|--------------------|--------------|--------------------|
| 1 | [Question] | [Competitor X] | [Generic/outdated/incomplete] | [Your definitive answer angle] |

### 9.3 AEO Action Plan
**IMMEDIATE ACTIONS (Week 1):**
1. 🎯 **Top Content Priority:** [Specific content piece to create for maximum AI citation capture]
   - Topic: [Specific topic]
   - Format: [FAQ page / Ultimate guide / etc.]
   - Expected Citation Capture: [% of AI queries]
   
2. 🎯 **Schema Deployment:** 
   - Add: [Specific schema types]
   - Pages: [Which pages to add them to]
   - Timeline: [Hours to implement]

3. 🎯 **Entity Optimization:**
   - Entities to claim: [List 3-5 entities]
   - How to claim: [Wikipedia mentions, Knowledge Graph, etc.]

**FRESHNESS STRATEGY:**
| Content Type | Update Frequency | Trigger Events | Competitor Freshness |
|--------------|------------------|-----------------|---------------------|
| Core pillar pages | Monthly | [Industry news, algorithm updates] | [Competitor X updates quarterly] |
| FAQs | Weekly | [New questions from users] | [Competitors rarely update] |

---

## 💰 SECTION 10: FORENSIC INTELLIGENCE — DIGITAL ASSET VALUATION (→ Chart: assetValuationChart)

### 10.1 Competitive Asset Valuations
**Purpose:** Quantify the organic trust value and replacement cost of competitor digital assets. This is CFO-ready evidence for investment decisions.

**📊 CALCULATION FORMULAS:**
| Metric | Formula | Example |
|--------|---------|---------|
| Annual Traffic Value (ATV) | Monthly Organic Traffic × Avg CPC × 12 | 50,000 × $2.50 × 12 = $1.5M/yr |
| Organic Trust Value (OTV) | ATV × Moat Multiplier | $1.5M × 2.0x = $3.0M |
| Build Cost Estimate (BCE) | Content Cost + Link Cost + Time Cost | ($500 × 200 pages) + ($200 × 500 links) + ($100/hr × 2000 hrs) |
| Moat Multiplier | 1.0 + (Brand Score/10) + (Link Diversity/10) | 1.0 + 0.6 + 0.4 = 2.0x |
| Years to Replicate | Log(Their DA) / Log(Industry Growth Rate) | Log(75) / Log(1.15) = 12.5 years compressed to 5 with investment |
| ROI of Attack | (Their Capturable Traffic × CPC) / Your Investment | (10,000 × $2.50) / $5,000 = 5x ROI |

**MANDATORY: Value ALL competitors from forensic data:**
| # | Competitor | Domain | Monthly Traffic | Avg CPC | ATV Calculation | Organic Trust Value | Moat Multiplier | Build Cost Estimate | Acquisition Target? |
|---|------------|--------|----------------:|--------:|-----------------|--------------------:|-----------------|--------------------:|---------------------|
| 1 | [Leader] | [domain.com] | 40K | $3.00 | 40K×$3×12=$1.44M | $2.4M | 1.7x | $3.2M | No — too expensive |
| 2 | [Comp 2] | [domain.com] | 18K | $2.20 | 18K×$2.2×12=$475K | $850K | 1.8x | $980K | Consider |
| 3 | [Comp 3] | [domain.com] | 8K | $2.00 | 8K×$2×12=$192K | $320K | 1.7x | $280K | Yes — undervalued |
| 4+ | [All others] | ... | XK | $X.XX | Calculation | $XXX K | X.Xx | $XXX K | ... |

**MOAT MULTIPLIER BREAKDOWN:**
| Component | Weight | [Comp 1] | [Comp 2] | [Comp 3] | Your Score |
|-----------|--------|----------|----------|----------|------------|
| Brand Recognition | 0.3x | 0.24 | 0.18 | 0.09 | 0.XX |
| Link Diversity | 0.3x | 0.21 | 0.15 | 0.12 | 0.XX |
| Content Depth | 0.2x | 0.16 | 0.12 | 0.08 | 0.XX |
| Schema Coverage | 0.1x | 0.08 | 0.05 | 0.03 | 0.XX |
| E-E-A-T Signals | 0.1x | 0.07 | 0.05 | 0.03 | 0.XX |
| **Total Multiplier** | **1.0x base + sum** | **1.76x** | **1.55x** | **1.35x** | **X.XXx** |

### 10.2 CFO Evidence Pack Summary
**MARKET INTELLIGENCE FOR LEADERSHIP:**

**Total Competitive Market Value:**
| Metric | Value | Your Share | Opportunity |
|--------|-------|------------|-------------|
| Combined Organic Trust Value | $X.XM | X% | Capture $X from [Competitor] |
| Combined Annual Traffic Value | $X.XM | X% | Grow to $X by [date] |
| Total Referring Domains | X,XXX | X% | Need +X to match leader |

**Market Share Distribution:**
| Competitor | Value Share | Traffic Share | Authority Share | Trend |
|------------|-------------|---------------|-----------------|-------|
| [Leader] | 45% | 50% | 55% | ➡️ Stable |
| [Comp 2] | 25% | 22% | 20% | ⬆️ Growing |
| [You] | 10% | 8% | 5% | 🎯 Target 20% |
| [Others] | 20% | 20% | 20% | ⬇️ Declining |

**Acquisition Cost vs. Build Cost Analysis:**
| Target | Acquisition Cost | Build Cost | Time to Build | ROI Recommendation |
|--------|------------------|------------|---------------|---------------------|
| [Domain 1] | $1.2M | $800K | 3 years | Build — 30% savings + control |
| [Domain 2] | $400K | $600K | 2 years | Acquire — faster ROI |

### 10.3 Value Capture Strategy
**MANDATORY STRATEGIC ACTIONS:**

**🎯 ERODE HIGHEST-VALUE COMPETITOR:**
- Target: [Highest-value domain from analysis]
- Their Key Asset: [What makes them valuable]
- Erosion Strategy: [Specific content/link/brand actions to capture their value]
- Timeline: [X months to capture X% of their value]
- Investment Required: [$X or X hours/week]

**🏗️ MOAT REPLICATION:**
- Target Moat Multiplier: [Current X.Xx → Target Y.Yx]
- Actions to Increase Moat:
  1. [Action 1 — e.g., proprietary data]
  2. [Action 2 — e.g., community building]
  3. [Action 3 — e.g., brand recognition]
- Timeline: [X months to achieve]

**📈 ASSET BUILDING PRIORITY:**
| Priority | Asset Type | Current Value | Target Value | Action | ROI |
|----------|------------|---------------|--------------|--------|-----|
| 1 | Content Library | $X K | $X K | [Publish X pieces] | High |
| 2 | Backlink Profile | $X K | $X K | [Build X links] | Medium |
| 3 | Brand Recognition | $X K | $X K | [PR + thought leadership] | High |

---

## ⚠️ SECTION 11: FORENSIC INTELLIGENCE — BRITTLENESS PREDICTION (→ Chart: brittlenessRiskChart)

### 11.1 Core Update Vulnerability Analysis
**Purpose:** Predict which competitors will collapse in the next Google Core Update. Position content BEFORE the update to capture their traffic.

**📊 BRITTLENESS SCORE CALCULATION:**
| Risk Factor | Weight | Calculation | High Risk Threshold |
|-------------|--------|-------------|---------------------|
| Thin Content % | 25% | (Pages <500 words / Total pages) × 100 | >20% |
| E-E-A-T Score | 20% | (10 - E-E-A-T signals present) × 10 | Score <5 |
| Anchor Text Risk | 20% | (Exact match anchors / Total anchors) × 100 | >30% |
| Content Staleness | 15% | (Pages >12mo old / Total pages) × 100 | >40% |
| Link Velocity Risk | 10% | Spike detection: (Recent links / Avg monthly) | >3x normal |
| Technical Debt | 10% | (Core Web Vitals fails + Mobile issues) × 5 | >50 issues |

**Brittleness Score = Σ(Risk Factor × Weight) → Range: 0-100**
- **🔴 HIGH (70-100):** 50%+ traffic drop expected — STRIKE NOW
- **🟡 MODERATE (40-69):** 20-30% drop possible — PREPARE
- **🟢 STABLE (0-39):** Resilient — focus elsewhere

**MANDATORY: Analyze ALL competitors from forensic data:**
| # | Competitor | Thin (25%) | E-E-A-T (20%) | Anchor (20%) | Stale (15%) | Velocity (10%) | Tech (10%) | **Brittleness** | Risk |
|---|------------|------------|---------------|--------------|-------------|----------------|------------|-----------------|------|
| 1 | [High Risk] | 35% (8.8) | 4/10 (12) | 40% (8) | 50% (7.5) | 2x (5) | 30 (3) | **78/100** | 🔴 |
| 2 | [Moderate] | 15% (3.8) | 6/10 (8) | 25% (5) | 30% (4.5) | 1x (0) | 15 (1.5) | **55/100** | 🟡 |
| 3 | [Stable] | 5% (1.3) | 8/10 (4) | 10% (2) | 10% (1.5) | 0.5x (0) | 5 (0.5) | **25/100** | 🟢 |
| 4+ | [All others] | X% | X/10 | X% | X% | Xx | X | **X/100** | ... |

**TRAFFIC CAPTURE OPPORTUNITY:**
| Competitor | Monthly Traffic | Brittleness | Capture Probability | Your Capturable Traffic | Value @ $2 CPC |
|------------|-----------------|-------------|---------------------|-------------------------|----------------|
| [High Risk] | 150K | 78/100 | 50% drop likely | 75K × 30% = 22.5K | $45K/mo |
| [Moderate] | 80K | 55/100 | 25% drop likely | 20K × 25% = 5K | $10K/mo |
| **TOTAL OPPORTUNITY** | — | — | — | **27.5K/mo** | **$55K/mo** |

**CORE UPDATE CALENDAR:**
| Update Name | Typical Timing | Most Affected Sites | Your Preparation Deadline |
|-------------|----------------|---------------------|--------------------------|
| March Core | Early March | [Thin content, affiliate] | February 15 |
| August Core | Mid-August | [YMYL, low E-E-A-T] | July 15 |
| November Core | November | [All categories] | October 15 |

### 11.2 Collapse Capture Playbook
**TARGET: [Domain with HIGHEST brittleness score]**

**VULNERABILITY PROFILE:**
| Risk Factor | Their Score | Industry Average | Why This Is Dangerous |
|-------------|-------------|------------------|----------------------|
| Thin Content | 35% | 10% | [Google penalizes thin affiliate content] |
| E-E-A-T Signals | 4/10 | 7/10 | [No author bios, missing credentials] |
| Anchor Text | Over-optimized | Natural | [Likely link scheme penalty] |
| Content Freshness | Stale (18mo avg) | 6mo avg | [Decay in rankings] |

**PRE-POSITIONING STRATEGY:**
| Action | Timeline | Content to Create | Target Keywords | Expected Capture |
|--------|----------|-------------------|-----------------|------------------|
| Create definitive guide | Week 1-2 | "[Topic] Ultimate Guide" | [Their top 5 keywords] | 30% of their traffic |
| Build E-E-A-T | Week 2-4 | Expert interviews, case studies | [Informational terms] | 20% |
| Schema advantage | Week 1 | FAQ, How-To schema | [Featured snippet targets] | 15% |

**TRAFFIC CAPTURE TIMING:**
- Core Update Roll-Out: [Typical dates]
- Pre-Position Content By: [2-4 weeks before]
- Estimated Capture Potential: [X K monthly visitors]
- Revenue Impact: [$X/month at current conversion rates]

### 11.3 Defensive Brittleness Audit
**YOUR OWN VULNERABILITY ASSESSMENT:**

| Risk Factor | Your Score | Risk Level | Immediate Action | Priority |
|-------------|------------|------------|------------------|----------|
| Thin Content (<500 words) | X% of pages | 🔴/🟡/🟢 | [Expand or consolidate] | High |
| Anchor Text Distribution | [Natural/Risk] | 🟢/🟡/🔴 | [Diversify with branded anchors] | Med |
| E-E-A-T Signals | X/10 | 🔴/🟡/🟢 | [Add author bios, credentials] | High |
| Schema Implementation | X/10 | 🟢/🟡/🔴 | [Add missing schema types] | Med |
| Content Freshness | Avg X mo old | 🟢/🟡/🔴 | [Update cadence plan] | Med |
| Mobile UX | X/10 | 🟢/🟡/🔴 | [Core Web Vitals fixes] | High |

**RECOMMENDED FIXES (Priority Order):**
1. 🔴 **Critical:** [Action] — Reduces brittleness score by X points
2. 🟡 **Important:** [Action] — Reduces brittleness score by X points
3. 🟢 **Nice-to-have:** [Action] — Reduces brittleness score by X points

---

## 🌐 SECTION 12: INFORMATION BLACK HOLES (→ Chart: informationBlackHolesChart)

### 12.1 Uncontested Opportunity Zones
**Purpose:** Topics/questions that NO competitor adequately addresses — maximum opportunity for AI citation capture and SERP domination.

**MANDATORY: Identify 8+ Black Holes:**
| # | Topic/Question | Opportunity Score | Monthly Search | Current Best Coverage | Coverage Quality | AI Citation Potential | Content Type | Effort | ROI |
|---|----------------|-------------------|----------------|----------------------|------------------|----------------------|--------------|--------|-----|
| 1 | [Uncovered topic] | 10/10 | 12K/mo | [Competitor X] | Superficial (300 words) | 🔥 VERY HIGH | Ultimate Guide | High | 10x |
| 2 | [Unanswered question] | 9/10 | 8K/mo | None | Non-existent | 🔥 VERY HIGH | FAQ Page | Low | 15x |
| 3 | [Missing comparison] | 9/10 | 5K/mo | [Comp Y] | Outdated (2022) | HIGH | Comparison | Med | 8x |
| 4 | [Technical gap] | 8/10 | 3K/mo | [Comp Z] | Too basic | HIGH | How-To | Med | 6x |
| 5-8 | ... | X/10 | X K/mo | ... | ... | ... | ... | ... | Xx |

**BLACK HOLE CATEGORIES:**
| Category | Count | Total Search Volume | Best Opportunity | Action |
|----------|-------|---------------------|------------------|--------|
| Unanswered Questions | X | X K/mo | [Topic] | FAQ cluster |
| Missing Comparisons | X | X K/mo | [Topic] | Comparison hub |
| Outdated Content | X | X K/mo | [Topic] | Modern alternative |
| Technical Gaps | X | X K/mo | [Topic] | Expert guide |

### 12.2 Semantic Entity Capture Opportunities
**ENTITY OWNERSHIP ANALYSIS:**

**Unowned Entities (NO competitor has topical authority):**
| Entity | Search Volume | Related Topics | Competition | Time to Own | Content Needed |
|--------|---------------|----------------|-------------|-------------|----------------|
| [Entity 1] | X K/mo | [Topic cluster] | None | 2 months | 5 pieces |
| [Entity 2] | X K/mo | [Topic cluster] | Very weak | 3 months | 8 pieces |
| [Entity 3] | X K/mo | [Topic cluster] | None | 1 month | 3 pieces |

**Contested Entities (Weak current ownership — takeover possible):**
| Entity | Current Owner | Their Authority | Your Opportunity | Takeover Strategy | Timeline |
|--------|---------------|-----------------|------------------|-------------------|----------|
| [Entity 1] | [Competitor X] | 5/10 (weak) | High | [Publish deeper content + build links] | 4 months |
| [Entity 2] | [Competitor Y] | 6/10 (medium) | Medium | [Niche angle they miss] | 6 months |

**Entity Cluster Gaps (Related entity groups competitors miss):**
| Cluster Theme | Entities in Cluster | Competitor Coverage | Your Opportunity |
|---------------|---------------------|---------------------|------------------|
| [Theme 1] | [Entity A, B, C] | 1 of 3 covered | Own the cluster with 3 comprehensive pieces |
| [Theme 2] | [Entity D, E, F, G] | 2 of 4 covered | Fill gaps to become cluster authority |

### 12.3 Black Hole Capture Priority
**PRIORITIZED ACTION PLAN:**

**🌑 HIGHEST VALUE BLACK HOLE (Do This Week):**
- Topic: [Specific topic with best opportunity/effort ratio]
- Why First: [Search volume + zero competition + AI citation potential]
- Content Plan: [Title, format, word count, unique angle]
- Timeline: [X days to publish]
- Expected Results: [X rankings, X traffic, X leads in X weeks]

**🌑 QUICK WIN BLACK HOLES (This Month):**
| # | Topic | Content Type | Days to Publish | Expected Traffic | Priority |
|---|-------|--------------|-----------------|------------------|----------|
| 1 | [Topic 1] | FAQ | 2 days | 500/mo | 🔥 Week 1 |
| 2 | [Topic 2] | How-To | 3 days | 800/mo | Week 1-2 |
| 3 | [Topic 3] | Comparison | 5 days | 1,200/mo | Week 2-3 |

**🌑 STRATEGIC BLACK HOLES (This Quarter):**
| # | Entity/Topic | Why Strategic | Content Plan | Authority Impact | Timeline |
|---|--------------|---------------|--------------|------------------|----------|
| 1 | [Entity 1] | Unlocks [related topic cluster] | 5-piece pillar | Become THE authority | Month 1-2 |
| 2 | [Entity 2] | Positions for [future keyword] | 3-piece series | First-mover advantage | Month 2-3 |

---

## ⚡ SECTION 13: STRATEGIC IMPERATIVES (Top 10 Priority Actions)

**PURPOSE:** The single most important takeaway — the 10 actions that will have the highest impact on competitive position.

**MANDATORY: Rank by impact-to-effort ratio:**
| # | Action | Category | Section Source | Impact | Effort | Timeline | Expected Outcome | Competitive Effect | Dependencies | Owner |
|---|--------|----------|----------------|--------|--------|----------|------------------|-------------------|--------------|-------|
| 1 | [Most critical action] | Kill Move | Section 3.2 | 10/10 | 3/10 | Week 1 | [Specific measurable outcome] | [Competitor X loses X%] | None | [Role] |
| 2 | [Second priority] | Content | Section 12.1 | 9/10 | 4/10 | Week 1-2 | [Traffic gain] | [Black hole captured] | #1 | [Role] |
| 3 | [Third priority] | Authority | Section 7.2 | 9/10 | 5/10 | Week 2-4 | [Backlinks + mentions] | [Moat strengthened] | None | [Role] |
| 4 | [Fourth priority] | Distribution | Section 7.3 | 8/10 | 3/10 | Week 2-4 | [Channel growth] | [First-mover captured] | None | [Role] |
| 5 | [Fifth priority] | Audience | Section 1.1 | 8/10 | 4/10 | Week 3-4 | [Frustration addressed] | [Loyalty built] | #2 | [Role] |
| 6 | [Sixth priority] | Offer | Section 5.3 | 8/10 | 6/10 | Month 2 | [Conversion improvement] | [Value prop clarified] | #1-5 | [Role] |
| 7 | [Seventh priority] | Tech | Section 9.1 | 7/10 | 2/10 | Month 2 | [AEO improvement] | [AI citations captured] | None | [Role] |
| 8 | [Eighth priority] | Brand | Section 5.1 | 7/10 | 5/10 | Month 2-3 | [Position solidified] | [Category owned] | #6 | [Role] |
| 9 | [Ninth priority] | Scale | Section 6.1 | 7/10 | 7/10 | Month 3 | [Content velocity] | [Pillar established] | #2 | [Role] |
| 10 | [Tenth priority] | Moat | Section 7.1 | 6/10 | 8/10 | Month 3 | [Defense completed] | [Insurmountable lead] | #1-9 | [Role] |

**IMPERATIVE CATEGORIES:**
- 🗡️ Kill Moves (Actions that hurt competitors)
- 📚 Content (Publishing priorities)
- 🏛️ Authority (Credibility building)
- 📡 Distribution (Channel expansion)
- 🎯 Audience (Customer focus)
- 💎 Offer (Value proposition)
- ⚙️ Tech (Technical improvements)
- 🎨 Brand (Positioning)
- 📈 Scale (Growth)
- 🏰 Moat (Defense)

**EXECUTION CHECKLIST:**
| Week | Imperatives to Complete | Success Criteria | Checkpoint |
|------|------------------------|------------------|------------|
| Week 1 | #1, #4, #7 | [Specific deliverables] | Friday EOD |
| Week 2 | #2, #3 (start) | [Specific deliverables] | Friday EOD |
| Week 3 | #3 (complete), #5 | [Specific deliverables] | Friday EOD |
| Week 4 | #5 (complete) | [Specific deliverables] | Month 1 Review |

---

## 🔄 SECTION 14: CROSS-STAGE DATA PREPARATION

**PURPOSE:** Ensure smooth handoff to Stages 2-5 with pre-analyzed data.

### For Stage 2 (Keyword Discovery):
**MANDATORY TABLE:**
| Keyword Type | Keywords from This Analysis | Section Source | Priority | Search Intent |
|--------------|----------------------------|----------------|----------|---------------|
| Primary | [Keyword 1], [Keyword 2], [Keyword 3] | Section 3 (Competitive Gaps) | 🔥 High | Commercial |
| Secondary | [Keyword 4], [Keyword 5] | Section 2 (JTBD Triggers) | Medium | Informational |
| Question | [Question 1], [Question 2] | Section 1 (Frustrations) | High | Informational |
| Long-tail | [Long-tail 1], [Long-tail 2] | Section 12 (Black Holes) | Medium | Transactional |

**KEYWORD CLUSTERS TO EXPLORE:**
| Cluster Theme | Seed Keywords | Estimated Volume | Competition | Priority |
|---------------|---------------|------------------|-------------|----------|
| [Theme 1] | [Keyword A, B, C] | High | Low | 🔥 #1 |
| [Theme 2] | [Keyword D, E] | Medium | Medium | #2 |

### For Stage 3 (Content Architecture):
**RECOMMENDED PILLAR STRUCTURE:**
| Pillar | Hub Page Topic | Spoke Topics | Section Source | Priority |
|--------|----------------|--------------|----------------|----------|
| [Pillar 1 from 6.1] | [Hub topic] | [Spoke 1, 2, 3] | Section 6.1 | 🔥 #1 |
| [Pillar 2 from 6.1] | [Hub topic] | [Spoke 1, 2, 3] | Section 6.1 | #2 |

**INTERNAL LINKING PRIORITIES:**
| From | To | Anchor Strategy | SEO Value |
|------|-----|-----------------|-----------|
| [Page 1] | [Page 2] | [Exact match / branded] | High |
| [Page 2] | [Page 3] | [Contextual] | Medium |

### For Stage 4 (Calendar & Publishing):
**CONTENT PRIORITY ORDER (from Section 8.1):**
| # | Content Piece | Type | Timeline | Strategic Rationale |
|---|---------------|------|----------|---------------------|
| 1 | [Content 1] | [Guide] | Week 1 | Captures Black Hole #1 |
| 2 | [Content 2] | [Comparison] | Week 2 | Kill Move for [Competitor] |
| 3 | [Content 3] | [How-To] | Week 3 | Addresses Frustration #1 |

**SEASONAL CONSIDERATIONS:**
**Based on seasonality:** ${getField(data, 'seasonality')}
| Month | Content Focus | Why | Competitor Activity |
|-------|---------------|-----|---------------------|
| [Month 1] | [Topic] | [Seasonal relevance] | [What competitors do] |
| [Month 2] | [Topic] | [Trend timing] | [Gap to exploit] |

### For Stage 5 (E-E-A-T & Generation):
**AUTHORITY SIGNALS TO EMPHASIZE (from Section 7.2):**
| Signal Type | Current Asset | How to Feature | Priority |
|-------------|---------------|----------------|----------|
| Experience | [Case studies, behind-scenes] | [In content intros] | High |
| Expertise | [Credentials, certifications] | [Author boxes] | High |
| Authority | [Guest posts, mentions] | [Social proof sections] | Medium |
| Trust | [Reviews, testimonials] | [Trust badges, quotes] | High |

**CASE STUDY OPPORTUNITIES:**
| Story | Customer Type | Outcome to Highlight | Content Format |
|-------|---------------|---------------------|----------------|
| [Story 1] | [Segment] | [Transformation] | Written + Video |
| [Story 2] | [Segment] | [Results] | Written |

### For Stage 5 (E-E-A-T & Generation):
- **Authority Signals to Emphasize:** [From Section 7.2]
- **Trust Anchor Priorities:** [Social proof strategy]
- **Case Study Opportunities:** [Stories to develop]

---

## ✍️ WRITING GUIDELINES & OUTPUT VALIDATION

**MANDATORY SECTION CHECKLIST (You MUST include ALL 14 SECTIONS — NO EXCEPTIONS):**
☐ SECTION 1: 📊 Customer Intelligence (1.1, 1.2, 1.3) — Min 400 words
☐ SECTION 2: 🎯 Jobs-To-Be-Done Framework (2.1, 2.2, 2.3) — Min 300 words
☐ SECTION 3: 🏆 Competitive Warfare (3.1, 3.2, 3.3) — Min 350 words
☐ SECTION 4: 🌊 Blue Ocean & Market Opportunities (4.1, 4.2, 4.3, 4.4) — Min 300 words
☐ SECTION 5: 🎨 Brand Positioning & Value Architecture (5.1, 5.2, 5.3) — Min 250 words
☐ SECTION 6: 📚 Content Strategy & Pillars (6.1, 6.2, 6.3) — Min 300 words
☐ SECTION 7: 🏗️ Strategic Moat Architecture (7.1, 7.2, 7.3, 7.4) — Min 250 words
☐ SECTION 8: 📋 Action Plan & Execution Roadmap (8.1, 8.2, 8.3, 8.4) — Min 300 words
☐ SECTION 9: 🔬 Forensic Intelligence — AEO Citation Analysis (9.1, 9.2, 9.3) — Min 200 words
☐ SECTION 10: 💰 Forensic Intelligence — Digital Asset Valuation (10.1, 10.2, 10.3) — Min 200 words
☐ SECTION 11: ⚠️ Forensic Intelligence — Brittleness Prediction (11.1, 11.2, 11.3) — Min 200 words
☐ SECTION 12: 🌐 Information Black Holes (12.1, 12.2, 12.3) — Min 200 words
☐ SECTION 13: ⚡ STRATEGIC IMPERATIVES — Top 10 Priority Actions — Min 150 words
☐ SECTION 14: 🔄 CROSS-STAGE DATA PREPARATION — All 4 stage prep sections — Min 150 words

**ELITE CONSULTING STANDARDS:**
- **Elite Consulting Quality**: McKinsey-level depth, not generic advice
- **Data-Grounded**: Every insight references specific input data or competitor intelligence
- **Action-Oriented**: "Do X because Y, expect Z result"
- **Competitive Context**: Always position relative to competitor weaknesses
- **Timing Aware**: Include "why now" for time-sensitive opportunities
- **Universal Applicability**: Works for SaaS, e-commerce, agency, service business, personal brand

**QUALITY STANDARDS**:
❌ NEVER: Generic advice like "improve your content" or "focus on SEO"
❌ NEVER: Placeholder scores without reasoning
❌ NEVER: Recommendations that ignore competitor data provided
❌ NEVER: Skip sections or subsections
❌ NEVER: Use "N/A" or "Not applicable" - always provide relevant analysis
❌ NEVER: Fabricate statistics, sources, or external links
❌ NEVER: Use hype-driven language ("game-changer," "revolutionary," "explosive") without data support
❌ NEVER: Display "Run competitor analysis" or similar instructional messages when data is missing
✅ ALWAYS: Cite specific data points from inputs or competitor intelligence
✅ ALWAYS: Explain WHY each score is what it is
✅ ALWAYS: Connect opportunities to competitor weaknesses
✅ ALWAYS: Include timing/urgency analysis
✅ ALWAYS: Complete ALL 14 sections with ALL subsections
✅ ALWAYS: Use tables where specified in the template
✅ ALWAYS: Label estimates and heuristics as such ("Based on industry benchmarks..." or "Internal analysis indicates...")
✅ ALWAYS: Use neutral, professional language suitable for enterprise buyers and investors

**COMPETITOR DATA HANDLING:**
When competitor intelligence data IS available:
- Render complete Competitor Analysis section with comparative insights
- Reference forensic cards and competitor artifacts
- Include strengths, weaknesses, and notable gaps
- Use specific metrics from the competitor data (authority scores, traffic, keywords)

When competitor intelligence data is NOT available:
- Use neutral, informative language explaining what data would appear
- DO NOT display instructional "run analysis" prompts
- Provide general strategic guidance based on available project data
- Clearly state "Based on project inputs" when competitor data is unavailable

**EXAMPLES**:
❌ BAD: "Leverage synergistic paradigms to enhance market presence"
✅ GOOD: "Target the ${getField(data, 'targetAudience')} segment's #1 frustration: '${getField(data, 'audiencePains').substring(0, 80)}...' — competitors address this superficially with generic content. Your kill move: Create the definitive resource that solves this completely."

❌ BAD: "Build authority in your niche"
✅ GOOD: "Competitor X has 450 referring domains but weak E-E-A-T signals. Your asymmetric advantage: Leverage ${getField(data, 'authorBio')} credentials + proprietary data to capture authority they can't match."

❌ BAD: "Studies show 80% of customers prefer..."
✅ GOOD: "According to Forrester Research (2024), 78% of B2B buyers require 3+ content touchpoints... [Source: forrester.com/b2b-buyer-journey]"

**COMPETITOR INTELLIGENCE USAGE:**
When competitor data is provided above, you MUST:
1. Reference specific competitor domains by name
2. Cite their authority scores, traffic, and keyword data
3. Identify specific weaknesses from their technical scores
4. Use their top pages to find content gaps
5. Leverage their backlink profiles to find link opportunities

**NOW GENERATE YOUR ELITE STRATEGIC INTELLIGENCE OUTPUT:**
Start with the JSON block (\`\`\`json...\`\`\`), then the comprehensive markdown report with ALL 14 SECTIONS.
Treat this as a $50,000 consulting engagement — every insight must justify that investment.
**REMINDER: You must generate ALL 14 sections, ALL subsections. Sections 13 (Strategic Imperatives) and 14 (Cross-Stage Data) are MANDATORY.**`;

  return prompt;
}

/**
 * Call Gemini API through PHP Gateway (uses server-side API key)
 * This avoids storing API keys in Apps Script
 */
function callStage1GeminiAPI(prompt, selectedModel) {
  try {
    Logger.log('📡 Calling Gemini API through PHP Gateway...');
    
    // Ensure Gemini 2.5 or Gemini 3 model (latest generations)
    const isValidModel = selectedModel && (selectedModel.startsWith('gemini-2.5') || selectedModel.startsWith('gemini-3'));
    const model = isValidModel ? selectedModel : 'gemini-3-flash-preview';
    Logger.log('🤖 Using model: ' + model);
    
    // Call through gateway (API key is on the server)
    // V10.0: Increased tokens for elite strategic report
    const result = callGeminiAPI(model, prompt, {
      temperature: 0.75,  // Slightly higher for creative strategic thinking
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 32768  // Increased for comprehensive elite report
    });
    
    if (!result || !result.success) {
      throw new Error('Gemini API call failed: ' + (result.error || 'Unknown error'));
    }
    
    // Extract text from response
    const responseText = result.data || result.text || '';
    
    if (!responseText) {
      throw new Error('Gemini API returned empty response');
    }
    
    Logger.log('✅ Gemini response received: ' + responseText.length + ' chars');
    return responseText;
    
  } catch (error) {
    Logger.log('❌ Gemini API Error: ' + error.toString());
    throw error;
  }
}

/**
 * Parse Gemini response into structured JSON
 * V12.0: Enhanced with robust JSON extraction and validation
 * Expects response with JSON block + markdown report
 */
function parseStage1Response(fullResponse) {
  try {
    // V12.0: Use enhanced JSON extraction from DB_AI_GeminiClient.gs
    let strategicData = null;
    
    if (typeof extractJSONFromResponse === 'function') {
      strategicData = extractJSONFromResponse(fullResponse);
      if (strategicData) {
        Logger.log('✅ V12.0 extractJSONFromResponse succeeded');
      }
    }
    
    // Fallback to legacy extraction if enhanced method not available or failed
    if (!strategicData) {
      // Extract JSON block from response
      const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          strategicData = JSON.parse(jsonMatch[1]);
          Logger.log('✅ Successfully parsed strategicData JSON from response');
        } catch (jsonError) {
          Logger.log('⚠️ JSON parse error: ' + jsonError.toString());
          Logger.log('JSON content: ' + jsonMatch[1].substring(0, 500));
        }
      }
      
      // Fallback: Try to extract JSON without code fence
      if (!strategicData) {
        const jsonStart = fullResponse.indexOf('{');
        const jsonEnd = fullResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          try {
            const jsonStr = fullResponse.substring(jsonStart, jsonEnd + 1);
            strategicData = JSON.parse(jsonStr);
            Logger.log('✅ Successfully parsed strategicData JSON (no fence)');
          } catch (jsonError) {
            Logger.log('⚠️ Fallback JSON parse failed: ' + jsonError.toString());
          }
        }
      }
    }
    
    // V12.0 TODO 7.6: Validate JSON structure
    if (strategicData) {
      const validationResult = validateStage1Response(strategicData);
      if (!validationResult.isValid) {
        Logger.log('⚠️ V12.0 Validation issues: ' + validationResult.issues.join(', '));
        // Attempt to repair missing fields
        strategicData = repairStage1Response(strategicData, validationResult);
      } else {
        Logger.log('✅ V12.0 Response validation passed');
      }
      return strategicData;
    }
    
    // Final fallback: Return minimal structure
    Logger.log('⚠️ Could not extract valid JSON, returning minimal structure');
    return getMinimalStage1Response('Could not extract valid JSON from response');
    
  } catch (error) {
    Logger.log('❌ Critical parse error: ' + error.toString());
    return getMinimalStage1Response(error.toString());
  }
}

/**
 * V12.0 TODO 7.6: Validate Stage 1 response structure
 * @param {Object} data - Parsed JSON response
 * @returns {Object} { isValid: boolean, issues: Array, missing: Array }
 */
function validateStage1Response(data) {
  const issues = [];
  const missing = [];
  
  // Required top-level fields
  const requiredFields = [
    'dashboardCharts',
    'jtbdScenarios',
    'contentPillars',
    'competitiveGaps',
    'uniqueMechanism',
    'audienceProfile'
  ];
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      missing.push(field);
      issues.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate dashboardCharts structure
  if (data.dashboardCharts) {
    const dc = data.dashboardCharts;
    const requiredCharts = [
      'customerFrustrationsChart',
      'hiddenAspirationsChart',
      'customerJobPriorityChart',
      'competitiveAdvantageMapChart',
      'contentFormatStrategyChart',
      'strategicContentPillarsChart',
      'priorityFocusMatrixChart'
    ];
    
    requiredCharts.forEach(chart => {
      if (!dc[chart] || (Array.isArray(dc[chart]) && dc[chart].length === 0)) {
        issues.push(`Empty or missing chart: ${chart}`);
      }
    });
  }
  
  // Validate content pillars
  if (data.contentPillars && Array.isArray(data.contentPillars)) {
    if (data.contentPillars.length < 3) {
      issues.push('Content pillars should have at least 3 entries');
    }
  }
  
  // Validate JTBD scenarios
  if (data.jtbdScenarios && Array.isArray(data.jtbdScenarios)) {
    if (data.jtbdScenarios.length < 3) {
      issues.push('JTBD scenarios should have at least 3 entries');
    }
  }
  
  // Check for forensicBridge (V12.0)
  if (!data.forensicBridge) {
    issues.push('Missing forensicBridge for Stage 2 auto-population');
  }
  
  // Check for tabInsights (V12.0)
  if (!data.tabInsights) {
    issues.push('Missing tabInsights for 14-tab dashboard');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    missing: missing,
    completeness: Math.round(((requiredFields.length - missing.length) / requiredFields.length) * 100)
  };
}

/**
 * V12.0: Repair missing fields in Stage 1 response
 * @param {Object} data - Original parsed data
 * @param {Object} validation - Validation result
 * @returns {Object} Repaired data
 */
function repairStage1Response(data, validation) {
  const repaired = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Add minimal dashboardCharts if missing
  if (!repaired.dashboardCharts) {
    repaired.dashboardCharts = {};
  }
  
  const defaultCharts = {
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
    marketOpportunityAnalysisChart: [],
    blueOceanOpportunitiesChart: [],
    competitorKillMovesChart: [],
    aeoAnalysisChart: [],
    assetValuationChart: [],
    brittlenessRiskChart: []
  };
  
  Object.keys(defaultCharts).forEach(chart => {
    if (!repaired.dashboardCharts[chart]) {
      repaired.dashboardCharts[chart] = defaultCharts[chart];
    }
  });
  
  // Add missing top-level structures
  if (!repaired.jtbdScenarios) repaired.jtbdScenarios = [];
  if (!repaired.contentPillars) repaired.contentPillars = [];
  if (!repaired.competitiveGaps) repaired.competitiveGaps = { topicGap: '', angleVoiceGap: '', formatGap: '' };
  if (!repaired.uniqueMechanism) repaired.uniqueMechanism = { name: '', tagline: '', oneParagraphDefinition: '', keyPromises: [] };
  if (!repaired.audienceProfile) repaired.audienceProfile = { emotionalPains: [], hiddenDesires: [], limitingBeliefs: [], empoweringBeliefs: [] };
  
  // Add empty forensicBridge if missing
  if (!repaired.forensicBridge) {
    repaired.forensicBridge = {
      primaryKeywords: [],
      topicClusters: [],
      contentGaps: [],
      competitorWeaknesses: [],
      strategicOpportunities: [],
      recommendedFormats: [],
      targetAudienceRefinement: '',
      valuePropositionEnhancements: [],
      brandVoiceGuidelines: '',
      priorityActions: []
    };
  }
  
  // Add empty tabInsights if missing
  if (!repaired.tabInsights) {
    repaired.tabInsights = {};
  }
  
  repaired._repaired = true;
  repaired._repairIssues = validation.issues;
  
  Logger.log('✅ V12.0 Response repaired, ' + validation.issues.length + ' issues addressed');
  return repaired;
}

/**
 * V12.0: Get minimal Stage 1 response structure
 * @param {string} errorMessage - Error message to include
 * @returns {Object} Minimal response structure
 */
function getMinimalStage1Response(errorMessage) {
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
    forensicBridge: { primaryKeywords: [], topicClusters: [], contentGaps: [] },
    tabInsights: {},
    parseError: errorMessage
  };
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

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPETITOR ANALYSIS WORKFLOW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * NEW WORKFLOW: Replaces old COMP_orchestrateAnalysis
 * 
 * Flow:
 * 1. UI calls WORKFLOW_analyzeCompetitors
 * 2. Enhanced data collector gathers rich data from fetchers + APIs
 * 3. Gemini AI analyzes the data
 * 4. Returns structured insights to UI
 * 
 * @module CompetitorAnalysisWorkflow
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Main workflow function - called from UI
 * @param {Object} config - Configuration from UI
 * @param {string[]} config.competitors - Array of competitor URLs
 * @param {string} config.projectId - Project identifier
 * @param {string} config.yourDomain - User's domain
 * @param {string} config.spreadsheetId - Target spreadsheet ID
 * @returns {Object} Analysis results with Gemini insights
 */
function WORKFLOW_analyzeCompetitors(config) {
  Logger.log('🚀 Starting Competitor Analysis Workflow');
  Logger.log('📋 Raw config type: ' + typeof config);
  Logger.log('📋 Config: ' + JSON.stringify(config));
  
  // CRITICAL FIX: Handle undefined or invalid config
  if (!config || typeof config !== 'object') {
    Logger.log('❌ Invalid config: ' + config);
    return {
      success: false,
      error: 'Invalid config: configuration object required. Received: ' + typeof config,
      intelligence: {}
    };
  }
  
  // Validate config
  if (!config.competitors || !Array.isArray(config.competitors)) {
    Logger.log('❌ Invalid config.competitors: ' + JSON.stringify(config.competitors));
    return {
      success: false,
      error: 'Invalid config: competitors array required. Received competitors: ' + JSON.stringify(config.competitors),
      intelligence: {}
    };
  }
  
  if (config.competitors.length === 0) {
    return {
      success: false,
      error: 'No competitors provided',
      intelligence: {}
    };
  }
  
  var startTime = new Date().getTime();
  var projectId = config.projectId || 'project-' + new Date().getTime();
  var spreadsheetId = config.spreadsheetId || '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Collect Rich Data for Each Competitor
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📥 Step 1: Collecting data for ' + config.competitors.length + ' competitors...');
  
  var projectContext = {
    projectId: projectId,
    yourDomain: config.yourDomain || '',
    targetKeywords: config.targetKeywords || [],
    industry: config.industry || '',
    competitors: config.competitors || [] // Pass competitor URLs for V6 uniqueness analysis
  };
  
  // V6 FORENSIC ENGINE: One-shot scan instead of 7 separate calls
  var collectionResult = COLLECTOR_gatherBatchData_V6(config.competitors, projectContext);
  
  if (!collectionResult.success) {
    return {
      success: false,
      error: 'Data collection failed: ' + (collectionResult.error || 'Unknown error'),
      intelligence: {}
    };
  }
  
  Logger.log('✅ Data collected for ' + collectionResult.successCount + ' competitors');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Save Raw Data to Storage
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('💾 Step 2: Saving raw data to storage...');
  
  var savedCount = 0;
  var domains = Object.keys(collectionResult.competitors);
  
  for (var i = 0; i < domains.length; i++) {
    var domain = domains[i];
    var competitorData = collectionResult.competitors[domain];
    
    try {
      var saveResult = STORAGE_saveCompetitorJSON(
        domain,
        competitorData.rawData,
        {}, // Empty processed metrics for now
        {}, // Empty AI insights (will be added in Step 4)
        projectId,
        spreadsheetId
      );
      
      if (saveResult.success) {
        savedCount++;
      }
    } catch (e) {
      Logger.log('⚠️ Failed to save data for ' + domain + ': ' + e);
    }
  }
  
  Logger.log('✅ Saved data for ' + savedCount + '/' + domains.length + ' competitors');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Prepare Data for Gemini Analysis (ENHANCED WITH FULL DATA)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('🤖 Step 3: Preparing FULL data for elite CSO-level analysis...');
  
  var competitorsForAI = domains.map(function(domain) {
    var data = collectionResult.competitors[domain];
    var fetcher = data.rawData.fetcher || {};
    var apis = data.rawData.apis || {};
    
    // Extract ALL data for elite analysis
    var marketIntel = fetcher.market_intel || {};
    var contentIntel = fetcher.content_intel || {};
    var structure = fetcher.structure || {};
    var conversion = fetcher.conversion || {};
    var brandPos = fetcher.brand_pos || {};
    var technical = fetcher.technical || {};
    
    var metaTags = marketIntel.meta_tags || {};
    var introParagraphs = marketIntel.intro_paragraphs || [];
    var headings = structure.headings || [];
    var topKeywords = structure.top_keywords || [];
    var longTailKeywords = structure.long_tail_keywords || [];
    var semanticClusters = structure.semantic_clusters || {};
    
    var openpagerank = apis.openpagerank || {};
    var pagespeed = apis.pagespeed || {};
    var serper = apis.serper || {};
    
    return {
      domain: domain,
      url: data.url,
      
      // METADATA (ALL TAGS)
      metaTitle: metaTags.title || '',
      metaDescription: metaTags.description || '',
      metaKeywords: metaTags.keywords || '',
      ogTitle: metaTags.ogTitle || '',
      ogDescription: metaTags.ogDescription || '',
      ogImage: metaTags.ogImage || '',
      
      // INTRO CONTENT (3 paragraphs)
      introParagraphs: introParagraphs,
      brandText: marketIntel.brand_text || '',
      
      // HEADING STRUCTURE (FULL HIERARCHY)
      headings: headings,
      
      // COMPREHENSIVE KEYWORD DATA
      topKeywords: topKeywords,                          // Top 50 single keywords
      longTailKeywords: longTailKeywords,                // Top 30 2-4 word phrases
      semanticClusters: semanticClusters,                // Keywords grouped by topic
      totalUniqueKeywords: structure.total_unique_keywords || 0,
      totalUniquePhrases: structure.total_unique_phrases || 0,
      
      h1Count: structure.h1_count || 0,
      h2Count: structure.h2_count || 0,
      h3Count: structure.h3_count || 0,
      totalHeadings: structure.total_headings || 0,
      hierarchyValid: structure.hierarchy_valid || false,
      
      // FORENSIC METRICS
      humanityScore: contentIntel.humanity_score || 0,
      uniquenessScore: contentIntel.uniqueness_score || 0,
      velocity30d: contentIntel.velocity_30d || 0,
      frictionLevel: conversion.friction_level || 'Unknown',
      frictionScore: conversion.friction_score || 0,
      pricingDetected: conversion.pricing_detected || false,
      trialDetected: conversion.trial_detected || false,
      bookingDetected: conversion.booking_detected || false,
      
      // TECHNICAL & SYSTEMS
      cms: marketIntel.cms || 'Unknown',
      techStack: marketIntel.tech_stack || [],
      securityHeaders: technical.security_headers || {},
      
      // E-E-A-T
      trustSignals: brandPos.trust_signals || [],
      schemaTypes: (fetcher.schema && fetcher.schema.schemaTypes) || [],
      
      // API DATA
      authority: openpagerank.pageRank || 0,
      performance: pagespeed.performanceScore || 0,
      lcp: pagespeed.lcp || 0,
      cls: pagespeed.cls || 0,
      organicKeywords: serper.organicKeywords || 0,
      organicTraffic: serper.organicTraffic || 0,
      
      // DATA QUALITY
      completeness: data.collectionSummary.completeness || 0
    };
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: Generate Elite CSO-Level Gemini AI Insights (Per Competitor)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('🧠 Step 4: Generating elite CSO-level insights (per competitor)...');
  
  var allAIInsights = [];
  
  for (var k = 0; k < competitorsForAI.length; k++) {
    var competitor = competitorsForAI[k];
    
    Logger.log('🎯 Analyzing: ' + competitor.domain);
    
    // DATA VALIDATION: Log what we're sending to Gemini
    Logger.log('📊 Data being sent to Gemini:');
    Logger.log('   Metadata: Title=' + (competitor.metaTitle ? 'YES' : 'NO') + 
               ', Desc=' + (competitor.metaDescription ? 'YES' : 'NO'));
    Logger.log('   Headings: ' + competitor.totalHeadings + ' total ' +
               '(H1: ' + competitor.h1Count + ', H2: ' + competitor.h2Count + ', H3: ' + competitor.h3Count + ')');
    Logger.log('   Keywords: ' + (competitor.topKeywords ? competitor.topKeywords.length : 0) + ' single-word keywords');
    Logger.log('   Long-tail: ' + (competitor.longTailKeywords ? competitor.longTailKeywords.length : 0) + ' multi-word phrases');
    Logger.log('   Semantic Clusters: ' + Object.keys(competitor.semanticClusters || {}).length + ' topic groups');
    Logger.log('   Total Unique: ' + competitor.totalUniqueKeywords + ' keywords, ' + competitor.totalUniquePhrases + ' phrases');
    Logger.log('   Intro: ' + (competitor.introParagraphs ? competitor.introParagraphs.length : 0) + ' paragraphs');
    Logger.log('   Forensics: Humanity=' + competitor.humanityScore + 
               '/100, Uniqueness=' + competitor.uniquenessScore + '/100');
    Logger.log('   APIs: Authority=' + competitor.authority + 
               '/100, Performance=' + competitor.performance + '/100');
    
    // Build CSO-level prompt for this competitor
    var aiPrompt = AI_buildCompetitorAnalysisPrompt(competitor);
    
    // Call Gemini API
    var geminiResult = AI_geminiGenerate('gemini-2.0-flash', aiPrompt, {
      temperature: 0.7,
      maxTokens: 8192  // Increased for comprehensive analysis
    });
    
    if (geminiResult && geminiResult.text) {
      try {
        // Extract JSON from markdown code blocks if present
        var jsonText = geminiResult.text;
        var jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        
        var parsedInsights = JSON.parse(jsonText);
        allAIInsights.push(parsedInsights);
        
        Logger.log('✅ Insights parsed for ' + competitor.domain);
      } catch (e) {
        Logger.log('⚠️ Failed to parse Gemini JSON for ' + competitor.domain + ': ' + e);
        allAIInsights.push({
          domain: competitor.domain,
          error: 'JSON parsing failed',
          rawText: geminiResult.text.substring(0, 500)
        });
      }
    } else {
      Logger.log('⚠️ Gemini analysis failed for ' + competitor.domain);
      allAIInsights.push({
        domain: competitor.domain,
        error: 'Gemini API failed'
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: Update Storage with Elite AI Insights
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('💾 Step 5: Updating storage with elite AI insights...');
  
  for (var j = 0; j < domains.length; j++) {
    var domain = domains[j];
    var competitorData = collectionResult.competitors[domain];
    
    // Find AI insights for this competitor
    var competitorInsights = {};
    if (allAIInsights[j]) {
      competitorInsights = allAIInsights[j];
    }
    
    try {
      STORAGE_saveCompetitorJSON(
        domain,
        competitorData.rawData,
        {}, // Empty processed metrics (can be added later)
        competitorInsights,
        projectId,
        spreadsheetId
      );
    } catch (e) {
      Logger.log('⚠️ Failed to update AI insights for ' + domain + ': ' + e);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: Extract UI-Ready Data and Return Intelligence Package
  // ═══════════════════════════════════════════════════════════════════════════
  
  var elapsedTime = new Date().getTime() - startTime;
  var avgCompleteness = Math.round(domains.reduce(function(sum, d) {
    return sum + collectionResult.competitors[d].collectionSummary.completeness;
  }, 0) / domains.length);
  
  Logger.log('✅ Elite Competitor Analysis Workflow Complete!');
  Logger.log('   Elapsed: ' + (elapsedTime / 1000).toFixed(1) + 's');
  Logger.log('   Competitors analyzed: ' + domains.length);
  Logger.log('   Data completeness: ' + avgCompleteness + '%');
  Logger.log('   AI insights generated: ' + allAIInsights.length);
  
  // Get filtered UI-ready data from storage
  Logger.log('📊 Step 7: Extracting UI-ready filtered data...');
  var uiReadyData = STORAGE_getUIReadyData(projectId, spreadsheetId);
  
  // Enhance UI data with AI insights (scores, predictions, opportunities)
  var enhancedUIData = uiReadyData.competitors.map(function(comp, index) {
    var aiInsights = allAIInsights[index] || {};
    var scores = aiInsights.scores || {};
    var executive = (aiInsights.categories && aiInsights.categories.executive) || {};
    var opportunities = (aiInsights.categories && aiInsights.categories.opportunities) || {};
    var performance = (aiInsights.categories && aiInsights.categories.performance) || {};
    
    return {
      domain: comp.domain,
      url: comp.url,
      lastUpdated: comp.lastUpdated,
      completeness: comp.completeness,
      
      // CORE METRICS (existing)
      metrics: comp.metrics,
      
      // ELITE AI INSIGHTS (NEW)
      aiScores: {
        threat: scores.threat || 0,
        vulnerability: scores.vulnerability || 0,
        overall: scores.overall || 0
      },
      
      // STRATEGIC INSIGHTS
      killShot: executive.kill_shot || '',
      roadmap: executive.ninety_day_roadmap || [],
      
      // PREDICTIONS
      forecast: performance.six_month_forecast || '',
      revenueRisk: performance.revenue_risk || '',
      
      // OPPORTUNITIES
      blueOcean: opportunities.blue_ocean || [],
      weakSignals: opportunities.weak_signals || [],
      contentGaps: opportunities.content_gaps || [],
      quickWins: opportunities.quick_wins || [],
      
      // LEGACY FORMAT
      aiSummary: {
        strengths: aiInsights.strengths || [],
        weaknesses: aiInsights.weaknesses || [],
        threats: aiInsights.threats || [],
        score: scores.overall || 0
      },
      
      // FULL INSIGHTS (for detailed view)
      fullInsights: aiInsights
    };
  });
  
  // Build response with elite intelligence
  var response = {
    success: true,
    
    // Elite AI Intelligence Summary
    intelligence: {
      summary: 'Elite CSO-level competitive analysis complete for ' + domains.length + ' competitors',
      avgThreatScore: Math.round(allAIInsights.reduce(function(sum, ai) {
        return sum + ((ai.scores && ai.scores.threat) || 0);
      }, 0) / allAIInsights.length),
      avgVulnerabilityScore: Math.round(allAIInsights.reduce(function(sum, ai) {
        return sum + ((ai.scores && ai.scores.vulnerability) || 0);
      }, 0) / allAIInsights.length),
      
      // Per-competitor summary
      competitors: domains.map(function(domain, index) {
        var data = collectionResult.competitors[domain];
        var insights = allAIInsights[index] || {};
        var scores = insights.scores || {};
        
        return {
          domain: domain,
          url: data.url,
          completeness: data.collectionSummary.completeness,
          
          // Core metrics
          authority: (data.rawData.apis.openpagerank && data.rawData.apis.openpagerank.pageRank) || 0,
          performance: (data.rawData.apis.pagespeed && data.rawData.apis.pagespeed.performanceScore) || 0,
          
          // Elite scores
          threatScore: scores.threat || 0,
          vulnerabilityScore: scores.vulnerability || 0,
          overallScore: scores.overall || 0,
          
          // Strategic summary
          summary: insights.summary || 'Analysis complete',
          killShot: (insights.categories && insights.categories.executive && insights.categories.executive.kill_shot) || ''
        };
      })
    },
    
    // Enhanced UI-Optimized Data (with AI insights)
    uiData: enhancedUIData,
    
    // Metadata
    metadata: {
      projectId: projectId,
      spreadsheetId: spreadsheetId,
      competitorsAnalyzed: domains.length,
      dataCompleteness: avgCompleteness + '%',
      elapsedMs: elapsedTime,
      elapsedSeconds: (elapsedTime / 1000).toFixed(1),
      timestamp: new Date().toISOString(),
      analysisType: 'elite-cso-level',
      insightsGenerated: allAIInsights.length
    }
  };
  
  Logger.log('📦 Elite response prepared:');
  Logger.log('   Intelligence competitors: ' + response.intelligence.competitors.length);
  Logger.log('   Enhanced UI data: ' + response.uiData.length);
  Logger.log('   Avg threat score: ' + response.intelligence.avgThreatScore);
  Logger.log('   Avg vulnerability score: ' + response.intelligence.avgVulnerabilityScore);
  
  return response;
}

/**
 * Build prompt for Gemini competitor analysis
 */
function buildCompetitorAnalysisPrompt_(competitors, projectContext) {
  var prompt = '# Competitor Analysis Request\n\n';
  prompt += '## Your Context\n';
  prompt += 'Domain: ' + (projectContext.yourDomain || 'Not provided') + '\n';
  prompt += 'Industry: ' + (projectContext.industry || 'Not specified') + '\n';
  prompt += 'Target Keywords: ' + (projectContext.targetKeywords && projectContext.targetKeywords.length > 0 ? 
    projectContext.targetKeywords.join(', ') : 'Not specified') + '\n\n';
  
  prompt += '## Competitors Analyzed (' + competitors.length + ')\n\n';
  
  competitors.forEach(function(comp, index) {
    prompt += '### ' + (index + 1) + '. ' + comp.domain + '\n';
    prompt += '- **Authority Score**: ' + comp.authority + '/100\n';
    prompt += '- **Performance Score**: ' + comp.performance + '/100\n';
    prompt += '- **Organic Keywords**: ' + comp.organicKeywords + '\n';
    prompt += '- **CMS**: ' + comp.cms + '\n';
    prompt += '- **H1 Count**: ' + comp.h1Count + '\n';
    prompt += '- **Humanity Score**: ' + comp.humanityScore + '/100 (AI detection)\n';
    prompt += '- **Uniqueness Score**: ' + comp.uniquenessScore + '/100 (content differentiation)\n';
    prompt += '- **Friction Level**: ' + comp.frictionLevel + ' (conversion friction: ' + comp.frictionScore + ' form fields)\n';
    prompt += '- **Brand Narrative**: ' + (comp.brandText || 'N/A') + '\n';
    prompt += '- **Data Completeness**: ' + comp.completeness + '%\n\n';
  });
  
  prompt += '\n## Analysis Instructions\n\n';
  prompt += 'Please analyze these competitors and provide:\n\n';
  prompt += '1. **Overall Summary**: High-level competitive landscape overview focusing on AI usage, content differentiation, and conversion optimization (2-3 sentences)\n';
  prompt += '2. **Per-Competitor Analysis**: For each competitor, identify:\n';
  prompt += '   - **Strengths**: 3-5 key competitive advantages (focus on humanity score, uniqueness, low friction, technical excellence)\n';
  prompt += '   - **Weaknesses**: 3-5 areas where they could improve (AI-generated content, high conversion friction, poor differentiation)\n';
  prompt += '   - **Opportunities**: 3-5 ways we could differentiate or outrank them (use V6 forensic metrics)\n';
  prompt += '3. **Strategic Recommendations**: 5-7 actionable recommendations based on forensic intelligence\n\n';
  prompt += 'Format your response as JSON with this structure:\n';
  prompt += '```json\n';
  prompt += '{\n';
  prompt += '  "summary": "Overall analysis summary",\n';
  prompt += '  "competitors": [\n';
  prompt += '    {\n';
  prompt += '      "domain": "competitor.com",\n';
  prompt += '      "strengths": ["strength 1", "strength 2", ...],\n';
  prompt += '      "weaknesses": ["weakness 1", "weakness 2", ...],\n';
  prompt += '      "opportunities": ["opportunity 1", "opportunity 2", ...]\n';
  prompt += '    }\n';
  prompt += '  ],\n';
  prompt += '  "recommendations": ["recommendation 1", "recommendation 2", ...]\n';
  prompt += '}\n';
  prompt += '```\n';
  
  return prompt;
}

/**
 * BACKWARD COMPATIBILITY WRAPPER
 * This allows old UI code to work while we transition
 */
function COMP_orchestrateAnalysis(config) {
  Logger.log('⚠️ COMP_orchestrateAnalysis called - redirecting to new workflow');
  Logger.log('📋 Received config type: ' + typeof config);
  Logger.log('📋 Received config: ' + JSON.stringify(config));
  
  // CRITICAL FIX: Validate config before passing to workflow
  if (!config || typeof config !== 'object') {
    Logger.log('❌ COMP_orchestrateAnalysis: Invalid config - ' + typeof config);
    return {
      success: false,
      error: 'Configuration object required but received: ' + typeof config,
      intelligence: {},
      debug: {
        receivedType: typeof config,
        receivedValue: String(config)
      }
    };
  }
  
  return WORKFLOW_analyzeCompetitors(config);
}

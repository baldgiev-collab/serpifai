/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI_ProjectLoader.gs - ELITE PROJECT AUTO-POPULATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles:
 * ✓ Load project from dropdown selection
 * ✓ Auto-populate all 81 form fields
 * ✓ Load competitor analysis data
 * ✓ Populate competitor intelligence tabs
 * ✓ Map data for UI rendering
 * 
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Main function called when user selects project from dropdown
 * @param {string} projectName - Name of project to load
 * @returns {object} Complete project data for UI population
 */
function loadAndPopulateProject(projectName) {
  try {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('📂 LOADING PROJECT: ' + projectName);
    Logger.log('═══════════════════════════════════════════════════════════');
    
    // 1. Load project data (81 fields)
    Logger.log('[1/4] Loading project data...');
    const projectResult = loadProjectElite(projectName);
    
    if (!projectResult.success) {
      throw new Error('Failed to load project: ' + projectResult.error);
    }
    
    const projectData = projectResult.data;
    Logger.log('   ✅ Loaded ' + Object.keys(projectData).length + ' fields');
    Logger.log('   📊 Completion: ' + (projectData._metadata?.completionPercent || 0) + '%');
    
    // 2. Load competitor analysis (if exists)
    Logger.log('[2/4] Loading competitor analysis...');
    const competitorAnalysis = loadCompetitorAnalysis(projectName);
    
    if (competitorAnalysis.success) {
      Logger.log('   ✅ Loaded ' + competitorAnalysis.competitors.length + ' competitors');
    } else {
      Logger.log('   ⚠️  No competitor analysis found (will run on demand)');
    }
    
    // 3. Map data for UI components
    Logger.log('[3/4] Mapping data for UI...');
    const uiData = mapProjectDataForUI(projectData, competitorAnalysis);
    Logger.log('   ✅ Mapped to ' + Object.keys(uiData).length + ' UI sections');
    
    // 4. Build field population map
    Logger.log('[4/4] Building field population map...');
    const fieldMap = buildFieldPopulationMap(projectData);
    Logger.log('   ✅ Ready to populate ' + Object.keys(fieldMap).length + ' fields');
    
    Logger.log('');
    Logger.log('✅ PROJECT LOADED SUCCESSFULLY');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('');
    
    return {
      success: true,
      projectName: projectName,
      fields: fieldMap,              // For form field population
      uiData: uiData,                // For UI components
      competitorAnalysis: competitorAnalysis,  // For competitor tabs
      metadata: projectData._metadata || {},
      source: projectResult.source
    };
    
  } catch (error) {
    Logger.log('❌ Load failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load competitor analysis for project
 * UPDATED to match saveToMasterGoogleSheet column structure:
 * 'Project ID', 'Timestamp', 'Domain', 'Fetch Status', 'Page Rank',
 * 'Performance', 'Accessibility', 'SEO Score', 'Schema Types',
 * 'Keywords Count', 'Internal Links', 'External Links', 'Images',
 * 'Serper Results', 'Snapshot JSON', 'API Data JSON'
 */
function loadCompetitorAnalysis(projectName) {
  try {
    // Try to load from GSheet competitor tab
    const ss = getOrCreateMasterSpreadsheet();
    if (!ss) {
      return { success: false, error: 'Master spreadsheet not found' };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 1: Try '📊 Master_Projects' sheet first (saved by DB_COMP_EliteOrchestrator)
    // This has the full JSON including Gemini analysis
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      Logger.log('   📊 Trying "📊 Master_Projects" sheet (full JSON)...');
      const masterSheet = ss.getSheetByName('📊 Master_Projects');
      if (masterSheet) {
        const masterData = masterSheet.getDataRange().getValues();
        // Headers: Project ID, Timestamp, Type, Status, Competitor Count, Workflow Stage, Your Domain, JSON Data (Full), Last Updated
        
        for (let i = masterData.length - 1; i >= 1; i--) {  // Start from most recent
          const row = masterData[i];
          const rowProjectId = String(row[0]).toLowerCase().trim();
          const searchProject = String(projectName).toLowerCase().trim();
          const rowType = String(row[2]).toLowerCase();
          
          // Match project and ensure it's competitor analysis type
          if ((rowProjectId === searchProject || 
               rowProjectId.indexOf(searchProject) >= 0 ||
               searchProject.indexOf(rowProjectId) >= 0) &&
              rowType.indexOf('competitor') >= 0) {
            
            // Found! Parse the full JSON data
            try {
              const jsonData = row[7];  // Column 8 = JSON Data (Full)
              if (jsonData && typeof jsonData === 'string' && jsonData.trim().startsWith('{')) {
                const fullData = JSON.parse(jsonData);
                Logger.log('   ✅ Loaded from "📊 Master_Projects" sheet');
                Logger.log('   📊 Has analysis: ' + !!fullData.analysis);
                Logger.log('   📊 Competitors: ' + Object.keys(fullData.competitors || {}).length);
                
                // Convert competitors object to array
                const competitorsArray = fullData.competitors ? 
                  Object.entries(fullData.competitors).map(([domain, data]) => ({
                    domain: domain,
                    ...data
                  })) : [];
                
                return {
                  success: true,
                  competitors: competitorsArray,
                  count: competitorsArray.length,
                  analysis: fullData.analysis || {},
                  geminiAnalysis: fullData.analysis || {},
                  timestamp: row[1] || new Date().toISOString(),
                  source: 'Master_Projects sheet'
                };
              }
            } catch (parseError) {
              Logger.log('   ⚠️ Could not parse JSON from Master_Projects: ' + parseError.toString());
            }
          }
        }
      }
    } catch (e) {
      Logger.log('   ⚠️ Master_Projects sheet check failed: ' + e.toString());
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 2: Try 'Competitor Analysis' sheet (saved by DB_CompetitorStorage)
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      Logger.log('   📊 Trying "Competitor Analysis" sheet (full JSON)...');
      const fullSheet = ss.getSheetByName('Competitor Analysis');
      if (fullSheet) {
        const fullData = fullSheet.getDataRange().getValues();
        // Headers: Project ID, Timestamp, Competitors, Your Domain, Data Quality, Insights Count, Charts Count, JSON Data
        
        for (let i = fullData.length - 1; i >= 1; i--) {  // Start from most recent
          const row = fullData[i];
          const rowProjectId = String(row[0]).toLowerCase().trim();
          const searchProject = String(projectName).toLowerCase().trim();
          
          if (rowProjectId === searchProject || 
              rowProjectId.indexOf(searchProject) >= 0 ||
              searchProject.indexOf(rowProjectId) >= 0) {
            
            // Found! Parse the full JSON data
            try {
              const jsonData = row[7];  // Column 8 = JSON Data
              if (jsonData && typeof jsonData === 'string' && jsonData.trim().startsWith('{')) {
                const fullAnalysis = JSON.parse(jsonData);
                Logger.log('   ✅ Loaded full analysis from "Competitor Analysis" sheet');
                Logger.log('   📊 Has geminiAnalysis: ' + !!fullAnalysis.geminiAnalysis);
                
                // Return complete data structure
                return {
                  success: true,
                  competitors: fullAnalysis.rawData ? Object.values(fullAnalysis.rawData) : [],
                  count: fullAnalysis.competitors?.length || Object.keys(fullAnalysis.rawData || {}).length,
                  analysis: fullAnalysis.geminiAnalysis || fullAnalysis.insights || {},
                  geminiAnalysis: fullAnalysis.geminiAnalysis || {},
                  timestamp: row[1] || fullAnalysis.timestamp,
                  source: 'Competitor Analysis sheet'
                };
              }
            } catch (parseError) {
              Logger.log('   ⚠️ Could not parse JSON from Competitor Analysis sheet: ' + parseError.toString());
            }
          }
        }
      }
    } catch (e) {
      Logger.log('   ⚠️ Competitor Analysis sheet check failed: ' + e.toString());
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 3: Fall back to '🎯 Competitor_Data' sheet (row-per-competitor format)
    // ═══════════════════════════════════════════════════════════════════════════
    Logger.log('   📋 Trying "🎯 Competitor_Data" sheet (row-per-competitor)...');
    const compSheet = ss.getSheetByName('🎯 Competitor_Data');
    if (!compSheet) {
      return { success: false, error: 'Competitor sheet not found' };
    }
    
    const data = compSheet.getDataRange().getValues();
    const headers = data[0];
    Logger.log('   📋 Competitor_Data headers: ' + headers.slice(0, 5).join(', ') + '...');
    
    // Find rows for this project (column 0 = Project ID)
    // Handle both projectName and projectId formats
    const projectRows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowProjectId = String(row[0]).toLowerCase().trim();
      const searchProject = String(projectName).toLowerCase().trim();
      
      // Match by project ID OR project name prefix
      if (rowProjectId === searchProject || 
          rowProjectId.indexOf(searchProject) >= 0 ||
          searchProject.indexOf(rowProjectId) >= 0 ||
          rowProjectId.indexOf('comp-') === 0) {  // Match comp-* prefixed project IDs
        projectRows.push(row);
      }
    }
    
    if (projectRows.length === 0) {
      Logger.log('   ⚠️ No competitor data found for project: ' + projectName);
      return { success: false, error: 'No competitor data found' };
    }
    
    Logger.log('   ✅ Found ' + projectRows.length + ' competitor rows');
    
    // Parse competitor data - MATCH saveToMasterGoogleSheet columns
    // Columns: [0]=Project ID, [1]=Timestamp, [2]=Domain, [3]=Fetch Status, 
    // [4]=Page Rank, [5]=Performance, [6]=Accessibility, [7]=SEO Score,
    // [8]=Schema Types, [9]=Keywords Count, [10]=Internal Links, [11]=External Links,
    // [12]=Images, [13]=Serper Results, [14]=Snapshot JSON, [15]=API Data JSON
    const competitors = projectRows.map(row => {
      // Parse JSON columns safely
      let snapshot = {};
      let apiData = {};
      
      try {
        if (row[14] && typeof row[14] === 'string' && row[14].trim().startsWith('{')) {
          snapshot = JSON.parse(row[14]);
        }
      } catch (e) { /* ignore parse error */ }
      
      try {
        if (row[15] && typeof row[15] === 'string' && row[15].trim().startsWith('{')) {
          apiData = JSON.parse(row[15]);
        }
      } catch (e) { /* ignore parse error */ }
      
      return {
        domain: row[2],  // Domain
        timestamp: row[1],  // Timestamp
        fetchSuccess: row[3] === 'Success',  // Fetch Status
        pageRank: parseFloat(row[4]) || 0,  // Page Rank
        performance: parseFloat(row[5]) || 0,  // Performance
        accessibility: parseFloat(row[6]) || 0,  // Accessibility
        seoScore: parseFloat(row[7]) || 0,  // SEO Score
        schemaTypes: row[8],  // Schema Types
        keywordsCount: parseInt(row[9]) || 0,  // Keywords Count
        internalLinks: parseInt(row[10]) || 0,  // Internal Links
        externalLinks: parseInt(row[11]) || 0,  // External Links
        images: parseInt(row[12]) || 0,  // Images
        serperResults: parseInt(row[13]) || 0,  // Serper Results
        snapshot: snapshot,
        apiData: apiData,
        // Computed metrics for UI
        authorityScore: calculateAuthorityFromData(parseFloat(row[4]) || 0, parseInt(row[13]) || 0),
        pageSpeed: parseFloat(row[5]) || 0,
        backlinks: snapshot.links?.external?.length || apiData.backlinks || 0
      };
    });
    
    return {
      success: true,
      competitors: competitors,
      count: competitors.length,
      source: 'Competitor_Data sheet'
    };
    
  } catch (error) {
    Logger.log('⚠️  Error loading competitor analysis: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculate authority score from PageRank and Serper results
 */
function calculateAuthorityFromData(pageRank, serperResults) {
  // Base authority from PageRank (0-10 scale → 0-100)
  let authority = (pageRank || 0) * 10;
  
  // Boost from Serper results (10 results = +10 authority)
  authority += Math.min(serperResults || 0, 10);
  
  // Cap at 100
  return Math.min(100, Math.max(0, Math.round(authority)));
}

/**
 * Map project data to UI component structure
 */
function mapProjectDataForUI(projectData, competitorAnalysis) {
  return {
    // Dashboard Overview
    dashboard: {
      projectName: projectData.projectName || projectData.brandName,
      brandName: projectData.brandName,
      completionPercent: projectData._metadata?.completionPercent || 0,
      workflowStage: projectData.workflowStage || 'setup',
      lastUpdated: projectData.updatedAt,
      hasCompetitors: competitorAnalysis.success,
      competitorCount: competitorAnalysis.competitors?.length || 0
    },
    
    // Workflow Stage 1: Strategy
    stage1: {
      brandIdentity: {
        brandName: projectData.brandName,
        brandIdeology: projectData.brandIdeology,
        brandArchetype: projectData.brandArchetype,
        brandLexicon: projectData.brandLexicon,
        uvp: projectData.uvp
      },
      audience: {
        targetAudience: projectData.targetAudience,
        audiencePains: projectData.audiencePains,
        audienceDesired: projectData.audienceDesired,
        demographics: projectData.customerDemographics
      },
      market: {
        coreTopic: projectData.coreTopic,
        coreMarketProblem: projectData.coreMarketProblem,
        competitiveAdvantages: projectData.competitiveAdvantages,
        keyCompetitors: projectData.keyCompetitors
      },
      strategy: {
        quarterlyObjective: projectData.quarterlyObjective,
        northStarKpis: projectData.northStarKpis,
        futureVision: projectData.futureVision
      }
    },
    
    // Workflow Stage 2: Keywords
    stage2: {
      primaryKeyword: projectData.primaryKeyword,
      secondaryKeywords: projectData.secondaryKeywords,
      keywordsEntities: projectData.keywordsEntities,
      contentGoals: projectData.contentGoals
    },
    
    // Workflow Stage 3: Architecture
    stage3: {
      foundationalPillars: projectData.foundationalPillars,
      pillarContext: projectData.pillarContext,
      parentPillarUrl: projectData.parentPillarUrl,
      childSpokeUrls: projectData.childSpokeUrls,
      internalLinkingStrategy: projectData.internalLinkingStrategy,
      categoryDefinition: projectData.categoryDefinition
    },
    
    // Workflow Stage 4: Calendar
    stage4: {
      primaryChannels: projectData.primaryChannels,
      contentFormats: projectData.contentFormats,
      postsPerWeek: projectData.postsPerWeek || 5,
      seasonality: projectData.seasonality,
      calendarHorizon: projectData.calendarHorizon,
      campaignNarrative: projectData.campaignNarrative
    },
    
    // Workflow Stage 5: Generation
    stage5: {
      primaryKeyword: projectData.primaryKeyword,
      contentType: projectData.contentType,
      contentFormat: projectData.contentFormat,
      funnelStage: projectData.funnelStage,
      authorBio: projectData.authorBio,
      persuasionFramework: projectData.persuasionFramework,
      uniqueMechanism: projectData.uniqueMechanism,
      forbiddenTerms: projectData.forbiddenTerms,
      readabilityDirectives: projectData.readabilityDirectives,
      schemaArticle: projectData.schemaArticle !== false,
      schemaFaq: projectData.schemaFaq !== false
    },
    
    // Competitor Intelligence
    competitors: competitorAnalysis.success ? {
      hasData: true,
      competitors: competitorAnalysis.competitors,
      count: competitorAnalysis.competitors.length,
      // Map to 15 intelligence categories
      categories: mapCompetitorDataToCategories(competitorAnalysis.competitors)
    } : {
      hasData: false,
      message: 'Run competitor analysis to see insights'
    },
    
    // Offer Structure (for conversion optimization)
    offers: {
      primary: {
        name: projectData.primaryOfferName,
        price: projectData.primaryOfferPrice
      },
      upsell: {
        name: projectData.upsellOffer,
        price: projectData.upsellPrice
      },
      leadMagnet: projectData.leadMagnetName,
      matrix: projectData.offerMatrix,
      bundles: [
        { name: projectData.bundle1Name, value: projectData.bundle1Value },
        { name: projectData.bundle2Name, value: projectData.bundle2Value },
        { name: projectData.bundle3Name, value: projectData.bundle3Value },
        { name: projectData.bundle4Name, value: projectData.bundle4Value }
      ].filter(b => b.name)
    },
    
    // Proof Elements (for E-E-A-T)
    proof: {
      social: projectData.socialProof,
      testimonials: [
        projectData.testimonial1,
        projectData.testimonial2
      ].filter(t => t),
      caseStudies: [
        projectData.caseStudy1,
        projectData.caseStudy2,
        projectData.caseStudy3
      ].filter(c => c),
      expertQuotes: [
        projectData.expertQuote1,
        projectData.expertQuote2
      ].filter(q => q),
      trustAnchors: projectData.trustAnchors,
      proprietaryData: projectData.proprietaryData,
      primarySources: [
        projectData.primarySource1,
        projectData.primarySource2
      ].filter(s => s)
    }
  };
}

/**
 * Map competitor data to 15 intelligence categories for tab display
 */
function mapCompetitorDataToCategories(competitors) {
  if (!competitors || competitors.length === 0) {
    return [];
  }
  
  // Extract analysis categories from competitor data
  const categories = [];
  
  competitors.forEach(comp => {
    if (comp.analysis && comp.analysis.categories) {
      comp.analysis.categories.forEach(cat => {
        // Find existing category or create new
        let existing = categories.find(c => c.name === cat.name);
        if (!existing) {
          existing = {
            name: cat.name,
            competitors: []
          };
          categories.push(existing);
        }
        
        // Add this competitor's data to category
        existing.competitors.push({
          domain: comp.domain,
          insights: cat.insights || [],
          recommendations: cat.recommendations || [],
          score: cat.score || 0,
          data: cat.data || {}
        });
      });
    }
  });
  
  return categories;
}

/**
 * Build field population map for form fields
 * Returns object with fieldId → value mappings
 */
function buildFieldPopulationMap(projectData) {
  const fieldMap = {};
  
  // Get all field IDs from schema
  const allFields = getAllProjectFieldIds();
  
  allFields.forEach(fieldId => {
    // Get value from project data
    const value = projectData[fieldId];
    
    if (value !== undefined && value !== null) {
      // Convert to string for form fields
      if (typeof value === 'boolean') {
        fieldMap[fieldId] = value ? 'on' : 'off';
      } else if (typeof value === 'object') {
        fieldMap[fieldId] = JSON.stringify(value);
      } else {
        fieldMap[fieldId] = String(value);
      }
    } else {
      // Use default value from schema if available
      const fieldMeta = getFieldMeta(fieldId);
      if (fieldMeta && fieldMeta.default !== undefined) {
        fieldMap[fieldId] = String(fieldMeta.default);
      } else {
        fieldMap[fieldId] = '';  // Empty string for unpopulated fields
      }
    }
  });
  
  return fieldMap;
}

/**
 * Get list of all projects for dropdown
 */
function listAllProjects() {
  try {
    const ss = getOrCreateMasterSpreadsheet();
    if (!ss) {
      return { success: false, error: 'Master spreadsheet not found' };
    }
    
    const masterSheet = ss.getSheetByName('📊 Master_Projects');
    if (!masterSheet) {
      return { success: false, error: 'Master projects sheet not found' };
    }
    
    const data = masterSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, projects: [] };
    }
    
    // Extract project names (column A, skip header)
    const projects = [];
    for (let i = 1; i < data.length; i++) {
      const projectName = data[i][0];
      const status = data[i][5];  // Status column
      
      if (projectName && status !== 'deleted') {
        projects.push({
          name: projectName,
          workflowStage: data[i][4],
          updatedAt: data[i][3],
          status: status
        });
      }
    }
    
    // Sort by most recently updated
    projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      projects: projects
    };
    
  } catch (error) {
    Logger.log('❌ Error listing projects: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * ENHANCED: Update DB_COMP_executeEliteAnalysis to use project context
 * This wraps the original function and injects project data
 */
function runCompetitorAnalysisWithProject(competitors, projectName) {
  try {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🎯 COMPETITOR ANALYSIS WITH PROJECT CONTEXT');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('   Project: ' + projectName);
    Logger.log('   Competitors: ' + competitors.length);
    
    // 1. Load project data
    const projectResult = loadProjectElite(projectName);
    if (!projectResult.success) {
      throw new Error('Failed to load project: ' + projectResult.error);
    }
    
    const projectData = projectResult.data;
    Logger.log('   ✅ Project data loaded');
    
    // 2. Build Gemini context from project
    const geminiContext = buildGeminiProjectContext(projectData);
    Logger.log('   ✅ Gemini context built');
    
    // 3. Run competitor analysis with enriched context
    const config = {
      competitors: competitors,
      yourDomain: projectData.brandName || 'Your Brand',
      projectContext: geminiContext,
      projectId: projectData.projectId || 'proj_' + Date.now()
    };
    
    Logger.log('   🚀 Running analysis...');
    const result = DB_COMP_executeEliteAnalysis(config);
    
    if (result.success) {
      Logger.log('   ✅ Analysis complete');
      
      // 4. Save competitor results to project
      saveCompetitorResultsToProject(projectName, result);
    }
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('');
    
    return result;
    
  } catch (error) {
    Logger.log('❌ Analysis failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Save competitor results to project's GSheet tab
 */
function saveCompetitorResultsToProject(projectName, analysisResult) {
  try {
    const ss = getOrCreateMasterSpreadsheet();
    if (!ss) return;
    
    const compSheet = ss.getSheetByName('🎯 Competitor_Data');
    if (!compSheet) return;
    
    // Remove old data for this project
    const data = compSheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === projectName) {
        compSheet.deleteRow(i + 1);
      }
    }
    
    // Add new competitor data
    if (analysisResult.competitors && Array.isArray(analysisResult.competitors)) {
      analysisResult.competitors.forEach(comp => {
        compSheet.appendRow([
          projectName,
          comp.domain,
          new Date().toISOString(),
          comp.apiData?.openPageRank?.rank || 0,
          comp.apiData?.pageSpeed?.performance || 0,
          comp.apiData?.serper?.backlinks || 0,
          0,  // Content score (calculated)
          comp.snapshot?.metadata?.techStack || '',
          JSON.stringify(comp),  // Raw data
          JSON.stringify(analysisResult.analysis)  // Gemini analysis
        ]);
      });
    }
    
    Logger.log('   ✅ Saved ' + (analysisResult.competitors?.length || 0) + ' competitors to GSheet');
    
  } catch (error) {
    Logger.log('   ⚠️  Error saving competitor results: ' + error.toString());
  }
}

Logger.log('✅ UI_ProjectLoader.gs loaded');

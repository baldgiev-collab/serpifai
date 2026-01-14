/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROJECT LOADER ADAPTER - Connects UI to Dual Manager
 * ═══════════════════════════════════════════════════════════════════════════
 * This adapter ensures UI_ProjectLoader.gs uses the correct User_Projects tab
 * via UI_ProjectManager_Dual.gs functions
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Adapter: Replace loadProjectElite() with this
 * This uses the Dual manager which works with User_Projects (90 columns)
 */
function loadProjectElite(projectName) {
  try {
    Logger.log('🔄 [ADAPTER] Routing to Dual manager for: ' + projectName);
    
    // Use the Dual manager function (works with User_Projects tab)
    const result = loadProjectFromMasterSheet(projectName);
    
    if (!result || !result.success) {
      // Fallback: Try unified load
      Logger.log('   ⚠️  Dual manager failed, trying unified load...');
      return loadProjectUnified(projectName);
    }
    
    Logger.log('   ✅ Loaded from User_Projects tab');
    return result;
    
  } catch (e) {
    Logger.log('   ❌ Adapter error: ' + e.toString());
    
    // Last resort: Try unified
    try {
      return loadProjectUnified(projectName);
    } catch (e2) {
      return {
        success: false,
        error: 'Failed to load project: ' + e2.toString()
      };
    }
  }
}

/**
 * Adapter: Enhanced save that ensures User_Projects is used
 */
function saveProjectElite(projectName, projectData) {
  try {
    Logger.log('🔄 [ADAPTER] Routing save to Dual manager for: ' + projectName);
    
    // Use the Dual manager save (works with User_Projects tab)
    const result = saveProjectToMasterSheet(projectName, projectData);
    
    if (result.success) {
      Logger.log('   ✅ Saved to User_Projects tab');
    }
    
    return result;
    
  } catch (e) {
    Logger.log('   ❌ Adapter save error: ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Adapter: List projects from User_Projects tab
 */
function listAllProjectsElite() {
  try {
    Logger.log('🔄 [ADAPTER] Routing listAll to Dual manager');
    
    // Use Dual manager function
    const result = listProjectsUnified();
    
    if (result && result.success) {
      Logger.log('   ✅ Listed ' + result.projects.length + ' projects from User_Projects');
      return result;
    }
    
    // Fallback: Try Master_Projects
    Logger.log('   ⚠️  Trying fallback...');
    return listProjectsFromMasterSheet();
    
  } catch (e) {
    Logger.log('   ❌ Adapter list error: ' + e.toString());
    return {
      success: false,
      error: e.toString(),
      projects: []
    };
  }
}

/**
 * Build Gemini project context (compatible with both managers)
 */
function buildGeminiProjectContext(projectData) {
  try {
    if (!projectData) {
      return {};
    }
    
    // Structured context for Gemini API
    return {
      brand: {
        name: projectData.brandName || projectData.projectName || '',
        ideology: projectData.brandIdeology || '',
        archetype: projectData.brandArchetype || '',
        lexicon: projectData.brandLexicon || '',
        uvp: projectData.uvp || '',
        messaging: projectData.existingMessaging || ''
      },
      
      audience: {
        primary: projectData.targetAudience || '',
        pains: projectData.audiencePains || '',
        desired: projectData.audienceDesired || '',
        secondary: projectData.secondaryAudience || '',
        demographics: projectData.demographics || '',
        geography: projectData.geography || '',
        industry: projectData.industry || ''
      },
      
      market: {
        coreTopic: projectData.coreTopic || '',
        coreMarketProblem: projectData.coreMarketProblem || '',
        keyCompetitors: projectData.keyCompetitors || '',
        competitiveAdvantages: projectData.competitiveAdvantages || ''
      },
      
      strategy: {
        quarterlyObjective: projectData.quarterlyObjective || '',
        northStarKpis: projectData.northStarKpis || '',
        contentGoals: projectData.contentGoals || '',
        futureVision: projectData.futureVision || ''
      },
      
      content: {
        primaryChannels: projectData.primaryChannels || '',
        contentFormats: projectData.contentFormats || '',
        postsPerWeek: projectData.postsPerWeek || '',
        seasonality: projectData.seasonality || '',
        calendarHorizon: projectData.calendarHorizon || ''
      },
      
      offers: {
        primaryOfferName: projectData.primaryOfferName || '',
        primaryOfferPrice: projectData.primaryOfferPrice || '',
        upsellOfferName: projectData.upsellOfferName || '',
        upsellOfferPrice: projectData.upsellOfferPrice || '',
        leadMagnet: projectData.leadMagnet || '',
        offerMatrix: projectData.offerMatrix || ''
      },
      
      proof: {
        socialProof: projectData.socialProof || '',
        testimonials: [
          projectData.testimonial1 || '',
          projectData.testimonial2 || ''
        ].filter(t => t),
        caseStudies: [
          projectData.caseStudy1 || '',
          projectData.caseStudy2 || '',
          projectData.caseStudy3 || ''
        ].filter(c => c),
        expertQuotes: [
          projectData.expertQuote1 || '',
          projectData.expertQuote2 || ''
        ].filter(q => q),
        trustAnchors: projectData.trustAnchors || '',
        proprietaryData: projectData.proprietaryData || '',
        marketData: projectData.marketData || ''
      },
      
      aiPersona: projectData.aiPersonaContext || '',
      platformContext: projectData.platformContext || ''
    };
    
  } catch (e) {
    Logger.log('⚠️  Error building Gemini context: ' + e.toString());
    return {};
  }
}

/**
 * Get all project field IDs
 */
function getAllProjectFieldIds() {
  return [
    // Core (4)
    'brandName', 'targetAudience', 'coreTopic', 'productOrService',
    
    // Brand (5)
    'brandIdeology', 'brandArchetype', 'brandLexicon', 'uvp', 'existingMessaging',
    
    // Audience (6)
    'audiencePains', 'audienceDesired', 'secondaryAudience', 
    'demographics', 'geography', 'industry',
    
    // Competitive (3)
    'keyCompetitors', 'competitiveAdvantages', 'coreMarketProblem',
    
    // Strategy (4)
    'quarterlyObjective', 'northStarKpis', 'contentGoals', 'futureVision',
    
    // Content (5)
    'primaryChannels', 'contentFormats', 'postsPerWeek', 
    'seasonality', 'calendarHorizon',
    
    // Offers (16)
    'primaryOfferName', 'primaryOfferPrice', 'upsellOfferName', 'upsellOfferPrice',
    'leadMagnet', 'offerMatrix',
    'bundle1Name', 'bundle1Price', 'bundle1Items',
    'bundle2Name', 'bundle2Price', 'bundle2Items',
    'bundle3Name', 'bundle3Price', 'bundle3Items',
    'offerStackSequence',
    
    // Proof (13)
    'socialProof', 'testimonial1', 'testimonial2',
    'caseStudy1', 'caseStudy2', 'caseStudy3',
    'expertQuote1', 'expertQuote2',
    'trustAnchors', 'proprietaryData', 'marketData',
    'primarySource1', 'primarySource2',
    
    // Architecture (6)
    'foundationalPillars', 'pillarContext', 'parentPillar',
    'childSpokes', 'internalLinkingStrategy', 'categoryDefinition',
    
    // Keywords (3)
    'primaryKeyword', 'secondaryKeywords', 'keywordsEntities',
    
    // Generation (5)
    'authorBio', 'persuasionFramework', 'uniqueMechanism',
    'forbiddenTerms', 'readabilityDirectives',
    
    // Technical (4)
    'schemaArticle', 'schemaFaq', 'visualHooks', 'assetTitle',
    
    // AI Context (2)
    'aiPersonaContext', 'platformContext'
  ];
}

/**
 * DIAGNOSTIC: Test the adapter connections
 */
function testAdapterConnections() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TESTING ADAPTER CONNECTIONS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  // Test 1: Check if Dual manager functions exist
  Logger.log('');
  Logger.log('[TEST 1] Checking Dual manager functions...');
  
  const dualFunctions = [
    'saveProjectToMasterSheet',
    'loadProjectFromMasterSheet',
    'listProjectsUnified',
    'loadProjectUnified'
  ];
  
  dualFunctions.forEach(funcName => {
    const exists = typeof this[funcName] === 'function';
    Logger.log(`   ${exists ? '✅' : '❌'} ${funcName}`);
  });
  
  // Test 2: Check GSheet structure
  Logger.log('');
  Logger.log('[TEST 2] Checking GSheet structure...');
  
  try {
    const ss = getOrCreateMasterSpreadsheet();
    Logger.log('   ✅ Master spreadsheet accessible');
    
    const userProjects = ss.getSheetByName('📝 User_Projects');
    if (userProjects) {
      const cols = userProjects.getLastColumn();
      const rows = userProjects.getLastRow();
      Logger.log(`   ✅ User_Projects exists (${cols} columns, ${rows} rows)`);
      
      if (cols === 90) {
        Logger.log('   ✅ CORRECT 90-column structure!');
      } else {
        Logger.log(`   ⚠️  Expected 90 columns, found ${cols}`);
      }
    } else {
      Logger.log('   ❌ User_Projects not found - run setupUserProjectsTab()');
    }
    
    const masterProjects = ss.getSheetByName('📊 Master_Projects');
    if (masterProjects) {
      const rows = masterProjects.getLastRow() - 1;
      Logger.log(`   ✅ Master_Projects exists (${rows} projects in old format)`);
    }
    
  } catch (e) {
    Logger.log('   ❌ GSheet check failed: ' + e.toString());
  }
  
  // Test 3: Try loading a project
  Logger.log('');
  Logger.log('[TEST 3] Testing project load...');
  
  try {
    const projects = listAllProjectsElite();
    if (projects.success && projects.projects.length > 0) {
      const firstProject = projects.projects[0].name;
      Logger.log(`   ✅ Found ${projects.projects.length} projects`);
      Logger.log(`   Testing load: ${firstProject}`);
      
      const result = loadProjectElite(firstProject);
      if (result.success) {
        Logger.log(`   ✅ Successfully loaded ${firstProject}`);
        Logger.log(`   Fields returned: ${Object.keys(result.data || {}).length}`);
      } else {
        Logger.log(`   ❌ Load failed: ${result.error}`);
      }
    } else {
      Logger.log('   ⚠️  No projects found to test');
    }
  } catch (e) {
    Logger.log('   ❌ Test failed: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🎯 NEXT STEPS:');
  Logger.log('   1. If User_Projects missing: Run setupUserProjectsTab()');
  Logger.log('   2. Migrate old projects: Run resaveExistingProjects()');
  Logger.log('   3. Test auto-population in UI');
  Logger.log('═══════════════════════════════════════════════════════════');
}

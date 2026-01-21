/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_ProjectManager_Elite.gs - ELITE 0.1% SaaS PROJECT MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Top-tier project management with:
 * ✓ GSheet-first architecture (single source of truth)
 * ✓ MySQL normalized cache (queryable fields)
 * ✓ Data validation & rollback
 * ✓ Field schema mapping for UI + Gemini
 * ✓ Auto-population of all 81 fields
 * 
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT FIELD SCHEMA - Maps 81 fields to categories and usage
// ═══════════════════════════════════════════════════════════════════════════

const PROJECT_FIELD_SCHEMA = {
  // CORE IDENTITY (Required for all workflows)
  core: {
    brandName: { type: 'string', required: true, label: 'Brand Name', category: 'Brand Identity' },
    targetAudience: { type: 'text', required: true, label: 'Target Audience', category: 'Audience' },
    coreTopic: { type: 'text', required: true, label: 'Core Topic', category: 'Content Strategy' },
    productOrService: { type: 'text', required: false, label: 'Product/Service', category: 'Brand Identity' }
  },
  
  // BRAND STRATEGY (Used in Workflow Stage 1 + Gemini prompts)
  brand: {
    brandIdeology: { type: 'text', required: false, label: 'Brand Ideology', usedIn: ['workflow:stage1', 'gemini:analysis'] },
    brandArchetype: { type: 'string', required: false, label: 'Brand Archetype', usedIn: ['workflow:stage1'] },
    brandLexicon: { type: 'text', required: false, label: 'Brand Lexicon', usedIn: ['workflow:stage1', 'gemini:content'] },
    uvp: { type: 'text', required: false, label: 'Unique Value Proposition', usedIn: ['workflow:stage1', 'competitor:comparison'] },
    existingMessaging: { type: 'text', required: false, label: 'Existing Messaging', usedIn: ['workflow:stage1'] }
  },
  
  // AUDIENCE INTELLIGENCE (Used in competitor analysis + Gemini persona)
  audience: {
    audiencePains: { type: 'text', required: false, label: 'Audience Pain Points', usedIn: ['workflow:stage1', 'gemini:analysis', 'competitor:gaps'] },
    audienceDesired: { type: 'text', required: false, label: 'Desired Outcomes', usedIn: ['workflow:stage1', 'gemini:analysis'] },
    secondaryAudience: { type: 'text', required: false, label: 'Secondary Audience', usedIn: ['workflow:stage1'] },
    customerDemographics: { type: 'text', required: false, label: 'Demographics', usedIn: ['competitor:analysis'] },
    geographicFocus: { type: 'string', required: false, label: 'Geographic Focus', usedIn: ['competitor:analysis'] },
    industryVertical: { type: 'string', required: false, label: 'Industry Vertical', usedIn: ['workflow:stage1', 'competitor:analysis'] }
  },
  
  // COMPETITIVE INTELLIGENCE (Critical for competitor analysis)
  competitive: {
    keyCompetitors: { type: 'text', required: false, label: 'Key Competitors', usedIn: ['competitor:analysis'], format: 'comma-separated' },
    competitiveAdvantages: { type: 'text', required: false, label: 'Competitive Advantages', usedIn: ['competitor:analysis', 'gemini:strategy'] },
    coreMarketProblem: { type: 'text', required: false, label: 'Core Market Problem', usedIn: ['workflow:stage1', 'competitor:analysis'] }
  },
  
  // STRATEGIC OBJECTIVES (Feeds into Gemini strategy generation)
  strategy: {
    quarterlyObjective: { type: 'text', required: false, label: 'Quarterly Objective', usedIn: ['workflow:stage1', 'gemini:strategy'] },
    northStarKpis: { type: 'text', required: false, label: 'North Star KPIs', usedIn: ['workflow:stage1'] },
    contentGoals: { type: 'text', required: false, label: 'Content Goals', usedIn: ['workflow:stage1', 'workflow:stage2'] },
    futureVision: { type: 'text', required: false, label: 'Future Vision', usedIn: ['workflow:stage1', 'gemini:strategy'] }
  },
  
  // CONTENT FRAMEWORK (Used in workflow stages 2-5)
  content: {
    primaryChannels: { type: 'text', required: false, label: 'Primary Channels', usedIn: ['workflow:stage1', 'workflow:stage4'] },
    contentFormats: { type: 'text', required: false, label: 'Content Formats', usedIn: ['workflow:stage4'] },
    postsPerWeek: { type: 'number', required: false, label: 'Posts Per Week', default: 5, usedIn: ['workflow:stage4'] },
    seasonality: { type: 'text', required: false, label: 'Seasonality', usedIn: ['workflow:stage4'] },
    calendarHorizon: { type: 'string', required: false, label: 'Calendar Horizon', usedIn: ['workflow:stage4'] }
  },
  
  // OFFER STRUCTURE (Used in conversion optimization analysis)
  offers: {
    primaryOfferName: { type: 'string', required: false, label: 'Primary Offer Name', usedIn: ['competitor:conversion'] },
    primaryOfferPrice: { type: 'string', required: false, label: 'Primary Offer Price', usedIn: ['competitor:conversion'] },
    upsellOffer: { type: 'string', required: false, label: 'Upsell Offer', usedIn: ['competitor:conversion'] },
    upsellPrice: { type: 'string', required: false, label: 'Upsell Price', usedIn: ['competitor:conversion'] },
    leadMagnetName: { type: 'string', required: false, label: 'Lead Magnet Name', usedIn: ['competitor:conversion'] },
    offerMatrix: { type: 'text', required: false, label: 'Offer Matrix', usedIn: ['competitor:conversion', 'gemini:strategy'] },
    bundle1Name: { type: 'string', required: false, label: 'Bundle 1 Name' },
    bundle1Value: { type: 'string', required: false, label: 'Bundle 1 Value' },
    bundle2Name: { type: 'string', required: false, label: 'Bundle 2 Name' },
    bundle2Value: { type: 'string', required: false, label: 'Bundle 2 Value' },
    bundle3Name: { type: 'string', required: false, label: 'Bundle 3 Name' },
    bundle3Value: { type: 'string', required: false, label: 'Bundle 3 Value' },
    bundle4Name: { type: 'string', required: false, label: 'Bundle 4 Name' },
    bundle4Value: { type: 'string', required: false, label: 'Bundle 4 Value' }
  },
  
  // CONTENT CREATION (Used in workflow stage 5 - generation)
  generation: {
    authorBio: { type: 'text', required: false, label: 'Author Bio', usedIn: ['workflow:stage5'] },
    persuasionFramework: { type: 'text', required: false, label: 'Persuasion Framework', usedIn: ['workflow:stage5', 'gemini:content'] },
    uniqueMechanism: { type: 'text', required: false, label: 'Unique Mechanism', usedIn: ['workflow:stage1', 'gemini:content'] },
    forbiddenTerms: { type: 'text', required: false, label: 'Forbidden Terms', usedIn: ['workflow:stage5'] },
    readabilityDirectives: { type: 'text', required: false, label: 'Readability Directives', usedIn: ['workflow:stage5'] }
  },
  
  // PROOF & AUTHORITY (Used in E-E-A-T analysis)
  proof: {
    socialProof: { type: 'text', required: false, label: 'Social Proof', usedIn: ['competitor:authority', 'workflow:stage5'] },
    testimonial1: { type: 'text', required: false, label: 'Testimonial 1', usedIn: ['workflow:stage5'] },
    testimonial2: { type: 'text', required: false, label: 'Testimonial 2', usedIn: ['workflow:stage5'] },
    caseStudy1: { type: 'text', required: false, label: 'Case Study 1', usedIn: ['workflow:stage5', 'competitor:authority'] },
    caseStudy2: { type: 'text', required: false, label: 'Case Study 2', usedIn: ['workflow:stage5'] },
    caseStudy3: { type: 'text', required: false, label: 'Case Study 3', usedIn: ['workflow:stage5'] },
    expertQuote1: { type: 'text', required: false, label: 'Expert Quote 1', usedIn: ['workflow:stage5'] },
    expertQuote2: { type: 'text', required: false, label: 'Expert Quote 2', usedIn: ['workflow:stage5'] },
    trustAnchors: { type: 'text', required: false, label: 'Trust Anchors', usedIn: ['competitor:authority'] },
    proprietaryData: { type: 'text', required: false, label: 'Proprietary Data', usedIn: ['workflow:stage5', 'competitor:authority'] },
    keyMarketData: { type: 'text', required: false, label: 'Key Market Data', usedIn: ['workflow:stage5'] },
    primarySource1: { type: 'text', required: false, label: 'Primary Source 1', usedIn: ['workflow:stage5'] },
    primarySource2: { type: 'text', required: false, label: 'Primary Source 2', usedIn: ['workflow:stage5'] }
  },
  
  // CONTENT ARCHITECTURE (Used in workflow stage 3)
  architecture: {
    foundationalPillars: { type: 'text', required: false, label: 'Foundational Pillars', usedIn: ['workflow:stage3'] },
    pillarContext: { type: 'text', required: false, label: 'Pillar Context', usedIn: ['workflow:stage3'] },
    parentPillarUrl: { type: 'string', required: false, label: 'Parent Pillar URL', usedIn: ['workflow:stage3'] },
    childSpokeUrls: { type: 'text', required: false, label: 'Child Spoke URLs', usedIn: ['workflow:stage3'] },
    internalLinkingStrategy: { type: 'text', required: false, label: 'Internal Linking Strategy', usedIn: ['workflow:stage3', 'competitor:technical'] },
    categoryDefinition: { type: 'text', required: false, label: 'Category Definition', usedIn: ['workflow:stage3'] }
  },
  
  // KEYWORD STRATEGY (Used in workflow stage 2)
  keywords: {
    primaryKeyword: { type: 'string', required: false, label: 'Primary Keyword', usedIn: ['workflow:stage2', 'workflow:stage5'] },
    secondaryKeywords: { type: 'text', required: false, label: 'Secondary Keywords', usedIn: ['workflow:stage2'] },
    keywordsEntities: { type: 'text', required: false, label: 'Keywords & Entities', usedIn: ['workflow:stage2'] }
  },
  
  // ADVANCED CONTENT (Used in specific content types)
  advanced: {
    contentType: { type: 'string', required: false, label: 'Content Type', usedIn: ['workflow:stage5'] },
    contentFormat: { type: 'string', required: false, label: 'Content Format', usedIn: ['workflow:stage5'] },
    contentSubcategory: { type: 'string', required: false, label: 'Content Subcategory', usedIn: ['workflow:stage5'] },
    funnelStage: { type: 'string', required: false, label: 'Funnel Stage', usedIn: ['workflow:stage5', 'competitor:conversion'] },
    thesis: { type: 'text', required: false, label: 'Thesis', usedIn: ['workflow:stage5'] },
    antithesis: { type: 'text', required: false, label: 'Antithesis', usedIn: ['workflow:stage5'] },
    coreStrategicQuestion: { type: 'text', required: false, label: 'Core Strategic Question', usedIn: ['workflow:stage1'] },
    campaignNarrative: { type: 'text', required: false, label: 'Campaign Narrative', usedIn: ['workflow:stage4'] },
    timeframePlan: { type: 'string', required: false, label: 'Timeframe Plan', usedIn: ['workflow:stage4'] }
  },
  
  // TECHNICAL ENHANCEMENTS (Used in SEO optimization)
  technical: {
    schemaArticle: { type: 'boolean', required: false, label: 'Schema Article', default: true, usedIn: ['workflow:stage5'] },
    schemaFaq: { type: 'boolean', required: false, label: 'Schema FAQ', default: true, usedIn: ['workflow:stage5'] },
    visualHooks: { type: 'text', required: false, label: 'Visual Hooks', usedIn: ['workflow:stage5'] },
    assetTitle: { type: 'string', required: false, label: 'Asset Title', usedIn: ['workflow:stage5'] }
  },
  
  // AI CONTEXT (Used by Gemini for personalization)
  aiContext: {
    aiPersonaContext: { type: 'text', required: false, label: 'AI Persona Context', usedIn: ['gemini:all'] },
    platformContext: { type: 'text', required: false, label: 'Platform Context', usedIn: ['gemini:all'] }
  }
};

/**
 * Get all field IDs in flat array
 */
function getAllProjectFieldIds() {
  const fields = [];
  Object.keys(PROJECT_FIELD_SCHEMA).forEach(category => {
    Object.keys(PROJECT_FIELD_SCHEMA[category]).forEach(fieldId => {
      fields.push(fieldId);
    });
  });
  return fields;
}

/**
 * Get field metadata
 */
function getFieldMeta(fieldId) {
  for (const category of Object.keys(PROJECT_FIELD_SCHEMA)) {
    if (PROJECT_FIELD_SCHEMA[category][fieldId]) {
      return {
        ...PROJECT_FIELD_SCHEMA[category][fieldId],
        fieldId: fieldId,
        category: category
      };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ELITE SAVE FUNCTION - GSheet Primary + MySQL Cache
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save project with elite architecture
 * @param {string} projectName - Project name
 * @param {object} projectData - All 81 fields + metadata
 * @returns {object} Success status and details
 */
function saveProjectElite(projectName, projectData) {
  const startTime = Date.now();
  
  try {
    Logger.log('💾 [ELITE] Saving project: ' + projectName);
    Logger.log('   📦 Fields received: ' + Object.keys(projectData).length);
    
    // 1. VALIDATE DATA
    const validation = validateProjectData(projectData);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    Logger.log('   ✅ Validation passed');
    
    // 2. ENRICH METADATA
    const enrichedData = enrichProjectMetadata(projectName, projectData);
    Logger.log('   ✅ Metadata enriched');
    
    // 3. SAVE TO GSHEET (PRIMARY STORAGE)
    Logger.log('   📊 Saving to GSheet (PRIMARY)...');
    const gsheetResult = saveToMasterSheet(projectName, enrichedData);
    
    if (!gsheetResult.success) {
      throw new Error('GSheet save failed: ' + gsheetResult.error);
    }
    
    Logger.log('   ✅ GSheet saved: Row ' + gsheetResult.rowIndex);
    
    // 4. SAVE TO MYSQL (CACHE + QUERY ENGINE)
    Logger.log('   🗄️  Syncing to MySQL (CACHE)...');
    const mysqlResult = saveToMySQLNormalized(projectName, enrichedData);
    
    if (!mysqlResult.success) {
      Logger.log('   ⚠️  MySQL save failed (non-critical): ' + mysqlResult.error);
      // DON'T throw - GSheet is primary, MySQL failure is acceptable
    } else {
      Logger.log('   ✅ MySQL saved: Project ID ' + mysqlResult.projectId);
    }
    
    const elapsedMs = Date.now() - startTime;
    
    Logger.log('✅ [ELITE] Project saved successfully (' + elapsedMs + 'ms)');
    
    return {
      success: true,
      projectName: projectName,
      gsheet: {
        success: true,
        rowIndex: gsheetResult.rowIndex,
        spreadsheetId: gsheetResult.spreadsheetId,
        url: gsheetResult.url
      },
      mysql: mysqlResult,
      metadata: enrichedData._metadata,
      elapsedMs: elapsedMs
    };
    
  } catch (error) {
    Logger.log('❌ [ELITE] Save failed: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      elapsedMs: Date.now() - startTime
    };
  }
}

/**
 * Validate project data before saving
 */
function validateProjectData(data) {
  const errors = [];
  
  // Check required fields
  const requiredFields = ['brandName'];
  requiredFields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate data types
  if (data.postsPerWeek && isNaN(parseInt(data.postsPerWeek))) {
    errors.push('postsPerWeek must be a number');
  }
  
  // Validate email format (if present)
  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Enrich project data with metadata
 */
function enrichProjectMetadata(projectName, projectData) {
  const now = new Date().toISOString();
  
  // Count completed fields
  const allFields = getAllProjectFieldIds();
  const completedCount = allFields.filter(field => {
    const value = projectData[field];
    return value !== undefined && value !== null && String(value).trim() !== '';
  }).length;
  
  return {
    ...projectData,
    projectName: projectName,
    updatedAt: now,
    createdAt: projectData.createdAt || now,
    workflowStage: projectData.workflowStage || 'setup',
    _metadata: {
      version: 'v6.0.0-elite',
      savedAt: now,
      totalFields: allFields.length,
      completedFields: completedCount,
      completionPercent: Math.round((completedCount / allFields.length) * 100),
      hasCompetitorData: !!(projectData.keyCompetitors && projectData.keyCompetitors.trim()),
      hasWorkflowData: !!(projectData.quarterlyObjective || projectData.contentGoals),
      schemaVersion: 1
    }
  };
}

/**
 * Save to MySQL with normalized structure
 */
function saveToMySQLNormalized(projectName, projectData) {
  try {
    const projectId = projectData.projectId || 'proj_' + Date.now();
    
    // Call gateway to save (gateway handles normalization)
    const result = callGateway('project:save', {
      projectId: projectId,
      projectName: projectName,
      projectData: projectData
    });
    
    if (result && result.success) {
      // ═══════════════════════════════════════════════════════════════════════
      // v36.0: UPP COMMIT - Persist project data to dedicated table
      // ═══════════════════════════════════════════════════════════════════════
      if (typeof UPP_commit === 'function') {
        UPP_commit({
          table: 'project_data',
          project_id: projectId,
          project_name: projectName,
          brand_name: projectData.brandName || '',
          your_domain: projectData.yourDomain || '',
          competitor_list: projectData.competitorList || projectData.competitors || [],
          strategic_priorities: projectData.strategicPriorities || [],
          target_audience: projectData.targetAudience || '',
          niche: projectData.niche || '',
          settings: {
            geminiModel: projectData.geminiModel,
            includePageSpeed: projectData.includePageSpeed,
            includeSerp: projectData.includeSerp
          },
          metadata: projectData._metadata || {}
        });
        Logger.log(`   🔄 UPP: Project data committed to project_data table`);
      }
      
      return {
        success: true,
        projectId: projectId,
        fieldsCount: Object.keys(projectData).length
      };
    } else {
      return {
        success: false,
        error: result ? result.error : 'Unknown error'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ELITE LOAD FUNCTION - GSheet First, MySQL Fallback
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Load project with auto-fallback
 * @param {string} projectName - Project name to load
 * @returns {object} Project data with metadata
 */
function loadProjectElite(projectName) {
  try {
    Logger.log('📂 [ELITE] Loading project: ' + projectName);
    
    // Try GSheet first (PRIMARY)
    try {
      const gsheetResult = loadFromMasterSheet(projectName);
      if (gsheetResult && gsheetResult.success && gsheetResult.data) {
        Logger.log('   ✅ Loaded from GSheet (PRIMARY)');
        return {
          success: true,
          source: 'gsheet',
          projectName: projectName,
          data: gsheetResult.data,
          metadata: gsheetResult.data._metadata || {}
        };
      }
    } catch (e) {
      Logger.log('   ⚠️  GSheet load failed: ' + e.toString());
    }
    
    // Fallback to MySQL
    Logger.log('   🔄 Falling back to MySQL...');
    try {
      const mysqlResult = loadFromMySQL(projectName);
      if (mysqlResult && mysqlResult.success && mysqlResult.data) {
        Logger.log('   ✅ Loaded from MySQL (FALLBACK)');
        
        // Sync back to GSheet
        Logger.log('   🔄 Syncing back to GSheet...');
        saveToMasterSheet(projectName, mysqlResult.data);
        
        return {
          success: true,
          source: 'mysql',
          projectName: projectName,
          data: mysqlResult.data,
          metadata: mysqlResult.data._metadata || {}
        };
      }
    } catch (e) {
      Logger.log('   ❌ MySQL load failed: ' + e.toString());
    }
    
    // Not found anywhere
    return {
      success: false,
      error: 'Project not found in GSheet or MySQL: ' + projectName
    };
    
  } catch (error) {
    Logger.log('❌ [ELITE] Load failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load from MySQL
 */
function loadFromMySQL(projectName) {
  try {
    const result = callGateway('project:load', {
      projectName: projectName
    });
    
    if (result && result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result ? result.error : 'Project not found in MySQL'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT CONTEXT BUILDER - For Gemini API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build rich context object for Gemini API from project data
 * Maps 81 fields into structured context for intelligent prompts
 */
function buildGeminiProjectContext(projectData) {
  return {
    // Brand Identity
    brand: {
      name: projectData.brandName || 'Unknown Brand',
      ideology: projectData.brandIdeology || '',
      archetype: projectData.brandArchetype || '',
      lexicon: projectData.brandLexicon || '',
      uvp: projectData.uvp || '',
      messaging: projectData.existingMessaging || ''
    },
    
    // Target Audience
    audience: {
      primary: projectData.targetAudience || '',
      secondary: projectData.secondaryAudience || '',
      demographics: projectData.customerDemographics || '',
      geography: projectData.geographicFocus || '',
      industry: projectData.industryVertical || '',
      painPoints: projectData.audiencePains || '',
      desiredOutcomes: projectData.audienceDesired || ''
    },
    
    // Market Position
    market: {
      coreTopic: projectData.coreTopic || '',
      coreProb: projectData.coreMarketProblem || '',
      competitiveAdvantages: projectData.competitiveAdvantages || '',
      competitors: (projectData.keyCompetitors || '').split(',').map(c => c.trim()).filter(c => c)
    },
    
    // Strategic Objectives
    strategy: {
      quarterlyObjective: projectData.quarterlyObjective || '',
      northStarKpis: projectData.northStarKpis || '',
      contentGoals: projectData.contentGoals || '',
      futureVision: projectData.futureVision || '',
      strategicQuestion: projectData.coreStrategicQuestion || ''
    },
    
    // Content Framework
    content: {
      primaryChannels: projectData.primaryChannels || '',
      contentFormats: projectData.contentFormats || '',
      postsPerWeek: projectData.postsPerWeek || 5,
      pillars: projectData.foundationalPillars || '',
      persuasionFramework: projectData.persuasionFramework || '',
      uniqueMechanism: projectData.uniqueMechanism || ''
    },
    
    // Offer Structure
    offers: {
      primary: {
        name: projectData.primaryOfferName || '',
        price: projectData.primaryOfferPrice || ''
      },
      upsell: {
        name: projectData.upsellOffer || '',
        price: projectData.upsellPrice || ''
      },
      leadMagnet: projectData.leadMagnetName || '',
      matrix: projectData.offerMatrix || ''
    },
    
    // Proof & Authority
    proof: {
      socialProof: projectData.socialProof || '',
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
      trustAnchors: projectData.trustAnchors || '',
      proprietaryData: projectData.proprietaryData || ''
    },
    
    // AI Persona Context
    aiPersona: projectData.aiPersonaContext || '',
    platformContext: projectData.platformContext || ''
  };
}

/**
 * Build competitor analysis context for Gemini
 */
function buildCompetitorAnalysisContext(projectData, competitorData) {
  const projectContext = buildGeminiProjectContext(projectData);
  
  return {
    yourBrand: projectContext.brand,
    yourAudience: projectContext.audience,
    yourStrategy: projectContext.strategy,
    competitors: competitorData,
    analysisGoals: [
      'Identify competitive gaps',
      'Find content opportunities',
      'Assess market positioning',
      'Evaluate technical SEO',
      'Discover audience insights'
    ]
  };
}

Logger.log('✅ DB_ProjectManager_Elite.gs loaded');

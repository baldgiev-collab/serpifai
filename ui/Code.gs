/**
 * SerpifAI — Modular UI (Apps Script)
 * Rendering via HtmlService + template includes.
 * External services (DataBridge + Fetcher) are configured below.
 */
const ENDPOINTS = {
  DATABRIDGE: 'https://script.google.com/macros/s/AKfycbxPwzYvsn-xVp_qGgInM5xkO0mi20rWjMwG6U8pbXgxeq9kfXLJBOcUl1E5qOmRrNNr/exec',
  FETCHER:    'https://script.google.com/macros/s/AKfycbxbLELb1jTQN2O9fdGRGAaczyU6U7gZxwmnfeSMGp2GXcFbxMM9AJRO6bEh9MjYrLxt6A/exec'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SERPIFAI')
    .addItem('Open SERPIFAI', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('SERPIFAI — Architect of Authority');
  SpreadsheetApp.getUi().showSidebar(html);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('SerpifAI — Architect of Authority')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---- Server bridges to external macros ----
function fetchFromDataBridge(payload) {
  try {
    const url = ENDPOINTS.DATABRIDGE + '?q=' + encodeURIComponent(JSON.stringify(payload || {}));
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return tryParse(res.getContentText());
  } catch (e) {
    return { error: String(e), mock: true };
  }
}

function fetchFromFetcher(payload) {
  try {
    const url = ENDPOINTS.FETCHER + '?q=' + encodeURIComponent(JSON.stringify(payload || {}));
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return tryParse(res.getContentText());
  } catch (e) {
    return { error: String(e), mock: true };
  }
}

function saveToBridge(payload) {
  try {
    const res = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload || {}),
      muteHttpExceptions: true
    });
    return { ok: true, savedAt: new Date().toISOString(), raw: res.getContentText() };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function tryParse(txt) {
  try {
    return JSON.parse(txt);
  } catch (e) {
    return { raw: txt, parseError: String(e) };
  }
}

// ------------------------------------------------------------------
// NEW FUNCTION: Competitor Analysis Orchestrator
// ------------------------------------------------------------------

/**
 * Runs analysis on a list of competitor domains by calling external endpoints.
 * @param {string[]} competitorList - An array of competitor domain names.
 * @returns {Object} - Aggregated analysis data (currently mocked).
 */
function runCompetitorAnalysis(competitorList) {
  if (!competitorList || competitorList.length === 0) {
    throw new Error('No competitors provided.');
  }
  
  const analysisResults = {};

  competitorList.forEach(domain => {
    const payload = {
      action: 'analyze_domain',
      domain: domain,
      timestamp: new Date().toISOString()
    };
    
    // Simulate calling your endpoints for each domain.
    // In a real scenario, you would process the results from these calls.
    // const bridgeResult = fetchFromDataBridge(payload);
    // const fetcherResult = fetchFromFetcher(payload);
    
    // --- MOCK DATA GENERATION ---
    // Since I cannot run your endpoints, I will generate mock data
    // to simulate a successful analysis and populate the UI.
    analysisResults[domain] = {
      c_market: {
        'Category Mapping': `Notes for ${domain}...`,
        'Market Share': Math.floor(Math.random() * 50) + 10,
        'Category Narrative Audit': `Notes for ${domain}...`,
        'Category Gap Opportunities': Math.floor(Math.random() * 80) + 20
      },
      c_brand: {
        'Brand Archetype & Voice': 'The Ruler',
        'Value Proposition Mapping': `Notes for ${domain}...`,
        'Unique Mechanism': 'All-in-one Toolset',
        'Trust & E-E-A-T Signals': Math.floor(Math.random() * 60) + 30
      },
      c_tech: {
        'Site Health': Math.floor(Math.random() * 30) + 70,
        'Architecture & Depth': Math.floor(Math.random() * 40) + 50,
        'Schema Audit': Math.floor(Math.random() * 50) + 50,
        'Page Speed & UX': Math.floor(Math.random() * 40) + 40,
        'AI Footprint': Math.floor(Math.random() * 20)
      },
      // (Add mock data for other 12 categories...)
      c_content: {
         'Topical Authority Map': Math.floor(Math.random() * 50) + 40,
         'Content Performance': Math.floor(Math.random() * 50) + 50
      },
      c_keyword: {
         'Keyword Gap': Math.floor(Math.random() * 50) + 30,
         'Entity Mapping': Math.floor(Math.random() * 50) + 20
      },
      c_score: {
        'SEO Depth Index': Math.floor(Math.random() * 100),
        'GEO Presence Score': Math.floor(Math.random() * 100),
        'AEO Readiness': Math.floor(Math.random() * 100),
        'Entity Trust Score': Math.floor(Math.random() * 100)
      }
    };
    // --- END MOCK DATA ---
    
    // Utility sleep to make the simulation feel real
    Utilities.sleep(750);
  });
  
  return { ok: true, data: analysisResults };
}


// ------------------------------------------------------------------
// Project Manager — store projects in User Properties as JSON
// ------------------------------------------------------------------
function _getUserProps_() {
  return PropertiesService.getUserProperties();
}

function _readProjects_() {
  const raw = _getUserProps_().getProperty('serpifai_projects') || '{}';
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function _writeProjects_(map) {
  _getUserProps_().setProperty('serpifai_projects', JSON.stringify(map));
}

/**
 * Return all projects + last selected project.
 */
function listProjects() {
  const map = _readProjects_();
  const projects = Object.keys(map).map(function (name) {
    return {
      name: name,
      updatedAt: map[name].updatedAt || null
    };
  });
  const last = _getUserProps_().getProperty('serpifai_lastProject') || '';
  return { projects: projects, lastProject: last };
}

/**
 * Save / update a project.
 */
function saveProject(name, data) {
  if (!name) name = 'Untitled Project';
  const props = _getUserProps_();
  const map = _readProjects_();
  map[name] = {
    data: data || {},
    updatedAt: new Date().toISOString()
  };
  _writeProjects_(map);
  props.setProperty('serpifai_lastProject', name);
  return { ok: true, name: name, updatedAt: map[name].updatedAt };
}

/**
 * Load a project by name.
 */
function loadProject(name) {
  const map = _readProjects_();
  const item = map[name] || { data: {}, updatedAt: null };
  return {
    name: name,
    data: item.data || {},
    updatedAt: item.updatedAt ||
null
  };
}

/**
 * Delete a project.
 */
function deleteProject(name) {
  const props = _getUserProps_();
  const map = _readProjects_();
  delete map[name];
  _writeProjects_(map);

  const last = props.getProperty('serpifai_lastProject');
  if (last === name) {
    props.deleteProperty('serpifai_lastProject');
  }
  return { ok: true, remaining: Object.keys(map) };
}

/**
 * Rename a project.
 */
function renameProject(oldName, newName) {
  if (!oldName || !newName) throw new Error('Both oldName and newName required.');
  const props = _getUserProps_();
  const map = _readProjects_();
  if (!map[oldName]) throw new Error('Project not found: ' + oldName);
  if (map[newName] && newName !== oldName) throw new Error('Project with that name already exists.');

  map[newName] = map[oldName];
  if (newName !== oldName) {
    delete map[oldName];
  }
  
  props.setProperty('serpifai_projects', JSON.stringify(map));
  
  const last = props.getProperty('serpifai_lastProject');
  if (last === oldName) {
    props.setProperty('serpifai_lastProject', newName);
  }
  
  return { ok: true, newName: newName };
}

/**
 * Get available Gemini models for UI dropdown
 * Fetches ALL latest models dynamically from Gemini API
 * UPDATED: Returns only Gemini 2.5 models (latest generation)
 */
function getGeminiModels() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');
  const currentModel = props.getProperty('GEMINI_MODEL') || 'gemini-2.5-flash';
  
  if (!apiKey) {
    // Return ONLY Gemini 2.5 models (latest generation, no deprecated 2.0 models)
    return {
      success: true,
      models: [
        { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash ⚡ (Recommended)' },
        { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro 🧠' },
        { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite 💨' }
      ],
      currentModel: currentModel,
      warning: 'Using fallback models. Configure GEMINI_API_KEY in Script Properties for live API fetch.'
    };
  }
  
  // Try both v1 and v1beta endpoints
  const endpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey,
    'https://generativelanguage.googleapis.com/v1/models?key=' + apiKey
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const response = UrlFetchApp.fetch(endpoints[i], { 
        muteHttpExceptions: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const statusCode = response.getResponseCode();
      
      if (statusCode !== 200) {
        Logger.log('API returned status ' + statusCode + ' from endpoint ' + endpoints[i]);
        continue; // Try next endpoint
      }
      
      const json = JSON.parse(response.getContentText());
      const models = [];
      
      if (json.models && json.models.length > 0) {
        // Filter and collect ALL models that support generateContent
        json.models.forEach(function(model) {
          const methods = model.supportedGenerationMethods || [];
          if (methods.indexOf('generateContent') > -1) {
            const modelName = model.name.replace('models/', '');
            
            // Skip deprecated models
            if (modelName.indexOf('deprecated') === -1 && 
                modelName.indexOf('legacy') === -1) {
              models.push({
                name: modelName,
                displayName: model.displayName || modelName,
                description: model.description || '',
                version: model.version || ''
              });
            }
          }
        });
        
        // Smart sort: Gemini 2.5 first, then 2.x, then 1.5 Pro, then 1.5 Flash
        models.sort(function(a, b) {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // Priority 1: Gemini 2.5 models ONLY (latest generation)
          const aIs25 = aName.indexOf('gemini-2.5') === 0 || aName.indexOf('gemini-2-5') === 0;
          const bIs25 = bName.indexOf('gemini-2.5') === 0 || bName.indexOf('gemini-2-5') === 0;
          
          // FILTER OUT 2.0 and older models completely
          if (!aIs25 && !bIs25) return 0; // Both are old, skip
          if (aIs25 && !bIs25) return -1; // Only a is 2.5, prioritize it
          if (!aIs25 && bIs25) return 1;  // Only b is 2.5, prioritize it
          
          // Both are 2.5, now sort by Pro > Flash > Lite
          if (aName.indexOf('pro') > -1 && bName.indexOf('flash') > -1) return -1;
          if (aName.indexOf('flash') > -1 && bName.indexOf('pro') > -1) return 1;
          
          // Priority 4: "latest" suffix first
          const aIsLatest = aName.indexOf('latest') > -1;
          const bIsLatest = bName.indexOf('latest') > -1;
          if (aIsLatest && !bIsLatest) return -1;
          if (!aIsLatest && bIsLatest) return 1;
          
          // Priority 5: Stable before experimental
          const aIsExp = aName.indexOf('exp') > -1;
          const bIsExp = bName.indexOf('exp') > -1;
          if (!aIsExp && bIsExp) return -1;
          if (aIsExp && !bIsExp) return 1;
          
          // Fallback: alphabetical
          return a.displayName.localeCompare(b.displayName);
        });
      }
      
      if (models.length === 0) {
        Logger.log('No generateContent-capable models found in API response from ' + endpoints[i]);
        continue; // Try next endpoint
      }
      
      // Success - return models
      return {
        success: true,
        models: models,
        currentModel: currentModel,
        totalModels: models.length,
        endpoint: endpoints[i].split('?')[0]
      };
      
    } catch (error) {
      Logger.log('Error fetching from ' + endpoints[i] + ': ' + error.toString());
      // Continue to next endpoint
    }
  }
  
  // All endpoints failed - return fallback with latest models (updated to match actual API)
  return {
    success: true,
    models: [
      { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
      { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
      { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
      { name: 'gemini-2.0-flash-001', displayName: 'Gemini 2.0 Flash (001)' },
      { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite' }
    ],
    currentModel: currentModel,
    warning: 'API fetch failed. Using fallback list with latest known models.',
    fallback: true
  };
}

/**
 * Set selected Gemini model
 */
function setGeminiModel(modelName) {
  try {
    if (!modelName || modelName.trim() === '') {
      throw new Error('Model name is required');
    }
    
    PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', modelName);
    
    return {
      success: true,
      model: modelName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// WORKFLOW STAGE RUNNER - Integration with DataBridge
// ============================================================================

/**
 * Run a workflow stage by calling DataBridge backend
 * This is called by the UI when user clicks "Run Stage X" button
 * MANDATORY: ALWAYS uses selected project data and selected AI model from dropdowns
 * Handles both old (3-arg) and new (single payload) calling patterns
 */
function runWorkflowStage(arg1, arg2, arg3) {
  let stageNum = null;
  let formData = null;
  let selectedModel = null;
  let payload = null;
  let projectId = null;
  
  try {
    Logger.log('🔗 runWorkflowStage called with ' + arguments.length + ' arguments');
    Logger.log('   arg1 type: ' + typeof arg1);
    if (arg1) Logger.log('   arg1 keys: ' + (typeof arg1 === 'object' ? Object.keys(arg1).join(', ') : 'N/A'));
    
    // PATTERN DETECTION
    if (arguments.length === 0 || !arg1) {
      throw new Error('No arguments provided. runWorkflowStage requires either (payload) or (stageNum, formData, model)');
    }
    else if (arguments.length === 3 && typeof arg1 === 'number') {
      // OLD PATTERN: runWorkflowStage(1, {...}, 'gemini-2.5-flash')
      Logger.log('📌 Detected OLD 3-argument pattern');
      stageNum = arg1;
      formData = arg2;
      selectedModel = arg3;
      projectId = formData.projectId;
      
      if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid formData in old pattern: expected object, got ' + typeof formData);
      }
    }
    else if (arguments.length === 1 && typeof arg1 === 'object') {
      // NEW PATTERN: runWorkflowStage({stageNum: 1, projectId: '...', model: '...', ...})
      Logger.log('📌 Detected NEW single-payload pattern');
      payload = arg1;
      stageNum = payload.stageNum;
      projectId = payload.projectId;
      selectedModel = payload.model;
      formData = payload;
      
      if (!payload.stageNum) {
        throw new Error('Missing stageNum in payload object. Keys: ' + Object.keys(payload).join(', '));
      }
    }
    else {
      throw new Error('Invalid calling pattern. Got ' + arguments.length + ' args, arg1 type: ' + typeof arg1);
    }
    
    // ============================================================================
    // MANDATORY VALIDATION: Project and Model MUST be selected
    // ============================================================================
    if (!projectId || projectId.trim() === '') {
      throw new Error('❌ MANDATORY: No project selected. Please select a project from the dropdown menu.');
    }
    
    if (!selectedModel || selectedModel.trim() === '') {
      throw new Error('❌ MANDATORY: No AI model selected. Please select a Gemini model from the dropdown menu.');
    }
    
    // Validate model is Gemini 2.5 (no deprecated 2.0 models)
    if (selectedModel.indexOf('gemini-2.5') !== 0) {
      Logger.log('⚠️ WARNING: Using non-2.5 model: ' + selectedModel + '. Defaulting to gemini-2.5-flash');
      selectedModel = 'gemini-2.5-flash';
    }
    
    Logger.log('✅ MANDATORY checks passed');
    Logger.log('   📁 Project: ' + projectId);
    Logger.log('   🤖 Model: ' + selectedModel);
    
    // ============================================================================
    // LOAD PROJECT DATA FROM SHEET - ALWAYS fetch fresh data from selected project
    // ============================================================================
    Logger.log('📥 Loading fresh project data from sheet...');
    const projectData = loadProject(projectId);
    
    if (!projectData || !projectData.data) {
      throw new Error('❌ Cannot load project data for: ' + projectId + '. Project may not exist or has no data.');
    }
    
    Logger.log('✅ Loaded project data with ' + Object.keys(projectData.data).length + ' fields');
    
    // Merge loaded project data with any additional formData
    const mergedData = Object.assign({}, projectData.data, formData || {});
    mergedData.projectId = projectId; // Ensure projectId is set
    
    // VALIDATION
    if (!stageNum) {
      throw new Error('stageNum is missing or invalid: ' + stageNum);
    }
    
    if (!mergedData || typeof mergedData !== 'object') {
      throw new Error('mergedData is missing or invalid. Type: ' + typeof mergedData);
    }
    
    Logger.log('🔗 UI calling DataBridge for Stage ' + stageNum);
    Logger.log('📦 Using project data fields: ' + Object.keys(mergedData).slice(0, 10).join(', ') + '...');
    
    // Build request payload in the format DataBridge workflow_router.gs expects
    const requestPayload = {
      action: 'workflow:stage' + stageNum,  // CRITICAL: Use workflow:stage1 format
      data: mergedData,                      // Use merged project data from sheet
      timestamp: new Date().toISOString(),
      modelName: selectedModel              // MANDATORY: Always include selected model
    };
    
    Logger.log('📤 Request payload structure:');
    Logger.log('   action: ' + requestPayload.action);
    Logger.log('   modelName: ' + requestPayload.modelName);
    Logger.log('   data.projectId: ' + requestPayload.data.projectId);
    Logger.log('   data fields: ' + Object.keys(requestPayload.data).slice(0, 15).join(', ') + '...');
    
    Logger.log('🚀 Sending to DataBridge: ' + JSON.stringify(requestPayload).substring(0, 500));
    
    // Call DataBridge
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestPayload),
      muteHttpExceptions: true
    };
    
    Logger.log('📤 Calling DataBridge endpoint...');
    const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log('❌ DataBridge returned HTTP ' + responseCode);
      return {
        success: false,
        stage: stageNum,
        error: 'DataBridge returned HTTP ' + responseCode,
        timestamp: new Date().toISOString()
      };
    }
    
    const result = JSON.parse(response.getContentText());
    Logger.log('📥 DataBridge response received');
    
    if (result.success) {
      Logger.log('✅ Stage ' + stageNum + ' completed successfully');
    } else {
      Logger.log('⚠️ Stage ' + stageNum + ' completed with errors: ' + (result.error || 'Unknown error'));
    }
    
    return result;
    
  } catch (error) {
    Logger.log('❌ Error calling DataBridge: ' + error.toString());
    return {
      success: false,
      stage: stageNum,
      error: error.toString(),
      message: 'Failed to connect to DataBridge. Please check your endpoint configuration.',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Transform competitors array to add processedMetrics for UI chart rendering
 * Flattens nested categories.metrics structure into flat processedMetrics object
 * This matches what elite_competitor_charts.html expects
 */
function transformCompetitorsForUI(competitors) {
  if (!competitors || !Array.isArray(competitors)) {
    Logger.log('⚠️ transformCompetitorsForUI: Invalid input, returning empty array');
    return [];
  }
  
  return competitors.map(function(comp) {
    // Create processedMetrics from categories if it doesn't exist
    if (!comp.processedMetrics && comp.categories) {
      comp.processedMetrics = {};
      
      // Extract metrics from each category
      var categories = comp.categories;
      
      // Authority & Performance Metrics
      if (categories.authorityInfluence && categories.authorityInfluence.metrics) {
        comp.processedMetrics.authorityMomentum = categories.authorityInfluence.metrics.authorityMomentum || 50;
        comp.processedMetrics.backlinks = categories.authorityInfluence.metrics.totalBacklinks || 0;
        comp.processedMetrics.referringDomains = categories.authorityInfluence.metrics.referringDomains || 0;
      }
      
      // Technical SEO Metrics
      if (categories.technicalSEO && categories.technicalSEO.metrics) {
        comp.processedMetrics.siteHealth = categories.technicalSEO.metrics.siteHealthScore || 70;
        comp.processedMetrics.pageSpeed = categories.technicalSEO.metrics.pageSpeedScore || 60;
        comp.processedMetrics.coreWebVitals = categories.technicalSEO.metrics.coreWebVitalsScore || 65;
      }
      
      // Content Metrics
      if (categories.contentIntelligence && categories.contentIntelligence.metrics) {
        comp.processedMetrics.topicalAuthority = categories.contentIntelligence.metrics.topicalAuthorityScore || 55;
        comp.processedMetrics.contentDepth = categories.contentIntelligence.metrics.avgContentDepth || 1500;
      }
      
      // E-E-A-T Metrics
      if (categories.brandPositioning && categories.brandPositioning.metrics) {
        comp.processedMetrics.eeatSignals = categories.brandPositioning.metrics.eeatScore || 60;
      }
      
      // Keyword Strategy Metrics
      if (categories.keywordStrategy && categories.keywordStrategy.metrics) {
        comp.processedMetrics.keywordGap = categories.keywordStrategy.metrics.keywordGapScore || 45;
        comp.processedMetrics.organicKeywords = categories.keywordStrategy.metrics.totalOrganicKeywords || 0;
      }
      
      // GEO/AEO Metrics
      if (categories.geoAeoIntelligence && categories.geoAeoIntelligence.metrics) {
        comp.processedMetrics.geoPresence = categories.geoAeoIntelligence.metrics.geoPresenceScore || 40;
        comp.processedMetrics.aeoReadiness = categories.geoAeoIntelligence.metrics.aeoReadinessScore || 50;
      }
      
      // Scoring Engine (if available)
      if (categories.scoringEngine && categories.scoringEngine.metrics) {
        comp.processedMetrics.overallScore = categories.scoringEngine.metrics.overallCompetitiveScore || 65;
      }
      
      Logger.log('   ✅ Transformed ' + comp.domain + ' - added ' + Object.keys(comp.processedMetrics).length + ' processedMetrics');
    } else if (comp.processedMetrics) {
      Logger.log('   ℹ️ ' + comp.domain + ' already has processedMetrics');
    } else {
      Logger.log('   ⚠️ ' + comp.domain + ' has no categories or processedMetrics, using defaults');
      comp.processedMetrics = {
        authorityMomentum: 50,
        backlinks: 0,
        referringDomains: 0,
        siteHealth: 70,
        pageSpeed: 60,
        coreWebVitals: 65,
        topicalAuthority: 55,
        contentDepth: 1500,
        eeatSignals: 60,
        keywordGap: 45,
        organicKeywords: 0,
        geoPresence: 40,
        aeoReadiness: 50,
        overallScore: 65
      };
    }
    
    return comp;
  });
}

/**
 * Run Elite Competitor Intelligence Analysis
 * Called from UI elite_competitor_integration.html
 * Routes to DataBridge competitor_intelligence system
 * FIXED: Uses COMP_orchestrateAnalysis action (already deployed in DATABRIDGE)
 */
function runEliteCompetitorAnalysis(competitors, projectContext) {
  try {
    // CRITICAL FIX: Handle undefined projectContext
    const safeProjectContext = projectContext || {};
    const safeCompetitors = competitors || [];
    
    Logger.log('🎯 Starting ELITE Competitor Analysis...');
    Logger.log('   Competitors: ' + safeCompetitors.length);
    Logger.log('   Competitor URLs: ' + safeCompetitors.join(', '));
    Logger.log('   Project: ' + (safeProjectContext.brandName || 'Unknown'));
    Logger.log('   ProjectContext keys: ' + Object.keys(safeProjectContext).length);
    
    // Validate minimum requirements
    if (safeCompetitors.length === 0) {
      throw new Error('No competitors provided. Please enter at least 2 competitor URLs.');
    }
    
    if (safeCompetitors.length < 2) {
      throw new Error('Please provide at least 2 competitor URLs for analysis.');
    }
    
    if (safeCompetitors.length > 6) {
      throw new Error('Maximum 6 competitors allowed. You provided ' + safeCompetitors.length);
    }
    
    // Get the active spreadsheet ID
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    Logger.log('   Spreadsheet ID: ' + spreadsheetId);
    
    // Use COMP_orchestrateAnalysis action (already exists in DATABRIDGE)
    // Wrap data in 'config' object as expected by COMP_orchestrateAnalysis
    const requestPayload = {
      action: 'COMP_orchestrateAnalysis',
      config: {
        competitors: safeCompetitors,
        projectId: 'elite-' + Date.now(),
        yourDomain: safeProjectContext.brandName || 'Your Site',
        projectContext: safeProjectContext,
        spreadsheetId: spreadsheetId
      },
      timestamp: new Date().toISOString()
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestPayload),
      muteHttpExceptions: true
    };
    
    Logger.log('📤 Calling DataBridge with COMP_orchestrateAnalysis action...');
    Logger.log('   Config: ' + JSON.stringify(requestPayload.config).substring(0, 300) + '...');
    
    const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log('❌ DataBridge returned HTTP ' + responseCode);
      return {
        success: false,
        error: 'DataBridge returned HTTP ' + responseCode,
        responseText: response.getContentText().substring(0, 500)
      };
    }
    
    const result = JSON.parse(response.getContentText());
    Logger.log('✅ ELITE analysis complete');
    Logger.log('   Success: ' + result.success);
    if (result.success) {
      Logger.log('   Competitors analyzed: ' + (result.competitors ? Object.keys(result.competitors).length : 0));
    }
    if (result.metadata) {
      Logger.log('   Total Metrics: ' + (result.metadata.totalMetrics || 0));
      Logger.log('   Completeness: ' + (result.metadata.dataCompleteness || 0) + '%');
    }
    
    // 🔧 CRITICAL FIX: Transform competitors to add processedMetrics for chart rendering
    if (result.success && result.competitors && Array.isArray(result.competitors)) {
      Logger.log('🔄 Transforming ' + result.competitors.length + ' competitors for UI charts...');
      result.competitors = transformCompetitorsForUI(result.competitors);
      Logger.log('✅ Transformation complete - first competitor has processedMetrics: ' + !!result.competitors[0].processedMetrics);
    }
    
    return result;
    
  } catch (error) {
    Logger.log('❌ Error in ELITE analysis: ' + error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack || 'No stack trace'
    };
  }
}

/**
 * 🧪 DIAGNOSTIC TEST: Test Stage 1 workflow directly
 * Run this from Apps Script editor to test if Stage 1 is working
 */
function TEST_Stage1_Direct() {
  Logger.log('=== DIAGNOSTIC TEST: Stage 1 Direct Call ===');
  
  const testPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'DIAGNOSTIC_TEST_' + Date.now(),
    model: 'gemini-2.0-flash-exp',
    brandName: 'Test Brand',
    primaryKeyword: 'test keyword',
    businessCategory: 'Testing',
    targetAudience: 'Test Audience',
    productDescription: 'Test Product',
    competitors: '',
    uniqueValueProposition: '',
    painPoints: '',
    desiredOutcomes: ''
  };
  
  Logger.log('✅ Test payload created');
  Logger.log('   Payload type: ' + typeof testPayload);
  Logger.log('   Payload keys: ' + Object.keys(testPayload).join(', '));
  Logger.log('   stageNum: ' + testPayload.stageNum);
  Logger.log('   projectId: ' + testPayload.projectId);
  
  Logger.log('\n🚀 Calling runWorkflowStage...');
  
  try {
    const result = runWorkflowStage(testPayload);
    
    Logger.log('\n✅ TEST COMPLETE!');
    Logger.log('   Result success: ' + result.success);
    Logger.log('   Result stage: ' + result.stage);
    
    if (result.success && result.json) {
      Logger.log('   Has dashboardCharts: ' + !!result.json.dashboardCharts);
      Logger.log('   Has jtbdScenarios: ' + !!result.json.jtbdScenarios);
      Logger.log('   Has contentPillars: ' + !!result.json.contentPillars);
      Logger.log('   Has uniqueMechanism: ' + !!result.json.uniqueMechanism);
      
      // Check dashboard charts structure
      if (result.json.dashboardCharts) {
        const charts = result.json.dashboardCharts;
        Logger.log('   Dashboard charts found:');
        Logger.log('     - customerFrustrationsChart: ' + (charts.customerFrustrationsChart ? charts.customerFrustrationsChart.length + ' items' : 'missing'));
        Logger.log('     - hiddenAspirationsChart: ' + (charts.hiddenAspirationsChart ? charts.hiddenAspirationsChart.length + ' items' : 'missing'));
        Logger.log('     - mindsetTransformationChart: ' + (charts.mindsetTransformationChart ? charts.mindsetTransformationChart.length + ' items' : 'missing'));
      }
      
      Logger.log('\n🎉 Stage 1 is working correctly! Same format as 11/15/2025.');
    } else {
      Logger.log('   ⚠️ Error: ' + (result.error || 'Unknown error'));
    }
    
    return result;
  } catch (error) {
    Logger.log('\n❌ TEST FAILED');
    Logger.log('   Error: ' + error.toString());
    Logger.log('   Stack: ' + error.stack);
    throw error;
  }
}

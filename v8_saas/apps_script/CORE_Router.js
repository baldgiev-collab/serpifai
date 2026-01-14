/**
 * CORE_Router.gs - Central Action Router
 * SerpifAI V8 - Routes actions to appropriate handlers
 * 
 * Replaces V7's DB_Router.gs + FT_Router.gs
 */

/**
 * DataBridge action router
 * @param {string} action - Action to perform
 * @param {object} payload - Action payload
 * @return {object} Result
 */
function DB_handle(action, payload) {
  const startTime = Date.now();
  payload = payload || {};
  
  try {
    let result;
    
    switch (action) {
      // Project Management
      case 'project:create': result = DB_PM_createProject(payload); break;
      case 'project:load':   result = DB_PM_loadProject(payload); break;
      case 'project:save':   result = DB_PM_saveProject(payload); break;
      case 'project:delete': result = DB_PM_deleteProject(payload); break;
      case 'project:list':   result = DB_PM_listProjects(payload); break;
      
      // Workflow Stages
      case 'workflow:stage1': result = DB_WF_runStage1(payload); break;
      case 'workflow:stage2': result = DB_WF_runStage2(payload); break;
      case 'workflow:stage3': result = DB_WF_runStage3(payload); break;
      case 'workflow:stage4': result = DB_WF_runStage4(payload); break;
      case 'workflow:stage5': result = DB_WF_runStage5(payload); break;
      
      // Legacy workflow actions
      case 'wf:strategy':   result = DB_WF_runStage1(payload); break;
      case 'wf:keywords':   result = DB_WF_runStage2(payload); break;
      case 'wf:clustering': result = DB_WF_runStage3(payload); break;
      case 'wf:calendar':   result = DB_WF_runStage4(payload); break;
      case 'wf:generate':   result = DB_WF_runStage5(payload); break;
      
      // Competitor Analysis
      case 'comp:analyze':   result = DB_COMP_analyze(payload); break;
      case 'comp:overview':  result = DB_COMP_getOverview(payload); break;
      case 'COMP_orchestrateAnalysis': result = DB_COMP_orchestrate(payload); break;
      case 'ELITE_analyzeCompetitors': result = DB_COMP_eliteAnalyze(payload); break;
      
      // QA Engine
      case 'qa:score':      result = DB_QA_score(payload); break;
      case 'qa:eeat':       result = DB_QA_eeat(payload); break;
      
      // Content Engine
      case 'content:generate': result = DB_CE_generate(payload); break;
      case 'content:outline':  result = DB_CE_outline(payload); break;
      
      // Data operations
      case 'db:getData':    result = DB_getData(payload); break;
      case 'db:saveData':   result = DB_saveData(payload); break;
      case 'db:query':      result = DB_query(payload); break;
      
      // Cache operations
      case 'cache:get':     result = CACHE_get(payload.key); break;
      case 'cache:set':     result = CACHE_set(payload.key, payload.value, payload.ttl); break;
      case 'cache:clear':   result = CACHE_clear(payload.prefix); break;
      
      // Gateway operations
      case 'gateway:call':  result = GW_callGateway(payload.action, payload.data); break;
      
      default:
        result = { ok: false, error: 'Unknown DB action: ' + action };
    }
    
    if (result && typeof result === 'object') {
      result.action = action;
      result.executionTime = Date.now() - startTime;
    }
    
    return result;
    
  } catch (err) {
    return CORE_handleError(err, 'DB_handle', { action: action });
  }
}

/**
 * Fetcher action router
 * @param {string} action - Action to perform
 * @param {object} payload - Action payload
 * @return {object} Result
 */
function CORE_FT_handleRoute(action, payload) {
  const startTime = Date.now();
  payload = payload || {};
  
  try {
    let result;
    
    switch (action.toLowerCase()) {
      // Single URL operations
      case 'fetch:single':
      case 'ft:fetchsingle':
        result = FT_fetchSingle(payload.url, payload.options);
        break;
        
      // Multi URL operations
      case 'fetch:multi':
      case 'ft:fetchmulti':
        result = FT_fetchMulti(payload.urls, payload.options);
        break;
        
      // Extraction operations
      case 'extract:meta':
      case 'ft:extractmeta':
        result = FT_extractMetadataComplete(payload.html, payload.url);
        break;
        
      case 'extract:links':
      case 'ft:extractlinks':
        result = FT_extractLinksComprehensive(payload.html, payload.url);
        break;
        
      case 'extract:schema':
      case 'ft:extractschema':
        result = FT_extractSchemaData(payload.html);
        break;
        
      // Forensic operations
      case 'forensic':
      case 'ft:forensic':
        result = FT_extractForensics(payload.html, payload.url, payload.options);
        break;
        
      case 'fullscan':
      case 'ft:fullscan':
        result = FT_fullForensicScan(payload.url, payload.competitorUrls, payload.options);
        break;
        
      // Competitor analysis
      case 'comp:analyze':
      case 'comp_analyze':
        result = DB_COMP_analyze(payload);
        break;
        
      case 'comp_orchestrateanalysis':
      case 'elite_analyzecompetitors':
        result = DB_COMP_orchestrate(payload);
        break;
        
      // API wrappers
      case 'api:serper':
        result = SERPER_search(payload.query, payload.options);
        break;
        
      case 'api:gemini':
        result = GEMINI_analyze(payload.prompt, payload.options);
        break;
        
      case 'api:pagespeed':
        result = PAGESPEED_analyze(payload.url, payload.options);
        break;
        
      case 'api:pagerank':
        result = PAGERANK_getDomainRank(payload.domain);
        break;
        
      // Health check
      case 'ping':
      case 'health':
        result = {
          ok: true,
          status: 'Fetcher V8 Online',
          version: SERPIFAI_VERSION
        };
        break;
        
      default:
        result = { ok: false, error: 'Unknown FT action: ' + action };
    }
    
    if (result && typeof result === 'object') {
      result.action = action;
      result.executionTime = Date.now() - startTime;
    }
    
    return result;
    
  } catch (err) {
    return CORE_handleError(err, 'FT_handleRoute', { action: action });
  }
}

/**
 * UI action router
 * @param {string} action - Action to perform
 * @param {object} payload - Action payload
 * @return {object} Result
 */
function UI_handle(action, payload) {
  payload = payload || {};
  
  try {
    switch (action) {
      case 'ui:getDashboard':   return UI_getDashboardData();
      case 'ui:getProjects':    return DB_PM_listProjects(payload);
      case 'ui:getApiStatus':   return WEBAPP_getPublicConfig();
      case 'ui:startAnalysis':  return UI_startAnalysis(payload);
      case 'ui:getProgress':    return FT_GetBatchStatus();
      default:
        return { ok: false, error: 'Unknown UI action: ' + action };
    }
  } catch (err) {
    return CORE_handleError(err, 'UI_handle', { action: action });
  }
}

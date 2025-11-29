/**
 * DB_Router.gs
 * Central routing for all DataBridge actions
 * Routes requests to appropriate modules with credit validation via PHP Gateway
 */

function DB_handle(action, payload) {
  var started = new Date();
  
  try {
    // Route to appropriate handler based on action
    switch(action) {
      // Project Management
      case 'project:create': return DB_PM_createProject(payload);
      case 'project:load':   return DB_PM_loadProject(payload);
      case 'project:save':   return DB_PM_saveProject(payload);
      case 'project:delete': return DB_PM_deleteProject(payload);
      
      // Workflow Stages (5-stage content workflow)
      case 'workflow:stage1': return DB_WF_runStage1Strategy(payload);
      case 'workflow:stage2': return DB_WF_runStage2Keywords(payload);
      case 'workflow:stage3': return DB_WF_runStage3Architecture(payload);
      case 'workflow:stage4': return DB_WF_runStage4Calendar(payload);
      case 'workflow:stage5': return DB_WF_runStage5Generation(payload);
      
      // Legacy workflow actions (backwards compatibility)
      case 'wf:strategy':    return DB_WF_strategyStage(payload);
      case 'wf:keywords':    return DB_WF_keywordStage(payload);
      case 'wf:clustering':  return DB_WF_clusteringStage(payload);
      case 'wf:calendar':    return DB_WF_calendarStage(payload);
      case 'wf:generate':    return DB_WF_contentGenerationStage(payload);
      
      // QA Engine
      case 'qa:score':       return DB_QA_router(payload);
      case 'qa:eeat':        return DB_QA_eeatChecker(payload);
      case 'qa:aeo':         return DB_QA_aeoChecker(payload);
      case 'qa:geo':         return DB_QA_geoChecker(payload);
      case 'qa:semantic':    return DB_QA_semanticDepth(payload);
      case 'qa:readability': return DB_QA_readabilityChecker(payload);
      
      // Content Engine
      case 'content:article':  return DB_CE_articleGenerate(payload);
      case 'content:outline':  return DB_CE_outlineGenerator(payload);
      case 'content:schema':   return DB_CE_schemaGenerator(payload);
      case 'content:linking':  return DB_CE_internalLinking(payload);
      
      // Publishing Engine
      case 'pub:wp':       return DB_PUB_wordpressPublish(payload);
      case 'pub:notion':   return DB_PUB_notionPublish(payload);
      case 'pub:ghost':    return DB_PUB_ghostPublish(payload);
      case 'pub:schedule': return DB_PUB_schedulePosts(payload);
      
      // Pipeline Operations
      case 'pipeline:generateAllFromCalendar': return DB_PIPE_generateAllFromCalendar(payload);
      case 'pipeline:qaAndImprove':            return DB_PIPE_qaAndImprove(payload);
      case 'pipeline:publishBatch':            return DB_PIPE_publishBatch(payload);
      case 'pipeline:appendToCache':           return DB_PIPE_appendToCache(payload);
      case 'pipeline:updateCalendarSheet':     return DB_PIPE_updateCalendarSheet(payload);
      
      // Competitor Analysis - Elite System (15 Categories)
      case 'comp:analyze':         return DB_COMP_analyzeCompetitors(payload);
      case 'comp:overview':        return DB_COMP_getOverview(payload);
      case 'comp:marketIntel':     return DB_COMP_analyzeMarketIntel(payload);
      case 'comp:brandPosition':   return DB_COMP_analyzeBrandPosition(payload);
      case 'comp:technicalSEO':    return DB_COMP_analyzeTechnicalSEO(payload);
      case 'comp:contentIntel':    return DB_COMP_analyzeContentIntel(payload);
      case 'comp:keywordStrategy': return DB_COMP_analyzeKeywordStrategy(payload);
      case 'comp:contentSystems':  return DB_COMP_analyzeContentSystems(payload);
      case 'comp:conversion':      return DB_COMP_analyzeConversion(payload);
      case 'comp:distribution':    return DB_COMP_analyzeDistribution(payload);
      case 'comp:audience':        return DB_COMP_analyzeAudienceIntel(payload);
      case 'comp:geoAeo':          return DB_COMP_analyzeGeoAeo(payload);
      case 'comp:authority':       return DB_COMP_analyzeAuthority(payload);
      case 'comp:performance':     return DB_COMP_analyzePerformance(payload);
      case 'comp:opportunity':     return DB_COMP_analyzeOpportunityMatrix(payload);
      case 'comp:scoring':         return DB_COMP_calculateScoringEngine(payload);
      case 'comp:compare':         return DB_COMP_compareCompetitors(payload);
      
      // Competitor Intelligence - Full Orchestration
      case 'COMP_orchestrateAnalysis': return DB_COMP_orchestrateAnalysis(payload);
      
      // ELITE Competitor Analysis (routes to proven system)
      case 'ELITE_analyzeCompetitors': return DB_COMP_orchestrateAnalysis({
        competitors: payload.competitors || [],
        projectId: (payload.projectContext && payload.projectContext.projectId) || 'elite-' + Date.now(),
        yourDomain: (payload.projectContext && payload.projectContext.brandName) || 'Your Site',
        projectContext: payload.projectContext || {}
      });
      
      // Bulk Engine
      case 'bulk:generate':  return DB_BULK_batchGenerator(payload);
      case 'bulk:publish':   return DB_BULK_batchPublisher(payload);
      case 'bulk:queue':     return DB_BULK_queueManager(payload);
      
      // Performance Engine
      case 'perf:insights':   return DB_PERF_performanceInsights(payload);
      case 'perf:dashboard':  return DB_PERF_performanceDashboard(payload);
      case 'perf:decay':      return DB_PERF_decayDetection(payload);
      
      // Technical SEO
      case 'tech:pageSpeed':  return DB_TECH_pageSpeed(payload);
      case 'tech:schema':     return DB_TECH_schemaAudit(payload);
      case 'tech:vitals':     return DB_TECH_coreWebVitals(payload);
      case 'tech:broken':     return DB_TECH_brokenLinks(payload);
      case 'tech:meta':       return DB_TECH_metaIssues(payload);
      case 'tech:duplication': return DB_TECH_duplicationChecker(payload);
      
      // Backlinks
      case 'backlinks:fetch':    return DB_BL_openPageRankFetch(payload);
      case 'backlinks:insights': return DB_BL_backlinkInsights(payload);
      case 'backlinks:gap':      return DB_BL_backlinkGap(payload);
      
      // AI Engine
      case 'ai:suggestInputs': return DB_AI_suggestInputs(
        payload.competitorUrls || [], 
        payload.currentInputs || {}
      );
      case 'ai:suggestField':  return DB_AI_suggestField(
        payload.fieldName, 
        payload.competitorUrls || []
      );
      
      // Configuration
      case 'config:getInputs':    return DB_CONFIG_getInputs(payload);
      case 'config:saveInputs':   return DB_CONFIG_saveProjectInputs(payload);
      case 'config:saveOutput':   return DB_CONFIG_savePromptOutput(
        payload.stage, 
        payload.output, 
        payload.projectId
      );
      case 'config:getOutput':    return DB_CONFIG_getStageOutput(payload.stage, payload.projectId);
      case 'config:getApiConfig': return DB_CONFIG_getApiConfig();
      
      // Setup & Testing
      case 'setup:init':         return DB_SETUP_initializeSystem();
      case 'setup:showConfig':   return DB_SETUP_showConfiguration();
      
      default: 
        throw new Error('Unknown action: ' + action);
    }
    
  } catch(e) {
    return {
      ok: false, 
      error: String(e),
      stack: e.stack || '',
      action: action, 
      elapsed_ms: (new Date() - started)
    };
  }
}

/**
 * Legacy function name for backwards compatibility
 */
function DataBridge_handle(action, payload) {
  return DB_handle(action, payload);
}

function DataBridge_handle(action, payload){
  var started=new Date();
  try{
    switch(action){
      case 'project:create': return PM_createProject(payload);
      case 'project:load':   return PM_loadProject(payload);
      case 'project:save':   return PM_saveProject(payload);
      case 'project:delete': return PM_deleteProject(payload);
      case 'wf:strategy':    return WF_strategyStage(payload);
      case 'wf:keywords':    return WF_keywordStage(payload);
      case 'wf:clustering':  return WF_clusteringStage(payload);
      case 'wf:calendar':    return WF_calendarStage(payload);
      case 'wf:generate':    return WF_contentGenerationStage(payload);
      case 'qa:score':       return QA_router(payload);
      case 'pipeline:generateAllFromCalendar': return PIPE_generateAllFromCalendar(payload);
      case 'pipeline:qaAndImprove':            return PIPE_qaAndImprove(payload);
      case 'pipeline:publishBatch':            return PIPE_publishBatch(payload);
      case 'pipeline:appendToCache':           return PIPE_appendToCache(payload);
      case 'pipeline:updateCalendarSheet':     return PIPE_updateCalendarSheet(payload);
      // convenience endpoints used by UI:
      case 'content:article': return CE_articleGenerate(payload);
      case 'pub:wp':          return PUB_wordpressPublish({title:payload.title, content:payload.body, status:payload.status||'draft'});
      // AI suggestions:
      case 'ai:suggestInputs': return AI_suggestInputs(payload.competitorUrls || [], payload.currentInputs || {});
      case 'ai:suggestField':  return AI_suggestField(payload.fieldName, payload.competitorUrls || []);
      // Fetcher proxy:
      case 'fetch:competitor': return APIS_fetchCompetitorBenchmark(payload.urls || []);
      case 'fetch:snapshot':   return APIS_fetchSeoSnapshot(payload.url);
      // Competitor Analysis (Modular - All 15 Categories):
      case 'comp:analyze':         return COMP_analyzeCompetitors(payload);
      case 'comp:overview':        return COMP_getOverview(payload);
      case 'comp:marketIntel':     return COMP_analyzeMarketIntel(payload);
      case 'comp:brandPosition':   return COMP_analyzeBrandPosition(payload);
      case 'comp:technicalSEO':    return COMP_analyzeTechnicalSEO(payload);
      case 'comp:contentIntel':    return COMP_analyzeContentIntel(payload);
      case 'comp:keywordStrategy': return COMP_analyzeKeywordStrategy(payload);
      case 'comp:contentSystems':  return COMP_analyzeContentSystems(payload);
      case 'comp:conversion':      return COMP_analyzeConversion(payload);
      case 'comp:distribution':    return COMP_analyzeDistribution(payload);
      case 'comp:audience':        return COMP_analyzeAudienceIntel(payload);
      case 'comp:geoAeo':          return COMP_analyzeGeoAeo(payload);
      case 'comp:authority':       return COMP_analyzeAuthority(payload);
      case 'comp:performance':     return COMP_analyzePerformance(payload);
      case 'comp:opportunity':     return COMP_analyzeOpportunityMatrix(payload);
      case 'comp:scoring':         return COMP_calculateScoringEngine(payload);
      case 'comp:compare':         return COMP_compareCompetitors(payload);
      // Competitor Intelligence - Full Orchestration (15 Categories):
      case 'COMP_orchestrateAnalysis': return COMP_orchestrateAnalysis(payload.config || payload);
      // ELITE Competitor Analysis (Routes to proven COMP system):
      case 'ELITE_analyzeCompetitors': return COMP_orchestrateAnalysis({
        competitors: payload.competitors || [],
        projectId: (payload.projectContext && payload.projectContext.projectId) || 'elite-' + Date.now(),
        yourDomain: (payload.projectContext && payload.projectContext.brandName) || 'Your Site',
        projectContext: payload.projectContext || {}
      });
      // Workflow Stages (NEW - using workflow_router.gs):
      case 'workflow:stage1': return runStage1Strategy(payload.data);
      case 'workflow:stage2': return runStage2Keywords(payload.data);
      case 'workflow:stage3': return runStage3Architecture(payload.data);
      case 'workflow:stage4': return runStage4Calendar(payload.data);
      case 'workflow:stage5': return runStage5Generation(payload.data);
      // Config & Project Inputs:
      case 'config:getInputs':   return CONFIG_getInputs(payload);
      case 'config:saveInputs':  return CONFIG_saveProjectInputs(payload);
      case 'config:saveOutput':  return CONFIG_savePromptOutput(payload.stage, payload.output, payload.projectId);
      case 'config:getOutput':   return CONFIG_getStageOutput(payload.stage, payload.projectId);
      case 'config:getApiConfig': return CONFIG_getApiConfig();
      case 'config:initUrls':    return CONFIG_initializeApiUrls();
      // Setup & Testing:
      case 'setup:init':         return SETUP_initializeSystem();
      case 'setup:showConfig':   return SETUP_showConfiguration();
      case 'setup:testDataBridge': return TEST_dataBridgeConnection();
      case 'setup:testFetcher':  return TEST_fetcherConnection();
      case 'setup:testCompAnalysis': return TEST_competitorAnalysisFlow();
      default: throw new Error('Unknown action: '+action);
    }
  }catch(e){
    return {ok:false, error:String(e), action:action, elapsed_ms:(new Date()-started)};
  }
}

/**
 * DB_COMP_Main.gs
 * Main orchestrator for Elite Competitor Analysis (15 categories)
 */

function DB_COMP_analyzeCompetitors(params) {
  return callGateway({
    action: 'comp:analyze',
    data: params || {}
  });
}

function DB_COMP_orchestrateAnalysis(config) {
  return callGateway({
    action: 'comp:orchestrate',
    data: config || {}
  });
}

function DB_COMP_compareCompetitors(params) {
  return callGateway({
    action: 'comp:compare',
    data: params || {}
  });
}

// Legacy names
function COMP_analyzeCompetitors(params) {
  return DB_COMP_analyzeCompetitors(params);
}

function COMP_orchestrateAnalysis(config) {
  return DB_COMP_orchestrateAnalysis(config);
}

function COMP_compareCompetitors(params) {
  return DB_COMP_compareCompetitors(params);
}

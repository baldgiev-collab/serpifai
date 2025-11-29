/**
 * DB_QA_QAEngine.gs
 * Quality Assurance Engine - E-E-A-T, AEO, GEO, Semantic, Readability
 */

// QA Router
function DB_QA_router(params) {
  return callGateway({
    action: 'qa:score',
    data: params || {}
  });
}

// E-E-A-T Checker
function DB_QA_eeatChecker(params) {
  return callGateway({
    action: 'qa:eeat',
    data: params || {}
  });
}

// AEO Checker
function DB_QA_aeoChecker(params) {
  return callGateway({
    action: 'qa:aeo',
    data: params || {}
  });
}

// GEO Checker
function DB_QA_geoChecker(params) {
  return callGateway({
    action: 'qa:geo',
    data: params || {}
  });
}

// Semantic Depth
function DB_QA_semanticDepth(params) {
  return callGateway({
    action: 'qa:semantic',
    data: params || {}
  });
}

// Readability Checker
function DB_QA_readabilityChecker(params) {
  return callGateway({
    action: 'qa:readability',
    data: params || {}
  });
}

// Legacy names
function QA_router(p) { return DB_QA_router(p); }
function QA_eeatChecker(p) { return DB_QA_eeatChecker(p); }
function QA_aeoChecker(p) { return DB_QA_aeoChecker(p); }
function QA_geoChecker(p) { return DB_QA_geoChecker(p); }
function QA_semanticDepth(p) { return DB_QA_semanticDepth(p); }
function QA_readabilityChecker(p) { return DB_QA_readabilityChecker(p); }

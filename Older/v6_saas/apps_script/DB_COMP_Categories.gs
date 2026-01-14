/**
 * DB_COMP_Categories.gs
 * All 15 Competitor Analysis Categories via Gateway
 */

// Category 1: Market Intelligence
function DB_COMP_analyzeMarketIntel(params) {
  return callGateway({ action: 'comp:marketIntel', data: params || {} });
}

// Category 2: Brand Positioning
function DB_COMP_analyzeBrandPosition(params) {
  return callGateway({ action: 'comp:brandPosition', data: params || {} });
}

// Category 3: Technical SEO
function DB_COMP_analyzeTechnicalSEO(params) {
  return callGateway({ action: 'comp:technicalSEO', data: params || {} });
}

// Category 4: Content Intelligence
function DB_COMP_analyzeContentIntel(params) {
  return callGateway({ action: 'comp:contentIntel', data: params || {} });
}

// Category 5: Keyword Strategy
function DB_COMP_analyzeKeywordStrategy(params) {
  return callGateway({ action: 'comp:keywordStrategy', data: params || {} });
}

// Category 6: Content Systems
function DB_COMP_analyzeContentSystems(params) {
  return callGateway({ action: 'comp:contentSystems', data: params || {} });
}

// Category 7: Conversion
function DB_COMP_analyzeConversion(params) {
  return callGateway({ action: 'comp:conversion', data: params || {} });
}

// Category 8: Distribution
function DB_COMP_analyzeDistribution(params) {
  return callGateway({ action: 'comp:distribution', data: params || {} });
}

// Category 9: Audience Intelligence
function DB_COMP_analyzeAudienceIntel(params) {
  return callGateway({ action: 'comp:audience', data: params || {} });
}

// Category 10: GEO + AEO
function DB_COMP_analyzeGeoAeo(params) {
  return callGateway({ action: 'comp:geoAeo', data: params || {} });
}

// Category 11: Authority
function DB_COMP_analyzeAuthority(params) {
  return callGateway({ action: 'comp:authority', data: params || {} });
}

// Category 12: Performance
function DB_COMP_analyzePerformance(params) {
  return callGateway({ action: 'comp:performance', data: params || {} });
}

// Category 13: Opportunity Matrix
function DB_COMP_analyzeOpportunityMatrix(params) {
  return callGateway({ action: 'comp:opportunity', data: params || {} });
}

// Category 14: Scoring Engine
function DB_COMP_calculateScoringEngine(params) {
  return callGateway({ action: 'comp:scoring', data: params || {} });
}

// Category 15: Overview
function DB_COMP_getOverview(params) {
  return callGateway({ action: 'comp:overview', data: params || {} });
}

// Legacy names for all categories
function COMP_analyzeMarketIntel(p) { return DB_COMP_analyzeMarketIntel(p); }
function COMP_analyzeBrandPosition(p) { return DB_COMP_analyzeBrandPosition(p); }
function COMP_analyzeTechnicalSEO(p) { return DB_COMP_analyzeTechnicalSEO(p); }
function COMP_analyzeContentIntel(p) { return DB_COMP_analyzeContentIntel(p); }
function COMP_analyzeKeywordStrategy(p) { return DB_COMP_analyzeKeywordStrategy(p); }
function COMP_analyzeContentSystems(p) { return DB_COMP_analyzeContentSystems(p); }
function COMP_analyzeConversion(p) { return DB_COMP_analyzeConversion(p); }
function COMP_analyzeDistribution(p) { return DB_COMP_analyzeDistribution(p); }
function COMP_analyzeAudienceIntel(p) { return DB_COMP_analyzeAudienceIntel(p); }
function COMP_analyzeGeoAeo(p) { return DB_COMP_analyzeGeoAeo(p); }
function COMP_analyzeAuthority(p) { return DB_COMP_analyzeAuthority(p); }
function COMP_analyzePerformance(p) { return DB_COMP_analyzePerformance(p); }
function COMP_analyzeOpportunityMatrix(p) { return DB_COMP_analyzeOpportunityMatrix(p); }
function COMP_calculateScoringEngine(p) { return DB_COMP_calculateScoringEngine(p); }
function COMP_getOverview(p) { return DB_COMP_getOverview(p); }

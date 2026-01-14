/**
 * DB_BL_Backlinks.gs
 * Backlinks Module - OpenPageRank, Insights, Gap Analysis
 */

// OpenPageRank Fetch
function DB_BL_openPageRankFetch(params) {
  return callGateway({
    action: 'backlinks:fetch',
    data: params || {}
  });
}

// Backlink Insights
function DB_BL_backlinkInsights(params) {
  return callGateway({
    action: 'backlinks:insights',
    data: params || {}
  });
}

// Backlink Gap Analysis
function DB_BL_backlinkGap(params) {
  return callGateway({
    action: 'backlinks:gap',
    data: params || {}
  });
}

// Legacy names
function BL_openPageRankFetch(p) { return DB_BL_openPageRankFetch(p); }
function BL_backlinkInsights(p) { return DB_BL_backlinkInsights(p); }
function BL_backlinkGap(p) { return DB_BL_backlinkGap(p); }

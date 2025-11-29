/**
 * DB_PERF_Performance.gs
 * Performance Engine - Insights, Dashboard, Decay Detection
 */

// Performance Insights
function DB_PERF_performanceInsights(params) {
  return callGateway({
    action: 'perf:insights',
    data: params || {}
  });
}

// Performance Dashboard
function DB_PERF_performanceDashboard(params) {
  return callGateway({
    action: 'perf:dashboard',
    data: params || {}
  });
}

// Decay Detection
function DB_PERF_decayDetection(params) {
  return callGateway({
    action: 'perf:decay',
    data: params || {}
  });
}

// Search Console Fetch
function DB_PERF_searchConsoleFetch(params) {
  return callGateway({
    action: 'perf:searchConsole',
    data: params || {}
  });
}

// Legacy names
function PERF_performanceInsights(p) { return DB_PERF_performanceInsights(p); }
function PERF_performanceDashboard(p) { return DB_PERF_performanceDashboard(p); }
function PERF_decayDetection(p) { return DB_PERF_decayDetection(p); }
function PERF_searchConsoleFetch(p) { return DB_PERF_searchConsoleFetch(p); }

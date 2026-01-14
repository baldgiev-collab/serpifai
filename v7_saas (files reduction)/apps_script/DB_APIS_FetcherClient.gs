/**
 * DB_APIS_FetcherClient.gs
 * Fetcher API integration via PHP Gateway
 */

function DB_APIS_fetcherCall(action, params) {
  return callGateway({
    action: 'fetcher:' + action,
    data: params || {}
  });
}

function DB_APIS_fetchCompetitorBenchmark(urls) {
  return callGateway({
    action: 'fetcher:competitorBenchmark',
    data: { urls: urls || [] }
  });
}

function DB_APIS_fetchSeoSnapshot(url) {
  return callGateway({
    action: 'fetcher:seoSnapshot',
    data: { url: url }
  });
}

// Legacy names
function APIS_fetcherCall(action, params) {
  return DB_APIS_fetcherCall(action, params);
}

function APIS_fetchCompetitorBenchmark(urls) {
  return DB_APIS_fetchCompetitorBenchmark(urls);
}

function APIS_fetchSeoSnapshot(url) {
  return DB_APIS_fetchSeoSnapshot(url);
}

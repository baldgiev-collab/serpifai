/**
 * DB_APIS_SearchConsoleAPI.gs
 * Google Search Console API via PHP Gateway
 */

function DB_APIS_searchConsole(siteUrl, dimensions, filters) {
  return callGateway({
    action: 'searchconsole:query',
    data: {
      siteUrl: siteUrl,
      dimensions: dimensions || [],
      filters: filters || {}
    }
  });
}

function APIS_searchConsole(siteUrl, dimensions, filters) {
  return DB_APIS_searchConsole(siteUrl, dimensions, filters);
}

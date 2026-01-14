/**
 * DB_APIS_OpenPageRankAPI.gs
 * OpenPageRank API integration via PHP Gateway
 */

function DB_APIS_openPageRank(domains) {
  return callGateway({
    action: 'openpagerank:fetch',
    data: { domains: Array.isArray(domains) ? domains : [domains] }
  });
}

function APIS_openPageRank(domains) {
  return DB_APIS_openPageRank(domains);
}

/**
 * DB_APIS_SerperAPI.gs
 * Serper API integration via PHP Gateway
 */

function DB_APIS_serper(query, params) {
  return callGateway({
    action: 'serper:search',
    data: { query: query, params: params || {} }
  });
}

function APIS_serper(query, params) {
  return DB_APIS_serper(query, params);
}

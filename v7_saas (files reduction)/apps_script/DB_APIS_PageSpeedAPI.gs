/**
 * DB_APIS_PageSpeedAPI.gs
 * PageSpeed Insights API via PHP Gateway
 */

function DB_APIS_pageSpeed(url, strategy) {
  return callGateway({
    action: 'pagespeed:analyze',
    data: { url: url, strategy: strategy || 'mobile' }
  });
}

function APIS_pageSpeed(url, strategy) {
  return DB_APIS_pageSpeed(url, strategy);
}

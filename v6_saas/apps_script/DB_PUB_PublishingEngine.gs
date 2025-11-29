/**
 * DB_PUB_PublishingEngine.gs
 * Publishing Engine - WordPress, Notion, Ghost, Scheduling
 */

// WordPress Publishing
function DB_PUB_wordpressPublish(params) {
  return callGateway({
    action: 'pub:wp',
    data: params || {}
  });
}

// Notion Publishing
function DB_PUB_notionPublish(params) {
  return callGateway({
    action: 'pub:notion',
    data: params || {}
  });
}

// Ghost Publishing
function DB_PUB_ghostPublish(params) {
  return callGateway({
    action: 'pub:ghost',
    data: params || {}
  });
}

// Post Scheduling
function DB_PUB_schedulePosts(params) {
  return callGateway({
    action: 'pub:schedule',
    data: params || {}
  });
}

// IndexNow Notification
function DB_PUB_indexNowNotify(params) {
  return callGateway({
    action: 'pub:indexnow',
    data: params || {}
  });
}

// WordPress Mapper
function DB_PUB_wpMapper(params) {
  return callGateway({
    action: 'pub:wpMapper',
    data: params || {}
  });
}

// Legacy names
function PUB_wordpressPublish(p) { return DB_PUB_wordpressPublish(p); }
function PUB_notionPublish(p) { return DB_PUB_notionPublish(p); }
function PUB_ghostPublish(p) { return DB_PUB_ghostPublish(p); }
function PUB_schedulePosts(p) { return DB_PUB_schedulePosts(p); }
function PUB_indexNowNotify(p) { return DB_PUB_indexNowNotify(p); }
function WP_map(p) { return DB_PUB_wpMapper(p); }

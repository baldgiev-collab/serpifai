/**
 * DB_Analytics.gs - Analytics Integration
 * SerpifAI V8 - Analytics data collection and reporting
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ANALYTICS DATA
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get analytics summary for project
 */
function DB_getAnalyticsSummary(params) {
  const projectId = params.projectId;
  const period = params.period || '30d';
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const days = parsePeriodToDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sql = 'SELECT ' +
      'COUNT(DISTINCT keyword_id) AS tracked_keywords, ' +
      'COUNT(*) AS total_checks, ' +
      'AVG(position) AS avg_position, ' +
      'SUM(CASE WHEN position <= 10 THEN 1 ELSE 0 END) AS top_10, ' +
      'SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) AS top_3 ' +
      'FROM ranking_history ' +
      'WHERE project_id = ? AND created_at >= ?';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId);
    stmt.setString(2, startDate.toISOString().split('T')[0]);
    
    const rs = stmt.executeQuery();
    let summary = null;
    
    if (rs.next()) {
      summary = {
        trackedKeywords: rs.getInt('tracked_keywords'),
        totalChecks: rs.getInt('total_checks'),
        avgPosition: Math.round(rs.getDouble('avg_position') * 10) / 10,
        top10: rs.getInt('top_10'),
        top3: rs.getInt('top_3')
      };
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, summary: summary };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Parse period string to days
 */
function parsePeriodToDays(period) {
  const match = period.match(/(\d+)([dwmy])/);
  if (!match) return 30;
  
  const num = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return num;
    case 'w': return num * 7;
    case 'm': return num * 30;
    case 'y': return num * 365;
    default: return 30;
  }
}

/**
 * Get ranking trends
 */
function DB_Analytics_getRankingTrends(params) {
  const projectId = params.projectId;
  const keywordId = params.keywordId;
  const days = params.days || 30;
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    let sql = 'SELECT DATE(created_at) AS date, AVG(position) AS avg_position, ' +
      'COUNT(*) AS checks ' +
      'FROM ranking_history ' +
      'WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    
    const bindValues = [days];
    
    if (projectId) {
      sql += ' AND project_id = ?';
      bindValues.push(projectId);
    }
    
    if (keywordId) {
      sql += ' AND keyword_id = ?';
      bindValues.push(keywordId);
    }
    
    sql += ' GROUP BY DATE(created_at) ORDER BY date ASC';
    
    const stmt = conn.prepareStatement(sql);
    for (let i = 0; i < bindValues.length; i++) {
      if (typeof bindValues[i] === 'number') {
        stmt.setInt(i + 1, bindValues[i]);
      } else {
        stmt.setString(i + 1, bindValues[i]);
      }
    }
    
    const rs = stmt.executeQuery();
    const trends = [];
    
    while (rs.next()) {
      trends.push({
        date: rs.getString('date'),
        avgPosition: Math.round(rs.getDouble('avg_position') * 10) / 10,
        checks: rs.getInt('checks')
      });
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, trends: trends };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get top performing keywords
 */
function DB_getTopKeywords(params) {
  const projectId = params.projectId;
  const limit = params.limit || 10;
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'SELECT k.id, k.keyword, k.search_volume, ' +
      'h.position, h.url, h.created_at ' +
      'FROM keywords k ' +
      'LEFT JOIN ranking_history h ON k.id = h.keyword_id ' +
      'AND h.id = (SELECT MAX(id) FROM ranking_history WHERE keyword_id = k.id) ' +
      'WHERE k.project_id = ? ' +
      'ORDER BY h.position ASC ' +
      'LIMIT ?';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId);
    stmt.setInt(2, limit);
    
    const rs = stmt.executeQuery();
    const keywords = [];
    
    while (rs.next()) {
      keywords.push({
        id: rs.getString('id'),
        keyword: rs.getString('keyword'),
        searchVolume: rs.getInt('search_volume'),
        position: rs.getInt('position'),
        url: rs.getString('url'),
        lastCheck: rs.getString('created_at')
      });
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, keywords: keywords };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get ranking distribution
 */
function DB_getRankingDistribution(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'SELECT ' +
      'SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) AS pos_1_3, ' +
      'SUM(CASE WHEN position > 3 AND position <= 10 THEN 1 ELSE 0 END) AS pos_4_10, ' +
      'SUM(CASE WHEN position > 10 AND position <= 20 THEN 1 ELSE 0 END) AS pos_11_20, ' +
      'SUM(CASE WHEN position > 20 AND position <= 50 THEN 1 ELSE 0 END) AS pos_21_50, ' +
      'SUM(CASE WHEN position > 50 OR position IS NULL THEN 1 ELSE 0 END) AS pos_50_plus ' +
      'FROM (SELECT k.id, ' +
      '(SELECT position FROM ranking_history WHERE keyword_id = k.id ORDER BY created_at DESC LIMIT 1) AS position ' +
      'FROM keywords k WHERE k.project_id = ?) AS latest';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId);
    
    const rs = stmt.executeQuery();
    let distribution = null;
    
    if (rs.next()) {
      distribution = {
        pos1_3: rs.getInt('pos_1_3'),
        pos4_10: rs.getInt('pos_4_10'),
        pos11_20: rs.getInt('pos_11_20'),
        pos21_50: rs.getInt('pos_21_50'),
        pos50Plus: rs.getInt('pos_50_plus')
      };
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, distribution: distribution };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Log analytics event
 */
function DB_logAnalyticsEvent(params) {
  const event = params.event;
  const projectId = params.projectId;
  const data = params.data || {};
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'INSERT INTO analytics_events (project_id, event_type, event_data, created_at) ' +
      'VALUES (?, ?, ?, NOW())';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId || null);
    stmt.setString(2, event);
    stmt.setString(3, JSON.stringify(data));
    
    stmt.executeUpdate();
    stmt.close();
    conn.close();
    
    return { ok: true };
  } catch (err) {
    // Non-critical, log but don't fail
    console.error('Analytics event error: ' + err.message);
    return { ok: true, warning: 'Event not logged' };
  }
}

/**
 * Get project activity
 */
function DB_Analytics_getProjectActivity(params) {
  const projectId = params.projectId;
  const limit = params.limit || 20;
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'SELECT event_type, event_data, created_at ' +
      'FROM analytics_events ' +
      'WHERE project_id = ? ' +
      'ORDER BY created_at DESC ' +
      'LIMIT ?';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId);
    stmt.setInt(2, limit);
    
    const rs = stmt.executeQuery();
    const activity = [];
    
    while (rs.next()) {
      activity.push({
        event: rs.getString('event_type'),
        data: JSON.parse(rs.getString('event_data') || '{}'),
        timestamp: rs.getString('created_at')
      });
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, activity: activity };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get daily stats
 */
function DB_getDailyStats(params) {
  const projectId = params.projectId;
  const days = params.days || 7;
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'SELECT DATE(created_at) AS date, ' +
      'COUNT(*) AS events, ' +
      'COUNT(DISTINCT event_type) AS unique_events ' +
      'FROM analytics_events ' +
      'WHERE project_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ' +
      'GROUP BY DATE(created_at) ' +
      'ORDER BY date ASC';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, projectId);
    stmt.setInt(2, days);
    
    const rs = stmt.executeQuery();
    const stats = [];
    
    while (rs.next()) {
      stats.push({
        date: rs.getString('date'),
        events: rs.getInt('events'),
        uniqueEvents: rs.getInt('unique_events')
      });
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return { ok: true, stats: stats };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

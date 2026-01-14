/**
 * DB_History.gs - History Tracking
 * SerpifAI V8 - Track changes and history
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// HISTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Log history event
 */
function DB_logHistory(params) {
  const eventType = params.eventType;
  const entityType = params.entityType;
  const entityId = params.entityId;
  const data = params.data || {};
  
  try {
    const history = loadHistory();
    
    const entry = {
      id: generateHistoryId(),
      eventType: eventType,
      entityType: entityType,
      entityId: entityId,
      data: data,
      timestamp: new Date().toISOString(),
      user: Session.getActiveUser().getEmail() || 'system'
    };
    
    history.unshift(entry);
    
    // Keep only last 500 entries
    if (history.length > 500) {
      history.splice(500);
    }
    
    saveHistory(history);
    
    return { ok: true, entry: entry };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate history ID
 */
function generateHistoryId() {
  return 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

/**
 * Get history entries
 */
function DB_getHistory(params) {
  const entityType = params.entityType;
  const entityId = params.entityId;
  const limit = params.limit || 50;
  
  try {
    let history = loadHistory();
    
    // Filter by entity if specified
    if (entityType) {
      history = history.filter(function(h) { return h.entityType === entityType; });
    }
    
    if (entityId) {
      history = history.filter(function(h) { return h.entityId === entityId; });
    }
    
    return {
      ok: true,
      history: history.slice(0, limit),
      total: history.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get ranking history for a keyword
 */
function DB_getKeywordHistory(params) {
  const keyword = params.keyword;
  const days = params.days || 30;
  
  try {
    const history = loadHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const keywordHistory = history.filter(function(h) {
      return h.entityType === 'keyword' &&
             h.data.keyword === keyword &&
             new Date(h.timestamp) >= cutoff;
    });
    
    // Build timeline
    const timeline = keywordHistory.map(function(h) {
      return {
        date: h.timestamp.split('T')[0],
        position: h.data.position,
        change: h.data.change
      };
    }).reverse();
    
    return {
      ok: true,
      keyword: keyword,
      timeline: timeline
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get project activity
 */
function DB_Hist_getProjectActivity(params) {
  const projectId = params.projectId;
  const limit = params.limit || 20;
  
  try {
    const history = loadHistory();
    
    const activity = history.filter(function(h) {
      return h.data.projectId === projectId || h.entityId === projectId;
    }).slice(0, limit);
    
    return {
      ok: true,
      activity: activity
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// HISTORY STORAGE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Load history from storage
 */
function loadHistory() {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('SERPIFAI_HISTORY');
    
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Load history error: ' + e.message);
  }
  
  return [];
}

/**
 * Save history to storage
 */
function saveHistory(history) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SERPIFAI_HISTORY', JSON.stringify(history));
}

/**
 * Clear old history
 */
function DB_clearOldHistory(params) {
  const daysToKeep = params.days || 90;
  
  try {
    const history = loadHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    const filtered = history.filter(function(h) {
      return new Date(h.timestamp) >= cutoff;
    });
    
    const removed = history.length - filtered.length;
    saveHistory(filtered);
    
    return { ok: true, removed: removed, remaining: filtered.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// HISTORY ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get history stats
 */
function DB_getHistoryStats() {
  try {
    const history = loadHistory();
    
    // Group by event type
    const byType = {};
    history.forEach(function(h) {
      byType[h.eventType] = (byType[h.eventType] || 0) + 1;
    });
    
    // Group by day
    const byDay = {};
    history.forEach(function(h) {
      const day = h.timestamp.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    
    // Recent activity
    const today = new Date().toISOString().split('T')[0];
    const todayCount = byDay[today] || 0;
    
    return {
      ok: true,
      stats: {
        total: history.length,
        byType: byType,
        byDay: byDay,
        todayCount: todayCount
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get ranking trends
 */
function DB_Hist_getRankingTrends(params) {
  const days = params.days || 30;
  
  try {
    const history = loadHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const rankingHistory = history.filter(function(h) {
      return h.eventType === 'ranking_update' &&
             new Date(h.timestamp) >= cutoff;
    });
    
    // Calculate averages per day
    const dailyAverages = {};
    rankingHistory.forEach(function(h) {
      const day = h.timestamp.split('T')[0];
      if (!dailyAverages[day]) {
        dailyAverages[day] = { positions: [], count: 0 };
      }
      if (h.data.position) {
        dailyAverages[day].positions.push(h.data.position);
        dailyAverages[day].count++;
      }
    });
    
    const trends = Object.keys(dailyAverages).sort().map(function(day) {
      const positions = dailyAverages[day].positions;
      const avg = positions.reduce(function(s, p) { return s + p; }, 0) / positions.length;
      return {
        date: day,
        avgPosition: Math.round(avg * 10) / 10,
        count: dailyAverages[day].count
      };
    });
    
    return {
      ok: true,
      trends: trends
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export history
 */
function DB_exportHistory(params) {
  const format = params.format || 'json';
  
  try {
    const history = loadHistory();
    
    if (format === 'json') {
      return {
        ok: true,
        format: 'json',
        data: JSON.stringify(history, null, 2)
      };
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Event Type', 'Entity Type', 'Entity ID', 'User'];
      const rows = history.map(function(h) {
        return [h.id, h.timestamp, h.eventType, h.entityType, h.entityId, h.user].join(',');
      });
      
      return {
        ok: true,
        format: 'csv',
        data: headers.join(',') + '\n' + rows.join('\n')
      };
    }
    
    return { ok: false, error: 'Unknown format: ' + format };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE LOGGERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Log keyword added
 */
function DB_logKeywordAdded(keyword, projectId) {
  return DB_logHistory({
    eventType: 'keyword_added',
    entityType: 'keyword',
    entityId: keyword,
    data: { keyword: keyword, projectId: projectId }
  });
}

/**
 * Log ranking update
 */
function DB_logRankingUpdate(keyword, position, change) {
  return DB_logHistory({
    eventType: 'ranking_update',
    entityType: 'keyword',
    entityId: keyword,
    data: { keyword: keyword, position: position, change: change }
  });
}

/**
 * Log project created
 */
function DB_logProjectCreated(projectId, name) {
  return DB_logHistory({
    eventType: 'project_created',
    entityType: 'project',
    entityId: projectId,
    data: { name: name }
  });
}

/**
 * Log report generated
 */
function DB_logReportGenerated(projectId, reportType) {
  return DB_logHistory({
    eventType: 'report_generated',
    entityType: 'report',
    entityId: projectId,
    data: { projectId: projectId, reportType: reportType }
  });
}

/**
 * Log competitor added
 */
function DB_logCompetitorAdded(domain, projectId) {
  return DB_logHistory({
    eventType: 'competitor_added',
    entityType: 'competitor',
    entityId: domain,
    data: { domain: domain, projectId: projectId }
  });
}

/**
 * DB_Alerts.gs - Alert System
 * SerpifAI V8 - Manage SEO alerts and notifications
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ALERT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get all alerts
 */
function DB_getAlerts(params) {
  try {
    const alerts = loadAlerts();
    const active = alerts.filter(function(a) { return !a.dismissed; });
    
    return {
      ok: true,
      alerts: active,
      total: alerts.length,
      unread: active.filter(function(a) { return !a.read; }).length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Create new alert
 */
function DB_createAlert(params) {
  const type = params.type || 'info';
  const title = params.title;
  const message = params.message;
  const priority = params.priority || 'medium';
  
  if (!title) {
    return { ok: false, error: 'Alert title is required' };
  }
  
  try {
    const alerts = loadAlerts();
    
    const newAlert = {
      id: generateAlertId(),
      type: type,
      title: title,
      message: message || '',
      priority: priority,
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString()
    };
    
    alerts.unshift(newAlert);
    
    // Keep only last 100 alerts
    if (alerts.length > 100) {
      alerts.splice(100);
    }
    
    saveAlerts(alerts);
    
    return { ok: true, alert: newAlert };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate alert ID
 */
function generateAlertId() {
  return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Mark alert as read
 */
function DB_markAlertRead(params) {
  const alertId = params.alertId;
  
  try {
    const alerts = loadAlerts();
    
    const alert = alerts.find(function(a) { return a.id === alertId; });
    if (alert) {
      alert.read = true;
      saveAlerts(alerts);
    }
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Dismiss alert
 */
function DB_dismissAlert(params) {
  const alertId = params.alertId;
  
  try {
    const alerts = loadAlerts();
    
    const alert = alerts.find(function(a) { return a.id === alertId; });
    if (alert) {
      alert.dismissed = true;
      saveAlerts(alerts);
    }
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Dismiss all alerts
 */
function DB_dismissAllAlerts() {
  try {
    const alerts = loadAlerts();
    
    alerts.forEach(function(a) { a.dismissed = true; });
    saveAlerts(alerts);
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ALERT STORAGE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Load alerts from storage
 */
function loadAlerts() {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('SERPIFAI_ALERTS');
    
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Load alerts error: ' + e.message);
  }
  
  return getDefaultAlerts();
}

/**
 * Save alerts to storage
 */
function saveAlerts(alerts) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SERPIFAI_ALERTS', JSON.stringify(alerts));
}

/**
 * Get default alerts
 */
function getDefaultAlerts() {
  return [
    {
      id: 'welcome',
      type: 'info',
      title: 'Welcome to SerpifAI',
      message: 'Your SEO analysis tool is ready to use. Start by adding keywords to track.',
      priority: 'low',
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString()
    }
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ALERT RULES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get alert rules
 */
function DB_getAlertRules() {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('ALERT_RULES');
    
    if (data) {
      return { ok: true, rules: JSON.parse(data) };
    }
    
    return { ok: true, rules: getDefaultAlertRules() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get default alert rules
 */
function getDefaultAlertRules() {
  return [
    {
      id: 'rank_drop',
      name: 'Ranking Drop',
      enabled: true,
      condition: 'position_change > 5',
      message: 'Keyword "{keyword}" dropped {change} positions'
    },
    {
      id: 'rank_top3',
      name: 'Top 3 Achievement',
      enabled: true,
      condition: 'position <= 3 AND previous_position > 3',
      message: 'Keyword "{keyword}" reached Top 3!'
    },
    {
      id: 'competitor_change',
      name: 'Competitor Movement',
      enabled: true,
      condition: 'competitor_position_change > 10',
      message: 'Competitor {competitor} moved significantly for "{keyword}"'
    }
  ];
}

/**
 * Save alert rules
 */
function DB_saveAlertRules(params) {
  const rules = params.rules;
  
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('ALERT_RULES', JSON.stringify(rules));
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Enable/disable alert rule
 */
function DB_toggleAlertRule(params) {
  const ruleId = params.ruleId;
  const enabled = params.enabled;
  
  try {
    const result = DB_getAlertRules();
    if (!result.ok) return result;
    
    const rules = result.rules;
    const rule = rules.find(function(r) { return r.id === ruleId; });
    
    if (rule) {
      rule.enabled = enabled;
      DB_saveAlertRules({ rules: rules });
    }
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// AUTOMATED ALERTS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check for ranking alerts
 */
function DB_checkRankingAlerts(rankings, previousRankings) {
  const alerts = [];
  
  rankings.forEach(function(current) {
    const previous = previousRankings.find(function(p) {
      return p.keyword === current.keyword;
    });
    
    if (!previous) return;
    
    const change = previous.position - current.position;
    
    // Rank drop alert
    if (change < -5) {
      alerts.push({
        type: 'warning',
        title: 'Ranking Drop',
        message: current.keyword + ' dropped ' + Math.abs(change) + ' positions (now #' + current.position + ')',
        priority: 'high'
      });
    }
    
    // Top 3 achievement
    if (current.position <= 3 && previous.position > 3) {
      alerts.push({
        type: 'success',
        title: 'Top 3 Achievement!',
        message: current.keyword + ' reached position #' + current.position,
        priority: 'medium'
      });
    }
    
    // Lost from first page
    if (current.position > 10 && previous.position <= 10) {
      alerts.push({
        type: 'warning',
        title: 'Lost First Page',
        message: current.keyword + ' dropped from page 1 to position #' + current.position,
        priority: 'high'
      });
    }
  });
  
  // Create alerts
  alerts.forEach(function(a) {
    DB_createAlert(a);
  });
  
  return { ok: true, alertsCreated: alerts.length };
}

/**
 * Check for competitor alerts
 */
function DB_checkCompetitorAlerts(competitors) {
  const alerts = [];
  
  competitors.forEach(function(comp) {
    if (comp.visibilityChange > 10) {
      alerts.push({
        type: 'info',
        title: 'Competitor Gaining',
        message: comp.domain + ' visibility increased by ' + comp.visibilityChange + '%',
        priority: 'medium'
      });
    }
  });
  
  alerts.forEach(function(a) {
    DB_createAlert(a);
  });
  
  return { ok: true, alertsCreated: alerts.length };
}

/**
 * Get alert summary
 */
function DB_getAlertSummary() {
  try {
    const alerts = loadAlerts();
    const active = alerts.filter(function(a) { return !a.dismissed; });
    
    return {
      ok: true,
      summary: {
        total: active.length,
        unread: active.filter(function(a) { return !a.read; }).length,
        byType: {
          success: active.filter(function(a) { return a.type === 'success'; }).length,
          warning: active.filter(function(a) { return a.type === 'warning'; }).length,
          error: active.filter(function(a) { return a.type === 'error'; }).length,
          info: active.filter(function(a) { return a.type === 'info'; }).length
        },
        byPriority: {
          high: active.filter(function(a) { return a.priority === 'high'; }).length,
          medium: active.filter(function(a) { return a.priority === 'medium'; }).length,
          low: active.filter(function(a) { return a.priority === 'low'; }).length
        }
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get alert history
 */
function DB_getAlertHistory(params) {
  const days = params.days || 30;
  
  try {
    const alerts = loadAlerts();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const history = alerts.filter(function(a) {
      return new Date(a.createdAt) >= cutoff;
    });
    
    return {
      ok: true,
      history: history,
      count: history.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

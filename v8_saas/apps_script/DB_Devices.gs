/**
 * DB_Devices.gs - Device Type Management
 * SerpifAI V8 - Mobile/Desktop tracking
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// DEVICE TYPE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get device types
 */
function DB_getDeviceTypes() {
  const devices = [
    { id: 'desktop', name: 'Desktop', icon: '🖥️', userAgent: 'desktop' },
    { id: 'mobile', name: 'Mobile', icon: '📱', userAgent: 'mobile' },
    { id: 'tablet', name: 'Tablet', icon: '📱', userAgent: 'tablet' }
  ];
  
  return { ok: true, devices: devices };
}

/**
 * Assign device to keyword tracking
 */
function DB_assignKeywordDevice(params) {
  const keywordId = params.keywordId;
  const deviceType = params.deviceType || 'desktop';
  
  if (!keywordId) {
    return { ok: false, error: 'Keyword ID required' };
  }
  
  try {
    GW_query({
      action: 'update',
      sql: 'UPDATE keywords SET device_type = ? WHERE id = ?',
      params: [deviceType, keywordId]
    });
    
    return { ok: true, keywordId: keywordId, deviceType: deviceType };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get keywords by device type
 */
function DB_getKeywordsByDevice(params) {
  const projectId = params.projectId;
  const deviceType = params.deviceType;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    let sql = 'SELECT * FROM keywords WHERE project_id = ?';
    const sqlParams = [projectId];
    
    if (deviceType) {
      sql += ' AND device_type = ?';
      sqlParams.push(deviceType);
    }
    
    sql += ' ORDER BY keyword';
    
    const result = GW_query({
      action: 'select',
      sql: sql,
      params: sqlParams
    });
    
    return { ok: true, keywords: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Compare rankings by device
 */
function DB_compareDeviceRankings(params) {
  const projectId = params.projectId;
  const keywordId = params.keywordId;
  
  if (!projectId || !keywordId) {
    return { ok: false, error: 'Project ID and keyword ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT device_type, position, url, checked_at
            FROM keyword_rankings 
            WHERE keyword_id = ?
            ORDER BY device_type, checked_at DESC`,
      params: [keywordId]
    });
    
    // Group by device
    const byDevice = {};
    (result.rows || []).forEach(function(row) {
      const device = row.device_type || 'desktop';
      if (!byDevice[device]) {
        byDevice[device] = [];
      }
      byDevice[device].push(row);
    });
    
    return { ok: true, comparison: byDevice };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get device distribution stats
 */
function DB_getDeviceDistribution(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT device_type, COUNT(*) as count,
            AVG(current_rank) as avg_rank,
            SUM(CASE WHEN current_rank <= 10 THEN 1 ELSE 0 END) as top_10
            FROM keywords 
            WHERE project_id = ?
            GROUP BY device_type`,
      params: [projectId]
    });
    
    return { ok: true, distribution: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Bulk set device type
 */
function DB_bulkSetDeviceType(params) {
  const keywordIds = params.keywordIds || [];
  const deviceType = params.deviceType || 'desktop';
  
  if (keywordIds.length === 0) {
    return { ok: false, error: 'Keyword IDs required' };
  }
  
  try {
    const placeholders = keywordIds.map(function() { return '?'; }).join(',');
    
    GW_query({
      action: 'update',
      sql: 'UPDATE keywords SET device_type = ? WHERE id IN (' + placeholders + ')',
      params: [deviceType].concat(keywordIds)
    });
    
    return { ok: true, updated: keywordIds.length, deviceType: deviceType };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Track keyword on multiple devices
 */
function DB_trackMultiDevice(params) {
  const keyword = params.keyword;
  const projectId = params.projectId;
  const devices = params.devices || ['desktop', 'mobile'];
  
  if (!keyword || !projectId) {
    return { ok: false, error: 'Keyword and project ID required' };
  }
  
  try {
    const results = [];
    
    devices.forEach(function(device) {
      // Create keyword entry for each device
      const existing = GW_query({
        action: 'select',
        sql: 'SELECT id FROM keywords WHERE project_id = ? AND keyword = ? AND device_type = ?',
        params: [projectId, keyword, device]
      });
      
      if (existing.rows && existing.rows.length > 0) {
        results.push({ device: device, keywordId: existing.rows[0].id, status: 'exists' });
      } else {
        const insert = GW_query({
          action: 'insert',
          sql: 'INSERT INTO keywords (project_id, keyword, device_type, created_at) VALUES (?, ?, ?, NOW())',
          params: [projectId, keyword, device]
        });
        results.push({ device: device, keywordId: insert.insertId, status: 'created' });
      }
    });
    
    return { ok: true, results: results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get mobile vs desktop comparison
 */
function DB_getMobileDesktopComparison(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    // Get unique keywords tracked on both devices
    const result = GW_query({
      action: 'select',
      sql: `SELECT k1.keyword,
            k1.current_rank as desktop_rank,
            k2.current_rank as mobile_rank,
            (COALESCE(k1.current_rank, 101) - COALESCE(k2.current_rank, 101)) as rank_diff
            FROM keywords k1
            INNER JOIN keywords k2 ON k1.keyword = k2.keyword AND k1.project_id = k2.project_id
            WHERE k1.project_id = ? 
            AND k1.device_type = 'desktop' 
            AND k2.device_type = 'mobile'
            ORDER BY ABS(COALESCE(k1.current_rank, 101) - COALESCE(k2.current_rank, 101)) DESC`,
      params: [projectId]
    });
    
    const comparison = result.rows || [];
    
    // Calculate summary stats
    let mobileWins = 0;
    let desktopWins = 0;
    let ties = 0;
    
    comparison.forEach(function(row) {
      if (row.mobile_rank < row.desktop_rank) mobileWins++;
      else if (row.desktop_rank < row.mobile_rank) desktopWins++;
      else ties++;
    });
    
    return {
      ok: true,
      comparison: comparison,
      summary: {
        total: comparison.length,
        mobileWins: mobileWins,
        desktopWins: desktopWins,
        ties: ties
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get device ranking trends
 */
function DB_getDeviceRankingTrends(params) {
  const projectId = params.projectId;
  const days = params.days || 30;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT DATE(checked_at) as date, device_type,
            AVG(position) as avg_rank,
            COUNT(*) as checks
            FROM keyword_rankings kr
            INNER JOIN keywords k ON kr.keyword_id = k.id
            WHERE k.project_id = ? 
            AND kr.checked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(checked_at), device_type
            ORDER BY date, device_type`,
      params: [projectId, days]
    });
    
    return { ok: true, trends: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

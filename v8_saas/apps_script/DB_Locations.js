/**
 * DB_Locations.gs - Location/Region Management
 * SerpifAI V8 - Multi-location tracking
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// LOCATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get all locations for project
 */
function DB_getLocations(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT l.*, 
            (SELECT COUNT(*) FROM keyword_locations kl WHERE kl.location_id = l.id) as keyword_count
            FROM locations l 
            WHERE l.project_id = ? 
            ORDER BY l.name`,
      params: [projectId]
    });
    
    return {
      ok: true,
      locations: result.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Create location
 */
function DB_createLocation(params) {
  const projectId = params.projectId;
  const name = params.name;
  const countryCode = params.countryCode || 'US';
  const language = params.language || 'en';
  const googleDomain = params.googleDomain || 'google.com';
  const city = params.city || '';
  const state = params.state || '';
  
  if (!projectId || !name) {
    return { ok: false, error: 'Project ID and location name required' };
  }
  
  try {
    const result = GW_query({
      action: 'insert',
      sql: `INSERT INTO locations (project_id, name, country_code, language, google_domain, city, state, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      params: [projectId, name, countryCode, language, googleDomain, city, state]
    });
    
    return {
      ok: true,
      locationId: result.insertId,
      name: name
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Update location
 */
function DB_updateLocation(params) {
  const locationId = params.locationId;
  
  if (!locationId) {
    return { ok: false, error: 'Location ID required' };
  }
  
  try {
    const updates = [];
    const values = [];
    
    const fields = ['name', 'countryCode', 'language', 'googleDomain', 'city', 'state'];
    fields.forEach(function(field) {
      if (params[field] !== undefined) {
        const dbField = field.replace(/[A-Z]/g, function(c) { return '_' + c.toLowerCase(); });
        updates.push(dbField + ' = ?');
        values.push(params[field]);
      }
    });
    
    if (updates.length === 0) {
      return { ok: false, error: 'No fields to update' };
    }
    
    values.push(locationId);
    
    GW_query({
      action: 'update',
      sql: 'UPDATE locations SET ' + updates.join(', ') + ' WHERE id = ?',
      params: values
    });
    
    return { ok: true, locationId: locationId };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Delete location
 */
function DB_deleteLocation(params) {
  const locationId = params.locationId;
  
  if (!locationId) {
    return { ok: false, error: 'Location ID required' };
  }
  
  try {
    // Remove keyword associations
    GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_locations WHERE location_id = ?',
      params: [locationId]
    });
    
    // Delete location
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM locations WHERE id = ?',
      params: [locationId]
    });
    
    return { ok: true, deleted: result.affectedRows > 0 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Assign keyword to location
 */
function DB_assignKeywordToLocation(params) {
  const keywordId = params.keywordId;
  const locationId = params.locationId;
  
  if (!keywordId || !locationId) {
    return { ok: false, error: 'Keyword ID and location ID required' };
  }
  
  try {
    GW_query({
      action: 'insert',
      sql: 'INSERT IGNORE INTO keyword_locations (keyword_id, location_id, assigned_at) VALUES (?, ?, NOW())',
      params: [keywordId, locationId]
    });
    
    return { ok: true, keywordId: keywordId, locationId: locationId };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Remove keyword from location
 */
function DB_removeKeywordFromLocation(params) {
  const keywordId = params.keywordId;
  const locationId = params.locationId;
  
  if (!keywordId || !locationId) {
    return { ok: false, error: 'Keyword ID and location ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_locations WHERE keyword_id = ? AND location_id = ?',
      params: [keywordId, locationId]
    });
    
    return { ok: true, removed: result.affectedRows > 0 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get keywords by location
 */
function DB_getKeywordsByLocation(params) {
  const locationId = params.locationId;
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  
  if (!locationId) {
    return { ok: false, error: 'Location ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT k.* FROM keywords k 
            INNER JOIN keyword_locations kl ON k.id = kl.keyword_id 
            WHERE kl.location_id = ? 
            ORDER BY k.keyword 
            LIMIT ? OFFSET ?`,
      params: [locationId, limit, offset]
    });
    
    return { ok: true, keywords: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get rankings by location
 */
function DB_getRankingsByLocation(params) {
  const projectId = params.projectId;
  const locationId = params.locationId;
  
  if (!projectId || !locationId) {
    return { ok: false, error: 'Project ID and location ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT k.keyword, k.current_rank, k.previous_rank, k.best_rank,
            l.name as location_name, l.country_code
            FROM keywords k 
            INNER JOIN keyword_locations kl ON k.id = kl.keyword_id 
            INNER JOIN locations l ON kl.location_id = l.id
            WHERE k.project_id = ? AND kl.location_id = ?
            ORDER BY k.current_rank`,
      params: [projectId, locationId]
    });
    
    return { ok: true, rankings: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Compare rankings across locations
 */
function DB_compareLocationRankings(params) {
  const projectId = params.projectId;
  const keywordId = params.keywordId;
  
  if (!projectId || !keywordId) {
    return { ok: false, error: 'Project ID and keyword ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT l.name as location_name, l.country_code, l.city,
            kr.position, kr.url, kr.checked_at
            FROM locations l
            LEFT JOIN keyword_rankings kr ON kr.location_id = l.id AND kr.keyword_id = ?
            WHERE l.project_id = ?
            ORDER BY l.name`,
      params: [keywordId, projectId]
    });
    
    return { ok: true, comparison: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get location presets
 */
function DB_getLocationPresets() {
  const presets = [
    { name: 'United States', countryCode: 'US', language: 'en', googleDomain: 'google.com' },
    { name: 'United Kingdom', countryCode: 'GB', language: 'en', googleDomain: 'google.co.uk' },
    { name: 'Canada', countryCode: 'CA', language: 'en', googleDomain: 'google.ca' },
    { name: 'Australia', countryCode: 'AU', language: 'en', googleDomain: 'google.com.au' },
    { name: 'Germany', countryCode: 'DE', language: 'de', googleDomain: 'google.de' },
    { name: 'France', countryCode: 'FR', language: 'fr', googleDomain: 'google.fr' },
    { name: 'Spain', countryCode: 'ES', language: 'es', googleDomain: 'google.es' },
    { name: 'Italy', countryCode: 'IT', language: 'it', googleDomain: 'google.it' },
    { name: 'Netherlands', countryCode: 'NL', language: 'nl', googleDomain: 'google.nl' },
    { name: 'Brazil', countryCode: 'BR', language: 'pt', googleDomain: 'google.com.br' },
    { name: 'Mexico', countryCode: 'MX', language: 'es', googleDomain: 'google.com.mx' },
    { name: 'India', countryCode: 'IN', language: 'en', googleDomain: 'google.co.in' },
    { name: 'Japan', countryCode: 'JP', language: 'ja', googleDomain: 'google.co.jp' },
    { name: 'South Korea', countryCode: 'KR', language: 'ko', googleDomain: 'google.co.kr' }
  ];
  
  return { ok: true, presets: presets };
}

/**
 * Bulk assign keywords to location
 */
function DB_bulkAssignToLocation(params) {
  const keywordIds = params.keywordIds || [];
  const locationId = params.locationId;
  
  if (keywordIds.length === 0 || !locationId) {
    return { ok: false, error: 'Keyword IDs and location ID required' };
  }
  
  try {
    let assigned = 0;
    
    keywordIds.forEach(function(keywordId) {
      try {
        GW_query({
          action: 'insert',
          sql: 'INSERT IGNORE INTO keyword_locations (keyword_id, location_id, assigned_at) VALUES (?, ?, NOW())',
          params: [keywordId, locationId]
        });
        assigned++;
      } catch (e) {
        // Skip errors
      }
    });
    
    return { ok: true, assigned: assigned };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get location summary stats
 */
function DB_getLocationStats(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT l.id, l.name, l.country_code,
            COUNT(DISTINCT kl.keyword_id) as total_keywords,
            AVG(k.current_rank) as avg_rank,
            SUM(CASE WHEN k.current_rank <= 10 THEN 1 ELSE 0 END) as top_10,
            SUM(CASE WHEN k.current_rank <= 3 THEN 1 ELSE 0 END) as top_3
            FROM locations l
            LEFT JOIN keyword_locations kl ON l.id = kl.location_id
            LEFT JOIN keywords k ON kl.keyword_id = k.id
            WHERE l.project_id = ?
            GROUP BY l.id, l.name, l.country_code
            ORDER BY l.name`,
      params: [projectId]
    });
    
    return { ok: true, stats: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

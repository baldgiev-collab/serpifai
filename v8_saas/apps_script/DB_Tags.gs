/**
 * DB_Tags.gs - Tag and Label Management
 * SerpifAI V8 - Keyword and project tagging
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// TAG MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get all tags for project
 */
function DB_getTags(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: 'SELECT DISTINCT tag_name, tag_color, COUNT(*) as count FROM keyword_tags WHERE project_id = ? GROUP BY tag_name, tag_color ORDER BY count DESC',
      params: [projectId]
    });
    
    return {
      ok: true,
      tags: result.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Create new tag
 */
function DB_createTag(params) {
  const projectId = params.projectId;
  const tagName = params.name;
  const tagColor = params.color || '#808080';
  
  if (!projectId || !tagName) {
    return { ok: false, error: 'Project ID and tag name required' };
  }
  
  try {
    const result = GW_query({
      action: 'insert',
      sql: 'INSERT INTO tags (project_id, name, color, created_at) VALUES (?, ?, ?, NOW())',
      params: [projectId, tagName, tagColor]
    });
    
    return {
      ok: true,
      tagId: result.insertId,
      name: tagName,
      color: tagColor
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Delete tag
 */
function DB_deleteTag(params) {
  const tagId = params.tagId;
  const projectId = params.projectId;
  const tagName = params.name;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    // Delete by ID or name
    let sql, sqlParams;
    if (tagId) {
      sql = 'DELETE FROM tags WHERE id = ? AND project_id = ?';
      sqlParams = [tagId, projectId];
    } else if (tagName) {
      sql = 'DELETE FROM tags WHERE name = ? AND project_id = ?';
      sqlParams = [tagName, projectId];
    } else {
      return { ok: false, error: 'Tag ID or name required' };
    }
    
    // Also remove from keyword associations
    GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_tags WHERE tag_name = ? AND project_id = ?',
      params: [tagName || '', projectId]
    });
    
    const result = GW_query({
      action: 'delete',
      sql: sql,
      params: sqlParams
    });
    
    return {
      ok: true,
      deleted: result.affectedRows > 0
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Add tag to keyword
 */
function DB_addTagToKeyword(params) {
  const keywordId = params.keywordId;
  const tagName = params.tagName;
  const projectId = params.projectId;
  
  if (!keywordId || !tagName || !projectId) {
    return { ok: false, error: 'Keyword ID, tag name, and project ID required' };
  }
  
  try {
    // Get tag color
    const tagResult = GW_query({
      action: 'select',
      sql: 'SELECT color FROM tags WHERE name = ? AND project_id = ?',
      params: [tagName, projectId]
    });
    
    const color = tagResult.rows && tagResult.rows[0] ? tagResult.rows[0].color : '#808080';
    
    // Insert association
    GW_query({
      action: 'insert',
      sql: 'INSERT IGNORE INTO keyword_tags (keyword_id, tag_name, tag_color, project_id, added_at) VALUES (?, ?, ?, ?, NOW())',
      params: [keywordId, tagName, color, projectId]
    });
    
    return {
      ok: true,
      keywordId: keywordId,
      tagName: tagName
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Remove tag from keyword
 */
function DB_removeTagFromKeyword(params) {
  const keywordId = params.keywordId;
  const tagName = params.tagName;
  
  if (!keywordId || !tagName) {
    return { ok: false, error: 'Keyword ID and tag name required' };
  }
  
  try {
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_tags WHERE keyword_id = ? AND tag_name = ?',
      params: [keywordId, tagName]
    });
    
    return {
      ok: true,
      removed: result.affectedRows > 0
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get tags for keyword
 */
function DB_getKeywordTags(params) {
  const keywordId = params.keywordId;
  
  if (!keywordId) {
    return { ok: false, error: 'Keyword ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: 'SELECT tag_name, tag_color FROM keyword_tags WHERE keyword_id = ?',
      params: [keywordId]
    });
    
    return {
      ok: true,
      tags: result.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get keywords by tag
 */
function DB_getKeywordsByTag(params) {
  const projectId = params.projectId;
  const tagName = params.tagName;
  
  if (!projectId || !tagName) {
    return { ok: false, error: 'Project ID and tag name required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT k.* FROM keywords k 
            INNER JOIN keyword_tags kt ON k.id = kt.keyword_id 
            WHERE kt.project_id = ? AND kt.tag_name = ?`,
      params: [projectId, tagName]
    });
    
    return {
      ok: true,
      keywords: result.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Bulk tag keywords
 */
function DB_bulkTagKeywords(params) {
  const keywordIds = params.keywordIds || [];
  const tagName = params.tagName;
  const projectId = params.projectId;
  
  if (keywordIds.length === 0 || !tagName || !projectId) {
    return { ok: false, error: 'Keyword IDs, tag name, and project ID required' };
  }
  
  try {
    // Get tag color
    const tagResult = GW_query({
      action: 'select',
      sql: 'SELECT color FROM tags WHERE name = ? AND project_id = ?',
      params: [tagName, projectId]
    });
    
    const color = tagResult.rows && tagResult.rows[0] ? tagResult.rows[0].color : '#808080';
    
    let tagged = 0;
    keywordIds.forEach(function(keywordId) {
      try {
        GW_query({
          action: 'insert',
          sql: 'INSERT IGNORE INTO keyword_tags (keyword_id, tag_name, tag_color, project_id, added_at) VALUES (?, ?, ?, ?, NOW())',
          params: [keywordId, tagName, color, projectId]
        });
        tagged++;
      } catch (e) {
        // Skip duplicates
      }
    });
    
    return {
      ok: true,
      tagged: tagged,
      tagName: tagName
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Auto-tag keywords by pattern
 */
function DB_autoTagKeywords(params) {
  const projectId = params.projectId;
  const pattern = params.pattern;
  const tagName = params.tagName;
  const matchType = params.matchType || 'contains'; // 'contains', 'starts', 'ends', 'regex'
  
  if (!projectId || !pattern || !tagName) {
    return { ok: false, error: 'Project ID, pattern, and tag name required' };
  }
  
  try {
    // Build WHERE clause based on match type
    let whereClause;
    let patternParam;
    
    switch (matchType) {
      case 'starts':
        whereClause = 'keyword LIKE ?';
        patternParam = pattern + '%';
        break;
      case 'ends':
        whereClause = 'keyword LIKE ?';
        patternParam = '%' + pattern;
        break;
      case 'regex':
        whereClause = 'keyword REGEXP ?';
        patternParam = pattern;
        break;
      default: // contains
        whereClause = 'keyword LIKE ?';
        patternParam = '%' + pattern + '%';
    }
    
    // Find matching keywords
    const result = GW_query({
      action: 'select',
      sql: 'SELECT id FROM keywords WHERE project_id = ? AND ' + whereClause,
      params: [projectId, patternParam]
    });
    
    const keywordIds = (result.rows || []).map(function(r) { return r.id; });
    
    if (keywordIds.length === 0) {
      return { ok: true, tagged: 0, message: 'No matching keywords found' };
    }
    
    // Tag all matching
    return DB_bulkTagKeywords({
      keywordIds: keywordIds,
      tagName: tagName,
      projectId: projectId
    });
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Rename tag
 */
function DB_renameTag(params) {
  const projectId = params.projectId;
  const oldName = params.oldName;
  const newName = params.newName;
  
  if (!projectId || !oldName || !newName) {
    return { ok: false, error: 'Project ID, old name, and new name required' };
  }
  
  try {
    // Update in tags table
    GW_query({
      action: 'update',
      sql: 'UPDATE tags SET name = ? WHERE name = ? AND project_id = ?',
      params: [newName, oldName, projectId]
    });
    
    // Update in keyword_tags
    GW_query({
      action: 'update',
      sql: 'UPDATE keyword_tags SET tag_name = ? WHERE tag_name = ? AND project_id = ?',
      params: [newName, oldName, projectId]
    });
    
    return {
      ok: true,
      oldName: oldName,
      newName: newName
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Update tag color
 */
function DB_updateTagColor(params) {
  const projectId = params.projectId;
  const tagName = params.name;
  const newColor = params.color;
  
  if (!projectId || !tagName || !newColor) {
    return { ok: false, error: 'Project ID, tag name, and color required' };
  }
  
  try {
    GW_query({
      action: 'update',
      sql: 'UPDATE tags SET color = ? WHERE name = ? AND project_id = ?',
      params: [newColor, tagName, projectId]
    });
    
    GW_query({
      action: 'update',
      sql: 'UPDATE keyword_tags SET tag_color = ? WHERE tag_name = ? AND project_id = ?',
      params: [newColor, tagName, projectId]
    });
    
    return {
      ok: true,
      name: tagName,
      color: newColor
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

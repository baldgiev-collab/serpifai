/**
 * DB_Groups.gs - Keyword Group Management
 * SerpifAI V8 - Group keywords for organization
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// GROUP MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get all groups for project
 */
function DB_getGroups(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT g.*, 
            (SELECT COUNT(*) FROM keyword_groups kg WHERE kg.group_id = g.id) as keyword_count
            FROM groups g 
            WHERE g.project_id = ? 
            ORDER BY g.name`,
      params: [projectId]
    });
    
    return {
      ok: true,
      groups: result.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Create group
 */
function DB_createGroup(params) {
  const projectId = params.projectId;
  const name = params.name;
  const description = params.description || '';
  const parentId = params.parentId || null;
  
  if (!projectId || !name) {
    return { ok: false, error: 'Project ID and group name required' };
  }
  
  try {
    const result = GW_query({
      action: 'insert',
      sql: 'INSERT INTO groups (project_id, name, description, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      params: [projectId, name, description, parentId]
    });
    
    return {
      ok: true,
      groupId: result.insertId,
      name: name
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Update group
 */
function DB_updateGroup(params) {
  const groupId = params.groupId;
  const name = params.name;
  const description = params.description;
  
  if (!groupId) {
    return { ok: false, error: 'Group ID required' };
  }
  
  try {
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (updates.length === 0) {
      return { ok: false, error: 'No fields to update' };
    }
    
    values.push(groupId);
    
    GW_query({
      action: 'update',
      sql: 'UPDATE groups SET ' + updates.join(', ') + ' WHERE id = ?',
      params: values
    });
    
    return {
      ok: true,
      groupId: groupId
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Delete group
 */
function DB_deleteGroup(params) {
  const groupId = params.groupId;
  const deleteKeywords = params.deleteKeywords || false;
  
  if (!groupId) {
    return { ok: false, error: 'Group ID required' };
  }
  
  try {
    // Remove keyword associations
    GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_groups WHERE group_id = ?',
      params: [groupId]
    });
    
    // Delete group
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM groups WHERE id = ?',
      params: [groupId]
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
 * Add keyword to group
 */
function DB_addKeywordToGroup(params) {
  const keywordId = params.keywordId;
  const groupId = params.groupId;
  
  if (!keywordId || !groupId) {
    return { ok: false, error: 'Keyword ID and group ID required' };
  }
  
  try {
    GW_query({
      action: 'insert',
      sql: 'INSERT IGNORE INTO keyword_groups (keyword_id, group_id, added_at) VALUES (?, ?, NOW())',
      params: [keywordId, groupId]
    });
    
    return {
      ok: true,
      keywordId: keywordId,
      groupId: groupId
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Remove keyword from group
 */
function DB_removeKeywordFromGroup(params) {
  const keywordId = params.keywordId;
  const groupId = params.groupId;
  
  if (!keywordId || !groupId) {
    return { ok: false, error: 'Keyword ID and group ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'delete',
      sql: 'DELETE FROM keyword_groups WHERE keyword_id = ? AND group_id = ?',
      params: [keywordId, groupId]
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
 * Get keywords in group
 */
function DB_getGroupKeywords(params) {
  const groupId = params.groupId;
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  
  if (!groupId) {
    return { ok: false, error: 'Group ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT k.* FROM keywords k 
            INNER JOIN keyword_groups kg ON k.id = kg.keyword_id 
            WHERE kg.group_id = ? 
            ORDER BY k.keyword 
            LIMIT ? OFFSET ?`,
      params: [groupId, limit, offset]
    });
    
    // Get total count
    const countResult = GW_query({
      action: 'select',
      sql: 'SELECT COUNT(*) as total FROM keyword_groups WHERE group_id = ?',
      params: [groupId]
    });
    
    return {
      ok: true,
      keywords: result.rows || [],
      total: countResult.rows && countResult.rows[0] ? countResult.rows[0].total : 0,
      page: page,
      limit: limit
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Bulk add keywords to group
 */
function DB_bulkAddToGroup(params) {
  const keywordIds = params.keywordIds || [];
  const groupId = params.groupId;
  
  if (keywordIds.length === 0 || !groupId) {
    return { ok: false, error: 'Keyword IDs and group ID required' };
  }
  
  try {
    let added = 0;
    
    keywordIds.forEach(function(keywordId) {
      try {
        GW_query({
          action: 'insert',
          sql: 'INSERT IGNORE INTO keyword_groups (keyword_id, group_id, added_at) VALUES (?, ?, NOW())',
          params: [keywordId, groupId]
        });
        added++;
      } catch (e) {
        // Skip errors
      }
    });
    
    return {
      ok: true,
      added: added,
      groupId: groupId
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Move keyword to different group
 */
function DB_moveKeywordToGroup(params) {
  const keywordId = params.keywordId;
  const fromGroupId = params.fromGroupId;
  const toGroupId = params.toGroupId;
  
  if (!keywordId || !toGroupId) {
    return { ok: false, error: 'Keyword ID and target group ID required' };
  }
  
  try {
    // Remove from old group if specified
    if (fromGroupId) {
      GW_query({
        action: 'delete',
        sql: 'DELETE FROM keyword_groups WHERE keyword_id = ? AND group_id = ?',
        params: [keywordId, fromGroupId]
      });
    }
    
    // Add to new group
    GW_query({
      action: 'insert',
      sql: 'INSERT IGNORE INTO keyword_groups (keyword_id, group_id, added_at) VALUES (?, ?, NOW())',
      params: [keywordId, toGroupId]
    });
    
    return {
      ok: true,
      keywordId: keywordId,
      toGroupId: toGroupId
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get group hierarchy
 */
function DB_getGroupHierarchy(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT g.*, 
            (SELECT COUNT(*) FROM keyword_groups kg WHERE kg.group_id = g.id) as keyword_count
            FROM groups g 
            WHERE g.project_id = ? 
            ORDER BY g.parent_id, g.name`,
      params: [projectId]
    });
    
    const groups = result.rows || [];
    
    // Build tree structure
    const tree = buildGroupTree(groups);
    
    return {
      ok: true,
      groups: groups,
      tree: tree
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Build group tree from flat list
 */
function buildGroupTree(groups) {
  const groupMap = {};
  const roots = [];
  
  // Create map
  groups.forEach(function(g) {
    g.children = [];
    groupMap[g.id] = g;
  });
  
  // Build tree
  groups.forEach(function(g) {
    if (g.parent_id && groupMap[g.parent_id]) {
      groupMap[g.parent_id].children.push(g);
    } else {
      roots.push(g);
    }
  });
  
  return roots;
}

/**
 * Get ungrouped keywords
 */
function DB_getUngroupedKeywords(params) {
  const projectId = params.projectId;
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT k.* FROM keywords k 
            LEFT JOIN keyword_groups kg ON k.id = kg.keyword_id 
            WHERE k.project_id = ? AND kg.keyword_id IS NULL 
            ORDER BY k.keyword 
            LIMIT ? OFFSET ?`,
      params: [projectId, limit, offset]
    });
    
    // Get total count
    const countResult = GW_query({
      action: 'select',
      sql: `SELECT COUNT(*) as total FROM keywords k 
            LEFT JOIN keyword_groups kg ON k.id = kg.keyword_id 
            WHERE k.project_id = ? AND kg.keyword_id IS NULL`,
      params: [projectId]
    });
    
    return {
      ok: true,
      keywords: result.rows || [],
      total: countResult.rows && countResult.rows[0] ? countResult.rows[0].total : 0,
      page: page,
      limit: limit
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Auto-group keywords by pattern
 */
function DB_autoGroupKeywords(params) {
  const projectId = params.projectId;
  const groupingType = params.type || 'prefix'; // 'prefix', 'suffix', 'word'
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    // Get all keywords
    const result = GW_query({
      action: 'select',
      sql: 'SELECT id, keyword FROM keywords WHERE project_id = ?',
      params: [projectId]
    });
    
    const keywords = result.rows || [];
    const groups = {};
    
    // Group by pattern
    keywords.forEach(function(k) {
      let groupName;
      const words = k.keyword.split(' ');
      
      switch (groupingType) {
        case 'prefix':
          groupName = words[0] || 'Other';
          break;
        case 'suffix':
          groupName = words[words.length - 1] || 'Other';
          break;
        case 'word':
          groupName = words.length > 1 ? words[1] : words[0] || 'Other';
          break;
        default:
          groupName = 'Other';
      }
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(k.id);
    });
    
    // Create groups and assign keywords
    let createdGroups = 0;
    let assignedKeywords = 0;
    
    for (const groupName in groups) {
      if (groups[groupName].length > 1) { // Only create groups with 2+ keywords
        const groupResult = DB_createGroup({
          projectId: projectId,
          name: groupName,
          description: 'Auto-generated by ' + groupingType + ' grouping'
        });
        
        if (groupResult.ok) {
          createdGroups++;
          
          const bulkResult = DB_bulkAddToGroup({
            keywordIds: groups[groupName],
            groupId: groupResult.groupId
          });
          
          if (bulkResult.ok) {
            assignedKeywords += bulkResult.added;
          }
        }
      }
    }
    
    return {
      ok: true,
      groupsCreated: createdGroups,
      keywordsAssigned: assignedKeywords
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

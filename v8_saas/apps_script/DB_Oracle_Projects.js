/**
 * DB_Oracle_Projects.gs - Project-specific Oracle Operations
 * SerpifAI V8 - Project and workflow data persistence to MySQL
 * 
 * Based on V7's Oracle database operations
 */

/**
 * Table names
 */
var ORACLE_TABLES = {
  PROJECTS: 'serpifai_projects',
  COMPETITORS: 'serpifai_competitors',
  KEYWORDS: 'serpifai_keywords',
  WORKFLOW: 'serpifai_workflow',
  ANALYSIS: 'serpifai_analysis',
  USERS: 'serpifai_users',
  SESSIONS: 'serpifai_sessions'
};

/**
 * Save project to Oracle/MySQL
 * @param {object} project - Project data
 * @return {object} Save result
 */
function ORACLE_saveProject(project) {
  try {
    const row = {
      project_id: project.projectId,
      name: project.name,
      domain: project.domain || '',
      niche: project.niche || '',
      brand_name: project.brandName || '',
      status: project.status || 'active',
      data_json: JSON.stringify(project),
      created_at: project.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return JDBC_upsert(ORACLE_TABLES.PROJECTS, row, 'project_id');
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_saveProject');
  }
}

/**
 * Load project from Oracle/MySQL
 * @param {string} projectId - Project ID
 * @return {object} Project data
 */
function ORACLE_loadProject(projectId) {
  try {
    const sql = 'SELECT * FROM ' + ORACLE_TABLES.PROJECTS + ' WHERE project_id = ?';
    const result = JDBC_query(sql, [projectId]);
    
    if (!result.ok) {
      return result;
    }
    
    if (result.rows.length === 0) {
      return { ok: false, error: 'Project not found' };
    }
    
    const row = result.rows[0];
    let project;
    
    try {
      project = JSON.parse(row.data_json);
    } catch (e) {
      project = {
        projectId: row.project_id,
        name: row.name,
        domain: row.domain,
        niche: row.niche,
        brandName: row.brand_name,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
    
    return { ok: true, project: project };
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_loadProject');
  }
}

/**
 * List projects from Oracle/MySQL
 * @param {object} filters - Optional filters
 * @return {object} Projects list
 */
function ORACLE_listProjects(filters) {
  try {
    filters = filters || {};
    
    let sql = 'SELECT project_id, name, domain, status, created_at, updated_at FROM ' + 
              ORACLE_TABLES.PROJECTS;
    const params = [];
    
    if (filters.status) {
      sql += ' WHERE status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY updated_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const result = JDBC_query(sql, params);
    
    if (!result.ok) {
      return result;
    }
    
    return {
      ok: true,
      projects: result.rows.map(row => ({
        projectId: row.project_id,
        name: row.name,
        domain: row.domain,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      count: result.rows.length
    };
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_listProjects');
  }
}

/**
 * Delete project from Oracle/MySQL
 * @param {string} projectId - Project ID
 * @return {object} Delete result
 */
function ORACLE_deleteProject(projectId) {
  try {
    // Delete related data first
    JDBC_delete(ORACLE_TABLES.COMPETITORS, { project_id: projectId });
    JDBC_delete(ORACLE_TABLES.KEYWORDS, { project_id: projectId });
    JDBC_delete(ORACLE_TABLES.WORKFLOW, { project_id: projectId });
    JDBC_delete(ORACLE_TABLES.ANALYSIS, { project_id: projectId });
    
    // Delete project
    return JDBC_delete(ORACLE_TABLES.PROJECTS, { project_id: projectId });
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_deleteProject');
  }
}

/**
 * Save competitors to Oracle/MySQL
 * @param {string} projectId - Project ID
 * @param {Array} competitors - Competitor domains
 * @return {object} Save result
 */
function ORACLE_saveCompetitors(projectId, competitors) {
  try {
    const rows = competitors.map((comp, idx) => ({
      project_id: projectId,
      competitor_domain: typeof comp === 'string' ? comp : comp.domain,
      position: idx + 1,
      data_json: typeof comp === 'object' ? JSON.stringify(comp) : '{}',
      created_at: new Date().toISOString()
    }));
    
    // Delete existing
    JDBC_delete(ORACLE_TABLES.COMPETITORS, { project_id: projectId });
    
    // Insert new
    return JDBC_batchInsert(ORACLE_TABLES.COMPETITORS, rows);
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_saveCompetitors');
  }
}

/**
 * Save keywords to Oracle/MySQL
 * @param {string} projectId - Project ID
 * @param {Array} keywords - Keywords
 * @return {object} Save result
 */
function ORACLE_saveKeywords(projectId, keywords) {
  try {
    const rows = keywords.map((kw, idx) => ({
      project_id: projectId,
      keyword: typeof kw === 'string' ? kw : kw.keyword,
      position: idx + 1,
      search_volume: kw.searchVolume || null,
      difficulty: kw.difficulty || null,
      intent: kw.intent || null,
      data_json: typeof kw === 'object' ? JSON.stringify(kw) : '{}',
      created_at: new Date().toISOString()
    }));
    
    // Delete existing
    JDBC_delete(ORACLE_TABLES.KEYWORDS, { project_id: projectId });
    
    // Insert new
    return JDBC_batchInsert(ORACLE_TABLES.KEYWORDS, rows);
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_saveKeywords');
  }
}

/**
 * Save workflow state to Oracle/MySQL
 * @param {string} projectId - Project ID
 * @param {number} stage - Stage number
 * @param {object} data - Stage data
 * @return {object} Save result
 */
function ORACLE_saveWorkflowStage(projectId, stage, data) {
  try {
    const row = {
      project_id: projectId,
      stage: stage,
      status: 'completed',
      data_json: JSON.stringify(data),
      completed_at: new Date().toISOString()
    };
    
    return JDBC_upsert(ORACLE_TABLES.WORKFLOW, row, 'project_id');
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_saveWorkflowStage');
  }
}

/**
 * Save competitor analysis to Oracle/MySQL
 * @param {string} projectId - Project ID
 * @param {object} analysis - Analysis data
 * @return {object} Save result
 */
function ORACLE_saveAnalysis(projectId, analysis) {
  try {
    const row = {
      project_id: projectId,
      analysis_type: analysis.type || 'competitor',
      data_json: JSON.stringify(analysis),
      created_at: new Date().toISOString()
    };
    
    return JDBC_insert(ORACLE_TABLES.ANALYSIS, row);
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_saveAnalysis');
  }
}

/**
 * Load competitor analysis from Oracle/MySQL
 * @param {string} projectId - Project ID
 * @return {object} Analysis data
 */
function ORACLE_loadAnalysis(projectId) {
  try {
    const sql = 'SELECT * FROM ' + ORACLE_TABLES.ANALYSIS + 
                ' WHERE project_id = ? ORDER BY created_at DESC LIMIT 1';
    
    const result = JDBC_query(sql, [projectId]);
    
    if (!result.ok || result.rows.length === 0) {
      return { ok: false, error: 'Analysis not found' };
    }
    
    const row = result.rows[0];
    
    return {
      ok: true,
      analysis: JSON.parse(row.data_json)
    };
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_loadAnalysis');
  }
}

/**
 * Initialize Oracle/MySQL tables
 * @return {object} Init result
 */
function ORACLE_initTables() {
  try {
    const tables = {
      [ORACLE_TABLES.PROJECTS]: {
        'project_id': 'VARCHAR(64) PRIMARY KEY',
        'name': 'VARCHAR(255)',
        'domain': 'VARCHAR(255)',
        'niche': 'VARCHAR(255)',
        'brand_name': 'VARCHAR(255)',
        'status': 'VARCHAR(32) DEFAULT "active"',
        'data_json': 'LONGTEXT',
        'created_at': 'DATETIME',
        'updated_at': 'DATETIME'
      },
      [ORACLE_TABLES.COMPETITORS]: {
        'id': 'INT AUTO_INCREMENT PRIMARY KEY',
        'project_id': 'VARCHAR(64)',
        'competitor_domain': 'VARCHAR(255)',
        'position': 'INT',
        'data_json': 'TEXT',
        'created_at': 'DATETIME'
      },
      [ORACLE_TABLES.KEYWORDS]: {
        'id': 'INT AUTO_INCREMENT PRIMARY KEY',
        'project_id': 'VARCHAR(64)',
        'keyword': 'VARCHAR(255)',
        'position': 'INT',
        'search_volume': 'INT',
        'difficulty': 'VARCHAR(32)',
        'intent': 'VARCHAR(32)',
        'data_json': 'TEXT',
        'created_at': 'DATETIME'
      },
      [ORACLE_TABLES.WORKFLOW]: {
        'id': 'INT AUTO_INCREMENT PRIMARY KEY',
        'project_id': 'VARCHAR(64)',
        'stage': 'INT',
        'status': 'VARCHAR(32)',
        'data_json': 'LONGTEXT',
        'completed_at': 'DATETIME'
      },
      [ORACLE_TABLES.ANALYSIS]: {
        'id': 'INT AUTO_INCREMENT PRIMARY KEY',
        'project_id': 'VARCHAR(64)',
        'analysis_type': 'VARCHAR(64)',
        'data_json': 'LONGTEXT',
        'created_at': 'DATETIME'
      }
    };
    
    const results = [];
    
    for (const [tableName, schema] of Object.entries(tables)) {
      const result = JDBC_createTable(tableName, schema);
      results.push({ table: tableName, ok: result.ok });
    }
    
    return {
      ok: results.every(r => r.ok),
      results: results
    };
    
  } catch (err) {
    return CORE_handleError(err, 'ORACLE_initTables');
  }
}

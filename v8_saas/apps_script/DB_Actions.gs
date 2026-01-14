/**
 * DB_Actions.gs - DataBridge Action Handlers
 * SerpifAI V8 - Core database action handlers
 * 
 * Based on V7's DB_Router action handlers
 */

/**
 * Main DataBridge action handler
 * @param {string} action - Action name
 * @param {object} payload - Action payload
 * @return {object} Action result
 */
function DB_handleAction(action, payload) {
  payload = payload || {};
  
  LOG_debug('DB_handleAction', { action: action });
  
  // Parse action prefix
  const parts = action.split(':');
  const prefix = parts[0];
  const subAction = parts.slice(1).join(':');
  
  switch (prefix) {
    case 'project':
      return DB_handleProjectAction(subAction, payload);
      
    case 'workflow':
    case 'wf':
      return DB_WF_handleRoute(action, payload);
      
    case 'comp':
    case 'competitor':
      return DB_COMP_handleRoute(action, payload);
      
    case 'keyword':
    case 'kw':
      return DB_handleKeywordAction(subAction, payload);
      
    case 'cache':
      return DB_handleCacheAction(subAction, payload);
      
    case 'session':
      return DB_handleSessionAction(subAction, payload);
      
    case 'oracle':
    case 'mysql':
    case 'db':
      return DB_handleDatabaseAction(subAction, payload);
      
    case 'qa':
      return DB_handleQAAction(subAction, payload);
      
    case 'content':
      return DB_handleContentAction(subAction, payload);
      
    default:
      return { ok: false, error: 'Unknown action prefix: ' + prefix };
  }
}

/**
 * Handle project-related actions
 */
function DB_handleProjectAction(action, payload) {
  switch (action) {
    case 'create':
      return DB_PM_createProject(payload);
    case 'load':
    case 'get':
      return DB_PM_loadProject(payload);
    case 'save':
    case 'update':
      return DB_PM_saveProject(payload);
    case 'delete':
      return DB_PM_deleteProject(payload);
    case 'list':
      return DB_PM_listProjects(payload);
    default:
      return { ok: false, error: 'Unknown project action: ' + action };
  }
}

/**
 * Handle keyword-related actions
 */
function DB_handleKeywordAction(action, payload) {
  switch (action) {
    case 'add':
      return DB_addKeywords(payload);
    case 'get':
    case 'list':
      return DB_getKeywords(payload);
    case 'delete':
    case 'remove':
      return DB_removeKeywords(payload);
    case 'analyze':
      return DB_analyzeKeywords(payload);
    default:
      return { ok: false, error: 'Unknown keyword action: ' + action };
  }
}

/**
 * Handle cache-related actions
 */
function DB_handleCacheAction(action, payload) {
  switch (action) {
    case 'get':
      return DB_cacheGet(payload.key);
    case 'set':
      return DB_cacheSet(payload.key, payload.value, payload.ttl);
    case 'delete':
    case 'remove':
      return DB_cacheDelete(payload.key);
    case 'clear':
      return DB_cacheClear(payload);
    default:
      return { ok: false, error: 'Unknown cache action: ' + action };
  }
}

/**
 * Handle session-related actions
 */
function DB_handleSessionAction(action, payload) {
  switch (action) {
    case 'get':
    case 'load':
      return DB_getSession(payload);
    case 'set':
    case 'save':
      return DB_setSession(payload);
    case 'clear':
      return DB_clearSession(payload);
    default:
      return { ok: false, error: 'Unknown session action: ' + action };
  }
}

/**
 * Handle database-related actions
 */
function DB_handleDatabaseAction(action, payload) {
  switch (action) {
    case 'query':
      return JDBC_query(payload.sql, payload.params);
    case 'execute':
      return JDBC_execute(payload.sql, payload.params);
    case 'insert':
      return JDBC_insert(payload.table, payload.data);
    case 'update':
      return JDBC_update(payload.table, payload.data, payload.where);
    case 'upsert':
      return JDBC_upsert(payload.table, payload.data, payload.key);
    case 'delete':
      return JDBC_delete(payload.table, payload.where);
    case 'test':
      return JDBC_testConnection();
    case 'init':
      return ORACLE_initTables();
    default:
      return { ok: false, error: 'Unknown database action: ' + action };
  }
}

/**
 * Handle QA-related actions
 */
function DB_handleQAAction(action, payload) {
  switch (action) {
    case 'check':
      return DB_QA_runChecks(payload);
    case 'validate':
      return DB_QA_validateContent(payload);
    default:
      return { ok: false, error: 'Unknown QA action: ' + action };
  }
}

/**
 * Handle content-related actions
 */
function DB_handleContentAction(action, payload) {
  switch (action) {
    case 'generate':
      return DB_generateContent(payload);
    case 'optimize':
      return DB_optimizeContent(payload);
    case 'save':
      return DB_saveContent(payload);
    case 'load':
      return DB_loadContent(payload);
    default:
      return { ok: false, error: 'Unknown content action: ' + action };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// KEYWORD HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════════

function DB_addKeywords(payload) {
  const projectId = payload.projectId;
  const keywords = payload.keywords || [];
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  const projectResult = DB_PM_loadProject({ projectId: projectId });
  if (!projectResult.ok) return projectResult;
  
  const project = projectResult.project;
  const existing = project.keywords || [];
  const newKeywords = [...new Set([...existing, ...keywords])];
  
  project.keywords = newKeywords;
  return DB_PM_saveProject(project);
}

function DB_getKeywords(payload) {
  const projectId = payload.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  const projectResult = DB_PM_loadProject({ projectId: projectId });
  if (!projectResult.ok) return projectResult;
  
  return {
    ok: true,
    keywords: projectResult.project.keywords || []
  };
}

function DB_removeKeywords(payload) {
  const projectId = payload.projectId;
  const toRemove = payload.keywords || [];
  
  const projectResult = DB_PM_loadProject({ projectId: projectId });
  if (!projectResult.ok) return projectResult;
  
  const project = projectResult.project;
  project.keywords = (project.keywords || []).filter(kw => !toRemove.includes(kw));
  
  return DB_PM_saveProject(project);
}

function DB_analyzeKeywords(payload) {
  const keywords = payload.keywords || [];
  
  if (keywords.length === 0) {
    return { ok: false, error: 'Keywords required' };
  }
  
  const analyzed = keywords.map(kw => ({
    keyword: kw,
    wordCount: kw.split(' ').length,
    characterCount: kw.length,
    intent: WF1_classifyIntent(kw)
  }));
  
  return {
    ok: true,
    keywords: analyzed
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// QA HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════════

function DB_QA_runChecks(payload) {
  const checks = [];
  
  // Check project exists
  if (payload.projectId) {
    const projectResult = DB_PM_loadProject({ projectId: payload.projectId });
    checks.push({
      name: 'Project Exists',
      passed: projectResult.ok
    });
  }
  
  // Check API keys
  const apiStatus = FT_getApiStatus();
  checks.push({
    name: 'Serper API',
    passed: apiStatus.serper.configured
  });
  checks.push({
    name: 'Gemini API',
    passed: apiStatus.gemini.configured
  });
  
  return {
    ok: checks.every(c => c.passed),
    checks: checks
  };
}

function DB_QA_validateContent(payload) {
  const content = payload.content || '';
  
  const validations = {
    wordCount: content.split(/\s+/).length,
    hasTitle: !!payload.title,
    minLength: content.length >= 300,
    maxLength: content.length <= 50000
  };
  
  return {
    ok: validations.minLength && validations.maxLength,
    validations: validations
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════════

function DB_generateContent(payload) {
  if (typeof FT_callGemini !== 'function') {
    return { ok: false, error: 'AI not available' };
  }
  
  return FT_callGemini({
    prompt: payload.prompt || 'Write about ' + payload.topic,
    maxTokens: payload.maxTokens || 2000
  });
}

function DB_optimizeContent(payload) {
  // Placeholder for content optimization
  return {
    ok: true,
    optimized: payload.content,
    suggestions: []
  };
}

function DB_saveContent(payload) {
  const projectId = payload.projectId;
  const contentId = payload.contentId || 'content_' + Date.now();
  
  // Save to sheets or gateway
  return { ok: true, contentId: contentId };
}

function DB_loadContent(payload) {
  return { ok: false, error: 'Content not found' };
}

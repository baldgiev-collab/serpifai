/**
 * DB_Queue.gs - Background Queue Manager
 * SerpifAI V8 - Manages asynchronous task queuing
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

const QUEUE_KEY = 'TASK_QUEUE';
const PROCESSING_KEY = 'QUEUE_PROCESSING';

/**
 * Add task to queue
 */
function QUEUE_add(task) {
  const queue = QUEUE_getAll();
  
  const newTask = {
    id: Utilities.getUuid(),
    type: task.type,
    data: task.data,
    priority: task.priority || 'normal',
    status: 'pending',
    createdAt: Date.now(),
    attempts: 0,
    maxAttempts: task.maxAttempts || 3
  };
  
  queue.push(newTask);
  QUEUE_save(queue);
  
  return { ok: true, taskId: newTask.id };
}

/**
 * Add multiple tasks to queue
 */
function QUEUE_addBatch(tasks) {
  const queue = QUEUE_getAll();
  const ids = [];
  
  tasks.forEach(function(task) {
    const newTask = {
      id: Utilities.getUuid(),
      type: task.type,
      data: task.data,
      priority: task.priority || 'normal',
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: task.maxAttempts || 3
    };
    queue.push(newTask);
    ids.push(newTask.id);
  });
  
  QUEUE_save(queue);
  return { ok: true, taskIds: ids, count: ids.length };
}

/**
 * Get all queued tasks
 */
function QUEUE_getAll() {
  const props = PropertiesService.getScriptProperties();
  const data = props.getProperty(QUEUE_KEY);
  
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save queue
 */
function QUEUE_save(queue) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get pending tasks
 */
function QUEUE_getPending() {
  return QUEUE_getAll().filter(function(t) {
    return t.status === 'pending';
  });
}

/**
 * Get task by ID
 */
function QUEUE_getById(taskId) {
  const queue = QUEUE_getAll();
  return queue.find(function(t) { return t.id === taskId; });
}

/**
 * Update task status
 */
function QUEUE_updateStatus(taskId, status, result) {
  const queue = QUEUE_getAll();
  const task = queue.find(function(t) { return t.id === taskId; });
  
  if (task) {
    task.status = status;
    task.updatedAt = Date.now();
    if (result) task.result = result;
    if (status === 'processing') task.attempts++;
    QUEUE_save(queue);
    return { ok: true };
  }
  
  return { ok: false, error: 'Task not found' };
}

/**
 * Remove completed/failed tasks older than specified age
 */
function QUEUE_cleanup(maxAgeMs) {
  maxAgeMs = maxAgeMs || (24 * 60 * 60 * 1000); // Default 24 hours
  const cutoff = Date.now() - maxAgeMs;
  
  const queue = QUEUE_getAll();
  const filtered = queue.filter(function(t) {
    // Keep pending and processing tasks
    if (t.status === 'pending' || t.status === 'processing') return true;
    // Keep recent completed/failed tasks
    return (t.updatedAt || t.createdAt) > cutoff;
  });
  
  const removed = queue.length - filtered.length;
  QUEUE_save(filtered);
  
  return { ok: true, removed: removed };
}

/**
 * Clear entire queue
 */
function QUEUE_clear() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(QUEUE_KEY);
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// QUEUE PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Process next batch of tasks
 */
function QUEUE_processNext(batchSize) {
  batchSize = batchSize || 5;
  
  // Check if already processing
  const props = PropertiesService.getScriptProperties();
  const processing = props.getProperty(PROCESSING_KEY);
  
  if (processing) {
    const lockTime = parseInt(processing, 10);
    // If lock is older than 5 minutes, clear it
    if (Date.now() - lockTime < 5 * 60 * 1000) {
      return { ok: false, error: 'Queue already processing' };
    }
  }
  
  // Set processing lock
  props.setProperty(PROCESSING_KEY, Date.now().toString());
  
  try {
    const pending = QUEUE_getPending();
    const toProcess = sortByPriority(pending).slice(0, batchSize);
    
    const results = [];
    
    toProcess.forEach(function(task) {
      const result = processTask(task);
      results.push({ taskId: task.id, result: result });
    });
    
    return { ok: true, processed: results.length, results: results };
  } finally {
    // Clear processing lock
    props.deleteProperty(PROCESSING_KEY);
  }
}

/**
 * Sort tasks by priority
 */
function sortByPriority(tasks) {
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  
  return tasks.sort(function(a, b) {
    const pa = priorityOrder[a.priority] || 1;
    const pb = priorityOrder[b.priority] || 1;
    if (pa !== pb) return pa - pb;
    return a.createdAt - b.createdAt;
  });
}

/**
 * Process a single task
 */
function processTask(task) {
  QUEUE_updateStatus(task.id, 'processing');
  
  try {
    let result;
    
    switch (task.type) {
      case 'KEYWORD_RESEARCH':
        result = processKeywordTask(task.data);
        break;
        
      case 'COMPETITOR_ANALYSIS':
        result = processCompetitorTask(task.data);
        break;
        
      case 'FORENSIC_ANALYSIS':
        result = processForensicTask(task.data);
        break;
        
      case 'CONTENT_GENERATION':
        result = processContentTask(task.data);
        break;
        
      case 'SYNC':
        result = processSyncTask(task.data);
        break;
        
      default:
        result = { ok: false, error: 'Unknown task type: ' + task.type };
    }
    
    if (result.ok) {
      QUEUE_updateStatus(task.id, 'completed', result);
    } else if (task.attempts >= task.maxAttempts) {
      QUEUE_updateStatus(task.id, 'failed', result);
    } else {
      QUEUE_updateStatus(task.id, 'pending', result);
    }
    
    return result;
  } catch (err) {
    const errorResult = { ok: false, error: err.message };
    
    if (task.attempts >= task.maxAttempts) {
      QUEUE_updateStatus(task.id, 'failed', errorResult);
    } else {
      QUEUE_updateStatus(task.id, 'pending', errorResult);
    }
    
    return errorResult;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TASK PROCESSORS
// ═══════════════════════════════════════════════════════════════════════════════════

function processKeywordTask(data) {
  if (typeof FT_SERPER_search === 'function') {
    return FT_SERPER_search(data.keyword);
  }
  return { ok: false, error: 'FT_SERPER_search not available' };
}

function processCompetitorTask(data) {
  if (typeof DB_COMP_analyzeCompetitor === 'function') {
    return DB_COMP_analyzeCompetitor(data.url);
  }
  return { ok: false, error: 'DB_COMP_analyzeCompetitor not available' };
}

function processForensicTask(data) {
  if (typeof FT_FORENSIC_analyze === 'function') {
    return FT_FORENSIC_analyze(data);
  }
  return { ok: false, error: 'FT_FORENSIC_analyze not available' };
}

function processContentTask(data) {
  if (typeof AI_generateContent === 'function') {
    return AI_generateContent(data);
  }
  return { ok: false, error: 'AI_generateContent not available' };
}

function processSyncTask(data) {
  if (typeof GW_callGateway === 'function') {
    return GW_callGateway('sync', data);
  }
  return { ok: false, error: 'GW_callGateway not available' };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// QUEUE STATS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get queue statistics
 */
function QUEUE_getStats() {
  const queue = QUEUE_getAll();
  
  const stats = {
    total: queue.length,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    byType: {}
  };
  
  queue.forEach(function(task) {
    stats[task.status] = (stats[task.status] || 0) + 1;
    stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
  });
  
  return stats;
}

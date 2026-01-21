/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * UNIVERSAL PERSISTENCE PROVIDER - ORACLE ELITE v35.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Force 100% MySQL data persistence across the entire repository
 * TARGET SCHEMA: u187453795_SrpAIDataGate
 * 
 * INTERCEPTOR PATTERN:
 *   Every fetcher file MUST call UniversalPersistenceProvider.commit(dataObject)
 *   Job token is the primary key - auto-recovered if missing
 * 
 * TABLE MAPPING:
 *   - Content Scrapes → link_forensics
 *   - Keyword Lists → keyword_intelligence  
 *   - AI Insights → ai_analysis
 *   - Meta/Tech Data → competitor_results
 *   - Raw HTML → job_results (chunked)
 *   - Strategic Audit → job_results (STRATEGIC_AUDIT type)
 * 
 * @module UniversalPersistenceProvider
 * @version 35.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE TRACKER
// ═══════════════════════════════════════════════════════════════════════════════════════

const UPP_STATE = {
  currentJobToken: null,
  currentProjectId: null,
  persistedChunks: new Map(),
  totalBytesWritten: 0,
  lastWriteTimestamp: null,
  errors: [],
  retryQueue: []
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMMIT FUNCTION - CENTRAL ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * UNIVERSAL COMMIT - Routes data to appropriate MySQL table
 * Every fetcher MUST call this function
 * 
 * @param {Object} dataObject - Data to persist
 * @param {string} dataObject.type - Data type (content, keywords, ai, meta, raw, strategic)
 * @param {string} dataObject.domain - Competitor domain
 * @param {Object} dataObject.payload - Actual data to save
 * @param {string} [dataObject.jobToken] - Job token (auto-recovered if missing)
 * @param {string} [dataObject.competitorId] - Competitor ID
 * @returns {Object} Persistence result with status and bytes written
 */
function UPP_commit(dataObject) {
  console.log('[UPP] ═══════════════════════════════════════════════════════════════');
  console.log('[UPP] 💾 Universal Persistence Provider - Commit Request');
  console.log('[UPP] Type:', dataObject?.type || 'unknown');
  console.log('[UPP] Domain:', dataObject?.domain || 'unknown');
  console.log('[UPP] JobToken provided:', !!dataObject?.jobToken);
  console.log('[UPP] ═══════════════════════════════════════════════════════════════');
  
  const result = {
    success: false,
    jobToken: null,
    table: null,
    bytesWritten: 0,
    timestamp: new Date().toISOString(),
    error: null
  };
  
  try {
    // V7 FIX: Check for explicitly provided jobToken first
    const jobToken = UPP_ensureJobToken(dataObject.jobToken);
    if (!jobToken) {
      throw new Error('CRITICAL: Unable to resolve job token for persistence');
    }
    result.jobToken = jobToken;
    UPP_STATE.currentJobToken = jobToken;
    
    // Step 2: Route to appropriate table based on data type
    const routingResult = UPP_routeToTable(dataObject, jobToken);
    
    result.success = routingResult.success;
    result.table = routingResult.table;
    result.bytesWritten = routingResult.bytesWritten;
    
    // Step 3: Update global state
    UPP_STATE.totalBytesWritten += routingResult.bytesWritten;
    UPP_STATE.lastWriteTimestamp = result.timestamp;
    
    console.log(`[UPP] ✅ Committed ${formatBytes(result.bytesWritten)} to ${result.table}`);
    
  } catch (error) {
    console.error('[UPP] ❌ Commit failed:', error.message);
    result.error = error.message;
    UPP_STATE.errors.push({ timestamp: result.timestamp, error: error.message, data: dataObject });
    
    // Add to retry queue
    UPP_STATE.retryQueue.push(dataObject);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// JOB TOKEN RESOLUTION - SELF-HEALING RECOVERY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Ensure we have a valid job token - auto-recover if missing
 * Priority: Provided > Cache > ScriptProperties > MySQL job_registry
 * 
 * @param {string} [providedToken] - Token provided by caller
 * @returns {string|null} Valid job token or null
 */
function UPP_ensureJobToken(providedToken) {
  // Priority 1: Use provided token if valid
  if (providedToken && providedToken.length > 10) {
    console.log('[UPP] Using provided job token');
    return providedToken;
  }
  
  // Priority 2: Check current state
  if (UPP_STATE.currentJobToken) {
    console.log('[UPP] Using cached job token from state');
    return UPP_STATE.currentJobToken;
  }
  
  // Priority 3: Check ScriptProperties
  try {
    const props = PropertiesService.getScriptProperties();
    const cachedToken = props.getProperty('UPP_CURRENT_JOB_TOKEN');
    if (cachedToken) {
      console.log('[UPP] Recovered job token from ScriptProperties');
      UPP_STATE.currentJobToken = cachedToken;
      return cachedToken;
    }
  } catch (e) {
    console.log('[UPP] ScriptProperties check failed:', e.message);
  }
  
  // Priority 4: Query MySQL for latest active job
  try {
    const recoveredToken = UPP_recoverTokenFromMySQL();
    if (recoveredToken) {
      console.log('[UPP] Recovered job token from MySQL job_registry');
      UPP_STATE.currentJobToken = recoveredToken;
      
      // Cache for future use
      try {
        PropertiesService.getScriptProperties().setProperty('UPP_CURRENT_JOB_TOKEN', recoveredToken);
      } catch (e) {}
      
      return recoveredToken;
    }
  } catch (e) {
    console.log('[UPP] MySQL recovery failed:', e.message);
  }
  
  console.error('[UPP] ❌ CRITICAL: No job token available');
  return null;
}

/**
 * Query MySQL job_registry for the most recent active job token
 * @returns {string|null} Job token or null
 */
function UPP_recoverTokenFromMySQL() {
  if (typeof callGateway !== 'function') {
    console.log('[UPP] Gateway not available for MySQL recovery');
    return null;
  }
  
  const response = callGateway('job_recover_latest', {});
  
  if (response && response.success && response.job_token) {
    return response.job_token;
  }
  
  return null;
}

/**
 * Set the current job token for all subsequent operations
 * Called by orchestrator at job start
 * 
 * @param {string} jobToken - The job token to use
 * @param {string} [projectId] - Associated project ID
 */
function UPP_setJobToken(jobToken, projectId) {
  console.log(`[UPP] Setting job token: ${jobToken}`);
  UPP_STATE.currentJobToken = jobToken;
  UPP_STATE.currentProjectId = projectId || null;
  
  // Persist to ScriptProperties
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('UPP_CURRENT_JOB_TOKEN', jobToken);
    if (projectId) {
      props.setProperty('UPP_CURRENT_PROJECT_ID', projectId);
    }
  } catch (e) {
    console.log('[UPP] Failed to cache job token:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TABLE ROUTING LOGIC
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Route data to appropriate MySQL table based on type
 * 
 * @param {Object} dataObject - Data to persist
 * @param {string} jobToken - Valid job token
 * @returns {Object} Routing result
 */
function UPP_routeToTable(dataObject, jobToken) {
  const type = (dataObject.type || '').toLowerCase();
  const domain = dataObject.domain || 'unknown';
  const competitorId = dataObject.competitorId || 'comp_' + md5Hash(jobToken + domain);
  const payload = dataObject.payload || dataObject;
  
  let result = { success: false, table: null, bytesWritten: 0 };
  
  switch (type) {
    case 'content':
    case 'scrape':
    case 'html':
    case 'link_forensics':
      result = UPP_saveToLinkForensics(jobToken, domain, competitorId, payload);
      break;
      
    case 'keywords':
    case 'keyword':
    case 'keyword_intelligence':
      result = UPP_saveToKeywordIntelligence(jobToken, domain, competitorId, payload);
      break;
      
    case 'ai':
    case 'gemini':
    case 'ai_analysis':
    case 'insights':
      result = UPP_saveToAiAnalysis(jobToken, domain, competitorId, payload);
      break;
      
    case 'meta':
    case 'technical':
    case 'competitor_results':
      result = UPP_saveToCompetitorResults(jobToken, domain, competitorId, payload);
      break;
      
    case 'raw':
    case 'raw_fetch':
    case 'job_results':
      result = UPP_saveToJobResults(jobToken, domain, competitorId, 'RAW_FETCH', payload);
      break;
      
    case 'strategic':
    case 'strategic_audit':
      result = UPP_saveToJobResults(jobToken, domain, competitorId, 'STRATEGIC_AUDIT', payload);
      break;
      
    case 'final':
    case 'complete':
      result = UPP_saveToJobResults(jobToken, domain, competitorId, 'FINAL', payload);
      break;
    
    case 'workflow_stage':
    case 'stage_result':
      result = UPP_saveWorkflowStage(jobToken, domain, competitorId, payload);
      break;
      
    default:
      // Default: Save to job_results as MISC type
      console.log(`[UPP] Unknown type "${type}", routing to job_results as MISC`);
      result = UPP_saveToJobResults(jobToken, domain, competitorId, 'MISC', payload);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TABLE-SPECIFIC PERSISTENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Save content scrapes to link_forensics table
 */
function UPP_saveToLinkForensics(jobToken, domain, competitorId, payload) {
  console.log(`[UPP] Saving to link_forensics: ${domain}`);
  
  const dataJson = JSON.stringify(payload);
  const dataSize = dataJson.length;
  
  const response = callGateway('upp_save_link_forensics', {
    job_token: jobToken,
    domain: domain,
    competitor_id: competitorId,
    url: payload.url || 'https://' + domain,
    title: payload.title || '',
    meta_description: payload.metaDescription || '',
    word_count: payload.wordCount || 0,
    headings_json: JSON.stringify(payload.headings || {}),
    links_json: JSON.stringify(payload.links || {}),
    schema_json: JSON.stringify(payload.schema || []),
    raw_html_snippet: (payload.rawHtml || '').substring(0, 10000),
    data_json: dataJson,
    data_size: dataSize
  });
  
  return {
    success: response?.success || false,
    table: 'link_forensics',
    bytesWritten: response?.success ? dataSize : 0
  };
}

/**
 * Save keyword data to keyword_intelligence table
 */
function UPP_saveToKeywordIntelligence(jobToken, domain, competitorId, payload) {
  console.log(`[UPP] Saving to keyword_intelligence: ${domain}`);
  
  const keywords = payload.keywords || payload.rankedKeywords || [];
  const dataJson = JSON.stringify(payload);
  const dataSize = dataJson.length;
  
  const response = callGateway('upp_save_keyword_intelligence', {
    job_token: jobToken,
    domain: domain,
    competitor_id: competitorId,
    total_keywords: keywords.length,
    top_10_count: payload.top10Count || 0,
    top_20_count: payload.top20Count || 0,
    visibility_score: payload.visibilityScore || 0,
    keywords_json: JSON.stringify(keywords.slice(0, 100)), // Top 100
    clusters_json: JSON.stringify(payload.clusters || []),
    data_json: dataJson,
    data_size: dataSize
  });
  
  return {
    success: response?.success || false,
    table: 'keyword_intelligence',
    bytesWritten: response?.success ? dataSize : 0
  };
}

/**
 * Save AI analysis to ai_analysis table
 */
function UPP_saveToAiAnalysis(jobToken, domain, competitorId, payload) {
  console.log(`[UPP] Saving to ai_analysis: ${domain}`);
  
  const dataJson = JSON.stringify(payload);
  const dataSize = dataJson.length;
  
  const response = callGateway('upp_save_ai_analysis', {
    job_token: jobToken,
    domain: domain,
    competitor_id: competitorId,
    analysis_type: payload.type || 'gemini',
    model_used: payload.model || 'gemini-2.0-flash',
    prompt_tokens: payload.promptTokens || 0,
    response_tokens: payload.responseTokens || 0,
    insights_json: JSON.stringify(payload.insights || payload.analysis || {}),
    opportunities_json: JSON.stringify(payload.opportunities || []),
    recommendations_json: JSON.stringify(payload.recommendations || []),
    data_json: dataJson,
    data_size: dataSize
  });
  
  return {
    success: response?.success || false,
    table: 'ai_analysis',
    bytesWritten: response?.success ? dataSize : 0
  };
}

/**
 * Save meta/technical data to competitor_results table
 */
function UPP_saveToCompetitorResults(jobToken, domain, competitorId, payload) {
  console.log(`[UPP] Saving to competitor_results: ${domain}`);
  
  const dataJson = JSON.stringify(payload);
  const dataSize = dataJson.length;
  
  const response = callGateway('upp_save_competitor_results', {
    job_token: jobToken,
    domain: domain,
    competitor_id: competitorId,
    domain_authority: payload.domainAuthority || payload.authority || 0,
    traffic_estimate: payload.trafficEstimate || payload.traffic || 0,
    backlink_count: payload.backlinkCount || payload.backlinks?.total || 0,
    content_score: payload.contentScore || 0,
    technical_score: payload.technicalScore || 0,
    load_time_ms: payload.loadTime || payload.pageLoadTime || 0,
    mobile_friendly: payload.mobileFriendly || false,
    https_enabled: payload.httpsEnabled || true,
    data_json: dataJson,
    data_size: dataSize
  });
  
  return {
    success: response?.success || false,
    table: 'competitor_results',
    bytesWritten: response?.success ? dataSize : 0
  };
}

/**
 * Save to job_results table (supports chunking for large payloads)
 * V7.6 FIX: Added project_id to ensure workflow stage recovery works
 */
function UPP_saveToJobResults(jobToken, projectId, competitorId, resultType, payload) {
  console.log(`[UPP] Saving to job_results: ${projectId} [${resultType}]`);
  
  const dataJson = JSON.stringify(payload);
  const dataSize = dataJson.length;
  const MAX_CHUNK_SIZE = 500 * 1024; // 500KB per chunk
  
  // Check if chunking is needed
  if (dataSize > MAX_CHUNK_SIZE) {
    return UPP_saveChunkedToJobResults(jobToken, projectId, competitorId, resultType, dataJson);
  }
  
  const resultId = 'result_' + Utilities.getUuid();
  
  // V7.6 FIX: Include project_id in the payload
  const response = callGateway('job_store_result', {
    result_id: resultId,
    job_token: jobToken,
    project_id: projectId,  // V7.6: Added for workflow stage recovery
    competitor_id: competitorId,
    result_type: resultType,
    data_json: dataJson
  });
  
  // Track chunk for integrity validation
  if (response?.success) {
    UPP_STATE.persistedChunks.set(`${competitorId}_${resultType}`, {
      resultId: resultId,
      size: dataSize,
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    success: response?.success || false,
    table: 'job_results',
    bytesWritten: response?.success ? dataSize : 0
  };
}

/**
 * Save large payloads using chunked storage
 * V7.6 FIX: Added project_id parameter
 */
function UPP_saveChunkedToJobResults(jobToken, projectId, competitorId, resultType, dataJson) {
  console.log(`[UPP] Using chunked storage for ${projectId} (${formatBytes(dataJson.length)})`);
  
  const MAX_CHUNK_SIZE = 500 * 1024;
  const chunks = [];
  
  for (let i = 0; i < dataJson.length; i += MAX_CHUNK_SIZE) {
    chunks.push(dataJson.substring(i, i + MAX_CHUNK_SIZE));
  }
  
  console.log(`[UPP] Split into ${chunks.length} chunks`);
  
  let totalBytesWritten = 0;
  let allSuccess = true;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `result_${Utilities.getUuid()}_chunk${i}`;
    const chunkType = `${resultType}_CHUNK_${i}_OF_${chunks.length}`;
    
    // V7.6 FIX: Include project_id in chunked saves
    const response = callGateway('job_store_result', {
      result_id: chunkId,
      job_token: jobToken,
      project_id: projectId,  // V7.6: Added for workflow stage recovery
      competitor_id: competitorId,
      result_type: chunkType,
      data_json: chunks[i]
    });
    
    if (response?.success) {
      totalBytesWritten += chunks[i].length;
      UPP_STATE.persistedChunks.set(`${competitorId}_${chunkType}`, {
        resultId: chunkId,
        chunkIndex: i,
        totalChunks: chunks.length,
        size: chunks[i].length
      });
    } else {
      allSuccess = false;
      console.error(`[UPP] ❌ Chunk ${i}/${chunks.length} failed for ${projectId}`);
    }
  }
  
  return {
    success: allSuccess,
    table: 'job_results',
    bytesWritten: totalBytesWritten,
    chunks: chunks.length
  };
}

/**
 * Save workflow stage results to ai_analysis table
 * V7 ELITE: Uses new upp_save_workflow_stage endpoint with exact column names:
 *   - job_token (anchor)
 *   - analysis_json (chart data)
 *   - analysis_text (markdown report)
 */
function UPP_saveWorkflowStage(jobToken, projectId, competitorId, payload) {
  console.log(`[UPP] Saving workflow stage ${payload.stage} for project: ${projectId}`);
  
  const stageNum = payload.stage || 1;
  const analysisJson = JSON.stringify(payload.json || {});
  const analysisText = payload.report || '';
  const dataSize = analysisJson.length + analysisText.length;
  
  // V7 FIX: Use new dedicated workflow stage endpoint
  const response = callGateway('upp_save_workflow_stage', {
    job_token: jobToken,
    project_id: projectId,
    stage: stageNum,
    analysis_json: analysisJson,
    analysis_text: analysisText,
    model: payload.model || 'gemini-3-flash-preview',
    stage_name: payload.stageName || 'Stage ' + stageNum,
    competitor_data_used: payload.competitorDataUsed || false
  });
  
  if (response && response.success) {
    console.log(`[UPP] ✅ Committed ${(dataSize/1024).toFixed(2)} KB to ai_analysis [TOKEN: ${jobToken}]`);
  } else {
    console.warn(`[UPP] ⚠️ Stage ${stageNum} persistence failed:`, response?.error || 'Unknown error');
  }
  
  // Also save to job_results for backup recovery
  const fullResult = UPP_saveToJobResults(jobToken, projectId, competitorId, 'WORKFLOW_STAGE_' + stageNum, payload);
  
  return {
    success: response?.success || fullResult.success,
    table: 'ai_analysis + job_results',
    bytesWritten: response?.bytes_written || dataSize,
    job_token: jobToken
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LINE-ITEM PERSISTENCE - GRANULAR FIELD SAVING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Save a single line item (field) to the database
 * Called for granular persistence of individual metrics
 * 
 * @param {string} tableName - Target table
 * @param {string} columnName - Target column
 * @param {any} dataValue - Value to save
 * @param {string} [jobToken] - Job token (auto-resolved if missing)
 * @param {string} [domain] - Competitor domain
 * @returns {Object} Save result
 */
function DB_Elite_saveLineItem(tableName, columnName, dataValue, jobToken, domain) {
  const token = jobToken || UPP_ensureJobToken();
  
  if (!token) {
    console.error('[DB_Elite] Cannot save line item without job token');
    return { success: false, error: 'No job token' };
  }
  
  const competitorId = domain ? 'comp_' + md5Hash(token + domain) : null;
  
  const response = callGateway('upp_save_line_item', {
    job_token: token,
    table_name: tableName,
    column_name: columnName,
    data_value: typeof dataValue === 'object' ? JSON.stringify(dataValue) : String(dataValue),
    competitor_id: competitorId,
    domain: domain
  });
  
  const bytesWritten = String(dataValue).length;
  
  if (response?.success) {
    UPP_STATE.totalBytesWritten += bytesWritten;
  }
  
  return {
    success: response?.success || false,
    table: tableName,
    column: columnName,
    bytesWritten: response?.success ? bytesWritten : 0
  };
}

// Alias for convenience
const DB_Elite = {
  saveLineItem: DB_Elite_saveLineItem
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// INTEGRITY VALIDATION - CHUNKED RE-ASSEMBLY CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Validate data integrity after persistence
 * Checks that all expected chunks were written
 * 
 * @param {string} jobToken - Job token to validate
 * @param {number} expectedCompetitors - Expected number of competitors
 * @returns {Object} Validation result
 */
function UPP_validateIntegrity(jobToken, expectedCompetitors) {
  console.log('[UPP] ═══════════════════════════════════════════════════════════════');
  console.log('[UPP] 🔍 Running Integrity Validation');
  console.log('[UPP] ═══════════════════════════════════════════════════════════════');
  
  const result = {
    success: false,
    jobToken: jobToken,
    expectedCompetitors: expectedCompetitors,
    actualCount: 0,
    missingChunks: [],
    totalBytesInDb: 0,
    retryNeeded: false
  };
  
  try {
    // Query MySQL for actual count
    const response = callGateway('upp_validate_integrity', {
      job_token: jobToken
    });
    
    if (response?.success) {
      result.actualCount = response.result_count || 0;
      result.totalBytesInDb = response.total_bytes || 0;
      
      // Check if count matches expected
      const minExpected = expectedCompetitors * 3; // At least RAW, FINAL, and one more per competitor
      
      if (result.actualCount >= minExpected) {
        result.success = true;
        console.log(`[UPP] ✅ Integrity check passed: ${result.actualCount} records, ${formatBytes(result.totalBytesInDb)}`);
      } else {
        result.retryNeeded = true;
        console.error(`[UPP] ❌ Integrity check FAILED: Expected >=${minExpected}, got ${result.actualCount}`);
        
        // Identify missing chunks
        result.missingChunks = UPP_identifyMissingChunks(jobToken, response.existing_types || []);
      }
    }
    
  } catch (error) {
    console.error('[UPP] Integrity validation error:', error.message);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Identify which chunks are missing for retry
 */
function UPP_identifyMissingChunks(jobToken, existingTypes) {
  const expectedTypes = ['RAW_FETCH', 'FINAL', 'STRATEGIC_AUDIT'];
  const missing = [];
  
  // This would need to be compared against actual competitor list
  // For now, return any missing type patterns
  expectedTypes.forEach(type => {
    if (!existingTypes.some(t => t.includes(type))) {
      missing.push(type);
    }
  });
  
  return missing;
}

/**
 * Retry failed chunks from the retry queue
 * @returns {Object} Retry result
 */
function UPP_retryFailedChunks() {
  console.log(`[UPP] Retrying ${UPP_STATE.retryQueue.length} failed items`);
  
  const results = {
    attempted: UPP_STATE.retryQueue.length,
    succeeded: 0,
    failed: 0
  };
  
  const queue = [...UPP_STATE.retryQueue];
  UPP_STATE.retryQueue = [];
  
  queue.forEach(item => {
    const result = UPP_commit(item);
    if (result.success) {
      results.succeeded++;
    } else {
      results.failed++;
    }
  });
  
  console.log(`[UPP] Retry complete: ${results.succeeded} succeeded, ${results.failed} failed`);
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Simple MD5 hash for ID generation
 */
function md5Hash(input) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input)
    .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
    .join('');
}

/**
 * Get current persistence stats
 */
function UPP_getStats() {
  return {
    currentJobToken: UPP_STATE.currentJobToken,
    currentProjectId: UPP_STATE.currentProjectId,
    totalBytesWritten: UPP_STATE.totalBytesWritten,
    totalBytesFormatted: formatBytes(UPP_STATE.totalBytesWritten),
    chunksPersistedCount: UPP_STATE.persistedChunks.size,
    lastWriteTimestamp: UPP_STATE.lastWriteTimestamp,
    errorCount: UPP_STATE.errors.length,
    retryQueueSize: UPP_STATE.retryQueue.length
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WINDOW/GLOBAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

// Export for cross-file access
if (typeof globalThis !== 'undefined') {
  globalThis.UPP_commit = UPP_commit;
  globalThis.UPP_setJobToken = UPP_setJobToken;
  globalThis.UPP_ensureJobToken = UPP_ensureJobToken;
  globalThis.UPP_validateIntegrity = UPP_validateIntegrity;
  globalThis.UPP_retryFailedChunks = UPP_retryFailedChunks;
  globalThis.UPP_getStats = UPP_getStats;
  globalThis.DB_Elite = DB_Elite;
}

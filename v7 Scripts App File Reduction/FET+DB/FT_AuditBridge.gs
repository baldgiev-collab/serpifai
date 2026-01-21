/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_AuditBridge.gs - Server-Side Evidence Fetcher for AuditTrail UI
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Provides fallback data access when ORACLE_STATE is empty
 * 
 * FLOW:
 *   1. UI opens AuditTrail modal
 *   2. If ORACLE_STATE is empty, UI calls getForensicEvidence(jobToken, domain, metricType)
 *   3. This bridge fetches raw HTML snippets from job_results table in MySQL
 *   4. Returns minimal evidence payload for Zero-Trust rendering
 * 
 * ENDPOINTS:
 *   - getForensicEvidence(jobToken, domain, metricType) - Full evidence for specific metric
 *   - getForensicEvidenceSummary(jobToken) - Lightweight summary for all competitors
 *   - recoverJobToken(projectId) - Recover token from project cache
 * 
 * @module AuditBridge
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 */


// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN EVIDENCE FETCHER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch forensic evidence for a specific competitor and metric from database
 * Used as fallback when ORACLE_STATE is empty
 * 
 * @param {string} jobToken - The job token for database lookup
 * @param {string} domain - Competitor domain to fetch evidence for
 * @param {string} metricType - Specific metric type (e.g., 'technical.wordCount', 'backlinks.total')
 * @returns {Object} Evidence data with raw snippets
 */
function getForensicEvidence(jobToken, domain, metricType) {
  console.log(`[AuditBridge] getForensicEvidence called`);
  console.log(`   jobToken: ${jobToken}`);
  console.log(`   domain: ${domain}`);
  console.log(`   metricType: ${metricType}`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    domain: domain,
    metricType: metricType,
    evidence: null,
    source: 'database',
    fetchedAt: new Date().toISOString()
  };
  
  try {
    // Validate inputs
    if (!jobToken) {
      result.error = 'No jobToken provided';
      return result;
    }
    
    // PRIORITY 1: Try MySQL job_results table
    const mysqlEvidence = fetchEvidenceFromMySQL(jobToken, domain, metricType);
    if (mysqlEvidence && mysqlEvidence.success) {
      result.success = true;
      result.evidence = mysqlEvidence.evidence;
      result.source = 'mysql';
      console.log(`   ✅ Fetched from MySQL`);
      return result;
    }
    
    // PRIORITY 2: Try Script Cache
    const cacheEvidence = fetchEvidenceFromCache(jobToken, domain);
    if (cacheEvidence && cacheEvidence.success) {
      result.success = true;
      result.evidence = extractMetricEvidence(cacheEvidence.data, metricType);
      result.source = 'cache';
      console.log(`   ✅ Fetched from Cache`);
      return result;
    }
    
    // PRIORITY 3: Try ScriptProperties (chunked storage)
    const propsEvidence = fetchEvidenceFromProperties(jobToken, domain);
    if (propsEvidence && propsEvidence.success) {
      result.success = true;
      result.evidence = extractMetricEvidence(propsEvidence.data, metricType);
      result.source = 'properties';
      console.log(`   ✅ Fetched from ScriptProperties`);
      return result;
    }
    
    result.error = 'Evidence not found in any storage layer';
    console.log(`   ⚠️ Evidence not found`);
    
  } catch (error) {
    console.error(`[AuditBridge] Error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}


// ═══════════════════════════════════════════════════════════════════════════════════
// THIN UI: ON-DEMAND EVIDENCE FETCHING (FIX FOR 3.6MB CHANNEL CRASH)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * List all competitors for a job (lightweight - returns domains only)
 * Used by UI to know which domains to fetch individually
 * 
 * @param {string} jobToken - The job token
 * @returns {Object} List of competitor domains with status
 */
function listJobCompetitors(jobToken) {
  console.log(`[AuditBridge] listJobCompetitors for job: ${jobToken}`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitors: [],
    count: 0,
    lastMySQLSync: null,
    totalDataSize: 0
  };
  
  try {
    if (!jobToken) {
      result.error = 'No jobToken provided';
      return result;
    }
    
    if (typeof callGateway !== 'function') {
      result.error = 'Gateway not available';
      return result;
    }
    
    const response = callGateway('job_list_competitors', {
      job_token: jobToken
    });
    
    if (response && response.success) {
      result.success = true;
      result.competitors = response.competitors || [];
      result.count = response.count || 0;
      result.lastMySQLSync = response.last_mysql_sync || null;
      result.totalDataSize = response.total_data_size || 0;
      console.log(`   ✅ Found ${result.count} competitors`);
    } else {
      result.error = response?.error || 'Failed to list competitors';
    }
    
  } catch (error) {
    console.error(`[AuditBridge] listJobCompetitors error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Fetch analysis data for a SINGLE competitor (on-demand ~500KB)
 * Called in a loop by UI for each domain
 * 
 * @param {string} jobToken - The job token
 * @param {string} domain - Competitor domain
 * @returns {Object} Competitor analysis data
 */
function fetchCompetitorAnalysis(jobToken, domain) {
  console.log(`[AuditBridge] fetchCompetitorAnalysis: ${domain}`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    domain: domain,
    data: null,
    dataSize: 0,
    fetchedAt: null
  };
  
  try {
    if (!jobToken || !domain) {
      result.error = 'jobToken and domain are required';
      return result;
    }
    
    if (typeof callGateway !== 'function') {
      result.error = 'Gateway not available';
      return result;
    }
    
    const response = callGateway('job_get_competitor', {
      job_token: jobToken,
      domain: domain
    });
    
    if (response && response.success) {
      result.success = true;
      result.domain = response.domain;
      result.data = response.data || {};
      result.dataSize = response.data_size || 0;
      result.fetchedAt = response.fetched_at || new Date().toISOString();
      console.log(`   ✅ Fetched ${result.dataSize} bytes for ${domain}`);
    } else {
      result.error = response?.error || 'Failed to fetch competitor data';
    }
    
  } catch (error) {
    console.error(`[AuditBridge] fetchCompetitorAnalysis error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Fetch raw evidence snippet for a specific metric (Zero-Trust Proof)
 * Called ONLY when user clicks 🛡️ proof button
 * 
 * @param {string} jobToken - The job token
 * @param {string} domain - Competitor domain
 * @param {string} metricType - Specific metric (e.g., 'technical.wordCount')
 * @returns {Object} Evidence snippet with raw HTML proof
 */
function getRawEvidenceSnippet(jobToken, domain, metricType) {
  console.log(`[AuditBridge] getRawEvidenceSnippet: ${domain} / ${metricType}`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    domain: domain,
    metricType: metricType,
    evidence: null,
    rawSnippet: null,
    dataSize: 0
  };
  
  try {
    if (!jobToken || !domain) {
      result.error = 'jobToken and domain are required';
      return result;
    }
    
    if (typeof callGateway !== 'function') {
      result.error = 'Gateway not available';
      return result;
    }
    
    const response = callGateway('job_get_evidence_snippet', {
      job_token: jobToken,
      domain: domain,
      metric_type: metricType || 'all'
    });
    
    if (response && response.success) {
      result.success = true;
      result.evidence = response.evidence;
      result.rawSnippet = response.raw_snippet || null;
      result.dataSize = response.data_size || 0;
      result.fetchedAt = response.fetched_at || new Date().toISOString();
      console.log(`   ✅ Fetched evidence for ${metricType}`);
    } else {
      result.error = response?.error || 'Failed to fetch evidence';
    }
    
  } catch (error) {
    console.error(`[AuditBridge] getRawEvidenceSnippet error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Lightweight evidence fetch for AuditTrail modal (legacy support)
 * Returns competitor list with minimal data for initial render
 * 
 * @param {string} jobToken - The job token
 * @returns {Object} Lightweight competitor data
 */
function getForensicEvidenceLight(jobToken) {
  console.log(`[AuditBridge] getForensicEvidenceLight for job: ${jobToken}`);
  
  // First, get competitor list
  const listResult = listJobCompetitors(jobToken);
  
  if (!listResult.success) {
    return {
      success: false,
      message: listResult.error || 'Failed to list competitors',
      jobToken: jobToken
    };
  }
  
  // Return lightweight data - UI will fetch each competitor individually
  return {
    success: true,
    jobToken: jobToken,
    competitors: listResult.competitors,
    count: listResult.count,
    lastMySQLSync: listResult.lastMySQLSync,
    totalDataSize: listResult.totalDataSize,
    fetchMode: 'on_demand' // Signal to UI to fetch individually
  };
}


// ═══════════════════════════════════════════════════════════════════════════════════
// LAYER 12: COMPETITOR SNAPSHOT ENDPOINT (500KB MAX WITH EVIDENCE MAP)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * LAYER 12: Get full competitor snapshot with evidenceMap for Zero-Trust
 * Called by AsyncRehydrator - Returns ~500KB max payload
 * 
 * Policy: Every snapshot MUST include evidenceMap for Zero-Trust verification
 * 
 * @param {string} jobToken - The job token
 * @param {string} domain - Competitor domain
 * @returns {Object} Competitor snapshot with evidenceMap
 */
function getCompetitorSnapshot(jobToken, domain) {
  console.log(`[AuditBridge] getCompetitorSnapshot: ${domain}`);
  console.log(`   Layer 12: MySQL Data Bridge - ~500KB max`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    domain: domain,
    data: null,
    evidenceMap: {},
    strategicAudit: null,
    dataSize: 0,
    fetchedAt: new Date().toISOString()
  };
  
  try {
    if (!jobToken || !domain) {
      result.error = 'jobToken and domain are required';
      return result;
    }
    
    if (typeof callGateway !== 'function') {
      result.error = 'Gateway not available';
      return result;
    }
    
    // Fetch full competitor data from MySQL
    const response = callGateway('job_get_competitor_snapshot', {
      job_token: jobToken,
      domain: domain,
      include_evidence: true,
      include_strategic: true,
      max_payload_kb: 500 // Enforce 500KB limit
    });
    
    if (response && response.success) {
      result.success = true;
      result.domain = response.domain || domain;
      result.data = response.data || {};
      result.dataSize = response.data_size || 0;
      
      // CRITICAL: Always include evidenceMap for Zero-Trust
      result.evidenceMap = response.evidence_map || buildEvidenceMapFromData(result.data);
      
      // Include strategic audit results if available
      result.strategicAudit = response.strategic_audit || null;
      
      // Log payload size
      const payloadSize = JSON.stringify(result).length;
      console.log(`   ✅ Snapshot: ${result.dataSize} bytes (total payload: ${formatBytes(payloadSize)})`);
      
      // Warn if approaching limit
      if (payloadSize > 450000) {
        console.log(`   ⚠️ Warning: Payload approaching 500KB limit`);
      }
      
    } else {
      // Fallback: Try standard competitor fetch
      console.log(`   Fallback: Using fetchCompetitorAnalysis`);
      const fallback = fetchCompetitorAnalysis(jobToken, domain);
      
      if (fallback.success) {
        result.success = true;
        result.data = fallback.data;
        result.dataSize = fallback.dataSize;
        result.evidenceMap = buildEvidenceMapFromData(fallback.data);
        result.fallbackUsed = true;
      } else {
        result.error = response?.error || 'Failed to fetch competitor snapshot';
      }
    }
    
  } catch (error) {
    console.error(`[AuditBridge] getCompetitorSnapshot error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Build evidence map from competitor data for Zero-Trust verification
 * Extracts proof pointers from each metric category
 * @private
 */
function buildEvidenceMapFromData(data) {
  if (!data) return {};
  
  const evidenceMap = {};
  
  // Technical SEO evidence
  if (data.technical) {
    evidenceMap.technical = {
      wordCount: {
        value: data.technical.wordCount,
        source: 'html.body',
        confidence: 95
      },
      headings: {
        value: data.technical.headingCount || Object.keys(data.technical.headings || {}).length,
        source: 'html.headings',
        confidence: 95
      },
      schemaTypes: {
        value: data.technical.schemaTypes?.length || 0,
        source: 'html.script[type="application/ld+json"]',
        confidence: 90
      }
    };
  }
  
  // Content evidence
  if (data.content) {
    evidenceMap.content = {
      title: {
        value: data.content.title,
        source: 'html.title',
        confidence: 100
      },
      metaDescription: {
        value: data.content.metaDescription?.substring(0, 100),
        source: 'html.meta[name="description"]',
        confidence: 100
      }
    };
  }
  
  // Backlink evidence
  if (data.backlinks) {
    evidenceMap.backlinks = {
      total: {
        value: data.backlinks.total || data.backlinks.count,
        source: 'api.serpapi',
        confidence: 80
      },
      dofollowRatio: {
        value: data.backlinks.dofollowRatio || data.backlinks.dofollow_ratio,
        source: 'api.calculation',
        confidence: 75
      }
    };
  }
  
  // Keywords evidence
  if (data.keywords || data.rankedKeywords) {
    evidenceMap.keywords = {
      totalRanked: {
        value: data.keywords?.totalRanked || data.rankedKeywords?.length,
        source: 'api.serpapi',
        confidence: 85
      }
    };
  }
  
  // Strategic audit evidence
  if (data.strategicAudit) {
    evidenceMap.strategic = {
      programmaticMoat: {
        isProgrammatic: data.strategicAudit.programmaticMoat?.isProgrammatic,
        templateSimilarity: data.strategicAudit.programmaticMoat?.templateSimilarity,
        source: 'dom.comparison',
        confidence: data.strategicAudit.programmaticMoat?.confidence || 75
      },
      emotionalDebt: {
        frictionScore: data.strategicAudit.emotionalDebt?.frictionScore,
        gaps: data.strategicAudit.emotionalDebt?.gaps?.length || 0,
        source: 'content.analysis',
        confidence: 70
      },
      semanticTriplets: {
        count: data.strategicAudit.semanticTriplets?.triplets?.length || 0,
        source: 'nlp.extraction',
        confidence: 65
      }
    };
  }
  
  return evidenceMap;
}

/**
 * Format bytes to human-readable string
 * @private
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// ═══════════════════════════════════════════════════════════════════════════════════
// MYSQL FETCHER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch evidence directly from MySQL job_results table
 * @private
 */
function fetchEvidenceFromMySQL(jobToken, domain, metricType) {
  try {
    // Use callGateway to query MySQL
    if (typeof callGateway !== 'function') {
      console.log(`   [MySQL] callGateway not available`);
      return { success: false };
    }
    
    const response = callGateway('evidence:get', {
      job_token: jobToken,
      domain: domain,
      metric_type: metricType
    });
    
    if (response && response.success && response.evidence) {
      return {
        success: true,
        evidence: {
          raw: response.evidence.raw_snippet || response.evidence.raw || '',
          value: response.evidence.value,
          source: response.evidence.source || 'MySQL job_results',
          confidence: response.evidence.confidence || 80,
          timestamp: response.evidence.timestamp || response.evidence.created_at
        }
      };
    }
    
    return { success: false };
    
  } catch (error) {
    console.log(`   [MySQL] Fetch error: ${error.message}`);
    return { success: false };
  }
}


// ═══════════════════════════════════════════════════════════════════════════════════
// CACHE FETCHER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch competitor data from Script Cache
 * @private
 */
function fetchEvidenceFromCache(jobToken, domain) {
  try {
    const cache = CacheService.getScriptCache();
    
    // Try domain-specific cache key first
    const domainKey = `evidence_${jobToken}_${domain}`;
    let cached = cache.get(domainKey);
    
    if (cached) {
      return {
        success: true,
        data: JSON.parse(cached)
      };
    }
    
    // Try job-level cache
    const jobKey = `job_${jobToken}`;
    cached = cache.get(jobKey);
    
    if (cached) {
      const jobData = JSON.parse(cached);
      if (jobData.competitors) {
        // Find matching domain
        const comp = Array.isArray(jobData.competitors)
          ? jobData.competitors.find(c => c.domain === domain)
          : jobData.competitors[domain];
        
        if (comp) {
          return {
            success: true,
            data: comp
          };
        }
      }
    }
    
    return { success: false };
    
  } catch (error) {
    console.log(`   [Cache] Fetch error: ${error.message}`);
    return { success: false };
  }
}


// ═══════════════════════════════════════════════════════════════════════════════════
// SCRIPT PROPERTIES FETCHER (Chunked Storage)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch competitor data from ScriptProperties (handles chunked storage)
 * @private
 */
function fetchEvidenceFromProperties(jobToken, domain) {
  try {
    const props = PropertiesService.getScriptProperties();
    
    // Try direct key first
    const directKey = `comp_${jobToken}_${domain}`;
    let propValue = props.getProperty(directKey);
    
    if (propValue) {
      return {
        success: true,
        data: JSON.parse(propValue)
      };
    }
    
    // Try chunked storage (37-chunk pattern)
    const chunkCount = parseInt(props.getProperty(`${directKey}_chunks`) || '0');
    if (chunkCount > 0) {
      let assembled = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = props.getProperty(`${directKey}_chunk_${i}`);
        if (chunk) assembled += chunk;
      }
      
      if (assembled) {
        return {
          success: true,
          data: JSON.parse(assembled)
        };
      }
    }
    
    return { success: false };
    
  } catch (error) {
    console.log(`   [Props] Fetch error: ${error.message}`);
    return { success: false };
  }
}


// ═══════════════════════════════════════════════════════════════════════════════════
// EVIDENCE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Extract specific metric evidence from competitor data
 * @private
 */
function extractMetricEvidence(competitorData, metricType) {
  if (!competitorData) return null;
  
  const evidence = {
    metricType: metricType,
    value: null,
    raw: null,
    source: 'unknown',
    confidence: 0
  };
  
  // If specific metric requested, look in evidenceMap
  if (metricType && metricType !== 'all') {
    const evidenceMap = competitorData.evidenceMap || {};
    
    if (evidenceMap[metricType]) {
      const metricEvidence = evidenceMap[metricType];
      evidence.value = metricEvidence.value;
      evidence.raw = metricEvidence.raw?.snippet || metricEvidence.raw || null;
      evidence.source = metricEvidence.source || 'evidenceMap';
      evidence.confidence = metricEvidence.confidence || 80;
      return evidence;
    }
    
    // Try to extract from synthesized data
    const synthesized = competitorData.synthesized || {};
    const pathParts = metricType.split('.');
    let value = synthesized;
    for (const part of pathParts) {
      value = value?.[part];
    }
    
    if (value !== undefined) {
      evidence.value = value;
      evidence.source = 'synthesized';
      evidence.confidence = 70;
      return evidence;
    }
  }
  
  // Return all available evidence
  return {
    metricType: 'all',
    evidenceMap: competitorData.evidenceMap || {},
    synthesized: competitorData.synthesized || {},
    source: 'full-data'
  };
}


// ═══════════════════════════════════════════════════════════════════════════════════
// JOB TOKEN RECOVERY
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Recover jobToken from projectId if UI lost it (FIX #3: Rewritten with MySQL query)
 * Uses direct query to job_registry: SELECT job_token WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
 * 
 * @param {string} projectId - Project identifier
 * @returns {Object} Recovery result with jobToken if found
 */
function recoverJobToken(projectId) {
  console.log(`[StateRecovery] recoverJobToken for project: ${projectId}`);
  
  const result = {
    success: false,
    projectId: projectId,
    jobToken: null,
    source: null,
    recoveryAttempts: []
  };
  
  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIORITY 1: Query MySQL job_registry - AUTHORITATIVE SOURCE
    // SQL: SELECT job_token FROM job_registry WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof callGateway === 'function') {
      console.log(`   [MySQL] Querying job_registry for project: ${projectId}`);
      
      try {
        const response = callGateway('job_recover_token', {
          project_id: projectId
        });
        
        if (response && response.success && response.job_token) {
          result.success = true;
          result.jobToken = response.job_token;
          result.source = 'mysql_job_registry';
          result.jobCreatedAt = response.created_at || null;
          result.jobStatus = response.status || null;
          result.recoveryAttempts.push({ source: 'mysql', success: true });
          
          // Also cache for faster future recovery
          try {
            const cache = CacheService.getScriptCache();
            cache.put(`lastJob_${projectId}`, response.job_token, 7200); // 2 hours
          } catch (cacheErr) { /* non-fatal */ }
          
          console.log(`   ✅ MySQL SUCCESS: ${result.jobToken} (created: ${result.jobCreatedAt})`);
          return result;
        } else {
          result.recoveryAttempts.push({ source: 'mysql', success: false, error: response?.error || 'No job found' });
          console.log(`   ⚠️ MySQL: No job found for project`);
        }
      } catch (mysqlError) {
        result.recoveryAttempts.push({ source: 'mysql', success: false, error: mysqlError.message });
        console.log(`   ⚠️ MySQL error: ${mysqlError.message}`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIORITY 2: Check Script Cache for recent job
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const cache = CacheService.getScriptCache();
      const cacheKey = `lastJob_${projectId}`;
      const cachedToken = cache.get(cacheKey);
      
      if (cachedToken) {
        result.success = true;
        result.jobToken = cachedToken;
        result.source = 'script_cache';
        result.recoveryAttempts.push({ source: 'cache', success: true });
        console.log(`   ✅ Cache SUCCESS: ${cachedToken}`);
        return result;
      }
      result.recoveryAttempts.push({ source: 'cache', success: false });
    } catch (cacheError) {
      result.recoveryAttempts.push({ source: 'cache', success: false, error: cacheError.message });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIORITY 3: Check ScriptProperties
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const props = PropertiesService.getScriptProperties();
      const propsKey = `lastJob_${projectId}`;
      const propsToken = props.getProperty(propsKey);
      
      if (propsToken) {
        result.success = true;
        result.jobToken = propsToken;
        result.source = 'script_properties';
        result.recoveryAttempts.push({ source: 'properties', success: true });
        console.log(`   ✅ Properties SUCCESS: ${propsToken}`);
        return result;
      }
      result.recoveryAttempts.push({ source: 'properties', success: false });
    } catch (propsError) {
      result.recoveryAttempts.push({ source: 'properties', success: false, error: propsError.message });
    }
    
    result.error = 'No recent job found in any storage layer (MySQL, Cache, Properties)';
    console.log(`   ❌ All recovery attempts failed`);
    
  } catch (error) {
    console.error(`[StateRecovery] Critical error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}


// ═══════════════════════════════════════════════════════════════════════════════════
// LIGHTWEIGHT SUMMARY (For AuditTrail initial load)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get lightweight evidence summary for all competitors in a job
 * Returns minimal data for initial modal render
 * 
 * @param {string} jobToken - Job token
 * @returns {Object} Summary with competitor domains and basic evidence availability
 */
function getForensicEvidenceSummary(jobToken) {
  console.log(`[AuditBridge] getForensicEvidenceSummary for job: ${jobToken}`);
  
  const result = {
    success: false,
    jobToken: jobToken,
    competitors: [],
    totalCompetitors: 0,
    evidenceAvailable: 0
  };
  
  try {
    // Try to get job info from cache
    const cache = CacheService.getScriptCache();
    const jobKey = `job_${jobToken}`;
    const cached = cache.get(jobKey);
    
    if (cached) {
      const jobData = JSON.parse(cached);
      const competitors = jobData.competitors || [];
      
      result.success = true;
      result.totalCompetitors = competitors.length;
      result.competitors = competitors.map(comp => ({
        domain: comp.domain || comp,
        id: comp.id,
        status: comp.status || 'unknown',
        hasEvidence: !!(comp.evidenceMap || comp.synthesized)
      }));
      result.evidenceAvailable = result.competitors.filter(c => c.hasEvidence).length;
      
      return result;
    }
    
    // Fallback: Try MySQL
    if (typeof callGateway === 'function') {
      const response = callGateway('job_get_status', { job_token: jobToken });
      
      if (response && response.success) {
        result.success = true;
        result.totalCompetitors = response.competitor_count || 0;
        result.competitors = (response.competitors || []).map(c => ({
          domain: c.domain,
          status: c.status,
          hasEvidence: c.status === 'completed'
        }));
        result.evidenceAvailable = result.competitors.filter(c => c.hasEvidence).length;
        
        return result;
      }
    }
    
    result.error = 'Job not found';
    
  } catch (error) {
    console.error(`[AuditBridge] Summary error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

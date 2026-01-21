/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SERPIFAI DATA PRUNING WORKER v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Monthly maintenance worker that prunes stale LONGTEXT data while preserving
 * calculated scores and audit trail references.
 * 
 * Target Schema: u187453795_SrpAIDataGate
 * 
 * PRUNING STRATEGY:
 * ─────────────────
 * 1. link_forensics: Delete raw_html for rows > 30 days old (keep scores)
 * 2. job_results: Archive RAW_FETCH chunks > 60 days to cold storage
 * 3. api_transactions: Truncate response_data > 90 days (keep metadata)
 * 4. fetcher_cache: Hard delete expired cache entries
 * 
 * PRESERVATION RULES:
 * ─────────────────
 * - NEVER delete competitor_results scores
 * - NEVER delete ai_analysis strategic recommendations
 * - NEVER delete workflow_log entries (audit trail)
 * - Always maintain ID pointers for Zero-Trust verification
 * 
 * @author SerpifAI Elite Systems
 * @version 1.0
 * @date 2026-01-17
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const PRUNING_CONFIG = {
  // Retention periods (in days)
  LINK_FORENSICS_RAW_HTML_RETENTION: 30,      // Delete raw HTML after 30 days
  JOB_RESULTS_RAW_FETCH_RETENTION: 60,        // Archive raw fetch after 60 days
  API_TRANSACTIONS_RESPONSE_RETENTION: 90,    // Truncate responses after 90 days
  FETCHER_CACHE_RETENTION: 7,                 // Hard delete cache after 7 days
  
  // Batch sizes (to prevent timeouts)
  BATCH_SIZE: 100,
  MAX_BATCHES_PER_RUN: 10,
  
  // Notification settings
  NOTIFY_ON_COMPLETION: true,
  ADMIN_EMAIL: null  // Set via script properties
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - CRON TRIGGER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main monthly maintenance function - designed to be called by time-based trigger
 * Set up trigger: Script Editor → Triggers → Add Trigger → runMonthlyMaintenance
 * Schedule: 1st of each month, 3:00 AM
 */
function runMonthlyMaintenance() {
  const startTime = Date.now();
  
  Logger.log(`╔════════════════════════════════════════════════════════════════════╗`);
  Logger.log(`║  SERPIFAI DATA PRUNING WORKER v1.0                                 ║`);
  Logger.log(`║  Monthly Maintenance Cycle                                         ║`);
  Logger.log(`╠════════════════════════════════════════════════════════════════════╣`);
  Logger.log(`║  Started: ${new Date().toISOString()}                    ║`);
  Logger.log(`╚════════════════════════════════════════════════════════════════════╝`);
  
  const results = {
    linkForensics: { pruned: 0, bytesFreed: 0, errors: [] },
    jobResults: { archived: 0, bytesFreed: 0, errors: [] },
    apiTransactions: { truncated: 0, bytesFreed: 0, errors: [] },
    fetcherCache: { deleted: 0, errors: [] },
    totalBytesFreed: 0,
    executionTimeMs: 0,
    completedAt: null
  };
  
  try {
    // Phase 1: Prune link_forensics raw HTML
    Logger.log(`\n📋 Phase 1: Pruning link_forensics raw HTML...`);
    results.linkForensics = pruneLinkForensicsRawHtml();
    
    // Phase 2: Archive old job_results RAW_FETCH
    Logger.log(`\n📦 Phase 2: Archiving old job_results...`);
    results.jobResults = archiveOldJobResults();
    
    // Phase 3: Truncate old API transaction responses
    Logger.log(`\n🔧 Phase 3: Truncating old API responses...`);
    results.apiTransactions = truncateApiTransactionResponses();
    
    // Phase 4: Hard delete expired cache
    Logger.log(`\n🗑️ Phase 4: Deleting expired cache...`);
    results.fetcherCache = deleteExpiredCache();
    
    // Calculate totals
    results.totalBytesFreed = 
      results.linkForensics.bytesFreed + 
      results.jobResults.bytesFreed + 
      results.apiTransactions.bytesFreed;
    
    results.executionTimeMs = Date.now() - startTime;
    results.completedAt = new Date().toISOString();
    
    // Log summary
    logMaintenanceSummary(results);
    
    // Store maintenance log
    storeMaintenanceLog(results);
    
    // Send notification if configured
    if (PRUNING_CONFIG.NOTIFY_ON_COMPLETION) {
      sendMaintenanceNotification(results);
    }
    
    return results;
    
  } catch (error) {
    Logger.log(`\n❌ FATAL ERROR: ${error.toString()}`);
    Logger.log(`   Stack: ${error.stack}`);
    
    results.executionTimeMs = Date.now() - startTime;
    results.error = error.toString();
    
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: PRUNE LINK_FORENSICS RAW HTML
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Nullifies raw_html column for rows older than retention period
 * PRESERVES: All calculated scores, metadata, and ID references
 */
function pruneLinkForensicsRawHtml() {
  const result = {
    pruned: 0,
    bytesFreed: 0,
    errors: []
  };
  
  try {
    const retentionDays = PRUNING_CONFIG.LINK_FORENSICS_RAW_HTML_RETENTION;
    
    // Step 1: Get count and size of rows to prune
    const countResponse = callGateway('prune_link_forensics_count', {
      retentionDays: retentionDays
    });
    
    if (!countResponse.success) {
      result.errors.push(`Count query failed: ${countResponse.error}`);
      return result;
    }
    
    const rowsToPrune = countResponse.count || 0;
    const estimatedBytes = countResponse.estimatedBytes || 0;
    
    Logger.log(`   Found ${rowsToPrune} rows older than ${retentionDays} days`);
    Logger.log(`   Estimated storage to free: ${formatBytes(estimatedBytes)}`);
    
    if (rowsToPrune === 0) {
      Logger.log(`   ✅ No rows to prune`);
      return result;
    }
    
    // Step 2: Prune in batches
    let batchesProcessed = 0;
    let totalPruned = 0;
    
    while (batchesProcessed < PRUNING_CONFIG.MAX_BATCHES_PER_RUN && totalPruned < rowsToPrune) {
      const pruneResponse = callGateway('prune_link_forensics_execute', {
        retentionDays: retentionDays,
        batchSize: PRUNING_CONFIG.BATCH_SIZE
      });
      
      if (!pruneResponse.success) {
        result.errors.push(`Batch ${batchesProcessed + 1} failed: ${pruneResponse.error}`);
        break;
      }
      
      totalPruned += pruneResponse.rowsAffected || 0;
      batchesProcessed++;
      
      Logger.log(`   Batch ${batchesProcessed}: Pruned ${pruneResponse.rowsAffected} rows`);
      
      // Small delay to prevent overwhelming the database
      Utilities.sleep(100);
    }
    
    result.pruned = totalPruned;
    result.bytesFreed = estimatedBytes;
    
    Logger.log(`   ✅ Pruned ${totalPruned} rows, freed ~${formatBytes(estimatedBytes)}`);
    
  } catch (error) {
    result.errors.push(error.toString());
    Logger.log(`   ❌ Error: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: ARCHIVE OLD JOB_RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Archives old RAW_FETCH entries from job_results
 * Moves data to cold storage table (job_results_archive)
 * PRESERVES: result_type, job_token, competitor_id references
 */
function archiveOldJobResults() {
  const result = {
    archived: 0,
    bytesFreed: 0,
    errors: []
  };
  
  try {
    const retentionDays = PRUNING_CONFIG.JOB_RESULTS_RAW_FETCH_RETENTION;
    
    // Only archive RAW_FETCH type - preserve strategic data
    const archiveResponse = callGateway('archive_job_results', {
      retentionDays: retentionDays,
      resultTypes: ['RAW_FETCH', 'RAW_HTML'],
      batchSize: PRUNING_CONFIG.BATCH_SIZE
    });
    
    if (!archiveResponse.success) {
      result.errors.push(`Archive failed: ${archiveResponse.error}`);
      return result;
    }
    
    result.archived = archiveResponse.archivedCount || 0;
    result.bytesFreed = archiveResponse.bytesFreed || 0;
    
    Logger.log(`   ✅ Archived ${result.archived} rows, freed ~${formatBytes(result.bytesFreed)}`);
    
  } catch (error) {
    result.errors.push(error.toString());
    Logger.log(`   ❌ Error: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3: TRUNCATE API TRANSACTION RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Truncates large response_data in api_transactions
 * PRESERVES: action_type, credit_cost, status, timestamps (audit trail)
 */
function truncateApiTransactionResponses() {
  const result = {
    truncated: 0,
    bytesFreed: 0,
    errors: []
  };
  
  try {
    const retentionDays = PRUNING_CONFIG.API_TRANSACTIONS_RESPONSE_RETENTION;
    
    const truncateResponse = callGateway('truncate_api_responses', {
      retentionDays: retentionDays,
      maxResponseSize: 1024,  // Keep first 1KB as summary
      batchSize: PRUNING_CONFIG.BATCH_SIZE
    });
    
    if (!truncateResponse.success) {
      result.errors.push(`Truncate failed: ${truncateResponse.error}`);
      return result;
    }
    
    result.truncated = truncateResponse.truncatedCount || 0;
    result.bytesFreed = truncateResponse.bytesFreed || 0;
    
    Logger.log(`   ✅ Truncated ${result.truncated} responses, freed ~${formatBytes(result.bytesFreed)}`);
    
  } catch (error) {
    result.errors.push(error.toString());
    Logger.log(`   ❌ Error: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4: DELETE EXPIRED CACHE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hard deletes expired fetcher_cache entries
 * This is non-critical data that can be refetched
 */
function deleteExpiredCache() {
  const result = {
    deleted: 0,
    errors: []
  };
  
  try {
    const deleteResponse = callGateway('delete_expired_cache', {
      // Cache entries already have expires_at, use that
    });
    
    if (!deleteResponse.success) {
      result.errors.push(`Delete failed: ${deleteResponse.error}`);
      return result;
    }
    
    result.deleted = deleteResponse.deletedCount || 0;
    
    Logger.log(`   ✅ Deleted ${result.deleted} expired cache entries`);
    
  } catch (error) {
    result.errors.push(error.toString());
    Logger.log(`   ❌ Error: ${error.toString()}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Log maintenance summary
 */
function logMaintenanceSummary(results) {
  Logger.log(`\n${'═'.repeat(70)}`);
  Logger.log(`📊 MAINTENANCE SUMMARY`);
  Logger.log(`${'─'.repeat(70)}`);
  Logger.log(`   📋 Link Forensics: ${results.linkForensics.pruned} rows pruned`);
  Logger.log(`   📦 Job Results: ${results.jobResults.archived} rows archived`);
  Logger.log(`   🔧 API Transactions: ${results.apiTransactions.truncated} responses truncated`);
  Logger.log(`   🗑️ Cache: ${results.fetcherCache.deleted} entries deleted`);
  Logger.log(`   💾 Total Storage Freed: ${formatBytes(results.totalBytesFreed)}`);
  Logger.log(`   ⏱️ Execution Time: ${results.executionTimeMs}ms`);
  Logger.log(`${'═'.repeat(70)}`);
}

/**
 * Store maintenance log in database
 */
function storeMaintenanceLog(results) {
  try {
    callGateway('upp_save_job_results', {
      jobToken: 'MAINTENANCE_' + new Date().toISOString().split('T')[0],
      resultType: 'MAINTENANCE_LOG',
      resultData: JSON.stringify(results),
      competitorId: null
    });
    Logger.log(`   ✅ Maintenance log stored`);
  } catch (error) {
    Logger.log(`   ⚠️ Failed to store maintenance log: ${error.toString()}`);
  }
}

/**
 * Send email notification on completion
 */
function sendMaintenanceNotification(results) {
  try {
    const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (!adminEmail) {
      Logger.log(`   ℹ️ No admin email configured, skipping notification`);
      return;
    }
    
    const subject = `[SerpifAI] Monthly Maintenance Complete - ${formatBytes(results.totalBytesFreed)} freed`;
    const body = `
SerpifAI Data Pruning Report
═══════════════════════════════════════

Completed: ${results.completedAt}
Execution Time: ${results.executionTimeMs}ms

RESULTS:
────────────────────────────────────────
• Link Forensics: ${results.linkForensics.pruned} rows pruned
• Job Results: ${results.jobResults.archived} rows archived
• API Transactions: ${results.apiTransactions.truncated} responses truncated
• Cache Entries: ${results.fetcherCache.deleted} deleted

STORAGE FREED: ${formatBytes(results.totalBytesFreed)}

${results.linkForensics.errors.length > 0 ? 'Errors: ' + results.linkForensics.errors.join(', ') : 'No errors'}

---
SerpifAI Elite Systems
    `;
    
    MailApp.sendEmail(adminEmail, subject, body);
    Logger.log(`   ✅ Notification sent to ${adminEmail}`);
    
  } catch (error) {
    Logger.log(`   ⚠️ Failed to send notification: ${error.toString()}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANUAL TRIGGER FUNCTIONS (for testing)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Manual trigger for testing - dry run mode
 */
function testMaintenanceDryRun() {
  Logger.log(`🧪 DRY RUN MODE - No changes will be made`);
  
  // Just count what would be pruned
  const countResponse = callGateway('prune_link_forensics_count', {
    retentionDays: PRUNING_CONFIG.LINK_FORENSICS_RAW_HTML_RETENTION
  });
  
  Logger.log(`Would prune: ${countResponse.count || 0} link_forensics rows`);
  Logger.log(`Would free: ${formatBytes(countResponse.estimatedBytes || 0)}`);
}

/**
 * Get current storage usage stats
 */
function getStorageStats() {
  const statsResponse = callGateway('get_storage_stats', {});
  
  if (statsResponse.success) {
    Logger.log(`\n📊 STORAGE STATISTICS`);
    Logger.log(`${'─'.repeat(50)}`);
    
    for (const table of (statsResponse.tables || [])) {
      Logger.log(`   ${table.name}: ${table.rowCount} rows, ${formatBytes(table.dataSize)}`);
    }
    
    Logger.log(`${'─'.repeat(50)}`);
    Logger.log(`   TOTAL: ${formatBytes(statsResponse.totalSize || 0)}`);
  }
  
  return statsResponse;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZERO-TRUST AUDIT INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify all pruned data still has valid ID pointers
 * This ensures audit trail integrity after maintenance
 */
function verifyAuditTrailIntegrity() {
  Logger.log(`\n🔍 VERIFYING AUDIT TRAIL INTEGRITY...`);
  
  const integrityResponse = callGateway('verify_audit_integrity', {
    tables: ['link_forensics', 'competitor_results', 'ai_analysis', 'job_results']
  });
  
  if (integrityResponse.success) {
    Logger.log(`   ✅ Audit trail integrity verified`);
    Logger.log(`   • Orphaned records: ${integrityResponse.orphanedCount || 0}`);
    Logger.log(`   • Missing references: ${integrityResponse.missingRefs || 0}`);
  } else {
    Logger.log(`   ⚠️ Integrity check failed: ${integrityResponse.error}`);
  }
  
  return integrityResponse;
}

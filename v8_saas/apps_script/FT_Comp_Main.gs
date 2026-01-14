/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Comp_Main.gs - COMPETITOR FETCHER MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Main orchestrator for competitor keyword fetching
 * Coordinates queue, batch processing, and state management.
 * 
 * @module FT_Comp_Main
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const FT_CONFIG = {
  BATCH_SIZE: 50,
  MAX_EXECUTION_TIME_MS: 300000,  // 5 minutes
  RETRY_DELAY_MS: 2000,
  MAX_RETRIES: 3,
  TRIGGER_DELAY_MINUTES: 1,
  
  PROPS: {
    LAST_INDEX: 'FT_LastProcessedIndex',
    QUEUE: 'FT_KeywordQueue',
    RETRY_QUEUE: 'FT_RetryQueue',
    RESERVOIR: 'FT_MasterReservoir',
    STATUS: 'FT_ProcessingStatus',
    BATCH_ID: 'FT_CurrentBatchId',
    ERROR_LOG: 'FT_ErrorLog'
  },
  
  STATUS: {
    IDLE: 'IDLE',
    PROCESSING: 'PROCESSING',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
  }
};

const FT_STANDARD_COMPETITORS = [
  'ahrefs.com', 'semrush.com', 'surferseo.com',
  'jasper.com', 'ubersuggest.com', 'moz.com'
];

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API - Trigger Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Continue processing the next batch (called by time trigger)
 */
function FT_ContinueBatch() {
  LOG_info('FT_Main', 'Continuing batch processing...');
  const processor = new FT_BatchProcessor();
  return processor.processBatch();
}

/**
 * Start a new fetch operation
 * @param {Array} competitors - Competitor objects
 * @param {Object} geminiData - Gemini analysis data
 * @return {Object} Initialization result
 */
function FT_StartFetch(competitors, geminiData) {
  LOG_info('FT_Main', 'Starting new fetch operation', { 
    competitors: competitors?.length || 0 
  });
  
  const processor = new FT_BatchProcessor();
  return processor.initializeFetch(competitors, geminiData);
}

/**
 * Get current fetch status
 * @return {Object} Status object
 */
function FT_GetStatus() {
  const processor = new FT_BatchProcessor();
  return processor.getStatus();
}

/**
 * Pause the current fetch
 * @return {Object} Pause result
 */
function FT_PauseFetch() {
  LOG_info('FT_Main', 'Pausing fetch operation');
  const processor = new FT_BatchProcessor();
  return processor.pauseFetch();
}

/**
 * Resume a paused fetch
 * @return {Object} Resume result
 */
function FT_ResumeFetch() {
  LOG_info('FT_Main', 'Resuming fetch operation');
  const processor = new FT_BatchProcessor();
  return processor.resumeFetch();
}

/**
 * Get the processed keyword reservoir
 * @return {Object} Reservoir data
 */
function FT_GetReservoir() {
  return FT_State_loadReservoir();
}

/**
 * Clear all fetch state and reset
 * @return {Object} Clear result
 */
function FT_ClearState() {
  LOG_info('FT_Main', 'Clearing all fetch state');
  FT_State_clearAll();
  return { success: true, message: 'State cleared' };
}

/**
 * Save reservoir to Google Drive
 * @return {Object} Save result
 */
function FT_SaveToDrive() {
  try {
    const reservoir = FT_State_loadReservoir();
    if (!reservoir) {
      return { success: false, error: 'No reservoir to save' };
    }
    
    const filename = `FT_Reservoir_${new Date().toISOString().split('T')[0]}.json`;
    const blob = Utilities.newBlob(JSON.stringify(reservoir, null, 2), 'application/json', filename);
    const file = DriveApp.createFile(blob);
    
    LOG_info('FT_Main', 'Reservoir saved to Drive', { fileId: file.getId() });
    return { success: true, fileId: file.getId(), filename: filename };
  } catch (error) {
    return CORE_handleError('FT_Main', 'SaveToDrive', error);
  }
}

/**
 * Load reservoir from Drive file
 * @param {string} fileId - Drive file ID
 * @return {Object} Load result
 */
function FT_LoadFromDrive(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    const reservoir = JSON.parse(content);
    
    FT_State_saveReservoir(reservoir);
    LOG_info('FT_Main', 'Reservoir loaded from Drive', { fileId: fileId });
    return { success: true, reservoir: reservoir };
  } catch (error) {
    return CORE_handleError('FT_Main', 'LoadFromDrive', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH PROCESSOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FT_BatchProcessor - Orchestrates batch keyword processing
 */
class FT_BatchProcessor {
  constructor() {
    this.scriptProps = PropertiesService.getScriptProperties();
    this.startTime = Date.now();
    this.batchId = this._generateBatchId();
  }
  
  /**
   * Initialize a new fetch operation
   */
  initializeFetch(competitors, geminiData) {
    LOG_info('FT_Main', 'Initializing 450-KW Forensic Fetch');
    
    try {
      FT_State_clearAll();
      
      const keywordQueue = FT_Queue_generate(competitors, geminiData);
      LOG_info('FT_Main', `Generated ${keywordQueue.length} keywords`);
      
      FT_State_storeQueue(keywordQueue);
      FT_State_initReservoir();
      FT_State_setStatus(FT_CONFIG.STATUS.PROCESSING);
      this.scriptProps.setProperty(FT_CONFIG.PROPS.LAST_INDEX, '0');
      this.scriptProps.setProperty(FT_CONFIG.PROPS.BATCH_ID, this.batchId);
      
      this.processBatch();
      
      return {
        success: true,
        batchId: this.batchId,
        totalKeywords: keywordQueue.length,
        status: FT_CONFIG.STATUS.PROCESSING
      };
    } catch (error) {
      return CORE_handleError('FT_Main', 'initializeFetch', error);
    }
  }
  
  /**
   * Process a batch of keywords
   */
  processBatch() {
    LOG_info('FT_Main', `Processing Batch [${this.batchId}]`);
    
    const status = FT_State_getStatus();
    if (status === FT_CONFIG.STATUS.COMPLETED) {
      return { complete: true };
    }
    if (status === FT_CONFIG.STATUS.PAUSED) {
      return { paused: true };
    }
    
    try {
      return FT_Batch_process(this);
    } catch (error) {
      FT_State_setStatus(FT_CONFIG.STATUS.ERROR);
      return CORE_handleError('FT_Main', 'processBatch', error);
    }
  }
  
  /**
   * Resume a paused fetch
   */
  resumeFetch() {
    FT_State_setStatus(FT_CONFIG.STATUS.PROCESSING);
    return this.processBatch();
  }
  
  /**
   * Pause the fetch
   */
  pauseFetch() {
    FT_State_setStatus(FT_CONFIG.STATUS.PAUSED);
    FT_State_cleanupTriggers();
    return { paused: true };
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return FT_State_getFullStatus();
  }
  
  /**
   * Check if timeout is approaching
   */
  isTimeoutApproaching() {
    return (Date.now() - this.startTime) > FT_CONFIG.MAX_EXECUTION_TIME_MS;
  }
  
  _generateBatchId() {
    return 'B' + Date.now().toString(36).toUpperCase();
  }
}

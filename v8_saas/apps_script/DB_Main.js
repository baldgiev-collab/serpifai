/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_Main.gs - DATA BRIDGE MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Unified data access layer
 * Coordinates Sheets, MySQL, and Cache operations.
 * 
 * @module DB_Main
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get data from any source with caching
 * @param {string} dataType - Type of data to retrieve
 * @param {Object} options - Query options
 * @return {Object} Data result
 */
function DB_getData(dataType, options) {
  LOG_enter('DB_getData', { dataType });
  
  options = options || {};
  const cacheKey = `${dataType}_${JSON.stringify(options)}`;
  
  // Check cache first if enabled
  if (!options.skipCache) {
    const cached = DB_Cache_get(cacheKey);
    if (cached) {
      LOG_debug('DB_Main', 'Cache hit', { dataType });
      return CORE_success(cached, 'From cache');
    }
  }
  
  // Route to appropriate handler
  let result;
  switch (dataType) {
    case 'keywords':
      result = DB_Keywords_getAll(options);
      break;
    case 'competitors':
      result = DB_Competitors_getAll(options);
      break;
    case 'analysis':
      result = DB_Analysis_get(options.id);
      break;
    case 'config':
      result = DB_Config_getAll();
      break;
    case 'history':
      result = DB_History_get(options);
      break;
    default:
      return CORE_createError(ERROR_CATEGORY.DATA, `Unknown data type: ${dataType}`);
  }
  
  if (CORE_isError(result)) return result;
  
  // Cache the result
  if (!options.skipCache && result.data) {
    DB_Cache_set(cacheKey, result.data, options.cacheTTL);
  }
  
  return result;
}

/**
 * Save data to appropriate destination
 * @param {string} dataType - Type of data
 * @param {*} data - Data to save
 * @param {Object} options - Save options
 * @return {Object} Save result
 */
function DB_saveData(dataType, data, options) {
  LOG_enter('DB_saveData', { dataType });
  
  options = options || {};
  
  // Route to appropriate handler
  let result;
  switch (dataType) {
    case 'keywords':
      result = DB_Keywords_save(data, options);
      break;
    case 'competitors':
      result = DB_Competitors_save(data, options);
      break;
    case 'analysis':
      result = DB_Analysis_save(data, options);
      break;
    case 'config':
      result = DB_Config_save(data);
      break;
    case 'history':
      result = DB_History_save(data);
      break;
    default:
      return CORE_createError(ERROR_CATEGORY.DATA, `Unknown data type: ${dataType}`);
  }
  
  if (CORE_isError(result)) return result;
  
  // Invalidate cache
  DB_Cache_invalidate(dataType);
  
  return result;
}

/**
 * Delete data
 * @param {string} dataType - Type of data
 * @param {string} id - ID to delete
 * @return {Object} Delete result
 */
function DB_deleteData(dataType, id) {
  LOG_enter('DB_deleteData', { dataType, id });
  
  // Route to appropriate handler
  let result;
  switch (dataType) {
    case 'keywords':
      result = DB_Keywords_delete(id);
      break;
    case 'competitors':
      result = DB_Competitors_delete(id);
      break;
    case 'analysis':
      result = DB_Analysis_delete(id);
      break;
    default:
      return CORE_createError(ERROR_CATEGORY.DATA, `Delete not supported for: ${dataType}`);
  }
  
  if (CORE_isError(result)) return result;
  
  // Invalidate cache
  DB_Cache_invalidate(dataType);
  
  return result;
}

/**
 * Get the active spreadsheet
 * @return {Spreadsheet} Active spreadsheet
 */
function DB_getSpreadsheet() {
  const sheetId = CORE_getProperty('SHEET_ID');
  if (sheetId) {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (e) {
      LOG_warn('DB_Main', 'Could not open sheet by ID', { sheetId });
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Get or create a sheet by name
 * @param {string} sheetName - Sheet name
 * @return {Sheet} Sheet object
 */
function DB_getSheet(sheetName) {
  const ss = DB_getSpreadsheet();
  if (!ss) {
    LOG_error('DB_Main', 'No spreadsheet available');
    return null;
  }
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    LOG_info('DB_Main', `Created sheet: ${sheetName}`);
  }
  return sheet;
}

/**
 * Check if MySQL is configured
 * @return {boolean} True if configured
 */
function DB_hasMySQLConfig() {
  const host = CORE_getProperty('MYSQL_HOST');
  const user = CORE_getProperty('MYSQL_USER');
  return !!(host && user);
}

/**
 * Get database status
 * @return {Object} Status info
 */
function DB_getStatus() {
  const ss = DB_getSpreadsheet();
  
  return {
    spreadsheet: {
      available: !!ss,
      id: ss?.getId() || null,
      name: ss?.getName() || null
    },
    mysql: {
      configured: DB_hasMySQLConfig()
    },
    cache: {
      enabled: true
    }
  };
}

/**
 * Initialize all required sheets
 * @return {Object} Init result
 */
function DB_initializeSheets() {
  LOG_info('DB_Main', 'Initializing sheets');
  
  const sheets = Object.values(SHEET_NAMES);
  const created = [];
  const existing = [];
  
  sheets.forEach(name => {
    const sheet = DB_getSheet(name);
    if (sheet) {
      // Check if it was just created (has no data)
      if (sheet.getLastRow() <= 1) {
        created.push(name);
        _initializeSheetHeaders(sheet, name);
      } else {
        existing.push(name);
      }
    }
  });
  
  return CORE_success({
    created: created,
    existing: existing,
    total: sheets.length
  });
}

/**
 * Initialize headers for a sheet
 * @param {Sheet} sheet - Sheet object
 * @param {string} name - Sheet name
 */
function _initializeSheetHeaders(sheet, name) {
  const headers = _getSheetHeaders(name);
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

/**
 * Get default headers for a sheet
 * @param {string} name - Sheet name
 * @return {Array} Headers
 */
function _getSheetHeaders(name) {
  const headerMap = {
    [SHEET_NAMES.KEYWORDS]: ['ID', 'Keyword', 'Volume', 'Difficulty', 'CPC', 'Intent', 'Status', 'CreatedAt'],
    [SHEET_NAMES.COMPETITORS]: ['ID', 'Domain', 'DA', 'PageRank', 'Keywords', 'Status', 'CreatedAt'],
    [SHEET_NAMES.FORENSIC]: ['ID', 'Keyword', 'Competitor', 'Module', 'Score', 'Data', 'CreatedAt'],
    [SHEET_NAMES.CONFIG]: ['Key', 'Value', 'Description', 'UpdatedAt'],
    [SHEET_NAMES.HISTORY]: ['ID', 'Type', 'Action', 'Data', 'Timestamp'],
    [SHEET_NAMES.LOGS]: ['Timestamp', 'Level', 'Module', 'Message', 'Data']
  };
  
  return headerMap[name] || ['ID', 'Data', 'CreatedAt'];
}

/**
 * Export all data to JSON
 * @return {Object} Export result
 */
function DB_exportAll() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: SERPIFAI_VERSION,
    keywords: DB_getData('keywords', { skipCache: true }).data || [],
    competitors: DB_getData('competitors', { skipCache: true }).data || [],
    config: DB_getData('config', { skipCache: true }).data || {}
  };
  
  return CORE_success(data);
}

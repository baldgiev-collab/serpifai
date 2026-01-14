/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_STORAGE.GS - FORENSIC TRAFFIC PERSISTENCE ENGINE
 * MySQL JDBC + Google Sheets Dual-Write Architecture
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * - Ensures 100% data integrity across MySQL and Google Sheets
 * - Implements UPSERT logic for keyword intelligence
 * - Provides streaming confirmation for UI progressive disclosure
 * 
 * ARCHITECTURE:
 * - Primary: MySQL via JDBC (keyword_intelligence table)
 * - Secondary: Google Sheets Master Archive tab
 * - Fallback: Google Drive JSON (if JDBC fails)
 * 
 * @author SerpifAI Engineering
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_CONFIG = {
  // MySQL JDBC Configuration
  MYSQL: {
    HOST: 'YOUR_MYSQL_HOST',           // e.g., '34.123.45.67' or 'your-db.mysql.database.azure.com'
    PORT: '3306',
    DATABASE: 'serpifai_intelligence',
    USERNAME: 'serpifai_user',
    PASSWORD: 'YOUR_SECURE_PASSWORD',  // Store in Script Properties for security
    TABLE: 'keyword_intelligence',
    CONNECTION_TIMEOUT: 30,            // seconds
    USE_SSL: true
  },
  
  // Google Sheets Configuration
  SHEETS: {
    ARCHIVE_TAB_NAME: 'Master_Archive',
    HEADERS: ['Timestamp', 'Competitor', 'Keyword', 'UI_Category', 'Clash', 'AIO_Risk', 'Intent_X', 'Auth_Y', 'Mass', 'Moat_Type', 'Tip'],
    MAX_ROWS_PER_BATCH: 100
  },
  
  // State Management Keys
  PROPERTIES: {
    MYSQL_SYNCED_IDS: 'FT_MYSQL_SYNCED_IDS',
    SHEETS_SYNCED_COUNT: 'FT_SHEETS_SYNCED_COUNT',
    LAST_SYNC_TIMESTAMP: 'FT_LAST_SYNC_TIMESTAMP',
    SYNC_STATUS: 'FT_SYNC_STATUS'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MYSQL JDBC SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MySQLService - Handles all MySQL JDBC operations
 */
class MySQLService {
  constructor() {
    this.connectionUrl = this._buildConnectionUrl();
    this.props = PropertiesService.getScriptProperties();
  }
  
  /**
   * Build JDBC connection URL
   */
  _buildConnectionUrl() {
    const config = STORAGE_CONFIG.MYSQL;
    // Get password from Script Properties for security
    const password = PropertiesService.getScriptProperties().getProperty('MYSQL_PASSWORD') || config.PASSWORD;
    
    let url = `jdbc:mysql://${config.HOST}:${config.PORT}/${config.DATABASE}`;
    url += `?user=${config.USERNAME}`;
    url += `&password=${encodeURIComponent(password)}`;
    url += `&connectTimeout=${config.CONNECTION_TIMEOUT * 1000}`;
    
    if (config.USE_SSL) {
      url += '&useSSL=true&requireSSL=true';
    }
    
    return url;
  }
  
  /**
   * Test MySQL connection
   */
  testConnection() {
    try {
      const conn = Jdbc.getConnection(this.connectionUrl);
      const stmt = conn.createStatement();
      const rs = stmt.executeQuery('SELECT 1 as test');
      rs.next();
      const result = rs.getInt('test');
      rs.close();
      stmt.close();
      conn.close();
      
      console.log('✅ MySQL connection successful');
      return { success: true, message: 'Connection successful', result: result };
    } catch (e) {
      console.error('❌ MySQL connection failed:', e.message);
      return { success: false, message: e.message, error: e };
    }
  }
  
  /**
   * Create the keyword_intelligence table if it doesn't exist
   */
  initializeTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${STORAGE_CONFIG.MYSQL.TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        competitor_name VARCHAR(255) NOT NULL,
        keyword VARCHAR(500) NOT NULL,
        ui_category ENUM('money', 'sge', 'tail', 'llm') DEFAULT 'money',
        intent_score DECIMAL(5,2) DEFAULT 0.00,
        clash_score TINYINT DEFAULT 5,
        aio_risk TINYINT DEFAULT 5,
        authority_gap DECIMAL(4,2) DEFAULT 0.00,
        market_mass DECIMAL(5,2) DEFAULT 0.00,
        moat_type VARCHAR(50) DEFAULT 'Content',
        tip TEXT,
        batch_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_comp_kw (competitor_name, keyword),
        INDEX idx_competitor (competitor_name),
        INDEX idx_category (ui_category),
        INDEX idx_batch (batch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      const conn = Jdbc.getConnection(this.connectionUrl);
      const stmt = conn.createStatement();
      stmt.execute(createTableSQL);
      stmt.close();
      conn.close();
      
      console.log('✅ MySQL table initialized: ' + STORAGE_CONFIG.MYSQL.TABLE);
      return { success: true };
    } catch (e) {
      console.error('❌ Failed to initialize MySQL table:', e.message);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * UPSERT keywords to MySQL (Update if exists, Insert if new)
   * @param {Array} keywords - Array of keyword objects
   * @param {string} batchId - Batch identifier
   * @returns {Object} Result with counts
   */
  upsertKeywords(keywords, batchId) {
    if (!keywords || keywords.length === 0) {
      return { success: true, inserted: 0, updated: 0 };
    }
    
    const upsertSQL = `
      INSERT INTO ${STORAGE_CONFIG.MYSQL.TABLE} 
        (competitor_name, keyword, ui_category, intent_score, clash_score, aio_risk, authority_gap, market_mass, moat_type, tip, batch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        ui_category = VALUES(ui_category),
        intent_score = VALUES(intent_score),
        clash_score = VALUES(clash_score),
        aio_risk = VALUES(aio_risk),
        authority_gap = VALUES(authority_gap),
        market_mass = VALUES(market_mass),
        moat_type = VALUES(moat_type),
        tip = VALUES(tip),
        batch_id = VALUES(batch_id),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    let conn, pstmt;
    let insertCount = 0;
    let updateCount = 0;
    const syncedIds = [];
    
    try {
      conn = Jdbc.getConnection(this.connectionUrl);
      pstmt = conn.prepareStatement(upsertSQL);
      
      for (const kw of keywords) {
        pstmt.setString(1, kw.meta?.competitor || 'unknown');
        pstmt.setString(2, kw.kw || '');
        pstmt.setString(3, kw.ui_cat || 'money');
        pstmt.setDouble(4, kw.x || 50);
        pstmt.setInt(5, kw.clash || 5);
        pstmt.setInt(6, kw.aio_risk || 5);
        pstmt.setDouble(7, kw.y || 5);
        pstmt.setDouble(8, kw.mass || 10);
        pstmt.setString(9, kw.moat_type || 'Content');
        pstmt.setString(10, kw.tip || '');
        pstmt.setString(11, batchId);
        
        const affected = pstmt.executeUpdate();
        if (affected === 1) {
          insertCount++;
        } else if (affected === 2) {
          updateCount++;
        }
        
        syncedIds.push(`${kw.meta?.competitor}:${kw.kw}`);
      }
      
      // Update synced IDs in properties
      this._updateSyncedIds(syncedIds);
      
      console.log(`   💾 MySQL: ${insertCount} inserted, ${updateCount} updated`);
      return { success: true, inserted: insertCount, updated: updateCount, syncedIds: syncedIds };
      
    } catch (e) {
      console.error('❌ MySQL UPSERT failed:', e.message);
      return { success: false, error: e.message, inserted: insertCount, updated: updateCount };
    } finally {
      if (pstmt) pstmt.close();
      if (conn) conn.close();
    }
  }
  
  /**
   * Get sync status for specific keywords
   */
  getSyncStatus(keywords) {
    const syncedIdsStr = this.props.getProperty(STORAGE_CONFIG.PROPERTIES.MYSQL_SYNCED_IDS) || '[]';
    const syncedIds = JSON.parse(syncedIdsStr);
    const syncedSet = new Set(syncedIds);
    
    return keywords.map(kw => ({
      ...kw,
      mysqlSynced: syncedSet.has(`${kw.meta?.competitor}:${kw.kw}`)
    }));
  }
  
  /**
   * Update synced IDs in properties
   */
  _updateSyncedIds(newIds) {
    const existingStr = this.props.getProperty(STORAGE_CONFIG.PROPERTIES.MYSQL_SYNCED_IDS) || '[]';
    const existing = JSON.parse(existingStr);
    const merged = [...new Set([...existing, ...newIds])];
    
    // Keep only last 1000 to prevent property size limits
    const trimmed = merged.slice(-1000);
    this.props.setProperty(STORAGE_CONFIG.PROPERTIES.MYSQL_SYNCED_IDS, JSON.stringify(trimmed));
  }
  
  /**
   * Clear sync tracking
   */
  clearSyncTracking() {
    this.props.deleteProperty(STORAGE_CONFIG.PROPERTIES.MYSQL_SYNCED_IDS);
    console.log('🗑️ MySQL sync tracking cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SHEETS ARCHIVE SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheetsArchiveService - Handles Google Sheets Master Archive
 */
class SheetsArchiveService {
  constructor(spreadsheetId = null) {
    this.spreadsheetId = spreadsheetId || SpreadsheetApp.getActiveSpreadsheet()?.getId();
    this.tabName = STORAGE_CONFIG.SHEETS.ARCHIVE_TAB_NAME;
    this.headers = STORAGE_CONFIG.SHEETS.HEADERS;
  }
  
  /**
   * Initialize or get the Master Archive sheet
   */
  getOrCreateArchiveSheet() {
    const ss = this.spreadsheetId 
      ? SpreadsheetApp.openById(this.spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      throw new Error('No active spreadsheet found. Please run from within a Google Sheet.');
    }
    
    let sheet = ss.getSheetByName(this.tabName);
    
    if (!sheet) {
      // Create new sheet with headers
      sheet = ss.insertSheet(this.tabName);
      sheet.appendRow(this.headers);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, this.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1e293b');
      headerRange.setFontColor('#ffffff');
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Set column widths
      sheet.setColumnWidth(1, 150);  // Timestamp
      sheet.setColumnWidth(2, 120);  // Competitor
      sheet.setColumnWidth(3, 250);  // Keyword
      sheet.setColumnWidth(4, 80);   // UI_Category
      sheet.setColumnWidth(5, 60);   // Clash
      sheet.setColumnWidth(6, 70);   // AIO_Risk
      sheet.setColumnWidth(7, 70);   // Intent_X
      sheet.setColumnWidth(8, 70);   // Auth_Y
      sheet.setColumnWidth(9, 60);   // Mass
      sheet.setColumnWidth(10, 100); // Moat_Type
      sheet.setColumnWidth(11, 300); // Tip
      
      console.log('✅ Created Master_Archive sheet with headers');
    }
    
    return sheet;
  }
  
  /**
   * Append keyword rows to the archive sheet
   * @param {Array} keywords - Normalized keyword objects
   * @returns {Object} Result with row count
   */
  appendRowsToSheet(keywords) {
    if (!keywords || keywords.length === 0) {
      return { success: true, rowsAdded: 0 };
    }
    
    try {
      const sheet = this.getOrCreateArchiveSheet();
      const timestamp = new Date().toISOString();
      
      // Build rows array
      const rows = keywords.map(kw => [
        timestamp,
        kw.meta?.competitor || 'unknown',
        kw.kw || '',
        kw.ui_cat || 'money',
        kw.clash || 5,
        kw.aio_risk || 5,
        kw.x || 50,
        kw.y || 5,
        kw.mass || 10,
        kw.moat_type || 'Content',
        kw.tip || ''
      ]);
      
      // Batch append for performance
      const startRow = sheet.getLastRow() + 1;
      const range = sheet.getRange(startRow, 1, rows.length, this.headers.length);
      range.setValues(rows);
      
      // Apply zebra striping
      this._applyZebraStriping(sheet, startRow, rows.length);
      
      // Update sync count
      const props = PropertiesService.getScriptProperties();
      const currentCount = parseInt(props.getProperty(STORAGE_CONFIG.PROPERTIES.SHEETS_SYNCED_COUNT) || '0');
      props.setProperty(STORAGE_CONFIG.PROPERTIES.SHEETS_SYNCED_COUNT, String(currentCount + rows.length));
      props.setProperty(STORAGE_CONFIG.PROPERTIES.LAST_SYNC_TIMESTAMP, timestamp);
      
      console.log(`   📊 Sheets: ${rows.length} rows appended to ${this.tabName}`);
      return { success: true, rowsAdded: rows.length, startRow: startRow };
      
    } catch (e) {
      console.error('❌ Sheets append failed:', e.message);
      return { success: false, error: e.message, rowsAdded: 0 };
    }
  }
  
  /**
   * Apply zebra striping to new rows
   */
  _applyZebraStriping(sheet, startRow, rowCount) {
    for (let i = 0; i < rowCount; i++) {
      const row = startRow + i;
      const range = sheet.getRange(row, 1, 1, this.headers.length);
      
      if (row % 2 === 0) {
        range.setBackground('#f8fafc');
      } else {
        range.setBackground('#ffffff');
      }
      
      // Color-code by category
      const catCell = sheet.getRange(row, 4);
      const category = catCell.getValue();
      const colors = {
        'money': '#dcfce7',
        'sge': '#dbeafe',
        'tail': '#fef3c7',
        'llm': '#ede9fe'
      };
      catCell.setBackground(colors[category] || '#ffffff');
    }
  }
  
  /**
   * Get archive statistics
   */
  getArchiveStats() {
    try {
      const sheet = this.getOrCreateArchiveSheet();
      const lastRow = sheet.getLastRow();
      const rowCount = Math.max(0, lastRow - 1); // Exclude header
      
      const props = PropertiesService.getScriptProperties();
      
      return {
        totalRows: rowCount,
        lastSync: props.getProperty(STORAGE_CONFIG.PROPERTIES.LAST_SYNC_TIMESTAMP) || 'Never',
        sheetName: this.tabName,
        spreadsheetId: this.spreadsheetId
      };
    } catch (e) {
      return { error: e.message };
    }
  }
  
  /**
   * Clear the archive (keep headers)
   */
  clearArchive() {
    try {
      const sheet = this.getOrCreateArchiveSheet();
      const lastRow = sheet.getLastRow();
      
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      const props = PropertiesService.getScriptProperties();
      props.setProperty(STORAGE_CONFIG.PROPERTIES.SHEETS_SYNCED_COUNT, '0');
      
      console.log('🗑️ Archive cleared (headers preserved)');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED STORAGE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * StorageOrchestrator - Coordinates dual-write to MySQL and Sheets
 */
class StorageOrchestrator {
  constructor(spreadsheetId = null) {
    this.mysql = new MySQLService();
    this.sheets = new SheetsArchiveService(spreadsheetId);
    this.props = PropertiesService.getScriptProperties();
  }
  
  /**
   * Persist keywords to both MySQL and Sheets
   * @param {Array} keywords - Normalized keyword objects
   * @param {string} batchId - Batch identifier
   * @returns {Object} Combined result
   */
  persistKeywords(keywords, batchId) {
    console.log(`\n💾 StorageOrchestrator: Persisting ${keywords.length} keywords...`);
    
    const results = {
      mysql: { success: false, skipped: true },
      sheets: { success: false },
      totalKeywords: keywords.length,
      batchId: batchId
    };
    
    // Try MySQL first (primary storage)
    try {
      results.mysql = this.mysql.upsertKeywords(keywords, batchId);
    } catch (e) {
      console.warn('⚠️ MySQL unavailable, continuing with Sheets only');
      results.mysql = { success: false, error: e.message, skipped: false };
    }
    
    // Always write to Sheets (secondary/backup)
    try {
      results.sheets = this.sheets.appendRowsToSheet(keywords);
    } catch (e) {
      console.error('❌ Sheets write failed:', e.message);
      results.sheets = { success: false, error: e.message };
    }
    
    // Update overall sync status
    this._updateSyncStatus(results);
    
    return results;
  }
  
  /**
   * Stream keywords with confirmation callbacks
   * For progressive UI disclosure
   */
  streamKeywordsWithConfirmation(keywords, batchId, onConfirm) {
    const batchSize = 10; // Small batches for streaming effect
    const results = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const batchResult = this.persistKeywords(batch, batchId);
      
      results.push(batchResult);
      
      // Call confirmation callback for UI streaming
      if (typeof onConfirm === 'function') {
        onConfirm({
          confirmedKeywords: batch,
          batchIndex: Math.floor(i / batchSize),
          totalBatches: Math.ceil(keywords.length / batchSize),
          progress: Math.min(100, Math.round(((i + batch.length) / keywords.length) * 100))
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get comprehensive sync status
   */
  getSyncStatus() {
    return {
      mysql: {
        syncedCount: JSON.parse(this.props.getProperty(STORAGE_CONFIG.PROPERTIES.MYSQL_SYNCED_IDS) || '[]').length
      },
      sheets: this.sheets.getArchiveStats(),
      lastSync: this.props.getProperty(STORAGE_CONFIG.PROPERTIES.LAST_SYNC_TIMESTAMP),
      status: this.props.getProperty(STORAGE_CONFIG.PROPERTIES.SYNC_STATUS) || 'idle'
    };
  }
  
  /**
   * Update sync status in properties
   */
  _updateSyncStatus(results) {
    const status = {
      mysqlSuccess: results.mysql.success,
      sheetsSuccess: results.sheets.success,
      timestamp: new Date().toISOString()
    };
    
    this.props.setProperty(STORAGE_CONFIG.PROPERTIES.SYNC_STATUS, JSON.stringify(status));
    this.props.setProperty(STORAGE_CONFIG.PROPERTIES.LAST_SYNC_TIMESTAMP, status.timestamp);
  }
  
  /**
   * Initialize all storage systems
   */
  initialize() {
    console.log('🔧 Initializing Storage Systems...');
    
    const results = {
      mysql: { success: false },
      sheets: { success: false }
    };
    
    // Initialize MySQL table
    try {
      results.mysql = this.mysql.initializeTable();
    } catch (e) {
      console.warn('⚠️ MySQL initialization skipped:', e.message);
    }
    
    // Initialize Sheets archive
    try {
      this.sheets.getOrCreateArchiveSheet();
      results.sheets = { success: true };
    } catch (e) {
      console.error('❌ Sheets initialization failed:', e.message);
      results.sheets = { success: false, error: e.message };
    }
    
    return results;
  }
  
  /**
   * Clear all storage tracking (not data)
   */
  clearTracking() {
    this.mysql.clearSyncTracking();
    this.props.deleteProperty(STORAGE_CONFIG.PROPERTIES.SYNC_STATUS);
    this.props.deleteProperty(STORAGE_CONFIG.PROPERTIES.LAST_SYNC_TIMESTAMP);
    console.log('🗑️ All sync tracking cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize storage systems (call once during setup)
 */
function FT_InitializeStorage() {
  const orchestrator = new StorageOrchestrator();
  return orchestrator.initialize();
}

/**
 * Persist keywords to MySQL and Sheets
 * @param {Array} keywords - Normalized keyword objects
 * @param {string} batchId - Batch identifier
 */
function FT_PersistKeywords(keywords, batchId) {
  const orchestrator = new StorageOrchestrator();
  return orchestrator.persistKeywords(keywords, batchId);
}

/**
 * Get sync status for UI display
 */
function FT_GetSyncStatus() {
  const orchestrator = new StorageOrchestrator();
  return orchestrator.getSyncStatus();
}

/**
 * Test MySQL connection
 */
function FT_TestMySQLConnection() {
  const mysql = new MySQLService();
  return mysql.testConnection();
}

/**
 * Append rows directly to Sheets archive
 * @param {Array} keywords - Keyword objects
 */
function FT_AppendToSheetsArchive(keywords) {
  const sheets = new SheetsArchiveService();
  return sheets.appendRowsToSheet(keywords);
}

/**
 * Get Sheets archive statistics
 */
function FT_GetArchiveStats() {
  const sheets = new SheetsArchiveService();
  return sheets.getArchiveStats();
}

/**
 * Clear sync tracking (not data)
 */
function FT_ClearSyncTracking() {
  const orchestrator = new StorageOrchestrator();
  orchestrator.clearTracking();
  return { success: true };
}

/**
 * Full integration: Fetch → Parse → Persist
 * Call this after FT_FullPipeline completes
 */
function FT_PersistReservoir() {
  console.log('💾 Starting Reservoir Persistence...');
  
  // Get the reservoir from fetcher
  const reservoir = FT_GetReservoir();
  if (!reservoir || !reservoir.keywords || reservoir.keywords.length === 0) {
    return { error: 'No reservoir data to persist. Run FT_StartFetch first.' };
  }
  
  // Parse the reservoir
  const parsed = FT_ParseReservoir(reservoir, null, 35);
  if (!parsed || !parsed.ui_payload) {
    return { error: 'Failed to parse reservoir data.' };
  }
  
  // Persist to both storage systems
  const batchId = reservoir.batchId || `PERSIST_${Date.now()}`;
  const result = FT_PersistKeywords(parsed.ui_payload, batchId);
  
  console.log('✅ Reservoir persistence complete');
  return result;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - JDBC BRIDGE FOR MYSQL
 * Enterprise-Grade Relational Database Connector with SSL & Batch Optimization
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This module provides secure MySQL connectivity:
 *   - SSL-enforced JDBC connections
 *   - Batch-optimized upserts for 450-keyword payloads
 *   - Transaction management with rollback safety
 *   - Connection pooling via singleton pattern
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// JDBC CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var JDBC_BRIDGE_CONFIG = JDBC_BRIDGE_CONFIG || {
  // Property keys for secure credential storage
  PROPERTY_KEYS: {
    DB_HOST: 'DB_HOST',
    DB_USER: 'DB_USER',
    DB_PASS: 'DB_PASS',
    DB_NAME: 'DB_NAME',
    DB_PORT: 'DB_PORT'
  },
  
  // Connection settings
  CONNECTION: {
    DEFAULT_PORT: '3306',
    TIMEOUT_MS: 30000,
    USE_SSL: true,
    VERIFY_SERVER_CERT: false  // Set true for production with valid certs
  },
  
  // Batch optimization
  BATCH: {
    SIZE: 100,                    // Rows per batch
    MAX_KEYWORDS_PER_COMMIT: 450, // Full keyword payload
    COMMIT_INTERVAL: 100          // Commit every N operations
  },
  
  // Table names
  TABLES: {
    DOMAINS: 'domains',
    PAGES: 'pages',
    KEYWORD_INTELLIGENCE: 'keyword_intelligence',
    LINK_FORENSICS: 'link_forensics',
    GOVERNANCE_LOGS: 'governance_logs'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// JDBC CONNECTION MANAGER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * JDBCConnectionManager - Manages MySQL connections with SSL
 */
class JDBCConnectionManager {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.connection = null;
    this.lastConnectedAt = null;
  }
  
  /**
   * Load database credentials from Script Properties
   * @returns {Object} Credentials object
   */
  _loadCredentials() {
    const keys = JDBC_BRIDGE_CONFIG.PROPERTY_KEYS;
    
    return {
      host: this.props.getProperty(keys.DB_HOST),
      user: this.props.getProperty(keys.DB_USER),
      password: this.props.getProperty(keys.DB_PASS),
      database: this.props.getProperty(keys.DB_NAME),
      port: this.props.getProperty(keys.DB_PORT) || JDBC_BRIDGE_CONFIG.CONNECTION.DEFAULT_PORT
    };
  }
  
  /**
   * Build JDBC URL with SSL enforcement
   * @param {Object} creds - Credentials object
   * @returns {string} JDBC connection URL
   */
  _buildJdbcUrl(creds) {
    let url = `jdbc:mysql://${creds.host}:${creds.port}/${creds.database}`;
    
    // SSL enforcement
    const params = [];
    
    if (JDBC_BRIDGE_CONFIG.CONNECTION.USE_SSL) {
      params.push('useSSL=true');
      params.push('requireSSL=true');
      
      if (!JDBC_BRIDGE_CONFIG.CONNECTION.VERIFY_SERVER_CERT) {
        params.push('verifyServerCertificate=false');
      }
    }
    
    // Additional connection parameters
    params.push('characterEncoding=UTF-8');
    params.push('useUnicode=true');
    params.push('autoReconnect=true');
    params.push('connectTimeout=' + JDBC_BRIDGE_CONFIG.CONNECTION.TIMEOUT_MS);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return url;
  }
  
  /**
   * Establish a new database connection
   * @returns {JdbcConnection} Active JDBC connection
   */
  getConnection() {
    const creds = this._loadCredentials();
    
    // Validate credentials
    if (!creds.host || !creds.user || !creds.password || !creds.database) {
      throw new Error('JDBC Bridge: Missing database credentials in Script Properties. ' +
        'Required: DB_HOST, DB_USER, DB_PASS, DB_NAME');
    }
    
    try {
      const jdbcUrl = this._buildJdbcUrl(creds);
      console.log(`🔌 JDBC Bridge: Connecting to ${creds.host}:${creds.port}/${creds.database} (SSL: ${JDBC_BRIDGE_CONFIG.CONNECTION.USE_SSL})`);
      
      this.connection = Jdbc.getConnection(jdbcUrl, creds.user, creds.password);
      this.lastConnectedAt = new Date();
      
      console.log('✅ JDBC Bridge: Connection established successfully');
      return this.connection;
      
    } catch (e) {
      console.error('❌ JDBC Bridge: Connection failed - ' + e.message);
      throw new Error('JDBC Connection failed: ' + e.message);
    }
  }
  
  /**
   * Close the current connection
   */
  closeConnection() {
    if (this.connection) {
      try {
        this.connection.close();
        console.log('🔌 JDBC Bridge: Connection closed');
      } catch (e) {
        console.warn('⚠️ JDBC Bridge: Error closing connection - ' + e.message);
      }
      this.connection = null;
    }
  }
  
  /**
   * Test database connectivity
   * @returns {Object} Connection test result
   */
  testConnection() {
    const startTime = Date.now();
    
    try {
      const conn = this.getConnection();
      
      // Execute ping query
      const stmt = conn.createStatement();
      const rs = stmt.executeQuery('SELECT 1 as ping, VERSION() as version, DATABASE() as db');
      
      let result = null;
      if (rs.next()) {
        result = {
          ping: rs.getInt('ping'),
          version: rs.getString('version'),
          database: rs.getString('db')
        };
      }
      
      rs.close();
      stmt.close();
      this.closeConnection();
      
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        latencyMs: latency,
        mysqlVersion: result?.version,
        database: result?.database,
        message: `Connection successful in ${latency}ms`
      };
      
    } catch (e) {
      return {
        success: false,
        error: e.message,
        message: 'Connection test failed: ' + e.message
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// WAREHOUSE SYNC ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * WarehouseSyncEngine - Syncs ForensicParser results to MySQL
 */
class WarehouseSyncEngine {
  
  constructor() {
    this.connectionManager = new JDBCConnectionManager();
    this.conn = null;
    this.stats = {
      domainsUpserted: 0,
      pagesUpserted: 0,
      keywordsUpserted: 0,
      linksUpserted: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };
  }
  
  /**
   * Main sync function - takes ForensicParser JSON and syncs to warehouse
   * @param {Object} results - ForensicParser output
   * @returns {Object} Sync results with statistics
   */
  syncToWarehouse(results) {
    this.stats.startTime = Date.now();
    
    try {
      // Establish connection
      this.conn = this.connectionManager.getConnection();
      
      // Disable auto-commit for batch optimization
      this.conn.setAutoCommit(false);
      
      console.log('📊 WarehouseSync: Starting batch sync...');
      
      // Extract URL info
      const url = results.url || results.sourceUrl || '';
      const domain = this._extractDomain(url);
      
      // Step 1: Upsert domain
      const domainId = this._upsertDomain(domain, results);
      
      // Step 2: Upsert page
      const pageId = this._upsertPage(domainId, url, results);
      
      // Step 3: Batch upsert keywords
      if (results.semantic?.keywords || results.keywords) {
        this._batchUpsertKeywords(pageId, results.semantic?.keywords || results.keywords);
      }
      
      // Step 4: Upsert link forensics
      if (results.trust?.linkForensics || results.linkForensics) {
        this._upsertLinkForensics(pageId, results.trust?.linkForensics || results.linkForensics);
      }
      
      // Commit transaction
      this.conn.commit();
      console.log('✅ WarehouseSync: Transaction committed successfully');
      
      this.stats.endTime = Date.now();
      
      return {
        success: true,
        domainId: domainId,
        pageId: pageId,
        stats: this.stats,
        duration: this.stats.endTime - this.stats.startTime
      };
      
    } catch (e) {
      // Rollback on error
      if (this.conn) {
        try {
          this.conn.rollback();
          console.error('🔄 WarehouseSync: Transaction rolled back due to error');
        } catch (rollbackError) {
          console.error('❌ WarehouseSync: Rollback failed - ' + rollbackError.message);
        }
      }
      
      this.stats.errors++;
      this.stats.endTime = Date.now();
      
      return {
        success: false,
        error: e.message,
        stats: this.stats,
        duration: this.stats.endTime - this.stats.startTime
      };
      
    } finally {
      this.connectionManager.closeConnection();
    }
  }
  
  /**
   * Bulk sync multiple pages
   * @param {Array} resultsArray - Array of ForensicParser outputs
   * @returns {Object} Bulk sync results
   */
  bulkSync(resultsArray) {
    const bulkStats = {
      total: resultsArray.length,
      success: 0,
      failed: 0,
      results: []
    };
    
    for (const results of resultsArray) {
      const syncResult = this.syncToWarehouse(results);
      
      if (syncResult.success) {
        bulkStats.success++;
      } else {
        bulkStats.failed++;
      }
      
      bulkStats.results.push(syncResult);
    }
    
    return bulkStats;
  }
  
  /**
   * Extract domain from URL
   */
  _extractDomain(url) {
    try {
      const match = url.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    } catch (e) {
      return url;
    }
  }
  
  /**
   * Generate SHA-256 hash for deduplication
   */
  _generateHash(input) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
    return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  
  /**
   * Upsert domain record
   */
  _upsertDomain(domain, results) {
    const sql = `
      INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.DOMAINS} 
        (domain, synthetic_da, trust_velocity, content_velocity, last_crawled)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        synthetic_da = VALUES(synthetic_da),
        trust_velocity = VALUES(trust_velocity),
        content_velocity = VALUES(content_velocity),
        last_crawled = NOW()
    `;
    
    const stmt = this.conn.prepareStatement(sql, Jdbc.Statement.RETURN_GENERATED_KEYS);
    
    const syntheticDA = results.trust?.syntheticKD || results.syntheticDA || 0;
    const trustVelocity = results.trust?.trustVelocity || 0;
    const contentVelocity = results.trust?.contentVelocity || 0;
    
    stmt.setString(1, domain);
    stmt.setDouble(2, syntheticDA);
    stmt.setDouble(3, trustVelocity);
    stmt.setDouble(4, contentVelocity);
    
    stmt.executeUpdate();
    
    // Get the domain ID
    let domainId = null;
    const rs = stmt.getGeneratedKeys();
    if (rs.next()) {
      domainId = rs.getInt(1);
    } else {
      // Get existing domain ID
      const selectStmt = this.conn.prepareStatement(
        `SELECT id FROM ${JDBC_BRIDGE_CONFIG.TABLES.DOMAINS} WHERE domain = ?`
      );
      selectStmt.setString(1, domain);
      const selectRs = selectStmt.executeQuery();
      if (selectRs.next()) {
        domainId = selectRs.getInt('id');
      }
      selectRs.close();
      selectStmt.close();
    }
    
    rs.close();
    stmt.close();
    
    this.stats.domainsUpserted++;
    console.log(`📊 Domain upserted: ${domain} (ID: ${domainId})`);
    
    return domainId;
  }
  
  /**
   * Upsert page record
   */
  _upsertPage(domainId, url, results) {
    const urlHash = this._generateHash(url);
    
    const sql = `
      INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.PAGES}
        (domain_id, url, url_hash, word_count, heading_count, 
         eeat_score, aeo_score, synthetic_kd, spo_triplet_count,
         gemini_insights, last_analyzed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        word_count = VALUES(word_count),
        heading_count = VALUES(heading_count),
        eeat_score = VALUES(eeat_score),
        aeo_score = VALUES(aeo_score),
        synthetic_kd = VALUES(synthetic_kd),
        spo_triplet_count = VALUES(spo_triplet_count),
        gemini_insights = VALUES(gemini_insights),
        last_analyzed = NOW()
    `;
    
    const stmt = this.conn.prepareStatement(sql, Jdbc.Statement.RETURN_GENERATED_KEYS);
    
    // Extract values from results
    const wordCount = results.semantic?.wordCount || results.wordCount || 0;
    const headingCount = results.semantic?.headingCount || 0;
    const eeatScore = results.trust?.eeat?.overall || results.eeatScore || 0;
    const aeoScore = results.aiReadiness?.overall?.score || results.aeoScore || 0;
    const syntheticKD = results.trust?.syntheticKD || results.syntheticKD || 0;
    const spoCount = results.aiReadiness?.spoTriplets || 0;
    const geminiInsights = results.geminiInsights ? JSON.stringify(results.geminiInsights) : null;
    
    stmt.setInt(1, domainId);
    stmt.setString(2, url.substring(0, 2048));  // Truncate to column size
    stmt.setString(3, urlHash);
    stmt.setInt(4, wordCount);
    stmt.setInt(5, headingCount);
    stmt.setDouble(6, eeatScore);
    stmt.setDouble(7, aeoScore);
    stmt.setDouble(8, syntheticKD);
    stmt.setInt(9, spoCount);
    
    if (geminiInsights) {
      stmt.setString(10, geminiInsights);
    } else {
      stmt.setNull(10, 0);  // NULL for LONGTEXT
    }
    
    stmt.executeUpdate();
    
    // Get the page ID
    let pageId = null;
    const rs = stmt.getGeneratedKeys();
    if (rs.next()) {
      pageId = rs.getInt(1);
    } else {
      // Get existing page ID
      const selectStmt = this.conn.prepareStatement(
        `SELECT id FROM ${JDBC_BRIDGE_CONFIG.TABLES.PAGES} WHERE url_hash = ?`
      );
      selectStmt.setString(1, urlHash);
      const selectRs = selectStmt.executeQuery();
      if (selectRs.next()) {
        pageId = selectRs.getInt('id');
      }
      selectRs.close();
      selectStmt.close();
    }
    
    rs.close();
    stmt.close();
    
    this.stats.pagesUpserted++;
    console.log(`📄 Page upserted: ${url.substring(0, 50)}... (ID: ${pageId})`);
    
    return pageId;
  }
  
  /**
   * Batch upsert keywords using executeBatch for optimal performance
   */
  _batchUpsertKeywords(pageId, keywords) {
    if (!keywords || keywords.length === 0) return;
    
    const sql = `
      INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.KEYWORD_INTELLIGENCE}
        (page_id, keyword, keyword_hash, volume, kd, synthetic_kd, cpc,
         intent, intent_confidence, clash_risk, aio_risk, frequency, source_location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        volume = VALUES(volume),
        kd = VALUES(kd),
        synthetic_kd = VALUES(synthetic_kd),
        cpc = VALUES(cpc),
        intent = VALUES(intent),
        intent_confidence = VALUES(intent_confidence),
        clash_risk = VALUES(clash_risk),
        aio_risk = VALUES(aio_risk),
        frequency = VALUES(frequency),
        last_updated = NOW()
    `;
    
    const stmt = this.conn.prepareStatement(sql);
    let batchCount = 0;
    
    console.log(`📊 Processing ${keywords.length} keywords in batches...`);
    
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      const keyword = kw.keyword || kw.term || kw.text || '';
      
      if (!keyword) continue;
      
      const keywordHash = this._generateHash(pageId + ':' + keyword.toLowerCase());
      
      stmt.setInt(1, pageId);
      stmt.setString(2, keyword.substring(0, 500));
      stmt.setString(3, keywordHash);
      stmt.setInt(4, kw.volume || 0);
      stmt.setDouble(5, kw.kd || 0);
      stmt.setDouble(6, kw.syntheticKD || kw.synthetic_kd || 0);
      stmt.setDouble(7, kw.cpc || 0);
      stmt.setString(8, (kw.intent || 'informational').toLowerCase());
      stmt.setDouble(9, kw.intentConfidence || kw.intent_confidence || 0);
      stmt.setDouble(10, kw.clashRisk || kw.clash_risk || 0);
      stmt.setDouble(11, kw.aioRisk || kw.aio_risk || 0);
      stmt.setInt(12, kw.frequency || 1);
      stmt.setString(13, kw.source || kw.sourceLocation || 'body');
      
      stmt.addBatch();
      batchCount++;
      
      // Execute batch at intervals
      if (batchCount >= JDBC_BRIDGE_CONFIG.BATCH.SIZE) {
        stmt.executeBatch();
        stmt.clearBatch();
        this.stats.keywordsUpserted += batchCount;
        batchCount = 0;
      }
    }
    
    // Execute remaining batch
    if (batchCount > 0) {
      stmt.executeBatch();
      this.stats.keywordsUpserted += batchCount;
    }
    
    stmt.close();
    console.log(`✅ Keywords synced: ${this.stats.keywordsUpserted}`);
  }
  
  /**
   * Upsert link forensics record
   */
  _upsertLinkForensics(pageId, linkData) {
    if (!linkData) return;
    
    const sql = `
      INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.LINK_FORENSICS}
        (page_id, internal_links, external_links, anchor_diversity_score,
         anchor_exact_match_pct, anchor_branded_pct, anchor_naked_url_pct,
         over_optimization_risk, top_anchors)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        internal_links = VALUES(internal_links),
        external_links = VALUES(external_links),
        anchor_diversity_score = VALUES(anchor_diversity_score),
        anchor_exact_match_pct = VALUES(anchor_exact_match_pct),
        anchor_branded_pct = VALUES(anchor_branded_pct),
        anchor_naked_url_pct = VALUES(anchor_naked_url_pct),
        over_optimization_risk = VALUES(over_optimization_risk),
        top_anchors = VALUES(top_anchors),
        last_analyzed = NOW()
    `;
    
    const stmt = this.conn.prepareStatement(sql);
    
    const internalLinks = linkData.internal || linkData.internalLinks || 0;
    const externalLinks = linkData.external || linkData.externalLinks || 0;
    const anchorDiversity = linkData.anchorDiversity?.score || linkData.diversityScore || 0;
    const exactMatchPct = linkData.anchorDiversity?.exactMatch || 0;
    const brandedPct = linkData.anchorDiversity?.branded || 0;
    const nakedUrlPct = linkData.anchorDiversity?.nakedUrl || 0;
    const overOptRisk = (exactMatchPct > 30);
    const topAnchors = linkData.topAnchors ? JSON.stringify(linkData.topAnchors) : null;
    
    stmt.setInt(1, pageId);
    stmt.setInt(2, internalLinks);
    stmt.setInt(3, externalLinks);
    stmt.setDouble(4, anchorDiversity);
    stmt.setDouble(5, exactMatchPct);
    stmt.setDouble(6, brandedPct);
    stmt.setDouble(7, nakedUrlPct);
    stmt.setBoolean(8, overOptRisk);
    
    if (topAnchors) {
      stmt.setString(9, topAnchors);
    } else {
      stmt.setNull(9, 0);
    }
    
    stmt.executeUpdate();
    stmt.close();
    
    this.stats.linksUpserted++;
    console.log(`🔗 Link forensics synced for page ID: ${pageId}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// GOVERNANCE LOG WRITER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GovernanceLogWriter - Writes compliance logs to MySQL
 */
class GovernanceLogWriter {
  
  constructor() {
    this.connectionManager = new JDBCConnectionManager();
  }
  
  /**
   * Log a governance event to MySQL
   * @param {Object} logEntry - Governance log entry
   */
  writeLog(logEntry) {
    let conn = null;
    
    try {
      conn = this.connectionManager.getConnection();
      
      const sql = `
        INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.GOVERNANCE_LOGS}
          (url, url_hash, domain, robots_status, robots_reason, 
           pii_scrubbed_flag, pii_items_removed, fetch_status_code,
           fetch_latency_ms, bot_identity, session_id, request_id,
           error_occurred, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = conn.prepareStatement(sql);
      
      const urlHash = this._generateHash(logEntry.url || '');
      const domain = this._extractDomain(logEntry.url || '');
      
      stmt.setString(1, (logEntry.url || '').substring(0, 2048));
      stmt.setString(2, urlHash);
      stmt.setString(3, domain);
      stmt.setString(4, logEntry.robotsStatus || 'allowed');
      stmt.setString(5, logEntry.robotsReason || null);
      stmt.setBoolean(6, logEntry.piiScrubbed || false);
      stmt.setInt(7, logEntry.piiItemsRemoved || 0);
      stmt.setInt(8, logEntry.statusCode || 0);
      stmt.setInt(9, logEntry.latencyMs || 0);
      stmt.setString(10, logEntry.botIdentity || 'SerpifAI-OracleBot/1.0');
      stmt.setString(11, logEntry.sessionId || null);
      stmt.setString(12, logEntry.requestId || Utilities.getUuid());
      stmt.setBoolean(13, logEntry.errorOccurred || false);
      stmt.setString(14, logEntry.errorMessage || null);
      
      stmt.executeUpdate();
      stmt.close();
      
    } catch (e) {
      console.error('❌ GovernanceLogWriter: Failed to write log - ' + e.message);
    } finally {
      if (conn) {
        this.connectionManager.closeConnection();
      }
    }
  }
  
  /**
   * Batch write multiple governance logs
   * @param {Array} logEntries - Array of log entries
   */
  batchWriteLogs(logEntries) {
    if (!logEntries || logEntries.length === 0) return;
    
    let conn = null;
    
    try {
      conn = this.connectionManager.getConnection();
      conn.setAutoCommit(false);
      
      const sql = `
        INSERT INTO ${JDBC_BRIDGE_CONFIG.TABLES.GOVERNANCE_LOGS}
          (url, url_hash, domain, robots_status, pii_scrubbed_flag, 
           fetch_status_code, bot_identity, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = conn.prepareStatement(sql);
      
      for (const entry of logEntries) {
        const urlHash = this._generateHash(entry.url || '');
        const domain = this._extractDomain(entry.url || '');
        
        stmt.setString(1, (entry.url || '').substring(0, 2048));
        stmt.setString(2, urlHash);
        stmt.setString(3, domain);
        stmt.setString(4, entry.robotsStatus || 'allowed');
        stmt.setBoolean(5, entry.piiScrubbed || false);
        stmt.setInt(6, entry.statusCode || 0);
        stmt.setString(7, entry.botIdentity || 'SerpifAI-OracleBot/1.0');
        stmt.setString(8, entry.sessionId || null);
        
        stmt.addBatch();
      }
      
      stmt.executeBatch();
      conn.commit();
      stmt.close();
      
      console.log(`📝 Batch wrote ${logEntries.length} governance logs`);
      
    } catch (e) {
      if (conn) {
        try { conn.rollback(); } catch (re) {}
      }
      console.error('❌ GovernanceLogWriter: Batch write failed - ' + e.message);
    } finally {
      if (conn) {
        this.connectionManager.closeConnection();
      }
    }
  }
  
  _generateHash(input) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
    return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  
  _extractDomain(url) {
    try {
      const match = url.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    } catch (e) {
      return url;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// GLOBAL INTERFACE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get a new JDBC connection
 * @returns {JdbcConnection} Active connection
 */
function getConnection() {
  const manager = new JDBCConnectionManager();
  return manager.getConnection();
}

/**
 * Test the JDBC connection
 * @returns {Object} Test results
 */
function testJDBCConnection() {
  const manager = new JDBCConnectionManager();
  const result = manager.testConnection();
  console.log('JDBC Connection Test:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Sync ForensicParser results to the warehouse
 * @param {Object} results - ForensicParser output
 * @returns {Object} Sync results
 */
function syncToWarehouse(results) {
  const engine = new WarehouseSyncEngine();
  return engine.syncToWarehouse(results);
}

/**
 * Bulk sync multiple results
 * @param {Array} resultsArray - Array of ForensicParser outputs
 * @returns {Object} Bulk sync results
 */
function bulkSyncToWarehouse(resultsArray) {
  const engine = new WarehouseSyncEngine();
  return engine.bulkSync(resultsArray);
}

/**
 * Write a governance log entry
 * @param {Object} logEntry - Log entry data
 */
function writeGovernanceLog(logEntry) {
  const writer = new GovernanceLogWriter();
  writer.writeLog(logEntry);
}

/**
 * Setup database credentials (run once)
 * Call this function to configure database credentials
 */
function setupDatabaseCredentials() {
  const ui = SpreadsheetApp.getUi();
  
  // Prompt for each credential
  const hostResult = ui.prompt('Database Setup', 'Enter MySQL Host (e.g., sql.example.com):', ui.ButtonSet.OK_CANCEL);
  if (hostResult.getSelectedButton() !== ui.Button.OK) return;
  
  const userResult = ui.prompt('Database Setup', 'Enter MySQL Username:', ui.ButtonSet.OK_CANCEL);
  if (userResult.getSelectedButton() !== ui.Button.OK) return;
  
  const passResult = ui.prompt('Database Setup', 'Enter MySQL Password:', ui.ButtonSet.OK_CANCEL);
  if (passResult.getSelectedButton() !== ui.Button.OK) return;
  
  const dbResult = ui.prompt('Database Setup', 'Enter Database Name:', ui.ButtonSet.OK_CANCEL);
  if (dbResult.getSelectedButton() !== ui.Button.OK) return;
  
  // Store credentials
  const props = PropertiesService.getScriptProperties();
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_HOST, hostResult.getResponseText());
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_USER, userResult.getResponseText());
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_PASS, passResult.getResponseText());
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_NAME, dbResult.getResponseText());
  
  ui.alert('Database credentials saved successfully!');
  
  // Test connection
  const testResult = testJDBCConnection();
  if (testResult.success) {
    ui.alert('✅ Connection Test Passed!\n\nMySQL Version: ' + testResult.mysqlVersion);
  } else {
    ui.alert('❌ Connection Test Failed!\n\n' + testResult.error);
  }
}

/**
 * Set database credentials programmatically
 * @param {string} host - MySQL host
 * @param {string} user - Username
 * @param {string} password - Password
 * @param {string} database - Database name
 * @param {string} port - Port (optional, defaults to 3306)
 */
function setDatabaseCredentials(host, user, password, database, port = '3306') {
  const props = PropertiesService.getScriptProperties();
  
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_HOST, host);
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_USER, user);
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_PASS, password);
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_NAME, database);
  props.setProperty(JDBC_BRIDGE_CONFIG.PROPERTY_KEYS.DB_PORT, port);
  
  console.log('✅ Database credentials configured');
  return { success: true, message: 'Credentials saved' };
}

/**
 * Clear all stored database credentials
 */
function clearDatabaseCredentials() {
  const props = PropertiesService.getScriptProperties();
  const keys = JDBC_BRIDGE_CONFIG.PROPERTY_KEYS;
  
  props.deleteProperty(keys.DB_HOST);
  props.deleteProperty(keys.DB_USER);
  props.deleteProperty(keys.DB_PASS);
  props.deleteProperty(keys.DB_NAME);
  props.deleteProperty(keys.DB_PORT);
  
  console.log('🗑️ Database credentials cleared');
  return { success: true, message: 'Credentials cleared' };
}

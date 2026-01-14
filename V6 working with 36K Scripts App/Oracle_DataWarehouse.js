/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 1: DATA WAREHOUSE (MySQL/JDBC)
 * Enterprise-Grade Relational Storage with JDBC Batching
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This module implements the MarketDominationWarehouse class:
 *   - 5-Table Relational Schema (domains, pages, keyword_clusters, link_forensics, governance_logs)
 *   - JDBC Connection Pooling with retry logic
 *   - Batch Operations (addBatch) for 75-keyword payloads
 *   - Full CRUD with prepared statements
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1A: DATABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var WAREHOUSE_CONFIG = WAREHOUSE_CONFIG || {
  // MySQL Connection - REAL CREDENTIALS (Task 2)
  // Values can be overridden via Script Properties
  MYSQL: {
    HOST_PROPERTY: 'ORACLE_MYSQL_HOST',
    PORT_PROPERTY: 'ORACLE_MYSQL_PORT',
    DATABASE_PROPERTY: 'ORACLE_MYSQL_DATABASE',
    USER_PROPERTY: 'ORACLE_MYSQL_USER',
    PASSWORD_PROPERTY: 'ORACLE_MYSQL_PASSWORD',
    DEFAULT_PORT: 3306,
    CONNECTION_TIMEOUT: 30000,
    MAX_RETRIES: 3,
    // Hardcoded fallback values from server .env
    FALLBACK_HOST: 'srv1388.hstgr.io',
    FALLBACK_DATABASE: 'u187453795_SrpAIDataGate',
    FALLBACK_USER: 'u187453795_Admin',
    FALLBACK_PASSWORD: 'OoRB1Pz9i?H'
  },
  
  // Batch Configuration - 90 KW per competitor (Task 3)
  BATCH: {
    MAX_BATCH_SIZE: 100,           // Max rows per batch insert
    KEYWORD_BATCH_SIZE: 90,        // Keywords per competitor (450 / 5 competitors)
    COMMIT_THRESHOLD: 500          // Commit every N operations
  },
  
  // Table Names
  TABLES: {
    DOMAINS: 'domains',
    PAGES: 'pages',
    KEYWORD_CLUSTERS: 'keyword_clusters',
    LINK_FORENSICS: 'link_forensics',
    GOVERNANCE_LOGS: 'governance_logs'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1B: MARKET DOMINATION WAREHOUSE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * MarketDominationWarehouse - Enterprise MySQL data warehouse with JDBC
 */
class MarketDominationWarehouse {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.connection = null;
    this.isConnected = false;
  }
  
  /**
   * Build JDBC connection URL - Standard Secure format for Hostinger
   * NO suffix properties (serverTimezone, allowPublicKeyRetrieval, useSSL)
   * Uses hardcoded fallback credentials if Script Properties are not set
   * @param {string} hostOverride - Optional host override for fallback
   * @returns {string} JDBC URL
   */
  _getConnectionUrl(hostOverride = null) {
    // Fallback pattern: Script Properties > DB_* > Hardcoded fallbacks
    const host = hostOverride 
                 || this.props.getProperty(WAREHOUSE_CONFIG.MYSQL.HOST_PROPERTY)
                 || this.props.getProperty('DB_HOST')
                 || this.props.getProperty('MYSQL_HOST')
                 || WAREHOUSE_CONFIG.MYSQL.FALLBACK_HOST;  // srv1388.hstgr.io
    
    const dbName = this.props.getProperty(WAREHOUSE_CONFIG.MYSQL.DATABASE_PROPERTY)
                   || this.props.getProperty('DB_NAME')
                   || this.props.getProperty('DB_DATABASE')
                   || this.props.getProperty('MYSQL_DATABASE')
                   || WAREHOUSE_CONFIG.MYSQL.FALLBACK_DATABASE;  // u187453795_SrpAIDataGate
    
    const port = this.props.getProperty(WAREHOUSE_CONFIG.MYSQL.PORT_PROPERTY) 
                 || this.props.getProperty('DB_PORT')
                 || this.props.getProperty('MYSQL_PORT')
                 || '3306';
    
    // Log which credentials are being used
    console.log(`📊 Warehouse: Using host=${host}, database=${dbName}`);
    
    // Standard JDBC format - NO suffix properties (Task 2)
    // Hostinger shared hosting rejects: ?useSSL=true, ?serverTimezone=UTC, ?allowPublicKeyRetrieval=true
    const url = 'jdbc:mysql://' + host.trim() + ':' + port + '/' + dbName.trim();
    
    return url;
  }
  
  /**
   * Establish database connection with retry logic and IP fallback
   * Uses Jdbc.getConnection(url, user, password) with NO fourth properties argument
   * HARDENED: Strict credentials, no optional flags, minimal handshake
   * @returns {boolean} Connection success
   */
  connect() {
    if (this.isConnected && this.connection) {
      return true;
    }
    
    // ═══ Task 3: HARDENED CREDENTIALS (strictly from fallbacks) ═══
    // Primary: Use hardcoded credentials to avoid Script Property misconfigurations
    const user = 'u187453795_Admin';  // STRICT: Hostinger MySQL user
    const password = 'OoRB1Pz9i?H';   // STRICT: Hostinger MySQL password
    const database = 'u187453795_SrpAIDataGate';  // STRICT: Hostinger database
    
    // Log connection attempt (password masked)
    console.log(`🔐 Warehouse: Connecting as ${user}@82.197.82.19/${database}`);
    
    // ═══ MULTI-STRATEGY CONNECTION: Three fallback attempts ═══
    // Strategy A: Direct IP (most reliable for remote MySQL)
    // Strategy B: Hostinger internal hostname
    // Strategy C: Standard Hostinger MySQL host
    const connectionAttempts = [
      { 
        url: 'jdbc:mysql://82.197.82.19:3306/' + database, 
        label: 'Strategy A: Public IP (82.197.82.19)' 
      },
      { 
        url: 'jdbc:mysql://srv1388.hstgr.io:3306/' + database, 
        label: 'Strategy B: Hostinger hostname' 
      },
      { 
        url: 'jdbc:mysql://mysql.hostinger.com:3306/' + database, 
        label: 'Strategy C: Standard Hostinger MySQL' 
      }
    ];
    
    for (const attempt of connectionAttempts) {
      let retries = 0;
      
      while (retries < WAREHOUSE_CONFIG.MYSQL.MAX_RETRIES) {
        retries++;
        try {
          // DEBUG: Log exact JDBC URL being sent
          console.log(`🔌 Warehouse: Connecting via ${attempt.label} (attempt ${retries}/${WAREHOUSE_CONFIG.MYSQL.MAX_RETRIES})...`);
          console.log(`   JDBC URL: ${attempt.url}`);
          console.log(`   Final Connection Attempt for User: ${user}`);
          
          // CRITICAL: Only pass 3 arguments (url, user, password)
          // NO fourth 'properties' argument - causes SSL certificate errors on shared hosting
          this.connection = Jdbc.getConnection(attempt.url, user, password);
          this.isConnected = true;
          console.log(`✅ Warehouse: Connected successfully via ${attempt.label}`);
          return true;
        } catch (e) {
          console.error(`❌ Warehouse: Connection failed (${attempt.label}): ${e.message}`);
          if (retries < WAREHOUSE_CONFIG.MYSQL.MAX_RETRIES) {
            Utilities.sleep(2000 * retries);
          }
        }
      }
      
      console.log(`⚠️ Warehouse: ${attempt.label} exhausted, trying next...`);
    }
    
    console.error('❌ Warehouse: All connection attempts failed');
    return false;
  }
  
  /**
   * Gracefully close connection
   */
  disconnect() {
    if (this.connection) {
      try {
        this.connection.close();
        console.log('🔌 Warehouse: Disconnected');
      } catch (e) {
        console.warn(`⚠️ Warehouse: Disconnect warning: ${e.message}`);
      }
      this.connection = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Initialize database schema - creates all tables
   * @returns {Object} Initialization result
   */
  initializeSchema() {
    if (!this.connect()) {
      return { success: false, error: 'Connection failed' };
    }
    
    const statements = [
      // Table 1: domains
      `CREATE TABLE IF NOT EXISTS ${WAREHOUSE_CONFIG.TABLES.DOMAINS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain VARCHAR(255) NOT NULL UNIQUE,
        synthetic_da DECIMAL(5,2) DEFAULT 0,
        trust_velocity DECIMAL(10,4) DEFAULT 0,
        total_rd INT DEFAULT 0,
        global_rank INT DEFAULT 0,
        last_crawled TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_domain (domain),
        INDEX idx_synthetic_da (synthetic_da),
        INDEX idx_global_rank (global_rank)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Table 2: pages
      `CREATE TABLE IF NOT EXISTS ${WAREHOUSE_CONFIG.TABLES.PAGES} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_id INT NOT NULL,
        url VARCHAR(2048) NOT NULL,
        url_hash VARCHAR(64) NOT NULL,
        page_rank_estimate DECIMAL(5,2) DEFAULT 0,
        word_count INT DEFAULT 0,
        lcp_ms INT DEFAULT 0,
        schema_detected VARCHAR(500) DEFAULT NULL,
        aeo_score DECIMAL(5,2) DEFAULT 0,
        eeat_score DECIMAL(5,2) DEFAULT 0,
        content_hash VARCHAR(64) DEFAULT NULL,
        last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (domain_id) REFERENCES ${WAREHOUSE_CONFIG.TABLES.DOMAINS}(id) ON DELETE CASCADE,
        UNIQUE KEY uk_url_hash (url_hash),
        INDEX idx_domain_id (domain_id),
        INDEX idx_aeo_score (aeo_score),
        INDEX idx_eeat_score (eeat_score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Table 3: keyword_clusters
      `CREATE TABLE IF NOT EXISTS ${WAREHOUSE_CONFIG.TABLES.KEYWORD_CLUSTERS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        keyword VARCHAR(500) NOT NULL,
        volume INT DEFAULT 0,
        kd DECIMAL(5,2) DEFAULT 0,
        cpc DECIMAL(10,2) DEFAULT 0,
        intent ENUM('informational', 'commercial', 'transactional', 'navigational') DEFAULT 'informational',
        serp_features VARCHAR(500) DEFAULT NULL,
        position_estimate INT DEFAULT 0,
        traffic_potential INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES ${WAREHOUSE_CONFIG.TABLES.PAGES}(id) ON DELETE CASCADE,
        INDEX idx_page_id (page_id),
        INDEX idx_keyword (keyword(100)),
        INDEX idx_kd (kd),
        INDEX idx_cpc (cpc),
        INDEX idx_intent (intent)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Table 4: link_forensics
      `CREATE TABLE IF NOT EXISTS ${WAREHOUSE_CONFIG.TABLES.LINK_FORENSICS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        ref_domains INT DEFAULT 0,
        backlinks INT DEFAULT 0,
        link_efficiency_ratio DECIMAL(10,4) DEFAULT 0,
        anchor_diversity DECIMAL(5,2) DEFAULT 0,
        internal_links INT DEFAULT 0,
        external_links INT DEFAULT 0,
        dofollow_ratio DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES ${WAREHOUSE_CONFIG.TABLES.PAGES}(id) ON DELETE CASCADE,
        UNIQUE KEY uk_page_id (page_id),
        INDEX idx_ref_domains (ref_domains),
        INDEX idx_link_efficiency (link_efficiency_ratio)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Table 5: governance_logs
      `CREATE TABLE IF NOT EXISTS ${WAREHOUSE_CONFIG.TABLES.GOVERNANCE_LOGS} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(2048) NOT NULL,
        url_hash VARCHAR(64) NOT NULL,
        robots_status ENUM('allowed', 'disallowed', 'error') NOT NULL,
        robots_reason VARCHAR(255) DEFAULT NULL,
        pii_scrubbed_flag BOOLEAN DEFAULT FALSE,
        pii_items_removed INT DEFAULT 0,
        fetch_status_code INT DEFAULT NULL,
        bot_identity VARCHAR(255) DEFAULT 'SerpifAI-OracleBot/1.0',
        session_id VARCHAR(64) DEFAULT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_url_hash (url_hash),
        INDEX idx_robots_status (robots_status),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    
    const results = [];
    
    try {
      const stmt = this.connection.createStatement();
      
      for (const sql of statements) {
        try {
          stmt.execute(sql);
          const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
          results.push({ table: tableName, success: true });
          console.log(`✅ Warehouse: Table ${tableName} ready`);
        } catch (e) {
          const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
          results.push({ table: tableName, success: false, error: e.message });
          console.error(`❌ Warehouse: Failed to create ${tableName}: ${e.message}`);
        }
      }
      
      stmt.close();
      
      return {
        success: results.every(r => r.success),
        tables: results
      };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // DOMAIN OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Upsert a domain record
   * @param {Object} domainData - Domain data object
   * @returns {Object} Result with domain ID
   */
  upsertDomain(domainData) {
    if (!this.connect()) return { success: false, error: 'Connection failed' };
    
    const sql = `
      INSERT INTO ${WAREHOUSE_CONFIG.TABLES.DOMAINS} 
        (domain, synthetic_da, trust_velocity, total_rd, global_rank, last_crawled)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        synthetic_da = VALUES(synthetic_da),
        trust_velocity = VALUES(trust_velocity),
        total_rd = VALUES(total_rd),
        global_rank = VALUES(global_rank),
        last_crawled = NOW()
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql, Jdbc.Statement.RETURN_GENERATED_KEYS);
      stmt.setString(1, domainData.domain);
      stmt.setDouble(2, domainData.synthetic_da || 0);
      stmt.setDouble(3, domainData.trust_velocity || 0);
      stmt.setInt(4, domainData.total_rd || 0);
      stmt.setInt(5, domainData.global_rank || 0);
      
      stmt.executeUpdate();
      
      // Get the ID (either new or existing)
      const rs = stmt.getGeneratedKeys();
      let domainId = null;
      if (rs.next()) {
        domainId = rs.getInt(1);
      } else {
        // Get existing ID
        domainId = this.getDomainId(domainData.domain);
      }
      
      rs.close();
      stmt.close();
      
      return { success: true, domainId: domainId };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Get domain ID by domain name
   * @param {string} domain - Domain name
   * @returns {number|null} Domain ID or null
   */
  getDomainId(domain) {
    if (!this.connect()) return null;
    
    try {
      const stmt = this.connection.prepareStatement(
        `SELECT id FROM ${WAREHOUSE_CONFIG.TABLES.DOMAINS} WHERE domain = ?`
      );
      stmt.setString(1, domain);
      const rs = stmt.executeQuery();
      
      let id = null;
      if (rs.next()) {
        id = rs.getInt('id');
      }
      
      rs.close();
      stmt.close();
      return id;
      
    } catch (e) {
      console.error(`❌ Warehouse: getDomainId error: ${e.message}`);
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PAGE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Generate URL hash for deduplication
   * @param {string} url - URL to hash
   * @returns {string} SHA-256 hash
   */
  _hashUrl(url) {
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, url);
    return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  
  /**
   * Upsert a page record
   * @param {Object} pageData - Page data object
   * @returns {Object} Result with page ID
   */
  upsertPage(pageData) {
    if (!this.connect()) return { success: false, error: 'Connection failed' };
    
    const urlHash = this._hashUrl(pageData.url);
    
    const sql = `
      INSERT INTO ${WAREHOUSE_CONFIG.TABLES.PAGES}
        (domain_id, url, url_hash, page_rank_estimate, word_count, lcp_ms, 
         schema_detected, aeo_score, eeat_score, content_hash, last_analyzed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        page_rank_estimate = VALUES(page_rank_estimate),
        word_count = VALUES(word_count),
        lcp_ms = VALUES(lcp_ms),
        schema_detected = VALUES(schema_detected),
        aeo_score = VALUES(aeo_score),
        eeat_score = VALUES(eeat_score),
        content_hash = VALUES(content_hash),
        last_analyzed = NOW()
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql, Jdbc.Statement.RETURN_GENERATED_KEYS);
      stmt.setInt(1, pageData.domain_id);
      stmt.setString(2, pageData.url);
      stmt.setString(3, urlHash);
      stmt.setDouble(4, pageData.page_rank_estimate || 0);
      stmt.setInt(5, pageData.word_count || 0);
      stmt.setInt(6, pageData.lcp_ms || 0);
      stmt.setString(7, pageData.schema_detected || null);
      stmt.setDouble(8, pageData.aeo_score || 0);
      stmt.setDouble(9, pageData.eeat_score || 0);
      stmt.setString(10, pageData.content_hash || null);
      
      stmt.executeUpdate();
      
      const rs = stmt.getGeneratedKeys();
      let pageId = null;
      if (rs.next()) {
        pageId = rs.getInt(1);
      } else {
        pageId = this.getPageId(pageData.url);
      }
      
      rs.close();
      stmt.close();
      
      return { success: true, pageId: pageId };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Get page ID by URL
   * @param {string} url - Page URL
   * @returns {number|null} Page ID or null
   */
  getPageId(url) {
    if (!this.connect()) return null;
    
    const urlHash = this._hashUrl(url);
    
    try {
      const stmt = this.connection.prepareStatement(
        `SELECT id FROM ${WAREHOUSE_CONFIG.TABLES.PAGES} WHERE url_hash = ?`
      );
      stmt.setString(1, urlHash);
      const rs = stmt.executeQuery();
      
      let id = null;
      if (rs.next()) {
        id = rs.getInt('id');
      }
      
      rs.close();
      stmt.close();
      return id;
      
    } catch (e) {
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // KEYWORD CLUSTER OPERATIONS (BATCH)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Batch insert keywords for a page (75-keyword clusters)
   * @param {number} pageId - Page ID
   * @param {Array} keywords - Array of keyword objects
   * @returns {Object} Batch result
   */
  batchInsertKeywords(pageId, keywords) {
    if (!this.connect()) return { success: false, error: 'Connection failed' };
    
    if (!keywords || keywords.length === 0) {
      return { success: true, inserted: 0 };
    }
    
    // First, delete existing keywords for this page
    try {
      const deleteStmt = this.connection.prepareStatement(
        `DELETE FROM ${WAREHOUSE_CONFIG.TABLES.KEYWORD_CLUSTERS} WHERE page_id = ?`
      );
      deleteStmt.setInt(1, pageId);
      deleteStmt.executeUpdate();
      deleteStmt.close();
    } catch (e) {
      console.warn(`⚠️ Warehouse: Failed to clear old keywords: ${e.message}`);
    }
    
    const sql = `
      INSERT INTO ${WAREHOUSE_CONFIG.TABLES.KEYWORD_CLUSTERS}
        (page_id, keyword, volume, kd, cpc, intent, serp_features, position_estimate, traffic_potential)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql);
      let batchCount = 0;
      
      for (const kw of keywords) {
        stmt.setInt(1, pageId);
        stmt.setString(2, kw.keyword || '');
        stmt.setInt(3, kw.volume || 0);
        stmt.setDouble(4, kw.kd || 0);
        stmt.setDouble(5, kw.cpc || 0);
        stmt.setString(6, kw.intent || 'informational');
        stmt.setString(7, kw.serp_features || null);
        stmt.setInt(8, kw.position_estimate || 0);
        stmt.setInt(9, kw.traffic_potential || 0);
        
        stmt.addBatch();
        batchCount++;
        
        // Execute batch if threshold reached
        if (batchCount >= WAREHOUSE_CONFIG.BATCH.MAX_BATCH_SIZE) {
          stmt.executeBatch();
          batchCount = 0;
        }
      }
      
      // Execute remaining
      if (batchCount > 0) {
        stmt.executeBatch();
      }
      
      stmt.close();
      
      console.log(`✅ Warehouse: Inserted ${keywords.length} keywords for page ${pageId}`);
      return { success: true, inserted: keywords.length };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // LINK FORENSICS OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Upsert link forensics for a page
   * @param {Object} linkData - Link forensics data
   * @returns {Object} Result
   */
  upsertLinkForensics(linkData) {
    if (!this.connect()) return { success: false, error: 'Connection failed' };
    
    const sql = `
      INSERT INTO ${WAREHOUSE_CONFIG.TABLES.LINK_FORENSICS}
        (page_id, ref_domains, backlinks, link_efficiency_ratio, anchor_diversity,
         internal_links, external_links, dofollow_ratio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        ref_domains = VALUES(ref_domains),
        backlinks = VALUES(backlinks),
        link_efficiency_ratio = VALUES(link_efficiency_ratio),
        anchor_diversity = VALUES(anchor_diversity),
        internal_links = VALUES(internal_links),
        external_links = VALUES(external_links),
        dofollow_ratio = VALUES(dofollow_ratio)
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql);
      stmt.setInt(1, linkData.page_id);
      stmt.setInt(2, linkData.ref_domains || 0);
      stmt.setInt(3, linkData.backlinks || 0);
      stmt.setDouble(4, linkData.link_efficiency_ratio || 0);
      stmt.setDouble(5, linkData.anchor_diversity || 0);
      stmt.setInt(6, linkData.internal_links || 0);
      stmt.setInt(7, linkData.external_links || 0);
      stmt.setDouble(8, linkData.dofollow_ratio || 0);
      
      stmt.executeUpdate();
      stmt.close();
      
      return { success: true };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // GOVERNANCE LOG OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Log a governance/compliance event
   * @param {Object} logData - Log entry data
   * @returns {Object} Result
   */
  logGovernanceEvent(logData) {
    if (!this.connect()) return { success: false, error: 'Connection failed' };
    
    const urlHash = this._hashUrl(logData.url);
    
    const sql = `
      INSERT INTO ${WAREHOUSE_CONFIG.TABLES.GOVERNANCE_LOGS}
        (url, url_hash, robots_status, robots_reason, pii_scrubbed_flag, 
         pii_items_removed, fetch_status_code, bot_identity, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, logData.url);
      stmt.setString(2, urlHash);
      stmt.setString(3, logData.robots_status || 'allowed');
      stmt.setString(4, logData.robots_reason || null);
      stmt.setBoolean(5, logData.pii_scrubbed || false);
      stmt.setInt(6, logData.pii_items_removed || 0);
      stmt.setInt(7, logData.fetch_status_code || 0);
      stmt.setString(8, logData.bot_identity || 'SerpifAI-OracleBot/1.0');
      stmt.setString(9, logData.session_id || null);
      
      stmt.executeUpdate();
      stmt.close();
      
      return { success: true };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // FULL PAGE ANALYSIS SAVE (ORCHESTRATED)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Save complete page analysis (domain, page, keywords, links, governance)
   * @param {Object} analysisData - Complete analysis payload
   * @returns {Object} Save result with all IDs
   */
  savePageAnalysis(analysisData) {
    console.log(`💾 Warehouse: Saving analysis for ${analysisData.url}...`);
    
    if (!this.connect()) {
      return { success: false, error: 'Connection failed' };
    }
    
    const results = {
      domain: null,
      page: null,
      keywords: null,
      links: null,
      governance: null
    };
    
    try {
      // 1. Upsert domain
      results.domain = this.upsertDomain({
        domain: analysisData.domain,
        synthetic_da: analysisData.synthetic_da,
        trust_velocity: analysisData.trust_velocity,
        total_rd: analysisData.total_rd,
        global_rank: analysisData.global_rank
      });
      
      if (!results.domain.success) {
        throw new Error(`Domain save failed: ${results.domain.error}`);
      }
      
      // 2. Upsert page
      results.page = this.upsertPage({
        domain_id: results.domain.domainId,
        url: analysisData.url,
        page_rank_estimate: analysisData.page_rank_estimate,
        word_count: analysisData.word_count,
        lcp_ms: analysisData.lcp_ms,
        schema_detected: analysisData.schema_detected,
        aeo_score: analysisData.aeo_score,
        eeat_score: analysisData.eeat_score,
        content_hash: analysisData.content_hash
      });
      
      if (!results.page.success) {
        throw new Error(`Page save failed: ${results.page.error}`);
      }
      
      // 3. Batch insert keywords (75-cluster)
      if (analysisData.keywords && analysisData.keywords.length > 0) {
        results.keywords = this.batchInsertKeywords(
          results.page.pageId,
          analysisData.keywords.slice(0, WAREHOUSE_CONFIG.BATCH.KEYWORD_BATCH_SIZE)
        );
      }
      
      // 4. Upsert link forensics
      if (analysisData.links) {
        results.links = this.upsertLinkForensics({
          page_id: results.page.pageId,
          ...analysisData.links
        });
      }
      
      // 5. Log governance event
      results.governance = this.logGovernanceEvent({
        url: analysisData.url,
        robots_status: analysisData.robots_status || 'allowed',
        robots_reason: analysisData.robots_reason,
        pii_scrubbed: analysisData.pii_scrubbed || false,
        pii_items_removed: analysisData.pii_items_removed || 0,
        fetch_status_code: analysisData.fetch_status_code,
        session_id: analysisData.session_id
      });
      
      console.log(`✅ Warehouse: Analysis saved (Domain: ${results.domain.domainId}, Page: ${results.page.pageId})`);
      
      return {
        success: true,
        domainId: results.domain.domainId,
        pageId: results.page.pageId,
        keywordsInserted: results.keywords?.inserted || 0,
        results: results
      };
      
    } catch (e) {
      console.error(`❌ Warehouse: savePageAnalysis failed: ${e.message}`);
      return { success: false, error: e.message, results: results };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Get pages with low AEO scores (Kill Move targets)
   * @param {number} threshold - AEO score threshold
   * @param {number} limit - Max results
   * @returns {Array} Pages with low AEO
   */
  getLowAEOPages(threshold = 40, limit = 50) {
    if (!this.connect()) return [];
    
    const sql = `
      SELECT p.*, d.domain, d.synthetic_da
      FROM ${WAREHOUSE_CONFIG.TABLES.PAGES} p
      JOIN ${WAREHOUSE_CONFIG.TABLES.DOMAINS} d ON p.domain_id = d.id
      WHERE p.aeo_score < ?
      ORDER BY p.page_rank_estimate DESC
      LIMIT ?
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql);
      stmt.setDouble(1, threshold);
      stmt.setInt(2, limit);
      
      const rs = stmt.executeQuery();
      const results = [];
      
      while (rs.next()) {
        results.push({
          pageId: rs.getInt('id'),
          url: rs.getString('url'),
          domain: rs.getString('domain'),
          synthetic_da: rs.getDouble('synthetic_da'),
          aeo_score: rs.getDouble('aeo_score'),
          eeat_score: rs.getDouble('eeat_score'),
          page_rank_estimate: rs.getDouble('page_rank_estimate')
        });
      }
      
      rs.close();
      stmt.close();
      
      return results;
      
    } catch (e) {
      console.error(`❌ Warehouse: getLowAEOPages error: ${e.message}`);
      return [];
    }
  }
  
  /**
   * Get high-value keywords (Kill Move: Snipe targets)
   * @param {Object} criteria - Filter criteria
   * @returns {Array} High-value keyword opportunities
   */
  getSnipeTargets(criteria = {}) {
    if (!this.connect()) return [];
    
    const kdThreshold = criteria.maxKD || 35;
    const cpcThreshold = criteria.minCPC || 15;
    const limit = criteria.limit || 100;
    
    const sql = `
      SELECT 
        k.*, p.url, p.eeat_score, p.aeo_score, d.domain, d.synthetic_da
      FROM ${WAREHOUSE_CONFIG.TABLES.KEYWORD_CLUSTERS} k
      JOIN ${WAREHOUSE_CONFIG.TABLES.PAGES} p ON k.page_id = p.id
      JOIN ${WAREHOUSE_CONFIG.TABLES.DOMAINS} d ON p.domain_id = d.id
      WHERE k.kd < ? AND k.cpc > ? AND p.eeat_score < 50
      ORDER BY k.cpc DESC, k.volume DESC
      LIMIT ?
    `;
    
    try {
      const stmt = this.connection.prepareStatement(sql);
      stmt.setDouble(1, kdThreshold);
      stmt.setDouble(2, cpcThreshold);
      stmt.setInt(3, limit);
      
      const rs = stmt.executeQuery();
      const results = [];
      
      while (rs.next()) {
        results.push({
          keyword: rs.getString('keyword'),
          volume: rs.getInt('volume'),
          kd: rs.getDouble('kd'),
          cpc: rs.getDouble('cpc'),
          intent: rs.getString('intent'),
          url: rs.getString('url'),
          domain: rs.getString('domain'),
          eeat_score: rs.getDouble('eeat_score'),
          aeo_score: rs.getDouble('aeo_score'),
          killMoveType: 'SNIPE'
        });
      }
      
      rs.close();
      stmt.close();
      
      return results;
      
    } catch (e) {
      console.error(`❌ Warehouse: getSnipeTargets error: ${e.message}`);
      return [];
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1C: GLOBAL WAREHOUSE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get warehouse instance
 * @returns {MarketDominationWarehouse}
 */
function getWarehouse() {
  return new MarketDominationWarehouse();
}

/**
 * Initialize the Oracle data warehouse
 */
function initializeOracleWarehouse() {
  const warehouse = getWarehouse();
  const result = warehouse.initializeSchema();
  warehouse.disconnect();
  console.log('Warehouse initialization result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Test warehouse connection
 */
function testWarehouseConnection() {
  const warehouse = getWarehouse();
  const connected = warehouse.connect();
  const result = { connected: connected };
  warehouse.disconnect();
  console.log('Connection test:', JSON.stringify(result));
  return result;
}

/**
 * Get Kill Move: Snipe targets
 * @param {number} maxKD - Max keyword difficulty
 * @param {number} minCPC - Minimum CPC
 */
function getKillMoveSnipes(maxKD = 35, minCPC = 15) {
  const warehouse = getWarehouse();
  const results = warehouse.getSnipeTargets({ maxKD, minCPC });
  warehouse.disconnect();
  console.log(`Found ${results.length} Snipe targets`);
  return results;
}

/**
 * Get Kill Move: AEO Hijack targets
 * @param {number} aeoThreshold - AEO score threshold
 */
function getAEOHijackTargets(aeoThreshold = 40) {
  const warehouse = getWarehouse();
  const results = warehouse.getLowAEOPages(aeoThreshold);
  warehouse.disconnect();
  console.log(`Found ${results.length} AEO Hijack targets`);
  return results;
}

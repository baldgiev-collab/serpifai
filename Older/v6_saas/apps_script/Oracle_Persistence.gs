/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - ORACLE_PERSISTENCE.GS
 * MySQL Persistence Layer with JSON UPSERT & 7-Day Refresh Logic
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE:
 * - Save raw HTML snippets and metadata as structured JSON in MySQL
 * - UPSERT logic: Update if timestamp > 7 days, otherwise create new
 * - Append summarized insights to Master Archive GSheet
 * - Batch operations with JDBC addBatch for performance
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// PERSISTENCE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ORACLE_PERSISTENCE_CONFIG = {
  // UPSERT Settings
  REFRESH_DAYS: 7,                    // Update records older than 7 days
  BATCH_SIZE: 50,                     // Batch insert size
  
  // Table Names
  TABLES: {
    COMPETITOR_INTELLIGENCE: 'competitor_intelligence',
    COMPETITOR_PAGES: 'competitor_pages',
    COMPETITOR_KEYWORDS: 'competitor_keywords',
    COMPETITOR_LINKS: 'competitor_links',
    COMPETITOR_EEAT: 'competitor_eeat'
  },
  
  // GSheet Settings
  MASTER_ARCHIVE_SHEET_ID: null,      // Set via Script Properties
  ARCHIVE_SHEET_NAME: 'Oracle Intelligence Archive'
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ORACLE PERSISTENCE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OraclePersistence - Handles all MySQL storage operations
 */
class OraclePersistence {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.connection = null;
    this.isConnected = false;
  }
  
  /**
   * Connect to MySQL database
   */
  connect() {
    if (this.isConnected) return true;
    
    try {
      const host = this.props.getProperty('DB_HOST') || '82.197.82.19';
      const database = this.props.getProperty('DB_NAME') || 'u187453795_SrpAIDataGate';
      const user = this.props.getProperty('DB_USER') || 'u187453795_Admin';
      const password = this.props.getProperty('DB_PASS') || 'OoRB1Pz9i?H';
      
      const url = `jdbc:mysql://${host}:3306/${database}`;
      
      console.log(`🔌 Oracle Persistence: Connecting to ${host}/${database}...`);
      
      this.connection = Jdbc.getConnection(url, user, password);
      this.isConnected = true;
      
      console.log('✅ Oracle Persistence: Connected');
      return true;
      
    } catch (e) {
      console.error('❌ Oracle Persistence: Connection failed: ' + e.message);
      return false;
    }
  }
  
  /**
   * Disconnect from database
   */
  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Ensure required tables exist
   */
  ensureTables() {
    if (!this.connect()) return false;
    
    const stmt = this.connection.createStatement();
    
    try {
      // ─── competitor_intelligence (main table) ───
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS competitor_intelligence (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          url VARCHAR(2048) NOT NULL,
          url_hash VARCHAR(64) NOT NULL,
          page_type ENUM('homepage', 'blog_index', 'blog_post', 'category', 'product', 'other') DEFAULT 'other',
          
          -- Raw Data as JSON
          raw_forensics JSON,
          headings_json JSON,
          keywords_json JSON,
          links_json JSON,
          eeat_json JSON,
          schema_json JSON,
          
          -- Summary Fields
          meta_title VARCHAR(500),
          meta_description TEXT,
          word_count INT DEFAULT 0,
          heading_count INT DEFAULT 0,
          internal_link_count INT DEFAULT 0,
          external_link_count INT DEFAULT 0,
          eeat_score DECIMAL(5,2) DEFAULT 0,
          
          -- Status
          fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_stale BOOLEAN DEFAULT FALSE,
          
          -- Indexes
          UNIQUE KEY unique_url (url_hash),
          INDEX idx_domain (domain),
          INDEX idx_project (project_id),
          INDEX idx_fetched (fetched_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table: competitor_intelligence');
      
      // ─── competitor_keywords (extracted keywords) ───
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS competitor_keywords (
          id INT AUTO_INCREMENT PRIMARY KEY,
          intelligence_id INT NOT NULL,
          keyword VARCHAR(500) NOT NULL,
          keyword_type ENUM('primary', 'secondary', 'semantic', 'long_tail', 'paa', 'faq') DEFAULT 'primary',
          frequency INT DEFAULT 1,
          density VARCHAR(10),
          position INT DEFAULT 0,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_intelligence (intelligence_id),
          INDEX idx_keyword (keyword(100)),
          INDEX idx_type (keyword_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table: competitor_keywords');
      
      // ─── competitor_headings (heading hierarchy) ───
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS competitor_headings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          intelligence_id INT NOT NULL,
          heading_level TINYINT NOT NULL,
          heading_text VARCHAR(1000) NOT NULL,
          heading_order INT DEFAULT 0,
          word_count INT DEFAULT 0,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_intelligence (intelligence_id),
          INDEX idx_level (heading_level)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table: competitor_headings');
      
      // ─── competitor_links (internal/external links) ───
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS competitor_links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          intelligence_id INT NOT NULL,
          link_type ENUM('internal', 'external') NOT NULL,
          target_url VARCHAR(2048) NOT NULL,
          anchor_text VARCHAR(500),
          is_nofollow BOOLEAN DEFAULT FALSE,
          link_count INT DEFAULT 1,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_intelligence (intelligence_id),
          INDEX idx_type (link_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table: competitor_links');
      
      // ─── competitor_eeat (EEAT signals) ───
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS competitor_eeat (
          id INT AUTO_INCREMENT PRIMARY KEY,
          intelligence_id INT NOT NULL,
          
          -- Scores
          experience_score DECIMAL(5,2) DEFAULT 0,
          expertise_score DECIMAL(5,2) DEFAULT 0,
          authoritativeness_score DECIMAL(5,2) DEFAULT 0,
          trustworthiness_score DECIMAL(5,2) DEFAULT 0,
          overall_score DECIMAL(5,2) DEFAULT 0,
          grade VARCHAR(20),
          
          -- Signal Details as JSON
          experience_signals JSON,
          expertise_signals JSON,
          authority_signals JSON,
          trust_signals JSON,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_intelligence (intelligence_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table: competitor_eeat');
      
      stmt.close();
      return true;
      
    } catch (e) {
      console.error('❌ Table creation failed: ' + e.message);
      stmt.close();
      return false;
    }
  }
  
  /**
   * UPSERT competitor intelligence data
   * @param {Object} forensics - Extracted page forensics
   * @param {string} projectId - Project identifier
   * @returns {Object} Save result
   */
  upsertIntelligence(forensics, projectId) {
    if (!this.connect()) {
      return { success: false, error: 'Connection failed' };
    }
    
    try {
      const urlHash = this._hashUrl(forensics.url);
      
      // Check if record exists and is stale
      const existing = this._getExistingRecord(urlHash);
      
      if (existing && !this._isStale(existing.fetched_at)) {
        console.log(`⏭️ Skipping ${forensics.url} - data is fresh (< ${ORACLE_PERSISTENCE_CONFIG.REFRESH_DAYS} days)`);
        return { 
          success: true, 
          action: 'skipped', 
          intelligenceId: existing.id,
          reason: 'Data is fresh'
        };
      }
      
      // Prepare JSON fields
      const rawForensicsJson = JSON.stringify(forensics);
      const headingsJson = JSON.stringify(forensics.headings);
      const keywordsJson = JSON.stringify(forensics.keywords);
      const linksJson = JSON.stringify({
        internal: forensics.internalLinks,
        external: forensics.externalLinks
      });
      const eeatJson = JSON.stringify(forensics.eeatSignals);
      const schemaJson = JSON.stringify(forensics.schema);
      
      let intelligenceId;
      let action;
      
      if (existing) {
        // UPDATE existing record
        const updateSql = `
          UPDATE competitor_intelligence SET
            raw_forensics = ?,
            headings_json = ?,
            keywords_json = ?,
            links_json = ?,
            eeat_json = ?,
            schema_json = ?,
            meta_title = ?,
            meta_description = ?,
            word_count = ?,
            heading_count = ?,
            internal_link_count = ?,
            external_link_count = ?,
            eeat_score = ?,
            fetched_at = NOW(),
            is_stale = FALSE
          WHERE id = ?
        `;
        
        const stmt = this.connection.prepareStatement(updateSql);
        stmt.setString(1, rawForensicsJson);
        stmt.setString(2, headingsJson);
        stmt.setString(3, keywordsJson);
        stmt.setString(4, linksJson);
        stmt.setString(5, eeatJson);
        stmt.setString(6, schemaJson);
        stmt.setString(7, forensics.meta.title || '');
        stmt.setString(8, forensics.meta.description || '');
        stmt.setInt(9, forensics.contentMetrics.wordCount || 0);
        stmt.setInt(10, forensics.headings.totalCount || 0);
        stmt.setInt(11, forensics.internalLinks.totalCount || 0);
        stmt.setInt(12, forensics.externalLinks.totalLinks || 0);
        stmt.setDouble(13, forensics.eeatSignals.overall.score || 0);
        stmt.setInt(14, existing.id);
        stmt.executeUpdate();
        stmt.close();
        
        intelligenceId = existing.id;
        action = 'updated';
        console.log(`📝 Updated: ${forensics.url}`);
        
      } else {
        // INSERT new record
        const insertSql = `
          INSERT INTO competitor_intelligence (
            project_id, domain, url, url_hash, page_type,
            raw_forensics, headings_json, keywords_json, links_json, eeat_json, schema_json,
            meta_title, meta_description, word_count, heading_count,
            internal_link_count, external_link_count, eeat_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const stmt = this.connection.prepareStatement(insertSql, Jdbc.Statement.RETURN_GENERATED_KEYS);
        stmt.setString(1, projectId);
        stmt.setString(2, forensics.domain);
        stmt.setString(3, forensics.url);
        stmt.setString(4, urlHash);
        stmt.setString(5, forensics.pageType || 'other');
        stmt.setString(6, rawForensicsJson);
        stmt.setString(7, headingsJson);
        stmt.setString(8, keywordsJson);
        stmt.setString(9, linksJson);
        stmt.setString(10, eeatJson);
        stmt.setString(11, schemaJson);
        stmt.setString(12, forensics.meta.title || '');
        stmt.setString(13, forensics.meta.description || '');
        stmt.setInt(14, forensics.contentMetrics.wordCount || 0);
        stmt.setInt(15, forensics.headings.totalCount || 0);
        stmt.setInt(16, forensics.internalLinks.totalCount || 0);
        stmt.setInt(17, forensics.externalLinks.totalLinks || 0);
        stmt.setDouble(18, forensics.eeatSignals.overall.score || 0);
        stmt.executeUpdate();
        
        const keys = stmt.getGeneratedKeys();
        if (keys.next()) {
          intelligenceId = keys.getInt(1);
        }
        keys.close();
        stmt.close();
        
        action = 'inserted';
        console.log(`➕ Inserted: ${forensics.url}`);
      }
      
      // Save related data
      if (intelligenceId) {
        this._saveKeywords(intelligenceId, forensics.keywords, action === 'updated');
        this._saveHeadings(intelligenceId, forensics.headings, action === 'updated');
        this._saveLinks(intelligenceId, forensics.internalLinks, forensics.externalLinks, action === 'updated');
        this._saveEEAT(intelligenceId, forensics.eeatSignals, action === 'updated');
      }
      
      return {
        success: true,
        action: action,
        intelligenceId: intelligenceId,
        url: forensics.url
      };
      
    } catch (e) {
      console.error('❌ UPSERT failed: ' + e.message);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Batch save multiple forensics results
   * @param {Array} forensicsArray - Array of forensics objects
   * @param {string} projectId - Project identifier
   */
  batchUpsert(forensicsArray, projectId) {
    console.log(`💾 Batch UPSERT: ${forensicsArray.length} records...`);
    
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };
    
    for (const forensics of forensicsArray) {
      const result = this.upsertIntelligence(forensics, projectId);
      
      if (result.success) {
        if (result.action === 'inserted') results.inserted++;
        else if (result.action === 'updated') results.updated++;
        else if (result.action === 'skipped') results.skipped++;
      } else {
        results.failed++;
        results.errors.push({ url: forensics.url, error: result.error });
      }
    }
    
    console.log(`✅ Batch complete: ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} skipped, ${results.failed} failed`);
    
    return results;
  }
  
  /**
   * Get intelligence data for a project
   * @param {string} projectId - Project ID
   * @param {Object} options - Query options
   */
  getIntelligence(projectId, options = {}) {
    if (!this.connect()) return [];
    
    try {
      let sql = `
        SELECT ci.*, ce.overall_score as eeat_overall
        FROM competitor_intelligence ci
        LEFT JOIN competitor_eeat ce ON ci.id = ce.intelligence_id
        WHERE ci.project_id = ?
      `;
      
      if (options.domain) {
        sql += ` AND ci.domain = '${options.domain}'`;
      }
      
      if (options.pageType) {
        sql += ` AND ci.page_type = '${options.pageType}'`;
      }
      
      sql += ` ORDER BY ci.fetched_at DESC`;
      
      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }
      
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, projectId);
      const rs = stmt.executeQuery();
      
      const results = [];
      while (rs.next()) {
        results.push({
          id: rs.getInt('id'),
          domain: rs.getString('domain'),
          url: rs.getString('url'),
          pageType: rs.getString('page_type'),
          metaTitle: rs.getString('meta_title'),
          metaDescription: rs.getString('meta_description'),
          wordCount: rs.getInt('word_count'),
          headingCount: rs.getInt('heading_count'),
          internalLinkCount: rs.getInt('internal_link_count'),
          externalLinkCount: rs.getInt('external_link_count'),
          eeatScore: rs.getDouble('eeat_score'),
          fetchedAt: rs.getTimestamp('fetched_at'),
          rawForensics: JSON.parse(rs.getString('raw_forensics') || '{}'),
          headingsJson: JSON.parse(rs.getString('headings_json') || '{}'),
          keywordsJson: JSON.parse(rs.getString('keywords_json') || '{}'),
          linksJson: JSON.parse(rs.getString('links_json') || '{}'),
          eeatJson: JSON.parse(rs.getString('eeat_json') || '{}'),
          schemaJson: JSON.parse(rs.getString('schema_json') || '{}')
        });
      }
      
      rs.close();
      stmt.close();
      
      return results;
      
    } catch (e) {
      console.error('❌ Query failed: ' + e.message);
      return [];
    }
  }
  
  /**
   * Export to Google Sheet archive
   * @param {string} projectId - Project ID
   * @param {string} sheetId - GSheet ID (optional)
   */
  exportToGSheet(projectId, sheetId = null) {
    const data = this.getIntelligence(projectId);
    
    if (data.length === 0) {
      console.log('⚠️ No data to export');
      return { success: false, error: 'No data' };
    }
    
    try {
      // Get or create spreadsheet
      let ss;
      if (sheetId) {
        ss = SpreadsheetApp.openById(sheetId);
      } else {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      }
      
      if (!ss) {
        return { success: false, error: 'No spreadsheet found' };
      }
      
      // Get or create sheet
      let sheet = ss.getSheetByName(ORACLE_PERSISTENCE_CONFIG.ARCHIVE_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(ORACLE_PERSISTENCE_CONFIG.ARCHIVE_SHEET_NAME);
      } else {
        sheet.clear();
      }
      
      // Headers
      const headers = [
        'Domain', 'URL', 'Page Type', 'Meta Title', 'Word Count',
        'Headings', 'Internal Links', 'External Links', 'EEAT Score',
        'Primary Keywords', 'Secondary Keywords', 'Schema Types', 'Fetched At'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      
      // Data rows
      const rows = data.map(d => [
        d.domain,
        d.url,
        d.pageType,
        d.metaTitle,
        d.wordCount,
        d.headingCount,
        d.internalLinkCount,
        d.externalLinkCount,
        d.eeatScore,
        (d.keywordsJson.primary || []).slice(0, 5).map(k => k.keyword).join(', '),
        (d.keywordsJson.secondary || []).slice(0, 5).map(k => k.keyword).join(', '),
        (d.schemaJson.types || []).join(', '),
        d.fetchedAt
      ]);
      
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      
      // Auto-resize columns
      for (let i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
      
      console.log(`✅ Exported ${rows.length} rows to GSheet`);
      
      return { success: true, rowsExported: rows.length };
      
    } catch (e) {
      console.error('❌ GSheet export failed: ' + e.message);
      return { success: false, error: e.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _hashUrl(url) {
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, url);
    return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  
  _getExistingRecord(urlHash) {
    try {
      const sql = 'SELECT id, fetched_at FROM competitor_intelligence WHERE url_hash = ?';
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, urlHash);
      const rs = stmt.executeQuery();
      
      let record = null;
      if (rs.next()) {
        record = {
          id: rs.getInt('id'),
          fetched_at: rs.getTimestamp('fetched_at')
        };
      }
      
      rs.close();
      stmt.close();
      return record;
    } catch (e) {
      return null;
    }
  }
  
  _isStale(fetchedAt) {
    if (!fetchedAt) return true;
    
    const now = new Date();
    const fetched = new Date(fetchedAt);
    const daysDiff = (now - fetched) / (1000 * 60 * 60 * 24);
    
    return daysDiff >= ORACLE_PERSISTENCE_CONFIG.REFRESH_DAYS;
  }
  
  _saveKeywords(intelligenceId, keywords, isUpdate) {
    if (isUpdate) {
      // Delete old keywords
      const delStmt = this.connection.prepareStatement('DELETE FROM competitor_keywords WHERE intelligence_id = ?');
      delStmt.setInt(1, intelligenceId);
      delStmt.executeUpdate();
      delStmt.close();
    }
    
    const insertSql = 'INSERT INTO competitor_keywords (intelligence_id, keyword, keyword_type, frequency, density, position) VALUES (?, ?, ?, ?, ?, ?)';
    const stmt = this.connection.prepareStatement(insertSql);
    
    let position = 0;
    
    // Primary keywords
    for (const kw of (keywords.primary || [])) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, kw.keyword);
      stmt.setString(3, 'primary');
      stmt.setInt(4, kw.count || 1);
      stmt.setString(5, kw.density || '0%');
      stmt.setInt(6, position++);
      stmt.addBatch();
    }
    
    // Secondary keywords
    for (const kw of (keywords.secondary || [])) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, kw.keyword);
      stmt.setString(3, 'secondary');
      stmt.setInt(4, kw.count || 1);
      stmt.setString(5, kw.density || '0%');
      stmt.setInt(6, position++);
      stmt.addBatch();
    }
    
    // Semantic keywords
    for (const kw of (keywords.semantic || [])) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, kw.keyword);
      stmt.setString(3, 'semantic');
      stmt.setInt(4, kw.count || 1);
      stmt.setString(5, kw.density || '0%');
      stmt.setInt(6, position++);
      stmt.addBatch();
    }
    
    // Long-tail keywords
    for (const kw of (keywords.longTail || [])) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, kw.keyword);
      stmt.setString(3, 'long_tail');
      stmt.setInt(4, kw.count || 1);
      stmt.setString(5, kw.density || '0%');
      stmt.setInt(6, position++);
      stmt.addBatch();
    }
    
    stmt.executeBatch();
    stmt.close();
  }
  
  _saveHeadings(intelligenceId, headings, isUpdate) {
    if (isUpdate) {
      const delStmt = this.connection.prepareStatement('DELETE FROM competitor_headings WHERE intelligence_id = ?');
      delStmt.setInt(1, intelligenceId);
      delStmt.executeUpdate();
      delStmt.close();
    }
    
    const insertSql = 'INSERT INTO competitor_headings (intelligence_id, heading_level, heading_text, heading_order, word_count) VALUES (?, ?, ?, ?, ?)';
    const stmt = this.connection.prepareStatement(insertSql);
    
    for (const heading of (headings.hierarchy || [])) {
      stmt.setInt(1, intelligenceId);
      stmt.setInt(2, heading.level);
      stmt.setString(3, (heading.text || '').substring(0, 1000));
      stmt.setInt(4, heading.order || 0);
      stmt.setInt(5, heading.wordCount || 0);
      stmt.addBatch();
    }
    
    stmt.executeBatch();
    stmt.close();
  }
  
  _saveLinks(intelligenceId, internalLinks, externalLinks, isUpdate) {
    if (isUpdate) {
      const delStmt = this.connection.prepareStatement('DELETE FROM competitor_links WHERE intelligence_id = ?');
      delStmt.setInt(1, intelligenceId);
      delStmt.executeUpdate();
      delStmt.close();
    }
    
    const insertSql = 'INSERT INTO competitor_links (intelligence_id, link_type, target_url, anchor_text, link_count) VALUES (?, ?, ?, ?, ?)';
    const stmt = this.connection.prepareStatement(insertSql);
    
    // Internal links (top 50)
    for (const link of (internalLinks.links || []).slice(0, 50)) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, 'internal');
      stmt.setString(3, (link.url || '').substring(0, 2048));
      stmt.setString(4, (link.anchors || []).slice(0, 3).join(' | ').substring(0, 500));
      stmt.setInt(5, link.count || 1);
      stmt.addBatch();
    }
    
    // External links (top 30)
    for (const domain of (externalLinks.domains || []).slice(0, 30)) {
      stmt.setInt(1, intelligenceId);
      stmt.setString(2, 'external');
      stmt.setString(3, domain.domain || '');
      stmt.setString(4, (domain.links || []).slice(0, 3).map(l => l.anchor).join(' | ').substring(0, 500));
      stmt.setInt(5, domain.count || 1);
      stmt.addBatch();
    }
    
    stmt.executeBatch();
    stmt.close();
  }
  
  _saveEEAT(intelligenceId, eeat, isUpdate) {
    if (isUpdate) {
      const delStmt = this.connection.prepareStatement('DELETE FROM competitor_eeat WHERE intelligence_id = ?');
      delStmt.setInt(1, intelligenceId);
      delStmt.executeUpdate();
      delStmt.close();
    }
    
    const insertSql = `
      INSERT INTO competitor_eeat (
        intelligence_id, experience_score, expertise_score, authoritativeness_score,
        trustworthiness_score, overall_score, grade,
        experience_signals, expertise_signals, authority_signals, trust_signals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const stmt = this.connection.prepareStatement(insertSql);
    stmt.setInt(1, intelligenceId);
    stmt.setDouble(2, eeat.experience?.score || 0);
    stmt.setDouble(3, eeat.expertise?.score || 0);
    stmt.setDouble(4, eeat.authoritativeness?.score || 0);
    stmt.setDouble(5, eeat.trustworthiness?.score || 0);
    stmt.setDouble(6, eeat.overall?.score || 0);
    stmt.setString(7, eeat.overall?.grade || 'Unknown');
    stmt.setString(8, JSON.stringify(eeat.experience?.signals || []));
    stmt.setString(9, JSON.stringify(eeat.expertise?.signals || []));
    stmt.setString(10, JSON.stringify(eeat.authoritativeness?.signals || []));
    stmt.setString(11, JSON.stringify(eeat.trustworthiness?.signals || []));
    stmt.executeUpdate();
    stmt.close();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Initialize Oracle persistence tables
 */
function ORACLE_InitTables() {
  const persistence = new OraclePersistence();
  const result = persistence.ensureTables();
  persistence.disconnect();
  return result;
}

/**
 * Save Oracle fetcher results to MySQL
 * @param {string} projectId - Project ID
 */
function ORACLE_SaveResults(projectId) {
  projectId = projectId || 'default';
  
  // Get results from batch processor
  const results = JSON.parse(PropertiesService.getScriptProperties().getProperty('ORACLE_FETCHER_RESULTS') || '[]');
  
  if (results.length === 0) {
    Logger.log('⚠️ No results to save');
    return { success: false, error: 'No results' };
  }
  
  const persistence = new OraclePersistence();
  persistence.ensureTables();
  
  const saveResult = persistence.batchUpsert(results, projectId);
  persistence.disconnect();
  
  return saveResult;
}

/**
 * Export intelligence to GSheet
 * @param {string} projectId - Project ID
 */
function ORACLE_ExportToSheet(projectId) {
  const persistence = new OraclePersistence();
  const result = persistence.exportToGSheet(projectId || 'default');
  persistence.disconnect();
  return result;
}

/**
 * Get intelligence data
 * @param {string} projectId - Project ID
 */
function ORACLE_GetIntelligence(projectId) {
  const persistence = new OraclePersistence();
  const data = persistence.getIntelligence(projectId || 'default');
  persistence.disconnect();
  return data;
}

/**
 * Test persistence layer
 */
function ORACLE_TestPersistence() {
  Logger.log('🧪 Testing Oracle Persistence Layer...');
  
  const persistence = new OraclePersistence();
  
  // Test connection
  if (!persistence.connect()) {
    Logger.log('❌ Connection failed');
    return;
  }
  Logger.log('✅ Connection successful');
  
  // Test table creation
  if (persistence.ensureTables()) {
    Logger.log('✅ Tables created/verified');
  }
  
  // Test with mock data
  const mockForensics = {
    url: 'https://example.com/test',
    domain: 'example.com',
    pageType: 'blog_post',
    meta: {
      title: 'Test Page Title',
      description: 'Test meta description'
    },
    headings: {
      totalCount: 5,
      hierarchy: [
        { level: 1, text: 'Main Heading', order: 0, wordCount: 2 },
        { level: 2, text: 'Subheading One', order: 1, wordCount: 2 }
      ]
    },
    keywords: {
      primary: [{ keyword: 'test', count: 10, density: '2%' }],
      secondary: [{ keyword: 'example test', count: 5, density: '1%' }],
      semantic: [],
      longTail: []
    },
    internalLinks: {
      totalCount: 10,
      links: [{ url: '/about', anchors: ['About Us'], count: 2 }]
    },
    externalLinks: {
      totalDomains: 3,
      totalLinks: 5,
      domains: [{ domain: 'google.com', count: 2, links: [] }]
    },
    eeatSignals: {
      experience: { score: 50, signals: [] },
      expertise: { score: 60, signals: [] },
      authoritativeness: { score: 55, signals: [] },
      trustworthiness: { score: 70, signals: [] },
      overall: { score: 58, grade: 'Average' }
    },
    schema: {
      types: ['Article', 'Organization'],
      jsonLD: []
    },
    contentMetrics: {
      wordCount: 1500
    }
  };
  
  const result = persistence.upsertIntelligence(mockForensics, 'test_project');
  Logger.log('UPSERT result: ' + JSON.stringify(result));
  
  persistence.disconnect();
  Logger.log('✅ Persistence test complete');
}

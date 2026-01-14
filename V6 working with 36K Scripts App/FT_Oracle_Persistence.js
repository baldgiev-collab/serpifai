/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEPS 8 & 9: MySQL JSON SCHEMA + PERSISTENCE
 * Store All Extracted Data as JSON in MySQL
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Store comprehensive competitor intelligence in MySQL
 * - Unified JSON schema for all extracted data
 * - UPSERT logic with 7-day refresh
 * - Batch operations for performance
 * - Full pipeline data integration
 * 
 * TABLES:
 * - oracle_competitor_analysis: Main table with all JSON data
 * - oracle_gemini_insights: Gemini API analysis results
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// PERSISTENCE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ORACLE_PIPELINE_PERSISTENCE_CONFIG = {
  // Database credentials (can be overridden by Script Properties)
  DB_HOST: '82.197.82.19',
  DB_NAME: 'u187453795_SrpAIDataGate',
  DB_USER: 'u187453795_Admin',
  DB_PASS: 'OoRB1Pz9i?H',
  DB_PORT: 3306,
  
  // UPSERT settings
  REFRESH_DAYS: 7,
  BATCH_SIZE: 10,
  
  // Table names
  TABLES: {
    ANALYSIS: 'oracle_competitor_analysis',
    INSIGHTS: 'oracle_gemini_insights',
    PIPELINE_LOG: 'oracle_pipeline_log'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ORACLE PIPELINE PERSISTENCE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OraclePipelinePersistence - Unified MySQL storage for pipeline data
 */
class OraclePipelinePersistence {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.connection = null;
    this.isConnected = false;
  }
  
  /**
   * Connect to MySQL database
   * @returns {boolean} Connection success
   */
  connect() {
    if (this.isConnected && this.connection) return true;
    
    try {
      const host = this.props.getProperty('DB_HOST') || ORACLE_PIPELINE_PERSISTENCE_CONFIG.DB_HOST;
      const database = this.props.getProperty('DB_NAME') || ORACLE_PIPELINE_PERSISTENCE_CONFIG.DB_NAME;
      const user = this.props.getProperty('DB_USER') || ORACLE_PIPELINE_PERSISTENCE_CONFIG.DB_USER;
      const password = this.props.getProperty('DB_PASS') || ORACLE_PIPELINE_PERSISTENCE_CONFIG.DB_PASS;
      const port = ORACLE_PIPELINE_PERSISTENCE_CONFIG.DB_PORT;
      
      const url = `jdbc:mysql://${host}:${port}/${database}?useSSL=false&allowPublicKeyRetrieval=true`;
      
      console.log(`🔌 Pipeline Persistence: Connecting to ${host}/${database}...`);
      
      this.connection = Jdbc.getConnection(url, user, password);
      this.isConnected = true;
      
      console.log('✅ Pipeline Persistence: Connected');
      return true;
      
    } catch (e) {
      console.error('❌ Pipeline Persistence: Connection failed: ' + e.message);
      return false;
    }
  }
  
  /**
   * Disconnect from database
   */
  disconnect() {
    if (this.connection) {
      try {
        this.connection.close();
      } catch (e) {
        // Ignore close errors
      }
      this.connection = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Initialize tables if they don't exist
   * @returns {boolean} Success
   */
  initializeTables() {
    if (!this.connect()) return false;
    
    const stmt = this.connection.createStatement();
    
    try {
      // Main analysis table with all JSON data
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          
          -- Identification
          project_id VARCHAR(100) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          domain_hash VARCHAR(64) NOT NULL,
          analysis_type ENUM('competitor', 'client', 'benchmark') DEFAULT 'competitor',
          
          -- Page Discovery Data (JSON)
          pages_discovered_json JSON COMMENT 'Blog discovery results',
          
          -- Fetched Pages Data (JSON)
          pages_fetched_json JSON COMMENT 'Homepage + blog pages fetch results',
          
          -- Extracted Data (JSON)
          headings_json JSON COMMENT 'H1-H6 extraction results',
          keywords_json JSON COMMENT 'Primary, secondary, semantic, long-tail, PAA, FAQ',
          meta_links_json JSON COMMENT 'Meta descriptions, internal/external links, anchors',
          backlinks_json JSON COMMENT 'Backlinks and referring domains',
          eeat_json JSON COMMENT 'E-E-A-T signal analysis',
          
          -- Summary Scores (for quick queries)
          heading_score DECIMAL(5,2) DEFAULT 0,
          keyword_score DECIMAL(5,2) DEFAULT 0,
          meta_links_score DECIMAL(5,2) DEFAULT 0,
          backlink_score DECIMAL(5,2) DEFAULT 0,
          eeat_score DECIMAL(5,2) DEFAULT 0,
          overall_score DECIMAL(5,2) DEFAULT 0,
          
          -- Counts (for quick queries)
          pages_analyzed INT DEFAULT 0,
          total_headings INT DEFAULT 0,
          total_keywords INT DEFAULT 0,
          total_internal_links INT DEFAULT 0,
          total_backlinks INT DEFAULT 0,
          total_eeat_signals INT DEFAULT 0,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          expires_at TIMESTAMP DEFAULT NULL,
          
          -- Indexes
          UNIQUE KEY unique_domain (project_id, domain_hash),
          INDEX idx_domain (domain),
          INDEX idx_project (project_id),
          INDEX idx_updated (updated_at),
          INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created: oracle_competitor_analysis');
      
      // Gemini insights table
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.INSIGHTS} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          
          -- Link to analysis
          analysis_id INT NOT NULL,
          project_id VARCHAR(100) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          
          -- Gemini Analysis (JSON)
          prompt_type VARCHAR(100) NOT NULL,
          prompt_text TEXT,
          gemini_response_json JSON COMMENT 'Full Gemini API response',
          
          -- Parsed Insights (JSON)
          strategic_insights_json JSON COMMENT 'Key strategic insights',
          action_items_json JSON COMMENT 'Recommended actions',
          competitive_gaps_json JSON COMMENT 'Identified gaps',
          opportunities_json JSON COMMENT 'Opportunities found',
          
          -- Model Info
          model_used VARCHAR(100),
          tokens_used INT DEFAULT 0,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Indexes
          INDEX idx_analysis (analysis_id),
          INDEX idx_project (project_id),
          INDEX idx_domain (domain),
          INDEX idx_prompt (prompt_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created: oracle_gemini_insights');
      
      // Pipeline log table
      stmt.execute(`
        CREATE TABLE IF NOT EXISTS ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.PIPELINE_LOG} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          
          project_id VARCHAR(100) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          pipeline_stage VARCHAR(100) NOT NULL,
          status ENUM('started', 'completed', 'failed') NOT NULL,
          
          -- Details
          message TEXT,
          duration_ms INT DEFAULT 0,
          error_details TEXT,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_project (project_id),
          INDEX idx_domain (domain),
          INDEX idx_stage (pipeline_stage)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created: oracle_pipeline_log');
      
      stmt.close();
      return true;
      
    } catch (e) {
      console.error('❌ Table creation failed: ' + e.message);
      stmt.close();
      return false;
    }
  }
  
  /**
   * Save complete pipeline analysis for a domain
   * @param {string} projectId - Project identifier
   * @param {string} domain - Domain analyzed
   * @param {Object} pipelineData - Complete pipeline extraction results
   * @returns {Object} Save result with ID
   */
  saveAnalysis(projectId, domain, pipelineData) {
    if (!this.connect()) {
      return { success: false, error: 'Database connection failed' };
    }
    
    try {
      const domainHash = this._hashString(domain);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ORACLE_PIPELINE_PERSISTENCE_CONFIG.REFRESH_DAYS * 24 * 60 * 60 * 1000);
      
      // Check if record exists
      const existingId = this._getExistingId(projectId, domainHash);
      
      let sql;
      if (existingId) {
        // UPDATE existing record
        sql = `
          UPDATE ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS}
          SET 
            pages_discovered_json = ?,
            pages_fetched_json = ?,
            headings_json = ?,
            keywords_json = ?,
            meta_links_json = ?,
            backlinks_json = ?,
            eeat_json = ?,
            heading_score = ?,
            keyword_score = ?,
            meta_links_score = ?,
            backlink_score = ?,
            eeat_score = ?,
            overall_score = ?,
            pages_analyzed = ?,
            total_headings = ?,
            total_keywords = ?,
            total_internal_links = ?,
            total_backlinks = ?,
            total_eeat_signals = ?,
            expires_at = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
      } else {
        // INSERT new record
        sql = `
          INSERT INTO ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS}
          (project_id, domain, domain_hash, analysis_type,
           pages_discovered_json, pages_fetched_json, headings_json, keywords_json,
           meta_links_json, backlinks_json, eeat_json,
           heading_score, keyword_score, meta_links_score, backlink_score, eeat_score, overall_score,
           pages_analyzed, total_headings, total_keywords, total_internal_links, total_backlinks, total_eeat_signals,
           expires_at)
          VALUES (?, ?, ?, 'competitor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      }
      
      const stmt = this.connection.prepareStatement(sql);
      
      // Extract scores and counts from pipeline data
      const scores = this._extractScores(pipelineData);
      const counts = this._extractCounts(pipelineData);
      
      if (existingId) {
        // UPDATE parameters
        stmt.setString(1, JSON.stringify(pipelineData.discovery || {}));
        stmt.setString(2, JSON.stringify(pipelineData.fetch || {}));
        stmt.setString(3, JSON.stringify(pipelineData.headings || {}));
        stmt.setString(4, JSON.stringify(pipelineData.keywords || {}));
        stmt.setString(5, JSON.stringify(pipelineData.metaLinks || {}));
        stmt.setString(6, JSON.stringify(pipelineData.backlinks || {}));
        stmt.setString(7, JSON.stringify(pipelineData.eeat || {}));
        stmt.setDouble(8, scores.headings);
        stmt.setDouble(9, scores.keywords);
        stmt.setDouble(10, scores.metaLinks);
        stmt.setDouble(11, scores.backlinks);
        stmt.setDouble(12, scores.eeat);
        stmt.setDouble(13, scores.overall);
        stmt.setInt(14, counts.pages);
        stmt.setInt(15, counts.headings);
        stmt.setInt(16, counts.keywords);
        stmt.setInt(17, counts.internalLinks);
        stmt.setInt(18, counts.backlinks);
        stmt.setInt(19, counts.eeatSignals);
        stmt.setString(20, Utilities.formatDate(expiresAt, 'UTC', 'yyyy-MM-dd HH:mm:ss'));
        stmt.setInt(21, existingId);
      } else {
        // INSERT parameters
        stmt.setString(1, projectId);
        stmt.setString(2, domain);
        stmt.setString(3, domainHash);
        stmt.setString(4, JSON.stringify(pipelineData.discovery || {}));
        stmt.setString(5, JSON.stringify(pipelineData.fetch || {}));
        stmt.setString(6, JSON.stringify(pipelineData.headings || {}));
        stmt.setString(7, JSON.stringify(pipelineData.keywords || {}));
        stmt.setString(8, JSON.stringify(pipelineData.metaLinks || {}));
        stmt.setString(9, JSON.stringify(pipelineData.backlinks || {}));
        stmt.setString(10, JSON.stringify(pipelineData.eeat || {}));
        stmt.setDouble(11, scores.headings);
        stmt.setDouble(12, scores.keywords);
        stmt.setDouble(13, scores.metaLinks);
        stmt.setDouble(14, scores.backlinks);
        stmt.setDouble(15, scores.eeat);
        stmt.setDouble(16, scores.overall);
        stmt.setInt(17, counts.pages);
        stmt.setInt(18, counts.headings);
        stmt.setInt(19, counts.keywords);
        stmt.setInt(20, counts.internalLinks);
        stmt.setInt(21, counts.backlinks);
        stmt.setInt(22, counts.eeatSignals);
        stmt.setString(23, Utilities.formatDate(expiresAt, 'UTC', 'yyyy-MM-dd HH:mm:ss'));
      }
      
      stmt.execute();
      stmt.close();
      
      // Get the ID (either existing or newly inserted)
      const recordId = existingId || this._getLastInsertId();
      
      console.log(`✅ Analysis saved for ${domain} (ID: ${recordId})`);
      
      return {
        success: true,
        id: recordId,
        domain: domain,
        isUpdate: !!existingId,
        scores: scores,
        counts: counts
      };
      
    } catch (e) {
      console.error(`❌ Save failed for ${domain}: ${e.message}`);
      return {
        success: false,
        error: e.message,
        domain: domain
      };
    }
  }
  
  /**
   * Save Gemini insights
   * @param {number} analysisId - Analysis record ID
   * @param {string} projectId - Project ID
   * @param {string} domain - Domain
   * @param {Object} insightsData - Gemini analysis results
   * @returns {Object} Save result
   */
  saveInsights(analysisId, projectId, domain, insightsData) {
    if (!this.connect()) {
      return { success: false, error: 'Database connection failed' };
    }
    
    try {
      const sql = `
        INSERT INTO ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.INSIGHTS}
        (analysis_id, project_id, domain, prompt_type, prompt_text, gemini_response_json,
         strategic_insights_json, action_items_json, competitive_gaps_json, opportunities_json,
         model_used, tokens_used)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = this.connection.prepareStatement(sql);
      
      stmt.setInt(1, analysisId);
      stmt.setString(2, projectId);
      stmt.setString(3, domain);
      stmt.setString(4, insightsData.promptType || 'comprehensive');
      stmt.setString(5, insightsData.prompt || '');
      stmt.setString(6, JSON.stringify(insightsData.response || {}));
      stmt.setString(7, JSON.stringify(insightsData.strategicInsights || []));
      stmt.setString(8, JSON.stringify(insightsData.actionItems || []));
      stmt.setString(9, JSON.stringify(insightsData.competitiveGaps || []));
      stmt.setString(10, JSON.stringify(insightsData.opportunities || []));
      stmt.setString(11, insightsData.model || 'gemini-3-flash-preview');
      stmt.setInt(12, insightsData.tokensUsed || 0);
      
      stmt.execute();
      stmt.close();
      
      const insightId = this._getLastInsertId();
      
      console.log(`✅ Insights saved for ${domain} (ID: ${insightId})`);
      
      return {
        success: true,
        id: insightId,
        analysisId: analysisId,
        domain: domain
      };
      
    } catch (e) {
      console.error(`❌ Insights save failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Log pipeline stage
   */
  logPipelineStage(projectId, domain, stage, status, message, durationMs = 0, errorDetails = null) {
    if (!this.connect()) return;
    
    try {
      const sql = `
        INSERT INTO ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.PIPELINE_LOG}
        (project_id, domain, pipeline_stage, status, message, duration_ms, error_details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, projectId);
      stmt.setString(2, domain);
      stmt.setString(3, stage);
      stmt.setString(4, status);
      stmt.setString(5, message);
      stmt.setInt(6, durationMs);
      stmt.setString(7, errorDetails);
      stmt.execute();
      stmt.close();
      
    } catch (e) {
      console.error(`❌ Log failed: ${e.message}`);
    }
  }
  
  /**
   * Get analysis for a domain
   * @param {string} projectId - Project ID
   * @param {string} domain - Domain
   * @returns {Object} Analysis data or null
   */
  getAnalysis(projectId, domain) {
    if (!this.connect()) return null;
    
    try {
      const domainHash = this._hashString(domain);
      const sql = `
        SELECT * FROM ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS}
        WHERE project_id = ? AND domain_hash = ?
        LIMIT 1
      `;
      
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, projectId);
      stmt.setString(2, domainHash);
      
      const rs = stmt.executeQuery();
      
      if (rs.next()) {
        const result = {
          id: rs.getInt('id'),
          domain: rs.getString('domain'),
          discovery: JSON.parse(rs.getString('pages_discovered_json') || '{}'),
          fetch: JSON.parse(rs.getString('pages_fetched_json') || '{}'),
          headings: JSON.parse(rs.getString('headings_json') || '{}'),
          keywords: JSON.parse(rs.getString('keywords_json') || '{}'),
          metaLinks: JSON.parse(rs.getString('meta_links_json') || '{}'),
          backlinks: JSON.parse(rs.getString('backlinks_json') || '{}'),
          eeat: JSON.parse(rs.getString('eeat_json') || '{}'),
          scores: {
            headings: rs.getDouble('heading_score'),
            keywords: rs.getDouble('keyword_score'),
            metaLinks: rs.getDouble('meta_links_score'),
            backlinks: rs.getDouble('backlink_score'),
            eeat: rs.getDouble('eeat_score'),
            overall: rs.getDouble('overall_score')
          },
          counts: {
            pages: rs.getInt('pages_analyzed'),
            headings: rs.getInt('total_headings'),
            keywords: rs.getInt('total_keywords'),
            internalLinks: rs.getInt('total_internal_links'),
            backlinks: rs.getInt('total_backlinks'),
            eeatSignals: rs.getInt('total_eeat_signals')
          },
          createdAt: rs.getString('created_at'),
          updatedAt: rs.getString('updated_at'),
          expiresAt: rs.getString('expires_at')
        };
        
        rs.close();
        stmt.close();
        return result;
      }
      
      rs.close();
      stmt.close();
      return null;
      
    } catch (e) {
      console.error(`❌ Get analysis failed: ${e.message}`);
      return null;
    }
  }
  
  /**
   * Check if analysis needs refresh
   */
  needsRefresh(projectId, domain) {
    if (!this.connect()) return true;
    
    try {
      const domainHash = this._hashString(domain);
      const sql = `
        SELECT expires_at FROM ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS}
        WHERE project_id = ? AND domain_hash = ?
        AND expires_at > NOW()
        LIMIT 1
      `;
      
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, projectId);
      stmt.setString(2, domainHash);
      
      const rs = stmt.executeQuery();
      const hasValidData = rs.next();
      
      rs.close();
      stmt.close();
      
      return !hasValidData;
      
    } catch (e) {
      return true;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _getExistingId(projectId, domainHash) {
    try {
      const sql = `SELECT id FROM ${ORACLE_PIPELINE_PERSISTENCE_CONFIG.TABLES.ANALYSIS} WHERE project_id = ? AND domain_hash = ?`;
      const stmt = this.connection.prepareStatement(sql);
      stmt.setString(1, projectId);
      stmt.setString(2, domainHash);
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
  
  _getLastInsertId() {
    try {
      const stmt = this.connection.createStatement();
      const rs = stmt.executeQuery('SELECT LAST_INSERT_ID() as id');
      let id = 0;
      if (rs.next()) {
        id = rs.getInt('id');
      }
      rs.close();
      stmt.close();
      return id;
    } catch (e) {
      return 0;
    }
  }
  
  _extractScores(data) {
    return {
      headings: data.headings?.scores?.overall || 0,
      keywords: data.keywords?.intentDistribution ? 70 : 0, // Placeholder
      metaLinks: data.metaLinks?.scores?.overall || 0,
      backlinks: data.backlinks?.analysis?.qualityScore || 0,
      eeat: data.eeat?.scores?.overall || 0,
      overall: 0 // Will be calculated
    };
  }
  
  _extractCounts(data) {
    return {
      pages: data.fetch?.pageCount || 0,
      headings: data.headings?.totalHeadings || 0,
      keywords: data.keywords?.totalKeywords || 0,
      internalLinks: data.metaLinks?.internalLinkCount || 0,
      backlinks: data.backlinks?.backlinkCount || 0,
      eeatSignals: data.eeat?.totalSignals || 0
    };
  }
  
  _hashString(str) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
    return bytes.map(b => ('0' + ((b & 0xff).toString(16))).slice(-2)).join('');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get pipeline persistence instance
 * @returns {OraclePipelinePersistence}
 */
function getPipelinePersistence() {
  return new OraclePipelinePersistence();
}

/**
 * Initialize database tables
 * @returns {boolean} Success
 */
function initializePipelineTables() {
  const persistence = getPipelinePersistence();
  const result = persistence.initializeTables();
  persistence.disconnect();
  return result;
}

/**
 * Save pipeline analysis
 * @param {string} projectId - Project ID
 * @param {string} domain - Domain
 * @param {Object} pipelineData - Complete pipeline data
 * @returns {Object} Save result
 */
function savePipelineAnalysis(projectId, domain, pipelineData) {
  const persistence = getPipelinePersistence();
  const result = persistence.saveAnalysis(projectId, domain, pipelineData);
  persistence.disconnect();
  return result;
}

/**
 * Get pipeline analysis
 * @param {string} projectId - Project ID
 * @param {string} domain - Domain
 * @returns {Object} Analysis data
 */
function getPipelineAnalysis(projectId, domain) {
  const persistence = getPipelinePersistence();
  const result = persistence.getAnalysis(projectId, domain);
  persistence.disconnect();
  return result;
}

/**
 * Test persistence
 */
function testPipelinePersistence() {
  console.log('🧪 Testing Pipeline Persistence...');
  
  // Initialize tables
  const initResult = initializePipelineTables();
  console.log('Table init:', initResult);
  
  // Test save
  const testData = {
    discovery: { blogPageCount: 10 },
    fetch: { pageCount: 11, successCount: 10 },
    headings: { totalHeadings: 50, scores: { overall: 75 } },
    keywords: { totalKeywords: 100 },
    metaLinks: { internalLinkCount: 30, scores: { overall: 80 } },
    backlinks: { backlinkCount: 25, analysis: { qualityScore: 60 } },
    eeat: { totalSignals: 40, scores: { overall: 70 } }
  };
  
  const saveResult = savePipelineAnalysis('test-project', 'example.com', testData);
  console.log('Save result:', JSON.stringify(saveResult, null, 2));
  
  // Test get
  const getResult = getPipelineAnalysis('test-project', 'example.com');
  console.log('Get result:', JSON.stringify(getResult, null, 2));
  
  return { initResult, saveResult, getResult };
}

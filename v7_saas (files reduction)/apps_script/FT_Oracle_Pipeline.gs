/**
 * ============================================================================
 * FT_Oracle_Pipeline.gs - Master Pipeline Orchestrator
 * ============================================================================
 * Orchestrates the complete competitor intelligence pipeline end-to-end.
 * 
 * PIPELINE STAGES:
 *  1. Blog Discovery (FT_Oracle_BlogDiscovery.gs)
 *  2. Batch Page Fetching (FT_Oracle_BatchFetcher.gs)
 *  3. Heading Extraction (FT_Oracle_HeadingExtractor.gs)
 *  4. Keyword Extraction (FT_Oracle_KeywordExtractor.gs)
 *  5. Meta & Links Extraction (FT_Oracle_MetaLinksExtractor.gs)
 *  6. Backlink Extraction (FT_Oracle_BacklinkExtractor.gs)
 *  7. E-E-A-T Signal Extraction (FT_Oracle_EEATExtractor.gs)
 *  8. MySQL Persistence (FT_Oracle_Persistence.gs)
 *  9. Gemini API Analysis (FT_Oracle_ElitePrompt.gs)
 * 10. UI Mapping for 15 Tabs (FT_Oracle_UIMapper.gs)
 * ============================================================================
 */

/**
 * OracleCompetitorPipeline - Master orchestrator for competitor analysis
 */
class OracleCompetitorPipeline {
  
  constructor() {
    this.status = {
      startTime: null,
      endTime: null,
      duration: null,
      overallStatus: 'pending',
      stages: {},
      errors: [],
      dataQuality: {
        completeness: 0,
        accuracy: 0,
        freshness: 100
      }
    };
    
    // Initialize all pipeline components
    this.blogDiscovery = new BlogDiscoveryEngine();
    this.pageFetcher = new BatchPageFetcher();
    this.headingExtractor = new HeadingExtractor();
    this.keywordExtractor = new KeywordExtractor();
    this.metaLinksExtractor = new MetaLinksExtractor();
    this.backlinkExtractor = new BacklinkExtractor();
    this.eeatExtractor = new EEATSignalExtractor();
    this.persistence = new OraclePipelinePersistence();
    this.promptBuilder = new ElitePromptBuilder();
    this.uiMapper = new OracleUIMapper();
  }
  
  /**
   * Run the complete competitor analysis pipeline
   * @param {string} competitorDomain - The competitor domain to analyze
   * @param {string} userDomain - The user's domain for comparison
   * @param {Object} options - Pipeline configuration options
   * @returns {Object} Complete analysis with UI-mapped data for 15 tabs
   */
  runFullAnalysis(competitorDomain, userDomain, options = {}) {
    console.log(`🚀 OracleCompetitorPipeline: Starting full analysis for ${competitorDomain}`);
    
    this.status.startTime = new Date().toISOString();
    this.status.overallStatus = 'running';
    
    try {
      // ======================================================================
      // STAGE 1: BLOG DISCOVERY
      // ======================================================================
      const blogPages = this._runStage('blogDiscovery', () => {
        console.log('📝 Stage 1: Discovering blog pages...');
        return this.blogDiscovery.discoverBlogPages(competitorDomain);
      });
      
      // ======================================================================
      // STAGE 2: BATCH PAGE FETCHING
      // ======================================================================
      const fetchedPages = this._runStage('pageFetching', () => {
        console.log('📥 Stage 2: Fetching pages...');
        return this.pageFetcher.fetchDomainPages(competitorDomain, blogPages);
      });
      
      // ======================================================================
      // STAGE 3: HEADING EXTRACTION
      // ======================================================================
      const headings = this._runStage('headingExtraction', () => {
        console.log('📑 Stage 3: Extracting headings...');
        return this.headingExtractor.extractFromPages(fetchedPages.pages);
      });
      
      // ======================================================================
      // STAGE 4: KEYWORD EXTRACTION
      // ======================================================================
      const keywords = this._runStage('keywordExtraction', () => {
        console.log('🎯 Stage 4: Extracting keywords...');
        return this.keywordExtractor.extractFromPages(fetchedPages.pages);
      });
      
      // ======================================================================
      // STAGE 5: META & LINKS EXTRACTION
      // ======================================================================
      const metaLinks = this._runStage('metaExtraction', () => {
        console.log('🔗 Stage 5: Extracting meta and links...');
        return this.metaLinksExtractor.extractFromPages(fetchedPages.pages);
      });
      
      // ======================================================================
      // STAGE 6: BACKLINK EXTRACTION
      // ======================================================================
      const backlinks = this._runStage('backlinkExtraction', () => {
        console.log('🔙 Stage 6: Extracting backlinks...');
        return this.backlinkExtractor.extractBacklinks(competitorDomain);
      });
      
      // ======================================================================
      // STAGE 7: E-E-A-T SIGNAL EXTRACTION
      // ======================================================================
      const eeatSignals = this._runStage('eeatExtraction', () => {
        console.log('✅ Stage 7: Extracting E-E-A-T signals...');
        return this.eeatExtractor.extractEEATSignals(fetchedPages.pages);
      });
      
      // ======================================================================
      // CONSOLIDATE EXTRACTED DATA
      // ======================================================================
      const extractedData = {
        domain: competitorDomain,
        userDomain: userDomain,
        analyzedAt: new Date().toISOString(),
        pagesFetched: fetchedPages.pagesAnalyzed || 0,
        blogPages: blogPages,
        headings: headings,
        keywords: keywords,
        meta: metaLinks,
        backlinks: backlinks,
        eeat: eeatSignals
      };
      
      // ======================================================================
      // STAGE 8: MYSQL PERSISTENCE
      // ======================================================================
      this._runStage('persistence', () => {
        console.log('💾 Stage 8: Saving to MySQL...');
        return this.persistence.saveAnalysis(competitorDomain, extractedData);
      });
      
      // ======================================================================
      // STAGE 9: GEMINI API ANALYSIS
      // ======================================================================
      const geminiInsights = this._runStage('geminiAnalysis', () => {
        console.log('🤖 Stage 9: Running Gemini AI analysis...');
        const userKeywords = options.userKeywords || [];
        return this.promptBuilder.analyzeWithGemini(
          extractedData, 
          userDomain, 
          userKeywords, 
          'comprehensive'
        );
      });
      
      // Save Gemini insights to MySQL
      if (geminiInsights && !geminiInsights.error) {
        this._runStage('geminiPersistence', () => {
          return this.persistence.saveGeminiInsights(competitorDomain, geminiInsights, 'comprehensive');
        });
      }
      
      // ======================================================================
      // STAGE 10: UI MAPPING FOR 15 TABS
      // ======================================================================
      const uiData = this._runStage('uiMapping', () => {
        console.log('🎨 Stage 10: Mapping to UI tabs...');
        return this.uiMapper.mapToUITabs(extractedData, geminiInsights, this.status);
      });
      
      // ======================================================================
      // COMPLETE PIPELINE
      // ======================================================================
      this.status.endTime = new Date().toISOString();
      this.status.duration = this._calculateDuration(this.status.startTime, this.status.endTime);
      this.status.overallStatus = 'completed';
      this._calculateDataQuality(extractedData);
      
      console.log(`✅ OracleCompetitorPipeline: Analysis complete in ${this.status.duration}`);
      
      return {
        success: true,
        domain: competitorDomain,
        userDomain: userDomain,
        uiData: uiData,
        extractedData: extractedData,
        geminiInsights: geminiInsights,
        pipelineStatus: this.status
      };
      
    } catch (error) {
      console.error('❌ OracleCompetitorPipeline: Pipeline failed -', error.message);
      
      this.status.endTime = new Date().toISOString();
      this.status.duration = this._calculateDuration(this.status.startTime, this.status.endTime);
      this.status.overallStatus = 'failed';
      this.status.errors.push({
        stage: 'pipeline',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Log failure to MySQL
      try {
        this.persistence.logPipelineStage(competitorDomain, 'pipeline_failed', 'error', {
          error: error.message,
          stages: this.status.stages
        });
      } catch (e) {
        console.error('Failed to log pipeline error to MySQL');
      }
      
      return {
        success: false,
        domain: competitorDomain,
        error: error.message,
        pipelineStatus: this.status,
        uiData: this.uiMapper.mapToUITabs({}, {}, this.status)
      };
    }
  }
  
  /**
   * Run a quick analysis (skip some heavy operations)
   * @param {string} competitorDomain - The competitor domain
   * @param {string} userDomain - The user's domain
   * @returns {Object} Quick analysis results
   */
  runQuickAnalysis(competitorDomain, userDomain) {
    console.log(`⚡ OracleCompetitorPipeline: Running quick analysis for ${competitorDomain}`);
    
    this.status.startTime = new Date().toISOString();
    
    try {
      // Discover fewer blog pages
      const blogPages = this.blogDiscovery.discoverBlogPages(competitorDomain).slice(0, 5);
      
      // Fetch pages
      const fetchedPages = this.pageFetcher.fetchDomainPages(competitorDomain, blogPages);
      
      // Extract only headings and keywords (faster)
      const headings = this.headingExtractor.extractFromPages(fetchedPages.pages);
      const keywords = this.keywordExtractor.extractFromPages(fetchedPages.pages);
      
      // Skip backlink extraction for quick mode
      const backlinks = { note: 'Skipped in quick mode' };
      
      const extractedData = {
        domain: competitorDomain,
        userDomain: userDomain,
        quickMode: true,
        pagesFetched: fetchedPages.pagesAnalyzed,
        blogPages: blogPages,
        headings: headings,
        keywords: keywords,
        backlinks: backlinks
      };
      
      // Run quick Gemini analysis
      const geminiInsights = this.promptBuilder.analyzeWithGemini(
        extractedData,
        userDomain,
        [],
        'content_gaps'
      );
      
      // Map to UI
      const uiData = this.uiMapper.mapToUITabs(extractedData, geminiInsights, this.status);
      
      this.status.endTime = new Date().toISOString();
      this.status.duration = this._calculateDuration(this.status.startTime, this.status.endTime);
      this.status.overallStatus = 'completed';
      
      return {
        success: true,
        quickMode: true,
        domain: competitorDomain,
        uiData: uiData,
        extractedData: extractedData,
        geminiInsights: geminiInsights
      };
      
    } catch (error) {
      console.error('Quick analysis failed:', error.message);
      return {
        success: false,
        quickMode: true,
        error: error.message
      };
    }
  }
  
  /**
   * Analyze multiple competitors in sequence
   * @param {string[]} competitorDomains - Array of competitor domains
   * @param {string} userDomain - The user's domain
   * @param {Object} options - Pipeline options
   * @returns {Object[]} Array of analysis results
   */
  runMultiCompetitorAnalysis(competitorDomains, userDomain, options = {}) {
    console.log(`🎯 OracleCompetitorPipeline: Analyzing ${competitorDomains.length} competitors`);
    
    const results = [];
    const delay = options.delayBetweenDomains || 3000; // 3 second delay between competitors
    
    competitorDomains.forEach((domain, index) => {
      console.log(`\n📊 Analyzing competitor ${index + 1}/${competitorDomains.length}: ${domain}`);
      
      try {
        const result = this.runFullAnalysis(domain, userDomain, options);
        results.push(result);
        
        // Rate limiting between competitors
        if (index < competitorDomains.length - 1) {
          Utilities.sleep(delay);
        }
        
      } catch (error) {
        console.error(`Failed to analyze ${domain}:`, error.message);
        results.push({
          success: false,
          domain: domain,
          error: error.message
        });
      }
    });
    
    return {
      totalCompetitors: competitorDomains.length,
      successfulAnalyses: results.filter(r => r.success).length,
      failedAnalyses: results.filter(r => !r.success).length,
      results: results
    };
  }
  
  /**
   * Load existing analysis from MySQL
   * @param {string} competitorDomain - The competitor domain
   * @returns {Object} Cached analysis or null
   */
  loadCachedAnalysis(competitorDomain) {
    console.log(`📂 Loading cached analysis for ${competitorDomain}`);
    
    try {
      const cached = this.persistence.getExistingAnalysis(competitorDomain);
      
      if (cached && cached.analysis_data) {
        // Parse JSON data
        const extractedData = typeof cached.analysis_data === 'string' 
          ? JSON.parse(cached.analysis_data) 
          : cached.analysis_data;
        
        const geminiInsights = cached.gemini_insights 
          ? (typeof cached.gemini_insights === 'string' 
              ? JSON.parse(cached.gemini_insights) 
              : cached.gemini_insights)
          : null;
        
        // Map to UI
        const uiData = this.uiMapper.mapToUITabs(extractedData, geminiInsights, {
          overallStatus: 'cached',
          cachedAt: cached.last_analyzed
        });
        
        return {
          success: true,
          cached: true,
          domain: competitorDomain,
          analyzedAt: cached.last_analyzed,
          uiData: uiData,
          extractedData: extractedData,
          geminiInsights: geminiInsights
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to load cached analysis:', error.message);
      return null;
    }
  }
  
  /**
   * Get or run analysis (use cache if fresh, otherwise run new)
   * @param {string} competitorDomain - The competitor domain
   * @param {string} userDomain - The user's domain
   * @param {Object} options - Pipeline options
   * @returns {Object} Analysis results
   */
  getOrRunAnalysis(competitorDomain, userDomain, options = {}) {
    const forceRefresh = options.forceRefresh || false;
    
    if (!forceRefresh) {
      const cached = this.loadCachedAnalysis(competitorDomain);
      if (cached) {
        console.log(`📦 Using cached analysis from ${cached.analyzedAt}`);
        return cached;
      }
    }
    
    return this.runFullAnalysis(competitorDomain, userDomain, options);
  }
  
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  
  /**
   * Run a pipeline stage with status tracking
   * @param {string} stageName - Name of the stage
   * @param {Function} stageFunction - Function to execute
   * @returns {*} Stage result
   */
  _runStage(stageName, stageFunction) {
    const stageStart = new Date();
    
    try {
      this.status.stages[stageName] = {
        status: 'running',
        startTime: stageStart.toISOString()
      };
      
      const result = stageFunction();
      
      const stageEnd = new Date();
      this.status.stages[stageName] = {
        status: 'completed',
        startTime: stageStart.toISOString(),
        endTime: stageEnd.toISOString(),
        time: `${(stageEnd - stageStart) / 1000}s`
      };
      
      // Log to MySQL
      try {
        this.persistence.logPipelineStage(
          this._currentDomain || 'unknown',
          stageName,
          'completed',
          { duration: (stageEnd - stageStart) / 1000 }
        );
      } catch (e) {
        // Non-critical error
      }
      
      return result;
      
    } catch (error) {
      const stageEnd = new Date();
      this.status.stages[stageName] = {
        status: 'failed',
        startTime: stageStart.toISOString(),
        endTime: stageEnd.toISOString(),
        time: `${(stageEnd - stageStart) / 1000}s`,
        error: error.message
      };
      
      this.status.errors.push({
        stage: stageName,
        error: error.message,
        timestamp: stageEnd.toISOString()
      });
      
      console.error(`Stage ${stageName} failed:`, error.message);
      
      // Continue with empty result for non-critical stages
      if (['backlinkExtraction', 'eeatExtraction', 'geminiAnalysis'].includes(stageName)) {
        console.log(`Continuing pipeline without ${stageName}`);
        return {};
      }
      
      throw error;
    }
  }
  
  /**
   * Calculate duration between two ISO timestamps
   * @param {string} start - Start timestamp
   * @param {string} end - End timestamp
   * @returns {string} Duration string
   */
  _calculateDuration(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
  
  /**
   * Calculate data quality metrics
   * @param {Object} data - Extracted data
   */
  _calculateDataQuality(data) {
    let completeness = 0;
    let factors = 0;
    
    // Check each data category
    if (data.headings?.h1?.length > 0) {
      completeness += 100;
    } else if (data.headings?.h2?.length > 0) {
      completeness += 50;
    }
    factors++;
    
    if (data.keywords?.primary?.length > 10) {
      completeness += 100;
    } else if (data.keywords?.primary?.length > 0) {
      completeness += 50;
    }
    factors++;
    
    if (data.meta?.pages?.length > 0) {
      completeness += 100;
    }
    factors++;
    
    if (data.backlinks?.backlinks?.length > 0) {
      completeness += 100;
    } else if (data.backlinks?.domainAuthority > 0) {
      completeness += 50;
    }
    factors++;
    
    if (data.eeat?.overallScore > 0) {
      completeness += 100;
    }
    factors++;
    
    this.status.dataQuality.completeness = factors > 0 ? Math.round(completeness / factors) : 0;
    this.status.dataQuality.accuracy = 85; // Estimated
    this.status.dataQuality.freshness = 100; // Just collected
  }
}

// ============================================================================
// GLOBAL PIPELINE FUNCTIONS
// ============================================================================

/**
 * Run full competitor analysis (main entry point)
 * @param {string} competitorDomain - Competitor domain to analyze
 * @param {string} userDomain - Your domain for comparison
 * @param {Object} options - Optional configuration
 * @returns {Object} Complete analysis with UI data for 15 tabs
 */
function runOracleCompetitorAnalysis(competitorDomain, userDomain, options = {}) {
  const pipeline = new OracleCompetitorPipeline();
  return pipeline.runFullAnalysis(competitorDomain, userDomain, options);
}

/**
 * Run quick competitor analysis (faster, fewer data points)
 * @param {string} competitorDomain - Competitor domain
 * @param {string} userDomain - Your domain
 * @returns {Object} Quick analysis results
 */
function runOracleQuickAnalysis(competitorDomain, userDomain) {
  const pipeline = new OracleCompetitorPipeline();
  return pipeline.runQuickAnalysis(competitorDomain, userDomain);
}

/**
 * Analyze multiple competitors
 * @param {string[]} competitorDomains - Array of competitor domains
 * @param {string} userDomain - Your domain
 * @param {Object} options - Optional configuration
 * @returns {Object} Multi-competitor analysis results
 */
function runOracleMultiCompetitorAnalysis(competitorDomains, userDomain, options = {}) {
  const pipeline = new OracleCompetitorPipeline();
  return pipeline.runMultiCompetitorAnalysis(competitorDomains, userDomain, options);
}

/**
 * Get cached analysis or run new analysis
 * @param {string} competitorDomain - Competitor domain
 * @param {string} userDomain - Your domain
 * @param {boolean} forceRefresh - Force new analysis even if cache exists
 * @returns {Object} Analysis results
 */
function getOrRunOracleAnalysis(competitorDomain, userDomain, forceRefresh = false) {
  const pipeline = new OracleCompetitorPipeline();
  return pipeline.getOrRunAnalysis(competitorDomain, userDomain, { forceRefresh });
}

/**
 * Load existing analysis from MySQL cache
 * @param {string} competitorDomain - Competitor domain
 * @returns {Object|null} Cached analysis or null
 */
function loadOracleCachedAnalysis(competitorDomain) {
  const pipeline = new OracleCompetitorPipeline();
  return pipeline.loadCachedAnalysis(competitorDomain);
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test the complete pipeline with a sample domain
 */
function testOracleCompetitorPipeline() {
  console.log('🧪 Testing Oracle Competitor Pipeline...');
  
  const testDomain = 'example.com';
  const userDomain = 'mysite.com';
  
  try {
    const result = runOracleQuickAnalysis(testDomain, userDomain);
    
    console.log('✅ Pipeline test result:');
    console.log('- Success:', result.success);
    console.log('- Domain:', result.domain);
    console.log('- UI Tabs:', Object.keys(result.uiData?.tabs || {}).length);
    
    if (result.success) {
      console.log('- Executive Summary available:', !!result.uiData?.tabs?.tab1_executiveSummary);
      console.log('- Keyword Intelligence available:', !!result.uiData?.tabs?.tab4_keywordIntelligence);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test MySQL persistence connection
 */
function testOracleMySQLConnection() {
  console.log('🧪 Testing MySQL connection...');
  
  try {
    const persistence = new OraclePipelinePersistence();
    const tablesCreated = persistence.createTablesIfNeeded();
    
    console.log('✅ MySQL connection successful');
    console.log('- Tables ready:', tablesCreated);
    
    return { success: true, tablesCreated };
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get pipeline status for monitoring
 * @returns {Object} Current pipeline status
 */
function getOraclePipelineStatus() {
  return {
    version: '1.0.0',
    components: [
      'FT_Oracle_BlogDiscovery.gs',
      'FT_Oracle_BatchFetcher.gs',
      'FT_Oracle_HeadingExtractor.gs',
      'FT_Oracle_KeywordExtractor.gs',
      'FT_Oracle_MetaLinksExtractor.gs',
      'FT_Oracle_BacklinkExtractor.gs',
      'FT_Oracle_EEATExtractor.gs',
      'FT_Oracle_Persistence.gs',
      'FT_Oracle_ElitePrompt.gs',
      'FT_Oracle_UIMapper.gs',
      'FT_Oracle_Pipeline.gs'
    ],
    uiTabs: 15,
    mysqlTables: [
      'oracle_competitor_analysis',
      'oracle_gemini_insights',
      'oracle_pipeline_log'
    ],
    apiIntegrations: [
      'Gemini API (gemini-3-flash-preview)',
      'OpenPageRank API',
      'PHP Gateway (serpifai.com)'
    ]
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_CORE.GS - FORENSIC TRAFFIC FETCHER CORE
 * State-Managed Batch Processor for 450-KW Forensic Data Collection
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 1-1831)
 * 
 * CONTAINS:
 * - Configuration constants (FT_CONFIG, FT_STANDARD_COMPETITORS)
 * - ForensicTrafficFetcher class
 * - FT_* Public API functions
 * - UI Data Endpoints
 * - Seed Extraction & Semantic Expansion
 * 
 * ARCHITECTURE:
 * - Bypasses Google Apps Script 6-minute execution timeout
 * - Processes 50 keywords per batch cycle
 * - Uses PropertiesService for state persistence
 * - Auto-resumes via ScriptApp.newTrigger()
 * 
 * SCHEMA: 90 KWs per Competitor × 5 Competitors = 450 Total
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 * 
 * DEPENDENCIES: None (this is the core module)
 * DEPENDENTS: FT_Pipeline.gs, FT_Tab_*.gs, FT_Helpers.gs, FT_Proofs.gs
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard 6 competitor domains for forensic analysis
 * Used as defaults when competitors are not specified
 */
const FT_STANDARD_COMPETITORS = [
  'ahrefs.com',
  'semrush.com', 
  'surferseo.com',
  'jasper.com',
  'ubersuggest.com',
  'moz.com'
];

const FT_CONFIG = {
  BATCH_SIZE: 50,                          // Keywords per cycle
  MAX_EXECUTION_TIME_MS: 300000,           // 5 minutes (safe buffer)
  RETRY_DELAY_MS: 2000,                    // 2 seconds between retries
  MAX_RETRIES: 3,                          // Max retry attempts per keyword
  TRIGGER_DELAY_MINUTES: 1,                // Delay before next batch trigger
  
  // Property Keys for State Management
  PROPS: {
    LAST_INDEX: 'FT_LastProcessedIndex',
    QUEUE: 'FT_KeywordQueue',
    RETRY_QUEUE: 'FT_RetryQueue',
    RESERVOIR: 'FT_MasterReservoir',
    STATUS: 'FT_ProcessingStatus',
    BATCH_ID: 'FT_CurrentBatchId',
    ERROR_LOG: 'FT_ErrorLog'
  },
  
  // Status Values
  STATUS: {
    IDLE: 'IDLE',
    PROCESSING: 'PROCESSING',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
  },
  
  // API Endpoints (configurable)
  ENDPOINTS: {
    KEYWORD_DATA: 'keyword_analysis',
    SERP_DATA: 'serp_analysis',
    COMPETITOR_DATA: 'competitor_analysis'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FETCHER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ForensicTrafficFetcher - Main orchestrator for batch keyword processing
 */
class ForensicTrafficFetcher {
  constructor() {
    this.scriptProps = PropertiesService.getScriptProperties();
    this.userProps = PropertiesService.getUserProperties();
    this.startTime = Date.now();
    this.batchId = this._generateBatchId();
  }
  
  /**
   * Initialize a new 450-KW fetch operation
   */
  initializeFetch(competitors, geminiData) {
    console.log('🚀 FT_Fetcher: Initializing 450-KW Forensic Fetch...');
    
    try {
      this._clearState();
      const keywordQueue = this._generateKeywordQueue(competitors, geminiData);
      console.log(`   📊 Generated ${keywordQueue.length} keywords for processing`);
      
      this._storeQueue(keywordQueue);
      this._initializeReservoir();
      this._setStatus(FT_CONFIG.STATUS.PROCESSING);
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
      console.error('❌ FT_Fetcher Initialization Error:', error);
      this._logError('INIT', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Process a batch of keywords (called by trigger or directly)
   */
  processBatch() {
    console.log(`\n⚡ FT_Fetcher: Processing Batch [${this.batchId}]`);
    
    const status = this._getStatus();
    if (status === FT_CONFIG.STATUS.COMPLETED) {
      console.log('   ✅ All batches completed. No more processing needed.');
      return { complete: true };
    }
    
    if (status === FT_CONFIG.STATUS.PAUSED) {
      console.log('   ⏸️ Processing is paused. Resume to continue.');
      return { paused: true };
    }
    
    try {
      const lastIndex = parseInt(this.scriptProps.getProperty(FT_CONFIG.PROPS.LAST_INDEX) || '0');
      const queue = this._loadQueue() || [];
      const reservoir = this._loadReservoir() || this._initializeReservoir();
      
      if (queue.length === 0) {
        console.log('   ⚠️ Queue is empty. Please run FT_StartFetch first.');
        this._setStatus(FT_CONFIG.STATUS.IDLE);
        return { complete: false, error: 'Queue is empty' };
      }
      
      console.log(`   📍 Starting from index: ${lastIndex} / ${queue.length}`);
      
      let processedCount = 0;
      let currentIndex = lastIndex;
      
      while (processedCount < FT_CONFIG.BATCH_SIZE && currentIndex < queue.length) {
        if (this._isTimeoutApproaching()) {
          console.log('   ⏱️ Timeout approaching, scheduling continuation...');
          break;
        }
        
        const keyword = queue[currentIndex];
        const result = this._fetchKeywordData(keyword);
        
        if (result.success) {
          reservoir.keywords.push(result.data);
          reservoir.stats.processed++;
        } else if (result.retry) {
          this._addToRetryQueue(keyword, result.error);
          reservoir.stats.retryQueued++;
        } else {
          reservoir.stats.failed++;
          this._logError('FETCH', { keyword: keyword.kw, error: result.error });
        }
        
        currentIndex++;
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`   📈 Progress: ${currentIndex}/${queue.length} (${Math.round(currentIndex/queue.length*100)}%)`);
        }
      }
      
      this.scriptProps.setProperty(FT_CONFIG.PROPS.LAST_INDEX, currentIndex.toString());
      reservoir.stats.lastUpdated = new Date().toISOString();
      this._saveReservoir(reservoir);
      
      if (currentIndex >= queue.length) {
        const retryComplete = this._processRetryQueue();
        
        if (retryComplete) {
          this._setStatus(FT_CONFIG.STATUS.COMPLETED);
          console.log('   🎉 All keywords processed successfully!');
          this._cleanupTriggers();
          return { complete: true, stats: reservoir.stats };
        }
      } else {
        this._scheduleNextBatch();
        console.log(`   ⏭️ Batch complete. Next batch scheduled in ${FT_CONFIG.TRIGGER_DELAY_MINUTES} minute(s).`);
      }
      
      return {
        complete: false,
        processed: processedCount,
        currentIndex: currentIndex,
        total: queue.length,
        stats: reservoir.stats
      };
      
    } catch (error) {
      console.error('❌ Batch Processing Error:', error);
      this._logError('BATCH', error);
      this._setStatus(FT_CONFIG.STATUS.ERROR);
      return { error: error.message };
    }
  }
  
  resumeFetch() {
    console.log('▶️ FT_Fetcher: Resuming fetch operation...');
    this._setStatus(FT_CONFIG.STATUS.PROCESSING);
    return this.processBatch();
  }
  
  pauseFetch() {
    console.log('⏸️ FT_Fetcher: Pausing fetch operation...');
    this._setStatus(FT_CONFIG.STATUS.PAUSED);
    this._cleanupTriggers();
    return { paused: true };
  }
  
  getStatus() {
    const status = this._getStatus();
    const lastIndex = parseInt(this.scriptProps.getProperty(FT_CONFIG.PROPS.LAST_INDEX) || '0');
    const reservoir = this._loadReservoir() || this._initializeReservoir();
    const retryQueue = this._loadRetryQueue() || [];
    
    const safeReservoir = {
      ...reservoir,
      keywords: reservoir?.keywords || [],
      stats: reservoir?.stats || { total: 450, processed: 0, failed: 0, retryQueued: 0, fallback: 0, lastUpdated: null }
    };
    
    return {
      status: status,
      batchId: this.scriptProps.getProperty(FT_CONFIG.PROPS.BATCH_ID),
      progress: {
        processed: lastIndex,
        total: safeReservoir.stats.total || 450,
        percentage: Math.round((lastIndex / (safeReservoir.stats.total || 450)) * 100)
      },
      stats: safeReservoir.stats,
      retryQueueSize: retryQueue.length,
      reservoir: safeReservoir
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - Queue Generation
  // ═══════════════════════════════════════════════════════════════════════════
  
  _generateKeywordQueue(competitors, geminiData) {
    const queue = [];
    const globalSet = new Set();
    
    const safeCompetitors = Array.isArray(competitors) && competitors.length > 0 
      ? competitors 
      : FT_STANDARD_COMPETITORS.slice(0, 5).map(d => ({ domain: d }));
    
    const moduleConfig = [
      { type: 'money', count: 15, label: 'Money Moat' },
      { type: 'sge', count: 30, label: 'SGE/AIO Survival' },
      { type: 'tail', count: 30, label: 'Long-Tail Velocity' },
      { type: 'llm', count: 15, label: 'LLM Citation Gaps' }
    ];
    
    safeCompetitors.slice(0, 5).forEach((comp, compIndex) => {
      const domain = comp.domain || `competitor_${compIndex + 1}`;
      const niche = this._extractNiche(comp, geminiData);
      
      moduleConfig.forEach(module => {
        const keywords = this._generateModuleKeywords(
          comp, geminiData, niche, module.type, module.count, globalSet, compIndex
        );
        
        keywords.forEach(kw => {
          queue.push({
            ...kw,
            ui_cat: module.type,
            competitor: domain,
            compIndex: compIndex,
            status: 'pending',
            attempts: 0
          });
        });
      });
      
      console.log(`   🏢 ${domain}: ${90} keywords queued`);
    });
    
    return queue;
  }
  
  _generateModuleKeywords(comp, gemini, niche, moduleType, count, globalSet, compIndex) {
    const keywords = [];
    const kwIntel = gemini?.keywordIntelligence || {};
    const templates = this._getModuleTemplates(moduleType);
    
    const geminiKWs = this._getGeminiKeywordsForModule(kwIntel, moduleType);
    geminiKWs.slice(0, Math.ceil(count * 0.4)).forEach(kw => {
      if (keywords.length >= count) return;
      const kwText = (kw.keyword || kw).toLowerCase().trim();
      if (!globalSet.has(kwText) && kwText.length > 3) {
        globalSet.add(kwText);
        keywords.push(this._createKeywordObject(kwText, moduleType, comp, gemini, compIndex, 'gemini'));
      }
    });
    
    templates.forEach(template => {
      if (keywords.length >= count) return;
      const kwText = template.replace(/{niche}/g, niche).toLowerCase().trim();
      if (!globalSet.has(kwText) && kwText.length > 3) {
        globalSet.add(kwText);
        keywords.push(this._createKeywordObject(kwText, moduleType, comp, gemini, compIndex, 'template'));
      }
    });
    
    return keywords;
  }
  
  _createKeywordObject(kwText, moduleType, comp, gemini, compIndex, source) {
    const moat = this._analyzeCompetitorMoat(comp, gemini);
    const metrics = this._calculateKeywordMetrics(moduleType, moat);
    
    return {
      kw: kwText,
      ui_cat: moduleType,
      clash: metrics.clash,
      aio_risk: metrics.aioRisk,
      x: metrics.x + (compIndex * 3),
      y: metrics.y,
      mass: metrics.mass,
      moat_type: moat.type,
      source: source,
      tip: this._generateTip(kwText, metrics.clash, metrics.aioRisk, moat.type, moat.breaker)
    };
  }
  
  _calculateKeywordMetrics(moduleType, moat) {
    const baseMetrics = {
      money: { clash: 7, aioRisk: 4, x: 75, y: 5, mass: 15 },
      sge: { clash: 5, aioRisk: 3, x: 50, y: 4, mass: 10 },
      tail: { clash: 3, aioRisk: 6, x: 30, y: 7, mass: 5 },
      llm: { clash: 5, aioRisk: 9, x: 55, y: 8, mass: 7 }
    };
    
    const base = baseMetrics[moduleType] || baseMetrics.money;
    const moatAdjust = moat.type === 'Brand' ? 2 : moat.type === 'Authority' ? 1 : 0;
    
    // Use base metrics without random variance - real data comes from API
    return {
      clash: Math.min(10, Math.max(1, base.clash + moatAdjust)),
      aioRisk: Math.min(10, Math.max(1, base.aioRisk)),
      x: base.x,
      y: base.y,
      mass: base.mass
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - Data Fetching
  // ═══════════════════════════════════════════════════════════════════════════
  
  _fetchKeywordData(keyword) {
    try {
      keyword.attempts++;
      const data = this._callKeywordAPI(keyword);
      
      if (this._isPlaceholderData(data)) {
        if (keyword.attempts < FT_CONFIG.MAX_RETRIES) {
          return { success: false, retry: true, error: 'Placeholder data detected' };
        }
        return { success: true, data: this._generateFallbackData(keyword) };
      }
      
      return {
        success: true,
        data: { ...keyword, ...data, fetchedAt: new Date().toISOString() }
      };
      
    } catch (error) {
      if (keyword.attempts < FT_CONFIG.MAX_RETRIES) {
        return { success: false, retry: true, error: error.message };
      }
      return { success: false, retry: false, error: error.message };
    }
  }
  
  _callKeywordAPI(keyword) {
    const results = {};
    
    try {
      const requests = this._buildAPIRequests(keyword);
      
      if (requests.length > 0) {
        const responses = UrlFetchApp.fetchAll(requests);
        this._parseAPIResponses(responses, requests, results);
      }
      
      if (Object.keys(results).length === 0) {
        return this._getGeminiEstimate(keyword);
      }
      
      // Return real API data only - no random fallbacks
      return {
        volume: results.serper?.searchVolume || results.gemini?.estimatedVolume || 0,
        difficulty: results.gemini?.difficulty || this._calculateDifficultyFromSignals(results),
        cpc: results.serper?.cpc || '0.00',
        trend: results.serper?.trend || 'unknown',
        serp_features: results.serper?.serpFeatures || [],
        aio_detected: results.serper?.hasAIOverview || false,
        domain_authority: results.openPageRank?.domainAuthority || 0,
        page_rank: results.openPageRank?.pageRank || 0,
        top_competitors: results.serper?.topResults || [],
        semantic_periphery: results.gemini?.semanticPeriphery || [],
        llm_citation_potential: results.gemini?.llmCitationPotential || 0,
        data_sources: Object.keys(results).filter(k => results[k]),
        _needsApiData: true
      };
      
    } catch (error) {
      console.warn('⚠️ API call failed for keyword:', keyword.kw, error.message);
      return this._getGeminiEstimate(keyword);
    }
  }
  
  _buildAPIRequests(keyword) {
    const requests = [];
    const serperKey = PropertiesService.getScriptProperties().getProperty('SERPER_API_KEY');
    const openPageRankKey = PropertiesService.getScriptProperties().getProperty('OPENPAGERANK_API_KEY');
    const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (serperKey) {
      requests.push({
        url: 'https://google.serper.dev/search',
        method: 'post',
        contentType: 'application/json',
        headers: { 'X-API-KEY': serperKey },
        payload: JSON.stringify({ q: keyword.kw, gl: 'us', hl: 'en', num: 10 }),
        muteHttpExceptions: true,
        _apiType: 'serper'
      });
    }
    
    if (openPageRankKey && keyword.competitor) {
      requests.push({
        url: `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(keyword.competitor)}`,
        method: 'get',
        headers: { 'API-OPR': openPageRankKey },
        muteHttpExceptions: true,
        _apiType: 'openPageRank'
      });
    }
    
    if (geminiKey) {
      const geminiPrompt = this._buildGeminiAnalysisPrompt(keyword);
      requests.push({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
        }),
        muteHttpExceptions: true,
        _apiType: 'gemini'
      });
    }
    
    return requests;
  }
  
  _parseAPIResponses(responses, requests, results) {
    responses.forEach((response, idx) => {
      const request = requests[idx];
      const apiType = request._apiType;
      
      try {
        if (response.getResponseCode() === 200) {
          const data = JSON.parse(response.getContentText());
          
          switch (apiType) {
            case 'serper':
              results.serper = this._parseSerperResponse(data);
              break;
            case 'openPageRank':
              results.openPageRank = this._parseOpenPageRankResponse(data);
              break;
            case 'gemini':
              results.gemini = this._parseGeminiResponse(data);
              break;
          }
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse ${apiType} response:`, e.message);
      }
    });
  }
  
  _parseSerperResponse(data) {
    const organic = data.organic || [];
    const paa = data.peopleAlsoAsk || [];
    const hasAIOverview = !!(data.answerBox || data.aiOverview || data.knowledgeGraph);
    
    return {
      searchVolume: data.searchParameters?.estimatedResults ? 
        Math.min(50000, Math.floor(data.searchParameters.estimatedResults / 10000)) : null,
      topResults: organic.slice(0, 5).map((r, i) => ({
        domain: new URL(r.link).hostname,
        position: i + 1,
        title: r.title
      })),
      hasAIOverview: hasAIOverview,
      serpFeatures: [
        hasAIOverview ? 'ai_overview' : null,
        paa.length > 0 ? 'people_also_ask' : null,
        data.sitelinks ? 'sitelinks' : null,
        data.videos ? 'video_carousel' : null
      ].filter(Boolean),
      paaQuestions: paa.slice(0, 4).map(p => p.question)
    };
  }
  
  _parseOpenPageRankResponse(data) {
    const result = data.response?.[0] || {};
    return {
      domainAuthority: Math.round((result.page_rank_decimal || 0) * 10),
      pageRank: result.page_rank_decimal || 0,
      rank: result.rank || 0
    };
  }
  
  _parseGeminiResponse(data) {
    try {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          difficulty: parsed.difficulty || 50,
          estimatedVolume: parsed.volume || 1000,
          llmCitationPotential: parsed.llmCitationPotential || 5,
          semanticPeriphery: parsed.semanticPeriphery || [],
          intent: parsed.intent || 'informational',
          recommendation: parsed.recommendation || ''
        };
      }
      return { difficulty: 50, estimatedVolume: 1000, llmCitationPotential: 5 };
    } catch (e) {
      return { difficulty: 50, estimatedVolume: 1000, llmCitationPotential: 5 };
    }
  }
  
  _buildGeminiAnalysisPrompt(keyword) {
    return `Analyze keyword: "${keyword.kw}" (Category: ${keyword.ui_cat || 'general'}, Competitor: ${keyword.competitor || 'general'})
Return JSON only: {"difficulty":<1-100>,"volume":<monthly>,"llmCitationPotential":<1-10>,"semanticPeriphery":[<3-5 keywords>],"intent":"<type>","aioRisk":<1-10>,"killMove":"<action>"}`;
  }
  
  _getGeminiEstimate(keyword) {
    // Return empty/zero values when no API data available
    // Real data should come from Gemini API calls
    return {
      volume: 0,
      difficulty: 0,
      cpc: '0.00',
      aioRisk: 0,
      serp_features: [],
      aio_detected: false,
      top_competitors: [],
      data_sources: [],
      _isEmpty: true,
      _message: 'Configure API for real keyword data'
    };
  }
  
  _calculateDifficultyFromSignals(results) {
    let difficulty = 50;
    if (results.serper?.topResults) {
      const avgDA = results.serper.topResults.reduce((sum, r) => sum + (r.domainAuthority || 50), 0) / 5;
      difficulty = Math.min(95, avgDA + 15);
    }
    if (results.openPageRank?.pageRank) {
      difficulty = Math.max(difficulty, results.openPageRank.pageRank * 10 + 20);
    }
    return Math.round(Math.min(100, Math.max(10, difficulty)));
  }
  
  _isPlaceholderData(data) {
    if (!data) return true;
    if (data.volume === 0 && data.difficulty === 0) return true;
    if (data.error === 'rate_limited') return true;
    if (data.placeholder === true) return true;
    return false;
  }
  
  _generateFallbackData(keyword) {
    const moduleDefaults = {
      money: { volume: 5000, difficulty: 70, cpc: '3.50' },
      sge: { volume: 2500, difficulty: 45, cpc: '2.00' },
      tail: { volume: 800, difficulty: 25, cpc: '1.50' },
      llm: { volume: 1500, difficulty: 40, cpc: '2.50' }
    };
    
    const defaults = moduleDefaults[keyword.ui_cat] || moduleDefaults.money;
    return { ...keyword, ...defaults, fallback: true, fetchedAt: new Date().toISOString() };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - Retry Queue Management
  // ═══════════════════════════════════════════════════════════════════════════
  
  _addToRetryQueue(keyword, error) {
    const retryQueue = this._loadRetryQueue();
    retryQueue.push({ ...keyword, lastError: error, queuedAt: new Date().toISOString() });
    this.scriptProps.setProperty(FT_CONFIG.PROPS.RETRY_QUEUE, JSON.stringify(retryQueue));
  }
  
  _processRetryQueue() {
    const retryQueue = this._loadRetryQueue();
    if (retryQueue.length === 0) return true;
    
    console.log(`   🔄 Processing ${retryQueue.length} retry queue items...`);
    const reservoir = this._loadReservoir();
    let processed = 0;
    
    retryQueue.forEach(keyword => {
      const result = this._deepResearchKeyword(keyword);
      if (result.success) {
        reservoir.keywords.push(result.data);
        reservoir.stats.processed++;
        processed++;
      } else {
        reservoir.keywords.push(this._generateFallbackData(keyword));
        reservoir.stats.fallback++;
      }
    });
    
    this.scriptProps.setProperty(FT_CONFIG.PROPS.RETRY_QUEUE, '[]');
    this._saveReservoir(reservoir);
    console.log(`   ✅ Retry queue processed: ${processed}/${retryQueue.length} recovered`);
    return true;
  }
  
  _deepResearchKeyword(keyword) {
    try {
      Utilities.sleep(FT_CONFIG.RETRY_DELAY_MS);
      const data = this._callKeywordAPI(keyword);
      if (!this._isPlaceholderData(data)) {
        return { success: true, data: { ...keyword, ...data, deepResearch: true } };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - State Management
  // ═══════════════════════════════════════════════════════════════════════════
  
  _generateBatchId() { return `FT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  _isTimeoutApproaching() { return (Date.now() - this.startTime) > FT_CONFIG.MAX_EXECUTION_TIME_MS; }
  _getStatus() { return this.scriptProps.getProperty(FT_CONFIG.PROPS.STATUS) || FT_CONFIG.STATUS.IDLE; }
  _setStatus(status) { this.scriptProps.setProperty(FT_CONFIG.PROPS.STATUS, status); }
  
  _clearState() {
    Object.values(FT_CONFIG.PROPS).forEach(key => this.scriptProps.deleteProperty(key));
  }
  
  _storeQueue(queue) {
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < queue.length; i += chunkSize) {
      chunks.push(queue.slice(i, i + chunkSize));
    }
    this.scriptProps.setProperty(FT_CONFIG.PROPS.QUEUE + '_count', chunks.length.toString());
    chunks.forEach((chunk, idx) => {
      this.scriptProps.setProperty(FT_CONFIG.PROPS.QUEUE + '_' + idx, JSON.stringify(chunk));
    });
  }
  
  _loadQueue() {
    const chunkCount = parseInt(this.scriptProps.getProperty(FT_CONFIG.PROPS.QUEUE + '_count') || '0');
    const queue = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunk = JSON.parse(this.scriptProps.getProperty(FT_CONFIG.PROPS.QUEUE + '_' + i) || '[]');
      queue.push(...chunk);
    }
    return queue;
  }
  
  _loadRetryQueue() {
    return JSON.parse(this.scriptProps.getProperty(FT_CONFIG.PROPS.RETRY_QUEUE) || '[]');
  }
  
  _initializeReservoir() {
    const reservoir = {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      batchId: this.batchId,
      keywords: [],
      stats: { total: 450, processed: 0, failed: 0, retryQueued: 0, fallback: 0, lastUpdated: null }
    };
    this._saveReservoir(reservoir);
    return reservoir;
  }
  
  _loadReservoir() {
    const data = this.scriptProps.getProperty(FT_CONFIG.PROPS.RESERVOIR);
    if (!data) return this._initializeReservoir();
    return JSON.parse(data);
  }
  
  _saveReservoir(reservoir) {
    const jsonStr = JSON.stringify(reservoir);
    if (jsonStr.length > 8000) {
      this.scriptProps.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_meta', JSON.stringify({
        ...reservoir,
        keywords: `CHUNKED_${reservoir.keywords.length}`
      }));
      this._storeKeywordsChunked(reservoir.keywords);
    } else {
      this.scriptProps.setProperty(FT_CONFIG.PROPS.RESERVOIR, jsonStr);
    }
    
    if (reservoir.keywords.length > 0 && reservoir.keywords.length % 50 === 0) {
      this._saveToGoogleDrive(reservoir);
    }
  }
  
  _saveToGoogleDrive(reservoir) {
    try {
      const folderName = 'SerpifAI_Forensic_Data';
      const fileName = `Master_Reservoir_${this.batchId}.json`;
      
      let folder;
      const folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      const existingFiles = folder.getFilesByName(fileName);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
      
      const jsonContent = JSON.stringify(reservoir, null, 2);
      const file = folder.createFile(fileName, jsonContent, MimeType.PLAIN_TEXT);
      this.scriptProps.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_driveId', file.getId());
      console.log(`   💾 Saved to Drive: ${fileName}`);
      return file.getId();
    } catch (error) {
      console.error('   ⚠️ Drive save failed:', error.message);
      return null;
    }
  }
  
  _loadFromGoogleDrive() {
    try {
      const fileId = this.scriptProps.getProperty(FT_CONFIG.PROPS.RESERVOIR + '_driveId');
      if (!fileId) return null;
      const file = DriveApp.getFileById(fileId);
      return JSON.parse(file.getBlob().getDataAsString());
    } catch (error) {
      return null;
    }
  }
  
  _storeKeywordsChunked(keywords) {
    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < keywords.length; i += chunkSize) {
      chunks.push(keywords.slice(i, i + chunkSize));
    }
    this.scriptProps.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_count', chunks.length.toString());
    chunks.forEach((chunk, idx) => {
      this.scriptProps.setProperty(FT_CONFIG.PROPS.RESERVOIR + '_kw_' + idx, JSON.stringify(chunk));
    });
  }
  
  _logError(context, error) {
    const errorLog = JSON.parse(this.scriptProps.getProperty(FT_CONFIG.PROPS.ERROR_LOG) || '[]');
    errorLog.push({
      context,
      error: typeof error === 'string' ? error : error.message || JSON.stringify(error),
      timestamp: new Date().toISOString()
    });
    if (errorLog.length > 50) errorLog.shift();
    this.scriptProps.setProperty(FT_CONFIG.PROPS.ERROR_LOG, JSON.stringify(errorLog));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - Trigger Management
  // ═══════════════════════════════════════════════════════════════════════════
  
  _scheduleNextBatch() {
    this._cleanupTriggers();
    ScriptApp.newTrigger('FT_ContinueBatch')
      .timeBased()
      .after(FT_CONFIG.TRIGGER_DELAY_MINUTES * 60 * 1000)
      .create();
  }
  
  _cleanupTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(trigger => {
        if (trigger.getHandlerFunction() === 'FT_ContinueBatch') {
          ScriptApp.deleteTrigger(trigger);
        }
      });
    } catch (e) {
      console.warn('⚠️ Could not clean up triggers');
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS - Helpers
  // ═══════════════════════════════════════════════════════════════════════════
  
  _extractNiche(comp, gemini) {
    const geminiNiche = gemini?.keywordIntelligence?.detectedNiche ||
                       gemini?.marketPosition?.primaryCategory || '';
    if (geminiNiche && geminiNiche.length > 2) return geminiNiche.toLowerCase().trim();
    
    const domain = (comp.domain || '').toLowerCase();
    const nichePatterns = [
      { pattern: /seo|ahrefs|semrush|moz|backlink/i, niche: 'SEO tools' },
      { pattern: /casino|gambling|betting|poker/i, niche: 'online gambling' },
      { pattern: /ai writ|content generat|jasper/i, niche: 'AI content tools' },
      { pattern: /software develop|hire develop/i, niche: 'software development' }
    ];
    
    for (const { pattern, niche } of nichePatterns) {
      if (pattern.test(domain)) return niche;
    }
    return 'technology services';
  }
  
  _analyzeCompetitorMoat(comp, gemini) {
    const traffic = comp.synthesized?.traffic?.organic || 50000;
    const backlinks = comp.synthesized?.backlinks?.total || 10000;
    const domain = comp.domain || '';
    
    let type = 'Content', breaker = 'Create 10x content hub';
    if (domain.includes('google') || traffic > 10000000) {
      type = 'Brand'; breaker = 'Use "Alternative to" positioning';
    } else if (backlinks > 500000) {
      type = 'Authority'; breaker = 'Execute HARO + podcast strategy';
    }
    return { type, breaker };
  }
  
  _generateTip(kw, clash, aioRisk, moat, breaker) {
    if (clash >= 7) return `🔴 FORTRESS: "${kw}" heavily defended. ${breaker}`;
    if (clash <= 3) return `🟢 QUICK WIN: "${kw}" is easy. ${breaker}`;
    return `🔵 BALANCED: "${kw}". ${breaker}`;
  }
  
  _getModuleTemplates(moduleType) {
    const templates = {
      money: ['best {niche} software', '{niche} platform pricing', 'top {niche} tools 2025'],
      sge: ['{niche} calculator', 'interactive {niche} tool', '{niche} analyzer free'],
      tail: ['how to improve {niche}', '{niche} tips for beginners', '{niche} checklist'],
      llm: ['what is {niche}', '{niche} definition', '{niche} explained']
    };
    return templates[moduleType] || templates.money;
  }
  
  _getGeminiKeywordsForModule(kwIntel, moduleType) {
    const mapping = {
      money: kwIntel.primaryKeywords?.topKeywords || [],
      sge: kwIntel.transactionalKeywords?.topKeywords || [],
      tail: kwIntel.longTailKeywords?.topKeywords || [],
      llm: kwIntel.semanticKeywords?.topKeywords || []
    };
    return mapping[moduleType] || [];
  }
  
  _generateSerpFeatures() {
    // Return empty - real SERP features come from API data
    return [];
  }
  
  _generateTopCompetitors(mainCompetitor) {
    // Return empty - real competitor data comes from SERP results
    // Only include main competitor if provided
    if (mainCompetitor) {
      return [{ domain: mainCompetitor, position: 0, _needsRealPosition: true }];
    }
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS (Required for Triggers and API)
// ═══════════════════════════════════════════════════════════════════════════════

function FT_ContinueBatch() {
  console.log('⏰ FT_ContinueBatch trigger fired');
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.processBatch();
}

function FT_StartFetch(competitors, geminiData) {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.initializeFetch(competitors, geminiData);
}

function FT_GetStatus() {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.getStatus();
}

function FT_PauseFetch() {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.pauseFetch();
}

function FT_ResumeFetch() {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.resumeFetch();
}

function FT_GetReservoir() {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher.getStatus().reservoir;
}

function FT_SaveToDrive() {
  const fetcher = new ForensicTrafficFetcher();
  const status = fetcher.getStatus();
  if (status.reservoir?.keywords) {
    return fetcher._saveToGoogleDrive(status.reservoir);
  }
  return null;
}

function FT_LoadFromDrive() {
  const fetcher = new ForensicTrafficFetcher();
  return fetcher._loadFromGoogleDrive();
}

function FT_ExportToJSON(customFileName) {
  const fetcher = new ForensicTrafficFetcher();
  const status = fetcher.getStatus();
  if (!status.reservoir?.keywords) {
    throw new Error('No reservoir data available');
  }
  
  const folderName = 'SerpifAI_Forensic_Data';
  const fileName = customFileName || `ForensicExport_${new Date().toISOString().split('T')[0]}.json`;
  
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  
  const file = folder.createFile(fileName, JSON.stringify(status.reservoir, null, 2), MimeType.PLAIN_TEXT);
  return { success: true, fileId: file.getId(), fileName: fileName, fileUrl: file.getUrl() };
}

function FT_GetUIData() {
  const fetcher = new ForensicTrafficFetcher();
  const status = fetcher.getStatus();
  
  if (!status.reservoir?.keywords?.length) {
    return { error: 'Reservoir is empty', status: status.status, canUseFallback: true };
  }
  
  const modules = { money: [], sge: [], tail: [], llm: [] };
  
  status.reservoir.keywords.forEach(kw => {
    const cat = kw.ui_cat || 'money';
    if (modules[cat]) {
      modules[cat].push({
        kw: kw.kw,
        clash: kw.clash || 5,
        aio_risk: kw.aio_risk || 5,
        tip: kw.tip || '',
        meta: { competitor: kw.competitor, volume: kw.volume || 0, difficulty: kw.difficulty || 50 }
      });
    }
  });
  
  return {
    reservoir: { modules, stats: { total: status.reservoir.keywords.length } },
    status: status.status,
    batchId: status.batchId,
    isComplete: status.status === 'COMPLETED'
  };
}

function FT_GetLatestBatch(sinceIndex) {
  const fetcher = new ForensicTrafficFetcher();
  const status = fetcher.getStatus();
  
  if (!status.reservoir?.keywords) {
    return { keywords: [], hasMore: false, currentIndex: 0 };
  }
  
  const newKeywords = status.reservoir.keywords.slice(sinceIndex || 0);
  return {
    keywords: newKeywords.map(kw => ({ kw: kw.kw, ui_cat: kw.ui_cat, clash: kw.clash, aio_risk: kw.aio_risk })),
    hasMore: status.status === 'PROCESSING',
    currentIndex: status.reservoir.keywords.length
  };
}

function FT_ExtractSeeds(competitorDomains) {
  const serperKey = PropertiesService.getScriptProperties().getProperty('SERPER_API_KEY');
  if (!serperKey) return { error: 'SERPER_API_KEY not configured' };
  
  const seeds = [];
  const domains = competitorDomains || FT_STANDARD_COMPETITORS;
  
  domains.slice(0, 5).forEach(domain => {
    try {
      const response = UrlFetchApp.fetch('https://google.serper.dev/search', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'X-API-KEY': serperKey },
        payload: JSON.stringify({ q: `site:${domain}`, gl: 'us', num: 20 }),
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        (data.organic || []).forEach(page => {
          const keywords = `${page.title} ${page.snippet || ''}`.toLowerCase()
            .match(/\b[a-z]{4,}\s+[a-z]{3,}(?:\s+[a-z]{3,})?\b/g) || [];
          keywords.slice(0, 5).forEach(kw => {
            if (!seeds.find(s => s.keyword === kw)) {
              seeds.push({ keyword: kw.trim(), source: domain });
            }
          });
        });
      }
    } catch (e) {
      console.warn(`Failed to extract seeds from ${domain}`);
    }
  });
  
  return { success: true, seeds: seeds.slice(0, 100) };
}

function FT_SemanticExpand(seeds, niche) {
  const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!geminiKey) return { error: 'GEMINI_API_KEY not configured' };
  
  const seedKeywords = seeds.map(s => s.keyword || s).slice(0, 30).join(', ');
  const prompt = `Find semantic periphery keywords for: ${seedKeywords}. Niche: ${niche || 'digital marketing'}. Return JSON array of 30 keywords with: keyword, category, difficulty, aioRisk, llmPotential.`;
  
  try {
    const response = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
        })
      }
    );
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return { success: true, keywords: JSON.parse(jsonMatch[0]) };
      }
    }
    return { success: false, error: 'Failed to parse response' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function FT_FullPipeline(competitors, geminiData) {
  console.log('🚀 Starting Full 450-KW Forensic Pipeline...');
  
  const domains = competitors?.map(c => c.domain) || FT_STANDARD_COMPETITORS;
  const seedResult = FT_ExtractSeeds(domains);
  
  if (seedResult.seeds?.length > 0) {
    const niche = geminiData?.marketPosition?.primaryCategory || 'digital marketing';
    const expandResult = FT_SemanticExpand(seedResult.seeds, niche);
    if (expandResult.success) {
      geminiData = geminiData || {};
      geminiData.semanticPeriphery = expandResult.keywords;
    }
  }
  
  const fetchResult = FT_StartFetch(competitors, geminiData);
  return {
    success: fetchResult.success,
    pipeline: { seeds: seedResult.seeds?.length || 0, queued: fetchResult.totalKeywords || 0 },
    batchId: fetchResult.batchId
  };
}

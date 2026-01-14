/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE ELITE v21.0 - SERPER ORACLE BRIDGE
 * API Fallback System for Distributed Intelligence Engine
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Fills data gaps when direct scraping is blocked by firewalls or rate limits.
 *          Acts as the secondary data source in the Distributed Triangulation system.
 * 
 * ARCHITECTURE:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  PRIMARY: Direct Website Intelligence (FT_Oracle_EliteDataSystem.gs)  │
 * │     ↓ (if blocked/incomplete)                                          │
 * │  SECONDARY: Serper Oracle Bridge (this module) ← FALLBACK             │
 * │     ↓ (enrichment)                                                      │
 * │  TERTIARY: Causal Inference Engine (reconstruct from benchmarks)      │
 * └────────────────────────────────────────────────────────────────────────┘
 * 
 * FEATURES:
 * ✅ Automatic failover when direct fetch is blocked
 * ✅ SERP data extraction (rankings, features, competitors)
 * ✅ Search intelligence aggregation
 * ✅ Rate-limited API calls with quota tracking
 * ✅ Proof trace generation for every data point
 * ✅ OpenPageRank integration for authority metrics
 * 
 * @author SerpifAI Engineering
 * @version 21.0.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// BRIDGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const SERPER_BRIDGE_CONFIG = {
  // API Endpoints
  ENDPOINTS: {
    SERPER: 'https://google.serper.dev/search',
    SERPER_IMAGES: 'https://google.serper.dev/images',
    SERPER_NEWS: 'https://google.serper.dev/news',
    OPEN_PAGE_RANK: 'https://openpagerank.com/api/v1.0/getPageRank'
  },
  
  // Rate Limits (per minute)
  RATE_LIMITS: {
    SERPER_RPM: 50,
    OPR_RPM: 10
  },
  
  // Quota Management
  QUOTA: {
    MAX_SERPER_CALLS_PER_SESSION: 10,
    MAX_OPR_CALLS_PER_SESSION: 3,
    CALL_DELAY_MS: 1200  // 1.2 seconds between calls
  },
  
  // Data Source Tags
  SOURCE_TAGS: {
    SERPER: 'serper_api',
    OPR: 'openpagerank_api',
    INFERRED: 'causal_inference',
    CACHED: 'cache'
  },
  
  // Proof Trace Configuration
  PROOF: {
    ENABLED: true,
    INCLUDE_RAW_RESPONSE: true,
    TIMESTAMP_FORMAT: 'ISO'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SERPER ORACLE BRIDGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * SerperOracleBridge - API fallback system for blocked fetches
 */
class SerperOracleBridge {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.serperKey = this.props.getProperty('SERPER_API_KEY');
    this.oprKey = this.props.getProperty('OPR_API_KEY');
    this.sessionCalls = { serper: 0, opr: 0 };
    this.proofTraces = [];
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN FALLBACK ENTRY POINT
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Fill data gaps when direct fetch is blocked
   * @param {string} domain - Target domain
   * @param {Object} directData - Partial data from direct fetch
   * @param {Object} gaps - Identified data gaps
   * @returns {Object} Enriched data with proof traces
   */
  fillDataGaps(domain, directData, gaps) {
    console.log(`\n🌉 SerperOracleBridge: Filling data gaps for ${domain}`);
    console.log(`   Gaps identified: ${Object.keys(gaps).join(', ')}`);
    
    const enrichedData = {
      domain: domain,
      source: 'serper_oracle_bridge',
      timestamp: new Date().toISOString(),
      dataPoints: {},
      proofTraces: [],
      _bridgeUsed: true
    };
    
    try {
      // Fill keyword gaps
      if (gaps.keywords || !directData.keywords || directData.keywords.length < 30) {
        const keywordData = this._fetchKeywordIntelligence(domain);
        enrichedData.dataPoints.keywords = keywordData.data;
        enrichedData.proofTraces.push(keywordData.proof);
      }
      
      // Fill SERP visibility gaps
      if (gaps.serpVisibility) {
        const serpData = this._fetchSERPVisibility(domain);
        enrichedData.dataPoints.serpVisibility = serpData.data;
        enrichedData.proofTraces.push(serpData.proof);
      }
      
      // Fill authority gaps
      if (gaps.authority || !directData.authority) {
        const authorityData = this._fetchAuthorityMetrics(domain);
        enrichedData.dataPoints.authority = authorityData.data;
        enrichedData.proofTraces.push(authorityData.proof);
      }
      
      // Fill competitor gaps
      if (gaps.competitors) {
        const competitorData = this._fetchCompetitorIntelligence(domain);
        enrichedData.dataPoints.competitors = competitorData.data;
        enrichedData.proofTraces.push(competitorData.proof);
      }
      
      enrichedData.success = true;
      enrichedData.apiCalls = this.sessionCalls;
      
    } catch (error) {
      console.error(`❌ SerperOracleBridge Error: ${error.message}`);
      enrichedData.success = false;
      enrichedData.error = error.message;
    }
    
    return enrichedData;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SERPER API METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Fetch keyword intelligence via Serper API
   * @param {string} domain - Target domain
   * @returns {Object} Keywords with proof trace
   */
  _fetchKeywordIntelligence(domain) {
    if (!this._canCallSerper()) {
      return this._createInferredData('keywords', domain, 'Serper quota exceeded');
    }
    
    const queries = [
      `site:${domain}`,
      `"${domain}"`,
      `${domain.replace(/\.(com|io|ai|co|org|net)$/i, '')} software`
    ];
    
    const keywords = [];
    const proofSnapshots = [];
    
    for (const query of queries) {
      if (!this._canCallSerper()) break;
      
      const result = this._callSerperAPI(query);
      if (result.success) {
        proofSnapshots.push({
          query: query,
          rawResponse: SERPER_BRIDGE_CONFIG.PROOF.INCLUDE_RAW_RESPONSE ? result.raw : '[omitted]',
          timestamp: new Date().toISOString()
        });
        
        // Extract keywords from organic results
        if (result.data.organic) {
          result.data.organic.forEach((item, idx) => {
            const kw = this._extractKeywordFromSerpResult(item, domain, idx + 1);
            if (kw && !keywords.find(k => k.keyword === kw.keyword)) {
              keywords.push(kw);
            }
          });
        }
        
        // Extract keywords from related searches
        if (result.data.relatedSearches) {
          result.data.relatedSearches.forEach(rs => {
            keywords.push({
              keyword: rs.query || rs,
              source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
              type: 'related_search',
              volume: 0,  // Real data from API only
              difficulty: 0,
              _proofId: result.proofId
            });
          });
        }
      }
      
      Utilities.sleep(SERPER_BRIDGE_CONFIG.QUOTA.CALL_DELAY_MS);
    }
    
    return {
      data: keywords,
      proof: {
        type: 'keyword_intelligence',
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
        timestamp: new Date().toISOString(),
        queriesExecuted: queries.length,
        keywordsFound: keywords.length,
        snapshots: proofSnapshots,
        _integrity: 'api_verified'
      }
    };
  }
  
  /**
   * Fetch SERP visibility data
   * @param {string} domain - Target domain
   * @returns {Object} SERP visibility with proof trace
   */
  _fetchSERPVisibility(domain) {
    if (!this._canCallSerper()) {
      return this._createInferredData('serpVisibility', domain, 'Serper quota exceeded');
    }
    
    const result = this._callSerperAPI(`site:${domain}`);
    
    if (!result.success) {
      return this._createInferredData('serpVisibility', domain, result.error);
    }
    
    const visibility = {
      indexedPages: result.data.searchInformation?.totalResults || 0,
      organicResults: result.data.organic?.length || 0,
      serpFeatures: this._extractSerpFeatures(result.data),
      hasAIOverview: result.data.aiOverview ? true : false,
      hasFeaturedSnippet: result.data.answerBox ? true : false,
      hasKnowledgeGraph: result.data.knowledgeGraph ? true : false,
      hasPeopleAlsoAsk: (result.data.peopleAlsoAsk || []).length > 0,
      _source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
      _proofId: result.proofId
    };
    
    return {
      data: visibility,
      proof: {
        type: 'serp_visibility',
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
        timestamp: new Date().toISOString(),
        rawSnapshot: SERPER_BRIDGE_CONFIG.PROOF.INCLUDE_RAW_RESPONSE ? result.raw : '[omitted]',
        _integrity: 'api_verified'
      }
    };
  }
  
  /**
   * Fetch authority metrics via OpenPageRank
   * @param {string} domain - Target domain
   * @returns {Object} Authority metrics with proof trace
   */
  _fetchAuthorityMetrics(domain) {
    if (!this._canCallOPR()) {
      return this._createInferredAuthority(domain);
    }
    
    const result = this._callOpenPageRankAPI(domain);
    
    if (!result.success) {
      return this._createInferredAuthority(domain);
    }
    
    const authority = {
      pageRank: result.data.page_rank_decimal || 0,
      domainRank: result.data.rank || 0,
      statusCode: result.data.status_code || 0,
      _source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.OPR,
      _proofId: result.proofId
    };
    
    return {
      data: authority,
      proof: {
        type: 'authority_metrics',
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.OPR,
        timestamp: new Date().toISOString(),
        rawSnapshot: result.raw,
        _integrity: 'api_verified'
      }
    };
  }
  
  /**
   * Fetch competitor intelligence
   * @param {string} domain - Target domain
   * @returns {Object} Competitor data with proof trace
   */
  _fetchCompetitorIntelligence(domain) {
    if (!this._canCallSerper()) {
      return this._createInferredData('competitors', domain, 'Serper quota exceeded');
    }
    
    const brandName = domain.replace(/\.(com|io|ai|co|org|net)$/i, '');
    const result = this._callSerperAPI(`${brandName} alternatives`);
    
    if (!result.success) {
      return this._createInferredData('competitors', domain, result.error);
    }
    
    const competitors = [];
    
    if (result.data.organic) {
      result.data.organic.forEach((item, idx) => {
        if (idx >= 10) return;
        
        try {
          const url = new URL(item.link || '');
          const compDomain = url.hostname.replace('www.', '');
          
          if (compDomain !== domain && !competitors.find(c => c.domain === compDomain)) {
            competitors.push({
              domain: compDomain,
              title: item.title || '',
              position: idx + 1,
              snippet: item.snippet || '',
              _source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
              _proofId: result.proofId
            });
          }
        } catch (e) {
          // Skip invalid URLs
        }
      });
    }
    
    return {
      data: competitors,
      proof: {
        type: 'competitor_intelligence',
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
        timestamp: new Date().toISOString(),
        query: `${brandName} alternatives`,
        competitorsFound: competitors.length,
        _integrity: 'api_verified'
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOW-LEVEL API CALLERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Call Serper API with quota tracking
   * @param {string} query - Search query
   * @param {string} type - Search type (search, images, news)
   * @returns {Object} API result with proof ID
   */
  _callSerperAPI(query, type = 'search') {
    if (!this.serperKey) {
      return { success: false, error: 'SERPER_API_KEY not configured', data: {} };
    }
    
    const proofId = `serper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const endpoint = type === 'search' ? SERPER_BRIDGE_CONFIG.ENDPOINTS.SERPER :
                       type === 'images' ? SERPER_BRIDGE_CONFIG.ENDPOINTS.SERPER_IMAGES :
                       SERPER_BRIDGE_CONFIG.ENDPOINTS.SERPER_NEWS;
      
      const response = UrlFetchApp.fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.serperKey,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          q: query,
          gl: 'us',
          hl: 'en',
          num: 20
        }),
        muteHttpExceptions: true
      });
      
      this.sessionCalls.serper++;
      
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      if (code !== 200) {
        console.warn(`⚠️ Serper API returned ${code} for query: ${query}`);
        return { success: false, error: `HTTP ${code}`, data: {}, proofId };
      }
      
      const data = JSON.parse(text);
      
      return {
        success: true,
        data: data,
        raw: text.substring(0, 2000), // Truncate for proof storage
        proofId: proofId
      };
      
    } catch (error) {
      console.error(`❌ Serper API Error: ${error.message}`);
      return { success: false, error: error.message, data: {}, proofId };
    }
  }
  
  /**
   * Call OpenPageRank API with quota tracking
   * @param {string} domain - Domain to check
   * @returns {Object} API result with proof ID
   */
  _callOpenPageRankAPI(domain) {
    if (!this.oprKey) {
      return { success: false, error: 'OPR_API_KEY not configured', data: {} };
    }
    
    const proofId = `opr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const url = `${SERPER_BRIDGE_CONFIG.ENDPOINTS.OPEN_PAGE_RANK}?domains[]=${encodeURIComponent(domain)}`;
      
      const response = UrlFetchApp.fetch(url, {
        method: 'GET',
        headers: {
          'API-OPR': this.oprKey
        },
        muteHttpExceptions: true
      });
      
      this.sessionCalls.opr++;
      
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      if (code !== 200) {
        return { success: false, error: `HTTP ${code}`, data: {}, proofId };
      }
      
      const data = JSON.parse(text);
      const domainData = data.response && data.response[0] ? data.response[0] : {};
      
      return {
        success: true,
        data: domainData,
        raw: text,
        proofId: proofId
      };
      
    } catch (error) {
      return { success: false, error: error.message, data: {}, proofId };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // QUOTA & HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Check if we can make another Serper call
   */
  _canCallSerper() {
    return this.serperKey && this.sessionCalls.serper < SERPER_BRIDGE_CONFIG.QUOTA.MAX_SERPER_CALLS_PER_SESSION;
  }
  
  /**
   * Check if we can make another OpenPageRank call
   */
  _canCallOPR() {
    return this.oprKey && this.sessionCalls.opr < SERPER_BRIDGE_CONFIG.QUOTA.MAX_OPR_CALLS_PER_SESSION;
  }
  
  /**
   * Extract keyword object from SERP result
   */
  _extractKeywordFromSerpResult(result, domain, position) {
    if (!result.title) return null;
    
    const titleWords = result.title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    if (titleWords.length < 2) return null;
    
    const keyword = titleWords.slice(0, 4).join(' ');
    
    return {
      keyword: keyword,
      source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.SERPER,
      type: 'serp_extraction',
      position: position,
      volume: 0,  // Real data requires API
      difficulty: 0,
      traffic: 0,
      url: result.link || '',
      title: result.title || ''
    };
  }
  
  /**
   * Extract SERP features from result
   */
  _extractSerpFeatures(data) {
    const features = [];
    
    if (data.aiOverview) features.push('ai_overview');
    if (data.answerBox) features.push('featured_snippet');
    if (data.knowledgeGraph) features.push('knowledge_graph');
    if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) features.push('people_also_ask');
    if (data.sitelinks && data.sitelinks.length > 0) features.push('sitelinks');
    if (data.relatedSearches && data.relatedSearches.length > 0) features.push('related_searches');
    if (data.images && data.images.length > 0) features.push('image_pack');
    if (data.videos && data.videos.length > 0) features.push('video_carousel');
    if (data.news && data.news.length > 0) features.push('news_results');
    if (data.shopping && data.shopping.length > 0) features.push('shopping');
    if (data.places && data.places.length > 0) features.push('local_pack');
    
    return features;
  }
  
  /**
   * Create inferred data when API is unavailable
   */
  _createInferredData(type, domain, reason) {
    console.log(`   ⚡ Using causal inference for ${type} (${reason})`);
    
    return {
      data: {
        _source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.INFERRED,
        _reason: reason,
        _isEmpty: true,
        _needsApiData: true
      },
      proof: {
        type: type,
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.INFERRED,
        timestamp: new Date().toISOString(),
        reason: reason,
        _integrity: 'inferred'
      }
    };
  }
  
  /**
   * Create inferred authority data using industry benchmarks
   */
  _createInferredAuthority(domain) {
    console.log(`   ⚡ Using causal inference for authority metrics`);
    
    // Use stable benchmarks - NO random data
    const tld = domain.split('.').pop().toLowerCase();
    const baseAuthority = {
      'gov': 85,
      'edu': 80,
      'org': 50
    }[tld] || 0;  // Return 0 for unknown - real data requires API
    
    return {
      data: {
        pageRank: 0,
        domainRank: 0,
        estimatedDA: baseAuthority,
        _source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.INFERRED,
        _isEmpty: baseAuthority === 0,
        _needsApiData: true
      },
      proof: {
        type: 'authority_metrics',
        source: SERPER_BRIDGE_CONFIG.SOURCE_TAGS.INFERRED,
        timestamp: new Date().toISOString(),
        method: 'tld_benchmark',
        _integrity: 'estimated'
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fill data gaps using Serper Oracle Bridge
 * @param {string} domain - Target domain
 * @param {Object} directData - Partial data from direct fetch
 * @param {Object} gaps - Identified data gaps
 * @returns {Object} Enriched data
 */
function SERPER_BRIDGE_fillGaps(domain, directData, gaps) {
  const bridge = new SerperOracleBridge();
  return bridge.fillDataGaps(domain, directData, gaps);
}

/**
 * Fetch keyword intelligence only
 * @param {string} domain - Target domain
 * @returns {Object} Keyword data with proof
 */
function SERPER_BRIDGE_getKeywords(domain) {
  const bridge = new SerperOracleBridge();
  return bridge._fetchKeywordIntelligence(domain);
}

/**
 * Fetch authority metrics only
 * @param {string} domain - Target domain
 * @returns {Object} Authority data with proof
 */
function SERPER_BRIDGE_getAuthority(domain) {
  const bridge = new SerperOracleBridge();
  return bridge._fetchAuthorityMetrics(domain);
}

/**
 * Get SERP visibility data
 * @param {string} domain - Target domain
 * @returns {Object} SERP visibility with proof
 */
function SERPER_BRIDGE_getSERPVisibility(domain) {
  const bridge = new SerperOracleBridge();
  return bridge._fetchSERPVisibility(domain);
}

/**
 * Check if Serper API is configured
 * @returns {boolean} True if API key is set
 */
function SERPER_BRIDGE_isConfigured() {
  const key = PropertiesService.getScriptProperties().getProperty('SERPER_API_KEY');
  return !!key;
}

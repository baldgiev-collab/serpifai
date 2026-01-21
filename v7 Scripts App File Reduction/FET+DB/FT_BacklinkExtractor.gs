/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 6: BACKLINK EXTRACTOR
 * Extract 30-40 Backlinks with Referring Domains
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract backlink data from external APIs
 * - 30-40 quality backlinks per competitor
 * - Referring domain analysis
 * - Domain authority metrics
 * - Backlink type classification
 * - Anchor text distribution
 * 
 * APIs Used:
 * - OpenPageRank API (primary)
 * - Moz API (secondary)
 * - Custom PHP Gateway fallback
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// BACKLINK EXTRACTOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var BACKLINK_CONFIG = {
  // Limits
  MAX_BACKLINKS: 40,
  MAX_REFERRING_DOMAINS: 30,
  MIN_DOMAIN_AUTHORITY: 10,
  
  // API Keys (should be stored in Script Properties)
  OPEN_PAGE_RANK_API_KEY: 'your-api-key-here', // Replace or use PropertiesService
  
  // API URLs
  OPEN_PAGE_RANK_URL: 'https://openpagerank.com/api/v1.0/getPageRank',
  PHP_GATEWAY_URL: 'https://serpifai.com/serpifai_php/api_gateway.php',
  LICENSE_KEY: 'SERP-FAI-TEST-KEY-123456',
  
  // Backlink type patterns
  LINK_TYPES: {
    editorial: ['article', 'blog', 'news', 'content', 'resource'],
    directory: ['directory', 'listing', 'catalog', 'index'],
    forum: ['forum', 'discussion', 'community', 'board'],
    social: ['facebook', 'twitter', 'linkedin', 'reddit', 'pinterest'],
    guest_post: ['guest', 'contributor', 'author'],
    resource: ['resource', 'tool', 'guide', 'reference'],
    comment: ['comment', 'reply', 'response'],
    profile: ['profile', 'about', 'user', 'member']
  },
  
  // Domain type indicators
  DOMAIN_TYPES: {
    news: ['.news', 'news.', 'times', 'post', 'herald', 'tribune', 'journal'],
    edu: ['.edu', 'university', 'college', 'school', 'academic'],
    gov: ['.gov', 'government', 'federal', 'state'],
    blog: ['blog', 'wordpress', 'medium', 'blogger', 'tumblr'],
    ecommerce: ['shop', 'store', 'buy', 'amazon', 'ebay']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: BACKLINK EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BacklinkExtractor - Extracts backlink data from APIs
 */
class BacklinkExtractor {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.apiKey = this.props.getProperty('OPEN_PAGE_RANK_API_KEY') || BACKLINK_CONFIG.OPEN_PAGE_RANK_API_KEY;
  }
  
  /**
   * Extract backlinks for a domain
   * V34 FIX: Multi-source REAL data fetching with fallback chain
   * @param {string} domain - Domain to analyze
   * @returns {Object} Backlink analysis
   */
  extractBacklinks(domain) {
    console.log(`🔗 BacklinkExtractor: Analyzing backlinks for ${domain}`);
    const startTime = Date.now();
    
    // Normalize domain
    domain = this._normalizeDomain(domain);
    
    // Try multiple sources
    let backlinks = [];
    let referringDomains = [];
    let domainMetrics = null;
    let dataSource = 'estimation';
    
    // Strategy 1: Get domain metrics from OpenPageRank (always do this)
    console.log(`   📊 Strategy 1: Fetching domain metrics from OpenPageRank...`);
    domainMetrics = this._getDomainMetrics(domain);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // V34 FIX: Multi-source backlink fetching with priority chain
    // PRIORITY ORDER:
    //   1. OpenLinkProfiler (free, good quality)
    //   2. CommonCrawl (free, large dataset)
    //   3. PHP Gateway (our custom scraper)
    //   4. Estimation (V33 algorithm - LAST RESORT)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Strategy 2: Try OpenLinkProfiler (FREE, includes dofollow/nofollow)
    console.log(`   📊 Strategy 2: Trying OpenLinkProfiler (free API)...`);
    const olpResult = this._getBacklinksFromOpenLinkProfiler(domain);
    if (olpResult.success && olpResult.backlinks.length > 0) {
      backlinks = olpResult.backlinks;
      referringDomains = olpResult.referringDomains;
      dataSource = 'OpenLinkProfiler';
      console.log(`   ✅ V34: Got ${backlinks.length} REAL backlinks from OpenLinkProfiler`);
    }
    
    // Strategy 3: Try CommonCrawl (FREE, large dataset)
    if (backlinks.length < 10) {
      console.log(`   📊 Strategy 3: Trying CommonCrawl Index (free)...`);
      const ccResult = this._getBacklinksFromCommonCrawl(domain);
      if (ccResult.success && ccResult.backlinks.length > 0) {
        // Merge with existing (dedupe)
        const existingDomains = new Set(backlinks.map(bl => bl.sourceDomain));
        const newBacklinks = ccResult.backlinks.filter(bl => !existingDomains.has(bl.sourceDomain));
        backlinks = backlinks.concat(newBacklinks);
        
        const existingRefDomains = new Set(referringDomains.map(rd => rd.domain));
        const newRefDomains = ccResult.referringDomains.filter(rd => !existingRefDomains.has(rd.domain));
        referringDomains = referringDomains.concat(newRefDomains);
        
        dataSource = dataSource === 'estimation' ? 'CommonCrawl' : `${dataSource} + CommonCrawl`;
        console.log(`   ✅ V34: Added ${newBacklinks.length} more backlinks from CommonCrawl`);
      }
    }
    
    // Strategy 4: Try PHP Gateway (our scraper)
    if (backlinks.length < 10) {
      console.log(`   📊 Strategy 4: Trying PHP Gateway...`);
      const gatewayResult = this._getBacklinksFromGateway(domain);
      if (gatewayResult.success && gatewayResult.backlinks.length > 0) {
        const existingDomains = new Set(backlinks.map(bl => bl.sourceDomain));
        const newBacklinks = gatewayResult.backlinks.filter(bl => !existingDomains.has(bl.sourceDomain));
        backlinks = backlinks.concat(newBacklinks);
        
        const existingRefDomains = new Set(referringDomains.map(rd => rd.domain));
        const newRefDomains = gatewayResult.referringDomains.filter(rd => !existingRefDomains.has(rd.domain));
        referringDomains = referringDomains.concat(newRefDomains);
        
        dataSource = dataSource === 'estimation' ? 'PHP Gateway' : `${dataSource} + Gateway`;
        console.log(`   ✅ V34: Added ${newBacklinks.length} more backlinks from Gateway`);
      }
    }
    
    // Strategy 5: FALLBACK - V33 Estimation Algorithm (only if APIs failed)
    if (backlinks.length === 0) {
      console.log(`   📊 Strategy 5: FALLBACK - Using V33 estimation algorithm...`);
      const estimated = this._estimateBacklinks(domain);
      backlinks = estimated.backlinks;
      referringDomains = estimated.referringDomains;
      dataSource = 'V33 Estimation (fallback)';
      console.log(`   ⚠️ V34: Using estimated data - no real API data available`);
    }
    
    // Analyze backlink quality
    const analysis = this._analyzeBacklinks(backlinks, referringDomains, domainMetrics);
    
    const result = {
      success: true,
      domain: domain,
      extractedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      
      // V34: Data source indicator
      dataSource: dataSource,
      isRealData: dataSource !== 'V33 Estimation (fallback)',
      
      // Domain metrics
      domainMetrics: domainMetrics,
      
      // Backlinks
      backlinks: backlinks.slice(0, BACKLINK_CONFIG.MAX_BACKLINKS),
      backlinkCount: Math.min(backlinks.length, BACKLINK_CONFIG.MAX_BACKLINKS),
      
      // Referring domains
      referringDomains: referringDomains.slice(0, BACKLINK_CONFIG.MAX_REFERRING_DOMAINS),
      referringDomainCount: referringDomains.length,
      
      // Analysis
      analysis: analysis,
      
      // Summary
      summary: {
        totalBacklinks: backlinks.length,
        uniqueReferringDomains: referringDomains.length,
        avgDomainAuthority: analysis.avgDomainAuthority,
        topLinkType: analysis.topLinkType,
        dofollowRatio: analysis.dofollowRatio,
        dataSource: dataSource,
        isRealData: dataSource !== 'V33 Estimation (fallback)'
      }
    };
    
    console.log(`✅ BacklinkExtractor: Found ${result.backlinkCount} backlinks from ${result.referringDomainCount} domains (source: ${dataSource})`);
    return result;
  }
  
  /**
   * Get domain metrics from OpenPageRank
   */
  _getDomainMetrics(domain) {
    try {
      const url = `${BACKLINK_CONFIG.OPEN_PAGE_RANK_URL}?domains[]=${encodeURIComponent(domain)}`;
      
      const response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: {
          'API-OPR': this.apiKey
        },
        muteHttpExceptions: true,
        timeout: 15000
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data.response && data.response[0]) {
          const metrics = data.response[0];
          return {
            domain: domain,
            pageRank: metrics.page_rank_decimal || 0,
            rank: metrics.rank || 0,
            status: 'active',
            source: 'openpagerank'
          };
        }
      }
    } catch (e) {
      console.log(`      ⚠️ OpenPageRank API error: ${e.message}`);
    }
    
    // Return default metrics
    return {
      domain: domain,
      pageRank: 0,
      rank: 0,
      status: 'unknown',
      source: 'estimated'
    };
  }
  
  /**
   * Get backlinks from PHP Gateway
   */
  _getBacklinksFromGateway(domain) {
    try {
      // v28.3: Use license (not license_key) to match gateway expectation
      const licenseKey = getUserLicenseKey() || BACKLINK_CONFIG.LICENSE_KEY;
      const payload = {
        action: 'get_backlinks',
        domain: domain,
        limit: BACKLINK_CONFIG.MAX_BACKLINKS,
        license: licenseKey  // v28.3: Fixed - gateway expects 'license' not 'license_key'
      };
      
      const response = UrlFetchApp.fetch(BACKLINK_CONFIG.PHP_GATEWAY_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        timeout: 30000
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data.success && data.backlinks) {
          return {
            success: true,
            backlinks: data.backlinks.map(bl => this._normalizeBacklink(bl)),
            referringDomains: data.referring_domains || []
          };
        }
      }
    } catch (e) {
      console.log(`      ⚠️ Gateway backlink error: ${e.message}`);
    }
    
    return { success: false, backlinks: [], referringDomains: [] };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // V34 FIX: Add CommonCrawl API integration for REAL backlinks
  // CommonCrawl is a free, open-source web crawl database
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  /**
   * Get backlinks from CommonCrawl Index (FREE API)
   * Searches for pages that link TO the target domain
   * @param {string} domain - Target domain
   * @returns {Object} Backlink data from CommonCrawl
   */
  _getBacklinksFromCommonCrawl(domain) {
    console.log(`      📊 V34: Fetching backlinks from CommonCrawl for ${domain}...`);
    
    try {
      // Use the latest CC index
      const ccIndexes = ['CC-MAIN-2024-51', 'CC-MAIN-2024-46', 'CC-MAIN-2024-42'];
      let allBacklinks = [];
      
      for (const index of ccIndexes) {
        if (allBacklinks.length >= BACKLINK_CONFIG.MAX_BACKLINKS) break;
        
        // Search for pages containing the domain as a link target
        const searchUrl = `https://index.commoncrawl.org/${index}-index?url=*://*&filter==url:.*${encodeURIComponent(domain)}.*&output=json&limit=50`;
        
        try {
          const response = UrlFetchApp.fetch(searchUrl, {
            muteHttpExceptions: true,
            timeout: 20000
          });
          
          if (response.getResponseCode() === 200) {
            const text = response.getContentText();
            const lines = text.split('\n').filter(Boolean);
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                // This is a page that contains our domain - it's a backlink source
                const sourceDomain = this._extractDomain(data.url);
                
                if (sourceDomain && sourceDomain !== domain && !sourceDomain.includes(domain)) {
                  allBacklinks.push({
                    sourceUrl: data.url,
                    sourceDomain: sourceDomain,
                    targetUrl: `https://${domain}/`,
                    anchorText: '', // CC doesn't provide anchor text
                    linkType: this._classifyLinkType(data.url, ''),
                    isDofollow: true, // Assume dofollow by default
                    domainAuthority: 0, // Would need separate API call
                    firstSeen: data.timestamp ? this._parseCommonCrawlTimestamp(data.timestamp) : null,
                    source: 'commoncrawl',
                    isEstimated: false
                  });
                }
              } catch (parseError) {
                // Skip malformed lines
              }
            }
            
            console.log(`      ✅ V34: Found ${lines.length} potential backlinks from ${index}`);
          }
        } catch (indexError) {
          console.log(`      ⚠️ V34: CommonCrawl ${index} error: ${indexError.message}`);
        }
        
        Utilities.sleep(500); // Rate limiting
      }
      
      // Dedupe by source domain
      const seen = new Set();
      const uniqueBacklinks = allBacklinks.filter(bl => {
        if (seen.has(bl.sourceDomain)) return false;
        seen.add(bl.sourceDomain);
        return true;
      });
      
      // Build referring domains list
      const referringDomains = uniqueBacklinks.map(bl => ({
        domain: bl.sourceDomain,
        domainAuthority: 0, // Would need separate API
        linkCount: 1,
        linkType: bl.linkType,
        isEstimated: false,
        source: 'commoncrawl'
      }));
      
      console.log(`      ✅ V34: CommonCrawl total: ${uniqueBacklinks.length} unique backlinks from ${referringDomains.length} domains`);
      
      return {
        success: uniqueBacklinks.length > 0,
        backlinks: uniqueBacklinks.slice(0, BACKLINK_CONFIG.MAX_BACKLINKS),
        referringDomains: referringDomains,
        source: 'CommonCrawl'
      };
      
    } catch (e) {
      console.log(`      ❌ V34: CommonCrawl error: ${e.message}`);
      return { success: false, backlinks: [], referringDomains: [], source: 'CommonCrawl' };
    }
  }
  
  /**
   * Parse CommonCrawl timestamp to ISO date
   */
  _parseCommonCrawlTimestamp(timestamp) {
    try {
      // CC timestamps are like: 20241215123456
      const year = timestamp.substring(0, 4);
      const month = timestamp.substring(4, 6);
      const day = timestamp.substring(6, 8);
      return `${year}-${month}-${day}`;
    } catch (e) {
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // V34 FIX: Add OpenLinkProfiler API integration (FREE)
  // OpenLinkProfiler provides free backlink data with dofollow/nofollow info
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  /**
   * Get backlinks from OpenLinkProfiler (FREE)
   * @param {string} domain - Target domain
   * @returns {Object} Backlink data
   */
  _getBacklinksFromOpenLinkProfiler(domain) {
    console.log(`      📊 V34: Fetching backlinks from OpenLinkProfiler for ${domain}...`);
    
    try {
      // OpenLinkProfiler API endpoint
      const url = `https://openlinkprofiler.org/r/${encodeURIComponent(domain)}?format=json`;
      
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        timeout: 20000,
        headers: {
          'User-Agent': 'SerpifAI/1.0 (SEO Analysis Tool)',
          'Accept': 'application/json'
        }
      });
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data && data.links) {
          const backlinks = (data.links || []).slice(0, BACKLINK_CONFIG.MAX_BACKLINKS).map(link => ({
            sourceUrl: link.source_url || link.url || '',
            sourceDomain: this._extractDomain(link.source_url || link.url || ''),
            targetUrl: link.target_url || `https://${domain}/`,
            anchorText: link.anchor || link.anchor_text || '',
            linkType: this._classifyLinkType(link.source_url || '', link.anchor || ''),
            isDofollow: link.nofollow !== true && link.rel !== 'nofollow',
            domainAuthority: link.lv || link.link_value || 0,
            firstSeen: link.first_seen || null,
            source: 'openlinkprofiler',
            isEstimated: false
          }));
          
          // Build referring domains
          const domainMap = {};
          for (const bl of backlinks) {
            if (!domainMap[bl.sourceDomain]) {
              domainMap[bl.sourceDomain] = {
                domain: bl.sourceDomain,
                domainAuthority: bl.domainAuthority,
                linkCount: 0,
                linkType: bl.linkType,
                source: 'openlinkprofiler'
              };
            }
            domainMap[bl.sourceDomain].linkCount++;
          }
          
          const referringDomains = Object.values(domainMap);
          
          console.log(`      ✅ V34: OpenLinkProfiler: ${backlinks.length} backlinks from ${referringDomains.length} domains`);
          
          return {
            success: true,
            backlinks: backlinks,
            referringDomains: referringDomains,
            source: 'OpenLinkProfiler',
            totalBacklinks: data.total_backlinks || backlinks.length,
            uniqueDomains: data.unique_domains || referringDomains.length
          };
        }
      }
    } catch (e) {
      console.log(`      ⚠️ V34: OpenLinkProfiler error: ${e.message}`);
    }
    
    return { success: false, backlinks: [], referringDomains: [], source: 'OpenLinkProfiler' };
  }
  
  /**
   * Estimate backlinks from on-page signals (fallback)
   * This creates placeholder data structure when APIs are unavailable
   */
  _estimateBacklinks(domain) {
    // Create estimated backlink profile based on domain characteristics
    const backlinks = [];
    const referringDomains = [];
    
    // Generate placeholder backlinks based on common patterns
    const commonSources = [
      { domain: 'industry-directory.com', type: 'directory', da: 45 },
      { domain: 'news-site.com', type: 'editorial', da: 60 },
      { domain: 'blog-network.com', type: 'guest_post', da: 35 },
      { domain: 'forum-community.com', type: 'forum', da: 40 },
      { domain: 'resource-hub.org', type: 'resource', da: 55 },
      { domain: 'review-platform.com', type: 'editorial', da: 50 },
      { domain: 'social-bookmark.com', type: 'social', da: 30 },
      { domain: 'local-business.com', type: 'directory', da: 35 }
    ];
    
    for (let i = 0; i < Math.min(10, commonSources.length); i++) {
      const source = commonSources[i];
      
      backlinks.push({
        sourceUrl: `https://${source.domain}/link-${i}`,
        sourceDomain: source.domain,
        targetUrl: `https://${domain}/`,
        anchorText: `Visit ${domain}`,
        linkType: source.type,
        isDofollow: i % 3 !== 0, // 2/3 dofollow
        domainAuthority: source.da,
        firstSeen: null, // Real date requires backlink API data
        isEstimated: true,
        _needsApiData: true
      });
      
      if (!referringDomains.find(rd => rd.domain === source.domain)) {
        referringDomains.push({
          domain: source.domain,
          domainAuthority: source.da,
          linkCount: 1,
          linkType: source.type,
          isEstimated: true
        });
      }
    }
    
    return { backlinks, referringDomains };
  }
  
  /**
   * Normalize backlink data
   */
  _normalizeBacklink(bl) {
    const sourceDomain = this._extractDomain(bl.source_url || bl.sourceUrl || '');
    
    return {
      sourceUrl: bl.source_url || bl.sourceUrl || '',
      sourceDomain: sourceDomain,
      targetUrl: bl.target_url || bl.targetUrl || '',
      anchorText: bl.anchor_text || bl.anchorText || '',
      linkType: this._classifyLinkType(bl.source_url || bl.sourceUrl || '', bl.anchor_text || ''),
      isDofollow: bl.is_dofollow !== false && bl.isDofollow !== false,
      domainAuthority: bl.domain_authority || bl.domainAuthority || 0,
      pageAuthority: bl.page_authority || bl.pageAuthority || 0,
      firstSeen: bl.first_seen || bl.firstSeen || null,
      lastSeen: bl.last_seen || bl.lastSeen || null,
      isEstimated: bl.isEstimated || false
    };
  }
  
  /**
   * Classify link type based on source URL and anchor
   */
  _classifyLinkType(sourceUrl, anchorText) {
    const urlLower = sourceUrl.toLowerCase();
    const anchorLower = (anchorText || '').toLowerCase();
    
    for (const [type, patterns] of Object.entries(BACKLINK_CONFIG.LINK_TYPES)) {
      for (const pattern of patterns) {
        if (urlLower.includes(pattern) || anchorLower.includes(pattern)) {
          return type;
        }
      }
    }
    
    return 'other';
  }
  
  /**
   * Classify domain type
   */
  _classifyDomainType(domain) {
    const domainLower = domain.toLowerCase();
    
    for (const [type, patterns] of Object.entries(BACKLINK_CONFIG.DOMAIN_TYPES)) {
      for (const pattern of patterns) {
        if (domainLower.includes(pattern)) {
          return type;
        }
      }
    }
    
    return 'general';
  }
  
  /**
   * Analyze backlink quality and distribution
   */
  _analyzeBacklinks(backlinks, referringDomains, domainMetrics) {
    // Link type distribution
    const typeDistribution = {};
    for (const bl of backlinks) {
      typeDistribution[bl.linkType] = (typeDistribution[bl.linkType] || 0) + 1;
    }
    
    // Dofollow ratio
    const dofollowCount = backlinks.filter(bl => bl.isDofollow).length;
    const dofollowRatio = backlinks.length > 0 
      ? Math.round((dofollowCount / backlinks.length) * 100) 
      : 0;
    
    // Average domain authority
    const daValues = backlinks
      .filter(bl => bl.domainAuthority > 0)
      .map(bl => bl.domainAuthority);
    const avgDA = daValues.length > 0
      ? Math.round(daValues.reduce((a, b) => a + b, 0) / daValues.length)
      : 0;
    
    // Domain type distribution
    const domainTypeDistribution = {};
    for (const rd of referringDomains) {
      const type = this._classifyDomainType(rd.domain);
      domainTypeDistribution[type] = (domainTypeDistribution[type] || 0) + 1;
    }
    
    // Top link type
    const topLinkType = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    
    // Anchor text diversity
    const uniqueAnchors = new Set(backlinks.map(bl => bl.anchorText.toLowerCase()));
    const anchorDiversity = backlinks.length > 0
      ? Math.round((uniqueAnchors.size / backlinks.length) * 100)
      : 0;
    
    // Quality indicators
    const highQualityCount = backlinks.filter(bl => bl.domainAuthority >= 50).length;
    const lowQualityCount = backlinks.filter(bl => bl.domainAuthority < 20 && bl.domainAuthority > 0).length;
    
    return {
      typeDistribution: typeDistribution,
      domainTypeDistribution: domainTypeDistribution,
      dofollowRatio: dofollowRatio,
      nofollowRatio: 100 - dofollowRatio,
      avgDomainAuthority: avgDA,
      highQualityLinks: highQualityCount,
      lowQualityLinks: lowQualityCount,
      anchorDiversity: anchorDiversity,
      topLinkType: topLinkType,
      
      // Quality score (0-100)
      qualityScore: this._calculateQualityScore({
        avgDA: avgDA,
        dofollowRatio: dofollowRatio,
        anchorDiversity: anchorDiversity,
        highQualityRatio: highQualityCount / Math.max(1, backlinks.length),
        uniqueDomains: referringDomains.length
      })
    };
  }
  
  /**
   * Calculate overall backlink quality score
   */
  _calculateQualityScore(factors) {
    let score = 0;
    
    // DA contribution (max 30 points)
    score += Math.min(30, factors.avgDA * 0.6);
    
    // Dofollow ratio (max 20 points)
    score += factors.dofollowRatio * 0.2;
    
    // Anchor diversity (max 20 points)
    score += factors.anchorDiversity * 0.2;
    
    // High quality ratio (max 20 points)
    score += factors.highQualityRatio * 20;
    
    // Unique domains (max 10 points)
    score += Math.min(10, factors.uniqueDomains * 0.5);
    
    return Math.round(Math.min(100, score));
  }
  
  /**
   * Extract domain from URL
   */
  _extractDomain(url) {
    try {
      const match = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/i);
      return match ? match[1] : '';
    } catch (e) {
      return '';
    }
  }
  
  /**
   * Normalize domain
   */
  _normalizeDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get backlink extractor instance
 * @returns {BacklinkExtractor}
 */
function getBacklinkExtractor() {
  return new BacklinkExtractor();
}

/**
 * Extract backlinks for a domain
 * @param {string} domain - Domain to analyze
 * @returns {Object} Backlink analysis
 */
function extractBacklinks(domain) {
  const extractor = getBacklinkExtractor();
  return extractor.extractBacklinks(domain);
}

/**
 * Extract backlinks for multiple domains
 * @param {Array} domains - Array of domains
 * @returns {Object} Map of domain to backlink analysis
 */
function extractBacklinksForDomains(domains) {
  const extractor = getBacklinkExtractor();
  const results = {};
  
  for (const domain of domains) {
    try {
      results[domain] = extractor.extractBacklinks(domain);
      Utilities.sleep(2000); // Rate limiting
    } catch (e) {
      results[domain] = {
        success: false,
        domain: domain,
        error: e.message,
        backlinks: [],
        referringDomains: []
      };
    }
  }
  
  return results;
}

/**
 * Test backlink extractor
 */
function testBacklinkExtractor() {
  const testDomain = 'serpifai.com';
  console.log(`🧪 Testing backlink extractor for: ${testDomain}`);
  
  const result = extractBacklinks(testDomain);
  console.log('Backlink Result:', JSON.stringify(result, null, 2));
  
  return result;
}

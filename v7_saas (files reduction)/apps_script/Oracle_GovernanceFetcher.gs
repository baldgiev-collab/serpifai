/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 2: STEALTH FETCHER (VERTICAL SNIPER)
 * Enterprise-Grade Polite Fetcher with Heartbeat State & Governance Integration
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This module implements the StealthForensicFetcher class:
 *   - Top 15 Pages Priority Logic (inferred revenue ranking)
 *   - Heartbeat State Management (PropertiesService persistence)
 *   - 4.5-minute execution limit with auto-continuation
 *   - Full integration with Module 0 Governance (Robots.txt, PII, Throttling)
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2A: FETCHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var FETCHER_CONFIG = FETCHER_CONFIG || {
  // Priority Queue
  PRIORITY: {
    MAX_PAGES: 15,                    // Top 15 revenue pages per competitor
    MAX_KEYWORDS_PER_PAGE: 75,        // Keyword cluster size
    REVENUE_WEIGHT_TRAFFIC: 0.4,      // Traffic weight in revenue score
    REVENUE_WEIGHT_CPC: 0.4,          // CPC weight
    REVENUE_WEIGHT_CONVERSION: 0.2    // Conversion estimate weight
  },
  
  // Heartbeat State
  HEARTBEAT: {
    STATE_PROPERTY_KEY: 'ORACLE_FETCHER_STATE',
    QUEUE_PROPERTY_KEY: 'ORACLE_FETCH_QUEUE',
    TRIGGER_FUNCTION: 'oracleFetcherContinue',
    CONTINUATION_DELAY_MS: 60000      // 1 minute delay for continuation
  },
  
  // Fetch Settings
  FETCH: {
    TIMEOUT_MS: 30000,
    MAX_CONTENT_LENGTH: 5000000,      // 5MB max
    FOLLOW_REDIRECTS: true,
    VALIDATE_CERTIFICATES: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2B: FETCH QUEUE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * FetchQueueManager - Manages persistent URL queue with priority ranking
 */
class FetchQueueManager {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.queueKey = FETCHER_CONFIG.HEARTBEAT.QUEUE_PROPERTY_KEY;
    this.stateKey = FETCHER_CONFIG.HEARTBEAT.STATE_PROPERTY_KEY;
  }
  
  /**
   * Calculate revenue potential score for a page
   * @param {Object} page - Page data with traffic/CPC estimates
   * @returns {number} Revenue score
   */
  _calculateRevenueScore(page) {
    const traffic = page.estimatedTraffic || page.traffic || 0;
    const cpc = page.estimatedCPC || page.cpc || 0;
    const conversionRate = page.conversionEstimate || 0.02; // Default 2%
    
    const trafficScore = Math.log10(traffic + 1) * 10;
    const cpcScore = cpc * 5;
    const conversionScore = conversionRate * 1000;
    
    return (
      trafficScore * FETCHER_CONFIG.PRIORITY.REVENUE_WEIGHT_TRAFFIC +
      cpcScore * FETCHER_CONFIG.PRIORITY.REVENUE_WEIGHT_CPC +
      conversionScore * FETCHER_CONFIG.PRIORITY.REVENUE_WEIGHT_CONVERSION
    );
  }
  
  /**
   * Initialize queue with competitor pages (prioritized by revenue potential)
   * @param {string} competitorDomain - Competitor domain
   * @param {Array} pages - Array of page objects
   * @returns {Object} Queue initialization result
   */
  initializeQueue(competitorDomain, pages) {
    // Score and sort pages by revenue potential
    const scoredPages = pages.map(page => ({
      ...page,
      url: page.url,
      revenueScore: this._calculateRevenueScore(page)
    }));
    
    scoredPages.sort((a, b) => b.revenueScore - a.revenueScore);
    
    // Take top 15
    const topPages = scoredPages.slice(0, FETCHER_CONFIG.PRIORITY.MAX_PAGES);
    
    const queue = {
      id: Utilities.getUuid(),
      competitorDomain: competitorDomain,
      createdAt: new Date().toISOString(),
      totalPages: topPages.length,
      processedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      items: topPages.map((page, idx) => ({
        url: page.url,
        priority: idx + 1,
        revenueScore: page.revenueScore,
        status: 'pending',
        attempts: 0,
        lastAttempt: null,
        result: null,
        complianceStatus: null
      }))
    };
    
    this.props.setProperty(this.queueKey, JSON.stringify(queue));
    
    // Initialize state
    this.saveState({
      phase: 'initialized',
      competitorDomain: competitorDomain,
      currentIndex: 0,
      startedAt: new Date().toISOString()
    });
    
    console.log(`📋 FetchQueue: Initialized with ${topPages.length} priority pages for ${competitorDomain}`);
    
    return {
      success: true,
      queueId: queue.id,
      totalPages: queue.totalPages,
      topPages: topPages.map(p => ({ url: p.url, score: p.revenueScore }))
    };
  }
  
  /**
   * Get current queue
   * @returns {Object|null} Queue object
   */
  getQueue() {
    const queueJson = this.props.getProperty(this.queueKey);
    if (!queueJson) return null;
    
    try {
      return JSON.parse(queueJson);
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Save queue state
   * @param {Object} queue - Queue object
   */
  saveQueue(queue) {
    this.props.setProperty(this.queueKey, JSON.stringify(queue));
  }
  
  /**
   * Get next pending item
   * @returns {Object|null} Next queue item or null
   */
  getNextItem() {
    const queue = this.getQueue();
    if (!queue) return null;
    
    const pending = queue.items.find(item => item.status === 'pending');
    return pending || null;
  }
  
  /**
   * Update item status
   * @param {string} url - URL to update
   * @param {string} status - New status
   * @param {Object} result - Result data
   */
  updateItemStatus(url, status, result = null) {
    const queue = this.getQueue();
    if (!queue) return;
    
    const item = queue.items.find(i => i.url === url);
    if (item) {
      item.status = status;
      item.lastAttempt = new Date().toISOString();
      item.attempts++;
      if (result) {
        item.result = result;
        item.complianceStatus = result.complianceStatus;
      }
      
      if (status === 'completed') queue.processedCount++;
      if (status === 'failed') queue.failedCount++;
      if (status === 'skipped') queue.skippedCount++;
    }
    
    this.saveQueue(queue);
  }
  
  /**
   * Check if queue is complete
   * @returns {boolean}
   */
  isComplete() {
    const queue = this.getQueue();
    if (!queue) return true;
    
    return !queue.items.some(i => i.status === 'pending');
  }
  
  /**
   * Get queue progress
   * @returns {Object} Progress stats
   */
  getProgress() {
    const queue = this.getQueue();
    if (!queue) return { total: 0, pending: 0, completed: 0, failed: 0, skipped: 0 };
    
    return {
      queueId: queue.id,
      competitorDomain: queue.competitorDomain,
      total: queue.totalPages,
      pending: queue.items.filter(i => i.status === 'pending').length,
      processing: queue.items.filter(i => i.status === 'processing').length,
      completed: queue.items.filter(i => i.status === 'completed').length,
      failed: queue.items.filter(i => i.status === 'failed').length,
      skipped: queue.items.filter(i => i.status === 'skipped').length
    };
  }
  
  /**
   * Save fetcher state
   * @param {Object} state - State object
   */
  saveState(state) {
    const stateData = {
      ...state,
      savedAt: new Date().toISOString()
    };
    this.props.setProperty(this.stateKey, JSON.stringify(stateData));
  }
  
  /**
   * Load fetcher state
   * @returns {Object|null}
   */
  loadState() {
    const stateJson = this.props.getProperty(this.stateKey);
    if (!stateJson) return null;
    
    try {
      return JSON.parse(stateJson);
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Clear queue and state
   */
  clear() {
    this.props.deleteProperty(this.queueKey);
    this.props.deleteProperty(this.stateKey);
    console.log('🗑️ FetchQueue: Cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2C: HEARTBEAT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * HeartbeatManager - Manages execution time and auto-continuation
 */
class HeartbeatManager {
  
  constructor() {
    this.startTime = Date.now();
    this.props = PropertiesService.getScriptProperties();
  }
  
  /**
   * Check if execution time limit is approaching
   * @returns {boolean}
   */
  shouldYield() {
    const elapsed = Date.now() - this.startTime;
    const limit = GOVERNANCE_CONFIG.EXECUTION.MAX_RUNTIME_MS - GOVERNANCE_CONFIG.EXECUTION.SAFETY_MARGIN_MS;
    return elapsed >= limit;
  }
  
  /**
   * Get remaining execution time
   * @returns {number} Remaining ms
   */
  getRemainingTime() {
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, GOVERNANCE_CONFIG.EXECUTION.MAX_RUNTIME_MS - elapsed);
  }
  
  /**
   * Schedule continuation trigger
   * @returns {Object} Trigger result
   */
  scheduleContinuation() {
    const functionName = FETCHER_CONFIG.HEARTBEAT.TRIGGER_FUNCTION;
    
    // Clear existing triggers
    this.clearContinuationTriggers();
    
    // Create new trigger
    const trigger = ScriptApp.newTrigger(functionName)
      .timeBased()
      .after(FETCHER_CONFIG.HEARTBEAT.CONTINUATION_DELAY_MS)
      .create();
    
    console.log(`💓 Heartbeat: Scheduled continuation in ${FETCHER_CONFIG.HEARTBEAT.CONTINUATION_DELAY_MS / 1000}s`);
    
    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      scheduledFor: new Date(Date.now() + FETCHER_CONFIG.HEARTBEAT.CONTINUATION_DELAY_MS).toISOString()
    };
  }
  
  /**
   * Clear all continuation triggers
   */
  clearContinuationTriggers() {
    const functionName = FETCHER_CONFIG.HEARTBEAT.TRIGGER_FUNCTION;
    const triggers = ScriptApp.getProjectTriggers();
    let cleared = 0;
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === functionName) {
        ScriptApp.deleteTrigger(trigger);
        cleared++;
      }
    });
    
    if (cleared > 0) {
      console.log(`🧹 Heartbeat: Cleared ${cleared} continuation triggers`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2D: STEALTH FORENSIC FETCHER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * StealthForensicFetcher - Main fetcher with governance integration
 */
class StealthForensicFetcher {
  
  constructor() {
    this.queueManager = new FetchQueueManager();
    this.heartbeat = new HeartbeatManager();
    this.governance = new GovernanceOrchestrator();
    this.fetchedContent = new Map();
  }
  
  /**
   * Start fetching for a competitor domain
   * @param {string} competitorDomain - Domain to analyze
   * @param {Array} pages - Array of page objects
   * @returns {Object} Start result
   */
  startFetching(competitorDomain, pages) {
    console.log(`🎯 StealthFetcher: Starting analysis of ${competitorDomain}`);
    
    // Initialize queue with priority ranking
    const queueResult = this.queueManager.initializeQueue(competitorDomain, pages);
    
    if (!queueResult.success) {
      return { success: false, error: 'Failed to initialize queue' };
    }
    
    // Start processing
    return this.continueFetching();
  }
  
  /**
   * Continue fetching (called directly or by trigger)
   * @returns {Object} Processing result
   */
  continueFetching() {
    const state = this.queueManager.loadState();
    const progress = this.queueManager.getProgress();
    
    console.log(`📊 StealthFetcher: Progress - ${progress.completed}/${progress.total} completed`);
    
    // Check if complete
    if (this.queueManager.isComplete()) {
      console.log('✅ StealthFetcher: All pages processed!');
      this.heartbeat.clearContinuationTriggers();
      
      return {
        success: true,
        complete: true,
        progress: progress,
        message: 'All pages processed'
      };
    }
    
    // Check quota before proceeding
    if (!this.governance.quotaMonitor.canFetch()) {
      console.warn('⚠️ StealthFetcher: Quota limit reached, stopping');
      return {
        success: false,
        complete: false,
        reason: 'quota_exceeded',
        progress: progress
      };
    }
    
    const results = [];
    
    // Process items until we need to yield
    while (!this.queueManager.isComplete()) {
      // Check if we need to yield
      if (this.heartbeat.shouldYield()) {
        console.log('⏰ StealthFetcher: Time limit approaching, scheduling continuation...');
        this.queueManager.saveState({
          phase: 'yielded',
          yieldedAt: new Date().toISOString(),
          processed: progress.completed
        });
        this.heartbeat.scheduleContinuation();
        
        return {
          success: true,
          complete: false,
          yielded: true,
          progress: this.queueManager.getProgress(),
          results: results,
          message: 'Yielded for continuation'
        };
      }
      
      // Check quota
      if (!this.governance.quotaMonitor.canFetch()) {
        console.warn('⚠️ StealthFetcher: Quota exhausted mid-batch');
        break;
      }
      
      // Get next item
      const item = this.queueManager.getNextItem();
      if (!item) break;
      
      // Update status to processing
      this.queueManager.updateItemStatus(item.url, 'processing');
      
      // Fetch with full governance compliance
      const fetchResult = this._fetchWithGovernance(item.url);
      results.push(fetchResult);
      
      if (fetchResult.success) {
        this.queueManager.updateItemStatus(item.url, 'completed', {
          complianceStatus: 'compliant',
          contentLength: fetchResult.content?.length || 0,
          statusCode: fetchResult.statusCode
        });
        
        // Store content for later processing
        this.fetchedContent.set(item.url, {
          content: fetchResult.content,
          statusCode: fetchResult.statusCode,
          fetchedAt: new Date().toISOString()
        });
        
      } else if (fetchResult.action === 'skip') {
        this.queueManager.updateItemStatus(item.url, 'skipped', {
          complianceStatus: 'excluded',
          reason: fetchResult.reason
        });
        
      } else {
        this.queueManager.updateItemStatus(item.url, 'failed', {
          complianceStatus: fetchResult.complianceStatus || 'unknown',
          error: fetchResult.error
        });
      }
    }
    
    // Check if complete after processing
    if (this.queueManager.isComplete()) {
      console.log('✅ StealthFetcher: Processing complete!');
      this.heartbeat.clearContinuationTriggers();
      
      return {
        success: true,
        complete: true,
        progress: this.queueManager.getProgress(),
        results: results,
        message: 'All pages processed'
      };
    }
    
    // Schedule continuation if not complete
    this.heartbeat.scheduleContinuation();
    
    return {
      success: true,
      complete: false,
      progress: this.queueManager.getProgress(),
      results: results,
      message: 'Batch processed, continuation scheduled'
    };
  }
  
  /**
   * Fetch URL with full governance compliance
   * @param {string} url - URL to fetch
   * @returns {Object} Fetch result
   */
  _fetchWithGovernance(url) {
    console.log(`🔍 StealthFetcher: Fetching ${url}`);
    
    // Pre-flight compliance check
    const preCheck = this.governance.preFetchCheck(url);
    
    if (!preCheck.allowed) {
      console.log(`⏭️ StealthFetcher: Skipping ${url} - ${preCheck.reason}`);
      return {
        success: false,
        url: url,
        action: preCheck.action,
        reason: preCheck.reason,
        complianceStatus: 'excluded'
      };
    }
    
    // Perform compliant fetch
    const result = this.governance.compliantFetch(url);
    
    return {
      success: result.success,
      url: url,
      content: result.content,
      statusCode: result.statusCode,
      piiStats: result.piiStats,
      complianceStatus: result.success ? 'compliant' : 'error',
      error: result.error
    };
  }
  
  /**
   * Get all fetched content
   * @returns {Map} URL -> content map
   */
  getFetchedContent() {
    return this.fetchedContent;
  }
  
  /**
   * Stop fetching and clear state
   */
  stop() {
    this.heartbeat.clearContinuationTriggers();
    this.queueManager.clear();
    this.fetchedContent.clear();
    console.log('🛑 StealthFetcher: Stopped and cleared');
    return { success: true, message: 'Fetcher stopped' };
  }
  
  /**
   * Get current status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      progress: this.queueManager.getProgress(),
      state: this.queueManager.loadState(),
      remainingTime: this.heartbeat.getRemainingTime(),
      quotaStatus: this.governance.quotaMonitor.getStatus()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2E: COMPETITOR PAGE DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * CompetitorPageDiscovery - Discovers top pages for a competitor
 */
class CompetitorPageDiscovery {
  
  constructor() {
    this.governance = new GovernanceOrchestrator();
  }
  
  /**
   * Discover pages from sitemap
   * @param {string} domain - Competitor domain
   * @returns {Array} Array of page objects
   */
  discoverFromSitemap(domain) {
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://www.${domain}/sitemap.xml`
    ];
    
    const pages = [];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        // Check robots.txt first
        const robotsCheck = this.governance.robotsParser.isAllowed(sitemapUrl);
        if (!robotsCheck.allowed) continue;
        
        // Fetch sitemap
        const result = this.governance.compliantFetch(sitemapUrl);
        if (!result.success) continue;
        
        // Parse sitemap XML
        const parsedPages = this._parseSitemap(result.content, domain);
        pages.push(...parsedPages);
        
        if (pages.length > 0) break; // Found pages, stop trying
        
      } catch (e) {
        console.warn(`⚠️ PageDiscovery: Sitemap fetch failed: ${e.message}`);
      }
    }
    
    // Estimate revenue potential for each page
    return pages.map(page => ({
      ...page,
      estimatedTraffic: this._estimateTraffic(page),
      estimatedCPC: this._estimateCPC(page)
    }));
  }
  
  /**
   * Parse sitemap XML
   * @param {string} content - Sitemap XML content
   * @param {string} domain - Domain for filtering
   * @returns {Array} Parsed page objects
   */
  _parseSitemap(content, domain) {
    const pages = [];
    
    try {
      const doc = XmlService.parse(content);
      const root = doc.getRootElement();
      const namespace = root.getNamespace();
      
      // Handle sitemap index
      const sitemaps = root.getChildren('sitemap', namespace);
      if (sitemaps.length > 0) {
        // This is a sitemap index - fetch child sitemaps
        for (const sitemap of sitemaps.slice(0, 3)) { // Limit to 3
          const locElement = sitemap.getChild('loc', namespace);
          if (locElement) {
            const childUrl = locElement.getText();
            const result = this.governance.compliantFetch(childUrl);
            if (result.success) {
              const childPages = this._parseSitemap(result.content, domain);
              pages.push(...childPages);
            }
          }
        }
        return pages;
      }
      
      // Parse URL entries
      const urlElements = root.getChildren('url', namespace);
      
      for (const urlElement of urlElements) {
        const locElement = urlElement.getChild('loc', namespace);
        if (!locElement) continue;
        
        const url = locElement.getText();
        
        // Skip non-page URLs
        if (this._isNonPageUrl(url)) continue;
        
        const lastmodElement = urlElement.getChild('lastmod', namespace);
        const priorityElement = urlElement.getChild('priority', namespace);
        
        pages.push({
          url: url,
          lastmod: lastmodElement ? lastmodElement.getText() : null,
          priority: priorityElement ? parseFloat(priorityElement.getText()) : 0.5
        });
      }
      
    } catch (e) {
      console.warn(`⚠️ PageDiscovery: Sitemap parse error: ${e.message}`);
    }
    
    return pages;
  }
  
  /**
   * Check if URL is a non-page resource
   * @param {string} url - URL to check
   * @returns {boolean}
   */
  _isNonPageUrl(url) {
    const nonPagePatterns = [
      /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|css|js|xml|json)$/i,
      /\/tag\//i,
      /\/author\//i,
      /\/page\/\d+/i,
      /\?/,
      /\/feed\//i,
      /\/wp-content\//i,
      /\/wp-admin\//i
    ];
    
    return nonPagePatterns.some(pattern => pattern.test(url));
  }
  
  /**
   * Estimate traffic for a page based on URL patterns
   * @param {Object} page - Page object
   * @returns {number} Estimated traffic
   */
  _estimateTraffic(page) {
    const url = page.url.toLowerCase();
    let score = 1000; // Base score
    
    // High-value page patterns
    if (url.includes('/best-') || url.includes('-best-')) score += 5000;
    if (url.includes('/review') || url.includes('-review')) score += 4000;
    if (url.includes('/guide') || url.includes('-guide')) score += 3000;
    if (url.includes('/how-to') || url.includes('/tutorial')) score += 2500;
    if (url.includes('/comparison') || url.includes('-vs-')) score += 4500;
    
    // Freshness bonus
    if (page.lastmod) {
      const lastmod = new Date(page.lastmod);
      const daysSinceUpdate = (Date.now() - lastmod.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score *= 1.5;
      if (daysSinceUpdate < 7) score *= 2;
    }
    
    // Priority bonus
    if (page.priority) {
      score *= (1 + page.priority);
    }
    
    return Math.round(score);
  }
  
  /**
   * Estimate CPC for a page based on URL patterns
   * @param {Object} page - Page object
   * @returns {number} Estimated CPC
   */
  _estimateCPC(page) {
    const url = page.url.toLowerCase();
    let cpc = 0.50; // Base CPC
    
    // Commercial intent patterns
    if (url.includes('/best-') || url.includes('-best-')) cpc += 5.0;
    if (url.includes('casino') || url.includes('betting')) cpc += 15.0;
    if (url.includes('insurance') || url.includes('loan')) cpc += 10.0;
    if (url.includes('software') || url.includes('saas')) cpc += 8.0;
    if (url.includes('/buy') || url.includes('/pricing')) cpc += 3.0;
    if (url.includes('/review') || url.includes('-review')) cpc += 4.0;
    if (url.includes('/comparison') || url.includes('-vs-')) cpc += 6.0;
    
    return Math.round(cpc * 100) / 100;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2F: GLOBAL FETCHER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get fetcher instance
 * @returns {StealthForensicFetcher}
 */
function getFetcher() {
  return new StealthForensicFetcher();
}

/**
 * Start Oracle fetching for a competitor
 * @param {string} competitorDomain - Domain to analyze
 * @param {Array} pages - Optional array of pages (if not provided, discovers from sitemap)
 */
function startOracleFetch(competitorDomain, pages = null) {
  const fetcher = getFetcher();
  
  if (!pages) {
    // Discover pages from sitemap
    const discovery = new CompetitorPageDiscovery();
    pages = discovery.discoverFromSitemap(competitorDomain);
    console.log(`📍 Discovered ${pages.length} pages for ${competitorDomain}`);
  }
  
  return fetcher.startFetching(competitorDomain, pages);
}

/**
 * Continue Oracle fetching (called by trigger)
 */
function oracleFetcherContinue() {
  console.log('💓 Oracle Fetcher: Continuing...');
  const fetcher = getFetcher();
  return fetcher.continueFetching();
}

/**
 * Stop Oracle fetching
 */
function stopOracleFetch() {
  const fetcher = getFetcher();
  return fetcher.stop();
}

/**
 * Get Oracle fetch status
 */
function getOracleFetchStatus() {
  const fetcher = getFetcher();
  return fetcher.getStatus();
}

/**
 * Discover pages for a competitor domain
 * @param {string} domain - Competitor domain
 */
function discoverCompetitorPages(domain) {
  const discovery = new CompetitorPageDiscovery();
  const pages = discovery.discoverFromSitemap(domain);
  console.log(`Found ${pages.length} pages for ${domain}`);
  return pages;
}

/**
 * Test fetching a single URL
 * @param {string} url - URL to test
 */
function testSingleFetch(url) {
  const fetcher = getFetcher();
  const result = fetcher._fetchWithGovernance(url);
  console.log('Fetch result:', JSON.stringify({
    success: result.success,
    statusCode: result.statusCode,
    contentLength: result.content?.length || 0,
    piiRemoved: result.piiStats?.total || 0
  }, null, 2));
  return result;
}

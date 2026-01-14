/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 1: BLOG PAGE DISCOVERY ENGINE
 * Enhanced Blog/Content Page Discovery from Sitemap + Internal Links
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Discover top 10-15 blog/content pages per competitor
 * - Sitemap-first approach (sitemap.xml, sitemap_index.xml)
 * - Fallback to common blog URL patterns
 * - Internal link crawling from homepage
 * - Prioritize recent/popular content pages
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// BLOG DISCOVERY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var BLOG_DISCOVERY_CONFIG = {
  // Discovery limits
  MAX_BLOG_PAGES: 15,
  MIN_BLOG_PAGES: 10,
  MAX_SITEMAP_URLS: 100,
  
  // Common blog/content URL patterns to try
  BLOG_URL_PATTERNS: [
    '/blog',
    '/blog/',
    '/articles',
    '/articles/',
    '/news',
    '/news/',
    '/resources',
    '/insights',
    '/guides',
    '/posts',
    '/learn',
    '/knowledge-base'
  ],
  
  // Sitemap locations to try
  SITEMAP_LOCATIONS: [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-posts.xml',
    '/post-sitemap.xml',
    '/blog-sitemap.xml',
    '/news-sitemap.xml',
    '/sitemap1.xml',
    '/sitemaps/sitemap.xml'
  ],
  
  // URL patterns that indicate blog/content pages
  CONTENT_URL_PATTERNS: [
    /\/blog\//i,
    /\/article\//i,
    /\/post\//i,
    /\/news\//i,
    /\/guide\//i,
    /\/how-to-/i,
    /\/what-is-/i,
    /\/best-/i,
    /\/top-\d+-/i,
    /\/\d{4}\/\d{2}\//i,  // Date-based URLs (2024/01/)
    /\/resources\//i,
    /\/insights\//i,
    /\/learn\//i,
    /\/tips\//i,
    /\/tutorial\//i
  ],
  
  // Exclude patterns (navigation, categories, tags)
  EXCLUDE_PATTERNS: [
    /\/category\//i,
    /\/tag\//i,
    /\/author\//i,
    /\/page\/\d+/i,
    /\/feed\//i,
    /\/wp-content\//i,
    /\/wp-admin\//i,
    /\?.*page/i,
    /#/,
    /\.pdf$/i,
    /\.jpg$/i,
    /\.png$/i,
    /\.gif$/i,
    /mailto:/i,
    /javascript:/i
  ],
  
  // Request timeout
  FETCH_TIMEOUT: 15000
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: BLOG DISCOVERY ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BlogDiscoveryEngine - Discovers blog/content pages from competitor domains
 */
class BlogDiscoveryEngine {
  
  constructor() {
    this.cache = {};
  }
  
  /**
   * Discover blog pages for a domain
   * @param {string} domain - Domain to discover (e.g., competitor.com)
   * @returns {Object} Discovery result with blog URLs
   */
  discoverBlogPages(domain) {
    console.log(`📚 BlogDiscovery: Starting discovery for ${domain}`);
    const startTime = Date.now();
    
    // Normalize domain
    domain = this._normalizeDomain(domain);
    const baseUrl = 'https://' + domain;
    
    const discoveredUrls = new Set();
    const urlDetails = [];
    
    // Strategy 1: Try sitemap first (most reliable)
    console.log(`   📍 Strategy 1: Checking sitemaps...`);
    const sitemapUrls = this._discoverFromSitemap(baseUrl);
    for (const url of sitemapUrls) {
      if (!discoveredUrls.has(url)) {
        discoveredUrls.add(url);
        urlDetails.push({ url: url, source: 'sitemap', priority: 1 });
      }
    }
    console.log(`      Found ${sitemapUrls.length} URLs from sitemap`);
    
    // If we have enough from sitemap, we're done
    if (discoveredUrls.size >= BLOG_DISCOVERY_CONFIG.MAX_BLOG_PAGES) {
      return this._buildResult(domain, urlDetails, startTime);
    }
    
    // Strategy 2: Check common blog index pages
    console.log(`   📍 Strategy 2: Checking blog index pages...`);
    const blogIndexUrls = this._discoverFromBlogIndex(baseUrl);
    for (const url of blogIndexUrls) {
      if (!discoveredUrls.has(url)) {
        discoveredUrls.add(url);
        urlDetails.push({ url: url, source: 'blog_index', priority: 2 });
      }
    }
    console.log(`      Found ${blogIndexUrls.length} URLs from blog index`);
    
    // Strategy 3: Crawl homepage for internal links
    if (discoveredUrls.size < BLOG_DISCOVERY_CONFIG.MIN_BLOG_PAGES) {
      console.log(`   📍 Strategy 3: Crawling homepage links...`);
      const homepageUrls = this._discoverFromHomepage(baseUrl, domain);
      for (const url of homepageUrls) {
        if (!discoveredUrls.has(url)) {
          discoveredUrls.add(url);
          urlDetails.push({ url: url, source: 'homepage', priority: 3 });
        }
      }
      console.log(`      Found ${homepageUrls.length} URLs from homepage`);
    }
    
    return this._buildResult(domain, urlDetails, startTime);
  }
  
  /**
   * Discover blog URLs from sitemap
   * @param {string} baseUrl - Base URL (https://domain.com)
   * @returns {Array} Array of blog URLs
   */
  _discoverFromSitemap(baseUrl) {
    const blogUrls = [];
    
    for (const sitemapPath of BLOG_DISCOVERY_CONFIG.SITEMAP_LOCATIONS) {
      const sitemapUrl = baseUrl + sitemapPath;
      
      try {
        const response = UrlFetchApp.fetch(sitemapUrl, {
          muteHttpExceptions: true,
          followRedirects: true,
          timeout: BLOG_DISCOVERY_CONFIG.FETCH_TIMEOUT
        });
        
        if (response.getResponseCode() !== 200) continue;
        
        const content = response.getContentText();
        
        // Check if it's a sitemap index
        if (content.includes('<sitemapindex')) {
          const childUrls = this._parseSitemapIndex(content, baseUrl);
          for (const childUrl of childUrls) {
            if (blogUrls.length >= BLOG_DISCOVERY_CONFIG.MAX_SITEMAP_URLS) break;
            const childBlogUrls = this._parseSitemap(childUrl);
            blogUrls.push(...childBlogUrls);
          }
        } else {
          // Regular sitemap
          const urls = this._parseSitemap(sitemapUrl, content);
          blogUrls.push(...urls);
        }
        
        // If we found URLs, don't check other sitemap locations
        if (blogUrls.length > 0) break;
        
      } catch (e) {
        // Sitemap not found or error, continue to next
        continue;
      }
    }
    
    // Filter to only blog/content URLs and limit
    return this._filterBlogUrls(blogUrls)
      .slice(0, BLOG_DISCOVERY_CONFIG.MAX_BLOG_PAGES);
  }
  
  /**
   * Parse sitemap index to get child sitemap URLs
   */
  _parseSitemapIndex(xml, baseUrl) {
    const sitemapUrls = [];
    const regex = /<loc>([^<]+)<\/loc>/gi;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      const url = match[1].trim();
      // Prioritize post/blog sitemaps
      if (url.includes('post') || url.includes('blog') || url.includes('article')) {
        sitemapUrls.unshift(url);
      } else {
        sitemapUrls.push(url);
      }
    }
    
    return sitemapUrls.slice(0, 5); // Check up to 5 child sitemaps
  }
  
  /**
   * Parse sitemap XML to extract URLs
   */
  _parseSitemap(sitemapUrl, content = null) {
    const urls = [];
    
    try {
      if (!content) {
        const response = UrlFetchApp.fetch(sitemapUrl, {
          muteHttpExceptions: true,
          followRedirects: true,
          timeout: BLOG_DISCOVERY_CONFIG.FETCH_TIMEOUT
        });
        
        if (response.getResponseCode() !== 200) return urls;
        content = response.getContentText();
      }
      
      const regex = /<loc>([^<]+)<\/loc>/gi;
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const url = match[1].trim();
        if (url.startsWith('http')) {
          urls.push(url);
        }
      }
      
    } catch (e) {
      console.log(`      ⚠️ Error parsing sitemap: ${e.message}`);
    }
    
    return urls;
  }
  
  /**
   * Discover blog URLs from blog index pages
   */
  _discoverFromBlogIndex(baseUrl) {
    const blogUrls = [];
    
    for (const pattern of BLOG_DISCOVERY_CONFIG.BLOG_URL_PATTERNS) {
      const indexUrl = baseUrl + pattern;
      
      try {
        const response = UrlFetchApp.fetch(indexUrl, {
          muteHttpExceptions: true,
          followRedirects: true,
          timeout: BLOG_DISCOVERY_CONFIG.FETCH_TIMEOUT
        });
        
        if (response.getResponseCode() !== 200) continue;
        
        const html = response.getContentText();
        const links = this._extractLinksFromHtml(html, baseUrl);
        blogUrls.push(...links);
        
        // Found a working blog index, stop
        if (blogUrls.length > 0) break;
        
      } catch (e) {
        continue;
      }
    }
    
    return this._filterBlogUrls(blogUrls)
      .slice(0, BLOG_DISCOVERY_CONFIG.MAX_BLOG_PAGES);
  }
  
  /**
   * Discover blog URLs from homepage internal links
   */
  _discoverFromHomepage(baseUrl, domain) {
    const blogUrls = [];
    
    try {
      const response = UrlFetchApp.fetch(baseUrl, {
        muteHttpExceptions: true,
        followRedirects: true,
        timeout: BLOG_DISCOVERY_CONFIG.FETCH_TIMEOUT
      });
      
      if (response.getResponseCode() === 200) {
        const html = response.getContentText();
        const links = this._extractLinksFromHtml(html, baseUrl);
        blogUrls.push(...links);
      }
      
    } catch (e) {
      console.log(`      ⚠️ Error fetching homepage: ${e.message}`);
    }
    
    return this._filterBlogUrls(blogUrls)
      .slice(0, BLOG_DISCOVERY_CONFIG.MAX_BLOG_PAGES);
  }
  
  /**
   * Extract all internal links from HTML
   */
  _extractLinksFromHtml(html, baseUrl) {
    const links = [];
    const domain = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const seen = new Set();
    
    // Match all href attributes
    const linkRegex = /href\s*=\s*["']([^"']+)["']/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      let url = match[1].trim();
      
      // Resolve relative URLs
      if (url.startsWith('/') && !url.startsWith('//')) {
        url = baseUrl + url;
      } else if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (!url.startsWith('http')) {
        continue; // Skip non-http links
      }
      
      // Check if same domain
      if (!url.includes(domain)) continue;
      
      // Remove hash and query params for deduplication
      const cleanUrl = url.split('#')[0].split('?')[0];
      
      if (!seen.has(cleanUrl)) {
        seen.add(cleanUrl);
        links.push(cleanUrl);
      }
    }
    
    return links;
  }
  
  /**
   * Filter URLs to only include likely blog/content pages
   */
  _filterBlogUrls(urls) {
    return urls.filter(url => {
      // Exclude unwanted patterns
      for (const pattern of BLOG_DISCOVERY_CONFIG.EXCLUDE_PATTERNS) {
        if (pattern.test(url)) return false;
      }
      
      // Include if matches content patterns
      for (const pattern of BLOG_DISCOVERY_CONFIG.CONTENT_URL_PATTERNS) {
        if (pattern.test(url)) return true;
      }
      
      // Include if URL has slug-like structure (words separated by hyphens)
      const path = url.split('/').pop() || '';
      if (path.includes('-') && path.length > 10 && !path.includes('.')) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Normalize domain name
   */
  _normalizeDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
  
  /**
   * Build discovery result object
   */
  _buildResult(domain, urlDetails, startTime) {
    // Sort by priority and limit
    urlDetails.sort((a, b) => a.priority - b.priority);
    const finalUrls = urlDetails.slice(0, BLOG_DISCOVERY_CONFIG.MAX_BLOG_PAGES);
    
    const result = {
      success: true,
      domain: domain,
      discoveredAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      totalFound: urlDetails.length,
      blogPages: finalUrls.map((item, index) => ({
        url: item.url,
        source: item.source,
        priority: index + 1
      })),
      blogPageCount: finalUrls.length,
      sources: {
        sitemap: urlDetails.filter(u => u.source === 'sitemap').length,
        blogIndex: urlDetails.filter(u => u.source === 'blog_index').length,
        homepage: urlDetails.filter(u => u.source === 'homepage').length
      }
    };
    
    console.log(`✅ BlogDiscovery: Found ${result.blogPageCount} blog pages for ${domain} in ${result.processingTimeMs}ms`);
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get blog discovery engine instance
 * @returns {BlogDiscoveryEngine}
 */
function getBlogDiscoveryEngine() {
  return new BlogDiscoveryEngine();
}

/**
 * Discover blog pages for a single domain
 * @param {string} domain - Domain to discover
 * @returns {Object} Discovery result
 */
function discoverBlogPages(domain) {
  const engine = getBlogDiscoveryEngine();
  return engine.discoverBlogPages(domain);
}

/**
 * Discover blog pages for multiple domains
 * @param {Array} domains - Array of domains
 * @returns {Object} Map of domain to discovery results
 */
function discoverBlogPagesForDomains(domains) {
  const engine = getBlogDiscoveryEngine();
  const results = {};
  
  for (const domain of domains) {
    try {
      results[domain] = engine.discoverBlogPages(domain);
      // Small delay between domains to avoid rate limiting
      Utilities.sleep(1000);
    } catch (e) {
      results[domain] = {
        success: false,
        domain: domain,
        error: e.message,
        blogPages: [],
        blogPageCount: 0
      };
    }
  }
  
  return results;
}

/**
 * Test blog discovery with a sample domain
 */
function testBlogDiscovery() {
  const testDomain = 'serpifai.com';
  console.log(`🧪 Testing blog discovery for: ${testDomain}`);
  
  const result = discoverBlogPages(testDomain);
  console.log('Discovery Result:', JSON.stringify(result, null, 2));
  
  return result;
}

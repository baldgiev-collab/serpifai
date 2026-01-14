/**
 * FT_Crawl.gs - Website Crawling
 * SerpifAI V8 - Crawl websites for SEO analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// WEBSITE CRAWLER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Crawl website starting from URL
 */
function FT_crawlWebsite(params) {
  const startUrl = params.url;
  const maxPages = Math.min(params.maxPages || 20, 50);
  const depth = Math.min(params.depth || 2, 3);
  
  if (!startUrl) {
    return { ok: false, error: 'Start URL required' };
  }
  
  try {
    const baseUrl = getBaseUrl(startUrl);
    const baseDomain = getDomain(startUrl);
    
    const visited = {};
    const queue = [{ url: startUrl, depth: 0 }];
    const pages = [];
    
    while (queue.length > 0 && pages.length < maxPages) {
      const current = queue.shift();
      
      if (visited[current.url]) continue;
      visited[current.url] = true;
      
      // Crawl the page
      const pageData = crawlPage(current.url, baseDomain);
      
      if (pageData.ok) {
        pages.push({
          ...pageData,
          depth: current.depth
        });
        
        // Add internal links to queue
        if (current.depth < depth) {
          pageData.internalLinks.forEach(function(link) {
            if (!visited[link] && isSameDomain(link, baseDomain)) {
              queue.push({ url: link, depth: current.depth + 1 });
            }
          });
        }
        
        // Delay to be polite
        Utilities.sleep(200);
      }
    }
    
    return {
      ok: true,
      startUrl: startUrl,
      pagesFound: pages.length,
      pages: pages,
      summary: analyzeCrawlResults(pages)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get base URL
 */
function getBaseUrl(url) {
  const match = url.match(/^(https?:\/\/[^\/]+)/i);
  return match ? match[1] : url;
}

/**
 * Get domain from URL
 */
function getDomain(url) {
  const match = url.match(/^https?:\/\/([^\/]+)/i);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Check if URL is same domain
 */
function isSameDomain(url, domain) {
  const urlDomain = getDomain(url);
  return urlDomain === domain || urlDomain.endsWith('.' + domain);
}

/**
 * Crawl single page
 */
function crawlPage(url, baseDomain) {
  try {
    const startTime = Date.now();
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const loadTime = Date.now() - startTime;
    const status = response.getResponseCode();
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    // Extract data
    const title = extractTitle(html);
    const meta = extractMetaDescription(html);
    const h1 = extractH1(html);
    const canonical = extractCanonical(html);
    const links = extractLinks(html, url, baseDomain);
    const images = countImages(html);
    const wordCount = countWordsInPage(html);
    
    return {
      ok: true,
      url: url,
      status: status,
      loadTime: loadTime,
      title: title,
      metaDescription: meta,
      h1: h1,
      canonical: canonical,
      wordCount: wordCount,
      imageCount: images.total,
      imagesWithoutAlt: images.missingAlt,
      internalLinks: links.internal,
      externalLinks: links.external.length,
      contentType: headers['Content-Type'] || 'unknown'
    };
  } catch (err) {
    return {
      ok: false,
      url: url,
      error: err.message
    };
  }
}

/**
 * Extract title
 */
function FT_Crawl_extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

/**
 * Extract meta description
 */
function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (match) return match[1];
  
  // Try alternate format
  const match2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return match2 ? match2[1] : '';
}

/**
 * Extract H1
 */
function extractH1(html) {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return match ? match[1].trim() : '';
}

/**
 * Extract canonical
 */
function FT_Crawl_extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

/**
 * Extract links
 */
function extractLinks(html, pageUrl, baseDomain) {
  const baseUrl = getBaseUrl(pageUrl);
  const linkPattern = /<a[^>]+href=["']([^"'#]+)["']/gi;
  const internal = [];
  const external = [];
  const seen = {};
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    let href = match[1];
    
    // Skip special links
    if (href.match(/^(mailto:|tel:|javascript:)/i)) continue;
    
    // Make absolute
    if (href.startsWith('/')) {
      href = baseUrl + href;
    } else if (!href.startsWith('http')) {
      continue;
    }
    
    // Skip duplicates
    if (seen[href]) continue;
    seen[href] = true;
    
    if (isSameDomain(href, baseDomain)) {
      internal.push(href);
    } else {
      external.push(href);
    }
  }
  
  return { internal: internal, external: external };
}

/**
 * Count images
 */
function countImages(html) {
  const imgPattern = /<img[^>]+>/gi;
  const images = html.match(imgPattern) || [];
  
  let missingAlt = 0;
  images.forEach(function(img) {
    if (!img.match(/alt=["'][^"']+["']/i)) {
      missingAlt++;
    }
  });
  
  return { total: images.length, missingAlt: missingAlt };
}

/**
 * Count words in page
 */
function countWordsInPage(html) {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  
  const words = text.split(' ').filter(function(w) { return w.length > 0; });
  return words.length;
}

/**
 * Analyze crawl results
 */
function analyzeCrawlResults(pages) {
  const summary = {
    totalPages: pages.length,
    avgLoadTime: 0,
    missingTitle: 0,
    missingMeta: 0,
    missingH1: 0,
    duplicateTitles: 0,
    shortContent: 0,
    issues: []
  };
  
  let totalLoadTime = 0;
  const titles = {};
  
  pages.forEach(function(page) {
    totalLoadTime += page.loadTime || 0;
    
    if (!page.title) summary.missingTitle++;
    if (!page.metaDescription) summary.missingMeta++;
    if (!page.h1) summary.missingH1++;
    if (page.wordCount < 300) summary.shortContent++;
    
    // Track duplicate titles
    if (page.title) {
      titles[page.title] = (titles[page.title] || 0) + 1;
    }
  });
  
  // Count duplicates
  Object.values(titles).forEach(function(count) {
    if (count > 1) summary.duplicateTitles++;
  });
  
  summary.avgLoadTime = pages.length > 0 ? Math.round(totalLoadTime / pages.length) : 0;
  
  // Generate issues
  if (summary.missingTitle > 0) {
    summary.issues.push(summary.missingTitle + ' pages missing title');
  }
  if (summary.missingMeta > 0) {
    summary.issues.push(summary.missingMeta + ' pages missing meta description');
  }
  if (summary.missingH1 > 0) {
    summary.issues.push(summary.missingH1 + ' pages missing H1');
  }
  if (summary.duplicateTitles > 0) {
    summary.issues.push(summary.duplicateTitles + ' duplicate titles found');
  }
  if (summary.shortContent > 0) {
    summary.issues.push(summary.shortContent + ' pages with thin content (<300 words)');
  }
  
  return summary;
}

/**
 * Quick site overview
 */
function FT_getSiteOverview(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  // Crawl limited pages for overview
  const crawl = FT_crawlWebsite({
    url: url,
    maxPages: 10,
    depth: 1
  });
  
  if (!crawl.ok) return crawl;
  
  return {
    ok: true,
    url: url,
    pagesAnalyzed: crawl.pagesFound,
    summary: crawl.summary,
    topIssues: crawl.summary.issues.slice(0, 5)
  };
}

/**
 * Find orphan pages
 */
function FT_findOrphanPages(params) {
  const sitemapUrl = params.sitemapUrl;
  const startUrl = params.url;
  
  if (!sitemapUrl && !startUrl) {
    return { ok: false, error: 'Sitemap URL or start URL required' };
  }
  
  try {
    // Get pages from sitemap
    let sitemapPages = [];
    if (sitemapUrl) {
      const sitemapResult = FT_fetchSitemap({ url: sitemapUrl });
      if (sitemapResult.ok) {
        sitemapPages = sitemapResult.urls.map(function(u) { return u.url || u; });
      }
    }
    
    // Crawl site
    const crawl = FT_crawlWebsite({ url: startUrl, maxPages: 30, depth: 2 });
    if (!crawl.ok) return crawl;
    
    const linkedPages = {};
    crawl.pages.forEach(function(p) {
      linkedPages[p.url] = true;
      (p.internalLinks || []).forEach(function(l) {
        linkedPages[l] = true;
      });
    });
    
    // Find pages in sitemap but not linked
    const orphans = sitemapPages.filter(function(url) {
      return !linkedPages[url];
    });
    
    return {
      ok: true,
      sitemapPages: sitemapPages.length,
      linkedPages: Object.keys(linkedPages).length,
      orphanPages: orphans
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * FT_LinkChecker.gs - Link Checking and Validation
 * SerpifAI V8 - Broken link detection and analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// LINK CHECKER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check all links on a page
 */
function FT_checkPageLinks(params) {
  const url = params.url;
  const checkExternal = params.checkExternal !== false;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Fetch the page
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const baseUrl = extractBaseUrl(url);
    
    // Extract all links
    const links = extractAllLinks(html, baseUrl);
    
    // Check links
    const results = {
      checked: 0,
      working: [],
      broken: [],
      redirected: [],
      timeout: []
    };
    
    const maxChecks = Math.min(links.length, 50); // Limit to avoid timeout
    
    for (let i = 0; i < maxChecks; i++) {
      const link = links[i];
      
      // Skip external links if not requested
      if (!checkExternal && link.isExternal) {
        continue;
      }
      
      const checkResult = checkSingleLink(link.url);
      results.checked++;
      
      if (checkResult.status >= 200 && checkResult.status < 300) {
        results.working.push({ ...link, status: checkResult.status });
      } else if (checkResult.status >= 300 && checkResult.status < 400) {
        results.redirected.push({ ...link, status: checkResult.status, redirect: checkResult.redirect });
      } else if (checkResult.timeout) {
        results.timeout.push({ ...link, error: 'Timeout' });
      } else {
        results.broken.push({ ...link, status: checkResult.status, error: checkResult.error });
      }
      
      // Small delay to avoid rate limiting
      Utilities.sleep(100);
    }
    
    return {
      ok: true,
      url: url,
      totalLinks: links.length,
      results: results,
      summary: {
        working: results.working.length,
        broken: results.broken.length,
        redirected: results.redirected.length,
        timeout: results.timeout.length
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract base URL
 */
function FT_Link_extractBaseUrl(url) {
  const match = url.match(/^(https?:\/\/[^\/]+)/i);
  return match ? match[1] : url;
}

/**
 * Extract all links from HTML
 */
function extractAllLinks(html, baseUrl) {
  const linkPattern = /<a[^>]+href=["']([^"']+)["']/gi;
  const links = [];
  const seen = {};
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    let href = match[1];
    
    // Skip mailto, tel, javascript
    if (href.match(/^(mailto:|tel:|javascript:|#)/i)) {
      continue;
    }
    
    // Convert relative to absolute
    if (href.startsWith('/')) {
      href = baseUrl + href;
    } else if (!href.startsWith('http')) {
      href = baseUrl + '/' + href;
    }
    
    // Skip duplicates
    if (seen[href]) continue;
    seen[href] = true;
    
    const isExternal = !href.includes(new URL(baseUrl).hostname);
    
    links.push({
      url: href,
      isExternal: isExternal
    });
  }
  
  return links;
}

/**
 * Check single link
 */
function checkSingleLink(url) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: false,
      validateHttpsCertificates: false
    });
    
    const status = response.getResponseCode();
    const headers = response.getAllHeaders();
    
    return {
      status: status,
      redirect: headers['Location'] || headers['location'] || null
    };
  } catch (err) {
    if (err.message.indexOf('Timeout') >= 0) {
      return { status: 0, timeout: true };
    }
    return { status: 0, error: err.message };
  }
}

/**
 * Find broken internal links
 */
function FT_findBrokenInternalLinks(params) {
  const url = params.url;
  const depth = Math.min(params.depth || 1, 3);
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const baseUrl = extractBaseUrl(url);
    const visited = {};
    const brokenLinks = [];
    const pagesToCheck = [url];
    
    for (let d = 0; d < depth && pagesToCheck.length > 0; d++) {
      const currentPage = pagesToCheck.shift();
      
      if (visited[currentPage]) continue;
      visited[currentPage] = true;
      
      try {
        const response = UrlFetchApp.fetch(currentPage, {
          muteHttpExceptions: true,
          followRedirects: true
        });
        
        const html = response.getContentText();
        const links = extractAllLinks(html, baseUrl);
        
        // Check internal links only
        links.filter(function(l) { return !l.isExternal; }).forEach(function(link) {
          if (!visited[link.url]) {
            const result = checkSingleLink(link.url);
            
            if (result.status >= 400 || result.status === 0) {
              brokenLinks.push({
                foundOn: currentPage,
                brokenUrl: link.url,
                status: result.status,
                error: result.error
              });
            }
            
            // Add to crawl queue
            if (d < depth - 1 && result.status >= 200 && result.status < 400) {
              pagesToCheck.push(link.url);
            }
          }
        });
        
        Utilities.sleep(200);
      } catch (err) {
        // Skip pages that can't be fetched
      }
    }
    
    return {
      ok: true,
      startUrl: url,
      pagesChecked: Object.keys(visited).length,
      brokenLinks: brokenLinks
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check external links only
 */
function FT_checkExternalLinks(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const baseUrl = extractBaseUrl(url);
    const links = extractAllLinks(html, baseUrl);
    
    // Filter to external only
    const externalLinks = links.filter(function(l) { return l.isExternal; });
    
    const results = [];
    const maxChecks = Math.min(externalLinks.length, 30);
    
    for (let i = 0; i < maxChecks; i++) {
      const link = externalLinks[i];
      const checkResult = checkSingleLink(link.url);
      
      results.push({
        url: link.url,
        status: checkResult.status,
        isWorking: checkResult.status >= 200 && checkResult.status < 400,
        error: checkResult.error
      });
      
      Utilities.sleep(150);
    }
    
    const brokenCount = results.filter(function(r) { return !r.isWorking; }).length;
    
    return {
      ok: true,
      pageUrl: url,
      totalExternal: externalLinks.length,
      checked: results.length,
      brokenCount: brokenCount,
      links: results
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Validate anchor texts
 */
function FT_analyzeAnchorTexts(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const anchorPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const anchors = [];
    const issues = [];
    let match;
    
    while ((match = anchorPattern.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      
      // Skip non-http links
      if (href.match(/^(mailto:|tel:|javascript:|#)/i)) continue;
      
      anchors.push({
        url: href,
        text: text
      });
      
      // Check for issues
      if (!text || text.length < 2) {
        issues.push({ url: href, issue: 'Empty or very short anchor text' });
      } else if (text.match(/^(click here|here|read more|learn more|link)$/i)) {
        issues.push({ url: href, text: text, issue: 'Generic anchor text' });
      } else if (text.length > 100) {
        issues.push({ url: href, text: text.substring(0, 50) + '...', issue: 'Anchor text too long' });
      }
    }
    
    // Count anchor text usage
    const textCounts = {};
    anchors.forEach(function(a) {
      const t = a.text.toLowerCase();
      textCounts[t] = (textCounts[t] || 0) + 1;
    });
    
    const overused = Object.keys(textCounts)
      .filter(function(t) { return textCounts[t] > 3; })
      .map(function(t) { return { text: t, count: textCounts[t] }; });
    
    return {
      ok: true,
      url: url,
      totalAnchors: anchors.length,
      issues: issues,
      overusedAnchors: overused,
      anchors: anchors.slice(0, 50)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check outbound link quality
 */
function FT_checkOutboundLinkQuality(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const baseUrl = extractBaseUrl(url);
    const links = extractAllLinks(html, baseUrl);
    
    const external = links.filter(function(l) { return l.isExternal; });
    
    // Analyze external links
    const analysis = external.map(function(link) {
      const domain = extractDomain(link.url);
      return {
        url: link.url,
        domain: domain,
        hasNofollow: checkNoFollow(html, link.url),
        protocol: link.url.startsWith('https') ? 'https' : 'http'
      };
    });
    
    // Count domains
    const domainCounts = {};
    analysis.forEach(function(a) {
      domainCounts[a.domain] = (domainCounts[a.domain] || 0) + 1;
    });
    
    const httpCount = analysis.filter(function(a) { return a.protocol === 'http'; }).length;
    
    return {
      ok: true,
      url: url,
      outboundCount: external.length,
      uniqueDomains: Object.keys(domainCounts).length,
      httpLinks: httpCount,
      domains: domainCounts,
      links: analysis.slice(0, 30),
      warnings: httpCount > 0 ? ['Found ' + httpCount + ' non-HTTPS outbound links'] : []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract domain from URL
 */
function FT_LC_extractDomain(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/i);
    return match ? match[1].replace(/^www\./, '') : url;
  } catch (e) {
    return url;
  }
}

/**
 * Check if link has nofollow
 */
function checkNoFollow(html, linkUrl) {
  const pattern = new RegExp('<a[^>]+href=["\']' + linkUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'][^>]*>', 'i');
  const match = html.match(pattern);
  return match && match[0].toLowerCase().indexOf('nofollow') >= 0;
}

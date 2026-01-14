/**
 * FT_SiteMap.gs - Sitemap Analysis
 * SerpifAI V8 - Sitemap parsing and analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SITEMAP ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch and parse sitemap
 */
function FT_fetchSitemap(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  try {
    // Try common sitemap locations
    const sitemapUrls = [
      url.replace(/\/?$/, '') + '/sitemap.xml',
      url.replace(/\/?$/, '') + '/sitemap_index.xml',
      url.replace(/\/?$/, '') + '/sitemap/sitemap.xml'
    ];
    
    let sitemapContent = null;
    let foundUrl = null;
    
    for (let i = 0; i < sitemapUrls.length; i++) {
      try {
        const response = UrlFetchApp.fetch(sitemapUrls[i], {
          muteHttpExceptions: true,
          followRedirects: true
        });
        
        if (response.getResponseCode() === 200) {
          sitemapContent = response.getContentText();
          foundUrl = sitemapUrls[i];
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!sitemapContent) {
      return { ok: false, error: 'Sitemap not found' };
    }
    
    // Parse XML
    const urls = parseSitemapXML(sitemapContent);
    
    return {
      ok: true,
      sitemapUrl: foundUrl,
      urlCount: urls.length,
      urls: urls.slice(0, 100) // Return first 100
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Parse sitemap XML
 */
function parseSitemapXML(xml) {
  const urls = [];
  
  // Check if this is a sitemap index
  if (xml.indexOf('<sitemapindex') >= 0) {
    // Extract sitemap locations
    const pattern = /<loc>([^<]+)<\/loc>/gi;
    let match;
    
    while ((match = pattern.exec(xml)) !== null) {
      urls.push({
        url: match[1],
        type: 'sitemap'
      });
    }
  } else {
    // Parse regular sitemap
    const urlPattern = /<url>([\s\S]*?)<\/url>/gi;
    let urlMatch;
    
    while ((urlMatch = urlPattern.exec(xml)) !== null) {
      const urlContent = urlMatch[1];
      
      const locMatch = urlContent.match(/<loc>([^<]+)<\/loc>/i);
      const lastmodMatch = urlContent.match(/<lastmod>([^<]+)<\/lastmod>/i);
      const priorityMatch = urlContent.match(/<priority>([^<]+)<\/priority>/i);
      const changefreqMatch = urlContent.match(/<changefreq>([^<]+)<\/changefreq>/i);
      
      if (locMatch) {
        urls.push({
          url: locMatch[1],
          lastmod: lastmodMatch ? lastmodMatch[1] : null,
          priority: priorityMatch ? parseFloat(priorityMatch[1]) : null,
          changefreq: changefreqMatch ? changefreqMatch[1] : null,
          type: 'page'
        });
      }
    }
  }
  
  return urls;
}

/**
 * Analyze sitemap health
 */
function FT_analyzeSitemapHealth(params) {
  const result = FT_fetchSitemap(params);
  
  if (!result.ok) {
    return result;
  }
  
  const urls = result.urls;
  const issues = [];
  const stats = {
    total: urls.length,
    withLastmod: 0,
    withPriority: 0,
    withChangefreq: 0
  };
  
  // Analyze URLs
  urls.forEach(function(urlData) {
    if (urlData.lastmod) stats.withLastmod++;
    if (urlData.priority) stats.withPriority++;
    if (urlData.changefreq) stats.withChangefreq++;
    
    // Check for issues
    if (!urlData.lastmod) {
      issues.push({
        type: 'warning',
        url: urlData.url,
        message: 'Missing lastmod date'
      });
    }
    
    // Check old lastmod
    if (urlData.lastmod) {
      const lastmod = new Date(urlData.lastmod);
      const monthsAgo = (new Date() - lastmod) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsAgo > 12) {
        issues.push({
          type: 'info',
          url: urlData.url,
          message: 'Not updated in over 12 months'
        });
      }
    }
  });
  
  // Calculate score
  let score = 100;
  
  if (stats.withLastmod < stats.total * 0.5) score -= 20;
  if (stats.withPriority < stats.total * 0.5) score -= 10;
  
  return {
    ok: true,
    sitemapUrl: result.sitemapUrl,
    score: Math.max(0, score),
    stats: stats,
    issues: issues.slice(0, 20),
    issueCount: issues.length
  };
}

/**
 * Compare sitemap with indexed pages
 */
function FT_compareSitemapToIndex(params) {
  const sitemapResult = FT_fetchSitemap(params);
  
  if (!sitemapResult.ok) {
    return sitemapResult;
  }
  
  const sitemapUrls = sitemapResult.urls.map(function(u) { return u.url; });
  
  // In production, would check Google Search Console
  // For demo, return mock comparison
  
  return {
    ok: true,
    sitemapCount: sitemapUrls.length,
    indexedCount: Math.floor(sitemapUrls.length * 0.85), // Mock 85% indexed
    notIndexed: Math.floor(sitemapUrls.length * 0.15),
    notInSitemap: Math.floor(sitemapUrls.length * 0.05)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SITEMAP GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate sitemap XML
 */
function FT_generateSitemap(params) {
  const urls = params.urls || [];
  const baseUrl = params.baseUrl || '';
  
  if (urls.length === 0) {
    return { ok: false, error: 'No URLs provided' };
  }
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(function(urlData) {
    const url = typeof urlData === 'string' ? urlData : urlData.url;
    const fullUrl = url.startsWith('http') ? url : baseUrl + url;
    
    xml += '  <url>\n';
    xml += '    <loc>' + escapeXml(fullUrl) + '</loc>\n';
    
    if (urlData.lastmod) {
      xml += '    <lastmod>' + urlData.lastmod + '</lastmod>\n';
    }
    
    if (urlData.changefreq) {
      xml += '    <changefreq>' + urlData.changefreq + '</changefreq>\n';
    }
    
    if (urlData.priority) {
      xml += '    <priority>' + urlData.priority + '</priority>\n';
    }
    
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return {
    ok: true,
    xml: xml,
    urlCount: urls.length
  };
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate sitemap from sheet
 */
function FT_generateSitemapFromSheet(params) {
  const sheetName = params.sheetName;
  const urlColumn = params.urlColumn || 1;
  const baseUrl = params.baseUrl || '';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { ok: false, error: 'Sheet not found: ' + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    const urls = [];
    
    data.forEach(function(row, index) {
      if (index === 0) return; // Skip header
      
      const url = row[urlColumn - 1];
      if (url) {
        urls.push({
          url: url,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.5
        });
      }
    });
    
    return FT_generateSitemap({ urls: urls, baseUrl: baseUrl });
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ROBOTS.TXT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch and analyze robots.txt
 */
function FT_fetchRobotsTxt(params) {
  const url = params.url;
  
  try {
    const robotsUrl = url.replace(/\/?$/, '') + '/robots.txt';
    
    const response = UrlFetchApp.fetch(robotsUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (response.getResponseCode() !== 200) {
      return { ok: false, error: 'robots.txt not found' };
    }
    
    const content = response.getContentText();
    
    // Parse robots.txt
    const lines = content.split('\n');
    const rules = [];
    let currentUserAgent = '*';
    const sitemaps = [];
    
    lines.forEach(function(line) {
      line = line.trim();
      
      if (line.toLowerCase().startsWith('user-agent:')) {
        currentUserAgent = line.split(':')[1].trim();
      } else if (line.toLowerCase().startsWith('disallow:')) {
        rules.push({
          userAgent: currentUserAgent,
          type: 'disallow',
          path: line.split(':')[1].trim()
        });
      } else if (line.toLowerCase().startsWith('allow:')) {
        rules.push({
          userAgent: currentUserAgent,
          type: 'allow',
          path: line.split(':')[1].trim()
        });
      } else if (line.toLowerCase().startsWith('sitemap:')) {
        sitemaps.push(line.split(':', 2)[1].trim());
      }
    });
    
    return {
      ok: true,
      url: robotsUrl,
      content: content,
      rules: rules,
      sitemaps: sitemaps,
      ruleCount: rules.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check if URL is blocked by robots.txt
 */
function FT_isUrlBlocked(params) {
  const siteUrl = params.siteUrl;
  const checkUrl = params.checkUrl;
  const userAgent = params.userAgent || 'Googlebot';
  
  const robotsResult = FT_fetchRobotsTxt({ url: siteUrl });
  
  if (!robotsResult.ok) {
    return { ok: true, blocked: false, reason: 'No robots.txt found' };
  }
  
  const rules = robotsResult.rules.filter(function(r) {
    return r.userAgent === '*' || r.userAgent.toLowerCase() === userAgent.toLowerCase();
  });
  
  // Check rules in order
  let blocked = false;
  let matchedRule = null;
  
  const path = checkUrl.replace(/^https?:\/\/[^\/]+/, '');
  
  rules.forEach(function(rule) {
    if (path.indexOf(rule.path) === 0) {
      blocked = rule.type === 'disallow';
      matchedRule = rule;
    }
  });
  
  return {
    ok: true,
    blocked: blocked,
    matchedRule: matchedRule,
    path: path
  };
}

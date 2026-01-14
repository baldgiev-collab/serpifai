/**
 * FT_InternalLinks.gs - Internal Link Analysis
 * SerpifAI V8 - Analyze internal link structure
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// INTERNAL LINK ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze internal links for a site
 */
function FT_analyzeInternalLinks(params) {
  const siteUrl = params.url;
  
  if (!siteUrl) {
    return { ok: false, error: 'Site URL is required' };
  }
  
  try {
    // Normalize URL
    const baseUrl = normalizeUrl(siteUrl);
    
    // Get pages to analyze (from sitemap or crawl)
    const pages = getPages(baseUrl);
    
    // Analyze link structure
    const analyzed = analyzeLinkStructure(pages, baseUrl);
    
    // Find orphan pages
    const orphans = findOrphanPages(analyzed);
    
    // Find link opportunities
    const opportunities = findLinkOpportunities(analyzed);
    
    // Count total links
    let totalLinks = 0;
    analyzed.forEach(function(page) {
      totalLinks += page.outbound || 0;
    });
    
    return {
      ok: true,
      pages: analyzed,
      orphans: orphans,
      opportunities: opportunities,
      totalLinks: totalLinks
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Normalize URL to base domain
 */
function FT_IL_normalizeUrl(url) {
  let normalized = url.toLowerCase().trim();
  
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Get pages from site (mock or real crawl)
 */
function getPages(baseUrl) {
  // For demo, return mock pages
  // In production, would crawl or use sitemap
  
  return [
    { url: baseUrl + '/', title: 'Home' },
    { url: baseUrl + '/about', title: 'About Us' },
    { url: baseUrl + '/services', title: 'Services' },
    { url: baseUrl + '/products', title: 'Products' },
    { url: baseUrl + '/blog', title: 'Blog' },
    { url: baseUrl + '/blog/seo-tips', title: 'SEO Tips for 2025' },
    { url: baseUrl + '/blog/content-marketing', title: 'Content Marketing Guide' },
    { url: baseUrl + '/blog/keyword-research', title: 'Keyword Research 101' },
    { url: baseUrl + '/contact', title: 'Contact Us' },
    { url: baseUrl + '/pricing', title: 'Pricing' }
  ];
}

/**
 * Analyze link structure for pages
 */
function analyzeLinkStructure(pages, baseUrl) {
  // Mock link structure
  const linkMap = {
    '/': ['/about', '/services', '/products', '/blog', '/contact'],
    '/about': ['/', '/contact', '/services'],
    '/services': ['/', '/products', '/pricing', '/contact'],
    '/products': ['/', '/services', '/pricing'],
    '/blog': ['/', '/blog/seo-tips', '/blog/content-marketing', '/blog/keyword-research'],
    '/blog/seo-tips': ['/blog', '/blog/keyword-research'],
    '/blog/content-marketing': ['/blog', '/blog/seo-tips'],
    '/blog/keyword-research': ['/blog', '/blog/content-marketing'],
    '/contact': ['/', '/about'],
    '/pricing': ['/products', '/services', '/contact']
  };
  
  // Count inbound links for each page
  const inboundCount = {};
  pages.forEach(function(page) {
    const path = page.url.replace(baseUrl, '') || '/';
    inboundCount[path] = 0;
  });
  
  // Count links
  Object.keys(linkMap).forEach(function(source) {
    linkMap[source].forEach(function(target) {
      if (inboundCount.hasOwnProperty(target)) {
        inboundCount[target]++;
      }
    });
  });
  
  // Build analyzed pages
  return pages.map(function(page) {
    const path = page.url.replace(baseUrl, '') || '/';
    const outLinks = linkMap[path] || [];
    
    return {
      url: page.url,
      title: page.title,
      inbound: inboundCount[path] || 0,
      outbound: outLinks.length,
      links: outLinks.map(function(target) {
        return {
          target: baseUrl + target,
          anchor: getAnchorText(target)
        };
      })
    };
  });
}

/**
 * Generate anchor text from path
 */
function getAnchorText(path) {
  if (path === '/') return 'Home';
  
  // Convert path to title case
  const name = path.split('/').pop();
  return name.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

/**
 * Find orphan pages (no inbound links)
 */
function findOrphanPages(pages) {
  return pages.filter(function(page) {
    // Home page is not orphan
    if (page.url.endsWith('/') && page.inbound === 0) return false;
    return page.inbound === 0;
  });
}

/**
 * Find link opportunities
 */
function findLinkOpportunities(pages) {
  const opportunities = [];
  
  // Find pages with low inbound links
  const lowInbound = pages.filter(function(p) { return p.inbound < 3; });
  
  // Find pages with high authority (high outbound = hub pages)
  const hubs = pages.filter(function(p) { return p.outbound >= 3; });
  
  // Suggest links from hubs to low-inbound pages
  lowInbound.forEach(function(target) {
    if (target.url.includes('blog/')) {
      // Blog posts should be linked from hub pages
      hubs.forEach(function(hub) {
        if (!hub.url.includes('blog/') && !alreadyLinked(hub, target)) {
          opportunities.push({
            title: 'Add link to blog post',
            suggestion: 'Link from high-traffic page to boost blog visibility',
            source: hub.url,
            target: target.url,
            anchor: target.title
          });
        }
      });
    }
  });
  
  // Find topically related pages that should link
  pages.forEach(function(page) {
    if (page.url.includes('services')) {
      const pricing = pages.find(function(p) { return p.url.includes('pricing'); });
      if (pricing && !alreadyLinked(page, pricing)) {
        opportunities.push({
          title: 'Cross-link services and pricing',
          suggestion: 'Users on services page likely want pricing info',
          source: page.url,
          target: pricing.url,
          anchor: 'View Pricing'
        });
      }
    }
  });
  
  return opportunities.slice(0, 10); // Limit to 10 suggestions
}

/**
 * Check if source already links to target
 */
function alreadyLinked(source, target) {
  if (!source.links) return false;
  
  return source.links.some(function(link) {
    return link.target === target.url;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════════
// LINK ANALYSIS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get internal link stats for a single page
 */
function FT_getPageLinkStats(params) {
  const url = params.url;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    
    // Extract links
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const links = [];
    let match;
    
    const domain = extractDomainFromUrl(url);
    
    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const anchor = match[2].trim();
      
      // Check if internal
      if (isInternalLink(href, domain)) {
        links.push({
          url: href,
          anchor: anchor || '[no text]',
          isInternal: true
        });
      }
    }
    
    return {
      ok: true,
      url: url,
      internalLinks: links,
      count: links.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract domain from URL
 */
function extractDomainFromUrl(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : '';
  } catch (e) {
    return '';
  }
}

/**
 * Check if link is internal
 */
function isInternalLink(href, domain) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return true;
  }
  
  if (href.includes(domain)) {
    return true;
  }
  
  return false;
}

/**
 * Analyze link distribution
 */
function FT_getLinkDistribution(params) {
  try {
    const result = FT_analyzeInternalLinks(params);
    
    if (!result.ok) return result;
    
    const pages = result.pages || [];
    
    // Calculate distribution
    const distribution = {
      noLinks: pages.filter(function(p) { return p.inbound === 0; }).length,
      oneToTwo: pages.filter(function(p) { return p.inbound >= 1 && p.inbound <= 2; }).length,
      threeToFive: pages.filter(function(p) { return p.inbound >= 3 && p.inbound <= 5; }).length,
      sixToTen: pages.filter(function(p) { return p.inbound >= 6 && p.inbound <= 10; }).length,
      moreThanTen: pages.filter(function(p) { return p.inbound > 10; }).length
    };
    
    return {
      ok: true,
      distribution: distribution,
      total: pages.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get link equity flow
 */
function FT_getLinkEquityFlow(params) {
  try {
    const result = FT_analyzeInternalLinks(params);
    
    if (!result.ok) return result;
    
    const pages = result.pages || [];
    
    // Calculate equity score based on inbound/outbound ratio
    const equityFlow = pages.map(function(page) {
      const equity = (page.inbound * 2) - (page.outbound * 0.5);
      return {
        url: page.url,
        title: page.title,
        inbound: page.inbound,
        outbound: page.outbound,
        equityScore: Math.round(equity * 10) / 10,
        status: equity > 5 ? 'receiver' : equity < -2 ? 'giver' : 'balanced'
      };
    }).sort(function(a, b) { return b.equityScore - a.equityScore; });
    
    return {
      ok: true,
      equityFlow: equityFlow
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

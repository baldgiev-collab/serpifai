/**
 * Extract internal links from HTML
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL to determine internal vs external
 * @return {object} Internal links with anchor text and analysis
 */
function FET_extractInternalLinks(html, baseUrl) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  if (!baseUrl || typeof baseUrl !== 'string') {
    return { ok: false, error: 'Base URL is required' };
  }
  
  var links = [];
  var domain = baseUrl.match(/^https?:\/\/([^\/]+)/i);
  
  if (!domain) {
    return { ok: false, error: 'Invalid base URL format' };
  }
  
  var baseDomain = domain[1].replace(/^www\./i, '');
  var linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  var match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    var href = match[1].trim();
    var anchorHtml = match[2];
    
    // Skip empty, javascript:, mailto:, tel:, etc
    if (!href || href === '#' || href.startsWith('javascript:') || 
        href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }
    
    // Extract anchor text (strip HTML tags)
    var anchor = anchorHtml.replace(/<[^>]+>/g, '').trim();
    
    // Convert relative URLs to absolute
    var absoluteUrl = href;
    if (href.startsWith('/')) {
      absoluteUrl = baseUrl.replace(/\/$/, '') + href;
    } else if (!href.startsWith('http')) {
      absoluteUrl = baseUrl.replace(/\/$/, '') + '/' + href;
    }
    
    // Check if internal link
    var isInternal = absoluteUrl.replace(/^www\./i, '').indexOf(baseDomain) !== -1;
    
    if (isInternal) {
      links.push({
        url: absoluteUrl,
        anchor: anchor,
        isEmpty: anchor.length === 0,
        isImage: anchorHtml.indexOf('<img') !== -1,
        originalHref: href
      });
    }
  }
  
  // Remove duplicates by URL
  var uniqueLinks = [];
  var seenUrls = {};
  
  links.forEach(function(link) {
    if (!seenUrls[link.url]) {
      seenUrls[link.url] = true;
      uniqueLinks.push(link);
    }
  });
  
  return {
    ok: true,
    total: links.length,
    unique: uniqueLinks.length,
    links: uniqueLinks,
    analysis: {
      emptyAnchors: links.filter(function(l) { return l.isEmpty; }).length,
      imageLinks: links.filter(function(l) { return l.isImage; }).length,
      textLinks: links.filter(function(l) { return !l.isEmpty && !l.isImage; }).length,
      averageAnchorLength: links.filter(function(l) { return !l.isEmpty; }).length > 0 ?
        Math.round(links.reduce(function(sum, l) { 
          return sum + (l.anchor.length || 0); 
        }, 0) / links.filter(function(l) { return !l.isEmpty; }).length) : 0
    }
  };
}


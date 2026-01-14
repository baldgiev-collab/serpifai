/**
 * FT_Forensic_Links.gs - Link Analysis Functions
 * SerpifAI V8 - Modular Architecture
 * 
 * Comprehensive link extraction and analysis.
 */

/**
 * Extract and analyze all links
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for relative links
 * @return {object} Links analysis
 */
function FT_extractLinksComprehensive(html, baseUrl) {
  const internal = [];
  const external = [];
  const anchors = {};
  
  try {
    const baseHost = FT_extractHost(baseUrl);
    const linkRegex = /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const attrs = match[1];
      const href = match[2];
      
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }
      
      // Extract anchor text
      const endTag = html.indexOf('</a>', match.index);
      let anchorText = '';
      if (endTag > match.index) {
        anchorText = html.substring(match.index + match[0].length, endTag)
                        .replace(/<[^>]+>/g, '')
                        .trim();
      }
      
      // Extract rel attribute
      const relMatch = attrs.match(/rel\s*=\s*["']([^"']+)["']/i);
      const rel = relMatch ? relMatch[1] : '';
      
      // Resolve URL
      const resolvedUrl = FT_resolveUrl(href, baseUrl);
      const linkHost = FT_extractHost(resolvedUrl);
      
      const linkData = {
        href: resolvedUrl,
        anchor: anchorText.substring(0, 100),
        rel: rel,
        isNofollow: rel.toLowerCase().includes('nofollow'),
        isSponsored: rel.toLowerCase().includes('sponsored'),
        isUgc: rel.toLowerCase().includes('ugc')
      };
      
      if (linkHost === baseHost) {
        internal.push(linkData);
      } else {
        external.push(linkData);
      }
      
      // Track anchor text usage
      if (anchorText) {
        anchors[anchorText] = (anchors[anchorText] || 0) + 1;
      }
    }
    
    // Analyze anchor text distribution
    const anchorStats = Object.entries(anchors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, count]) => ({ text, count }));
    
    return {
      internal: {
        count: internal.length,
        links: internal.slice(0, 50),
        nofollowCount: internal.filter(l => l.isNofollow).length
      },
      external: {
        count: external.length,
        links: external.slice(0, 50),
        nofollowCount: external.filter(l => l.isNofollow).length,
        sponsoredCount: external.filter(l => l.isSponsored).length
      },
      anchorTextStats: anchorStats,
      ratio: internal.length > 0 ? 
        (external.length / internal.length).toFixed(2) : 'N/A',
      score: FT_scoreLinks(internal.length, external.length)
    };
    
  } catch (e) {
    LOG_warn('Links extraction error', { error: e.message });
    return { internal: { count: 0 }, external: { count: 0 }, score: 0 };
  }
}

/**
 * Extract hostname from URL
 * @param {string} url - URL string
 * @return {string} Hostname
 */
function FT_extractHost(url) {
  try {
    const match = url.match(/^(?:https?:\/\/)?([^\/\?#]+)/i);
    return match ? match[1].toLowerCase() : '';
  } catch (e) {
    return '';
  }
}

/**
 * Resolve relative URL to absolute
 * @param {string} href - Link href
 * @param {string} baseUrl - Base URL
 * @return {string} Absolute URL
 */
function FT_resolveUrl(href, baseUrl) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  
  try {
    // Extract base components
    const baseMatch = baseUrl.match(/^(https?:\/\/[^\/]+)(\/.*)?$/i);
    if (!baseMatch) return href;
    
    const origin = baseMatch[1];
    const basePath = baseMatch[2] || '/';
    
    if (href.startsWith('//')) {
      return 'https:' + href;
    }
    
    if (href.startsWith('/')) {
      return origin + href;
    }
    
    // Relative path
    const lastSlash = basePath.lastIndexOf('/');
    const dir = lastSlash > 0 ? basePath.substring(0, lastSlash + 1) : '/';
    return origin + dir + href;
    
  } catch (e) {
    return href;
  }
}

/**
 * Score links structure
 * @param {number} internal - Internal link count
 * @param {number} external - External link count
 * @return {number} Score 0-100
 */
function FT_scoreLinks(internal, external) {
  let score = 0;
  
  // Internal links (50 points)
  if (internal >= 5) score += 25;
  else if (internal > 0) score += 10;
  
  if (internal >= 10 && internal <= 100) score += 25;
  else if (internal > 100) score += 15;
  
  // External links (30 points)
  if (external >= 1 && external <= 10) score += 30;
  else if (external > 10) score += 15;
  
  // Ratio (20 points) - prefer more internal than external
  const ratio = external > 0 ? internal / external : internal;
  if (ratio >= 3) score += 20;
  else if (ratio >= 1) score += 10;
  
  return Math.min(100, score);
}

/**
 * Extract and analyze images
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL
 * @return {object} Images analysis
 */
function FT_extractImagesAnalysis(html, baseUrl) {
  const images = [];
  
  try {
    const imgRegex = /<img\s+([^>]+)>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const attrs = match[1];
      
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      const altMatch = attrs.match(/alt\s*=\s*["']([^"']+)["']/i);
      const widthMatch = attrs.match(/width\s*=\s*["']?(\d+)/i);
      const heightMatch = attrs.match(/height\s*=\s*["']?(\d+)/i);
      const loadingMatch = attrs.match(/loading\s*=\s*["']([^"']+)["']/i);
      
      if (srcMatch) {
        images.push({
          src: FT_resolveUrl(srcMatch[1], baseUrl),
          alt: altMatch ? altMatch[1] : '',
          hasAlt: !!altMatch,
          width: widthMatch ? parseInt(widthMatch[1]) : null,
          height: heightMatch ? parseInt(heightMatch[1]) : null,
          hasDimensions: !!(widthMatch && heightMatch),
          lazyLoaded: loadingMatch && loadingMatch[1] === 'lazy'
        });
      }
    }
    
    // Stats
    const withAlt = images.filter(i => i.hasAlt).length;
    const withDimensions = images.filter(i => i.hasDimensions).length;
    const lazyLoaded = images.filter(i => i.lazyLoaded).length;
    
    return {
      count: images.length,
      images: images.slice(0, 30),
      stats: {
        withAlt,
        withoutAlt: images.length - withAlt,
        altPercentage: images.length > 0 ? 
          Math.round((withAlt / images.length) * 100) : 100,
        withDimensions,
        lazyLoaded
      },
      score: FT_scoreImages(images)
    };
    
  } catch (e) {
    LOG_warn('Images extraction error', { error: e.message });
    return { count: 0, images: [], stats: {}, score: 0 };
  }
}

/**
 * Score images quality
 * @param {Array} images - Images array
 * @return {number} Score 0-100
 */
function FT_scoreImages(images) {
  if (images.length === 0) return 50; // No images is neutral
  
  let score = 0;
  
  const altRatio = images.filter(i => i.hasAlt).length / images.length;
  score += altRatio * 50;
  
  const dimRatio = images.filter(i => i.hasDimensions).length / images.length;
  score += dimRatio * 30;
  
  const lazyRatio = images.filter(i => i.lazyLoaded).length / images.length;
  score += lazyRatio * 20;
  
  return Math.round(score);
}

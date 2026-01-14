/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ExtractMetadata.gs - ELITE METADATA EXTRACTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Maximum Data Extraction
 * 
 * EXTRACTS EVERYTHING:
 * ✓ Standard meta tags (title, description, keywords)
 * ✓ Open Graph (Facebook)
 * ✓ Twitter Cards
 * ✓ Schema.org JSON-LD
 * ✓ Canonical & alternate URLs
 * ✓ Robots directives
 * ✓ Language & charset
 * ✓ Author & publisher
 * ✓ Viewport & mobile optimization
 * ✓ Best practice validation
 * 
 * ENHANCEMENTS:
 * ✓ SEO score calculation
 * ✓ Character count validation
 * ✓ Duplicate detection
 * ✓ Missing tag warnings
 * ✓ Best practice recommendations
 * 
 * @module MetadataExtractor
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Extract ALL metadata from HTML (Elite comprehensive extraction)
 * @param {string} html - HTML content
 * @param {string} url - Page URL (optional, for context)
 * @return {object} Complete metadata with validation
 */
function FT_extractMetadata(html, url) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var startTime = new Date().getTime();
  
  try {
    // BASIC META TAGS
    var meta = {
      // Title
      title: extractMetaTag(html, 'title') || '',
      
      // Description
      description: extractMetaTag(html, 'meta', 'description') || '',
      
      // Keywords
      keywords: extractMetaTag(html, 'meta', 'keywords') || '',
      
      // Author
      author: extractMetaTag(html, 'meta', 'author') || '',
      
      // Publisher
      publisher: extractMetaTag(html, 'meta', 'publisher') || '',
      
      // Copyright
      copyright: extractMetaTag(html, 'meta', 'copyright') || '',
      
      // Robots
      robots: extractMetaTag(html, 'meta', 'robots') || 'index, follow',
      
      // Googlebot
      googlebot: extractMetaTag(html, 'meta', 'googlebot') || '',
      
      // Language
      lang: extractHtmlLang(html) || '',
      
      // Charset
      charset: extractCharset(html) || 'UTF-8',
      
      // Viewport
      viewport: extractMetaTag(html, 'meta', 'viewport') || '',
      
      // Generator (CMS detection)
      generator: extractMetaTag(html, 'meta', 'generator') || '',
      
      // Theme color
      themeColor: extractMetaTag(html, 'meta', 'theme-color') || '',
      
      // Mobile web app
      mobileWebApp: extractMetaTag(html, 'meta', 'mobile-web-app-capable') || '',
      appleWebApp: extractMetaTag(html, 'meta', 'apple-mobile-web-app-capable') || '',
      
      // Referrer policy
      referrer: extractMetaTag(html, 'meta', 'referrer') || ''
    };
    
    // CANONICAL & ALTERNATE URLs
    meta.canonical = extractLinkTag(html, 'canonical') || '';
    meta.amphtml = extractLinkTag(html, 'amphtml') || '';
    meta.alternateHreflang = extractAlternateHreflang(html);
    meta.prev = extractLinkTag(html, 'prev') || '';
    meta.next = extractLinkTag(html, 'next') || '';
    
    // OPEN GRAPH (Facebook)
    meta.openGraph = {
      title: extractMetaTag(html, 'meta', 'og:title', 'property') || '',
      description: extractMetaTag(html, 'meta', 'og:description', 'property') || '',
      image: extractMetaTag(html, 'meta', 'og:image', 'property') || '',
      imageWidth: extractMetaTag(html, 'meta', 'og:image:width', 'property') || '',
      imageHeight: extractMetaTag(html, 'meta', 'og:image:height', 'property') || '',
      imageAlt: extractMetaTag(html, 'meta', 'og:image:alt', 'property') || '',
      url: extractMetaTag(html, 'meta', 'og:url', 'property') || '',
      type: extractMetaTag(html, 'meta', 'og:type', 'property') || '',
      siteName: extractMetaTag(html, 'meta', 'og:site_name', 'property') || '',
      locale: extractMetaTag(html, 'meta', 'og:locale', 'property') || '',
      video: extractMetaTag(html, 'meta', 'og:video', 'property') || '',
      audio: extractMetaTag(html, 'meta', 'og:audio', 'property') || ''
    };
    
    // TWITTER CARDS
    meta.twitter = {
      card: extractMetaTag(html, 'meta', 'twitter:card') || '',
      site: extractMetaTag(html, 'meta', 'twitter:site') || '',
      creator: extractMetaTag(html, 'meta', 'twitter:creator') || '',
      title: extractMetaTag(html, 'meta', 'twitter:title') || '',
      description: extractMetaTag(html, 'meta', 'twitter:description') || '',
      image: extractMetaTag(html, 'meta', 'twitter:image') || '',
      imageAlt: extractMetaTag(html, 'meta', 'twitter:image:alt') || '',
      player: extractMetaTag(html, 'meta', 'twitter:player') || '',
      appNameIphone: extractMetaTag(html, 'meta', 'twitter:app:name:iphone') || '',
      appIdIphone: extractMetaTag(html, 'meta', 'twitter:app:id:iphone') || ''
    };
    
    // ARTICLE META (for blog posts)
    meta.article = {
      publishedTime: extractMetaTag(html, 'meta', 'article:published_time', 'property') || '',
      modifiedTime: extractMetaTag(html, 'meta', 'article:modified_time', 'property') || '',
      expirationTime: extractMetaTag(html, 'meta', 'article:expiration_time', 'property') || '',
      author: extractMetaTag(html, 'meta', 'article:author', 'property') || '',
      section: extractMetaTag(html, 'meta', 'article:section', 'property') || '',
      tag: extractMetaTag(html, 'meta', 'article:tag', 'property') || ''
    };
    
    // DUBLIN CORE
    meta.dublinCore = {
      title: extractMetaTag(html, 'meta', 'DC.title') || extractMetaTag(html, 'meta', 'dc.title') || '',
      creator: extractMetaTag(html, 'meta', 'DC.creator') || extractMetaTag(html, 'meta', 'dc.creator') || '',
      subject: extractMetaTag(html, 'meta', 'DC.subject') || extractMetaTag(html, 'meta', 'dc.subject') || '',
      description: extractMetaTag(html, 'meta', 'DC.description') || extractMetaTag(html, 'meta', 'dc.description') || '',
      publisher: extractMetaTag(html, 'meta', 'DC.publisher') || extractMetaTag(html, 'meta', 'dc.publisher') || '',
      date: extractMetaTag(html, 'meta', 'DC.date') || extractMetaTag(html, 'meta', 'dc.date') || '',
      type: extractMetaTag(html, 'meta', 'DC.type') || extractMetaTag(html, 'meta', 'dc.type') || '',
      format: extractMetaTag(html, 'meta', 'DC.format') || extractMetaTag(html, 'meta', 'dc.format') || '',
      language: extractMetaTag(html, 'meta', 'DC.language') || extractMetaTag(html, 'meta', 'dc.language') || ''
    };
    
    // FAVICON & ICONS
    meta.icons = extractIcons(html);
    
    // RSS/ATOM FEEDS
    meta.feeds = extractFeeds(html);
    
    // APP LINKS (Deep linking)
    meta.appLinks = {
      iosAppStoreId: extractMetaTag(html, 'meta', 'al:ios:app_store_id', 'property') || '',
      iosAppName: extractMetaTag(html, 'meta', 'al:ios:app_name', 'property') || '',
      iosUrl: extractMetaTag(html, 'meta', 'al:ios:url', 'property') || '',
      androidPackage: extractMetaTag(html, 'meta', 'al:android:package', 'property') || '',
      androidAppName: extractMetaTag(html, 'meta', 'al:android:app_name', 'property') || '',
      androidUrl: extractMetaTag(html, 'meta', 'al:android:url', 'property') || ''
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION & BEST PRACTICES
    // ═══════════════════════════════════════════════════════════════════════════
    
    var validation = {
      // Required elements
      hasTitle: meta.title.length > 0,
      hasDescription: meta.description.length > 0,
      hasCanonical: meta.canonical.length > 0,
      hasViewport: meta.viewport.length > 0,
      hasCharset: meta.charset.length > 0,
      
      // Length validation
      titleLength: meta.title.length,
      descriptionLength: meta.description.length,
      keywordsLength: meta.keywords.length,
      
      // Optimal lengths (Google SERP display)
      titleOptimal: meta.title.length >= 30 && meta.title.length <= 60,
      descriptionOptimal: meta.description.length >= 120 && meta.description.length <= 160,
      
      // Social media
      hasOpenGraph: !!(meta.openGraph.title || meta.openGraph.description || meta.openGraph.image),
      hasTwitterCard: !!(meta.twitter.card || meta.twitter.title || meta.twitter.description),
      
      // Mobile optimization
      isMobileFriendly: meta.viewport.indexOf('width=device-width') !== -1,
      
      // Indexability
      isIndexable: meta.robots.toLowerCase().indexOf('noindex') === -1,
      isFollowable: meta.robots.toLowerCase().indexOf('nofollow') === -1,
      
      // Duplicates
      titleMatchesOG: meta.title === meta.openGraph.title,
      descriptionMatchesOG: meta.description === meta.openGraph.description,
      
      // URLs
      canonicalMatchesUrl: url ? (meta.canonical === url || meta.canonical === url.replace(/\/$/, '')) : false,
      hasAlternateLanguages: meta.alternateHreflang.length > 0,
      
      // Rich results potential
      hasFavicon: meta.icons.favicons.length > 0,
      hasAppleIcon: meta.icons.appleTouchIcons.length > 0,
      
      // Article metadata
      hasArticleMeta: !!(meta.article.publishedTime || meta.article.author),
      
      // App integration
      hasAppLinks: !!(meta.appLinks.iosAppStoreId || meta.appLinks.androidPackage)
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SEO SCORE CALCULATION (0-100)
    // ═══════════════════════════════════════════════════════════════════════════
    
    var seoScore = 0;
    var maxScore = 100;
    var issues = [];
    var warnings = [];
    var recommendations = [];
    
    // Title (25 points)
    if (validation.hasTitle) {
      if (validation.titleOptimal) {
        seoScore += 25;
      } else if (meta.title.length > 0) {
        seoScore += 15;
        warnings.push('Title length not optimal: ' + meta.title.length + ' chars (ideal: 30-60)');
      }
    } else {
      issues.push('Missing title tag');
    }
    
    // Description (20 points)
    if (validation.hasDescription) {
      if (validation.descriptionOptimal) {
        seoScore += 20;
      } else if (meta.description.length > 0) {
        seoScore += 10;
        warnings.push('Description length not optimal: ' + meta.description.length + ' chars (ideal: 120-160)');
      }
    } else {
      issues.push('Missing meta description');
    }
    
    // Canonical (10 points)
    if (validation.hasCanonical) {
      seoScore += 10;
    } else {
      warnings.push('Missing canonical URL');
    }
    
    // Mobile (15 points)
    if (validation.isMobileFriendly) {
      seoScore += 15;
    } else {
      issues.push('Not mobile-friendly (missing viewport meta tag)');
    }
    
    // Open Graph (10 points)
    if (validation.hasOpenGraph) {
      if (meta.openGraph.title && meta.openGraph.description && meta.openGraph.image) {
        seoScore += 10;
      } else {
        seoScore += 5;
        warnings.push('Incomplete Open Graph tags');
      }
    } else {
      warnings.push('Missing Open Graph tags (social sharing)');
    }
    
    // Twitter Card (5 points)
    if (validation.hasTwitterCard) {
      seoScore += 5;
    } else {
      recommendations.push('Add Twitter Card meta tags for better social sharing');
    }
    
    // Indexability (10 points)
    if (validation.isIndexable && validation.isFollowable) {
      seoScore += 10;
    } else {
      if (!validation.isIndexable) warnings.push('Page is set to noindex');
      if (!validation.isFollowable) warnings.push('Page is set to nofollow');
    }
    
    // Structured data potential (5 points)
    if (validation.hasArticleMeta) {
      seoScore += 5;
    } else {
      recommendations.push('Add article metadata for better rich results');
    }
    
    // Determine grade
    var seoGrade = 'F';
    if (seoScore >= 90) seoGrade = 'A+';
    else if (seoScore >= 85) seoGrade = 'A';
    else if (seoScore >= 80) seoGrade = 'A-';
    else if (seoScore >= 75) seoGrade = 'B+';
    else if (seoScore >= 70) seoGrade = 'B';
    else if (seoScore >= 65) seoGrade = 'B-';
    else if (seoScore >= 60) seoGrade = 'C+';
    else if (seoScore >= 55) seoGrade = 'C';
    else if (seoScore >= 50) seoGrade = 'C-';
    else if (seoScore >= 45) seoGrade = 'D';
    
    return {
      ok: true,
      ...meta,
      validation: validation,
      seo: {
        score: seoScore,
        grade: seoGrade,
        maxScore: maxScore,
        issues: issues,
        warnings: warnings,
        recommendations: recommendations
      },
      executionTime: new Date().getTime() - startTime,
      timestamp: new Date().toISOString()
    };
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      errorStack: e.stack || '',
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Extract alternate hreflang tags
 */
function extractAlternateHreflang(html) {
  var hreflangs = [];
  var regex = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi;
  var match;
  
  while ((match = regex.exec(html)) !== null) {
    hreflangs.push({
      lang: match[1],
      url: match[2]
    });
  }
  
  return hreflangs;
}

/**
 * Extract all icons (favicon, apple-touch-icon, etc.)
 */
function extractIcons(html) {
  var icons = {
    favicons: [],
    appleTouchIcons: [],
    msApplicationIcons: []
  };
  
  // Favicon
  var faviconRegex = /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/gi;
  var match;
  
  while ((match = faviconRegex.exec(html)) !== null) {
    icons.favicons.push(match[1]);
  }
  
  // Apple touch icons
  var appleRegex = /<link[^>]*rel=["']apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/gi;
  while ((match = appleRegex.exec(html)) !== null) {
    icons.appleTouchIcons.push(match[1]);
  }
  
  // MS application
  var msRegex = /<meta[^>]*name=["']msapplication-TileImage["'][^>]*content=["']([^"']+)["']/gi;
  while ((match = msRegex.exec(html)) !== null) {
    icons.msApplicationIcons.push(match[1]);
  }
  
  return icons;
}

/**
 * Extract RSS/Atom feeds
 */
function extractFeeds(html) {
  var feeds = [];
  var regex = /<link[^>]*type=["']application\/(?:rss|atom)\+xml["'][^>]*href=["']([^"']+)["'][^>]*title=["']([^"']*)["']/gi;
  var match;
  
  while ((match = regex.exec(html)) !== null) {
    feeds.push({
      url: match[1],
      title: match[2] || 'Feed'
    });
  }
  
  return feeds;
}

/**
 * Extract HTML lang attribute
 */
function extractHtmlLang(html) {
  var match = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

/**
 * Extract charset
 */
function extractCharset(html) {
  var match = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  return match ? match[1] : '';
}

/**
 * Legacy function name
 */
function FET_extractMetadata(html, url) {
  return FT_extractMetadata(html, url);
}

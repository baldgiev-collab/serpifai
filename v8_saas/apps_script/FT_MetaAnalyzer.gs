/**
 * FT_MetaAnalyzer.gs - Meta Tags Analysis
 * SerpifAI V8 - Analyze and optimize meta tags
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// META TAG ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze meta tags for a URL
 */
function FT_analyzeMetaTags(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  try {
    // Fetch the page
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    
    // Extract meta tags
    const title = extractTitle(html);
    const description = extractMetaContent(html, 'description');
    const keywords = extractMetaContent(html, 'keywords');
    const robots = extractMetaContent(html, 'robots');
    const canonical = extractCanonical(html);
    const viewport = extractMetaContent(html, 'viewport');
    
    // Open Graph
    const ogTitle = extractOGContent(html, 'og:title');
    const ogDescription = extractOGContent(html, 'og:description');
    const ogImage = extractOGContent(html, 'og:image');
    const ogType = extractOGContent(html, 'og:type');
    
    // Twitter Cards
    const twitterCard = extractMetaContent(html, 'twitter:card');
    const twitterTitle = extractMetaContent(html, 'twitter:title');
    
    // Build tags analysis
    const tags = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Title analysis
    const titleAnalysis = analyzeTitle(title);
    tags.push(titleAnalysis);
    totalScore += titleAnalysis.points;
    maxScore += 20;
    
    // Description analysis
    const descAnalysis = analyzeDescription(description);
    tags.push(descAnalysis);
    totalScore += descAnalysis.points;
    maxScore += 20;
    
    // Canonical
    tags.push({
      name: 'Canonical URL',
      content: canonical || null,
      status: canonical ? 'good' : 'warning',
      statusText: canonical ? 'Present' : 'Missing',
      info: 'Helps prevent duplicate content issues',
      points: canonical ? 10 : 0
    });
    totalScore += canonical ? 10 : 0;
    maxScore += 10;
    
    // Viewport
    tags.push({
      name: 'Viewport',
      content: viewport || null,
      status: viewport ? 'good' : 'error',
      statusText: viewport ? 'Present' : 'Missing',
      info: 'Required for mobile-friendly pages',
      points: viewport ? 10 : 0
    });
    totalScore += viewport ? 10 : 0;
    maxScore += 10;
    
    // Robots
    tags.push({
      name: 'Robots',
      content: robots || 'Not specified (defaults to index, follow)',
      status: 'good',
      statusText: 'OK',
      info: 'Controls search engine crawling behavior',
      points: 5
    });
    totalScore += 5;
    maxScore += 5;
    
    // OG Tags
    const ogAnalysis = analyzeOGTags(ogTitle, ogDescription, ogImage);
    tags.push(ogAnalysis);
    totalScore += ogAnalysis.points;
    maxScore += 15;
    
    // Twitter Cards
    tags.push({
      name: 'Twitter Card',
      content: twitterCard || null,
      status: twitterCard ? 'good' : 'warning',
      statusText: twitterCard ? 'Present' : 'Missing',
      info: 'Optimizes appearance when shared on Twitter',
      points: twitterCard ? 10 : 0
    });
    totalScore += twitterCard ? 10 : 0;
    maxScore += 10;
    
    // Calculate overall score
    const score = Math.round((totalScore / maxScore) * 100);
    
    // Generate recommendations
    const recommendations = generateMetaRecommendations(title, description, canonical, ogImage, viewport);
    
    return {
      ok: true,
      url: url,
      score: score,
      title: title,
      description: description,
      ogTitle: ogTitle,
      ogDescription: ogDescription,
      ogImage: ogImage,
      tags: tags,
      recommendations: recommendations
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract title tag
 */
function FT_Meta_extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

/**
 * Extract meta content by name
 */
function extractMetaContent(html, name) {
  const pattern = new RegExp('<meta[^>]+name=["\']' + name + '["\'][^>]+content=["\']([^"\']+)["\']', 'i');
  const pattern2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']' + name + '["\']', 'i');
  
  let match = html.match(pattern);
  if (!match) match = html.match(pattern2);
  
  return match ? match[1].trim() : null;
}

/**
 * Extract OG content
 */
function extractOGContent(html, property) {
  const pattern = new RegExp('<meta[^>]+property=["\']' + property + '["\'][^>]+content=["\']([^"\']+)["\']', 'i');
  const pattern2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']' + property + '["\']', 'i');
  
  let match = html.match(pattern);
  if (!match) match = html.match(pattern2);
  
  return match ? match[1].trim() : null;
}

/**
 * Extract canonical URL
 */
function FT_Meta_extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']|<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']/i);
  return match ? (match[1] || match[2]).trim() : null;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ANALYSIS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze title tag
 */
function analyzeTitle(title) {
  if (!title) {
    return {
      name: 'Title Tag',
      content: null,
      status: 'error',
      statusText: 'Missing',
      info: 'Title tag is critical for SEO',
      length: 0,
      maxLength: 60,
      points: 0
    };
  }
  
  const len = title.length;
  let status = 'good';
  let statusText = 'Optimal';
  let points = 20;
  
  if (len < 30) {
    status = 'warning';
    statusText = 'Too short';
    points = 10;
  } else if (len > 60) {
    status = 'warning';
    statusText = 'Too long';
    points = 12;
  }
  
  return {
    name: 'Title Tag',
    content: title,
    status: status,
    statusText: statusText,
    info: 'Should be 30-60 characters',
    length: len,
    maxLength: 60,
    points: points
  };
}

/**
 * Analyze description tag
 */
function analyzeDescription(desc) {
  if (!desc) {
    return {
      name: 'Meta Description',
      content: null,
      status: 'error',
      statusText: 'Missing',
      info: 'Important for click-through rate',
      length: 0,
      maxLength: 160,
      points: 0
    };
  }
  
  const len = desc.length;
  let status = 'good';
  let statusText = 'Optimal';
  let points = 20;
  
  if (len < 70) {
    status = 'warning';
    statusText = 'Too short';
    points = 10;
  } else if (len > 160) {
    status = 'warning';
    statusText = 'Too long';
    points = 12;
  }
  
  return {
    name: 'Meta Description',
    content: desc,
    status: status,
    statusText: statusText,
    info: 'Should be 70-160 characters',
    length: len,
    maxLength: 160,
    points: points
  };
}

/**
 * Analyze Open Graph tags
 */
function analyzeOGTags(title, desc, image) {
  let status = 'good';
  let statusText = 'Complete';
  let points = 15;
  
  const missing = [];
  if (!title) missing.push('og:title');
  if (!desc) missing.push('og:description');
  if (!image) missing.push('og:image');
  
  if (missing.length === 3) {
    status = 'error';
    statusText = 'Missing';
    points = 0;
  } else if (missing.length > 0) {
    status = 'warning';
    statusText = 'Incomplete';
    points = 8;
  }
  
  return {
    name: 'Open Graph Tags',
    content: missing.length === 0 ? 'All present' : 'Missing: ' + missing.join(', '),
    status: status,
    statusText: statusText,
    info: 'Required for rich social media previews',
    points: points
  };
}

/**
 * Generate recommendations
 */
function generateMetaRecommendations(title, description, canonical, ogImage, viewport) {
  const recs = [];
  
  if (!title) {
    recs.push({
      icon: '🚨',
      title: 'Add a Title Tag',
      description: 'Every page needs a unique, descriptive title tag for SEO.'
    });
  } else if (title.length < 30) {
    recs.push({
      icon: '📝',
      title: 'Expand Your Title',
      description: 'Your title is too short. Aim for 30-60 characters to maximize SEO impact.'
    });
  }
  
  if (!description) {
    recs.push({
      icon: '🚨',
      title: 'Add Meta Description',
      description: 'A compelling meta description improves click-through rates from search results.'
    });
  }
  
  if (!canonical) {
    recs.push({
      icon: '🔗',
      title: 'Add Canonical URL',
      description: 'Prevent duplicate content issues by specifying the canonical version of this page.'
    });
  }
  
  if (!ogImage) {
    recs.push({
      icon: '🖼️',
      title: 'Add Open Graph Image',
      description: 'Pages with images get 2x more engagement when shared on social media.'
    });
  }
  
  if (!viewport) {
    recs.push({
      icon: '📱',
      title: 'Add Viewport Meta Tag',
      description: 'Essential for mobile-friendly pages. Add: <meta name="viewport" content="width=device-width, initial-scale=1">'
    });
  }
  
  return recs;
}

/**
 * Generate optimized meta tags
 */
function FT_generateMetaTags(params) {
  const title = params.title || '';
  const description = params.description || '';
  const url = params.url || '';
  const image = params.image || '';
  const siteName = params.siteName || '';
  
  const metaTags = [];
  
  // Basic meta
  metaTags.push('<title>' + title + '</title>');
  metaTags.push('<meta name="description" content="' + description + '">');
  metaTags.push('<link rel="canonical" href="' + url + '">');
  metaTags.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  
  // Open Graph
  metaTags.push('<meta property="og:type" content="website">');
  metaTags.push('<meta property="og:title" content="' + title + '">');
  metaTags.push('<meta property="og:description" content="' + description + '">');
  metaTags.push('<meta property="og:url" content="' + url + '">');
  if (image) metaTags.push('<meta property="og:image" content="' + image + '">');
  if (siteName) metaTags.push('<meta property="og:site_name" content="' + siteName + '">');
  
  // Twitter
  metaTags.push('<meta name="twitter:card" content="summary_large_image">');
  metaTags.push('<meta name="twitter:title" content="' + title + '">');
  metaTags.push('<meta name="twitter:description" content="' + description + '">');
  if (image) metaTags.push('<meta name="twitter:image" content="' + image + '">');
  
  return {
    ok: true,
    tags: metaTags,
    html: metaTags.join('\n')
  };
}

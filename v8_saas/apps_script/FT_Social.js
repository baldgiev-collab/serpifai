/**
 * FT_Social.gs - Social Media SEO Analysis
 * SerpifAI V8 - Social sharing and Open Graph analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SOCIAL SEO ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze social meta tags
 */
function FT_analyzeSocialMeta(params) {
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
    
    // Extract Open Graph tags
    const og = extractOpenGraph(html);
    
    // Extract Twitter Card tags
    const twitter = extractTwitterCard(html);
    
    // Extract standard meta
    const standard = extractStandardMeta(html);
    
    // Score social optimization
    const score = calculateSocialScore(og, twitter, standard);
    
    return {
      ok: true,
      url: url,
      score: score,
      openGraph: og,
      twitter: twitter,
      standard: standard,
      recommendations: getSocialRecommendations(og, twitter, standard)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract Open Graph tags
 */
function extractOpenGraph(html) {
  const og = {};
  
  const patterns = {
    title: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    description: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    image: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    url: /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i,
    type: /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i,
    siteName: /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    imageWidth: /<meta[^>]+property=["']og:image:width["'][^>]+content=["']([^"']+)["']/i,
    imageHeight: /<meta[^>]+property=["']og:image:height["'][^>]+content=["']([^"']+)["']/i,
    locale: /<meta[^>]+property=["']og:locale["'][^>]+content=["']([^"']+)["']/i
  };
  
  Object.keys(patterns).forEach(function(key) {
    const match = html.match(patterns[key]);
    if (match) og[key] = match[1];
  });
  
  // Also check alternate format (content before property)
  Object.keys(patterns).forEach(function(key) {
    if (!og[key]) {
      const propName = key.replace(/([A-Z])/g, ':$1').toLowerCase();
      const altPattern = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:' + propName + '["\']', 'i');
      const match = html.match(altPattern);
      if (match) og[key] = match[1];
    }
  });
  
  return og;
}

/**
 * Extract Twitter Card tags
 */
function extractTwitterCard(html) {
  const twitter = {};
  
  const patterns = {
    card: /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i,
    title: /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    description: /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    image: /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    site: /<meta[^>]+name=["']twitter:site["'][^>]+content=["']([^"']+)["']/i,
    creator: /<meta[^>]+name=["']twitter:creator["'][^>]+content=["']([^"']+)["']/i
  };
  
  Object.keys(patterns).forEach(function(key) {
    const match = html.match(patterns[key]);
    if (match) twitter[key] = match[1];
  });
  
  return twitter;
}

/**
 * Extract standard meta tags
 */
function extractStandardMeta(html) {
  return {
    title: (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '',
    description: (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1] || '',
    author: (html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i) || [])[1] || ''
  };
}

/**
 * Calculate social optimization score
 */
function calculateSocialScore(og, twitter, standard) {
  let score = 0;
  let maxScore = 100;
  
  // Open Graph (50 points)
  if (og.title) score += 15;
  if (og.description) score += 15;
  if (og.image) score += 15;
  if (og.url) score += 5;
  
  // Twitter Card (30 points)
  if (twitter.card) score += 10;
  if (twitter.title || og.title) score += 5;
  if (twitter.description || og.description) score += 5;
  if (twitter.image || og.image) score += 10;
  
  // Standard meta (20 points)
  if (standard.title) score += 10;
  if (standard.description) score += 10;
  
  return Math.min(100, Math.round(score));
}

/**
 * Get social recommendations
 */
function getSocialRecommendations(og, twitter, standard) {
  const recommendations = [];
  
  // Open Graph recommendations
  if (!og.title) {
    recommendations.push({
      priority: 'high',
      platform: 'og',
      issue: 'Missing og:title',
      fix: 'Add <meta property="og:title" content="Your Title">'
    });
  } else if (og.title.length > 60) {
    recommendations.push({
      priority: 'medium',
      platform: 'og',
      issue: 'og:title too long (' + og.title.length + ' chars)',
      fix: 'Keep og:title under 60 characters for best display'
    });
  }
  
  if (!og.description) {
    recommendations.push({
      priority: 'high',
      platform: 'og',
      issue: 'Missing og:description',
      fix: 'Add <meta property="og:description" content="Your Description">'
    });
  } else if (og.description.length > 200) {
    recommendations.push({
      priority: 'low',
      platform: 'og',
      issue: 'og:description may be truncated',
      fix: 'Consider keeping og:description under 200 characters'
    });
  }
  
  if (!og.image) {
    recommendations.push({
      priority: 'high',
      platform: 'og',
      issue: 'Missing og:image',
      fix: 'Add <meta property="og:image" content="https://example.com/image.jpg">'
    });
  }
  
  if (!og.url) {
    recommendations.push({
      priority: 'medium',
      platform: 'og',
      issue: 'Missing og:url',
      fix: 'Add <meta property="og:url" content="https://example.com/page">'
    });
  }
  
  // Twitter recommendations
  if (!twitter.card) {
    recommendations.push({
      priority: 'high',
      platform: 'twitter',
      issue: 'Missing twitter:card',
      fix: 'Add <meta name="twitter:card" content="summary_large_image">'
    });
  }
  
  if (!twitter.image && !og.image) {
    recommendations.push({
      priority: 'medium',
      platform: 'twitter',
      issue: 'No Twitter-specific image',
      fix: 'Add twitter:image for optimal Twitter display'
    });
  }
  
  return recommendations;
}

/**
 * Generate social preview data
 */
function FT_getSocialPreview(params) {
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
    const og = extractOpenGraph(html);
    const twitter = extractTwitterCard(html);
    const standard = extractStandardMeta(html);
    
    // Create preview objects
    const facebook = {
      title: og.title || standard.title || '',
      description: og.description || standard.description || '',
      image: og.image || '',
      url: og.url || url,
      siteName: og.siteName || extractDomain(url)
    };
    
    const twitterPreview = {
      card: twitter.card || 'summary',
      title: twitter.title || og.title || standard.title || '',
      description: twitter.description || og.description || standard.description || '',
      image: twitter.image || og.image || '',
      site: twitter.site || ''
    };
    
    const linkedin = {
      title: og.title || standard.title || '',
      description: og.description || standard.description || '',
      image: og.image || ''
    };
    
    return {
      ok: true,
      url: url,
      facebook: facebook,
      twitter: twitterPreview,
      linkedin: linkedin
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract domain from URL
 */
function FT_Social_extractDomain(url) {
  const match = url.match(/^https?:\/\/([^\/]+)/i);
  return match ? match[1].replace(/^www\./, '') : '';
}

/**
 * Generate social meta tags
 */
function FT_generateSocialTags(params) {
  const title = params.title;
  const description = params.description;
  const imageUrl = params.imageUrl;
  const pageUrl = params.pageUrl;
  const siteName = params.siteName || '';
  const twitterHandle = params.twitterHandle || '';
  
  if (!title || !description || !imageUrl || !pageUrl) {
    return { ok: false, error: 'title, description, imageUrl, and pageUrl required' };
  }
  
  const tags = [];
  
  // Open Graph tags
  tags.push('<!-- Open Graph / Facebook -->');
  tags.push('<meta property="og:type" content="article">');
  tags.push('<meta property="og:url" content="' + escapeHtml(pageUrl) + '">');
  tags.push('<meta property="og:title" content="' + escapeHtml(title) + '">');
  tags.push('<meta property="og:description" content="' + escapeHtml(description) + '">');
  tags.push('<meta property="og:image" content="' + escapeHtml(imageUrl) + '">');
  
  if (siteName) {
    tags.push('<meta property="og:site_name" content="' + escapeHtml(siteName) + '">');
  }
  
  tags.push('');
  tags.push('<!-- Twitter -->');
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  tags.push('<meta name="twitter:url" content="' + escapeHtml(pageUrl) + '">');
  tags.push('<meta name="twitter:title" content="' + escapeHtml(title) + '">');
  tags.push('<meta name="twitter:description" content="' + escapeHtml(description) + '">');
  tags.push('<meta name="twitter:image" content="' + escapeHtml(imageUrl) + '">');
  
  if (twitterHandle) {
    tags.push('<meta name="twitter:site" content="' + escapeHtml(twitterHandle) + '">');
  }
  
  return {
    ok: true,
    tags: tags.join('\n'),
    tagArray: tags.filter(function(t) { return t && !t.startsWith('<!--'); })
  };
}

/**
 * Escape HTML special characters
 */
function FT_Social_escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate social image
 */
function FT_validateSocialImage(params) {
  const imageUrl = params.imageUrl;
  
  if (!imageUrl) {
    return { ok: false, error: 'Image URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(imageUrl, {
      muteHttpExceptions: true
    });
    
    const contentType = response.getHeaders()['Content-Type'] || '';
    const size = response.getContent().length;
    
    const isImage = contentType.indexOf('image/') >= 0;
    const isValidSize = size < 8 * 1024 * 1024; // 8MB limit
    
    const issues = [];
    if (!isImage) issues.push('URL does not point to an image');
    if (!isValidSize) issues.push('Image exceeds 8MB limit');
    if (!imageUrl.startsWith('https://')) issues.push('Use HTTPS for social images');
    
    return {
      ok: true,
      imageUrl: imageUrl,
      contentType: contentType,
      sizeBytes: size,
      sizeKB: Math.round(size / 1024),
      isValid: isImage && isValidSize,
      issues: issues,
      recommendations: {
        facebook: 'Recommended: 1200x630 pixels',
        twitter: 'Recommended: 1200x600 pixels for summary_large_image',
        linkedin: 'Recommended: 1200x627 pixels'
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

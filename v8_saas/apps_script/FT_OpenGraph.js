/**
 * FT_OpenGraph.gs - Open Graph and Social Meta Analysis
 * SerpifAI V8 - Social media metadata analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// OPEN GRAPH & SOCIAL META ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze Open Graph tags
 */
function FT_analyzeOpenGraph(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const html = response.getContentText();
    
    // Extract OG tags
    const ogTags = extractOGTags(html);
    
    // Extract Twitter cards
    const twitterTags = extractTwitterTags(html);
    
    // Extract basic meta
    const basicMeta = extractBasicMeta(html);
    
    // Validate and generate issues
    const validation = validateSocialMeta(ogTags, twitterTags, basicMeta);
    
    return {
      ok: true,
      url: url,
      openGraph: ogTags,
      twitter: twitterTags,
      basic: basicMeta,
      score: validation.score,
      issues: validation.issues,
      recommendations: validation.recommendations
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract Open Graph tags
 */
function extractOGTags(html) {
  const tags = {};
  const ogRegex = /<meta[^>]*property\s*=\s*["']og:([^"']+)["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/gi;
  const ogRegex2 = /<meta[^>]*content\s*=\s*["']([^"']*)["'][^>]*property\s*=\s*["']og:([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = ogRegex.exec(html)) !== null) {
    tags[match[1]] = match[2];
  }
  while ((match = ogRegex2.exec(html)) !== null) {
    tags[match[2]] = match[1];
  }
  
  return tags;
}

/**
 * Extract Twitter card tags
 */
function extractTwitterTags(html) {
  const tags = {};
  const twRegex = /<meta[^>]*name\s*=\s*["']twitter:([^"']+)["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/gi;
  const twRegex2 = /<meta[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']twitter:([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = twRegex.exec(html)) !== null) {
    tags[match[1]] = match[2];
  }
  while ((match = twRegex2.exec(html)) !== null) {
    tags[match[2]] = match[1];
  }
  
  return tags;
}

/**
 * Extract basic meta tags
 */
function extractBasicMeta(html) {
  const meta = {};
  
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : '';
  
  // Description
  const descMatch = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i);
  if (!descMatch) {
    const descMatch2 = html.match(/<meta[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["']/i);
    meta.description = descMatch2 ? descMatch2[1] : '';
  } else {
    meta.description = descMatch[1];
  }
  
  return meta;
}

/**
 * Validate social meta tags
 */
function validateSocialMeta(og, twitter, basic) {
  const issues = [];
  const recommendations = [];
  let score = 100;
  
  // Required OG tags
  const requiredOG = ['title', 'description', 'image', 'url'];
  requiredOG.forEach(function(tag) {
    if (!og[tag]) {
      issues.push({
        type: 'warning',
        platform: 'Open Graph',
        message: 'Missing og:' + tag
      });
      score -= 10;
    }
  });
  
  // OG image validation
  if (og.image) {
    if (!og['image:width'] || !og['image:height']) {
      issues.push({
        type: 'info',
        platform: 'Open Graph',
        message: 'Image dimensions not specified'
      });
      recommendations.push({
        priority: 'low',
        title: 'Add OG image dimensions',
        fix: 'Add og:image:width and og:image:height for better previews'
      });
    }
    
    if (!og['image:alt']) {
      issues.push({
        type: 'info',
        platform: 'Open Graph',
        message: 'Image alt text not specified'
      });
    }
  } else {
    recommendations.push({
      priority: 'high',
      title: 'Add Open Graph image',
      fix: 'Add og:image meta tag with 1200x630 image for social shares'
    });
  }
  
  // OG type
  if (!og.type) {
    issues.push({
      type: 'info',
      platform: 'Open Graph',
      message: 'Missing og:type (defaults to website)'
    });
  }
  
  // Twitter card
  if (!twitter.card) {
    issues.push({
      type: 'warning',
      platform: 'Twitter',
      message: 'Missing twitter:card'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Add Twitter Card',
      fix: 'Add twitter:card meta tag (summary_large_image recommended)'
    });
    score -= 10;
  }
  
  // Twitter-specific tags
  if (!twitter.site) {
    issues.push({
      type: 'info',
      platform: 'Twitter',
      message: 'Missing twitter:site (your Twitter handle)'
    });
  }
  
  // Check title length
  const title = og.title || basic.title;
  if (title) {
    if (title.length > 70) {
      issues.push({
        type: 'warning',
        platform: 'General',
        message: 'Title too long (' + title.length + ' chars). May be truncated.'
      });
      score -= 5;
    }
  }
  
  // Check description length
  const desc = og.description || basic.description;
  if (desc) {
    if (desc.length > 200) {
      issues.push({
        type: 'info',
        platform: 'General',
        message: 'Description may be truncated on some platforms'
      });
    }
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return { score: score, issues: issues, recommendations: recommendations };
}

/**
 * Generate OG tags
 */
function FT_generateOGTags(params) {
  const title = params.title || '';
  const description = params.description || '';
  const url = params.url || '';
  const image = params.image || '';
  const type = params.type || 'website';
  const siteName = params.siteName || '';
  
  const tags = [];
  
  // Open Graph
  if (title) tags.push('<meta property="og:title" content="' + escapeHtml(title) + '">');
  if (description) tags.push('<meta property="og:description" content="' + escapeHtml(description) + '">');
  if (url) tags.push('<meta property="og:url" content="' + escapeHtml(url) + '">');
  if (image) {
    tags.push('<meta property="og:image" content="' + escapeHtml(image) + '">');
    tags.push('<meta property="og:image:width" content="1200">');
    tags.push('<meta property="og:image:height" content="630">');
  }
  tags.push('<meta property="og:type" content="' + type + '">');
  if (siteName) tags.push('<meta property="og:site_name" content="' + escapeHtml(siteName) + '">');
  
  // Twitter
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  if (title) tags.push('<meta name="twitter:title" content="' + escapeHtml(title) + '">');
  if (description) tags.push('<meta name="twitter:description" content="' + escapeHtml(description) + '">');
  if (image) tags.push('<meta name="twitter:image" content="' + escapeHtml(image) + '">');
  
  return {
    ok: true,
    html: tags.join('\n'),
    tags: tags
  };
}

/**
 * Escape HTML entities
 */
function FT_OG_escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Preview social share
 */
function FT_previewSocialShare(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const analysis = FT_analyzeOpenGraph({ url: url });
    
    if (!analysis.ok) {
      return analysis;
    }
    
    const og = analysis.openGraph;
    const twitter = analysis.twitter;
    const basic = analysis.basic;
    
    return {
      ok: true,
      previews: {
        facebook: {
          title: og.title || basic.title,
          description: og.description || basic.description,
          image: og.image,
          url: og.url || url
        },
        twitter: {
          card: twitter.card || 'summary',
          title: twitter.title || og.title || basic.title,
          description: twitter.description || og.description || basic.description,
          image: twitter.image || og.image
        },
        linkedin: {
          title: og.title || basic.title,
          description: og.description || basic.description,
          image: og.image
        }
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check image validity for social
 */
function FT_checkSocialImage(params) {
  const imageUrl = params.imageUrl;
  
  if (!imageUrl) {
    return { ok: false, error: 'Image URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      return { ok: true, valid: false, error: 'Image returned ' + statusCode };
    }
    
    const contentType = response.getHeaders()['Content-Type'] || '';
    const isImage = contentType.includes('image/');
    
    const blob = response.getBlob();
    const sizeKB = Math.round(blob.getBytes().length / 1024);
    
    const issues = [];
    
    if (!isImage) {
      issues.push('Not a valid image type');
    }
    
    if (sizeKB > 5000) {
      issues.push('Image too large (>5MB)');
    }
    
    return {
      ok: true,
      valid: isImage && issues.length === 0,
      contentType: contentType,
      sizeKB: sizeKB,
      issues: issues,
      recommendations: sizeKB > 1000 ? ['Consider compressing image'] : []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

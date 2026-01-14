/**
 * FT_Image.gs - Image SEO Analysis
 * SerpifAI V8 - Image optimization and analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// IMAGE SEO ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze images on page
 */
function FT_analyzeImages(params) {
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
    
    // Extract all images
    const images = extractImages(html, baseUrl);
    
    // Analyze each image
    const analyzed = images.map(function(img) {
      return analyzeImage(img);
    });
    
    // Calculate summary stats
    const summary = calculateImageSummary(analyzed);
    
    return {
      ok: true,
      url: url,
      totalImages: images.length,
      images: analyzed,
      summary: summary,
      recommendations: getImageRecommendations(analyzed)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract base URL
 */
function FT_Img_extractBaseUrl(url) {
  const match = url.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : '';
}

/**
 * Extract images from HTML
 */
function extractImages(html, baseUrl) {
  const images = [];
  const pattern = /<img[^>]+>/gi;
  let match;
  
  while ((match = pattern.exec(html)) !== null) {
    const imgTag = match[0];
    
    // Extract src
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : null;
    
    // Extract alt
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : null;
    
    // Extract title
    const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract dimensions
    const widthMatch = imgTag.match(/width=["']?(\d+)/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)/i);
    
    // Extract loading attribute
    const loadingMatch = imgTag.match(/loading=["']([^"']+)["']/i);
    
    if (src) {
      // Resolve relative URLs
      let fullSrc = src;
      if (src.startsWith('//')) {
        fullSrc = 'https:' + src;
      } else if (src.startsWith('/')) {
        fullSrc = baseUrl + src;
      } else if (!src.startsWith('http')) {
        fullSrc = baseUrl + '/' + src;
      }
      
      images.push({
        src: fullSrc,
        alt: alt,
        title: title,
        width: widthMatch ? parseInt(widthMatch[1]) : null,
        height: heightMatch ? parseInt(heightMatch[1]) : null,
        loading: loadingMatch ? loadingMatch[1] : null
      });
    }
  }
  
  return images;
}

/**
 * Analyze single image
 */
function analyzeImage(img) {
  const issues = [];
  let score = 100;
  
  // Check alt text
  if (!img.alt) {
    issues.push('Missing alt text');
    score -= 30;
  } else if (img.alt.length < 5) {
    issues.push('Alt text too short');
    score -= 15;
  } else if (img.alt.length > 125) {
    issues.push('Alt text too long');
    score -= 10;
  }
  
  // Check dimensions
  if (!img.width || !img.height) {
    issues.push('Missing width/height attributes');
    score -= 15;
  }
  
  // Check lazy loading
  if (!img.loading) {
    issues.push('No lazy loading attribute');
    score -= 10;
  }
  
  // Check file format
  const extension = getFileExtension(img.src);
  if (!['webp', 'avif'].includes(extension)) {
    issues.push('Not using modern format (WebP/AVIF)');
    score -= 10;
  }
  
  // Check filename
  const filename = getFilename(img.src);
  if (filename && /^(image|img|photo|picture|pic|DSC|IMG_)\d*/i.test(filename)) {
    issues.push('Non-descriptive filename');
    score -= 10;
  }
  
  return {
    src: img.src,
    alt: img.alt,
    title: img.title,
    width: img.width,
    height: img.height,
    loading: img.loading,
    extension: extension,
    filename: filename,
    issues: issues,
    score: Math.max(0, score)
  };
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Get filename from URL
 */
function getFilename(url) {
  const match = url.match(/\/([^\/\?]+)(?:\?|$)/);
  return match ? match[1] : null;
}

/**
 * Calculate image summary
 */
function calculateImageSummary(images) {
  const total = images.length;
  if (total === 0) {
    return { message: 'No images found' };
  }
  
  const withAlt = images.filter(function(i) { return i.alt && i.alt.length > 0; }).length;
  const withDimensions = images.filter(function(i) { return i.width && i.height; }).length;
  const withLazy = images.filter(function(i) { return i.loading === 'lazy'; }).length;
  const modernFormat = images.filter(function(i) { return ['webp', 'avif'].includes(i.extension); }).length;
  
  const avgScore = Math.round(images.reduce(function(sum, i) { return sum + i.score; }, 0) / total);
  
  return {
    total: total,
    withAlt: withAlt,
    withAltPercent: Math.round((withAlt / total) * 100),
    withDimensions: withDimensions,
    withDimensionsPercent: Math.round((withDimensions / total) * 100),
    withLazyLoading: withLazy,
    withLazyLoadingPercent: Math.round((withLazy / total) * 100),
    modernFormat: modernFormat,
    modernFormatPercent: Math.round((modernFormat / total) * 100),
    averageScore: avgScore
  };
}

/**
 * Get image recommendations
 */
function getImageRecommendations(images) {
  const recs = [];
  
  const withoutAlt = images.filter(function(i) { return !i.alt; }).length;
  if (withoutAlt > 0) {
    recs.push({
      priority: 'high',
      issue: withoutAlt + ' images missing alt text',
      fix: 'Add descriptive alt text to all images'
    });
  }
  
  const withoutDimensions = images.filter(function(i) { return !i.width || !i.height; }).length;
  if (withoutDimensions > 0) {
    recs.push({
      priority: 'medium',
      issue: withoutDimensions + ' images missing dimensions',
      fix: 'Add width and height attributes to prevent layout shift'
    });
  }
  
  const withoutLazy = images.filter(function(i) { return i.loading !== 'lazy'; }).length;
  if (withoutLazy > 3) {
    recs.push({
      priority: 'medium',
      issue: withoutLazy + ' images not using lazy loading',
      fix: 'Add loading="lazy" to below-the-fold images'
    });
  }
  
  const oldFormats = images.filter(function(i) { 
    return !['webp', 'avif'].includes(i.extension); 
  }).length;
  if (oldFormats > 0) {
    recs.push({
      priority: 'low',
      issue: oldFormats + ' images using older formats',
      fix: 'Convert to WebP or AVIF for better compression'
    });
  }
  
  return recs;
}

/**
 * Check image size remotely
 */
function FT_checkImageSize(params) {
  const imageUrl = params.url;
  
  if (!imageUrl) {
    return { ok: false, error: 'Image URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(imageUrl, {
      muteHttpExceptions: true,
      method: 'HEAD'
    });
    
    const headers = response.getHeaders();
    const contentLength = headers['Content-Length'] || headers['content-length'];
    const contentType = headers['Content-Type'] || headers['content-type'];
    
    const sizeBytes = contentLength ? parseInt(contentLength) : null;
    const sizeKB = sizeBytes ? Math.round(sizeBytes / 1024) : null;
    
    let recommendation = null;
    if (sizeKB && sizeKB > 200) {
      recommendation = 'Image is ' + sizeKB + 'KB. Consider compressing to under 200KB.';
    }
    
    return {
      ok: true,
      url: imageUrl,
      sizeBytes: sizeBytes,
      sizeKB: sizeKB,
      contentType: contentType,
      recommendation: recommendation
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate image alt text suggestions
 */
function FT_suggestAltText(params) {
  const filename = params.filename;
  const context = params.context || '';
  
  if (!filename) {
    return { ok: false, error: 'Filename required' };
  }
  
  // Clean filename
  let suggestion = filename
    .replace(/\.[^.]+$/, '')           // Remove extension
    .replace(/[-_]/g, ' ')              // Replace dashes/underscores with spaces
    .replace(/\d+/g, '')                // Remove numbers
    .replace(/\s+/g, ' ')               // Normalize spaces
    .trim()
    .toLowerCase();
  
  // Capitalize first letter
  if (suggestion.length > 0) {
    suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }
  
  // If context provided, incorporate it
  if (context) {
    suggestion = context + ' - ' + suggestion;
  }
  
  return {
    ok: true,
    filename: filename,
    suggestedAlt: suggestion || 'Descriptive text needed',
    tips: [
      'Be specific and descriptive',
      'Include relevant keywords naturally',
      'Avoid starting with "image of" or "picture of"',
      'Keep it under 125 characters'
    ]
  };
}

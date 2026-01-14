/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ExtractImages.gs - ELITE IMAGE ANALYSIS ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Comprehensive Image Intelligence
 * 
 * EXTRACTS:
 * ✓ All images with dimensions & format
 * ✓ Alt text analysis (missing, empty, quality)
 * ✓ Lazy loading detection
 * ✓ Responsive images (srcset, sizes)
 * ✓ File format optimization (WebP, AVIF, JPEG, PNG, SVG, GIF)
 * ✓ Image accessibility scoring
 * ✓ Decorative vs content images
 * 
 * @module ImageAnalyzer
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Extract ALL images with comprehensive analysis
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for relative paths
 * @return {object} Complete image analysis
 */
function FT_extractImages(html, baseUrl) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var startTime = new Date().getTime();
  
  try {
    var images = [];
    var stats = {
      total: 0,
      withAlt: 0,
      withoutAlt: 0,
      emptyAlt: 0,
      lazyLoaded: 0,
      responsive: 0,
      formats: {
        webp: 0,
        avif: 0,
        jpeg: 0,
        jpg: 0,
        png: 0,
        svg: 0,
        gif: 0,
        other: 0
      }
    };
    
    // Extract <img> tags
    var imgRegex = /<img([^>]*)>/gi;
    var match;
    var position = 0;
    
    while ((match = imgRegex.exec(html)) !== null) {
      position++;
      var attributes = match[1];
      
      // Extract src
      var srcMatch = attributes.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) continue; // Skip images without src
      
      var src = srcMatch[1].trim();
      
      // Extract alt text
      var altMatch = attributes.match(/alt=["']([^"]*)["']/i);
      var alt = altMatch ? altMatch[1].trim() : null;
      
      // Extract title
      var titleMatch = attributes.match(/title=["']([^"]*)["']/i);
      var title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract dimensions
      var widthMatch = attributes.match(/width=["']?(\d+)["']?/i);
      var heightMatch = attributes.match(/height=["']?(\d+)["']?/i);
      var width = widthMatch ? parseInt(widthMatch[1]) : null;
      var height = heightMatch ? parseInt(heightMatch[1]) : null;
      
      // Extract loading attribute
      var loadingMatch = attributes.match(/loading=["']([^"']+)["']/i);
      var loading = loadingMatch ? loadingMatch[1].toLowerCase() : 'eager';
      var isLazy = loading === 'lazy';
      
      // Extract srcset (responsive)
      var srcsetMatch = attributes.match(/srcset=["']([^"']+)["']/i);
      var srcset = srcsetMatch ? srcsetMatch[1] : '';
      var hasResponsive = srcset.length > 0;
      
      // Extract sizes
      var sizesMatch = attributes.match(/sizes=["']([^"']+)["']/i);
      var sizes = sizesMatch ? sizesMatch[1] : '';
      
      // Determine format
      var format = getImageFormat(src);
      
      // Determine if decorative (empty alt suggests decorative)
      var isDecorative = alt === '';
      
      // Alt text quality
      var altQuality = analyzeAltQuality(alt, src);
      
      // Build image object
      var imageObj = {
        position: position,
        src: src,
        alt: alt,
        hasAlt: alt !== null,
        altQuality: altQuality,
        title: title,
        width: width,
        height: height,
        format: format,
        loading: loading,
        isLazy: isLazy,
        hasResponsive: hasResponsive,
        srcset: srcset,
        sizes: sizes,
        isDecorative: isDecorative,
        aspectRatio: (width && height) ? Math.round((width / height) * 100) / 100 : null
      };
      
      images.push(imageObj);
      
      // Update stats
      stats.total++;
      if (alt !== null) stats.withAlt++;
      else stats.withoutAlt++;
      if (alt === '') stats.emptyAlt++;
      if (isLazy) stats.lazyLoaded++;
      if (hasResponsive) stats.responsive++;
      stats.formats[format] = (stats.formats[format] || 0) + 1;
    }
    
    // Calculate metrics
    var altCoverage = stats.total > 0 ? 
      Math.round((stats.withAlt / stats.total) * 100) : 0;
    
    var decorativeCount = images.filter(function(img) { 
      return img.isDecorative; 
    }).length;
    
    var contentImages = stats.total - decorativeCount;
    
    var modernFormatCount = stats.formats.webp + stats.formats.avif;
    var modernFormatPercent = stats.total > 0 ?
      Math.round((modernFormatCount / stats.total) * 100) : 0;
    
    // Accessibility scoring (0-100)
    var accessibilityScore = calculateAccessibilityScore(images, stats, altCoverage);
    
    // Validation
    var validation = {
      allHaveAlt: stats.withoutAlt === 0,
      altCoverageOptimal: altCoverage >= 95,
      hasLazyLoading: stats.lazyLoaded > 0,
      hasResponsive: stats.responsive > 0,
      usesModernFormats: modernFormatCount > 0,
      modernFormatOptimal: modernFormatPercent >= 50
    };
    
    // Recommendations
    var recommendations = getImageRecommendations(images, stats, validation);
    
    return {
      ok: true,
      
      // Counts
      total: stats.total,
      contentImages: contentImages,
      decorativeImages: decorativeCount,
      
      // Images
      images: images,
      
      // Stats
      stats: stats,
      
      // Metrics
      altCoverage: altCoverage,
      modernFormatPercent: modernFormatPercent,
      lazyLoadPercent: stats.total > 0 ? 
        Math.round((stats.lazyLoaded / stats.total) * 100) : 0,
      responsivePercent: stats.total > 0 ?
        Math.round((stats.responsive / stats.total) * 100) : 0,
      
      // Scoring
      accessibilityScore: accessibilityScore.total,
      accessibilityGrade: accessibilityScore.grade,
      accessibilityBreakdown: accessibilityScore.breakdown,
      
      // Validation
      validation: validation,
      
      // Recommendations
      recommendations: recommendations,
      
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
 * Get image format from URL
 */
function getImageFormat(src) {
  var lowerSrc = src.toLowerCase();
  
  if (lowerSrc.indexOf('.webp') !== -1 || lowerSrc.indexOf('format=webp') !== -1) return 'webp';
  if (lowerSrc.indexOf('.avif') !== -1 || lowerSrc.indexOf('format=avif') !== -1) return 'avif';
  if (lowerSrc.indexOf('.jpg') !== -1 || lowerSrc.indexOf('.jpeg') !== -1) return 'jpeg';
  if (lowerSrc.indexOf('.png') !== -1) return 'png';
  if (lowerSrc.indexOf('.svg') !== -1) return 'svg';
  if (lowerSrc.indexOf('.gif') !== -1) return 'gif';
  if (lowerSrc.indexOf('.bmp') !== -1) return 'bmp';
  if (lowerSrc.indexOf('.ico') !== -1) return 'ico';
  
  return 'other';
}

/**
 * Analyze alt text quality
 */
function analyzeAltQuality(alt, src) {
  if (alt === null) {
    return {
      score: 0,
      quality: 'missing',
      issues: ['Alt attribute is missing']
    };
  }
  
  if (alt === '') {
    return {
      score: 50,
      quality: 'decorative',
      issues: []
    };
  }
  
  var issues = [];
  var score = 100;
  
  // Too short
  if (alt.length < 5) {
    issues.push('Alt text is too short (< 5 characters)');
    score -= 20;
  }
  
  // Too long
  if (alt.length > 125) {
    issues.push('Alt text is too long (> 125 characters)');
    score -= 15;
  }
  
  // Filename in alt text
  var filename = src.split('/').pop().split('?')[0];
  if (alt.toLowerCase() === filename.toLowerCase()) {
    issues.push('Alt text is just the filename');
    score -= 30;
  }
  
  // Generic terms
  var genericTerms = ['image', 'picture', 'photo', 'graphic', 'icon'];
  var lowerAlt = alt.toLowerCase();
  genericTerms.forEach(function(term) {
    if (lowerAlt === term || lowerAlt === term + ' of' || lowerAlt === 'an ' + term) {
      issues.push('Alt text uses generic term: "' + term + '"');
      score -= 25;
    }
  });
  
  // Optimal length
  var isOptimal = alt.length >= 10 && alt.length <= 100;
  
  // Has descriptive words
  var wordCount = alt.split(/\s+/).length;
  if (wordCount < 3) {
    issues.push('Alt text has few words (< 3)');
    score -= 10;
  }
  
  var quality = 'excellent';
  if (score < 70) quality = 'poor';
  else if (score < 85) quality = 'fair';
  else if (score < 95) quality = 'good';
  
  return {
    score: Math.max(0, score),
    quality: quality,
    length: alt.length,
    wordCount: wordCount,
    isOptimal: isOptimal,
    issues: issues
  };
}

/**
 * Calculate accessibility score
 */
function calculateAccessibilityScore(images, stats, altCoverage) {
  var score = 0;
  var breakdown = {};
  
  // Alt text coverage (50 points)
  var altScore = Math.round((altCoverage / 100) * 50);
  score += altScore;
  breakdown.altCoverage = altScore;
  
  // Alt text quality (30 points)
  if (images.length > 0) {
    var avgQuality = 0;
    var contentImages = images.filter(function(img) { return !img.isDecorative; });
    
    if (contentImages.length > 0) {
      contentImages.forEach(function(img) {
        if (img.altQuality && img.altQuality.score) {
          avgQuality += img.altQuality.score;
        }
      });
      avgQuality = avgQuality / contentImages.length;
      
      var qualityScore = Math.round((avgQuality / 100) * 30);
      score += qualityScore;
      breakdown.altQuality = qualityScore;
    }
  }
  
  // Lazy loading (10 points)
  if (stats.lazyLoaded > 0) {
    var lazyScore = Math.min(10, Math.round((stats.lazyLoaded / stats.total) * 10));
    score += lazyScore;
    breakdown.lazyLoading = lazyScore;
  }
  
  // Responsive images (10 points)
  if (stats.responsive > 0) {
    var responsiveScore = Math.min(10, Math.round((stats.responsive / stats.total) * 10));
    score += responsiveScore;
    breakdown.responsive = responsiveScore;
  }
  
  // Calculate grade
  var grade = 'F';
  if (score >= 97) grade = 'A+';
  else if (score >= 93) grade = 'A';
  else if (score >= 90) grade = 'A-';
  else if (score >= 87) grade = 'B+';
  else if (score >= 83) grade = 'B';
  else if (score >= 80) grade = 'B-';
  else if (score >= 77) grade = 'C+';
  else if (score >= 73) grade = 'C';
  else if (score >= 70) grade = 'C-';
  else if (score >= 60) grade = 'D';
  
  return {
    total: score,
    grade: grade,
    breakdown: breakdown
  };
}

/**
 * Get image recommendations
 */
function getImageRecommendations(images, stats, validation) {
  var recommendations = [];
  
  if (stats.withoutAlt > 0) {
    recommendations.push({
      severity: 'error',
      category: 'accessibility',
      message: stats.withoutAlt + ' image(s) missing alt attribute',
      priority: 1
    });
  }
  
  // Check for poor quality alt text
  var poorAltImages = images.filter(function(img) {
    return img.altQuality && img.altQuality.quality === 'poor';
  }).length;
  
  if (poorAltImages > 0) {
    recommendations.push({
      severity: 'warning',
      category: 'accessibility',
      message: poorAltImages + ' image(s) have poor quality alt text',
      priority: 2
    });
  }
  
  // Modern format recommendation
  var modernCount = stats.formats.webp + stats.formats.avif;
  if (modernCount === 0 && stats.total > 0) {
    recommendations.push({
      severity: 'warning',
      category: 'performance',
      message: 'No modern image formats (WebP/AVIF) detected. Convert images for better performance.',
      priority: 2
    });
  }
  
  // Lazy loading recommendation
  if (stats.lazyLoaded === 0 && stats.total > 5) {
    recommendations.push({
      severity: 'info',
      category: 'performance',
      message: 'No lazy loading detected. Add loading="lazy" to below-fold images.',
      priority: 3
    });
  }
  
  // Responsive images
  if (stats.responsive === 0 && stats.total > 0) {
    recommendations.push({
      severity: 'info',
      category: 'performance',
      message: 'No responsive images detected. Add srcset for different screen sizes.',
      priority: 3
    });
  }
  
  return recommendations;
}

/**
 * Legacy function names
 */
function FET_extractImages(html, baseUrl) {
  return FT_extractImages(html, baseUrl);
}

/**
 * FT_Mobile.gs - Mobile SEO Analysis
 * SerpifAI V8 - Mobile-first optimization
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MOBILE SEO ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze mobile SEO
 */
function FT_analyzeMobileSEO(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      }
    });
    
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    const checks = [];
    
    // Viewport meta tag
    const viewportCheck = checkViewport(html);
    checks.push(viewportCheck);
    
    // Responsive images
    const imageCheck = checkResponsiveImages(html);
    checks.push(imageCheck);
    
    // Touch targets
    const touchCheck = checkTouchTargets(html);
    checks.push(touchCheck);
    
    // Font sizes
    const fontCheck = checkFontSizes(html);
    checks.push(fontCheck);
    
    // Mobile redirects
    const redirectCheck = checkMobileRedirects(url, headers);
    checks.push(redirectCheck);
    
    // Content width
    const widthCheck = checkContentWidth(html);
    checks.push(widthCheck);
    
    // Mobile plugins
    const pluginCheck = checkMobilePlugins(html);
    checks.push(pluginCheck);
    
    // Calculate score
    const passedCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passedCount / checks.length) * 100);
    
    return {
      ok: true,
      url: url,
      score: score,
      checks: checks,
      recommendations: generateMobileRecommendations(checks)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check viewport meta tag
 */
function FT_Mobile_checkViewport(html) {
  const viewportRegex = /<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/i;
  const hasViewport = viewportRegex.test(html);
  
  if (hasViewport) {
    const match = html.match(viewportRegex);
    const content = match[0].match(/content\s*=\s*["']([^"']+)["']/i);
    
    if (content && content[1].includes('width=device-width')) {
      return {
        name: 'Viewport Meta Tag',
        status: 'pass',
        description: 'Viewport properly configured'
      };
    }
    
    return {
      name: 'Viewport Meta Tag',
      status: 'warn',
      description: 'Viewport found but may not be optimal',
      fix: 'Use width=device-width, initial-scale=1'
    };
  }
  
  return {
    name: 'Viewport Meta Tag',
    status: 'fail',
    description: 'Missing viewport meta tag',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
  };
}

/**
 * Check responsive images
 */
function checkResponsiveImages(html) {
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  
  let responsiveCount = 0;
  let total = images.length;
  
  images.forEach(function(img) {
    if (/srcset/i.test(img) || /sizes/i.test(img) || /style\s*=\s*["'][^"']*max-width/i.test(img)) {
      responsiveCount++;
    }
  });
  
  const percentage = total > 0 ? Math.round((responsiveCount / total) * 100) : 100;
  
  if (percentage >= 80) {
    return {
      name: 'Responsive Images',
      status: 'pass',
      description: percentage + '% of images are responsive'
    };
  } else if (percentage >= 50) {
    return {
      name: 'Responsive Images',
      status: 'warn',
      description: percentage + '% of images are responsive',
      fix: 'Add srcset and sizes attributes to more images'
    };
  }
  
  return {
    name: 'Responsive Images',
    status: 'fail',
    description: 'Only ' + percentage + '% of images are responsive',
    fix: 'Use srcset for responsive images or CSS max-width: 100%'
  };
}

/**
 * Check touch targets
 */
function checkTouchTargets(html) {
  // Basic check for small links/buttons
  const tinyLinks = html.match(/<a[^>]*style\s*=\s*["'][^"']*font-size\s*:\s*(\d+)/gi) || [];
  let smallCount = 0;
  
  tinyLinks.forEach(function(link) {
    const sizeMatch = link.match(/font-size\s*:\s*(\d+)/i);
    if (sizeMatch && parseInt(sizeMatch[1]) < 12) {
      smallCount++;
    }
  });
  
  if (smallCount === 0) {
    return {
      name: 'Touch Targets',
      status: 'pass',
      description: 'Touch targets appear adequately sized'
    };
  }
  
  return {
    name: 'Touch Targets',
    status: 'warn',
    description: 'Some touch targets may be too small',
    fix: 'Ensure touch targets are at least 48x48 pixels'
  };
}

/**
 * Check font sizes
 */
function checkFontSizes(html) {
  const smallFonts = html.match(/font-size\s*:\s*([0-9]+)\s*px/gi) || [];
  let tooSmallCount = 0;
  
  smallFonts.forEach(function(font) {
    const sizeMatch = font.match(/(\d+)/);
    if (sizeMatch && parseInt(sizeMatch[1]) < 12) {
      tooSmallCount++;
    }
  });
  
  if (tooSmallCount === 0) {
    return {
      name: 'Legible Font Sizes',
      status: 'pass',
      description: 'Font sizes are mobile-friendly'
    };
  }
  
  return {
    name: 'Legible Font Sizes',
    status: 'warn',
    description: tooSmallCount + ' elements with fonts smaller than 12px',
    fix: 'Use minimum 16px for body text on mobile'
  };
}

/**
 * Check mobile redirects
 */
function checkMobileRedirects(url, headers) {
  // Check if there's a mobile-specific redirect
  const isMobileSite = /m\.|mobile\./i.test(url);
  
  if (isMobileSite) {
    return {
      name: 'Mobile Redirects',
      status: 'warn',
      description: 'Site uses separate mobile URL',
      fix: 'Consider responsive design instead of separate mobile site'
    };
  }
  
  return {
    name: 'Mobile Redirects',
    status: 'pass',
    description: 'No mobile-specific redirects detected'
  };
}

/**
 * Check content width
 */
function checkContentWidth(html) {
  // Check for horizontal scroll indicators
  const fixedWidths = html.match(/width\s*:\s*(\d+)\s*px/gi) || [];
  let wideElements = 0;
  
  fixedWidths.forEach(function(width) {
    const sizeMatch = width.match(/(\d+)/);
    if (sizeMatch && parseInt(sizeMatch[1]) > 500) {
      wideElements++;
    }
  });
  
  if (wideElements === 0) {
    return {
      name: 'Content Width',
      status: 'pass',
      description: 'Content fits viewport width'
    };
  }
  
  return {
    name: 'Content Width',
    status: 'warn',
    description: wideElements + ' elements with fixed widths > 500px',
    fix: 'Use percentage-based or viewport-relative widths'
  };
}

/**
 * Check mobile plugins
 */
function checkMobilePlugins(html) {
  const hasFlash = /<(embed|object)[^>]*flash/i.test(html);
  const hasApplet = /<applet/i.test(html);
  const hasSilverlight = /silverlight/i.test(html);
  
  if (hasFlash || hasApplet || hasSilverlight) {
    return {
      name: 'Mobile Plugins',
      status: 'fail',
      description: 'Page uses incompatible plugins (Flash, Applet, Silverlight)',
      fix: 'Replace Flash/Silverlight content with HTML5'
    };
  }
  
  return {
    name: 'Mobile Plugins',
    status: 'pass',
    description: 'No incompatible plugins found'
  };
}

/**
 * Generate mobile recommendations
 */
function generateMobileRecommendations(checks) {
  return checks
    .filter(c => c.status === 'fail' || c.status === 'warn')
    .map(c => ({
      priority: c.status === 'fail' ? 'high' : 'medium',
      title: c.name,
      description: c.description,
      fix: c.fix
    }));
}

/**
 * Compare mobile vs desktop
 */
function FT_compareMobileDesktop(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Fetch as mobile
    const mobileResponse = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    
    // Fetch as desktop
    const desktopResponse = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0'
      }
    });
    
    const mobileHtml = mobileResponse.getContentText();
    const desktopHtml = desktopResponse.getContentText();
    
    return {
      ok: true,
      comparison: {
        sameContent: mobileHtml.length === desktopHtml.length,
        mobileSizeKB: Math.round(mobileHtml.length / 1024),
        desktopSizeKB: Math.round(desktopHtml.length / 1024),
        sizeDifference: Math.round((desktopHtml.length - mobileHtml.length) / 1024)
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

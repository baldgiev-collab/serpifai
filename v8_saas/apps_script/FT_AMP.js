/**
 * FT_AMP.gs - AMP Analysis
 * SerpifAI V8 - Accelerated Mobile Pages validation
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// AMP ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check if URL has AMP version
 */
function FT_checkAMP(params) {
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
    
    // Check if current page is AMP
    const isAMP = checkIsAMPPage(html);
    
    // Check for AMP link reference
    const ampUrl = findAMPUrl(html, url);
    
    // If found AMP URL, validate it
    let ampValidation = null;
    if (ampUrl && ampUrl !== url) {
      ampValidation = validateAMPPage(ampUrl);
    } else if (isAMP) {
      ampValidation = validateAMPHtml(html, url);
    }
    
    return {
      ok: true,
      url: url,
      isAMP: isAMP,
      hasAMPVersion: !!ampUrl,
      ampUrl: ampUrl,
      validation: ampValidation
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check if page is AMP
 */
function checkIsAMPPage(html) {
  // Check for AMP indicators
  const ampIndicators = [
    /<html[^>]+amp[^>]*>/i,
    /<html[^>]+⚡[^>]*>/i,
    /amp-boilerplate/i,
    /cdn\.ampproject\.org/i
  ];
  
  for (let i = 0; i < ampIndicators.length; i++) {
    if (ampIndicators[i].test(html)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Find AMP URL from page
 */
function findAMPUrl(html, baseUrl) {
  // Check for amphtml link
  const ampLinkMatch = html.match(/<link[^>]+rel=["']amphtml["'][^>]+href=["']([^"']+)["']/i);
  if (ampLinkMatch) {
    const ampUrl = ampLinkMatch[1];
    // Resolve relative URLs
    if (ampUrl.startsWith('/')) {
      const match = baseUrl.match(/^(https?:\/\/[^\/]+)/);
      return match ? match[1] + ampUrl : ampUrl;
    }
    return ampUrl;
  }
  
  // Try common AMP URL patterns
  const patterns = [
    url => url.replace(/\/?$/, '/amp/'),
    url => url.replace(/\/?$/, '/amp'),
    url => url.replace(/^(https?:\/\/)/, '$1amp.')
  ];
  
  // Could check these but would require additional fetches
  return null;
}

/**
 * Validate AMP page
 */
function validateAMPPage(ampUrl) {
  try {
    const response = UrlFetchApp.fetch(ampUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (response.getResponseCode() !== 200) {
      return { valid: false, error: 'AMP page returned ' + response.getResponseCode() };
    }
    
    const html = response.getContentText();
    return validateAMPHtml(html, ampUrl);
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Validate AMP HTML
 */
function validateAMPHtml(html, url) {
  const errors = [];
  const warnings = [];
  
  // Check for required AMP elements
  if (!/<html[^>]+(amp|⚡)/i.test(html)) {
    errors.push('Missing amp or ⚡ attribute on html tag');
  }
  
  if (!/<meta charset="utf-8"/i.test(html)) {
    errors.push('Missing UTF-8 charset declaration');
  }
  
  if (!/<meta name="viewport"/i.test(html)) {
    errors.push('Missing viewport meta tag');
  }
  
  if (!/cdn\.ampproject\.org\/v0\.js/i.test(html)) {
    errors.push('Missing AMP runtime script');
  }
  
  if (!/amp-boilerplate/i.test(html)) {
    errors.push('Missing AMP boilerplate style');
  }
  
  // Check for canonical
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    errors.push('Missing canonical link');
  }
  
  // Check for disallowed elements
  const disallowed = ['<img', '<video', '<audio', '<iframe', '<form', '<input'];
  disallowed.forEach(function(tag) {
    // Must use amp- versions instead
    const pattern = new RegExp(tag + '[^>]+(?!amp-)', 'i');
    if (pattern.test(html) && html.indexOf('amp-' + tag.substring(1)) < 0) {
      warnings.push('Found ' + tag + '> - should use amp-' + tag.substring(1) + '>');
    }
  });
  
  // Check for inline styles (limited in AMP)
  const inlineStyles = (html.match(/style=["'][^"']+["']/gi) || []).length;
  if (inlineStyles > 0) {
    warnings.push('Found ' + inlineStyles + ' inline styles (limited in AMP)');
  }
  
  // Check for external stylesheets
  if (/<link[^>]+rel=["']stylesheet["'][^>]+(?!cdn\.ampproject\.org)/i.test(html)) {
    warnings.push('External stylesheets not allowed except AMP extensions');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    url: url
  };
}

/**
 * Analyze AMP components used
 */
function FT_analyzeAMPComponents(params) {
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
    
    if (!checkIsAMPPage(html)) {
      return { ok: false, error: 'Page is not an AMP page' };
    }
    
    // Find AMP components
    const componentPattern = /<(amp-[a-z-]+)/gi;
    const components = {};
    let match;
    
    while ((match = componentPattern.exec(html)) !== null) {
      const component = match[1].toLowerCase();
      components[component] = (components[component] || 0) + 1;
    }
    
    // Find AMP scripts
    const scriptPattern = /cdn\.ampproject\.org\/v0\/(amp-[a-z-]+)/gi;
    const scripts = [];
    
    while ((match = scriptPattern.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    
    return {
      ok: true,
      url: url,
      components: components,
      scripts: [...new Set(scripts)],
      componentCount: Object.keys(components).length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate AMP conversion suggestions
 */
function FT_getAMPSuggestions(params) {
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
    const suggestions = [];
    
    // Check for elements that need AMP conversion
    const imgCount = (html.match(/<img[^>]+>/gi) || []).length;
    if (imgCount > 0) {
      suggestions.push({
        element: 'img',
        count: imgCount,
        replacement: 'amp-img',
        note: 'Add layout="responsive" or specific dimensions'
      });
    }
    
    const videoCount = (html.match(/<video[^>]+>/gi) || []).length;
    if (videoCount > 0) {
      suggestions.push({
        element: 'video',
        count: videoCount,
        replacement: 'amp-video',
        note: 'Include amp-video script'
      });
    }
    
    const iframeCount = (html.match(/<iframe[^>]+>/gi) || []).length;
    if (iframeCount > 0) {
      suggestions.push({
        element: 'iframe',
        count: iframeCount,
        replacement: 'amp-iframe',
        note: 'Must be at least 600px from top or 75% viewport'
      });
    }
    
    // Check YouTube embeds
    const youtubeCount = (html.match(/youtube\.com\/embed/gi) || []).length;
    if (youtubeCount > 0) {
      suggestions.push({
        element: 'YouTube embed',
        count: youtubeCount,
        replacement: 'amp-youtube',
        note: 'Use data-videoid attribute'
      });
    }
    
    // Check for forms
    const formCount = (html.match(/<form[^>]+>/gi) || []).length;
    if (formCount > 0) {
      suggestions.push({
        element: 'form',
        count: formCount,
        replacement: 'amp-form',
        note: 'Include amp-form extension'
      });
    }
    
    // Check external CSS
    const cssLinks = (html.match(/<link[^>]+stylesheet[^>]+>/gi) || []).length;
    if (cssLinks > 0) {
      suggestions.push({
        element: 'External CSS',
        count: cssLinks,
        replacement: 'Inline <style amp-custom>',
        note: 'Max 75KB inline CSS'
      });
    }
    
    // Check external JS
    const jsScripts = (html.match(/<script[^>]+src=(?!.*ampproject)[^>]+>/gi) || []).length;
    if (jsScripts > 0) {
      suggestions.push({
        element: 'External JavaScript',
        count: jsScripts,
        replacement: 'Remove or use amp-script',
        note: 'Custom JS limited in AMP'
      });
    }
    
    return {
      ok: true,
      url: url,
      suggestions: suggestions,
      effortEstimate: calculateAMPEffort(suggestions)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Calculate AMP conversion effort
 */
function calculateAMPEffort(suggestions) {
  let score = 0;
  
  suggestions.forEach(function(s) {
    switch (s.element) {
      case 'img':
        score += s.count * 0.5;
        break;
      case 'External CSS':
        score += s.count * 5;
        break;
      case 'External JavaScript':
        score += s.count * 10;
        break;
      case 'form':
        score += s.count * 3;
        break;
      default:
        score += s.count * 1;
    }
  });
  
  if (score <= 5) return 'Low (1-2 hours)';
  if (score <= 20) return 'Medium (half day)';
  if (score <= 50) return 'High (1-2 days)';
  return 'Very High (3+ days)';
}

/**
 * Generate AMP boilerplate
 */
function FT_generateAMPBoilerplate(params) {
  const title = params.title || 'AMP Page';
  const canonicalUrl = params.canonicalUrl || '';
  
  const boilerplate = `<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${title}</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    /* Your custom CSS here (max 75KB) */
  </style>
</head>
<body>
  <!-- Your AMP content here -->
</body>
</html>`;

  return {
    ok: true,
    boilerplate: boilerplate
  };
}

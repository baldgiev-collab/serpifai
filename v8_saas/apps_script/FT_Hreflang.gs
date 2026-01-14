/**
 * FT_Hreflang.gs - Hreflang Analysis
 * SerpifAI V8 - International SEO signals
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// HREFLANG ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze hreflang tags
 */
function FT_analyzeHreflang(params) {
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
    const headers = response.getAllHeaders();
    
    // Extract hreflang from HTML
    const htmlHreflang = extractHreflangFromHtml(html);
    
    // Check HTTP headers
    const headerHreflang = extractHreflangFromHeaders(headers);
    
    // Combine
    const allHreflang = htmlHreflang.concat(headerHreflang);
    
    // Validate
    const validation = validateHreflang(allHreflang, url);
    
    return {
      ok: true,
      url: url,
      hreflang: allHreflang,
      count: allHreflang.length,
      hasXDefault: allHreflang.some(function(h) { return h.lang === 'x-default'; }),
      hasSelfReference: allHreflang.some(function(h) { return h.url === url; }),
      validation: validation,
      recommendations: getHreflangRecommendations(allHreflang, url, validation)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract hreflang from HTML
 */
function extractHreflangFromHtml(html) {
  const hreflang = [];
  const pattern = /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi;
  const pattern2 = /<link[^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]+rel=["']alternate["']/gi;
  
  let match;
  while ((match = pattern.exec(html)) !== null) {
    hreflang.push({
      lang: match[1],
      url: match[2],
      source: 'html'
    });
  }
  
  while ((match = pattern2.exec(html)) !== null) {
    // Avoid duplicates
    const exists = hreflang.some(function(h) { 
      return h.lang === match[1] && h.url === match[2]; 
    });
    if (!exists) {
      hreflang.push({
        lang: match[1],
        url: match[2],
        source: 'html'
      });
    }
  }
  
  return hreflang;
}

/**
 * Extract hreflang from HTTP headers
 */
function extractHreflangFromHeaders(headers) {
  const hreflang = [];
  const linkHeader = headers['Link'] || headers['link'];
  
  if (!linkHeader) return hreflang;
  
  // Parse Link header
  const parts = linkHeader.split(',');
  parts.forEach(function(part) {
    const hreflangMatch = part.match(/hreflang=["']?([^"'\s;]+)/i);
    const urlMatch = part.match(/<([^>]+)>/);
    
    if (hreflangMatch && urlMatch) {
      hreflang.push({
        lang: hreflangMatch[1],
        url: urlMatch[1],
        source: 'header'
      });
    }
  });
  
  return hreflang;
}

/**
 * Validate hreflang implementation
 */
function validateHreflang(hreflang, currentUrl) {
  const errors = [];
  const warnings = [];
  
  if (hreflang.length === 0) {
    return { valid: true, errors: [], warnings: ['No hreflang tags found'], note: 'Only needed for multilingual sites' };
  }
  
  // Check for self-reference
  const hasSelf = hreflang.some(function(h) { return h.url === currentUrl; });
  if (!hasSelf) {
    errors.push('Missing self-referencing hreflang');
  }
  
  // Check for x-default
  const hasXDefault = hreflang.some(function(h) { return h.lang === 'x-default'; });
  if (!hasXDefault) {
    warnings.push('No x-default hreflang (recommended for fallback)');
  }
  
  // Validate language codes
  const validCodes = getValidLanguageCodes();
  hreflang.forEach(function(h) {
    if (h.lang !== 'x-default') {
      const parts = h.lang.split('-');
      const lang = parts[0].toLowerCase();
      const region = parts[1] ? parts[1].toUpperCase() : null;
      
      if (!validCodes.languages.includes(lang)) {
        errors.push('Invalid language code: ' + h.lang);
      }
      
      if (region && !validCodes.regions.includes(region)) {
        warnings.push('Possibly invalid region code: ' + region);
      }
    }
  });
  
  // Check for duplicate languages
  const langs = hreflang.map(function(h) { return h.lang; });
  const duplicates = langs.filter(function(lang, idx) { 
    return langs.indexOf(lang) !== idx; 
  });
  if (duplicates.length > 0) {
    errors.push('Duplicate hreflang tags: ' + [...new Set(duplicates)].join(', '));
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * Get valid ISO language/region codes (subset)
 */
function getValidLanguageCodes() {
  return {
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'th', 'vi', 'id', 'ms', 'tr', 'sv', 'no', 'da', 'fi', 'el', 'he', 'cs', 'hu', 'ro', 'uk', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et'],
    regions: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'BR', 'PT', 'MX', 'AR', 'CO', 'CL', 'PE', 'JP', 'KR', 'CN', 'TW', 'HK', 'SG', 'MY', 'IN', 'RU', 'PL', 'SE', 'NO', 'DK', 'FI', 'IE', 'NZ', 'ZA', 'AE', 'SA', 'IL', 'TR', 'TH', 'ID', 'PH', 'VN']
  };
}

/**
 * Get hreflang recommendations
 */
function getHreflangRecommendations(hreflang, url, validation) {
  const recs = [];
  
  if (hreflang.length === 0) {
    recs.push({
      priority: 'info',
      issue: 'No hreflang tags found',
      fix: 'Add hreflang tags if your site has multiple language versions'
    });
    return recs;
  }
  
  if (!validation.valid) {
    validation.errors.forEach(function(err) {
      recs.push({
        priority: 'high',
        issue: err,
        fix: 'Fix the hreflang implementation issue'
      });
    });
  }
  
  validation.warnings.forEach(function(warn) {
    recs.push({
      priority: 'medium',
      issue: warn,
      fix: 'Consider adding this for better international SEO'
    });
  });
  
  return recs;
}

/**
 * Check hreflang reciprocity
 */
function FT_checkHreflangReciprocity(params) {
  const urls = params.urls || [];
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  try {
    const results = {};
    
    // Fetch all pages
    urls.forEach(function(url) {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      const html = response.getContentText();
      const hreflang = extractHreflangFromHtml(html);
      
      results[url] = {
        hreflang: hreflang,
        references: hreflang.map(function(h) { return h.url; })
      };
      
      Utilities.sleep(200);
    });
    
    // Check reciprocity
    const issues = [];
    
    for (const sourceUrl in results) {
      results[sourceUrl].references.forEach(function(targetUrl) {
        if (results[targetUrl]) {
          const targetRefs = results[targetUrl].references;
          if (!targetRefs.includes(sourceUrl)) {
            issues.push({
              source: sourceUrl,
              target: targetUrl,
              issue: 'Target does not reference back to source'
            });
          }
        }
      });
    }
    
    return {
      ok: true,
      results: results,
      issues: issues,
      isReciprocal: issues.length === 0
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate hreflang tags
 */
function FT_generateHreflang(params) {
  const pages = params.pages || [];
  
  if (pages.length === 0) {
    return { ok: false, error: 'Pages required' };
  }
  
  // Generate for each page
  const results = pages.map(function(page) {
    const tags = [];
    
    pages.forEach(function(p) {
      tags.push('<link rel="alternate" hreflang="' + p.lang + '" href="' + p.url + '">');
    });
    
    // Add x-default if specified
    const defaultPage = pages.find(function(p) { return p.isDefault; });
    if (defaultPage) {
      tags.push('<link rel="alternate" hreflang="x-default" href="' + defaultPage.url + '">');
    }
    
    return {
      url: page.url,
      lang: page.lang,
      tags: tags.join('\n')
    };
  });
  
  return {
    ok: true,
    results: results
  };
}

/**
 * Get language/region suggestions
 */
function FT_getHreflangSuggestions(params) {
  const language = params.language;
  
  const suggestions = {
    en: [
      { code: 'en-US', name: 'English (United States)' },
      { code: 'en-GB', name: 'English (United Kingdom)' },
      { code: 'en-CA', name: 'English (Canada)' },
      { code: 'en-AU', name: 'English (Australia)' },
      { code: 'en-IE', name: 'English (Ireland)' },
      { code: 'en-NZ', name: 'English (New Zealand)' }
    ],
    es: [
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'es-AR', name: 'Spanish (Argentina)' },
      { code: 'es-CO', name: 'Spanish (Colombia)' },
      { code: 'es-CL', name: 'Spanish (Chile)' }
    ],
    pt: [
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)' }
    ],
    zh: [
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional - Taiwan)' },
      { code: 'zh-HK', name: 'Chinese (Traditional - Hong Kong)' }
    ],
    de: [
      { code: 'de-DE', name: 'German (Germany)' },
      { code: 'de-AT', name: 'German (Austria)' },
      { code: 'de-CH', name: 'German (Switzerland)' }
    ],
    fr: [
      { code: 'fr-FR', name: 'French (France)' },
      { code: 'fr-CA', name: 'French (Canada)' },
      { code: 'fr-BE', name: 'French (Belgium)' },
      { code: 'fr-CH', name: 'French (Switzerland)' }
    ]
  };
  
  if (language && suggestions[language]) {
    return { ok: true, suggestions: suggestions[language] };
  }
  
  return { ok: true, suggestions: suggestions };
}

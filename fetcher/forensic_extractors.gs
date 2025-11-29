/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORENSIC EXTRACTORS - ALL EVIDENCE COLLECTORS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Maps to 15-Category Competitor Report
 * Uses Cheerio ($) for in-memory parsing
 * 
 * @module ForensicExtractors
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// FETCH WITH HEADERS (For Technical Audit - Cat III)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch URL with full headers
 * @param {string} url - URL to fetch
 * @returns {Object} {ok, html, headers, status}
 */
function FET_fetchWithHeaders(url) {
  try {
    var userAgent = FET_getUserAgent();
    
    var options = {
      method: 'get',
      headers: {
        'User-Agent': userAgent
      },
      followRedirects: true,
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var status = response.getResponseCode();
    
    if (status >= 400) {
      return {
        ok: false,
        error: 'HTTP ' + status,
        status: status
      };
    }
    
    var html = response.getContentText();
    var headerObj = response.getHeaders();
    
    return {
      ok: true,
      html: html,
      headers: headerObj,
      status: status
    };
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      status: 0
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE EXTRACTION (Cat I - Market Intel, Cat VI - AI Systems)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract narrative context + AI workflow detection + METADATA
 * @param {Object} $ - Cheerio instance
 * @param {string} html - Raw HTML
 * @returns {Object} Narrative evidence with full metadata
 */
function FORENS_extractNarrative($, html) {
  var config = FET_Config().forensics;
  
  // Remove nav, header, footer elements
  var $body = $('body').clone();
  $body.find('nav, header, footer, aside, script, style').remove();
  
  var bodyText = $body.text().replace(/\s+/g, ' ').trim();
  
  // Extract first 1500 chars for Gemini narrative archetype analysis
  var brandText = bodyText.substring(0, config.narrativeLength);
  
  // Extract first 3 paragraphs (intro content)
  var introParagraphs = [];
  $('p').slice(0, 3).each(function() {
    var text = $(this).text().trim();
    if (text.length > 20) { // Skip short paragraphs
      introParagraphs.push(text);
    }
  });
  
  // Extract all meta tags
  var metaTags = {
    title: $('title').text() || '',
    description: $('meta[name="description"]').attr('content') || '',
    keywords: $('meta[name="keywords"]').attr('content') || '',
    author: $('meta[name="author"]').attr('content') || '',
    robots: $('meta[name="robots"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
    
    // Open Graph
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    ogImage: $('meta[property="og:image"]').attr('content') || '',
    ogType: $('meta[property="og:type"]').attr('content') || '',
    
    // Twitter Card
    twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
    twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
    twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
    twitterImage: $('meta[name="twitter:image"]').attr('content') || ''
  };
  
  // AI Workflow Detection (HubSpot, Marketo, Jasper, etc.)
  var aiToolsDetected = [];
  var aiWorkflowDetected = false;
  
  config.aiTools.forEach(function(tool) {
    if (html.toLowerCase().indexOf(tool.toLowerCase()) !== -1) {
      aiToolsDetected.push(tool);
      aiWorkflowDetected = true;
    }
  });
  
  // Check <meta name="generator">
  var generator = $('meta[name="generator"]').attr('content') || '';
  if (generator) {
    config.aiTools.forEach(function(tool) {
      if (generator.toLowerCase().indexOf(tool.toLowerCase()) !== -1) {
        if (aiToolsDetected.indexOf(tool) === -1) {
          aiToolsDetected.push(tool);
          aiWorkflowDetected = true;
        }
      }
    });
  }
  
  return {
    brandText: brandText,
    introParagraphs: introParagraphs, // First 3 paragraphs
    metaTags: metaTags, // ALL metadata
    archetype: '', // Filled by Gemini later
    aiWorkflowDetected: aiWorkflowDetected,
    detectedAITools: aiToolsDetected
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AI FOOTPRINT EXTRACTION (Cat III, IV, VI - AI Content Detection)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract AI footprint from headings and text
 * @param {Object} $ - Cheerio instance
 * @returns {Object} AI footprint evidence
 */
function FORENS_extractAIFootprint($) {
  var config = FET_Config().forensics;
  
  // Extract all headings
  var headings = [];
  $('h1, h2, h3, h4, h5, h6').each(function() {
    headings.push($(this).text().trim());
  });
  
  // Check for AI phrases in headings
  var aiPhrasesFound = [];
  var promptFingerprint = false;
  
  config.aiPhrases.forEach(function(phrase) {
    headings.forEach(function(heading) {
      if (heading.toLowerCase().indexOf(phrase) !== -1) {
        if (aiPhrasesFound.indexOf(phrase) === -1) {
          aiPhrasesFound.push(phrase);
          promptFingerprint = true;
        }
      }
    });
  });
  
  // Calculate humanity score (sentence variance)
  var $body = $('body').clone();
  $body.find('nav, header, footer, aside, script, style').remove();
  var bodyText = $body.text();
  
  var sentences = bodyText.split(/[.!?]+/).filter(function(s) {
    return s.trim().length > 10;
  });
  
  if (sentences.length < 5) {
    return {
      humanityScore: 50,
      aiPhrasesFound: aiPhrasesFound,
      promptFingerprint: promptFingerprint,
      sentenceVariance: 0
    };
  }
  
  // Calculate sentence length variance (low variance = AI)
  var lengths = sentences.map(function(s) { return s.trim().length; });
  var avgLength = lengths.reduce(function(a, b) { return a + b; }, 0) / lengths.length;
  
  var variance = lengths.reduce(function(sum, len) {
    return sum + Math.pow(len - avgLength, 2);
  }, 0) / lengths.length;
  
  var stdDev = Math.sqrt(variance);
  var coefficientOfVariation = (stdDev / avgLength) * 100;
  
  // Humanity score: higher variance = more human
  // AI content tends to have coefficient of variation < 30
  var humanityScore = Math.min(100, Math.max(0, coefficientOfVariation * 2));
  
  return {
    humanityScore: Math.round(humanityScore),
    aiPhrasesFound: aiPhrasesFound,
    promptFingerprint: promptFingerprint,
    sentenceVariance: Math.round(coefficientOfVariation)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// E-E-A-T EXTRACTION (Cat II - Trust Signals)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract E-E-A-T signals from schema
 * @param {Object} $ - Cheerio instance
 * @param {string} html - Raw HTML (for text search)
 * @returns {Object} E-E-A-T evidence
 */
function FORENS_extractEEAT($, html) {
  var schemas = [];
  var authorPresent = false;
  var orgPresent = false;
  var reviewsPresent = false;
  
  // Extract all JSON-LD schemas
  $('script[type="application/ld+json"]').each(function() {
    try {
      var jsonText = $(this).html();
      var schemaObj = JSON.parse(jsonText);
      
      var schemaType = schemaObj['@type'] || '';
      schemas.push(schemaType);
      
      // Check for author (Person schema)
      if (schemaType === 'Person' || schemaObj.author) {
        authorPresent = true;
      }
      
      // Check for organization
      if (schemaType === 'Organization' || schemaObj.publisher) {
        orgPresent = true;
      }
      
      // Check for reviews
      if (schemaType === 'Review' || schemaType === 'AggregateRating' || schemaObj.review || schemaObj.aggregateRating) {
        reviewsPresent = true;
      }
      
    } catch (e) {
      // Invalid JSON, skip
    }
  });
  
  // Additional trust signals
  var trustSignals = [];
  
  if (authorPresent) trustSignals.push('author_schema');
  if (orgPresent) trustSignals.push('org_schema');
  if (reviewsPresent) trustSignals.push('reviews_schema');
  
  // Check for author bylines in HTML
  if ($('[rel="author"]').length > 0 || $('.author').length > 0) {
    trustSignals.push('author_byline');
  }
  
  // Check for certifications/badges
  if (html.toLowerCase().indexOf('certified') !== -1 || 
      html.toLowerCase().indexOf('accredited') !== -1) {
    trustSignals.push('certifications');
  }
  
  return {
    schemas: schemas,
    authorPresent: authorPresent,
    orgPresent: orgPresent,
    reviewsPresent: reviewsPresent,
    trustSignals: trustSignals
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSION INTEL (Cat VII - Friction Heatmap & Funnel)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract conversion intelligence and friction heatmap
 * @param {Object} $ - Cheerio instance
 * @param {string} url - Page URL
 * @returns {Object} Conversion evidence
 */
function FORENS_extractConversionIntel($, url) {
  var config = FET_Config().forensics;
  
  // Count forms and fields
  var formCount = $('form').length;
  var totalFields = 0;
  
  $('form').each(function() {
    totalFields += $(this).find('input, textarea, select').not('[type="hidden"]').length;
  });
  
  // Calculate friction score
  var frictionScore = totalFields;
  var frictionLevel = 'Low';
  
  if (frictionScore >= config.frictionThreshold * 2) {
    frictionLevel = 'High';
  } else if (frictionScore >= config.frictionThreshold) {
    frictionLevel = 'Medium';
  }
  
  // Detect conversion intent in links
  var pricingDetected = false;
  var bookingDetected = false;
  var trialDetected = false;
  var purchaseDetected = false;
  
  var tripwireLinks = [];
  var ctaCount = 0;
  
  $('a').each(function() {
    var href = $(this).attr('href') || '';
    var text = $(this).text().toLowerCase();
    var hrefLower = href.toLowerCase();
    
    // Check pricing
    config.conversionKeywords.pricing.forEach(function(kw) {
      if (text.indexOf(kw) !== -1 || hrefLower.indexOf(kw) !== -1) {
        pricingDetected = true;
      }
    });
    
    // Check booking
    config.conversionKeywords.booking.forEach(function(kw) {
      if (text.indexOf(kw) !== -1 || hrefLower.indexOf(kw) !== -1) {
        bookingDetected = true;
        ctaCount++;
      }
    });
    
    // Check trial
    config.conversionKeywords.trial.forEach(function(kw) {
      if (text.indexOf(kw) !== -1 || hrefLower.indexOf(kw) !== -1) {
        trialDetected = true;
        tripwireLinks.push({ text: text, href: href });
      }
    });
    
    // Check purchase
    config.conversionKeywords.purchase.forEach(function(kw) {
      if (text.indexOf(kw) !== -1 || hrefLower.indexOf(kw) !== -1) {
        purchaseDetected = true;
        ctaCount++;
      }
    });
  });
  
  // Detect chat widgets
  var chatWidgetDetected = false;
  var chatTools = ['intercom', 'drift', 'livechat', 'zendesk', 'tawk', 'crisp'];
  
  $('script').each(function() {
    var src = $(this).attr('src') || '';
    chatTools.forEach(function(tool) {
      if (src.toLowerCase().indexOf(tool) !== -1) {
        chatWidgetDetected = true;
      }
    });
  });
  
  return {
    frictionScore: frictionScore,
    frictionLevel: frictionLevel,
    formCount: formCount,
    totalFields: totalFields,
    pricingDetected: pricingDetected,
    bookingDetected: bookingDetected,
    trialDetected: trialDetected,
    purchaseDetected: purchaseDetected,
    tripwireLinks: tripwireLinks.slice(0, 5), // Top 5
    ctaCount: ctaCount,
    chatWidgetDetected: chatWidgetDetected
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TECH STACK EXTRACTION (Cat III, VI - Systems & Security)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract tech stack, CMS, and security headers
 * @param {Object} $ - Cheerio instance
 * @param {string} html - Raw HTML
 * @param {Object} headers - HTTP headers
 * @returns {Object} Tech evidence
 */
function FORENS_extractTechStack($, html, headers) {
  var config = FET_Config().forensics;
  
  // Detect CMS
  var cms = 'Unknown';
  
  for (var cmsName in config.cmsSignatures) {
    var signatures = config.cmsSignatures[cmsName];
    for (var i = 0; i < signatures.length; i++) {
      if (html.indexOf(signatures[i]) !== -1) {
        cms = cmsName;
        break;
      }
    }
    if (cms !== 'Unknown') break;
  }
  
  // Detect tools from script sources
  var detectedTools = [];
  
  $('script').each(function() {
    var src = $(this).attr('src') || '';
    if (src.indexOf('google-analytics') !== -1 || src.indexOf('gtag') !== -1) {
      if (detectedTools.indexOf('Google Analytics') === -1) {
        detectedTools.push('Google Analytics');
      }
    }
    if (src.indexOf('facebook') !== -1 || src.indexOf('fbq') !== -1) {
      if (detectedTools.indexOf('Facebook Pixel') === -1) {
        detectedTools.push('Facebook Pixel');
      }
    }
  });
  
  // Security headers check
  var securityHeaders = {
    xFrameOptions: !!headers['X-Frame-Options'] || !!headers['x-frame-options'],
    xContentTypeOptions: !!headers['X-Content-Type-Options'] || !!headers['x-content-type-options'],
    strictTransportSecurity: !!headers['Strict-Transport-Security'] || !!headers['strict-transport-security'],
    xRobotsTag: headers['X-Robots-Tag'] || headers['x-robots-tag'] || ''
  };
  
  // Render risk (check for heavy JS frameworks)
  var renderRisk = html.indexOf('React') !== -1 || 
                   html.indexOf('Vue') !== -1 || 
                   html.indexOf('Angular') !== -1;
  
  // Indexability
  var robotsMeta = $('meta[name="robots"]').attr('content') || '';
  var indexability = robotsMeta.indexOf('noindex') === -1;
  
  // Canonical
  var canonicalPresent = $('link[rel="canonical"]').length > 0;
  
  // Analytics
  var analyticsPresent = detectedTools.length > 0;
  
  return {
    cms: cms,
    detectedTools: detectedTools,
    securityHeaders: securityHeaders,
    renderRisk: renderRisk,
    indexability: indexability,
    robotsMeta: robotsMeta,
    canonicalPresent: canonicalPresent,
    analyticsPresent: analyticsPresent
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADING STRUCTURE (Cat V - Structure Quality)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract heading structure WITH FULL TEXT
 * @param {Object} $ - Cheerio instance
 * @returns {Object} Heading evidence with full text array
 */
function FORENS_extractHeadingStructure($) {
  var h1Count = $('h1').length;
  var h2Count = $('h2').length;
  var h3Count = $('h3').length;
  var totalHeadings = $('h1, h2, h3, h4, h5, h6').length;
  
  // Check hierarchy validity
  var hierarchyValid = h1Count === 1 && h2Count > 0;
  
  // Extract full heading hierarchy with text
  var headings = [];
  $('h1, h2, h3, h4, h5, h6').each(function(index) {
    var level = this.tagName.toLowerCase();
    var text = $(this).text().trim();
    
    if (text && text.length > 0) {
      headings.push({
        level: level,
        text: text,
        position: index + 1
      });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPREHENSIVE KEYWORD EXTRACTION (Multi-Source)
  // ═══════════════════════════════════════════════════════════════════════════
  
  var stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                   'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
                   'will', 'would', 'should', 'could', 'may', 'might', 'can', 'in', 
                   'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'that',
                   'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
                   'we', 'you', 'your', 'our', 'his', 'her', 'he', 'she', 'what',
                   'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
                   'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
                   'than', 'too', 'very', 'can', 'just', 'not', 'now', 'only', 'own',
                   'same', 'so', 'then', 'there', 'up', 'out', 'if', 'about', 'into',
                   'through', 'during', 'before', 'after', 'above', 'below', 'between',
                   'under', 'again', 'further', 'once', 'here', 'off', 'over', 'because',
                   'while', 'where', 'when', 'any', 'both', 'each', 'more', 'most', 'other'];
  
  // SOURCE 1: Headings (highest weight)
  var headingText = '';
  $('h1, h2, h3, h4').each(function() {
    headingText += ' ' + $(this).text();
  });
  
  // SOURCE 2: Meta tags (high weight)
  var metaText = '';
  metaText += ' ' + ($('meta[name="description"]').attr('content') || '');
  metaText += ' ' + ($('meta[name="keywords"]').attr('content') || '');
  metaText += ' ' + ($('title').text() || '');
  metaText += ' ' + ($('meta[property="og:title"]').attr('content') || '');
  metaText += ' ' + ($('meta[property="og:description"]').attr('content') || '');
  
  // SOURCE 3: Body content (medium weight, first 5000 chars)
  var $bodyClone = $('body').clone();
  $bodyClone.find('script, style, nav, header, footer, aside').remove();
  var bodyText = $bodyClone.text().substring(0, 5000);
  
  // SOURCE 4: Link anchor texts (medium weight)
  var linkText = '';
  $('a').slice(0, 100).each(function() {
    linkText += ' ' + $(this).text();
  });
  
  // SOURCE 5: Alt texts (low weight)
  var altText = '';
  $('img[alt]').slice(0, 50).each(function() {
    altText += ' ' + $(this).attr('alt');
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SINGLE WORD KEYWORDS (with TF-IDF-like weighting)
  // ═══════════════════════════════════════════════════════════════════════════
  
  var wordCounts = {};
  var wordSources = {}; // Track where keywords come from
  
  // Function to extract and count words with source tracking
  function countWords(text, weight, source) {
    var words = text.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) || [];
    words.forEach(function(word) {
      if (stopWords.indexOf(word) === -1 && word.length >= 3 && word.length <= 20) {
        wordCounts[word] = (wordCounts[word] || 0) + weight;
        if (!wordSources[word]) wordSources[word] = [];
        if (wordSources[word].indexOf(source) === -1) {
          wordSources[word].push(source);
        }
      }
    });
  }
  
  // Weight by source importance
  countWords(headingText, 5, 'headings');     // Headings = 5x weight
  countWords(metaText, 4, 'meta');            // Meta tags = 4x weight
  countWords(linkText, 2, 'links');           // Links = 2x weight
  countWords(altText, 1.5, 'images');         // Alt text = 1.5x weight
  countWords(bodyText, 1, 'body');            // Body = 1x weight (base)
  
  // Sort single keywords by weighted frequency
  var topKeywords = Object.keys(wordCounts)
    .map(function(word) { 
      return { 
        keyword: word, 
        count: Math.round(wordCounts[word]),
        sources: wordSources[word]
      }; 
    })
    .sort(function(a, b) { return b.count - a.count; })
    .slice(0, 50); // Increased from 10 to 50
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LONG-TAIL KEYWORDS (2-4 word phrases)
  // ═══════════════════════════════════════════════════════════════════════════
  
  var phraseCounts = {};
  var phraseSources = {};
  
  function extractPhrases(text, weight, source) {
    // Clean text
    var cleaned = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    var words = cleaned.split(' ');
    
    // Extract 2-word phrases
    for (var i = 0; i < words.length - 1; i++) {
      if (stopWords.indexOf(words[i]) === -1 && 
          stopWords.indexOf(words[i+1]) === -1 &&
          words[i].length >= 3 && words[i+1].length >= 3) {
        var phrase = words[i] + ' ' + words[i+1];
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + weight;
        if (!phraseSources[phrase]) phraseSources[phrase] = [];
        if (phraseSources[phrase].indexOf(source) === -1) {
          phraseSources[phrase].push(source);
        }
      }
    }
    
    // Extract 3-word phrases
    for (var i = 0; i < words.length - 2; i++) {
      if (stopWords.indexOf(words[i]) === -1 && 
          stopWords.indexOf(words[i+2]) === -1 &&
          words[i].length >= 3 && words[i+2].length >= 3) {
        var phrase = words[i] + ' ' + words[i+1] + ' ' + words[i+2];
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + (weight * 1.2); // Bonus for longer phrases
        if (!phraseSources[phrase]) phraseSources[phrase] = [];
        if (phraseSources[phrase].indexOf(source) === -1) {
          phraseSources[phrase].push(source);
        }
      }
    }
  }
  
  // Extract phrases from high-value sources
  extractPhrases(headingText, 5, 'headings');
  extractPhrases(metaText, 4, 'meta');
  extractPhrases(linkText, 2, 'links');
  extractPhrases(bodyText.substring(0, 2000), 1, 'body'); // First 2000 chars for performance
  
  // Sort long-tail keywords
  var longTailKeywords = Object.keys(phraseCounts)
    .filter(function(phrase) { return phrase.split(' ').length >= 2; })
    .map(function(phrase) { 
      return { 
        keyword: phrase, 
        count: Math.round(phraseCounts[phrase]),
        sources: phraseSources[phrase],
        word_count: phrase.split(' ').length
      }; 
    })
    .sort(function(a, b) { return b.count - a.count; })
    .slice(0, 30); // Top 30 long-tail keywords
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SEMANTIC CLUSTERING (Group related keywords)
  // ═══════════════════════════════════════════════════════════════════════════
  
  var semanticClusters = {};
  
  // Define common SEO topic clusters
  var clusterPatterns = {
    'seo': ['seo', 'search', 'optimization', 'ranking', 'serp', 'google'],
    'content': ['content', 'article', 'blog', 'post', 'writing', 'copy'],
    'technical': ['technical', 'code', 'html', 'css', 'javascript', 'site', 'page'],
    'analytics': ['analytics', 'data', 'metrics', 'traffic', 'conversion', 'tracking'],
    'marketing': ['marketing', 'campaign', 'ads', 'advertising', 'promotion', 'brand'],
    'tools': ['tool', 'software', 'platform', 'app', 'plugin', 'extension'],
    'strategy': ['strategy', 'plan', 'growth', 'tactics', 'approach', 'method'],
    'ecommerce': ['ecommerce', 'shop', 'store', 'product', 'cart', 'checkout'],
    'local': ['local', 'location', 'map', 'nearby', 'area', 'city'],
    'social': ['social', 'facebook', 'twitter', 'linkedin', 'instagram', 'media']
  };
  
  topKeywords.forEach(function(kw) {
    var clustered = false;
    for (var cluster in clusterPatterns) {
      var patterns = clusterPatterns[cluster];
      for (var i = 0; i < patterns.length; i++) {
        if (kw.keyword.indexOf(patterns[i]) !== -1) {
          if (!semanticClusters[cluster]) semanticClusters[cluster] = [];
          semanticClusters[cluster].push(kw.keyword);
          clustered = true;
          break;
        }
      }
      if (clustered) break;
    }
    if (!clustered) {
      if (!semanticClusters['other']) semanticClusters['other'] = [];
      semanticClusters['other'].push(kw.keyword);
    }
  });
  
  return {
    h1Count: h1Count,
    h2Count: h2Count,
    h3Count: h3Count,
    totalHeadings: totalHeadings,
    hierarchyValid: hierarchyValid,
    keywordDensity: wordCounts,
    
    // ENHANCED KEYWORD DATA
    topKeywords: topKeywords,              // Top 50 single keywords with sources
    longTailKeywords: longTailKeywords,    // Top 30 2-4 word phrases
    semanticClusters: semanticClusters,    // Keywords grouped by topic
    totalUniqueKeywords: Object.keys(wordCounts).length,
    totalUniquePhrases: Object.keys(phraseCounts).length,
    
    headings: headings // FULL HEADING HIERARCHY WITH TEXT
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LINK GRAPH (Cat VII - Internal Linking)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract internal link graph
 * @param {Object} $ - Cheerio instance
 * @param {string} baseUrl - Base URL for relative links
 * @returns {Object} Link evidence
 */
function FORENS_extractLinkGraph($, baseUrl) {
  var domain = extractDomain_(baseUrl);
  var internalLinks = [];
  var externalLinks = [];
  
  $('a[href]').each(function() {
    var href = $(this).attr('href');
    var text = $(this).text().trim();
    
    if (!href || href.indexOf('#') === 0 || href.indexOf('javascript:') === 0) {
      return; // Skip anchors and JS links
    }
    
    var isInternal = href.indexOf(domain) !== -1 || 
                     href.indexOf('//') === -1 || 
                     href.indexOf('/' + domain) === 0;
    
    if (isInternal) {
      internalLinks.push({ href: href, anchor: text });
    } else {
      externalLinks.push({ href: href, anchor: text });
    }
  });
  
  return {
    internalCount: internalLinks.length,
    externalCount: externalLinks.length,
    internalLinks: internalLinks.slice(0, 50), // Top 50
    externalLinks: externalLinks.slice(0, 20)  // Top 20
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// VELOCITY EXTRACTION (Cat IV - Content Freshness)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract content velocity from sitemap
 * @param {string} domain - Domain to check
 * @returns {Object} Velocity evidence
 */
function FORENS_extractVelocity(domain) {
  try {
    var sitemapUrl = 'https://' + domain + '/sitemap.xml';
    var response = UrlFetchApp.fetch(sitemapUrl, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      return {
        newContent30d: 0,
        newContent90d: 0,
        lastPublished: null
      };
    }
    
    var xml = response.getContentText();
    var now = new Date().getTime();
    var thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    var ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    
    var lastmodMatches = xml.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
    var newContent30d = 0;
    var newContent90d = 0;
    var lastPublished = null;
    
    lastmodMatches.forEach(function(match) {
      var dateStr = match.replace(/<\/?lastmod>/g, '');
      var date = new Date(dateStr).getTime();
      
      if (date > thirtyDaysAgo) newContent30d++;
      if (date > ninetyDaysAgo) newContent90d++;
      
      if (!lastPublished || date > new Date(lastPublished).getTime()) {
        lastPublished = dateStr;
      }
    });
    
    return {
      newContent30d: newContent30d,
      newContent90d: newContent90d,
      lastPublished: lastPublished
    };
    
  } catch (e) {
    return {
      newContent30d: 0,
      newContent90d: 0,
      lastPublished: null
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIQUENESS ANALYSIS (Cat IV - Content Gaps)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze content uniqueness vs competitors (Jaccard Index)
 * @param {string} html - Target HTML
 * @param {string[]} competitorUrls - Competitor URLs
 * @returns {Object} Uniqueness evidence
 */
function FORENS_analyzeUniqueness(html, competitorUrls) {
  if (competitorUrls.length === 0) {
    return {
      jaccardScore: 100,
      gaps: [],
      overlapKeywords: []
    };
  }
  
  // Extract keywords from target
  var targetText = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  var targetWords = targetText.split(/\s+/).filter(function(w) { return w.length > 4; });
  var targetSet = {};
  
  targetWords.forEach(function(w) { targetSet[w] = true; });
  
  // Compare with first competitor only (to save execution time)
  var compUrl = competitorUrls[0];
  
  try {
    var compResponse = UrlFetchApp.fetch(compUrl, { muteHttpExceptions: true });
    if (compResponse.getResponseCode() !== 200) {
      return {
        jaccardScore: 100,
        gaps: [],
        overlapKeywords: []
      };
    }
    
    var compHtml = compResponse.getContentText();
    var compText = compHtml.replace(/<[^>]+>/g, ' ').toLowerCase();
    var compWords = compText.split(/\s+/).filter(function(w) { return w.length > 4; });
    var compSet = {};
    
    compWords.forEach(function(w) { compSet[w] = true; });
    
    // Calculate Jaccard Index
    var intersection = 0;
    var union = Object.keys(targetSet).length;
    var overlapKeywords = [];
    
    for (var word in targetSet) {
      if (compSet[word]) {
        intersection++;
        overlapKeywords.push(word);
      }
    }
    
    for (var word in compSet) {
      if (!targetSet[word]) {
        union++;
      }
    }
    
    var jaccardScore = Math.round((1 - (intersection / union)) * 100);
    
    // Find gaps (words in competitor but not in target)
    var gaps = [];
    for (var word in compSet) {
      if (!targetSet[word] && word.length > 5) {
        gaps.push(word);
      }
    }
    
    return {
      jaccardScore: jaccardScore,
      gaps: gaps.slice(0, 20), // Top 20 gaps
      overlapKeywords: overlapKeywords.slice(0, 20) // Top 20 overlaps
    };
    
  } catch (e) {
    return {
      jaccardScore: 100,
      gaps: [],
      overlapKeywords: []
    };
  }
}

/**
 * FT_LocalSEO.gs - Local SEO Analysis
 * SerpifAI V8 - Local search optimization
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// LOCAL SEO ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze local SEO factors
 */
function FT_analyzeLocalSEO(params) {
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
    
    // Extract NAP (Name, Address, Phone)
    const nap = extractNAP(html);
    
    // Check for local schema
    const localSchema = checkLocalSchema(html);
    
    // Check for embedded map
    const hasMap = checkForMap(html);
    
    // Check for local keywords
    const localKeywords = findLocalKeywords(html);
    
    // Calculate local SEO score
    const score = calculateLocalScore(nap, localSchema, hasMap, localKeywords);
    
    return {
      ok: true,
      url: url,
      score: score,
      nap: nap,
      hasLocalSchema: localSchema.found,
      schemaType: localSchema.type,
      hasEmbeddedMap: hasMap,
      localKeywords: localKeywords,
      recommendations: getLocalRecommendations(nap, localSchema, hasMap)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract NAP information
 */
function extractNAP(html) {
  const nap = {
    name: null,
    address: null,
    phone: null,
    email: null
  };
  
  // Try to find phone number
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\+1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /tel:([^"'\s]+)/gi
  ];
  
  for (let i = 0; i < phonePatterns.length; i++) {
    const match = html.match(phonePatterns[i]);
    if (match && match[0]) {
      nap.phone = match[0].replace('tel:', '');
      break;
    }
  }
  
  // Try to find email
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    nap.email = emailMatch[0];
  }
  
  // Try to find address patterns
  const addressPatterns = [
    /\d{1,5}\s[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[,\s]+[\w\s]+,\s*[A-Z]{2}\s*\d{5}/gi,
    /<address[^>]*>([\s\S]*?)<\/address>/gi
  ];
  
  for (let i = 0; i < addressPatterns.length; i++) {
    const match = html.match(addressPatterns[i]);
    if (match && match[0]) {
      nap.address = match[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      break;
    }
  }
  
  // Try schema for business name
  const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);
  if (nameMatch) {
    nap.name = nameMatch[1];
  }
  
  return nap;
}

/**
 * Check for local business schema
 */
function checkLocalSchema(html) {
  const localTypes = [
    'LocalBusiness',
    'Restaurant',
    'Store',
    'MedicalBusiness',
    'LegalService',
    'FinancialService',
    'RealEstateAgent',
    'Dentist',
    'Attorney',
    'Hotel'
  ];
  
  for (let i = 0; i < localTypes.length; i++) {
    if (html.indexOf('"@type"') >= 0 && html.indexOf('"' + localTypes[i] + '"') >= 0) {
      return { found: true, type: localTypes[i] };
    }
  }
  
  return { found: false, type: null };
}

/**
 * Check for embedded map
 */
function checkForMap(html) {
  const mapIndicators = [
    'google.com/maps',
    'maps.google.com',
    'googleapis.com/maps',
    'leaflet',
    'mapbox',
    'openstreetmap'
  ];
  
  for (let i = 0; i < mapIndicators.length; i++) {
    if (html.toLowerCase().indexOf(mapIndicators[i]) >= 0) {
      return true;
    }
  }
  
  return false;
}

/**
 * Find local keywords
 */
function findLocalKeywords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  const localTerms = [];
  
  // Common local modifiers
  const modifiers = ['near me', 'local', 'nearby', 'in my area'];
  modifiers.forEach(function(mod) {
    if (text.indexOf(mod) >= 0) {
      localTerms.push(mod);
    }
  });
  
  // City/state patterns (simplified)
  const cityMatch = text.match(/\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose)\b/gi);
  if (cityMatch) {
    localTerms.push.apply(localTerms, [...new Set(cityMatch)]);
  }
  
  return localTerms;
}

/**
 * Calculate local SEO score
 */
function calculateLocalScore(nap, schema, hasMap, keywords) {
  let score = 0;
  
  // NAP completeness (40 points)
  if (nap.name) score += 10;
  if (nap.address) score += 15;
  if (nap.phone) score += 10;
  if (nap.email) score += 5;
  
  // Local schema (30 points)
  if (schema.found) score += 30;
  
  // Map (15 points)
  if (hasMap) score += 15;
  
  // Local keywords (15 points)
  if (keywords.length > 0) score += Math.min(15, keywords.length * 5);
  
  return Math.min(100, score);
}

/**
 * Get local SEO recommendations
 */
function getLocalRecommendations(nap, schema, hasMap) {
  const recs = [];
  
  if (!nap.name) {
    recs.push({
      priority: 'high',
      issue: 'Business name not clearly displayed',
      fix: 'Add business name prominently on the page'
    });
  }
  
  if (!nap.address) {
    recs.push({
      priority: 'high',
      issue: 'No address found',
      fix: 'Add full business address including city, state, and ZIP'
    });
  }
  
  if (!nap.phone) {
    recs.push({
      priority: 'high',
      issue: 'No phone number found',
      fix: 'Add phone number in a clickable format'
    });
  }
  
  if (!schema.found) {
    recs.push({
      priority: 'high',
      issue: 'Missing LocalBusiness schema',
      fix: 'Add LocalBusiness structured data markup'
    });
  }
  
  if (!hasMap) {
    recs.push({
      priority: 'medium',
      issue: 'No embedded map found',
      fix: 'Embed a Google Map showing your location'
    });
  }
  
  return recs;
}

/**
 * Generate local business schema
 */
function FT_generateLocalSchema(params) {
  const name = params.name;
  const address = params.address || {};
  const phone = params.phone;
  const url = params.url;
  const type = params.type || 'LocalBusiness';
  const openingHours = params.openingHours || [];
  
  if (!name) {
    return { ok: false, error: 'Business name required' };
  }
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: name
  };
  
  if (url) schema.url = url;
  if (phone) schema.telephone = phone;
  
  if (address.street || address.city) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: address.street || '',
      addressLocality: address.city || '',
      addressRegion: address.state || '',
      postalCode: address.zip || '',
      addressCountry: address.country || 'US'
    };
  }
  
  if (openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours.map(function(h) {
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes
      };
    });
  }
  
  const jsonLd = '<script type="application/ld+json">\n' +
    JSON.stringify(schema, null, 2) +
    '\n</script>';
  
  return {
    ok: true,
    schema: schema,
    jsonLd: jsonLd
  };
}

/**
 * Check NAP consistency
 */
function FT_checkNAPConsistency(params) {
  const urls = params.urls || [];
  const expectedNAP = params.expectedNAP || {};
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  urls.forEach(function(url) {
    try {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      const html = response.getContentText();
      const nap = extractNAP(html);
      
      const issues = [];
      
      if (expectedNAP.name && nap.name && nap.name.toLowerCase() !== expectedNAP.name.toLowerCase()) {
        issues.push('Name mismatch');
      }
      
      if (expectedNAP.phone && nap.phone) {
        const normalizedExpected = expectedNAP.phone.replace(/\D/g, '');
        const normalizedFound = nap.phone.replace(/\D/g, '');
        if (normalizedExpected !== normalizedFound) {
          issues.push('Phone mismatch');
        }
      }
      
      results.push({
        url: url,
        napFound: nap,
        isConsistent: issues.length === 0,
        issues: issues
      });
      
      Utilities.sleep(200);
    } catch (err) {
      results.push({
        url: url,
        error: err.message
      });
    }
  });
  
  const consistentCount = results.filter(function(r) { return r.isConsistent; }).length;
  
  return {
    ok: true,
    results: results,
    consistencyScore: Math.round((consistentCount / results.length) * 100)
  };
}

/**
 * Analyze local citations
 */
function FT_analyzeLocalCitations(params) {
  const businessName = params.businessName;
  
  if (!businessName) {
    return { ok: false, error: 'Business name required' };
  }
  
  // List of common local directories to check
  const directories = [
    { name: 'Google Business Profile', domain: 'google.com/maps' },
    { name: 'Yelp', domain: 'yelp.com' },
    { name: 'Facebook', domain: 'facebook.com' },
    { name: 'Yellow Pages', domain: 'yellowpages.com' },
    { name: 'Bing Places', domain: 'bingplaces.com' },
    { name: 'Apple Maps', domain: 'maps.apple.com' },
    { name: 'Better Business Bureau', domain: 'bbb.org' },
    { name: 'Foursquare', domain: 'foursquare.com' }
  ];
  
  return {
    ok: true,
    businessName: businessName,
    suggestedDirectories: directories,
    note: 'Manual verification required for citation status'
  };
}

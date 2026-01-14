/**
 * FT_Structured.gs - Structured Data Analysis
 * SerpifAI V8 - Schema.org and JSON-LD analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// STRUCTURED DATA ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze structured data on page
 */
function FT_analyzeStructuredData(params) {
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
    
    // Extract JSON-LD
    const jsonLd = extractJsonLd(html);
    
    // Extract Microdata
    const microdata = extractMicrodata(html);
    
    // Extract RDFa
    const rdfa = extractRDFa(html);
    
    // Count total schemas
    const totalSchemas = jsonLd.length + microdata.length + rdfa.length;
    
    // Get unique types
    const types = new Set();
    jsonLd.forEach(function(s) { if (s['@type']) types.add(s['@type']); });
    
    return {
      ok: true,
      url: url,
      totalSchemas: totalSchemas,
      jsonLd: jsonLd,
      microdata: microdata,
      rdfa: rdfa,
      types: Array.from(types),
      hasSchema: totalSchemas > 0,
      recommendations: getSchemaRecommendations(jsonLd, url)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract JSON-LD schemas
 */
function extractJsonLd(html) {
  const schemas = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = pattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      
      // Handle @graph
      if (data['@graph']) {
        schemas.push.apply(schemas, data['@graph']);
      } else if (Array.isArray(data)) {
        schemas.push.apply(schemas, data);
      } else {
        schemas.push(data);
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }
  
  return schemas;
}

/**
 * Extract Microdata (simplified)
 */
function extractMicrodata(html) {
  const microdata = [];
  const pattern = /itemscope[^>]+itemtype=["']([^"']+)["']/gi;
  let match;
  
  while ((match = pattern.exec(html)) !== null) {
    microdata.push({
      type: match[1],
      format: 'microdata'
    });
  }
  
  return microdata;
}

/**
 * Extract RDFa (simplified)
 */
function extractRDFa(html) {
  const rdfa = [];
  const pattern = /typeof=["']([^"']+)["']/gi;
  let match;
  
  while ((match = pattern.exec(html)) !== null) {
    rdfa.push({
      type: match[1],
      format: 'rdfa'
    });
  }
  
  return rdfa;
}

/**
 * Get schema recommendations
 */
function getSchemaRecommendations(schemas, url) {
  const recommendations = [];
  const types = schemas.map(function(s) { return s['@type']; }).filter(function(t) { return t; });
  
  // Check for common schemas
  if (!types.includes('WebSite') && !types.includes('WebPage')) {
    recommendations.push({
      schema: 'WebSite',
      reason: 'Add WebSite schema for sitelinks search box eligibility'
    });
  }
  
  if (!types.includes('Organization') && !types.includes('LocalBusiness')) {
    recommendations.push({
      schema: 'Organization',
      reason: 'Add Organization schema for knowledge panel eligibility'
    });
  }
  
  if (!types.includes('BreadcrumbList')) {
    recommendations.push({
      schema: 'BreadcrumbList',
      reason: 'Add BreadcrumbList for enhanced breadcrumb display in SERPs'
    });
  }
  
  // Check for Article on content pages
  if (url.includes('/blog') || url.includes('/article') || url.includes('/post')) {
    if (!types.includes('Article') && !types.includes('BlogPosting') && !types.includes('NewsArticle')) {
      recommendations.push({
        schema: 'Article',
        reason: 'Add Article schema for content pages'
      });
    }
  }
  
  return recommendations;
}

/**
 * Validate schema structure
 */
function FT_validateSchema(params) {
  const schema = params.schema;
  
  if (!schema) {
    return { ok: false, error: 'Schema required' };
  }
  
  let schemaObj;
  try {
    schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema;
  } catch (e) {
    return { ok: false, error: 'Invalid JSON: ' + e.message };
  }
  
  const errors = [];
  const warnings = [];
  
  // Check required fields
  if (!schemaObj['@context']) {
    errors.push('Missing @context');
  } else if (!schemaObj['@context'].includes('schema.org')) {
    warnings.push('@context should be https://schema.org');
  }
  
  if (!schemaObj['@type']) {
    errors.push('Missing @type');
  }
  
  // Type-specific validation
  const type = schemaObj['@type'];
  
  if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    if (!schemaObj.headline) errors.push('Article: missing headline');
    if (!schemaObj.author) warnings.push('Article: missing author');
    if (!schemaObj.datePublished) warnings.push('Article: missing datePublished');
    if (!schemaObj.image) warnings.push('Article: missing image');
  }
  
  if (type === 'Product') {
    if (!schemaObj.name) errors.push('Product: missing name');
    if (!schemaObj.offers) warnings.push('Product: missing offers');
  }
  
  if (type === 'LocalBusiness') {
    if (!schemaObj.name) errors.push('LocalBusiness: missing name');
    if (!schemaObj.address) warnings.push('LocalBusiness: missing address');
  }
  
  if (type === 'FAQPage') {
    if (!schemaObj.mainEntity || !Array.isArray(schemaObj.mainEntity)) {
      errors.push('FAQPage: missing mainEntity array');
    }
  }
  
  return {
    ok: true,
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    type: type
  };
}

/**
 * Generate common schema types
 */
function FT_generateSchema(params) {
  const type = params.type;
  const data = params.data || {};
  
  const generators = {
    WebSite: generateWebSiteSchema,
    Organization: generateOrganizationSchema,
    BreadcrumbList: generateBreadcrumbSchema,
    Article: generateArticleSchema,
    Product: generateProductSchema,
    FAQPage: generateFAQSchema
  };
  
  const generator = generators[type];
  if (!generator) {
    return { ok: false, error: 'Unknown schema type: ' + type };
  }
  
  const schema = generator(data);
  
  return {
    ok: true,
    schema: schema,
    jsonLd: '<script type="application/ld+json">\n' + JSON.stringify(schema, null, 2) + '\n</script>'
  };
}

/**
 * Generate WebSite schema
 */
function generateWebSiteSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name || '',
    url: data.url || '',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: (data.url || '') + '/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate Organization schema
 */
function FT_Struct_generateOrg(data) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name || '',
    url: data.url || ''
  };
  
  if (data.logo) schema.logo = data.logo;
  if (data.phone) schema.telephone = data.phone;
  if (data.email) schema.email = data.email;
  
  if (data.socialProfiles && data.socialProfiles.length > 0) {
    schema.sameAs = data.socialProfiles;
  }
  
  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbSchema(data) {
  const items = (data.items || []).map(function(item, idx) {
    return {
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    };
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

/**
 * Generate Article schema
 */
function FT_Struct_generateArticle(data) {
  return {
    '@context': 'https://schema.org',
    '@type': data.articleType || 'Article',
    headline: data.headline || '',
    description: data.description || '',
    image: data.image || '',
    author: {
      '@type': 'Person',
      name: data.authorName || ''
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisherName || '',
      logo: {
        '@type': 'ImageObject',
        url: data.publisherLogo || ''
      }
    },
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || new Date().toISOString()
  };
}

/**
 * Generate Product schema
 */
function FT_Struct_generateProduct(data) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name || '',
    description: data.description || ''
  };
  
  if (data.image) schema.image = data.image;
  if (data.brand) schema.brand = { '@type': 'Brand', name: data.brand };
  if (data.sku) schema.sku = data.sku;
  
  if (data.price) {
    schema.offers = {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'USD',
      availability: 'https://schema.org/' + (data.availability || 'InStock')
    };
  }
  
  return schema;
}

/**
 * Generate FAQ schema
 */
function FT_Struct_generateFAQ(data) {
  const questions = (data.questions || []).map(function(q) {
    return {
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    };
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions
  };
}

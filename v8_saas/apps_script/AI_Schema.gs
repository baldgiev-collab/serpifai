/**
 * AI_Schema.gs - Schema Markup Generator
 * SerpifAI V8 - Generate structured data markup
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SCHEMA GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate schema markup
 */
function AI_generateSchema(params) {
  const type = params.type;
  const data = params.data || {};
  
  if (!type) {
    return { ok: false, error: 'Schema type is required' };
  }
  
  try {
    let schema;
    
    switch (type) {
      case 'Article':
        schema = generateArticleSchema(data);
        break;
      case 'LocalBusiness':
        schema = generateLocalBusinessSchema(data);
        break;
      case 'Product':
        schema = generateProductSchema(data);
        break;
      case 'FAQPage':
        schema = generateFAQSchema(data);
        break;
      case 'HowTo':
        schema = generateHowToSchema(data);
        break;
      case 'Review':
        schema = generateReviewSchema(data);
        break;
      case 'Event':
        schema = generateEventSchema(data);
        break;
      case 'Organization':
        schema = generateOrganizationSchema(data);
        break;
      default:
        return { ok: false, error: 'Unknown schema type: ' + type };
    }
    
    return {
      ok: true,
      schema: JSON.stringify(schema, null, 2)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate Article schema
 */
function AI_Schema_generateArticle(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline || '',
    description: data.description || '',
    image: data.image ? [data.image] : [],
    author: {
      '@type': 'Person',
      name: data.author || ''
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisher || '',
      logo: {
        '@type': 'ImageObject',
        url: data.logo || ''
      }
    },
    datePublished: data.datePublished || '',
    dateModified: data.dateModified || data.datePublished || ''
  };
}

/**
 * Generate LocalBusiness schema
 */
function generateLocalBusinessSchema(data) {
  const bizType = data.bizType || 'LocalBusiness';
  
  return {
    '@context': 'https://schema.org',
    '@type': bizType,
    name: data.name || '',
    telephone: data.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.street || '',
      addressLocality: data.city || '',
      addressRegion: data.state || '',
      postalCode: data.postal || '',
      addressCountry: 'US'
    },
    url: data.url || '',
    image: data.image || ''
  };
}

/**
 * Generate Product schema
 */
function AI_Schema_generateProduct(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name || '',
    description: data.description || '',
    image: data.image || '',
    sku: data.sku || '',
    offers: {
      '@type': 'Offer',
      price: data.price || '',
      priceCurrency: data.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: data.url || ''
    }
  };
}

/**
 * Generate FAQ schema
 */
function AI_Schema_generateFAQ(data) {
  const faqs = data.faqs || [];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.filter(function(faq) {
      return faq.q && faq.a;
    }).map(function(faq) {
      return {
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a
        }
      };
    })
  };
}

/**
 * Generate HowTo schema
 */
function generateHowToSchema(data) {
  const steps = data.steps || [];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name || '',
    description: data.description || '',
    step: steps.filter(function(s) { return s; }).map(function(text, index) {
      return {
        '@type': 'HowToStep',
        position: index + 1,
        text: text
      };
    })
  };
}

/**
 * Generate Review schema
 */
function generateReviewSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: data.itemName || ''
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.rating || 5,
      bestRating: 5
    },
    reviewBody: data.reviewBody || '',
    author: {
      '@type': 'Person',
      name: data.author || ''
    }
  };
}

/**
 * Generate Event schema
 */
function generateEventSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    location: {
      '@type': 'Place',
      name: data.location || ''
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
  };
}

/**
 * Generate Organization schema
 */
function AI_Schema_generateOrg(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name || '',
    url: data.url || '',
    logo: data.logo || '',
    description: data.description || '',
    sameAs: []
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SCHEMA HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate breadcrumb schema
 */
function AI_generateBreadcrumbSchema(params) {
  const items = params.items || [];
  
  if (items.length === 0) {
    return { ok: false, error: 'Breadcrumb items required' };
  }
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(function(item, index) {
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      };
    })
  };
  
  return {
    ok: true,
    schema: JSON.stringify(schema, null, 2)
  };
}

/**
 * Generate aggregate rating schema
 */
function AI_generateRatingSchema(params) {
  const ratingValue = params.ratingValue || 4.5;
  const reviewCount = params.reviewCount || 100;
  const itemName = params.itemName || '';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      bestRating: 5,
      worstRating: 1,
      reviewCount: reviewCount
    }
  };
  
  return {
    ok: true,
    schema: JSON.stringify(schema, null, 2)
  };
}

/**
 * Generate video schema
 */
function AI_generateVideoSchema(params) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: params.name || '',
    description: params.description || '',
    thumbnailUrl: params.thumbnail || '',
    uploadDate: params.uploadDate || new Date().toISOString(),
    duration: params.duration || 'PT0M0S',
    contentUrl: params.contentUrl || '',
    embedUrl: params.embedUrl || ''
  };
  
  return {
    ok: true,
    schema: JSON.stringify(schema, null, 2)
  };
}

/**
 * Validate schema structure
 */
function AI_validateSchemaStructure(params) {
  const schemaString = params.schema;
  
  try {
    const schema = JSON.parse(schemaString);
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!schema['@context']) {
      errors.push('Missing @context');
    }
    
    if (!schema['@type']) {
      errors.push('Missing @type');
    }
    
    // Type-specific validation
    const type = schema['@type'];
    
    if (type === 'Article') {
      if (!schema.headline) warnings.push('Article should have headline');
      if (!schema.author) warnings.push('Article should have author');
      if (!schema.datePublished) warnings.push('Article should have datePublished');
    }
    
    if (type === 'Product') {
      if (!schema.name) errors.push('Product must have name');
      if (!schema.offers) warnings.push('Product should have offers');
    }
    
    if (type === 'LocalBusiness') {
      if (!schema.name) errors.push('LocalBusiness must have name');
      if (!schema.address) warnings.push('LocalBusiness should have address');
    }
    
    return {
      ok: true,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  } catch (err) {
    return {
      ok: false,
      valid: false,
      errors: ['Invalid JSON: ' + err.message]
    };
  }
}

/**
 * Merge multiple schemas
 */
function AI_mergeSchemas(params) {
  const schemas = params.schemas || [];
  
  if (schemas.length === 0) {
    return { ok: false, error: 'No schemas provided' };
  }
  
  try {
    const merged = {
      '@context': 'https://schema.org',
      '@graph': schemas.map(function(s) {
        const parsed = typeof s === 'string' ? JSON.parse(s) : s;
        delete parsed['@context'];
        return parsed;
      })
    };
    
    return {
      ok: true,
      schema: JSON.stringify(merged, null, 2)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract schema from URL
 */
function AI_extractSchemaFromUrl(params) {
  const url = params.url;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    
    // Find JSON-LD scripts
    const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas = [];
    let match;
    
    while ((match = pattern.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        schemas.push(parsed);
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    return {
      ok: true,
      url: url,
      schemas: schemas,
      count: schemas.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

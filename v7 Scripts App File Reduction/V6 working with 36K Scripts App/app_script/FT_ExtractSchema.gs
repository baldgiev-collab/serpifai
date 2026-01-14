/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ExtractSchema.gs - ELITE STRUCTURED DATA ANALYZER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Comprehensive Schema.org Extraction
 * 
 * EXTRACTS ALL SCHEMA TYPES:
 * ✓ Organization, LocalBusiness, Person
 * ✓ Article, BlogPosting, NewsArticle
 * ✓ Product, Offer, Review, AggregateRating
 * ✓ BreadcrumbList, WebPage, WebSite
 * ✓ Event, Recipe, HowTo, FAQ, Q&A
 * ✓ Video, Image, AudioObject
 * ✓ JobPosting, Course, Book
 * 
 * VALIDATION & SCORING:
 * ✓ Required property checking
 * ✓ Schema completeness scoring (0-100)
 * ✓ Google Rich Results eligibility
 * ✓ Best practices compliance
 * 
 * @module SchemaAnalyzer
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Extract ALL structured data with comprehensive validation
 * @param {string} html - HTML content
 * @return {object} Complete schema analysis
 */
function FT_extractSchema(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var startTime = new Date().getTime();
  
  try {
    var schemas = [];
    var types = [];
    var errors = [];
    
    // Extract JSON-LD schemas
    var jsonldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    var match;
    var schemaIndex = 0;
    
    while ((match = jsonldRegex.exec(html)) !== null) {
      schemaIndex++;
      var jsonString = match[1].trim();
      
      try {
        var parsed = JSON.parse(jsonString);
        
        // Handle @graph structure
        if (parsed['@graph']) {
          parsed['@graph'].forEach(function(item) {
            processSchemaItem(item, schemaIndex, schemas, types);
          });
        } else {
          processSchemaItem(parsed, schemaIndex, schemas, types);
        }
        
      } catch (e) {
        errors.push({
          index: schemaIndex,
          error: 'Invalid JSON: ' + String(e),
          snippet: jsonString.substring(0, 100) + '...'
        });
      }
    }
    
    // Extract Microdata (schema.org via itemscope)
    var microdataCount = (html.match(/itemscope/gi) || []).length;
    
    // Extract RDFa (typeof attribute)
    var rdfaCount = (html.match(/typeof=/gi) || []).length;
    
    // Validation checks
    var validation = validateSchemas(schemas);
    
    // Scoring
    var score = calculateSchemaScore(schemas, validation);
    
    // Get recommendations
    var recommendations = getSchemaRecommendations(schemas, validation);
    
    return {
      ok: true,
      
      // Count
      count: schemas.length,
      jsonLdCount: schemas.length,
      microdataCount: microdataCount,
      rdfaCount: rdfaCount,
      
      // Data
      schemas: schemas,
      types: Array.from(new Set(types)),
      errors: errors,
      
      // Validation
      validation: validation,
      
      // Scoring
      score: score.total,
      grade: score.grade,
      breakdown: score.breakdown,
      
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
 * Process individual schema item
 */
function processSchemaItem(item, index, schemas, types) {
  if (!item || typeof item !== 'object') return;
  
  var schemaType = item['@type'];
  
  // Handle array of types
  if (Array.isArray(schemaType)) {
    schemaType = schemaType[0];
  }
  
  if (!schemaType) return;
  
  // Normalize type
  var normalizedType = schemaType.replace(/^https?:\/\/schema\.org\//, '');
  
  schemas.push({
    index: index,
    type: normalizedType,
    data: item,
    required: getRequiredProperties(normalizedType),
    optional: getOptionalProperties(normalizedType),
    completeness: calculateCompleteness(item, normalizedType)
  });
  
  types.push(normalizedType);
}

/**
 * Validate all schemas
 */
function validateSchemas(schemas) {
  var validation = {
    hasSchema: schemas.length > 0,
    hasOrganization: false,
    hasLocalBusiness: false,
    hasPerson: false,
    hasWebPage: false,
    hasWebSite: false,
    hasArticle: false,
    hasBlogPosting: false,
    hasNewsArticle: false,
    hasBreadcrumb: false,
    hasProduct: false,
    hasOffer: false,
    hasReview: false,
    hasAggregateRating: false,
    hasEvent: false,
    hasRecipe: false,
    hasHowTo: false,
    hasFAQ: false,
    hasQAPage: false,
    hasVideo: false,
    hasImage: false,
    hasJobPosting: false,
    hasCourse: false,
    hasBook: false,
    hasContext: false,
    allHaveContext: true,
    richResultsEligible: false
  };
  
  schemas.forEach(function(schema) {
    var type = schema.type;
    
    // Check @context
    if (schema.data['@context']) {
      validation.hasContext = true;
    } else {
      validation.allHaveContext = false;
    }
    
    // Type checks
    if (type === 'Organization') validation.hasOrganization = true;
    if (type === 'LocalBusiness') validation.hasLocalBusiness = true;
    if (type === 'Person') validation.hasPerson = true;
    if (type === 'WebPage') validation.hasWebPage = true;
    if (type === 'WebSite') validation.hasWebSite = true;
    if (type === 'Article') validation.hasArticle = true;
    if (type === 'BlogPosting') validation.hasBlogPosting = true;
    if (type === 'NewsArticle') validation.hasNewsArticle = true;
    if (type === 'BreadcrumbList') validation.hasBreadcrumb = true;
    if (type === 'Product') validation.hasProduct = true;
    if (type === 'Offer') validation.hasOffer = true;
    if (type === 'Review') validation.hasReview = true;
    if (type === 'AggregateRating') validation.hasAggregateRating = true;
    if (type === 'Event') validation.hasEvent = true;
    if (type === 'Recipe') validation.hasRecipe = true;
    if (type === 'HowTo') validation.hasHowTo = true;
    if (type === 'FAQPage') validation.hasFAQ = true;
    if (type === 'QAPage') validation.hasQAPage = true;
    if (type === 'VideoObject') validation.hasVideo = true;
    if (type === 'ImageObject') validation.hasImage = true;
    if (type === 'JobPosting') validation.hasJobPosting = true;
    if (type === 'Course') validation.hasCourse = true;
    if (type === 'Book') validation.hasBook = true;
  });
  
  // Rich results eligibility (simplified check)
  validation.richResultsEligible = 
    (validation.hasArticle || validation.hasBlogPosting || validation.hasNewsArticle) ||
    validation.hasProduct ||
    validation.hasRecipe ||
    validation.hasEvent ||
    validation.hasHowTo ||
    validation.hasFAQ ||
    validation.hasJobPosting ||
    validation.hasVideo;
  
  return validation;
}

/**
 * Calculate schema completeness
 */
function calculateCompleteness(data, type) {
  var required = getRequiredProperties(type);
  var optional = getOptionalProperties(type);
  
  if (required.length === 0) {
    return { percent: 100, hasAllRequired: true };
  }
  
  var requiredCount = 0;
  var optionalCount = 0;
  
  required.forEach(function(prop) {
    if (data[prop] !== undefined) requiredCount++;
  });
  
  optional.forEach(function(prop) {
    if (data[prop] !== undefined) optionalCount++;
  });
  
  var hasAllRequired = requiredCount === required.length;
  var percent = Math.round(
    ((requiredCount / required.length) * 70 + 
     (optionalCount / optional.length) * 30)
  );
  
  return {
    percent: percent,
    hasAllRequired: hasAllRequired,
    requiredCount: requiredCount,
    requiredTotal: required.length,
    optionalCount: optionalCount,
    optionalTotal: optional.length
  };
}

/**
 * Get required properties for schema type
 */
function getRequiredProperties(type) {
  var required = {
    'Organization': ['name', 'url'],
    'LocalBusiness': ['name', 'address', 'telephone'],
    'Person': ['name'],
    'Article': ['headline', 'author', 'datePublished', 'image'],
    'BlogPosting': ['headline', 'author', 'datePublished', 'image'],
    'NewsArticle': ['headline', 'author', 'datePublished', 'image'],
    'Product': ['name', 'image', 'description', 'offers'],
    'Offer': ['price', 'priceCurrency'],
    'Review': ['reviewRating', 'author', 'reviewBody'],
    'AggregateRating': ['ratingValue', 'reviewCount'],
    'Event': ['name', 'startDate', 'location'],
    'Recipe': ['name', 'image', 'recipeIngredient'],
    'HowTo': ['name', 'step'],
    'FAQPage': ['mainEntity'],
    'QAPage': ['mainEntity'],
    'VideoObject': ['name', 'description', 'thumbnailUrl', 'uploadDate'],
    'JobPosting': ['title', 'description', 'datePosted', 'hiringOrganization'],
    'Course': ['name', 'description', 'provider'],
    'Book': ['name', 'author'],
    'BreadcrumbList': ['itemListElement'],
    'WebPage': ['name', 'url'],
    'WebSite': ['name', 'url']
  };
  
  return required[type] || [];
}

/**
 * Get optional properties for schema type
 */
function getOptionalProperties(type) {
  var optional = {
    'Organization': ['logo', 'description', 'sameAs', 'contactPoint'],
    'LocalBusiness': ['url', 'image', 'priceRange', 'geo', 'openingHours'],
    'Person': ['url', 'image', 'jobTitle', 'sameAs', 'email'],
    'Article': ['description', 'publisher', 'dateModified'],
    'BlogPosting': ['description', 'publisher', 'dateModified'],
    'NewsArticle': ['description', 'publisher', 'dateModified'],
    'Product': ['brand', 'sku', 'gtin', 'mpn', 'review', 'aggregateRating'],
    'Event': ['description', 'image', 'endDate', 'performer', 'offers'],
    'Recipe': ['author', 'prepTime', 'cookTime', 'recipeYield', 'nutrition'],
    'HowTo': ['description', 'image', 'totalTime', 'tool', 'supply'],
    'VideoObject': ['contentUrl', 'embedUrl', 'duration'],
    'JobPosting': ['employmentType', 'validThrough', 'baseSalary', 'jobLocation'],
    'Course': ['offers', 'hasCourseInstance']
  };
  
  return optional[type] || [];
}

/**
 * Calculate overall schema score
 */
function calculateSchemaScore(schemas, validation) {
  var score = 0;
  var breakdown = {};
  
  // Schema presence (30 points)
  if (validation.hasSchema) {
    score += 30;
    breakdown.presence = 30;
  }
  
  // Context present (10 points)
  if (validation.hasContext && validation.allHaveContext) {
    score += 10;
    breakdown.context = 10;
  } else if (validation.hasContext) {
    score += 5;
    breakdown.context = 5;
  }
  
  // Completeness (40 points)
  if (schemas.length > 0) {
    var avgCompleteness = 0;
    schemas.forEach(function(s) {
      avgCompleteness += s.completeness.percent;
    });
    avgCompleteness = avgCompleteness / schemas.length;
    
    var completenessScore = Math.round((avgCompleteness / 100) * 40);
    score += completenessScore;
    breakdown.completeness = completenessScore;
  }
  
  // Rich results eligible (20 points)
  if (validation.richResultsEligible) {
    score += 20;
    breakdown.richResults = 20;
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
 * Get schema recommendations
 */
function getSchemaRecommendations(schemas, validation) {
  var recommendations = [];
  
  if (!validation.hasSchema) {
    recommendations.push({
      severity: 'critical',
      category: 'missing',
      message: 'No structured data found. Add JSON-LD schema to improve SEO.',
      priority: 1
    });
  }
  
  if (validation.hasSchema && !validation.allHaveContext) {
    recommendations.push({
      severity: 'error',
      category: 'context',
      message: 'Some schemas missing @context. Add "@context": "https://schema.org" to all schemas.',
      priority: 2
    });
  }
  
  if (!validation.hasOrganization && !validation.hasLocalBusiness) {
    recommendations.push({
      severity: 'warning',
      category: 'missing',
      message: 'Add Organization or LocalBusiness schema for business entity.',
      priority: 3
    });
  }
  
  if (!validation.hasBreadcrumb) {
    recommendations.push({
      severity: 'info',
      category: 'enhancement',
      message: 'Add BreadcrumbList schema for improved navigation in search results.',
      priority: 4
    });
  }
  
  // Check completeness
  schemas.forEach(function(schema) {
    if (!schema.completeness.hasAllRequired) {
      recommendations.push({
        severity: 'error',
        category: 'incomplete',
        message: 'Schema type "' + schema.type + '" is missing required properties.',
        priority: 2,
        details: 'Missing: ' + schema.required.filter(function(p) {
          return schema.data[p] === undefined;
        }).join(', ')
      });
    }
    
    if (schema.completeness.percent < 70) {
      recommendations.push({
        severity: 'warning',
        category: 'completeness',
        message: 'Schema type "' + schema.type + '" is only ' + schema.completeness.percent + '% complete.',
        priority: 3
      });
    }
  });
  
  return recommendations;
}

/**
 * Legacy function names
 */
function FET_extractSchema(html) {
  return FT_extractSchema(html);
}

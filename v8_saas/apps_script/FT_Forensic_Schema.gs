/**
 * FT_Forensic_Schema.gs - Schema & Recommendations
 * SerpifAI V8 - Modular Architecture
 * 
 * Schema.org extraction, scoring, and recommendation generation.
 */

/**
 * Extract Schema.org structured data
 * @param {string} html - HTML content
 * @return {object} Schema data
 */
function FT_extractSchemaData(html) {
  const schemas = [];
  const types = [];
  
  try {
    // JSON-LD schemas
    const jsonLdRegex = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        const parsed = JSON.parse(jsonContent);
        
        // Handle array or single object
        const items = Array.isArray(parsed) ? parsed : [parsed];
        
        items.forEach(item => {
          if (item['@type']) {
            const schemaType = Array.isArray(item['@type']) ? 
              item['@type'][0] : item['@type'];
            
            schemas.push({
              type: schemaType,
              properties: Object.keys(item).filter(k => !k.startsWith('@')),
              raw: item
            });
            
            if (!types.includes(schemaType)) {
              types.push(schemaType);
            }
          }
        });
      } catch (parseErr) {
        LOG_debug('JSON-LD parse error', { error: parseErr.message });
      }
    }
    
    // Microdata (basic detection)
    const microdataCount = (html.match(/itemscope|itemtype|itemprop/gi) || []).length;
    
    // RDFa (basic detection)
    const rdfaCount = (html.match(/typeof|property="[^"]*"/gi) || []).length;
    
    return {
      schemas: schemas,
      types: types,
      count: schemas.length,
      hasJsonLd: schemas.length > 0,
      hasMicrodata: microdataCount > 0,
      hasRdfa: rdfaCount > 0,
      microdataCount: microdataCount,
      commonTypes: FT_categorizeSchemaTypes(types),
      score: FT_scoreSchema(schemas, types)
    };
    
  } catch (e) {
    LOG_warn('Schema extraction error', { error: e.message });
    return { schemas: [], types: [], count: 0, score: 0 };
  }
}

/**
 * Categorize schema types
 * @param {string[]} types - Schema types found
 * @return {object} Categorized types
 */
function FT_categorizeSchemaTypes(types) {
  const categories = {
    organization: [],
    product: [],
    article: [],
    local: [],
    other: []
  };
  
  const mapping = {
    organization: ['Organization', 'Corporation', 'LocalBusiness', 'Store'],
    product: ['Product', 'Offer', 'AggregateOffer', 'Review', 'AggregateRating'],
    article: ['Article', 'NewsArticle', 'BlogPosting', 'WebPage', 'FAQPage', 'HowTo'],
    local: ['LocalBusiness', 'Restaurant', 'Store', 'Place', 'PostalAddress']
  };
  
  types.forEach(type => {
    let categorized = false;
    for (const [category, schemaTypes] of Object.entries(mapping)) {
      if (schemaTypes.some(t => type.includes(t))) {
        categories[category].push(type);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categories.other.push(type);
    }
  });
  
  return categories;
}

/**
 * Score schema implementation
 * @param {Array} schemas - Parsed schemas
 * @param {string[]} types - Schema types
 * @return {number} Score 0-100
 */
function FT_scoreSchema(schemas, types) {
  if (schemas.length === 0) return 0;
  
  let score = 20; // Base score for having any schema
  
  // Variety bonus
  score += Math.min(30, types.length * 10);
  
  // Important types bonus
  const importantTypes = ['Organization', 'Article', 'Product', 'FAQPage', 
                          'LocalBusiness', 'BreadcrumbList', 'HowTo'];
  const hasImportant = types.some(t => 
    importantTypes.some(it => t.includes(it))
  );
  if (hasImportant) score += 25;
  
  // Property completeness (sample first schema)
  if (schemas[0] && schemas[0].properties) {
    const propCount = schemas[0].properties.length;
    score += Math.min(25, propCount * 3);
  }
  
  return Math.min(100, score);
}

/**
 * Calculate forensic scores for all categories
 * @param {object} categories - All extracted categories
 * @return {object} Category scores
 */
function FT_calculateForensicScores(categories) {
  const scores = {};
  
  if (categories.metadata) scores.metadata = categories.metadata.score || 0;
  if (categories.headings) scores.headings = categories.headings.score || 0;
  if (categories.links) scores.links = categories.links.score || 0;
  if (categories.images) scores.images = categories.images.score || 0;
  if (categories.schema) scores.schema = categories.schema.score || 0;
  if (categories.author) scores.author = categories.author.score || 0;
  if (categories.trust) scores.trust = categories.trust.score || 0;
  if (categories.faqs) scores.faqs = categories.faqs.score || 0;
  
  // Content score (average of headings and intro)
  scores.content = Math.round(
    ((scores.headings || 0) + (categories.intro && categories.intro.hasIntro ? 70 : 30)) / 2
  );
  
  // Technical score (schema + proper structure)
  scores.technical = Math.round(
    ((scores.schema || 0) + (scores.metadata || 0)) / 2
  );
  
  return scores;
}

// Recommendations and competitor analysis moved to FT_Forensic_Recommend.gs

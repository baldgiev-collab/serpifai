/**
 * Extract Schema.org structured data from HTML
 * @param {string} html - HTML content
 * @return {object} Schema data with types and validation
 */
function FET_extractSchema(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var schemas = [];
  var types = [];
  var errors = [];
  
  // Extract JSON-LD schema
  var jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      var schemaData = JSON.parse(match[1]);
      schemas.push(schemaData);
      
      // Extract @type (can be string or array)
      if (schemaData['@type']) {
        var schemaTypes = Array.isArray(schemaData['@type']) ? 
          schemaData['@type'] : [schemaData['@type']];
        types = types.concat(schemaTypes);
      }
      
      // Handle @graph structure
      if (schemaData['@graph'] && Array.isArray(schemaData['@graph'])) {
        schemaData['@graph'].forEach(function(item) {
          if (item['@type']) {
            var itemTypes = Array.isArray(item['@type']) ? 
              item['@type'] : [item['@type']];
            types = types.concat(itemTypes);
          }
        });
      }
    } catch (e) {
      errors.push({
        error: String(e),
        content: match[1].substring(0, 100) + '...'
      });
    }
  }
  
  // Remove duplicate types
  types = types.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });
  
  return {
    ok: true,
    count: schemas.length,
    schemas: schemas,
    types: types,
    errors: errors,
    validation: {
      hasSchema: schemas.length > 0,
      hasOrganization: types.indexOf('Organization') !== -1,
      hasWebPage: types.indexOf('WebPage') !== -1,
      hasArticle: types.indexOf('Article') !== -1 || types.indexOf('BlogPosting') !== -1,
      hasBreadcrumb: types.indexOf('BreadcrumbList') !== -1,
      hasProduct: types.indexOf('Product') !== -1,
      hasLocalBusiness: types.indexOf('LocalBusiness') !== -1
    }
  };
}


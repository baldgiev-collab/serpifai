/**
 * DB_CE_ContentEngine.gs
 * Content Engine - Article generation, outlines, schema, linking
 */

// Article Generation
function DB_CE_articleGenerate(params) {
  return callGateway({
    action: 'content:article',
    data: params || {}
  });
}

// Outline Generation
function DB_CE_outlineGenerator(params) {
  return callGateway({
    action: 'content:outline',
    data: params || {}
  });
}

// Schema Generation
function DB_CE_schemaGenerator(params) {
  return callGateway({
    action: 'content:schema',
    data: params || {}
  });
}

// Internal Linking
function DB_CE_internalLinking(params) {
  return callGateway({
    action: 'content:linking',
    data: params || {}
  });
}

// Brand Consistency
function DB_CE_brandConsistency(params) {
  return callGateway({
    action: 'content:brandConsistency',
    data: params || {}
  });
}

// Content Versions
function DB_CE_contentVersions(params) {
  return callGateway({
    action: 'content:versions',
    data: params || {}
  });
}

// Platform Mapping
function DB_CE_platformMap(params) {
  return callGateway({
    action: 'content:platformMap',
    data: params || {}
  });
}

// Legacy names
function CE_articleGenerate(p) { return DB_CE_articleGenerate(p); }
function CE_outlineGenerator(p) { return DB_CE_outlineGenerator(p); }
function CE_schemaGenerator(p) { return DB_CE_schemaGenerator(p); }
function CE_internalLinking(p) { return DB_CE_internalLinking(p); }
function CE_brandConsistency(p) { return DB_CE_brandConsistency(p); }
function CE_contentVersions(p) { return DB_CE_contentVersions(p); }
function CE_platformMap(p) { return DB_CE_platformMap(p); }

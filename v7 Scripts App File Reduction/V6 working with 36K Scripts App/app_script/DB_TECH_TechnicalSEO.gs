/**
 * DB_TECH_TechnicalSEO.gs
 * Technical SEO Module - PageSpeed, Schema, Core Web Vitals, etc.
 */

// PageSpeed Analysis
function DB_TECH_pageSpeed(params) {
  return callGateway({
    action: 'tech:pageSpeed',
    data: params || {}
  });
}

// Schema Audit
function DB_TECH_schemaAudit(params) {
  return callGateway({
    action: 'tech:schema',
    data: params || {}
  });
}

// Core Web Vitals
function DB_TECH_coreWebVitals(params) {
  return callGateway({
    action: 'tech:vitals',
    data: params || {}
  });
}

// Broken Links
function DB_TECH_brokenLinks(params) {
  return callGateway({
    action: 'tech:broken',
    data: params || {}
  });
}

// Meta Issues
function DB_TECH_metaIssues(params) {
  return callGateway({
    action: 'tech:meta',
    data: params || {}
  });
}

// Duplication Checker
function DB_TECH_duplicationChecker(params) {
  return callGateway({
    action: 'tech:duplication',
    data: params || {}
  });
}

// Legacy names
function TECH_pageSpeed(p) { return DB_TECH_pageSpeed(p); }
function TECH_schemaAudit(p) { return DB_TECH_schemaAudit(p); }
function TECH_coreWebVitals(p) { return DB_TECH_coreWebVitals(p); }
function TECH_brokenLinks(p) { return DB_TECH_brokenLinks(p); }
function TECH_metaIssues(p) { return DB_TECH_metaIssues(p); }
function TECH_duplicationChecker(p) { return DB_TECH_duplicationChecker(p); }

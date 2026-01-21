/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_EvidenceMap.gs - ZERO-TRUST PROOF CITATIONS ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI Elite - Every Metric Has Raw Evidence
 * 
 * This module provides a standardized data structure for capturing and storing
 * raw evidence (HTML snippets, parsed values, extraction logic) for every 
 * metric displayed in the UI.
 * 
 * ZERO-TRUST PRINCIPLE:
 * "Every data point shown to the user must be traceable to its raw source"
 * 
 * EVIDENCE MAP STRUCTURE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ evidenceMap: {                                                          │
 * │   metricId: {                                                           │
 * │     value: <displayed value>,                                           │
 * │     rawEvidence: {                                                      │
 * │       htmlSnippet: <raw HTML that was parsed>,                         │
 * │       extractionLogic: <description of how value was derived>,         │
 * │       sourceFile: <where the data came from>,                          │
 * │       lineNumbers: <approximate line range in source>                  │
 * │     },                                                                  │
 * │     confidence: 0-100,                                                  │
 * │     timestamp: ISO date string                                          │
 * │   }                                                                     │
 * │ }                                                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * USAGE:
 * 1. During data extraction, call captureEvidence() for each metric
 * 2. Store evidenceMap in comp.synthesized.evidenceMap
 * 3. UI can query getEvidence(metricId) for proof display
 * 
 * @module EvidenceMap
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Create a new evidence map instance for a competitor
 * @returns {Object} Empty evidence map with utility methods
 */
function createEvidenceMap() {
  return {
    _data: {},
    _metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      totalProofs: 0
    }
  };
}

/**
 * Capture evidence for a specific metric
 * 
 * @param {Object} evidenceMap - The evidence map to add to
 * @param {string} metricId - Unique identifier for the metric (e.g., 'aeo.headingScore')
 * @param {Object} evidence - Evidence details
 *   @property {*} value - The displayed/calculated value
 *   @property {string} htmlSnippet - Raw HTML that was parsed (max 2000 chars)
 *   @property {string} extractionLogic - Description of extraction method
 *   @property {string} sourceFile - Source file/API (e.g., 'Oracle Fetcher', 'PageSpeed API')
 *   @property {Array<number>} lineNumbers - [start, end] line range if applicable
 *   @property {number} confidence - Confidence score 0-100
 *   @property {Object} additionalContext - Any extra context
 * 
 * @returns {Object} The updated evidence map
 */
function captureEvidence(evidenceMap, metricId, evidence) {
  if (!evidenceMap || !evidenceMap._data) {
    evidenceMap = createEvidenceMap();
  }
  
  const timestamp = new Date().toISOString();
  
  // Truncate HTML snippet to prevent memory bloat
  let htmlSnippet = evidence.htmlSnippet || '';
  if (htmlSnippet.length > 2000) {
    htmlSnippet = htmlSnippet.substring(0, 2000) + '\n... [truncated - ' + (htmlSnippet.length - 2000) + ' more chars]';
  }
  
  evidenceMap._data[metricId] = {
    value: evidence.value,
    rawEvidence: {
      htmlSnippet: htmlSnippet,
      extractionLogic: evidence.extractionLogic || 'Standard extraction',
      sourceFile: evidence.sourceFile || 'Unknown',
      lineNumbers: evidence.lineNumbers || null,
      parsingMethod: evidence.parsingMethod || 'RegExp/DOM'
    },
    confidence: Math.max(0, Math.min(100, evidence.confidence || 80)),
    timestamp: timestamp,
    additionalContext: evidence.additionalContext || {}
  };
  
  evidenceMap._metadata.totalProofs++;
  evidenceMap._metadata.lastUpdated = timestamp;
  
  return evidenceMap;
}

/**
 * Get evidence for a specific metric
 * 
 * @param {Object} evidenceMap - The evidence map
 * @param {string} metricId - Metric ID to retrieve
 * @returns {Object|null} Evidence object or null if not found
 */
function getEvidence(evidenceMap, metricId) {
  if (!evidenceMap || !evidenceMap._data) return null;
  return evidenceMap._data[metricId] || null;
}

/**
 * Get all evidence for a category (prefix match)
 * 
 * @param {Object} evidenceMap - The evidence map
 * @param {string} category - Category prefix (e.g., 'aeo' matches 'aeo.headingScore', 'aeo.schemaBonus')
 * @returns {Object} Object with matching evidence entries
 */
function getEvidenceByCategory(evidenceMap, category) {
  if (!evidenceMap || !evidenceMap._data) return {};
  
  const result = {};
  const prefix = category + '.';
  
  Object.keys(evidenceMap._data).forEach(function(key) {
    if (key === category || key.startsWith(prefix)) {
      result[key] = evidenceMap._data[key];
    }
  });
  
  return result;
}

/**
 * Capture AEO-specific evidence bundle
 * Convenience method for the AEO RAG-Ready Score module
 * 
 * @param {Object} evidenceMap - The evidence map
 * @param {Object} aeoResult - Result from calculateRAGReadyScore()
 * @param {Object} rawData - Raw HTML/schema data that was analyzed
 * @returns {Object} Updated evidence map
 */
function captureAEOEvidence(evidenceMap, aeoResult, rawData) {
  if (!evidenceMap) evidenceMap = createEvidenceMap();
  
  // Capture total score evidence
  captureEvidence(evidenceMap, 'aeo.totalScore', {
    value: aeoResult.totalScore,
    htmlSnippet: 'Composite: CriteriaA(' + (aeoResult.breakdown?.headingLogic?.score || 0) + 
                 ') + CriteriaB(' + (aeoResult.breakdown?.schemaBonus?.score || 0) + 
                 ') + CriteriaC(' + (aeoResult.breakdown?.readability?.score || 0) + ')',
    extractionLogic: 'Sum of 3 criteria scores, capped at 100',
    sourceFile: 'FT_ForensicAEO.gs::calculateRAGReadyScore()',
    confidence: 95
  });
  
  // Capture Criteria A: Heading Logic evidence
  const headingEvidence = aeoResult.breakdown?.headingLogic?.evidence || {};
  captureEvidence(evidenceMap, 'aeo.headingLogic', {
    value: aeoResult.breakdown?.headingLogic?.score || 0,
    htmlSnippet: (headingEvidence.questionHeadings || []).slice(0, 5).join('\n'),
    extractionLogic: 'Question headings: +5 each (max 25). Clean paragraphs: +10. Hierarchy: +5.',
    sourceFile: 'FT_ForensicAEO.gs::_calculateHeadingLogicScore()',
    confidence: 90,
    additionalContext: {
      questionCount: headingEvidence.questionCount || 0,
      totalHeadings: headingEvidence.totalHeadings || 0
    }
  });
  
  // Capture Criteria B: Schema Bonus evidence
  const schemaEvidence = aeoResult.breakdown?.schemaBonus?.evidence || {};
  captureEvidence(evidenceMap, 'aeo.schemaBonus', {
    value: aeoResult.breakdown?.schemaBonus?.score || 0,
    htmlSnippet: 'Schema types detected: ' + JSON.stringify(schemaEvidence.allTypesFound || []),
    extractionLogic: 'FAQPage: +15, HowTo: +15, Organization: +10',
    sourceFile: 'FT_ForensicAEO.gs::_calculateSchemaBonusScore()',
    confidence: 95,
    additionalContext: {
      hasFAQPage: schemaEvidence.hasFAQPage || false,
      hasHowTo: schemaEvidence.hasHowTo || false,
      hasOrganization: schemaEvidence.hasOrganization || false
    }
  });
  
  // Capture Criteria C: Readability evidence
  const readabilityEvidence = aeoResult.breakdown?.readability?.evidence || {};
  captureEvidence(evidenceMap, 'aeo.readability', {
    value: aeoResult.breakdown?.readability?.score || 0,
    htmlSnippet: 'Text length: ' + (readabilityEvidence.textLength || 0) + 
                 ' / HTML length: ' + (readabilityEvidence.htmlLength || 0) + 
                 ' = ' + (readabilityEvidence.ratio || 0).toFixed(2) + '%',
    extractionLogic: 'Text/HTML ratio: >15% = 20pts, 10-15% = 15pts, 5-10% = 10pts, <5% = 5pts',
    sourceFile: 'FT_ForensicAEO.gs::_calculateReadabilityScore()',
    confidence: 85,
    additionalContext: {
      tier: readabilityEvidence.tier || 'Unknown',
      target: '>15%'
    }
  });
  
  // Capture gaps evidence
  if (aeoResult.gaps && aeoResult.gaps.length > 0) {
    captureEvidence(evidenceMap, 'aeo.gaps', {
      value: aeoResult.gaps.length + ' improvement opportunities',
      htmlSnippet: aeoResult.gaps.map(g => '- ' + g.title + ': ' + g.description).join('\n'),
      extractionLogic: 'Gaps identified by analyzing missing components from each criteria',
      sourceFile: 'FT_ForensicAEO.gs::_identifyAEOGaps()',
      confidence: 90
    });
  }
  
  return evidenceMap;
}

/**
 * Format evidence for UI display in the Audit Trail modal
 * 
 * @param {Object} evidence - Single evidence entry from getEvidence()
 * @returns {Object} Formatted for UI display
 */
function formatEvidenceForUI(evidence) {
  if (!evidence) {
    return {
      displayValue: 'N/A',
      proofPanel: {
        title: 'No Evidence Available',
        htmlView: 'No raw evidence captured for this metric.',
        logicBreadcrumb: 'Unknown extraction path',
        confidence: 0,
        confidenceLabel: 'No Data',
        timestamp: null
      }
    };
  }
  
  const raw = evidence.rawEvidence || {};
  const confidence = evidence.confidence || 0;
  
  let confidenceLabel = 'Low';
  let confidenceColor = '#ef4444';
  if (confidence >= 90) {
    confidenceLabel = 'High';
    confidenceColor = '#22c55e';
  } else if (confidence >= 70) {
    confidenceLabel = 'Good';
    confidenceColor = '#84cc16';
  } else if (confidence >= 50) {
    confidenceLabel = 'Medium';
    confidenceColor = '#f59e0b';
  }
  
  return {
    displayValue: evidence.value,
    proofPanel: {
      title: 'Raw Evidence',
      htmlView: raw.htmlSnippet || 'No HTML snippet captured',
      logicBreadcrumb: raw.sourceFile + ' → ' + raw.extractionLogic,
      parsingMethod: raw.parsingMethod || 'Standard',
      confidence: confidence,
      confidenceLabel: confidenceLabel,
      confidenceColor: confidenceColor,
      timestamp: evidence.timestamp,
      lineNumbers: raw.lineNumbers
    },
    additionalContext: evidence.additionalContext || {}
  };
}

/**
 * Generate audit trail summary for a competitor
 * 
 * @param {Object} evidenceMap - The evidence map
 * @returns {Object} Summary statistics
 */
function generateAuditTrailSummary(evidenceMap) {
  if (!evidenceMap || !evidenceMap._data) {
    return {
      totalProofs: 0,
      categories: [],
      avgConfidence: 0,
      lastUpdated: null
    };
  }
  
  const data = evidenceMap._data;
  const keys = Object.keys(data);
  
  // Extract unique categories (first part of metric ID)
  const categories = [...new Set(keys.map(k => k.split('.')[0]))];
  
  // Calculate average confidence
  let totalConfidence = 0;
  keys.forEach(function(key) {
    totalConfidence += data[key].confidence || 0;
  });
  const avgConfidence = keys.length > 0 ? Math.round(totalConfidence / keys.length) : 0;
  
  return {
    totalProofs: evidenceMap._metadata?.totalProofs || keys.length,
    categories: categories,
    avgConfidence: avgConfidence,
    lastUpdated: evidenceMap._metadata?.lastUpdated || null,
    proofsByCategory: categories.reduce(function(acc, cat) {
      acc[cat] = keys.filter(k => k.startsWith(cat)).length;
      return acc;
    }, {})
  };
}

/**
 * Export evidence map as JSON for debugging/audit
 * 
 * @param {Object} evidenceMap - The evidence map
 * @returns {string} JSON string
 */
function exportEvidenceMap(evidenceMap) {
  if (!evidenceMap) return '{}';
  return JSON.stringify({
    metadata: evidenceMap._metadata,
    evidence: evidenceMap._data
  }, null, 2);
}

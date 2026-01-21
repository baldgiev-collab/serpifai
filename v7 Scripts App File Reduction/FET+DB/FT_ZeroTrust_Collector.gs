/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ZeroTrust_Collector.gs - ZERO-TRUST EVIDENCE COLLECTOR
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI Elite v22.0 - Every Metric Has Raw Evidence
 * 
 * ARCHITECTURE: Augments existing Oracle Pipeline WITHOUT rebuilding
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  RESTRUCTURED COMPETITOR OBJECT WITH evidenceMap                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  competitor: {                                                          │
 * │    domain: "example.com",                                              │
 * │    url: "https://example.com",                                         │
 * │                                                                         │
 * │    // ═══ EXISTING STRUCTURE (PRESERVED) ═══                           │
 * │    synthesized: {                                                       │
 * │      website: { title, h1, h2, h3, description, wordCount, ... },      │
 * │      metadata: { tld, protocol, responseTime, ... },                   │
 * │      technical: { schemaTypes, performanceScore, ... },                │
 * │      content: { readabilityScore, keywordDensity, ... },               │
 * │      aeoReadiness: { totalScore, status, gaps, ... }                   │
 * │    },                                                                   │
 * │                                                                         │
 * │    stages: {                                                            │
 * │      oracleFetcher: { success, data, timestamp },                      │
 * │      phpFetcher: { success, data },                                    │
 * │      pageSpeed: { success, scores }                                    │
 * │    },                                                                   │
 * │                                                                         │
 * │    apiData: {                                                           │
 * │      pageSpeed: { scores, metrics, opportunities },                    │
 * │      serper: { keywords, rankings }                                    │
 * │    },                                                                   │
 * │                                                                         │
 * │    processedMetrics: { performanceScore, seoScore, ... },              │
 * │                                                                         │
 * │    // ═══ NEW: ZERO-TRUST EVIDENCE MAP ═══                             │
 * │    evidenceMap: {                                                       │
 * │      _metadata: {                                                       │
 * │        version: "1.0.0",                                               │
 * │        createdAt: "ISO timestamp",                                     │
 * │        totalProofs: 47,                                                │
 * │        memorySize: "12.4 KB"                                           │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === MARKET TAB PROOFS ===                                      │
 * │      "market.tld": {                                                   │
 * │        value: ".com",                                                  │
 * │        raw: { urlParsed: "https://example.com", regex: "..." },       │
 * │        source: "Oracle Fetcher → URL Parser",                          │
 * │        confidence: 100                                                 │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === TECHNICAL TAB PROOFS ===                                   │
 * │      "technical.wordCount": {                                          │
 * │        value: 2847,                                                    │
 * │        raw: { mainTagInnerText: "...(first 500 chars)..." },          │
 * │        source: "Oracle Fetcher → <main> innerText → word.split()",    │
 * │        confidence: 95                                                  │
 * │      },                                                                 │
 * │                                                                         │
 * │      "technical.schema": {                                             │
 * │        value: ["Organization", "FAQPage", "Article"],                  │
 * │        raw: { jsonLdSnippet: "<script type=\"application/ld+json\">...│
 * │        source: "PHP Gateway → DOM → JSON-LD Script Tags",             │
 * │        confidence: 98                                                  │
 * │      },                                                                 │
 * │                                                                         │
 * │      "technical.h1": {                                                 │
 * │        value: "Welcome to Example",                                    │
 * │        raw: { htmlSnippet: "<h1 class=\"hero-title\">Welcome..." },   │
 * │        source: "Oracle Fetcher → DOMDocument → H1 Query",             │
 * │        confidence: 100                                                 │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === CONTENT TAB PROOFS ===                                     │
 * │      "content.metaDescription": {                                      │
 * │        value: "Example is the leading...",                            │
 * │        raw: { htmlSnippet: "<meta name=\"description\" content=..." },│
 * │        source: "PHP Gateway → Meta Tag Extraction",                   │
 * │        confidence: 100                                                 │
 * │      },                                                                 │
 * │                                                                         │
 * │      "content.ragCleanView": {                                         │
 * │        value: "# Example\n\n## About Us\n\nWe are...",               │
 * │        raw: { markdownConversion: "..." },                            │
 * │        source: "HTML → Markdown → LLM Clean View",                    │
 * │        confidence: 90                                                  │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === KEYWORD TAB PROOFS ===                                     │
 * │      "keyword.topKeywords": {                                          │
 * │        value: ["seo", "marketing", "tools"],                          │
 * │        raw: { frequencyMap: { "seo": 47, "marketing": 32 } },         │
 * │        source: "Oracle Fetcher → TF-IDF Analysis",                    │
 * │        confidence: 85                                                  │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === BRAND TAB PROOFS ===                                       │
 * │      "brand.ogImage": {                                                │
 * │        value: "https://example.com/og-image.jpg",                     │
 * │        raw: { htmlSnippet: "<meta property=\"og:image\" content=..."} │
 * │        source: "PHP Gateway → Open Graph Extraction",                 │
 * │        confidence: 100                                                 │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === PERFORMANCE TAB PROOFS ===                                 │
 * │      "performance.score": {                                            │
 * │        value: 78,                                                      │
 * │        raw: { apiResponse: { performance: 0.78, ... },                │
 * │               infrastructureFingerprint: {                             │
 * │                 server: "nginx/1.18.0",                               │
 * │                 xPoweredBy: "PHP/8.1",                                │
 * │                 cacheControl: "max-age=3600"                          │
 * │               }                                                        │
 * │        },                                                              │
 * │        source: "PageSpeed API → Lighthouse Score",                    │
 * │        confidence: 100                                                 │
 * │      },                                                                 │
 * │                                                                         │
 * │      // === AEO TAB PROOFS ===                                         │
 * │      "aeo.headingLogic": { ... },                                      │
 * │      "aeo.schemaBonus": { ... },                                       │
 * │      "aeo.readability": { ... },                                       │
 * │      "aeo.totalScore": { ... }                                         │
 * │    }                                                                    │
 * │  }                                                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * INTEGRATION POINTS:
 * - Called after Oracle Fetcher completes each extraction
 * - Results stored in competitor.evidenceMap
 * - Passed through Chunked Upload (37 chunks) safely
 * - UI reads via getProofForMetric(competitor, metricId)
 * 
 * MEMORY OPTIMIZATION:
 * - Raw HTML snippets truncated to 500 chars max
 * - Only essential evidence stored
 * - Lazy loading for full evidence on demand
 * 
 * @module ZeroTrustCollector
 * @version 1.0.0
 * @requires FT_EvidenceMap.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Maximum snippet size to prevent memory bloat in 37-chunk upload
const EVIDENCE_MAX_SNIPPET_SIZE = 500;
const EVIDENCE_MAX_TOTAL_SIZE = 50000; // 50KB per competitor

/**
 * Collect Zero-Trust evidence for a competitor during fetching
 * This function is called after Oracle Fetcher completes extraction
 * 
 * @param {Object} competitor - The competitor object with fetched data
 * @param {Object} rawResponse - Raw response from PHP Gateway
 * @returns {Object} Updated competitor with evidenceMap
 */
function collectZeroTrustEvidence(competitor, rawResponse) {
  console.log(`[ZeroTrust] Collecting evidence for ${competitor.domain}...`);
  
  // Initialize evidence map
  const evidenceMap = {
    _metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      totalProofs: 0,
      domain: competitor.domain
    }
  };
  
  try {
    // Extract from synthesized data
    const synthesized = competitor.synthesized || {};
    const website = synthesized.website || {};
    const technical = synthesized.technical || {};
    const stages = competitor.stages || {};
    const oracleData = stages.oracleFetcher?.data || {};
    const rawHtml = rawResponse?.html || oracleData.rawHtml || '';
    
    // =========================================================================
    // MARKET TAB EVIDENCE
    // =========================================================================
    evidenceMap['market.tld'] = _captureEvidence({
      metricId: 'market.tld',
      value: _extractTLD(competitor.url || competitor.domain),
      rawSnippet: competitor.url || competitor.domain,
      source: 'URL Parser → TLD Extraction',
      confidence: 100
    });
    
    evidenceMap['market.protocol'] = _captureEvidence({
      metricId: 'market.protocol',
      value: (competitor.url || '').startsWith('https') ? 'HTTPS' : 'HTTP',
      rawSnippet: competitor.url,
      source: 'URL Parser → Protocol Check',
      confidence: 100
    });
    
    // =========================================================================
    // TECHNICAL TAB EVIDENCE
    // =========================================================================
    
    // Word Count Evidence
    const mainContent = _extractMainContent(rawHtml);
    evidenceMap['technical.wordCount'] = _captureEvidence({
      metricId: 'technical.wordCount',
      value: website.wordCount || _countWords(mainContent),
      rawSnippet: mainContent.substring(0, EVIDENCE_MAX_SNIPPET_SIZE),
      source: 'Oracle Fetcher → <main>/<article>/<body> innerText → word.split()',
      confidence: mainContent.length > 100 ? 95 : 70,
      additionalContext: {
        contentLength: mainContent.length,
        extractionMethod: 'DOM traversal with priority: main > article > body'
      }
    });
    
    // H1 Evidence
    const h1Snippet = _extractTagSnippet(rawHtml, 'h1');
    evidenceMap['technical.h1'] = _captureEvidence({
      metricId: 'technical.h1',
      value: website.h1 || _extractTagText(rawHtml, 'h1'),
      rawSnippet: h1Snippet,
      source: 'Oracle Fetcher → DOMDocument → H1 Query',
      confidence: h1Snippet.length > 0 ? 100 : 0
    });
    
    // H2 Evidence
    const h2Tags = Array.isArray(website.h2) ? website.h2 : [];
    evidenceMap['technical.h2'] = _captureEvidence({
      metricId: 'technical.h2',
      value: h2Tags,
      rawSnippet: h2Tags.slice(0, 5).map((h, i) => `<h2>${h}</h2>`).join('\n'),
      source: 'Oracle Fetcher → DOMDocument → H2 Query',
      confidence: h2Tags.length > 0 ? 95 : 50
    });
    
    // Schema Evidence
    const schemaSnippet = _extractSchemaSnippet(rawHtml);
    evidenceMap['technical.schema'] = _captureEvidence({
      metricId: 'technical.schema',
      value: website.schemaTypes || [],
      rawSnippet: schemaSnippet,
      source: 'PHP Gateway → JSON-LD Script Tag → @type Extraction',
      confidence: schemaSnippet.length > 10 ? 98 : 60
    });
    
    // Meta Description Evidence
    const metaDescSnippet = _extractMetaTagSnippet(rawHtml, 'description');
    evidenceMap['technical.metaDescription'] = _captureEvidence({
      metricId: 'technical.metaDescription',
      value: website.description || '',
      rawSnippet: metaDescSnippet,
      source: 'PHP Gateway → Meta Tag Extraction',
      confidence: metaDescSnippet.length > 0 ? 100 : 0
    });
    
    // =========================================================================
    // CONTENT TAB EVIDENCE
    // =========================================================================
    
    // RAG Clean View (Markdown conversion for LLM readability)
    const ragCleanView = _generateRAGCleanView(website);
    evidenceMap['content.ragCleanView'] = _captureEvidence({
      metricId: 'content.ragCleanView',
      value: ragCleanView.substring(0, 1000),
      rawSnippet: ragCleanView.substring(0, EVIDENCE_MAX_SNIPPET_SIZE),
      source: 'HTML → Strip Tags → Markdown Conversion → LLM Clean View',
      confidence: 90,
      additionalContext: {
        fullLength: ragCleanView.length,
        conversionMethod: 'Semantic HTML to Markdown'
      }
    });
    
    // Title Evidence
    const titleSnippet = _extractTagSnippet(rawHtml, 'title');
    evidenceMap['content.title'] = _captureEvidence({
      metricId: 'content.title',
      value: website.title || '',
      rawSnippet: titleSnippet,
      source: 'PHP Gateway → Title Tag Extraction',
      confidence: titleSnippet.length > 0 ? 100 : 0
    });
    
    // =========================================================================
    // KEYWORD TAB EVIDENCE
    // =========================================================================
    
    // Top Keywords Evidence
    const keywords = website.topKeywords || oracleData.keywords || [];
    evidenceMap['keyword.topKeywords'] = _captureEvidence({
      metricId: 'keyword.topKeywords',
      value: Array.isArray(keywords) ? keywords.slice(0, 10) : [],
      rawSnippet: JSON.stringify(keywords.slice(0, 5)),
      source: 'Oracle Fetcher → TF-IDF Analysis → Frequency Weighting',
      confidence: keywords.length > 0 ? 85 : 50
    });
    
    // =========================================================================
    // BRAND TAB EVIDENCE
    // =========================================================================
    
    // OG Image Evidence
    const ogImageSnippet = _extractMetaTagSnippet(rawHtml, 'og:image', 'property');
    evidenceMap['brand.ogImage'] = _captureEvidence({
      metricId: 'brand.ogImage',
      value: website.ogImage || _extractMetaContent(rawHtml, 'og:image', 'property'),
      rawSnippet: ogImageSnippet,
      source: 'PHP Gateway → Open Graph Extraction',
      confidence: ogImageSnippet.length > 0 ? 100 : 0
    });
    
    // OG Title Evidence
    const ogTitleSnippet = _extractMetaTagSnippet(rawHtml, 'og:title', 'property');
    evidenceMap['brand.ogTitle'] = _captureEvidence({
      metricId: 'brand.ogTitle',
      value: website.ogTitle || _extractMetaContent(rawHtml, 'og:title', 'property'),
      rawSnippet: ogTitleSnippet,
      source: 'PHP Gateway → Open Graph Extraction',
      confidence: ogTitleSnippet.length > 0 ? 100 : 0
    });
    
    // =========================================================================
    // PERFORMANCE TAB EVIDENCE (from PageSpeed API)
    // =========================================================================
    
    const pageSpeedData = competitor.apiData?.pageSpeed || {};
    const serverHeaders = rawResponse?.headers || {};
    
    evidenceMap['performance.score'] = _captureEvidence({
      metricId: 'performance.score',
      value: pageSpeedData.scores?.performance || competitor.processedMetrics?.performanceScore || 0,
      rawSnippet: JSON.stringify({
        scores: pageSpeedData.scores,
        source: pageSpeedData.source || 'PageSpeed API'
      }),
      source: 'PageSpeed Insights API → Lighthouse Score',
      confidence: pageSpeedData.scores ? 100 : 50,
      additionalContext: {
        infrastructureFingerprint: {
          server: serverHeaders['server'] || 'Unknown',
          xPoweredBy: serverHeaders['x-powered-by'] || 'Unknown',
          cacheControl: serverHeaders['cache-control'] || 'Unknown',
          contentEncoding: serverHeaders['content-encoding'] || 'Unknown'
        }
      }
    });
    
    // =========================================================================
    // AEO TAB EVIDENCE
    // =========================================================================
    
    const aeoReadiness = synthesized.aeoReadiness || {};
    
    if (aeoReadiness.breakdown) {
      evidenceMap['aeo.headingLogic'] = _captureEvidence({
        metricId: 'aeo.headingLogic',
        value: aeoReadiness.breakdown.headingLogic?.score || 0,
        rawSnippet: (aeoReadiness.evidence?.headings?.questionHeadings || []).slice(0, 5).join('\n'),
        source: 'FT_ForensicAEO.gs → Question Pattern Matching',
        confidence: 90
      });
      
      evidenceMap['aeo.schemaBonus'] = _captureEvidence({
        metricId: 'aeo.schemaBonus',
        value: aeoReadiness.breakdown.schemaBonus?.score || 0,
        rawSnippet: JSON.stringify(aeoReadiness.evidence?.schema || {}),
        source: 'FT_ForensicAEO.gs → Schema Type Bonus Calculation',
        confidence: 95
      });
      
      evidenceMap['aeo.readability'] = _captureEvidence({
        metricId: 'aeo.readability',
        value: aeoReadiness.breakdown.readability?.score || 0,
        rawSnippet: JSON.stringify(aeoReadiness.evidence?.readability || {}),
        source: 'FT_ForensicAEO.gs → Text/HTML Ratio Calculation',
        confidence: 85
      });
    }
    
    evidenceMap['aeo.totalScore'] = _captureEvidence({
      metricId: 'aeo.totalScore',
      value: aeoReadiness.totalScore || 0,
      rawSnippet: `CriteriaA: ${aeoReadiness.breakdown?.headingLogic?.score || 0}/40 + ` +
                  `CriteriaB: ${aeoReadiness.breakdown?.schemaBonus?.score || 0}/40 + ` +
                  `CriteriaC: ${aeoReadiness.breakdown?.readability?.score || 0}/20`,
      source: 'FT_ForensicAEO.gs → calculateRAGReadyScore()',
      confidence: 95
    });
    
    // =========================================================================
    // FINALIZE METADATA
    // =========================================================================
    
    // Count total proofs
    evidenceMap._metadata.totalProofs = Object.keys(evidenceMap).filter(k => k !== '_metadata').length;
    
    // Calculate memory size
    const jsonSize = JSON.stringify(evidenceMap).length;
    evidenceMap._metadata.memorySize = _formatBytes(jsonSize);
    
    // Warn if exceeding limit
    if (jsonSize > EVIDENCE_MAX_TOTAL_SIZE) {
      console.warn(`[ZeroTrust] Evidence for ${competitor.domain} exceeds ${_formatBytes(EVIDENCE_MAX_TOTAL_SIZE)} limit`);
    }
    
    console.log(`[ZeroTrust] Collected ${evidenceMap._metadata.totalProofs} proofs (${evidenceMap._metadata.memorySize}) for ${competitor.domain}`);
    
  } catch (error) {
    console.error(`[ZeroTrust] Error collecting evidence: ${error.message}`);
    evidenceMap._metadata.error = error.message;
  }
  
  // Attach to competitor object
  competitor.evidenceMap = evidenceMap;
  
  return competitor;
}

/**
 * Capture evidence with standard structure
 * @private
 */
function _captureEvidence(params) {
  return {
    value: params.value,
    raw: {
      snippet: _truncateSnippet(params.rawSnippet || '', EVIDENCE_MAX_SNIPPET_SIZE),
      extractionMethod: params.source
    },
    source: params.source,
    confidence: params.confidence || 80,
    timestamp: new Date().toISOString(),
    additionalContext: params.additionalContext || {}
  };
}

/**
 * Get proof for a specific metric ID
 * Called by UI to display proof modal
 * 
 * @param {Object} competitor - The competitor object with evidenceMap
 * @param {string} metricId - The metric ID (e.g., 'technical.wordCount')
 * @returns {Object} Formatted proof for UI display
 */
function getProofForMetric(competitor, metricId) {
  if (!competitor || !competitor.evidenceMap) {
    return {
      found: false,
      message: 'No evidence map available for this competitor'
    };
  }
  
  const evidence = competitor.evidenceMap[metricId];
  if (!evidence) {
    return {
      found: false,
      message: `No evidence captured for metric: ${metricId}`
    };
  }
  
  return {
    found: true,
    metricId: metricId,
    displayValue: evidence.value,
    proof: {
      rawSnippet: evidence.raw?.snippet || 'No snippet available',
      parsingLogic: evidence.source,
      confidence: evidence.confidence,
      confidenceLabel: _getConfidenceLabel(evidence.confidence),
      timestamp: evidence.timestamp,
      additionalContext: evidence.additionalContext || {}
    }
  };
}

/**
 * Get all proofs for a tab category
 * 
 * @param {Object} competitor - The competitor object
 * @param {string} tabCategory - Tab prefix (e.g., 'technical', 'content', 'aeo')
 * @returns {Array} Array of proofs for that tab
 */
function getProofsForTab(competitor, tabCategory) {
  if (!competitor || !competitor.evidenceMap) return [];
  
  const proofs = [];
  const prefix = tabCategory + '.';
  
  Object.keys(competitor.evidenceMap).forEach(key => {
    if (key.startsWith(prefix)) {
      proofs.push({
        metricId: key,
        metricName: key.replace(prefix, ''),
        ...competitor.evidenceMap[key]
      });
    }
  });
  
  return proofs;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function _extractTLD(urlOrDomain) {
  try {
    const domain = urlOrDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const parts = domain.split('.');
    return '.' + parts[parts.length - 1];
  } catch (e) {
    return '.unknown';
  }
}

function _extractMainContent(html) {
  if (!html) return '';
  
  // Try to extract from main content areas
  const patterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return _stripHtml(match[1]);
    }
  }
  
  return _stripHtml(html);
}

function _stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function _extractTagSnippet(html, tagName) {
  if (!html) return '';
  const regex = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match ? match[0].substring(0, EVIDENCE_MAX_SNIPPET_SIZE) : '';
}

function _extractTagText(html, tagName) {
  if (!html) return '';
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match ? _stripHtml(match[1]) : '';
}

function _extractSchemaSnippet(html) {
  if (!html) return '';
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const matches = html.match(regex);
  if (!matches) return '';
  return matches.slice(0, 2).join('\n').substring(0, EVIDENCE_MAX_SNIPPET_SIZE);
}

function _extractMetaTagSnippet(html, name, attr = 'name') {
  if (!html) return '';
  const regex = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[0] : '';
}

function _extractMetaContent(html, name, attr = 'name') {
  if (!html) return '';
  const regex = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : '';
}

function _generateRAGCleanView(website) {
  const parts = [];
  
  if (website.title) parts.push(`# ${website.title}`);
  if (website.h1) parts.push(`\n## ${website.h1}`);
  if (website.description) parts.push(`\n${website.description}`);
  
  const h2Tags = Array.isArray(website.h2) ? website.h2 : [];
  h2Tags.forEach(h2 => parts.push(`\n### ${h2}`));
  
  return parts.join('\n');
}

function _truncateSnippet(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...[truncated]';
}

function _formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function _getConfidenceLabel(confidence) {
  if (confidence >= 95) return { label: 'Verified', color: '#22c55e' };
  if (confidence >= 80) return { label: 'High', color: '#84cc16' };
  if (confidence >= 60) return { label: 'Medium', color: '#f59e0b' };
  return { label: 'Low', color: '#ef4444' };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE POINTER API - Light Fetch from Database
// ═══════════════════════════════════════════════════════════════════════════
// These functions are called by the UI when ORACLE_STATE is empty
// They fetch minimal evidence data using job token pointers

/**
 * Get lightweight forensic evidence for AuditTrail modal
 * This fetches minimal evidence data from stored job results
 * Called when UI has no competitor data in memory
 * 
 * @param {string} jobToken - The job token from the analysis run
 * @returns {Object} Light evidence data for display
 */
function getForensicEvidenceLight(jobToken) {
  console.log(`[ZeroTrust] getForensicEvidenceLight called with token: ${jobToken}`);
  
  if (!jobToken) {
    return {
      success: false,
      message: 'No job token provided'
    };
  }
  
  try {
    // Try to load from persistent storage
    const persistedData = _loadPersistedJobData(jobToken);
    
    if (!persistedData) {
      return {
        success: false,
        message: 'No data found for job token: ' + jobToken
      };
    }
    
    // Extract lightweight evidence for UI
    const competitors = _extractLightEvidence(persistedData);
    
    return {
      success: true,
      jobToken: jobToken,
      competitors: competitors,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`[ZeroTrust] getForensicEvidenceLight error: ${error.message}`);
    return {
      success: false,
      message: 'Error loading evidence: ' + error.message
    };
  }
}

/**
 * Load persisted job data from cache or script properties
 * @private
 */
function _loadPersistedJobData(jobToken) {
  try {
    // Try CacheService first (faster)
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(`job_result_${jobToken}`);
    
    if (cachedData) {
      console.log('[ZeroTrust] Found data in cache');
      return JSON.parse(cachedData);
    }
    
    // Try script properties (longer term storage)
    const props = PropertiesService.getScriptProperties();
    const propsData = props.getProperty(`job_result_${jobToken}`);
    
    if (propsData) {
      console.log('[ZeroTrust] Found data in script properties');
      return JSON.parse(propsData);
    }
    
    // Try chunked storage pattern
    const chunkCount = parseInt(props.getProperty(`job_chunks_${jobToken}`) || '0');
    if (chunkCount > 0) {
      console.log(`[ZeroTrust] Found ${chunkCount} chunks for job`);
      let fullData = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = props.getProperty(`job_${jobToken}_chunk_${i}`);
        if (chunk) fullData += chunk;
      }
      if (fullData) {
        return JSON.parse(fullData);
      }
    }
    
    console.log('[ZeroTrust] No persisted data found for job token');
    return null;
    
  } catch (e) {
    console.error('[ZeroTrust] Error loading persisted data:', e.message);
    return null;
  }
}

/**
 * Extract lightweight evidence from full job data
 * Removes large raw HTML but keeps structured evidence
 * @private
 */
function _extractLightEvidence(jobData) {
  const competitors = jobData.competitors || [];
  
  return competitors.map(comp => {
    // Only extract what's needed for AuditTrail
    const light = {
      domain: comp.domain,
      url: comp.url,
      resultId: comp.resultId || comp.id,
      synthesized: {
        website: {
          title: comp.synthesized?.website?.title || '',
          h1: comp.synthesized?.website?.h1 || '',
          h2: (comp.synthesized?.website?.h2 || []).slice(0, 10),
          h3: (comp.synthesized?.website?.h3 || []).slice(0, 5),
          description: comp.synthesized?.website?.description || '',
          wordCount: comp.synthesized?.website?.wordCount || 0,
          schemaTypes: comp.synthesized?.website?.schemaTypes || []
        },
        aeoReadiness: comp.synthesized?.aeoReadiness || {}
      },
      evidenceMap: comp.evidenceMap || {},
      processedMetrics: comp.processedMetrics || {}
    };
    
    return light;
  });
}

/**
 * Get specific evidence snippet for a metric
 * Called when user clicks on a proof icon for a specific metric
 * 
 * @param {string} jobToken - The job token
 * @param {string} domain - Competitor domain
 * @param {string} metricId - The metric ID to get evidence for
 * @returns {Object} Evidence snippet
 */
function getEvidenceSnippet(jobToken, domain, metricId) {
  console.log(`[ZeroTrust] getEvidenceSnippet: ${domain} / ${metricId}`);
  
  try {
    const jobData = _loadPersistedJobData(jobToken);
    if (!jobData) {
      return { success: false, message: 'Job data not found' };
    }
    
    const competitor = (jobData.competitors || []).find(c => c.domain === domain);
    if (!competitor) {
      return { success: false, message: 'Competitor not found: ' + domain };
    }
    
    const evidence = competitor.evidenceMap?.[metricId];
    if (!evidence) {
      return { success: false, message: 'No evidence for metric: ' + metricId };
    }
    
    return {
      success: true,
      domain: domain,
      metricId: metricId,
      evidence: evidence
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

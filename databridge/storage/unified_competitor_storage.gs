/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED COMPETITOR DATA STORAGE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Single-cell JSON storage for ALL competitor data:
 * - Raw fetcher data (headings, metadata, opengraph, schema, internal links)
 * - Raw API responses (OpenPageRank, PageSpeed, Serper, Search Console)
 * - Processed metrics (calculated scores, normalized values)
 * - AI insights (Gemini strategic analysis, predictions, recommendations)
 * 
 * SHEET STRUCTURE:
 * Columns: [Domain | RawDataJSON | ProcessedMetricsJSON | AIInsightsJSON | LastUpdated | DataCompleteness | ProjectID]
 * 
 * WHY SINGLE JSON CELL:
 * 1. Preserves ALL data without lossy transforms
 * 2. Enables rich queries (filter by schema type, heading depth, etc.)
 * 3. Serves complete context to Gemini AI
 * 4. Frontend can cherry-pick what to render
 * 5. Easy versioning and caching
 * 
 * @module UnifiedCompetitorStorage
 * ═══════════════════════════════════════════════════════════════════════════
 */

var UNIFIED_STORAGE_CONFIG = {
  SHEET_NAME: 'CompetitorData_JSON',
  COLUMNS: {
    DOMAIN: 0,
    RAW_DATA: 1,
    PROCESSED_METRICS: 2,
    AI_INSIGHTS: 3,
    LAST_UPDATED: 4,
    DATA_COMPLETENESS: 5,
    PROJECT_ID: 6
  },
  HEADER: ['Domain', 'RawDataJSON', 'ProcessedMetricsJSON', 'AIInsightsJSON', 'LastUpdated', 'DataCompleteness', 'ProjectID']
};

/**
 * Save complete competitor data as unified JSON
 * @param {string} domain - Competitor domain (e.g., "ahrefs.com")
 * @param {Object} rawData - All fetcher + API data
 * @param {Object} processedMetrics - Calculated scores
 * @param {Object} aiInsights - Gemini analysis
 * @param {string} projectId - Project identifier
 * @param {string} spreadsheetId - Optional custom spreadsheet
 * @returns {Object} {success, domain, rowNumber}
 */
function STORAGE_saveCompetitorJSON(domain, rawData, processedMetrics, aiInsights, projectId, spreadsheetId) {
  try {
    // Validate required parameters
    if (!domain || domain === 'undefined' || domain === '') {
      Logger.log('❌ Invalid domain parameter: ' + domain);
      return {
        success: false,
        error: 'Domain parameter is required and cannot be empty'
      };
    }
    
    Logger.log('💾 Saving unified JSON for: ' + domain);
    
    // Get or create sheet
    var sheet = getOrCreateUnifiedSheet_(spreadsheetId);
    
    // Clean domain
    var cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Calculate data completeness
    var completeness = calculateDataCompleteness_(rawData, processedMetrics, aiInsights);
    
    // Find existing row or create new
    var existingRow = findDomainRow_(sheet, cleanDomain, projectId);
    
    var rowData = [
      cleanDomain,
      JSON.stringify(rawData || {}),
      JSON.stringify(processedMetrics || {}),
      JSON.stringify(aiInsights || {}),
      new Date().toISOString(),
      completeness.score + '%',
      projectId || ''
    ];
    
    if (existingRow > 0) {
      // Update existing
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      Logger.log('✅ Updated existing row: ' + existingRow);
    } else {
      // Append new
      sheet.appendRow(rowData);
      Logger.log('✅ Appended new row for: ' + cleanDomain);
    }
    
    return {
      success: true,
      domain: cleanDomain,
      rowNumber: existingRow || sheet.getLastRow(),
      completeness: completeness.score,
      dataSize: {
        rawData: JSON.stringify(rawData).length,
        processedMetrics: JSON.stringify(processedMetrics).length,
        aiInsights: JSON.stringify(aiInsights).length
      }
    };
    
  } catch (error) {
    Logger.log('❌ Error saving competitor JSON: ' + error);
    return {
      success: false,
      domain: domain,
      error: error.toString()
    };
  }
}

/**
 * Extract UI-ready filtered data for frontend rendering
 * Returns only essential metrics without large raw data payloads
 * @param {string} projectId - Project identifier
 * @param {string} spreadsheetId - Optional custom spreadsheet
 * @returns {Object} {success, competitors: [{domain, url, metrics, aiSummary}]}
 */
function STORAGE_getUIReadyData(projectId, spreadsheetId) {
  try {
    Logger.log('📊 Extracting UI-ready data for project: ' + projectId);
    
    var sheet = getOrCreateUnifiedSheet_(spreadsheetId);
    var lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      return {
        success: true,
        competitors: [],
        message: 'No competitor data found'
      };
    }
    
    var allData = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    var uiData = [];
    
    for (var i = 0; i < allData.length; i++) {
      var row = allData[i];
      var rowProjectId = row[6] || '';
      
      // Filter by projectId if provided
      if (projectId && rowProjectId !== projectId) {
        continue;
      }
      
      var domain = row[0];
      var rawDataJSON = row[1];
      var processedMetricsJSON = row[2];
      var aiInsightsJSON = row[3];
      var lastUpdated = row[4];
      var completeness = row[5];
      
      // Parse JSON safely
      var rawData = {};
      var processedMetrics = {};
      var aiInsights = {};
      
      try { rawData = JSON.parse(rawDataJSON); } catch (e) { /* ignore */ }
      try { processedMetrics = JSON.parse(processedMetricsJSON); } catch (e) { /* ignore */ }
      try { aiInsights = JSON.parse(aiInsightsJSON); } catch (e) { /* ignore */ }
      
      // Extract only essential UI metrics
      var uiItem = {
        domain: domain,
        url: 'https://' + domain,
        lastUpdated: lastUpdated,
        completeness: parseInt(completeness) || 0,
        
        // Core metrics
        metrics: {
          authority: (rawData.apis && rawData.apis.openpagerank && rawData.apis.openpagerank.pageRank) || 0,
          performance: (rawData.apis && rawData.apis.pagespeed && rawData.apis.pagespeed.performanceScore) || 0,
          organicKeywords: (rawData.apis && rawData.apis.serper && rawData.apis.serper.organicKeywords) || 0,
          organicTraffic: (rawData.apis && rawData.apis.serper && rawData.apis.serper.organicTraffic) || 0,
          
          // Rich Content Data (V6 Enhanced)
          title: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.title) || '',
          description: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.description) || '',
          keywords: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.keywords) || '',
          
          // Open Graph
          ogTitle: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.ogTitle) || '',
          ogDescription: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.ogDescription) || '',
          ogImage: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.meta_tags && rawData.fetcher.market_intel.meta_tags.ogImage) || '',
          
          // Intro Content
          introParagraphs: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.intro_paragraphs) || [],
          
          // Heading Structure WITH FULL TEXT
          h1Count: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.h1_count) || 0,
          h2Count: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.h2_count) || 0,
          h3Count: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.h3_count) || 0,
          totalHeadings: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.total_headings) || 0,
          headings: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.headings) || [], // FULL ARRAY: [{level, text, position}]
          topKeywords: (rawData.fetcher && rawData.fetcher.structure && rawData.fetcher.structure.top_keywords) || [], // Top 10: [{keyword, count}]
          
          // Technical SEO
          internalLinks: (rawData.fetcher && rawData.fetcher.internalLinks && rawData.fetcher.internalLinks.totalLinks) || 0,
          schemaTypes: (rawData.fetcher && rawData.fetcher.schema && rawData.fetcher.schema.schemaTypes) || [],
          
          // V6 Forensic Metrics
          cms: (rawData.fetcher && rawData.fetcher.market_intel && rawData.fetcher.market_intel.cms) || 'Unknown',
          humanityScore: (rawData.fetcher && rawData.fetcher.content_intel && rawData.fetcher.content_intel.humanity_score) || 0,
          uniquenessScore: (rawData.fetcher && rawData.fetcher.content_intel && rawData.fetcher.content_intel.uniqueness_score) || 0,
          frictionLevel: (rawData.fetcher && rawData.fetcher.conversion && rawData.fetcher.conversion.friction_level) || 'Unknown',
          
          // Data quality
          fetcherSuccess: (rawData.dataQuality && rawData.dataQuality.fetcherSuccess && rawData.dataQuality.fetcherSuccess.length) || 0,
          fetcherFailed: (rawData.dataQuality && rawData.dataQuality.fetcherFailed && rawData.dataQuality.fetcherFailed.length) || 0,
          apiSuccess: (rawData.dataQuality && rawData.dataQuality.apiSuccess && rawData.dataQuality.apiSuccess.length) || 0,
          apiFailed: (rawData.dataQuality && rawData.dataQuality.apiFailed && rawData.dataQuality.apiFailed.length) || 0
        },
        
        // AI insights (summary only, not full arrays)
        aiSummary: {
          strengths: (aiInsights.strengths && Array.isArray(aiInsights.strengths)) ? aiInsights.strengths.slice(0, 3) : [],
          weaknesses: (aiInsights.weaknesses && Array.isArray(aiInsights.weaknesses)) ? aiInsights.weaknesses.slice(0, 3) : [],
          opportunities: (aiInsights.opportunities && Array.isArray(aiInsights.opportunities)) ? aiInsights.opportunities.slice(0, 3) : [],
          score: aiInsights.competitiveScore || 0
        }
      };
      
      uiData.push(uiItem);
    }
    
    Logger.log('✅ Extracted ' + uiData.length + ' competitors for UI');
    
    return {
      success: true,
      competitors: uiData,
      projectId: projectId,
      totalCompetitors: uiData.length
    };
    
  } catch (error) {
    Logger.log('❌ Error extracting UI data: ' + error);
    return {
      success: false,
      error: error.toString(),
      competitors: []
    };
  }
}

/**
 * Read complete competitor data from unified storage
 * @param {string} domain - Competitor domain
 * @param {string} projectId - Optional project filter
 * @param {string} spreadsheetId - Optional custom spreadsheet
 * @returns {Object} {success, domain, rawData, processedMetrics, aiInsights, metadata}
 */
function STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId) {
  try {
    // Validate required parameters
    if (!domain || domain === 'undefined' || domain === '') {
      Logger.log('❌ Invalid domain parameter: ' + domain);
      return {
        success: false,
        error: 'Domain parameter is required and cannot be empty'
      };
    }
    
    Logger.log('📖 Reading unified JSON for: ' + domain);
    
    var sheet = getOrCreateUnifiedSheet_(spreadsheetId);
    var cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    var rowIndex = findDomainRow_(sheet, cleanDomain, projectId);
    
    if (rowIndex < 1) {
      Logger.log('⚠️ No data found for: ' + cleanDomain);
      return {
        success: false,
        domain: cleanDomain,
        error: 'Domain not found in storage'
      };
    }
    
    var rowData = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];
    var cols = UNIFIED_STORAGE_CONFIG.COLUMNS;
    
    // Parse JSON safely
    var rawData = safeJSONParse_(rowData[cols.RAW_DATA]);
    var processedMetrics = safeJSONParse_(rowData[cols.PROCESSED_METRICS]);
    var aiInsights = safeJSONParse_(rowData[cols.AI_INSIGHTS]);
    
    Logger.log('✅ Found data for ' + cleanDomain + ' (Row ' + rowIndex + ')');
    Logger.log('   - Raw data size: ' + (rowData[cols.RAW_DATA] || '').length + ' chars');
    Logger.log('   - Completeness: ' + rowData[cols.DATA_COMPLETENESS]);
    
    return {
      success: true,
      domain: cleanDomain,
      rawData: rawData,
      processedMetrics: processedMetrics,
      aiInsights: aiInsights,
      metadata: {
        lastUpdated: rowData[cols.LAST_UPDATED],
        dataCompleteness: rowData[cols.DATA_COMPLETENESS],
        projectId: rowData[cols.PROJECT_ID],
        rowNumber: rowIndex
      }
    };
    
  } catch (error) {
    Logger.log('❌ Error reading competitor JSON: ' + error);
    return {
      success: false,
      domain: domain,
      error: error.toString()
    };
  }
}

/**
 * Update partial competitor data (e.g., add AI insights after Gemini analysis)
 * @param {string} domain - Competitor domain
 * @param {Object} updates - {rawData?, processedMetrics?, aiInsights?}
 * @param {string} projectId - Project identifier
 * @param {string} spreadsheetId - Optional custom spreadsheet
 * @returns {Object} {success, domain, updated}
 */
function STORAGE_updatePartialJSON(domain, updates, projectId, spreadsheetId) {
  try {
    // Validate required parameters
    if (!domain || domain === 'undefined' || domain === '') {
      Logger.log('❌ Invalid domain parameter: ' + domain);
      return {
        success: false,
        error: 'Domain parameter is required and cannot be empty'
      };
    }
    
    if (!updates || typeof updates !== 'object') {
      Logger.log('❌ Invalid updates parameter');
      return {
        success: false,
        error: 'Updates parameter must be an object'
      };
    }
    
    Logger.log('🔄 Updating partial data for: ' + domain);
    
    // Read existing data
    var existing = STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId);
    
    if (!existing.success) {
      Logger.log('⚠️ No existing data, creating new entry');
      return STORAGE_saveCompetitorJSON(
        domain,
        updates.rawData || {},
        updates.processedMetrics || {},
        updates.aiInsights || {},
        projectId,
        spreadsheetId
      );
    }
    
    // Merge updates with existing data
    var mergedRawData = updates.rawData 
      ? mergeDeep_(existing.rawData || {}, updates.rawData)
      : existing.rawData;
      
    var mergedProcessedMetrics = updates.processedMetrics
      ? mergeDeep_(existing.processedMetrics || {}, updates.processedMetrics)
      : existing.processedMetrics;
      
    var mergedAIInsights = updates.aiInsights
      ? mergeDeep_(existing.aiInsights || {}, updates.aiInsights)
      : existing.aiInsights;
    
    Logger.log('📊 Merged updates - Raw: ' + Object.keys(mergedRawData || {}).length + ' keys');
    
    // Save merged data
    return STORAGE_saveCompetitorJSON(
      domain,
      mergedRawData,
      mergedProcessedMetrics,
      mergedAIInsights,
      projectId,
      spreadsheetId
    );
    
  } catch (error) {
    Logger.log('❌ Error updating partial JSON: ' + error);
    return {
      success: false,
      domain: domain,
      error: error.toString()
    };
  }
}

/**
 * Read all competitors for a project
 * @param {string} projectId - Project identifier
 * @param {string} spreadsheetId - Optional custom spreadsheet
 * @returns {Object} {success, competitors: [{domain, rawData, processedMetrics, aiInsights}]}
 */
function STORAGE_readAllCompetitorsJSON(projectId, spreadsheetId) {
  try {
    Logger.log('📚 Reading all competitors for project: ' + projectId);
    
    var sheet = getOrCreateUnifiedSheet_(spreadsheetId);
    var data = sheet.getDataRange().getValues();
    var cols = UNIFIED_STORAGE_CONFIG.COLUMNS;
    
    var competitors = [];
    
    for (var i = 1; i < data.length; i++) { // Skip header
      var row = data[i];
      
      // Filter by project if specified
      if (projectId && row[cols.PROJECT_ID] !== projectId) {
        continue;
      }
      
      var domain = row[cols.DOMAIN];
      if (!domain || domain === '') continue;
      
      competitors.push({
        domain: domain,
        rawData: safeJSONParse_(row[cols.RAW_DATA]),
        processedMetrics: safeJSONParse_(row[cols.PROCESSED_METRICS]),
        aiInsights: safeJSONParse_(row[cols.AI_INSIGHTS]),
        metadata: {
          lastUpdated: row[cols.LAST_UPDATED],
          dataCompleteness: row[cols.DATA_COMPLETENESS],
          projectId: row[cols.PROJECT_ID]
        }
      });
    }
    
    Logger.log('✅ Found ' + competitors.length + ' competitors for project: ' + projectId);
    
    return {
      success: true,
      count: competitors.length,
      competitors: competitors
    };
    
  } catch (error) {
    Logger.log('❌ Error reading all competitors: ' + error);
    return {
      success: false,
      error: error.toString(),
      competitors: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get or create unified storage sheet
 */
function getOrCreateUnifiedSheet_(spreadsheetId) {
  // Default spreadsheet ID if not provided (for standalone backend)
  var defaultSpreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  var ss;
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else if (defaultSpreadsheetId) {
    // Use default for standalone backend
    ss = SpreadsheetApp.openById(defaultSpreadsheetId);
  } else {
    // Fallback to active spreadsheet (for bound scripts)
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  if (!ss) {
    throw new Error('Cannot access spreadsheet. Provide spreadsheetId or set default.');
  }
  
  var sheet = ss.getSheetByName(UNIFIED_STORAGE_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    Logger.log('📄 Creating new unified storage sheet: ' + UNIFIED_STORAGE_CONFIG.SHEET_NAME);
    sheet = ss.insertSheet(UNIFIED_STORAGE_CONFIG.SHEET_NAME);
    
    // Set header
    sheet.getRange(1, 1, 1, UNIFIED_STORAGE_CONFIG.HEADER.length)
      .setValues([UNIFIED_STORAGE_CONFIG.HEADER])
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, UNIFIED_STORAGE_CONFIG.HEADER.length);
  }
  
  return sheet;
}

/**
 * Find row for domain + project
 */
function findDomainRow_(sheet, domain, projectId) {
  var data = sheet.getDataRange().getValues();
  var cols = UNIFIED_STORAGE_CONFIG.COLUMNS;
  
  for (var i = 1; i < data.length; i++) { // Skip header
    if (data[i][cols.DOMAIN] === domain) {
      // If projectId specified, must match
      if (!projectId || data[i][cols.PROJECT_ID] === projectId) {
        return i + 1; // Sheet rows are 1-indexed
      }
    }
  }
  
  return -1; // Not found
}

/**
 * Safe JSON parse with fallback
 */
function safeJSONParse_(jsonString) {
  if (!jsonString || jsonString === '') return {};
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    Logger.log('⚠️ JSON parse error: ' + e + ' | String: ' + jsonString.substring(0, 100));
    return {};
  }
}

/**
 * Calculate data completeness percentage
 */
function calculateDataCompleteness_(rawData, processedMetrics, aiInsights) {
  var total = 0;
  var completed = 0;
  
  // Check raw data sources
  var requiredSources = {
    'fetcher.headings': rawData && rawData.fetcher && rawData.fetcher.headings,
    'fetcher.metadata': rawData && rawData.fetcher && rawData.fetcher.metadata,
    'fetcher.opengraph': rawData && rawData.fetcher && rawData.fetcher.opengraph,
    'fetcher.schema': rawData && rawData.fetcher && rawData.fetcher.schema,
    'fetcher.internalLinks': rawData && rawData.fetcher && rawData.fetcher.internalLinks,
    'apis.openpagerank': rawData && rawData.apis && rawData.apis.openpagerank,
    'apis.pagespeed': rawData && rawData.apis && rawData.apis.pagespeed,
    'apis.serper': rawData && rawData.apis && rawData.apis.serper,
    'processedMetrics': processedMetrics && Object.keys(processedMetrics).length > 0,
    'aiInsights': aiInsights && Object.keys(aiInsights).length > 0
  };
  
  for (var key in requiredSources) {
    total++;
    if (requiredSources[key]) completed++;
  }
  
  var score = Math.round((completed / total) * 100);
  
  return {
    score: score,
    completed: completed,
    total: total,
    missing: Object.keys(requiredSources).filter(function(k) { return !requiredSources[k]; })
  };
}

/**
 * Deep merge objects
 */
function mergeDeep_(target, source) {
  var output = Object.assign({}, target);
  
  if (isObject_(target) && isObject_(source)) {
    Object.keys(source).forEach(function(key) {
      if (isObject_(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep_(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject_(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test unified storage system
 * NOTE: DataBridge is STANDALONE - uses explicit spreadsheet ID
 */
function TEST_unifiedStorage() {
  Logger.log('🧪 Testing Unified Storage System');
  
  // DATABRIDGE BACKEND: Use explicit spreadsheet ID (not bound to sheet)
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  Logger.log('📋 Using spreadsheet ID: ' + spreadsheetId);
  
  // Test 1: Save competitor with full data
  var testRawData = {
    fetcher: {
      headings: [
        { level: 'h1', text: 'SEO Tools & Software', keywords: ['seo', 'tools'] },
        { level: 'h2', text: 'Keyword Research', keywords: ['keyword', 'research'] },
        { level: 'h2', text: 'Backlink Analysis', keywords: ['backlink', 'analysis'] }
      ],
      metadata: {
        title: 'Ahrefs - SEO Tools & Resources',
        description: 'Everything you need to rank higher...',
        wordCount: 2450,
        images: 15,
        videos: 3
      },
      opengraph: {
        title: 'Ahrefs - SEO Tools',
        image: 'https://ahrefs.com/og-image.jpg',
        type: 'website'
      },
      schema: [
        { type: 'Organization', name: 'Ahrefs' },
        { type: 'Product', name: 'Ahrefs SEO Toolkit' }
      ],
      internalLinks: {
        total: 45,
        topPages: ['/blog', '/academy', '/tools']
      }
    },
    apis: {
      openpagerank: {
        pageRank: 73,
        domainRank: 8.9,
        totalBacklinks: 4500000,
        referringDomains: 119100
      },
      pagespeed: {
        performanceScore: 92,
        fcp: 1.2,
        lcp: 2.1,
        cls: 0.05,
        tti: 2.8
      },
      serper: {
        organicKeywords: 492900,
        paidKeywords: 1200,
        organicTraffic: 3800000
      }
    }
  };
  
  var testProcessedMetrics = {
    authorityScore: 73,
    performanceScore: 92,
    contentDepth: 85,
    technicalSEO: 88,
    overallScore: 84
  };
  
  var testAIInsights = {
    strategicSummary: 'Ahrefs demonstrates exceptional authority...',
    contentGaps: ['Video tutorials', 'Case studies', 'Templates'],
    opportunityMatrix: {
      highImpactLowComp: ['long-tail keywords', 'local seo'],
      quickWins: ['schema markup', 'internal linking']
    },
    predictions: {
      trafficGrowth: '+15% in 6 months',
      authorityGrowth: '+2 points'
    }
  };
  
  Logger.log('💾 Saving unified JSON for: ahrefs.com');
  
  // Save
  var saveResult = STORAGE_saveCompetitorJSON(
    'ahrefs.com',
    testRawData,
    testProcessedMetrics,
    testAIInsights,
    'test-project-001',
    spreadsheetId
  );
  
  Logger.log('💾 Save result: ' + JSON.stringify(saveResult));
  
  if (!saveResult.success) {
    Logger.log('❌ Save failed! Cannot proceed with test.');
    return;
  }
  
  Logger.log('📖 Reading unified JSON for: ahrefs.com');
  
  // Read back
  var readResult = STORAGE_readCompetitorJSON('ahrefs.com', 'test-project-001', spreadsheetId);
  
  Logger.log('📖 Read result success: ' + readResult.success);
  Logger.log('📖 Domain: ' + readResult.domain);
  Logger.log('📖 Completeness: ' + readResult.metadata.dataCompleteness);
  Logger.log('📖 Headings count: ' + (readResult.rawData.fetcher.headings ? readResult.rawData.fetcher.headings.length : 0));
  Logger.log('📖 Authority score: ' + (readResult.processedMetrics ? readResult.processedMetrics.authorityScore : 'N/A'));
  
  // Test partial update
  Logger.log('🔄 Testing partial update...');
  var updateResult = STORAGE_updatePartialJSON(
    'ahrefs.com',
    {
      aiInsights: {
        updatedAnalysis: 'New insights from Gemini 2.0...',
        timestamp: new Date().toISOString()
      }
    },
    'test-project-001',
    spreadsheetId
  );
  
  Logger.log('🔄 Update result: ' + JSON.stringify(updateResult));
  
  Logger.log('✅ Unified storage test complete!');
}
}

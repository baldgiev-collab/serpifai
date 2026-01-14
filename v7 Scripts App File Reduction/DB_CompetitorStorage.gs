/**
 * DB_CompetitorStorage.gs
 * Handles parallel storage of competitor analysis results
 * Saves to: 1) MySQL database, 2) Master Google Sheet
 * v26.0: FIXED - No longer deletes essential data needed by UI
 */

/**
 * v26.0 BALANCED TURBO: Trim ONLY truly unnecessary fields
 * CRITICAL: Do NOT delete stages, synthesized, or apiData - UI needs them!
 * Only removes raw HTML content and limits array sizes
 */
function trimLargeFields(competitorsArray) {
  if (!Array.isArray(competitorsArray)) return competitorsArray;
  
  return competitorsArray.map(comp => {
    const trimmed = { ...comp };
    
    // v26.0: Remove ONLY raw HTML content (huge strings, not needed)
    if (trimmed.snapshot?.rawHtml) delete trimmed.snapshot.rawHtml;
    if (trimmed.apiData?.rawHtml) delete trimmed.apiData.rawHtml;
    if (trimmed.synthesized?.rawHtml) delete trimmed.synthesized.rawHtml;
    
    // v26.0: Remove content strings from stages (keep metadata)
    if (trimmed.stages?.phpFetcher?.data?.content) {
      trimmed.stages.phpFetcher.data._contentTrimmed = true;
      delete trimmed.stages.phpFetcher.data.content;
    }
    if (trimmed.stages?.oracleFetcher?.data?.content) {
      trimmed.stages.oracleFetcher.data._contentTrimmed = true;
      delete trimmed.stages.oracleFetcher.data.content;
    }
    
    // v26.0: Limit keywords (keep 75 for good analysis)
    if (trimmed.synthesized?.keywords && Array.isArray(trimmed.synthesized.keywords)) {
      if (trimmed.synthesized.keywords.length > 75) {
        trimmed.synthesized.keywords = trimmed.synthesized.keywords.slice(0, 75);
        trimmed.synthesized._keywordsTrimmed = true;
      }
    }
    
    // v26.0: Limit topPages (keep 20 for UI)
    if (trimmed.synthesized?.topPages && Array.isArray(trimmed.synthesized.topPages)) {
      if (trimmed.synthesized.topPages.length > 20) {
        trimmed.synthesized.topPages = trimmed.synthesized.topPages.slice(0, 20);
        trimmed.synthesized._topPagesTrimmed = true;
      }
    }
    
    // v26.0: Limit internal links (keep 40 for analysis)
    if (trimmed.snapshot?.links?.internal && Array.isArray(trimmed.snapshot.links.internal)) {
      if (trimmed.snapshot.links.internal.length > 40) {
        trimmed.snapshot.links.internal = trimmed.snapshot.links.internal.slice(0, 40);
      }
    }
    
    // v26.0: Limit external links (keep 20, don't delete entirely)
    if (trimmed.snapshot?.links?.external && Array.isArray(trimmed.snapshot.links.external)) {
      if (trimmed.snapshot.links.external.length > 20) {
        trimmed.snapshot.links.external = trimmed.snapshot.links.external.slice(0, 20);
      }
    }
    
    // Remove duplicate oracleData if already merged into synthesized
    if (trimmed.oracleData && trimmed.synthesized?.eliteTraffic) {
      delete trimmed.oracleData;
    }
    
    // v26.0: KEEP stages - UI needs serper/pageSpeed/openPageRank data!
    // Only remove rawResponse strings from stages
    if (trimmed.stages) {
      Object.keys(trimmed.stages).forEach(key => {
        if (trimmed.stages[key]?.rawResponse) {
          delete trimmed.stages[key].rawResponse;
        }
        // Remove large HTML content from stage data
        if (trimmed.stages[key]?.data?.html) {
          delete trimmed.stages[key].data.html;
        }
      });
    }
    
    // v26.0: KEEP proofTraces but limit to 10 entries
    if (trimmed.proofTraces && Array.isArray(trimmed.proofTraces)) {
      if (trimmed.proofTraces.length > 10) {
        trimmed.proofTraces = trimmed.proofTraces.slice(0, 10);
      }
    }
    
    return trimmed;
  });
}

/**
 * Store the master spreadsheet ID for use in sidebar/dialog contexts
 * Call this when the spreadsheet context is available
 */
function setMasterSpreadsheetId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    const scriptProps = PropertiesService.getScriptProperties();
    scriptProps.setProperty('MASTER_SPREADSHEET_ID', ss.getId());
    Logger.log('✅ Master spreadsheet ID saved: ' + ss.getId());
    return { success: true, spreadsheetId: ss.getId() };
  }
  return { success: false, error: 'No active spreadsheet' };
}

/**
 * Save competitor analysis results to both MySQL and Google Sheet
 * SIGNATURE: saveCompetitorResults(enrichedData, analysis, projectId, config)
 * @param {object} enrichedData - Competitor data with API enrichment (object with domain keys)
 * @param {object} analysis - Gemini analysis results
 * @param {string} projectId - Project identifier
 * @param {object} config - Original configuration
 * @returns {object} Storage confirmation
 */
function saveCompetitorResults(enrichedData, analysis, projectId, config) {
  try {
    Logger.log('💾 Saving competitor results to MySQL + Google Sheet...');
    
    // Extract configuration
    config = config || {};
    const yourDomain = config.yourDomain || 'Your Site';
    const competitors = config.competitors || [];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: Transform enrichedData object to array for consistent storage
    // This ensures UI can directly use the loaded data without transformation
    // ═══════════════════════════════════════════════════════════════════════════
    let competitorsArray = [];
    if (enrichedData && typeof enrichedData === 'object') {
      if (Array.isArray(enrichedData)) {
        competitorsArray = enrichedData;
      } else {
        // Convert object with domain keys to array
        competitorsArray = Object.values(enrichedData).map(comp => ({
          ...comp,
          url: comp.url || comp.domain || 'unknown'
        }));
      }
    }
    
    // Log data quality for debugging
    Logger.log('📊 Data quality check:');
    Logger.log('   Competitors count: ' + competitorsArray.length);
    if (competitorsArray.length > 0) {
      const first = competitorsArray[0];
      Logger.log('   First competitor: ' + first.domain);
      Logger.log('   Has apiData: ' + (!!first.apiData));
      Logger.log('   Has processedMetrics: ' + (!!first.processedMetrics));
      Logger.log('   Has stages: ' + (!!first.stages));
      Logger.log('   Has synthesized: ' + (!!first.synthesized));
      Logger.log('   Has snapshot: ' + (!!first.snapshot));
      
      // Log key counts for verification
      if (first.processedMetrics) {
        Logger.log('   processedMetrics keys: ' + Object.keys(first.processedMetrics).length);
      }
      if (first.apiData) {
        Logger.log('   apiData keys: ' + Object.keys(first.apiData).join(', '));
      }
    }
    
    // Prepare COMPLETE data for storage
    // This includes ALL nested structures needed for UI rendering
    const storageData = {
      projectId: projectId,
      timestamp: new Date().toISOString(),
      competitors: competitors, // Domain list for quick reference
      yourDomain: yourDomain,
      analysisType: 'elite_competitor_analysis',
      
      // ═══════════════════════════════════════════════════════════════════════════
      // COMPLETE DATA STORAGE - All structures needed for ALL 15 TABS
      // ═══════════════════════════════════════════════════════════════════════════
      rawData: enrichedData || {},          // Original object format (domain keys)
      competitorsArray: competitorsArray,   // Pre-transformed array format
      
      // Analysis results from Gemini
      insights: analysis?.insights || {},
      charts: analysis?.charts || {},
      geminiAnalysis: analysis || {},
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE TAB INTELLIGENCE - Contains data for ALL 15 tabs:
      // Tab 1: overviewDashboard, Tab 2: marketIntelligence, Tab 3: brandPosition
      // Tab 4: technicalSeo, Tab 5: contentIntel, Tab 6: keywordStrategy
      // Tab 7: contentSystems, Tab 8: conversion, Tab 9: distribution
      // Tab 10: audienceIntel, Tab 11: geoAeo, Tab 12: authority
      // Tab 13: performance, Tab 14: opportunities, Tab 15: scoringEngine
      // Plus: hoverInsights, competitorProofs, killMoves, dataSources, dataQuality
      // ═══════════════════════════════════════════════════════════════════════════
      eliteTabIntelligence: analysis?.eliteTabIntelligence || config.eliteTabIntelligence || null,
      
      // Overview and Dashboard Charts (for chart rendering on load)
      overview: config.overview || null,
      dashboardCharts: config.dashboardCharts || null,
      
      // Metadata for validation
      dataIntegrity: {
        competitorCount: competitorsArray.length,
        hasApiData: competitorsArray.some(c => !!c.apiData),
        hasProcessedMetrics: competitorsArray.some(c => !!c.processedMetrics),
        hasStages: competitorsArray.some(c => !!c.stages),
        hasSynthesized: competitorsArray.some(c => !!c.synthesized),
        fetchSuccessCount: competitorsArray.filter(c => c.fetchSuccess !== false).length,
        hasEliteTabIntelligence: !!(analysis?.eliteTabIntelligence || config.eliteTabIntelligence)
      }
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // v24.0 TURBO: Trim large unnecessary fields to reduce payload size
    // This can reduce payload by 30-50% (4.4MB → 2-3MB)
    // ═══════════════════════════════════════════════════════════════════════════
    storageData.competitorsArray = trimLargeFields(storageData.competitorsArray);
    // Also trim rawData (often duplicate of competitorsArray)
    if (Object.keys(storageData.rawData || {}).length > 0) {
      // rawData is redundant - competitorsArray has everything we need
      storageData.rawData = { _trimmed: true, _reason: 'Use competitorsArray instead' };
    }
    
    // Log what tabs are included in eliteTabIntelligence
    if (storageData.eliteTabIntelligence) {
      const tabKeys = Object.keys(storageData.eliteTabIntelligence);
      Logger.log('📊 Elite Tab Intelligence saved with ' + tabKeys.length + ' keys:');
      Logger.log('   Tabs: ' + tabKeys.slice(0, 15).join(', '));
    } else {
      Logger.log('⚠️ No Elite Tab Intelligence available for storage');
    }
    
    // Convert to JSON
    const jsonData = JSON.stringify(storageData);
    Logger.log('📦 JSON data size: ' + (jsonData.length / 1024).toFixed(2) + ' KB (after v24.0 trimming)');
    
    // Prepare metadata for MySQL
    const metadata = {
      competitorCount: competitorsArray.length,
      dataQuality: storageData.dataIntegrity.hasApiData ? 'GOOD' : 
                   storageData.dataIntegrity.fetchSuccessCount > 0 ? 'PARTIAL' : 'POOR',
      apiSuccess: storageData.dataIntegrity.fetchSuccessCount + '/' + competitorsArray.length,
      timestamp: storageData.timestamp
    };
    
    Logger.log('📊 Data quality: ' + metadata.dataQuality + ' (' + metadata.apiSuccess + ' successful)');
    
    // Save to MySQL (via gateway)
    const mysqlResult = saveToMySQL(projectId, jsonData, competitors, yourDomain, metadata);
    
    // Save to Google Sheet (parallel)
    const sheetResult = saveToMasterSheet(projectId, storageData);
    
    Logger.log('✅ Storage complete - MySQL: ' + mysqlResult.success + ', Sheet: ' + sheetResult.success);
    
    return {
      success: true,
      mysql: mysqlResult,
      sheets: sheetResult,
      projectId: projectId,
      timestamp: storageData.timestamp,
      dataIntegrity: storageData.dataIntegrity
    };
    
  } catch (error) {
    Logger.log('❌ Storage error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Save results to MySQL via gateway
 * v23.1: Implements chunked saving for large payloads (>500KB) to prevent 504 timeouts
 */
function saveToMySQL(projectId, jsonData, competitors, yourDomain, metadata) {
  // v25.0 ULTRA TURBO: Increased from 300KB to 500KB to minimize chunks
  // Fewer chunks = faster uploads = much less timeout risk
  const MAX_CHUNK_SIZE = 500 * 1024; // 500KB per chunk
  const dataSize = jsonData.length;
  
  try {
    // If data is small enough, send in single request
    if (dataSize < MAX_CHUNK_SIZE) {
      Logger.log('📤 Sending data in single request (' + Math.round(dataSize/1024) + 'KB)');
      const result = callGateway('comp:save_results', {
        projectId: projectId,
        data: jsonData,
        competitors: competitors || [],
        yourDomain: yourDomain || '',
        metadata: metadata || {
          competitorCount: 0,
          dataQuality: 'unknown',
          apiSuccess: '0/0',
          timestamp: new Date().toISOString()
        }
      });
      return result;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // v23.2 CHUNKED UPLOAD for large payloads (>100KB)
    // Prevents 504 Gateway Timeout by splitting into smaller, faster requests
    // ═══════════════════════════════════════════════════════════════════════════
    Logger.log('📦 Data too large (' + Math.round(dataSize/1024) + 'KB), using chunked upload...');
    
    // Calculate chunks
    const chunks = [];
    for (let i = 0; i < jsonData.length; i += MAX_CHUNK_SIZE) {
      chunks.push(jsonData.substring(i, i + MAX_CHUNK_SIZE));
    }
    
    Logger.log('   Splitting into ' + chunks.length + ' chunks');
    
    // Send first chunk with metadata
    const initResult = callGateway('comp:save_results_init', {
      projectId: projectId,
      totalChunks: chunks.length,
      totalSize: dataSize,
      competitors: competitors || [],
      yourDomain: yourDomain || '',
      metadata: metadata || {}
    });
    
    if (!initResult.success) {
      // Fallback: Try single request anyway (gateway might handle compression)
      Logger.log('   ⚠️ Chunked init failed, trying single request fallback...');
      const fallbackResult = callGateway('comp:save_results', {
        projectId: projectId,
        data: jsonData,
        competitors: competitors || [],
        yourDomain: yourDomain || '',
        metadata: metadata || {}
      });
      return fallbackResult;
    }
    
    const uploadId = initResult.uploadId || projectId + '_' + Date.now();
    
    // Send each chunk with retry logic
    let failedChunks = 0;
    for (let i = 0; i < chunks.length; i++) {
      Logger.log('   📤 Sending chunk ' + (i + 1) + '/' + chunks.length + ' (' + Math.round(chunks[i].length/1024) + 'KB)');
      
      // v23.2: Add retry logic for failed chunks
      let chunkResult = { success: false };
      let attempts = 0;
      const maxAttempts = 2; // v25.0: Reduced from 3 for speed
      
      while (!chunkResult.success && attempts < maxAttempts) {
        attempts++;
        if (attempts > 1) {
          Logger.log('      ⏳ Retry attempt ' + attempts + '/' + maxAttempts + '...');
          Utilities.sleep(500); // v25.0: Reduced from exponential to fixed 500ms
        }
        
        try {
          chunkResult = callGateway('comp:save_results_chunk', {
            projectId: projectId,
            uploadId: uploadId,
            chunkIndex: i,
            totalChunks: chunks.length,
            chunkData: chunks[i]
          });
        } catch (chunkError) {
          Logger.log('      ⚠️ Chunk error: ' + chunkError.toString());
        }
      }
      
      if (!chunkResult.success) {
        failedChunks++;
        Logger.log('   ❌ Chunk ' + (i + 1) + ' failed after ' + maxAttempts + ' attempts');
      }
      
      // v26.0: Small delay between chunks to prevent server overload
      if (i < chunks.length - 1) {
        Utilities.sleep(50); // 50ms between chunks
      }
    }
    
    if (failedChunks > 0) {
      Logger.log('   ⚠️ ' + failedChunks + '/' + chunks.length + ' chunks failed');
    }
    
    // Finalize upload
    const finalizeResult = callGateway('comp:save_results_finalize', {
      projectId: projectId,
      uploadId: uploadId,
      totalChunks: chunks.length,
      metadata: metadata || {}
    });
    
    Logger.log('   ✅ Chunked upload complete: ' + (finalizeResult.success ? 'SUCCESS' : 'FAILED'));
    return finalizeResult;
    
  } catch (error) {
    Logger.log('MySQL save error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Save results to Master Google Sheet
 * UPDATED: Now updates existing rows instead of always appending (prevents duplicates)
 * FIXED v8.5: Handles null spreadsheet from sidebar context
 */
function saveToMasterSheet(projectId, data) {
  try {
    // Try to get active spreadsheet first, then fall back to script properties
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // If called from sidebar/dialog context, getActiveSpreadsheet() returns null
    if (!ss) {
      const scriptProps = PropertiesService.getScriptProperties();
      const savedSpreadsheetId = scriptProps.getProperty('MASTER_SPREADSHEET_ID');
      
      if (savedSpreadsheetId) {
        try {
          ss = SpreadsheetApp.openById(savedSpreadsheetId);
        } catch (e) {
          Logger.log('Failed to open saved spreadsheet: ' + e.toString());
        }
      }
      
      // If still no spreadsheet, skip sheet saving gracefully
      if (!ss) {
        Logger.log('No spreadsheet available for sheet saving - skipping sheet save (will use MySQL only)');
        return {
          success: false,
          error: 'No spreadsheet context - data saved to MySQL only',
          skipped: true
        };
      }
    }
    
    // Get or create "Competitor Analysis" sheet
    var sheet = ss.getSheetByName('Competitor Analysis');
    if (!sheet) {
      sheet = ss.insertSheet('Competitor Analysis');
      
      // Add headers
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Project ID', 'Timestamp', 'Competitors', 'Your Domain', 
        'Data Quality', 'Insights Count', 'Charts Count', 'JSON Data'
      ]]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    }
    
    // Prepare row data
    const rowData = [
      projectId,
      data.timestamp,
      data.competitors.join(', '),
      data.yourDomain,
      data.analysisType,
      Object.keys(data.insights).length,
      Object.keys(data.charts).length,
      JSON.stringify(data)
    ];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK IF PROJECT ALREADY EXISTS - Update instead of append to prevent duplicates
    // ═══════════════════════════════════════════════════════════════════════════
    const existingData = sheet.getDataRange().getValues();
    let existingRow = -1;
    
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === projectId) {
        existingRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (existingRow > 0) {
      // UPDATE existing row
      sheet.getRange(existingRow, 1, 1, 8).setValues([rowData]);
      Logger.log('✅ Updated existing row in Google Sheet: Row ' + existingRow);
    } else {
      // Append new row
      sheet.appendRow(rowData);
      existingRow = sheet.getLastRow();
      Logger.log('✅ Appended new row to Google Sheet: Row ' + existingRow);
    }
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 7);
    
    return {
      success: true,
      sheetName: 'Competitor Analysis',
      row: existingRow,
      url: ss.getUrl(),
      action: existingRow === sheet.getLastRow() ? 'created' : 'updated'
    };
    
  } catch (error) {
    Logger.log('Sheet save error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load competitor results from MySQL or Google Sheet
 */
function loadCompetitorResults(projectId) {
  try {
    // Try MySQL first
    const mysqlResult = callGateway('comp:load_results', {
      projectId: projectId
    });
    
    if (mysqlResult && mysqlResult.success) {
      return {
        success: true,
        source: 'mysql',
        data: JSON.parse(mysqlResult.data)
      };
    }
    
    // Fallback to Google Sheet
    const sheetResult = loadFromMasterSheet(projectId);
    if (sheetResult && sheetResult.success) {
      return {
        success: true,
        source: 'sheet',
        data: sheetResult.data
      };
    }
    
    return {
      success: false,
      error: 'No results found for project: ' + projectId
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load from Google Sheet
 * UPDATED: Returns the LATEST entry for a project (by timestamp) to handle any legacy duplicates
 */
function loadFromMasterSheet(projectId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Competitor Analysis');
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find ALL rows with matching projectId, then pick the latest one
    let latestRow = -1;
    let latestTimestamp = null;
    let latestData = null;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === projectId) {
        const rowTimestamp = data[i][1]; // Timestamp is in column 2
        
        // Compare timestamps (either Date objects or ISO strings)
        const currentDate = rowTimestamp ? new Date(rowTimestamp) : new Date(0);
        const latestDate = latestTimestamp ? new Date(latestTimestamp) : new Date(0);
        
        if (currentDate >= latestDate) {
          latestTimestamp = rowTimestamp;
          latestRow = i + 1;
          latestData = data[i][7]; // JSON data is in column 8
        }
      }
    }
    
    if (latestRow > 0 && latestData) {
      Logger.log('📂 Loading competitor analysis from Sheet row ' + latestRow + ' (timestamp: ' + latestTimestamp + ')');
      return {
        success: true,
        data: JSON.parse(latestData),
        row: latestRow
      };
    }
    
    return { success: false, error: 'Project not found' };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UTILITY: Clean up duplicate rows in Competitor Analysis sheet
 * Keeps only the LATEST row for each project ID
 * Run this once to fix any legacy duplicate issues
 * ═══════════════════════════════════════════════════════════════════════════
 */
function CLEANUP_DuplicateCompetitorAnalysis() {
  try {
    Logger.log('🧹 Starting cleanup of duplicate competitor analysis rows...');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Competitor Analysis');
    
    if (!sheet) {
      Logger.log('ℹ️ No "Competitor Analysis" sheet found - nothing to clean');
      return { success: true, message: 'No sheet to clean' };
    }
    
    const data = sheet.getDataRange().getValues();
    Logger.log('📊 Found ' + (data.length - 1) + ' rows in Competitor Analysis sheet');
    
    // Build map of projectId -> latest row info
    const projectMap = {};
    const rowsToDelete = [];
    
    for (var i = 1; i < data.length; i++) {
      const projectId = data[i][0];
      const timestamp = data[i][1];
      const rowNumber = i + 1;
      
      if (!projectId) continue;
      
      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          latestRow: rowNumber,
          latestTimestamp: timestamp
        };
      } else {
        // Compare timestamps
        const currentDate = timestamp ? new Date(timestamp) : new Date(0);
        const latestDate = projectMap[projectId].latestTimestamp ? 
          new Date(projectMap[projectId].latestTimestamp) : new Date(0);
        
        if (currentDate > latestDate) {
          // This row is newer - mark old row for deletion
          rowsToDelete.push(projectMap[projectId].latestRow);
          projectMap[projectId] = {
            latestRow: rowNumber,
            latestTimestamp: timestamp
          };
        } else {
          // This row is older - mark for deletion
          rowsToDelete.push(rowNumber);
        }
      }
    }
    
    Logger.log('📊 Found ' + Object.keys(projectMap).length + ' unique projects');
    Logger.log('🗑️ Marking ' + rowsToDelete.length + ' duplicate rows for deletion');
    
    if (rowsToDelete.length === 0) {
      Logger.log('✅ No duplicates found - sheet is clean');
      return { success: true, duplicatesRemoved: 0 };
    }
    
    // Sort rows in descending order to delete from bottom up (preserves row numbers)
    rowsToDelete.sort((a, b) => b - a);
    
    // Delete duplicate rows
    rowsToDelete.forEach(rowNum => {
      Logger.log('   Deleting row ' + rowNum);
      sheet.deleteRow(rowNum);
    });
    
    Logger.log('✅ Cleanup complete - removed ' + rowsToDelete.length + ' duplicate rows');
    
    return {
      success: true,
      duplicatesRemoved: rowsToDelete.length,
      uniqueProjects: Object.keys(projectMap).length
    };
    
  } catch (error) {
    Logger.log('❌ Cleanup error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
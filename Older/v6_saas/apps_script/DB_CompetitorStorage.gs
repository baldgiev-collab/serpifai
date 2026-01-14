/**
 * DB_CompetitorStorage.gs
 * Handles parallel storage of competitor analysis results
 * Saves to: 1) MySQL database, 2) Master Google Sheet
 */

/**
 * Save competitor analysis results to both MySQL and Google Sheet
 * SIGNATURE: saveCompetitorResults(enrichedData, analysis, projectId, config)
 * @param {object} enrichedData - Competitor data with API enrichment
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
    
    // Prepare data for storage
    const storageData = {
      projectId: projectId,
      timestamp: new Date().toISOString(),
      competitors: competitors,
      yourDomain: yourDomain,
      analysisType: 'elite_competitor_analysis',
      rawData: enrichedData || {},
      insights: analysis?.insights || {},
      charts: analysis?.charts || {},
      geminiAnalysis: analysis || {}
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(storageData);
    
    // Prepare metadata for MySQL
    const metadata = {
      competitorCount: competitors.length,
      dataQuality: (enrichedData && Object.keys(enrichedData).length > 0) ? 'GOOD' : 'POOR',
      apiSuccess: '5/5', // Based on elite fetcher stages
      timestamp: storageData.timestamp
    };
    
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
      timestamp: storageData.timestamp
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
 */
function saveToMySQL(projectId, jsonData, competitors, yourDomain, metadata) {
  try {
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
 */
function saveToMasterSheet(projectId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
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
    
    // Append row
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 7);
    
    Logger.log('✅ Saved to Google Sheet: Row ' + sheet.getLastRow());
    
    return {
      success: true,
      sheetName: 'Competitor Analysis',
      row: sheet.getLastRow(),
      url: ss.getUrl()
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
 */
function loadFromMasterSheet(projectId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Competitor Analysis');
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find row with matching projectId
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === projectId) {
        const jsonData = data[i][7];
        return {
          success: true,
          data: JSON.parse(jsonData),
          row: i + 1
        };
      }
    }
    
    return { success: false, error: 'Project not found' };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

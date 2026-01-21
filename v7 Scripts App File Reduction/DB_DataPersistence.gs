/**
 * ============================================================================
 * DB_DataPersistence.gs - V33 Data Persistence Layer
 * ============================================================================
 * Solves the critical issue: Analysis data only stored in window variables,
 * lost on page refresh. This file provides server-side persistence.
 * 
 * Created: January 15, 2026 (V33 Comprehensive Fix)
 * ============================================================================
 */

// ============================================================================
// SAVE ANALYSIS TO STORAGE
// ============================================================================

/**
 * V33 FIX: Save latest competitor analysis to ScriptProperties + MySQL
 * This enables data to persist across page refreshes
 * 
 * @param {Object} analysisData - The full analysis data from competitor analysis
 * @returns {Object} Result with success status and size info
 */
function saveLatestAnalysis(analysisData) {
  try {
    Logger.log('💾 V33: saveLatestAnalysis called');
    Logger.log('   Input keys: ' + Object.keys(analysisData || {}).join(', '));
    
    const props = PropertiesService.getScriptProperties();
    const projectId = analysisData.metadata?.projectId || 
                      analysisData.projectId || 
                      'default';
    
    // Get competitor count
    const competitors = analysisData.competitors || [];
    Logger.log('   Competitors count: ' + competitors.length);
    
    // Prepare compact version for ScriptProperties (9KB limit per key)
    const compactData = {
      timestamp: new Date().toISOString(),
      projectId: projectId,
      competitorCount: competitors.length,
      
      // Store essential data for UI rendering
      competitors: competitors.map(c => ({
        domain: c.domain || c.url || 'unknown',
        processedMetrics: c.processedMetrics || {},
        synthesized: c.synthesized || {},
        apiData: {
          openPageRank: c.apiData?.openPageRank || null,
          serper: c.apiData?.serper || null
        }
      })),
      
      // Store executive brief from multiple possible locations
      executiveBrief: analysisData.analysis?.executiveBrief || 
                      analysisData.geminiAnalysis?.executiveBrief ||
                      analysisData.eliteTabIntelligence?.executiveBrief ||
                      analysisData.executiveBrief,
      
      // Store elite tab intelligence
      eliteTabIntelligence: analysisData.eliteTabIntelligence || null,
      
      // Store overview and charts
      overview: analysisData.overview || null,
      dashboardCharts: analysisData.dashboardCharts || null,
      
      // Store analysis object
      analysis: analysisData.analysis || null,
      
      // Store gemini analysis separately
      geminiAnalysis: analysisData.geminiAnalysis || null,
      
      // Store metadata
      metadata: analysisData.metadata || {
        savedAt: new Date().toISOString(),
        version: 'v33'
      }
    };
    
    // Check if executive brief was found
    Logger.log('   Executive brief found: ' + !!compactData.executiveBrief);
    if (compactData.executiveBrief) {
      Logger.log('   Brief keys: ' + Object.keys(compactData.executiveBrief).join(', '));
    }
    
    // Convert to JSON
    const jsonStr = JSON.stringify(compactData);
    Logger.log('   JSON size: ' + jsonStr.length + ' bytes');
    
    // Save to ScriptProperties
    if (jsonStr.length < 9000) {
      // Single property storage
      props.setProperty('latest_analysis', jsonStr);
      // Clear any old chunks
      props.deleteProperty('latest_analysis_chunks');
      Logger.log('✅ Saved to latest_analysis: ' + jsonStr.length + ' bytes');
    } else {
      // Split into chunks (8KB each to be safe)
      const chunks = splitIntoChunks(jsonStr, 8000);
      props.setProperty('latest_analysis_chunks', chunks.length.toString());
      
      // Save each chunk
      for (let i = 0; i < chunks.length; i++) {
        props.setProperty('latest_analysis_' + i, chunks[i]);
      }
      
      // Clear single property
      props.deleteProperty('latest_analysis');
      Logger.log('✅ Saved to ' + chunks.length + ' chunks');
    }
    
    // Also save project-specific analysis
    if (projectId && projectId !== 'default') {
      try {
        const projectKey = 'analysis_' + projectId.replace(/[^a-zA-Z0-9]/g, '_');
        if (jsonStr.length < 9000) {
          props.setProperty(projectKey, jsonStr);
          Logger.log('✅ Saved to project-specific key: ' + projectKey);
        }
      } catch (projError) {
        Logger.log('⚠️ Could not save project-specific: ' + projError.message);
      }
    }
    
    // Also try to save to MySQL for long-term storage
    try {
      if (typeof callGateway === 'function') {
        const mysqlResult = callGateway('analysis:save', {
          projectId: projectId,
          competitorCount: competitors.length,
          analysisData: compactData
        });
        Logger.log('✅ Saved to MySQL: ' + JSON.stringify(mysqlResult));
      }
    } catch (mysqlError) {
      Logger.log('⚠️ MySQL save skipped: ' + mysqlError.message);
    }
    
    return { 
      success: true, 
      size: jsonStr.length,
      competitorCount: competitors.length,
      hasExecutiveBrief: !!compactData.executiveBrief
    };
    
  } catch (error) {
    Logger.log('❌ saveLatestAnalysis error: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// LOAD ANALYSIS FROM STORAGE
// ============================================================================

/**
 * V33 FIX: Load latest competitor analysis
 * Called when sidebar loads to restore previous analysis
 * 
 * @param {string} projectId - Optional project ID to match
 * @returns {Object} Result with success status and analysis data
 */
function loadLatestAnalysis(projectId) {
  try {
    Logger.log('📂 V33: loadLatestAnalysis called');
    Logger.log('   Project ID filter: ' + (projectId || 'none'));
    
    const props = PropertiesService.getScriptProperties();
    
    // First try project-specific analysis
    if (projectId) {
      try {
        const projectKey = 'analysis_' + projectId.replace(/[^a-zA-Z0-9]/g, '_');
        const projectData = props.getProperty(projectKey);
        if (projectData) {
          Logger.log('✅ Found project-specific analysis: ' + projectKey);
          const parsed = JSON.parse(projectData);
          return { success: true, data: parsed, source: 'project' };
        }
      } catch (projError) {
        Logger.log('⚠️ Project-specific load failed: ' + projError.message);
      }
    }
    
    // Check for chunks first
    const chunkCount = parseInt(props.getProperty('latest_analysis_chunks') || '0');
    let jsonStr;
    
    if (chunkCount > 0) {
      Logger.log('   Loading from ' + chunkCount + ' chunks...');
      jsonStr = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = props.getProperty('latest_analysis_' + i);
        if (chunk) {
          jsonStr += chunk;
        }
      }
    } else {
      jsonStr = props.getProperty('latest_analysis');
    }
    
    if (!jsonStr) {
      Logger.log('ℹ️ No stored analysis found');
      return { success: false, message: 'No stored analysis found' };
    }
    
    Logger.log('   Loaded JSON: ' + jsonStr.length + ' bytes');
    
    const analysisData = JSON.parse(jsonStr);
    
    Logger.log('   Parsed successfully');
    Logger.log('   Competitors: ' + (analysisData.competitorCount || 0));
    Logger.log('   Timestamp: ' + (analysisData.timestamp || 'unknown'));
    Logger.log('   Has executiveBrief: ' + !!analysisData.executiveBrief);
    
    // Verify it's for the right project if specified
    if (projectId && analysisData.projectId && analysisData.projectId !== projectId) {
      Logger.log('⚠️ Analysis is for different project: ' + analysisData.projectId);
      return { 
        success: false, 
        message: 'Analysis is for different project',
        storedProject: analysisData.projectId
      };
    }
    
    return { 
      success: true, 
      data: analysisData,
      source: 'scriptProperties'
    };
    
  } catch (error) {
    Logger.log('❌ loadLatestAnalysis error: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CLEAR ANALYSIS STORAGE
// ============================================================================

/**
 * Clear all stored analysis data
 * Useful for testing or resetting state
 */
function clearLatestAnalysis() {
  try {
    const props = PropertiesService.getScriptProperties();
    
    // Clear single property
    props.deleteProperty('latest_analysis');
    
    // Clear chunks
    const chunkCount = parseInt(props.getProperty('latest_analysis_chunks') || '0');
    for (let i = 0; i < chunkCount; i++) {
      props.deleteProperty('latest_analysis_' + i);
    }
    props.deleteProperty('latest_analysis_chunks');
    
    Logger.log('✅ Cleared analysis storage');
    return { success: true };
    
  } catch (error) {
    Logger.log('❌ clearLatestAnalysis error: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STORAGE DIAGNOSTICS
// ============================================================================

/**
 * Get storage status for diagnostics
 */
function getStorageStatus() {
  try {
    const props = PropertiesService.getScriptProperties();
    const allProps = props.getProperties();
    
    // Calculate storage usage
    let totalSize = 0;
    const analysisKeys = [];
    
    for (const key in allProps) {
      totalSize += allProps[key].length;
      if (key.indexOf('analysis') !== -1 || key.indexOf('latest') !== -1) {
        analysisKeys.push({
          key: key,
          size: allProps[key].length
        });
      }
    }
    
    // Check for latest analysis
    const hasLatest = !!props.getProperty('latest_analysis');
    const chunkCount = parseInt(props.getProperty('latest_analysis_chunks') || '0');
    
    return {
      totalKeys: Object.keys(allProps).length,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      analysisKeys: analysisKeys,
      hasLatestAnalysis: hasLatest,
      analysisChunks: chunkCount
    };
    
  } catch (error) {
    Logger.log('❌ getStorageStatus error: ' + error.message);
    return { error: error.message };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Split a string into chunks of specified size
 */
function splitIntoChunks(str, chunkSize) {
  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test save and load cycle
 */
function testDataPersistence() {
  Logger.log('🧪 Testing Data Persistence...');
  
  // Create test data
  const testData = {
    competitors: [
      {
        domain: 'test.com',
        processedMetrics: { authorityScore: 50, traffic: 10000 },
        synthesized: { oracleKeywords: ['test', 'data'] }
      }
    ],
    analysis: {
      executiveBrief: {
        landscapeOverview: 'Test landscape overview',
        clientPosition: 'Test position'
      }
    },
    metadata: {
      projectId: 'test-project'
    }
  };
  
  // Test save
  Logger.log('\n--- SAVE TEST ---');
  const saveResult = saveLatestAnalysis(testData);
  Logger.log('Save result: ' + JSON.stringify(saveResult));
  
  // Test load
  Logger.log('\n--- LOAD TEST ---');
  const loadResult = loadLatestAnalysis();
  Logger.log('Load result: ' + JSON.stringify(loadResult));
  
  // Test storage status
  Logger.log('\n--- STATUS TEST ---');
  const status = getStorageStatus();
  Logger.log('Status: ' + JSON.stringify(status));
  
  // Cleanup
  Logger.log('\n--- CLEANUP ---');
  clearLatestAnalysis();
  
  Logger.log('\n✅ Data Persistence Test Complete');
}

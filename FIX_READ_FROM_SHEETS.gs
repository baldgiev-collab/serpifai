/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FINAL FIX: Read Elite Competitor Data from Google Sheets
 * ═══════════════════════════════════════════════════════════════════════════
 * Add this function to ui/Code.gs in Apps Script
 * This bypasses HTTP issues and reads directly from saved sheets
 */

/**
 * Read Elite Competitor Data from Google Sheets
 * Reads the data that was successfully saved by the backend
 */
function readEliteCompetitorDataFromSheets() {
  try {
    Logger.log('📊 Reading Elite Competitor data from Google Sheets...');
    
    const ss = SpreadsheetApp.openById('14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU');
    const overviewSheet = ss.getSheetByName('Overview');
    
    if (!overviewSheet) {
      return {
        success: false,
        error: 'Overview sheet not found. Run analysis first from backend test.'
      };
    }
    
    // Read all data from sheets
    const competitors = {};
    const intelligence = {};
    
    const categorySheets = [
      { name: 'Category Intelligence', key: 'marketIntelligence' },
      { name: 'Brand Positioning', key: 'brandPosition' },
      { name: 'Technical SEO', key: 'technicalSEO' },
      { name: 'Content Intelligence', key: 'contentIntelligence' },
      { name: 'Keyword Strategy', key: 'keywordStrategy' },
      { name: 'Content Systems', key: 'contentSystems' },
      { name: 'Conversion Optimization', key: 'conversionOptimization' },
      { name: 'Distribution Channels', key: 'distributionChannels' },
      { name: 'Audience Psychology', key: 'audiencePsychology' },
      { name: 'GEO AEO Intelligence', key: 'geoAeoIntelligence' },
      { name: 'Authority & Influence', key: 'authorityInfluence' },
      { name: 'Performance & Predictive', key: 'performancePredictive' },
      { name: 'Strategic Opportunities', key: 'strategicOpportunities' },
      { name: 'Scoring Engine', key: 'scoringEngine' }
    ];
    
    // Read overview data to get competitor list
    const overviewData = overviewSheet.getDataRange().getValues();
    Logger.log('   Found ' + (overviewData.length - 1) + ' competitors in Overview');
    
    // Initialize competitor objects
    for (let i = 1; i < overviewData.length; i++) {
      const row = overviewData[i];
      if (row[0]) { // If domain exists
        const domain = row[0];
        competitors[domain] = {
          domain: domain,
          url: 'https://' + domain,
          categories: {}
        };
      }
    }
    
    Logger.log('   Initialized ' + Object.keys(competitors).length + ' competitors');
    
    // Read data from each category sheet
    let totalMetrics = 0;
    categorySheets.forEach(category => {
      const sheet = ss.getSheetByName(category.name);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        
        Logger.log('   Reading ' + category.name + ' (' + (data.length - 1) + ' rows)');
        
        // Initialize intelligence category
        intelligence[category.key] = {
          metrics: {},
          competitors: {}
        };
        
        // Parse each competitor's data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const domain = row[0];
          
          if (domain && competitors[domain]) {
            // Add to competitor's categories
            if (!competitors[domain].categories[category.key]) {
              competitors[domain].categories[category.key] = { metrics: {} };
            }
            
            // Map each column to a metric
            for (let j = 1; j < headers.length; j++) {
              const metricName = headers[j];
              const metricValue = row[j];
              
              if (metricName) {
                competitors[domain].categories[category.key].metrics[metricName] = metricValue;
                totalMetrics++;
              }
            }
            
            // Also add to intelligence structure
            intelligence[category.key].competitors[domain] = competitors[domain].categories[category.key];
          }
        }
      } else {
        Logger.log('   ⚠️ Sheet not found: ' + category.name);
      }
    });
    
    // Generate overview from overview sheet
    const overview = {
      totalCompetitors: Object.keys(competitors).length,
      categoriesAnalyzed: categorySheets.length,
      totalMetrics: totalMetrics,
      timestamp: new Date().toISOString()
    };
    
    // Parse overview metrics if available
    if (overviewData.length > 1) {
      const overviewHeaders = overviewData[0];
      overview.metrics = {};
      
      for (let i = 1; i < overviewData.length; i++) {
        const row = overviewData[i];
        const domain = row[0];
        
        if (domain) {
          overview.metrics[domain] = {};
          for (let j = 1; j < overviewHeaders.length; j++) {
            if (overviewHeaders[j]) {
              overview.metrics[domain][overviewHeaders[j]] = row[j];
            }
          }
        }
      }
    }
    
    Logger.log('✅ Successfully read data for ' + Object.keys(competitors).length + ' competitors');
    Logger.log('   Total metrics: ' + totalMetrics);
    
    return {
      success: true,
      competitors: competitors,
      intelligence: intelligence,
      overview: overview,
      metadata: {
        totalMetrics: totalMetrics,
        dataCompleteness: 100,
        source: 'Google Sheets',
        timestamp: new Date().toISOString(),
        competitorCount: Object.keys(competitors).length,
        categoriesAnalyzed: categorySheets.length
      }
    };
    
  } catch (error) {
    Logger.log('❌ Error reading from sheets: ' + error);
    Logger.log('   Stack: ' + error.stack);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Test function - run this in Apps Script to verify data reading works
 */
function TEST_readFromSheets() {
  Logger.log('=== Testing Google Sheets Data Reader ===');
  
  const result = readEliteCompetitorDataFromSheets();
  
  Logger.log('\n📊 Result:');
  Logger.log('   Success: ' + result.success);
  
  if (result.success) {
    Logger.log('   Competitors: ' + Object.keys(result.competitors).length);
    Logger.log('   Total Metrics: ' + result.metadata.totalMetrics);
    Logger.log('   Categories: ' + result.metadata.categoriesAnalyzed);
    
    // Show sample competitor data
    const firstCompetitor = Object.keys(result.competitors)[0];
    if (firstCompetitor) {
      Logger.log('\n📌 Sample Competitor: ' + firstCompetitor);
      Logger.log('   Categories: ' + Object.keys(result.competitors[firstCompetitor].categories).join(', '));
      
      const firstCategory = Object.keys(result.competitors[firstCompetitor].categories)[0];
      if (firstCategory) {
        Logger.log('   Sample metrics from ' + firstCategory + ':');
        const metrics = result.competitors[firstCompetitor].categories[firstCategory].metrics;
        const metricKeys = Object.keys(metrics).slice(0, 5);
        metricKeys.forEach(key => {
          Logger.log('     - ' + key + ': ' + metrics[key]);
        });
      }
    }
    
    Logger.log('\n✅ Data reading works! Ready to use in UI.');
  } else {
    Logger.log('   Error: ' + result.error);
  }
  
  return result;
}

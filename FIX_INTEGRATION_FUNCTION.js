/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIX: Update callCompetitorAnalysisAPI function
 * ═══════════════════════════════════════════════════════════════════════════
 * Replace the callCompetitorAnalysisAPI function in elite_competitor_integration.html
 * This version tries HTTP first, then falls back to reading from Google Sheets
 */

/**
 * Call Competitor Analysis API with fallback to Google Sheets
 */
async function callCompetitorAnalysisAPI(competitors, projectContext) {
  console.log('📡 Starting competitor analysis...');
  console.log('   Competitors:', competitors.length);
  console.log('   Project:', projectContext.brandName || 'Unknown');
  
  // Show progress
  showAnalysisProgress('📊 Analyzing competitors...', 10);
  
  return new Promise((resolve, reject) => {
    // Try HTTP API first
    console.log('📤 Attempting HTTP call to backend...');
    
    google.script.run
      .withSuccessHandler(result => {
        console.log('📥 HTTP response received:', result);
        
        if (result && result.success) {
          console.log('✅ HTTP call successful');
          resolve(result);
        } else {
          console.warn('⚠️ HTTP call returned error, falling back to Google Sheets...');
          console.log('   Error:', result ? result.error : 'Unknown');
          
          // Fallback: Read from Google Sheets
          showAnalysisProgress('📊 Reading from Google Sheets...', 50);
          
          google.script.run
            .withSuccessHandler(sheetResult => {
              console.log('✅ Successfully read data from Google Sheets');
              console.log('   Competitors found:', sheetResult.competitors ? Object.keys(sheetResult.competitors).length : 0);
              resolve(sheetResult);
            })
            .withFailureHandler(sheetError => {
              console.error('❌ Both HTTP and Sheets fallback failed');
              reject(new Error('Failed to load data: ' + (sheetError.message || sheetError.toString())));
            })
            .readEliteCompetitorDataFromSheets();
        }
      })
      .withFailureHandler(httpError => {
        console.warn('⚠️ HTTP call failed, falling back to Google Sheets...');
        console.log('   HTTP Error:', httpError);
        
        // Fallback: Read from Google Sheets
        showAnalysisProgress('📊 Reading from Google Sheets...', 50);
        
        google.script.run
          .withSuccessHandler(sheetResult => {
            console.log('✅ Successfully read data from Google Sheets');
            console.log('   Competitors found:', sheetResult.competitors ? Object.keys(sheetResult.competitors).length : 0);
            resolve(sheetResult);
          })
          .withFailureHandler(sheetError => {
            console.error('❌ Both HTTP and Sheets fallback failed');
            console.error('   HTTP Error:', httpError);
            console.error('   Sheets Error:', sheetError);
            reject(new Error('Failed to load data from both HTTP and Sheets'));
          })
          .readEliteCompetitorDataFromSheets();
      })
      .runEliteCompetitorAnalysis(competitors, projectContext);
  });
}

/**
 * Show analysis progress
 */
function showAnalysisProgress(message, percent) {
  console.log(`📍 ${message} (${percent}%)`);
  
  // Update UI if progress elements exist
  const progressBar = document.getElementById('comp-progress-bar');
  const progressText = document.getElementById('comp-progress-text');
  
  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
  
  if (progressText) {
    progressText.textContent = message;
  }
}

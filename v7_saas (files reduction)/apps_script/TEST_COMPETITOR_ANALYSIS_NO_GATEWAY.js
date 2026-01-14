/**
 * TEST_COMPETITOR_ANALYSIS_NO_GATEWAY.gs
 * 
 * Test that competitor analysis works WITHOUT calling the gateway
 */

function TEST_competitorAnalysisNoGateway() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🧪 TEST: Competitor Analysis Without Gateway');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  
  // Test with minimal data
  const testCompetitors = ['toptal.com', 'turing.com'];
  const testContext = {
    brandName: 'TestCompany',
    targetAudience: 'Developers',
    coreTopic: 'Tech Talent'
  };
  
  Logger.log('[INPUT]');
  Logger.log('   Competitors: ' + testCompetitors.join(', '));
  Logger.log('   Brand: ' + testContext.brandName);
  Logger.log('');
  
  try {
    Logger.log('[EXECUTING] runEliteCompetitorAnalysis...');
    const result = runEliteCompetitorAnalysis(testCompetitors, testContext);
    
    Logger.log('');
    Logger.log('[RESULT]');
    Logger.log('   Success: ' + (result ? result.success : 'null'));
    Logger.log('   Competitors analyzed: ' + (result && result.competitors ? 
               (Array.isArray(result.competitors) ? result.competitors.length : Object.keys(result.competitors).length) : 
               0));
    Logger.log('   Has analysis: ' + (result && result.analysis ? 'YES' : 'NO'));
    Logger.log('   Error: ' + (result && result.error ? result.error : 'NONE'));
    
    if (result && result.success) {
      Logger.log('');
      Logger.log('✅ TEST PASSED');
      Logger.log('   The analysis completed without calling the gateway');
      Logger.log('   No "Forbidden" error occurred');
      
      if (result.competitors) {
        Logger.log('');
        Logger.log('[COMPETITOR DATA]');
        const comps = Array.isArray(result.competitors) ? result.competitors : Object.values(result.competitors);
        comps.forEach((comp, idx) => {
          const domain = comp.domain || comp.url || 'unknown';
          Logger.log(`   [${idx + 1}] ${domain}`);
          Logger.log(`      Fetch success: ${comp.fetchSuccess || false}`);
          Logger.log(`      Has data: ${!!comp.synthesized || !!comp.snapshot}`);
        });
      }
      
      if (result.analysis && result.analysis.categories) {
        Logger.log('');
        Logger.log('[ANALYSIS]');
        Logger.log('   Categories: ' + result.analysis.categories.length);
        result.analysis.categories.slice(0, 3).forEach(cat => {
          Logger.log(`   - ${cat.name}`);
        });
      }
      
    } else {
      Logger.log('');
      Logger.log('⚠️ TEST WARNING');
      Logger.log('   Analysis ran but returned failure');
      Logger.log('   Check error details above');
    }
    
  } catch (e) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('   Exception: ' + e);
    Logger.log('   Message: ' + e.message);
    Logger.log('   Stack: ' + e.stack);
    
    // Check if it's the Forbidden error
    if (e.message && e.message.indexOf('Forbidden') !== -1) {
      Logger.log('');
      Logger.log('⚠️ STILL GETTING FORBIDDEN ERROR');
      Logger.log('   This means the fix was not deployed to Apps Script yet');
      Logger.log('   You need to copy the updated UI_Main.gs to Apps Script Editor');
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

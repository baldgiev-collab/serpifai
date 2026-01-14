/**
 * TEST: Verify competitor button setup
 * Run this in Apps Script to check what's happening
 */

function TEST_buttonSetup() {
  Logger.log('🔍 TESTING COMPETITOR BUTTON SETUP');
  Logger.log('');
  
  // 1. Check if runEliteCompetitorAnalysis exists
  Logger.log('1. Backend Function Check:');
  try {
    const testResult = runEliteCompetitorAnalysis(['test1.com', 'test2.com'], {brandName: 'Test'});
    Logger.log('   ✅ runEliteCompetitorAnalysis() exists and callable');
  } catch (e) {
    Logger.log('   ❌ ERROR: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('2. Check HTML Files:');
  const htmlFiles = [
    'UI_Dashboard',
    'UI_Elite_Integration',
    'UI_Components_Workflow'
  ];
  
  htmlFiles.forEach(function(name) {
    try {
      const content = HtmlService.createHtmlOutputFromFile(name).getContent();
      const hasButton = content.indexOf('btnAnalyzeCompetitors') !== -1;
      const hasHandler = content.indexOf('handleCompetitorAnalysisClick') !== -1;
      const hasInit = content.indexOf('initCompetitorAnalysis') !== -1;
      
      Logger.log('   ' + name + ':');
      Logger.log('      Has button ID: ' + hasButton);
      Logger.log('      Has handler: ' + hasHandler);
      Logger.log('      Has init: ' + hasInit);
    } catch (e) {
      Logger.log('   ❌ ' + name + ' ERROR: ' + e.toString());
    }
  });
  
  Logger.log('');
  Logger.log('3. Check Deployment:');
  Logger.log('   Current script ID: ' + ScriptApp.getScriptId());
  Logger.log('   Project key: ' + ScriptApp.getProjectKey());
  
  Logger.log('');
  Logger.log('📋 INSTRUCTIONS:');
  Logger.log('1. Check if UI_Elite_Integration.html was updated in Apps Script');
  Logger.log('2. If files look old, copy fresh versions from local folder');
  Logger.log('3. Create NEW web app deployment (Manage Deployments → New Deployment)');
  Logger.log('4. Use the NEW deployment URL');
  Logger.log('');
  
  return {
    success: true,
    message: 'Check logs above for diagnostics'
  };
}

/**
 * TEST: Manual trigger with test data
 */
function TEST_manualTrigger() {
  Logger.log('🧪 MANUAL TRIGGER TEST');
  
  const testCompetitors = [
    'ahrefs.com',
    'semrush.com'
  ];
  
  const testProject = {
    brandName: 'Test Company',
    targetAudience: 'SEO professionals',
    coreTopic: 'SEO tools'
  };
  
  try {
    Logger.log('📤 Calling runEliteCompetitorAnalysis...');
    const result = runEliteCompetitorAnalysis(testCompetitors, testProject);
    Logger.log('✅ Result received:');
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    Logger.log('❌ ERROR: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString()
    };
  }
}

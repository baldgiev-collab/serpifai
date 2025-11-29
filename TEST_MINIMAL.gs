/**
 * 🚨 MINIMAL WORKING VERSION - Test First
 * 
 * This is a MINIMAL version to test if the basic structure works
 * Before adding all HTML files, let's test with this simple version
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SERPIFAI TEST')
    .addItem('Test Sidebar', 'showTestSidebar')
    .addToUi();
}

function showTestSidebar() {
  const html = HtmlService.createHtmlOutput('<h1>IT WORKS!</h1><p>If you see this, the basic setup is correct.</p>')
    .setTitle('SERPIFAI Test');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Test function to check what HTML files exist
 */
function testHTMLFiles() {
  const filesToCheck = [
    'index',
    'components_workflow',
    'components_results',
    'styles_theme',
    'scripts_app'
  ];
  
  Logger.log('=== TESTING HTML FILES ===\n');
  
  filesToCheck.forEach(function(filename) {
    try {
      const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
      Logger.log('✅ ' + filename + ' EXISTS (' + content.length + ' chars)');
    } catch (e) {
      Logger.log('❌ ' + filename + ' NOT FOUND: ' + e);
    }
  });
  
  Logger.log('\n=== TEST COMPLETE ===');
}

/**
 * Test ALL possible HTML files
 */
function testAllHTMLFiles() {
  const allFiles = [
    'index',
    'components_header',
    'components_sidebar',
    'components_project_manager',
    'components_overview',
    'components_workflow',
    'components_results',
    'components_qa',
    'components_competitors',
    'components_scoring',
    'components_toast',
    'components_modal',
    'scripts_app',
    'styles_theme'
  ];
  
  Logger.log('=== CHECKING ALL HTML FILES ===\n');
  
  const missing = [];
  const present = [];
  
  allFiles.forEach(function(filename) {
    try {
      const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
      present.push(filename);
      Logger.log('✅ ' + filename + ' - ' + content.length + ' chars');
    } catch (e) {
      missing.push(filename);
      Logger.log('❌ ' + filename + ' - MISSING');
    }
  });
  
  Logger.log('\n=== SUMMARY ===');
  Logger.log('Present: ' + present.length + ' files');
  Logger.log('Missing: ' + missing.length + ' files');
  
  if (missing.length > 0) {
    Logger.log('\n❌ MISSING FILES:');
    missing.forEach(function(f) {
      Logger.log('   - ' + f);
    });
  }
  
  Logger.log('\n=== TEST COMPLETE ===');
}

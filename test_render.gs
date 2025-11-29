/**
 * Force reload test - bypasses cache
 */
function showFreshSidebar() {
  const timestamp = new Date().getTime();
  const html = HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('SERPIFAI — ' + timestamp)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Test what index.html actually contains
 */
function checkIndexContent() {
  try {
    const indexContent = HtmlService.createHtmlOutputFromFile('index').getContent();
    Logger.log('=== INDEX.HTML CONTENT ===\n');
    Logger.log('Length: ' + indexContent.length + ' chars\n');
    Logger.log('First 500 chars:');
    Logger.log(indexContent.substring(0, 500));
    Logger.log('\n...\n');
    
    // Check if backend code appears
    if (indexContent.indexOf('runWorkflowStage') > -1) {
      Logger.log('❌ ERROR: Backend code found in index.html!');
      const pos = indexContent.indexOf('runWorkflowStage');
      Logger.log('Position: ' + pos);
      Logger.log('Context: ' + indexContent.substring(pos - 100, pos + 100));
    } else {
      Logger.log('✅ GOOD: No backend code in index.html');
    }
    
    // Check what includes are called
    const includeMatches = indexContent.match(/include\(['"]([^'"]+)['"]\)/g);
    if (includeMatches) {
      Logger.log('\n=== INCLUDES FOUND ===');
      includeMatches.forEach(function(match) {
        Logger.log('   ' + match);
      });
    }
    
  } catch (e) {
    Logger.log('ERROR: ' + e);
  }
}

/**
 * Test the actual rendered output
 */
function testFullRender() {
  try {
    Logger.log('=== TESTING FULL RENDER ===\n');
    
    const html = HtmlService.createTemplateFromFile('index').evaluate();
    const content = html.getContent();
    
    Logger.log('Rendered length: ' + content.length + ' chars\n');
    
    // Check for backend code
    if (content.indexOf('runWorkflowStage') > -1) {
      Logger.log('❌ ERROR: Backend code appears in rendered output!');
    } else {
      Logger.log('✅ No backend code in rendered output');
    }
    
    // Check if main UI elements are present
    const checks = [
      { name: 'Main shell', pattern: 'app-shell' },
      { name: 'Sidebar', pattern: 'sidebar' },
      { name: 'Workflow tab', pattern: 'components_workflow' },
      { name: 'Scripts', pattern: 'scripts_app' },
      { name: 'Styles', pattern: 'styles_theme' }
    ];
    
    Logger.log('\n=== UI ELEMENTS CHECK ===');
    checks.forEach(function(check) {
      if (content.indexOf(check.pattern) > -1) {
        Logger.log('✅ ' + check.name + ' present');
      } else {
        Logger.log('❌ ' + check.name + ' MISSING');
      }
    });
    
  } catch (e) {
    Logger.log('ERROR during render: ' + e);
  }
}

/**
 * 🔧 AUTOMATIC FIX - Identifies and fixes polluted HTML files
 */

function autoFixPollutedFiles() {
  Logger.log('=== AUTOMATIC FIX SCRIPT ===\n');
  
  const files = [
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
  
  const backendMarkers = [
    'Workflow Stage Router',
    'function runWorkflowStage(',
    'runStage1Strategy',
    'runStage2Keywords'
  ];
  
  let pollutedFiles = [];
  
  // Scan all files
  Logger.log('📊 Scanning all HTML files...\n');
  files.forEach(function(name) {
    try {
      const content = HtmlService.createHtmlOutputFromFile(name).getContent();
      const hasPollution = backendMarkers.some(function(marker) {
        return content.indexOf(marker) !== -1;
      });
      
      if (hasPollution) {
        pollutedFiles.push(name);
        Logger.log('❌ ' + name + '.html - CONTAMINATED with backend code');
      } else {
        Logger.log('✅ ' + name + '.html - Clean');
      }
    } catch (e) {
      Logger.log('⚠️  ' + name + ' - Error: ' + e);
    }
  });
  
  Logger.log('\n=== RESULTS ===');
  if (pollutedFiles.length === 0) {
    Logger.log('✅ All HTML files are clean!');
    Logger.log('\nThe backend text must be from browser cache.');
    Logger.log('ACTION: Clear browser cache and try Incognito mode.');
    return;
  }
  
  Logger.log('❌ Found ' + pollutedFiles.length + ' polluted file(s):');
  pollutedFiles.forEach(function(f) {
    Logger.log('   - ' + f + '.html');
  });
  
  Logger.log('\n=== FIX INSTRUCTIONS ===');
  Logger.log('In the Apps Script editor:');
  pollutedFiles.forEach(function(filename) {
    Logger.log('\n📝 Fix ' + filename + '.html:');
    Logger.log('   1. Open ' + filename + '.html in the editor');
    Logger.log('   2. SELECT ALL (Ctrl+A)');
    Logger.log('   3. DELETE everything');
    Logger.log('   4. Open: c:\\Users\\baldg\\OneDrive\\Documents\\GitHub\\serpifai\\ui\\' + filename + '.html');
    Logger.log('   5. COPY ALL content from that file');
    Logger.log('   6. PASTE into Apps Script editor');
    Logger.log('   7. SAVE (Ctrl+S)');
  });
  
  Logger.log('\n📌 After fixing, run: showFreshSidebar()');
}

/**
 * Quick test after fix
 */
function verifyFix() {
  Logger.log('=== VERIFICATION TEST ===\n');
  
  try {
    const html = HtmlService.createTemplateFromFile('index').evaluate();
    const content = html.getContent();
    
    const hasBackendCode = content.indexOf('runWorkflowStage') !== -1;
    const hasWorkflow = content.indexOf('components_workflow') !== -1;
    const hasScripts = content.indexOf('scripts_app') !== -1;
    
    Logger.log('Rendered size: ' + content.length + ' chars\n');
    
    if (hasBackendCode) {
      Logger.log('❌ STILL POLLUTED - Backend code present');
      Logger.log('   Run autoFixPollutedFiles() again to see which files');
    } else {
      Logger.log('✅ No backend code found!');
    }
    
    if (hasWorkflow && hasScripts) {
      Logger.log('✅ All components loading correctly');
    } else {
      Logger.log('⚠️  Some components not loading:');
      if (!hasWorkflow) Logger.log('   - Workflow component missing');
      if (!hasScripts) Logger.log('   - Scripts missing');
    }
    
    Logger.log('\n=== ' + (hasBackendCode ? 'FIX NEEDED' : 'SUCCESS') + ' ===');
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e);
  }
}

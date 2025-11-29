/**
 * Scan all UI HTML files for leaked backend code
 */
function scanBackendText() {
  const markers = [
    'Workflow Stage Router',          // comment header from router
    'function runWorkflowStage(',     // router signature
    'runStage1Strategy(',
    'runStage2Keywords(',
    'runStage3Architecture(',
    'runStage4Calendar(',
    'runStage5Generation('
  ];
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
  Logger.log('=== SCANNING FOR BACKEND LEAKS ===');
  let foundAny = false;
  files.forEach(name => {
    try {
      const txt = HtmlService.createHtmlOutputFromFile(name).getContent();
      const hits = markers.filter(m => txt.indexOf(m) !== -1);
      if (hits.length) {
        foundAny = true;
        Logger.log('❌ ' + name + ' contains backend markers: ' + hits.join(', '));
      } else {
        Logger.log('✅ ' + name + ' clean');
      }
    } catch (e) {
      Logger.log('⚠️  ' + name + ' could not load: ' + e);
    }
  });
  if (!foundAny) Logger.log('✅ No backend code found in any HTML file');
}

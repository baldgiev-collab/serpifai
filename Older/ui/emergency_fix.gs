/**
 * 🚨 EMERGENCY FIX - Run this to diagnose and fix the text pollution issue
 */

function emergencyDiagnosis() {
  Logger.log('=== EMERGENCY DIAGNOSIS ===\n');
  
  // Test 1: Check what include() returns for index
  Logger.log('1. Testing include("ui/index")...');
  try {
    const indexContent = include('ui/index');
    Logger.log('   ✅ index.html loaded (' + indexContent.length + ' chars)');
    
    // Check if backend code appears in the HTML
    if (indexContent.indexOf('Workflow Stage Router') > -1) {
      Logger.log('   ❌ FOUND: "Workflow Stage Router" text in HTML!');
      Logger.log('   This means workflow_router is being included somehow');
      
      // Find where it appears
      const startPos = indexContent.indexOf('Workflow Stage Router');
      const snippet = indexContent.substring(startPos - 50, startPos + 100);
      Logger.log('   Context: ...' + snippet + '...');
    } else {
      Logger.log('   ✅ HTML is clean - no backend code found');
    }
  } catch (e) {
    Logger.log('   ❌ ERROR loading index: ' + e);
  }
  
  // Test 2: Check components_workflow
  Logger.log('\n2. Testing include("ui/components_workflow")...');
  try {
    const workflowContent = include('ui/components_workflow');
    Logger.log('   ✅ components_workflow.html loaded (' + workflowContent.length + ' chars)');
    
    if (workflowContent.indexOf('Workflow Stage Router') > -1) {
      Logger.log('   ❌ FOUND: Backend code in components_workflow!');
    } else {
      Logger.log('   ✅ components_workflow is clean');
    }
  } catch (e) {
    Logger.log('   ❌ ERROR: ' + e);
  }
  
  // Test 3: Try to load workflow_router (should fail if not present)
  Logger.log('\n3. Testing if workflow_router file exists...');
  try {
    const routerContent = HtmlService.createHtmlOutputFromFile('workflow_router').getContent();
    Logger.log('   ❌ WARNING: workflow_router CAN be loaded!');
    Logger.log('   This file should NOT exist in UI project');
    Logger.log('   Content preview: ' + routerContent.substring(0, 200));
  } catch (e) {
    Logger.log('   ✅ GOOD: workflow_router not found (as expected)');
    Logger.log('   Error: ' + e);
  }
  
  // Test 4: Check if there are multiple Code.gs files
  Logger.log('\n4. Checking for function conflicts...');
  Logger.log('   include function type: ' + typeof include);
  Logger.log('   doGet function type: ' + typeof doGet);
  Logger.log('   onOpen function type: ' + typeof onOpen);
  
  // Test 5: List all global objects
  Logger.log('\n5. Checking global scope...');
  try {
    Logger.log('   this.runWorkflowStage: ' + typeof this.runWorkflowStage);
    Logger.log('   this.runStage1Strategy: ' + typeof this.runStage1Strategy);
    
    if (typeof this.runStage1Strategy === 'function') {
      Logger.log('   ❌ ERROR: runStage1Strategy exists in UI project!');
      Logger.log('   This should ONLY be in DataBridge');
    }
  } catch (e) {
    Logger.log('   Error checking globals: ' + e);
  }
  
  Logger.log('\n=== DIAGNOSIS COMPLETE ===');
  Logger.log('\nRECOMMENDATIONS:');
  Logger.log('1. If workflow_router can be loaded, DELETE it from Apps Script project');
  Logger.log('2. If runStage1Strategy exists, workflow_router.gs is in THIS project');
  Logger.log('3. Check for duplicate Code.gs files (app/Code.gs vs ui/Code.gs)');
}

function fixIncludeFunction() {
  Logger.log('=== TESTING FIXED INCLUDE FUNCTION ===\n');
  
  // This is a safer version of include that only loads .html files
  function safeInclude(filename) {
    // Ensure filename ends with .html
    if (!filename.endsWith('.html')) {
      filename = filename + '.html';
    }
    
    try {
      return HtmlService.createHtmlOutputFromFile(filename).getContent();
    } catch (e) {
      Logger.log('ERROR loading ' + filename + ': ' + e);
      return '<!-- Error loading ' + filename + ' -->';
    }
  }
  
  Logger.log('Testing safeInclude...');
  const testContent = safeInclude('ui/index');
  Logger.log('Loaded ' + testContent.length + ' chars');
  
  if (testContent.indexOf('Workflow Stage Router') > -1) {
    Logger.log('❌ STILL POLLUTED');
  } else {
    Logger.log('✅ CLEAN!');
  }
}

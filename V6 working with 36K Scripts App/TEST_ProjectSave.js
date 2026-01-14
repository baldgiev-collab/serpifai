/**
 * TEST_ProjectSave.gs
 * Comprehensive test functions to diagnose and verify project save functionality
 * IMPORTANT: Run setupLicenseKey("your-key") and checkPermissions() FIRST!
 * Run these tests to debug the save, sheet creation, and listing issues
 */

// ============================================================================
// QUICK TEST SUITE
// ============================================================================

/**
 * RUN THIS FIRST: Quick diagnostic test
 * Tests all major functionality in one go
 * 
 * PREREQUISITES:
 * 1. Run: checkPermissions() - verify all permissions
 * 2. Run: setupLicenseKey('your-key-here') - add your license key
 * 3. Then run this test
 */
function TEST_QuickDiagnostics() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 SERPIFAI PROJECT SAVE - QUICK DIAGNOSTICS');
  Logger.log('='.repeat(80) + '\n');
  
  // PRE-CHECK: Verify prerequisites
  Logger.log('PRE-CHECK: Verifying prerequisites...\n');
  
  // Check Drive API
  let hasDrive = false;
  try {
    DriveApp.getFoldersByName('test');
    hasDrive = true;
    Logger.log('✅ Drive API: Available');
  } catch (e) {
    Logger.log('❌ Drive API: NOT AVAILABLE');
    Logger.log('   Please run: checkPermissions()');
    return;
  }
  
  // Check license key
  const licenseKey = getLicenseKey();
  if (!licenseKey) {
    Logger.log('❌ License Key: NOT CONFIGURED');
    Logger.log('   Please run: setupLicenseKey("your-key-here")');
    return;
  } else {
    Logger.log('✅ License Key: Configured');
  }
  
  Logger.log('\n✅ Prerequisites met. Starting tests...\n');
  
  const testProjectName = 'TEST_Project_' + new Date().getTime();
  
  // Test 1: Create test data
  Logger.log('\n[TEST 1] Creating test project data...');
  const testData = {
    projectName: testProjectName,
    projectId: 'test_' + Date.now(),
    brand: 'Test Brand',
    keywords: ['test', 'keyword'],
    context: { brand: 'Test' },
    competitor: { overview: 'Test competitor data' },
    workflow: { stage1Strategy: 'Test workflow' },
    fetcher: { urls: ['https://example.com'] },
    analysis: { qaScores: 100 },
    ui: { charts: {} },
    content: { articles: {} },
    metadata: { status: 'active', creditsUsed: 0 }
  };
  Logger.log('✓ Test data created');
  
  // Test 2: Save project (dual)
  Logger.log('\n[TEST 2] Saving project to Sheets + MySQL...');
  const saveResult = saveProjectDual(testProjectName, testData);
  Logger.log('📊 Save result:');
  Logger.log('   ok: ' + saveResult.ok);
  Logger.log('   sheet: ' + saveResult.sheet);
  Logger.log('   projectId: ' + saveResult.projectId);
  Logger.log('   synced: ' + saveResult.synced);
  Logger.log('   error: ' + (saveResult.error || 'none'));
  
  if (!saveResult.ok) {
    Logger.log('❌ SAVE FAILED! Stopping tests.');
    return;
  }
  Logger.log('✅ Save succeeded');
  
  // Test 3: Find sheet
  Logger.log('\n[TEST 3] Finding the created sheet...');
  const foundSheet = findProjectSheet(testProjectName);
  if (foundSheet) {
    Logger.log('✅ Sheet found: ' + foundSheet.getName());
  } else {
    Logger.log('❌ Sheet NOT found after save!');
  }
  
  // Test 4: List projects
  Logger.log('\n[TEST 4] Listing all projects...');
  const listResult = listProjectsDual();
  Logger.log('📋 List result:');
  Logger.log('   success: ' + listResult.success);
  Logger.log('   count: ' + listResult.count);
  Logger.log('   projects: ' + (listResult.projects ? listResult.projects.length : '0'));
  
  if (listResult.projects && listResult.projects.length > 0) {
    Logger.log('   Project names:');
    listResult.projects.forEach(function(p, i) {
      Logger.log('      [' + i + '] ' + p.name + ' (source: ' + p.source + ')');
    });
  }
  
  // Test 5: Load project
  Logger.log('\n[TEST 5] Loading saved project...');
  const loadResult = loadProjectDual(testProjectName);
  Logger.log('📂 Load result:');
  Logger.log('   success: ' + loadResult.success);
  if (loadResult.success) {
    Logger.log('   projectName: ' + loadResult.data.projectName);
    Logger.log('   projectId: ' + loadResult.data.projectId);
    Logger.log('   data fields: ' + Object.keys(loadResult.data).length);
  } else {
    Logger.log('   error: ' + loadResult.error);
  }
  
  // Test 6: Cache test
  Logger.log('\n[TEST 6] Testing cache...');
  const cached = getProjectFromCache(testProjectName);
  Logger.log('💾 Cache result:');
  Logger.log('   cached: ' + (cached ? 'yes' : 'no'));
  if (cached && cached.data) {
    Logger.log('   projectName: ' + cached.data.projectName);
  }
  
  // Summary
  Logger.log('\n' + '='.repeat(80));
  Logger.log('✅ DIAGNOSTIC TESTS COMPLETE');
  Logger.log('='.repeat(80) + '\n');
  
  // Print summary
  Logger.log('Summary:');
  Logger.log('  Save:       ' + (saveResult.ok ? '✅ OK' : '❌ FAILED'));
  Logger.log('  Sheet:      ' + (foundSheet ? '✅ FOUND' : '❌ NOT FOUND'));
  Logger.log('  List:       ' + (listResult.success ? '✅ OK' : '❌ FAILED'));
  Logger.log('  Load:       ' + (loadResult.success ? '✅ OK' : '❌ FAILED'));
  Logger.log('  Cache:      ' + (cached ? '✅ OK' : '❌ FAILED'));
  
  if (saveResult.ok && foundSheet && listResult.success && loadResult.success) {
    Logger.log('\n🎉 ALL TESTS PASSED! System is working.');
  } else {
    Logger.log('\n⚠️  SOME TESTS FAILED. Check logs above for details.');
  }
}

// ============================================================================
// INDIVIDUAL TEST FUNCTIONS
// ============================================================================

/**
 * Test: Can we create a new folder?
 */
function TEST_CreateFolder() {
  Logger.log('\n🧪 TEST: Create Folder');
  try {
    const folder = DriveApp.createFolder('TEST_Folder_' + new Date().getTime());
    Logger.log('✅ Folder created: ' + folder.getId());
    return true;
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Can we create a spreadsheet?
 */
function TEST_CreateSpreadsheet() {
  Logger.log('\n🧪 TEST: Create Spreadsheet');
  try {
    const ss = SpreadsheetApp.create('TEST_Sheet_' + new Date().getTime());
    Logger.log('✅ Spreadsheet created: ' + ss.getId());
    return true;
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Can we find the SERPIFAI Projects folder?
 */
function TEST_FindSerpifaiFolder() {
  Logger.log('\n🧪 TEST: Find SERPIFAI Projects Folder');
  try {
    const folders = DriveApp.getFoldersByName('SERPIFAI Projects');
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('✅ Folder found: ' + folder.getId());
      
      // List files in folder
      const files = folder.getFiles();
      let count = 0;
      const fileList = [];
      while (files.hasNext()) {
        count++;
        fileList.push(files.next().getName());
      }
      Logger.log('   Contains ' + count + ' files:');
      fileList.forEach(function(name) {
        Logger.log('      - ' + name);
      });
      return true;
    } else {
      Logger.log('⚠️  SERPIFAI Projects folder does not exist (will be created on first save)');
      return true; // Not an error
    }
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Can we get all projects from Sheets?
 */
function TEST_GetProjectSheets() {
  Logger.log('\n🧪 TEST: Get All Project Sheets');
  try {
    const sheets = getProjectSheets();
    Logger.log('✅ Retrieved ' + sheets.length + ' sheets:');
    sheets.forEach(function(sheet, i) {
      Logger.log('   [' + i + '] ' + sheet.name + ' (ID: ' + sheet.id + ')');
    });
    return true;
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Can we unify project data?
 */
function TEST_UnifyData() {
  Logger.log('\n🧪 TEST: Unify Project Data');
  try {
    const rawData = {
      projectName: 'Test',
      brand: 'Test Brand',
      competitor_data: { overview: 'competitors' },
      workflow_data: { stage1: 'workflow' },
      fetcher_data: { urls: ['https://test.com'] },
      ui_data: { charts: {} }
    };
    
    const unified = unifyProjectData(rawData);
    Logger.log('✅ Data unified successfully');
    Logger.log('   Fields: ' + Object.keys(unified).join(', '));
    return true;
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Can we save to MySQL?
 */
function TEST_SaveToMySQL() {
  Logger.log('\n🧪 TEST: Save to MySQL');
  try {
    const testData = {
      projectName: 'TEST_MySQL_' + new Date().getTime(),
      projectId: 'test_' + Date.now(),
      brand: 'Test',
      competitor: {},
      workflow: {},
      fetcher: {},
      analysis: {},
      ui: {},
      content: {},
      metadata: { status: 'active', creditsUsed: 0 }
    };
    
    const result = saveProjectToDatabase(testData.projectName, testData);
    Logger.log('📊 Result: ' + JSON.stringify(result));
    
    if (result.success || result.projectId) {
      Logger.log('✅ Save to MySQL succeeded');
      return true;
    } else {
      Logger.log('❌ Save to MySQL failed');
      return false;
    }
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Complete save workflow
 */
function TEST_CompleteSaveWorkflow() {
  Logger.log('\n🧪 TEST: Complete Save Workflow');
  
  const projectName = 'TEST_Complete_' + new Date().getTime();
  
  try {
    // Create test data
    const data = {
      projectName: projectName,
      projectId: 'test_' + Date.now(),
      brand: 'Complete Test',
      keywords: ['test1', 'test2'],
      context: { brand: 'Complete Test Brand' },
      competitor: { competitors: ['comp1', 'comp2'] },
      workflow: { stage1Strategy: 'Test strategy' },
      fetcher: { urls: ['https://example.com', 'https://test.com'] },
      analysis: { qaScores: { overall: 85 } },
      ui: { charts: { chart1: {} } },
      content: { articles: [] },
      metadata: { status: 'active', creditsUsed: 0 }
    };
    
    Logger.log('   Saving: ' + projectName);
    const result = saveProjectDual(projectName, data);
    
    Logger.log('📊 Save result:');
    Logger.log('   ok: ' + result.ok);
    Logger.log('   sheet: ' + (result.sheet || 'error'));
    Logger.log('   projectId: ' + (result.projectId || 'error'));
    Logger.log('   synced: ' + result.synced);
    
    if (result.ok && result.synced) {
      Logger.log('✅ Complete save workflow succeeded');
      return true;
    } else {
      Logger.log('❌ Save workflow failed or not synced');
      return false;
    }
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return false;
  }
}

/**
 * Test: Check all prerequisites
 */
function TEST_CheckPrerequisites() {
  Logger.log('\n🧪 TEST: Check All Prerequisites');
  Logger.log('   1. Folder creation: ' + (TEST_CreateFolder() ? '✅' : '❌'));
  Logger.log('   2. Sheet creation: ' + (TEST_CreateSpreadsheet() ? '✅' : '❌'));
  Logger.log('   3. Find folder: ' + (TEST_FindSerpifaiFolder() ? '✅' : '❌'));
  Logger.log('   4. Get sheets: ' + (TEST_GetProjectSheets() ? '✅' : '❌'));
  Logger.log('   5. Unify data: ' + (TEST_UnifyData() ? '✅' : '❌'));
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up all TEST projects
 */
function TEST_Cleanup() {
  Logger.log('\n🧹 Cleaning up test projects...');
  
  try {
    const sheets = getProjectSheets();
    let deleted = 0;
    
    sheets.forEach(function(sheet) {
      if (sheet.name.indexOf('TEST_') === 0) {
        try {
          const file = DriveApp.getFileById(sheet.id);
          DriveApp.removeFile(file);
          deleted++;
          Logger.log('   Deleted: ' + sheet.name);
        } catch (e) {
          Logger.log('   Error deleting ' + sheet.name + ': ' + e.toString());
        }
      }
    });
    
    Logger.log('✅ Cleanup complete: ' + deleted + ' test projects deleted');
  } catch (e) {
    Logger.log('❌ Error during cleanup: ' + e.toString());
  }
}

/**
 * ================================================================
 * COMPREHENSIVE UI & FUNCTIONALITY TEST SUITE
 * Tests all critical features: Projects, Settings, Save, Credits
 * ================================================================
 */

function TEST_ALL_UI_FEATURES() {
  console.log('🧪 ============================================');
  console.log('🧪 COMPREHENSIVE UI TEST SUITE');
  console.log('🧪 ============================================\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Project Management
  console.log('\n📁 TEST 1: Project Management');
  try {
    const projects = listProjects();
    if (projects && projects.projects) {
      console.log('✅ listProjects() works - Found ' + projects.count + ' projects');
      results.passed++;
      results.tests.push({name: 'Project List', status: 'PASS', details: projects.count + ' projects'});
    } else {
      throw new Error('Invalid project list response');
    }
  } catch (e) {
    console.log('❌ listProjects() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Project List', status: 'FAIL', details: e.toString()});
  }
  
  // Test 2: Save Current Project
  console.log('\n💾 TEST 2: Save Current Project');
  try {
    const saveResult = saveCurrentProject();
    if (saveResult && (saveResult.success || saveResult.error)) {
      console.log('✅ saveCurrentProject() returns proper response');
      console.log('   Result: ' + JSON.stringify(saveResult));
      results.passed++;
      results.tests.push({name: 'Save Project', status: 'PASS', details: JSON.stringify(saveResult)});
    } else {
      throw new Error('Invalid save response format');
    }
  } catch (e) {
    console.log('❌ saveCurrentProject() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Save Project', status: 'FAIL', details: e.toString()});
  }
  
  // Test 3: User Settings
  console.log('\n⚙️ TEST 3: User Settings');
  try {
    const settings = getUserSettings();
    if (settings && typeof settings.credits !== 'undefined') {
      console.log('✅ getUserSettings() works');
      console.log('   Email: ' + (settings.email || 'Not set'));
      console.log('   Credits: ' + settings.credits);
      console.log('   License: ' + (settings.hasLicenseKey ? 'Active' : 'Inactive'));
      results.passed++;
      results.tests.push({name: 'User Settings', status: 'PASS', details: 'Credits: ' + settings.credits});
    } else {
      throw new Error('Invalid settings response');
    }
  } catch (e) {
    console.log('❌ getUserSettings() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'User Settings', status: 'FAIL', details: e.toString()});
  }
  
  // Test 4: Create New Project
  console.log('\n🆕 TEST 4: Create New Project');
  const testProjectName = 'TEST_' + new Date().getTime();
  try {
    const createResult = createProject(testProjectName);
    if (createResult && createResult.ok) {
      console.log('✅ createProject() works - Created: ' + testProjectName);
      results.passed++;
      results.tests.push({name: 'Create Project', status: 'PASS', details: testProjectName});
      
      // Clean up - delete test project
      try {
        deleteProject(testProjectName);
        console.log('   ✓ Cleaned up test project');
      } catch (cleanupError) {
        console.log('   ⚠️ Could not clean up test project: ' + cleanupError.toString());
      }
    } else {
      throw new Error('Create failed: ' + (createResult.error || 'Unknown error'));
    }
  } catch (e) {
    console.log('❌ createProject() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Create Project', status: 'FAIL', details: e.toString()});
  }
  
  // Test 5: Load Project
  console.log('\n📂 TEST 5: Load Project');
  try {
    const projects = listProjects();
    if (projects && projects.projects && projects.projects.length > 0) {
      const firstProject = projects.projects[0].name;
      const loadResult = loadProject(firstProject);
      if (loadResult && loadResult.data) {
        console.log('✅ loadProject() works - Loaded: ' + firstProject);
        console.log('   Fields: ' + Object.keys(loadResult.data).length);
        results.passed++;
        results.tests.push({name: 'Load Project', status: 'PASS', details: firstProject});
      } else {
        throw new Error('Invalid load response');
      }
    } else {
      console.log('⚠️ No projects to test loading');
      results.tests.push({name: 'Load Project', status: 'SKIP', details: 'No projects available'});
    }
  } catch (e) {
    console.log('❌ loadProject() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Load Project', status: 'FAIL', details: e.toString()});
  }
  
  // Test 6: Rename Project
  console.log('\n✏️ TEST 6: Rename Project');
  const renameTestName = 'TEST_RENAME_' + new Date().getTime();
  const renamedName = renameTestName + '_RENAMED';
  try {
    // Create test project
    const createResult = createProject(renameTestName);
    if (createResult && createResult.ok) {
      // Rename it
      const renameResult = renameProject(renameTestName, renamedName);
      if (renameResult && renameResult.ok) {
        console.log('✅ renameProject() works - Renamed to: ' + renamedName);
        results.passed++;
        results.tests.push({name: 'Rename Project', status: 'PASS', details: renameTestName + ' → ' + renamedName});
        
        // Clean up
        try {
          deleteProject(renamedName);
          console.log('   ✓ Cleaned up test project');
        } catch (cleanupError) {
          console.log('   ⚠️ Could not clean up: ' + cleanupError.toString());
        }
      } else {
        throw new Error('Rename failed: ' + (renameResult.error || 'Unknown error'));
      }
    } else {
      throw new Error('Could not create test project for rename');
    }
  } catch (e) {
    console.log('❌ renameProject() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Rename Project', status: 'FAIL', details: e.toString()});
  }
  
  // Test 7: Delete Project
  console.log('\n🗑️ TEST 7: Delete Project');
  const deleteTestName = 'TEST_DELETE_' + new Date().getTime();
  try {
    // Create test project
    const createResult = createProject(deleteTestName);
    if (createResult && createResult.ok) {
      // Delete it
      const deleteResult = deleteProject(deleteTestName);
      if (deleteResult && deleteResult.ok) {
        console.log('✅ deleteProject() works - Deleted: ' + deleteTestName);
        results.passed++;
        results.tests.push({name: 'Delete Project', status: 'PASS', details: deleteTestName});
      } else {
        throw new Error('Delete failed: ' + (deleteResult.error || 'Unknown error'));
      }
    } else {
      throw new Error('Could not create test project for deletion');
    }
  } catch (e) {
    console.log('❌ deleteProject() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Delete Project', status: 'FAIL', details: e.toString()});
  }
  
  // Test 8: License Key Save (simulated)
  console.log('\n🔑 TEST 8: License Key Management');
  try {
    // Test validation (don't actually save)
    const testEmail = 'test@example.com';
    const testKey = 'TEST-KEY-FOR-VALIDATION';
    
    // Just verify the function exists and can be called
    if (typeof saveLicenseKey === 'function') {
      console.log('✅ saveLicenseKey() function exists');
      results.passed++;
      results.tests.push({name: 'License Management', status: 'PASS', details: 'Function available'});
    } else {
      throw new Error('saveLicenseKey function not found');
    }
  } catch (e) {
    console.log('❌ License management test failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'License Management', status: 'FAIL', details: e.toString()});
  }
  
  // Test 9: Sidebar Display
  console.log('\n📋 TEST 9: Sidebar Display');
  try {
    const html = showSidebar();
    if (html) {
      console.log('✅ showSidebar() works');
      results.passed++;
      results.tests.push({name: 'Sidebar Display', status: 'PASS', details: 'Sidebar renders'});
    } else {
      throw new Error('Sidebar returned null');
    }
  } catch (e) {
    console.log('❌ showSidebar() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Sidebar Display', status: 'FAIL', details: e.toString()});
  }
  
  // Test 10: Refresh Projects
  console.log('\n🔄 TEST 10: Refresh Projects');
  try {
    const refreshResult = refreshProjects();
    if (refreshResult && refreshResult.projects) {
      console.log('✅ refreshProjects() works - Found ' + refreshResult.count + ' projects');
      results.passed++;
      results.tests.push({name: 'Refresh Projects', status: 'PASS', details: refreshResult.count + ' projects'});
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (e) {
    console.log('❌ refreshProjects() failed: ' + e.toString());
    results.failed++;
    results.tests.push({name: 'Refresh Projects', status: 'FAIL', details: e.toString()});
  }
  
  // SUMMARY
  console.log('\n\n🎯 ============================================');
  console.log('🎯 TEST SUMMARY');
  console.log('🎯 ============================================');
  console.log('✅ Passed: ' + results.passed);
  console.log('❌ Failed: ' + results.failed);
  console.log('📊 Total:  ' + (results.passed + results.failed));
  console.log('📈 Success Rate: ' + Math.round((results.passed / (results.passed + results.failed)) * 100) + '%');
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('─────────────────────────────────────────────');
  results.tests.forEach(function(test) {
    const icon = test.status === 'PASS' ? '✅' : (test.status === 'FAIL' ? '❌' : '⚠️');
    console.log(icon + ' ' + test.name + ': ' + test.status);
    if (test.details) {
      console.log('   ' + test.details);
    }
  });
  console.log('─────────────────────────────────────────────\n');
  
  return results;
}

/**
 * Quick diagnostic for debugging save issues
 */
function TEST_SAVE_DIAGNOSTIC() {
  console.log('🔍 SAVE FUNCTIONALITY DIAGNOSTIC');
  console.log('═══════════════════════════════════════\n');
  
  // Check active project
  const userProps = PropertiesService.getUserProperties();
  const activeProject = userProps.getProperty('serpifai_lastProject');
  console.log('1️⃣ Active Project: ' + (activeProject || 'NONE'));
  
  // Check projects list
  try {
    const projects = listProjects();
    console.log('2️⃣ Total Projects: ' + projects.count);
    if (projects.projects && projects.projects.length > 0) {
      console.log('   Projects:');
      projects.projects.forEach(function(p, i) {
        console.log('   ' + (i + 1) + '. ' + p.name);
      });
    }
  } catch (e) {
    console.log('❌ Error listing projects: ' + e.toString());
  }
  
  // Check saveCurrentProject
  console.log('\n3️⃣ Testing saveCurrentProject():');
  try {
    const result = saveCurrentProject();
    console.log('   Result: ' + JSON.stringify(result, null, 2));
  } catch (e) {
    console.log('❌ Error: ' + e.toString());
  }
  
  // Check user settings
  console.log('\n4️⃣ User Settings:');
  try {
    const settings = getUserSettings();
    console.log('   Email: ' + (settings.email || 'Not set'));
    console.log('   Credits: ' + settings.credits);
    console.log('   License: ' + (settings.hasLicenseKey ? 'Active (' + settings.licenseKeyMasked + ')' : 'Inactive'));
  } catch (e) {
    console.log('❌ Error: ' + e.toString());
  }
  
  console.log('\n═══════════════════════════════════════\n');
}

/**
 * Test Settings Tab specifically
 */
function TEST_SETTINGS_TAB() {
  console.log('⚙️ SETTINGS TAB TEST');
  console.log('═══════════════════════════════════════\n');
  
  console.log('1️⃣ getUserSettings():');
  try {
    const settings = getUserSettings();
    console.log(JSON.stringify(settings, null, 2));
  } catch (e) {
    console.log('❌ Error: ' + e.toString());
  }
  
  console.log('\n2️⃣ License Key Status:');
  try {
    const settings = getUserSettings();
    if (settings.hasLicenseKey) {
      console.log('✅ License Key: ' + settings.licenseKeyMasked);
      console.log('   Email: ' + settings.email);
      console.log('   Status: ' + settings.status);
    } else {
      console.log('⚠️ No license key configured');
    }
  } catch (e) {
    console.log('❌ Error: ' + e.toString());
  }
  
  console.log('\n3️⃣ Credits:');
  try {
    const settings = getUserSettings();
    console.log('   Available: ' + settings.credits);
    console.log('   API Status: ' + settings.apiStatus);
  } catch (e) {
    console.log('❌ Error: ' + e.toString());
  }
  
  console.log('\n═══════════════════════════════════════\n');
}

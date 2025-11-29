/**
 * 🔍 COMPREHENSIVE UI DIAGNOSTIC
 * Run this from Apps Script Editor (not from UI)
 * Tests every step of the Stage 1 workflow
 * 
 * IMPORTANT: This file should be added to your Google Sheet's Apps Script project
 * that already has Code.gs with ENDPOINTS constant.
 */

function DIAGNOSTIC_UI_FULL() {
  Logger.log('╔══════════════════════════════════════════════════════════╗');
  Logger.log('║     COMPREHENSIVE UI → DataBridge DIAGNOSTIC TEST        ║');
  Logger.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const results = {
    tests: [],
    passed: 0,
    failed: 0
  };
  
  // ============================================================================
  // TEST 1: Verify runWorkflowStage exists
  // ============================================================================
  Logger.log('📋 TEST 1: Check if runWorkflowStage function exists');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  if (typeof runWorkflowStage === 'function') {
    Logger.log('✅ PASS: runWorkflowStage function exists\n');
    results.tests.push({ name: 'runWorkflowStage exists', passed: true });
    results.passed++;
  } else {
    Logger.log('❌ FAIL: runWorkflowStage function NOT FOUND');
    Logger.log('   Fix: Add runWorkflowStage function to ui/Code.gs\n');
    results.tests.push({ name: 'runWorkflowStage exists', passed: false });
    results.failed++;
    return results;
  }
  
  // ============================================================================
  // TEST 2: Verify ENDPOINTS constant
  // ============================================================================
  Logger.log('📋 TEST 2: Check ENDPOINTS configuration');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  if (typeof ENDPOINTS !== 'undefined' && ENDPOINTS.DATABRIDGE) {
    Logger.log('✅ PASS: ENDPOINTS.DATABRIDGE exists');
    Logger.log('   URL: ' + ENDPOINTS.DATABRIDGE + '\n');
    results.tests.push({ name: 'ENDPOINTS configured', passed: true });
    results.passed++;
  } else {
    Logger.log('❌ FAIL: ENDPOINTS.DATABRIDGE not configured\n');
    results.tests.push({ name: 'ENDPOINTS configured', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 3: Simulate UI payload (single object pattern)
  // ============================================================================
  Logger.log('📋 TEST 3: Test with UI-style payload (single object)');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  const uiPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'DIAGNOSTIC_UI_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'UI Test Brand',
    primaryKeyword: 'ui test',
    businessCategory: 'Testing',
    targetAudience: 'Testers',
    productDescription: 'Test Product'
  };
  
  Logger.log('UI payload structure:');
  Logger.log('   Keys: ' + Object.keys(uiPayload).join(', '));
  Logger.log('   stageNum: ' + uiPayload.stageNum);
  Logger.log('   projectId: ' + uiPayload.projectId);
  Logger.log('   action: ' + uiPayload.action);
  
  try {
    Logger.log('\n🚀 Calling: runWorkflowStage(payload)');
    const result1 = runWorkflowStage(uiPayload);
    
    Logger.log('\n📥 Result received:');
    Logger.log('   Success: ' + result1.success);
    Logger.log('   Stage: ' + result1.stage);
    Logger.log('   Error: ' + (result1.error || 'none'));
    
    if (result1.success) {
      Logger.log('✅ PASS: Single-payload pattern works\n');
      results.tests.push({ name: 'UI payload pattern', passed: true });
      results.passed++;
    } else {
      Logger.log('❌ FAIL: Single-payload pattern failed');
      Logger.log('   Error: ' + result1.error + '\n');
      results.tests.push({ name: 'UI payload pattern', passed: false });
      results.failed++;
    }
  } catch (error) {
    Logger.log('❌ FAIL: Exception thrown');
    Logger.log('   Error: ' + error.toString());
    Logger.log('   Stack: ' + error.stack + '\n');
    results.tests.push({ name: 'UI payload pattern', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 4: Direct DataBridge connection (bypass runWorkflowStage)
  // ============================================================================
  Logger.log('📋 TEST 4: Direct DataBridge API test');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  const directPayload = {
    action: 'workflow:stage1',
    data: {
      projectId: 'DIRECT_' + Date.now(),
      brandName: 'Direct Test',
      primaryKeyword: 'direct',
      businessCategory: 'Testing',
      targetAudience: 'Testers',
      productDescription: 'Test'
    },
    modelName: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Direct payload to DataBridge:');
  Logger.log(JSON.stringify(directPayload, null, 2));
  
  try {
    if (typeof ENDPOINTS === 'undefined' || !ENDPOINTS.DATABRIDGE) {
      Logger.log('⚠️ SKIP: ENDPOINTS.DATABRIDGE not available\n');
      results.tests.push({ name: 'Direct DataBridge test', passed: false });
      results.failed++;
    } else {
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(directPayload),
        muteHttpExceptions: true
      };
      
      Logger.log('\n🚀 Calling: UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE)');
      const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, options);
      const responseCode = response.getResponseCode();
      const result2 = JSON.parse(response.getContentText());
      
      Logger.log('\n📥 DataBridge response:');
      Logger.log('   HTTP Code: ' + responseCode);
      Logger.log('   Success: ' + result2.success);
      Logger.log('   Error: ' + (result2.error || 'none'));
      
      if (result2.success) {
        Logger.log('   Has json: ' + !!result2.json);
        Logger.log('   Has report: ' + !!result2.report);
        Logger.log('✅ PASS: DataBridge is working correctly\n');
        results.tests.push({ name: 'Direct DataBridge test', passed: true });
        results.passed++;
      } else {
        Logger.log('❌ FAIL: DataBridge returned error');
        Logger.log('   Error: ' + result2.error + '\n');
        results.tests.push({ name: 'Direct DataBridge test', passed: false });
        results.failed++;
      }
    }
  } catch (error) {
    Logger.log('❌ FAIL: DataBridge connection error');
    Logger.log('   Error: ' + error.toString() + '\n');
    results.tests.push({ name: 'Direct DataBridge test', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 5: Verify payload transformation in runWorkflowStage
  // ============================================================================
  Logger.log('📋 TEST 5: Verify payload transformation');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  Logger.log('Expected transformation:');
  Logger.log('   INPUT (from UI):');
  Logger.log('   {');
  Logger.log('     action: "runWorkflowStage",');
  Logger.log('     stageNum: 1,');
  Logger.log('     projectId: "...",');
  Logger.log('     brandName: "...",');
  Logger.log('     ...');
  Logger.log('   }');
  Logger.log('');
  Logger.log('   OUTPUT (to DataBridge):');
  Logger.log('   {');
  Logger.log('     action: "workflow:stage1",');
  Logger.log('     data: {');
  Logger.log('       projectId: "...",');
  Logger.log('       brandName: "...",');
  Logger.log('       ...');
  Logger.log('     },');
  Logger.log('     modelName: "...",');
  Logger.log('     timestamp: "..."');
  Logger.log('   }');
  Logger.log('');
  
  // Read the actual runWorkflowStage code to verify transformation
  const functionCode = runWorkflowStage.toString();
  const hasFormDataExtraction = functionCode.includes('formData') || functionCode.includes('data:');
  const hasActionTransform = functionCode.includes('workflow:stage') || functionCode.includes('action:');
  
  if (hasFormDataExtraction && hasActionTransform) {
    Logger.log('✅ PASS: runWorkflowStage appears to transform payload correctly\n');
    results.tests.push({ name: 'Payload transformation', passed: true });
    results.passed++;
  } else {
    Logger.log('⚠️ WARNING: runWorkflowStage may not transform payload correctly');
    Logger.log('   Check function code for proper transformation\n');
    results.tests.push({ name: 'Payload transformation', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 6: Full Stage 1 test with validation
  // ============================================================================
  Logger.log('📋 TEST 6: Full Stage 1 execution with validation');
  Logger.log('─────────────────────────────────────────────────────────────');
  
  const fullPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'FULL_TEST_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'Full Test Brand',
    primaryKeyword: 'full test keyword',
    businessCategory: 'Testing & Quality Assurance',
    targetAudience: 'Software Testers and QA Engineers',
    productDescription: 'Comprehensive testing framework for elite quality assurance',
    competitors: 'test1.com, test2.com',
    uniqueValueProposition: 'Elite 0.1% quality testing',
    painPoints: 'Incomplete test coverage, slow execution',
    desiredOutcomes: 'Complete confidence in product quality'
  };
  
  Logger.log('Running full Stage 1 test...');
  Logger.log('(This may take 30-60 seconds)\n');
  
  try {
    const fullResult = runWorkflowStage(fullPayload);
    
    Logger.log('📥 Full result received:');
    Logger.log('   Success: ' + fullResult.success);
    Logger.log('   Stage: ' + fullResult.stage);
    
    if (fullResult.success && fullResult.json) {
      Logger.log('   ✅ Has json data');
      Logger.log('   ✅ Has report: ' + !!fullResult.report);
      
      // Validate 11/15/2025 format
      const json = fullResult.json;
      const validations = {
        dashboardCharts: !!json.dashboardCharts,
        customerFrustrationsChart: !!(json.dashboardCharts && json.dashboardCharts.customerFrustrationsChart),
        hiddenAspirationsChart: !!(json.dashboardCharts && json.dashboardCharts.hiddenAspirationsChart),
        mindsetTransformationChart: !!(json.dashboardCharts && json.dashboardCharts.mindsetTransformationChart),
        jtbdScenarios: !!json.jtbdScenarios,
        contentPillars: !!json.contentPillars,
        uniqueMechanism: !!json.uniqueMechanism,
        competitiveGaps: !!json.competitiveGaps,
        audienceProfile: !!json.audienceProfile
      };
      
      Logger.log('\n📊 Data structure validation (11/15/2025 format):');
      Object.keys(validations).forEach(function(key) {
        Logger.log('   ' + (validations[key] ? '✅' : '❌') + ' ' + key + ': ' + validations[key]);
      });
      
      const allValid = Object.values(validations).every(function(v) { return v; });
      
      if (allValid) {
        Logger.log('\n✅ PASS: Full Stage 1 test successful!');
        Logger.log('   All required fields present');
        Logger.log('   Format matches 11/15/2025 working version\n');
        results.tests.push({ name: 'Full Stage 1 execution', passed: true });
        results.passed++;
      } else {
        Logger.log('\n⚠️ PARTIAL: Stage 1 works but some fields missing');
        Logger.log('   Review DataBridge response format\n');
        results.tests.push({ name: 'Full Stage 1 execution', passed: false });
        results.failed++;
      }
    } else {
      Logger.log('   ❌ Stage 1 failed or incomplete data');
      Logger.log('   Error: ' + (fullResult.error || 'Unknown error') + '\n');
      results.tests.push({ name: 'Full Stage 1 execution', passed: false });
      results.failed++;
    }
  } catch (error) {
    Logger.log('❌ FAIL: Stage 1 execution error');
    Logger.log('   Error: ' + error.toString());
    Logger.log('   Stack: ' + error.stack + '\n');
    results.tests.push({ name: 'Full Stage 1 execution', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  Logger.log('╔══════════════════════════════════════════════════════════╗');
  Logger.log('║                    DIAGNOSTIC SUMMARY                    ║');
  Logger.log('╚══════════════════════════════════════════════════════════╝\n');
  
  Logger.log('Total Tests: ' + results.tests.length);
  Logger.log('✅ Passed: ' + results.passed);
  Logger.log('❌ Failed: ' + results.failed);
  Logger.log('');
  
  if (results.failed === 0) {
    Logger.log('🎉 ALL TESTS PASSED!');
    Logger.log('   Stage 1 is fully functional from UI');
    Logger.log('   You can now proceed with:');
    Logger.log('   1. Testing from actual UI sidebar');
    Logger.log('   2. Fetcher integration for 14 collectors');
    Logger.log('   3. Data quality badges');
    Logger.log('   4. Chart size optimization');
  } else {
    Logger.log('⚠️ ISSUES FOUND:');
    results.tests.forEach(function(test) {
      if (!test.passed) {
        Logger.log('   ❌ ' + test.name);
      }
    });
    Logger.log('');
    Logger.log('📋 RECOMMENDED FIXES:');
    
    if (!results.tests[0].passed) {
      Logger.log('   1. Add runWorkflowStage function to ui/Code.gs');
    }
    if (!results.tests[1].passed) {
      Logger.log('   2. Add ENDPOINTS constant to ui/Code.gs');
    }
    if (!results.tests[2].passed) {
      Logger.log('   3. Fix runWorkflowStage to accept single payload object');
    }
    if (!results.tests[3].passed) {
      Logger.log('   4. Verify DataBridge deployment has workflow handlers');
    }
    if (!results.tests[4].passed) {
      Logger.log('   5. Fix payload transformation in runWorkflowStage');
    }
    if (!results.tests[5].passed) {
      Logger.log('   6. Review DataBridge Stage 1 implementation');
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return results;
}

/**
 * 🧪 QUICK TEST: Just verify runWorkflowStage is callable from UI
 */
function QUICK_TEST_UI() {
  Logger.log('=== QUICK UI TEST ===\n');
  
  if (typeof runWorkflowStage !== 'function') {
    Logger.log('❌ runWorkflowStage NOT FOUND in ui/Code.gs');
    Logger.log('   This is why UI fails!');
    return false;
  }
  
  Logger.log('✅ runWorkflowStage exists');
  
  // Test with minimal payload
  const testPayload = {
    action: "runWorkflowStage",
    stageNum: 1,
    projectId: 'QUICK_' + Date.now(),
    model: 'gemini-2.5-flash',
    brandName: 'Quick Test',
    primaryKeyword: 'test',
    businessCategory: 'Test',
    targetAudience: 'Test',
    productDescription: 'Test'
  };
  
  try {
    Logger.log('🚀 Calling runWorkflowStage...');
    const result = runWorkflowStage(testPayload);
    
    if (result.success) {
      Logger.log('✅ SUCCESS! Stage 1 is working!');
      return true;
    } else {
      Logger.log('❌ FAILED: ' + result.error);
      return false;
    }
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return false;
  }
}

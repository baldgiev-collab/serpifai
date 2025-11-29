/**
 * 🔬 DEEP DIAGNOSIS - UI (Google Sheet)
 * Run this INSIDE your Google Sheet's Apps Script project
 * Tests EVERYTHING including real project data flow
 */

function DEEP_DIAGNOSIS_UI() {
  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║  🔬 DEEP DIAGNOSIS - UI PROJECT (Google Sheet)           ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // ============================================================================
  // TEST 1: Project Identity
  // ============================================================================
  Logger.log('📋 TEST 1: Verify UI Project Identity');
  Logger.log('─'.repeat(60));
  
  const scriptId = ScriptApp.getScriptId();
  const hasRunWorkflowStage = typeof runWorkflowStage === 'function';
  const hasENDPOINTS = typeof ENDPOINTS !== 'undefined';
  const hasHandleRequest = typeof handleRequest === 'function';
  const hasSaveProject = typeof saveProject === 'function';
  const hasLoadProject = typeof loadProject === 'function';
  
  Logger.log('Script ID: ' + scriptId);
  Logger.log('');
  Logger.log('UI Functions:');
  Logger.log('  • runWorkflowStage: ' + (hasRunWorkflowStage ? '✅' : '❌'));
  Logger.log('  • ENDPOINTS constant: ' + (hasENDPOINTS ? '✅' : '❌'));
  Logger.log('  • saveProject: ' + (hasSaveProject ? '✅' : '❌'));
  Logger.log('  • loadProject: ' + (hasLoadProject ? '✅' : '❌'));
  Logger.log('');
  Logger.log('Should NOT Have:');
  Logger.log('  • handleRequest: ' + (hasHandleRequest ? '❌ (PROBLEM!)' : '✅'));
  Logger.log('');
  
  if (hasRunWorkflowStage && hasENDPOINTS && !hasHandleRequest) {
    Logger.log('✅ PASS: This is a properly configured UI project\n');
    results.tests.push({ name: 'Project Identity', passed: true });
    results.passed++;
  } else if (hasHandleRequest) {
    Logger.log('❌ FAIL: Project has handleRequest (should only be in DataBridge)\n');
    results.tests.push({ name: 'Project Identity', passed: false });
    results.failed++;
  } else {
    Logger.log('❌ FAIL: Missing required UI functions\n');
    results.tests.push({ name: 'Project Identity', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 2: ENDPOINTS Configuration
  // ============================================================================
  Logger.log('📋 TEST 2: ENDPOINTS Configuration');
  Logger.log('─'.repeat(60));
  
  if (hasENDPOINTS) {
    Logger.log('ENDPOINTS.DATABRIDGE:');
    Logger.log('  ' + ENDPOINTS.DATABRIDGE);
    Logger.log('');
    Logger.log('ENDPOINTS.FETCHER:');
    Logger.log('  ' + (ENDPOINTS.FETCHER || 'Not defined'));
    Logger.log('');
    
    const expectedURL = 'https://script.google.com/macros/s/AKfycbxPwzYvsn-xVp_qGgInM5xkO0mi20rWjMwG6U8pbXgxeq9kfXLJBOcUl1E5qOmRrNNr/exec';
    const isCorrectURL = ENDPOINTS.DATABRIDGE === expectedURL;
    
    Logger.log('URL Validation:');
    Logger.log('  • Format: ' + (ENDPOINTS.DATABRIDGE.startsWith('https://script.google.com') ? '✅' : '❌'));
    Logger.log('  • Matches expected: ' + (isCorrectURL ? '✅' : '❌'));
    
    if (!isCorrectURL) {
      Logger.log('');
      Logger.log('⚠️ URL MISMATCH!');
      Logger.log('Expected: ' + expectedURL);
      Logger.log('Current:  ' + ENDPOINTS.DATABRIDGE);
    }
    Logger.log('');
    
    if (ENDPOINTS.DATABRIDGE && ENDPOINTS.DATABRIDGE.startsWith('https://script.google.com')) {
      Logger.log('✅ PASS: ENDPOINTS configured\n');
      results.tests.push({ name: 'ENDPOINTS Configuration', passed: true });
      results.passed++;
      
      if (!isCorrectURL) {
        Logger.log('⚠️ WARNING: Using non-standard URL\n');
        results.warnings++;
      }
    } else {
      Logger.log('❌ FAIL: ENDPOINTS.DATABRIDGE invalid\n');
      results.tests.push({ name: 'ENDPOINTS Configuration', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('❌ FAIL: ENDPOINTS not defined\n');
    results.tests.push({ name: 'ENDPOINTS Configuration', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 3: Test DataBridge Connection (Ping)
  // ============================================================================
  Logger.log('📋 TEST 3: Test DataBridge Connection (Ping)');
  Logger.log('─'.repeat(60));
  
  if (hasENDPOINTS && ENDPOINTS.DATABRIDGE) {
    try {
      const pingPayload = {
        action: 'ping'
      };
      
      const pingOptions = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(pingPayload),
        muteHttpExceptions: true
      };
      
      Logger.log('Calling: ' + ENDPOINTS.DATABRIDGE);
      Logger.log('Action: ping');
      Logger.log('');
      
      const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, pingOptions);
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('HTTP Status: ' + statusCode);
      Logger.log('Response: ' + responseText.substring(0, 200));
      Logger.log('');
      
      if (statusCode === 200) {
        const result = JSON.parse(responseText);
        if (result.success) {
          Logger.log('✅ PASS: DataBridge is reachable and responding\n');
          results.tests.push({ name: 'DataBridge Ping', passed: true });
          results.passed++;
        } else {
          Logger.log('⚠️ WARNING: DataBridge responded but success=false\n');
          results.tests.push({ name: 'DataBridge Ping', passed: false });
          results.warnings++;
        }
      } else {
        Logger.log('❌ FAIL: HTTP ' + statusCode + '\n');
        results.tests.push({ name: 'DataBridge Ping', passed: false });
        results.failed++;
      }
    } catch (error) {
      Logger.log('❌ ERROR: ' + error.toString());
      Logger.log('Stack: ' + (error.stack || 'No stack'));
      Logger.log('');
      results.tests.push({ name: 'DataBridge Ping', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('⏭️ SKIP: ENDPOINTS not configured\n');
    results.tests.push({ name: 'DataBridge Ping', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 4: runWorkflowStage Function Analysis
  // ============================================================================
  Logger.log('📋 TEST 4: Analyze runWorkflowStage Function');
  Logger.log('─'.repeat(60));
  
  if (hasRunWorkflowStage) {
    const funcCode = runWorkflowStage.toString();
    const hasLogger = funcCode.includes('Logger');
    const callsUrlFetch = funcCode.includes('UrlFetchApp.fetch');
    const usesENDPOINTS = funcCode.includes('ENDPOINTS');
    const hasWorkflowAction = funcCode.includes('workflow:stage');
    const hasDataProperty = funcCode.includes('data:');
    
    Logger.log('Function Code Analysis:');
    Logger.log('  • Has logging: ' + (hasLogger ? '✅' : '⚠️'));
    Logger.log('  • Calls UrlFetchApp.fetch: ' + (callsUrlFetch ? '✅' : '❌'));
    Logger.log('  • Uses ENDPOINTS: ' + (usesENDPOINTS ? '✅' : '❌'));
    Logger.log('  • Transforms to workflow:stage: ' + (hasWorkflowAction ? '✅' : '❌'));
    Logger.log('  • Wraps in data property: ' + (hasDataProperty ? '✅' : '❌'));
    Logger.log('');
    
    if (callsUrlFetch && usesENDPOINTS && hasWorkflowAction) {
      Logger.log('✅ PASS: runWorkflowStage properly structured\n');
      results.tests.push({ name: 'runWorkflowStage Analysis', passed: true });
      results.passed++;
    } else {
      Logger.log('❌ FAIL: runWorkflowStage missing required transformations\n');
      results.tests.push({ name: 'runWorkflowStage Analysis', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('❌ FAIL: runWorkflowStage not found\n');
    results.tests.push({ name: 'runWorkflowStage Analysis', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 5: Load Real Project Data
  // ============================================================================
  Logger.log('📋 TEST 5: Test with Real Project Data from Sheet');
  Logger.log('─'.repeat(60));
  
  if (hasLoadProject) {
    try {
      Logger.log('Loading project data from Sheet...');
      const projectData = loadProject();
      
      if (projectData && typeof projectData === 'object') {
        Logger.log('');
        Logger.log('Loaded Project Data:');
        Logger.log('  • Project ID: ' + (projectData.projectId || 'Not set'));
        Logger.log('  • Brand Name: ' + (projectData.brandName || 'Not set'));
        Logger.log('  • Primary Keyword: ' + (projectData.primaryKeyword || 'Not set'));
        Logger.log('  • Business Category: ' + (projectData.businessCategory || 'Not set'));
        Logger.log('  • Target Audience: ' + (projectData.targetAudience || 'Not set'));
        Logger.log('  • Product Description: ' + (projectData.productDescription || 'Not set'));
        Logger.log('  • Competitors: ' + (projectData.competitors || 'Not set'));
        Logger.log('  • Unique Value Prop: ' + (projectData.uniqueValueProposition || 'Not set'));
        Logger.log('  • Pain Points: ' + (projectData.painPoints || 'Not set'));
        Logger.log('  • Desired Outcomes: ' + (projectData.desiredOutcomes || 'Not set'));
        Logger.log('');
        
        const requiredFields = ['brandName', 'primaryKeyword', 'businessCategory', 'targetAudience', 'productDescription'];
        const missingFields = requiredFields.filter(function(field) {
          return !projectData[field] || projectData[field].trim() === '';
        });
        
        if (missingFields.length === 0) {
          Logger.log('✅ PASS: All required project fields present\n');
          results.tests.push({ name: 'Real Project Data', passed: true });
          results.passed++;
        } else {
          Logger.log('⚠️ WARNING: Missing required fields: ' + missingFields.join(', '));
          Logger.log('   Fill these in the Google Sheet before running Stage 1\n');
          results.tests.push({ name: 'Real Project Data', passed: false });
          results.warnings++;
        }
      } else {
        Logger.log('⚠️ WARNING: No project data found in Sheet\n');
        results.tests.push({ name: 'Real Project Data', passed: false });
        results.warnings++;
      }
    } catch (error) {
      Logger.log('❌ ERROR loading project: ' + error.toString());
      Logger.log('Stack: ' + (error.stack || 'No stack'));
      Logger.log('');
      results.tests.push({ name: 'Real Project Data', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('⏭️ SKIP: loadProject function not available\n');
    results.tests.push({ name: 'Real Project Data', passed: false });
    results.warnings++;
  }
  
  // ============================================================================
  // TEST 6: Full Stage 1 Flow with Real Data
  // ============================================================================
  Logger.log('📋 TEST 6: Execute Full Stage 1 with Real Project Data');
  Logger.log('─'.repeat(60));
  
  if (hasRunWorkflowStage && hasLoadProject) {
    try {
      Logger.log('Loading real project data...');
      let projectData = loadProject();
      
      if (!projectData || !projectData.brandName) {
        Logger.log('⚠️ No project data found, using minimal test data');
        projectData = {
          projectId: 'DEEP_DIAG_REAL_' + Date.now(),
          brandName: 'Test Brand',
          primaryKeyword: 'test keyword',
          businessCategory: 'Testing',
          targetAudience: 'Testers',
          productDescription: 'Test product description'
        };
      } else {
        // Ensure projectId exists
        if (!projectData.projectId) {
          projectData.projectId = 'DEEP_DIAG_' + Date.now();
        }
      }
      
      Logger.log('');
      Logger.log('Calling Stage 1 with:');
      Logger.log('  • Brand: ' + projectData.brandName);
      Logger.log('  • Keyword: ' + projectData.primaryKeyword);
      Logger.log('  • Category: ' + projectData.businessCategory);
      Logger.log('');
      Logger.log('🚀 Executing runWorkflowStage...');
      Logger.log('(This may take 30-60 seconds)');
      Logger.log('');
      
      const payload = {
        action: 'runWorkflowStage',
        stageNum: 1,
        projectId: projectData.projectId,
        model: 'gemini-2.0-flash-exp',
        brandName: projectData.brandName,
        primaryKeyword: projectData.primaryKeyword,
        businessCategory: projectData.businessCategory,
        targetAudience: projectData.targetAudience,
        productDescription: projectData.productDescription,
        competitors: projectData.competitors,
        uniqueValueProposition: projectData.uniqueValueProposition,
        painPoints: projectData.painPoints,
        desiredOutcomes: projectData.desiredOutcomes
      };
      
      const result = runWorkflowStage(payload);
      
      Logger.log('');
      Logger.log('📥 Result Received:');
      Logger.log('  • Success: ' + result.success);
      Logger.log('  • Stage: ' + result.stage);
      Logger.log('  • Has json: ' + (!!result.json ? '✅' : '❌'));
      Logger.log('  • Has report: ' + (!!result.report ? '✅' : '❌'));
      Logger.log('  • Error: ' + (result.error || 'none'));
      Logger.log('');
      
      if (result.success && result.json && result.report) {
        Logger.log('Validating output structure...');
        const json = result.json;
        
        const expectedFields = [
          'dashboardCharts',
          'jtbdScenarios',
          'contentPillars',
          'uniqueMechanism',
          'competitiveGaps',
          'audienceProfile'
        ];
        
        const presentFields = expectedFields.filter(function(field) {
          return !!json[field];
        });
        
        Logger.log('Output Fields Present:');
        expectedFields.forEach(function(field) {
          Logger.log('  • ' + field + ': ' + (!!json[field] ? '✅' : '❌'));
        });
        Logger.log('');
        
        if (presentFields.length === expectedFields.length) {
          Logger.log('✅ PASS: Stage 1 executed successfully with complete output\n');
          results.tests.push({ name: 'Full Stage 1 Flow', passed: true });
          results.passed++;
        } else {
          Logger.log('⚠️ PARTIAL: Stage 1 executed but some fields missing\n');
          results.tests.push({ name: 'Full Stage 1 Flow', passed: false });
          results.warnings++;
        }
      } else {
        Logger.log('❌ FAIL: Stage 1 execution failed');
        Logger.log('Error: ' + (result.error || 'Unknown error'));
        Logger.log('');
        
        if (result.error && result.error.includes('Unknown action')) {
          Logger.log('🚨 ROOT CAUSE: DataBridge does not recognize workflow:stage1');
          Logger.log('');
          Logger.log('This means:');
          Logger.log('1. The deployed DataBridge does NOT have workflow_router.gs');
          Logger.log('2. OR the deployment is cached and serving old code');
          Logger.log('3. OR the URL points to a different/old deployment');
          Logger.log('');
        }
        
        results.tests.push({ name: 'Full Stage 1 Flow', passed: false });
        results.failed++;
      }
    } catch (error) {
      Logger.log('❌ ERROR: ' + error.toString());
      Logger.log('Stack: ' + (error.stack || 'No stack'));
      Logger.log('');
      results.tests.push({ name: 'Full Stage 1 Flow', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('⏭️ SKIP: Required functions not available\n');
    results.tests.push({ name: 'Full Stage 1 Flow', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // TEST 7: Direct DataBridge Call (Bypass runWorkflowStage)
  // ============================================================================
  Logger.log('📋 TEST 7: Direct DataBridge API Call');
  Logger.log('─'.repeat(60));
  
  if (hasENDPOINTS && ENDPOINTS.DATABRIDGE) {
    try {
      Logger.log('Bypassing runWorkflowStage, calling DataBridge directly...');
      
      const directPayload = {
        action: 'workflow:stage1',
        modelName: 'gemini-2.0-flash-exp',
        data: {
          projectId: 'DIRECT_CALL_' + Date.now(),
          brandName: 'Direct API Test',
          primaryKeyword: 'direct test',
          businessCategory: 'Testing',
          targetAudience: 'Developers',
          productDescription: 'Testing direct API call'
        },
        timestamp: new Date().toISOString()
      };
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(directPayload),
        muteHttpExceptions: true
      };
      
      Logger.log('Payload:');
      Logger.log(JSON.stringify(directPayload, null, 2));
      Logger.log('');
      Logger.log('Calling: ' + ENDPOINTS.DATABRIDGE);
      Logger.log('');
      
      const response = UrlFetchApp.fetch(ENDPOINTS.DATABRIDGE, options);
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log('HTTP Status: ' + statusCode);
      Logger.log('');
      
      if (statusCode === 200) {
        const result = JSON.parse(responseText);
        Logger.log('Response:');
        Logger.log('  • Success: ' + result.success);
        Logger.log('  • Error: ' + (result.error || 'none'));
        Logger.log('  • Has json: ' + (!!result.json ? '✅' : '❌'));
        Logger.log('  • Has report: ' + (!!result.report ? '✅' : '❌'));
        Logger.log('');
        
        if (result.success && result.json && result.report) {
          Logger.log('✅ PASS: Direct DataBridge call works\n');
          results.tests.push({ name: 'Direct DataBridge Call', passed: true });
          results.passed++;
        } else {
          Logger.log('❌ FAIL: DataBridge returned error: ' + (result.error || 'Unknown'));
          Logger.log('');
          
          if (result.error && result.error.includes('Unknown action')) {
            Logger.log('🚨 CONFIRMED: DataBridge deployment missing workflow:stage1 handler');
            Logger.log('');
            Logger.log('SOLUTION:');
            Logger.log('1. Open DataBridge project in Apps Script editor');
            Logger.log('2. Run DEEP_DIAGNOSIS_DATABRIDGE() function');
            Logger.log('3. Follow the recommendations to fix DataBridge');
            Logger.log('4. Create NEW deployment after fixes');
            Logger.log('5. Update URL in this UI project');
            Logger.log('');
          }
          
          results.tests.push({ name: 'Direct DataBridge Call', passed: false });
          results.failed++;
        }
      } else {
        Logger.log('❌ FAIL: HTTP ' + statusCode);
        Logger.log('Response: ' + responseText.substring(0, 200));
        Logger.log('');
        results.tests.push({ name: 'Direct DataBridge Call', passed: false });
        results.failed++;
      }
    } catch (error) {
      Logger.log('❌ ERROR: ' + error.toString());
      Logger.log('Stack: ' + (error.stack || 'No stack'));
      Logger.log('');
      results.tests.push({ name: 'Direct DataBridge Call', passed: false });
      results.failed++;
    }
  } else {
    Logger.log('⏭️ SKIP: ENDPOINTS not configured\n');
    results.tests.push({ name: 'Direct DataBridge Call', passed: false });
    results.failed++;
  }
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║                    DIAGNOSIS SUMMARY                      ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  Logger.log('Total Tests: ' + results.tests.length);
  Logger.log('✅ Passed: ' + results.passed);
  Logger.log('❌ Failed: ' + results.failed);
  Logger.log('⚠️ Warnings: ' + results.warnings);
  Logger.log('');
  
  if (results.failed === 0 && results.warnings === 0) {
    Logger.log('🎉 ALL TESTS PASSED!');
    Logger.log('');
    Logger.log('UI is properly configured and Stage 1 is working!');
    Logger.log('You can now proceed with:');
    Logger.log('  1. Testing from UI sidebar');
    Logger.log('  2. Competitor analysis integration');
    Logger.log('  3. Data quality badges');
    Logger.log('');
  } else if (results.failed > 0) {
    Logger.log('🚨 CRITICAL ISSUES FOUND:');
    Logger.log('');
    results.tests.forEach(function(test) {
      if (!test.passed) {
        Logger.log('   ❌ ' + test.name);
      }
    });
    Logger.log('');
    Logger.log('📋 NEXT STEPS:');
    Logger.log('');
    
    const hasDataBridgeError = results.tests.some(function(test) {
      return test.name.includes('DataBridge') && !test.passed;
    });
    
    if (hasDataBridgeError) {
      Logger.log('1. Open DataBridge Apps Script project');
      Logger.log('2. Add DEEP_DIAGNOSIS_DATABRIDGE.gs file');
      Logger.log('3. Run DEEP_DIAGNOSIS_DATABRIDGE() function');
      Logger.log('4. Follow recommendations to fix DataBridge');
      Logger.log('5. Push updated code: cd databridge && clasp push');
      Logger.log('6. Create NEW deployment with description');
      Logger.log('7. Copy new deployment URL');
      Logger.log('8. Update ENDPOINTS.DATABRIDGE in this UI Code.gs');
      Logger.log('9. Re-run DEEP_DIAGNOSIS_UI()');
      Logger.log('');
    }
    
    if (!hasENDPOINTS) {
      Logger.log('• Add ENDPOINTS constant to Code.gs');
    }
    if (!hasRunWorkflowStage) {
      Logger.log('• Add runWorkflowStage function to Code.gs');
    }
    Logger.log('');
  } else {
    Logger.log('⚠️ WARNINGS DETECTED:');
    Logger.log('');
    results.tests.forEach(function(test) {
      if (!test.passed && results.warnings > 0) {
        Logger.log('   ⚠️ ' + test.name);
      }
    });
    Logger.log('');
    Logger.log('Review warnings above for details.\n');
  }
  
  Logger.log('Script ID: ' + ScriptApp.getScriptId());
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return results;
}

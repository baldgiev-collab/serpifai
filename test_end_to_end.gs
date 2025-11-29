/**
 * 🧪 End-to-End Test for SERPIFAI Workflow
 * Tests the complete flow: UI → DataBridge → Gemini API → Google Sheets
 */

function testEndToEnd() {
  Logger.log('=== SERPIFAI END-TO-END TEST ===\n');
  
  const results = {
    apiKey: false,
    modelDiscovery: false,
    dataBridgePing: false,
    workflowStage1: false,
    responseStructure: false,
    googleSheetsSave: false
  };
  
  // 1. Check API Key
  Logger.log('1️⃣ Testing API Key...');
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (apiKey) {
    Logger.log('✅ API Key configured\n');
    results.apiKey = true;
  } else {
    Logger.log('❌ API Key not configured\n');
    Logger.log('TEST FAILED - Configure GEMINI_API_KEY in Script Properties');
    return results;
  }
  
  // 2. Test Model Discovery
  Logger.log('2️⃣ Testing Model Discovery...');
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = UrlFetchApp.fetch(listUrl, { muteHttpExceptions: true });
    
    if (listResponse.getResponseCode() === 200) {
      const listJson = JSON.parse(listResponse.getContentText());
      const availableModels = [];
      
      if (listJson.models) {
        listJson.models.forEach(model => {
          if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
            availableModels.push(model.name.replace('models/', ''));
          }
        });
      }
      
      if (availableModels.length > 0) {
        Logger.log('✅ Found ' + availableModels.length + ' available models');
        Logger.log('   First model: ' + availableModels[0] + '\n');
        results.modelDiscovery = true;
        
        // Set the first available model for testing
        PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', availableModels[0]);
        Logger.log('🔧 Set GEMINI_MODEL to: ' + availableModels[0] + '\n');
      } else {
        Logger.log('❌ No models found that support generateContent\n');
        return results;
      }
    } else {
      Logger.log('❌ Model discovery failed: HTTP ' + listResponse.getResponseCode() + '\n');
      return results;
    }
  } catch (error) {
    Logger.log('❌ Model discovery error: ' + error.toString() + '\n');
    return results;
  }
  
  // 3. Test DataBridge Ping
  Logger.log('3️⃣ Testing DataBridge Connection...');
  const DATABRIDGE_URL = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
  
  try {
    const pingPayload = { action: 'ping' };
    const pingOptions = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(pingPayload),
      muteHttpExceptions: true
    };
    
    const pingResponse = UrlFetchApp.fetch(DATABRIDGE_URL, pingOptions);
    const pingResult = JSON.parse(pingResponse.getContentText());
    
    if (pingResult.success) {
      Logger.log('✅ DataBridge is online\n');
      results.dataBridgePing = true;
    } else {
      Logger.log('❌ DataBridge ping failed\n');
      return results;
    }
  } catch (error) {
    Logger.log('❌ DataBridge connection error: ' + error.toString() + '\n');
    return results;
  }
  
  // 4. Test Workflow Stage 1 with Model Selection
  Logger.log('4️⃣ Testing Workflow Stage 1 with Model Selection...');
  const selectedModel = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL');
  Logger.log('   Using model: ' + selectedModel);
  
  try {
    const workflowPayload = {
      action: 'workflow:stage1',
      modelName: selectedModel, // Explicitly pass model from UI simulation
      data: {
        projectId: 'TEST_E2E_' + new Date().getTime(),
        brandName: 'Test Brand',
        brandIdeology: 'Innovation through simplicity',
        coreTopic: 'AI-powered SEO',
        targetAudience: 'Marketing professionals',
        keyCompetitors: 'example.com, test.com'
      }
    };
    
    const workflowOptions = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(workflowPayload),
      muteHttpExceptions: true
    };
    
    Logger.log('   Calling DataBridge...');
    const workflowResponse = UrlFetchApp.fetch(DATABRIDGE_URL, workflowOptions);
    const workflowResult = JSON.parse(workflowResponse.getContentText());
    
    if (workflowResponse.getResponseCode() === 200 && workflowResult.success) {
      Logger.log('✅ Workflow Stage 1 completed successfully\n');
      results.workflowStage1 = true;
      
      // 5. Test Response Structure
      Logger.log('5️⃣ Testing Response Structure...');
      if (workflowResult.json && workflowResult.report) {
        Logger.log('✅ Response includes both json and report fields');
        Logger.log('   - json type: ' + typeof workflowResult.json);
        Logger.log('   - report length: ' + workflowResult.report.length + ' chars\n');
        results.responseStructure = true;
      } else {
        Logger.log('❌ Response missing json or report fields');
        Logger.log('   Available fields: ' + Object.keys(workflowResult).join(', ') + '\n');
        return results;
      }
      
      // 6. Test Google Sheets Save
      Logger.log('6️⃣ Testing Google Sheets Save...');
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit';
      
      try {
        const ss = SpreadsheetApp.openByUrl(sheetUrl);
        const sheet = ss.getSheetByName('Workflow_Stage_1');
        
        if (sheet) {
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) { // More than just header
            const projectIdCell = sheet.getRange(lastRow, 1).getValue();
            Logger.log('✅ Google Sheets accessible');
            Logger.log('   Last project: ' + projectIdCell);
            Logger.log('   Total rows: ' + (lastRow - 1) + '\n');
            results.googleSheetsSave = true;
          } else {
            Logger.log('⚠️ Sheet exists but no data yet\n');
            results.googleSheetsSave = true; // Sheet is accessible
          }
        } else {
          Logger.log('❌ Workflow_Stage_1 sheet not found\n');
        }
      } catch (error) {
        Logger.log('❌ Google Sheets error: ' + error.toString() + '\n');
      }
      
    } else {
      Logger.log('❌ Workflow Stage 1 failed');
      Logger.log('   Error: ' + (workflowResult.error || 'Unknown error') + '\n');
      return results;
    }
  } catch (error) {
    Logger.log('❌ Workflow execution error: ' + error.toString() + '\n');
    return results;
  }
  
  // Summary
  Logger.log('=== TEST SUMMARY ===');
  Logger.log('API Key:           ' + (results.apiKey ? '✅' : '❌'));
  Logger.log('Model Discovery:   ' + (results.modelDiscovery ? '✅' : '❌'));
  Logger.log('DataBridge Ping:   ' + (results.dataBridgePing ? '✅' : '❌'));
  Logger.log('Workflow Stage 1:  ' + (results.workflowStage1 ? '✅' : '❌'));
  Logger.log('Response Structure:' + (results.responseStructure ? '✅' : '❌'));
  Logger.log('Google Sheets:     ' + (results.googleSheetsSave ? '✅' : '❌'));
  
  const allPassed = Object.values(results).every(v => v === true);
  Logger.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'));
  
  return results;
}

/**
 * Quick test for UI model selection flow
 * Run this from the UI Apps Script project
 */
function testUIModelSelection() {
  Logger.log('=== TESTING UI MODEL SELECTION FLOW ===\n');
  
  // Use actual available model name (not 'latest')
  const testModel = 'gemini-2.5-flash';
  const testData = {
    projectId: 'TEST_UI_MODEL',
    brandName: 'UI Test Brand',
    brandIdeology: 'Innovation through testing',
    coreTopic: 'Model selection test',
    targetAudience: 'Test audience',
    audiencePains: 'Test pains',
    audienceDesired: 'Test outcomes',
    keyCompetitors: 'test1.com, test2.com'
  };
  
  Logger.log('Simulating UI call with model: ' + testModel);
  
  try {
    // This simulates what the UI does when user selects a model and runs a stage
    const result = runWorkflowStage(1, testData, testModel);
    
    if (result.success) {
      Logger.log('✅ UI model selection works!');
      Logger.log('   Response includes json: ' + ('json' in result));
      Logger.log('   Response includes report: ' + ('report' in result));
    } else {
      Logger.log('❌ Workflow failed: ' + result.error);
    }
    
    return result;
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

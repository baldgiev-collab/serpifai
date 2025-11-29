/**
 * 🔧 SERPIFAI - Google Sheet Setup Helper
 * Run this once to automatically create all required sheets
 */

function setupWorkflowSheets() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit';
  
  try {
    const ss = SpreadsheetApp.openByUrl(sheetUrl);
    
    const sheetsToCreate = [
      'Workflow_Stage_1',
      'Workflow_Stage_2',
      'Workflow_Stage_3',
      'Workflow_Stage_4',
      'Workflow_Stage_5'
    ];
    
    const headers = ['Project ID', 'Timestamp', 'JSON Data', 'Full Response'];
    
    sheetsToCreate.forEach(sheetName => {
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        // Create new sheet
        sheet = ss.insertSheet(sheetName);
        Logger.log('✅ Created sheet: ' + sheetName);
      } else {
        Logger.log('⚠️ Sheet already exists: ' + sheetName);
      }
      
      // Set headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.getRange(1, 1, 1, headers.length).setBackground('#4f45e3');
      sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
      
      // Set column widths
      sheet.setColumnWidth(1, 200); // Project ID
      sheet.setColumnWidth(2, 180); // Timestamp
      sheet.setColumnWidth(3, 400); // JSON Data
      sheet.setColumnWidth(4, 600); // Full Response
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      Logger.log('✅ Configured headers for: ' + sheetName);
    });
    
    Logger.log('\n✅ SETUP COMPLETE!');
    Logger.log('All workflow sheets have been created and configured.');
    
    return {
      success: true,
      message: 'Successfully created and configured all workflow sheets'
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function to verify sheet access
 */
function testSheetAccess() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit';
  
  try {
    const ss = SpreadsheetApp.openByUrl(sheetUrl);
    Logger.log('✅ Successfully accessed sheet: ' + ss.getName());
    
    const sheets = ss.getSheets();
    Logger.log('📊 Found ' + sheets.length + ' sheets:');
    sheets.forEach(sheet => {
      Logger.log('  - ' + sheet.getName());
    });
    
    return true;
  } catch (error) {
    Logger.log('❌ Cannot access sheet: ' + error.toString());
    return false;
  }
}

/**
 * Test Stage 1 workflow with sample data
 */
function testStage1Workflow() {
  const sampleData = {
    projectId: 'TEST_PROJECT_' + new Date().getTime(),
    brandName: 'SerpifAI',
    brandIdeology: 'We believe SEO professionals should be architects, not tacticians.',
    brandArchetype: 'Sage',
    quarterlyObjective: 'Launch SerpifAI platform and acquire 100 beta users',
    coreTopic: 'AI-powered SEO workflow automation',
    targetAudience: 'B2B SaaS founders and marketing directors aged 30-45',
    audiencePains: 'Overwhelmed by AI tools, fragmented workflows, lack of strategic direction',
    audienceDesired: 'Become strategic SEO architects with AI as copilot',
    keyCompetitors: 'ahrefs.com, semrush.com, surfer.co',
    offerMatrix: '| Offer | Type | Audience | Benefit |\n| Blueprint Bundle | Digital Product | Founders | Complete system |',
    uvp: 'Architect your SEO authority with intelligent systems, not just speed.',
    primaryChannels: 'LinkedIn, Twitter/X, SEO blog',
    northStarKpis: 'MRR growth, organic traffic, demo bookings',
    brandLexicon: 'Architect (not automate), Copilot (not autopilot), Authority (not just rankings)'
  };
  
  Logger.log('🧪 Testing Stage 1 workflow with sample data...');
  Logger.log('📊 Sample data has ' + Object.keys(sampleData).length + ' fields');
  
  const result = runStage1Strategy(sampleData);
  
  if (result.success) {
    Logger.log('✅ Stage 1 test PASSED');
    Logger.log('📊 JSON Data preview:');
    Logger.log(JSON.stringify(result.jsonData, null, 2).substring(0, 500) + '...');
    Logger.log('\n📝 Full Response preview:');
    Logger.log(result.fullResponse.substring(0, 500) + '...');
  } else {
    Logger.log('❌ Stage 1 test FAILED: ' + result.error);
  }
  
  return result;
}

/**
 * Verify Gemini API key is configured
 */
function checkGeminiAPIKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    Logger.log('❌ GEMINI_API_KEY not found!');
    Logger.log('📋 Setup Instructions:');
    Logger.log('1. Go to Project Settings (⚙️ icon)');
    Logger.log('2. Click "Script Properties"');
    Logger.log('3. Click "Add script property"');
    Logger.log('4. Property: GEMINI_API_KEY');
    Logger.log('5. Value: Your Gemini API key from https://aistudio.google.com/app/apikey');
    return false;
  }
  
  Logger.log('✅ GEMINI_API_KEY is configured');
  Logger.log('🔑 Key preview: ' + apiKey.substring(0, 10) + '...');
  return true;
}

/**
 * Test if we can receive data from UI
 */
function testDataReception(stageNum, formData) {
  Logger.log('🧪 Testing data reception from UI');
  Logger.log('📊 Stage Number: ' + stageNum + ' (type: ' + typeof stageNum + ')');
  Logger.log('📊 Form Data type: ' + typeof formData);
  
  if (formData) {
    Logger.log('📊 Form Data keys (' + Object.keys(formData).length + '):');
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      const preview = value ? String(value).substring(0, 50) : '(empty)';
      Logger.log('  - ' + key + ': ' + preview);
    });
  } else {
    Logger.log('❌ Form Data is null/undefined!');
  }
  
  return {
    success: true,
    receivedStageNum: stageNum,
    receivedFormData: formData ? true : false,
    fieldCount: formData ? Object.keys(formData).length : 0
  };
}

/**
 * List available Gemini models
 */
function listGeminiModels() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    Logger.log('❌ GEMINI_API_KEY not configured');
    return [];
  }
  
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const json = JSON.parse(response.getContentText());
    
    Logger.log('📋 Available Gemini Models:\n');
    
    const models = [];
    
    if (json.models) {
      json.models.forEach(model => {
        if (model.supportedGenerationMethods && 
            model.supportedGenerationMethods.includes('generateContent')) {
          Logger.log('✅ ' + model.name);
          Logger.log('   Display: ' + model.displayName);
          Logger.log('   Description: ' + model.description);
          Logger.log('');
          
          models.push({
            name: model.name,
            displayName: model.displayName,
            description: model.description
          });
        }
      });
    }
    
    return models;
  } catch (error) {
    Logger.log('❌ Error listing models: ' + error.toString());
    return [];
  }
}

/**
 * Get available Gemini models for UI dropdown
 */
function getGeminiModels() {
  const models = listGeminiModels();
  
  // Get first available model as default
  let defaultModel = 'gemini-pro';
  if (models.length > 0) {
    defaultModel = models[0].name.replace('models/', '');
  }
  
  return {
    success: true,
    models: models,
    currentModel: PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || defaultModel
  };
}/**
 * Set selected Gemini model
 */
function setGeminiModel(modelName) {
  try {
    PropertiesService.getScriptProperties().setProperty('GEMINI_MODEL', modelName);
    Logger.log('✅ Gemini model set to: ' + modelName);
    return {
      success: true,
      model: modelName
    };
  } catch (error) {
    Logger.log('❌ Error setting model: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test Gemini API with simple prompt
 */
function testGeminiAPI() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    Logger.log('❌ GEMINI_API_KEY not configured');
    return false;
  }
  
  // Get user-selected model, or discover first available
  let selectedModel = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL');
  
  if (!selectedModel) {
    // Auto-discover first available model
    const models = listGeminiModels();
    if (models.length > 0) {
      selectedModel = models[0].name.replace('models/', '');
      Logger.log('🔍 Auto-discovered model: ' + selectedModel);
    } else {
      Logger.log('❌ No models found');
      return false;
    }
  }
  
  Logger.log('🧪 Testing Gemini API with simple prompt...');
  Logger.log('🤖 Using model: ' + selectedModel);
  
  const url = `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: 'What is SEO? Answer in one sentence.'
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log('❌ API Error: ' + response.getContentText());
      return false;
    }
    
    const json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0]) {
      const text = json.candidates[0].content.parts[0].text;
      Logger.log('✅ Gemini API working!');
      Logger.log('📝 Response: ' + text);
      return true;
    }
    
    Logger.log('❌ Unexpected response structure');
    return false;
    
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    return false;
  }
}

/**
 * Complete setup verification
 */
function verifySetup() {
  Logger.log('🔍 SERPIFAI Setup Verification\n');
  Logger.log('================================\n');
  
  // Check 1: Gemini API Key
  Logger.log('1️⃣ Checking Gemini API Key...');
  const hasApiKey = checkGeminiAPIKey();
  Logger.log('');
  
  // Check 2: Sheet Access
  Logger.log('2️⃣ Checking Google Sheet access...');
  const hasSheetAccess = testSheetAccess();
  Logger.log('');
  
  // Check 3: Workflow Sheets
  Logger.log('3️⃣ Checking workflow sheets...');
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit';
  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const requiredSheets = ['Workflow_Stage_1', 'Workflow_Stage_2', 'Workflow_Stage_3', 'Workflow_Stage_4', 'Workflow_Stage_5'];
  let allSheetsExist = true;
  
  requiredSheets.forEach(sheetName => {
    const exists = ss.getSheetByName(sheetName) !== null;
    Logger.log(exists ? '✅ ' + sheetName : '❌ ' + sheetName + ' (missing)');
    if (!exists) allSheetsExist = false;
  });
  Logger.log('');
  
  // Summary
  Logger.log('================================');
  Logger.log('📊 SETUP SUMMARY\n');
  Logger.log('API Key: ' + (hasApiKey ? '✅' : '❌'));
  Logger.log('Sheet Access: ' + (hasSheetAccess ? '✅' : '❌'));
  Logger.log('Workflow Sheets: ' + (allSheetsExist ? '✅' : '❌'));
  Logger.log('');
  
  if (hasApiKey && hasSheetAccess && allSheetsExist) {
    Logger.log('🎉 SETUP COMPLETE! You\'re ready to run workflows!');
    Logger.log('💡 Next: Test with testStage1Workflow()');
  } else {
    Logger.log('⚠️ SETUP INCOMPLETE');
    if (!hasApiKey) Logger.log('👉 Configure GEMINI_API_KEY in Script Properties');
    if (!hasSheetAccess) Logger.log('👉 Verify sheet URL and permissions');
    if (!allSheetsExist) Logger.log('👉 Run setupWorkflowSheets() to create sheets');
  }
}

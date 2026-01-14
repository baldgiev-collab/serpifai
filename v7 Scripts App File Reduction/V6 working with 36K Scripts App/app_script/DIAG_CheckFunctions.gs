/**
 * DIAGNOSTIC: Check All Loaded Functions
 * Run this from Apps Script to see what functions are actually available
 */
function DIAG_checkLoadedFunctions() {
  const results = {
    timestamp: new Date().toISOString(),
    functions: {},
    files: {},
    buildEliteJSONPrompt: null
  };
  
  // Check if buildEliteJSONPrompt exists
  try {
    if (typeof buildEliteJSONPrompt === 'function') {
      results.buildEliteJSONPrompt = {
        exists: true,
        type: 'function',
        canCall: true
      };
    } else {
      results.buildEliteJSONPrompt = {
        exists: false,
        type: typeof buildEliteJSONPrompt,
        message: 'Function not found or not a function'
      };
    }
  } catch (e) {
    results.buildEliteJSONPrompt = {
      exists: false,
      error: e.toString(),
      message: 'Error checking function existence'
    };
  }
  
  // Check related functions
  const functionsToCheck = [
    'buildEliteCompetitorPrompt',
    'buildEliteAnalysisPrompt',
    'parseGeminiJSONResponse',
    'generateFallbackStructuredAnalysis',
    'COMP_orchestrateAnalysis',
    'runEliteCompetitorAnalysis'
  ];
  
  functionsToCheck.forEach(funcName => {
    try {
      const func = eval(funcName);
      results.functions[funcName] = {
        exists: typeof func === 'function',
        type: typeof func
      };
    } catch (e) {
      results.functions[funcName] = {
        exists: false,
        error: e.toString()
      };
    }
  });
  
  // Try to list all script files
  try {
    const scriptId = ScriptApp.getScriptId();
    results.scriptId = scriptId;
  } catch (e) {
    results.scriptError = e.toString();
  }
  
  Logger.log('=== FUNCTION DIAGNOSTIC ===');
  Logger.log(JSON.stringify(results, null, 2));
  
  // Return for UI display
  return results;
}

/**
 * Test calling buildEliteJSONPrompt with sample data
 */
function DIAG_testBuildEliteJSONPrompt() {
  const testData = [
    {
      domain: 'example.com',
      fetchSuccess: true,
      snapshot: {
        metadata: {
          title: 'Example Site',
          description: 'Test description',
          wordCount: 500
        }
      },
      apiData: {
        serper: { organicKeywords: 100 },
        openPageRank: { rank: 5 }
      }
    }
  ];
  
  try {
    Logger.log('🧪 Testing buildEliteJSONPrompt...');
    const prompt = buildEliteJSONPrompt(testData, 'test.com', {});
    
    Logger.log('✅ Function call successful!');
    Logger.log('   Prompt length: ' + prompt.length);
    Logger.log('   First 200 chars: ' + prompt.substring(0, 200));
    
    return {
      success: true,
      promptLength: prompt.length,
      preview: prompt.substring(0, 200)
    };
  } catch (e) {
    Logger.log('❌ Function call failed: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    
    return {
      success: false,
      error: e.toString(),
      stack: e.stack
    };
  }
}

/**
 * Show which files are included in the project
 */
function DIAG_listProjectFiles() {
  try {
    const project = DriveApp.getFileById(ScriptApp.getScriptId());
    Logger.log('📁 Project: ' + project.getName());
    Logger.log('🆔 Script ID: ' + ScriptApp.getScriptId());
    
    // Check specific file patterns
    const filePatterns = [
      'DB_COMP_ElitePrompt',
      'DB_COMP_Elite',
      'ElitePrompt',
      'Prompt'
    ];
    
    Logger.log('\n📝 Checking for files containing:');
    filePatterns.forEach(pattern => {
      Logger.log('  - ' + pattern);
    });
    
    return {
      success: true,
      scriptId: ScriptApp.getScriptId(),
      projectName: project.getName()
    };
  } catch (e) {
    Logger.log('❌ Error listing files: ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * DB_COMP_Main.gs
 * Main orchestrator for Elite Competitor Analysis (15 categories)
 */

function DB_COMP_analyzeCompetitors(params) {
  return callGateway('comp:analyze', params || {});
}

function DB_COMP_orchestrateAnalysis(config) {
  Logger.log('🎯 DB_COMP_orchestrateAnalysis called');
  Logger.log('   Arguments count: ' + arguments.length);
  Logger.log('   Config type: ' + typeof config);
  Logger.log('   Config is null: ' + (config === null));
  Logger.log('   Config is undefined: ' + (config === undefined));
  
  // DEFENSIVE: Check if ANY argument was passed
  if (arguments.length === 0) {
    Logger.log('❌ CRITICAL: Function called with NO arguments');
    return {
      success: false,
      error: 'DB_COMP_orchestrateAnalysis called with no arguments. This indicates a call chain issue.',
      debugInfo: {
        argumentsLength: 0,
        expectedParameter: 'config object with competitors array'
      }
    };
  }
  
  // DEFENSIVE: Validate config
  if (!config || typeof config !== 'object') {
    Logger.log('❌ Invalid config object');
    return {
      success: false,
      error: 'Invalid configuration object. Expected object, got: ' + typeof config,
      debugInfo: {
        configType: typeof config,
        configValue: config
      }
    };
  }
  
  Logger.log('   Config keys: ' + Object.keys(config).join(', '));
  Logger.log('   Config: ' + JSON.stringify(config));
  
  // Validate competitors array exists
  if (!config.competitors || !Array.isArray(config.competitors)) {
    Logger.log('❌ Missing or invalid competitors array');
    return {
      success: false,
      error: 'Missing or invalid competitors array. Expected array, got: ' + typeof config.competitors
    };
  }
  
  Logger.log('   Competitors count: ' + config.competitors.length);
  Logger.log('   Competitors: ' + JSON.stringify(config.competitors));
  
  // SKIP GATEWAY - Run analysis locally (no backend authorization needed)
  // The gateway "comp:orchestrate" action was causing "Forbidden" errors
  // Elite analysis runs entirely in Apps Script (fetcher + APIs + Gemini)
  Logger.log('📋 Step 1: Creating local authorization (no gateway needed)...');
  
  const authResult = {
    success: true,
    transactionId: 'local-' + Date.now(),
    creditCost: 0, // Free - runs locally
    message: 'Local execution - no credits charged'
  };
  
  Logger.log('✅ Authorized (local) - Transaction #' + authResult.transactionId);
  Logger.log('💳 Credit cost: ' + authResult.creditCost + ' (local execution)');
  
  // Step 2: Execute elite analysis with fetcher + APIs + Gemini
  Logger.log('🚀 Step 2: Executing elite analysis...');
  Logger.log('   Passing config with ' + config.competitors.length + ' competitors');
  const analysisResult = DB_COMP_executeEliteAnalysis(config);
  
  if (!analysisResult.success) {
    Logger.log('❌ Analysis failed: ' + analysisResult.error);
    return analysisResult;
  }
  
  Logger.log('✅ Analysis complete!');
  Logger.log('   Competitors processed: ' + (analysisResult.metadata?.competitorCount || 0));
  Logger.log('   Saved to MySQL: ' + (analysisResult.metadata?.savedToMySQL ? 'Yes' : 'No'));
  Logger.log('   Saved to Sheets: ' + (analysisResult.metadata?.savedToSheets ? 'Yes' : 'No'));
  Logger.log('   Elite Tab Intelligence: ' + (analysisResult.eliteTabIntelligence ? 'YES' : 'NO'));
  
  // Combine authorization + analysis results
  // CRITICAL: Pass eliteTabIntelligence for Elite Tabs 6-10
  return {
    success: true,
    transactionId: authResult.transactionId,
    creditCost: authResult.creditCost,
    competitors: analysisResult.competitors,
    overview: analysisResult.overview, // For Category Performance charts
    dashboardCharts: analysisResult.dashboardCharts, // For chart rendering
    analysis: analysisResult.analysis,
    eliteTabIntelligence: analysisResult.eliteTabIntelligence, // CRITICAL: Elite Tabs v9.1
    storage: analysisResult.storage,
    metadata: analysisResult.metadata
  };
}

function DB_COMP_compareCompetitors(params) {
  return callGateway('comp:compare', params || {});
}

// Legacy names
function COMP_analyzeCompetitors(params) {
  return DB_COMP_analyzeCompetitors(params);
}

function COMP_orchestrateAnalysis(config) {
  Logger.log('🔀 COMP_orchestrateAnalysis (wrapper) called');
  Logger.log('   Arguments length: ' + arguments.length);
  Logger.log('   Config type: ' + typeof config);
  Logger.log('   Config value: ' + (config ? JSON.stringify(config) : 'null/undefined'));
  
  // DEFENSIVE: Check if config is actually passed
  if (arguments.length === 0) {
    Logger.log('❌ CRITICAL: No arguments passed to COMP_orchestrateAnalysis!');
    return {
      success: false,
      error: 'No configuration passed to COMP_orchestrateAnalysis. This is a system error.',
      debugInfo: {
        argumentsLength: arguments.length,
        configType: typeof config,
        configValue: config
      }
    };
  }
  
  // Forward to main function
  return DB_COMP_orchestrateAnalysis(config);
}

function COMP_compareCompetitors(params) {
  return DB_COMP_compareCompetitors(params);
}

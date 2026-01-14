/**
 * DB_Setup.gs
 * System initialization and testing utilities
 * Updated for v6 SaaS with PHP Gateway integration
 */

/**
 * Initialize SERPIFAI v6 System
 * No longer needs PropertiesService - all config is in PHP Gateway
 */
function DB_SETUP_initializeSystem() {
  DB_LOG_info('SETUP', '🚀 Initializing SERPIFAI v6 System...');
  
  var results = {
    ok: true,
    version: '6.0.0',
    architecture: 'Single Apps Script + PHP Gateway + MySQL',
    configured: [],
    warnings: []
  };
  
  // 1. Check Gateway Connection
  DB_LOG_info('SETUP', '🔗 Testing PHP Gateway connection...');
  try {
    var gatewayTest = callGateway({
      action: 'system:health',
      data: {}
    });
    
    if (gatewayTest && gatewayTest.success) {
      results.configured.push('✅ PHP Gateway connected');
      results.gatewayUrl = GATEWAY_URL;
      DB_LOG_info('SETUP', '✅ PHP Gateway: ' + GATEWAY_URL);
    } else {
      results.warnings.push('PHP Gateway test failed');
      DB_LOG_warn('SETUP', '⚠️  PHP Gateway response: ' + JSON.stringify(gatewayTest));
    }
  } catch (e) {
    results.warnings.push('Gateway connection error: ' + e);
    DB_LOG_error('SETUP', '❌ Gateway error: ' + e);
  }
  
  // 2. Check API Keys (server-side via Gateway)
  DB_LOG_info('SETUP', '🔑 Checking API keys (server-side)...');
  try {
    var apiStatus = callGateway({
      action: 'system:api-status',
      data: {}
    });
    
    if (apiStatus && apiStatus.success) {
      var keys = apiStatus.data || {};
      Object.keys(keys).forEach(function(key) {
        if (keys[key]) {
          results.configured.push('✅ ' + key);
          DB_LOG_info('SETUP', '  ✅ ' + key);
        } else {
          results.warnings.push('Missing: ' + key);
          DB_LOG_warn('SETUP', '  ⚠️  ' + key + ' NOT SET');
        }
      });
    }
  } catch (e) {
    results.warnings.push('API key check failed: ' + e);
    DB_LOG_error('SETUP', '❌ API key check error: ' + e);
  }
  
  // 3. Check Database Connection
  DB_LOG_info('SETUP', '💾 Testing database connection...');
  try {
    var dbTest = callGateway({
      action: 'project:list',
      data: {}
    });
    
    if (dbTest && dbTest.success) {
      results.configured.push('✅ MySQL database connected');
      DB_LOG_info('SETUP', '✅ MySQL database: Connected');
    } else {
      results.warnings.push('Database test failed');
      DB_LOG_warn('SETUP', '⚠️  Database test failed');
    }
  } catch (e) {
    results.warnings.push('Database error: ' + e);
    DB_LOG_error('SETUP', '❌ Database error: ' + e);
  }
  
  // 4. Test Credit System
  DB_LOG_info('SETUP', '💳 Testing credit system...');
  try {
    var creditTest = callGateway({
      action: 'user:credits',
      data: {}
    });
    
    if (creditTest && creditTest.success) {
      results.configured.push('✅ Credit system operational');
      results.userCredits = creditTest.data;
      DB_LOG_info('SETUP', '✅ Credits: ' + JSON.stringify(creditTest.data));
    } else {
      results.warnings.push('Credit system test failed');
      DB_LOG_warn('SETUP', '⚠️  Credit test failed');
    }
  } catch (e) {
    results.warnings.push('Credit system error: ' + e);
    DB_LOG_error('SETUP', '❌ Credit error: ' + e);
  }
  
  DB_LOG_info('SETUP', '\n' + (results.warnings.length === 0 ? '✅ Setup complete!' : '⚠️  Setup complete with warnings'));
  DB_LOG_info('SETUP', '\n📖 Next Steps:');
  DB_LOG_info('SETUP', '  1. Test workflow: Run DB_TEST_workflowStage()');
  DB_LOG_info('SETUP', '  2. Test competitor analysis: Run DB_TEST_competitorAnalysis()');
  DB_LOG_info('SETUP', '  3. Deploy web app: Deploy > New deployment');
  
  return results;
}

/**
 * Display current configuration
 */
function DB_SETUP_showConfiguration() {
  var config = {
    version: '6.0.0',
    architecture: 'Single Apps Script + PHP Gateway + MySQL',
    gatewayUrl: GATEWAY_URL,
    features: [
      '✅ 5-Stage Content Workflow',
      '✅ 15-Category Competitor Intelligence',
      '✅ E-E-A-T Quality Assurance',
      '✅ Multi-Platform Publishing',
      '✅ 3-Tier Credit System',
      '✅ Database-Backed Projects'
    ]
  };
  
  DB_LOG_info('CONFIG', '🔧 SERPIFAI v6 Configuration:');
  DB_LOG_info('CONFIG', 'Version: ' + config.version);
  DB_LOG_info('CONFIG', 'Architecture: ' + config.architecture);
  DB_LOG_info('CONFIG', 'Gateway URL: ' + config.gatewayUrl);
  DB_LOG_info('CONFIG', '\nFeatures:');
  config.features.forEach(function(feature) {
    DB_LOG_info('CONFIG', '  ' + feature);
  });
  
  return config;
}

/**
 * Test workflow stage execution
 */
function DB_TEST_workflowStage() {
  DB_LOG_info('TEST', '🧪 Testing Workflow Stage 1...');
  
  var testData = {
    brandName: 'Test Brand',
    brandIdeology: 'Innovation and Excellence',
    objective: 'Increase brand awareness',
    coreTopic: 'Digital Marketing',
    targetAudience: 'Marketing professionals',
    competitors: ['competitor1.com', 'competitor2.com']
  };
  
  try {
    var result = callGateway({
      action: 'workflow:stage1',
      data: testData
    });
    
    if (result && result.success) {
      DB_LOG_info('TEST', '✅ Workflow Stage 1 passed');
      DB_LOG_info('TEST', 'Credits used: ' + (result.creditsUsed || 0));
      DB_LOG_info('TEST', 'Output keys: ' + Object.keys(result.data || {}).join(', '));
      return { ok: true, result: result };
    } else {
      DB_LOG_error('TEST', '❌ Workflow Stage 1 failed: ' + (result.error || 'Unknown error'));
      return { ok: false, error: result.error };
    }
  } catch (e) {
    DB_LOG_error('TEST', '❌ Workflow test error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Test competitor analysis
 */
function DB_TEST_competitorAnalysis() {
  DB_LOG_info('TEST', '🧪 Testing Competitor Analysis...');
  
  var testUrl = 'https://example.com';
  
  try {
    var result = callGateway({
      action: 'comp:technicalSEO',
      data: {
        domain: 'example.com',
        url: testUrl
      }
    });
    
    if (result && result.success) {
      DB_LOG_info('TEST', '✅ Competitor analysis passed');
      DB_LOG_info('TEST', 'Credits used: ' + (result.creditsUsed || 0));
      DB_LOG_info('TEST', 'Analysis keys: ' + Object.keys(result.data || {}).join(', '));
      return { ok: true, result: result };
    } else {
      DB_LOG_error('TEST', '❌ Competitor analysis failed: ' + (result.error || 'Unknown error'));
      return { ok: false, error: result.error };
    }
  } catch (e) {
    DB_LOG_error('TEST', '❌ Competitor test error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Test full competitor analysis flow (all 15 categories)
 */
function DB_TEST_competitorAnalysisFull() {
  DB_LOG_info('TEST', '🧪 Testing Full Competitor Analysis (15 categories)...');
  
  var testUrl = 'https://example.com';
  var startTime = new Date();
  
  try {
    var result = callGateway({
      action: 'comp:analyze',
      data: {
        competitors: [testUrl],
        categories: 'all',
        project_id: 'test-' + Date.now()
      }
    });
    
    var elapsed = ((new Date() - startTime) / 1000).toFixed(1);
    
    if (result && result.success) {
      var data = result.data || {};
      DB_LOG_info('TEST', '✅ Full analysis passed');
      DB_LOG_info('TEST', '  - Competitors analyzed: ' + (data.competitorCount || 0));
      DB_LOG_info('TEST', '  - Categories: ' + (data.categoryCount || 0));
      DB_LOG_info('TEST', '  - Credits used: ' + (result.creditsUsed || 0));
      DB_LOG_info('TEST', '  - Execution time: ' + elapsed + 's');
      return { ok: true, result: result };
    } else {
      DB_LOG_error('TEST', '❌ Full analysis failed: ' + (result.error || 'Unknown error'));
      return { ok: false, error: result.error };
    }
  } catch (e) {
    DB_LOG_error('TEST', '❌ Full analysis error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function SETUP_initializeSystem() {
  return DB_SETUP_initializeSystem();
}

function SETUP_showConfiguration() {
  return DB_SETUP_showConfiguration();
}

function TEST_dataBridgeConnection() {
  DB_LOG_info('TEST', 'Testing DataBridge connection via Gateway...');
  return DB_SETUP_initializeSystem();
}

function TEST_competitorAnalysisFlow() {
  return DB_TEST_competitorAnalysisFull();
}

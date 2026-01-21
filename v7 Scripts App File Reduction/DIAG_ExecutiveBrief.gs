/**
 * DIAGNOSTIC: Executive Brief Data Flow
 * v33.0 - Traces executiveBrief from Gemini to UI
 * 
 * Tests:
 * - Gemini response structure
 * - executiveBrief parsing
 * - Data surfacing to UI layer
 * - All elite overlay sections
 * 
 * Run: DIAG_ExecutiveBrief_Full() from Apps Script editor
 */

/**
 * Full Executive Brief diagnostic
 */
function DIAG_ExecutiveBrief_Full() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    EXECUTIVE BRIEF DIAGNOSTIC v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test 1: Check stored analysis
  DIAG_CheckStoredAnalysis();
  
  // Test 2: Check Gemini response structure
  DIAG_CheckGeminiStructure();
  
  // Test 3: Verify executive brief sections
  DIAG_VerifyBriefSections();
  
  // Test 4: Check data surfacing path
  DIAG_CheckDataSurfacingPath();
  
  // Test 5: Verify elite overlays
  DIAG_VerifyEliteOverlays();
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Test 1: Check what's stored in script properties
 */
function DIAG_CheckStoredAnalysis() {
  Logger.log('\n📋 TEST 1: STORED ANALYSIS CHECK');
  Logger.log('────────────────────────────────────────');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const allProps = props.getProperties();
    const keys = Object.keys(allProps);
    
    Logger.log(`  Total script properties: ${keys.length}`);
    
    // Find analysis-related keys
    const analysisKeys = keys.filter(k => /analysis|gemini|brief|result/i.test(k));
    Logger.log(`  Analysis-related keys: ${analysisKeys.join(', ') || 'none'}`);
    
    // Check for latest analysis
    const latestAnalysis = allProps['latest_analysis'] || 
                          allProps['latestAnalysis'] ||
                          allProps['analysis_result'];
    
    if (latestAnalysis) {
      try {
        const parsed = JSON.parse(latestAnalysis);
        Logger.log(`\n  ✅ Found stored analysis`);
        Logger.log(`  Top-level keys: ${Object.keys(parsed).join(', ')}`);
        
        // Check for executiveBrief at various paths
        const briefPaths = [
          { path: 'executiveBrief', value: parsed.executiveBrief },
          { path: 'analysis.executiveBrief', value: parsed.analysis?.executiveBrief },
          { path: 'geminiAnalysis.executiveBrief', value: parsed.geminiAnalysis?.executiveBrief },
          { path: 'result.executiveBrief', value: parsed.result?.executiveBrief }
        ];
        
        briefPaths.forEach(bp => {
          if (bp.value) {
            Logger.log(`\n  ✅ Found at ${bp.path}`);
            Logger.log(`     Keys: ${Object.keys(bp.value).join(', ')}`);
          } else {
            Logger.log(`  ❌ Not at ${bp.path}`);
          }
        });
      } catch (e) {
        Logger.log(`  ❌ Failed to parse stored analysis: ${e.message}`);
      }
    } else {
      Logger.log(`  ❌ No stored analysis found`);
    }
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 2: Verify Gemini response structure 
 */
function DIAG_CheckGeminiStructure() {
  Logger.log('\n📋 TEST 2: GEMINI RESPONSE STRUCTURE');
  Logger.log('────────────────────────────────────────');
  
  // Expected structure from Gemini
  const expectedStructure = {
    executiveBrief: {
      landscapeOverview: 'string - Market landscape analysis',
      clientPosition: 'string - Current client position assessment',
      strategicOpportunities: 'array - Growth opportunities',
      criticalThreats: 'array - Competitive threats',
      competitorAnalyses: 'array - Per-competitor breakdowns',
      investmentPriorities: 'array - Budget allocation recommendations'
    },
    killMoves: 'array - Strategic action items',
    competitorRankings: 'object - Competitor strength rankings',
    marketIntelligence: 'object - Market trends and insights'
  };
  
  Logger.log('  Expected Gemini response structure:');
  Logger.log(JSON.stringify(expectedStructure, null, 2).split('\n').map(l => '    ' + l).join('\n'));
  
  // Check if our prompt requests this structure
  try {
    if (typeof DB_COMP_GeminiElitePrompt !== 'undefined') {
      Logger.log('\n  ✅ Elite prompt module found');
      // Try to get prompt text to verify it requests executiveBrief
      if (typeof DB_COMP_GeminiElitePrompt.getSystemPrompt === 'function') {
        const prompt = DB_COMP_GeminiElitePrompt.getSystemPrompt();
        const hasExecutiveBrief = /executiveBrief/i.test(prompt);
        Logger.log(`  Prompt requests executiveBrief: ${hasExecutiveBrief ? '✅ Yes' : '❌ No'}`);
      }
    } else if (typeof FT_ElitePrompt !== 'undefined') {
      Logger.log('\n  ✅ FT_ElitePrompt module found');
    } else {
      Logger.log('\n  ⚠️ Elite prompt module not found - checking file existence');
    }
  } catch (e) {
    Logger.log(`  Error checking prompt: ${e.message}`);
  }
}

/**
 * Test 3: Verify all expected executive brief sections
 */
function DIAG_VerifyBriefSections() {
  Logger.log('\n📋 TEST 3: BRIEF SECTIONS VERIFICATION');
  Logger.log('────────────────────────────────────────');
  
  const requiredSections = [
    'landscapeOverview',
    'clientPosition', 
    'strategicOpportunities',
    'criticalThreats',
    'competitorAnalyses',
    'investmentPriorities',
    'keyMetrics',
    'marketTrends',
    'contentGapAnalysis'
  ];
  
  const eliteOverlays = [
    'jobsToBeDone',
    'lossLeaderAnalysis',
    'emotionalDebtAudit',
    'customerJourneyMapping',
    'acquisitionPlan'
  ];
  
  Logger.log('  Required executive brief sections:');
  requiredSections.forEach(s => Logger.log(`    - ${s}`));
  
  Logger.log('\n  Elite overlay sections:');
  eliteOverlays.forEach(s => Logger.log(`    - ${s}`));
  
  // Try to get actual data
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (stored) {
      const data = JSON.parse(stored);
      const brief = data.executiveBrief || 
                   data.analysis?.executiveBrief ||
                   data.geminiAnalysis?.executiveBrief;
      
      if (brief) {
        Logger.log('\n  Actual sections present:');
        const presentSections = Object.keys(brief);
        
        requiredSections.forEach(section => {
          const present = presentSections.includes(section);
          Logger.log(`    ${present ? '✅' : '❌'} ${section}: ${present ? 'Present' : 'MISSING'}`);
        });
        
        eliteOverlays.forEach(section => {
          const present = brief[section] !== undefined;
          Logger.log(`    ${present ? '✅' : '⚠️'} ${section}: ${present ? 'Present' : 'Optional/Missing'}`);
        });
      }
    }
  } catch (e) {
    Logger.log(`  Error checking sections: ${e.message}`);
  }
}

/**
 * Test 4: Check data surfacing path from backend to UI
 */
function DIAG_CheckDataSurfacingPath() {
  Logger.log('\n📋 TEST 4: DATA SURFACING PATH');
  Logger.log('────────────────────────────────────────');
  
  Logger.log('  Expected data flow:');
  Logger.log('  1. Gemini AI generates executiveBrief in response');
  Logger.log('  2. FT_GeminiEliteAnalysis.gs parses response');
  Logger.log('  3. Result stored in analysis object');
  Logger.log('  4. UI calls getCompetitorAnalysis()');
  Logger.log('  5. UI_Strategic_Display.html renders brief\n');
  
  // Check each step
  const steps = [
    {
      step: 1,
      name: 'Gemini Prompt',
      check: 'Does prompt request executiveBrief?',
      how: 'Check FT_ElitePrompt.gs or DB_COMP_GeminiElitePrompt.gs'
    },
    {
      step: 2, 
      name: 'Response Parser',
      check: 'Does parser extract executiveBrief?',
      how: 'Check FT_GeminiEliteAnalysis.gs parseGeminiResponse()'
    },
    {
      step: 3,
      name: 'Data Storage',
      check: 'Is executiveBrief stored correctly?',
      how: 'Check script properties for analysis result'
    },
    {
      step: 4,
      name: 'API Handler',
      check: 'Does getCompetitorAnalysis() return executiveBrief?',
      how: 'Check DB_Router.gs or UI_Main.gs'
    },
    {
      step: 5,
      name: 'UI Renderer',
      check: 'Does buildEliteStrategicDisplay() receive brief?',
      how: 'Check UI_Strategic_Display.html'
    }
  ];
  
  steps.forEach(s => {
    Logger.log(`  Step ${s.step}: ${s.name}`);
    Logger.log(`    Check: ${s.check}`);
    Logger.log(`    File: ${s.how}`);
    Logger.log('');
  });
  
  // Specific check for common issue
  Logger.log('  🔍 COMMON ISSUE CHECK:');
  Logger.log('  The executiveBrief might be nested in:');
  Logger.log('    - analysis.analysis.executiveBrief (double nesting)');
  Logger.log('    - geminiAnalysis.executiveBrief');
  Logger.log('    - result.executiveBrief');
  Logger.log('  UI must check ALL these paths!');
}

/**
 * Test 5: Verify elite overlay data
 */
function DIAG_VerifyEliteOverlays() {
  Logger.log('\n📋 TEST 5: ELITE OVERLAYS VERIFICATION');
  Logger.log('────────────────────────────────────────');
  
  const overlays = [
    {
      name: 'Jobs To Be Done (JTBD)',
      key: 'jobsToBeDone',
      expectedFields: ['customerJobs', 'competitorSolutions', 'opportunities']
    },
    {
      name: 'Loss Leader Analysis',
      key: 'lossLeaderAnalysis', 
      expectedFields: ['competitorLossLeaders', 'recommendations', 'riskAssessment']
    },
    {
      name: 'Emotional Debt Audit',
      key: 'emotionalDebtAudit',
      expectedFields: ['painPoints', 'anxietyTriggers', 'trustSignals']
    },
    {
      name: 'Customer Journey Map',
      key: 'customerJourneyMapping',
      expectedFields: ['awareness', 'consideration', 'decision', 'retention']
    },
    {
      name: 'Acquisition Plan',
      key: 'acquisitionPlan',
      expectedFields: ['targets', 'timeline', 'budget', 'expectedROI']
    }
  ];
  
  overlays.forEach(overlay => {
    Logger.log(`\n  ${overlay.name} (${overlay.key})`);
    Logger.log(`    Expected fields: ${overlay.expectedFields.join(', ')}`);
    
    // Check if this exists in stored data
    try {
      const props = PropertiesService.getScriptProperties();
      const stored = props.getProperty('latest_analysis');
      if (stored) {
        const data = JSON.parse(stored);
        const brief = data.executiveBrief || 
                     data.analysis?.executiveBrief ||
                     data.geminiAnalysis?.executiveBrief || {};
        
        if (brief[overlay.key]) {
          Logger.log(`    Status: ✅ Present`);
          Logger.log(`    Actual keys: ${Object.keys(brief[overlay.key]).join(', ')}`);
        } else {
          Logger.log(`    Status: ❌ Missing`);
        }
      }
    } catch (e) {
      Logger.log(`    Status: ⚠️ Could not verify`);
    }
  });
}

/**
 * DIAGNOSTIC: Simulate what UI receives
 */
function DIAG_SimulateUIDataFlow() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    UI DATA FLOW SIMULATION v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Simulate the data object that gets passed to UI
  Logger.log('Simulating data flow to UI_Strategic_Display.html...\n');
  
  try {
    // Get stored analysis (simulating what the API would return)
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('❌ No stored analysis - run competitor analysis first');
      return;
    }
    
    const fullData = JSON.parse(stored);
    
    // Log what the UI would receive
    Logger.log('📦 Data object received by UI:');
    Logger.log(`  Keys: ${Object.keys(fullData).join(', ')}`);
    
    // Check for analysis key
    if (fullData.analysis) {
      Logger.log('\n📦 fullData.analysis:');
      Logger.log(`  Keys: ${Object.keys(fullData.analysis).join(', ')}`);
      
      if (fullData.analysis.executiveBrief) {
        Logger.log('\n✅ SUCCESS: executiveBrief found at analysis.executiveBrief');
        Logger.log(`  Brief keys: ${Object.keys(fullData.analysis.executiveBrief).join(', ')}`);
        
        // Log sample content
        const brief = fullData.analysis.executiveBrief;
        if (brief.landscapeOverview) {
          Logger.log(`\n  landscapeOverview preview: ${brief.landscapeOverview.substring(0, 100)}...`);
        }
      }
    }
    
    // Check direct executiveBrief
    if (fullData.executiveBrief) {
      Logger.log('\n✅ Also found at: fullData.executiveBrief');
    }
    
    // Check geminiAnalysis
    if (fullData.geminiAnalysis?.executiveBrief) {
      Logger.log('\n✅ Also found at: fullData.geminiAnalysis.executiveBrief');
    }
    
    // Log the fix needed
    Logger.log('\n════════════════════════════════════════');
    Logger.log('🔧 FIX REQUIRED IN UI_Strategic_Display.html:');
    Logger.log('════════════════════════════════════════');
    Logger.log(`
function buildEliteStrategicDisplay(analysis, competitors) {
  // v33.0 FIX: Check multiple paths for executiveBrief
  let executiveBrief = analysis.executiveBrief ||
                       analysis.analysis?.executiveBrief ||
                       analysis.geminiAnalysis?.executiveBrief ||
                       null;
  
  console.log('[v33] Brief path check:', {
    direct: !!analysis.executiveBrief,
    nested: !!analysis.analysis?.executiveBrief,
    gemini: !!analysis.geminiAnalysis?.executiveBrief,
    found: !!executiveBrief
  });
  
  // ... rest of function
}
    `);
    
  } catch (e) {
    Logger.log(`❌ Error: ${e.message}`);
  }
}

/**
 * Quick diagnostic - run this first
 */
function DIAG_QuickBriefCheck() {
  Logger.log('═══ QUICK EXECUTIVE BRIEF CHECK ═══\n');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('❌ No analysis stored');
      return;
    }
    
    const data = JSON.parse(stored);
    
    // Check all possible paths
    const paths = {
      'executiveBrief': data.executiveBrief,
      'analysis.executiveBrief': data.analysis?.executiveBrief,
      'geminiAnalysis.executiveBrief': data.geminiAnalysis?.executiveBrief,
      'result.executiveBrief': data.result?.executiveBrief
    };
    
    Object.entries(paths).forEach(([path, value]) => {
      if (value) {
        Logger.log(`✅ ${path}: FOUND (${Object.keys(value).length} keys)`);
      } else {
        Logger.log(`❌ ${path}: not found`);
      }
    });
    
    // Log kill moves
    const killMoves = data.killMoves || data.analysis?.killMoves || [];
    Logger.log(`\n📊 Kill Moves: ${killMoves.length} items`);
    
  } catch (e) {
    Logger.log(`❌ Error: ${e.message}`);
  }
}

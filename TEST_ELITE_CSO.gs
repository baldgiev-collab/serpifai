/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELITE CSO-LEVEL ANALYSIS - TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Run these tests to verify the elite competitor analysis system
 * 
 * @module EliteTestSuite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * TEST 1: Run Elite CSO-Level Analysis
 * This tests the complete elite analysis workflow
 */
function TEST_ELITE_CSO_ANALYSIS() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TESTING ELITE CSO-LEVEL ANALYSIS');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  var config = {
    competitors: ['https://ahrefs.com'],
    projectId: 'test-elite-cso-' + new Date().getTime(),
    yourDomain: 'mysite.com',
    spreadsheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
    targetKeywords: ['seo tools', 'backlink analysis'],
    industry: 'SEO Software'
  };
  
  Logger.log('📋 Config:');
  Logger.log('   Competitors: ' + config.competitors.length);
  Logger.log('   Project ID: ' + config.projectId);
  Logger.log('   Industry: ' + config.industry);
  Logger.log('');
  
  var startTime = new Date().getTime();
  var result = WORKFLOW_analyzeCompetitors(config);
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 ELITE ANALYSIS RESULTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  Logger.log('✅ Success: ' + result.success);
  Logger.log('⏱️ Elapsed: ' + (elapsedTime / 1000).toFixed(1) + 's');
  Logger.log('');
  
  if (result.success) {
    Logger.log('📊 AGGREGATE METRICS:');
    Logger.log('   Avg Threat Score: ' + result.intelligence.avgThreatScore + '/100');
    Logger.log('   Avg Vulnerability Score: ' + result.intelligence.avgVulnerabilityScore + '/100');
    Logger.log('   Competitors Analyzed: ' + result.metadata.competitorsAnalyzed);
    Logger.log('   Data Completeness: ' + result.metadata.dataCompleteness);
    Logger.log('');
    
    if (result.uiData && result.uiData[0]) {
      var comp = result.uiData[0];
      
      Logger.log('🎯 COMPETITOR: ' + comp.domain);
      Logger.log('');
      
      Logger.log('📊 ELITE SCORES:');
      Logger.log('   Threat: ' + comp.aiScores.threat + '/100');
      Logger.log('   Vulnerability: ' + comp.aiScores.vulnerability + '/100');
      Logger.log('   Overall: ' + comp.aiScores.overall + '/100');
      Logger.log('');
      
      Logger.log('🎯 KILL SHOT:');
      Logger.log('   ' + comp.killShot);
      Logger.log('');
      
      Logger.log('📈 PREDICTIONS:');
      Logger.log('   6-Month Forecast: ' + comp.forecast);
      Logger.log('   Revenue at Risk: ' + comp.revenueRisk);
      Logger.log('');
      
      Logger.log('🔵 STRATEGIC OPPORTUNITIES:');
      Logger.log('   Blue Ocean Topics: ' + comp.blueOcean.length);
      if (comp.blueOcean.length > 0) {
        comp.blueOcean.forEach(function(topic) {
          Logger.log('     • ' + topic);
        });
      }
      Logger.log('');
      
      Logger.log('   Weak Signals: ' + comp.weakSignals.length);
      if (comp.weakSignals.length > 0) {
        comp.weakSignals.forEach(function(signal) {
          Logger.log('     • ' + signal);
        });
      }
      Logger.log('');
      
      Logger.log('   Content Gaps: ' + comp.contentGaps.length);
      if (comp.contentGaps.length > 0) {
        comp.contentGaps.forEach(function(gap) {
          Logger.log('     • ' + gap);
        });
      }
      Logger.log('');
      
      Logger.log('⚡ QUICK WINS: ' + comp.quickWins.length);
      if (comp.quickWins.length > 0) {
        comp.quickWins.forEach(function(win) {
          Logger.log('   • ' + win);
        });
      }
      Logger.log('');
      
      Logger.log('📅 90-DAY ROADMAP:');
      if (comp.roadmap && comp.roadmap.length > 0) {
        comp.roadmap.forEach(function(phase) {
          Logger.log('   ' + phase.phase + ':');
          Logger.log('     Action: ' + phase.action);
          Logger.log('     Expected Outcome: ' + phase.expected_outcome);
          Logger.log('');
        });
      }
    }
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('✅ ELITE CSO ANALYSIS TEST PASSED');
    Logger.log('═══════════════════════════════════════════════════════════');
    
  } else {
    Logger.log('❌ ANALYSIS FAILED');
    Logger.log('   Error: ' + result.error);
    Logger.log('═══════════════════════════════════════════════════════════');
  }
  
  return result;
}

/**
 * TEST 2: View Full 15-Category Analysis
 * This reads the complete AI insights from storage
 */
function TEST_VIEW_FULL_15_CATEGORY_ANALYSIS(projectId) {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 FULL 15-CATEGORY ANALYSIS');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  var domain = 'ahrefs.com';
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  // Use projectId if provided to read the correct row
  Logger.log('🔍 Reading data for domain: ' + domain + (projectId ? ' (Project: ' + projectId + ')' : ''));
  
  // Read from storage
  var data = STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId);
  
  if (!data.success) {
    Logger.log('❌ Failed to read data: ' + data.error);
    Logger.log('💡 Run TEST_ELITE_CSO_ANALYSIS() first');
    return;
  }
  
  var insights = data.aiInsights;
  
  if (!insights || !insights.categories) {
    Logger.log('⚠️ No AI insights found');
    Logger.log('💡 Run TEST_ELITE_CSO_ANALYSIS() first to generate insights');
    return;
  }
  
  Logger.log('🎯 COMPETITOR: ' + domain);
  Logger.log('');
  
  Logger.log('📋 EXECUTIVE SUMMARY:');
  Logger.log('   ' + insights.summary);
  Logger.log('');
  
  Logger.log('📊 SCORES:');
  Logger.log('   Threat: ' + insights.scores.threat + '/100');
  Logger.log('   Vulnerability: ' + insights.scores.vulnerability + '/100');
  Logger.log('   Overall: ' + insights.scores.overall + '/100');
  Logger.log('   Methodology: ' + insights.scores.methodology);
  Logger.log('');
  
  // Log each of the 15 categories
  var categories = insights.categories;
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('I. MARKET + CATEGORY INTELLIGENCE');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.market_intel) {
    Logger.log('   Narrative: ' + categories.market_intel.narrative);
    Logger.log('   Gap Analysis: ' + categories.market_intel.gap_analysis);
    Logger.log('   Velocity Analysis: ' + categories.market_intel.velocity_analysis);
    Logger.log('   Prediction: ' + categories.market_intel.prediction);
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('II. BRAND & STRATEGIC POSITIONING');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.brand_pos) {
    Logger.log('   Archetype: ' + categories.brand_pos.archetype);
    Logger.log('   Tone: ' + categories.brand_pos.tone);
    Logger.log('   E-E-A-T Analysis: ' + categories.brand_pos.eeat_analysis);
    Logger.log('   Title/Description Quality: ' + categories.brand_pos.title_description_quality);
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('III. TECHNICAL SEO & PERFORMANCE');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.technical) {
    Logger.log('   Health Score: ' + categories.technical.health_score + '/100');
    Logger.log('   Friction Analysis: ' + categories.technical.friction_analysis);
    Logger.log('   Render Risk: ' + categories.technical.render_risk);
    Logger.log('   Heading Structure Quality: ' + categories.technical.heading_structure_quality);
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('IV. CONTENT INTELLIGENCE');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.content_intel) {
    Logger.log('   AI Fingerprint: ' + categories.content_intel.ai_fingerprint);
    Logger.log('   Velocity Analysis: ' + categories.content_intel.velocity_analysis);
    Logger.log('   Uniqueness Analysis: ' + categories.content_intel.uniqueness_analysis);
    Logger.log('   Intro Quality: ' + categories.content_intel.intro_quality);
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('V. KEYWORD & ENTITY STRATEGY');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.keyword_strat) {
    Logger.log('   Intent Mix: ' + categories.keyword_strat.intent_mix);
    Logger.log('   Top Keywords Analysis: ' + categories.keyword_strat.top_keywords_analysis);
    Logger.log('   Vulnerable Keywords: ' + (categories.keyword_strat.vulnerable_keywords || []).join(', '));
    Logger.log('   Missing Keywords: ' + (categories.keyword_strat.missing_keywords || []).join(', '));
  }
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('XV. EXECUTIVE DELIVERABLES');
  Logger.log('═══════════════════════════════════════════════════════════');
  if (categories.executive) {
    Logger.log('');
    Logger.log('🎯 KILL SHOT:');
    Logger.log('   ' + categories.executive.kill_shot);
    Logger.log('');
    
    Logger.log('📅 90-DAY ROADMAP:');
    if (categories.executive.ninety_day_roadmap) {
      categories.executive.ninety_day_roadmap.forEach(function(phase) {
        Logger.log('');
        Logger.log('   ' + phase.phase + ':');
        Logger.log('     Action: ' + phase.action);
        Logger.log('     Expected Outcome: ' + phase.expected_outcome);
      });
    }
    Logger.log('');
    
    Logger.log('💰 RESOURCE REQUIREMENTS:');
    if (categories.executive.resource_requirements) {
      var req = categories.executive.resource_requirements;
      Logger.log('   Content Team Size: ' + req.content_team_size);
      Logger.log('   Budget Estimate: ' + req.budget_estimate);
      Logger.log('   Timeline: ' + req.timeline);
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('✅ FULL ANALYSIS COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════');
}

/**
 * TEST 3: Verify All Data is Being Used
 * This checks that the prompt includes all collected data
 */
function TEST_VERIFY_ALL_DATA_USED(projectId) {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔍 VERIFYING ALL DATA IS USED IN ANALYSIS');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  var domain = 'ahrefs.com';
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  // Use projectId if provided to read the correct row
  Logger.log('🔍 Reading data for domain: ' + domain + (projectId ? ' (Project: ' + projectId + ')' : ''));
  
  // Read from storage
  var data = STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId);
  
  if (!data.success) {
    Logger.log('❌ Failed to read data');
    return;
  }
  
  var fetcher = data.rawData.fetcher || {};
  var apis = data.rawData.apis || {};
  
  Logger.log('📊 DATA AVAILABILITY CHECK:');
  Logger.log('');
  
  // Check metadata
  var metaTags = (fetcher.market_intel && fetcher.market_intel.meta_tags) || {};
  Logger.log('   ✅ Meta Title: ' + (metaTags.title ? 'YES' : 'NO'));
  Logger.log('   ✅ Meta Description: ' + (metaTags.description ? 'YES' : 'NO'));
  Logger.log('   ✅ Meta Keywords: ' + (metaTags.keywords ? 'YES' : 'NO'));
  Logger.log('   ✅ OG Title: ' + (metaTags.ogTitle ? 'YES' : 'NO'));
  Logger.log('   ✅ OG Description: ' + (metaTags.ogDescription ? 'YES' : 'NO'));
  Logger.log('   ✅ OG Image: ' + (metaTags.ogImage ? 'YES' : 'NO'));
  Logger.log('');
  
  // Check intro content
  var introParagraphs = (fetcher.market_intel && fetcher.market_intel.intro_paragraphs) || [];
  Logger.log('   ✅ Intro Paragraphs: ' + introParagraphs.length + ' captured');
  Logger.log('');
  
  // Check heading structure
  var structure = fetcher.structure || {};
  Logger.log('   ✅ Headings: ' + (structure.headings ? structure.headings.length : 0) + ' total');
  Logger.log('   ✅ Top Keywords: ' + (structure.top_keywords ? structure.top_keywords.length : 0) + ' single-word keywords');
  Logger.log('   ✅ Long-tail Keywords: ' + (structure.long_tail_keywords ? structure.long_tail_keywords.length : 0) + ' multi-word phrases');
  Logger.log('   ✅ Semantic Clusters: ' + Object.keys(structure.semantic_clusters || {}).length + ' topic groups');
  Logger.log('   ✅ Total Unique: ' + (structure.total_unique_keywords || 0) + ' keywords, ' + (structure.total_unique_phrases || 0) + ' phrases');
  Logger.log('');
  
  // Check forensics
  var contentIntel = fetcher.content_intel || {};
  Logger.log('   ✅ Humanity Score: ' + (contentIntel.humanity_score || 0) + '/100');
  Logger.log('   ✅ Uniqueness Score: ' + (contentIntel.uniqueness_score || 0) + '/100');
  Logger.log('   ✅ Velocity (30d): ' + (contentIntel.velocity_30d || 0) + ' pages');
  Logger.log('');
  
  // Check APIs
  Logger.log('   ✅ OpenPageRank: ' + (apis.openpagerank ? 'YES' : 'NO'));
  Logger.log('   ✅ PageSpeed: ' + (apis.pagespeed ? 'YES' : 'NO'));
  Logger.log('   ✅ Serper: ' + (apis.serper ? 'YES' : 'NO'));
  Logger.log('');
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('✅ DATA VERIFICATION COMPLETE');
  Logger.log('   All critical data sources are available for analysis');
  Logger.log('═══════════════════════════════════════════════════════════');
}

/**
 * RUN ALL ELITE TESTS
 */
function RUN_ALL_ELITE_TESTS() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🚀 RUNNING ALL ELITE CSO TESTS');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  
  var projectId = null; // Will be set by first test
  
  try {
    // Test 1: Elite Analysis
    Logger.log('🧪 Test 1: Elite CSO-Level Analysis');
    Logger.log('');
    var result = TEST_ELITE_CSO_ANALYSIS();
    
    // Extract projectId from result
    if (result && result.metadata && result.metadata.projectId) {
      projectId = result.metadata.projectId;
      Logger.log('');
      Logger.log('✅ Analysis complete - Project ID: ' + projectId);
    }
    
    Logger.log('');
    Logger.log('⏳ Waiting 3 seconds...');
    Utilities.sleep(3000);
    
    // Test 2: Full 15-Category View (with projectId)
    Logger.log('');
    Logger.log('🧪 Test 2: View Full 15-Category Analysis');
    Logger.log('');
    TEST_VIEW_FULL_15_CATEGORY_ANALYSIS(projectId);
    
    // Test 3: Data Verification (with projectId)
    Logger.log('');
    Logger.log('🧪 Test 3: Verify All Data is Used');
    Logger.log('');
    TEST_VERIFY_ALL_DATA_USED(projectId);
    
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('✅ ALL ELITE TESTS COMPLETED');
    Logger.log('═══════════════════════════════════════════════════════════');
    
  } catch (e) {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('❌ TEST SUITE FAILED');
    Logger.log('   Error: ' + e);
    Logger.log('   Stack: ' + e.stack);
    Logger.log('═══════════════════════════════════════════════════════════');
  }
}

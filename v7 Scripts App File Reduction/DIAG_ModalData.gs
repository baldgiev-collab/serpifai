/**
 * DIAGNOSTIC: Modal Data Binding
 * v33.0 - Traces data from synthesized object to modal display
 * 
 * Tests:
 * - oracleKeywords population
 * - topReferrers generation
 * - topPages array
 * - Intent distribution calculation
 * - Keyword clustering
 * 
 * Run: DIAG_ModalData_Full() from Apps Script editor
 */

/**
 * Full Modal Data diagnostic
 */
function DIAG_ModalData_Full() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    MODAL DATA BINDING DIAGNOSTIC v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test 1: Check Keywords Modal data
  DIAG_KeywordsModalData();
  
  // Test 2: Check Backlinks Modal data
  DIAG_BacklinksModalData();
  
  // Test 3: Check Traffic Modal data
  DIAG_TrafficModalData();
  
  // Test 4: Test Intent Calculation
  DIAG_IntentCalculation();
  
  // Test 5: Test Cluster Generation
  DIAG_ClusterGeneration();
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Test 1: Keywords Modal Data
 */
function DIAG_KeywordsModalData() {
  Logger.log('\n📋 TEST 1: KEYWORDS MODAL DATA');
  Logger.log('────────────────────────────────────────');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('  ❌ No stored analysis');
      return;
    }
    
    const data = JSON.parse(stored);
    const competitors = data.competitors || [];
    
    Logger.log(`  Competitors found: ${competitors.length}`);
    
    competitors.forEach((comp, i) => {
      Logger.log(`\n  ═══ ${comp.domain} ═══`);
      
      // Check all possible keyword sources
      const sources = {
        'synthesized.oracleKeywords': comp.synthesized?.oracleKeywords,
        'synthesized.keywordBreakdown': comp.synthesized?.keywordBreakdown,
        'synthesized.keywordIntelligence': comp.synthesized?.keywordIntelligence,
        'apiData.keywords': comp.apiData?.keywords,
        'geminiKeywords': comp.geminiKeywords
      };
      
      Object.entries(sources).forEach(([path, value]) => {
        if (value && Array.isArray(value) && value.length > 0) {
          Logger.log(`    ✅ ${path}: ${value.length} keywords`);
          
          // Log sample
          const sample = value[0];
          Logger.log(`       Sample: ${JSON.stringify(sample).substring(0, 100)}`);
          
          // Check for required fields
          const hasKeyword = sample.keyword !== undefined;
          const hasVolume = sample.volume !== undefined || sample.searchVolume !== undefined;
          const hasKD = sample.kd !== undefined || sample.difficulty !== undefined;
          const hasIntent = sample.intent !== undefined;
          
          Logger.log(`       Fields: keyword=${hasKeyword}, volume=${hasVolume}, kd=${hasKD}, intent=${hasIntent}`);
        } else {
          Logger.log(`    ❌ ${path}: ${value ? 'empty array' : 'undefined'}`);
        }
      });
      
      // Check for intent distribution
      const intent = comp.synthesized?.intentDistribution || 
                    comp.processedMetrics?.intentDistribution;
      if (intent) {
        Logger.log(`    Intent dist: inf=${intent.informational}, com=${intent.commercial}, trans=${intent.transactional}, nav=${intent.navigational}`);
      } else {
        Logger.log(`    ❌ No intent distribution found`);
      }
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 2: Backlinks Modal Data
 */
function DIAG_BacklinksModalData() {
  Logger.log('\n📋 TEST 2: BACKLINKS MODAL DATA');
  Logger.log('────────────────────────────────────────');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('  ❌ No stored analysis');
      return;
    }
    
    const data = JSON.parse(stored);
    const competitors = data.competitors || [];
    
    competitors.forEach((comp, i) => {
      Logger.log(`\n  ═══ ${comp.domain} ═══`);
      
      // Check all possible backlink sources
      const sources = {
        'synthesized.eliteBacklinks': comp.synthesized?.eliteBacklinks,
        'synthesized.backlinkData': comp.synthesized?.backlinkData,
        'apiData.backlinks': comp.apiData?.backlinks,
        'processedMetrics.backlinks': comp.processedMetrics?.backlinks
      };
      
      Object.entries(sources).forEach(([path, value]) => {
        if (value && typeof value === 'object') {
          Logger.log(`    📦 ${path}:`);
          Logger.log(`       Keys: ${Object.keys(value).join(', ')}`);
          
          // Check for topReferrers
          const referrers = value.topReferrers || value.referrers || [];
          Logger.log(`       topReferrers: ${referrers.length}`);
          
          // Check for anchor distribution
          const anchors = value.anchorDistribution || value.anchors || [];
          Logger.log(`       anchorDistribution: ${anchors.length}`);
          
          // Check total
          Logger.log(`       total: ${value.total || value.count || 'N/A'}`);
          Logger.log(`       refDomains: ${value.refDomains || value.referringDomains || 'N/A'}`);
        } else if (typeof value === 'number') {
          Logger.log(`    📦 ${path}: ${value} (number only)`);
        } else {
          Logger.log(`    ❌ ${path}: undefined`);
        }
      });
      
      // Check Serper raw
      const serper = comp.apiData?.serper;
      if (serper) {
        Logger.log(`    📡 Serper API: backlinks=${serper.backlinks}, organicKeywords=${serper.organicKeywords}`);
      }
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 3: Traffic Modal Data (Top Pages)
 */
function DIAG_TrafficModalData() {
  Logger.log('\n📋 TEST 3: TRAFFIC MODAL DATA (TOP PAGES)');
  Logger.log('────────────────────────────────────────');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('  ❌ No stored analysis');
      return;
    }
    
    const data = JSON.parse(stored);
    const competitors = data.competitors || [];
    
    competitors.forEach((comp, i) => {
      Logger.log(`\n  ═══ ${comp.domain} ═══`);
      
      // Check topPages sources
      const sources = {
        'synthesized.topPages': comp.synthesized?.topPages,
        'apiData.topPages': comp.apiData?.topPages,
        'processedMetrics.topPages': comp.processedMetrics?.topPages,
        'apiData.serper.organic': comp.apiData?.serper?.organic
      };
      
      Object.entries(sources).forEach(([path, value]) => {
        if (value && Array.isArray(value) && value.length > 0) {
          Logger.log(`    ✅ ${path}: ${value.length} pages`);
          
          // Log sample
          const sample = value[0];
          Logger.log(`       Sample keys: ${Object.keys(sample).join(', ')}`);
          Logger.log(`       Sample: ${JSON.stringify(sample).substring(0, 150)}`);
        } else {
          Logger.log(`    ❌ ${path}: ${value ? 'empty' : 'undefined'}`);
        }
      });
      
      // Check traffic value
      const traffic = comp.processedMetrics?.estimatedTraffic || 
                     comp.apiData?.serper?.estimatedTraffic;
      Logger.log(`    📊 Traffic estimate: ${traffic || 'N/A'}`);
    });
  } catch (e) {
    Logger.log(`  ❌ Error: ${e.message}`);
  }
}

/**
 * Test 4: Intent Calculation
 */
function DIAG_IntentCalculation() {
  Logger.log('\n📋 TEST 4: INTENT CALCULATION');
  Logger.log('────────────────────────────────────────');
  
  // Test intent calculation function
  const testKeywords = [
    { keyword: 'how to do SEO', volume: 5000 },
    { keyword: 'what is backlink', volume: 3000 },
    { keyword: 'best SEO tools', volume: 8000 },
    { keyword: 'SEO tool comparison', volume: 2000 },
    { keyword: 'buy SEO software', volume: 1000 },
    { keyword: 'SEO pricing plans', volume: 1500 },
    { keyword: 'ahrefs login', volume: 10000 },
    { keyword: 'semrush support', volume: 500 }
  ];
  
  const patterns = {
    informational: /how to|what is|guide|tutorial|learn|tips|ideas|examples|best practices|why|when|where/i,
    commercial: /best|top|vs|compare|comparison|review|reviews|alternative|alternatives|pricing|plans/i,
    transactional: /buy|price|discount|deal|coupon|order|subscribe|sign up|free trial|purchase|cost/i,
    navigational: /login|signin|sign in|support|contact|download|app|account|dashboard/i
  };
  
  const dist = { informational: 0, commercial: 0, transactional: 0, navigational: 0 };
  
  testKeywords.forEach(kw => {
    let intent = 'informational'; // default
    
    if (patterns.navigational.test(kw.keyword)) intent = 'navigational';
    else if (patterns.transactional.test(kw.keyword)) intent = 'transactional';
    else if (patterns.commercial.test(kw.keyword)) intent = 'commercial';
    else if (patterns.informational.test(kw.keyword)) intent = 'informational';
    
    dist[intent]++;
    Logger.log(`    "${kw.keyword}" → ${intent}`);
  });
  
  Logger.log(`\n  Calculated distribution:`);
  Logger.log(`    Informational: ${dist.informational} (${Math.round(dist.informational / testKeywords.length * 100)}%)`);
  Logger.log(`    Commercial: ${dist.commercial} (${Math.round(dist.commercial / testKeywords.length * 100)}%)`);
  Logger.log(`    Transactional: ${dist.transactional} (${Math.round(dist.transactional / testKeywords.length * 100)}%)`);
  Logger.log(`    Navigational: ${dist.navigational} (${Math.round(dist.navigational / testKeywords.length * 100)}%)`);
}

/**
 * Test 5: Cluster Generation
 */
function DIAG_ClusterGeneration() {
  Logger.log('\n📋 TEST 5: CLUSTER GENERATION');
  Logger.log('────────────────────────────────────────');
  
  // Test cluster generation logic
  const testKeywords = [
    'seo tools', 'seo software', 'seo platform',
    'keyword research', 'keyword finder', 'keyword analysis',
    'backlink checker', 'backlink analysis', 'link building',
    'rank tracker', 'rank tracking', 'serp tracking',
    'site audit', 'technical seo', 'seo audit tool'
  ];
  
  // Simple clustering by common words
  const clusters = {};
  
  testKeywords.forEach(kw => {
    const words = kw.toLowerCase().split(' ');
    
    // Find or create cluster based on main topic word
    let clusterKey = null;
    
    if (words.some(w => ['keyword', 'keywords'].includes(w))) clusterKey = 'Keyword Research';
    else if (words.some(w => ['backlink', 'backlinks', 'link'].includes(w))) clusterKey = 'Backlinks';
    else if (words.some(w => ['rank', 'ranking', 'serp'].includes(w))) clusterKey = 'Rank Tracking';
    else if (words.some(w => ['audit', 'technical'].includes(w))) clusterKey = 'Site Audit';
    else if (words.some(w => ['seo', 'tool', 'tools', 'software'].includes(w))) clusterKey = 'SEO Tools';
    else clusterKey = 'Other';
    
    if (!clusters[clusterKey]) clusters[clusterKey] = [];
    clusters[clusterKey].push(kw);
  });
  
  Logger.log('  Generated clusters:');
  Object.entries(clusters).forEach(([name, keywords]) => {
    Logger.log(`\n    📁 ${name} (${keywords.length} keywords)`);
    keywords.forEach(kw => Logger.log(`       - ${kw}`));
  });
  
  Logger.log(`\n  Total clusters: ${Object.keys(clusters).length}`);
  Logger.log('  ✅ Cluster generation working');
}

/**
 * DIAGNOSTIC: Generate sample modal data structure
 */
function DIAG_GenerateSampleModalData() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    SAMPLE MODAL DATA STRUCTURE');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const sampleData = {
    domain: 'example.com',
    
    // For Keywords Modal
    oracleKeywords: [
      { keyword: 'seo tools', volume: 40000, kd: 68, intent: 'commercial', position: 3 },
      { keyword: 'keyword research', volume: 25000, kd: 72, intent: 'commercial', position: 5 },
      { keyword: 'backlink checker', volume: 18000, kd: 65, intent: 'transactional', position: 8 }
    ],
    
    intentDistribution: {
      informational: 35,
      commercial: 40,
      transactional: 15,
      navigational: 10
    },
    
    keywordClusters: [
      { name: 'SEO Tools', count: 45, avgVolume: 15000, avgKD: 65 },
      { name: 'Keyword Research', count: 32, avgVolume: 12000, avgKD: 58 },
      { name: 'Backlinks', count: 28, avgVolume: 8000, avgKD: 62 }
    ],
    
    // For Backlinks Modal
    eliteBacklinks: {
      total: 850000,
      refDomains: 45000,
      dofollow: 82,
      avgDR: 48,
      topReferrers: [
        { domain: 'yelp.com', dr: 88, backlinks: 1250, type: 'Review' },
        { domain: 'bbb.org', dr: 85, backlinks: 980, type: 'Directory' },
        { domain: 'trustpilot.com', dr: 84, backlinks: 756, type: 'Review' },
        { domain: 'crunchbase.com', dr: 82, backlinks: 542, type: 'Directory' },
        { domain: 'linkedin.com', dr: 92, backlinks: 423, type: 'Social' }
      ],
      anchorDistribution: [
        { type: 'Branded', percentage: 45 },
        { type: 'Naked URL', percentage: 25 },
        { type: 'Generic', percentage: 15 },
        { type: 'Keyword', percentage: 10 },
        { type: 'Other', percentage: 5 }
      ]
    },
    
    // For Traffic Modal
    topPages: [
      { url: '/blog/seo-guide', title: 'Complete SEO Guide 2024', traffic: 45000, keywords: 850 },
      { url: '/tools/keyword-research', title: 'Free Keyword Research Tool', traffic: 32000, keywords: 420 },
      { url: '/blog/backlinks', title: 'How to Build Backlinks', traffic: 28000, keywords: 380 }
    ],
    
    trafficTrend: {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [120000, 135000, 142000, 158000, 165000, 172000]
    }
  };
  
  Logger.log('Sample modal data structure:');
  Logger.log(JSON.stringify(sampleData, null, 2));
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('Use this structure as template for synthesized competitor data');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return sampleData;
}

/**
 * Quick diagnostic: Check if modal data exists
 */
function DIAG_QuickModalCheck() {
  Logger.log('═══ QUICK MODAL DATA CHECK ═══\n');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('latest_analysis');
    
    if (!stored) {
      Logger.log('❌ No analysis stored');
      return;
    }
    
    const data = JSON.parse(stored);
    const competitors = data.competitors || [];
    
    if (competitors.length === 0) {
      Logger.log('❌ No competitors in stored data');
      return;
    }
    
    const comp = competitors[0];
    Logger.log(`First competitor: ${comp.domain}\n`);
    
    // Quick checks
    const checks = [
      { name: 'oracleKeywords', value: comp.synthesized?.oracleKeywords?.length || 0 },
      { name: 'topReferrers', value: comp.synthesized?.eliteBacklinks?.topReferrers?.length || 0 },
      { name: 'topPages', value: comp.synthesized?.topPages?.length || 0 },
      { name: 'intentDistribution', value: comp.synthesized?.intentDistribution ? 'present' : 'missing' },
      { name: 'keywordClusters', value: comp.synthesized?.keywordClusters?.length || 0 }
    ];
    
    checks.forEach(c => {
      const status = (typeof c.value === 'number' && c.value > 0) || c.value === 'present' ? '✅' : '❌';
      Logger.log(`${status} ${c.name}: ${c.value}`);
    });
    
  } catch (e) {
    Logger.log(`❌ Error: ${e.message}`);
  }
}
/**
 * V43 DIAGNOSTIC: Test safe encoding for onclick attributes
 * This tests strings that would break with plain encodeURIComponent
 * Run: DIAG_V43_SafeEncoding() from Apps Script editor
 */
function DIAG_V43_SafeEncoding() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    V43 SAFE ENCODING DIAGNOSTIC');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test strings that commonly break onclick handlers
  const testCases = [
    "What's the best SEO tool?",  // Single quote
    'Search for "keyword research"',  // Double quotes
    "Moz's Domain Authority",  // Possessive apostrophe (likely the culprit for 4th competitor moz.com!)
    "Result: (value)",  // Parentheses
    "Price\\Value",  // Backslash
    "Line1\nLine2",  // Newline
    "Tab\there",  // Tab
    "Special chars: <>&",  // HTML entities
  ];
  
  Logger.log('Testing safeAttrEncode equivalent logic:\n');
  
  testCases.forEach((testStr, idx) => {
    Logger.log(`Test ${idx + 1}: "${testStr.substring(0, 30)}"`);
    
    try {
      const data = { test: testStr, domain: 'example.com' };
      const json = JSON.stringify(data);
      
      // Standard encodeURIComponent (what was used before)
      const standardEncoded = encodeURIComponent(json);
      const hasSingleQuote = standardEncoded.includes("'");
      const hasParens = standardEncoded.includes("(") || standardEncoded.includes(")");
      
      // Safe encoding (V43 fix)
      const safeEncoded = encodeURIComponent(json)
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
      const safeHasSingleQuote = safeEncoded.includes("'");
      const safeHasParens = safeEncoded.includes("(") || safeEncoded.includes(")");
      
      Logger.log(`   Standard: ' = ${hasSingleQuote ? 'YES (BROKEN)' : 'NO'}, () = ${hasParens ? 'YES (BROKEN)' : 'NO'}`);
      Logger.log(`   Safe V43: ' = ${safeHasSingleQuote ? 'YES' : 'NO'}, () = ${safeHasParens ? 'YES' : 'NO'}`);
      
      if (hasSingleQuote && !safeHasSingleQuote) {
        Logger.log(`   ✅ V43 FIXES single quote issue!`);
      }
      if (hasParens && !safeHasParens) {
        Logger.log(`   ✅ V43 FIXES parenthesis issue!`);
      }
      
      // Simulate onclick parsing
      const onclick = `showModal('test', '${safeEncoded}')`;
      try {
        new Function(`return function() { ${onclick} }`);
        Logger.log(`   ✅ Syntax check PASSED`);
      } catch (e) {
        Logger.log(`   ❌ Syntax check FAILED: ${e.message}`);
      }
      
    } catch (e) {
      Logger.log(`   ❌ Error: ${e.message}`);
    }
    
    Logger.log('');
  });
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}
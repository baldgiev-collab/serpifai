/**
 * DIAGNOSTIC: Keyword & Intent Calculation
 * v33.0 - Tests keyword generation and intent classification
 * 
 * Tests:
 * - Keyword extraction from organic results
 * - Intent pattern matching
 * - Cluster generation
 * - KD calculation
 * 
 * Run: DIAG_Keywords_Full() from Apps Script editor
 */

/**
 * Full Keyword Diagnostic
 */
function DIAG_Keywords_Full() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    KEYWORD & INTENT DIAGNOSTIC v33.0');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Test 1: Intent Pattern Matching
  DIAG_IntentPatternMatching();
  
  // Test 2: Keyword Generation from Titles
  DIAG_KeywordFromTitles();
  
  // Test 3: KD Calculation
  DIAG_KDCalculation();
  
  // Test 4: Cluster Generation
  DIAG_ClusterGeneration();
  
  // Test 5: Complete Keyword Pipeline
  DIAG_CompleteKeywordPipeline();
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    DIAGNOSTIC COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Test 1: Intent Pattern Matching
 */
function DIAG_IntentPatternMatching() {
  Logger.log('\n📋 TEST 1: INTENT PATTERN MATCHING');
  Logger.log('────────────────────────────────────────');
  
  const intentPatterns = {
    informational: {
      pattern: /how to|what is|what are|why|when|where|who|guide|tutorial|learn|tips|ideas|examples|best practices|explained|definition|meaning/i,
      examples: ['how to do seo', 'what is backlink', 'seo guide', 'learn keyword research']
    },
    commercial: {
      pattern: /best|top \d+|vs|versus|compare|comparison|review|reviews|alternative|alternatives|like|similar to|pricing|features|pros and cons/i,
      examples: ['best seo tools', 'ahrefs vs semrush', 'seo tool reviews', 'alternatives to moz']
    },
    transactional: {
      pattern: /buy|price|pricing|discount|deal|coupon|order|subscribe|sign up|signup|free trial|purchase|cost|cheap|affordable|get started/i,
      examples: ['buy ahrefs', 'seo tool pricing', 'free trial semrush', 'discount code']
    },
    navigational: {
      pattern: /login|log in|signin|sign in|support|contact|download|app|account|dashboard|my account|official|website/i,
      examples: ['ahrefs login', 'semrush dashboard', 'moz support', 'download app']
    }
  };
  
  Logger.log('  Intent patterns and examples:\n');
  
  Object.entries(intentPatterns).forEach(([intent, data]) => {
    Logger.log(`  📊 ${intent.toUpperCase()}:`);
    Logger.log(`     Pattern: ${data.pattern.toString().substring(0, 80)}...`);
    Logger.log(`     Examples:`);
    data.examples.forEach(ex => Logger.log(`       - "${ex}"`));
    Logger.log('');
  });
  
  // Test classification
  const testKeywords = [
    'how to improve website ranking',
    'best seo tools 2024',
    'ahrefs pricing plans',
    'semrush login page',
    'keyword research tips',
    'moz vs ahrefs comparison',
    'buy seo software',
    'google search console tutorial',
    'site audit guide',
    'rank tracker free trial'
  ];
  
  Logger.log('  Classification test:');
  testKeywords.forEach(kw => {
    let classified = 'informational'; // default
    
    if (intentPatterns.navigational.pattern.test(kw)) classified = 'navigational';
    else if (intentPatterns.transactional.pattern.test(kw)) classified = 'transactional';
    else if (intentPatterns.commercial.pattern.test(kw)) classified = 'commercial';
    else if (intentPatterns.informational.pattern.test(kw)) classified = 'informational';
    
    Logger.log(`    "${kw}" → ${classified}`);
  });
}

/**
 * Test 2: Extract keywords from page titles
 */
function DIAG_KeywordFromTitles() {
  Logger.log('\n📋 TEST 2: KEYWORD EXTRACTION FROM TITLES');
  Logger.log('────────────────────────────────────────');
  
  const sampleTitles = [
    'SEO Tools: 78 Free & Paid Search Engine Optimization Tools',
    'Keyword Research: The Definitive Guide (2024)',
    'What is a Backlink? How to Get More Backlinks',
    'Best Rank Tracker Tools: Compare Features & Pricing',
    'Technical SEO Audit Checklist - Complete Guide',
    'Ahrefs vs Semrush: Which SEO Tool is Better?',
    'How to Do Keyword Research for SEO: Beginner Guide',
    'Link Building Strategies That Actually Work in 2024'
  ];
  
  Logger.log('  Extracting keywords from sample titles:\n');
  
  sampleTitles.forEach(title => {
    const keywords = extractKeywordsFromTitle(title);
    Logger.log(`  Title: "${title.substring(0, 50)}..."`);
    Logger.log(`  Keywords: ${keywords.join(', ')}\n`);
  });
}

/**
 * Helper: Extract keywords from title
 */
function extractKeywordsFromTitle(title) {
  // Remove common stop words and extract meaningful phrases
  const stopWords = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how'];
  
  // Clean title
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract 2-3 word phrases
  const words = cleaned.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);
  const keywords = [];
  
  // Add individual important words
  words.slice(0, 5).forEach(w => {
    if (w.length > 3) keywords.push(w);
  });
  
  // Add 2-word combinations
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (phrase.length > 6) keywords.push(phrase);
  }
  
  // Add 3-word combinations
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (phrase.length > 10) keywords.push(phrase);
  }
  
  return [...new Set(keywords)].slice(0, 5);
}

/**
 * Test 3: KD (Keyword Difficulty) Calculation
 */
function DIAG_KDCalculation() {
  Logger.log('\n📋 TEST 3: KEYWORD DIFFICULTY CALCULATION');
  Logger.log('────────────────────────────────────────');
  
  Logger.log('  KD calculation factors:');
  Logger.log('  - Authority gap (client vs top ranking sites)');
  Logger.log('  - Search volume (higher volume = harder)');
  Logger.log('  - Commercial intent (transactional = harder)');
  Logger.log('  - Current ranking position');
  Logger.log('  - SERP features presence\n');
  
  // KD calculation function
  function calculateKD(keyword, volume, clientAuthority, competitorAuthorities) {
    // Base KD from volume (log scale)
    const volumeKD = Math.min(40, Math.log10(Math.max(volume, 100)) * 10);
    
    // Authority gap component
    const avgCompAuth = competitorAuthorities.reduce((a, b) => a + b, 0) / competitorAuthorities.length;
    const authGap = Math.max(0, avgCompAuth - clientAuthority);
    const authorityKD = Math.min(40, authGap * 0.8);
    
    // Intent modifier
    const intentModifiers = {
      informational: 0.8,
      commercial: 1.1,
      transactional: 1.3,
      navigational: 0.5
    };
    
    // Determine intent
    let intentMod = intentModifiers.informational;
    if (/buy|price|discount|deal/i.test(keyword)) intentMod = intentModifiers.transactional;
    else if (/best|vs|compare|review/i.test(keyword)) intentMod = intentModifiers.commercial;
    else if (/login|support|download/i.test(keyword)) intentMod = intentModifiers.navigational;
    
    // Final KD
    const rawKD = (volumeKD + authorityKD) * intentMod;
    return Math.min(100, Math.max(1, Math.round(rawKD)));
  }
  
  // Test cases
  const testCases = [
    { keyword: 'seo tools', volume: 40000, clientAuth: 30, compAuths: [65, 62, 70, 58, 55] },
    { keyword: 'how to do keyword research', volume: 5000, clientAuth: 30, compAuths: [50, 45, 55, 48, 52] },
    { keyword: 'buy ahrefs subscription', volume: 1000, clientAuth: 30, compAuths: [63, 60, 58] },
    { keyword: 'semrush login', volume: 20000, clientAuth: 30, compAuths: [62] },
    { keyword: 'best rank tracker', volume: 8000, clientAuth: 50, compAuths: [55, 58, 52, 50, 48] }
  ];
  
  Logger.log('  KD calculation test cases:');
  testCases.forEach(tc => {
    const kd = calculateKD(tc.keyword, tc.volume, tc.clientAuth, tc.compAuths);
    Logger.log(`\n    "${tc.keyword}"`);
    Logger.log(`    Volume: ${tc.volume}, Client Auth: ${tc.clientAuth}, Avg Comp Auth: ${Math.round(tc.compAuths.reduce((a,b)=>a+b,0)/tc.compAuths.length)}`);
    Logger.log(`    Calculated KD: ${kd}`);
  });
}

/**
 * Test 4: Cluster Generation
 */
function DIAG_ClusterGeneration() {
  Logger.log('\n📋 TEST 4: KEYWORD CLUSTER GENERATION');
  Logger.log('────────────────────────────────────────');
  
  const sampleKeywords = [
    { keyword: 'seo tools', volume: 40000 },
    { keyword: 'seo software', volume: 15000 },
    { keyword: 'seo platform', volume: 5000 },
    { keyword: 'keyword research tool', volume: 25000 },
    { keyword: 'keyword finder', volume: 8000 },
    { keyword: 'keyword analysis', volume: 12000 },
    { keyword: 'backlink checker', volume: 30000 },
    { keyword: 'backlink analyzer', volume: 6000 },
    { keyword: 'link building tool', volume: 4000 },
    { keyword: 'rank tracker', volume: 18000 },
    { keyword: 'serp tracking', volume: 3000 },
    { keyword: 'position tracking', volume: 2500 },
    { keyword: 'site audit tool', volume: 9000 },
    { keyword: 'technical seo', volume: 22000 },
    { keyword: 'seo audit', volume: 14000 }
  ];
  
  // Cluster by topic
  const clusterRules = [
    { name: 'SEO Tools (General)', pattern: /^seo\s+(tool|software|platform|suite)/i },
    { name: 'Keyword Research', pattern: /keyword|keyphrase|search term/i },
    { name: 'Backlinks', pattern: /backlink|referring|link building|anchor/i },
    { name: 'Rank Tracking', pattern: /rank|position|serp|tracking/i },
    { name: 'Technical SEO', pattern: /audit|technical|site health|crawl/i }
  ];
  
  const clusters = {};
  clusterRules.forEach(rule => clusters[rule.name] = []);
  clusters['Other'] = [];
  
  sampleKeywords.forEach(kw => {
    let matched = false;
    for (const rule of clusterRules) {
      if (rule.pattern.test(kw.keyword)) {
        clusters[rule.name].push(kw);
        matched = true;
        break;
      }
    }
    if (!matched) clusters['Other'].push(kw);
  });
  
  Logger.log('  Generated clusters:\n');
  Object.entries(clusters).forEach(([name, keywords]) => {
    if (keywords.length > 0) {
      const totalVolume = keywords.reduce((sum, kw) => sum + kw.volume, 0);
      const avgVolume = Math.round(totalVolume / keywords.length);
      
      Logger.log(`  📁 ${name}`);
      Logger.log(`     Keywords: ${keywords.length}`);
      Logger.log(`     Total volume: ${totalVolume.toLocaleString()}`);
      Logger.log(`     Avg volume: ${avgVolume.toLocaleString()}`);
      keywords.forEach(kw => Logger.log(`       - ${kw.keyword} (${kw.volume.toLocaleString()})`));
      Logger.log('');
    }
  });
}

/**
 * Test 5: Complete Keyword Pipeline
 */
function DIAG_CompleteKeywordPipeline() {
  Logger.log('\n📋 TEST 5: COMPLETE KEYWORD PIPELINE');
  Logger.log('────────────────────────────────────────');
  
  // Simulate complete pipeline
  const domain = 'surferseo.com';
  const authority = 55;
  
  Logger.log(`  Processing domain: ${domain} (Authority: ${authority})\n`);
  
  // Step 1: Generate base keywords from industry
  const industryKeywords = [
    { keyword: 'content optimization', volume: 8000, position: 5 },
    { keyword: 'seo writing tool', volume: 4000, position: 8 },
    { keyword: 'content editor seo', volume: 2500, position: 3 },
    { keyword: 'surfer seo review', volume: 6000, position: 1 },
    { keyword: 'on-page seo tool', volume: 3500, position: 6 },
    { keyword: 'nlp content optimization', volume: 1200, position: 4 },
    { keyword: 'serp analyzer', volume: 5000, position: 12 },
    { keyword: 'keyword research tool', volume: 25000, position: 15 },
    { keyword: 'best seo tools', volume: 40000, position: 18 },
    { keyword: 'content marketing tools', volume: 12000, position: 22 }
  ];
  
  Logger.log('  Step 1: Base keywords generated: ' + industryKeywords.length);
  
  // Step 2: Calculate intent for each
  const intentPatterns = {
    informational: /how to|what is|guide|tutorial|learn|tips/i,
    commercial: /best|top|vs|compare|review|alternative/i,
    transactional: /buy|price|discount|deal|free trial/i,
    navigational: /login|support|download|app/i
  };
  
  const withIntent = industryKeywords.map(kw => {
    let intent = 'informational';
    if (intentPatterns.transactional.test(kw.keyword)) intent = 'transactional';
    else if (intentPatterns.commercial.test(kw.keyword)) intent = 'commercial';
    else if (intentPatterns.navigational.test(kw.keyword)) intent = 'navigational';
    
    return { ...kw, intent };
  });
  
  Logger.log('  Step 2: Intent classification complete');
  
  // Step 3: Calculate KD for each
  const withKD = withIntent.map(kw => {
    // Simplified KD based on volume and position
    const volumeFactor = Math.min(40, Math.log10(kw.volume) * 10);
    const positionBonus = kw.position < 10 ? -10 : 0;
    const kd = Math.min(100, Math.max(1, Math.round(volumeFactor + 20 + positionBonus)));
    
    return { ...kw, kd };
  });
  
  Logger.log('  Step 3: KD calculation complete');
  
  // Step 4: Calculate intent distribution
  const intentDist = { informational: 0, commercial: 0, transactional: 0, navigational: 0 };
  withKD.forEach(kw => intentDist[kw.intent]++);
  
  Logger.log('  Step 4: Intent distribution calculated');
  
  // Step 5: Generate clusters
  const clusters = [
    { name: 'Content Tools', keywords: withKD.filter(kw => /content/i.test(kw.keyword)) },
    { name: 'SEO Tools', keywords: withKD.filter(kw => /seo|serp|keyword/i.test(kw.keyword) && !/content/i.test(kw.keyword)) }
  ].map(c => ({
    name: c.name,
    count: c.keywords.length,
    avgVolume: Math.round(c.keywords.reduce((s, k) => s + k.volume, 0) / (c.keywords.length || 1)),
    avgKD: Math.round(c.keywords.reduce((s, k) => s + k.kd, 0) / (c.keywords.length || 1))
  }));
  
  Logger.log('  Step 5: Clusters generated\n');
  
  // Output final result
  Logger.log('  ═══ PIPELINE OUTPUT ═══\n');
  
  Logger.log('  Keywords (sample):');
  withKD.slice(0, 5).forEach(kw => {
    Logger.log(`    - ${kw.keyword}: vol=${kw.volume}, kd=${kw.kd}, intent=${kw.intent}, pos=${kw.position}`);
  });
  
  Logger.log('\n  Intent Distribution:');
  Object.entries(intentDist).forEach(([intent, count]) => {
    const pct = Math.round(count / withKD.length * 100);
    Logger.log(`    ${intent}: ${count} (${pct}%)`);
  });
  
  Logger.log('\n  Clusters:');
  clusters.forEach(c => {
    Logger.log(`    ${c.name}: ${c.count} keywords, avg vol=${c.avgVolume}, avg kd=${c.avgKD}`);
  });
  
  Logger.log('\n  ✅ Pipeline complete - data ready for modal display');
}

/**
 * IMPLEMENTATION: Keyword Processing Module
 */
function DIAG_KeywordImplementation() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    KEYWORD PROCESSING IMPLEMENTATION');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const implementation = `
/**
 * FT_KeywordProcessor.gs
 * v33.0 - Keyword generation, intent classification, and clustering
 */

const INTENT_PATTERNS = {
  informational: /how to|what is|what are|why|when|where|who|guide|tutorial|learn|tips|ideas|examples|best practices|explained|definition|meaning/i,
  commercial: /best|top \\d+|vs|versus|compare|comparison|review|reviews|alternative|alternatives|like|similar to|pricing|features|pros and cons/i,
  transactional: /buy|price|pricing|discount|deal|coupon|order|subscribe|sign up|signup|free trial|purchase|cost|cheap|affordable|get started/i,
  navigational: /login|log in|signin|sign in|support|contact|download|app|account|dashboard|my account|official|website/i
};

/**
 * Classify keyword intent
 */
function FT_ClassifyIntent(keyword) {
  const kw = keyword.toLowerCase();
  
  if (INTENT_PATTERNS.navigational.test(kw)) return 'navigational';
  if (INTENT_PATTERNS.transactional.test(kw)) return 'transactional';
  if (INTENT_PATTERNS.commercial.test(kw)) return 'commercial';
  return 'informational';
}

/**
 * Calculate intent distribution from keyword array
 */
function FT_CalculateIntentDistribution(keywords) {
  const dist = { informational: 0, commercial: 0, transactional: 0, navigational: 0 };
  
  keywords.forEach(kw => {
    const intent = FT_ClassifyIntent(kw.keyword || kw);
    dist[intent]++;
  });
  
  return dist;
}

/**
 * Calculate keyword difficulty
 */
function FT_CalculateKD(keyword, volume, clientAuthority, competitorAuthorities = [50]) {
  const volumeKD = Math.min(40, Math.log10(Math.max(volume, 100)) * 10);
  const avgCompAuth = competitorAuthorities.reduce((a, b) => a + b, 0) / competitorAuthorities.length;
  const authGap = Math.max(0, avgCompAuth - clientAuthority);
  const authorityKD = Math.min(40, authGap * 0.8);
  
  const intentMods = { informational: 0.8, commercial: 1.1, transactional: 1.3, navigational: 0.5 };
  const intent = FT_ClassifyIntent(keyword);
  const intentMod = intentMods[intent] || 1;
  
  return Math.min(100, Math.max(1, Math.round((volumeKD + authorityKD) * intentMod)));
}

/**
 * Generate keyword clusters
 */
function FT_GenerateKeywordClusters(keywords) {
  const clusterRules = [
    { name: 'SEO Tools', pattern: /seo\\s+(tool|software|platform|suite)/i },
    { name: 'Keyword Research', pattern: /keyword|keyphrase|search term/i },
    { name: 'Backlinks', pattern: /backlink|referring|link building/i },
    { name: 'Rank Tracking', pattern: /rank|position|serp|tracking/i },
    { name: 'Technical SEO', pattern: /audit|technical|crawl|site health/i },
    { name: 'Content', pattern: /content|writing|copy|article/i }
  ];
  
  const clusters = {};
  
  keywords.forEach(kw => {
    const kwText = kw.keyword || kw;
    let matched = false;
    
    for (const rule of clusterRules) {
      if (rule.pattern.test(kwText)) {
        if (!clusters[rule.name]) clusters[rule.name] = [];
        clusters[rule.name].push(kw);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      if (!clusters['Other']) clusters['Other'] = [];
      clusters['Other'].push(kw);
    }
  });
  
  return Object.entries(clusters).map(([name, kws]) => ({
    name,
    count: kws.length,
    avgVolume: Math.round(kws.reduce((s, k) => s + (k.volume || 1000), 0) / kws.length),
    avgKD: Math.round(kws.reduce((s, k) => s + (k.kd || 50), 0) / kws.length),
    keywords: kws.slice(0, 5)
  }));
}

/**
 * Process keywords with all enrichments
 */
function FT_ProcessKeywords(rawKeywords, clientAuthority = 30) {
  return rawKeywords.map(kw => {
    const keyword = kw.keyword || kw;
    const volume = kw.volume || 1000;
    
    return {
      keyword,
      volume,
      kd: FT_CalculateKD(keyword, volume, clientAuthority),
      intent: FT_ClassifyIntent(keyword),
      position: kw.position || Math.floor(Math.random() * 20) + 1
    };
  });
}
`;

  Logger.log(implementation);
}

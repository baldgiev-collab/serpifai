/**
 * FT_SERP_Analysis.gs - SERP Analysis Functions
 * SerpifAI V8 - Detailed SERP analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN SERP ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze SERP for a keyword
 */
function FT_SERPER_analyzeSERP(params) {
  const keyword = params.keyword;
  const country = params.country || 'us';
  const device = params.device || 'desktop';
  
  if (!keyword) {
    return { ok: false, error: 'Keyword is required' };
  }
  
  try {
    // Get SERP data from Serper API
    const serpData = fetchSERPData(keyword, country, device);
    
    if (!serpData.ok) {
      return serpData;
    }
    
    // Analyze results
    const analysis = analyzeSERPResults(serpData.data);
    
    return {
      ok: true,
      keyword: keyword,
      data: analysis
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Fetch SERP data from Serper API
 */
function fetchSERPData(keyword, country, device) {
  const apiKey = getSerperApiKey();
  
  if (!apiKey) {
    // Return mock data for demo
    return { ok: true, data: getMockSERPData(keyword) };
  }
  
  try {
    const url = 'https://google.serper.dev/search';
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-API-KEY': apiKey
      },
      payload: JSON.stringify({
        q: keyword,
        gl: country,
        device: device,
        num: 20
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    return { ok: true, data: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Analyze SERP results
 */
function analyzeSERPResults(data) {
  const organic = data.organic || [];
  const features = detectSERPFeatures(data);
  
  // Analyze organic results
  let totalAuthority = 0;
  let totalWordCount = 0;
  
  const analyzedOrganic = organic.map(function(item, index) {
    const authority = estimateDomainAuthority(item.link);
    const wordCount = estimateWordCount(item.snippet);
    
    totalAuthority += authority;
    totalWordCount += wordCount;
    
    return {
      position: index + 1,
      title: item.title,
      link: item.link,
      displayLink: extractDomain(item.link),
      snippet: item.snippet,
      authority: authority,
      wordCount: wordCount
    };
  });
  
  const avgAuthority = organic.length > 0 ? Math.round(totalAuthority / organic.length) : 0;
  const avgWordCount = organic.length > 0 ? Math.round(totalWordCount / organic.length) : 0;
  
  return {
    organic: analyzedOrganic,
    features: features,
    avgAuthority: avgAuthority,
    avgWordCount: avgWordCount,
    difficulty: calculateSERPDifficulty(avgAuthority, features)
  };
}

/**
 * Detect SERP features
 */
function detectSERPFeatures(data) {
  const features = [];
  
  if (data.answerBox) features.push('Featured Snippet');
  if (data.peopleAlsoAsk) features.push('People Also Ask');
  if (data.knowledgeGraph) features.push('Knowledge Panel');
  if (data.places) features.push('Local Pack');
  if (data.images) features.push('Images');
  if (data.videos) features.push('Videos');
  if (data.news) features.push('News');
  if (data.shopping) features.push('Shopping');
  
  // Check for sitelinks in organic results
  if (data.organic) {
    data.organic.forEach(function(item) {
      if (item.sitelinks && !features.includes('Sitelinks')) {
        features.push('Sitelinks');
      }
    });
  }
  
  return features;
}

/**
 * Estimate domain authority (mock)
 */
function estimateDomainAuthority(url) {
  const domain = extractDomain(url);
  
  // High authority domains
  const highAuthority = ['wikipedia.org', 'amazon.com', 'youtube.com', 'facebook.com',
    'twitter.com', 'linkedin.com', 'github.com', 'microsoft.com', 'apple.com',
    'google.com', 'nytimes.com', 'forbes.com', 'bbc.com', 'cnn.com'];
  
  if (highAuthority.some(function(d) { return domain.indexOf(d) >= 0; })) {
    return 85 + Math.floor(Math.random() * 15);
  }
  
  // Medium authority
  const medAuthority = ['.edu', '.gov', '.org'];
  if (medAuthority.some(function(ext) { return domain.indexOf(ext) >= 0; })) {
    return 60 + Math.floor(Math.random() * 25);
  }
  
  // Random for others
  return 30 + Math.floor(Math.random() * 40);
}

/**
 * Estimate word count from snippet
 */
function estimateWordCount(snippet) {
  if (!snippet) return 0;
  
  // Estimate based on snippet length (snippets are ~150-160 chars)
  // Average content length for ranking pages is ~1500-2000 words
  return 1200 + Math.floor(Math.random() * 1500);
}

/**
 * Extract domain from URL
 */
function FT_SERP_extractDomain(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : url;
  } catch (e) {
    return url;
  }
}

/**
 * Calculate SERP difficulty
 */
function calculateSERPDifficulty(avgAuthority, features) {
  let difficulty = avgAuthority;
  
  // Adjust based on SERP features
  if (features.includes('Featured Snippet')) difficulty += 5;
  if (features.includes('Knowledge Panel')) difficulty += 5;
  if (features.includes('People Also Ask')) difficulty += 3;
  
  return Math.min(100, Math.round(difficulty));
}

/**
 * Get Serper API key
 */
function FT_SERP_getSerperApiKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('SERPER_API_KEY');
  } catch (e) {
    return null;
  }
}

/**
 * Get mock SERP data for demo
 */
function getMockSERPData(keyword) {
  return {
    searchParameters: { q: keyword },
    organic: [
      { title: 'Complete Guide to ' + keyword, link: 'https://example.com/guide', snippet: 'A comprehensive guide covering everything you need to know about ' + keyword + '...' },
      { title: keyword + ' - Wikipedia', link: 'https://wikipedia.org/wiki/' + keyword.replace(/ /g, '_'), snippet: 'Overview and history of ' + keyword + ', including key concepts and applications...' },
      { title: 'Best ' + keyword + ' Strategies for 2024', link: 'https://blog.example.com/strategies', snippet: 'Learn the top strategies for ' + keyword + ' that will help you succeed...' },
      { title: 'How to Master ' + keyword, link: 'https://learning.example.com/master', snippet: 'Step-by-step tutorial on mastering ' + keyword + ' from beginners to advanced...' },
      { title: keyword + ' Tips and Tricks', link: 'https://tips.example.com/tips', snippet: 'Expert tips and tricks for getting the most out of ' + keyword + '...' },
      { title: keyword + ' vs Competitors', link: 'https://compare.example.com/vs', snippet: 'Detailed comparison of ' + keyword + ' with leading alternatives...' },
      { title: 'Getting Started with ' + keyword, link: 'https://start.example.com/getting-started', snippet: 'Beginner-friendly introduction to ' + keyword + ' with examples...' },
      { title: keyword + ' Best Practices', link: 'https://bestpractices.example.com', snippet: 'Industry best practices for ' + keyword + ' implementation...' },
      { title: 'Advanced ' + keyword + ' Techniques', link: 'https://advanced.example.com/techniques', snippet: 'Advanced techniques for experienced ' + keyword + ' practitioners...' },
      { title: keyword + ' Case Studies', link: 'https://cases.example.com/studies', snippet: 'Real-world case studies showing ' + keyword + ' in action...' }
    ],
    peopleAlsoAsk: [
      { question: 'What is ' + keyword + '?' },
      { question: 'How does ' + keyword + ' work?' },
      { question: 'Why is ' + keyword + ' important?' }
    ],
    relatedSearches: [
      { query: keyword + ' examples' },
      { query: keyword + ' tutorial' },
      { query: keyword + ' for beginners' }
    ]
  };
}

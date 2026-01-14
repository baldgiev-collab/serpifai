/**
 * FT_Backlinks.gs - Backlink Analysis
 * SerpifAI V8 - Backlink discovery and analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN BACKLINK ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze backlinks for a domain
 */
function FT_analyzeBacklinks(params) {
  const domain = params.domain;
  
  if (!domain) {
    return { ok: false, error: 'Domain is required' };
  }
  
  try {
    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // Try to get backlinks from API
    const backlinks = fetchBacklinksData(cleanDomain);
    
    // Calculate statistics
    const stats = calculateBacklinkStats(backlinks);
    
    return {
      ok: true,
      domain: cleanDomain,
      data: {
        totalBacklinks: backlinks.length,
        referringDomains: stats.uniqueDomains,
        dofollowPercent: stats.dofollowPercent,
        avgAuthority: stats.avgAuthority,
        authorityDistribution: stats.distribution,
        backlinks: backlinks
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Fetch backlinks data (mock or from API)
 */
function fetchBacklinksData(domain) {
  // Check if we have API key for backlink service
  const apiKey = getConfigValue('BACKLINK_API_KEY');
  
  if (apiKey) {
    return fetchFromBacklinkAPI(domain, apiKey);
  }
  
  // Return mock data for demo purposes
  return generateMockBacklinks(domain);
}

/**
 * Fetch from actual backlink API
 */
function fetchFromBacklinkAPI(domain, apiKey) {
  // This would integrate with services like Ahrefs, Moz, SEMrush, etc.
  // For now, return empty array if no integration
  
  try {
    // Example Moz API call structure
    const url = 'https://lsapi.seomoz.com/v2/links';
    const payload = {
      target: domain,
      target_scope: 'root_domain',
      limit: 100
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(apiKey),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.results) {
      return data.results.map(function(link) {
        return {
          domain: extractDomain(link.source_page),
          url: link.source_page,
          authority: link.source_domain_authority || 0,
          type: link.nofollow ? 'nofollow' : 'dofollow',
          anchor: link.anchor_text || '',
          traffic: 0
        };
      });
    }
  } catch (e) {
    console.error('Backlink API error: ' + e.message);
  }
  
  return generateMockBacklinks(domain);
}

/**
 * Generate mock backlinks for demo
 */
function generateMockBacklinks(domain) {
  const mockDomains = [
    { domain: 'techcrunch.com', authority: 92, traffic: 15000 },
    { domain: 'forbes.com', authority: 95, traffic: 12000 },
    { domain: 'medium.com', authority: 96, traffic: 8000 },
    { domain: 'reddit.com', authority: 98, traffic: 5000 },
    { domain: 'twitter.com', authority: 99, traffic: 3500 },
    { domain: 'linkedin.com', authority: 97, traffic: 4200 },
    { domain: 'quora.com', authority: 93, traffic: 2800 },
    { domain: 'github.com', authority: 96, traffic: 6000 },
    { domain: 'stackoverflow.com', authority: 94, traffic: 4500 },
    { domain: 'nytimes.com', authority: 95, traffic: 10000 },
    { domain: 'blog.example.com', authority: 45, traffic: 500 },
    { domain: 'news.example.com', authority: 52, traffic: 800 },
    { domain: 'review.example.com', authority: 38, traffic: 300 },
    { domain: 'industry-site.com', authority: 61, traffic: 1200 },
    { domain: 'local-news.com', authority: 35, traffic: 400 }
  ];
  
  const anchors = [
    domain, 'click here', 'read more', 'this article',
    'source', 'reference', 'via', domain.split('.')[0]
  ];
  
  return mockDomains.map(function(mock, i) {
    const isDofollow = Math.random() > 0.3;
    return {
      domain: mock.domain,
      url: 'https://' + mock.domain + '/article-' + (i + 1),
      authority: mock.authority,
      type: isDofollow ? 'dofollow' : 'nofollow',
      anchor: anchors[Math.floor(Math.random() * anchors.length)],
      traffic: mock.traffic
    };
  });
}

/**
 * Calculate backlink statistics
 */
function calculateBacklinkStats(backlinks) {
  if (!backlinks || backlinks.length === 0) {
    return {
      uniqueDomains: 0,
      dofollowPercent: 0,
      avgAuthority: 0,
      distribution: { high: 0, medium: 0, low: 0 }
    };
  }
  
  const domains = {};
  let dofollowCount = 0;
  let totalAuthority = 0;
  const distribution = { high: 0, medium: 0, low: 0 };
  
  backlinks.forEach(function(bl) {
    domains[bl.domain] = true;
    
    if (bl.type === 'dofollow') {
      dofollowCount++;
    }
    
    const auth = bl.authority || 0;
    totalAuthority += auth;
    
    if (auth >= 70) {
      distribution.high++;
    } else if (auth >= 40) {
      distribution.medium++;
    } else {
      distribution.low++;
    }
  });
  
  return {
    uniqueDomains: Object.keys(domains).length,
    dofollowPercent: Math.round((dofollowCount / backlinks.length) * 100),
    avgAuthority: Math.round(totalAuthority / backlinks.length),
    distribution: distribution
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// COMPETITOR BACKLINK COMPARISON
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Compare backlinks between domains
 */
function FT_compareBacklinks(params) {
  const domains = params.domains || [];
  
  if (domains.length < 2) {
    return { ok: false, error: 'At least 2 domains required for comparison' };
  }
  
  try {
    const results = {};
    
    domains.forEach(function(domain) {
      const analysis = FT_analyzeBacklinks({ domain: domain });
      if (analysis.ok) {
        results[domain] = analysis.data;
      }
    });
    
    return {
      ok: true,
      comparison: results,
      winner: findBacklinkWinner(results)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Find domain with best backlink profile
 */
function findBacklinkWinner(results) {
  let winner = null;
  let bestScore = 0;
  
  Object.keys(results).forEach(function(domain) {
    const data = results[domain];
    // Score based on quantity, quality, and dofollow ratio
    const score = (data.totalBacklinks * 0.3) +
                  (data.avgAuthority * 2) +
                  (data.dofollowPercent * 0.5);
    
    if (score > bestScore) {
      bestScore = score;
      winner = domain;
    }
  });
  
  return winner;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Extract domain from URL
 */
function FT_BL_extractDomain(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : url;
  } catch (e) {
    return url;
  }
}

/**
 * Get configuration value
 */
function getConfigValue(key) {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty(key);
  } catch (e) {
    return null;
  }
}

/**
 * Find new backlink opportunities
 */
function FT_findBacklinkOpportunities(params) {
  const domain = params.domain;
  const competitors = params.competitors || [];
  
  if (!domain) {
    return { ok: false, error: 'Domain is required' };
  }
  
  try {
    // Get your backlinks
    const myBacklinks = FT_analyzeBacklinks({ domain: domain });
    const myDomains = {};
    
    if (myBacklinks.ok) {
      myBacklinks.data.backlinks.forEach(function(bl) {
        myDomains[bl.domain] = true;
      });
    }
    
    // Get competitor backlinks
    const opportunities = [];
    
    competitors.forEach(function(comp) {
      const compBacklinks = FT_analyzeBacklinks({ domain: comp });
      
      if (compBacklinks.ok) {
        compBacklinks.data.backlinks.forEach(function(bl) {
          if (!myDomains[bl.domain] && bl.authority >= 40) {
            opportunities.push({
              source: bl.domain,
              url: bl.url,
              authority: bl.authority,
              foundOn: comp,
              type: bl.type
            });
          }
        });
      }
    });
    
    // Sort by authority
    opportunities.sort(function(a, b) {
      return b.authority - a.authority;
    });
    
    return {
      ok: true,
      opportunities: opportunities.slice(0, 50)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

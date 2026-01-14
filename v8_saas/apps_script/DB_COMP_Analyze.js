/**
 * DB_COMP_Analyze.gs - Competitor Analysis Functions
 * SerpifAI V8 - Core analysis logic for competitors
 * 
 * Based on V7's competitor analysis modules
 */

/**
 * Get basic metrics for a competitor
 * @param {string} domain - Competitor domain
 * @return {object} Basic metrics
 */
function COMP_getBasicMetrics(domain) {
  const metrics = {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    estimatedTraffic: null,
    domainAuthority: null,
    backlinks: null,
    referringDomains: null,
    organicKeywords: null,
    score: 50 // Base score
  };
  
  // Try to get data from Fetcher
  if (typeof FT_fetchSERP === 'function') {
    const serpData = FT_fetchSERP({ keyword: 'site:' + domain });
    if (serpData.ok && serpData.totalResults) {
      metrics.indexedPages = parseInt(serpData.totalResults) || 0;
      metrics.score += 10;
    }
  }
  
  return metrics;
}

/**
 * Analyze competitor content
 * @param {string} domain - Competitor domain
 * @return {object} Content analysis
 */
function COMP_analyzeContent(domain) {
  const analysis = {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    contentTypes: [],
    topicCoverage: [],
    contentVolume: null,
    blogFrequency: null,
    contentQuality: null,
    score: 50
  };
  
  // Identify content types
  analysis.contentTypes = [
    { type: 'Blog Posts', estimated: true },
    { type: 'Landing Pages', estimated: true },
    { type: 'Product Pages', estimated: true },
    { type: 'Resources/Guides', estimated: true }
  ];
  
  // Try to get homepage data
  if (typeof FT_fetchSERP === 'function') {
    const serpData = FT_fetchSERP({ keyword: 'site:' + domain + ' blog' });
    if (serpData.ok) {
      analysis.blogPosts = serpData.totalResults || 'Unknown';
      analysis.score += 10;
    }
  }
  
  return analysis;
}

/**
 * Analyze competitor SEO
 * @param {string} domain - Competitor domain
 * @return {object} SEO analysis
 */
function COMP_analyzeSEO(domain) {
  const analysis = {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    titleTags: null,
    metaDescriptions: null,
    h1Usage: null,
    schemaMarkup: null,
    xmlSitemap: null,
    robotsTxt: null,
    canonicals: null,
    score: 50
  };
  
  // Try to fetch homepage for basic SEO checks
  if (typeof UrlFetchApp !== 'undefined') {
    try {
      const response = UrlFetchApp.fetch('https://' + domain, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      if (response.getResponseCode() === 200) {
        const html = response.getContentText();
        
        // Check title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          analysis.titleTags = { found: true, example: titleMatch[1].substring(0, 60) };
          analysis.score += 10;
        }
        
        // Check meta description
        const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        if (metaMatch) {
          analysis.metaDescriptions = { found: true, example: metaMatch[1].substring(0, 100) };
          analysis.score += 10;
        }
        
        // Check H1
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match) {
          analysis.h1Usage = { found: true, example: h1Match[1].substring(0, 60) };
          analysis.score += 5;
        }
        
        // Check for schema
        if (html.includes('application/ld+json') || html.includes('schema.org')) {
          analysis.schemaMarkup = { found: true };
          analysis.score += 10;
        }
      }
    } catch (e) {
      analysis.error = 'Could not fetch homepage: ' + e.message;
    }
  }
  
  // Check robots.txt
  try {
    const robotsResponse = UrlFetchApp.fetch('https://' + domain + '/robots.txt', {
      muteHttpExceptions: true
    });
    if (robotsResponse.getResponseCode() === 200) {
      analysis.robotsTxt = { found: true };
      analysis.score += 5;
    }
  } catch (e) {
    // Ignore
  }
  
  // Check sitemap
  try {
    const sitemapResponse = UrlFetchApp.fetch('https://' + domain + '/sitemap.xml', {
      muteHttpExceptions: true
    });
    if (sitemapResponse.getResponseCode() === 200) {
      analysis.xmlSitemap = { found: true };
      analysis.score += 5;
    }
  } catch (e) {
    // Ignore
  }
  
  return analysis;
}

/**
 * Analyze competitor performance
 * @param {string} domain - Competitor domain
 * @return {object} Performance analysis
 */
function COMP_analyzePerformance(domain) {
  const analysis = {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    pageSpeed: null,
    mobileScore: null,
    desktopScore: null,
    coreWebVitals: null,
    score: 50
  };
  
  // Use PageSpeed Insights if Fetcher available
  if (typeof FT_fetchPageSpeed === 'function') {
    const psResult = FT_fetchPageSpeed({ url: 'https://' + domain });
    
    if (psResult.ok) {
      analysis.pageSpeed = {
        performance: psResult.performance,
        accessibility: psResult.accessibility,
        bestPractices: psResult.bestPractices,
        seo: psResult.seo
      };
      
      // Update score based on performance
      if (psResult.performance >= 90) {
        analysis.score = 95;
      } else if (psResult.performance >= 70) {
        analysis.score = 75;
      } else if (psResult.performance >= 50) {
        analysis.score = 55;
      } else {
        analysis.score = 35;
      }
      
      analysis.desktopScore = psResult.performance;
    }
  }
  
  return analysis;
}

/**
 * Analyze competitor backlink profile
 * @param {string} domain - Competitor domain
 * @return {object} Backlink analysis
 */
function COMP_analyzeBacklinks(domain) {
  return {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    totalBacklinks: null,
    referringDomains: null,
    topBacklinks: [],
    anchorTextDistribution: [],
    linkTypes: [],
    score: 50,
    note: 'Backlink data requires external API integration'
  };
}

/**
 * Analyze competitor social presence
 * @param {string} domain - Competitor domain
 * @return {object} Social analysis
 */
function COMP_analyzeSocial(domain) {
  return {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    platforms: [],
    followers: {},
    engagement: {},
    postingFrequency: {},
    score: 50,
    note: 'Social data requires external API integration'
  };
}

/**
 * Analyze competitor keywords
 * @param {string} domain - Competitor domain
 * @param {Array} targetKeywords - Keywords to check
 * @return {object} Keyword analysis
 */
function COMP_analyzeKeywords(domain, targetKeywords) {
  targetKeywords = targetKeywords || [];
  
  const analysis = {
    domain: domain,
    analyzedAt: new Date().toISOString(),
    targetKeywords: [],
    additionalKeywords: [],
    topRankingKeywords: [],
    score: 50
  };
  
  // Check rankings for target keywords
  if (typeof FT_fetchSERP === 'function') {
    targetKeywords.slice(0, 5).forEach(kw => {
      const serpData = FT_fetchSERP({ keyword: kw });
      
      if (serpData.ok && serpData.organic) {
        const rank = serpData.organic.findIndex(r => 
          r.link && r.link.includes(domain)
        );
        
        analysis.targetKeywords.push({
          keyword: kw,
          rank: rank >= 0 ? rank + 1 : null,
          ranking: rank >= 0
        });
        
        if (rank >= 0 && rank < 10) {
          analysis.score += 10;
        }
      }
    });
  }
  
  return analysis;
}

/**
 * Generate competitor SWOT analysis
 * @param {object} fullAnalysis - Complete competitor analysis
 * @return {object} SWOT analysis
 */
function COMP_generateSWOT(fullAnalysis) {
  const swot = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  
  // Analyze strengths
  if (fullAnalysis.performance?.score >= 80) {
    swot.strengths.push('Strong website performance');
  }
  if (fullAnalysis.seo?.schemaMarkup?.found) {
    swot.strengths.push('Implements structured data');
  }
  if (fullAnalysis.seo?.score >= 80) {
    swot.strengths.push('Well-optimized SEO fundamentals');
  }
  
  // Analyze weaknesses
  if (fullAnalysis.performance?.score < 50) {
    swot.weaknesses.push('Poor website performance');
  }
  if (!fullAnalysis.seo?.schemaMarkup?.found) {
    swot.weaknesses.push('No structured data detected');
  }
  if (!fullAnalysis.seo?.xmlSitemap?.found) {
    swot.weaknesses.push('Missing XML sitemap');
  }
  
  // Opportunities
  swot.opportunities.push('Content gap exploitation');
  swot.opportunities.push('Better technical SEO implementation');
  
  // Threats
  swot.threats.push('Established market presence');
  if (fullAnalysis.content?.score >= 80) {
    swot.threats.push('Strong content marketing');
  }
  
  return swot;
}

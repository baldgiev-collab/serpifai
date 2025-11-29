/**
 * COMPETITOR ANALYSIS - CATEGORY III: TECHNICAL SEO & PERFORMANCE
 * Site health, architecture, schema audit, page speed, AI footprint, rendering
 * APIs: PageSpeed, Fetcher (schema, internal links, page structure)
 */

/**
 * Main function: Analyze technical SEO & performance
 * @param {object} params - { domain, url }
 * @return {object} Technical SEO analysis
 */
function COMP_analyzeTechnicalSEO(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      siteHealth: COMP_analyzeSiteHealth(domain, url),
      architecture: COMP_analyzeArchitecture(domain, url),
      schemaAudit: COMP_analyzeSchemaAudit(url),
      pageSpeed: COMP_analyzePageSpeed(url),
      aiFootprint: COMP_analyzeAIFootprint(domain, url),
      rendering: COMP_analyzeRendering(url)
    };
    
    // Calculate overall health score
    result.overallHealthScore = COMP_calculateHealthScore(result);
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeTechnicalSEO: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze site health metrics
 */
function COMP_analyzeSiteHealth(domain, url) {
  try {
    var health = {
      crawlEfficiency: 0,
      indexation: 0,
      coreWebVitals: {},
      healthScore: 0
    };
    
    // Fetch page for crawl analysis
    var pageData = FET_handle({
      action: 'fetchSingleUrl',
      url: url
    });
    
    if (pageData && pageData.ok) {
      // Check crawlability
      var htmlSize = pageData.html ? pageData.html.length : 0;
      health.crawlEfficiency = htmlSize > 0 ? Math.min(100, Math.round((1 / (htmlSize / 100000)) * 100)) : 0;
      
      // Check meta robots
      var metaData = FET_handle({
        action: 'extractMetadata',
        html: pageData.html
      });
      
      if (metaData && metaData.ok) {
        var robots = metaData.robots || '';
        health.indexation = robots.indexOf('noindex') === -1 ? 100 : 0;
      }
    }
    
    // Fetch Core Web Vitals from PageSpeed API
    var cwvData = APIS_pageSpeedCall({ url: url });
    if (cwvData && cwvData.ok) {
      health.coreWebVitals = {
        lcp: cwvData.lcp || 0,
        cls: cwvData.cls || 0,
        inp: cwvData.inp || 0,
        score: cwvData.score || 0
      };
    } else {
      health.coreWebVitals = { lcp: 0, cls: 0, inp: 0, score: 0 };
    }
    
    // Calculate health score (average of components)
    health.healthScore = Math.round((health.crawlEfficiency + health.indexation + (health.coreWebVitals.score || 0)) / 3);
    
    return health;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeSiteHealth: ' + e);
    return { crawlEfficiency: 0, indexation: 0, coreWebVitals: {}, healthScore: 0 };
  }
}

/**
 * Analyze site architecture
 */
function COMP_analyzeArchitecture(domain, url) {
  try {
    var architecture = {
      hierarchyClarity: 0,
      internalLinks: 0,
      depthRatio: 0,
      avgClicksToContent: 0
    };
    
    // Fetch internal links
    var linksData = FET_handle({
      action: 'extractInternalLinks',
      url: url
    });
    
    if (linksData && linksData.ok) {
      architecture.internalLinks = linksData.links ? linksData.links.length : 0;
      
      // Calculate depth ratio (URLs with ≤3 path segments = good hierarchy)
      var shallowLinks = 0;
      if (linksData.links) {
        for (var i = 0; i < linksData.links.length; i++) {
          var link = linksData.links[i];
          var segments = link.split('/').filter(function(s) { return s.length > 0; });
          if (segments.length <= 3) shallowLinks++;
        }
      }
      
      architecture.depthRatio = architecture.internalLinks > 0 
        ? Math.round((shallowLinks / architecture.internalLinks) * 100) 
        : 0;
      
      // Estimate avg clicks to content (3 - depth ratio/100 * 3)
      architecture.avgClicksToContent = 3 - (architecture.depthRatio / 100) * 2;
    }
    
    // Hierarchy clarity: based on internal linking structure
    architecture.hierarchyClarity = Math.min(100, Math.round(architecture.internalLinks / 2));
    
    return architecture;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeArchitecture: ' + e);
    return { hierarchyClarity: 0, internalLinks: 0, depthRatio: 0, avgClicksToContent: 0 };
  }
}

/**
 * Analyze schema markup
 */
function COMP_analyzeSchemaAudit(url) {
  try {
    var schemaAudit = {
      types: [],
      errors: [],
      entityAlignment: 0,
      completenessPercent: 0
    };
    
    // Fetch schema data
    var schemaData = FET_handle({
      action: 'extractSchema',
      url: url
    });
    
    if (schemaData && schemaData.ok && schemaData.schemas) {
      // Extract schema types
      schemaAudit.types = [];
      for (var i = 0; i < schemaData.schemas.length; i++) {
        var schema = schemaData.schemas[i];
        if (schema['@type']) {
          schemaAudit.types.push(schema['@type']);
        }
      }
      
      // Check for common schema types (Organization, WebSite, Article, Product, BreadcrumbList)
      var expectedTypes = ['Organization', 'WebSite', 'Article', 'Product', 'BreadcrumbList', 'Person'];
      var foundTypes = 0;
      
      for (var j = 0; j < expectedTypes.length; j++) {
        if (schemaAudit.types.indexOf(expectedTypes[j]) !== -1) {
          foundTypes++;
        }
      }
      
      schemaAudit.completenessPercent = Math.round((foundTypes / expectedTypes.length) * 100);
      
      // Entity alignment: if Organization or Person schema exists = high alignment
      schemaAudit.entityAlignment = (schemaAudit.types.indexOf('Organization') !== -1 || 
                                      schemaAudit.types.indexOf('Person') !== -1) ? 85 : 40;
    }
    
    return schemaAudit;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeSchemaAudit: ' + e);
    return { types: [], errors: [], entityAlignment: 0, completenessPercent: 0 };
  }
}

/**
 * Analyze page speed metrics
 */
function COMP_analyzePageSpeed(url) {
  try {
    var pageSpeed = {
      lcp: 0,
      cls: 0,
      inp: 0,
      uxScore: 0
    };
    
    // Call PageSpeed API
    var psData = APIS_pageSpeedCall({ url: url });
    
    if (psData && psData.ok) {
      pageSpeed.lcp = psData.lcp || 0;
      pageSpeed.cls = psData.cls || 0;
      pageSpeed.inp = psData.inp || 0;
      pageSpeed.uxScore = psData.score || 0;
    } else {
      // Fallback: estimate based on HTML size
      var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
      if (pageData && pageData.ok && pageData.html) {
        var htmlSize = pageData.html.length;
        // Smaller pages = faster (rough estimate)
        pageSpeed.uxScore = htmlSize < 50000 ? 90 : (htmlSize < 100000 ? 70 : 50);
        pageSpeed.lcp = htmlSize < 50000 ? 1.5 : (htmlSize < 100000 ? 2.5 : 4.0);
        pageSpeed.cls = 0.1; // Default estimate
        pageSpeed.inp = 100; // Default estimate
      }
    }
    
    return pageSpeed;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzePageSpeed: ' + e);
    return { lcp: 0, cls: 0, inp: 0, uxScore: 0 };
  }
}

/**
 * Analyze AI footprint (AI-generated content patterns)
 */
function COMP_analyzeAIFootprint(domain, url) {
  try {
    var aiFootprint = {
      aiGeneratedPages: 0,
      contentVelocity: 0,
      aiPatternPresencePercent: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Check for AI patterns (common phrases in AI-generated content)
      var aiPatterns = [
        'in conclusion',
        'it is important to note',
        'as an ai',
        'delve into',
        'in summary',
        'it\'s worth noting',
        'comprehensive guide',
        'navigate the landscape',
        'in today\'s digital age',
        'revolutionize',
        'unlock the power'
      ];
      
      var patternsFound = 0;
      for (var i = 0; i < aiPatterns.length; i++) {
        if (html.indexOf(aiPatterns[i]) !== -1) {
          patternsFound++;
        }
      }
      
      aiFootprint.aiPatternPresencePercent = Math.round((patternsFound / aiPatterns.length) * 100);
      
      // Estimate content velocity from domain (would need historical data)
      // For now, use Serper to check how many pages are indexed
      var indexData = APIS_serperSearch({
        q: 'site:' + domain,
        num: 10
      });
      
      if (indexData && indexData.ok && indexData.searchInformation) {
        var totalResults = indexData.searchInformation.totalResults || 0;
        // Estimate velocity: pages/month (rough guess based on total)
        aiFootprint.contentVelocity = totalResults > 10000 ? 50 : (totalResults > 1000 ? 20 : 5);
        
        // High velocity + high patterns = likely AI-generated
        aiFootprint.aiGeneratedPages = Math.round((totalResults * aiFootprint.aiPatternPresencePercent) / 100);
      }
    }
    
    return aiFootprint;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeAIFootprint: ' + e);
    return { aiGeneratedPages: 0, contentVelocity: 0, aiPatternPresencePercent: 0 };
  }
}

/**
 * Analyze rendering (JS blocking, hydration)
 */
function COMP_analyzeRendering(url) {
  try {
    var rendering = {
      jsBlocking: false,
      hydrationIssues: false,
      renderDelay: 0
    };
    
    // Fetch page HTML
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html;
      
      // Check for blocking JS (scripts without async/defer in <head>)
      var hasBlockingJS = html.indexOf('<script src=') !== -1 && 
                          html.indexOf('async') === -1 && 
                          html.indexOf('defer') === -1;
      
      rendering.jsBlocking = hasBlockingJS;
      
      // Check for hydration frameworks (React, Vue, Next.js)
      var hasReact = html.indexOf('__NEXT_DATA__') !== -1 || html.indexOf('react') !== -1;
      var hasVue = html.indexOf('vue') !== -1;
      
      rendering.hydrationIssues = hasReact || hasVue; // May have hydration issues
      
      // Estimate render delay based on JS blocking
      rendering.renderDelay = rendering.jsBlocking ? 500 : 100;
    }
    
    return rendering;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeRendering: ' + e);
    return { jsBlocking: false, hydrationIssues: false, renderDelay: 0 };
  }
}

/**
 * Calculate overall health score
 */
function COMP_calculateHealthScore(technicalData) {
  try {
    var scores = [];
    
    // Site health
    if (technicalData.siteHealth && technicalData.siteHealth.healthScore) {
      scores.push(technicalData.siteHealth.healthScore);
    }
    
    // Architecture (hierarchy clarity)
    if (technicalData.architecture && technicalData.architecture.hierarchyClarity) {
      scores.push(technicalData.architecture.hierarchyClarity);
    }
    
    // Schema completeness
    if (technicalData.schemaAudit && technicalData.schemaAudit.completenessPercent) {
      scores.push(technicalData.schemaAudit.completenessPercent);
    }
    
    // Page speed UX score
    if (technicalData.pageSpeed && technicalData.pageSpeed.uxScore) {
      scores.push(technicalData.pageSpeed.uxScore);
    }
    
    // Rendering penalty (reduce score if JS blocking)
    var renderingPenalty = 0;
    if (technicalData.rendering && technicalData.rendering.jsBlocking) {
      renderingPenalty = 10;
    }
    
    // Calculate average
    var total = 0;
    for (var i = 0; i < scores.length; i++) {
      total += scores[i];
    }
    
    var avgScore = scores.length > 0 ? Math.round(total / scores.length) : 0;
    
    return Math.max(0, avgScore - renderingPenalty);
    
  } catch (e) {
    Logger.log('Error in COMP_calculateHealthScore: ' + e);
    return 0;
  }
}

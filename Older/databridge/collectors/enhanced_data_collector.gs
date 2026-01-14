/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED DATA COLLECTOR
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Collects RICH, STRUCTURED data from ALL sources:
 * 
 * FETCHER MODULES (Remote web app calls via APIS_fetcherCall):
 * - extractHeadings → Complete heading hierarchy with keywords
 * - extractMetadata → Full meta tags, OG tags, structured data
 * - extractOpengraph → Complete Open Graph protocol data
 * - extractSchema → All JSON-LD/Microdata schemas found
 * - extractInternalLinks → Internal link graph + anchor text
 * - competitorBenchmark → Content analysis + competitive metrics
 * - seoSnapshot → Technical SEO health check
 * 
 * FREE API INTEGRATIONS (Real-time data):
 * - OpenPageRank → Domain authority, backlinks, referring domains
 * - PageSpeed Insights → Core Web Vitals, performance metrics
 * - Serper → Keyword rankings, SERP features, traffic estimates
 * - Search Console → (if connected) Real organic performance
 * 
 * ARCHITECTURE:
 * - DataBridge (this module): STANDALONE Apps Script project
 * - Fetcher: SEPARATE Apps Script web app (called via UrlFetchApp)
 * - Keeps modules independent and reusable
 * 
 * Returns unified JSON structure ready for storage + AI analysis
 * 
 * @module EnhancedDataCollector
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Collect ALL data for a single competitor
 * @param {string} url - Competitor URL (e.g., "https://ahrefs.com")
 * @param {Object} projectContext - Project metadata for AI context
 * @returns {Object} Unified JSON with fetcher + API data
 */
function COLLECTOR_gatherAllData(url, projectContext) {
  // Validate required parameters
  if (!url || url === 'undefined' || url === '') {
    Logger.log('❌ Invalid URL parameter: ' + url);
    return {
      success: false,
      error: 'URL parameter is required and cannot be empty',
      domain: 'unknown',
      collectionSummary: { completeness: 0 }
    };
  }
  
  Logger.log('🔍 Collecting rich data for: ' + url);
  
  var startTime = new Date().getTime();
  var domain = extractDomain_(url);
  
  var result = {
    domain: domain,
    url: url,
    collectedAt: new Date().toISOString(),
    rawData: {
      fetcher: {},
      apis: {}
    },
    dataQuality: {
      fetcherSuccess: [],
      fetcherFailed: [],
      apiSuccess: [],
      apiFailed: []
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: FETCHER DATA COLLECTION (Extracted from HTML)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📥 Phase 1: Fetcher data collection...');
  
  // 1. Extract headings (complete hierarchy) - Remote Fetcher Call
  try {
    var headingsData = APIS_fetchAndExtract('extractHeadings', url);
    if (headingsData && headingsData.ok) {
      result.rawData.fetcher.headings = {
        hierarchy: headingsData.headings || [],
        h1Count: (headingsData.counts && headingsData.counts.h1) || 0,
        h2Count: (headingsData.counts && headingsData.counts.h2) || 0,
        h3Count: (headingsData.counts && headingsData.counts.h3) || 0,
        totalHeadings: headingsData.totalCount || 0,
        keywordDensity: headingsData.keywordDensity || {}
      };
      result.dataQuality.fetcherSuccess.push('headings');
      Logger.log('  ✅ Headings extracted: ' + result.rawData.fetcher.headings.totalHeadings);
    } else {
      result.dataQuality.fetcherFailed.push('headings');
      Logger.log('  ⚠️ Headings extraction failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('headings');
    Logger.log('  ❌ Headings error: ' + e);
  }
  
  // 2. Extract metadata (complete meta tags) - Remote Fetcher Call
  try {
    var metadataData = APIS_fetchAndExtract('extractMetadata', url);
    if (metadataData && metadataData.ok) {
      result.rawData.fetcher.metadata = {
        title: metadataData.title || '',
        metaDescription: metadataData.metaDescription || '',
        h1: metadataData.h1 || '',
        canonical: metadataData.canonical || '',
        robots: metadataData.robots || '',
        viewport: metadataData.viewport || '',
        charset: metadataData.charset || '',
        lang: metadataData.lang || '',
        author: metadataData.author || '',
        keywords: metadataData.keywords || '',
        // Additional enrichment
        wordCount: metadataData.wordCount || 0,
        imageCount: metadataData.imageCount || 0,
        linkCount: metadataData.linkCount || 0
      };
      result.dataQuality.fetcherSuccess.push('metadata');
      Logger.log('  ✅ Metadata extracted: ' + result.rawData.fetcher.metadata.title);
    } else {
      result.dataQuality.fetcherFailed.push('metadata');
      Logger.log('  ⚠️ Metadata extraction failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('metadata');
    Logger.log('  ❌ Metadata error: ' + e);
  }
  
  // 3. Extract Open Graph data - Remote Fetcher Call
  try {
    var opengraphData = APIS_fetchAndExtract('extractOpenGraph', url);
    if (opengraphData && opengraphData.ok) {
      result.rawData.fetcher.opengraph = {
        title: opengraphData.ogTitle || '',
        description: opengraphData.ogDescription || '',
        image: opengraphData.ogImage || '',
        url: opengraphData.ogUrl || '',
        type: opengraphData.ogType || '',
        siteName: opengraphData.ogSiteName || '',
        locale: opengraphData.ogLocale || '',
        // Twitter Card data
        twitterCard: opengraphData.twitterCard || '',
        twitterSite: opengraphData.twitterSite || '',
        twitterCreator: opengraphData.twitterCreator || ''
      };
      result.dataQuality.fetcherSuccess.push('opengraph');
      Logger.log('  ✅ Open Graph extracted: ' + result.rawData.fetcher.opengraph.title);
    } else {
      result.dataQuality.fetcherFailed.push('opengraph');
      Logger.log('  ⚠️ Open Graph extraction failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('opengraph');
    Logger.log('  ❌ Open Graph error: ' + e);
  }
  
  // 4. Extract Schema.org structured data - Remote Fetcher Call
  try {
    var schemaData = APIS_fetchAndExtract('extractSchema', url);
    if (schemaData && schemaData.ok) {
      result.rawData.fetcher.schema = {
        schemas: schemaData.schemas || [],
        schemaTypes: schemaData.schemaTypes || [],
        count: (schemaData.schemas && schemaData.schemas.length) || 0,
        // Categorize by type
        organization: findSchemaByType_(schemaData.schemas, 'Organization'),
        product: findSchemaByType_(schemaData.schemas, 'Product'),
        article: findSchemaByType_(schemaData.schemas, 'Article'),
        breadcrumb: findSchemaByType_(schemaData.schemas, 'BreadcrumbList'),
        faq: findSchemaByType_(schemaData.schemas, 'FAQPage'),
        howTo: findSchemaByType_(schemaData.schemas, 'HowTo')
      };
      result.dataQuality.fetcherSuccess.push('schema');
      Logger.log('  ✅ Schema extracted: ' + result.rawData.fetcher.schema.count + ' schemas');
    } else {
      result.dataQuality.fetcherFailed.push('schema');
      Logger.log('  ⚠️ Schema extraction failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('schema');
    Logger.log('  ❌ Schema error: ' + e);
  }
  
  // 5. Extract internal links - Remote Fetcher Call
  try {
    var internalLinksData = APIS_fetchAndExtract('extractInternalLinks', url);
    if (internalLinksData && internalLinksData.ok) {
      result.rawData.fetcher.internalLinks = {
        links: internalLinksData.links || [],
        totalLinks: (internalLinksData.links && internalLinksData.links.length) || 0,
        uniquePages: countUniquePages_(internalLinksData.links),
        anchorTexts: extractAnchorTexts_(internalLinksData.links),
        topLinkedPages: getTopLinkedPages_(internalLinksData.links, 10)
      };
      result.dataQuality.fetcherSuccess.push('internalLinks');
      Logger.log('  ✅ Internal links extracted: ' + result.rawData.fetcher.internalLinks.totalLinks);
    } else {
      result.dataQuality.fetcherFailed.push('internalLinks');
      Logger.log('  ⚠️ Internal links extraction failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('internalLinks');
    Logger.log('  ❌ Internal links error: ' + e);
  }
  
  // 6. Competitor benchmark analysis - Remote Fetcher Call
  try {
    // Note: competitorBenchmark expects URLs array, not HTML
    var benchmarkData = APIS_fetcherCall('competitorBenchmark', { urls: [url], projectContext: projectContext });
    if (benchmarkData && benchmarkData.ok) {
      result.rawData.fetcher.benchmark = {
        contentQuality: benchmarkData.contentQuality || {},
        technicalHealth: benchmarkData.technicalHealth || {},
        userExperience: benchmarkData.userExperience || {},
        competitiveAdvantages: benchmarkData.advantages || [],
        weaknesses: benchmarkData.weaknesses || []
      };
      result.dataQuality.fetcherSuccess.push('benchmark');
      Logger.log('  ✅ Benchmark analysis complete');
    } else {
      result.dataQuality.fetcherFailed.push('benchmark');
      Logger.log('  ⚠️ Benchmark analysis failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('benchmark');
    Logger.log('  ❌ Benchmark error: ' + e);
  }
  
  // 7. SEO Snapshot (technical health) - Remote Fetcher Call
  try {
    // Note: seoSnapshot expects URL, not HTML
    var snapshotData = APIS_fetcherCall('seoSnapshot', { url: url });
    if (snapshotData && snapshotData.ok) {
      result.rawData.fetcher.seoSnapshot = {
        statusCode: snapshotData.statusCode || 0,
        redirects: snapshotData.redirects || [],
        loadTime: snapshotData.loadTime || 0,
        pageSize: snapshotData.pageSize || 0,
        htmlValid: snapshotData.htmlValid || false,
        mobileOptimized: snapshotData.mobileOptimized || false,
        httpsEnabled: snapshotData.httpsEnabled || false,
        issues: snapshotData.issues || []
      };
      result.dataQuality.fetcherSuccess.push('seoSnapshot');
      Logger.log('  ✅ SEO snapshot complete');
    } else {
      result.dataQuality.fetcherFailed.push('seoSnapshot');
      Logger.log('  ⚠️ SEO snapshot failed');
    }
  } catch (e) {
    result.dataQuality.fetcherFailed.push('seoSnapshot');
    Logger.log('  ❌ SEO snapshot error: ' + e);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: API DATA COLLECTION (Real-time metrics)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📥 Phase 2: API data collection...');
  
  // 1. OpenPageRank API (Authority metrics)
  try {
    var oprData = OPENPAGERANK_fetch({ domain: domain });
    if (oprData && oprData.ok) {
      result.rawData.apis.openpagerank = {
        pageRank: oprData.pageRank || 0,
        domainRank: oprData.domainRank || 0,
        totalBacklinks: oprData.totalBacklinks || 0,
        referringDomains: oprData.referringDomains || 0,
        // Additional metrics if available
        organicTraffic: oprData.organicTraffic || 0,
        organicKeywords: oprData.organicKeywords || 0,
        lastUpdated: oprData.lastUpdated || ''
      };
      result.dataQuality.apiSuccess.push('openpagerank');
      Logger.log('  ✅ OpenPageRank: ' + result.rawData.apis.openpagerank.pageRank);
    } else {
      result.dataQuality.apiFailed.push('openpagerank');
      Logger.log('  ⚠️ OpenPageRank failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('openpagerank');
    Logger.log('  ❌ OpenPageRank error: ' + e);
  }
  
  // 2. PageSpeed Insights API (Performance metrics)
  try {
    var psiData = PAGESPEED_analyze({ url: url });
    if (psiData && psiData.ok) {
      result.rawData.apis.pagespeed = {
        performanceScore: psiData.performanceScore || 0,
        fcp: psiData.fcp || 0, // First Contentful Paint
        lcp: psiData.lcp || 0, // Largest Contentful Paint
        cls: psiData.cls || 0, // Cumulative Layout Shift
        fid: psiData.fid || 0, // First Input Delay
        tti: psiData.tti || 0, // Time to Interactive
        tbt: psiData.tbt || 0, // Total Blocking Time
        speedIndex: psiData.speedIndex || 0,
        // Opportunities & diagnostics
        opportunities: psiData.opportunities || [],
        diagnostics: psiData.diagnostics || [],
        // Lab data
        labData: psiData.labData || {}
      };
      result.dataQuality.apiSuccess.push('pagespeed');
      Logger.log('  ✅ PageSpeed: ' + result.rawData.apis.pagespeed.performanceScore);
    } else {
      result.dataQuality.apiFailed.push('pagespeed');
      Logger.log('  ⚠️ PageSpeed failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('pagespeed');
    Logger.log('  ❌ PageSpeed error: ' + e);
  }
  
  // 3. Serper API (Keyword & SERP data)
  try {
    var serperData = SERPER_getDomainOverview({ domain: domain });
    if (serperData && serperData.ok) {
      result.rawData.apis.serper = {
        organicKeywords: serperData.organicKeywords || 0,
        paidKeywords: serperData.paidKeywords || 0,
        organicTraffic: serperData.organicTraffic || 0,
        paidTraffic: serperData.paidTraffic || 0,
        // SERP features
        serpFeatures: serperData.serpFeatures || [],
        topKeywords: serperData.topKeywords || [],
        // Ranking distribution
        rankingDistribution: serperData.rankingDistribution || {},
        // Competitors (from Serper)
        organicCompetitors: serperData.competitors || []
      };
      result.dataQuality.apiSuccess.push('serper');
      Logger.log('  ✅ Serper: ' + result.rawData.apis.serper.organicKeywords + ' keywords');
    } else {
      result.dataQuality.apiFailed.push('serper');
      Logger.log('  ⚠️ Serper failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('serper');
    Logger.log('  ❌ Serper error: ' + e);
  }
  
  // 4. Search Console API (if connected - optional)
  try {
    if (typeof SEARCHCONSOLE_getMetrics === 'function') {
      var gscData = SEARCHCONSOLE_getMetrics({ domain: domain });
      if (gscData && gscData.ok) {
        result.rawData.apis.searchConsole = {
          clicks: gscData.clicks || 0,
          impressions: gscData.impressions || 0,
          ctr: gscData.ctr || 0,
          position: gscData.position || 0,
          topQueries: gscData.topQueries || [],
          topPages: gscData.topPages || []
        };
        result.dataQuality.apiSuccess.push('searchConsole');
        Logger.log('  ✅ Search Console: ' + result.rawData.apis.searchConsole.clicks + ' clicks');
      }
    }
  } catch (e) {
    // Search Console optional - don't fail if not available
    Logger.log('  ℹ️ Search Console not available: ' + e);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: DATA QUALITY SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  var elapsedTime = new Date().getTime() - startTime;
  
  result.collectionSummary = {
    elapsedMs: elapsedTime,
    fetcherSuccessCount: result.dataQuality.fetcherSuccess.length,
    fetcherFailedCount: result.dataQuality.fetcherFailed.length,
    apiSuccessCount: result.dataQuality.apiSuccess.length,
    apiFailedCount: result.dataQuality.apiFailed.length,
    totalDataPoints: countTotalDataPoints_(result.rawData),
    completeness: calculateCompleteness_(result.dataQuality)
  };
  
  Logger.log('✅ Data collection complete for ' + domain);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  Logger.log('   Fetcher: ' + result.collectionSummary.fetcherSuccessCount + '/' + 
    (result.collectionSummary.fetcherSuccessCount + result.collectionSummary.fetcherFailedCount) + ' success');
  Logger.log('   APIs: ' + result.collectionSummary.apiSuccessCount + '/' + 
    (result.collectionSummary.apiSuccessCount + result.collectionSummary.apiFailedCount) + ' success');
  Logger.log('   Completeness: ' + result.collectionSummary.completeness + '%');
  
  return result;
}

/**
 * Batch collect data for multiple competitors
 * @param {string[]} urls - Array of competitor URLs
 * @param {Object} projectContext - Project metadata
 * @returns {Object} {success, competitors: {domain: data}}
 */
function COLLECTOR_gatherBatchData(urls, projectContext) {
  // Validate required parameters
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    Logger.log('❌ Invalid URLs parameter: ' + urls);
    return {
      success: false,
      error: 'URLs parameter must be a non-empty array',
      successCount: 0,
      failCount: 0,
      competitors: {}
    };
  }
  
  Logger.log('🚀 Batch data collection for ' + urls.length + ' competitors');
  
  var startTime = new Date().getTime();
  var results = {};
  var successCount = 0;
  var failCount = 0;
  var retryDelays = {}; // Track retry delays per domain
  
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var domain = extractDomain_(url);
    var maxRetries = 3;
    var retryCount = 0;
    var success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        var data = COLLECTOR_gatherAllData(url, projectContext);
        if (data && data.domain) {
          results[data.domain] = data;
          successCount++;
          success = true;
        } else {
          failCount++;
          break;
        }
      } catch (e) {
        var errorStr = String(e);
        
        // Check if it's a 429 rate limit error
        if (errorStr.indexOf('429') !== -1 || errorStr.indexOf('rate limit') !== -1) {
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: 5s, 10s, 20s
            var delay = Math.pow(2, retryCount) * 2500;
            Logger.log('⚠️ Rate limited for ' + url + ' (attempt ' + retryCount + '/' + maxRetries + ')');
            Logger.log('   Waiting ' + (delay / 1000) + 's before retry...');
            Utilities.sleep(delay);
          } else {
            Logger.log('❌ Max retries reached for ' + url + ' after ' + retryCount + ' attempts');
            failCount++;
          }
        } else {
          Logger.log('❌ Failed to collect data for ' + url + ': ' + e);
          failCount++;
          break;
        }
      }
    }
    
    // Rate limiting: Wait 3 seconds between requests (increased from 2s)
    if (i < urls.length - 1) {
      Utilities.sleep(3000);
    }
  }
  
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('✅ Batch collection complete');
  Logger.log('   Success: ' + successCount + '/' + urls.length);
  Logger.log('   Failed: ' + failCount);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  
  return {
    success: successCount > 0,
    successCount: successCount,
    failCount: failCount,
    elapsedMs: elapsedTime,
    competitors: results
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function extractDomain_(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
}

function findSchemaByType_(schemas, type) {
  if (!schemas || !Array.isArray(schemas)) return null;
  return schemas.find(function(s) { return s['@type'] === type; }) || null;
}

function countUniquePages_(links) {
  if (!links || !Array.isArray(links)) return 0;
  var pages = {};
  links.forEach(function(link) {
    if (link.href) pages[link.href] = true;
  });
  return Object.keys(pages).length;
}

function extractAnchorTexts_(links) {
  if (!links || !Array.isArray(links)) return [];
  return links.map(function(link) { return link.anchorText || ''; }).filter(function(text) { return text !== ''; });
}

function getTopLinkedPages_(links, limit) {
  if (!links || !Array.isArray(links)) return [];
  var pageCounts = {};
  links.forEach(function(link) {
    if (link.href) {
      pageCounts[link.href] = (pageCounts[link.href] || 0) + 1;
    }
  });
  return Object.keys(pageCounts)
    .map(function(href) { return { href: href, count: pageCounts[href] }; })
    .sort(function(a, b) { return b.count - a.count; })
    .slice(0, limit);
}

function countTotalDataPoints_(rawData) {
  var count = 0;
  
  // Count fetcher data points
  if (rawData.fetcher) {
    if (rawData.fetcher.headings && rawData.fetcher.headings.hierarchy) {
      count += rawData.fetcher.headings.hierarchy.length;
    }
    if (rawData.fetcher.schema && rawData.fetcher.schema.schemas) {
      count += rawData.fetcher.schema.schemas.length;
    }
    if (rawData.fetcher.internalLinks && rawData.fetcher.internalLinks.links) {
      count += rawData.fetcher.internalLinks.links.length;
    }
    count += Object.keys(rawData.fetcher).length * 5; // Estimate 5 data points per fetcher
  }
  
  // Count API data points
  if (rawData.apis) {
    count += Object.keys(rawData.apis).length * 10; // Estimate 10 data points per API
  }
  
  return count;
}

function calculateCompleteness_(dataQuality) {
  var totalSources = 7 + 4; // 7 fetchers + 4 APIs
  var successfulSources = dataQuality.fetcherSuccess.length + dataQuality.apiSuccess.length;
  return Math.round((successfulSources / totalSources) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// V6 FORENSIC ENGINE COLLECTORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * V6: Collector with One-Shot Forensic Engine
 * Replaces 7 separate fetcher calls with ONE forensic scan
 */
function COLLECTOR_gatherAllData_V6(url, projectContext) {
  // Validate required parameters
  if (!url || url === 'undefined' || url === '') {
    Logger.log('❌ Invalid URL parameter: ' + url);
    return {
      success: false,
      error: 'URL parameter is required and cannot be empty',
      domain: 'unknown',
      collectionSummary: { completeness: 0 }
    };
  }
  
  Logger.log('🔍 V6 Elite: ONE-SHOT Forensic Scan for: ' + url);
  
  var startTime = new Date().getTime();
  var domain = extractDomain_(url);
  
  var result = {
    domain: domain,
    url: url,
    collectedAt: new Date().toISOString(),
    rawData: {
      fetcher: {},
      apis: {}
    },
    dataQuality: {
      fetcherSuccess: [],
      fetcherFailed: [],
      apiSuccess: [],
      apiFailed: []
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: ONE-SHOT FORENSIC SCAN (Replaces 7 separate fetcher calls)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('🚀 Phase 1: Full Forensic Scan (15-Category Evidence)...');
  
  try {
    var forensicResult = APIS_fetcherCall('fetch:fullScan', {
      url: url,
      competitorUrls: projectContext.competitors || []
    });
    
    Logger.log('🔍 Forensic response received (type: ' + typeof forensicResult + ')');
    
    // V6 Fetcher returns {ok: true, forensics: {...}} not {success: true, data: {...}}
    if (forensicResult && forensicResult.ok && forensicResult.forensics) {
      Logger.log('✅ Forensic scan complete');
      
      // Map forensics to result structure
      result.rawData.fetcher = forensicResult.forensics;
      
      // Mark all sub-modules as successful
      var successModules = [
        'metadata',        // Cat I - Narrative
        'headings',        // Cat III, IV - AI Footprint
        'schema',          // Cat II - E-E-A-T
        'tech_audit',      // Cat III - Technical
        'cro_analysis',    // Cat VII - Conversion
        'velocity',        // Cat IV - Freshness
        'ai_footprint',    // Cat IV, VI - AI Detection
        'systems'          // Cat VI - Automation
      ];
      
      successModules.forEach(function(mod) {
        result.dataQuality.fetcherSuccess.push(mod);
      });
      
      // Log forensic highlights
      if (forensicResult.forensics.content_intel) {
        Logger.log('  🎯 Humanity Score: ' + forensicResult.forensics.content_intel.humanity_score);
      }
      if (forensicResult.forensics.conversion) {
        Logger.log('  ⚡ Friction Level: ' + forensicResult.forensics.conversion.friction_level);
      }
      if (forensicResult.forensics.market_intel) {
        Logger.log('  🏢 CMS Detected: ' + forensicResult.forensics.market_intel.cms);
      }
      if (forensicResult.forensics.technical) {
        Logger.log('  🔒 Security Headers: ' + JSON.stringify(forensicResult.forensics.technical.security_headers));
      }
      
    } else {
      var errorMsg = 'Unknown error';
      
      if (forensicResult) {
        if (forensicResult.error) {
          errorMsg = forensicResult.error;
        } else if (forensicResult.data && forensicResult.data.error) {
          errorMsg = forensicResult.data.error;
        } else if (!forensicResult.ok) {
          errorMsg = 'Fetcher returned ok=false';
          Logger.log('🔍 Full response: ' + JSON.stringify(forensicResult).substring(0, 500));
        }
      } else {
        errorMsg = 'No response from Fetcher';
      }
      
      Logger.log('❌ Forensic scan failed: ' + errorMsg);
      result.dataQuality.fetcherFailed.push('fullScan');
    }
    
  } catch (forensicError) {
    Logger.log('❌ Forensic scan exception: ' + forensicError);
    result.dataQuality.fetcherFailed.push('fullScan');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: API DATA COLLECTION (Unchanged - OpenPageRank, PageSpeed, Serper)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('📥 Phase 2: API data collection...');
  
  // 1. OpenPageRank API (Domain Authority)
  try {
    var oprData = OPENPAGERANK_fetch({ domain: domain });
    if (oprData && oprData.ok) {
      result.rawData.apis.openpagerank = {
        pageRank: oprData.pageRank || oprData.page_rank_decimal || 0,
        rank: oprData.rank || 0,
        domain: domain
      };
      result.dataQuality.apiSuccess.push('openpagerank');
      Logger.log('  ✅ OpenPageRank: ' + result.rawData.apis.openpagerank.pageRank);
    } else {
      result.dataQuality.apiFailed.push('openpagerank');
      Logger.log('  ⚠️ OpenPageRank failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('openpagerank');
    Logger.log('  ❌ OpenPageRank error: ' + e);
  }
  
  // 2. PageSpeed Insights API (Performance Score)
  try {
    var pagespeedData = PAGESPEED_analyze({ url: url });
    if (pagespeedData && pagespeedData.ok) {
      result.rawData.apis.pagespeed = {
        performanceScore: pagespeedData.performanceScore || 0,
        fcp: pagespeedData.firstContentfulPaint || 0,
        lcp: pagespeedData.largestContentfulPaint || 0,
        cls: pagespeedData.cumulativeLayoutShift || 0,
        tbt: pagespeedData.totalBlockingTime || 0
      };
      result.dataQuality.apiSuccess.push('pagespeed');
      Logger.log('  ✅ PageSpeed: ' + result.rawData.apis.pagespeed.performanceScore);
    } else {
      result.dataQuality.apiFailed.push('pagespeed');
      Logger.log('  ⚠️ PageSpeed failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('pagespeed');
    Logger.log('  ❌ PageSpeed error: ' + e);
  }
  
  // 3. Serper API (Keyword & SERP data)
  try {
    var serperData = SERPER_getDomainOverview({ domain: domain });
    if (serperData && serperData.ok) {
      result.rawData.apis.serper = {
        organicKeywords: serperData.organicKeywords || 0,
        paidKeywords: serperData.paidKeywords || 0,
        organicTraffic: serperData.organicTraffic || 0,
        paidTraffic: serperData.paidTraffic || 0,
        serpFeatures: serperData.serpFeatures || [],
        topKeywords: serperData.topKeywords || [],
        rankingDistribution: serperData.rankingDistribution || {},
        organicCompetitors: serperData.competitors || []
      };
      result.dataQuality.apiSuccess.push('serper');
      Logger.log('  ✅ Serper: ' + result.rawData.apis.serper.organicKeywords + ' keywords');
    } else {
      result.dataQuality.apiFailed.push('serper');
      Logger.log('  ⚠️ Serper failed');
    }
  } catch (e) {
    result.dataQuality.apiFailed.push('serper');
    Logger.log('  ❌ Serper error: ' + e);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: Calculate Collection Summary
  // ═══════════════════════════════════════════════════════════════════════════
  
  var elapsedTime = new Date().getTime() - startTime;
  var fetcherSuccessCount = result.dataQuality.fetcherSuccess.length;
  var apiSuccessCount = result.dataQuality.apiSuccess.length;
  var totalModules = 8 + 3; // 8 fetcher modules + 3 APIs
  var completeness = Math.round(((fetcherSuccessCount + apiSuccessCount) / totalModules) * 100);
  
  result.collectionSummary = {
    completeness: completeness,
    fetcherSuccess: fetcherSuccessCount,
    fetcherFailed: result.dataQuality.fetcherFailed.length,
    apiSuccess: apiSuccessCount,
    apiFailed: result.dataQuality.apiFailed.length,
    elapsedMs: elapsedTime
  };
  
  Logger.log('✅ Data collection complete for ' + domain);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  Logger.log('   Fetcher: ' + fetcherSuccessCount + '/8 success');
  Logger.log('   APIs: ' + apiSuccessCount + '/3 success');
  Logger.log('   Completeness: ' + completeness + '%');
  
  return result;
}

/**
 * V6: Batch collector with Forensic Engine
 * Uses one-shot forensic scan for each competitor
 */
function COLLECTOR_gatherBatchData_V6(urls, projectContext) {
  // Validate required parameters
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    Logger.log('❌ Invalid URLs parameter: ' + urls);
    return {
      success: false,
      error: 'URLs parameter must be a non-empty array',
      successCount: 0,
      failCount: 0,
      competitors: {}
    };
  }
  
  Logger.log('🚀 V6 Batch forensic scan for ' + urls.length + ' competitors');
  
  var startTime = new Date().getTime();
  var results = {};
  var successCount = 0;
  var failCount = 0;
  
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var domain = extractDomain_(url);
    var maxRetries = 3;
    var retryCount = 0;
    var success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        var data = COLLECTOR_gatherAllData_V6(url, projectContext);
        if (data && data.domain) {
          results[data.domain] = data;
          successCount++;
          success = true;
        } else {
          failCount++;
          break;
        }
      } catch (e) {
        var errorStr = String(e);
        
        // Check if it's a 429 rate limit error
        if (errorStr.indexOf('429') !== -1 || errorStr.indexOf('rate limit') !== -1) {
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: 5s, 10s, 20s
            var delay = Math.pow(2, retryCount) * 2500;
            Logger.log('⚠️ Rate limited for ' + url + ' (attempt ' + retryCount + '/' + maxRetries + ')');
            Logger.log('   Waiting ' + (delay / 1000) + 's before retry...');
            Utilities.sleep(delay);
          } else {
            Logger.log('❌ Max retries reached for ' + url + ' after ' + retryCount + ' attempts');
            failCount++;
          }
        } else {
          Logger.log('❌ Failed to collect data for ' + url + ': ' + e);
          failCount++;
          break;
        }
      }
    }
    
    // Rate limiting: Wait 5 seconds between requests (prevents 429 errors)
    if (i < urls.length - 1) {
      Utilities.sleep(5000);
    }
  }
  
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('✅ V6 Batch collection complete');
  Logger.log('   Success: ' + successCount + '/' + urls.length);
  Logger.log('   Failed: ' + failCount);
  Logger.log('   Elapsed: ' + elapsedTime + 'ms');
  
  return {
    success: successCount > 0,
    successCount: successCount,
    failCount: failCount,
    elapsedMs: elapsedTime,
    competitors: results
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test data collection for a single URL
 */
function TEST_CollectSingleURL() {
  Logger.log('🧪 Testing Enhanced Data Collector - Single URL');
  
  var testUrl = 'https://ahrefs.com';
  var projectContext = {
    projectId: 'test-project-001',
    targetKeywords: ['seo tools', 'backlink checker'],
    industry: 'SEO Software'
  };
  
  Logger.log('🔍 Collecting rich data for: ' + testUrl);
  
  var result = COLLECTOR_gatherAllData(testUrl, projectContext);
  
  Logger.log('✅ Collection complete!');
  Logger.log('📊 Domain: ' + result.domain);
  Logger.log('📊 Data completeness: ' + result.collectionSummary.completeness + '%');
  Logger.log('📊 Fetcher successes: ' + result.dataQuality.fetcherSuccess.length + '/7');
  Logger.log('📊 API successes: ' + result.dataQuality.apiSuccess.length + '/4');
  
  if (result.rawData.fetcher.headings) {
    Logger.log('📊 Headings found: ' + (result.rawData.fetcher.headings.hierarchy ? result.rawData.fetcher.headings.hierarchy.length : 0));
  }
  
  if (result.rawData.apis.openpagerank && result.rawData.apis.openpagerank.pageRank) {
    Logger.log('📊 Authority Score: ' + result.rawData.apis.openpagerank.pageRank);
  }
  
  Logger.log('✅ Single URL test complete!');
  return result;
}

/**
 * Test batch data collection
 */
function TEST_CollectBatchURLs() {
  Logger.log('🧪 Testing Enhanced Data Collector - Batch Collection');
  
  var testUrls = [
    'https://ahrefs.com',
    'https://semrush.com',
    'https://moz.com'
  ];
  
  var projectContext = {
    projectId: 'test-project-001',
    targetKeywords: ['seo tools'],
    industry: 'SEO Software'
  };
  
  Logger.log('🔍 Collecting data for ' + testUrls.length + ' URLs...');
  
  var result = COLLECTOR_gatherBatchData(testUrls, projectContext);
  
  Logger.log('✅ Batch collection complete!');
  Logger.log('📊 Success count: ' + result.successCount + '/' + testUrls.length);
  Logger.log('📊 Failed count: ' + result.failCount);
  Logger.log('📊 Elapsed time: ' + (result.elapsedMs / 1000).toFixed(1) + 's');
  
  // Log first competitor details
  var firstDomain = Object.keys(result.competitors)[0];
  if (firstDomain) {
    var comp = result.competitors[firstDomain];
    Logger.log('📊 First competitor: ' + firstDomain);
    Logger.log('📊 Data completeness: ' + comp.collectionSummary.completeness + '%');
  }
  
  Logger.log('✅ Batch collection test complete!');
  return result;
}

/**
 * Test end-to-end: Collection + Storage
 * NOTE: Requires unified_competitor_storage.gs to be deployed
 * NOTE: DataBridge is STANDALONE - uses spreadsheet ID, not binding
 */
function TEST_endToEndCollection() {
  Logger.log('🧪 Testing End-to-End: Collection → Storage');
  
  // Check if storage functions exist
  if (typeof STORAGE_saveCompetitorJSON === 'undefined') {
    Logger.log('❌ Error: unified_competitor_storage.gs not deployed yet!');
    Logger.log('⚠️ Please deploy unified_competitor_storage.gs first.');
    return;
  }
  
  var testUrl = 'https://ahrefs.com';
  var projectId = 'test-project-001';
  
  // DATABRIDGE BACKEND: Use explicit spreadsheet ID (not bound to sheet)
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  var projectContext = {
    projectId: projectId,
    targetKeywords: ['seo tools'],
    industry: 'SEO Software'
  };
  
  Logger.log('📋 Using spreadsheet: ' + spreadsheetId);
  
  Logger.log('🔍 Step 1: Collect data...');
  var collectionResult = COLLECTOR_gatherAllData(testUrl, projectContext);
  
  // Check if collection returned an error
  if (collectionResult.error) {
    Logger.log('❌ Collection failed with error: ' + collectionResult.error);
    return;
  }
  
  Logger.log('✅ Collection completed! Completeness: ' + collectionResult.collectionSummary.completeness + '%');
  
  // Warning if completeness is 0 (no fetchers/APIs deployed)
  if (collectionResult.collectionSummary.completeness === 0) {
    Logger.log('⚠️ WARNING: 0% completeness - fetchers and APIs not deployed yet!');
    Logger.log('⚠️ This is EXPECTED if you haven\'t deployed the 11 fetcher/API files yet.');
    Logger.log('⚠️ Deploy files from: fetcher/ and databridge/apis/ folders');
    Logger.log('⚠️ Then re-run this test.');
  }
  
  Logger.log('💾 Step 2: Save to storage...');
  var saveResult = STORAGE_saveCompetitorJSON(
    collectionResult.domain,
    collectionResult.rawData,
    {}, // Empty processed metrics for now
    {}, // Empty AI insights for now
    projectId,
    spreadsheetId
  );
  
  if (!saveResult.success) {
    Logger.log('❌ Save failed: ' + saveResult.error);
    return;
  }
  
  Logger.log('✅ Saved successfully! Row: ' + saveResult.rowNumber);
  
  Logger.log('📖 Step 3: Read back from storage...');
  var readResult = STORAGE_readCompetitorJSON(
    collectionResult.domain,
    projectId,
    spreadsheetId
  );
  
  if (!readResult.success) {
    Logger.log('❌ Read failed!');
    return;
  }
  
  Logger.log('✅ Read successful!');
  Logger.log('📊 Domain: ' + readResult.domain);
  Logger.log('📊 Data completeness: ' + readResult.metadata.dataCompleteness);
  
  // Calculate data size from JSON strings
  var rawDataSize = readResult.rawData ? JSON.stringify(readResult.rawData).length : 0;
  var processedSize = readResult.processedMetrics ? JSON.stringify(readResult.processedMetrics).length : 0;
  var insightsSize = readResult.aiInsights ? JSON.stringify(readResult.aiInsights).length : 0;
  var totalSize = rawDataSize + processedSize + insightsSize;
  
  Logger.log('📊 Data size: ' + (totalSize / 1024).toFixed(2) + ' KB');
  Logger.log('   - Raw data: ' + (rawDataSize / 1024).toFixed(2) + ' KB');
  Logger.log('   - Processed metrics: ' + (processedSize / 1024).toFixed(2) + ' KB');
  Logger.log('   - AI insights: ' + (insightsSize / 1024).toFixed(2) + ' KB');
  
  Logger.log('✅✅✅ End-to-end test PASSED! ✅✅✅');
}

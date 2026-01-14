/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_EliteCompetitorFetcher.gs - HYBRID FETCHING STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ELITE DATA COLLECTION STRATEGY:
 * ✓ Stage 1: PHP Fetcher (best data, no 403, full content + forensics)
 * ✓ Stage 2: Google Custom Search API (indexed pages, snippets)
 * ✓ Stage 3: PageSpeed Insights API (technical metrics)
 * ✓ Stage 4: Serper API (search rankings, SERP features)
 * ✓ Stage 5: OpenPageRank API (domain authority)
 * 
 * All APIs are ALWAYS used for maximum data richness
 * @version 7.0.0-elite-hybrid
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Fetch comprehensive competitor data using hybrid approach
 * @param {string} domain - Competitor domain
 * @param {object} options - Fetch options
 * @return {object} Complete competitor intelligence
 */
function FT_fetchEliteCompetitorData(domain, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`   🎯 ELITE FETCH: ${domain}`);
  Logger.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const result = {
    domain: domain,
    fetchedAt: new Date().toISOString(),
    method: 'hybrid',
    stages: {},
    combinedData: {}
  };
  
  try {
    // Ensure domain has protocol
    const fullUrl = domain.startsWith('http') ? domain : 'https://' + domain;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 1: PHP FETCHER (Primary - Best Data Source)
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [1/5] 🚀 PHP Fetcher (Primary)`);
    
    try {
      const phpResult = callGateway('fetcher_single', {
        url: fullUrl,
        options: {
          extractMetadata: true,
          extractLinks: true,
          extractImages: true,
          extractSchema: true,
          forensicMode: true
        }
      });
      
      if (phpResult && phpResult.success && phpResult.data) {
        result.stages.phpFetcher = {
          success: true,
          data: phpResult.data,
          method: 'php_gateway'
        };
        Logger.log(`      ✅ PHP Fetcher: SUCCESS`);
        Logger.log(`         - Full HTML: ${phpResult.data.content ? 'YES' : 'NO'}`);
        Logger.log(`         - Metadata: ${phpResult.data.metadata ? 'YES' : 'NO'}`);
        Logger.log(`         - Links: ${phpResult.data.links ? phpResult.data.links.length : 0}`);
        Logger.log(`         - Images: ${phpResult.data.images ? phpResult.data.images.length : 0}`);
      } else {
        result.stages.phpFetcher = {
          success: false,
          error: phpResult.error || 'PHP fetcher returned no data'
        };
        Logger.log(`      ⚠️ PHP Fetcher: FAILED (${result.stages.phpFetcher.error})`);
        Logger.log(`      → Will rely on API enrichment`);
      }
    } catch (e) {
      result.stages.phpFetcher = {
        success: false,
        error: e.toString()
      };
      Logger.log(`      ❌ PHP Fetcher: EXCEPTION (${e.toString()})`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 2: GOOGLE CUSTOM SEARCH - DISABLED FOR PERFORMANCE
    // ═══════════════════════════════════════════════════════════════════════
    // Custom Search is redundant with Serper and costs API quota
    // Serper provides better SERP data anyway
    Logger.log(`   [2/4] 🔍 Custom Search API - SKIPPED (using Serper instead)`);
    result.stages.customSearch = {
      success: false,
      skipped: true,
      error: 'Skipped for performance - using Serper instead'
    };
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 3: PAGESPEED INSIGHTS (Always Execute)
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [2/4] ⚡ PageSpeed API (Enrichment)`);
    
    try {
      const pageSpeedResult = FT_callPageSpeedAPI(fullUrl);
      
      if (pageSpeedResult.success) {
        result.stages.pageSpeed = {
          success: true,
          data: pageSpeedResult.data
        };
        Logger.log(`      ✅ PageSpeed: Performance ${(pageSpeedResult.data && pageSpeedResult.data.scores && pageSpeedResult.data.scores.performance) || 0}/100`);
      } else {
        result.stages.pageSpeed = {
          success: false,
          error: pageSpeedResult.error
        };
        Logger.log(`      ⚠️ PageSpeed: ${pageSpeedResult.error}`);
      }
    } catch (e) {
      result.stages.pageSpeed = {
        success: false,
        error: e.toString()
      };
      Logger.log(`      ❌ PageSpeed: EXCEPTION`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 4: SERPER API (Always Execute)
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [3/4] 🔎 Serper API (Enrichment)`);
    
    try {
      const serperResult = FT_callSerperAPI(domain);
      
      if (serperResult.success) {
        result.stages.serper = {
          success: true,
          data: serperResult.data
        };
        const organicCount = (serperResult.data && serperResult.data.organic && serperResult.data.organic.length) || 0;
        Logger.log(`      ✅ Serper: ${organicCount} search results`);
      } else {
        result.stages.serper = {
          success: false,
          error: serperResult.error
        };
        Logger.log(`      ⚠️ Serper: ${serperResult.error}`);
      }
    } catch (e) {
      result.stages.serper = {
        success: false,
        error: e.toString()
      };
      Logger.log(`      ❌ Serper: EXCEPTION`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 5: OPENPAGERANK API (Always Execute)
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   [4/4] 🏆 OpenPageRank API (Enrichment)`);
    
    try {
      const oprResult = FT_callOpenPageRankAPI(domain);
      
      if (oprResult.success) {
        result.stages.openPageRank = {
          success: true,
          data: oprResult.data
        };
        const pageRank = (oprResult.data && oprResult.data.page_rank_decimal) ? oprResult.data.page_rank_decimal : 0;
        Logger.log(`      ✅ OpenPageRank: PageRank ${pageRank}`);
      } else {
        result.stages.openPageRank = {
          success: false,
          error: oprResult.error
        };
        Logger.log(`      ⚠️ OpenPageRank: ${oprResult.error}`);
      }
    } catch (e) {
      result.stages.openPageRank = {
        success: false,
        error: e.toString()
      };
      Logger.log(`      ❌ OpenPageRank: EXCEPTION`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // SYNTHESIS: Combine ALL data sources into unified structure
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🔄 Synthesizing data from all sources...`);
    
    const synthesized = FT_synthesizeEliteData(result.stages, domain);
    result.combinedData = synthesized;
    
    // Determine overall success
    const successfulStages = Object.values(result.stages).filter(s => s.success).length;
    const totalStages = Object.values(result.stages).filter(s => !s.skipped).length;
    result.success = successfulStages > 0;
    result.successRate = `${successfulStages}/${totalStages}`;
    result.executionTime = Date.now() - startTime;
    
    Logger.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    Logger.log(`   ✅ COMPLETE: ${successfulStages}/5 stages successful (${result.executionTime}ms)`);
    Logger.log(``);
    
    return result;
    
  } catch (error) {
    Logger.log(`   ❌ FATAL ERROR: ${error.toString()}`);
    result.success = false;
    result.error = error.toString();
    result.executionTime = Date.now() - startTime;
    return result;
  }
}

/**
 * Call Google Custom Search API directly
 */
function FT_callCustomSearchAPI(domain) {
  try {
    // Try gateway first (has API keys in .env)
    const gatewayResult = callGateway('google_search', {
      query: `site:${domain}`,
      num: 10
    });
    
    if (gatewayResult && gatewayResult.success) {
      // FIXED: Gateway returns data at root level for some endpoints
      // Structure: {success, query, totalResults, searchTime, items: [...]}
      return {
        success: true,
        data: {
          query: gatewayResult.query,
          totalResults: gatewayResult.totalResults || '0',
          searchTime: gatewayResult.searchTime,
          items: gatewayResult.items || gatewayResult.data?.items || []
        }
      };
    }
    
    // Fallback to direct API if gateway doesn't support it
    return {
      success: false,
      error: 'Custom Search not available via gateway'
    };
    
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Call PageSpeed Insights API via gateway
 */
function FT_callPageSpeedAPI(url) {
  try {
    const result = callGateway('pagespeed_analyze', {
      url: url,
      strategy: 'mobile'
    });
    
    if (result && result.success) {
      // FIXED: Gateway returns scores at root level, not in .data
      // Structure: {success, url, strategy, scores: {performance, seo, ...}, metrics, core_web_vitals}
      return {
        success: true,
        data: {
          scores: result.scores || {},
          metrics: result.metrics || {},
          core_web_vitals: result.core_web_vitals || {},
          url: result.url,
          strategy: result.strategy
        }
      };
    }
    
    return {
      success: false,
      error: result.error || 'PageSpeed API failed'
    };
    
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Call Serper API via gateway
 */
function FT_callSerperAPI(domain) {
  try {
    const result = callGateway('serper_search', {
      query: `site:${domain}`,
      params: { num: 10, gl: 'us' }
    });
    
    if (result && result.success) {
      return {
        success: true,
        data: result.data
      };
    }
    
    return {
      success: false,
      error: result.error || 'Serper API failed'
    };
    
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Call OpenPageRank API via gateway
 */
function FT_callOpenPageRankAPI(domain) {
  try {
    const result = callGateway('opr_get_rank', {
      domain: domain
    });
    
    if (result && result.success) {
      // FIXED: Gateway returns rank data at root level, not in .data
      // Structure: {success, domain, page_rank_integer, page_rank_decimal, rank, status_code}
      return {
        success: true,
        data: {
          domain: result.domain,
          page_rank_integer: result.page_rank_integer || 0,
          page_rank_decimal: result.page_rank_decimal || 0,
          rank: result.rank || '0',
          status_code: result.status_code
        }
      };
    }
    
    return {
      success: false,
      error: result.error || 'OpenPageRank API failed'
    };
    
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Synthesize data from all sources into unified structure
 * ENHANCED: Uses Serper as fallback when PHP Fetcher fails
 * Priority: PHP Fetcher > Serper > Custom Search > Defaults
 */
function FT_synthesizeEliteData(stages, domain) {
  const synthesized = {
    domain: domain,
    dataQuality: 'elite', // We have multiple sources
    
    // Website Overview (prioritize PHP fetcher)
    website: {},
    
    // Content Intelligence
    content: {},
    
    // Technical Metrics
    technical: {},
    
    // Authority & Rankings
    authority: {},
    
    // SEO Intelligence
    seo: {},
    
    // Top Indexed Pages (for UI display)
    topPages: []
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRIORITY 1: Extract from PHP Fetcher (best source - full metadata)
  // ═══════════════════════════════════════════════════════════════════════
  let phpDataAvailable = false;
  let phpHasWordCount = false;
  let phpHasSchema = false;
  
  if (stages.phpFetcher && stages.phpFetcher.success && stages.phpFetcher.data) {
    const php = stages.phpFetcher.data;
    const hasTitle = !!(php.metadata && php.metadata.title && php.metadata.title.trim());
    const hasDescription = !!(php.metadata && php.metadata.description && php.metadata.description.trim());
    phpHasWordCount = !!(php.metadata && php.metadata.wordCount && php.metadata.wordCount > 0);
    phpHasSchema = !!(php.schema && php.schema.types && php.schema.types.length > 0);
    
    // Only consider PHP data "available" if we actually got meaningful metadata
    phpDataAvailable = hasTitle || hasDescription || phpHasWordCount;
    
    if (phpDataAvailable) {
      synthesized.website = {
        title: (php.metadata && php.metadata.title) || '',
        description: (php.metadata && php.metadata.description) || '',
        h1: (php.metadata && php.metadata.h1) || '',
        h2: (php.metadata && php.metadata.h2) || [],
        wordCount: (php.metadata && php.metadata.wordCount) || 0,
        language: (php.metadata && php.metadata.language) || 'unknown',
        hasOrganizationSchema: (php.schema && php.schema.hasOrganizationSchema) || false,
        schemaTypes: (php.schema && php.schema.types) || [],
        dataSource: 'PHP Fetcher'
      };
      
      synthesized.content = {
        fullHtml: !!php.content,
        links: php.links || [],
        internalLinks: (php.links && php.links.filter(function(l) { return l.isInternal; })) || [],
        externalLinks: (php.links && php.links.filter(function(l) { return !l.isInternal; })) || [],
        images: php.images || [],
        headings: php.headings || []
      };
      
      Logger.log(`      ✅ PHP Fetcher data extracted: title="${(synthesized.website.title || '').substring(0, 40)}...", wordCount=${synthesized.website.wordCount}`);
    } else {
      Logger.log(`      ⚠️ PHP Fetcher returned empty metadata - will use Serper fallback`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Fallback to Serper organic results for title/description
  // When PHP Fetcher fails, we can still get homepage info from SERP results
  // ═══════════════════════════════════════════════════════════════════════
  if (stages.serper && stages.serper.success && stages.serper.data) {
    const serper = stages.serper.data;
    const organic = serper.organic || [];
    
    // Store organic results for SEO analysis
    synthesized.seo.organic = organic;
    synthesized.seo.indexedPages = organic.length || 0;
    synthesized.seo.serpFeatures = serper.knowledgeGraph ? ['knowledge_graph'] : [];
    synthesized.seo.peopleAlsoAsk = serper.peopleAlsoAsk || [];
    synthesized.seo.relatedSearches = serper.relatedSearches || [];
    synthesized.seo.hasKnowledgeGraph = !!serper.knowledgeGraph;
    
    // Build top pages array with clickable URLs (always available)
    synthesized.topPages = organic.slice(0, 5).map(function(item, index) {
      return {
        position: item.position || (index + 1),
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        displayUrl: item.displayLink || item.link || ''
      };
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // ALWAYS FILL MISSING DATA FROM SERPER - Even if PHP "succeeded" with empty data
    // This ensures we always have title/description from SERP results
    // ═══════════════════════════════════════════════════════════════════════
    if (organic.length > 0) {
      // Find homepage result (usually position 1 or matches domain exactly)
      const homepageResult = organic.find(function(item) {
        const link = (item.link || '').toLowerCase();
        const domainLower = domain.toLowerCase();
        // Match homepage: ends with / or domain name, max 4 path segments
        return link.includes(domainLower) && 
               (link.endsWith('/') || link.endsWith(domainLower) || link.split('/').length <= 4);
      }) || organic[0];
      
      // Initialize website object if it doesn't exist
      if (!synthesized.website || Object.keys(synthesized.website).length === 0) {
        synthesized.website = {};
      }
      
      if (homepageResult) {
        // ALWAYS fill in missing title/description from Serper
        const hadTitle = !!synthesized.website.title;
        const hadDescription = !!synthesized.website.description;
        const hadWordCount = !!(synthesized.website.wordCount && synthesized.website.wordCount > 0);
        
        if (!synthesized.website.title) {
          synthesized.website.title = homepageResult.title || '';
        }
        if (!synthesized.website.description) {
          synthesized.website.description = homepageResult.snippet || '';
        }
        if (!synthesized.website.h1) {
          // Use title as H1 fallback (often the same)
          synthesized.website.h1 = homepageResult.title || '';
        }
        
        // ═══════════════════════════════════════════════════════════════════════
        // WORD COUNT ESTIMATION: When PHP fails, estimate from SERP snippets
        // Average page word counts by industry: 500-2000 words
        // We estimate based on snippet length * multiplier + base count
        // ═══════════════════════════════════════════════════════════════════════
        if (!hadWordCount) {
          // Estimate word count from available content
          const snippetWords = (homepageResult.snippet || '').split(/\s+/).filter(function(w) { return w.length > 0; }).length;
          const titleWords = (homepageResult.title || '').split(/\s+/).filter(function(w) { return w.length > 0; }).length;
          
          // Snippets are typically 150-160 chars, around 25-30 words
          // Pages typically have 20-60x more content than their snippet
          // Use snippet density to estimate: snippet of 30 words → page of ~900-1800 words
          const multiplier = 35; // Conservative middle estimate
          const estimatedWords = Math.max(300, (snippetWords * multiplier) + (titleWords * 5));
          
          synthesized.website.wordCount = estimatedWords;
          synthesized.website.wordCountEstimated = true;
          Logger.log(`      📊 Estimated wordCount: ${estimatedWords} (from ${snippetWords} snippet words)`);
        }
        
        // Set data source based on what we used
        if (!hadTitle && !hadDescription) {
          synthesized.website.dataSource = 'Serper SERP (Fallback)';
          Logger.log(`      ⚡ Serper fallback FULL: title="${(homepageResult.title || '').substring(0, 40)}..."`);
        } else if (!hadTitle || !hadDescription) {
          synthesized.website.dataSource = synthesized.website.dataSource || 'PHP + Serper';
          Logger.log(`      ⚡ Serper filled gaps: title=${!hadTitle}, desc=${!hadDescription}`);
        }
      }
    }
    
    // Knowledge Graph data (if available) - often has more accurate info
    if (serper.knowledgeGraph) {
      const kg = serper.knowledgeGraph;
      // Only override if we still don't have data
      if (!synthesized.website.title && kg.title) {
        synthesized.website.title = kg.title;
        synthesized.website.dataSource = 'Knowledge Graph';
      }
      if (!synthesized.website.description && kg.description) {
        synthesized.website.description = kg.description;
      }
      synthesized.website.hasKnowledgeGraph = true;
      synthesized.website.knowledgeGraphType = kg.type || 'unknown';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRIORITY 3: Custom Search API (indexed pages, additional results)
  // ═══════════════════════════════════════════════════════════════════════
  if (stages.customSearch && stages.customSearch.success && stages.customSearch.data) {
    const search = stages.customSearch.data;
    
    synthesized.seo.totalIndexedPages = parseInt(search.totalResults) || 0;
    synthesized.seo.topRankingPages = search.items || [];
    
    // Extract snippets for content analysis
    if (search.items && search.items.length > 0) {
      synthesized.content.snippets = search.items.map(function(item) { return item.snippet; });
      
      // Add to top pages if Serper didn't provide enough
      if (synthesized.topPages.length < 5) {
        const additionalPages = search.items.slice(0, 5 - synthesized.topPages.length).map(function(item, index) {
          return {
            position: synthesized.topPages.length + index + 1,
            title: item.title || '',
            url: item.link || '',
            snippet: item.snippet || '',
            displayUrl: item.displayLink || item.link || ''
          };
        });
        synthesized.topPages = synthesized.topPages.concat(additionalPages);
      }
      
      // FALLBACK: Use Custom Search for title/description if still missing
      if (!synthesized.website.title && search.items[0]) {
        synthesized.website.title = search.items[0].title || '';
        synthesized.website.description = synthesized.website.description || search.items[0].snippet || '';
        synthesized.website.dataSource = 'Custom Search (Fallback)';
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PageSpeed Insights (Technical Metrics)
  // ═══════════════════════════════════════════════════════════════════════
  if (stages.pageSpeed && stages.pageSpeed.success && stages.pageSpeed.data) {
    const ps = stages.pageSpeed.data;
    
    synthesized.technical = {
      performanceScore: (ps.scores && ps.scores.performance) || 0,
      accessibilityScore: (ps.scores && ps.scores.accessibility) || 0,
      seoScore: (ps.scores && ps.scores.seo) || 0,
      bestPracticesScore: (ps.scores && ps.scores.best_practices) || 0,
      loadTime: (ps.metrics && ps.metrics.largest_contentful_paint) || 'N/A',
      mobileUsability: ps.strategy || 'unknown',
      coreWebVitals: ps.core_web_vitals || {}
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // OpenPageRank (Authority Metrics)
  // ═══════════════════════════════════════════════════════════════════════
  if (stages.openPageRank && stages.openPageRank.success && stages.openPageRank.data) {
    const opr = stages.openPageRank.data;
    
    synthesized.authority = {
      domainRank: opr.rank || 0,
      pageRank: opr.page_rank_decimal || 0,
      backlinks: 0, // Not provided by OpenPageRank API
      referringDomains: 0 // Not provided by OpenPageRank API
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // FINAL CLEANUP: Ensure no N/A values, use descriptive fallbacks
  // ═══════════════════════════════════════════════════════════════════════
  if (!synthesized.website.title) {
    synthesized.website.title = domain + ' - Homepage';
    synthesized.website.dataSource = 'Generated (No Data)';
  }
  if (!synthesized.website.description) {
    synthesized.website.description = 'Visit ' + domain + ' for more information.';
  }
  if (!synthesized.website.h1) {
    synthesized.website.h1 = synthesized.website.title;
  }
  
  Logger.log(`      📊 Synthesized: title="${(synthesized.website.title || '').substring(0, 40)}", topPages=${synthesized.topPages.length}, source=${synthesized.website.dataSource || 'Mixed'}`);
  
  return synthesized;
}

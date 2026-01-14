/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_CompetitorAPIFetcher.gs - LEGAL COMPETITOR DATA COLLECTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * GOOGLE TOS COMPLIANT APPROACH:
 * Instead of direct scraping (which violates ToS and triggers 403s), we use:
 * ✓ Google Custom Search API - Get indexed content legally
 * ✓ PageSpeed Insights API - Technical metrics
 * ✓ Structured data from search results - Meta info, snippets
 * ✓ Public APIs only - No scraping, no bot detection issues
 * 
 * This approach:
 * ✓ Complies with Google ToS
 * ✓ No 403 errors (using official APIs)
 * ✓ No "Argument too large" (API returns structured JSON)
 * ✓ Faster (no retry loops, no delays)
 * ✓ More reliable (Google's infrastructure)
 * 
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Fetch competitor data using LEGAL API-only approach
 * @param {string} domain - Competitor domain
 * @param {object} options - Fetch options
 * @return {object} Comprehensive competitor data
 */
function FT_fetchCompetitorViaAPI(domain, options) {
  const startTime = Date.now();
  options = options || {};
  
  Logger.log(`   📡 API-based fetch: ${domain}`);
  
  const result = {
    ok: false,
    domain: domain,
    method: 'api',
    fetchedAt: new Date().toISOString(),
    data: {}
  };
  
  try {
    // Ensure domain has protocol
    const fullUrl = domain.startsWith('http') ? domain : 'https://' + domain;
    
    // ═══════════════════════════════════════════════════════════════
    // METHOD 1: Google Custom Search API (get indexed content)
    // ═══════════════════════════════════════════════════════════════
    Logger.log(`      [1/3] Custom Search API...`);
    const searchData = fetchViaCustomSearch(domain);
    if (searchData.ok) {
      result.data.search = searchData.data;
      Logger.log(`      ✅ Custom Search: ${searchData.data.totalResults || 0} results`);
    } else {
      Logger.log(`      ⚠️  Custom Search: ${searchData.error}`);
      result.data.search = { error: searchData.error };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // METHOD 2: PageSpeed Insights API (technical metrics)
    // ═══════════════════════════════════════════════════════════════
    Logger.log(`      [2/3] PageSpeed API...`);
    const pageSpeedData = fetchViaPageSpeed(fullUrl);
    if (pageSpeedData.ok) {
      result.data.pageSpeed = pageSpeedData.data;
      Logger.log(`      ✅ PageSpeed: ${pageSpeedData.data.performanceScore || 0}/100`);
    } else {
      Logger.log(`      ⚠️  PageSpeed: ${pageSpeedData.error}`);
      result.data.pageSpeed = { error: pageSpeedData.error };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // METHOD 3: Serper API (search rankings & SERP features)
    // ═══════════════════════════════════════════════════════════════
    Logger.log(`      [3/3] Serper API...`);
    const serperData = fetchViaSerper(domain);
    if (serperData.ok) {
      result.data.serper = serperData.data;
      Logger.log(`      ✅ Serper: ${serperData.data.resultsCount || 0} results`);
    } else {
      Logger.log(`      ⚠️  Serper: ${serperData.error}`);
      result.data.serper = { error: serperData.error };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SYNTHESIZE COMPREHENSIVE DATA
    // ═══════════════════════════════════════════════════════════════
    const synthesized = synthesizeCompetitorData(result.data, domain);
    result.synthesized = synthesized;
    
    // Mark as successful if we got at least one API response
    result.ok = searchData.ok || pageSpeedData.ok || serperData.ok;
    result.executionTime = Date.now() - startTime;
    
    Logger.log(`      ✅ Complete (${result.executionTime}ms)`);
    
    return result;
    
  } catch (error) {
    Logger.log(`      ❌ Exception: ${error.toString()}`);
    result.error = error.toString();
    result.executionTime = Date.now() - startTime;
    return result;
  }
}

/**
 * Fetch via Google Custom Search API
 * Returns indexed content, meta descriptions, titles, snippets
 */
function fetchViaCustomSearch(domain) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_API_KEY');
    const searchEngineId = PropertiesService.getScriptProperties().getProperty('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      return {
        ok: false,
        error: 'Google API credentials not configured'
      };
    }
    
    // Search for site:domain to get indexed pages
    const query = `site:${domain}`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    
    if (statusCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      return {
        ok: true,
        data: {
          totalResults: data.searchInformation?.totalResults || 0,
          items: (data.items || []).map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            displayLink: item.displayLink,
            pagemap: item.pagemap || {}
          }))
        }
      };
    } else {
      return {
        ok: false,
        error: `HTTP ${statusCode}: ${response.getContentText()}`
      };
    }
    
  } catch (error) {
    return {
      ok: false,
      error: error.toString()
    };
  }
}

/**
 * Fetch via PageSpeed Insights API
 * Returns performance metrics, accessibility, SEO scores
 */
function fetchViaPageSpeed(url) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_API_KEY');
    
    if (!apiKey) {
      return {
        ok: false,
        error: 'Google API key not configured'
      };
    }
    
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = UrlFetchApp.fetch(apiUrl, {
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    
    if (statusCode === 200) {
      const data = JSON.parse(response.getContentText());
      const lighthouse = data.lighthouseResult || {};
      const categories = lighthouse.categories || {};
      
      return {
        ok: true,
        data: {
          performanceScore: Math.round((categories.performance?.score || 0) * 100),
          accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
          bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
          seoScore: Math.round((categories.seo?.score || 0) * 100),
          loadingExperience: data.loadingExperience,
          finalUrl: lighthouse.finalUrl,
          fetchTime: lighthouse.fetchTime
        }
      };
    } else {
      return {
        ok: false,
        error: `HTTP ${statusCode}`
      };
    }
    
  } catch (error) {
    return {
      ok: false,
      error: error.toString()
    };
  }
}

/**
 * Fetch via Serper API
 * Returns search rankings, SERP features, backlinks estimate
 */
function fetchViaSerper(domain) {
  try {
    // Use gateway to call Serper
    const result = callGateway('serper_search', {
      query: `site:${domain}`,
      params: { num: 10, gl: 'us' }
    });
    
    if (result.success && result.data) {
      return {
        ok: true,
        data: {
          resultsCount: result.data.searchInformation?.totalResults || 0,
          organic: result.data.organic || [],
          peopleAlsoAsk: result.data.peopleAlsoAsk || [],
          relatedSearches: result.data.relatedSearches || []
        }
      };
    } else {
      return {
        ok: false,
        error: result.error || 'Serper API failed'
      };
    }
    
  } catch (error) {
    return {
      ok: false,
      error: error.toString()
    };
  }
}

/**
 * Synthesize comprehensive competitor intelligence from API data
 */
function synthesizeCompetitorData(apiData, domain) {
  const synthesized = {
    domain: domain,
    
    // Website Overview
    website: {
      title: 'N/A',
      description: 'N/A',
      h1: 'N/A',
      indexedPages: 0,
      primaryTopics: []
    },
    
    // Content Intelligence
    content: {
      snippets: [],
      commonKeywords: [],
      contentThemes: [],
      topPages: []
    },
    
    // Technical Metrics
    technical: {
      performanceScore: 0,
      accessibilityScore: 0,
      seoScore: 0,
      bestPracticesScore: 0,
      loadTime: 'N/A'
    },
    
    // Authority & Rankings
    authority: {
      estimatedIndexedPages: 0,
      topRankingPages: [],
      serpFeatures: []
    }
  };
  
  try {
    // Extract from Custom Search
    if (apiData.search && apiData.search.items) {
      const items = apiData.search.items;
      
      if (items.length > 0) {
        // Use first result for homepage data
        const homepage = items[0];
        synthesized.website.title = homepage.title || 'N/A';
        synthesized.website.description = homepage.snippet || 'N/A';
        
        // Extract meta description from pagemap
        if (homepage.pagemap?.metatags && homepage.pagemap.metatags[0]) {
          const meta = homepage.pagemap.metatags[0];
          synthesized.website.description = meta['og:description'] || meta.description || homepage.snippet;
          synthesized.website.h1 = meta['og:title'] || homepage.title;
        }
      }
      
      synthesized.website.indexedPages = parseInt(apiData.search.totalResults) || 0;
      
      // Collect snippets and top pages
      items.forEach(item => {
        synthesized.content.snippets.push(item.snippet);
        synthesized.content.topPages.push({
          url: item.link,
          title: item.title,
          snippet: item.snippet
        });
      });
      
      // Extract common keywords from snippets
      const allText = synthesized.content.snippets.join(' ').toLowerCase();
      const words = allText.split(/\s+/).filter(w => w.length > 4);
      const wordCount = {};
      words.forEach(w => {
        wordCount[w] = (wordCount[w] || 0) + 1;
      });
      
      synthesized.content.commonKeywords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
    }
    
    // Extract from PageSpeed
    if (apiData.pageSpeed && !apiData.pageSpeed.error) {
      synthesized.technical.performanceScore = apiData.pageSpeed.performanceScore || 0;
      synthesized.technical.accessibilityScore = apiData.pageSpeed.accessibilityScore || 0;
      synthesized.technical.seoScore = apiData.pageSpeed.seoScore || 0;
      synthesized.technical.bestPracticesScore = apiData.pageSpeed.bestPracticesScore || 0;
      synthesized.technical.loadTime = apiData.pageSpeed.fetchTime || 'N/A';
    }
    
    // Extract from Serper
    if (apiData.serper && apiData.serper.organic) {
      synthesized.authority.estimatedIndexedPages = apiData.serper.resultsCount || 0;
      synthesized.authority.topRankingPages = apiData.serper.organic.slice(0, 5).map(result => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet
      }));
      
      // SERP features
      if (apiData.serper.peopleAlsoAsk) {
        synthesized.authority.serpFeatures.push('People Also Ask');
      }
      if (apiData.serper.relatedSearches) {
        synthesized.authority.serpFeatures.push('Related Searches');
      }
    }
    
  } catch (error) {
    Logger.log(`      ⚠️  Synthesis error: ${error.toString()}`);
  }
  
  return synthesized;
}

/**
 * Setup function - Configure Google API credentials
 * Run this once to set your API keys
 */
function setupGoogleAPICredentials() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔑 GOOGLE API CREDENTIALS SETUP');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('To use the API-based fetcher, you need:');
  Logger.log('');
  Logger.log('1. Google API Key');
  Logger.log('   → Go to: https://console.cloud.google.com/apis/credentials');
  Logger.log('   → Create API Key');
  Logger.log('   → Enable: Custom Search API & PageSpeed Insights API');
  Logger.log('');
  Logger.log('2. Custom Search Engine ID');
  Logger.log('   → Go to: https://programmablesearchengine.google.com/');
  Logger.log('   → Create search engine');
  Logger.log('   → Search the entire web: ON');
  Logger.log('   → Copy the Search Engine ID (cx parameter)');
  Logger.log('');
  Logger.log('3. Set credentials (run these commands):');
  Logger.log('');
  Logger.log('PropertiesService.getScriptProperties().setProperty("GOOGLE_API_KEY", "YOUR_API_KEY");');
  Logger.log('PropertiesService.getScriptProperties().setProperty("GOOGLE_SEARCH_ENGINE_ID", "YOUR_CX_ID");');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  // Check current status
  const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_API_KEY');
  const cxId = PropertiesService.getScriptProperties().getProperty('GOOGLE_SEARCH_ENGINE_ID');
  
  Logger.log('');
  Logger.log('CURRENT STATUS:');
  Logger.log(`   Google API Key: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  Logger.log(`   Search Engine ID: ${cxId ? '✅ Set' : '❌ Not set'}`);
  
  return {
    configured: !!(apiKey && cxId),
    apiKey: apiKey ? 'Set (hidden)' : 'Not set',
    searchEngineId: cxId ? 'Set (hidden)' : 'Not set'
  };
}

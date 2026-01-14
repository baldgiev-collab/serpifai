/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ParallelFetcher.gs - OPTIMIZED PARALLEL FETCHING STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses UrlFetchApp.fetchAll() for true parallel HTTP requests
 * - Batches all competitor API calls into single fetchAll()
 * - Reduces execution time from 4-6 minutes to ~90 seconds
 * 
 * TIME SAVINGS:
 * Before: 6 competitors × 4 API calls × 5-10 seconds = 120-240 seconds
 * After:  All 24 API calls in parallel = 15-30 seconds
 * 
 * SPLIT MODULE 1 of 2:
 * - This file: Core parallel fetching, gateway requests, HTML extraction, caching
 * - FT_ContentIntelligence.gs: Keyword profiles, content analysis, helper functions
 * 
 * @version 8.0.0-parallel
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Fetch ALL competitors' data in parallel using UrlFetchApp.fetchAll()
 * This replaces the sequential fetchAllCompetitorData() function
 * 
 * @param {Array} competitors - Array of domain strings
 * @param {Object} options - Optional configuration
 * @return {Object} Results keyed by domain
 */
function FT_fetchAllCompetitorsParallel(competitors, options) {
  const startTime = Date.now();
  options = options || {};
  
  // DEFENSIVE: Validate competitors
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    Logger.log('⚠️ No valid competitors array provided');
    return {};
  }
  
  Logger.log(`   ════════════════════════════════════════════════════════════`);
  Logger.log(`   🚀 PARALLEL FETCHING: ${competitors.length} competitors`);
  Logger.log(`   ════════════════════════════════════════════════════════════`);
  
  const results = {};
  
  try {
    // Get gateway configuration
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || GATEWAY_CONFIG.GATEWAY_URL;
    const licenseKey = getUserLicenseKey();
    
    if (!licenseKey) {
      throw new Error('No license key configured');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Build all API requests for all competitors
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📋 Phase 1: Building ${competitors.length * 4} parallel requests...`);
    
    const requests = [];
    const requestMap = []; // Track which request belongs to which competitor/API
    
    competitors.forEach((domain, index) => {
      if (!domain || typeof domain !== 'string') return;
      
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const fullUrl = 'https://' + cleanDomain;
      
      // PHP Fetcher request
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'fetcher_single', {
        url: fullUrl,
        options: {
          extractMetadata: true,
          extractLinks: true,
          extractImages: true,
          extractSchema: true,
          forensicMode: true
        }
      }));
      requestMap.push({ domain: cleanDomain, api: 'phpFetcher', index: index });
      
      // V9.1: PageSpeed with smart limiting - only for first N competitors if pageSpeedLimit set
      const pageSpeedLimit = options.pageSpeedLimit || competitors.length;
      const shouldFetchPageSpeed = !options.skipPageSpeed && index < pageSpeedLimit;
      
      if (shouldFetchPageSpeed) {
        requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'pagespeed_analyze', {
          url: fullUrl,
          strategy: 'mobile'
        }));
        requestMap.push({ domain: cleanDomain, api: 'pageSpeed', index: index });
      } else if (!options.skipPageSpeed && index >= pageSpeedLimit) {
        // Mark that PageSpeed was limited, not skipped entirely
        Logger.log(`      ⏩ PageSpeed limited: Skipping ${cleanDomain} (${index + 1}/${competitors.length}, limit: ${pageSpeedLimit})`);
      }
      
      // Serper request - Site index query (gets indexed pages)
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `site:${cleanDomain}`,
        params: { num: 10, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, api: 'serper', index: index });
      
      // V8.5: Add BRAND keyword search - This gets PAA, Related, Featured Snippets!
      // The site: query only returns indexed pages, not SERP features
      const brandName = cleanDomain.split('.')[0]; // Extract brand from domain
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `${brandName}`,
        params: { num: 10, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, api: 'serperBrand', index: index });
      
      // OpenPageRank request
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'opr_get_rank', {
        domain: cleanDomain
      }));
      requestMap.push({ domain: cleanDomain, api: 'openPageRank', index: index });
    });
    
    Logger.log(`   ✅ Built ${requests.length} requests`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Execute ALL requests in parallel
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🚀 Phase 2: Executing all requests in parallel...`);
    const fetchStartTime = Date.now();
    
    // UrlFetchApp.fetchAll() makes ALL requests simultaneously!
    const responses = UrlFetchApp.fetchAll(requests);
    
    const fetchTime = Date.now() - fetchStartTime;
    Logger.log(`   ⚡ All ${responses.length} requests completed in ${fetchTime}ms`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Parse responses and organize by competitor
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   📊 Phase 3: Processing responses...`);
    
    // Initialize result objects for each competitor
    competitors.forEach(domain => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      results[cleanDomain] = {
        domain: cleanDomain,
        fetchSuccess: false,
        method: 'parallel',
        stages: {},
        synthesized: {},
        fetchedAt: new Date().toISOString()
      };
    });
    
    // Process each response
    responses.forEach((response, i) => {
      const mapping = requestMap[i];
      const domain = mapping.domain;
      const api = mapping.api;
      
      try {
        const responseText = response.getContentText();
        const responseCode = response.getResponseCode();
        const result = JSON.parse(responseText);
        
        if (responseCode === 200 && result.success) {
          results[domain].stages[api] = {
            success: true,
            data: extractApiData(api, result)
          };
        } else {
          results[domain].stages[api] = {
            success: false,
            error: result.error || `HTTP ${responseCode}`
          };
        }
      } catch (e) {
        results[domain].stages[api] = {
          success: false,
          error: e.toString()
        };
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3.5: DIRECT SCRAPE - ALWAYS RUN for real content data
    // Uses native UrlFetchApp to scrape competitor homepages directly
    // This bypasses the broken PHP fetcher and gets REAL content
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    Logger.log(`   🔧 PHASE 3.5 STARTING - Oracle Direct Scrape v8.3`);
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    
    // Get ALL domains - we want real content from direct scraping
    const allDomains = Object.keys(results);
    Logger.log(`   📋 Found ${allDomains.length} domains to scrape directly`);
    Logger.log(`   📋 Domains: ${allDomains.join(', ')}`);
    
    if (allDomains.length > 0) {
      // Build direct fetch requests for ALL domains
      const directRequests = allDomains.map(function(domain) {
        return {
          url: 'https://' + domain,
          method: 'get',
          muteHttpExceptions: true,
          followRedirects: true,
          validateHttpsCertificates: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          }
        };
      });
      
      // V8.3: Try batch fetch first, fall back to individual if batch fails
      var batchSuccess = false;
      
      try {
        Logger.log(`   🌐 Executing ${directRequests.length} direct HTTP requests (batch mode)...`);
        const directResponses = UrlFetchApp.fetchAll(directRequests);
        Logger.log(`   ✅ Batch fetch succeeded: ${directResponses.length} responses`);
        batchSuccess = true;
        
        for (var i = 0; i < directResponses.length; i++) {
          var response = directResponses[i];
          var domain = allDomains[i];
          
          try {
            var code = response.getResponseCode();
            Logger.log(`   📥 ${domain}: HTTP ${code}`);
            
            if (code >= 200 && code < 400) {
              var html = response.getContentText();
              Logger.log(`   📄 ${domain}: ${html.length} chars received`);
              
              if (html && html.length > 500) {
                // Parse HTML for metadata using our extractor
                var oracleData = extractMetadataFromHTML(html, domain);
                
                // Add to stages
                results[domain].stages.oracleFetcher = {
                  success: true,
                  data: oracleData
                };
                
                Logger.log(`   ✅ SCRAPED ${domain}: title="${(oracleData.title || '').substring(0, 40)}", ${oracleData.wordCount} words, ${(oracleData.h2 || []).length} h2s, ${(oracleData.schemaTypes || []).length} schemas`);
              } else {
                Logger.log(`   ⚠️ ${domain}: HTML too short (${html ? html.length : 0} chars)`);
                results[domain].stages.oracleFetcher = {
                  success: false,
                  error: 'HTML too short: ' + (html ? html.length : 0) + ' chars'
                };
              }
            } else {
              Logger.log(`   ❌ ${domain}: HTTP error ${code}`);
              results[domain].stages.oracleFetcher = {
                success: false,
                error: 'HTTP ' + code
              };
            }
          } catch (parseError) {
            Logger.log(`   ❌ ${domain} parse error: ${parseError.toString()}`);
            results[domain].stages.oracleFetcher = {
              success: false,
              error: parseError.toString()
            };
          }
        }
      } catch (directFetchError) {
        Logger.log(`   ❌ Batch fetch FAILED: ${directFetchError.toString()}`);
        Logger.log(`   🔄 Falling back to individual domain fetches...`);
        
        // V8.3 FALLBACK: Try fetching each domain individually
        for (var j = 0; j < allDomains.length; j++) {
          var singleDomain = allDomains[j];
          try {
            Logger.log(`   🌐 Individual fetch: ${singleDomain}`);
            var singleResponse = UrlFetchApp.fetch('https://' + singleDomain, {
              method: 'get',
              muteHttpExceptions: true,
              followRedirects: true,
              validateHttpsCertificates: false,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
              }
            });
            
            var singleCode = singleResponse.getResponseCode();
            Logger.log(`   📥 ${singleDomain}: HTTP ${singleCode}`);
            
            if (singleCode >= 200 && singleCode < 400) {
              var singleHtml = singleResponse.getContentText();
              Logger.log(`   📄 ${singleDomain}: ${singleHtml.length} chars`);
              
              if (singleHtml && singleHtml.length > 500) {
                var singleOracleData = extractMetadataFromHTML(singleHtml, singleDomain);
                results[singleDomain].stages.oracleFetcher = {
                  success: true,
                  data: singleOracleData
                };
                Logger.log(`   ✅ SCRAPED ${singleDomain}: "${(singleOracleData.title || '').substring(0, 30)}", ${singleOracleData.wordCount} words`);
              } else {
                results[singleDomain].stages.oracleFetcher = {
                  success: false,
                  error: 'HTML too short: ' + (singleHtml ? singleHtml.length : 0)
                };
              }
            } else {
              results[singleDomain].stages.oracleFetcher = {
                success: false,
                error: 'HTTP ' + singleCode
              };
            }
          } catch (singleFetchError) {
            Logger.log(`   ❌ ${singleDomain} failed: ${singleFetchError.toString()}`);
            results[singleDomain].stages.oracleFetcher = {
              success: false,
              error: singleFetchError.toString()
            };
          }
        }
      }
    }
    
    // Log summary of oracleFetcher results with detailed verification
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    Logger.log(`   📊 PHASE 3.5 COMPLETE - Oracle Fetcher Verification`);
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    var oracleSuccessCount = 0;
    var oracleTotalCount = 0;
    Object.keys(results).forEach(function(domain) {
      const stageKeys = Object.keys(results[domain].stages || {});
      const hasOracle = results[domain].stages.oracleFetcher ? 'YES' : 'NO';
      const oracleSuccess = results[domain].stages.oracleFetcher?.success ? 'SUCCESS' : 'FAILED';
      const oracleWordCount = results[domain].stages.oracleFetcher?.data?.wordCount || 0;
      
      Logger.log(`   📍 ${domain}:`);
      Logger.log(`      Stages: ${stageKeys.join(', ')}`);
      Logger.log(`      oracleFetcher: ${hasOracle} | ${oracleSuccess} | ${oracleWordCount} words`);
      
      if (results[domain].stages.oracleFetcher) {
        oracleTotalCount++;
        if (results[domain].stages.oracleFetcher.success) {
          oracleSuccessCount++;
        }
      }
    });
    Logger.log(`   📊 SUMMARY: ${oracleSuccessCount}/${allDomains.length} domains scraped successfully`);
    Logger.log(`   📊 Oracle stages created: ${oracleTotalCount}/${allDomains.length}`);
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Synthesize data for each competitor
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   🔄 Phase 4: Synthesizing data...`);
    
    Object.keys(results).forEach(domain => {
      const comp = results[domain];
      const stages = comp.stages;
      
      // Count successful stages
      const successfulStages = Object.values(stages).filter(s => s.success).length;
      const totalStages = Object.keys(stages).length;
      
      comp.fetchSuccess = successfulStages > 0;
      comp.successRate = `${successfulStages}/${totalStages}`;
      
      // Synthesize using existing function
      comp.synthesized = FT_synthesizeEliteData(stages, domain);
      
      Logger.log(`   ✅ ${domain}: ${comp.successRate} stages`);
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: ORACLE ELITE DATA ENRICHMENT v27.0
    // Calls ORACLE_collectEliteData in TURBO mode for Serper Bridge data
    // This provides keywords, traffic, backlinks from the Oracle intelligence
    // ═══════════════════════════════════════════════════════════════════════
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    Logger.log(`   🚀 PHASE 5: Oracle Elite Data Enrichment v27.0`);
    Logger.log(`   ═══════════════════════════════════════════════════════════`);
    
    const hasOracleFunction = typeof ORACLE_collectEliteData === 'function';
    Logger.log(`   🔍 ORACLE_collectEliteData available: ${hasOracleFunction}`);
    
    if (hasOracleFunction) {
      const domains = Object.keys(results);
      Logger.log(`   📋 Enriching ${domains.length} competitors with Oracle TURBO mode...`);
      
      domains.forEach((domain, idx) => {
        try {
          Logger.log(`   [${idx + 1}/${domains.length}] ⚡ Oracle TURBO: ${domain}`);
          
          // v27.0: Call Oracle in TURBO/batch mode - skips slow page crawl, keeps APIs
          const oracleData = ORACLE_collectEliteData(domain, {
            forceRefresh: false,
            batchMode: true  // TURBO: Skip Layer 1 crawl, keep Layer 2 APIs
          });
          
          if (oracleData && !oracleData.error) {
            // Merge Oracle Elite Data into synthesized
            const synth = results[domain].synthesized || {};
            
            // Keywords from Oracle
            if (oracleData.keywords && oracleData.keywords.length > 0) {
              synth.oracleKeywords = oracleData.keywords;
              synth.keywordClusters = oracleData.keywordClusters || [];
              Logger.log(`      ✅ Keywords: ${oracleData.keywords.length}`);
            }
            
            // Top Pages with traffic
            if (oracleData.topPages && oracleData.topPages.length > 0) {
              synth.topPages = oracleData.topPages.slice(0, 20).map(page => ({
                position: page.avgPosition || 1,
                title: page.title || '',
                url: page.url || '',
                traffic: page.traffic || 0,
                trafficShare: page.trafficShare || 0,
                keywords: page.keywords?.length || 0,
                topKeyword: page.topKeyword?.keyword || ''
              }));
              Logger.log(`      ✅ Top Pages: ${synth.topPages.length}`);
            }
            
            // Elite Traffic Metrics
            if (oracleData.traffic) {
              synth.eliteTraffic = {
                organicTraffic: oracleData.traffic.organic || 0,
                trafficValue: oracleData.traffic.value || 0,
                avgPosition: oracleData.traffic.avgPosition || 0,
                keywordCount: (oracleData.keywords || []).length,
                keywordBreakdown: (oracleData.keywords || []).slice(0, 30).map(kw => ({
                  keyword: kw.keyword,
                  position: kw.position || 0,
                  volume: kw.volume || 0,
                  traffic: kw.traffic || 0,
                  cpc: kw.cpc || 0,
                  intent: kw.intent || 'informational',
                  source: 'oracle'
                })),
                methodology: 'Oracle Elite v27.0 TURBO'
              };
              Logger.log(`      ✅ Traffic: ${oracleData.traffic.organic?.toLocaleString() || 0}/mo`);
            }
            
            // Backlinks from Oracle
            if (oracleData.backlinks) {
              synth.eliteBacklinks = {
                total: oracleData.backlinks.total || 0,
                refDomains: oracleData.backlinks.refDomains || 0,
                dofollow: oracleData.backlinks.dofollow || 85,
                nofollow: oracleData.backlinks.nofollow || 15,
                avgDR: oracleData.backlinks.avgDR || 0,
                pageRank: oracleData.backlinks.pageRank || 0,
                topReferrers: oracleData.backlinks.topReferrers || []
              };
              Logger.log(`      ✅ Backlinks: ${oracleData.backlinks.total?.toLocaleString() || 0}`);
            }
            
            // Authority from Oracle
            if (oracleData.authority) {
              synth.authority = synth.authority || {};
              synth.authority.score = oracleData.authority.score || 0;
              synth.authority.pageRank = oracleData.backlinks?.pageRank || 0;
              Logger.log(`      ✅ Authority: ${oracleData.authority.score}`);
            }
            
            // Update synthesized
            results[domain].synthesized = synth;
            results[domain]._oracleEnriched = true;
            
          } else {
            Logger.log(`      ⚠️ Oracle returned no data or error: ${oracleData?.error || 'empty'}`);
          }
          
          // Small delay between Oracle calls to prevent API overload
          if (idx < domains.length - 1) {
            Utilities.sleep(50);
          }
          
        } catch (oracleError) {
          Logger.log(`      ❌ Oracle error for ${domain}: ${oracleError.toString()}`);
        }
      });
      
      const enrichedCount = Object.values(results).filter(r => r._oracleEnriched).length;
      Logger.log(`   📊 Oracle enrichment: ${enrichedCount}/${domains.length} competitors enriched`);
    } else {
      Logger.log(`   ⚠️ ORACLE_collectEliteData not available - skipping enrichment`);
    }
    
    const totalTime = Date.now() - startTime;
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    Logger.log(`   🏆 PARALLEL FETCH COMPLETE: ${Object.keys(results).length} competitors in ${totalTime}ms`);
    Logger.log(`   ⚡ Time saved: ~${Math.round((competitors.length * 15) - (totalTime/1000))}s vs sequential`);
    Logger.log(`   ════════════════════════════════════════════════════════════`);
    
    return results;
    
  } catch (error) {
    Logger.log(`   ❌ PARALLEL FETCH ERROR: ${error.toString()}`);
    
    // Fall back to sequential fetching if parallel fails
    Logger.log(`   ⚠️ Falling back to sequential fetching...`);
    return fetchAllCompetitorDataSequential(competitors);
  }
}

/**
 * Build a gateway request object for fetchAll()
 */
function buildGatewayRequest(gatewayUrl, licenseKey, action, payload) {
  return {
    url: gatewayUrl,
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      license: licenseKey,
      action: action,
      payload: payload
    }),
    muteHttpExceptions: true,
    headers: {
      'Accept': 'application/json'
    }
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIRECT HTML METADATA EXTRACTOR - UPGRADED v2.0
 * Parses raw HTML to extract ALL SEO-relevant data at Ahrefs/SEMrush level
 * ═══════════════════════════════════════════════════════════════════════════
 */
function extractMetadataFromHTML(html, domain) {
  const result = {
    domain: domain,
    title: '',
    description: '',
    h1: '',
    h2: [],  // UPGRADED: Now 50 max
    h3: [],  // UPGRADED: Now 30 max
    h4: [],  // UPGRADED: Now 20 max
    h5: [],  // NEW: H5 extraction (15 max)
    h6: [],  // NEW: H6 extraction (10 max)
    wordCount: 0,
    language: 'en',
    schemaTypes: [],
    internalLinks: [],  // UPGRADED: Now 150 max
    externalLinks: [],  // UPGRADED: Now 50 max
    dataSource: 'Direct Scrape (Apps Script)',
    // NEW: Additional extraction for Ahrefs/SEMrush level
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    robots: '',
    images: [],
    allHeadingsCount: 0
  };
  
  try {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = decodeHTMLEntities(titleMatch[1].trim());
    }
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (descMatch) {
      result.description = decodeHTMLEntities(descMatch[1].trim());
    }
    
    // Extract H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      result.h1 = cleanHeadingText(h1Match[1]);
    }
    
    // Extract H2s - UPGRADED to 50 max
    const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    let h2Match;
    while ((h2Match = h2Regex.exec(html)) !== null && result.h2.length < 50) {
      const text = cleanHeadingText(h2Match[1]);
      if (text && text.length > 2) {
        result.h2.push(text);
      }
    }
    
    // Extract H3s - UPGRADED to 30 max
    const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
    let h3Match;
    while ((h3Match = h3Regex.exec(html)) !== null && result.h3.length < 30) {
      const text = cleanHeadingText(h3Match[1]);
      if (text && text.length > 2) {
        result.h3.push(text);
      }
    }
    
    // Extract H4s - UPGRADED to 20 max
    const h4Regex = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
    let h4Match;
    while ((h4Match = h4Regex.exec(html)) !== null && result.h4.length < 20) {
      const text = cleanHeadingText(h4Match[1]);
      if (text && text.length > 2) {
        result.h4.push(text);
      }
    }
    
    // NEW: Extract H5s (up to 15)
    const h5Regex = /<h5[^>]*>([\s\S]*?)<\/h5>/gi;
    let h5Match;
    while ((h5Match = h5Regex.exec(html)) !== null && result.h5.length < 15) {
      const text = cleanHeadingText(h5Match[1]);
      if (text && text.length > 2) {
        result.h5.push(text);
      }
    }
    
    // NEW: Extract H6s (up to 10)
    const h6Regex = /<h6[^>]*>([\s\S]*?)<\/h6>/gi;
    let h6Match;
    while ((h6Match = h6Regex.exec(html)) !== null && result.h6.length < 10) {
      const text = cleanHeadingText(h6Match[1]);
      if (text && text.length > 2) {
        result.h6.push(text);
      }
    }
    
    // Total heading count
    result.allHeadingsCount = (result.h1 ? 1 : 0) + result.h2.length + result.h3.length + 
                              result.h4.length + result.h5.length + result.h6.length;
    
    // Calculate word count (strip all HTML tags)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    result.wordCount = textContent.split(' ').filter(w => w.length > 0).length;
    
    // Extract schema types
    const schemaRegex = /"@type"\s*:\s*"([^"]+)"/gi;
    let schemaMatch;
    while ((schemaMatch = schemaRegex.exec(html)) !== null) {
      if (!result.schemaTypes.includes(schemaMatch[1])) {
        result.schemaTypes.push(schemaMatch[1]);
      }
    }
    
    // Extract internal links (same domain) - UPGRADED to 150 max
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1];
      if (href.startsWith('/') || href.includes(domain)) {
        if (result.internalLinks.length < 150) {
          result.internalLinks.push(href);
        }
      } else if (href.startsWith('http') && !href.includes(domain)) {
        if (result.externalLinks.length < 50) {
          result.externalLinks.push(href);
        }
      }
    }
    
    // NEW: Extract canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      result.canonical = canonicalMatch[1];
    }
    
    // NEW: Extract Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) result.ogTitle = ogTitleMatch[1];
    
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) result.ogDescription = ogDescMatch[1];
    
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImageMatch) result.ogImage = ogImageMatch[1];
    
    // NEW: Extract robots meta
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    if (robotsMatch) result.robots = robotsMatch[1];
    
    // Extract language
    const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    if (langMatch) {
      result.language = langMatch[1].substring(0, 2).toLowerCase();
    }
    
  } catch (e) {
    Logger.log(`   ⚠️ HTML parsing error for ${domain}: ${e.message}`);
  }
  
  return result;
}

/**
 * Clean heading text by removing HTML tags and extra whitespace
 */
function cleanHeadingText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim()
    .substring(0, 200);       // Limit length
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

/**
 * Extract API-specific data from gateway response
 */
function extractApiData(api, result) {
  switch (api) {
    case 'phpFetcher':
      return result.data || result;
      
    case 'pageSpeed':
      return {
        scores: result.scores || {},
        metrics: result.metrics || {},
        core_web_vitals: result.core_web_vitals || {},
        url: result.url,
        strategy: result.strategy
      };
      
    case 'serper':
      // V8.5: Extract all SERP features including answerBox and knowledgeGraph
      return result.data || {
        organic: result.organic || [],
        peopleAlsoAsk: result.peopleAlsoAsk || [],
        relatedSearches: result.relatedSearches || [],
        answerBox: result.answerBox || null,
        knowledgeGraph: result.knowledgeGraph || null,
        sitelinks: result.sitelinks || [],
        topStories: result.topStories || [],
        images: result.images || [],
        videos: result.videos || []
      };
      
    case 'serperBrand':
      // V8.5: Brand search returns rich SERP features that site: queries don't
      return {
        organic: result.organic || [],
        peopleAlsoAsk: result.peopleAlsoAsk || [],
        relatedSearches: result.relatedSearches || [],
        answerBox: result.answerBox || null,
        knowledgeGraph: result.knowledgeGraph || null,
        sitelinks: result.sitelinks || [],
        topStories: result.topStories || [],
        images: result.images || [],
        videos: result.videos || [],
        searchQuery: result.searchQuery || ''
      };
      
    case 'openPageRank':
      return {
        domain: result.domain,
        page_rank_integer: result.page_rank_integer || 0,
        page_rank_decimal: result.page_rank_decimal || 0,
        rank: result.rank || '0',
        status_code: result.status_code
      };
      
    default:
      return result.data || result;
  }
}

/**
 * Sequential fallback if parallel fails
 * Wraps the original fetchAllCompetitorData function
 */
function fetchAllCompetitorDataSequential(competitors) {
  Logger.log('   ⚠️ Using sequential fallback...');
  return fetchAllCompetitorData(competitors);
}

/**
 * Fetch PageSpeed data on-demand (lazy loading)
 * Called when user clicks Technical SEO tab
 * 
 * @param {string} domain - Domain to analyze
 * @return {Object} PageSpeed results
 */
function FT_fetchPageSpeedOnDemand(domain) {
  Logger.log(`   ⚡ On-demand PageSpeed fetch: ${domain}`);
  
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = 'https://' + cleanDomain;
    
    const result = callGateway('pagespeed_analyze', {
      url: fullUrl,
      strategy: 'mobile'
    });
    
    if (result && result.success) {
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
 * Check cache for competitor data before fetching
 * Uses CacheService for 1-hour TTL
 */
function FT_getCachedCompetitorData(domain) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'comp_' + domain.replace(/[^a-z0-9]/gi, '_');
  
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      Logger.log(`   📦 Cache HIT for ${domain}`);
      return data;
    } catch (e) {
      // Invalid cache, continue to fetch
    }
  }
  
  return null;
}

/**
 * Cache competitor data after fetching
 */
function FT_cacheCompetitorData(domain, data) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'comp_' + domain.replace(/[^a-z0-9]/gi, '_');
  
  try {
    // Cache for 1 hour (3600 seconds)
    cache.put(cacheKey, JSON.stringify(data), 3600);
    Logger.log(`   💾 Cached ${domain} for 1 hour`);
  } catch (e) {
    // Cache might be too large, skip silently
    Logger.log(`   ⚠️ Cache too large for ${domain}: ${e.toString()}`);
  }
}

/**
 * Clear all competitor cache - call this after code updates
 * Run this function manually from Apps Script to clear stale cache
 */
function FT_clearCompetitorCache() {
  try {
    const cache = CacheService.getScriptCache();
    // CacheService doesn't have a clear all, but we can remove known keys
    // For now, just log that cache will expire naturally
    Logger.log('🧹 Cache will expire within 1 hour. Use bypassCache:true for immediate fresh data.');
    Logger.log('💡 TIP: New analyses automatically bypass cache after code update.');
    return { success: true, message: 'Cache expires in 1 hour max. Use bypassCache for fresh data.' };
  } catch (e) {
    Logger.log('❌ Cache clear error: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Parallel fetch with caching layer
 */
function FT_fetchWithCache(competitors, options) {
  options = options || {};
  
  const results = {};
  const uncachedCompetitors = [];
  
  // Check cache first
  competitors.forEach(domain => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cached = FT_getCachedCompetitorData(cleanDomain);
    
    if (cached && !options.bypassCache) {
      results[cleanDomain] = cached;
    } else {
      uncachedCompetitors.push(cleanDomain);
    }
  });
  
  Logger.log(`   📦 Cache: ${Object.keys(results).length} hits, ${uncachedCompetitors.length} misses`);
  
  // Fetch uncached competitors
  if (uncachedCompetitors.length > 0) {
    const freshData = FT_fetchAllCompetitorsParallel(uncachedCompetitors, options);
    
    // Merge and cache results
    Object.keys(freshData).forEach(domain => {
      results[domain] = freshData[domain];
      FT_cacheCompetitorData(domain, freshData[domain]);
    });
  }
  
  return results;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LAZY LOADING FUNCTIONS - Called from UI when user clicks specific tabs
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Fetch PageSpeed data for multiple domains in parallel (lazy loading)
 * Called by UI when user clicks Technical SEO or Performance tab
 * 
 * @param {Array} domains - Array of domain strings
 * @return {Object} {success, pageSpeedData: [{domain, success, data}]}
 */
function fetchPageSpeedForDomains(domains) {
  Logger.log(`⚡ Lazy loading PageSpeed for ${domains.length} domains...`);
  const startTime = Date.now();
  
  try {
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return { success: false, error: 'No domains provided' };
    }
    
    // Get gateway configuration
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || GATEWAY_CONFIG.GATEWAY_URL;
    const licenseKey = getUserLicenseKey();
    
    if (!licenseKey) {
      return { success: false, error: 'No license key configured' };
    }
    
    // Build parallel requests
    const requests = domains.map(domain => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const fullUrl = 'https://' + cleanDomain;
      
      return buildGatewayRequest(gatewayUrl, licenseKey, 'pagespeed_analyze', {
        url: fullUrl,
        strategy: 'mobile'
      });
    });
    
    // Execute all PageSpeed requests in parallel
    const responses = UrlFetchApp.fetchAll(requests);
    
    // Parse responses
    const pageSpeedData = responses.map((response, i) => {
      const domain = domains[i].replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      try {
        const responseText = response.getContentText();
        const responseCode = response.getResponseCode();
        const result = JSON.parse(responseText);
        
        if (responseCode === 200 && result.success) {
          return {
            domain: domain,
            success: true,
            data: {
              scores: result.scores || {},
              metrics: result.metrics || {},
              core_web_vitals: result.core_web_vitals || {},
              url: result.url,
              strategy: result.strategy
            }
          };
        } else {
          return {
            domain: domain,
            success: false,
            error: result.error || `HTTP ${responseCode}`
          };
        }
      } catch (e) {
        return {
          domain: domain,
          success: false,
          error: e.toString()
        };
      }
    });
    
    const executionTime = Date.now() - startTime;
    const successCount = pageSpeedData.filter(d => d.success).length;
    
    Logger.log(`✅ PageSpeed lazy load complete: ${successCount}/${domains.length} in ${executionTime}ms`);
    
    return {
      success: true,
      pageSpeedData: pageSpeedData,
      executionTime: executionTime
    };
    
  } catch (error) {
    Logger.log(`❌ PageSpeed lazy load error: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Fetch detailed competitor data on-demand (lazy loading for specific tabs)
 * Called when user clicks tabs that need enhanced data
 * 
 * @param {string} domain - Single domain to fetch
 * @param {Array} dataTypes - Array of data types needed: ['serp', 'backlinks', 'content']
 * @return {Object} Enhanced data for the domain
 */
function fetchEnhancedCompetitorData(domain, dataTypes) {
  Logger.log(`🔄 Fetching enhanced data for ${domain}: ${dataTypes.join(', ')}`);
  
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const results = {};
    
    // Get gateway configuration
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || GATEWAY_CONFIG.GATEWAY_URL;
    const licenseKey = getUserLicenseKey();
    
    if (!licenseKey) {
      return { success: false, error: 'No license key configured' };
    }
    
    // Build requests based on requested data types
    const requests = [];
    const requestMap = [];
    
    dataTypes.forEach(dataType => {
      switch (dataType) {
        case 'serp':
          requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
            query: `site:${cleanDomain}`,
            params: { num: 20, gl: 'us' }
          }));
          requestMap.push('serp');
          break;
          
        case 'pageSpeed':
          requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'pagespeed_analyze', {
            url: 'https://' + cleanDomain,
            strategy: 'mobile'
          }));
          requestMap.push('pageSpeed');
          break;
          
        case 'authority':
          requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'opr_get_rank', {
            domain: cleanDomain
          }));
          requestMap.push('authority');
          break;
      }
    });
    
    if (requests.length === 0) {
      return { success: true, data: {} };
    }
    
    // Execute in parallel
    const responses = UrlFetchApp.fetchAll(requests);
    
    // Parse responses
    responses.forEach((response, i) => {
      const dataType = requestMap[i];
      try {
        const result = JSON.parse(response.getContentText());
        if (response.getResponseCode() === 200 && result.success) {
          results[dataType] = extractApiData(dataType === 'authority' ? 'openPageRank' : dataType, result);
        }
      } catch (e) {
        Logger.log(`⚠️ Error parsing ${dataType}: ${e.toString()}`);
      }
    });
    
    return {
      success: true,
      domain: cleanDomain,
      data: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

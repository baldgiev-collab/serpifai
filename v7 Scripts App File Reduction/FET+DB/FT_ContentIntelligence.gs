/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ContentIntelligence.gs - KEYWORD PROFILES & CONTENT ANALYSIS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CONTENT INTELLIGENCE:
 * - Keyword profile extraction (primary, secondary, semantic, long-tail)
 * - Content intelligence fetching (meta, headings, schema, metrics)
 * - Text analysis helper functions
 * 
 * SPLIT MODULE 2 of 2:
 * - FT_ParallelFetcher.gs: Core parallel fetching, gateway requests, HTML extraction
 * - This file: Keyword profiles, content analysis, helper functions
 * 
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED KEYWORD PROFILE EXTRACTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Extracts comprehensive keyword profiles for each competitor:
 * - Primary KWs: Main head terms the domain ranks for (1-2 words, high traffic)
 * - Secondary KWs: Supporting terms (2-3 words, medium traffic)  
 * - Semantic KWs: Topically related terms (LSI keywords)
 * - Long-tail KWs: Specific phrases (4+ words, lower competition)
 * - Opportunity KWs: Gaps where competitors rank but target doesn't
 */

/**
 * Fetch comprehensive keyword profile for competitors
 * Called by UI when user clicks Keyword Strategy tab
 * 
 * @param {Array} competitors - Array of competitor domains
 * @param {string} targetDomain - The user's domain for gap analysis
 * @return {Object} Comprehensive keyword profiles
 */
function fetchKeywordProfiles(competitors, targetDomain) {
  Logger.log(`🔑 Fetching keyword profiles for ${competitors.length} competitors...`);
  const startTime = Date.now();
  
  try {
    if (!competitors || competitors.length === 0) {
      return { success: false, error: 'No competitors provided' };
    }
    
    // Get gateway configuration
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || GATEWAY_CONFIG.GATEWAY_URL;
    const licenseKey = getUserLicenseKey();
    
    if (!licenseKey) {
      return { success: false, error: 'No license key configured' };
    }
    
    // Build diverse search queries for each competitor to get keyword variety
    const requests = [];
    const requestMap = [];
    
    competitors.forEach((domain, idx) => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const brandName = cleanDomain.split('.')[0];
      
      // Query 1: Site-specific search (indexed pages)
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `site:${cleanDomain}`,
        params: { num: 20, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, type: 'siteIndex' });
      
      // Query 2: Brand + "alternative" (discover related searches)
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `${brandName} alternative OR ${brandName} vs`,
        params: { num: 10, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, type: 'alternatives' });
      
      // Query 3: Brand + "review" (commercial intent)
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `${brandName} review OR best ${brandName}`,
        params: { num: 10, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, type: 'commercial' });
      
      // Query 4: "How to" + brand (informational intent)
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'serper_search', {
        query: `how to use ${brandName} OR ${brandName} tutorial`,
        params: { num: 10, gl: 'us' }
      }));
      requestMap.push({ domain: cleanDomain, type: 'informational' });
    });
    
    Logger.log(`   📡 Executing ${requests.length} parallel keyword searches...`);
    const responses = UrlFetchApp.fetchAll(requests);
    
    // Initialize results structure
    const keywordProfiles = {};
    competitors.forEach(domain => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      keywordProfiles[cleanDomain] = {
        domain: cleanDomain,
        primaryKWs: [],        // Head terms (1-2 words, high volume)
        secondaryKWs: [],      // Supporting terms (2-3 words)
        semanticKWs: [],       // LSI/Related keywords
        longTailKWs: [],       // 4+ word phrases
        opportunityKWs: [],    // Gap opportunities
        intentDistribution: { informational: 0, commercial: 0, transactional: 0, navigational: 0 },
        keywordCount: 0,
        topRankingPages: [],
        relatedSearches: [],
        peopleAlsoAsk: []
      };
    });
    
    // Process all responses
    responses.forEach((response, i) => {
      const mapping = requestMap[i];
      const domain = mapping.domain;
      const queryType = mapping.type;
      
      try {
        const responseText = response.getContentText();
        if (response.getResponseCode() !== 200) return;
        
        const result = JSON.parse(responseText);
        if (!result.success) return;
        
        const data = result.data || result;
        const profile = keywordProfiles[domain];
        
        // Extract organic results
        if (data.organic && Array.isArray(data.organic)) {
          data.organic.forEach((item, pos) => {
            const title = item.title || '';
            const snippet = item.snippet || '';
            const link = item.link || '';
            
            // Extract keywords from title and snippet
            const extractedKWs = extractKeywordsFromText(title + ' ' + snippet);
            
            extractedKWs.forEach(kw => {
              const wordCount = kw.split(' ').length;
              const intent = classifyKeywordIntent(kw);
              
              // Classify by word count
              if (wordCount === 1 || wordCount === 2) {
                if (!profile.primaryKWs.find(k => k.keyword === kw)) {
                  profile.primaryKWs.push({
                    keyword: kw,
                    intent: intent,
                    position: pos + 1,
                    source: queryType,
                    estimatedVolume: estimateKeywordVolume(kw, pos)
                  });
                }
              } else if (wordCount === 3) {
                if (!profile.secondaryKWs.find(k => k.keyword === kw)) {
                  profile.secondaryKWs.push({
                    keyword: kw,
                    intent: intent,
                    position: pos + 1,
                    source: queryType
                  });
                }
              } else {
                if (!profile.longTailKWs.find(k => k.keyword === kw)) {
                  profile.longTailKWs.push({
                    keyword: kw,
                    intent: intent,
                    position: pos + 1,
                    source: queryType
                  });
                }
              }
              
              // Track intent distribution
              profile.intentDistribution[intent]++;
            });
            
            // Add to top ranking pages
            if (queryType === 'siteIndex' && link.includes(domain)) {
              profile.topRankingPages.push({
                url: link,
                title: title,
                position: pos + 1,
                snippet: snippet
              });
            }
          });
        }
        
        // Extract related searches (semantic keywords)
        if (data.relatedSearches && Array.isArray(data.relatedSearches)) {
          data.relatedSearches.forEach(rs => {
            const query = rs.query || rs;
            if (query && !profile.semanticKWs.find(k => k.keyword === query)) {
              profile.semanticKWs.push({
                keyword: query,
                intent: classifyKeywordIntent(query),
                source: 'related_search'
              });
            }
          });
          profile.relatedSearches = [...profile.relatedSearches, ...data.relatedSearches.map(rs => rs.query || rs)];
        }
        
        // Extract People Also Ask
        if (data.peopleAlsoAsk && Array.isArray(data.peopleAlsoAsk)) {
          data.peopleAlsoAsk.forEach(paa => {
            if (paa.question && !profile.peopleAlsoAsk.includes(paa.question)) {
              profile.peopleAlsoAsk.push(paa.question);
              
              // PAA questions are great long-tail keywords
              profile.longTailKWs.push({
                keyword: paa.question,
                intent: 'informational',
                source: 'paa'
              });
            }
          });
        }
        
      } catch (e) {
        Logger.log(`⚠️ Error processing ${domain} ${queryType}: ${e.toString()}`);
      }
    });
    
    // Post-process: Calculate totals and find opportunity gaps
    Object.keys(keywordProfiles).forEach(domain => {
      const profile = keywordProfiles[domain];
      
      // Limit and sort by estimated volume/position
      profile.primaryKWs = profile.primaryKWs.slice(0, 20).sort((a, b) => (b.estimatedVolume || 0) - (a.estimatedVolume || 0));
      profile.secondaryKWs = profile.secondaryKWs.slice(0, 30);
      profile.semanticKWs = [...new Set(profile.semanticKWs.map(k => JSON.stringify(k)))].map(k => JSON.parse(k)).slice(0, 25);
      profile.longTailKWs = profile.longTailKWs.slice(0, 40);
      profile.topRankingPages = profile.topRankingPages.slice(0, 15);
      profile.relatedSearches = [...new Set(profile.relatedSearches)].slice(0, 20);
      profile.peopleAlsoAsk = [...new Set(profile.peopleAlsoAsk)].slice(0, 15);
      
      // Calculate keyword count
      profile.keywordCount = profile.primaryKWs.length + profile.secondaryKWs.length + 
                              profile.semanticKWs.length + profile.longTailKWs.length;
    });
    
    // Find opportunity keywords (keywords competitors have that target doesn't)
    if (targetDomain) {
      const targetKWs = new Set();
      const targetProfile = keywordProfiles[targetDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')];
      
      if (targetProfile) {
        targetProfile.primaryKWs.forEach(k => targetKWs.add(k.keyword.toLowerCase()));
        targetProfile.secondaryKWs.forEach(k => targetKWs.add(k.keyword.toLowerCase()));
      }
      
      Object.keys(keywordProfiles).forEach(domain => {
        if (domain === targetDomain) return;
        const profile = keywordProfiles[domain];
        
        profile.primaryKWs.forEach(kw => {
          if (!targetKWs.has(kw.keyword.toLowerCase())) {
            profile.opportunityKWs.push({
              keyword: kw.keyword,
              competitorDomain: domain,
              potentialTraffic: kw.estimatedVolume || 500,
              difficulty: 'medium'
            });
          }
        });
        
        profile.opportunityKWs = profile.opportunityKWs.slice(0, 15);
      });
    }
    
    const executionTime = Date.now() - startTime;
    Logger.log(`✅ Keyword profiles complete: ${Object.keys(keywordProfiles).length} competitors in ${executionTime}ms`);
    
    return {
      success: true,
      keywordProfiles: keywordProfiles,
      executionTime: executionTime,
      totalKeywords: Object.values(keywordProfiles).reduce((sum, p) => sum + p.keywordCount, 0)
    };
    
  } catch (error) {
    Logger.log(`❌ Keyword profiles error: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Extract keywords from text (titles, snippets)
 */
function extractKeywordsFromText(text) {
  if (!text) return [];
  
  // Clean and normalize
  text = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = text.split(' ').filter(w => w.length > 2);
  const keywords = [];
  
  // Extract 1-word, 2-word, 3-word, and 4-word phrases
  for (let i = 0; i < words.length; i++) {
    // Skip common stop words as single keywords
    if (!isStopWord(words[i])) {
      keywords.push(words[i]); // 1-word
    }
    
    if (i < words.length - 1) {
      const twoWord = words[i] + ' ' + words[i + 1];
      if (!isStopPhrase(twoWord)) {
        keywords.push(twoWord); // 2-word
      }
    }
    
    if (i < words.length - 2) {
      const threeWord = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
      keywords.push(threeWord); // 3-word
    }
    
    if (i < words.length - 3) {
      const fourWord = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3];
      keywords.push(fourWord); // 4-word (long-tail)
    }
  }
  
  return [...new Set(keywords)].slice(0, 50);
}

/**
 * Classify keyword intent
 */
function classifyKeywordIntent(keyword) {
  if (!keyword) return 'informational';
  
  const kw = keyword.toLowerCase();
  
  // Transactional intent
  if (/\b(buy|purchase|order|price|pricing|discount|coupon|deal|shop|cart|checkout|subscribe)\b/.test(kw)) {
    return 'transactional';
  }
  
  // Commercial investigation
  if (/\b(best|top|review|compare|vs|versus|alternative|comparison|recommended)\b/.test(kw)) {
    return 'commercial';
  }
  
  // Navigational
  if (/\b(login|sign in|download|app|official|website|contact)\b/.test(kw)) {
    return 'navigational';
  }
  
  // Default to informational
  return 'informational';
}

/**
 * Estimate keyword volume based on position
 */
function estimateKeywordVolume(keyword, position) {
  // Higher positions suggest higher volume keywords
  const baseVolume = 10000 - (position * 500);
  
  // Adjust by keyword length (shorter = usually higher volume)
  const wordCount = keyword.split(' ').length;
  const lengthMultiplier = wordCount === 1 ? 2.0 : wordCount === 2 ? 1.5 : wordCount === 3 ? 1.0 : 0.5;
  
  return Math.max(100, Math.round(baseVolume * lengthMultiplier));
}

/**
 * Check if word is a stop word
 */
function isStopWord(word) {
  const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
                     'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'were', 'they',
                     'this', 'that', 'with', 'from', 'your', 'will', 'more', 'when', 'what'];
  return stopWords.includes(word);
}

/**
 * Check if phrase is too generic
 */
function isStopPhrase(phrase) {
  const stopPhrases = ['the best', 'and the', 'for the', 'in the', 'to the', 'of the'];
  return stopPhrases.includes(phrase);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED CONTENT INTELLIGENCE EXTRACTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Extracts deep content data for each competitor:
 * - Meta Data: title, description, OG tags, Twitter cards
 * - Heading Structure: H1-H6 hierarchy analysis  
 * - Schema Markup: Types detected and coverage
 * - Content Metrics: word count, reading time, flesch score
 * - Image Analysis: alt tags, compression, lazy loading
 * - Internal Linking: structure and depth
 */

/**
 * Fetch comprehensive content intelligence for competitors
 * Called by UI when user clicks Content Intelligence tab
 * 
 * @param {Array} competitors - Array of competitor domains  
 * @return {Object} Deep content analysis for each competitor
 */
function fetchContentIntelligence(competitors) {
  Logger.log(`📝 Fetching content intelligence for ${competitors.length} competitors...`);
  const startTime = Date.now();
  
  try {
    if (!competitors || competitors.length === 0) {
      return { success: false, error: 'No competitors provided' };
    }
    
    // Get gateway configuration
    const scriptProps = PropertiesService.getScriptProperties();
    const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL') || GATEWAY_CONFIG.GATEWAY_URL;
    const licenseKey = getUserLicenseKey();
    
    if (!licenseKey) {
      return { success: false, error: 'No license key configured' };
    }
    
    // Build content fetch requests for each competitor
    const requests = [];
    const requestMap = [];
    
    competitors.forEach((domain, idx) => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const fullUrl = 'https://' + cleanDomain;
      
      // Deep content fetch via PHP Fetcher
      requests.push(buildGatewayRequest(gatewayUrl, licenseKey, 'fetcher_single', {
        url: fullUrl,
        options: {
          extractMetadata: true,
          extractLinks: true,
          extractImages: true,
          extractSchema: true,
          extractHeadings: true,
          deepContent: true,
          forensicMode: true
        }
      }));
      requestMap.push({ domain: cleanDomain, type: 'content' });
    });
    
    Logger.log(`   📡 Executing ${requests.length} parallel content fetches...`);
    const responses = UrlFetchApp.fetchAll(requests);
    
    // Initialize content intelligence structure
    const contentIntelligence = {};
    
    responses.forEach((response, i) => {
      const mapping = requestMap[i];
      const domain = mapping.domain;
      
      try {
        const responseText = response.getContentText();
        if (response.getResponseCode() !== 200) {
          contentIntelligence[domain] = createFallbackContentData(domain);
          return;
        }
        
        const result = JSON.parse(responseText);
        if (!result.success || !result.data) {
          contentIntelligence[domain] = createFallbackContentData(domain);
          return;
        }
        
        const data = result.data;
        const content = data.content || '';
        const metadata = data.metadata || {};
        
        // Extract comprehensive content metrics
        contentIntelligence[domain] = {
          domain: domain,
          
          // Meta Data Analysis
          metaData: {
            title: metadata.title || extractTitleFromHtml(content),
            titleLength: (metadata.title || '').length,
            titleOptimized: (metadata.title || '').length >= 30 && (metadata.title || '').length <= 60,
            description: metadata.description || extractMetaDescription(content),
            descriptionLength: (metadata.description || '').length,
            descriptionOptimized: (metadata.description || '').length >= 120 && (metadata.description || '').length <= 160,
            canonical: metadata.canonical || extractCanonical(content),
            language: metadata.language || 'en',
            ogTitle: extractOgTag(content, 'title'),
            ogDescription: extractOgTag(content, 'description'),
            ogImage: extractOgTag(content, 'image'),
            twitterCard: extractTwitterCard(content),
            robots: metadata.robots || 'index, follow'
          },
          
          // Heading Structure Analysis
          headingStructure: analyzeHeadingStructure(content),
          
          // Schema Markup Analysis
          schemaAnalysis: analyzeSchemaMarkup(content, data.schema),
          
          // Content Metrics
          contentMetrics: {
            wordCount: metadata.wordCount || countWords(content),
            charCount: content.length,
            paragraphCount: countParagraphs(content),
            sentenceCount: countSentences(content),
            avgSentenceLength: calculateAvgSentenceLength(content),
            readingTime: calculateReadingTime(metadata.wordCount || countWords(content)),
            readabilityScore: calculateReadabilityScore(content),
            keywordDensity: 0, // Would need target keyword
            uniqueWords: countUniqueWords(content),
            contentFreshness: estimateContentFreshness(content)
          },
          
          // Image Analysis
          imageAnalysis: analyzeImages(content, data.images),
          
          // Internal Linking Analysis
          linkingAnalysis: analyzeLinkStructure(content, data.links, domain),
          
          // Content Quality Signals
          qualitySignals: {
            hasTableOfContents: content.includes('table-of-contents') || content.includes('toc'),
            hasFAQSection: /faq|frequently asked/i.test(content),
            hasVideoEmbed: /youtube|vimeo|video/i.test(content),
            hasInfographic: /infographic/i.test(content),
            hasStatistics: /\d+%|\d+ percent/i.test(content),
            hasCitations: /sources?:|references?:|citation/i.test(content),
            hasAuthorBio: /author|written by|by [A-Z]/i.test(content),
            hasLastUpdated: /updated|last modified|modified/i.test(content),
            hasStructuredData: content.includes('application/ld+json'),
            contentScore: 0 // Calculated below
          }
        };
        
        // Calculate overall content score
        const signals = contentIntelligence[domain].qualitySignals;
        let score = 50; // Base score
        if (signals.hasTableOfContents) score += 8;
        if (signals.hasFAQSection) score += 10;
        if (signals.hasVideoEmbed) score += 7;
        if (signals.hasStatistics) score += 5;
        if (signals.hasCitations) score += 8;
        if (signals.hasAuthorBio) score += 5;
        if (signals.hasLastUpdated) score += 4;
        if (signals.hasStructuredData) score += 10;
        if (contentIntelligence[domain].metaData.titleOptimized) score += 5;
        if (contentIntelligence[domain].metaData.descriptionOptimized) score += 5;
        
        signals.contentScore = Math.min(100, score);
        
      } catch (e) {
        Logger.log(`⚠️ Error processing ${domain}: ${e.toString()}`);
        contentIntelligence[domain] = createFallbackContentData(domain);
      }
    });
    
    const executionTime = Date.now() - startTime;
    Logger.log(`✅ Content intelligence complete: ${Object.keys(contentIntelligence).length} competitors in ${executionTime}ms`);
    
    return {
      success: true,
      contentIntelligence: contentIntelligence,
      executionTime: executionTime
    };
    
  } catch (error) {
    Logger.log(`❌ Content intelligence error: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYSIS HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function createFallbackContentData(domain) {
  return {
    domain: domain,
    metaData: { title: 'N/A', description: 'N/A' },
    headingStructure: { h1: [], h2: [], h3: [] },
    schemaAnalysis: { types: [], hasOrganization: false },
    contentMetrics: { wordCount: 0, readingTime: 0 },
    imageAnalysis: { total: 0, withAlt: 0 },
    linkingAnalysis: { internal: 0, external: 0 },
    qualitySignals: { contentScore: 40 }
  };
}

function extractTitleFromHtml(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

function extractOgTag(html, property) {
  const match = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
  return match ? match[1].trim() : '';
}

function extractTwitterCard(html) {
  const match = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].trim() : 'summary';
}

function analyzeHeadingStructure(html) {
  const structure = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [], hierarchyScore: 0 };
  
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([^<]+)</h${i}>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      structure[`h${i}`].push(match[1].trim().substring(0, 100));
    }
  }
  
  // Calculate hierarchy score (proper H1 -> H2 -> H3 usage)
  let score = 0;
  if (structure.h1.length === 1) score += 25; // Single H1 is ideal
  if (structure.h1.length > 0 && structure.h2.length > 0) score += 25; // Has H1 and H2
  if (structure.h2.length > structure.h3.length * 0.5) score += 25; // Reasonable H2:H3 ratio
  if (structure.h3.length > 0) score += 25; // Uses H3 for detail
  structure.hierarchyScore = score;
  
  return structure;
}

function analyzeSchemaMarkup(html, schemaData) {
  const analysis = {
    types: [],
    hasOrganization: false,
    hasWebPage: false,
    hasArticle: false,
    hasFAQ: false,
    hasHowTo: false,
    hasProduct: false,
    hasBreadcrumb: false,
    hasLocalBusiness: false,
    schemaScore: 0
  };
  
  // From pre-extracted schema data
  if (schemaData && schemaData.types) {
    analysis.types = schemaData.types;
  }
  
  // Analyze from HTML
  const schemaBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  schemaBlocks.forEach(block => {
    const content = block.toLowerCase();
    if (content.includes('organization')) { analysis.hasOrganization = true; analysis.types.push('Organization'); }
    if (content.includes('webpage')) { analysis.hasWebPage = true; analysis.types.push('WebPage'); }
    if (content.includes('article')) { analysis.hasArticle = true; analysis.types.push('Article'); }
    if (content.includes('faqpage')) { analysis.hasFAQ = true; analysis.types.push('FAQPage'); }
    if (content.includes('howto')) { analysis.hasHowTo = true; analysis.types.push('HowTo'); }
    if (content.includes('product')) { analysis.hasProduct = true; analysis.types.push('Product'); }
    if (content.includes('breadcrumb')) { analysis.hasBreadcrumb = true; analysis.types.push('BreadcrumbList'); }
    if (content.includes('localbusiness')) { analysis.hasLocalBusiness = true; analysis.types.push('LocalBusiness'); }
  });
  
  analysis.types = [...new Set(analysis.types)];
  
  // Calculate schema score
  let score = 0;
  if (analysis.hasOrganization) score += 15;
  if (analysis.hasWebPage) score += 10;
  if (analysis.hasArticle) score += 15;
  if (analysis.hasFAQ) score += 20;
  if (analysis.hasHowTo) score += 15;
  if (analysis.hasBreadcrumb) score += 10;
  analysis.schemaScore = Math.min(100, score);
  
  return analysis;
}

function countWords(text) {
  // Strip HTML tags
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.split(' ').filter(w => w.length > 0).length;
}

function countParagraphs(html) {
  return (html.match(/<p[^>]*>/gi) || []).length;
}

function countSentences(text) {
  const clean = text.replace(/<[^>]+>/g, ' ');
  return (clean.match(/[.!?]+/g) || []).length;
}

function calculateAvgSentenceLength(text) {
  const words = countWords(text);
  const sentences = countSentences(text);
  return sentences > 0 ? Math.round(words / sentences) : 0;
}

function calculateReadingTime(wordCount) {
  // Average reading speed: 200-250 words per minute
  return Math.ceil(wordCount / 225);
}

function calculateReadabilityScore(text) {
  // Simplified Flesch-Kincaid approximation
  const words = countWords(text);
  const sentences = countSentences(text);
  if (sentences === 0 || words === 0) return 50;
  
  const avgSentenceLength = words / sentences;
  // Higher score = easier to read (scaled 0-100)
  return Math.max(0, Math.min(100, Math.round(100 - (avgSentenceLength * 2))));
}

function countUniqueWords(text) {
  const clean = text.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[^a-z\s]/g, '');
  const words = clean.split(/\s+/).filter(w => w.length > 3);
  return new Set(words).size;
}

function estimateContentFreshness(html) {
  // Look for date indicators (0-10 scale)
  const currentYear = new Date().getFullYear();
  if (html.includes(String(currentYear))) return 10;
  if (html.includes(String(currentYear - 1))) return 7;
  if (html.includes(String(currentYear - 2))) return 4;
  return 2;
}

function analyzeImages(html, imageData) {
  const analysis = {
    total: 0,
    withAlt: 0,
    withLazyLoad: 0,
    avgAltLength: 0,
    hasWebP: false,
    imageOptimizationScore: 0
  };
  
  // From pre-extracted image data
  if (imageData && Array.isArray(imageData)) {
    analysis.total = imageData.length;
    analysis.withAlt = imageData.filter(img => img.alt && img.alt.length > 0).length;
    const altLengths = imageData.filter(img => img.alt).map(img => img.alt.length);
    analysis.avgAltLength = altLengths.length > 0 ? Math.round(altLengths.reduce((a,b) => a+b, 0) / altLengths.length) : 0;
    analysis.hasWebP = imageData.some(img => img.src && img.src.includes('.webp'));
  }
  
  // Analyze from HTML for lazy loading
  analysis.withLazyLoad = (html.match(/loading=["']lazy["']/gi) || []).length;
  
  // Calculate optimization score
  let score = 50;
  if (analysis.total > 0 && analysis.withAlt / analysis.total > 0.8) score += 20;
  if (analysis.withLazyLoad > 0) score += 15;
  if (analysis.hasWebP) score += 15;
  analysis.imageOptimizationScore = Math.min(100, score);
  
  return analysis;
}

function analyzeLinkStructure(html, linkData, domain) {
  const analysis = {
    internalLinks: 0,
    externalLinks: 0,
    nofollowLinks: 0,
    brokenLinkRisk: 0,
    linkDensity: 0,
    linkStructureScore: 0
  };
  
  if (linkData && Array.isArray(linkData)) {
    analysis.internalLinks = linkData.filter(l => l.isInternal).length;
    analysis.externalLinks = linkData.filter(l => !l.isInternal).length;
    analysis.nofollowLinks = linkData.filter(l => l.rel && l.rel.includes('nofollow')).length;
  } else {
    // Count from HTML
    const allLinks = (html.match(/<a[^>]+href/gi) || []).length;
    const domainLinks = (html.match(new RegExp(`href=["'][^"']*${domain}`, 'gi')) || []).length;
    analysis.internalLinks = domainLinks;
    analysis.externalLinks = allLinks - domainLinks;
  }
  
  const wordCount = countWords(html);
  analysis.linkDensity = wordCount > 0 ? Math.round((analysis.internalLinks + analysis.externalLinks) / wordCount * 1000) : 0;
  
  // Calculate link structure score
  let score = 50;
  if (analysis.internalLinks > 5) score += 20;
  if (analysis.externalLinks > 2 && analysis.externalLinks < 20) score += 15;
  if (analysis.linkDensity > 5 && analysis.linkDensity < 30) score += 15;
  analysis.linkStructureScore = Math.min(100, score);
  
  return analysis;
}

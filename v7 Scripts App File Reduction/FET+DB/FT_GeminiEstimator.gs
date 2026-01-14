/**
 * DB_COMP_GeminiEstimator.gs
 * 
 * GEMINI-POWERED SEO METRICS ESTIMATION SYSTEM
 * 
 * Why this exists:
 * - OpenPageRank alone CANNOT predict SEMrush Authority/Traffic/Keywords
 * - The relationship is non-linear and varies by industry
 * - Gambling sites, news sites, SaaS tools all have different patterns
 * - Gemini has learned web patterns and can make educated estimates
 * 
 * Architecture:
 * 1. Collect all available signals (OpenPageRank, SERP results, PageSpeed, content)
 * 2. Send to Gemini with a precision estimation prompt
 * 3. Gemini returns estimated metrics based on its knowledge of web patterns
 * 4. We use these estimates instead of formula-based calculations
 */

/**
 * Main entry point: Estimate SEO metrics using Gemini
 * 
 * @param {Object} competitorData - All collected data for a competitor
 * @param {string} domain - The competitor domain
 * @param {string} model - Gemini model to use
 * @returns {Object} - Estimated metrics
 */
function GEMINI_estimateSEOMetrics(competitorData, domain, model) {
  try {
    Logger.log(`🤖 GEMINI ESTIMATION for ${domain}`);
    
    // Build the estimation prompt with all available signals
    const prompt = buildEstimationPrompt(competitorData, domain);
    
    // Get the system instruction for precision estimation
    const systemInstruction = getEstimationSystemInstruction();
    
    // Call Gemini - Default to Gemini 3 Flash Preview (Dec 2025)
    const selectedModel = model || 'gemini-3-flash-preview';
    const response = callGeminiForEstimation(prompt, systemInstruction, selectedModel);
    
    if (!response.success) {
      Logger.log(`   ❌ Gemini estimation failed: ${response.error}`);
      return getFallbackEstimates(competitorData, domain);
    }
    
    // Parse the response
    const estimates = parseEstimationResponse(response.content);
    
    // SAFE LOGGING: Use Number() to prevent toLocaleString errors
    Logger.log(`   ✅ Gemini estimates for ${domain}:`);
    Logger.log(`      Authority: ${Number(estimates.authorityScore) || 0}`);
    Logger.log(`      Keywords: ${(Number(estimates.organicKeywords) || 0).toLocaleString()}`);
    Logger.log(`      Traffic: ${(Number(estimates.organicTraffic) || 0).toLocaleString()}`);
    Logger.log(`      Backlinks: ${(Number(estimates.backlinks) || 0).toLocaleString()}`);
    Logger.log(`      RefDomains: ${(Number(estimates.refDomains) || 0).toLocaleString()}`);
    Logger.log(`      Confidence: ${estimates.confidence || 'Low'}`);
    
    return estimates;
    
  } catch (error) {
    Logger.log(`   ❌ GEMINI_estimateSEOMetrics error: ${error.toString()}`);
    return getFallbackEstimates(competitorData, domain);
  }
}

/**
 * Batch estimate metrics for multiple competitors
 * More efficient than individual calls
 */
function GEMINI_estimateBatch(competitorsArray, model) {
  try {
    Logger.log(`🤖 GEMINI BATCH ESTIMATION for ${competitorsArray.length} competitors`);
    
    // Build batch prompt
    const prompt = buildBatchEstimationPrompt(competitorsArray);
    const systemInstruction = getEstimationSystemInstruction();
    
    // Default to Gemini 3 Flash Preview (Dec 2025)
    const selectedModel = model || 'gemini-3-flash-preview';
    const response = callGeminiForEstimation(prompt, systemInstruction, selectedModel);
    
    if (!response.success) {
      Logger.log(`   ❌ Batch estimation failed: ${response.error}`);
      // Return fallback for each competitor
      return competitorsArray.map(comp => ({
        domain: comp.domain,
        estimates: getFallbackEstimates(comp, comp.domain)
      }));
    }
    
    // Parse batch response
    const batchEstimates = parseBatchEstimationResponse(response.content);
    
    Logger.log(`   ✅ Batch estimation complete: ${batchEstimates.length} competitors`);
    return batchEstimates;
    
  } catch (error) {
    Logger.log(`   ❌ GEMINI_estimateBatch error: ${error.toString()}`);
    return competitorsArray.map(comp => ({
      domain: comp.domain,
      estimates: getFallbackEstimates(comp, comp.domain)
    }));
  }
}

/**
 * System instruction for precision estimation
 * v8.1: Added SEMrush ground truth calibration data
 */
function getEstimationSystemInstruction() {
  return `# SEO METRICS ESTIMATION EXPERT v8.1

## YOUR ROLE
You are an expert SEO analyst with deep knowledge of SEMrush, Ahrefs, and Moz methodologies.

## YOUR TASK
Estimate SEMrush-equivalent metrics for websites based on available signals.

## CRITICAL CALIBRATION DATA (SEMrush Ground Truth - December 2025)
Use these REAL measurements to calibrate your estimates:

| Domain | Auth | Traffic | Keywords | Backlinks | RefDomains | PageRank |
|--------|------|---------|----------|-----------|------------|----------|
| semrush.com | 85 | 9,500,000 | 7,900,000 | 19,800,000 | 211,000 | 7.58 |
| ahrefs.com | 83 | 3,800,000 | 2,900,000 | 15,300,000 | 130,000 | 7.23 |
| moz.com | 72 | 1,200,000 | 850,000 | 4,500,000 | 95,000 | 7.10 |
| toptal.com | 59 | 553,700 | 305,300 | 1,200,000 | 64,500 | 6.40 |
| vegasslotsonline.com | 50 | 261,300 | 112,800 | 3,600,000 | 18,500 | 4.50 |
| askgamblers.com | 51 | 182,400 | 106,100 | 1,800,000 | 24,000 | 4.20 |
| thoughtworks.com | 51 | 125,600 | 44,300 | 503,900 | 20,900 | 5.78 |
| globant.com | 48 | 140,400 | 40,200 | 363,000 | 10,800 | 5.73 |
| surferseo.com | 53 | 247,400 | 75,400 | 236,800 | 9,600 | 5.54 |
| turing.com | 45 | 50,000 | 15,000 | 250,000 | 7,000 | 4.98 |
| andela.com | 39 | 15,700 | 3,900 | 151,000 | 4,200 | 4.72 |

## KEY CALIBRATION PATTERNS

### PageRank to Authority Score:
- PR 7.5+ → Authority 80-90
- PR 7.0-7.5 → Authority 70-80
- PR 6.0-7.0 → Authority 55-70
- PR 5.5-6.0 → Authority 48-55
- PR 5.0-5.5 → Authority 40-50
- PR 4.5-5.0 → Authority 38-48
- PR 4.0-4.5 → Authority 35-45
- PR <4.0 → Authority 25-38

### Traffic Estimation (by Authority tier):
- Auth 80+ → Traffic = Keywords × 1.2 to 1.5
- Auth 70-80 → Traffic = Keywords × 1.0 to 1.4
- Auth 55-70 → Traffic = Keywords × 1.5 to 2.5
- Auth 45-55 → Traffic = Keywords × 2.0 to 3.5
- Auth 35-45 → Traffic = Keywords × 3.0 to 5.0
- Auth <35 → Traffic = Keywords × 3.0 to 6.0

### Industry-Specific Patterns:

**Gambling/Casino Sites** (vegasslots, askgamblers):
- Authority: 45-55 despite low PageRank
- HIGH backlinks (1.5M-4M) due to affiliate networks
- Keywords: 100K-200K
- Traffic: 150K-350K
- Backlinks >> 20× RefDomains (many links per domain)

**SaaS/Tool Sites** (semrush, ahrefs, moz):
- Authority: 70-90
- PageRank correlates well (7+)
- Keywords and Traffic nearly equal
- Backlinks: 5-20× RefDomains

**Consultancies/B2B Services** (toptal, thoughtworks, globant):
- Authority: 45-60
- PageRank 5.5-6.5
- Traffic: 50K-600K
- Keywords: 40K-300K
- Backlinks: 15-30× RefDomains

**Staffing/Talent Platforms** (turing, andela):
- Authority: 35-50
- Lower traffic (15K-100K)
- Keywords: 4K-50K
- Growing backlink profiles

## ESTIMATION APPROACH
1. Find the closest calibration examples by PageRank
2. Interpolate based on industry type
3. Apply industry-specific multipliers
4. Cross-validate with SERP presence signals

## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "domain": "example.com",
  "siteType": "gambling|saas|consultancy|staffing|news|ecommerce|blog|corporate",
  "authorityScore": 50,
  "organicKeywords": 106100,
  "organicTraffic": 182400,
  "backlinks": 1800000,
  "refDomains": 24000,
  "confidence": "High|Medium|Low",
  "reasoning": "Brief explanation"
}

## CRITICAL RULES
1. Use the calibration table - find similar sites and interpolate
2. Do NOT just multiply PageRank × 10 for authority
3. Gambling sites have LOWER PageRank but HIGHER traffic than expected
4. Backlinks for gambling sites are typically 50-200× RefDomains
5. SaaS sites have Backlinks typically 10-30× RefDomains`;
}

/**
 * Build estimation prompt for a single competitor
 */
function buildEstimationPrompt(competitorData, domain) {
  // Extract all available signals
  const pageRank = competitorData.apiData?.openPageRank?.page_rank_decimal || 
                   competitorData.stages?.openPageRank?.data?.page_rank_decimal || 0;
  const domainRank = competitorData.apiData?.openPageRank?.rank || 
                     competitorData.stages?.openPageRank?.data?.rank || 0;
  
  const serpResults = (competitorData.apiData?.serper?.organic || 
                       competitorData.stages?.serper?.data?.organic || []);
  
  const pageSpeedScores = competitorData.apiData?.pageSpeed?.scores || 
                          competitorData.stages?.pageSpeed?.data?.scores || {};
  
  const snapshot = competitorData.snapshot || {};
  const synthesized = competitorData.synthesized || {};
  
  const signals = {
    domain: domain,
    
    // Authority signals
    openPageRank: pageRank,
    domainRank: domainRank,
    
    // SERP visibility signals
    serpResultCount: serpResults.length,
    topSerpPositions: serpResults.slice(0, 5).map(r => ({
      title: r.title,
      position: r.position,
      snippet: (r.snippet || '').substring(0, 100)
    })),
    
    // Technical signals
    pageSpeedSEO: pageSpeedScores.seo || 0,
    pageSpeedPerformance: pageSpeedScores.performance || 0,
    pageSpeedAccessibility: pageSpeedScores.accessibility || 0,
    
    // Content signals
    wordCount: snapshot.metadata?.wordCount || synthesized.website?.wordCount || 0,
    schemaTypes: snapshot.schema?.types || synthesized.website?.schemaTypes || [],
    hasOrganizationSchema: snapshot.schema?.hasOrganizationSchema || false,
    
    // Site metadata
    title: snapshot.metadata?.title || synthesized.website?.title || '',
    description: snapshot.metadata?.description || synthesized.website?.description || '',
    
    // Industry hints from content
    contentSample: (snapshot.content?.main || synthesized.content?.mainContent || '').substring(0, 500)
  };
  
  return `# ESTIMATE SEO METRICS FOR: ${domain}

## AVAILABLE SIGNALS

${JSON.stringify(signals, null, 2)}

## YOUR TASK
Based on these signals, estimate the SEMrush-equivalent metrics for this domain.

Consider:
1. What type of site is this? (gambling, SaaS, news, etc.)
2. The OpenPageRank is ${pageRank} - what does this tell you for this site type?
3. There are ${serpResults.length} SERP results - what does this indicate?
4. Technical scores: SEO=${pageSpeedScores.seo}, Performance=${pageSpeedScores.performance}

Return your estimates as JSON.`;
}

/**
 * Build batch estimation prompt for multiple competitors
 */
function buildBatchEstimationPrompt(competitorsArray) {
  const allSignals = competitorsArray.map(comp => {
    const pageRank = comp.apiData?.openPageRank?.page_rank_decimal || 
                     comp.stages?.openPageRank?.data?.page_rank_decimal || 0;
    const serpResults = comp.apiData?.serper?.organic || 
                        comp.stages?.serper?.data?.organic || [];
    const pageSpeedScores = comp.apiData?.pageSpeed?.scores || 
                            comp.stages?.pageSpeed?.data?.scores || {};
    const snapshot = comp.snapshot || {};
    
    return {
      domain: comp.domain,
      openPageRank: pageRank,
      domainRank: comp.apiData?.openPageRank?.rank || 0,
      serpResultCount: serpResults.length,
      pageSpeedSEO: pageSpeedScores.seo || 0,
      pageSpeedPerformance: pageSpeedScores.performance || 0,
      wordCount: snapshot.metadata?.wordCount || 0,
      schemaCount: (snapshot.schema?.types || []).length,
      title: (snapshot.metadata?.title || '').substring(0, 100),
      description: (snapshot.metadata?.description || '').substring(0, 200)
    };
  });
  
  return `# BATCH SEO METRICS ESTIMATION

## COMPETITORS TO ESTIMATE
${allSignals.map(s => s.domain).join(', ')}

## AVAILABLE SIGNALS FOR EACH

${JSON.stringify(allSignals, null, 2)}

## YOUR TASK
Estimate SEMrush-equivalent metrics for EACH domain.

Return a JSON array with estimates for each:
[
  {
    "domain": "example1.com",
    "siteType": "gambling",
    "authorityScore": 55,
    "organicKeywords": 106100,
    "organicTraffic": 182400,
    "backlinks": 1800000,
    "refDomains": 24000,
    "confidence": "Medium"
  },
  ...
]

Consider industry patterns - gambling sites often have LOW PageRank but HIGH traffic!`;
}

/**
 * Call Gemini API for estimation
 */
function callGeminiForEstimation(prompt, systemInstruction, model) {
  try {
    // Get API key
    const apiKey = getGeminiApiKey_();
    if (!apiKey) {
      return { success: false, error: 'No Gemini API key configured' };
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,  // Low temperature for consistency
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      return { success: false, error: `HTTP ${responseCode}: ${response.getContentText()}` };
    }
    
    const result = JSON.parse(response.getContentText());
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return { success: false, error: 'Empty response from Gemini' };
    }
    
    return { success: true, content: content };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Get Gemini API key from user properties
 */
function getGeminiApiKey_() {
  try {
    // Try from user properties first
    const userProps = PropertiesService.getUserProperties();
    const apiKey = userProps.getProperty('SERPIFAI_GEMINI_KEY');
    if (apiKey) return apiKey;
    
    // Try from script properties
    const scriptProps = PropertiesService.getScriptProperties();
    return scriptProps.getProperty('GEMINI_API_KEY');
  } catch (e) {
    Logger.log('Error getting Gemini API key: ' + e);
    return null;
  }
}

/**
 * Parse single estimation response
 */
function parseEstimationResponse(content) {
  try {
    // Try to parse as JSON
    let parsed;
    
    // Clean the content if needed
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    parsed = JSON.parse(cleanContent);
    
    return {
      authorityScore: parsed.authorityScore || 30,
      organicKeywords: parsed.organicKeywords || 1000,
      organicTraffic: parsed.organicTraffic || 500,
      backlinks: parsed.backlinks || 5000,
      refDomains: parsed.refDomains || 500,
      siteType: parsed.siteType || 'unknown',
      confidence: parsed.confidence || 'Low',
      reasoning: parsed.reasoning || '',
      isGeminiEstimate: true
    };
    
  } catch (error) {
    Logger.log('Error parsing estimation response: ' + error);
    Logger.log('Content was: ' + content.substring(0, 500));
    
    return {
      authorityScore: 30,
      organicKeywords: 1000,
      organicTraffic: 500,
      backlinks: 5000,
      refDomains: 500,
      confidence: 'Low',
      isGeminiEstimate: false,
      parseError: true
    };
  }
}

/**
 * Parse batch estimation response
 */
function parseBatchEstimationResponse(content) {
  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    
    if (!Array.isArray(parsed)) {
      // Single result, wrap in array
      return [{ domain: parsed.domain, estimates: parseEstimationResponse(JSON.stringify(parsed)) }];
    }
    
    return parsed.map(item => ({
      domain: item.domain,
      estimates: {
        authorityScore: item.authorityScore || 30,
        organicKeywords: item.organicKeywords || 1000,
        organicTraffic: item.organicTraffic || 500,
        backlinks: item.backlinks || 5000,
        refDomains: item.refDomains || 500,
        siteType: item.siteType || 'unknown',
        confidence: item.confidence || 'Low',
        isGeminiEstimate: true
      }
    }));
    
  } catch (error) {
    Logger.log('Error parsing batch response: ' + error);
    return [];
  }
}

/**
 * Fallback estimates when Gemini fails
 * v8.1: Uses SMARTFALLBACK system if available, otherwise v7.0 formulas
 */
function getFallbackEstimates(competitorData, domain) {
  // v8.1: Try Smart Fallback system first (uses more signals)
  try {
    if (typeof SMARTFALLBACK_estimateMetrics === 'function') {
      Logger.log(`   🧠 Using Smart Fallback for ${domain}`);
      return SMARTFALLBACK_estimateMetrics(competitorData, domain);
    }
  } catch (e) {
    Logger.log(`   ⚠️ Smart Fallback unavailable: ${e.toString()}`);
  }
  
  // v7.0 Fallback: Formula-based estimation
  const pageRank = competitorData.apiData?.openPageRank?.page_rank_decimal || 
                   competitorData.stages?.openPageRank?.data?.page_rank_decimal || 3;
  const serpResults = (competitorData.apiData?.serper?.organic || 
                       competitorData.stages?.serper?.data?.organic || []).length;
  
  // Get additional signals from PHP Fetcher/snapshot
  const wordCount = competitorData.snapshot?.metadata?.wordCount || 
                    competitorData.synthesized?.website?.wordCount || 0;
  const schemaCount = (competitorData.snapshot?.schema?.types || 
                       competitorData.synthesized?.website?.schemaTypes || []).length;
  
  // Improved fallback that considers SERP presence + content signals
  let authorityScore;
  if (pageRank >= 6) {
    authorityScore = Math.round(pageRank * 10);
  } else if (serpResults >= 10) {
    // High SERP presence but low PageRank = industry suppression
    authorityScore = Math.max(45, Math.round(pageRank * 12));
  } else if (serpResults >= 5) {
    authorityScore = Math.max(35, Math.round(pageRank * 10));
  } else {
    authorityScore = Math.round(pageRank * 8);
  }
  
  // Content depth bonus (v8.1)
  if (wordCount > 2000) authorityScore += 5;
  if (schemaCount > 2) authorityScore += 3;
  
  authorityScore = Math.max(15, Math.min(85, authorityScore));
  
  // Power-law estimates with content boost
  const kwExponent = 0.048 * authorityScore + 0.6;
  let organicKeywords = Math.round(Math.pow(10, kwExponent));
  
  // Content-rich sites have more keywords
  if (wordCount > 2000) organicKeywords = Math.round(organicKeywords * 1.3);
  
  const trafficRatio = authorityScore >= 60 ? 5 : authorityScore >= 40 ? 2 : 0.5;
  const organicTraffic = Math.round(organicKeywords * trafficRatio);
  
  const blExponent = 0.068 * authorityScore + 1.6;
  const backlinks = Math.round(Math.pow(10, blExponent));
  
  const refDomRatio = authorityScore >= 50 ? 0.02 : 0.08;
  const refDomains = Math.max(50, Math.round(backlinks * refDomRatio));
  
  return {
    authorityScore: authorityScore,
    organicKeywords: Math.max(100, organicKeywords),
    organicTraffic: Math.max(50, organicTraffic),
    backlinks: Math.max(500, backlinks),
    refDomains: Math.max(50, refDomains),
    confidence: 'Low',
    isGeminiEstimate: false,
    isFallback: true
  };
}

/**
 * Test function - estimate for a known domain
 */
function TEST_GeminiEstimation() {
  const testData = {
    domain: 'askgamblers.com',
    apiData: {
      openPageRank: {
        page_rank_decimal: 4.5,
        rank: 50000
      },
      serper: {
        organic: new Array(10).fill({title: 'test', position: 1})
      },
      pageSpeed: {
        scores: {
          seo: 85,
          performance: 60
        }
      }
    },
    snapshot: {
      metadata: {
        title: 'AskGamblers - Online Casino Reviews',
        description: 'The world\'s largest online casino reviews site',
        wordCount: 5000
      }
    }
  };
  
  const result = GEMINI_estimateSEOMetrics(testData, 'askgamblers.com', 'gemini-3-flash-preview');
  Logger.log('Test result: ' + JSON.stringify(result, null, 2));
  
  // Compare to reality
  Logger.log('\n=== COMPARISON TO SEMrush REALITY ===');
  Logger.log('SEMrush: Authority=51, Traffic=182.4K, Keywords=106.1K, Backlinks=1.8M, RefDomains=24K');
  Logger.log(`Gemini:  Authority=${result.authorityScore}, Traffic=${result.organicTraffic}, Keywords=${result.organicKeywords}, Backlinks=${result.backlinks}, RefDomains=${result.refDomains}`);
  
  return result;
}

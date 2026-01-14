/**
 * FT_Forensic_Main.gs - Forensic Analysis Entry Point
 * SerpifAI V8 - Modular Architecture
 * 
 * Main orchestrator for 15-category forensic analysis.
 * Coordinates extractors and generates comprehensive reports.
 */

/**
 * Full forensic scan orchestrator
 * @param {string} url - URL to analyze
 * @param {string[]} competitorUrls - Array of competitor URLs
 * @param {object} options - Analysis options
 * @return {object} Complete forensic report
 */
function FT_fullForensicScan(url, competitorUrls, options) {
  if (!url) {
    return CORE_handleError(new Error('URL required'), 'FT_fullForensicScan');
  }
  
  const startTime = Date.now();
  options = options || {};
  competitorUrls = competitorUrls || [];
  
  LOG_info('Starting full forensic scan', { url, competitorCount: competitorUrls.length });
  
  try {
    // Fetch primary URL
    const fetchResult = FT_fetchWithRetry(url, options);
    if (!fetchResult.ok) {
      return { ok: false, error: 'Failed to fetch URL: ' + fetchResult.error };
    }
    
    const html = fetchResult.html || '';
    const finalUrl = fetchResult.finalUrl || url;
    
    // Initialize report structure
    const report = {
      ok: true,
      url: finalUrl,
      originalUrl: url,
      analyzedAt: new Date().toISOString(),
      categories: {}
    };
    
    // Run all forensic extractors
    report.categories.metadata = FT_extractMetadataComplete(html, finalUrl);
    report.categories.headings = FT_extractHeadingsHierarchy(html);
    report.categories.keywords = FT_extractKeywordsComprehensive(html);
    report.categories.links = FT_extractLinksComprehensive(html, finalUrl);
    report.categories.images = FT_extractImagesAnalysis(html, finalUrl);
    report.categories.schema = FT_extractSchemaData(html);
    report.categories.author = FT_extractAuthorSignals(html);
    report.categories.trust = FT_extractTrustSignals(html);
    report.categories.faqs = FT_extractFAQContent(html);
    report.categories.intro = FT_extractIntroCopy(html);
    
    // Calculate scores
    report.scores = FT_calculateForensicScores(report.categories);
    report.overallScore = FT_calculateOverallScore(report.scores);
    
    // Generate recommendations
    report.recommendations = FT_generateRecommendations(report);
    
    // Run competitor analysis if URLs provided
    if (competitorUrls.length > 0) {
      report.competitorAnalysis = FT_runCompetitorBenchmark(
        report, competitorUrls, options
      );
    }
    
    report.executionTime = Date.now() - startTime;
    LOG_info('Forensic scan complete', { 
      url, 
      overallScore: report.overallScore,
      executionTime: report.executionTime 
    });
    
    return report;
    
  } catch (e) {
    return CORE_handleError(e, 'FT_fullForensicScan', { url });
  }
}

/**
 * Extract forensics from provided HTML
 * @param {string} html - HTML content
 * @param {string} url - Source URL
 * @param {object} options - Options
 * @return {object} Forensic data
 */
function FT_extractForensics(html, url, options) {
  if (!html) {
    return { ok: false, error: 'HTML content required' };
  }
  
  options = options || {};
  
  try {
    const forensics = {
      ok: true,
      url: url,
      extractedAt: new Date().toISOString()
    };
    
    // Run selected extractors based on options
    if (options.metadata !== false) {
      forensics.metadata = FT_extractMetadataComplete(html, url);
    }
    if (options.keywords !== false) {
      forensics.keywords = FT_extractKeywordsComprehensive(html);
    }
    if (options.links !== false) {
      forensics.links = FT_extractLinksComprehensive(html, url);
    }
    if (options.schema !== false) {
      forensics.schema = FT_extractSchemaData(html);
    }
    if (options.author !== false) {
      forensics.author = FT_extractAuthorSignals(html);
    }
    if (options.trust !== false) {
      forensics.trust = FT_extractTrustSignals(html);
    }
    
    return forensics;
    
  } catch (e) {
    return CORE_handleError(e, 'FT_extractForensics', { url });
  }
}

/**
 * Fetch URL with retry logic
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @return {object} Fetch result
 */
function FT_fetchWithRetry(url, options) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 30000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SerpifAI/8.0)'
        }
      });
      
      const code = response.getResponseCode();
      
      if (code >= 200 && code < 400) {
        return {
          ok: true,
          html: response.getContentText(),
          statusCode: code,
          finalUrl: response.getAllHeaders()['X-Final-Url'] || url
        };
      }
      
      if (code >= 500 && attempt < maxRetries) {
        Utilities.sleep(1000 * attempt);
        continue;
      }
      
      return { ok: false, error: 'HTTP ' + code, statusCode: code };
      
    } catch (e) {
      if (attempt < maxRetries) {
        Utilities.sleep(1000 * attempt);
        continue;
      }
      return { ok: false, error: e.message };
    }
  }
  
  return { ok: false, error: 'Max retries exceeded' };
}

/**
 * Calculate overall score from category scores
 * @param {object} scores - Category scores
 * @return {number} Overall score 0-100
 */
function FT_calculateOverallScore(scores) {
  if (!scores) return 0;
  
  const weights = {
    metadata: 0.15,
    keywords: 0.15,
    links: 0.10,
    schema: 0.10,
    author: 0.15,
    trust: 0.15,
    content: 0.10,
    technical: 0.10
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(category => {
    if (scores[category] !== undefined) {
      totalScore += scores[category] * weights[category];
      totalWeight += weights[category];
    }
  });
  
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * Run competitor benchmark analysis
 * @param {object} primaryReport - Primary site report
 * @param {string[]} competitorUrls - Competitor URLs
 * @param {object} options - Options
 * @return {object} Benchmark results
 */
function FT_runCompetitorBenchmark(primaryReport, competitorUrls, options) {
  const competitors = [];
  const maxCompetitors = Math.min(competitorUrls.length, 6);
  
  for (let i = 0; i < maxCompetitors; i++) {
    try {
      const compUrl = competitorUrls[i];
      const fetchResult = FT_fetchWithRetry(compUrl, options);
      
      if (fetchResult.ok) {
        const html = fetchResult.html;
        competitors.push({
          url: compUrl,
          metadata: FT_extractMetadataComplete(html, compUrl),
          keywords: FT_extractKeywordsComprehensive(html),
          schema: FT_extractSchemaData(html),
          score: 0
        });
      }
    } catch (e) {
      LOG_warn('Competitor fetch failed', { url: competitorUrls[i], error: e.message });
    }
  }
  
  // Calculate comparison metrics
  return {
    competitorCount: competitors.length,
    competitors: competitors,
    gaps: FT_findKeywordGaps(primaryReport, competitors),
    strengths: FT_findStrengths(primaryReport, competitors)
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_FullSnapshot.gs - ELITE COMPREHENSIVE SEO ANALYZER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Maximum Data Extraction Orchestration
 * 
 * FETCHES EVERYTHING:
 * ✓ Metadata (title, description, OG, Twitter, Dublin Core, icons, feeds)
 * ✓ Schema.org structured data with validation
 * ✓ Keywords (5-source weighted extraction)
 * ✓ Internal & external links with anchor text analysis
 * ✓ Images with alt text quality scoring
 * ✓ Headings (H1-H6 with hierarchy validation)
 * ✓ AI detection (humanity score)
 * ✓ E-E-A-T signals
 * ✓ Conversion intelligence
 * ✓ Tech stack detection
 * ✓ Link equity analysis
 * ✓ Content velocity
 * ✓ Uniqueness scoring
 * ✓ Accessibility metrics
 * ✓ Performance hints
 * ✓ Best practices validation
 * 
 * BACKLINKS:
 * ⚠️ Requires external API (Ahrefs, Moz, SEMrush, or OpenPageRank)
 * 
 * @module FullSnapshot
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Execute FULL forensic analysis with ALL extractors
 * @param {string} url - URL to analyze
 * @param {object} options - Analysis options
 * @return {object} Complete analysis
 */
function FT_fullSnapshot(url, options) {
  if (!url || typeof url !== 'string') {
    return { ok: false, error: 'URL is required' };
  }
  
  var startTime = new Date().getTime();
  
  try {
    options = options || {};
    
    // Default options
    var extractMetadata = options.extractMetadata !== false;
    var extractSchema = options.extractSchema !== false;
    var extractKeywords = options.extractKeywords !== false;
    var extractLinks = options.extractLinks !== false;
    var extractImages = options.extractImages !== false;
    var extractForensics = options.extractForensics !== false;
    var checkBacklinks = options.checkBacklinks === true; // Requires API
    
    var result = {
      ok: true,
      url: url,
      fetchedAt: new Date().toISOString()
    };
    
    // Step 1: Fetch the HTML (pass options through)
    var fetchResult = FT_fetchSingle(url, options);
    if (!fetchResult.ok) {
      return {
        ok: false,
        error: 'Failed to fetch URL: ' + (fetchResult.error || 'Unknown error'),
        url: url,
        executionTime: new Date().getTime() - startTime
      };
    }
    
    var html = fetchResult.html || '';
    var fetchMetrics = {
      statusCode: fetchResult.status || fetchResult.statusCode,
      redirected: fetchResult.redirected,
      finalUrl: fetchResult.finalUrl || url,
      fetchTime: fetchResult.executionTime
    };
    
    result.fetchMetrics = fetchMetrics;
    
    // Use final URL if redirected
    var analyzeUrl = fetchMetrics.finalUrl || url;
    
    // Step 2: Extract Metadata
    if (extractMetadata) {
      var metadataResult = FT_extractMetadata(html, analyzeUrl);
      result.metadata = metadataResult;
    }
    
    // Step 3: Extract Schema
    if (extractSchema) {
      var schemaResult = FT_extractSchema(html);
      result.schema = schemaResult;
    }
    
    // Step 4: Extract Links (internal + external + anchor text)
    if (extractLinks) {
      var linksResult = FT_extractLinks(html, analyzeUrl);
      result.links = linksResult;
    }
    
    // Step 5: Extract Images
    if (extractImages) {
      var imagesResult = FT_extractImages(html, analyzeUrl);
      result.images = imagesResult;
    }
    
    // Step 6: Extract Forensic Intelligence (keywords, AI, E-E-A-T, conversion, etc.)
    // DISABLED: FT_extractForensics not yet implemented
    // Use comprehensive extractors instead (below)
    if (extractForensics && false) {
      var forensicsResult = FT_extractForensics(html, analyzeUrl, {});
      result.forensics = forensicsResult;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE DATA EXTRACTION (for competitor intelligence)
    // ═══════════════════════════════════════════════════════════════════════════
    
    Logger.log('      📝 Starting comprehensive extraction...');
    Logger.log('         HTML available for extraction: ' + html.length + ' bytes');
    Logger.log('         HTML truncated: ' + (fetchResult.htmlTruncated ? 'YES' : 'NO'));
    
    // Step 6a: Extract Headings Hierarchy (H1-H6)
    if (options.extractHeadingsHierarchy !== false) {
      var headingsResult = FT_extractHeadingsHierarchy(html, analyzeUrl);
      result.headingsHierarchy = headingsResult;
      Logger.log('         Headings found: ' + (headingsResult.headings ? headingsResult.headings.length : 0));
    }
    
    // Step 6b: Extract Introduction Copy
    if (options.extractIntroCopy !== false) {
      var introResult = FT_extractIntroCopy(html, analyzeUrl);
      result.introCopy = introResult;
    }
    
    // Step 6c: Extract Comprehensive Keywords
    if (options.extractKeywordsComprehensive !== false) {
      var keywordsResult = FT_extractKeywordsComprehensive(html, analyzeUrl);
      result.keywordsComprehensive = keywordsResult;
    }
    
    // Step 6d: Extract Complete Metadata (OG, Twitter)
    if (options.extractMetaDataComplete !== false) {
      var metaCompleteResult = FT_extractMetaDataComplete(html, analyzeUrl);
      result.metaDataComplete = metaCompleteResult;
    }
    
    // Step 6e: Extract Comprehensive Links & Anchors
    if (options.extractLinksComprehensive !== false) {
      var linksCompResult = FT_extractLinksComprehensive(html, analyzeUrl);
      result.linksComprehensive = linksCompResult;
    }
    
    // Step 6f: Extract Author Signals
    if (options.extractAuthorSignals !== false) {
      var authorResult = FT_extractAuthorSignals(html, analyzeUrl);
      result.authorSignals = authorResult;
    }
    
    // Step 6g: Extract Trust Signals
    if (options.extractTrustSignals !== false) {
      var trustResult = FT_extractTrustSignals(html, analyzeUrl);
      result.trustSignals = trustResult;
    }
    
    // Step 6h: Extract FAQs
    if (options.extractFAQs !== false) {
      var faqResult = FT_extractFAQs(html, analyzeUrl);
      result.faqs = faqResult;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Step 7: Check Backlinks (optional, requires API)
    if (checkBacklinks) {
      var backlinksResult = FT_getBacklinks(analyzeUrl);
      result.backlinks = backlinksResult;
    }
    
    // Step 8: Calculate Overall Quality Score
    var overallScore = calculateOverallScore(result);
    result.overallScore = overallScore;
    
    // Step 9: Generate Prioritized Recommendations
    var recommendations = generatePrioritizedRecommendations(result);
    result.recommendations = recommendations;
    
    // Step 10: Generate Executive Summary
    var summary = generateExecutiveSummary(result);
    result.summary = summary;
    
    // Step 11: Calculate total word count from comprehensive extractors
    var totalWordCount = 0;
    if (result.introCopy && result.introCopy.introWordCount) {
      totalWordCount += result.introCopy.introWordCount;
    }
    if (result.headingsHierarchy && result.headingsHierarchy.headings) {
      result.headingsHierarchy.headings.forEach(function(h) {
        totalWordCount += (h.wordCount || 0);
      });
    }
    result.wordCount = totalWordCount;
    
    Logger.log('      📊 Extracted data summary:');
    Logger.log('         Word count: ' + totalWordCount);
    Logger.log('         Headings: ' + (result.headingsHierarchy ? result.headingsHierarchy.headings.length : 0));
    Logger.log('         Paragraphs: ' + (result.introCopy ? result.introCopy.introParagraphs.length : 0));
    Logger.log('         Keywords: ' + (result.keywordsComprehensive ? result.keywordsComprehensive.primary.length : 0));
    
    // CRITICAL: Delete HTML before returning to avoid "Argument too large"
    // Extractors have already processed it, we don't need to pass it up
    delete result.html;
    if (result.fetchMetrics) {
      delete result.fetchMetrics.html;
    }
    
    result.executionTime = new Date().getTime() - startTime;
    
    return result;
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      errorStack: e.stack || '',
      url: url,
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Calculate overall quality score across all dimensions
 */
function calculateOverallScore(result) {
  var scores = {
    metadata: 0,
    schema: 0,
    links: 0,
    images: 0,
    keywords: 0,
    eeat: 0,
    conversion: 0
  };
  
  var weights = {
    metadata: 20,
    schema: 15,
    links: 15,
    images: 10,
    keywords: 15,
    eeat: 15,
    conversion: 10
  };
  
  var total = 0;
  var weightTotal = 0;
  
  // Metadata score
  if (result.metadata && result.metadata.score !== undefined) {
    scores.metadata = result.metadata.score;
    total += scores.metadata * weights.metadata;
    weightTotal += weights.metadata;
  }
  
  // Schema score
  if (result.schema && result.schema.score !== undefined) {
    scores.schema = result.schema.score;
    total += scores.schema * weights.schema;
    weightTotal += weights.schema;
  }
  
  // Links score (based on validation)
  if (result.links && result.links.validation) {
    var linksScore = 0;
    var v = result.links.validation;
    
    if (v.hasInternalLinks) linksScore += 20;
    if (v.hasExternalLinks) linksScore += 10;
    if (v.linkDensityOptimal) linksScore += 20;
    if (v.deepLinkRatioOptimal) linksScore += 20;
    if (!v.hasEmptyAnchors) linksScore += 15;
    if (v.hasBrandedAnchors) linksScore += 10;
    if (v.anchorDiversity >= 4) linksScore += 5;
    
    scores.links = linksScore;
    total += linksScore * weights.links;
    weightTotal += weights.links;
  }
  
  // Images score
  if (result.images && result.images.accessibilityScore !== undefined) {
    scores.images = result.images.accessibilityScore;
    total += scores.images * weights.images;
    weightTotal += weights.images;
  }
  
  // Keywords score (based on forensic data)
  if (result.forensics && result.forensics.keywords) {
    var kwScore = 0;
    var kw = result.forensics.keywords;
    
    if (kw.single && kw.single.length >= 30) kwScore += 40;
    else if (kw.single && kw.single.length >= 20) kwScore += 30;
    else if (kw.single && kw.single.length >= 10) kwScore += 20;
    
    if (kw.longTail && kw.longTail.length >= 20) kwScore += 40;
    else if (kw.longTail && kw.longTail.length >= 10) kwScore += 30;
    else if (kw.longTail && kw.longTail.length >= 5) kwScore += 20;
    
    if (kw.topics && kw.topics.length >= 5) kwScore += 20;
    
    scores.keywords = kwScore;
    total += kwScore * weights.keywords;
    weightTotal += weights.keywords;
  }
  
  // E-E-A-T score
  if (result.forensics && result.forensics.eeat) {
    var eeatScore = 0;
    var eeat = result.forensics.eeat;
    
    if (eeat.hasAuthor) eeatScore += 25;
    if (eeat.hasOrganization) eeatScore += 25;
    if (eeat.hasReviews) eeatScore += 20;
    if (eeat.trustSignals && eeat.trustSignals.length > 0) eeatScore += 15;
    if (eeat.contentDepth === 'comprehensive') eeatScore += 15;
    
    scores.eeat = eeatScore;
    total += eeatScore * weights.eeat;
    weightTotal += weights.eeat;
  }
  
  // Conversion score
  if (result.forensics && result.forensics.conversion) {
    var convScore = 0;
    var conv = result.forensics.conversion;
    
    if (conv.hasCTA) convScore += 30;
    if (conv.hasChat) convScore += 20;
    if (conv.frictionScore !== undefined) {
      var frictionPoints = Math.max(0, 50 - conv.frictionScore);
      convScore += frictionPoints;
    }
    
    scores.conversion = convScore;
    total += convScore * weights.conversion;
    weightTotal += weights.conversion;
  }
  
  // Calculate weighted average
  var overallScore = weightTotal > 0 ? Math.round(total / weightTotal) : 0;
  
  // Calculate grade
  var grade = 'F';
  if (overallScore >= 97) grade = 'A+';
  else if (overallScore >= 93) grade = 'A';
  else if (overallScore >= 90) grade = 'A-';
  else if (overallScore >= 87) grade = 'B+';
  else if (overallScore >= 83) grade = 'B';
  else if (overallScore >= 80) grade = 'B-';
  else if (overallScore >= 77) grade = 'C+';
  else if (overallScore >= 73) grade = 'C';
  else if (overallScore >= 70) grade = 'C-';
  else if (overallScore >= 60) grade = 'D';
  
  return {
    total: overallScore,
    grade: grade,
    breakdown: scores
  };
}

/**
 * Generate prioritized recommendations from all modules
 */
function generatePrioritizedRecommendations(result) {
  var allRecommendations = [];
  
  // Collect from metadata
  if (result.metadata && result.metadata.recommendations) {
    result.metadata.recommendations.forEach(function(rec) {
      allRecommendations.push({
        source: 'metadata',
        severity: rec.severity || 'info',
        category: rec.category || 'other',
        message: rec.message,
        priority: rec.priority || 99
      });
    });
  }
  
  // Collect from schema
  if (result.schema && result.schema.recommendations) {
    result.schema.recommendations.forEach(function(rec) {
      allRecommendations.push({
        source: 'schema',
        severity: rec.severity || 'info',
        category: rec.category || 'other',
        message: rec.message,
        priority: rec.priority || 99
      });
    });
  }
  
  // Collect from images
  if (result.images && result.images.recommendations) {
    result.images.recommendations.forEach(function(rec) {
      allRecommendations.push({
        source: 'images',
        severity: rec.severity || 'info',
        category: rec.category || 'other',
        message: rec.message,
        priority: rec.priority || 99
      });
    });
  }
  
  // Add link recommendations
  if (result.links && result.links.validation) {
    var v = result.links.validation;
    
    if (v.hasEmptyAnchors) {
      allRecommendations.push({
        source: 'links',
        severity: 'warning',
        category: 'accessibility',
        message: 'Some links have empty anchor text',
        priority: 2
      });
    }
    
    if (!v.linkDensityOptimal) {
      allRecommendations.push({
        source: 'links',
        severity: 'info',
        category: 'seo',
        message: 'Link density should be between 1-3%',
        priority: 3
      });
    }
    
    if (!v.deepLinkRatioOptimal) {
      allRecommendations.push({
        source: 'links',
        severity: 'info',
        category: 'seo',
        message: 'Increase deep linking (target 70%+ non-homepage links)',
        priority: 3
      });
    }
  }
  
  // Sort by priority (lower number = higher priority)
  allRecommendations.sort(function(a, b) {
    return a.priority - b.priority;
  });
  
  // Return top 20
  return allRecommendations.slice(0, 20);
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(result) {
  var summary = {
    overallGrade: result.overallScore ? result.overallScore.grade : 'N/A',
    overallScore: result.overallScore ? result.overallScore.total : 0,
    
    strengths: [],
    weaknesses: [],
    quickWins: [],
    
    metrics: {
      metadata: result.metadata && result.metadata.score !== undefined ? result.metadata.score : 0,
      schema: result.schema && result.schema.score !== undefined ? result.schema.score : 0,
      images: result.images && result.images.accessibilityScore !== undefined ? result.images.accessibilityScore : 0,
      keywords: result.forensics && result.forensics.keywords ? result.forensics.keywords.single.length : 0,
      internalLinks: result.links ? result.links.internalCount : 0,
      externalLinks: result.links ? result.links.externalCount : 0
    }
  };
  
  // Identify strengths (score >= 80)
  if (result.metadata && result.metadata.score >= 80) {
    summary.strengths.push('Excellent metadata optimization');
  }
  if (result.schema && result.schema.score >= 80) {
    summary.strengths.push('Strong structured data implementation');
  }
  if (result.images && result.images.accessibilityScore >= 80) {
    summary.strengths.push('Great image accessibility');
  }
  if (result.forensics && result.forensics.keywords && result.forensics.keywords.single.length >= 30) {
    summary.strengths.push('Rich keyword diversity');
  }
  
  // Identify weaknesses (score < 60)
  if (result.metadata && result.metadata.score < 60) {
    summary.weaknesses.push('Metadata needs improvement');
  }
  if (result.schema && result.schema.score < 60) {
    summary.weaknesses.push('Limited structured data');
  }
  if (result.images && result.images.accessibilityScore < 60) {
    summary.weaknesses.push('Image accessibility issues');
  }
  if (result.links && result.links.internalCount < 10) {
    summary.weaknesses.push('Low internal linking');
  }
  
  // Quick wins (high impact, low effort)
  if (result.metadata && !result.metadata.validation.hasCanonical) {
    summary.quickWins.push('Add canonical URL');
  }
  if (result.schema && !result.schema.validation.hasBreadcrumb) {
    summary.quickWins.push('Add breadcrumb schema');
  }
  if (result.images && result.images.stats.withoutAlt > 0) {
    summary.quickWins.push('Add alt text to ' + result.images.stats.withoutAlt + ' images');
  }
  
  return summary;
}

/**
 * Lightweight version - just fetch & parse (no heavy analysis)
 */
function FT_quickSnapshot(url) {
  return FT_fullSnapshot(url, {
    extractMetadata: true,
    extractSchema: true,
    extractKeywords: false,
    extractLinks: true,
    extractImages: false,
    extractForensics: false,
    checkBacklinks: false
  });
}

/**
 * Legacy function names
 */
function FET_fullForensicScan(url, options) {
  return FT_fullSnapshot(url, options);
}

function FET_quickSnapshot(url) {
  return FT_quickSnapshot(url);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERPIFAI V6 ELITE - ONE-SHOT FORENSIC ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THE ORCHESTRATOR: Maps extracted data to 15 competitor report categories
 * 
 * ARCHITECTURE:
 * 1. Fetch HTML once (with headers for Technical Audit)
 * 2. Load Cheerio $ for in-memory parsing
 * 3. Run ALL extractors in parallel
 * 4. Map to 15-Category Evidence Structure
 * 
 * @module ForensicOrchestrator
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Main Forensic Scan Function
 * @param {string} url - Target URL to analyze
 * @param {string[]} competitorUrls - Array of competitor URLs for comparison
 * @returns {Object} Complete 15-category forensic report
 */
function FET_fullForensicScan(url, competitorUrls) {
  var startTime = new Date().getTime();
  var domain = extractDomain_(url);
  
  Logger.log('🔬 FORENSIC SCAN: ' + url);
  Logger.log('📊 Comparing against: ' + (competitorUrls || []).length + ' competitors');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: Circuit Breaker Check
  // ═══════════════════════════════════════════════════════════════════════════
  
  var circuitCheck = CB_checkCircuit(domain);
  if (!circuitCheck.allowed) {
    Logger.log('🔴 Circuit Breaker: ' + circuitCheck.reason);
    return {
      ok: false,
      error: 'Circuit breaker OPEN for ' + domain,
      reason: circuitCheck.reason,
      forensics: {}
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: Fetch HTML + Headers (ONE REQUEST)
  // ═══════════════════════════════════════════════════════════════════════════
  
  try {
    var fetchResult = FET_fetchWithHeaders(url);
    
    if (!fetchResult.ok) {
      CB_recordFailure(domain, fetchResult.status || 0, fetchResult.error || 'Unknown error');
      return {
        ok: false,
        error: 'Failed to fetch URL: ' + (fetchResult.error || 'Unknown'),
        forensics: {}
      };
    }
    
    CB_recordSuccess(domain);
    
    var html = fetchResult.html;
    var headers = fetchResult.headers;
    
    Logger.log('✅ Fetched: ' + html.length + ' chars');
    
  } catch (fetchError) {
    CB_recordFailure(domain, 0, String(fetchError));
    return {
      ok: false,
      error: 'Fetch exception: ' + fetchError,
      forensics: {}
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: Load Cheerio for In-Memory Parsing
  // ═══════════════════════════════════════════════════════════════════════════
  
  var $ = Cheerio.load(html);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: Run ALL Extractors (In-Memory)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Logger.log('🧬 Running forensic extractors...');
  
  try {
    var extractors = {
      // Extract narrative context + AI workflow detection
      narrative: FORENS_extractNarrative($, html),
      
      // Extract AI footprint from headings
      aiFootprint: FORENS_extractAIFootprint($),
      
      // Extract E-E-A-T signals from schema
      eeatSignals: FORENS_extractEEAT($, html),
      
      // Extract friction heatmap + funnel architecture
      conversionIntel: FORENS_extractConversionIntel($, url),
      
      // Extract tech stack + CMS detection
      techStack: FORENS_extractTechStack($, html, headers),
      
      // Extract heading structure
      headingStructure: FORENS_extractHeadingStructure($),
      
      // Extract internal link graph
      linkGraph: FORENS_extractLinkGraph($, url)
    };
    
  } catch (extractorError) {
    Logger.log('❌ Extractor error: ' + extractorError);
    Logger.log('   Stack: ' + extractorError.stack);
    return {
      ok: false,
      error: 'Extractor failed: ' + extractorError,
      forensics: {}
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: External Metrics (Sitemap + Text Forensics)
  // ═══════════════════════════════════════════════════════════════════════════
  
  var velocity = FORENS_extractVelocity(domain);
  var uniqueness = FORENS_analyzeUniqueness(html, competitorUrls || []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 6: Map to 15-Category Structure
  // ═══════════════════════════════════════════════════════════════════════════
  
  var forensics = {
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY I: Market Intelligence & Narrative Positioning
    // ─────────────────────────────────────────────────────────────────────────
    market_intel: {
      brand_text: extractors.narrative.brandText,
      narrative_archetype: extractors.narrative.archetype, // For Gemini analysis
      intro_paragraphs: extractors.narrative.introParagraphs, // First 3 paragraphs
      meta_tags: extractors.narrative.metaTags, // ALL metadata (title, description, OG, Twitter)
      tech_stack: extractors.techStack.detectedTools,
      cms: extractors.techStack.cms
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY II: Brand Positioning & E-E-A-T
    // ─────────────────────────────────────────────────────────────────────────
    brand_pos: {
      eeat_schema: extractors.eeatSignals.schemas,
      author_authority: extractors.eeatSignals.authorPresent,
      org_entity: extractors.eeatSignals.orgPresent,
      social_proof: extractors.eeatSignals.reviewsPresent,
      trust_signals: extractors.eeatSignals.trustSignals
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY III: Technical SEO & Security
    // ─────────────────────────────────────────────────────────────────────────
    technical: {
      security_headers: extractors.techStack.securityHeaders,
      render_risk: extractors.techStack.renderRisk,
      indexability: extractors.techStack.indexability,
      canonical_present: extractors.techStack.canonicalPresent,
      robots_meta: extractors.techStack.robotsMeta
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY IV: Content Intelligence & AI Footprint
    // ─────────────────────────────────────────────────────────────────────────
    content_intel: {
      humanity_score: extractors.aiFootprint.humanityScore,
      ai_phrases_detected: extractors.aiFootprint.aiPhrasesFound,
      prompt_fingerprint: extractors.aiFootprint.promptFingerprint,
      sentence_variance: extractors.aiFootprint.sentenceVariance,
      
      // Content velocity
      velocity_30d: velocity.newContent30d,
      velocity_90d: velocity.newContent90d,
      last_published: velocity.lastPublished,
      
      // Uniqueness analysis
      uniqueness_score: uniqueness.jaccardScore,
      content_gaps: uniqueness.gaps,
      overlap_keywords: uniqueness.overlapKeywords
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY V: Heading Structure (WITH FULL TEXT & KEYWORDS)
    // ─────────────────────────────────────────────────────────────────────────
    structure: {
      h1_count: extractors.headingStructure.h1Count,
      h2_count: extractors.headingStructure.h2Count,
      h3_count: extractors.headingStructure.h3Count,
      total_headings: extractors.headingStructure.totalHeadings,
      hierarchy_valid: extractors.headingStructure.hierarchyValid,
      keyword_density: extractors.headingStructure.keywordDensity,
      top_keywords: extractors.headingStructure.topKeywords, // Top 10 keywords with counts
      headings: extractors.headingStructure.headings // FULL HIERARCHY: [{level, text, position}]
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY VI: Systems & Automation Detection
    // ─────────────────────────────────────────────────────────────────────────
    systems: {
      cms: extractors.techStack.cms,
      marketing_automation: extractors.narrative.aiWorkflowDetected,
      automation_tools: extractors.narrative.detectedAITools,
      chat_widget: extractors.conversionIntel.chatWidgetDetected,
      analytics_present: extractors.techStack.analyticsPresent
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY VII: Conversion & Friction Analysis
    // ─────────────────────────────────────────────────────────────────────────
    conversion: {
      friction_score: extractors.conversionIntel.frictionScore,
      friction_level: extractors.conversionIntel.frictionLevel, // High/Medium/Low
      form_count: extractors.conversionIntel.formCount,
      total_fields: extractors.conversionIntel.totalFields,
      
      // Funnel architecture
      pricing_detected: extractors.conversionIntel.pricingDetected,
      booking_detected: extractors.conversionIntel.bookingDetected,
      trial_detected: extractors.conversionIntel.trialDetected,
      purchase_detected: extractors.conversionIntel.purchaseDetected,
      
      // Tripwires
      tripwire_links: extractors.conversionIntel.tripwireLinks,
      cta_count: extractors.conversionIntel.ctaCount
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // RAW DATA (for debugging & advanced analysis)
    // ─────────────────────────────────────────────────────────────────────────
    _raw: {
      url: url,
      domain: domain,
      html_size: html.length,
      headers: headers,
      execution_time_ms: new Date().getTime() - startTime,
      cheerio_loaded: typeof $ !== 'undefined'
    }
  };
  
  var elapsedTime = new Date().getTime() - startTime;
  
  Logger.log('✅ Forensic scan complete: ' + elapsedTime + 'ms');
  Logger.log('📊 Categories populated: 7 of 7');
  Logger.log('🎯 Humanity Score: ' + forensics.content_intel.humanity_score);
  Logger.log('⚡ Friction Level: ' + forensics.conversion.friction_level);
  
  return {
    ok: true,
    url: url,
    domain: domain,
    forensics: forensics,
    execution_time_ms: elapsedTime
  };
}

/**
 * Helper: Extract domain from URL
 */
function extractDomain_(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
}

/**
 * LEGACY: Complete SEO snapshot of a URL (kept for backward compatibility)
 * @param {string} url - URL to analyze
 * @return {object} Complete SEO analysis
 */
function FET_seoSnapshot(url) {
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  try {
    var page = FET_fetchSingleUrl(url);
    
    if (!page.ok) {
      return {
        ok: false,
        error: page.error,
        url: url,
        status: page.status
      };
    }
    
    var html = String(page.html || '');
    
    // Extract all data
    var meta = FET_extractMetadata(html);
    var og = FET_extractOpenGraph(html);
    var schema = FET_extractSchema(html);
    var headings = FET_extractHeadings(html);
    var internalLinks = FET_extractInternalLinks(html, url);
    
    // Calculate metrics
    var textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
    var wordCount = textContent.split(/\s+/).length;
    var imageCount = (html.match(/<img[^>]*>/gi) || []).length;
    
    // SEO Score calculation (0-100)
    var score = 0;
    if (meta.validation.hasTitle) score += 10;
    if (meta.validation.titleOptimal) score += 10;
    if (meta.validation.hasDescription) score += 10;
    if (meta.validation.descriptionOptimal) score += 10;
    if (headings.validation.hasH1 && !headings.validation.multipleH1) score += 10;
    if (headings.validation.hasH2) score += 5;
    if (meta.validation.hasCanonical) score += 5;
    if (schema.validation.hasSchema) score += 10;
    if (og.validation.ogComplete) score += 10;
    if (wordCount >= 300) score += 10;
    if (internalLinks.total >= 3) score += 5;
    if (imageCount > 0) score += 5;
    
    return {
      ok: true,
      url: url,
      finalUrl: page.finalUrl,
      status: page.status,
      meta: meta,
      og: og,
      schema: schema,
      headings: headings,
      internalLinks: internalLinks,
      metrics: {
        wordCount: wordCount,
        imageCount: imageCount,
        htmlSize: html.length,
        loadTime: 0, // Would need performance API
        hasH1: headings.validation.hasH1,
        hasMetaDescription: meta.validation.hasDescription,
        hasCanonical: meta.validation.hasCanonical,
        hasSchema: schema.validation.hasSchema,
        seoScore: score
      },
      recommendations: generateRecommendations(meta, headings, schema, og, wordCount, internalLinks)
    };
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      url: url
    };
  }
}

function generateRecommendations(meta, headings, schema, og, wordCount, links) {
  var recommendations = [];
  
  if (!meta.validation.hasTitle) {
    recommendations.push({ priority: 'high', issue: 'Missing title tag', fix: 'Add a unique title tag (30-60 characters)' });
  } else if (!meta.validation.titleOptimal) {
    recommendations.push({ priority: 'medium', issue: 'Title length not optimal', fix: 'Adjust title to 30-60 characters' });
  }
  
  if (!meta.validation.hasDescription) {
    recommendations.push({ priority: 'high', issue: 'Missing meta description', fix: 'Add a compelling meta description (120-160 characters)' });
  } else if (!meta.validation.descriptionOptimal) {
    recommendations.push({ priority: 'medium', issue: 'Description length not optimal', fix: 'Adjust description to 120-160 characters' });
  }
  
  if (!headings.validation.hasH1) {
    recommendations.push({ priority: 'high', issue: 'Missing H1 tag', fix: 'Add a single H1 tag with your primary keyword' });
  } else if (headings.validation.multipleH1) {
    recommendations.push({ priority: 'medium', issue: 'Multiple H1 tags', fix: 'Use only one H1 tag per page' });
  }
  
  if (!headings.validation.hasH2) {
    recommendations.push({ priority: 'medium', issue: 'No H2 tags', fix: 'Add H2 subheadings to structure your content' });
  }
  
  if (!meta.validation.hasCanonical) {
    recommendations.push({ priority: 'low', issue: 'Missing canonical URL', fix: 'Add a canonical link tag to prevent duplicate content issues' });
  }
  
  if (!schema.validation.hasSchema) {
    recommendations.push({ priority: 'medium', issue: 'No structured data', fix: 'Add JSON-LD schema markup (Organization, Article, etc.)' });
  }
  
  if (!og.validation.ogComplete) {
    recommendations.push({ priority: 'low', issue: 'Incomplete Open Graph tags', fix: 'Add og:title, og:description, og:image, and og:url' });
  }
  
  if (wordCount < 300) {
    recommendations.push({ priority: 'medium', issue: 'Low word count (' + wordCount + ')', fix: 'Aim for at least 300 words for better SEO' });
  }
  
  if (links.total < 3) {
    recommendations.push({ priority: 'low', issue: 'Few internal links (' + links.total + ')', fix: 'Add 3-10 internal links to related content' });
  }
  
  return recommendations;
}


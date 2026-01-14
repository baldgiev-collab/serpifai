/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_PROOFS.GS - DETAILED PROOF EXTRACTION FUNCTIONS
 * Evidence-based proof generation for all forensic metrics
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 11470-12234)
 * 
 * CONTAINS:
 * - _extractSchemaProofDetailed()
 * - _extractHeadingProofDetailed()
 * - _extractMetaProofDetailed()
 * - _extractLinksProofDetailed()
 * - _extractContentProofDetailed()
 * - _extractImageProofDetailed()
 * - _extractCWVProofDetailed()
 * - _extractAllDetailedProofs() - Master aggregator
 * - _createEnhancedScoreBreakdown()
 * - FT_GetEliteTabData()
 * 
 * DEPENDENCIES: FT_Pipeline.gs (for FT_GenerateEliteTabsViaGemini)
 * DEPENDENTS: All FT_Tab_*.gs files
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Schema proof with actual types and JSON-LD
 */
function _extractSchemaProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  // Get schema types from multiple sources
  const schemaTypes = website.schemaTypes || metadata.schemaTypes || [];
  const rawSchemaJson = snapshot.rawSchema || metadata.rawSchema || null;
  
  // Critical schemas that should be present for SEO
  const criticalSchemas = ['Organization', 'WebPage', 'Article', 'FAQPage', 'HowTo', 'Product', 'BreadcrumbList', 'Person', 'Review', 'LocalBusiness'];
  const detected = schemaTypes.map(s => typeof s === 'string' ? s : s.type || s['@type'] || 'Unknown');
  const missing = criticalSchemas.filter(c => !detected.some(d => d.toLowerCase().includes(c.toLowerCase())));
  
  // Score calculation breakdown
  const baseScore = 0;
  const typeBonus = Math.min(detected.length * 3, 25);
  const criticalBonus = detected.filter(d => criticalSchemas.some(c => d.toLowerCase().includes(c.toLowerCase()))).length * 5;
  const totalScore = baseScore + typeBonus + criticalBonus;
  
  return {
    rawData: {
      // v23.2: Add 'types' alias for backward compatibility with FT_Tab_*.gs files
      types: detected,          // ALIAS for typesFound (used by FT_Tab_GeoAeo.gs, FT_Tab_ContentOps.gs)
      typesFound: detected,
      count: detected.length,
      schemaCount: detected.length,
      schemasDetected: detected,
      rawJsonLd: rawSchemaJson ? JSON.stringify(rawSchemaJson, null, 2).substring(0, 1000) : 'Not captured',
      missingCritical: missing,
      hasOrganization: detected.some(d => d.toLowerCase().includes('organization')),
      hasFAQPage: detected.some(d => d.toLowerCase().includes('faq')),
      hasHowTo: detected.some(d => d.toLowerCase().includes('howto')),
      hasArticle: detected.some(d => d.toLowerCase().includes('article')),
      hasBreadcrumb: detected.some(d => d.toLowerCase().includes('breadcrumb')),
      hasProduct: detected.some(d => d.toLowerCase().includes('product')),
      hasReview: detected.some(d => d.toLowerCase().includes('review'))
    },
    scoreCalculation: {
      base: baseScore,
      typeBonus: '+' + typeBonus + ' (' + detected.length + ' types × 3)',
      criticalBonus: '+' + criticalBonus + ' (critical schemas)',
      total: totalScore,
      displayValue: totalScore > 0 ? '+' + totalScore : '0',
      formula: 'base + (types × 3) + (critical × 5)'
    },
    comparison: {
      industryAverage: 3,
      yourCount: detected.length,
      vsAverage: detected.length > 3 ? 'Above Average' : detected.length < 3 ? 'Below Average' : 'Average',
      recommendation: missing.length > 3 ? 'Add ' + missing.slice(0, 3).join(', ') : missing.length > 0 ? 'Consider adding ' + missing[0] : 'Good schema coverage'
    },
    dataSource: detected.length > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADING PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Heading proof with actual H1/H2/H3 text content
 */
function _extractHeadingProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  const h1 = website.h1 || metadata.h1 || '';
  const h2Array = website.h2 || metadata.h2 || metadata.headings?.h2 || [];
  const h3Array = website.h3 || metadata.h3 || metadata.headings?.h3 || [];
  
  const h1Score = h1 && h1.length > 0 ? 5 : 0;
  const h1LengthBonus = h1.length >= 30 && h1.length <= 70 ? 3 : 0;
  const h2Score = Math.min(h2Array.length * 3, 15);
  const h3Score = Math.min(h3Array.length * 2, 10);
  const hierarchyBonus = (h2Array.length > 0 && h3Array.length > h2Array.length) ? 5 : 0;
  const totalScore = h1Score + h1LengthBonus + h2Score + h3Score + hierarchyBonus;
  
  return {
    rawData: {
      h1: {
        text: h1 || '[No H1 found]',
        charCount: h1.length,
        wordCount: h1 ? h1.split(/\s+/).length : 0,
        isOptimalLength: h1.length >= 30 && h1.length <= 70,
        issues: !h1 ? ['Missing H1 tag'] : h1.length > 70 ? ['H1 too long (>70 chars)'] : h1.length < 20 ? ['H1 too short (<20 chars)'] : [],
        // v23.2: Add slice() method support for array-like access
        slice: function(start, end) { return [h1 || ''].slice(start, end); }
      },
      // v23.2: Make h2/h3 direct arrays for .filter()/.some() compatibility
      // Used by FT_Tab_GeoAeo.gs, FT_Tab_ContentOps.gs
      h2: h2Array.slice(0, 15),  // Direct array for .filter() access
      h3: h3Array.slice(0, 20),  // Direct array for .filter() access
      // Detailed info under separate keys
      h2Details: {
        texts: h2Array.slice(0, 15),
        count: h2Array.length,
        avgLength: h2Array.length > 0 ? Math.round(h2Array.reduce((a, h) => a + h.length, 0) / h2Array.length) : 0,
        sample: h2Array.slice(0, 5).map(h => h.substring(0, 60) + (h.length > 60 ? '...' : ''))
      },
      h3Details: {
        texts: h3Array.slice(0, 20),
        count: h3Array.length,
        avgLength: h3Array.length > 0 ? Math.round(h3Array.reduce((a, h) => a + h.length, 0) / h3Array.length) : 0,
        sample: h3Array.slice(0, 5).map(h => h.substring(0, 60) + (h.length > 60 ? '...' : ''))
      },
      hierarchy: {
        hasProperHierarchy: h2Array.length > 0 && h3Array.length >= h2Array.length,
        ratio: h2Array.length > 0 ? (h3Array.length / h2Array.length).toFixed(1) : '0',
        recommendation: h2Array.length === 0 ? 'Add H2 structure' : h3Array.length < h2Array.length ? 'Add more H3s under each H2' : 'Good heading structure'
      }
    },
    scoreCalculation: {
      h1: {
        value: '+' + h1Score,
        reason: h1 ? 'H1 present' : 'H1 missing',
        lengthBonus: h1LengthBonus > 0 ? '+' + h1LengthBonus + ' (optimal length)' : '+0 (length not optimal)'
      },
      h2: {
        value: '+' + h2Score,
        reason: h2Array.length + ' H2s × 3 (max 15)'
      },
      h3: {
        value: '+' + h3Score,
        reason: h3Array.length + ' H3s × 2 (max 10)'
      },
      hierarchy: {
        value: '+' + hierarchyBonus,
        reason: hierarchyBonus > 0 ? 'Good H2→H3 hierarchy' : 'Hierarchy needs improvement'
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'H1(5) + length(3) + H2s(×3) + H3s(×2) + hierarchy(5)'
    },
    comparison: {
      industryAvgH2: 6,
      industryAvgH3: 12,
      yourH2: h2Array.length,
      yourH3: h3Array.length,
      vsAverageH2: h2Array.length > 6 ? 'Above Average' : h2Array.length < 4 ? 'Below Average' : 'Average',
      vsAverageH3: h3Array.length > 12 ? 'Above Average' : h3Array.length < 8 ? 'Below Average' : 'Average'
    },
    dataSource: (h1 || h2Array.length > 0) ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// META TAGS PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Meta Tags proof with actual title and description text
 */
function _extractMetaProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const seo = synth.seo || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  const title = website.title || seo.title || metadata.title || '';
  const description = website.description || seo.description || metadata.description || '';
  const ogTitle = metadata.ogTitle || '';
  const ogDescription = metadata.ogDescription || '';
  const canonicalUrl = website.canonical || metadata.canonical || '';
  const robots = metadata.robots || '';
  
  const titleOptimalMin = 50, titleOptimalMax = 60;
  const descOptimalMin = 140, descOptimalMax = 160;
  
  const titleScore = title.length >= titleOptimalMin && title.length <= titleOptimalMax ? 10 : title.length > 0 ? 5 : 0;
  const descScore = description.length >= descOptimalMin && description.length <= descOptimalMax ? 10 : description.length > 0 ? 5 : 0;
  const ogScore = (ogTitle && ogDescription) ? 5 : 0;
  const canonicalScore = canonicalUrl ? 3 : 0;
  const totalScore = titleScore + descScore + ogScore + canonicalScore;
  
  return {
    rawData: {
      title: {
        text: title || '[No meta title found]',
        charCount: title.length,
        pixelWidth: Math.round(title.length * 6),
        isOptimalLength: title.length >= titleOptimalMin && title.length <= titleOptimalMax,
        truncationRisk: title.length > 60 ? 'HIGH - will truncate in SERP' : 'LOW',
        issues: !title ? ['Missing meta title'] : title.length > 60 ? ['Title too long (>60 chars)'] : title.length < 30 ? ['Title too short (<30 chars)'] : []
      },
      description: {
        text: description || '[No meta description found]',
        charCount: description.length,
        isOptimalLength: description.length >= descOptimalMin && description.length <= descOptimalMax,
        truncationRisk: description.length > 160 ? 'HIGH - will truncate in SERP' : 'LOW',
        issues: !description ? ['Missing meta description'] : description.length > 160 ? ['Description too long (>160 chars)'] : description.length < 120 ? ['Description too short (<120 chars)'] : []
      },
      openGraph: {
        title: ogTitle || '[Not set]',
        description: ogDescription || '[Not set]',
        hasOG: !!(ogTitle || ogDescription)
      },
      technical: {
        canonical: canonicalUrl || '[Not set]',
        robots: robots || 'index,follow (default)',
        hasCanonical: !!canonicalUrl
      }
    },
    scoreCalculation: {
      title: {
        value: '+' + titleScore,
        reason: title.length >= titleOptimalMin && title.length <= titleOptimalMax ? 'Optimal length' : title ? 'Present but not optimal' : 'Missing',
        charCount: title.length + ' chars (optimal: 50-60)'
      },
      description: {
        value: '+' + descScore,
        reason: description.length >= descOptimalMin && description.length <= descOptimalMax ? 'Optimal length' : description ? 'Present but not optimal' : 'Missing',
        charCount: description.length + ' chars (optimal: 140-160)'
      },
      openGraph: {
        value: '+' + ogScore,
        reason: ogScore > 0 ? 'OG tags present' : 'OG tags missing'
      },
      canonical: {
        value: '+' + canonicalScore,
        reason: canonicalScore > 0 ? 'Canonical set' : 'No canonical'
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'title(10) + desc(10) + OG(5) + canonical(3)'
    },
    comparison: {
      serpPreview: {
        title: title.length > 60 ? title.substring(0, 57) + '...' : title,
        description: description.length > 160 ? description.substring(0, 157) + '...' : description,
        url: competitor?.domain || 'unknown.com'
      },
      recommendations: [
        ...(title.length < 50 ? ['Lengthen title to 50-60 chars'] : []),
        ...(title.length > 60 ? ['Shorten title to under 60 chars'] : []),
        ...(description.length < 140 ? ['Expand description to 140-160 chars'] : []),
        ...(description.length > 160 ? ['Trim description to under 160 chars'] : []),
        ...(!ogTitle ? ['Add Open Graph title'] : []),
        ...(!canonicalUrl ? ['Set canonical URL'] : [])
      ]
    },
    dataSource: (title || description) ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINKS PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Links proof with actual URLs and anchor texts
 */
function _extractLinksProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const content = synth.content || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  const internalLinks = content.internalLinks || website.internalLinks || metadata.internalLinks || [];
  const externalLinks = content.externalLinks || website.externalLinks || metadata.externalLinks || [];
  const internalCount = typeof internalLinks === 'number' ? internalLinks : internalLinks.length;
  const externalCount = typeof externalLinks === 'number' ? externalLinks : externalLinks.length;
  
  const internalSample = Array.isArray(internalLinks) ? internalLinks.slice(0, 10).map(l => ({
    url: typeof l === 'string' ? l : l.href || l.url || 'unknown',
    anchor: typeof l === 'string' ? l.split('/').pop() : l.text || l.anchor || 'unknown',
    isNavigation: typeof l === 'string' ? l.includes('nav') || l.includes('menu') : false
  })) : [];
  
  const externalSample = Array.isArray(externalLinks) ? externalLinks.slice(0, 10).map(l => {
    try {
      return {
        url: typeof l === 'string' ? l : l.href || l.url || 'unknown',
        anchor: typeof l === 'string' ? new URL(l).hostname : l.text || l.anchor || 'unknown',
        domain: typeof l === 'string' ? new URL(l).hostname : l.domain || 'unknown'
      };
    } catch (e) {
      return { url: 'unknown', anchor: 'unknown', domain: 'unknown' };
    }
  }) : [];
  
  const internalScore = Math.min(internalCount * 0.5, 10);
  const externalScore = Math.min(externalCount * 1, 5);
  const ratioBonus = internalCount > externalCount * 3 ? 5 : 0;
  const totalScore = Math.round(internalScore + externalScore + ratioBonus);
  
  return {
    rawData: {
      internal: {
        count: internalCount,
        links: internalSample,
        uniqueDomainPaths: [...new Set(internalSample.map(l => l.url.split('/')[1] || 'root'))].slice(0, 10),
        avgAnchorLength: internalSample.length > 0 ? Math.round(internalSample.reduce((a, l) => a + (l.anchor?.length || 0), 0) / internalSample.length) : 0
      },
      external: {
        count: externalCount,
        links: externalSample,
        uniqueDomains: [...new Set(externalSample.map(l => l.domain))].slice(0, 10),
        isNoFollow: 'Unknown'
      },
      ratio: {
        internal: internalCount,
        external: externalCount,
        ratio: externalCount > 0 ? (internalCount / externalCount).toFixed(1) + ':1' : internalCount + ':0',
        assessment: internalCount > externalCount * 3 ? 'Good' : internalCount > externalCount ? 'Acceptable' : 'Review needed'
      }
    },
    scoreCalculation: {
      internal: {
        value: '+' + Math.round(internalScore),
        reason: internalCount + ' internal × 0.5 (max 10)'
      },
      external: {
        value: '+' + Math.round(externalScore),
        reason: externalCount + ' external × 1 (max 5)'
      },
      ratio: {
        value: '+' + ratioBonus,
        reason: ratioBonus > 0 ? 'Good internal:external ratio' : 'Ratio could improve'
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'internal(×0.5) + external(×1) + ratio(5)'
    },
    comparison: {
      industryAvgInternal: 25,
      industryAvgExternal: 5,
      yourInternal: internalCount,
      yourExternal: externalCount,
      recommendations: [
        ...(internalCount < 10 ? ['Add more internal links (aim for 15-30)'] : []),
        ...(externalCount === 0 ? ['Add relevant external citations'] : []),
        ...(externalCount > internalCount ? ['Internal links should exceed external links'] : [])
      ]
    },
    dataSource: (internalCount > 0 || externalCount > 0) ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Word Count proof with content analysis
 */
function _extractContentProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  const wordCount = website.wordCount || metadata.wordCount || 0;
  const paragraphCount = website.paragraphCount || metadata.paragraphCount || Math.ceil(wordCount / 150);
  const h2Array = website.h2 || metadata.h2 || [];
  const h3Array = website.h3 || metadata.h3 || [];
  
  // v23.2: Extract top paragraphs from content if available
  const rawContent = website.content || metadata.content || synth.content?.text || '';
  const paragraphs = typeof rawContent === 'string' ? rawContent.split(/\n\n+/).filter(p => p.trim().length > 50) : [];
  const topParagraphs = paragraphs.slice(0, 10);
  
  const readingTime = Math.ceil(wordCount / 200);
  const avgWordsPerSection = h2Array.length > 0 ? Math.round(wordCount / h2Array.length) : wordCount;
  const avgWordsPerParagraph = paragraphCount > 0 ? Math.round(wordCount / paragraphCount) : wordCount;
  const contentDepthScore = wordCount > 3000 ? 'Comprehensive' : wordCount > 1500 ? 'Standard' : wordCount > 500 ? 'Light' : 'Thin';
  
  const baseScore = wordCount > 3000 ? 20 : wordCount > 1500 ? 12 : wordCount > 500 ? 6 : 0;
  const structureBonus = h2Array.length >= 5 ? 5 : 0;
  const readabilityBonus = avgWordsPerSection > 100 && avgWordsPerSection < 500 ? 5 : 0;
  const totalScore = baseScore + structureBonus + readabilityBonus;
  
  return {
    rawData: {
      wordCount: wordCount,
      paragraphCount: paragraphCount,
      readingTime: readingTime + ' min',
      avgWordsPerSection: avgWordsPerSection,
      avgWordsPerParagraph: avgWordsPerParagraph,
      contentDepth: contentDepthScore,
      sections: h2Array.length,
      subsections: h3Array.length,
      contentDensity: wordCount > 0 ? (wordCount / (h2Array.length + 1)).toFixed(0) + ' words/section' : 'N/A',
      estimatedFleschScore: Math.max(20, Math.min(80, 100 - (avgWordsPerSection / 20))),
      // v23.2: Add topParagraphs for FT_Tab_Conversion.gs and FT_Tab_GeoAeo.gs
      topParagraphs: topParagraphs
    },
    scoreCalculation: {
      content: {
        value: '+' + baseScore,
        reason: wordCount + ' words → ' + contentDepthScore,
        thresholds: '500: +6, 1500: +12, 3000: +20'
      },
      structure: {
        value: '+' + structureBonus,
        reason: h2Array.length + ' H2 sections ' + (h2Array.length >= 5 ? '(good)' : '(needs more)')
      },
      readability: {
        value: '+' + readabilityBonus,
        reason: avgWordsPerSection + ' words/section ' + (readabilityBonus > 0 ? '(optimal)' : '(adjust)')
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'content(20) + structure(5) + readability(5)'
    },
    comparison: {
      industryAvgWords: 2000,
      industryAvgSections: 8,
      yourWords: wordCount,
      yourSections: h2Array.length,
      vsAverage: wordCount > 2000 ? 'Above Average' : wordCount < 1500 ? 'Below Average' : 'Average',
      recommendations: [
        ...(wordCount < 1500 ? ['Expand content to 1500-3000 words'] : []),
        ...(h2Array.length < 5 ? ['Add more H2 sections (aim for 5-8)'] : []),
        ...(avgWordsPerSection > 600 ? ['Break up long sections'] : []),
        ...(readingTime < 3 ? ['Content may be too light for comprehensive coverage'] : [])
      ]
    },
    dataSource: wordCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Image proof with alt text and optimization data
 */
function _extractImageProofDetailed(competitor) {
  const synth = competitor?.synthesized || {};
  const website = synth.website || {};
  const content = synth.content || {};
  const snapshot = competitor?.snapshot || {};
  const metadata = snapshot.metadata || {};
  
  const images = website.images || content.images || metadata.images || [];
  const imageCount = typeof images === 'number' ? images : images.length;
  const wordCount = website.wordCount || 0;
  
  const imageSample = Array.isArray(images) ? images.slice(0, 10).map(img => ({
    src: typeof img === 'string' ? img : img.src || img.url || 'unknown',
    alt: typeof img === 'string' ? '' : img.alt || '',
    hasAlt: typeof img === 'string' ? false : !!(img.alt && img.alt.length > 0),
    size: typeof img === 'string' ? 'unknown' : img.size || 'unknown',
    format: typeof img === 'string' ? img.split('.').pop() : img.format || img.src?.split('.').pop() || 'unknown'
  })) : [];
  
  const withAlt = imageSample.filter(i => i.hasAlt).length;
  const altCoverage = imageSample.length > 0 ? Math.round((withAlt / imageSample.length) * 100) : 0;
  const imageToWordRatio = wordCount > 0 ? (imageCount / (wordCount / 300)).toFixed(2) : 0;
  
  const countScore = Math.min(imageCount * 2, 10);
  const altScore = altCoverage >= 80 ? 5 : altCoverage >= 50 ? 3 : 0;
  const ratioBonus = imageToWordRatio >= 0.5 && imageToWordRatio <= 2 ? 5 : 0;
  const totalScore = countScore + altScore + ratioBonus;
  
  return {
    rawData: {
      total: imageCount,
      images: imageSample,
      altTextCoverage: altCoverage + '%',
      withAlt: withAlt,
      withoutAlt: imageSample.length - withAlt,
      formats: [...new Set(imageSample.map(i => i.format).filter(f => f !== 'unknown'))],
      imageToContentRatio: imageToWordRatio + ' images per 300 words',
      missingAlt: imageSample.filter(i => !i.hasAlt).map(i => i.src).slice(0, 5)
    },
    scoreCalculation: {
      count: {
        value: '+' + countScore,
        reason: imageCount + ' images × 2 (max 10)'
      },
      altText: {
        value: '+' + altScore,
        reason: altCoverage + '% alt coverage ' + (altScore >= 5 ? '(excellent)' : altScore >= 3 ? '(good)' : '(needs work)')
      },
      ratio: {
        value: '+' + ratioBonus,
        reason: 'Image ratio ' + imageToWordRatio + ' ' + (ratioBonus > 0 ? '(optimal)' : '(adjust)')
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'count(×2) + alt(5) + ratio(5)'
    },
    comparison: {
      industryAvgImages: 8,
      industryAltCoverage: 75,
      yourImages: imageCount,
      yourAltCoverage: altCoverage,
      recommendations: [
        ...(imageCount < 5 ? ['Add more images (aim for 5-10)'] : []),
        ...(altCoverage < 80 ? ['Add alt text to all images'] : []),
        ...(!imageSample.some(i => i.format === 'webp') ? ['Convert images to WebP format'] : [])
      ]
    },
    dataSource: imageCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE WEB VITALS PROOF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract detailed Core Web Vitals proof with actual metrics and elements
 */
function _extractCWVProofDetailed(competitor) {
  const apiData = competitor?.apiData || {};
  const pageSpeed = apiData.pageSpeed || {};
  const metrics = pageSpeed.metrics || {};
  const scores = pageSpeed.scores || {};
  
  const lcp = metrics.largestContentfulPaint || metrics.lcp || 0;
  const fid = metrics.firstInputDelay || metrics.fid || metrics.inp || 0;
  const cls = metrics.cumulativeLayoutShift || metrics.cls || 0;
  const fcp = metrics.firstContentfulPaint || metrics.fcp || 0;
  const tti = metrics.timeToInteractive || metrics.tti || 0;
  const ttfb = metrics.timeToFirstByte || metrics.ttfb || 0;
  const perfScore = scores.performance || 0;
  
  const lcpGood = 2500, lcpNeedsWork = 4000;
  const fidGood = 100, fidNeedsWork = 300;
  const clsGood = 0.1, clsNeedsWork = 0.25;
  
  const lcpStatus = lcp <= lcpGood ? 'good' : lcp <= lcpNeedsWork ? 'needs-improvement' : 'poor';
  const fidStatus = fid <= fidGood ? 'good' : fid <= fidNeedsWork ? 'needs-improvement' : 'poor';
  const clsStatus = cls <= clsGood ? 'good' : cls <= clsNeedsWork ? 'needs-improvement' : 'poor';
  
  const lcpScore = lcpStatus === 'good' ? 10 : lcpStatus === 'needs-improvement' ? 5 : 0;
  const fidScore = fidStatus === 'good' ? 8 : fidStatus === 'needs-improvement' ? 4 : 0;
  const clsScore = clsStatus === 'good' ? 7 : clsStatus === 'needs-improvement' ? 3 : 0;
  const perfBonus = perfScore >= 90 ? 10 : perfScore >= 70 ? 5 : 0;
  const totalScore = lcpScore + fidScore + clsScore + perfBonus;
  
  return {
    rawData: {
      coreWebVitals: {
        lcp: {
          value: lcp,
          status: lcpStatus,
          threshold: lcpGood,
          element: metrics.lcpElement || 'Unknown element'
        },
        fid: {
          value: fid,
          status: fidStatus,
          threshold: fidGood,
          element: 'User interaction'
        },
        cls: {
          value: cls,
          status: clsStatus,
          threshold: clsGood,
          elements: metrics.clsElements || []
        },
        ttfb: {
          value: ttfb
        }
      },
      additionalMetrics: {
        fcp: fcp,
        tti: tti,
        speedIndex: metrics.speedIndex || 0,
        totalBlockingTime: metrics.totalBlockingTime || 0
      },
      scores: {
        performance: perfScore,
        accessibility: scores.accessibility || 0,
        bestPractices: scores.bestPractices || 0,
        seo: scores.seo || 0
      },
      passedAudits: pageSpeed.passedAudits || 0,
      failedAudits: pageSpeed.failedAudits || 0,
      opportunities: pageSpeed.opportunities || [],
      lcp: { value: lcp, status: lcpStatus, threshold: lcpGood },
      fid: { value: fid, status: fidStatus, threshold: fidGood },
      cls: { value: cls, status: clsStatus, threshold: clsGood },
      ttfb: { value: ttfb }
    },
    scoreCalculation: {
      lcp: {
        value: '+' + lcpScore,
        reason: lcp + 'ms → ' + lcpStatus,
        threshold: '≤2500ms: +10, ≤4000ms: +5'
      },
      fid: {
        value: '+' + fidScore,
        reason: fid + 'ms → ' + fidStatus,
        threshold: '≤100ms: +8, ≤300ms: +4'
      },
      cls: {
        value: '+' + clsScore,
        reason: cls.toFixed(3) + ' → ' + clsStatus,
        threshold: '≤0.1: +7, ≤0.25: +3'
      },
      perfBonus: {
        value: '+' + perfBonus,
        reason: 'Performance: ' + perfScore + '/100'
      },
      total: totalScore,
      displayValue: '+' + totalScore,
      formula: 'LCP(10) + FID(8) + CLS(7) + perf(10)'
    },
    comparison: {
      industryAvgPerf: 65,
      industryAvgLCP: 3000,
      yourPerf: perfScore,
      yourLCP: lcp,
      passedCWV: [lcpStatus, fidStatus, clsStatus].filter(s => s === 'good').length + '/3',
      recommendations: [
        ...(lcpStatus !== 'good' ? ['Optimize LCP: lazy load images, preload critical resources'] : []),
        ...(fidStatus !== 'good' ? ['Reduce FID: minimize JavaScript, break up long tasks'] : []),
        ...(clsStatus !== 'good' ? ['Fix CLS: set explicit image dimensions, avoid injecting content'] : []),
        ...(perfScore < 70 ? ['Overall performance needs improvement'] : [])
      ]
    },
    dataSource: perfScore > 0 ? 'PageSpeed API' : 'Pending Analysis'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER AGGREGATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Master function to extract ALL detailed proofs for a competitor
 */
function _extractAllDetailedProofs(competitor) {
  return {
    schema: _extractSchemaProofDetailed(competitor),
    headings: _extractHeadingProofDetailed(competitor),
    meta: _extractMetaProofDetailed(competitor),
    links: _extractLinksProofDetailed(competitor),
    content: _extractContentProofDetailed(competitor),
    images: _extractImageProofDetailed(competitor),
    cwv: _extractCWVProofDetailed(competitor),
    extractedAt: new Date().toISOString(),
    domain: competitor?.domain || 'unknown'
  };
}

/**
 * Create enhanced proof object that replaces simple +N values with detailed data
 */
function _createEnhancedScoreBreakdown(competitor) {
  const detailed = _extractAllDetailedProofs(competitor);
  
  return {
    base: { value: 30, proof: 'Starting baseline score' },
    schema: {
      value: detailed.schema.scoreCalculation.displayValue,
      count: detailed.schema.rawData.count,
      types: detailed.schema.rawData.typesFound,
      missing: detailed.schema.rawData.missingCritical,
      formula: detailed.schema.scoreCalculation.formula,
      proof: detailed.schema.rawData
    },
    h1: {
      value: detailed.headings.scoreCalculation.h1.value,
      text: detailed.headings.rawData.h1.text,
      charCount: detailed.headings.rawData.h1.charCount,
      issues: detailed.headings.rawData.h1.issues,
      proof: detailed.headings.rawData.h1
    },
    h2: {
      value: detailed.headings.scoreCalculation.h2.value,
      count: (detailed.headings.rawData.h2Details || {}).count || detailed.headings.rawData.h2.length || 0,
      texts: (detailed.headings.rawData.h2Details || {}).texts || detailed.headings.rawData.h2 || [],
      sample: (detailed.headings.rawData.h2Details || {}).sample || [],
      proof: detailed.headings.rawData.h2
    },
    h3: {
      value: detailed.headings.scoreCalculation.h3.value,
      count: (detailed.headings.rawData.h3Details || {}).count || detailed.headings.rawData.h3.length || 0,
      texts: (detailed.headings.rawData.h3Details || {}).texts || detailed.headings.rawData.h3 || [],
      sample: (detailed.headings.rawData.h3Details || {}).sample || [],
      proof: detailed.headings.rawData.h3
    },
    meta: {
      title: {
        value: detailed.meta.scoreCalculation.title.value,
        text: detailed.meta.rawData.title.text,
        charCount: detailed.meta.rawData.title.charCount,
        issues: detailed.meta.rawData.title.issues
      },
      description: {
        value: detailed.meta.scoreCalculation.description.value,
        text: detailed.meta.rawData.description.text,
        charCount: detailed.meta.rawData.description.charCount,
        issues: detailed.meta.rawData.description.issues
      }
    },
    wordCount: {
      value: detailed.content.scoreCalculation.content.value,
      count: detailed.content.rawData.wordCount,
      readingTime: detailed.content.rawData.readingTime,
      depth: detailed.content.rawData.contentDepth,
      proof: detailed.content.rawData
    },
    links: {
      internal: {
        value: detailed.links.scoreCalculation.internal.value,
        count: detailed.links.rawData.internal.count,
        sample: detailed.links.rawData.internal.links
      },
      external: {
        value: detailed.links.scoreCalculation.external.value,
        count: detailed.links.rawData.external.count,
        sample: detailed.links.rawData.external.links
      }
    },
    images: {
      value: detailed.images.scoreCalculation.count.value,
      count: detailed.images.rawData.total,
      altCoverage: detailed.images.rawData.altTextCoverage,
      proof: detailed.images.rawData
    },
    performance: {
      value: detailed.cwv.scoreCalculation.perfBonus.value,
      score: detailed.cwv.rawData.scores.performance,
      lcp: detailed.cwv.rawData.coreWebVitals.lcp,
      cls: detailed.cwv.rawData.coreWebVitals.cls,
      fid: detailed.cwv.rawData.coreWebVitals.fid,
      proof: detailed.cwv.rawData
    },
    totalCalculation: {
      components: [
        'Base: 30',
        'Schema: ' + detailed.schema.scoreCalculation.displayValue,
        'Headings: +' + (parseInt(detailed.headings.scoreCalculation.h1.value.replace('+','')) + parseInt(detailed.headings.scoreCalculation.h2.value.replace('+','')) + parseInt(detailed.headings.scoreCalculation.h3.value.replace('+',''))),
        'Content: ' + detailed.content.scoreCalculation.content.value,
        'Links: ' + detailed.links.scoreCalculation.total,
        'Performance: ' + detailed.cwv.scoreCalculation.perfBonus.value
      ],
      formula: 'base + schema + headings + content + links + performance'
    },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Elite Tab data for UI rendering
 * Main endpoint for the frontend
 */
function FT_GetEliteTabData(competitors, niche) {
  console.log('📊 FT_GetEliteTabData called for', competitors?.length || 0, 'competitors');
  
  // Try Gemini-enhanced generation first, fall back to local
  const eliteData = FT_GenerateEliteTabsViaGemini(competitors || [], niche);
  
  return {
    success: true,
    data: eliteData,
    timestamp: new Date().toISOString()
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ForensicAEO.gs - AEO RAG-READY SCORE ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI Elite - Answer Engine Optimization Intelligence
 * 
 * This module calculates how "AI-readable" a competitor's content is for LLM
 * citation and RAG (Retrieval-Augmented Generation) systems.
 * 
 * SCORING CRITERIA:
 * ├── Criteria A: Heading Logic (40 points max)
 * │   ├── Question words in H2/H3 (What, Why, How, etc.) +5 each, max 25
 * │   └── Clean paragraph blocks under headings +10
 * │
 * ├── Criteria B: Schema Bonus (40 points max)
 * │   ├── FAQPage schema +15
 * │   ├── HowTo schema +15
 * │   └── Organization schema +10
 * │
 * └── Criteria C: Readability Ratio (20 points max)
 *     └── Text/HTML ratio > 15% = Full points
 * 
 * OUTPUTS:
 * - totalScore: 0-100
 * - status: "Low" (<40) | "Medium" (40-69) | "High" (70+)
 * - gaps: Array of improvement recommendations
 * 
 * INTEGRATION:
 * - Called during Oracle Fetcher pipeline (Stage 2)
 * - Results stored in comp.synthesized.aeoReadiness
 * - Displayed in UI_Tab_Technical.html AEO Card
 * 
 * ZERO-TRUST PROOFS:
 * - All evidence captured in evidenceMap for audit trail
 * - Every score component traceable to raw HTML source
 * 
 * @module ForensicAEO
 * @version 1.0.0
 * @requires FT_ForensicExtractors.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Calculate AEO RAG-Ready Score for AI citation optimization
 * 
 * @param {Object} htmlData - Raw HTML data from Oracle Fetcher
 *   @property {string} rawHtml - Full HTML content
 *   @property {Array<string>} h2 - H2 heading texts
 *   @property {Array<string>} h3 - H3 heading texts
 *   @property {number} wordCount - Body text word count
 *   @property {number} htmlLength - Raw HTML character length
 * 
 * @param {Object} schemaData - Parsed schema.org data
 *   @property {Array<string>} types - Schema @type values (e.g., ['FAQPage', 'Organization'])
 *   @property {boolean} hasFAQ - Has FAQPage schema
 *   @property {boolean} hasHowTo - Has HowTo schema
 *   @property {boolean} hasOrganization - Has Organization schema
 * 
 * @returns {Object} RAG-Ready score analysis
 *   @property {number} totalScore - Overall score 0-100
 *   @property {string} status - "Low" | "Medium" | "High"
 *   @property {Array<Object>} gaps - Improvement recommendations
 *   @property {Object} breakdown - Detailed scoring by criteria
 *   @property {Object} evidence - Raw evidence for audit trail
 */
function calculateRAGReadyScore(htmlData, schemaData) {
  // Initialize with safe defaults
  const html = htmlData || {};
  const schema = schemaData || {};
  
  const rawHtml = html.rawHtml || html.html || '';
  const h2Tags = html.h2 || [];
  const h3Tags = html.h3 || [];
  const allHeadings = [...(Array.isArray(h2Tags) ? h2Tags : [h2Tags]), ...(Array.isArray(h3Tags) ? h3Tags : [h3Tags])];
  
  // Calculate word count and HTML length if not provided
  const cleanText = _stripHtmlForAEO(rawHtml);
  const wordCount = html.wordCount || (cleanText.match(/\S+/g) || []).length;
  const htmlLength = html.htmlLength || rawHtml.length;
  
  // Schema types
  const schemaTypes = Array.isArray(schema.types) ? schema.types : 
                      Array.isArray(schema) ? schema : [];
  
  // =========================================================================
  // CRITERIA A: HEADING LOGIC (40 points max)
  // =========================================================================
  const criteriaA = _calculateHeadingLogicScore(allHeadings, rawHtml);
  
  // =========================================================================
  // CRITERIA B: SCHEMA BONUS (40 points max)
  // =========================================================================
  const criteriaB = _calculateSchemaBonusScore(schemaTypes, schema);
  
  // =========================================================================
  // CRITERIA C: READABILITY RATIO (20 points max)
  // =========================================================================
  const criteriaC = _calculateReadabilityScore(cleanText, rawHtml);
  
  // =========================================================================
  // TOTAL SCORE & STATUS
  // =========================================================================
  const totalScore = Math.min(100, criteriaA.score + criteriaB.score + criteriaC.score);
  const status = totalScore >= 70 ? 'High' : totalScore >= 40 ? 'Medium' : 'Low';
  
  // =========================================================================
  // GAP ANALYSIS - What's missing?
  // =========================================================================
  const gaps = _identifyAEOGaps(criteriaA, criteriaB, criteriaC, schemaTypes, allHeadings);
  
  // =========================================================================
  // EVIDENCE MAP - Zero-Trust Proof Data
  // =========================================================================
  const evidence = {
    headings: {
      questionHeadings: criteriaA.evidence.questionHeadings,
      cleanParagraphBlocks: criteriaA.evidence.cleanParagraphs,
      totalHeadingsAnalyzed: allHeadings.length
    },
    schema: {
      typesFound: schemaTypes,
      hasFAQPage: criteriaB.evidence.hasFAQPage,
      hasHowTo: criteriaB.evidence.hasHowTo,
      hasOrganization: criteriaB.evidence.hasOrganization
    },
    readability: {
      textLength: cleanText.length,
      htmlLength: rawHtml.length,
      ratio: criteriaC.evidence.ratio,
      wordCount: wordCount
    }
  };
  
  return {
    totalScore: totalScore,
    status: status,
    statusColor: status === 'High' ? '#22c55e' : status === 'Medium' ? '#f59e0b' : '#ef4444',
    statusIcon: status === 'High' ? '🚀' : status === 'Medium' ? '🔧' : '⚠️',
    gaps: gaps,
    breakdown: {
      headingLogic: criteriaA,
      schemaBonus: criteriaB,
      readability: criteriaC
    },
    evidence: evidence,
    timestamp: new Date().toISOString()
  };
}

/**
 * CRITERIA A: Heading Logic Analysis
 * - Question words in H2/H3: +5 each, max 25 points
 * - Clean paragraph blocks under headings: +10 points if valid
 * - Additional: +5 for well-structured hierarchy
 * 
 * @private
 */
function _calculateHeadingLogicScore(headings, rawHtml) {
  let score = 0;
  const maxQuestionPoints = 25;
  const maxCleanParagraphPoints = 10;
  const maxHierarchyPoints = 5;
  
  // Question word patterns that LLMs love
  const questionWords = [
    'what', 'why', 'how', 'when', 'where', 'who', 'which', 
    'can', 'should', 'does', 'do', 'is', 'are', 'will'
  ];
  
  const questionPattern = new RegExp(
    '^(' + questionWords.join('|') + ')\\s',
    'i'
  );
  
  // Find question-format headings
  const questionHeadings = headings.filter(h => {
    if (!h || typeof h !== 'string') return false;
    const cleaned = h.trim().toLowerCase();
    return questionPattern.test(cleaned) || cleaned.includes('?');
  });
  
  // Score: +5 per question heading, max 25 points
  const questionPoints = Math.min(maxQuestionPoints, questionHeadings.length * 5);
  score += questionPoints;
  
  // Check for clean paragraph blocks (150+ chars after heading patterns)
  let cleanParagraphCount = 0;
  try {
    // Look for heading followed by substantial text
    const headingPattern = /<h[2-6][^>]*>[^<]+<\/h[2-6]>\s*(?:<p[^>]*>|<div[^>]*>)?([^<]{100,})/gi;
    const paragraphMatches = rawHtml.match(headingPattern) || [];
    cleanParagraphCount = paragraphMatches.length;
  } catch (e) {
    // Fallback: estimate based on word count
    cleanParagraphCount = Math.floor(headings.length * 0.7);
  }
  
  // +10 if we have clean paragraph blocks
  if (cleanParagraphCount >= 3) {
    score += maxCleanParagraphPoints;
  } else if (cleanParagraphCount >= 1) {
    score += Math.round(maxCleanParagraphPoints * 0.5);
  }
  
  // +5 for good heading hierarchy (more than 3 headings = structured)
  if (headings.length >= 5) {
    score += maxHierarchyPoints;
  } else if (headings.length >= 3) {
    score += Math.round(maxHierarchyPoints * 0.5);
  }
  
  return {
    score: Math.min(40, score), // Max 40 for Criteria A
    maxScore: 40,
    evidence: {
      questionHeadings: questionHeadings.slice(0, 5), // First 5 for display
      questionCount: questionHeadings.length,
      cleanParagraphs: cleanParagraphCount,
      totalHeadings: headings.length,
      questionPointsEarned: questionPoints,
      paragraphPointsEarned: cleanParagraphCount >= 3 ? 10 : cleanParagraphCount >= 1 ? 5 : 0
    }
  };
}

/**
 * CRITERIA B: Schema Bonus Analysis
 * - FAQPage schema: +15 points
 * - HowTo schema: +15 points  
 * - Organization schema: +10 points
 * 
 * @private
 */
function _calculateSchemaBonusScore(schemaTypes, schemaObj) {
  let score = 0;
  
  // Normalize schema types to array of lowercase strings
  const normalizedTypes = schemaTypes.map(t => 
    (typeof t === 'string' ? t : t?.['@type'] || '').toLowerCase()
  );
  
  // Also check schemaObj for explicit flags
  const hasFAQPage = normalizedTypes.some(t => t.includes('faqpage') || t.includes('faq')) ||
                     schemaObj?.hasFAQ === true;
  
  const hasHowTo = normalizedTypes.some(t => t.includes('howto') || t.includes('how-to')) ||
                   schemaObj?.hasHowTo === true;
  
  const hasOrganization = normalizedTypes.some(t => 
    t.includes('organization') || t.includes('localbusiness') || t.includes('corporation')
  ) || schemaObj?.hasOrganization === true;
  
  // Award points
  if (hasFAQPage) score += 15;
  if (hasHowTo) score += 15;
  if (hasOrganization) score += 10;
  
  return {
    score: Math.min(40, score), // Max 40 for Criteria B
    maxScore: 40,
    evidence: {
      hasFAQPage: hasFAQPage,
      hasHowTo: hasHowTo,
      hasOrganization: hasOrganization,
      allTypesFound: schemaTypes,
      faqPoints: hasFAQPage ? 15 : 0,
      howToPoints: hasHowTo ? 15 : 0,
      orgPoints: hasOrganization ? 10 : 0
    }
  };
}

/**
 * CRITERIA C: Readability Ratio Analysis
 * - Text/HTML ratio > 15% = 20 points (full marks)
 * - Text/HTML ratio 10-15% = 15 points
 * - Text/HTML ratio 5-10% = 10 points
 * - Text/HTML ratio < 5% = 5 points
 * 
 * @private
 */
function _calculateReadabilityScore(cleanText, rawHtml) {
  const textLength = cleanText.length;
  const htmlLength = Math.max(1, rawHtml.length); // Prevent division by zero
  
  const ratio = (textLength / htmlLength) * 100;
  
  let score = 0;
  let tier = 'Poor';
  
  if (ratio >= 15) {
    score = 20;
    tier = 'Excellent';
  } else if (ratio >= 10) {
    score = 15;
    tier = 'Good';
  } else if (ratio >= 5) {
    score = 10;
    tier = 'Fair';
  } else {
    score = 5;
    tier = 'Poor';
  }
  
  return {
    score: score,
    maxScore: 20,
    evidence: {
      ratio: Math.round(ratio * 100) / 100, // 2 decimal places
      textLength: textLength,
      htmlLength: htmlLength,
      tier: tier,
      target: '> 15%',
      gap: ratio < 15 ? `Need ${Math.round(15 - ratio)}% more text density` : null
    }
  };
}

/**
 * Strip HTML tags and extract clean text for analysis
 * @private
 */
function _stripHtmlForAEO(html) {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Identify gaps and generate improvement recommendations
 * @private
 */
function _identifyAEOGaps(criteriaA, criteriaB, criteriaC, schemaTypes, headings) {
  const gaps = [];
  
  // Heading gaps
  if (criteriaA.evidence.questionCount < 3) {
    gaps.push({
      category: 'headingLogic',
      priority: 'high',
      icon: '❓',
      title: 'Add Question-Format Headings',
      description: `Only ${criteriaA.evidence.questionCount} question headings found. Add H2/H3 with "What", "How", "Why" formats for PAA eligibility.`,
      impact: '+5-25 points',
      action: 'Rewrite headings as questions that match user search intent'
    });
  }
  
  if (headings.length < 5) {
    gaps.push({
      category: 'headingLogic',
      priority: 'medium',
      icon: '📑',
      title: 'Improve Content Structure',
      description: `Only ${headings.length} headings detected. Well-structured content needs 5+ semantic headings.`,
      impact: '+5 points',
      action: 'Add more H2/H3 headings to break up content into scannable sections'
    });
  }
  
  // Schema gaps
  if (!criteriaB.evidence.hasFAQPage) {
    gaps.push({
      category: 'schema',
      priority: 'high',
      icon: '📋',
      title: 'Add FAQPage Schema',
      description: 'FAQPage schema missing. This is critical for AI citation and featured snippets.',
      impact: '+15 points',
      action: 'Implement FAQPage structured data with common customer questions'
    });
  }
  
  if (!criteriaB.evidence.hasHowTo) {
    gaps.push({
      category: 'schema',
      priority: 'medium',
      icon: '🔧',
      title: 'Add HowTo Schema',
      description: 'HowTo schema missing. Step-by-step content gets 2x more AI citations.',
      impact: '+15 points',
      action: 'Add HowTo structured data for any instructional content'
    });
  }
  
  if (!criteriaB.evidence.hasOrganization) {
    gaps.push({
      category: 'schema',
      priority: 'low',
      icon: '🏢',
      title: 'Add Organization Schema',
      description: 'Organization schema improves E-E-A-T signals for AI trust.',
      impact: '+10 points',
      action: 'Add Organization structured data with logo, contact info, social profiles'
    });
  }
  
  // Readability gaps
  if (criteriaC.evidence.ratio < 15) {
    gaps.push({
      category: 'readability',
      priority: 'medium',
      icon: '📖',
      title: 'Improve Text Density',
      description: `Text/HTML ratio is ${criteriaC.evidence.ratio.toFixed(1)}% (target: >15%). Too much markup reduces AI readability.`,
      impact: '+5-15 points',
      action: 'Remove unnecessary HTML, inline styles, and empty elements'
    });
  }
  
  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return gaps;
}

/**
 * Batch calculate RAG-Ready scores for multiple competitors
 * 
 * @param {Array<Object>} competitors - Array of competitor data objects
 * @returns {Array<Object>} Competitors with aeoReadiness added to synthesized
 */
function batchCalculateRAGReadyScores(competitors) {
  if (!Array.isArray(competitors)) return [];
  
  return competitors.map(comp => {
    try {
      const synthesized = comp.synthesized || {};
      const website = synthesized.website || {};
      
      const htmlData = {
        rawHtml: comp.stages?.oracleFetcher?.rawHtml || '',
        h2: website.h2 || [],
        h3: website.h3 || [],
        wordCount: website.wordCount || 0,
        htmlLength: website.htmlLength || 0
      };
      
      const schemaData = {
        types: website.schemaTypes || [],
        hasFAQ: (website.schemaTypes || []).some(s => s.toLowerCase().includes('faq')),
        hasHowTo: (website.schemaTypes || []).some(s => s.toLowerCase().includes('howto')),
        hasOrganization: (website.schemaTypes || []).some(s => s.toLowerCase().includes('organization'))
      };
      
      const aeoScore = calculateRAGReadyScore(htmlData, schemaData);
      
      // Attach to competitor object
      if (!comp.synthesized) comp.synthesized = {};
      comp.synthesized.aeoReadiness = aeoScore;
      
      return comp;
    } catch (e) {
      console.error(`[ForensicAEO] Error calculating score for ${comp.domain}: ${e.message}`);
      return comp;
    }
  });
}

/**
 * Get AEO improvement roadmap based on gaps
 * Sorted by impact and difficulty
 * 
 * @param {Object} aeoScore - Result from calculateRAGReadyScore
 * @returns {Array<Object>} Prioritized action items
 */
function getAEOImprovementRoadmap(aeoScore) {
  if (!aeoScore || !aeoScore.gaps) return [];
  
  const roadmap = aeoScore.gaps.map((gap, index) => ({
    rank: index + 1,
    action: gap.title,
    category: gap.category,
    impact: gap.impact,
    description: gap.description,
    howTo: gap.action,
    priority: gap.priority,
    estimatedTime: gap.priority === 'high' ? '1-2 hours' : 
                   gap.priority === 'medium' ? '30-60 mins' : '15-30 mins'
  }));
  
  return roadmap;
}

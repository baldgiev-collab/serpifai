/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 3: HEADING EXTRACTOR
 * Extract H1 (Top 20-30) and H2-H6 Structure from Multiple Pages
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract and aggregate heading structure from homepage + blog pages
 * - Top 20-30 H1 headings across all pages
 * - Complete H2-H6 hierarchy
 * - Heading keyword analysis
 * - Heading structure scoring
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// HEADING EXTRACTOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var HEADING_EXTRACTOR_CONFIG = {
  // Limits
  MAX_H1_HEADINGS: 30,               // Top 30 H1 headings across all pages
  MAX_HEADINGS_PER_LEVEL: 50,        // Max headings per level (H2, H3, etc.)
  MAX_HEADINGS_PER_PAGE: 30,         // Max headings to extract per page
  
  // Analysis
  MIN_HEADING_LENGTH: 3,             // Minimum heading text length
  MAX_HEADING_LENGTH: 300,           // Maximum heading text length
  
  // Scoring weights
  WEIGHTS: {
    H1_PRESENCE: 25,
    H1_QUALITY: 20,
    HIERARCHY_PROPER: 20,
    HEADING_DIVERSITY: 15,
    KEYWORD_USAGE: 20
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: HEADING EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * HeadingExtractor - Extracts and aggregates headings from multiple pages
 */
class HeadingExtractor {
  
  constructor() {
    this.allHeadings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };
    this.pageHeadings = [];
  }
  
  /**
   * Extract headings from multiple pages
   * @param {Array} pages - Array of page objects with html property
   * @returns {Object} Aggregated heading analysis
   */
  extractFromPages(pages) {
    console.log(`📋 HeadingExtractor: Analyzing headings from ${pages.length} pages`);
    const startTime = Date.now();
    
    // Reset state
    this._reset();
    
    // Process each page
    for (const page of pages) {
      if (!page.html || !page.success) continue;
      
      const pageHeadings = this._extractPageHeadings(page.html, page.url, page.type);
      this.pageHeadings.push(pageHeadings);
      
      // Aggregate headings
      this._aggregateHeadings(pageHeadings);
    }
    
    // Build final result
    const result = this._buildResult(startTime);
    console.log(`✅ HeadingExtractor: Extracted ${result.totalHeadings} headings in ${result.processingTimeMs}ms`);
    
    return result;
  }
  
  /**
   * Extract headings from single page HTML
   * @param {string} html - HTML content
   * @param {string} url - Page URL
   * @param {string} pageType - 'homepage' or 'blog_post'
   * @returns {Object} Page heading analysis
   */
  _extractPageHeadings(html, url, pageType) {
    const headings = {
      url: url,
      pageType: pageType,
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      hierarchy: [],
      totalCount: 0
    };
    
    // Extract all headings in order
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    let order = 0;
    
    while ((match = headingRegex.exec(html)) !== null && order < HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_PAGE) {
      const level = parseInt(match[1]);
      const rawText = match[2];
      const cleanText = this._stripHtml(rawText).trim();
      
      // Validate heading text
      if (cleanText.length < HEADING_EXTRACTOR_CONFIG.MIN_HEADING_LENGTH ||
          cleanText.length > HEADING_EXTRACTOR_CONFIG.MAX_HEADING_LENGTH) {
        continue;
      }
      
      const headingData = {
        level: level,
        tag: `h${level}`,
        text: cleanText,
        textLength: cleanText.length,
        wordCount: cleanText.split(/\s+/).length,
        order: order,
        url: url,
        pageType: pageType
      };
      
      headings[`h${level}`].push(headingData);
      headings.hierarchy.push(headingData);
      headings.totalCount++;
      order++;
    }
    
    return headings;
  }
  
  /**
   * Aggregate headings from page into global collection
   */
  _aggregateHeadings(pageHeadings) {
    for (let level = 1; level <= 6; level++) {
      const key = `h${level}`;
      const pageLevel = pageHeadings[key] || [];
      
      for (const heading of pageLevel) {
        // Check limit
        if (level === 1 && this.allHeadings.h1.length >= HEADING_EXTRACTOR_CONFIG.MAX_H1_HEADINGS) {
          continue;
        }
        if (level > 1 && this.allHeadings[key].length >= HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL) {
          continue;
        }
        
        // Check for duplicates (same text)
        const isDuplicate = this.allHeadings[key].some(h => 
          h.text.toLowerCase() === heading.text.toLowerCase()
        );
        
        if (!isDuplicate) {
          this.allHeadings[key].push(heading);
        }
      }
    }
  }
  
  /**
   * Build final result object
   */
  _buildResult(startTime) {
    // Sort H1s by word count (longer = more descriptive)
    this.allHeadings.h1.sort((a, b) => b.wordCount - a.wordCount);
    
    // Calculate statistics
    const stats = this._calculateStats();
    
    // Analyze heading structure
    const structure = this._analyzeStructure();
    
    // Calculate scores
    const scores = this._calculateScores(stats, structure);
    
    // Extract top heading phrases for keyword analysis
    const topPhrases = this._extractTopPhrases();
    
    return {
      success: true,
      extractedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      
      // Aggregated headings
      headings: {
        h1: this.allHeadings.h1.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_H1_HEADINGS),
        h2: this.allHeadings.h2.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL),
        h3: this.allHeadings.h3.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL),
        h4: this.allHeadings.h4.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL),
        h5: this.allHeadings.h5.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL),
        h6: this.allHeadings.h6.slice(0, HEADING_EXTRACTOR_CONFIG.MAX_HEADINGS_PER_LEVEL)
      },
      
      // Counts
      counts: {
        h1: this.allHeadings.h1.length,
        h2: this.allHeadings.h2.length,
        h3: this.allHeadings.h3.length,
        h4: this.allHeadings.h4.length,
        h5: this.allHeadings.h5.length,
        h6: this.allHeadings.h6.length,
        total: Object.values(this.allHeadings).flat().length
      },
      
      totalHeadings: Object.values(this.allHeadings).flat().length,
      pagesAnalyzed: this.pageHeadings.length,
      
      // Statistics
      stats: stats,
      
      // Structure analysis
      structure: structure,
      
      // Scores
      scores: scores,
      
      // Top phrases for keyword analysis
      topPhrases: topPhrases,
      
      // Per-page breakdown
      pageBreakdown: this.pageHeadings.map(p => ({
        url: p.url,
        pageType: p.pageType,
        h1Count: p.h1.length,
        h2Count: p.h2.length,
        totalHeadings: p.totalCount,
        primaryH1: p.h1[0]?.text || null
      }))
    };
  }
  
  /**
   * Calculate heading statistics
   */
  _calculateStats() {
    const allHeadingTexts = Object.values(this.allHeadings).flat();
    
    // Average heading length
    const avgLength = allHeadingTexts.length > 0
      ? allHeadingTexts.reduce((sum, h) => sum + h.textLength, 0) / allHeadingTexts.length
      : 0;
    
    // Average word count
    const avgWordCount = allHeadingTexts.length > 0
      ? allHeadingTexts.reduce((sum, h) => sum + h.wordCount, 0) / allHeadingTexts.length
      : 0;
    
    // H1 to H2 ratio
    const h1h2Ratio = this.allHeadings.h2.length > 0
      ? this.allHeadings.h1.length / this.allHeadings.h2.length
      : 0;
    
    // Pages with multiple H1s
    const pagesWithMultipleH1 = this.pageHeadings.filter(p => p.h1.length > 1).length;
    
    // Pages without H1
    const pagesWithoutH1 = this.pageHeadings.filter(p => p.h1.length === 0).length;
    
    return {
      averageLength: Math.round(avgLength),
      averageWordCount: Math.round(avgWordCount * 10) / 10,
      h1h2Ratio: Math.round(h1h2Ratio * 100) / 100,
      pagesWithMultipleH1: pagesWithMultipleH1,
      pagesWithoutH1: pagesWithoutH1,
      totalPagesAnalyzed: this.pageHeadings.length
    };
  }
  
  /**
   * Analyze heading structure patterns
   */
  _analyzeStructure() {
    const issues = [];
    const patterns = [];
    
    // Check for proper hierarchy
    for (const page of this.pageHeadings) {
      // Check for skipped levels
      const hasH1 = page.h1.length > 0;
      const hasH2 = page.h2.length > 0;
      const hasH3 = page.h3.length > 0;
      const hasH4 = page.h4.length > 0;
      
      if (!hasH1) {
        issues.push({
          type: 'missing_h1',
          severity: 'high',
          url: page.url,
          message: 'Page missing H1 heading'
        });
      }
      
      if (page.h1.length > 1) {
        issues.push({
          type: 'multiple_h1',
          severity: 'medium',
          url: page.url,
          message: `Page has ${page.h1.length} H1 headings`
        });
      }
      
      if (!hasH2 && hasH3) {
        issues.push({
          type: 'skipped_h2',
          severity: 'low',
          url: page.url,
          message: 'Page has H3 without H2'
        });
      }
      
      if (!hasH3 && hasH4) {
        issues.push({
          type: 'skipped_h3',
          severity: 'low',
          url: page.url,
          message: 'Page has H4 without H3'
        });
      }
    }
    
    // Identify patterns
    if (this.allHeadings.h2.length > this.allHeadings.h3.length) {
      patterns.push({
        type: 'shallow_hierarchy',
        description: 'Content uses mostly H2 headings with limited H3+ depth'
      });
    }
    
    if (this.allHeadings.h1.length > 10) {
      patterns.push({
        type: 'diverse_topics',
        description: 'Content covers many distinct topics based on H1 variety'
      });
    }
    
    return {
      issues: issues,
      issueCount: issues.length,
      highSeverityCount: issues.filter(i => i.severity === 'high').length,
      patterns: patterns,
      isProperHierarchy: issues.filter(i => i.severity === 'high').length === 0
    };
  }
  
  /**
   * Calculate heading quality scores
   */
  _calculateScores(stats, structure) {
    let totalScore = 0;
    
    // H1 Presence Score
    const h1PresenceScore = stats.pagesWithoutH1 === 0 ? 100 : 
      Math.max(0, 100 - (stats.pagesWithoutH1 / stats.totalPagesAnalyzed) * 100);
    totalScore += (h1PresenceScore / 100) * HEADING_EXTRACTOR_CONFIG.WEIGHTS.H1_PRESENCE;
    
    // H1 Quality Score (based on length)
    const avgH1Length = this.allHeadings.h1.length > 0
      ? this.allHeadings.h1.reduce((sum, h) => sum + h.wordCount, 0) / this.allHeadings.h1.length
      : 0;
    const h1QualityScore = Math.min(100, avgH1Length * 15); // 6-7 words = 100
    totalScore += (h1QualityScore / 100) * HEADING_EXTRACTOR_CONFIG.WEIGHTS.H1_QUALITY;
    
    // Hierarchy Score
    const hierarchyScore = structure.isProperHierarchy ? 100 :
      Math.max(0, 100 - structure.highSeverityCount * 20);
    totalScore += (hierarchyScore / 100) * HEADING_EXTRACTOR_CONFIG.WEIGHTS.HIERARCHY_PROPER;
    
    // Diversity Score
    const levelsUsed = [
      this.allHeadings.h1.length > 0,
      this.allHeadings.h2.length > 0,
      this.allHeadings.h3.length > 0,
      this.allHeadings.h4.length > 0
    ].filter(Boolean).length;
    const diversityScore = (levelsUsed / 4) * 100;
    totalScore += (diversityScore / 100) * HEADING_EXTRACTOR_CONFIG.WEIGHTS.HEADING_DIVERSITY;
    
    // Keyword Usage (placeholder - will be enhanced later)
    const keywordScore = 70; // Default moderate score
    totalScore += (keywordScore / 100) * HEADING_EXTRACTOR_CONFIG.WEIGHTS.KEYWORD_USAGE;
    
    return {
      overall: Math.round(totalScore),
      h1Presence: Math.round(h1PresenceScore),
      h1Quality: Math.round(h1QualityScore),
      hierarchy: Math.round(hierarchyScore),
      diversity: Math.round(diversityScore),
      keywordUsage: keywordScore
    };
  }
  
  /**
   * Extract top phrases from headings for keyword analysis
   */
  _extractTopPhrases() {
    const phrases = {};
    
    // Analyze all H1 and H2 headings
    const importantHeadings = [...this.allHeadings.h1, ...this.allHeadings.h2];
    
    for (const heading of importantHeadings) {
      const words = heading.text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
      
      // Extract 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const twoWord = words.slice(i, i + 2).join(' ');
        phrases[twoWord] = (phrases[twoWord] || 0) + 1;
        
        if (i < words.length - 2) {
          const threeWord = words.slice(i, i + 3).join(' ');
          phrases[threeWord] = (phrases[threeWord] || 0) + 1;
        }
      }
    }
    
    // Sort by frequency and return top 20
    return Object.entries(phrases)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([phrase, count]) => ({ phrase, count }));
  }
  
  /**
   * Strip HTML tags from text
   */
  _stripHtml(html) {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Reset state for new analysis
   */
  _reset() {
    this.allHeadings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    this.pageHeadings = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get heading extractor instance
 * @returns {HeadingExtractor}
 */
function getHeadingExtractor() {
  return new HeadingExtractor();
}

/**
 * Extract headings from multiple pages
 * @param {Array} pages - Array of page objects with html property
 * @returns {Object} Aggregated heading analysis
 */
function extractHeadingsFromPages(pages) {
  const extractor = getHeadingExtractor();
  return extractor.extractFromPages(pages);
}

/**
 * Extract headings from single HTML
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} Page heading analysis
 */
function extractHeadingsFromHtml(html, url) {
  const extractor = getHeadingExtractor();
  return extractor.extractFromPages([{ html: html, url: url, success: true, type: 'page' }]);
}

/**
 * Test heading extractor with sample HTML
 */
function testHeadingExtractor() {
  const samplePages = [
    {
      html: `<html>
        <h1>Best Online Casinos 2024</h1>
        <h2>How to Choose a Casino</h2>
        <h3>Check the License</h3>
        <h3>Read Reviews</h3>
        <h2>Top 10 Casino Sites</h2>
        <h3>Casino Site 1</h3>
        <h3>Casino Site 2</h3>
      </html>`,
      url: 'https://example.com/',
      success: true,
      type: 'homepage'
    },
    {
      html: `<html>
        <h1>Complete Guide to Slots</h1>
        <h2>Types of Slot Machines</h2>
        <h3>Classic Slots</h3>
        <h3>Video Slots</h3>
        <h2>Slot Strategies</h2>
        <h3>Bankroll Management</h3>
      </html>`,
      url: 'https://example.com/slots-guide',
      success: true,
      type: 'blog_post'
    }
  ];
  
  const result = extractHeadingsFromPages(samplePages);
  console.log('Heading Extraction Result:', JSON.stringify(result, null, 2));
  return result;
}

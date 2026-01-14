/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 3.1: SEMANTIC ENGINE
 * 75-KW Cluster Extraction, Intent Classification, Heading Hierarchy
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This sub-module implements the SemanticIntelligenceEngine:
 *   - 75-KW N-gram Extraction (1-4 words)
 *   - Intent Classification (Transactional, Commercial, Informational, Navigational)
 *   - Heading Hierarchy Audit (H1-H6)
 *   - Synthetic Volume Estimation
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1A: SEMANTIC CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var SEMANTIC_CONFIG = SEMANTIC_CONFIG || {
  // N-gram extraction settings
  NGRAM: {
    MIN_GRAM: 1,
    MAX_GRAM: 4,
    TOP_KEYWORDS: 75,
    MIN_FREQUENCY: 2,
    MIN_WORD_LENGTH: 3
  },
  
  // Intent classification modifiers
  INTENT_MODIFIERS: {
    TRANSACTIONAL: [
      'buy', 'purchase', 'order', 'shop', 'cart', 'checkout', 'price', 'cost',
      'deal', 'discount', 'coupon', 'promo', 'sale', 'cheap', 'affordable',
      'subscribe', 'signup', 'register', 'download', 'get', 'acquire',
      'deposit', 'withdraw', 'bet', 'wager', 'play now', 'join now',
      'claim', 'redeem', 'activate', 'unlock', 'instant', 'free trial'
    ],
    COMMERCIAL: [
      'best', 'top', 'review', 'reviews', 'comparison', 'compare', 'vs',
      'versus', 'alternative', 'alternatives', 'recommended', 'rating',
      'ratings', 'ranked', 'ranking', 'winner', 'award', 'certified',
      'trusted', 'reliable', 'legit', 'legitimate', 'safe', 'secure',
      'licensed', 'regulated', 'approved', 'verified', 'tested',
      'premium', 'pro', 'professional', 'enterprise', 'ultimate'
    ],
    INFORMATIONAL: [
      'how', 'what', 'why', 'when', 'where', 'who', 'which', 'guide',
      'tutorial', 'learn', 'understand', 'explain', 'definition', 'meaning',
      'example', 'examples', 'tips', 'tricks', 'strategy', 'strategies',
      'method', 'methods', 'technique', 'techniques', 'step', 'steps',
      'introduction', 'beginner', 'basics', 'fundamentals', 'overview',
      'history', 'origin', 'types', 'kinds', 'list', 'faq', 'faqs'
    ],
    NAVIGATIONAL: [
      'login', 'signin', 'sign in', 'log in', 'account', 'dashboard',
      'profile', 'settings', 'official', 'website', 'site', 'homepage',
      'contact', 'support', 'help', 'customer service', 'phone', 'email',
      'address', 'location', 'hours', 'app', 'application', 'download page'
    ]
  },
  
  // Stop words to exclude
  STOP_WORDS: new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
    'we', 'us', 'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his',
    'i', 'me', 'my', 'not', 'no', 'yes', 'all', 'any', 'some', 'more',
    'most', 'other', 'into', 'over', 'such', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
    'if', 'when', 'where', 'while', 'who', 'which', 'what', 'why', 'how',
    'each', 'few', 'many', 'much', 'both', 'either', 'neither', 'every',
    'about', 'above', 'across', 'after', 'against', 'along', 'among',
    'around', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'beyond', 'during', 'except', 'inside', 'near', 'off', 'out', 'outside',
    'since', 'through', 'throughout', 'toward', 'under', 'until', 'upon',
    'within', 'without'
  ]),
  
  // Volume estimation corpus baseline
  CORPUS_BASELINE: {
    COMMON_WORD_FREQUENCY: 0.001,
    PAA_MULTIPLIER: 1.5,
    TITLE_BOOST: 2.0,
    H1_BOOST: 1.8,
    H2_BOOST: 1.4
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1B: TEXT EXTRACTION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * TextExtractor - Extracts and normalizes text from HTML
 */
class TextExtractor {
  
  /**
   * Strip HTML tags and extract clean text
   * @param {string} html - Raw HTML content
   * @returns {string} Clean text
   */
  static extractText(html) {
    if (!html) return '';
    
    // Remove script and style blocks
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
    
    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, ' ');
    
    // Remove all HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    text = TextExtractor.decodeHtmlEntities(text);
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  /**
   * Decode common HTML entities
   * @param {string} text - Text with HTML entities
   * @returns {string} Decoded text
   */
  static decodeHtmlEntities(text) {
    const entities = {
      '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
      '&quot;': '"', '&#39;': "'", '&apos;': "'", '&copy;': '\u00A9',
      '&reg;': '\u00AE', '&trade;': '\u2122', '&mdash;': '\u2014', '&ndash;': '\u2013',
      '&hellip;': '\u2026', '&ldquo;': '\u201C', '&rdquo;': '\u201D', '&lsquo;': '\u2018',
      '&rsquo;': '\u2019'
    };
    
    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'gi'), char);
    }
    
    // Decode numeric entities
    decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
    decoded = decoded.replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    
    return decoded;
  }
  
  /**
   * Extract text from specific HTML element by tag
   * @param {string} html - HTML content
   * @param {string} tag - Tag name (e.g., 'title', 'h1')
   * @returns {Array} Array of text contents
   */
  static extractByTag(html, tag) {
    if (!html) return [];
    
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const content = TextExtractor.extractText(match[1]);
      if (content) {
        matches.push(content);
      }
    }
    
    return matches;
  }
  
  /**
   * Tokenize text into words
   * @param {string} text - Clean text
   * @returns {Array} Array of lowercase words
   */
  static tokenize(text) {
    if (!text) return [];
    
    // Convert to lowercase and split by non-word characters
    const words = text.toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(word => {
        return word.length >= SEMANTIC_CONFIG.NGRAM.MIN_WORD_LENGTH &&
               !SEMANTIC_CONFIG.STOP_WORDS.has(word) &&
               !/^\d+$/.test(word);
      });
    
    return words;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1C: N-GRAM EXTRACTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * NGramExtractor - Extracts N-grams from text
 */
class NGramExtractor {
  
  /**
   * Generate N-grams from word array
   * @param {Array} words - Array of words
   * @param {number} n - N-gram size
   * @returns {Array} Array of N-grams
   */
  static generateNGrams(words, n) {
    if (!words || words.length < n) return [];
    
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    
    return ngrams;
  }
  
  /**
   * Extract all N-grams (1-4) with frequency counts
   * @param {string} text - Clean text
   * @returns {Map} Map of N-gram to frequency
   */
  static extractAllNGrams(text) {
    const words = TextExtractor.tokenize(text);
    const frequencyMap = new Map();
    
    // Generate N-grams for each size
    for (let n = SEMANTIC_CONFIG.NGRAM.MIN_GRAM; n <= SEMANTIC_CONFIG.NGRAM.MAX_GRAM; n++) {
      const ngrams = NGramExtractor.generateNGrams(words, n);
      
      for (const ngram of ngrams) {
        frequencyMap.set(ngram, (frequencyMap.get(ngram) || 0) + 1);
      }
    }
    
    return frequencyMap;
  }
  
  /**
   * Get top N-grams by frequency
   * @param {Map} frequencyMap - N-gram frequency map
   * @param {number} topN - Number of top N-grams to return
   * @param {number} minFreq - Minimum frequency threshold
   * @returns {Array} Sorted array of {ngram, frequency} objects
   */
  static getTopNGrams(frequencyMap, topN = 75, minFreq = 2) {
    const entries = Array.from(frequencyMap.entries())
      .filter(([_, freq]) => freq >= minFreq)
      .map(([ngram, frequency]) => ({
        ngram,
        frequency,
        wordCount: ngram.split(' ').length
      }))
      .sort((a, b) => {
        // Prioritize multi-word phrases slightly
        const aScore = a.frequency * (1 + a.wordCount * 0.1);
        const bScore = b.frequency * (1 + b.wordCount * 0.1);
        return bScore - aScore;
      });
    
    return entries.slice(0, topN);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1D: INTENT CLASSIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * IntentClassifier - Classifies search intent for keywords
 */
class IntentClassifier {
  
  constructor() {
    // Build lookup sets for faster matching
    this.modifiers = {};
    for (const [intent, words] of Object.entries(SEMANTIC_CONFIG.INTENT_MODIFIERS)) {
      this.modifiers[intent.toLowerCase()] = new Set(words.map(w => w.toLowerCase()));
    }
  }
  
  /**
   * Classify keyword intent
   * @param {string} keyword - Keyword to classify
   * @param {Object} context - Additional context (title, headings)
   * @returns {Object} Intent classification result
   */
  classify(keyword, context = {}) {
    const keywordLower = keyword.toLowerCase();
    const words = keywordLower.split(/\s+/);
    
    const scores = {
      transactional: 0,
      commercial: 0,
      informational: 0,
      navigational: 0
    };
    
    // Check each word against modifiers
    for (const word of words) {
      for (const [intent, modifierSet] of Object.entries(this.modifiers)) {
        if (modifierSet.has(word)) {
          scores[intent] += 1;
        }
      }
      
      // Check for partial matches (e.g., "reviews" contains "review")
      for (const [intent, modifierSet] of Object.entries(this.modifiers)) {
        for (const modifier of modifierSet) {
          if (word.includes(modifier) && word !== modifier) {
            scores[intent] += 0.5;
          }
        }
      }
    }
    
    // Context boosts
    if (context.inTitle) {
      // Keywords in title get boosted commercial/transactional signals
      if (scores.commercial > 0) scores.commercial *= 1.5;
      if (scores.transactional > 0) scores.transactional *= 1.5;
    }
    
    if (context.inH1) {
      scores.informational += 0.3;
    }
    
    // Determine primary intent
    let primaryIntent = 'informational';
    let maxScore = scores.informational;
    
    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryIntent = intent;
      }
    }
    
    // Calculate confidence
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 50;
    
    return {
      primary: primaryIntent,
      confidence: Math.round(confidence),
      scores: scores,
      signals: this._getIntentSignals(keyword, primaryIntent)
    };
  }
  
  /**
   * Get intent signals (modifiers found)
   * @param {string} keyword - Keyword
   * @param {string} intent - Classified intent
   * @returns {Array} List of signals found
   */
  _getIntentSignals(keyword, intent) {
    const signals = [];
    const keywordLower = keyword.toLowerCase();
    const modifierSet = this.modifiers[intent] || new Set();
    
    for (const modifier of modifierSet) {
      if (keywordLower.includes(modifier)) {
        signals.push(modifier);
      }
    }
    
    return signals;
  }
  
  /**
   * Batch classify multiple keywords
   * @param {Array} keywords - Array of keyword strings
   * @param {Object} context - Page context
   * @returns {Array} Array of classified keywords
   */
  batchClassify(keywords, context = {}) {
    return keywords.map(kw => ({
      keyword: kw.ngram || kw,
      frequency: kw.frequency || 1,
      ...this.classify(kw.ngram || kw, context)
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1E: HEADING HIERARCHY AUDITOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * HeadingAuditor - Analyzes heading structure
 */
class HeadingAuditor {
  
  /**
   * Extract all headings from HTML
   * @param {string} html - HTML content
   * @returns {Object} Heading hierarchy analysis
   */
  static analyze(html) {
    if (!html) {
      return HeadingAuditor._emptyResult();
    }
    
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };
    
    // Extract each heading level
    for (let level = 1; level <= 6; level++) {
      headings[`h${level}`] = TextExtractor.extractByTag(html, `h${level}`);
    }
    
    // Build hierarchy tree
    const hierarchy = HeadingAuditor._buildHierarchy(html);
    
    // Calculate scores
    const issues = [];
    const scores = HeadingAuditor._calculateScores(headings, issues);
    
    return {
      headings: headings,
      counts: {
        h1: headings.h1.length,
        h2: headings.h2.length,
        h3: headings.h3.length,
        h4: headings.h4.length,
        h5: headings.h5.length,
        h6: headings.h6.length,
        total: Object.values(headings).flat().length
      },
      hierarchy: hierarchy,
      scores: scores,
      issues: issues,
      primaryH1: headings.h1[0] || null,
      isValid: issues.filter(i => i.severity === 'error').length === 0
    };
  }
  
  /**
   * Build heading hierarchy tree
   * @param {string} html - HTML content
   * @returns {Array} Hierarchy tree
   */
  static _buildHierarchy(html) {
    const regex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
    const tree = [];
    const stack = [{ level: 0, children: tree }];
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const level = parseInt(match[1].charAt(1));
      const text = TextExtractor.extractText(match[2]);
      
      const node = {
        level: level,
        tag: match[1].toLowerCase(),
        text: text,
        children: []
      };
      
      // Find parent
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }
    
    return tree;
  }
  
  /**
   * Calculate heading structure scores
   * @param {Object} headings - Extracted headings
   * @param {Array} issues - Issues array to populate
   * @returns {Object} Scores
   */
  static _calculateScores(headings, issues) {
    const scores = {
      h1Score: 100,
      hierarchyScore: 100,
      distributionScore: 100,
      overall: 100
    };
    
    // H1 checks
    if (headings.h1.length === 0) {
      scores.h1Score -= 50;
      issues.push({
        type: 'missing_h1',
        severity: 'error',
        message: 'Page is missing an H1 heading'
      });
    } else if (headings.h1.length > 1) {
      scores.h1Score -= 30;
      issues.push({
        type: 'multiple_h1',
        severity: 'warning',
        message: `Page has ${headings.h1.length} H1 headings (should have exactly 1)`
      });
    }
    
    // H1 length check
    if (headings.h1[0] && headings.h1[0].length < 20) {
      scores.h1Score -= 10;
      issues.push({
        type: 'short_h1',
        severity: 'info',
        message: 'H1 heading is shorter than recommended (20+ characters)'
      });
    }
    
    // Hierarchy checks (should go H1 -> H2 -> H3, not skip levels)
    const hasH2 = headings.h2.length > 0;
    const hasH3 = headings.h3.length > 0;
    const hasH4 = headings.h4.length > 0;
    
    if (!hasH2 && hasH3) {
      scores.hierarchyScore -= 20;
      issues.push({
        type: 'skipped_h2',
        severity: 'warning',
        message: 'Page skips H2 level (has H3 without H2)'
      });
    }
    
    if (!hasH3 && hasH4) {
      scores.hierarchyScore -= 15;
      issues.push({
        type: 'skipped_h3',
        severity: 'warning',
        message: 'Page skips H3 level (has H4 without H3)'
      });
    }
    
    // Distribution score
    const totalHeadings = Object.values(headings).flat().length;
    if (totalHeadings < 3) {
      scores.distributionScore -= 30;
      issues.push({
        type: 'few_headings',
        severity: 'warning',
        message: 'Page has very few headings (less than 3)'
      });
    }
    
    // Calculate overall
    scores.overall = Math.round(
      (scores.h1Score + scores.hierarchyScore + scores.distributionScore) / 3
    );
    
    return scores;
  }
  
  /**
   * Return empty result structure
   */
  static _emptyResult() {
    return {
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      counts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0 },
      hierarchy: [],
      scores: { h1Score: 0, hierarchyScore: 0, distributionScore: 0, overall: 0 },
      issues: [{ type: 'no_content', severity: 'error', message: 'No HTML content provided' }],
      primaryH1: null,
      isValid: false
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1F: SYNTHETIC VOLUME ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * VolumeEstimator - Estimates search volume from content signals
 */
class VolumeEstimator {
  
  /**
   * Estimate synthetic search volume for a keyword
   * @param {Object} keywordData - Keyword with frequency and context
   * @param {Object} pageData - Page context (PAA count, title, etc.)
   * @returns {Object} Volume estimation
   */
  static estimate(keywordData, pageData = {}) {
    const { ngram, frequency, wordCount = 1 } = keywordData;
    
    // Base volume from frequency
    let baseVolume = frequency * 100;
    
    // N-gram length adjustment (longer = more specific = lower volume but higher intent)
    const lengthMultiplier = Math.max(0.3, 1 - (wordCount - 1) * 0.2);
    baseVolume *= lengthMultiplier;
    
    // PAA density boost
    const paaCount = pageData.paaCount || 0;
    if (paaCount > 0) {
      baseVolume *= (1 + paaCount * 0.1);
    }
    
    // Title presence boost
    if (pageData.titleContainsKeyword) {
      baseVolume *= SEMANTIC_CONFIG.CORPUS_BASELINE.TITLE_BOOST;
    }
    
    // H1 presence boost
    if (pageData.h1ContainsKeyword) {
      baseVolume *= SEMANTIC_CONFIG.CORPUS_BASELINE.H1_BOOST;
    }
    
    // H2 presence boost
    if (pageData.h2ContainsKeyword) {
      baseVolume *= SEMANTIC_CONFIG.CORPUS_BASELINE.H2_BOOST;
    }
    
    // Normalize to realistic range (10 - 100,000)
    const normalizedVolume = Math.max(10, Math.min(100000, Math.round(baseVolume)));
    
    // Calculate confidence based on signals available
    let confidence = 30; // Base confidence
    if (frequency > 5) confidence += 20;
    if (pageData.titleContainsKeyword) confidence += 15;
    if (pageData.h1ContainsKeyword) confidence += 10;
    if (paaCount > 0) confidence += 10;
    if (wordCount >= 2 && wordCount <= 4) confidence += 15;
    
    return {
      estimatedVolume: normalizedVolume,
      confidence: Math.min(100, confidence),
      factors: {
        baseFrequency: frequency,
        lengthMultiplier: lengthMultiplier,
        paaBoost: paaCount > 0,
        titleBoost: pageData.titleContainsKeyword || false,
        h1Boost: pageData.h1ContainsKeyword || false
      }
    };
  }
  
  /**
   * Detect PAA (People Also Ask) patterns in content
   * @param {string} html - HTML content
   * @returns {Object} PAA analysis
   */
  static detectPAAPatterns(html) {
    if (!html) return { count: 0, questions: [] };
    
    // Look for FAQ-like patterns
    const questionPatterns = [
      /what\s+is\s+[\w\s]+\?/gi,
      /how\s+(?:do|does|can|to)\s+[\w\s]+\?/gi,
      /why\s+(?:is|are|do|does)\s+[\w\s]+\?/gi,
      /when\s+(?:is|are|do|does|should)\s+[\w\s]+\?/gi,
      /where\s+(?:is|are|can|do)\s+[\w\s]+\?/gi,
      /who\s+(?:is|are|can)\s+[\w\s]+\?/gi,
      /can\s+(?:i|you|we)\s+[\w\s]+\?/gi,
      /is\s+[\w\s]+\s+(?:safe|legal|worth|good|bad)\?/gi
    ];
    
    const questions = [];
    const seen = new Set();
    
    for (const pattern of questionPatterns) {
      const matches = html.match(pattern) || [];
      for (const match of matches) {
        const normalized = match.toLowerCase().trim();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          questions.push(match.trim());
        }
      }
    }
    
    return {
      count: questions.length,
      questions: questions.slice(0, 20),
      hasFAQStructure: html.includes('FAQPage') || html.includes('itemtype="https://schema.org/Question"')
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1G: SEMANTIC INTELLIGENCE ENGINE (MAIN CLASS)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * SemanticIntelligenceEngine - Main orchestrator for semantic analysis
 */
class SemanticIntelligenceEngine {
  
  constructor() {
    this.intentClassifier = new IntentClassifier();
  }
  
  /**
   * Perform complete semantic analysis on HTML content
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL (for context)
   * @returns {Object} Complete semantic analysis
   */
  analyze(html, url = '') {
    console.log(`🧠 Semantic Engine: Analyzing content...`);
    const startTime = Date.now();
    
    if (!html) {
      return this._emptyResult('No HTML content provided');
    }
    
    try {
      // Extract text content
      const fullText = TextExtractor.extractText(html);
      const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
      
      // Extract title
      const titles = TextExtractor.extractByTag(html, 'title');
      const title = titles[0] || '';
      
      // Heading analysis
      const headingAnalysis = HeadingAuditor.analyze(html);
      
      // PAA pattern detection
      const paaAnalysis = VolumeEstimator.detectPAAPatterns(html);
      
      // N-gram extraction
      const ngramMap = NGramExtractor.extractAllNGrams(fullText);
      const topNGrams = NGramExtractor.getTopNGrams(
        ngramMap,
        SEMANTIC_CONFIG.NGRAM.TOP_KEYWORDS,
        SEMANTIC_CONFIG.NGRAM.MIN_FREQUENCY
      );
      
      // Build keyword context
      const titleLower = title.toLowerCase();
      const h1Lower = (headingAnalysis.primaryH1 || '').toLowerCase();
      const h2List = headingAnalysis.headings.h2.map(h => h.toLowerCase());
      
      // Classify keywords with context
      const keywords = topNGrams.map(ng => {
        const ngLower = ng.ngram.toLowerCase();
        
        const context = {
          inTitle: titleLower.includes(ngLower),
          inH1: h1Lower.includes(ngLower),
          inH2: h2List.some(h2 => h2.includes(ngLower))
        };
        
        const intent = this.intentClassifier.classify(ng.ngram, context);
        
        const volumeData = VolumeEstimator.estimate({
          ...ng,
          wordCount: ng.ngram.split(' ').length
        }, {
          paaCount: paaAnalysis.count,
          titleContainsKeyword: context.inTitle,
          h1ContainsKeyword: context.inH1,
          h2ContainsKeyword: context.inH2
        });
        
        return {
          keyword: ng.ngram,
          frequency: ng.frequency,
          wordCount: ng.wordCount,
          intent: intent.primary,
          intentConfidence: intent.confidence,
          intentSignals: intent.signals,
          estimatedVolume: volumeData.estimatedVolume,
          volumeConfidence: volumeData.confidence,
          context: context
        };
      });
      
      // Calculate intent distribution
      const intentDistribution = this._calculateIntentDistribution(keywords);
      
      // Calculate semantic scores
      const semanticScore = this._calculateSemanticScore(keywords, headingAnalysis, paaAnalysis);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Semantic Engine: Extracted ${keywords.length} keywords in ${duration}ms`);
      
      return {
        success: true,
        url: url,
        wordCount: wordCount,
        title: title,
        keywords: keywords,
        keywordCount: keywords.length,
        headingAnalysis: headingAnalysis,
        paaAnalysis: paaAnalysis,
        intentDistribution: intentDistribution,
        semanticScore: semanticScore,
        processingTime: duration
      };
      
    } catch (e) {
      console.error(`❌ Semantic Engine: Analysis failed: ${e.message}`);
      return this._emptyResult(e.message);
    }
  }
  
  /**
   * Calculate intent distribution
   * @param {Array} keywords - Classified keywords
   * @returns {Object} Distribution percentages
   */
  _calculateIntentDistribution(keywords) {
    const counts = {
      transactional: 0,
      commercial: 0,
      informational: 0,
      navigational: 0
    };
    
    for (const kw of keywords) {
      counts[kw.intent] = (counts[kw.intent] || 0) + 1;
    }
    
    const total = keywords.length || 1;
    
    return {
      transactional: Math.round((counts.transactional / total) * 100),
      commercial: Math.round((counts.commercial / total) * 100),
      informational: Math.round((counts.informational / total) * 100),
      navigational: Math.round((counts.navigational / total) * 100),
      primaryIntent: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'informational'
    };
  }
  
  /**
   * Calculate overall semantic score
   * @param {Array} keywords - Classified keywords
   * @param {Object} headingAnalysis - Heading analysis result
   * @param {Object} paaAnalysis - PAA analysis result
   * @returns {Object} Semantic scores
   */
  _calculateSemanticScore(keywords, headingAnalysis, paaAnalysis) {
    let score = 50; // Base score
    
    // Keyword diversity bonus (more unique keywords = better)
    const keywordBonus = Math.min(25, keywords.length * 0.5);
    score += keywordBonus;
    
    // Multi-word keyword bonus (long-tail opportunity)
    const longTailCount = keywords.filter(k => k.wordCount >= 2).length;
    const longTailBonus = Math.min(15, longTailCount * 0.5);
    score += longTailBonus;
    
    // Heading structure bonus
    const headingBonus = headingAnalysis.scores.overall * 0.1;
    score += headingBonus;
    
    // PAA presence bonus
    if (paaAnalysis.count > 0) {
      score += Math.min(10, paaAnalysis.count);
    }
    
    // FAQ structure bonus
    if (paaAnalysis.hasFAQStructure) {
      score += 5;
    }
    
    return {
      overall: Math.min(100, Math.round(score)),
      keywordDiversity: Math.round(keywordBonus * 4),
      longTailOpportunity: Math.round(longTailBonus * 6.67),
      headingStructure: headingAnalysis.scores.overall,
      paaReadiness: Math.min(100, paaAnalysis.count * 10)
    };
  }
  
  /**
   * Return empty result structure
   * @param {string} error - Error message
   */
  _emptyResult(error) {
    return {
      success: false,
      error: error,
      keywords: [],
      keywordCount: 0,
      headingAnalysis: HeadingAuditor._emptyResult(),
      paaAnalysis: { count: 0, questions: [] },
      intentDistribution: {
        transactional: 0, commercial: 0, informational: 0, navigational: 0
      },
      semanticScore: { overall: 0 }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.1H: GLOBAL SEMANTIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get semantic engine instance
 * @returns {SemanticIntelligenceEngine}
 */
function getSemanticEngine() {
  return new SemanticIntelligenceEngine();
}

/**
 * Analyze page semantics
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} Semantic analysis
 */
function analyzePageSemantics(html, url) {
  const engine = getSemanticEngine();
  return engine.analyze(html, url);
}

/**
 * Extract keywords from HTML
 * @param {string} html - HTML content
 * @param {number} limit - Max keywords (default 75)
 * @returns {Array} Keywords array
 */
function extractKeywords(html, limit = 75) {
  const text = TextExtractor.extractText(html);
  const ngramMap = NGramExtractor.extractAllNGrams(text);
  return NGramExtractor.getTopNGrams(ngramMap, limit);
}

/**
 * Audit heading structure
 * @param {string} html - HTML content
 * @returns {Object} Heading audit result
 */
function auditHeadingStructure(html) {
  return HeadingAuditor.analyze(html);
}

/**
 * Classify keyword intent
 * @param {string} keyword - Keyword to classify
 * @returns {Object} Intent classification
 */
function classifyKeywordIntent(keyword) {
  const classifier = new IntentClassifier();
  return classifier.classify(keyword);
}

/**
 * Test semantic engine with sample content
 */
function testSemanticEngine() {
  const sampleHtml = `
    <html>
    <head><title>Best Online Casinos 2024 - Top Rated Casino Sites</title></head>
    <body>
      <h1>Best Online Casinos for Real Money in 2024</h1>
      <p>Looking for the best online casinos? Our experts have reviewed hundreds of casino sites to bring you the top recommendations.</p>
      <h2>How to Choose a Safe Online Casino</h2>
      <p>When selecting an online casino, look for proper licensing from authorities like MGA or UKGC.</p>
      <h2>Top 10 Casino Bonuses</h2>
      <p>The best casino bonuses include welcome offers, free spins, and deposit matches.</p>
      <h3>What is a no deposit bonus?</h3>
      <p>A no deposit bonus is free money or spins given without requiring a deposit.</p>
    </body>
    </html>
  `;
  
  const result = analyzePageSemantics(sampleHtml, 'https://example.com/best-casinos');
  console.log('Semantic Analysis Result:', JSON.stringify(result, null, 2));
  return result;
}

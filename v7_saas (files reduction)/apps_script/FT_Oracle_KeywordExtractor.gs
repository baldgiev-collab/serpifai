/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 4: KEYWORD EXTRACTOR
 * Extract Primary, Secondary, Semantic, Long-Tail, PAA, FAQ Keywords
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract and categorize keywords from homepage + blog pages
 * - Primary keywords (high frequency, in title/H1)
 * - Secondary keywords (medium frequency, in H2-H6)
 * - Semantic/LSI keywords (related terms, co-occurring)
 * - Long-tail keywords (3-4+ word phrases)
 * - PAA questions (People Also Ask patterns)
 * - FAQ questions (FAQ schema, Q&A patterns)
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// KEYWORD EXTRACTOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var KEYWORD_EXTRACTOR_CONFIG = {
  // Extraction limits
  MAX_PRIMARY_KEYWORDS: 20,
  MAX_SECONDARY_KEYWORDS: 30,
  MAX_SEMANTIC_KEYWORDS: 40,
  MAX_LONGTAIL_KEYWORDS: 50,
  MAX_PAA_QUESTIONS: 20,
  MAX_FAQ_QUESTIONS: 30,
  
  // N-gram settings
  MIN_NGRAM: 1,
  MAX_NGRAM: 5,
  MIN_FREQUENCY: 2,
  MIN_WORD_LENGTH: 3,
  
  // Keyword classification thresholds
  PRIMARY_THRESHOLD: 5,          // Min frequency for primary
  SECONDARY_THRESHOLD: 3,        // Min frequency for secondary
  LONGTAIL_MIN_WORDS: 3,         // Min words for long-tail
  
  // Stop words to filter
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
    'if', 'when', 'where', 'while', 'each', 'few', 'many', 'much', 'both',
    'about', 'above', 'across', 'after', 'against', 'along', 'among',
    'around', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'beyond', 'during', 'except', 'inside', 'near', 'off', 'out', 'outside',
    'since', 'through', 'throughout', 'toward', 'under', 'until', 'upon',
    'within', 'without', 'click', 'read', 'view', 'see', 'get', 'home',
    'page', 'site', 'website', 'menu', 'navigation', 'footer', 'header'
  ]),
  
  // Intent patterns
  INTENT_PATTERNS: {
    transactional: ['buy', 'purchase', 'order', 'shop', 'price', 'cost', 'deal', 'discount', 'coupon', 'free', 'download', 'signup', 'register', 'subscribe', 'deposit', 'withdraw', 'bet', 'wager', 'play', 'claim', 'bonus'],
    commercial: ['best', 'top', 'review', 'comparison', 'compare', 'vs', 'alternative', 'recommended', 'rating', 'winner', 'trusted', 'safe', 'legit', 'licensed', 'regulated'],
    informational: ['how', 'what', 'why', 'when', 'where', 'who', 'which', 'guide', 'tutorial', 'learn', 'tips', 'strategy', 'method', 'step', 'introduction', 'beginner', 'basics'],
    navigational: ['login', 'signin', 'account', 'dashboard', 'profile', 'official', 'website', 'contact', 'support', 'help']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: KEYWORD EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * KeywordExtractor - Extracts and categorizes keywords from multiple pages
 */
class KeywordExtractor {
  
  constructor() {
    this.keywords = new Map();
    this.questions = [];
    this.titleKeywords = new Set();
    this.h1Keywords = new Set();
    this.h2Keywords = new Set();
  }
  
  /**
   * Extract keywords from multiple pages
   * @param {Array} pages - Array of page objects with html property
   * @returns {Object} Categorized keyword analysis
   */
  extractFromPages(pages) {
    console.log(`🔑 KeywordExtractor: Analyzing keywords from ${pages.length} pages`);
    const startTime = Date.now();
    
    // Reset state
    this._reset();
    
    // Process each page
    for (const page of pages) {
      if (!page.html || !page.success) continue;
      
      // Extract title and heading keywords first (for prioritization)
      this._extractPriorityKeywords(page.html);
      
      // Extract body text keywords
      this._extractBodyKeywords(page.html, page.url);
      
      // Extract questions (PAA, FAQ)
      this._extractQuestions(page.html, page.url);
    }
    
    // Categorize and build result
    const result = this._buildResult(startTime);
    console.log(`✅ KeywordExtractor: Extracted ${result.totalKeywords} keywords in ${result.processingTimeMs}ms`);
    
    return result;
  }
  
  /**
   * Extract priority keywords from title and headings
   */
  _extractPriorityKeywords(html) {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleWords = this._tokenize(titleMatch[1]);
      titleWords.forEach(w => this.titleKeywords.add(w.toLowerCase()));
    }
    
    // Extract H1
    const h1Matches = html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi);
    for (const match of h1Matches) {
      const h1Words = this._tokenize(this._stripHtml(match[1]));
      h1Words.forEach(w => this.h1Keywords.add(w.toLowerCase()));
    }
    
    // Extract H2
    const h2Matches = html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi);
    for (const match of h2Matches) {
      const h2Words = this._tokenize(this._stripHtml(match[1]));
      h2Words.forEach(w => this.h2Keywords.add(w.toLowerCase()));
    }
  }
  
  /**
   * Extract keywords from body text
   */
  _extractBodyKeywords(html, url) {
    // Clean HTML and extract text
    const text = this._extractBodyText(html);
    const words = this._tokenize(text);
    
    // Generate N-grams
    for (let n = KEYWORD_EXTRACTOR_CONFIG.MIN_NGRAM; n <= KEYWORD_EXTRACTOR_CONFIG.MAX_NGRAM; n++) {
      const ngrams = this._generateNGrams(words, n);
      
      for (const ngram of ngrams) {
        const key = ngram.toLowerCase();
        
        if (!this.keywords.has(key)) {
          this.keywords.set(key, {
            keyword: ngram,
            frequency: 0,
            wordCount: n,
            sources: [],
            inTitle: false,
            inH1: false,
            inH2: false
          });
        }
        
        const kw = this.keywords.get(key);
        kw.frequency++;
        if (!kw.sources.includes(url)) {
          kw.sources.push(url);
        }
      }
    }
    
    // Mark priority keywords
    for (const [key, kw] of this.keywords) {
      const words = key.split(' ');
      kw.inTitle = words.some(w => this.titleKeywords.has(w));
      kw.inH1 = words.some(w => this.h1Keywords.has(w));
      kw.inH2 = words.some(w => this.h2Keywords.has(w));
    }
  }
  
  /**
   * Extract questions (PAA and FAQ)
   */
  _extractQuestions(html, url) {
    const questions = [];
    
    // Question patterns
    const questionPatterns = [
      /(?:what|how|why|when|where|who|which|can|is|are|do|does|should|will|would)\s+[^.?!]*\?/gi,
      /<h[1-6][^>]*>([^<]*\?)<\/h[1-6]>/gi,
      /class="[^"]*faq[^"]*"[^>]*>([^<]+\?)/gi,
      /itemtype="[^"]*Question[^"]*"[^>]*>([^<]+\?)/gi
    ];
    
    for (const pattern of questionPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const question = this._stripHtml(match[1] || match[0]).trim();
        
        if (question.length > 10 && question.length < 200 && question.endsWith('?')) {
          // Check if already exists
          const isDuplicate = questions.some(q => 
            q.question.toLowerCase() === question.toLowerCase()
          );
          
          if (!isDuplicate) {
            questions.push({
              question: question,
              url: url,
              type: this._classifyQuestionType(question)
            });
          }
        }
      }
    }
    
    this.questions.push(...questions);
  }
  
  /**
   * Classify question type
   */
  _classifyQuestionType(question) {
    const qLower = question.toLowerCase();
    
    if (qLower.startsWith('how')) return 'how-to';
    if (qLower.startsWith('what')) return 'definition';
    if (qLower.startsWith('why')) return 'explanation';
    if (qLower.startsWith('when')) return 'timing';
    if (qLower.startsWith('where')) return 'location';
    if (qLower.startsWith('who')) return 'entity';
    if (qLower.startsWith('which')) return 'comparison';
    if (qLower.startsWith('can') || qLower.startsWith('is') || qLower.startsWith('are')) return 'yes-no';
    if (qLower.startsWith('should')) return 'advice';
    
    return 'general';
  }
  
  /**
   * Build final result with categorized keywords
   */
  _buildResult(startTime) {
    // Convert to array and filter by frequency
    const keywordList = Array.from(this.keywords.values())
      .filter(kw => kw.frequency >= KEYWORD_EXTRACTOR_CONFIG.MIN_FREQUENCY);
    
    // Categorize keywords
    const primary = this._extractPrimaryKeywords(keywordList);
    const secondary = this._extractSecondaryKeywords(keywordList);
    const semantic = this._extractSemanticKeywords(keywordList);
    const longTail = this._extractLongTailKeywords(keywordList);
    
    // Separate PAA and FAQ questions
    const paaQuestions = this._extractPAAQuestions();
    const faqQuestions = this._extractFAQQuestions();
    
    // Calculate intent distribution
    const intentDistribution = this._calculateIntentDistribution([...primary, ...secondary]);
    
    return {
      success: true,
      extractedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      
      // Categorized keywords
      primary: primary,
      secondary: secondary,
      semantic: semantic,
      longTail: longTail,
      
      // Questions
      paaQuestions: paaQuestions,
      faqQuestions: faqQuestions,
      
      // Counts
      counts: {
        primary: primary.length,
        secondary: secondary.length,
        semantic: semantic.length,
        longTail: longTail.length,
        paaQuestions: paaQuestions.length,
        faqQuestions: faqQuestions.length
      },
      
      totalKeywords: primary.length + secondary.length + semantic.length + longTail.length,
      totalQuestions: paaQuestions.length + faqQuestions.length,
      
      // Intent analysis
      intentDistribution: intentDistribution,
      
      // Top keywords summary
      topKeywords: [...primary, ...secondary].slice(0, 20).map(k => ({
        keyword: k.keyword,
        frequency: k.frequency,
        intent: k.intent
      }))
    };
  }
  
  /**
   * Extract primary keywords (high frequency, in title/H1)
   */
  _extractPrimaryKeywords(keywords) {
    return keywords
      .filter(kw => 
        kw.frequency >= KEYWORD_EXTRACTOR_CONFIG.PRIMARY_THRESHOLD ||
        kw.inTitle ||
        kw.inH1
      )
      .sort((a, b) => {
        // Score: frequency + title boost + H1 boost
        const aScore = a.frequency + (a.inTitle ? 10 : 0) + (a.inH1 ? 5 : 0);
        const bScore = b.frequency + (b.inTitle ? 10 : 0) + (b.inH1 ? 5 : 0);
        return bScore - aScore;
      })
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_PRIMARY_KEYWORDS)
      .map(kw => ({
        keyword: kw.keyword,
        frequency: kw.frequency,
        wordCount: kw.wordCount,
        inTitle: kw.inTitle,
        inH1: kw.inH1,
        sourceCount: kw.sources.length,
        intent: this._classifyIntent(kw.keyword),
        type: 'primary'
      }));
  }
  
  /**
   * Extract secondary keywords (medium frequency, in H2-H6)
   */
  _extractSecondaryKeywords(keywords) {
    const primarySet = new Set(
      this._extractPrimaryKeywords(keywords).map(k => k.keyword.toLowerCase())
    );
    
    return keywords
      .filter(kw => 
        !primarySet.has(kw.keyword.toLowerCase()) &&
        (kw.frequency >= KEYWORD_EXTRACTOR_CONFIG.SECONDARY_THRESHOLD || kw.inH2)
      )
      .sort((a, b) => {
        const aScore = a.frequency + (a.inH2 ? 3 : 0);
        const bScore = b.frequency + (b.inH2 ? 3 : 0);
        return bScore - aScore;
      })
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_SECONDARY_KEYWORDS)
      .map(kw => ({
        keyword: kw.keyword,
        frequency: kw.frequency,
        wordCount: kw.wordCount,
        inH2: kw.inH2,
        sourceCount: kw.sources.length,
        intent: this._classifyIntent(kw.keyword),
        type: 'secondary'
      }));
  }
  
  /**
   * Extract semantic/LSI keywords (related terms)
   */
  _extractSemanticKeywords(keywords) {
    const primarySet = new Set(
      this._extractPrimaryKeywords(keywords).map(k => k.keyword.toLowerCase())
    );
    const secondarySet = new Set(
      this._extractSecondaryKeywords(keywords).map(k => k.keyword.toLowerCase())
    );
    
    return keywords
      .filter(kw => 
        !primarySet.has(kw.keyword.toLowerCase()) &&
        !secondarySet.has(kw.keyword.toLowerCase()) &&
        kw.wordCount >= 2 &&
        kw.wordCount <= 3 &&
        kw.sources.length >= 2  // Appears in multiple pages
      )
      .sort((a, b) => b.sources.length - a.sources.length)
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_SEMANTIC_KEYWORDS)
      .map(kw => ({
        keyword: kw.keyword,
        frequency: kw.frequency,
        wordCount: kw.wordCount,
        sourceCount: kw.sources.length,
        type: 'semantic'
      }));
  }
  
  /**
   * Extract long-tail keywords (3-5 word phrases)
   */
  _extractLongTailKeywords(keywords) {
    return keywords
      .filter(kw => kw.wordCount >= KEYWORD_EXTRACTOR_CONFIG.LONGTAIL_MIN_WORDS)
      .sort((a, b) => {
        // Prefer longer, more specific phrases with good frequency
        const aScore = a.frequency * (a.wordCount * 0.5);
        const bScore = b.frequency * (b.wordCount * 0.5);
        return bScore - aScore;
      })
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_LONGTAIL_KEYWORDS)
      .map(kw => ({
        keyword: kw.keyword,
        frequency: kw.frequency,
        wordCount: kw.wordCount,
        sourceCount: kw.sources.length,
        intent: this._classifyIntent(kw.keyword),
        type: 'long-tail'
      }));
  }
  
  /**
   * Extract PAA-style questions
   */
  _extractPAAQuestions() {
    const paaTypes = ['how-to', 'definition', 'explanation', 'comparison'];
    
    return this.questions
      .filter(q => paaTypes.includes(q.type))
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_PAA_QUESTIONS)
      .map(q => ({
        question: q.question,
        type: q.type,
        category: 'paa'
      }));
  }
  
  /**
   * Extract FAQ-style questions
   */
  _extractFAQQuestions() {
    const faqTypes = ['yes-no', 'advice', 'general', 'timing', 'location', 'entity'];
    
    return this.questions
      .filter(q => faqTypes.includes(q.type))
      .slice(0, KEYWORD_EXTRACTOR_CONFIG.MAX_FAQ_QUESTIONS)
      .map(q => ({
        question: q.question,
        type: q.type,
        category: 'faq'
      }));
  }
  
  /**
   * Classify keyword intent
   */
  _classifyIntent(keyword) {
    const kwLower = keyword.toLowerCase();
    
    for (const [intent, patterns] of Object.entries(KEYWORD_EXTRACTOR_CONFIG.INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (kwLower.includes(pattern)) {
          return intent;
        }
      }
    }
    
    return 'informational'; // Default
  }
  
  /**
   * Calculate intent distribution
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
      primary: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'informational'
    };
  }
  
  /**
   * Extract clean body text from HTML
   */
  _extractBodyText(html) {
    // Remove script, style, nav, footer, header
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');
    
    // Strip remaining tags
    text = this._stripHtml(text);
    
    return text;
  }
  
  /**
   * Tokenize text into words
   */
  _tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= KEYWORD_EXTRACTOR_CONFIG.MIN_WORD_LENGTH &&
        !KEYWORD_EXTRACTOR_CONFIG.STOP_WORDS.has(word) &&
        !/^\d+$/.test(word)
      );
  }
  
  /**
   * Generate N-grams from word array
   */
  _generateNGrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      // Skip if starts or ends with stop word (for n > 1)
      if (n > 1) {
        const first = words[i];
        const last = words[i + n - 1];
        if (KEYWORD_EXTRACTOR_CONFIG.STOP_WORDS.has(first) ||
            KEYWORD_EXTRACTOR_CONFIG.STOP_WORDS.has(last)) {
          continue;
        }
      }
      ngrams.push(ngram);
    }
    return ngrams;
  }
  
  /**
   * Strip HTML tags
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
   * Reset state
   */
  _reset() {
    this.keywords = new Map();
    this.questions = [];
    this.titleKeywords = new Set();
    this.h1Keywords = new Set();
    this.h2Keywords = new Set();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get keyword extractor instance
 * @returns {KeywordExtractor}
 */
function getKeywordExtractor() {
  return new KeywordExtractor();
}

/**
 * Extract keywords from multiple pages
 * @param {Array} pages - Array of page objects with html property
 * @returns {Object} Categorized keyword analysis
 */
function extractKeywordsFromPages(pages) {
  const extractor = getKeywordExtractor();
  return extractor.extractFromPages(pages);
}

/**
 * Test keyword extractor
 */
function testKeywordExtractor() {
  const samplePages = [
    {
      html: `<html>
        <title>Best Online Casinos 2024 - Top Casino Sites</title>
        <h1>Best Online Casinos for Real Money</h1>
        <h2>How to Choose a Safe Casino</h2>
        <p>When looking for the best online casinos, you need to check the license and regulation. 
        Top casino sites offer great bonuses and fast payouts. The best gambling sites are licensed by MGA.</p>
        <h2>What is a no deposit bonus?</h2>
        <p>A no deposit bonus lets you play without making a deposit. Free spins and bonus cash are common types.</p>
        <h3>How do I claim a casino bonus?</h3>
        <p>To claim your casino bonus, register an account and enter the bonus code if required.</p>
      </html>`,
      url: 'https://example.com/',
      success: true,
      type: 'homepage'
    }
  ];
  
  const result = extractKeywordsFromPages(samplePages);
  console.log('Keyword Extraction Result:', JSON.stringify(result, null, 2));
  return result;
}

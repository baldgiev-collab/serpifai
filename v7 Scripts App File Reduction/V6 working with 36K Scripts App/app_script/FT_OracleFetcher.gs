/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - FT_ORACLEFETCHER.GS
 * 0.1% Elite Batch Scraping Engine with Deep On-Page Forensics
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract deep on-page data for competitor domains
 * - Homepage + Top 15 Blog URLs per competitor
 * - H1-H6 Hierarchical Structure (First 30 headings)
 * - Meta-Data: Title, Description, Canonical, OG Tags
 * - Keyword Density: Primary, Secondary, Semantic (LSI), Long-Tail
 * - Internal Links: Count, Anchor Text, Link-to-Page mapping
 * - PAA Questions, FAQs, Schema Markup
 * 
 * STATE MANAGEMENT: PropertiesService batching with auto-resume triggers
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ORACLE FETCHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ORACLE_FETCHER_CONFIG = {
  // Batch Processing
  BATCH_SIZE: 50,                    // URLs per cycle (avoid 6-min timeout)
  MAX_BLOG_PAGES: 15,                // Top blog pages per competitor
  MAX_HEADINGS: 30,                  // First 30 headings to extract
  MAX_KEYWORDS_PER_PAGE: 75,         // Keywords per page
  
  // Timeouts
  FETCH_TIMEOUT: 30000,              // 30 seconds per URL
  BATCH_DELAY: 2000,                 // 2 second delay between fetches
  
  // State Management Keys
  STATE_KEY: 'ORACLE_FETCHER_STATE',
  QUEUE_KEY: 'ORACLE_FETCHER_QUEUE',
  RESULTS_KEY: 'ORACLE_FETCHER_RESULTS',
  
  // Gateway
  GATEWAY_URL: 'https://serpifai.com/serpifai_php/api_gateway.php',
  LICENSE_KEY: 'SERP-FAI-TEST-KEY-123456'
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ORACLE DEEP SCRAPER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleDeepScraper - Elite-level content extraction engine
 */
class OracleDeepScraper {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.documentProps = PropertiesService.getDocumentProperties();
  }
  
  /**
   * Extract comprehensive page data from HTML
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @returns {Object} Complete page forensics
   */
  extractPageForensics(html, url) {
    const startTime = Date.now();
    
    const forensics = {
      url: url,
      domain: this._extractDomain(url),
      extractedAt: new Date().toISOString(),
      
      // Heading Structure (H1-H6)
      headings: this._extractHeadingHierarchy(html),
      
      // Meta Data
      meta: this._extractMetaData(html),
      
      // Keywords Analysis
      keywords: this._extractKeywords(html, url),
      
      // Internal Links with Anchor Text
      internalLinks: this._extractInternalLinks(html, url),
      
      // External Links
      externalLinks: this._extractExternalLinks(html, url),
      
      // Schema Markup
      schema: this._extractSchemaMarkup(html),
      
      // Content Metrics
      contentMetrics: this._extractContentMetrics(html),
      
      // EEAT Signals
      eeatSignals: this._extractEEATSignals(html),
      
      // PAA & FAQs
      questionsAndFAQs: this._extractQuestionsAndFAQs(html),
      
      // Processing Time
      processingTimeMs: Date.now() - startTime
    };
    
    return forensics;
  }
  
  /**
   * Extract H1-H6 heading hierarchy with full text
   * @param {string} html - Raw HTML
   * @returns {Object} Heading structure
   */
  _extractHeadingHierarchy(html) {
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      hierarchy: [],
      totalCount: 0
    };
    
    // Extract all headings with their level
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    let order = 0;
    
    while ((match = headingRegex.exec(html)) !== null && order < ORACLE_FETCHER_CONFIG.MAX_HEADINGS) {
      const level = parseInt(match[1]);
      const rawText = match[2];
      const cleanText = this._stripHtml(rawText).trim();
      
      if (cleanText.length > 0) {
        const headingData = {
          level: level,
          text: cleanText,
          order: order,
          wordCount: cleanText.split(/\s+/).length,
          hasKeyword: false  // Will be set later
        };
        
        headings[`h${level}`].push(headingData);
        headings.hierarchy.push(headingData);
        headings.totalCount++;
        order++;
      }
    }
    
    // Build tree structure
    headings.tree = this._buildHeadingTree(headings.hierarchy);
    
    return headings;
  }
  
  /**
   * Build hierarchical tree from flat heading list
   */
  _buildHeadingTree(flatHeadings) {
    const tree = [];
    const stack = [{ level: 0, children: tree }];
    
    for (const heading of flatHeadings) {
      const node = {
        level: heading.level,
        text: heading.text,
        children: []
      };
      
      // Pop stack until we find parent level
      while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }
      
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }
    
    return tree;
  }
  
  /**
   * Extract meta data including OG tags
   */
  _extractMetaData(html) {
    const meta = {
      title: '',
      description: '',
      canonical: '',
      robots: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      twitterCard: '',
      twitterTitle: '',
      twitterDescription: '',
      author: '',
      publishDate: '',
      modifiedDate: '',
      language: '',
      charset: ''
    };
    
    // Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) meta.title = this._stripHtml(titleMatch[1]).trim();
    
    // Meta tags
    const metaRegex = /<meta\s+([^>]+)>/gi;
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      const attrs = match[1];
      
      // Description
      if (/name\s*=\s*["']description["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.description = content[1];
      }
      
      // Robots
      if (/name\s*=\s*["']robots["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.robots = content[1];
      }
      
      // Author
      if (/name\s*=\s*["']author["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.author = content[1];
      }
      
      // OG Tags
      if (/property\s*=\s*["']og:title["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.ogTitle = content[1];
      }
      if (/property\s*=\s*["']og:description["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.ogDescription = content[1];
      }
      if (/property\s*=\s*["']og:image["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.ogImage = content[1];
      }
      if (/property\s*=\s*["']og:type["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.ogType = content[1];
      }
      
      // Twitter Cards
      if (/name\s*=\s*["']twitter:card["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.twitterCard = content[1];
      }
      if (/name\s*=\s*["']twitter:title["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.twitterTitle = content[1];
      }
      
      // Article dates
      if (/property\s*=\s*["']article:published_time["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.publishDate = content[1];
      }
      if (/property\s*=\s*["']article:modified_time["']/i.test(attrs)) {
        const content = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
        if (content) meta.modifiedDate = content[1];
      }
    }
    
    // Canonical
    const canonicalMatch = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i);
    if (canonicalMatch) meta.canonical = canonicalMatch[1];
    
    // Language
    const langMatch = html.match(/<html[^>]*lang\s*=\s*["']([^"']+)["']/i);
    if (langMatch) meta.language = langMatch[1];
    
    // Charset
    const charsetMatch = html.match(/<meta[^>]*charset\s*=\s*["']?([^"'\s>]+)/i);
    if (charsetMatch) meta.charset = charsetMatch[1];
    
    return meta;
  }
  
  /**
   * Extract keywords with density analysis
   */
  _extractKeywords(html, url) {
    const text = this._stripHtml(html).toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const totalWords = words.length;
    
    // Word frequency
    const freq = {};
    for (const word of words) {
      const clean = word.replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !this._isStopWord(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    }
    
    // Extract 2-gram and 3-gram phrases
    const ngrams2 = this._extractNgrams(words, 2);
    const ngrams3 = this._extractNgrams(words, 3);
    
    // Sort by frequency
    const sortedWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);
    
    const sortedPhrases2 = Object.entries(ngrams2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
    
    const sortedPhrases3 = Object.entries(ngrams3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return {
      // Primary Keywords (top single words)
      primary: sortedWords.slice(0, 10).map(([word, count]) => ({
        keyword: word,
        count: count,
        density: ((count / totalWords) * 100).toFixed(2) + '%',
        type: 'primary'
      })),
      
      // Secondary Keywords (2-word phrases)
      secondary: sortedPhrases2.slice(0, 15).map(([phrase, count]) => ({
        keyword: phrase,
        count: count,
        density: ((count / (totalWords - 1)) * 100).toFixed(2) + '%',
        type: 'secondary'
      })),
      
      // Long-tail Keywords (3-word phrases)
      longTail: sortedPhrases3.slice(0, 10).map(([phrase, count]) => ({
        keyword: phrase,
        count: count,
        density: ((count / (totalWords - 2)) * 100).toFixed(2) + '%',
        type: 'long-tail'
      })),
      
      // Semantic/LSI (remaining high-frequency words)
      semantic: sortedWords.slice(10, 30).map(([word, count]) => ({
        keyword: word,
        count: count,
        density: ((count / totalWords) * 100).toFixed(2) + '%',
        type: 'semantic'
      })),
      
      // Stats
      stats: {
        totalWords: totalWords,
        uniqueWords: Object.keys(freq).length,
        avgWordLength: (words.join('').length / words.length).toFixed(1)
      }
    };
  }
  
  /**
   * Extract n-grams from word array
   */
  _extractNgrams(words, n) {
    const ngrams = {};
    const cleanWords = words.map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 1);
    
    for (let i = 0; i <= cleanWords.length - n; i++) {
      const gram = cleanWords.slice(i, i + n).join(' ');
      if (!this._containsStopWordOnly(gram)) {
        ngrams[gram] = (ngrams[gram] || 0) + 1;
      }
    }
    
    return ngrams;
  }
  
  /**
   * Extract internal links with anchor text
   */
  _extractInternalLinks(html, baseUrl) {
    const baseDomain = this._extractDomain(baseUrl);
    const links = [];
    const linkMap = {};
    
    const linkRegex = /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[2];
      const anchorHtml = match[3];
      const anchorText = this._stripHtml(anchorHtml).trim();
      
      // Check if internal
      const linkDomain = this._extractDomain(href);
      const isInternal = !href.startsWith('http') || linkDomain === baseDomain;
      
      if (isInternal && anchorText.length > 0) {
        const fullUrl = this._resolveUrl(href, baseUrl);
        
        if (!linkMap[fullUrl]) {
          linkMap[fullUrl] = {
            url: fullUrl,
            anchors: [],
            count: 0
          };
        }
        
        linkMap[fullUrl].anchors.push(anchorText);
        linkMap[fullUrl].count++;
      }
    }
    
    // Convert to array and sort by count
    const sortedLinks = Object.values(linkMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);
    
    return {
      links: sortedLinks,
      totalCount: Object.keys(linkMap).length,
      topAnchors: this._getTopAnchors(sortedLinks),
      anchorDiversity: this._calculateAnchorDiversity(sortedLinks)
    };
  }
  
  /**
   * Extract external links
   */
  _extractExternalLinks(html, baseUrl) {
    const baseDomain = this._extractDomain(baseUrl);
    const links = [];
    const domains = {};
    
    const linkRegex = /<a\s+([^>]*href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[2];
      const anchorText = this._stripHtml(match[3]).trim();
      const linkDomain = this._extractDomain(href);
      
      if (linkDomain !== baseDomain) {
        // Check for nofollow
        const isNofollow = /rel\s*=\s*["'][^"']*nofollow/i.test(match[1]);
        
        if (!domains[linkDomain]) {
          domains[linkDomain] = {
            domain: linkDomain,
            links: [],
            count: 0,
            hasNofollow: false
          };
        }
        
        domains[linkDomain].links.push({
          url: href,
          anchor: anchorText,
          nofollow: isNofollow
        });
        domains[linkDomain].count++;
        if (isNofollow) domains[linkDomain].hasNofollow = true;
      }
    }
    
    return {
      domains: Object.values(domains).sort((a, b) => b.count - a.count).slice(0, 50),
      totalDomains: Object.keys(domains).length,
      totalLinks: Object.values(domains).reduce((sum, d) => sum + d.count, 0)
    };
  }
  
  /**
   * Extract Schema.org markup
   */
  _extractSchemaMarkup(html) {
    const schemas = {
      jsonLD: [],
      microdata: [],
      rdfa: [],
      types: []
    };
    
    // JSON-LD
    const jsonLdRegex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        schemas.jsonLD.push({
          type: data['@type'] || 'Unknown',
          data: data,
          raw: match[1].substring(0, 500)  // First 500 chars for reference
        });
        if (data['@type']) {
          schemas.types.push(data['@type']);
        }
      } catch (e) {
        schemas.jsonLD.push({
          type: 'ParseError',
          error: e.message,
          raw: match[1].substring(0, 200)
        });
      }
    }
    
    // Microdata types
    const itemtypeRegex = /itemtype\s*=\s*["']([^"']+)["']/gi;
    while ((match = itemtypeRegex.exec(html)) !== null) {
      const type = match[1].split('/').pop();
      schemas.microdata.push(type);
      schemas.types.push(type);
    }
    
    // Unique types
    schemas.types = [...new Set(schemas.types)];
    
    return schemas;
  }
  
  /**
   * Extract content metrics
   */
  _extractContentMetrics(html) {
    const text = this._stripHtml(html);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = html.split(/<\/p>/i).length - 1;
    
    // Images
    const images = (html.match(/<img\s/gi) || []).length;
    const imagesWithAlt = (html.match(/<img\s[^>]*alt\s*=\s*["'][^"']+["']/gi) || []).length;
    
    // Videos
    const videos = (html.match(/<video|<iframe[^>]*youtube|<iframe[^>]*vimeo/gi) || []).length;
    
    // Lists
    const lists = (html.match(/<[ou]l\s/gi) || []).length;
    const listItems = (html.match(/<li\s/gi) || []).length;
    
    // Tables
    const tables = (html.match(/<table\s/gi) || []).length;
    
    // Reading time (200 words/min)
    const readingTimeMinutes = Math.ceil(words.length / 200);
    
    // Flesch-Kincaid approximation
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllables = 1.5;  // Approximation
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllables);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      readingTimeMinutes: readingTimeMinutes,
      readabilityScore: Math.max(0, Math.min(100, fleschScore)).toFixed(0),
      images: {
        total: images,
        withAlt: imagesWithAlt,
        altCoverage: images > 0 ? ((imagesWithAlt / images) * 100).toFixed(0) + '%' : 'N/A'
      },
      videos: videos,
      lists: {
        count: lists,
        items: listItems
      },
      tables: tables
    };
  }
  
  /**
   * Extract EEAT signals
   */
  _extractEEATSignals(html) {
    const signals = {
      experience: {
        score: 0,
        signals: []
      },
      expertise: {
        score: 0,
        signals: []
      },
      authoritativeness: {
        score: 0,
        signals: []
      },
      trustworthiness: {
        score: 0,
        signals: []
      },
      overall: {
        score: 0,
        grade: 'Unknown'
      }
    };
    
    const htmlLower = html.toLowerCase();
    const text = this._stripHtml(html).toLowerCase();
    
    // ─── EXPERIENCE ───
    // First-person narratives
    const firstPersonMatch = text.match(/\b(i have|i've|my experience|in my|i personally|years of experience)\b/g);
    if (firstPersonMatch) {
      signals.experience.signals.push({
        type: 'first_person_narrative',
        count: firstPersonMatch.length,
        examples: firstPersonMatch.slice(0, 3)
      });
      signals.experience.score += Math.min(firstPersonMatch.length * 5, 25);
    }
    
    // Case studies
    if (/case study|case studies|real example|real-world|hands-on/i.test(text)) {
      signals.experience.signals.push({ type: 'case_study_reference', found: true });
      signals.experience.score += 15;
    }
    
    // ─── EXPERTISE ───
    // Author bio
    const authorBioMatch = html.match(/class\s*=\s*["'][^"']*(?:author|bio|byline|writer)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|aside)/i);
    if (authorBioMatch) {
      signals.expertise.signals.push({
        type: 'author_bio',
        found: true,
        preview: this._stripHtml(authorBioMatch[1]).substring(0, 200)
      });
      signals.expertise.score += 20;
    }
    
    // Credentials
    const credentialPatterns = /\b(phd|md|cpa|mba|certified|licensed|expert|specialist|consultant|professor|doctor|years? of experience|\d+\+ years?)\b/gi;
    const credentials = text.match(credentialPatterns);
    if (credentials) {
      signals.expertise.signals.push({
        type: 'credentials',
        found: [...new Set(credentials)].slice(0, 5)
      });
      signals.expertise.score += Math.min(credentials.length * 5, 20);
    }
    
    // ─── AUTHORITATIVENESS ───
    // Citations and references
    const citations = html.match(/<(?:cite|blockquote)|href\s*=\s*["'][^"']*(?:\.gov|\.edu|wikipedia|pubmed|scholar\.google)/gi);
    if (citations) {
      signals.authoritativeness.signals.push({
        type: 'citations',
        count: citations.length
      });
      signals.authoritativeness.score += Math.min(citations.length * 3, 20);
    }
    
    // Press mentions
    if (/featured in|as seen on|mentioned by|quoted by|press release/i.test(text)) {
      signals.authoritativeness.signals.push({ type: 'press_mentions', found: true });
      signals.authoritativeness.score += 15;
    }
    
    // Awards
    if (/award|recognition|certified|accredited|#1|best|top rated/i.test(text)) {
      signals.authoritativeness.signals.push({ type: 'awards_recognition', found: true });
      signals.authoritativeness.score += 10;
    }
    
    // ─── TRUSTWORTHINESS ───
    // Contact information
    if (/contact|email|phone|address|headquarters/i.test(html) && /<a\s[^>]*href\s*=\s*["']mailto:/i.test(html)) {
      signals.trustworthiness.signals.push({ type: 'contact_info', found: true });
      signals.trustworthiness.score += 15;
    }
    
    // Privacy policy
    if (/privacy policy|terms of service|terms and conditions/i.test(html)) {
      signals.trustworthiness.signals.push({ type: 'legal_pages', found: true });
      signals.trustworthiness.score += 10;
    }
    
    // Security badges
    if (/ssl|https|secure|verified|trusted|bbb|norton|mcafee/i.test(htmlLower)) {
      signals.trustworthiness.signals.push({ type: 'security_signals', found: true });
      signals.trustworthiness.score += 10;
    }
    
    // Social proof
    const socialProof = html.match(/\d+(?:k|\+)?\s*(?:customers|clients|users|reviews|followers)/gi);
    if (socialProof) {
      signals.trustworthiness.signals.push({
        type: 'social_proof',
        found: socialProof.slice(0, 3)
      });
      signals.trustworthiness.score += 15;
    }
    
    // Calculate overall score
    signals.overall.score = Math.round(
      (signals.experience.score + signals.expertise.score + 
       signals.authoritativeness.score + signals.trustworthiness.score) / 4
    );
    
    // Grade
    if (signals.overall.score >= 80) signals.overall.grade = 'Excellent';
    else if (signals.overall.score >= 60) signals.overall.grade = 'Good';
    else if (signals.overall.score >= 40) signals.overall.grade = 'Average';
    else if (signals.overall.score >= 20) signals.overall.grade = 'Weak';
    else signals.overall.grade = 'Poor';
    
    return signals;
  }
  
  /**
   * Extract PAA and FAQ content
   */
  _extractQuestionsAndFAQs(html) {
    const result = {
      faqs: [],
      questions: [],
      howToSteps: []
    };
    
    // FAQ Schema
    const faqSchemaMatch = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?FAQPage[\s\S]*?)<\/script>/i);
    if (faqSchemaMatch) {
      try {
        const data = JSON.parse(faqSchemaMatch[1]);
        if (data.mainEntity) {
          result.faqs = data.mainEntity.map(item => ({
            question: item.name,
            answer: this._stripHtml(item.acceptedAnswer?.text || '').substring(0, 300)
          }));
        }
      } catch (e) { /* ignore parse errors */ }
    }
    
    // Question patterns in content
    const questionRegex = /(?:^|\n)\s*(?:<[^>]+>)*([^<]*\?)\s*(?:<\/[^>]+>)*/gi;
    const text = this._stripHtml(html);
    const questions = text.match(/[A-Z][^.!?]*\?/g) || [];
    
    result.questions = [...new Set(questions)]
      .filter(q => q.length > 20 && q.length < 200)
      .slice(0, 20)
      .map(q => ({ question: q.trim() }));
    
    // HowTo Schema
    const howToMatch = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?HowTo[\s\S]*?)<\/script>/i);
    if (howToMatch) {
      try {
        const data = JSON.parse(howToMatch[1]);
        if (data.step) {
          result.howToSteps = data.step.map((step, i) => ({
            position: i + 1,
            name: step.name || step.text,
            description: this._stripHtml(step.text || step.description || '').substring(0, 200)
          }));
        }
      } catch (e) { /* ignore parse errors */ }
    }
    
    return result;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _stripHtml(html) {
    return (html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  _extractDomain(url) {
    try {
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
      return match ? match[1] : url;
    } catch (e) {
      return url;
    }
  }
  
  _resolveUrl(href, baseUrl) {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return 'https:' + href;
    
    const base = baseUrl.replace(/\/[^\/]*$/, '');
    if (href.startsWith('/')) {
      const origin = baseUrl.match(/^(https?:\/\/[^\/]+)/i);
      return origin ? origin[1] + href : href;
    }
    
    return base + '/' + href;
  }
  
  _isStopWord(word) {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has', 'her', 'was', 'one', 'our', 'out', 'his', 'had', 'been', 'have', 'will', 'from', 'they', 'this', 'that', 'with', 'your', 'what', 'there', 'their', 'about', 'which', 'when', 'where', 'would', 'could', 'should', 'more', 'some', 'than', 'into', 'just', 'over', 'such', 'only', 'also', 'back', 'after', 'other'];
    return stopWords.includes(word);
  }
  
  _containsStopWordOnly(phrase) {
    const words = phrase.split(' ');
    return words.every(w => this._isStopWord(w));
  }
  
  _getTopAnchors(links) {
    const anchors = {};
    for (const link of links) {
      for (const anchor of link.anchors) {
        anchors[anchor] = (anchors[anchor] || 0) + 1;
      }
    }
    return Object.entries(anchors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, count]) => ({ text, count }));
  }
  
  _calculateAnchorDiversity(links) {
    const allAnchors = links.flatMap(l => l.anchors);
    const unique = new Set(allAnchors);
    return {
      totalAnchors: allAnchors.length,
      uniqueAnchors: unique.size,
      diversityScore: allAnchors.length > 0 
        ? ((unique.size / allAnchors.length) * 100).toFixed(0) + '%'
        : 'N/A'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: BATCH PROCESSING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleBatchProcessor - Handles batch URL processing with state management
 */
class OracleBatchProcessor {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.scraper = new OracleDeepScraper();
  }
  
  /**
   * Start batch processing for competitor domains
   * @param {Array} domains - Array of competitor domains
   * @param {string} projectId - Project identifier
   */
  startBatchProcess(domains, projectId) {
    Logger.log('🚀 Oracle Batch Processor: Starting...');
    Logger.log(`   Domains: ${domains.length}`);
    Logger.log(`   Project: ${projectId}`);
    
    // Build URL queue (homepage + top blog pages for each domain)
    const queue = [];
    
    for (const domain of domains) {
      // Add homepage
      queue.push({
        domain: domain,
        url: 'https://' + domain.replace(/^https?:\/\//, '').replace(/^www\./, ''),
        type: 'homepage',
        status: 'pending'
      });
      
      // Add blog discovery URL
      queue.push({
        domain: domain,
        url: 'https://' + domain.replace(/^https?:\/\//, '').replace(/^www\./, '') + '/blog',
        type: 'blog_index',
        status: 'pending'
      });
    }
    
    // Save state
    const state = {
      projectId: projectId,
      domains: domains,
      startedAt: new Date().toISOString(),
      totalUrls: queue.length,
      processedUrls: 0,
      currentBatch: 0,
      status: 'running'
    };
    
    this.props.setProperty(ORACLE_FETCHER_CONFIG.STATE_KEY, JSON.stringify(state));
    this.props.setProperty(ORACLE_FETCHER_CONFIG.QUEUE_KEY, JSON.stringify(queue));
    this.props.setProperty(ORACLE_FETCHER_CONFIG.RESULTS_KEY, JSON.stringify([]));
    
    // Process first batch
    this.processBatch();
    
    return state;
  }
  
  /**
   * Process a batch of URLs (called by trigger or directly)
   */
  processBatch() {
    const stateJson = this.props.getProperty(ORACLE_FETCHER_CONFIG.STATE_KEY);
    if (!stateJson) {
      Logger.log('❌ No batch state found');
      return { success: false, error: 'No batch state' };
    }
    
    const state = JSON.parse(stateJson);
    const queue = JSON.parse(this.props.getProperty(ORACLE_FETCHER_CONFIG.QUEUE_KEY) || '[]');
    const results = JSON.parse(this.props.getProperty(ORACLE_FETCHER_CONFIG.RESULTS_KEY) || '[]');
    
    // Get pending URLs
    const pending = queue.filter(u => u.status === 'pending');
    
    if (pending.length === 0) {
      state.status = 'completed';
      state.completedAt = new Date().toISOString();
      this.props.setProperty(ORACLE_FETCHER_CONFIG.STATE_KEY, JSON.stringify(state));
      Logger.log('✅ Batch processing completed!');
      return { success: true, completed: true, results: results };
    }
    
    // Process batch
    const batch = pending.slice(0, ORACLE_FETCHER_CONFIG.BATCH_SIZE);
    Logger.log(`📦 Processing batch ${state.currentBatch + 1}: ${batch.length} URLs`);
    
    for (const item of batch) {
      try {
        Logger.log(`   🔍 Fetching: ${item.url}`);
        
        // Fetch HTML
        const html = this._fetchUrl(item.url);
        
        if (html) {
          // Extract forensics
          const forensics = this.scraper.extractPageForensics(html, item.url);
          forensics.pageType = item.type;
          forensics.competitorDomain = item.domain;
          
          results.push({
            success: true,
            ...forensics
          });
          
          item.status = 'completed';
          Logger.log(`      ✅ Extracted ${forensics.headings.totalCount} headings, ${forensics.keywords.primary.length} keywords`);
          
          // If blog index, discover blog posts
          if (item.type === 'blog_index') {
            const blogUrls = this._discoverBlogPosts(html, item.url, item.domain);
            for (const blogUrl of blogUrls) {
              queue.push(blogUrl);
            }
            Logger.log(`      📝 Discovered ${blogUrls.length} blog posts`);
          }
        } else {
          item.status = 'failed';
          item.error = 'Fetch returned empty';
          Logger.log(`      ❌ Failed to fetch`);
        }
        
        // Delay between fetches
        Utilities.sleep(ORACLE_FETCHER_CONFIG.BATCH_DELAY);
        
      } catch (e) {
        item.status = 'failed';
        item.error = e.message;
        Logger.log(`      ❌ Error: ${e.message}`);
      }
      
      state.processedUrls++;
    }
    
    state.currentBatch++;
    
    // Save state
    this.props.setProperty(ORACLE_FETCHER_CONFIG.STATE_KEY, JSON.stringify(state));
    this.props.setProperty(ORACLE_FETCHER_CONFIG.QUEUE_KEY, JSON.stringify(queue));
    this.props.setProperty(ORACLE_FETCHER_CONFIG.RESULTS_KEY, JSON.stringify(results));
    
    // Check if more batches needed
    const remainingPending = queue.filter(u => u.status === 'pending').length;
    
    if (remainingPending > 0) {
      Logger.log(`   📊 Progress: ${state.processedUrls}/${queue.length} URLs`);
      Logger.log(`   ⏰ Scheduling next batch (${remainingPending} remaining)...`);
      
      // Create trigger for next batch
      this._scheduleNextBatch();
    } else {
      state.status = 'completed';
      state.completedAt = new Date().toISOString();
      this.props.setProperty(ORACLE_FETCHER_CONFIG.STATE_KEY, JSON.stringify(state));
      Logger.log('✅ All batches completed!');
    }
    
    return {
      success: true,
      processed: batch.length,
      remaining: remainingPending,
      state: state
    };
  }
  
  /**
   * Fetch URL using UrlFetchApp or PHP Gateway
   */
  _fetchUrl(url) {
    try {
      // Try PHP Gateway first
      const gatewayResult = this._callGateway('fetcher_single', {
        url: url,
        options: { extractMetadata: true, extractLinks: true }
      });
      
      if (gatewayResult && gatewayResult.success && gatewayResult.data && gatewayResult.data.content) {
        return gatewayResult.data.content;
      }
      
      // Fallback to direct fetch
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.getResponseCode() === 200) {
        return response.getContentText();
      }
      
      return null;
    } catch (e) {
      Logger.log(`      Fetch error: ${e.message}`);
      return null;
    }
  }
  
  /**
   * Call PHP Gateway
   */
  _callGateway(action, payload) {
    try {
      const response = UrlFetchApp.fetch(ORACLE_FETCHER_CONFIG.GATEWAY_URL, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify({
          action: action,
          license: ORACLE_FETCHER_CONFIG.LICENSE_KEY,
          payload: payload
        }),
        muteHttpExceptions: true,
        timeout: 30000
      });
      
      if (response.getResponseCode() === 200) {
        return JSON.parse(response.getContentText());
      }
    } catch (e) {
      Logger.log(`      Gateway error: ${e.message}`);
    }
    return null;
  }
  
  /**
   * Discover blog posts from blog index page
   */
  _discoverBlogPosts(html, baseUrl, domain) {
    const posts = [];
    const seen = new Set();
    
    // Find article/post links
    const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*(?:blog|article|post|news)[^"']*)["']/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && posts.length < ORACLE_FETCHER_CONFIG.MAX_BLOG_PAGES) {
      let url = match[1];
      
      // Resolve relative URLs
      if (!url.startsWith('http')) {
        if (url.startsWith('/')) {
          url = 'https://' + domain + url;
        } else {
          url = baseUrl.replace(/\/[^\/]*$/, '/') + url;
        }
      }
      
      // Check if same domain and not seen
      const urlDomain = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/i);
      if (urlDomain && urlDomain[1].includes(domain) && !seen.has(url)) {
        seen.add(url);
        posts.push({
          domain: domain,
          url: url,
          type: 'blog_post',
          status: 'pending'
        });
      }
    }
    
    return posts.slice(0, ORACLE_FETCHER_CONFIG.MAX_BLOG_PAGES);
  }
  
  /**
   * Schedule next batch using trigger
   */
  _scheduleNextBatch() {
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === 'ORACLE_ResumeBatch') {
        ScriptApp.deleteTrigger(trigger);
      }
    }
    
    // Create new trigger (1 minute delay to avoid timeout)
    ScriptApp.newTrigger('ORACLE_ResumeBatch')
      .timeBased()
      .after(60 * 1000)  // 1 minute
      .create();
  }
  
  /**
   * Get current processing status
   */
  getStatus() {
    const stateJson = this.props.getProperty(ORACLE_FETCHER_CONFIG.STATE_KEY);
    if (!stateJson) return { status: 'idle', message: 'No batch in progress' };
    
    const state = JSON.parse(stateJson);
    const queue = JSON.parse(this.props.getProperty(ORACLE_FETCHER_CONFIG.QUEUE_KEY) || '[]');
    
    return {
      ...state,
      queueSize: queue.length,
      pending: queue.filter(u => u.status === 'pending').length,
      completed: queue.filter(u => u.status === 'completed').length,
      failed: queue.filter(u => u.status === 'failed').length
    };
  }
  
  /**
   * Get all results
   */
  getResults() {
    return JSON.parse(this.props.getProperty(ORACLE_FETCHER_CONFIG.RESULTS_KEY) || '[]');
  }
  
  /**
   * Clear batch state
   */
  clearState() {
    this.props.deleteProperty(ORACLE_FETCHER_CONFIG.STATE_KEY);
    this.props.deleteProperty(ORACLE_FETCHER_CONFIG.QUEUE_KEY);
    this.props.deleteProperty(ORACLE_FETCHER_CONFIG.RESULTS_KEY);
    Logger.log('🗑️ Batch state cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Start Oracle batch processing for competitor domains
 * @param {Array} domains - Competitor domains
 * @param {string} projectId - Project ID
 */
function ORACLE_StartBatch(domains, projectId) {
  const processor = new OracleBatchProcessor();
  return processor.startBatchProcess(domains, projectId || 'default');
}

/**
 * Resume batch processing (called by trigger)
 */
function ORACLE_ResumeBatch() {
  Logger.log('⏰ Trigger: Resuming batch processing...');
  const processor = new OracleBatchProcessor();
  return processor.processBatch();
}

/**
 * Get batch processing status
 */
function ORACLE_GetStatus() {
  const processor = new OracleBatchProcessor();
  const status = processor.getStatus();
  Logger.log('📊 Batch Status: ' + JSON.stringify(status, null, 2));
  return status;
}

/**
 * Get all batch results
 */
function ORACLE_GetResults() {
  const processor = new OracleBatchProcessor();
  return processor.getResults();
}

/**
 * Clear batch state
 */
function ORACLE_ClearState() {
  const processor = new OracleBatchProcessor();
  processor.clearState();
}

/**
 * Test single page extraction
 * @param {string} url - URL to test
 */
function ORACLE_TestSinglePage(url) {
  url = url || 'https://www.toptal.com/blog';
  
  Logger.log('🔬 Oracle Deep Scraper: Testing single page extraction');
  Logger.log('   URL: ' + url);
  
  const scraper = new OracleDeepScraper();
  
  // Fetch HTML
  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  
  if (response.getResponseCode() !== 200) {
    Logger.log('❌ Failed to fetch: HTTP ' + response.getResponseCode());
    return null;
  }
  
  const html = response.getContentText();
  Logger.log('   ✅ Fetched: ' + html.length + ' bytes');
  
  const forensics = scraper.extractPageForensics(html, url);
  
  Logger.log('\n═══ EXTRACTION RESULTS ═══');
  Logger.log('📝 Meta Title: ' + forensics.meta.title);
  Logger.log('📝 Meta Description: ' + (forensics.meta.description || '').substring(0, 100) + '...');
  Logger.log('📊 Headings: ' + forensics.headings.totalCount);
  Logger.log('   H1: ' + forensics.headings.h1.length + ' | H2: ' + forensics.headings.h2.length + ' | H3: ' + forensics.headings.h3.length);
  Logger.log('🔑 Keywords: Primary=' + forensics.keywords.primary.length + ', Secondary=' + forensics.keywords.secondary.length);
  Logger.log('🔗 Internal Links: ' + forensics.internalLinks.totalCount);
  Logger.log('🌐 External Links: ' + forensics.externalLinks.totalDomains + ' domains');
  Logger.log('📋 Schema Types: ' + forensics.schema.types.join(', '));
  Logger.log('📖 Word Count: ' + forensics.contentMetrics.wordCount);
  Logger.log('⭐ EEAT Score: ' + forensics.eeatSignals.overall.score + '/100 (' + forensics.eeatSignals.overall.grade + ')');
  Logger.log('❓ FAQs Found: ' + forensics.questionsAndFAQs.faqs.length);
  Logger.log('⏱️ Processing Time: ' + forensics.processingTimeMs + 'ms');
  
  return forensics;
}

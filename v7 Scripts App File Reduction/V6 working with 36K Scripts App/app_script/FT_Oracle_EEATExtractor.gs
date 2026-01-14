/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 7: EEAT SIGNAL EXTRACTOR
 * Extract Authority, Expertise, Trustworthiness, Experience Signals
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract E-E-A-T signals from competitor pages
 * - Experience: First-hand experience indicators
 * - Expertise: Subject matter expertise signals
 * - Authoritativeness: Industry authority markers
 * - Trustworthiness: Trust and credibility signals
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// EEAT SIGNAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var EEAT_CONFIG = {
  // Experience indicators
  EXPERIENCE_PATTERNS: {
    first_person: [
      'i tested', 'i tried', 'i used', 'i reviewed', 'i played',
      'my experience', 'in my experience', 'from my experience',
      'i personally', 'we tested', 'we tried', 'we used', 'we reviewed',
      'our team tested', 'our experts', 'hands-on', 'first-hand'
    ],
    case_studies: [
      'case study', 'real example', 'real-life example', 'actual results',
      'our results', 'my results', 'customer story', 'success story'
    ],
    personal_testimony: [
      'i recommend', 'i suggest', 'based on my', 'in my opinion',
      'from personal experience', 'speaking from experience'
    ]
  },
  
  // Expertise indicators
  EXPERTISE_PATTERNS: {
    credentials: [
      'certified', 'qualified', 'licensed', 'accredited', 'degree',
      'phd', 'doctor', 'professor', 'specialist', 'expert',
      'years of experience', 'industry veteran', 'professional'
    ],
    depth_indicators: [
      'in-depth', 'comprehensive', 'detailed analysis', 'thorough',
      'complete guide', 'ultimate guide', 'definitive guide',
      'step-by-step', 'advanced', 'pro tips', 'expert tips'
    ],
    data_references: [
      'research shows', 'studies show', 'according to research',
      'data indicates', 'statistics show', 'survey results',
      'our analysis', 'based on data', 'evidence suggests'
    ]
  },
  
  // Authority indicators
  AUTHORITY_PATTERNS: {
    citations: [
      'cited by', 'referenced by', 'featured in', 'as seen on',
      'mentioned in', 'covered by', 'quoted in', 'published in'
    ],
    awards: [
      'award', 'winner', 'best in', 'top rated', 'ranked #1',
      'industry leader', 'recognized', 'acclaimed', 'honored'
    ],
    partnerships: [
      'partner', 'official', 'authorized', 'approved',
      'affiliated with', 'member of', 'associated with'
    ],
    media_mentions: [
      'forbes', 'bloomberg', 'reuters', 'bbc', 'cnn',
      'new york times', 'washington post', 'techcrunch',
      'the guardian', 'associated press'
    ]
  },
  
  // Trust indicators
  TRUST_PATTERNS: {
    security: [
      'ssl', 'https', 'encrypted', 'secure', 'protected',
      'privacy', 'gdpr', 'compliant', 'certified secure'
    ],
    policies: [
      'privacy policy', 'terms of service', 'terms and conditions',
      'refund policy', 'money back', 'guarantee', 'disclaimer'
    ],
    contact: [
      'contact us', 'contact page', 'email', 'phone',
      'address', 'location', 'headquarters', 'support'
    ],
    transparency: [
      'about us', 'our team', 'who we are', 'our story',
      'our mission', 'our values', 'meet the team'
    ],
    social_proof: [
      'reviews', 'testimonials', 'customer feedback', 'ratings',
      'trusted by', 'customers served', 'users', 'subscribers'
    ],
    verification: [
      'verified', 'authentic', 'legitimate', 'real',
      'fact-checked', 'reviewed by', 'approved by'
    ],
    licensing: [
      'license', 'licensed', 'regulated', 'registered',
      'gambling license', 'gaming authority', 'mga', 'ukgc', 'curacao'
    ]
  },
  
  // Schema types that indicate EEAT
  EEAT_SCHEMA_TYPES: [
    'Person', 'Organization', 'Author', 'Review', 'Rating',
    'FAQPage', 'HowTo', 'Article', 'NewsArticle', 'BlogPosting',
    'MedicalWebPage', 'FinancialProduct', 'LocalBusiness'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: EEAT SIGNAL EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * EEATSignalExtractor - Extracts E-E-A-T signals from pages
 */
class EEATSignalExtractor {
  
  constructor() {
    this.signals = {
      experience: [],
      expertise: [],
      authority: [],
      trust: []
    };
    this.schemaData = [];
  }
  
  /**
   * Extract EEAT signals from multiple pages
   * @param {Array} pages - Array of page objects with html property
   * @param {string} domain - Domain being analyzed
   * @returns {Object} EEAT signal analysis
   */
  extractFromPages(pages, domain) {
    console.log(`🏆 EEATExtractor: Analyzing E-E-A-T signals from ${pages.length} pages`);
    const startTime = Date.now();
    
    // Reset state
    this._reset();
    
    // Process each page
    for (const page of pages) {
      if (!page.html || !page.success) continue;
      
      // Extract signals from page
      this._extractPageSignals(page.html, page.url);
      
      // Extract schema data
      this._extractSchemaData(page.html, page.url);
    }
    
    // Build result
    const result = this._buildResult(domain, pages.length, startTime);
    console.log(`✅ EEATExtractor: Extracted ${result.totalSignals} E-E-A-T signals in ${result.processingTimeMs}ms`);
    
    return result;
  }
  
  /**
   * Extract EEAT signals from single page
   */
  _extractPageSignals(html, url) {
    const textContent = this._extractText(html).toLowerCase();
    
    // Extract Experience signals
    this._extractCategorySignals(
      textContent, url, 'experience', 
      EEAT_CONFIG.EXPERIENCE_PATTERNS
    );
    
    // Extract Expertise signals
    this._extractCategorySignals(
      textContent, url, 'expertise',
      EEAT_CONFIG.EXPERTISE_PATTERNS
    );
    
    // Extract Authority signals
    this._extractCategorySignals(
      textContent, url, 'authority',
      EEAT_CONFIG.AUTHORITY_PATTERNS
    );
    
    // Extract Trust signals
    this._extractCategorySignals(
      textContent, url, 'trust',
      EEAT_CONFIG.TRUST_PATTERNS
    );
  }
  
  /**
   * Extract signals for a specific EEAT category
   */
  _extractCategorySignals(text, url, category, patterns) {
    for (const [subcategory, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        if (text.includes(pattern)) {
          // Check if already found this pattern
          const exists = this.signals[category].find(s => 
            s.pattern === pattern && s.url === url
          );
          
          if (!exists) {
            this.signals[category].push({
              category: category,
              subcategory: subcategory,
              pattern: pattern,
              url: url,
              context: this._extractContext(text, pattern)
            });
          }
        }
      }
    }
  }
  
  /**
   * Extract context around pattern
   */
  _extractContext(text, pattern) {
    const index = text.indexOf(pattern);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + pattern.length + 50);
    
    return '...' + text.substring(start, end).trim() + '...';
  }
  
  /**
   * Extract structured data (schema)
   */
  _extractSchemaData(html, url) {
    // Extract JSON-LD schemas
    const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const schemaText = match[1].trim();
        const schema = JSON.parse(schemaText);
        
        // Handle array of schemas
        const schemas = Array.isArray(schema) ? schema : [schema];
        
        for (const s of schemas) {
          const schemaType = s['@type'];
          
          if (schemaType && EEAT_CONFIG.EEAT_SCHEMA_TYPES.includes(schemaType)) {
            this.schemaData.push({
              type: schemaType,
              url: url,
              hasAuthor: !!s.author,
              hasPublisher: !!s.publisher,
              hasDatePublished: !!s.datePublished,
              hasDateModified: !!s.dateModified,
              hasReview: !!s.review || !!s.aggregateRating,
              data: this._summarizeSchema(s)
            });
          }
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    // Check for microdata
    if (html.includes('itemtype=') || html.includes('itemprop=')) {
      this.schemaData.push({
        type: 'microdata',
        url: url,
        hasAuthor: html.includes('itemprop="author"'),
        hasPublisher: html.includes('itemprop="publisher"'),
        hasDatePublished: html.includes('itemprop="datePublished"'),
        hasReview: html.includes('itemprop="review"') || html.includes('itemprop="ratingValue"')
      });
    }
  }
  
  /**
   * Summarize schema for output
   */
  _summarizeSchema(schema) {
    const summary = {
      type: schema['@type'],
      name: schema.name || null,
      author: null,
      publisher: null
    };
    
    if (schema.author) {
      if (typeof schema.author === 'string') {
        summary.author = schema.author;
      } else if (schema.author.name) {
        summary.author = schema.author.name;
      }
    }
    
    if (schema.publisher) {
      if (typeof schema.publisher === 'string') {
        summary.publisher = schema.publisher;
      } else if (schema.publisher.name) {
        summary.publisher = schema.publisher.name;
      }
    }
    
    return summary;
  }
  
  /**
   * Build final result
   */
  _buildResult(domain, pageCount, startTime) {
    // Count signals per category
    const signalCounts = {
      experience: this.signals.experience.length,
      expertise: this.signals.expertise.length,
      authority: this.signals.authority.length,
      trust: this.signals.trust.length
    };
    
    // Calculate scores
    const scores = this._calculateScores(signalCounts, pageCount);
    
    // Get top signals per category
    const topSignals = {
      experience: this._getTopSignals(this.signals.experience, 10),
      expertise: this._getTopSignals(this.signals.expertise, 10),
      authority: this._getTopSignals(this.signals.authority, 10),
      trust: this._getTopSignals(this.signals.trust, 15)
    };
    
    // Identify strengths and weaknesses
    const analysis = this._analyzeProfile(signalCounts, scores);
    
    return {
      success: true,
      domain: domain,
      extractedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      
      // Signal counts
      signalCounts: signalCounts,
      totalSignals: Object.values(signalCounts).reduce((a, b) => a + b, 0),
      
      // Scores (0-100)
      scores: scores,
      
      // Top signals per category
      topSignals: topSignals,
      
      // All unique signals
      allSignals: {
        experience: this._getUniquePatterns(this.signals.experience),
        expertise: this._getUniquePatterns(this.signals.expertise),
        authority: this._getUniquePatterns(this.signals.authority),
        trust: this._getUniquePatterns(this.signals.trust)
      },
      
      // Schema data
      schemaData: this.schemaData,
      schemaTypes: [...new Set(this.schemaData.map(s => s.type))],
      hasAuthorSchema: this.schemaData.some(s => s.hasAuthor),
      hasPublisherSchema: this.schemaData.some(s => s.hasPublisher),
      
      // Analysis
      analysis: analysis,
      
      // Summary
      summary: {
        pagesAnalyzed: pageCount,
        overallScore: scores.overall,
        strongestArea: Object.entries(scores)
          .filter(([k, _]) => k !== 'overall')
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
        weakestArea: Object.entries(scores)
          .filter(([k, _]) => k !== 'overall')
          .sort((a, b) => a[1] - b[1])[0]?.[0] || 'none',
        hasStructuredData: this.schemaData.length > 0
      }
    };
  }
  
  /**
   * Calculate EEAT scores
   */
  _calculateScores(signalCounts, pageCount) {
    // Base multiplier based on page count
    const pageMultiplier = Math.max(1, pageCount);
    
    // Calculate individual scores (normalized to 0-100)
    const experienceScore = Math.min(100, (signalCounts.experience / pageMultiplier) * 20);
    const expertiseScore = Math.min(100, (signalCounts.expertise / pageMultiplier) * 15);
    const authorityScore = Math.min(100, (signalCounts.authority / pageMultiplier) * 25);
    const trustScore = Math.min(100, (signalCounts.trust / pageMultiplier) * 10);
    
    // Schema bonus
    const schemaBonus = this.schemaData.length > 0 ? 10 : 0;
    
    // Calculate overall (weighted average)
    const overall = Math.round(
      (experienceScore * 0.2 + 
       expertiseScore * 0.25 + 
       authorityScore * 0.25 + 
       trustScore * 0.3 + 
       schemaBonus) 
    );
    
    return {
      experience: Math.round(experienceScore),
      expertise: Math.round(expertiseScore),
      authority: Math.round(authorityScore),
      trust: Math.round(trustScore),
      overall: Math.min(100, overall)
    };
  }
  
  /**
   * Get top signals for a category
   */
  _getTopSignals(signals, limit) {
    // Group by pattern and count occurrences
    const patternCounts = {};
    for (const signal of signals) {
      patternCounts[signal.pattern] = (patternCounts[signal.pattern] || 0) + 1;
    }
    
    // Sort by count and return top patterns
    return Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pattern, count]) => ({
        signal: pattern,
        occurrences: count,
        subcategory: signals.find(s => s.pattern === pattern)?.subcategory
      }));
  }
  
  /**
   * Get unique patterns for a category
   */
  _getUniquePatterns(signals) {
    return [...new Set(signals.map(s => s.pattern))];
  }
  
  /**
   * Analyze EEAT profile for strengths/weaknesses
   */
  _analyzeProfile(counts, scores) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // Experience analysis
    if (scores.experience >= 70) {
      analysis.strengths.push('Strong first-hand experience signals');
    } else if (scores.experience < 30) {
      analysis.weaknesses.push('Limited first-hand experience content');
      analysis.recommendations.push('Add personal testimonials, case studies, and "I tested" content');
    }
    
    // Expertise analysis
    if (scores.expertise >= 70) {
      analysis.strengths.push('Good expertise and credential signals');
    } else if (scores.expertise < 30) {
      analysis.weaknesses.push('Weak expertise signals');
      analysis.recommendations.push('Highlight author credentials, add in-depth guides, cite research');
    }
    
    // Authority analysis
    if (scores.authority >= 70) {
      analysis.strengths.push('Strong authority signals');
    } else if (scores.authority < 30) {
      analysis.weaknesses.push('Low authority presence');
      analysis.recommendations.push('Add media mentions, awards, industry partnerships');
    }
    
    // Trust analysis
    if (scores.trust >= 70) {
      analysis.strengths.push('Good trust indicators');
    } else if (scores.trust < 30) {
      analysis.weaknesses.push('Missing trust signals');
      analysis.recommendations.push('Add about us, contact info, privacy policy, testimonials');
    }
    
    // Schema recommendation
    if (this.schemaData.length === 0) {
      analysis.weaknesses.push('No structured data found');
      analysis.recommendations.push('Add Schema.org markup for Article, Author, Organization');
    }
    
    return analysis;
  }
  
  /**
   * Extract text content from HTML
   */
  _extractText(html) {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Reset state
   */
  _reset() {
    this.signals = {
      experience: [],
      expertise: [],
      authority: [],
      trust: []
    };
    this.schemaData = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get EEAT signal extractor instance
 * @returns {EEATSignalExtractor}
 */
function getEEATExtractor() {
  return new EEATSignalExtractor();
}

/**
 * Extract EEAT signals from multiple pages
 * @param {Array} pages - Array of page objects with html property
 * @param {string} domain - Domain being analyzed
 * @returns {Object} EEAT signal analysis
 */
function extractEEATSignals(pages, domain) {
  const extractor = getEEATExtractor();
  return extractor.extractFromPages(pages, domain);
}

/**
 * Test EEAT extractor
 */
function testEEATExtractor() {
  const samplePages = [
    {
      html: `<html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "Article",
            "author": {"@type": "Person", "name": "John Expert"},
            "publisher": {"@type": "Organization", "name": "TrustCasino"}
          }
          </script>
        </head>
        <body>
          <h1>I Tested 50 Online Casinos - Here's What I Found</h1>
          <p>With over 10 years of experience in the gambling industry, I personally tested each casino.</p>
          <p>As a certified gaming expert, my in-depth review covers all aspects.</p>
          <p>Featured in Forbes and Bloomberg, our team is trusted by over 1 million users.</p>
          <p>We are licensed by the MGA and UKGC. Check our privacy policy and contact page.</p>
          <p>Read our customer testimonials and verified reviews.</p>
        </body>
      </html>`,
      url: 'https://example.com/casino-review',
      success: true,
      type: 'blog_post'
    }
  ];
  
  const result = extractEEATSignals(samplePages, 'example.com');
  console.log('EEAT Result:', JSON.stringify(result, null, 2));
  
  return result;
}

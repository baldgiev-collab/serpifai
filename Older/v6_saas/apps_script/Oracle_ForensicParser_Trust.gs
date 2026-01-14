/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 3.2: TRUST & AUTHORITY ENGINE
 * Synthetic KD, E-E-A-T Signals, Link Forensics, Anchor Diversity
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This sub-module implements the TrustAuthorityEngine:
 *   - Synthetic KD Algorithm (Title Competition Density)
 *   - E-E-A-T Signal Detection (Author, Address, Certs, Privacy)
 *   - Link Forensic Mapper (Internal/External, Efficiency Ratio)
 *   - Anchor Text Diversity Analysis
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2A: TRUST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var TRUST_CONFIG = TRUST_CONFIG || {
  // Synthetic KD calculation weights
  SYNTHETIC_KD: {
    TITLE_DENSITY_WEIGHT: 0.35,
    H1_VARIANCE_WEIGHT: 0.25,
    URL_STRUCTURE_WEIGHT: 0.20,
    CONTENT_DEPTH_WEIGHT: 0.20,
    // KD scaling
    MIN_KD: 0,
    MAX_KD: 100
  },
  
  // E-E-A-T signal patterns
  EEAT: {
    AUTHOR_PATTERNS: [
      /(?:written|authored|by|author)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
      /class=["']?author["']?[^>]*>([^<]+)/gi,
      /itemprop=["']?author["']?[^>]*>([^<]+)/gi,
      /"author":\s*{\s*"name":\s*"([^"]+)"/gi,
      /rel=["']?author["']?[^>]*>([^<]+)/gi
    ],
    ADDRESS_PATTERNS: [
      /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)[,\s]+[\w\s]+,\s*[A-Z]{2}\s+\d{5}/gi,
      /(?:address|located at|headquarters)[:\s]+([^<\n]+)/gi,
      /itemprop=["']?address["']?[^>]*>([\s\S]*?)<\/[^>]+>/gi,
      /class=["']?(?:address|location)["']?[^>]*>([^<]+)/gi
    ],
    CERTIFICATION_PATTERNS: {
      GAMBLING: [
        /MGA[\/\-\s]?(?:license|licensed|cert)/gi,
        /Malta\s+Gaming\s+Authority/gi,
        /UKGC[\/\-\s]?(?:license|licensed)/gi,
        /UK\s+Gambling\s+Commission/gi,
        /Curacao\s+(?:Gaming|eGaming)/gi,
        /Gibraltar\s+(?:Gaming|Gambling)/gi,
        /Kahnawake\s+Gaming/gi,
        /Isle\s+of\s+Man\s+GSC/gi,
        /Alderney\s+Gambling/gi
      ],
      FINANCIAL: [
        /FCA\s+(?:registered|regulated|authorized)/gi,
        /SEC\s+(?:registered|regulated)/gi,
        /FINRA\s+(?:member|registered)/gi,
        /SIPC\s+(?:member|protected)/gi
      ],
      HEALTHCARE: [
        /HIPAA\s+(?:compliant|certified)/gi,
        /FDA\s+(?:approved|cleared)/gi,
        /CE\s+(?:marked|certified)/gi,
        /ISO\s+\d{4,5}/gi
      ],
      GENERAL: [
        /BBB\s+(?:accredited|rated|A\+)/gi,
        /TrustPilot/gi,
        /Trustpilot/gi,
        /Better\s+Business\s+Bureau/gi,
        /Norton\s+(?:Secured|Secured\s+Seal)/gi,
        /McAfee\s+(?:Secure|SECURE)/gi,
        /SSL\s+(?:secured?|certificate|encrypted)/gi,
        /256[- ]?bit\s+(?:SSL|encryption)/gi,
        /GDPR\s+(?:compliant|compliance)/gi,
        /SOC\s*2\s*(?:Type\s*(?:1|2|I|II))?/gi
      ]
    },
    PRIVACY_PATTERNS: [
      /privacy\s+policy/gi,
      /terms\s+(?:of\s+)?(?:service|use)/gi,
      /cookie\s+policy/gi,
      /data\s+protection/gi,
      /GDPR/gi,
      /CCPA/gi,
      /do\s+not\s+sell/gi
    ]
  },
  
  // Link analysis thresholds
  LINKS: {
    HEALTHY_INTERNAL_RATIO: 0.7,
    MIN_INTERNAL_LINKS: 3,
    MAX_EXTERNAL_DENSITY: 0.1,
    DOFOLLOW_HEALTHY_RATIO: 0.6
  },
  
  // Anchor text categories
  ANCHOR_CATEGORIES: {
    EXACT_MATCH: 'exact_match',
    PARTIAL_MATCH: 'partial_match',
    BRANDED: 'branded',
    NAKED_URL: 'naked_url',
    GENERIC: 'generic',
    IMAGE: 'image'
  },
  
  GENERIC_ANCHORS: new Set([
    'click here', 'read more', 'learn more', 'here', 'this', 'link',
    'more', 'more info', 'continue', 'see more', 'view', 'details',
    'this page', 'this article', 'check it out', 'go', 'visit'
  ])
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2B: SYNTHETIC KD CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * SyntheticKDCalculator - Derives keyword difficulty from on-page signals
 */
class SyntheticKDCalculator {
  
  /**
   * Calculate Synthetic Keyword Difficulty
   * @param {Object} pageData - Page analysis data
   * @returns {Object} KD calculation result
   */
  static calculate(pageData) {
    const {
      title = '',
      h1 = '',
      h2List = [],
      url = '',
      wordCount = 0,
      targetKeyword = ''
    } = pageData;
    
    // Factor 1: Title Competition Density (All-in-Title)
    const titleDensity = SyntheticKDCalculator._calculateTitleDensity(title, targetKeyword);
    
    // Factor 2: H1/H2 Variance
    const headingVariance = SyntheticKDCalculator._calculateHeadingVariance(h1, h2List, targetKeyword);
    
    // Factor 3: URL Structure Strength
    const urlStrength = SyntheticKDCalculator._calculateUrlStrength(url, targetKeyword);
    
    // Factor 4: Content Depth
    const contentDepth = SyntheticKDCalculator._calculateContentDepth(wordCount);
    
    // Weighted combination
    const weightedKD = (
      titleDensity * TRUST_CONFIG.SYNTHETIC_KD.TITLE_DENSITY_WEIGHT +
      headingVariance * TRUST_CONFIG.SYNTHETIC_KD.H1_VARIANCE_WEIGHT +
      urlStrength * TRUST_CONFIG.SYNTHETIC_KD.URL_STRUCTURE_WEIGHT +
      contentDepth * TRUST_CONFIG.SYNTHETIC_KD.CONTENT_DEPTH_WEIGHT
    );
    
    // Normalize to 0-100 scale
    const syntheticKD = Math.max(
      TRUST_CONFIG.SYNTHETIC_KD.MIN_KD,
      Math.min(TRUST_CONFIG.SYNTHETIC_KD.MAX_KD, Math.round(weightedKD))
    );
    
    return {
      syntheticKD: syntheticKD,
      difficulty: SyntheticKDCalculator._getDifficultyLabel(syntheticKD),
      factors: {
        titleDensity: Math.round(titleDensity),
        headingVariance: Math.round(headingVariance),
        urlStrength: Math.round(urlStrength),
        contentDepth: Math.round(contentDepth)
      },
      recommendation: SyntheticKDCalculator._getRecommendation(syntheticKD)
    };
  }
  
  /**
   * Calculate title competition density
   * @param {string} title - Page title
   * @param {string} keyword - Target keyword
   * @returns {number} Density score (0-100)
   */
  static _calculateTitleDensity(title, keyword) {
    if (!title) return 50;
    
    const titleLower = title.toLowerCase();
    const keywordLower = (keyword || '').toLowerCase();
    
    let score = 30; // Base score
    
    // Title length optimization (50-60 chars ideal)
    const titleLength = title.length;
    if (titleLength >= 45 && titleLength <= 65) {
      score += 20;
    } else if (titleLength >= 30 && titleLength <= 80) {
      score += 10;
    }
    
    // Keyword presence
    if (keywordLower && titleLower.includes(keywordLower)) {
      score += 25;
      
      // Keyword at beginning bonus
      if (titleLower.startsWith(keywordLower) || titleLower.indexOf(keywordLower) < 10) {
        score += 15;
      }
    }
    
    // Power words presence
    const powerWords = ['best', 'top', 'guide', 'review', '2024', '2025', 'ultimate', 'complete'];
    for (const word of powerWords) {
      if (titleLower.includes(word)) {
        score += 5;
        break;
      }
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate heading variance
   * @param {string} h1 - H1 heading
   * @param {Array} h2List - List of H2 headings
   * @param {string} keyword - Target keyword
   * @returns {number} Variance score (0-100)
   */
  static _calculateHeadingVariance(h1, h2List, keyword) {
    let score = 20; // Base score
    
    const keywordLower = (keyword || '').toLowerCase();
    const h1Lower = (h1 || '').toLowerCase();
    
    // H1 analysis
    if (h1) {
      score += 15;
      
      if (keywordLower && h1Lower.includes(keywordLower)) {
        score += 20;
      }
      
      // H1 length (30-70 chars ideal)
      if (h1.length >= 25 && h1.length <= 75) {
        score += 10;
      }
    }
    
    // H2 diversity analysis
    const h2Count = h2List.length;
    if (h2Count >= 3) {
      score += 15;
      
      // Check for keyword variations in H2s
      let keywordH2Count = 0;
      for (const h2 of h2List) {
        if (keywordLower && h2.toLowerCase().includes(keywordLower)) {
          keywordH2Count++;
        }
      }
      
      // Optimal: keyword in 1-2 H2s (not over-optimized)
      if (keywordH2Count >= 1 && keywordH2Count <= 2) {
        score += 15;
      } else if (keywordH2Count > 3) {
        score -= 10; // Over-optimization penalty
      }
    }
    
    // Check for question-based H2s (good for featured snippets)
    const questionH2s = h2List.filter(h2 => 
      /^(how|what|why|when|where|who|which|can|is|are|do|does)/i.test(h2)
    );
    if (questionH2s.length > 0) {
      score += 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Calculate URL structure strength
   * @param {string} url - Page URL
   * @param {string} keyword - Target keyword
   * @returns {number} URL strength score (0-100)
   */
  static _calculateUrlStrength(url, keyword) {
    if (!url) return 30;
    
    let score = 20; // Base score
    
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.toLowerCase();
      const keywordLower = (keyword || '').toLowerCase().replace(/\s+/g, '-');
      
      // URL depth (fewer levels = stronger)
      const depth = path.split('/').filter(p => p.length > 0).length;
      if (depth === 1) {
        score += 25;
      } else if (depth === 2) {
        score += 15;
      } else if (depth === 3) {
        score += 5;
      }
      
      // Keyword in URL
      if (keywordLower && path.includes(keywordLower)) {
        score += 25;
      } else if (keywordLower) {
        // Check for partial keyword match
        const keywordParts = keywordLower.split('-');
        const matchingParts = keywordParts.filter(part => path.includes(part));
        score += Math.min(15, matchingParts.length * 5);
      }
      
      // URL length (shorter = better)
      if (path.length < 30) {
        score += 15;
      } else if (path.length < 50) {
        score += 8;
      }
      
      // No parameters bonus
      if (!urlObj.search) {
        score += 5;
      }
      
      // HTTPS bonus
      if (urlObj.protocol === 'https:') {
        score += 5;
      }
      
    } catch (e) {
      return 30;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate content depth score
   * @param {number} wordCount - Word count
   * @returns {number} Content depth score (0-100)
   */
  static _calculateContentDepth(wordCount) {
    if (!wordCount || wordCount < 100) return 10;
    
    // Word count scoring tiers
    if (wordCount >= 3000) return 100;
    if (wordCount >= 2500) return 90;
    if (wordCount >= 2000) return 80;
    if (wordCount >= 1500) return 70;
    if (wordCount >= 1000) return 55;
    if (wordCount >= 700) return 40;
    if (wordCount >= 500) return 30;
    if (wordCount >= 300) return 20;
    
    return 15;
  }
  
  /**
   * Get difficulty label
   * @param {number} kd - Synthetic KD score
   * @returns {string} Difficulty label
   */
  static _getDifficultyLabel(kd) {
    if (kd >= 80) return 'Very Hard';
    if (kd >= 60) return 'Hard';
    if (kd >= 40) return 'Medium';
    if (kd >= 20) return 'Easy';
    return 'Very Easy';
  }
  
  /**
   * Get recommendation based on KD
   * @param {number} kd - Synthetic KD score
   * @returns {string} Recommendation
   */
  static _getRecommendation(kd) {
    if (kd >= 80) {
      return 'Very competitive. Requires exceptional content and strong backlink profile.';
    }
    if (kd >= 60) {
      return 'Competitive keyword. Focus on comprehensive content and authority building.';
    }
    if (kd >= 40) {
      return 'Moderate competition. Strong content with E-E-A-T signals can rank.';
    }
    if (kd >= 20) {
      return 'Good opportunity. Quality content with proper optimization can rank quickly.';
    }
    return 'Excellent opportunity! Low competition - quick wins possible.';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2C: E-E-A-T SIGNAL AUDITOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * EEATAuditor - Detects and scores E-E-A-T signals
 */
class EEATAuditor {
  
  /**
   * Perform comprehensive E-E-A-T audit
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @returns {Object} E-E-A-T audit result
   */
  static audit(html, url = '') {
    console.log('🔍 E-E-A-T Auditor: Scanning for trust signals...');
    
    if (!html) {
      return EEATAuditor._emptyResult();
    }
    
    const results = {
      experience: EEATAuditor._auditExperience(html),
      expertise: EEATAuditor._auditExpertise(html),
      authoritativeness: EEATAuditor._auditAuthoritativeness(html, url),
      trustworthiness: EEATAuditor._auditTrustworthiness(html, url)
    };
    
    // Calculate overall E-E-A-T score
    const overall = EEATAuditor._calculateOverallScore(results);
    
    return {
      ...results,
      overall: overall,
      grade: EEATAuditor._getGrade(overall.score),
      recommendations: EEATAuditor._getRecommendations(results)
    };
  }
  
  /**
   * Audit Experience signals
   * @param {string} html - HTML content
   * @returns {Object} Experience audit
   */
  static _auditExperience(html) {
    const signals = [];
    let score = 0;
    
    // Look for first-person narrative indicators
    const firstPersonPatterns = [
      /\b(I|we)\s+(tested|tried|used|reviewed|experienced|found)/gi,
      /\b(my|our)\s+(experience|review|test|hands-on)/gi,
      /\bfirst-?hand\b/gi,
      /\bpersonally\b/gi
    ];
    
    for (const pattern of firstPersonPatterns) {
      if (pattern.test(html)) {
        signals.push('First-person experience narrative');
        score += 15;
        break;
      }
    }
    
    // Look for date/timeline indicators
    if (/\b(tested|reviewed|updated)\s+(?:on|in)\s+\w+\s+\d{4}/gi.test(html)) {
      signals.push('Dated experience/testing');
      score += 10;
    }
    
    // Look for screenshots/images of actual usage
    if (/(?:screenshot|photo|image)[^>]*(?:of|showing|from)\s+(?:my|our|the)/gi.test(html)) {
      signals.push('Visual evidence of experience');
      score += 10;
    }
    
    // Look for specific details that indicate real usage
    if (/\b(pros?\s+and\s+cons?|advantages?\s+and\s+disadvantages?)/gi.test(html)) {
      signals.push('Pros/cons analysis');
      score += 10;
    }
    
    return {
      score: Math.min(100, score),
      signals: signals,
      found: signals.length > 0
    };
  }
  
  /**
   * Audit Expertise signals
   * @param {string} html - HTML content
   * @returns {Object} Expertise audit
   */
  static _auditExpertise(html) {
    const signals = [];
    let score = 0;
    const authors = [];
    
    // Extract author names
    for (const pattern of TRUST_CONFIG.EEAT.AUTHOR_PATTERNS) {
      const matches = html.match(pattern);
      if (matches) {
        for (const match of matches) {
          const authorName = match.replace(/<[^>]+>/g, '').trim();
          if (authorName && authorName.length > 3 && authorName.length < 100) {
            authors.push(authorName);
          }
        }
      }
    }
    
    if (authors.length > 0) {
      signals.push(`Author(s) identified: ${[...new Set(authors)].slice(0, 3).join(', ')}`);
      score += 25;
    }
    
    // Look for credentials
    const credentialPatterns = [
      /\b(PhD|Ph\.D\.|MD|M\.D\.|JD|J\.D\.|MBA|CPA|CFP|CFA)\b/g,
      /\b(certified|licensed|registered)\s+(professional|expert|advisor|consultant)/gi,
      /\b\d+\+?\s+years?\s+(?:of\s+)?experience\b/gi
    ];
    
    for (const pattern of credentialPatterns) {
      if (pattern.test(html)) {
        signals.push('Professional credentials mentioned');
        score += 20;
        break;
      }
    }
    
    // Look for about/bio section
    if (/<(?:div|section)[^>]*(?:class|id)=["'][^"']*(?:author|bio|about)[^"']*["'][^>]*>/gi.test(html)) {
      signals.push('Author bio section present');
      score += 15;
    }
    
    // Look for expertise indicators
    if (/\b(expert|specialist|professional)\s+(?:in|at|with)/gi.test(html)) {
      signals.push('Expertise claims');
      score += 10;
    }
    
    return {
      score: Math.min(100, score),
      signals: signals,
      authors: [...new Set(authors)].slice(0, 5),
      found: signals.length > 0
    };
  }
  
  /**
   * Audit Authoritativeness signals
   * @param {string} html - HTML content
   * @param {string} url - Page URL
   * @returns {Object} Authoritativeness audit
   */
  static _auditAuthoritativeness(html, url) {
    const signals = [];
    let score = 0;
    const certifications = [];
    
    // Check for industry certifications
    for (const [industry, patterns] of Object.entries(TRUST_CONFIG.EEAT.CERTIFICATION_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches) {
          certifications.push({
            industry: industry,
            certification: matches[0]
          });
          signals.push(`${industry} certification: ${matches[0]}`);
          score += 20;
          break;
        }
      }
    }
    
    // Look for awards/recognition
    if (/\b(award|winner|best|top\s+\d+|ranked\s+#?\d+)/gi.test(html)) {
      signals.push('Awards/recognition mentioned');
      score += 10;
    }
    
    // Look for media mentions
    if (/\b(featured\s+(?:in|on)|as\s+seen\s+(?:in|on))\b/gi.test(html)) {
      signals.push('Media mentions');
      score += 10;
    }
    
    // Check for established brand indicators
    if (/\b(since|established|founded)\s+\d{4}\b/gi.test(html)) {
      signals.push('Established business history');
      score += 15;
    }
    
    // Check for physical address
    for (const pattern of TRUST_CONFIG.EEAT.ADDRESS_PATTERNS) {
      if (pattern.test(html)) {
        signals.push('Physical address present');
        score += 15;
        break;
      }
    }
    
    return {
      score: Math.min(100, score),
      signals: signals,
      certifications: certifications,
      found: signals.length > 0
    };
  }
  
  /**
   * Audit Trustworthiness signals
   * @param {string} html - HTML content
   * @param {string} url - Page URL
   * @returns {Object} Trustworthiness audit
   */
  static _auditTrustworthiness(html, url) {
    const signals = [];
    let score = 0;
    
    // Check for privacy policy
    if (TRUST_CONFIG.EEAT.PRIVACY_PATTERNS.some(p => p.test(html))) {
      signals.push('Privacy policy present');
      score += 20;
    }
    
    // Check for SSL (from URL)
    if (url && url.startsWith('https://')) {
      signals.push('HTTPS/SSL secured');
      score += 15;
    }
    
    // Check for security badges
    if (/(?:SSL|secure|encrypted|Norton|McAfee|TrustGuard)/gi.test(html)) {
      signals.push('Security indicators present');
      score += 10;
    }
    
    // Check for contact information
    if (/(?:contact\s+us|get\s+in\s+touch|email|phone|support)/gi.test(html)) {
      signals.push('Contact information available');
      score += 10;
    }
    
    // Check for editorial standards
    if (/(?:editorial|fact[- ]check|reviewed\s+by|updated|last\s+modified)/gi.test(html)) {
      signals.push('Editorial/review process');
      score += 15;
    }
    
    // Check for transparent disclosures
    if (/(?:disclosure|disclaimer|affiliate|sponsored|advertiser)/gi.test(html)) {
      signals.push('Transparency disclosures');
      score += 15;
    }
    
    // Check for sources/citations
    if (/(?:source:|according\s+to|study\s+(?:by|from)|research\s+(?:by|from))/gi.test(html)) {
      signals.push('Source citations');
      score += 15;
    }
    
    return {
      score: Math.min(100, score),
      signals: signals,
      found: signals.length > 0
    };
  }
  
  /**
   * Calculate overall E-E-A-T score
   * @param {Object} results - Component results
   * @returns {Object} Overall score
   */
  static _calculateOverallScore(results) {
    const weights = {
      experience: 0.20,
      expertise: 0.25,
      authoritativeness: 0.30,
      trustworthiness: 0.25
    };
    
    const weightedScore = (
      results.experience.score * weights.experience +
      results.expertise.score * weights.expertise +
      results.authoritativeness.score * weights.authoritativeness +
      results.trustworthiness.score * weights.trustworthiness
    );
    
    return {
      score: Math.round(weightedScore),
      breakdown: {
        experience: results.experience.score,
        expertise: results.expertise.score,
        authoritativeness: results.authoritativeness.score,
        trustworthiness: results.trustworthiness.score
      }
    };
  }
  
  /**
   * Get letter grade
   * @param {number} score - Overall score
   * @returns {string} Letter grade
   */
  static _getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
  
  /**
   * Get recommendations
   * @param {Object} results - Component results
   * @returns {Array} Recommendations
   */
  static _getRecommendations(results) {
    const recommendations = [];
    
    if (results.experience.score < 50) {
      recommendations.push('Add first-person experience narratives and hands-on testing evidence');
    }
    
    if (results.expertise.score < 50) {
      recommendations.push('Add author bios with credentials and expertise indicators');
    }
    
    if (results.authoritativeness.score < 50) {
      recommendations.push('Display industry certifications, awards, and physical business address');
    }
    
    if (results.trustworthiness.score < 50) {
      recommendations.push('Add privacy policy, contact info, and source citations');
    }
    
    return recommendations;
  }
  
  /**
   * Empty result structure
   */
  static _emptyResult() {
    return {
      experience: { score: 0, signals: [], found: false },
      expertise: { score: 0, signals: [], authors: [], found: false },
      authoritativeness: { score: 0, signals: [], certifications: [], found: false },
      trustworthiness: { score: 0, signals: [], found: false },
      overall: { score: 0, breakdown: {} },
      grade: 'F',
      recommendations: ['No content to analyze']
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2D: LINK FORENSIC MAPPER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * LinkForensicMapper - Analyzes internal/external links
 */
class LinkForensicMapper {
  
  /**
   * Perform link forensic analysis
   * @param {string} html - HTML content
   * @param {string} pageUrl - Current page URL
   * @returns {Object} Link analysis result
   */
  static analyze(html, pageUrl = '') {
    console.log('🔗 Link Mapper: Analyzing link structure...');
    
    if (!html) {
      return LinkForensicMapper._emptyResult();
    }
    
    let pageDomain = '';
    try {
      pageDomain = new URL(pageUrl).hostname.replace('www.', '');
    } catch (e) {
      pageDomain = '';
    }
    
    // Extract all anchor tags
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const links = {
      internal: [],
      external: [],
      nofollow: [],
      dofollow: []
    };
    
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1].trim();
      const anchorHtml = match[2];
      const fullTag = match[0];
      
      // Skip empty, javascript, mailto, tel links
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }
      
      const linkData = {
        href: href,
        anchor: LinkForensicMapper._extractAnchorText(anchorHtml),
        isNofollow: /rel=["'][^"']*nofollow[^"']*["']/i.test(fullTag),
        isSponsored: /rel=["'][^"']*sponsored[^"']*["']/i.test(fullTag),
        isUGC: /rel=["'][^"']*ugc[^"']*["']/i.test(fullTag),
        isImage: /<img/i.test(anchorHtml),
        isNewWindow: /target=["']_blank["']/i.test(fullTag)
      };
      
      // Classify internal vs external
      const isInternal = LinkForensicMapper._isInternalLink(href, pageDomain);
      
      if (isInternal) {
        links.internal.push(linkData);
      } else {
        links.external.push(linkData);
      }
      
      if (linkData.isNofollow) {
        links.nofollow.push(linkData);
      } else {
        links.dofollow.push(linkData);
      }
    }
    
    // Calculate metrics
    const totalLinks = links.internal.length + links.external.length;
    const internalRatio = totalLinks > 0 ? links.internal.length / totalLinks : 0;
    const dofollowRatio = totalLinks > 0 ? links.dofollow.length / totalLinks : 0;
    
    // Link efficiency ratio (simplified - in reality would use traffic/authority data)
    const linkEfficiencyRatio = LinkForensicMapper._calculateEfficiencyRatio(links);
    
    // Health assessment
    const health = LinkForensicMapper._assessHealth(links, internalRatio, dofollowRatio);
    
    return {
      counts: {
        total: totalLinks,
        internal: links.internal.length,
        external: links.external.length,
        nofollow: links.nofollow.length,
        dofollow: links.dofollow.length
      },
      ratios: {
        internalRatio: Math.round(internalRatio * 100),
        externalRatio: Math.round((1 - internalRatio) * 100),
        dofollowRatio: Math.round(dofollowRatio * 100),
        nofollowRatio: Math.round((1 - dofollowRatio) * 100)
      },
      linkEfficiencyRatio: linkEfficiencyRatio,
      health: health,
      links: links
    };
  }
  
  /**
   * Extract clean anchor text
   * @param {string} anchorHtml - Anchor inner HTML
   * @returns {string} Clean anchor text
   */
  static _extractAnchorText(anchorHtml) {
    // Remove HTML tags
    let text = anchorHtml.replace(/<[^>]+>/g, '');
    // Decode entities
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }
  
  /**
   * Check if link is internal
   * @param {string} href - Link href
   * @param {string} pageDomain - Current page domain
   * @returns {boolean} Is internal
   */
  static _isInternalLink(href, pageDomain) {
    if (href.startsWith('/') && !href.startsWith('//')) {
      return true; // Relative path
    }
    
    if (!pageDomain) return false;
    
    try {
      const linkDomain = new URL(href).hostname.replace('www.', '');
      return linkDomain === pageDomain;
    } catch (e) {
      return href.startsWith('/');
    }
  }
  
  /**
   * Calculate link efficiency ratio
   * @param {Object} links - Extracted links
   * @returns {number} Efficiency ratio
   */
  static _calculateEfficiencyRatio(links) {
    // Simplified efficiency: internal links with meaningful anchors / total links
    const meaningfulInternals = links.internal.filter(l => 
      l.anchor && l.anchor.length > 2 && !l.isImage
    ).length;
    
    const total = links.internal.length + links.external.length;
    if (total === 0) return 0;
    
    return Math.round((meaningfulInternals / total) * 100) / 100;
  }
  
  /**
   * Assess link health
   * @param {Object} links - Extracted links
   * @param {number} internalRatio - Internal link ratio
   * @param {number} dofollowRatio - Dofollow ratio
   * @returns {Object} Health assessment
   */
  static _assessHealth(links, internalRatio, dofollowRatio) {
    const issues = [];
    let score = 100;
    
    // Check internal link count
    if (links.internal.length < TRUST_CONFIG.LINKS.MIN_INTERNAL_LINKS) {
      issues.push('Too few internal links');
      score -= 20;
    }
    
    // Check internal ratio
    if (internalRatio < TRUST_CONFIG.LINKS.HEALTHY_INTERNAL_RATIO - 0.3) {
      issues.push('Low internal link ratio');
      score -= 15;
    }
    
    // Check external density
    const externalDensity = links.external.length / Math.max(1, links.internal.length + links.external.length);
    if (externalDensity > TRUST_CONFIG.LINKS.MAX_EXTERNAL_DENSITY + 0.2) {
      issues.push('High external link density');
      score -= 10;
    }
    
    // Check dofollow ratio
    if (dofollowRatio < TRUST_CONFIG.LINKS.DOFOLLOW_HEALTHY_RATIO - 0.2) {
      issues.push('High nofollow ratio on internal links');
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 50 ? 'needs_improvement' : 'unhealthy',
      issues: issues
    };
  }
  
  /**
   * Empty result structure
   */
  static _emptyResult() {
    return {
      counts: { total: 0, internal: 0, external: 0, nofollow: 0, dofollow: 0 },
      ratios: { internalRatio: 0, externalRatio: 0, dofollowRatio: 0, nofollowRatio: 0 },
      linkEfficiencyRatio: 0,
      health: { score: 0, status: 'unknown', issues: ['No content to analyze'] },
      links: { internal: [], external: [], nofollow: [], dofollow: [] }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2E: ANCHOR TEXT DIVERSITY ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * AnchorDiversityAnalyzer - Analyzes anchor text patterns
 */
class AnchorDiversityAnalyzer {
  
  /**
   * Analyze anchor text diversity
   * @param {Array} links - Array of link objects with anchor text
   * @param {string} brandName - Brand name for branded anchor detection
   * @param {string} targetKeyword - Target keyword for exact match detection
   * @returns {Object} Anchor diversity analysis
   */
  static analyze(links, brandName = '', targetKeyword = '') {
    if (!links || links.length === 0) {
      return AnchorDiversityAnalyzer._emptyResult();
    }
    
    const categories = {
      exact_match: [],
      partial_match: [],
      branded: [],
      naked_url: [],
      generic: [],
      image: []
    };
    
    const brandLower = brandName.toLowerCase();
    const keywordLower = targetKeyword.toLowerCase();
    
    for (const link of links) {
      const anchor = (link.anchor || '').toLowerCase().trim();
      
      if (link.isImage || !anchor) {
        categories.image.push(link);
        continue;
      }
      
      // Classify anchor
      if (AnchorDiversityAnalyzer._isNakedUrl(anchor)) {
        categories.naked_url.push(link);
      } else if (TRUST_CONFIG.GENERIC_ANCHORS.has(anchor)) {
        categories.generic.push(link);
      } else if (brandLower && anchor.includes(brandLower)) {
        categories.branded.push(link);
      } else if (keywordLower && anchor === keywordLower) {
        categories.exact_match.push(link);
      } else if (keywordLower && anchor.includes(keywordLower)) {
        categories.partial_match.push(link);
      } else {
        // Categorize as generic if short, otherwise as partial/natural
        if (anchor.length < 5) {
          categories.generic.push(link);
        } else {
          categories.partial_match.push(link);
        }
      }
    }
    
    // Calculate distribution
    const total = links.length;
    const distribution = {};
    for (const [category, catLinks] of Object.entries(categories)) {
      distribution[category] = {
        count: catLinks.length,
        percentage: Math.round((catLinks.length / total) * 100)
      };
    }
    
    // Calculate diversity score
    const diversityScore = AnchorDiversityAnalyzer._calculateDiversityScore(distribution, total);
    
    // Detect over-optimization
    const overOptimization = AnchorDiversityAnalyzer._detectOverOptimization(distribution);
    
    return {
      categories: categories,
      distribution: distribution,
      diversityScore: diversityScore,
      overOptimization: overOptimization,
      totalAnchors: total,
      recommendations: AnchorDiversityAnalyzer._getRecommendations(distribution, overOptimization)
    };
  }
  
  /**
   * Check if anchor is a naked URL
   * @param {string} anchor - Anchor text
   * @returns {boolean} Is naked URL
   */
  static _isNakedUrl(anchor) {
    return /^(?:https?:\/\/)?[\w.-]+\.[a-z]{2,}(?:\/[\w.-]*)*\/?$/i.test(anchor);
  }
  
  /**
   * Calculate diversity score
   * @param {Object} distribution - Anchor distribution
   * @param {number} total - Total anchors
   * @returns {number} Diversity score (0-100)
   */
  static _calculateDiversityScore(distribution, total) {
    if (total === 0) return 0;
    
    // Ideal distribution weights
    const idealWeights = {
      branded: 0.35,
      partial_match: 0.25,
      exact_match: 0.05,
      generic: 0.15,
      naked_url: 0.10,
      image: 0.10
    };
    
    let score = 100;
    
    // Penalize deviation from ideal
    for (const [category, ideal] of Object.entries(idealWeights)) {
      const actual = (distribution[category]?.percentage || 0) / 100;
      const deviation = Math.abs(actual - ideal);
      
      // Heavy penalty for exact match over-optimization
      if (category === 'exact_match' && actual > 0.1) {
        score -= (actual - 0.1) * 200;
      } else {
        score -= deviation * 30;
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Detect over-optimization
   * @param {Object} distribution - Anchor distribution
   * @returns {Object} Over-optimization analysis
   */
  static _detectOverOptimization(distribution) {
    const warnings = [];
    let isOverOptimized = false;
    
    // Exact match > 10% is risky
    if (distribution.exact_match.percentage > 10) {
      warnings.push(`Exact match anchors too high (${distribution.exact_match.percentage}%)`);
      isOverOptimized = true;
    }
    
    // Partial match > 40% combined with exact match > 5%
    if (distribution.partial_match.percentage > 40 && distribution.exact_match.percentage > 5) {
      warnings.push('Keyword-heavy anchor profile detected');
      isOverOptimized = true;
    }
    
    // Generic/naked too low
    const naturalRatio = distribution.generic.percentage + distribution.naked_url.percentage;
    if (naturalRatio < 10) {
      warnings.push('Low natural anchor diversity');
    }
    
    return {
      isOverOptimized: isOverOptimized,
      riskLevel: isOverOptimized ? 'high' : warnings.length > 0 ? 'medium' : 'low',
      warnings: warnings
    };
  }
  
  /**
   * Get recommendations
   * @param {Object} distribution - Anchor distribution
   * @param {Object} overOptimization - Over-optimization analysis
   * @returns {Array} Recommendations
   */
  static _getRecommendations(distribution, overOptimization) {
    const recommendations = [];
    
    if (overOptimization.isOverOptimized) {
      recommendations.push('Reduce exact match anchors - diversify with branded and natural anchors');
    }
    
    if (distribution.branded.percentage < 20) {
      recommendations.push('Increase branded anchor usage for natural profile');
    }
    
    if (distribution.generic.percentage < 10) {
      recommendations.push('Add more natural "click here" and "learn more" type anchors');
    }
    
    return recommendations;
  }
  
  /**
   * Empty result structure
   */
  static _emptyResult() {
    return {
      categories: {},
      distribution: {},
      diversityScore: 0,
      overOptimization: { isOverOptimized: false, riskLevel: 'unknown', warnings: [] },
      totalAnchors: 0,
      recommendations: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2F: TRUST AUTHORITY ENGINE (MAIN CLASS)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * TrustAuthorityEngine - Main orchestrator for trust analysis
 */
class TrustAuthorityEngine {
  
  /**
   * Perform complete trust & authority analysis
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @param {Object} options - Analysis options
   * @returns {Object} Complete trust analysis
   */
  analyze(html, url = '', options = {}) {
    console.log(`🛡️ Trust Engine: Analyzing authority signals...`);
    const startTime = Date.now();
    
    if (!html) {
      return this._emptyResult('No HTML content provided');
    }
    
    try {
      const {
        targetKeyword = '',
        brandName = ''
      } = options;
      
      // Extract basic page elements for KD calculation
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
      
      const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
      const h2List = [];
      let h2Match;
      while ((h2Match = h2Regex.exec(html)) !== null) {
        h2List.push(h2Match[1].replace(/<[^>]+>/g, '').trim());
      }
      
      // Word count
      const textOnly = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ');
      const wordCount = textOnly.trim().split(/\s+/).length;
      
      // 1. Synthetic KD
      const syntheticKD = SyntheticKDCalculator.calculate({
        title,
        h1,
        h2List,
        url,
        wordCount,
        targetKeyword
      });
      
      // 2. E-E-A-T Audit
      const eeatAudit = EEATAuditor.audit(html, url);
      
      // 3. Link Forensics
      const linkForensics = LinkForensicMapper.analyze(html, url);
      
      // 4. Anchor Diversity (on internal links)
      const anchorDiversity = AnchorDiversityAnalyzer.analyze(
        linkForensics.links.internal,
        brandName,
        targetKeyword
      );
      
      // Calculate overall trust score
      const overallTrust = this._calculateOverallTrust(syntheticKD, eeatAudit, linkForensics, anchorDiversity);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Trust Engine: Analysis complete (Trust Score: ${overallTrust.score}) in ${duration}ms`);
      
      return {
        success: true,
        url: url,
        syntheticKD: syntheticKD,
        eeat: eeatAudit,
        linkForensics: {
          ...linkForensics,
          links: undefined // Remove raw links for cleaner output
        },
        anchorDiversity: anchorDiversity,
        overallTrust: overallTrust,
        processingTime: duration
      };
      
    } catch (e) {
      console.error(`❌ Trust Engine: Analysis failed: ${e.message}`);
      return this._emptyResult(e.message);
    }
  }
  
  /**
   * Calculate overall trust score
   * @param {Object} syntheticKD - KD analysis
   * @param {Object} eeat - E-E-A-T audit
   * @param {Object} linkForensics - Link analysis
   * @param {Object} anchorDiversity - Anchor analysis
   * @returns {Object} Overall trust
   */
  _calculateOverallTrust(syntheticKD, eeat, linkForensics, anchorDiversity) {
    const weights = {
      eeat: 0.40,
      links: 0.25,
      anchors: 0.20,
      kd: 0.15
    };
    
    // Invert KD for trust (lower KD = easier = higher potential)
    const kdTrustComponent = 100 - syntheticKD.syntheticKD;
    
    const score = (
      eeat.overall.score * weights.eeat +
      linkForensics.health.score * weights.links +
      anchorDiversity.diversityScore * weights.anchors +
      kdTrustComponent * weights.kd
    );
    
    return {
      score: Math.round(score),
      grade: this._getTrustGrade(score),
      components: {
        eeat: eeat.overall.score,
        linkHealth: linkForensics.health.score,
        anchorDiversity: anchorDiversity.diversityScore,
        kdOpportunity: kdTrustComponent
      }
    };
  }
  
  /**
   * Get trust grade
   * @param {number} score - Trust score
   * @returns {string} Trust grade
   */
  _getTrustGrade(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }
  
  /**
   * Empty result structure
   * @param {string} error - Error message
   */
  _emptyResult(error) {
    return {
      success: false,
      error: error,
      syntheticKD: { syntheticKD: 0, difficulty: 'Unknown' },
      eeat: EEATAuditor._emptyResult(),
      linkForensics: LinkForensicMapper._emptyResult(),
      anchorDiversity: AnchorDiversityAnalyzer._emptyResult(),
      overallTrust: { score: 0, grade: 'Unknown' }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.2G: GLOBAL TRUST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get trust engine instance
 * @returns {TrustAuthorityEngine}
 */
function getTrustEngine() {
  return new TrustAuthorityEngine();
}

/**
 * Analyze page trust & authority
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {Object} options - Options (targetKeyword, brandName)
 * @returns {Object} Trust analysis
 */
function analyzePageTrust(html, url, options) {
  const engine = getTrustEngine();
  return engine.analyze(html, url, options);
}

/**
 * Calculate synthetic KD for a page
 * @param {Object} pageData - Page data (title, h1, url, wordCount, targetKeyword)
 * @returns {Object} Synthetic KD result
 */
function calculateSyntheticKD(pageData) {
  return SyntheticKDCalculator.calculate(pageData);
}

/**
 * Audit E-E-A-T signals
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} E-E-A-T audit result
 */
function auditEEAT(html, url) {
  return EEATAuditor.audit(html, url);
}

/**
 * Analyze link structure
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} Link forensics result
 */
function analyzeLinkForensics(html, url) {
  return LinkForensicMapper.analyze(html, url);
}

/**
 * Analyze anchor text diversity
 * @param {Array} links - Links with anchor text
 * @param {string} brandName - Brand name
 * @param {string} targetKeyword - Target keyword
 * @returns {Object} Anchor diversity result
 */
function analyzeAnchorDiversity(links, brandName, targetKeyword) {
  return AnchorDiversityAnalyzer.analyze(links, brandName, targetKeyword);
}

/**
 * Test trust engine with sample content
 */
function testTrustEngine() {
  const sampleHtml = `
    <html>
    <head><title>Best Online Casinos 2024 - Expert Reviews by John Smith</title></head>
    <body>
      <h1>Best Online Casinos for Real Money Gaming</h1>
      <div class="author-bio">
        <p>Written by <span itemprop="author">John Smith</span>, 15+ years gambling industry experience</p>
      </div>
      <p>I've personally tested over 100 online casinos...</p>
      <h2>How We Review Casinos</h2>
      <p>Our expert team follows strict editorial guidelines.</p>
      <p>Look for MGA licensed casinos for safety.</p>
      <a href="/about-us">About Our Team</a>
      <a href="https://external.com" rel="nofollow">External Source</a>
      <footer>
        <p>123 Casino Street, Las Vegas, NV 89101</p>
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </body>
    </html>
  `;
  
  const result = analyzePageTrust(
    sampleHtml, 
    'https://example.com/best-casinos',
    { targetKeyword: 'best online casinos', brandName: 'example' }
  );
  console.log('Trust Analysis Result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - ORACLE_EEATFORENSICS.GS
 * Enhanced E-E-A-T Forensic Analysis with Off-Page Intelligence
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE:
 * - Deep EEAT signal extraction (Experience, Expertise, Authoritativeness, Trust)
 * - Backlink profile sampling (300-400 links via API)
 * - Referring domain quality scoring
 * - Author bio & credential extraction
 * - Trust badge & certification detection
 * - Citation & mention tracking
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// EEAT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ORACLE_EEAT_CONFIG = {
  // Backlink Settings
  BACKLINK_SAMPLE_SIZE: 400,          // Number of backlinks to sample
  MAX_REFERRING_DOMAINS: 100,         // Top referring domains to analyze
  
  // Scoring Weights
  WEIGHTS: {
    experience: 0.20,
    expertise: 0.30,
    authoritativeness: 0.25,
    trustworthiness: 0.25
  },
  
  // Trust Signal Patterns
  TRUST_PATTERNS: {
    // SSL/Security
    security: ['https://', 'ssl', 'secure', 'encrypted', 'verified'],
    
    // Trust badges
    badges: [
      'bbb', 'better business bureau', 'trustpilot', 'sitejabber',
      'norton', 'mcafee', 'verisign', 'truste', 'digicert',
      'ssl certified', 'pci compliant', 'gdpr compliant'
    ],
    
    // Contact/Transparency
    transparency: [
      'about us', 'contact us', 'our team', 'meet the team',
      'privacy policy', 'terms of service', 'cookie policy',
      'editorial policy', 'disclosure', 'advertiser disclosure'
    ],
    
    // Citations
    citations: [
      'according to', 'research shows', 'studies indicate',
      'data from', 'source:', 'via', 'citation', 'reference',
      'ncbi', 'pubmed', 'doi:', 'issn', 'isbn'
    ]
  },
  
  // Authority Signal Patterns
  AUTHORITY_PATTERNS: {
    // Media mentions
    media: [
      'as seen on', 'featured in', 'as featured', 'mentioned in',
      'press', 'news', 'media coverage', 'in the news'
    ],
    
    // Awards
    awards: [
      'award', 'winner', 'recognized', 'certified', 'accredited',
      'rated #1', 'top rated', 'best in class', 'industry leader'
    ],
    
    // Partnerships
    partnerships: [
      'partner', 'official partner', 'authorized', 'licensed',
      'endorsed by', 'recommended by', 'sponsored by'
    ],
    
    // High authority domains
    highAuthorityDomains: [
      '.gov', '.edu', 'wikipedia.org', 'britannica.com',
      'nytimes.com', 'bbc.com', 'reuters.com', 'forbes.com'
    ]
  },
  
  // Expertise Signal Patterns
  EXPERTISE_PATTERNS: {
    // Credentials
    credentials: [
      'phd', 'md', 'mba', 'cpa', 'esq', 'jd', 'rn', 'dds',
      'dr.', 'professor', 'certified', 'licensed', 'board certified'
    ],
    
    // Experience indicators
    experience: [
      'years of experience', 'experience since', 'founded in',
      'established', 'veteran', 'senior', 'expert', 'specialist'
    ],
    
    // Depth indicators
    depth: [
      'in-depth', 'comprehensive', 'detailed', 'extensive',
      'ultimate guide', 'complete guide', 'everything you need'
    ],
    
    // Technical indicators
    technical: [
      'methodology', 'research', 'analysis', 'case study',
      'data-driven', 'evidence-based', 'peer-reviewed'
    ]
  },
  
  // Experience Signal Patterns (first-hand)
  EXPERIENCE_PATTERNS: {
    // First-hand narratives
    firstHand: [
      'i tested', 'we tested', 'hands-on', 'personal experience',
      'i used', 'we used', 'in my experience', 'first-hand',
      'i recommend', 'we recommend', 'after trying', 'having used'
    ],
    
    // Case studies
    caseStudies: [
      'case study', 'real example', 'success story', 'client story',
      'results for', 'how we helped', 'before and after'
    ],
    
    // Original research
    originalResearch: [
      'our research', 'we found', 'our study', 'original research',
      'we surveyed', 'we analyzed', 'our data shows'
    ],
    
    // Reviews
    reviews: [
      'tested', 'reviewed', 'tried', 'evaluated', 'compared',
      'hands-on review', 'product review', 'in-depth review'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: EEAT FORENSICS CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleEEATForensics - Deep EEAT Analysis Engine
 */
class OracleEEATForensics {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
  }
  
  /**
   * Perform comprehensive EEAT analysis
   * @param {Object} pageData - Parsed page data with content
   * @param {Object} backlinkData - Backlink profile data (optional)
   * @returns {Object} Complete EEAT analysis
   */
  analyzeEEAT(pageData, backlinkData = null) {
    console.log(`🔬 EEAT Analysis: ${pageData.url}`);
    
    const analysis = {
      url: pageData.url,
      domain: pageData.domain,
      analyzedAt: new Date().toISOString(),
      
      // Individual scores
      experience: this._analyzeExperience(pageData),
      expertise: this._analyzeExpertise(pageData),
      authoritativeness: this._analyzeAuthority(pageData, backlinkData),
      trustworthiness: this._analyzeTrust(pageData),
      
      // Extracted entities
      authors: this._extractAuthors(pageData),
      citations: this._extractCitations(pageData),
      trustBadges: this._extractTrustBadges(pageData),
      
      // Off-page signals (if backlink data available)
      backlinkProfile: backlinkData ? this._analyzeBacklinks(backlinkData) : null
    };
    
    // Calculate overall score
    analysis.overall = this._calculateOverallScore(analysis);
    
    // Generate recommendations
    analysis.recommendations = this._generateRecommendations(analysis);
    
    return analysis;
  }
  
  /**
   * Analyze Experience signals (first-hand experience)
   */
  _analyzeExperience(pageData) {
    const signals = [];
    let score = 0;
    const content = (pageData.html || '').toLowerCase();
    
    // Check first-hand narratives
    const firstHandCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERIENCE_PATTERNS.firstHand);
    if (firstHandCount > 0) {
      signals.push({ type: 'first_hand', count: firstHandCount, weight: 15 });
      score += Math.min(firstHandCount * 5, 25);
    }
    
    // Check case studies
    const caseStudyCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERIENCE_PATTERNS.caseStudies);
    if (caseStudyCount > 0) {
      signals.push({ type: 'case_study', count: caseStudyCount, weight: 20 });
      score += Math.min(caseStudyCount * 10, 25);
    }
    
    // Check original research
    const researchCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERIENCE_PATTERNS.originalResearch);
    if (researchCount > 0) {
      signals.push({ type: 'original_research', count: researchCount, weight: 20 });
      score += Math.min(researchCount * 10, 20);
    }
    
    // Check reviews/testing
    const reviewCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERIENCE_PATTERNS.reviews);
    if (reviewCount > 0) {
      signals.push({ type: 'reviews', count: reviewCount, weight: 15 });
      score += Math.min(reviewCount * 5, 15);
    }
    
    // Check for images/videos (media evidence)
    const mediaCount = (content.match(/<img|<video|<iframe.*youtube|<iframe.*vimeo/gi) || []).length;
    if (mediaCount >= 3) {
      signals.push({ type: 'media_evidence', count: mediaCount, weight: 15 });
      score += Math.min(mediaCount * 3, 15);
    }
    
    return {
      score: Math.min(score, 100),
      signals: signals,
      grade: this._scoreToGrade(score)
    };
  }
  
  /**
   * Analyze Expertise signals
   */
  _analyzeExpertise(pageData) {
    const signals = [];
    let score = 0;
    const content = (pageData.html || '').toLowerCase();
    
    // Check credentials
    const credentialCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERTISE_PATTERNS.credentials);
    if (credentialCount > 0) {
      signals.push({ type: 'credentials', count: credentialCount, weight: 25 });
      score += Math.min(credentialCount * 8, 25);
    }
    
    // Check experience indicators
    const experienceCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERTISE_PATTERNS.experience);
    if (experienceCount > 0) {
      signals.push({ type: 'experience_indicators', count: experienceCount, weight: 20 });
      score += Math.min(experienceCount * 5, 20);
    }
    
    // Check content depth
    const depthCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERTISE_PATTERNS.depth);
    if (depthCount > 0) {
      signals.push({ type: 'content_depth', count: depthCount, weight: 15 });
      score += Math.min(depthCount * 5, 15);
    }
    
    // Check technical indicators
    const technicalCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.EXPERTISE_PATTERNS.technical);
    if (technicalCount > 0) {
      signals.push({ type: 'technical', count: technicalCount, weight: 20 });
      score += Math.min(technicalCount * 5, 20);
    }
    
    // Word count bonus (in-depth content)
    const wordCount = (content.match(/\b\w+\b/g) || []).length;
    if (wordCount >= 2000) {
      signals.push({ type: 'long_form', wordCount: wordCount, weight: 10 });
      score += 10;
    } else if (wordCount >= 1000) {
      signals.push({ type: 'medium_form', wordCount: wordCount, weight: 5 });
      score += 5;
    }
    
    // Author bio bonus
    if (content.includes('about the author') || content.includes('written by') || content.includes('author bio')) {
      signals.push({ type: 'author_bio', weight: 10 });
      score += 10;
    }
    
    return {
      score: Math.min(score, 100),
      signals: signals,
      grade: this._scoreToGrade(score)
    };
  }
  
  /**
   * Analyze Authoritativeness signals
   */
  _analyzeAuthority(pageData, backlinkData) {
    const signals = [];
    let score = 0;
    const content = (pageData.html || '').toLowerCase();
    
    // Check media mentions
    const mediaCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.AUTHORITY_PATTERNS.media);
    if (mediaCount > 0) {
      signals.push({ type: 'media_mentions', count: mediaCount, weight: 20 });
      score += Math.min(mediaCount * 10, 20);
    }
    
    // Check awards/recognition
    const awardCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.AUTHORITY_PATTERNS.awards);
    if (awardCount > 0) {
      signals.push({ type: 'awards', count: awardCount, weight: 15 });
      score += Math.min(awardCount * 5, 15);
    }
    
    // Check partnerships
    const partnerCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.AUTHORITY_PATTERNS.partnerships);
    if (partnerCount > 0) {
      signals.push({ type: 'partnerships', count: partnerCount, weight: 15 });
      score += Math.min(partnerCount * 5, 15);
    }
    
    // Check external links to high authority domains
    const authDomainLinks = this._countPatterns(content, ORACLE_EEAT_CONFIG.AUTHORITY_PATTERNS.highAuthorityDomains);
    if (authDomainLinks > 0) {
      signals.push({ type: 'authority_outlinks', count: authDomainLinks, weight: 15 });
      score += Math.min(authDomainLinks * 5, 15);
    }
    
    // Backlink authority (if available)
    if (backlinkData && backlinkData.referringDomains) {
      const drScore = backlinkData.averageDR || 0;
      if (drScore >= 50) {
        signals.push({ type: 'high_dr_backlinks', avgDR: drScore, weight: 25 });
        score += 25;
      } else if (drScore >= 30) {
        signals.push({ type: 'medium_dr_backlinks', avgDR: drScore, weight: 15 });
        score += 15;
      } else if (drScore >= 10) {
        signals.push({ type: 'low_dr_backlinks', avgDR: drScore, weight: 5 });
        score += 5;
      }
      
      // Check for .edu/.gov backlinks
      const eduGovLinks = backlinkData.referringDomains.filter(d => 
        d.domain.endsWith('.edu') || d.domain.endsWith('.gov')
      ).length;
      
      if (eduGovLinks > 0) {
        signals.push({ type: 'edu_gov_backlinks', count: eduGovLinks, weight: 10 });
        score += Math.min(eduGovLinks * 5, 10);
      }
    }
    
    return {
      score: Math.min(score, 100),
      signals: signals,
      grade: this._scoreToGrade(score)
    };
  }
  
  /**
   * Analyze Trustworthiness signals
   */
  _analyzeTrust(pageData) {
    const signals = [];
    let score = 0;
    const content = (pageData.html || '').toLowerCase();
    const url = pageData.url || '';
    
    // HTTPS check
    if (url.startsWith('https://')) {
      signals.push({ type: 'https', weight: 10 });
      score += 10;
    }
    
    // Trust badges
    const badgeCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.TRUST_PATTERNS.badges);
    if (badgeCount > 0) {
      signals.push({ type: 'trust_badges', count: badgeCount, weight: 20 });
      score += Math.min(badgeCount * 10, 20);
    }
    
    // Transparency pages
    const transparencyCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.TRUST_PATTERNS.transparency);
    if (transparencyCount > 0) {
      signals.push({ type: 'transparency', count: transparencyCount, weight: 20 });
      score += Math.min(transparencyCount * 5, 20);
    }
    
    // Citations/references
    const citationCount = this._countPatterns(content, ORACLE_EEAT_CONFIG.TRUST_PATTERNS.citations);
    if (citationCount > 0) {
      signals.push({ type: 'citations', count: citationCount, weight: 25 });
      score += Math.min(citationCount * 5, 25);
    }
    
    // Schema markup (structured data)
    if (content.includes('application/ld+json') || content.includes('itemtype=')) {
      signals.push({ type: 'structured_data', weight: 10 });
      score += 10;
    }
    
    // Contact information
    if (content.includes('contact@') || content.includes('mailto:') || 
        content.match(/\(\d{3}\)\s?\d{3}-\d{4}/) || content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      signals.push({ type: 'contact_info', weight: 10 });
      score += 10;
    }
    
    // Physical address
    if (content.match(/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)/i)) {
      signals.push({ type: 'physical_address', weight: 5 });
      score += 5;
    }
    
    return {
      score: Math.min(score, 100),
      signals: signals,
      grade: this._scoreToGrade(score)
    };
  }
  
  /**
   * Extract author information
   */
  _extractAuthors(pageData) {
    const authors = [];
    const content = pageData.html || '';
    
    // Schema.org author
    const schemaAuthorMatch = content.match(/"author"\s*:\s*(?:\[?\s*)?{[^}]*"name"\s*:\s*"([^"]+)"/gi);
    if (schemaAuthorMatch) {
      for (const match of schemaAuthorMatch) {
        const nameMatch = match.match(/"name"\s*:\s*"([^"]+)"/);
        if (nameMatch) {
          authors.push({
            name: nameMatch[1],
            source: 'schema.org'
          });
        }
      }
    }
    
    // Meta author tag
    const metaAuthorMatch = content.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
    if (metaAuthorMatch) {
      authors.push({
        name: metaAuthorMatch[1],
        source: 'meta_tag'
      });
    }
    
    // Common author patterns
    const bylinePatterns = [
      /written by\s*:?\s*<[^>]+>([^<]+)/i,
      /by\s+<[^>]*>([^<]+)<\/a>/i,
      /author\s*:?\s*<[^>]+>([^<]+)/i,
      /class=["']author["'][^>]*>([^<]+)/i
    ];
    
    for (const pattern of bylinePatterns) {
      const match = content.match(pattern);
      if (match) {
        const authorName = match[1].trim();
        if (authorName.length > 2 && authorName.length < 100 && 
            !authors.some(a => a.name.toLowerCase() === authorName.toLowerCase())) {
          authors.push({
            name: authorName,
            source: 'byline'
          });
        }
      }
    }
    
    return authors;
  }
  
  /**
   * Extract citations and references
   */
  _extractCitations(pageData) {
    const citations = [];
    const content = pageData.html || '';
    
    // DOI links
    const doiMatches = content.match(/doi\.org\/[^\s"'<]+/gi) || [];
    for (const doi of doiMatches.slice(0, 20)) {
      citations.push({ type: 'doi', value: doi });
    }
    
    // PubMed/NCBI links
    const pubmedMatches = content.match(/ncbi\.nlm\.nih\.gov\/[^\s"'<]+/gi) || [];
    for (const pm of pubmedMatches.slice(0, 10)) {
      citations.push({ type: 'pubmed', value: pm });
    }
    
    // Wikipedia links
    const wikiMatches = content.match(/wikipedia\.org\/wiki\/[^\s"'<]+/gi) || [];
    for (const wiki of wikiMatches.slice(0, 10)) {
      citations.push({ type: 'wikipedia', value: wiki });
    }
    
    // .gov/.edu links
    const govEduMatches = content.match(/https?:\/\/[^\s"'<]+\.(gov|edu)[^\s"'<]*/gi) || [];
    for (const ge of govEduMatches.slice(0, 20)) {
      citations.push({ type: 'gov_edu', value: ge });
    }
    
    return citations;
  }
  
  /**
   * Extract trust badges and certifications
   */
  _extractTrustBadges(pageData) {
    const badges = [];
    const content = (pageData.html || '').toLowerCase();
    
    const badgePatterns = {
      'BBB Accredited': /better\s+business\s+bureau|bbb\s+accredited|bbb\.org/i,
      'Trustpilot': /trustpilot/i,
      'Norton Secured': /norton\s+secured|symantec\s+seal/i,
      'McAfee Secure': /mcafee\s+secure/i,
      'SSL Certified': /ssl\s+certified|ssl\s+secure/i,
      'PCI Compliant': /pci\s+compliant|pci\s+dss/i,
      'GDPR Compliant': /gdpr\s+compliant/i,
      'HIPAA Compliant': /hipaa\s+compliant/i,
      'SOC 2': /soc\s*2|soc\s*ii/i,
      'ISO Certified': /iso\s+\d+|iso\s+certified/i
    };
    
    for (const [badgeName, pattern] of Object.entries(badgePatterns)) {
      if (pattern.test(content)) {
        badges.push({ name: badgeName, detected: true });
      }
    }
    
    return badges;
  }
  
  /**
   * Analyze backlink profile
   */
  _analyzeBacklinks(backlinkData) {
    if (!backlinkData || !backlinkData.links) {
      return null;
    }
    
    const analysis = {
      totalBacklinks: backlinkData.totalBacklinks || backlinkData.links.length,
      totalReferringDomains: 0,
      averageDR: 0,
      averageUR: 0,
      
      // Quality distribution
      qualityDistribution: {
        high: 0,    // DR 60+
        medium: 0,  // DR 30-59
        low: 0      // DR 0-29
      },
      
      // Domain types
      domainTypes: {
        edu: 0,
        gov: 0,
        com: 0,
        org: 0,
        other: 0
      },
      
      // Anchor text distribution
      anchorTypes: {
        branded: 0,
        exact: 0,
        partial: 0,
        generic: 0,
        naked: 0
      },
      
      topReferringDomains: []
    };
    
    // Analyze domains
    const domainMap = new Map();
    let totalDR = 0;
    let totalUR = 0;
    
    for (const link of backlinkData.links) {
      const domain = link.sourceDomain || this._extractDomain(link.sourceUrl || '');
      
      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          domain: domain,
          dr: link.domainRating || link.dr || 0,
          ur: link.urlRating || link.ur || 0,
          linkCount: 0
        });
      }
      
      domainMap.get(domain).linkCount++;
      totalDR += link.domainRating || link.dr || 0;
      totalUR += link.urlRating || link.ur || 0;
      
      // Domain type
      if (domain.endsWith('.edu')) analysis.domainTypes.edu++;
      else if (domain.endsWith('.gov')) analysis.domainTypes.gov++;
      else if (domain.endsWith('.com')) analysis.domainTypes.com++;
      else if (domain.endsWith('.org')) analysis.domainTypes.org++;
      else analysis.domainTypes.other++;
    }
    
    analysis.totalReferringDomains = domainMap.size;
    analysis.averageDR = backlinkData.links.length > 0 ? Math.round(totalDR / backlinkData.links.length) : 0;
    analysis.averageUR = backlinkData.links.length > 0 ? Math.round(totalUR / backlinkData.links.length) : 0;
    
    // Quality distribution
    for (const [domain, data] of domainMap) {
      if (data.dr >= 60) analysis.qualityDistribution.high++;
      else if (data.dr >= 30) analysis.qualityDistribution.medium++;
      else analysis.qualityDistribution.low++;
    }
    
    // Top referring domains (sorted by DR)
    analysis.topReferringDomains = Array.from(domainMap.values())
      .sort((a, b) => b.dr - a.dr)
      .slice(0, 20);
    
    return analysis;
  }
  
  /**
   * Calculate overall EEAT score
   */
  _calculateOverallScore(analysis) {
    const weights = ORACLE_EEAT_CONFIG.WEIGHTS;
    
    const weightedScore = 
      (analysis.experience.score * weights.experience) +
      (analysis.expertise.score * weights.expertise) +
      (analysis.authoritativeness.score * weights.authoritativeness) +
      (analysis.trustworthiness.score * weights.trustworthiness);
    
    const finalScore = Math.round(weightedScore);
    
    return {
      score: finalScore,
      grade: this._scoreToGrade(finalScore),
      breakdown: {
        experience: analysis.experience.score,
        expertise: analysis.expertise.score,
        authoritativeness: analysis.authoritativeness.score,
        trustworthiness: analysis.trustworthiness.score
      }
    };
  }
  
  /**
   * Generate improvement recommendations
   */
  _generateRecommendations(analysis) {
    const recommendations = [];
    
    // Experience recommendations
    if (analysis.experience.score < 50) {
      recommendations.push({
        category: 'Experience',
        priority: 'High',
        recommendation: 'Add first-hand experience content: personal reviews, case studies, or original research',
        impact: 'Significant boost to E-E-A-T signals'
      });
    }
    
    // Expertise recommendations
    if (analysis.expertise.score < 50) {
      if (!analysis.expertise.signals.some(s => s.type === 'author_bio')) {
        recommendations.push({
          category: 'Expertise',
          priority: 'High',
          recommendation: 'Add detailed author bios with credentials and expertise',
          impact: 'Establishes content creator authority'
        });
      }
      
      if (!analysis.expertise.signals.some(s => s.type === 'long_form')) {
        recommendations.push({
          category: 'Expertise',
          priority: 'Medium',
          recommendation: 'Create more in-depth content (2000+ words) with comprehensive coverage',
          impact: 'Demonstrates topic expertise'
        });
      }
    }
    
    // Authority recommendations
    if (analysis.authoritativeness.score < 50) {
      recommendations.push({
        category: 'Authority',
        priority: 'High',
        recommendation: 'Seek coverage from high-authority publications and industry sites',
        impact: 'Builds third-party validation'
      });
      
      recommendations.push({
        category: 'Authority',
        priority: 'Medium',
        recommendation: 'Link to .edu, .gov, and other authoritative sources',
        impact: 'Associates content with trusted sources'
      });
    }
    
    // Trust recommendations
    if (analysis.trustworthiness.score < 50) {
      if (!analysis.trustworthiness.signals.some(s => s.type === 'citations')) {
        recommendations.push({
          category: 'Trust',
          priority: 'High',
          recommendation: 'Add citations and references to support claims',
          impact: 'Verifies content accuracy'
        });
      }
      
      if (!analysis.trustworthiness.signals.some(s => s.type === 'transparency')) {
        recommendations.push({
          category: 'Trust',
          priority: 'Medium',
          recommendation: 'Add About, Contact, Privacy Policy, and Editorial Policy pages',
          impact: 'Establishes site transparency'
        });
      }
      
      if (analysis.trustBadges.length === 0) {
        recommendations.push({
          category: 'Trust',
          priority: 'Low',
          recommendation: 'Consider adding relevant trust badges and certifications',
          impact: 'Provides visual trust indicators'
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _countPatterns(text, patterns) {
    let count = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      if (matches) count += matches.length;
    }
    return count;
  }
  
  _scoreToGrade(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Average';
    if (score >= 30) return 'Below Average';
    if (score >= 15) return 'Poor';
    return 'Very Poor';
  }
  
  _extractDomain(url) {
    try {
      const match = url.match(/https?:\/\/([^\/]+)/);
      return match ? match[1].replace('www.', '') : '';
    } catch (e) {
      return '';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze EEAT for a URL
 * @param {string} url - URL to analyze
 */
function ORACLE_AnalyzeEEAT(url) {
  const forensics = new OracleEEATForensics();
  
  // Fetch page
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const pageData = {
      url: url,
      domain: url.match(/https?:\/\/([^\/]+)/)?.[1]?.replace('www.', '') || '',
      html: response.getContentText()
    };
    
    const analysis = forensics.analyzeEEAT(pageData);
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🔬 EEAT ANALYSIS RESULTS');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log(`URL: ${url}`);
    Logger.log('───────────────────────────────────────────────────────────');
    Logger.log(`📊 Overall Score: ${analysis.overall.score}/100 (${analysis.overall.grade})`);
    Logger.log(`  Experience:       ${analysis.experience.score}/100`);
    Logger.log(`  Expertise:        ${analysis.expertise.score}/100`);
    Logger.log(`  Authoritativeness: ${analysis.authoritativeness.score}/100`);
    Logger.log(`  Trustworthiness:  ${analysis.trustworthiness.score}/100`);
    Logger.log('───────────────────────────────────────────────────────────');
    Logger.log(`👤 Authors Found: ${analysis.authors.length}`);
    Logger.log(`📚 Citations: ${analysis.citations.length}`);
    Logger.log(`🛡️ Trust Badges: ${analysis.trustBadges.length}`);
    Logger.log('───────────────────────────────────────────────────────────');
    Logger.log('📝 Top Recommendations:');
    for (const rec of analysis.recommendations.slice(0, 3)) {
      Logger.log(`  [${rec.priority}] ${rec.recommendation}`);
    }
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return analysis;
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
    return { error: e.message };
  }
}

/**
 * Batch analyze EEAT for multiple URLs
 * @param {Array} urls - Array of URLs
 */
function ORACLE_BatchEEATAnalysis(urls) {
  const forensics = new OracleEEATForensics();
  const results = [];
  
  for (const url of urls) {
    try {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const pageData = {
        url: url,
        domain: url.match(/https?:\/\/([^\/]+)/)?.[1]?.replace('www.', '') || '',
        html: response.getContentText()
      };
      
      results.push(forensics.analyzeEEAT(pageData));
      
    } catch (e) {
      results.push({ url: url, error: e.message });
    }
    
    // Small delay to avoid rate limiting
    Utilities.sleep(500);
  }
  
  return results;
}

/**
 * Compare EEAT scores between competitors
 * @param {string} projectId - Project ID
 */
function ORACLE_CompareEEAT(projectId) {
  const persistence = new OraclePersistence();
  const intelligence = persistence.getIntelligence(projectId || 'default');
  persistence.disconnect();
  
  if (intelligence.length === 0) {
    Logger.log('⚠️ No intelligence data found');
    return;
  }
  
  // Group by domain
  const domainEEAT = new Map();
  
  for (const item of intelligence) {
    const domain = item.domain;
    const eeat = item.eeatJson;
    
    if (!domainEEAT.has(domain)) {
      domainEEAT.set(domain, {
        domain: domain,
        pageCount: 0,
        totalScore: 0,
        experience: 0,
        expertise: 0,
        authoritativeness: 0,
        trustworthiness: 0
      });
    }
    
    const data = domainEEAT.get(domain);
    data.pageCount++;
    data.totalScore += eeat.overall?.score || 0;
    data.experience += eeat.experience?.score || 0;
    data.expertise += eeat.expertise?.score || 0;
    data.authoritativeness += eeat.authoritativeness?.score || 0;
    data.trustworthiness += eeat.trustworthiness?.score || 0;
  }
  
  // Calculate averages and sort
  const comparison = Array.from(domainEEAT.values()).map(d => ({
    domain: d.domain,
    pageCount: d.pageCount,
    avgEEAT: Math.round(d.totalScore / d.pageCount),
    avgExperience: Math.round(d.experience / d.pageCount),
    avgExpertise: Math.round(d.expertise / d.pageCount),
    avgAuthority: Math.round(d.authoritativeness / d.pageCount),
    avgTrust: Math.round(d.trustworthiness / d.pageCount)
  })).sort((a, b) => b.avgEEAT - a.avgEEAT);
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🏆 EEAT COMPETITOR COMPARISON');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  for (const comp of comparison) {
    Logger.log(`${comp.domain}: ${comp.avgEEAT}/100 (${comp.pageCount} pages)`);
    Logger.log(`  E: ${comp.avgExperience} | E: ${comp.avgExpertise} | A: ${comp.avgAuthority} | T: ${comp.avgTrust}`);
    Logger.log('───────────────────────────────────────────────────────────');
  }
  
  return comparison;
}

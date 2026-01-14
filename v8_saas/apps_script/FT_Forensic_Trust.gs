/**
 * FT_Forensic_Trust.gs - Trust & Authority Signals
 * SerpifAI V8 - Modular Architecture
 * 
 * E-E-A-T signals, author detection, trust indicators.
 */

/**
 * Extract author signals for E-E-A-T
 * @param {string} html - HTML content
 * @return {object} Author signals
 */
function FT_extractAuthorSignals(html) {
  const signals = {
    hasAuthor: false,
    authorName: '',
    authorBio: '',
    authorSchema: false,
    authorLinks: [],
    score: 0
  };
  
  try {
    // Check for author meta tag
    const authorMeta = html.match(/<meta\s+name\s*=\s*["']author["']\s+content\s*=\s*["']([^"']+)["']/i);
    if (authorMeta) {
      signals.hasAuthor = true;
      signals.authorName = authorMeta[1];
    }
    
    // Check for schema.org author
    const schemaMatch = html.match(/"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i);
    if (schemaMatch) {
      signals.authorSchema = true;
      if (!signals.authorName) signals.authorName = schemaMatch[1];
    }
    
    // Check for common author patterns
    const authorPatterns = [
      /<[^>]*class\s*=\s*["'][^"']*author[^"']*["'][^>]*>([^<]{3,100})</gi,
      /by\s+<[^>]+>([^<]{3,50})</gi,
      /<span[^>]*itemprop\s*=\s*["']author["'][^>]*>([^<]+)</gi
    ];
    
    for (const pattern of authorPatterns) {
      const match = pattern.exec(html);
      if (match && !signals.authorName) {
        signals.hasAuthor = true;
        signals.authorName = match[1].trim();
        break;
      }
    }
    
    // Check for author bio section
    const bioPatterns = [
      /<[^>]*class\s*=\s*["'][^"']*author-bio[^"']*["'][^>]*>([\s\S]{20,500}?)<\//gi,
      /<[^>]*class\s*=\s*["'][^"']*about-author[^"']*["'][^>]*>([\s\S]{20,500}?)<\//gi
    ];
    
    for (const pattern of bioPatterns) {
      const match = pattern.exec(html);
      if (match) {
        signals.authorBio = match[1].replace(/<[^>]+>/g, ' ').trim().substring(0, 300);
        break;
      }
    }
    
    // Check for social profile links
    const socialPatterns = [
      /href\s*=\s*["'](https?:\/\/(?:www\.)?twitter\.com\/[^"']+)["']/gi,
      /href\s*=\s*["'](https?:\/\/(?:www\.)?linkedin\.com\/in\/[^"']+)["']/gi
    ];
    
    for (const pattern of socialPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (!signals.authorLinks.includes(match[1])) {
          signals.authorLinks.push(match[1]);
        }
      }
    }
    
    signals.score = FT_scoreAuthorSignals(signals);
    return signals;
    
  } catch (e) {
    LOG_warn('Author signals error', { error: e.message });
    return signals;
  }
}

/**
 * Score author signals
 * @param {object} signals - Author signals
 * @return {number} Score 0-100
 */
function FT_scoreAuthorSignals(signals) {
  let score = 0;
  
  if (signals.hasAuthor) score += 25;
  if (signals.authorName && signals.authorName.length > 3) score += 15;
  if (signals.authorSchema) score += 20;
  if (signals.authorBio && signals.authorBio.length > 50) score += 20;
  if (signals.authorLinks.length > 0) score += 20;
  
  return Math.min(100, score);
}

/**
 * Extract trust signals
 * @param {string} html - HTML content
 * @return {object} Trust signals
 */
function FT_extractTrustSignals(html) {
  const signals = {
    hasPrivacyPolicy: false,
    hasTerms: false,
    hasContact: false,
    hasAbout: false,
    hasCopyright: false,
    hasSecurityBadges: false,
    hasTestimonials: false,
    hasCertifications: false,
    trustIndicators: [],
    score: 0
  };
  
  try {
    const lowerHtml = html.toLowerCase();
    
    // Privacy Policy
    signals.hasPrivacyPolicy = /privacy[\s-]*policy|data[\s-]*protection/i.test(html) &&
      /href\s*=\s*["'][^"']*privacy/i.test(html);
    
    // Terms of Service
    signals.hasTerms = /terms[\s-]*(of[\s-]*service|and[\s-]*conditions|of[\s-]*use)/i.test(html) &&
      /href\s*=\s*["'][^"']*terms/i.test(html);
    
    // Contact information
    signals.hasContact = /contact[\s-]*us|get[\s-]*in[\s-]*touch/i.test(html) &&
      /href\s*=\s*["'][^"']*contact/i.test(html);
    
    // About page
    signals.hasAbout = /about[\s-]*us|who[\s-]*we[\s-]*are|our[\s-]*story/i.test(html) &&
      /href\s*=\s*["'][^"']*about/i.test(html);
    
    // Copyright
    signals.hasCopyright = /©|\bcopyright\b/i.test(html);
    
    // Security badges
    const securityPatterns = [
      /ssl[\s-]*secure|256[\s-]*bit|encrypted/i,
      /mcafee|norton|trustwave|comodo/i,
      /verified[\s-]*by|trusted[\s-]*site/i
    ];
    signals.hasSecurityBadges = securityPatterns.some(p => p.test(html));
    
    // Testimonials
    signals.hasTestimonials = /testimonial|customer[\s-]*review|what[\s-]*(?:our[\s-]*)?customers[\s-]*say/i.test(html);
    
    // Certifications
    signals.hasCertifications = /certified|accredited|iso[\s-]*\d+|bbb[\s-]*rated/i.test(html);
    
    // Build indicators list
    if (signals.hasPrivacyPolicy) signals.trustIndicators.push('Privacy Policy');
    if (signals.hasTerms) signals.trustIndicators.push('Terms of Service');
    if (signals.hasContact) signals.trustIndicators.push('Contact Page');
    if (signals.hasAbout) signals.trustIndicators.push('About Page');
    if (signals.hasCopyright) signals.trustIndicators.push('Copyright Notice');
    if (signals.hasSecurityBadges) signals.trustIndicators.push('Security Badges');
    if (signals.hasTestimonials) signals.trustIndicators.push('Testimonials');
    if (signals.hasCertifications) signals.trustIndicators.push('Certifications');
    
    signals.score = FT_scoreTrustSignals(signals);
    return signals;
    
  } catch (e) {
    LOG_warn('Trust signals error', { error: e.message });
    return signals;
  }
}

/**
 * Score trust signals
 * @param {object} signals - Trust signals
 * @return {number} Score 0-100
 */
function FT_scoreTrustSignals(signals) {
  let score = 0;
  
  if (signals.hasPrivacyPolicy) score += 15;
  if (signals.hasTerms) score += 10;
  if (signals.hasContact) score += 15;
  if (signals.hasAbout) score += 10;
  if (signals.hasCopyright) score += 10;
  if (signals.hasSecurityBadges) score += 15;
  if (signals.hasTestimonials) score += 15;
  if (signals.hasCertifications) score += 10;
  
  return Math.min(100, score);
}

// FAQ and Intro functions moved to FT_Forensic_Content.gs

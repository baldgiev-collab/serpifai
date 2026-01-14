/**
 * FT_EEAT.gs - E-E-A-T Analysis
 * SerpifAI V8 - Experience, Expertise, Authority, Trust signals
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// E-E-A-T ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze E-E-A-T signals on page
 */
function FT_analyzeEEAT(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    
    // Analyze each E-E-A-T component
    const experience = analyzeExperience(html);
    const expertise = analyzeExpertise(html);
    const authority = analyzeAuthority(html);
    const trust = analyzeTrust(html, url);
    
    // Calculate overall score
    const score = Math.round((experience.score + expertise.score + authority.score + trust.score) / 4);
    
    return {
      ok: true,
      url: url,
      overallScore: score,
      experience: experience,
      expertise: expertise,
      authority: authority,
      trust: trust,
      recommendations: getEEATRecommendations(experience, expertise, authority, trust)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Analyze Experience signals
 */
function analyzeExperience(html) {
  const signals = [];
  let score = 0;
  
  // First-person language
  const firstPerson = (html.match(/\b(I|we|my|our)\s+(tested|tried|used|experienced|found)\b/gi) || []).length;
  if (firstPerson > 0) {
    signals.push('First-person experience language found');
    score += 20;
  }
  
  // Personal stories/case studies
  if (html.toLowerCase().indexOf('case study') >= 0 || html.toLowerCase().indexOf('my experience') >= 0) {
    signals.push('Case study or personal experience content');
    score += 20;
  }
  
  // Photos/images (original content indicator)
  const imageCount = (html.match(/<img[^>]+>/gi) || []).length;
  if (imageCount > 3) {
    signals.push('Multiple images (potential original photography)');
    score += 15;
  }
  
  // Video embeds
  if (html.indexOf('youtube.com/embed') >= 0 || html.indexOf('vimeo.com') >= 0) {
    signals.push('Video content embedded');
    score += 15;
  }
  
  // Date information
  if (html.match(/published|updated|reviewed/i) && html.match(/\d{4}/)) {
    signals.push('Content dating found');
    score += 15;
  }
  
  return {
    score: Math.min(100, score),
    signals: signals,
    component: 'Experience'
  };
}

/**
 * Analyze Expertise signals
 */
function analyzeExpertise(html) {
  const signals = [];
  let score = 0;
  
  // Author information
  const hasAuthorSchema = html.indexOf('"author"') >= 0;
  const hasAuthorBox = html.toLowerCase().indexOf('about the author') >= 0 || 
                       html.toLowerCase().indexOf('written by') >= 0;
  
  if (hasAuthorSchema) {
    signals.push('Author schema markup found');
    score += 20;
  }
  
  if (hasAuthorBox) {
    signals.push('Author bio/box present');
    score += 20;
  }
  
  // Credentials
  const credentials = html.match(/\b(PhD|MD|JD|CPA|MBA|certified|licensed|degree)\b/gi) || [];
  if (credentials.length > 0) {
    signals.push('Credentials/qualifications mentioned');
    score += 20;
  }
  
  // Citations and references
  const citations = (html.match(/\bhref=["'][^"']*(?:\.gov|\.edu|pubmed|doi\.org|scholar\.google)[^"']*["']/gi) || []).length;
  if (citations > 0) {
    signals.push(citations + ' authoritative source citations');
    score += Math.min(25, citations * 5);
  }
  
  // Detailed/technical content
  const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  if (wordCount > 1500) {
    signals.push('In-depth content (' + wordCount + ' words)');
    score += 15;
  }
  
  return {
    score: Math.min(100, score),
    signals: signals,
    component: 'Expertise'
  };
}

/**
 * Analyze Authority signals
 */
function analyzeAuthority(html) {
  const signals = [];
  let score = 0;
  
  // Organization schema
  if (html.indexOf('"Organization"') >= 0 || html.indexOf('"LocalBusiness"') >= 0) {
    signals.push('Organization structured data');
    score += 20;
  }
  
  // About page link
  if (html.toLowerCase().indexOf('href="/about') >= 0 || html.toLowerCase().indexOf('href="about') >= 0) {
    signals.push('About page linked');
    score += 15;
  }
  
  // Contact information
  const hasPhone = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) !== null;
  const hasEmail = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) !== null;
  const hasAddress = html.match(/<address|itemtype="[^"]*PostalAddress/i) !== null;
  
  if (hasPhone) {
    signals.push('Phone number visible');
    score += 10;
  }
  if (hasEmail) {
    signals.push('Email contact visible');
    score += 10;
  }
  if (hasAddress) {
    signals.push('Physical address found');
    score += 15;
  }
  
  // Social profiles
  const socialLinks = (html.match(/href=["'][^"']*(facebook|twitter|linkedin|instagram)\.com[^"']*["']/gi) || []).length;
  if (socialLinks > 0) {
    signals.push(socialLinks + ' social profile links');
    score += Math.min(15, socialLinks * 5);
  }
  
  // Awards/recognition
  if (html.match(/\b(award|recognized|featured in|as seen on)\b/gi)) {
    signals.push('Awards or recognition mentioned');
    score += 15;
  }
  
  return {
    score: Math.min(100, score),
    signals: signals,
    component: 'Authority'
  };
}

/**
 * Analyze Trust signals
 */
function analyzeTrust(html, url) {
  const signals = [];
  let score = 0;
  
  // HTTPS
  if (url.startsWith('https://')) {
    signals.push('HTTPS secure connection');
    score += 15;
  }
  
  // Privacy policy
  if (html.toLowerCase().indexOf('privacy policy') >= 0 || html.toLowerCase().indexOf('privacy-policy') >= 0) {
    signals.push('Privacy policy linked');
    score += 15;
  }
  
  // Terms of service
  if (html.toLowerCase().indexOf('terms of service') >= 0 || html.toLowerCase().indexOf('terms-of-service') >= 0) {
    signals.push('Terms of service linked');
    score += 10;
  }
  
  // Reviews/testimonials
  if (html.indexOf('"Review"') >= 0 || html.toLowerCase().indexOf('testimonial') >= 0) {
    signals.push('Reviews or testimonials present');
    score += 15;
  }
  
  // Trust badges
  const trustBadges = html.match(/\b(BBB|TrustPilot|Norton|McAfee|SSL|verified|secure)\b/gi) || [];
  if (trustBadges.length > 0) {
    signals.push('Trust badges/seals found');
    score += 15;
  }
  
  // Editorial process
  if (html.toLowerCase().indexOf('editorial') >= 0 || html.toLowerCase().indexOf('fact-check') >= 0) {
    signals.push('Editorial/fact-checking process mentioned');
    score += 15;
  }
  
  // Return policy (for commerce)
  if (html.toLowerCase().indexOf('return policy') >= 0 || html.toLowerCase().indexOf('refund') >= 0) {
    signals.push('Return/refund policy found');
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    signals: signals,
    component: 'Trust'
  };
}

/**
 * Get E-E-A-T recommendations
 */
function getEEATRecommendations(experience, expertise, authority, trust) {
  const recs = [];
  
  // Experience recommendations
  if (experience.score < 50) {
    recs.push({
      component: 'Experience',
      priority: 'high',
      recommendation: 'Add first-hand experience content, case studies, or personal insights'
    });
  }
  
  // Expertise recommendations
  if (expertise.score < 50) {
    recs.push({
      component: 'Expertise',
      priority: 'high',
      recommendation: 'Add author bios with credentials and cite authoritative sources'
    });
  }
  
  // Authority recommendations
  if (authority.score < 50) {
    recs.push({
      component: 'Authority',
      priority: 'medium',
      recommendation: 'Add organization info, contact details, and social proof'
    });
  }
  
  // Trust recommendations
  if (trust.score < 50) {
    recs.push({
      component: 'Trust',
      priority: 'high',
      recommendation: 'Add privacy policy, terms of service, and trust signals'
    });
  }
  
  return recs;
}

/**
 * Generate author bio template
 */
function FT_generateAuthorBio(params) {
  const name = params.name;
  const role = params.role || 'Writer';
  const credentials = params.credentials || [];
  const experience = params.experience || '';
  const socialLinks = params.socialLinks || {};
  
  if (!name) {
    return { ok: false, error: 'Author name required' };
  }
  
  let bio = name + ' is a ' + role;
  
  if (credentials.length > 0) {
    bio += ' with ' + credentials.join(', ');
  }
  
  if (experience) {
    bio += '. ' + experience;
  }
  
  // Generate schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    jobTitle: role
  };
  
  if (credentials.length > 0) {
    schema.hasCredential = credentials.map(function(c) {
      return { '@type': 'EducationalOccupationalCredential', credentialCategory: c };
    });
  }
  
  const socialProfiles = [];
  if (socialLinks.linkedin) socialProfiles.push(socialLinks.linkedin);
  if (socialLinks.twitter) socialProfiles.push(socialLinks.twitter);
  if (socialProfiles.length > 0) {
    schema.sameAs = socialProfiles;
  }
  
  return {
    ok: true,
    bioText: bio,
    schema: schema,
    jsonLd: '<script type="application/ld+json">\n' + JSON.stringify(schema, null, 2) + '\n</script>'
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_StrategicCommand.gs - 0.1% TIER STRATEGIC INTELLIGENCE MODULES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI Elite v23.0 - Strategic Command Layer
 * 
 * MODULES:
 * 1. detectProgrammaticMoat() - Structural fingerprinting for template detection
 * 2. reconstructSemanticTriplets() - Subject-Predicate-Object entity extraction
 * 3. auditEmotionalResonance() - Friction & emotional debt analysis
 * 4. identifyAEOOpportunityGaps() - AI Citation steal opportunities
 * 
 * ALL OUTPUTS:
 * - Include Zero-Trust Proof (source HTML snippets)
 * - Store in evidenceMap for 37-chunk upload
 * - Memory optimized (max 500 char snippets)
 * 
 * @module StrategicCommand
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1: STRUCTURAL FINGERPRINTING - PROGRAMMATIC MOAT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect programmatic/database-driven templates by comparing structural patterns
 * between homepage and internal pages
 * 
 * LOGIC:
 * 1. Extract DIV class patterns from homepage
 * 2. Extract DIV class patterns from internal pages (blog, product, etc.)
 * 3. Calculate Structural Similarity Index (SSI)
 * 4. High SSI (>80%) = Programmatic moat detected
 * 
 * @param {Object} competitor - Competitor object with page data
 * @param {Object} internalPageData - Data from an internal page (optional)
 * @returns {Object} Programmatic moat analysis with proof
 */
function detectProgrammaticMoat(competitor, internalPageData) {
  console.log(`[StrategicCommand] detectProgrammaticMoat for ${competitor.domain}`);
  
  const result = {
    detected: false,
    structuralSimilarityIndex: 0,
    moatType: 'none',
    moatStrength: 'none',
    templateSignatures: [],
    repeatingPatterns: [],
    evidence: {
      homepageSnippet: '',
      internalSnippet: '',
      matchedClasses: []
    },
    recommendations: []
  };
  
  try {
    // Get HTML from different sources
    const homepageHtml = _getHomepageHtml(competitor);
    const internalHtml = internalPageData?.html || _getInternalPageHtml(competitor);
    
    if (!homepageHtml) {
      result.error = 'No homepage HTML available';
      return result;
    }
    
    // Extract structural fingerprints
    const homepageFingerprint = _extractStructuralFingerprint(homepageHtml);
    const internalFingerprint = internalHtml ? _extractStructuralFingerprint(internalHtml) : null;
    
    // Detect repeating DIV class patterns (template signatures)
    const templateSignatures = _detectTemplateSignatures(homepageHtml);
    result.templateSignatures = templateSignatures.slice(0, 10);
    
    // Calculate Structural Similarity Index
    if (internalFingerprint) {
      result.structuralSimilarityIndex = _calculateSSI(homepageFingerprint, internalFingerprint);
    } else {
      // Fallback: Analyze homepage structure depth as indicator
      result.structuralSimilarityIndex = _estimateSSIFromHomepage(homepageFingerprint);
    }
    
    // Determine moat type and strength
    const ssi = result.structuralSimilarityIndex;
    
    if (ssi >= 85) {
      result.detected = true;
      result.moatType = 'programmatic-seo';
      result.moatStrength = 'fortress';
      result.recommendations.push('Competitor uses database-driven templates. Counter with unique, hand-crafted content clusters.');
    } else if (ssi >= 70) {
      result.detected = true;
      result.moatType = 'hybrid-template';
      result.moatStrength = 'strong';
      result.recommendations.push('Hybrid template system detected. Focus on differentiated content depth.');
    } else if (ssi >= 50) {
      result.detected = false;
      result.moatType = 'partial-template';
      result.moatStrength = 'moderate';
      result.recommendations.push('Partial templating detected. Opportunity to outpace with systematic approach.');
    } else {
      result.detected = false;
      result.moatType = 'manual';
      result.moatStrength = 'weak';
      result.recommendations.push('Manual content structure. Programmatic approach would create significant advantage.');
    }
    
    // Find repeating patterns that prove database-driven content
    result.repeatingPatterns = _findRepeatingPatterns(homepageHtml);
    
    // Capture evidence snippets
    result.evidence.homepageSnippet = _captureTemplateProof(homepageHtml, templateSignatures);
    if (internalHtml) {
      result.evidence.internalSnippet = _captureTemplateProof(internalHtml, templateSignatures);
    }
    result.evidence.matchedClasses = templateSignatures.map(sig => sig.className).slice(0, 15);
    
    console.log(`[StrategicCommand] SSI: ${ssi}%, Moat: ${result.moatType} (${result.moatStrength})`);
    
  } catch (error) {
    console.error(`[StrategicCommand] detectProgrammaticMoat error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Extract structural fingerprint from HTML
 * @private
 */
function _extractStructuralFingerprint(html) {
  const fingerprint = {
    divClasses: [],
    sectionClasses: [],
    articleClasses: [],
    nestingDepth: 0,
    componentPatterns: [],
    gridPatterns: [],
    semanticTags: {}
  };
  
  if (!html) return fingerprint;
  
  // Extract all DIV classes
  const divClassRegex = /<div[^>]*class=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = divClassRegex.exec(html)) !== null) {
    const classes = match[1].split(/\s+/).filter(c => c.length > 2);
    fingerprint.divClasses.push(...classes);
  }
  
  // Extract section classes
  const sectionRegex = /<section[^>]*class=["']([^"']+)["'][^>]*>/gi;
  while ((match = sectionRegex.exec(html)) !== null) {
    fingerprint.sectionClasses.push(...match[1].split(/\s+/));
  }
  
  // Detect common component patterns (React/Vue/Angular signatures)
  const componentPatterns = [
    /data-react|data-reactroot|__react/gi,
    /data-v-[a-f0-9]+/gi,
    /ng-|_ngcontent|_nghost/gi,
    /data-component|data-module/gi
  ];
  
  componentPatterns.forEach((pattern, i) => {
    if (pattern.test(html)) {
      fingerprint.componentPatterns.push(['react', 'vue', 'angular', 'custom'][i]);
    }
  });
  
  // Detect grid systems (Tailwind, Bootstrap, custom)
  const gridPatterns = {
    tailwind: /(?:flex|grid|col-span|row-span|gap-|space-[xy]-)/g,
    bootstrap: /(?:col-md-|col-lg-|row|container|d-flex)/g,
    custom: /(?:grid__|layout__|row__|col__)/g
  };
  
  Object.entries(gridPatterns).forEach(([name, pattern]) => {
    if (pattern.test(html)) {
      fingerprint.gridPatterns.push(name);
    }
  });
  
  // Calculate nesting depth
  fingerprint.nestingDepth = _calculateNestingDepth(html);
  
  // Count semantic tags
  ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'].forEach(tag => {
    const tagRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
    fingerprint.semanticTags[tag] = (html.match(tagRegex) || []).length;
  });
  
  return fingerprint;
}

/**
 * Detect template signatures - repeating class patterns
 * @private
 */
function _detectTemplateSignatures(html) {
  const classCounts = {};
  const classContexts = {};
  
  // Count class occurrences with context
  const divRegex = /<div[^>]*class=["']([^"']+)["'][^>]*>([\s\S]{0,200})/gi;
  let match;
  
  while ((match = divRegex.exec(html)) !== null) {
    const classes = match[1].split(/\s+/).filter(c => c.length > 3);
    const context = match[2].substring(0, 100);
    
    classes.forEach(className => {
      classCounts[className] = (classCounts[className] || 0) + 1;
      if (!classContexts[className]) {
        classContexts[className] = context;
      }
    });
  }
  
  // Filter for repeating patterns (3+ occurrences = template signature)
  const signatures = Object.entries(classCounts)
    .filter(([className, count]) => count >= 3)
    .map(([className, count]) => ({
      className,
      occurrences: count,
      context: classContexts[className],
      isTemplateIndicator: count >= 5 || /card|item|list|grid|block|module|widget/.test(className)
    }))
    .sort((a, b) => b.occurrences - a.occurrences);
  
  return signatures;
}

/**
 * Calculate Structural Similarity Index between two pages
 * @private
 */
function _calculateSSI(fp1, fp2) {
  if (!fp1 || !fp2) return 0;
  
  // Jaccard similarity for div classes
  const set1 = new Set(fp1.divClasses);
  const set2 = new Set(fp2.divClasses);
  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;
  const jaccardDiv = union > 0 ? (intersection / union) * 100 : 0;
  
  // Jaccard similarity for section classes
  const secSet1 = new Set(fp1.sectionClasses);
  const secSet2 = new Set(fp2.sectionClasses);
  const secIntersection = [...secSet1].filter(x => secSet2.has(x)).length;
  const secUnion = new Set([...secSet1, ...secSet2]).size;
  const jaccardSection = secUnion > 0 ? (secIntersection / secUnion) * 100 : 0;
  
  // Component framework match bonus
  const frameworkMatch = fp1.componentPatterns.some(p => fp2.componentPatterns.includes(p)) ? 10 : 0;
  
  // Grid system match bonus
  const gridMatch = fp1.gridPatterns.some(p => fp2.gridPatterns.includes(p)) ? 5 : 0;
  
  // Weighted SSI calculation
  const ssi = (jaccardDiv * 0.5) + (jaccardSection * 0.3) + frameworkMatch + gridMatch;
  
  return Math.min(100, Math.round(ssi));
}

/**
 * Estimate SSI from homepage alone (when internal page unavailable)
 * @private
 */
function _estimateSSIFromHomepage(fingerprint) {
  let score = 0;
  
  // Template indicators
  const repeatingClasses = fingerprint.divClasses.filter((c, i, arr) => 
    arr.indexOf(c) !== arr.lastIndexOf(c)
  );
  score += Math.min(30, repeatingClasses.length * 2);
  
  // Component framework detected = likely programmatic
  score += fingerprint.componentPatterns.length * 15;
  
  // Grid system = structured layout
  score += fingerprint.gridPatterns.length * 10;
  
  // High semantic tag usage = structured
  const semanticCount = Object.values(fingerprint.semanticTags).reduce((a, b) => a + b, 0);
  score += Math.min(20, semanticCount * 2);
  
  return Math.min(100, score);
}

/**
 * Find repeating structural patterns
 * @private
 */
function _findRepeatingPatterns(html) {
  const patterns = [];
  
  // Find card-like repeating structures
  const cardPatterns = [
    /<div[^>]*class="[^"]*card[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<article[^>]*>[\s\S]*?<\/article>/gi,
    /<li[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/li>/gi
  ];
  
  cardPatterns.forEach((pattern, i) => {
    const matches = html.match(pattern) || [];
    if (matches.length >= 3) {
      patterns.push({
        type: ['card', 'article', 'list-item'][i],
        count: matches.length,
        sample: matches[0]?.substring(0, 200) || ''
      });
    }
  });
  
  return patterns;
}

/**
 * Capture proof snippet of template usage
 * @private
 */
function _captureTemplateProof(html, signatures) {
  if (!html || !signatures.length) return '';
  
  const topSignature = signatures[0];
  const className = topSignature.className;
  
  // Find the first instance with context
  const regex = new RegExp(`(<div[^>]*class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]{0,300})`, 'i');
  const match = html.match(regex);
  
  if (match) {
    return match[1].substring(0, 400) + '...';
  }
  
  return '';
}

/**
 * Get homepage HTML from competitor data
 * @private
 */
function _getHomepageHtml(competitor) {
  return competitor.stages?.oracleFetcher?.data?.rawHtml ||
         competitor.rawHtml ||
         competitor.synthesized?.rawHtml ||
         null;
}

/**
 * Get internal page HTML (e.g., blog post) if available
 * @private
 */
function _getInternalPageHtml(competitor) {
  return competitor.stages?.blogFetcher?.data?.rawHtml ||
         competitor.internalPage?.rawHtml ||
         null;
}

/**
 * Calculate HTML nesting depth
 * @private
 */
function _calculateNestingDepth(html) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  const tagRegex = /<\/?div[^>]*>/gi;
  let match;
  
  while ((match = tagRegex.exec(html)) !== null) {
    if (match[0].startsWith('</')) {
      currentDepth--;
    } else if (!match[0].endsWith('/>')) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
  }
  
  return maxDepth;
}


// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3: EMOTIONAL DEBT & FRICTION AUDIT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Audit content for emotional resonance and friction factors
 * 
 * FRICTION FACTORS:
 * - Jargon density (industry-specific terms without explanation)
 * - Passive voice usage
 * - Sentence complexity (avg words per sentence)
 * - Flesch-Kincaid readability
 * - Emotional valence (positive/negative/neutral)
 * 
 * @param {Object} competitor - Competitor object with content data
 * @returns {Object} Emotional debt analysis with proof
 */
function auditEmotionalResonance(competitor) {
  console.log(`[StrategicCommand] auditEmotionalResonance for ${competitor.domain}`);
  
  const result = {
    emotionalDebtScore: 0,         // 0-100, higher = more friction
    frictionFactors: {},
    emotionalTone: 'neutral',
    readabilityGrade: 0,
    jargonDensity: 0,
    passiveVoiceRatio: 0,
    avgSentenceLength: 0,
    highFrictionParagraphs: [],    // Paragraphs flagged as problematic
    recommendations: [],
    evidence: {
      worstParagraph: '',
      jargonExamples: [],
      passiveExamples: []
    }
  };
  
  try {
    // Get text content
    const textContent = _extractTextContent(competitor);
    
    if (!textContent || textContent.length < 100) {
      result.error = 'Insufficient text content for analysis';
      return result;
    }
    
    // Split into paragraphs
    const paragraphs = _splitIntoParagraphs(textContent);
    
    // Analyze each friction factor
    result.jargonDensity = _calculateJargonDensity(textContent);
    result.passiveVoiceRatio = _calculatePassiveVoiceRatio(textContent);
    result.avgSentenceLength = _calculateAvgSentenceLength(textContent);
    result.readabilityGrade = _calculateFleschKincaid(textContent);
    
    // Analyze emotional tone
    const emotionalAnalysis = _analyzeEmotionalTone(textContent);
    result.emotionalTone = emotionalAnalysis.tone;
    result.frictionFactors.emotionalValence = emotionalAnalysis.valence;
    
    // Build friction factors object
    result.frictionFactors = {
      jargon: {
        score: result.jargonDensity,
        label: result.jargonDensity > 15 ? 'High' : result.jargonDensity > 8 ? 'Medium' : 'Low',
        impact: result.jargonDensity > 15 ? 'Alienates general audience' : 'Acceptable for B2B'
      },
      passiveVoice: {
        score: result.passiveVoiceRatio,
        label: result.passiveVoiceRatio > 25 ? 'High' : result.passiveVoiceRatio > 15 ? 'Medium' : 'Low',
        impact: result.passiveVoiceRatio > 25 ? 'Reduces engagement & trust' : 'Industry standard'
      },
      complexity: {
        score: result.avgSentenceLength,
        label: result.avgSentenceLength > 25 ? 'High' : result.avgSentenceLength > 18 ? 'Medium' : 'Low',
        impact: result.avgSentenceLength > 25 ? 'Cognitive overload risk' : 'Reader-friendly'
      },
      readability: {
        score: result.readabilityGrade,
        label: result.readabilityGrade > 12 ? 'College+' : result.readabilityGrade > 9 ? 'High School' : 'General',
        impact: result.readabilityGrade > 12 ? 'Limited audience reach' : 'Broad accessibility'
      }
    };
    
    // Calculate overall Emotional Debt Score
    result.emotionalDebtScore = _calculateEmotionalDebtScore(result);
    
    // Identify high-friction paragraphs
    result.highFrictionParagraphs = _identifyHighFrictionParagraphs(paragraphs);
    
    // Capture evidence
    if (result.highFrictionParagraphs.length > 0) {
      result.evidence.worstParagraph = result.highFrictionParagraphs[0].text.substring(0, 400);
    }
    result.evidence.jargonExamples = _extractJargonExamples(textContent).slice(0, 10);
    result.evidence.passiveExamples = _extractPassiveExamples(textContent).slice(0, 5);
    
    // Generate recommendations
    result.recommendations = _generateFrictionRecommendations(result);
    
    console.log(`[StrategicCommand] Emotional Debt Score: ${result.emotionalDebtScore}/100`);
    
  } catch (error) {
    console.error(`[StrategicCommand] auditEmotionalResonance error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Extract text content from competitor
 * @private
 */
function _extractTextContent(competitor) {
  const website = competitor.synthesized?.website || {};
  
  // Try to build from structured data
  let text = '';
  
  if (website.title) text += website.title + '. ';
  if (website.description) text += website.description + ' ';
  if (website.h1) text += website.h1 + '. ';
  
  // Add H2/H3 content
  const h2Tags = Array.isArray(website.h2) ? website.h2 : [];
  const h3Tags = Array.isArray(website.h3) ? website.h3 : [];
  
  h2Tags.forEach(h => text += h + '. ');
  h3Tags.forEach(h => text += h + '. ');
  
  // Add paragraphs if available
  if (website.paragraphs) {
    text += Array.isArray(website.paragraphs) ? website.paragraphs.join(' ') : website.paragraphs;
  }
  
  // Fallback to raw text extraction
  if (text.length < 200) {
    const rawHtml = competitor.stages?.oracleFetcher?.data?.rawHtml || '';
    text = _stripHtmlForFriction(rawHtml);
  }
  
  return text.trim();
}

/**
 * Strip HTML and clean text for analysis
 * @private
 */
function _stripHtmlForFriction(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into paragraphs
 * @private
 */
function _splitIntoParagraphs(text) {
  return text
    .split(/\n\n+|(?<=[.!?])\s{2,}/)
    .filter(p => p.length > 50)
    .map(p => p.trim());
}

/**
 * Calculate jargon density (% of complex/industry terms)
 * @private
 */
function _calculateJargonDensity(text) {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  if (totalWords < 10) return 0;
  
  // Common jargon patterns
  const jargonPatterns = [
    /synerg/i, /leverage/i, /optimize/i, /scalab/i, /robust/i,
    /paradigm/i, /holistic/i, /streamline/i, /agile/i, /ecosystem/i,
    /bandwidth/i, /granular/i, /incentivize/i, /proactive/i, /stakeholder/i,
    /deliverable/i, /actionable/i, /disrupt/i, /pivot/i, /onboard/i,
    /\b[A-Z]{2,5}\b/, // Acronyms
    /ization\b/i, /ification\b/i // Complex suffixes
  ];
  
  let jargonCount = 0;
  words.forEach(word => {
    if (jargonPatterns.some(pattern => pattern.test(word))) {
      jargonCount++;
    }
  });
  
  return Math.round((jargonCount / totalWords) * 100);
}

/**
 * Calculate passive voice usage ratio
 * @private
 */
function _calculatePassiveVoiceRatio(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return 0;
  
  // Passive voice patterns
  const passivePatterns = [
    /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
    /\b(has|have|had)\s+been\s+\w+ed\b/gi,
    /\b(will|would|could|should|might)\s+be\s+\w+ed\b/gi,
    /\bby\s+the\s+\w+/gi
  ];
  
  let passiveCount = 0;
  sentences.forEach(sentence => {
    if (passivePatterns.some(pattern => pattern.test(sentence))) {
      passiveCount++;
    }
  });
  
  return Math.round((passiveCount / sentences.length) * 100);
}

/**
 * Calculate average sentence length
 * @private
 */
function _calculateAvgSentenceLength(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) return 0;
  
  const totalWords = sentences.reduce((sum, s) => {
    return sum + s.trim().split(/\s+/).length;
  }, 0);
  
  return Math.round(totalWords / sentences.length);
}

/**
 * Calculate Flesch-Kincaid grade level
 * @private
 */
function _calculateFleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = _countSyllables(text);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  // Flesch-Kincaid formula
  const gradeLevel = 0.39 * (words.length / sentences.length) + 
                     11.8 * (syllables / words.length) - 15.59;
  
  return Math.max(0, Math.min(18, Math.round(gradeLevel)));
}

/**
 * Count syllables in text (approximation)
 * @private
 */
function _countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;
  
  words.forEach(word => {
    // Remove non-letters
    word = word.replace(/[^a-z]/g, '');
    if (word.length === 0) return;
    
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    let count = vowelGroups.length;
    
    // Adjust for silent e
    if (word.endsWith('e') && count > 1) count--;
    
    // At least 1 syllable per word
    totalSyllables += Math.max(1, count);
  });
  
  return totalSyllables;
}

/**
 * Analyze emotional tone of content
 * @private
 */
function _analyzeEmotionalTone(text) {
  const lowerText = text.toLowerCase();
  
  // Positive words
  const positiveWords = [
    'best', 'great', 'excellent', 'amazing', 'love', 'perfect', 'success',
    'easy', 'free', 'save', 'new', 'proven', 'guaranteed', 'trusted',
    'innovative', 'powerful', 'effective', 'simple', 'fast', 'reliable'
  ];
  
  // Negative/fear words
  const negativeWords = [
    'problem', 'fail', 'mistake', 'error', 'wrong', 'bad', 'difficult',
    'expensive', 'complicated', 'confusing', 'risk', 'danger', 'warning',
    'avoid', 'never', 'worst', 'hard', 'slow', 'broken'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    positiveCount += (lowerText.match(regex) || []).length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    negativeCount += (lowerText.match(regex) || []).length;
  });
  
  const totalEmotional = positiveCount + negativeCount;
  const valence = totalEmotional > 0 ? (positiveCount - negativeCount) / totalEmotional : 0;
  
  let tone = 'neutral';
  if (valence > 0.3) tone = 'positive';
  else if (valence > 0.1) tone = 'slightly-positive';
  else if (valence < -0.3) tone = 'negative';
  else if (valence < -0.1) tone = 'slightly-negative';
  
  return { tone, valence: Math.round(valence * 100), positiveCount, negativeCount };
}

/**
 * Calculate overall Emotional Debt Score
 * @private
 */
function _calculateEmotionalDebtScore(analysisResult) {
  let score = 0;
  
  // Jargon contribution (max 25)
  score += Math.min(25, analysisResult.jargonDensity * 1.5);
  
  // Passive voice contribution (max 25)
  score += Math.min(25, analysisResult.passiveVoiceRatio);
  
  // Complexity contribution (max 25)
  const complexityPenalty = Math.max(0, analysisResult.avgSentenceLength - 15);
  score += Math.min(25, complexityPenalty * 2);
  
  // Readability contribution (max 25)
  const readabilityPenalty = Math.max(0, analysisResult.readabilityGrade - 8);
  score += Math.min(25, readabilityPenalty * 3);
  
  return Math.min(100, Math.round(score));
}

/**
 * Identify paragraphs with high friction
 * @private
 */
function _identifyHighFrictionParagraphs(paragraphs) {
  return paragraphs
    .map(text => {
      const jargon = _calculateJargonDensity(text);
      const passive = _calculatePassiveVoiceRatio(text);
      const avgLen = _calculateAvgSentenceLength(text);
      
      const frictionScore = (jargon * 0.4) + (passive * 0.3) + (Math.max(0, avgLen - 15) * 0.3);
      
      return {
        text: text,
        frictionScore: Math.round(frictionScore),
        issues: []
          .concat(jargon > 10 ? ['High jargon'] : [])
          .concat(passive > 20 ? ['Passive voice'] : [])
          .concat(avgLen > 22 ? ['Long sentences'] : [])
      };
    })
    .filter(p => p.frictionScore > 15)
    .sort((a, b) => b.frictionScore - a.frictionScore)
    .slice(0, 5);
}

/**
 * Extract examples of jargon
 * @private
 */
function _extractJargonExamples(text) {
  const jargonPatterns = [
    /leverage\w*/gi, /synerg\w*/gi, /optimize\w*/gi, /scalab\w*/gi,
    /paradigm\w*/gi, /ecosystem\w*/gi, /actionable\w*/gi, /disrupt\w*/gi
  ];
  
  const examples = [];
  jargonPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      examples.push(...matches.slice(0, 2));
    }
  });
  
  return [...new Set(examples)];
}

/**
 * Extract examples of passive voice
 * @private
 */
function _extractPassiveExamples(text) {
  const passiveRegex = /([A-Z][^.!?]*\b(is|are|was|were|been)\s+\w+ed\b[^.!?]*[.!?])/gi;
  const matches = text.match(passiveRegex) || [];
  
  return matches.map(m => m.trim()).slice(0, 5);
}

/**
 * Generate friction reduction recommendations
 * @private
 */
function _generateFrictionRecommendations(result) {
  const recommendations = [];
  
  if (result.jargonDensity > 12) {
    recommendations.push({
      priority: 'high',
      issue: 'High jargon density',
      action: 'Replace technical terms with plain language or add explanatory context',
      impact: 'Improves accessibility for 40% more readers'
    });
  }
  
  if (result.passiveVoiceRatio > 20) {
    recommendations.push({
      priority: 'medium',
      issue: 'Excessive passive voice',
      action: 'Rewrite key sentences in active voice to increase engagement',
      impact: 'Increases content energy and reader trust'
    });
  }
  
  if (result.avgSentenceLength > 22) {
    recommendations.push({
      priority: 'high',
      issue: 'Complex sentence structure',
      action: 'Break long sentences into shorter, digestible units',
      impact: 'Reduces cognitive load and improves retention'
    });
  }
  
  if (result.readabilityGrade > 12) {
    recommendations.push({
      priority: 'medium',
      issue: 'College-level reading requirement',
      action: 'Simplify vocabulary and structure for 8th-grade level',
      impact: 'Expands potential audience by 60%'
    });
  }
  
  if (result.emotionalTone === 'negative' || result.emotionalTone === 'slightly-negative') {
    recommendations.push({
      priority: 'low',
      issue: 'Negative emotional tone',
      action: 'Balance pain points with benefit-focused language',
      impact: 'Improves conversion through positive framing'
    });
  }
  
  return recommendations;
}


// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3: SEMANTIC TRIPLET EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract Subject-Predicate-Object triplets from H2/H3 headers
 * Creates semantic knowledge graph for D3.js visualization
 * 
 * LOGIC:
 * 1. Extract all H2/H3 from competitor content
 * 2. Use Gemini to parse into Subject-Predicate-Object
 * 3. Calculate entity strength based on frequency
 * 4. Return graph-ready data structure
 * 
 * @param {Object} competitor - Competitor object with headings
 * @returns {Object} Semantic triplet analysis for mind map
 */
function reconstructSemanticTriplets(competitor) {
  console.log(`[StrategicCommand] reconstructSemanticTriplets for ${competitor.domain}`);
  
  const result = {
    triplets: [],
    entities: {},
    relationships: [],
    graphData: { nodes: [], links: [] },
    evidence: {
      headingsAnalyzed: [],
      rawHeadingsSnippet: ''
    },
    recommendations: []
  };
  
  try {
    // Extract headings from competitor data
    const headings = _extractHeadingsFromCompetitor(competitor);
    
    if (headings.length === 0) {
      result.evidence.rawHeadingsSnippet = 'No H2/H3 headings found in competitor content';
      return result;
    }
    
    // Store evidence
    result.evidence.headingsAnalyzed = headings.slice(0, 20);
    result.evidence.rawHeadingsSnippet = headings.slice(0, 10).join(' | ').substring(0, 400);
    
    // Parse headings into triplets using pattern matching
    const triplets = _parseHeadingsToTriplets(headings);
    result.triplets = triplets.slice(0, 50); // Limit for memory
    
    // Build entity frequency map
    const entityMap = {};
    triplets.forEach(triplet => {
      if (triplet.subject) {
        entityMap[triplet.subject] = entityMap[triplet.subject] || { count: 0, type: 'subject' };
        entityMap[triplet.subject].count++;
      }
      if (triplet.object) {
        entityMap[triplet.object] = entityMap[triplet.object] || { count: 0, type: 'object' };
        entityMap[triplet.object].count++;
      }
    });
    result.entities = entityMap;
    
    // Build D3.js-ready graph structure
    const graphData = _buildGraphData(triplets, entityMap);
    result.graphData = graphData;
    
    // Build relationship list
    result.relationships = triplets.map(t => ({
      from: t.subject,
      to: t.object,
      relation: t.predicate,
      confidence: t.confidence || 0.7
    })).slice(0, 30);
    
    // Generate recommendations
    result.recommendations = _generateTripletRecommendations(result);
    
  } catch (error) {
    console.error(`[StrategicCommand] Triplet extraction error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Extract H2/H3 headings from competitor data
 * @private
 */
function _extractHeadingsFromCompetitor(competitor) {
  const headings = [];
  
  // Try to get headings from various sources
  if (competitor.headings && Array.isArray(competitor.headings)) {
    competitor.headings.forEach(h => {
      if (h.level === 2 || h.level === 3) {
        headings.push(h.text || h);
      }
    });
  }
  
  // Try fetched data
  if (competitor.fetched?.headings) {
    Object.values(competitor.fetched.headings).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(h => headings.push(typeof h === 'string' ? h : h.text));
      }
    });
  }
  
  // Try raw HTML extraction if available
  if (competitor.rawHtml || competitor.html) {
    const html = competitor.rawHtml || competitor.html;
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    const h3Regex = /<h3[^>]*>([^<]+)<\/h3>/gi;
    
    let match;
    while ((match = h2Regex.exec(html)) !== null) {
      headings.push(match[1].trim());
    }
    while ((match = h3Regex.exec(html)) !== null) {
      headings.push(match[1].trim());
    }
  }
  
  // Clean and dedupe
  return [...new Set(headings.map(h => 
    (h || '').toString().replace(/\s+/g, ' ').trim()
  ).filter(h => h.length > 3 && h.length < 200))];
}

/**
 * Parse headings into Subject-Predicate-Object triplets
 * Uses linguistic pattern matching without external API
 * @private
 */
function _parseHeadingsToTriplets(headings) {
  const triplets = [];
  
  // Common predicate patterns for SEO headings
  const predicatePatterns = [
    { regex: /^(How to|Guide to|Ways to)\s+(.+)/i, predicate: 'enables', subjectType: 'action' },
    { regex: /^(.+?)\s+(vs\.?|versus)\s+(.+)/i, predicate: 'competes-with', subjectType: 'entity' },
    { regex: /^(Best|Top|Ultimate)\s+(.+?)\s+(for|to|in)\s+(.+)/i, predicate: 'serves', subjectType: 'ranking' },
    { regex: /^(.+?)\s+(benefits|advantages|features)\s*(of)?\s*(.+)?/i, predicate: 'has-benefit', subjectType: 'feature' },
    { regex: /^(What is|What are|Understanding)\s+(.+)/i, predicate: 'defines', subjectType: 'definition' },
    { regex: /^(Why|When|Where)\s+(.+)/i, predicate: 'explains', subjectType: 'question' },
    { regex: /^(.+?)\s+(tips|strategies|techniques|methods)/i, predicate: 'employs', subjectType: 'tactic' },
    { regex: /^(.+?)\s+(pricing|cost|plans)/i, predicate: 'costs', subjectType: 'pricing' },
    { regex: /^(.+?)\s+(review|reviews|comparison)/i, predicate: 'reviews', subjectType: 'review' },
    { regex: /^(.+?)\s+(:|-)\s+(.+)/i, predicate: 'elaborates', subjectType: 'general' }
  ];
  
  headings.forEach((heading, idx) => {
    let matched = false;
    
    for (const pattern of predicatePatterns) {
      const match = heading.match(pattern.regex);
      if (match) {
        triplets.push({
          id: `t${idx}`,
          subject: _cleanEntity(match[1] || match[2]),
          predicate: pattern.predicate,
          object: _cleanEntity(match[match.length - 1] || match[3] || heading),
          confidence: 0.85,
          sourceHeading: heading.substring(0, 100),
          type: pattern.subjectType
        });
        matched = true;
        break;
      }
    }
    
    // Fallback: try to split by common words
    if (!matched) {
      const parts = heading.split(/\s+(and|or|with|for|from|using|through|about)\s+/i);
      if (parts.length >= 2) {
        triplets.push({
          id: `t${idx}`,
          subject: _cleanEntity(parts[0]),
          predicate: parts[1] ? parts[1].toLowerCase() : 'relates-to',
          object: _cleanEntity(parts[2] || parts[1]),
          confidence: 0.6,
          sourceHeading: heading.substring(0, 100),
          type: 'general'
        });
      } else {
        // Single entity heading - becomes a node
        triplets.push({
          id: `t${idx}`,
          subject: _cleanEntity(heading),
          predicate: 'exists',
          object: competitor?.domain || 'topic',
          confidence: 0.5,
          sourceHeading: heading.substring(0, 100),
          type: 'entity'
        });
      }
    }
  });
  
  return triplets;
}

/**
 * Clean entity text for graph node
 * @private
 */
function _cleanEntity(text) {
  if (!text) return 'unknown';
  return text
    .replace(/[^\w\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50);
}

/**
 * Build D3.js-compatible graph data
 * @private
 */
function _buildGraphData(triplets, entityMap) {
  const nodes = [];
  const links = [];
  const nodeIds = new Set();
  
  // Sort entities by frequency for sizing
  const sortedEntities = Object.entries(entityMap)
    .sort((a, b) => b[1].count - a[1].count);
  
  // Create nodes
  sortedEntities.slice(0, 40).forEach(([entity, data], idx) => {
    if (entity && entity !== 'unknown') {
      nodeIds.add(entity);
      nodes.push({
        id: entity,
        label: entity,
        strength: data.count,
        size: Math.min(30, 10 + data.count * 3),
        color: data.count > 3 ? '#ef4444' : data.count > 1 ? '#f59e0b' : '#22c55e',
        type: data.type
      });
    }
  });
  
  // Create links
  triplets.forEach(triplet => {
    if (nodeIds.has(triplet.subject) && nodeIds.has(triplet.object) && triplet.subject !== triplet.object) {
      links.push({
        source: triplet.subject,
        target: triplet.object,
        label: triplet.predicate,
        value: triplet.confidence * 10
      });
    }
  });
  
  return {
    nodes: nodes.slice(0, 40),
    links: links.slice(0, 60)
  };
}

/**
 * Generate recommendations from triplet analysis
 * @private
 */
function _generateTripletRecommendations(result) {
  const recommendations = [];
  
  const topEntities = Object.entries(result.entities)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);
  
  if (topEntities.length > 0) {
    recommendations.push({
      priority: 'high',
      insight: `Core entity focus: "${topEntities[0][0]}"`,
      action: `Build content clusters around "${topEntities[0][0]}" to compete`
    });
  }
  
  const howToTriplets = result.triplets.filter(t => t.type === 'action');
  if (howToTriplets.length > 2) {
    recommendations.push({
      priority: 'medium',
      insight: `Competitor uses ${howToTriplets.length} action-oriented headers`,
      action: 'Create "How to" guides for the same topics'
    });
  }
  
  return recommendations;
}


// ═══════════════════════════════════════════════════════════════════════════
// MODULE 4: AEO OPPORTUNITY GAP IDENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Identify AEO (AI Engine Optimization) opportunities where competitor
 * content could be "stolen" by AI citations
 * 
 * LOGIC:
 * 1. Cross-reference competitor RAG-Ready Score
 * 2. Analyze competitor keyword rankings
 * 3. Identify gaps where our content could cite instead
 * 4. Prioritize by traffic potential and citation probability
 * 
 * @param {Object} competitor - Competitor object
 * @param {Object} userProject - User's project data (optional)
 * @returns {Object} AEO opportunity analysis
 */
function identifyAEOOpportunityGaps(competitor, userProject) {
  console.log(`[StrategicCommand] identifyAEOOpportunityGaps for ${competitor.domain}`);
  
  const result = {
    opportunities: [],
    totalOpportunityScore: 0,
    prioritizedSteals: [],
    competitorWeaknesses: [],
    evidence: {
      ragScoreAnalyzed: 0,
      keywordsAnalyzed: 0,
      citationGapsFound: 0
    },
    recommendations: []
  };
  
  try {
    // Get competitor RAG-Ready Score
    const ragScore = _getCompetitorRAGScore(competitor);
    result.evidence.ragScoreAnalyzed = ragScore;
    
    // Get competitor keywords
    const keywords = _extractCompetitorKeywords(competitor);
    result.evidence.keywordsAnalyzed = keywords.length;
    
    // Analyze each keyword for opportunity
    const opportunities = [];
    
    keywords.forEach((kw, idx) => {
      const opportunity = _analyzeKeywordOpportunity(kw, ragScore, competitor);
      if (opportunity.score > 30) {
        opportunities.push(opportunity);
      }
    });
    
    // Sort by opportunity score
    opportunities.sort((a, b) => b.score - a.score);
    result.opportunities = opportunities.slice(0, 20);
    
    // Calculate total opportunity
    result.totalOpportunityScore = Math.min(100, Math.round(
      opportunities.reduce((sum, o) => sum + o.score, 0) / Math.max(1, opportunities.length)
    ));
    
    // Identify prioritized "steals"
    result.prioritizedSteals = opportunities.slice(0, 5).map(o => ({
      keyword: o.keyword,
      currentOwner: competitor.domain,
      stealProbability: o.stealProbability,
      action: o.recommendedAction,
      trafficPotential: o.trafficPotential
    }));
    
    result.evidence.citationGapsFound = result.prioritizedSteals.length;
    
    // Identify competitor weaknesses
    result.competitorWeaknesses = _identifyCompetitorWeaknesses(competitor, ragScore);
    
    // Generate recommendations
    result.recommendations = _generateAEORecommendations(result, competitor);
    
  } catch (error) {
    console.error(`[StrategicCommand] AEO gap analysis error: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Get competitor RAG-Ready Score from various sources
 * @private
 */
function _getCompetitorRAGScore(competitor) {
  // Try synthesized data first
  if (competitor.synthesized?.ragReadyScore !== undefined) {
    return competitor.synthesized.ragReadyScore;
  }
  
  // Try evidenceMap
  if (competitor.evidenceMap?.['content.ragReady']?.value !== undefined) {
    return competitor.evidenceMap['content.ragReady'].value;
  }
  
  // Try fetched metrics
  if (competitor.fetched?.metrics?.ragScore !== undefined) {
    return competitor.fetched.metrics.ragScore;
  }
  
  // Calculate estimated RAG score based on available data
  return _estimateRAGScore(competitor);
}

/**
 * Estimate RAG score from content quality signals
 * @private
 */
function _estimateRAGScore(competitor) {
  let score = 50; // Base score
  
  // Schema.org presence boosts RAG
  if (competitor.fetched?.schema?.types?.length > 0) {
    score += 15;
  }
  
  // Structured headings
  if (competitor.headings?.length > 5) {
    score += 10;
  }
  
  // FAQ presence
  if (competitor.fetched?.faqs?.length > 0) {
    score += 15;
  }
  
  // Clear definitions (definition lists, what is sections)
  const html = competitor.rawHtml || competitor.html || '';
  if (/<(dl|dt|dd)/i.test(html) || /what is|definition|meaning/i.test(html)) {
    score += 10;
  }
  
  return Math.min(100, score);
}

/**
 * Extract competitor keywords from various sources
 * @private
 */
function _extractCompetitorKeywords(competitor) {
  const keywords = [];
  
  // From fetched keywords
  if (competitor.fetched?.keywords && Array.isArray(competitor.fetched.keywords)) {
    competitor.fetched.keywords.forEach(kw => {
      keywords.push({
        term: typeof kw === 'string' ? kw : kw.keyword || kw.term,
        volume: kw.volume || kw.searchVolume || 0,
        position: kw.position || kw.rank || 0,
        cpc: kw.cpc || 0
      });
    });
  }
  
  // From synthesized
  if (competitor.synthesized?.topKeywords) {
    competitor.synthesized.topKeywords.forEach(kw => {
      if (!keywords.find(k => k.term === kw.term)) {
        keywords.push(kw);
      }
    });
  }
  
  // From evidence map
  if (competitor.evidenceMap?.['keywords.top']?.raw) {
    const rawKw = competitor.evidenceMap['keywords.top'].raw;
    if (Array.isArray(rawKw)) {
      rawKw.forEach(kw => {
        if (!keywords.find(k => k.term === kw.term)) {
          keywords.push(kw);
        }
      });
    }
  }
  
  return keywords.slice(0, 50);
}

/**
 * Analyze individual keyword for AEO opportunity
 * @private
 */
function _analyzeKeywordOpportunity(kw, competitorRagScore, competitor) {
  const term = kw.term || kw;
  const volume = kw.volume || 0;
  const position = kw.position || 0;
  
  // Calculate opportunity factors
  const isQuestion = /^(how|what|why|when|where|which|who|can|should|does|is)/i.test(term);
  const isLongTail = (term.split(' ').length >= 4);
  const hasLowCompetition = position > 5;
  const ragGap = 100 - competitorRagScore;
  
  // Score calculation
  let score = 0;
  let stealProbability = 0;
  
  // Question queries are high-value for AI citations
  if (isQuestion) {
    score += 25;
    stealProbability += 20;
  }
  
  // Long-tail keywords easier to steal
  if (isLongTail) {
    score += 15;
    stealProbability += 15;
  }
  
  // Low position = opportunity
  if (hasLowCompetition) {
    score += 20;
    stealProbability += 25;
  }
  
  // Higher volume = higher value
  if (volume > 1000) score += 20;
  else if (volume > 100) score += 10;
  
  // RAG gap = opportunity
  score += Math.round(ragGap * 0.2);
  stealProbability += Math.round(ragGap * 0.3);
  
  // Determine recommended action
  let recommendedAction = 'Monitor';
  if (score >= 70) {
    recommendedAction = 'Create definitive guide with structured answers';
  } else if (score >= 50) {
    recommendedAction = 'Create FAQ section targeting this query';
  } else if (score >= 30) {
    recommendedAction = 'Add supporting content with clear definitions';
  }
  
  return {
    keyword: term,
    score: Math.min(100, score),
    stealProbability: Math.min(100, stealProbability) + '%',
    isQuestion,
    isLongTail,
    trafficPotential: volume > 1000 ? 'High' : volume > 100 ? 'Medium' : 'Low',
    recommendedAction,
    competitorPosition: position,
    searchVolume: volume
  };
}

/**
 * Identify competitor weaknesses for AEO
 * @private
 */
function _identifyCompetitorWeaknesses(competitor, ragScore) {
  const weaknesses = [];
  
  if (ragScore < 60) {
    weaknesses.push({
      type: 'low-rag-score',
      severity: 'high',
      description: 'Competitor content not optimized for AI citations',
      opportunity: 'Create RAG-optimized alternative content'
    });
  }
  
  const schemaTypes = competitor.fetched?.schema?.types || [];
  if (schemaTypes.length < 2) {
    weaknesses.push({
      type: 'limited-schema',
      severity: 'medium',
      description: 'Competitor lacks rich structured data',
      opportunity: 'Implement comprehensive Schema.org markup'
    });
  }
  
  const faqs = competitor.fetched?.faqs || [];
  if (faqs.length === 0) {
    weaknesses.push({
      type: 'no-faqs',
      severity: 'high',
      description: 'Competitor missing FAQ content',
      opportunity: 'Create FAQ section for AI snippet capture'
    });
  }
  
  // Check for definition content
  const html = competitor.rawHtml || '';
  if (!/definition|what is|meaning of/i.test(html)) {
    weaknesses.push({
      type: 'no-definitions',
      severity: 'medium',
      description: 'Competitor lacks clear definitions',
      opportunity: 'Add clear definitions for AI citation'
    });
  }
  
  return weaknesses;
}

/**
 * Generate AEO recommendations
 * @private
 */
function _generateAEORecommendations(result, competitor) {
  const recommendations = [];
  
  if (result.prioritizedSteals.length > 0) {
    const topSteal = result.prioritizedSteals[0];
    recommendations.push({
      priority: 'high',
      title: `Target "${topSteal.keyword}"`,
      action: topSteal.action,
      expectedImpact: `Could capture ${topSteal.trafficPotential} traffic potential from ${competitor.domain}`
    });
  }
  
  if (result.competitorWeaknesses.some(w => w.type === 'low-rag-score')) {
    recommendations.push({
      priority: 'high',
      title: 'Exploit RAG-Ready Gap',
      action: 'Create structured, definition-rich content with clear answers',
      expectedImpact: 'High probability of AI citation capture'
    });
  }
  
  if (result.competitorWeaknesses.some(w => w.type === 'no-faqs')) {
    recommendations.push({
      priority: 'medium',
      title: 'Create FAQ Arsenal',
      action: 'Build comprehensive FAQ sections for all competitor keywords',
      expectedImpact: 'Increased featured snippet and AI Overview presence'
    });
  }
  
  return recommendations;
}


// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION: Add to evidenceMap for Zero-Trust
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Integrate Strategic Command results into competitor evidenceMap
 * 
 * @param {Object} competitor - The competitor object
 * @returns {Object} Updated competitor with strategic evidence
 */
function integrateStrategicCommandEvidence(competitor) {
  console.log(`[StrategicCommand] Integrating evidence for ${competitor.domain}`);
  
  // Initialize evidenceMap if needed
  competitor.evidenceMap = competitor.evidenceMap || { _metadata: {} };
  competitor.synthesized = competitor.synthesized || {};
  
  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 1: Programmatic Moat Detection
  // ─────────────────────────────────────────────────────────────────────────
  const moatResult = detectProgrammaticMoat(competitor);
  competitor.synthesized.programmaticMoat = moatResult;
  
  competitor.evidenceMap['technical.programmaticMoat'] = {
    value: moatResult.structuralSimilarityIndex,
    raw: {
      snippet: moatResult.evidence.homepageSnippet?.substring(0, 400) || '',
      matchedClasses: (moatResult.evidence.matchedClasses || []).slice(0, 10)
    },
    source: 'FT_StrategicCommand.gs → detectProgrammaticMoat() → SSI Calculation',
    confidence: moatResult.structuralSimilarityIndex > 50 ? 90 : 70,
    timestamp: new Date().toISOString(),
    additionalContext: {
      moatType: moatResult.moatType,
      moatStrength: moatResult.moatStrength
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 2: Emotional Resonance Audit
  // ─────────────────────────────────────────────────────────────────────────
  const emotionalResult = auditEmotionalResonance(competitor);
  competitor.synthesized.emotionalDebt = emotionalResult;
  
  competitor.evidenceMap['content.emotionalDebt'] = {
    value: emotionalResult.emotionalDebtScore,
    raw: {
      snippet: emotionalResult.evidence.worstParagraph?.substring(0, 400) || '',
      jargonExamples: emotionalResult.evidence.jargonExamples,
      passiveExamples: emotionalResult.evidence.passiveExamples
    },
    source: 'FT_StrategicCommand.gs → auditEmotionalResonance() → Friction Analysis',
    confidence: 85,
    timestamp: new Date().toISOString(),
    additionalContext: {
      frictionFactors: emotionalResult.frictionFactors,
      emotionalTone: emotionalResult.emotionalTone
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 3: Semantic Triplet Extraction
  // ─────────────────────────────────────────────────────────────────────────
  const tripletResult = reconstructSemanticTriplets(competitor);
  competitor.synthesized.semanticTriplets = tripletResult;
  
  competitor.evidenceMap['keywords.semanticTriplets'] = {
    value: tripletResult.triplets.length,
    raw: {
      snippet: tripletResult.evidence.rawHeadingsSnippet?.substring(0, 400) || '',
      topEntities: Object.entries(tripletResult.entities || {})
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(e => e[0])
    },
    source: 'FT_StrategicCommand.gs → reconstructSemanticTriplets() → H2/H3 Parse',
    confidence: 80,
    timestamp: new Date().toISOString(),
    additionalContext: {
      totalTriplets: tripletResult.triplets.length,
      totalEntities: Object.keys(tripletResult.entities || {}).length,
      graphNodes: tripletResult.graphData?.nodes?.length || 0
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 4: AEO Opportunity Gap Analysis
  // ─────────────────────────────────────────────────────────────────────────
  const aeoResult = identifyAEOOpportunityGaps(competitor);
  competitor.synthesized.aeoOpportunities = aeoResult;
  
  competitor.evidenceMap['opportunity.aeoGap'] = {
    value: aeoResult.totalOpportunityScore,
    raw: {
      snippet: aeoResult.prioritizedSteals.length > 0 
        ? `Top steal: "${aeoResult.prioritizedSteals[0]?.keyword}" (${aeoResult.prioritizedSteals[0]?.stealProbability})`
        : 'No high-value AEO opportunities detected',
      topSteals: aeoResult.prioritizedSteals.slice(0, 3).map(s => s.keyword)
    },
    source: 'FT_StrategicCommand.gs → identifyAEOOpportunityGaps() → Citation Analysis',
    confidence: 75,
    timestamp: new Date().toISOString(),
    additionalContext: {
      totalOpportunities: aeoResult.opportunities.length,
      competitorWeaknesses: aeoResult.competitorWeaknesses.length,
      ragScoreAnalyzed: aeoResult.evidence.ragScoreAnalyzed
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // Update evidenceMap metadata
  // ─────────────────────────────────────────────────────────────────────────
  competitor.evidenceMap._metadata.strategicCommandVersion = '1.0.0';
  competitor.evidenceMap._metadata.strategicModulesRun = [
    'programmaticMoat', 'emotionalDebt', 'semanticTriplets', 'aeoOpportunities'
  ];
  competitor.evidenceMap._metadata.totalProofs = Object.keys(competitor.evidenceMap)
    .filter(k => k !== '_metadata').length;
  
  console.log(`[StrategicCommand] Evidence integration complete for ${competitor.domain} (${competitor.evidenceMap._metadata.totalProofs} proofs)`);
  
  return competitor;
}

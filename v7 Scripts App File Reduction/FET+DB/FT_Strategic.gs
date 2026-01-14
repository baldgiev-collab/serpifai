/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Strategic.gs - Strategic Analysis & Kill Moves Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ELITE v12.0 - Strategic Analysis Functions
 * CEO-Level Kill Moves, Disruptability Scoring, Strategic Helpers
 * 
 * DEPENDENCIES:
 * - FT_Helpers.gs (shared utilities)
 * - FT_Proofs.gs (proof extraction functions)
 * 
 * KEY FUNCTIONS:
 * - _generateStrategicHoverInsights() - Strategic tooltips for all tabs
 * - _generateCEOKillMoves() - CEO-level strategic moves
 * - _generateDisruptabilityScoring() - Disruptability engine
 * - Various helper functions for forensic analysis
 * 
 * EXTRACTED FROM: FT_CompetitorKW_Fetcher.gs (Lines 9831-10863)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Generate Strategic Hover Insights for all tabs
 */
function _generateStrategicHoverInsights(niche) {
  return {
    contentStrategy: {
      semanticDensity: 'Information value per word. High density = content that AI and humans cite.',
      freshnessGap: 'Outdated incumbent content = opportunity for fresh, dated alternatives.',
      topicalCoverage: 'Breadth of topic coverage. Gaps indicate content opportunities.'
    },
    contentOperations: {
      technicalDebt: 'Old infrastructure limiting performance. High debt = easy to outperform.',
      pseoAnalysis: 'Programmatic pages vulnerable to algorithm updates.',
      eeatScore: 'Experience, Expertise, Authority, Trust - critical for YMYL niches.'
    },
    conversionMonetization: {
      obfuscationDepth: 'How deeply affiliate links are hidden. Indicates commission protection tactics.',
      shadowFunnels: 'Hidden conversion paths (Telegram, Push). Bypass attribution.',
      timeToValue: 'Clicks to verify value. Lower = higher conversion rates.',
      affiliateMasking: 'Link cloaking techniques to protect commission attribution.'
    },
    distributionVisibility: {
      referralEfficiency: 'Traffic per referring domain. High = clean authority.',
      darkSocial: 'Untrackable traffic from messaging apps.',
      socialSEO: 'Brand search traffic vs generic keyword traffic.'
    },
    audienceIntelligence: {
      emotionalDebt: 'User distrust toward incumbent. Higher = easier to steal users.',
      personaType: 'Vigilante vs Corporate positioning affects trust signals.',
      jtbdMatch: 'How well content addresses user struggles and jobs-to-be-done.',
      cognitiveLoad: 'Decision friction. High load = users abandon before converting.'
    },
    geoAeo: {
      ragReadyScore: 'How easily AI assistants can extract and cite your content.',
      schemaStrategy: 'Structured data for rich results and AI extraction.',
      aiVisibility: 'Probability of appearing in Google AI Overviews and Perplexity answers.',
      kgOptimization: 'Knowledge Graph readiness based on entity-relationship clarity.'
    }
  };
}

/**
 * Generate CEO-Level Kill Moves
 */
function _generateCEOKillMoves(competitors, gemini, niche) {
  const killMoves = [];
  
  competitors.slice(0, 4).forEach(c => {
    const profile = c.forensicProfile || {};
    
    if (profile.emotionalDebt > 60) {
      killMoves.push({
        target: c.domain,
        vulnerability: 'High Emotional Debt',
        killMove: 'Position as community-first alternative. Use authentic voice, show faces, share failures.',
        estimatedImpact: 'Steal 15-25% of their traffic within 6 months',
        investmentRequired: 'Medium',
        priority: 'HIGH'
      });
    }
    
    if (profile.pseoLevel === 'Extreme') {
      killMoves.push({
        target: c.domain,
        vulnerability: 'PSEO Dependency',
        killMove: 'Create hand-crafted expert content on their top 100 template pages.',
        estimatedImpact: 'Outrank on high-value keywords',
        investmentRequired: 'High (Content Team)',
        priority: 'HIGH'
      });
    }
    
    if (profile.persona === 'Corporate' || profile.persona === 'Legacy Player') {
      killMoves.push({
        target: c.domain,
        vulnerability: 'Corporate Inertia',
        killMove: 'Move faster with modern tech stack. Weekly content updates vs monthly.',
        estimatedImpact: 'Capture freshness-sensitive traffic',
        investmentRequired: 'Low',
        priority: 'MEDIUM'
      });
    }
  });
  
  return killMoves;
}

/**
 * Generate Disruptability Scoring Engine
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateDisruptabilityScoring(competitors, niche) {
  return {
    scoringWeights: {
      aeoGeoReadiness: { weight: 25, description: 'How easily AI can extract facts from the page' },
      emotionalDebt: { weight: 20, description: 'User distrust toward incumbent - higher = easier to disrupt' },
      referralEfficiency: { weight: 20, description: 'Traffic per referring domain - high = hard to beat' },
      timeToValue: { weight: 15, description: 'Clicks required to verify value - lower = better UX' },
      technicalDebt: { weight: 10, description: 'Infrastructure age - high debt = vulnerable' },
      pseoVulnerability: { weight: 10, description: 'Dependency on programmatic content' }
    },
    competitorScores: competitors.slice(0, 6).map(c => {
      const profile = c.forensicProfile || {};
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      const openPageRank = apiData.openPageRank || {};
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const schemaProof = detailedProofs.schema;
      const headingsProof = detailedProofs.headings;
      const cwvProof = detailedProofs.cwv;
      const linksProof = detailedProofs.links;
      
      const schemaTypes = website.schemaTypes || [];
      const hasFAQ = schemaTypes.some(s => s.toLowerCase().includes('faq'));
      const hasHowTo = schemaTypes.some(s => s.toLowerCase().includes('howto'));
      
      let aeoScore = 30;
      if (hasFAQ) aeoScore += 25;
      if (hasHowTo) aeoScore += 15;
      if (schemaTypes.length >= 3) aeoScore += 10;
      aeoScore = Math.min(95, aeoScore);
      
      const fullText = JSON.stringify(synth).toLowerCase();
      let debtScore = 50;
      if (!fullText.includes('guarantee') && !fullText.includes('certified')) debtScore += 15;
      if (!fullText.includes('reviews') && !fullText.includes('testimonial')) debtScore += 10;
      if (fullText.includes('affiliate') || fullText.includes('sponsored')) debtScore += 10;
      debtScore = Math.min(90, debtScore);
      
      const pageRank = openPageRank.page_rank_decimal || 0;
      const refScore = Math.min(95, 30 + (pageRank * 10));
      
      const ctaPatterns = ['sign up', 'get started', 'try free', 'buy now', 'start now'];
      const ctaCount = ctaPatterns.filter(p => fullText.includes(p)).length;
      const ttvScore = Math.min(95, 40 + (ctaCount * 10));
      
      const perfScore = pageSpeed.scores?.performance || 50;
      const techDebt = Math.max(10, 100 - perfScore);
      
      const h2Count = headingsProof.rawData.h2.length;
      const wordCount = website.wordCount || 0;
      let pseoVuln = 30;
      if (h2Count > 15) pseoVuln += 20;
      if (wordCount < 500) pseoVuln += 25;
      if (fullText.includes('best') && fullText.includes('vs')) pseoVuln += 15;
      pseoVuln = Math.min(90, pseoVuln);
      
      const disruptabilityScore = Math.round(
        (aeoScore * 0.25) + (debtScore * 0.20) + ((100 - refScore) * 0.20) + 
        ((100 - ttvScore) * 0.15) + (techDebt * 0.10) + (pseoVuln * 0.10)
      );
      
      return {
        domain: c.domain || 'unknown',
        disruptabilityScore: disruptabilityScore,
        disruptabilityLevel: disruptabilityScore > 65 ? 'HIGH - Attack Priority' : 
                            disruptabilityScore > 45 ? 'MEDIUM - Selective Attack' : 
                            'LOW - Avoid Direct Competition',
        componentScores: {
          aeoReadiness: aeoScore,
          emotionalDebt: debtScore,
          referralEfficiency: refScore,
          timeToValue: ttvScore,
          technicalDebt: techDebt,
          pseoVulnerability: pseoVuln
        },
        scoringRawData: {
          aeoEvidence: {
            // v23.2: Add null guards
            schemaTypes: schemaProof.rawData.types || [],
            hasFAQ: hasFAQ,
            hasHowTo: hasHowTo,
            schemaCount: schemaProof.rawData.count || 0,
            questionHeadings: (headingsProof.rawData.h2 || []).filter(h => String(h).includes('?')).slice(0, 5)
          },
          trustEvidence: {
            hasGuarantee: fullText.includes('guarantee'),
            hasCertified: fullText.includes('certified'),
            hasReviews: fullText.includes('reviews') || fullText.includes('testimonial'),
            hasAffiliate: fullText.includes('affiliate'),
            trustSignals: ['guarantee', 'certified', 'reviews', 'testimonial'].filter(s => fullText.includes(s))
          },
          authorityEvidence: {
            pageRank: pageRank,
            externalLinksCount: linksProof.rawData.external.count,
            internalLinksCount: linksProof.rawData.internal.count
          },
          conversionEvidence: {
            ctasDetected: ctaPatterns.filter(p => fullText.includes(p)),
            ctaCount: ctaCount
          },
          technicalEvidence: {
            performanceScore: perfScore,
            lcpMs: cwvProof.rawData.lcp.numericValue,
            clsScore: cwvProof.rawData.cls.numericValue,
            fidMs: cwvProof.rawData.fid.numericValue
          },
          pseoEvidence: {
            h2Count: h2Count,
            wordCount: wordCount,
            h2Samples: headingsProof.rawData.h2.slice(0, 8),
            templatePatterns: ['best', 'vs', 'review', 'guide', 'top'].filter(p => fullText.includes(p))
          }
        },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        scoreFormula: {
          formula: '(AEO × 0.25) + (Debt × 0.20) + ((100-Ref) × 0.20) + ((100-TTV) × 0.15) + (Tech × 0.10) + (PSEO × 0.10)',
          components: {
            aeo: `${aeoScore} × 0.25 = ${(aeoScore * 0.25).toFixed(1)}`,
            debt: `${debtScore} × 0.20 = ${(debtScore * 0.20).toFixed(1)}`,
            ref: `(100-${refScore}) × 0.20 = ${((100 - refScore) * 0.20).toFixed(1)}`,
            ttv: `(100-${ttvScore}) × 0.15 = ${((100 - ttvScore) * 0.15).toFixed(1)}`,
            tech: `${techDebt} × 0.10 = ${(techDebt * 0.10).toFixed(1)}`,
            pseo: `${pseoVuln} × 0.10 = ${(pseoVuln * 0.10).toFixed(1)}`
          },
          total: disruptabilityScore
        },
        proof: { detailed: detailedProofs, dataSource: 'Oracle Fetcher (Comprehensive Analysis)' },
        recommendedStrategy: _getDisruptionStrategy(disruptabilityScore, profile)
      };
    }),
    
    marketOpportunityMatrix: competitors.slice(0, 6).map(c => {
      const detailedProofs = _extractAllDetailedProofs(c);
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      const schemaGap = !(website.schemaTypes || []).some(s => s.toLowerCase().includes('faq'));
      const contentGap = (website.wordCount || 0) < 1500;
      const trustGap = !fullText.includes('testimonial') && !fullText.includes('reviews');
      const speedGap = (c.apiData?.pageSpeed?.scores?.performance || 50) < 50;
      
      const opportunities = [];
      if (schemaGap) opportunities.push({ type: 'Schema', priority: 'CRITICAL', impact: 'AI visibility +40%' });
      if (contentGap) opportunities.push({ type: 'Content Depth', priority: 'HIGH', impact: 'Rankings +25%' });
      if (trustGap) opportunities.push({ type: 'Social Proof', priority: 'HIGH', impact: 'Conversion +30%' });
      if (speedGap) opportunities.push({ type: 'Performance', priority: 'MEDIUM', impact: 'UX +20%' });
      
      return {
        domain: c.domain || 'unknown',
        opportunityScore: opportunities.length * 25,
        opportunities: opportunities,
        topPriority: opportunities.length > 0 ? opportunities[0] : null,
        rawEvidence: {
          schemaTypes: detailedProofs.schema.rawData.types,
          wordCount: website.wordCount || 0,
          hasTrustSignals: fullText.includes('testimonial') || fullText.includes('reviews'),
          performanceScore: c.apiData?.pageSpeed?.scores?.performance || 0
        }
      };
    })
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR FORENSIC ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

function _detectStruggleOriginForensic(comp) {
  const profile = comp.forensicProfile || {};
  if (profile.emotionalDebt > 60) return 'Trust Deficit';
  if (profile.pseoLevel === 'Extreme') return 'Information Overload';
  if (profile.affiliateDepth === 'High') return 'Hidden Costs Concern';
  return 'Speed/Convenience Gap';
}

function _getJTBDStrategicSolution(persona) {
  const solutions = {
    'Vigilante': 'Match authenticity while adding professional polish',
    'PSEO Machine': 'Attack with expert, hand-crafted content on high-value templates',
    'Corporate': 'Position as agile, community-first alternative',
    'Old Guard Authority': 'Modernize UX while respecting their trust equity',
    'Legacy Player': 'Outpace with modern infrastructure and fresh content',
    'default': 'Identify unique value proposition and amplify'
  };
  return solutions[persona] || solutions['default'];
}

function _getEmotionalDebtKillMove(debt, persona) {
  if (debt > 70) return 'Full vigilante positioning: show faces, share losses, build community';
  if (debt > 50) return 'Transparency offensive: publish full terms, show real payouts';
  if (debt > 30) return 'Trust enhancement: add verification badges, expert reviews';
  return 'Maintain trust while innovating on UX';
}

function _getPersonaWeakness(persona) {
  const weaknesses = {
    'Vigilante': 'May lack scale and professional polish',
    'PSEO Machine': 'Vulnerable to algorithm updates, thin content risk',
    'Corporate': 'Slow to adapt, sterile voice, low trust',
    'Old Guard Authority': 'Outdated UX, slow content velocity',
    'Legacy Player': 'Technical debt, resistance to change',
    'Generic Affiliate': 'No differentiation, commodity content',
    'default': 'Unknown - requires deeper analysis'
  };
  return weaknesses[persona] || weaknesses['default'];
}

function _detectContentTone(comp) {
  const profile = comp.forensicProfile || {};
  if (profile.persona === 'Vigilante') return 'Authentic, Community-Driven';
  if (profile.persona === 'Corporate') return 'Professional, Sterile';
  if (profile.persona === 'PSEO Machine') return 'Template-Based, Impersonal';
  return 'Mixed, Inconsistent';
}

function _detectParasitePlatforms(comp) {
  const profile = comp.forensicProfile || {};
  const platforms = [];
  if (profile.pseoLevel !== 'None') platforms.push('Reddit (Likely)');
  if (profile.trustScore > 60) platforms.push('Industry Forums');
  if (profile.affiliateDepth === 'High') platforms.push('Quora');
  if (platforms.length === 0) platforms.push('Minimal Parasite Activity');
  return platforms;
}

function _detectObfuscationTechniques(affiliateDepth) {
  const techniques = [];
  if (affiliateDepth === 'Extreme') techniques.push('JavaScript Redirects', 'Dynamic Link Generation', 'Bot Detection');
  else if (affiliateDepth === 'High') techniques.push('Link Cloaking', 'Parameter Masking');
  else if (affiliateDepth === 'Medium') techniques.push('Basic Redirects');
  else techniques.push('Direct Links (Minimal Protection)');
  return techniques;
}

function _calculateMaskingScore(profile) {
  const depths = { 'Extreme': 90, 'High': 70, 'Medium': 50, 'Low': 25 };
  return depths[profile.affiliateDepth] || 50;
}

function _calculatePatternRepetition(pathSegments) {
  if (!pathSegments || pathSegments.length < 5) return 0;
  const prefixes = {};
  pathSegments.forEach(segment => {
    const prefix = segment.split('-').slice(0, 2).join('-');
    prefixes[prefix] = (prefixes[prefix] || 0) + 1;
  });
  const maxRepetition = Math.max(...Object.values(prefixes));
  const repetitionRatio = maxRepetition / pathSegments.length;
  if (repetitionRatio >= 0.5) return 90;
  if (repetitionRatio >= 0.3) return 70;
  if (repetitionRatio >= 0.2) return 50;
  if (repetitionRatio >= 0.1) return 30;
  return 15;
}

function _getPrimaryMaskingTechnique(profile) {
  if (profile.affiliateDepth === 'Extreme') return 'Multi-layer JavaScript Obfuscation';
  if (profile.affiliateDepth === 'High') return 'Server-side Link Cloaking';
  if (profile.affiliateDepth === 'Medium') return 'Basic Redirect';
  return 'Direct Linking';
}

function _identifyFrictionPoints(comp) {
  const points = [];
  const synth = comp.synthesized || {};
  const wordCount = synth.website?.wordCount || 0;
  if (wordCount > 3000) points.push('Information Overload');
  if (!(synth.website?.schemaTypes?.length > 0)) points.push('No Quick-Answer Formatting');
  if (comp.forensicProfile?.affiliateDepth === 'High') points.push('Hidden Conversion Path');
  if (points.length === 0) points.push('Minimal Friction');
  return points;
}

function _detectFunnelType(profile) {
  if (profile.affiliateDepth === 'Extreme') return 'Multi-Touch Attribution Funnel';
  if (profile.affiliateDepth === 'High') return 'Comparison-to-Conversion Funnel';
  if (profile.persona === 'Vigilante') return 'Community Trust Funnel';
  return 'Standard Content Funnel';
}

function _identifyEntryPoints(synth) {
  const entries = ['Organic Search'];
  if (synth.website?.schemaTypes?.length > 0) entries.push('Rich Results');
  entries.push('Direct Traffic');
  return entries;
}

function _mapConversionPath(profile) {
  if (profile.persona === 'Vigilante') return 'Community → Trust → Conversion';
  if (profile.pseoLevel === 'High') return 'Template Page → Quick Facts → CTA';
  return 'Content → Comparison → Conversion';
}

function _estimateConversionRate(profile) {
  if (profile.trustScore > 70) return '3-5%';
  if (profile.trustScore > 50) return '2-3%';
  return '1-2%';
}

function _detectPSEOTemplates(comp, serpResults) {
  const profile = comp.forensicProfile || {};
  const templates = [];
  if (profile.pseoLevel === 'Extreme') templates.push('[Casino] Review', '[Slot] Free Play', 'Best [X] for [Y]');
  else if (profile.pseoLevel === 'High') templates.push('[Product] Review', 'Compare [A] vs [B]');
  else if (profile.pseoLevel === 'Medium') templates.push('Basic Review Template');
  return templates;
}

function _estimatePSEOPages(pseoScore, serpCount) {
  if (pseoScore > 80) return '10,000+';
  if (pseoScore > 60) return '2,000-10,000';
  if (pseoScore > 40) return '500-2,000';
  return '100-500';
}

function _calculateEEATScoreForensic(comp) {
  const profile = comp.forensicProfile || {};
  const synth = comp.synthesized || {};
  let score = 40;
  if (profile.trustScore > 70) score += 20;
  if (profile.persona === 'Vigilante' || profile.persona === 'Old Guard Authority') score += 15;
  if ((synth.website?.schemaTypes || []).length > 2) score += 10;
  if (profile.pseoLevel === 'None' || profile.pseoLevel === 'Low') score += 10;
  return Math.min(95, score);
}

function _assessExperience(synth) {
  const wordCount = synth.website?.wordCount || 0;
  if (wordCount > 2500) return 'Demonstrated';
  if (wordCount > 1000) return 'Moderate';
  return 'Limited';
}

function _assessExpertise(synth, profile) {
  if (profile.persona === 'Old Guard Authority') return 'Industry Expert';
  if (profile.persona === 'Vigilante') return 'Practitioner';
  if (profile.pseoLevel === 'Extreme') return 'Automated (Low)';
  return 'General';
}

function _assessAuthoritativeness(comp) {
  const pageRank = comp.apiData?.openPageRank?.page_rank_decimal || 0;
  if (pageRank > 5) return 'High Authority';
  if (pageRank > 3) return 'Moderate Authority';
  return 'Building Authority';
}

function _identifyWeakestEEAT(comp) {
  const profile = comp.forensicProfile || {};
  if (profile.pseoLevel === 'Extreme') return 'Experience (Automated Content)';
  if (profile.emotionalDebt > 60) return 'Trustworthiness';
  if (profile.persona === 'Generic Affiliate') return 'Expertise';
  return 'None Critical';
}

function _hypothesizeSchemaStrategy(comp) {
  const profile = comp.forensicProfile || {};
  if (profile.pseoLevel === 'Extreme') return 'Automated Schema Injection';
  if (profile.persona === 'Old Guard Authority') return 'Manual, Conservative';
  return 'Standard Implementation';
}

function _identifyMissingSchemas(existing, niche) {
  const recommended = ['FAQPage', 'HowTo', 'Review', 'BreadcrumbList', 'Article'];
  const existingLower = existing.map(s => s.toLowerCase());
  return recommended.filter(s => !existingLower.some(e => e.includes(s.toLowerCase())));
}

function _detectPSEOPatterns(serpResults, profile) {
  const patterns = [];
  if (profile.pseoLevel === 'Extreme') patterns.push('[City] + [Product]', '[Brand] vs [Competitor]', 'Best [X] for [Y]');
  else if (profile.pseoLevel === 'High') patterns.push('[Product] Review', '[Year] Guide');
  return patterns;
}

function _generateStrategyKillMovesForensic(competitors, niche) {
  return competitors.slice(0, 3).map(c => {
    const profile = c.forensicProfile || {};
    return {
      target: c.domain || 'unknown',
      killMoveTitle: 'Freshness Gap Attack',
      description: profile.pseoLevel === 'Extreme' ? 
        'Create expert, dated content on their highest-traffic automated pages' :
        'Outpace with weekly content updates and "Last verified" timestamps',
      implementationCost: 'Medium',
      expectedOutcome: 'Capture freshness-sensitive searches within 3 months'
    };
  });
}

function _getDisruptionStrategy(score, profile) {
  if (score > 65) return 'Aggressive: Full-scale content attack on their vulnerabilities';
  if (score > 45) return 'Selective: Target specific weakness (PSEO, trust, speed)';
  return 'Defensive: Focus on differentiation rather than direct competition';
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (Legacy Support)
// ═══════════════════════════════════════════════════════════════════════════

function _getArchetypesForNiche(nicheKey) {
  const archetypes = {
    'online gambling': [
      { name: 'The Bonus Hunter', description: 'Actively seeks maximum value', intent: 'Transactional', trustLevel: 'Low' },
      { name: 'The Safety-First Whale', description: 'High-value player prioritizing regulated operators', intent: 'Commercial', trustLevel: 'High' },
      { name: 'The Professional Strategist', description: 'Uses RTP/EV+ calculations', intent: 'Informational', trustLevel: 'Medium' },
      { name: 'The Casual Escapist', description: 'Entertainment-focused', intent: 'Navigational', trustLevel: 'Low' }
    ],
    'software development': [
      { name: 'The Speed Optimizer', description: 'CTOs needing immediate talent', intent: 'Transactional', trustLevel: 'Medium' },
      { name: 'The Risk Mitigator', description: 'Enterprise compliance focus', intent: 'Commercial', trustLevel: 'High' },
      { name: 'The Cost Arbitrageur', description: 'Seeking nearshore savings', intent: 'Commercial', trustLevel: 'Low' },
      { name: 'The Technical Evaluator', description: 'Senior devs vetting quality', intent: 'Informational', trustLevel: 'Medium' }
    ],
    'default': [
      { name: 'The Researcher', description: 'Deep comparison before commitment', intent: 'Informational', trustLevel: 'Medium' },
      { name: 'The Impulse Buyer', description: 'Quick decision maker', intent: 'Transactional', trustLevel: 'Low' },
      { name: 'The Enterprise Evaluator', description: 'Long sales cycle', intent: 'Commercial', trustLevel: 'High' },
      { name: 'The Community Seeker', description: 'Values peer validation', intent: 'Navigational', trustLevel: 'Medium' }
    ]
  };
  return archetypes[nicheKey] || archetypes['default'];
}

function _extractPrimaryStruggles(competitors, niche) {
  return [
    { struggle: 'Trust Gap', description: 'Cannot verify legitimacy', severity: 85, solution: 'License badges + Live verification' },
    { struggle: 'Speed Gap', description: 'Time-to-value exceeds patience', severity: 78, solution: 'Instant answers + Quick-fact cards' },
    { struggle: 'Information Overload', description: 'Too much content, no clear answer', severity: 72, solution: 'Comparison matrices + Decision trees' },
    { struggle: 'Hidden Costs', description: 'Fear of unexpected fees', severity: 68, solution: 'Bonus calculators + Full disclosure' }
  ];
}

function _detectPrimaryGap(comp) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  if (content.includes('safe') || content.includes('license')) return 'Trust Gap';
  if (content.includes('fast') || content.includes('instant')) return 'Speed Gap';
  if ((comp.synthesized?.website?.wordCount || 0) > 3000) return 'Information Overload';
  return 'Hidden Costs';
}

function _detectPrimaryFriction(comp) {
  const wordCount = comp.synthesized?.website?.wordCount || 0;
  const hasSchema = (comp.synthesized?.website?.schemaTypes || []).length > 0;
  if (wordCount > 3000 && !hasSchema) return 'Information Density';
  if (!hasSchema) return 'Path Clarity';
  if (wordCount < 500) return 'Trust Verification';
  return 'Option Paralysis';
}

function _detectFeature(comp, keywords) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  return keywords.some(kw => content.includes(kw));
}

function _countPowerWords(content, words) {
  let count = 0;
  words.forEach(word => {
    const matches = (content.match(new RegExp(word, 'gi')) || []).length;
    count += matches;
  });
  return Math.min(100, count * 8);
}

function _calculateFOMOIndex(competitors) {
  let total = 0;
  competitors.slice(0, 5).forEach(c => {
    const content = JSON.stringify(c.synthesized || {}).toLowerCase();
    if (content.includes('limited')) total += 20;
    if (content.includes('exclusive')) total += 15;
    if (content.includes('now')) total += 10;
  });
  return Math.min(100, Math.max(25, total / (competitors.length || 1)));
}

function _calculateSkepticismIndex(competitors) {
  let skepticism = 70;
  competitors.slice(0, 5).forEach(c => {
    const content = JSON.stringify(c.synthesized || {}).toLowerCase();
    if (content.includes('licensed')) skepticism -= 8;
    if (content.includes('verified')) skepticism -= 6;
    if (content.includes('trusted')) skepticism -= 5;
  });
  return Math.max(20, Math.min(100, skepticism));
}

function _calculateAdvocacyPotential(competitors) {
  let advocacy = 30;
  competitors.slice(0, 5).forEach(c => {
    const content = JSON.stringify(c.synthesized || {}).toLowerCase();
    if (content.includes('community')) advocacy += 10;
    if (content.includes('share')) advocacy += 8;
    if (content.includes('recommend')) advocacy += 12;
  });
  return Math.min(100, advocacy);
}

function _calculateEEATDensity(comp) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  let score = 35;
  if (content.includes('tested') || content.includes('reviewed')) score += 10;
  if (content.includes('expert') || content.includes('professional')) score += 12;
  if (content.includes('certified') || content.includes('licensed')) score += 10;
  if (content.includes('verified') || content.includes('secure')) score += 10;
  return Math.min(100, score);
}

function _calculateFreshnessIndex(comp) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  let freshness = 45;
  if (content.includes('2024') || content.includes('2025')) freshness += 25;
  if (content.includes('updated') || content.includes('new')) freshness += 15;
  if (content.includes('latest') || content.includes('recent')) freshness += 10;
  return Math.min(100, freshness);
}

function _detectBrandPersona(comp) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  if (content.includes('community') || content.includes('players')) return 'Community-Driven';
  if (content.includes('professional') || content.includes('enterprise')) return 'Corporate Professional';
  if (content.includes('best') || content.includes('review')) return 'Comparison Authority';
  return 'Mixed/Undefined';
}

function _calculateAuthenticityScore(comp) {
  const content = JSON.stringify(comp.synthesized || {}).toLowerCase();
  let score = 45;
  if (content.includes('we') || content.includes('our team')) score += 15;
  if (content.includes('honest') || content.includes('transparent')) score += 12;
  if (content.includes('leading') || content.includes('solution')) score -= 10;
  return Math.max(25, Math.min(100, score));
}

function _detectStruggleOrigin(comp) {
  const content = JSON.stringify(comp).toLowerCase();
  if (content.includes('payout') || content.includes('withdraw') || content.includes('fast')) {
    return 'Speed Gap - Users seeking fast payouts';
  }
  if (content.includes('license') || content.includes('safe') || content.includes('trust') || content.includes('secure')) {
    return 'Trust Gap - Users verifying legitimacy';
  }
  if (content.includes('bonus') || content.includes('offer') || content.includes('promo')) {
    return 'Value Gap - Users seeking best deals';
  }
  return 'Information Gap - Users need clarity before decision';
}

/**
 * Generate Elite Tab data via Gemini for real-time insights
 */
function FT_GenerateEliteTabsViaGemini(competitors, niche) {
  const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!geminiKey) {
    console.log('⚠️ No Gemini API key, using local generation');
    return FT_GenerateEliteTabIntelligence(competitors, {}, niche);
  }
  
  const competitorList = competitors.slice(0, 5).map(c => c.domain || 'unknown').join(', ');
  
  const prompt = "# IDENTITY & PERSONA\n\n" +
    "You are a DUAL-IDENTITY SPECIALIST:\n\n" +
    "## IDENTITY 1: ELITE TIER-1 CSO\n" +
    "- 15+ years at McKinsey TMT and Bain Private Equity\n" +
    "- Board-ready analysis for $100M+ organizations\n\n" +
    "## IDENTITY 2: iGAMING & SAAS FORENSIC ANALYST\n" +
    "- Expert in GEO (Generative Engine Optimization)\n\n" +
    "# COMPETITORS TO ANALYZE\n\n" +
    "Competitors: " + competitorList + "\n" +
    "Niche: " + (niche || 'digital marketing') + "\n\n" +
    "Return valid JSON with elite tab intelligence.";
  
  try {
    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' + geminiKey,
      {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 8192 }
        }),
        muteHttpExceptions: true
      }
    );
    
    const result = JSON.parse(response.getContentText());
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const text = result.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    
    console.log('⚠️ Gemini response parsing failed, using local generation');
    return FT_GenerateEliteTabIntelligence(competitors, {}, niche);
  } catch (e) {
    console.log('❌ Gemini API error:', e.message);
    return FT_GenerateEliteTabIntelligence(competitors, {}, niche);
  }
}

/**
 * Get Elite Tab data for UI rendering
 * Main endpoint for the frontend
 */
function FT_GetEliteTabData(competitors, niche) {
  console.log('📊 FT_GetEliteTabData called for', competitors?.length || 0, 'competitors');
  const eliteData = FT_GenerateEliteTabsViaGemini(competitors || [], niche);
  return { success: true, data: eliteData, timestamp: new Date().toISOString() };
}

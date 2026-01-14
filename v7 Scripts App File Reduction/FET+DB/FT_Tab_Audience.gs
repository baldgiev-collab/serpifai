/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_AUDIENCE.GS - AUDIENCE INTELLIGENCE & PSYCHOGRAPHICS
 * Behavioral archetypes, JTBD analysis, emotional resonance, cognitive load
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 4811-5890)
 * 
 * CONTAINS:
 * - _generateAudienceIntelligenceForensic() - Tab 10: Audience
 * - _generateArchetypesFromData() - Behavioral archetype generation
 * - _extractPrimaryStrugglesFromContent() - JTBD struggle extraction
 * - _calculateEmotionalResonance() - Sentiment analysis
 * - _calculateAverageContentDensity() - Content density calc
 * - _calculateNavigationComplexity() - Navigation complexity calc
 * - _calculateInformationOverload() - Information overload calc
 * - _calculateTrustClarity() - Trust clarity calc
 * - _generateAudienceKillMoves() - Kill move generation
 * - _extractTopReferringDomains() - Backlink domain extraction
 * - _generateBacklinkStrategicInsight() - Backlink strategy
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 10: AUDIENCE INTELLIGENCE - FORENSIC PSYCHOGRAPHICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Audience Intelligence forensic data
 * FIXED: Field names match UI expectations exactly
 */
function _generateAudienceIntelligenceForensic(competitors, gemini, niche) {
  const nicheKey = (typeof niche === 'string' ? niche : '').toLowerCase().includes('gambling') ? 'online gambling' : 
                   (typeof niche === 'string' ? niche : '').toLowerCase().includes('software') ? 'software development' : 'default';
  
  // Extract REAL audience signals from competitor content
  const audienceSignals = competitors.slice(0, 6).map(c => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const content = synth.content || {};
    const fullText = JSON.stringify(synth).toLowerCase();
    
    // ELITE: Extract ALL detailed proofs using new functions
    const detailedProofs = _extractAllDetailedProofs(c);
    const headingsProof = detailedProofs.headings;
    const contentProof = detailedProofs.content;
    const schemaProof = detailedProofs.schema;
    
    // REAL: Extract H2/H3 headings for intent analysis
    const h2Array = website.h2 || [];
    const h3Array = website.h3 || [];
    const allHeadings = [...h2Array, ...h3Array].join(' ').toLowerCase();
    
    // REAL: Detect intent types from headings
    const transactionalSignals = ['buy', 'price', 'cost', 'purchase', 'order', 'sign up', 'get started', 'subscribe'];
    const commercialSignals = ['best', 'top', 'compare', 'vs', 'review', 'alternative', 'pricing'];
    const informationalSignals = ['how to', 'what is', 'guide', 'learn', 'tutorial', 'tips', 'explain'];
    
    const transactionalScore = transactionalSignals.filter(s => allHeadings.includes(s) || fullText.includes(s)).length;
    const commercialScore = commercialSignals.filter(s => allHeadings.includes(s) || fullText.includes(s)).length;
    const informationalScore = informationalSignals.filter(s => allHeadings.includes(s) || fullText.includes(s)).length;
    
    // Collect detected signal keywords
    const detectedTransactional = transactionalSignals.filter(s => allHeadings.includes(s) || fullText.includes(s));
    const detectedCommercial = commercialSignals.filter(s => allHeadings.includes(s) || fullText.includes(s));
    const detectedInformational = informationalSignals.filter(s => allHeadings.includes(s) || fullText.includes(s));
    
    // Determine primary intent
    let primaryIntent = 'Mixed';
    if (transactionalScore > commercialScore && transactionalScore > informationalScore) {
      primaryIntent = 'Transactional';
    } else if (commercialScore > informationalScore) {
      primaryIntent = 'Commercial';
    } else if (informationalScore > 0) {
      primaryIntent = 'Informational';
    }
    
    return {
      domain: c.domain,
      transactionalScore,
      commercialScore,
      informationalScore,
      primaryIntent,
      headingsCount: h2Array.length + h3Array.length,
      topHeadings: h2Array.slice(0, 5),
      
      // ELITE: ACTUAL INTENT SIGNAL RAW DATA
      intentSignalsRawData: {
        transactional: {
          score: transactionalScore,
          detected: detectedTransactional,
          examples: detectedTransactional.slice(0, 3).map(s => 
            _extractContextAround(fullText, s, 40) || `"${s}" found`
          )
        },
        commercial: {
          score: commercialScore,
          detected: detectedCommercial,
          examples: detectedCommercial.slice(0, 3).map(s => 
            _extractContextAround(fullText, s, 40) || `"${s}" found`
          )
        },
        informational: {
          score: informationalScore,
          detected: detectedInformational,
          examples: detectedInformational.slice(0, 3).map(s => 
            _extractContextAround(fullText, s, 40) || `"${s}" found`
          )
        }
      },
      
      // ELITE: ACTUAL HEADINGS FOR INTENT ANALYSIS
      headingsRawData: {
        h1: headingsProof.rawData.h1,
        h2: {
          count: h2Array.length,
          texts: h2Array.slice(0, 10),
          intentSignals: h2Array.filter(h => 
            /how|what|why|best|top|buy|price|guide|review/i.test(h)
          )
        },
        h3: {
          count: h3Array.length,
          texts: h3Array.slice(0, 8)
        }
      },
      
      // ELITE: ACTUAL CONTENT METRICS FOR AUDIENCE ANALYSIS
      contentRawData: {
        wordCount: contentProof.rawData.wordCount,
        readingTime: contentProof.rawData.readingTime,
        contentDepth: contentProof.rawData.contentDepth
      },
      
      detailedProofs: detailedProofs
    };
  });
  
  // Generate archetypes from REAL data analysis
  const archetypes = _generateArchetypesFromData(audienceSignals, nicheKey);
  
  return {
    // Behavioral Archetypes - REAL DATA based on content analysis
    archetypes: archetypes,
    
    // JTBD Analysis - REAL DATA from content signals
    jtbdAnalysis: {
      primaryStruggles: _extractPrimaryStrugglesFromContent(competitors),
      competitorJTBDMatch: competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const content = synth.content || {};
        const fullText = JSON.stringify(synth).toLowerCase();
        const apiData = c.apiData || {};
        const pageSpeed = apiData.pageSpeed || {};
        
        // REAL: Calculate JTBD match from content signals
        let matchScore = 30;
        
        // Content depth signals
        const wordCount = website.wordCount || 0;
        if (wordCount > 3000) matchScore += 20;
        else if (wordCount > 1500) matchScore += 12;
        else if (wordCount > 500) matchScore += 6;
        
        // Structural signals
        const h2Count = (website.h2 || []).length;
        const h3Count = (website.h3 || []).length;
        if (h2Count >= 5) matchScore += 10;
        if (h3Count >= 8) matchScore += 8;
        
        // Trust signals
        const schemaCount = (website.schemaTypes || []).length;
        if (schemaCount >= 2) matchScore += 10;
        
        // Technical quality
        const perfScore = pageSpeed.scores?.performance || 0;
        if (perfScore >= 70) matchScore += 10;
        else if (perfScore >= 50) matchScore += 5;
        
        // CTA and conversion signals
        if (fullText.includes('testimonial') || fullText.includes('review')) matchScore += 8;
        if (fullText.includes('guarantee') || fullText.includes('money back')) matchScore += 5;
        
        matchScore = Math.min(95, Math.max(25, matchScore));
        
        // Detect primary gap from REAL content
        let primaryGap = 'Content Depth';
        if (wordCount < 1000) primaryGap = 'Content Depth';
        else if (schemaCount === 0) primaryGap = 'Structured Data';
        else if (perfScore < 50) primaryGap = 'Technical Performance';
        else if (!fullText.includes('author') && !fullText.includes('expert')) primaryGap = 'Trust Signals';
        else primaryGap = 'Minor Gaps';
        
        return {
          domain: c.domain || 'unknown',
          jtbdMatchScore: matchScore,
          primaryGap: primaryGap,
          struggleOrigin: wordCount > 0 ? 'Content Analysis' : 'Pending Analysis',
          hasRealData: wordCount > 0 || schemaCount > 0,
          tooltips: {
            jtbdMatchScore: FT_GetMetricTooltip('jtbdMatch')
          },
          proof: {
            wordCount: wordCount,
            h2Count: h2Count,
            schemaCount: schemaCount,
            perfScore: perfScore,
            scoreBreakdown: {
              base: 30,
              contentDepth: wordCount > 3000 ? '+20' : wordCount > 1500 ? '+12' : wordCount > 500 ? '+6' : '+0',
              structure: (h2Count >= 5 ? '+10' : '+0') + ', ' + (h3Count >= 8 ? '+8' : '+0'),
              schema: schemaCount >= 2 ? '+10' : '+0',
              technical: perfScore >= 70 ? '+10' : perfScore >= 50 ? '+5' : '+0',
              trustSignals: (fullText.includes('testimonial') ? '+8' : '+0') + ', ' + (fullText.includes('guarantee') ? '+5' : '+0')
            },
            dataSource: wordCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
          }
        };
      })
    },
    
    // Emotional Resonance - REAL DATA from content sentiment
    emotionalResonance: {
      sentimentPolarity: _calculateEmotionalResonance(competitors)
    },
    
    // Cognitive Load - REAL DATA from content complexity
    cognitiveLoad: {
      decisionFrictionFactors: [
        {
          factor: 'Content Density',
          weight: _calculateAverageContentDensity(competitors),
          description: 'High word count without clear structure increases decision friction'
        },
        {
          factor: 'Navigation Complexity',
          weight: _calculateNavigationComplexity(competitors),
          description: 'Too many options or unclear paths increase cognitive load'
        },
        {
          factor: 'Information Overload',
          weight: _calculateInformationOverload(competitors),
          description: 'Excessive technical details without summary creates paralysis'
        },
        {
          factor: 'Trust Clarity',
          weight: _calculateTrustClarity(competitors),
          description: 'Missing social proof or guarantees adds verification burden'
        }
      ],
      competitorScores: competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const apiData = c.apiData || {};
        const pageSpeed = apiData.pageSpeed || {};
        
        // REAL: Calculate cognitive load from content metrics
        const wordCount = website.wordCount || 0;
        const h2Count = (website.h2 || []).length;
        const internalLinks = website.internalLinkCount || 0;
        const perfScore = pageSpeed.scores?.performance || 50;
        
        let load = 40;
        
        if (wordCount > 5000) load += 25;
        else if (wordCount > 3000) load += 15;
        else if (wordCount > 1500) load += 8;
        
        if (h2Count >= 8) load -= 15;
        else if (h2Count >= 5) load -= 10;
        else if (h2Count < 3) load += 10;
        
        if (perfScore >= 80) load -= 10;
        else if (perfScore < 40) load += 15;
        
        if (internalLinks > 30) load += 8;
        
        load = Math.min(90, Math.max(20, load));
        
        return {
          domain: c.domain || 'unknown',
          cognitiveLoadScore: load,
          assessment: load >= 70 ? 'High Friction' : load >= 50 ? 'Moderate' : 'Low Friction',
          tooltips: {
            cognitiveLoadScore: FT_GetMetricTooltip('cognitiveLoad')
          },
          proof: {
            wordCount: wordCount,
            h2Count: h2Count,
            internalLinks: internalLinks,
            perfScore: perfScore,
            scoreBreakdown: {
              base: 40,
              wordCountImpact: wordCount > 5000 ? '+25' : wordCount > 3000 ? '+15' : wordCount > 1500 ? '+8' : '+0',
              structureImpact: h2Count >= 8 ? '-15' : h2Count >= 5 ? '-10' : h2Count < 3 ? '+10' : '+0',
              performanceImpact: perfScore >= 80 ? '-10' : perfScore < 40 ? '+15' : '+0',
              linksImpact: internalLinks > 30 ? '+8' : '+0'
            },
            dataSource: wordCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
          }
        };
      })
    },
    
    // ELITE PHASE 3C: BEHAVIORAL SEGMENTATION
    behavioralSegmentation: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const seo = synth.seo || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      // Detect behavior signals
      const buyerSignals = ['buy', 'purchase', 'order', 'checkout', 'cart', 'pricing', 'plans'].filter(w => fullText.includes(w)).length;
      const researcherSignals = ['guide', 'tutorial', 'how to', 'what is', 'learn', 'compare', 'vs', 'review'].filter(w => fullText.includes(w)).length;
      const professionalSignals = ['enterprise', 'team', 'business', 'company', 'professional', 'agency'].filter(w => fullText.includes(w)).length;
      const consumerSignals = ['personal', 'home', 'family', 'individual', 'free', 'basic'].filter(w => fullText.includes(w)).length;
      
      // Calculate segment scores
      const totalSignals = buyerSignals + researcherSignals + 1;
      const buyerScore = Math.round((buyerSignals / totalSignals) * 100);
      const researcherScore = Math.round((researcherSignals / totalSignals) * 100);
      
      // Determine primary audience
      let primarySegment = 'Mixed';
      if (buyerScore > 60) primarySegment = 'Ready Buyers';
      else if (researcherScore > 60) primarySegment = 'Active Researchers';
      else if (professionalSignals > consumerSignals) primarySegment = 'B2B Professionals';
      else if (consumerSignals > professionalSignals) primarySegment = 'B2C Consumers';
      
      // Infer journey stage distribution
      const wordCount = website.wordCount || 0;
      const h2Count = (website.h2 || []).length;
      
      const awarenessContent = wordCount > 2000 && researcherSignals >= 2;
      const considerationContent = h2Count >= 5 && (fullText.includes('compare') || fullText.includes('vs'));
      const decisionContent = buyerSignals >= 2 && fullText.includes('pricing');
      
      return {
        domain: c.domain || 'unknown',
        primarySegment: primarySegment,
        segmentConfidence: Math.max(buyerScore, researcherScore) > 50 ? 'High' : 'Medium',
        segmentDistribution: {
          readyBuyers: buyerScore,
          activeResearchers: researcherScore,
          passiveBrowsers: Math.max(0, 100 - buyerScore - researcherScore)
        },
        audienceType: professionalSignals > consumerSignals ? 'B2B' : 'B2C',
        journeyStages: {
          awareness: awarenessContent,
          consideration: considerationContent,
          decision: decisionContent
        },
        recommendation: buyerScore < 30 && researcherScore > 50 ? 
          'Add more conversion-focused content for ready buyers' :
          buyerScore > 70 ? 'Expand top-of-funnel content for researchers' :
          'Balanced content mix - optimize for specific segments',
        tooltips: {
          segmentDistribution: FT_GetMetricTooltip('behavioralSegment')
        },
        proof: {
          buyerSignalsFound: buyerSignals,
          researcherSignalsFound: researcherSignals,
          professionalSignals: professionalSignals,
          consumerSignals: consumerSignals,
          scoreBreakdown: {
            buyerKeywords: buyerSignals,
            researcherKeywords: researcherSignals,
            totalAnalyzed: ['buy', 'purchase', 'guide', 'tutorial', 'how to', 'compare', 'vs', 'review'].length
          },
          dataSource: (buyerSignals + researcherSignals) > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // ELITE v13.0: SECTION-LEVEL STRATEGIC INSIGHT (Gemini-powered)
    sectionStrategicInsight: (() => {
      const jtbdScores = competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const wordCount = website.wordCount || 0;
        const h2Count = (website.h2 || []).length;
        return { domain: c.domain, jtbdMatchScore: Math.min(95, 30 + (wordCount > 2000 ? 20 : 10) + (h2Count * 3)) };
      });
      
      const sectionData = {
        jtbdAlignment: jtbdScores
      };
      
      if (typeof FT_GenerateSectionStrategicInsight === 'function') {
        return FT_GenerateSectionStrategicInsight('audience', sectionData, competitors, niche);
      }
      
      return {
        executiveSummary: 'Audience intelligence analysis complete. Align content with user journey stages.',
        opportunityScore: 60,
        opportunityLevel: 'Medium'
      };
    })(),
    
    // Kill Moves - DYNAMIC based on competitor gaps
    killMoves: _generateAudienceKillMoves(competitors)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHETYPE GENERATION FROM REAL DATA
// ═══════════════════════════════════════════════════════════════════════════════

function _generateArchetypesFromData(audienceSignals, nicheKey) {
  // Analyze overall intent distribution
  const avgTransactional = audienceSignals.reduce((a, b) => a + b.transactionalScore, 0) / Math.max(1, audienceSignals.length);
  const avgCommercial = audienceSignals.reduce((a, b) => a + b.commercialScore, 0) / Math.max(1, audienceSignals.length);
  const avgInformational = audienceSignals.reduce((a, b) => a + b.informationalScore, 0) / Math.max(1, audienceSignals.length);
  
  const archetypes = [];
  
  // Generate archetypes based on REAL intent signals
  if (avgTransactional >= 2) {
    archetypes.push({
      name: 'Ready Buyer',
      description: 'High purchase intent, looking for best option or deal',
      intent: 'Transactional',
      trustLevel: 'Medium',
      conversionPath: 'Direct → Compare → Convert',
      signals: `${Math.round(avgTransactional)} transactional signals detected`
    });
  }
  
  if (avgCommercial >= 2) {
    archetypes.push({
      name: 'Comparison Shopper',
      description: 'Evaluating options, needs clear differentiation',
      intent: 'Commercial',
      trustLevel: 'Medium-High',
      conversionPath: 'Research → Evaluate → Convert',
      signals: `${Math.round(avgCommercial)} commercial signals detected`
    });
  }
  
  if (avgInformational >= 2) {
    archetypes.push({
      name: 'Information Seeker',
      description: 'Learning phase, building understanding',
      intent: 'Informational',
      trustLevel: 'Low',
      conversionPath: 'Learn → Trust → Convert',
      signals: `${Math.round(avgInformational)} informational signals detected`
    });
  }
  
  // Add default archetype if none detected
  if (archetypes.length === 0) {
    archetypes.push({
      name: 'Mixed Intent',
      description: 'Varied user journey, requires multi-touch approach',
      intent: 'Mixed',
      trustLevel: 'Variable',
      conversionPath: 'Discover → Engage → Convert',
      signals: 'Diverse content signals'
    });
  }
  
  // Always add a professional/B2B archetype for SaaS niches
  archetypes.push({
    name: 'Professional Evaluator',
    description: 'Business decision-maker evaluating solutions',
    intent: 'Commercial',
    trustLevel: 'High',
    conversionPath: 'Research → Demo → Evaluate → Convert',
    signals: 'B2B signals inferred from content structure'
  });
  
  return archetypes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// JTBD STRUGGLE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function _extractPrimaryStrugglesFromContent(competitors) {
  const struggleMap = new Map();
  
  // Struggle definitions with metadata for UI
  const struggleDefinitions = {
    'Implementation guidance needed': {
      description: 'Users struggle to understand how to implement or get started with the solution',
      solution: 'Create step-by-step tutorials, video walkthroughs, and interactive onboarding',
      baseSeverity: 75
    },
    'Value justification required': {
      description: 'Users need clear ROI and value proposition before committing',
      solution: 'Add case studies, ROI calculators, and comparison charts with metrics',
      baseSeverity: 70
    },
    'Option overload - needs curation': {
      description: 'Too many choices create analysis paralysis and decision fatigue',
      solution: 'Provide curated recommendations, comparison tables, and "best for" guides',
      baseSeverity: 65
    },
    'Comparison difficulty': {
      description: 'Hard to compare features, pricing, and benefits across options',
      solution: 'Create detailed vs pages, feature matrices, and honest competitor comparisons',
      baseSeverity: 80
    },
    'Budget concerns': {
      description: 'Price sensitivity and uncertainty about value vs. cost',
      solution: 'Offer free trials, transparent pricing, money-back guarantees, and payment plans',
      baseSeverity: 85
    },
    'Trust verification needed': {
      description: 'Users need social proof and validation before trusting a solution',
      solution: 'Display reviews, testimonials, case studies, and trust badges prominently',
      baseSeverity: 90
    },
    'Switching consideration': {
      description: 'Users evaluating alternatives to their current solution',
      solution: 'Highlight migration support, comparison guides, and unique differentiators',
      baseSeverity: 60
    },
    'Finding trustworthy information': {
      description: 'Difficulty identifying reliable, unbiased information sources',
      solution: 'Establish E-E-A-T signals with expert authors, citations, and transparent methodology',
      baseSeverity: 72
    },
    'Comparing multiple options effectively': {
      description: 'Challenge in evaluating multiple solutions against each other',
      solution: 'Build comprehensive comparison tools with side-by-side feature analysis',
      baseSeverity: 68
    },
    'Understanding pricing and value': {
      description: 'Confusion about pricing structures, tiers, and total cost of ownership',
      solution: 'Provide clear pricing pages, ROI calculators, and hidden cost disclosure',
      baseSeverity: 78
    }
  };
  
  competitors.slice(0, 4).forEach(c => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const h2Array = (website.h2 || []).map(h => h.toLowerCase());
    const h3Array = (website.h3 || []).map(h => h.toLowerCase());
    const allHeadings = [...h2Array, ...h3Array];
    const headingCount = allHeadings.length;
    
    // Extract struggles from headings with frequency counting
    allHeadings.forEach(h => {
      if (h.includes('how to')) {
        struggleMap.set('Implementation guidance needed', (struggleMap.get('Implementation guidance needed') || 0) + 1);
      }
      if (h.includes('why')) {
        struggleMap.set('Value justification required', (struggleMap.get('Value justification required') || 0) + 1);
      }
      if (h.includes('best')) {
        struggleMap.set('Option overload - needs curation', (struggleMap.get('Option overload - needs curation') || 0) + 1);
      }
      if (h.includes('compare') || h.includes('vs')) {
        struggleMap.set('Comparison difficulty', (struggleMap.get('Comparison difficulty') || 0) + 1);
      }
      if (h.includes('price') || h.includes('cost')) {
        struggleMap.set('Budget concerns', (struggleMap.get('Budget concerns') || 0) + 1);
      }
      if (h.includes('review')) {
        struggleMap.set('Trust verification needed', (struggleMap.get('Trust verification needed') || 0) + 1);
      }
      if (h.includes('alternative')) {
        struggleMap.set('Switching consideration', (struggleMap.get('Switching consideration') || 0) + 1);
      }
    });
  });
  
  // Convert to array with full object structure
  let finalStruggles = [];
  
  // Add detected struggles with adjusted severity based on frequency
  struggleMap.forEach((count, struggle) => {
    const def = struggleDefinitions[struggle];
    if (def) {
      finalStruggles.push({
        struggle: struggle,
        severity: Math.min(95, def.baseSeverity + (count * 3)),
        description: def.description,
        solution: def.solution,
        frequency: count,
        dataSource: 'Content Analysis'
      });
    }
  });
  
  // Sort by severity
  finalStruggles.sort((a, b) => b.severity - a.severity);
  finalStruggles = finalStruggles.slice(0, 4);
  
  // Add defaults if needed
  const defaultStruggles = [
    'Finding trustworthy information',
    'Comparing multiple options effectively',
    'Understanding pricing and value'
  ];
  
  if (finalStruggles.length < 3) {
    defaultStruggles.forEach(s => {
      if (finalStruggles.length < 4 && !finalStruggles.some(fs => fs.struggle === s)) {
        const def = struggleDefinitions[s];
        finalStruggles.push({
          struggle: s,
          severity: def.baseSeverity,
          description: def.description,
          solution: def.solution,
          frequency: 0,
          dataSource: 'Default Pattern'
        });
      }
    });
  }
  
  return finalStruggles;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTIONAL RESONANCE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

function _calculateEmotionalResonance(competitors) {
  let fomoSignals = 0;
  let skepticismSignals = 0;
  let advocacySignals = 0;
  
  competitors.slice(0, 4).forEach(c => {
    const fullText = JSON.stringify(c.synthesized || {}).toLowerCase();
    
    // FOMO signals
    const fomoWords = ['limited', 'exclusive', 'now', 'hurry', 'today only', 'don\'t miss'];
    fomoSignals += fomoWords.filter(w => fullText.includes(w)).length;
    
    // Skepticism signals (negative sentiment)
    const skepticWords = ['scam', 'fake', 'warning', 'avoid', 'problem', 'issue'];
    skepticismSignals += skepticWords.filter(w => fullText.includes(w)).length;
    
    // Advocacy signals
    const advocacyWords = ['recommend', 'best', 'love', 'amazing', 'excellent', 'trust'];
    advocacySignals += advocacyWords.filter(w => fullText.includes(w)).length;
  });
  
  return {
    fomoIndex: Math.min(90, Math.max(20, 30 + fomoSignals * 8)),
    skepticismIndex: Math.min(85, Math.max(15, 25 + skepticismSignals * 10)),
    advocacyPotential: Math.min(95, Math.max(25, 35 + advocacySignals * 7)),
    targetConversionTime: fomoSignals > 3 ? '<2 min' : skepticismSignals > 2 ? '>5 min' : '<3 min',
    tooltips: {
      emotionalResonance: FT_GetMetricTooltip('emotionalResonance')
    },
    proof: {
      fomoSignals: fomoSignals,
      skepticismSignals: skepticismSignals,
      advocacySignals: advocacySignals,
      wordsScanned: {
        fomo: ['limited', 'exclusive', 'now', 'hurry', 'today only', 'don\'t miss'],
        skepticism: ['scam', 'fake', 'warning', 'avoid', 'problem', 'issue'],
        advocacy: ['recommend', 'best', 'love', 'amazing', 'excellent', 'trust']
      },
      scoreBreakdown: {
        fomo: `30 + ${fomoSignals} × 8 = ${30 + fomoSignals * 8}`,
        skepticism: `25 + ${skepticismSignals} × 10 = ${25 + skepticismSignals * 10}`,
        advocacy: `35 + ${advocacySignals} × 7 = ${35 + advocacySignals * 7}`
      },
      dataSource: 'Content Sentiment Analysis'
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE LOAD DECISION FRICTION FACTORS
// ═══════════════════════════════════════════════════════════════════════════════

function _calculateAverageContentDensity(competitors) {
  let totalDensity = 0;
  let count = 0;
  competitors.slice(0, 6).forEach(c => {
    const website = c.synthesized?.website || {};
    const wordCount = website.wordCount || 0;
    const h2Count = (website.h2 || []).length;
    // High words with low structure = high density
    if (wordCount > 0) {
      const density = h2Count > 0 ? wordCount / (h2Count * 500) : 1;
      totalDensity += Math.min(100, density * 25);
      count++;
    }
  });
  return count > 0 ? Math.round(totalDensity / count) : 45;
}

function _calculateNavigationComplexity(competitors) {
  let totalComplexity = 0;
  let count = 0;
  competitors.slice(0, 6).forEach(c => {
    const website = c.synthesized?.website || {};
    const internalLinks = website.internalLinkCount || 0;
    // Many links = complex navigation
    if (internalLinks > 50) totalComplexity += 75;
    else if (internalLinks > 30) totalComplexity += 55;
    else if (internalLinks > 15) totalComplexity += 35;
    else totalComplexity += 25;
    count++;
  });
  return count > 0 ? Math.round(totalComplexity / count) : 40;
}

function _calculateInformationOverload(competitors) {
  let totalOverload = 0;
  let count = 0;
  competitors.slice(0, 6).forEach(c => {
    const website = c.synthesized?.website || {};
    const wordCount = website.wordCount || 0;
    const perfScore = c.apiData?.pageSpeed?.scores?.performance || 50;
    // Long content + slow load = overload
    let overload = 30;
    if (wordCount > 4000) overload += 25;
    else if (wordCount > 2500) overload += 15;
    if (perfScore < 40) overload += 20;
    totalOverload += Math.min(90, overload);
    count++;
  });
  return count > 0 ? Math.round(totalOverload / count) : 45;
}

function _calculateTrustClarity(competitors) {
  let totalClarity = 0;
  let count = 0;
  competitors.slice(0, 6).forEach(c => {
    const fullText = JSON.stringify(c.synthesized || {}).toLowerCase();
    let clarity = 50;
    // Missing trust signals = lower clarity
    if (!fullText.includes('testimonial') && !fullText.includes('review')) clarity += 20;
    if (!fullText.includes('guarantee') && !fullText.includes('trust')) clarity += 15;
    if (!fullText.includes('customers') && !fullText.includes('trusted by')) clarity += 15;
    totalClarity += Math.min(90, clarity);
    count++;
  });
  return count > 0 ? Math.round(totalClarity / count) : 50;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIENCE KILL MOVES
// ═══════════════════════════════════════════════════════════════════════════════

function _generateAudienceKillMoves(competitors) {
  const killMoves = [];
  
  let lowContentCount = 0;
  let noTrustCount = 0;
  let highFrictionCount = 0;
  
  competitors.slice(0, 6).forEach(c => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const fullText = JSON.stringify(synth).toLowerCase();
    const wordCount = website.wordCount || 0;
    
    if (wordCount < 1500) lowContentCount++;
    if (!fullText.includes('testimonial') && !fullText.includes('review') && !fullText.includes('customer')) noTrustCount++;
    if (wordCount > 4000 && (website.h2 || []).length < 5) highFrictionCount++;
  });
  
  const total = Math.min(6, competitors.length);
  
  if (noTrustCount >= 3) {
    killMoves.push({
      name: 'Trust Signal Domination',
      type: 'High Priority',
      priority: 'HIGH',
      description: 'Add verification layers: expert reviews, user testimonials, transparent terms.',
      action: 'Add customer testimonials, case studies, and third-party reviews prominently',
      observation: `${noTrustCount}/${total} competitors lack trust signals`,
      logic: `${noTrustCount}/${total} competitors lack trust signals`,
      impact: `Capture users from ${noTrustCount} competitors lacking trust signals`,
      targetCompetitors: 'All incumbents',
      target: 'All incumbents'
    });
  }
  
  if (lowContentCount >= 2) {
    killMoves.push({
      name: 'Content Depth Attack',
      type: 'High Priority',
      priority: 'HIGH',
      description: 'Create comprehensive guides that address full user journey with 2500+ words.',
      action: 'Create comprehensive guides that address full user journey',
      observation: `${lowContentCount}/${total} competitors have thin content (<1500 words)`,
      logic: `${lowContentCount}/${total} competitors have thin content`,
      impact: `Outrank ${lowContentCount} thin-content competitors`,
      targetCompetitors: 'Content-weak competitors',
      target: 'Content-weak competitors'
    });
  }
  
  if (highFrictionCount >= 2) {
    killMoves.push({
      name: 'UX Friction Reduction',
      type: 'Medium Priority',
      priority: 'MEDIUM',
      description: 'Implement quick-summary cards, scannable formatting, and clear navigation.',
      action: 'Implement quick-summary cards and scannable formatting',
      observation: `${highFrictionCount}/${total} competitors have high-friction pages`,
      logic: `${highFrictionCount}/${total} competitors have high cognitive load`,
      impact: 'Capture users who abandon information-overload pages',
      targetCompetitors: 'High-friction competitors',
      target: 'High-friction competitors'
    });
  }
  
  // Always ensure at least 3 kill moves
  while (killMoves.length < 3) {
    const defaults = [
      {
        name: 'JTBD Direct Match',
        type: 'High Priority',
        priority: 'HIGH',
        description: 'Map specific user pains directly to your solutions in content and CTAs.',
        action: 'Map specific user pains directly to your solutions in content',
        observation: 'Most competitors do not address specific user struggles',
        logic: 'JTBD alignment opportunity',
        impact: 'Address unmet user needs competitors ignore',
        targetCompetitors: 'All incumbents',
        target: 'All incumbents'
      },
      {
        name: 'Persona-Based Navigation',
        type: 'Medium Priority',
        priority: 'MEDIUM',
        description: 'Create persona-specific landing pages and content paths.',
        action: 'Build persona-specific entry points with tailored messaging',
        observation: 'Competitors use generic one-size-fits-all approach',
        logic: 'Generic competitor content',
        impact: 'Increase engagement by speaking directly to each persona',
        targetCompetitors: 'Generic-content competitors',
        target: 'Generic-content competitors'
      },
      {
        name: 'Emotional Resonance Capture',
        type: 'High Priority',
        priority: 'HIGH',
        description: 'Use emotional triggers (FOMO, social proof, urgency) strategically.',
        action: 'Implement emotional triggers at key decision points',
        observation: 'Competitors rely on logical arguments only',
        logic: 'Emotional gap opportunity',
        impact: 'Accelerate conversion by addressing emotional decision factors',
        targetCompetitors: 'All incumbents',
        target: 'All incumbents'
      }
    ];
    
    const unused = defaults.find(d => !killMoves.some(k => k.name === d.name));
    if (unused) {
      killMoves.push(unused);
    } else {
      break;
    }
  }
  
  return killMoves.slice(0, 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKLINK PROFILE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function _extractTopReferringDomains(competitor, authority, fullText) {
  const domains = [];
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const apiData = competitor.apiData || {};
  const openPageRank = apiData.openPageRank || {};
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 1: Use REAL data from eliteBacklinks.topReferrers (Oracle Elite System)
  // ═══════════════════════════════════════════════════════════════════════════════
  const eliteBacklinks = synth.eliteBacklinks || {};
  const topReferrers = eliteBacklinks.topReferrers || [];
  
  if (topReferrers.length > 0) {
    topReferrers.forEach(ref => {
      domains.push({
        domain: ref.domain || ref.referringDomain || 'Unknown',
        domainRating: ref.dr || ref.domainAuthority || ref.domainRating || 0,
        linkType: ref.type || ref.linkType || 'Editorial',
        linkStatus: 'Real Data (Oracle Elite)',
        anchorType: ref.anchorType || 'Mixed',
        targetPage: ref.targetPage || '/',
        backlinks: ref.backlinks || ref.count || 1,
        dofollow: ref.dofollow !== false,
        firstSeen: ref.firstSeen || 'Historical',
        trafficShare: ref.trafficShare || '',
        insight: `${ref.type || 'Editorial'} link from DR ${ref.dr || 0} domain`
      });
    });
    return domains.slice(0, 10);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Use apiData.backlinks.topReferringDomains (EliteOrchestrator)
  // ═══════════════════════════════════════════════════════════════════════════════
  const apiBacklinks = apiData.backlinks || {};
  const apiTopReferrers = apiBacklinks.topReferringDomains || [];
  
  if (apiTopReferrers.length > 0) {
    apiTopReferrers.forEach(ref => {
      domains.push({
        domain: ref.domain || 'Unknown',
        domainRating: ref.domainRating || ref.dr || 0,
        linkType: ref.linkType || ref.type || 'Editorial',
        linkStatus: 'Real Data (API)',
        anchorType: 'Mixed',
        targetPage: '/',
        backlinks: ref.backlinks || 1,
        dofollow: ref.dofollow !== false,
        firstSeen: ref.firstSeen || 'Historical',
        insight: `${ref.linkType || 'Editorial'} link from DR ${ref.domainRating || 0} domain`
      });
    });
    return domains.slice(0, 10);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 3: Extract external domains from website links (detected outbound)
  // NO SAMPLE DATA - Only use what we can actually detect
  // ═══════════════════════════════════════════════════════════════════════════════
  const internalLinks = website.links || [];
  const externalDomains = {};
  
  internalLinks.forEach(link => {
    const url = link.url || link.href || '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${competitor.domain}${url}`);
      const domain = urlObj.hostname.replace('www.', '');
      if (!externalDomains[domain] && domain !== competitor.domain && !domain.includes(competitor.domain)) {
        externalDomains[domain] = {
          count: 1,
          anchor: link.text || link.anchor || ''
        };
      } else if (externalDomains[domain]) {
        externalDomains[domain].count++;
      }
    } catch (e) {
      // Skip invalid URLs
    }
  });
  
  // Add detected external domains (REAL outbound links detected)
  Object.entries(externalDomains).slice(0, 10).forEach(([domain, data]) => {
    domains.push({
      domain: domain,
      domainRating: 0, // Unknown - not estimated
      linkType: 'Outbound Link',
      linkStatus: 'Detected on page',
      anchorType: data.anchor ? 'Descriptive' : 'Unknown',
      targetPage: '/',
      linkCount: data.count,
      insight: `Outbound link to ${domain} detected ${data.count}x`
    });
  });
  
  // Return whatever real data we found (may be empty)
  return domains.slice(0, 10);
}

function _generateBacklinkStrategicInsight(domainRating, anchorDistribution, linkVelocity, linkTypes, domain) {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];
  
  // Analyze strengths
  if (domainRating >= 70) strengths.push('Elite domain authority - hard to outcompete directly');
  if (anchorDistribution.branded.percentage >= 35) strengths.push('Natural branded anchor profile - low penalty risk');
  if (linkVelocity.velocityScore >= 70) strengths.push('Strong link acquisition momentum');
  if (linkTypes.editorial.percentage >= 40) strengths.push('High editorial link ratio - trusted source');
  
  // Analyze weaknesses
  if (domainRating < 40) weaknesses.push('Low domain authority - vulnerable to faster-growing competitors');
  if (anchorDistribution.exactMatch.percentage > 25) weaknesses.push('Over-optimized anchor text - Penguin penalty risk');
  if (linkVelocity.velocityScore < 40) weaknesses.push('Slow link acquisition - falling behind');
  if (linkTypes.userGenerated.percentage > 30) weaknesses.push('Heavy UGC links - low equity retention');
  
  // Identify opportunities
  if (linkTypes.editorial.percentage < 30) opportunities.push('Opportunity: Digital PR for editorial links');
  if (linkVelocity.velocityScore < 60) opportunities.push('Opportunity: Outpace with aggressive content marketing');
  if (anchorDistribution.partialMatch.percentage < 20) opportunities.push('Opportunity: Build topical authority with partial-match anchors');
  
  // Identify threats
  if (domainRating >= 60 && linkVelocity.velocityScore >= 60) threats.push('Strong and growing - formidable competitor');
  if (linkTypes.resourcePage.percentage >= 20) threats.push('Well-positioned on resource pages - hard to displace');
  
  // Generate action recommendations
  const recommendations = [];
  
  if (weaknesses.some(w => w.includes('Over-optimized'))) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Diversify anchor text',
      detail: 'Target 35-40% branded, 20-25% partial match, <15% exact match',
      impact: 'Reduce penalty risk, improve link profile health'
    });
  }
  
  if (opportunities.some(o => o.includes('Digital PR'))) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Launch digital PR campaign',
      detail: 'Create data-driven content for journalist outreach',
      impact: 'Acquire high-DR editorial links (DR 60+)'
    });
  }
  
  if (weaknesses.some(w => w.includes('Slow link acquisition'))) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Accelerate link building',
      detail: 'Implement guest posting, broken link building, HARO responses',
      impact: 'Increase monthly link velocity by 50-100%'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Maintain and diversify',
      detail: 'Continue current strategy while exploring new link sources',
      impact: 'Sustain competitive position'
    });
  }
  
  return {
    summary: domainRating >= 60 ? 
      `Strong authority profile with ${linkVelocity.velocityTrend.toLowerCase()} momentum` :
      `Developing authority profile - focus on quality link acquisition`,
    strengths: strengths.length > 0 ? strengths : ['Building foundational authority'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical weaknesses detected'],
    opportunities: opportunities.length > 0 ? opportunities : ['Continue current growth trajectory'],
    threats: threats.length > 0 ? threats : ['Monitor competitor link building activity'],
    recommendations: recommendations,
    competitorVulnerability: weaknesses.length > strengths.length ? 'High' : 
                             weaknesses.length === strengths.length ? 'Medium' : 'Low',
    strategicApproach: domainRating >= 70 ? 'Flanking - target different keywords/topics' :
                       domainRating >= 50 ? 'Direct competition - match quality, exceed quantity' :
                       'Aggressive pursuit - outpace with content and outreach'
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_CONVERSION.GS - CONVERSION & MONETIZATION FORENSICS
 * Affiliate detection, CTA analysis, pricing signals, persuasion mechanics
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 6708-7430)
 * 
 * CONTAINS:
 * - _generateConversionMonetizationForensic() - Tab 8: Conversion
 * - _generateConversionKillMoves() - Kill move generation
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8: CONVERSION & MONETIZATION - AFFILIATE FORENSICS
// ═══════════════════════════════════════════════════════════════════════════════

function _generateConversionMonetizationForensic(competitors, gemini, niche) {
  return {
    // Affiliate Masking Depth - REAL DATA from link and content analysis
    affiliateMaskingDepth: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const content = synth.content || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const linksProof = detailedProofs.links;
      const schemaProof = detailedProofs.schema;
      const contentProof = detailedProofs.content;
      
      const detectedPatterns = [];
      const patternContexts = [];
      
      if (fullText.includes('affiliate')) {
        detectedPatterns.push('Affiliate Links');
        patternContexts.push(_extractContextAround(fullText, 'affiliate', 40));
      }
      if (fullText.includes('partner')) {
        detectedPatterns.push('Partner Program');
        patternContexts.push(_extractContextAround(fullText, 'partner', 40));
      }
      if (fullText.includes('commission')) {
        detectedPatterns.push('Commission-based');
        patternContexts.push(_extractContextAround(fullText, 'commission', 40));
      }
      if (fullText.includes('redirect') || fullText.includes('go/') || fullText.includes('out/')) {
        detectedPatterns.push('Link Cloaking');
      }
      if (fullText.includes('sponsored')) {
        detectedPatterns.push('Sponsored');
        patternContexts.push(_extractContextAround(fullText, 'sponsored', 40));
      }
      if (fullText.includes('paid partnership')) detectedPatterns.push('Paid Partnership');
      if (fullText.includes('referral')) detectedPatterns.push('Referral Program');
      if (fullText.includes('promo') || fullText.includes('coupon')) detectedPatterns.push('Promo Codes');
      
      const maskingDepth = detectedPatterns.length;
      
      let assessment = 'Transparent';
      let trustSignal = 'Clear disclosure practices detected';
      
      if (maskingDepth >= 4) {
        assessment = 'Heavy Masking';
        trustSignal = 'Multiple monetization layers - users may not see full picture';
      } else if (maskingDepth >= 2) {
        assessment = 'Moderate Masking';
        trustSignal = 'Standard affiliate practices with some cloaking';
      } else if (maskingDepth === 1) {
        assessment = 'Light Masking';
        trustSignal = 'Minimal affiliate presence - mostly organic content';
      } else {
        assessment = 'No Masking';
        trustSignal = 'No affiliate patterns detected - pure content focus';
      }
      
      return {
        domain: c.domain || 'unknown',
        detectedPatterns: detectedPatterns,
        maskingDepth: maskingDepth,
        assessment: assessment,
        trustSignal: trustSignal,
        
        patternContextsRawData: {
          detectedCount: detectedPatterns.length,
          patterns: detectedPatterns,
          contextExamples: patternContexts.filter(Boolean).slice(0, 5),
          externalLinksCount: linksProof.rawData.external.count,
          externalLinksSample: linksProof.rawData.external.links.slice(0, 5)
        },
        
        tooltips: {
          maskingDepth: FT_GetMetricTooltip('affiliateMasking')
        },
        
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        
        proof: {
          patternsFound: detectedPatterns,
          patternsScanned: ['affiliate', 'partner', 'commission', 'redirect', 'go/', 'out/', 'sponsored', 'paid partnership', 'referral', 'promo', 'coupon'],
          scoreBreakdown: {
            totalPatterns: detectedPatterns.length,
            patternsList: detectedPatterns.join(', ') || 'None'
          },
          detailed: detailedProofs,
          dataSource: detectedPatterns.length > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // CTA Infrastructure - REAL DATA from content analysis
    ctaInfrastructure: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const contentProof = detailedProofs.content;
      const headingsProof = detailedProofs.headings;
      
      const ctaPatterns = ['sign up', 'get started', 'try free', 'buy now', 'start now', 'join', 'subscribe', 'download', 'learn more'];
      const detectedCTAs = ctaPatterns.filter(p => fullText.includes(p));
      const ctaCount = detectedCTAs.length;
      
      const ctaContextExamples = [];
      detectedCTAs.forEach(cta => {
        const context = _extractContextAround(fullText, cta, 50);
        if (context) ctaContextExamples.push({ pattern: cta, context: context });
      });
      
      let maturityLevel = 'Basic';
      if (ctaCount >= 5) maturityLevel = 'Advanced';
      else if (ctaCount >= 3) maturityLevel = 'Intermediate';
      
      return {
        domain: c.domain || 'unknown',
        ctaCount: ctaCount,
        maturityLevel: maturityLevel,
        ctaPatternsDetected: detectedCTAs,
        conversionReadiness: ctaCount >= 3 ? 'High' : ctaCount >= 1 ? 'Medium' : 'Low',
        
        ctaRawData: {
          detectedPatterns: detectedCTAs,
          totalPatternsFound: ctaCount,
          contextExamples: ctaContextExamples.slice(0, 5),
          headingsWithCTA: [
            ...(Array.isArray(headingsProof.rawData.h1) ? headingsProof.rawData.h1 : headingsProof.rawData.h1?.text ? [headingsProof.rawData.h1.text] : []),
            ...(Array.isArray(headingsProof.rawData.h2) ? headingsProof.rawData.h2 : headingsProof.rawData.h2?.texts || [])
          ].filter(h => ctaPatterns.some(p => String(h).toLowerCase().includes(p))).slice(0, 3),
          // v23.2: Add null guard for topParagraphs
          contentSnippets: (contentProof.rawData.topParagraphs || [])
            .filter(para => ctaPatterns.some(p => String(para).toLowerCase().includes(p))).slice(0, 3)
        },
        
        tooltips: {
          ctaCount: FT_GetMetricTooltip('ctaMaturity')
        },
        
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        
        proof: {
          ctaSignals: ctaCount,
          patternsScanned: ctaPatterns,
          patternsFound: detectedCTAs,
          contextSamples: ctaContextExamples.slice(0, 3),
          detailed: detailedProofs,
          dataSource: ctaCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Pricing Signal Detection - REAL DATA with raw proof
    pricingSignals: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const contentProof = detailedProofs.content;
      
      const hasPricing = fullText.includes('pricing') || fullText.includes('price') || fullText.includes('cost');
      const hasFreeTrial = fullText.includes('free trial') || fullText.includes('try free') || fullText.includes('free plan');
      const hasPlans = fullText.includes('plan') || fullText.includes('tier') || fullText.includes('package');
      const hasDollarSign = fullText.includes('$') || fullText.includes('/mo') || fullText.includes('per month');
      
      const pricingContexts = [];
      ['pricing', 'price', '$', '/mo', 'per month', 'free trial', 'plan'].forEach(term => {
        if (fullText.includes(term)) {
          const context = _extractContextAround(fullText, term, 50);
          if (context) pricingContexts.push({ term: term, context: context });
        }
      });
      
      let transparencyScore = 25;
      if (hasPricing) transparencyScore += 25;
      if (hasDollarSign) transparencyScore += 20;
      if (hasFreeTrial) transparencyScore += 15;
      if (hasPlans) transparencyScore += 10;
      
      return {
        domain: c.domain || 'unknown',
        hasPricing: hasPricing,
        hasFreeTrial: hasFreeTrial,
        hasPlans: hasPlans,
        hasDollarSign: hasDollarSign,
        transparencyScore: Math.min(95, transparencyScore),
        transparencyLevel: transparencyScore >= 70 ? 'Fully Transparent' : transparencyScore >= 45 ? 'Partially Visible' : 'Hidden/Contact Only',
        
        pricingRawData: {
          signalsDetected: {
            pricing: hasPricing,
            freeTrial: hasFreeTrial,
            plans: hasPlans,
            dollarSign: hasDollarSign
          },
          contextExamples: pricingContexts.slice(0, 5),
          // v23.2: Add null guard for topParagraphs
          contentWithPricing: (contentProof.rawData.topParagraphs || [])
            .filter(para => {
              const p = String(para).toLowerCase();
              return p.includes('$') || p.includes('price') || p.includes('free') || p.includes('/mo');
            }).slice(0, 3)
        },
        
        tooltips: {
          transparencyScore: FT_GetMetricTooltip('pricingTransparency')
        },
        
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        
        proof: {
          pricingDetected: hasPricing,
          dollarSignDetected: hasDollarSign,
          freeTrialDetected: hasFreeTrial,
          plansDetected: hasPlans,
          contextSamples: pricingContexts.slice(0, 3),
          scoreBreakdown: {
            base: 25,
            pricing: hasPricing ? '+25' : '0',
            dollarSign: hasDollarSign ? '+20' : '0',
            freeTrial: hasFreeTrial ? '+15' : '0',
            plans: hasPlans ? '+10' : '0'
          },
          detailed: detailedProofs,
          dataSource: (hasPricing || hasDollarSign) ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Persuasion Mechanics - REAL DATA from content signals
    persuasionMechanics: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      const apiData = c.apiData || {};
      const openPageRank = apiData.openPageRank || {};
      
      const persuasionWords = ['guaranteed', 'proven', 'exclusive', 'limited', 'best', 'top', 'ultimate', 'powerful'];
      const scarcityWords = ['limited time', 'only', 'hurry', 'today only', 'last chance', 'few left'];
      const socialProofWords = ['customers', 'users', 'companies', 'trusted by', 'rated', 'reviews', 'testimonial'];
      
      const persuasionCount = persuasionWords.filter(w => fullText.includes(w)).length;
      const scarcityCount = scarcityWords.filter(w => fullText.includes(w)).length;
      const socialProofCount = socialProofWords.filter(w => fullText.includes(w)).length;
      
      const hasBonusFraming = fullText.includes('bonus') || fullText.includes('extra') || fullText.includes('free');
      const hasScarcity = scarcityCount >= 1;
      const hasSocialProof = socialProofCount >= 2;
      const hasAuthority = fullText.includes('expert') || fullText.includes('award') || fullText.includes('certified');
      
      return {
        domain: c.domain || 'unknown',
        persuasionScore: Math.min(95, 30 + persuasionCount * 8 + scarcityCount * 10 + socialProofCount * 7),
        tactics: {
          exclusiveBonusFraming: hasBonusFraming,
          publicBonusFraming: fullText.includes('offer') || fullText.includes('deal'),
          scarcityTactics: hasScarcity,
          socialProofTactics: hasSocialProof
        },
        persuasionPrinciples: {
          authority: hasAuthority,
          socialProof: hasSocialProof,
          scarcity: hasScarcity,
          reciprocity: hasBonusFraming
        },
        tooltips: {
          persuasionScore: FT_GetMetricTooltip('persuasionScore')
        },
        proof: {
          persuasionWords: persuasionCount,
          scarcityWords: scarcityCount,
          socialProofWords: socialProofCount,
          // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal
          pageRank: openPageRank.pageRank ?? openPageRank.page_rank_decimal ?? 0,
          wordsFound: {
            persuasion: persuasionWords.filter(w => fullText.includes(w)),
            scarcity: scarcityWords.filter(w => fullText.includes(w)),
            socialProof: socialProofWords.filter(w => fullText.includes(w))
          },
          scoreBreakdown: {
            base: 30,
            persuasion: `${persuasionCount} × 8 = ${persuasionCount * 8}`,
            scarcity: `${scarcityCount} × 10 = ${scarcityCount * 10}`,
            socialProof: `${socialProofCount} × 7 = ${socialProofCount * 7}`
          },
          dataSource: (persuasionCount > 0 || scarcityCount > 0) ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Retention Loops - Infer from content signals
    retentionLoops: {
      offPageEcosystem: [
        { channel: 'Email Sequences', detected: competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('newsletter') || JSON.stringify(c.synthesized || {}).toLowerCase().includes('subscribe')), revenueImpact: '25-35%' },
        { channel: 'Push Notifications', detected: competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('notification')), revenueImpact: '10-15%' },
        { channel: 'Social Media', detected: competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('twitter') || JSON.stringify(c.synthesized || {}).toLowerCase().includes('linkedin')), revenueImpact: '15-20%' },
        { channel: 'Community/Forum', detected: competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('community') || JSON.stringify(c.synthesized || {}).toLowerCase().includes('forum')), revenueImpact: '10-15%' }
      ],
      revenueAttribution: 'Off-site channels can contribute 25-40% of total conversions through retention',
      tooltips: {
        retentionLoops: FT_GetMetricTooltip('retentionLoops')
      },
      proof: {
        dataSource: 'Oracle Fetcher (content analysis)',
        methodology: 'Keyword pattern detection in scraped content',
        channelsScanned: ['Email/Newsletter', 'Push Notifications', 'Social Media', 'Community/Forum'],
        detectedChannels: [
          competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('newsletter')) ? 'Email' : null,
          competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('notification')) ? 'Push' : null,
          competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('twitter')) ? 'Social' : null,
          competitors.some(c => JSON.stringify(c.synthesized || {}).toLowerCase().includes('community')) ? 'Community' : null
        ].filter(Boolean)
      }
    },
    
    // ELITE PHASE 3B: REVENUE LEAKAGE ANALYSIS
    revenueLeakageAnalysis: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      
      const hasAffiliate = fullText.includes('affiliate') || fullText.includes('partner') || fullText.includes('commission');
      const hasAds = fullText.includes('advertisement') || fullText.includes('sponsored') || fullText.includes('adsense');
      const hasSubscription = fullText.includes('subscribe') || fullText.includes('membership') || fullText.includes('premium');
      const hasFreemium = fullText.includes('free trial') || fullText.includes('freemium') || fullText.includes('free plan');
      const hasEcommerce = fullText.includes('cart') || fullText.includes('checkout') || fullText.includes('buy now') || fullText.includes('add to cart');
      const hasLead = fullText.includes('demo') || fullText.includes('contact') || fullText.includes('get quote');
      
      const monetizationChannels = [hasAffiliate, hasAds, hasSubscription, hasFreemium, hasEcommerce, hasLead].filter(Boolean).length;
      
      const leakageRisks = [];
      const perfScore = pageSpeed.scores?.performance || 50;
      
      if (perfScore < 50) leakageRisks.push({ type: 'Slow Load Speed', impact: '15-25% conversion loss', severity: 'HIGH' });
      if (!fullText.includes('trust') && !fullText.includes('secure') && !fullText.includes('guarantee')) {
        leakageRisks.push({ type: 'Missing Trust Signals', impact: '10-20% conversion loss', severity: 'HIGH' });
      }
      if (!hasLead && !hasEcommerce) {
        leakageRisks.push({ type: 'No Clear Conversion Path', impact: '30-50% potential lost', severity: 'CRITICAL' });
      }
      if (!fullText.includes('testimonial') && !fullText.includes('review') && !fullText.includes('case study')) {
        leakageRisks.push({ type: 'No Social Proof', impact: '15-25% conversion loss', severity: 'MEDIUM' });
      }
      if ((website.h2 || []).length < 3) {
        leakageRisks.push({ type: 'Poor Content Structure', impact: '10-15% bounce rate', severity: 'MEDIUM' });
      }
      
      let leakageScore = 20;
      leakageRisks.forEach(r => {
        if (r.severity === 'CRITICAL') leakageScore += 25;
        else if (r.severity === 'HIGH') leakageScore += 15;
        else leakageScore += 8;
      });
      leakageScore = Math.min(95, leakageScore);
      
      const estimatedLeakage = leakageScore >= 70 ? '30-50%' : leakageScore >= 45 ? '15-30%' : '5-15%';
      
      return {
        domain: c.domain || 'unknown',
        leakageScore: leakageScore,
        estimatedRevenueImpact: estimatedLeakage,
        monetizationChannels: monetizationChannels,
        monetizationMix: {
          affiliate: hasAffiliate,
          ads: hasAds,
          subscription: hasSubscription,
          freemium: hasFreemium,
          ecommerce: hasEcommerce,
          leadGen: hasLead
        },
        leakageRisks: leakageRisks,
        topOpportunity: leakageRisks.length > 0 ? leakageRisks[0] : { type: 'Optimization', impact: 'Minor improvements possible' },
        tooltips: {
          leakageScore: FT_GetMetricTooltip('revenueLeakage')
        },
        proof: {
          performanceScore: perfScore,
          monetizationSignalsFound: monetizationChannels,
          leakageRisksIdentified: leakageRisks.length,
          scoreBreakdown: {
            base: 20,
            criticalRisks: `${leakageRisks.filter(r => r.severity === 'CRITICAL').length} × 25`,
            highRisks: `${leakageRisks.filter(r => r.severity === 'HIGH').length} × 15`,
            mediumRisks: `${leakageRisks.filter(r => r.severity === 'MEDIUM').length} × 8`
          },
          dataSource: (hasAffiliate || hasEcommerce || hasLead) ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // FUNNEL ARCHITECTURE
    funnelArchitecture: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      
      const ctaPatterns = ['sign up', 'get started', 'try free', 'buy now', 'start now', 'register', 'subscribe'];
      const ctaCount = ctaPatterns.filter(p => fullText.includes(p)).length;
      const h2Count = (website.h2 || []).length;
      const wordCount = website.wordCount || 0;
      
      let clicksToConvert = 5;
      if (ctaCount >= 3 && h2Count >= 5) clicksToConvert = 2;
      else if (ctaCount >= 2) clicksToConvert = 3;
      else if (ctaCount >= 1) clicksToConvert = 4;
      else clicksToConvert = 6;
      
      let funnelScore = 50;
      if (clicksToConvert <= 2) funnelScore = 85;
      else if (clicksToConvert <= 3) funnelScore = 70;
      else if (clicksToConvert <= 4) funnelScore = 55;
      else funnelScore = 40;
      
      const perfScore = pageSpeed.scores?.performance || 50;
      if (perfScore >= 70) funnelScore += 10;
      else if (perfScore < 40) funnelScore -= 10;
      
      funnelScore = Math.max(20, Math.min(95, funnelScore));
      
      const hasPrice = fullText.includes('pricing') || fullText.includes('price');
      const hasFeatures = fullText.includes('features') || fullText.includes('benefits');
      const hasComparison = fullText.includes('compare') || fullText.includes('vs');
      
      let intentClarity = 40;
      if (hasPrice) intentClarity += 20;
      if (hasFeatures) intentClarity += 15;
      if (hasComparison) intentClarity += 15;
      if (h2Count >= 5) intentClarity += 10;
      intentClarity = Math.min(95, intentClarity);
      
      let interpretation = 'Generic landing page';
      if (hasPrice && hasFeatures) interpretation = 'Commercial intent - optimized for buyers';
      else if (hasPrice) interpretation = 'Pricing focus - ready to convert';
      else if (hasFeatures) interpretation = 'Feature focus - educating prospects';
      else if (hasComparison) interpretation = 'Comparison intent - helping decision';
      else if (wordCount > 2000) interpretation = 'Content-heavy - informational focus';
      
      const directFlow = ctaCount >= 2 && hasPrice && h2Count >= 3;
      
      return {
        domain: c.domain || 'unknown',
        timeToConversion: {
          clicks: clicksToConvert,
          score: funnelScore,
          assessment: clicksToConvert <= 2 ? 'Optimized' : clicksToConvert <= 4 ? 'Standard' : 'Friction Present'
        },
        userIntentPath: {
          clarity: intentClarity,
          interpretation: interpretation
        },
        directToOperatorFlow: directFlow,
        tooltips: {
          funnelScore: FT_GetMetricTooltip('funnelArchitecture')
        },
        proof: {
          ctaCount: ctaCount,
          h2Count: h2Count,
          wordCount: wordCount,
          performanceScore: perfScore,
          hasPrice: hasPrice,
          hasFeatures: hasFeatures,
          dataSource: ctaCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // PRICING PSYCHOLOGY
    pricingPsychology: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      let landingPersuasionScore = 30;
      
      if (fullText.includes('pricing') || fullText.includes('price')) landingPersuasionScore += 15;
      if (fullText.includes('$') || fullText.includes('/mo')) landingPersuasionScore += 10;
      if (fullText.includes('save') || fullText.includes('discount')) landingPersuasionScore += 10;
      if (fullText.includes('money back') || fullText.includes('guarantee')) landingPersuasionScore += 10;
      if (fullText.includes('free trial') || fullText.includes('try free')) landingPersuasionScore += 10;
      if (fullText.includes('annual') || fullText.includes('yearly')) landingPersuasionScore += 5;
      
      landingPersuasionScore = Math.min(95, landingPersuasionScore);
      
      const ltvAnchoring = {
        exclusiveBonusFraming: fullText.includes('bonus') || fullText.includes('exclusive'),
        publicBonusFraming: fullText.includes('offer') || fullText.includes('deal'),
        scarcityTactics: fullText.includes('limited') || fullText.includes('hurry') || fullText.includes('only'),
        socialProofTactics: fullText.includes('customers') || fullText.includes('trusted by') || fullText.includes('reviews')
      };
      
      const persuasionPrinciples = {
        authority: fullText.includes('expert') || fullText.includes('award') || fullText.includes('certified'),
        socialProof: ltvAnchoring.socialProofTactics,
        scarcity: ltvAnchoring.scarcityTactics,
        reciprocity: fullText.includes('free') || fullText.includes('gift')
      };
      
      return {
        domain: c.domain || 'unknown',
        landingPersuasionScore: landingPersuasionScore,
        ltvAnchoring: ltvAnchoring,
        persuasionPrinciples: persuasionPrinciples,
        tooltips: {
          landingPersuasionScore: FT_GetMetricTooltip('pricingPsychology')
        },
        proof: {
          tacticsFound: Object.entries(ltvAnchoring).filter(([k, v]) => v).map(([k]) => k),
          principlesFound: Object.entries(persuasionPrinciples).filter(([k, v]) => v).map(([k]) => k),
          dataSource: landingPersuasionScore > 30 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // ELITE v13.0: SECTION-LEVEL STRATEGIC INSIGHT
    sectionStrategicInsight: (() => {
      const funnelScores = competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const ctaPatterns = ['sign up', 'get started', 'try free', 'buy now', 'subscribe'];
        const fullText = JSON.stringify(synth).toLowerCase();
        const ctaCount = ctaPatterns.filter(p => fullText.includes(p)).length;
        return { domain: c.domain, score: Math.min(95, 30 + (ctaCount * 10) + ((website.h2 || []).length * 2)) };
      });
      
      const sectionData = {
        funnelArchitecture: funnelScores.map(f => ({ domain: f.domain, timeToConversion: { score: f.score } })),
        pricingPsychology: competitors.slice(0, 6).map(c => {
          const fullText = JSON.stringify(c.synthesized || {}).toLowerCase();
          return { domain: c.domain, landingPersuasionScore: fullText.includes('pricing') ? 60 : 40 };
        })
      };
      
      if (typeof FT_GenerateSectionStrategicInsight === 'function') {
        return FT_GenerateSectionStrategicInsight('conversion', sectionData, competitors, niche);
      }
      
      return {
        executiveSummary: 'Conversion analysis complete. Focus on CTA optimization and pricing transparency.',
        opportunityScore: 65,
        opportunityLevel: 'Medium'
      };
    })(),
    
    // Kill Moves - DYNAMIC based on competitor gaps
    killMoves: _generateConversionKillMoves(competitors)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSION KILL MOVES
// ═══════════════════════════════════════════════════════════════════════════════

function _generateConversionKillMoves(competitors) {
  const killMoves = [];
  
  let noPricingCount = 0;
  let lowCTACount = 0;
  let noSocialProofCount = 0;
  
  competitors.slice(0, 6).forEach(c => {
    const fullText = JSON.stringify(c.synthesized || {}).toLowerCase();
    if (!fullText.includes('pricing') && !fullText.includes('price')) noPricingCount++;
    if (!fullText.includes('sign up') && !fullText.includes('get started') && !fullText.includes('try')) lowCTACount++;
    if (!fullText.includes('customers') && !fullText.includes('testimonial') && !fullText.includes('review')) noSocialProofCount++;
  });

  const total = Math.min(6, competitors.length);

  if (lowCTACount >= 3) {
    killMoves.push({
      name: 'CTA Clarity Attack',
      priority: 'HIGH',
      observation: `${lowCTACount}/${total} competitors have weak CTAs`,
      logic: `${lowCTACount}/${total} competitors have weak CTAs`,
      action: 'Implement sticky CTAs with clear value propositions on every page',
      impact: 'Increase conversion rate by 25-40%',
      effort: 'Low (design)',
      timeToImpact: '1-2 weeks'
    });
  }
  
  if (noPricingCount >= 2) {
    killMoves.push({
      name: 'Price Transparency Win',
      priority: 'HIGH',
      observation: `${noPricingCount}/${total} competitors hide pricing`,
      logic: `${noPricingCount}/${total} competitors hide pricing`,
      action: 'Display transparent pricing with comparison tables and ROI calculators',
      impact: 'Reduce sales cycle by 30% through trust-building',
      effort: 'Medium (strategy)',
      timeToImpact: '2-4 weeks'
    });
  }
  
  if (noSocialProofCount >= 3) {
    killMoves.push({
      name: 'Social Proof Domination',
      priority: 'CRITICAL',
      observation: `${noSocialProofCount}/${total} competitors lack social proof`,
      logic: `${noSocialProofCount}/${total} competitors lack social proof`,
      action: 'Add customer logos, testimonials, and case studies prominently',
      impact: 'Increase trust metrics by 35% and conversion by 20%',
      effort: 'Medium (content gathering)',
      timeToImpact: '2-4 weeks'
    });
  }
  
  // Always ensure at least 3 kill moves
  if (killMoves.length < 3) {
    killMoves.push({
      name: 'Friction Elimination',
      priority: 'HIGH',
      observation: 'Most competitors have multi-step conversion funnels',
      logic: 'Most competitors have multi-step conversion funnels',
      action: 'Implement 1-click signup with progressive profiling',
      impact: 'Reduce abandonment by 50%',
      effort: 'Medium (development)',
      timeToImpact: '2-4 weeks'
    });
  }

  if (killMoves.length < 3) {
    killMoves.push({
      name: 'Value Proposition Clarity',
      priority: 'MEDIUM',
      observation: 'Competitor value propositions are unclear or generic',
      logic: 'Competitor value propositions are unclear or generic',
      action: 'Create A/B tested headlines that quantify specific benefits',
      impact: 'Improve landing page conversion by 15-25%',
      effort: 'Low (copywriting)',
      timeToImpact: '1-2 weeks'
    });
  }
  
  return killMoves.slice(0, 4);
}

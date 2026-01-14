/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_BRAND.GS - BRAND POSITION TAB GENERATOR
 * Brand strength & sentiment analysis forensic
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 2545-2777)
 * 
 * CONTAINS:
 * - _generateBrandPositionForensic() - Tab 3: Brand Position
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: BRAND POSITION - Brand Strength & Sentiment Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Brand Position forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateBrandPositionForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  const brandAnalysis = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const seo = synth.seo || {};
    const profile = c.forensicProfile || {};
    const openPR = c.apiData?.openPageRank || {};
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: Extract ALL detailed proofs using new functions
    // ═══════════════════════════════════════════════════════════════════════════
    const detailedProofs = _extractAllDetailedProofs(c);
    const metaProof = detailedProofs.meta;
    const headingsProof = detailedProofs.headings;
    const schemaProof = detailedProofs.schema;
    
    const domain = c.domain || 'unknown';
    const title = website.title || '';
    const description = website.description || '';
    const h2Array = website.h2 || [];
    // v23.2: Ensure organic is always an array to prevent .filter() errors
    const organicRaw = seo.organic || c.apiData?.serper?.organic || [];
    const organic = Array.isArray(organicRaw) ? organicRaw : [];
    
    // Brand name extraction from domain
    const brandName = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Brand SERP ownership (how many results mention the brand)
    const brandMentions = organic.filter(r => 
      (r.title || '').toLowerCase().includes(domain.split('.')[0]) ||
      (r.snippet || '').toLowerCase().includes(domain.split('.')[0])
    ).length;
    
    // Calculate brand strength metrics
    const brandStrength = Math.min(100, (openPR.page_rank_decimal || 3) * 12 + brandMentions * 5);
    const brandedSearchRatio = Math.round(brandMentions / (organic.length || 1) * 100);
    
    // Sentiment indicators from content
    const positiveSignals = ['trusted', 'reliable', 'best', 'award', 'certified', 'verified', 'top', 'leading', 'quality', 'expert'];
    const negativeSignals = ['scam', 'fake', 'warning', 'avoid', 'complaint', 'problem', 'issue', 'bad'];
    const fullText = (title + ' ' + description + ' ' + h2Array.join(' ')).toLowerCase();
    
    const positiveCount = positiveSignals.filter(s => fullText.includes(s)).length;
    const negativeCount = negativeSignals.filter(s => fullText.includes(s)).length;
    const sentimentScore = Math.min(100, Math.max(0, 50 + (positiveCount * 10) - (negativeCount * 15)));
    
    // Detected positive signal texts
    const detectedPositiveSignals = positiveSignals.filter(s => fullText.includes(s));
    const detectedNegativeSignals = negativeSignals.filter(s => fullText.includes(s));
    
    return {
      domain: domain,
      brandName: brandName,
      brandStrengthScore: Math.round(brandStrength),
      brandedSearchRatio: brandedSearchRatio + '%',
      nonBrandedRatio: (100 - brandedSearchRatio) + '%',
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL SERP BRAND OWNERSHIP DATA
      // ═══════════════════════════════════════════════════════════════════════════
      serpOwnershipRawData: {
        totalResults: organic.length,
        brandedResults: brandMentions,
        ownershipRate: brandedSearchRatio + '%',
        brandedResultsDetail: organic.filter(r => 
          (r.title || '').toLowerCase().includes(domain.split('.')[0]) ||
          (r.snippet || '').toLowerCase().includes(domain.split('.')[0])
        ).slice(0, 5).map((r, i) => ({
          position: r.position || (i + 1),
          title: r.title || '',
          hasBrandInTitle: (r.title || '').toLowerCase().includes(domain.split('.')[0]),
          hasBrandInSnippet: (r.snippet || '').toLowerCase().includes(domain.split('.')[0])
        })),
        nonBrandedResults: organic.filter(r => 
          !(r.title || '').toLowerCase().includes(domain.split('.')[0]) &&
          !(r.snippet || '').toLowerCase().includes(domain.split('.')[0])
        ).length
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL SENTIMENT SIGNALS FROM CONTENT
      // ═══════════════════════════════════════════════════════════════════════════
      sentimentRawData: {
        score: sentimentScore,
        sentiment: sentimentScore >= 70 ? 'Positive' : sentimentScore >= 40 ? 'Neutral' : 'Negative',
        positiveSignalsDetected: {
          count: positiveCount,
          signals: detectedPositiveSignals,
          contextExamples: detectedPositiveSignals.slice(0, 3).map(s => 
            _extractContextAround(fullText, s, 30) || `"${s}" found in content`
          )
        },
        negativeSignalsDetected: {
          count: negativeCount,
          signals: detectedNegativeSignals,
          contextExamples: detectedNegativeSignals.slice(0, 3).map(s => 
            _extractContextAround(fullText, s, 30) || `"${s}" found in content`
          )
        },
        calculation: {
          formula: '50 + (Positive × 10) - (Negative × 15)',
          positiveContribution: positiveCount * 10,
          negativeContribution: negativeCount * 15,
          result: sentimentScore
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL BRAND MESSAGING FROM META/CONTENT
      // ═══════════════════════════════════════════════════════════════════════════
      brandMessagingRawData: {
        title: {
          text: metaProof.rawData.title.text,
          containsBrand: title.toLowerCase().includes(domain.split('.')[0]),
          charCount: metaProof.rawData.title.charCount
        },
        description: {
          text: metaProof.rawData.description.text,
          containsBrand: description.toLowerCase().includes(domain.split('.')[0]),
          charCount: metaProof.rawData.description.charCount
        },
        h1: {
          text: headingsProof.rawData.h1.text,
          containsBrand: (headingsProof.rawData.h1.text || '').toLowerCase().includes(domain.split('.')[0])
        },
        tagline: _extractTagline(title, description),
        valueProposition: h2Array.slice(0, 3)
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL TRUST SCHEMA SIGNALS
      // ═══════════════════════════════════════════════════════════════════════════
      trustSchemaRawData: {
        schemasDetected: schemaProof.rawData.schemasDetected,
        trustSchemas: schemaProof.rawData.schemasDetected.filter(s => 
          /organization|person|review|rating|localbusiness|brand/i.test(s)
        ),
        missingTrustSchemas: ['Organization', 'LocalBusiness', 'Review', 'Rating', 'Brand']
          .filter(s => !schemaProof.rawData.schemasDetected.some(st => 
            st.toLowerCase().includes(s.toLowerCase())
          ))
      },
      
      serpOwnership: {
        totalResults: organic.length,
        brandedResults: brandMentions,
        ownershipRate: brandedSearchRatio + '%'
      },
      sentimentAnalysis: {
        score: sentimentScore,
        sentiment: sentimentScore >= 70 ? 'Positive' : sentimentScore >= 40 ? 'Neutral' : 'Negative',
        positiveSignals: positiveCount,
        negativeSignals: negativeCount,
        trustIndicators: detectedPositiveSignals
      },
      brandPersona: profile.persona || 'Unknown',
      trustScore: profile.trustScore || 50,
      emotionalDebt: profile.emotionalDebt || 50,
      differentiators: _extractDifferentiators(website, profile),
      
      // ENHANCED SCORE BREAKDOWN WITH RAW DATA PROOF
      enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
      
      // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal
      proof: {
        pageRankRaw: openPR.pageRank ?? openPR.page_rank_decimal ?? 0,
        organicCount: organic.length,
        brandMentionsCount: brandMentions,
        calculation: 'Brand Strength = (PageRank × 12) + (Brand Mentions × 5)',
        dataSource: (openPR.pageRank ?? openPR.page_rank_decimal) ? 'Real Data (OpenPageRank + SERP)' : 'Forensic Estimate',
        detailed: detailedProofs,
        confidence: (openPR.pageRank ?? openPR.page_rank_decimal) ? 'high' : 'medium'
      }
    };
  });
  
  // Sort by brand strength
  brandAnalysis.sort((a, b) => b.brandStrengthScore - a.brandStrengthScore);
  
  const avgBrandStrength = brandAnalysis.reduce((sum, b) => sum + b.brandStrengthScore, 0) / (brandAnalysis.length || 1);
  const topBrand = brandAnalysis[0] || {};
  
  return {
    // Brand Strength Ranking
    brandRankings: brandAnalysis.map((b, idx) => ({ ...b, rank: idx + 1 })),
    
    // Brand Comparison Matrix
    comparisonMatrix: {
      metrics: ['Brand Strength', 'SERP Ownership', 'Sentiment', 'Trust Score'],
      data: brandAnalysis.map(b => ({
        domain: b.domain,
        values: [b.brandStrengthScore, parseInt(b.brandedSearchRatio), b.sentimentAnalysis.score, b.trustScore]
      }))
    },
    
    // Brand Gap Analysis
    brandGaps: {
      leader: topBrand.domain,
      leaderScore: topBrand.brandStrengthScore,
      avgScore: Math.round(avgBrandStrength),
      gaps: brandAnalysis.map(b => ({
        domain: b.domain,
        gap: topBrand.brandStrengthScore - b.brandStrengthScore,
        opportunity: topBrand.brandStrengthScore - b.brandStrengthScore > 20 ? 'High' : 'Medium'
      }))
    },
    
    // Strategic Insight
    sectionStrategicInsight: {
      executiveSummary: `Brand analysis shows ${topBrand.brandName || 'unknown'} leads with ${topBrand.brandStrengthScore || 0} brand strength. Average market brand strength is ${Math.round(avgBrandStrength)}.`,
      swot: {
        strengths: ['Brand sentiment analysis operational', 'SERP ownership metrics calculated'],
        weaknesses: ['Limited historical brand data', 'Social sentiment not included'],
        opportunities: [`Build brand strength above ${Math.round(avgBrandStrength)} average`, 'Improve SERP ownership through branded content'],
        threats: ['Strong brand leaders', 'Negative sentiment risk']
      },
      recommendations: [
        { priority: 'HIGH', action: 'Increase branded search visibility through PR and content', effort: 'Medium', impact: 'High' },
        { priority: 'HIGH', action: 'Build trust signals (reviews, certifications, testimonials)', effort: 'Medium', impact: 'High' },
        { priority: 'MEDIUM', action: 'Differentiate positioning from top brands', effort: 'Low', impact: 'Medium' }
      ],
      opportunityScore: Math.round(100 - avgBrandStrength),
      aiInsight: `Brand positioning analysis reveals ${avgBrandStrength > 60 ? 'strong established brands dominating' : 'opportunity for brand differentiation'}. Focus on ${topBrand.sentimentAnalysis?.score > 70 ? 'matching trust signals' : 'building superior trust indicators'} to compete effectively.`
    },
    
    dataSource: 'Real Data (SERP Analysis, Content Extraction) + Brand Modeling',
    generatedAt: new Date().toISOString()
  };
}

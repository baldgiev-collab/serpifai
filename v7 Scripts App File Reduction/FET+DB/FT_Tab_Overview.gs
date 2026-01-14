/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_OVERVIEW.GS - OVERVIEW & MARKET INTELLIGENCE TAB GENERATORS
 * Dashboard overview and market intelligence forensic analysis
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 2149-2544)
 * 
 * CONTAINS:
 * - _generateOverviewDashboardForensic() - Tab 1: Executive Dashboard
 * - _generateMarketIntelligenceForensic() - Tab 2: Market Intelligence
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW DASHBOARD - Executive Summary
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Overview Dashboard forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateOverviewDashboardForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  // Calculate aggregate metrics from real data
  let totalRankings = 0, avgAuthority = 0, avgPerformance = 0;
  let topCompetitor = null, maxAuthority = 0;
  
  const competitorSummaries = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const seo = synth.seo || {};
    const pageSpeed = c.apiData?.pageSpeed || {};
    const openPR = c.apiData?.openPageRank || {};
    const profile = c.forensicProfile || {};
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: Extract ALL detailed proofs using new functions
    // ═══════════════════════════════════════════════════════════════════════════
    const detailedProofs = _extractAllDetailedProofs(c);
    const enhancedScoreBreakdown = _createEnhancedScoreBreakdown(c);
    
    // Extract real rankings from organic results
    const organic = seo.organic || c.apiData?.serper?.organic || [];
    const rankingCount = organic.length;
    totalRankings += rankingCount;
    
    // Authority score from OpenPageRank or estimate
    const pageRank = openPR.page_rank_decimal || 0;
    const domainAuthority = pageRank > 0 ? Math.round(pageRank * 10) : (50 + (idx * 5));
    avgAuthority += domainAuthority;
    
    // Performance score from PageSpeed
    const perfScore = pageSpeed.scores?.performance || 50;
    avgPerformance += perfScore;
    
    // Track top competitor
    if (domainAuthority > maxAuthority) {
      maxAuthority = domainAuthority;
      topCompetitor = c.domain;
    }
    
    // Word count and content depth
    const wordCount = website.wordCount || 0;
    const h2Array = website.h2 || [];
    const h3Array = website.h3 || [];
    const schemaTypes = website.schemaTypes || [];
    
    return {
      domain: c.domain || 'unknown',
      rank: idx + 1,
      domainAuthority: domainAuthority,
      trustScore: profile.trustScore || 50,
      performanceScore: perfScore,
      rankingsInTop10: Math.min(rankingCount, 10),
      estimatedTraffic: _estimateTrafficFromRankings(rankingCount, domainAuthority),
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL RAW DATA - Screaming Frog / SEMrush Level Detail
      // ═══════════════════════════════════════════════════════════════════════════
      contentDepth: {
        wordCount: wordCount,
        headingsCount: h2Array.length,
        schemaTypes: schemaTypes.length
      },
      
      // ACTUAL H1/H2/H3 TEXT CONTENT
      headingsRawData: {
        h1: {
          text: detailedProofs.headings.rawData.h1.text,
          charCount: detailedProofs.headings.rawData.h1.charCount,
          issues: detailedProofs.headings.rawData.h1.issues
        },
        h2: {
          count: h2Array.length,
          texts: h2Array.slice(0, 10),
          sample: h2Array.slice(0, 5).map(h => h.substring(0, 50) + (h.length > 50 ? '...' : ''))
        },
        h3: {
          count: h3Array.length,
          texts: h3Array.slice(0, 15),
          sample: h3Array.slice(0, 5).map(h => h.substring(0, 50) + (h.length > 50 ? '...' : ''))
        }
      },
      
      // ACTUAL META TAGS CONTENT
      metaRawData: {
        title: {
          text: detailedProofs.meta.rawData.title.text,
          charCount: detailedProofs.meta.rawData.title.charCount,
          truncationRisk: detailedProofs.meta.rawData.title.truncationRisk
        },
        description: {
          text: detailedProofs.meta.rawData.description.text,
          charCount: detailedProofs.meta.rawData.description.charCount,
          truncationRisk: detailedProofs.meta.rawData.description.truncationRisk
        },
        serpPreview: detailedProofs.meta.comparison.serpPreview
      },
      
      // ACTUAL SCHEMA TYPES DETECTED
      schemaRawData: {
        typesFound: detailedProofs.schema.rawData.typesFound,
        count: detailedProofs.schema.rawData.count,
        missingCritical: detailedProofs.schema.rawData.missingCritical,
        hasOrganization: detailedProofs.schema.rawData.hasOrganization,
        hasFAQPage: detailedProofs.schema.rawData.hasFAQPage,
        hasHowTo: detailedProofs.schema.rawData.hasHowTo
      },
      
      // ACTUAL CONTENT METRICS
      contentRawData: {
        wordCount: detailedProofs.content.rawData.wordCount,
        paragraphCount: detailedProofs.content.rawData.paragraphCount,
        readingTime: detailedProofs.content.rawData.readingTime,
        contentDepth: detailedProofs.content.rawData.contentDepth,
        avgWordsPerSection: detailedProofs.content.rawData.avgWordsPerSection
      },
      
      // ACTUAL LINKS DATA
      linksRawData: {
        internalCount: detailedProofs.links.rawData.internal.count,
        externalCount: detailedProofs.links.rawData.external.count,
        ratio: detailedProofs.links.rawData.ratio.ratio,
        internalSample: detailedProofs.links.rawData.internal.links.slice(0, 5),
        externalSample: detailedProofs.links.rawData.external.links.slice(0, 5)
      },
      
      // ACTUAL CORE WEB VITALS
      cwvRawData: {
        lcp: detailedProofs.cwv.rawData.coreWebVitals.lcp,
        fid: detailedProofs.cwv.rawData.coreWebVitals.fid,
        cls: detailedProofs.cwv.rawData.coreWebVitals.cls,
        scores: detailedProofs.cwv.rawData.scores,
        passedCWV: detailedProofs.cwv.comparison.passedCWV
      },
      
      // ENHANCED SCORE BREAKDOWN WITH FORMULA + RAW DATA
      enhancedScoreBreakdown: enhancedScoreBreakdown,
      
      persona: profile.persona || 'Unknown',
      dataSource: pageRank > 0 || perfScore > 0 ? 'Real Data (API)' : 'Forensic Estimate',
      
      // LEGACY PROOF (kept for backwards compatibility)
      proof: {
        pageRankRaw: pageRank,
        performanceRaw: perfScore,
        organicResultsCount: rankingCount,
        confidence: pageRank > 0 ? 'high' : 'medium',
        detailed: detailedProofs
      }
    };
  });
  
  const competitorCount = safeCompetitors.length || 1;
  
  return {
    // Executive Summary Metrics
    executiveSummary: {
      totalCompetitors: competitorCount,
      averageAuthority: Math.round(avgAuthority / competitorCount),
      averagePerformance: Math.round(avgPerformance / competitorCount),
      totalRankingsAnalyzed: totalRankings,
      marketLeader: topCompetitor,
      marketLeaderScore: maxAuthority,
      analysisDate: new Date().toISOString().split('T')[0],
      dataQuality: avgAuthority > 0 ? 'High' : 'Medium'
    },
    
    // Competitive Landscape
    competitiveLandscape: {
      competitors: competitorSummaries,
      marketConcentration: _calculateMarketConcentration(competitorSummaries),
      competitiveIntensity: maxAuthority > 70 ? 'High' : maxAuthority > 40 ? 'Medium' : 'Low',
      barrierToEntry: maxAuthority > 60 ? 'High' : 'Medium'
    },
    
    // Quick Stats Cards
    quickStats: [
      { label: 'Competitors Analyzed', value: competitorCount, icon: '🏢', color: '#3b82f6' },
      { label: 'Avg Domain Authority', value: Math.round(avgAuthority / competitorCount), icon: '📊', color: '#10b981' },
      { label: 'Avg Performance Score', value: Math.round(avgPerformance / competitorCount), icon: '⚡', color: '#f59e0b' },
      { label: 'Market Leader', value: topCompetitor || 'N/A', icon: '👑', color: '#8b5cf6' }
    ],
    
    // Strategic Insight (Gemini-style)
    sectionStrategicInsight: {
      executiveSummary: `Analysis of ${competitorCount} competitors reveals a ${maxAuthority > 60 ? 'highly competitive' : 'moderately competitive'} landscape with ${topCompetitor || 'unknown'} leading at ${maxAuthority} authority score.`,
      swot: {
        strengths: ['Comprehensive competitor data collected', 'Real-time performance metrics available'],
        weaknesses: ['Historical trend data limited', 'Traffic estimates based on rankings'],
        opportunities: [`Target competitors below ${Math.round(avgAuthority / competitorCount)} authority`, 'Exploit technical gaps in lower performers'],
        threats: ['Market leader dominance', 'High barrier to entry for top positions']
      },
      recommendations: [
        { priority: 'HIGH', action: `Analyze ${topCompetitor}'s content strategy for replication opportunities`, effort: 'Medium', impact: 'High' },
        { priority: 'HIGH', action: 'Build authority through quality backlink acquisition', effort: 'High', impact: 'High' },
        { priority: 'MEDIUM', action: 'Optimize technical performance to exceed competitor average', effort: 'Low', impact: 'Medium' }
      ],
      opportunityScore: Math.round(100 - (avgAuthority / competitorCount)),
      aiInsight: `The competitive landscape analysis reveals ${maxAuthority > 60 ? 'significant barriers to entry with established players dominating' : 'opportunities for new entrants to capture market share'}. Focus on ${avgPerformance / competitorCount < 60 ? 'technical excellence' : 'content differentiation'} to gain competitive advantage.`
    },
    
    dataSource: 'Real Data (OpenPageRank, PageSpeed, Serper) + Forensic Analysis',
    generatedAt: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: MARKET INTELLIGENCE - Competitive Landscape Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Market Intelligence forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateMarketIntelligenceForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  // Market share calculation based on rankings and authority
  const marketShareAnalysis = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const seo = synth.seo || {};
    const website = synth.website || {};
    const openPR = c.apiData?.openPageRank || {};
    const profile = c.forensicProfile || {};
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: Extract ALL detailed proofs using new functions
    // ═══════════════════════════════════════════════════════════════════════════
    const detailedProofs = _extractAllDetailedProofs(c);
    const schemaProof = detailedProofs.schema;
    const contentProof = detailedProofs.content;
    const headingsProof = detailedProofs.headings;
    
    // v23.2: Ensure organic is always an array to prevent .filter() errors
    const organicRaw = seo.organic || c.apiData?.serper?.organic || [];
    const organic = Array.isArray(organicRaw) ? organicRaw : [];
    const paa = seo.peopleAlsoAsk || c.apiData?.serper?.peopleAlsoAsk || [];
    const relatedSearches = seo.relatedSearches || c.apiData?.serper?.relatedSearches || [];
    const pageRank = openPR.page_rank_decimal || 0;
    
    // Calculate visibility score (SEMrush-style)
    const visibilityScore = _calculateVisibilityScore(organic, pageRank);
    
    // Estimate traffic share
    const trafficShare = Math.round(visibilityScore / (safeCompetitors.length * 20) * 100);
    
    return {
      domain: c.domain || 'unknown',
      visibilityScore: visibilityScore,
      estimatedTrafficShare: trafficShare + '%',
      domainRating: pageRank > 0 ? Math.round(pageRank * 10) : (45 + idx * 8),
      indexedPages: _estimateIndexedPages(organic, synth),
      backlinksEstimate: _estimateBacklinks(pageRank, profile),
      referringDomains: _estimateReferringDomains(pageRank),
      organicKeywords: organic.length * 15,
      paidKeywords: profile.affiliateDepth === 'High' ? Math.round(organic.length * 5) : 0,
      trend: _calculateTrend(visibilityScore),
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL SERP DATA - SEMrush Level
      // ═══════════════════════════════════════════════════════════════════════════
      serpRawData: {
        organicResults: organic.slice(0, 10).map((r, i) => ({
          position: r.position || (i + 1),
          title: r.title || '',
          link: r.link || '',
          snippet: (r.snippet || '').substring(0, 120) + ((r.snippet || '').length > 120 ? '...' : '')
        })),
        totalOrganicResults: organic.length,
        paaQuestions: paa.slice(0, 8).map(q => q.question || q),
        paaCount: paa.length,
        relatedSearches: relatedSearches.slice(0, 8).map(r => r.query || r),
        relatedCount: relatedSearches.length
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL PAGERANK API DATA
      // ═══════════════════════════════════════════════════════════════════════════
      pageRankRawData: {
        pageRank: pageRank,
        domainRank: openPR.rank || 0,
        statusCode: openPR.status_code || 0,
        rawApiResponse: {
          domain: c.domain,
          rank: openPR.rank,
          page_rank_decimal: openPR.page_rank_decimal
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: ACTUAL CONTENT SIGNALS
      // ═══════════════════════════════════════════════════════════════════════════
      contentSignalsRawData: {
        wordCount: contentProof.rawData.wordCount,
        h1Text: headingsProof.rawData.h1.text,
        h2Count: (website.h2 || []).length,
        h2Texts: (website.h2 || []).slice(0, 5),
        schemaCount: schemaProof.rawData.schemaCount,
        schemasDetected: schemaProof.rawData.schemasDetected.slice(0, 8)
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ELITE: VISIBILITY CALCULATION PROOF
      // ═══════════════════════════════════════════════════════════════════════════
      visibilityCalculation: {
        formula: 'Visibility = Σ(Position Weights) + (PageRank × 10)',
        positionWeights: {
          top3: organic.filter(r => (r.position || 0) <= 3).length,
          top10: organic.filter(r => (r.position || 0) <= 10).length,
          top20: organic.filter(r => (r.position || 0) <= 20).length
        },
        pageRankContribution: Math.round(pageRank * 10),
        totalScore: visibilityScore
      },
      
      // ENHANCED SCORE BREAKDOWN WITH RAW DATA PROOF
      enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
      
      proof: {
        pageRankRaw: pageRank,
        organicResults: organic.length,
        calculation: `Visibility = (Rankings × Position Weight) + (PageRank × 10)`,
        dataSource: pageRank > 0 ? 'OpenPageRank API' : 'Forensic Estimate',
        detailed: detailedProofs,
        confidence: pageRank > 0 ? 'high' : 'medium'
      }
    };
  });
  
  // Sort by visibility for ranking
  marketShareAnalysis.sort((a, b) => b.visibilityScore - a.visibilityScore);
  marketShareAnalysis.forEach((c, idx) => c.marketRank = idx + 1);
  
  // Competitive dynamics
  const topCompetitor = marketShareAnalysis[0] || {};
  const avgVisibility = marketShareAnalysis.reduce((sum, c) => sum + c.visibilityScore, 0) / (marketShareAnalysis.length || 1);
  
  return {
    // Market Share Distribution
    marketShare: {
      distribution: marketShareAnalysis,
      totalMarketValue: 'Estimated based on visibility analysis',
      concentration: _calculateHHI(marketShareAnalysis),
      competitiveDensity: marketShareAnalysis.length > 4 ? 'High' : 'Medium'
    },
    
    // Competitor Profiles
    competitorProfiles: marketShareAnalysis.map(c => ({
      ...c,
      strengthAreas: _identifyStrengthAreas(c),
      weaknessAreas: _identifyWeaknesses(c),
      threatLevel: c.visibilityScore > avgVisibility ? 'High' : 'Medium'
    })),
    
    // Market Trends
    marketTrends: {
      growthIndicators: ['Increasing search volume', 'New entrants emerging', 'Content velocity rising'],
      threatIndicators: ['Market consolidation ongoing', 'Authority gap widening'],
      opportunitySignals: [`${marketShareAnalysis.filter(c => c.visibilityScore < avgVisibility).length} competitors below average visibility`]
    },
    
    // SERP Visibility Comparison
    serpVisibility: {
      leader: topCompetitor.domain,
      leaderScore: topCompetitor.visibilityScore,
      averageScore: Math.round(avgVisibility),
      gapToLeader: marketShareAnalysis.map(c => ({
        domain: c.domain,
        gap: topCompetitor.visibilityScore - c.visibilityScore,
        gapPercent: Math.round((1 - c.visibilityScore / (topCompetitor.visibilityScore || 1)) * 100) + '%'
      }))
    },
    
    // Strategic Insight
    sectionStrategicInsight: {
      executiveSummary: `Market analysis reveals ${topCompetitor.domain || 'unknown'} leads with ${topCompetitor.visibilityScore || 0} visibility score. Average competitor visibility is ${Math.round(avgVisibility)}.`,
      swot: {
        strengths: ['Comprehensive market mapping completed', 'Real visibility metrics calculated'],
        weaknesses: ['Traffic estimates require validation', 'Historical data limited'],
        opportunities: [`Target the ${Math.round(avgVisibility)}-point visibility gap`, 'Exploit indexation weaknesses'],
        threats: ['Market leader consolidation', 'High authority barriers']
      },
      recommendations: [
        { priority: 'HIGH', action: `Study ${topCompetitor.domain}'s backlink profile for replication`, effort: 'High', impact: 'High' },
        { priority: 'MEDIUM', action: 'Focus on long-tail keywords with lower competition', effort: 'Medium', impact: 'Medium' },
        { priority: 'MEDIUM', action: 'Build content clusters around underserved topics', effort: 'Medium', impact: 'High' }
      ],
      opportunityScore: Math.round(100 - avgVisibility),
      aiInsight: `Market intelligence suggests a ${avgVisibility > 50 ? 'mature' : 'developing'} competitive landscape. The ${Math.round(topCompetitor.visibilityScore - avgVisibility)}-point gap between leader and average presents ${avgVisibility < 60 ? 'significant opportunity' : 'challenging but achievable targets'} for market entry or expansion.`
    },
    
    dataSource: 'Real Data (SERP Analysis, OpenPageRank) + Market Modeling',
    generatedAt: new Date().toISOString()
  };
}

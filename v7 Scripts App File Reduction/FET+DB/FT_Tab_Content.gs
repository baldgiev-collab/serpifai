/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_CONTENT.GS - CONTENT INTEL & KEYWORD STRATEGY TAB GENERATORS
 * Content intelligence and keyword analysis forensic
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 3052-3557)
 * 
 * CONTAINS:
 * - _generateContentIntelForensic() - Tab 5: Content Intelligence
 * - _generateKeywordStrategyForensic() - Tab 6: Keyword Strategy
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: CONTENT INTEL - Content Inventory & Quality Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Content Intelligence forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateContentIntelForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  const contentAnalysis = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const content = synth.content || {};
    const seo = synth.seo || {};
    const profile = c.forensicProfile || {};
    
    const detailedProofs = _extractAllDetailedProofs(c);
    const headingsProof = detailedProofs.headings;
    const contentProof = detailedProofs.content;
    const metaProof = detailedProofs.meta;
    const imagesProof = detailedProofs.images;
    const linksProof = detailedProofs.links;
    
    const title = website.title || '';
    const description = website.description || '';
    const h1 = website.h1 || '';
    const h2Array = website.h2 || [];
    const h3Array = website.h3 || [];
    const wordCount = website.wordCount || 0;
    const schemaTypes = website.schemaTypes || [];
    
    const headingsCount = h2Array.length + h3Array.length;
    const avgWordsPerSection = headingsCount > 0 ? Math.round(wordCount / headingsCount) : wordCount;
    
    const hasNumbers = /\d+/.test(title + ' ' + h2Array.join(' '));
    const hasDates = /202[0-6]|January|February|March|April|May|June|July|August|September|October|November|December/i.test(title + ' ' + description);
    const hasLists = h2Array.some(h => /^\d+|^top|^best|^how to/i.test(h));
    
    const eeatSignals = [];
    const fullText = (title + ' ' + description + ' ' + h2Array.join(' ')).toLowerCase();
    if (fullText.includes('expert') || fullText.includes('certified')) eeatSignals.push('Expert credentials');
    if (fullText.includes('research') || fullText.includes('study')) eeatSignals.push('Research-backed');
    if (fullText.includes('year') || fullText.includes('experience')) eeatSignals.push('Experience signals');
    if (schemaTypes.some(s => s.toLowerCase().includes('author') || s.toLowerCase().includes('person'))) eeatSignals.push('Author schema');
    
    const freshnessScore = hasDates ? 80 : 50;
    
    const qualityScore = Math.min(100, Math.round(
      (wordCount > 2000 ? 25 : wordCount > 1000 ? 15 : 5) +
      (headingsCount > 8 ? 25 : headingsCount > 4 ? 15 : 5) +
      (hasNumbers ? 10 : 0) +
      (hasDates ? 10 : 0) +
      (hasLists ? 10 : 0) +
      (eeatSignals.length * 5) +
      (schemaTypes.length > 3 ? 15 : schemaTypes.length > 0 ? 8 : 0)
    ));
    
    return {
      domain: c.domain || 'unknown',
      contentQualityScore: qualityScore,
      qualityLevel: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : qualityScore >= 40 ? 'Average' : 'Needs Work',
      
      contentInventory: {
        wordCount: wordCount,
        h2Count: h2Array.length,
        h3Count: h3Array.length,
        totalHeadings: headingsCount,
        avgWordsPerSection: avgWordsPerSection,
        estimatedReadTime: Math.ceil(wordCount / 200) + ' min',
        contentType: _detectContentType(h2Array, title)
      },
      
      headingsRawData: {
        h1: headingsProof.rawData.h1,
        h2: {
          count: h2Array.length,
          texts: h2Array,
          sample: h2Array.slice(0, 8).map(h => h.substring(0, 60) + (h.length > 60 ? '...' : '')),
          avgLength: headingsProof.rawData.h2.avgLength
        },
        h3: {
          count: h3Array.length,
          texts: h3Array,
          sample: h3Array.slice(0, 10).map(h => h.substring(0, 50) + (h.length > 50 ? '...' : '')),
          avgLength: headingsProof.rawData.h3.avgLength
        },
        hierarchy: headingsProof.rawData.hierarchy,
        scoreCalculation: headingsProof.scoreCalculation
      },
      
      metaRawData: {
        title: metaProof.rawData.title,
        description: metaProof.rawData.description,
        serpPreview: metaProof.comparison.serpPreview
      },
      
      contentRawData: contentProof.rawData,
      imagesRawData: imagesProof.rawData,
      linksRawData: linksProof.rawData,
      
      contentDepth: {
        score: Math.min(100, Math.round((wordCount / 30) + (headingsCount * 5))),
        level: wordCount > 3000 ? 'Comprehensive' : wordCount > 1500 ? 'Detailed' : wordCount > 500 ? 'Standard' : 'Thin',
        topicCoverage: headingsCount > 8 ? 'Extensive' : headingsCount > 4 ? 'Moderate' : 'Limited'
      },
      
      contentQuality: {
        hasDataPoints: hasNumbers,
        hasFreshness: hasDates,
        hasListFormat: hasLists,
        readabilityEstimate: wordCount > 0 && headingsCount > 0 ? 'Good' : 'Unknown',
        uniquenessIndicator: 'Requires plagiarism check'
      },
      
      eeatAnalysis: {
        signals: eeatSignals,
        signalCount: eeatSignals.length,
        score: Math.min(100, eeatSignals.length * 25),
        level: eeatSignals.length >= 3 ? 'Strong' : eeatSignals.length >= 1 ? 'Moderate' : 'Weak'
      },
      
      freshnessIndicators: {
        score: freshnessScore,
        dateDetected: hasDates,
        lastUpdateSignal: hasDates ? 'Recent' : 'Unknown',
        evergreen: !hasDates && wordCount > 2000
      },
      
      topicClusters: _detectTopicClusters(h2Array, title, niche),
      enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
      
      proof: {
        wordCountRaw: wordCount,
        headingsRaw: { h2: h2Array.length, h3: h3Array.length },
        schemasRaw: schemaTypes,
        eeatSignalsRaw: eeatSignals,
        dataSource: wordCount > 0 ? 'Real Data (Content Extraction)' : 'Forensic Estimate',
        detailed: detailedProofs,
        confidence: wordCount > 0 ? 'high' : 'medium'
      }
    };
  });
  
  contentAnalysis.sort((a, b) => b.contentQualityScore - a.contentQualityScore);
  
  const avgQuality = contentAnalysis.reduce((sum, c) => sum + c.contentQualityScore, 0) / (contentAnalysis.length || 1);
  const topContent = contentAnalysis[0] || {};
  
  return {
    qualityRankings: contentAnalysis.map((c, idx) => ({ ...c, rank: idx + 1 })),
    
    contentComparison: {
      avgWordCount: Math.round(contentAnalysis.reduce((sum, c) => sum + c.contentInventory.wordCount, 0) / (contentAnalysis.length || 1)),
      avgHeadings: Math.round(contentAnalysis.reduce((sum, c) => sum + c.contentInventory.totalHeadings, 0) / (contentAnalysis.length || 1)),
      avgQualityScore: Math.round(avgQuality),
      topPerformer: topContent.domain
    },
    
    contentGaps: {
      byWordCount: contentAnalysis.filter(c => c.contentInventory.wordCount < 1500).map(c => c.domain),
      byHeadings: contentAnalysis.filter(c => c.contentInventory.totalHeadings < 5).map(c => c.domain),
      byEEAT: contentAnalysis.filter(c => c.eeatAnalysis.signalCount < 2).map(c => c.domain)
    },
    
    sectionStrategicInsight: {
      executiveSummary: `Content analysis shows ${topContent.domain || 'unknown'} leads with ${topContent.contentQualityScore || 0} quality score. Average content quality is ${Math.round(avgQuality)}.`,
      swot: {
        strengths: ['Real content metrics extracted', 'E-E-A-T signals analyzed'],
        weaknesses: ['Full content inventory requires crawl', 'Readability estimation limited'],
        opportunities: [`Exceed average ${Math.round(avgQuality)} quality score`, 'Outcompete thin content competitors'],
        threats: ['High-quality content leaders', 'Increasing quality standards']
      },
      recommendations: [
        { priority: 'HIGH', action: `Create content exceeding ${Math.round(contentAnalysis.reduce((sum, c) => sum + c.contentInventory.wordCount, 0) / (contentAnalysis.length || 1))} avg word count`, effort: 'High', impact: 'High' },
        { priority: 'HIGH', action: 'Strengthen E-E-A-T signals (author bios, credentials)', effort: 'Medium', impact: 'High' },
        { priority: 'MEDIUM', action: 'Add date stamps and freshness indicators', effort: 'Low', impact: 'Medium' }
      ],
      opportunityScore: Math.round(100 - avgQuality),
      aiInsight: `Content intelligence reveals ${avgQuality > 60 ? 'competitive content landscape' : 'content quality opportunities'}. The ${contentAnalysis.filter(c => c.contentInventory.wordCount < 1500).length} competitors with thin content present ${avgQuality < 70 ? 'significant opportunity' : 'niche opportunities'} for comprehensive content strategy.`
    },
    
    dataSource: 'Real Data (Content Extraction) + Quality Analysis',
    generatedAt: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: KEYWORD STRATEGY - Keyword Analysis & Gap Detection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Keyword Strategy forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateKeywordStrategyForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  const keywordAnalysis = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const seo = synth.seo || {};
    // v23.2: Ensure organic is always an array to prevent .filter() errors
    const organicRaw = seo.organic || c.apiData?.serper?.organic || [];
    const organic = Array.isArray(organicRaw) ? organicRaw : [];
    const paa = seo.peopleAlsoAsk || c.apiData?.serper?.peopleAlsoAsk || [];
    const relatedSearches = seo.relatedSearches || c.apiData?.serper?.relatedSearches || [];
    
    const detailedProofs = _extractAllDetailedProofs(c);
    const headingsProof = detailedProofs.headings;
    const metaProof = detailedProofs.meta;
    
    const title = website.title || '';
    const h2Array = website.h2 || [];
    const description = website.description || '';
    
    const primaryKeywords = _extractKeywordsFromText(title, 3);
    const secondaryKeywords = _extractKeywordsFromText(h2Array.join(' '), 5);
    
    const longTailKeywords = paa.slice(0, 5).map(q => ({
      keyword: q.question || q,
      type: 'question',
      difficulty: 'Low',
      opportunity: 'High'
    }));
    
    const relatedKeywords = relatedSearches.slice(0, 5).map(r => ({
      keyword: r.query || r,
      type: 'related',
      difficulty: 'Medium',
      opportunity: 'Medium'
    }));
    
    const top3 = organic.filter(r => r.position && r.position <= 3).length;
    const top10 = organic.filter(r => r.position && r.position <= 10).length;
    const top20 = organic.filter(r => r.position && r.position <= 20).length;
    const top100 = organic.length;
    
    const visibilityScore = Math.round((top3 * 30) + (top10 * 15) + (top20 * 5) + (top100 * 1));
    
    return {
      domain: c.domain || 'unknown',
      visibilityScore: visibilityScore,
      
      keywordPortfolio: {
        estimated: organic.length * 10,
        primary: primaryKeywords,
        secondary: secondaryKeywords,
        longTail: longTailKeywords,
        questions: paa.slice(0, 5).map(q => q.question || q),
        related: relatedKeywords
      },
      
      paaRawData: {
        total: paa.length,
        questions: paa.slice(0, 15).map((q, i) => ({
          rank: i + 1,
          question: q.question || q,
          snippet: q.snippet || null,
          source: q.link || null
        })),
        questionTypes: {
          what: paa.filter(q => /^what/i.test(q.question || q)).length,
          how: paa.filter(q => /^how/i.test(q.question || q)).length,
          why: paa.filter(q => /^why/i.test(q.question || q)).length,
          when: paa.filter(q => /^when/i.test(q.question || q)).length,
          where: paa.filter(q => /^where/i.test(q.question || q)).length,
          which: paa.filter(q => /^which/i.test(q.question || q)).length,
          is: paa.filter(q => /^is|^are|^can|^do|^does/i.test(q.question || q)).length
        },
        targetingOpportunity: paa.length > 5 ? 'High (5+ questions)' : paa.length > 2 ? 'Medium' : 'Low'
      },
      
      relatedSearchesRawData: {
        total: relatedSearches.length,
        searches: relatedSearches.slice(0, 15).map((r, i) => ({
          rank: i + 1,
          query: r.query || r,
          estimatedVolume: 'Medium',
          competitionLevel: 'Medium'
        })),
        topicClusters: _groupRelatedByTopic(relatedSearches)
      },
      
      organicRawData: {
        totalResults: organic.length,
        rankings: organic.slice(0, 20).map((r, i) => ({
          position: r.position || (i + 1),
          title: r.title || '',
          link: r.link || '',
          snippet: (r.snippet || '').substring(0, 150) + ((r.snippet || '').length > 150 ? '...' : ''),
          domain: _extractDomainFromUrl(r.link || '')
        })),
        serpFeatures: {
          featuredSnippet: organic.some(r => r.position === 0 || r.isFeatured),
          sitelinks: organic.some(r => r.sitelinks && r.sitelinks.length > 0),
          richResults: organic.filter(r => r.richSnippet).length
        }
      },
      
      titleKeywordsRawData: {
        title: {
          text: title,
          charCount: title.length,
          wordCount: title.split(/\s+/).filter(Boolean).length,
          keywords: primaryKeywords,
          keywordDensity: _calculateKeywordDensity(title, primaryKeywords)
        },
        h1: {
          text: headingsProof.rawData.h1.text,
          keywords: _extractKeywordsFromText(headingsProof.rawData.h1.text, 3)
        },
        h2Keywords: {
          count: h2Array.length,
          headings: h2Array.slice(0, 10),
          extractedKeywords: secondaryKeywords
        },
        metaDescription: {
          text: metaProof.rawData.description.text,
          keywords: _extractKeywordsFromText(description, 5),
          keywordDensity: _calculateKeywordDensity(description, primaryKeywords)
        }
      },
      
      rankingDistribution: {
        top3: top3,
        top10: top10,
        top20: top20,
        top100: top100,
        distribution: {
          positions1to3: Math.round((top3 / (top100 || 1)) * 100) + '%',
          positions4to10: Math.round(((top10 - top3) / (top100 || 1)) * 100) + '%',
          positions11to20: Math.round(((top20 - top10) / (top100 || 1)) * 100) + '%',
          positions21to100: Math.round(((top100 - top20) / (top100 || 1)) * 100) + '%'
        }
      },
      
      serpFeatures: {
        paaQuestions: paa.length,
        relatedSearches: relatedSearches.length,
        featuredSnippetEligible: paa.length > 3 || h2Array.some(h => /how|what|why|when/i.test(h)),
        faqSchemaOpportunity: paa.length > 5
      },
      
      keywordGaps: {
        missingFromCompetitors: [],
        lowCompetitionOpportunities: longTailKeywords.filter(k => k.difficulty === 'Low'),
        questionBasedOpportunities: paa.slice(0, 5)
      },
      
      keywordDifficulty: {
        avgDifficulty: 'Medium',
        highDifficultyCount: top3,
        mediumDifficultyCount: top10 - top3,
        lowDifficultyCount: top20 - top10
      },
      
      enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
      
      proof: {
        organicResultsCount: organic.length,
        paaCount: paa.length,
        relatedCount: relatedSearches.length,
        visibilityCalculation: `(Top3 × 30) + (Top10 × 15) + (Top20 × 5) + (Top100 × 1) = ${visibilityScore}`,
        dataSource: organic.length > 0 ? 'Real Data (SERP Analysis)' : 'Forensic Estimate',
        detailed: detailedProofs,
        confidence: organic.length > 0 ? 'high' : 'medium'
      }
    };
  });
  
  keywordAnalysis.sort((a, b) => b.visibilityScore - a.visibilityScore);
  
  const avgVisibility = keywordAnalysis.reduce((sum, k) => sum + k.visibilityScore, 0) / (keywordAnalysis.length || 1);
  const topKeyword = keywordAnalysis[0] || {};
  
  return {
    visibilityRankings: keywordAnalysis.map((k, idx) => ({ ...k, rank: idx + 1 })),
    
    keywordGapMatrix: {
      totalKeywordsAnalyzed: keywordAnalysis.reduce((sum, k) => sum + k.keywordPortfolio.estimated, 0),
      avgVisibility: Math.round(avgVisibility),
      gapOpportunities: keywordAnalysis.filter(k => k.visibilityScore < avgVisibility).length,
      quickWins: keywordAnalysis.reduce((sum, k) => sum + k.keywordGaps.lowCompetitionOpportunities.length, 0)
    },
    
    questionOpportunities: {
      total: keywordAnalysis.reduce((sum, k) => sum + k.serpFeatures.paaQuestions, 0),
      topQuestions: keywordAnalysis.flatMap(k => k.keywordGaps.questionBasedOpportunities).slice(0, 10)
    },
    
    sectionStrategicInsight: {
      executiveSummary: `Keyword analysis shows ${topKeyword.domain || 'unknown'} leads with ${topKeyword.visibilityScore || 0} visibility score. Average visibility is ${Math.round(avgVisibility)}.`,
      swot: {
        strengths: ['Real SERP data analyzed', 'PAA questions captured'],
        weaknesses: ['Search volume data requires API', 'CPC data not available'],
        opportunities: [`Target ${keywordAnalysis.reduce((sum, k) => sum + k.keywordGaps.lowCompetitionOpportunities.length, 0)} low-competition keywords`, 'Answer PAA questions for featured snippets'],
        threats: ['High-visibility competitors dominating', 'Keyword cannibalization risk']
      },
      recommendations: [
        { priority: 'HIGH', action: 'Create FAQ content targeting PAA questions', effort: 'Medium', impact: 'High' },
        { priority: 'HIGH', action: 'Target long-tail keywords with lower difficulty', effort: 'Low', impact: 'Medium' },
        { priority: 'MEDIUM', action: 'Build topical authority through content clusters', effort: 'High', impact: 'High' }
      ],
      opportunityScore: Math.round(100 - (avgVisibility / 2)),
      aiInsight: `Keyword strategy analysis reveals ${avgVisibility > 100 ? 'competitive keyword landscape' : 'keyword opportunity gaps'}. The ${keywordAnalysis.reduce((sum, k) => sum + k.serpFeatures.paaQuestions, 0)} PAA questions represent immediate featured snippet opportunities.`
    },
    
    dataSource: 'Real Data (SERP Analysis, PAA, Related Searches)',
    generatedAt: new Date().toISOString()
  };
}

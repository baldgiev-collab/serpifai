/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_TAB_OPPORTUNITIES.GS - COMPETITIVE GAP & ATTACK VECTOR ANALYSIS
 * Gap analysis, quick wins, priority matrix for competitive intelligence
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 4392-4810)
 * 
 * CONTAINS:
 * - _estimateMonthlyTraffic() - Traffic estimation helper
 * - _generateOpportunitiesForensic() - Tab 14: Opportunities
 * - _getMostCommonIssues() - Gap analysis helper
 * - _detectMissingSeoElements() - SEO element detection
 * - _detectMissingTrustSignals() - Trust signal detection
 * 
 * DEPENDENCIES: FT_Helpers.gs, FT_Proofs.gs
 * CALLED BY: FT_Pipeline.gs (FT_GenerateEliteTabIntelligence)
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Monthly Traffic Estimation
// ═══════════════════════════════════════════════════════════════════════════════

function _estimateMonthlyTraffic(organic, pageRank) {
  // v23.2: Ensure organic is always an array to prevent .filter() errors
  const safeOrganic = Array.isArray(organic) ? organic : [];
  const top3Traffic = safeOrganic.filter(r => (r.position || 100) <= 3).length * 500;
  const top10Traffic = safeOrganic.filter(r => (r.position || 100) <= 10 && (r.position || 100) > 3).length * 100;
  const otherTraffic = safeOrganic.length * 50;
  const authorityMultiplier = 1 + (pageRank || 2) / 10;
  return Math.round((top3Traffic + top10Traffic + otherTraffic) * authorityMultiplier);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 14: OPPORTUNITIES - Competitive Gap & Attack Vector Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Opportunities forensic data
 * With ACTUAL raw data proof at SEMrush/Ahrefs level
 */
function _generateOpportunitiesForensic(competitors, gemini, niche) {
  const safeCompetitors = Array.isArray(competitors) ? competitors.slice(0, 6) : [];
  
  // Analyze each competitor for opportunities
  const opportunityData = safeCompetitors.map((c, idx) => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const seo = synth.seo || {};
    const pageSpeed = c.apiData?.pageSpeed || {};
    const openPR = c.apiData?.openPageRank || {};
    const profile = c.forensicProfile || {};
    
    // ELITE: Extract ALL detailed proofs using new functions
    const detailedProofs = _extractAllDetailedProofs(c);
    const cwvProof = detailedProofs.cwv;
    const schemaProof = detailedProofs.schema;
    const contentProof = detailedProofs.content;
    const headingsProof = detailedProofs.headings;
    
    const scores = pageSpeed.scores || {};
    // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal
    const pageRank = openPR.pageRank ?? openPR.page_rank_decimal ?? 0;
    const organic = seo.organic || c.apiData?.serper?.organic || [];
    const paa = seo.peopleAlsoAsk || c.apiData?.serper?.peopleAlsoAsk || [];
    const schemaTypes = website.schemaTypes || [];
    const h2Array = website.h2 || [];
    const wordCount = website.wordCount || 0;
    
    // Identify gaps/weaknesses WITH RAW DATA PROOF
    const gaps = [];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TECHNICAL GAPS WITH ACTUAL PROOF
    // ═══════════════════════════════════════════════════════════════════════════
    if ((scores.performance || 50) < 60) {
      gaps.push({ 
        type: 'Technical', 
        area: 'PageSpeed', 
        issue: `Low performance score (${scores.performance || 50})`, 
        opportunity: 'Outperform in speed', 
        effort: 'Medium', 
        impact: 'High', 
        priority: 1,
        rawProof: {
          actualScore: scores.performance || 50,
          lcpActual: cwvProof.rawData.lcp.value + 'ms',
          lcpStatus: cwvProof.rawData.lcp.status,
          clsActual: cwvProof.rawData.cls.value,
          clsStatus: cwvProof.rawData.cls.status,
          recommendation: cwvProof.rawData.lcp.status !== 'good' ? 'Optimize LCP (< 2.5s)' : 'Focus on other metrics'
        }
      });
    }
    if ((scores.seo || 50) < 70) {
      gaps.push({ 
        type: 'Technical', 
        area: 'SEO Score', 
        issue: `Below-optimal SEO score (${scores.seo || 50})`, 
        opportunity: 'Better on-page SEO', 
        effort: 'Low', 
        impact: 'Medium', 
        priority: 2,
        rawProof: {
          actualSeoScore: scores.seo || 50,
          accessibilityScore: scores.accessibility || 0,
          bestPracticesScore: scores.bestPractices || 0,
          missingElements: _detectMissingSeoElements(website, schemaTypes)
        }
      });
    }
    if (schemaTypes.length < 3) {
      gaps.push({ 
        type: 'Technical', 
        area: 'Schema', 
        issue: `Limited schema (${schemaTypes.length} types)`, 
        opportunity: 'Rich snippet advantage', 
        effort: 'Low', 
        impact: 'Medium', 
        priority: 2,
        rawProof: {
          schemasDetected: schemaProof.rawData.schemasDetected,
          schemaCount: schemaProof.rawData.schemaCount,
          missingCritical: schemaProof.rawData.missingCritical,
          recommendedSchemas: ['Article', 'BreadcrumbList', 'FAQPage', 'Organization']
            .filter(s => !schemaTypes.some(st => st.toLowerCase().includes(s.toLowerCase())))
        }
      });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT GAPS WITH ACTUAL PROOF
    // ═══════════════════════════════════════════════════════════════════════════
    if (wordCount < 1500) {
      gaps.push({ 
        type: 'Content', 
        area: 'Depth', 
        issue: `Thin content (${wordCount} words)`, 
        opportunity: 'Comprehensive content', 
        effort: 'High', 
        impact: 'High', 
        priority: 1,
        rawProof: {
          actualWordCount: contentProof.rawData.wordCount,
          readingTime: contentProof.rawData.readingTime,
          avgWordsPerSection: contentProof.rawData.avgWordsPerSection,
          contentDepth: contentProof.rawData.contentDepth,
          recommendation: `Increase content to 2000+ words for comprehensive coverage`
        }
      });
    }
    if (h2Array.length < 5) {
      gaps.push({ 
        type: 'Content', 
        area: 'Structure', 
        issue: `Few headings (${h2Array.length})`, 
        opportunity: 'Better content structure', 
        effort: 'Low', 
        impact: 'Medium', 
        priority: 2,
        rawProof: {
          h1Text: headingsProof.rawData.h1.text,
          h2Count: h2Array.length,
          h2Texts: h2Array.slice(0, 5),
          h3Count: (website.h3 || []).length,
          recommendation: 'Add more H2 headings (target 8-12) to improve content structure'
        }
      });
    }
    if (paa.length > 3) {
      gaps.push({ 
        type: 'Content', 
        area: 'FAQs', 
        issue: `Unanswered questions (${paa.length} PAA)`, 
        opportunity: 'FAQ content creation', 
        effort: 'Medium', 
        impact: 'High', 
        priority: 1,
        rawProof: {
          totalPaaQuestions: paa.length,
          actualQuestions: paa.slice(0, 10).map(q => q.question || q),
          questionTypes: {
            what: paa.filter(q => /^what/i.test(q.question || q)).length,
            how: paa.filter(q => /^how/i.test(q.question || q)).length,
            why: paa.filter(q => /^why/i.test(q.question || q)).length
          },
          recommendation: 'Create FAQ section targeting these specific questions'
        }
      });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AUTHORITY GAPS WITH ACTUAL PROOF
    // ═══════════════════════════════════════════════════════════════════════════
    if (pageRank < 3) {
      gaps.push({ 
        type: 'Authority', 
        area: 'Domain Rating', 
        issue: `Low authority (PR ${pageRank.toFixed(1)})`, 
        opportunity: 'Link building campaign', 
        effort: 'High', 
        impact: 'High', 
        priority: 2,
        rawProof: {
          actualPageRank: pageRank,
          // v28.6: API returns domainRank (camelCase), fallback to rank
          domainRank: openPR.domainRank ?? openPR.rank ?? 0,
          estimatedDomainRating: pageRank > 0 ? Math.round(pageRank * 10) : 'N/A',
          // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal
          gapToCompetitors: safeCompetitors[0]?.apiData?.openPageRank?.pageRank ?? safeCompetitors[0]?.apiData?.openPageRank?.page_rank_decimal ?? 0,
          recommendation: `Build quality backlinks to increase PageRank to 5+`
        }
      });
    }
    if ((profile.trustScore || 50) < 60) {
      gaps.push({ 
        type: 'Authority', 
        area: 'Trust', 
        issue: `Trust score below 60`, 
        opportunity: 'Trust signal building', 
        effort: 'Medium', 
        impact: 'Medium', 
        priority: 3,
        rawProof: {
          actualTrustScore: profile.trustScore || 0,
          missingTrustSignals: _detectMissingTrustSignals(website, schemaTypes),
          recommendation: 'Add trust signals: reviews, testimonials, certifications'
        }
      });
    }
    
    return {
      domain: c.domain || 'unknown',
      gaps: gaps,
      gapCount: gaps.length,
      vulnerabilityScore: Math.min(100, gaps.length * 12),
      attackVectors: gaps.filter(g => g.priority === 1).length,
      quickWins: gaps.filter(g => g.effort === 'Low').length,
      
      // ELITE: COMPLETE RAW DATA FOR THIS COMPETITOR
      competitorRawData: {
        performance: {
          performanceScore: scores.performance || 0,
          seoScore: scores.seo || 0,
          accessibilityScore: scores.accessibility || 0,
          lcpMs: cwvProof.rawData.lcp.value,
          clsScore: cwvProof.rawData.cls.value
        },
        content: {
          wordCount: contentProof.rawData.wordCount,
          h1Text: headingsProof.rawData.h1.text,
          h2Count: h2Array.length,
          h2Texts: h2Array.slice(0, 8)
        },
        authority: {
          pageRank: pageRank,
          domainRank: openPR.rank || 0
        },
        schema: {
          count: schemaProof.rawData.schemaCount,
          types: schemaProof.rawData.schemasDetected.slice(0, 10)
        },
        serp: {
          paaCount: paa.length,
          paaQuestions: paa.slice(0, 5).map(q => q.question || q)
        }
      },
      
      // ENHANCED SCORE BREAKDOWN WITH RAW DATA PROOF
      enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c)
    };
  });
  
  // Aggregate all gaps for cross-competitor analysis
  const allGaps = opportunityData.flatMap(o => o.gaps);
  
  // Group by type
  const technicalGaps = allGaps.filter(g => g.type === 'Technical');
  const contentGaps = allGaps.filter(g => g.type === 'Content');
  const authorityGaps = allGaps.filter(g => g.type === 'Authority');
  
  // Identify quick wins (low effort, high impact)
  const quickWins = allGaps
    .filter(g => g.effort === 'Low' && (g.impact === 'High' || g.impact === 'Medium'))
    .map(g => ({
      ...g,
      expectedTimeframe: g.effort === 'Low' ? '1-2 weeks' : g.effort === 'Medium' ? '2-4 weeks' : '1-3 months'
    }));
  
  // Priority matrix (effort vs impact)
  const priorityMatrix = {
    doFirst: allGaps.filter(g => g.effort === 'Low' && g.impact === 'High'),
    doNext: allGaps.filter(g => (g.effort === 'Medium' && g.impact === 'High') || (g.effort === 'Low' && g.impact === 'Medium')),
    planFor: allGaps.filter(g => g.effort === 'High' && g.impact === 'High'),
    consider: allGaps.filter(g => g.impact === 'Medium' && g.effort !== 'Low'),
    deprioritize: allGaps.filter(g => g.impact === 'Low')
  };
  
  // Identify most vulnerable competitors
  opportunityData.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
  
  const avgVulnerability = opportunityData.reduce((sum, o) => sum + o.vulnerabilityScore, 0) / (opportunityData.length || 1);
  const mostVulnerable = opportunityData[0] || {};
  
  return {
    // Competitor Vulnerability Rankings
    vulnerabilityRankings: opportunityData.map((o, idx) => ({ ...o, rank: idx + 1 })),
    
    // Gap Analysis by Category
    gapAnalysis: {
      technical: {
        count: technicalGaps.length,
        commonIssues: _getMostCommonIssues(technicalGaps),
        opportunities: technicalGaps.slice(0, 5)
      },
      content: {
        count: contentGaps.length,
        commonIssues: _getMostCommonIssues(contentGaps),
        opportunities: contentGaps.slice(0, 5)
      },
      authority: {
        count: authorityGaps.length,
        commonIssues: _getMostCommonIssues(authorityGaps),
        opportunities: authorityGaps.slice(0, 5)
      }
    },
    
    // Quick Wins
    quickWins: {
      total: quickWins.length,
      topOpportunities: quickWins.slice(0, 10),
      estimatedImpact: 'High visibility improvement within 2-4 weeks'
    },
    
    // Priority Matrix
    priorityMatrix: {
      doFirst: { count: priorityMatrix.doFirst.length, items: priorityMatrix.doFirst.slice(0, 5), label: 'Quick Wins' },
      doNext: { count: priorityMatrix.doNext.length, items: priorityMatrix.doNext.slice(0, 5), label: 'Strategic Priorities' },
      planFor: { count: priorityMatrix.planFor.length, items: priorityMatrix.planFor.slice(0, 5), label: 'Major Projects' },
      consider: { count: priorityMatrix.consider.length, label: 'Nice to Have' },
      deprioritize: { count: priorityMatrix.deprioritize.length, label: 'Low Priority' }
    },
    
    // Attack Vectors (highest priority gaps)
    attackVectors: {
      total: allGaps.filter(g => g.priority === 1).length,
      byCompetitor: opportunityData.map(o => ({
        domain: o.domain,
        vectors: o.attackVectors,
        primaryVector: o.gaps.find(g => g.priority === 1)?.area || 'None identified'
      }))
    },
    
    // Opportunity Score Summary
    opportunitySummary: {
      totalGapsIdentified: allGaps.length,
      avgVulnerability: Math.round(avgVulnerability),
      mostVulnerable: mostVulnerable.domain,
      mostVulnerableScore: mostVulnerable.vulnerabilityScore,
      quickWinCount: quickWins.length,
      highPriorityCount: allGaps.filter(g => g.priority === 1).length
    },
    
    // Strategic Insight
    sectionStrategicInsight: {
      executiveSummary: `Opportunity analysis reveals ${allGaps.length} total gaps across ${opportunityData.length} competitors. ${mostVulnerable.domain || 'Unknown'} is most vulnerable with ${mostVulnerable.vulnerabilityScore || 0} vulnerability score.`,
      swot: {
        strengths: ['Comprehensive gap mapping completed', 'Priority matrix established'],
        weaknesses: ['Some gaps require significant resources', 'Authority building takes time'],
        opportunities: [`${quickWins.length} quick wins identified`, `Target ${mostVulnerable.domain || 'vulnerable competitors'} first`],
        threats: ['Competitors may address gaps', 'Market dynamics shifting']
      },
      recommendations: [
        { priority: 'IMMEDIATE', action: `Execute ${quickWins.length} quick wins for fast results`, effort: 'Low', impact: 'High' },
        { priority: 'HIGH', action: `Attack ${mostVulnerable.domain || 'most vulnerable competitor'}'s weak points`, effort: 'Medium', impact: 'High' },
        { priority: 'MEDIUM', action: 'Build authority to close gap with leaders', effort: 'High', impact: 'High' }
      ],
      opportunityScore: Math.round(avgVulnerability),
      aiInsight: `Opportunity analysis identifies ${avgVulnerability > 50 ? 'significant competitive vulnerabilities' : 'moderate gap opportunities'}. The ${quickWins.length} quick wins should be prioritized immediately, followed by systematic exploitation of ${mostVulnerable.domain || 'competitor'}'s ${mostVulnerable.gaps?.[0]?.area || 'identified'} weaknesses.`
    },
    
    dataSource: 'Real Data (PageSpeed + SERP + Schema Analysis) + Gap Modeling',
    generatedAt: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR OPPORTUNITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function _getMostCommonIssues(gaps) {
  const issues = {};
  gaps.forEach(g => {
    issues[g.area] = (issues[g.area] || 0) + 1;
  });
  return Object.entries(issues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area, count]) => `${area} (${count} competitors)`);
}

/**
 * ELITE: Detect missing SEO elements for opportunity analysis
 */
function _detectMissingSeoElements(website, schemaTypes) {
  const missing = [];
  const title = website.title || '';
  const description = website.description || '';
  const h1 = website.h1 || '';
  
  if (!title || title.length < 30) missing.push('Title too short');
  if (title.length > 60) missing.push('Title too long (truncation risk)');
  if (!description || description.length < 100) missing.push('Meta description too short');
  if (description.length > 160) missing.push('Meta description too long');
  if (!h1) missing.push('Missing H1');
  if (schemaTypes.length === 0) missing.push('No schema markup');
  if (!schemaTypes.some(s => /article|blogpost/i.test(s))) missing.push('Missing Article schema');
  if (!schemaTypes.some(s => /breadcrumb/i.test(s))) missing.push('Missing Breadcrumb schema');
  
  return missing;
}

/**
 * ELITE: Detect missing trust signals for opportunity analysis
 */
function _detectMissingTrustSignals(website, schemaTypes) {
  const missing = [];
  const fullText = ((website.title || '') + ' ' + (website.description || '') + ' ' + ((website.h2 || []).join(' '))).toLowerCase();
  
  if (!fullText.includes('verified') && !fullText.includes('certified')) missing.push('No verification claims');
  if (!fullText.includes('review') && !fullText.includes('testimonial')) missing.push('No reviews/testimonials');
  if (!schemaTypes.some(s => /review|rating/i.test(s))) missing.push('No Review schema');
  if (!schemaTypes.some(s => /organization/i.test(s))) missing.push('No Organization schema');
  if (!schemaTypes.some(s => /person|author/i.test(s))) missing.push('No Author schema');
  if (!fullText.includes('secure') && !fullText.includes('privacy')) missing.push('No security/privacy messaging');
  
  return missing;
}

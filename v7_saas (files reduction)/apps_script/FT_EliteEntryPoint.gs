/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteEntryPoint.gs - ELITE ENTRY POINT v12.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Enhanced entry point for Elite Tab Intelligence System
 * Adds comprehensive data quality summary and proof availability tracking
 * 
 * NOTE: This file enhances FT_GetEliteTabData - ensure this file loads AFTER 
 * FT_CompetitorKW_Fetcher.gs in Apps Script
 * 
 * @author SerpifAI Engineering
 * @version 12.0.0
 */

/**
 * FT_GetEliteTabDataEnhanced - Enhanced entry point with full proof system
 * Call this instead of FT_GetEliteTabData for comprehensive data quality tracking
 */
function FT_GetEliteTabDataEnhanced(competitors, niche) {
  console.log('📊 FT_GetEliteTabDataEnhanced v12.0 called for', competitors?.length || 0, 'competitors');
  
  // Call the base function
  const eliteData = FT_GenerateEliteTabsViaGemini(competitors || [], niche);
  
  // Calculate comprehensive data quality metrics
  const safeCompetitors = competitors || [];
  const total = Math.max(1, safeCompetitors.length);
  
  // Data source availability tracking
  const oracleCount = safeCompetitors.filter(c => 
    c.stages?.oracleFetcher?.success || 
    c.synthesized?.website?.title ||
    c.stages?.phpFetcher?.success
  ).length;
  
  const serperCount = safeCompetitors.filter(c => 
    c.apiData?.serper?.organic?.length > 0 ||
    c.stages?.serper?.success
  ).length;
  
  const pageSpeedCount = safeCompetitors.filter(c => 
    c.apiData?.pageSpeed?.scores?.performance > 0 ||
    c.stages?.pageSpeed?.success
  ).length;
  
  const openPageRankCount = safeCompetitors.filter(c => 
    c.apiData?.openPageRank?.page_rank_decimal > 0 ||
    c.stages?.openPageRank?.success
  ).length;
  
  // Build comprehensive data quality summary
  const dataQualitySummary = {
    version: '12.0 - Elite Proof System',
    totalCompetitors: safeCompetitors.length,
    
    // Real-time data source status
    realDataStatus: {
      oracleFetcher: { 
        status: oracleCount >= total * 0.5 ? '✓ Active' : oracleCount > 0 ? '⚠ Partial' : '✗ Unavailable',
        coverage: Math.round((oracleCount / total) * 100),
        count: oracleCount,
        description: 'Primary content fetcher - titles, H1/H2, word count, schema'
      },
      serperAPI: {
        status: serperCount >= total * 0.5 ? '✓ Active' : serperCount > 0 ? '⚠ Partial' : '✗ Unavailable',
        coverage: Math.round((serperCount / total) * 100),
        count: serperCount,
        description: 'SERP data - rankings, PAA, related searches'
      },
      pageSpeedAPI: {
        status: pageSpeedCount >= total * 0.5 ? '✓ Active' : pageSpeedCount > 0 ? '⚠ Partial' : '✗ Unavailable',
        coverage: Math.round((pageSpeedCount / total) * 100),
        count: pageSpeedCount,
        description: 'Core Web Vitals, performance scores, SEO audit'
      },
      openPageRankAPI: {
        status: openPageRankCount >= total * 0.5 ? '✓ Active' : openPageRankCount > 0 ? '⚠ Partial' : '✗ Unavailable',
        coverage: Math.round((openPageRankCount / total) * 100),
        count: openPageRankCount,
        description: 'Domain authority, PageRank, global ranking'
      }
    },
    
    // Overall quality assessment
    overallQuality: {
      score: Math.round(((oracleCount + serperCount + pageSpeedCount + openPageRankCount) / (total * 4)) * 100),
      level: (oracleCount + serperCount + pageSpeedCount + openPageRankCount) >= total * 3 ? 'Excellent' :
             (oracleCount + serperCount + pageSpeedCount + openPageRankCount) >= total * 2 ? 'Good' :
             (oracleCount + serperCount + pageSpeedCount + openPageRankCount) >= total ? 'Fair' : 'Limited',
      recommendation: oracleCount < total ? 'Some competitors may show estimated data. Re-run analysis for complete coverage.' : 
                      'Full data coverage achieved.'
    },
    
    // Proof system status
    proofSystem: {
      competitorProofsAvailable: !!(eliteData.competitorProofs && eliteData.competitorProofs.length > 0),
      hoverInsightsAvailable: !!(eliteData.hoverInsights),
      eliteExtractorsLoaded: typeof FT_GenerateEliteHoverInsights === 'function',
      availableFunctions: [
        typeof FT_ExtractSERPPositionProof === 'function' ? '✓ SERP Position Proof' : null,
        typeof FT_ExtractGEOAEOProof === 'function' ? '✓ GEO/AEO Proof' : null,
        typeof FT_ExtractBacklinksProof === 'function' ? '✓ Backlinks Proof' : null,
        typeof FT_ExtractInternalLinksProof === 'function' ? '✓ Internal Links Proof' : null,
        typeof FT_ExtractContentProofDetailed === 'function' ? '✓ Content Proof' : null,
        typeof FT_ExtractTechnicalProof === 'function' ? '✓ Technical Proof' : null,
        typeof FT_ExtractEEATProofEnhanced === 'function' ? '✓ E-E-A-T Proof' : null,
        typeof FT_ExtractPSEOProof === 'function' ? '✓ PSEO Proof' : null,
        typeof FT_GenerateGeminiInsight === 'function' ? '✓ Gemini Insights' : null,
        typeof FT_GenerateGeminiDeepInsight === 'function' ? '✓ Gemini Deep Insights' : null
      ].filter(Boolean)
    },
    
    // Per-competitor data quality breakdown
    competitorQuality: safeCompetitors.slice(0, 6).map(c => {
      const hasOracle = !!(c.stages?.oracleFetcher?.success || c.synthesized?.website?.title);
      const hasSerper = !!(c.apiData?.serper?.organic?.length > 0);
      const hasPageSpeed = !!(c.apiData?.pageSpeed?.scores?.performance > 0);
      const hasOpenPageRank = !!(c.apiData?.openPageRank?.page_rank_decimal > 0);
      const sources = [hasOracle, hasSerper, hasPageSpeed, hasOpenPageRank].filter(Boolean).length;
      
      return {
        domain: c.domain || 'unknown',
        dataSources: sources,
        quality: sources >= 4 ? 'Excellent' : sources >= 3 ? 'Good' : sources >= 2 ? 'Fair' : 'Limited',
        oracle: hasOracle ? '✓' : '✗',
        serper: hasSerper ? '✓' : '✗',
        pageSpeed: hasPageSpeed ? '✓' : '✗',
        openPageRank: hasOpenPageRank ? '✓' : '✗',
        realDataPercent: Math.round((sources / 4) * 100)
      };
    })
  };
  
  return {
    success: true,
    data: eliteData,
    dataQualitySummary: dataQualitySummary,
    version: '12.0 - Elite Proof System',
    timestamp: new Date().toISOString()
  };
}

/**
 * FT_GetDataQualityReport - Generate standalone data quality report
 * Useful for debugging and understanding data coverage
 */
function FT_GetDataQualityReport(competitors) {
  const safeCompetitors = competitors || [];
  const total = Math.max(1, safeCompetitors.length);
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('📊 DATA QUALITY REPORT - ELITE v12.0');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  // Count data sources
  let oracleCount = 0, serperCount = 0, pageSpeedCount = 0, openPageRankCount = 0;
  
  safeCompetitors.forEach((c, i) => {
    const domain = c.domain || `Competitor ${i + 1}`;
    const hasOracle = !!(c.stages?.oracleFetcher?.success || c.synthesized?.website?.title);
    const hasSerper = !!(c.apiData?.serper?.organic?.length > 0);
    const hasPageSpeed = !!(c.apiData?.pageSpeed?.scores?.performance > 0);
    const hasOpenPageRank = !!(c.apiData?.openPageRank?.page_rank_decimal > 0);
    
    if (hasOracle) oracleCount++;
    if (hasSerper) serperCount++;
    if (hasPageSpeed) pageSpeedCount++;
    if (hasOpenPageRank) openPageRankCount++;
    
    console.log(`${domain}:`);
    console.log(`  Oracle: ${hasOracle ? '✓' : '✗'} | Serper: ${hasSerper ? '✓' : '✗'} | PageSpeed: ${hasPageSpeed ? '✓' : '✗'} | OpenPageRank: ${hasOpenPageRank ? '✓' : '✗'}`);
    
    // Show real data samples
    if (hasOracle) {
      const title = c.synthesized?.website?.title || 'N/A';
      const wordCount = c.synthesized?.website?.wordCount || 0;
      console.log(`  → Title: "${title.substring(0, 50)}..." | Words: ${wordCount}`);
    }
    if (hasSerper) {
      const rankings = c.apiData?.serper?.organic?.length || 0;
      console.log(`  → SERP Rankings: ${rankings}`);
    }
    if (hasPageSpeed) {
      const perf = c.apiData?.pageSpeed?.scores?.performance || 0;
      console.log(`  → Performance: ${Math.round(perf)}/100`);
    }
    if (hasOpenPageRank) {
      const pr = c.apiData?.openPageRank?.page_rank_decimal || 0;
      console.log(`  → PageRank: ${pr.toFixed(2)}`);
    }
    console.log('');
  });
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('SUMMARY:');
  console.log(`  Oracle Fetcher: ${oracleCount}/${total} (${Math.round((oracleCount/total)*100)}%)`);
  console.log(`  Serper API: ${serperCount}/${total} (${Math.round((serperCount/total)*100)}%)`);
  console.log(`  PageSpeed API: ${pageSpeedCount}/${total} (${Math.round((pageSpeedCount/total)*100)}%)`);
  console.log(`  OpenPageRank API: ${openPageRankCount}/${total} (${Math.round((openPageRankCount/total)*100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  return {
    oracle: { count: oracleCount, percent: Math.round((oracleCount/total)*100) },
    serper: { count: serperCount, percent: Math.round((serperCount/total)*100) },
    pageSpeed: { count: pageSpeedCount, percent: Math.round((pageSpeedCount/total)*100) },
    openPageRank: { count: openPageRankCount, percent: Math.round((openPageRankCount/total)*100) },
    overall: Math.round(((oracleCount + serperCount + pageSpeedCount + openPageRankCount) / (total * 4)) * 100)
  };
}

/**
 * FT_VerifyProofExtractors - Verify all proof extractor functions are available
 * Useful for deployment validation
 */
function FT_VerifyProofExtractors() {
  const functions = {
    'FT_ExtractSERPPositionProof': typeof FT_ExtractSERPPositionProof === 'function',
    'FT_GenerateGeminiInsight': typeof FT_GenerateGeminiInsight === 'function',
    'FT_ExtractGEOAEOProof': typeof FT_ExtractGEOAEOProof === 'function',
    'FT_ExtractBacklinksProof': typeof FT_ExtractBacklinksProof === 'function',
    'FT_ExtractInternalLinksProof': typeof FT_ExtractInternalLinksProof === 'function',
    'FT_OrganizeDataForTabs': typeof FT_OrganizeDataForTabs === 'function',
    'FT_GenerateEliteHoverInsights': typeof FT_GenerateEliteHoverInsights === 'function',
    'FT_GenerateGeminiDeepInsight': typeof FT_GenerateGeminiDeepInsight === 'function',
    'FT_ExtractContentProofDetailed': typeof FT_ExtractContentProofDetailed === 'function',
    'FT_ExtractTechnicalProof': typeof FT_ExtractTechnicalProof === 'function',
    'FT_ExtractEEATProofEnhanced': typeof FT_ExtractEEATProofEnhanced === 'function',
    'FT_ExtractPSEOProof': typeof FT_ExtractPSEOProof === 'function'
  };
  
  const available = Object.values(functions).filter(Boolean).length;
  const total = Object.keys(functions).length;
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🔍 PROOF EXTRACTOR VERIFICATION - ELITE v12.0');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  Object.entries(functions).forEach(([name, available]) => {
    console.log(`${available ? '✓' : '✗'} ${name}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`RESULT: ${available}/${total} functions available (${Math.round((available/total)*100)}%)`);
  console.log(available === total ? '✓ All proof extractors loaded successfully!' : '⚠ Some extractors missing - check FT_EliteProofExtractors.gs');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  return {
    functions: functions,
    available: available,
    total: total,
    allLoaded: available === total
  };
}

// End of FT_EliteEntryPoint.gs

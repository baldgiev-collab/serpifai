/**
 * ⚡ SERPIFAI Elite - Stage 1: Market Research & Strategy
 * Mega Prompt for Brand Strategy & Competitive Analysis
 * v6 SaaS Edition
 * 
 * V9.0 UPDATE: Now integrates saved competitor analysis data
 * to provide data-driven competitive intelligence in the prompt
 */

/**
 * Main execution function for Stage 1
 * Called from UI_Main.gs after credit authorization
 */
function DB_Workflow_Stage1(projectData, selectedModel) {
  try {
    Logger.log('🎯 Running Stage 1: Market Research & Strategy');
    
    // VALIDATION: Check if projectData exists
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid projectData: expected object, got ' + typeof projectData);
    }
    
    Logger.log('📊 Project data received with ' + Object.keys(projectData).length + ' fields');
    Logger.log('🤖 Using model: ' + (selectedModel || 'default'));
    
    // V9.0: Load saved competitor analysis if available
    const competitorInsights = loadCompetitorInsightsForWorkflow(projectData);
    if (competitorInsights && competitorInsights.hasData) {
      Logger.log('✅ Competitor insights loaded: ' + competitorInsights.competitorCount + ' competitors');
      projectData._competitorInsights = competitorInsights;
    } else {
      Logger.log('ℹ️ No saved competitor analysis found - running without competitor data');
    }
    
    // Build the elite mega prompt
    const prompt = buildStage1Prompt(projectData);
    Logger.log('✅ Prompt built, length: ' + prompt.length + ' chars');
    
    // Call Gemini API
    const geminiResponse = callStage1GeminiAPI(prompt, selectedModel);
    Logger.log('✅ Gemini response received, length: ' + geminiResponse.length + ' chars');
    
    // Parse response into structured JSON
    const structuredData = parseStage1Response(geminiResponse);
    Logger.log('✅ Response parsed successfully');
    
    // Clean the report (remove JSON block, artifacts, etc.)
    const cleanReport = cleanMarkdownReport(geminiResponse);
    Logger.log('✅ Report cleaned, length: ' + cleanReport.length + ' chars');
    
    // Return both JSON and full response
    return {
      success: true,
      stage: 1,
      stageName: 'Market Research & Strategy',
      json: structuredData,  // For UI charts/visualization
      report: cleanReport,  // For AI report panel (markdown only, no JSON)
      timestamp: new Date().toISOString(),
      projectId: projectData.projectId || projectData.brandName || 'UNNAMED_PROJECT',
      competitorDataUsed: !!(competitorInsights && competitorInsights.hasData),
      // V7: Include competitor analysis summary for UI display
      competitorAnalysisSummary: (competitorInsights && competitorInsights.hasData) ? {
        competitorCount: competitorInsights.competitorCount || 0,
        topCompetitor: competitorInsights.topCompetitor || '',
        marketAverages: competitorInsights.marketAverages || {},
        geminiInsights: competitorInsights.geminiInsights || null,
        technicalScoresAvailable: !!(competitorInsights.technicalScores && competitorInsights.technicalScores.length > 0),
        contentInsightsAvailable: !!(competitorInsights.contentInsights && competitorInsights.contentInsights.length > 0),
        keywordDataAvailable: !!(competitorInsights.keywordIntelligence && competitorInsights.keywordIntelligence.totalKeywords > 0)
      } : null
    };
    
  } catch (error) {
    Logger.log('❌ Stage 1 Error: ' + error.toString());
    Logger.log('❌ Stack: ' + error.stack);
    return {
      success: false,
      stage: 1,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * V9.0: Load and summarize competitor analysis for workflow prompts
 * V9.1: COMPREHENSIVE - Includes ALL data for full strategic analysis
 * Extracts key insights from saved competitor data
 */
function loadCompetitorInsightsForWorkflow(projectData) {
  try {
    const projectId = projectData.projectId || projectData.brandName;
    if (!projectId) {
      return { hasData: false, reason: 'No project ID' };
    }
    
    Logger.log('📂 Loading COMPREHENSIVE competitor insights for project: ' + projectId);
    
    // Try to load saved competitor results
    const savedResults = loadCompetitorResults(projectId);
    
    if (!savedResults || !savedResults.success || !savedResults.data) {
      return { hasData: false, reason: 'No saved competitor analysis' };
    }
    
    const data = savedResults.data;
    const competitors = data.competitorsArray || [];
    
    if (competitors.length === 0) {
      return { hasData: false, reason: 'No competitors in saved data' };
    }
    
    // Extract COMPREHENSIVE insights for the prompt
    const insights = {
      hasData: true,
      competitorCount: competitors.length,
      analysisTimestamp: data.timestamp,
      
      // Competitor overview
      competitorDomains: competitors.map(c => c.domain).filter(Boolean),
      
      // Authority & Traffic metrics
      authorityMetrics: competitors.map(c => ({
        domain: c.domain,
        authorityScore: c.processedMetrics?.authorityScore || c.apiData?.openPageRank?.rank * 10 || 0,
        pageRank: c.processedMetrics?.pageRank || c.apiData?.openPageRank?.rank || 0,
        estimatedTraffic: c.processedMetrics?.organicTraffic || c.processedMetrics?.estimatedTraffic || 0,
        organicKeywords: c.processedMetrics?.organicKeywords || 0,
        backlinks: c.processedMetrics?.backlinks || 0,
        referringDomains: c.processedMetrics?.referringDomains || 0
      })),
      
      // ═══════════════════════════════════════════════════════════════════
      // TOP PAGES - Best performing pages per competitor
      // ═══════════════════════════════════════════════════════════════════
      topPages: competitors.map(c => {
        const pages = c.synthesized?.topPages || c.snapshot?.topPages || c.apiData?.serper?.organic || [];
        return {
          domain: c.domain,
          pages: pages.slice(0, 10).map(p => ({
            url: p.url || p.link || '',
            title: p.title || '',
            position: p.position || 0,
            trafficShare: p.trafficShare || p.traffic || 0,
            snippet: p.snippet || ''
          }))
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // BACKLINKS DATA - Link profile analysis
      // ═══════════════════════════════════════════════════════════════════
      backlinkProfiles: competitors.map(c => {
        const bl = c.backlinkData || {};
        return {
          domain: c.domain,
          totalBacklinks: c.processedMetrics?.backlinks || bl.backlinkCount || 0,
          referringDomains: c.processedMetrics?.referringDomains || bl.referringDomainCount || 0,
          topReferrers: (bl.topReferringDomains || []).slice(0, 5).map(r => ({
            domain: r.domain || r,
            dr: r.domainRating || r.dr || 0,
            links: r.linkCount || 1
          })),
          linkTypes: bl.linkTypes || { dofollow: 0, nofollow: 0 }
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // KEYWORD DATA - Keywords and gaps
      // ═══════════════════════════════════════════════════════════════════
      keywordProfiles: competitors.map(c => {
        const kw = c.keywordProfile || {};
        const synth = c.synthesized?.seo || {};
        return {
          domain: c.domain,
          totalKeywords: c.processedMetrics?.organicKeywords || kw.keywordCount || 0,
          topKeywords: (kw.topKeywords || synth.topKeywords || []).slice(0, 10).map(k => 
            typeof k === 'string' ? { keyword: k, position: 0, volume: 0 } : k
          ),
          brandedKeywords: kw.brandedKeywords || [],
          longTailKeywords: (kw.longTailKeywords || []).slice(0, 5),
          featuredSnippets: kw.featuredSnippets || synth.featuredSnippets || 0,
          peopleAlsoAsk: (synth.peopleAlsoAsk || kw.peopleAlsoAsk || []).slice(0, 5),
          relatedSearches: (synth.relatedSearches || kw.relatedSearches || []).slice(0, 5)
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // TECHNICAL / PAGESPEED INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      technicalScores: competitors.map(c => {
        const ps = c.apiData?.pageSpeed || c.stages?.pageSpeed?.data || {};
        const scores = ps.scores || {};
        const cwv = ps.core_web_vitals || {};
        return {
          domain: c.domain,
          seoScore: scores.seo || c.processedMetrics?.seoScore || 0,
          performanceScore: scores.performance || c.processedMetrics?.performanceScore || 0,
          accessibilityScore: scores.accessibility || c.processedMetrics?.accessibilityScore || 0,
          bestPracticesScore: scores.best_practices || c.processedMetrics?.bestPracticesScore || 0,
          coreWebVitals: {
            lcp: cwv.lcp || cwv.LCP || 'N/A',
            fid: cwv.fid || cwv.FID || 'N/A',
            cls: cwv.cls || cwv.CLS || 'N/A',
            fcp: cwv.fcp || cwv.FCP || 'N/A',
            ttfb: cwv.ttfb || cwv.TTFB || 'N/A'
          },
          loadTime: ps.loadTime || 'N/A',
          mobileUsability: ps.strategy || 'mobile'
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // CONTENT INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      contentInsights: competitors.map(c => {
        const synth = c.synthesized || {};
        const snapshot = c.snapshot || {};
        return {
          domain: c.domain,
          wordCount: synth.content?.wordCount || snapshot.metadata?.wordCount || 0,
          headingCount: synth.content?.headingCount || 0,
          h1: snapshot.metadata?.h1 || '',
          h2Count: (snapshot.metadata?.h2 || []).length,
          internalLinks: (synth.content?.internalLinks || snapshot.links?.internal || []).length,
          externalLinks: (synth.content?.externalLinks || snapshot.links?.external || []).length,
          hasSchema: snapshot.schema?.hasOrganizationSchema || false,
          schemaTypes: snapshot.schema?.types || [],
          techStack: synth.technical?.techStack?.join(', ') || ''
        };
      }),
      
      // ═══════════════════════════════════════════════════════════════════
      // GEMINI ANALYSIS INSIGHTS
      // ═══════════════════════════════════════════════════════════════════
      geminiInsights: {
        executiveBrief: data.geminiAnalysis?.executiveBrief?.threeLineSummary || 
                       data.geminiAnalysis?.executiveBrief?.landscapeOverview || '',
        clientPosition: data.geminiAnalysis?.executiveBrief?.clientPosition || '',
        killMoves: (data.geminiAnalysis?.killMoves || []).slice(0, 5).map(k => ({
          title: k.title || k,
          description: k.description || k.rationale || '',
          impact: k.impact || 'High'
        })),
        competitorRankings: (data.geminiAnalysis?.competitorRankings || []).slice(0, 6),
        keyOpportunities: (data.geminiAnalysis?.opportunities || data.geminiAnalysis?.keyOpportunities || []).slice(0, 5),
        contentGaps: data.geminiAnalysis?.contentGaps || data.geminiAnalysis?.gaps?.content || [],
        keywordGaps: data.geminiAnalysis?.keywordGaps || data.geminiAnalysis?.gaps?.keywords || [],
        backlinkGaps: data.geminiAnalysis?.backlinkGaps || data.geminiAnalysis?.gaps?.backlinks || []
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // ELITE TAB INTELLIGENCE (if available)
      // ═══════════════════════════════════════════════════════════════════
      eliteIntel: data.eliteTabIntelligence ? {
        keywordStrategy: data.eliteTabIntelligence.keywordStrategy || null,
        contentIntel: data.eliteTabIntelligence.contentIntel || null,
        marketIntel: data.eliteTabIntelligence.marketIntelligence || null,
        opportunities: data.eliteTabIntelligence.opportunities || null,
        geoAeo: data.eliteTabIntelligence.geoAeo || null,
        authority: data.eliteTabIntelligence.authority || null
      } : null
    };
    
    // Calculate market averages
    const avgAuthority = insights.authorityMetrics.reduce((sum, c) => sum + c.authorityScore, 0) / competitors.length;
    const avgTraffic = insights.authorityMetrics.reduce((sum, c) => sum + c.estimatedTraffic, 0) / competitors.length;
    const avgSEO = insights.technicalScores.reduce((sum, c) => sum + c.seoScore, 0) / competitors.length;
    const avgPerf = insights.technicalScores.reduce((sum, c) => sum + c.performanceScore, 0) / competitors.length;
    const avgBacklinks = insights.authorityMetrics.reduce((sum, c) => sum + c.backlinks, 0) / competitors.length;
    const avgKeywords = insights.authorityMetrics.reduce((sum, c) => sum + c.organicKeywords, 0) / competitors.length;
    
    insights.marketAverages = {
      authority: Math.round(avgAuthority),
      traffic: Math.round(avgTraffic),
      seoScore: Math.round(avgSEO),
      performanceScore: Math.round(avgPerf),
      backlinks: Math.round(avgBacklinks),
      keywords: Math.round(avgKeywords)
    };
    
    // Find top performers
    const sortedByAuthority = [...insights.authorityMetrics].sort((a, b) => b.authorityScore - a.authorityScore);
    const sortedByTraffic = [...insights.authorityMetrics].sort((a, b) => b.estimatedTraffic - a.estimatedTraffic);
    const sortedBySEO = [...insights.technicalScores].sort((a, b) => b.seoScore - a.seoScore);
    
    insights.topCompetitor = sortedByAuthority[0]?.domain || competitors[0]?.domain;
    insights.topByTraffic = sortedByTraffic[0]?.domain;
    insights.topBySEO = sortedBySEO[0]?.domain;
    
    Logger.log('✅ COMPREHENSIVE competitor insights extracted successfully');
    Logger.log('   - Authority metrics: ' + insights.authorityMetrics.length);
    Logger.log('   - Top pages: ' + insights.topPages.reduce((s, c) => s + c.pages.length, 0) + ' total');
    Logger.log('   - Backlink profiles: ' + insights.backlinkProfiles.length);
    Logger.log('   - Keyword profiles: ' + insights.keywordProfiles.length);
    Logger.log('   - Technical scores: ' + insights.technicalScores.length);
    
    return insights;
    
  } catch (error) {
    Logger.log('⚠️ Error loading competitor insights: ' + error.toString());
    return { hasData: false, reason: error.toString() };
  }
}

/**
 * V9.1: Build COMPREHENSIVE competitor insights section for the Stage 1 prompt
 * Includes: Authority, Top Pages, Backlinks, Keywords, Gaps, PageSpeed, Opportunities
 * All data is dynamically loaded from the saved competitor analysis
 */
function buildCompetitorInsightsSection(insights) {
  if (!insights || !insights.hasData) {
    return '**📊 COMPETITOR INTELLIGENCE:** Not available - Run competitor analysis first for data-driven insights.';
  }
  
  let section = `
### ═══════════════════════════════════════════════════════════════════════════
### 📊 COMPREHENSIVE COMPETITOR INTELLIGENCE DATA (From Serpifai Analysis)
### ═══════════════════════════════════════════════════════════════════════════
**Analysis Date:** ${insights.analysisTimestamp || 'Recent'}
**Competitors Analyzed:** ${insights.competitorCount} (${insights.competitorDomains.join(', ')})
**Top Competitor by Authority:** ${insights.topCompetitor || 'Unknown'}
**Top by Traffic:** ${insights.topByTraffic || 'Unknown'} | **Top by SEO:** ${insights.topBySEO || 'Unknown'}

---

#### 1️⃣ AUTHORITY & TRAFFIC METRICS (Per Competitor)
`;

  // Authority metrics table
  if (insights.authorityMetrics && insights.authorityMetrics.length > 0) {
    section += `| Domain | Authority | PageRank | Est. Traffic | Keywords | Backlinks | Ref. Domains |\n`;
    section += `|--------|-----------|----------|--------------|----------|-----------|---------------|\n`;
    insights.authorityMetrics.forEach(c => {
      section += `| ${c.domain} | ${c.authorityScore}/100 | ${(c.pageRank || 0).toFixed(1)} | ${formatTrafficNumber(c.estimatedTraffic)} | ${formatTrafficNumber(c.organicKeywords)} | ${formatTrafficNumber(c.backlinks)} | ${formatTrafficNumber(c.referringDomains)} |\n`;
    });
  }
  
  section += `
**Market Benchmarks:** Avg Authority: ${insights.marketAverages?.authority || 0}/100 | Avg Traffic: ${formatTrafficNumber(insights.marketAverages?.traffic || 0)} | Avg Keywords: ${formatTrafficNumber(insights.marketAverages?.keywords || 0)} | Avg Backlinks: ${formatTrafficNumber(insights.marketAverages?.backlinks || 0)}

---

#### 2️⃣ TOP PAGES BY COMPETITOR (Best Performing Content)
`;

  // Top pages per competitor
  if (insights.topPages && insights.topPages.length > 0) {
    insights.topPages.forEach(comp => {
      if (comp.pages && comp.pages.length > 0) {
        section += `\n**${comp.domain}** (Top ${Math.min(5, comp.pages.length)} pages):\n`;
        comp.pages.slice(0, 5).forEach((page, i) => {
          const title = page.title ? page.title.substring(0, 60) : 'Untitled';
          section += `  ${i + 1}. "${title}" - ${page.url ? page.url.substring(0, 50) : 'URL N/A'}${page.position ? ` (Pos #${page.position})` : ''}\n`;
        });
      }
    });
  }
  
  section += `
---

#### 3️⃣ BACKLINK PROFILES & LINK GAPS
`;

  // Backlink profiles
  if (insights.backlinkProfiles && insights.backlinkProfiles.length > 0) {
    insights.backlinkProfiles.forEach(comp => {
      section += `\n**${comp.domain}:** ${formatTrafficNumber(comp.totalBacklinks)} backlinks from ${formatTrafficNumber(comp.referringDomains)} referring domains\n`;
      if (comp.topReferrers && comp.topReferrers.length > 0) {
        section += `  Top Referrers: `;
        section += comp.topReferrers.slice(0, 3).map(r => `${r.domain} (DR ${r.dr})`).join(', ');
        section += `\n`;
      }
    });
  }
  
  // Backlink gaps from Gemini analysis
  if (insights.geminiInsights?.backlinkGaps && insights.geminiInsights.backlinkGaps.length > 0) {
    section += `\n**🔗 BACKLINK GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.backlinkGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.domain || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 4️⃣ KEYWORD INTELLIGENCE & GAPS
`;

  // Keyword profiles
  if (insights.keywordProfiles && insights.keywordProfiles.length > 0) {
    insights.keywordProfiles.forEach(comp => {
      section += `\n**${comp.domain}:** ${formatTrafficNumber(comp.totalKeywords)} organic keywords\n`;
      if (comp.topKeywords && comp.topKeywords.length > 0) {
        section += `  Top Keywords: `;
        section += comp.topKeywords.slice(0, 5).map(k => 
          typeof k === 'string' ? k : (k.keyword || k.term || 'N/A')
        ).join(', ');
        section += `\n`;
      }
      if (comp.featuredSnippets > 0) {
        section += `  Featured Snippets: ${comp.featuredSnippets}\n`;
      }
      if (comp.peopleAlsoAsk && comp.peopleAlsoAsk.length > 0) {
        section += `  PAA Questions: ${comp.peopleAlsoAsk.slice(0, 3).join('; ')}\n`;
      }
    });
  }
  
  // Keyword gaps from Gemini analysis
  if (insights.geminiInsights?.keywordGaps && insights.geminiInsights.keywordGaps.length > 0) {
    section += `\n**🎯 KEYWORD GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.keywordGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.keyword || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 5️⃣ PAGESPEED & TECHNICAL PERFORMANCE
`;

  // Technical scores table
  if (insights.technicalScores && insights.technicalScores.length > 0) {
    section += `| Domain | SEO Score | Performance | Accessibility | Best Practices | LCP | CLS |\n`;
    section += `|--------|-----------|-------------|---------------|----------------|-----|-----|\n`;
    insights.technicalScores.forEach(c => {
      const cwv = c.coreWebVitals || {};
      section += `| ${c.domain} | ${c.seoScore}/100 | ${c.performanceScore}/100 | ${c.accessibilityScore}/100 | ${c.bestPracticesScore}/100 | ${cwv.lcp || 'N/A'} | ${cwv.cls || 'N/A'} |\n`;
    });
    
    section += `\n**Performance Benchmarks:** Avg SEO: ${insights.marketAverages?.seoScore || 0}/100 | Avg Performance: ${insights.marketAverages?.performanceScore || 0}/100\n`;
  }
  
  section += `
---

#### 6️⃣ CONTENT STRUCTURE & INSIGHTS
`;

  // Content insights
  if (insights.contentInsights && insights.contentInsights.length > 0) {
    insights.contentInsights.forEach(comp => {
      section += `\n**${comp.domain}:**\n`;
      section += `  Word Count: ${formatTrafficNumber(comp.wordCount)} | Headings: ${comp.headingCount} | H1: "${(comp.h1 || 'N/A').substring(0, 50)}"\n`;
      section += `  Internal Links: ${comp.internalLinks} | External Links: ${comp.externalLinks}\n`;
      if (comp.schemaTypes && comp.schemaTypes.length > 0) {
        section += `  Schema Types: ${comp.schemaTypes.slice(0, 5).join(', ')}\n`;
      }
      if (comp.techStack) {
        section += `  Tech Stack: ${comp.techStack}\n`;
      }
    });
  }
  
  // Content gaps from Gemini analysis
  if (insights.geminiInsights?.contentGaps && insights.geminiInsights.contentGaps.length > 0) {
    section += `\n**📝 CONTENT GAP OPPORTUNITIES:**\n`;
    insights.geminiInsights.contentGaps.slice(0, 5).forEach((gap, i) => {
      const gapText = typeof gap === 'string' ? gap : (gap.topic || gap.opportunity || JSON.stringify(gap));
      section += `  ${i + 1}. ${gapText}\n`;
    });
  }
  
  section += `
---

#### 7️⃣ STRATEGIC OPPORTUNITIES & KILL MOVES
`;

  // Gemini insights
  if (insights.geminiInsights) {
    if (insights.geminiInsights.executiveBrief) {
      section += `\n**AI Executive Summary:**\n${insights.geminiInsights.executiveBrief}\n`;
    }
    
    if (insights.geminiInsights.clientPosition) {
      section += `\n**Your Competitive Position:**\n${insights.geminiInsights.clientPosition}\n`;
    }
    
    if (insights.geminiInsights.killMoves && insights.geminiInsights.killMoves.length > 0) {
      section += `\n**🎯 STRATEGIC KILL MOVES (High-Impact Opportunities):**\n`;
      insights.geminiInsights.killMoves.forEach((move, i) => {
        if (typeof move === 'object') {
          section += `  ${i + 1}. **${move.title}** (${move.impact} Impact)\n`;
          if (move.description) {
            section += `     ${move.description.substring(0, 150)}\n`;
          }
        } else {
          section += `  ${i + 1}. ${move}\n`;
        }
      });
    }
    
    if (insights.geminiInsights.keyOpportunities && insights.geminiInsights.keyOpportunities.length > 0) {
      section += `\n**💡 KEY OPPORTUNITIES:**\n`;
      insights.geminiInsights.keyOpportunities.forEach((opp, i) => {
        const oppText = typeof opp === 'string' ? opp : (opp.title || opp.opportunity || JSON.stringify(opp));
        section += `  ${i + 1}. ${oppText}\n`;
      });
    }
    
    if (insights.geminiInsights.competitorRankings && insights.geminiInsights.competitorRankings.length > 0) {
      section += `\n**Competitor Rankings:**\n`;
      insights.geminiInsights.competitorRankings.forEach((r, i) => {
        const domain = typeof r === 'string' ? r : (r.domain || r.competitor || 'Unknown');
        const score = typeof r === 'object' ? (r.score || r.overallScore || '') : '';
        section += `  ${i + 1}. ${domain}${score ? ` (Score: ${score})` : ''}\n`;
      });
    }
  }
  
  section += `
---

#### 8️⃣ ELITE INTELLIGENCE SUMMARY
`;

  // Elite Tab Intel summary
  if (insights.eliteIntel) {
    if (insights.eliteIntel.keywordStrategy) {
      const ks = insights.eliteIntel.keywordStrategy;
      section += `\n**Keyword Strategy Intel:**\n`;
      if (ks.primaryKeywords) section += `  Primary Keywords: ${JSON.stringify(ks.primaryKeywords).substring(0, 200)}\n`;
      if (ks.gaps) section += `  Identified Gaps: ${ks.gaps.length || 0}\n`;
    }
    
    if (insights.eliteIntel.opportunities) {
      const ops = insights.eliteIntel.opportunities;
      section += `\n**Market Opportunities:**\n`;
      if (Array.isArray(ops)) {
        ops.slice(0, 3).forEach((o, i) => {
          section += `  ${i + 1}. ${typeof o === 'string' ? o : (o.title || o.opportunity || JSON.stringify(o).substring(0, 100))}\n`;
        });
      }
    }
  }
  
  section += `
---

**⚡ STRATEGIC ACTION DIRECTIVE:**
Use this comprehensive competitive intelligence to:
1. **Benchmark** your recommendations against real competitor metrics
2. **Identify gaps** in keywords, content, and backlinks that represent opportunities
3. **Prioritize** strategies based on what's working for top competitors
4. **Quantify** your recommendations with specific targets (e.g., "Match ${insights.topCompetitor}'s authority of ${insights.marketAverages?.authority || 0}/100")
5. **Reference** specific competitor data points when making positioning decisions

This data is REAL and CURRENT from our analysis - cite specific metrics in your strategic recommendations.
`;

  return section;
}

/**
 * Helper to format large traffic numbers
 */
function formatTrafficNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
}

/**
 * Build the Strategic Insights Engine Prompt for Stage 1
 * ELITE VERSION: Includes ALL 81+ input fields mapped as variables
 * Generates comprehensive dashboard-ready JSON + narrative report
 */
function buildStage1Prompt(data) {
  // Helper function to safely get field value
  function getField(obj, fieldName) {
    if (!obj) return 'Not provided';
    const value = obj[fieldName];
    return (value && String(value).trim()) ? String(value).trim() : 'Not provided';
  }

  // Build ELITE mega prompt with ALL fields mapped
  const prompt = `**ROLE / IDENTITY — ELITE STRATEGIC INTELLIGENCE ANALYST**

You are a world-class strategic intelligence operative combining:
- **McKinsey Partner-Level Strategy**: Porter's Five Forces, Blue Ocean thinking, competitive moat analysis
- **Bain Growth Consulting**: Market sizing, segment prioritization, whitespace identification
- **Peter Thiel's Zero-to-One Thinking**: Finding secrets competitors don't see, 10x opportunities
- **Alex Hormozi's Offer Architecture**: Grand Slam Offers, value stacking, irresistible positioning
- **Eugene Schwartz's Market Awareness**: 5 levels of awareness, sophistication stages
- **Robert Cialdini's Persuasion Science**: Psychological triggers, behavioral economics
- **Clayton Christensen's Jobs-To-Be-Done**: Hiring criteria, outcome-driven innovation

You're operating as the **Strategic Intelligence Engine** for ${getField(data, 'brandName')}, tasked with uncovering market opportunities that create unfair competitive advantages.

---

**YOUR MISSION — ELITE MARKET INTELLIGENCE**

You will perform DEEP strategic analysis across 4 dimensions:

**1. MARKET OPPORTUNITY MAPPING (Blue Ocean)**
- Identify uncontested market space competitors ignore
- Find "category of one" positioning opportunities
- Map value curves showing differentiation gaps
- Quantify addressable opportunity size

**2. COMPETITIVE KILL ZONE ANALYSIS**
- Identify competitor blind spots and structural weaknesses
- Find asymmetric advantages (where you can win 10x vs their 1x improvement)
- Map competitor resource constraints that create openings
- Time-sensitive opportunities before market shifts

**3. CUSTOMER PSYCHOLOGY DEEP DIVE**
- Uncover hidden frustrations competitors fail to address
- Map the "struggle timeline" (before → during → after moments)
- Identify belief barriers preventing purchase
- Find emotional triggers that accelerate decisions

**4. STRATEGIC MOAT CONSTRUCTION**
- Content moats: Topic ownership opportunities
- Authority moats: Credibility gaps to exploit  
- Distribution moats: Channel advantages
- Brand moats: Positioning no one else can claim

**CRITICAL REQUIREMENTS**:
⚠️ Every insight MUST be grounded in the provided data — NO generic advice
⚠️ Opportunities MUST be specific, actionable, and prioritized by impact
⚠️ Include "WHY NOW" timing analysis for each major opportunity
⚠️ Identify the ONE thing that would 10x their competitive position

---

## 📊 COMPLETE CONTEXT (ALL INPUT FIELDS MAPPED)

### STAGE 1: BRAND FOUNDATION & STRATEGY

**Core Brand Identity:**
- **Brand Name:** ${getField(data, 'brandName')}
- **Brand Archetype:** ${getField(data, 'brandArchetype')}
- **Brand Ideology:** ${getField(data, 'brandIdeology')}
- **Brand Lexicon & Voice:** ${getField(data, 'brandLexicon')}
- **UVP (Unique Value Proposition):** ${getField(data, 'uvp')}
- **Existing Messaging:** ${getField(data, 'existingMessaging')}
- **Core Topic:** ${getField(data, 'coreTopic')}
- **Product/Service:** ${getField(data, 'productOrService')}

**Target Audience Intelligence:**
- **Primary Audience:** ${getField(data, 'targetAudience')}
- **Secondary Audience:** ${getField(data, 'secondaryAudience')}
- **Customer Demographics:** ${getField(data, 'customerDemographics')}
- **Geographic Focus:** ${getField(data, 'geographicFocus')}
- **Industry Vertical:** ${getField(data, 'industryVertical')}

**Customer Psychology (CRITICAL for JTBD & Charts):**
- **Current Pains:** ${getField(data, 'audiencePains')}
- **Desired State:** ${getField(data, 'audienceDesired')}
- **Core Market Problem:** ${getField(data, 'coreMarketProblem')}

**Business Objectives:**
- **Quarterly Objective:** ${getField(data, 'quarterlyObjective')}
- **North Star KPIs:** ${getField(data, 'northStarKpis')}
- **Content Goals:** ${getField(data, 'contentGoals')}
- **Future Vision:** ${getField(data, 'futureVision')}

**Competitive Context:**
- **Key Competitors:** ${getField(data, 'keyCompetitors')}
- **Competitive Advantages:** ${getField(data, 'competitiveAdvantages')}

${buildCompetitorInsightsSection(data._competitorInsights)}

**Distribution Strategy:**
- **Primary Channels:** ${getField(data, 'primaryChannels')}
- **Content Formats:** ${getField(data, 'contentFormats')}
- **Seasonality:** ${getField(data, 'seasonality')}

**Offer & Monetization:**
- **Offer Matrix:** ${getField(data, 'offerMatrix')}
- **Primary Offer Name:** ${getField(data, 'primaryOfferName')}
- **Primary Offer Price:** ${getField(data, 'primaryOfferPrice')}
- **Upsell Offer:** ${getField(data, 'upsellOffer')}
- **Upsell Price:** ${getField(data, 'upsellPrice')}

### STAGE 2: KEYWORD & MARKET INTELLIGENCE

**Strategic Positioning:**
- **Core Strategic Question:** ${getField(data, 'coreStrategicQuestion')}
- **Thesis (Pro Angle):** ${getField(data, 'thesis')}
- **Antithesis (Con Angle):** ${getField(data, 'antithesis')}
- **Key Market Data:** ${getField(data, 'keyMarketData')}
- **Category Definition:** ${getField(data, 'categoryDefinition')}

**Keyword Research:**
- **Primary Keyword:** ${getField(data, 'primaryKeyword')}
- **Secondary Keywords:** ${getField(data, 'secondaryKeywords')}
- **Full Keyword List:** ${getField(data, 'keywordsEntities')}

### STAGE 3: CONTENT ARCHITECTURE

**Content Structure:**
- **Asset Title:** ${getField(data, 'assetTitle')}
- **Foundational Pillars:** ${getField(data, 'foundationalPillars')}
- **Campaign Narrative:** ${getField(data, 'campaignNarrative')}
- **Pillar Context:** ${getField(data, 'pillarContext')}
- **Parent Pillar URL:** ${getField(data, 'parentPillarUrl')}
- **Child Spoke URLs:** ${getField(data, 'childSpokeUrls')}
- **Internal Linking Strategy:** ${getField(data, 'internalLinkingStrategy')}
- **Funnel Stage:** ${getField(data, 'funnelStage')}
- **Content Type:** ${getField(data, 'contentType')}
- **Timeframe Plan:** ${getField(data, 'timeframePlan')}

### STAGE 4: CALENDAR & PUBLISHING

**Publishing Strategy:**
- **Calendar Horizon:** ${getField(data, 'calendarHorizon')}
- **Posts per Week:** ${getField(data, 'postsPerWeek')}
- **Visual Hooks:** ${getField(data, 'visualHooks')}

### STAGE 5: CREDIBILITY & E-E-A-T

**Authority Signals:**
- **Author Bio:** ${getField(data, 'authorBio')}
- **Primary Source 1:** ${getField(data, 'primarySource1')}
- **Primary Source 2:** ${getField(data, 'primarySource2')}
- **Expert Quote 1:** ${getField(data, 'expertQuote1')}
- **Expert Quote 2:** ${getField(data, 'expertQuote2')}
- **Proprietary Data:** ${getField(data, 'proprietaryData')}

**Case Studies & Social Proof:**
- **Case Study 1:** ${getField(data, 'caseStudy1')}
- **Case Study 2:** ${getField(data, 'caseStudy2')}
- **Case Study 3:** ${getField(data, 'caseStudy3')}
- **Trust Anchors:** ${getField(data, 'trustAnchors')}
- **Social Proof:** ${getField(data, 'socialProof')}
- **Testimonial 1:** ${getField(data, 'testimonial1')}
- **Testimonial 2:** ${getField(data, 'testimonial2')}

**Bundle Components:**
- **Lead Magnet:** ${getField(data, 'leadMagnetName')}
- **Bundle 1:** ${getField(data, 'bundle1Name')} (${getField(data, 'bundle1Value')})
- **Bundle 2:** ${getField(data, 'bundle2Name')} (${getField(data, 'bundle2Value')})
- **Bundle 3:** ${getField(data, 'bundle3Name')} (${getField(data, 'bundle3Value')})
- **Bundle 4:** ${getField(data, 'bundle4Name')} (${getField(data, 'bundle4Value')})

**Generation Preferences:**
- **Content Format:** ${getField(data, 'contentFormat')}
- **Subcategory:** ${getField(data, 'contentSubcategory')}
- **Persuasion Framework:** ${getField(data, 'persuasionFramework')}
- **Unique Mechanism:** ${getField(data, 'uniqueMechanism')}
- **Readability:** ${getField(data, 'readabilityDirectives')}
- **Platform Context:** ${getField(data, 'platformContext')}
- **Forbidden Terms:** ${getField(data, 'forbiddenTerms')}
- **AI Persona Context:** ${getField(data, 'aiPersonaContext')}

---

## 🎯 YOUR OUTPUT REQUIREMENTS — ELITE STRATEGIC INTELLIGENCE

You will generate **TWO PARTS** in a single response:

### PART 1: STRATEGIC DATA (JSON)

Return a single, valid JSON object. This powers the dashboard visualizations.

**CRITICAL JSON RULES:**
- Valid JSON syntax (double quotes, no trailing commas)
- ALL numeric scores (1-10) MUST be derived from ACTUAL ANALYSIS, not arbitrary numbers
- Every score requires internal reasoning: "Why is this an 8, not a 6?"
- Use the competitor intelligence data to ground competitive scores
- JTBD scenarios: Minimum 5, each with specific trigger situations
- Content pillars: 3-5 with strategic rationale tied to competitive gaps

**SCORING PHILOSOPHY:**
- 9-10: Exceptional, rare — requires strong evidence from data
- 7-8: Strong, differentiated — must cite specific competitive gap
- 5-6: Average, table stakes — competitors also do this
- 3-4: Weak, improvement needed — competitors outperform here
- 1-2: Critical gap — urgent attention required

\`\`\`json
{
  "dashboardCharts": {
    "customerFrustrationsChart": [
      {
        "label": "Specific frustration from audiencePains",
        "intensity": 1-10,
        "segment": "Audience segment name",
        "shortDescription": "1-2 sentence elaboration",
        "competitorFailure": "How competitors fail to address this"
      }
      // 5-7 items based on audiencePains and coreMarketProblem
    ],
    "hiddenAspirationsChart": [
      {
        "label": "Secret ambition from audienceDesired",
        "intensity": 1-10,
        "segment": "Audience segment",
        "shortDescription": "What they really want"
      }
      // 5-7 items based on audienceDesired and futureVision
    ],
    "mindsetTransformationChart": [
      {
        "fromBelief": "Old limiting belief",
        "toBelief": "New empowering belief",
        "importance": 1-10,
        "segment": "Audience segment"
      }
      // 3-5 transformations that support brand positioning
    ],
    "customerJobPriorityChart": [
      {
        "jobTitle": "Job To Be Done title",
        "urgency": 1-10,
        "importance": 1-10,
        "frequency": 1-10,
        "segment": "Audience segment",
        "outcome": "Specific desired result"
      }
      // 5-7 items from quarterlyObjective and contentGoals
    ],
    "competitiveAdvantageMapChart": [
      {
        "dimension": "Strategic dimension name",
        "yourBrand": 1-10,
        "competitor1": 1-10,
        "competitor2": 1-10,
        "marketAverage": 1-10,
        "explanation": "Why this matters"
      }
      // 5-7 dimensions based on competitiveAdvantages and brandArchetype
    ],
    "contentFormatStrategyChart": [
      {
        "format": "Content format name",
        "fitScore": 1-10,
        "competitiveGap": 1-10,
        "audienceDemand": 1-10,
        "feasibility": 1-10,
        "priority": 1-3,
        "rationale": "Why this format works"
      }
      // 4-6 formats from contentFormats and primaryChannels
    ],
    "brandPositioningChart": [
      {
        "axis": "Positioning spectrum (e.g., Tactical vs Strategic)",
        "position": 1-10,
        "marketPosition": 1-10,
        "note": "What this means"
      }
      // 4-5 axes based on brandIdeology and competitiveAdvantages
    ],
    "valuePropositionMixChart": [
      {
        "proposition": "Micro value prop",
        "appeal": 1-10,
        "differentiation": 1-10,
        "credibility": 1-10,
        "clarity": 1-10,
        "competitorComparison": "How this beats competitor X's positioning"
      }
      // 4-5 props from uvp and existingMessaging
    ],
    "strategicContentPillarsChart": [
      {
        "pillar": "Pillar name",
        "audienceFit": 1-10,
        "competitiveGap": 1-10,
        "businessImpact": 1-10,
        "feasibility": 1-10,
        "priority": 1-3,
        "moatPotential": "How this creates defensible advantage"
      }
      // 3-5 pillars from foundationalPillars or create based on strategy
    ],
    "priorityFocusMatrixChart": [
      {
        "initiative": "Specific initiative",
        "impact": 1-10,
        "effort": 1-10,
        "speed": 1-10,
        "priority": 1-3,
        "timeline": "Days/weeks",
        "whyNow": "Time-sensitive reasoning"
      }
      // 3-5 initiatives based on quarterlyObjective
    ],
    "marketOpportunityAnalysisChart": [
      {
        "opportunity": "Market gap or opportunity",
        "marketSize": 1-10,
        "competitionLevel": 1-10,
        "timingSensitivity": 1-10,
        "fitScore": 1-10,
        "priority": 1-3,
        "whyCompetitorsMiss": "Structural reason competitors ignore this"
      }
      // 3-5 opportunities from coreStrategicQuestion and keyMarketData
    ],
    "blueOceanOpportunitiesChart": [
      {
        "opportunity": "Uncontested market space",
        "eliminate": "Industry factor to eliminate",
        "reduce": "Factor to reduce below standard",
        "raise": "Factor to raise above standard",
        "create": "New factor to create",
        "difficulty": 1-10,
        "potentialImpact": 1-10,
        "timeToCapture": "Weeks/months"
      }
      // 3-5 blue ocean opportunities based on competitor gaps
    ],
    "competitorKillMovesChart": [
      {
        "killMove": "Strategic action name",
        "targetCompetitor": "Competitor most affected",
        "competitorWeakness": "Structural weakness exploited",
        "yourAdvantage": "Why you can execute this",
        "impactLevel": 1-10,
        "executionDifficulty": 1-10,
        "timeframe": "Days/weeks/months",
        "expectedOutcome": "Specific measurable result"
      }
      // 3-5 kill moves from competitor intelligence data
    ],
    "asymmetricAdvantagesChart": [
      {
        "advantage": "Asymmetric opportunity name",
        "yourCost": "Low/Medium/High",
        "competitorCost": "10x higher/Impossible/Structural barrier",
        "category": "Content/Authority/Distribution/Brand/Speed",
        "actionRequired": "Specific next step",
        "moatStrength": 1-10
      }
      // 3-5 asymmetric advantages where you win disproportionately
    ]
  },
  "jtbdScenarios": [
    {
      "id": "JTBD_1",
      "title": "Job title",
      "whenSituation": "Specific trigger situation",
      "helpMeDo": "What they're hiring your solution to do",
      "soICan": "Ultimate desired outcome",
      "segment": "Audience segment",
      "priority": 1-5,
      "painIntensity": 1-10,
      "frequencyPerMonth": 1-30
    }
    // 5 scenarios from audiencePains and quarterlyObjective
  ],
  "contentPillars": [
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "strategicRationale": [
        "Solves: [pain]",
        "Challenges: [belief]",
        "Instills: [new belief]",
        "Fills gap: [competitive gap]"
      ],
      "primaryFormats": ["Format 1", "Format 2"],
      "businessAlignment": "How this drives business goals",
      "audienceSegments": ["Segment 1", "Segment 2"],
      "competitiveDifferentiation": "What makes this unique"
    }
    // 3-5 pillars
  ],
  "competitiveGaps": {
    "topicGap": "Topics competitors miss",
    "angleVoiceGap": "How your voice differs",
    "formatGap": "Formats they don't use",
    "audienceGap": "Audiences they underserve",
    "outcomeGap": "Outcomes they don't deliver"
  },
  "uniqueMechanism": {
    "name": "Your proprietary system/framework",
    "tagline": "One-line description",
    "oneParagraphDefinition": "Detailed explanation",
    "keyPromises": [
      "Promise 1",
      "Promise 2",
      "Promise 3"
    ],
    "visualIdentity": {
      "primaryMetaphor": "Core metaphor",
      "secondaryMetaphor": "Supporting metaphor",
      "colorTheme": "Brand color direction"
    }
  },
  "audienceProfile": {
    "emotionalPains": ["Pain 1", "Pain 2"],
    "hiddenDesires": ["Desire 1", "Desire 2"],
    "limitingBeliefs": ["Belief 1", "Belief 2"],
    "empoweringBeliefs": ["Belief 1", "Belief 2"]
  },
  "strategicIntelligence": {
    "the10xOpportunity": {
      "title": "The ONE thing that 10x competitive position",
      "description": "Detailed explanation",
      "whyNow": "Time-sensitive reasoning",
      "executionPath": "Step-by-step approach"
    },
    "competitorBlindSpots": [
      {
        "blindSpot": "What competitors fail to see",
        "evidence": "Data supporting this",
        "exploitStrategy": "How to capitalize"
      }
    ],
    "marketTimingSignals": [
      {
        "signal": "Market shift indicator",
        "implication": "What this means",
        "actionWindow": "Time-sensitive opportunity"
      }
    ],
    "defensibleMoats": [
      {
        "moatType": "Content/Authority/Distribution/Brand",
        "currentStrength": 1-10,
        "buildingStrategy": "How to strengthen",
        "competitorDifficulty": "Why competitors can't copy"
      }
    ]
  }
}
\`\`\`

### PART 2: ELITE STRATEGIC REPORT (MARKDOWN)

After the JSON, provide a comprehensive strategic intelligence report:

## 🎯 ELITE STRATEGIC INTELLIGENCE REPORT

### Executive Summary: The Strategic Opportunity
[2-3 sentences: What's the biggest opportunity? Why now? What's at stake?]

---

## 📊 SECTION 1: MARKET INTELLIGENCE

### 1.1 Customer Frustrations Deep Dive
[Based on audiencePains + competitor intelligence data]
- List 5-7 frustrations with INTENSITY scores and competitor failure analysis
- Identify the #1 frustration competitors completely ignore

### 1.2 Hidden Aspirations & Unspoken Desires
[Based on audienceDesired and competitor content gaps]
- 5-7 secret ambitions the market serves poorly
- "What they really want but are embarrassed to admit"

### 1.3 Mindset Transformation Required
[FROM: limiting belief → TO: empowering belief]
- 3-5 belief shifts that enable purchase
- Tie each to specific content strategy

---

## 🔥 SECTION 2: COMPETITIVE KILL ZONE ANALYSIS

### 2.1 Competitor Blind Spots
[From competitor intelligence data — what they structurally cannot see]
- List 3-5 blind spots with evidence
- Rate exploitability (High/Medium/Low)

### 2.2 Strategic Kill Moves
[High-impact actions that disproportionately hurt competitors]
- 3-5 kill moves with target competitor, weakness exploited, expected outcome
- Prioritize by impact-to-effort ratio

### 2.3 Asymmetric Advantages
[Where your $1 beats their $10]
- Identify 3-5 asymmetric opportunities
- Explain WHY you can win here and they can't

---

## 🌊 SECTION 3: BLUE OCEAN OPPORTUNITIES

### 3.1 Uncontested Market Space
[From competitor gaps and content analysis]
- 3-5 opportunities in uncontested space
- For each: Eliminate/Reduce/Raise/Create framework

### 3.2 Category of One Positioning
[How to own a category competitors can't claim]
- Specific positioning statement
- Why this is defensible

### 3.3 The 10x Opportunity
[The ONE thing that would 10x competitive position]
- Clear description of the opportunity
- WHY NOW timing analysis
- Execution roadmap

---

## 🏆 SECTION 4: STRATEGIC MOAT CONSTRUCTION

### 4.1 Content Moat Strategy
[Topics to own, depth to achieve, formats to dominate]
- 3-5 content pillars with moat potential analysis

### 4.2 Authority Moat Strategy
[Credibility gaps to exploit from competitor E-E-A-T data]
- Specific authority signals to build
- Competitor authority weaknesses

### 4.3 Distribution Moat Strategy
[Channel advantages from competitor traffic data]
- Channels where you can win
- Competitor distribution blind spots

---

## 📋 SECTION 5: JOBS-TO-BE-DONE INTELLIGENCE

### 5.1 Priority JTBD Scenarios
[5 detailed JTBD scenarios with trigger situations]
- Format: WHEN [situation] → HELP ME [job] → SO I CAN [outcome]
- Include urgency, frequency, and pain intensity scores

### 5.2 Hiring Criteria Analysis
[What causes customers to "hire" a solution]
- Functional, emotional, and social jobs
- Competitor solutions customers currently hire

---

## 🎪 SECTION 6: ACTION PLAN

### 6.1 Priority Focus Matrix (Next 90 Days)
[3-5 highest-impact initiatives]
| Initiative | Impact | Effort | Speed | Why Now | Timeline |
- Prioritized by impact-to-effort ratio

### 6.2 Week 1 Quick Wins
[3 things to do THIS WEEK for immediate momentum]
- Specific, actionable, low-effort/high-signal actions

### 6.3 30-Day Milestone
[What success looks like in 30 days]
- Measurable outcomes
- Key deliverables

---

### ⚡ STRATEGIC IMPERATIVES (Top 5 Actions)
1. [Most critical action with specific outcome]
2. [Second priority with timing]
3. [Third priority with competitive impact]
4. [Fourth priority with moat-building effect]
5. [Fifth priority with audience impact]

---

## ✍️ WRITING GUIDELINES

- **Elite Consulting Quality**: McKinsey-level depth, not generic advice
- **Data-Grounded**: Every insight references specific input data or competitor intelligence
- **Action-Oriented**: "Do X because Y, expect Z result"
- **Competitive Context**: Always position relative to competitor weaknesses
- **Timing Aware**: Include "why now" for time-sensitive opportunities

**QUALITY STANDARDS**:
❌ NEVER: Generic advice like "improve your content" or "focus on SEO"
❌ NEVER: Placeholder scores without reasoning
❌ NEVER: Recommendations that ignore competitor data provided
✅ ALWAYS: Cite specific data points from inputs or competitor intelligence
✅ ALWAYS: Explain WHY each score is what it is
✅ ALWAYS: Connect opportunities to competitor weaknesses
✅ ALWAYS: Include timing/urgency analysis

**EXAMPLES**:
❌ BAD: "Leverage synergistic paradigms to enhance market presence"
✅ GOOD: "Target the ${getField(data, 'targetAudience')} segment's #1 frustration: '${getField(data, 'audiencePains').substring(0, 80)}...' — competitors address this superficially with generic content. Your kill move: Create the definitive resource that solves this completely."

❌ BAD: "Build authority in your niche"
✅ GOOD: "Competitor X has 450 referring domains but weak E-E-A-T signals. Your asymmetric advantage: Leverage ${getField(data, 'authorBio')} credentials + proprietary data to capture authority they can't match."

**NOW GENERATE YOUR ELITE STRATEGIC INTELLIGENCE OUTPUT:**
Start with the JSON block (\`\`\`json...\`\`\`), then the comprehensive markdown report. 
Treat this as a $50,000 consulting engagement — every insight must justify that investment.`;

  return prompt;
}

/**
 * Call Gemini API through PHP Gateway (uses server-side API key)
 * This avoids storing API keys in Apps Script
 */
function callStage1GeminiAPI(prompt, selectedModel) {
  try {
    Logger.log('📡 Calling Gemini API through PHP Gateway...');
    
    // Ensure Gemini 2.5 or Gemini 3 model (latest generations)
    const isValidModel = selectedModel && (selectedModel.startsWith('gemini-2.5') || selectedModel.startsWith('gemini-3'));
    const model = isValidModel ? selectedModel : 'gemini-3-flash-preview';
    Logger.log('🤖 Using model: ' + model);
    
    // Call through gateway (API key is on the server)
    // V10.0: Increased tokens for elite strategic report
    const result = callGeminiAPI(model, prompt, {
      temperature: 0.75,  // Slightly higher for creative strategic thinking
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 32768  // Increased for comprehensive elite report
    });
    
    if (!result || !result.success) {
      throw new Error('Gemini API call failed: ' + (result.error || 'Unknown error'));
    }
    
    // Extract text from response
    const responseText = result.data || result.text || '';
    
    if (!responseText) {
      throw new Error('Gemini API returned empty response');
    }
    
    Logger.log('✅ Gemini response received: ' + responseText.length + ' chars');
    return responseText;
    
  } catch (error) {
    Logger.log('❌ Gemini API Error: ' + error.toString());
    throw error;
  }
}

/**
 * Parse Gemini response into structured JSON
 * Expects response with JSON block + markdown report
 */
function parseStage1Response(fullResponse) {
  try {
    // Extract JSON block from response
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const strategicData = JSON.parse(jsonMatch[1]);
        Logger.log('✅ Successfully parsed strategicData JSON from response');
        return strategicData;
      } catch (jsonError) {
        Logger.log('⚠️ JSON parse error: ' + jsonError.toString());
        Logger.log('JSON content: ' + jsonMatch[1].substring(0, 500));
      }
    }
    
    // Fallback: Try to extract JSON without code fence
    const jsonStart = fullResponse.indexOf('{');
    const jsonEnd = fullResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        const jsonStr = fullResponse.substring(jsonStart, jsonEnd + 1);
        const strategicData = JSON.parse(jsonStr);
        Logger.log('✅ Successfully parsed strategicData JSON (no fence)');
        return strategicData;
      } catch (jsonError) {
        Logger.log('⚠️ Fallback JSON parse failed: ' + jsonError.toString());
      }
    }
    
    // Final fallback: Return minimal structure
    Logger.log('⚠️ Could not extract valid JSON, returning minimal structure');
    return {
      dashboardCharts: {
        customerFrustrationsChart: [],
        hiddenAspirationsChart: [],
        mindsetTransformationChart: [],
        customerJobPriorityChart: [],
        competitiveAdvantageMapChart: [],
        contentFormatStrategyChart: [],
        brandPositioningChart: [],
        valuePropositionMixChart: [],
        strategicContentPillarsChart: [],
        priorityFocusMatrixChart: [],
        marketOpportunityAnalysisChart: []
      },
      jtbdScenarios: [],
      contentPillars: [],
      competitiveGaps: { topicGap: '', angleVoiceGap: '', formatGap: '' },
      uniqueMechanism: { name: 'Authority Engine Blueprint', tagline: '', oneParagraphDefinition: '', keyPromises: [] },
      audienceProfile: { emotionalPains: [], hiddenDesires: [], limitingBeliefs: [], empoweringBeliefs: [] },
      parseError: 'Could not extract valid JSON from response'
    };
    
  } catch (error) {
    Logger.log('❌ Critical parse error: ' + error.toString());
    return {
      dashboardCharts: {
        customerFrustrationsChart: [],
        hiddenAspirationsChart: [],
        mindsetTransformationChart: [],
        customerJobPriorityChart: [],
        competitiveAdvantageMapChart: [],
        contentFormatStrategyChart: [],
        brandPositioningChart: [],
        valuePropositionMixChart: [],
        strategicContentPillarsChart: [],
        priorityFocusMatrixChart: [],
        marketOpportunityAnalysisChart: []
      },
      jtbdScenarios: [],
      contentPillars: [],
      competitiveGaps: { topicGap: '', angleVoiceGap: '', formatGap: '' },
      uniqueMechanism: { name: '', tagline: '', oneParagraphDefinition: '', keyPromises: [] },
      audienceProfile: { emotionalPains: [], hiddenDesires: [], limitingBeliefs: [], empoweringBeliefs: [] },
      criticalError: error.toString()
    };
  }
}

/**
 * Clean the markdown report from Gemini response
 * Removes JSON code blocks, stray tokens, and formatting artifacts
 */
function cleanMarkdownReport(fullResponse) {
  try {
    let cleanedReport = fullResponse;
    
    // Remove JSON code block if present
    cleanedReport = cleanedReport.replace(/```json[\s\S]*?```/g, '');
    
    // Remove standalone JSON objects
    const jsonStart = cleanedReport.indexOf('{');
    const jsonEnd = cleanedReport.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      const beforeJson = cleanedReport.substring(0, jsonStart).trim();
      if (beforeJson.length < 50) {
        cleanedReport = cleanedReport.substring(jsonEnd + 1);
      }
    }
    
    // Remove common artifacts
    cleanedReport = cleanedReport.replace(/\$\d+/g, '');
    cleanedReport = cleanedReport.replace(/\$\$/g, '');
    cleanedReport = cleanedReport.replace(/^---+$/gm, '');
    
    // Clean up excessive whitespace
    cleanedReport = cleanedReport.replace(/\n{4,}/g, '\n\n\n');
    cleanedReport = cleanedReport.trim();
    
    // Ensure report starts with a heading
    if (!cleanedReport.startsWith('#')) {
      cleanedReport = '## 📈 Strategic Insights Dashboard (Narrative View)\n\n' + cleanedReport;
    }
    
    Logger.log('✅ Report cleaned successfully');
    return cleanedReport;
    
  } catch (error) {
    Logger.log('⚠️ Error cleaning report: ' + error.toString());
    return fullResponse;
  }
}

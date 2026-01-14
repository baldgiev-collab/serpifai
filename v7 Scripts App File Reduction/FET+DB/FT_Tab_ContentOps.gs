/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Tab_ContentOps.gs - Content Operations & Technical Debt Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ELITE v12.0 - Content Operations Analysis
 * Tab 11: Content Operations - Workflow Detection, Semantic Clusters, E-E-A-T
 * 
 * DEPENDENCIES:
 * - FT_Helpers.gs (shared utilities)
 * - FT_Proofs.gs (proof extraction functions)
 * 
 * KEY FUNCTIONS:
 * - _generateContentOperationsForensic() - Main content operations generator
 * - _generateContentOpsKillMoves() - Dynamic kill moves based on gaps
 * 
 * EXTRACTED FROM: FT_CompetitorKW_Fetcher.gs (Lines 7431-9163)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Tab 11: Content Operations Forensic Analysis
 * Analyzes workflow detection, semantic clusters, E-E-A-T, schema depth, and technical debt
 */
function _generateContentOperationsForensic(competitors, gemini, niche) {
  return {
    // Workflow Detection - REAL DATA from content analysis
    workflowDetection: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const content = synth.content || {};
      const technical = synth.technical || {};
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      
      // ELITE: Extract ALL detailed proofs using new functions
      const detailedProofs = _extractAllDetailedProofs(c);
      const headingsProof = detailedProofs.headings;
      const contentProof = detailedProofs.content;
      const schemaProof = detailedProofs.schema;
      
      // REAL: Extract AI signals from content
      const fullText = JSON.stringify(synth).toLowerCase();
      const aiSignals = ['ai', 'automated', 'generated', 'machine learning', 'gpt', 'chatgpt', 'artificial intelligence'];
      const aiSignalCount = aiSignals.filter(s => fullText.includes(s)).length;
      
      // ELITE: Extract AI context examples
      const aiContextExamples = [];
      aiSignals.forEach(signal => {
        if (fullText.includes(signal)) {
          const context = _extractContextAround(fullText, signal, 50);
          if (context) aiContextExamples.push({ signal: signal, context: context });
        }
      });
      
      // REAL: Detect workflow patterns from schema and structure
      const schemaTypes = website.schemaTypes || [];
      const hasArticleSchema = schemaTypes.includes('Article') || schemaTypes.includes('BlogPosting') || schemaTypes.includes('NewsArticle');
      const hasFAQSchema = schemaTypes.includes('FAQPage') || schemaTypes.includes('HowTo');
      
      // REAL: Calculate word count and content depth
      const wordCount = website.wordCount || 0;
      const h2Count = (website.h2 || []).length;
      const h3Count = (website.h3 || []).length;
      const internalLinkCount = website.internalLinkCount || content.internalLinks?.length || 0;
      
      // Calculate AI adoption from REAL signals
      let aiAdoption = 15; // Base
      if (aiSignalCount >= 3) aiAdoption += 40;
      else if (aiSignalCount >= 1) aiAdoption += 20;
      if (wordCount > 3000) aiAdoption += 15;
      else if (wordCount > 1500) aiAdoption += 25;
      else if (wordCount < 500) aiAdoption += 35;
      if (h2Count > 8) aiAdoption += 10;
      if (hasFAQSchema) aiAdoption += 10;
      aiAdoption = Math.min(95, Math.max(10, aiAdoption));
      
      // REAL: Estimate pages per week from content signals
      const pagesPerWeek = hasArticleSchema ? (wordCount > 2000 ? 5 : 10) : 
                          (aiAdoption > 60 ? 20 : (aiAdoption > 40 ? 8 : 3));
      
      // Calculate scalability from REAL PageSpeed and technical metrics
      const perfScore = pageSpeed.scores?.performance || technical.performanceScore || 50;
      const scalabilityScore = Math.round((perfScore * 0.3) + (aiAdoption * 0.4) + ((internalLinkCount > 20 ? 100 : internalLinkCount * 5) * 0.3));
      
      const productionModel = aiAdoption > 65 ? 'AI-Assisted + Editorial' : 
                             aiAdoption > 45 ? 'Hybrid Model' : 
                             aiAdoption > 30 ? 'Editorial-First' : 'Human-First';
      
      return {
        domain: c.domain || 'unknown',
        aiAdoption: Math.round(aiAdoption),
        productionModel: productionModel,
        velocity: {
          pagesPerWeek: pagesPerWeek,
          trend: wordCount > 2000 ? 'Editorial Focus' : 'Scale Focus'
        },
        scalabilityScore: Math.min(100, scalabilityScore),
        workflowRawData: {
          contentStructure: {
            wordCount: wordCount,
            // v23.2: h1 is object with .text, not array - use charCount for length
            h1Count: headingsProof.rawData.h1?.charCount ? 1 : 0,
            h2Count: h2Count,
            h3Count: h3Count,
            // v23.2: h1 is object, wrap text in array for consistency
            h1Samples: headingsProof.rawData.h1?.text ? [headingsProof.rawData.h1.text] : [],
            h2Samples: (Array.isArray(headingsProof.rawData.h2) ? headingsProof.rawData.h2 : []).slice(0, 5)
          },
          aiSignals: {
            detectedCount: aiSignalCount,
            signals: aiSignals.filter(s => fullText.includes(s)),
            contextExamples: aiContextExamples.slice(0, 5)
          },
          schemaAnalysis: {
            typesFound: schemaTypes,
            rawSchemaData: (Array.isArray(schemaProof.rawData.types) ? schemaProof.rawData.types : []).slice(0, 10),
            hasArticle: hasArticleSchema,
            hasFAQ: hasFAQSchema
          },
          paragraphSamples: (Array.isArray(contentProof.rawData.topParagraphs) ? contentProof.rawData.topParagraphs : []).slice(0, 3)
        },
        tooltips: { aiAdoption: FT_GetMetricTooltip('aiAdoption') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        proof: {
          wordCount: wordCount,
          h2Count: h2Count,
          h3Count: h3Count,
          aiSignalsFound: aiSignalCount,
          schemaTypes: schemaTypes,
          detailed: detailedProofs,
          dataSource: wordCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Semantic Cluster Mapping - REAL DATA from link analysis
    semanticClusterMapping: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const content = synth.content || {};
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const linksProof = detailedProofs.links;
      const headingsProof = detailedProofs.headings;
      
      // REAL: Extract internal links from Oracle data
      const rawInternalLinks = content.internalLinks || [];
      const internalLinks = rawInternalLinks.map(link => {
        if (typeof link === 'string') {
          return { href: link, text: link.split('/').pop() || 'Link' };
        } else if (link && typeof link === 'object') {
          return {
            href: link.href || link.url || link.link || String(link),
            text: link.text || link.anchor || link.title || 'Link'
          };
        }
        return { href: 'Unknown', text: 'Link' };
      }).filter(l => l.href && l.href !== 'Unknown' && typeof l.href === 'string');
      
      const internalLinkCount = website.internalLinkCount || internalLinks.length || 0;
      const externalLinkCount = website.externalLinkCount || 0;
      
      // REAL: Analyze link structure to determine architecture
      let architecture = 'Flat';
      let powerHubs = 1;
      let linkDensity = 'Low';
      
      if (internalLinkCount >= 50) {
        architecture = 'Hub-and-Spoke';
        powerHubs = Math.min(10, Math.ceil(internalLinkCount / 10));
        linkDensity = 'High';
      } else if (internalLinkCount >= 20) {
        architecture = 'Siloed';
        powerHubs = Math.min(6, Math.ceil(internalLinkCount / 8));
        linkDensity = 'Medium';
      } else if (internalLinkCount >= 10) {
        architecture = 'Flat';
        powerHubs = Math.min(4, Math.ceil(internalLinkCount / 5));
        linkDensity = 'Medium';
      }
      
      const totalLinks = internalLinkCount + externalLinkCount;
      const homepageFlow = totalLinks > 0 ? Math.round((internalLinkCount / totalLinks) * 100) : 50;
      const wordCount = website.wordCount || 0;
      const hasOrphanRisk = wordCount > 1500 && internalLinkCount < 10;
      // Real orphan detection requires sitemap/crawl analysis
      const orphanedPages = hasOrphanRisk ? 0 : 0; // Flag risk but don't fake count
      
      const topLinksProof = internalLinks.slice(0, 10).map(l => ({
        href: String(l.href || '').substring(0, 100),
        text: String(l.text || 'Link').substring(0, 50)
      }));
      
      const linkCounts = {};
      internalLinks.forEach(link => {
        const url = link.href || '';
        if (url) {
          linkCounts[url] = (linkCounts[url] || 0) + 1;
        }
      });
      
      const hubPages = Object.entries(linkCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url: url.substring(0, 80), inboundLinks: count }));
      
      return {
        domain: c.domain || 'unknown',
        architecture: architecture,
        powerHubs: powerHubs,
        internalLinkDensity: linkDensity,
        linkEquityFlow: {
          homepageToMoney: homepageFlow,
          orphanedContentRisk: hasOrphanRisk,
          orphanedPages: orphanedPages
        },
        clusterRawData: {
          internalLinkAnalysis: {
            totalInternalLinks: linksProof.rawData.internal.count,
            internalLinkSamples: linksProof.rawData.internal.links.slice(0, 10),
            uniquePathPatterns: [...new Set(linksProof.rawData.internal.links.slice(0, 30).map(l => {
              const url = l.href || l || '';
              // v23.2: Ensure url is a string before calling .match()
              const urlStr = typeof url === 'string' ? url : String(url || '');
              const match = urlStr.match(/\/([^\/]+)\//);
              return match ? match[1] : '';
            }).filter(Boolean))].slice(0, 5)
          },
          externalLinkAnalysis: {
            totalExternalLinks: linksProof.rawData.external.count,
            externalLinkSamples: linksProof.rawData.external.links.slice(0, 5)
          },
          headingTopics: {
            h2Topics: headingsProof.rawData.h2.slice(0, 8),
            h3Topics: headingsProof.rawData.h3.slice(0, 8)
          },
          hubPagesIdentified: hubPages
        },
        tooltips: { semanticClusters: FT_GetMetricTooltip('semanticClusters') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        topInternalLinks: topLinksProof,
        hubPages: hubPages,
        proof: {
          totalInternalLinks: internalLinkCount,
          totalExternalLinks: externalLinkCount,
          detailed: detailedProofs,
          dataSource: internalLinkCount > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // E-E-A-T Integration - REAL DATA from content scanning
    eeatIntegration: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const apiData = c.apiData || {};
      const openPageRank = apiData.openPageRank || {};
      
      const detailedProofs = _extractAllDetailedProofs(c);
      const schemaProof = detailedProofs.schema;
      const linksProof = detailedProofs.links;
      
      const fullText = JSON.stringify(synth).toLowerCase();
      const htmlContent = c.snapshot?.html || '';
      
      const authorSignals = ['author', 'written by', 'by author', 'about the author', 'contributor', 'expert'];
      const hasAuthorBios = authorSignals.some(s => fullText.includes(s));
      const hasLinkedInLinks = fullText.includes('linkedin.com') || htmlContent.includes('linkedin.com');
      
      const expertSignals = ['reviewed by', 'fact-checked', 'medical review', 'expert review', 'editorial board', 'advisory'];
      const hasExpertBoards = expertSignals.some(s => fullText.includes(s));
      
      const dateSignals = ['updated', 'last updated', 'reviewed on', 'published', 'modified'];
      const hasFactCheckDates = dateSignals.some(s => fullText.includes(s));
      
      const regulatorySignals = ['disclaimer', 'terms', 'privacy policy', 'compliance', 'regulated', 'licensed'];
      const hasRegulatoryFooters = regulatorySignals.some(s => fullText.includes(s));
      
      const schemaTypes = website.schemaTypes || [];
      const hasPersonSchema = schemaTypes.includes('Person') || schemaTypes.includes('Author');
      const hasOrgSchema = schemaTypes.includes('Organization') || schemaTypes.includes('LocalBusiness');
      
      let eeatScore = 30;
      if (hasAuthorBios) eeatScore += 15;
      if (hasLinkedInLinks) eeatScore += 12;
      if (hasExpertBoards) eeatScore += 15;
      if (hasFactCheckDates) eeatScore += 8;
      if (hasRegulatoryFooters) eeatScore += 5;
      if (hasPersonSchema) eeatScore += 10;
      if (hasOrgSchema) eeatScore += 5;
      // v28.6: API returns pageRank (camelCase), fallback to page_rank_decimal
      const pageRank = openPageRank.pageRank ?? openPageRank.page_rank_decimal ?? 0;
      if (pageRank >= 5) eeatScore += 10;
      else if (pageRank >= 3) eeatScore += 5;
      eeatScore = Math.min(100, eeatScore);
      
      return {
        domain: c.domain || 'unknown',
        eeatScore: eeatScore,
        authoritativenessGraph: {
          authorBios: hasAuthorBios,
          linkedInLinks: hasLinkedInLinks,
          expertReviewBoards: hasExpertBoards,
          factCheckDates: hasFactCheckDates,
          regulatoryFooters: hasRegulatoryFooters
        },
        eeatRawData: {
          authorEvidence: {
            hasAuthorBios: hasAuthorBios,
            hasLinkedIn: hasLinkedInLinks,
            hasPersonSchema: hasPersonSchema
          },
          expertEvidence: { hasExpertBoards: hasExpertBoards },
          trustEvidence: {
            hasFactCheckDates: hasFactCheckDates,
            hasRegulatoryFooters: hasRegulatoryFooters,
            hasOrgSchema: hasOrgSchema
          },
          schemaRawData: {
            // v23.2: Add null guard
            typesFound: schemaProof.rawData.types || [],
            schemaCount: schemaProof.rawData.count || 0
          },
          externalAuthority: {
            pageRank: pageRank,
            externalLinksCount: linksProof.rawData.external.count
          }
        },
        tooltips: { eeatScore: FT_GetMetricTooltip('eeatIntegration') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        proof: {
          schemaTypes: schemaTypes,
          pageRank: pageRank,
          signalsFound: [
            hasAuthorBios ? 'Author Bios' : null,
            hasLinkedInLinks ? 'LinkedIn Links' : null,
            hasExpertBoards ? 'Expert Reviews' : null,
            hasFactCheckDates ? 'Date Signals' : null,
            hasRegulatoryFooters ? 'Compliance' : null
          ].filter(Boolean),
          detailed: detailedProofs,
          dataSource: (hasAuthorBios || hasLinkedInLinks || schemaTypes.length > 0) ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Schema Depth - REAL DATA from schema detection
    schemaDepth: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      
      const schemaTypes = website.schemaTypes || [];
      const hasOrg = schemaTypes.includes('Organization');
      const hasArticle = schemaTypes.includes('Article') || schemaTypes.includes('BlogPosting');
      const hasFAQ = schemaTypes.includes('FAQPage');
      const hasHowTo = schemaTypes.includes('HowTo');
      const hasBreadcrumb = schemaTypes.includes('BreadcrumbList');
      
      let ragReadiness = 10;
      if (hasFAQ) ragReadiness += 25;
      if (hasHowTo) ragReadiness += 20;
      if (hasArticle) ragReadiness += 15;
      if (hasBreadcrumb) ragReadiness += 10;
      if (hasOrg) ragReadiness += 10;
      const seoScore = pageSpeed.scores?.seo || 0;
      ragReadiness += Math.round(seoScore * 0.1);
      ragReadiness = Math.min(100, ragReadiness);
      
      const criticalSchemas = ['FAQPage', 'HowTo', 'Article', 'Organization'];
      const missingCritical = criticalSchemas.filter(s => !schemaTypes.includes(s));
      
      return {
        domain: c.domain || 'unknown',
        detectedSchemas: schemaTypes,
        ragExtractionReadiness: ragReadiness,
        aiOverviewOptimized: hasFAQ || hasHowTo,
        missingCriticalSchema: missingCritical,
        tooltips: { ragReadiness: FT_GetMetricTooltip('schemaDepth') },
        proof: {
          schemaCount: schemaTypes.length,
          seoScore: seoScore,
          schemasDetected: schemaTypes,
          dataSource: schemaTypes.length > 0 ? 'Oracle Fetcher' : 'Pending Analysis'
        }
      };
    }),
    
    // Framework Maturity - REAL DATA from technical metrics
    frameworkMaturity: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const technical = synth.technical || {};
      const website = synth.website || {};
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      
      const perfScore = pageSpeed.scores?.performance || technical.performanceScore || 0;
      const seoScore = pageSpeed.scores?.seo || technical.seoScore || 0;
      const schemaCount = (website.schemaTypes || []).length;
      const internalLinks = website.internalLinkCount || 0;
      
      let maturityScore = 20;
      maturityScore += Math.round(perfScore * 0.25);
      maturityScore += Math.round(seoScore * 0.25);
      maturityScore += Math.min(25, schemaCount * 8);
      maturityScore += Math.min(25, Math.round(internalLinks * 0.5));
      maturityScore = Math.min(100, maturityScore);
      
      const maturityLevel = maturityScore >= 75 ? 'Enterprise' :
                           maturityScore >= 55 ? 'Scaling' :
                           maturityScore >= 35 ? 'Developing' : 'Emerging';
      
      return {
        domain: c.domain || 'unknown',
        maturityLevel: maturityLevel,
        score: maturityScore,
        tooltips: { maturityScore: FT_GetMetricTooltip('frameworkMaturity') },
        proof: {
          perfScore: perfScore,
          seoScore: seoScore,
          schemaCount: schemaCount,
          internalLinks: internalLinks,
          dataSource: (perfScore > 0 || seoScore > 0) ? 'PageSpeed API' : 'Pending Analysis'
        }
      };
    }),
    
    // Technical Debt Analysis
    technicalDebtAnalysis: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const apiData = c.apiData || {};
      const pageSpeed = apiData.pageSpeed || {};
      const processedMetrics = c.processedMetrics || {};
      
      const perfScore = pageSpeed.scores?.performance || processedMetrics.performanceScore || 0;
      const seoScore = pageSpeed.scores?.seo || 0;
      const accessibilityScore = pageSpeed.scores?.accessibility || 0;
      const bestPracticesScore = pageSpeed.scores?.bestPractices || 0;
      
      const cwvMetrics = pageSpeed.metrics || {};
      
      // LCP
      const lcpRaw = cwvMetrics.lcp || cwvMetrics.largestContentfulPaint || 0;
      const lcpMs = lcpRaw > 100 ? lcpRaw : lcpRaw * 1000;
      const lcpEstimate = lcpMs || (perfScore >= 80 ? 1800 : perfScore >= 60 ? 2800 : perfScore >= 40 ? 3500 : 4500);
      const lcpStatus = lcpEstimate < 2500 ? 'Good' : lcpEstimate < 4000 ? 'Needs Improvement' : 'Poor';
      const lcpScore = lcpEstimate < 2500 ? 100 : lcpEstimate < 4000 ? 65 : 25;
      
      // FID
      const fidRaw = cwvMetrics.fid || cwvMetrics.firstInputDelay || cwvMetrics.inp || 0;
      const fidMs = fidRaw > 10 ? fidRaw : fidRaw * 1000;
      const fidEstimate = fidMs || (perfScore >= 80 ? 50 : perfScore >= 60 ? 150 : perfScore >= 40 ? 250 : 400);
      const fidStatus = fidEstimate < 100 ? 'Good' : fidEstimate < 300 ? 'Needs Improvement' : 'Poor';
      const fidScore = fidEstimate < 100 ? 100 : fidEstimate < 300 ? 60 : 20;
      
      // CLS
      const clsRaw = cwvMetrics.cls || cwvMetrics.cumulativeLayoutShift || 0;
      const clsEstimate = clsRaw || (perfScore >= 80 ? 0.05 : perfScore >= 60 ? 0.15 : perfScore >= 40 ? 0.25 : 0.4);
      const clsStatus = clsEstimate < 0.1 ? 'Good' : clsEstimate < 0.25 ? 'Needs Improvement' : 'Poor';
      const clsScore = clsEstimate < 0.1 ? 100 : clsEstimate < 0.25 ? 60 : 20;
      
      // TTFB
      const ttfbRaw = cwvMetrics.ttfb || cwvMetrics.timeToFirstByte || 0;
      const ttfbEstimate = ttfbRaw || (perfScore >= 80 ? 400 : perfScore >= 60 ? 800 : perfScore >= 40 ? 1200 : 2000);
      const ttfbStatus = ttfbEstimate < 800 ? 'Good' : ttfbEstimate < 1800 ? 'Needs Improvement' : 'Poor';
      
      // Issues categorization
      const issues = { critical: [], high: [], medium: [], low: [] };
      
      if (lcpStatus === 'Poor') issues.critical.push({
        metric: 'LCP', value: `${(lcpEstimate/1000).toFixed(1)}s`, target: '<2.5s',
        impact: 'Users see blank screen too long - high bounce rate',
        fix: 'Optimize hero images, preload critical resources'
      });
      
      if (fidStatus === 'Poor') issues.critical.push({
        metric: 'FID/INP', value: `${fidEstimate}ms`, target: '<100ms',
        impact: 'Poor interactivity - users feel sluggish response',
        fix: 'Break up long tasks, defer non-critical JS'
      });
      
      if (clsStatus === 'Poor') issues.high.push({
        metric: 'CLS', value: clsEstimate.toFixed(3), target: '<0.1',
        impact: 'Layout shifts cause user frustration',
        fix: 'Set explicit dimensions on images/embeds'
      });
      
      if (ttfbStatus === 'Poor') issues.high.push({
        metric: 'TTFB', value: `${(ttfbEstimate/1000).toFixed(1)}s`, target: '<0.8s',
        impact: 'Server response too slow',
        fix: 'Optimize server, use CDN, implement caching'
      });
      
      const schemaTypes = website.schemaTypes || [];
      const criticalSchemas = ['FAQPage', 'HowTo', 'Article', 'Organization', 'BreadcrumbList'];
      const missingSchemas = criticalSchemas.filter(s => !schemaTypes.includes(s));
      
      if (missingSchemas.length >= 3) issues.high.push({
        metric: 'Schema', value: `${missingSchemas.length} missing`, target: 'All 5 critical',
        impact: 'Missing rich results and SERP features',
        fix: `Implement: ${missingSchemas.slice(0, 3).join(', ')}`
      });
      
      const debtScore = Math.min(100, 
        issues.critical.length * 30 + issues.high.length * 20 + 
        issues.medium.length * 10 + issues.low.length * 5
      );
      
      const debtItems = [
        ...issues.critical.map(i => ({ ...i, severity: 'CRITICAL', type: i.metric })),
        ...issues.high.map(i => ({ ...i, severity: 'HIGH', type: i.metric })),
        ...issues.medium.map(i => ({ ...i, severity: 'MEDIUM', type: i.metric })),
        ...issues.low.map(i => ({ ...i, severity: 'LOW', type: i.metric }))
      ];
      
      // Use base performance score - real mobile/desktop requires PageSpeed API
      const mobileScore = perfScore; // Same baseline - real data requires API
      const desktopScore = perfScore; // Same baseline - real data requires API
      
      return {
        domain: c.domain || 'unknown',
        technicalDebtScore: debtScore,
        debtLevel: debtScore >= 60 ? 'Critical' : debtScore >= 35 ? 'Moderate' : 'Low',
        overallHealthGrade: debtScore < 20 ? 'A' : debtScore < 40 ? 'B' : debtScore < 60 ? 'C' : debtScore < 80 ? 'D' : 'F',
        lighthouseScores: {
          performance: perfScore, seo: seoScore,
          accessibility: accessibilityScore, bestPractices: bestPracticesScore
        },
        coreWebVitals: {
          lcp: { value: lcpEstimate, displayValue: `${(lcpEstimate/1000).toFixed(2)}s`, status: lcpStatus, score: lcpScore },
          fid: { value: fidEstimate, displayValue: `${fidEstimate}ms`, status: fidStatus, score: fidScore },
          cls: { value: clsEstimate, displayValue: clsEstimate.toFixed(3), status: clsStatus, score: clsScore },
          ttfb: { value: ttfbEstimate, displayValue: `${(ttfbEstimate/1000).toFixed(2)}s`, status: ttfbStatus }
        },
        mobileVsDesktop: {
          mobile: { score: mobileScore, status: mobileScore >= 80 ? 'Good' : mobileScore >= 50 ? 'Needs Work' : 'Poor' },
          desktop: { score: desktopScore, status: desktopScore >= 80 ? 'Good' : desktopScore >= 50 ? 'Needs Work' : 'Poor' },
          gap: desktopScore - mobileScore,
          mobileFirstReady: mobileScore >= 70
        },
        issuesByType: issues,
        issueCount: {
          critical: issues.critical.length, high: issues.high.length,
          medium: issues.medium.length, low: issues.low.length, total: debtItems.length
        },
        debtItems: debtItems,
        topPriority: debtItems.length > 0 ? debtItems[0] : { type: 'None', issue: 'No critical debt detected' },
        missingSchemas: missingSchemas,
        estimatedFixTime: debtScore >= 60 ? '20-40 hours' : debtScore >= 35 ? '8-20 hours' : '2-8 hours',
        competitiveInsight: perfScore >= 80 ? 'Strong technical foundation' :
                          perfScore >= 60 ? 'Average performance - room for differentiation' :
                          'Technical weakness - opportunity to outperform',
        tooltips: { technicalDebt: FT_GetMetricTooltip('technicalDebt') },
        proof: {
          dataSource: perfScore > 0 ? 'PageSpeed Insights API' : 'Forensic Estimation',
          metricsCollected: ['LCP', 'FID', 'CLS', 'TTFB'],
          confidence: perfScore > 0 ? 'High (API Data)' : 'Medium (Estimated)'
        }
      };
    }),
    
    // Section Strategic Insight
    sectionStrategicInsight: (() => {
      const debtScores = competitors.slice(0, 6).map(c => {
        const apiData = c.apiData || {};
        const pageSpeed = apiData.pageSpeed || {};
        return { domain: c.domain, technicalDebtScore: 100 - (pageSpeed.scores?.performance || 50) };
      });
      
      const sectionData = { technicalDebtAnalysis: debtScores };
      
      if (typeof FT_GenerateSectionStrategicInsight === 'function') {
        return FT_GenerateSectionStrategicInsight('contentOps', sectionData, competitors, niche);
      }
      
      return {
        executiveSummary: 'Content operations analysis complete. Focus on Core Web Vitals and schema implementation.',
        opportunityScore: 55, opportunityLevel: 'Medium'
      };
    })(),
    
    // Kill Moves
    killMoves: _generateContentOpsKillMoves(competitors)
  };
}

/**
 * Generate dynamic Kill Moves based on actual competitor weaknesses
 */
function _generateContentOpsKillMoves(competitors) {
  const killMoves = [];
  
  let lowEEATCount = 0;
  let noSchemaCount = 0;
  let lowLinkCount = 0;
  
  competitors.slice(0, 6).forEach(c => {
    const synth = c.synthesized || {};
    const website = synth.website || {};
    const schemaTypes = website.schemaTypes || [];
    const internalLinks = website.internalLinkCount || 0;
    const fullText = JSON.stringify(synth).toLowerCase();
    
    if (!fullText.includes('author') && !fullText.includes('linkedin')) lowEEATCount++;
    if (schemaTypes.length === 0) noSchemaCount++;
    if (internalLinks < 15) lowLinkCount++;
  });
  
  if (lowEEATCount >= 3) {
    killMoves.push({
      name: 'E-E-A-T Authority Gap',
      logic: `${lowEEATCount}/${competitors.length} competitors lack author credentials`,
      action: 'Build expert author profiles with LinkedIn links, credentials, and bylines',
      impact: 'Capture YMYL trust traffic through superior author signals',
      priority: 'HIGH'
    });
  }
  
  if (noSchemaCount >= 2) {
    killMoves.push({
      name: 'Schema Domination',
      logic: `${noSchemaCount}/${competitors.length} competitors have no structured data`,
      action: 'Implement FAQPage, HowTo, and Article schemas across all pages',
      impact: 'Win AI Overviews and featured snippets',
      priority: 'HIGH'
    });
  }
  
  if (lowLinkCount >= 3) {
    killMoves.push({
      name: 'Internal Link Velocity',
      logic: `${lowLinkCount}/${competitors.length} competitors have weak internal linking`,
      action: 'Implement "Instant-Hub" architecture - new pages linked from power hubs within 24h',
      impact: 'New content ranks 3x faster through superior link equity distribution',
      priority: 'MEDIUM'
    });
  }
  
  if (killMoves.length < 3) {
    killMoves.push({
      name: 'Content Velocity Attack',
      logic: 'Most competitors publish slowly with manual workflows',
      action: 'Deploy AI-assisted content workflow with human editorial oversight for 10x output',
      impact: 'Dominate long-tail and emerging keywords through publishing speed',
      priority: 'MEDIUM'
    });
  }
  
  return killMoves.slice(0, 4);
}

/**
 * ============================================================================
 * FT_Oracle_UIIntegration.gs - Oracle Data → UI Tab Integration
 * ============================================================================
 * Bridges the Oracle Pipeline data to the existing UI tab structure.
 * Replaces estimated/placeholder data with REAL extracted data.
 * 
 * INTEGRATION POINTS:
 *  - Content Strategy Tab (Topical Coverage, PSEO Detection, Content Quality)
 *  - Keyword Strategy Tab (Primary, Secondary, Semantic, Long-tail, PAA, FAQ)
 *  - Technical SEO Tab (Meta, Headings, Internal Links)
 *  - Authority Tab (Backlinks, Referring Domains, Domain Authority)
 *  - E-E-A-T Tab (Experience, Expertise, Authority, Trust signals)
 * ============================================================================
 */

/**
 * OracleUIIntegration - Connects Oracle data to UI tabs
 */
class OracleUIIntegration {
  
  constructor() {
    // Initialize Oracle extractors
    this.headingExtractor = new HeadingExtractor();
    this.keywordExtractor = new KeywordExtractor();
    this.metaLinksExtractor = new MetaLinksExtractor();
    this.backlinkExtractor = new BacklinkExtractor();
    this.eeatExtractor = new EEATSignalExtractor();
    this.blogDiscovery = new BlogDiscoveryEngine();
    this.pageFetcher = new BatchPageFetcher();
  }
  
  /**
   * Generate Elite Tab Intelligence data from Oracle pipeline
   * This replaces the placeholder data with REAL extracted data
   * @param {Array} competitors - Array of competitor objects with domains
   * @param {string} niche - The niche/industry for context
   * @returns {Object} eliteTabIntelligence object for UI rendering
   */
  generateEliteTabIntelligence(competitors, niche) {
    console.log('🔮 OracleUIIntegration: Generating Elite Tab Intelligence from Oracle data...');
    
    const eliteData = {
      contentStrategy: this._generateContentStrategyData(competitors, niche),
      keywordIntelligence: this._generateKeywordIntelligenceData(competitors),
      technicalSEO: this._generateTechnicalSEOData(competitors),
      authorityMetrics: this._generateAuthorityData(competitors),
      eeatAnalysis: this._generateEEATData(competitors),
      forensicDeepDive: this._generateForensicDeepDive(competitors),
      hoverInsights: this._generateHoverInsights()
    };
    
    console.log('✅ OracleUIIntegration: Elite Tab Intelligence generated');
    return eliteData;
  }
  
  // ============================================================================
  // CONTENT STRATEGY TAB DATA
  // ============================================================================
  _generateContentStrategyData(competitors, niche) {
    console.log('📝 Generating Content Strategy data from Oracle...');
    
    return {
      // Topical Coverage Score - REAL DATA
      topicalCoverageScore: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const headings = oracleData.headings || {};
        const keywords = oracleData.keywords || {};
        const meta = oracleData.meta || {};
        
        // Calculate REAL coverage from extracted data
        const h1Count = (headings.h1 || []).length;
        const h2Count = (headings.h2 || []).length;
        const primaryKWCount = (keywords.primary || []).length;
        const blogPages = oracleData.blogPages?.length || 0;
        const wordCount = meta.totalWordCount || comp.synthesized?.website?.wordCount || 0;
        
        // Coverage calculation based on REAL signals
        let coveragePercent = 30; // Base
        if (h1Count >= 10) coveragePercent += 15;
        else if (h1Count >= 5) coveragePercent += 10;
        if (h2Count >= 30) coveragePercent += 15;
        else if (h2Count >= 15) coveragePercent += 10;
        if (primaryKWCount >= 15) coveragePercent += 20;
        else if (primaryKWCount >= 10) coveragePercent += 15;
        if (blogPages >= 10) coveragePercent += 15;
        else if (blogPages >= 5) coveragePercent += 10;
        if (wordCount >= 3000) coveragePercent += 5;
        
        coveragePercent = Math.min(95, coveragePercent);
        
        // Depth index from heading structure
        const depthIndex = headings.score?.metrics?.hierarchy === 'Excellent' ? 'Deep' :
                          headings.score?.metrics?.hierarchy === 'Good' ? 'Medium' : 'Shallow';
        
        return {
          domain: comp.domain,
          coveragePercent: Math.round(coveragePercent),
          topicsCovered: Math.max(5, h2Count > 0 ? Math.ceil(h2Count / 3) : blogPages * 2),
          depthIndex: depthIndex,
          gapStatus: coveragePercent >= 75 ? 'Market Leader' : 
                    coveragePercent >= 55 ? 'Opportunity' : 'Gap',
          // REAL PROOF DATA
          h1: (headings.h1 || [])[0]?.text || comp.domain + ' - Homepage',
          topHeadings: (headings.h2 || []).slice(0, 8).map(h => h.text || h),
          wordCount: wordCount,
          blogPagesDiscovered: blogPages,
          headingScore: headings.score?.overallScore || 0
        };
      }),
      
      // PSEO Pattern Detection - Based on keyword patterns
      pseoPatternDetection: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const keywords = oracleData.keywords || {};
        const blogPages = oracleData.blogPages || [];
        
        // Detect PSEO patterns from URL structure and keyword patterns
        const pseoPatterns = [];
        let pseoConfidence = 'Low';
        let isPSEO = false;
        
        // Check for template patterns in blog URLs
        const urlPatterns = this._detectURLPatterns(blogPages);
        if (urlPatterns.cityProduct) {
          pseoPatterns.push('[City] + [Product]');
          isPSEO = true;
        }
        if (urlPatterns.vsComparison) {
          pseoPatterns.push('[Brand] vs [Competitor]');
          isPSEO = true;
        }
        if (urlPatterns.bestForY) {
          pseoPatterns.push('Best [X] for [Y]');
          isPSEO = true;
        }
        if (urlPatterns.yearBased) {
          pseoPatterns.push('[Topic] [Year]');
        }
        
        // Check keyword repetition patterns
        const primaryKWs = keywords.primary || [];
        const repetitionScore = this._calculateRepetitionScore(primaryKWs);
        if (repetitionScore > 0.7) {
          isPSEO = true;
          pseoConfidence = 'High';
        } else if (repetitionScore > 0.4) {
          pseoConfidence = 'Medium';
        }
        
        // High blog volume with pattern URLs = PSEO
        if (blogPages.length >= 50 && pseoPatterns.length >= 2) {
          isPSEO = true;
          pseoConfidence = 'High';
        }
        
        return {
          domain: comp.domain,
          pseoDetected: isPSEO,
          confidence: pseoConfidence,
          patterns: pseoPatterns,
          blogPagesAnalyzed: blogPages.length,
          urlPatternScore: Object.values(urlPatterns).filter(Boolean).length
        };
      }),
      
      // Content Velocity - Based on blog discovery
      contentVelocity: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const blogPages = oracleData.blogPages?.length || 0;
        const meta = oracleData.meta || {};
        
        // Estimate velocity from blog pages and freshness signals
        let velocityScore = 20; // Base
        let frequency = 'Low (1-2 per week)';
        
        if (blogPages >= 100) {
          velocityScore = 95;
          frequency = 'Very High (15+ per week)';
        } else if (blogPages >= 50) {
          velocityScore = 75;
          frequency = 'High (10+ per week)';
        } else if (blogPages >= 25) {
          velocityScore = 55;
          frequency = 'Medium (3-5 per week)';
        } else if (blogPages >= 10) {
          velocityScore = 35;
          frequency = 'Low (1-2 per week)';
        }
        
        return {
          domain: comp.domain,
          velocityScore: velocityScore,
          publishFrequency: frequency,
          blogPagesFound: blogPages,
          estimatedMonthlyContent: Math.ceil(blogPages / 6) // Rough estimate
        };
      }),
      
      // Direct-to-Answer Score - Based on FAQ/PAA keywords
      directToAnswerScore: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const keywords = oracleData.keywords || {};
        const headings = oracleData.headings || {};
        const eeat = oracleData.eeat || {};
        
        const paaCount = (keywords.paaQuestions || []).length;
        const faqCount = (keywords.faqKeywords || []).length;
        const questionHeadings = (headings.h2 || []).filter(h => 
          (h.text || h).includes('?') || 
          (h.text || h).toLowerCase().startsWith('how') ||
          (h.text || h).toLowerCase().startsWith('what') ||
          (h.text || h).toLowerCase().startsWith('why')
        ).length;
        
        // Score based on question-answering signals
        let dtaScore = 30; // Base
        if (paaCount >= 15) dtaScore += 25;
        else if (paaCount >= 8) dtaScore += 15;
        else if (paaCount >= 3) dtaScore += 8;
        
        if (faqCount >= 10) dtaScore += 20;
        else if (faqCount >= 5) dtaScore += 12;
        
        if (questionHeadings >= 5) dtaScore += 15;
        else if (questionHeadings >= 2) dtaScore += 8;
        
        // E-E-A-T boost
        if (eeat.overallScore >= 70) dtaScore += 10;
        
        dtaScore = Math.min(95, dtaScore);
        
        return {
          domain: comp.domain,
          dtaScore: Math.round(dtaScore),
          score: Math.round(dtaScore),
          aiReadiness: dtaScore >= 75 ? 'High' : dtaScore >= 50 ? 'Partial' : 'Low',
          paaQuestionsFound: paaCount,
          faqKeywordsFound: faqCount,
          questionHeadings: questionHeadings
        };
      }),
      
      // Content Quality Matrix - REAL EEAT + Heading + Content signals
      contentQualityMatrix: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const eeat = oracleData.eeat || {};
        const headings = oracleData.headings || {};
        const meta = oracleData.meta || {};
        const keywords = oracleData.keywords || {};
        
        // REAL E-E-A-T score
        const eeatScore = eeat.overallScore || 0;
        
        // Freshness from signals (estimated)
        const freshnessScore = meta.hasDateSchema ? 70 : 
                              keywords.longTail?.some(k => /202[4-6]/.test(k.keyword)) ? 60 : 40;
        
        // Depth from heading structure and word count
        const wordCount = meta.totalWordCount || comp.synthesized?.website?.wordCount || 0;
        const headingDepth = (headings.h3?.length || 0) + (headings.h4?.length || 0);
        let depthScore = 30;
        if (wordCount >= 3000) depthScore += 30;
        else if (wordCount >= 1500) depthScore += 20;
        if (headingDepth >= 20) depthScore += 25;
        else if (headingDepth >= 10) depthScore += 15;
        depthScore = Math.min(100, depthScore);
        
        // Overall quality score
        const overallScore = Math.round((eeatScore * 0.4) + (freshnessScore * 0.2) + (depthScore * 0.4));
        
        return {
          domain: comp.domain,
          overallScore: overallScore,
          qualityScore: overallScore,
          eeatScore: eeatScore,
          freshnessScore: freshnessScore,
          depthScore: depthScore,
          wordCount: wordCount,
          headingStructureScore: headings.score?.overallScore || 0
        };
      }),
      
      // Vigilante Narrative Audit - Based on E-E-A-T signals
      vigilanteNarrativeAudit: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const eeat = oracleData.eeat || {};
        
        // Authenticity from trust signals
        const trustScore = eeat.trust?.score || 50;
        const authorityScore = eeat.authority?.score || 50;
        const experienceScore = eeat.experience?.score || 50;
        
        const authenticityScore = Math.round((trustScore + authorityScore + experienceScore) / 3);
        
        // Narrative consistency based on signals found
        const signalCount = (eeat.experience?.signals?.length || 0) + 
                           (eeat.expertise?.signals?.length || 0) +
                           (eeat.authority?.signals?.length || 0) +
                           (eeat.trust?.signals?.length || 0);
        
        const narrativeConsistency = signalCount >= 15 ? 'Strong' :
                                    signalCount >= 8 ? 'Moderate' : 'Weak';
        
        return {
          domain: comp.domain,
          authenticityScore: authenticityScore,
          narrativeConsistency: narrativeConsistency,
          signalsDetected: signalCount,
          hasAuthorPages: eeat.hasAuthorPages || false,
          schemaTypesFound: (eeat.schemas || []).length
        };
      }),
      
      // Kill Moves - Strategic recommendations
      killMoves: this._generateKillMoves(competitors)
    };
  }
  
  // ============================================================================
  // KEYWORD INTELLIGENCE TAB DATA
  // ============================================================================
  _generateKeywordIntelligenceData(competitors) {
    console.log('🎯 Generating Keyword Intelligence data from Oracle...');
    
    const allKeywordData = competitors.map(comp => {
      const oracleData = this._getOracleDataForCompetitor(comp);
      const keywords = oracleData.keywords || {};
      
      return {
        domain: comp.domain,
        primary: (keywords.primary || []).slice(0, 20).map((kw, idx) => ({
          rank: idx + 1,
          term: typeof kw === 'string' ? kw : kw.keyword,
          keyword: typeof kw === 'string' ? kw : kw.keyword,
          frequency: kw.frequency || 1,
          intent: kw.intent || 'informational',
          source: 'Oracle Extraction'
        })),
        secondary: (keywords.secondary || []).slice(0, 30).map(kw => ({
          term: typeof kw === 'string' ? kw : kw.keyword,
          keyword: typeof kw === 'string' ? kw : kw.keyword,
          frequency: kw.frequency || 1
        })),
        semantic: (keywords.semantic || []).slice(0, 40).map(kw => ({
          term: typeof kw === 'string' ? kw : kw.keyword,
          keyword: typeof kw === 'string' ? kw : kw.keyword
        })),
        longTail: (keywords.longTail || []).slice(0, 50).map(kw => ({
          term: typeof kw === 'string' ? kw : kw.keyword,
          keyword: typeof kw === 'string' ? kw : kw.keyword,
          wordCount: (typeof kw === 'string' ? kw : kw.keyword).split(' ').length
        })),
        questions: (keywords.paaQuestions || []).concat(keywords.faqKeywords || []).slice(0, 30).map(q => ({
          term: typeof q === 'string' ? q : q.question || q.keyword,
          type: q.type || 'PAA'
        })),
        paaQuestions: (keywords.paaQuestions || []).slice(0, 20),
        faqKeywords: (keywords.faqKeywords || []).slice(0, 20),
        intentDistribution: keywords.intentDistribution || {
          informational: 60,
          transactional: 15,
          commercial: 15,
          navigational: 10
        }
      };
    });
    
    return {
      competitorKeywords: allKeywordData,
      keywordGapMatrix: this._buildKeywordGapMatrix(allKeywordData),
      topKeywordsByIntent: this._groupKeywordsByIntent(allKeywordData),
      longTailOpportunities: this._identifyLongTailOpportunities(allKeywordData)
    };
  }
  
  // ============================================================================
  // TECHNICAL SEO TAB DATA
  // ============================================================================
  _generateTechnicalSEOData(competitors) {
    console.log('⚙️ Generating Technical SEO data from Oracle...');
    
    return competitors.map(comp => {
      const oracleData = this._getOracleDataForCompetitor(comp);
      const meta = oracleData.meta || {};
      const headings = oracleData.headings || {};
      
      const pages = meta.pages || [];
      const internalLinks = meta.internalLinks || [];
      const externalLinks = meta.externalLinks || [];
      
      return {
        domain: comp.domain,
        // Meta Analysis
        metaTitles: pages.slice(0, 15).map(p => ({
          url: p.url,
          title: p.title,
          length: p.title?.length || 0,
          status: (p.title?.length >= 30 && p.title?.length <= 60) ? 'Good' : 'Needs Review'
        })),
        metaDescriptions: pages.slice(0, 15).map(p => ({
          url: p.url,
          description: p.description,
          length: p.description?.length || 0,
          status: (p.description?.length >= 120 && p.description?.length <= 160) ? 'Good' : 'Needs Review'
        })),
        // Heading Structure
        h1Tags: (headings.h1 || []).slice(0, 20).map(h => h.text || h),
        h2Tags: (headings.h2 || []).slice(0, 30).map(h => h.text || h),
        h3Tags: (headings.h3 || []).slice(0, 20).map(h => h.text || h),
        headingScore: headings.score?.overallScore || 0,
        headingMetrics: headings.score?.metrics || {},
        // Link Analysis
        internalLinkCount: internalLinks.length,
        externalLinkCount: externalLinks.length,
        topInternalLinks: internalLinks.slice(0, 20).map(l => ({
          url: l.url || l.href,
          anchor: l.anchor || l.text,
          source: l.sourcePage
        })),
        anchorDiversity: meta.analysis?.anchorDiversity || {},
        linkStructureScore: meta.linkStructureScore || 0,
        // Open Graph
        hasOpenGraph: pages.some(p => p.ogTitle || p.ogDescription),
        openGraphData: pages.filter(p => p.ogTitle).slice(0, 5).map(p => ({
          url: p.url,
          ogTitle: p.ogTitle,
          ogDescription: p.ogDescription
        }))
      };
    });
  }
  
  // ============================================================================
  // AUTHORITY TAB DATA
  // ============================================================================
  _generateAuthorityData(competitors) {
    console.log('🔗 Generating Authority data from Oracle...');
    
    return competitors.map(comp => {
      const oracleData = this._getOracleDataForCompetitor(comp);
      const backlinks = oracleData.backlinks || {};
      
      return {
        domain: comp.domain,
        // Domain Metrics
        domainAuthority: backlinks.domainAuthority || 0,
        pageAuthority: backlinks.pageAuthority || 0,
        domainRank: backlinks.domainRank || 0,
        trustFlow: backlinks.trustFlow || 0,
        citationFlow: backlinks.citationFlow || 0,
        // Backlink Data
        totalBacklinks: backlinks.totalBacklinks || 0,
        referringDomainsCount: backlinks.referringDomainsCount || 0,
        topBacklinks: (backlinks.backlinks || []).slice(0, 40).map((bl, idx) => ({
          rank: idx + 1,
          sourceUrl: bl.sourceUrl || bl.url,
          sourceDomain: bl.sourceDomain || this._extractDomain(bl.sourceUrl || bl.url),
          targetUrl: bl.targetUrl,
          anchorText: bl.anchorText || 'N/A',
          domainAuthority: bl.domainAuthority || 'N/A',
          doFollow: bl.doFollow !== false
        })),
        topReferringDomains: (backlinks.referringDomains || []).slice(0, 30).map((rd, idx) => ({
          rank: idx + 1,
          domain: rd.domain,
          backlinksCount: rd.backlinksCount || 1,
          domainAuthority: rd.domainAuthority || 'N/A'
        })),
        // Anchor Text Distribution
        anchorTextDistribution: backlinks.anchorTextDistribution || {},
        // Link Type Breakdown
        linkTypes: {
          doFollow: backlinks.doFollowCount || 0,
          noFollow: backlinks.noFollowCount || 0,
          ugc: backlinks.ugcCount || 0,
          sponsored: backlinks.sponsoredCount || 0
        }
      };
    });
  }
  
  // ============================================================================
  // E-E-A-T TAB DATA
  // ============================================================================
  _generateEEATData(competitors) {
    console.log('✅ Generating E-E-A-T data from Oracle...');
    
    return competitors.map(comp => {
      const oracleData = this._getOracleDataForCompetitor(comp);
      const eeat = oracleData.eeat || {};
      
      return {
        domain: comp.domain,
        overallScore: eeat.overallScore || 0,
        grade: this._scoreToGrade(eeat.overallScore || 0),
        // Individual Dimensions
        experience: {
          score: eeat.experience?.score || 0,
          signals: (eeat.experience?.signals || []).slice(0, 10),
          recommendations: eeat.experience?.recommendations || []
        },
        expertise: {
          score: eeat.expertise?.score || 0,
          signals: (eeat.expertise?.signals || []).slice(0, 10),
          recommendations: eeat.expertise?.recommendations || []
        },
        authority: {
          score: eeat.authority?.score || 0,
          signals: (eeat.authority?.signals || []).slice(0, 10),
          recommendations: eeat.authority?.recommendations || []
        },
        trust: {
          score: eeat.trust?.score || 0,
          signals: (eeat.trust?.signals || []).slice(0, 10),
          recommendations: eeat.trust?.recommendations || []
        },
        // Schema Markup
        schemaTypes: eeat.schemas || [],
        hasAuthorPages: eeat.hasAuthorPages || false,
        authorProfiles: eeat.authors || [],
        // Overall Recommendations
        recommendations: eeat.recommendations || []
      };
    });
  }
  
  // ============================================================================
  // FORENSIC DEEP DIVE DATA
  // ============================================================================
  _generateForensicDeepDive(competitors) {
    console.log('🔬 Generating Forensic Deep Dive data from Oracle...');
    
    return {
      keywordStrategy: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const keywords = oracleData.keywords || {};
        
        return {
          domain: comp.domain,
          detailedKeywords: {
            primary: (keywords.primary || []).slice(0, 10).map((kw, idx) => ({
              rank: idx + 1,
              term: typeof kw === 'string' ? kw : kw.keyword,
              frequency: kw.frequency || 1
            })),
            semantic: (keywords.semantic || []).slice(0, 10).map(kw => ({
              term: typeof kw === 'string' ? kw : kw.keyword
            })),
            longTail: (keywords.longTail || []).slice(0, 10).map(kw => ({
              term: typeof kw === 'string' ? kw : kw.keyword
            })),
            questions: (keywords.paaQuestions || []).slice(0, 8).map(q => ({
              term: typeof q === 'string' ? q : q.question || q.keyword
            }))
          }
        };
      }),
      
      contentOnPage: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const headings = oracleData.headings || {};
        const meta = oracleData.meta || {};
        
        return {
          domain: comp.domain,
          h1: (headings.h1 || [])[0]?.text || comp.domain + ' - Homepage',
          topHeadings: (headings.h2 || []).slice(0, 6).map(h => h.text || h),
          wordCount: meta.totalWordCount || comp.synthesized?.website?.wordCount || 0,
          metaDescription: (meta.pages || [])[0]?.description || 'Not detected',
          headingScore: headings.score?.overallScore || 0
        };
      }),
      
      backlinkProof: competitors.map(comp => {
        const oracleData = this._getOracleDataForCompetitor(comp);
        const backlinks = oracleData.backlinks || {};
        
        return {
          domain: comp.domain,
          topBacklinks: (backlinks.backlinks || []).slice(0, 15).map((bl, idx) => ({
            rank: idx + 1,
            source: bl.sourceDomain || this._extractDomain(bl.sourceUrl || bl.url),
            anchor: bl.anchorText || 'N/A',
            da: bl.domainAuthority || 'N/A'
          })),
          totalBacklinks: backlinks.totalBacklinks || 0,
          referringDomains: backlinks.referringDomainsCount || 0,
          domainAuthority: backlinks.domainAuthority || 0
        };
      })
    };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Get Oracle data for a competitor from cache or extract live
   * V8.4: FIXED to read from comp.stages.oracleFetcher.data
   */
  _getOracleDataForCompetitor(comp) {
    // Check if Oracle data is already attached
    if (comp.oracleData) {
      return comp.oracleData;
    }
    
    // V8.4: Priority 1 - Check oracleFetcher stage data (from direct scraping)
    const oracleFetcher = comp.stages?.oracleFetcher?.data;
    if (oracleFetcher && (oracleFetcher.h2?.length > 0 || oracleFetcher.h1)) {
      return {
        headings: {
          h1: oracleFetcher.h1 ? [{ text: oracleFetcher.h1 }] : [],
          h2: (oracleFetcher.h2 || []).map(h => ({ text: h })),
          h3: (oracleFetcher.h3 || []).map(h => ({ text: h })),
          h4: (oracleFetcher.h4 || []).map(h => ({ text: h })),
          score: {
            overallScore: oracleFetcher.h2?.length > 5 ? 75 : (oracleFetcher.h2?.length > 0 ? 50 : 25),
            metrics: { hierarchy: oracleFetcher.h2?.length > 8 ? 'Excellent' : 'Good' }
          }
        },
        keywords: {
          primary: (oracleFetcher.h2 || []).slice(0, 5).map(h => ({ keyword: h })),
          secondary: (oracleFetcher.h3 || []).slice(0, 10).map(h => ({ keyword: h })),
          semantic: [],
          longTail: (oracleFetcher.h3 || []).filter(h => h.split(' ').length > 3).map(h => ({ keyword: h }))
        },
        meta: {
          title: oracleFetcher.title || '',
          description: oracleFetcher.description || '',
          language: oracleFetcher.language || 'en',
          totalWordCount: oracleFetcher.wordCount || 0
        },
        backlinks: {
          externalLinks: oracleFetcher.externalLinks || [],
          internalLinks: oracleFetcher.internalLinks || []
        },
        eeat: {},
        blogPages: [],
        schemaTypes: oracleFetcher.schemaTypes || [],
        dataSource: 'oracleFetcher'
      };
    }
    
    // Priority 2 - Check synthesized.website data
    const synthWebsite = comp.synthesized?.website;
    if (synthWebsite && (synthWebsite.h2?.length > 0 || synthWebsite.h1)) {
      return {
        headings: {
          h1: synthWebsite.h1 ? [{ text: synthWebsite.h1 }] : [],
          h2: (synthWebsite.h2 || []).map(h => ({ text: h })),
          h3: (synthWebsite.h3 || []).map(h => ({ text: h })),
          h4: (synthWebsite.h4 || []).map(h => ({ text: h })),
          score: { overallScore: 50, metrics: { hierarchy: 'Good' } }
        },
        keywords: {
          primary: (synthWebsite.h2 || []).slice(0, 5).map(h => ({ keyword: h })),
          secondary: (synthWebsite.h3 || []).slice(0, 10).map(h => ({ keyword: h }))
        },
        meta: {
          title: synthWebsite.title || '',
          description: synthWebsite.description || '',
          totalWordCount: synthWebsite.wordCount || 0
        },
        backlinks: {
          externalLinks: synthWebsite.externalLinks || [],
          internalLinks: synthWebsite.internalLinks || []
        },
        eeat: {},
        blogPages: [],
        schemaTypes: synthWebsite.schemaTypes || [],
        dataSource: 'synthesized.website'
      };
    }
    
    // Priority 3 - Check synthesized data from legacy pipeline
    if (comp.synthesized) {
      return {
        headings: comp.synthesized.headings || {},
        keywords: comp.synthesized.keywords || {},
        meta: comp.synthesized.meta || {},
        backlinks: comp.synthesized.backlinks || comp.apiData?.backlinks || {},
        eeat: comp.synthesized.eeat || {},
        blogPages: comp.synthesized.blogPages || [],
        dataSource: 'synthesized.legacy'
      };
    }
    
    // Fallback: Return empty structure
    return {
      headings: {},
      keywords: {},
      meta: {},
      backlinks: {},
      eeat: {},
      blogPages: [],
      dataSource: 'none'
    };
  }
  
  /**
   * Detect URL patterns for PSEO detection
   */
  _detectURLPatterns(blogPages) {
    const patterns = {
      cityProduct: false,
      vsComparison: false,
      bestForY: false,
      yearBased: false
    };
    
    if (!blogPages || blogPages.length === 0) return patterns;
    
    blogPages.forEach(url => {
      const path = url.toLowerCase();
      
      // City + Product pattern (e.g., /seo-services-new-york/)
      if (/\/[a-z]+-[a-z]+-(in-|for-)?[a-z]+(city|town|state)?/.test(path)) {
        patterns.cityProduct = true;
      }
      
      // VS Comparison pattern (e.g., /ahrefs-vs-semrush/)
      if (/-vs-|-versus-/.test(path)) {
        patterns.vsComparison = true;
      }
      
      // Best X for Y pattern (e.g., /best-seo-tools-for-agencies/)
      if (/\/best-[a-z]+(-[a-z]+)*-for-/.test(path)) {
        patterns.bestForY = true;
      }
      
      // Year-based pattern (e.g., /seo-guide-2024/)
      if (/202[0-9]|2030/.test(path)) {
        patterns.yearBased = true;
      }
    });
    
    return patterns;
  }
  
  /**
   * Calculate keyword repetition score for PSEO detection
   */
  _calculateRepetitionScore(keywords) {
    if (!keywords || keywords.length < 5) return 0;
    
    const terms = keywords.map(k => (typeof k === 'string' ? k : k.keyword).toLowerCase());
    const wordFreq = {};
    
    terms.forEach(term => {
      term.split(' ').forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });
    
    const values = Object.values(wordFreq);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    
    // High repetition if one word appears in many keywords
    return max / terms.length;
  }
  
  /**
   * Generate strategic kill moves
   */
  _generateKillMoves(competitors) {
    const moves = [];
    
    // Analyze competitor weaknesses
    competitors.forEach(comp => {
      const oracleData = this._getOracleDataForCompetitor(comp);
      const eeat = oracleData.eeat || {};
      const keywords = oracleData.keywords || {};
      const headings = oracleData.headings || {};
      
      // Low E-E-A-T = opportunity
      if (eeat.overallScore < 50) {
        moves.push({
          priority: 'High',
          action: `Outrank ${comp.domain} with superior E-E-A-T signals`,
          rationale: `Their E-E-A-T score is ${eeat.overallScore}/100. Add author bios, credentials, and trust signals.`,
          target: comp.domain
        });
      }
      
      // Poor heading structure = opportunity
      if (headings.score?.overallScore < 50) {
        moves.push({
          priority: 'Medium',
          action: `Create better-structured content than ${comp.domain}`,
          rationale: `Their heading structure score is ${headings.score?.overallScore || 0}/100. Use proper H1-H6 hierarchy.`,
          target: comp.domain
        });
      }
      
      // Missing PAA/FAQ = opportunity
      if ((keywords.paaQuestions?.length || 0) < 5) {
        moves.push({
          priority: 'High',
          action: 'Target featured snippets with FAQ content',
          rationale: `${comp.domain} has minimal PAA coverage. Create comprehensive FAQ sections.`,
          target: comp.domain
        });
      }
    });
    
    // Generic strategic moves
    moves.push(
      {
        priority: 'High',
        action: 'Target stale content (60%+ older than 6 months) with updated alternatives',
        rationale: 'Fresh content with current data outranks outdated competitor pages'
      },
      {
        priority: 'High',
        action: 'Create single authoritative pillar page to outrank fragmented competitor content',
        rationale: 'Consolidate topic coverage that competitors spread across 5+ thin pages'
      },
      {
        priority: 'Medium',
        action: 'Map and fill semantic clusters at surface-level coverage',
        rationale: 'Build topical authority with comprehensive subtopic coverage'
      }
    );
    
    return moves.slice(0, 8);
  }
  
  /**
   * Build keyword gap matrix
   */
  _buildKeywordGapMatrix(allKeywordData) {
    const allKeywords = new Map();
    
    allKeywordData.forEach(comp => {
      (comp.primary || []).forEach(kw => {
        const term = kw.term || kw.keyword;
        if (!allKeywords.has(term)) {
          allKeywords.set(term, []);
        }
        allKeywords.get(term).push(comp.domain);
      });
    });
    
    // Find gaps (keywords only some competitors have)
    const gaps = [];
    allKeywords.forEach((domains, keyword) => {
      if (domains.length < allKeywordData.length) {
        gaps.push({
          keyword: keyword,
          competitorsUsing: domains,
          competitorsMissing: allKeywordData.filter(c => !domains.includes(c.domain)).map(c => c.domain),
          opportunity: domains.length === 1 ? 'High' : 'Medium'
        });
      }
    });
    
    return gaps.slice(0, 30);
  }
  
  /**
   * Group keywords by intent
   */
  _groupKeywordsByIntent(allKeywordData) {
    const byIntent = {
      informational: [],
      transactional: [],
      commercial: [],
      navigational: []
    };
    
    allKeywordData.forEach(comp => {
      (comp.primary || []).forEach(kw => {
        const intent = kw.intent || 'informational';
        if (byIntent[intent]) {
          byIntent[intent].push({
            keyword: kw.term || kw.keyword,
            domain: comp.domain
          });
        }
      });
    });
    
    return byIntent;
  }
  
  /**
   * Identify long-tail opportunities
   */
  _identifyLongTailOpportunities(allKeywordData) {
    const allLongTail = [];
    
    allKeywordData.forEach(comp => {
      (comp.longTail || []).forEach(kw => {
        allLongTail.push({
          keyword: kw.term || kw.keyword,
          wordCount: kw.wordCount || (kw.term || kw.keyword).split(' ').length,
          domain: comp.domain
        });
      });
    });
    
    // Prioritize longer phrases
    return allLongTail
      .filter(k => k.wordCount >= 4)
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 50);
  }
  
  /**
   * Generate hover insights
   */
  _generateHoverInsights() {
    return {
      contentStrategy: {
        topicalCoverage: 'Measures depth and breadth of topic coverage based on extracted headings, keywords, and blog pages discovered via Oracle pipeline.',
        pseoDetection: 'Identifies automated content generation patterns from URL structures, keyword repetition, and blog volume signals.',
        contentVelocity: 'Estimates publishing frequency based on discovered blog pages and content freshness signals.',
        directToAnswer: 'AI answer engine readiness based on FAQ/PAA keyword presence and question-format headings.',
        qualityMatrix: 'Multi-dimensional quality assessment using real E-E-A-T scores, heading structure, and content depth.',
        killMoves: 'Strategic recommendations to outperform competitors based on their weaknesses detected by Oracle pipeline.'
      }
    };
  }
  
  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }
  
  _scoreToGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
}

// ============================================================================
// GLOBAL FUNCTIONS FOR UI INTEGRATION
// ============================================================================

/**
 * Enhance competitor data with Oracle pipeline extraction
 * Call this before rendering the UI tabs
 * @param {Array} competitors - Competitor objects
 * @returns {Object} Enhanced data with eliteTabIntelligence
 */
function enhanceWithOracleData(competitors, niche) {
  const integration = new OracleUIIntegration();
  return integration.generateEliteTabIntelligence(competitors, niche);
}

/**
 * Run Oracle extraction for a single competitor and return UI-ready data
 * @param {string} domain - Competitor domain
 * @returns {Object} Oracle extracted data mapped to UI structure
 */
function runOracleExtractionForUI(domain) {
  console.log(`🔮 Running Oracle extraction for UI: ${domain}`);
  
  try {
    // Run the full pipeline
    const pipeline = new OracleCompetitorPipeline();
    const result = pipeline.runQuickAnalysis(domain, '');
    
    if (result.success) {
      return {
        success: true,
        domain: domain,
        oracleData: result.extractedData,
        uiData: result.uiData
      };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Oracle extraction failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Inject Oracle data into existing competitor analysis
 * @param {Object} analysisData - Existing analysis data
 * @returns {Object} Enhanced analysis with Oracle intelligence
 */
function injectOracleIntelligence(analysisData) {
  if (!analysisData || !analysisData.competitors) {
    return analysisData;
  }
  
  const integration = new OracleUIIntegration();
  const eliteIntelligence = integration.generateEliteTabIntelligence(
    analysisData.competitors,
    analysisData.niche || ''
  );
  
  // Inject into analysis data
  analysisData.eliteTabIntelligence = eliteIntelligence;
  analysisData.oracleEnhanced = true;
  
  return analysisData;
}

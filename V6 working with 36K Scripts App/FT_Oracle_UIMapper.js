/**
 * ============================================================================
 * FT_Oracle_UIMapper.gs - UI Data Mapper for 15 Tabs
 * ============================================================================
 * Maps extracted competitor data and Gemini insights to the UI structure
 * for rendering across 15 elite-level analysis tabs.
 * 
 * TABS:
 *  1. Executive Summary
 *  2. Competitive Scorecard
 *  3. Content Strategy
 *  4. Keyword Intelligence
 *  5. Heading Structure
 *  6. Meta & Technical SEO
 *  7. Internal Linking
 *  8. Backlink Analysis
 *  9. Domain Authority
 * 10. E-E-A-T Analysis
 * 11. Content Gaps
 * 12. Keyword Opportunities
 * 13. Action Plan
 * 14. Raw Data Export
 * 15. Pipeline Status
 * ============================================================================
 */

/**
 * OracleUIMapper - Maps pipeline data to UI tab structure
 */
class OracleUIMapper {
  
  constructor() {
    this.TAB_COUNT = 15;
  }
  
  /**
   * Map all extracted data to 15-tab UI structure
   * @param {Object} extractedData - All extracted competitor data
   * @param {Object} geminiInsights - Gemini API analysis results
   * @param {Object} pipelineStatus - Pipeline execution status
   * @returns {Object} Mapped UI data for all 15 tabs
   */
  mapToUITabs(extractedData, geminiInsights, pipelineStatus) {
    console.log('OracleUIMapper: Mapping data to 15 UI tabs...');
    
    try {
      const uiData = {
        timestamp: new Date().toISOString(),
        competitorDomain: extractedData.domain || 'Unknown',
        userDomain: extractedData.userDomain || '',
        tabs: {
          tab1_executiveSummary: this._mapExecutiveSummary(extractedData, geminiInsights),
          tab2_competitiveScorecard: this._mapCompetitiveScorecard(extractedData, geminiInsights),
          tab3_contentStrategy: this._mapContentStrategy(extractedData, geminiInsights),
          tab4_keywordIntelligence: this._mapKeywordIntelligence(extractedData, geminiInsights),
          tab5_headingStructure: this._mapHeadingStructure(extractedData),
          tab6_metaTechnical: this._mapMetaTechnical(extractedData, geminiInsights),
          tab7_internalLinking: this._mapInternalLinking(extractedData, geminiInsights),
          tab8_backlinkAnalysis: this._mapBacklinkAnalysis(extractedData, geminiInsights),
          tab9_domainAuthority: this._mapDomainAuthority(extractedData),
          tab10_eeatAnalysis: this._mapEEATAnalysis(extractedData, geminiInsights),
          tab11_contentGaps: this._mapContentGaps(geminiInsights),
          tab12_keywordOpportunities: this._mapKeywordOpportunities(geminiInsights),
          tab13_actionPlan: this._mapActionPlan(geminiInsights),
          tab14_rawDataExport: this._mapRawDataExport(extractedData),
          tab15_pipelineStatus: this._mapPipelineStatus(pipelineStatus)
        }
      };
      
      console.log('OracleUIMapper: Successfully mapped all 15 tabs');
      return uiData;
      
    } catch (error) {
      console.error('OracleUIMapper: Mapping error -', error.message);
      return this._getErrorUIData(error.message);
    }
  }
  
  // ============================================================================
  // TAB 1: EXECUTIVE SUMMARY
  // ============================================================================
  _mapExecutiveSummary(data, insights) {
    const summary = insights?.executiveSummary || {};
    
    return {
      tabName: 'Executive Summary',
      tabIcon: '📊',
      sections: {
        overview: {
          title: 'Competitor Overview',
          competitorDomain: data.domain,
          analyzedPages: data.pagesFetched || 0,
          blogPagesFound: data.blogPages?.length || 0,
          analysisDate: new Date().toISOString(),
          overallScore: summary.overallScore || this._calculateOverallScore(data)
        },
        keyFindings: {
          title: 'Key Findings',
          items: summary.keyFindings || this._extractKeyFindings(data)
        },
        strengths: {
          title: 'Competitor Strengths',
          items: summary.strengths || this._extractStrengths(data)
        },
        weaknesses: {
          title: 'Competitor Weaknesses',
          items: summary.weaknesses || this._extractWeaknesses(data)
        },
        quickWins: {
          title: 'Quick Wins for You',
          items: summary.quickWins || []
        },
        competitiveAdvantage: {
          title: 'Your Competitive Advantage',
          description: summary.competitiveAdvantage || 'Analysis pending'
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 2: COMPETITIVE SCORECARD
  // ============================================================================
  _mapCompetitiveScorecard(data, insights) {
    const scorecard = insights?.competitiveScorecard || {};
    
    return {
      tabName: 'Competitive Scorecard',
      tabIcon: '🏆',
      sections: {
        overallRanking: {
          title: 'Overall Competitive Ranking',
          competitorScore: scorecard.competitorScore || this._calculateCompetitorScore(data),
          yourScore: scorecard.yourScore || 0,
          industryAverage: scorecard.industryAverage || 50,
          percentile: scorecard.percentile || 'N/A'
        },
        categoryScores: {
          title: 'Category Breakdown',
          categories: [
            {
              name: 'Content Quality',
              competitorScore: data.headings?.score?.overallScore || 0,
              maxScore: 100,
              icon: '📝'
            },
            {
              name: 'Keyword Strategy',
              competitorScore: this._scoreKeywords(data.keywords),
              maxScore: 100,
              icon: '🎯'
            },
            {
              name: 'Technical SEO',
              competitorScore: data.meta?.linkStructureScore || 0,
              maxScore: 100,
              icon: '⚙️'
            },
            {
              name: 'Backlink Profile',
              competitorScore: this._scoreBacklinks(data.backlinks),
              maxScore: 100,
              icon: '🔗'
            },
            {
              name: 'E-E-A-T Signals',
              competitorScore: data.eeat?.overallScore || 0,
              maxScore: 100,
              icon: '✅'
            },
            {
              name: 'Internal Linking',
              competitorScore: data.meta?.analysis?.anchorDiversity?.diversityScore || 0,
              maxScore: 100,
              icon: '🔀'
            }
          ]
        },
        comparisonMatrix: {
          title: 'Side-by-Side Comparison',
          metrics: scorecard.comparisonMetrics || []
        },
        recommendations: {
          title: 'Priority Actions',
          items: scorecard.priorityActions || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 3: CONTENT STRATEGY
  // ============================================================================
  _mapContentStrategy(data, insights) {
    const contentStrategy = insights?.contentStrategy || {};
    
    return {
      tabName: 'Content Strategy',
      tabIcon: '📝',
      sections: {
        contentOverview: {
          title: 'Content Landscape',
          totalPages: data.pagesFetched || 0,
          blogPosts: data.blogPages?.length || 0,
          averageHeadings: this._calculateAverageHeadings(data.headings),
          contentDepth: contentStrategy.contentDepth || 'Medium'
        },
        topPerformingContent: {
          title: 'Top Performing Blog Posts',
          posts: (data.blogPages || []).slice(0, 10).map((url, idx) => ({
            rank: idx + 1,
            url: url,
            title: this._extractTitleFromUrl(url),
            estimatedTraffic: 'Analysis pending'
          }))
        },
        contentThemes: {
          title: 'Content Themes & Topics',
          themes: contentStrategy.themes || this._extractContentThemes(data)
        },
        contentCalendar: {
          title: 'Recommended Content Calendar',
          suggestions: contentStrategy.calendarSuggestions || []
        },
        contentFormats: {
          title: 'Content Format Analysis',
          formats: contentStrategy.formats || [
            { type: 'Blog Posts', count: data.blogPages?.length || 0 },
            { type: 'Guides/Tutorials', count: 0, note: 'Analysis pending' },
            { type: 'Case Studies', count: 0, note: 'Analysis pending' }
          ]
        },
        gapAnalysis: {
          title: 'Content Gap Opportunities',
          gaps: contentStrategy.gaps || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 4: KEYWORD INTELLIGENCE
  // ============================================================================
  _mapKeywordIntelligence(data, insights) {
    const keywords = data.keywords || {};
    const keywordStrategy = insights?.keywordStrategy || {};
    
    return {
      tabName: 'Keyword Intelligence',
      tabIcon: '🎯',
      sections: {
        primaryKeywords: {
          title: 'Primary Keywords (Top 20)',
          description: 'Main keywords the competitor is targeting',
          keywords: (keywords.primary || []).slice(0, 20).map((kw, idx) => ({
            rank: idx + 1,
            keyword: kw.keyword,
            frequency: kw.frequency,
            intent: kw.intent || 'informational',
            difficulty: 'Medium',
            opportunity: kw.frequency > 5 ? 'High' : 'Medium'
          }))
        },
        secondaryKeywords: {
          title: 'Secondary Keywords',
          description: 'Supporting keywords and variations',
          keywords: (keywords.secondary || []).slice(0, 30)
        },
        semanticKeywords: {
          title: 'Semantic & LSI Keywords',
          description: 'Related terms for topical authority',
          keywords: (keywords.semantic || []).slice(0, 40)
        },
        longTailKeywords: {
          title: 'Long-Tail Keywords',
          description: 'Specific phrases with lower competition',
          keywords: (keywords.longTail || []).slice(0, 50)
        },
        paaQuestions: {
          title: 'People Also Ask (PAA)',
          description: 'Questions to target for featured snippets',
          questions: (keywords.paaQuestions || []).slice(0, 20)
        },
        faqKeywords: {
          title: 'FAQ Keywords',
          description: 'Questions from competitor FAQ sections',
          questions: (keywords.faqKeywords || []).slice(0, 20)
        },
        keywordClusters: {
          title: 'Keyword Clusters',
          description: 'Grouped keywords by topic',
          clusters: keywordStrategy.clusters || this._clusterKeywords(keywords)
        },
        intentDistribution: {
          title: 'Search Intent Distribution',
          distribution: keywords.intentDistribution || {
            informational: 0,
            transactional: 0,
            commercial: 0,
            navigational: 0
          }
        },
        recommendations: {
          title: 'Keyword Strategy Recommendations',
          items: keywordStrategy.recommendations || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 5: HEADING STRUCTURE
  // ============================================================================
  _mapHeadingStructure(data) {
    const headings = data.headings || {};
    
    return {
      tabName: 'Heading Structure',
      tabIcon: '📑',
      sections: {
        h1Analysis: {
          title: 'H1 Headings (Top 30)',
          description: 'Primary page titles used by competitor',
          headings: (headings.h1 || []).slice(0, 30).map((h, idx) => ({
            rank: idx + 1,
            text: h.text,
            source: h.source || 'Homepage',
            charLength: h.text?.length || 0,
            quality: this._rateHeadingQuality(h.text)
          }))
        },
        h2Analysis: {
          title: 'H2 Headings (Section Headers)',
          description: 'Major section divisions',
          headings: (headings.h2 || []).slice(0, 50),
          averagePerPage: this._calculateAveragePerPage(headings.h2, data.pagesFetched)
        },
        h3Analysis: {
          title: 'H3 Headings (Subsections)',
          headings: (headings.h3 || []).slice(0, 40),
          averagePerPage: this._calculateAveragePerPage(headings.h3, data.pagesFetched)
        },
        h4h6Analysis: {
          title: 'H4-H6 Headings (Deep Structure)',
          h4: (headings.h4 || []).slice(0, 20),
          h5: (headings.h5 || []).slice(0, 10),
          h6: (headings.h6 || []).slice(0, 10)
        },
        structureAnalysis: {
          title: 'Heading Structure Analysis',
          hierarchy: headings.score?.metrics?.hierarchy || 'Unknown',
          diversity: headings.score?.metrics?.diversity || 0,
          overallScore: headings.score?.overallScore || 0,
          recommendations: headings.score?.recommendations || []
        },
        commonPatterns: {
          title: 'Common Heading Patterns',
          patterns: this._extractHeadingPatterns(headings)
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 6: META & TECHNICAL SEO
  // ============================================================================
  _mapMetaTechnical(data, insights) {
    const meta = data.meta || {};
    const technicalSEO = insights?.technicalSEO || {};
    
    return {
      tabName: 'Meta & Technical SEO',
      tabIcon: '⚙️',
      sections: {
        metaTitles: {
          title: 'Meta Titles',
          description: 'Page titles used in search results',
          items: (meta.pages || []).slice(0, 20).map(page => ({
            url: page.url,
            title: page.title,
            length: page.title?.length || 0,
            status: (page.title?.length >= 30 && page.title?.length <= 60) ? 'Good' : 'Needs Review'
          }))
        },
        metaDescriptions: {
          title: 'Meta Descriptions',
          description: 'Search result snippets',
          items: (meta.pages || []).slice(0, 20).map(page => ({
            url: page.url,
            description: page.description,
            length: page.description?.length || 0,
            status: (page.description?.length >= 120 && page.description?.length <= 160) ? 'Good' : 'Needs Review'
          }))
        },
        openGraph: {
          title: 'Open Graph Tags',
          description: 'Social media sharing optimization',
          items: (meta.pages || []).filter(p => p.ogTitle || p.ogDescription).slice(0, 10)
        },
        twitterCards: {
          title: 'Twitter Card Tags',
          items: (meta.pages || []).filter(p => p.twitterTitle).slice(0, 10)
        },
        canonicals: {
          title: 'Canonical URLs',
          description: 'URL normalization status',
          items: (meta.pages || []).map(p => ({
            url: p.url,
            canonical: p.canonical,
            status: p.canonical ? 'Set' : 'Missing'
          })).slice(0, 20)
        },
        technicalIssues: {
          title: 'Technical SEO Issues',
          issues: technicalSEO.issues || []
        },
        recommendations: {
          title: 'Technical SEO Recommendations',
          items: technicalSEO.recommendations || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 7: INTERNAL LINKING
  // ============================================================================
  _mapInternalLinking(data, insights) {
    const meta = data.meta || {};
    const linkAnalysis = meta.analysis || {};
    
    return {
      tabName: 'Internal Linking',
      tabIcon: '🔀',
      sections: {
        linkOverview: {
          title: 'Internal Link Overview',
          totalInternalLinks: meta.internalLinks?.length || 0,
          uniqueInternalLinks: this._countUnique(meta.internalLinks, 'url'),
          averagePerPage: this._calculateAveragePerPage(meta.internalLinks, data.pagesFetched),
          linkStructureScore: meta.linkStructureScore || 0
        },
        topLinkedPages: {
          title: 'Most Linked Internal Pages',
          description: 'Pages receiving the most internal links',
          pages: this._getTopLinkedPages(meta.internalLinks, 20)
        },
        anchorTextAnalysis: {
          title: 'Anchor Text Analysis',
          description: 'Link text used for internal linking',
          topAnchors: (linkAnalysis.anchorDiversity?.topAnchors || []).slice(0, 30),
          diversityScore: linkAnalysis.anchorDiversity?.diversityScore || 0,
          totalUniqueAnchors: linkAnalysis.anchorDiversity?.uniqueAnchors || 0
        },
        linkDistribution: {
          title: 'Link Distribution by Page',
          distribution: this._calculateLinkDistribution(meta.internalLinks)
        },
        orphanedContent: {
          title: 'Potential Orphaned Content',
          description: 'Pages with few or no internal links',
          pages: [] // Requires additional analysis
        },
        recommendations: {
          title: 'Internal Linking Recommendations',
          items: insights?.internalLinking?.recommendations || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 8: BACKLINK ANALYSIS
  // ============================================================================
  _mapBacklinkAnalysis(data, insights) {
    const backlinks = data.backlinks || {};
    const backlinkStrategy = insights?.backlinkStrategy || {};
    
    return {
      tabName: 'Backlink Analysis',
      tabIcon: '🔗',
      sections: {
        backlinkOverview: {
          title: 'Backlink Profile Overview',
          totalBacklinks: backlinks.totalBacklinks || 0,
          referringDomains: backlinks.referringDomainsCount || 0,
          domainAuthority: backlinks.domainAuthority || 0,
          pageAuthority: backlinks.pageAuthority || 0,
          trustFlow: backlinks.trustFlow || 0
        },
        topBacklinks: {
          title: 'Top Backlinks (40)',
          description: 'Highest quality backlinks to competitor',
          links: (backlinks.backlinks || []).slice(0, 40).map((link, idx) => ({
            rank: idx + 1,
            sourceUrl: link.sourceUrl || link.url,
            sourceDomain: link.sourceDomain || this._extractDomain(link.sourceUrl || link.url),
            targetUrl: link.targetUrl,
            anchorText: link.anchorText || 'N/A',
            domainAuthority: link.domainAuthority || 'N/A',
            doFollow: link.doFollow !== false,
            firstSeen: link.firstSeen || 'Unknown'
          }))
        },
        referringDomains: {
          title: 'Top Referring Domains (30)',
          description: 'Domains linking to competitor',
          domains: (backlinks.referringDomains || []).slice(0, 30).map((domain, idx) => ({
            rank: idx + 1,
            domain: domain.domain,
            backlinksCount: domain.backlinksCount || 1,
            domainAuthority: domain.domainAuthority || 'N/A',
            industry: domain.industry || 'Unknown'
          }))
        },
        anchorTextDistribution: {
          title: 'Anchor Text Distribution',
          distribution: backlinks.anchorTextDistribution || {}
        },
        linkTypes: {
          title: 'Link Type Breakdown',
          types: {
            doFollow: backlinks.doFollowCount || 0,
            noFollow: backlinks.noFollowCount || 0,
            ugc: backlinks.ugcCount || 0,
            sponsored: backlinks.sponsoredCount || 0
          }
        },
        linkBuilding: {
          title: 'Link Building Opportunities',
          opportunities: backlinkStrategy.opportunities || []
        },
        recommendations: {
          title: 'Backlink Strategy Recommendations',
          items: backlinkStrategy.recommendations || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 9: DOMAIN AUTHORITY
  // ============================================================================
  _mapDomainAuthority(data) {
    const backlinks = data.backlinks || {};
    
    return {
      tabName: 'Domain Authority',
      tabIcon: '📈',
      sections: {
        authorityMetrics: {
          title: 'Authority Metrics',
          metrics: [
            {
              name: 'Domain Authority (DA)',
              value: backlinks.domainAuthority || 0,
              maxValue: 100,
              description: 'Overall domain strength score'
            },
            {
              name: 'Page Authority (PA)',
              value: backlinks.pageAuthority || 0,
              maxValue: 100,
              description: 'Homepage authority score'
            },
            {
              name: 'Domain Rank',
              value: backlinks.domainRank || 0,
              maxValue: 100,
              description: 'OpenPageRank score'
            },
            {
              name: 'Trust Flow',
              value: backlinks.trustFlow || 0,
              maxValue: 100,
              description: 'Quality of linking domains'
            },
            {
              name: 'Citation Flow',
              value: backlinks.citationFlow || 0,
              maxValue: 100,
              description: 'Quantity of links'
            }
          ]
        },
        authorityTrend: {
          title: 'Authority Trend',
          description: 'Historical authority changes',
          trend: 'Data requires historical tracking'
        },
        competitorComparison: {
          title: 'Authority Comparison',
          description: 'How competitor compares to industry',
          position: this._determineAuthorityPosition(backlinks.domainAuthority)
        },
        growthPotential: {
          title: 'Authority Growth Potential',
          currentScore: backlinks.domainAuthority || 0,
          targetScore: Math.min((backlinks.domainAuthority || 0) + 15, 100),
          estimatedTimeframe: '6-12 months',
          requiredActions: [
            'Build high-quality backlinks',
            'Increase referring domain diversity',
            'Improve E-E-A-T signals',
            'Create linkable assets'
          ]
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 10: E-E-A-T ANALYSIS
  // ============================================================================
  _mapEEATAnalysis(data, insights) {
    const eeat = data.eeat || {};
    const eeatStrategy = insights?.eeatStrategy || {};
    
    return {
      tabName: 'E-E-A-T Analysis',
      tabIcon: '✅',
      sections: {
        overallScore: {
          title: 'E-E-A-T Overall Score',
          score: eeat.overallScore || 0,
          maxScore: 100,
          grade: this._scoreToGrade(eeat.overallScore)
        },
        experienceSignals: {
          title: 'Experience Signals',
          score: eeat.experience?.score || 0,
          signals: eeat.experience?.signals || [],
          recommendations: eeat.experience?.recommendations || []
        },
        expertiseSignals: {
          title: 'Expertise Signals',
          score: eeat.expertise?.score || 0,
          signals: eeat.expertise?.signals || [],
          recommendations: eeat.expertise?.recommendations || []
        },
        authoritySignals: {
          title: 'Authoritativeness Signals',
          score: eeat.authority?.score || 0,
          signals: eeat.authority?.signals || [],
          recommendations: eeat.authority?.recommendations || []
        },
        trustSignals: {
          title: 'Trustworthiness Signals',
          score: eeat.trust?.score || 0,
          signals: eeat.trust?.signals || [],
          recommendations: eeat.trust?.recommendations || []
        },
        schemaMarkup: {
          title: 'Schema.org Markup Found',
          schemas: eeat.schemas || []
        },
        authorProfiles: {
          title: 'Author & Expert Profiles',
          profiles: eeat.authors || [],
          hasAuthorPages: eeat.hasAuthorPages || false
        },
        improvements: {
          title: 'E-E-A-T Improvement Plan',
          items: eeatStrategy.improvements || eeat.recommendations || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 11: CONTENT GAPS
  // ============================================================================
  _mapContentGaps(insights) {
    const contentGaps = insights?.contentGaps || {};
    
    return {
      tabName: 'Content Gaps',
      tabIcon: '🔍',
      sections: {
        topicGaps: {
          title: 'Topic Gaps',
          description: 'Topics your competitor covers that you may be missing',
          gaps: contentGaps.topicGaps || []
        },
        keywordGaps: {
          title: 'Keyword Gaps',
          description: 'Keywords competitor ranks for that you could target',
          gaps: contentGaps.keywordGaps || []
        },
        formatGaps: {
          title: 'Content Format Gaps',
          description: 'Content types competitor uses that you could adopt',
          gaps: contentGaps.formatGaps || []
        },
        depthGaps: {
          title: 'Content Depth Gaps',
          description: 'Topics needing more comprehensive coverage',
          gaps: contentGaps.depthGaps || []
        },
        freshnessGaps: {
          title: 'Content Freshness Gaps',
          description: 'Outdated content that needs updating',
          gaps: contentGaps.freshnessGaps || []
        },
        prioritizedOpportunities: {
          title: 'Prioritized Content Opportunities',
          description: 'Ranked by potential impact',
          opportunities: contentGaps.prioritizedOpportunities || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 12: KEYWORD OPPORTUNITIES
  // ============================================================================
  _mapKeywordOpportunities(insights) {
    const keywordOpps = insights?.keywordOpportunities || {};
    
    return {
      tabName: 'Keyword Opportunities',
      tabIcon: '💡',
      sections: {
        quickWins: {
          title: 'Quick Win Keywords',
          description: 'Low competition, high relevance keywords',
          keywords: keywordOpps.quickWins || []
        },
        highValue: {
          title: 'High-Value Keywords',
          description: 'High search volume opportunities',
          keywords: keywordOpps.highValue || []
        },
        longTailOpportunities: {
          title: 'Long-Tail Opportunities',
          description: 'Specific phrases with buyer intent',
          keywords: keywordOpps.longTail || []
        },
        featuredSnippetTargets: {
          title: 'Featured Snippet Targets',
          description: 'Keywords with featured snippet potential',
          keywords: keywordOpps.snippetTargets || []
        },
        localKeywords: {
          title: 'Local Keyword Opportunities',
          keywords: keywordOpps.local || []
        },
        implementationPlan: {
          title: 'Keyword Implementation Plan',
          phases: keywordOpps.implementationPhases || []
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 13: ACTION PLAN
  // ============================================================================
  _mapActionPlan(insights) {
    const actionPlan = insights?.actionPlan || {};
    
    return {
      tabName: 'Action Plan',
      tabIcon: '📋',
      sections: {
        immediate: {
          title: 'Immediate Actions (This Week)',
          priority: 'Critical',
          actions: actionPlan.immediate || []
        },
        shortTerm: {
          title: 'Short-Term Actions (1-4 Weeks)',
          priority: 'High',
          actions: actionPlan.shortTerm || []
        },
        mediumTerm: {
          title: 'Medium-Term Actions (1-3 Months)',
          priority: 'Medium',
          actions: actionPlan.mediumTerm || []
        },
        longTerm: {
          title: 'Long-Term Strategy (3-6 Months)',
          priority: 'Strategic',
          actions: actionPlan.longTerm || []
        },
        resourceRequirements: {
          title: 'Resource Requirements',
          resources: actionPlan.resources || []
        },
        expectedOutcomes: {
          title: 'Expected Outcomes',
          outcomes: actionPlan.expectedOutcomes || []
        },
        kpis: {
          title: 'Key Performance Indicators',
          metrics: actionPlan.kpis || [
            { name: 'Organic Traffic Growth', target: '+25%', timeframe: '3 months' },
            { name: 'Keyword Rankings Improved', target: '+50 positions', timeframe: '6 months' },
            { name: 'Domain Authority', target: '+5 points', timeframe: '6 months' },
            { name: 'Backlinks Acquired', target: '30+ quality links', timeframe: '6 months' }
          ]
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 14: RAW DATA EXPORT
  // ============================================================================
  _mapRawDataExport(data) {
    return {
      tabName: 'Raw Data Export',
      tabIcon: '📁',
      sections: {
        exportFormats: {
          title: 'Available Export Formats',
          formats: ['JSON', 'CSV', 'Google Sheets']
        },
        dataCategories: {
          title: 'Exportable Data Categories',
          categories: [
            {
              name: 'Headings Data',
              recordCount: this._countAllHeadings(data.headings),
              downloadable: true
            },
            {
              name: 'Keywords Data',
              recordCount: this._countAllKeywords(data.keywords),
              downloadable: true
            },
            {
              name: 'Meta & Links Data',
              recordCount: (data.meta?.pages?.length || 0) + (data.meta?.internalLinks?.length || 0),
              downloadable: true
            },
            {
              name: 'Backlinks Data',
              recordCount: data.backlinks?.backlinks?.length || 0,
              downloadable: true
            },
            {
              name: 'E-E-A-T Data',
              recordCount: this._countEEATSignals(data.eeat),
              downloadable: true
            }
          ]
        },
        rawJSON: {
          title: 'Complete Raw Data (JSON)',
          data: {
            domain: data.domain,
            analyzedAt: new Date().toISOString(),
            pagesFetched: data.pagesFetched,
            blogPages: data.blogPages,
            headings: data.headings,
            keywords: data.keywords,
            meta: data.meta,
            backlinks: data.backlinks,
            eeat: data.eeat
          }
        }
      }
    };
  }
  
  // ============================================================================
  // TAB 15: PIPELINE STATUS
  // ============================================================================
  _mapPipelineStatus(pipelineStatus) {
    const status = pipelineStatus || {};
    
    return {
      tabName: 'Pipeline Status',
      tabIcon: '⚡',
      sections: {
        executionSummary: {
          title: 'Execution Summary',
          startTime: status.startTime || 'N/A',
          endTime: status.endTime || 'N/A',
          duration: status.duration || 'N/A',
          status: status.overallStatus || 'Unknown'
        },
        stageStatus: {
          title: 'Pipeline Stages',
          stages: [
            { name: 'Blog Discovery', status: status.blogDiscovery?.status || 'pending', time: status.blogDiscovery?.time },
            { name: 'Page Fetching', status: status.pageFetching?.status || 'pending', time: status.pageFetching?.time },
            { name: 'Heading Extraction', status: status.headingExtraction?.status || 'pending', time: status.headingExtraction?.time },
            { name: 'Keyword Extraction', status: status.keywordExtraction?.status || 'pending', time: status.keywordExtraction?.time },
            { name: 'Meta/Links Extraction', status: status.metaExtraction?.status || 'pending', time: status.metaExtraction?.time },
            { name: 'Backlink Extraction', status: status.backlinkExtraction?.status || 'pending', time: status.backlinkExtraction?.time },
            { name: 'E-E-A-T Extraction', status: status.eeatExtraction?.status || 'pending', time: status.eeatExtraction?.time },
            { name: 'MySQL Persistence', status: status.persistence?.status || 'pending', time: status.persistence?.time },
            { name: 'Gemini Analysis', status: status.geminiAnalysis?.status || 'pending', time: status.geminiAnalysis?.time },
            { name: 'UI Mapping', status: status.uiMapping?.status || 'pending', time: status.uiMapping?.time }
          ]
        },
        errors: {
          title: 'Errors & Warnings',
          items: status.errors || []
        },
        dataQuality: {
          title: 'Data Quality Metrics',
          metrics: {
            completeness: status.dataQuality?.completeness || 0,
            accuracy: status.dataQuality?.accuracy || 0,
            freshness: status.dataQuality?.freshness || 0
          }
        },
        nextRefresh: {
          title: 'Next Scheduled Refresh',
          date: status.nextRefresh || 'Not scheduled',
          refreshInterval: '7 days'
        }
      }
    };
  }
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  _calculateOverallScore(data) {
    let score = 0;
    let factors = 0;
    
    if (data.headings?.score?.overallScore) {
      score += data.headings.score.overallScore;
      factors++;
    }
    if (data.meta?.linkStructureScore) {
      score += data.meta.linkStructureScore;
      factors++;
    }
    if (data.eeat?.overallScore) {
      score += data.eeat.overallScore;
      factors++;
    }
    if (data.backlinks?.domainAuthority) {
      score += data.backlinks.domainAuthority;
      factors++;
    }
    
    return factors > 0 ? Math.round(score / factors) : 50;
  }
  
  _calculateCompetitorScore(data) {
    return this._calculateOverallScore(data);
  }
  
  _scoreKeywords(keywords) {
    if (!keywords) return 0;
    
    let score = 0;
    if (keywords.primary?.length > 10) score += 25;
    if (keywords.secondary?.length > 20) score += 20;
    if (keywords.longTail?.length > 30) score += 20;
    if (keywords.paaQuestions?.length > 5) score += 20;
    if (keywords.faqKeywords?.length > 5) score += 15;
    
    return Math.min(score, 100);
  }
  
  _scoreBacklinks(backlinks) {
    if (!backlinks) return 0;
    
    let score = 0;
    if (backlinks.domainAuthority) score = backlinks.domainAuthority;
    else {
      if (backlinks.totalBacklinks > 100) score += 30;
      else if (backlinks.totalBacklinks > 50) score += 20;
      else if (backlinks.totalBacklinks > 10) score += 10;
      
      if (backlinks.referringDomainsCount > 50) score += 40;
      else if (backlinks.referringDomainsCount > 20) score += 25;
      else if (backlinks.referringDomainsCount > 5) score += 15;
    }
    
    return Math.min(score, 100);
  }
  
  _extractKeyFindings(data) {
    const findings = [];
    
    if (data.blogPages?.length > 10) {
      findings.push(`Active blog with ${data.blogPages.length} posts discovered`);
    }
    if (data.headings?.h1?.length > 15) {
      findings.push(`Strong H1 usage across ${data.headings.h1.length} pages`);
    }
    if (data.keywords?.primary?.length > 15) {
      findings.push(`${data.keywords.primary.length} primary keywords identified`);
    }
    if (data.backlinks?.domainAuthority > 40) {
      findings.push(`Strong domain authority of ${data.backlinks.domainAuthority}`);
    }
    if (data.eeat?.overallScore > 60) {
      findings.push(`Good E-E-A-T signals with score ${data.eeat.overallScore}/100`);
    }
    
    return findings.length > 0 ? findings : ['Analysis in progress...'];
  }
  
  _extractStrengths(data) {
    const strengths = [];
    
    if (data.headings?.score?.overallScore > 70) strengths.push('Excellent heading structure');
    if (data.meta?.linkStructureScore > 70) strengths.push('Strong internal linking');
    if (data.backlinks?.domainAuthority > 50) strengths.push('High domain authority');
    if (data.eeat?.overallScore > 70) strengths.push('Strong E-E-A-T signals');
    if (data.keywords?.longTail?.length > 40) strengths.push('Comprehensive long-tail keyword coverage');
    
    return strengths;
  }
  
  _extractWeaknesses(data) {
    const weaknesses = [];
    
    if (data.headings?.score?.overallScore < 50) weaknesses.push('Poor heading structure');
    if (data.meta?.linkStructureScore < 50) weaknesses.push('Weak internal linking');
    if (data.backlinks?.domainAuthority < 30) weaknesses.push('Low domain authority');
    if (data.eeat?.overallScore < 50) weaknesses.push('Weak E-E-A-T signals');
    if (!data.keywords?.paaQuestions?.length) weaknesses.push('Missing PAA/FAQ optimization');
    
    return weaknesses;
  }
  
  _calculateAverageHeadings(headings) {
    if (!headings) return 0;
    const total = (headings.h1?.length || 0) + (headings.h2?.length || 0) + (headings.h3?.length || 0);
    return total;
  }
  
  _extractTitleFromUrl(url) {
    try {
      const path = new URL(url).pathname;
      const slug = path.split('/').filter(Boolean).pop() || 'homepage';
      return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } catch (e) {
      return 'Unknown';
    }
  }
  
  _extractContentThemes(data) {
    const themes = [];
    const h1Texts = (data.headings?.h1 || []).map(h => h.text?.toLowerCase() || '');
    
    // Basic theme extraction from headings
    const words = h1Texts.join(' ').split(/\s+/);
    const wordFreq = {};
    words.forEach(w => {
      if (w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    
    Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word, count]) => {
        themes.push({ theme: word, frequency: count });
      });
    
    return themes;
  }
  
  _clusterKeywords(keywords) {
    // Simple clustering by first word
    const clusters = {};
    
    [...(keywords.primary || []), ...(keywords.secondary || [])].forEach(kw => {
      const keyword = typeof kw === 'string' ? kw : kw.keyword;
      const firstWord = keyword?.split(' ')[0]?.toLowerCase();
      if (firstWord && firstWord.length > 3) {
        if (!clusters[firstWord]) clusters[firstWord] = [];
        clusters[firstWord].push(keyword);
      }
    });
    
    return Object.entries(clusters)
      .map(([topic, kws]) => ({ topic, keywords: kws.slice(0, 10) }))
      .slice(0, 10);
  }
  
  _rateHeadingQuality(text) {
    if (!text) return 'Poor';
    const len = text.length;
    if (len < 10) return 'Too Short';
    if (len > 70) return 'Too Long';
    if (len >= 30 && len <= 60) return 'Excellent';
    return 'Good';
  }
  
  _calculateAveragePerPage(items, pageCount) {
    if (!items || !pageCount || pageCount === 0) return 0;
    return Math.round((items.length / pageCount) * 10) / 10;
  }
  
  _extractHeadingPatterns(headings) {
    const patterns = [];
    
    const h1Patterns = (headings.h1 || []).slice(0, 20).map(h => {
      if (h.text?.toLowerCase().includes('how to')) return 'How-To Guide';
      if (h.text?.toLowerCase().includes('what is')) return 'Definition';
      if (h.text?.toLowerCase().includes('best')) return 'Listicle';
      if (h.text?.toLowerCase().includes('guide')) return 'Comprehensive Guide';
      if (/\d+/.test(h.text)) return 'Numbered List';
      return 'Standard';
    });
    
    const patternCounts = {};
    h1Patterns.forEach(p => patternCounts[p] = (patternCounts[p] || 0) + 1);
    
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      patterns.push({ pattern, count, percentage: Math.round((count / h1Patterns.length) * 100) });
    });
    
    return patterns.sort((a, b) => b.count - a.count);
  }
  
  _countUnique(items, field) {
    if (!items) return 0;
    const unique = new Set(items.map(item => item[field]));
    return unique.size;
  }
  
  _getTopLinkedPages(links, limit) {
    if (!links) return [];
    
    const pageCounts = {};
    links.forEach(link => {
      const url = link.url || link.href;
      if (url) pageCounts[url] = (pageCounts[url] || 0) + 1;
    });
    
    return Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([url, count], idx) => ({ rank: idx + 1, url, inboundLinks: count }));
  }
  
  _calculateLinkDistribution(links) {
    if (!links) return [];
    
    const distribution = {};
    links.forEach(link => {
      const source = link.sourcePage || 'homepage';
      distribution[source] = (distribution[source] || 0) + 1;
    });
    
    return Object.entries(distribution)
      .map(([page, count]) => ({ page, links: count }))
      .sort((a, b) => b.links - a.links)
      .slice(0, 10);
  }
  
  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }
  
  _determineAuthorityPosition(da) {
    if (da >= 70) return { label: 'Industry Leader', percentile: 'Top 5%' };
    if (da >= 50) return { label: 'Established Player', percentile: 'Top 20%' };
    if (da >= 30) return { label: 'Growing Brand', percentile: 'Top 40%' };
    if (da >= 15) return { label: 'Emerging Site', percentile: 'Top 60%' };
    return { label: 'New/Small Site', percentile: 'Bottom 40%' };
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
  
  _countAllHeadings(headings) {
    if (!headings) return 0;
    return (headings.h1?.length || 0) + (headings.h2?.length || 0) + 
           (headings.h3?.length || 0) + (headings.h4?.length || 0) +
           (headings.h5?.length || 0) + (headings.h6?.length || 0);
  }
  
  _countAllKeywords(keywords) {
    if (!keywords) return 0;
    return (keywords.primary?.length || 0) + (keywords.secondary?.length || 0) +
           (keywords.semantic?.length || 0) + (keywords.longTail?.length || 0) +
           (keywords.paaQuestions?.length || 0) + (keywords.faqKeywords?.length || 0);
  }
  
  _countEEATSignals(eeat) {
    if (!eeat) return 0;
    return (eeat.experience?.signals?.length || 0) + (eeat.expertise?.signals?.length || 0) +
           (eeat.authority?.signals?.length || 0) + (eeat.trust?.signals?.length || 0);
  }
  
  _getErrorUIData(errorMessage) {
    return {
      timestamp: new Date().toISOString(),
      error: true,
      errorMessage: errorMessage,
      tabs: {
        tab1_executiveSummary: { tabName: 'Executive Summary', error: errorMessage },
        tab15_pipelineStatus: { 
          tabName: 'Pipeline Status',
          sections: {
            errors: { title: 'Errors', items: [errorMessage] }
          }
        }
      }
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert UI data to format suitable for spreadsheet rendering
 * @param {Object} uiData - Mapped UI data
 * @returns {Object} Spreadsheet-ready data
 */
function convertToSpreadsheetFormat(uiData) {
  const spreadsheetData = {};
  
  Object.entries(uiData.tabs).forEach(([tabKey, tabData]) => {
    const sheetName = tabData.tabName || tabKey;
    const rows = [];
    
    // Add header row
    rows.push([`${tabData.tabIcon || ''} ${sheetName}`, '', '', '', '']);
    rows.push(['---', '---', '---', '---', '---']);
    
    // Convert sections to rows
    if (tabData.sections) {
      Object.entries(tabData.sections).forEach(([sectionKey, section]) => {
        rows.push([section.title || sectionKey, '', '', '', '']);
        
        // Handle arrays
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item, idx) => {
            if (typeof item === 'string') {
              rows.push(['', `${idx + 1}. ${item}`, '', '', '']);
            } else if (typeof item === 'object') {
              rows.push(['', JSON.stringify(item), '', '', '']);
            }
          });
        }
        
        // Handle keywords
        if (section.keywords && Array.isArray(section.keywords)) {
          section.keywords.forEach((kw, idx) => {
            const keyword = typeof kw === 'string' ? kw : kw.keyword;
            rows.push(['', `${idx + 1}. ${keyword}`, kw.frequency || '', kw.intent || '', '']);
          });
        }
        
        // Handle headings
        if (section.headings && Array.isArray(section.headings)) {
          section.headings.forEach((h, idx) => {
            const text = typeof h === 'string' ? h : h.text;
            rows.push(['', `${idx + 1}. ${text}`, '', '', '']);
          });
        }
        
        rows.push(['', '', '', '', '']);
      });
    }
    
    spreadsheetData[sheetName] = rows;
  });
  
  return spreadsheetData;
}

/**
 * Convert UI data to JSON string for API response
 * @param {Object} uiData - Mapped UI data
 * @returns {string} JSON string
 */
function convertToJSONResponse(uiData) {
  return JSON.stringify(uiData, null, 2);
}

// ============================================================================
// GLOBAL ACCESSOR
// ============================================================================

/**
 * Get an instance of OracleUIMapper
 * @returns {OracleUIMapper}
 */
function getOracleUIMapper() {
  return new OracleUIMapper();
}

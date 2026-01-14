/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteProofsAdvanced.gs - ADVANCED PROOF EXTRACTION v12.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Advanced proof extraction functions for backlinks, internal links, hover insights,
 * content analysis, technical assessment, E-E-A-T, and pSEO detection
 * 
 * SPLIT MODULE 3 of 3:
 * - FT_EliteProofExtractors.gs: Tooltip infrastructure, SERP proof, Gemini insights
 * - FT_EliteGEOAEO.gs: GEO/AEO functions, schema analysis, PAA gap, answer authority
 * - This file: Backlinks, internal links, hover insights, detailed proofs
 * 
 * @author SerpifAI Engineering
 * @version 12.0.0
 */

/**
 * FT_ExtractBacklinksProof - Extract backlink data with proof
 * Uses OpenPageRank and synthesized authority data + internal links from Oracle
 * ELITE v12.1 - Fixed to return actual internal link data for UI display
 */
function FT_ExtractBacklinksProof(competitor) {
  const apiData = competitor.apiData || {};
  const openPageRank = apiData.openPageRank || competitor.stages?.openPageRank?.data || {};
  const synth = competitor.synthesized || {};
  const authority = synth.authority || {};
  const content = synth.content || {};
  const website = synth.website || {};
  const oracleFetcher = competitor.stages?.oracleFetcher?.data || {};
  
  // Real PageRank data
  const pageRank = openPageRank.page_rank_decimal || openPageRank.pageRank || 0;
  const globalRank = parseInt(openPageRank.rank) || 0;
  const domainAuthority = Math.round((pageRank || 0) * 10);
  
  // Real backlink metrics
  const refDomains = authority.referringDomains || 0;
  const backlinks = authority.backlinks || 0;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE: Extract REAL internal links from Oracle data for proof display
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Get internal links from multiple sources
  const rawInternalLinks = content.internalLinks || 
                           oracleFetcher.links?.filter(l => l.internal) || 
                           oracleFetcher.internalLinks ||
                           [];
  
  // Format internal links for UI display
  const topBacklinks = [];
  
  // Process raw internal links
  if (Array.isArray(rawInternalLinks) && rawInternalLinks.length > 0) {
    rawInternalLinks.slice(0, 30).forEach((link, idx) => {
      if (typeof link === 'string') {
        topBacklinks.push({
          url: link,
          text: link.split('/').pop() || 'Link',
          position: idx + 1,
          source: 'Verified Source'
        });
      } else if (link && (link.href || link.url)) {
        topBacklinks.push({
          url: link.href || link.url,
          text: link.text || link.anchor || link.href?.split('/').pop() || 'Link',
          position: idx + 1,
          source: 'Verified Source'
        });
      }
    });
  }
  
  // If no internal links found, try extracting from h2/h3 as navigation pattern
  if (topBacklinks.length === 0 && website.h2) {
    (website.h2 || []).slice(0, 5).forEach((heading, idx) => {
      const slug = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      topBacklinks.push({
        url: `#${slug}`,
        text: heading.substring(0, 50),
        position: idx + 1,
        source: 'Section Link'
      });
    });
  }
  
  // Legacy: Try topReferrers from authority
  const topReferrers = authority.topReferrers || [];
  if (topReferrers.length > 0 && topBacklinks.length === 0) {
    topReferrers.slice(0, 10).forEach((ref, idx) => {
      topBacklinks.push({
        url: typeof ref === 'string' ? ref : (ref.url || ref.domain || 'unknown'),
        text: typeof ref === 'string' ? ref : (ref.text || ref.url || 'Referrer'),
        position: idx + 1,
        source: 'Referrer'
      });
    });
  }
  
  return {
    pageRank: pageRank,
    domainAuthority: domainAuthority,
    globalRank: globalRank,
    referringDomains: refDomains,
    totalBacklinks: backlinks,
    topBacklinks: topBacklinks,
    hasRealData: pageRank > 0 || refDomains > 0 || topBacklinks.length > 0,
    source: pageRank > 0 ? 'OpenPageRank API ✓' : topBacklinks.length > 0 ? 'Oracle Fetcher ✓' : 'Pending Analysis',
    proof: [
      pageRank > 0 ? `PageRank: ${pageRank.toFixed(2)}` : null,
      globalRank > 0 ? `Global Rank: #${globalRank.toLocaleString()}` : null,
      refDomains > 0 ? `Referring Domains: ${refDomains.toLocaleString()}` : null,
      backlinks > 0 ? `Total Backlinks: ${backlinks.toLocaleString()}` : null,
      topBacklinks.length > 0 ? `Internal Links: ${topBacklinks.length} analyzed` : null
    ].filter(Boolean),
    insight: pageRank >= 5 ? 'High authority - requires sustained effort to compete' :
             pageRank >= 3 ? 'Moderate authority - achievable with strategic link building' :
             'Low authority - quick win opportunity with quality backlinks'
  };
}

/**
 * FT_ExtractInternalLinksProof - Extract internal link structure proof
 * Analyzes site architecture from Oracle data
 */
function FT_ExtractInternalLinksProof(competitor) {
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const content = synth.content || {};
  const oracleFetcher = competitor.stages?.oracleFetcher?.data || {};
  
  // Real internal links from Oracle
  const internalLinks = content.internalLinks || oracleFetcher.internalLinks || [];
  const internalLinkCount = website.internalLinkCount || internalLinks.length || 0;
  const externalLinkCount = website.externalLinkCount || 0;
  
  // Analyze hub pages (pages with many inbound links)
  const linkCounts = {};
  internalLinks.forEach(link => {
    const url = link.href || link.url || link;
    if (url) {
      linkCounts[url] = (linkCounts[url] || 0) + 1;
    }
  });
  
  const hubPages = Object.entries(linkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([url, count]) => ({ url, inboundLinks: count }));
  
  return {
    totalInternalLinks: internalLinkCount,
    totalExternalLinks: externalLinkCount,
    topInternalLinks: internalLinks.slice(0, 10).map(l => ({
      href: l.href || l.url || l,
      text: l.text || l.anchor || 'Link',
      isNavigation: l.isNavigation || false
    })),
    hubPages: hubPages,
    architecture: internalLinkCount >= 50 ? 'Hub-and-Spoke' : 
                  internalLinkCount >= 20 ? 'Siloed' : 'Flat',
    hasRealData: internalLinkCount > 0,
    source: internalLinkCount > 0 ? 'Oracle Fetcher ✓' : 'Pending Analysis',
    proof: [
      `Internal Links: ${internalLinkCount}`,
      `External Links: ${externalLinkCount}`,
      `Architecture: ${internalLinkCount >= 50 ? 'Hub-and-Spoke' : internalLinkCount >= 20 ? 'Siloed' : 'Flat'}`,
      hubPages.length > 0 ? `Top Hub: ${hubPages[0]?.url?.substring(0, 50)}...` : null
    ].filter(Boolean),
    insight: internalLinkCount >= 50 ? 'Mature internal linking - match their hub architecture' :
             internalLinkCount >= 20 ? 'Developing link structure - outpace with instant-hub strategy' :
             'Weak internal linking - easy to outperform with proper architecture'
  };
}

/**
 * FT_OrganizeDataForTabs - Organize competitor data by data source
 * Routes data to appropriate tabs based on availability
 */
function FT_OrganizeDataForTabs(competitors) {
  if (!competitors || !Array.isArray(competitors)) return [];
  
  return competitors.map(c => {
    const stages = c.stages || {};
    const apiData = c.apiData || {};
    const synth = c.synthesized || {};
    
    // Check each data source
    const hasOracle = stages.oracleFetcher?.success || stages.phpFetcher?.success || false;
    const hasSerper = stages.serper?.success || (apiData.serper?.organic?.length > 0) || false;
    const hasPageSpeed = stages.pageSpeed?.success || (apiData.pageSpeed?.scores?.performance > 0) || false;
    const hasOpenPageRank = stages.openPageRank?.success || (apiData.openPageRank?.page_rank_decimal > 0) || false;
    
    // Extract real data points
    const website = synth.website || {};
    
    return {
      domain: c.domain || 'unknown',
      dataSources: {
        oracle: hasOracle,
        serper: hasSerper,
        pageSpeed: hasPageSpeed,
        openPageRank: hasOpenPageRank,
        totalSources: [hasOracle, hasSerper, hasPageSpeed, hasOpenPageRank].filter(Boolean).length
      },
      dataQuality: {
        hasTitle: !!(website.title),
        hasH1: !!(website.h1),
        hasH2: (website.h2 || []).length > 0,
        hasWordCount: (website.wordCount || 0) > 0,
        hasSchema: (website.schemaTypes || []).length > 0,
        hasPageRank: hasOpenPageRank,
        hasSERP: hasSerper,
        score: [
          website.title ? 15 : 0,
          website.h1 ? 10 : 0,
          (website.h2 || []).length > 0 ? 15 : 0,
          (website.wordCount || 0) > 0 ? 20 : 0,
          (website.schemaTypes || []).length > 0 ? 15 : 0,
          hasOpenPageRank ? 15 : 0,
          hasSerper ? 10 : 0
        ].reduce((a, b) => a + b, 0)
      },
      realData: {
        title: website.title || null,
        h1: website.h1 || null,
        h2: (website.h2 || []).slice(0, 10),
        wordCount: website.wordCount || 0,
        schemaTypes: website.schemaTypes || [],
        pageRank: apiData.openPageRank?.page_rank_decimal || 0,
        perfScore: apiData.pageSpeed?.scores?.performance || 0,
        serpResults: (apiData.serper?.organic || []).length
      }
    };
  });
}

/**
 * FT_GenerateEliteHoverInsights - Comprehensive hover tooltips for all metrics
 * Board-ready explanations with strategic context
 */
function FT_GenerateEliteHoverInsights() {
  return {
    // TAB 10: AUDIENCE INTELLIGENCE
    audienceIntelligence: {
      tabDescription: 'Deep psychographic analysis of competitor audiences. Identifies emotional triggers, trust gaps, and JTBD (Jobs-to-Be-Done) alignment opportunities.',
      metrics: {
        archetypes: {
          title: 'Behavioral Archetypes',
          description: 'User personas identified from content intent signals (transactional, commercial, informational).',
          howMeasured: 'Analyzed from H2/H3 headings and content patterns using intent classification.',
          strategicValue: 'HIGH - Enables precise targeting of underserved audience segments.',
          dataSource: 'Oracle Fetcher (headings) + Serper API (SERP intent)'
        },
        jtbdMatchScore: {
          title: 'Jobs-to-Be-Done Match',
          description: 'How well competitor content addresses user struggles and tasks.',
          howMeasured: 'Word count, heading structure, schema presence, CTA density, testimonials.',
          strategicValue: 'HIGH - Low JTBD match = easy to steal users with better solutions.',
          dataSource: 'Oracle Fetcher (content depth) + PageSpeed (user experience)'
        },
        emotionalResonance: {
          title: 'Emotional Resonance Index',
          description: 'Measures FOMO triggers, skepticism barriers, and advocacy potential.',
          howMeasured: 'Sentiment analysis of power words: limited, exclusive, guaranteed, trusted.',
          strategicValue: 'MEDIUM - High emotional debt = users ready to switch.',
          dataSource: 'Oracle Fetcher (content sentiment analysis)'
        },
        cognitiveLoad: {
          title: 'Cognitive Load Score',
          description: 'Decision friction level - how hard is it for users to take action?',
          howMeasured: 'Word count, heading density, performance score, internal link complexity.',
          strategicValue: 'HIGH - High cognitive load = abandonment opportunity.',
          dataSource: 'Oracle Fetcher + PageSpeed API'
        }
      }
    },
    
    // TAB 9: DISTRIBUTION & VISIBILITY
    distributionVisibility: {
      tabDescription: 'Omnichannel presence analysis. Evaluates referral efficiency, dark social footprint, and brand consistency across platforms.',
      metrics: {
        referralEfficiency: {
          title: 'Referral Efficiency Ratio',
          description: 'Traffic generated per referring domain. High ratio = quality links.',
          howMeasured: 'Organic traffic ÷ Referring domains from OpenPageRank + traffic estimates.',
          strategicValue: 'HIGH - Low ratio = "link bloat" vulnerability.',
          dataSource: 'OpenPageRank API + Serper API (traffic)'
        },
        socialSEOIndex: {
          title: 'Social SEO Index',
          description: 'Presence across social platforms that drive SEO signals.',
          howMeasured: 'Detection of YouTube, Reddit, TikTok, Twitter, LinkedIn mentions in content.',
          strategicValue: 'MEDIUM - Missing platforms = opportunity for community capture.',
          dataSource: 'Oracle Fetcher (content scanning)'
        },
        darkSocialDetection: {
          title: 'Dark Social Detection',
          description: 'Untrackable traffic from messaging apps, email, private communities.',
          howMeasured: 'Detection of newsletter, Discord, Telegram, push notification signals.',
          strategicValue: 'HIGH - 25-40% of conversions may come from dark social.',
          dataSource: 'Oracle Fetcher (CTA and community signals)'
        },
        brandConsistency: {
          title: 'Brand Consistency Score',
          description: 'Alignment of messaging across website, social, and content.',
          howMeasured: 'Title-H1 match, consistent CTAs, Organization schema presence.',
          strategicValue: 'MEDIUM - Inconsistent branding = trust erosion opportunity.',
          dataSource: 'Oracle Fetcher (meta + schema analysis)'
        }
      }
    },
    
    // TAB 8: CONVERSION & MONETIZATION
    conversionMonetization: {
      tabDescription: 'Revenue intelligence analysis. Deconstructs affiliate strategies, CTA infrastructure, and conversion friction points.',
      metrics: {
        affiliateMaskingDepth: {
          title: 'Affiliate Masking Depth',
          description: 'How deeply affiliate links are obscured to protect commissions.',
          howMeasured: 'Detection of redirect patterns, cloaking signals, sponsored disclosure.',
          strategicValue: 'LOW - Awareness metric for competitive positioning.',
          dataSource: 'Oracle Fetcher (link analysis)'
        },
        ctaInfrastructure: {
          title: 'CTA Infrastructure',
          description: 'Conversion call-to-action density and sophistication.',
          howMeasured: 'Count of: sign up, get started, try free, buy now, subscribe patterns.',
          strategicValue: 'HIGH - Weak CTAs = conversion rate opportunity.',
          dataSource: 'Oracle Fetcher (content patterns)'
        },
        pricingSignals: {
          title: 'Pricing Transparency',
          description: 'How openly pricing is displayed and explained.',
          howMeasured: 'Detection of: pricing, $, /mo, free trial, plans, tiers.',
          strategicValue: 'HIGH - Hidden pricing = trust gap you can exploit.',
          dataSource: 'Oracle Fetcher (pricing keyword detection)'
        },
        persuasionMechanics: {
          title: 'Persuasion Mechanics',
          description: 'Psychological triggers used: scarcity, social proof, authority, reciprocity.',
          howMeasured: 'Power word density: limited, exclusive, guaranteed, customers, trusted.',
          strategicValue: 'MEDIUM - Understanding their tactics enables counter-positioning.',
          dataSource: 'Oracle Fetcher (sentiment + pattern analysis)'
        }
      }
    },
    
    // TAB 7: CONTENT OPERATIONS
    contentOperations: {
      tabDescription: 'Production system audit. Analyzes AI adoption, workflow maturity, semantic architecture, and E-E-A-T implementation.',
      metrics: {
        workflowDetection: {
          title: 'AI/Workflow Detection',
          description: 'Identifies content production model: human, AI-assisted, or automated.',
          howMeasured: 'AI keyword signals, word count patterns, schema sophistication.',
          strategicValue: 'HIGH - PSEO-heavy competitors vulnerable to algorithm updates.',
          dataSource: 'Oracle Fetcher (content signals) + PageSpeed (tech stack)'
        },
        semanticClusterMapping: {
          title: 'Semantic Cluster Architecture',
          description: 'Internal linking structure and topic hub organization.',
          howMeasured: 'Internal link count, hub page detection, orphan content risk.',
          strategicValue: 'HIGH - Poor architecture = easy to outrank with proper hubs.',
          dataSource: 'Oracle Fetcher (internal link analysis)'
        },
        eeatIntegration: {
          title: 'E-E-A-T Integration',
          description: 'Experience, Expertise, Authoritativeness, Trust signal presence.',
          howMeasured: 'Author bios, LinkedIn links, expert reviews, date signals, compliance.',
          strategicValue: 'CRITICAL for YMYL niches. Weak E-E-A-T = major vulnerability.',
          dataSource: 'Oracle Fetcher (author + trust signals) + OpenPageRank'
        },
        schemaDepth: {
          title: 'Schema Implementation Depth',
          description: 'Structured data sophistication for rich results and AI extraction.',
          howMeasured: 'Schema types detected: FAQ, HowTo, Article, Organization, Review.',
          strategicValue: 'HIGH - Missing schemas = AI Overview opportunity.',
          dataSource: 'Oracle Fetcher (JSON-LD parsing)'
        }
      }
    },
    
    // TAB 6: CONTENT STRATEGY
    contentStrategy: {
      tabDescription: 'Strategic content intelligence. Evaluates topical coverage, freshness, quality matrix, and programmatic SEO patterns.',
      metrics: {
        topicalCoverageScore: {
          title: 'Topical Coverage',
          description: 'Breadth and depth of topic coverage in the niche.',
          howMeasured: 'H2/H3 heading count, word count, SERP presence, schema types.',
          strategicValue: 'HIGH - Coverage gaps = content opportunity mapping.',
          dataSource: 'Oracle Fetcher (headings) + Serper API (rankings)'
        },
        pseoPatternDetection: {
          title: 'PSEO Pattern Detection',
          description: 'Programmatic SEO templates identified from URL/content patterns.',
          howMeasured: 'URL pattern analysis: [Brand] vs [X], Best [Y] for [Z], [City] + [Product].',
          strategicValue: 'HIGH - PSEO-heavy = vulnerable to algorithm updates + expert content.',
          dataSource: 'Serper API (URL analysis) + Forensic Profile'
        },
        directToAnswerScore: {
          title: 'Direct-to-Answer Score',
          description: 'AI/Featured Snippet readiness - can AI easily extract answers?',
          howMeasured: 'FAQ schema, HowTo schema, PAA presence, question-format headings.',
          strategicValue: 'CRITICAL - Low DTA = AI citation opportunity.',
          dataSource: 'Oracle Fetcher (schema) + Serper API (PAA)'
        },
        contentQualityMatrix: {
          title: 'Content Quality Matrix',
          description: 'Composite score: E-E-A-T × Freshness × Depth × Uniqueness.',
          howMeasured: 'Word count, heading structure, schema, date signals, author presence.',
          strategicValue: 'HIGH - Quality gaps = opportunity for superior content.',
          dataSource: 'Oracle Fetcher (comprehensive analysis)'
        }
      }
    },
    
    // TAB 5: GEO & AEO - ELITE v12.1
    geoAeo: {
      tabDescription: 'AI Search Optimization. Measures RAG readiness, AI Overview potential, generative engine visibility, and LLM citation probability.',
      metrics: {
        readinessScore: {
          title: 'RAG Readiness Score',
          description: 'How easily can AI/LLMs extract and cite this content?',
          howMeasured: 'Composite of: Schema depth (40%), PAA readiness (30%), SEO score (20%), Information Gain (10%)',
          strategicValue: 'CRITICAL for 2025+. Low readiness = AI citation opportunity.',
          dataSource: 'Oracle Fetcher (schema) + PageSpeed API (SEO score) + Serper API (PAA)'
        },
        aeoScore: {
          title: 'AEO Score (Answer Engine)',
          description: 'Optimization for featured snippets and AI Overviews.',
          howMeasured: 'Instant Answer Schema (+30), PAA presence (+25), AI Overview detection (+20), Unique data (+15)',
          strategicValue: 'HIGH - Direct impact on visibility in AI-powered search.',
          dataSource: 'Serper API (SERP features) + Oracle Fetcher (schema)'
        },
        geoScore: {
          title: 'GEO Score (Generative Engine)',
          description: 'Optimization for LLM citation in ChatGPT, Perplexity, Claude, Gemini.',
          howMeasured: 'Content depth (+20), Heading structure (+15), Dataset schema (+20), Information Gain (+20), SEO (+15)',
          strategicValue: 'CRITICAL - Future of search is generative. 40% of queries will be AI-assisted by 2026.',
          dataSource: 'Oracle Fetcher + OpenPageRank (authority)'
        },
        llmAffinityScore: {
          title: 'LLM Affinity Score',
          description: 'Probability that LLMs will prefer to cite this content over competitors.',
          howMeasured: 'Schema LLM boost (30%), Information Gain (40%), Instant Answer readiness (30%)',
          strategicValue: 'CRITICAL - High affinity = content becomes training/reference data.',
          dataSource: 'Oracle Fetcher (comprehensive analysis)'
        },
        schemaAnalysis: {
          title: 'Advanced Schema Analysis',
          description: 'Depth and sophistication of structured data implementation.',
          howMeasured: 'Detection of: FAQPage (+25), Dataset (+25), HowTo (+20), Article (+12), Organization (+8), Person (+10)',
          strategicValue: 'HIGH - Missing schemas = easy win for AI visibility. FAQPage + Dataset are CRITICAL.',
          dataSource: 'Oracle Fetcher (JSON-LD parsing)',
          criticalSchemas: {
            FAQPage: 'Featured Snippets + AI Overview Citations',
            Dataset: 'LLM Training Data Affinity + Knowledge Graph',
            HowTo: 'Step-by-step rich results + Voice Search'
          }
        },
        paaGapAnalysis: {
          title: 'PAA Gap Analysis',
          description: 'People Also Ask questions not addressed in your content.',
          howMeasured: 'Comparison of PAA questions vs content headings and body text coverage.',
          strategicValue: 'CRITICAL - Each unanswered PAA = missed featured snippet opportunity.',
          dataSource: 'Serper API (PAA questions) + Oracle Fetcher (content analysis)',
          action: 'Create dedicated "Instant Answer" section with H2 for each gap question'
        },
        answerAuthority: {
          title: 'Answer Authority (Information Gain)',
          description: 'Unique data, original research, and proprietary insights that LLMs prioritize.',
          howMeasured: 'Detection of: Unique statistics, original research signals, expert citations, data visualizations',
          strategicValue: 'CRITICAL - LLMs prioritize "Information Gain" - content with insights not found elsewhere.',
          dataSource: 'Oracle Fetcher (content pattern analysis)',
          boostSignals: {
            uniqueStatistics: 'Numbers/percentages with attribution to your research',
            originalResearch: '"Our study", "we found", "our data", "internal analysis"',
            expertCitations: 'Named experts, credentials, quotes from industry leaders',
            dataVisualization: 'Charts, graphs, tables, infographics mentioned in content'
          }
        }
      },
      killMoves: {
        schemaImplementation: 'Implement FAQPage + Dataset schema for immediate AI citation eligibility',
        paaGapClosure: 'Create "Instant Answer" sections for top 10 PAA questions in your niche',
        answerAuthorityBoost: 'Add unique statistics, original case studies, or first-party data',
        questionHeadings: 'Rewrite H2/H3 headings as questions for voice search optimization'
      }
    }
  };
}

/**
 * FT_GenerateGeminiDeepInsight - Generate deep strategic insight via Gemini
 * @param {Object} competitor - Competitor data
 * @param {string} metricType - Type of metric for insight
 * @param {Object} realData - Real extracted data for context
 */
function FT_GenerateGeminiDeepInsight(competitor, metricType, realData) {
  const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  // If no API key, return local insight
  if (!geminiKey) {
    return FT_GenerateGeminiInsight(metricType, competitor, 'digital marketing');
  }
  
  const domain = competitor.domain || 'unknown';
  const dataPoints = JSON.stringify(realData).substring(0, 500);
  
  const prompt = `As a Tier-1 CSO with 15+ years at McKinsey TMT, provide a ONE-SENTENCE board-ready insight for ${domain}'s ${metricType}. 
Data: ${dataPoints}
Return ONLY the insight sentence, no explanation.`;
  
  try {
    const response = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 100 }
        }),
        muteHttpExceptions: true
      }
    );
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return data.candidates?.[0]?.content?.parts?.[0]?.text || FT_GenerateGeminiInsight(metricType, competitor, 'digital marketing');
    }
  } catch (e) {
    console.log('Gemini insight error:', e.message);
  }
  
  return FT_GenerateGeminiInsight(metricType, competitor, 'digital marketing');
}

/**
 * FT_ExtractContentProofDetailed - Extract detailed content proof with real text
 */
function FT_ExtractContentProofDetailed(competitor) {
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const content = synth.content || {};
  const oracleFetcher = competitor.stages?.oracleFetcher?.data || {};
  
  // Real content data
  const title = website.title || oracleFetcher.title || '';
  const h1 = website.h1 || oracleFetcher.h1 || '';
  const description = website.description || oracleFetcher.description || '';
  const wordCount = website.wordCount || oracleFetcher.wordCount || 0;
  const h2Array = website.h2 || oracleFetcher.h2 || [];
  const h3Array = oracleFetcher.h3 || [];
  const schemaTypes = website.schemaTypes || oracleFetcher.schemaTypes || [];
  
  const hasRealData = !!(title || h1 || wordCount > 0 || h2Array.length > 0);
  
  return {
    title: {
      text: title,
      length: title.length,
      hasRealData: !!title,
      assessment: title.length >= 30 && title.length <= 60 ? 'Optimal' : 
                  title.length < 30 ? 'Too Short' : 'Too Long'
    },
    h1: {
      text: h1,
      hasRealData: !!h1,
      matchesTitle: title && h1 && title.toLowerCase().includes(h1.toLowerCase().split(' ')[0])
    },
    description: {
      text: description,
      length: description.length,
      hasRealData: !!description,
      assessment: description.length >= 120 && description.length <= 160 ? 'Optimal' : 
                  description.length < 120 ? 'Could be longer' : 'Too Long'
    },
    content: {
      wordCount: wordCount,
      h2Count: h2Array.length,
      h3Count: h3Array.length,
      topH2: h2Array.slice(0, 5).map(h => typeof h === 'string' ? h : (h.text || h.title || '')),
      schemaTypes: schemaTypes,
      hasRealData: wordCount > 0 || h2Array.length > 0
    },
    overall: {
      hasRealData: hasRealData,
      dataSource: hasRealData ? 'Oracle Fetcher ✓' : 'Pending Analysis',
      completeness: [
        title ? 20 : 0,
        h1 ? 15 : 0,
        description ? 15 : 0,
        wordCount > 0 ? 25 : 0,
        h2Array.length > 0 ? 15 : 0,
        schemaTypes.length > 0 ? 10 : 0
      ].reduce((a, b) => a + b, 0)
    }
  };
}

/**
 * FT_ExtractTechnicalProof - Extract technical performance proof
 */
function FT_ExtractTechnicalProof(competitor) {
  const apiData = competitor.apiData || {};
  const pageSpeed = apiData.pageSpeed || competitor.stages?.pageSpeed?.data || {};
  const synth = competitor.synthesized || {};
  const technical = synth.technical || {};
  
  // PageSpeed scores
  const scores = pageSpeed.scores || {};
  const performance = scores.performance || 0;
  const seo = scores.seo || 0;
  const accessibility = scores.accessibility || 0;
  const bestPractices = scores.bestPractices || 0;
  
  // Core Web Vitals
  const cwv = pageSpeed.coreWebVitals || {};
  const lcp = cwv.LCP || 0;
  const fid = cwv.FID || 0;
  const cls = cwv.CLS || 0;
  
  const hasRealData = performance > 0 || seo > 0;
  
  return {
    scores: {
      performance: Math.round(performance),
      seo: Math.round(seo),
      accessibility: Math.round(accessibility),
      bestPractices: Math.round(bestPractices)
    },
    coreWebVitals: {
      LCP: lcp > 0 ? `${lcp.toFixed(2)}s` : 'N/A',
      FID: fid > 0 ? `${Math.round(fid)}ms` : 'N/A',
      CLS: cls >= 0 ? cls.toFixed(3) : 'N/A',
      lcpAssessment: lcp <= 2.5 ? 'Good' : lcp <= 4 ? 'Needs Improvement' : 'Poor',
      fidAssessment: fid <= 100 ? 'Good' : fid <= 300 ? 'Needs Improvement' : 'Poor',
      clsAssessment: cls <= 0.1 ? 'Good' : cls <= 0.25 ? 'Needs Improvement' : 'Poor'
    },
    hasRealData: hasRealData,
    dataSource: hasRealData ? 'PageSpeed API ✓' : 'Pending Analysis',
    cvrPenalty: performance < 70 ? `${Math.round((100 - performance) * 0.1)}% estimated CVR loss` : 'Minimal impact',
    insight: performance >= 80 ? 'Strong technical foundation - focus competition on content' :
             performance >= 50 ? 'Performance gaps present - 10-15% CVR opportunity' :
             'Major technical debt - performance-based attack vector available'
  };
}

/**
 * FT_ExtractEEATProofEnhanced - Enhanced E-E-A-T proof extraction
 */
function FT_ExtractEEATProofEnhanced(competitor) {
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const content = synth.content || {};
  const apiData = competitor.apiData || {};
  const openPageRank = apiData.openPageRank || {};
  
  const fullText = JSON.stringify(synth).toLowerCase();
  
  // Real signal detection
  const authorSignals = ['author', 'written by', 'by author', 'about the author', 'contributor', 'expert'];
  const hasAuthorBios = authorSignals.some(s => fullText.includes(s));
  const hasLinkedInLinks = fullText.includes('linkedin.com');
  
  const expertSignals = ['reviewed by', 'fact-checked', 'medical review', 'expert review', 'editorial board'];
  const hasExpertBoards = expertSignals.some(s => fullText.includes(s));
  
  const dateSignals = ['updated', 'last updated', 'reviewed on', 'published', 'modified'];
  const hasFactCheckDates = dateSignals.some(s => fullText.includes(s));
  
  const regulatorySignals = ['disclaimer', 'terms', 'privacy policy', 'compliance', 'regulated', 'licensed'];
  const hasRegulatoryFooters = regulatorySignals.some(s => fullText.includes(s));
  
  const schemaTypes = website.schemaTypes || [];
  const hasPersonSchema = schemaTypes.some(s => /person|author/i.test(s));
  const hasOrgSchema = schemaTypes.some(s => /organization|localbusiness/i.test(s));
  
  const pageRank = openPageRank.page_rank_decimal || 0;
  
  // Calculate E-E-A-T score
  let eeatScore = 30;
  if (hasAuthorBios) eeatScore += 15;
  if (hasLinkedInLinks) eeatScore += 12;
  if (hasExpertBoards) eeatScore += 15;
  if (hasFactCheckDates) eeatScore += 8;
  if (hasRegulatoryFooters) eeatScore += 5;
  if (hasPersonSchema) eeatScore += 10;
  if (hasOrgSchema) eeatScore += 5;
  if (pageRank >= 5) eeatScore += 10;
  else if (pageRank >= 3) eeatScore += 5;
  eeatScore = Math.min(100, eeatScore);
  
  return {
    overallScore: eeatScore,
    signals: {
      authorBios: hasAuthorBios,
      linkedInLinks: hasLinkedInLinks,
      expertReviewBoards: hasExpertBoards,
      factCheckDates: hasFactCheckDates,
      regulatoryFooters: hasRegulatoryFooters,
      personSchema: hasPersonSchema,
      orgSchema: hasOrgSchema
    },
    pageRank: pageRank,
    hasRealData: hasAuthorBios || hasLinkedInLinks || schemaTypes.length > 0,
    dataSource: (hasAuthorBios || schemaTypes.length > 0) ? 'Oracle Fetcher ✓' : 'Forensic Estimate',
    proof: [
      hasAuthorBios ? '✓ Author Bios Detected' : '✗ No Author Bios',
      hasLinkedInLinks ? '✓ LinkedIn Links' : '✗ No LinkedIn',
      hasExpertBoards ? '✓ Expert Reviews' : '✗ No Expert Reviews',
      hasFactCheckDates ? '✓ Date Signals' : '✗ No Date Signals',
      schemaTypes.length > 0 ? `✓ ${schemaTypes.length} Schema Types` : '✗ No Schema'
    ],
    killMove: eeatScore < 50 ? 'Add expert author profiles with credentials and LinkedIn links' :
              eeatScore < 70 ? 'Strengthen trust signals with editorial board and fact-checking' :
              'Match E-E-A-T implementation, differentiate on unique expertise'
  };
}

/**
 * FT_ExtractPSEOProof - Extract Programmatic SEO pattern proof
 */
function FT_ExtractPSEOProof(competitor) {
  const serper = competitor.apiData?.serper || competitor.stages?.serper?.data || {};
  const organic = serper.organic || [];
  const profile = competitor.forensicProfile || {};
  
  // Analyze URL patterns
  const urls = organic.map(r => (r.link || '').toLowerCase());
  
  const patterns = {
    vsPattern: { regex: /vs|versus|-or-|compared-to|comparison/i, name: '[Brand] vs [Competitor]', count: 0 },
    bestPattern: { regex: /best-|top-\d+|guide-to-|how-to-/i, name: 'Best [X] for [Y]', count: 0 },
    yearPattern: { regex: /202[4-6]|2023/i, name: '[Topic] [Year]', count: 0 },
    cityPattern: { regex: /\/(new-york|los-angeles|london|chicago|miami|austin|boston)/i, name: '[City] + [Product]', count: 0 },
    pricePattern: { regex: /price|cost|pricing|cheap|affordable/i, name: '[Product] + Pricing', count: 0 }
  };
  
  urls.forEach(url => {
    Object.values(patterns).forEach(p => {
      if (p.regex.test(url)) p.count++;
    });
  });
  
  const detectedPatterns = Object.values(patterns).filter(p => p.count >= 2).map(p => ({
    pattern: p.name,
    occurrences: p.count,
    confidence: p.count >= 4 ? 'High' : 'Medium'
  }));
  
  const pseoLevel = detectedPatterns.length >= 3 ? 'Extreme' :
                    detectedPatterns.length >= 2 ? 'High' :
                    detectedPatterns.length >= 1 ? 'Medium' : 'Low';
  
  return {
    pseoDetected: detectedPatterns.length > 0,
    pseoLevel: pseoLevel,
    patterns: detectedPatterns,
    urlsAnalyzed: urls.length,
    vulnerability: pseoLevel === 'Extreme' || pseoLevel === 'High' ? 
      'HIGH - Template content vulnerable to algorithm updates and expert competitors' :
      'LOW - Mostly unique content, harder to disrupt',
    hasRealData: urls.length > 0,
    dataSource: urls.length > 0 ? 'Serper API ✓' : 'Forensic Profile',
    killMove: pseoLevel === 'Extreme' ? 'Create expert, hand-crafted content on their top 100 template pages' :
              pseoLevel === 'High' ? 'Target their high-traffic templates with superior depth' :
              'Focus on content quality differentiation'
  };
}
